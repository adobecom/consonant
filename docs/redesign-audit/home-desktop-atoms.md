## Home – Desktop Redesign Audit · Atoms

> Source: Figma file `figma-variables-matt`, node `Home - Desktop` (`18793:25700` and variants).

This file lists the **atomic building blocks** (tokens and smallest components) used in the home redesign. Use the `ID` column as a stable key across Figma, YAML specs, Storybook, and Milo.

```startLine:endLine:docs/redesign-audit/home-desktop-atoms.md
| ID    | Name                       | Type   | Figma Example Node(s) | Description                                                       | Likely Tokens / Variables                         | Used In (Molecules / Organisms)                  |
|-------|----------------------------|--------|------------------------|-------------------------------------------------------------------|---------------------------------------------------|--------------------------------------------------|
| A-001 | H1 Headline (Hero)        | text   | 18793:25817           | Primary hero headline “Everything you need to make anything.”     | typography.desktop.h1, color.content.knockout     | M-hero-copy-stack, O-hero-marquee                |
| A-002 | H1 Headline (Section)     | text   | 18793:26091, 26422    | Section-level H1 headlines in mid‑page sections.                  | typography.desktop.h1, color.content.default      | M-section-intro-copy, O-section-intro            |
| A-003 | H3 Headline (Cards)       | text   | 18793:26348–364       | Card titles in app/product grids.                                 | typography.desktop.h3                             | M-card-body, O-app-grid-card                     |
| A-004 | Body Copy (Hero / Sections)| text  | 18793:25818, 26092    | Supporting body text under hero and section headings.             | typography.desktop.body-large/medium              | M-hero-copy-stack, M-section-intro-copy          |
| A-005 | Eyebrow Label             | text   | 18793:25710, 26418    | Small all‑caps category labels above headings.                    | typography.desktop.eyebrow                        | M-card-header, M-section-eyebrow, O-pricing-card |
| A-006 | Price Text                | text   | 18793:26134, 26198    | Primary price lines (e.g. “US $69.99/mo”).                        | typography.desktop.body-large, color.content      | M-price-block, O-pricing-card                    |
| A-007 | Legal / Meta Text         | text   | 18793:26261           | Fine print and legal meta in footer and pricing.                  | typography.desktop.caption, color.content-muted   | O-footer, M-price-meta                           |
| A-008 | CTA Label                 | text   | 18793:25876, 26108    | Button labels (“Learn more”, “Watch video”, etc.).                | typography.desktop.label, color.content.knockout  | M-cta-button, O-hero-marquee, O-pricing-card     |
| A-009 | Nav Label                 | text   | 18793:25827–854       | Top‑nav item labels and dropdown triggers.                        | typography.desktop.nav, color.content.default     | M-nav-item, O-global-nav                         |
| A-010 | App Badge – Firefly      | icon   | 18793:25662, 26346    | Product logo badge for Adobe Firefly.                             | color.brand.firefly, size.icon-md                 | M-card-header, O-product-strip, O-pricing-card   |
| A-011 | App Badge – Creative Cloud| icon  | 18793:25722, 26193    | Product logo badge for Creative Cloud.                            | color.brand.cc, size.icon-md                      | M-card-header, O-product-strip, O-pricing-card   |
| A-012 | App Badge – Express       | icon   | 18793:26160, 26356    | Product logo badge for Adobe Express.                             | color.brand.express, size.icon-md                 | M-card-header, O-product-strip, O-pricing-card   |
| A-013 | App Badge – Acrobat       | icon   | 18793:26130, 26377    | Product logo badge for Acrobat.                                   | color.brand.acrobat, size.icon-md                 | M-card-header, O-product-strip, O-pricing-card   |
| A-014 | Caret / Dropdown Icon     | icon   | 18793:25830, 25724    | Small chevron used in nav items and card headers.                 | icon.caret.down, color.content.default            | M-nav-item, M-card-header, O-footer-links        |
| A-015 | Carousel Dot              | shape  | 18793:25805–10        | Dot + bar progress indicator near footer or hero bands.           | color.ui.dot-active/inactive                      | M-carousel-progress, O-carousel                  |
| A-016 | Hero Media Surface        | shape  | 18793:25702–703       | Rounded rectangle or image mask for hero background.              | radii.lg, shadow.hero, color.image-surface        | O-hero-marquee                                   |
| A-017 | Card Surface              | shape  | 18793:26191, 26425    | Card background rectangles in pricing and editorial grids.        | radii.md, elevation.card, color.surface.card      | O-pricing-card, O-editorial-card, O-solutions    |
| A-018 | Divider / Rule            | line   | 18793:25628           | Thin rules (e.g., slider line in UI overlay).                     | border.width.sm, color.border-subtle              | M-slider, M-ui-overlay                           |
| A-019 | Avatar / User Glyph       | icon   | 18793:25860–261       | Avatar placeholder icon in nav utility.                           | size.icon-sm, color.avatar                        | M-nav-utility-cluster                            |
| A-020 | Cursor Pointer            | icon   | 18793:25946, 26407    | Cursor pointer overlay used in demo imagery.                      | size.icon-md, color.cursor                        | O-demo-shot, O-solutions-demo                    |
```
