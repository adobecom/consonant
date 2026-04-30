# Draft Ticket

Draft a Jira ticket locally for: **$ARGUMENTS**

Writes to `/jira-tickets/<slug>.md` for review. Does NOT create anything in Jira.
When the user is ready to push, they run `/create-ticket` with the same description.

---

## Argument format

`$ARGUMENTS` is one of:
- `eng "what you're building"` — engineering work (component implementation, CSS, spec.json, tokens, Storybook)
- `design "what you're doing"` — design/DS work (Figma authoring, component docs, audits, Figma file updates)
- `mcp "what you're building"` — MCP server work (tools, resources, skills, data pipeline)
- Just a plain description with no type prefix — infer the type from context

---

## Step 1 — Determine type and slug

Parse the type keyword from `$ARGUMENTS`. If none given, infer from whether the description sounds like code, design, or MCP work.

Build a filename slug:
- Start with the type: `eng-`, `design-`, `mcp-`
- Follow with a 2–5 word kebab-case summary of the work
- Example: `design-hosted-prototype-generator`, `eng-button-on-dark-variant`, `mcp-arch-phase2-skills`

---

## Step 2 — Write the draft

Write to `/jira-tickets/<slug>.md`.

Match the format of existing tickets in that directory exactly.

---

### Engineering ticket shape

```markdown
# [ENG] <area>: <short imperative description>

**Type:** eng  
**Estimate:** X pts — <one sentence why>

---

## Background

[1–2 sentences: why this exists. Reference Slack context, audit findings, or a prior ticket if relevant.]

## Scope

* [specific file or area]
* [specific file or area]

## Acceptance Criteria

* [checkable, specific criterion]
* [checkable, specific criterion]
* `npm run storybook:build` passes with zero errors

## Effort

[X story points — one sentence explaining why]
```

**Story points guide:**
- 1 pt — single file change, rename, doc-only
- 2 pts — rename + update imports, small feature, spec.json update
- 3 pts — new component or significant refactor
- 5 pts — multi-component or architectural change

---

### Design ticket shape

```markdown
# [DESIGN] <component or area>: <short imperative description>

**Type:** design  
**Estimate:** X pts — <one sentence why>

---

## Background

[1–2 sentences: what this is and why it matters now.]

## Scope

[What Figma file/page/component set is being touched. Or what the deliverable is.]

## Done When

* [specific, visual or checkable criterion]
* [specific, visual or checkable criterion]

## Figma

[Link to relevant Figma page or component, if known. Omit if not applicable.]

## Effort

[X story points — one sentence explaining why]
```

**Story points guide:**
- 1 pt — small Figma update (rename, icon change, minor property tweak)
- 2 pts — new doc sheet section, variant addition, audit fix
- 3 pts — full component doc sheet, new component set
- 5 pts — major component authoring from scratch

---

### MCP ticket shape

```markdown
# [MCP] <area>: <short imperative description>

**Type:** mcp  
**Estimate:** X pts — <one sentence why>

---

## Background

[1–2 sentences: what capability is missing and why it matters.]

## Scope

* [specific file or module in apps/s2a-ds-mcp/]
* [specific file or module]

## Tools / Resources to Add or Change

[List tool names, resource URIs, or skill files affected.]

## Acceptance Criteria

* [checkable, specific criterion]
* [checkable, specific criterion]

## Effort

[X story points — one sentence explaining why]
```

---

## Step 3 — Output

One line:

**Draft saved** → `jira-tickets/<slug>.md`

Then a one-line summary of what the ticket covers and what to do next:
> Review the draft, then run `/create-ticket <type> "<description>"` to push it to Jira.

No extra commentary unless something was ambiguous and you need to flag it.
