# Section 5: Component Details — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Component Details" section to the Spec-it output that shows every component instance in the tree with variant properties, overrides, nesting hierarchy, and S2A token matches.

**Architecture:** Single new file `src/spec-components.ts` exporting one async function. It walks the node tree collecting INSTANCE nodes, builds nested per-instance cards with property rows, and returns a FrameNode (or null). `src/spec-it.ts` gets one import + one call added.

**Tech Stack:** Figma Plugin API (TypeScript), S2A tokens via `src/tokens.ts`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/spec-components.ts` | Create | Instance tree walker, card builder, override resolver, section frame assembly |
| `src/spec-it.ts` | Modify (lines 1-4, 55-59) | Add import + call for component details section |

---

### Task 1: Scaffold spec-components.ts with instance collection

**Files:**
- Create: `src/spec-components.ts`

- [ ] **Step 1: Create the file with constants, interface, and tree walker**

```typescript
import { figmaColorToHex, getNodeFills } from './utils';
import { matchColor } from './tokens';

const BADGE_COLOR: RGB = { r: 0.91, g: 0.48, b: 0.18 };
const PROP_LABEL_COLOR: RGB = { r: 0.45, g: 0.45, b: 0.45 };
const PROP_VALUE_COLOR: RGB = { r: 0.15, g: 0.15, b: 0.15 };
const TOKEN_COLOR: RGB = { r: 0.18, g: 0.62, b: 0.47 };
const PROP_FONT_SIZE = 10;
const TABLE_WIDTH = 500;
const NEST_INDENT = 24;
const MAX_DEPTH = 4;

interface InstanceEntry {
  node: InstanceNode;
  depth: number;
  children: InstanceEntry[];
}

function collectInstances(node: SceneNode, depth: number): InstanceEntry[] {
  const results: InstanceEntry[] = [];
  if (!('children' in node)) return results;

  for (const child of node.children) {
    if (child.type === 'INSTANCE') {
      const entry: InstanceEntry = {
        node: child,
        depth,
        children: depth < MAX_DEPTH ? collectInstances(child, depth + 1) : [],
      };
      results.push(entry);
    } else {
      results.push(...collectInstances(child, depth));
    }
  }
  return results;
}
```

- [ ] **Step 2: Build the project to check for compile errors**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds (file has no exports used yet, but should compile cleanly)

- [ ] **Step 3: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-components.ts
git commit -m "feat(spec-components): scaffold file with instance tree walker"
```

---

### Task 2: Add property row helper and instance card builder

**Files:**
- Modify: `src/spec-components.ts`

- [ ] **Step 1: Add the addPropRow helper below the constants**

This follows the exact same pattern as `spec-anatomy.ts:69-95`:

```typescript
function addPropRow(parent: FrameNode, label: string, value: string, isToken: boolean = false): void {
  const row = figma.createFrame();
  row.name = `prop-${label}`;
  row.layoutMode = 'HORIZONTAL';
  row.primaryAxisSizingMode = 'FIXED';
  row.counterAxisSizingMode = 'AUTO';
  row.resize(TABLE_WIDTH - 24, 1);
  row.layoutAlign = 'STRETCH';
  row.fills = [];
  row.itemSpacing = 8;

  const labelText = figma.createText();
  labelText.fontName = { family: 'Inter', style: 'Regular' };
  labelText.fontSize = PROP_FONT_SIZE;
  labelText.characters = label;
  labelText.fills = [{ type: 'SOLID', color: PROP_LABEL_COLOR }];
  row.appendChild(labelText);

  const valueText = figma.createText();
  valueText.fontName = { family: 'Inter', style: 'Medium' };
  valueText.fontSize = PROP_FONT_SIZE;
  valueText.characters = value;
  valueText.fills = [{ type: 'SOLID', color: isToken ? TOKEN_COLOR : PROP_VALUE_COLOR }];
  row.appendChild(valueText);

  parent.appendChild(row);
}
```

- [ ] **Step 2: Add the buildInstanceCard function**

Add below `addPropRow`:

```typescript
async function buildInstanceCard(entry: InstanceEntry, parent: FrameNode): Promise<void> {
  const node = entry.node;
  const card = figma.createFrame();
  card.name = `instance-${node.name}`;
  card.layoutMode = 'VERTICAL';
  card.primaryAxisSizingMode = 'AUTO';
  card.counterAxisSizingMode = 'FIXED';
  card.resize(TABLE_WIDTH, 1);
  card.layoutAlign = 'STRETCH';
  card.fills = [];
  card.itemSpacing = 2;
  card.paddingTop = 8;
  card.paddingBottom = 12;
  card.paddingLeft = 12 + entry.depth * NEST_INDENT;
  card.paddingRight = 12;


  // Header: icon + instance name
  const headerRow = figma.createFrame();
  headerRow.name = 'header';
  headerRow.layoutMode = 'HORIZONTAL';
  headerRow.primaryAxisSizingMode = 'AUTO';
  headerRow.counterAxisSizingMode = 'AUTO';
  headerRow.fills = [];
  headerRow.itemSpacing = 8;

  const icon = figma.createText();
  icon.fontName = { family: 'Inter', style: 'Regular' };
  icon.fontSize = 11;
  icon.characters = '\u25C8'; // ◈
  icon.fills = [{ type: 'SOLID', color: BADGE_COLOR }];
  headerRow.appendChild(icon);

  const nameText = figma.createText();
  nameText.fontName = { family: 'Inter', style: 'Bold' };
  nameText.fontSize = 11;
  nameText.characters = node.name;
  nameText.fills = [{ type: 'SOLID', color: PROP_VALUE_COLOR }];
  headerRow.appendChild(nameText);

  card.appendChild(headerRow);

  // Main component
  const mainComponent = await node.getMainComponentAsync();
  if (mainComponent) {
    addPropRow(card, 'Main component:', mainComponent.name);

    // Component set
    const setParent = mainComponent.parent;
    if (setParent && setParent.type === 'COMPONENT_SET') {
      addPropRow(card, 'Component set:', setParent.name);

      // Available variants
      const variantNames = setParent.children.map((c) => c.name);
      const display = variantNames.length <= 6
        ? variantNames.join(', ')
        : variantNames.slice(0, 5).join(', ') + ` +${variantNames.length - 5} more`;
      addPropRow(card, 'Available variants:', display);
    }

    // Variant properties
    const variantProps = node.variantProperties;
    if (variantProps) {
      const pairs = Object.entries(variantProps).map(([k, v]) => `${k}=${v}`).join(', ');
      addPropRow(card, 'Variant properties:', pairs);
    }

    // Component ID
    addPropRow(card, 'Component ID:', mainComponent.id);
  } else {
    addPropRow(card, 'Main component:', 'Detached instance');
  }

  // Overrides
  const overrides = node.overrides;
  if (overrides && overrides.length > 0) {
    for (const override of overrides) {
      const overriddenNode = await figma.getNodeByIdAsync(override.id);
      if (!overriddenNode) continue;

      for (const field of override.overriddenFields) {
        if (field === 'characters' && overriddenNode.type === 'TEXT') {
          addPropRow(card, `Override (${overriddenNode.name}):`, `text = "${overriddenNode.characters}"`);
        } else if (field === 'fills' && 'fills' in overriddenNode) {
          const fills = getNodeFills(overriddenNode);
          for (const fill of fills) {
            const token = matchColor(fill.hex);
            addPropRow(
              card,
              `Override (${overriddenNode.name}):`,
              token ? `fill = ${fill.hex.toUpperCase()} \u2192 ${token}` : `fill = ${fill.hex.toUpperCase()}`,
              !!token,
            );
          }
        } else if (field === 'visible' && 'visible' in overriddenNode) {
          addPropRow(card, `Override (${overriddenNode.name}):`, `visible = ${overriddenNode.visible}`);
        }
      }
    }
  }

  // Divider
  const div = figma.createRectangle();
  div.name = 'divider';
  div.resize(TABLE_WIDTH - 24, 1);
  div.fills = [{ type: 'SOLID', color: { r: 0.92, g: 0.92, b: 0.92 } }];
  div.layoutAlign = 'STRETCH';
  card.appendChild(div);

  parent.appendChild(card);

  // Nested instance cards
  if (entry.children.length > 0) {
    for (const child of entry.children) {
      await buildInstanceCard(child, parent);
    }
  } else if (entry.depth >= MAX_DEPTH) {
    // Count deeper instances we're not rendering
    let deepCount = 0;
    const countDeep = (n: SceneNode) => {
      if (n.type === 'INSTANCE') deepCount++;
      if ('children' in n) n.children.forEach(countDeep);
    };
    node.children.forEach(countDeep);
    if (deepCount > 0) {
      const note = figma.createText();
      note.fontName = { family: 'Inter', style: 'Regular' };
      note.fontSize = PROP_FONT_SIZE;
      note.characters = `\u2026 ${deepCount} deeper instance${deepCount > 1 ? 's' : ''}`;
      note.fills = [{ type: 'SOLID', color: PROP_LABEL_COLOR }];
      note.layoutAlign = 'STRETCH';
      parent.appendChild(note);
    }
  }
}
```

- [ ] **Step 3: Build to check for compile errors**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-components.ts
git commit -m "feat(spec-components): add property rows and instance card builder"
```

---

### Task 3: Add the exported section generator

**Files:**
- Modify: `src/spec-components.ts`

- [ ] **Step 1: Add the generateComponentDetailsSection function at the bottom of the file**

```typescript
export async function generateComponentDetailsSection(sourceNode: SceneNode): Promise<FrameNode | null> {
  const instances = collectInstances(sourceNode, 0);
  if (instances.length === 0) return null;

  const section = figma.createFrame();
  section.name = 'Component Details';
  section.layoutMode = 'VERTICAL';
  section.primaryAxisSizingMode = 'AUTO';
  section.counterAxisSizingMode = 'AUTO';
  section.fills = [];
  section.itemSpacing = 16;

  // Section title
  const title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = 24;
  title.characters = 'Component Details';
  title.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  section.appendChild(title);

  // Container
  const container = figma.createFrame();
  container.name = 'components-container';
  container.layoutMode = 'VERTICAL';
  container.primaryAxisSizingMode = 'AUTO';
  container.counterAxisSizingMode = 'AUTO';
  container.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 } }];
  container.cornerRadius = 8;
  container.paddingTop = 12;
  container.paddingBottom = 12;
  container.paddingLeft = 12;
  container.paddingRight = 12;
  container.itemSpacing = 0;

  for (const entry of instances) {
    await buildInstanceCard(entry, container);
  }

  section.appendChild(container);

  return section;
}
```

- [ ] **Step 2: Build to check for compile errors**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-components.ts
git commit -m "feat(spec-components): add exported section generator"
```

---

### Task 4: Wire into spec-it.ts

**Files:**
- Modify: `src/spec-it.ts:1-4` (imports) and `src/spec-it.ts:55-59` (between typography and positioning)

- [ ] **Step 1: Add the import**

In `src/spec-it.ts`, change line 3 from:

```typescript
import { generateTypographySection } from './spec-typography';
```

to:

```typescript
import { generateTypographySection } from './spec-typography';
import { generateComponentDetailsSection } from './spec-components';
```

- [ ] **Step 2: Add the section call**

In `src/spec-it.ts`, after the typography section block (after line 59 `}`), add:

```typescript

  // Component details section
  figma.ui.postMessage({ type: 'spec-it-status', message: 'Generating component details...' });
  const componentsSection = await generateComponentDetailsSection(node);
  if (componentsSection) {
    specFrame.appendChild(componentsSection);
  }
```

- [ ] **Step 3: Build to verify everything compiles**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-it.ts
git commit -m "feat(spec-it): wire up component details section"
```

---

### Task 5: Manual test in Figma

**Files:** None (testing only)

- [ ] **Step 1: Load the plugin in Figma**

Open the Consonant Specs plugin in Figma development mode. Select a frame that contains component instances (ideally with nested instances and variant properties).

- [ ] **Step 2: Run Spec-it and verify the Component Details section**

Click "Spec it". Verify:
- The section appears after Typography
- Section title reads "Component Details"
- Each instance shows: name header with ◈ icon, main component, variant properties
- Nested instances are indented with left border
- Overrides display correctly (text overrides, fill overrides with token matches)
- Detached instances show "Detached instance"
- Instances without a component set omit that row
- Deep nesting (>4 levels) shows the "... N deeper instances" note

- [ ] **Step 3: Test edge case — frame with no instances**

Select a frame that has no component instances. Run Spec-it. Verify the Component Details section does not appear.

- [ ] **Step 4: Commit any fixes if needed, then final commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add -A
git commit -m "feat(spec-components): complete Section 5 Component Details"
```
