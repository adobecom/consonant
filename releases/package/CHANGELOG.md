# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
