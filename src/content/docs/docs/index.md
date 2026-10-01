---
title: DeskMind documentation
description: How DeskMind sees your screen, decides the next step and acts on your Mac, and how to run it yourself.
template: doc
---

DeskMind 得心 is a set of small open models and tools that operate a Mac: **Eyes** finds things on screen, **Brain**
decides the next step, **Hands** carries it out, and **Bench** checks what really happened. Inference runs on your
Mac by default: the models download once, and only an optional remote escalation tier, if you set one up, sees
the steps routed to it.

New here? Read [What is DeskMind](/docs/start/what-is-deskmind/), then
[run Brain on your Mac](/docs/start/quickstart/).

## Start here

- [What is DeskMind](/docs/start/what-is-deskmind/): the loop, who it is for, what it can and cannot do yet.
- [Install the app](/docs/start/install-the-app/): system requirements, permissions and the first model download.
- [Quickstart](/docs/start/quickstart/): run Brain on your Mac in five minutes.

## How-to guides

- [Troubleshooting](/docs/how-to/troubleshooting/): downloads, MLX versions, macOS permissions, memory.

## Reference

- [`POST /v1/systemone`](/docs/reference/systemone-api/): request and response format, errors, server options.

## Explanation

- [Architecture](/docs/explanation/architecture/): the components, how they talk, what runs where.
- [System One: choices, not guesses](/docs/explanation/system-one/): typed questions, probabilities, routing,
  asking and checking "done".
- [Results and limits](/docs/explanation/results-and-limits/): what we measured, on what, and where it still fails.

## Project

- [Contributing](/docs/project/contributing/)
- [Security](/docs/project/security/)
