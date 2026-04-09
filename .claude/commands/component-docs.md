# Component Docs Generator

Generate a full S2A component documentation suite in Figma — Anatomy, Properties, Layout & Spacing, Accessibility, and Usage — using `.sheet frame` surfaces, `.step` bullets, live component instances, and S2A design tokens throughout.

## Goals: what we’re building (tech specs + onboarding)

These in-Figma doc kits are the **human-facing technical spec** for a component: the same story designers and engineers should trust for **how it works, when to use it, and how it maps to tokens**.

| Goal | What “good” looks like |
| --- | --- |
| **Plain language** | Educator’s voice — say what something does and why it matters, then give the technical detail. Assume someone new to S2A is reading the sheet. Write for designers, engineers, and product people equally. |
| **Single source of structure** | **Live instances** and real **variant / property** data from Figma — no invented props or fake token names. |
| **Token truth** | Every color, type, and spacing callout ties to **semantic S2A variables** (and text styles via `setTextStyleIdAsync`). No raw hex on doc surfaces. |
| **Full product story** | Five sheets cover: **Anatomy** (layers + callouts), **Properties** (every control + preview), **Layout & spacing** (padding/gap/radius as tokens), **Accessibility** (semantics, keyboard, focus, contrast, WCAG 2.2 AA refs), **Usage** (do / don’t + workflow). |
| **Accessible by design** | Treat **POUR** as the doc lens (perceivable, operable, understandable, robust) and cite concrete WCAG success criteria where helpful. |
| **Specs-style visuals** | Think “Specs plugin” energy: **preview + layer/readout + token map**. Callouts live on **doc frames** (`.sheet frame` siblings), **not** stuck inside the published component set — keeps MCP/codegen clean (see `docs/workflows/figma-to-code-workflow.md`, `docs/guardrails/figma-component-authoring.md`). |
| **Spacing semantics** | **Padding vs gap vs margin** documented per component so design and code align: internal inset vs space between siblings vs space owned by **parent layout** — always tie to **spacing tokens** (there is no separate “gap token” product; gap uses the **same spacing scale**). See `docs/workflows/in-figma-component-documentation.md` §3. |
| **Repeatable system** | Same scaffolding, same table helper, same section order every component so the team knows where to look. |
| **Downstream alignment** | Repo markdown / Storybook docs should **mirror** this content where we maintain code — Figma is the design-system spec surface; code docs are the **executable** contract. |

**Non-goals:** Replacing automated token/CSS pipelines; dumping raw plugin JSON into the canvas; decorating the **production** component frame with sticky annotations.

---

## Voice & copy guidelines

These docs are read by designers, engineers, and product people — not just Figma maintainers. Write like an educator explaining something to someone new to this component. The button anatomy sheet is the reference example (`3923:254427`).

### The core rule
**Say what something does and why it matters. Then give the technical detail.**

| Instead of | Write |
| --- | --- |
| `INSTANCE_SWAP prop (Icon Start#2781:497) · boolean` | `"Optional leading icon — turn it on with the 'Show Icon Start' property"` |
| `HORIZONTAL auto-layout` | describe the visual behavior: `"lays elements side by side"` |
| `Not in Figma` | `"Browser/code only — not visible in Figma's design canvas"` |
| `.Button/Core/Primary` in body copy | just say `"the button"` — reserve internal names for tables |
| `Background=solid, Context=on-light, State=default` | `"default state — solid style on a light background"` |
| `State tokens auto-resolve` | `"when state changes, the token automatically updates — you set it once"` |
| `#nodeId suffixes` | never surface in doc copy |
| `counterAxisSizingMode` / `primaryAxisSizingMode` | never use in doc copy |

### What to always keep
- **Token names** — engineers need exact strings. Put them in tables and callouts.
- **WCAG SC codes** — cite them with a one-line plain-language summary alongside.
- **Figma property names as shown in the right panel** (`"Show Icon Start"`, `"Size"`, `"State"`).
- **CSS property names** (`padding`, `gap`, `border-radius`).

### Tone
- One sentence for the what, one for the why. Then the table.
- If something is browser/code-only (focus rings, ARIA roles), say so — engineers need to know what they implement vs what's in Figma.
- If something has a constraint, explain why briefly: `"there's no dark-surface version — the Accent color set wasn't validated for on-dark contrast."`

---

**Full playbook:** Step-by-step reconstruction, POUR layout, safe-execution tie-in, and per-component checklist → [`docs/workflows/in-figma-component-documentation.md`](../../docs/workflows/in-figma-component-documentation.md).

## Usage
```
/component-docs <component-name> [figma-url]
```

## Prerequisites
1. Call `figma_get_status`. If not connected → "Open Figma Desktop → Plugins → Development → figma-desktop-bridge → Run"
2. If a Figma URL is provided, extract the node ID (`node-id=2103-1771` → `2103:1771`)

### Codex / MCP: two-phase workflow (avoid context window crashes)
`figma_capture_screenshot` embeds **full PNG data in the transcript**. After many `figma_execute` turns, **one screenshot** can exceed the model context.

- **Phase A (this thread):** All Figma doc generation. **No** `figma_capture_screenshot`. When done, output a table of `{ sheet name, node id }` for each `.Component — Section` frame.
- **Phase B (new thread):** Paste those node ids only; run `figma_get_status` then **one** capture per message (FRAME only, never PAGE, `scale: 1`). Or export manually per `docs/case-study/screenshot-guide.md`.

---

## Before writing any code

### 1. Collect live data from the component
Run `figma_execute` to:
- Find the component set node
- Read all variant names, `componentPropertyDefinitions`, layer structure, fills, strokes, bound variables, padding, gaps, and text style IDs
- Use `figma.variables.getVariableByIdAsync` to resolve token names for any bound fill/stroke variables

### 2. Load scaffolding components
From the **Scaffolding** page (search `figma.root.children.find(p => p.name.includes('Scaffolding'))`):
- `.sheet frame` Size=Default → node `2081:39858` (2000×2000)
- `.sheet frame` Size=Large → node `2081:39861` (4240×3440)
- `.step` → node `2914:4879` (48×48 numbered circle bullet)

### 3. Load all fonts — do this first in every script

Every `figma_execute` block that creates text nodes must pre-load fonts or `set_characters` throws. New text nodes default to **Inter Regular**; text styles resolve to Adobe Clean variants.

```js
// Paste at the top of EVERY script that touches text
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });       // default text node font
await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
await figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Black' }); // title-4 ← NOT ExtraBold
await figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' });  // body-lg
await figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' });     // label, caption, eyebrow
```

**Trap**: `s2a/typography/title-4` uses `Adobe Clean Display **Black**`, not ExtraBold. Verify any style:
```js
const style = await figma.getStyleByIdAsync('S:5cf014300bccf1230a6e660f60bd4f4252a72816,');
return style.fontName; // { family: 'Adobe Clean Display', style: 'Black' }
```

See `docs/workflows/figma-plugin-patterns.md §1` for full reference.

### 4. Resolve design tokens
```js
const vars = await figma.variables.getLocalVariablesAsync();
const styles = await figma.getLocalTextStylesAsync();
```

**Text styles to use:**
| Role | Style name | ID |
|---|---|---|
| Sheet/section title | `s2a/typography/title-4` | `S:5cf014300bccf1230a6e660f60bd4f4252a72816,` |
| Sub-section heading | `s2a/typography/eyebrow` | `S:152b1b57fb441ccfd288060043e1cd0a4365737f,` |
| Body (paragraphs) | `s2a/typography/body-lg` | `S:565931e51de6b933b7b1e79eec5803a05e080e86,` |
| Labels / property names | `s2a/typography/label` | `S:536bbf234b1a0a717cffe0e3c578fb0052669086,` |
| Token refs / captions | `s2a/typography/caption` | `S:e572ca6995cb534da839d4c8bef75ec523efeb6f,` |

**Minimum body text size is `body-lg`. Never use `body-md` or raw `fontSize` on documentation surfaces.**

**Color tokens to use (semantic only — never hardcode hex):**
| Role | Variable name | ID |
|---|---|---|
| Background (sheet content area) | `s2a/color/background/subtle` | `VariableID:6:47` |
| Background (cards/rows) | `s2a/color/background/default` | `VariableID:6:49` |
| Dividers | `s2a/color/border/subtle` | `VariableID:6:22` |
| Section title text | `s2a/color/content/title` | `VariableID:2483:41398` |
| Sub-heading text | `s2a/color/content/subheading` | `VariableID:2483:41397` |
| Default body text | `s2a/color/content/default` | `VariableID:6:82` |
| Subtle body text | `s2a/color/content/body-subtle` | `VariableID:2483:41396` |
| Label / property name text | `s2a/color/content/label` | `VariableID:2483:41392` |
| Caption / token ref text | `s2a/color/content/caption` | `VariableID:2483:41395` |
| Emphasis / strong text | `s2a/color/content/strong` | `VariableID:2819:6183` |

**Do not use `s2a/color/background/brand` or `s2a/color/content/brand` — these resolve to the Adobe brand red and are not accessible for documentation surfaces.**

**Apply variables — ALWAYS prefetch with `Promise.all` at the top of every script:**

Calling `getVariableByIdAsync` inside a loop (once per table cell, per row, per section) accumulates 30–80+ round trips and causes timeout errors on any script that runs more than ~3 tables. Prefetch once, bind synchronously everywhere.

```js
// ✓ Prefetch ALL variables at the top of the script (one parallel batch)
const [vBorderSubtle, vBgDefault, vBgSubtle, vContentLabel, vContentDef,
       vContentSubhead, vContentTitle, vContentCaption] = await Promise.all([
  figma.variables.getVariableByIdAsync('VariableID:6:22'),   // border/subtle
  figma.variables.getVariableByIdAsync('VariableID:6:49'),   // background/default
  figma.variables.getVariableByIdAsync('VariableID:6:47'),   // background/subtle
  figma.variables.getVariableByIdAsync('VariableID:2483:41392'), // content/label
  figma.variables.getVariableByIdAsync('VariableID:6:82'),   // content/default
  figma.variables.getVariableByIdAsync('VariableID:2483:41397'), // content/subheading
  figma.variables.getVariableByIdAsync('VariableID:2483:41398'), // content/title
  figma.variables.getVariableByIdAsync('VariableID:2483:41395'), // content/caption
]);
// Sync fill helper — no await needed
const _P = { type: 'SOLID', color: { r: 1, g: 1, b: 1 } };
function sf(node, v) {
  node.fills = [figma.variables.setBoundVariableForPaint(_P, 'color', v)];
}
// Usage (no await):
sf(card, vBgDefault);
sf(titleText, vContentTitle);
```

See `docs/workflows/figma-plugin-patterns.md §10` for full explanation.

**Apply text styles like this (always async):**
```js
await textNode.setTextStyleIdAsync('S:5cf014300bccf1230a6e660f60bd4f4252a72816,');
```

---

## Tables — standard pattern

**Any time you need to display tabular data** (keyboard interactions, token bindings, property lists, context references, etc.), use the `buildDocTable()` function below. This replicates the `.doc-table` component from the Scaffolding page (`3485:242686`) exactly.

**Canonical table rules (must be followed exactly):**
- Table wrapper: VERTICAL auto-layout, `itemSpacing = 0` (fully collapsed), NO fill, NO stroke, NO `cornerRadius`
- Every row (header and body): `bgDefault` fill, bottom stroke only (`border-subtle` color, `border-width/sm` = 1px, `strokeAlign = 'INSIDE'`, all other stroke weights = 0)
- Rows and cells: NO `cornerRadius`
- Fills live on the **row**, not the cell

> **Note on the `.doc-table` Figma component**: The Scaffolding component uses `createSlot()` for rows, which means designers can add/remove rows in the Figma UI without detaching. However, Figma's plugin API cannot programmatically set content inside slot sublayers. `buildDocTable()` produces an identical visual result and is the correct approach for all plugin-generated tables.

**`buildDocTable()` — paste this helper into every script that needs a table:**

> **Performance critical:** The helper below uses pre-fetched variable objects passed in from the top-level `Promise.all` prefetch. Do NOT call `getVariableByIdAsync` inside `buildDocTable` or the fill/stroke helpers — that pattern causes 25–30s timeout errors on scripts with multiple tables. See `docs/workflows/figma-plugin-patterns.md §10`.

```js
// ── At the TOP of the script ────────────────────────────────────────────────
// Prefetch all token variables once — no awaits inside helpers
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

const LABEL_STYLE = 'S:536bbf234b1a0a717cffe0e3c578fb0052669086,'; // s2a/typography/label
const BODY_LG     = 'S:565931e51de6b933b7b1e79eec5803a05e080e86,'; // s2a/typography/body-lg
const _P = { type: 'SOLID', color: { r: 1, g: 1, b: 1 } };

// Sync fill — takes a pre-fetched variable object (not an ID string)
function sf(node, v) {
  node.fills = [figma.variables.setBoundVariableForPaint(_P, 'color', v)];
}

// Sync bottom stroke — same
function applyBottomStroke(node) {
  node.strokes = [figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', vBorderSubtle
  )];
  node.strokeTopWeight = 0; node.strokeBottomWeight = 1;
  node.strokeLeftWeight = 0; node.strokeRightWeight = 0;
  node.strokeAlign = 'INSIDE';
}

// ── Table builder ────────────────────────────────────────────────────────────
// rows = [ { cells: ['col1', 'col2', ...], isHeader: bool } ]
// colWidths = [w1, w2, ...] — must sum to the table width (typically 1720)
async function buildDocTable(name, rows, colWidths) {
  const tableW = colWidths.reduce((a, b) => a + b, 0);
  const table = figma.createFrame();
  table.name = name;
  table.layoutMode = 'VERTICAL';
  table.itemSpacing = 0;          // fully collapsed — no gap between rows
  table.counterAxisSizingMode = 'FIXED';
  table.primaryAxisSizingMode = 'AUTO';
  table.resize(tableW, 100);
  table.primaryAxisSizingMode = 'AUTO'; // reassert — resize() resets to FIXED
  table.fills = [];                     // no fill on wrapper
  table.strokes = [];                   // no border on wrapper

  for (const { cells, isHeader } of rows) {
    const row = figma.createFrame();
    row.name = isHeader ? 'row/header' : 'row/body';
    row.layoutMode = 'HORIZONTAL';
    row.itemSpacing = 0;
    row.counterAxisSizingMode = 'AUTO';
    row.primaryAxisSizingMode = 'FIXED';
    row.resize(tableW, 40);
    table.appendChild(row);               // append BEFORE FILL
    row.layoutSizingHorizontal = 'FILL';  // after append
    sf(row, vBgDefault);                  // sync — no await
    applyBottomStroke(row);               // sync — no await

    for (let ci = 0; ci < cells.length; ci++) {
      const cw = colWidths[ci];
      const cell = figma.createFrame();
      cell.name = isHeader ? 'cell/header' : 'cell/body';
      cell.layoutMode = 'VERTICAL';
      cell.paddingTop = 8; cell.paddingRight = 16; cell.paddingBottom = 8; cell.paddingLeft = 16;
      cell.counterAxisSizingMode = 'FIXED';
      cell.primaryAxisSizingMode = 'AUTO';
      cell.resize(cw, 40);
      cell.primaryAxisSizingMode = 'AUTO'; // reassert
      cell.fills = [];                      // fill is on the row, not the cell

      const t = figma.createText();
      t.characters = String(cells[ci]);
      t.textAutoResize = 'HEIGHT';
      t.resize(cw - 32, t.height); // content width minus L+R padding (16+16)
      // Do NOT set primaryAxisSizingMode on text nodes — throws

      if (isHeader) {
        await t.setTextStyleIdAsync(LABEL_STYLE); // only await here
        sf(t, vContentLabel);                     // sync
      } else {
        await t.setTextStyleIdAsync(BODY_LG);     // only await here
        sf(t, vContentDef);                       // sync
      }

      cell.appendChild(t);
      row.appendChild(cell);
    }
  }
  return table;
}
```

**Usage example — keyboard interaction table:**
```js
const keyTable = await buildDocTable('Keyboard Interaction', [
  { cells: ['Key', 'Action'], isHeader: true },
  { cells: ['Tab', 'Moves focus to the component'], isHeader: false },
  { cells: ['Enter / Space', 'Activates the component'], isHeader: false },
  { cells: ['Escape', '(if applicable)'], isHeader: false },
], [240, 1480]); // 2 cols, 240 + 1480 = 1720px
desktop.appendChild(keyTable);
```

**Column width guidelines (for a 1880px sheet, 80px padding each side → 1720px content width):**
| Columns | Suggested widths |
|---|---|
| 2 | `[240, 1480]` (key/action) or `[560, 1160]` (even-ish) |
| 3 | `[400, 280, 1040]` (layer/property/token) or `[360, 360, 1000]` |
| 4 | `[430, 430, 430, 430]` (equal) |

**Scaffolding reference**: `.doc-table` component group is on the Scaffolding page at node `3485:242720`. Sub-components:
- `.doc-table` (table wrapper): `3485:242686`
- `.doc-table/cell/header`: `3485:242666`
- `.doc-table/cell/body`: `3485:242668`
- `.doc-table/row/header`: `3485:242670`
- `.doc-table/row/body`: `3485:242678`

---

## Sheet setup pattern (reuse for every section)

> **CRITICAL: Always use the `.sheet frame` component — never `figma.createFrame()` for the outer sheet.**
> The component (`2081:39857` COMPONENT_SET, `2081:39858` Size=Default variant) applies the correct `bgDefault` fill, `cornerRadius: 80`, `layoutMode: VERTICAL`, and gradient header decoration. Manually created frames will look wrong and must be rebuilt.

```js
// On the Scaffolding page, find the component
await figma.setCurrentPageAsync(scaffPage);
const sheetComp = scaffPage.findOne(n => n.id === '2081:39858'); // Size=Default
const inst = sheetComp.createInstance();
await figma.setCurrentPageAsync(targetPage);
targetPage.appendChild(inst);

// Detach FIRST, then set text (more reliable than instance overrides)
const sheet = inst.detachInstance();
sheet.name = `${componentName} — Section Name`;

// Text node names inside .sheet header (after detach):
// 'Title'       → large title text
// 'Description' → subtitle paragraph
// 'Date & name' → "March 2026 · S2A Design System"
sheet.findOne(n => n.name === 'Title').characters = 'Section Name';
sheet.findOne(n => n.name === 'Description').characters = 'One sentence description.';
sheet.findOne(n => n.name === 'Date & name').characters = 'March 2026 · S2A Design System';

const desktop = sheet.findOne(n => n.name === 'Desktop');

// Set up Desktop as vertical auto-layout
desktop.layoutMode = 'VERTICAL';
desktop.itemSpacing = 48;
desktop.paddingTop = 64; desktop.paddingRight = 80;
desktop.paddingBottom = 80; desktop.paddingLeft = 80;
desktop.primaryAxisSizingMode = 'FIXED';
desktop.counterAxisSizingMode = 'FIXED';
// Apply bgSubtle fill via token (see above)
```

After building all content, manually compute and resize:
```js
const childSum = desktop.children.reduce((s, c) => s + c.height, 0);
const needed = Math.ceil(childSum + (desktop.children.length - 1) * desktop.itemSpacing + desktop.paddingTop + desktop.paddingBottom) + 40;
desktop.resize(desktop.width, needed);
const header = sheet.children.find(c => c.name !== 'Desktop');
sheet.resize(sheet.width, Math.ceil(header.height + needed) + 40);
```

---

## Annotation pattern

### Anatomy — annotated callout canvas + legend

> **Canonical reference: Button — Anatomy (`3923:254427`) in matt-atoms.** Every anatomy sheet must visually match this. The AppIcon anatomy (`3987:449710`) is also a correct example. Do not invent a different style.

The anatomy section uses a **NONE-layout canvas** on the LEFT so numbered badges and leader lines can be absolutely positioned. The RIGHT side has a matching numbered legend. The outer two-column frame is `layoutMode='HORIZONTAL'`.

**IMPORTANT: The canvas has TWO stacked sections — Default state and Focus state.** Do not put all badges on one card — the focus ring is only visible in the focus state, so the focus-ring badge must point to a real focus state instance. (Exception: display-only components like AppIcon with no focus state use a single section + size strip instead.)

**Canvas height formula** — use compact cards (never a static 270–280px for a small component):
```
CARD_H = CH + 116   // state label(20) + badge clearance(34) + comp(CH) + bottom(62)
// For CH=24: CARD_H = 140. For CH=40: CARD_H = 156.
CANVAS_TOTAL_H = CARD1_H + 20 + CARD2_H
```

---

#### Badge style — CANONICAL (must match Button anatomy reference)

**Badges are black circles with white numbers. Never blue.**

```js
// NONE-layout wrapper — lets circle and number overlay each other
function makeBadge(canvas, num, x, y) {
  const wrap = figma.createFrame();
  wrap.resize(20, 20); wrap.layoutMode = 'NONE';
  wrap.fills = []; wrap.strokes = [];
  wrap.x = x; wrap.y = y;
  canvas.appendChild(wrap);

  const circle = figma.createEllipse();
  circle.resize(20, 20); circle.x = 0; circle.y = 0;
  circle.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; // BLACK — never blue
  circle.strokes = [];
  wrap.appendChild(circle);

  const label = figma.createText();
  label.characters = String(num);
  label.fontSize = 10; label.fontName = { family: 'Inter', style: 'Bold' };
  label.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  label.textAlignHorizontal = 'CENTER'; label.textAlignVertical = 'CENTER';
  label.resize(20, 20); label.textAutoResize = 'NONE';
  label.lineHeight = { value: 20, unit: 'PIXELS' };
  label.x = 0; label.y = 0;
  wrap.appendChild(label);
}
```

**Badge positions (relative to component origin CX, CY):**
- Badge 1 (root): `(CX - 28, CY - 32)` + L-shaped leader to root corner
- Badge 2 (label): `(CX + LABEL_W/2 - 10, CY - 32)` + vertical leader
- Badge 3 (icon): `(CX + LABEL_W + gap + icon/2 - 10, CY - 32)` + vertical leader
- Badge 4 (focus ring): `(FCX + CW + 20, FCY + CH/2 - 10)` + horizontal leader from component right edge

---

#### Card style — CANONICAL

**Cards have fill only — never a stroke or border.**

```js
const card1 = figma.createRectangle();
card1.name = 'card-bg/default'; card1.resize(CARD_W, CARD1_H);
card1.x = 0; card1.y = 0; card1.cornerRadius = 12;
card1.strokes = []; // ← ALWAYS clear strokes — never add a border to anatomy cards
sf(card1, vBgDefault); // bgDefault for default state card
canvas.appendChild(card1);

const card2 = figma.createRectangle();
card2.name = 'card-bg/focus'; card2.resize(CARD_W, CARD2_H);
card2.x = 0; card2.y = FOCUS_Y; card2.cornerRadius = 12;
card2.strokes = []; // ← ALWAYS clear strokes
sf(card2, vBgSubtle); // bgSubtle for focus state card
canvas.appendChild(card2);
```

---

#### State labels — CANONICAL

**State labels ("Default state", "Focus state") are standalone text nodes placed ABOVE and OUTSIDE the card — not inside it.**

```js
// State label sits above the card (y = cardY - 20), not inside
const stateLabel = figma.createText();
stateLabel.characters = 'Default state';
stateLabel.fontSize = 11; stateLabel.fontName = { family: 'Inter', style: 'Regular' };
stateLabel.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
stateLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
stateLabel.x = 0; stateLabel.y = cardY - 20; // above the card
canvas.appendChild(stateLabel);
```

---

#### Leader line helpers

```js
function addVLine(canvas, x, yTop, yBot) {
  const line = figma.createLine();
  line.rotation = 90; line.resize(yBot - yTop, 0);
  line.x = x; line.y = yBot; // y = bottom when rotation=90
  line.strokes = [{ type: 'SOLID', color: { r: 0.13, g: 0.40, b: 0.96 }, opacity: 0.7 }];
  line.strokeWeight = 1.5; line.fills = [];
  canvas.appendChild(line);
}
function addHLine(canvas, xLeft, xRight, y) {
  const line = figma.createLine();
  line.resize(xRight - xLeft, 0);
  line.x = xLeft; line.y = y;
  line.strokes = [{ type: 'SOLID', color: { r: 0.13, g: 0.40, b: 0.96 }, opacity: 0.7 }];
  line.strokeWeight = 1.5; line.fills = [];
  canvas.appendChild(line);
}
// Badge 1 L-shaped: vertical then horizontal to root corner
addVLine(canvas, CX - 18, CY - 12, CY);
addHLine(canvas, CX - 18, CX, CY);
// Badges 2 & 3: straight vertical
addVLine(canvas, CX + LABEL_W/2, CY - 12, CY);
addVLine(canvas, ICON_CENTER_X, CY - 12, CY + CH/2);
// Badge 4: horizontal from component right to badge
addHLine(canvas, FCX + CW + 4, FCX + CW + 20, FCY + CH/2);
```

**Always clear strokes on the canvas itself:**
```js
canvas.strokes = []; // ← prevent phantom blue border on the canvas frame
```

---

#### Right legend — CANONICAL

The legend uses a VERTICAL auto-layout frame. Each row is HORIZONTAL: a **NONE-layout badge wrapper** (circle + number overlaid) followed by a **VERTICAL textBlock** (bold title on top, body-lg description below). Badge numbers in the legend match the canvas badges exactly.

```js
// Legend row pattern — one per annotated element
const row = figma.createFrame();
row.layoutMode = 'HORIZONTAL'; row.itemSpacing = 12;
row.counterAxisAlignItems = 'MIN'; // top-align badge with text
row.fills = []; row.strokes = [];
legend.appendChild(row); row.layoutSizingHorizontal = 'FILL';

// Badge wrapper (NONE layout so circle and number can overlay)
const badgeWrap = figma.createFrame();
badgeWrap.resize(20, 20); badgeWrap.layoutMode = 'NONE';
badgeWrap.fills = []; badgeWrap.strokes = [];
row.appendChild(badgeWrap);
const bc = figma.createEllipse(); bc.resize(20, 20); bc.x = 0; bc.y = 0;
bc.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; bc.strokes = [];
badgeWrap.appendChild(bc);
const bl = figma.createText(); bl.characters = String(num);
bl.fontSize = 10; bl.fontName = { family: 'Inter', style: 'Bold' };
bl.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
bl.textAlignHorizontal = 'CENTER'; bl.textAlignVertical = 'CENTER';
bl.resize(20, 20); bl.textAutoResize = 'NONE';
bl.lineHeight = { value: 20, unit: 'PIXELS' }; bl.x = 0; bl.y = 0;
badgeWrap.appendChild(bl);

// Text block: bold title + body description stacked
const textBlock = figma.createFrame();
textBlock.layoutMode = 'VERTICAL'; textBlock.itemSpacing = 4;
textBlock.fills = []; textBlock.strokes = [];
row.appendChild(textBlock); textBlock.layoutSizingHorizontal = 'FILL';

const titleT = figma.createText(); titleT.characters = 'Part name';
await titleT.setTextStyleIdAsync(LABEL_STYLE); sf(titleT, vContentLabel);
titleT.textAutoResize = 'HEIGHT';
textBlock.appendChild(titleT); titleT.layoutSizingHorizontal = 'FILL';

const descT = figma.createText(); descT.characters = 'What this part does and why it matters.';
await descT.setTextStyleIdAsync(BODY_LG); sf(descT, vContentDef);
descT.textAutoResize = 'HEIGHT';
textBlock.appendChild(descT); descT.layoutSizingHorizontal = 'FILL';
```

### Layout & Spacing — Specs-style annotation diagram

Use a `layoutMode = 'NONE'` canvas for the annotated component diagram. This enables absolute positioning of overlay rectangles and dimension lines on top of a live instance. **The canvas itself is a child of the auto-layout `desktop` frame and sized to fit.**

```js
// 1. Measure real component size first
const measureInst = variant.createInstance();
page.appendChild(measureInst); measureInst.x = -99999; measureInst.y = -99999;
await new Promise(r => setTimeout(r, 100));
const COMP_W = measureInst.width; const COMP_H = measureInst.height;
measureInst.remove();

// 2. Build canvas
const CARD_W = 560; const CARD_H = 240;
const CARD_X = 80;  const CARD_Y = 120;
const CX = CARD_X + (CARD_W - COMP_W) / 2;
const CY = CARD_Y + (CARD_H - COMP_H) / 2;

const canvas = figma.createFrame();
canvas.name = 'annotation-diagram';
canvas.resize(1720, CARD_Y + CARD_H + 120);
canvas.layoutMode = 'NONE'; // ← required for absolute positioning
canvas.fills = []; canvas.strokes = [];
desktop.appendChild(canvas); // ← desktop is still auto-layout VERTICAL

// 3. Card background
const card = figma.createRectangle();
card.resize(CARD_W, CARD_H); card.x = CARD_X; card.y = CARD_Y;
card.cornerRadius = 16;
// apply bgDefault fill via token

// 4. Overlay rectangles BEFORE instance (z-order: behind)
const padTop = figma.createRectangle();
padTop.resize(COMP_W, paddingTopPx); padTop.x = CX; padTop.y = CY;
padTop.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.44, b: 0.96 }, opacity: 0.22 }];
padTop.strokes = [{ type: 'SOLID', color: { r: 0.13, g: 0.44, b: 0.96 } }];
padTop.strokeWeight = 1; padTop.strokeAlign = 'INSIDE';
canvas.appendChild(padTop);
// ... padBottom (orange), gap overlay, dashed outer box

// 5. Live instance ON TOP of overlays
const inst = variant.createInstance();
canvas.appendChild(inst); inst.x = CX; inst.y = CY;

// 6. Dimension brackets (lines + ticks)
const vLine = figma.createLine();
vLine.rotation = 90; vLine.resize(COMP_H, 0);
vLine.x = CX - 32; vLine.y = CY + COMP_H;
canvas.appendChild(vLine);

// 7. Leader lines from zone to label
const leader = figma.createLine();
leader.resize(CARD_X + CARD_W + 48 - (CX + COMP_W) - 4, 0);
leader.x = CX + COMP_W + 4; leader.y = CY + paddingTopPx / 2;
canvas.appendChild(leader);
const lbl = figma.createText();
lbl.characters = 'Padding top: Xpx';
lbl.x = CARD_X + CARD_W + 48; lbl.y = CY + paddingTopPx / 2 - 6;
canvas.appendChild(lbl);
```

Working examples in matt-atoms:
- Anatomy callout canvas: Link — Anatomy (node `3898:5872`)
- Layout annotation diagram: Link — Layout & Spacing (node `3898:5638`)
See also: `docs/workflows/figma-plugin-patterns.md §3`.

---

## Section 1 — Anatomy

**Goal**: Show the component's layer structure with numbered callouts mapping to tokens, states comparison, and layer hierarchy.

**Layout — five blocks in the Desktop VERTICAL stack:**
1. Section title "Anatomy" (title-4 + content/title)
2. Two-column frame: LEFT = callout canvas, RIGHT = numbered legend
3. Horizontal rule (1px border/subtle rectangle, full width)
4. States comparison strip
5. Layer hierarchy table

---

### Callout canvas (LEFT column)

> **See the Annotation pattern section above for the canonical badge, card, and legend style. That section is the single source of truth — follow it exactly.**

The canvas uses `layoutMode = 'NONE'` so badges and lines can be absolutely positioned.

**Two-section structure — stacked vertically inside the canvas:**

| Section | Card fill | State label | Purpose |
|---|---|---|---|
| Default state | `bgDefault` — no stroke | Text above card at `(0, cardY - 20)` | Badges pointing to root, label, icon |
| Focus state | `bgSubtle` — no stroke | Text above card at `(0, FOCUS_Y - 20)` | Focus-ring badge pointing to focus instance |

**Card height formula** — keep cards compact (component height is usually 24–40px):
```
CARD_H = CH + 116   // state label(20) + badge clearance(34) + comp(CH) + bottom(62)
// For CH=24: CARD_H = 140. For CH=40: CARD_H = 156.
CANVAS_TOTAL_H = CARD1_H + 20 + CARD2_H
```

```js
// Compact two-section anatomy canvas
const CW = 114; const CH = 24; // read from actual instance — do not hardcode
const CARD_W = 680;
const CARD1_H = CH + 116; // ≈ 140 for a 24px component
const CARD2_H = CH + 116;
const CX = Math.round((CARD_W - CW) / 2);
const CY = 76; // badge clearance above component

const canvas = figma.createFrame();
canvas.name = 'anatomy/callout-canvas';
canvas.layoutMode = 'NONE';
canvas.fills = []; canvas.strokes = []; // ← always clear both
canvas.resize(CARD_W, CARD1_H + 20 + CARD2_H);
twoCol.appendChild(canvas);

// === Section 1: Default state ===
// State label ABOVE the card
const label1 = figma.createText(); label1.characters = 'Default state';
label1.fontSize = 11; label1.fontName = { family: 'Inter', style: 'Regular' };
label1.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
label1.textAutoResize = 'WIDTH_AND_HEIGHT'; label1.x = 0; label1.y = 0;
canvas.appendChild(label1);

const card1 = figma.createRectangle();
card1.name = 'card-bg/default'; card1.resize(CARD_W, CARD1_H);
card1.x = 0; card1.y = 20; card1.cornerRadius = 12;
card1.strokes = []; // ← never add a border
sf(card1, vBgDefault);
canvas.appendChild(card1);

const defInst = defVariant.createInstance();
canvas.appendChild(defInst);
defInst.x = CX; defInst.y = 20 + Math.round((CARD1_H - CH) / 2);

// Badges 1–N at compY - 28, with leader lines (see Annotation pattern → Badge style)
// makeBadge(canvas, 1, CX - 28, defInst.y - 28) + L-shaped leader
// makeBadge(canvas, 2, CX + LABEL_W/2 - 10, defInst.y - 28) + vertical leader
// ... etc.

// === Section 2: Focus state ===
const FOCUS_Y = CARD1_H + 20 + 20; // CARD1_H + gap(20) + label space(20)
const FCX = CX; const FCY = FOCUS_Y + Math.round((CARD2_H - CH) / 2);

const label2 = figma.createText(); label2.characters = 'Focus state';
label2.fontSize = 11; label2.fontName = { family: 'Inter', style: 'Regular' };
label2.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
label2.textAutoResize = 'WIDTH_AND_HEIGHT';
label2.x = 0; label2.y = CARD1_H + 20;
canvas.appendChild(label2);

const card2 = figma.createRectangle();
card2.name = 'card-bg/focus'; card2.resize(CARD_W, CARD2_H);
card2.x = 0; card2.y = FOCUS_Y; card2.cornerRadius = 12;
card2.strokes = []; // ← never add a border
sf(card2, vBgSubtle);
canvas.appendChild(card2);

// Focus instance at (FCX, FCY)
// makeBadge(canvas, N, FCX + CW + 20, FCY + CH/2 - 10) + horizontal leader
// Caption: "Focus ring · 2px solid outline · 2px offset from component edge"
```

**What to annotate** (walk `target.children` up to depth 3):
- Text nodes → font size token, font family, color token
- Icon/vector children → size, color token
- Container/wrapper frames → padding tokens, gap token, border-radius token
- Focus ring → border color token, border width token, offset/radius tokens — **show in the Focus state section, not as a hint box**

---

### States comparison strip

After the two-column frame, add a **`states-strip`** section to the desktop:

```js
// HORIZONTAL row of cards — one per state
const stateVariants = [
  { label: 'default', id: '...' },
  { label: 'hover',   id: '...' },
  { label: 'focus',   id: '...' },
  { label: 'active',  id: '...' },
];
// Each card: VERTICAL auto-layout, CENTER-aligned, ~140px tall
// Shows: state label (eyebrow) + live instance
// Card width: (1720 - (N-1)*16) / N
```

---

### Layer hierarchy table

After the states strip, add a `buildDocTable()` showing the component's layer tree:

```js
const layerTable = await buildDocTable('layer-hierarchy-table', [
  { cells: ['Depth', 'Layer / part name', 'Type', 'Notes'], isHeader: true },
  { cells: ['0', 'Root frame', 'COMPONENT', 'Auto-layout · padding + gap tokens'], isHeader: false },
  { cells: ['1', 'Label text', 'TEXT', 'Typography token + color token'], isHeader: false },
  { cells: ['1', 'Icon container', 'FRAME', 'Fixed size · conditional visibility'], isHeader: false },
  { cells: ['2', 'Icon instance', 'INSTANCE', 'Icon component · color token'], isHeader: false },
  { cells: ['—', 'Focus ring', 'VIRTUAL / CSS', '2px solid · 2px offset · focus-ring/default · focus state only'], isHeader: false },
], [80, 360, 200, 1080]);
```

---

## Section 2 — Properties

**Goal**: Document every component property, its allowed values, what each value looks like, and which tokens each state uses.

**Layout:**
- Section title: "Properties" (title-4)
- For each property from `componentPropertyDefinitions`:
  - Sub-heading: property name (eyebrow style + content/subheading)
  - For each allowed value:
    - Value label (label style + content/label)
    - Live component instance showing that specific variant (create instance, set variant properties)
    - Token breakdown (caption style + content/caption): list all fills, strokes, text styles bound on that variant

**Property types:**
- `VARIANT` → show each enum value as a sub-row
- `BOOLEAN` → show `true` and `false` side-by-side
- `TEXT` → show default value in context
- `INSTANCE_SWAP` → show default and note it's swappable

**Token display format:**
```
Background: s2a/color/button/background/primary/solid/on-light/default (#1473E6)
Border: — (none)
Label: s2a/color/content/knockout (#FFFFFF)
```

---

## Section 3 — Layout & Spacing

**Goal**: Document all spacing, sizing, and layout with **token names** and **clear rules** so designers and engineers don’t make arbitrary choices. **Padding**, **gap**, and **margin** are different jobs—spell out which applies where for *this* component.

### Spacing semantics (must appear on this sheet)

S2A uses **spacing tokens** for both **padding** and **gap** (there is no separate “gap token” type—`gap` in CSS and **item spacing** in Figma still bind to the **spacing scale**, e.g. `s2a/spacing/*` or semantic spacing aliases).

| Concept | Meaning | Figma | CSS (typical) | Document in spec table as… |
| --- | --- | --- | --- | --- |
| **Padding** | Space **inside** the component box | Frame **padding** on root / inner auto-layout | `padding` | `Padding (top/bottom/…)` + token |
| **Gap** | Space **between** children in the same auto-layout | **Item spacing** | `gap` | `Gap (label ↔ icon)` + token — explain *why gap, not margin* |
| **Margin** | Space **outside** the component vs neighbors | Usually **parent** stack/grid **gap** or page section—not extra wrapper frames on the instance | `margin` on host or parent `gap` | Row: `External spacing` → “Owned by parent layout; use …” |

**Required copy blocks:**

1. **Intro paragraph (body-lg)** — One ELI5 paragraph: “Padding holds the label away from the edge; gap separates the icon from the text; margin between this Link and the next control is decided by the parent stack, not inside the Link.”
2. **`buildDocTable()`** — Include rows that **explicitly** separate **Padding**, **Gap** (each axis / pair if needed), **External spacing (parent)**, plus fixed sizes (icon, min width), radius, etc. The **Notes** column must say *when to use gap vs padding* for this atom.
3. **“Spacing decisions”** — Short bullet or caption: what this component **owns** vs what **layout** owns (stops one-off frames for “just 8px more”).

**Layout:**
- Section title: "Layout & Spacing" (title-4)
- Component instance in a `bgSubtle` card with **Specs-style** overlays: dimension lines or tinted regions showing **inside (padding)** vs **between (gap)** vs callout that **outside spacing is parent-owned** — use `s2a/color/border/default` (or team spec line token) for annotation strokes.
- Example table shape (extend rows per component):
  ```js
  const spacingTable = await buildDocTable('Layout & Spacing', [
    { cells: ['Dimension', 'Token / value', 'Notes'], isHeader: true },
    { cells: ['Padding (root, inline)', 's2a/spacing/…', 'Inside the clickable area — not margin'], isHeader: false },
    { cells: ['Gap (label ↔ icon)', 's2a/spacing/…', 'Auto-layout item spacing = CSS gap'], isHeader: false },
    { cells: ['External spacing', 'Parent layout token …', 'Do not wrap instance in spacer frames'], isHeader: false },
    { cells: ['Min width / fixed sizes', '…', 'Hug vs fixed'], isHeader: false },
    { cells: ['Border radius', 's2a/…', ''], isHeader: false },
  ], [360, 520, 1040]);
  desktop.appendChild(spacingTable);
  ```

**Usage sheet tie-in:** Add a **Don’t**: “Don’t use arbitrary margins on the instance—use the parent stack gap token …” when applicable.

**Deep dive:** `docs/workflows/in-figma-component-documentation.md` (§3–§4).

---

## Section 4 — Accessibility

**Goal**: Give developers and designers everything they need to build an accessible implementation. Reference **WCAG 2.2 Level AA** explicitly, organized by **POUR** (Perceivable / Operable / Understandable / Robust).

**Layout — POUR structure (four named eyebrow sections):**
- Section title: "Accessibility" (title-4 + content/title)
- Intro paragraph: "This component meets WCAG 2.2 Level AA requirements when implemented as specified." (body-lg)
- Horizontal rule
- **P — Perceivable** (eyebrow) → intro sentence + `buildDocTable()` with WCAG SC / Criterion / Implementation columns
- **O — Operable** (eyebrow) → intro + keyboard table + WCAG table + live focus-state instance card
- **U — Understandable** (eyebrow) → intro + WCAG table
- **R — Robust** (eyebrow) → intro + WCAG table
- **Disabled state exception** (eyebrow) → note that SC 1.4.3 exempts disabled controls

**Standard table shape (use for all four POUR sections):**
```js
const pourTable = await buildDocTable('perceivable-table', [
  { cells: ['WCAG SC', 'Criterion', 'Implementation'], isHeader: true },
  { cells: ['1.4.3 (AA)', 'Contrast Minimum', '4.5:1 for normal text; token: s2a/color/content/link vs page bg'], isHeader: false },
  { cells: ['1.4.11 (AA)', 'Non-text Contrast', 'Icon + focus ring must be 3:1 against adjacent colors'], isHeader: false },
  { cells: ['1.4.1 (A)', 'Use of Color', 'Do not rely on color alone — underline or other indicator required'], isHeader: false },
], [160, 300, 1260]);
```

**Keyboard table (inside Operable section):**
```js
const keyTable = await buildDocTable('keyboard-table', [
  { cells: ['Key', 'Action'], isHeader: true },
  { cells: ['Tab', 'Moves focus to the component'], isHeader: false },
  { cells: ['Shift + Tab', 'Moves focus to previous interactive element'], isHeader: false },
  { cells: ['Enter', 'Activates the component (navigates or triggers action)'], isHeader: false },
], [240, 1480]);
```

**Focus state preview card (inside Operable section):**
```js
// VERTICAL card showing the focus state instance with SC label
const focusCard = figma.createFrame();
focusCard.layoutMode = 'VERTICAL'; focusCard.itemSpacing = 12;
focusCard.paddingTop = 24; focusCard.paddingRight = 24;
focusCard.paddingBottom = 24; focusCard.paddingLeft = 24;
focusCard.cornerRadius = 12;
// applyFill(focusCard, BG_DEFAULT)
// append: label text "Focus state — SC 2.4.7 & 2.4.11" + focus variant instance
```

**WCAG SC codes to include per section:**

| POUR | SC codes |
|---|---|
| Perceivable | 1.4.3 (AA), 1.4.11 (AA), 1.4.1 (A) |
| Operable | 2.1.1 (A), 2.4.7 (AA), 2.4.11 (AA), 2.5.3 (A) |
| Understandable | 2.4.6 (AA), 3.2.1 (A), 3.3.2 (A) |
| Robust | 4.1.2 (A), 4.1.3 (AA) |

---

## Section 5 — Usage

**Goal**: Tell designers when and how to use this component correctly.

**Layout:**
- Section title: "Usage" (title-4)
- Use `.step` numbered bullets for each guideline
- Group into: **Do** (green checkmark prefix) and **Don't** (red × prefix) — use neutral text, not actual colors
- Include: intended use cases, anti-patterns, content guidelines, context rules

**Standard topics to cover:**
1. Primary intended context (where to place this component)
2. When to choose one variant over another
3. Content length / copy guidelines
4. What NOT to do (incorrect variant combos, inaccessible usage)
5. Interaction / behavior expectations
6. **Layout hygiene** — e.g. don’t invent spacer frames; parent owns **external** spacing; keep **padding/gap** on the component as spec’d on Layout & Spacing
7. **Design → Engineering Handoff** — always include as the final section

**Handoff section (always add at the end of Usage):**
```js
// Section heading: "Design → Engineering Handoff" (eyebrow)
// Intro: "Follow this chain to move from design intent to shipped code."
// buildDocTable with 4 columns: Step / Owner / Artifact or action / Where
const handoffTable = await buildDocTable(‘handoff-steps’, [
  { cells: [‘Step’, ‘Owner’, ‘Artifact / action’, ‘Where’], isHeader: true },
  { cells: [‘1 · Design intent’, ‘Designer’, ‘Figma component set with bound variables — no raw hex, no invented spacing’, ‘This Figma file’], isHeader: false },
  { cells: [‘2 · Token export’, ‘Design systems’, ‘Run token pipeline → JSON → CSS custom properties’, ‘packages/tokens’], isHeader: false },
  { cells: [‘3 · Code component’, ‘Engineer’, ‘Implement with S2A CSS tokens. Match padding, gap, radius, color to spec sheet’, ‘Milo / component repo’], isHeader: false },
  { cells: [‘4 · Storybook’, ‘Engineer’, ‘Story covers all variant combinations’, ‘apps/storybook’], isHeader: false },
  { cells: [‘5 · QA parity check’, ‘Designer + Engineer’, ‘Side-by-side Figma vs browser — text color, focus ring, hover state, spacing’, ‘figma_check_design_parity or manual’], isHeader: false },
  { cells: [‘6 · Escalate token gaps’, ‘Either’, ‘If a semantic token is missing, raise in #consonant-tokens before shipping a one-off value’, ‘#consonant-tokens Slack’], isHeader: false },
], [60, 200, 800, 660]);

// Don’t callout card below the table:
// "Don’t bypass the token pipeline — if a token doesn’t exist yet, file a request in
//  #consonant-tokens. Do not hardcode hex values or create one-off Figma styles."
```

---

## Placement & naming

Place all sheets in a horizontal row to the right of the component set:
```js
let x = compSet.x + compSet.width + 200;
const y = compSet.y;
// After each sheet: x += sheet.width + 80;
```

Name each sheet: `[ComponentName] — [Section]`
e.g.: `.Button — Anatomy`, `.Button — Properties`, `.Button — Accessibility`

---

## Quality checklist

Before returning:
- [ ] All text nodes have `setTextStyleIdAsync` applied (no raw `fontName`/`fontSize` overrides)
- [ ] No text node uses `body-md` or smaller — minimum is `body-lg` for all doc surfaces
- [ ] All fills use `setBoundVariableForPaint` with semantic color variables (no hardcoded hex)
- [ ] No `bgBrand` or `contentBrand` used anywhere on documentation surfaces
- [ ] Every section has a live component instance (not just a screenshot)
- [ ] All tabular data uses `buildDocTable()` — no ad-hoc HORIZONTAL row frames
- [ ] **Layout sheet** documents **padding vs gap vs margin** (Figma ↔ CSS), ties spacing to **spacing tokens**, and uses **Specs-style** measures + **Notes** that explain *why* (not just numbers)
- [ ] Accessibility section explicitly cites WCAG 2.2 Level AA criterion codes
- [ ] **Screenshots:** Either (preferred) list sheet **FRAME** node ids for a **new** session / manual export, OR in a **fresh** short thread only: one `figma_capture_screenshot` per turn (never PAGE). Do **not** stack captures after a long build in the same transcript.

---

## Critical rules
- **Load fonts first** — every script must pre-load Inter + Adobe Clean (see §3 above). Missing fonts cause silent failures or throws on `set_characters`.
- `createInstance()` lives on **COMPONENT** nodes, not **COMPONENT_SET** — calling it on a set throws `TypeError: not a function`. Get a specific variant node first: `const v = await figma.getNodeByIdAsync('variant-id'); const inst = v.createInstance();`
- `setProperties()` key names include `#nodeId` suffixes for TEXT/BOOLEAN/INSTANCE_SWAP props (e.g. `'Label#2277:4'`). VARIANT props have no suffix (e.g. `'State'`). Always read keys from `compSet.componentPropertyDefinitions`.
- Always `await figma.setCurrentPageAsync(page)` before accessing page content
- Always append a node to its parent BEFORE setting `layoutSizingHorizontal = 'FILL'`
- Always reassert `primaryAxisSizingMode = 'AUTO'` after calling `resize()` — resize() resets it to FIXED
- Always use `figma.variables.getVariableByIdAsync` (never the sync version)
- Never modify the original component nodes — read only
- All spec frames are idempotent: search for existing frame by name and remove before recreating
- Do not generate content without first reading the actual component data from Figma
- **Full pattern reference**: `docs/workflows/figma-plugin-patterns.md`
