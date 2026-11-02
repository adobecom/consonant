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

- Seven contracts, all read from the shipped code: avatar, badge, button,
  button-group, card, divider, icon.
- Next to contract: typography and link (CSS only, no `.d.ts`).
- The merch-card proof (`docs/future-notes/merch-card-from-s2-atoms.md`):
  decompose S2A's merch card into Spectrum atoms and compile it to Milo. Six
  of nine atoms resolved; select/picker and checkbox are not shipped upstream.

## Open threads

- The whole package is untracked in git.
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
