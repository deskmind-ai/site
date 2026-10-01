---
title: 常见问题排查
description: 解决模型下载失败、MLX 版本报错、macOS 权限缺失和内存不足等问题。
sidebar:
  order: 1
---

这里列的是我们遇到过并记录下来的问题，以及每个问题的处理办法。没找到你的问题？见[在哪里报告](/zh/docs/project/contributing/#在哪里报告)。

## 模型下载

### `hf download` 报 `CAS Client Error`

这个错误来自 Hugging Face 的 Xet 传输通道。关掉 Xet 重试：

```bash
HF_HUB_DISABLE_XET=1 uv run hf download deskmind/brain-4b --revision g18b-q8 --local-dir models/brain-4b
```

### Hugging Face 很慢或连不上（比如在中国大陆）

从 ModelScope 下载同样的文件：

```bash
uvx modelscope download --model gxcsoccer/brain-4b --revision g18b-q8 --local-dir models/brain-4b
uvx modelscope download --model gxcsoccer/brain-0.8b --revision g18b-q8 --local-dir models/brain-0.8b
```

Mac App 会自动这样做：Hugging Face 下载失败，或者某个文件开始后 30 秒内平均不到约 200 KB/s，就改从 ModelScope 下载，并用同一组 SHA-256 校验。

### App 提示模型文件不完整或已损坏

点「重新下载」。App 会重新校验每个文件，只补齐缺失或有问题的部分。下载中断后再点一次，也会从断点接着下载。

## 每个请求都报 `Initialization encountered non-uniform length`

MLX 相关依赖比发布模型测试时用的版本新，就会出现这个错误：mlx 0.32.3、mlx-lm 0.32 和 transformers 5.18 会让每个请求都失败（HTTP 400）。所以 Brain 的 `pyproject.toml` 给这些包加了版本上限：

| 包 | 版本范围 | 所在 extra |
|---|---|---|
| `mlx` | `>=0.32,<0.32.3` | `mlx` |
| `mlx-lm` | `>=0.31,<0.32` | `mlx` |
| `transformers` | `>=5.17.0,<5.18` | `local` |

解决办法：不要手动升级这些包，按 Brain 的锁文件安装：

```bash
uv sync --extra mlx
```

锁文件固定的是 mlx 0.32.2、mlx-lm 0.31.3 和 transformers 5.17.0，也就是发布模型测试时用的版本。

## macOS 权限

在真实桌面上运行，需要「辅助功能」和「屏幕录制」权限。

- **使用 Mac App 时**，权限属于后台助手 **DeskMind Hands**，而不是 DeskMind 本身。在「系统设置 → 隐私与安全性」里，把 DeskMind Hands 的图标拖进「辅助功能」和「屏幕录制」列表，再打开它旁边的开关。助手会重新启动，让授权生效。
- 如果运行时提示助手的权限好像失效了，回到 App 首页检查「辅助功能」「屏幕录制」，然后再跑一次。
- 「自动化」是可选的。它让访达和文本编辑在后台保存、移动文件，第一次需要时由系统弹窗授予。
- **在终端里直接运行 Hands 时**，要把「屏幕录制」和「辅助功能」授予运行 Hands 的宿主应用（比如你的终端），因为 Hands 用来截屏和发送输入的工具 [Peekaboo](https://github.com/steipete/Peekaboo) 在它里面运行。然后用下面的命令查看这台机器能跑什么：

  ```bash
  deskmind-hands doctor
  ```

  模拟桌面完全不需要权限，可以用它来判断问题是不是出在权限上。

## 内存和磁盘

- **磁盘：** 4B 下载约 4.5 GB，0.8B 约 0.8 GB。在 App 里，决策模型约占 5.3 GB，可选的视觉模型约 3.3 GB。可用空间不足约 7.5 GB 时，App 会在下载前提醒你。
- **内存：** 两个决策模型加上推理环境，运行期间约占 7 GB 内存。内存小于 12 GB 的 Mac 上，App 会提示模型可能很慢或加载失败。
- App 提示「内存不够」时，关掉一些占内存的应用，再点「重试」。
- 视觉模型载入后约占 4 GB。App 只在可能用到它的运行前启动它，三十分钟没有运行就停掉。

我们的测量都在 48 GB 内存的 M4 Pro 上进行，没有在更小的机器上测过。

## App 里的模型服务起不来

首页「本地模型」一行会说明出了什么问题：

| 提示 | 怎么办 |
|---|---|
| 端口被占用：可能还有一个旧的模型服务没退出 | 点「重试」，会重新启动服务。 |
| 内存不够 | 关掉一些占内存的应用，再点「重试」。 |
| 模型文件好像不完整或已损坏 | 点「重新下载」。 |
| 模型载入超过 3 分钟还没完成 | 机器可能太忙。点「重试」。 |
| 模型服务意外退出了 | 点「重试」。如果反复出现，在「开发者工具」里打开日志，[报告给我们](/zh/docs/project/contributing/#在哪里报告)。 |

重启后，载入通常需要 30 秒左右。

## App 里的任务运行失败

| 提示 | 怎么办 |
|---|---|
| 这次没能读到窗口的画面 | 机器太忙时会这样。稍等一下再跑一次。 |
| 本地模型没有及时回应 | 确认首页「本地模型」已就绪，再跑一次。 |
| 上一个任务还在进行 | 等它结束，或先点「停止」。 |
| 你在用电脑，已暂停 | 不是错误：这一步需要切到前台，它会等你停下鼠标键盘再继续。 |
