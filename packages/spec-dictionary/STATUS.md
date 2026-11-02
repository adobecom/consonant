# Contract pipeline (packages/spec-dictionary): status

## What it is

The pipeline that turns a component's evidence (the Figma file, the shipped
code) plus a hand-written judgment file (`*.defs.json`) into everything
derived: the contract, the spec, the stories manifest, the Figma plan, and the
rendered outputs (a Lit component, a Milo atom or block, or Storybook stories
that mount a library's own element). It describes our components and, since
October 2026, Adobe's Spectrum 2 as well.

## Run and deploy

```
npm run specs:build -- --slug=<slug>          build one of ours
node packages/spectrum2/scripts/build.mjs     build the Spectrum contracts (renders their stories too)
npm run specs:render -- --slug=<slug>         lit + milo for one of ours
npm run specs:render:spectrum                 Spectrum stories (upstream target)
npm run specs:render:check                    fail if any rendered file is stale
npm run specs:test                            node --test, 55 tests (build, scaffold, selectors, from-code)
npm run gate                                  everything; report in evals/gate/out/gate.json
node packages/spec-dictionary/scaffold.mjs --slug=<x> --from=code \
  --root=<src> --tokens=<dir> --import=<pkg>  draft a contract from an implementation
```

No env vars. The Figma token (`FIGMA_ACCESS_TOKEN` in `.env`) is only needed
by the golden-sheet and variant-golden scripts in `evals/`.

## Now

- Token adapter: render a Spectrum contract's `{swc.*}` references as
  `--s2a-*`, generated from `@adobe/spectrum-design-data` (both names per
  token). This is the "thin token layer" Forge asked for; it lives at the render
  boundary, not in the contracts.
- CSS-only atoms (typography, link): a contract from a stylesheet with no type
  declarations. The drafter has to read `--modifier` classes as the API.

## Open threads

- `packages/milo-blocks/*.css` is stale against the current renderer (round
  radius, no fallbacks). Re-render before relying on it.
- The Milo atom's `AUTHORED` selector is only defined for the button archetype;
  the others fall back to `.<slug>`. Each atom archetype needs its own
  authoring convention written down.
- Two implementations of "is this contract valid" still drift:
  `packages/components/scripts/validate-defs.mjs` and the Book's
  `curationRefusals`. The structural rule is shared; asset, slot and
  composition rules are not.
- The Book's and the data plugin's SYSTEMS tables should read `systems.mjs`
  instead of carrying their own copies.
- The gate's `SCHEMA_LOCK` failure is deliberate and waits on the owner:
  relock (`npm run gate:lock`) or revert the two loosenings.
- Badge's nineteen plain colours are in the web component's enum but not
  bound in the contract (the design splits Status and Color). A defs edit.

## Decisions

- 2026-10-27: A shipped library's contract is read from its code, not
  transcribed from the design file. The design-first scaffolder transcribes a
  Figma node tree, which on a foreign file produced a 900-line avatar
  describing six boxes; the real component is a sized circle and an image.
  Acceptance: avatar regenerated from code equals the hand-written contract.
- 2026-10-28: The schema's token-reference pattern accepts any namespace, and
  `asset` requires only `prop`. Both loosenings are deliberate and unlocked
  pending the owner's review.
- 2026-10-28: Translate token names at the boundary; keep the schema strict.
  Widening the reference pattern to accept design names makes the validator
  pass while the reference names nothing. Unmappable names become
  `raw:<literal>` plus an open decision.
- 2026-10-28: What a design system is lives in one file, `systems.mjs`. The
  same bug (an assumption of one system) had been fixed nine times.
- 2026-10-28: Storybook renders; the Book never does. A third renderer,
  `upstream`, mounts a library's own element and generates no component.
- 2026-10-29: Design axes no prop binds are shown as "design only" stories
  (Figma's own render), not dropped.
- 2026-10-29: The Milo target has an atom mode. A contract whose archetype is
  an atom renders as a decorator over authored markup (the shape of Milo's
  `decorateButtons()`), under `packages/milo-atoms/`; a block whose slot
  accepts an atom calls that atom's decorator instead of drawing it.
  Rendering Button as a block had produced a `<div>` with three rows.
