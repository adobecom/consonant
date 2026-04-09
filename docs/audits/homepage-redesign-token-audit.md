# Homepage Redesign — Token Audit

**Page audited:** `https://redesign--load-c2-styles--upp--adobecom.aem.reviews/homepage/drafts/ramuntea/redesign-demo`
**Token version on page:** `adobecom-s2a-tokens-0.0.11`
**Target token version:** `dist/packages/tokens/css/dev` (current)
**Audit date:** 2026-04-02
**Method:** Live CSS extraction via Playwright + token diff against both versions

---

## Summary

| Severity | Count | Category |
|---|---|---|
| 🔴 Critical | 28 | Hardcoded hex/rgba — no token used at all |
| 🟠 High | 10 | Primitive `--s2a-color-gray-*` used instead of semantic token |
| 🟡 Medium | 7 | Spacing/layout tokens moved to responsive CSS — may not resolve |
| 🟡 Medium | 1 | Token referenced in CSS but not in any token file |

---

## 🔴 Critical — Hardcoded values with no token

### `brand-concierge.css`

The most severe file. Nearly all color decisions are hardcoded. The 30+ `--bc-*` component-scoped vars are set to hardcoded values instead of aliasing S2A tokens.

| Hardcoded value | Where used | Correct S2A token |
|---|---|---|
| `#131313` | Header text color | `--s2a-color-content-title` |
| `#292929` | Body text, card text | `--s2a-color-content-default` |
| `#4B4B4B` | Secondary text | `--s2a-color-content-subtle` |
| `#fff` | White surface / text on dark | `--s2a-color-background-default` or `--s2a-color-content-knockout` |
| `#EAEAED` | Card border | `--s2a-color-border-subtle` |
| `#5574F7` | Blue accent / focus | `--s2a-color-border-brand` or `--s2a-color-content-brand` |
| `#A358B1` | Purple accent | **No S2A token** — off-system color, needs design decision |
| `#000` / `#0004` | Dark overlay | `--s2a-color-transparent-black-64` (closest available) |
| `rgba(0 0 0 / 12%)` | Card shadow | **Token gap** — `--s2a-color-transparent-black-12` not in set; add it or use `--s2a-color-transparent-black-64` at reduced opacity |
| `rgba(0 0 0 / 22%)` | Hover overlay | **Token gap** — use `--s2a-color-transparent-black-24` (needs to be added) |
| `rgba(0 0 0 / 6%)` | Subtle overlay | **Token gap** — needs `--s2a-color-transparent-black-8` |
| `rgba(0 0 0 / 25%)` | Scrim | `--s2a-color-transparent-black-24` (add to token set) |
| `rgba(250 250 250 / 85%)` | Light overlay | `--s2a-color-transparent-white-88` (added in new set — load new tokens) |
| `rgb(0 0 0 / 9%)` | Subtle shadow | **Token gap** — needs `--s2a-color-transparent-black-8` |
| `linear-gradient(122.87deg, #E1E9FF 20.72%, #EFE3FA 34.96%, #F5DFF8 42.08%, #FCDCF5 49.2%, #FFDEC3 91.6%)` | Section background | **No token** — needs a semantic gradient background token (e.g. `--s2a-color-background-gradient-brand`) |

**Component-scoped vars that should alias S2A tokens (currently hardcoded):**

| `--bc-*` var | Should alias |
|---|---|
| `--bc-card-border-color` | `--s2a-color-border-subtle` |
| `--bc-card-border-color-hover` | `--s2a-color-border-default` |
| `--bc-keyboard-focus-color` | `--s2a-color-focus-ring-default` |
| `--bc-card-text-color` | `--s2a-color-content-default` |
| `--bc-button-color` | `--s2a-color-content-knockout` |
| `--bc-button-hover-color` | `--s2a-color-content-knockout` |
| `--bc-floating-button-border-color` | `--s2a-color-border-subtle` |
| `--bc-floating-button-border-color-hover` | `--s2a-color-border-default` |

---

### `router-marquee.css`

All scrim/overlay colors are hardcoded rgba values. These should use the transparent token scale.

| Hardcoded value | Where used | Correct S2A token |
|---|---|---|
| `rgba(0, 0, 0, 0.44)` | Card overlay gradient | `--s2a-color-transparent-black-48` (round up) |
| `rgba(0, 0, 0, 0.60)` | Dark scrim | `--s2a-color-transparent-black-64` |
| `rgba(0, 0, 0, 0.60)` (duplicate) | Media overlay | `--s2a-color-transparent-black-64` |
| `rgba(0, 0, 0, 0.56)` | Gradient stop | `--s2a-color-transparent-black-64` |
| `rgba(0, 0, 0, 0.30)` | Light scrim | **Token gap** — `--s2a-color-transparent-black-32` needs to be added |
| `rgba(0, 0, 0, 0.00)` | Gradient stop zero | Use `transparent` keyword |
| `rgba(255, 255, 255, 0.11)` | Subtle white overlay | **Token gap** — `--s2a-color-transparent-white-12` needs to be added |
| `rgba(255, 255, 255, 0.75)` | Light overlay | `--s2a-color-transparent-white-72` or `--s2a-color-transparent-white-80` |

---

### `rich-content.css`

| Hardcoded value | Where used | Correct S2A token |
|---|---|---|
| `#000` | Text color rule | `--s2a-color-content-title` |
| `rgba(0, 0, 0, 0.00)` | Gradient stop | Use `transparent` keyword |

---

### `carousel-c2.css`

| Hardcoded value | Where used | Correct S2A token |
|---|---|---|
| `#000000` | Text / border color | `--s2a-color-content-title` |
| `rgba(0, 0, 0, 0.09)` | Card shadow | **Token gap** — `--s2a-color-transparent-black-8` or `--s2a-color-transparent-black-12` |

---

## 🟠 High — Primitive tokens used instead of semantic tokens

Gray scale primitives (`--s2a-color-gray-*`) are being used directly. These don't adapt to dark mode or future theming. All should be replaced with semantic `content-*`, `background-*`, or `border-*` tokens.

| Primitive token used | Found in | Semantic replacement | Reasoning |
|---|---|---|---|
| `--s2a-color-gray-1000` | router-marquee, base-card, elastic-carousel, carousel-c2 | `--s2a-color-content-title` | Near-black — primary text color |
| `--s2a-color-gray-25` | router-marquee, elastic-carousel, carousel-c2 | `--s2a-color-background-default` | Off-white — default surface |
| `--s2a-color-gray-75` | elastic-carousel | `--s2a-color-background-subtle` | Light gray surface |
| `--s2a-color-gray-50` | carousel-c2 | `--s2a-color-background-subtle` | Light gray surface |
| `--s2a-color-gray-300` | carousel-c2 | `--s2a-color-border-subtle` | Lightest border |
| `--s2a-color-gray-400` | carousel-c2 | `--s2a-color-border-default` | Default border |
| `--s2a-color-gray-600` | carousel-c2 | `--s2a-color-content-subtle` | Subdued text |
| `--s2a-color-gray-700` | carousel-c2 | `--s2a-color-content-body-subtle` | Secondary body copy |
| `--s2a-color-gray-800` | carousel-c2 | `--s2a-color-content-default` | Default body text |
| `--s2a-color-gray-900` | carousel-c2 | `--s2a-color-content-strong` | Emphasized text |

**Also in `router-marquee.css` — raw primitive typography tokens:**

| Primitive token | Semantic replacement |
|---|---|
| `--s2a-font-size-14` | `--s2a-typography-font-size-body-sm` |
| `--s2a-font-size-16` | `--s2a-typography-font-size-body-md` |
| `--s2a-font-size-18` | `--s2a-typography-font-size-body-lg` |
| `--s2a-font-size-20` | `--s2a-typography-font-size-body-lg` |
| `--s2a-font-size-40` | `--s2a-typography-font-size-title-3` |
| `--s2a-font-size-56` | `--s2a-typography-font-size-title-2` |
| `--s2a-font-size-80` | `--s2a-typography-font-size-title-1` |
| `--s2a-border-radius-4` | `--s2a-border-radius-xs` |
| `--s2a-border-radius-8` | `--s2a-border-radius-sm` |

---

## 🟡 Medium — Spacing/layout tokens from 0.0.11 that moved

These tokens were in the base semantic CSS in 0.0.11 but are now **in the responsive CSS files** (`tokens.responsive.sm/md/lg/xl.css`). They resolve correctly only if all responsive files are loaded before the block CSS. Confirm the homepage is loading all five responsive token files.

| Token | Status | Action |
|---|---|---|
| `--s2a-spacing-sm` | Moved to responsive CSS | Ensure `tokens.responsive.*.css` files are loaded |
| `--s2a-spacing-md` | Moved to responsive CSS | Ensure `tokens.responsive.*.css` files are loaded |
| `--s2a-spacing-xl` | Moved to responsive CSS | Ensure `tokens.responsive.*.css` files are loaded |
| `--s2a-spacing-2xl` | Moved to responsive CSS | Ensure `tokens.responsive.*.css` files are loaded |
| `--s2a-spacing-4xl` | Moved to responsive CSS | Ensure `tokens.responsive.*.css` files are loaded |
| `--s2a-spacing-none` | Moved to responsive CSS | Ensure `tokens.responsive.*.css` files are loaded |
| `--s2a-layout-sm`, `--s2a-layout-lg`, `--s2a-layout-xl` | Moved to responsive CSS | Ensure `tokens.responsive.*.css` files are loaded |

---

## 🟡 Medium — Token referenced but doesn't exist anywhere

| Token | Used in | Action needed |
|---|---|---|
| `--s2a-grid-gutter` | `carousel-c2.css` | Add to token set — referenced for carousel track calculations but absent from all token files |

---

## Token gaps — additions needed in S2A token set

These transparent values are used on the page but don't exist in either 0.0.11 or the current token set. Engineering will silently fall through to the default value (usually transparent or inherited).

| Missing token | Approximate value | Recommended addition |
|---|---|---|
| `--s2a-color-transparent-black-8` | `rgba(0,0,0,0.08)` | Add to primitives |
| `--s2a-color-transparent-black-12` | `rgba(0,0,0,0.12)` | Add to primitives |
| `--s2a-color-transparent-black-24` | `rgba(0,0,0,0.24)` | Add to primitives |
| `--s2a-color-transparent-black-32` | `rgba(0,0,0,0.32)` | Add to primitives |
| `--s2a-color-transparent-white-12` | `rgba(255,255,255,0.12)` | Add to primitives |
| `--s2a-color-background-gradient-brand` | The concierge gradient | Add as semantic token |
| `--s2a-grid-gutter` | Grid column gap | Add to responsive/layout tokens |

---

## Files with no violations

| File | Status |
|---|---|
| `base-card.css` | Only primitive gray issue (`--s2a-color-gray-1000`) — otherwise clean |
| `news.css` | Clean — uses only valid semantic tokens |
| `elastic-carousel.css` | Primitive grays only — no hardcoded values |

---

## Required token file load order

The homepage must load token CSS files in this exact order. Missing or out-of-order files will cause tokens to silently resolve to nothing:

```html
<!-- 1. Primitives -->
<link rel="stylesheet" href="/tokens/tokens.primitives.css">

<!-- 2. Semantic (non-color) -->
<link rel="stylesheet" href="/tokens/tokens.semantic.css">

<!-- 3. Semantic color — light mode -->
<link rel="stylesheet" href="/tokens/tokens.semantic.light.css">

<!-- 4. Responsive (spacing, layout, typography — per breakpoint) -->
<link rel="stylesheet" href="/tokens/tokens.responsive.sm.css">
<link rel="stylesheet" href="/tokens/tokens.responsive.md.css">
<link rel="stylesheet" href="/tokens/tokens.responsive.lg.css">
<link rel="stylesheet" href="/tokens/tokens.responsive.xl.css">
```
