## Home – Desktop Redesign Audit · Patterns & Pages

> Layout patterns that compose organisms into full experiences, plus the page-level view.

```startLine:endLine:docs/redesign-audit/home-desktop-patterns-pages.md
| ID     | Name                        | Type      | Composition (Organisms / Molecules)             | Description                                                                 | Example Area (Figma Nodes) | Notes |
|--------|-----------------------------|-----------|-------------------------------------------------|-----------------------------------------------------------------------------|-----------------------------|-------|
| PT-01  | Hero with Media & CTAs      | pattern   | O-001 Global Nav, O-002 Hero Marquee            | Full-width hero: nav on top, big media, hero copy stack and dual CTAs.     | 18793:25700–25824          | Core above-the-fold pattern. |
| PT-02  | 3-Up Pricing Deck           | pattern   | O-004 Section Intro, O-007 Pricing Deck         | Comparison row of three pricing cards with shared intro and legal text.    | 18793:26190–26221          | Supports promo vs standard plans. |
| PT-03  | 4-Up Product Grid           | pattern   | O-008 App / Product Grid Row                    | Repeating rows of four app/product cards.                                   | 18793:26344–364            | Used for app ecosystems and feature grids. |
| PT-04  | App UI Showcase             | pattern   | O-003 App UI Showcase, M-004 Section Intro      | Centered application frame with supporting copy and cursor callout.        | 18793:26060–81             | Demonstrates in-product workflows. |
| PT-05  | Audience Selector + Content | pattern   | O-009 Audience Selector Row, O-015 Audience Content Block | Chip-based audience toggle controlling downstream content.      | 18793:26227–237            | Scales to more segments if needed. |
| PT-06  | Carousel / Gallery          | pattern   | O-010 Carousel, O-008 App Grid or O-012 Cards   | Horizontal gallery navigated with dots/arrows.                              | 18793:26238–240            | Could be formalized as a Carousel organism. |
| PT-07  | Editorial Image Grid        | pattern   | O-012 Editorial Image Card × 3, O-004 Section Intro | Storytelling grid for campaigns or case studies.                        | 18793:25978–83             | Often paired with audience or product narratives. |
| PT-08  | Long-Form Features Section  | pattern   | O-004 Section Intro, O-013 Solutions Tryptic Row | Multi-row feature/solution storytelling with imagery and cards.            | 18793:26093–26221          | Bridges hero promise to pricing. |
| PT-09  | Footer Mega-Nav             | pattern   | O-011 Footer Mega-Nav                           | Dense, multi-column footer with brand, support, and legal content.         | 18793:26242–279            | Shared across site templates. |
| PT-10  | App Strip Under Hero        | pattern   | O-005 Product Strip                             | Single row of small app/product tiles immediately under hero.              | 18793:26344–364 (top row)  | Good candidate for a reusable Milo block. |

| Page ID | Page Name       | Viewport | Primary Patterns Used                               | High-Level Purpose                                             | Notes / Variants                            |
|---------|-----------------|----------|-----------------------------------------------------|-----------------------------------------------------------------|---------------------------------------------|
| P-01    | Home – Desktop  | 1440×940 | PT-01, PT-10, PT-04, PT-03, PT-08, PT-02, PT-09     | Primary marketing homepage for Adobe creative offerings.       | Multiple hero/media variants for campaigns. |
| P-02    | Home – Desktop (Alt Hero) | 1440×985 | PT-01 (alt media), PT-03, PT-08, PT-02, PT-09 | Alternate hero art/layout while preserving same core patterns. | Can be parameterized via hero/media props.  |
```
