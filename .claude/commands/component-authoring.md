# S2A Component Authoring

Full reference for building S2A component sets in Figma via `figma_execute`. Run this command at the start of any component build session.

## Usage
```
/component-authoring <component-name> [figma-url]
```

---

## Step 0 — Before writing any code

1. Check MCP connection: `figma_get_status`. If not connected → open Figma Desktop → Plugins → Development → figma-desktop-bridge → Run
2. If a Figma URL is provided, extract node ID (`node-id=3271-2266` → `3271:2266`) and file key (segment after `/design/`)
3. Screenshot the target page first to see existing content and find clear placement space
4. **Search for existing library components** — run `figma_execute` to find any components the new component should use as children (icons, lockups, media, etc.). Never build a placeholder frame when a real component exists.
5. **Look up text style IDs** — run `await figma.getLocalTextStylesAsync()` to get exact IDs before building. Never set `fontName`/`fontSize` manually.
6. Read `docs/workflows/figma-plugin-patterns.md` for all execution gotchas

---

## Property panel order — canonical, set at creation time

```
1. Variants       (◆)  — alphabetical order within this group
2. Booleans       (○)  — show/hide toggles ONLY — never for state or style
3. Instance Swaps (◇)  — swappable child components (icon, media, lockup)
4. Text           (@)  — every designer-editable text node
5. Nested props        — exposed sub-component props, grouped by sub-component
```

**Slots** go first only when the component uses Figma's Slot feature.

**Variant order note:** Figma's Properties panel always renders VARIANT properties (◆) at the top regardless of the order they appear in `componentPropertyDefinitions`. Within the Variants group, sort alphabetically: `Context` before `Size` before `State`. Call `addComponentProperty` for Booleans, Instance Swaps, and Text in order — Figma respects that order within each type group.

### ⚠ Never reorder properties programmatically

Deleting and re-adding a property destroys all existing instance override connections (icons lose swap targets, booleans lose layer bindings). Set order correctly at creation time. If an existing component needs reordering, drag properties manually in Figma's Properties panel.

---

## Property naming rules

### Names → Title Case
```
✓ State     ✓ Show Icon Start     ✓ Label     ✓ Icon End
✗ state     ✗ showIconStart       ✗ label     ✗ icon-end
```

### Values → always lowercase-kebab, no exceptions

Every property value — variant options, boolean labels, instance swap names — is lowercase-kebab. There are no Title Case exceptions.

| Axis | Values |
|---|---|
| State | `default`, `hover`, `pressed`, `focused`, `disabled` |
| Size | `sm`, `md`, `lg`, `xl` |
| Context | `on-light`, `on-dark` |
| Orientation | `vertical`, `horizontal` |
| Breakpoint | `mobile`, `tablet`, `desktop` |
| Width | `fill`, `hug` |

### Variant axis order

`State` → `Size` → `Style / Intent` → `Context` → `Orientation` → `Breakpoint`

Start with the most common / default state as the first variant.

---

## Layer naming conventions

```
ComponentName                    ← COMPONENT_SET — PascalCase
  └─ State=Default, Size=Md      ← COMPONENT — Figma auto-generates from property values, do not rename
       ├─ .root                  ← outermost frame — always named ".root"
       │    ├─ .icon-start       ← optional elements: dot-prefixed, kebab-case
       │    ├─ .text-group       ← structural containers: kebab-case, descriptive
       │    │    ├─ label        ← text layers: match the text property name exactly
       │    │    └─ body
       │    └─ .media
       └─ [focus ring]           ← visual-only layers: bracket-wrapped
            [hover overlay]
```

**Rules:**
- No unnamed layers — no "Frame 1", "Group 47", "Rectangle 3"
- COMPONENT_SET name = PascalCase display name (Button, ProductLockup, RouterCard)
- Root frame = always `.root`
- Optional/conditional = dot-prefixed, kebab: `.icon-start`, `.progress-bar`
- Structural containers = kebab, descriptive: `header`, `body`, `footer`, `actions-group`
- Visual-only = bracket-wrapped: `[focus ring]`, `[hover overlay]`, `[background]`
- Text layers = match the text property name: `label`, `heading`, `body`, `eyebrow`
- Slot containers = match the Figma Slot definition name: `Children`, `Action 1`, `Media`

---

## S2A token bindings — never hardcode

Every color, spacing, radius, and type decision must reference an S2A token. No hex values. No raw px in fills.

### Binding checklist per variant
- [ ] Background fill → `--s2a-color-background-*`
- [ ] Text color → `--s2a-color-content-*`
- [ ] Border / stroke → `--s2a-color-border-*`
- [ ] Focus ring → `--s2a-color-focus-ring-default`
- [ ] Padding (inner spacing) → `--s2a-spacing-*`
- [ ] Gap (between children) → `--s2a-spacing-*`
- [ ] Border radius → `--s2a-border-radius-*`
- [ ] Icon size → `--s2a-size-icon-*`
- [ ] Min / max width → responsive component token if applicable

### How to bind fills
```js
node.fills = [figma.variables.setBoundVariableForPaint(
  { type: 'SOLID', color: { r: 1, g: 1, b: 1 } },
  'color',
  variableObject   // ← resolved via getVariableByIdAsync
)];
```

### How to bind spacing / radius
```js
node.setBoundVariable('paddingLeft', spacingVar);
node.setBoundVariable('paddingRight', spacingVar);
node.setBoundVariable('paddingTop', spacingVar);
node.setBoundVariable('paddingBottom', spacingVar);
node.setBoundVariable('itemSpacing', gapVar);
node.setBoundVariable('topLeftRadius', radiusVar);
// etc. for all four corners
```

---

## figma_execute — mandatory patterns every script

### Font loading (paste at top of every script touching text)
```js
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
await figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Black' }); // title-4 — NOT ExtraBold
await figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' });       // body-lg, body-md
await figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' });          // label, caption, eyebrow
```

Known traps:

| Style | Actual font | Wrong guess |
|---|---|---|
| `s2a/typography/title-4` | Adobe Clean Display **Black** | ExtraBold |
| `s2a/typography/eyebrow` | Adobe Clean **Bold** | Regular |
| `s2a/typography/caption` | Adobe Clean **Bold** | Regular |
| `s2a/typography/body-lg` | Adobe Clean Regular | — |

### Variable prefetch — Promise.all, never await in loops
```js
// ✓ RIGHT — one parallel batch at the top
const [vBgDefault, vBgKnockout, vContentTitle, vContentDef, vBorderSubtle,
       vSpacing24, vSpacing16, vRadiusMd, vRadiusSm] = await Promise.all([
  figma.variables.getVariableByIdAsync('VariableID:6:49'),        // background/default
  figma.variables.getVariableByIdAsync('VariableID:6:18'),        // background/knockout
  figma.variables.getVariableByIdAsync('VariableID:2483:41398'),  // content/title
  figma.variables.getVariableByIdAsync('VariableID:6:82'),        // content/default
  figma.variables.getVariableByIdAsync('VariableID:6:22'),        // border/subtle
  figma.variables.getVariableByIdAsync('VariableID:1:87'),        // spacing/24
  figma.variables.getVariableByIdAsync('VariableID:1:85'),        // spacing/16
  figma.variables.getVariableByIdAsync('VariableID:2:95'),        // border/radius/md (16px)
  figma.variables.getVariableByIdAsync('VariableID:2:96'),        // border/radius/sm (8px)
]);

// ✗ WRONG — await inside loops = 30–80+ sequential round trips = timeout
for (const row of rows) {
  const v = await figma.variables.getVariableByIdAsync('VariableID:6:49'); // N calls
}
```

### Page navigation (re-declare in every script — each figma_execute is isolated)
```js
await figma.loadAllPagesAsync();
const targetPage = figma.root.children.find(p => p.name.includes('PageName'));
if (!targetPage) return { error: 'Page not found', pages: figma.root.children.map(p => p.name) };
await figma.setCurrentPageAsync(targetPage); // not figma.currentPage = targetPage
```

### createInstance — COMPONENT only, never COMPONENT_SET
```js
// ✗ WRONG — COMPONENT_SET has no createInstance
const compSet = await figma.getNodeByIdAsync('SET_ID'); // type === 'COMPONENT_SET'
compSet.createInstance(); // TypeError: not a function

// ✓ RIGHT — get a specific variant first
const variant = compSet.children.find(c => c.name.includes('State=Default'));
const inst = variant.createInstance();
```

### Auto-layout FILL — only after appendChild
```js
// ✓ RIGHT
parent.appendChild(child);
child.layoutSizingHorizontal = 'FILL';

// ✗ WRONG — throws if not in layout parent yet
child.layoutSizingHorizontal = 'FILL';
parent.appendChild(child);
```

### primaryAxisSizingMode — reassert after every resize()
```js
frame.resize(targetW, 100);
frame.primaryAxisSizingMode = 'AUTO'; // resize() resets it to FIXED — must come after
```

### Text styles — always use setTextStyleIdAsync, never manual fontName

Never set `fontName`, `fontSize`, `lineHeight`, or `letterSpacing` manually. Always use `setTextStyleIdAsync` with the real style ID from `figma.getLocalTextStylesAsync()`.

**Pattern — collect all text nodes, apply styles in one Promise.all, then apply fills:**
```js
// 1. Get style IDs at top of script
const styles = await figma.getLocalTextStylesAsync();
const TITLE4  = styles.find(s => s.name === 's2a/typography/title-4')?.id;
const BODY_MD = styles.find(s => s.name === 's2a/typography/body-md')?.id;

// 2. Create text nodes and collect for async application
const textConfigs = [];
const lbl = figma.createText();
lbl.characters = 'App name';
textConfigs.push({ node: lbl, styleId: TITLE4, colorVar: vContentTitle });

// 3. Apply ALL text styles together (never setTextStyleIdAsync inside a loop one-by-one)
await Promise.all(textConfigs.map(({ node, styleId }) => node.setTextStyleIdAsync(styleId)));

// 4. Apply fills AFTER text styles (text style must not override color)
for (const { node, colorVar } of textConfigs) {
  node.textAutoResize = 'HEIGHT';
  sf(node, colorVar);
}
```

**Known S2A text style IDs (matt-atoms file):**

| Style | ID | Font | Size |
|---|---|---|---|
| `s2a/typography/title-4` | `S:5cf014300bccf1230a6e660f60bd4f4252a72816,` | Adobe Clean Display Black | 24px |
| `s2a/typography/body-lg` | `S:565931e51de6b933b7b1e79eec5803a05e080e86,` | Adobe Clean Regular | 20px |
| `s2a/typography/body-md` | `S:8f9651588cc275ebe89d81b01b6344b3cf245539,` | Adobe Clean Regular | 16px |
| `s2a/typography/body-sm` | `S:688dea125c625313cdb9914dd76f7ef91c0cbe7a,` | Adobe Clean Regular | 14px |
| `s2a/typography/eyebrow` | `S:152b1b57fb441ccfd288060043e1cd0a4365737f,` | Adobe Clean Bold | 16px |
| `s2a/typography/label` | `S:536bbf234b1a0a717cffe0e3c578fb0052669086,` | Adobe Clean Bold | 14px |
| `s2a/typography/caption` | `S:e572ca6995cb534da839d4c8bef75ec523efeb6f,` | Adobe Clean Bold | 12px |

### Instance Swaps — use real library components, never placeholder frames

Before building any child element (icon, lockup, media), search for an existing component first:
```js
// Find available component sets
const allSets = figma.root.findAll(n => n.type === 'COMPONENT_SET').map(n => ({ id: n.id, name: n.name }));
// Or find a specific one
const appIconSet = figma.root.findOne(n => n.type === 'COMPONENT_SET' && n.name === 'AppIcon');
const appIconMd = appIconSet.children.find(c => c.name.includes('md'));
const inst = appIconMd.createInstance(); // createInstance on COMPONENT, not COMPONENT_SET
inst.name = '.app-icon';
parent.appendChild(inst);
```

**Add the instance swap property and bind it:**
```js
// addComponentProperty 3rd arg = the default component variant's node ID (not the set ID)
const appIconKey = cardSet.addComponentProperty('App Icon', 'INSTANCE_SWAP', appIconMd.id);

// Bind each variant's instance to the property
for (const variant of cardSet.children) {
  const iconInst = variant.findOne(n => n.name === '.app-icon' && n.type === 'INSTANCE');
  if (iconInst) iconInst.componentPropertyReferences = { mainComponent: appIconKey };
}
```

### Text node pattern — style before characters
```js
const t = figma.createText();
t.characters = 'Your text';          // 1. characters first (font must be loaded)
t.textAutoResize = 'HEIGHT';
t.resize(targetWidth, t.height);     // 2. set width
await t.setTextStyleIdAsync('S:...'); // 3. apply text style (async — changes fontName/size)
t.fills = [figma.variables.setBoundVariableForPaint(  // 4. apply color via token
  { type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', colorVar
)];
```

### Frame hygiene — always clear strokes
```js
const frame = figma.createFrame();
frame.fills = [];
frame.strokes = []; // prevents phantom blue borders from document context
```

### Component property key names — read dynamically
```js
// Keys include #nodeId suffixes for TEXT and BOOLEAN — not for VARIANT
// 'Label#2277:4'         ← TEXT
// 'Show Icon End#2541:0' ← BOOLEAN
// 'Icon End#2609:0'      ← INSTANCE_SWAP
// 'State'                ← VARIANT (no suffix)

const propKeys = Object.keys(compSet.componentPropertyDefinitions);
// Always read keys dynamically — never hardcode the suffix
```

### Expose text properties
```js
// addComponentProperty returns the key with #nodeId suffix
const labelKey = compSet.addComponentProperty('Label', 'TEXT', 'Default label text');
// Bind text node to property
textNode.componentPropertyReferences = { characters: labelKey };
```

### Space-between layout — use primaryAxisAlignItems, not primaryAxisAlignContent

`primaryAxisAlignContent` is a sealed/read-only property in Figma's plugin API and throws `TypeError: object is not extensible`. Use `primaryAxisAlignItems` instead:

```js
// ✗ WRONG — throws "object is not extensible"
frame.primaryAxisAlignContent = 'SPACE_BETWEEN';

// ✓ RIGHT
frame.primaryAxisAlignItems = 'SPACE_BETWEEN';
```

### Variant positioning after combineAsVariants

`combineAsVariants` stacks all variants at x:0, y:0. Always reposition manually after combining:

```js
const cardSet = figma.combineAsVariants([v1, v2, v3], page);
const GAP = 24;
cardSet.children.forEach((v, i) => {
  v.x = i * (variantWidth + GAP);
  v.y = 0;
});
cardSet.resize(variantWidth * cardSet.children.length + GAP * (cardSet.children.length - 1), variantHeight);
```

### Canvas / absolute-position pattern
```js
// For annotation diagrams, layout diagrams — not auto-layout
const canvas = figma.createFrame();
canvas.layoutMode = 'NONE'; // absolute positioning
canvas.fills = [];
canvas.strokes = [];
canvas.resize(1200, 600);
// Append children and set x/y directly
child.x = 80; child.y = 120;
canvas.appendChild(child);
```

### Vertical lines — rotation trick
```js
const vLine = figma.createLine();
vLine.rotation = 90;        // rotates around origin — y origin shifts
vLine.resize(height, 0);    // length = height
vLine.x = x;
vLine.y = yBottom;          // ← bottom of intended line, NOT top
```

### Placement — always inside a Section
```js
// Find or create a Section
let section = figma.currentPage.findOne(n => n.type === 'SECTION' && n.name === 'ComponentName');
if (!section) {
  section = figma.createSection();
  section.name = 'ComponentName';
  section.x = 0; section.y = 0;
}
section.appendChild(componentSet);
```

---

## Pre-run checklist

```text
- [ ] Read the live Figma component before building (variants, layers, bound tokens)
- [ ] Screenshot target page — identify clear placement space, avoid overlaps
- [ ] Delete any partial artifacts from failed attempts before retrying
- [ ] Fonts loaded at top of every script
- [ ] Variables prefetched with Promise.all
- [ ] Page navigation re-declared at top (not assumed from prior script)
- [ ] Property order: Variants → Booleans → Instance Swaps → Text
- [ ] Property names Title Case, values lowercase-kebab (except canonical variant values)
- [ ] All layers named — no "Frame N"
- [ ] Root frame named .root
- [ ] Optional layers dot-prefixed
- [ ] All fills / strokes token-bound — no hex
- [ ] Text properties exposed for every designer-editable node
- [ ] Booleans only for show/hide
- [ ] Instance swaps for any swappable child component
- [ ] FILL sizing set only after appendChild
- [ ] primaryAxisSizingMode = 'AUTO' reasserted after resize()
- [ ] createInstance() called on COMPONENT variant, not COMPONENT_SET
- [ ] Component placed inside a named Section
- [ ] Screenshot after creation — verify alignment, spacing, no overlaps
```

---

## Common token IDs (S2A / matt-atoms file)

| Token | VariableID | Resolved value |
|---|---|---|
| `s2a/color/background/default` | `VariableID:6:49` | surface white |
| `s2a/color/background/subtle` | `VariableID:6:47` | surface light gray |
| `s2a/color/background/knockout` | `VariableID:6:18` | dark surface |
| `s2a/color/content/title` | `VariableID:2483:41398` | primary text |
| `s2a/color/content/default` | `VariableID:6:82` | body text |
| `s2a/color/content/subheading` | `VariableID:2483:41397` | subheading |
| `s2a/color/content/label` | `VariableID:2483:41392` | label / caption |
| `s2a/color/content/body-subtle` | `VariableID:2483:41396` | secondary body |
| `s2a/color/content/knockout` | `VariableID:6:81` | text on dark |
| `s2a/color/border/subtle` | `VariableID:6:22` | subtle border |
| `s2a/spacing/16` | `VariableID:1:85` | 16px |
| `s2a/spacing/24` | `VariableID:1:87` | 24px |
| `s2a/border/radius/md` | `VariableID:2:95` | 16px |
| `s2a/border/radius/sm` | `VariableID:2:96` | 8px |

Raw token IDs: `packages/tokens/json/raw.json`

---

## Screenshot safety

- Target a specific FRAME node — never a PAGE
- Use `scale: 2` for small frames, `scale: 1` for large frames
- If the session has many prior `figma_execute` turns, start a new thread for screenshots (context window)
- Reference: `docs/workflows/codex-figma-console-context.md`
