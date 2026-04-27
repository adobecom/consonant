# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.14] - 2026-04-27

### 💥 Breaking changes

- **`lg` breakpoint typography scale updated (redesign team)**
  All title and super roles in `tokens.responsive.lg.css` now reference larger font-size, adjusted letter-spacing, and taller line-height primitives. Consumers applying `lg` breakpoint overrides will see larger text:

  | Role | Font size (was → now) | Line height (was → now) |
  |---|---|---|
  | `super` | `9xl` → `11xl` | `4xl` → `6xl` |
  | `title-1` | `7xl` → `10xl` | `3xl` → `5xl` |
  | `title-2` | `6xl` → `7xl` | `2xl` → `3xl` |
  | `title-3` | `3xl` → `6xl` | `lg` → `2xl` |
  | `title-4` | `2xl` → `4xl` | `md` → `xl` |
  | `title-5` | `xl` → `2xl` | `sm` → `md` |
  | `title-6` | `md` → `lg` | *(unchanged)* |
  | `body-lg` | `lg` → `xl` | *(unchanged)* |

  Letter-spacing also shifted for `super` (`md` → `xs`), `title-2` (`xl` → `lg`), `title-3` (`5xl` → `xl`), `title-4` (`5xl` → `3xl`), and `title-5` (`5xl` → `4xl`).

  Visually re-check any layout using the `lg` breakpoint's title or super scale.

- **`--s2a-font-line-height-sm-md` removed**
  The intermediate 21px line-height semantic stop has been removed from `tokens.semantic.css`. Any direct usage of `var(--s2a-font-line-height-sm-md)` will now fall through to the browser default. Migrate to `--s2a-font-line-height-sm` (20px) or `--s2a-font-line-height-md` (24px) depending on context.

### 🧹 Build & filtering

- **Figma sync refreshed across 16 JSON files**
  Latest pull includes updated responsive container grid, semantic color theme additions, typography collection updates, and static variable values.

---

## [0.0.13] - 2026-04-22

### 💥 Breaking changes

- **Letter-spacing semantic ramp restructured**
  - Three new stops inserted; existing stops `3xl`–`8xl` renumbered to `4xl`–`11xl`. Any downstream CSS hardcoding the old semantic names will resolve to different values:

  | Old name | New name | Value |
  |---|---|---|
  | *(new)* | `--s2a-font-letter-spacing-3xl` | `-1px` |
  | `--s2a-font-letter-spacing-3xl` | `--s2a-font-letter-spacing-4xl` | `-0.96px` |
  | `--s2a-font-letter-spacing-4xl` | `--s2a-font-letter-spacing-5xl` | `-0.48px` |
  | `--s2a-font-letter-spacing-5xl` | `--s2a-font-letter-spacing-6xl` | `-0.2px` |
  | `--s2a-font-letter-spacing-6xl` | `--s2a-font-letter-spacing-7xl` | `0` |
  | `--s2a-font-letter-spacing-7xl` | `--s2a-font-letter-spacing-10xl` | `+0.16px` |
  | `--s2a-font-letter-spacing-8xl` | `--s2a-font-letter-spacing-11xl` | `+0.24px` |
  | *(new)* | `--s2a-font-letter-spacing-8xl` | `+0.12px` |
  | *(new)* | `--s2a-font-letter-spacing-9xl` | `+0.14px` |

  Stops `xs`–`2xl` are unchanged.

- **External collections excluded by default**
  - The sync step now drops every `c1/*`, `annotation`, and `s2c/*` collection before generating JSON. Palette-only primitives such as `--s2a-color-content-subdued-default` and annotation visibility tokens are **removed** from the package. If you depended on these non-system tokens, migrate to the sanctioned S2A semantics (e.g., `--s2a-color-content-default`).

- **All CSS output now requires `--s2a-` prefix**
  - Legacy unprefixed duplicates (`--border-radius-*`, `--spacing-*`, `--color-transparent-*`, `--font-family-*`, `--shadow-level-*`) have been removed from all output files. Only `--s2a-*` custom properties are emitted. Shadow color references now correctly point to `--s2a-color-transparent-black-*`.

### ✨ Improvements

- **New line-height stop: `sm-md`**
  - `--s2a-font-line-height-sm-md: 21px` added between `sm` (20px) and `md` (24px).

- **RouterCard layout tokens shipped**
  - The following system tokens now appear in each responsive CSS file:
    - `--s2a-router-card-width-resting`
    - `--s2a-router-card-width-expanded`
    - `--s2a-router-card-width-min`
    - `--s2a-router-card-width-max`
    - `--s2a-router-card-height-max`
    - `--s2a-router-card-media-height`
    - `--s2a-router-card-padding`
    - `--s2a-router-card-gap`

- **Responsive output mirrors the collection exactly**
  - `tokens.responsive.{sm,md,lg,xl}.css` now emit only the tokens defined in the Responsive collection. All references stay as `var(--s2a-…)`.

### 🧹 Build & filtering

- **Prefix enforcement in all CSS output**
  - Primitives, light/dark color, and semantic filters now exclusively emit `path[0] === "s2a"` tokens. Legacy bare-path duplicates from non-S2A Figma collections are silently dropped.

- **Shadow color references fixed**
  - Shadow `$value` references are rewritten from `{color.transparent.*}` to `{s2a.color.transparent.*}` before Style Dictionary runs, so `--s2a-shadow-level-*-color` variables correctly resolve to `--s2a-color-transparent-black-*`.

- **Source tagging inside Style Dictionary**
  - Tokens from the Responsive collection are tagged before merging with base primitives so the CSS filter can include only those tagged nodes.

---

## [0.0.12] - 2026-03-18

### 💥 Breaking changes

- **Removed XS responsive file**
  - `css/dev/tokens.responsive.xs.css` is no longer shipped in `0.0.12`.
  - If consumers import `@import "…/tokens.responsive.xs.css";` directly, those imports must be removed or updated.

- **Grid + section layout tokens removed**
  - The following CSS custom properties existed in `0.0.11` and are **gone** in `0.0.12` (they are not re‑emitted under new names):
    - **Grid/container/spacing**
      - `--s2a-grid-gutter`
      - `--s2a-grid-element-gap-sm`
      - `--s2a-grid-element-gap-lg`
      - `--s2a-grid-breakpoint-min-width`
      - `--s2a-grid-breakpoint-max-width`
      - `--s2a-grid-container-max-width`
      - `--s2a-grid-container-body-max-width`
      - `--s2a-grid-container-content-max-width`
      - `--s2a-grid-container-padding-inline`
      - `--s2a-grid-container-width-percent`
    - **Section padding**
      - `--s2a-section-padding-xs`
      - `--s2a-section-padding-sm`
      - `--s2a-section-padding-md`
      - `--s2a-section-padding-lg`
      - `--s2a-section-padding-xl`
      - `--s2a-section-padding-none`
  - In `0.0.11` these were emitted from `tokens.responsive.{xs,sm,md,lg,xl}.css`. They are no longer present in any layer in `0.0.12`, so any direct usages must be migrated.

- **Line-height primitives reverted from relative to px**
  - `--s2a-font-line-height-*` primitives changed from unitless ratios back to absolute pixel values:
    - Example: `--s2a-font-line-height-16` was `1.333` → now `16px`.
    - Example: `--s2a-font-line-height-69` was `1.232` → now `69px`.
  - All semantic/responsive line-height aliases (e.g., `--s2a-typography-line-height-body-md`) still point at these primitives, so any `line-height: var(--s2a-…);` usage now resolves to a fixed px length instead of a scaling ratio.
  - Teams should visually re‑check vertical rhythm where they relied on the old unitless behavior.

### ✨ Improvements

- **Viewport vertical padding tokens**
  - Introduced new viewport‑scoped section padding tokens:
    - `--s2a-viewport-vertical-padding-2xs`
    - `--s2a-viewport-vertical-padding-xs`
    - `--s2a-viewport-vertical-padding-sm`
    - `--s2a-viewport-vertical-padding-md`
    - `--s2a-viewport-vertical-padding-lg`
    - `--s2a-viewport-vertical-padding-xl`
    - `--s2a-viewport-vertical-padding-none`
  - Recommended migration mapping from the removed section padding family:
    - `--s2a-section-padding-xs` → `--s2a-viewport-vertical-padding-xs`
    - `--s2a-section-padding-sm` → `--s2a-viewport-vertical-padding-sm`
    - `--s2a-section-padding-md` → `--s2a-viewport-vertical-padding-md`
    - `--s2a-section-padding-lg` → `--s2a-viewport-vertical-padding-lg`
    - `--s2a-section-padding-xl` → `--s2a-viewport-vertical-padding-xl`
    - `--s2a-section-padding-none` → `--s2a-viewport-vertical-padding-none`

- **Additional primitives + semantics**
  - Blur primitives:
    - Added `--s2a-blur-24` and `--s2a-blur-128` to extend the blur scale.
  - Transparent color ramps:
    - Added higher‑alpha steps for both black and white:
      - `--s2a-color-transparent-black-72`
      - `--s2a-color-transparent-black-80`
      - `--s2a-color-transparent-black-88`
      - `--s2a-color-transparent-black-96`
      - `--s2a-color-transparent-white-72`
      - `--s2a-color-transparent-white-80`
      - `--s2a-color-transparent-white-88`
      - `--s2a-color-transparent-white-96`
  - Semantic content color:
    - Added `--s2a-color-content-strong` for stronger text emphasis separate from the default content color.

### 🧹 Build & filtering

- **Responsive CSS surface tightened**
  - Updated the responsive build filters to:
    - Exclude semantic layout tokens (`--s2a-layout-*`) from `tokens.responsive.{sm,md,lg,xl}.css` (they continue to live in the semantic layer).
    - Include only responsive `s2a.viewport.*`, `s2a.layout-guide.*`, `s2a.typography.*`, and container tokens needed at breakpoints.
  - Reinforced filtering of Figma tokens whose description contains `"DESIGN ONLY"` so they do not appear in the published CSS output.

---

## [0.0.11] - 2026-02-25

### ✨ Improvements

- **Typo fix**: Corrected "sublte" → "subtle" in token names/values.
- **Section padding tokens**: Included `s2a.section.*` in the responsive build filter so section padding tokens (`--s2a-section-padding-none` through `--s2a-section-padding-xl`) from the S2A / Responsive / Grid / Typography collection now appear in `tokens.responsive.{sm,md,lg,xl}.css`.
- **Redundant break removed**: Removed the redundant break (token/breakpoint) from the set.

### 🧹 Build

- **DESIGN ONLY tokens excluded**: Tokens whose Figma description contains "DESIGN ONLY" are now stripped from the token tree before CSS generation, so they no longer appear in any generated CSS custom properties (e.g. `--s2a-grid-container-_padding-inline` removed from responsive files).

---

## [0.0.10] - 2026-03-04

### ✨ Improvements

- **Responsive typography tokens**: Finalized responsive `typography.*` tokens for `xs / sm / md / lg / xl` breakpoints, ensuring each role (super, titles, body, eyebrow, label, caption) keeps its `font-size`, `letter-spacing`, and `line-height` trio in sync.
- **Line-height mapping fix**: Corrected the mapping for the `76px` line-height primitive so it now produces a sane unitless ratio (`--s2a-font-line-height-76: 1.188`) instead of `4.75`.
- **Letter-spacing units**: Reverted letter-spacing primitives back to px values that exactly match Figma dev mode, avoiding over-tight text caused by incorrect em conversion.

### 🧼 Token surface cleanup

- **Filter button/iconbutton semantics**: Temporarily removed all semantic `button` and `iconbutton` color tokens from `tokens.semantic.light.css` / `tokens.semantic.dark.css` until the component APIs are finalized.
- **Blur primitives only in primitives**: Ensured `s2a.blur.*` tokens only appear in `tokens.primitives.css` and are not duplicated in semantic output.

### 🧱 Build & packaging

- **Responsive CSS in package**: Included `tokens.responsive.{xs,sm,md,lg,xl}.css` in the published package and Storybook so consumers can inspect breakpoint-specific grids and typography.
- **New tarball**: Published `@adobecom/s2a-tokens@0.0.10` and added `releases/adobecom-s2a-tokens-0.0.10.tgz` for handoff.

---

## [0.0.9] - 2026-03-03

### ✨ Improvements

- **Figma sync refresh**: Pulled the latest primitives, semantic, and responsive collections from Figma (including the new *S2A / Responsive / Grid / Typography* collection).
- **Deterministic build**: Simplified the Style Dictionary pipeline so a clean `json/` + `dist/` followed by `sync-figma` and `build` will always regenerate the same CSS for a given Figma state.
- **Semantic vs primitives**: Tightened filters so semantic CSS no longer re-emits primitive values (spacing, radii, opacity, typography) or raw color ramps.

### 📐 Naming & structure

- **s2a-prefixed paths only once**: Fixed the custom name transform so tokens derived from `s2a.*` paths no longer get a duplicate `s2a-` prefix in their CSS variable names.
- **Reference rewrites for dimensions**: Normalized semantic dimension references like `{spacing.96}` / `{border.radius.2}` to `{s2a.spacing.96}` / `{s2a.border.radius.2}` so they resolve correctly during the build.

### 🧱 New output

- **Responsive tokens (beta)**: Introduced the first pass of responsive CSS files:
  - `tokens.responsive.xs.css`, `tokens.responsive.sm.css`, `tokens.responsive.md.css`, `tokens.responsive.lg.css`, `tokens.responsive.xl.css`
  - Each file wires `--s2a-typography-*` roles to the appropriate primitive font-size/line-height/letter-spacing tokens for its breakpoint.
- **Package tarball**: Published `@adobecom/s2a-tokens@0.0.9` and captured `releases/adobecom-s2a-tokens-0.0.9.tgz` as a distributable artifact.

---

## [0.0.8] - 2025-02-26

### ✨ Improvements

- **Quote font-family values**: Font family token values are now always output with quotes (e.g. `"Adobe Clean"`) to prevent multi-word families being parsed as separate CSS identifiers.
- **Numeric font-weight values**: Restored numeric font-weight output (100–900) instead of names. Added `font.family.*` and `font.weight.*` path support for primitive typography tokens.
- **De-duplicate Black weights**: Flattened duplicate font-weight tokens where multiple families map to the same value (e.g. `adobe-clean.black` and `adobe-clean-display.black` both 900). Display black now references the canonical token.

---

## [0.0.7] - 2025-02-25

### ✨ Improvements

- **Typography & layout sync**: Synced Figma variables; added typography and component token collections. Font sizes are rem-based.
- **Responsive tokens**: Added tablet breakpoint and responsive typography/layout grid outputs (desktop, tablet, mobile).
- **Line-height fix**: Resolved missing `line-height.54` token in build output.

### 📦 Publishing & Repo

- **Package rename**: `s2a-tokens` → `@adobecom/s2a-tokens` (GitHub Packages).
- **Contributing**: Added `docs/contributing.md` and `.github/CODEOWNERS` for Git workflow and ownership.
- **Releases**: `.gitignore` updated so tarballs in `releases/` can be committed for handoff.

---

## [0.0.4] - 2025-11-26

### ✨ Improvements

- **Dataviz palette filtering**: Removed all `color/dataviz/*` primitives from the generated CSS outputs.
  - `tokens.primitives.light.css` and `tokens.primitives.dark.css` now only contain the core palette used by the system UI.
  - Helps keep the public token surface focused on supported UI colors while preserving dataviz variables in the Figma export.

### 🧰 Internal

- Further modularized the token build pipeline into dedicated transformer and utility modules:
  - `transformers/unit-conversions`, `transformers/css-processors`, `transformers/typography-transformers`
  - `utils/token-utils`, `utils/string-utils`, `utils/css-file-utils`
- Updated tests to import from the new modules while preserving existing behavior and coverage (205 tests).

---

## [0.0.3] - 2024-12-XX

### 🎉 Major Changes

#### Package Rename

- **BREAKING**: Package renamed from `consonant-design-tokens` to `s2a-tokens`
- Updated all references and exports to reflect new package name

#### Complete CSS Output Restructure

- **BREAKING**: Completely reorganized CSS output to mirror Figma variable collections and token tiers
- New file structure organized by layer (primitives, semantic, component) and mode (core, light, dark)
- Output files now follow the pattern: `tokens.{layer}.{mode}.css`

**New Output Files:**

- `tokens.primitives.css` - Non-color core primitives (spacing, typography, radii, opacity, shadows)
- `tokens.primitives.light.css` - Color primitives for light mode
- `tokens.primitives.dark.css` - Color primitives for dark mode
- `tokens.semantic.css` - Non-color semantic tokens (t-shirt sizing, etc.)
- `tokens.semantic.light.css` - Semantic color tokens for light mode
- `tokens.semantic.dark.css` - Semantic color tokens for dark mode
- ~~`tokens.component.css`~~ - Component tokens (currently filtered out - not in use yet)
- ~~`tokens.component.light.css`~~ - Component tokens (currently filtered out - not in use yet)
- ~~`tokens.component.dark.css`~~ - Component tokens (currently filtered out - not in use yet)

#### CSS Variable Prefixing

- **BREAKING**: All CSS custom properties now prefixed with `s2a-` (e.g., `--s2a-spacing-16` instead of `--spacing-16`)
- Custom Style Dictionary transform `name/css-s2a` added to handle prefixing
- All token references automatically updated to use new prefix

#### Output Organization

- Separated development and production outputs:
  - `css/dev/` - Uncompressed CSS files for development inspection
  - `css/min/` - Minified CSS files for production
- Consolidated all minified output into a single `tokens.min.css` file
- Removed individual `.min.css` files in favor of consolidated approach

### ✨ New Features

#### CSS Processing Enhancements

- **Hex Color Shorthand**: Automatically converts full hex colors to shorthand when possible
  - `#ffffff` → `#fff`
  - `#ff0000` → `#f00`
  - `#aabbcc` → `#abc`
- **Modern Color Syntax**: Converts legacy `rgba()` syntax to modern space-separated `rgb()` syntax
  - `rgba(0, 0, 0, 0.16)` → `rgb(0 0 0 / 16%)`
  - Supports both decimal and percentage alpha values
- **Zero Unit Removal**: Automatically removes units from zero values
  - `0px` → `0`
  - `0rem` → `0`
  - `0%` remains `0%` (preserved for percentage contexts)
- **Alpha Percentage Conversion**: Converts decimal alpha values to percentages
  - `0.12` → `12%`
  - `0.5` → `50%`

#### Typography Enhancements

- **Font Weight Conversion**: String font-weight values now map to numeric CSS values
  - `"Regular"` → `400`
  - `"Medium"` → `500`
  - `"Bold"` → `700`
  - `"ExtraBold"` → `800`
  - `"Black"` → `900`
- **Line-Height Unitless Conversion**: Line-height values now correctly convert to unitless ratios
  - Calculates ratio based on associated font-size
  - Rounds to 6 decimal places for precision
  - Strips trailing zeros for clean output
- **Semantic Font Size References**: Semantic t-shirt font sizes now correctly reference primitive font-size tokens
  - Ensures proper cascade and reference resolution
  - Maintains design system hierarchy

#### Build System Improvements

- Enhanced token categorization by collection and mode
- Improved reference resolution across token layers
- Better error handling for missing token references
- Graceful fallback for component token builds when references are missing

### 🔧 Improvements

#### Filtering & Organization

- Shadow colors correctly placed in primitive core layer (removed from component files)
- Semantic tokens properly filtered to exclude direct primitive values
- Component tokens correctly exclude primitive and semantic paths
- Letter-spacing tokens temporarily filtered out due to conversion issues (with explanatory comments)

#### Documentation

- Comprehensive README.md update with:
  - Three-tier token architecture explanation (primitives, semantic, component)
  - Detailed file structure documentation
  - Import order guidelines
  - Usage examples with real token names
  - TL;DR section for quick reference
  - Common questions and answers
- Added README.md and CHANGELOG.md to package files for npm distribution

#### Testing

- Comprehensive test coverage added:
  - 205 tests across 5 test files
  - Tests for CSS processing utilities (hex shorthand, modern color syntax, zero unit removal)
  - Tests for typography conversions
  - Tests for unit conversions
  - Tests for token merging and reference resolution

### 🐛 Bug Fixes

- Fixed semantic font-size tokens not appearing in output
- Fixed semantic tokens not referencing primitive tokens correctly
- Fixed shadow colors appearing in component files (moved to primitives)
- Fixed deleted Figma tokens still being synced (`deletedButReferenced` flag now filtered)
- Fixed font-weight string values not converting to numeric CSS values
- Fixed line-height unitless conversion precision issues
- Fixed component token builds failing due to missing primitive color references
- Fixed reference resolution order for semantic tokens
- Fixed button outlined tokens to reference primitive `color.transparent.black.00` instead of direct values

### 🗑️ Removed

- Old file structure (tokens-base.css, tokens-light.css, etc.)
- Individual minified CSS files (replaced with consolidated `tokens.min.css`)
- Uncompressed files from main `css/` directory (moved to `css/dev/`)
- Responsive token files (removed from build output and documentation)
- Component token files (filtered out from build output - not in use yet, logic preserved)

### 📝 Notes

- Letter-spacing tokens are temporarily filtered out due to conversion issues (will be re-enabled in future release)
- Component tokens are currently filtered out from build output (not in use yet, logic preserved for future use)
- Import order is critical: Primitives → Semantic → Component (when component tokens are enabled)

---

## [0.0.2] - 2024-12-XX

_No changes documented for this version._

---

## [0.0.1] - Initial Release

Initial release of the design tokens package with basic CSS output structure.
