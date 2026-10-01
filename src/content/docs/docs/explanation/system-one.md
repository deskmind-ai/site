---
title: "System One: choices, not guesses"
description: Why every step is a multiple-choice question, what the probabilities mean and do not mean, how the 0.8B → 4B router decides, and how DeskMind asks and checks before it says done.
sidebar:
  order: 2
---

Brain makes each decision the way you would pick from a short menu: quickly, from options someone else has laid out.
It never writes an action in free text. This page explains why, and what the numbers it returns can and cannot tell
you.

## Each step is a multiple-choice question

At every step, Hands turns the screen into a few typed questions, each with a closed list of options:

- *Which operation next?* CLICK, OPEN, TYPE_TEXT, KEY, DONE, BLOCKED, ASK, …
- *Which element to click?* One option per clickable element on screen.
- *Which value to type?* One option per candidate value.
- *Which chord to press?* Only the chords that apply here.

Brain answers each question with a probability for every option. Hands takes the most likely operation and the most
likely target for it.

This has a few consequences:

- **Nothing to parse.** The model does not write JSON or code, so there is no malformed output to repair.
- **No action outside the list.** The model cannot click an element that is not on screen or press a chord it was
  not offered. What it can do is limited to what Hands puts in front of it.
- **Every option is scored.** You see not only the choice, but how close the runner-up was.

## Answered without generating text

Each question becomes a prompt: the state, the question, and the options with short labels (A, B, C, …). The model
reads the prompt once, and its scores for the label tokens at the answer position become the probabilities. Nothing
is decoded.

All questions about one state share the same prompt prefix (the state, the goal and the rules), which is computed
once; each question adds a short branch. With two-stage scoring, the operation is answered first and then only the
questions that operation needs. A step therefore costs one pass over the shared prefix plus a few short branches.

On an M4 Pro, the time goes into reading the prompt, not into the answer: a desktop step is about 1,900 prompt tokens,
and the 4B reads about 850 tokens per second. See [Results and limits](/docs/explanation/results-and-limits/).

## What a probability means

A probability of 0.96 means the model put 0.96 of its weight on that option. It is **confidence, not a guarantee of
correctness.** In particular:

- **Models can be confidently wrong.** A high probability makes a correct answer more likely; it does not make it
  certain.
- **Calibration is measured, and it is imperfect.** On the 231 public JevBench items, the G18b 4B has an expected
  calibration error (ECE) of 0.089 and a Brier score of 0.269. Its stated confidence and its accuracy differ by
  several points on average.
- **The 0.8B's confidences are compressed.** In release G18b they sit in a narrow band, about 0.94 to 0.97. That is
  why its routing threshold is so high, and why most steps go to the 4B.
- **Confidence on one set does not transfer for free.** The threshold was first chosen on held-out desktop tasks; that
  set later proved optimistic.

Use the probabilities to decide when to slow down: ask, escalate, or check. Do not use them as proof that a step was
right. To know whether a task really succeeded, check the final state, as [Bench](https://github.com/deskmind-ai/bench)
does.

## Two tiers: 0.8B, then 4B

The released setup is a router. The 0.8B model answers every step. Its answer is used only when it is sure enough and
the step is not one that is costly to get wrong; otherwise the same step is answered again by the 4B.

A step goes to the 4B when:

- **the 0.8B is not sure enough:** the weakest top probability among the operation and the questions it needs is below
  the threshold;
- **it would end the task:** the operation is DONE or BLOCKED;
- **it could lose work or act outwardly:** a keyboard chord other than ⌘S, ⌘F, ⌘C, Tab or Escape, or a click on an
  undo button;
- **it would finish right after an unconfirmed action:** DONE straight after an action whose effect Hands could not
  verify.

The threshold ships with the weights: `router_threshold` in the 0.8B's `deskmind.json`, **0.96** for G18b. The server
reads it from there; `--threshold` overrides it, and 0.94 is the fallback when the file has no value.

One exception protects finished work: if the 0.8B says DONE and the 4B's alternative is to click undo, DONE is kept.
On the real desktop the strong tier otherwise undid finished tasks and looped.

Every reply says who answered and why, in a `routing` record. The reasons are listed in the
[API reference](/docs/reference/systemone-api/#routing).

The cost is speed. In G18b about 70% of steps escalate, so a typical decision takes about 3 seconds instead of about
half a second.

## Asking instead of guessing

Some goals cannot be done right without more information: two records match the name in the goal, or the value to
enter is not on screen. Guessing is worse than asking.

- When Hands sees that the goal could be ambiguous, it offers **ASK** as an operation, with a question for you. Brain
  can choose it like any other operation.
- In the app, the question appears as a card. If it lists alternatives, each one is a button; you can also type an
  answer. Your answer goes into the state, and the model is told not to ask again.
- Separately from ASK, the app asks for **approval** before any action that sends, deletes or cannot be taken back.

One of the bench tasks tests exactly this: the goal names a record that matches two rows. A pass means asking before
writing anything, then writing the full chosen row, saving and finishing.

## Checking before saying done

Claiming "done" too early is the most expensive mistake an agent can make: you stop watching, and the work is not
finished. DeskMind checks DONE at several levels:

1. **The 4B checks every DONE.** A DONE from the 0.8B always goes to the 4B. If both choose it, the reply is marked
   `confirmed`.
2. **Hands holds DONE to a bar.** A DONE or BLOCKED with a probability below 0.8 may be replaced by the best other
   operation, if there is a real alternative. A DONE is kept when its probability is 0.5 or more, when the model chose
   it two steps running, or when both tiers confirmed it: replacing those undid finished work.
3. **The app checks the goal's own words.** Before a run in the app may finish, Hands compares the goal with what the
   run actually did: a file written but not saved, fewer rows written than the goal asks for, a window the goal says to
   close still open. If something is missing, the DONE is sent back, with what is missing, once or twice. This check
   is on in the app and off by default in Hands; it was off in the bench run reported in
   [Results and limits](/docs/explanation/results-and-limits/).
4. **Bench grades the final state.** In evaluation, a run passes only if the files and windows end up right,
   whatever the agent said. Every DONE the grader does not agree with is counted as a false "done".

None of these is perfect. The opposite failure also happens: in one bench task the file was right, but the model never
said done and used its whole step budget.
