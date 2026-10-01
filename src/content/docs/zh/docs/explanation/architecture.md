---
title: 架构
description: Eyes → Brain → Hands 循环，各组件做什么，它们怎样通过本机 HTTP 通信，应用处在哪个位置，哪些部分在本机运行。
sidebar:
  order: 1
---

DeskMind 由四个组件和一个 Mac App 组成。Hands 负责跑循环；Brain 和 Eyes 是本机的 HTTP 服务，Hands 向它们要决策和位置；Bench 在运行结束后打分。Mac App 把这个循环打包起来，供不想用终端的人使用。

## 循环

```text
目标 ──▶ Hands：观察窗口，提出带类型的问题

         Hands ──▶ Brain    POST /v1/systemone    状态 + 问题
         Brain ──▶ Hands    回答                  每个选项一个概率（0.8B，必要时 4B）
         Hands ──▶ Eyes     POST /ground          截图 + 描述（只用于没有辅助功能树的应用）
         Eyes  ──▶ Hands    坐标点                要点的位置

         Hands：执行、记录，进入下一步

Bench：从磁盘读取结束的运行，检查最终状态。不在循环里。
```

一步的过程：

1. **观察。** Hands 通过 macOS 辅助功能接口读取当前窗口。访达和文本编辑有一层「投影」，把多步手势变成单个控件（比如每个文件一个「移动到 ▾」下拉框）。应用没有可用的辅助功能树时，Hands 用本机 OCR 读文字，也可以让 Eyes 找出某个描述对应的控件在哪。
2. **提问。** Hands 整理出状态（窗口文字、元素列表、最近的操作）和一组带类型的问题：做什么操作，以及每种操作各一个目标问题，每个问题都列出选项。
3. **决定。** Brain 为每个问题的每个选项给出概率。
4. **执行。** Hands 在目标窗口里执行选定的操作（应用允许时在后台进行），写进这次运行的记录，然后回到第 1 步。

Brain 选了 `DONE` 或 `BLOCKED`、预算用完或你取消时，循环结束。Brain 选了 `ASK` 时，Hands 会向你提问并等待。

## 各组件

### Brain

[deskmind-ai/brain](https://github.com/deskmind-ai/brain)。两个模型 `deskmind/brain-0.8b` 和 `deskmind/brain-4b`（Qwen3.5 基座加已合并的 LoRA），由 `deskmind-brain-serve` 用 MLX 提供服务，对外是 [`POST /v1/systemone`](/zh/docs/reference/systemone-api/) 接口。发布版的默认配置下，在同一个进程里，0.8B 回答每一步，路由把没把握或有风险的步骤交给 4B。为什么用选择题来回答，见 [System One](/zh/docs/explanation/system-one/)。

### Hands

[deskmind-ai/hands](https://github.com/deskmind-ai/hands)。把决策变成 macOS 上的动作，并记录发生了什么。动作通过辅助功能接口和 [Peekaboo](https://github.com/steipete/Peekaboo) 的窗口定向输入送到目标窗口，不走全局鼠标键盘，所以运行时你可以继续干自己的事。只能在前台完成的步骤，除非你允许，否则会被拒绝。Hands 还带一个模拟桌面（真实文件系统，加上模拟的访达和编辑器），不需要任何权限就能运行；Brain 的桌面训练数据大多也来自这里。

### Eyes

[deskmind-ai/eyes](https://github.com/deskmind-ai/eyes)。一个 4B 视觉定位模型。给 `deskmind_eyes.ground_server` 一张截图的路径和一句简短描述，它返回相对于图片的坐标点。请求里写的是本机磁盘上 PNG 的路径，截图不经过网络。Eyes 是可选的：Hands 只在应用没有可用的辅助功能树时才用它。

### Bench

[deskmind-ai/bench](https://github.com/deskmind-ai/bench)。13 个在真实访达、文本编辑和 Safari 上运行的沙箱任务，评分程序检查最终状态。`deskmind-bench score` 从磁盘重新给结束的运行打分，只需要 Python，不需要 Mac、驱动或模型。`deskmind-bench run` 通过 Hands 针对一个决策服务地址执行任务；地址不在本机时，除非加 `--allow-remote`，否则拒绝运行。

## 它们怎么通信

全部走本机回环地址上的 HTTP，或本地 socket。

| 从 → 到 | 方式 | 地址 |
|---|---|---|
| Hands → Brain | `POST /v1/systemone` | 单独运行：端口自选（默认 `127.0.0.1:8787`；示例里 4B 用 8793，路由用 8796） |
| Hands → Eyes | `POST /ground` | 单独运行：默认 `127.0.0.1:8010` |
| 路由 → 两级（拆成两个服务时） | `POST /v1/systemone` | 示例里 0.8B 在 8794，4B 在 8793，路由在 8796 |
| App → 助手 | Unix socket 上逐行传 JSON | `~/Library/Application Support/DeskMind/hands.sock` |
| App 内部：助手 → Brain | `POST /v1/systemone` | `127.0.0.1:18850` |
| App 内部：助手 → Eyes | `POST /ground` | `127.0.0.1:18851`，按需启动 |

在这些配置下，Brain 和 Eyes 都只绑定 `127.0.0.1`。接口是格式固定的普通 HTTP，所以任何遵循这个接口的客户端都能用 Brain，Hands 也能接任何实现了这个接口的服务。

## Mac App 处在哪里

Mac App 由两个 bundle 组成：

- **DeskMind**（你看到的窗口）：输入目标、确认表单、进度、提问和审批、历史记录、模型下载。它不需要任何隐私权限。
- **DeskMind Hands**（后台助手）：持有辅助功能、屏幕录制和自动化权限，其余工作都由它来做。它自带 Python 3.12 运行时、Hands、Peekaboo 命令行工具和一个本机 OCR 助手。

每输入一个目标，助手就启动一次 Hands 运行，它连到助手常驻在 18850 端口的 Brain 服务（0.8B，`--escalate-to` 后面是 4B）。Eyes 服务在可能用到它的运行开始前启动，三十分钟没有运行就停掉，因为它要占约 4 GB 内存。

Hands 需要你时，会输出一个提问或审批请求；助手把它转给 App，App 显示一张卡片，你的回复再送回这次运行。

## 哪些在本机运行

- **推理。** Brain 和 Eyes 用 MLX 在你的 Mac 上运行。App 里的两个服务都离线运行。
- **你的数据。** 屏幕、截图、运行记录和录屏都留在你的 Mac 上。
- **会联网的部分：**
  - 下载模型，从 Hugging Face（App 里以 ModelScope 作为备用）；
  - DeskMind 替你操作的应用，它们会照常联网；
  - 可选的远程升级层：`scripts/router_serve.py --strong` 可以接任何实现了同样接口的服务，包括远程服务。这样做的话，远程服务会收到发给它的每个请求，包括状态。App 不会这样做。
