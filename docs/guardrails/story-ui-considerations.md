# S2A Prototyping Guardrails

> Previously titled "Story UI Considerations." The token and component guardrails here apply to all prototype generation — whether you're working in `apps/prototyping/`, writing Storybook stories, or asking Claude to generate markup.

---

## RULE 0: Never invent token names

Only use tokens that exist in the system. If a name isn't in the MCP (`search_tokens`) or compiled CSS, **it does not exist**.

Common mistakes and what to use instead:

| ❌ Invented (does NOT exist) | ✅ Correct token |
|---|---|
| `--s2a-color-background-dark` | `--s2a-color-background-knockout` |
| `--s2a-color-background-black` | `--s2a-color-background-knockout` |
| `--s2a-color-background-night` | `--s2a-color-background-knockout` |
| `--s2a-color-text-*` | `--s2a-color-content-*` |
| `--s2a-color-content-white` | `--s2a-color-content-knockout` |
| `--s2a-color-content-light` | `--s2a-color-content-knockout` |
| `--s2a-spacing-sm` | `--s2a-spacing-xs` (8px) or `--s2a-spacing-lg` (24px) |
| `--s2a-spacing-*px` | Use named scales only — `xs`, `sm`, `md`, `lg`, `xl`, `2xl`… |
| `--s2a-border-radius-*px` | Use named scales only — `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `full` |
| `--s2a-font-size-*` | **Does not exist** — use `--s2a-typography-font-size-*` |

---

## Token hierarchy

```
Primitives  →  Semantic  →  Component
```

- **Primitives** (`--s2a-color-gray-900`, `--s2a-spacing-16`) — never use these in prototypes or components. They are Figma-internal, `designOnly: true`.
- **Semantic** (`--s2a-color-content-default`, `--s2a-spacing-lg`) — always use these.
- **Component** (`--s2a-button-*`) — use only within that component's own CSS.

---

## Spacing tokens

| Token | Value |
|---|---|
| `--s2a-spacing-xs` | 8px |
| `--s2a-spacing-sm` | 12px |
| `--s2a-spacing-md` | 16px |
| `--s2a-spacing-lg` | 24px |
| `--s2a-spacing-xl` | 32px |
| `--s2a-spacing-2xl` | 40px |
| `--s2a-spacing-3xl` | 48px |
| `--s2a-spacing-4xl` | 64px |

---

## Typography tokens

Typography roles are responsive — font-size, letter-spacing, and line-height all change at sm/md/lg/xl breakpoints. Always reference the semantic typography tokens, never the primitive font-size tokens.

```css
/* ✓ correct */
font-size: var(--s2a-typography-font-size-title-1);
letter-spacing: var(--s2a-typography-letter-spacing-title-1);
line-height: var(--s2a-typography-line-height-title-1);

/* ✗ wrong — primitive */
font-size: var(--s2a-font-size-72);
```

Available roles: `super`, `title-1` through `title-6`, `body-lg`, `body-md`, `body-sm`, `body-xs`, `eyebrow`, `label`, `caption`.

---

## Color tokens

### Backgrounds

| Token | Usage |
|---|---|
| `--s2a-color-background-default` | White/default page surface |
| `--s2a-color-background-subtle` | Slightly off-white, secondary surface |
| `--s2a-color-background-knockout` | Black/dark surface |
| `--s2a-color-background-brand` | Adobe brand red surface (rare) |

### Content (text + icons)

| Token | Usage |
|---|---|
| `--s2a-color-content-default` | Primary body text |
| `--s2a-color-content-subdued` | Secondary, de-emphasized text |
| `--s2a-color-content-strong` | High-emphasis text |
| `--s2a-color-content-knockout` | Text on dark surfaces (white) |

---

## Border radius tokens

| Token | Value |
|---|---|
| `--s2a-border-radius-2xs` | 2px |
| `--s2a-border-radius-xs` | 4px |
| `--s2a-border-radius-sm` | 8px |
| `--s2a-border-radius-md` | 12px |
| `--s2a-border-radius-lg` | 16px |
| `--s2a-border-radius-xl` | 24px |
| `--s2a-border-radius-full` | 999px |

---

## Using S2A components

Always import and use the real S2A web components instead of building custom elements from scratch. This keeps prototypes representative of the actual system.

```js
import "../../../../packages/components/src/button/index.js";
```

```html
<s2a-button label="Get started" intent="accent" context="on-dark"></s2a-button>
```

To look up exact props and variant values for any component:

```
get_component_spec "button"
```

---

## Validating your CSS

Run the MCP `validate_css` tool on any CSS before calling a prototype done:

```
validate_css "your CSS string here"  componentName: "feature-name"
```

This will flag:
- Primitive token usage
- Invented or non-existent token names
- Missing `var()` fallbacks

---

## What never to do

- Never hardcode hex colors: `color: #fff` → `color: var(--s2a-color-content-knockout)`
- Never hardcode pixel values: `padding: 24px` → `padding: var(--s2a-spacing-lg)`
- Never use primitive tokens: `--s2a-color-gray-*`, `--s2a-spacing-16`, `--s2a-font-size-72`
- Never use custom element tags not in `packages/components/src/`
- Never add CSS gradients unless the design specifically calls for them and tokens exist for the stops
