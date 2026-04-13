const FOCUS_COLOR = { r: 0.08, g: 0.45, b: 0.90 };
const FOCUS_STROKE = 2;
const FOCUS_PAD = 4;

/** Min size for an interactive element to get a focus ring */
const MIN_SIZE = 8;

/**
 * Check if a node is a leaf-level interactive element by name + size.
 * Must be small enough to be a single control, not a large container.
 */
function isLeafInteractive(node: SceneNode): boolean {
  const name = node.name.toLowerCase();
  const keywords = ['button', 'cta', 'search', 'close',
    'play', 'pause', 'toggle', 'radio',
    'input', 'avatar', 'sign in', 'sign-in', 'application',
    'carousel', 'arrow', 'chevron'];
  if (keywords.some(k => name.includes(k)) && node.width <= 300 && node.height <= 100) {
    return true;
  }
  // "logo" only if it's a reasonable standalone size (not a tiny mnemonic inside a card)
  if (name === 'logo' && node.width >= 20 && node.width <= 200 && node.height <= 80) {
    return true;
  }
  return false;
}

/**
 * Check if a node is a card/tile — a clickable content container.
 * Matches: "card", "tile", "app-card", "Card 3", "Large / Customer Tile", etc.
 * Must be at least 80px in one dimension to not be a tiny decorative element.
 */
function isCardOrTile(node: SceneNode): boolean {
  const name = node.name.toLowerCase();
  if ((name.includes('card') || name.includes('tile')) && node.width >= 80 && node.height >= 40) {
    return true;
  }
  return false;
}

/**
 * Check if a node is a nav item.
 */
function isNavItem(node: SceneNode): boolean {
  const name = node.name.toLowerCase();
  // Match "Item 1" etc. only inside nav/menu/tab parents, not generic lists
  if (!/^item[\s_-]*\d/.test(name)) return false;
  const parentName = node.parent?.name?.toLowerCase() || '';
  return parentName.includes('nav') || parentName.includes('menu') || parentName.includes('tab') || parentName.includes('bar');
}

/**
 * Check if a node is a pagination group — a container holding dots/indicators.
 * Treated as a single tab stop (roving tabindex within).
 */
function isPaginationGroup(node: SceneNode): boolean {
  const name = node.name.toLowerCase();
  if (!(name.includes('pagination') || name.includes('indicator') || name.includes('dots'))) return false;
  if (!('children' in node)) return false;
  if (node.width < 20 || node.height < 6) return false;
  return true;
}

function getCornerRadius(node: SceneNode): number {
  if ('cornerRadius' in node) {
    const cr = (node as any).cornerRadius;
    if (typeof cr === 'number' && cr > 0) return cr + FOCUS_PAD;
  }
  const w = node.width;
  const h = node.height;
  if (w === h && w < 48) return 100;
  if (h < 24) return 4;
  if (h >= 28 && h <= 56 && w > 60) return Math.round(h / 2);
  if (w > 100 && h > 100) return 12;
  return 4;
}

/**
 * Recursively collect focusable elements.
 * Once found, stop recursing into that element.
 */
function collectFocusable(node: SceneNode, results: SceneNode[], depth = 0): void {
  if (depth > 10) return;
  if (!('children' in node)) return;
  const container = node as FrameNode;

  for (const child of container.children) {
    if (!child.visible) continue;
    if (child.width < MIN_SIZE || child.height < MIN_SIZE) continue;

    if (isLeafInteractive(child)) {
      results.push(child);
      continue;
    }

    if (isCardOrTile(child)) {
      results.push(child);
      continue; // Don't recurse — the card itself is the focus target
    }

    if (isNavItem(child)) {
      results.push(child);
      continue;
    }

    if (isPaginationGroup(child)) {
      results.push(child);
      continue; // Don't recurse — the group is the single focus target
    }

    // Keep searching deeper
    if ('children' in child) {
      collectFocusable(child, results, depth + 1);
    }
  }
}

/**
 * Collect and deduplicate focusable elements from a node tree.
 * Reusable by both focus indicators and focus order.
 */
export function collectFocusableElements(node: SceneNode): SceneNode[] {
  const focusable: SceneNode[] = [];
  collectFocusable(node, focusable);

  if (focusable.length === 0) return [];

  // Deduplicate — if both a parent and its child are found, keep only the parent
  const ids = new Set(focusable.map(n => n.id));
  return focusable.filter(n => {
    let p = n.parent;
    while (p && p.type !== 'PAGE') {
      if (ids.has(p.id)) return false;
      p = p.parent;
    }
    return true;
  });
}

export async function generateFocusIndicators(node: SceneNode): Promise<void> {
  const filtered = collectFocusableElements(node);

  if (filtered.length === 0) {
    figma.notify('No focusable elements found.');
    return;
  }

  const parent = node.parent;
  if (!parent) return;

  // Offset for section-local coordinates
  const parentAbs = ('absoluteBoundingBox' in parent) ? (parent as any).absoluteBoundingBox : null;
  const offsetX = parentAbs ? parentAbs.x : 0;
  const offsetY = parentAbs ? parentAbs.y : 0;

  for (const el of filtered) {
    const abs = el.absoluteBoundingBox;
    if (!abs) continue;

    const rect = figma.createRectangle();
    rect.name = 'Focus Rectangle';
    rect.x = abs.x - FOCUS_PAD - offsetX;
    rect.y = abs.y - FOCUS_PAD - offsetY;
    rect.resize(abs.width + FOCUS_PAD * 2, abs.height + FOCUS_PAD * 2);
    rect.fills = [];
    rect.strokes = [{ type: 'SOLID', color: FOCUS_COLOR }];
    rect.strokeWeight = FOCUS_STROKE;
    rect.strokeAlign = 'CENTER';
    rect.cornerRadius = getCornerRadius(el);
    parent.appendChild(rect);
  }

  figma.notify(`${filtered.length} focus indicators added.`);
}
