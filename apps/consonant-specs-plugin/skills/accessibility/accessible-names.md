# Accessible Name Strategy

How to determine and annotate the accessible name for every interactive element in a design. Use this as the primary reference when filling the Accessible Names and Alt-Text cards.

---

## The Naming Hierarchy

Screen readers derive an element's accessible name from these sources, in priority order:

1. **`aria-labelledby`** — points to visible text elsewhere on the page (strongest, overrides everything)
2. **`aria-label`** — string attribute on the element (use when no visible text exists)
3. **Visible text content** — the text inside a `<button>`, `<a>`, or `<label>`
4. **`alt` attribute** — on `<img>` elements
5. **`title` attribute** — tooltip text (weakest, unreliable across screen readers)
6. **`placeholder`** — on inputs (weakest, disappears when user types — never rely on this alone)

**Rule:** Use the highest source available. Prefer visible text over `aria-label`. Prefer `aria-labelledby` (pointing to existing visible text) over duplicating text in `aria-label`.

---

## Naming by Element Type

### Buttons with visible text
- Name comes from the button text automatically
- No annotation needed unless the text is ambiguous
- Example: "Submit" button → accessible name is "Submit"

### Icon-only buttons
- Requires `aria-label` describing the action, not the icon
- Pattern: `aria-label="{verb} {object}"` — action-first
- Examples:
  - Close icon → `aria-label="Close dialog"` or `aria-label="Close"`
  - Search icon → `aria-label="Search"` or `aria-label="Search products"`
  - Hamburger menu → `aria-label="Open menu"` or `aria-label="Main menu"`
  - Trash icon → `aria-label="Delete item"` or `aria-label="Remove from cart"`
  - Edit pencil → `aria-label="Edit profile"`
  - Share icon → `aria-label="Share this page"`
- Never: `aria-label="icon"`, `aria-label="button"`, `aria-label="X"`

### Icon + text buttons
- Visible text is the name. Icon is decorative.
- Icon should have `aria-hidden="true"` so it's not announced separately
- No extra annotation needed

### "Learn more" / "Read more" / "See all" links
- These are ambiguous on their own — screen reader users navigating by links hear "Learn more, Learn more, Learn more" with no context
- Pattern: `aria-label="{visible text} about {nearest heading or section context}"`
- Examples:
  - Link says "Learn more" under a card titled "Creative Cloud" → `aria-label="Learn more about Creative Cloud"`
  - Link says "See all" under "Featured products" → `aria-label="See all featured products"`
  - Link says "Read more" under an article with eyebrow "Photography" → `aria-label="Read more about Photography"`
- Provide as a reusable pattern: "{visible text} + {eyebrow or heading}" — not hardcoded per instance

### CTA buttons in cards
- If the card has a heading, the CTA's name should reference it
- Example: card with heading "Acrobat Pro" and CTA "Buy now" → `aria-label="Buy now — Acrobat Pro"`
- If the entire card is clickable, the card's accessible name comes from the heading text

### Form inputs
- Every input must have a visible `<label>` element — not just a placeholder
- Label text must describe the field purpose: "Email address", "Company name"
- Placeholder can supplement the label as a hint ("e.g., name@company.com") but is never the only label
- For grouped fields, wrap in `<fieldset>` with `<legend>`: "Shipping address" as group label, "Street", "City", "ZIP" as individual labels

### Inputs with no visible label (search bars, inline filters)
- Use `aria-label` on the input: `aria-label="Search products"`
- Or use a visually hidden `<label>` (sr-only class) if you want the label in DOM but not visible

### Navigation regions
- When multiple `<nav>` elements exist, each needs a distinct `aria-label`
- Examples: `aria-label="Main navigation"`, `aria-label="Footer links"`, `aria-label="Breadcrumb"`
- If only one `<nav>` exists, a label is optional but recommended

### Tabs
- Tab text must describe the panel content — "Overview", "Pricing", "Reviews"
- Tablist needs `aria-label` describing the set — "Product sections", "Account settings"
- Never: "Tab 1", "Tab 2", "Tab 3"

### Accordion headers
- Header text must describe the content that expands
- "Payment methods", "System requirements", "Frequently asked questions"
- Never: "Section 1", "Click to expand"

### Cards and tiles
- Accessible name comes from the card's heading text
- If the card is a single clickable link, the link wraps the card and gets its name from the heading
- Additional descriptive text (price, date, description) can be added via `aria-describedby` if needed

### Logo as homepage link
- `alt` text should include the brand name and indicate it's a link to home
- Example: `alt="Adobe — go to homepage"` or `alt="Adobe home"`
- Never: `alt="logo"`, `alt="brand"`, `alt="image"`

---

## Alt-Text for Images

### Informative images (convey content)
- Describe what the image shows, not what the image is
- "Team collaborating around a whiteboard in a bright office" — not "photo" or "image"
- Keep it concise: 1-2 sentences maximum
- Include text that appears in the image

### Decorative images (visual styling only)
- Use empty alt: `alt=""`
- Or `role="presentation"`
- Examples: background gradients, decorative dividers, purely ornamental illustrations
- Rule of thumb: if removing the image changes no meaning, it's decorative

### Functional images (icons, logos, controls)
- Alt text describes the function, not the appearance
- Magnifying glass in search button → `alt=""` (button has its own label) or `alt="Search"`
- Logo → `alt="Adobe — go to homepage"`
- Social media icon → `alt="Follow us on Twitter"` or `alt=""` if the link text already says it

### Complex images (charts, diagrams, infographics)
- Brief `alt` describing what the image is: `alt="Bar chart showing Q4 revenue by region"`
- Longer description nearby in visible text or via `aria-describedby` pointing to a detailed description
- Data tables are often better than charts for accessibility

### Background images with text overlay
- The text overlay is real text (good) — the background image is decorative
- Background image gets no alt text (it's CSS, not an `<img>`)
- Ensure text contrast meets 4.5:1 against the image background (or use a scrim/overlay)

---

## Anti-Patterns to Flag

| Mistake | Why it's wrong | Fix |
|---|---|---|
| `aria-label` that contradicts visible text | Sighted SR users see "Submit" but hear "Send form" — confusing | Use `aria-labelledby` to point to visible text, or make them match |
| `alt="image"` or `alt="photo"` | Adds no information — screen reader says "image, image" | Describe the content or mark as decorative |
| `alt="logo"` | Doesn't say whose logo or where it links | `alt="Adobe — go to homepage"` |
| Placeholder as only label | Disappears when user types, not reliably announced | Add visible `<label>` |
| `aria-label` on non-interactive elements | Only interactive elements and landmarks should have `aria-label` | Use `aria-labelledby` pointing to visible text, or restructure |
| Duplicate name + description | `aria-label="Close"` on a button that says "Close" — announced twice | Remove redundant `aria-label`; visible text is sufficient |
| Generic link text without context | "Click here", "Read more" with no context | Add `aria-label` with context or rewrite visible text |

---

## Context Harvesting for Blueline Fill

When Claude fills the Accessible Names card, use this strategy to find context:

1. Look at the element's visible text (button label, link text)
2. If the text is vague ("Learn more", "See all", "Buy now"), look UP the node tree for:
   - The nearest heading text (H2, H3, etc.)
   - An eyebrow or subtitle text above the heading
   - The parent card or section's title
3. Construct the accessible name: `"{visible text} about {context heading}"`
4. Write it as a pattern, not a one-off: `"Learn more about + {card title}"` so it works for all cards in the set
5. For icon-only buttons, describe the action: `"{verb} {object}"`
