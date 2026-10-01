---
title: Quickstart
description: Run Brain on your Mac in five minutes, ask it for the next step of a real desktop task, and read the reply.
sidebar:
  order: 3
---

This page runs **Brain**, the decision model, on your Mac and asks it for one step of a real desktop task. Brain
answers the question; it does not drive the desktop by itself. To act on the desktop, add
[Hands](https://github.com/deskmind-ai/hands).

Time: about five minutes plus the download (4.2 GB for the 4B model).

## Before you start

You need:

- a Mac with Apple Silicon;
- Python 3.12;
- [uv](https://docs.astral.sh/uv/) and git.

## 1. Get Brain

```bash
git clone https://github.com/deskmind-ai/brain && cd brain
uv sync --extra mlx
```

The `mlx` extra installs the MLX serving stack, pinned to the versions the release models were tested with.

## 2. Download the 4B model

```bash
uv run hf download deskmind/brain-4b --revision g18b-q8 --local-dir models/brain-4b
```

`g18b-q8` is the current release (G18b, 8-bit). The download is 4.2 GB.

:::tip[If the download fails with `CAS Client Error`]
That error comes from the Xet transfer path. Retry with `HF_HUB_DISABLE_XET=1` in front of the command:

```bash
HF_HUB_DISABLE_XET=1 uv run hf download deskmind/brain-4b --revision g18b-q8 --local-dir models/brain-4b
```
:::

:::note[In mainland China]
ModelScope carries the same files:

```bash
uvx modelscope download --model gxcsoccer/brain-4b --local-dir models/brain-4b
```
:::

## 3. Start the server

```bash
uv run deskmind-brain-serve --predictor mlx:models/brain-4b --port 8793 --two-stage
```

When it is ready it prints:

```text
serving mlx:models/brain-4b on http://127.0.0.1:8793/v1/systemone
```

`--two-stage` scores the operation first, then only the questions that operation needs. Leave this terminal running.

## 4. Ask for the next step

Open a second terminal in the same `brain` folder:

```bash
curl -s localhost:8793/v1/systemone -H 'Content-Type: application/json' -d @examples/request.json
```

`examples/request.json` is a real step from a sandbox Finder task. Its goal (in Chinese) is: create a folder named
`docs` and move the `.txt` files into it, leaving the other files and the `keep` folder alone. The request holds:

- `state`: the window as Hands saw it (page text, the list of elements, recent actions);
- `questions`: an `operation` question (CLICK, OPEN, RENAME, TYPE_TEXT, …, DONE, BLOCKED) and one target question per
  operation (`click_target`, `select_target`, …).

## 5. Read the reply

The reply has one answer per question. Shortened and rounded, it looks like this; your numbers may differ slightly:

```jsonc
{
  "id": "05f62160…",
  "model": "deskmind-brain-local",
  "answers": {
    "operation": {
      "type": "choice",
      "choice": "CLICK",
      "probabilities": { "CLICK": 0.960, "OPEN": 0.005, "RENAME": 0.005, "DONE": 0.005, "SCROLL": 0.004 /* … */ },
      "confidence": 0.956
    },
    "click_target": {
      "type": "choice",
      "choice": "1",
      "probabilities": { "1": 0.965, "29": 0.002 /* … */ },
      "confidence": 0.964
    },
    "rename_target": {
      "type": "choice",
      "choice": "6",
      "probabilities": { "6": 0.5, "8": 0.5 },
      "confidence": 0.0
    }
    // … one entry per question in the request
  },
  "usage": { "input_tokens": 11730, "output_tokens": 0 },
  "latency_ms": 4431.4
}
```

How to read it:

- `operation.choice` is the next operation: here CLICK, with probability 0.96.
- `click_target.choice` is the element to click, by its index in `state.elements`. Element `1` is the
  新建文件夹 (New Folder) button: the model makes the folder first.
- With `--two-stage`, only the questions the chosen operation needs are scored. The other target questions, like
  `rename_target` above, come back with every option equally likely and a confidence of 0. Ignore them.
- A question with a single option is not scored at all: its one option gets probability 1.
- `output_tokens` is always 0: nothing is generated. Every probability is read from the model's scores for the answer
  labels.

:::caution
A probability is the model's own weighting of the options, not a guarantee that the step is right. See
[System One](/docs/explanation/system-one/).
:::

The full format is in the [API reference](/docs/reference/systemone-api/).

## Optional: two tiers, 0.8B → 4B

The released setup is a router: the 0.8B model answers each step, and unsure or risky steps go to the 4B. Download the
0.8B as well (0.8 GB):

```bash
uv run hf download deskmind/brain-0.8b --revision g18b-q8 --local-dir models/brain-0.8b
```

(On ModelScope: `gxcsoccer/brain-0.8b`.) Then serve both tiers in one process:

```bash
uv run deskmind-brain-serve --predictor mlx:models/brain-0.8b --escalate-to mlx:models/brain-4b \
  --two-stage --port 8796
```

Send the same request to port 8796. The reply now also carries a `routing` record that says who answered and why, for
example:

```json
{ "by": "strong", "reason": "low_conf", "fast_conf": 0.956 }
```

Here the 0.8B's top probability, 0.956, was below the threshold, so the 4B answered.

The threshold ships with the weights: `router_threshold` in the 0.8B's `deskmind.json`, 0.96 for G18b. `--threshold`
overrides it. How the router decides is explained in [System One](/docs/explanation/system-one/#two-tiers-08b-then-4b).

:::note[Two separate servers]
The tiers can also run as separate servers, the 0.8B on port 8794 and the 4B on port 8793, with a router in front:

```bash
uv run python scripts/router_serve.py --fast http://127.0.0.1:8794 --strong http://127.0.0.1:8793 \
  --keep-done-over-undo --port 8796
```
:::

## Next steps

- Drive a mock or real desktop with [Hands](https://github.com/deskmind-ai/hands).
- Score runs with [Bench](https://github.com/deskmind-ai/bench).
- Something went wrong? See [Troubleshooting](/docs/how-to/troubleshooting/).
