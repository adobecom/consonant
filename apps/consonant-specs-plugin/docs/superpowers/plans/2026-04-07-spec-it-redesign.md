# Spec-it Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Spec-it output to match the reference designs — type-driven anatomy cards with token pills, color-coded layout overlays with layer tree, 1:1 clones.

**Architecture:** Rewrite `spec-anatomy.ts` completely (new card structure, marker system, type-driven properties, deduplication). Update `spec-layout.ts` colors and remove scaling. Minor adjustments to `spec-it.ts`.

**Tech Stack:** Figma Plugin API (TypeScript), S2A tokens via `src/tokens.ts`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `src/spec-anatomy.ts` | **Full rewrite** | Type-driven cards, marker system, token pills, 1:1 clone, dedup |
| `src/spec-layout.ts` | **Color + scale updates** | Blue/pink/orange/magenta overlays, remove MAX_ARTWORK_WIDTH, title size |
| `src/spec-it.ts` | **Minor updates** | Header font size 32→48, section gap adjustments |

---

### Task 1: Rewrite spec-anatomy.ts — constants, interfaces, element collection

**Files:**
- Rewrite: `src/spec-anatomy.ts`

- [ ] **Step 1: Replace the entire file with new constants, interfaces, and element collection**

Replace the full contents of `src/spec-anatomy.ts` with:

```typescript
import { figmaColorToHex, getNodeFills, getNodeStrokes, getTextProps, getCornerRadius, getEffects, getAutoLayoutProps } from './utils';
import { matchColor, matchTypography, matchRadius } from './tokens';

// ─── Constants ────────────────────────────────────────────────────────────────

const MARKER_COLOR: RGB = { r: 0.77, g: 0.27, b: 0.0 };    // #C54500
const DOT_SIZE = 24;
const DOT_FONT_SIZE = 12;

const ICON_COLOR: RGB = { r: 0.42, g: 0.42, b: 0.42 };      // #6B6B6B
const ICON_SIZE = 20;

const TOKEN_PILL_BG: RGB = { r: 0.95, g: 0.95, b: 0.95 };   // #F2F2F2
const TOKEN_PILL_TEXT: RGB = { r: 0.52, g: 0.12, b: 0.25 };  // #851F41

const CONTENT_BG: RGB = { r: 0.95, g: 0.95, b: 0.95 };      // #F2F2F2
const CONTENT_RADIUS = 12;

const HEADER_FONT_SIZE = 16;
const PROP_FONT_SIZE = 12;
const LABEL_WIDTH = 144;
const CARD_GAP = 24;
const ROW_GAP = 4;
const SECTION_TITLE_SIZE = 48;
const EXHIBIT_GAP = 64;
const CONTENT_RAIL_WIDTH = 400;

const BLACK: RGB = { r: 0, g: 0, b: 0 };
const TITLE_COLOR: RGB = { r: 0.1, g: 0.1, b: 0.1 };

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface AnatomyEntry {
  index: number;
  node: SceneNode;
  name: string;
  type: string;
}

// ─── Element Collection (deduplicated) ────────────────────────────────────────

function collectSignificantNodes(node: SceneNode, entries: AnatomyEntry[], seen: Set<string>, depth: number = 0): void {
  if (depth > 0) {
    const key = `${node.name}::${node.type}`;
    if (!seen.has(key)) {
      // Skip empty structural frames (no fills, no strokes, no text)
      const hasVisual = ('fills' in node && Array.isArray(node.fills) && (node.fills as ReadonlyArray<Paint>).some(f => f.visible !== false))
        || ('strokes' in node && Array.isArray(node.strokes) && (node.strokes as ReadonlyArray<Paint>).some(s => s.visible !== false))
        || node.type === 'TEXT'
        || node.type === 'INSTANCE'
        || node.type === 'VECTOR';

      if (hasVisual) {
        seen.add(key);
        entries.push({
          index: entries.length + 1,
          node,
          name: node.name,
          type: node.type,
        });
      }
    }
  }
  if ('children' in node && depth < 4) {
    for (const child of node.children) {
      collectSignificantNodes(child, entries, seen, depth + 1);
    }
  }
}
```

- [ ] **Step 2: Build to verify**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-anatomy.ts
git commit -m "refactor(spec-anatomy): rewrite with new constants and deduplicated element collection"
```

---

### Task 2: Add type icon, token pill, property row, and card builders

**Files:**
- Modify: `src/spec-anatomy.ts` (append after the collection function)

- [ ] **Step 1: Add the helper functions**

Append to `src/spec-anatomy.ts`:

```typescript
// ─── Type Icons ───────────────────────────────────────────────────────────────

function getTypeIcon(type: string): string {
  switch (type) {
    case 'FRAME': return '⊞';
    case 'TEXT': return 'T';
    case 'INSTANCE': return '◈';
    case 'COMPONENT': return '◆';
    case 'VECTOR': return '∿';
    case 'RECTANGLE': return '□';
    case 'ELLIPSE': return '○';
    case 'GROUP': return '⊟';
    default: return '·';
  }
}

// ─── Token Pill ───────────────────────────────────────────────────────────────

function createTokenPill(tokenName: string, parent: FrameNode): void {
  const pill = figma.createFrame();
  pill.name = 'token-pill';
  pill.layoutMode = 'HORIZONTAL';
  pill.primaryAxisSizingMode = 'AUTO';
  pill.counterAxisSizingMode = 'AUTO';
  pill.fills = [{ type: 'SOLID', color: TOKEN_PILL_BG }];
  pill.cornerRadius = 4;
  pill.paddingTop = 2;
  pill.paddingBottom = 2;
  pill.paddingLeft = 5;
  pill.paddingRight = 5;

  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Regular' };
  text.fontSize = PROP_FONT_SIZE;
  text.characters = tokenName;
  text.fills = [{ type: 'SOLID', color: TOKEN_PILL_TEXT }];
  pill.appendChild(text);

  parent.appendChild(pill);
}

// ─── Property Row ─────────────────────────────────────────────────────────────

function addPropRow(parent: FrameNode, label: string, value: string, options?: { bold?: boolean; tokenPill?: string }): void {
  const row = figma.createFrame();
  row.name = `prop-${label}`;
  row.layoutMode = 'HORIZONTAL';
  row.primaryAxisSizingMode = 'AUTO';
  row.counterAxisSizingMode = 'AUTO';
  row.fills = [];
  row.itemSpacing = 6;

  const labelText = figma.createText();
  labelText.fontName = { family: 'Inter', style: 'Regular' };
  labelText.fontSize = PROP_FONT_SIZE;
  labelText.characters = label;
  labelText.fills = [{ type: 'SOLID', color: BLACK }];
  labelText.resize(LABEL_WIDTH, labelText.height);
  labelText.textAutoResize = 'HEIGHT';
  row.appendChild(labelText);

  if (options?.tokenPill) {
    createTokenPill(options.tokenPill, row);
  } else {
    const valueText = figma.createText();
    valueText.fontName = { family: 'Inter', style: options?.bold ? 'Bold' : 'Regular' };
    valueText.fontSize = PROP_FONT_SIZE;
    valueText.characters = value;
    valueText.fills = [{ type: 'SOLID', color: BLACK }];
    row.appendChild(valueText);
  }

  parent.appendChild(row);
}

// ─── Type-Driven Property Builder ─────────────────────────────────────────────

function buildPropertiesForNode(node: SceneNode, attrs: FrameNode): void {
  switch (node.type) {
    case 'TEXT': {
      const text = getTextProps(node);
      if (!text) break;

      // Text color with opacity
      const fills = getNodeFills(node);
      if (fills.length > 0) {
        const fill = fills[0];
        const opacity = fill.opacity < 1 ? `, ${Math.round(fill.opacity * 100)}%` : '';
        addPropRow(attrs, 'Text color:', `${fill.hex.toUpperCase()}${opacity}`);
      }

      // Text align
      if ('textAlignHorizontal' in node) {
        addPropRow(attrs, 'Text align:', node.textAlignHorizontal as string);
      }

      // Check for S2A typography token
      const sizeToken = matchTypography(`${text.fontSize}`);
      const familyToken = matchTypography(text.fontFamily);
      const token = sizeToken || familyToken;

      if (token) {
        // Token exists — show abbreviated (just the token pill)
        addPropRow(attrs, 'Text style:', '', { tokenPill: token });
      } else {
        // No token — show full typography breakdown
        if (node.width > 0) {
          addPropRow(attrs, 'Width:', `${Math.round(node.width)}`);
        }
        addPropRow(attrs, 'Font family:', text.fontFamily);
        addPropRow(attrs, 'Font weight:', `${text.fontWeight}`);
        addPropRow(attrs, 'Font size:', `${text.fontSize}`);
        addPropRow(attrs, 'Letter spacing:', text.letterSpacing);
        addPropRow(attrs, 'Line height:', text.lineHeight);
      }
      break;
    }

    case 'INSTANCE': {
      const mainComp = (node as InstanceNode).mainComponent;
      if (mainComp) {
        addPropRow(attrs, 'Depends on:', mainComp.name, { bold: true });
      } else {
        addPropRow(attrs, 'Depends on:', 'Detached instance', { bold: true });
      }
      break;
    }

    case 'VECTOR':
    case 'LINE': {
      addPropRow(attrs, 'Height:', `${Math.round(node.height)}`);
      addPropRow(attrs, 'Width:', `${Math.round(node.width)}`);

      const strokes = getNodeStrokes(node);
      for (const stroke of strokes) {
        addPropRow(attrs, 'Border color:', stroke.hex.toUpperCase());
        addPropRow(attrs, 'Border weight:', `${stroke.weight}`);
      }
      if ('strokeAlign' in node) {
        addPropRow(attrs, 'Stroke alignment:', node.strokeAlign as string);
      }

      if (node.width > 0 && node.height > 0) {
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const w = Math.round(node.width);
        const h = Math.round(node.height);
        const d = gcd(w, h);
        addPropRow(attrs, 'Aspect ratio:', `${w / d}:${h / d}`);
      }
      break;
    }

    default: {
      // FRAME, RECTANGLE, ELLIPSE, GROUP, COMPONENT
      if (node.width > 0) addPropRow(attrs, 'Width:', `${Math.round(node.width)}`);
      if (node.height > 0) addPropRow(attrs, 'Height:', `${Math.round(node.height)}`);

      const fills = getNodeFills(node);
      for (const fill of fills) {
        const colorToken = matchColor(fill.hex);
        if (colorToken) {
          addPropRow(attrs, 'Background color:', '', { tokenPill: colorToken });
        } else {
          addPropRow(attrs, 'Background color:', fill.hex.toUpperCase());
        }
      }

      const radius = getCornerRadius(node);
      if (radius !== '0') {
        const radiusToken = matchRadius(radius.replace('px', ''));
        if (radiusToken) {
          addPropRow(attrs, 'Border radius:', '', { tokenPill: radiusToken });
        } else {
          addPropRow(attrs, 'Border radius:', radius);
        }
      }

      // Aspect ratio for image-like containers
      const isImage = node.name.toLowerCase().includes('image') || node.name.toLowerCase().includes('asset');
      if (isImage && node.width > 0 && node.height > 0) {
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const w = Math.round(node.width);
        const h = Math.round(node.height);
        const d = gcd(w, h);
        addPropRow(attrs, 'Aspect ratio:', `${w / d}:${h / d}`);
      }

      // Effects
      const effects = getEffects(node);
      for (const effect of effects) {
        addPropRow(attrs, `${effect.type}:`, effect.description);
      }
      break;
    }
  }
}

// ─── Card Builder ─────────────────────────────────────────────────────────────

function buildAnatomyCard(entry: AnatomyEntry): FrameNode {
  const card = figma.createFrame();
  card.name = `anatomy-${entry.index}`;
  card.layoutMode = 'VERTICAL';
  card.primaryAxisSizingMode = 'AUTO';
  card.counterAxisSizingMode = 'AUTO';
  card.fills = [];
  card.itemSpacing = 8;

  // Header: type icon + element name
  const header = figma.createFrame();
  header.name = 'header';
  header.layoutMode = 'HORIZONTAL';
  header.primaryAxisSizingMode = 'AUTO';
  header.counterAxisSizingMode = 'AUTO';
  header.fills = [];
  header.itemSpacing = 6;

  const iconFrame = figma.createFrame();
  iconFrame.name = 'type-icon';
  iconFrame.resize(ICON_SIZE, ICON_SIZE);
  iconFrame.fills = [];
  iconFrame.layoutMode = 'HORIZONTAL';
  iconFrame.primaryAxisSizingMode = 'FIXED';
  iconFrame.counterAxisSizingMode = 'FIXED';
  iconFrame.primaryAxisAlignItems = 'CENTER';
  iconFrame.counterAxisAlignItems = 'CENTER';

  const iconText = figma.createText();
  iconText.fontName = { family: 'Inter', style: 'Regular' };
  iconText.fontSize = 14;
  iconText.characters = getTypeIcon(entry.type);
  iconText.fills = [{ type: 'SOLID', color: ICON_COLOR }];
  iconFrame.appendChild(iconText);
  header.appendChild(iconFrame);

  const nameText = figma.createText();
  nameText.fontName = { family: 'Inter', style: 'Bold' };
  nameText.fontSize = HEADER_FONT_SIZE;
  nameText.characters = entry.name;
  nameText.fills = [{ type: 'SOLID', color: BLACK }];
  header.appendChild(nameText);

  card.appendChild(header);

  // Content area with properties
  const content = figma.createFrame();
  content.name = 'content';
  content.layoutMode = 'VERTICAL';
  content.primaryAxisSizingMode = 'AUTO';
  content.counterAxisSizingMode = 'AUTO';
  content.fills = [{ type: 'SOLID', color: CONTENT_BG }];
  content.cornerRadius = CONTENT_RADIUS;
  content.paddingTop = 12;
  content.paddingBottom = 12;
  content.paddingLeft = 16;
  content.paddingRight = 16;
  content.itemSpacing = ROW_GAP;

  buildPropertiesForNode(entry.node, content);

  card.appendChild(content);

  // Numbered dot
  const dot = figma.createFrame();
  dot.name = `dot-${entry.index}`;
  dot.resize(DOT_SIZE, DOT_SIZE);
  dot.cornerRadius = DOT_SIZE / 2;
  dot.fills = [{ type: 'SOLID', color: MARKER_COLOR }];
  dot.layoutMode = 'HORIZONTAL';
  dot.primaryAxisSizingMode = 'FIXED';
  dot.counterAxisSizingMode = 'FIXED';
  dot.primaryAxisAlignItems = 'CENTER';
  dot.counterAxisAlignItems = 'CENTER';

  const dotText = figma.createText();
  dotText.fontName = { family: 'Inter', style: 'Bold' };
  dotText.fontSize = DOT_FONT_SIZE;
  dotText.characters = `${entry.index}`;
  dotText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  dot.appendChild(dotText);

  card.appendChild(dot);

  return card;
}
```

- [ ] **Step 2: Build to verify**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-anatomy.ts
git commit -m "feat(spec-anatomy): add type-driven cards, token pills, marker dots"
```

---

### Task 3: Add marker system and exported section generator

**Files:**
- Modify: `src/spec-anatomy.ts` (append the marker + export function)

- [ ] **Step 1: Add marker creation and the exported generateAnatomySection function**

Append to `src/spec-anatomy.ts`:

```typescript
// ─── Marker System ────────────────────────────────────────────────────────────

function createMarkerDot(index: number, x: number, y: number, parent: FrameNode): void {
  const dot = figma.createFrame();
  dot.name = `marker-${index}`;
  dot.resize(DOT_SIZE, DOT_SIZE);
  dot.cornerRadius = DOT_SIZE / 2;
  dot.fills = [{ type: 'SOLID', color: MARKER_COLOR }];
  dot.layoutMode = 'HORIZONTAL';
  dot.primaryAxisSizingMode = 'FIXED';
  dot.counterAxisSizingMode = 'FIXED';
  dot.primaryAxisAlignItems = 'CENTER';
  dot.counterAxisAlignItems = 'CENTER';
  dot.x = x;
  dot.y = y;

  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Bold' };
  text.fontSize = DOT_FONT_SIZE;
  text.characters = `${index}`;
  text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  dot.appendChild(text);

  parent.appendChild(dot);
}

function createMarkerLine(x1: number, y1: number, x2: number, y2: number, parent: FrameNode): void {
  const isHorizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1);
  const line = figma.createRectangle();
  line.name = 'marker-line';

  if (isHorizontal) {
    const startX = Math.min(x1, x2);
    const width = Math.abs(x2 - x1);
    line.resize(Math.max(width, 1), 1);
    line.x = startX;
    line.y = y1;
  } else {
    const startY = Math.min(y1, y2);
    const height = Math.abs(y2 - y1);
    line.resize(1, Math.max(height, 1));
    line.x = x1;
    line.y = startY;
  }

  line.fills = [{ type: 'SOLID', color: MARKER_COLOR }];
  parent.appendChild(line);
}

// ─── Section Generator ────────────────────────────────────────────────────────

export async function generateAnatomySection(sourceNode: SceneNode): Promise<FrameNode> {
  const section = figma.createFrame();
  section.name = 'Anatomy';
  section.layoutMode = 'VERTICAL';
  section.primaryAxisSizingMode = 'AUTO';
  section.counterAxisSizingMode = 'AUTO';
  section.fills = [];
  section.itemSpacing = CARD_GAP;

  // Section title
  const title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = SECTION_TITLE_SIZE;
  title.characters = 'Anatomy';
  title.fills = [{ type: 'SOLID', color: TITLE_COLOR }];
  section.appendChild(title);

  // Exhibit: artwork (left) + content rail (right)
  const exhibit = figma.createFrame();
  exhibit.name = 'anatomy-exhibit';
  exhibit.layoutMode = 'HORIZONTAL';
  exhibit.primaryAxisSizingMode = 'AUTO';
  exhibit.counterAxisSizingMode = 'AUTO';
  exhibit.fills = [];
  exhibit.itemSpacing = EXHIBIT_GAP;

  // Left: 1:1 clone with markers
  const artworkContainer = figma.createFrame();
  artworkContainer.name = 'artwork';
  artworkContainer.clipsContent = false;
  artworkContainer.fills = [{ type: 'SOLID', color: CONTENT_BG }];
  artworkContainer.cornerRadius = 8;
  artworkContainer.paddingTop = 40;
  artworkContainer.paddingBottom = 40;
  artworkContainer.paddingLeft = 40;
  artworkContainer.paddingRight = 40;

  const clone = sourceNode.clone();
  clone.x = 0;
  clone.y = 0;
  artworkContainer.appendChild(clone);
  artworkContainer.resize(clone.width + 80, clone.height + 80);

  // Collect elements and add markers to artwork
  const entries: AnatomyEntry[] = [];
  const seen = new Set<string>();
  collectSignificantNodes(sourceNode, entries, seen);

  for (const entry of entries) {
    const entryNode = entry.node;
    const relX = entryNode.absoluteTransform[0][2] - sourceNode.absoluteTransform[0][2];
    const relY = entryNode.absoluteTransform[1][2] - sourceNode.absoluteTransform[1][2];

    // Place dot near top-left of element
    const dotX = relX - DOT_SIZE / 2;
    const dotY = relY - DOT_SIZE / 2;
    createMarkerDot(entry.index, dotX + 40, dotY + 40, artworkContainer);

    // Connecting line from dot to right edge of artwork
    const lineStartX = dotX + DOT_SIZE + 40;
    const lineY = dotY + DOT_SIZE / 2 + 40;
    const lineEndX = clone.width + 40;
    createMarkerLine(lineStartX, lineY, lineEndX, lineY, artworkContainer);
  }

  exhibit.appendChild(artworkContainer);

  // Right: content rail with cards
  const contentRail = figma.createFrame();
  contentRail.name = 'content-rail';
  contentRail.layoutMode = 'VERTICAL';
  contentRail.primaryAxisSizingMode = 'AUTO';
  contentRail.counterAxisSizingMode = 'FIXED';
  contentRail.resize(CONTENT_RAIL_WIDTH, 1);
  contentRail.fills = [];
  contentRail.itemSpacing = CARD_GAP;

  for (const entry of entries) {
    const card = buildAnatomyCard(entry);
    contentRail.appendChild(card);
  }

  exhibit.appendChild(contentRail);
  section.appendChild(exhibit);

  return section;
}
```

- [ ] **Step 2: Build to verify**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-anatomy.ts
git commit -m "feat(spec-anatomy): add marker system and section generator with 1:1 clone"
```

---

### Task 4: Update spec-layout.ts — colors and remove scaling

**Files:**
- Modify: `src/spec-layout.ts`

- [ ] **Step 1: Update color constants at top of file**

Replace lines 6-19:

```typescript
const MAX_ARTWORK_WIDTH = 1200;
const SECTION_TITLE_SIZE = 24;

const RED = '#E53535';
const GREEN = '#2D9D78';
const DARK = '#1A1A1A';
const GRAY = '#999999';
const LABEL_GRAY = '#737373';
const VALUE_DARK = '#262626';
const WHITE = '#FFFFFF';
const BG_LIGHT = '#F7F7F7';

const PINK_OPACITY = 0.12;
const OUTLINE_WEIGHT = 1.5;
const OUTLINE_DASH = [6, 4];
```

with:

```typescript
const SECTION_TITLE_SIZE = 48;

const DARK = '#1A1A1A';
const GRAY = '#999999';
const LABEL_GRAY = '#737373';
const VALUE_DARK = '#262626';
const WHITE = '#FFFFFF';
const BG_LIGHT = '#F7F7F7';

// Overlay colors
const OVERLAY_OUTLINE = '#D42B2B';          // red dashed — element outline
const OVERLAY_INNER = '#E8A0BF';            // pink — padding/inner areas
const OVERLAY_INNER_OPACITY = 0.25;
const OVERLAY_OUTER = '#0D69D4';            // blue — child element bounds
const OVERLAY_OUTER_OPACITY = 0.20;
const LABEL_PX_BG = '#C54500';              // orange — raw px labels
const LABEL_TOKEN_BG = '#D946A8';           // magenta — S2A token labels

const OUTLINE_WEIGHT = 1.5;
const OUTLINE_DASH = [6, 4];
```

- [ ] **Step 2: Update drawDashedRect to use OVERLAY_OUTLINE**

Replace the `drawDashedRect` function body's stroke line:

```typescript
  rect.strokes = [{ type: 'SOLID', color: hexToRgb(RED) }];
```

with:

```typescript
  rect.strokes = [{ type: 'SOLID', color: hexToRgb(OVERLAY_OUTLINE) }];
```

- [ ] **Step 3: Update drawPinkRect to use OVERLAY_INNER colors for padding and add drawBlueRect for children**

Replace `drawPinkRect`:

```typescript
function drawOverlayRect(x: number, y: number, w: number, h: number, color: string, opacity: number, parent: FrameNode): void {
  if (w <= 0 || h <= 0) return;
  const rect = figma.createRectangle();
  rect.name = 'overlay-band';
  rect.resize(w, h);
  rect.x = x;
  rect.y = y;
  rect.fills = [{
    type: 'SOLID',
    color: hexToRgb(color),
    opacity,
  } as SolidPaint];
  parent.appendChild(rect);
}
```

Then update `drawPaddingBands` to call `drawOverlayRect(... OVERLAY_INNER, OVERLAY_INNER_OPACITY ...)` and `drawSpacingBands` to call `drawOverlayRect(... OVERLAY_INNER, OVERLAY_INNER_OPACITY ...)`.

- [ ] **Step 4: Add blue child overlays in createArtworkPanel**

In `createArtworkPanel`, after the dashed outlines for children, add blue fill overlays:

Replace the children loop that draws dashed rects:

```typescript
  // Blue fill overlays on direct children
  if ('children' in exhibitedNode) {
    for (const child of exhibitedNode.children) {
      const rawChildBox = getRelativeBox(child, sourceNode, scale);
      const childBox = {
        x: rawChildBox.x + ARTWORK_MARGIN,
        y: rawChildBox.y + ARTWORK_MARGIN,
        width: rawChildBox.width,
        height: rawChildBox.height,
      };
      drawOverlayRect(childBox.x, childBox.y, childBox.width, childBox.height, OVERLAY_OUTER, OVERLAY_OUTER_OPACITY, artworkFrame);
    }
  }
```

- [ ] **Step 5: Update measurement label colors**

In `createMeasureLabel`, change:
```typescript
  bg.fills = [{ type: 'SOLID', color: hexToRgb(RED) }];
```
to:
```typescript
  bg.fills = [{ type: 'SOLID', color: hexToRgb(LABEL_PX_BG) }];
```

In `createTokenBadge`, change:
```typescript
  bg.fills = [{ type: 'SOLID', color: hexToRgb(GREEN) }];
```
to:
```typescript
  bg.fills = [{ type: 'SOLID', color: hexToRgb(LABEL_TOKEN_BG) }];
```

- [ ] **Step 6: Remove MAX_ARTWORK_WIDTH scaling**

In `createArtworkPanel`, remove the scaling block. Replace:

```typescript
  let scale = 1;
  if (clone.width > MAX_ARTWORK_WIDTH) {
    scale = MAX_ARTWORK_WIDTH / clone.width;
    clone.rescale(scale);
  }
```

with:

```typescript
  const scale = 1;
```

- [ ] **Step 7: Update all references from drawPinkRect to drawOverlayRect**

In `drawPaddingBands`, replace all 4 calls from `drawPinkRect(...)` to `drawOverlayRect(... OVERLAY_INNER, OVERLAY_INNER_OPACITY, ...)`.

In `drawSpacingBands`, replace both calls from `drawPinkRect(...)` to `drawOverlayRect(... OVERLAY_INNER, OVERLAY_INNER_OPACITY, ...)`.

- [ ] **Step 8: Build to verify**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

- [ ] **Step 9: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-layout.ts
git commit -m "feat(spec-layout): update overlay colors, remove scaling, enlarge title"
```

---

### Task 5: Update spec-it.ts — header and gaps

**Files:**
- Modify: `src/spec-it.ts`

- [ ] **Step 1: Update header font size and section gap**

Change `SECTION_GAP` from 60 to 64:

```typescript
const SECTION_GAP = 64;
```

Change the header fontSize from 32 to 48:

```typescript
  header.fontSize = 48;
```

- [ ] **Step 2: Build and verify**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add src/spec-it.ts
git commit -m "feat(spec-it): update header size and section gaps to match redesign"
```

---

### Task 6: Manual test in Figma

- [ ] **Step 1: Build and reload plugin**

Run: `cd /Users/taehoc/Desktop/consonant-specs && npm run build`

- [ ] **Step 2: Test on a frame with mixed content**

Select a frame with text, images, components, and auto-layout. Click "Spec it". Verify:

**Anatomy section:**
- Title is "Anatomy" at 48px
- 1:1 clone (not scaled down)
- Burnt orange numbered dots on the artwork with connecting lines
- Right rail has deduplicated cards (no repeats of same name+type)
- TEXT cards with tokens show abbreviated (token pill only)
- TEXT cards without tokens show full typography breakdown
- INSTANCE cards show "Depends on:" with bold component name
- FRAME cards show width/height/background/radius
- Token pills have gray bg with maroon text

**Layout section:**
- Title is "Layout and spacing" at 48px
- Left rail shows layer tree with current node bolded
- Center artwork is 1:1 (not scaled)
- Pink overlays on padding areas
- Blue overlays on child elements
- Red dashed outline on target element
- Orange badges for px values
- Magenta badges for S2A token values

- [ ] **Step 3: Fix any issues found, commit**

```bash
cd /Users/taehoc/Desktop/consonant-specs
git add -A
git commit -m "fix: polish spec-it redesign after testing"
```
