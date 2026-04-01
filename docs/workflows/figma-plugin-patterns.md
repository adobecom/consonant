# Figma Plugin Patterns — Shared Reference

Gotchas and proven patterns for every `figma_execute` script in this repo.
Referenced by `/component-docs`, `/spec`, and `figma-console-safe-execution`.

---

## 1. Font loading — do this first, every time

Every `figma_execute` script that creates text nodes must pre-load fonts at the **very top** of the script. Figma creates new text nodes with `Inter Regular` by default; if that font isn't loaded, calling `.characters = "..."` throws `Cannot write to node with unloaded font`.

```js
// Paste at the top of every script that touches text
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });      // default text node font
await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
await figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Black' }); // s2a/typography/title-4
await figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' }); // body-lg, body-md
await figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' });    // label, caption, eyebrow
```

**Known traps:**

| Style name | Actual font | Common wrong guess |
|---|---|---|
| `s2a/typography/title-4` | `Adobe Clean Display Black` | `Adobe Clean Display ExtraBold` |
| `s2a/typography/eyebrow` | `Adobe Clean Bold` | `Adobe Clean Regular` |
| `s2a/typography/caption` | `Adobe Clean Bold` | `Adobe Clean Regular` |
| `s2a/typography/body-lg` | `Adobe Clean Regular` | — |

**Verify any style's font at runtime:**
```js
const style = await figma.getStyleByIdAsync('S:5cf014300bccf1230a6e660f60bd4f4252a72816,');
return style.fontName; // { family: 'Adobe Clean Display', style: 'Black' }
```

If a scaffold component (like `.sheet frame`) contains text nodes, load its fonts too:
```js
const scaffComp = scaffPage.findOne(n => n.id === '2081:39858');
const fonts = new Set();
scaffComp.findAll(n => n.type === 'TEXT').forEach(t => {
  if (t.fontName && t.fontName !== figma.mixed) fonts.add(JSON.stringify(t.fontName));
});
for (const f of fonts) await figma.loadFontAsync(JSON.parse(f));
```

---

## 2. `createInstance()` — COMPONENT only, never COMPONENT_SET

`createInstance()` exists on **COMPONENT** nodes. Calling it on a **COMPONENT_SET** throws `TypeError: not a function`.

```js
// ✗ WRONG — COMPONENT_SET has no createInstance
const compSet = await figma.getNodeByIdAsync('2609:873'); // type === 'COMPONENT_SET'
compSet.createInstance(); // TypeError: not a function

// ✓ RIGHT — find a specific COMPONENT variant first
const variant = await figma.getNodeByIdAsync('2609:874'); // type === 'COMPONENT'
const inst = variant.createInstance();
```

To create an instance of a specific variant combination, get the variant node with that combination from `compSet.children`:
```js
const compSet = await figma.getNodeByIdAsync('COMP_SET_ID');
// Find the variant matching desired properties
const variant = compSet.children.find(c => c.name.includes('State=default') && c.name.includes('Context=on-light'));
const inst = variant.createInstance();
```

Alternatively, create an instance of any variant then use `setProperties()`:
```js
const inst = anyVariant.createInstance();
// Key names come from componentPropertyDefinitions — they include #nodeId suffixes
inst.setProperties({
  'Label#2277:4': 'Visit adobe.com',
  'Show Icon End#2541:0': true,
  // VARIANT props use the option value directly, not a boolean:
  'State': 'hover',
  'Context': 'on-dark',
});
```

**Get exact key names from the component:**
```js
const keys = Object.keys(compSet.componentPropertyDefinitions);
// e.g. ['Label#2277:4', 'Show Icon End#2541:0', 'Icon End#2609:0', 'State', 'Context', ...]
```

---

## 3. Annotation diagram — `layoutMode: 'NONE'` canvas

When you need a **Specs-style layout diagram** (component + colored overlays + dimension brackets), use an absolute-positioned canvas:

```js
// The component renders at its native pixel size — you cannot scale instances.
// Build a canvas large enough to show it clearly (300–500px tall for small components).

const COMP_W = 114; const COMP_H = 24; // read from actual instance
const CARD_W = 560; const CARD_H = 240;
const CARD_X = 80;  const CARD_Y = 120;
const CX = CARD_X + (CARD_W - COMP_W) / 2; // center horizontally in card
const CY = CARD_Y + (CARD_H - COMP_H) / 2; // center vertically in card

const canvas = figma.createFrame();
canvas.name = 'annotation-diagram';
canvas.resize(1720, CARD_Y + CARD_H + 120);
canvas.layoutMode = 'NONE'; // ← absolute positioning
canvas.fills = []; canvas.strokes = [];

// 1. Card background
const card = figma.createRectangle();
card.resize(CARD_W, CARD_H); card.x = CARD_X; card.y = CARD_Y;
card.cornerRadius = 16;
// apply bgDefault fill via token

// 2. Colored overlay rectangles (append BEFORE instance so they're behind it)
const padTop = figma.createRectangle();
padTop.resize(COMP_W, 6); // 6px padding-top
padTop.x = CX; padTop.y = CY;
padTop.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.44, b: 0.96 }, opacity: 0.22 }];
padTop.strokes = [{ type: 'SOLID', color: { r: 0.13, g: 0.44, b: 0.96 } }];
padTop.strokeWeight = 1; padTop.strokeAlign = 'INSIDE';
canvas.appendChild(padTop);

// ... repeat for padding-bottom, gap zone (orange), etc.

// 3. Live component instance (on top of overlays)
const inst = variant.createInstance();
canvas.appendChild(inst);
inst.x = CX; inst.y = CY;

// 4. Dimension bracket — height (left side)
const vLine = figma.createLine();
vLine.rotation = 90; vLine.resize(COMP_H, 0);
vLine.x = CX - 32; vLine.y = CY + COMP_H;
vLine.strokes = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
vLine.strokeWeight = 1;
canvas.appendChild(vLine);

// 5. Tick marks at top and bottom of bracket
const topTick = figma.createLine();
topTick.resize(8, 0);
topTick.x = CX - 32 - 4; topTick.y = CY;
// ...

// 6. Leader lines from overlay zone to label on right margin
const leader = figma.createLine();
leader.resize(CARD_X + CARD_W + 48 - (CX + COMP_W) - 4, 0);
leader.x = CX + COMP_W + 4; leader.y = CY + 3; // center of top-pad zone
leader.strokes = [{ type: 'SOLID', color: { r: 0.13, g: 0.44, b: 0.96 }, opacity: 0.7 }];
leader.strokeWeight = 1;
canvas.appendChild(leader);

// 7. Label text at the end of the leader
const label = figma.createText();
label.characters = 'Padding top: 6px (raw)';
label.x = CARD_X + CARD_W + 48; label.y = CY - 6;
// apply caption style + content/caption color
canvas.appendChild(label);
```

**Key rules:**
- Overlay rectangles must be appended **before** the component instance (z-order)
- Set `canvas.layoutMode = 'NONE'` — the canvas is NOT auto-layout
- The canvas itself IS placed in an auto-layout `desktop` frame (treated as a block)
- Measure actual component dimensions by creating a throwaway instance off-screen first:
  ```js
  const measure = variant.createInstance();
  linkPage.appendChild(measure); measure.x = -99999; measure.y = -99999;
  await new Promise(r => setTimeout(r, 100));
  const w = measure.width; const h = measure.height;
  measure.remove();
  ```

---

## 4. Text node pattern — style before characters

Always set `textAutoResize` and width **before** applying styles, and apply `setTextStyleIdAsync` before setting colors (the style may override fills):

```js
const t = figma.createText();
// 1. Characters first (font must already be loaded)
t.characters = 'Your text here';
// 2. Set auto-resize + width
t.textAutoResize = 'HEIGHT';
t.resize(targetWidth, t.height);
// 3. Apply text style (async — changes fontName/fontSize)
await t.setTextStyleIdAsync('S:565931e51de6b933b7b1e79eec5803a05e080e86,');
// 4. Apply color fill via variable
const v = await figma.variables.getVariableByIdAsync('VariableID:6:82');
t.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r:1, g:1, b:1 } }, 'color', v)];
```

**Do NOT use `primaryAxisSizingMode` on text nodes** — it is not a valid property and will throw.

---

## 5. Auto-layout FILL ordering

Set `layoutSizingHorizontal = 'FILL'` **only after** the node has been appended to an auto-layout parent, not before:

```js
parent.appendChild(child);
child.layoutSizingHorizontal = 'FILL'; // ✓ — parent is now known
// vs:
child.layoutSizingHorizontal = 'FILL'; // ✗ — throws if not in layout parent yet
parent.appendChild(child);
```

---

## 6. `primaryAxisSizingMode = 'AUTO'` reassert after `resize()`

`resize()` resets `primaryAxisSizingMode` to `'FIXED'`. Reassert immediately after:

```js
frame.resize(targetW, 100);
frame.primaryAxisSizingMode = 'AUTO'; // must come AFTER resize()
```

---

## 7. Resolving component property key names

`componentPropertyDefinitions` keys include a `#nodeId` suffix for TEXT and BOOLEAN properties, but not for VARIANT properties:

```js
// Example keys:
// 'Label#2277:4'          ← TEXT
// 'Show Icon End#2541:0'  ← BOOLEAN
// 'Icon End#2609:0'       ← INSTANCE_SWAP
// 'State'                 ← VARIANT (no suffix)
// 'Context'               ← VARIANT (no suffix)

// Always read keys dynamically rather than hardcoding:
const propKeys = Object.keys(compSet.componentPropertyDefinitions);
```

When calling `inst.setProperties()`, use the exact key string including the suffix.

---

## 8. `createLine()` for vertical lines — rotation + y-position trick

**Never use `node.vectorNetwork = ...` directly** — in `dynamic-page` context it throws `Cannot call with documentAccess: dynamic-page. Use node.setVectorNetworkAsync instead`. For simple leader lines use `figma.createLine()`:

```js
// Horizontal line (default orientation)
const hLine = figma.createLine();
hLine.resize(width, 0);          // length = width
hLine.x = xLeft; hLine.y = y;   // top-left origin

// Vertical line — rotation trick
const vLine = figma.createLine();
vLine.rotation = 90;             // rotates around origin
vLine.resize(height, 0);         // length = height
// IMPORTANT: after rotation=90, the effective origin shifts.
// Set y = bottom of the intended line:
vLine.x = x;
vLine.y = yBottom;               // ← bottom y, NOT top y

// Styling
line.strokes = [{ type: 'SOLID', color: { r: 0.13, g: 0.44, b: 0.96 }, opacity: 0.8 }];
line.strokeWeight = 1.5;
line.fills = [];
canvas.appendChild(line);
```

**L-shaped leader from a badge to a component corner:**
```js
// Badge is above-left; component root corner is at (CX, CY)
// Vertical segment: drop from badge bottom to component top
addVLine(canvas, CX - 18, CY - 12, CY);   // x=CX-18, from y=CY-12 down to y=CY
// Horizontal segment: run right to component left edge
addHLine(canvas, CX - 18, CX, CY);         // from x=CX-18 to x=CX, at y=CY
```

---

## 9. Canvas frame hygiene — always clear strokes

Frames created with `figma.createFrame()` can inherit stray strokes from the document context. Always explicitly clear:

```js
const canvas = figma.createFrame();
canvas.layoutMode = 'NONE';
canvas.fills = [];
canvas.strokes = []; // ← required — prevents phantom blue borders
```

Same applies to card `figma.createRectangle()` backgrounds:
```js
const cardBg = figma.createRectangle();
cardBg.strokes = []; // clear any inherited stroke
```

---

## 10. Variable prefetch — use `Promise.all`, never `await` inside loops

`figma.variables.getVariableByIdAsync` is a round-trip to Figma for each call. Calling it inside a loop (once per table cell, once per row, once per section) accumulates 30–80+ round trips per script and reliably causes `timeout` errors on scripts that run for 25–30 seconds.

**Pattern: prefetch all variables once at the top of the script using `Promise.all`, then bind synchronously.**

```js
// ✓ RIGHT — one parallel batch at the top
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

// Sync fill helper — no await needed after prefetch
const P = { type: 'SOLID', color: { r: 1, g: 1, b: 1 } };
function sf(node, v) {
  node.fills = [figma.variables.setBoundVariableForPaint(P, 'color', v)];
}

// Usage anywhere in the script — no await:
sf(card, vBgDefault);
sf(titleText, vContentTitle);
```

```js
// ✗ WRONG — repeated awaits inside loops accumulate to 30–80+ round trips
for (const row of rows) {
  const v = await figma.variables.getVariableByIdAsync('VariableID:6:49'); // ← N calls
  sf(row, v);
}
```

**In `buildDocTable()`** — pass pre-fetched variable objects as parameters rather than resolving inside the helper:

```js
async function buildDocTable(name, rows, colWidths, vars) {
  // vars = { vBgDefault, vBorderSubtle, vContentLabel, vContentDef }
  // ...
  await applyFill(row, vars.vBgDefault);   // sync — no getVariableByIdAsync inside
}
```

**Rule of thumb:** The only `await` calls inside a large doc-generation script should be:
1. `Promise.all(...)` at the top for all variables
2. `setTextStyleIdAsync(...)` on text nodes (required async)
3. `loadFontAsync(...)` at the very top
Everything else can run synchronously.
