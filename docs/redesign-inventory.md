# Elliot Redesign Component Inventory

This is the working inventory extracted from Elliot's redesign walkthrough video plus supporting DS patterns already in flight. The table below keeps everything aligned to the atomic ladder (atoms, molecules, blocks, templates, and supporting utilities) and references the existing token namespaces under `packages/design-tokens` (for example `container.*`, `space.*`, `color.*`). Only propose new tokens when a component cannot be mapped to the current design-token exports.

## Atomic Ladder Snapshot

| ID | Level | Name | Origin | Evidence | Purpose | Composition / Slots | Variants / States | A11y essentials | Token hooks | Status / Priority | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ATOM-001 | Atom | Container | Observed | all frames | Max-width layout wrapper | child content | responsive padding | n/a | `container.*`, `space.*` | Proposed / P0 | Establish consistent page margins. |
| ATOM-002 | Atom | Grid | Observed | 10s, 20s, 30s | Layout for cards/tiles | columns + gap | responsive columns | n/a | `grid.*`, `space.*` | Proposed / P0 | Used for card rows and tile grids. |
| ATOM-003 | Atom | Stack / Inline | Supporting | -- | Spacing primitives | children | gap sizes | n/a | `space.*` | Proposed / P0 | Prevent ad-hoc margin soup. |
| ATOM-004 | Atom | Divider | Supporting | -- | Section separation | line | weights | n/a | `color.border.*`, `space.*` | Proposed / P2 | Not obvious in frames but typically needed. |
| ATOM-005 | Atom | Heading | Observed | 0s, 20s | Headings (hero/sections) | text | sizes via `typeStyle.*` | semantic order | `typeStyle.*`, `color.text.*` | Proposed / P0 | Ensure proper H1/H2 structure. |
| ATOM-006 | Atom | Text | Observed | all frames | Body/caption text | text | sizes via `typeStyle.*` | readable contrast | `typeStyle.*`, `color.text.*` | Proposed / P0 | Footer needs small styles. |
| ATOM-007 | Atom | Link | Observed | 10s ("Learn more"), footer | Navigation + inline actions | text | hover/visited/focus | focus visible; underline rules | `color.text.link*`, `focus.*` | Proposed / P0 | Define underline behavior + visited color. |
| ATOM-008 | Atom | Icon | Observed | header icons, product icons | Visual symbol | svg | sizes | `aria-hidden` when decorative | `size.icon.*`, `color.*` | Proposed / P0 | Needed for tiles + social icons. |
| ATOM-009 | Atom | Image | Observed | 0s hero media, 10s cards | Responsive media | img | aspect ratios | alt text rules | `radius.*` | Proposed / P0 | Define `AspectRatio` behavior if needed. |
| ATOM-010 | Atom | Button | Observed | 0s CTAs, 20s "View all plans" | Primary actions | label (+ optional icon) | primary/secondary; hover/active/disabled | focus ring, min target | `color.action.*`, `radius.*`, `space.*`, `focus.*` | Proposed / P0 | Buttons appear in hero + section CTAs. |
| ATOM-011 | Atom | IconButton | Observed | 20s carousel control area | Compact actions | icon | hover/active/disabled | label via `aria-label`, focus | `color.action.*`, `size.touchTarget.*`, `focus.*` | Proposed / P1 | For carousel prev/next. |
| ATOM-012 | Atom | Tag / Pill | Observed | 10s "For Creators..." | Category label | text (+ optional icon) | sizes; selected? | contrast; not sole indicator | `radius.pill`, `space.*`, `typeStyle.overline` | Proposed / P0 | Shows up atop category cards. |
| ATOM-013 | Atom | VisuallyHidden | Supporting | -- | Screen-reader-only text | wrapper | n/a | for icon-only controls | n/a | Proposed / P1 | Needed for accessible icon buttons. |
| MOL-001 | Molecule | ButtonGroup | Observed | 0s hero | Cluster CTAs | buttons | alignment | tab order consistent | `space.*` | Proposed / P1 | Hero has 2 CTAs. |
| MOL-002 | Molecule | NavItem | Observed | 0s header | Primary navigation link | Link | active/hover/focus | focus visible; current page | `typeStyle.*`, `color.text.*`, `focus.*` | Proposed / P0 | Nav items in header row. |
| MOL-003 | Molecule | NavList | Observed | 0s header | Group of nav items | NavItem[] | overflow/responsive | keyboard order | `space.*` | Proposed / P0 | Consider collapse on smaller widths. |
| MOL-004 | Molecule | Card (base) | Observed | 10s, 20s, 30s | Reusable surface for content | `media?`, `header?`, `body`, `actions?` | bordered/elevated; interactive | focus/hover; semantics | `color.bg.*`, `radius.*`, `shadow.*`, `space.*` | Proposed / P0 | This is the "one card to rule them all." |
| MOL-005 | Molecule | CardMedia | Observed | 10s | Image area for card | image | aspect ratio variants | alt text required | `radius.*` | Proposed / P0 | Category cards use strong media. |
| MOL-006 | Molecule | CardHeader | Observed | 10s | Tag + title | Tag + Heading | optional eyebrow/tag | semantics (heading levels) | `typeStyle.*`, `space.*` | Proposed / P0 | "For X" + title pattern. |
| MOL-007 | Molecule | CardBody | Observed | 10s, 20s, 30s | Supporting description | Text | clamp lines | readable contrast | `typeStyle.*`, `color.text.*` | Proposed / P0 | Tile descriptions. |
| MOL-008 | Molecule | CardActions | Observed | 10s | CTA row | Link/Button | alignment | focus order | `space.*` | Proposed / P1 | "Learn more" pattern. |
| MOL-009 | Molecule | SectionHeader | Observed | 20s | Section title + optional CTA | Heading + optional Button | centered/left align | heading semantics | `typeStyle.*`, `space.*` | Proposed / P0 | "Plans to create anything." + button. |
| MOL-010 | Molecule | SegmentedControl | Observed | 20s | Switch between audiences | tabs list | selected/hover/focus/disabled | full keyboard support | `color.*`, `radius.*`, `focus.*` | Proposed / P0 | Individuals/Business/Students & Teachers. |
| MOL-011 | Molecule | CarouselControls | Observed | 20s | Navigate horizontal content | prev/next + dots | disabled at ends | `aria-label`, focus order | `size.touchTarget.*`, `focus.*` | Proposed / P1 | Visible on plan row. |
| MOL-012 | Molecule | PaginationDots | Observed | 20s | Page indicator | dots | active/inactive | not sole indicator | `color.*`, `space.*` | Proposed / P2 | Keep optional; often paired with arrows. |
| MOL-013 | Molecule | IconTile | Observed | 30s | Icon + name + description tile | Icon + Heading + Text | hover/focus | focus visible; link semantics | `color.bg.*`, `radius.*`, `space.*` | Proposed / P0 | Your app grid is this molecule (or Card variant). |
| MOL-014 | Molecule | LinkList | Observed | 40s/43s | Column of footer links | heading + Link[] | dense spacing | focus order | `typeStyle.*`, `space.*` | Proposed / P0 | Footer columns. |
| MOL-015 | Molecule | SocialIconRow | Observed | 40s | Social links cluster | IconButton[] | hover/focus | `aria-label` | `size.touchTarget.*`, `focus.*` | Proposed / P1 | Social icons appear in footer. |
| BLK-001 | Block | GlobalHeader | Observed | 0s | Site-wide navigation | Brand + NavList + utility actions | sticky? | skip-to-content link | `layer.*`, `color.*`, `focus.*` | Proposed / P0 | Add "Skip to content" (supporting). |
| BLK-002 | Block | HeroBanner | Observed | 0s | Primary page message + CTAs | Heading + Text + ButtonGroup + Media | dark/light | heading order; focus not trapped | `color.bg.*`, `typeStyle.*` | Proposed / P0 | Dark hero with image. |
| BLK-003 | Block | CategoryCardRow / Carousel | Observed | 10s | Promote categories with cards | Card[] + optional scrolling | scroll/drag | keyboard scroll support | `space.*`, `focus.*` | Proposed / P0 | Row of category cards. |
| BLK-004 | Block | PlansSection | Observed | 20s | Plans intro + selectable segment | SectionHeader + SegmentedControl + CardRow | responsive | tabs/segment a11y | `typeStyle.*`, `color.*` | Proposed / P0 | Plan cards shown as horizontal list. |
| BLK-005 | Block | ProductTileGridSection | Observed | 30s | Browsable grid of tiles | SectionHeader? + Grid(IconTile[]) | responsive columns | focus order | `grid.*`, `space.*` | Proposed / P0 | Dark grid of app tiles. |
| BLK-006 | Block | GlobalFooter | Observed | 40s/43s | Site-wide links/legal | LinkList columns + social + legal row | dense/expanded | landmarks + focus order | `color.bg.inverse`, `color.text.inverse` | Proposed / P0 | Footer has many columns/links. |
| TMP-001 | Template | MarketingLandingTemplate | Observed | full flow | Page scaffold | Header + Hero + Sections[] + Footer | section ordering | heading hierarchy | `container.*`, `grid.*` | Proposed / P0 | Used by the video page. |
| PG-001 | Page | HomePage | Observed | full flow | Concrete page instance | MarketingLandingTemplate filled | n/a | n/a | n/a | Proposed / P0 | This is the page in the video. |
| SUP-001 | Supporting | SkipToContentLink | Supporting | -- | Accessibility nav aid | link to main | focus-visible only | required for keyboard users | `focus.*`, `color.*` | Proposed / P1 | Put at top of GlobalHeader. |
| SUP-002 | Supporting | Main landmark wrapper | Supporting | -- | Semantic structure | `<main>` region | n/a | screen reader navigation | n/a | Proposed / P1 | Improves SR usability. |
| P-003 | Supporting | ReducedMotion handling | Supporting | -- | Respect user prefs | motion toggle | n/a | `prefers-reduced-motion` | `motion.*` | Proposed / P2 | Especially for carousels. |

## Recommendations for Improvement
- **Standardize variant naming:** Normalize hover/active/selected naming across the inventory, especially where carousel controls and segmented controls already rely on overlapping states.
- **Include example usage:** Expand the "Notes" column (or link out) with quick code snippets or Storybook references to reduce ambiguity during implementation.
- **Enhance evidence reporting:** For Supporting entries without evidence, document when or why they become mandatory (for example accessibility and motion handling requirements).
- **Ensure consistent terminology:** Keep families like Icon vs. IconButton aligned on naming and expected behavior; consider renaming `P-003` with the `SUP-` prefix for clarity.
- **Expand accessibility guidance:** Capture specific ARIA roles, keyboard interactions, and focus rules inside the "A11y essentials" column so downstream teams have actionable requirements.

## General Naming Principles for This Inventory
- **Descriptive naming beats brevity:** Component names should immediately communicate purpose (CardActions, CarouselControls) without needing extra context.
- **Consistent prefixes by level:** IDs like ATOM-*, MOL-*, BLK-*, TMP-*, and SUP-* make it easy to sort the backlog and understand dependencies.
- **Reflect function and anatomy:** Whenever possible include major slots in the name (CardMedia, ButtonGroup) so consumers know what to expect before opening specs.
- **Pair IDs with documentation:** Each component entry should link back to deeper specs in `story-ui-docs/` so teams can find allowed content, props, and token bindings fast.
- **Braid accessibility into definitions:** Mention required roles, labels, and keyboard interactions next to each component to keep inclusivity top-of-mind.
- **Iterate with feedback:** Revisit this doc as Elliot's team shares updates so naming stays synchronized with the actual redesign components and the active token set.
