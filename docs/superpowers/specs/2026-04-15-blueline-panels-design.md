# Blueline Panels — Design Spec

**Date:** 2026-04-15
**Status:** Draft
**Scope:** consonant-specs-plugin (A11y tab)

---

## Problem

The current blueline output is a flat grid of cards. Each card lists accessibility items (e.g., "banner", "main", "Play/Pause button") but there's no visual link between those items and the actual design. A designer or engineer reading "banner" has to guess which part of the design it refers to.

## Solution

A new **"Generate Blueline Panels"** button that creates one Figma Section per checked category. Each Section contains a **clone of the design** with **native Figma annotations** pinned directly to the elements they describe. No cards — the annotations ARE the spec.

---

## UI Change

### Button placement (A11y tab)

```
1. Generate Blueline              (existing)
2. Generate Blueline (Plain Language) (existing)
3. Generate Blueline Panels       (NEW)
4. Copy Fill Command              (existing, debug fallback)
```

Button 3 is a primary `.btn` style. It triggers the panels flow for all checked categories (both AI-assisted and Plugin-generated sections).

### Fill mode: Copy Prompt (no auto-fill)

Panels mode uses a **copy-prompt** flow, not auto-fill:

1. User clicks "Generate Blueline Panels"
2. Plugin creates Sections with cloned designs (scaffold only — no annotations yet)
3. Plugin copies a fill prompt to the clipboard
4. User pastes the prompt into their current Claude session
5. Claude calls `figma_render_blueline` with `mode: "panels"` and `nodeId` + `annotationType` per item
6. Annotations get pinned to the cloned elements

This avoids changes to the `claude -p` auto-fill pipeline. The user stays in their current session where they can iterate and debug.

---

## Panel Architecture

### What gets generated

For each checked category, one Figma **Section** containing:

1. **Cloned design** — full clone of the selected frame via `node.clone()`
2. **Native Figma annotations** — `node.annotations = [{ labelMarkdown }]` pinned to specific elements on the clone
3. **Region overlays** — semi-transparent colored rectangles for area-level concepts (landmarks, regions)
4. **WCAG footer** — small text frame below the clone with SC references

No cards. No instructions panel. The annotation pinned to the element is the spec.

### Annotation types by item

| Item type | Example | Visual treatment |
|---|---|---|
| **Element-level** | "Learn more CTA", "Play/Pause button" | Native Figma annotation pinned to the node |
| **Region-level** | "banner", "main", "Hero region" | Semi-transparent colored overlay + Figma annotation on the overlay |
| **Abstract / page-level** | "Page title", "HTML lang", "No forms detected" | No visual on clone. WCAG footer text only. |

### Category colors for region overlays

Each category gets a distinct overlay color so regions are distinguishable even outside their panel:

| Category | Overlay color | Usage |
|---|---|---|
| landmarks | Blue (#2563eb at 12% opacity) | Landmark regions |
| ariaRoles | Purple (#7c3aed at 12% opacity) | ARIA role regions |
| domStrategy | Slate (#475569 at 12% opacity) | DOM structure regions |
| Other categories | Category-specific from existing `CATEGORY_BADGE` config | As needed |

Element-level annotations don't need overlays — the Figma annotation pin is sufficient.

### Layout

Panels arranged in a **3-column grid**:

```
[Panel 1]  [Panel 2]  [Panel 3]
[Panel 4]  [Panel 5]  [Panel 6]
...
```

- Grid starts to the right of the source frame (200px gap)
- Column width = clone width + 2 * PANEL_PAD
- Row height = max panel height in that row + PANEL_GAP
- PANEL_GAP between panels: 100px

---

## Agent Changes

### New fields in agent output

Each agent currently returns card items as:
```json
{ "title": "banner", "desc": "role=banner — site header" }
```

For panels mode, agents must also return:
```json
{
  "title": "banner",
  "desc": "role=banner — site header",
  "nodeId": "103:73XXX",
  "annotationType": "region"
}
```

New fields:
- **`nodeId`** (string | null) — ID of the element in the original design this item refers to. Null for abstract/page-level items.
- **`annotationType`** ("element" | "region" | "none") — how to visualize this item on the clone.

### How agents get nodeIds

The structural scan data already includes nodeIds for focusable elements, image nodes, icon frames, repeating groups, and overlays. Agent prompts must include these IDs so agents can map items to specific nodes.

For region-level items (landmarks), agents identify the best-fit node from the scan:
- "banner" → topmost frame containing nav elements
- "main" → parent frame of the hero content
- "navigation" → the nav bar frame

If no confident match exists, `nodeId` is null and `annotationType` is "none".

### Mapping original nodeIds to clone nodes

Agents return nodeIds from the **original** design (from the structural scan). When placing annotations on the **clone**, we need to find the corresponding node. Strategy:

1. Before cloning, build a map of `originalNodeId → node.name + depth` for all relevant nodes
2. After cloning, walk the clone tree and match by name + depth to find the corresponding clone node
3. Alternatively, use Figma's clone behavior: cloned nodes preserve their layer names and structure. Walk both trees in parallel to build an `originalId → cloneNode` mapping

This mapping is done once per panel inside `generateBluelinePanels()`.

### Backward compatibility

The `nodeId` and `annotationType` fields are optional. The flat card flow (`Generate Blueline` buttons 1 and 2) continues to work unchanged — it ignores these fields. Only the panels flow uses them.

---

## Plugin Code Changes

### File: `a11y-blueline.ts`

Extend `generateBluelinePanels()` (line 827):

1. **Remove** the `createInstructionsCard()` call — no cards in panels
2. **Add** annotation placement loop: for each item with a nodeId, find the corresponding node in the clone and set `node.annotations`
3. **Add** region overlay creation: for items with `annotationType: "region"`, create a semi-transparent rectangle matching the node's bounds, then pin an annotation to the overlay
4. **Add** WCAG footer: create a small text frame below the clone with the notes array joined as text
5. **Fix** grid layout: track column/row position, wrap after 3 columns

### File: `code.ts`

Add a new message handler case for panels mode. The existing `GENERATE_BLUELINE` case calls `generateBlueline()` (flat cards). Add:

```
case 'GENERATE_BLUELINE_PANELS': {
  // calls generateBluelinePanels() with annotation data
}
```

Or extend the existing `RENDER_BLUELINE` handler to accept a `mode: "panels"` parameter.

### File: `ui.ts`

1. Add click handler for the new button
2. Sends message through the same flow as existing blueline buttons
3. Passes `mode: 'panels'` flag so the plugin knows to use `generateBluelinePanels`

### File: `ui.html`

Add the button element between buttons 2 and 3.

### File: `mcp/index.ts`

Update the auto-fill prompt to instruct Claude to return `nodeId` and `annotationType` per item when panels mode is requested. The MCP `figma_render_blueline` tool schema gains an optional `mode: "panels"` parameter.

---

## Annotation Format

Using native Figma annotations API:

```typescript
cloneNode.annotations = [{
  labelMarkdown: `**banner**\nrole=banner — site header (logo + nav + sign in)`
}];
```

For region overlays, the annotation goes on the overlay rectangle, not the clone node:

```typescript
const overlay = figma.createRectangle();
overlay.fills = [{ type: 'SOLID', color: { r: 0.145, g: 0.388, b: 0.921 }, opacity: 0.12 }];
overlay.strokes = [{ type: 'SOLID', color: { r: 0.145, g: 0.388, b: 0.921 }, opacity: 0.5 }];
overlay.strokeWeight = 2;
// size and position to match the region node's bounds
overlay.annotations = [{
  labelMarkdown: `**banner**\nrole=banner — site header`
}];
```

---

## Data Flow

```
User checks categories → clicks "Generate Blueline Panels"
  → ui.ts sends 'generate-blueline' with mode: 'panels'
  → code.ts calls generateBluelinePanels(node, categories)
     → For each category:
        1. Create Figma Section
        2. Clone design into Section
        3. (annotations placed later by user-pasted prompt)
     → Return section IDs + structural scan
  → Plugin copies fill prompt to clipboard
  → User pastes prompt into current Claude session
  → Claude calls figma_get_blueline_data, figma_get_knowledge (same as flat mode)
  → Claude dispatches parallel agents (same architecture)
     → Each agent returns items with nodeId + annotationType
  → Claude calls figma_render_blueline with mode: 'panels'
     → code.ts RENDER_BLUELINE handler:
        For each item:
        - annotationType "element": find node in clone, set .annotations
        - annotationType "region": create overlay rect, set .annotations on overlay
        - annotationType "none": skip (goes in WCAG footer only)
        Create WCAG footer text frame per panel
```

---

## What stays the same

- Buttons 1 and 2 (flat card grid) — unchanged
- Button 4 (Copy Fill Command) — unchanged
- AI agent architecture (10 parallel agents) — same, just richer output
- Knowledge files and structural scan — unchanged
- Auto-fill via `claude -p` — works for both flat and panels mode

---

## Open questions (resolved)

| Question | Decision |
|---|---|
| Badge vs annotation? | Native Figma annotations (user preference) |
| Keep cards in panels? | No — annotations on clone are the spec |
| All categories or checked only? | Checked only |
| Layout? | 3-column grid |
| Region visualization? | Semi-transparent colored overlay + annotation |
| Items with no element match? | No visual — WCAG footer only |
| Category colors? | Different color per category |
