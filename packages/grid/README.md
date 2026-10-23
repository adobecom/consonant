# @adobecom/s2a-grid

The S2A layout system, and the contracts that keep it honest.

## Why contracts for a grid

A component contract has two native ends — a Figma component set and a Lit
component — and the contract is the agreement between them. A grid has the same
shape, and the same problem: the breakpoints live in a stylesheet, in four
shipped token files and in four Figma variable modes, and until now nothing
compared them. The first thing these contracts found was that the grid
stylesheet started the HD range at 1440px while the shipped token CSS starts it
at 1441px — so at exactly 1440, the width every desktop mockup is drawn at, a
layout took its columns from one range and its spacing from the other. The
stylesheet now starts that range at 1441px too (decided 2026-10-23); the
`BP_AGREE_XL` rule is what keeps the two from drifting apart again.

That is the whole argument. A layout rule nobody runs is a convention.

## The eleven contracts

| Contract | Kind | Tier | Status |
| --- | --- | --- | --- |
| `grid-foundation` | foundation | global | shipped |
| `container-standard` | container | global | shipped |
| `container-hd` | container | global | shipped |
| `container-token-offset` | container | global | shipped |
| `container-fluid` | container | global | shipped |
| `container-constrained` | container | sectional | shipped |
| `column-grid` | grid | sectional | shipped |
| `bento-grid` | grid | sectional | shipped |
| `object-grid` | grid | sectional | **proposed** |
| `ups-grid` | grid | block | **proposed** |
| `section-spacing` | spacing | sectional | shipped |

`tier` follows Will Blanton's framing — global and sectional belong to S2A,
block-level belongs to C2 — so a block-tier contract documents an agreement
without S2A taking on the implementation or the tokens.

A **proposed** contract is specified in Figma or on the layout page with no S2A
implementation. Its rules assert that the classes are *absent*, so the gap stays
visible in the gate instead of being forgotten.

## The pipeline

```
packages/grid/src/s2a-layout-grids.css ─┐
dist/packages/tokens/css/dev/*.css      ├─(grid-evidence)─▶ evidence/grid.code.evidence.json
                                        │
packages/tokens/json/…6-178.{sm,md,lg,xl}.json ─(grid-evidence)─▶ evidence/grid.figma.evidence.json
                                        │
contracts/<slug>.defs.json (curated) ───┴─(build-grid-contracts)─▶ out/<slug>.contract.json
                                                                   out/grid-contracts.index.json
                                                      │
                                   (validate-grid-contracts)─▶ out/grid-conformance.json
                                                                   │
                                                 Storybook  Foundations/Grid/*
```

```sh
npm run grid:evidence   # re-read the stylesheet, the token CSS and the Figma modes
npm run grid:build      # defs + evidence → contracts
npm run grid:check      # schema, freshness, and every rule; writes the conformance report
npm run grid:all        # all three
npm run gate            # the GRID class is part of the one gate
```

### Design-only on purpose

The structural Figma variables — containers, columns, viewport widths, side
margins — are underscore-prefixed and stripped by `build-tokens.js:48`. That is
deliberate: Will built the container modes as a Figma reflow rig, not as a code
source ("design only inception … viewport, container, margins but for figma
reflows"). These contracts therefore read them as **evidence to check code
against**, never as a source for shipped CSS. `figmaAgrees` rules pin the design
values so a change in the file surfaces as a failing rule rather than as a
layout that quietly stops matching its mocks.

## Writing a contract

`contracts/<slug>.defs.json`, validated against `contracts/grid-defs.schema.json`
(`s2a-grid-defs/1`). Defs are written by people and reviewed in PRs; everything
in `out/` is generated and carries a provenance hash of all three inputs.

Rules name a check the validator implements:

| Check | Asserts |
| --- | --- |
| `mediaQueryPresent` | the stylesheet declares a range starting at a given pixel |
| `boundaryAgreement` | the stylesheet and the shipped token file start a range at the same pixel |
| `classPresent` / `classAbsent` | the class exists, or deliberately does not yet |
| `customPropertyEquals` | a `--s2a-grid-*` property resolves to a value at `:root` in a range |
| `declarationEquals` | a declaration on a class resolves, through `var()` chains, to a value |
| `tokenShipped` | the token reference exists in the built token CSS |
| `figmaAgrees` | the Figma grid mode holds the value the contract claims |
| `manual` | a person must confirm; recorded so it is visible, never counted as passing |

An **open decision** is not a blocker. It is the thing the contract is honest
about not knowing, with the owner and the evidence attached.

## Visualising

Storybook, under **Foundations/Grid**. Every panel renders from `out/*.json`
and the demos use the real classes from this package, so a visualization cannot
drift from the rule it illustrates. `Foundations/Grid/Conformance` is the page
to open when a layout looks wrong.
