# Consonant Token Handoff

This is an NX monorepo containing:

- **`packages/design-tokens`** - Publishable design token package that syncs from Figma and builds CSS custom properties
- **`apps/storybook`** - Storybook application for documenting and testing components

## Token Pipeline Runbook

📖 **[Complete Token Pipeline Runbook](docs/how-tos/runbook-token-pipeline.md)** - Comprehensive guide for running releases, troubleshooting, and maintaining the token pipeline.

📋 **[Quick Reference Steps](docs/FIGJAM_token-pipeline_steps.md)** - FigJam-friendly step cards for quick reference.

## Deliverable

- `consonant-design-tokens-0.0.1.tgz` is the packaged artifact you should ingest. Install directly (`npm install ./consonant-design-tokens-0.0.1.tgz`) or publish to your internal registry; it exposes the CSS outputs in `css/` (`tokens-base.css`, `tokens-light.css`, `tokens-dark.css`, etc.).
- The tarball is generated from this repo via `npm run package:tokens` (or `nx package design-tokens`), which builds the tokens and creates the publishable bundle from `dist/packages/design-tokens/`.

## How the source tokens are organized

- All design tokens live under `packages/design-tokens/tokens/` and are split into standalone JSON files that mirror Figma variable collections and modes. File names follow `<collection>-variablecollectionid-<figma-id>.<mode>.json`, so you can map a file back to its Figma source.
- Examples:
  - `primitives-core-variablecollectionid-1-2.mode-1.json` contains radii, spacing, typography, etc.
  - `primitives-color-variablecollectionid-82-22.light|dark.json` holds the raw palette values.
  - `semantic-color-variablecollectionid-40-22.light|dark.json` defines theme-aware aliases.
  - `responsive-variablecollectionid-4-519.(mobile|desktop|desktop-wide).json` captures breakpoint-specific sizing.
  - `component-variablecollectionid-4-522.mode-1.json` stores component-level aliases (currently focused on button work).
- `packages/design-tokens/tokens/raw.json` is the un-split export from Figma and `packages/design-tokens/tokens/metadata.json` keeps the sync metadata (Figma file, collection IDs, and API pointers). You generally should not edit these by hand; run `npm run sync:figma` to refresh them from the source file.

## Reading the files

- Each JSON file is structured by nested categories, mirroring the Figma variable hierarchy. Token names are the concatenated path segments, and `$value` holds either a literal (number, color, etc.) or a reference.
- Comments live in the `$description` field. When you see `"Placeholder token: awaiting design definition for final value"`, the token name is locked but the value is intentionally unset—treat those as TODOs before shipping to production.
- Component-level tokens (currently the button set) are illustrative. After we finish the button component audit in Figma, expect to rework these tokens so they reflect the finalized states, interactions, and responsive variants. Do not rely on the existing values for implementation yet—they are there so engineers can hook up the naming, not the numbers.

## Build + packaging workflow

1. `npm run tokens:sync` (or `nx sync-figma design-tokens`) – pulls the latest variable collections from Figma using the metadata file.
2. `npm run tokens:build` (or `nx build design-tokens`) – runs Style Dictionary against `packages/design-tokens/tokens/` and writes the processed JSON/CSS into `dist/packages/design-tokens/`.
3. `npm run tokens:package` (or `nx package design-tokens`) – creates `package.json` in `dist/packages/design-tokens/` and packages it into a distributable tarball (`consonant-design-tokens-<version>.tgz`).
4. Optional: `npm run archive` produces a zip of the entire repo if you need to snapshot the pipeline state.

## Versioning

To bump the version of the design-tokens package:

```bash
# Patch version (0.0.1 → 0.0.2) - bug fixes
npm run tokens:version:patch

# Minor version (0.0.1 → 0.1.0) - new features, backward compatible
npm run tokens:version:minor

# Major version (0.0.1 → 1.0.0) - breaking changes
npm run tokens:version:major
```

The version script will:

- Update `packages/design-tokens/package.json`
- Update the root `package.json` to match
- Provide next steps for committing and packaging

**Complete release workflow:**

1. Make your changes
2. Run tests: `npm run tokens:test`
3. Bump version: `npm run tokens:version:<patch|minor|major>`
4. Build: `npm run tokens:build`
5. Package: `npm run tokens:package`
6. Commit changes including version bumps
7. The tarball (`consonant-design-tokens-<version>.tgz`) is ready for distribution

## Storybook

- `npm run storybook` (or `nx serve storybook`) – starts the Storybook development server
- `npm run build-storybook` (or `nx build storybook`) – builds a static Storybook site

## NX Commands

This monorepo uses NX for task orchestration. You can use either npm scripts or NX directly:

- `nx build design-tokens` - Build the design tokens library
- `nx serve storybook` - Serve Storybook
- `nx run-many --target=build --all` - Build all projects
- `nx graph` - Visualize the dependency graph

## Outstanding work / next steps

- Fill every placeholder token description with an approved value once design finalizes. The comments mark each gap.
- Re-run the component tokens after the button component review, then repeat the same exercise for other components (inputs, chips, etc.) so we do not mix primitive and component responsibilities.
- Validate responsive tokens across the desktop-wide and mobile files; we have naming coverage, but several tokens still reuse desktop values until we confirm the mobile spec.
