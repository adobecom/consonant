# Focus Order

Tab order and sequential focus navigation requirements. Use this as the primary reference when filling the Focus Order card.

---

## WCAG Requirements

### 2.4.3 Focus Order (Level A)
When content can be navigated sequentially (e.g., via Tab key), the navigation order MUST be logical and intuitive. Focus order should follow the visual reading order — typically left-to-right, top-to-bottom for LTR languages.

### 2.1.1 Keyboard (Level A)
All functionality must be operable through a keyboard interface. Every interactive element must be reachable via Tab (or arrow keys within composite widgets).

### 2.1.2 No Keyboard Trap (Level A)
Focus must never become trapped in a component. The user must always be able to move focus away using standard keyboard navigation (Tab, Shift+Tab, Escape).

**Exception:** Modal dialogs intentionally trap focus — but Escape must always close the modal and return focus to the trigger.

---

## Focus Order Principles

### 1. Follow visual reading order
Tab order should match the visual layout:
- Left to right within a row
- Top to bottom between rows
- Skip navigation → Header → Main content → Sidebar → Footer

### 2. Never use positive tabindex
- `tabindex="0"` — element is in natural tab order (good)
- `tabindex="-1"` — element is focusable programmatically but not via Tab (good for focus management)
- `tabindex="1"` or higher — forces element out of natural order (bad — never use)

### 3. DOM order = tab order
The DOM source order determines tab order. If the visual order differs from DOM order (via CSS flexbox `order`, grid placement, or `position: absolute`), the tab order may not match what the user sees.

**Rule:** If CSS reorders visual elements, verify that DOM order still produces a logical tab sequence.

---

## Common Focus Order Patterns

### Navigation bar
```
Skip link → Logo (if linked) → Nav item 1 → Nav item 2 → ... → Search → User menu
```

### Form
```
Label + Input 1 → Label + Input 2 → ... → Submit button → Cancel/Reset
```
Tab should move between form fields in visual order. Labels are not tab stops — they are associated via `for`/`id`.

### Card grid
```
Card 1 (entire card or CTA) → Card 2 → Card 3 → ...
```
If the entire card is clickable, it should be one tab stop. If multiple links exist inside a card, each link is a separate tab stop.

### Modal dialog
```
[focus trap begins]
Close button → First interactive element → ... → Last element → [wraps to Close]
[Escape closes modal, returns focus to trigger]
```

### Tabs
```
Tab 1 → [arrow keys between tabs] → Tab panel content
```
Tab key moves to the tab list, then arrow keys select tabs. Tab again moves into the panel content.

---

## Focus Management Scenarios

### Dynamic content insertion
When new content appears (accordion opens, inline validation message, dynamically loaded section):
- If content appears AFTER the trigger: focus stays on trigger, new content is next in tab order
- If content appears BEFORE the trigger: move focus to the new content

### Page/view transitions (SPA)
- After navigation: move focus to the main heading (H1) or a skip target
- Announce the page change via `aria-live` or document title update

### Removed content
When content is removed (item deleted, accordion closed):
- Move focus to a logical location: the next item, the previous item, or the container
- Never let focus disappear into the void (reset to `<body>`)

### Overflow/scroll containers
- Scrollable containers should be focusable (`tabindex="0"`) so keyboard users can scroll with arrow keys
- Content inside overflow containers must remain reachable via Tab

---

## Detection Heuristics for Figma

- Identify all interactive elements in the design
- Trace the expected tab order following visual reading order (LTR, top-to-bottom)
- Flag any element that appears visually before another but would come after in DOM order (CSS reordering)
- Check modals for focus trap requirements
- Check dynamic components (accordions, tabs, carousels) for focus management needs
- Verify that removing/hiding content won't orphan focus
- Count interactive elements to assess skip link necessity (3+ nav items before content)

## Blueline Card Output

- Title = element name with focus order position (e.g. "1. Skip to main content", "2. Adobe Logo (home link)")
- Desc = focus behavior note (e.g. "First focusable element. Hidden until focused via Tab.")
- Notes = cite WCAG 2.4.3 Focus Order, 2.1.1 Keyboard
- Warnings = elements with unexpected focus order or potential keyboard traps
