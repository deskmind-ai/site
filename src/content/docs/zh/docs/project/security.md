---
title: 安全
description: 如何私下报告安全漏洞，以及我们最关注哪些问题。
sidebar:
  order: 2
---

得心所有仓库的安全政策都在 [deskmind-ai/.github/SECURITY.md](https://github.com/deskmind-ai/.github/blob/main/SECURITY.md)。本页是摘要，以该文件为准。

## 私下报告

安全问题请**不要**公开提 issue。

1. 在 GitHub 上打开受影响仓库的 **Security** 页。
2. 点 **Report a vulnerability**。

无法使用 GitHub 时，可以发邮件到 **security@deskmind.dev**。我们争取 7 天内回复。

## 我们最关注的问题

- 任何可能意外把屏幕内容或用户数据发出本机的问题。
- 桌面驱动（Hands）越出所要求的任务或沙箱范围执行操作。
- 已发布的文件中出现密钥或个人数据。

## 准备报告时

- 和普通的[问题报告](/zh/docs/project/contributing/#一份好的问题报告)一样，使用虚构数据和临时文件夹。
- 不要附上你自己应用里真实的截图、运行记录或文档。可以文字描述，或者用虚构数据复现问题。

## 什么在哪里运行

要判断某个行为算不算泄露，先要知道哪些部分本来就会联网。默认情况下推理在你的 Mac 上进行；下载模型、得心替你操作的应用会联网；可选的远程升级层会收到发给它的请求。见[架构：哪些在本机运行](/zh/docs/explanation/architecture/#哪些在本机运行)。
