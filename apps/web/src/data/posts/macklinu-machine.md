---
date: "2026-10-10"
title: "Let the bot be the bot"
description: "Separate local commit attribution from GitHub App authentication for AI-produced repository work."
topics:
  - GitHub
  - AI
  - TypeScript
---

I want AI-produced repository activity to be visibly attributed to the bot, not passed off as my own. [macklinu-machine](https://github.com/apps/macklinu-machine) is the GitHub App identity for that work. Two skills and a small TypeScript runner handle the local and GitHub sides separately.

## Local commits

The [macklinu-machine skill](https://github.com/macklinu/skills/tree/main/skills/macklinu-machine) sets **both author and committer** to `macklinu-machine[bot]`. Commit mode needs no App key or token. These fields are attribution metadata, not cryptographic proof or a guarantee of signed commits.

<svg class="not-prose mx-auto my-6 block w-full max-w-sm" viewBox="0 0 320 174" role="img" aria-labelledby="machine-commit-title machine-commit-desc" xmlns="http://www.w3.org/2000/svg">
  <title id="machine-commit-title">Local commit attribution</title>
  <desc id="machine-commit-desc">The runner creates a local Git commit with the bot as both author and committer. No App credential is needed.</desc>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="16" y="8" width="288" height="48" rx="4" />
    <path d="M160 56v34m-5-6 5 6 5-6" />
    <rect x="16" y="92" width="288" height="74" rx="4" />
  </g>
  <g fill="currentColor" text-anchor="middle" font-size="16">
    <text x="160" y="38">Runner: commit</text>
    <text x="160" y="122">Local Git commit</text>
    <text x="160" y="147">Bot author + committer</text>
  </g>
</svg>

## Authenticated publication

The [setup-macklinu-machine skill](https://github.com/macklinu/skills/tree/main/skills/setup-macklinu-machine) records the App key path and installation IDs in private local configuration, then adds the checkout's machine-skill instruction. It reuses valid configuration; missing or legacy setup asks for the path to an existing GitHub App RSA PEM. That is not an SSH-agent key.

For pushes and PR/API writes, the runner reads the existing unencrypted local PEM, signs an App JWT, and exchanges it for a fresh installation token limited to the requested repository. Git and `gh` run with that token, not my personal credentials. Local commit metadata does not authenticate publication; the App token does.

<svg class="not-prose mx-auto my-6 block w-full max-w-sm" viewBox="0 0 320 348" role="img" aria-labelledby="machine-publish-title machine-publish-desc" xmlns="http://www.w3.org/2000/svg">
  <title id="machine-publish-title">GitHub App publication</title>
  <desc id="machine-publish-desc">The runner uses the local App RSA PEM to sign a JWT, exchanges it for a repository-limited installation token, then runs Git push or gh PR and API writes as the App.</desc>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="16" y="8" width="288" height="48" rx="4" />
    <path d="M160 56v32m-5-6 5 6 5-6" />
    <rect x="16" y="90" width="288" height="48" rx="4" />
    <path d="M160 138v32m-5-6 5 6 5-6" />
    <rect x="16" y="172" width="288" height="74" rx="4" />
    <path d="M160 246v32m-5-6 5 6 5-6" />
    <rect x="16" y="280" width="288" height="60" rx="4" />
  </g>
  <g fill="currentColor" text-anchor="middle" font-size="16">
    <text x="160" y="38">Local App RSA PEM</text>
    <text x="160" y="120">Runner signs App JWT</text>
    <text x="160" y="202">GitHub issues installation token</text>
    <text x="160" y="227">Requested repository only</text>
    <text x="160" y="306">Git push / gh PR + API</text>
    <text x="160" y="329">Authenticated as the App</text>
  </g>
</svg>

One limit matters: the local key trusts same-user processes. The installation token has limited scope and lifetime, but the long-lived App key is not repository-scoped. This is not a sandbox.

The point is a visible distinction between my work and the bot's work, with separate mechanisms for attribution and permission.
