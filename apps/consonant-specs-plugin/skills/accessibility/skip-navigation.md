# Skip Navigation

Bypass blocks and skip links for keyboard users. Use this as the primary reference when filling the Skip Navigation card.

---

## Skip Links (WCAG 2.4.1)

Pages with repeated navigation blocks MUST provide a mechanism to bypass them and jump to main content.

**Standard implementation:**
```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <nav><!-- repeated navigation --></nav>
  <main id="main-content"><!-- page content --></main>
</body>
```

**Behavior:**
- Skip link is the FIRST focusable element on the page
- Hidden by default, visible on focus (keyboard users see it, mouse users don't)
- Jumps focus to the main content area
- Must be visible when focused — never `display: none` permanently

**CSS pattern:**
```css
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 999;
}
.skip-link:focus {
  position: fixed;
  top: 0;
  left: 0;
  padding: 8px 16px;
  background: #000;
  color: #fff;
}
```

## Multiple Skip Links

For complex pages, provide multiple skip points:
- "Skip to main content"
- "Skip to navigation"
- "Skip to search"
- "Skip to footer"

Only add multiple skip links when the page structure is complex enough to warrant them. A simple page with header + content + footer only needs one.

## When Required

Skip links are needed when:
- Page has a navigation bar with multiple links
- Page has repeated sidebar content
- Page has a complex header with multiple interactive elements
- Multi-level navigation appears before main content

## Not Needed When

- Single-page application where navigation changes are managed via focus management
- Page has no repeated blocks before main content
- Landmarks are properly used AND screen reader users can navigate by landmark (but skip link is still recommended for keyboard-only users who don't use screen readers)

## Detection Heuristics for Figma

- Check if the design has a navigation bar or header with links
- Count interactive elements before the main content area
- If more than 3-4 navigation links appear before content, skip link is needed
- Look for complex headers with mega-menus
- Check for repeated sidebars across page templates

## Blueline Card Output

- Title = skip link type (e.g. "Skip to main content", "Skip to search")
- Desc = implementation note (e.g. "First focusable element on page. Hidden by default, visible on :focus. Target: main content area below navigation.")
- Notes = cite WCAG 2.4.1 Bypass Blocks
- Warnings = complex navigation with no skip mechanism designed
