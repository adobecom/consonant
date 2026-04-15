# Component Accessibility Patterns

Complete ARIA, keyboard, and focus contracts for common UI components. Use this as the primary reference when filling Keyboard Patterns, ARIA Roles & Attributes, and DOM Strategy cards.

For each pattern: specify **only what the design requires**. Skip patterns that don't appear in the design.

---

## Tabs (Tablist)

**ARIA contract:**
- Container: `role="tablist"`, `aria-label="{descriptive name for the set of tabs}"`
- Each tab: `role="tab"`, `aria-selected="true|false"`, `aria-controls="{panel-id}"`, `tabindex="0"` (active) or `tabindex="-1"` (inactive)
- Panel: `role="tabpanel"`, `aria-labelledby="{tab-id}"`, `tabindex="0"`
- Inactive panels: `hidden` attribute or `display: none`

**Keyboard:**
- `Left / Right Arrow` — move between tabs (wraps at ends)
- `Home` — first tab
- `End` — last tab
- `Tab` — move from active tab into panel content
- `Enter / Space` — activate tab (if manual activation model)

**Focus model:** Roving tabindex. Only the active tab is in the tab order (`tabindex="0"`). All other tabs have `tabindex="-1"`. Arrow keys move focus between tabs.

**Selection model:** Specify one:
- "Selection follows focus" — arrow keys both move focus and activate the tab
- "Manual activation" — arrow keys move focus, Enter/Space activates

**Accessible name:** Tab text must describe the panel content. "Dashboard" not "Tab 1".

**DOM strategy:** All panels can exist in DOM simultaneously (inactive panels hidden). Or lazy-load panel content on activation.

---

## Carousel / Slideshow

**ARIA contract:**
- Outer region: `role="region"`, `aria-roledescription="carousel"`, `aria-label="{descriptive name}"`
- Each slide: `role="group"`, `aria-roledescription="slide"`, `aria-label="{N} of {M}"`
- Inactive slides: `aria-hidden="true"`, `inert`
- Active slide: `aria-hidden="false"`, remove `inert`
- Play/Pause button: `aria-label` toggles — "Pause auto-rotation" / "Play auto-rotation"
- Pagination dots: `role="tablist"` if tabs-like, or individual buttons with `aria-label="Go to slide {N}"`

**Keyboard:**
- `Tab` — enters carousel region, lands on first focusable element
- If tablist pagination: `Left / Right Arrow` between dots, `Tab` to panel content
- If next/prev buttons: `Enter / Space` on arrow buttons
- `Home / End` — first/last slide (if tablist pagination)

**Focus model:** Pagination uses roving tabindex (same as tabs). Next/prev buttons are standard button focus.

**Accessible name:** Carousel needs a descriptive `aria-label` — "Featured products" not "carousel".

**DOM strategy:** All slide panels exist in DOM simultaneously. Never insert/remove DOM nodes on rotation. Inactive panels use `inert` + `aria-hidden="true"`.

**Auto-rotation rules:** See `carousel-a11y.md` for full timing, pause, and reduced-motion rules.

---

## Button

**ARIA contract:**
- Use native `<button>` element (preferred) or `role="button"` + `tabindex="0"`
- Toggle button: `aria-pressed="true|false"`
- Menu trigger: `aria-haspopup="true"`, `aria-expanded="true|false"`
- Icon-only button: `aria-label="{action description}"` — e.g., "Close dialog", "Search", "Remove item"

**Keyboard:**
- `Enter` — activate button
- `Space` — activate button (native `<button>` handles this automatically)

**Focus model:** Standard. Button is in tab order by default.

**Accessible name strategy:**
- Text button → visible text is the name
- Icon-only → `aria-label` required, must describe the action: "Close", "Search products", "Delete row"
- Icon + text → visible text is the name, icon is decorative (`aria-hidden="true"` on icon)

---

## Link

**ARIA contract:**
- Use native `<a href>` element
- For navigation to a different page or URL
- Current page in navigation: `aria-current="page"`

**Keyboard:**
- `Enter` — activate link (navigate)

**Focus model:** Standard. Link is in tab order by default.

**Accessible name strategy:**
- Link text must describe the destination — "View pricing plans" not "Click here"
- "Learn more" / "Read more" links → expand with context: "Learn more about {nearest heading or section title}"
- If multiple "Learn more" links exist on a page, each must have a unique accessible name
- Image link → alt text on the image provides the name, OR `aria-label` on the link

---

## Menu / Dropdown Menu

**ARIA contract:**
- Trigger button: `aria-haspopup="true"`, `aria-expanded="true|false"`, `aria-controls="{menu-id}"`
- Menu container: `role="menu"`
- Menu items: `role="menuitem"`
- Checkbox items: `role="menuitemcheckbox"`, `aria-checked="true|false"`
- Radio items: `role="menuitemradio"`, `aria-checked="true|false"`
- Separator: `role="separator"`

**Keyboard:**
- `Enter / Space` — open menu (on trigger), activate item (in menu)
- `Down Arrow` — open menu (on trigger), next item (in menu)
- `Up Arrow` — previous item (in menu)
- `Right Arrow` — open submenu
- `Left Arrow` — close submenu, return to parent
- `Escape` — close menu, return focus to trigger
- `Home` — first item
- `End` — last item
- Type-ahead: typing a character moves to next item starting with that letter

**Focus model:** Roving tabindex within the menu. Only one item has `tabindex="0"` at a time. Focus moves to first item when menu opens.

**Accessible name:** Menu trigger should describe what the menu contains — "Account settings" not just "Menu".

**DOM strategy:** Menu can be rendered on open or pre-rendered and hidden. When closed, menu content should be `display: none` or removed from DOM (not just visually hidden) so it's not in the tab order.

---

## Menubar (Top-Level Navigation Bar)

**ARIA contract:**
- Container: `role="menubar"`, `aria-label="{descriptive name}"`
- Top-level items: `role="menuitem"`
- Items with submenus: `aria-haspopup="true"`, `aria-expanded="true|false"`
- Submenus: `role="menu"` with nested `role="menuitem"` children

**Keyboard:**
- `Left / Right Arrow` — move between top-level items
- `Down Arrow` — open submenu, move to first submenu item
- `Up Arrow` — move to last submenu item (if submenu open)
- `Enter / Space` — activate item or open submenu
- `Escape` — close submenu, return to menubar item
- `Home` — first menubar item
- `End` — last menubar item

**Focus model:** Roving tabindex across the menubar. Only one top-level item in tab order.

---

## Dialog / Modal

**ARIA contract:**
- Container: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="{title-id}"` or `aria-label="{title}"`
- Optional description: `aria-describedby="{description-id}"`
- Alert dialog (confirmation/destructive): `role="alertdialog"` instead of `role="dialog"`

**Keyboard:**
- `Escape` — close dialog
- `Tab` — move through focusable elements inside dialog (wraps: last → first)
- `Shift + Tab` — reverse (wraps: first → last)

**Focus model:** Focus trap. When dialog opens:
1. Store the element that triggered the dialog
2. Move focus to the first focusable element inside (or the dialog itself)
3. Tab/Shift+Tab cycle only within the dialog
4. When dialog closes, return focus to the stored trigger element

**Accessible name:** Dialog must be labeled by its heading — `aria-labelledby` pointing to the visible title text.

**DOM strategy:** Content behind the dialog should have `inert` attribute to prevent interaction. Alternatively, add `aria-hidden="true"` to the main page content wrapper.

---

## Accordion

**ARIA contract:**
- Each header: `<button>` (or `role="button"`) with `aria-expanded="true|false"`, `aria-controls="{panel-id}"`
- Each panel: `role="region"`, `aria-labelledby="{header-button-id}"`
- Expand/collapse icon (+ / - / chevron): `aria-hidden="true"` (decorative)

**Keyboard:**
- `Enter / Space` — toggle section open/closed
- `Tab` — move between headers (and other focusable elements)
- `Down Arrow` — next accordion header (optional but recommended)
- `Up Arrow` — previous accordion header (optional)
- `Home` — first header (optional)
- `End` — last header (optional)

**Focus model:** All headers are in the tab order. No roving tabindex (unlike tabs).

**Accessible name:** Header button text must describe the content that expands — "Payment methods" not "Section 3".

**DOM strategy:** Panel content can remain in DOM (toggled with `hidden` or `display: none`) or be inserted/removed on toggle. Either is acceptable.

---

## Disclosure (Show/Hide Toggle)

Similar to accordion but for a single section, not a group.

**ARIA contract:**
- Trigger: `<button>` with `aria-expanded="true|false"`, `aria-controls="{content-id}"`
- Content: no special role needed (it's just content that appears/disappears)

**Keyboard:**
- `Enter / Space` — toggle content visibility

**Focus model:** Standard. Button is in tab order.

---

## Combobox / Autocomplete

**ARIA contract:**
- Input: `role="combobox"`, `aria-expanded="true|false"`, `aria-controls="{listbox-id}"`, `aria-activedescendant="{selected-option-id}"`, `aria-autocomplete="list|both|none"`
- Dropdown list: `role="listbox"`
- Each option: `role="option"`, `aria-selected="true|false"`

**Keyboard:**
- `Down Arrow` — open list (if closed), move to next option
- `Up Arrow` — move to previous option
- `Enter` — select highlighted option, close list
- `Escape` — close list without selecting, clear input or restore previous value
- Typing — filters options in real-time
- `Home / End` — first/last option in list

**Focus model:** Focus stays on the input. `aria-activedescendant` tells the screen reader which option is visually highlighted. Focus never moves into the listbox.

**Accessible name:** Input needs a visible `<label>`. Listbox is labeled by the same label via `aria-labelledby`.

**Live region:** Announce number of results available — e.g., "5 suggestions available" via `aria-live="polite"` on a status element.

---

## Checkbox

**ARIA contract:**
- Use native `<input type="checkbox">` (preferred) or `role="checkbox"` + `tabindex="0"`
- State: `aria-checked="true|false|mixed"`
- Mixed/indeterminate: `aria-checked="mixed"` when a parent checkbox controls a group and some children are checked
- Group of checkboxes: wrap in `<fieldset>` with `<legend>` describing the group

**Keyboard:**
- `Space` — toggle checked state

**Focus model:** Standard. Each checkbox is in the tab order.

**Accessible name:** Visible `<label>` associated with the checkbox.

---

## Radio Group

**ARIA contract:**
- Group: `role="radiogroup"`, `aria-labelledby="{group-label-id}"` — or use `<fieldset>` + `<legend>`
- Each radio: `role="radio"` (or native `<input type="radio">`), `aria-checked="true|false"`, `tabindex="0"` (selected) or `tabindex="-1"` (unselected)

**Keyboard:**
- `Arrow Down / Right` — next radio (wraps, selects on move)
- `Arrow Up / Left` — previous radio (wraps, selects on move)
- `Space` — select current radio (if not auto-selected on arrow)

**Focus model:** Roving tabindex. Only the currently selected radio is in the tab order. Arrow keys move focus and selection together.

**Accessible name:** Each radio labeled by its visible text. Group labeled by `<legend>` or `aria-labelledby`.

---

## Switch / Toggle

**ARIA contract:**
- Element: `role="switch"`, `aria-checked="true|false"`
- Or use a styled `<input type="checkbox">` with `role="switch"`

**Keyboard:**
- `Space` — toggle on/off
- `Enter` — toggle on/off (recommended but not required)

**Focus model:** Standard. Switch is in the tab order.

**Accessible name:** Visible label describing what the switch controls — "Dark mode", "Email notifications".

---

## Slider / Range

**ARIA contract:**
- Element: `role="slider"`, `aria-valuenow="{current}"`, `aria-valuemin="{min}"`, `aria-valuemax="{max}"`, `aria-valuetext="{human-readable value}"` (optional, for non-numeric display like "Medium" or "$500")
- Label: `aria-labelledby="{label-id}"` or `aria-label`

**Keyboard:**
- `Right / Up Arrow` — increase value by one step
- `Left / Down Arrow` — decrease value by one step
- `Home` — minimum value
- `End` — maximum value
- `Page Up` — increase by large step (optional)
- `Page Down` — decrease by large step (optional)

**Focus model:** Standard. Slider thumb is in tab order.

**Accessible name:** Must have a label describing what the slider controls — "Volume", "Price range".

---

## Tooltip

**ARIA contract:**
- Trigger element: `aria-describedby="{tooltip-id}"` (tooltip adds supplementary info) — or `aria-labelledby="{tooltip-id}"` (tooltip IS the label)
- Tooltip container: `role="tooltip"`

**Keyboard:**
- `Escape` — dismiss tooltip
- Tooltip appears on focus (not just hover)
- Tooltip must be hoverable — moving pointer to the tooltip should not dismiss it (WCAG 1.4.13)

**Focus model:** Focus stays on the trigger element. Tooltip content is not focusable.

**Accessible name:** If the tooltip IS the only label (e.g., icon-only button with tooltip), use `aria-labelledby` pointing to the tooltip. If the element already has a name and the tooltip adds extra info, use `aria-describedby`.

---

## Listbox (Selection List)

**ARIA contract:**
- Container: `role="listbox"`, `aria-labelledby="{label-id}"`
- Each option: `role="option"`, `aria-selected="true|false"`
- Multi-select: `aria-multiselectable="true"` on listbox

**Keyboard:**
- `Down Arrow` — next option
- `Up Arrow` — previous option
- `Home` — first option
- `End` — last option
- `Space` — toggle selection (multi-select)
- `Ctrl + A` — select all (multi-select)
- Type-ahead: typing characters jumps to matching option

**Focus model:** `aria-activedescendant` on the listbox (focus stays on container) OR roving tabindex on options.

---

## Breadcrumb

**ARIA contract:**
- Container: `<nav>`, `aria-label="Breadcrumb"`
- List: `<ol>` (ordered list — position matters)
- Each item: `<li>` with `<a>` link
- Current page (last item): `aria-current="page"` (no link, or link with `aria-current`)
- Separator (/ or >): CSS-generated or `aria-hidden="true"` (don't announce separators)

**Keyboard:** Standard link navigation — `Tab` between links.

**Focus model:** Standard. Each breadcrumb link is in tab order. Current page item is not a link (or is a link with `aria-current="page"`).

---

## Toolbar

**ARIA contract:**
- Container: `role="toolbar"`, `aria-label="{descriptive name}"` or `aria-labelledby`
- Items: buttons, toggles, dropdowns — standard roles

**Keyboard:**
- `Left / Right Arrow` — move between toolbar items
- `Home` — first item
- `End` — last item
- `Tab` — exit toolbar (move to next focusable element outside)

**Focus model:** Roving tabindex. Only one toolbar item in tab order at a time. Arrow keys move between items.

---

## Pagination

**ARIA contract:**
- Container: `<nav>`, `aria-label="Pagination"`
- Current page: `aria-current="page"` on the active page link/button
- Previous/Next buttons: `aria-label="Go to previous page"`, `aria-label="Go to next page"`
- Disabled prev/next (at boundaries): `aria-disabled="true"`

**Keyboard:** Standard link/button navigation — `Tab` between page links and prev/next buttons.

**Focus model:** Standard. All page links and buttons are in tab order.

**Live region:** After page change, announce the result — "Page 3 of 12, showing results 21-30" via `aria-live="polite"`.

---

## Live Regions (Dynamic Content Announcements)

Not a component, but a pattern used across many components.

**When to use:**
- `aria-live="polite"` — status updates, search result counts, toast notifications, "5 results found", "Item added to cart"
- `aria-live="assertive"` — error messages, urgent alerts, form validation errors
- `role="status"` — loading indicators, progress updates (implicit `aria-live="polite"`)
- `role="alert"` — error dialogs, time-sensitive warnings (implicit `aria-live="assertive"`)

**Critical rule:** The live region container must exist in the DOM BEFORE content is injected. Adding `aria-live` to a newly created element won't trigger an announcement. Create the empty container first, then inject content into it.

**`aria-atomic="true"`** — when set, the entire region content is announced on any change (not just the part that changed). Use for status messages where the full context matters.

---

## Form Validation

Not a single component but a cross-cutting pattern.

**ARIA contract:**
- Invalid field: `aria-invalid="true"`
- Error message linked: `aria-describedby="{error-message-id}"`
- Required field: `aria-required="true"` (or native `required` attribute)
- Error container: `role="alert"` for immediate announcement, or within an `aria-live="assertive"` region
- Help text: `aria-describedby="{hint-id}"` (can reference multiple IDs: `aria-describedby="hint-id error-id"`)

**Design requirements:**
- Visible labels on every input (not placeholder alone)
- Error messages positioned near the field (below or inline)
- Error states use color + icon + text (never color alone)
- Required indicator uses asterisk or "Required" text alongside any color
- Group related fields in `<fieldset>` with `<legend>` (e.g., "Shipping address", "Payment method")
