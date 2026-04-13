# Spec-it Output Redesign — Design Specification

## Overview

Redesign the full Spec-it output to match the reference designs in Figma file `I2Q0fPnIj2ATbd6pbb9bx1`:
- **60:39208 ("Specs")** — Anatomy section: type-driven property cards, marker system, token pills, type icons, progressive disclosure
- **56:31860 ("Spectral")** — Layout & Spacing section: 3-column layout with layer tree left rail, color-coded overlays, S2A token badges

This spec covers the complete Spec-it output: Name Header, Anatomy, Layout & Spacing, Typography Summary, and Component Details. Sections 4 and 5 (Typography, Component Details) are already implemented and stay as-is. Sections 1-3 get redesigned.

## Design Principles (from reference study)

1. **Type-driven property selection** — show different properties per node type. Never dump all properties.
2. **Token-aware progressive disclosure** — if a token exists, show the token in a pill and skip raw values. If no token, show the full breakdown.
3. **1:1 clone, no scaling** — artwork is always full-size.
4. **Completeness over brevity** — document every element, even repeated patterns.
5. **Color-coded visual language** — blue = element bounds/children, pink = inner/padding areas, orange = raw px values, magenta = S2A token values.
6. **Consistent card format** — type icon + bold name + property rows. Same format across all sections.
7. **One exhibit per frame** — layout section creates a separate exhibit for every auto-layout frame in the tree.

## Global Constants

```
// Section layout
SECTION_TITLE_SIZE = 48        // Inter Bold
SECTION_PADDING = 64           // all sides
SECTION_GAP = 64               // between children within a section
EXHIBIT_GAP = 64               // between left/center/right columns

// Marker system (anatomy)
MARKER_COLOR = #C54500         // burnt orange — dots and connecting lines
DOT_SIZE = 24                  // numbered circle
DOT_FONT_SIZE = 12             // Inter Bold, white

// Cards
CARD_GAP = 24                  // between cards in right rail
ROW_GAP = 4                    // between attribute rows
HEADER_GAP = 6                 // between type icon and name in card header
HEADER_FONT_SIZE = 16          // Inter Bold, black
PROP_FONT_SIZE = 12            // Inter Regular, black
LABEL_WIDTH = 144              // fixed width for property labels
ICON_SIZE = 20                 // type icon container
ICON_COLOR = #6B6B6B           // gray stroke for type icons

// Token pills
TOKEN_PILL_BG = #F2F2F2        // light gray background
TOKEN_PILL_TEXT = #851F41       // dark maroon text
TOKEN_PILL_RADIUS = 4          // corner radius
TOKEN_PILL_PADDING = 2px 5px   // vertical/horizontal

// Content areas
CONTENT_BG = #F2F2F2           // card content area background
CONTENT_RADIUS = 12            // corner radius for content areas

// Layout overlay colors
OVERLAY_OUTER = #0D69D4 @ 20%  // blue — child element bounds
OVERLAY_INNER = #E8A0BF @ 25%  // pink — padding/inner areas
OVERLAY_OUTLINE = #D42B2B      // red — element outline (dashed)
LABEL_PX_BG = #C54500          // orange — raw pixel value badges
LABEL_PX_TEXT = #FFFFFF         // white text on orange
LABEL_TOKEN_BG = #D946A8       // magenta — S2A token badges
LABEL_TOKEN_TEXT = #FFFFFF      // white text on magenta

// Layer tree (left rail)
TREE_WIDTH = 280               // left rail width
TREE_FONT_SIZE = 12            // Inter Regular for node names
TREE_FONT_BOLD = Inter Bold    // for highlighted/current node
TREE_LINE_COLOR = #C0C0C0      // tree connector lines
```

---

## Section 1: Name Header

No changes. Large bold title showing the frame name. Stays as-is.

---

## Section 2: Anatomy

### Purpose

Answers: "What are the visual building blocks?" Catalogs every significant element by its appearance — colors, fonts, tokens, effects. A developer looks at this to know what each piece IS.

### Layout

```
Anatomy (Inter Bold 48px)
└── Exhibit (horizontal, 64px gap)
    ├── Left: Artwork (1:1 clone, no scaling)
    │   ├── Full clone of source node
    │   └── Markers: connecting line + numbered dot per element
    └── Right: Content rail (~400px, vertical, 24px gap)
        ├── Card 1
        ├── Card 2
        └── ... (one card per significant descendant)
```

### Marker system

Each significant element in the artwork gets:
1. **Numbered dot** — 24x24 frame, cornerRadius 12, fill `#C54500`, white Inter Bold 12px number centered
2. **Connecting line** — 1px rectangle, fill `#C54500`, from the dot to the element's position on the artwork. Horizontal or vertical depending on element position relative to the right edge.

Dots appear on the artwork, positioned near the top-left of each element. Lines extend from the dot rightward to connect visually with the corresponding card in the right rail.

### Card structure

Every card, regardless of node type:

```
Card (vertical)
├── Header (horizontal, 6px gap)
│   ├── Type icon (20x20, #6B6B6B stroke)
│   └── Element name (Inter Bold 16px, black)
├── Content area (bg #F2F2F2, cornerRadius 12, padding 2px)
│   ├── [Optional: text preview rendered at actual font/size]
│   └── Attributes (vertical, 4px gap, padding 20px horizontal)
│       ├── Row: label (Inter Regular 12px, fixed 144px) | value
│       └── ...
└── Dot (24x24 circle, #C54500, white bold number)
```

### Type icons

20x20 containers with 16px vector representations:
- **FRAME** → `⊞` crosshatch/grid
- **TEXT** → `T`
- **INSTANCE** → `◈` diamond
- **VECTOR** → `∿` wavy line
- **RECTANGLE** → `□`
- **GROUP** → `⊟`

### Property selection by node type

**FRAME (container):**
- Width, Height
- Background color (hex, with token pill if matched)
- Border radius (with token pill if matched)
- Aspect ratio (for image containers — when name contains "image", "asset", or node has image fills)
- Layer blur / effects (if any)

**TEXT (with S2A text style token bound):**
- Text color (hex + opacity if < 100%)
- Text align
- Text style → token pill (e.g., `s2a/typography/eyebrow`)

**TEXT (no token bound):**
- Width (if differs from parent)
- Text color (hex + opacity if < 100%)
- Text align
- Font family
- Font weight
- Font size
- Letter spacing
- Line height

**INSTANCE:**
- "Depends on:" → component name in **bold**

**VECTOR:**
- Height, Width
- Border color (hex)
- Stroke alignment
- Border weight
- Aspect ratio

**RECTANGLE:**
- Height, Width
- Background color (hex)

### Value display treatments

| Value type | Treatment |
|---|---|
| Plain number/text | Inter Regular 12px, black |
| Hex color | `#FFFFFF` plain text, with color swatch if useful |
| Color with opacity | `#000000, 64%` |
| S2A token reference | Pill: bg `#F2F2F2`, text `#851F41`, cornerRadius 4, padding 2/5 |
| Component dependency | Inter **Bold** 12px |

### Element collection (deduplicated)

Walk the source node tree recursively (max depth 4). Collect every descendant that is a FRAME, TEXT, INSTANCE, VECTOR, RECTANGLE, ELLIPSE, or GROUP. **Deduplicate by name + type** — if multiple nodes share the same name and type, only show the first occurrence. This avoids repeating the same Headline/CTA/Asset card for each column when the design uses repeated patterns.

Skip nodes that are purely structural with no visual significance (empty frames with no fills/strokes).

---

## Section 3: Layout & Spacing

### Purpose

Answers: "How do these building blocks fit together?" Shows the structural relationship between frames — direction, alignment, gaps, padding. A developer looks at this to know HOW to arrange elements.

### Layout (per exhibit)

```
Layout and spacing (Inter Bold 48px)
└── Exhibits (vertical, 40px gap)
    ├── Exhibit 1 (horizontal, 64px gap)
    │   ├── Left rail: Layer tree (280px)
    │   ├── Center: Artwork with overlays (1:1 clone)
    │   └── Right rail: Property card (~400px)
    ├── Exhibit 2
    └── ... (one exhibit per auto-layout frame in tree)
```

### Left rail: Layer tree

A visual representation of the source node's hierarchy, showing where the current exhibit's node sits in context.

```
Section - What's New          ← root, always shown
├── Section Heading           ← gray text
│   ├── Copy                  ← gray text
│   └── Buttons               ← gray text
├── Full Column               ← gray text
│   ├── Asset                 ← gray text
│   │   ├── image
│   │   ├── B_app_AdobeFirefly
│   │   └── image
│   ├── Copy
│   │   ├── Headline + Body
│   │   └── CTA
│   └── ...
└── 3 Column
    ├── Column
    │   └── ...
    └── Column
```

- Root node name: Inter Bold, `TREE_FONT_SIZE`
- Current node (the one this exhibit describes): **Inter Bold**, black
- Other nodes: Inter Regular, light gray (#B0B0B0)
- Tree connector lines: thin lines (├── └── │) drawn with small rectangles or text characters, `TREE_LINE_COLOR`
- The tree is the SAME structure for every exhibit, but with a DIFFERENT node bolded each time

### Center: Artwork with overlays

Full 1:1 clone of the source node with color-coded overlays for the current exhibit's target frame:

**Overlay layers (z-order bottom to top):**

1. **Inner/padding areas** — Pink (`#E8A0BF @ 25%`) semi-transparent rectangles covering the padding zones (top, right, bottom, left) inside the target frame
2. **Child element bounds** — Blue (`#0D69D4 @ 20%`) semi-transparent rectangles for each direct child of the target frame
3. **Element outline** — Red dashed (`#D42B2B`) stroke rectangle around the target frame's bounds
4. **Measurement labels** positioned near the relevant edges:
   - **Raw pixel values** — orange badges (`#C54500` bg, white text): show the measured dimension in px
   - **S2A token values** — magenta badges (`#D946A8` bg, white text): show `tokenName value` (e.g., `s2a/spacing/xs 8`)
   - Labels appear for: width, height, padding-top/right/bottom/left, item-spacing/gap
   - When a value matches an S2A spacing token, show BOTH the magenta token badge AND the orange px badge stacked

### Right rail: Property card

One card per exhibit showing the target frame's layout properties:

```
Card
├── Header: type icon + node name (Inter Bold 16px)
└── Attributes:
    ├── Width:          ↔  Fill 1920px  /  Fixed 1920px  /  Hug 1920px
    ├── Height:         ↕  Hug 1665px
    ├── Fill variable:  [s2a/color/background/default]  (token pill)
    ├── Direction:      ↓  Vertical  /  →  Horizontal
    ├── Align Children: ≡  Top Center
    ├── Padding:        ⊞  80px 220px  (or 4 values if asymmetric)
    └── Gap:            ≡  [s2a/spacing/4xl]  (token pill if matched, else raw px)
```

**Properties shown (only when applicable/non-zero):**
- Width (with resize mode: Fill/Fixed/Hug + icon)
- Height (with resize mode + icon)
- Fill variable (if a color token is bound, show as pill)
- Background color (if solid fill, no token)
- Direction (Vertical/Horizontal + icon)
- Align Children (alignment description + icon)
- Vertical resizing (if not same as height line)
- Horizontal resizing (if not same as width line)
- Item spacing / Gap (raw px, or token pill if matched)
- Padding top/right/bottom/left (collapsed to 2 values if symmetric, or 4 if asymmetric)

**Property icons** (placed before the value):
- Width: `↔`
- Height: `↕`
- Direction: `↓` (vertical) or `→` (horizontal)
- Align: `≡`
- Padding: `⊞`
- Gap: `≡` (with horizontal lines)

### Exhibit traversal

Walk the source node tree recursively. For every node that has `layoutMode !== 'NONE'` (i.e., auto-layout frames), create one exhibit. Order: depth-first, parent before children. This means the first exhibit is always the root frame, then its first auto-layout child, etc.

---

## Section 4: Typography Summary

No changes. Already implemented and working.

---

## Section 5: Component Details

No changes. Already implemented and working.

---

## Canvas Output Structure (updated)

```
[Spec] {NodeName}
├── Name (text header — 64px bold)
├── Anatomy
│   ├── Title ("Anatomy" 48px bold)
│   └── Exhibit (horizontal)
│       ├── Artwork (1:1 clone + numbered markers)
│       └── Content rail (type-driven cards with dots)
├── Layout and spacing
│   ├── Title ("Layout and spacing" 48px bold)
│   └── Exhibits (vertical stack)
│       ├── Exhibit (horizontal: tree | artwork+overlays | property card)
│       ├── Exhibit ...
│       └── ...
├── Typography Summary (unchanged)
└── Component Details (unchanged)
```

## Files to Modify

| File | Change |
|---|---|
| `src/spec-anatomy.ts` | **Full rewrite** — new marker system, type-driven cards, token pills, 1:1 clone |
| `src/spec-layout.ts` | **Full rewrite** — 3-column exhibits, layer tree, color overlays, measurement labels, property icons |
| `src/spec-it.ts` | Minor — update section title font size from 32 to 64, section gap adjustments |
| `src/utils.ts` | May need new helpers: `getResizeMode()`, `getAlignmentDescription()` |
| `src/tokens.ts` | No changes |

## What stays the same

- `src/spec-typography.ts` — no changes
- `src/spec-components.ts` — no changes
- `src/code.ts` — no changes
- `src/ui.ts` / `src/ui.html` / `src/ui.css` — no changes
- Token matching logic — no changes
