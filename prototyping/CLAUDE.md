# S2A Prototyping Space

This is your personal sandbox for building coded prototypes using the S2A Design System. You are inside the consonant-2 monorepo, which means you have direct access to:

- **All S2A design tokens** — compiled CSS custom properties at `dist/packages/tokens/css/min/tokens.min.css`
- **S2A components** — web components at `packages/components/src/`
- **S2A Design System MCP** (`s2a-ds`) — look up any token, component spec, or validate your CSS in real time
- **Figma Desktop Bridge MCP** (`figma-console`) — read variables and component data directly from your open Figma file
- **Slash commands** — `/sync`, `/push`, and the full command set at `.claude/commands/`

---

## Your space

Prototypes live at `apps/prototyping/{your-name}/{feature-name}/`. Each feature gets its own folder.

**Scaffold a new prototype:**
```bash
cd apps/prototyping
npm run new
```
It will ask for your name and a feature name, then create the folder with tokens pre-wired.

**Start the dev server** (from inside any prototype folder):
```bash
cd apps/prototyping/{your-name}/{feature-name}
npx vite
```
Opens at `http://localhost:5173`. Edits live-reload automatically.

---

## Token rules — non-negotiable

**Always use semantic tokens. Never use primitive tokens or hardcoded values.**

```css
/* ✓ correct */
color: var(--s2a-color-content-default);
padding: var(--s2a-spacing-lg);
border-radius: var(--s2a-border-radius-md);

/* ✗ wrong — primitive token */
color: var(--s2a-color-gray-900);

/* ✗ wrong — hardcoded */
color: #292929;
padding: 24px;
```

**Quick token reference:**

| Category | Tokens |
|---|---|
| Spacing | `--s2a-spacing-xs` (8px) · `-sm` (12) · `-md` (16) · `-lg` (24) · `-xl` (32) · `-2xl` (40) · `-3xl` (48) · `-4xl` (64) |
| Type size | `--s2a-typography-font-size-title-1` … `title-6`, `body-lg/md/sm/xs`, `eyebrow`, `label`, `caption` |
| Letter spacing | `--s2a-typography-letter-spacing-title-1` … (responsive — changes at sm/md/lg/xl breakpoints) |
| Line height | `--s2a-typography-line-height-title-1` … |
| Color bg | `--s2a-color-background-default` · `-subtle` · `-knockout` · `-brand` |
| Color fg | `--s2a-color-content-default` · `-subdued` · `-knockout` · `-strong` |
| Border radius | `--s2a-border-radius-2xs` (2px) · `-xs` (4) · `-sm` (8) · `-md` (12) · `-lg` (16) · `-xl` (24) · `-full` (999) |
| Shadow | `--s2a-shadow-level-1-*` … `level-4-*` (x, y, blur, spread, color) |

**To look up any token**, use the MCP: `search_tokens "spacing"` or `get_token_collection "semantic"`.

---

## Responsive typography

Typography tokens change at breakpoints. Import the responsive CSS files if you need accurate sizing:

```html
<link rel="stylesheet" href="../../_shared/tokens.css">
<!-- optionally add responsive overrides: -->
<link rel="stylesheet" media="(min-width: 768px)"  href="../../../../dist/packages/tokens/css/dev/tokens.responsive.md.css">
<link rel="stylesheet" media="(min-width: 1024px)" href="../../../../dist/packages/tokens/css/dev/tokens.responsive.lg.css">
<link rel="stylesheet" media="(min-width: 1200px)" href="../../../../dist/packages/tokens/css/dev/tokens.responsive.xl.css">
```

---

## Using S2A components

Components are web components — no framework needed. Import and use directly:

```js
// script.js
import "../../../../packages/components/src/button/index.js";
import "../../../../packages/components/src/product-lockup/index.js";
```

```html
<!-- index.html -->
<s2a-button label="Get started" intent="accent" context="on-dark"></s2a-button>
<s2a-product-lockup app="firefly" label="Adobe Firefly" context="on-dark"></s2a-product-lockup>
```

**Available components:**
- `s2a-button` — primary, secondary, accent, on-light/dark
- `s2a-icon-button` — icon-only button
- `s2a-product-lockup` — app icon + label combination
- `s2a-app-icon` — standalone app icon
- `s2a-elastic-card` — expandable card
- `s2a-router-marquee-item` — navigation strip item
- `s2a-nav-filter` — filter chip set
- `s2a-progress-bar` — loading indicator
- `s2a-rich-content` — structured content block

To get exact prop names and variants for any component: `get_component_spec "button"`

---

## Describing what you want

When you open Claude Code in this directory, describe your prototype in plain language:

> "Build a hero section with a dark background, Adobe Firefly product lockup, a title-1 headline, body-md subtitle, and two buttons — one accent solid and one ghost."

Claude has access to the token MCP and will use real `--s2a-*` tokens automatically. The more you reference the Figma file (via the Figma Desktop Bridge), the more accurate the output.

---

## Saving and sharing

```bash
# Save your work
/push "prototype: {your-feature-name}"

# Your file will be available at:
# https://github.com/adobecom/consonant/blob/main/apps/prototyping/{name}/{feature}/index.html
```

For a shareable preview, push to your branch and use GitHub Pages or share the raw file with your team.

---

## File structure

```
apps/prototyping/
├── CLAUDE.md           ← you are here
├── _shared/
│   ├── tokens.css      ← imports all S2A tokens (already wired into each prototype)
│   └── base.css        ← optional reset
├── _template/          ← copy this to start fresh (or use `npm run new`)
└── {your-name}/
    └── {feature}/
        ├── index.html
        ├── styles.css
        └── script.js
```
