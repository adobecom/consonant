# Push

Save your work and send it to GitHub.

## Your job

Stage, commit, and push the designer's changes. Be friendly, skip the git details. End with a reminder to sync next time.

### 1. Check what changed

```bash
git status
git diff --stat
```

If there's nothing to commit, tell them:
**Nothing to push** — no changes since your last save. You're all good.
Then stop.

### 2. Stage changes in the prototyping area

```bash
git add packages/components/src/prototyping/ apps/storybook/stories/prototyping/
```

If `$ARGUMENTS` was provided, use it as the commit message:
```bash
git commit -m "feat: $ARGUMENTS"
```

If no description was given, write a one-line summary based on what `git diff --stat` showed.

### 3. Push

```bash
git push
```

### 4. Tell the designer

**Saved and pushed** → `[branch name]`
[Brief summary of what changed — e.g. "Updated the card padding and hover state"].
Your PR preview will refresh once CI runs.

Next time you sit down to work, type `/sync` first to pull any changes from main.

---

Do not show raw git output. Do not explain commits or branches. Just confirm it worked and remind them to sync next session.
