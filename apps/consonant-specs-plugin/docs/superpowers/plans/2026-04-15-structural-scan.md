# Structural Scan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a structural scan module that extracts name-independent signals from the Figma node tree and embeds them in the blueline frame so Claude can use them for more accurate Tier 2 card fills.

**Architecture:** New `a11y-structural-scan.ts` module walks the node tree collecting six categories of structural signals (text nodes, repeating groups, image nodes, icon-only frames, paired stacks, overlays) plus existing Tier 1 focusable elements. The scan result is embedded as a hidden text node inside the blueline frame. The `blueline.md` skill is updated to read this data during fill.

**Tech Stack:** TypeScript (Figma Plugin API), esbuild bundler, Markdown skills

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/a11y-structural-scan.ts` | Create | Walks node tree, extracts 6 structural signal categories, returns JSON |
| `src/a11y-blueline.ts` | Modify | Calls scan after scaffolding, embeds result as hidden node |
| `src/code.ts` | Modify | Expose scan function on globalThis for bridge access |
| `skills/accessibility/blueline.md` | Modify | Teach Claude how to read and use scan data |

---

### Task 1: Create the structural scan module — type definitions and text node collector

**Files:**
- Create: `apps/consonant-specs-plugin/src/a11y-structural-scan.ts`

This task defines the output types and implements the first collector: text nodes.

- [ ] **Step 1: Create the file with type definitions and the text node collector**

```typescript
// apps/consonant-specs-plugin/src/a11y-structural-scan.ts

import { collectFocusableElements } from './spec-focus-indicators';

// ── Output types ─────────────────────────────────────────────────────────

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

// ── Limits ───────────────────────────────────────────────────────────────

const MAX_DEPTH = 10;
const MAX_TEXT_NODES = 30;
const MAX_REPEATING_GROUPS = 20;
const MAX_IMAGE_NODES = 20;
const MAX_ICON_FRAMES = 20;

// ── Text node collector ──────────────────────────────────────────────────

function collectTextNodes(node: SceneNode, results: ScanTextNode[], depth: number): void {
  if (depth > MAX_DEPTH) return;

  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    const abs = textNode.absoluteBoundingBox;
    if (!abs) return;

    let fontSize = 0;
    if (textNode.fontSize !== figma.mixed) {
      fontSize = textNode.fontSize as number;
    } else {
      // Mixed sizes — use the first range
      const range = textNode.getRangeFontSize(0, 1);
      if (typeof range === 'number') fontSize = range;
    }

    let fontWeight = 'Regular';
    let fontFamily = '';
    if (textNode.fontName !== figma.mixed) {
      fontWeight = (textNode.fontName as FontName).style;
      fontFamily = (textNode.fontName as FontName).family;
    }

    let hasUnderline = false;
    if (textNode.textDecoration !== figma.mixed) {
      hasUnderline = textNode.textDecoration === 'UNDERLINE';
    }

    let fillColor: { r: number; g: number; b: number } | undefined;
    if ('fills' in textNode) {
      const fills = textNode.fills as readonly Paint[];
      if (Array.isArray(fills) && fills.length > 0) {
        const f = fills[0];
        if (f.type === 'SOLID' && f.visible !== false) {
          fillColor = { r: f.color.r, g: f.color.g, b: f.color.b };
        }
      }
    }

    results.push({
      characters: textNode.characters.substring(0, 80),
      fontSize,
      fontWeight,
      fontFamily,
      x: abs.x,
      y: abs.y,
      width: abs.width,
      height: abs.height,
      hasUnderline,
      fillColor,
      parentName: node.parent?.name || '',
      depth,
    });
    return;
  }

  if ('children' in node) {
    for (const child of (node as FrameNode).children) {
      if (!child.visible) continue;
      collectTextNodes(child, results, depth + 1);
    }
  }
}
```

- [ ] **Step 2: Build to verify no type errors**

Run: `cd apps/consonant-specs-plugin && node esbuild.config.mjs`

The file won't be imported yet so it won't be in the bundle, but TypeScript type checking via the build ensures no syntax errors. Alternatively check with:

Run: `cd apps/consonant-specs-plugin && npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add apps/consonant-specs-plugin/src/a11y-structural-scan.ts
git commit -m "feat(a11y): add structural scan module — types and text node collector"
```

---

### Task 2: Add repeating groups and image node collectors

**Files:**
- Modify: `apps/consonant-specs-plugin/src/a11y-structural-scan.ts`

- [ ] **Step 1: Add the repeating groups collector after the text node collector**

Add this at the end of the file, after the `collectTextNodes` function:

```typescript
// ── Repeating groups collector ───────────────────────────────────────────

function hasDistinctFill(children: readonly SceneNode[]): boolean {
  // Check if one child has a visually different fill from the others
  // (e.g., selected tab, active pagination dot)
  const fills: string[] = [];
  for (const child of children) {
    if (!('fills' in child)) { fills.push('none'); continue; }
    const f = (child as GeometryMixin).fills;
    if (!Array.isArray(f) || f.length === 0) { fills.push('none'); continue; }
    const first = f[0];
    if (first.type === 'SOLID' && first.visible !== false) {
      fills.push(`${first.color.r.toFixed(2)},${first.color.g.toFixed(2)},${first.color.b.toFixed(2)}`);
    } else {
      fills.push('other');
    }
  }
  if (fills.length < 3) return false;
  // Count occurrences — if exactly one differs from the majority, it's distinct
  const counts = new Map<string, number>();
  for (const f of fills) counts.set(f, (counts.get(f) || 0) + 1);
  let distinctCount = 0;
  for (const [, count] of counts) {
    if (count === 1) distinctCount++;
  }
  return distinctCount === 1 && counts.size === 2;
}

function collectRepeatingGroups(node: SceneNode, results: ScanRepeatingGroup[], depth: number): void {
  if (depth > MAX_DEPTH) return;
  if (!('children' in node)) return;

  const container = node as FrameNode;
  const visible = container.children.filter(c => c.visible);
  if (visible.length >= 3) {
    const widths = visible.map(c => c.width);
    const heights = visible.map(c => c.height);
    const avgW = widths.reduce((a, b) => a + b, 0) / widths.length;
    const avgH = heights.reduce((a, b) => a + b, 0) / heights.length;

    // Size variance: average deviation from the mean, normalized by the mean
    const wVariance = avgW > 0
      ? widths.reduce((sum, w) => sum + Math.abs(w - avgW), 0) / widths.length / avgW
      : 1;
    const hVariance = avgH > 0
      ? heights.reduce((sum, h) => sum + Math.abs(h - avgH), 0) / heights.length / avgH
      : 1;
    const combinedVariance = (wVariance + hVariance) / 2;

    // Low variance = children are roughly the same size = likely a pattern
    if (combinedVariance < 0.3) {
      const abs = container.absoluteBoundingBox;
      if (abs) {
        let layoutMode: 'HORIZONTAL' | 'VERTICAL' | 'NONE' = 'NONE';
        if ('layoutMode' in container) {
          const lm = container.layoutMode;
          if (lm === 'HORIZONTAL') layoutMode = 'HORIZONTAL';
          else if (lm === 'VERTICAL') layoutMode = 'VERTICAL';
        }

        results.push({
          containerNodeId: container.id,
          containerName: container.name,
          layoutMode,
          childCount: visible.length,
          childAvgWidth: Math.round(avgW),
          childAvgHeight: Math.round(avgH),
          childSizeVariance: Math.round(combinedVariance * 100) / 100,
          hasDistinctChild: hasDistinctFill(visible),
          x: abs.x,
          y: abs.y,
          width: abs.width,
          height: abs.height,
        });
      }
    }
  }

  // Recurse into children
  for (const child of visible) {
    if ('children' in child) {
      collectRepeatingGroups(child, results, depth + 1);
    }
  }
}

// ── Image node collector ─────────────────────────────────────────────────

function hasImageFill(node: SceneNode): boolean {
  if (!('fills' in node)) return false;
  const fills = (node as GeometryMixin).fills;
  if (!Array.isArray(fills)) return false;
  return fills.some(f => f.type === 'IMAGE' && f.visible !== false);
}

function collectImageNodes(node: SceneNode, results: ScanImageNode[], depth: number): void {
  if (depth > MAX_DEPTH) return;

  if (hasImageFill(node)) {
    const abs = node.absoluteBoundingBox;
    if (!abs) return;

    // Check if image covers >90% of parent (full bleed / decorative background)
    let isFullBleed = false;
    const parent = node.parent;
    if (parent && 'absoluteBoundingBox' in parent) {
      const pAbs = (parent as SceneNode).absoluteBoundingBox;
      if (pAbs && pAbs.width > 0 && pAbs.height > 0) {
        const coverage = (abs.width * abs.height) / (pAbs.width * pAbs.height);
        isFullBleed = coverage > 0.9;
      }
    }

    // Check if parent has a TEXT child sibling (hero image with text overlay)
    let hasTextSibling = false;
    if (parent && 'children' in parent) {
      for (const sibling of (parent as FrameNode).children) {
        if (sibling.id !== node.id && sibling.type === 'TEXT' && sibling.visible) {
          hasTextSibling = true;
          break;
        }
      }
    }

    results.push({
      nodeId: node.id,
      x: abs.x,
      y: abs.y,
      width: abs.width,
      height: abs.height,
      isFullBleed,
      hasTextSibling,
      parentName: parent?.name || '',
    });
  }

  if ('children' in node) {
    for (const child of (node as FrameNode).children) {
      if (!child.visible) continue;
      collectImageNodes(child, results, depth + 1);
    }
  }
}
```

- [ ] **Step 2: Type check**

Run: `cd apps/consonant-specs-plugin && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/consonant-specs-plugin/src/a11y-structural-scan.ts
git commit -m "feat(a11y): add repeating groups and image node collectors"
```

---

### Task 3: Add icon frame, paired stack, and overlay collectors

**Files:**
- Modify: `apps/consonant-specs-plugin/src/a11y-structural-scan.ts`

- [ ] **Step 1: Add the three remaining collectors at the end of the file**

```typescript
// ── Icon-only frame collector ────────────────────────────────────────────

function collectIconFrames(node: SceneNode, results: ScanIconFrame[], depth: number): void {
  if (depth > MAX_DEPTH) return;
  if (!('children' in node)) return;

  const container = node as FrameNode;
  for (const child of container.children) {
    if (!child.visible) continue;

    // Small frame (under 48px both dimensions) with children
    if ('children' in child && child.width <= 48 && child.height <= 48 && child.width >= 8 && child.height >= 8) {
      const frame = child as FrameNode;
      let hasVectorChild = false;
      let hasTextChild = false;
      for (const grandchild of frame.children) {
        if (!grandchild.visible) continue;
        if (grandchild.type === 'VECTOR' || grandchild.type === 'BOOLEAN_OPERATION' || grandchild.type === 'STAR' || grandchild.type === 'LINE' || grandchild.type === 'ELLIPSE' || grandchild.type === 'POLYGON') {
          hasVectorChild = true;
        }
        if (grandchild.type === 'TEXT') {
          hasTextChild = true;
        }
        // Instance children (icon components) count as vector
        if (grandchild.type === 'INSTANCE' || grandchild.type === 'COMPONENT') {
          hasVectorChild = true;
        }
      }

      if (hasVectorChild) {
        const abs = child.absoluteBoundingBox;
        if (abs) {
          results.push({
            nodeId: child.id,
            x: abs.x,
            y: abs.y,
            width: abs.width,
            height: abs.height,
            hasVectorChild,
            hasTextChild,
            parentName: child.parent?.name || '',
          });
        }
      }
    }

    // Recurse
    if ('children' in child) {
      collectIconFrames(child, results, depth + 1);
    }
  }
}

// ── Paired stack collector (accordion candidates) ────────────────────────

function collectPairedStacks(node: SceneNode, results: ScanPairedStack[], depth: number): void {
  if (depth > MAX_DEPTH) return;
  if (!('children' in node)) return;

  const container = node as FrameNode;

  // Only check vertical auto-layout containers
  if ('layoutMode' in container && container.layoutMode === 'VERTICAL') {
    const visible = container.children.filter(c => c.visible);

    // Need at least 4 children to form 2 pairs (header, content, header, content)
    if (visible.length >= 4 && visible.length % 2 === 0) {
      let isPaired = true;
      const headerHeights: number[] = [];
      const contentHeights: number[] = [];

      for (let i = 0; i < visible.length; i += 2) {
        const header = visible[i];
        const content = visible[i + 1];
        if (!content) { isPaired = false; break; }

        // Header should be shorter than content
        if (header.height >= content.height) { isPaired = false; break; }

        // Headers should be roughly similar height to each other
        headerHeights.push(header.height);
        contentHeights.push(content.height);
      }

      if (isPaired && headerHeights.length >= 2) {
        const avgHeaderH = headerHeights.reduce((a, b) => a + b, 0) / headerHeights.length;
        const headerVariance = avgHeaderH > 0
          ? headerHeights.reduce((sum, h) => sum + Math.abs(h - avgHeaderH), 0) / headerHeights.length / avgHeaderH
          : 1;

        // Headers should be uniform (low variance)
        if (headerVariance < 0.3) {
          const abs = container.absoluteBoundingBox;
          const avgContentH = contentHeights.reduce((a, b) => a + b, 0) / contentHeights.length;
          if (abs) {
            results.push({
              containerNodeId: container.id,
              containerName: container.name,
              pairCount: headerHeights.length,
              headerAvgHeight: Math.round(avgHeaderH),
              contentAvgHeight: Math.round(avgContentH),
              x: abs.x,
              y: abs.y,
            });
          }
        }
      }
    }
  }

  // Recurse
  for (const child of container.children) {
    if (!child.visible) continue;
    if ('children' in child) {
      collectPairedStacks(child, results, depth + 1);
    }
  }
}

// ── Overlay collector (modal/dialog candidates) ──────────────────────────

function collectOverlays(node: SceneNode, results: ScanOverlay[], depth: number): void {
  if (depth > MAX_DEPTH) return;
  if (!('children' in node)) return;

  const container = node as FrameNode;
  const abs = container.absoluteBoundingBox;
  if (!abs || abs.width === 0 || abs.height === 0) return;

  for (const child of container.children) {
    if (!child.visible) continue;
    if (!('children' in child)) continue;

    const childAbs = child.absoluteBoundingBox;
    if (!childAbs) continue;

    const coverage = (childAbs.width * childAbs.height) / (abs.width * abs.height);

    if (coverage > 0.7) {
      // Check if there's a semi-transparent sibling (scrim/backdrop)
      let hasSemiTransparentSibling = false;
      for (const sibling of container.children) {
        if (sibling.id === child.id || !sibling.visible) continue;
        if ('opacity' in sibling && (sibling as SceneNode).opacity < 0.8 && (sibling as SceneNode).opacity > 0) {
          hasSemiTransparentSibling = true;
          break;
        }
        // Also check for semi-transparent fills
        if ('fills' in sibling) {
          const fills = (sibling as GeometryMixin).fills;
          if (Array.isArray(fills)) {
            for (const f of fills) {
              if (f.type === 'SOLID' && f.visible !== false && f.opacity !== undefined && f.opacity < 0.8 && f.opacity > 0) {
                hasSemiTransparentSibling = true;
                break;
              }
            }
          }
        }
      }

      results.push({
        nodeId: child.id,
        nodeName: child.name,
        width: childAbs.width,
        height: childAbs.height,
        coversPercentOfParent: Math.round(coverage * 100),
        hasSemiTransparentSibling,
      });
    }
  }

  // Recurse into children
  for (const child of container.children) {
    if (!child.visible) continue;
    if ('children' in child) {
      collectOverlays(child, results, depth + 1);
    }
  }
}
```

- [ ] **Step 2: Type check**

Run: `cd apps/consonant-specs-plugin && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/consonant-specs-plugin/src/a11y-structural-scan.ts
git commit -m "feat(a11y): add icon frame, paired stack, and overlay collectors"
```

---

### Task 4: Add the main `runStructuralScan` function and export

**Files:**
- Modify: `apps/consonant-specs-plugin/src/a11y-structural-scan.ts`

- [ ] **Step 1: Add the orchestrator function at the end of the file**

```typescript
// ── Main scan function ───────────────────────────────────────────────────

export function runStructuralScan(node: SceneNode): StructuralScan {
  // Collect all signals
  const textNodes: ScanTextNode[] = [];
  collectTextNodes(node, textNodes, 0);

  const repeatingGroups: ScanRepeatingGroup[] = [];
  collectRepeatingGroups(node, repeatingGroups, 0);

  const imageNodes: ScanImageNode[] = [];
  collectImageNodes(node, imageNodes, 0);

  const iconFrames: ScanIconFrame[] = [];
  collectIconFrames(node, iconFrames, 0);

  const pairedStacks: ScanPairedStack[] = [];
  collectPairedStacks(node, pairedStacks, 0);

  const overlays: ScanOverlay[] = [];
  collectOverlays(node, overlays, 0);

  // Collect focusable elements from Tier 1 detection
  const rawFocusable = collectFocusableElements(node);
  const focusableElements: ScanFocusableElement[] = rawFocusable.map(el => {
    const abs = el.absoluteBoundingBox;
    return {
      nodeId: el.id,
      name: el.name,
      x: abs ? abs.x : 0,
      y: abs ? abs.y : 0,
      width: abs ? abs.width : 0,
      height: abs ? abs.height : 0,
    };
  });

  // Sort and truncate to keep JSON under 10KB
  textNodes.sort((a, b) => b.fontSize - a.fontSize);
  textNodes.splice(MAX_TEXT_NODES);
  repeatingGroups.splice(MAX_REPEATING_GROUPS);
  imageNodes.splice(MAX_IMAGE_NODES);
  iconFrames.splice(MAX_ICON_FRAMES);

  return {
    textNodes,
    repeatingGroups,
    imageNodes,
    iconFrames,
    pairedStacks,
    overlays,
    focusableElements,
  };
}
```

- [ ] **Step 2: Type check**

Run: `cd apps/consonant-specs-plugin && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/consonant-specs-plugin/src/a11y-structural-scan.ts
git commit -m "feat(a11y): add main runStructuralScan orchestrator"
```

---

### Task 5: Integrate the scan into the blueline generation flow

**Files:**
- Modify: `apps/consonant-specs-plugin/src/a11y-blueline.ts`
- Modify: `apps/consonant-specs-plugin/src/code.ts`

- [ ] **Step 1: Add the import to `a11y-blueline.ts`**

At the top of `apps/consonant-specs-plugin/src/a11y-blueline.ts`, add the import:

```typescript
import { runStructuralScan } from './a11y-structural-scan';
```

So the imports become:

```typescript
// Waiver: annotation text uses manual fontName — these are spec overlays, not themed UI
import { generateFocusIndicators, collectFocusableElements } from './spec-focus-indicators';
import { detectFocusOrder, FocusOrderEntry } from './a11y-focus-order';
import { runStructuralScan } from './a11y-structural-scan';
```

- [ ] **Step 2: Add a helper function to embed the scan data as a hidden text node**

Add this after the `loadFonts` function (around line 206) in `a11y-blueline.ts`:

```typescript
async function embedStructuralScan(node: SceneNode, parent: BaseNode & ChildrenMixin): Promise<void> {
  const scan = runStructuralScan(node);
  const json = JSON.stringify(scan);

  // Remove any existing scan node
  const existing = parent.findOne(n => n.name === '.structural-scan' && n.type === 'TEXT');
  if (existing) existing.remove();

  const scanNode = figma.createText();
  scanNode.name = '.structural-scan';
  scanNode.characters = json;
  scanNode.fontSize = 1;
  scanNode.opacity = 0;
  scanNode.locked = true;
  parent.appendChild(scanNode);
}
```

- [ ] **Step 3: Call the scan in `generateBlueline` — after scaffolding, before the return**

In the `generateBlueline` function, add the scan call right before the `// Zoom to show the annotation area` comment (around line 653):

```typescript
  // --- Embed structural scan data ---
  figma.ui.postMessage({ type: 'a11y-status', message: 'Running structural scan...' });
  await embedStructuralScan(node, page);
```

So the end of `generateBlueline` becomes:

```typescript
  // --- Embed structural scan data ---
  figma.ui.postMessage({ type: 'a11y-status', message: 'Running structural scan...' });
  await embedStructuralScan(node, page);

  // Zoom to show the annotation area
  const viewNodes: SceneNode[] = [node];
  if (sidebar) viewNodes.push(sidebar);
  figma.viewport.scrollAndZoomIntoView(viewNodes);

  return { frameId: node.id, tier2Sections: tier2 };
```

- [ ] **Step 4: Call the scan in `generateBluelinePanels` too**

In the `generateBluelinePanels` function, add the same scan call before the `// Zoom to show all panels` comment (around line 817):

```typescript
  // --- Embed structural scan data ---
  figma.ui.postMessage({ type: 'a11y-status', message: 'Running structural scan...' });
  await embedStructuralScan(node, page);
```

- [ ] **Step 5: Expose the scan function on globalThis in `code.ts`**

In `apps/consonant-specs-plugin/src/code.ts`, add the import and exposure. Change the import line from:

```typescript
import { generateBlueline, generateBluelinePanels, placeCategoryBadge } from './a11y-blueline';
```

to:

```typescript
import { generateBlueline, generateBluelinePanels, placeCategoryBadge } from './a11y-blueline';
import { runStructuralScan } from './a11y-structural-scan';
```

And add after the existing `globalThis` assignments:

```typescript
(globalThis as any).__runStructuralScan = runStructuralScan;
```

- [ ] **Step 6: Build the plugin**

Run: `cd apps/consonant-specs-plugin && node esbuild.config.mjs`
Expected: `Build complete.` with no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/consonant-specs-plugin/src/a11y-blueline.ts apps/consonant-specs-plugin/src/a11y-structural-scan.ts apps/consonant-specs-plugin/src/code.ts
git commit -m "feat(a11y): integrate structural scan into blueline generation"
```

---

### Task 6: Update the blueline skill to use scan data

**Files:**
- Modify: `apps/consonant-specs-plugin/skills/accessibility/blueline.md`

- [ ] **Step 1: Add a new Phase 0 at the top of the Execution Flow section**

In `apps/consonant-specs-plugin/skills/accessibility/blueline.md`, insert a new phase before the existing "Phase 1 — Gather Context". Find the line `### Phase 1 — Gather Context` and add above it:

```markdown
### Phase 0 — Read Structural Scan

Before gathering visual context, check if the plugin embedded structural analysis data:

1. Via `figma_execute`, search the current page for a text node named `.structural-scan`
   ```js
   const scanNode = figma.currentPage.findOne(n => n.name === '.structural-scan' && n.type === 'TEXT');
   if (scanNode) return scanNode.characters;
   ```
2. If found, parse the JSON. This contains:
   - `textNodes` — every text element sorted by font size (heading candidates)
   - `repeatingGroups` — containers with 3+ same-sized children (tabs, nav, pagination, card grids)
   - `imageNodes` — elements with image fills, flagged as full-bleed (decorative) or content
   - `iconFrames` — small frames with vector/icon but no text (need aria-label)
   - `pairedStacks` — alternating short/tall children in vertical stacks (accordion candidates)
   - `overlays` — large frames covering 70%+ of parent, possibly with scrim (modal candidates)
   - `focusableElements` — the Tier 1 detection results for cross-reference
3. If not found, proceed with screenshot-only analysis (same as before — no regression).

Use the scan data alongside screenshots throughout Phase 2. The scan gives you structural certainty; the screenshot gives you visual context. Together they are more accurate than either alone.
```

- [ ] **Step 2: Update the Heading Hierarchy section to reference scan data**

Replace the existing Heading Hierarchy guidance with:

```markdown
#### Heading Hierarchy
- Reference: `heading-hierarchy.md` for detection heuristics and rules
- **If scan data exists:** Check the `textNodes` list — already sorted by font size descending. The largest text is your H1 candidate. Use `fontFamily` to distinguish headings (Adobe Clean Display = heading) from body text (Adobe Clean Regular = not a heading). Use `depth` to understand nesting — deeper nodes are more likely lower heading levels.
- **Always cross-reference with the screenshot** — a large decorative text element is not necessarily a heading
- Apply the rules: one H1 per page, never skip levels, logo is NOT H1, eyebrow is NOT a heading
- Card titles are usually one level below the section heading above them
- Output: indented heading tree with level tag + first ~50 chars of text content
```

- [ ] **Step 3: Update the ARIA Roles & Attributes and Keyboard Patterns sections**

Replace the existing ARIA Roles & Attributes guidance with:

```markdown
#### ARIA Roles & Attributes
- Reference: `wcag-patterns.md` for complete ARIA contracts per component type
- **If scan data exists:** Check `repeatingGroups` to identify component patterns:
  - Horizontal group of 3-5 same-sized elements with `hasDistinctChild: true` → likely tabs
  - Horizontal group of small elements (< 20px) → likely pagination dots
  - Large group of tall elements each containing image + text → likely card grid
  - Check `overlays` for modals/dialogs — `coversPercentOfParent > 70` with `hasSemiTransparentSibling: true`
  - Check `pairedStacks` for accordions — `pairCount >= 3`
- Look up the exact roles, states, and properties from the matching pattern in `wcag-patterns.md`
- Include tabindex management strategy (roving tabindex vs standard vs focus trap)
```

Replace the existing Keyboard Patterns guidance with:

```markdown
#### Keyboard Patterns
- Reference: `wcag-patterns.md` for complete keyboard contracts per component type
- **If scan data exists:** Use the same pattern identification from ARIA Roles above, then look up the keyboard contract for that pattern in `wcag-patterns.md`
- List every key and what it does — don't summarize, be specific
- Include the focus model (roving tabindex, focus trap, standard)
```

- [ ] **Step 4: Update the Accessible Names and Alt-Text sections**

Replace the Accessible Names guidance with:

```markdown
#### Accessible Names
- Reference: `accessible-names.md` for naming strategies and context harvesting
- **If scan data exists:** Check `iconFrames` for entries where `hasTextChild: false` — these are icon-only buttons that need `aria-label`. Describe the action, not the icon — "{verb} {object}"
- Check `focusableElements` and cross-reference with `textNodes` — elements near vague text ("Learn more", "See all") need contextual names
- For vague links: harvest context from the nearest heading in `textNodes`
- Provide reusable patterns, not one-off values: "Learn more about + {card title}"
```

Replace the Alt-Text guidance with:

```markdown
#### Alt-Text
- Reference: `accessible-names.md` (Alt-Text section) for rules
- **If scan data exists:** Check `imageNodes`:
  - `isFullBleed: true` → likely decorative background, recommend `alt=""`
  - `isFullBleed: false` → likely content image, needs descriptive alt text
  - `hasTextSibling: true` → likely hero image with text overlay — background is decorative, text is the content
- Use `figma_take_screenshot` on content images (not full-bleed) to write descriptions
- Functional images (icons in buttons): describe the function, not the appearance
```

- [ ] **Step 5: Update DOM Strategy and Screen Reader Notes sections**

Replace DOM Strategy guidance with:

```markdown
#### DOM Strategy
- Reference: `wcag-patterns.md` (DOM strategy notes per component type) and `carousel-a11y.md`
- Only generate if dynamic components detected
- **If scan data exists:** Check `overlays` for modals (need `inert` on background). Check `repeatingGroups` for carousel-like patterns (wide container with few large children). Check `pairedStacks` for accordions (panels can be hidden or removed from DOM).
- Specify: panels in DOM vs lazy-loaded, show/hide method, inert/aria-hidden usage
```

Replace Screen Reader Notes guidance with:

```markdown
#### Screen Reader Notes
- Reference: `screen-reader-notes.md` for platform-specific behaviors
- Only generate if the design contains complex patterns
- **If scan data exists:** Check for `overlays` (modals need focus trap notes for all platforms), `repeatingGroups` matching carousel patterns (swipe gesture conflicts on iOS/Android)
- Standard ARIA patterns (buttons, links, headings) work consistently — no platform note needed
- VoiceOver: announces Name → Role → State
- TalkBack: announces Role → Name → State
- Narrator: heading navigation via H key is heavily used, heading hierarchy must be complete
```

- [ ] **Step 6: Commit**

```bash
git add apps/consonant-specs-plugin/skills/accessibility/blueline.md
git commit -m "feat(a11y): update blueline skill to use structural scan data"
```

---

### Task 7: Build and verify

**Files:**
- No file changes — verification only

- [ ] **Step 1: Full build**

Run: `cd apps/consonant-specs-plugin && node esbuild.config.mjs`
Expected: `Build complete.` with no errors.

- [ ] **Step 2: Type check**

Run: `cd apps/consonant-specs-plugin && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Verify the scan module is included in the bundle**

Run: `grep -c "runStructuralScan" apps/consonant-specs-plugin/dist/code.js`
Expected: At least 1 match (confirming the function is bundled).

- [ ] **Step 4: Verify bundle size is reasonable**

Run: `ls -la apps/consonant-specs-plugin/dist/code.js | awk '{print $5}'`
Expected: The file size — note it for reference. Should not have grown by more than ~15KB from the scan module.

- [ ] **Step 5: Commit built artifacts**

```bash
git add apps/consonant-specs-plugin/dist/
git commit -m "chore: rebuild plugin with structural scan"
```
