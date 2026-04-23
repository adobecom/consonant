# Focus Indicators

Add blue focus indicator rectangles around all focusable elements in the current Figma selection. Displays where keyboard focus rings would appear on interactive elements like cards, buttons, links, and icons.

## Scope

Works on the **current Figma selection**. Get the selection using `figma_get_selection`. Processes FRAME, INSTANCE, and COMPONENT nodes that contain focusable children (cards, buttons, links, icons).

## Visual Style

- **Color**: Blue `{ r: 0.08, g: 0.45, b: 0.90 }` (#1473E6 — S2A focus ring default)
- **Stroke**: 2px, stroke align CENTER
- **Corner radius**: Match the element shape — 12px for cards, pill (height/2) for buttons, 100 for circular icons, 4px for text links
- **Padding**: 4px around each focusable element
- **Fill**: None (stroke only)
- **Naming**: Each rectangle named `Focus Rectangle`

## Identifying Focusable Elements

Scan the selected frame(s) for interactive elements. Common focusable patterns:

- **Cards**: Top-level child frames representing carousel items, tiles, or product cards. Typically direct children of a container with consistent sizing.
- **Buttons / CTAs**: Frames named "CTA", "Button", or containing call-to-action text. Also INSTANCE nodes of button components.
- **Text links**: Frames named "Item" or "Link" inside navigation bars.
- **Icons**: Small interactive frames (< 48px) like search, app switcher, play/pause, close.
- **Logo**: Vector or frame named "Logo" or containing brand marks.

When in doubt, treat any direct child frame of a list/grid/nav container as focusable.

## Implementation

For each selected frame, use `figma_execute`:

```javascript
const target = await figma.getNodeByIdAsync('FRAME_ID');
const blueColor = { r: 0.08, g: 0.45, b: 0.90 };
const pad = 4;

// Collect focusable elements — adapt this to the actual content
const focusableIds = [/* IDs of focusable elements found in the frame */];
const rects = [];

for (const id of focusableIds) {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) continue;
  const abs = node.absoluteBoundingBox;

  const rect = figma.createRectangle();
  rect.name = 'Focus Rectangle';
  rect.x = abs.x - pad;
  rect.y = abs.y - pad;
  rect.resize(abs.w + pad * 2, abs.h + pad * 2);
  rect.fills = [];
  rect.strokes = [{ type: 'SOLID', color: blueColor }];
  rect.strokeWeight = 2;
  rect.strokeAlign = 'CENTER';
  rect.cornerRadius = 12; // adjust per element type
  rects.push(rect);

  // Append to same parent as target frame
  target.parent.appendChild(rect);
}
```

## Workflow

### Step 1 — Get the current selection
Use `figma_get_selection`. Identify the frame(s) to annotate.

### Step 2 — Analyze focusable elements
Use `figma_get_file_data` with depth 3 on the selected node to discover all child frames. Identify which children are focusable based on naming, size, and structure patterns. Get their `absoluteBoundingBox` values.

### Step 3 — Determine corner radius per element
- **Cards** (w > 100px, h > 100px): `cornerRadius: 12`
- **Buttons / CTAs** (h ~32-48px, w > 60px): `cornerRadius: height/2` (pill shape)
- **Circular icons** (w == h, < 48px): `cornerRadius: 100`
- **Text links** (h < 20px): `cornerRadius: 4`
- **Logo**: `cornerRadius: 4`

### Step 4 — Create focus rectangles
For each focusable element, create a `Focus Rectangle` using the absolute bounding box plus 4px padding on each side. Place rectangles as siblings of the target frame (not inside it).

### Step 5 — Report results
Report how many focus indicators were created and list the focusable elements found.

## Important Rules
- NEVER modify the selected frames — only ADD Focus Rectangle elements as siblings
- Place focus rectangles OUTSIDE the target frame, overlaying via absolute positioning
- Use `absoluteBoundingBox` to get positions — elements may be nested deeply
- Skip elements that are not visible (opacity 0, or behind other elements at the same position)
- If focus rectangles already exist (check for nodes named `Focus Rectangle` nearby), ask before adding duplicates
