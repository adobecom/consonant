# Manual Token Overrides

This directory contains manually-maintained design token files that **will NOT be overwritten** by the Figma REST API sync process.

## Why Manual Overrides?

Some design token properties cannot be stored in Figma Variables:

- **Line-height percentages** (e.g., 120%, 100%)
- **Letter-spacing percentages** (e.g., -3%, 1%)

These values are extracted from Figma Text Styles and stored here in W3C Design Tokens JSON format.

## Files

### `typography-line-height-letter-spacing.json`

Contains line-height and letter-spacing percentage values for all typography variants (Super, H1-H4, Body Large/Medium/Small, Eyebrow, Label, Caption) for desktop.

**Format:** W3C Design Tokens JSON  
**Structure:** `s2a.typography.line-height.{variant}.desktop` and `s2a.typography.letter-spacing.{variant}.desktop`

## Maintenance

When Figma Text Styles are updated:

1. Extract the new line-height and letter-spacing percentage values from Figma
2. Manually update the corresponding values in `typography-line-height-letter-spacing.json`
3. Rebuild tokens: `npm run tokens:build`

## Build Integration

The build script (`scripts/build-tokens.js`) automatically loads and merges files from this directory into the token tree during the build process. These overrides take precedence over any values that might come from Figma Variables.
