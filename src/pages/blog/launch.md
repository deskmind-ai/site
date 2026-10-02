---
layout: ../../layouts/Post.astro
title: "Small enough to run on your Mac. Smart enough to ask."
description: "Why DeskMind asks when it is unsure, how its decisions work, what it scores on a real desktop, and what went wrong on the way."
lang: en
date: October 2026
---

# Small enough to run on your Mac. Smart enough to ask.

DeskMind is open-source computer use for your Mac. You type a goal; it reads the screen, decides each step with a
small model running on your Mac, and operates your apps. When a goal could mean two things, it asks you instead of
guessing.

**TL;DR**
- **Small and local.** A 0.8B model decides each step and a 4B model checks the hard ones, both 8-bit MLX on Apple
  Silicon. No cloud round-trip, no per-step bill.
- **Choices, not guesses.** Every step is a multiple-choice question answered with a probability for every option.
  That is what lets it hand a step to the bigger model, ask you, or refuse to call a task done.
- **Measured on a real desktop.** On our 13-task macOS bench (3 runs each, through the app on one M4 Pro), the
  release passed 39 of 39 runs and never said "done" early. It is a small sample, and we say below where it is weak.
- **Open from eyes to hands.** The screen model, the decision model, the desktop harness, the Mac app and the bench
  are all on GitHub. Code is Apache-2.0.

[Watch the 56-second demo](https://deskmind.dev/?ref=blog) · [Download for Mac](https://github.com/deskmind-ai/app/releases/latest) ·
[GitHub](https://github.com/deskmind-ai)

## Why ask?

Most computer-use agents fail quietly. They pick something plausible, keep going, and report success. On a desktop,
a plausible guess is often the wrong file, the wrong row or the wrong recipient, and you find out later.

Our demo task: "Find Lisa Wong's order in records.txt and add it to ledger.csv." The file has two Lisa Wong orders.
A model that guesses writes one of them and says it is done. DeskMind stops and asks which one, then writes the row
you pick, saves, and finishes. Asking costs one sentence; guessing costs a wrong ledger.

To ask at the right moments, the model has to know when it is unsure. That is the core of the design.

## System One: every step is a choice

A desktop step is turned into a few typed questions: which operation, which element, which value. Each question
comes with its options, listed as letters. Brain (our decision model) reads the logits of those letters at the
answer position, in one prefill, and returns a probability for every option. It never writes free text, so there
is nothing to parse and no action outside the list.

The probabilities do three jobs:
- **Routing.** The 0.8B answers first. If it is below the release threshold (0.96), or the step is costly to get
  wrong (declaring the task done, undoing, an unusual shortcut), the 4B answers instead.
- **Asking.** When the harness finds two records that both match, ASK is one of the options, and the model picks it.
- **Not stopping early.** Before a run can end, the harness checks the final state; the model's own "done" has to
  survive that check.

A probability is the model's confidence, not a guarantee. Multiple choice removes format errors, not judgement
errors: if the right option is not in the list, or the model is confidently wrong, the step is still wrong.

Brain speaks the `/v1/systemone` request format, so any agent can call it over HTTP on `127.0.0.1`.

## How fast is it?

Honestly: fast when the 0.8B is sure, a few seconds when it is not.
- Steps the 0.8B answers itself: about 0.5 s (p50).
- Steps the 4B checks: about 3.6 s (p50), and about 70% of steps go to the 4B in this release.
- All steps together: 2.85 s median, 9.8 s for the slowest 5% (208 decisions on the real desktop).

The reason is a training mistake we made, described below: the 0.8B's confidences sit in a narrow band, so a
threshold that keeps it correct sends most steps up. Widening the fast path is the main goal of the next round.

## Results, with the sample size

| What | Result | Scope |
|---|---|---|
| Real desktop, bench v25 | **39/39 runs passed, 0 false "done"** | 13 tasks × 3 runs, Chinese UI, one M4 Pro, through the app, router at threshold 0.96 |
| Visual grounding, ScreenSpot-Pro (1,581 items) | **50.9%** as the app runs it (4-bit MLX, ≤ 2 MP); 67.7% on a GPU at full resolution | Most of the gap is resolution; 4 MP gives 59.0% on a 300-item subset but is 2.5× slower |
| JevBench v1.4.2, public items | **0.835** (193/231) for the 4B | Public items only; sealed run requested. Public scores across the field run well above sealed ones, so we don't compare ours with others' |

Caveats we want you to read:
- In all 3 runs of one task (exact Chinese text into a file), the file was right but the model never said "done"
  and used its whole step budget. The grader checks the final state, so these count as passes.
- The bench tasks are ours. The suite, graders and per-task results are public so you can run them yourself.
- Still hard: copying long tables (more than about four rows) or filtered rows, and filling a form from a
  photographed receipt.

## What went wrong along the way

About twenty training rounds taught us more about evaluation than about models. The lessons that cost us a round
each:

1. **The prompt's shape leaked the label.** Our "done" training rows had only the operation question, while other
   rows also had target questions. The model learned that a short prompt means "done". Every training prompt now
   has exactly the shape of a real request.
2. **The oracle can only label what the harness shows.** After a successful fill, one field still looked empty in
   the recorded state, so the oracle taught every model to type it again.
3. **Shortcuts from the goal text.** Goals often contain a format example. The model learned that the answer is
   never the example, which was wrong exactly when it was. Counterexamples fixed it.
4. **Offline holdouts don't catch shortcuts.** A holdout drawn from the same trajectories shares their shortcuts.
   Each round fixed the last failure and introduced a new one: one round fixed an ordering bug and said "done" on a
   wrong order; the next fixed that and replaced a header. Our offline gate now replays every probe and real failure
   we have ever collected, against the previous release, before any desktop run.
5. **Look-alike states need twins.** The model confused a studio track with the live version it was asked to play.
   Training on matched pairs (same screen, only the decisive detail differs) fixed it in one round.
6. **A fixed soft target flattens confidence.** We trained the 0.8B against rule labels smoothed to 0.95. Its
   confidences collapsed to about 0.94–0.97, so routing could not tell easy steps from hard ones. That is why 70% of
   steps go to the 4B today, and why the next round distills the 4B's real distributions instead.
7. **"Ask first" has to be trained, and kept.** A round that never learned to ask confidently wrote the wrong row and
   declared success. And a later round lost some of it until we re-tuned the routing threshold (0.94 → 0.96). Asking
   is now a gate check of its own.

## What's next

- **Faster:** a calibrated 0.8B that keeps more steps on the fast path.
- **More tasks:** long and filtered table copies, receipts, more apps and English UIs in the bench.
- **Sharper eyes on the Mac:** a two-pass grounding (coarse, then zoom) to close the resolution gap.

## Try it

**The Mac app** (macOS 15+, Apple Silicon, about 7 GB of memory while running): download the DMG from
[the latest release](https://github.com/deskmind-ai/app/releases/latest). On first run it downloads about 5.3 GB of
models, from Hugging Face or, if that is slow, from ModelScope. Then try the built-in examples or your own goal.
⌘. stops a run; touching the mouse or keyboard pauses it.

**Brain as a decision API:**

```bash
git clone https://github.com/deskmind-ai/brain && cd brain
uv sync --extra mlx
uv run hf download deskmind/brain-4b --revision g18b-q8 --local-dir models/brain-4b
uv run deskmind-brain-serve --predictor mlx:models/brain-4b --port 8793 --two-stage
curl -s localhost:8793/v1/systemone -H 'Content-Type: application/json' -d @examples/request.json
```

Docs: [deskmind.dev/docs](https://deskmind.dev/docs/?ref=blog).

**The family:**
- [eyes](https://github.com/deskmind-ai/eyes): finds things on screen when an app has no accessibility tree
- [brain](https://github.com/deskmind-ai/brain): decides the next step
- [hands](https://github.com/deskmind-ai/hands): acts on the desktop and checks the result
- [app](https://github.com/deskmind-ai/app): all of it in one Mac app
- [bench](https://github.com/deskmind-ai/bench): real-desktop tasks with graders that check the final state

We'd love help with new apps, new bench tasks and faster serving on the Mac. Issues marked "good first issue" are a
good place to start, and questions go to [Discussions](https://github.com/deskmind-ai/deskmind/discussions).

*DeskMind is an independent open-source project.*
