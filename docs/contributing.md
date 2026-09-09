# Contributing to Consonant

## Requesting a token, component, or change

You don't need to write code — or even know how S2A is built — to ask for something. If you need a token, a new component, or a change to an existing one, **[open an S2A Request](../../issues/new?template=s2a-request.yml)**. It's a short form: what you need, why, where it's used, and a Figma link.

**What happens after you file:**

1. **Filed** — your issue lands with the `s2a-request` and `needs-triage` labels.
2. **Triage** — the design-system team reviews open requests **weekly**. We may comment to clarify scope.
3. **Decision** — the request is labeled `approved` (it's on the roadmap) or `declined` (with a reason in the thread). Duplicates get linked to the original.
4. **Tracked** — approved requests become scheduled work; you'll get the delivery link on the thread.

**Before you file:** check that an existing [token](../../tree/main/packages/tokens) or [component](../../tree/main/packages/components) doesn't already cover it, and search [open requests](../../issues?q=is%3Aissue+label%3As2a-request) for a duplicate.

> Full design of the intake pipeline (the in-Figma request tab, the endpoint, and the approve→Jira mirror) lives in [`docs/request-intake-spec.md`](./request-intake-spec.md). This form is the zero-infra v1 of that plan.

---

## First time setup

Clone with submodules initialized in one shot:

```bash
git clone --recurse-submodules https://github.com/adobecom/consonant.git
```

If you already cloned without that flag, run this once from the repo root:

```bash
git submodule update --init
```

You should see `context/milo/` populate with files. If it's still empty after that, check that you have access to the milo repo on GitHub.

---

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
