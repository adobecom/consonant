# S2A Prototyping Setup Guide

This guide gets you set up to build coded prototypes inside the consonant-2 repo using S2A design tokens, components, and AI tooling. The goal is zero friction — you clone once, then describe what you want to build.

---

## Why work inside this repo?

Working inside consonant-2 gives the LLM direct access to everything it needs to generate accurate, token-compliant prototypes:

- **S2A design tokens** — all `--s2a-*` CSS custom properties, built and ready at `dist/packages/tokens/`
- **S2A components** — web components at `packages/components/src/`
- **S2A Design System MCP** (`s2a-ds`) — real-time token lookup, component spec validation, CSS audit
- **Figma Desktop Bridge MCP** (`figma-console`) — read variables and component data from your open Figma file
- **Slash commands + skills** — `/push`, `/sync`, and the full command set at `.claude/commands/`

Without this context, an LLM invents token names, hardcodes values, and produces things that don't match the system. With it, the output is system-accurate on the first pass.

---

## First-time setup

Run the setup script from Terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/adobecom/consonant/main/scripts/prototype-setup.sh)"
```

This will:
1. Install Homebrew, Node 20, GitHub CLI, Claude Code, and Cursor (skipping anything already present)
2. Clone the consonant-2 repo to `~/Desktop/prototyping/consonant/`
3. Install all npm dependencies
4. Build the s2a-ds MCP server
5. Configure `.mcp.json` with all MCP servers
6. Ask for your name and create your personal folder at `apps/prototyping/{your-name}/`
7. Open Cursor with the project

After the script finishes, do the one-time Figma plugin setup (printed at the end).

---

## Creating a prototype

Once you have the repo, scaffold a new prototype from `apps/prototyping/`:

```bash
cd ~/Desktop/prototyping/consonant/apps/prototyping
npm run new
```

You'll be prompted for:
- **Your name** (creates/uses `apps/prototyping/{your-name}/`)
- **Feature name** (e.g. `gnav-redesign`, `firefly-hero`, `homepage-refresh`)

This creates:
```
apps/prototyping/{your-name}/{feature}/
  index.html   ← tokens already imported
  styles.css   ← semantic token reference in comments
  script.js    ← optional component imports
```

---

## Starting the dev server

From inside your prototype folder:

```bash
cd apps/prototyping/{your-name}/{feature}
npx vite
```

Opens at `http://localhost:5173`. Edits live-reload automatically.

---

## Building with Claude

Open Claude Code from the repo root:

```bash
cd ~/Desktop/prototyping/consonant
claude
```

Then describe what you want:

> "Build a dark hero section for Adobe Firefly. Use the product lockup component, a title-1 headline, body-md subtitle, and two buttons — one accent solid, one ghost. Use knockout tokens for text and background."

Claude has access to the token MCP (`s2a-ds`) and will look up real `--s2a-*` token names and component props. The more specific you are about the Figma design (link a frame, describe the layout), the more accurate the output.

---

## Token rules

**Always use semantic tokens. Never hardcode values.**

```css
/* ✓ correct */
background: var(--s2a-color-background-knockout);
padding: var(--s2a-spacing-3xl);
font-size: var(--s2a-typography-font-size-title-1);

/* ✗ wrong — primitive */
background: var(--s2a-color-gray-1000);

/* ✗ wrong — hardcoded */
background: #000;
padding: 48px;
```

If you're not sure which token to use, ask Claude: `"What token should I use for dark surface background?"` or use the MCP directly: `search_tokens "background"`.

---

## Saving and sharing

```bash
/push "prototype: {feature-name}"
```

This commits your files and pushes to GitHub. Your prototype will be at:
```
https://github.com/adobecom/consonant/blob/main/apps/prototyping/{your-name}/{feature}/index.html
```

---

## File structure reference

```
apps/prototyping/
├── CLAUDE.md           ← LLM context + token rules (always loaded)
├── _shared/
│   ├── tokens.css      ← imports all S2A tokens
│   └── base.css        ← optional lightweight reset
├── _template/          ← starter files (used by npm run new)
└── {your-name}/
    └── {feature}/
        ├── index.html
        ├── styles.css
        └── script.js
```

---

## Available S2A components

Import any of these in `script.js`:

| Tag | Import |
|---|---|
| `<s2a-button>` | `packages/components/src/button/index.js` |
| `<s2a-icon-button>` | `packages/components/src/icon-button/index.js` |
| `<s2a-product-lockup>` | `packages/components/src/product-lockup/index.js` |
| `<s2a-app-icon>` | `packages/components/src/app-icon/index.js` |
| `<s2a-elastic-card>` | `packages/components/src/elastic-card/index.js` |
| `<s2a-router-marquee-item>` | `packages/components/src/router-marquee-item/index.js` |
| `<s2a-nav-filter>` | `packages/components/src/nav-filter/index.js` |
| `<s2a-progress-bar>` | `packages/components/src/progress-bar/index.js` |
| `<s2a-rich-content>` | `packages/components/src/rich-content/index.js` |

For exact prop names and variant values: `get_component_spec "button"` in Claude.

---

## Troubleshooting

**Tokens not resolving** — Make sure the token CSS import is in your `index.html` before any custom styles. The `_template/` starter already has this wired correctly.

**Component not found** — Check the import path is relative to your prototype file. Use `../../..` to navigate up from `{name}/{feature}/` to the repo root.

**Claude inventing token names** — Remind Claude: "Only use tokens from the s2a-ds MCP. Run `search_tokens` before writing any `var(--s2a-*)` reference."

**Dev server port conflict** — Another prototype is already running on 5173. Run `npx vite --port 5174` to use a different port.
