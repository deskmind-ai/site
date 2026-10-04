---
title: FAQ
description: Common questions about DeskMind for Mac — requirements, download size, permissions, privacy, safety, speed, and how it relates to other computer-use tools.
sidebar:
  order: 4
---

## What is DeskMind?

Open-source computer use for your Mac. You type a goal; DeskMind reads the screen, decides each step with a small
model running on your Mac, and operates your apps. When a goal could mean two things, it asks you instead of guessing.
It is five open parts: Eyes (sees the screen), Brain (decides), Hands (acts), the Mac app, and Bench (measures). See
[What is DeskMind](/docs/start/what-is-deskmind/).

## Is it free? What is the licence?

Yes. The app, the code and the models are free to download and use. Code is Apache-2.0, docs are CC BY 4.0, and model
weights, base models and datasets follow their own terms (listed on each model card).

## Which Macs does it run on?

A Mac with Apple Silicon and macOS 15 or later. The decision models take about 7 GB of memory while running; on a Mac
with less than 12 GB the app warns you that loading may be slow or fail. Intel Macs, Windows and Linux are not
supported by the app.

## How big is the download?

The app is a DMG of about 380 MB. On first run it downloads the decision models once, about 5.3 GB (0.8B + 4B), and checks every
file against a SHA-256 hash. The optional vision model adds about 3.3 GB. If Hugging Face is slow or blocked, the app
switches to the same files on ModelScope by itself; this is the usual path in mainland China.

## What permissions does it need, and why?

Accessibility, to read the buttons and text in windows and to click and type; and Screen Recording, to see what is on
screen and tell how far a task has got. Automation is optional, for saving and moving files in Finder and TextEdit.
The permissions belong to the background helper, **DeskMind Hands**. See [Install the app](/docs/start/install-the-app/).

## Does anything leave my Mac?

The only network requests the app makes itself are the model downloads. After that, deciding a step runs on your Mac;
the model servers listen on `127.0.0.1` only. Screens, screenshots and run records stay on your Mac. Apps that
DeskMind operates for you, such as Safari or a music app, still use the network as they normally would. If you point
the router's escalation tier at a cloud model yourself, the steps routed to it go to that service; the app never does
this on its own.

## Can it do something I did not want?

It shows each step and why as it goes. It asks before steps that send, delete, pay or publish. Press **⌘.** to stop a
run; touching the mouse or keyboard pauses it until you let go. It can still make mistakes, so start with tasks you
can check.

## What can it do today, and what not yet?

It handles short desktop tasks across apps: finding a record and adding it to a file, picking the right track in a
music app, copying a small web table into a CSV and saving it. It is still weak at long or filtered table copies (more
than about four rows), filling a form from a photographed receipt, and some steps that need the 4B take a few
seconds. See [Results and limits](/docs/explanation/results-and-limits/).

## What should I try first?

Start with the sample folder the app offers, then a specific goal in your own folder: "move the invoices into the
Invoices folder" works better than "organise this folder". Vague goals aren't handled well yet. With nothing obvious to
sort into, it may stop early or choose odd names. Large folders are slow too, because the screen state gets long and
every step goes to the 4B, so expect tens of seconds per step there.

## How fast is it?

Across all steps on our real-desktop bench, a decision takes 2.85 s at the median and 9.8 s for the slowest 5%. When
the 0.8B answers a step itself it takes about 0.5 s; when the step goes to the 4B, about 3.6 s, and in this release
about 70% of steps go to the 4B. These are times per decision, not per task. Keeping more steps on the fast path is
the main goal of the next release.

## Why does it ask me questions?

Each step is a multiple-choice question with a probability for every option. When two options are both plausible,
for example two orders under the same name, guessing would write the wrong thing, so it asks you instead. See
[System One: choices, not guesses](/docs/explanation/system-one/).

## Can I use Brain in my own agent?

Yes. Brain runs as a local HTTP server that speaks `POST /v1/systemone`: send the page state and typed questions, get
back a choice and a probability for every option. Start with the [Quickstart](/docs/start/quickstart/) and the
[API reference](/docs/reference/systemone-api/).

## Is DeskMind related to Jev or TypeSafe?

No. DeskMind is an independent open-source project. Brain's server implements the same `/v1/systemone` request format,
so clients written for that format can use it by changing the base URL. The models, data and evaluations are our own.

## How do you measure the results?

On a real macOS desktop with Bench: 13 tasks, 3 runs each, graders that check the final state of files and apps. The
release passed 39 of 39 runs with no false "done". That is a small sample on one Mac; the protocol and per-task
results are in the [bench repository](https://github.com/deskmind-ai/bench), so you can run it yourself.

## How can I help?

Try it and report what breaks, especially on the first run. Good first issues are labelled in each repository, and
new Bench tasks are welcome. Questions go to [Discussions](https://github.com/deskmind-ai/deskmind/discussions). See
[Contributing](/docs/project/contributing/).

## Does this website track me?

It counts visits and clicks (for example, which button people use to download) without cookies and without
personal data: Cloudflare Web Analytics plus our own anonymous events. A random id in your browser tab links the
events of one visit. Browsers that send Do Not Track send nothing.
