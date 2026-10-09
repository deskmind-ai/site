---
title: Results and limits
description: What release G18b scored on the real desktop and on public benchmark items, how long a decision takes, and what is still hard.
sidebar:
  order: 4
---

All numbers on this page are our own runs, from release **G18b** (October 2026). The source of record is
[brain/docs/results.md](https://github.com/deskmind-ai/brain/blob/main/docs/results.md); per-task tables are in
[bench/results/reference.md](https://github.com/deskmind-ai/bench/blob/main/results/reference.md).

## Real desktop

Setup: [Bench](https://github.com/deskmind-ai/bench) suite v25, 13 sandbox tasks on the real Finder, TextEdit and
Safari, 3 runs each, strict pass. Run through the DeskMind app on one M4 Pro with 48 GB of memory.

| Config | Strict pass | False "done" | Decision time (median / slowest 5%) |
|---|---|---|---|
| **Router G18b** (0.8B → 4B, 8-bit, threshold 0.96), current | **39/39** | **0** | 2.85 / 9.82 s |
| Router G14 (0.8B → 4B, 8-bit, threshold 0.94), earlier release | 36/39 | 0 | 0.57 / 5.25 s |

- **Strict pass** means every checkpoint passed, no guard was broken, no forbidden side effect happened, and the
  sentinel files were untouched. The grader checks the final state, not what the agent said.
- **False "done"** counts runs where the agent declared the task finished and the grader disagreed.
- **Conditions of the G18b run:** no environment errors, and no run got stuck repeating itself. The app's optional checks
  were off, including the [done-check](/docs/explanation/system-one/#checking-before-saying-done), and so were the
  extra notes on each action's effect that newer models are shown. Decision times are over
  208 decisions.
- **One task was not clean.** In all 3 runs of the Chinese exact-text task, the file was right but the model never
  said "done"; each run used its full 20-step budget. The grader checks the final state, so these count as passes.

:::caution[Read the numbers with care]
Thirteen tasks × three runs is a small sample. Runs cluster by task (almost every task passes 3/3 or 0/3), so the
effective sample is closer to 13 tasks than to 39 runs. A difference of one or two runs between configs is noise. All
of it was measured on one Mac, with a Chinese system language.
:::

## Decision time

Decision time is the decision model's time per step, not the time a whole task takes.

| Steps | Share | Median | Slowest 5% |
|---|---|---|---|
| answered by the 0.8B | about 30% | 0.48 s | 0.66 s |
| escalated to the 4B | about 70% | 3.6 s | 9.8 s |
| all steps | | 2.85 s | 9.82 s |

Why most steps escalate: the G18b 0.8B's confidences sit in a narrow band (about 0.94 to 0.97), so a threshold that
keeps it correct sends most steps to the 4B. Widening the fast path is work for the next round.

Where the time goes on an M4 Pro:

- Reading the prompt (prefill) is compute-bound, at about 850 tokens per second for the 4B. A desktop step is about
  1,900 prompt tokens, so time scales with prompt length, not with the size of the weights.
- Quantization does not help speed: 8-bit runs at the same speed with 119 of 120 answers identical; 4-bit is not
  faster and changes 30% of answers.
- Recording a run in the app makes each decision about 3% slower (median over 40 real requests, two rounds). Since 0.5
  it takes one-shot screenshots, ten a second; the capture stream it used before cost about 10%, with stretches far
  slower than that. The bench numbers above were measured without recording.

## Public benchmark items

JevBench v1.4.2, the 231 items in its public repository (the board's `public_accuracy` column), run locally with the
official CLI against a local server. JevBench is a third-party benchmark; DeskMind is not affiliated with its
maintainers.

| | easy (48) | original (72) | hard (111) | public (231) |
|---|---|---|---|---|
| **Brain 4B, G18b** (current) | 48 | 69 | 76 | **0.835** |
| Brain 0.8B, G18b | 48 | 56 | 63 | 0.723 |
| Router G18b (0.8B → 4B, threshold 0.96) | 48 | 65 | 71 | 0.797 |
| Brain 4B, G14 (earlier) | 48 | 67 | 85 | 0.866 |

- **These are public items only.** The board's headline score also weighs sealed items, calibration, speed and cost.
  We have not been scored on the sealed set yet.
- **G18b is weaker than G14 on general judgement.** On the hard tier the 4B dropped from 85 to 76, mostly temporal and
  numeric, hard-judgement and multi-hop items. G18b's training leans further toward desktop states. The release keeps
  G18b for its real-desktop reliability.
- **Calibration (G18b 4B):** Brier 0.269, ECE 0.089 (G14: 0.230, 0.079); lower is better for both. See
  [what a probability means](/docs/explanation/system-one/#what-a-probability-means).
- **No overlap:** the G18b training mix (100,703 items) shares no 13-word sequence and no option set with the 231 public
  items.

## Visual grounding (Eyes)

ScreenSpot-Pro, full set (1,581 items), one pass. Two settings, measured separately:

| Setting | Overall | Text targets | Icon targets |
|---|---|---|---|
| GPU, bf16, native resolution | **67.7%** (base model 64.8%) | — | — |
| As the Mac app runs it: 4-bit MLX, images scaled to at most 2 megapixels, M4 Pro | **50.9%** | 64.8% | 28.3% |

The app setting loses most on small icons: ScreenSpot-Pro screenshots are mostly 4K-class, and scaling them to
2 megapixels shrinks small icons about fourfold. On the Mac a grounding query takes about 4.7 s (median) and 7.8 s
(slowest 5%), measured while other jobs shared the machine, so treat these as upper bounds; peak memory is about 4.5 GB.
Details: [eyes/README](https://github.com/deskmind-ai/eyes#results-september-2026).

## What is still hard

From the measurements above:

- **Speed.** About 70% of steps go to the 4B, so a typical decision takes about 3 seconds, and the slowest 5% take
  close to 10 seconds.
- **Saying "done" at the right time.** One bench task was finished but never declared finished.
- **General judgement.** G18b gave up ground on the public hard tier while it gained on the desktop.
- **Coverage.** 13 tasks, one Mac, one system language. Only Finder and TextEdit have a projection layer; in other
  apps, Safari included, the model sees the raw accessibility tree.

From our own trials outside the bench suite (not yet measured on a published task set):

- **Long or filtered table copies.** Copying a table of more than about four rows, or only the rows that match a
  condition, is not reliable yet. In one trial the model declared the task done after three of six rows.
- **Forms filled from a photographed receipt.** Values read from a receipt photo by text recognition can contain
  errors, and filling a form from them is not reliable yet.

## How to reproduce

The suite, graders and harness version for each number are in
[deskmind-ai/bench](https://github.com/deskmind-ai/bench): `deskmind-bench score` regrades finished runs from disk,
and `deskmind-bench run` executes the suite against any decision server behind `/v1/systemone`. A reproduction that disagrees
with ours is welcome; see [Contributing](/docs/project/contributing/).
