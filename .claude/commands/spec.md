# Spec Generator

Generate a full S2A design spec suite (Structure, Color, API, Index) for a Figma component using the figma-console MCP.

## Goals: how this pairs with component docs

| Layer | Command | Purpose |
| --- | --- | --- |
| **Design-time spec frames** | `/spec` | Dense **Structure**, **Color**, **API**, and **Index** frames next to the component — anatomy numbers, token-bound fills, prop definitions, quick navigation. Optimized for **design QA** and handoff. |
| **Human onboarding + a11y + usage** | `/component-docs` | Five **`.sheet frame`** sections (Anatomy, Properties, Layout, Accessibility, Usage) with ELI5-style guidance, live previews, and WCAG-oriented copy. Optimized for **learning and adoption**. |

Both should **read live data** from the component (variants, `componentPropertyDefinitions`, bound variables) and **never** invent tokens. Both keep edits **off** the published component instance (new frames only).

**Screenshots:** Do **not** mix long `figma_execute` sessions with many `figma_capture_screenshot` calls in one thread — see `docs/workflows/codex-figma-console-context.md` (Phase A = build, Phase B = new session or manual export).

## Usage
```
/spec <figma-url>
```

## Steps

1. Extract the `node-id` from the URL (e.g. `node-id=3271-2266` → `3271:2266`)
2. Extract the `file key` from the URL (the segment after `/design/`)
3. Check MCP connection with `figma_get_status` — if not connected, tell the user to open Figma Desktop and run the Desktop Bridge plugin
4. Use `figma_execute` to find the node across all pages:
   ```js
   await figma.loadAllPagesAsync();
   const targetPage = figma.root.children.find(p => p.findOne(n => n.id === 'NODE_ID'));
   await figma.setCurrentPageAsync(targetPage);
   const target = figma.currentPage.findOne(n => n.id === 'NODE_ID');
   return { name: target.name, type: target.type, variants: 'children' in target ? target.children.length : 0 };
   ```
5. Run **Structure Spec** — use `figma_execute` with the structure spec code (anatomy, dimensions, variants, layer walk). Place the frame at `target.x + target.width + 80, target.y`.
6. Run **Color Spec** — use `figma_execute` with the color spec code. Resolve token names with `figma.variables.getVariableByIdAsync`. Place below structure spec.
7. Run **API Spec** — use `figma_execute` with the API spec code. Extract `componentPropertyDefinitions` for real prop names/defaults. Place below color spec.
8. Run **Spec Index** — use `figma_execute` to create the blue index frame above all three specs.
9. **Screenshots (optional):** Prefer finishing all spec frames first, then either export from Figma or use **Phase B** in a **new** chat: one `figma_capture_screenshot` per message, **FRAME** nodes only, `scale: 1` — never PAGE. See `docs/workflows/codex-figma-console-context.md`.
10. Report a summary table of what was found (node ids, token coverage, props).

## Rules
- **Load fonts first** — pre-load Inter Regular/Bold + Adobe Clean Regular/Bold + Adobe Clean Display Black before any text operation. See `docs/workflows/figma-plugin-patterns.md §1`.
- **`createInstance()` is on COMPONENT nodes, not COMPONENT_SET.** Get a specific variant first. See `docs/workflows/figma-plugin-patterns.md §2`.
- Always use `figma.setCurrentPageAsync` (not `figma.currentPage =`)
- Always use `figma.variables.getVariableByIdAsync` (not the sync version)
- Always reassert `primaryAxisSizingMode = 'AUTO'` after `resize()`.
- Always set `layoutSizingHorizontal = 'FILL'` after appending to a layout parent.
- Never modify the original component — read only, write new frames only
- Place spec frames to the right of the component, stacked vertically with 40px gaps
- Remove and recreate any existing spec frames with the same name (idempotent)
- Check `docs/guardrails/no-primitives-in-components.md` before writing any code
- **Plugin patterns reference**: `docs/workflows/figma-plugin-patterns.md`
