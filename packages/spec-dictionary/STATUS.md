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
npm run specs:test                            node --test, 70 tests (build, scaffold, selectors, from-code, token map)
npm run gate                                  everything; report in evals/gate/out/gate.json
node packages/spec-dictionary/scaffold.mjs --slug=<x> --from=code \
  --root=<src> --tokens=<dir> --import=<pkg>  draft a contract from an implementation
```

No env vars. The Figma token (`FIGMA_ACCESS_TOKEN` in `.env`) is only needed
by the golden-sheet and variant-golden scripts in `evals/`.

## Now

- Token map (built 2026-11-03): `npm run tokens:map` compares every Spectrum
  token with S2A and writes `lib/token-map.json`; judgment lives in
  `lib/token-map.roles.json`, answered there and re-run. Alias renders as
  `var(--s2a-*)`; decide and adopt render as Spectrum's literal with a
  `hardcoded:` reason; a colour only aliases through a roles row. Applied at
  the render boundary: `npm run specs:render -- --slug=<x> --system=spectrum
  --target=milo` writes to `packages/spectrum2/out/<x>/milo/`, not over our own
  atoms. Superseded for rendering on 2026-11-04 by the token subset below; the
  table and its tests still run, and no render reads it.
- Plan step 2, in progress (2026-11-04): `npm run eval:visual:milo --
  --slug=spectrum:button` scores the Milo atom against the re-shot Figma sheet:
  152 of 192 cells before the fix, 188 of 192 after. The four left are
  Extra-large outline cells, Default column. All 24 computed-style looks checked
  match Adobe's element at Medium. Extra-large is 49px in Adobe's code and 48 in
  Figma; ours follows the code. No width is within 2px of Figma because the
  capture browser lacks Adobe Clean Spectrum VF, and pending is not drawn.
  Not promoted to `packages/milo-atoms`: that replaces our own button atom.
- CSS-only atoms (typography, link): a contract from a stylesheet with no type
  declarations. The drafter has to read `--modifier` classes as the API.

- 2026-11-03 — The owner wants the merch card built for real from contracts, part by part, and a path that opens a Milo PR per component as the composition grows. Plan with the bill of materials, build order and the PR workflow: `docs/future-notes/merch-card-build-and-milo-pr-plan.md`. First dependency is the token adapter (above). Composition is already modelled (defs `composition`, schema `slot.accepts`) but not declared on the card.

- Token subset (2026-11-04): a Spectrum contract rendered for Milo now writes
  `--s2-*` variables and a `<slug>.tokens.css` with only the tokens it reaches
  (`lib/token-subset.mjs`, tested). This replaces the token map's `--s2a-*` aliases
  and literals at the render boundary; `npm run tokens:map` and its table still run
  but no render reads them. Space toggles collapse to the desktop value. An atom alone keeps every variant. A block is trimmed to
  the looks its slots ask for (`lib/milo-trim.mjs`, tested), into one stylesheet.
- Composition in Milo (2026-11-04): new `x-` defs fields: `x-authored` (what an
  author writes for an atom), part `x-row` and `x-match` (rows and children to
  parts), slot `x-options` (what a parent passes an atom). `tier` gained `atom`.
  All join the pending `SCHEMA_LOCK` decision. Slots now resolve inside the
  contract's own system.

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
- Badge's nineteen plain colours: done 2026-11-09. Fill was already bound; the
  19 subtle rows were missing from the defs and are added (see spectrum2 STATUS).
- 2026-11-09: the Milo renderer wrote a boolean prop's value as the class, so
  `subtle: true` became `.true`, which nothing adds, and every boolean rule matched
  nothing. Fixed in `lib/renderers/milo.mjs`: true is the prop's own class (`.subtle`),
  false is `:not(.subtle)`; decorators add the class for a boolean option, and the
  file header lists booleans that a style rule keys on. Tests pass. Generated output
  that changed: Radio and Collapsible of ours, Badge, Avatar and Divider of Spectrum's;
  every other Milo file is unchanged. Radio now greys an unselected label and
  Collapsible applies its open gap, both as designed; owner to confirm.
- 2026-11-09: two more fixes. The Milo renderer prefixes a numeric value with its prop (`.size-500`), because `.500` does not parse and the rule is dropped; Avatar and our App Icon now size. The drafter (`lib/from-code.mjs`) sets aside rules under `@media`, `@container`, `@supports` and `@scope` and lists them in a `conditional-rules` decision; before, Divider's forced-colours `CanvasText` became its colour and Card's media rules landed on the card. Open: the drafter does not follow a size that sets a public custom property read through a private one (Divider thickness, Button Group gap).

## Decisions

- 2026-11-04: Spectrum's Milo render uses `--s2-*` and a generated tokens file with
  only what a contract reaches, per the owner: "we only want to pull in what we need
  when we need it." `--s2-*` keeps the card from depending on an Adobe stylesheet or
  colliding with the `--s2a-*` Milo already loads. The prefix is still open
  (decision `mc-token-prefix`). The card therefore carries S2's values; the adobe.com
  reskin is not in it yet.

- 2026-11-04 — Follow the Southleft contract shape; anything beyond it carries
  an `x-` prefix (owner). `x-compound` on a part holds rules on any number of
  props plus an optional state, because `tokensByCombination` takes two props
  and no state. The vendored schema stays unedited; `upstream.mjs` removes `x-`
  keys before validating. Button's 70 rows were read from Adobe's stylesheet by
  a one-off script. Existing non-`x-` extras in Spectrum contracts still fail
  Southleft's schema and have not been renamed.
- 2026-11-04 — Matrix cells resolve an axis the contract does not model to the
  set's default value. Taking the last node filled Button's sheet with
  `Show label=False` artwork. An axis folding two props (`Secondary - Static
  white`) now sets each prop from the word it recognises. Button, Badge, Avatar
  and our Link changed cell nodes; Button's story also gained correct static
  colour args.
- 2026-11-02 — Framing on the board: Milo is the platform, Spectrum 2 is the
  parts bin, a thin token layer sits between. Spectrum 2 is rethemable on its
  own axes (light/dark, contrast, scale; 1,771 custom properties, alias tier
  overridable) but is a product-UI kit, not a neutral one — so the thin layer
  is a fact about Spectrum, whatever it is called.

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

- 2026-11-03 (late): the Milo landing spots in the merch-card plan were wrong. `libs/ui/s2a` is our own untracked June scaffold inside the submodule, not a Milo folder; the first atom PR proposes it. Blocks go beside the 41 in `libs/c2/blocks`. The generator output in `packages/milo-atoms` and `packages/milo-blocks` stays the source; the Milo export is a copy onto a fork branch. Plan doc and board chapter 06b corrected.

- 2026-11-03: `specs:render:check` reports four stale Lit files (Checkbox.js, Checkbox.stories.js, Collapsible.css, MerchCardSelectPromo.css). Same list with and without the token map change, so it predates it.
