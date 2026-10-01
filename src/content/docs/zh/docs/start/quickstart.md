---
title: 快速上手
description: 五分钟在 Mac 上跑起 Brain，让它给出一个真实桌面任务的下一步，并读懂返回结果。
sidebar:
  order: 3
---

本页在你的 Mac 上运行决策模型 **Brain**，让它回答一个真实桌面任务中的一步。Brain 只负责回答问题，本身不会去操作桌面；要让它真正动手，需要加上 [Hands](https://github.com/deskmind-ai/hands)。

用时：五分钟左右，另加下载时间（4B 模型约 4.2 GB）。

## 准备

你需要：

- 一台 Apple 芯片的 Mac；
- Python 3.12；
- [uv](https://docs.astral.sh/uv/) 和 git。

## 1. 获取 Brain

```bash
git clone https://github.com/deskmind-ai/brain && cd brain
uv sync --extra mlx
```

`mlx` 这个 extra 会安装 MLX 推理环境，版本固定为发布模型测试时用的版本。

## 2. 下载 4B 模型

```bash
uv run hf download deskmind/brain-4b --revision g18b-q8 --local-dir models/brain-4b
```

`g18b-q8` 是当前发布版（G18b，8 位）。下载约 4.2 GB。

:::tip[下载报 `CAS Client Error`]
这个错误来自 Xet 传输通道。在命令前加 `HF_HUB_DISABLE_XET=1` 重试：

```bash
HF_HUB_DISABLE_XET=1 uv run hf download deskmind/brain-4b --revision g18b-q8 --local-dir models/brain-4b
```
:::

:::note[在中国大陆]
ModelScope 上有同样的文件：

```bash
uvx modelscope download --model gxcsoccer/brain-4b --local-dir models/brain-4b
```
:::

## 3. 启动服务

```bash
uv run deskmind-brain-serve --predictor mlx:models/brain-4b --port 8793 --two-stage
```

准备好后会打印：

```text
serving mlx:models/brain-4b on http://127.0.0.1:8793/v1/systemone
```

`--two-stage` 表示先给操作打分，再只给这个操作需要的问题打分。让这个终端保持运行。

## 4. 问它下一步

在同一个 `brain` 目录下打开第二个终端：

```bash
curl -s localhost:8793/v1/systemone -H 'Content-Type: application/json' -d @examples/request.json
```

`examples/request.json` 是一个沙箱访达任务里的真实一步。目标是：新建一个名为 `docs` 的文件夹，把 `.txt` 文件都移进去，其他文件和 `keep` 目录不要动。请求里有：

- `state`：Hands 看到的窗口（页面文字、元素列表、最近的操作）；
- `questions`：一个 `operation` 问题（CLICK、OPEN、RENAME、TYPE_TEXT、……、DONE、BLOCKED），以及每种操作各一个目标问题（`click_target`、`select_target` 等）。

## 5. 读懂返回结果

每个问题都有一个回答。删减并取整后大致如下，你得到的数字可能略有不同：

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
    // … 请求里的每个问题各有一项
  },
  "usage": { "input_tokens": 11730, "output_tokens": 0 },
  "latency_ms": 4431.4
}
```

怎么读：

- `operation.choice` 是下一步的操作：这里是 CLICK，概率 0.96。
- `click_target.choice` 是要点的元素，用它在 `state.elements` 里的编号表示。元素 `1` 是「新建文件夹」按钮：模型先建文件夹。
- 用了 `--two-stage` 时，只有所选操作需要的问题才会打分。其他目标问题（比如上面的 `rename_target`）返回的是各选项均等的概率，把握为 0，忽略即可。
- 只有一个选项的问题不会送进模型，这个选项的概率直接为 1。
- `output_tokens` 始终为 0：模型不生成任何文本，每个概率都读自模型对答案标签的打分。

:::caution
概率是模型对各选项的权衡，不保证这一步一定正确。见 [System One](/zh/docs/explanation/system-one/)。
:::

完整格式见 [API 参考](/zh/docs/reference/systemone-api/)。

## 可选：两级路由，0.8B → 4B

发布形态是路由：每一步先由 0.8B 回答，没把握或有风险的步骤交给 4B。再下载 0.8B（约 0.8 GB）：

```bash
uv run hf download deskmind/brain-0.8b --revision g18b-q8 --local-dir models/brain-0.8b
```

（ModelScope 上是 `gxcsoccer/brain-0.8b`。）然后在一个进程里同时运行两级：

```bash
uv run deskmind-brain-serve --predictor mlx:models/brain-0.8b --escalate-to mlx:models/brain-4b \
  --two-stage --port 8796
```

把同样的请求发到 8796 端口。这次的返回会多一条 `routing` 记录，说明是谁答的、为什么，例如：

```json
{ "by": "strong", "reason": "low_conf", "fast_conf": 0.956 }
```

这里 0.8B 的最高概率是 0.956，低于门槛，所以由 4B 作答。

门槛随权重一起发布：0.8B 的 `deskmind.json` 里的 `router_threshold`，G18b 为 0.96。`--threshold` 可以覆盖它。路由怎么做判断，见 [System One](/zh/docs/explanation/system-one/#两级08b-再到-4b)。

:::note[拆成两个服务]
两级也可以拆成两个服务分开跑，0.8B 在 8794 端口，4B 在 8793 端口，前面再加一个路由：

```bash
uv run python scripts/router_serve.py --fast http://127.0.0.1:8794 --strong http://127.0.0.1:8793 \
  --keep-done-over-undo --port 8796
```
:::

## 接下来

- 用 [Hands](https://github.com/deskmind-ai/hands) 驱动模拟桌面或真实桌面。
- 用 [Bench](https://github.com/deskmind-ai/bench) 给运行结果打分。
- 遇到问题？见[常见问题排查](/zh/docs/how-to/troubleshooting/)。
