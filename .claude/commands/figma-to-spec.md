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

## Phase 3 — Cross-reference the S2A component library + external standards

Run these in parallel:

**S2A library (internal):**
```
list_components                                  → full component inventory
find_component_for_use_case "{description}"      → ranked match by use-case
```

**Design systems knowledge base (external):**
```
search_design_knowledge "{component type}"       → W3C, WCAG, ARIA, industry patterns
browse_by_category "components"                  → browse known component patterns
```

Use the knowledge base results to inform the `a11y` section (correct ARIA role, WCAG SC codes, keyboard interaction pattern) and to validate naming/structure decisions against industry standards. Always run both — internal tells you what exists in S2A, external tells you what the standards say it should be.

If `find_component_for_use_case` returns a confident match, also run:

```
get_component_spec "{name}"     → full spec: variants, props, tokenBindings, a11y
get_component_tokens "{name}"   → all tokens with resolved values across modes
validate_spec "{name}"          → drift report: spec vs live source files
```

Use `validate_spec` results as **best-practice context** — surface any existing drift to the user before proposing changes. This prevents compounding spec debt.

**Decision matrix:**

| Situation | Action |
|---|---|
| COMPONENT_SET node, no match in library | Create new `spec.json` |
| COMPONENT_SET node, matches existing by name/use | Run `get_component_spec` + `validate_spec`, then generate a **variant diff** |
| FRAME/SECTION, children are mostly instances | List which components are used, note any gaps |
| FRAME/SECTION, contains plain frames with repeating patterns | Propose each pattern as a new component or variant |
| Single COMPONENT variant, parent set exists in library | Run `validate_spec`, diff the specific variant against the spec |
| User wants a best-practice audit of an existing component | Run `get_component_spec` + `get_component_tokens` + `validate_spec`, surface all drift |

---

## Phase 4 — Resolve tokens + audit

**Step 4a — Token name conversion**

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

**Step 4b — CSS audit gate (required before writing)**

Once all tokens are resolved, build a draft CSS block from the bindings and run:

```
audit_css "{draft CSS}"  componentName: "{slug}"
```

- Fix any violations before writing `spec.json` or CSS files
- Never use primitive tokens (`--s2a-spacing-16`, `--s2a-color-gray-500`) — resolve to semantic aliases
- If `audit_css` returns violations, surface them to the user and resolve before proceeding

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

## Phase 6 — Validate after writing

After writing `spec.json`, immediately run:

```
validate_spec "{slug}"
```

Surface any drift (missing props, unmatched token bindings, absent Figma node ID). If drift is found, fix it before telling the user the spec is complete.

---

## Rules

- Never modify existing source files without confirmation
- Never invent token bindings — only include what's actually bound in Figma
- Never use primitive tokens (`--s2a-spacing-16`, `--s2a-spacing-32`) — resolve to semantic
- Always run `audit_css` on the draft CSS before writing — catch violations before they land in the spec
- Always run `validate_spec` after writing — confirm no drift between spec and source
- If a token isn't in the S2A system, flag it explicitly: `⚠ unresolved: VariableID:X:Y`
- Always cross-check with `list_components` before declaring something "new"
- The `figmaNodeId` in the spec is always the COMPONENT_SET ID, never a variant ID
- Create the component directory if it doesn't exist: `packages/components/src/{slug}/`
- After writing spec.json, remind the user to run `/spec <figma-url>` to generate the Figma spec frames
