---
title: POST /v1/systemone
description: Request and response format of Brain's decision API, how probabilities and multiple questions work, routing, errors and server options.
sidebar:
  order: 1
---

Brain serves one decision endpoint. You send a state and a set of typed questions; you get back one answer per
question, each with a probability for every option. Nothing is generated.

This page describes the server in [deskmind-ai/brain](https://github.com/deskmind-ai/brain)
(`deskmind-brain-serve`). The request and response shape is fixed, so any client written for it only needs the base
URL.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/systemone` | answer a set of questions about one state |
| `GET` | `/v1/models` | the served model's name, and routing counts when two tiers are served |

The server listens on `127.0.0.1:8787` unless you pass `--host` and `--port`. If the environment variable
`DESKMIND_BRAIN_TOKEN` is set, every request must send `Authorization: Bearer <token>` (otherwise `401`); the Mac app
sets one per install. Without it, the `Authorization` header is ignored.
Requests are answered one at a time.

## Request

```jsonc
{
  "state": { "page": { "title": "ws", "text": "…" }, "elements": [ … ] },
  "model": "deskmind-brain",
  "questions": {
    "operation": {
      "type": "choice",
      "criteria": { "CLICK": "Click one element…", "DONE": "The goal is complete, and the screen shows it." },
      "instructions": { "goal": "…", "rules": ["…"] }
    }
  }
}
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `state` | any JSON value | yes | What the model should look at. An object is rendered as JSON; a string is used as is. |
| `questions` | object | yes | Question id → question. Ids are yours to choose, but see [agent requests](#agent-requests). |
| `model` | string | no | Accepted for compatibility. The server does not use it to pick a model. |

### Questions

Every question has a `type`, `instructions` and, depending on the type, `criteria`.

| `type` | `criteria` | Options the model chooses from |
|---|---|---|
| `choice` | an object of 1 to 255 entries: option key → description | the option keys |
| `score` | a list of 2 to 10 level descriptions | the level indices `"0"` … `"K-1"` |
| `noul` | optional; an object with `"true"` and `"false"` descriptions, or any value | yes or no |

`instructions` is any JSON value: a string, or an object such as `{ "goal": "…", "rules": [ … ] }`. It is shown to the
model with the question.

## Response

```jsonc
{
  "id": "05f621607d574a47a075e85ee4b8f67b",
  "model": "deskmind-brain-local",
  "answers": { "operation": { "type": "choice", "choice": "CLICK", "probabilities": { … }, "confidence": 0.956 } },
  "usage": { "input_tokens": 11730, "output_tokens": 0 },
  "latency_ms": 4431.4,
  "routing": { "by": "strong", "reason": "low_conf", "fast_conf": 0.9561 }
}
```

| Field | Meaning |
|---|---|
| `id` | a new id for every reply |
| `model` | the server's `--model-name` (default `deskmind-brain-local`) |
| `answers` | question id → answer, one per question in the request |
| `usage.input_tokens` | tokens in the state and questions as sent (their JSON text), not the prompt the model actually reads, which is rendered more compactly; `null` if the backend has no tokenizer |
| `usage.output_tokens` | always 0: nothing is generated |
| `latency_ms` | time the server spent on the request |
| `routing` | only when two tiers are served; see [Routing](#routing) |
| `cached` | `true` when the reply came from the repeat-request cache; see [Caching](#caching) |

### Answers by type

#### choice

```jsonc
{ "type": "choice", "choice": "CLICK", "probabilities": { "CLICK": 0.96, "OPEN": 0.0047, … }, "confidence": 0.9555 }
```

- `choice`: the option with the highest probability.
- `probabilities`: one entry per option key; they sum to 1.
- `confidence`: `(K × p_max − 1) / (K − 1)` for `K` options. It is 0 when all options are equally likely and 1 when
  one option has all the probability.

#### score

```json
{ "type": "score", "score": 1.8, "legend": { "0": "…", "1": "…", "2": "…" }, "probabilities": { "0": 0.05, "1": 0.1, "2": 0.85 }, "confidence": 0.66 }
```

- `score`: the expected level, `Σ level × p(level)`, so it can fall between levels.
- `legend`: level index → your level description.
- `confidence`: `1 − 2 × E|level − score| / (K − 1)`, floored at 0.

#### noul

```json
{ "type": "noul", "noul": 0.93 }
```

- `noul`: the probability of yes (`true`). There is no `probabilities` field.

## How probabilities are made

- **Read, not generated.** Each question becomes a prompt: the state, the question and its options with short labels
  (letters for `choice`, digits for `score`, Yes/No for `noul`). The model's scores for those label tokens at the
  answer position are turned into probabilities with a softmax. No text is decoded or parsed.
- **Every option gets some probability.** A `choice` question with more options than one round holds (26, or the
  model's `round_size` in `deskmind.json`) runs as a tournament: options are scored in chunks, the best of each chunk
  go to a final round, and eliminated options are priced relative to their chunk's finalists, so none gets exactly 0.
- **One option, no scoring.** A question with a single option is not sent to the model; that option gets probability 1.

:::caution
A probability is the model's own weighting of the options. It is not a guarantee that the chosen option is right.
See [System One](/docs/explanation/system-one/#what-a-probability-means).
:::

## Multiple questions

- All questions in a request are answered about the same state. The state and the instructions shared by every
  question form a common prompt prefix that is computed once; each question is a short branch off it.
- Answers are independent per question. The server does not make one answer depend on another, except as described
  for agent requests below.

### Agent requests

A request that contains a question with the id `operation` is treated as an agent step, as Hands sends it:

- `operation` is a `choice` over operations (`CLICK`, `TYPE_TEXT`, `KEY`, `DONE`, `BLOCKED`, …).
- Each operation's arguments are separate questions named `<operation>_target` (lowercase): `click_target`,
  `select_target`, `key_target`, … Text operations (`TYPE_TEXT`, `REPLACE_TEXT`, `APPEND_TEXT`, `RENAME`) also use
  `type_text_value`, and `REPLACE_TEXT` uses `replace_from`.

With `--two-stage`, the server scores `operation` first, then only the questions that operation needs. Questions it
skips come back with every option equally likely (confidence 0); do not read them as answers. When the operation is
`DONE`, `BLOCKED` or `ASK`, every question is scored, because a client may want to weigh the alternatives. (In a
two-tier server, the strong tier then scores only that operation's own questions; the rest come from the fast tier,
which already scored them all.)

## Routing

When the server runs two tiers (`--escalate-to`), the fast model answers every request, and some steps are answered
again by the strong model. The reply then has a `routing` record:

| Field | Meaning |
|---|---|
| `by` | `"fast"` or `"strong"`: whose answers you got |
| `reason` | why (below) |
| `fast_conf` | the fast tier's weakest top probability over `operation` and the questions it needs |
| `confirmed` | present and `true` when both tiers chose the same `DONE`, `BLOCKED` or `ASK` |

| `reason` | Meaning |
|---|---|
| `fast_ok` | the fast tier was sure enough and the step was not risky |
| `low_conf` | `fast_conf` was below the threshold |
| `risky_DONE`, `risky_BLOCKED` | finishing and giving up always go to the strong tier |
| `risky_KEY` | a keyboard chord other than `cmd+s`, `cmd+f`, `cmd+c`, `tab` or `escape` |
| `risky_undo` | a click on an undo button |
| `unverified_last` | `DONE` right after an action whose effect could not be confirmed |
| `done_kept_over_undo` | the fast tier said `DONE` and the strong tier wanted to click undo; `DONE` was kept |
| `judge_ok`, `judge_low_conf` | requests without `operation`: escalated when any question's top probability is below 0.8 |

When `confirmed` is `true`, the questions other than `operation` (and that operation's own questions) are the fast
tier's. Treat a confirmed `DONE` as final rather than replacing it with the next-best operation.

Why the router works this way is explained in [System One](/docs/explanation/system-one/#two-tiers-08b-then-4b).

## Caching

The server keeps the last 64 replies, keyed by `state` and `questions`. An identical request gets the stored answers
with a new `id` and `"cached": true`. `--cache-size 0` turns this off.

## Errors

Errors are JSON: `{ "error": { "message": "…" } }`, with the message cut to 500 characters.

| Status | When |
|---|---|
| `400` | the body is not valid JSON, or the request does not validate (for example a `choice` question with no options, or a `score` question with one level) |
| `404` | any other path |
| `500` | the model failed while answering; the message names the error |

## Server options

`deskmind-brain-serve` accepts:

| Option | Default | Meaning |
|---|---|---|
| `--predictor` | required | the model, e.g. `mlx:models/brain-4b` |
| `--model-name` | `deskmind-brain-local` | the name returned in `model` and by `/v1/models` |
| `--host` | `127.0.0.1` | address to listen on |
| `--port` | `8787` | port to listen on |
| `--cache-size` | `64` | repeat-request cache entries; 0 disables it |
| `--two-stage` | off | agent requests: score the operation first, then only the questions it needs |
| `--escalate-to` | none | the strong tier, served in the same process; `--predictor` is then the fast tier |
| `--threshold` | from the fast model's `deskmind.json` (`router_threshold`), else 0.94 | with `--escalate-to`: escalate below this |
| `--no-keep-done-over-undo` | off | with `--escalate-to`: let the strong tier replace a fast `DONE` with an undo click |
| `--routing-log` | none | with `--escalate-to`: append one line per request (who answered, why); no state or question text |

For the commands used in practice, see the [Quickstart](/docs/start/quickstart/).
