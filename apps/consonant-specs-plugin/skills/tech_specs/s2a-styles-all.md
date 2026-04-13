# Apply S2A Library Tokens

Replace colors, text styles, dimension tokens, and all other S2A properties in the current Figma selection with their exact matches from the S2A Foundations library. Only replaces values that have an exact match — anything not in the S2A library is left as-is.

## Scope

Works on the **current Figma selection** only. Get the selection using `figma_get_selection`.

## What gets replaced

1. **Responsive typography mode** — sets xl/lg/md/sm mode on the frame based on width
2. **Fill colors** — solid fills on any node
3. **Stroke colors** — solid strokes on any node
4. **Text styles** — font family + style + size matched to S2A typography styles
5. **Border radius** — corner radius values matched to S2A border/radius tokens
6. **Border width** — stroke weight values matched to S2A border/width tokens
7. **Spacing** — padding and gap (itemSpacing) values matched to S2A spacing tokens
8. **Layout** — width/height values matched to S2A layout tokens
9. **Opacity** — layer opacity values matched to S2A opacity tokens
10. **Blur** — blur effect radius values matched to S2A blur tokens

## S2A Library References

### Variable Collections (from S2A / Foundations team library)

- **S2A / Primitives / Color / Theme** — key: `23dfb9688d347020258cb5a8b587fd4c5c7287bc`
- **S2A / Semantic / Color / Theme** — key: `3659e0dcd09c2dca905bb94def94c5029e4d83ac`
- **S2A / Primitives / Dimension / Static** — key: `0eea5cc0320ff548eeb8c5bf34f6ede103b0df06`
- **S2A / Semantic / Dimension / Static** — key: `6c6b35ec4a5a89cf0598ba78e6c7482370d719ad`
- **S2A / Responsive / Container / Grid** — key: `ce424e312b8d55fff344955c7626321200e2bd3f`
  - Collection ID (once imported): `VariableCollectionId:ce424e312b8d55fff344955c7626321200e2bd3f/3364:45`

### Responsive Typography Modes

| Breakpoint | Width Range | Mode Name | Mode ID |
|---|---|---|---|
| XL (Plus Desktop) | 1920px+ | xl | `6:5` |
| LG (Desktop) | 1280–1919px | lg | `102:0` |
| MD (Tablet) | 1024–1279px | md | `102:1` |
| SM (Mobile) | 320–767px | sm | `2297:1` |

### Text Style Keys (from file `eGSyBcD5XdFXR8rJXJmVNY`)

| Style Name | Key |
|---|---|
| s2a/typography/super | `564079c9833ea03f5c5f8d7b759b17ee39778812` |
| s2a/typography/title-1 | `2ca3a4b582cbdeeac82b0dba6fc0657c4785ba5d` |
| s2a/typography/title-2 | `a4f7c56b483cc9de25de0eff562eda9da4b49b7b` |
| s2a/typography/titile-3 | `642cf45e2b9a74fad45b548c2b102dd910288194` |
| s2a/typography/title-4 | `5cf014300bccf1230a6e660f60bd4f4252a72816` |
| s2a/typography/body-lg | `565931e51de6b933b7b1e79eec5803a05e080e86` |
| s2a/typography/body-md | `8f9651588cc275ebe89d81b01b6344b3cf245539` |
| s2a/typography/body-sm | `688dea125c625313cdb9914dd76f7ef91c0cbe7a` |
| s2a/typography/body-xs | `ceb0450e2807d926b4fd00637fa00e1cffc02379` |
| s2a/typography/eyebrow | `152b1b57fb441ccfd288060043e1cd0a4365737f` |
| s2a/typography/label | `536bbf234b1a0a717cffe0e3c578fb0052669086` |
| s2a/typography/caption | `e572ca6995cb534da839d4c8bef75ec523efeb6f` |

Note: "titile-3" is the actual name in the library (typo is intentional/as-published).

### S2A Dimension Token Values (resolved)

These are the exact values to match against. Use the **scope** to determine which Figma property to check.

**Spacing** (scope: GAP, WIDTH_HEIGHT, TEXT_CONTENT — applies to padding, itemSpacing, gap)
| Token | Value |
|---|---|
| s2a/spacing/none | 0 |
| s2a/spacing/3xs | 2 |
| s2a/spacing/2xs | 4 |
| s2a/spacing/xs | 8 |
| s2a/spacing/sm | 12 |
| s2a/spacing/md | 16 |
| s2a/spacing/lg | 24 |
| s2a/spacing/xl | 32 |
| s2a/spacing/2xl | 40 |
| s2a/spacing/3xl | 48 |
| s2a/spacing/4xl | 64 |

**Layout** (scope: WIDTH_HEIGHT, GAP — applies to width, height, gap)
| Token | Value |
|---|---|
| s2a/layout/sm | 80 |
| s2a/layout/md | 96 |
| s2a/layout/lg | 124 |
| s2a/layout/xl | 160 |
| s2a/layout/2xl | 240 |

**Border Radius** (scope: CORNER_RADIUS)
| Token | Value |
|---|---|
| s2a/border/radius/none | 0 |
| s2a/border/radius/2xs | 2 |
| s2a/border/radius/xs | 4 |
| s2a/border/radius/sm | 8 |
| s2a/border/radius/md | 16 |
| s2a/border/radius/lg | 32 |
| s2a/border/radius/round | 999 |

**Border Width** (scope: STROKE_FLOAT)
| Token | Value |
|---|---|
| s2a/border/width/sm | 1 |
| s2a/border/width/md | 2 |
| s2a/border/width/lg | 4 |

**Blur** (scope: ALL_SCOPES — applies to blur effect radius)
| Token | Value |
|---|---|
| s2a/blur/xs | 8 |
| s2a/blur/sm | 16 |
| s2a/blur/md | 32 |
| s2a/blur/lg | 64 |

**Opacity** (scope: OPACITY)
| Token | Value (percentage) |
|---|---|
| s2a/opacity/scrim-subtle | 32 |
| s2a/opacity/disabled | 48 |
| s2a/opacity/scrim-strong | 64 |

## Workflow

### Step 1 — Get the current selection
Use `figma_get_selection` to get the selected nodes. If nothing is selected, ask the user to select something first. Record the node IDs of all selected frames.

### Step 2 — Set the responsive typography mode on the target frame

Determine the frame width and set the correct variable mode for the "S2A / Responsive / Container / Grid" collection. This is a quick operation — run it directly (not in an agent).

**Important:** use `getVariableCollectionByIdAsync` to get the collection object — `setExplicitVariableModeForCollection` requires the collection object, not the ID string.

```javascript
const node = await figma.getNodeByIdAsync('NODE_ID');
const width = node.width;

let modeId;
if (width >= 1920) modeId = '6:5';       // xl
else if (width >= 1280) modeId = '102:0'; // lg
else if (width >= 1024) modeId = '102:1'; // md
else modeId = '2297:1';                   // sm

const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
const responsiveCol = collections.find(c => c.name === 'S2A / Responsive / Container / Grid');
const libVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(responsiveCol.key);
const firstVar = await figma.variables.importVariableByKeyAsync(libVars[0].key);
const collectionId = firstVar.variableCollectionId;
const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);

node.setExplicitVariableModeForCollection(collection, modeId);
```

### Step 3 — Import and apply all tokens (PARALLEL with 5 Agents)

**ALWAYS launch all 5 agents in a single message to run in parallel:**

```
Agent 1 (Colors):           Import S2A color variables → apply fills/strokes
Agent 2 (Text Styles):      Import S2A text styles → apply to text nodes
Agent 3 (Spacing + Layout): Import S2A dimension tokens → apply padding, gap, width/height
Agent 4 (Borders):          Import S2A dimension tokens → apply corner radius, stroke weight
Agent 5 (Opacity + Blur):   Import S2A dimension tokens → apply opacity, blur effects
```

Each agent prompt must include: the selected node IDs, the relevant collection keys, and the specific properties to match and bind.

#### Agent 1 — Colors (Fills + Strokes)
Import both primitive and semantic color collections from the live S2A library. Build a map keyed by `hex|opacity`. Semantic tokens overwrite primitives (import semantic second).

Walk the selection tree. For each solid fill/stroke, convert color to hex, look up in colorMap, bind with `figma.variables.setBoundVariableForPaint()`.

**Skip nodes where fills/strokes contain non-SOLID types (IMAGE, GRADIENT) to avoid validation errors.**

#### Agent 2 — Text Styles
Import each text style by key from the live S2A library using `figma.importStyleByKeyAsync(key)`. Build lookup keyed by `fontFamily|fontStyle|fontSize`.

Walk the selection tree. For text nodes, match and apply using `node.textStyleId = style.id` or `node.setTextStyleIdAsync(styleId)`.

**Include the full text style keys table in the agent prompt.**

#### Agent 3 — Spacing + Layout
Import variables from both `S2A / Primitives / Dimension / Static` and `S2A / Semantic / Dimension / Static`. Filter to variables with scope GAP, WIDTH_HEIGHT, or TEXT_CONTENT.

Walk the selection tree and bind:
- **Padding**: `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight` — match against spacing tokens
- **Item Spacing / Gap**: `itemSpacing` — match against spacing tokens
- **Width/Height**: only match nodes with explicit fixed sizing (not auto-layout "fill" or "hug") — match against layout tokens

**Import in small batches (3-5 at a time) to avoid timeouts.**

#### Agent 4 — Borders (Radius + Width)
Import dimension variables, filter to CORNER_RADIUS and STROKE_FLOAT scopes.

Walk the selection tree and bind:
- **Corner Radius**: if uniform, bind `topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, `bottomRightRadius` — match against border/radius tokens
- **Stroke Weight**: `strokeWeight` — match against border/width tokens

#### Agent 5 — Opacity + Blur
Import dimension variables, filter to OPACITY and ALL_SCOPES.

Walk the selection tree and bind:
- **Opacity**: `node.opacity` — convert Figma 0-1 to percentage (`Math.round(node.opacity * 100)`), match against opacity tokens
- **Blur Effects**: for blur effects in `node.effects`, check `effect.radius` against blur tokens

### Step 4 — Verify and report results
After all 5 agents complete, take a screenshot to verify. Combine results from all agents and report:
- Responsive mode set
- Fills replaced with S2A color variables
- Strokes replaced
- Text nodes styled
- Border radii bound
- Stroke weights bound
- Spacing (padding/gap) bound
- Other tokens bound (opacity, blur, layout, etc.)
- Items left unchanged (no exact match)

## Helper: RGB to Hex

```javascript
function rgbToHex(r, g, b) {
  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
```

## Important Rules

- **EXACT MATCH ONLY** — never use "closest" matching. If a value doesn't exactly match an S2A token, leave it untouched.
- **Scope-aware matching** — a value of `8` could be spacing/xs, blur/xs, or border/radius/sm. Use the node property context to pick the right token (e.g., cornerRadius -> border/radius, itemSpacing -> spacing).
- **Do not modify layout structure** — only bind variables to existing properties. Never move, resize, or restructure nodes.
- **Prefer semantic over primitive** — if a value matches both, use the semantic token.
- **Handle timeouts gracefully** — import operations can be slow. Process in small batches and retry on timeout.
- **Use async APIs** — use `getVariableByIdAsync` (not `getVariableById`), `setTextStyleIdAsync` when sync fails.
- **Skip mixed fill types** — only modify fills/strokes arrays where all entries are SOLID to avoid validation errors.
- **ALWAYS parallelize Step 3** — launch all 5 agents in a single message. Do NOT run token categories sequentially.
- **Always import from the live S2A library** — never use cached/hardcoded token values. The library changes frequently.
- **Take a screenshot** after applying to verify the results visually.
