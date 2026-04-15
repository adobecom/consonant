import { collectFocusableElements } from './spec-focus-indicators';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScanTextNode {
  characters: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hasUnderline: boolean;
  fillColor?: { r: number; g: number; b: number };
  parentName: string;
  depth: number;
}

export interface ScanRepeatingGroup {
  containerNodeId: string;
  containerName: string;
  layoutMode: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  childCount: number;
  childAvgWidth: number;
  childAvgHeight: number;
  childSizeVariance: number;
  hasDistinctChild: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScanImageNode {
  nodeId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isFullBleed: boolean;
  hasTextSibling: boolean;
  parentName: string;
}

export interface ScanIconFrame {
  nodeId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hasVectorChild: boolean;
  hasTextChild: boolean;
  parentName: string;
}

export interface ScanPairedStack {
  containerNodeId: string;
  containerName: string;
  pairCount: number;
  headerAvgHeight: number;
  contentAvgHeight: number;
  x: number;
  y: number;
}

export interface ScanOverlay {
  nodeId: string;
  nodeName: string;
  width: number;
  height: number;
  coversPercentOfParent: number;
  hasSemiTransparentSibling: boolean;
}

export interface ScanFocusableElement {
  nodeId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StructuralScan {
  textNodes: ScanTextNode[];
  repeatingGroups: ScanRepeatingGroup[];
  imageNodes: ScanImageNode[];
  iconFrames: ScanIconFrame[];
  pairedStacks: ScanPairedStack[];
  overlays: ScanOverlay[];
  focusableElements: ScanFocusableElement[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_DEPTH = 10;
const MAX_TEXT_NODES = 30;
const MAX_REPEATING_GROUPS = 20;
const MAX_IMAGE_NODES = 20;
const MAX_ICON_FRAMES = 20;
const MAX_PAIRED_STACKS = 10;
const MAX_OVERLAYS = 10;
const MAX_FOCUSABLE = 50;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isVisible(node: SceneNode): boolean {
  return node.visible !== false;
}

function hasChildren(node: SceneNode): node is FrameNode | GroupNode | ComponentNode | ComponentSetNode | InstanceNode | SectionNode {
  return 'children' in node && Array.isArray((node as any).children);
}

function getAbsBounds(node: SceneNode): { x: number; y: number; width: number; height: number } {
  const abs = node.absoluteBoundingBox;
  if (abs) return { x: abs.x, y: abs.y, width: abs.width, height: abs.height };
  return { x: 0, y: 0, width: 0, height: 0 };
}

function firstSolidFillColor(node: SceneNode): { r: number; g: number; b: number } | undefined {
  if (!('fills' in node)) return undefined;
  const fills = (node as GeometryMixin).fills;
  if (fills === figma.mixed || !Array.isArray(fills)) return undefined;
  for (const fill of fills) {
    if (fill.type === 'SOLID' && fill.visible !== false) {
      return { r: fill.color.r, g: fill.color.g, b: fill.color.b };
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// 1. Text node collector
// ---------------------------------------------------------------------------

function collectTextNodes(node: SceneNode, results: ScanTextNode[], depth: number): void {
  if (depth > MAX_DEPTH || results.length >= MAX_TEXT_NODES) return;
  if (!isVisible(node)) return;

  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    if (textNode.characters.length === 0) return; // empty text node — skip
    const chars = textNode.characters.slice(0, 80);

    // fontSize — handle mixed
    let fontSize = 0;
    if (textNode.fontSize !== figma.mixed) {
      fontSize = textNode.fontSize as number;
    } else {
      // Use getRangeFontSize for the first character as fallback
      fontSize = textNode.getRangeFontSize(0, 1) as number;
      if ((fontSize as any) === figma.mixed) fontSize = 0;
    }

    // fontWeight + fontFamily — handle mixed
    let fontWeight = 'Regular';
    let fontFamily = 'Unknown';
    const fn = textNode.fontName;
    if (fn !== figma.mixed) {
      fontWeight = (fn as FontName).style;
      fontFamily = (fn as FontName).family;
    } else {
      const rangeFn = textNode.getRangeFontName(0, 1);
      if (rangeFn !== figma.mixed) {
        fontWeight = (rangeFn as FontName).style;
        fontFamily = (rangeFn as FontName).family;
      }
    }

    // underline
    let hasUnderline = false;
    const dec = textNode.textDecoration;
    if (dec !== figma.mixed) {
      hasUnderline = dec === 'UNDERLINE';
    }

    const fillColor = firstSolidFillColor(textNode);
    const bounds = getAbsBounds(textNode);
    const parentName = textNode.parent ? textNode.parent.name : '';

    results.push({
      characters: chars,
      fontSize,
      fontWeight,
      fontFamily,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      hasUnderline,
      fillColor,
      parentName,
      depth,
    });
    return;
  }

  if (hasChildren(node)) {
    for (const child of (node as FrameNode).children) {
      if (results.length >= MAX_TEXT_NODES) break;
      collectTextNodes(child, results, depth + 1);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Repeating group collector
// ---------------------------------------------------------------------------

function colorsMatch(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): boolean {
  return Math.abs(a.r - b.r) < 0.02 && Math.abs(a.g - b.g) < 0.02 && Math.abs(a.b - b.b) < 0.02;
}

function hasDistinctFill(children: readonly SceneNode[]): boolean {
  const fills: ({ r: number; g: number; b: number } | null)[] = [];
  for (const child of children) {
    const c = firstSolidFillColor(child);
    fills.push(c ?? null);
  }

  // Need at least one filled child
  const validFills = fills.filter((f): f is { r: number; g: number; b: number } => f !== null);
  if (validFills.length < 2) return false;

  // Check if exactly one fill differs from the rest
  let distinctCount = 0;
  for (let i = 0; i < validFills.length; i++) {
    let matchCount = 0;
    for (let j = 0; j < validFills.length; j++) {
      if (i !== j && colorsMatch(validFills[i], validFills[j])) matchCount++;
    }
    if (matchCount === 0) distinctCount++;
  }
  return distinctCount === 1;
}

function collectRepeatingGroups(node: SceneNode, results: ScanRepeatingGroup[], depth: number): void {
  if (depth > MAX_DEPTH || results.length >= MAX_REPEATING_GROUPS) return;
  if (!isVisible(node)) return;

  if (hasChildren(node)) {
    const container = node as FrameNode;
    const visibleChildren = container.children.filter(isVisible);

    if (visibleChildren.length >= 3) {
      // Compute average width and height
      const widths = visibleChildren.map(c => {
        const b = getAbsBounds(c);
        return b.width;
      });
      const heights = visibleChildren.map(c => {
        const b = getAbsBounds(c);
        return b.height;
      });

      const avgW = widths.reduce((a, b) => a + b, 0) / widths.length;
      const avgH = heights.reduce((a, b) => a + b, 0) / heights.length;

      // Combined variance: normalized std deviation of both dimensions
      const wVariance = avgW > 0
        ? Math.sqrt(widths.reduce((sum, w) => sum + (w - avgW) ** 2, 0) / widths.length) / avgW
        : 0;
      const hVariance = avgH > 0
        ? Math.sqrt(heights.reduce((sum, h) => sum + (h - avgH) ** 2, 0) / heights.length) / avgH
        : 0;
      const combinedVariance = (wVariance + hVariance) / 2;

      if (combinedVariance < 0.3) {
        const bounds = getAbsBounds(node);
        const layoutMode: 'HORIZONTAL' | 'VERTICAL' | 'NONE' =
          'layoutMode' in container && (container.layoutMode === 'HORIZONTAL' || container.layoutMode === 'VERTICAL')
            ? container.layoutMode
            : 'NONE';

        results.push({
          containerNodeId: node.id,
          containerName: node.name,
          layoutMode,
          childCount: visibleChildren.length,
          childAvgWidth: Math.round(avgW),
          childAvgHeight: Math.round(avgH),
          childSizeVariance: Math.round(combinedVariance * 1000) / 1000,
          hasDistinctChild: hasDistinctFill(visibleChildren),
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        });
      }
    }

    // Recurse into children
    for (const child of container.children) {
      if (results.length >= MAX_REPEATING_GROUPS) break;
      collectRepeatingGroups(child, results, depth + 1);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Image node collector
// ---------------------------------------------------------------------------

function hasImageFill(node: SceneNode): boolean {
  if (!('fills' in node)) return false;
  const fills = (node as GeometryMixin).fills;
  if (fills === figma.mixed || !Array.isArray(fills)) return false;
  return fills.some(f => f.type === 'IMAGE' && f.visible !== false);
}

function collectImageNodes(node: SceneNode, results: ScanImageNode[], depth: number): void {
  if (depth > MAX_DEPTH || results.length >= MAX_IMAGE_NODES) return;
  if (!isVisible(node)) return;

  if (hasImageFill(node)) {
    const bounds = getAbsBounds(node);
    const parent = node.parent;

    // Check full-bleed: node covers >90% of parent area
    let isFullBleed = false;
    if (parent && 'absoluteBoundingBox' in parent) {
      const parentBounds = (parent as FrameNode).absoluteBoundingBox;
      if (parentBounds && parentBounds.width > 0 && parentBounds.height > 0) {
        const parentArea = parentBounds.width * parentBounds.height;
        const nodeArea = bounds.width * bounds.height;
        isFullBleed = nodeArea / parentArea > 0.9;
      }
    }

    // Check if parent has a visible text sibling
    let hasTextSibling = false;
    if (parent && 'children' in parent) {
      hasTextSibling = (parent as FrameNode).children.some(
        sibling => sibling.id !== node.id && sibling.type === 'TEXT' && isVisible(sibling)
      );
    }

    results.push({
      nodeId: node.id,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isFullBleed,
      hasTextSibling,
      parentName: parent ? parent.name : '',
    });
  }

  if (hasChildren(node)) {
    for (const child of (node as FrameNode).children) {
      if (results.length >= MAX_IMAGE_NODES) break;
      collectImageNodes(child, results, depth + 1);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Icon frame collector
// ---------------------------------------------------------------------------

function collectIconFrames(node: SceneNode, results: ScanIconFrame[], depth: number): void {
  if (depth > MAX_DEPTH || results.length >= MAX_ICON_FRAMES) return;
  if (!isVisible(node)) return;

  if (hasChildren(node)) {
    const container = node as FrameNode;
    const bounds = getAbsBounds(node);
    const size = Math.max(bounds.width, bounds.height);
    const minSize = Math.min(bounds.width, bounds.height);

    // Small frames: 8-48px in both dimensions
    if (minSize >= 8 && size <= 48) {
      let hasVectorChild = false;
      let hasTextChild = false;

      for (const child of container.children) {
        if (child.type === 'VECTOR' || child.type === 'BOOLEAN_OPERATION' || child.type === 'LINE' || child.type === 'STAR' || child.type === 'ELLIPSE' || child.type === 'POLYGON') {
          hasVectorChild = true;
        }
        if (child.type === 'INSTANCE') {
          hasVectorChild = true; // instances inside small frames are typically icons
        }
        if (child.type === 'TEXT') {
          hasTextChild = true;
        }
      }

      if (hasVectorChild) {
        results.push({
          nodeId: node.id,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          hasVectorChild,
          hasTextChild,
          parentName: node.parent ? node.parent.name : '',
        });
        return; // Don't recurse into icon frames
      }
    }

    // Recurse into children
    for (const child of container.children) {
      if (results.length >= MAX_ICON_FRAMES) break;
      collectIconFrames(child, results, depth + 1);
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Paired stack collector (accordion pattern)
// ---------------------------------------------------------------------------

function collectPairedStacks(node: SceneNode, results: ScanPairedStack[], depth: number): void {
  if (depth > MAX_DEPTH || results.length >= MAX_PAIRED_STACKS) return;
  if (!isVisible(node)) return;

  if (hasChildren(node)) {
    const container = node as FrameNode;

    // Must be vertical auto-layout
    if ('layoutMode' in container && container.layoutMode === 'VERTICAL') {
      const visibleChildren = container.children.filter(isVisible);

      // Need 4+ children with even count
      if (visibleChildren.length >= 4 && visibleChildren.length % 2 === 0) {
        const heights = visibleChildren.map(c => getAbsBounds(c).height);

        // Check alternating short/tall pattern
        const headerHeights: number[] = [];
        const contentHeights: number[] = [];

        for (let i = 0; i < heights.length; i++) {
          if (i % 2 === 0) headerHeights.push(heights[i]);
          else contentHeights.push(heights[i]);
        }

        const headerAvg = headerHeights.reduce((a, b) => a + b, 0) / headerHeights.length;
        const contentAvg = contentHeights.reduce((a, b) => a + b, 0) / contentHeights.length;

        // Headers should be shorter than content
        if (headerAvg > 0 && contentAvg > 0 && headerAvg < contentAvg) {
          // Low header height variance (consistent header sizes)
          const headerVariance = headerAvg > 0
            ? Math.sqrt(headerHeights.reduce((sum, h) => sum + (h - headerAvg) ** 2, 0) / headerHeights.length) / headerAvg
            : 0;

          if (headerVariance < 0.3) {
            const bounds = getAbsBounds(node);
            results.push({
              containerNodeId: node.id,
              containerName: node.name,
              pairCount: visibleChildren.length / 2,
              headerAvgHeight: Math.round(headerAvg),
              contentAvgHeight: Math.round(contentAvg),
              x: bounds.x,
              y: bounds.y,
            });
          }
        }
      }
    }

    // Recurse
    for (const child of container.children) {
      collectPairedStacks(child, results, depth + 1);
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Overlay collector
// ---------------------------------------------------------------------------

function collectOverlays(node: SceneNode, results: ScanOverlay[], depth: number): void {
  if (depth > MAX_DEPTH || results.length >= MAX_OVERLAYS) return;
  if (!isVisible(node)) return;

  if (hasChildren(node)) {
    const container = node as FrameNode;
    const parentBounds = getAbsBounds(node);
    const parentArea = parentBounds.width * parentBounds.height;

    // Skip root level — top-level children covering the page frame are normal layout, not overlays
    if (parentArea > 0 && depth > 0) {
      for (const child of container.children) {
        if (!isVisible(child)) continue;
        const childBounds = getAbsBounds(child);
        const childArea = childBounds.width * childBounds.height;
        const coverPercent = childArea / parentArea;

        if (coverPercent > 0.7) {
          // Check for semi-transparent siblings
          let hasSemiTransparentSibling = false;
          for (const sibling of container.children) {
            if (sibling.id === child.id) continue;
            if (!isVisible(sibling)) continue;

            // Check opacity
            if ('opacity' in sibling && (sibling as FrameNode).opacity < 0.8) {
              hasSemiTransparentSibling = true;
              break;
            }

            // Check solid fill with low opacity
            if ('fills' in sibling) {
              const fills = (sibling as GeometryMixin).fills;
              if (fills !== figma.mixed && Array.isArray(fills)) {
                for (const fill of fills) {
                  if (fill.type === 'SOLID' && fill.visible !== false && fill.opacity !== undefined && fill.opacity < 0.8) {
                    hasSemiTransparentSibling = true;
                    break;
                  }
                }
              }
            }
            if (hasSemiTransparentSibling) break;
          }

          results.push({
            nodeId: child.id,
            nodeName: child.name,
            width: childBounds.width,
            height: childBounds.height,
            coversPercentOfParent: Math.round(coverPercent * 100) / 100,
            hasSemiTransparentSibling,
          });
        }
      }
    }

    // Recurse
    for (const child of container.children) {
      collectOverlays(child, results, depth + 1);
    }
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function runStructuralScan(node: SceneNode): StructuralScan {
  const textNodes: ScanTextNode[] = [];
  const repeatingGroups: ScanRepeatingGroup[] = [];
  const imageNodes: ScanImageNode[] = [];
  const iconFrames: ScanIconFrame[] = [];
  const pairedStacks: ScanPairedStack[] = [];
  const overlays: ScanOverlay[] = [];

  collectTextNodes(node, textNodes, 0);
  collectRepeatingGroups(node, repeatingGroups, 0);
  collectImageNodes(node, imageNodes, 0);
  collectIconFrames(node, iconFrames, 0);
  collectPairedStacks(node, pairedStacks, 0);
  collectOverlays(node, overlays, 0);

  // Focusable elements via shared utility
  const rawFocusable = collectFocusableElements(node);
  const focusableElements: ScanFocusableElement[] = rawFocusable.map(n => {
    const bounds = getAbsBounds(n);
    return {
      nodeId: n.id,
      name: n.name,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };
  });

  // Sort text nodes by fontSize descending
  textNodes.sort((a, b) => b.fontSize - a.fontSize);

  return {
    textNodes: textNodes.slice(0, MAX_TEXT_NODES),
    repeatingGroups: repeatingGroups.slice(0, MAX_REPEATING_GROUPS),
    imageNodes: imageNodes.slice(0, MAX_IMAGE_NODES),
    iconFrames: iconFrames.slice(0, MAX_ICON_FRAMES),
    pairedStacks: pairedStacks.slice(0, MAX_PAIRED_STACKS),
    overlays: overlays.slice(0, MAX_OVERLAYS),
    focusableElements: focusableElements.slice(0, MAX_FOCUSABLE),
  };
}
