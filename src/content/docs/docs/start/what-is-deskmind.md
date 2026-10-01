---
title: What is DeskMind
description: Small open models that see your screen, decide the next step and act on your Mac, with a probability for every decision.
sidebar:
  order: 1
---

DeskMind 得心 lets an agent operate the real macOS desktop with small open models. You give it a goal, such as
"make a folder called docs and move the .txt files into it". It works out the steps, carries them out in the apps you
allow, and stops when the goal is met, when it needs you, or when it cannot go on.

The name comes from the idiom 得心应手: what the mind decides, the hand carries out.

## One loop, three roles

Every step of a task goes around the same loop:

1. **Hands observes.** It reads the focused window: the accessibility tree, and on-device text recognition where the
   tree is missing.
2. **Brain decides.** Hands turns the screen into a set of typed questions: *which operation?*, *which element?*,
   *which value?* Brain answers each one with a probability for every option.
3. **Hands acts.** It carries out the chosen action in the target window, records what happened, and starts the next
   step.

**Eyes** joins the loop only when an app has no usable accessibility tree. Given a screenshot and a short description
("the send button"), it returns the point to click.

**Bench** sits beside the loop, not inside it. It holds sandbox desktop tasks and graders that check the final state of
a run, independently of what the agent said it did.

| Component | Role | Repository |
|---|---|---|
| Eyes | finds the target on a screenshot | [deskmind-ai/eyes](https://github.com/deskmind-ai/eyes) |
| Brain | decides the next step, with a probability for every option | [deskmind-ai/brain](https://github.com/deskmind-ai/brain) |
| Hands | observes and acts on the macOS desktop | [deskmind-ai/hands](https://github.com/deskmind-ai/hands) |
| Bench | sandbox tasks and strict final-state graders | [deskmind-ai/bench](https://github.com/deskmind-ai/bench) |
| App | brings the loop to your Mac as a native app | [deskmind-ai/app](https://github.com/deskmind-ai/app) |

Each component can be used on its own. For how they connect, see [Architecture](/docs/explanation/architecture/).

## What makes it different

- **Choices, not free text.** Brain never writes an action. It picks from the options Hands offers, so there is
  nothing to parse and no action outside the list. See [System One](/docs/explanation/system-one/).
- **Two model sizes.** A 0.8B model answers each step. When it is unsure, or the step is costly to get wrong
  (finishing, giving up, undoing), the step goes to a 4B model.
- **It asks.** When a goal could mean more than one thing, it asks you before it writes. In the app it also asks
  before anything that sends, deletes or cannot be taken back.
- **Local inference by default.** The models run on your Mac with MLX. Model downloads use the network, and so do any
  networked apps you let it operate. If you point the router's escalation tier at a remote server, that server sees
  the requests sent to it.

## Who it is for

- **Developers and researchers** building computer-use agents who want typed, local step decisions behind one HTTP
  API: start with the [Quickstart](/docs/start/quickstart/).
- **People who want to try a local agent on their own Mac:** see [Install the app](/docs/start/install-the-app/).
- **Anyone who wants to measure an agent honestly:** Bench scores runs from disk with strict graders.

## What it can and cannot do yet

What works today, measured on our real-desktop bench (13 tasks × 3 runs, all 39 passed, no false "done"):

- Finder: make folders, move and rename files, navigate, sort files into folders.
- TextEdit: change fields exactly, type Chinese text with full-width punctuation, save. (On the Chinese-text task the
  file comes out right, but the model does not yet say "done" by itself.)
- Crossing apps: read a short (four-row) table in Safari and append it, sorted, to a CSV; copy values between documents.
- Behaving well: ask when the goal is ambiguous, edit only the document the goal names, stop when cancelled.

What it cannot do yet, or does poorly:

- **macOS on Apple Silicon only.** No Windows, Linux or Intel Macs.
- **Small test coverage.** 13 tasks, one Mac, one system language (Chinese). Results elsewhere may differ.
- **Few apps get special help.** Finder and TextEdit have a projection layer that makes them easier to operate.
  Elsewhere, Safari included, the model sees the raw accessibility tree.
- **Speed.** About 70% of steps currently go to the 4B, so a typical decision takes about 3 seconds.
- **Some apps need the foreground.** Where an app ignores background input, a step needs a short foreground switch,
  which Hands only does if you allow it.
- **A probability is not a guarantee.** The model can be confident and wrong.

The full numbers and the known failures are in [Results and limits](/docs/explanation/results-and-limits/).

## Licences

Code is Apache-2.0; see each component's LICENSE and NOTICE. Model weights, base models and datasets follow their own
terms. This documentation is CC BY 4.0. The DeskMind and 得心 names, the logo and Xiaofang (小方) are not covered by
these licences; see the [brand guide](https://github.com/deskmind-ai/deskmind/blob/main/BRAND.md).
