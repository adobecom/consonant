---
skill: start-feature
description: Set up a new feature branch, push it, and open a draft PR against main. Posts the Storybook preview URL. For designers starting new work in the consonant repo.
command: /start-feature <feature-description>
---

# Start Feature

Set up a new feature branch and draft PR for a designer. Keep all output friendly — no git jargon.

## Steps

1. Sync with latest main: `git checkout main && git pull --ff-only`
2. Slugify the feature description: lowercase, spaces → hyphens, prefix `feat/`
3. Create and push branch: `git checkout -b <branch> && git push -u origin <branch>`
4. Open draft PR: `gh pr create --draft --title "feat: <description>"`
5. Capture PR number from output

## Output to designer

Give one clean message:

> **You're on a fresh branch and your PR is open.**
>
> Once you push your first change, a live preview will appear at:
> `https://adobecom.github.io/consonant/pr-preview/pr-<number>/`
>
> **What do you want to build?** Describe it and I'll take it from there.

No raw terminal output. No git explanation.
