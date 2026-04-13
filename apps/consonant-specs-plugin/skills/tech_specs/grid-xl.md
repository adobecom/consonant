# Figma Layout Grid Guide — XL (1920px)

Apply a fixed 1920px centered layout grid guide to frames in the current Figma file. This skill ONLY adds layout grid overlays — it does NOT modify any existing design content (no moving, resizing, or changing elements).

## Grid Specifications

- **Width:** 1920px (centered in the frame)
- **Columns:** 12
- **Gutter:** 8px
- **Alignment:** STRETCH (margins calculated to center a 1920px grid)
- **Margin:** (frame width - 1920) / 2

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
   - Calculate margin: `(frame width - 1920) / 2` to center the 1920px grid
   - If the frame is narrower than 1920px, skip it and inform the user
   - Apply a COLUMNS layout grid with the correct settings using `figma_execute`
6. Take a screenshot to verify the grid was applied correctly

## Implementation

Use `figma_execute` with code like:

```javascript
const node = await figma.getNodeByIdAsync('NODE_ID');
if (node && ('layoutGrids' in node)) {
  const width = node.width;
  if (width < 1920) {
    return { error: 'Frame is narrower than 1920px', width: width };
  }
  
  const margin = Math.round((width - 1920) / 2);
  
  const grid = {
    pattern: 'COLUMNS',
    alignment: 'STRETCH',
    count: 12,
    gutterSize: 8,
    offset: margin,
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
- Skip frames narrower than 1920px and inform the user
