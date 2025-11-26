# S2A Design Tokens

This package is the **source of truth** for every design token that ships in S2A.
It outputs **CSS only** (no JS runtime required).
All CSS is generated from our internal Figma Variables → JSON export (`tokens/`), but these raw JSON files are **not** included in the published package.

**Package name:** `s2a-tokens`  
**Current version:** `0.0.4`

---

# Token Architecture Overview

The design tokens follow a **three-tier system** that maps directly to our Figma setup:

1. **Primitives** → raw values (spacing, type, radii, color ramps)
2. **Semantic** → meaning-based tokens (surface, text, border, action, spacing t-shirt scale)
3. **Component** → UI-specific tokens (Button, Card, Input, etc.) _(currently filtered out - not in use yet)_

Every tier builds on the one below it.

The CSS output currently includes primitives and semantic tokens. Component tokens are filtered out from the build output until they are ready for use.

---

# How the CSS Files Build on Each Other

### 1. **Primitives**

Core raw values. No themes. No modes. No breakpoints.

| File                              | Contains                                                                |
| --------------------------------- | ----------------------------------------------------------------------- |
| **`tokens.primitives.css`**       | All non-color primitives (spacing, typography, radii, opacity, shadows) |
| **`tokens.primitives.light.css`** | Color primitives for **light** mode                                     |
| **`tokens.primitives.dark.css`**  | Color primitives for **dark** mode                                      |

**Who uses primitives?**
Semantics. Everything semantic maps directly to these raw values.
Developers usually don’t use primitives directly unless they customize tokens.

---

### 2. **Semantic Tokens**

Meaning-based mappings. These define your design language.

| File                            | Contains                                                              |
| ------------------------------- | --------------------------------------------------------------------- |
| **`tokens.semantic.css`**       | Non-color semantics (spacing steps, radii, typography mappings, etc.) |
| **`tokens.semantic.light.css`** | Semantic color tokens for **light** (surface, text, border, action)   |
| **`tokens.semantic.dark.css`**  | Semantic color tokens for **dark**                                    |

**How semantics work:**

- They **reference primitives**
- They provide a stable contract for all components
- They change per mode (light/dark) but not per breakpoint

**Component tokens depend on these.**

---

### 3. **Component Tokens**

> **Note:** Component tokens are currently filtered out from the build output. The build logic is preserved for future use, but component CSS files are not generated at this time.

| File                             | Contains                                                         | Status       |
| -------------------------------- | ---------------------------------------------------------------- | ------------ |
| **`tokens.component.css`**       | Structural component tokens (radii, spacing, layout) — no colors | Filtered out |
| **`tokens.component.light.css`** | Component color tokens for **light**                             | Filtered out |
| **`tokens.component.dark.css`**  | Component color tokens for **dark**                              | Filtered out |

**How component tokens work (when enabled):**

- They **reference semantic tokens**
- They encapsulate UI-level patterns (Button, Card, Input)
- They inherit theme automatically via light/dark variants

---

# File Structure

The package outputs CSS files in two directories:

- **`css/dev/`** - Uncompressed CSS files for development inspection
- **`css/min/`** - Minified consolidated CSS file for production (`tokens.min.css`)

## Available Files

### Development Files (`css/dev/`)

- `tokens.primitives.css` - Non-color core primitives
- `tokens.primitives.light.css` - Color primitives for light mode
- `tokens.primitives.dark.css` - Color primitives for dark mode
- `tokens.semantic.css` - Non-color semantic tokens
- `tokens.semantic.light.css` - Semantic color tokens for light mode
- `tokens.semantic.dark.css` - Semantic color tokens for dark mode
- ~~`tokens.component.css`~~ - Component tokens (currently filtered out - not in use yet)
- ~~`tokens.component.light.css`~~ - Component tokens (currently filtered out - not in use yet)
- ~~`tokens.component.dark.css`~~ - Component tokens (currently filtered out - not in use yet)

### Production File (`css/min/`)

- `tokens.min.css` - Consolidated minified file containing all token layers

---

# How Everything Layers in CSS (Order Matters)

Here is the correct stacking order for any app. **Import these in your root `index.css` or main stylesheet:**

**For production (recommended):**

```css
/* Single consolidated minified file with all token layers in correct order */
@import "s2a-tokens/css/min/tokens.min.css";
```

**For development (using individual files):**

```css
/* 1. Raw primitives */
@import "s2a-tokens/css/dev/tokens.primitives.css";
@import "s2a-tokens/css/dev/tokens.primitives.light.css";
@import "s2a-tokens/css/dev/tokens.primitives.dark.css";

/* 2. Semantic layer */
@import "s2a-tokens/css/dev/tokens.semantic.css";
@import "s2a-tokens/css/dev/tokens.semantic.light.css";
@import "s2a-tokens/css/dev/tokens.semantic.dark.css";

/* 3. Components (currently filtered out - not in use yet) */
/* @import "s2a-tokens/css/dev/tokens.component.css"; */
/* @import "s2a-tokens/css/dev/tokens.component.light.css"; */
/* @import "s2a-tokens/css/dev/tokens.component.dark.css"; */
```

**Why this order?**

The import order matters because CSS custom properties cascade and can reference each other:

1. **Primitives first** — These are the foundation. They contain raw values (like `--s2a-spacing-16: 16px`) that everything else references.

2. **Semantic second** — These reference primitives (like `--s2a-spacing-md: var(--s2a-spacing-16)`). They must come after primitives so the references resolve.

3. **Component last** — These reference semantic tokens (like `--s2a-button-padding: var(--s2a-spacing-md)`). They come last so they can use semantic and primitive token values. _(Currently filtered out - not in use yet)_

**Where do I import these?**

Import all token files in your **root `index.css`** (or main global stylesheet) at the top, before any component styles. This ensures all CSS custom properties are available throughout your app.

**What happens if you import in the wrong order?**

If you import components before primitives, the CSS variables they reference won't exist yet, causing `var()` references to fail. Similarly, if components come before semantics, their references to semantic tokens will be undefined.

**Can you skip files?**

Yes! You can skip files you don't need:

- Skip dark mode files if you only support light mode

Just make sure whatever you import, you maintain the layer order (primitives → semantic → component).

**Note:** Component tokens are currently filtered out from the build output and are not available for import.

**Recommended: Use the consolidated minified file for production**

For production, simply import the single consolidated minified file which includes all layers in the correct order:

```css
@import "s2a-tokens/css/min/tokens.min.css";
```

---

# TL;DR for Engineers

1. **For production, use the consolidated minified file (recommended):**

   ```css
   @import "s2a-tokens/css/min/tokens.min.css";
   ```

   **For development, import individual files:**

   ```css
   @import "s2a-tokens/css/dev/tokens.primitives.css";
   @import "s2a-tokens/css/dev/tokens.primitives.light.css";
   @import "s2a-tokens/css/dev/tokens.primitives.dark.css";

   @import "s2a-tokens/css/dev/tokens.semantic.css";
   @import "s2a-tokens/css/dev/tokens.semantic.light.css";
   @import "s2a-tokens/css/dev/tokens.semantic.dark.css";

   /* Component tokens (currently filtered out - not in use yet) */
   ```

   **Import these in your root `index.css` or main global stylesheet.**

2. **Switch themes by setting the data attribute:**

   ```ts
   document.documentElement.dataset.theme = "dark";
   ```

3. **All light/dark files include the proper `:root[data-theme="X"]` wrappers**
   so they never override each other.

4. **All tokens cascade correctly:**
   Semantic → Primitives. (Component tokens are currently filtered out)

**Common questions:**

**Q: Do I need to import all these files?**  
A: No! For production, just use the single minified file: `@import "s2a-tokens/css/min/tokens.min.css";` For development, import only what you need. If you only support light mode, skip the dark files. Just maintain the layer order (primitives → semantic → component).

**Q: What if I import them in the wrong order?**  
A: CSS custom property references will fail. If `tokens.semantic.css` references `--spacing-16` but `tokens.primitives.css` hasn't been imported yet, the reference will be undefined.

**Q: Can I import just the files I need?**  
A: Yes! For example, if you only need semantic tokens in light mode:

```css
/* In your root index.css */
@import "s2a-tokens/css/dev/tokens.primitives.css";
@import "s2a-tokens/css/dev/tokens.primitives.light.css";
@import "s2a-tokens/css/dev/tokens.semantic.css";
@import "s2a-tokens/css/dev/tokens.semantic.light.css";
```

Or use the consolidated minified file which includes everything:

```css
@import "s2a-tokens/css/min/tokens.min.css";
```

**Q: Where do I put these imports?**  
A: Import them in your **root `index.css`** (or main global stylesheet) at the very top, before any component styles. This ensures all CSS custom properties are available throughout your app.

**Q: Why are light/dark files separate?**  
A: They use `:root[data-theme="light"]` and `:root[data-theme="dark"]` selectors, so they never conflict. You can import both and switch themes at runtime without reloading.

---

# File Output Summary Table

| Layer          | Light | Dark | Non-Color | Status       | Purpose                                            |
| -------------- | ----- | ---- | --------- | ------------ | -------------------------------------------------- |
| **Primitives** | ✔    | ✔   | ✔        | Available    | Raw values. Foundation.                            |
| **Semantic**   | ✔    | ✔   | ✔        | Available    | Language of the system. Maps meaning → primitives. |
| **Component**  | ✔    | ✔   | ✔        | Filtered out | UI-level patterns. Maps components → semantics.    |

**Output Locations:**

- Development files: `css/dev/` (uncompressed, individual files)
- Production file: `css/min/tokens.min.css` (consolidated, minified)

---

# Example Usage

All CSS custom properties are prefixed with `s2a-`:

```css
.card {
  padding: var(
    --s2a-spacing-md
  ); /* semantic → references --s2a-spacing-16 (primitive) */
  border-radius: var(
    --s2a-border-radius-sm
  ); /* semantic → references --s2a-border-radius-8 (primitive) */
  background: var(
    --s2a-color-background-default
  ); /* semantic color → references --s2a-color-gray-25 (primitive color) */
  box-shadow: var(--s2a-shadow-level-1-x) var(--s2a-shadow-level-1-y)
    var(--s2a-shadow-level-1-blur) var(--s2a-shadow-level-1-color); /* primitive */
}

/* Component tokens are currently filtered out - not available yet */
/* .button {
  background: var(
    --s2a-button-color-background-primary-solid-default
  ); 
  color: var(
    --s2a-button-color-content-primary-solid-default
  ); 
} */

.heading {
  font-size: var(--s2a-typography-heading-xl-font-size);
  line-height: var(--s2a-typography-heading-xl-line-height);
}
```

---

# CSS Processing Features

The build system automatically applies several CSS optimizations and modernizations:

- **Hex Color Shorthand**: Converts full hex colors to shorthand when possible (`#ffffff` → `#fff`)
- **Modern Color Syntax**: Converts legacy `rgba()` to modern space-separated `rgb()` syntax (`rgba(0, 0, 0, 0.16)` → `rgb(0 0 0 / 16%)`)
- **Alpha Percentage Conversion**: Converts decimal alpha values to percentages (`0.12` → `12%`)
- **Zero Unit Removal**: Removes units from zero values (`0px` → `0`, but `0%` remains `0%`)
- **Font Weight Conversion**: Maps string font-weight values to numeric CSS values (`"Regular"` → `400`)
- **Line-Height Unitless Conversion**: Converts line-height values to unitless ratios based on associated font-size

These optimizations are applied automatically to all generated CSS files.

---

# Versioning

Same as before — SemVer:

- **Patch:** internal fixes, no breaking changes
- **Minor:** additive tokens or new modes
- **Major:** token removals/renames or breaking structural changes
