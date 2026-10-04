---
title: Glossary
description: The terms used across DeskMind's docs, results and release notes.
sidebar:
  order: 5
---

| Term | Meaning |
|---|---|
| **Eyes** | The screen model. Given a screenshot and a description, it returns where to click. Used for apps that expose no accessibility tree. |
| **Brain** | The decision model. Answers typed multiple-choice questions about one step, with a probability for every option. |
| **Hands** | The macOS harness. Reads windows through accessibility, turns each step into questions for Brain, acts, and checks the result. |
| **Bench** | Real-desktop tasks with graders that check the final state of files and apps. Suite versions are written `v25` and so on. |
| **System One** | Our name for the decision style: fast, one-pass choices with probabilities, as opposed to step-by-step reasoning in text. |
| **`/v1/systemone`** | The HTTP request format Brain serves: a state, typed questions, and answers with probabilities. |
| **choice / score / noul** | The three question types: pick one option; pick a level on a scale; yes or no. |
| **Router** | The 0.8B answers first; steps below its threshold, or costly to get wrong, are answered by the 4B. |
| **Threshold** | The confidence below which the router hands a step to the 4B. The release uses 0.96, stored as `router_threshold` in the 0.8B's `deskmind.json`. |
| **Escalation** | A step answered by the 4B instead of the 0.8B. About 70% of steps escalate in the current release. |
| **ASK** | An option the harness adds when the goal matches more than one record; choosing it asks you instead of guessing. |
| **DONE / done-check** | DONE is the model saying the task is finished. The done-check makes the harness verify the final state before accepting it. |
| **False "done"** | The model said DONE when the task was not finished. The release had none in 39 real-desktop runs. |
| **Release tags (G14, G18b, …)** | Training rounds of Brain. G18b is the current release; on Hugging Face its weights are tagged `g18b-q8` (8-bit). |
| **q8 / 4-bit** | Weight quantization. Brain ships 8-bit; Eyes runs 4-bit in the app. |
| **MLX** | Apple's machine-learning framework for Apple Silicon; DeskMind's models run on it. |
| **Oracle** | A scripted run that knows the correct answer for a sandbox task; used to label training data, never at run time. |
| **Held-out / holdout** | Tasks or decisions kept out of training, used only to evaluate. |
| **Offline gate** | Before a desktop test, every probe and held-out set is replayed against the previous release; a candidate that is worse on any check does not ship. |
| **JevBench** | A third-party benchmark of typed decisions. We report the 231 public items and have requested a sealed run; DeskMind is not affiliated with its maintainers. |
| **ScreenSpot-Pro** | A public benchmark for finding UI elements in high-resolution professional apps; used for Eyes. |
