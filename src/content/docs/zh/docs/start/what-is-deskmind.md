---
title: DeskMind 是什么
description: 一组开源小模型：看清你的屏幕，想好下一步，在你的 Mac 上动手，每个决定都给出概率。
sidebar:
  order: 1
---

DeskMind 得心让 agent 用开源小模型操作真实的 macOS 桌面。你给它一个目标，比如「新建一个叫 docs 的文件夹，把 .txt 文件都移进去」，它会想好步骤，在你允许的应用里一步步做完；目标达成、需要问你或做不下去时，它会停下来。

中文名「得心」取自成语「得心应手」：心里想定的，手上就能做到。

## 一个循环，三个角色

任务的每一步都走同一个循环：

1. **Hands 观察。** 读取当前窗口：辅助功能树；没有辅助功能树的地方，用本机文字识别（OCR）读屏幕上的字。
2. **Brain 决定。** Hands 把屏幕变成一组带类型的问题：*下一步做什么操作？* *点哪个元素？* *输入什么值？* Brain 为每个问题的每个选项给出概率。
3. **Hands 执行。** 在目标窗口里完成选定的操作，记下发生了什么，然后进入下一步。

**Eyes** 只在应用没有可用的辅助功能树时才加入循环：给它一张截图和一句描述（比如「发送按钮」），它返回应该点的位置。

**Bench** 在循环之外。它提供沙箱桌面任务和评分程序，检查一次运行结束后的最终状态，不看 agent 自己怎么说。

| 组件 | 负责 | 仓库 |
|---|---|---|
| Eyes | 在截图上找到目标 | [deskmind-ai/eyes](https://github.com/deskmind-ai/eyes) |
| Brain | 决定下一步，为每个选项给出概率 | [deskmind-ai/brain](https://github.com/deskmind-ai/brain) |
| Hands | 观察并操作 macOS 桌面 | [deskmind-ai/hands](https://github.com/deskmind-ai/hands) |
| Bench | 沙箱任务和严格的最终状态评分 | [deskmind-ai/bench](https://github.com/deskmind-ai/bench) |
| App | 把整个循环做成一个 Mac App | [deskmind-ai/app](https://github.com/deskmind-ai/app) |

每个组件都能单独使用。它们怎么连在一起，见[架构](/zh/docs/explanation/architecture/)。

## 有什么不同

- **做选择，不写自由文本。** Brain 从不自己写动作，只在 Hands 给出的选项里挑，所以没有要解析的输出，也不会做出列表之外的动作。见 [System One](/zh/docs/explanation/system-one/)。
- **大小两个模型。** 每一步先由 0.8B 模型回答；它没把握，或者这一步做错代价大（宣布完成、放弃、撤销），就交给 4B 模型。
- **会问。** 目标可能有不止一种理解时，它先问你再动手写。在 Mac App 里，发送、删除或无法撤回的操作之前也会先征得你的同意。
- **默认本地推理。** 模型用 MLX 在你的 Mac 上运行。下载模型要联网，它替你操作的联网应用本身也会联网。如果你把路由的升级层指向远程服务，发给该服务的请求会离开本机。

## 适合谁

- **开发者和研究者：** 在做 Computer Use Agent，想要一个本地运行、带类型的单步决策 HTTP 接口。从[快速上手](/zh/docs/start/quickstart/)开始。
- **想在自己的 Mac 上试试本地 agent 的人：** 见[安装 Mac App](/zh/docs/start/install-the-app/)。
- **想如实评测 agent 的人：** Bench 从磁盘读取运行记录，用严格的评分程序重新打分。

## 现在能做什么，还做不到什么

在我们的真实桌面评测上（13 个任务 × 3 次，39 次全部通过，没有一次把没做完说成完成），已经能做到：

- 访达：新建文件夹，移动、重命名文件，进出目录，按类型归档文件。
- 文本编辑：精确修改字段，逐字输入带全角标点的中文，保存。（中文文本任务里文件能写对，但模型还不会自己宣布完成。）
- 跨应用：读 Safari 里的一张短表格（四行），排好序追加到 CSV；在两个文档之间抄写数值。
- 守规矩：目标有歧义时先问；两份几乎一样的文档只改指定的那份；中途取消时停下。

还做不到或做得不好的：

- **只支持 Apple Silicon 上的 macOS。** 不支持 Windows、Linux 和 Intel Mac。
- **测试覆盖小。** 13 个任务，一台 Mac，一种系统语言（中文）。换个环境，结果可能不同。
- **只有少数应用有专门支持。** 访达和文本编辑有一层「投影」，操作起来更容易；其他应用，包括 Safari，模型看到的是原始的辅助功能树。
- **速度。** 目前约 70% 的步骤交给 4B，一次决策通常要 3 秒左右。
- **有些应用必须在前台操作。** 应用不接受后台输入时，这一步需要短暂切到前台，只有你允许时 Hands 才会这么做。
- **概率不是保证。** 模型可能很有把握，却答错。

完整数字和已知的失败情况，见[成绩与局限](/zh/docs/explanation/results-and-limits/)。

## 许可

代码采用 Apache-2.0，见各组件的 LICENSE 和 NOTICE。模型权重、基座模型和数据集遵循各自的条款。本文档采用 CC BY 4.0。DeskMind 和「得心」这两个名称、logo 和小方不在上述许可范围内，见[品牌规范](https://github.com/deskmind-ai/deskmind/blob/main/BRAND.zh-CN.md)。
