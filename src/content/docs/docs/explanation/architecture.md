---
title: Architecture
description: The Eyes → Brain → Hands loop, what each component does, how they talk over local HTTP, where the app fits and what runs on your Mac.
sidebar:
  order: 1
---

DeskMind is four components and an app. Hands runs the loop; Brain and Eyes are local HTTP servers that Hands asks
for decisions and locations; Bench grades runs afterwards. The app packages the loop for people who do not want to
use a terminal.

## The loop

```text
            goal
             │
             ▼
 ┌──────────────────────┐   POST /v1/systemone    ┌───────────────────────┐
 │        Hands         │ ──────────────────────▶ │         Brain         │
 │  observe the window  │   state + questions     │  0.8B, 4B if needed   │
 │  ask typed questions │ ◀────────────────────── │  probability per      │
 │  act, record, repeat │   answers               │  option               │
 └──────────────────────┘                         └───────────────────────┘
             │  POST /ground (only for apps without an accessibility tree)
             ▼
 ┌──────────────────────┐
 │         Eyes         │   screenshot + description → point to click
 └──────────────────────┘

 Bench: reads finished runs from disk and grades the final state. Not part of the loop.
```

One step:

1. **Observe.** Hands reads the focused window through the macOS accessibility API. For Finder and TextEdit a
   projection layer turns multi-step gestures into single controls (for example, one "move this file to ▾" dropdown
   per file). Where an app has no usable tree, Hands reads text with on-device OCR and can ask Eyes where a described
   control is.
2. **Ask.** Hands builds a state (window text, the list of elements, recent actions) and a set of typed questions:
   the operation, and one target question per operation, each with enumerated options.
3. **Decide.** Brain answers every question with a probability per option.
4. **Act.** Hands carries out the chosen action in the target window, in the background where the app allows it,
   records it in the run's trace, and goes back to step 1.

The loop ends when Brain chooses `DONE` or `BLOCKED`, when a budget runs out, or when you cancel. If Brain chooses
`ASK`, Hands puts a question to you and waits.

## The components

### Brain

[deskmind-ai/brain](https://github.com/deskmind-ai/brain). Two models, `deskmind/brain-0.8b` and `deskmind/brain-4b`
(Qwen3.5 base models with merged LoRA), served with MLX by `deskmind-brain-serve`. It exposes
[`POST /v1/systemone`](/docs/reference/systemone-api/). In the released setup the 0.8B answers every step and the
router sends unsure or risky steps to the 4B, in one process. Why it answers with choices is in
[System One](/docs/explanation/system-one/).

### Hands

[deskmind-ai/hands](https://github.com/deskmind-ai/hands). The harness that turns a decision into an action on macOS
and records what happened. Actions go to the target window through the accessibility API and
[Peekaboo](https://github.com/steipete/Peekaboo)'s window-targeted input, not through the global mouse and keyboard,
so you can keep working while it runs. Steps that only work in the foreground are refused unless you allow them.
Hands also has a mock desktop (a real file system behind a simulated Finder and editor) that runs without any
permissions, and much of Brain's desktop training data comes from it.

### Eyes

[deskmind-ai/eyes](https://github.com/deskmind-ai/eyes). A 4B visual grounding model. Given a screenshot path and a
short description, `deskmind_eyes.ground_server` returns a point relative to the image. A request names a PNG on local
disk, so the screenshot is not sent over the network. Eyes is optional: Hands uses it only for apps without a usable
accessibility tree.

### Bench

[deskmind-ai/bench](https://github.com/deskmind-ai/bench). Thirteen sandbox tasks on the real Finder, TextEdit and
Safari, with graders that check the final state. `deskmind-bench score` regrades finished runs from disk and needs
only Python: no Mac, no driver, no model. `deskmind-bench run` executes runs through Hands against a decision server URL; it
refuses a non-local URL unless you pass `--allow-remote`.

## How they talk

Everything is HTTP on the loopback interface, or a local socket.

| From → to | How | Address |
|---|---|---|
| Hands → Brain | `POST /v1/systemone` | standalone: any port you choose (default `127.0.0.1:8787`; the examples use 8793 for the 4B and 8796 for the router) |
| Hands → Eyes | `POST /ground` | standalone: `127.0.0.1:8010` by default |
| Router → tiers (two-server setup) | `POST /v1/systemone` | 0.8B on 8794, 4B on 8793, router on 8796 in the examples |
| App → helper | JSON lines over a Unix socket | `~/Library/Application Support/DeskMind/hands.sock` |
| Inside the app: helper → Brain | `POST /v1/systemone` | `127.0.0.1:18850` |
| Inside the app: helper → Eyes | `POST /ground` | `127.0.0.1:18851`, started on demand |

Brain and Eyes bind to `127.0.0.1` in these setups. Because the API is plain HTTP with a fixed shape, any client that
speaks it can use Brain, and Hands can use any server that answers it.

## Where the app fits

The Mac app is two bundles:

- **DeskMind** (the window you see): goal entry, the confirmation sheet, progress, questions and approvals, history,
  model download. It needs no privacy permissions.
- **DeskMind Hands** (a background helper): holds the Accessibility, Screen Recording and Automation permissions and
  runs everything else. It bundles its own Python 3.12 runtime with Hands, the Peekaboo CLI and an on-device OCR helper.

For each goal, the helper starts one Hands run, which talks to the Brain server the helper keeps on port 18850 (0.8B
with the 4B behind `--escalate-to`). The Eyes server starts before a run that may need it and stops after thirty minutes
without a run, since it holds about 4 GB.

When Hands needs you, it prints a question or an approval request; the helper forwards it to the app, which shows a
card, and your reply goes back to the run.

## What runs locally

- **Inference.** Brain and Eyes run on your Mac with MLX. In the app, both servers run offline.
- **Your data.** Screens, screenshots, run traces and recordings stay on your Mac.
- **What uses the network:**
  - model downloads, from Hugging Face (and ModelScope as a fallback in the app);
  - the apps DeskMind operates, which use the network as they normally would;
  - an optional remote escalation tier: `scripts/router_serve.py --strong` accepts any server with the same API,
    including a remote one. If you use that, the remote server receives every request sent to it, state included.
    The app does not do this.
