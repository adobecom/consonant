# Figma Layout Grid Guide

Apply responsive layout grid guides to frames in the current Figma file. This skill ONLY adds layout grid overlays — it does NOT modify any existing design content (no moving, resizing, or changing elements).

## Grid Specifications

### Desktop & Tablet (frame width >= 768px) — 12 Column Grid
- **Columns:** 12
- **Gutter:** 8px
- **Margin:** 8.333% of the frame width (calculated per frame)
- **Alignment:** STRETCH

### Mobile (frame width < 768px) — 6 Column Grid
- **Columns:** 6
- **Gutter:** 8px
- **Margin:** 24px (fixed)
- **Alignment:** STRETCH

## Input

The user may provide:
- A **Figma URL** with a `node-id` parameter — navigate to that node and apply the grid there
- A **node ID** directly (e.g., `19-105629`) — look up that node and apply the grid
- **Nothing** — use the current Figma selection

## Workflow

1. If the user provided a Figma URL, use `figma_navigate` to open it, then extract the node ID from the `node-id` query parameter
2. If the user provided a node ID, use that directly
3. Otherwise, get the current selection using `figma_get_selection`
4. If still nothing is selected, ask the user which frames to apply grids to
5. For each target frame:
   - Determine breakpoint based on frame width (>= 768px = desktop/tablet, < 768px = mobile)
   - Calculate margin (8.333% of width for desktop/tablet, 24px for mobile)
   - Apply a COLUMNS layout grid with the correct settings using `figma_execute`
6. Take a screenshot to verify the grid was applied correctly

## Implementation

Use `figma_execute` with code like:

```javascript
const node = await figma.getNodeByIdAsync('NODE_ID');
if (node && ('layoutGrids' in node)) {
  const width = node.width;
  const isMobile = width < 768;
  
  const grid = {
    pattern: 'COLUMNS',
    alignment: 'STRETCH',
    count: isMobile ? 6 : 12,
    gutterSize: 8,
    offset: isMobile ? 24 : Math.round(width * 0.08333),
    sectionSize: 0,
    visible: true,
    color: { r: 0x12/255, g: 0x5E/255, b: 0xDE/255, a: 0.1 }
  };
  
  node.layoutGrids = [...node.layoutGrids, grid];
}
```

## Important
- NEVER modify, move, resize, or delete any existing design elements
- Only ADD layout grid overlays to frames
- Preserve any existing layout grids already on the frame (append, don't replace)
- Use #125EDE (blue) at 10% opacity for the grid overlay so it doesn't obscure the design
