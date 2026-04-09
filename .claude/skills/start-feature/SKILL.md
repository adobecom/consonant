---
name: start-feature
description: Start a new design feature — creates a branch, prototype scaffold, and opens Storybook
argument-hint: "[feature description in plain language]"
---

A designer wants to start working on: **$ARGUMENTS**

Help them get a branch, a scaffold, and a live Storybook preview. Be friendly and skip all technical jargon — they don't need to know what git is doing.

## Your job

Run these steps silently using your bash tools, then give the designer a single friendly summary at the end.

### 1. Sync with latest main

```bash
git checkout main && git pull --ff-only
```

If this fails, tell the designer in plain language and stop.

### 2. Get the GitHub username

```bash
gh api user --jq .login
```

Store as `GH_USER`.

### 3. Create a branch

Slugify the feature name: lowercase, spaces → hyphens, strip special characters, prefix `feat/`.

Example: "nav card hover state" → `feat/nav-card-hover-state`

Also derive a short slug without the `feat/` prefix for file/directory names.

```bash
git checkout -b <branch-name>
git commit --allow-empty -m "feat: start <branch-name>"
git push -u origin <branch-name>
```

### 4. Create the prototype scaffold

Create the component directory and files:

```
packages/components/src/prototyping/<GH_USER>/<feature-slug>/
  <feature-slug>.js     ← Lit component scaffold
  <feature-slug>.css    ← CSS scaffold (semantic tokens only)
apps/storybook/stories/prototyping/<GH_USER>/
  <feature-slug>.stories.js   ← Storybook story
```

**Component JS scaffold** (`packages/components/src/prototyping/<GH_USER>/<feature-slug>/<feature-slug>.js`):

```js
import { html } from "lit";
import "./<feature-slug>.css";

/**
 * <FeatureName> — Prototype
 * Designer: <GH_USER>
 * Branch: <branch-name>
 */
export const <FeatureName> = (args = {}) => {
  const { label = "<FeatureName>" } = args;
  return html`
    <div class="<feature-slug>">
      <span class="<feature-slug>__label">${label}</span>
    </div>
  `;
};
```

**Component CSS scaffold** (`packages/components/src/prototyping/<GH_USER>/<feature-slug>/<feature-slug>.css`):

```css
/* <FeatureName> — Prototype
   Designer: <GH_USER>
   Use semantic tokens only — never hardcode values.
   Token reference: packages/tokens/css/ */

.<feature-slug> {
  display: flex;
  align-items: center;
  padding: var(--s2a-spacing-md);
  background: var(--s2a-color-background-default);
  color: var(--s2a-color-content-default);
}

.<feature-slug>__label {
  font: var(--s2a-typography-body-lg);
}
```

**Storybook story** (`apps/storybook/stories/prototyping/<GH_USER>/<feature-slug>.stories.js`):

```js
import { html } from "lit";
import { <FeatureName> } from "../../../../../packages/components/src/prototyping/<GH_USER>/<feature-slug>/<feature-slug>.js";

export default {
  title: "Prototyping/<GH_USER>/<FeatureName>",
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
  },
};

export const Default = {
  args: { label: "<FeatureName>" },
  render: (args) => <FeatureName>(args),
};
```

Then stage and commit the scaffold:

```bash
git add packages/components/src/prototyping/ apps/storybook/stories/prototyping/
git commit -m "feat: add <feature-slug> prototype scaffold"
git push
```

### 5. Open a draft pull request

```bash
gh pr create --title "feat: <feature-slug> prototype" --draft --body "## Prototype: <feature-name>

Scaffold created via \`/start-feature\`.

**Story:** \`Prototyping/<GH_USER>/<FeatureName>\`
**Preview:** Will be posted automatically once CI runs.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

Store the returned PR URL and extract the PR number for the summary.

### 6. Start Storybook and open the browser

Check if Storybook is already running on port 6006. If not, start it:

```bash
lsof -i:6006 -t || npm run storybook &
```

Wait until it responds (poll with curl, max 60s):

```bash
until curl -s http://localhost:6006 > /dev/null 2>&1; do sleep 2; done
```

Then open the browser at the specific story:

```bash
open "http://localhost:6006/?path=/story/prototyping-<gh_user>-<feature-slug>--default"
```

(Story ID format: title segments lowercased and hyphenated, `--` before the story name.)

### 7. Tell the designer

Give them one clean message — no terminal output, no git details:

---

**You're set up and Storybook is open in your browser.**

Your prototype lives at:
`packages/components/src/prototyping/<GH_USER>/<feature-slug>/`

The story is at:
`apps/storybook/stories/prototyping/<GH_USER>/<feature-slug>.stories.js`

Your draft PR is open at:
`<PR URL>`

Once CI runs, a shareable preview will also be posted there at:
`https://adobecom.github.io/consonant/pr-preview/pr-<number>/`

**What should this component look like?** Describe it — layout, states, interactions, anything — and I'll build it out.

---

Do not show raw command output. Do not explain git. Just give them the summary above and wait for their next message.
