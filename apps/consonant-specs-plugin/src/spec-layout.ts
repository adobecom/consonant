import { getAutoLayoutProps, getNodeFills } from './utils';
import { matchSpacing, matchColor, detectNodeColorRole } from './tokens';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function removeOverlays(node: SceneNode, overlayName: string): void {
  if (!('children' in node)) return;
  const toRemove = (node as FrameNode).children.filter(c => c.name === overlayName);
  for (const child of toRemove) child.remove();
  // Also check one level of children for stale overlays
  for (const child of (node as FrameNode).children) {
    if ('children' in child) {
      const nested = (child as FrameNode).children.filter(c => c.name === overlayName);
      for (const n of nested) n.remove();
    }
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_TITLE_SIZE = 48;

const DARK = '#1A1A1A';
const GRAY = '#999999';
const LABEL_GRAY = '#737373';
const VALUE_DARK = '#262626';
const WHITE = '#FFFFFF';
const BG_LIGHT = '#F7F7F7';

// Overlay colors
const OVERLAY_OUTLINE = '#D42B2B';
const OVERLAY_INNER = '#E8A0BF';
const OVERLAY_INNER_OPACITY = 0.25;
const OVERLAY_OUTER = '#0D69D4';
const OVERLAY_OUTER_OPACITY = 0.20;
const LABEL_PX_BG = '#C54500';
const LABEL_TOKEN_BG = '#D946A8';

const OUTLINE_WEIGHT = 1.5;
const OUTLINE_DASH = [6, 4];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface LayoutEntry {
  node: SceneNode;
  name: string;
  depth: number;
}

interface LayerTreeNode {
  name: string;
  type: string;
  depth: number;
  nodeId: string;
  children: LayerTreeNode[];
}

interface FlatLayerEntry {
  name: string;
  depth: number;
  nodeId: string;
}

// ─── Tree Collection ───────────────────────────────────────────────────────────

function collectLayoutEntries(
  node: SceneNode,
  entries: LayoutEntry[],
  depth: number = 0
): void {
  const autoLayout = getAutoLayoutProps(node);
  if (autoLayout !== null && 'children' in node && node.children.length > 0) {
    entries.push({ node, name: node.name, depth });
  }
  if ('children' in node) {
    for (const child of node.children) {
      collectLayoutEntries(child, entries, depth + 1);
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

function flattenLayerTree(tree: LayerTreeNode): FlatLayerEntry[] {
  const result: FlatLayerEntry[] = [];
  function walk(n: LayerTreeNode): void {
    result.push({ name: n.name, depth: n.depth, nodeId: n.nodeId });
    for (const child of n.children) {
      walk(child);
    }
  }
  walk(tree);
  return result;
}

// ─── Layer Tree Panel ─────────────────────────────────────────────────────────

function renderLayerTreePanel(layerTree: LayerTreeNode, currentNodeId: string): FrameNode {
  const panel = figma.createFrame();
  panel.name = 'layer-tree-panel';
  panel.layoutMode = 'VERTICAL';
  panel.counterAxisSizingMode = 'FIXED';
  panel.resize(280, 1);
  panel.primaryAxisSizingMode = 'AUTO';
  panel.fills = [];
  panel.itemSpacing = 2;

  const flat = flattenLayerTree(layerTree);

  for (const entry of flat) {
    const row = figma.createFrame();
    row.name = `layer-${entry.nodeId}`;
    row.layoutMode = 'HORIZONTAL';
    row.primaryAxisSizingMode = 'AUTO';
    row.counterAxisSizingMode = 'AUTO';
    row.fills = [];
    row.itemSpacing = 0;
    row.paddingLeft = entry.depth * 12;

    const label = figma.createText();
    const isCurrent = entry.nodeId === currentNodeId;
    label.fontName = { family: 'Inter', style: isCurrent ? 'Bold' : 'Regular' };
    label.fontSize = 11;
    label.characters = entry.name;
    label.fills = [{ type: 'SOLID', color: hexToRgb(isCurrent ? DARK : GRAY) }];
    row.appendChild(label);

    panel.appendChild(row);
  }

  return panel;
}

// ─── Property Panel ───────────────────────────────────────────────────────────

function getSizingMode(node: SceneNode, axis: 'horizontal' | 'vertical'): 'Fixed' | 'Hug' | 'Fill' {
  if (axis === 'horizontal') {
    if ('layoutSizingHorizontal' in node) {
      const mode = node.layoutSizingHorizontal as string;
      if (mode === 'HUG') return 'Hug';
      if (mode === 'FILL') return 'Fill';
    }
    return 'Fixed';
  } else {
    if ('layoutSizingVertical' in node) {
      const mode = node.layoutSizingVertical as string;
      if (mode === 'HUG') return 'Hug';
      if (mode === 'FILL') return 'Fill';
    }
    return 'Fixed';
  }
}

function getAlignmentString(node: SceneNode): string {
  if (!('primaryAxisAlignItems' in node)) return 'Top Left';

  const primary = node.primaryAxisAlignItems as string;
  const counter = node.counterAxisAlignItems as string;
  const direction = 'layoutMode' in node ? (node.layoutMode as string) : 'NONE';

  // For VERTICAL layout: primary = vertical, counter = horizontal
  // For HORIZONTAL layout: primary = horizontal, counter = vertical
  let vertPos: string;
  let horizPos: string;

  const primaryMap: Record<string, string> = {
    MIN: direction === 'VERTICAL' ? 'Top' : 'Left',
    CENTER: 'Center',
    MAX: direction === 'VERTICAL' ? 'Bottom' : 'Right',
    SPACE_BETWEEN: 'Space Between',
  };

  if (direction === 'VERTICAL') {
    // primary controls top/center/bottom/space-between
    vertPos = primaryMap[primary] ?? 'Top';
    // counter controls left/center/right
    horizPos = counter === 'MIN' ? 'Left' : counter === 'CENTER' ? 'Center' : counter === 'MAX' ? 'Right' : 'Left';
  } else {
    // HORIZONTAL: primary controls left/center/right/space-between
    horizPos = primaryMap[primary] ?? 'Left';
    // counter controls top/center/bottom
    vertPos = counter === 'MIN' ? 'Top' : counter === 'CENTER' ? 'Center' : counter === 'MAX' ? 'Bottom' : 'Top';
  }

  return `${vertPos} ${horizPos}`;
}

function addPropertyRow(parent: FrameNode, label: string, value: string, icon?: string): void {
  const row = figma.createFrame();
  row.name = `prop-${label}`;
  row.layoutMode = 'HORIZONTAL';
  row.primaryAxisSizingMode = 'AUTO';
  row.counterAxisSizingMode = 'AUTO';
  row.fills = [];
  row.itemSpacing = 6;

  const labelText = figma.createText();
  labelText.fontName = { family: 'Inter', style: 'Regular' };
  labelText.fontSize = 11;
  labelText.characters = label;
  labelText.fills = [{ type: 'SOLID', color: hexToRgb(LABEL_GRAY) }];
  row.appendChild(labelText);

  if (icon) {
    // Horizontal value frame containing icon + value text
    const valueFrame = figma.createFrame();
    valueFrame.name = 'value-frame';
    valueFrame.layoutMode = 'HORIZONTAL';
    valueFrame.primaryAxisSizingMode = 'AUTO';
    valueFrame.counterAxisSizingMode = 'AUTO';
    valueFrame.fills = [];
    valueFrame.itemSpacing = 4;

    const iconText = figma.createText();
    iconText.fontName = { family: 'Inter', style: 'Regular' };
    iconText.fontSize = 11;
    iconText.characters = icon;
    iconText.fills = [{ type: 'SOLID', color: hexToRgb(VALUE_DARK) }];
    valueFrame.appendChild(iconText);

    const valueText = figma.createText();
    valueText.fontName = { family: 'Inter', style: 'Medium' };
    valueText.fontSize = 11;
    valueText.characters = value;
    valueText.fills = [{ type: 'SOLID', color: hexToRgb(VALUE_DARK) }];
    valueFrame.appendChild(valueText);

    row.appendChild(valueFrame);
  } else {
    const valueText = figma.createText();
    valueText.fontName = { family: 'Inter', style: 'Medium' };
    valueText.fontSize = 11;
    valueText.characters = value;
    valueText.fills = [{ type: 'SOLID', color: hexToRgb(VALUE_DARK) }];
    row.appendChild(valueText);
  }

  parent.appendChild(row);
}

function renderPropertyPanel(entry: LayoutEntry): FrameNode {
  const panel = figma.createFrame();
  panel.name = 'property-panel';
  panel.layoutMode = 'VERTICAL';
  panel.counterAxisSizingMode = 'FIXED';
  panel.resize(250, 1);
  panel.primaryAxisSizingMode = 'AUTO';
  panel.fills = [];
  panel.itemSpacing = 8;

  const node = entry.node;

  // Node name
  const nameText = figma.createText();
  nameText.fontName = { family: 'Inter', style: 'Bold' };
  nameText.fontSize = 13;
  nameText.characters = node.name;
  nameText.fills = [{ type: 'SOLID', color: hexToRgb(DARK) }];
  panel.appendChild(nameText);

  // Width
  const wMode = getSizingMode(node, 'horizontal');
  addPropertyRow(panel, 'Width', `${wMode} ${Math.round(node.width)}px`);

  // Height
  const hMode = getSizingMode(node, 'vertical');
  addPropertyRow(panel, 'Height', `${hMode} ${Math.round(node.height)}px`);

  // Fill color / S2A token
  const fills = getNodeFills(node);
  if (fills.length > 0) {
    const fill = fills[0];
    const token = matchColor(fill.hex, detectNodeColorRole(node, 'fill'));
    if (token) {
      addPropertyRow(panel, 'Fill variable', token);
    }
  }

  // Auto-layout props
  const autoLayout = getAutoLayoutProps(node);
  if (autoLayout) {
    const dirArrow = autoLayout.direction === 'VERTICAL' ? '↓' : '→';
    const dirLabel = autoLayout.direction === 'VERTICAL' ? 'Vertical' : 'Horizontal';
    addPropertyRow(panel, 'Direction', `${dirArrow} ${dirLabel}`);

    addPropertyRow(panel, 'Align Children', getAlignmentString(node));

    // Padding (smart formatting) — only show if at least one side > 0
    const { paddingTop: pt, paddingRight: pr, paddingBottom: pb, paddingLeft: pl } = autoLayout;
    if (pt > 0 || pr > 0 || pb > 0 || pl > 0) {
      let paddingStr: string;
      if (pt === pr && pr === pb && pb === pl) {
        paddingStr = `${pt}px`;
      } else if (pt === pb && pr === pl) {
        paddingStr = `${pt}px ${pr}px`;
      } else {
        paddingStr = `${pt}px ${pr}px ${pb}px ${pl}px`;
      }
      addPropertyRow(panel, 'Padding', paddingStr);
    }

    // Gap with token — only show if gap > 0
    const gap = autoLayout.gap;
    if (gap > 0) {
      const gapToken = matchSpacing(`${gap}`);
      const gapStr = gapToken ? gapToken : `${gap}`;
      addPropertyRow(panel, 'Gap', gapStr);
    }
  }

  return panel;
}

// ─── Artwork Panel — Geometry Helpers ─────────────────────────────────────────

interface RelativeBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getRelativeBox(node: SceneNode, root: SceneNode, scale: number): RelativeBox {
  // Prefer absoluteBoundingBox when available — it accounts for rotation and
  // gives the axis-aligned bounding rect. absoluteTransform only gives the
  // top-left origin without accounting for rotation skew on width/height.
  // NOTE: absoluteRenderBounds also exists but excludes strokes/shadows,
  // so absoluteBoundingBox is the better fit for layout measurements.
  const nodeABB = 'absoluteBoundingBox' in node ? (node as any).absoluteBoundingBox : null;
  const rootABB = 'absoluteBoundingBox' in root ? (root as any).absoluteBoundingBox : null;

  if (nodeABB && rootABB) {
    return {
      x: (nodeABB.x - rootABB.x) * scale,
      y: (nodeABB.y - rootABB.y) * scale,
      width: nodeABB.width * scale,
      height: nodeABB.height * scale,
    };
  }

  // Fallback to absoluteTransform — does not account for rotation
  const nodeX = node.absoluteTransform[0][2];
  const nodeY = node.absoluteTransform[1][2];
  const rootX = root.absoluteTransform[0][2];
  const rootY = root.absoluteTransform[1][2];

  return {
    x: (nodeX - rootX) * scale,
    y: (nodeY - rootY) * scale,
    width: node.width * scale,
    height: node.height * scale,
  };
}

function drawDashedRect(box: RelativeBox, parent: FrameNode): void {
  const rect = figma.createRectangle();
  rect.name = 'outline-dashed';
  rect.resize(Math.max(box.width, 1), Math.max(box.height, 1));
  rect.x = box.x;
  rect.y = box.y;
  rect.fills = [];
  rect.strokes = [{ type: 'SOLID', color: hexToRgb(OVERLAY_OUTLINE) }];
  rect.strokeWeight = OUTLINE_WEIGHT;
  rect.dashPattern = OUTLINE_DASH;
  parent.appendChild(rect);
}

// ─── Artwork — Pink Bands ─────────────────────────────────────────────────────

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

function drawPaddingBands(
  artworkFrame: FrameNode,
  exhibitedNode: SceneNode,
  sourceNode: SceneNode,
  scale: number,
  margin: number
): void {
  const autoLayout = getAutoLayoutProps(exhibitedNode);
  if (!autoLayout) return;

  const raw = getRelativeBox(exhibitedNode, sourceNode, scale);
  const box = { x: raw.x + margin, y: raw.y + margin, width: raw.width, height: raw.height };
  const { paddingTop, paddingRight, paddingBottom, paddingLeft } = autoLayout;

  const pt = paddingTop * scale;
  const pr = paddingRight * scale;
  const pb = paddingBottom * scale;
  const pl = paddingLeft * scale;

  // Bands extend full width/height so they overlap at the corners (Spectral style)
  // Top band — full width
  if (pt > 0) drawOverlayRect(box.x, box.y, box.width, pt, OVERLAY_INNER, OVERLAY_INNER_OPACITY, artworkFrame);
  // Bottom band — full width
  if (pb > 0) drawOverlayRect(box.x, box.y + box.height - pb, box.width, pb, OVERLAY_INNER, OVERLAY_INNER_OPACITY, artworkFrame);
  // Left band — full height (overlaps top/bottom at corners)
  if (pl > 0) drawOverlayRect(box.x, box.y, pl, box.height, OVERLAY_INNER, OVERLAY_INNER_OPACITY, artworkFrame);
  // Right band — full height (overlaps top/bottom at corners)
  if (pr > 0) drawOverlayRect(box.x + box.width - pr, box.y, pr, box.height, OVERLAY_INNER, OVERLAY_INNER_OPACITY, artworkFrame);
}

function drawSpacingBands(
  artworkFrame: FrameNode,
  exhibitedNode: SceneNode,
  sourceNode: SceneNode,
  scale: number,
  margin: number
): void {
  const autoLayout = getAutoLayoutProps(exhibitedNode);
  if (!autoLayout) return;
  if (!('children' in exhibitedNode) || exhibitedNode.children.length < 2) return;

  const gap = autoLayout.gap * scale;
  if (gap <= 0) return;

  const rawNodeBox = getRelativeBox(exhibitedNode, sourceNode, scale);
  const nodeBox = { x: rawNodeBox.x + margin, y: rawNodeBox.y + margin, width: rawNodeBox.width, height: rawNodeBox.height };
  const children = (Array.from(exhibitedNode.children) as SceneNode[]).filter(c => !c.name.includes('-overlay'));

  for (let i = 0; i < children.length - 1; i++) {
    const a = children[i];
    const b = children[i + 1];
    const rawA = getRelativeBox(a, sourceNode, scale);
    const rawB = getRelativeBox(b, sourceNode, scale);
    const aBox = { x: rawA.x + margin, y: rawA.y + margin, width: rawA.width, height: rawA.height };
    const bBox = { x: rawB.x + margin, y: rawB.y + margin, width: rawB.width, height: rawB.height };

    if (autoLayout.direction === 'HORIZONTAL') {
      // Gap is between right edge of a and left edge of b — band spans full outer height
      const gapX = aBox.x + aBox.width;
      const gapY = nodeBox.y;
      const gapW = bBox.x - gapX;
      const gapH = nodeBox.height;
      drawOverlayRect(gapX, gapY, gapW, gapH, OVERLAY_INNER, OVERLAY_INNER_OPACITY, artworkFrame);
    } else {
      // VERTICAL: gap between bottom of a and top of b — band spans full outer width
      const gapX = nodeBox.x;
      const gapY = aBox.y + aBox.height;
      const gapW = nodeBox.width;
      const gapH = bBox.y - gapY;
      drawOverlayRect(gapX, gapY, gapW, gapH, OVERLAY_INNER, OVERLAY_INNER_OPACITY, artworkFrame);
    }
  }
}

// ─── Artwork — Measurement Labels and S2A Token Badges ────────────────────────

function createMeasureLabel(value: string, x: number, y: number, parent: FrameNode): void {
  const bg = figma.createFrame();
  bg.name = 'measure-label';
  bg.layoutMode = 'HORIZONTAL';
  bg.primaryAxisSizingMode = 'AUTO';
  bg.counterAxisSizingMode = 'AUTO';
  bg.fills = [{ type: 'SOLID', color: hexToRgb(LABEL_PX_BG) }];
  bg.cornerRadius = 3;
  bg.paddingTop = 2;
  bg.paddingBottom = 2;
  bg.paddingLeft = 5;
  bg.paddingRight = 5;
  bg.x = x;
  bg.y = y;

  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Bold' };
  text.fontSize = 10;
  text.characters = value;
  text.fills = [{ type: 'SOLID', color: hexToRgb(WHITE) }];
  bg.appendChild(text);

  parent.appendChild(bg);
}

function createTokenBadge(tokenName: string, value: string, x: number, y: number, parent: FrameNode): void {
  const bg = figma.createFrame();
  bg.name = 'token-badge';
  bg.layoutMode = 'HORIZONTAL';
  bg.primaryAxisSizingMode = 'AUTO';
  bg.counterAxisSizingMode = 'AUTO';
  bg.fills = [{ type: 'SOLID', color: hexToRgb(LABEL_TOKEN_BG) }];
  bg.cornerRadius = 3;
  bg.paddingTop = 2;
  bg.paddingBottom = 2;
  bg.paddingLeft = 6;
  bg.paddingRight = 6;
  bg.x = x;
  bg.y = y;

  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Medium' };
  text.fontSize = 9;
  text.characters = `${tokenName} ${value}`;
  text.fills = [{ type: 'SOLID', color: hexToRgb(WHITE) }];
  bg.appendChild(text);

  parent.appendChild(bg);
}

function drawMeasurements(
  artworkFrame: FrameNode,
  exhibitedNode: SceneNode,
  sourceNode: SceneNode,
  scale: number,
  margin: number
): void {
  const autoLayout = getAutoLayoutProps(exhibitedNode);
  const rawBox = getRelativeBox(exhibitedNode, sourceNode, scale);
  const box = { x: rawBox.x + margin, y: rawBox.y + margin, width: rawBox.width, height: rawBox.height };

  // Exhibited node width (centered above)
  const widthStr = `${Math.round(exhibitedNode.width)}`;
  const widthToken = matchSpacing(`${Math.round(exhibitedNode.width)}`);
  const labelW = widthStr.length * 6; // approx width
  createMeasureLabel(widthStr, box.x + box.width / 2 - labelW / 2, box.y - 20, artworkFrame);
  if (widthToken) {
    createTokenBadge(widthToken, widthStr, box.x + box.width / 2 - labelW / 2, box.y - 36, artworkFrame);
  }

  if (autoLayout) {
    const { paddingTop, paddingRight, paddingBottom, paddingLeft, gap } = autoLayout;
    const pt = paddingTop * scale;
    const pr = paddingRight * scale;
    const pb = paddingBottom * scale;
    const pl = paddingLeft * scale;

    // Padding labels at edges
    if (pt > 0) {
      createMeasureLabel(`${paddingTop}px`, box.x + box.width / 2 - 15, box.y + pt / 2 - 8, artworkFrame);
    }
    if (pb > 0) {
      createMeasureLabel(`${paddingBottom}px`, box.x + box.width / 2 - 15, box.y + box.height - pb + pb / 2 - 8, artworkFrame);
    }
    if (pl > 0) {
      createMeasureLabel(`${paddingLeft}px`, box.x + pl / 2 - 12, box.y + box.height / 2 - 8, artworkFrame);
    }
    if (pr > 0) {
      createMeasureLabel(`${paddingRight}px`, box.x + box.width - pr + pr / 2 - 12, box.y + box.height / 2 - 8, artworkFrame);
    }

    // Item spacing labels between children and child widths below children
    // Limit to first 8 children to prevent label overlap in dense layouts
    if ('children' in exhibitedNode && exhibitedNode.children.length > 0) {
      const allChildren = Array.from(exhibitedNode.children) as SceneNode[];
      const children = allChildren.slice(0, 8);

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const rawChildBox = getRelativeBox(child, sourceNode, scale);
        const childBox = { x: rawChildBox.x + margin, y: rawChildBox.y + margin, width: rawChildBox.width, height: rawChildBox.height };

        // Child width below child
        const childWidthStr = `${Math.round(child.width)}`;
        const cLabelW = childWidthStr.length * 6;
        createMeasureLabel(childWidthStr, childBox.x + childBox.width / 2 - cLabelW / 2, childBox.y + childBox.height + 4, artworkFrame);

        // Child height to the right of child
        createMeasureLabel(
          `${Math.round(child.height)}`,
          childBox.x + childBox.width + 4,
          childBox.y + childBox.height / 2 - 7,
          artworkFrame,
        );

        // Gap between this child and next
        if (i < children.length - 1 && gap > 0) {
          const next = children[i + 1];
          const rawNextBox = getRelativeBox(next, sourceNode, scale);
          const nextBox = { x: rawNextBox.x + margin, y: rawNextBox.y + margin, width: rawNextBox.width, height: rawNextBox.height };
          const gapStr = `${gap}px`;
          const gToken = matchSpacing(`${gap}`);

          if (autoLayout.direction === 'HORIZONTAL') {
            const gapMidX = childBox.x + childBox.width + (nextBox.x - childBox.x - childBox.width) / 2;
            const gapMidY = childBox.y + childBox.height / 2 - 8;
            createMeasureLabel(gapStr, gapMidX - 12, gapMidY, artworkFrame);
            if (gToken) {
              createTokenBadge(gToken, gapStr, gapMidX - 20, gapMidY - 16, artworkFrame);
            }
          } else {
            const gapMidX = childBox.x + childBox.width / 2 - 12;
            const gapMidY = childBox.y + childBox.height + (nextBox.y - childBox.y - childBox.height) / 2 - 8;
            createMeasureLabel(gapStr, gapMidX, gapMidY, artworkFrame);
            if (gToken) {
              createTokenBadge(gToken, gapStr, gapMidX - 8, gapMidY - 16, artworkFrame);
            }
          }
        }
      }
    }
  }
}

// ─── Artwork Panel — Clone and Overlays ───────────────────────────────────────

const ARTWORK_MARGIN = 40;

function createArtworkPanel(sourceNode: SceneNode, exhibitedNode: SceneNode): FrameNode {
  const artworkFrame = figma.createFrame();
  artworkFrame.name = 'artwork-panel';
  artworkFrame.clipsContent = false;
  artworkFrame.fills = [];

  // Clone and scale
  const clone = sourceNode.clone();
  clone.x = ARTWORK_MARGIN;
  clone.y = ARTWORK_MARGIN;

  const scale = 1;

  artworkFrame.appendChild(clone);
  artworkFrame.resize(
    Math.max(clone.width + ARTWORK_MARGIN * 2, 1),
    Math.max(clone.height + ARTWORK_MARGIN * 2, 1),
  );

  // Red dashed outline on exhibited node
  const rawExhibitBox = getRelativeBox(exhibitedNode, sourceNode, scale);
  const exhibitBox = {
    x: rawExhibitBox.x + ARTWORK_MARGIN,
    y: rawExhibitBox.y + ARTWORK_MARGIN,
    width: rawExhibitBox.width,
    height: rawExhibitBox.height,
  };
  drawDashedRect(exhibitBox, artworkFrame);

  // Pink padding bands
  drawPaddingBands(artworkFrame, exhibitedNode, sourceNode, scale, ARTWORK_MARGIN);

  // Pink spacing bands
  drawSpacingBands(artworkFrame, exhibitedNode, sourceNode, scale, ARTWORK_MARGIN);

  // Measurement labels
  drawMeasurements(artworkFrame, exhibitedNode, sourceNode, scale, ARTWORK_MARGIN);

  return artworkFrame;
}

// ─── Section Wrapper and Exhibit Assembly ─────────────────────────────────────

function createExhibit(sourceNode: SceneNode, entry: LayoutEntry, layerTree: LayerTreeNode): FrameNode {
  const exhibit = figma.createFrame();
  exhibit.name = `exhibit-${entry.name}`;
  exhibit.layoutMode = 'HORIZONTAL';
  exhibit.primaryAxisSizingMode = 'AUTO';
  exhibit.counterAxisSizingMode = 'AUTO';
  exhibit.fills = [{ type: 'SOLID', color: hexToRgb(BG_LIGHT) }];
  exhibit.cornerRadius = 8;
  exhibit.paddingTop = 24;
  exhibit.paddingBottom = 24;
  exhibit.paddingLeft = 24;
  exhibit.paddingRight = 24;
  exhibit.itemSpacing = 32;

  const layerPanel = renderLayerTreePanel(layerTree, entry.node.id);
  const artworkPanel = createArtworkPanel(sourceNode, entry.node);
  const propPanel = renderPropertyPanel(entry);

  exhibit.appendChild(layerPanel);
  exhibit.appendChild(artworkPanel);
  exhibit.appendChild(propPanel);

  return exhibit;
}

// ─── Spacing-only measurements (no widths/heights) ──────────────────────────

function drawSpacingOnlyMeasurements(
  artworkFrame: FrameNode,
  exhibitedNode: SceneNode,
  sourceNode: SceneNode,
  scale: number,
  margin: number
): void {
  const autoLayout = getAutoLayoutProps(exhibitedNode);
  if (!autoLayout) return;

  const rawBox = getRelativeBox(exhibitedNode, sourceNode, scale);
  const box = { x: rawBox.x + margin, y: rawBox.y + margin, width: rawBox.width, height: rawBox.height };
  const { paddingTop, paddingRight, paddingBottom, paddingLeft, gap } = autoLayout;
  const pt = paddingTop * scale;
  const pr = paddingRight * scale;
  const pb = paddingBottom * scale;
  const pl = paddingLeft * scale;

  // Padding labels — token badge OR px label, not both
  if (pt > 0) {
    const x = box.x + box.width / 2 - 15, y = box.y + pt / 2 - 8;
    const t = matchSpacing(`${paddingTop}`);
    if (t) createTokenBadge(t, `${paddingTop}px`, x - 8, y, artworkFrame);
    else createMeasureLabel(`${paddingTop}px`, x, y, artworkFrame);
  }
  if (pb > 0) {
    const x = box.x + box.width / 2 - 15, y = box.y + box.height - pb + pb / 2 - 8;
    const t = matchSpacing(`${paddingBottom}`);
    if (t) createTokenBadge(t, `${paddingBottom}px`, x - 8, y, artworkFrame);
    else createMeasureLabel(`${paddingBottom}px`, x, y, artworkFrame);
  }
  if (pl > 0) {
    const x = box.x + pl / 2 - 12, y = box.y + box.height / 2 - 8;
    const t = matchSpacing(`${paddingLeft}`);
    if (t) createTokenBadge(t, `${paddingLeft}px`, x - 8, y, artworkFrame);
    else createMeasureLabel(`${paddingLeft}px`, x, y, artworkFrame);
  }
  if (pr > 0) {
    const x = box.x + box.width - pr + pr / 2 - 12, y = box.y + box.height / 2 - 8;
    const t = matchSpacing(`${paddingRight}`);
    if (t) createTokenBadge(t, `${paddingRight}px`, x - 8, y, artworkFrame);
    else createMeasureLabel(`${paddingRight}px`, x, y, artworkFrame);
  }

  // Gap labels between children (limit to first 8 to prevent overlap)
  if ('children' in exhibitedNode && exhibitedNode.children.length > 1 && gap > 0) {
    const children = (Array.from(exhibitedNode.children) as SceneNode[]).filter(c => !c.name.includes('-overlay')).slice(0, 8);
    for (let i = 0; i < children.length - 1; i++) {
      const rawA = getRelativeBox(children[i], sourceNode, scale);
      const rawB = getRelativeBox(children[i + 1], sourceNode, scale);
      const aBox = { x: rawA.x + margin, y: rawA.y + margin, width: rawA.width, height: rawA.height };
      const bBox = { x: rawB.x + margin, y: rawB.y + margin, width: rawB.width, height: rawB.height };
      const gapStr = `${gap}px`;
      const gToken = matchSpacing(`${gap}`);

      if (autoLayout.direction === 'HORIZONTAL') {
        const gapMidX = aBox.x + aBox.width + (bBox.x - aBox.x - aBox.width) / 2;
        const gapMidY = aBox.y + aBox.height / 2 - 8;
        if (gToken) createTokenBadge(gToken, gapStr, gapMidX - 20, gapMidY, artworkFrame);
        else createMeasureLabel(gapStr, gapMidX - 12, gapMidY, artworkFrame);
      } else {
        const gapMidX = aBox.x + aBox.width / 2 - 12;
        const gapMidY = aBox.y + aBox.height + (bBox.y - aBox.y - aBox.height) / 2 - 8;
        if (gToken) createTokenBadge(gToken, gapStr, gapMidX - 8, gapMidY, artworkFrame);
        else createMeasureLabel(gapStr, gapMidX, gapMidY, artworkFrame);
      }
    }
  }
}

// ─── Spacing-only section: single panel, padding + gaps only ─────────────────

export async function generateSpacingSection(sourceNode: SceneNode): Promise<void> {
  if (!('children' in sourceNode) || sourceNode.children.length === 0) return;

  // Remove any existing overlays first
  removeOverlays(sourceNode, 'spacing-detailed-overlay');

  // Overlay directly on the original node
  const overlay = figma.createFrame();
  overlay.name = 'spacing-detailed-overlay';
  overlay.resize(sourceNode.width, sourceNode.height);
  overlay.fills = [];
  overlay.clipsContent = false;
  if ('clipsContent' in sourceNode) (sourceNode as FrameNode).clipsContent = false;
  (sourceNode as FrameNode).appendChild(overlay);
  if ('layoutMode' in sourceNode && (sourceNode as FrameNode).layoutMode !== 'NONE') {
    overlay.layoutPositioning = 'ABSOLUTE';
  }
  overlay.resize(sourceNode.width, sourceNode.height);
  overlay.x = 0;
  overlay.y = 0;

  const scale = 1;
  const margin = 0;

  // Draw padding + spacing bands and labels for all auto-layout frames
  drawPaddingBands(overlay, sourceNode, sourceNode, scale, margin);
  drawSpacingBands(overlay, sourceNode, sourceNode, scale, margin);
  drawSpacingOnlyMeasurements(overlay, sourceNode, sourceNode, scale, margin);

  function drawChildSpacing(node: SceneNode): void {
    if (!('children' in node)) return;
    for (const child of node.children) {
      if (child.name === 'spacing-detailed-overlay') continue;
      // Treat small frames (h ≤ 48) as atomic — buttons, icons, badges, etc.
      if (child.height <= 48) continue;
      const al = getAutoLayoutProps(child);
      if (al && 'children' in child && child.children.length > 0) {
        drawPaddingBands(overlay, child, sourceNode, scale, margin);
        drawSpacingBands(overlay, child, sourceNode, scale, margin);
        drawSpacingOnlyMeasurements(overlay, child, sourceNode, scale, margin);
      }
      drawChildSpacing(child);
    }
  }
  drawChildSpacing(sourceNode);
}

export async function generateLayoutSection(sourceNode: SceneNode): Promise<FrameNode | null> {
  const entries: LayoutEntry[] = [];
  collectLayoutEntries(sourceNode, entries);

  if (entries.length === 0) return null;

  const layerTree = buildLayerTree(sourceNode);

  const section = figma.createFrame();
  section.name = 'Layout and spacing';
  section.layoutMode = 'VERTICAL';
  section.primaryAxisSizingMode = 'AUTO';
  section.counterAxisSizingMode = 'AUTO';
  section.fills = [];
  section.itemSpacing = 24;

  // Section title
  const title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = SECTION_TITLE_SIZE;
  title.characters = 'Layout and spacing';
  title.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  section.appendChild(title);

  // Generate exhibits
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    figma.ui.postMessage({
      type: 'spec-it-status',
      message: `Generating layout exhibit ${i + 1} of ${entries.length}: ${entry.name}…`,
    });
    const exhibit = createExhibit(sourceNode, entry, layerTree);
    section.appendChild(exhibit);
  }

  return section;
}
