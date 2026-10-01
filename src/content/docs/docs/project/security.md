---
title: Security
description: How to report a vulnerability privately, and what we care about most.
sidebar:
  order: 2
---

The security policy for every DeskMind repository is
[deskmind-ai/.github/SECURITY.md](https://github.com/deskmind-ai/.github/blob/main/SECURITY.md). This page summarises
it; the file is the source of truth.

## Report privately

Please **do not** open a public issue for a security problem.

1. Open the **Security** tab of the affected repository on GitHub.
2. Choose **Report a vulnerability**.

If you cannot use GitHub, email **security@deskmind.dev**. We aim to acknowledge reports within 7 days.

## What we care about most

- Anything that could send screen contents or user data off the machine unexpectedly.
- The desktop driver (Hands) acting outside the requested task or sandbox.
- Secrets or personal data in released files.

## When you prepare a report

- Use made-up data and a disposable folder, as for any [bug report](/docs/project/contributing/#a-good-bug-report).
- Do not attach real screenshots, traces or documents from your own apps. Describe them, or reproduce the problem
  with synthetic data.

## What runs where

To judge whether something is a leak, it helps to know what is supposed to use the network. By default, inference
runs on your Mac; model downloads and the apps DeskMind operates use the network, and an optional remote escalation
tier receives the requests sent to it. See
[Architecture: what runs locally](/docs/explanation/architecture/#what-runs-locally).
