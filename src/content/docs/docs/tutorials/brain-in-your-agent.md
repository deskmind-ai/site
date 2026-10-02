---
title: Use Brain in your own agent
description: Call Brain's /v1/systemone API from your own code — a 30-line request, then a decide-act-observe loop that routes on confidence and asks the user when unsure.
sidebar:
  order: 1
---

Brain only decides. It never sees your screen by itself and never acts: your code describes the situation and the
options, Brain picks one and says how sure it is, and your code acts. This page assumes a server is running on
`127.0.0.1:8793` (see the [Quickstart](/docs/start/quickstart/)).

## A first request (about 30 lines)

Python standard library only. One `choice` question and one yes/no (`noul`) question about the same state:

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

A `choice` answer carries the chosen option, a probability for every option, and the `confidence` of the choice; a
`noul` (yes/no) answer is a single number, the probability of yes. With the example above the 4B picks
`invoice-2026-10.pdf` at about 0.97 and puts P(done) near 0.04. See the
[API reference](/docs/reference/systemone-api/) for every field.

## A decide → act → observe loop

The pattern DeskMind's own harness uses, reduced to its shape:

```python
THRESHOLD = 0.9  # tune on your own logged steps

while True:
    state, options = observe()              # your code: what is on screen, what can be done now
    options["ASK"] = "Ask the user: the goal could mean more than one thing here."
    options["DONE"] = "The goal is complete, and the state shows it."
    a = decide(state, options)              # one POST /v1/systemone, as above
    if a["choice"] == "DONE":
        if verify_final_state(): break      # never trust "done" without checking
        continue
    if a["choice"] == "ASK" or a["confidence"] < THRESHOLD:
        answer = ask_user(a)                # or send the step to a stronger model
        continue
    act(a["choice"])                        # your code: click, type, call a tool
```

Three things matter more than the model:
- **Give it the right options.** Brain can only choose from the list you send. If the right action is not in it,
  the answer will be wrong, however confident.
- **Offer ASK and DONE explicitly**, and check the final state yourself before you accept DONE.
- **Route on confidence.** Log steps with their confidence and whether they turned out right, then pick the
  threshold from that log. A probability is the model's confidence, not a guarantee.

Multiple choice removes format errors (there is nothing to parse), not judgement errors.

## Next

- [System One: choices, not guesses](/docs/explanation/system-one/) explains how the probabilities are produced.
- [Architecture](/docs/explanation/architecture/) shows how Eyes, Brain and Hands fit together in the Mac app.
