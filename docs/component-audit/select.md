## Component Audit · Select

This doc captures the dropdown/select component used for form inputs and navigation filters. Select provides a native-like dropdown experience with custom styling.

---

## 1. Component Overview

| ID  | Component | Level    | Semantics (HTML) | Description                                                      |
| --- | --------- | -------- | ---------------- | ---------------------------------------------------------------- |
| S-1 | Select    | Molecule | `<select>` / `<button>` + `<ul>` | Dropdown selector for single-choice options                      |

Notes:

- **Select** can be implemented as a native `<select>` (accessible, limited styling) or a custom dropdown (`<button>` + `<ul>` with ARIA).
- Custom implementation provides full design control but requires ARIA attributes (`role="combobox"`, `aria-expanded`, `aria-controls`).
- Used in forms, filters, and navigation contexts.

---

## 2. Variants by Component

### 2.1 Select (S-1)

Source Figma frames: `Select?`, dropdown selectors in forms and filters.

| Axis      | Values                        | Notes                                                                                    |
| --------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| size      | `sm`, `md`, `lg`              | Height and padding; `sm` = 32px, `md` = 40px, `lg` = 48px.                              |
| state     | `default`, `hover`, `focus`, `disabled`, `error` | Interactive states; `error` shows validation feedback.                                   |
| variant   | `default`, `outlined`, `filled` | Visual style; `outlined` = border only, `filled` = background fill.                     |
| icon      | `chevron-down` (instance swap) | Trailing chevron icon; swappable for custom icons if needed.                             |
| placeholder| `string`                      | Placeholder text when no option is selected.                                             |
| options   | `Array<{value, label}>`       | Selectable options; each option has a value and display label.                           |

**Mobile vs Desktop:**

- **Mobile**: Often uses native `<select>` for better touch interaction and OS integration.
- **Desktop**: Can use custom dropdown for richer styling and interactions.

**Intended usage:**

- Form inputs (country, plan type, category selection).
- Filter controls (product categories, audience type).
- Navigation dropdowns (audience selector: "Individuals", "Businesses", "Organizations").

**Accessibility:**

- Must support keyboard navigation (Arrow keys, Enter, Escape).
- Screen reader announcements for selected value and option list.
- Focus management when dropdown opens/closes.

---

## 3. Open Questions / TODOs

- Decide on native `<select>` vs custom dropdown implementation strategy (or support both).
- Define exact size tokens (`sm`, `md`, `lg`) as design tokens.
- Document error state styling and validation feedback patterns.
- Create design tokens for select colors, borders, and focus states.
- Determine if Select should support multi-select (checkbox list) or remain single-select only.
