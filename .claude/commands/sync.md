# Sync

Pull the latest from main so your branch is up to date before you start building.

## Your job

Run these steps silently, then give the designer one clear status line. No git jargon — just tell them what happened and whether they're ready to go.

### 1. Fetch and check

```bash
git fetch origin
git rev-list HEAD..origin/main --count
git log HEAD..origin/main --oneline
```

### 2. If up to date

Tell them:
**You're up to date** — ready to build.

### 3. If behind main

Rebase:

```bash
git rebase origin/main
```

Then tell them:
**Synced** — pulled N new changes from main. Ready to build.

### 4. If rebase conflicts

Do not attempt to resolve automatically. Tell the designer in plain language:

> There's a conflict in [filename]. Two people changed the same thing. Tell me which version to keep and I'll sort it out.

---

Do not show raw git output. Do not explain what rebasing is. Just tell them the outcome.
