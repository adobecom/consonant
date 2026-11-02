# Evals and gate (evals/): status

## What it is

The checks that say whether a contract is trustworthy. The gate
(`evals/gate.mjs`) runs schema, schema lock, defs, composition, tokens, Figma,
freshness, grid and eval checks over every spec. The visual evals
(`evals/visual/`) shoot Storybook with Playwright and compare against committed
Figma renders: a golden sheet per component (the State matrix) and single
variant renders.

## Run and deploy

```
npm run gate                                       the whole gate; report in evals/gate/out/gate.json
npm run goldens:sheet -- --slug=<slug|system:slug> composite a golden sheet (needs FIGMA_ACCESS_TOKEN)
npm run goldens:variants -- --slug=spectrum:avatar Figma renders for design-only stories
npm run eval:visual:matrix -- --slug=<slug>        score the matrix against its sheet (Storybook on 6006)
npm run eval:visual:contracts                      per-variant parity
```

Goldens live under `evals/datasets/contracts/golden/<slug>/`; a second
system's under `golden/<system>:<slug>/`. Render output goes to
`evals/visual/out/` (gitignored).

## Now

- Gate: RED, 1 failure, 169 warnings. The failure is `SCHEMA_LOCK`, deliberate
  (two schema loosenings awaiting the owner's relock or revert). The warning
  count has been stable through the Spectrum work.

## Open threads

- `evals/datasets/contracts/golden/spectrum:avatar/` and `spectrum:badge/`
  are untracked (variant renders fetched on 2026-10-29).
- `golden/button/sheet.png` is modified in the working tree; check it was an
  intended re-shoot before committing.

## Decisions

- 2026-10-28: Composite slugs (`spectrum:badge`) are resolved through
  `packages/spec-dictionary/systems.mjs`; the golden stays filed under the
  composite slug, which is the key the Book and Storybook ask for.
- 2026-10-28: The matrix parity screenshots the story as Storybook renders it
  (`<title>-<slug>--state-matrix`), so a shipped library's own element is
  what gets scored.
