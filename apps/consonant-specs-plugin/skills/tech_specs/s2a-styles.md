# Apply S2A Library Tokens (Colors + Text)

Replace colors and text styles in the current Figma selection with their exact matches from the S2A Foundations library. Only replaces values that have an exact match — anything not in the S2A library is left as-is.

## Scope

Works on the **current Figma selection** only. Get the selection using `figma_get_selection`.

## What gets replaced

1. **Responsive typography mode** — sets xl/lg/md/sm mode on the frame based on width, which controls text sizing
2. **Fill colors** — solid fills on any node (frames, shapes, text)
3. **Stroke colors** — solid strokes on any node
4. **Text fill colors** — fill colors on text nodes
5. **Text styles** — font family + style + size matched to S2A typography styles

## S2A Library References

### Variable Collections (from S2A / Foundations team library)

- **S2A / Primitives / Color / Theme** — key: `23dfb9688d347020258cb5a8b587fd4c5c7287bc`
- **S2A / Semantic / Color / Theme** — key: `3659e0dcd09c2dca905bb94def94c5029e4d83ac`
- **S2A / Responsive / Container / Grid** — key: `ce424e312b8d55fff344955c7626321200e2bd3f`
  - Collection ID (once imported): `VariableCollectionId:ce424e312b8d55fff344955c7626321200e2bd3f/3364:45`
  - Contains responsive typography variables (font-size, line-height, letter-spacing per style)

### Responsive Typography Modes

The S2A typography styles use responsive variables from the "S2A / Responsive / Container / Grid" collection. The correct mode must be set on the target frame based on its width:

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

### Step 3 — Import and apply colors + text styles (PARALLEL with Agents)

**ALWAYS launch 2 agents in a single message to run in parallel:**

```
Agent 1 (Colors):      Import S2A color variables from live library → apply fills/strokes to selection
Agent 2 (Text Styles): Import S2A text styles from live library → apply to text nodes in selection
```

#### Agent 1 — Colors
Import both primitive and semantic color collections from the live S2A library. Build a map keyed by `hex|opacity` to handle transparent colors correctly. Semantic tokens should overwrite primitives (import semantic second).

Walk the selection tree. For each solid fill/stroke, convert its color to hex, look up in the colorMap, and if exact match found, bind the S2A variable using `figma.variables.setBoundVariableForPaint()`.

**IMPORTANT:** Only modify nodes where ALL fills/strokes are SOLID type. Skip mixed fill types (IMAGE + SOLID) to avoid validation errors.

**Agent prompt must include:** The selected node IDs, the primitive and semantic color collection keys, and the rgbToHex helper function.

#### Agent 2 — Text Styles
Import each text style by key from the live S2A library using `figma.importStyleByKeyAsync(key)`. Build a lookup keyed by `fontFamily|fontStyle|fontSize`.

Walk the selection tree. For text nodes, build the lookup key from fontName + fontSize. If exact match found, set `node.textStyleId = style.id` or `node.setTextStyleIdAsync(styleId)` when sync fails.

**Agent prompt must include:** The selected node IDs and the full text style keys table.

### Step 4 — Verify and report results
After both agents complete, take a screenshot to verify. Combine results from both agents and report:
- Responsive mode set
- How many fills were replaced with S2A color variables
- How many strokes were replaced
- How many text nodes had S2A styles applied
- How many items were left unchanged (no exact match)

## Helper: RGB to Hex

```javascript
function rgbToHex(r, g, b) {
  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
```

## Important Rules

- **EXACT MATCH ONLY** — never use "closest" color matching. If a color is not in the S2A library, leave it untouched.
- **Do not modify layout** — only change colors, strokes, and text styles. Never move, resize, or restructure nodes.
- **Prefer semantic over primitive** — if a color matches both a semantic and primitive token, use the semantic token.
- **Handle timeouts gracefully** — import operations can be slow. Process in small batches and retry on timeout.
- **Use async APIs** — use `getVariableByIdAsync` (not `getVariableById`), `setTextStyleIdAsync` when sync fails.
- **Skip mixed fill types** — only modify fills/strokes arrays where all entries are SOLID to avoid validation errors.
- **ALWAYS parallelize Step 3** — launch both agents in a single message. Do NOT run colors then text sequentially.
- **Always import from the live S2A library** — never use cached/hardcoded token values. The library changes frequently.
- **Take a screenshot** after applying to verify the results visually.
