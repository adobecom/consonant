# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.3] - 2024-12-XX

### 🎉 Major Changes

#### Package Rename

- **BREAKING**: Package renamed from `consonant-design-tokens` to `s2a-tokens`
- Updated all references and exports to reflect new package name

#### Complete CSS Output Restructure

- **BREAKING**: Completely reorganized CSS output to mirror Figma variable collections and token tiers
- New file structure organized by layer (primitives, semantic, component, responsive) and mode (core, light, dark)
- Output files now follow the pattern: `tokens.{layer}.{mode}.css`

**New Output Files:**

- `tokens.primitives.css` - Non-color core primitives (spacing, typography, radii, opacity, shadows)
- `tokens.primitives.light.css` - Color primitives for light mode
- `tokens.primitives.dark.css` - Color primitives for dark mode
- `tokens.semantic.css` - Non-color semantic tokens (t-shirt sizing, etc.)
- `tokens.semantic.light.css` - Semantic color tokens for light mode
- `tokens.semantic.dark.css` - Semantic color tokens for dark mode
- `tokens.component.css` - Non-color component tokens
- `tokens.component.light.css` - Component color tokens for light mode
- `tokens.component.dark.css` - Component color tokens for dark mode
- `tokens.responsive.mobile.css` - Responsive tokens for mobile (currently filtered out)
- `tokens.responsive.tablet.css` - Responsive tokens for tablet (currently filtered out)
- `tokens.responsive.desktop.css` - Responsive tokens for desktop (currently filtered out)
- `tokens.responsive.desktop-wide.css` - Responsive tokens for desktop-wide (currently filtered out)

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
  - Four-tier token architecture explanation
  - Detailed file structure documentation
  - Import order guidelines
  - Usage examples with real token names
  - TL;DR section for quick reference
  - Common questions and answers
- Added README.md to package files for npm distribution

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

### 🗑️ Removed

- Old file structure (tokens-base.css, tokens-light.css, etc.)
- Individual minified CSS files (replaced with consolidated `tokens.min.css`)
- Uncompressed files from main `css/` directory (moved to `css/dev/`)

### 📝 Notes

- Responsive tokens are currently filtered out from build output (logic preserved for future use)
- Letter-spacing tokens are temporarily filtered out due to conversion issues (will be re-enabled in future release)
- Import order is critical: Primitives → Semantic → Responsive → Component

---

## [0.0.2] - 2024-12-XX

_No changes documented for this version._

---

## [0.0.1] - Initial Release

Initial release of the design tokens package with basic CSS output structure.
