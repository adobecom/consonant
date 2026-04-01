# Homepage Redesign Reference

**Figma file:** matt-atoms (`VzgMxhyI2ehYt3yitmlBXk`)
**Node:** `3119:3460` — "Home - 1441+"
**Direct URL:** https://www.figma.com/design/VzgMxhyI2ehYt3yitmlBXk/matt-atoms?node-id=3119-3460
**Captured:** March 2026
**Canvas size:** 1920 × 7974px

---

## Page sections

### Frame 1 — Hero + Router (`3119:3461`, y=0, h=4901)

#### GlobalNav
- Adobe wordmark left, nav links (Products, Use Cases, Solutions, Learn & Support, Plans), Sign In CTA right
- Light/knockout context on dark hero background

#### Hero — Acrobat focus
- Dark full-bleed background with photo
- Eyebrow: product name ("Acrobat")
- H1: "Get documents done. Faster." — large Black weight
- Body copy: 2–3 line description
- Two CTAs: "Learn more" (outlined) + "Explore plans" (transparent/text)
- Hero image: tablet showing Acrobat document

#### RouterMarquee — Category nav strip
- Horizontal scrollable strip of product category tiles
- Each tile: **app icon (ProductLockup) + category label + caret**
- Categories visible: Creativity and design, Content creation, PDF and productivity, Adobe for Business, Students and teachers
- Active/selected state: "PDF and productivity" highlighted
- **Component used: `.ProductLockup` — horizontal, label style, show icon=true**

#### "Everything you need to make anything" — Workflow section
- Eyebrow: "Optimized Workflows"
- H2: large, centered
- Subtext: 1–2 line description
- 5-column card grid — each card:
  - ProductLockup at top (app icon + label, no caret — show icon=false)
  - Hero image
  - Short headline
  - 2-line body copy
  - "Explore ›" text link

#### "Explore what's new" — Features section
- Eyebrow: "Features and Releases"
- H2 centered
- Featured card (full-width, dark): large product screenshot + feature headline + body + "Explore Firefly ›" CTA
- 3-column sub-grid: medium cards with product image + headline + body + "Explore [Product] ›" link
  - Each card has a small app icon badge top-left (`.ProductLockup` icon-only / no label)

#### Testimonial / Quote carousel
- Full-bleed photo background (dark)
- Large pull quote in white
- Attribution: name + title
- CTA button: "Create with Firefly"
- Carousel dots below

#### Adobe News — 3-column editorial
- Small eyebrow: "Adobe News"
- 3 article cards: headline + 2-line body + "Read story ›" link

---

### Frame 2 — Product Router and Footer (`3119:3817`, y=4869, h=3105)

#### "Tools that work for you" — Product router (dark/inverse)
- Full-bleed dark photo background (warm interior scene)
- H2: "Tools that work for you." — white, centered
- Body: short description
- CTA: "See all products" (outlined, on-dark)
- Feature: laptop/monitor mockup showing Creative Cloud

#### Product grid — 3×3 dark tiles
- Dark background (#1a1a1a approx), rounded card tiles
- **Each tile: `.ProductLockup` — vertical orientation, label style, show icon=false (no caret)**
  - App icon top (larger display — ~40px implied)
  - Product name bold
  - 2-line description body text
- Products: Firefly, Adobe Acrobat, Photoshop, Premiere, Creative Cloud, GenStudio for Performance Marketing, Business Products, Illustrator, All products (arrow CTA tile)
- **This is the primary use case for `Orientation=vertical` variants**
- **Inverse/dark surface — needs `on-dark` token variants**

#### Footer
- Dark background
- 6-column link grid: For individuals & small business, For medium & large business, For Organizations, Support, Contact, Adobe
- "Featured Products" row with small ProductLockup instances (icon + label, horizontal, no caret)
- Legal row: region selector, copyright, privacy links, AdChoices, Adobe logo
- Social icons: Facebook, LinkedIn, Instagram, X
- Footer wordmark: massive "Adobe" in white (display/super typography)

---

## Component usage inventory

| Component | Where used | Variant needed |
|---|---|---|
| `.ProductLockup` | RouterMarquee category strip | Orientation=horizontal, Show Icon=true, Style=label |
| `.ProductLockup` | Workflow section card headers | Orientation=horizontal, Show Icon=false, Style=label |
| `.ProductLockup` | Feature card app badge | Icon only (no label variant?) |
| `.ProductLockup` | Product grid tiles | Orientation=vertical, Show Icon=false, Style=label — **inverse/on-dark** |
| `.ProductLockup` | Footer featured products | Orientation=horizontal, Show Icon=false, Style=label — small/compact |
| `GlobalNav` | Page top | Light + dark contexts |
| `Button` | Hero CTAs, feature CTAs | Outlined on-dark, transparent on-dark |
| `RouterMarquee` | Category strip | Horizontal scroll, 5+ tiles |

---

## Gaps / recommendations spotted

- **`.ProductLockup` needs an inverse (on-dark) token set** — the product grid tiles sit on a dark `#1a1a1a` surface. Current component uses `contentDefault` which is dark text — will be invisible on dark backgrounds.
- **Vertical variant icon size** — in the product grid tiles, the app icon renders larger than 24×24 (looks ~40–48px). Consider a `Size` property on the icon container (small=24, medium=40, large=48) or expose icon container size.
- **`.ProductLockup` icon-only variant** — feature card badges in "Explore what's new" show just the app icon with no label or caret. A `Style=icon-only` variant may be needed.
- **RouterMarquee active/selected state** — the category strip highlights the selected tile. `.ProductLockup` may need a `State=selected` or this is handled at the RouterMarquee level.
- **Footer compact variant** — footer ProductLockup instances look smaller (label may be caption-size). Could be handled by the `Style=eyebrow` variant or a dedicated compact size.

---

## Design language notes

- **Typography scale**: super/display weight (Black) for H1/H2, Regular for body, Bold for UI labels
- **Dark surfaces** are prominent (hero, product grid, footer) — inverse token support critical
- **Spacing**: generous whitespace between sections (~80–120px vertical gaps)
- **Cards**: rounded corners (~12–16px), subtle shadow or border on light surfaces, no border on dark
- **CTAs on dark**: outlined style preferred over solid for secondary actions
- **App icons**: always rounded-square format, rendered at consistent size per context
