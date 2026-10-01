---
title: 参与贡献
description: 可以从哪里入手，问题报到哪里，一份好的问题报告或复现报告要写什么。
sidebar:
  order: 1
---

组织级的贡献规范在 [deskmind-ai/.github/CONTRIBUTING.md](https://github.com/deskmind-ai/.github/blob/main/CONTRIBUTING.md)，适用于所有仓库。各组件在自己的 `CONTRIBUTING.md` 里另外写明环境搭建和测试命令，比如 [brain/CONTRIBUTING.zh-CN.md](https://github.com/deskmind-ai/brain/blob/main/CONTRIBUTING.zh-CN.md)。本页是摘要，以这些文件为准。

## 参与方式

| 做什么 | 为什么 | 仓库 |
|---|---|---|
| 贡献一个桌面任务和评分器 | 门槛最低、价值最高 | [bench](https://github.com/deskmind-ai/bench) |
| 提交你的智能体在 bench 上的成绩 | 收录进参考成绩 | [bench](https://github.com/deskmind-ai/bench) |
| 适配新的应用或平台 | Windows、Linux、浏览器、Office | [hands](https://github.com/deskmind-ai/hands) |
| 更准的视觉定位 | 模型、数据、评测 | [eyes](https://github.com/deskmind-ai/eyes) |
| 更快、把握更准的决策 | 部署、训练、校准 | [brain](https://github.com/deskmind-ai/brain) |
| 文档、翻译、示例 | 中英文 | 任意仓库 |

从带 **good first issue** 标签的 issue 开始，每个都写明了要改哪个文件、怎样算完成。

## 原则

1. **用数据说话。** 影响模型行为的改动，要附上检测集或 bench 上改动前后的结果。
2. **本地优先，默认保护隐私。** 绝不提交真实用户数据、你自己应用的截图、密钥、令牌或原始桌面轨迹。这些都放在不提交的 `private/` 目录里；可识别身份的路径和值要脱敏，但保留足以复现的结构。
3. **成绩要诚实。** 输在哪里，和赢在哪里一样写清楚。
4. **PR 小而专注。** 一个 PR 只做一件事，风格与周围代码一致。

## 在哪里报告

- **项目方向、跨组件的环境问题、归属不明的问题、复现报告：** 提交到 [deskmind 的 issues](https://github.com/deskmind-ai/deskmind/issues)。
- **已定位到单个组件的 bug：** 提交到对应仓库（[brain](https://github.com/deskmind-ai/brain/issues)、[eyes](https://github.com/deskmind-ai/eyes/issues)、[hands](https://github.com/deskmind-ai/hands/issues)、[bench](https://github.com/deskmind-ai/bench/issues)、[app](https://github.com/deskmind-ai/app/issues)）。
- **跨仓库的改动：** 在 deskmind 开一个协调 issue，再链接到各组件里具体的 issue 或 PR。
- **提问与设计讨论：** 去 [Discussions](https://github.com/orgs/deskmind-ai/discussions)。
- **安全问题：** 不要公开提交，见[安全](/zh/docs/project/security/)。

先搜索已有的 issue。报告被转移时，请在新旧位置互相链接，不要另开一个没有关联的重复 issue。

## 一份好的问题报告

请包含：

1. 能复现问题的最小目标或请求，使用虚构数据和临时文件夹；
2. 准确的源码版本，以及模型版本和量化方式；
3. 硬件、macOS 版本、相关应用的版本、系统语言，必要时还有显示缩放；
4. 预期的和实际的最终状态，以及复现频率；
5. 桌面运行还要写明：允许了哪些应用和文件夹，是否用了投影层、视觉模式或远程升级，以及最终状态是否与智能体报告的不同。

Brain 的问题，请给出命令、模型和一个能复现问题的最小请求体，去掉一切个人信息。

## 评测与复现

复现失败和复现成功一样有价值。请记录：

- 评测方向：Brain、Eyes、端到端，还是部署速度；
- 源码、模型、数据的固定版本，以及任务集版本；
- 硬件、系统、运行时、量化与解码方式；
- 重复次数、重试、限制、路由、单次还是两次推理；
- 带分子分母的结果，包括所有尝试过的运行和所有排除项；
- 耗时指的是什么：推理、单次请求，还是整个任务。

只比较条件一致的结果：GPU 与 MLX、单模型与路由、不同版本的执行框架，都要分开报告。mock 或 oracle 运行只验证接线是否正确，不算模型成绩。不要公开密封测试题，也不要公开你无权再分发的数据。

## 给 Brain 提 PR

摘自 [brain/CONTRIBUTING.zh-CN.md](https://github.com/deskmind-ai/brain/blob/main/CONTRIBUTING.zh-CN.md)：

```bash
git clone https://github.com/deskmind-ai/brain && cd brain
uv sync --extra mlx          # Apple Silicon：本地运行和评测
uv run --group dev pytest -q # 提 PR 前必须通过
```

- 大部分 issue 不需要 GPU，也不需要模型：测试用的是一个桩服务。训练需要 CUDA 机器。
- 改变行为的改动要附上前后对比：`scripts/probe_ops.py`、`deskmind-brain-eval score`，或一次 bench 运行。
- 保持接口稳定：`POST /v1/systemone` 接收 `{state, questions}`，返回 `{answers}`。扩展时要保持兼容。
- 改动提示的渲染方式，要在 `deskmind.json` 里登记一个新的 `prompt_format` 编号，因为已有模型都绑定在训练时的格式上。
- 训练和评测数据的来源和许可必须允许再分发。

## 行为准则与许可

- 友善交流。得心采用 [Contributor Covenant 2.1](https://github.com/deskmind-ai/.github/blob/main/CODE_OF_CONDUCT.md) 作为行为准则。举报请发邮件到 conduct@deskmind.dev，或私信任一维护者。
- 贡献内容按所在仓库的许可发布（代码为 Apache-2.0）。
