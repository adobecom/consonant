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

  if ('layoutMode' in container && container.layoutMode !== 'NONE') {
    // Auto-layout: Figma stores children in layout order.
    // Check for reversed z-index ordering (itemReverseZIndex flips visual vs array order).
    orderedChildren = [...children];
    if ('itemReverseZIndex' in container && (container as any).itemReverseZIndex === true) {
      orderedChildren.reverse();
    }
  } else {
    // No auto-layout: sort spatially by center point (top-to-bottom, then left-to-right)
    orderedChildren = [...children].sort((a, b) => {
      const aAbs = a.absoluteBoundingBox;
      const bAbs = b.absoluteBoundingBox;
      if (!aAbs || !bAbs) return 0;
      const aCenterY = aAbs.y + aAbs.height / 2;
      const bCenterY = bAbs.y + bAbs.height / 2;
      const aCenterX = aAbs.x + aAbs.width / 2;
      const bCenterX = bAbs.x + bAbs.width / 2;

      // Row grouping: if vertical centers are within half the smaller element's height, same row
      const rowThreshold = Math.min(aAbs.height, bAbs.height) * 0.5;
      if (Math.abs(aCenterY - bCenterY) <= rowThreshold) {
        return aCenterX - bCenterX; // same row — left to right
      }
      return aCenterY - bCenterY; // different rows — top to bottom
    });
  }

  for (const child of orderedChildren) {
    walkLayoutOrder(child, focusableIds, result);
  }
}
