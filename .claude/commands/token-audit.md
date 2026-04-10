# Token Audit

Run an S2A design token audit against a CSS file and save the results to `docs/audits/`.

## Usage

```
/token-audit <path/to/file.css>
```

## Steps

### 1. Read the file

Read the CSS file at the path provided in `$ARGUMENTS`. If the file doesn't exist, stop and tell the user.

### 2. Derive names

- **Component name:** the filename without extension (e.g. `router-marquee.css` → `router-marquee`)
- **Output filename:** `docs/audits/<component-name>-token-audit-<YYYY-MM-DD>.md` using today's date

### 3. Run the audit

Call `mcp__s2a-ds__audit_css` with:
- `css`: the full file contents
- `componentName`: the component name derived above

### 4. Write the markdown file

Write a file to `docs/audits/<component-name>-token-audit-<date>.md` using this format:

```markdown
# <ComponentName> — Token Audit (<YYYY-MM-DD>)

**File:** `<path/to/file.css>`
**Violations:** <total> total — <critical> critical · <high> high · <medium> medium

---

## Summary

| Category | Count |
|---|---|
| Color | N |
| Spacing | N |
| Font size | N |
| Line height | N |
| Letter spacing | N |
| Blur | N |
| Border radius | N |

---

## Critical

> Hardcoded values with no token binding — highest risk for theme/context failures.

| Line | Selector | Property | Value | Suggested |
|---|---|---|---|---|
[one row per critical violation]

---

## High

> Primitive tokens used directly — should alias through semantic tokens.

| Line | Selector | Property | Current | Semantic alias |
|---|---|---|---|---|
[one row per high violation]

---

## Medium

> Hardcoded px dimensions and numeric primitive tokens — mechanical replacements.

| Line | Selector | Property | Value | Suggested token |
|---|---|---|---|---|
[one row per medium violation]

---

## New tokens needed

List any violations where resolution.type === "suggest-new", with the suggested token name and value.

| Suggested token | Value | Add to |
|---|---|---|
[one row per suggestion]
```

Fill every table from the audit results. Do not omit violations. If a section has no violations, write "None."

### 5. Tell the user

One line:

**Audit saved** → `docs/audits/<component-name>-token-audit-<date>.md`
`<total>` violations — `<critical>` critical · `<high>` high · `<medium>` medium
