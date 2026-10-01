---
title: Contributing
description: Where to help, where to report, and what a good bug report or reproduction contains.
sidebar:
  order: 1
---

The organisation-wide guidelines are in
[deskmind-ai/.github/CONTRIBUTING.md](https://github.com/deskmind-ai/.github/blob/main/CONTRIBUTING.md) and apply to
every repository. Each component adds its own setup and test commands in its own `CONTRIBUTING.md`, for example
[brain/CONTRIBUTING.md](https://github.com/deskmind-ai/brain/blob/main/CONTRIBUTING.md). This page summarises them; the
files are the source of truth.

## Ways to help

| What | Why | Repository |
|---|---|---|
| Add a desktop task and its grader | lowest barrier, highest value | [bench](https://github.com/deskmind-ai/bench) |
| Submit your agent's bench results | added to the reference results | [bench](https://github.com/deskmind-ai/bench) |
| Support another app or platform | Windows, Linux, browsers, Office | [hands](https://github.com/deskmind-ai/hands) |
| Better grounding | models, data, evals | [eyes](https://github.com/deskmind-ai/eyes) |
| Faster, better calibrated decisions | serving, training, calibration | [brain](https://github.com/deskmind-ai/brain) |
| Docs, translations, examples | English and Chinese | any |

Start with issues labelled **good first issue**. Each one says which file to change and what "done" looks like.

## Principles

1. **Evidence over opinion.** A change that affects model behaviour comes with before/after numbers on a small targeted
   test set or a bench run.
2. **Local first and private by default.** Never commit real user data, screenshots of your own apps, credentials,
   tokens or raw desktop traces. Keep them in a git-ignored `private/` directory, and redact identifying paths and
   values while keeping enough structure to reproduce.
3. **Honest results.** Report where we lose as clearly as where we win.
4. **Small, focused pull requests.** One change per pull request, matching the surrounding style.

## Where to report

- **Project direction, cross-component setup, unclear ownership, reproduction reports:**
  [deskmind issues](https://github.com/deskmind-ai/deskmind/issues).
- **A bug isolated to one component:** that repository's tracker
  ([brain](https://github.com/deskmind-ai/brain/issues), [eyes](https://github.com/deskmind-ai/eyes/issues),
  [hands](https://github.com/deskmind-ai/hands/issues), [bench](https://github.com/deskmind-ai/bench/issues),
  [app](https://github.com/deskmind-ai/app/issues)).
- **A change spanning repositories:** one coordinating issue in deskmind, linked to focused issues or pull requests in
  each component.
- **Questions and design discussion:** [Discussions](https://github.com/deskmind-ai/deskmind/discussions).
- **Security problems:** not in public. See [Security](/docs/project/security/).

Search first. If a report moves, link the old and new locations instead of opening an unlinked duplicate.

## A good bug report

Include:

1. the smallest goal or request that reproduces it, with made-up data and a disposable folder;
2. exact source revisions, and the model revision and quantization;
3. hardware, macOS version, app versions, system language and display scaling where relevant;
4. the expected and the actual final state, and how often it happens;
5. for desktop runs: which apps and folder were allowed, whether the projection layer, vision mode or remote
   escalation was used, and whether the final state differs from what the agent reported.

For Brain, give the command, the model and a minimal request body, with anything personal removed.

## Benchmarks and reproductions

A failed reproduction is as useful as a successful one. Record:

- the track: Brain, Eyes, end-to-end, or deployment speed;
- fixed source, model and data revisions, and the suite version;
- hardware, OS, runtime, quantization and decoding;
- repeats, retries, limits, routing, and a single pass or two (such as Eyes' zoom pass);
- numerator and denominator, with every attempted run and every exclusion;
- what the timing covers: inference, the request, or the full task.

Compare only matched conditions: keep GPU and MLX runs, single models and routers, and different harness versions
apart. A run on the mock desktop, or one fed the correct answers by a script, checks the wiring; it is not a model score. Never post sealed test items or data you may
not redistribute.

## Pull requests to Brain

From [brain/CONTRIBUTING.md](https://github.com/deskmind-ai/brain/blob/main/CONTRIBUTING.md):

```bash
git clone https://github.com/deskmind-ai/brain && cd brain
uv sync --extra mlx          # Apple Silicon; serving and evals
uv run --group dev pytest -q # must pass before you open a PR
```

- Most issues need no GPU and no models: the tests use a stub server. Training needs a CUDA machine.
- Behaviour changes need before/after numbers: `scripts/probe_ops.py`, `deskmind-brain-eval score`, or a bench run.
- Keep the API stable: `POST /v1/systemone` takes `{state, questions}` and returns `{answers}`. Extend it compatibly.
- A change to how prompts are rendered needs a new `prompt_format` number in `deskmind.json`, because existing models
  are tied to the format they were trained with.
- Training and evaluation data must have a source and licence that allow redistribution.

## Conduct and licence

- Be kind. DeskMind follows the
  [Contributor Covenant 2.1](https://github.com/deskmind-ai/.github/blob/main/CODE_OF_CONDUCT.md). Report conduct
  problems to conduct@deskmind.dev or privately to a maintainer.
- Contributions are licensed under the licence of the repository they go into (Apache-2.0 for code, CC BY 4.0 for
  docs).
