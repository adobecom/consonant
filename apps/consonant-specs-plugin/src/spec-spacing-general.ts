import { matchSpacing } from './tokens';

// Colors matching user preferences
const BLUE_OVERLAY: RGBA = { r: 0.05, g: 0.41, b: 0.83, a: 0.20 }; // #0D69D4 at 20%
const ORANGE_BADGE: RGB = { r: 0.93, g: 0.55, b: 0.15 };
const MAGENTA_BADGE: RGB = { r: 0.78, g: 0.18, b: 0.53 };

/**
 * Spacing General: clone the node and overlay pink bands for padding and gaps
 * between direct children. Labels show S2A token names or raw px values.
 * Only shows top-level spacing — not recursing into nested elements.
 */
export async function generateSpacingGeneral(node: SceneNode, yOffset = 0): Promise<number> {
  if (!('layoutMode' in node)) {
    figma.ui.postMessage({ type: 'spec-it-status', message: 'Node has no auto-layout — skipping spacing general.' });
    return 0;
  }

  const frame = node as FrameNode;
  if (frame.layoutMode === 'NONE') {
    figma.ui.postMessage({ type: 'spec-it-status', message: 'Node has no auto-layout — skipping spacing general.' });
    return 0;
  }

  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  const clone = node.clone();
  const sourceX = node.absoluteTransform[0][2];
  const sourceY = node.absoluteTransform[1][2];
  figma.currentPage.appendChild(clone);
  clone.x = sourceX;
  clone.y = sourceY + node.height + 40 + yOffset;

  // Overlay sits inside the clone so bands are on top of the content
  const overlay = figma.createFrame();
  overlay.name = 'spacing-general-overlay';
  overlay.resize(node.width, node.height);
  overlay.x = 0;
  overlay.y = 0;
  overlay.fills = [];
  overlay.clipsContent = false;
  (clone as FrameNode).clipsContent = false;
  clone.appendChild(overlay);
  overlay.layoutPositioning = 'ABSOLUTE';
  overlay.resize(node.width, node.height);
  overlay.x = 0;
  overlay.y = 0;

  const isVertical = frame.layoutMode === 'VERTICAL';
  const padTop = frame.paddingTop ?? 0;
  const padBottom = frame.paddingBottom ?? 0;
  const padLeft = frame.paddingLeft ?? 0;
  const padRight = frame.paddingRight ?? 0;
  const gap = frame.itemSpacing !== figma.mixed ? (frame.itemSpacing ?? 0) : 0;

  const w = node.width;
  const h = node.height;

  // Padding overlays — left/right span full height to overlap with top/bottom
  if (padTop > 0) addBand(overlay, 0, 0, w, padTop, padTop, 'top', w);
  if (padBottom > 0) addBand(overlay, 0, h - padBottom, w, padBottom, padBottom, 'bottom', w);
  if (padLeft > 0) addBand(overlay, 0, 0, padLeft, h, padLeft, 'left', w);
  if (padRight > 0) addBand(overlay, w - padRight, 0, padRight, h, padRight, 'right', w);

  // Gap overlays between direct children
  if (gap > 0 && 'children' in frame) {
    const origChildren = (frame as any).children as SceneNode[];
    const visibleChildren = origChildren.filter((c: SceneNode) => 'visible' in c && (c as any).visible);

    for (let i = 0; i < visibleChildren.length - 1; i++) {
      const child = visibleChildren[i];
      const childRel = getRelPos(child, node);

      if (isVertical) {
        const gapY = childRel.y + child.height;
        addBand(overlay, 0, gapY, w, gap, gap, 'gap', w);
      } else {
        const gapX = childRel.x + child.width;
        addBand(overlay, gapX, 0, gap, h, gap, 'gap', w);
      }
    }
  }



  figma.ui.postMessage({ type: 'spec-it-status', message: 'Spacing general complete!' });
  return clone.height + 40;
}

function getRelPos(child: SceneNode, parent: SceneNode): { x: number; y: number } {
  return {
    x: child.absoluteTransform[0][2] - parent.absoluteTransform[0][2],
    y: child.absoluteTransform[1][2] - parent.absoluteTransform[1][2],
  };
}

function addBand(
  parent: FrameNode,
  x: number, y: number, w: number, h: number,
  value: number,
  position: string,
  frameWidth: number,
): void {
  const color = BLUE_OVERLAY;
  const band = figma.createRectangle();
  band.name = `spacing-${position}`;
  band.resize(Math.max(w, 1), Math.max(h, 1));
  band.x = x;
  band.y = y;
  band.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a }];
  parent.appendChild(band);

  // Check if side margin matches 8.333% of viewport width (grid rule)
  let labelText: string;
  let badgeColor: RGB;
  const token = matchSpacing(String(value));
  if ((position === 'left' || position === 'right') && frameWidth > 0) {
    const pct = (value / frameWidth) * 100;
    if (Math.abs(pct - 8.333) < 0.5) {
      labelText = `8.333%`;
      badgeColor = MAGENTA_BADGE;
    } else if (token) {
      labelText = `${token} ${value}px`;
      badgeColor = MAGENTA_BADGE;
    } else {
      labelText = `${value}px`;
      badgeColor = ORANGE_BADGE;
    }
  } else if (token) {
    labelText = `${token} ${value}px`;
    badgeColor = MAGENTA_BADGE;
  } else {
    labelText = `${value}px`;
    badgeColor = ORANGE_BADGE;
  }

  const badge = figma.createFrame();
  badge.name = 'spacing-label';
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

  parent.appendChild(badge);

  // Position the badge centered on the band
  if (position === 'top' || position === 'bottom' || position === 'gap') {
    if (w > h) {
      // Horizontal band — center badge horizontally
      badge.x = x + w / 2 - badge.width / 2;
      badge.y = y + h / 2 - badge.height / 2;
    } else {
      // Vertical band — center badge vertically
      badge.x = x + w / 2 - badge.width / 2;
      badge.y = y + h / 2 - badge.height / 2;
    }
  } else if (position === 'left') {
    badge.x = x + w / 2 - badge.width / 2;
    badge.y = y + h / 2 - badge.height / 2;
  } else if (position === 'right') {
    badge.x = x + w / 2 - badge.width / 2;
    badge.y = y + h / 2 - badge.height / 2;
  }
}
