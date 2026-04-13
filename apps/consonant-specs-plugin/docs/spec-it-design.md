# "Spec it" Feature — Design Specification

## Overview

The "Spec it" button in the Specs tab generates a comprehensive design specification as Figma layers placed next to the selected frame. It produces a full documentation package covering anatomy, layout & spacing, typography, component details, and S2A token references.

## Reference Designs

Both reference designs live in the `mcp-workshop` Figma file (`I2Q0fPnIj2ATbd6pbb9bx1`):

- **Detailed redline style** — node `56:39138` ("Spectral" frame on the "actions" page)
- **Anatomy + opacity highlight style** — node `60:39208` ("Specs" frame on the "actions" page)

## What "Spec it" Generates

When the user selects a frame and clicks "Spec it", the plugin creates a `[Spec] {NodeName}` frame placed to the right of the selected node. This frame contains the following sections stacked vertically:

### Section 1: Name Header

- Large bold title showing the component/frame name
- Example: "Section - What's New"

### Section 2: Anatomy

**Left side:** The design rendered with numbered orange circle callouts (1, 2, 3...) pointing to each significant element — frames, text nodes, images, component instances, vectors.

**Right side:** A property table listing each numbered element with:
- Numbered badge matching the callout
- Node name (bold) with type icon (frame icon, text icon, image icon, component icon, vector icon)
- Width and height
- Text color + hex code
- Text style (S2A typography token if matched, e.g., `s2a/typography/title-4`)
- Text align
- Font family, font weight, font size, letter spacing, line height (for text nodes)
- Background color + hex code
- Border radius
- Aspect ratio (for images/assets)
- Layer size (for images)
- Dependencies — "Depends on: ComponentName" (for component instances)

**Visual style from reference (`60:42294`):**
- Orange (#E87A2E) numbered circle badges on the design
- Dashed leader lines from badge to element
- Clean property table on the right with clear hierarchy
- Properties grouped per element with element name as header

### Section 3: Layout and Spacing

For EACH node in the tree (recursive drill-down), creates an "Exhibit" frame containing:

**Left side:** The design rendered with:
- **Opacity overlays** highlighting the selected child's area:
  - Green semi-transparent overlay on padding zones
  - Blue/light overlay on the content area
  - Orange highlight on the specific child being described
- **Red measurement labels** showing pixel values for padding, margins, gaps
- Dashed blue lines showing width constraints (e.g., fill vs fixed)
- Auto-layout direction indicator icon

**Right side:** Property panel showing:
- Node name (bold)
- Direction: Vertical / Horizontal
- Alignment: Top center / Middle center / etc.
- Vertical resizing: Hug / Fixed / Fill
- Horizontal resizing: Hug / Fixed / Fill
- Item spacing: value (with S2A token name if matched, e.g., `s2a/spacing/4xl 64`)
- Padding top / right / bottom / left (with S2A tokens)
- Gap (with S2A token)

**Recursive structure:** The "Layout and spacing" section contains a vertical stack of Exhibits. The first Exhibit shows the top-level frame. Then each direct child that is itself a frame/auto-layout gets its own Exhibit, drilling down recursively. Each Exhibit is indented or nested to show hierarchy.

**Visual style from reference (`60:39300`):**
- Green (#8BC34A-ish, semi-transparent) overlays on padding areas
- Orange/salmon semi-transparent overlays on specific child areas
- Blue dashed measurement lines for widths
- Red label badges with pixel values
- Property panel text is clean, left-aligned key-value pairs

### Section 4: Typography Summary (if applicable)

Table of all unique text styles used in the frame:
- Style name / S2A token
- Font family
- Font size
- Font weight
- Line height
- Letter spacing
- Where used (list of node names)

### Section 5: Component Details (if applicable)

For each component instance found in the tree:
- Component name
- Component set (if part of a set)
- Current variant properties and values
- All available variants listed
- Instance overrides (properties that differ from the main component)
- Nested component instances
- Link to main component (node ID)

## S2A Token Integration

All values should show S2A token names where matched:
- Spacing values → `s2a/spacing/xl`, `s2a/spacing/4xl`, etc.
- Colors → `s2a/color/background/default`, etc.
- Typography → `s2a/typography/body-lg`, `s2a/typography/title-4`, etc.
- Border radius → `s2a/border-radius/md`, etc.

When no token match exists, raw px/hex values are shown.

## Canvas Output Structure

```
[Spec] {NodeName}
├── Name (text header)
├── Anatomy
│   ├── Annotated design (clone with numbered callouts)
│   └── Property table (frame with text rows)
├── Layout and spacing
│   ├── Title text
│   └── Selected node
│       ├── Title (node name)
│       └── Exhibits
│           ├── Exhibit (top-level — opacity overlay + property panel)
│           ├── Exhibit (child 1 — opacity overlay + property panel)
│           ├── Exhibit (child 2 — ...)
│           └── ... (recursive)
├── Typography Summary
└── Component Details
```

## Implementation Notes

### Key Figma API methods needed:
- `node.clone()` — clone the design for annotation overlays
- `figma.createFrame()` — create containers, exhibits
- `figma.createText()` — labels, property values
- `figma.createRectangle()` — overlays, measurement lines, badges
- `figma.createEllipse()` — numbered callout circles
- `node.children` — recursive traversal
- `node.componentProperties` — instance properties
- `node.mainComponent` — link to component definition
- `node.variantProperties` — variant data
- `figma.loadFontAsync()` — must load Inter before creating text

### Overlay technique:
- Clone the target frame
- For each Exhibit, clone again and overlay semi-transparent rectangles on padding zones and child areas
- Use `opacity` property on overlay rectangles (0.15-0.25 range)
- Green for padding, orange/salmon for highlighted child, blue for content

### Performance considerations:
- Deep component trees can have hundreds of nodes — limit recursion depth (configurable, default 5)
- Each Exhibit clones the design — for very large frames, consider using screenshots instead of clones
- Font loading should be done once at the start, not per-element
- Batch operations where possible

## Existing Code to Build On

The plugin already has:
- `src/utils.ts` — node inspection helpers (getBoundingBox, getNodeFills, getTextProps, getAutoLayoutProps, etc.)
- `src/tokens.ts` — S2A token matching (matchColor, matchSpacing, matchRadius, matchTypography)
- `src/annotations.ts` — property collection (collectProperties, createPropertyCard)
- `src/scanner.ts` — recursive node scanning (scanNode, countWarnings)
- `src/measures.ts` — measurement line drawing (createLine, createLabel, getOrCreateContainer)

The "Spec it" feature should create a new module `src/spec-it.ts` that imports from these existing modules.

## Files to Create/Modify

- Create: `src/spec-it.ts` — main spec generation logic
- Create: `src/spec-anatomy.ts` — anatomy section (callouts + property table)
- Create: `src/spec-layout.ts` — layout & spacing section (exhibits with overlays)
- Create: `src/spec-typography.ts` — typography summary table
- Create: `src/spec-components.ts` — component details section
- Modify: `src/code.ts` — wire up the 'spec-it' message handler

## How to Start a New Session

Tell Claude:

> I'm working on the Consonant Specs Figma plugin at `/Users/taehoc/Desktop/consonant-specs`. Read `docs/spec-it-design.md` for the full spec of the "Spec it" feature that needs to be implemented. Also read the existing source files in `src/` to understand the current codebase. The plugin is a standalone Figma plugin (not in the Consonant monorepo) with TypeScript + esbuild. The design spec and implementation plan for the overall plugin are at `/Users/taehoc/Desktop/vscode-git/consonant/docs/superpowers/specs/2026-04-07-consonant-specs-plugin-design.md`.
