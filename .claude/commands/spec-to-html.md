# Spec to HTML

Generate a Lit function component (`{slug}.js` + `{slug}.css` + `index.js`) from a `spec.json`. Enforces the S2A component code pattern: data-attribute variant selectors, component token custom properties, S2A tokens with hardcoded fallbacks, and forced-state support for Storybook.

## Usage

```
/spec-to-html <slug>
/spec-to-html <path/to/spec.json>
```

**Full skill reference:** `.codex/skills/spec-to-html.skill.md`

---

## What gets generated

For a given `spec.json` at `packages/components/src/{slug}/{slug}.spec.json`:

| File | What it contains |
|---|---|
| `{slug}.js` | Lit `html` function component — props, `data-*` attributes, ARIA from spec |
| `{slug}.css` | Component tokens block + state/variant selectors + S2A tokens with fallbacks |
| `index.js` | Single re-export line |

---

## Phase 1 — Read spec and reference

1. Read the target spec: `packages/components/src/{slug}/{slug}.spec.json`
2. Read `packages/components/src/button/button.js` + `button.css` as the canonical code pattern reference
3. Check whether the target directory already has source files — if yes, confirm before overwriting

---

## Phase 2 — Resolve tokens and fallbacks

For every entry in `spec.tokenBindings`:
- Run `check_token_exists` via `s2a-ds` MCP to confirm the token ships in CSS
- Map token to its CSS custom property: `s2a/color/content/default` → `--s2a-color-content-default`
- Assign a hardcoded fallback for every token (see skill for the transparent color map)
- For tokens in `spec.tokenFlags`, add a `/* ⚠ primitive fallback */` comment in CSS

---

## Phase 3 — Generate CSS

Structure:

```
1. Component tokens block (.c-{slug} { --c-*: var(--s2a-*, fallback); })
2. State overrides (redefine component tokens per state, not properties)
3. Root layout rules (from spec.layout)
4. Variant selectors ([data-axis="value"])
5. Disabled (opacity + pointer-events)
6. Focus ring (box-shadow)
```

**Run `audit_css` before writing.** Fix all violations first.

---

## Phase 4 — Generate JS

```js
import { html, nothing } from "lit";
import "./{slug}.css";

export const {ComponentName} = ({ label, active, disabled, state, onClick } = {}) => {
  const forceState = state && state !== "default" ? state : null;
  // ... map props to data-* attributes and ARIA
  return html`<button class="c-{slug}" ...>...</button>`;
};
```

Rules:
- Named export, PascalCase
- `state` prop → `data-force-state` (for Storybook forced rendering only)
- `active` → `aria-selected` (tabs) or `aria-pressed` (toggles)
- All variant axes → `data-{axis}="${value}"` attributes
- Disabled stays focusable (`tabindex="0"`) per APG tab pattern

---

## Phase 5 — Write and validate

1. Write all three files
2. Run `validate_spec "{slug}"`
3. Report files written, open token flags, and next step (Storybook story)
