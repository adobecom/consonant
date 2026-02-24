# Getting Started (Designers)

Quick reference for designers working with the S2A Foundations Library.

---

## Run Storybook

```bash
npm install
npm run storybook
```

Storybook opens in your browser. Browse **Components** to see Button, Button v2, Product Lockup, Marquee, and other components.

---

## Where tokens live

| Location | What’s there |
|----------|--------------|
| `packages/tokens/json/` | Source JSON (from Figma) — usually don’t edit by hand |
| `dist/packages/tokens/css/` | Built CSS files after `npm run tokens:build` |
| `dist/packages/tokens/css/dev/` | Individual token files (e.g. `tokens.semantic.light.css`) |
| `dist/packages/tokens/css/min/` | Minified bundle (`tokens.min.css`) |

Components use `--s2a-*` CSS variables (e.g. `--s2a-spacing-md`, `--s2a-color-content-default`).

---

## Token pipeline (quick steps)

1. **Sync from Figma** — `npm run tokens:sync`  
2. **Build to CSS** — `npm run tokens:build`  
3. **Package for distribution** — `npm run tokens:package` (creates `s2a-tokens-<version>.tgz`)

For details and troubleshooting: [Token Pipeline Runbook](docs/how-tos/runbook-token-pipeline.md).

---

## Figma & design links

- **Source Figma file** (from `packages/tokens/json/metadata.json`):  
  `https://www.figma.com/design/eGSyBcD5XdFXR8rJXJmVNY/`  
  *(S2A — Foundations v0.0.1-alpha)*

- **Figma Variables** — Tokens are synced from Figma Variable Collections. To change tokens, update variables in Figma, then run `npm run tokens:sync` and `npm run tokens:build`.

- **Figma MCP setup** — See [Figma MCP Setup](docs/setup-guides/figma-mcp-setup.md) if you use Cursor/Claude with Figma integration.

---

## Figma → code workflow

For the end-to-end flow (design in Figma → tokens → Storybook → code):

📘 [Figma to Code Workflow](docs/workflows/figma-to-code-workflow.md)

---

## Design system rules

- **Guardrails** — Components use semantic tokens (`--s2a-*`), not raw primitives. See [docs/guardrails/](docs/guardrails/).
- **Component docs** — `story-ui-docs/components/` has usage notes for Button, Product Lockup, etc.
