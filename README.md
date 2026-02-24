# S2A Foundations Library

**Spectrum 2 for Adobe.com** — Design tokens, components, and documentation aligned with the Adobe.com redesign (Elliot Coakley’s team).

This Nx monorepo is the starter for the S2A Foundations Library. It provides:

- **Design tokens** — Synced from Figma Variables, built to CSS custom properties
- **Components** — Button, Product Lockup, Marquee, and others
- **Storybook** — Component documentation and testing

---

## What’s in this repo

| Path | Package | Purpose |
|------|---------|---------|
| `packages/tokens` | `s2a-tokens` | Token pipeline: sync from Figma → JSON in `packages/tokens/json/` → CSS custom properties (`--s2a-*`) |
| `packages/components` | `s2a-components` | UI components (Button, Button v2, Product Lockup, Marquee) built with Lit |
| `packages/grid` | `s2a-grid` | Grid layout utilities (placeholder) |
| `apps/storybook` | — | Storybook app for component docs and visual testing |
| `docs/` | — | Workflows, guardrails, how‑tos, setup guides |
| `story-ui-docs/` | — | Design system docs used by Story UI / AI tools |

---

## Quick start

```bash
npm install
npm run storybook     # Start Storybook
npm run tokens:build  # Build design tokens
```

📘 **[GETTING_STARTED.md](GETTING_STARTED.md)** — Designer-focused guide: running Storybook, where tokens live, the token pipeline, and Figma links.

---

## Token pipeline

| Command | Description |
|---------|-------------|
| `npm run tokens:sync` | Pull latest variables from Figma |
| `npm run tokens:build` | Build tokens to CSS (output in `dist/packages/tokens/css/`) |
| `npm run tokens:package` | Create distributable tarball |

📖 **[Token Pipeline Runbook](docs/how-tos/runbook-token-pipeline.md)** — Detailed workflow, troubleshooting, versioning.  
📋 **[Token Pipeline Steps (FigJam)](docs/how-tos/token-pipeline-steps-figjam.md)** — Quick reference cards.

---

## Storybook

- `npm run storybook` — Dev server  
- `npm run storybook:build` — Static build

Components are documented under **Components/** (e.g. Button, Button v2, Product Lockup).

---

## Nx commands

- `nx build tokens` — Build tokens  
- `nx serve storybook` — Serve Storybook  
- `nx graph` — View project graph

---

## Deliverable

The packaged tokens artifact can be consumed as:

```
npm install ./s2a-tokens-<version>.tgz
```

Outputs live in `dist/packages/tokens/css/` (e.g. `tokens.semantic.css`, `tokens.semantic.light.css`, `tokens.semantic.dark.css`).
