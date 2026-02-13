## Component Audit · Buttons & Links as Buttons

This doc captures the interactive primitives used across the redesign where buttons and links appear, including “links disguised as buttons”. It is intentionally generic so we can map these to S2A components and Storybook stories.

---

## 1. Component Overview

| ID  | Component            | Level    | Semantics (HTML)   | Description                                                                |
| --- | -------------------- | -------- | ------------------ | -------------------------------------------------------------------------- |
| B-1 | Button               | Molecule | `<button>` / `<a>` | All button variants (CTA, subtle/ghost, outlined, glass, full-width)       |
| B-3 | Nav / Text + Chevron | Molecule | `<a>` / `<button>` | Text navigation item with chevron; link or disclosure button in global nav |
| B-4 | Button / Icon-only   | Atom     | `<button>`         | Icon-only controls (search, carousel, close, etc.)                         |

Notes:

- **Buttons vs links**: use `<button>` when the action is in-page (open panel, start flow), and `<a>` when it navigates to a route or URL.

---

## 2. Variants by Component

### 2.1 Button (B-1)

Source Figma frames: `CTA - Primary`, `CTA - Secondary`, `Action 8–12` (subtle/ghost styles).

| Axis       | Values                                   | Notes                                                                                       |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| kind       | `accent`, `primary`, `secondary`         | Figma `kind` property; accent = highest emphasis.                                           |
| background | `solid`, `outlined`, `glass`             | Includes subtle/ghost styles; white “knockout outline” = `outlined` on `on-media` surface.  |
| size       | `md`                                     | Maps to global button t‑shirt scale; others TBD.                                            |
| state      | `default`, `hover`, `active`, `disabled` | Visual states; disabled uses ARIA `aria-disabled`.                                          |
| surface    | `default`, `on-media`                    | On-media uses knockout/overlay styling.                                                     |
| fullWidth  | `true`/`false`                           | When true, button stretches to 100% width of its container (layout prop, not a token).      |
| iconStart  | `true`/`false` + instance swap           | Figma Boolean to toggle leading icon visibility + instance-swap slot to choose which icon.  |
| iconEnd    | `true`/`false` + instance swap           | Figma Boolean to toggle trailing icon visibility + instance-swap slot to choose which icon. |

Intended usage:

- All “button-looking” actions (CTA, subtle bordered button, ghost button) are instances of this component.
- Primary/accent used for key CTAs; subtle/outlined/ghost styles for secondary/tertiary actions.
- Global nav “text + chevron” items are implemented as this Button component with `iconEnd` enabled and nav‑specific semantics (e.g. `as="button"` + `aria-expanded` for disclosure triggers).

### 2.2 (Merged) Button styles

The previous “Button / Text” (B-2) group is treated as **additional visual styles of Button (B-1)**, not a separate component.  
They map onto the same axes above via different `kind` + `background` + `surface` combinations (e.g. subtle border, ghost).

### 2.3 Nav / Text + Chevron (B-3)

Source Figma frame: `Nav Item` with label + chevron underline (global nav).

| Axis      | Values                         | Notes                                                                                               |
| --------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| role      | `link`, `disclosure-button`    | Link goes to a page; disclosure-button toggles a panel/mega-menu in global nav.                     |
| state     | `default`, `hover`, `active`   | Hover = color change; Active = chevron points up + label set in bold; use `aria-current` as needed. |
| minTarget | ≥ `24px × 24px` (CSS hit area) | Even though text is 16px, the interactive area must meet WCAG target size via padding.              |

Intended usage:

- Implemented using the **Button (B‑1)** component with `iconEnd` enabled and transparent/ghost styling.
- In global nav, modeled as a **transparent button** (`role = disclosure-button`) that opens/closes a panel; use `<button aria-expanded aria-controls>`.
- In simple nav lists, modeled as a link inside `<nav>`; still ensure a minimum 24×24px tappable area via padding.

### 2.4 Button / Icon-only (B-4)

Source Figma frames: `Search Bar` icon button, carousel controls, generic circular icon buttons.

| Axis       | Values                                   | Notes                                                                                |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| kind       | `accent`, `primary`, `secondary`         | Reuses Button (B‑1) `kind` scale for emphasis.                                       |
| background | `solid`, `outlined`, `glass`             | Same background options as Button (B‑1); often rendered as soft/ghost over surfaces. |
| surface    | `default`, `on-media`                    | Same surface axis as Button (B‑1).                                                   |
| shape      | `circle`, `square`                       | Circle for floating controls, square for bars or docked icons.                       |
| size       | `sm`, `md`                               | Small (e.g. carousel), medium (search, close).                                       |
| state      | `default`, `hover`, `active`, `disabled` | Standard interactive states.                                                         |
| icon       | instance swap                            | Icon-only; label is omitted, icon is provided via instance swap slot.                |

Intended usage:

- Search triggers, carousel arrows, close/dismiss, overflow menus.
- Implemented as a constrained **Button (B‑1)** variant: no `fullWidth`, no label, no iconStart/iconEnd booleans—just an icon swap.
- Always `<button>`; never a naked `<div>` with click handler.

## 3. Open Questions / TODOs

- Confirm button size taxonomy (`sm`, `md`, `lg`) across all layouts.
- Align button semantic tokens (`kind`, `background`, `surface`, `state`) with existing S2A button component.
- Decide how many of the text-only actions should be first-class button variants vs. just link styles.
- Define the full behavior and visual treatment for **Search** when active/expanded (inline field vs. overlay, icon swap, focus/ARIA pattern).
