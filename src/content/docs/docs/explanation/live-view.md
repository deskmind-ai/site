---
title: The live view
description: The card in a corner that shows the window a task is working in, live. What it shows, how it keeps out of your way, what it does in edge cases, and why it takes one picture at a time.
sidebar:
  order: 3
---

While a task runs in the background, a small card in a corner of the screen shows the window DeskMind is working in,
live, with the step it is taking in words. It is new in the Mac app 0.4.0 and on by default. To turn it off, uncheck
**View › Show a Live View of the Task**. The setting applies from the next task; to pause the picture of the task
running now, collapse the card.

<video src="/video/case-live-en.mp4" poster="/video/case-live-en.jpg" controls muted playsinline preload="none" style="width:100%;border-radius:12px"></video>

A task usually works in a window you are not looking at: behind your own windows, or on another display. The island
at the top of the screen says what the task is doing. The card shows what it looks like.

## What the card shows

- **The title bar:** 小方, then the app's name, then the step number or the status.
- **The picture:** the task's window, whole, even when other apps' windows cover it. An orange dot marks where the
  last step acted, with a ripple on a click. DeskMind never moves your own pointer.
- **The line under the picture:** the step being taken, in words, such as *Type "hello"*.

小方's eyes tell you the state at a glance. The orange dot at its foot is the status light.

| 小方 | State |
|---|---|
| eyes on the orange dot | working; the eyes follow where it acts |
| looking up | it needs you: a question or an approval |
| ^ ^ | done |
| – – | didn't finish, stopped, or the window is out of sight |

## Using it

The buttons appear when the pointer is on the card.

| Do this | What happens |
|---|---|
| Drag the card | It snaps to the nearest corner and stays there for later tasks. |
| Double-click, or press **Larger** | The picture grows to fit within 720 × 480 points instead of 360 × 240, keeping the window's shape. Do it again to shrink it. |
| Press **Collapse** | The card becomes a 260 × 36 capsule with the status and the step. The capture pauses while it is collapsed. |
| Press **Stop the task** (■) | The task stops. |
| Click the card when it needs you | DeskMind's window opens so you can answer. |

## Keeping out of your way

- **It never takes the keyboard and never comes to the front.** Whatever you are typing elsewhere keeps going there.
- **It avoids the task's window.** If your corner would cover that window, the card moves to the next corner that
  does not: across the same edge first, then up or down the same side, then the opposite corner.
- **Over an app that fills the screen, it lets clicks through.** Most people keep their apps maximized, so no corner
  is clear. The card then stays in the corner farthest from where the task has been acting, and clicks pass through it
  to the app. Rest the pointer on the card for half a second and its buttons work. A task's click lands without
  pausing on the card, so it always passes through.
- **It says how the task ended, then goes.** It shows **Done**, **Didn't finish** or **Stopped** on its last picture
  for 2.5 seconds, then fades. If you start a new task sooner, the old card goes at once.

## Edge cases

| Situation | What the card does |
|---|---|
| The window is behind other apps' windows | It still shows the window whole. The capture leaves other apps' windows out. |
| Another window of the same app lies on top of the task's window | In 0.4.0 that window shows in the picture too, as it does on your screen at that moment. |
| The window moves, resizes or goes to another display | The card follows it. It checks about every 0.5 seconds. |
| The window is minimized, closed or on another Space | It keeps the last picture, dimmed, with *Window not visible*. The picture comes back when the window does. |
| The app has other windows | The card never switches to one of them. Once DeskMind has looked at the screen, the card shows only the window the task works in. |
| The app is not open yet | DeskMind opens it in the background before the task starts. The card says *Starting* until it has a picture. |
| The task asks a question or wants approval | The card says *Needs you* and 小方 looks up. Click the card to answer in DeskMind. |
| You take a screenshot or share your screen | The card is an ordinary window, so it shows. |
| The models look at the screen | They never see the card. Each step's screenshot captures only the task's window. |
| You record the task | The recording leaves the card out. Recording the whole screen keeps it. |

While a task runs with the live view on, macOS shows its screen-recording indicator in the menu bar. The card uses
the Screen Recording permission DeskMind already has.

## Privacy

- **The task's window.** The card follows the window the task observes. It never switches to another window of the
  same app, or to anything else on your screen. Other apps' windows are left out of the picture. In 0.4.0, a window of
  the same app lying on top of the task's window does show, as it does on your screen.
- **The picture stays in the helper.** DeskMind Hands, the background helper that holds Screen Recording, captures the
  picture and draws the card. The picture is not sent to the DeskMind app, not saved to disk and never leaves your Mac.

## Why one picture at a time

The card takes one picture about every 0.2 seconds, using ScreenCaptureKit's one-shot screenshots. It does not run a
continuous capture stream, because a running stream slows the models down.

We measured it on a fixed MLX load, on one M4 Pro (macOS 27.2):

| Capture running beside the model | Time per round |
|---|---|
| none | 102 ms |
| a capture stream, at 2 or 10 frames a second | 121–125 ms |
| one-shot screenshots, even 10 a second | 101–107 ms |

In this test a running stream made each round about 20% slower, and in real runs the stream-based card made
decisions about 20% longer. With one-shot screenshots, one comparison on a real task gave an average of 5.35 s per
decision with the card off and 5.56 s with it on (steps 4–9), about 4% slower. These are small samples on one Mac;
the measurements are in the [pull request that added the card](https://github.com/deskmind-ai/deskmind/pull/3). The
same cost is why recording a run slows it down, as noted in
[Results and limits](/docs/explanation/results-and-limits/#decision-time).

Two more choices:

- **The picture is taken from the display, with other apps' windows left out, then cropped to the task's window.**
  That is why a window covered by other apps still shows whole. Naming the window in the capture filter instead would put macOS's
  purple "being shared" mark on it, on macOS 26 and later.
- **It asks for twice the card's size in pixels, never more than the window has.** The picture stays sharp on a
  Retina display without copying a 5K window five times a second.

## Source

The card is [app/Helper/LiveCard.swift](https://github.com/deskmind-ai/deskmind/blob/main/app/Helper/LiveCard.swift).
Its decisions are [app/Shared/LiveView.swift](https://github.com/deskmind-ai/deskmind/blob/main/app/Shared/LiveView.swift)
and need no screen: which window, the card's size and corner, where the dot goes, and when it takes clicks. These are
unit-tested in `app/tests/DecisionTests.swift`. The desktop test `app/tests/e2e/live_view.sh` drives a real card
over a scratch TextEdit document. It never presses a key and never brings an app to the front.
