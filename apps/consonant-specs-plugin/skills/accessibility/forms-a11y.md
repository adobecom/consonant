# Forms Accessibility

Labels, error handling, validation, autocomplete, and required field patterns. Use this as the primary reference when filling the Forms card.

---

## Labels (WCAG 3.3.2, 1.3.1)

Every input MUST have a visible `<label>` element programmatically associated via `for`/`id` or wrapping.

**Never acceptable:**
- Placeholder text as the only label — disappears on input, fails 3.3.2
- Visually adjacent text without programmatic association — screen readers can't find it
- `aria-label` as a substitute for a visible label (except icon-only search inputs)

**Grouped fields:** Wrap related inputs in `<fieldset>` with `<legend>`:
- "Shipping address" — street, city, state, zip
- "Payment method" — card number, expiry, CVV
- Radio/checkbox groups — always need a group label

## Required Fields (WCAG 3.3.2)

- Mark with asterisk (*) or "Required" text
- Never use color alone to indicate required
- Include explanatory note at form top: "* Required"
- Use `aria-required="true"` or native `required` attribute

## Error Handling (WCAG 3.3.1, 3.3.3)

**Error identification:**
- Error messages must be in text — not color alone, not icon alone
- Use color + icon + text together
- Position error message near the field (below or inline)
- Associate via `aria-describedby` linking input to error message

**Error suggestions:**
- Describe what went wrong: "Email address is required" not just "Error"
- Suggest correction: "Enter a valid email (e.g. user@example.com)"

**Announcement:**
- Error container: `role="alert"` or inside `aria-live="assertive"` region
- Individual field errors: `aria-invalid="true"` + `aria-describedby="{error-id}"`
- Help text alongside errors: `aria-describedby` can reference multiple IDs

## Error Prevention (WCAG 3.3.4)

For legal, financial, or data-deletion actions:
- Provide confirmation step before submission
- Allow review and correction before final submit
- Provide undo capability after submission

## Autocomplete (WCAG 1.3.5)

Common fields MUST have `autocomplete` attribute:

| Field | Autocomplete value |
|---|---|
| Full name | `name` |
| Email | `email` |
| Phone | `tel` |
| Street address | `street-address` |
| City | `address-level2` |
| State | `address-level1` |
| Zip/Postal | `postal-code` |
| Country | `country-name` |
| Credit card number | `cc-number` |
| Expiry | `cc-exp` |
| CVV | `cc-csc` |
| Username | `username` |
| Current password | `current-password` |
| New password | `new-password` |

## Redundant Entry (WCAG 3.3.7)

- Don't ask for the same information twice in a flow
- If billing = shipping, provide a "same as shipping" checkbox
- Pre-fill fields from previous steps when possible

## Accessible Authentication (WCAG 3.3.8)

- No cognitive function tests for login (no CAPTCHA without audio/image alternative)
- Allow paste into password fields
- Support password managers (don't block autofill)

## Detection Heuristics for Figma

- Look for input fields (rectangles with text inside or placeholder text)
- Check if labels are visually present above/beside inputs
- Look for asterisks or "Required" indicators
- Check for error state variants showing red borders, error messages
- Look for form submit buttons

## Blueline Card Output

- Title = form element or pattern (e.g. "Email input", "Error messages", "Required indicator")
- Desc = requirement and recommendation (e.g. "Visible label above input, associated via for/id. Placeholder 'Enter email' is NOT sufficient as label.")
- Notes = cite WCAG 3.3.2 for labels, 3.3.1 for errors, 1.3.5 for autocomplete
- Warnings = missing labels, color-only required indicators, placeholder-only labels
