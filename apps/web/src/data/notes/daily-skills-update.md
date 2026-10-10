---
title: "Daily skill updates with GitHub Actions"
description: "Update agent skills, format changes, and open or update one pull request each day."
date: "2026-10-10"
topics:
  - GitHub Actions
  - Agent skills
---

[Create Pull Request](https://github.com/peter-evans/create-pull-request#action-behaviour) skips empty commits and PRs.

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

Use symlink-based project skills and commit them with `skills-lock.json`. Keep the workflow on the default branch and enable **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**.

Use public skill sources. `GITHUB_TOKEN` does not trigger PR checks; for checks, use a [GitHub App token](https://github.com/peter-evans/create-pull-request/blob/main/docs/concepts-guidelines.md#authenticating-with-github-app-generated-tokens) with Contents and Pull requests write access for both checkout and PR creation.
