# Spec From Figma

Extract a component spec from any Figma node — a component set, a single variant, or a full frame/section — and produce a `spec.json` file (or a variant diff if the component already exists).

## Usage

```
/spec-from-figma <figma-url>
```

The URL can point to:
- A **COMPONENT_SET** → full spec extraction, all variants
- A **COMPONENT** (single variant) → single-variant spec or addition to existing
- A **FRAME / SECTION** → pattern extraction — identify what's reusable, what's a new component, what's a variant of something that exists

---

## Phase 1 — Connect and locate

1. Check `figma_get_status`. If not connected → tell user to open Figma Desktop → Plugins → Development → figma-desktop-bridge → Run.
2. Parse the URL:
   - Extract `fileKey` from the path segment after `/design/`
   - Extract `nodeId` from `node-id=` query param — convert `-` to `:`
3. Locate the node and determine its type:

```js
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('NODE_ID');
if (!node) return { error: 'Node not found' };
return {
  id: node.id,
  name: node.name,
  type: node.type,
  childCount: 'children' in node ? node.children.length : 0,
  x: node.x, y: node.y, width: node.width, height: node.height,
};
```

---

## Phase 2 — Extract raw data

Run the appropriate extraction based on node type.

### For COMPONENT_SET

```js
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('NODE_ID');

// 1. Component property definitions (variants, booleans, instance swaps, text props)
const propDefs = node.componentPropertyDefinitions;

// 2. Variant children — read each variant's bound variables
const variantData = await Promise.all(node.children.map(async (variant) => {
  const root = variant.findOne(n => n.name === '.root') ?? variant.children[0];
  const fills = root?.boundVariables?.fills ?? [];
  const fillVarIds = fills.map(f => f?.id).filter(Boolean);

  // Collect all bound variable IDs in this variant (fills, strokes, spacing, radius)
  const allBoundIds = [];
  variant.findAll(() => true).forEach(n => {
    const bv = n.boundVariables ?? {};
    Object.values(bv).forEach(b => {
      if (Array.isArray(b)) b.forEach(x => x?.id && allBoundIds.push(x.id));
      else if (b?.id) allBoundIds.push(b.id);
    });
  });
  const uniqueIds = [...new Set(allBoundIds)];

  // Resolve variable IDs to names
  const resolved = await Promise.all(uniqueIds.map(async id => {
    const v = await figma.variables.getVariableByIdAsync(id);
    return v ? { id, name: v.name } : null;
  }));

  return {
    name: variant.name,
    boundTokens: resolved.filter(Boolean),
  };
}));

// 3. Text styles used
const textNodes = node.findAll(n => n.type === 'TEXT');
const textStyleIds = [...new Set(textNodes.map(n => n.textStyleId).filter(Boolean))];
const textStyles = await Promise.all(textStyleIds.map(async id => {
  const s = await figma.getStyleByIdAsync(id);
  return s ? { id, name: s.name } : null;
}));

// 4. Layer structure (top-level only to stay within limits)
const layerTree = node.children.slice(0, 1).map(v => ({
  variant: v.name,
  layers: v.findAll(() => true).map(n => ({ name: n.name, type: n.type })).slice(0, 40),
}));

return {
  id: node.id,
  name: node.name,
  propDefs,
  variantData,
  textStyles: textStyles.filter(Boolean),
  layerTree,
};
```

### For a FRAME / SECTION (pattern extraction)

```js
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('NODE_ID');

// Walk top-level children and identify component instances vs plain frames
const children = node.children.map(child => ({
  name: child.name,
  type: child.type,
  mainComponentId: child.type === 'INSTANCE' ? child.mainComponent?.id : null,
  mainComponentSetId: child.type === 'INSTANCE' ? child.mainComponent?.parent?.id : null,
  mainComponentName: child.type === 'INSTANCE' ? child.mainComponent?.name : null,
  mainComponentSetName: child.type === 'INSTANCE' ? child.mainComponent?.parent?.name : null,
  width: child.width,
  height: child.height,
}));

// Find all unique component sets used
const usedSets = [...new Map(
  children
    .filter(c => c.mainComponentSetId)
    .map(c => [c.mainComponentSetId, { id: c.mainComponentSetId, name: c.mainComponentSetName }])
).values()];

// Find plain frames (potential new components or layout patterns)
const plainFrames = children.filter(c => c.type === 'FRAME');

return {
  frameId: node.id,
  frameName: node.name,
  totalChildren: children.length,
  usedComponentSets: usedSets,
  plainFrames: plainFrames.map(f => f.name),
  allChildren: children,
};
```

---

## Phase 3 — Cross-reference the S2A component library

After extraction, use the S2A MCP server to check what already exists:

```
list_components           → full component inventory
find_component_for_use_case "{component name or description}"
get_component "{name}"    → if it might already exist
```

**Decision matrix:**

| Situation | Action |
|---|---|
| COMPONENT_SET node, no match in library | Create new `spec.json` |
| COMPONENT_SET node, matches existing by name/use | Generate a **variant diff** — list props/tokens that differ |
| FRAME/SECTION, children are mostly instances | List which components are used, note any gaps |
| FRAME/SECTION, contains plain frames with repeating patterns | Propose each pattern as a new component or variant |
| Single COMPONENT variant, parent set exists in library | Flag the specific variant and diff it against the spec |

---

## Phase 4 — Resolve tokens

For each bound variable ID found in Phase 2, map to S2A semantic token name:
- Variable name format from Figma: `s2a/color/background/default` → CSS: `--s2a-color-background-default`
- Spacing: `s2a/spacing/md` → `--s2a-spacing-md`
- Use `check_token_exists` via S2A MCP to confirm each token is real
- Flag any unresolved IDs (tokens not in the S2A system — may be from a different library)

Token name transformation:
```
Figma variable name → CSS custom property
"s2a/color/background/default"  →  "--s2a-color-background-default"
"s2a/spacing/md"                →  "--s2a-spacing-md"
"s2a/border/radius/sm"          →  "--s2a-border-radius-sm"
```
(Replace `/` with `-`, prepend `--`)

---

## Phase 5 — Write the spec

### New component → write `spec.json`

Output to: `packages/components/src/{slug}/{slug}.spec.json`

Use the button spec as the canonical format reference:
```json
{
  "name": "ComponentName",
  "slug": "component-name",
  "figmaNodeId": "XXXX:YYYY",
  "cssClass": "c-component-name",
  "storybookId": "component-name",
  "description": "One sentence. What it is and where it's used.",
  "composedOf": [],
  "variants": {
    "axisName": ["value1", "value2"]
  },
  "forbiddenCombinations": [],
  "props": [
    { "name": "propName", "type": "string", "defaultValue": "\"default\"", "enum": ["..."], "description": "..." }
  ],
  "tokenBindings": {
    "css-property:variant-key": "--s2a-token-name"
  },
  "a11y": {
    "role": "...",
    "wcag": ["1.4.3"],
    "keyboard": [],
    "notes": []
  }
}
```

**spec.json rules:**
- `slug` = lowercase-kebab, matches directory name
- `cssClass` = `c-` prefix + slug
- `figmaNodeId` = the COMPONENT_SET node ID (not a variant)
- `variants` axes must match the Figma property axis names (lowercased)
- `tokenBindings` keys follow the pattern `css-property:variant-combination`
- Only include tokens that are actually bound in Figma — never invent bindings
- `forbiddenCombinations` = only combinations that are visually broken or explicitly excluded
- `a11y.wcag` = only SC codes that directly apply (1.4.3 contrast, 2.1.1 keyboard, 2.4.7 focus visible)

### Variant diff → print a diff table

If the component exists, output:
```
## Proposed variant additions to {ComponentName}

### New variant axis
- Axis: `context`
- New values: `on-dark`

### New token bindings
| Key | Token |
|---|---|
| `background-color:on-dark+default` | `--s2a-color-background-knockout` |

### Props to add
| Name | Type | Default | Description |
|---|---|---|---|
| `context` | `string` | `"on-light"` | Surface context |
```

### Pattern extraction → propose new components

For each plain frame or repeating pattern in a section:
1. Describe what it is in one sentence
2. Propose a `name`, `slug`, and `cssClass`
3. List the variants you can see
4. Flag which tokens are used vs which need to be identified
5. Ask: "Should I create a full spec.json for this?"

---

## Rules

- Never modify existing source files without confirmation
- Never invent token bindings — only include what's actually bound in Figma
- Never use primitive tokens (`--s2a-spacing-16`, `--s2a-spacing-32`) — resolve to semantic
- If a token isn't in the S2A system, flag it explicitly: `⚠ unresolved: VariableID:X:Y`
- Always cross-check with `list_components` before declaring something "new"
- The `figmaNodeId` in the spec is always the COMPONENT_SET ID, never a variant ID
- Create the component directory if it doesn't exist: `packages/components/src/{slug}/`
- After writing spec.json, remind the user to run `/spec <figma-url>` to generate the Figma spec frames
