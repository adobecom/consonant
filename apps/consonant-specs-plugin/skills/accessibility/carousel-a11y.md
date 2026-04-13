# Carousel Accessibility Reference

## Auto-Rotation Rules (WCAG 2.2.2)

- `prefers-reduced-motion: reduce` → auto-rotation OFF by default
- Minimum interval: 5 seconds (15 seconds recommended)
- Play/Pause control must be keyboard accessible
- Pause triggers:
  - `focusin` on any element inside the carousel region
  - `mouseenter` on interactive carousel elements (tabs, arrows)
- Resume rules:
  - Only after focus has left AND pointer has left
  - Grace period of 1-2 seconds before resuming
  - Manual tab selection (clicking a specific tab) stops rotation permanently until user presses play

## Slide Transitions

- Use crossfade or instant swap when `prefers-reduced-motion: reduce` is active
- Never use slide/swipe animations when reduced motion is preferred

## DOM Strategy

- All slide panels should exist in the DOM simultaneously
- Never insert or remove DOM nodes on rotation
- Inactive panels: `inert` attribute + `aria-hidden="true"`
- Active panel: remove `inert`, set `aria-hidden="false"`

## Keyboard Navigation

- Tab enters the carousel region → first focusable element
- If tablist pattern: Left/Right arrows between tabs, Tab to panel content
- If next/prev pattern: Enter/Space on arrows to navigate
- Home/End for first/last slide (if tablist)
