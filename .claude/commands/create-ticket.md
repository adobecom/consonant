# Create Ticket

Create a Jira ticket in MWPW for: **$ARGUMENTS**

## Argument format

`$ARGUMENTS` is one of:
- `eng "what you're building"` — engineering work (component implementation, CSS, spec.json, tokens, Storybook)
- `design "what you're doing"` — design/DS work (Figma authoring, component docs, audits, Figma file updates)
- Just a plain description with no type prefix — infer the type from context, default to `design`

Parse the type keyword first, then the description. If no type is given, make a reasonable call based on whether the description sounds like code work or design work.

---

## Step 1 — Find the current user's Jira username (design tickets only)

For `design` tickets, look up the current user to set as assignee:

Use corp-jira `search_jira_issues` with:
```
jql: "assignee = currentUser() ORDER BY created DESC"
maxResults: 1
fields: ["assignee"]
minimizeOutput: false
```

Pull `assignee.name` from the result. If this fails, skip the assignee field and note it in the output.

For `eng` tickets, skip this step entirely — leave the ticket unassigned so it lands in the backlog for the team to claim.

---

## Step 2 — Build the ticket fields

**Fields that apply to both types:**
- `project`: `{ "key": "MWPW" }`
- `issuetype`: `{ "id": "7" }` (Story)
- `customfield_12900`: `{ "id": "185404" }` (Team = Consonant — required)
- `customfield_11800`: `"MWPW-188889"` (Epic Link — [C2] Foundations - Taxonomy | Atomic & Block Library — required for board visibility)
- `assignee`: `{ "name": "<username from step 1>" }` (design only — omit for eng)
- `priority`: `{ "name": "Normal" }`

**Additional fields for `eng` tickets only:**
- `labels`: `["needs-prioritization", "eng", "eng-review", "c2-site-redesign-2026", "c2-wave1"]`

---

### Engineering ticket shape

Use this when the work is: implementing a component, renaming files, updating spec.json, fixing CSS, Storybook changes, token pipeline work, or anything in the repo.

**Summary format:** `area: short imperative description`
Examples:
- `grid: rename grid.css → s2a-layout-grids.css`
- `button: add on-dark token variant`
- `spec: add figmaNodeId to RouterMarqueeItem`

**Description template:**
```
h3. Background

[1–2 sentences: why this exists. Reference Slack context, audit findings, or a Jira ticket if relevant.]

h3. Scope

* [specific file or area]
* [specific file or area]

h3. Acceptance Criteria

* [checkable, specific criterion]
* [checkable, specific criterion]
* {{npm run storybook:build}} passes with zero errors

h3. Effort

[X story points — one sentence explaining why]
```

**Story points guide for eng:**
- 1 pt — find-and-replace, single file rename, doc-only change
- 2 pts — rename + update all imports, small new feature, spec.json update
- 3 pts — new component or significant refactor
- 5 pts — multi-component work or architectural change

---

### Design ticket shape

Use this when the work is: Figma component authoring, doc sheet creation, Figma file cleanup, design audits, annotation sheets, or anything that lives primarily in Figma.

**Summary format:** short imperative, component or area first
Examples:
- `NavCard: add doc sheet (Anatomy, Properties, a11y)`
- `Figma file: rename component pages to match s2a- convention`
- `Button: add on-dark variant to component set`

**Description template:**
```
h3. What

[One sentence: what is being made or changed.]

h3. Why

[One sentence: what this unblocks or why it matters now.]

h3. Done when

* [specific, visual or checkable criterion]
* [specific, visual or checkable criterion]

h3. Figma

[Link to the relevant Figma page or component, if known. Otherwise omit this section.]

h3. Effort

[X story points — one sentence explaining why]
```

**Story points guide for design:**
- 1 pt — small Figma update (rename, icon change, minor property tweak)
- 2 pts — new doc sheet section, variant addition, audit fix
- 3 pts — full component doc sheet, new component set
- 5 pts — major component authoring from scratch

---

## Step 3 — Create the ticket

Call corp-jira `create_jira_issue` with the fields from step 2.

Fill in the description template using the description from `$ARGUMENTS` plus any relevant context from the current conversation. Be specific — don't leave template placeholders empty. If the user gave you a thin description, infer reasonable details from the context you have.

Do NOT include `customfield_10016` (story points) — it's not on the MWPW create screen. Mention the point estimate in the description instead.

---

## Step 4 — Output

One line:

**[MWPW-XXXXX]** created — _summary_ → `https://jira.corp.adobe.com/browse/MWPW-XXXXX`

If story points couldn't be set, add: "Set story points manually — field isn't on the create screen."

No extra commentary unless there was an error.
