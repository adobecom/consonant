# Figma Prototype

Read a Figma frame via the Desktop Bridge (figma-console MCP), extract real component instances + bound tokens, match to S2A components, and write a validated Storybook story.

## Usage

```
/figma-prototype <figma-url> [optional intent]
```

Example: `/figma-prototype https://www.figma.com/design/…?node-id=… Hero for Adobe Firefly landing page`

---

## Step 0 — Parse the URL

Extract:
- `fileKey` — segment after `/design/` or `/file/`
- `nodeId` — `node-id=` query param, convert `-` to `:`

---

## Step 1 — Connect and navigate

Check connection: `figma_get_status`. If not connected → ask user to open Figma Desktop → Plugins → Development → figma-desktop-bridge → Run.

Navigate to the frame and take a screenshot for visual reference:

```js
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('NODE_ID');
if (!node) return { error: 'Node not found' };

// Screenshot
const bytes = await figma.exportAsync(node, {
  format: 'PNG',
  constraint: { type: 'SCALE', value: 1 }
});
return {
  name: node.name,
  type: node.type,
  width: node.width,
  height: node.height,
  imageBytes: Array.from(bytes),
};
```

---

## Step 2 — Deep structural extraction

This is the core extraction. Run via `figma_execute` — this reads what the design **actually is**, not just what it looks like.

```js
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('NODE_ID');
if (!node) return { error: 'Node not found' };

// Helper: resolve a bound variable ID to its name
async function resolveVar(id) {
  try {
    const v = await figma.variables.getVariableByIdAsync(id);
    return v ? v.name : id;
  } catch { return id; }
}

// Helper: collect all bound variable IDs from a node's boundVariables map
function collectBoundIds(bv) {
  const ids = [];
  for (const val of Object.values(bv ?? {})) {
    if (Array.isArray(val)) val.forEach(x => x?.id && ids.push({ prop: 'fills', id: x.id }));
    else if (val?.id) ids.push({ prop: 'unknown', id: val.id });
  }
  return ids;
}

// Walk the entire subtree
const allNodes = node.findAll(() => true);

// 1. INSTANCE nodes — real components
const instances = [];
for (const n of allNodes.filter(n => n.type === 'INSTANCE')) {
  const compSet = n.mainComponent?.parent;
  const boundIds = collectBoundIds(n.boundVariables ?? {});
  const resolvedTokens = await Promise.all(
    boundIds.map(async ({ prop, id }) => ({ prop, name: await resolveVar(id) }))
  );
  instances.push({
    layerName: n.name,
    componentSet: compSet?.name ?? null,
    variant: n.mainComponent?.name ?? null,
    exposedProps: n.componentProperties ?? {},
    boundTokens: resolvedTokens,
    x: n.x, y: n.y, width: n.width, height: n.height,
  });
}

// 2. TEXT nodes — typography + color
const textStyles = await figma.getLocalTextStylesAsync();
const styleIdToName = Object.fromEntries(textStyles.map(s => [s.id, s.name]));

const textNodes = [];
for (const n of allNodes.filter(n => n.type === 'TEXT')) {
  const fillIds = (n.boundVariables?.fills ?? []).map(f => f?.id).filter(Boolean);
  const resolvedFills = await Promise.all(fillIds.map(id => resolveVar(id)));
  textNodes.push({
    layerName: n.name,
    characters: n.characters?.slice(0, 80),
    textStyle: styleIdToName[n.textStyleId] ?? null,
    boundFillTokens: resolvedFills,
    fontSize: n.fontSize,
    y: n.y,
  });
}

// 3. Frame / container fills and spacing
const containers = [];
for (const n of allNodes.filter(n => ['FRAME', 'COMPONENT', 'GROUP'].includes(n.type))) {
  const fillIds = (n.boundVariables?.fills ?? []).map(f => f?.id).filter(Boolean);
  if (!fillIds.length && !n.boundVariables?.paddingTop) continue;
  const resolvedFills = await Promise.all(fillIds.map(id => resolveVar(id)));
  const spacingIds = ['paddingTop','paddingBottom','paddingLeft','paddingRight','itemSpacing']
    .map(k => ({ k, id: n.boundVariables?.[k]?.id }))
    .filter(x => x.id);
  const resolvedSpacing = await Promise.all(
    spacingIds.map(async ({ k, id }) => ({ prop: k, name: await resolveVar(id) }))
  );
  containers.push({
    layerName: n.name,
    boundFillTokens: resolvedFills,
    boundSpacingTokens: resolvedSpacing,
    layoutMode: n.layoutMode,
    width: n.width, height: n.height,
  });
}

return {
  frameName: node.name,
  frameWidth: node.width,
  frameHeight: node.height,
  instances,
  textNodes: textNodes.sort((a, b) => a.y - b.y),
  containers: containers.slice(0, 20),
};
```

---

## Step 3 — Map instances to S2A components

Use the extraction output from Step 2 to identify every S2A component present.

For each `instance.componentSet` name, look up the matching S2A component:

```
list_components                              — full inventory
find_component_for_use_case "<set name>"     — ranked match by name/use
get_component_spec "<matched name>"          — exact props, variants, token bindings
```

Build a mapping table:

| Figma componentSet | Figma variant | S2A component | Props to use |
|---|---|---|---|
| e.g. `Button` | `State=Default, Context=On Dark` | `Button` | `{ background: 'solid', context: 'on-dark' }` |

For `exposedProps` on each instance (text overrides, boolean toggles, instance swaps) — read the actual values and use them as prop values in the story.

For layers with **no** `componentSet` (plain frames, groups) — map their `boundFillTokens` to CSS custom properties:
- `s2a/color/background/knockout` → `--s2a-color-background-knockout`
- `s2a/spacing/lg` → `--s2a-spacing-lg`
(Replace `/` with `-`, prepend `--`)

---

## Step 4 — Validate token CSS

Before writing, build the layout CSS from the container `boundFillTokens` and `boundSpacingTokens`, then validate:

```
validate_css "<css snippet>"   componentName: "<frame-slug>"
```

Fix any violations. Rules:
- Never use primitive tokens (`--s2a-spacing-16`, `--s2a-color-gray-500`)
- Never hardcode hex or px values
- Every `var()` must have a fallback

---

## Step 5 — Write the story

Write to `apps/storybook/stories/generated/{FrameName}.stories.js`.

Use the component mapping and token data from Steps 3–4. The story must reflect the **actual structure** of the Figma frame — component order top-to-bottom matches `textNodes` sort order and instance `y` positions.

```js
import { html } from 'lit';
import { Button } from '../../../../packages/components/src/button/index.js';
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';
// import every matched S2A component

export default {
  title: 'Generated/{FrameName}',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export const Default = {
  render: () => html`
    <section style="
      padding: var(--s2a-spacing-3xl, 48px) var(--s2a-spacing-lg, 24px);
      background: var(--TOKEN-FROM-FRAME-FILL, #fff);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--s2a-spacing-lg, 24px);
    ">
      <!-- components in y-order from extraction -->
      ${ProductLockup({ label: 'ACTUAL LABEL FROM exposedProps', app: 'firefly', context: 'on-dark' })}
      <h2 style="margin:0;color:var(--s2a-color-content-knockout,#fff)">ACTUAL TEXT FROM textNodes</h2>
      ${Button({ label: 'ACTUAL LABEL', background: 'solid', intent: 'accent', context: 'on-dark' })}
    </section>
  `,
};
```

**Hard rules:**
- Component function props come from actual Figma `exposedProps` — not invented
- Text content comes from actual `textNodes[].characters` — not placeholder copy
- Background and spacing tokens come from actual `containers[].boundFillTokens` — not guessed
- NEVER use custom element tags
- NEVER hardcode colors, gradients, or font sizes
- ALWAYS `var(--s2a-token, fallback)` syntax

---

## Step 6 — Report

Tell the user:
- Frame name
- Every S2A component found and which Figma componentSet it mapped from
- Any layers with no component match (and what token styles were applied)
- Any unresolved token IDs (flagged with ⚠)
- The story file path
- Next step: `/push "prototype: {frame name}"` to get a shareable preview URL
