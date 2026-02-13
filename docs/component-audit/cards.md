## Component Audit · Cards

This doc captures the card‑shaped surfaces in the redesign: informational tiles, app cards, pricing cards, and carousel slides.  
Goal: define a small, composable set of card components and variant axes that we can implement once and reuse across the system.

**Composition Note:** Cards are built from smaller components documented in:

- **Media & Scrim** (`media-scrim.md`) — for cards with background images/videos
- **Product Lockup** (`product-lockup.md`) — for app/product identifiers
- **Button** (`buttons-and-links.md`) — for CTAs and interactive triggers
- **Select** (`select.md`) — for filter/selection controls within cards

---

## 1. Component Overview

| ID  | Component          | Level    | Semantics (HTML)      | Description                                                                |
| --- | ------------------ | -------- | --------------------- | -------------------------------------------------------------------------- |
| C-1 | Card / Text        | Molecule | `<section>` / `<div>` | Copy‑only card: label, headline, body (desktop + mobile variants).         |
| C-2 | Card / App         | Molecule | `<a>` / `<button>`    | App/product card with icon, label, description, optional chevron/CTA.      |
| C-3 | Card / App Nav     | Molecule | `<button>` / `<a>`    | Compact app card used in routers/nav lists with active bar + CTA text.     |
| C-4 | Card / Feature     | Molecule | `<article>`           | Feature/benefit card: icon chip + heading + subcopy + inline CTA.          |
| C-5 | Card / Pricing     | Organism | `<article>`           | Pricing plan card: product ID strip, plan info, price, CTAs, feature list. |
| C-6 | Card / App Tile    | Molecule | `<a>`                 | Small app tile: icon + heading + subheadline, used in grids.               |
| C-7 | Card / Media Slide | Organism | `<article>`           | Carousel slide / media card: image + scrim + stacked headline + CTA.       |

Notes:

- **Links vs buttons**: cards that navigate should use an outer `<a>`; cards that toggle in‑page panels (e.g., router selections) can be `<button>`.
- **Interactive vs static**: all of these can share a base `Card` surface token set; interaction (hover/pressed/selected) is layered on top per component.
- **Mobile vs Desktop**: All cards have responsive variants; mobile typically uses tighter spacing, smaller media, and stacked layouts.

---

## 2. Variants by Component

### 2.1 Card / Text (C-1)

Source Figma frames: `Frame 2087327641` (375×264), `Frame 2087327640` (375×229), hero‑band copy.

**Composition:** Pure text content card; no sub-components. Uses typography tokens for label, headline, and body text.

**Sub-components used:**

- None (text-only card)

| Axis    | Values                     | Notes                                                                    |
| ------- | -------------------------- | ------------------------------------------------------------------------ |
| size    | `sm`, `md`, `lg`           | `sm` = mobile compact, `md` = mobile standard, `lg` = desktop wide band. |
| density | `default`, `comfortable`   | Controls vertical padding around label/head/body.                        |
| surface | `default`                  | Uses base surface tokens; no on‑media variant here.                      |
| content | `label+H1+body`, `H1+body` | Optional label row; headline + body always present.                      |
| state   | `static`                   | No hover/active; behaves as non‑interactive content.                     |

**Mobile vs Desktop:**

- **Mobile**: `size: sm` or `md` (375px width), `density: default` (tighter padding), single column layout.
- **Desktop**: `size: lg` (up to 1440px width), `density: comfortable` (more padding), can span multiple columns.

**Intended usage:**

- Section intros, descriptive callouts, and hero supporting copy blocks.
- Not clickable by default; if made interactive, should be composed with `Button` or `Link` patterns.

---

### 2.2 Card / App (C-2)

Source Figma frames: `Frame 2087327918`, `Card` with app icon, label text, eyebrow lines, chevron.

**Composition:** Built from smaller components arranged horizontally.

**Sub-components used:**

- **Product Lockup (P-1)** — app icon + product name label (required)
- **Button / Icon-only (B-4)** — chevron icon for navigation (optional, when `CTA: chevron`)

| Axis      | Values                       | Notes                                                                                                         |
| --------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| layout    | `horizontal`                 | Icon on left, text stack in middle, chevron on right.                                                         |
| media     | `icon`                       | Uses **Product Lockup (P-1)** component; icon size `sm` or `md` (16–24px), provided via instance swap.        |
| density   | `compact`, `standard`        | Compact = tighter vertical padding; standard = roomier copy.                                                  |
| selection | `default`, `hover`, `active` | Active may be indicated via underline bar or background change.                                               |
| surface   | `default`, `on-media`        | On‑media variant used when card sits on image/video surfaces.                                                 |
| CTA       | `chevron`, `none`            | Chevron indicates navigation; may be omitted in some contexts. Uses **Button / Icon-only (B-4)** for chevron. |

**Mobile vs Desktop:**

- **Mobile**: `density: compact`, `media: icon` at `sm` size (16px), tighter horizontal padding, may stack vertically in grids.
- **Desktop**: `density: standard`, `media: icon` at `md` size (24px), more horizontal padding, horizontal grid layouts.

**Intended usage:**

- App discovery cards in grids or sections (“Firefly”, “Photoshop”, etc.).
- Semantics: `<li><a class="c-card c-card--app">…</a></li>` inside a `<ul>` or `<nav>`.

---

### 2.3 Card / App Nav (C-3)

Source Figma frames: `Card 6` (220×67) with Product ID, app icon, label, CTA text + chevron, active underline bar.

**Composition:** Built from smaller components arranged horizontally with active state indicator.

**Sub-components used:**

- **Product Lockup (P-1)** — app icon + product name label (required)
- **Nav / Text + Chevron (B-3)** — small text link with trailing chevron (required, when `CTA: text+chevron`)

| Axis      | Values                       | Notes                                                                               |
| --------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| layout    | `horizontal`                 | Compact row with icon, label, and small CTA text.                                   |
| media     | `icon`                       | Uses **Product Lockup (P-1)** component; icon size `sm` (18px).                     |
| selection | `default`, `hover`, `active` | Active = bottom bar visible (4px height); used to reflect current router selection. |
| surface   | `default`, `on-media`        | On‑media when over image/video; typically transparent/ghost surface.                |
| CTA       | `text+chevron`               | Small text label with chevron; uses **Nav / Text + Chevron (B-3)** component.       |

**Mobile vs Desktop:**

- **Mobile**: `layout: horizontal` but may wrap to vertical if space is tight; `media: icon` at `xs` or `sm` (16–18px), compact padding.
- **Desktop**: `layout: horizontal` always, `media: icon` at `sm` (18px), standard padding, horizontal scrolling list.

**Intended usage:**

- Horizontal router rows in heroes or nav surfaces (“Products” panel app list).
- Often paired with a separate content area that updates when the card is active.

---

### 2.4 Card / Feature (C-4)

Source Figma frames: `Frame 2087327748` (327×491), `Frame 2087327640` with icon chip + headline + copy + CTA.

**Composition:** Built from smaller components arranged vertically with optional header and CTA.

**Sub-components used:**

- **Product Lockup (P-1)** — app icon + product name (optional, when `header: icon+label`)
- **Button (B-1)** — primary or secondary CTA button (optional, when `CTA: button`)
- **Nav / Text + Chevron (B-3)** — inline text link with chevron (optional, when `CTA: link+chevron`)

| Axis    | Values                           | Notes                                                                        |
| ------- | -------------------------------- | ---------------------------------------------------------------------------- |
| header  | `icon+label`, `label-only`       | Optional **Product Lockup (P-1)** component (24px icon); can be label only.  |
| media   | `none`, `illustration`           | Content slot may host illustration/embedded frame (not **Media** component). |
| density | `default`, `comfortable`         | Controls padding and spacing between header, body, CTA.                      |
| CTA     | `link+chevron`, `button`, `none` | Uses **Nav / Text + Chevron (B-3)** or **Button (B-1)** component.           |
| state   | `default`, `hover`               | Subtle elevation/shadow or border change on hover.                           |

**Mobile vs Desktop:**

- **Mobile**: `density: default` (tighter padding), `header: label-only` often (no icon to save space), `CTA: link+chevron` (compact), single column.
- **Desktop**: `density: comfortable`, `header: icon+label` (full **Product Lockup**), `CTA: button` or `link+chevron`, can be in multi-column grid.

**Intended usage:**

- Feature/benefit cards in sections like “What you can do with …” or app overview panels.
- Semantics: `<article class="c-card c-card--feature">…</article>`.

---

### 2.5 Card / Pricing (C-5)

Source Figma frames: `Prcing Cards` → `Card` (327×450) with Product ID, plan info, price, CTAs, and hidden expando panel.

**Composition:** Built from multiple smaller components arranged vertically with expandable details section.

**Sub-components used:**

- **Product Lockup (P-1)** — product icon + product name label (required, in header)
- **Button (B-1)** — primary CTA button (required, `kind: primary`)
- **Button (B-1)** — secondary CTA button (optional, when `CTAs: primary+secondary`, `kind: secondary`)
- **Accordion (A-1)** — expandable feature list (optional, when `details: summary+expanded`)

| Axis     | Values                              | Notes                                                                                   |
| -------- | ----------------------------------- | --------------------------------------------------------------------------------------- |
| state    | `default`, `hover`, `selected`      | Selected used for emphasized/featured plan; may alter border/surface.                   |
| emphasis | `standard`, `featured`              | Featured plan can have stronger outline, shadow, or badge.                              |
| density  | `default`, `compact`                | Controls vertical spacing in benefits list.                                             |
| CTAs     | `primary+secondary`, `primary-only` | One or two stacked **Button (B-1)** components (`kind: primary` and `kind: secondary`). |
| details  | `summary-only`, `summary+expanded`  | Expanded state uses **Accordion (A-1)** component for feature list / plan breakdown.    |
| surface  | `default`, `on-media`               | Allows for flexible usage on different backgrounds.                                     |

**Mobile vs Desktop:**

- **Mobile**: `density: compact`, `CTAs: primary-only` (single CTA to save space), `details: summary-only` (expanded panel may be hidden or in modal), single column stack.
- **Desktop**: `density: default`, `CTAs: primary+secondary` (two stacked buttons), `details: summary+expanded` (inline expansion), multi-column grid (2–3 columns).

**Intended usage:**

- Pricing/plan comparison grids, especially in Plans & Pricing sections.
- Semantics: `<article class="c-card c-card--pricing" aria-selected="true|false">…</article>`.

---

### 2.6 Card / App Tile (C-6)

Source Figma frames: small `Card` with app icon + H3 headline + subheadline (175.5×172).

**Composition:** Built from smaller components arranged vertically in compact layout.

**Sub-components used:**

- **Product Lockup (P-1)** — app icon + product name label (required, in vertical layout)

| Axis    | Values             | Notes                                                                                               |
| ------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| layout  | `vertical`         | Icon top, text stack below.                                                                         |
| media   | `icon`             | Uses **Product Lockup (P-1)** component; icon size `md` or `lg` (32px), provided via instance swap. |
| density | `compact`          | Tight vertical spacing to work in dense grids.                                                      |
| state   | `default`, `hover` | Hover may raise card or change border/surface.                                                      |

**Mobile vs Desktop:**

- **Mobile**: `layout: vertical`, `media: icon` at `md` (24px), `density: compact`, 2-column grid.
- **Desktop**: `layout: vertical`, `media: icon` at `lg` (32px), `density: compact`, 3–4 column grid.

**Intended usage:**

- Dense app grids, “More apps” sections, or sidebar promo tiles.
- Semantics: `<a class="c-card c-card--tile">…</a>` inside a grid or list.

---

### 2.7 Card / Media Slide (C-7)

Source Figma frames: `Active Slide` (327×542) with background image, scrim, stacked headline, and CTA.

**Composition:** Built from media components with overlaid content and CTA.

**Sub-components used:**

- **Media (M-1)** — background image or video container (required)
- **Scrim (M-2)** — overlay for text readability (required, overlays **Media**)
- **Button (B-1)** — CTA button (optional, when `CTA: button`, `kind: secondary`, `background: outlined` or `glass`, `surface: on-media`)

| Axis    | Values               | Notes                                                                                                       |
| ------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| media   | `image`, `video`     | Uses **Media (M-1)** component; `aspectRatio: 3:2` or `16:9`, `objectFit: cover`.                           |
| scrim   | `dark`, `medium`     | Uses **Scrim (M-2)** component; `intensity: dark` or `medium`, `gradient: bottom`, `color: black`.          |
| surface | `on-media`           | Always uses on‑media tokens (scrim, knockout text).                                                         |
| density | `default`, `compact` | Controls padding within content overlay.                                                                    |
| CTA     | `button`, `none`     | Uses **Button (B-1)** component; `kind: secondary`, `background: outlined` or `glass`, `surface: on-media`. |
| state   | `active`, `inactive` | Active slide fully opaque; inactive may be dimmed/scaled.                                                   |

**Mobile vs Desktop:**

- **Mobile**: `media: aspectRatio: 1:1` or `4:3`, `scrim: intensity: dark` (stronger contrast), `density: compact`, `CTA: button` (smaller size), single slide visible.
- **Desktop**: `media: aspectRatio: 16:9` or `3:2`, `scrim: intensity: medium` (subtle), `density: default`, `CTA: button` (standard size), may show multiple slides or larger single slide.

**Intended usage:**

- Carousel slides or large promo cards with immersive media and overlaid copy.
- Semantics: `<article class="c-card c-card--media-slide" role="group">…</article>` within a carousel region.

---

## 3. Open Questions / TODOs

- Confirm which of these card types are **first‑class components** vs. compositions of a single, highly flexible `Card` base.
- Decide how **selection state** for Card / App Nav and Card / Pricing interacts with router/URL state (e.g. use `aria-current` vs. `aria-selected`).
- Define a shared **card surface token set** (`radius`, `shadow`, `border`, `padding`) and how each card type maps to it.
- Document exact breakpoint values where cards switch from mobile to desktop layouts (e.g., `768px`, `1024px`).
- Create design tokens for card spacing, borders, and shadows that work across all card variants.
- Determine if Card / Pricing expanded details should use **Accordion (A-1)** component or a custom expand/collapse pattern.
