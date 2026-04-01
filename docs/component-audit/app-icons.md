# App Icons Library

**Status:** Canonical source of truth documented. Local SVG copies are removed. Use the upstream library for every new surface.

> Default app icon = **Experience Cloud.** Per radley's guidance we do **not** set preferred instances for each product. Designers pick the latest tile directly from the library, and engineering falls back to the Experience Cloud icon when no slug is supplied.

## Design source of truth

- **Primary file:** [App Icons Library](https://www.figma.com/design/8or0zCnGc5fiTnQ1NeIRnh/App-Icons-Library?node-id=0-1) (shared Figma library w/ publish rights).
- **Deprecated component:** `AppIcon` in [S2A — Foundations](https://www.figma.com/design/eGSyBcD5XdFXR8rJXJmVNY/S2A---Foundations?node-id=3346-130118). Do not edit or duplicate this node — the assets now live exclusively in the App Icons Library file.
- **How to consume in Figma:** enable the "App Icons Library" in Assets → Libraries, then insert the desired `App Tile / {Product} / {Size}` instance. All tiles share the same corner radius and live on the 4px grid.

## Front-end implementation

- **CDN base URL:** `https://www.adobe.com/content/dam/shared/images/product-icons/svg`
- **Component:** `packages/components/src/app-icon/app-icon.js` loads icons directly from the CDN. No SVGs ship with the repo anymore.
- **Do not color shift or add dropshadows.** The SVGs include the correct gradients per brand.

### Size guide

| Size prop | px  | Use case                                                            |
| --------- | --- | ------------------------------------------------------------------- |
| `xs`      | 16px | Inline badges, extra-dense metadata, table rows                   |
| `sm`      | 18px | Compact horizontal lockups, toolbar controls                      |
| `md`      | 24px | **Default.** ProductLockup (all orientations), RouterMarquee tabs |
| `lg`      | 32px | Panel headers, feature-list callouts, hero summaries              |

### ProductLockup integration

Use `AppIcon` with orientation-aware size selection:

```js
import { AppIcon } from "../app-icon/app-icon.js";

// Default usage (both orientations) — 24px
AppIcon({ app: "creative-cloud", size: "md" })

// Custom dense rows — 18px
AppIcon({ app: "creative-cloud", size: "sm" })
```

Do **not** pass a raw `<img>` pointing at the CDN. Always use the `AppIcon` component so sizing tokens, lazy-loading, and accessibility attributes are applied consistently.

### Supported mappings

#### Cross Cloud

| slug              | Product label              | CDN filename              |
| ----------------- | -------------------------- | ------------------------- |
| `creative-cloud`  | Adobe Creative Cloud       | `creative-cloud.svg`      |
| `experience-cloud`| Adobe Experience Cloud     | `experience-cloud.svg`    |
| `document-cloud`  | Adobe Document Cloud       | `document-cloud.svg`      |
| `stock`           | Adobe Stock                | `stock.svg`               |
| `fonts`           | Adobe Fonts                | `fonts.svg`               |
| `behance`         | Adobe Behance              | `behance.svg`             |
| `portfolio`       | Adobe Portfolio            | `portfolio.svg`           |

#### Gen AI

| slug          | Product label    | CDN filename      |
| ------------- | ---------------- | ----------------- |
| `firefly`     | Adobe Firefly    | `firefly.svg`     |
| `gen-studio`  | Adobe GenStudio  | `gen-studio.svg`  |

#### Adobe Express

| slug      | Product label  | CDN filename      |
| --------- | -------------- | ----------------- |
| `express` | Adobe Express  | `cc-express.svg`  |

#### Document Cloud

| slug           | Product label          | CDN filename          |
| -------------- | ---------------------- | --------------------- |
| `acrobat-pro`  | Adobe Acrobat Pro      | `acrobat.svg`         |
| `acrobat-pdf`  | Adobe Acrobat Reader   | `acrobat-reader.svg`  |
| `acrobat-sign` | Adobe Acrobat Sign     | `sign.svg`            |
| `scan`         | Adobe Scan             | `scan.svg`            |

#### Digital Imaging

| slug                | Product label              | CDN filename              |
| ------------------- | -------------------------- | ------------------------- |
| `photoshop`         | Adobe Photoshop            | `photoshop.svg`           |
| `lightroom`         | Adobe Lightroom            | `lightroom.svg`           |
| `lightroom-classic` | Adobe Lightroom Classic    | `lightroom-classic.svg`   |
| `fresco`            | Adobe Fresco               | `fresco.svg`              |

#### DVA (Digital Video & Audio)

| slug                 | Product label              | CDN filename              |
| -------------------- | -------------------------- | ------------------------- |
| `premiere-pro`       | Adobe Premiere Pro         | `premiere.svg`            |
| `after-effects`      | Adobe After Effects        | `after-effects.svg`       |
| `audition`           | Adobe Audition             | `audition.svg`            |
| `character-animator` | Adobe Character Animator   | `character-animator.svg`  |
| `media-encoder`      | Adobe Media Encoder        | `media-encoder.svg`       |
| `premiere-rush`      | Adobe Premiere Rush        | `rush.svg`                |

#### Print & Publishing

| slug           | Product label       | CDN filename      |
| -------------- | ------------------- | ----------------- |
| `illustrator`  | Adobe Illustrator   | `illustrator.svg` |
| `indesign`     | Adobe InDesign      | `indesign.svg`    |
| `incopy`       | Adobe InCopy        | `incopy.svg`      |
| `bridge`       | Adobe Bridge        | `bridge.svg`      |
| `animate`      | Adobe Animate       | `animate.svg`     |
| `dreamweaver`  | Adobe Dreamweaver   | `dreamweaver.svg` |

#### 3D & AR

| slug           | Product label        | CDN filename        |
| -------------- | -------------------- | ------------------- |
| `substance-3d` | Adobe Substance 3D   | `substance-3d.svg`  |
| `dimension`    | Adobe Dimension      | `dimension.svg`     |
| `aero`         | Adobe Aero           | `aero.svg`          |

#### Experience Cloud

| slug                  | Product label                          | CDN filename                      |
| --------------------- | -------------------------------------- | --------------------------------- |
| `experience-platform` | Adobe Experience Platform              | `experience-platform.svg`         |
| `experience-manager`  | Adobe Experience Manager               | `experience-manager.svg`          |
| `analytics`           | Adobe Analytics                        | `analytics.svg`                   |
| `campaign`            | Adobe Campaign                         | `campaign.svg`                    |
| `customer-journey`    | Adobe Customer Journey Analytics       | `customer-journey-analytics.svg`  |
| `real-time-cdp`       | Adobe Real-Time CDP                    | `real-time-cdp.svg`               |
| `journey-optimizer`   | Adobe Journey Optimizer                | `journey-optimizer.svg`           |
| `target`              | Adobe Target                           | `target.svg`                      |
| `marketo`             | Adobe Marketo Engage                   | `marketo.svg`                     |
| `workfront`           | Adobe Workfront                        | `workfront.svg`                   |

> Need an icon that is not listed? Grab the CDN filename from the App Icons Library file and add a row to the table above before using it in code.

## Sizing + spacing guidance

- Tiles should stay square and align to the layout grid. Use 8px-based spacing between the tile and accompanying copy (e.g., RouterMarquee body uses `var(--s2a-spacing-xs, 8px)`).
- The icon graphic already includes padding. Do not add strokes, tint overlays, or scale the internal glyphs.
- When icons are paired with text (Product Lockup, Card stories) set `aria-hidden="true"` on the icon wrapper and keep the actual product name in live text for accessibility.
- **Horizontal ProductLockup** (nav tabs, inline rows): use `size="md"` (24px). The icon sits flush with the label baseline at the 8px gap.
- **Vertical ProductLockup** (tile grids, stacked cards): matt-atoms currently ships the same 24px tile. Pass `iconSize` manually if a future spec calls for 32px+ tiles.

## Migration checklist

- [x] Remove repo-hosted SVGs (formerly under `packages/components/src/app-icon/assets`).
- [x] Update the AppIcon component to proxy the CDN.
- [x] Expand APP_LIBRARY to full catalog (40+ entries across all Figma library categories).
- [ ] Add `xl` (40px) size for vertical/tile ProductLockup when design requires it (current matt-atoms spec sticks with 24px).
- [x] Publish this doc + point Storybook docs to it.
- [ ] Update the S2A Figma file description to point to the App Icons Library (manual action for design team).
