---
title: DeskMind 文档
description: DeskMind 如何看清屏幕、决定下一步、在你的 Mac 上动手，以及怎样自己跑起来。
template: doc
---

DeskMind 得心是一组开源小模型和工具，用来操作 Mac：**Eyes** 在屏幕上找目标，**Brain** 决定下一步，**Hands** 负责执行，**Bench** 检查是否真的做成了。推理默认在你的 Mac 上进行：模型只需下载一次；只有你自己设置了可选的远程升级层时，交给它的步骤才会发到那个服务。

第一次来？先读[DeskMind 是什么](/zh/docs/start/what-is-deskmind/)，再[在 Mac 上跑起 Brain](/zh/docs/start/quickstart/)。

## 入门

- [DeskMind 是什么](/zh/docs/start/what-is-deskmind/)：工作循环、适合谁、现在能做什么、还做不到什么。
- [安装 Mac App](/zh/docs/start/install-the-app/)：系统要求、权限和首次下载模型。
- [快速上手](/zh/docs/start/quickstart/)：五分钟在 Mac 上跑起 Brain。

## 操作指南

- [常见问题排查](/zh/docs/how-to/troubleshooting/)：下载、MLX 版本、macOS 权限、内存。

## 参考

- [`POST /v1/systemone`](/zh/docs/reference/systemone-api/)：请求和返回格式、错误、服务参数。

## 原理

- [架构](/zh/docs/explanation/architecture/)：有哪些组件、怎么通信、什么在哪里运行。
- [System One：选择，不是猜](/zh/docs/explanation/system-one/)：带类型的问题、概率、路由、提问和完成前的检查。
- [实时画面卡](/zh/docs/explanation/live-view/)：实时显示任务窗口的小卡片，以及它怎样不挡你。
- [成绩与局限](/zh/docs/explanation/results-and-limits/)：测了什么、在什么条件下测、还在哪里出错。

## 项目

- [参与贡献](/zh/docs/project/contributing/)
- [安全](/zh/docs/project/security/)
