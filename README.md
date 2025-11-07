# Consonant Token Handoff

## Deliverable
- `consonant-design-tokens-0.0.1.tgz` is the packaged artifact you should ingest. Install directly (`npm install ./consonant-design-tokens-0.0.1.tgz`) or publish to your internal registry; it exposes the CSS outputs in `package/css` (`tokens-base.css`, `tokens-light.css`, `tokens-dark.css`).
- The tarball is generated from this repo via `npm run package:tokens`, which runs the Style Dictionary build and then creates the publishable bundle.


## How the source tokens are organized
- All design tokens live under `tokens/` and are split into standalone JSON files that mirror Figma variable collections and modes. File names follow `<collection>-variablecollectionid-<figma-id>.<mode>.json`, so you can map a file back to its Figma source.
- Examples:
  - `primitives-core-variablecollectionid-1-2.mode-1.json` contains radii, spacing, typography, etc.
  - `primitives-color-variablecollectionid-82-22.light|dark.json` holds the raw palette values.
  - `semantic-color-variablecollectionid-40-22.light|dark.json` defines theme-aware aliases.
  - `responsive-variablecollectionid-4-519.(mobile|desktop|desktop-wide).json` captures breakpoint-specific sizing.
  - `component-variablecollectionid-4-522.mode-1.json` stores component-level aliases (currently focused on button work).
- `tokens/raw.json` is the un-split export from Figma and `tokens/metadata.json` keeps the sync metadata (Figma file, collection IDs, and API pointers). You generally should not edit these by hand; run `npm run sync:figma` to refresh them from the source file.

## Reading the files
- Each JSON file is structured by nested categories, mirroring the Figma variable hierarchy. Token names are the concatenated path segments, and `$value` holds either a literal (number, color, etc.) or a reference.
- Comments live in the `$description` field. When you see `"Placeholder token: awaiting design definition for final value"`, the token name is locked but the value is intentionally unset—treat those as TODOs before shipping to production.
- Component-level tokens (currently the button set) are illustrative. After we finish the button component audit in Figma, expect to rework these tokens so they reflect the finalized states, interactions, and responsive variants. Do not rely on the existing values for implementation yet—they are there so engineers can hook up the naming, not the numbers.

## Build + packaging workflow
1. `npm run sync:figma` – pulls the latest variable collections from Figma using the metadata file.
2. `npm run build:tokens` – runs Style Dictionary against `tokens/` and writes the processed JSON/CSS into `build/`.
3. `npm run package:tokens` – copies the CSS outputs into `package/css` and creates the distributable tarball (`consonant-design-tokens-<version>.tgz`).
4. Optional: `npm run archive` produces a zip of the entire repo if you need to snapshot the pipeline state.

## Outstanding work / next steps
- Fill every placeholder token description with an approved value once design finalizes. The comments mark each gap.
- Re-run the component tokens after the button component review, then repeat the same exercise for other components (inputs, chips, etc.) so we do not mix primitive and component responsibilities.
- Validate responsive tokens across the desktop-wide and mobile files; we have naming coverage, but several tokens still reuse desktop values until we confirm the mobile spec.
- Once the above work is complete, bump the version via `npm run version:<type>` before regenerating the tarball so downstream consumers can track updates.
