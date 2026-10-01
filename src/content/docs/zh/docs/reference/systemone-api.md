---
title: POST /v1/systemone
description: Brain 决策接口的请求和返回格式，概率和多个问题是怎么处理的，以及路由、错误和服务参数。
sidebar:
  order: 1
---

Brain 只提供一个决策接口：你发来一个状态和一组带类型的问题，它为每个问题返回一个回答，每个选项都附带概率。整个过程不生成文本。

本页描述的是 [deskmind-ai/brain](https://github.com/deskmind-ai/brain) 里的服务（`deskmind-brain-serve`）。请求和返回格式固定，按这个格式写的客户端只需改 base URL。

## 接口

| 方法 | 路径 | 用途 |
|---|---|---|
| `POST` | `/v1/systemone` | 针对一个状态回答一组问题 |
| `GET` | `/v1/models` | 当前服务的模型名；两级服务时还有路由计数 |

不加 `--host` 和 `--port` 时，服务监听 `127.0.0.1:8787`。`Authorization` 请求头会被忽略。请求逐个处理，不并发。

## 请求

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

| 字段 | 类型 | 必填 | 含义 |
|---|---|---|---|
| `state` | 任意 JSON 值 | 是 | 要模型看的内容。对象会渲染成 JSON；字符串原样使用。 |
| `questions` | 对象 | 是 | 问题 id → 问题。id 由你定，但请看[agent 请求](#agent-请求)。 |
| `model` | 字符串 | 否 | 为兼容而接受，服务不会用它来选模型。 |

### 问题

每个问题都有 `type`、`instructions`，并按类型带上 `criteria`。

| `type` | `criteria` | 模型从中选择的选项 |
|---|---|---|
| `choice` | 1 到 255 项的对象：选项键 → 说明 | 各个选项键 |
| `score` | 2 到 10 个等级说明组成的列表 | 等级编号 `"0"` … `"K-1"` |
| `noul` | 可选；带 `"true"` 和 `"false"` 说明的对象，或任意值 | 是或否 |

`instructions` 可以是任意 JSON 值：一段字符串，或 `{ "goal": "…", "rules": [ … ] }` 这样的对象。它会和问题一起给模型看。

## 返回

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

| 字段 | 含义 |
|---|---|
| `id` | 每次返回都是新的 id |
| `model` | 服务的 `--model-name`（默认 `deskmind-brain-local`） |
| `answers` | 问题 id → 回答，请求里每个问题各一项 |
| `usage.input_tokens` | 所发状态和问题（JSON 文本）的 token 数，不是模型实际读到的提示长度，提示会渲染得更紧凑；后端没有分词器时为 `null` |
| `usage.output_tokens` | 始终为 0：不生成文本 |
| `latency_ms` | 服务处理这个请求用的时间 |
| `routing` | 只在两级服务时出现，见[路由](#路由) |
| `cached` | 回答来自重复请求缓存时为 `true`，见[缓存](#缓存) |

### 各类型的回答

#### choice

```jsonc
{ "type": "choice", "choice": "CLICK", "probabilities": { "CLICK": 0.96, "OPEN": 0.0047, … }, "confidence": 0.9555 }
```

- `choice`：概率最高的选项。
- `probabilities`：每个选项键一项，总和为 1。
- `confidence`：`K` 个选项时为 `(K × p_max − 1) / (K − 1)`。各选项概率相等时为 0，全部概率集中在一个选项上时为 1。

#### score

```json
{ "type": "score", "score": 1.8, "legend": { "0": "…", "1": "…", "2": "…" }, "probabilities": { "0": 0.05, "1": 0.1, "2": 0.85 }, "confidence": 0.66 }
```

- `score`：等级的期望值 `Σ 等级 × p(等级)`，所以可能落在两个等级之间。
- `legend`：等级编号 → 你给的等级说明。
- `confidence`：`1 − 2 × E|等级 − score| / (K − 1)`，最低为 0。

#### noul

```json
{ "type": "noul", "noul": 0.93 }
```

- `noul`：回答「是」（`true`）的概率。没有 `probabilities` 字段。

## 概率是怎么来的

- **读出来，不是生成出来。** 每个问题变成一段提示：状态、问题，以及带简短标签的选项（`choice` 用字母，`score` 用数字，`noul` 用 Yes/No）。模型在答案位置对这些标签 token 的打分经过 softmax 变成概率。不解码，也不解析任何文本。
- **每个选项都有概率。** `choice` 问题的选项多于一轮能容纳的数量（26 个，或模型 `deskmind.json` 里的 `round_size`）时，按淘汰赛进行：选项分组打分，每组的前几名进入决赛，被淘汰的选项按它所在组的决赛选手折算概率，所以不会有选项恰好为 0。
- **只有一个选项，就不打分。** 只有一个选项的问题不会送进模型，这个选项的概率直接为 1。

:::caution
概率是模型对各选项的权衡，不保证选中的选项一定正确。见 [System One](/zh/docs/explanation/system-one/#概率意味着什么)。
:::

## 多个问题

- 一个请求里的所有问题都针对同一个状态。状态和所有问题共用的说明组成一段公共的提示前缀，只计算一次；每个问题是从它分出去的一小段。
- 各问题的回答彼此独立。除了下面 agent 请求里说的情况，服务不会让一个回答依赖另一个。

### agent 请求

请求里如果有 id 为 `operation` 的问题，就按 agent 的一步来处理，也就是 Hands 发送的格式：

- `operation` 是在各种操作（`CLICK`、`TYPE_TEXT`、`KEY`、`DONE`、`BLOCKED` 等）之间的 `choice`。
- 每种操作的参数是单独的问题，命名为 `<操作>_target`（小写）：`click_target`、`select_target`、`key_target` 等。文本类操作（`TYPE_TEXT`、`REPLACE_TEXT`、`APPEND_TEXT`、`RENAME`）还会用到 `type_text_value`，`REPLACE_TEXT` 还会用到 `replace_from`。

加了 `--two-stage` 时，服务先给 `operation` 打分，再只给这个操作需要的问题打分。被跳过的问题返回各选项均等的概率（把握为 0），不要把它们当成回答。操作是 `DONE`、`BLOCKED` 或 `ASK` 时，所有问题都会打分，因为客户端可能要比较其他选择。（两级服务时，强模型这时只给这个操作自己的问题打分，其余的沿用快模型的结果，快模型已经全部打过分。）

## 路由

服务运行两级时（`--escalate-to`），快模型回答每个请求，其中一部分步骤再交给强模型回答。返回里会多一条 `routing` 记录：

| 字段 | 含义 |
|---|---|
| `by` | `"fast"` 或 `"strong"`：拿到的是哪一级的回答 |
| `reason` | 原因（见下表） |
| `fast_conf` | 快模型在 `operation` 及其所需问题上的最高概率中，最弱的那个 |
| `confirmed` | 两级都选了同一个 `DONE`、`BLOCKED` 或 `ASK` 时出现，值为 `true` |

| `reason` | 含义 |
|---|---|
| `fast_ok` | 快模型足够有把握，这一步也没有风险 |
| `low_conf` | `fast_conf` 低于门槛 |
| `risky_DONE`、`risky_BLOCKED` | 宣布完成和放弃，一律交给强模型 |
| `risky_KEY` | 除 `cmd+s`、`cmd+f`、`cmd+c`、`tab`、`escape` 之外的快捷键 |
| `risky_undo` | 点击撤销按钮 |
| `unverified_last` | 上一个操作的效果无法确认，紧接着就要宣布完成 |
| `done_kept_over_undo` | 快模型说 `DONE`，强模型想点撤销；保留 `DONE` |
| `judge_ok`、`judge_low_conf` | 不含 `operation` 的请求：任一问题的最高概率低于 0.8 时升级 |

`confirmed` 为 `true` 时，除 `operation`（及该操作自己的问题）以外的回答来自快模型。请把确认过的 `DONE` 当作最终结果，不要再换成次优的操作。

路由为什么这样设计，见 [System One](/zh/docs/explanation/system-one/#两级08b-再到-4b)。

## 缓存

服务按 `state` 和 `questions` 缓存最近 64 个回答。完全相同的请求会直接拿到缓存的回答，带新的 `id` 和 `"cached": true`。`--cache-size 0` 可以关闭缓存。

## 错误

错误以 JSON 返回：`{ "error": { "message": "…" } }`，消息最长 500 个字符。

| 状态码 | 什么时候 |
|---|---|
| `400` | 请求体不是合法 JSON，或请求校验不通过（比如 `choice` 问题没有选项，`score` 问题只有一个等级） |
| `404` | 其他路径 |
| `500` | 模型回答时出错；消息里会写明错误 |

## 服务参数

`deskmind-brain-serve` 接受以下参数：

| 参数 | 默认值 | 含义 |
|---|---|---|
| `--predictor` | 必填 | 模型，例如 `mlx:models/brain-4b` |
| `--model-name` | `deskmind-brain-local` | `model` 字段和 `/v1/models` 返回的名字 |
| `--host` | `127.0.0.1` | 监听地址 |
| `--port` | `8787` | 监听端口 |
| `--cache-size` | `64` | 重复请求缓存的条数；0 表示关闭 |
| `--two-stage` | 关 | agent 请求：先给操作打分，再只给它需要的问题打分 |
| `--escalate-to` | 无 | 在同一进程里运行的强模型；此时 `--predictor` 是快模型 |
| `--threshold` | 快模型 `deskmind.json` 里的 `router_threshold`，没有则为 0.94 | 配合 `--escalate-to`：低于这个值就升级 |
| `--no-keep-done-over-undo` | 关 | 配合 `--escalate-to`：允许强模型用撤销点击替换快模型的 `DONE` |
| `--routing-log` | 无 | 配合 `--escalate-to`：每个请求追加一行记录（谁答的、为什么），不含状态和问题文本 |

实际使用的命令见[快速上手](/zh/docs/start/quickstart/)。
