# Spec Audit

Audit a component spec.json for API quality — prop naming, variant conventions, a11y completeness, and structural best practices — benchmarked against industry standards from the design-systems knowledge base.

This is **not** a CSS token audit (`/token-audit`) and **not** a Figma normalization audit (`/s2a-component-audit`). It audits the code-side component API in `spec.json`.

## Usage

```
/spec-audit <component-name-or-slug>
/spec-audit --all
```

Examples:
- `/spec-audit button`
- `/spec-audit nav-filter`
- `/spec-audit --all`

---

## Phase 1 — Load the spec

1. If `--all`, find all `packages/components/src/**/*.spec.json` files and run the full audit on each, then produce a summary table at the end.
2. Otherwise, locate `packages/components/src/{slug}/{slug}.spec.json`. If not found, try matching by name. If still not found, stop and tell the user.
3. Read the spec file directly (do not rely on MCP for this — read the raw JSON).

---

## Phase 2 — Query external standards

Run both of these in parallel:

```
search_design_knowledge "{component type}"
search_design_knowledge "{component type} ARIA props variants"
```

Use the component `name` field as the search term (e.g. "Button", "Nav Filter", "Card").

Extract from the results:
- The expected ARIA role for this component type
- Standard prop names the industry uses for this component (e.g. `disabled`, `label`, `variant`, `size`)
- Expected keyboard interactions
- Any variant/state conventions (e.g. whether "state" or "variant" is the conventional axis name)

If no specific match is found, use general component API best practices from the results.

---

## Phase 3 — Run the audit checks

Check the spec against each rule below. Produce a finding only when something is actually wrong — do not report passing checks.

### 3.1 — Required fields

Every spec must have: `name`, `slug`, `figmaNodeId`, `cssClass`, `storybookId`, `description`, `variants`, `props`, `tokenBindings`, `a11y`.

| Severity | Rule |
|---|---|
| High | Missing any required field |
| High | `figmaNodeId` is empty or placeholder |
| Medium | `description` is empty, vague ("A component"), or over one sentence |

### 3.2 — Slug and CSS class

| Severity | Rule |
|---|---|
| High | `slug` is not lowercase-kebab |
| High | `cssClass` does not equal `c-` + slug |
| High | `slug` does not match the directory name |

### 3.3 — Variant axis naming

S2A convention: axis names must be **lowercase single-word or lowercase-kebab**. Common axes: `state`, `size`, `style`, `context`, `orientation`, `breakpoint`.

| Severity | Rule |
|---|---|
| High | Axis name uses Title Case (e.g. `State`, `Size`) |
| High | Axis name is a Figma auto-name (e.g. `Property 1`, `property-1`) |
| Medium | Axis name uses a non-standard term when a standard one applies (e.g. `mode` instead of `context`, `type` instead of `style`) |

### 3.4 — Variant values

All variant values must be **lowercase-kebab**.

| Severity | Rule |
|---|---|
| High | Any value uses Title Case (e.g. `Default`, `OnLight`) |
| High | Any value uses camelCase (e.g. `onLight`, `iconStart`) |
| Medium | Value uses an underscore (`on_light`) instead of a hyphen (`on-light`) |

### 3.5 — Prop naming

All prop names must be **camelCase**. No PascalCase, no kebab-case, no snake_case.

| Severity | Rule |
|---|---|
| High | Prop name uses PascalCase (e.g. `ShowIcon`) |
| High | Prop name uses kebab-case or snake_case |
| Medium | Prop name shadows a native HTML attribute without good reason (e.g. naming a non-boolean `disabled` as a string) |

### 3.6 — Prop shape

Each prop entry must have `name`, `type`, `defaultValue` (except for function types and required fields), and `description`.

| Severity | Rule |
|---|---|
| Medium | Any prop is missing `description` |
| Medium | Any prop with an enum is missing the `enum` field |
| Low | Any non-boolean, non-function prop is missing `defaultValue` |

### 3.7 — Token bindings

| Severity | Rule |
|---|---|
| High | Any token value contains a raw number in its name (e.g. `--s2a-color-gray-900`, `--s2a-spacing-16`) — these are primitives |
| High | Any token value does not start with `--s2a-` |
| Medium | A CSS property key in `tokenBindings` uses a non-standard property name |

Use `check_token_exists` from s2a-ds to verify any token that looks suspicious. Run verifications in parallel — do not await inside a loop.

### 3.8 — A11y completeness

Cross-reference the `a11y` block against what `search_design_knowledge` returned for this component type.

| Severity | Rule |
|---|---|
| High | `a11y.role` is missing or empty |
| High | `a11y.role` does not match the ARIA role the knowledge base identifies for this component type |
| High | `a11y.wcag` is empty |
| Medium | `a11y.keyboard` is empty for an interactive component |
| Medium | A relevant WCAG SC code is missing (compare against knowledge base results) |
| Low | `a11y.notes` is empty |

### 3.9 — Industry benchmark (from design-systems knowledge base)

Compare the spec's props and variants against what the knowledge base returns for this component type. Flag gaps — not as hard errors, but as recommendations.

| Severity | Rule |
|---|---|
| Low | A standard prop for this component type is absent (e.g. Button missing `disabled`, Tab missing `selected`) |
| Low | Variant axis naming diverges from strong industry convention without a documented reason |

---

## Phase 4 — Output

Write results to `docs/audits/{slug}-spec-audit-{YYYY-MM-DD}.md` using this format:

```markdown
# {ComponentName} — Spec Audit ({YYYY-MM-DD})

**Spec:** `packages/components/src/{slug}/{slug}.spec.json`
**Violations:** {total} — {high} high · {medium} medium · {low} low
**Industry reference:** {what design-systems-mcp returned for this component type}

---

## Findings

| # | Severity | Check | Field | Current | Expected |
|---|---|---|---|---|---|
[one row per violation, ordered high → medium → low]

---

## Industry benchmark notes

{Any gaps vs. industry standard props/variants — framed as suggestions, not violations}

---

## Token binding issues

{Only if 3.7 found violations — list each bad binding with the suggested replacement}
```

If there are no violations: write "No issues found." and do not create a file.

For `--all` mode: write individual files per component AND a summary rollup at `docs/audits/spec-audit-summary-{YYYY-MM-DD}.md`:

```markdown
# Spec Audit Summary ({YYYY-MM-DD})

| Component | High | Medium | Low | File |
|---|---|---|---|---|
[one row per component]
```

---

## Rules

- Never modify spec files — flag only, do not fix
- Do not report passing checks — only violations
- Run `check_token_exists` verifications in parallel
- Run `search_design_knowledge` queries in parallel
- Industry benchmark findings (3.9) are **Low** severity — never block
- Always tell the user the output file path when done
