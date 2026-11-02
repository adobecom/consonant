# Storybook (apps/storybook): status

## What it is

The catalogue of every component and variant. `Generated/` holds our
components, rendered from their contracts. `Spectrum/` mounts Adobe's real
`<swc-*>` elements from stories the contracts generate, plus a "design only"
group per component for variants the design file has and the code cannot
show. The design overlay and the visual parity eval run here.

## Run and deploy

```
npm run storybook            dev server on 6006 (start from a terminal, not an agent)
npm run storybook:build      storybook-static; deployed to GitHub Pages by CI
npm run specs:render -- --all          regenerate Generated/
npm run specs:render:spectrum          regenerate Spectrum/
```

Config is at the repo root: `.storybook/main.js` (static dirs for fonts,
goldens and `packages/spectrum2/assets`; Vite aliases that resolve
`@adobe/spectrum-wc/...` into `packages/spectrum2/node_modules`),
`.storybook/preview.js` (tokens, fonts, the Theme toolbar, the design overlay).

## Now

- Nothing in flight.

## Open threads

- A shipped element's hover cannot be forced (no `data-state` seam), so the
  Spectrum button matrix's Hover column equals Default until the parity run's
  behaviour pass hovers it.
- Spectrum WC loads its own Lit alongside Storybook's: a console warning, no
  effect seen.
- The OS kills the dev server when memory is low; it happened four times in
  one session when an agent started it in the background.

## Decisions

- 2026-10-28: Storybook is the one place a component is drawn. The Contract
  Book shows Storybook's frame rather than rendering anything itself.
- 2026-10-28: Spectrum stories import the registering module
  (`components/<x>/swc-<x>.js`); `components/<x>` alone exports the class and
  defines no element.
- 2026-10-28: Slotted workflow glyphs go through `<swc-icon>`, which is what
  colours them; a bare `<svg>` painted #222 on every background.
- 2026-10-29: Every Spectrum story has a `ground` control (canvas | layer). A
  story whose variant paints in the canvas colour is placed on the layer
  automatically.
