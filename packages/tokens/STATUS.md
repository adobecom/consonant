# Tokens (packages/tokens): status

## What it is

The S2A token source and build. `json/raw.json` is the Figma variables export
(collection `VariableCollectionId:6:178` carries the responsive modes xl, lg,
md, sm); the build writes CSS to `dist/packages/tokens/css/dev/`
(`tokens.primitives.css`, `tokens.semantic.*.css`,
`tokens.responsive.{sm,md,lg,xl}.css`). Published as the token package Milo and
Storybook consume. Current version 0.0.23 (2026-09-25).

## Run and deploy

```
npm run tokens:build (nx)    rebuild dist/packages/tokens/css/dev from json/
/token-release               the release procedure (version, changelog, publish)
```

The Figma export needs `FIGMA_ACCESS_TOKEN` in `.env`. Release notes live in
`packages/tokens/CHANGELOG.md`.

## Now

- Nothing in flight on the build. Waiting on Milo to bump to 0.0.23.

## Open threads

- Milo's `libs/c2/styles` token files (and a `@media (width >= 1024px)` block
  inside its `styles.css` that re-declares typography tokens) predate 0.0.22,
  so between 768 and 1023px adobe.com shows mobile type: heading-2 at 32px
  instead of 48, h5 at 18px / −0.2px instead of 20px / −0.48px. The Slack
  thread (Taeho, Jingle, Ryan; MWPW-212980) has the answer; the fix is a
  token bump on the Milo side, not a design change and not a block override.
- Token values and Figma agree at every breakpoint for heading-2 and
  heading-5; the only drift is the breakpoint itself.

## Decisions

- 2026-09-09 (0.0.22, MWPW-206973): the `md` tier opens at `width >= 768px`,
  not `min-width: 1024px`. The tablet range starts at 768, so md-tier tokens
  were flipping too late. `lg` (1280) and `xl` (1441) unchanged.
- 2026-10-29: Breakpoint ranges are greater-than ranges: mobile below 768,
  tablet from 768, desktop from 1280. 1024 should not appear in token or Milo
  CSS.
- 2026-10-29: Type is rem throughout (`--s2a-font-size-48: 3rem`); the px
  figures in Figma are the translation. A px-vs-rem argument about a type
  mismatch is usually a breakpoint problem.
