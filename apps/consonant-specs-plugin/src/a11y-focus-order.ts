import { collectFocusableElements } from './spec-focus-indicators';

export interface FocusOrderEntry {
  index: number;
  node: SceneNode;
  name: string;
  x: number;
  y: number;
}

/**
 * Detect focusable elements and sort by reading order (top-to-bottom, left-to-right).
 * Groups elements into rows by Y proximity (within 20px = same row), then sorts left-to-right within each row.
 */
export function detectFocusOrder(root: SceneNode): FocusOrderEntry[] {
  const focusable = collectFocusableElements(root);
  if (focusable.length === 0) return [];

  // Get absolute positions
  const withPos = focusable.map(node => {
    const abs = node.absoluteBoundingBox;
    return {
      node,
      name: node.name,
      x: abs ? abs.x : 0,
      y: abs ? abs.y : 0,
    };
  });

  // Sort by reading order: group into rows (within 20px Y tolerance), then sort by X
  const ROW_TOLERANCE = 20;
  withPos.sort((a, b) => {
    if (Math.abs(a.y - b.y) <= ROW_TOLERANCE) {
      return a.x - b.x; // same row — left to right
    }
    return a.y - b.y; // different rows — top to bottom
  });

  return withPos.map((entry, i) => ({
    index: i + 1,
    node: entry.node,
    name: entry.name,
    x: entry.x,
    y: entry.y,
  }));
}
