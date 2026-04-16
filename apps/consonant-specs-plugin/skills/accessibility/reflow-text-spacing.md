# Reflow & Text Spacing

Content reflow at narrow viewports and text spacing override requirements. Use this as the primary reference when filling the Reflow & Text Spacing card.

---

## Reflow (WCAG 1.4.10)

Content must be usable without horizontal scrolling at **320px viewport width** (equivalent to 400% zoom on a 1280px desktop).

**Requirements:**
- No horizontal scrollbar at 320px width
- All content and functionality still accessible
- No clipped or overlapping text
- No loss of information

**Exceptions:**
- Data tables can scroll horizontally (but need a scroll indicator)
- Maps, diagrams, and code blocks may require horizontal scrolling
- Toolbars with many items can overflow to a menu

**Common failures:**
- Fixed-width containers that don't collapse
- Side-by-side columns that don't stack vertically
- Navigation bars that don't collapse to hamburger menu
- Images with fixed pixel widths that overflow
- Modals that are wider than the viewport

## Text Spacing (WCAG 1.4.12)

Content must remain readable and functional when users override text spacing to these values:

| Property | Override value |
|---|---|
| Line height | 1.5x font size |
| Letter spacing | 0.12x font size |
| Word spacing | 0.16x font size |
| Paragraph spacing | 2x font size |

**Requirements:**
- No loss of content (text not clipped)
- No overlapping text
- All functionality still works (buttons still clickable, links still visible)

**Common failures:**
- Fixed-height containers that clip text when line-height increases
- Buttons with fixed height that overflow when letter-spacing increases
- Cards with `overflow: hidden` that hide content
- Tooltips that clip with increased spacing

## Resize Text (WCAG 1.4.4)

Text must be resizable to **200%** without assistive technology, without loss of content or functionality.

- Don't use viewport units (vw) for font sizes exclusively
- Ensure `rem`/`em` based sizing works with browser zoom
- Fixed-height containers must expand with text

## Design Annotation Format

- Specify which layouts stack at mobile breakpoints
- Document container max-widths and overflow behavior
- Note any fixed-height elements that must expand with text

## Detection Heuristics for Figma

- Check if the design includes mobile/responsive breakpoint variants
- Look for fixed-width containers that might not reflow
- Identify text in constrained containers (badges, buttons, tags) that could clip
- Check for side-by-side layouts without a stacking breakpoint
- Look for text overlapping other elements (tight spacing)

## Blueline Card Output

- Title = layout area or component (e.g. "Hero section", "Card grid", "Navigation bar")
- Desc = reflow requirement (e.g. "Two-column layout must stack to single column at 320px. Fixed 600px container will cause horizontal scroll.")
- Notes = cite WCAG 1.4.10 for reflow, 1.4.12 for text spacing, 1.4.4 for text resize
- Warnings = fixed-width containers, missing mobile breakpoints, overflow:hidden on text containers
