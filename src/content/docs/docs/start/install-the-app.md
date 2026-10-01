---
title: Install the app
description: Install DeskMind for Mac, grant its helper the permissions it needs, and download the models on first run.
sidebar:
  order: 2
---

DeskMind for Mac puts the whole loop in one native app: you type a goal, confirm which apps it may use, and it
operates them for you, showing each step and why.

:::caution[Not public yet]
The Mac app has not been released yet. When it is, builds will be published on
[github.com/deskmind-ai/app/releases](https://github.com/deskmind-ai/app/releases). Until then you can run the
models yourself: see the [Quickstart](/docs/start/quickstart/).
:::

## Requirements

- A Mac with Apple Silicon.
- macOS 15 or later.
- Disk space for the models: about 5.3 GB for the planner (0.8B + 4B), plus about 3.3 GB if you add the optional
  vision model. The app warns you before the download if less than about 7.5 GB is free.
- Memory: the two planner models and their runtime take about 7 GB of memory while they run. On a Mac with less than
  12 GB the app shows a warning: the model may be slow or fail to load, so quit other apps first.

## Install

1. Download the DMG from the [releases page](https://github.com/deskmind-ai/app/releases).
2. Open it and drag **DeskMind** into **Applications**.
3. Open DeskMind from Applications.

Release builds are signed with a Developer ID and notarized by Apple.

## Two apps, one set of permissions

DeskMind is two apps:

- **DeskMind** is the window you see. It needs no privacy permissions itself.
- **DeskMind Hands** is a background helper that ships inside it. It does the observing and acting, so macOS
  attributes the permissions to **DeskMind Hands**, not to DeskMind.

The home screen has a **Setup** card that walks you through everything. It folds into one line once the required
items are ready.

| Item | What it is for | Required |
|---|---|---|
| Background helper | starts DeskMind Hands | yes |
| Local model | downloads and starts the planner models | yes |
| Accessibility | reads the buttons and text in windows, and clicks and types for you | yes |
| Screen Recording | sees what is on screen, to tell how far a task has got | yes |
| Automation | lets Finder and TextEdit save and move files in the background | optional |
| Vision model | finds controls in apps without an accessibility tree | optional |

For Accessibility and Screen Recording, the app opens the right page of System Settings and shows the DeskMind Hands
icon next to it. Drag the icon into the list, then turn on the switch next to **DeskMind Hands**. The row confirms
itself once the switch is on, and the helper restarts to pick up the grant without closing your window.

Automation is granted through the system's own prompt the first time the helper scripts an app.

## First run: the model download

The first time, the **Local model** row asks for a download of about 5.3 GB (the 0.8B and the 4B planner models).

- The app downloads the release models (DeskMind Brain G18b) from Hugging Face, pinned to exact revisions, and checks
  every file against a SHA-256 hash before using it.
- If Hugging Face fails, or is too slow (under about 200 KB/s for the first 30 seconds of a file), the app switches to
  the same files on ModelScope and checks them against the same hashes. This is the usual path in mainland China.
- The download can be paused and resumed; progress is kept.
- When it finishes, the app loads the model into memory. This usually takes about 30 seconds.

The vision model (about 3.3 GB) is downloaded only when you ask for it, from its own row. It is loaded only while a
task needs it.

:::note[What uses the network]
The only network requests the app makes itself are the model downloads. The planner and vision servers listen on
`127.0.0.1` only and run offline. Screens, screenshots, run traces and recordings stay on your Mac. Apps that DeskMind
operates for you, such as Safari, use the network as they normally would.
:::

## Check that it works

There is no separate self-test. Instead, the home screen's **Try examples** opens a set of sample tasks:

- **6 smoke tests** on a mock desktop: virtual windows in memory. They check that the app, the helper and the local
  runtime are wired up, and touch nothing real.
- **Real sandbox tasks** in Finder and TextEdit (make a folder, move a file, sort files by type, type exact Chinese
  text and save). Each runs in a fresh sandbox folder, never in your own files, and is checked by a grader.

If something fails, see [Troubleshooting](/docs/how-to/troubleshooting/).

## Your first task

Type a goal on the home screen. Before the run starts, DeskMind shows which apps it will use and asks you to confirm.
File work is limited to a folder you attach. While it runs:

- it asks you when the goal is ambiguous, and you answer on a card;
- it asks for approval before anything that sends, deletes or cannot be taken back;
- if an app only responds in the foreground, it waits until you leave the mouse and keyboard alone, or you can hand it
  the Mac for five minutes.

When a run ends, DeskMind shows what changed in the attached folder.
