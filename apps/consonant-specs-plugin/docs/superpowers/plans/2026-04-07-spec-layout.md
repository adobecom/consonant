# spec-layout.ts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Layout & Spacing section of the Spec-it feature, generating recursive Exhibits that visualize auto-layout properties with overlays, measurement labels, and S2A token badges — matching the Spectral reference style.

**Architecture:** Single module `src/spec-layout.ts` exporting `generateLayoutSection(sourceNode)`. Internally: collect auto-layout entries via depth-first walk, then for each entry generate an Exhibit frame with three horizontal panels (layer tree, annotated artwork clone, property panel). Overlays drawn as Figma rectangles positioned over the cloned design.

**Tech Stack:** TypeScript, Figma Plugin API, existing `utils.ts` and `tokens.ts` helpers.

**Design spec:** `docs/superpowers/specs/2026-04-07-spec-layout-design.md`

**Reference:** Figma file `I2Q0fPnIj2ATbd6pbb9bx1`, node `56:39138` ("Spectral" on "actions" page)

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/spec-layout.ts` | All layout section logic: tree collection, exhibit generation, overlays, panels |
| Modify | `src/spec-it.ts` | Import and call `generateLayoutSection` between anatomy and typography |

Everything lives in one file (`spec-layout.ts`) following the established pattern of `spec-anatomy.ts` (321 lines) and `spec-typography.ts` (177 lines). Expected size: ~500-600 lines.

---

### Task 1: Data types, constants, and tree collection

**Files:**
- Create: `src/spec-layout.ts`

- [ ] **Step 1: Create file with interfaces, constants, and tree collection logic**

```typescript
// src/spec-layout.ts
import { getAutoLayoutProps, figmaColorToHex, getNodeFills } from './utils';
import { matchSpacing, matchColor } from './tokens';

// --- Constants ---

const MAX_ARTWORK_WIDTH = 1200;
const SECTION_TITLE_SIZE = 24;

// Colors
const RED: RGB = { r: 0.9, g: 0.21, b: 0.21 };           // #E53535
const GREEN: RGB = { r: 0.18, g: 0.62, b: 0.47 };        // #2D9D78
const DARK: RGB = { r: 0.1, g: 0.1, b: 0.1 };            // #1A1A1A
const GRAY: RGB = { r: 0.6, g: 0.6, b: 0.6 };            // #999999
const LABEL_GRAY: RGB = { r: 0.45, g: 0.45, b: 0.45 };   // #737373
const VALUE_DARK: RGB = { r: 0.15, g: 0.15, b: 0.15 };   // #262626
const WHITE: RGB = { r: 1, g: 1, b: 1 };
const BG_LIGHT: RGB = { r: 0.97, g: 0.97, b: 0.97 };     // #F7F7F7

const PINK_OPACITY = 0.12;
const OUTLINE_WEIGHT = 1.5;
const OUTLINE_DASH: number[] = [6, 4];

// --- Interfaces ---

interface LayoutEntry {
  node: SceneNode;
  name: string;
  depth: number;
  parentChain: string[];
}

interface LayerTreeNode {
  name: string;
  type: string;
  depth: number;
  nodeId: string;
  children: LayerTreeNode[];
}

// --- Tree collection ---

function collectLayoutEntries(
  node: SceneNode,
  entries: LayoutEntry[],
  depth: number,
  parentChain: string[],
): void {
  if (
    'layoutMode' in node &&
    node.layoutMode !== 'NONE' &&
    'children' in node &&
    node.children.length > 0
  ) {
    entries.push({ node, name: node.name, depth, parentChain: [...parentChain] });
  }

  if ('children' in node) {
    const chain = [...parentChain, node.name];
    for (const child of node.children) {
      collectLayoutEntries(child, entries, depth + 1, chain);
    }
  }
}

function buildLayerTree(node: SceneNode, depth: number = 0): LayerTreeNode {
  const treeNode: LayerTreeNode = {
    name: node.name,
    type: node.type,
    depth,
    nodeId: node.id,
    children: [],
  };
  if ('children' in node) {
    for (const child of node.children) {
      treeNode.children.push(buildLayerTree(child, depth + 1));
    }
  }
  return treeNode;
}

interface FlatLayerEntry {
  name: string;
  depth: number;
  nodeId: string;
}

function flattenLayerTree(tree: LayerTreeNode, flat: FlatLayerEntry[] = []): FlatLayerEntry[] {
  flat.push({ name: tree.name, depth: tree.depth, nodeId: tree.nodeId });
  for (const child of tree.children) {
    flattenLayerTree(child, flat);
  }
  return flat;
}
```

- [ ] **Step 2: Build to verify no compile errors**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds (the file has no export yet, but imports should resolve)

- [ ] **Step 3: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-layout.ts
git commit -m "feat(spec-layout): add data types, constants, and tree collection"
```

---

### Task 2: Layer tree panel

**Files:**
- Modify: `src/spec-layout.ts`

- [ ] **Step 1: Add renderLayerTreePanel function**

Append after `flattenLayerTree`:

```typescript
function renderLayerTreePanel(
  layerTree: LayerTreeNode,
  currentNodeId: string,
): FrameNode {
  const panel = figma.createFrame();
  panel.name = 'Layer Tree';
  panel.layoutMode = 'VERTICAL';
  panel.primaryAxisSizingMode = 'AUTO';
  panel.counterAxisSizingMode = 'FIXED';
  panel.resize(280, 1);
  panel.fills = [];
  panel.itemSpacing = 2;

  const flat = flattenLayerTree(layerTree);

  for (const entry of flat) {
    const isCurrent = entry.nodeId === currentNodeId;

    const line = figma.createFrame();
    line.name = `layer-${entry.name}`;
    line.layoutMode = 'HORIZONTAL';
    line.primaryAxisSizingMode = 'AUTO';
    line.counterAxisSizingMode = 'AUTO';
    line.fills = [];
    line.paddingLeft = entry.depth * 12;

    const text = figma.createText();
    text.fontName = { family: 'Inter', style: isCurrent ? 'Bold' : 'Regular' };
    text.fontSize = 11;
    text.characters = entry.name;
    text.fills = [{ type: 'SOLID', color: isCurrent ? DARK : GRAY }];
    line.appendChild(text);

    panel.appendChild(line);
  }

  return panel;
}
```

- [ ] **Step 2: Build to verify**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-layout.ts
git commit -m "feat(spec-layout): add layer tree panel rendering"
```

---

### Task 3: Property panel

**Files:**
- Modify: `src/spec-layout.ts`

- [ ] **Step 1: Add sizing mode and alignment helpers**

Append after `renderLayerTreePanel`:

```typescript
function getSizingMode(node: SceneNode, axis: 'horizontal' | 'vertical'): string {
  const prop = axis === 'horizontal' ? 'layoutSizingHorizontal' : 'layoutSizingVertical';
  if (!(prop in node)) return 'Fixed';
  const value = (node as any)[prop] as string;
  if (value === 'HUG') return 'Hug';
  if (value === 'FILL') return 'Fill';
  return 'Fixed';
}

function getAlignmentString(node: SceneNode): string {
  if (!('primaryAxisAlignItems' in node) || !('counterAxisAlignItems' in node)) return '';
  const isVertical = 'layoutMode' in node && node.layoutMode === 'VERTICAL';

  const primaryMap: Record<string, string> = {
    MIN: isVertical ? 'Top' : 'Left',
    CENTER: 'Center',
    MAX: isVertical ? 'Bottom' : 'Right',
    SPACE_BETWEEN: 'Space Between',
  };
  const counterMap: Record<string, string> = {
    MIN: isVertical ? 'Left' : 'Top',
    CENTER: 'Center',
    MAX: isVertical ? 'Right' : 'Bottom',
  };

  const primary = primaryMap[node.primaryAxisAlignItems] || 'Min';
  const counter = counterMap[node.counterAxisAlignItems] || 'Min';

  // Convention: vertical position first, then horizontal
  if (isVertical) return `${primary} ${counter}`;
  return `${counter} ${primary}`;
}
```

- [ ] **Step 2: Add property panel rendering**

Append:

```typescript
function addPropertyRow(parent: FrameNode, label: string, value: string, icon?: string): void {
  const row = figma.createFrame();
  row.name = `prop-${label}`;
  row.layoutMode = 'HORIZONTAL';
  row.primaryAxisSizingMode = 'FIXED';
  row.counterAxisSizingMode = 'AUTO';
  row.resize(250, 1);
  row.layoutAlign = 'STRETCH';
  row.fills = [];
  row.itemSpacing = 8;

  const labelText = figma.createText();
  labelText.fontName = { family: 'Inter', style: 'Regular' };
  labelText.fontSize = 11;
  labelText.characters = label;
  labelText.fills = [{ type: 'SOLID', color: LABEL_GRAY }];
  row.appendChild(labelText);

  const valueFrame = figma.createFrame();
  valueFrame.name = 'value';
  valueFrame.layoutMode = 'HORIZONTAL';
  valueFrame.primaryAxisSizingMode = 'AUTO';
  valueFrame.counterAxisSizingMode = 'AUTO';
  valueFrame.fills = [];
  valueFrame.itemSpacing = 4;

  if (icon) {
    const iconText = figma.createText();
    iconText.fontName = { family: 'Inter', style: 'Regular' };
    iconText.fontSize = 11;
    iconText.characters = icon;
    iconText.fills = [{ type: 'SOLID', color: VALUE_DARK }];
    valueFrame.appendChild(iconText);
  }

  const valueText = figma.createText();
  valueText.fontName = { family: 'Inter', style: 'Medium' };
  valueText.fontSize = 11;
  valueText.characters = value;
  valueText.fills = [{ type: 'SOLID', color: VALUE_DARK }];
  valueFrame.appendChild(valueText);

  row.appendChild(valueFrame);
  parent.appendChild(row);
}

function renderPropertyPanel(entry: LayoutEntry): FrameNode {
  const panel = figma.createFrame();
  panel.name = 'Properties';
  panel.layoutMode = 'VERTICAL';
  panel.primaryAxisSizingMode = 'AUTO';
  panel.counterAxisSizingMode = 'FIXED';
  panel.resize(250, 1);
  panel.fills = [];
  panel.itemSpacing = 8;

  const node = entry.node;

  // Node name
  const nameText = figma.createText();
  nameText.fontName = { family: 'Inter', style: 'Bold' };
  nameText.fontSize = 13;
  nameText.characters = entry.name;
  nameText.fills = [{ type: 'SOLID', color: DARK }];
  panel.appendChild(nameText);

  // Width
  const hMode = getSizingMode(node, 'horizontal');
  addPropertyRow(panel, 'Width', `${hMode}  ${Math.round(node.width)}px`, '↔');

  // Height
  const vMode = getSizingMode(node, 'vertical');
  addPropertyRow(panel, 'Height', `${vMode}  ${Math.round(node.height)}px`, '↕');

  // Fill variable
  const fills = getNodeFills(node);
  if (fills.length > 0) {
    const token = matchColor(fills[0].hex);
    if (token) {
      addPropertyRow(panel, 'Fill variable', token);
    }
  }

  // Direction
  const autoLayout = getAutoLayoutProps(node);
  if (autoLayout) {
    const dirIcon = autoLayout.direction === 'VERTICAL' ? '↓' : '→';
    addPropertyRow(panel, 'Direction', autoLayout.direction === 'VERTICAL' ? 'Vertical' : 'Horizontal', dirIcon);

    // Align Children
    const alignment = getAlignmentString(node);
    if (alignment) {
      addPropertyRow(panel, 'Align Children', alignment, '⊞');
    }

    // Padding
    const { paddingTop, paddingRight, paddingBottom, paddingLeft } = autoLayout;
    if (paddingTop > 0 || paddingRight > 0 || paddingBottom > 0 || paddingLeft > 0) {
      const allSame = paddingTop === paddingRight && paddingRight === paddingBottom && paddingBottom === paddingLeft;
      const topBottom = paddingTop === paddingBottom;
      const leftRight = paddingLeft === paddingRight;
      let padStr: string;
      if (allSame) {
        padStr = `${paddingTop}px`;
      } else if (topBottom && leftRight) {
        padStr = `${paddingTop}px  ${paddingRight}px`;
      } else {
        padStr = `${paddingTop}px  ${paddingRight}px  ${paddingBottom}px  ${paddingLeft}px`;
      }
      addPropertyRow(panel, 'Padding', padStr);
    }

    // Gap
    if (autoLayout.gap > 0) {
      const token = matchSpacing(`${autoLayout.gap}`);
      const gapStr = token ? token : `${autoLayout.gap}`;
      addPropertyRow(panel, 'Gap', gapStr, '⇥');
    }
  }

  return panel;
}
```

- [ ] **Step 3: Build to verify**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-layout.ts
git commit -m "feat(spec-layout): add property panel with sizing, alignment, and tokens"
```

---

### Task 4: Artwork panel — clone and red dashed outlines

**Files:**
- Modify: `src/spec-layout.ts`

- [ ] **Step 1: Add coordinate helper and red outline drawing**

Append after `renderPropertyPanel`:

```typescript
interface RelativeBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getRelativeBox(node: SceneNode, root: SceneNode, scale: number): RelativeBox {
  const relX = node.absoluteTransform[0][2] - root.absoluteTransform[0][2];
  const relY = node.absoluteTransform[1][2] - root.absoluteTransform[1][2];
  return {
    x: relX * scale,
    y: relY * scale,
    width: node.width * scale,
    height: node.height * scale,
  };
}

function drawDashedRect(box: RelativeBox, parent: FrameNode): void {
  const rect = figma.createRectangle();
  rect.name = 'outline';
  rect.x = box.x;
  rect.y = box.y;
  rect.resize(Math.max(box.width, 1), Math.max(box.height, 1));
  rect.fills = [];
  rect.strokes = [{ type: 'SOLID', color: RED }];
  rect.strokeWeight = OUTLINE_WEIGHT;
  rect.dashPattern = OUTLINE_DASH;
  parent.appendChild(rect);
}
```

- [ ] **Step 2: Add createArtworkPanel function**

Append:

```typescript
function createArtworkPanel(
  sourceNode: SceneNode,
  exhibitedNode: SceneNode,
): FrameNode {
  const artworkFrame = figma.createFrame();
  artworkFrame.name = 'Artwork';
  artworkFrame.clipsContent = true;
  artworkFrame.fills = [];

  // Clone and scale
  const clone = sourceNode.clone();
  clone.x = 0;
  clone.y = 0;
  const scale = sourceNode.width > MAX_ARTWORK_WIDTH
    ? MAX_ARTWORK_WIDTH / sourceNode.width
    : 1;
  if (scale < 1) {
    clone.rescale(scale);
  }
  artworkFrame.appendChild(clone);
  artworkFrame.resize(clone.width, clone.height);

  // Red dashed outline on exhibited node
  const exhibitBox = getRelativeBox(exhibitedNode, sourceNode, scale);
  drawDashedRect(exhibitBox, artworkFrame);

  // Red dashed outlines on direct children
  if ('children' in exhibitedNode) {
    for (const child of exhibitedNode.children) {
      const childBox = getRelativeBox(child, sourceNode, scale);
      drawDashedRect(childBox, artworkFrame);
    }
  }

  return artworkFrame;
}
```

- [ ] **Step 3: Build to verify**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-layout.ts
git commit -m "feat(spec-layout): add artwork panel with clone and red outlines"
```

---

### Task 5: Artwork panel — pink bands (padding + spacing)

**Files:**
- Modify: `src/spec-layout.ts`

- [ ] **Step 1: Add pink overlay rectangle helper**

Append after `createArtworkPanel`:

```typescript
function drawPinkRect(x: number, y: number, w: number, h: number, parent: FrameNode): void {
  if (w <= 0 || h <= 0) return;
  const rect = figma.createRectangle();
  rect.name = 'overlay';
  rect.x = x;
  rect.y = y;
  rect.resize(w, h);
  rect.fills = [{ type: 'SOLID', color: RED, opacity: PINK_OPACITY }];
  parent.appendChild(rect);
}
```

- [ ] **Step 2: Add padding band drawing**

Append:

```typescript
function drawPaddingBands(
  artworkFrame: FrameNode,
  exhibitedNode: SceneNode,
  sourceNode: SceneNode,
  scale: number,
): void {
  const autoLayout = getAutoLayoutProps(exhibitedNode);
  if (!autoLayout) return;

  const box = getRelativeBox(exhibitedNode, sourceNode, scale);
  const pt = autoLayout.paddingTop * scale;
  const pr = autoLayout.paddingRight * scale;
  const pb = autoLayout.paddingBottom * scale;
  const pl = autoLayout.paddingLeft * scale;

  // Top
  if (pt > 0) drawPinkRect(box.x, box.y, box.width, pt, artworkFrame);
  // Bottom
  if (pb > 0) drawPinkRect(box.x, box.y + box.height - pb, box.width, pb, artworkFrame);
  // Left (between top and bottom padding)
  if (pl > 0) drawPinkRect(box.x, box.y + pt, pl, box.height - pt - pb, artworkFrame);
  // Right
  if (pr > 0) drawPinkRect(box.x + box.width - pr, box.y + pt, pr, box.height - pt - pb, artworkFrame);
}
```

- [ ] **Step 3: Add item-spacing band drawing**

Append:

```typescript
function drawSpacingBands(
  artworkFrame: FrameNode,
  exhibitedNode: SceneNode,
  sourceNode: SceneNode,
  scale: number,
): void {
  if (!('children' in exhibitedNode) || exhibitedNode.children.length < 2) return;
  const autoLayout = getAutoLayoutProps(exhibitedNode);
  if (!autoLayout || autoLayout.gap <= 0) return;

  const isVertical = autoLayout.direction === 'VERTICAL';
  const nodeBox = getRelativeBox(exhibitedNode, sourceNode, scale);
  const children = exhibitedNode.children;

  for (let i = 0; i < children.length - 1; i++) {
    const currBox = getRelativeBox(children[i], sourceNode, scale);
    const nextBox = getRelativeBox(children[i + 1], sourceNode, scale);

    if (isVertical) {
      const gapY = currBox.y + currBox.height;
      const gapH = nextBox.y - gapY;
      if (gapH > 0) drawPinkRect(nodeBox.x, gapY, nodeBox.width, gapH, artworkFrame);
    } else {
      const gapX = currBox.x + currBox.width;
      const gapW = nextBox.x - gapX;
      if (gapW > 0) drawPinkRect(gapX, nodeBox.y, gapW, nodeBox.height, artworkFrame);
    }
  }
}
```

- [ ] **Step 4: Wire bands into createArtworkPanel**

In `createArtworkPanel`, add these two calls before the `return artworkFrame;` line:

```typescript
  // Pink padding bands
  drawPaddingBands(artworkFrame, exhibitedNode, sourceNode, scale);

  // Pink item-spacing bands
  drawSpacingBands(artworkFrame, exhibitedNode, sourceNode, scale);

  return artworkFrame;
```

- [ ] **Step 5: Build and commit**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-layout.ts
git commit -m "feat(spec-layout): add pink padding and spacing band overlays"
```

---

### Task 6: Artwork panel — measurement labels and S2A token badges

**Files:**
- Modify: `src/spec-layout.ts`

- [ ] **Step 1: Add measurement label and token badge helpers**

Append after `drawSpacingBands`:

```typescript
function createMeasureLabel(value: string, x: number, y: number, parent: FrameNode): FrameNode {
  const label = figma.createFrame();
  label.name = `label-${value}`;
  label.layoutMode = 'HORIZONTAL';
  label.primaryAxisSizingMode = 'AUTO';
  label.counterAxisSizingMode = 'AUTO';
  label.primaryAxisAlignItems = 'CENTER';
  label.counterAxisAlignItems = 'CENTER';
  label.paddingLeft = 5;
  label.paddingRight = 5;
  label.paddingTop = 2;
  label.paddingBottom = 2;
  label.cornerRadius = 3;
  label.fills = [{ type: 'SOLID', color: RED }];
  label.x = x;
  label.y = y;

  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Bold' };
  text.fontSize = 10;
  text.characters = value;
  text.fills = [{ type: 'SOLID', color: WHITE }];
  label.appendChild(text);

  parent.appendChild(label);
  return label;
}

function createTokenBadge(tokenName: string, value: string, x: number, y: number, parent: FrameNode): FrameNode {
  const badge = figma.createFrame();
  badge.name = `token-${tokenName}`;
  badge.layoutMode = 'HORIZONTAL';
  badge.primaryAxisSizingMode = 'AUTO';
  badge.counterAxisSizingMode = 'AUTO';
  badge.primaryAxisAlignItems = 'CENTER';
  badge.counterAxisAlignItems = 'CENTER';
  badge.paddingLeft = 6;
  badge.paddingRight = 6;
  badge.paddingTop = 2;
  badge.paddingBottom = 2;
  badge.cornerRadius = 3;
  badge.fills = [{ type: 'SOLID', color: GREEN }];
  badge.x = x;
  badge.y = y;

  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Medium' };
  text.fontSize = 9;
  text.characters = `${tokenName} ${value}`;
  text.fills = [{ type: 'SOLID', color: WHITE }];
  badge.appendChild(text);

  parent.appendChild(badge);
  return badge;
}
```

- [ ] **Step 2: Add drawMeasurements function**

Append:

```typescript
function drawMeasurements(
  artworkFrame: FrameNode,
  exhibitedNode: SceneNode,
  sourceNode: SceneNode,
  scale: number,
): void {
  const box = getRelativeBox(exhibitedNode, sourceNode, scale);
  const autoLayout = getAutoLayoutProps(exhibitedNode);

  // Width label centered above the exhibited node
  createMeasureLabel(
    `${Math.round(exhibitedNode.width)}`,
    box.x + box.width / 2 - 15,
    box.y - 18,
    artworkFrame,
  );

  if (!autoLayout) return;

  const rightEdge = box.x + box.width + 8;

  // Padding labels at right edge
  const { paddingTop, paddingRight, paddingBottom, paddingLeft, gap } = autoLayout;
  let badgeY = box.y;

  if (paddingTop > 0) {
    createMeasureLabel(`${paddingTop}`, rightEdge, box.y + (paddingTop * scale) / 2 - 7, artworkFrame);
    badgeY = box.y + (paddingTop * scale) / 2 + 10;
  }
  if (paddingBottom > 0) {
    createMeasureLabel(`${paddingBottom}`, rightEdge, box.y + box.height - (paddingBottom * scale) / 2 - 7, artworkFrame);
  }
  if (paddingLeft > 0) {
    createMeasureLabel(`${paddingLeft}`, box.x + (paddingLeft * scale) / 2 - 10, box.y + box.height + 4, artworkFrame);
  }
  if (paddingRight > 0) {
    createMeasureLabel(`${paddingRight}`, box.x + box.width - (paddingRight * scale) / 2 - 10, box.y + box.height + 4, artworkFrame);
  }

  // Item spacing labels + token badges between children
  if (gap > 0 && 'children' in exhibitedNode && exhibitedNode.children.length >= 2) {
    const isVertical = autoLayout.direction === 'VERTICAL';
    const token = matchSpacing(`${gap}`);
    const children = exhibitedNode.children;

    for (let i = 0; i < children.length - 1; i++) {
      const currBox = getRelativeBox(children[i], sourceNode, scale);
      const nextBox = getRelativeBox(children[i + 1], sourceNode, scale);

      if (isVertical) {
        const gapY = currBox.y + currBox.height;
        const gapH = nextBox.y - gapY;
        if (gapH > 0) {
          createMeasureLabel(`${gap}`, rightEdge, gapY + gapH / 2 - 7, artworkFrame);
          if (token) {
            createTokenBadge(token, `${gap}`, rightEdge + 35, gapY + gapH / 2 - 7, artworkFrame);
          }
        }
      } else {
        const gapX = currBox.x + currBox.width;
        const gapW = nextBox.x - gapX;
        if (gapW > 0) {
          createMeasureLabel(`${gap}`, gapX + gapW / 2 - 10, box.y + box.height + 4, artworkFrame);
          if (token) {
            createTokenBadge(token, `${gap}`, gapX + gapW / 2 - 10, box.y + box.height + 22, artworkFrame);
          }
        }
      }
    }
  }

  // Width labels for direct children
  if ('children' in exhibitedNode) {
    for (const child of exhibitedNode.children) {
      const childBox = getRelativeBox(child, sourceNode, scale);
      createMeasureLabel(
        `${Math.round(child.width)}`,
        childBox.x + childBox.width / 2 - 15,
        childBox.y + childBox.height + 2,
        artworkFrame,
      );
    }
  }
}
```

- [ ] **Step 3: Wire drawMeasurements into createArtworkPanel**

In `createArtworkPanel`, add this call before `return artworkFrame;`:

```typescript
  // Measurement labels and token badges
  drawMeasurements(artworkFrame, exhibitedNode, sourceNode, scale);

  return artworkFrame;
```

- [ ] **Step 4: Build and commit**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-layout.ts
git commit -m "feat(spec-layout): add measurement labels and S2A token badges"
```

---

### Task 7: Section wrapper and exhibit assembly

**Files:**
- Modify: `src/spec-layout.ts`

- [ ] **Step 1: Add createExhibit and generateLayoutSection**

Append at the end of the file:

```typescript
function createExhibit(
  sourceNode: SceneNode,
  entry: LayoutEntry,
  layerTree: LayerTreeNode,
): FrameNode {
  const exhibit = figma.createFrame();
  exhibit.name = `Exhibit — ${entry.name}`;
  exhibit.layoutMode = 'HORIZONTAL';
  exhibit.primaryAxisSizingMode = 'AUTO';
  exhibit.counterAxisSizingMode = 'AUTO';
  exhibit.fills = [{ type: 'SOLID', color: BG_LIGHT }];
  exhibit.cornerRadius = 8;
  exhibit.paddingTop = 24;
  exhibit.paddingBottom = 24;
  exhibit.paddingLeft = 24;
  exhibit.paddingRight = 24;
  exhibit.itemSpacing = 32;

  // 1. Layer tree panel
  const treePanel = renderLayerTreePanel(layerTree, entry.node.id);
  exhibit.appendChild(treePanel);

  // 2. Artwork panel
  const artworkPanel = createArtworkPanel(sourceNode, entry.node);
  exhibit.appendChild(artworkPanel);

  // 3. Property panel
  const propsPanel = renderPropertyPanel(entry);
  exhibit.appendChild(propsPanel);

  return exhibit;
}

export async function generateLayoutSection(sourceNode: SceneNode): Promise<FrameNode | null> {
  // Collect auto-layout entries
  const entries: LayoutEntry[] = [];
  collectLayoutEntries(sourceNode, entries, 0, []);
  if (entries.length === 0) return null;

  // Build full layer tree once
  const layerTree = buildLayerTree(sourceNode);

  // Section frame
  const section = figma.createFrame();
  section.name = 'Layout and spacing';
  section.layoutMode = 'VERTICAL';
  section.primaryAxisSizingMode = 'AUTO';
  section.counterAxisSizingMode = 'AUTO';
  section.fills = [];
  section.itemSpacing = 24;

  // Title
  const title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = SECTION_TITLE_SIZE;
  title.characters = 'Layout and spacing';
  title.fills = [{ type: 'SOLID', color: DARK }];
  section.appendChild(title);

  // Generate exhibits
  for (let i = 0; i < entries.length; i++) {
    figma.ui.postMessage({
      type: 'spec-it-status',
      message: `Layout: exhibit ${i + 1} of ${entries.length}...`,
    });
    const exhibit = createExhibit(sourceNode, entries[i], layerTree);
    section.appendChild(exhibit);
  }

  return section;
}
```

- [ ] **Step 2: Build to verify**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-layout.ts
git commit -m "feat(spec-layout): add exhibit assembly and section wrapper"
```

---

### Task 8: Integration with spec-it.ts and end-to-end test

**Files:**
- Modify: `src/spec-it.ts`

- [ ] **Step 1: Add import and call in specIt()**

In `src/spec-it.ts`, add the import at the top:

```typescript
import { generateLayoutSection } from './spec-layout';
```

Then add the layout section call between the anatomy section and the typography section. The updated middle portion of `specIt()` becomes:

```typescript
  // Anatomy section
  figma.ui.postMessage({ type: 'spec-it-status', message: 'Generating anatomy...' });
  const anatomySection = await generateAnatomySection(node);
  specFrame.appendChild(anatomySection);

  // Layout and spacing section
  figma.ui.postMessage({ type: 'spec-it-status', message: 'Generating layout & spacing...' });
  const layoutSection = await generateLayoutSection(node);
  if (layoutSection) {
    specFrame.appendChild(layoutSection);
  }

  // Typography section
  figma.ui.postMessage({ type: 'spec-it-status', message: 'Generating typography summary...' });
  const typoSection = await generateTypographySection(node);
  if (typoSection) {
    specFrame.appendChild(typoSection);
  }
```

- [ ] **Step 2: Build the plugin**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Test in Figma**

1. Open any Figma file with auto-layout components
2. Run the Consonant Specs plugin
3. Select a frame that uses auto-layout
4. Click "Spec it"
5. Verify the generated spec includes:
   - "Layout and spacing" section title
   - One Exhibit per auto-layout frame (depth-first)
   - Each Exhibit has: layer tree (left), annotated clone (center), property panel (right)
   - Red dashed outlines on exhibited node and children
   - Pink bands on padding zones and item-spacing gaps
   - Red measurement labels with pixel values
   - Green S2A token badges where spacing values match tokens
   - Property panel showing Width, Height, Direction, Align Children, Padding, Gap

- [ ] **Step 4: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-it.ts src/spec-layout.ts
git commit -m "feat(spec-it): integrate layout & spacing section"
```
