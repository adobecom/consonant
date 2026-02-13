## Component Audit · Containers & Layout

This doc captures width constraints, container patterns, and grid alignment for components across mobile and desktop. Components should be responsive by default, with max-width constraints only where content readability or grid alignment requires it.

**Related docs:**

- **Grid tokens** (`docs/token-alignment/2026-02-09/grid.md`) — breakpoint definitions and column counts
- **Breakpoint tokens** (`tokens.breakpoints.css`) — viewport width tokens

---

## 1. Container Patterns Overview

| Pattern           | Width Strategy                    | Use Case                                  | Token Reference                    |
| ----------------- | --------------------------------- | ----------------------------------------- | ---------------------------------- |
| Full-bleed        | `width: 100%` (no max-width)      | Hero media, background images, nav bars   | N/A (full viewport)                |
| Content container | `max-width` with responsive width | Text content, card grids, section content | `--s2a-grid-*-max-content-width`   |
| Grid-aligned      | Grid column spans                 | Cards in grids, multi-column layouts      | Grid column tokens (12-col, 6-col) |
| Constrained       | Fixed min/max (rare)              | Icon-only buttons, fixed-size badges      | T-shirt size tokens                |

---

## 2. Width Constraints by Component Type

### 2.1 Navigation Components

#### Global Navigation Bar

- **Desktop**: Full-bleed (`width: 100%`), content inside uses grid-aligned container
- **Mobile**: Full-bleed (`width: 100%`), no max-width
- **Grid alignment**: Nav items align to grid columns; utility cluster (right side) aligns to grid edge
- **Tokens**: Uses grid margin tokens for horizontal padding (`--s2a-grid-*-margin`)

#### Router Navigation List

- **Desktop**: Full-bleed within hero (`width: 100%`), cards align to grid columns
- **Mobile**: Full-bleed (`width: 100%`), horizontal scroll container
- **Grid alignment**: Cards span grid columns (e.g., 2–3 columns per card on desktop)
- **Tokens**: No max-width; uses grid gutter for card spacing

### 2.2 Hero Components

#### Hero Media Container

- **Desktop**: Full-bleed (`width: 100%`, no max-width)
- **Mobile**: Full-bleed (`width: 100%`, no max-width)
- **Grid alignment**: N/A (full viewport)
- **Tokens**: N/A

#### Hero Content Container

- **Desktop**: `max-width` constraint (e.g., `max-width: 1200px` or grid-aligned)
- **Mobile**: Full-width with padding (`width: 100%`, padding from grid margin tokens)
- **Grid alignment**: Content aligns to grid columns; typically spans 6–8 columns on desktop
- **Tokens**: `--s2a-grid-desktop-max-content-width` or grid column span

### 2.3 Card Components

#### Card / Text

- **Desktop**: `max-width` for readability (e.g., `max-width: 600px` or grid column span)
- **Mobile**: Full-width with padding (`width: 100%`, padding from grid margin)
- **Grid alignment**: Can span 1–3 grid columns depending on layout
- **Tokens**: Content width tokens or grid column spans

#### Card / App, Card / Feature, Card / Pricing

- **Desktop**: Grid-aligned (spans 2–4 columns in 12-col grid)
- **Mobile**: Full-width with padding, or 2-column grid (`width: calc(50% - gutter/2)`)
- **Grid alignment**: Cards align to grid columns; spacing uses grid gutter tokens
- **Tokens**: Grid column spans, `--s2a-grid-*-gutter` for spacing

#### Card / App Tile

- **Desktop**: Grid-aligned (spans 2–3 columns in 12-col grid)
- **Mobile**: Grid-aligned (spans 1 column in 6-col grid, or 2 columns for 2-up layout)
- **Grid alignment**: Always grid-aligned; uses grid column and gutter tokens
- **Tokens**: Grid column spans, `--s2a-grid-*-gutter`

#### Card / Media Slide

- **Desktop**: Grid-aligned or fixed aspect ratio container
- **Mobile**: Full-width with aspect ratio constraint
- **Grid alignment**: Spans 3–4 columns on desktop; full-width on mobile
- **Tokens**: Grid column spans, aspect ratio tokens

### 2.4 Section Containers

#### Section Wrapper

- **Desktop**: Full-bleed (`width: 100%`), inner content container has `max-width`
- **Mobile**: Full-bleed (`width: 100%`), inner content uses padding
- **Grid alignment**: Outer wrapper is full-bleed; inner content aligns to grid
- **Tokens**: `--s2a-grid-*-max-content-width` for inner container

#### Section Intro (Eyebrow + Headline + Body)

- **Desktop**: `max-width` constraint (e.g., `max-width: 800px` or grid column span)
- **Mobile**: Full-width with padding
- **Grid alignment**: Typically centers or aligns to grid start; spans 6–8 columns
- **Tokens**: Content width tokens

### 2.5 Form/Input Components

#### Select Dropdown

- **Desktop**: `min-width` for usability (e.g., `min-width: 200px`), `max-width: 100%` of container
- **Mobile**: Full-width of container (`width: 100%`)
- **Grid alignment**: Aligns to grid column or container width
- **Tokens**: Spacing tokens for padding, no width constraints

---

## 3. Grid Alignment Strategy

### 3.1 Desktop (12-column grid, 2560px container)

- **Full-bleed sections**: Hero, nav bars, footer — `width: 100%`, no max-width
- **Content sections**: Text blocks, card grids — use `max-width: 1200px` or grid column spans (e.g., `grid-column: 2 / 12`)
- **Card grids**: Cards span 2–4 columns each, with gutter spacing between
- **Router navigation**: Cards span ~2 columns each, horizontal layout

### 3.2 Mobile (6-column grid, 375px container)

- **Full-bleed sections**: Hero, nav bars — `width: 100%`, no max-width
- **Content sections**: Full-width with padding (`padding-inline: 24px` from grid margin token)
- **Card grids**: 1–2 columns per card (`width: 100%` or `width: calc(50% - 12px)`)
- **Router navigation**: Horizontal scroll, no width constraints on individual cards

---

## 4. Token Usage for Widths

### 4.1 Max-Content-Width Tokens

Use these for text content and section containers:

```css
/* Desktop */
max-width: var(--s2a-grid-desktop-max-content-width, 1200px);

/* Mobile */
width: 100%;
padding-inline: var(--s2a-grid-mobile-margin, 24px);
```

### 4.2 Grid Column Spans

Use CSS Grid for card layouts:

```css
/* Desktop: 3-column card grid */
.c-card-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--s2a-grid-desktop-gutter, 24px);
}

.c-card {
  grid-column: span 4; /* 3 cards per row */
}
```

### 4.3 Responsive Width Strategy

**General rule**: Use `max-width` only when:

1. Content readability requires it (text blocks, forms)
2. Grid alignment requires it (card grids, multi-column layouts)
3. Design spec explicitly calls for a constrained width

**Avoid `max-width` for**:

- Navigation bars (full-bleed)
- Hero media (full-bleed)
- Background elements (full-bleed)
- Router navigation lists (full-bleed, grid-aligned internally)

---

## 5. Component-Specific Width Decisions

### 5.1 Components with Max-Width

| Component       | Desktop Max-Width            | Mobile Strategy      | Reason                 |
| --------------- | ---------------------------- | -------------------- | ---------------------- |
| Card / Text     | `600px` or grid column span  | Full-width + padding | Text readability       |
| Section Intro   | `800px` or grid column span  | Full-width + padding | Content centering      |
| Hero Content    | `1200px` or grid column span | Full-width + padding | Content alignment      |
| Select Dropdown | `100%` of container          | `100%` of container  | Form field consistency |

### 5.2 Components with No Max-Width (Full-Bleed)

| Component         | Strategy      | Grid Alignment               |
| ----------------- | ------------- | ---------------------------- |
| Global Navigation | `width: 100%` | Inner content aligns to grid |
| Hero Media        | `width: 100%` | N/A (full viewport)          |
| Router Nav List   | `width: 100%` | Cards align to grid columns  |
| Footer            | `width: 100%` | Inner content aligns to grid |
| Section Wrappers  | `width: 100%` | Inner content has max-width  |

### 5.3 Grid-Aligned Components

| Component       | Desktop Span              | Mobile Span                    |
| --------------- | ------------------------- | ------------------------------ |
| Card / App      | 2–4 columns (12-col grid) | 1–2 columns (6-col grid)       |
| Card / Feature  | 3–4 columns (12-col grid) | 1 column (6-col grid)          |
| Card / Pricing  | 4 columns (12-col grid)   | 1 column (6-col grid, stacked) |
| Card / App Tile | 2–3 columns (12-col grid) | 1–2 columns (6-col grid)       |

---

## 6. Responsive Breakpoint Behavior

### 6.1 Mobile → Desktop Transitions

**At `768px` (tablet breakpoint)**:

- Card grids: 1-column → 2-column
- Router nav: horizontal scroll → grid-aligned cards
- Section intros: full-width → max-width centered

**At `1024px` (desktop breakpoint)**:

- Card grids: 2-column → 3–4 column
- Content containers: full-width → max-width constrained
- Grid: 6-col mobile → 12-col desktop

### 6.2 Width Token Strategy

```css
/* Base: full-width with padding */
.component {
  width: 100%;
  padding-inline: var(--s2a-grid-mobile-margin, 24px);
}

/* Desktop: max-width constraint */
@media (min-width: 1024px) {
  .component {
    max-width: var(--s2a-grid-desktop-max-content-width, 1200px);
    margin-inline: auto;
    padding-inline: var(--s2a-grid-desktop-margin, 40px);
  }
}
```

---

## 7. Specific Width Measurements from Homepage Design

### 7.1 Desktop (1440px viewport)

| Component / Section     | Width Strategy             | Measured Values (from Figma) | Notes                                                  |
| ----------------------- | -------------------------- | ---------------------------- | ------------------------------------------------------ |
| **Global Navigation**   | Full-bleed                 | `width: 100%` (1440px)       | Inner content: logo at x=24, nav items start at x=41.7 |
| **Hero Media**          | Full-bleed                 | `width: 100%` (1440px)       | Background image extends beyond viewport               |
| **Hero Content**        | Left-aligned, no max-width | `x: 64px`, `width: 667px`    | Not centered; aligns to grid start                     |
| **Router Navigation**   | Full-bleed                 | `width: 100%` (1440px)       | Cards: `width: 220px`, spacing ~224px                  |
| **Section Hero**        | Full-bleed                 | `width: 100%` (1440px)       | Secondary hero band                                    |
| **What's New Section**  | Centered container         | `x: 121px`, `width: 1198px`  | Margins: ~121px each side                              |
| **What's New Cards**    | 3-column grid              | `width: 394px` each          | Spacing: 8px between cards (402px gap)                 |
| **Router Section**      | Full-bleed                 | `width: 100%` (1440px)       | Cards: `width: 294-496px`                              |
| **Pricing Tryptic**     | Centered, extends beyond   | `x: 120px`, `width: 1600px`  | Overflows viewport; likely centered                    |
| **Pricing Cards**       | 3-column grid              | `width: 393-395px` each      | Spacing: ~8px between cards                            |
| **App Grid Section**    | Centered container         | `x: 121px`, `width: 1198px`  | Cards: `width: 293.5px`, 4 per row                     |
| **Tools Title Section** | Full-bleed                 | `width: 100%` (1440px)       | App frame centered at x=448.5                          |
| **Carousel**            | Full-bleed                 | `width: 100%` (1440px)       | Active slide: `width: 1197px`                          |
| **Footer**              | Full-bleed                 | `width: 100%` (1440px)       | Inner content: links start at x=124                    |

**Key Desktop Patterns:**

- **Centered content sections**: Use `x: 121px` margin, `width: 1198px` (leaves ~121px on each side)
- **Full-bleed sections**: Hero, nav, footer, carousel — no width constraints
- **Card grids**: Cards are fixed-width (293-395px), not fluid; spacing via gaps
- **Router nav cards**: Fixed `220px` width, horizontal layout with ~224px spacing

### 7.2 Mobile (375px viewport)

| Component / Section   | Width Strategy          | Measured Values (from Figma)              | Notes                                   |
| --------------------- | ----------------------- | ----------------------------------------- | --------------------------------------- |
| **Global Navigation** | Full-bleed              | `width: 100%` (375px)                     | Compact nav with logo + actions         |
| **Hero Media**        | Full-bleed              | `width: 100%` (375px)                     | Background extends beyond viewport      |
| **Hero Content**      | Full-width with padding | `x: 24px`, `width: 327px`                 | 24px padding on each side               |
| **Router Navigation** | Horizontal scroll       | Cards: `width: 163px`, spacing ~28.8px    | No width constraints; horizontal scroll |
| **Section Hero**      | Full-width with padding | `x: 24px`, `width: 327px`                 | 24px padding                            |
| **What's New Cards**  | Stacked vertical        | `width: 327px` (full-width minus padding) | Single column, full-width               |
| **Pricing Cards**     | Stacked vertical        | `width: 327px` (full-width minus padding) | Single column, full-width               |
| **App Grid**          | 2-column grid           | Cards: `width: 175.5px` each              | 2 cards per row, ~8px gap               |
| **Footer**            | Full-width with padding | `x: 24px`, `width: 327px`                 | Accordion layout                        |

**Key Mobile Patterns:**

- **Consistent padding**: `24px` on all sides (matches grid margin token)
- **Content width**: `327px` (375px - 48px padding)
- **Card grids**: 2-column for app tiles (`175.5px` each), single column for editorial/pricing
- **Router nav**: Horizontal scroll, no width constraints on cards

---

## 8. Container Width Recommendations

### 8.1 Desktop Container Tokens

Based on the design measurements:

```css
/* Centered content container (most sections) */
--s2a-grid-desktop-content-width: 1198px;
--s2a-grid-desktop-content-margin: 121px;

/* Full-bleed sections */
--s2a-grid-desktop-full-bleed: 100%;

/* Hero content (left-aligned, not centered) */
--s2a-grid-desktop-hero-content-width: 667px;
--s2a-grid-desktop-hero-content-start: 64px;
```

### 8.2 Mobile Container Tokens

```css
/* Content width (full-width minus padding) */
--s2a-grid-mobile-content-width: 327px;
--s2a-grid-mobile-margin: 24px;

/* Full-bleed sections */
--s2a-grid-mobile-full-bleed: 100%;
```

### 8.3 Card Width Patterns

**Desktop:**

- Router nav cards: `220px` (fixed)
- Editorial cards: `394px` (3-column grid)
- Pricing cards: `393-395px` (3-column grid)
- App tiles: `293.5px` (4-column grid)

**Mobile:**

- Router nav cards: `163px` (horizontal scroll, no constraint)
- Editorial/pricing cards: `327px` (full-width, stacked)
- App tiles: `175.5px` (2-column grid)

**Recommendation**: Cards should use **fixed widths** in grids (not fluid percentages) to maintain consistent spacing and alignment. Use CSS Grid with `grid-template-columns` and fixed card widths, or flexbox with fixed `width` values.

---

## 9. Open Questions / TODOs

- ✅ **Desktop content width**: Confirmed `1198px` for centered sections (margins `121px` each side)
- ✅ **Mobile padding**: Confirmed `24px` on all sides (`327px` content width)
- ✅ **Router nav cards**: Fixed `220px` on desktop, `163px` on mobile (horizontal scroll)
- ⚠️ **Pricing tryptic**: Extends to `1600px` width — determine if this should be constrained or allowed to overflow
- ⚠️ **Card widths**: All cards use fixed pixel widths — consider if we need fluid/responsive alternatives
- ⚠️ **Grid alignment**: Desktop uses `121px` margins, but grid tokens specify different values — align tokens with design
- Create container component pattern that handles full-bleed vs. constrained width automatically
- Document responsive padding strategy (grid margin tokens) for mobile vs. desktop
