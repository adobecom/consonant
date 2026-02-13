# Story UI Prompt: Hero Marquee Component

## Component Description

Create a **Hero Marquee** component that displays a centered hero content block with product branding, heading, body text, and call-to-action buttons. This is a full-width hero section that can optionally include a background image.

## Component Structure

The component should be structured as a Lit template function following our web-components pattern:

```javascript
// File: packages/components/src/hero-marquee/hero-marquee.js
export const HeroMarquee = ({
  heading = "Heading ipsum dolor sit.",
  body = "Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna.",
  supplementalText = "Body bold supplemental text (optional)",
  showSupplemental = false,
  backgroundImage = null,
  backgroundImageAlt = "Alt text (background image)",
  productIcons = [
    { src: "/path/to/adobe-icon.svg", alt: "Adobe" },
    { src: "/path/to/photoshop-icon.svg", alt: "Photoshop" },
  ],
  primaryButton = { label: "Learn more", kind: "accent", background: "solid" },
  secondaryButton = {
    label: "Learn more",
    kind: "primary",
    background: "outlined",
  },
  showMiloTag = false,
  miloTagText = "hero-mq-ctr",
}) => {
  // Lit template here
};
```

## Checklist (Story UI must confirm before outputting code)

1. **Import existing components**
   - `import { Button } from '../../../../packages/components/src/button/index.js';`
   - `import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';`
2. **Use existing components**
   - Use `ProductLockup({ productName, size, tileVariant })` wherever the hero shows the product icons.
   - Use `Button({ label, size: '2xl', kind, background })` for every CTA; never inline `<button>` markup.
3. **Background asset**
   - Default to `import heroBackground from '../../../../packages/components/src/hero-marquee/assets/hero-background.png';`
   - Use it unless `backgroundImage` is explicitly provided.
4. **Tokens**
   - Every CSS value must use an existing `--s2a-*` token; if no alias exists, add `/* Primitive: … */` and note it in the response.
5. **Guardrail reminder**
   - Confirm in the output summary that you reused `Button`, `ProductLockup`, the placeholder background, and only `--s2a-*` tokens.

## Design Token Usage & Guardrails

⚠️ **Guardrail reminder:** Story UI must use our existing semantic/component tokens (`--s2a-*`) before inventing new primitives. Reuse the button/product-lockup components and their existing CSS custom properties. If you _must_ use a primitive token, add a `/* Primitive: … */` comment explaining why.

| Area       | Use These Tokens (examples)                                                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spacing    | `var(--s2a-spacing-md, 16px)`, `var(--s2a-spacing-lg, 24px)`, `var(--s2a-spacing-4xl, 64px)`                                                                    |
| Typography | `var(--s2a-typography-font-size-5xl, 32px)`, `var(--s2a-typography-font-size-2xl, 22px)`, `var(--s2a-typography-line-height-5xl, 36px)`                         |
| Colors     | `var(--s2a-color-background-default, #ffffff)`, `var(--s2a-color-content-default, #292929)`, `var(--s2a-button-color-background-accent-solid-default, #3b63fb)` |
| Components | Use `Button` (`packages/components/src/button/`) and `ProductLockup` (`packages/components/src/product-lockup/`) instead of recreating buttons/tiles            |

**Spacing Details:**

- Small gap: `var(--s2a-spacing-md, 16px)`
- Medium gap / CTA spacing: `var(--s2a-spacing-lg, 24px)`
- Vertical spacer top/bottom: `var(--s2a-spacing-4xl, 64px)`

**Typography:**

- Heading: `var(--s2a-typography-font-size-5xl, 32px)` and `var(--s2a-typography-line-height-5xl, 36px)`
- Body: `var(--s2a-typography-font-size-2xl, 22px)` with `line-height: var(--s2a-spacing-lg, 24px)` _(Primitive: awaiting typography line-height alias)_
- Supplemental: `var(--s2a-typography-font-size-lg, 18px)`

**Colors:**

- Background: `var(--s2a-color-background-default, #ffffff)`
- Text: `var(--s2a-color-content-default, #292929)`
- Buttons: use existing button tokens (`--s2a-button-color-background-accent-solid-default`, etc.) by calling the real `Button` component.

**Layout:**

- Container max-width: `1200px`
- Content max-width: `800px`
- Center content horizontally and vertically
- Gap between buttons: `24px` (`var(--spacing-tokens/spacing-s, 24px)`)
- Gap between product icons: `15px`

## Existing Components to Leverage

1. **Product Lockup Component** (`packages/components/src/product-lockup/`)
   - Already exists in the codebase
   - Import: `import { ProductLockup } from '../../../product-lockup/index.js';`
   - Use for displaying the two product icons side-by-side
   - Size: 56px height (XL variant)

2. **Button Component** (`packages/components/src/button/`)
   - Already exists in the codebase
   - Import: `import { Button } from '../../../button/index.js';`
   - Use for both CTA buttons
   - Primary button: `kind="accent"`, `background="solid"`, `size="2xl"`
   - Secondary button: `kind="primary"`, `background="outlined"`, `size="2xl"`

## Component Patterns to Follow

**BEM Naming:**

- Component class: `.c-hero-marquee`
- Elements: `.c-hero-marquee__background`, `.c-hero-marquee__container`, `.c-hero-marquee__content`, `.c-hero-marquee__product-lockup`, `.c-hero-marquee__heading`, `.c-hero-marquee__body`, `.c-hero-marquee__cta-wrap`, `.c-hero-marquee__supplemental`, `.c-hero-marquee__milo-tag`

**Data Attributes:**

- Use data attributes for variants if needed: `data-variant="default"`

**CSS Structure:**

- Create `hero-marquee.css` in the same directory
- Use CSS custom properties (design tokens) for all values
- Support theme switching via `:root[data-theme="light"]` and `:root[data-theme="dark"]`

## Layout Structure

```
Hero Marquee (full width, centered)
├── Background Image (optional, absolute positioned, full width/height)
│   └── Alt Text Badge (bottom, if background image present)
├── Spacer (56px XL responsive - top)
├── Container (max-width: 1200px, centered)
│   └── Content (max-width: 800px, centered)
│       ├── Product Lockup (gap: 15px between icons)
│       │   ├── Icon 1 (56px × 56px)
│       │   └── Icon 2 (56px × 56px)
│       ├── Heading (XL, centered)
│       ├── Body (XL, centered)
│       ├── CTA Wrap (gap: 24px, centered)
│       │   ├── Secondary Button (outlined)
│       │   └── Primary Button (accent, solid)
│       └── Supplemental Text (optional, bold, XL, centered)
├── Spacer (56px XL responsive - bottom)
└── Milo Tag (optional, absolute top-right)
```

## Story Requirements

1. **Default Story**: Full component with all elements, background image placeholder
2. **Without Background**: Same as default but no background image
3. **Without Supplemental**: Hide supplemental text
4. **Without Milo Tag**: Hide Milo tag
5. **Minimal**: Just heading, body, and one primary button

## Accessibility

- Ensure proper heading hierarchy (h1 for heading)
- Include alt text for background image
- Ensure buttons are keyboard accessible
- Maintain proper color contrast ratios
- Use semantic HTML elements

## Responsive Behavior

- Container uses flexbox with `flex-wrap` and responsive gap tokens
- Content should stack appropriately on smaller screens
- Spacing tokens should adapt based on breakpoints

## Implementation Notes

- Use `html` from `lit` for templating
- Import existing Button and ProductLockup components
- All spacing, typography, and colors must use design tokens (CSS custom properties)
- Follow the exact spacing values from the design (16px, 24px, 56px)
- Center all content both horizontally and vertically
- Background image should cover full area with `object-fit: cover`
- Milo tag should be absolutely positioned in top-right corner
- All text should be centered (`text-align: center`)

---

**Use this prompt in Story UI to generate the Hero Marquee component and its Storybook story.**
