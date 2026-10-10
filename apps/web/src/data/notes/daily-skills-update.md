---
title: "Daily skill updates with GitHub Actions"
description: "Update agent skills, format changes, and open or update one pull request each day."
date: "2026-10-10"
topics:
  - GitHub Actions
  - Agent skills
---

Run [`skills update`](https://github.com/vercel-labs/skills#skills-update) every day at 08:00 UTC, then format with [oxfmt](https://oxc.rs/docs/guide/usage/formatter/cli.html). [Create Pull Request](https://github.com/peter-evans/create-pull-request) commits the changes and updates one PR; no changes means no empty commit or new PR.

```yaml title=".github/workflows/update-skills.yml"
name: Update skills

on:
  schedule:
    - cron: "0 8 * * *"
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

concurrency:
  group: update-skills

env:
  npm_config_yes: "true"

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          ref: ${{ github.event.repository.default_branch }}
      - uses: actions/setup-node@v7
        with:
          node-version: "24"
      - run: npx skills update --project --yes
        env:
          GH_TOKEN: ${{ github.token }}
      - run: npx oxfmt --write .
      - uses: peter-evans/create-pull-request@v8
        with:
          branch: chore/update-skills
          commit-message: "chore: update agent skills"
          title: "chore: update agent skills"
          body: "Daily skill updates, formatted with oxfmt."
```

Use the default symlink installation and commit your project skills and `skills-lock.json` first. Save this workflow on the default branch and enable **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**. The schedule can run late; it is not an exact timer.

This example uses `GITHUB_TOKEN` and public skill sources. Its PRs do not start other workflows; use a [GitHub App token](https://github.com/peter-evans/create-pull-request/blob/main/docs/concepts-guidelines.md#authenticating-with-github-app-generated-tokens) with Contents and Pull requests write access for checkout and PR creation if you need PR checks.
