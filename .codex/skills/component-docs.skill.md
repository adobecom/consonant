---
skill: component-docs
description: Build the S2A in-Figma tech spec kit (Anatomy, Properties, Layout, Accessibility, Usage) via figma-console MCP — ELI5 onboarding, padding/gap/margin semantics (spacing tokens), Specs-style measures, live instances, POUR/a11y; callouts off the component set; mirror Storybook/repo where applicable.
command: /component-docs <component-name> [figma-url]
---

## Why this skill exists
Designers and engineers need a **repeatable technical spec** inside Figma: plain-language **usage + workflow + accessibility (POUR)** alongside **properties, layout (padding / gap / parent-owned margin story), and token maps**, always grounded in **live component data** (not invented props). Doc frames use `.sheet frame` + `.step` + `buildDocTable()` + Specs-style measures; callouts stay **outside** the published component so MCP/codegen stay clean. Downstream, align the same narrative with repo / Storybook as the executable contract.

**Full playbook (process + template + checklist):** `docs/workflows/in-figma-component-documentation.md`

---

## Voice & copy guidelines (apply to every text node you write)

These docs are read by designers, engineers, and product people — not just Figma maintainers. Write like an educator explaining something to a smart person who is new to this component, not like a plugin dumping internal data.

### The core rule
**Say what something does and why it matters. Then give the technical detail.**
Not: `INSTANCE_SWAP prop (Icon Start#2781:497) · optional via Show Icon Start boolean`
But: `Optional leading icon — turn it on with the "Show Icon Start" property. Always matches the label color.`

### Specific replacements

| Instead of | Write |
| --- | --- |
| `INSTANCE_SWAP prop (Name#nodeId)` | `"Optional [thing] — turn it on with the "[Property Name]" property"` |
| `BOOLEAN prop` / `boolean` | `"on/off toggle"` or `"turn it on with the '[Prop]' property"` |
| `HORIZONTAL auto-layout` | `"lays elements side by side"` or describe the visual behavior |
| `VERTICAL auto-layout` | `"stacks elements top to bottom"` |
| `Not in Figma` | `"Browser/code only — not visible in Figma's design canvas"` |
| `.Button/Core/Primary` in body copy | Just say `"the button"` — reserve internal names for tables |
| `Background=solid, Context=on-light, State=default` | `"default state — solid style on a light background"` |
| `State tokens auto-resolve` | `"when state changes, the token automatically updates — you set it once"` |
| `#nodeId suffixes` | Never surface these in doc copy |
| `counterAxisSizingMode`, `primaryAxisSizingMode` | Never use these in doc copy |

### What to keep
- **Token names** (`s2a/color/button/background/primary/solid/on-light/default`) — engineers need these exact strings. Keep them in tables and callouts.
- **WCAG SC codes** — cite them, but always add a one-line plain-language summary alongside.
- **Property names as they appear in the Figma right panel** (`"Show Icon Start"`, `"Size"`, `"State"`) — these are the user-facing handles, so use them.
- **CSS property names** (`padding`, `gap`, `border-radius`) — engineers rely on these.

### Tone
- Educator voice: short sentences, active verbs, zero filler.
- If something is browser/code-only (focus rings, ARIA roles), say so clearly — engineers need to know what's in Figma vs what they implement.
- If something has a constraint ("Accent is solid/on-light only"), explain *why* briefly: `"there's no dark-surface version — the Accent color set wasn't validated for on-dark contrast."`
- Avoid walls of text. One sentence for the what, one for the why. Then the table.

---

## Codex session setup (required — avoids context blow-ups)
`figma_capture_screenshot` returns **full PNG bytes in the chat transcript**. In a long Codex thread (hundreds of `figma_execute` calls + huge tool JSON), **one screenshot can exceed the model context** even if the frame is “only” ~200KB PNG.

**Do this every time:**

| Phase | When | What |
| --- | --- | --- |
| **A — Build** | Same Codex thread | `figma_get_status`, all `figma_execute` work, sheets populated. **No** `figma_capture_screenshot`. |
| **B — Capture** | **New Codex thread** (fresh session) | Paste **only** the list of sheet frame node ids + `figma_get_status`. Then **one** `figma_capture_screenshot` per message (or export PNGs manually from Figma). |

**End Phase A** by returning to the user: sheet names + **node ids** (e.g. `3885:713` for `.Link — Anatomy`) and “open Phase B in a new thread.”

Also run **`/figma-safe-exec`** (skill `figma-console-safe-execution`) in the agent prompt whenever executions are large or flaky.

## Prerequisites
1. Run `figma_get_status`. If disconnected, tell the user: *”Open Figma Desktop → Plugins → Development → figma-desktop-bridge → Run.”*
2. If a Figma URL is provided, extract the node ID (`node-id=2103-1771` → `2103:1771`).
3. **Load all fonts at the top of every script** — missing fonts cause `Cannot write to node with unloaded font`:
   ```js
   await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
   await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
   await figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Black' }); // title-4 ← NOT ExtraBold
   await figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' });
   await figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' });
   ```
4. Before touching the document:
   ```js
   await figma.loadAllPagesAsync();
   const vars = await figma.variables.getLocalVariablesAsync();
   const styles = await figma.getLocalTextStylesAsync();
   ```

## Required assets from the Scaffolding page
| Asset | Node ID | Use |
| --- | --- | --- |
| `.sheet frame` Size=Default | `2081:39858` | 2000×2000 desktop sheet |
| `.sheet frame` Size=Large | `2081:39861` | 4240×3440 for long layouts |
| `.step` bullet | `2914:4879` | Numbered circles for callouts |
| `.doc-table` reference | (duplicate via `buildDocTable()`) | For props, keyboard tables |

## Style + token guardrails
**Text styles** (apply via `setTextStyleIdAsync` only):
- Title: `s2a/typography/title-4` → `S:5cf014300bccf1230a6e660f60bd4f4252a72816,`
- Eyebrow: `s2a/typography/eyebrow` → `S:152b1b57fb441ccfd288060043e1cd0a4365737f,`
- Body copy: `s2a/typography/body-lg` → `S:565931e51de6b933b7b1e79eec5803a05e080e86,`
- Labels: `s2a/typography/label` → `S:536bbf234b1a0a717cffe0e3c578fb0052669086,`
- Captions: `s2a/typography/caption` → `S:e572ca6995cb534da839d4c8bef75ec523efeb6f,`

**Color tokens** (resolve via `getVariableByIdAsync` and bind with `setBoundVariableForPaint`):
- Sheet background: `s2a/color/background/subtle` (`VariableID:6:47`)
- Cards/rows: `s2a/color/background/default` (`VariableID:6:49`)
- Dividers: `s2a/color/border/subtle` (`VariableID:6:22`)
- Text: `s2a/color/content/title`, `content/subheading`, `content/default`, `content/body-subtle`, `content/label`, `content/caption`, `content/strong`

**Never use raw hex values or primitives.** If a semantic token doesn’t exist, note the gap and escalate.

## Canonical doc table helper

**PERFORMANCE CRITICAL:** Always prefetch all variables with `Promise.all` at the top of the script. Calling `getVariableByIdAsync` inside a loop (per cell, per row) accumulates 30–80+ round trips and causes timeout errors. See `docs/workflows/figma-plugin-patterns.md §10`.

```js
// ── Top of script: prefetch ALL variables once ────────────────────────────
const [vBorderSubtle, vBgDefault, vBgSubtle, vContentLabel, vContentDef,
       vContentSubhead, vContentTitle, vContentCaption] = await Promise.all([
  figma.variables.getVariableByIdAsync('VariableID:6:22'),
  figma.variables.getVariableByIdAsync('VariableID:6:49'),
  figma.variables.getVariableByIdAsync('VariableID:6:47'),
  figma.variables.getVariableByIdAsync('VariableID:2483:41392'),
  figma.variables.getVariableByIdAsync('VariableID:6:82'),
  figma.variables.getVariableByIdAsync('VariableID:2483:41397'),
  figma.variables.getVariableByIdAsync('VariableID:2483:41398'),
  figma.variables.getVariableByIdAsync('VariableID:2483:41395'),
]);
const LABEL_STYLE = 'S:536bbf234b1a0a717cffe0e3c578fb0052669086,';
const BODY_LG     = 'S:565931e51de6b933b7b1e79eec5803a05e080e86,';
const _P = { type: 'SOLID', color: { r: 1, g: 1, b: 1 } };
function sf(node, v) {
  node.fills = [figma.variables.setBoundVariableForPaint(_P, 'color', v)];
}
function applyBottomStroke(node) {
  node.strokes = [figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', vBorderSubtle
  )];
  node.strokeTopWeight = 0; node.strokeBottomWeight = 1;
  node.strokeLeftWeight = 0; node.strokeRightWeight = 0;
  node.strokeAlign = 'INSIDE';
}

// ── Table builder (no getVariableByIdAsync inside) ────────────────────────
async function buildDocTable(name, rows, colWidths) {
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const table = figma.createFrame();
  table.name = name;
  table.layoutMode = 'VERTICAL';
  table.itemSpacing = 0;
  table.primaryAxisSizingMode = 'AUTO';
  table.counterAxisSizingMode = 'FIXED';
  table.resize(tableWidth, 100);
  table.primaryAxisSizingMode = 'AUTO'; // reassert after resize()
  table.fills = [];
  table.strokes = [];

  for (const { cells, isHeader } of rows) {
    const row = figma.createFrame();
    row.layoutMode = 'HORIZONTAL';
    row.itemSpacing = 0;
    row.resize(tableWidth, 40);
    table.appendChild(row);              // append BEFORE layoutSizingHorizontal
    row.layoutSizingHorizontal = 'FILL';
    sf(row, vBgDefault);                 // sync — no await
    applyBottomStroke(row);              // sync — no await

    for (let ci = 0; ci < cells.length; ci++) {
      const cell = figma.createFrame();
      cell.layoutMode = 'VERTICAL';
      cell.paddingTop = 8; cell.paddingRight = 16;
      cell.paddingBottom = 8; cell.paddingLeft = 16;
      cell.fills = [];
      cell.resize(colWidths[ci], 40);
      cell.primaryAxisSizingMode = 'AUTO'; // reassert after resize()

      const text = figma.createText();
      text.characters = String(cells[ci]);
      text.textAutoResize = 'HEIGHT';
      text.resize(colWidths[ci] - 32, text.height);

      await text.setTextStyleIdAsync(isHeader ? LABEL_STYLE : BODY_LG); // only await
      sf(text, isHeader ? vContentLabel : vContentDef);                  // sync
      cell.appendChild(text);
      row.appendChild(cell);
    }
  }
  return table;
}
```

## API gotchas (verified against matt-atoms, March 2026)

- **`createInstance()` is on COMPONENT, not COMPONENT_SET.** `compSet.createInstance()` throws `TypeError: not a function`. Always get a specific variant: `const inst = (await figma.getNodeByIdAsync(‘variant-id’)).createInstance()`
- **`setProperties()` key names include `#nodeId` suffixes** for TEXT/BOOLEAN/INSTANCE_SWAP props (e.g. `’Label#2277:4’`). VARIANT props have no suffix. Read keys from `compSet.componentPropertyDefinitions`.
- **Annotation diagram** must use `layoutMode = ‘NONE’` on the canvas frame so overlays and instances can be absolutely positioned. See `docs/workflows/figma-plugin-patterns.md §3`.
- **Anatomy badge style:** Badges are **black circles** (`{ r:0, g:0, b:0 }`) with white numbers. Never blue. Use a NONE-layout wrapper frame (20×20) holding an Ellipse + Text so the number overlays the circle. State labels ("Default state" / "Focus state") are standalone text nodes placed **above the card**, not inside it. Cards have fill only — `card.strokes = []` always. Canonical reference: Button — Anatomy `3923:254427`.
- **`primaryAxisSizingMode = ‘AUTO’` must be reasserted after `resize()`** — resize() resets it to FIXED.
- **`layoutSizingHorizontal = ‘FILL’`** only valid after the node is appended to a layout parent.
- Full patterns reference: `docs/workflows/figma-plugin-patterns.md`

## Workflow per sheet
1. **Anatomy**: Component instance in bgDefault card (LEFT) + vertical legend with numbered badges (RIGHT) — both inside a HORIZONTAL two-column frame. No floating overlays in auto-layout. **Badges = black circles, state labels above cards, card has fill only (no stroke).** Full pattern: see `component-docs.md §Annotation pattern`.
2. **Properties**: Build section per property from `componentPropertyDefinitions`. Each value gets a live variant instance (`variant.createInstance()`) + token callout. VARIANT props: show each enum value. BOOLEAN: show true/false pair. TEXT/INSTANCE_SWAP: show default and note swappability.
3. **Layout & spacing**: Specs-style diagram (`layoutMode=’NONE’` canvas with colored overlay rects + dimension bracket lines) + `buildDocTable()` separating Padding / Gap / External spacing / Fixed sizes. Include a Don’t callout: never wrap the instance in a spacer frame.
4. **Accessibility**: Keyboard/ARIA table + token references for focus states. WCAG 2.2 AA criterion codes required (SC 1.4.3, 1.4.11, 2.1.1, 2.4.7, 2.4.11, 4.1.2).
5. **Usage**: Use-case decision table, variant selection guide, Do/Don’t pairs with live instances, numbered content guidelines, layout hygiene rules.

**Screenshots:** Do **not** call `figma_capture_screenshot` in the same long thread as bulk doc generation. Finish all sheets in **Phase A**, then use **Phase B** (new thread) — see **Codex session setup** above — or export frames manually (`docs/case-study/screenshot-guide.md`). If you must capture in-tool, target **each sheet FRAME** only (never PAGE), `scale: 1`, **one screenshot per turn**, and keep the session short.
