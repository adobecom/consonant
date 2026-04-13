---
skill: spec-to-html
description: Generate a Lit function component (JS + CSS + index.js) from a spec.json — enforces data-attribute variant selectors, component token pattern, S2A token bindings with fallbacks, and forced-state support.
command: /spec-to-html <slug | path-to-spec.json>
---

## Why this skill exists

S2A components are built as Lit function components with data-attribute-driven variants and CSS custom property–based component tokens. Writing these by hand is slow and error-prone. This skill generates the three source files (`{slug}.js`, `{slug}.css`, `index.js`) directly from a `spec.json`, enforces the token/fallback pattern, and runs `audit_css` before writing.

**See also:**
- `/figma-to-spec` — extract spec.json from Figma first
- `/audit-tokens <file.css>` — re-audit CSS token usage after edits

---

## Step 0 — Read the spec and reference components

1. Read `packages/components/src/{slug}/{slug}.spec.json`
2. Read `packages/components/src/button/button.js` and `button.css` as the canonical reference for the JS and CSS patterns
3. If the component is under `navigation/`, also read a nearby nav component for sub-folder conventions

---

## Step 1 — Resolve token fallbacks

For every token in `spec.tokenBindings`, resolve its fallback value:

1. Run `check_token_exists` via `s2a-ds` MCP for each token
2. If the token exists and ships in CSS — use it as-is: `var(--s2a-token-name, fallback)`
3. If the token is design-only or flagged in `spec.tokenFlags` — use the best available primitive as fallback with a comment

### Transparent color fallback map

| Token | CSS fallback |
|---|---|
| `--s2a-color-transparent-black-04` | `rgba(0, 0, 0, 0.04)` |
| `--s2a-color-transparent-black-08` | `rgba(0, 0, 0, 0.08)` |
| `--s2a-color-transparent-black-12` | `rgba(0, 0, 0, 0.12)` |
| `--s2a-color-transparent-black-24` | `rgba(0, 0, 0, 0.24)` |
| `--s2a-color-transparent-black-48` | `rgba(0, 0, 0, 0.48)` |
| `--s2a-color-transparent-black-64` | `rgba(0, 0, 0, 0.64)` |
| `--s2a-color-transparent-white-08` | `rgba(255, 255, 255, 0.08)` |
| `--s2a-color-transparent-white-12` | `rgba(255, 255, 255, 0.12)` |
| `--s2a-color-transparent-white-24` | `rgba(255, 255, 255, 0.24)` |
| `--s2a-color-transparent-white-64` | `rgba(255, 255, 255, 0.64)` |

For tokens in `spec.tokenFlags` marked as unresolved, add a comment:
```css
/* ⚠ no semantic token — primitive fallback until --s2a-* alias ships */
```

---

## Step 2 — Generate `{slug}.css`

### Structure

```css
/* ─── Component tokens ──────────── */
.c-{slug} {
  --c-{slug}-bg:    var(--s2a-color-*, fallback);
  --c-{slug}-color: var(--s2a-color-*, fallback);
  /* one custom property per visual decision */
}

/* State overrides — redefine component tokens only */
.c-{slug}:is(:hover, [data-force-state="hover"]) {
  --c-{slug}-bg: var(--s2a-color-*, fallback);
}

/* ─── Root ──────────────────────── */
.c-{slug} {
  display: inline-flex;
  align-items: center;
  /* layout from spec.layout */
  background-color: var(--c-{slug}-bg);
  color: var(--c-{slug}-color);
  /* typography tokens */
  transition: background-color 200ms ease, color 200ms ease;
}

/* ─── Variants ──────────────────── */
.c-{slug}[data-variant-axis="value"] { ... }

/* ─── Disabled ──────────────────── */
.c-{slug}:disabled,
.c-{slug}[data-force-state="disabled"] {
  opacity: var(--s2a-opacity-disabled, 0.48);
  cursor: not-allowed;
  pointer-events: none;
}

/* ─── Focus ─────────────────────── */
.c-{slug}:is(:focus-visible, [data-force-state="focus"]) {
  outline: none;
  box-shadow:
    0 0 0 var(--s2a-spacing-3xs, 2px) var(--s2a-color-background-default, #ffffff),
    0 0 0 var(--s2a-spacing-2xs, 4px) var(--s2a-color-focus-ring-default, #1473e6);
}
```

### CSS rules

- **Component tokens first** — define all visual decisions as `--c-{slug}-*` variables in the root selector before any layout rules
- **State overrides redefine tokens, not properties** — `.c-{slug}:hover { --c-{slug}-bg: ... }` not `.c-{slug}:hover { background-color: ... }`
- **Every token has a fallback** — `var(--s2a-token, hardcoded-fallback)`. Never a bare `var()` without fallback
- **Forced state** — every interactive state has both a real CSS pseudo-class AND a `[data-force-state="..."]` selector so Storybook can force any state
- **Variant selectors** — `[data-{axis}="{value}"]` attribute selectors. Never classes for variants
- **layout from spec** — `height`, `padding`, `border-radius` values come from `spec.layout`. If `borderRadius` is hardcoded (e.g. `75px`), use it directly with a comment: `/* full pill — no token */`
- **Never `!important`** — specificity must stay manageable
- **No ID selectors**

### Mapping spec.layout → CSS

| spec.layout field | CSS property |
|---|---|
| `paddingTop` / `paddingBottom` | `padding-block` or separate `padding-top` / `padding-bottom` |
| `paddingLeft` / `paddingRight` | `padding-inline` or separate `padding-left` / `padding-right` |
| `borderRadius` | `border-radius` |
| `height` + `heightSizing: fixed` | `height: {value}` |
| `width: auto` | `width: auto` (or omit — inline-flex defaults to hug) |
| `direction: horizontal` | `flex-direction: row` (default for inline-flex) |
| `alignItems: center` | `align-items: center` |

---

## Step 3 — Run the CSS audit gate

Before writing any file:

```
audit_css "{generated CSS}"  componentName: "{slug}"
```

- Fix all violations: primitive tokens, missing fallbacks, non-semantic values
- Never write a CSS file that fails `audit_css`
- If a token isn't in S2A, add it to the fallback map and document with a comment — do not fail the build

---

## Step 4 — Generate `{slug}.js`

### Template

```js
import { html, nothing } from "lit";
import "./{slug}.css";

/**
 * {ComponentName} Component
 * Implements matt-atoms {ComponentName} (spec: packages/components/src/{slug}/{slug}.spec.json)
 *
 * @param {Object} args
 * @param {string} args.label - {description from spec}
 * @param {boolean} args.active - {description from spec}
 * @param {boolean} args.disabled - {description from spec}
 * @param {string} args.state - "default" | "active" | "hover" — forced visual state for docs/testing only
 * @param {Function} args.onClick - Click handler
 */
export const {ComponentName} = ({
  label = "{defaultValue from spec}",
  active = false,
  disabled = false,
  state = "default",
  onClick,
} = {}) => {
  const forceState = state && state !== "default" ? state : null;
  const isDisabled = disabled || state === "disabled";

  return html`
    <button
      class="c-{slug}"
      data-force-state=${forceState ?? nothing}
      ?disabled=${isDisabled}
      aria-selected=${active ? "true" : "false"}
      tabindex=${isDisabled ? "0" : nothing}
      role="{spec.a11y.role}"
      type="button"
      @click=${onClick}
    >
      <span class="c-{slug}__label">{label}</span>
    </button>
  `;
};
```

### JS rules

- **Import order**: `lit` first, then CSS, then any child components
- **Named export** matching PascalCase component name — never default export
- **Props from spec.props** — one destructured parameter with defaults matching `spec.props[].defaultValue`
- **`state` prop** → `data-force-state` attribute (for Storybook/docs forced rendering). Never apply `state` directly to ARIA attributes — use `active` for that
- **Variants as `data-*` attributes** — map each variant axis from `spec.variants` to a `data-{axis}` attribute
- **Booleans** — use `?disabled` for the native disabled attribute, `data-*` for others
- **ARIA** — apply the role from `spec.a11y.role`, use `aria-selected` for tabs, `aria-pressed` for toggles (never both)
- **Event handlers** — `@click=${onClick}`, `@keydown` if spec defines keyboard interactions beyond Enter/Space
- **`nothing`** — use for any conditionally absent attribute value: `attr=${condition ? value : nothing}`
- **No DOM queries, no document.querySelector, no manual event listeners** — Lit handles all of this

### Mapping spec.a11y → HTML attributes

| spec.a11y | HTML output |
|---|---|
| `role: "tab"` | `role="tab"` + `aria-selected=${active}` |
| `role: "button"` + toggle | `role="button"` + `aria-pressed=${active}` |
| `wcag: ["2.4.7"]` | `:focus-visible` styles in CSS (never `outline: none` without replacement) |
| Disabled in notes | `tabindex="0"` — disabled tabs stay focusable per APG |

---

## Step 5 — Generate `index.js`

```js
export { {ComponentName} } from './{slug}.js';
```

One line. No docs, no extra exports.

---

## Step 6 — Write files and validate

1. Write all three files to `packages/components/src/{slug}/`
   - For navigation components: `packages/components/src/navigation/{slug}/`
2. Run `validate_spec "{slug}"` to confirm spec matches source
3. Report: files written, any token flags that need follow-up, next steps (Storybook story, etc.)

---

## Non-negotiable rules

- Never use primitive tokens in CSS (`--s2a-spacing-16`, `--s2a-color-gray-500`) — use semantic tokens or hardcoded fallbacks with comments
- Every `var()` has a fallback — no bare `var(--token)` without a fallback value
- Never use `!important`
- Never use classes for variant state — always `data-*` attributes
- Always support `data-force-state` alongside real CSS pseudo-classes
- ARIA attributes come from `spec.a11y` — never invent them
- Disabled elements use `opacity: var(--s2a-opacity-disabled, 0.48)` — never `display: none` or `visibility: hidden`
- Run `audit_css` before writing CSS — this is a hard gate
