# S2A Homepage and Studio: Deep Accessibility Audit

Audited 2026-09-14 on the local POC build (Chromium 151) with a new reusable
audit, `nx run authoring-poc:a11y-audit`, that goes beyond the axe A/AA pass in
the browser journeys. Evidence: `apps/authoring-poc/reports/accessibility-audit.json`.

These are automated and semi-automated checks. They are not a certification
and do not replace testing with screen reader, switch and magnification users.

## What the audit checks

| Area | Method | Criteria |
| --- | --- | --- |
| Automated rules | axe-core, tags wcag2a/aa, wcag21a/aa, wcag22aa, best-practice; violations and "needs review" items | many |
| Structure | heading order, h1 presence, landmarks (banner, main, contentinfo, nav names), image alt inventory, controls without names, link text that points to different destinations | 1.3.1, 2.4.1, 2.4.4, 2.4.6, 4.1.2 |
| Keyboard | Tab walk through the page recording focus order, visible focus indicator (outline or box-shadow), focus landing on hidden or inert nodes; marquee arrow/Home/End model; Escape on the mobile menu | 2.1.1, 2.4.3, 2.4.7 |
| Text over images | hides each text node, samples the pixels behind it and computes contrast against the 90th-percentile luminance in the hurting direction (a realistic worst case axe cannot evaluate) | 1.4.3 |
| Target size | every control's box against 24×24 | 2.5.8 |
| Text spacing and zoom | user spacing overrides (line-height 1.5, letter 0.12em, word 0.16em) and 200% zoom; clipped or overflowing text | 1.4.12, 1.4.10 |
| Motion | reduced motion: no scroll-driven or long animations, marquee paused, no video fetched; normal motion: pause control works, focus inside the marquee pauses autoplay | 2.2.2, 2.3.3 |
| Studio | dialog focus in/out and naming, labelled fields, live status region, toggle rows, landmarks, h1, prohibited ARIA | 1.3.1, 2.1.2, 2.4.3, 3.3.2, 4.1.2 |

Surfaces: visitor Homepage at 1440 light, 390 light and 1440 dark; Studio at
1440 and 390; the built Storybook Full Page story.

## Results

First run: 211 findings (38 serious, 38 moderate, 135 minor). After fixes: 18
findings, 0 serious, 0 axe violations on every surface. The 18 are listed under
"Open" below with the reasoning.

### Fixed in this pass

- **Landmark structure (visitor page and Storybook story).** Everything was
  wrapped in one `<main>`, and the navigation and footer wrappers were labelled
  regions, so the banner and contentinfo landmarks were nested inside other
  landmarks and two regions shared the name "Adobe". The page root is now a
  plain container with navigation first, a `<main>` holding the h1 and the six
  content sections, and the footer last. Navigation and footer wrappers are no
  longer regions. `pageSlot()` in the registry decides placement so Studio's
  preview and the Storybook story stay identical.
- **Skip link.** "Skip to main content" is the first tab stop on the visitor
  page and becomes visible on focus.
- **Keyboard efficiency in Studio.** The canvas iframe sat between the toolbar
  and the inspector in tab order, so a keyboard user had to tab through all 74
  links of the preview to reach the properties panel. In edit mode the iframe is
  now out of the tab order (sections are selected from the Page outline); in
  Preview mode it is back in so the page itself can be tested with the keyboard.
- **Studio semantics.** The brand is the page h1; the workspace is the `<main>`
  landmark (so it exists on mobile whichever panel is shown); the canvas is a
  named section; the "design review pending" icon has `role="img"` so its label
  is permitted; the review disclosure and Figma link meet the 24px target size.
- **Target size.** Footer links and media-card CTAs (18–20px tall) now have a
  24px minimum hit box and a 24px minimum width.
- **Text spacing.** The marquee tab tiles used `white-space: nowrap` with a
  fixed maximum height, so user text spacing clipped their labels. Labels now
  wrap and the tile grows; at the design size nothing changes.
- **Decorative video.** Marquee background videos are `aria-hidden`; they carry
  no information beyond the still and the copy.
- **Marquee tab ink** (found earlier the same day): the previously active tile
  lost its label after an advance, and the active label was white on white in
  dark mode. The tile now owns the ink with theme-invariant tokens.
- **Audit accuracy.** Short UI transitions no longer count as motion under
  reduced motion (Milo keeps them too); visually hidden text and hidden
  disclosure content are excluded from clipping and target-size checks; the
  keyboard walk stops at an iframe instead of walking its content.

### Verified without change

- Heading outline: one h1, section h2s, card h3s in order on every surface.
- Text over images: every measured text node clears its ratio, including at the
  realistic worst case. Lowest: the quote card attribution on mobile at 4.53:1
  (small text, 4.5:1 required) and the mobile hero body at 5.65:1. The desktop
  quote name reaches 8.4:1. These depend on the current art; re-run after any
  art change.
- Focus: all 74 visitor tab stops and all 39 Studio stops show a visible focus
  indicator; none land on hidden or inert nodes. Inactive marquee slides are
  `inert` and `aria-hidden`; the tab rail is a set of `aria-pressed` buttons
  with Arrow/Home/End movement and focus following the pressed tile.
- Motion: under reduced motion no scroll-driven or long animation runs, the
  marquee stays paused and no video bytes are fetched; with motion allowed the
  pause control works and focus inside the marquee pauses autoplay.
- Zoom: no horizontal scrolling at 200% zoom on a 1280px window, nor at 320px.
- Studio: the Add section dialog receives focus, is named, closes on Escape and
  returns focus to its trigger; every field has a label; the save state is a
  live status region.

## Open

1. **Category card body text clamps to two lines** (5 findings, 1.4.12). The
   ElasticCard v2 spec clamps the resting body to two lines, so user text
   spacing hides text. Options: show the full text in the expanded state only,
   or drop the clamp and let the card grow. Design decision.
2. **"View all products" appears twice with different destinations** (2.4.4).
   Both lists are now labelled by their column heading, which satisfies
   "in context" at AA. Unique link text would satisfy AAA 2.4.9. Editorial
   decision; the footer copy is provisional anyway.
3. **Studio has no skip link** (2.4.1, advisory). Landmarks and a short toolbar
   exist; a "Skip to properties" link would help keyboard users further.
4. **Mobile marquee tiles truncate long labels with an ellipsis** by design
   (192px tiles). Under user text spacing this hides characters. Same trade-off
   as item 1; the full label remains available as the tile's accessible name.
5. **axe "needs review" items** (color-contrast on gradient scrims, video
   captions) are covered by the text-over-media measurement and the decorative
   video marking respectively, but remain listed by axe as manual checks.
6. **Not covered by automation:** screen reader announcement order and verbosity,
   the category rail's hover-only expansion (keyboard users reach the card link
   but not the expanded artwork), Windows High Contrast / forced colors, and
   real assistive-technology sessions. These need a manual review.

## How to run

```sh
npx nx run authoring-poc:a11y-audit                                   # visitor page + Studio
npx nx run authoring-poc:a11y-audit --args=--storybook-url=http://127.0.0.1:6007/
```

The audit builds first and serves the built app locally. Findings are printed
and written to `reports/accessibility-audit.json` with per-surface detail:
axe results, structure inventories, contrast samples, keyboard walk, marquee
model, motion state and Studio dialog checks.
