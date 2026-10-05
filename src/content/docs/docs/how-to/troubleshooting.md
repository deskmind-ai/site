---
title: Troubleshooting
description: Fix failed model downloads, MLX version errors, missing macOS permissions and memory problems.
sidebar:
  order: 1
---

Problems we have seen and documented, with what to do about each. If yours is not here, see
[where to report](/docs/project/contributing/#where-to-report).

## Model downloads

### `hf download` fails with `CAS Client Error`

The error comes from Hugging Face's Xet transfer path. Retry with Xet turned off:

```bash
HF_HUB_DISABLE_XET=1 uv run hf download deskmind/brain-4b --revision g18b-q8 --local-dir models/brain-4b
```

### Hugging Face is slow or unreachable (for example, in mainland China)

Download the same files from ModelScope:

```bash
uvx modelscope download --model gxcsoccer/brain-4b --revision g18b-q8 --local-dir models/brain-4b
uvx modelscope download --model gxcsoccer/brain-0.8b --revision g18b-q8 --local-dir models/brain-0.8b
```

The app does this by itself: if Hugging Face fails, or a file arrives at under about 200 KB/s for its first 30
seconds, it switches to ModelScope and checks the files against the same SHA-256 hashes.

### The app says the model files look incomplete or damaged

Click **Re-download**. The app checks every file again and fetches only what is missing or wrong. An interrupted
download also resumes where it stopped when you click again.

## Every request fails with `Initialization encountered non-uniform length`

This happens with a newer MLX stack than the one the release models were tested with: mlx 0.32.3, mlx-lm 0.32 and
transformers 5.18 made every request fail (HTTP 400). Brain's `pyproject.toml` therefore bounds the versions:

| Package | Bound | Where |
|---|---|---|
| `mlx` | `>=0.32,<0.32.3` | `mlx` extra |
| `mlx-lm` | `>=0.31,<0.32` | `mlx` extra |
| `transformers` | `>=5.17.0,<5.18` | `local` extra |

To fix it, install from Brain's lock file instead of upgrading packages by hand:

```bash
uv sync --extra mlx
```

The lock file pins mlx 0.32.2, mlx-lm 0.31.3 and transformers 5.17.0, the versions the release models were tested
with.

## macOS permissions

Real desktop runs need **Accessibility** and **Screen Recording**.

- **In the app,** the permissions belong to the helper, **DeskMind Hands**, not to DeskMind itself. In System Settings →
  Privacy & Security, drag the DeskMind Hands icon into the Accessibility and the Screen Recording lists and turn on
  the switch next to it. The helper restarts to pick up the change.
- If a run reports that the helper seems to have lost its permissions, check **Accessibility** and **Screen
  Recording** on the app's home screen, then run the task again.
- **Automation** is optional. It lets Finder and TextEdit save and move files in the background, and is granted
  through the system's prompt the first time it is needed.
- **Running Hands from a terminal,** grant Screen Recording and Accessibility to the app Hands runs in (for example
  your terminal), since [Peekaboo](https://github.com/steipete/Peekaboo), the tool Hands uses for screen capture and
  input, runs inside it. Then check what the machine can run with:

  ```bash
  deskmind-hands doctor
  ```

  The mock desktop needs no permissions at all, so it is a good way to tell a permissions problem from anything else.

## Memory and disk

- **Disk:** the 4B is a 4.5 GB download and the 0.8B 0.8 GB. In the app, the decision models take about 5.3 GB and the
  optional vision model about 3.3 GB. The app warns you before the download if less than about 7.5 GB is free.
- **Memory:** the two decision models and their runtime take about 7 GB while they run. On a Mac with less than 12 GB
  the app warns that the model may be slow or fail to load.
- If the app says **Not enough memory**, quit a few memory-hungry apps and click **Retry**.
- The vision model holds about 4 GB while loaded. The app starts it only for runs that may need it and stops it after
  thirty minutes without a run.

Our measurements were made on an M4 Pro with 48 GB. We have not measured smaller machines.

## The app's model server does not start

The **Local model** row on the home screen says what went wrong:

| Message | What to do |
|---|---|
| Port is taken: an old model server may still be running | Click **Retry**; it restarts the server. |
| Not enough memory | Quit memory-hungry apps, then click **Retry**. |
| The model files look incomplete or damaged | Click **Re-download**. |
| The model took over 3 minutes to load | The Mac may be busy. Click **Retry**. |
| The model server quit unexpectedly | Click **Retry**. If it keeps happening, open the log under Developer tools and [report it](/docs/project/contributing/#where-to-report). |

Loading normally takes about 30 seconds after a restart.

## A run in the app fails

| Message | What to do |
|---|---|
| Couldn't see the window this time | The Mac was busy. Wait a moment and run it again. |
| The local model didn't answer in time | Check that **Local model** is ready on the home screen, then run again. |
| The last task is still running | Wait for it to finish, or click **Stop** first. |
| Paused while you use your Mac | Not an error: the app needs the foreground for this step and waits until you leave the mouse and keyboard alone. |

### Reporting a failed run

Under the message, two buttons help:

- **Report on GitHub** opens the "Problem using the app" form with what you asked, how it ended, the steps by kind
  and a folded diagnostics section (numbers and kinds only, no screen content or paths) filled in. Check it, then
  submit it yourself. Nothing is sent from the app.
- **Save Full Log…** saves a .zip on your Mac with the run's trace, a screenshot of every step, the model servers'
  logs and the error. It shows what the report can't, and it also holds what was on your screen, file names and
  your account name, so look through it before you attach any of it.
