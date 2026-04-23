---
name: figma-to-json
description: Extract a component spec.json from any Figma node — component set, single variant, or full frame/section layout. Produces spec.json or a variant diff if the component already exists.
type: workflow
triggers:
  - "figma url"
  - "spec from figma"
  - "extract component"
  - "pull from figma"
  - "figma component to spec"
  - "generate spec"
filePattern: "packages/components/src/**/*.spec.json"
---

# Spec From Figma — Skill

Extract a `spec.json` from a Figma node, cross-reference the S2A component library, and either create a new spec or produce a variant diff.

## Input types handled

| Node type | Output |
|---|---|
| COMPONENT_SET | Full `spec.json` for all variants |
| COMPONENT (single variant) | Single-variant extraction, diff against existing if component exists |
| FRAME / SECTION | Pattern analysis — component inventory, new component proposals |

---

## Step 1 — Locate the node

```js
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('NODE_ID');
return { id: node.id, name: node.name, type: node.type };
```

Convert URL node-id format: `node-id=3271-2266` → `3271:2266`

---

## Step 2 — Extract for COMPONENT_SET

```js
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('NODE_ID');

const propDefs = node.componentPropertyDefinitions;

// Helper: resolve a bound variable ref to its token name
async function resolveVar(ref) {
  if (!ref) return null;
  const id = Array.isArray(ref) ? ref[0]?.id : ref?.id;
  if (!id) return null;
  const v = await figma.variables.getVariableByIdAsync(id);
  return v?.name ?? null;
}

// Per-variant structured extraction — layout, tokens mapped to CSS props, text nodes, child frames
const variantData = await Promise.all(node.children.map(async (variant) => {
  const bv = variant.boundVariables ?? {};

  // Exact layout dimensions and properties
  const layout = {
    width: Math.round(variant.width),
    height: Math.round(variant.height),
    layoutMode: variant.layoutMode,
    primaryAxisSizingMode: variant.primaryAxisSizingMode,
    counterAxisSizingMode: variant.counterAxisSizingMode,
    primaryAxisAlignItems: variant.primaryAxisAlignItems,
    counterAxisAlignItems: variant.counterAxisAlignItems,
    paddingTop: variant.paddingTop,
    paddingBottom: variant.paddingBottom,
    paddingLeft: variant.paddingLeft,
    paddingRight: variant.paddingRight,
    itemSpacing: variant.itemSpacing,
    cornerRadius: variant.cornerRadius,
  };

  // Resolve root-level token bindings in parallel — CSS prop → token name
  const [bgToken, ptToken, pbToken, plToken, prToken, gapToken, radiusToken] = await Promise.all([
    resolveVar(bv.fills),
    resolveVar(bv.paddingTop),
    resolveVar(bv.paddingBottom),
    resolveVar(bv.paddingLeft),
    resolveVar(bv.paddingRight),
    resolveVar(bv.itemSpacing),
    resolveVar(bv.topLeftRadius),
  ]);

  const tokens = {};
  if (bgToken)     tokens['background-color'] = bgToken;
  if (ptToken)     tokens['padding-top']       = ptToken;
  if (pbToken)     tokens['padding-bottom']     = pbToken;
  if (plToken)     tokens['padding-left']       = plToken;
  if (prToken)     tokens['padding-right']      = prToken;
  if (gapToken)    tokens['gap']                = gapToken;
  if (radiusToken) tokens['border-radius']      = radiusToken;

  // Text nodes — style name + color token per node per variant
  const textNodeEls = variant.findAll(n => n.type === 'TEXT');
  const textNodes = await Promise.all(textNodeEls.map(async n => {
    const colorRef = (n.boundVariables?.fills ?? [])[0];
    const [style, colorVar] = await Promise.all([
      n.textStyleId ? figma.getStyleByIdAsync(n.textStyleId) : null,
      colorRef?.id ? figma.variables.getVariableByIdAsync(colorRef.id) : null,
    ]);
    return {
      name: n.name,
      style: style?.name ?? null,
      colorToken: colorVar?.name ?? null,
      layoutSizingH: n.layoutSizingHorizontal,
      layoutSizingV: n.layoutSizingVertical,
    };
  }));

  // Direct child frames — how the layout is structured internally
  const childFrames = variant.children
    .filter(c => ['FRAME', 'GROUP'].includes(c.type))
    .map(c => ({
      name: c.name,
      w: Math.round(c.width),
      h: Math.round(c.height),
      layoutMode: c.layoutMode,
      primaryAxisAlignItems: c.primaryAxisAlignItems,
      primaryAxisSizingMode: c.primaryAxisSizingMode,
      counterAxisSizingMode: c.counterAxisSizingMode,
      layoutSizingH: c.layoutSizingHorizontal,
      layoutSizingV: c.layoutSizingVertical,
      itemSpacing: c.itemSpacing,
    }));

  return { name: variant.name, layout, tokens, textNodes, childFrames };
}));

// Full layer tree for first variant — names, types, key layout props
const layerTree = {
  variant: node.children[0]?.name,
  layers: node.children[0]?.findAll(() => true).slice(0, 50).map(n => ({
    name: n.name,
    type: n.type,
    layoutMode: n.layoutMode,
    layoutSizingH: n.layoutSizingHorizontal,
    layoutSizingV: n.layoutSizingVertical,
    w: Math.round(n.width),
    h: Math.round(n.height),
  })),
};

return { id: node.id, name: node.name, propDefs, variantData, layerTree };
```

---

## Step 3 — Extract for FRAME / SECTION

```js
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('NODE_ID');

const children = node.children.map(child => ({
  name: child.name,
  type: child.type,
  mainComponentSetId: child.type === 'INSTANCE' ? child.mainComponent?.parent?.id : null,
  mainComponentSetName: child.type === 'INSTANCE' ? child.mainComponent?.parent?.name : null,
  width: child.width, height: child.height,
}));

const usedSets = [...new Map(
  children.filter(c => c.mainComponentSetId)
    .map(c => [c.mainComponentSetId, { id: c.mainComponentSetId, name: c.mainComponentSetName }])
).values()];

return {
  frameName: node.name,
  totalChildren: children.length,
  usedComponentSets: usedSets,
  plainFrames: children.filter(c => c.type === 'FRAME').map(f => f.name),
};
```

---

## Step 4 — Cross-reference S2A library + external standards

Run all in parallel:

**S2A library (internal):**
```
list_components
find_component_for_use_case "{component name}"
```

**Design systems knowledge base (external):**
```
search_design_knowledge "{component type}"   → WCAG, ARIA, W3C, industry patterns
browse_by_category "components"              → browse known patterns
```

Use knowledge base results to inform the `a11y` block — correct ARIA role, WCAG SC codes, keyboard behavior. Always run both MCP servers.

If a confident S2A match is found, also run:
```
get_component_spec "{name}"     → full spec for diffing
get_component_tokens "{name}"   → all resolved token values
validate_spec "{name}"          → surface any existing drift before proposing changes
```

**Decision logic:**

| Situation | Action |
|---|---|
| No match in library | Write new `spec.json` |
| Name/use-case match | Run `get_component_spec` + `validate_spec`, generate variant diff table |
| Frame — children are instances | List which components are used, identify gaps |
| Frame — plain frames with patterns | Propose each as a new component, ask before writing |
| User wants best-practice audit | Run `get_component_spec` + `get_component_tokens` + `validate_spec`, surface all drift |

---

## Step 5 — Token name conversion + audit

**5a — Convert names:**
Figma variable name → CSS custom property:
```
"s2a/color/background/default"  →  "--s2a-color-background-default"
"s2a/spacing/md"                →  "--s2a-spacing-md"
"s2a/border/radius/sm"          →  "--s2a-border-radius-sm"
```
Rule: replace all `/` with `-`, prepend `--`

**Semantic tokens only.** If a resolved variable name contains a raw number (e.g. `s2a/spacing/16`), it is a primitive (`designOnly: true`) — flag it and resolve to the correct semantic alias:
- 8px → `--s2a-spacing-xs`
- 12px → `--s2a-spacing-sm`
- 16px → `--s2a-spacing-md`
- 24px → `--s2a-spacing-lg`
- 32px → `--s2a-spacing-xl`
- 40px → `--s2a-spacing-2xl`
- 48px → `--s2a-spacing-3xl`
- 64px → `--s2a-spacing-4xl`

**5b — CSS audit gate (required before writing):**

Build a draft CSS block from resolved bindings and run:
```
audit_css "{draft CSS}"  componentName: "{slug}"
```
Fix all violations before proceeding. Never write a spec or CSS file that fails `audit_css`.

---

## Step 6 — Write spec.json

Output path: `packages/components/src/{slug}/{slug}.spec.json`
Create directory if it doesn't exist.

### Canonical spec.json format

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
    {
      "name": "propName",
      "type": "string",
      "defaultValue": "\"default\"",
      "enum": ["value1", "value2"],
      "description": "What this prop does."
    }
  ],
  "tokenBindings": {
    "css-property:variant-combination": "--s2a-token-name"
  },
  "a11y": {
    "role": "...",
    "wcag": ["1.4.3", "2.1.1", "2.4.7"],
    "keyboard": [
      { "key": "Enter", "action": "..." }
    ],
    "notes": []
  }
}
```

### spec.json field rules

- `slug` = lowercase-kebab, must match the directory name
- `cssClass` = `c-` + slug
- `figmaNodeId` = COMPONENT_SET ID only (never a variant ID)
- `variants` axes = Figma property axis names, lowercased
- `tokenBindings` keys = `css-property:variant-combination`
- Only include token bindings that are actually bound in Figma — never invent them
- `forbiddenCombinations` = only explicitly broken/excluded combinations
- `a11y.wcag` = only SC codes that apply directly to this component

---

## Variant diff format

When the component exists, output this instead of a new spec:

```markdown
## Variant additions proposed for {ComponentName}

### New axes
- `context`: `on-dark`

### New token bindings
| Key | Token |
|---|---|
| `background-color:on-dark+default` | `--s2a-color-background-knockout` |

### Props to add
| Name | Type | Default | Description |
|---|---|---|---|
| `context` | `string` | `"on-light"` | Surface context |
```

---

## Step 7 — Validate after writing

After writing `spec.json`, run:
```
validate_spec "{slug}"
```
Fix any reported drift before telling the user the spec is complete.

---

## Non-negotiable rules

- Never modify existing spec files without user confirmation
- Never invent token bindings — only bound variables from Figma
- Never use primitive tokens in tokenBindings — always semantic
- Always run `audit_css` on the draft CSS before writing
- Always run `validate_spec` after writing
- Always run `list_components` before declaring something new
- `figmaNodeId` is always the COMPONENT_SET, never a variant
- After writing spec.json, remind: run `/spec <figma-url>` to generate Figma spec frames
- Flag any unresolved variable IDs: `⚠ unresolved: VariableID:X:Y`
