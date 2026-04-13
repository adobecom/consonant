# Frame Size Annotations

Add visual width measurement annotations below selected frames in Figma. Each annotation consists of vertical dashed lines, a horizontal double-arrow line, and a red pill label showing the width value. For frames wider than 1920px, a nested inner 1920px measurement is also shown.

## Scope

Works on the **current Figma selection**. Get the selection using `figma_get_selection`. Only processes FRAME nodes — skips other types.

## Visual Style

- **Color**: Red `{ r: 0.92, g: 0.2, b: 0.14 }` for all elements
- **Vertical dashed lines**: 1px stroke, dash pattern [6, 4], extending from frame bottom edge down to the arrow line
- **Horizontal arrow line**: 1.5px stroke, `ARROW_EQUILATERAL` cap on both ends, spans full width
- **Label pill**: Red background, rounded corners (4px), Inter Bold 16px white text showing the width value (no "px" suffix)
- **Grouping**: All elements grouped together and named `_measurement_{width}px`

## Measurement Layouts

### Standard (frame width <= 1920px)
Single measurement showing the frame width:
- **Gap below frame**: 40px
- **Dashed line length**: 100px (gap + extend)
- **Arrow line**: at bottom of dashed lines
- **Pill**: 10px below arrow line, centered

### Dual (frame width > 1920px, e.g., 2560px)
Two nested measurements — inner 1920px content width + outer frame width:
- **Inner measurement** (1920px):
  - Dashed lines start at `frame.x + (frameWidth - 1920) / 2` and `frame.x + (frameWidth + 1920) / 2`
  - Gap: 40px, dashed line extend: 60px
  - Arrow + pill at 100px below frame
- **Outer measurement** (full frame width):
  - Dashed lines at frame left and right edges
  - Gap: 40px, dashed line extend: 130px
  - Arrow + pill at 170px below frame

## Implementation

For each selected frame, use `figma_execute`:

```javascript
const target = await figma.getNodeByIdAsync('FRAME_ID');
const frameWidth = Math.round(target.width);
const red = { r: 0.92, g: 0.2, b: 0.14 };
const gap = 40;

await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

const elements = [];
const isDual = frameWidth > 1920;

// Helper: create a measurement set (dashed lines + arrow + pill)
function createMeasurement(x, width, lineExtend, labelText) {
  const yBase = target.y + target.height;

  // Left dashed line
  const left = figma.createLine();
  left.rotation = -90;
  left.resize(lineExtend + gap, 0);
  left.strokes = [{ type: 'SOLID', color: red }];
  left.strokeWeight = 1;
  left.dashPattern = [6, 4];
  left.x = x;
  left.y = yBase;
  elements.push(left);

  // Right dashed line
  const right = figma.createLine();
  right.rotation = -90;
  right.resize(lineExtend + gap, 0);
  right.strokes = [{ type: 'SOLID', color: red }];
  right.strokeWeight = 1;
  right.dashPattern = [6, 4];
  right.x = x + width;
  right.y = yBase;
  elements.push(right);

  // Arrow line
  const arrow = figma.createLine();
  arrow.resize(width, 0);
  arrow.strokes = [{ type: 'SOLID', color: red }];
  arrow.strokeWeight = 1.5;
  arrow.strokeCap = 'ARROW_EQUILATERAL';
  arrow.x = x;
  arrow.y = yBase + gap + lineExtend;
  elements.push(arrow);

  // Label pill
  const pill = figma.createFrame();
  pill.layoutMode = 'HORIZONTAL';
  pill.primaryAxisSizingMode = 'AUTO';
  pill.counterAxisSizingMode = 'AUTO';
  pill.paddingLeft = 10;
  pill.paddingRight = 10;
  pill.paddingTop = 4;
  pill.paddingBottom = 4;
  pill.cornerRadius = 4;
  pill.fills = [{ type: 'SOLID', color: red }];

  const label = figma.createText();
  label.fontName = { family: 'Inter', style: 'Bold' };
  label.fontSize = 16;
  label.characters = labelText;
  label.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  pill.appendChild(label);

  pill.x = x + (width / 2) - (pill.width / 2);
  pill.y = yBase + gap + lineExtend + 10;
  elements.push(pill);
}

if (isDual) {
  // Inner 1920px measurement
  const contentMargin = Math.round((frameWidth - 1920) / 2);
  createMeasurement(target.x + contentMargin, 1920, 60, '1920');

  // Outer full-width measurement
  createMeasurement(target.x, frameWidth, 130, `${frameWidth}`);
} else {
  // Single measurement
  createMeasurement(target.x, frameWidth, 60, `${frameWidth}`);
}

const group = figma.group(elements, target.parent);
group.name = `_measurement_${frameWidth}px`;
```

## Workflow

### Step 1 — Get the current selection
Use `figma_get_selection`. Filter to FRAME types only.

### Step 2 — Create measurements
For each frame, run the implementation above. Use the dual layout for frames > 1920px, standard for all others.

### Step 3 — Report results
Report how many annotations were created and for which frames (including whether dual or standard was used).

## Important Rules
- NEVER modify the selected frames — only ADD measurement elements as siblings
- Use `figma.loadFontAsync` before setting font properties
- Group all measurement elements together for easy management
- Skip frames that already have a `_measurement_` group nearby to avoid duplicates
- Place measurements below each frame, not inside it
- For dual measurements, the 1920px content width is always centered in the frame
