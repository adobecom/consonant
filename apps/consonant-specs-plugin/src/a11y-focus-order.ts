import { collectFocusableElements } from './spec-focus-indicators';

export interface FocusOrderEntry {
  index: number;
  node: SceneNode;
  name: string;
  x: number;
  y: number;
}

/**
 * Detect focusable elements and sort by layout-tree order.
 * Walks the Figma node hierarchy, respecting each container's layoutMode
 * (HORIZONTAL → left-to-right, VERTICAL → top-to-bottom).
 * For non-auto-layout containers, falls back to spatial sorting.
 * This mirrors real browser tab order (DOM order, not pixel position).
 */
export function detectFocusOrder(root: SceneNode): FocusOrderEntry[] {
  const focusable = collectFocusableElements(root);
  if (focusable.length === 0) return [];

  const focusableIds = new Set(focusable.map(n => n.id));

  // Walk the tree in layout order, collecting focusable nodes as encountered
  const ordered: SceneNode[] = [];
  walkLayoutOrder(root, focusableIds, ordered);

  return ordered.map((node, i) => {
    const abs = node.absoluteBoundingBox;
    return {
      index: i + 1,
      node,
      name: node.name,
      x: abs ? abs.x : 0,
      y: abs ? abs.y : 0,
    };
  });
}

/**
 * Recursively walk the node tree, visiting children in layout order.
 * - HORIZONTAL auto-layout: children are ordered left-to-right (Figma stores them in layout order)
 * - VERTICAL auto-layout: children are ordered top-to-bottom (Figma stores them in layout order)
 * - No auto-layout: sort children spatially (top-to-bottom, left-to-right by center point)
 *
 * When a focusable node is reached, add it to the result and stop recursing into it.
 */
function walkLayoutOrder(
  node: SceneNode,
  focusableIds: Set<string>,
  result: SceneNode[],
): void {
  // If this node itself is focusable, collect it and stop (don't recurse into children)
  if (focusableIds.has(node.id)) {
    result.push(node);
    return;
  }

  if (!('children' in node)) return;
  const container = node as FrameNode;
  const children = container.children.filter(c => c.visible);

  if (children.length === 0) return;

  // Determine child order based on layout mode
  let orderedChildren: SceneNode[];

  if ('layoutMode' in container &&
      (container.layoutMode === 'HORIZONTAL' || container.layoutMode === 'VERTICAL')) {
    // Auto-layout (linear): Figma stores children in layout order.
    // Check for reversed z-index ordering (itemReverseZIndex flips visual vs array order).
    // GRID layout falls through to spatial sort — its array order is z-order, not reading order.
    orderedChildren = [...children];
    if ('itemReverseZIndex' in container && (container as any).itemReverseZIndex === true) {
      orderedChildren.reverse();
    }
  } else {
    // No auto-layout: sort spatially by bounding-box overlap (top-to-bottom, then left-to-right).
    // Overlap-based row grouping handles cards with different heights but the same top edge —
    // center-distance grouping broke when one card was much taller than its same-row neighbor.
    orderedChildren = [...children].sort((a, b) => {
      const aAbs = a.absoluteBoundingBox;
      const bAbs = b.absoluteBoundingBox;
      if (!aAbs || !bAbs) return 0;

      const aTop = aAbs.y, aBot = aAbs.y + aAbs.height;
      const bTop = bAbs.y, bBot = bAbs.y + bAbs.height;
      const overlap = Math.min(aBot, bBot) - Math.max(aTop, bTop);
      const minHeight = Math.min(aAbs.height, bAbs.height);

      if (overlap >= minHeight * 0.5) {
        return aAbs.x - bAbs.x; // same row — sort by left edge
      }
      return aTop - bTop; // different rows — sort by top edge
    });
  }

  for (const child of orderedChildren) {
    walkLayoutOrder(child, focusableIds, result);
  }
}
