# Screen Reader Platform Notes

Platform-specific behaviors for VoiceOver, TalkBack, and Narrator. Use this when filling the VoiceOver, TalkBack, Narrator, and React Native cards.

**Rule:** Only generate platform notes when the component has behavior that differs across platforms. Standard ARIA patterns (buttons, links, headings) work consistently — no platform note needed. Focus on carousels, custom gestures, complex widgets, and mobile-specific interactions.

---

## VoiceOver (iOS / macOS)

### Navigation model
- **Swipe right** — next element
- **Swipe left** — previous element
- **Double-tap** — activate element (equivalent to click/tap)
- **Rotor** — two-finger rotate to change navigation mode (headings, links, form controls, landmarks)
- **Swipe up/down** — navigate within the current rotor category (e.g., next heading, next link)

### Announcement order
Screen reader announces elements in this order:
**Name → Role → State → Description**

Example: "Submit, button" or "Email, text field, required" or "Dashboard, tab, selected, 1 of 4"

### Key behaviors for design annotations

**Carousels:**
- Swipe left/right on the carousel region advances slides (conflicts with standard VoiceOver navigation)
- Must implement `accessibilityScrollForward` / `accessibilityScrollBackward` custom actions
- Announce slide position: "Slide 2 of 5"
- Play/Pause must be reachable via rotor actions if not a visible button

**Custom actions:**
- VoiceOver supports custom rotor actions — swipe up/down on an element to cycle through actions
- Use for: "Delete", "Edit", "Move", "Share" on list items or cards
- Each action needs a descriptive name announced to the user

**Grouped elements:**
- Use `accessibilityElements` to define a custom traversal order within a container
- Cards with multiple text lines should be grouped so VoiceOver reads the entire card as one stop, not each text line separately

**Page transitions (SPA):**
- After a page/view change, post a `UIAccessibility.Notification.screenChanged` notification
- Focus moves to the new content — typically the page title or first heading
- Announce: "Page loaded: [page title]"

**Quirks to note:**
- `aria-roledescription` replaces the default role announcement — "carousel" instead of "region". Keep it short.
- `aria-live="assertive"` interrupts immediately; use sparingly or VoiceOver becomes noisy
- Safari on macOS: some ARIA attributes (like `aria-errormessage`) have incomplete support — fall back to `aria-describedby` for error association

---

## TalkBack (Android)

### Navigation model
- **Swipe right** — next element
- **Swipe left** — previous element
- **Double-tap** — activate element
- **Swipe up then down** — open TalkBack menu (similar to VoiceOver rotor)
- **Swipe down then up** — change navigation granularity (characters, words, headings, links, controls)

### Announcement order
Different from VoiceOver:
**Role → Name → State → Description**

Example: "Button, Submit" or "Edit text, Email, required" or "Tab, Dashboard, selected"

### Key behaviors for design annotations

**Carousels:**
- Swipe right/left navigates between slides when the carousel container has focus
- Must set `android:accessibilityLiveRegion="polite"` on the slide container for announcements
- Announce: "Showing slide 2 of 5"
- Two-finger swipe can be used for page-level scrolling — don't conflict with carousel gestures

**Content descriptions:**
- Every meaningful image needs `contentDescription` (equivalent to `alt`)
- Decorative images: `importantForAccessibility="no"`
- ImageButtons without text: `contentDescription` is required

**Live regions:**
- `accessibilityLiveRegion = POLITE` for status updates
- `accessibilityLiveRegion = ASSERTIVE` for errors
- `announceForAccessibility()` for one-off announcements (e.g., "Item deleted")

**Custom actions:**
- `AccessibilityNodeInfo.addAction()` for custom actions on elements
- Actions appear in the TalkBack menu when the element has focus
- Label each action clearly: "Delete message", "Edit contact"

**Grouped elements:**
- Use `android:focusable="true"` on a container to group child elements as one TalkBack stop
- Set `contentDescription` on the container to describe the group
- Individual children become non-focusable when parent is grouped

**Quirks to note:**
- TalkBack does not support `aria-roledescription` as reliably as VoiceOver — test carefully
- `role="alert"` may not interrupt immediately on all Android versions — use `announceForAccessibility()` as a backup
- Chrome on Android has better ARIA support than the native WebView

---

## Narrator (Windows)

### Navigation model
- **Tab** — next interactive element
- **Caps Lock + Left/Right Arrow** — next/previous element (all elements, not just interactive)
- **H** — next heading
- **D** — next landmark
- **T** — next table
- **F** — next form field
- **Caps Lock + Enter** — activate element

### Announcement order
**Name → Role → State**

Example: "Submit, button" or "Email, edit, required"

### Key behaviors for design annotations

**Scan mode:**
- Narrator has a "scan mode" (toggled with Caps Lock + Space) that reads through content like a document
- In scan mode, arrow keys move through all content (not just interactive elements)
- Design should ensure reading order is logical even when navigating non-interactive content

**Heading navigation:**
- H key jumps between headings — heading hierarchy must be correct and complete
- Narrator relies on heading structure more heavily than VoiceOver or TalkBack for page navigation
- Missing heading levels (H1 → H3) are more noticeable in Narrator because users frequently navigate by heading

**Landmark navigation:**
- D key jumps between landmarks
- Landmarks must be labeled when multiples of the same type exist
- Narrator announces landmark name + role: "Main navigation, navigation"

**Forms:**
- Tab key moves between form fields
- Labels must be programmatically associated (not just visual proximity)
- Error messages need `aria-describedby` — Narrator doesn't reliably pick up visually adjacent error text without explicit association

**Quirks to note:**
- Narrator + Edge has the best ARIA support on Windows; Narrator + Chrome has some gaps
- `aria-live` regions work but may have slight delays compared to JAWS/NVDA
- `role="alertdialog"` is well-supported in Narrator — use it for confirmation dialogs

---

## React Native Accessibility

Only generate this card when the design targets a React Native implementation.

### Core props
- `accessible={true}` — marks element as an accessibility element (groups children)
- `accessibilityLabel` — equivalent to `aria-label`
- `accessibilityRole` — one of: "button", "link", "header", "image", "search", "tab", "text", etc.
- `accessibilityState` — object: `{ selected, disabled, checked, busy, expanded }`
- `accessibilityValue` — object: `{ min, max, now, text }` — for sliders, progress bars
- `accessibilityHint` — short hint about what happens after activation (e.g., "Opens the settings page")

### Platform bridging
- `accessibilityRole="header"` maps to heading on both iOS and Android
- `accessibilityRole="tab"` announces as tab on iOS, but may need custom handling on Android
- Use `AccessibilityInfo.announceForAccessibility()` for dynamic announcements (works cross-platform)
- Use `accessibilityLiveRegion="polite"` on Android for live region behavior

### Grouping
- Set `accessible={true}` on a parent View to group children as one accessible element
- Combined `accessibilityLabel` reads all children as one announcement
- Useful for cards: group image + title + description into one swipe stop

### Custom actions
- `accessibilityActions` — array of `{ name, label }` for custom actions
- `onAccessibilityAction` — handler for when user triggers an action
- Example: `accessibilityActions={[{ name: 'delete', label: 'Delete item' }]}`

---

## TV Platform Accessibility

Only generate this card when the design targets a TV platform (tvOS, Android TV, Fire TV).

### D-pad navigation
- TV interfaces are navigated with a directional pad: Up, Down, Left, Right, Select (OK), Back
- Every interactive element must be reachable via D-pad
- Focus moves in the direction pressed — spatial navigation, not DOM order
- Focus indicator must be large and high-contrast (TV viewing distance is 6-10 feet)

### Focus management
- When a screen loads, focus should land on the most logical element (usually the primary action or first content item)
- When navigating between sections (e.g., sidebar → content area), focus should move to the first item in the new section
- Avoid focus traps — Back button should always escape to the previous screen

### Spatial navigation order
- Design the layout so D-pad navigation follows a predictable grid pattern
- Avoid layouts where "right" from element A could ambiguously land on element B or C
- Horizontal lists: Left/Right moves between items, Down exits the list to the section below
- Vertical lists: Up/Down moves between items, Right may enter a detail view

### Remote control considerations
- Voice search must be available as an alternative to on-screen keyboard
- Long text input should offer voice dictation
- Select/OK button activates the focused element
- Back button returns to previous screen (not a browser back)

---

## General Accessibility Notes

Cross-platform behavior and patterns that apply regardless of screen reader or platform.

### Live regions
- `aria-live="polite"` — status updates, search result counts, toast notifications
- `aria-live="assertive"` — error messages, urgent alerts, form validation errors
- `role="status"` — loading indicators, progress updates (implicit `aria-live="polite"`)
- `role="alert"` — error dialogs, time-sensitive warnings (implicit `aria-live="assertive"`)
- The live region container must exist in the DOM BEFORE content is injected — adding `aria-live` to a newly created element won't trigger an announcement
- `aria-atomic="true"` — entire region content is announced on any change (use for status messages where full context matters)

### Focus management
- After dynamic content insertion: if content appears after the trigger, focus stays on trigger; if before, move focus to new content
- After page/view transitions (SPA): move focus to the main heading (H1) or a skip target, announce the change
- After removing content (item deleted, accordion closed): move focus to the next item, previous item, or container — never let it reset to `<body>`
- Scrollable containers should be focusable (`tabindex="0"`) so keyboard users can scroll with arrow keys

### Announcements
- Use `aria-live` regions for dynamic status changes
- Use `role="alert"` for errors and urgent messages
- For one-off announcements (e.g., "Item deleted"), inject text into a pre-existing live region
- Avoid excessive announcements — too many interruptions degrade the experience

### Common cross-platform patterns
- Group related elements (e.g., card with image + title + description) so screen readers announce them as one unit
- Ensure reading order matches visual order — CSS reordering (flexbox `order`, grid placement) can break this
- Hidden content: use `aria-hidden="true"` for decorative elements, `display: none` or `hidden` attribute for content removed from the accessibility tree
- `inert` attribute: disables all interaction and accessibility for a subtree (use for background content when a modal is open)
