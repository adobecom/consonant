## Component Audit · Product Lockup

This doc captures the product/brand identifier pattern used across cards, navigation, and feature sections. Product Lockup combines an icon/logo with a label in a consistent horizontal layout.

---

## 1. Component Overview

| ID  | Component        | Level    | Semantics (HTML) | Description                                                      |
| --- | ---------------- | -------- | ---------------- | ---------------------------------------------------------------- |
| P-1 | Product Lockup   | Molecule | `<div>` / `<span>` | Horizontal layout of product icon + product name label           |

Notes:

- **Product Lockup** is a reusable identifier pattern for Adobe products (Firefly, Creative Cloud, Acrobat, etc.).
- The icon/logo is swappable via **instance swap** in Figma (any product icon component).
- Used in cards, navigation items, feature lists, and pricing sections.

---

## 2. Variants by Component

### 2.1 Product Lockup (P-1)

Source Figma frames: `ProductLockup`, product identifiers in cards and nav items.

| Axis      | Values                        | Notes                                                                                    |
| --------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| icon      | instance swap                 | Product icon/logo component; swappable via Figma instance swap or React prop.           |
| iconSize  | `xs`, `sm`, `md`, `lg`        | Icon dimensions; `xs` = 16px, `sm` = 18px, `md` = 24px, `lg` = 32px/40px.              |
| label     | `string`                      | Product name text (e.g., "Firefly", "Creative Cloud", "Acrobat Studio").                |
| align     | `start`, `center`, `end`      | Horizontal alignment of icon + label within container.                                   |
| gap       | `xs`, `sm`, `md`              | Spacing between icon and label; `xs` = 8px, `sm` = 12px, `md` = 16px.                   |
| variant   | `default`, `compact`, `prominent` | Visual emphasis; `compact` = smaller icon/text, `prominent` = larger/bolder.            |

**Mobile vs Desktop:**

- **Mobile**: Often uses `iconSize: sm` or `md`, `gap: xs` or `sm` for tighter layouts.
- **Desktop**: Can use `iconSize: md` or `lg`, `gap: sm` or `md` for more spacious layouts.

**Intended usage:**

- Card headers, navigation items, feature lists, pricing plan identifiers.
- Always pairs icon + label horizontally; label should be semantically a `<span>` or text node, not a heading.

**Composition:**

- Product Lockup is often used inside:
  - **Card / App** headers
  - **Nav / Text + Chevron** items (as the label portion)
  - **Feature** sections (as product identifiers)

---

## 3. Open Questions / TODOs

- Define exact icon size tokens (`xs`, `sm`, `md`, `lg`) as design tokens.
- Document which product icons are available and their naming conventions.
- Determine if Product Lockup should support vertical layout (icon above label) or only horizontal.
- Create a mapping of product names to their canonical icon components.
