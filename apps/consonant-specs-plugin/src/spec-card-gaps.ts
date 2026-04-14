import { matchSpacing } from './tokens';

const BLUE_OVERLAY: RGBA = { r: 0.05, g: 0.41, b: 0.83, a: 0.20 };
const ORANGE_BADGE: RGB = { r: 0.93, g: 0.55, b: 0.15 };
const MAGENTA_BADGE: RGB = { r: 0.78, g: 0.18, b: 0.53 };

interface CardBox {
  x: number;
  y: number;
  w: number;
  h: number;
  right: number;
  bottom: number;
}

/**
 * Card Gaps: clone the node and show spacing bands between card-level children.
 * Finds sibling elements that look like cards (similar-sized rectangles),
 * measures horizontal and vertical gaps between them.
 */
export async function generateCardGaps(node: SceneNode): Promise<void> {
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  // Remove any existing overlays first
  if ('children' in node) {
    const old = (node as FrameNode).children.filter(c => c.name === 'spacing-in-between-overlay');
    for (const o of old) o.remove();
  }

  // Overlay directly on the original node
  const overlay = figma.createFrame();
  overlay.name = 'spacing-in-between-overlay';
  overlay.resize(node.width, node.height);
  overlay.fills = [];
  overlay.clipsContent = false;
  if ('clipsContent' in node) (node as FrameNode).clipsContent = false;
  (node as FrameNode).appendChild(overlay);
  if ('layoutMode' in node && (node as FrameNode).layoutMode !== 'NONE') {
    overlay.layoutPositioning = 'ABSOLUTE';
  }
  overlay.resize(node.width, node.height);
  overlay.x = 0;
  overlay.y = 0;

  // Collect all card-like leaf containers: find groups of same-sized siblings
  const cards: CardBox[] = [];
  findCardGroups(node, node, cards);

  if (cards.length < 2) {
    figma.ui.postMessage({ type: 'spec-it-status', message: 'No card gaps found.' });
    overlay.remove();
    return;
  }

  // Group cards into rows by Y position (within 5px tolerance)
  cards.sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: CardBox[][] = [];
  let currentRow: CardBox[] = [cards[0]];
  for (let i = 1; i < cards.length; i++) {
    if (Math.abs(cards[i].y - currentRow[0].y) < 5) {
      currentRow.push(cards[i]);
    } else {
      rows.push(currentRow);
      currentRow = [cards[i]];
    }
  }
  rows.push(currentRow);

  // Draw horizontal gaps within each row
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    for (let i = 0; i < row.length - 1; i++) {
      const gap = row[i + 1].x - row[i].right;
      if (gap > 0) {
        addBand(overlay, row[i].right, row[i].y, gap, row[i].h, gap, 'gap');
      }
    }
  }

  // Draw vertical gaps between rows
  for (let i = 0; i < rows.length - 1; i++) {
    const topRow = rows[i];
    const bottomRow = rows[i + 1];
    const topBottom = Math.max(...topRow.map(c => c.bottom));
    const bottomTop = Math.min(...bottomRow.map(c => c.y));
    const gap = bottomTop - topBottom;
    if (gap > 0) {
      const leftEdge = Math.min(...topRow.map(c => c.x), ...bottomRow.map(c => c.x));
      const rightEdge = Math.max(...topRow.map(c => c.right), ...bottomRow.map(c => c.right));
      addBand(overlay, leftEdge, topBottom, rightEdge - leftEdge, gap, gap, 'gap');
    }
  }

  figma.ui.postMessage({ type: 'spec-it-status', message: `Found ${cards.length} cards, ${rows.length} rows` });
}

/**
 * Walk the tree and find groups of siblings that are similar-sized (cards).
 * A group of 2+ siblings with similar dimensions = cards.
 */
function findCardGroups(n: SceneNode, root: SceneNode, cards: CardBox[]): void {
  if (!('children' in n)) return;
  const parent = n as FrameNode;
  const children = parent.children.filter(c => 'visible' in c && (c as any).visible);

  // Check if this parent has multiple similar-sized children (card pattern)
  if (children.length >= 2) {
    const sizes = children.map(c => ({ w: Math.round(c.width), h: Math.round(c.height) }));
    // Find the most common size
    const sizeMap = new Map<string, number>();
    for (const s of sizes) {
      const key = `${s.w}x${s.h}`;
      sizeMap.set(key, (sizeMap.get(key) || 0) + 1);
    }
    let bestSize = '';
    let bestCount = 0;
    for (const [key, count] of sizeMap) {
      if (count > bestCount) { bestCount = count; bestSize = key; }
    }

    if (bestCount >= 2) {
      const [tw, th] = bestSize.split('x').map(Number);
      // Skip if the matched size is nearly the full parent width (these are rows, not cards)
      const parentW = parent.width;
      if (tw > parentW * 0.8) {
        // These are row containers — recurse into them instead
        for (const child of children) {
          findCardGroups(child, root, cards);
        }
        return;
      }
      for (const child of children) {
        // Match by height (within 15%) — cards in a row share height but may vary in width
        if (Math.abs(child.height - th) < th * 0.15) {
          // Check if this child is a wrapper (much wider than the typical card width)
          // If it has a single visible child with similar height, use that inner child instead
          if (Math.abs(child.width - tw) > tw * 0.5 && 'children' in child) {
            const innerChildren = (child as FrameNode).children.filter(
              (c: SceneNode) => 'visible' in c && (c as any).visible
            );
            if (innerChildren.length === 1 && Math.abs(innerChildren[0].height - th) < th * 0.15) {
              // This is a wrapper — use the inner child's bounds
              const inner = innerChildren[0];
              const relX = inner.absoluteTransform[0][2] - root.absoluteTransform[0][2];
              const relY = inner.absoluteTransform[1][2] - root.absoluteTransform[1][2];
              cards.push({
                x: relX, y: relY,
                w: inner.width, h: inner.height,
                right: relX + inner.width, bottom: relY + inner.height,
              });
              continue;
            }
          }
          const relX = child.absoluteTransform[0][2] - root.absoluteTransform[0][2];
          const relY = child.absoluteTransform[1][2] - root.absoluteTransform[1][2];
          cards.push({
            x: relX, y: relY,
            w: child.width, h: child.height,
            right: relX + child.width, bottom: relY + child.height,
          });
        }
      }
      return; // Don't recurse into card children
    }
  }

  // Recurse into children
  for (const child of children) {
    findCardGroups(child, root, cards);
  }
}

function addBand(
  parent: FrameNode,
  x: number, y: number, w: number, h: number,
  value: number,
  position: string,
): void {
  const band = figma.createRectangle();
  band.name = `card-gap-${position}`;
  band.resize(Math.max(w, 1), Math.max(h, 1));
  band.x = x;
  band.y = y;
  band.fills = [{ type: 'SOLID', color: { r: BLUE_OVERLAY.r, g: BLUE_OVERLAY.g, b: BLUE_OVERLAY.b }, opacity: BLUE_OVERLAY.a }];
  parent.appendChild(band);

  const token = matchSpacing(String(Math.round(value)));
  const labelText = token ? `${token} ${Math.round(value)}px` : `${Math.round(value)}px`;
  const badgeColor = token ? MAGENTA_BADGE : ORANGE_BADGE;

  const badge = figma.createFrame();
  badge.name = 'gap-label';
  badge.layoutMode = 'HORIZONTAL';
  badge.primaryAxisSizingMode = 'AUTO';
  badge.counterAxisSizingMode = 'AUTO';
  badge.paddingTop = 2;
  badge.paddingBottom = 2;
  badge.paddingLeft = 6;
  badge.paddingRight = 6;
  badge.cornerRadius = 4;
  badge.fills = [{ type: 'SOLID', color: badgeColor }];

  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Bold' };
  text.fontSize = 10;
  text.characters = labelText;
  text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  badge.appendChild(text);

  // Capture badge dimensions before appending to parent — AUTO sizing is finalised
  // once children are in the badge frame. Reading after parent.appendChild risks 0.
  const badgeW = badge.width;
  const badgeH = badge.height;

  parent.appendChild(badge);
  badge.x = x + w / 2 - badgeW / 2;
  badge.y = y + h / 2 - badgeH / 2;
}
