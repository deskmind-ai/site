---
layout: ../../layouts/Post.astro
title: "Small enough to run on your Mac. Smart enough to ask."
description: "What I learned training a small local model and its harness together: why local, how decisions work, results with sample sizes, and what went wrong."
lang: en
date: October 2026
---

# Small enough to run on your Mac. Smart enough to ask.

*What I learned training a small local model and its harness together*

I wanted a computer-use agent I would actually let loose on my own Mac. The ones I tried worked, sometimes
impressively, but three things kept bothering me:

- **Privacy.** Every step sends a screenshot of my screen to someone else's server: my mail, my files, whatever
  happens to be open.
- **Cost.** A task is dozens of steps, and every step re-sends the screen and the history. The token bill adds up
  quickly for something that clicks a button.
- **Waiting.** The best models are often busy. Each step is a round trip to a cloud API, sometimes behind a queue, and
  a task that should take a minute takes many.

So I asked a simple question: how much of this can a small model do locally, if the code around it (the harness) is
designed for it? Not everything, probably. But if the local part handles most steps and hands the rest to something
bigger, a hybrid could keep the screen private, cost almost nothing per step, and stay fast.

DeskMind is where that question has got to after about three weeks. It is open-source computer use for macOS: a small
model on your Mac reads the screen, decides each step and operates your apps. When a goal could mean two things, it
asks you instead of guessing.

[Watch the 56-second demo](https://deskmind.dev/?ref=blog) · [Download for Mac](https://github.com/deskmind-ai/app/releases/latest) ·
[GitHub](https://github.com/deskmind-ai)

## First the eyes, then the brain

I started with seeing. Many apps expose no accessibility tree, so an agent has to find "the Submit button" in pixels.
That became **Eyes**, a 4B grounding model. It was my first time post-training a model: SFT, then RL, first on
Tinker, then on Aliyun PAI, then on GPUs rented by the hour.

Then Jev came out, and decision models were suddenly everywhere. The idea is lovely: instead of asking a chat model to
write out its next action, you ask it a typed multiple-choice question and read a probability for every option. Fast,
parseable, and it knows when it is unsure. But it was a cloud API, and I could not put a cloud dependency at the centre
of a local agent. So I tried to train a local one. That became **Brain**: Qwen3.5 0.8B and 4B with LoRA, 8-bit MLX on
Apple Silicon, speaking the same `/v1/systemone` request format.

**Hands** is the macOS harness that ties them together, the **Mac app** packages all of it, and **Bench** is the set of
real-desktop tasks we measure it with. All five are open.

## What changed for me: the model is not a black box any more

Most agent work I had done before was writing a harness around a model I could not change. When the model was wrong
in some systematic way, the only tools were prompts and retries.

Owning both sides changed that. The model can be trained for exactly what the harness asks of it, and the harness can
cover what the model is bad at. A few examples from the last weeks:

- **Asking instead of guessing.** When a goal names a record that matches two rows ("add Lisa Wong's order" and there
  are two), the harness adds ASK to the options, and the model is trained to pick it. Neither side could do this
  alone.
- **Not calling it done too early.** The model says DONE; the harness checks the final state of the file or app
  before accepting it. The model is trained on near-identical pairs (saved vs unsaved, last line missing) so its DONE
  is rarely wrong in the first place.
- **Guardrails where the model is weak.** When a goal only asks to add a line and the model tries to replace the whole
  document, the harness refuses and tells it why. That refusal then becomes training data for the next round.
- **Telling look-alikes apart.** Asked to play the live version of a song, the model kept picking the studio track. We
  trained it on matched pairs (the same screen, only the decisive detail differs) and it was fixed in one round.

That co-design is, for me, the real result of this project, more than any single number.

## Built with Claude Code

I should be honest about how this got built. Without Claude Code I could not have finished a project this complete and
this exploratory on my own: five repositories, a Mac app, a benchmark, and about twenty training rounds in three weeks.
Several Claude Code sessions worked in parallel: one on the models and training, one on the harness, the app and the
evaluations, coordinating through issues in a private repository. They wrote most of the code, ran the training and
the desktop tests, and kept the gate honest. My part was deciding what to build, what to measure, and what was good
enough to ship.

## How a step is decided

A step becomes a few typed questions: which operation, which element, which value. Brain reads the logits of the
option letters in one prefill and returns a probability for every option. It never writes free text, so there is
nothing to parse and no action outside the list.

The probabilities do three jobs:
- **Routing:** the 0.8B answers first; if it is below the release threshold (0.96), or the step is costly to get
  wrong, the 4B answers instead.
- **Asking:** when two options are both plausible, ASK is one of them.
- **Not stopping early:** the model's DONE has to survive the harness's final-state check.

A probability is the model's confidence, not a guarantee, and multiple choice removes format errors, not judgement
errors. If the right option is not in the list, the step is still wrong.

## Where it stands against what I wanted

- **Privacy: mostly there.** Deciding a step runs on your Mac; the model servers listen on `127.0.0.1`. The only
  network calls the app makes itself are the one-time model downloads. Apps it operates still talk to their own
  servers, of course.
- **Cost: there.** No tokens are billed per step. The cost moved to training instead: about $600 over three weeks
  for rented GPUs, training APIs and labelling, which I find a fair price for what I learned.
- **Waiting: not yet.** When the 0.8B is sure, a decision takes about 0.5 s. But in this release about 70% of steps go
  to the 4B, which takes about 3.6 s, so the median decision is 2.85 s and the slowest 5% take 9.8 s. The cause is a
  training mistake I describe below, and fixing it is the next round's main goal.
- **Hybrid: halfway.** The 0.8B → 4B router is the local half. Sending the hardest steps to a cloud model is designed
  in (an optional escalation tier you turn on yourself) but the app does not do it yet.

## Results, with the sample size

| What | Result | Scope |
|---|---|---|
| Real desktop, bench v25 | **39/39 runs passed, 0 false "done"** | 13 tasks × 3 runs, Chinese UI, one M4 Pro, through the app |
| Visual grounding, ScreenSpot-Pro (1,581 items) | **50.9%** as the app runs it (4-bit MLX, ≤ 2 MP); 67.7% on a GPU at full resolution | Most of the gap is resolution; 4 MP gives 59.0% but is 2.5× slower |
| JevBench v1.4.2, public items | **0.835** (193/231) for the 4B | Public items only; sealed run requested |

In all 3 runs of one task the file was right but the model never said "done" and used its whole step budget; the
grader checks the final state, so they count as passes. The tasks are mine; the bench, graders and per-task results
are public so you can run them yourself. Still hard: copying tables longer than about four rows, and filling a form
from a photographed receipt.

## What about twenty training rounds taught me

1. **Evaluation is the hard part.** Each round fixed the last failure and quietly introduced a new shortcut: one round
   fixed an ordering bug and then said "done" on a wrong order; the next fixed that and replaced a header. An offline
   holdout drawn from the same trajectories shares their shortcuts. What finally worked was a gate that replays every
   probe and real failure we have ever collected against the previous release, before any desktop run.
2. **The prompt's shape can leak the label.** Our "done" examples had fewer questions than the others, so the model
   learned that a short prompt means "done". Every training prompt now has exactly the shape of a real request.
3. **A labeller can only label what it sees.** After a successful fill, one field still looked empty in the recorded
   state, so the oracle taught every model to type it again.
4. **A fixed soft target flattens confidence.** I trained the 0.8B against labels smoothed to 0.95. Its confidences
   collapsed to 0.94–0.97, so the router could not tell easy steps from hard ones. That is why 70% of steps escalate
   today; the next round distills the 4B's real distributions instead.
5. **Asking has to be trained, and then protected.** One round never learned to ask and confidently wrote the wrong
   row. A later one lost part of it until the routing threshold was re-tuned. Asking is now its own gate check.

## What's next

- **Faster:** a calibrated 0.8B that keeps more steps on the fast path.
- **More tasks:** long and filtered table copies, receipts, English UIs and more apps in the bench.
- **Sharper eyes on the Mac:** two-pass grounding (coarse, then zoom) to close the resolution gap.
- **The other half of hybrid:** an opt-in cloud tier for the steps the local models should not decide.

## Try it

**The Mac app** (macOS 15+, Apple Silicon, about 7 GB of memory while running): download the DMG from
[the latest release](https://github.com/deskmind-ai/app/releases/latest). On first run it downloads about 5.3 GB of
models, from Hugging Face or, if that is slow, from ModelScope. ⌘. stops a run; touching the mouse or keyboard pauses
it.

**Brain in your own agent:**

```bash
git clone https://github.com/deskmind-ai/brain && cd brain
uv sync --extra mlx
uv run hf download deskmind/brain-4b --revision g18b-q8 --local-dir models/brain-4b
uv run deskmind-brain-serve --predictor mlx:models/brain-4b --port 8793 --two-stage
curl -s localhost:8793/v1/systemone -H 'Content-Type: application/json' -d @examples/request.json
```

Docs, including a 30-line client: [deskmind.dev/docs](https://deskmind.dev/docs/?ref=blog).

I would love help with new apps, new bench tasks and faster serving on the Mac. Issues marked "good first issue" are
a good place to start; questions go to [Discussions](https://github.com/deskmind-ai/deskmind/discussions). And if you
have built agents on top of a model you could not change, I would like to hear whether owning both sides would change
how you work.

*DeskMind is an independent open-source project.*
