## Home – Desktop Redesign Audit · Molecules

> Small composed units (atoms combined into reusable pieces).  
> Source: Figma `Home - Desktop` frames in `figma-variables-matt`.

```startLine:endLine:docs/redesign-audit/home-desktop-molecules.md
| ID    | Name                     | Role / Pattern        | Composition (Atoms)                          | Figma Example Node(s) | Description                                                                 | Used In (Organisms)                      |
|-------|--------------------------|------------------------|----------------------------------------------|------------------------|-----------------------------------------------------------------------------|------------------------------------------|
| M-001 | Nav Item                 | primary nav link      | A-009 Nav Label, A-014 Caret Icon (optional) | 18793:25827–854        | Top navigation item with label and optional dropdown caret.                | O-001 Global Nav                         |
| M-002 | Utility CTA + Search    | nav utility cluster   | A-008 CTA Label, A-014 Caret/Icon, A-019 Avatar, A-020 Cursor | 18793:25855–880 | Right-side utility group (primary CTA + search/app controls).             | O-001 Global Nav                         |
| M-003 | Hero Copy Stack         | hero intro text       | A-005 Eyebrow, A-001 H1 Headline, A-004 Body | 18793:25813–818        | Eyebrow + large hero headline + supporting line under hero media.          | O-002 Hero Marquee                       |
| M-004 | Section Intro Copy      | section heading       | A-005 Eyebrow, A-002 H1 Headline, A-004 Body | 18793:26088–92, 26420–23 | Reusable section intro band with eyebrow, headline, and short body.      | O-004 Section Intro Bands                |
| M-005 | CTA Button (Primary)    | main action           | A-008 CTA Label, A-016 Card Surface (button) | 18793:25875–876        | Filled button for primary actions (“Start free trial”, etc.).             | O-002 Hero Marquee, O-006 Pricing Deck   |
| M-006 | CTA Button (Secondary)  | secondary action      | A-008 CTA Label, outline surface             | 18793:25820–822        | Outlined/ghost button for secondary actions.                               | O-002 Hero Marquee, O-006 Pricing Deck   |
| M-007 | CTA Text Link Row       | text link CTA         | A-008 CTA Label, A-014 Caret Icon            | 18793:26122–24, 26168–72 | Inline text CTAs with trailing arrow, used below cards and sections.    | O-006 Pricing Deck, O-007 Solutions Rows |
| M-008 | Card Header (App + Tag) | card identity         | A-010–A-013 App Badge, A-005 Eyebrow         | 18793:26192–94, 26130–31 | Small row at top of cards combining app logo and short category label.  | O-006 Pricing Deck, O-008 Product Cards  |
| M-009 | Price Block             | price + billing info  | A-006 Price Text, A-004 Body                 | 18793:26198–200        | Displays monthly price and billing/offer details.                          | O-006 Pricing Deck                       |
| M-010 | Feature List Item       | plan benefit row      | A-004 Body / A-003 H3                        | 18793:26114–24         | Single bullet/line describing a plan benefit.                              | O-006 Pricing Deck (feature stacks)      |
| M-011 | Product Card Copy Stack | small card text       | A-003 H3 Headline, A-004 Body                | 18793:26347–59         | App/product name with short supporting line inside 4-up grids.            | O-008 Product Grid Rows                  |
| M-012 | Audience Chip           | audience filter chip  | A-008 CTA Label, pill surface                | 18793:26227–233        | Toggle-style chip (“Individuals”, “Businesses”, “Students & Teachers”).   | O-009 Audience Selector Row              |
| M-013 | Carousel Progress       | progress indicator    | A-015 Carousel Dot, small bar                | 18793:25804–10         | Dots/segments indicating carousel position.                                | O-010 Carousel / Hero Slider             |
| M-014 | Footer Column           | footer list column    | A-003 Section Title, A-004 Body-link lines   | 18793:26242–60         | Column of related footer links under a heading.                            | O-011 Footer Mega-Nav                    |
| M-015 | App Chip in Footer      | social/brand chip     | vector icon, A-003 Label Text                | 18793:26266–76         | Set of brand icons (Adobe, Behance, etc.) in footer.                       | O-011 Footer Mega-Nav                    |
| M-016 | Media Card Overlay Copy | overlay text on image | A-003 H3, A-004 Body                          | 18793:25995–900        | Text block overlaid on editorial imagery inside cards.                     | O-012 Editorial Image Cards              |
| M-017 | Panel Header (App UI)   | UI pane header        | A-003 Label, icon, rule                      | 18793:26068–76         | Header for left/right panels in app UI mock (toolbar, layers).            | O-003 App UI Showcase                    |
| M-018 | Tooltip / Help Text     | helper text           | A-004 Body, small icon                       | 18793:25680–81         | Smaller explanatory text blocks under fields or controls.                  | O-004 Section Intros, O-003 App UI       |
| M-019 | Slider / Handle         | control affordance    | A-018 Divider/Rule, small handle rectangles  | 18793:25625–36         | Visual handles around mock selection rectangle in Firefly UI overlay.      | O-003 App UI Showcase                    |
```
