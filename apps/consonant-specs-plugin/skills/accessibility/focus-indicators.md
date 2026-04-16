# Focus Indicators

Visible focus indicator requirements for interactive elements. Use this as the primary reference when filling the Focus Indicators card.

---

## WCAG Requirements

### 2.4.7 Focus Visible (Level AA)
Every interactive element that receives keyboard focus MUST have a visible focus indicator. The user must always be able to see which element currently has focus.

### 2.4.11 Focus Not Obscured (Minimum) (Level AA)
When a user interface component receives focus, it must not be entirely hidden by author-created content (sticky headers, footers, modals, chat widgets). At least part of the focus indicator must remain visible.

### 2.4.13 Focus Appearance (Level AAA — recommended)
The focus indicator should:
- Have a minimum area of a **2px solid outline** around the component's perimeter
- Have at least **3:1 contrast** between focused and unfocused states
- Have at least **3:1 contrast** against adjacent colors (both inside and outside the component)

---

## Focus Indicator Patterns

### Recommended: 2px solid outline with offset
```css
:focus-visible {
  outline: 2px solid #0060df; /* blue, 3:1+ against white */
  outline-offset: 2px;
}
```

### Common patterns by component type

| Component | Recommended indicator | Notes |
|---|---|---|
| Buttons | 2px outline, offset 2px | Must be visible on all background colors |
| Text links | 2px outline or underline thickening | Outline preferred for consistency |
| Form inputs | 2px outline on the input border | Replace the default ring if custom-styled |
| Cards (clickable) | 2px outline around the entire card | Include border-radius matching the card |
| Icon buttons | 2px outline around the click target | Not just the icon — the whole hit area |
| Tabs | 2px outline or bottom border thickening | Must distinguish from selected state |
| Menu items | Background color change + outline | Background alone may not have enough contrast |
| Checkboxes/radios | 2px outline around the control | Must be visible when checked and unchecked |

---

## Focus vs. :focus-visible

- `:focus` — applies to all focus (mouse click, keyboard, programmatic)
- `:focus-visible` — applies only when the browser determines focus should be visible (keyboard navigation)
- **Use `:focus-visible`** for custom focus styles so mouse users don't see focus rings on click
- Always provide a fallback `:focus` for browsers that don't support `:focus-visible`

```css
/* Fallback for older browsers */
:focus {
  outline: 2px solid #0060df;
  outline-offset: 2px;
}
/* Remove fallback when :focus-visible is supported */
:focus:not(:focus-visible) {
  outline: none;
}
:focus-visible {
  outline: 2px solid #0060df;
  outline-offset: 2px;
}
```

---

## Common Violations

| Issue | Problem | Fix |
|---|---|---|
| `outline: none` without replacement | No visible focus indicator | Add custom `:focus-visible` style |
| Low contrast outline | Focus ring not distinguishable from background | Use color with 3:1+ contrast against all adjacent colors |
| Focus hidden by sticky header/footer | Element receives focus under a fixed element | Scroll into view or use `scroll-margin-top` |
| Custom component missing focus | JS widget has no focus styles | Add `:focus-visible` to the focusable element |
| Focus ring clipped by `overflow: hidden` | Outline cut off by parent container | Use `outline-offset` or `box-shadow` instead |
| Dark mode focus ring invisible | Same blue outline on dark background | Use adaptive focus color or double-ring (light + dark) |

---

## Double-Ring Pattern (High Contrast)

For designs that must work on both light and dark backgrounds:
```css
:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px #0060df;
}
```
This creates a white inner ring with a blue outer ring — visible on any background.

---

## Detection Heuristics for Figma

- Identify all interactive elements in the design (buttons, links, inputs, tabs, cards with click handlers)
- Check if the design system defines a focus state for each component
- Look for custom-styled inputs that may have removed the default browser outline
- Check dark mode variants for focus indicator visibility
- Verify focus indicators on components inside containers with `overflow: hidden`

## Blueline Card Output

- Title = element or component name (e.g. "Primary Button focus state", "Search input focus ring")
- Desc = focus indicator requirement and recommendation
- Notes = cite WCAG 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured
- Warnings = elements with missing or insufficient focus indicators
