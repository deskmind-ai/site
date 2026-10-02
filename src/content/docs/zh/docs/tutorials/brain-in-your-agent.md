---
title: 在你自己的 agent 里用 Brain
description: 在你自己的代码里调用 Brain 的 /v1/systemone 接口：先发一个约 30 行的请求，再写一个按把握分流、拿不准就问用户的“决策 → 动作 → 观察”循环。
sidebar:
  order: 1
---

Brain 只负责做决定。它自己看不到你的屏幕，也不会动手：由你的代码描述当前情况和可选项，Brain 选一个并给出把握，再由你的代码
去执行。本页假设服务已经在 `127.0.0.1:8793` 上运行（见[快速上手](/zh/docs/start/quickstart/)）。

## 第一个请求（约 30 行）

只用 Python 标准库。对同一个状态问一道选择题（`choice`）和一道是非题（`noul`）：

```python
import json, urllib.request

state = {
    "goal": "Open the invoice for October and check whether it is paid.",
    "window": "Finder — ~/Documents/Invoices",
    "files": ["invoice-2026-08.pdf", "invoice-2026-09.pdf", "invoice-2026-10.pdf", "notes.txt"],
}
request = {
    "state": state,
    "questions": {
        "file": {
            "type": "choice",
            "criteria": {f: f"open {f}" for f in state["files"]},
            "instructions": "Which file should be opened next to reach the goal?",
        },
        "done": {
            "type": "noul",
            "instructions": "Is the goal already complete in this state?",
        },
    },
}
req = urllib.request.Request("http://127.0.0.1:8793/v1/systemone", data=json.dumps(request).encode(),
                             headers={"Content-Type": "application/json"})
answers = json.load(urllib.request.urlopen(req))["answers"]
print(answers["file"]["choice"], answers["file"]["confidence"], answers["file"]["probabilities"])
print("P(done) =", answers["done"]["noul"])   # a yes/no answer is the probability of yes
```

选择题（`choice`）的回答包含选中的选项、每个选项的概率，以及这个选择的把握 `confidence`；是非题（`noul`）的回答只有一个数，即“是”的概率。上面这个例子里，4B 以约 0.97 的把握选中 `invoice-2026-10.pdf`，“已完成”的概率约 0.04。全部字段见[接口参考](/zh/docs/reference/systemone-api/)。

## “决策 → 动作 → 观察”循环

DeskMind 自己的执行层就是这个模式，去掉细节后是这样：

```python
THRESHOLD = 0.9  # 用你自己记录下来的步骤来调

while True:
    state, options = observe()              # 你的代码：屏幕上有什么、现在能做什么
    options["ASK"] = "Ask the user: the goal could mean more than one thing here."
    options["DONE"] = "The goal is complete, and the state shows it."
    a = decide(state, options)              # 一次 POST /v1/systemone，同上
    if a["choice"] == "DONE":
        if verify_final_state(): break      # 不要不检查就相信“完成”
        continue
    if a["choice"] == "ASK" or a["confidence"] < THRESHOLD:
        answer = ask_user(a)                # 或者把这一步交给更强的模型
        continue
    act(a["choice"])                        # 你的代码：点击、输入、调用工具
```

有三件事比模型本身更重要：
- **给对选项。** Brain 只能从你给的列表里选。正确的动作不在列表里，答案就一定错，不管把握多高。
- **明确提供“问用户”和“完成”两个选项**，并且在接受“完成”之前自己检查最终状态。
- **按把握分流。** 把每一步的把握和事后是否正确记下来，再用这份记录来定门槛。概率是模型的把握，不是保证。

选择题避免的是格式错误（没有要解析的输出），避免不了判断错误。

## 接下来

- [System One：选择，不是猜](/zh/docs/explanation/system-one/)讲概率是怎么算出来的。
- [架构](/zh/docs/explanation/architecture/)讲 Eyes、Brain、Hands 在 Mac App 里怎么配合。
