# Spectrum 2 contracts (packages/spectrum2): status

## What it is

Adobe's Spectrum 2 web components (`@adobe/spectrum-wc`, version
2.0.0-beta.6), vendored one component at a time and described with the same
contract pipeline our own components use. The reference the S2A atoms are
built from, and the thing Forge wants to theme with a thin token layer.
Contracts are `spectrum.<slug>`; their tokens are `{swc.*}`.

## Run and deploy

```
npm run pull -w @s2a/spectrum2                vendor the stylesheets, modules, .d.ts, tokens, and icon manifest
node packages/spectrum2/scripts/pull-icons.mjs rebuild assets/spectrum-icons.json
node packages/spectrum2/scripts/build.mjs     build every contract and render its Storybook stories
node packages/spectrum2/scripts/pull-figma.mjs design evidence (needs the Contract Book running)
npm run goldens:variants -- --slug=spectrum:avatar   Figma renders for the design-only stories
npm run eval:visual:matrix -- --slug=spectrum:badge  parity against the committed sheet
```

Validate another system's defs:
`node packages/components/scripts/validate-defs.mjs --root=packages/spectrum2/src --tokens=packages/spectrum2/tokens --ns=swc --assets=packages/spectrum2/assets`.

## Now

- Eleven contracts. Seven read from the shipped code: avatar, badge, button,
  button-group, card, divider, icon. Three design-only atoms and one block from
  Figma: picker, list-view-item, list-updated, s2-merch-card.
- Next to contract: typography and link (CSS only, no `.d.ts`).
- The merch-card proof (`docs/future-notes/merch-card-from-s2-atoms.md`):
  decompose S2A's merch card into Spectrum atoms and compile it to Milo. Six
  of nine atoms resolved; select/picker and checkbox are not shipped upstream.

- Button (2026-11-04): defs gained 70 `x-compound` rows, read from Adobe's
  stylesheet by a one-off script, plus line height and focus ring style and
  offset. The Milo atom scores 188 of 192 against the Figma sheet. Not promoted.

- Merch card rebuilt from S2 in Figma, with a real Milo page test:
  `docs/references/merch-card-s2-rebuild.md`. Open from the test: dark needs
  `color-scheme`, Milo's Typekit kit lacks the Spectrum font, and `decorateButtons`
  may run before our decorator (read from code, not run).

- S2 merch card (2026-11-04): new design-only contracts `picker`, `list-view-item`,
  `list-updated` and the block `s2-merch-card`, with Milo code in
  `out/<slug>/milo/` and only the tokens each reaches in `<slug>.tokens.css`. Button,
  Divider and Icon gained `tier: atom`. `npm run eval:visual:s2-card` renders the
  card in light and dark: 474 by 705 in both, same as Figma, 2.0% of pixels differ,
  no text below AA. Not run through a real Milo page yet, and no state is scored.

## Open threads

- Static-colour Buttons: code and Figma disagree. The contract follows the code's
  `--swc-transparent-static-*` (primary fill 0.8), Figma binds its own
  `Palette/transparent-white/*` (800 is 0.85). The card does not use these variants.
- Divider renders 2px at Small; Figma has 1px. The card has its divider off, but
  the updated list with a divider on is 206 tall against 205.
- `s2-merch-card` sits here for now (decision `mc-home`), though S2 has no merch card.
- Not yet tested for the card: a real Milo page, including the `decorateButtons`
  order; the real font; hover, focus and disabled scores; touch sizes.
- Button has no warnings. Its focus offset binds `border-width-200`, per the owner;
  Picker's does too. Picker's only warning left is that it has no hand-written code, which is true by design: its chevron binds `ui-icon-*`. Zero resets and inline glyph art no longer count as token gaps (`lib/structural.mjs`).
- Icon-only Button is not modelled: Adobe's code uses 50%, Figma types 16 to 28.
- The radius check covers the 48 of Button's 192 cells whose radius the Figma evidence
  records as a typed number.
- Extra-large Button was 49px in Adobe's code and 48px in Figma. Since 2026-11-04 it
  binds Figma's line height token, so it is 48. Adobe's own element is still 49.
- Button's contract still fails Southleft's schema on five `valueMap` keys under
  `bindings.figma`, unchanged by this work and without an `x-` prefix.
- The atom draws no pending state, and `:disabled` never matches an authored `<a>`.
- The base package is tracked (94 files at the November 5 source review). The
  newer atoms, merch-card composition, Milo outputs and thin-layer file remain
  uncommitted; some are untracked. Use git status before selecting a commit.
- `@adobe/spectrum-wc` beta.6 is missing checkbox, picker/select, field
  label, radio, switch, text area. They exist in Adobe's design data and in
  Figma; nothing to read a contract from on the web side.
- Avatar: the design has four styles (user image, gradient, initials, guest);
  the web component renders one `<img>`, and React Spectrum S2 has fewer props
  still. Recorded as decision `a-style-axis`; shown as design-only stories.
- Findings for Adobe, recorded as open decisions, not tickets (the owner said
  no tickets): badge hardcodes 7/8/9/10px radii that tokens hold; badge radius
  is 7 in Figma and 8 in code; `global-button.css` ends with `all:
  revert-layer !important`; ~40% of custom-property assignments are literals.
- The workflow icons ship on Spectrum CSS's `--iconPrimary` hook; the web
  components colour through `--swc-icon-color`. `pull-icons.mjs` rewrites the
  hook and records it in the manifest's `fillHook`.

## Decisions

- 2026-11-04: The thin layer starts in `tokens/tokens.layer.css`: tokens S2 does not
  have, written by us. First entry, per the owner: Button's radius, one token per
  size, half the height, because Adobe's code calculates it and Figma types it in.
  We cannot add variables to Adobe's library, so parity is a check, not a link:
  `eval:visual:milo` compares the result with Figma's numbers and reports drift. Add a
  token only for a value that is derived or gets reskinned.

- 2026-11-04: A contract binds tokens, per the owner. Button's 92 colours and
  Divider's 4 had been copied as plain values from Adobe's stylesheet, which writes
  them flattened; they now name their tokens. `validate-defs` fails a non-S2A
  contract whose raw colour exactly matches a token.

- 2026-11-04: The owner's rule for the card: no Adobe runtime code. Every piece gets
  a contract and generated Milo code, composed up to the card, all attached to
  tokens, and only the tokens in use are pulled in. A library's shipped code can
  still be read as evidence for a contract.
- 2026-11-04: Picker is a native `<select>`, so keyboard and mobile come from the
  browser. S2's Menu is not built (decision `pk-open-list`, open).
- 2026-11-04: List view item's row dividers are one `plain` class, since S2 has no
  property for them and Figma needs a stroke override per instance.

- 2026-10-27: The package is `@adobe/spectrum-wc`, not `@spectrum-css`. The
  latter is the first-generation library; its token vocabulary cannot
  reproduce the S2 Figma file.
- 2026-10-27: Both `tokens.css` and `swc.css` are vendored. `tokens.css` alone
  renders nothing: every sized value is a space toggle that `swc.css`
  collapses, and `swc.css` sets the `color-scheme` the colours need.
- 2026-10-27: Props come from the shipped `.d.ts`, not the minified JS.
- 2026-10-29: Web components are the Spectrum anchor, not React. They are
  framework-neutral, can be dropped into a React app, and Adobe ships
  plain-CSS versions of its atoms from the same package. React Spectrum would
  lock the token layer to one framework.
- 2026-10-29: Avatar's outline ring is the canvas colour by design (for
  avatars that overlap); its story sits on a `layer` ground so it is visible.
  `systems.mjs` declares `canvas` and `layer` per system.

## Spectrum theming evaluation (2026-11-05)

Plan, findings and source reviews are in `context/private/spectrum-theming/spectrum-theming-evaluation.md`, on this machine only, because this repo is public. Step A of the proof of concept is done, code in `packages/spectrum2/poc/theming/`, results in the private folder. Step B is next.

Findings that change this package: no pipeline code reads Design Data, so the gate cannot see a release; `^3.7.0` should become an exact pin; Button's relationships and recipe are in the public Design Data repo, not on npm; Design Data 3.8.2 has machine rules for Button's constraints and our contract only describes them; 50 of Button's 329 relationship records point at deprecated tokens, so a release check has to follow `replacedBy`.

- 2026-11-06: compared shipped CSS against our defs for five contracts (`poc/theming/step-a-shipped.mjs`). Defects, not fixed, owner to decide: Badge subtle background missing for 19 variants (nested `&:where` not read). Divider fill reads `CanvasText` from the forced-colors block, and thickness is 2px at every size where code has 1, 2 and 4; this explains the earlier 2px against Figma's 1px note. Button Group small gap is 12px where code has 8. Button matches on all 466 rows. The gate did not catch these.
- 2026-11-06: Button proof of concept built in `poc/theming/` on an overlay of stand-in values: contract, Milo render with a mobile block, browser verification, release check and a stand-in consumer page. Button's defs and its 190 of 192 baseline are unchanged. Findings for this package: 158 of Button's 166 color rows bind to the palette, so semantic overrides barely reach it. The contract's `valueMap` fails the vendored schema without an `x-` prefix. Later the same day, with approval, the WASM package and the Southleft tools ran on temporary copies. Results are private. For this package: the contract's boolean defaults are written as strings and one enum default is quoted, which Southleft's validator refuses.
- 2026-11-09: added `poc/theming/viewer/`, a local page showing the plain and themed Button side by side, with light, dark, mobile, live states, the overlay's changes and a token-change control. Serve the `poc/theming` folder and open `viewer/index.html`. Generated files unchanged.
- 2026-11-09: second theme stress test. `poc/theming/themes/opposite.json` is a made-up theme that reuses the stand-in's bindings (`bindingsFrom`). Steps B, C/D and E now take more than one theme (`--overlay`, `--theme name=path`, `--extra`); the stand-in build's output is unchanged. Colour, font and focus ring reached; contrast passes. Three problems in how the bindings were written: the outline border binds to palette `gray-1000`, five bindings point at `acom-*` names, and radius, padding and gap are bound for size M only. Fixed the size problem the same day: every size is bound (23 bindings, 7 colour, 16 size); new tokens can point at a Spectrum token (`ref`), so the stand-in keeps Spectrum's S, L and XL padding and mobile values. The release check now counts a token reached through a theme's own name as used. The colour-binding share is 4.2% of Button's colour rows, corrected from 6.6%.
- 2026-11-09: fixed the other two binding problems (F24). Shared binding targets are role tokens named `theme-button-*`; the outline border binds to a new role token, `theme-button-outline-border`, that each theme sets, so it no longer binds palette `gray-1000`. `loadOverlay` refuses a binding to a palette step and a `theme-*` token a binding uses but the theme does not define. Stand-in render, step E and release check results unchanged; the opposite theme's outline border is now green. `acom-*` remains only for the stand-in's own tokens.
- 2026-11-09: Badge defs gained the 19 subtle colour rows they were missing (decision `b-subtle-colour-rows`). The defs were curated before nested rules were read; a fresh draft already has them, so no reader change. Defs against shipped code: 312 of 312, was 274. Only Badge's generated files changed in a full rebuild.
- 2026-11-09: Badge run through both PoC themes (`poc/theming/step-badge.mjs`, `themes/bindings-badge.json`). 5 shared bindings, none for colour, because Badge binds to semantic tokens; Button needed 23. Faithful 136 of 136 against shipped, 0 contrast failures, schema passes, Button output byte-identical. `themeFiles` and `mobileLines` moved into `poc-lib.mjs`. The Milo renderer's boolean fix (spec-dictionary STATUS) changed Badge, Avatar and Divider Milo CSS. Avatar's numeric size classes such as `.1000` are invalid CSS; not fixed (F27 in the private flags).
- 2026-11-09: renamed `poc/theming/overlay/` to `themes/`, `overlay.json` to `stand-in.json`, and the contract field `x-overlay` to `x-theme`. "Overlay" reads as a scrim or overlay component in a design system. Every value and rendered file is unchanged.
- 2026-11-09: Button's 23 bindings moved out of the stand-in into `themes/bindings-button.json`, beside `bindings-badge.json`. A theme file now holds values only; `loadOverlay(path, component)` attaches the shared bindings file and refuses a theme that carries its own. Rendered output unchanged; contracts record `bindingsFile`.
- 2026-11-09: the opposite stress-test theme was replaced by a playful theme (`themes/playful.json`, build `playful`): orange primary, purple accent, lime-green focus ring, rounded font, pills. Same override keys and role tokens, so it uses the shared bindings unchanged. Button and Badge: 0 contrast failures, pill and rounded font at every size, focus ring 4.65 light. Its bright orange fails 4.5:1 with a white label, so light mode uses a deeper orange.
- 2026-11-09: type and shape stress test. Shared bindings for font weight, letter spacing, text transform, and font size and line height per size (Button 35 bindings, Badge 16). Button's font-family binding moved from code into `bindings-button.json`; `applyBindings` handles base bindings. The stand-in points the new role tokens at Spectrum's, and its measured look is unchanged. Playful theme: Arial Black, larger, 900, uppercase, tracked, four-value radius; all reached, nothing clipped, contrast passes. Findings: larger type grows the box past Spectrum's component heights, and theme values cannot vary by scale, so its type does not grow on mobile.
- 2026-11-09: every component. Role tokens have defaults in their shared bindings file (Spectrum's own value), merged by `loadOverlay`, so a theme lists only what it changes; the stand-in went from 44 tokens to 10 with identical results. `step-components.mjs` builds Avatar, Divider, Button Group and Icon from `themes/bindings-<slug>.json`, reads the Button and Badge builds, and measures all six with shared fixtures (`viewer/fixtures.js`, also used by the viewer). Bindings: Button 35, Badge 16, Avatar 3, Divider 11, Button Group 4, Icon 0. No new clipping, contrast or page errors. Card not run: its defs are an unreviewed draft. Defs fixed: Divider colour, thickness, vertical width and the hr border (21 of 21 against shipped); Button Group size S gap (4 of 4).
- 2026-11-09: theme stress test, `poc/theming/step-fuzz.mjs`: 40 themes generated from seed 7 and 13 broken on purpose, all six components, light and dark. 13 of 13 broken themes caught by the intended check (load, contrast, focus, value, font, height, crowding; crowding added after the first run missed it). 7 of 40 generated themes clean; every failure was colour contrast. The generic builder moved to `component-build.mjs` and handles Button's variant rows. `out/fuzz/` is ignored by a local `.gitignore`.
- 2026-11-09: release replay at scale, `poc/theming/step-release-all.mjs`: 10 Design Data upgrades (3.2.5 to 3.8.2) and 3 shipped betas (3 to 6), six components, five themes. Design Data: 300 runs, 0 blocks, 25 reviews (component data at 3.8.0). Shipped: beta 6 control identical; Button, Badge and Divider refuse to build on betas 3 to 5 (they bind static-white tokens new in beta 6); with renames held constant, 11 builds changed at beta 6 (L and XL padding) and diffing each build's generated tokens file caught 11 of 11, while checking only contract-named tokens caught 7. Planted Design Data breaks: 92 of 92. `buildComponent` takes a base token set. `out/release/` is ignored.
- 2026-11-09: F32 and F34 done. `lintTheme` in `poc-lib.mjs`, run by `loadOverlay`: refuses invalid values for a role, font stacks with no generic fallback, and line height under font size; reviews type more than 25% above Spectrum's size and values it cannot classify. It refused the stand-in's bare "Adobe Clean"; now "Adobe Clean", sans-serif. `release-check.mjs` gained `generatedTokenDiff`, `candidateCheck` and `shippedTokenFiles`; step G checks beta 5 to 6 by rebuilding and diffing what the build reaches (two padding reviews where the contract-named check saw none), and the replay uses the same function. All measured results unchanged; stress test 13 of 13 with four now refused at load.
- 2026-11-10: the proof of concept is prepared for the repo. Generated output in `poc/theming/out/` is ignored; `run-all.sh <results folder>` rebuilds it. The step that runs another team's internal code is kept local and out of the repo. `step-release-all.mjs` reads the stress-test results from its own `--out` folder.
- 2026-11-06: `@adobe/spectrum-wc` beta.6 removed 33 tokens and changed 27 from beta.5; two change values we bind (base-padding-horizontal large and extra-large). Pin exactly and diff on upgrade.
