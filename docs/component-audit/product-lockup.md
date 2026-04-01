## Component Audit · Product Lockup

This doc captures the product/brand identifier pattern used across cards, navigation, and feature sections. Product Lockup combines an app icon tile with a label in a consistent layout.

---

## 1. Component Overview

| ID  | Component        | Level    | Semantics (HTML)   | Description                                                          |
| --- | ---------------- | -------- | ------------------ | -------------------------------------------------------------------- |
| P-1 | Product Lockup   | Molecule | `<div>` / `<span>` | Icon tile + product name label in horizontal or vertical orientation |

Notes:

- **Product Lockup** is a reusable identifier pattern for Adobe products (Firefly, Creative Cloud, Acrobat, etc.).
- The icon is an **AppIcon** tile loaded from the Adobe CDN — see [App Icons Library doc](./app-icons.md) for the full slug catalog.
- Used in cards, navigation items, feature lists, and pricing sections.

---

## 2. Variants

### 2.1 Product Lockup (P-1)

| Axis/Prop       | Values                                    | Notes                                                                 |
| --------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| `app`           | any slug from app-icons                   | Maps to an App Icons Library tile via the `AppIcon` component.        |
| `label`         | `string`                                  | Product text (e.g., "Firefly", "Creative Cloud").                    |
| `orientation`   | `horizontal`, `vertical`                  | Drives flex axis, icon size, and caret visibility.                    |
| `styleVariant`  | `label`, `eyebrow`                        | Controls typography (14px vs 16px, tracking, line-height).            |
| `context`       | `on-light`, `on-dark`                     | Swaps between `contentDefault` and `contentKnockout` token colors.    |
| `width`         | `hug`, `fill`                             | `fill` lets the label truncate within a parent grid column.          |
| `showIconStart` | `boolean`                                 | Toggle the leading AppIcon (aliased to `showIcon` for legacy code).   |
| `showIconEnd`   | `boolean` (horizontal only)               | Toggles the caret arrow at the end of the label row.                  |
| `iconSize`      | `xs`, `sm`, `md`, `lg` (optional)         | Overrides the AppIcon tile size; matt-atoms defaults to md (24px) regardless of orientation. |

**Orientation behavior:**

| Orientation  | Flex direction | Icon size | Container gap | Caret     |
| ------------ | -------------- | --------- | ------------- | --------- |
| `horizontal` | row            | `md` 24px | `16px (md)`   | governed by `showIconEnd` (default true) |
| `vertical`   | column         | `md` 24px | `12px (sm)`   | hidden regardless of `showIconEnd`      |

**Style Variant behavior:**

| Style      | Font tokens                                        | Notes                                        |
| ---------- | -------------------------------------------------- | -------------------------------------------- |
| `label`    | `font-size-sm` (14px), `font-line-height-2xs`      | Uppercased? No — sentence case bold label.   |
| `eyebrow`  | `font-size-md` (16px), `font-line-height-sm`       | Includes tight tracking (-0.2px primitive).  |

Both styles use `font-family-default` + `font-weight-adobe-clean-bold`.

---

## 3. Implementation

### AppIcon integration

Always use the `AppIcon` component — never raw `<img>` tags pointing at the CDN. Orientation automatically picks the correct size, but you can override via the `iconSize` prop when needed:

```js
import { AppIcon } from "../app-icon/app-icon.js";

// Horizontal — inline nav, RouterMarquee tabs
AppIcon({ app: "creative-cloud", size: "md" }); // 24px

// Vertical — tile grid, stacked card body
AppIcon({ app: "creative-cloud", size: "md" }); // 24px
```

### Layout integration example

`ProductLockup` is used inside RouterMarquee, hero tiles, inline feature lists, and footer grids. When the shell needs to stretch to a grid column, set `width="fill"` so truncation happens automatically within the container:

```js
import { ProductLockup } from "../product-lockup/product-lockup.js";

// Horizontal label lockup with caret (default RouterMarquee tab)
ProductLockup({ label: "Creative Cloud", app: "creative-cloud" });

// Vertical eyebrow lockup for tiles
ProductLockup({
  label: "Customer journeys",
  app: "experience-platform",
  orientation: "vertical",
  styleVariant: "eyebrow",
});

// Full-width inline lockup that truncates within a grid column
ProductLockup({ label: "PDF and productivity", width: "fill" });
```

### Accessibility

- Wrap the `AppIcon` in `aria-hidden="true"` whenever the product name is in adjacent live text.
- The product name label is the accessible name for the lockup — no separate `aria-label` needed on the icon.
- See [App Icons Library doc](./app-icons.md#accessibility) for full guidance.

Interaction + caret rules:

- **Wrap the lockup in a semantic element** (`<a>` for navigation, `<button>` for in-page actions). ProductLockup itself is purely visual and does not emit focus styles.
- **Caret visibility signals interactivity.** Leave the caret on when the wrapper is clickable and toggle `showIconEnd=false` for decorative/static use.
- The wrapper owns the focus ring — use the standard `s2a/color/focus-ring/default` treatment described in `docs/design-system/tokens`.

When `showIconStart=false`, the label supplies both the visual and accessible name; no extra handling is required.

---

## 4. Figma

- **App tiles:** enable "App Icons Library" in Assets → Libraries, insert `App Tile / {Product} / {Size}`.
- **Orientation prop:** `ProductLockup` in matt-atoms exposes `Orientation = horizontal | vertical`. Vertical reflows the layout (icon above text) while keeping the default 24px tile unless you override `iconSize`.
- See [App Icons Library doc](./app-icons.md) for the full catalog and size guidance.
