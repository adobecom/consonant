# Figma Prototype

Read a Figma frame, match its layers to S2A components, and generate a validated Storybook story.

## Usage

```
/figma-prototype <figma-url> [optional intent]
```

Example: `/figma-prototype https://www.figma.com/design/…?node-id=… Hero for Adobe Firefly landing page`

---

## Step 0 — Parse the URL

Extract from the Figma URL:
- `fileKey` — segment after `/design/` or `/file/`
- `nodeId` — `node-id=` query param, convert `-` to `:`

---

## Step 1 — Read the Figma frame

Check MCP connection: `figma_get_status`. If not connected, ask the user to open Figma Desktop → Plugins → Development → figma-desktop-bridge → Run.

Load pages and get the node:
```js
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('NODE_ID');
return {
  name: node.name,
  type: node.type,
  width: node.width,
  height: node.height,
  children: node.children?.slice(0, 40).map(c => ({
    name: c.name,
    type: c.type,
    width: c.width,
    height: c.height,
    children: c.children?.slice(0, 20).map(g => ({ name: g.name, type: g.type })),
  })),
};
```

Take a screenshot of the frame for visual reference:
```js
const frame = await figma.getNodeByIdAsync('NODE_ID');
return await figma.exportAsync(frame, { format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
```

---

## Step 2 — Match layers to S2A components

Use `s2a-ds` MCP to look up components that match what you see in the frame:

```
list_components                            — full inventory
find_component_for_use_case "<description>" — ranked match
get_component_spec "<name>"               — exact props, variants, token bindings
```

For each significant layer group in the frame, identify:
- Which S2A component it maps to (Button, ProductLockup, ElasticCard, NavCard, Media, etc.)
- Which variant and props to use based on visual context
- Which S2A tokens to use for background color, text color, spacing

For layers with no S2A component match, use semantic token-only inline styles.

---

## Step 3 — Validate tokens

For any CSS you're about to write, run:
```
validate_css "<css snippet>"  componentName: "<slug>"
```

Fix any violations before writing. Never use:
- Primitive tokens (`--s2a-spacing-16`, `--s2a-color-gray-500`)
- Hardcoded hex values (`#1a1a1a`, `#f5f0ff`)
- Raw pixel values in fills (`padding: 24px` without a token)

---

## Step 4 — Generate the story

Write the story to `apps/storybook/stories/generated/{FrameName}.stories.js`.

**Mandatory patterns:**

```js
import { html } from 'lit';
import { Button } from '../../../../packages/components/src/button/index.js';
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';
// … other components

export default {
  title: 'Generated/{FrameName}',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export const Default = {
  render: () => html`
    <div style="
      padding: var(--s2a-spacing-3xl, 48px) var(--s2a-spacing-lg, 24px);
      background: var(--s2a-color-background-default, #fff);
    ">
      ${ProductLockup({ label: 'Adobe Firefly', app: 'firefly' })}
      ${Button({ label: 'Get started', background: 'solid', intent: 'accent' })}
    </div>
  `,
};
```

**Rules:**
- Import components from `../../../../packages/components/src/{slug}/index.js`
- Call components as functions in `html\`\`` templates: `${Button({ ... })}`
- NEVER use custom element tags: `<button-component>`, `<product-lockup>`
- NEVER hardcode colors, spacing, gradients, or font sizes
- ALWAYS use `var(--s2a-color-*, fallback)` syntax
- Include at least: `Default` export + `OnDark` variant if applicable

---

## Step 5 — Report

Tell the user:
- Frame name read from Figma
- Which S2A components were used and why
- Any layers that had no component match (and what inline token styles were applied)
- The story file path
- Next step: `/push "prototype: {frame name}"` to create a shareable preview URL
