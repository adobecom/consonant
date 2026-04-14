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
    'carousel', 'link', 'tab', 'dropdown', 'select',
    'checkbox', 'switch', 'accordion', 'slider', 'menu-item'];
  if (keywords.some(k => name.includes(k)) && node.width <= 300 && node.height <= 100) {
    return true;
  }
  // Arrow/chevron: only interactive if NOT inside an already-interactive parent
  // (decorative arrows inside CTAs/buttons should not be separate focus stops)
  if ((name.includes('arrow') || name.includes('chevron')) && node.width <= 300 && node.height <= 100) {
    if (!hasInteractiveAncestor(node)) return true;
    return false;
  }
  // Logo: clickable homepage link in nav bars
  // Match by name ("logo", "brand", "home") or by being a vector/image that's the first
  // child of a nav-like container (common pattern: logo is first element in the nav)
  if (isNavLogo(node)) return true;

  return false;
}

/** Detect logo elements inside nav containers — they're homepage links */
function isNavLogo(node: SceneNode): boolean {
  // Must be reasonable size (not a tiny mnemonic inside a card)
  if (node.width < 16 || node.width > 200 || node.height < 10 || node.height > 80) return false;

  const name = node.name.toLowerCase();

  // Name-based: "logo", "brand", "home-link", "homelink", etc.
  if (name.includes('logo') || name.includes('brand') || name === 'home' || name.includes('home-link') || name.includes('homelink')) {
    return hasNavAncestor(node);
  }

  // Position-based: first vector/image/instance child inside a nav-like container
  // This catches unnamed logo vectors like the Adobe logo
  if (node.type === 'VECTOR' || node.type === 'INSTANCE' || node.type === 'GROUP') {
    if (!hasNavAncestor(node)) return false;
    const parent = node.parent;
    if (!parent || !('children' in parent)) return false;
    const visibleChildren = (parent as FrameNode).children.filter(c => c.visible);
    // Must be the first child
    if (visibleChildren.length > 0 && visibleChildren[0].id === node.id) return true;
  }

  return false;
}

/** Check if any ancestor of this node looks interactive by name */
function hasInteractiveAncestor(node: SceneNode): boolean {
  const interactiveKeywords = ['button', 'cta', 'link', 'tab', 'menu-item'];
  let parent = node.parent;
  // Walk up max 4 levels
  for (let i = 0; i < 4 && parent && parent.type !== 'PAGE'; i++) {
    const pName = parent.name.toLowerCase();
    if (interactiveKeywords.some(k => pName.includes(k))) return true;
    parent = parent.parent;
  }
  return false;
}

/**
 * Check if a TEXT node looks like a link based on visual properties.
 * Detects underlined text, blue-ish colored text, or text with link-like content.
 */
function isTextLink(node: SceneNode): boolean {
  if (node.type !== 'TEXT') return false;
  const textNode = node as TextNode;
  const text = textNode.characters.toLowerCase();

  // Check for link-like text content
  const linkPhrases = ['learn more', 'see all', 'view all', 'read more', 'see details',
    'view details', 'get started', 'try now', 'try free', 'start free',
    'explore ', 'discover ', 'shop now', 'buy now', 'sign up', 'log in'];
  const hasLinkText = linkPhrases.some(p => text.includes(p));

  // Check for underline decoration
  let hasUnderline = false;
  if (textNode.textDecoration !== figma.mixed) {
    hasUnderline = textNode.textDecoration === 'UNDERLINE';
  }

  // Check for blue-ish fill color (common link color)
  let hasBlueFill = false;
  if ('fills' in textNode) {
    const fills = textNode.fills as readonly Paint[];
    if (Array.isArray(fills) && fills.length > 0) {
      const f = fills[0];
      if (f.type === 'SOLID' && f.visible !== false) {
        const { r, g, b } = f.color;
        // Blue-ish: blue channel dominant, not gray/white/black
        hasBlueFill = b > 0.5 && b > r * 1.3 && b > g * 1.3;
      }
    }
  }

  // Need at least link text + one visual cue, or underline alone
  if (hasUnderline) return true;
  if (hasLinkText && hasBlueFill) return true;
  if (hasLinkText && textNode.fontSize !== figma.mixed && (textNode.fontSize as number) <= 16) {
    // Small link-like text that's not a heading — likely a link
    // But only if it's short (< 60 chars) to avoid body text with "learn more" buried in it
    if (textNode.characters.length < 60) return true;
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
 * Check if any ancestor (up to 3 levels) has a nav-like name.
 */
function hasNavAncestor(node: SceneNode): boolean {
  const navKeywords = ['nav', 'menu', 'tab', 'bar', 'header', 'toolbar'];
  let parent = node.parent;
  for (let i = 0; i < 3 && parent && parent.type !== 'PAGE'; i++) {
    const pName = parent.name?.toLowerCase() || '';
    if (navKeywords.some(k => pName.includes(k))) return true;
    parent = parent.parent;
  }
  return false;
}

/**
 * Check if a node contains interactive-looking children (making it a container, not a nav item).
 */
function hasInteractiveChildren(node: SceneNode): boolean {
  if (!('children' in node)) return false;
  const interactiveKeywords = ['button', 'cta', 'sign in', 'sign-in', 'search', 'input'];
  for (const child of (node as FrameNode).children) {
    const name = child.name.toLowerCase();
    if (interactiveKeywords.some(k => name.includes(k))) return true;
    // Recurse one level
    if ('children' in child) {
      for (const grandchild of (child as FrameNode).children) {
        const gcName = grandchild.name.toLowerCase();
        if (interactiveKeywords.some(k => gcName.includes(k))) return true;
      }
    }
  }
  return false;
}

/**
 * Check if a node is a nav item.
 * Two detection strategies:
 * 1. Named "Item N" inside a nav-like ancestor (up to 3 levels)
 * 2. Child of a nav-like horizontal container with 3+ similarly-sized siblings
 *    — detects "Home", "Products", "About Us" etc. inside nav bars
 * Excludes containers that have interactive children inside (those are wrappers, not items).
 */
function isNavItem(node: SceneNode): boolean {
  if (!hasNavAncestor(node)) return false;

  // Exclude containers with interactive children — they're wrappers, not items
  if (hasInteractiveChildren(node)) return false;

  // Strategy 1: "Item N" naming pattern
  const name = node.name.toLowerCase();
  if (/^item[\s_-]*\d/.test(name)) return true;

  // Strategy 2: sibling similarity inside a horizontal container
  const parent = node.parent;
  if (!parent || parent.type === 'PAGE') return false;
  if (!('layoutMode' in parent)) return false;
  const container = parent as FrameNode;
  if (container.layoutMode !== 'HORIZONTAL') return false;

  // Must have 3+ visible siblings of similar height (2 could be any pair of elements)
  const siblings = container.children.filter(c =>
    c.visible && c.width >= MIN_SIZE && c.height >= MIN_SIZE
  );
  if (siblings.length < 3) return false;

  // Check that this node's height is similar to siblings (within 50%)
  const heights = [...siblings.map(s => s.height)].sort((a, b) => a - b);
  const medianH = heights[Math.floor(heights.length / 2)];
  if (Math.abs(node.height - medianH) > medianH * 0.5) return false;

  // Node shouldn't be too large (nav items are compact, not full-width panels)
  if (node.width > 300 || node.height > 80) return false;

  return true;
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

    // Text links: detect by visual properties (underline, blue color, link-like text)
    if (isTextLink(child)) {
      results.push(child);
      continue;
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
