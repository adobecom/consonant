# Consonant Design Tokens

Compiled CSS custom properties generated from the Consonant token pipeline. This package provides a complete design token system organized by theme (light/dark) and responsive breakpoints (mobile/tablet/desktop/desktop-wide).

Everything in this package lives under `build/css` in the source repo; the tarball simply copies those files into `package/css`.

## What's included

This package provides CSS custom properties (CSS variables) organized into several files:

- **Base tokens** – Theme-agnostic primitives (spacing, typography, borders, shadows, opacity, etc.)
- **Theme tokens** – All color tokens (primitives, semantic, and component-level) organized by light and dark themes
- **Responsive tokens** – Breakpoint-specific overrides for typography, spacing, and layout values

All files define CSS custom properties on `:root` (or theme-specific selectors). If you need to scope tokens to a component, wrap the import in a selector or post-process with your build system.

## File map

- `css/tokens-base.css` – Theme-agnostic foundational primitives (spacing, typography, borders, shadows, opacity, z-index). Load this first as other files may reference these tokens.
- `css/tokens-light.css` – All light theme colors including color primitives, semantic colors, and component-level color tokens. Use when the UI runs in light mode.
- `css/tokens-dark.css` – All dark theme colors including color primitives, semantic colors, and component-level color tokens. Use when the UI runs in dark mode.
- `css/tokens-mobile.css` – Responsive overrides for mobile breakpoint (default/base, no media query needed). Contains typography, spacing, and layout tokens that differ at mobile sizes.
- `css/tokens-tablet.css` – Responsive overrides for tablet breakpoint (`@media (min-width: 600px)`). Import inside your tablet media query.
- `css/tokens-desktop.css` – Responsive overrides for desktop breakpoint (`@media (min-width: 768px)`). Import inside your desktop media query.
- `css/tokens-desktop-wide.css` – Responsive overrides for large screens (`@media (min-width: 1200px)`). Import inside your desktop-wide media query.

## Install & use

```bash
npm install ./consonant-design-tokens-0.0.1.tgz
```

### Basic usage

Import the base tokens and your chosen theme:

```css
@import "consonant-design-tokens/css/tokens-base.css";
@import "consonant-design-tokens/css/tokens-light.css";
```

### With responsive breakpoints

Layer responsive files inside your breakpoint rules:

```css
/* Base and theme */
@import "consonant-design-tokens/css/tokens-base.css";
@import "consonant-design-tokens/css/tokens-light.css";

/* Mobile (default) */
@import "consonant-design-tokens/css/tokens-mobile.css";

/* Tablet */
@media (min-width: 600px) {
  @import "consonant-design-tokens/css/tokens-tablet.css";
}

/* Desktop */
@media (min-width: 768px) {
  @import "consonant-design-tokens/css/tokens-desktop.css";
}

/* Desktop wide */
@media (min-width: 1200px) {
  @import "consonant-design-tokens/css/tokens-desktop-wide.css";
}
```

### Theme switching

Switch between `tokens-light.css` and `tokens-dark.css` based on your runtime theme:

```css
:root {
  @import "consonant-design-tokens/css/tokens-base.css";
  @import "consonant-design-tokens/css/tokens-light.css";
}

[data-theme="dark"] {
  @import "consonant-design-tokens/css/tokens-dark.css";
}
```

## Important notes

### Placeholder tokens

Some tokens in this package may have placeholder values or may be included primarily to demonstrate the token taxonomy (structure). These tokens will have inline comments indicating their status, such as:

```css
--color-background-utility-error: #ffffff; /** Placeholder token: awaiting design definition for final value */
```

**Always check token comments before using a token in production.** Tokens marked as placeholders should be treated as examples or temporary values and may need to be updated before use. The token name and structure are typically finalized, but the value may still be under design review.
