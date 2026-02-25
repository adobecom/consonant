## A.com Home – Component Taxonomy

Working draft of atoms, molecules, and organisms for the A.com home redesign, across all breakpoints. Names are **proposed** and meant to be refined in a naming workshop.

---

## 1. Hero Surface (`HeroSurface`)

### Organism
- **`HeroSurface`**  
  Visual container for hero media, scrim, and play/pause.

### Molecules
- **`HeroBackgroundMedia`**
  - Full‑bleed image or video (BG-Image, BizPro grid, etc.).
- **`HeroScrimOverlay`**
  - Gradient/solid overlay for text contrast.
- **`HeroPlayPauseControl`**
  - Circular play/pause button used in hero states and interactions frames.

### Atoms
- `Media/VideoOrImage-FullBleed`
- `Scrim/Hero-Overlay`
- `Control/CircleButton-40`
- `Icon/Play-5x8` (future `Icon/Pause` variant)

---

## 2. Hero Content (`HeroContent`)

### Organism
- **`HeroContent`**  
  Eyebrow, heading, body copy, and CTAs inside the hero.

### Molecules
- **`HeroEyebrow`**
  - Short line above the heading (e.g. “For individuals, students, and businesses”).
- **`HeroHeading`**
  - Large display headline; localized variants differ mostly in line count.
- **`HeroBody`**
  - Supporting paragraph(s) below the headline.
- **`HeroCTAGroup`**
  - One or two hero‑scale CTAs (primary + secondary).

### Atoms
- `Text/Eyebrow`
- `Text/HeroHeading-L`
- `Text/HeroBody-M`
- `Button/PrimaryHero-2XL`
- `Button/SecondaryHero-2XL`

---

## 3. Hero Router Strip (`HeroRouterStrip`)

### Organism
- **`HeroRouterStrip`**  
  Horizontal strip of product router tiles in the hero on desktop/tablet.

### Molecules
- **`HeroRouterTile`**
  - App avatar, label, and trailing chevron.
- **`HeroRouterTileActive`**
  - Active tile with underline and stronger scrim.
- **`HeroRouterStripContainer`**
  - Layout shell that includes the play/pause control and tile track.

### Atoms
- `Avatar/AppTile-18` (per app: Acrobat, Firefly, Creative Cloud, etc.)
- `Text/RouterLabel`
- `Icon/Chevron-Right-3x6`
- `Decoration/ActiveBar-96x4`
- `State/RouterTileActiveScrim`
- `Layout/HorizontalScroller`
- `Control/PlayPause-40` (shared with hero surface)

---

## 4. Hero Slide Nav (Mobile) (`HeroSlideNav`)

### Organism
- **`HeroSlideNav`**  
  Mobile slide selector row under the hero (Card 2/3/4/5).

### Molecules
- **`HeroSlideNavItem`**
  - App avatar, short label, chevron, and active underline.
- **`HeroSlideNavTrack`**
  - Horizontal track / scroller that holds multiple items.

### Atoms
- `Avatar/AppTile-18`
- `Text/SlideLabel`
- `Icon/Chevron-Right-3x6`
- `Decoration/SlideActiveBar`
- `Layout/HorizontalScroller`

---

## 5. AI Prompt in Hero (`HeroAIPrompt`)

### Organism
- **`HeroAIPrompt`**  
  Inline AI “Ask anything” input shown in the interactions hero.

### Molecules
- **`AIPromptInput`**
  - Left AI icon, placeholder text, and right send/mic icon in a single field.
- **`AIPromptLabel`**
  - Accessible label/helper text (sometimes visually hidden).

### Atoms
- `Icon/AIChat-26`
- `Icon/Send-20` (or `Icon/Mic-20` in voice variant)
- `Control/IconButton-32`
- `Field/HeroInputShell-56`
- `Text/InputPlaceholder`
- `Text/FieldLabel-SR`
- `Text/HelperText`

---

## 6. Section Heading Pattern (`SectionHeading`)

### Organism
- **`SectionHeading`**  
  Eyebrow + title + body copy used above many sections (“What’s new”, news, product grid, footer featured products).

### Molecules
- **`SectionEyebrow`**
- **`SectionTitle`**
- **`SectionBody`**

### Atoms
- `Text/SectionEyebrow`
- `Text/SectionTitle-L`
- `Text/SectionBody-M`

---

## 7. “What’s New” – Full Column (`WhatsNewFullColumn`)

### Organism
- **`WhatsNewFullColumn`**  
  Large feature highlight with media and bottom CTA row.

### Molecules
- **`FullColumnMedia`**
- **`FullColumnCopy`**
  - Headline, supporting text.
- **`FullColumnBottomCTA`**
  - Single line link with arrow (“Discover more”, etc.).

### Atoms
- `Media/FeatureImage-L`
- `Text/Headline-M`
- `Text/Subheadline-S`
- `Link/InlineCTA`
- `Icon/Chevron-Right-3x6`

---

## 8. “What’s New” – 3‑Up Cards (`WhatsNewCards3Up`)

### Organism
- **`WhatsNewCards3Up`**  
  Three cards with media top, copy middle, link bottom.

### Molecules
- **`WhatsNewCard`**
  - `CardMedia`
  - `CardCopy` (headline + subheadline)
  - `CardLink` (text + chevron)

### Atoms
- `Card/Shell`
- `Media/CardImage-M`
- `Text/CardHeadline`
- `Text/CardSubheadline`
- `Link/CardCTA`
- `Icon/Chevron-Right-3x6`

---

## 9. Carousel Section (`CarouselSection`)

### Organism
- **`CarouselSection`**  
  Large horizontal slides with inactive/active states, arrows, and pagination dots.

### Molecules
- **`CarouselSlide`**
  - Visual content + optional copy overlay.
- **`CarouselControls`**
  - Previous/next arrow buttons.
- **`CarouselPagination`**
  - Row of dots representing slides.

### Atoms
- `Media/CarouselImage-XL`
- `Control/ArrowButton-40`
- `Indicator/PaginationDot`
- `State/SlideActive`

---

## 10. News List (`NewsList`)

### Organism
- **`NewsList`**  
  Three‑up list of text news items.

### Molecules
- **`NewsHeader`**
  - App icon + “News” headline.
- **`NewsItem`**
  - Headline, subheadline, and CTA link.

### Atoms
- `Avatar/AppTile-24` (Experience Cloud icon)
- `Text/NewsHeadline`
- `Text/NewsSubheadline`
- `Link/NewsCTA`
- `Icon/Chevron-Right-3x6`

---

## 11. Product Hero (`ProductHero`)

### Organism
- **`ProductHero`**  
  App‑focused hero with fake in‑app UI frame and copy lockup.

### Molecules
- **`ProductHeroMedia`**
  - App frame with panels/toolbars and main canvas.
- **`ProductHeroCopy`**
  - Headline + body + CTA chip/button.

### Atoms
- `Media/AppScreenshot`
- `Frame/AppChrome`
- `Text/ProductHeroHeadline`
- `Text/ProductHeroBody`
- `Chip/CTA` or `Button/InlineCTA`

---

## 12. Product Grid (`ProductGrid`)

### Organism
- **`ProductGrid`**  
  Multi‑row grid of product tiles (Firefly, Acrobat, Creative Cloud, etc.).

### Molecules
- **`ProductGridCard`**
  - `ProductLockup` (existing component)
  - Headline + subheadline.

### Atoms
- `Component/ProductLockup` (external component)
- `Text/ProductCardHeadline`
- `Text/ProductCardSubheadline`

---

## 13. AI Band (`AIBand`)

### Organism
- **`AIBand`**  
  Section near the footer with copy and AI prompt row.

### Molecules
- **`AIBandCopy`**
  - Section heading + body.
- **`AIBandPrompt`**
  - Reuses `AIPromptInput` from `HeroAIPrompt`.

### Atoms
- `Text/AIBandHeading`
- `Text/AIBandBody`
- Reuse atoms from `HeroAIPrompt`.

---

## 14. Footer Columns (`FooterColumns`)

### Organism
- **`FooterColumns`**  
  Multi‑column link lists (“For individuals & small business”, “Support”, etc.).

### Molecules
- **`FooterColumn`**
  - Column heading + vertical list of links.

### Atoms
- `Text/FooterHeading`
- `Link/FooterNavItem`

---

## 15. Footer Bottom Row (`FooterBottom`)

### Organism
- **`FooterBottom`**  
  Region selector, legal text, and social icons.

### Molecules
- **`FooterRegionSelector`**
  - “Change region” label + caret or icon.
- **`FooterLegalGroup`**
  - © notice + legal links.
- **`FooterSocialIcons`**
  - Row of social network icons.

### Atoms
- `Text/FooterMeta`
- `Link/FooterMetaLink`
- `Icon/Region-Globe` (future)
- `Icon/Social-Twitter`
- `Icon/Social-Facebook`
- `Icon/Social-LinkedIn`
- `Icon/Social-Instagram`

---

## Notes for Naming Workshop

- **Blocks (organisms)** above should be validated against actual content strategy (e.g. whether “What’s New” and “Carousel Section” are separate patterns).
- **Molecules** are the main levers for API/prop design; consider where to introduce shared primitives (`NavPrimaryLink`, `HeroRouterTile`, `NewsItem`, `ProductGridCard`, etc.).
- **Atoms** should be mapped to existing tokens (typography, color, spacing) rather than introducing new primitives; any unavoidable primitives must be documented with the `Primitive:` comment pattern in component code, not here.

