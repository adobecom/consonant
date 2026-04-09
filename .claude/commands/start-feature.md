# Start Feature

A designer wants to start working on: **$ARGUMENTS**

Help them get a branch, a live preview URL, and a clear starting point. Be friendly and skip all technical jargon — they don't need to know what git is doing.

## Your job

Run these steps silently using your bash tools, then give the designer a single friendly summary at the end.

### 1. Sync with latest main

```bash
git checkout main && git pull --ff-only
```

If this fails, tell the designer in plain language and stop.

### 2. Create a branch

Slugify the feature name: lowercase, spaces → hyphens, strip special characters, prefix `feat/`.

Example: "nav card hover state" → `feat/nav-card-hover-state`

```bash
git checkout -b <branch-name>
git commit --allow-empty -m "feat: start <branch-name>"
git push -u origin <branch-name>
```

### 3. Open a draft PR

```bash
gh pr create --draft \
  --title "feat: $ARGUMENTS" \
  --body "$(cat <<'BODY'
## What this is
<!-- Designer: describe what you're building here -->

## Preview
A live Storybook preview will be posted to this PR automatically once the workflow runs.

🤖 Started with [Claude Code](https://claude.com/claude-code)
BODY
)"
```

Capture the PR number from the output.

### 4. Tell the designer

Give them one clean message — no terminal output, no git details:

---

**You're on a fresh branch and your PR is open.**

Once you push your first change, a live preview will appear at:
`https://adobecom.github.io/consonant/pr-preview/pr-<number>/`

**What do you want to build?** Describe it in plain language — what the component should look like, how it should behave, what problem it solves for the user — and I'll take it from there.

---

Do not show raw command output. Do not explain git. Just give them the summary above and wait for their next message.
