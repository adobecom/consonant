# Story UI Prompt (Copy-Paste Version)

Create a **Hero Marquee** component for Storybook. This is a full-width hero section with centered content.

## Component Structure

Build a Lit template component (`hero-marquee.js`) that includes:

1. **Product Lockup** (top) - Use existing `ProductLockup` component from `packages/components/src/product-lockup/` to display two product icons side-by-side (56px height, 15px gap between them)

2. **Heading** (below product lockup, 16px spacing) - Large heading text using:
   - Font: `var(--font/adobe-clean, 'Adobe_Clean:Bold', sans-serif)`
   - Size: `var(--typography/heading/2xl, 44px)`
   - Line height: `1.25`
   - Color: `var(--c1/text/text, #2c2c2c)`
   - Text: "Heading ipsum dolor sit."
   - Centered

3. **Body Text** (below heading, 24px spacing) - Regular body text using:
   - Font: `var(--font/adobe-clean, 'Adobe_Clean:Regular', sans-serif)`
   - Size: `22px`
   - Line height: `1.5`
   - Color: `var(--c1/text/text, #2c2c2c)`
   - Text: "Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna."
   - Centered

4. **CTA Buttons** (below body, 24px spacing, 24px gap between buttons) - Two buttons using existing `Button` component from `packages/components/src/button/`:
   - Left button: `kind="primary"`, `background="outlined"`, `size="2xl"`, label: "Learn more"
   - Right button: `kind="accent"`, `background="solid"`, `size="2xl"`, label: "Learn more"
   - Centered horizontally

5. **Supplemental Text** (optional, below buttons, 24px spacing) - Bold text using:
   - Font: `var(--font/adobe-clean, 'Adobe_Clean:Bold', sans-serif)`
   - Size: `22px`
   - Line height: `1.5`
   - Color: `var(--c1/text/text, #2c2c2c)`
   - Text: "Body bold supplemental text (optional)"
   - Centered

## Layout Requirements

- Full-width container with centered content
- Outer container: max-width `1200px`, centered
- Inner content: max-width `800px`, centered
- Top/bottom padding: `56px` (XL responsive spacer)
- Background: `var(--c1/background/standard, white)`
- Optional background image (full width/height, absolute positioned, with alt text badge)

## Design Tokens to Use

**Spacing:**

- `var(--spacing-tokens/spacing-xs, 16px)` - between product lockup and heading
- `var(--spacing-tokens/spacing-s, 24px)` - between heading/body, body/buttons, buttons/supplemental
- `56px` - top/bottom padding

**Typography & Colors:**

- All typography and colors must use design tokens (CSS custom properties)
- See full prompt file for exact token names

## Component Pattern

- Use BEM naming: `.c-hero-marquee`, `.c-hero-marquee__heading`, etc.
- Import existing components: `ProductLockup` and `Button`
- Use `html` from `lit` for templating
- Create `hero-marquee.css` with all styles using design tokens
- Follow the existing component structure pattern (see `button.js` and `product-lockup.js` for reference)

## Story Variants

Create stories for:

1. Default (all elements)
2. Without background image
3. Without supplemental text
4. Minimal (heading, body, one button)

## Accessibility

- Use semantic HTML (h1 for heading)
- Include alt text for images
- Ensure keyboard navigation for buttons
- Maintain color contrast

---

**Note:** Import existing `ProductLockup` and `Button` components. Use design tokens for all spacing, typography, and colors. Follow the web-components/Lit pattern used in existing components.
