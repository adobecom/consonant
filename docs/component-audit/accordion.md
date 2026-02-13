## Component Audit · Accordion

This doc captures the accordion/disclosure component used for expandable content sections. Accordion allows users to show/hide content panels via trigger buttons.

---

## 1. Component Overview

| ID  | Component | Level    | Semantics (HTML) | Description                                                      |
| --- | --------- | -------- | ---------------- | ---------------------------------------------------------------- |
| A-1 | Accordion | Organism | `<div>` + `<button>` + `<div>` | Expandable/collapsible content sections with trigger buttons      |

Notes:

- **Accordion** is a disclosure pattern: clicking a trigger button expands/collapses a content panel.
- Uses ARIA attributes (`aria-expanded`, `aria-controls`) for accessibility.
- Can support single-item expansion (only one open at a time) or multi-item expansion (multiple open).
- Used in navigation menus, FAQ sections, and feature breakdowns.

---

## 2. Variants by Component

### 2.1 Accordion (A-1)

Source Figma frames: `accordion`, expandable navigation and content sections.

| Axis         | Values                        | Notes                                                                                    |
| ------------ | ----------------------------- | ---------------------------------------------------------------------------------------- |
| behavior     | `single`, `multiple`          | `single` = only one item open at a time (closes others), `multiple` = multiple items can be open. |
| trigger      | `button` (with icon)          | Trigger button for each accordion item; includes label + chevron icon.                   |
| icon         | `chevron-down` / `chevron-up` (instance swap) | Chevron rotates/flips when item is expanded; swappable icon component.                  |
| content      | `text`, `list`, `mixed`       | Content type in expanded panel; `text` = paragraphs, `list` = bulleted list, `mixed` = both. |
| spacing      | `compact`, `standard`, `spacious` | Vertical spacing between accordion items; `compact` = 8px, `standard` = 16px, `spacious` = 24px. |
| state        | `default`, `expanded`, `collapsed` | Per-item state; `expanded` = content visible, `collapsed` = content hidden.               |

**Mobile vs Desktop:**

- **Mobile**: Often uses `spacing: compact` for tighter layouts; may default to `behavior: single` for simpler interaction.
- **Desktop**: Can use `spacing: standard` or `spacious`; supports `behavior: multiple` for richer content exploration.

**Intended usage:**

- Navigation menus (product categories, support sections).
- FAQ sections (questions + answers).
- Feature breakdowns (plan details, product capabilities).

**Composition:**

- Accordion items are composed of:
  - **Trigger button** (uses Button component with `iconEnd` chevron)
  - **Content panel** (text, lists, or mixed content)
- Trigger button should use **Nav / Text + Chevron (B-3)** pattern from buttons-and-links.md.

**Accessibility:**

- Each trigger must have `aria-expanded` (true/false) and `aria-controls` (ID of content panel).
- Content panel must have `id` matching `aria-controls` and `aria-hidden` when collapsed.
- Keyboard support: Enter/Space to toggle, Arrow keys for navigation between items (if `behavior: single`).

---

## 3. Open Questions / TODOs

- Define exact spacing tokens (`compact`, `standard`, `spacious`) as design tokens.
- Document animation/transition behavior for expand/collapse (duration, easing).
- Determine if Accordion should support nested items (accordion within accordion).
- Create design tokens for accordion borders, backgrounds, and focus states.
- Decide on default `behavior` (`single` vs `multiple`) for different use cases.
