# Blueline Panels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Generate Blueline Panels" button that creates Figma Sections with cloned designs and native Figma annotations pinned directly to elements — replacing the card-based approach with visual specs that link annotations to the actual design.

**Architecture:** Extend the existing `generateBluelinePanels()` function in `a11y-blueline.ts` (Approach A). Remove the instructions card, add native Figma annotations + region overlays, fix the layout to a 3-column grid, and add a WCAG footer. The panels flow uses copy-prompt (not auto-fill) — the plugin scaffolds Sections with clones, copies a fill prompt to clipboard, and the user pastes it into their current Claude session.

**Tech Stack:** Figma Plugin API (TypeScript), native `node.annotations` API, MCP server (Zod schemas)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `apps/consonant-specs-plugin/src/ui.html` | Modify | Add "Generate Blueline Panels" button |
| `apps/consonant-specs-plugin/src/ui.ts` | Modify | Add click handler, panels-specific copy-prompt flow |
| `apps/consonant-specs-plugin/src/a11y-blueline.ts` | Modify | Rewrite `generateBluelinePanels()` — remove cards, add 3-col grid, WCAG footer, overlay colors |
| `apps/consonant-specs-plugin/src/code.ts` | Modify | Add `generate-blueline-panels` UI handler, add `RENDER_BLUELINE_PANELS` bridge handler |
| `apps/consonant-specs-plugin/mcp/index.ts` | Modify | Add `mode: "panels"` to `figma_render_blueline` schema, add `nodeId`/`annotationType` per item |

---

### Task 1: Add "Generate Blueline Panels" button to UI

**Files:**
- Modify: `apps/consonant-specs-plugin/src/ui.html:151-153`
- Modify: `apps/consonant-specs-plugin/src/ui.ts:729-758`

- [ ] **Step 1: Add button element in ui.html**

Insert between the "Generate Blueline (Plain Language)" button and "Copy Fill Command" button:

```html
<!-- In ui.html, after line 152 (generateBluelinePlainBtn) -->
<button class="btn" id="generateBluelinePanelsBtn" style="margin-top:4px;">Generate Blueline Panels</button>
```

The full button block becomes:
```html
<button class="btn" id="generateBluelineBtn" style="margin-top:12px;">Generate Blueline</button>
<button class="btn btn-secondary" id="generateBluelinePlainBtn" style="margin-top:4px;">Generate Blueline (Plain Language)</button>
<button class="btn" id="generateBluelinePanelsBtn" style="margin-top:4px;">Generate Blueline Panels</button>
<button class="btn btn-secondary" id="copyFillCmdBtn" style="margin-top:4px;">Copy Fill Command</button>
```

- [ ] **Step 2: Add click handler and panels trigger in ui.ts**

Add a new `triggerBluelinePanels()` function after `triggerBlueline()` (line 749), and wire the button:

```typescript
// After triggerBlueline() at line 749

function triggerBluelinePanels() {
  const pluginAnnotations = getCheckedPluginAnnotations();
  const categories = getCheckedA11yCategories();
  if (pluginAnnotations.length === 0 && categories.length === 0) {
    updateA11yStatus('Select at least one option.');
    return;
  }
  // Run plugin-generated annotations (always, no bridge needed)
  if (pluginAnnotations.length > 0) {
    postToPlugin('generate-plugin-annotations', { annotations: pluginAnnotations });
  }
  // Run AI-assisted categories via panels mode
  if (categories.length > 0) {
    if (!bridgeConnected) { updateA11yStatus('Connect Bridge for AI-assisted categories.'); return; }
    postToPlugin('generate-blueline-panels', { categories });
  } else if (pluginAnnotations.length > 0) {
    updateA11yStatus('Generating annotations...');
  }
}
```

Add the click handler after the existing button handlers (after line 758):

```typescript
// Generate Blueline Panels — scaffold + copy-prompt
document.getElementById('generateBluelinePanelsBtn')?.addEventListener('click', () => triggerBluelinePanels());
```

- [ ] **Step 3: Add panels fill-request handler in ui.ts**

Add a new case in the message handler (near `a11y-fill-request` at line 181) for panels mode:

```typescript
case 'a11y-panels-fill-request':
  showPanelsFillInstruction(msg.sections as string[], msg.frameName as string, msg.sectionIds as string[]);
  break;
```

Add the `showPanelsFillInstruction` function near `showAiFillInstruction` (after line 659):

```typescript
function showPanelsFillInstruction(sections: string[], frameName: string, sectionIds: string[]) {
  const sectionList = sections.join(', ');
  const cmd = `Fill the blueline panels on the current Figma page for "${frameName}". Categories: ${sectionList}. Call figma_get_blueline_data first — it returns structural data and orchestration instructions. Then call figma_get_knowledge for each agent group to fetch expert knowledge. Dispatch parallel agents. Each agent must return items with nodeId and annotationType fields. Then call figma_render_blueline with mode: "panels" and all item JSON.`;
  const el = document.getElementById('a11yStatus');
  if (el) {
    el.innerHTML = `
      <div style="padding:10px;background:var(--bg-secondary,#f5f5f5);border-radius:6px;border-left:3px solid var(--accent,#1473E6);">
        <div style="font-weight:600;font-size:11px;color:var(--accent,#1473E6);margin-bottom:4px;">Panels scaffolded &#x2714;</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">To fill annotations, paste this in your current Claude session:</div>
        <code id="panelsFillCmdText" style="display:block;background:var(--bg,#fff);padding:6px 8px;border-radius:4px;font-size:10px;border:1px solid var(--border,#e5e5e5);line-height:1.4;">${esc(cmd)}</code>
        <button class="btn btn-secondary" id="copyPanelsFillCmd" style="margin-top:6px;padding:4px 8px;font-size:10px;width:100%;">Copy</button>
        <div style="font-size:10px;color:var(--text-tertiary,#999);margin-top:6px;">Paste into your current Claude Code session (Bridge must be connected)</div>
      </div>`;
    document.getElementById('copyPanelsFillCmd')?.addEventListener('click', async () => {
      await copyToClipboard(cmd);
      const btn = document.getElementById('copyPanelsFillCmd');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
    });
  }
}
```

- [ ] **Step 4: Build and verify no TypeScript errors**

Run: `cd apps/consonant-specs-plugin && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 5: Commit**

```bash
git add apps/consonant-specs-plugin/src/ui.html apps/consonant-specs-plugin/src/ui.ts
git commit -m "feat: add Generate Blueline Panels button and copy-prompt UI flow"
```

---

### Task 2: Rewrite generateBluelinePanels() — remove cards, add 3-column grid layout

**Files:**
- Modify: `apps/consonant-specs-plugin/src/a11y-blueline.ts:827-917`

- [ ] **Step 1: Add category overlay color constants**

Add after the existing color constants (after line 25, near `STROKE_COLOR`):

```typescript
// Category overlay colors for panels mode (12% opacity fill, 50% opacity stroke)
const OVERLAY_COLORS: Record<string, { r: number; g: number; b: number }> = {
  landmarks: { r: 0.145, g: 0.388, b: 0.921 },    // #2563eb blue
  ariaRoles: { r: 0.486, g: 0.228, b: 0.929 },     // #7c3aed purple
  aria: { r: 0.486, g: 0.228, b: 0.929 },           // alias
  domStrategy: { r: 0.278, g: 0.333, b: 0.412 },    // #475569 slate
  dom: { r: 0.278, g: 0.333, b: 0.412 },            // alias
  headings: { r: 0.855, g: 0.424, b: 0.106 },       // #da6c1b orange
  names: { r: 0.063, g: 0.157, b: 0.294 },          // navy (matches NAVY_COLOR)
  accessibleNames: { r: 0.063, g: 0.157, b: 0.294 },// alias
  altText: { r: 0.608, g: 0.212, b: 0.208 },        // #9b3635 red
  keyboard: { r: 0.176, g: 0.541, b: 0.431 },       // #2d8a6e teal
  keyboardPatterns: { r: 0.176, g: 0.541, b: 0.431 },// alias
  colorContrast: { r: 0.729, g: 0.192, b: 0.482 },  // #ba317b pink
  forms: { r: 0.467, g: 0.533, b: 0.176 },          // #77882d olive
  targetSize: { r: 0.776, g: 0.608, b: 0.118 },     // #c69b1e gold
};

const PANEL_COLS = 3;
```

- [ ] **Step 2: Rewrite generateBluelinePanels() for 3-column grid, no cards**

Replace the entire `generateBluelinePanels` function (lines 827–917) with:

```typescript
export async function generateBluelinePanels(
  node: SceneNode,
  categories: string[],
): Promise<{ frameId: string; sections: string[]; sectionIds: string[] }> {
  await loadFonts();

  const sourceAbs = node.absoluteBoundingBox;
  if (!sourceAbs) throw new Error('Node has no bounding box');

  const page = figma.currentPage;

  const allPanels: string[] = [...categories];
  if (allPanels.length === 0) throw new Error('Select at least one option');

  // Detect focus order once (reused across panels)
  let focusEntries: FocusOrderEntry[] = [];
  if (categories.includes('focusOrder')) {
    focusEntries = detectFocusOrder(node);
  }

  // 3-column grid layout
  const startX = sourceAbs.x + sourceAbs.width + 200;
  const startY = sourceAbs.y;
  const sectionW = sourceAbs.width + PANEL_PAD * 2;
  const allSections: SceneNode[] = [];
  const sectionIds: string[] = [];

  // Track row heights for grid positioning
  let col = 0;
  let rowY = startY;
  let rowMaxH = 0;

  for (const key of allPanels) {
    const title = CARD_SECTIONS[key] || key;

    // Create Figma Section
    const section = figma.createSection();
    section.name = `A11y ${title}`;

    // Clone the design frame
    const clone = node.clone();
    clone.name = node.name;
    clone.x = PANEL_PAD;
    clone.y = PANEL_PAD;
    section.appendChild(clone);

    // Apply visual annotations to the clone within this section
    if (key === 'focusIndicators') {
      await generateFocusIndicators(clone);
    }
    if (key === 'focusOrder' && focusEntries.length > 0) {
      const cloneEntries = detectFocusOrder(clone);
      const secAbs = section.absoluteBoundingBox;
      const offX = secAbs ? secAbs.x : 0;
      const offY = secAbs ? secAbs.y : 0;
      for (const entry of cloneEntries) {
        const abs = entry.node.absoluteBoundingBox;
        if (!abs) continue;
        const badge = createNumberedBadge(entry.index, 'focusOrder');
        badge.x = abs.x - 4 - offX;
        badge.y = abs.y - BADGE_HEIGHT - 2 - offY;
        section.appendChild(badge);
      }
    }

    // WCAG footer placeholder (filled later by RENDER_BLUELINE_PANELS)
    const footer = figma.createFrame();
    footer.name = 'WCAG Footer';
    footer.layoutMode = 'VERTICAL';
    footer.primaryAxisSizingMode = 'AUTO';
    footer.counterAxisSizingMode = 'FIXED';
    footer.resize(sourceAbs.width, 10);
    footer.fills = [];
    footer.paddingTop = 12;
    footer.paddingBottom = 12;
    footer.paddingLeft = 16;
    footer.paddingRight = 16;
    footer.itemSpacing = 4;
    footer.x = PANEL_PAD;
    footer.y = PANEL_PAD + sourceAbs.height + 20;
    section.appendChild(footer);

    // Resize section to fit clone + footer space
    const sectionH = PANEL_PAD + sourceAbs.height + 20 + 60 + PANEL_PAD;
    section.resizeWithoutConstraints(sectionW, sectionH);

    // Position in 3-column grid
    const panelX = startX + col * (sectionW + PANEL_GAP);
    section.x = panelX;
    section.y = rowY;

    page.appendChild(section);
    allSections.push(section);
    sectionIds.push(section.id);

    if (sectionH > rowMaxH) rowMaxH = sectionH;
    col++;
    if (col >= PANEL_COLS) {
      col = 0;
      rowY += rowMaxH + PANEL_GAP;
      rowMaxH = 0;
    }
  }

  // Embed structural scan data for Claude
  figma.ui.postMessage({ type: 'a11y-status', message: 'Running structural scan...' });
  await embedStructuralScan(node, page);

  // Zoom to show all panels
  figma.viewport.scrollAndZoomIntoView(allSections);

  return { frameId: node.id, sections: categories, sectionIds };
}
```

- [ ] **Step 3: Build and verify no TypeScript errors**

Run: `cd apps/consonant-specs-plugin && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add apps/consonant-specs-plugin/src/a11y-blueline.ts
git commit -m "feat: rewrite generateBluelinePanels — 3-column grid, no cards, WCAG footer placeholder"
```

---

### Task 3: Add generate-blueline-panels handler in code.ts

**Files:**
- Modify: `apps/consonant-specs-plugin/src/code.ts:1340-1366`

- [ ] **Step 1: Add generate-blueline-panels UI message handler**

Add a new case after the `generate-blueline` case (after line 1366):

```typescript
case 'generate-blueline-panels': {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) { figma.notify('Select a frame first'); break; }
  try {
    const categories = Array.isArray(msg.categories) ? (msg.categories as string[]) : [];
    figma.ui.postMessage({ type: 'a11y-status', message: 'Creating blueline panels...' });
    const result = await generateBluelinePanels(sel[0], categories);

    // Panels always use copy-prompt flow
    figma.ui.postMessage({
      type: 'a11y-panels-fill-request',
      sections: result.sections,
      frameName: sel[0].name,
      sectionIds: result.sectionIds,
    });
    figma.notify(`Blueline panels created for "${sel[0].name}"`);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    figma.ui.postMessage({ type: 'a11y-status', message: `Error: ${errorMsg}` });
    figma.notify(`Panels failed: ${errorMsg}`, { error: true });
  }
  break;
}
```

- [ ] **Step 2: Build and verify no TypeScript errors**

Run: `cd apps/consonant-specs-plugin && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add apps/consonant-specs-plugin/src/code.ts
git commit -m "feat: add generate-blueline-panels UI message handler"
```

---

### Task 4: Add RENDER_BLUELINE_PANELS bridge handler in code.ts

**Files:**
- Modify: `apps/consonant-specs-plugin/src/code.ts:891` (after RENDER_BLUELINE case)

- [ ] **Step 1: Add RENDER_BLUELINE_PANELS case**

Add after the `RENDER_BLUELINE` case (after line 891):

```typescript
// ── Render blueline panels — native annotations + region overlays ──
case 'RENDER_BLUELINE_PANELS': {
  const panelsData = params.panels as Record<string, {
    items: Array<{ title: string; desc: string; nodeId: string | null; annotationType: 'element' | 'region' | 'none' }>;
    notes: string[];
    warnings: string[];
  }>;
  if (!panelsData || Object.keys(panelsData).length === 0) throw new Error('panels object is required');

  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  const page = figma.currentPage;

  // Category overlay colors (12% opacity fill, 50% opacity stroke)
  const OVERLAY_COLORS: Record<string, { r: number; g: number; b: number }> = {
    landmarks: { r: 0.145, g: 0.388, b: 0.921 },
    ariaRoles: { r: 0.486, g: 0.228, b: 0.929 },
    aria: { r: 0.486, g: 0.228, b: 0.929 },
    domStrategy: { r: 0.278, g: 0.333, b: 0.412 },
    dom: { r: 0.278, g: 0.333, b: 0.412 },
    headings: { r: 0.855, g: 0.424, b: 0.106 },
    names: { r: 0.063, g: 0.157, b: 0.294 },
    accessibleNames: { r: 0.063, g: 0.157, b: 0.294 },
    altText: { r: 0.608, g: 0.212, b: 0.208 },
    keyboard: { r: 0.176, g: 0.541, b: 0.431 },
    keyboardPatterns: { r: 0.176, g: 0.541, b: 0.431 },
    colorContrast: { r: 0.729, g: 0.192, b: 0.482 },
    forms: { r: 0.467, g: 0.533, b: 0.176 },
    targetSize: { r: 0.776, g: 0.608, b: 0.118 },
  };

  // CARD_SECTIONS key→display name mapping (same as a11y-blueline.ts)
  const CARD_SECTIONS: Record<string, string> = {
    focusIndicators: 'Focus Indicators', focusOrder: 'Focus Order',
    headings: 'Heading Hierarchy', headingHierarchy: 'Heading Hierarchy',
    landmarks: 'Landmarks', names: 'Accessible Names', accessibleNames: 'Accessible Names',
    altText: 'Alt-Text', aria: 'ARIA Roles & Attributes', ariaRoles: 'ARIA Roles & Attributes',
    keyboard: 'Keyboard Patterns', keyboardPatterns: 'Keyboard Patterns',
    dom: 'DOM Strategy', domStrategy: 'DOM Strategy', colorContrast: 'Color Contrast',
    forms: 'Forms', targetSize: 'Target Size', reflow: 'Reflow & Text Spacing',
    language: 'Language', media: 'Time-Based Media', skipNav: 'Skip Navigation',
    pageTitle: 'Page Title', reducedMotion: 'Reduced Motion',
    consistentNav: 'Consistent Navigation', autoRotation: 'Carousel',
  };

  const filledPanels: string[] = [];

  // Find panel Sections by name
  for (const [key, data] of Object.entries(panelsData)) {
    const title = CARD_SECTIONS[key] || key;
    const sectionName = `A11y ${title}`;

    // Find the Section on the current page
    const section = page.findOne(n => n.type === 'SECTION' && n.name === sectionName) as SectionNode | null;
    if (!section) continue;

    // Find the cloned design frame inside the section (first non-footer frame)
    const clone = section.children.find(
      c => c.type === 'FRAME' && c.name !== 'WCAG Footer'
    ) as FrameNode | null;
    if (!clone) continue;

    // Build original nodeId → clone node mapping
    // Walk the clone tree and collect all nodes by name + depth
    const cloneNodeMap = new Map<string, SceneNode>();
    function walkTree(node: SceneNode, depth: number) {
      const mapKey = `${node.name}::${depth}`;
      if (!cloneNodeMap.has(mapKey)) cloneNodeMap.set(mapKey, node);
      if ('children' in node) {
        for (const child of (node as FrameNode).children) {
          walkTree(child, depth + 1);
        }
      }
    }
    walkTree(clone, 0);

    // Also build a flat ID-suffix map: for cloned nodes, Figma preserves layer names
    // We'll try to find nodes by matching name in the clone subtree
    const cloneNodesFlat: SceneNode[] = [];
    function collectNodes(n: SceneNode) {
      cloneNodesFlat.push(n);
      if ('children' in n) {
        for (const child of (n as FrameNode).children) collectNodes(child);
      }
    }
    collectNodes(clone);

    // For each item, place annotation or overlay
    for (const item of data.items) {
      if (item.annotationType === 'none' || !item.nodeId) continue;

      // Find the original node to get its name, then find by name in clone
      const originalNode = await figma.getNodeByIdAsync(item.nodeId);
      if (!originalNode) continue;

      // Find matching node in clone by name
      const targetNode = cloneNodesFlat.find(n => n.name === originalNode.name);
      if (!targetNode) continue;

      if (item.annotationType === 'element') {
        // Native Figma annotation on the clone node
        try {
          (targetNode as any).annotations = [{
            labelMarkdown: `**${item.title}**\n${item.desc}`,
          }];
        } catch (e) {
          console.warn(`Annotation failed on "${item.title}":`, e);
        }
      } else if (item.annotationType === 'region') {
        // Semi-transparent overlay rectangle + annotation on the overlay
        const abs = targetNode.absoluteBoundingBox;
        const secAbs = section.absoluteBoundingBox;
        if (!abs || !secAbs) continue;

        const overlayColor = OVERLAY_COLORS[key] || { r: 0.145, g: 0.388, b: 0.921 };
        const overlay = figma.createRectangle();
        overlay.name = `Overlay: ${item.title}`;
        overlay.resize(abs.width, abs.height);
        overlay.x = abs.x - secAbs.x;
        overlay.y = abs.y - secAbs.y;
        overlay.fills = [{ type: 'SOLID', color: overlayColor, opacity: 0.12 }];
        overlay.strokes = [{ type: 'SOLID', color: overlayColor, opacity: 0.5 }];
        overlay.strokeWeight = 2;
        section.appendChild(overlay);

        // Pin annotation on the overlay
        try {
          (overlay as any).annotations = [{
            labelMarkdown: `**${item.title}**\n${item.desc}`,
          }];
        } catch (e) {
          console.warn(`Overlay annotation failed on "${item.title}":`, e);
        }
      }
    }

    // Fill WCAG footer with notes
    const footer = section.findOne(n => n.name === 'WCAG Footer') as FrameNode | null;
    if (footer && data.notes && data.notes.length > 0) {
      for (const note of data.notes) {
        const t = figma.createText();
        t.characters = note;
        t.fontName = { family: 'Inter', style: 'Regular' };
        t.fontSize = 10;
        t.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.4, b: 0.7 } }];
        t.textAutoResize = 'HEIGHT';
        t.resize(footer.width - 32, t.height);
        footer.appendChild(t);
        t.layoutSizingHorizontal = 'FILL';
      }
    }

    // Add warnings to footer
    if (footer && data.warnings && data.warnings.length > 0) {
      for (const warn of data.warnings) {
        const t = figma.createText();
        t.characters = warn;
        t.fontName = { family: 'Inter', style: 'Semi Bold' };
        t.fontSize = 10;
        t.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.35, b: 0 } }];
        t.textAutoResize = 'HEIGHT';
        t.resize(footer.width - 32, t.height);
        footer.appendChild(t);
        t.layoutSizingHorizontal = 'FILL';
      }
    }

    filledPanels.push(sectionName);
  }

  return { rendered: true, filledPanels };
}
```

- [ ] **Step 2: Build and verify no TypeScript errors**

Run: `cd apps/consonant-specs-plugin && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add apps/consonant-specs-plugin/src/code.ts
git commit -m "feat: add RENDER_BLUELINE_PANELS handler — native annotations + region overlays"
```

---

### Task 5: Update MCP tool schema for panels mode

**Files:**
- Modify: `apps/consonant-specs-plugin/mcp/index.ts:737-759`

- [ ] **Step 1: Add mode parameter and extended item schema to figma_render_blueline**

Replace the `figma_render_blueline` tool definition (lines 737–759) with:

```typescript
server.tool(
  'figma_render_blueline',
  'Render all blueline content in one call. In flat mode (default): fills all cards and optionally creates focus annotations. In panels mode: places native Figma annotations and region overlays on cloned designs.',
  {
    mode: z.enum(['flat', 'panels']).default('flat').describe('Rendering mode: "flat" fills card frames (default), "panels" places native annotations on cloned designs'),
    nodeId: z.string().optional().describe('Target frame node ID (for focus annotations in flat mode). Uses current selection if omitted.'),
    cards: z.record(z.string(), z.object({
      items: z.array(z.object({
        title: z.string().describe('Bold black title'),
        desc: z.string().describe('Gray description text'),
        nodeId: z.string().nullable().optional().describe('(panels mode) Node ID of the element this item refers to in the original design. Null for abstract/page-level items.'),
        annotationType: z.enum(['element', 'region', 'none']).optional().describe('(panels mode) How to visualize: "element" = native annotation on node, "region" = colored overlay + annotation, "none" = WCAG footer only'),
      })),
      notes: z.array(z.string()).optional().describe('WCAG notes (blue)'),
      warnings: z.array(z.string()).optional().describe('Warnings (orange)'),
    })).describe('Map of category key → card content. Keys match card names (e.g. "headingHierarchy", "landmarks", "altText")'),
    focusOrder: z.array(z.object({
      nodeId: z.string().describe('Node ID of the interactive element'),
      name: z.string().describe('Accessible name for this element'),
    })).optional().describe('Focus order entries — creates sidebar, badges, and focus rectangles (flat mode only)'),
  },
  async ({ mode, nodeId, cards, focusOrder }) => {
    if (mode === 'panels') {
      // Transform cards into panels format for RENDER_BLUELINE_PANELS
      const panels: Record<string, { items: Array<{ title: string; desc: string; nodeId: string | null; annotationType: 'element' | 'region' | 'none' }>; notes: string[]; warnings: string[] }> = {};
      for (const [key, data] of Object.entries(cards)) {
        panels[key] = {
          items: data.items.map(item => ({
            title: item.title,
            desc: item.desc,
            nodeId: item.nodeId ?? null,
            annotationType: item.annotationType ?? 'none',
          })),
          notes: data.notes || [],
          warnings: data.warnings || [],
        };
      }
      const result = await sendCommand('RENDER_BLUELINE_PANELS', { panels }, 60000);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    // Default: flat mode
    const result = await sendCommand('RENDER_BLUELINE', { nodeId, cards, focusOrder }, 60000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);
```

- [ ] **Step 2: Build and verify no TypeScript errors**

Run: `cd apps/consonant-specs-plugin && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add apps/consonant-specs-plugin/mcp/index.ts
git commit -m "feat: add panels mode to figma_render_blueline MCP tool schema"
```

---

### Task 6: Update agent fill prompt to request nodeId + annotationType

**Files:**
- Modify: `apps/consonant-specs-plugin/src/ui.ts` (the `showPanelsFillInstruction` function from Task 1)

- [ ] **Step 1: Refine the panels fill prompt**

Update the `cmd` string in `showPanelsFillInstruction` to explicitly instruct agents to return nodeId and annotationType:

```typescript
function showPanelsFillInstruction(sections: string[], frameName: string, sectionIds: string[]) {
  const sectionList = sections.join(', ');
  const cmd = `Fill the blueline panels on the current Figma page for "${frameName}". Categories: ${sectionList}.

Call figma_get_blueline_data first — it returns structural data (including nodeIds for all elements) and orchestration instructions. Then call figma_get_knowledge for each agent group to fetch expert knowledge.

Dispatch parallel agents. IMPORTANT: Each agent must return items with these additional fields:
- nodeId (string|null): the node ID from the structural scan that this item refers to. Null if no element match.
- annotationType ("element"|"region"|"none"): "element" for specific UI elements (buttons, links, inputs), "region" for area-level concepts (landmarks, sections), "none" for abstract/page-level items.

Then call figma_render_blueline with mode: "panels" and all item JSON. The panels have already been scaffolded with cloned designs — the render call will place native Figma annotations on the clones.`;

  const el = document.getElementById('a11yStatus');
  if (el) {
    el.innerHTML = `
      <div style="padding:10px;background:var(--bg-secondary,#f5f5f5);border-radius:6px;border-left:3px solid var(--accent,#1473E6);">
        <div style="font-weight:600;font-size:11px;color:var(--accent,#1473E6);margin-bottom:4px;">Panels scaffolded &#x2714;</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">To fill annotations, paste this in your current Claude session:</div>
        <code id="panelsFillCmdText" style="display:block;background:var(--bg,#fff);padding:6px 8px;border-radius:4px;font-size:10px;border:1px solid var(--border,#e5e5e5);line-height:1.4;white-space:pre-wrap;">${esc(cmd)}</code>
        <button class="btn btn-secondary" id="copyPanelsFillCmd" style="margin-top:6px;padding:4px 8px;font-size:10px;width:100%;">Copy</button>
        <div style="font-size:10px;color:var(--text-tertiary,#999);margin-top:6px;">Paste into your current Claude Code session (Bridge must be connected)</div>
      </div>`;
    document.getElementById('copyPanelsFillCmd')?.addEventListener('click', async () => {
      await copyToClipboard(cmd);
      const btn = document.getElementById('copyPanelsFillCmd');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
    });
  }
}
```

Note: This replaces the simpler version from Task 1 Step 3. The key change is the detailed instructions about nodeId and annotationType fields in the prompt.

- [ ] **Step 2: Build and verify**

Run: `cd apps/consonant-specs-plugin && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add apps/consonant-specs-plugin/src/ui.ts
git commit -m "feat: refine panels fill prompt with nodeId + annotationType instructions"
```

---

### Task 7: Full build, manual test, and final commit

**Files:**
- All modified files

- [ ] **Step 1: Full build**

Run: `cd apps/consonant-specs-plugin && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Verify dist files updated**

Run: `ls -la apps/consonant-specs-plugin/dist/`
Expected: `code.js`, `ui-bundle.js`, `ui.html` all have recent timestamps

- [ ] **Step 3: Manual test in Figma**

1. Open the plugin in Figma
2. Select a frame
3. Check some categories in the A11y tab
4. Click "Generate Blueline Panels"
5. Verify: Sections created in 3-column grid, each with cloned design
6. Verify: Copy-prompt appears in the status area
7. Verify: Existing "Generate Blueline" and "Generate Blueline (Plain Language)" buttons still work unchanged

- [ ] **Step 4: Test panels fill via Claude**

1. Copy the prompt from the plugin UI
2. Paste into current Claude session
3. Verify: Claude calls `figma_render_blueline` with `mode: "panels"`
4. Verify: Native annotations appear on cloned design nodes
5. Verify: Region overlays appear with colored rectangles
6. Verify: WCAG footer text appears below each clone

- [ ] **Step 5: Final commit (if any fixups needed)**

```bash
git add -A
git commit -m "fix: blueline panels post-test fixes"
```
