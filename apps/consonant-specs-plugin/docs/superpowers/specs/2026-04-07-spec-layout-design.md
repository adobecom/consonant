# spec-layout.ts — Layout & Spacing Section Design

## Overview

`spec-layout.ts` generates the "Layout and spacing" section of the Spec-it output. It produces a vertical stack of Exhibits, one per auto-layout frame found in the source node's tree (depth-first, no depth cap). Each Exhibit clones the full source design and annotates it with padding/spacing overlays, measurement labels, S2A token badges, a layer tree, and a property panel.

The visual style matches the Spectral reference (node `56:39138` in Figma file `I2Q0fPnIj2ATbd6pbb9bx1`).

## Exported API

```typescript
generateLayoutSection(sourceNode: SceneNode): Promise<FrameNode | null>
```

Returns a section frame containing title + all exhibits, or `null` if the source node has no auto-layout frames. Follows the same pattern as `generateAnatomySection` and `generateTypographySection`.

## Data Structures

```typescript
interface LayoutEntry {
  node: SceneNode;           // the auto-layout frame being exhibited
  name: string;              // node.name
  depth: number;             // nesting depth from sourceNode (0 = sourceNode itself)
  parentChain: string[];     // ancestor names from sourceNode down, for layer tree
}
```

## Tree Collection

Walk `sourceNode` depth-first (pre-order). At each node:

1. If the node has `layoutMode` and `layoutMode !== 'NONE'`, add it as a `LayoutEntry`.
2. If the node has `children`, recurse into each child.
3. Skip nodes with zero children (nothing to exhibit even if they're auto-layout).
4. No artificial depth cap — recurse until leaf nodes.

The `parentChain` is built by passing the ancestor names array down through recursion.

### Full layer tree

In addition to collecting exhibit entries, build a complete tree of ALL descendant names/types/depths (not just auto-layout ones) for rendering the layer tree panel in each exhibit. This is a separate structure:

```typescript
interface LayerTreeNode {
  name: string;
  type: string;              // Figma node type
  depth: number;             // indentation level
  nodeId: string;            // to match against current exhibit node
  children: LayerTreeNode[];
}
```

## Exhibit Structure

Each Exhibit is a horizontal auto-layout frame:

```
Exhibit (HORIZONTAL, itemSpacing: 32, padding: 24, bg: #F7F7F7, cornerRadius: 8)
├── Layer Tree Panel (VERTICAL, width: 280)
│   └── Indented text lines showing node hierarchy
├── Artwork Panel (FRAME, clipsContent: true)
│   ├── Design clone (full sourceNode clone)
│   ├── Overlay: pink bands on padding zones
│   ├── Overlay: pink bands on spacing zones between children
│   ├── Red dashed outlines on exhibited node
│   ├── Red dashed outlines on exhibited node's direct children
│   ├── Red measurement labels (rounded rect + white text)
│   └── Green S2A token badges (for spacing values)
└── Property Panel (VERTICAL, width: 250)
    ├── Node name (bold, 13px)
    └── Attribute rows (label: value)
```

## Layer Tree Panel

Renders the full node hierarchy as indented text. For each exhibit:

- All nodes in the tree are listed with indentation (12px per depth level)
- The **current exhibit node** is rendered in bold black (#1A1A1A, Inter Bold 11px)
- All other nodes are gray (#999999, Inter Regular 11px)
- Each line shows the node name only (no type icons — matching the Spectral reference)
- Lines use single-line text nodes positioned vertically with 2px spacing

## Artwork Panel — Overlay Drawing

For each exhibit, clone the entire `sourceNode`. Then overlay annotation elements on top of the clone. All overlay coordinates are relative to the clone's origin (0,0).

### Coordinate calculation

For a given node within the source tree, its position relative to the sourceNode is:

```typescript
const relX = node.absoluteTransform[0][2] - sourceNode.absoluteTransform[0][2];
const relY = node.absoluteTransform[1][2] - sourceNode.absoluteTransform[1][2];
```

If the clone is scaled (because sourceNode is wider than `MAX_ARTWORK_WIDTH`), multiply by the scale factor.

`MAX_ARTWORK_WIDTH = 1200` — if the source is wider, scale the clone down proportionally.

### Red dashed outlines

Draw a rectangle outline (no fill, red stroke) around:
1. The exhibited node itself
2. Each direct child of the exhibited node

```
stroke: #E53535, weight: 1.5, dashPattern: [6, 4]
fills: [] (no fill)
```

### Pink padding bands

For each non-zero padding value (top, right, bottom, left) on the exhibited node, draw a semi-transparent pink rectangle covering that padding zone:

- **Padding top:** x = nodeX, y = nodeY, w = nodeWidth, h = paddingTop
- **Padding bottom:** x = nodeX, y = nodeY + nodeHeight - paddingBottom, w = nodeWidth, h = paddingBottom
- **Padding left:** x = nodeX, y = nodeY + paddingTop, w = paddingLeft, h = nodeHeight - paddingTop - paddingBottom
- **Padding right:** x = nodeX + nodeWidth - paddingRight, y = nodeY + paddingTop, w = paddingRight, h = nodeHeight - paddingTop - paddingBottom

```
fill: #E53535, opacity: 0.12
```

### Pink item-spacing bands

For each pair of adjacent children in the exhibited node's auto-layout, draw a pink band in the gap between them:

- **Vertical layout:** band spans full node width, height = itemSpacing, positioned between child[i] bottom and child[i+1] top
- **Horizontal layout:** band spans full node height, width = itemSpacing, positioned between child[i] right and child[i+1] left

```
fill: #E53535, opacity: 0.12
```

### Red measurement labels

Red rounded rectangles with white text showing pixel values. Placed at:

- **Width of exhibited node:** centered above the node, showing `{width}` (e.g., "1920")
- **Width of each direct child:** centered above/below the child, showing `{width}`
- **Padding values:** centered within each padding band, showing `{value}`
- **Item spacing values:** centered within each spacing band, showing `{value}`
- **Height of exhibited node's children:** to the right of each child (only if it adds useful info)

Label style:
```
frame: bg #E53535, cornerRadius: 3, paddingH: 5, paddingV: 2
text: Inter Bold 10px, white (#FFFFFF)
```

### Green S2A token badges

When a spacing or padding value matches an S2A token, show a green badge to the right of the corresponding measurement label:

```
frame: bg #2D9D78, cornerRadius: 3, paddingH: 6, paddingV: 2
text: Inter Medium 9px, white (#FFFFFF)
content: "{tokenName} {value}" (e.g., "s2a/spacing/4xl 64")
```

Position: to the right of or below the red measurement label.

## Property Panel

Vertical stack of attribute rows. Each row is a horizontal frame with label and value.

### Attributes shown

| Property | Label | Value format | When shown |
|----------|-------|-------------|------------|
| Width | Width | `{mode} {value}px` | Always |
| Height | Height | `{mode} {value}px` | Always |
| Fill | Fill variable | S2A token name | If node has solid fill with token match |
| Direction | Direction | `Vertical` or `Horizontal` with icon | Always (auto-layout) |
| Align Children | Align Children | `Top Center`, `Middle Center`, etc. with icon | Always |
| Padding | Padding | `{top}px {right}px` (or full 4-value) | If any padding > 0 |
| Gap | Gap | `{tokenName}` or `{value}` | If itemSpacing > 0 |

### Sizing mode

Determined by checking the node's `layoutSizingHorizontal` / `layoutSizingVertical` property:
- `FIXED` → "Fixed"
- `HUG` → "Hug"
- `FILL` → "Fill"

### Alignment

Derived from `primaryAxisAlignItems` and `counterAxisAlignItems`:
- Primary (main axis): `MIN` → Top/Left, `CENTER` → Center, `MAX` → Bottom/Right, `SPACE_BETWEEN` → Space Between
- Counter (cross axis): `MIN` → Top/Left, `CENTER` → Center, `MAX` → Bottom/Right

Combined into a human-readable string like "Top Center".

### Style

```
Node name: Inter Bold 13px, #1A1A1A
Label: Inter Regular 11px, #737373
Value: Inter Medium 11px, #262626
Row spacing: 8px
Icon: text character (↓ for vertical, → for horizontal, alignment grid icon)
```

## Section wrapper

```
Layout and spacing (VERTICAL auto-layout)
├── Title: "Layout and spacing" (Inter Bold 24px, #1A1A1A)
└── Exhibits container (VERTICAL, itemSpacing: 24)
    ├── Exhibit 1 (root frame)
    ├── Exhibit 2 (first auto-layout child)
    ├── Exhibit 3 (child's first auto-layout child)
    └── ... (depth-first order)
```

## Integration with spec-it.ts

Add to `specIt()` between the anatomy and typography sections:

```typescript
import { generateLayoutSection } from './spec-layout';

// In specIt():
figma.ui.postMessage({ type: 'spec-it-status', message: 'Generating layout & spacing...' });
const layoutSection = await generateLayoutSection(node);
if (layoutSection) {
  specFrame.appendChild(layoutSection);
}
```

## Dependencies

Imports from existing modules:
- `utils.ts`: `getAutoLayoutProps`, `figmaColorToHex`, `getNodeFills`
- `tokens.ts`: `matchSpacing`, `matchColor`

No new dependencies needed.

## Progress reporting

Since exhibits can number 20+ for complex components, report progress per exhibit:

```typescript
figma.ui.postMessage({
  type: 'spec-it-status',
  message: `Layout: exhibit ${i + 1} of ${entries.length}...`
});
```
