# WAI-ARIA Patterns Reference

Quick reference for common ARIA patterns from the WAI-ARIA Authoring Practices Guide.

## Tabs (Tablist)

- Container: `role="tablist"`
- Each tab: `role="tab"`, `aria-selected="true|false"`, `tabindex="0|-1"`
- Panel: `role="tabpanel"`, `aria-labelledby="tab-id"`
- Keyboard: Left/Right arrows between tabs, Home/End first/last, Tab moves to panel content
- Selection model: "selection follows focus" or "manual activation" — specify which

## Carousel

- Outer: `role="region"`, `aria-roledescription="carousel"`, `aria-label="descriptive name"`
- Each slide: `role="group"`, `aria-roledescription="slide"`, `aria-label="N of M"`
- Inactive slides: `aria-hidden="true"`, `inert`
- Play/Pause: `aria-label` toggles between "Pause auto-rotation" / "Play auto-rotation"
- Pagination: `role="tablist"` if tabs-like, or individual buttons with `aria-label="Go to slide N"`

## Buttons

- `role="button"` (or use `<button>`)
- Toggle: `aria-pressed="true|false"`
- Menu trigger: `aria-haspopup="true"`, `aria-expanded="true|false"`

## Links

- Accessible name should describe destination, not just "Click here" or "Learn more"
- Pattern: "{visible text} about {nearby context}"

## Images

- Informative: `alt="description of image content"`
- Decorative: `alt=""` or `role="presentation"`
- Complex: `alt="brief description"` + longer description nearby or via `aria-describedby`

## Landmarks

- `<header>` / `role="banner"` — site header (once per page)
- `<nav>` / `role="navigation"` — navigation region (label if multiple)
- `<main>` / `role="main"` — main content (once per page)
- `<footer>` / `role="contentinfo"` — site footer (once per page)
- `<section>` / `role="region"` — named section (must have aria-label)
- `role="search"` — search functionality
