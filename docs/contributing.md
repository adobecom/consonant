# Contributing to Consonant

## Git Workflow

### Pull latest main

```bash
git checkout main
git pull
```

### Check out your branch

**If it already exists locally:**

```bash
git checkout <branch-name>
```

**If it only exists on GitHub:**

```bash
git fetch
git checkout -t origin/<branch-name>
```

**If you're creating it from main:**

```bash
git checkout -b <branch-name>
```

### Push the branch to GitHub

**First push:**

```bash
git push -u origin <branch-name>
```

**After that:**

```bash
git push
```

### Create the pull request

1. Open GitHub → **Pull requests** → **New pull request**
2. **Base:** `main` (or whatever default is) → **Compare:** `<branch-name>`
3. Add title and description → **Create pull request**

### Add reviewers

- In the PR sidebar → **Reviewers** → add Matthew Huntsberry
- (Optional) Set **Assignees** to whoever's responsible
