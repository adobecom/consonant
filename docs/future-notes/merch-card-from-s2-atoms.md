# Merch card, rebuilt from Spectrum 2 atoms, compiled to Milo

Started 2026-10-29. The proof the whole programme rests on: take a real S2A
organism, decompose it into Spectrum 2 atoms, contract each atom from the
shipped implementation, and have the pipeline emit Milo code — no React, no
web components on the page. If this works for merch card it works for the
rest; if it does not, we learn exactly where.

Companion to `multi-system-contracts.md` (the pipeline) and the audit
playbook in `docs/workflows/design-system-audit-*.md` (the board).

---

## Three facts that frame it

1. **Milo's merch card is already a web component.** `libs/blocks/merch-card/merch-card.js`
   does `createTag('merch-card', …)` and `merch.js` lazy-loads the MAS custom
   elements (`merch-card`, `merch-card-collection`). Milo vendors Lit
   (`libs/deps/lit-all.min.js`). The "no web components" position is a policy
   its flagship commerce block does not follow. Worth saying plainly on the
   board, not as a gotcha but because it changes what "Milo-compatible" means:
   plain blocks by default, an element where behaviour needs one.
2. **Spectrum 2 ships plain CSS for the atoms Milo cares about.**
   `@adobe/spectrum-wc` includes `global-button.css`, `global-action-button.css`,
   `global-link.css`, `global-elements.css`, `typography.css` — classes on
   native elements, no custom element registered. That is the shape of Milo's
   own `decorateButtons()` → `.con-button`. Adobe already compiles S2 down to
   what Milo wants; the pipeline can do the same for every atom, not just the
   four Adobe chose.
3. **`@adobe/spectrum-wc` is `2.0.0-beta.6` and incomplete.** Checkbox,
   picker/select, field label, radio, switch, text area are in Spectrum's own
   component data (`@adobe/spectrum-design-data`, 97 components) and in the
   Figma library, and are not in the web-component package yet. Where the
   contract needs one of those, the implementation to read from does not
   exist on the web side.

---

## The decomposition

S2A `MerchCard — v1` (4 variants, Style × Features List, six show/text props)
composes: ProductLockup, MerchCard/PricingDisplay, MerchCard/SelectPromo,
Button ×2, MerchCard/TrustBadge, List | Collapsible. Flattened to atoms:

| merch-card part | S2A today | Spectrum 2 (design data) | `@adobe/spectrum-wc` | plain CSS from Adobe | Milo today |
| --- | --- | --- | --- | --- | --- |
| card container (`article`) | merch-card root | `card`, `card-horizontal` | `swc-card` (slots: media, preview, title, actions, description, footer) | — | `<merch-card>` (MAS) |
| product lockup: app icon + label + chevron | ProductLockup → AppIcon, Chevron | no equivalent (`asset`/`thumbnail` nearest) | `asset`, `thumbnail` | — | `merch-icon` |
| plan name, description | text slots | `heading`, `body`, `detail` | `typography.css` (`.swc-Body--sizeL` …) | **yes**, `typography.css` | heading/body classes in `styles.css` |
| pricing display: strikethrough, price, billing, details | PricingDisplay (text) | `body`, `detail` | typography | yes | MAS `inline-price` |
| select promo: select trigger + helper text | SelectPromo → HelperText | `picker` / `select-box`, `help-text` | **not shipped** | — | `merch-offer-select` |
| primary / secondary CTA | Button ×2 | `button`, `button-group` | `swc-button`, `swc-button-group` | **yes**, `global-button.css` | `decorateButtons()` → `.con-button` |
| trust badge: lock icon + text | TrustBadge → icon | `badge`? no — icon + `detail` | `swc-icon` + typography | partly | — |
| features: divider + title + list | FeatureSection → Divider; List; Collapsible | `divider`, `accordion`, `heading` | `swc-divider`, `swc-accordion` | — | `decorateBlockHrs()`, `merch-whats-included` |
| checkbox (select promo variant) | Checkbox | `checkbox` | **not shipped** | — | native |

Contracts that exist so far from the implementation: **button, badge, icon,
avatar** (the last is not in merch card; it was the `--from=code` acceptance
case). Next to contract from code: **divider, card, button-group**, then the
CSS-only atoms **link, typography** (which need the classifier to read
`--modifier` classes as the API, since there is no `.d.ts`).

---

## What "compile to Milo" means for an atom

The `milo` renderer target writes a *block* per contract: rows → parts,
variant classes on the block, CSS rules. An atom is one tier down — it is
called *by* blocks, the way 47 of Milo's 123 blocks call `decorateButtons()`:

```
contract: button  ──milo──▶  .con-button rules + decorateButton(el)   (atom)
contract: card    ──milo──▶  block: rows → parts; composes atoms         (block)
```

Two renderer changes, no contract changes:

- an **atom** emits classes + a decorator (`decorate<Name>(el, opts)`) that
  upgrades authored markup, and nothing else
- a **block** whose `composition` names an atom calls that atom's decorator on
  the row, instead of nesting a component

And one adapter: a Spectrum contract's `{swc.*}` references come out as
`--s2a-*` variables, or Milo pages define nothing they use. That is the
"thin token layer" — it lives at the render boundary, not in the contracts.

---

## Progress

- 2026-10-29 — **divider, card, button-group** vendored from `@adobe/spectrum-wc`,
  code evidence extracted, contracts drafted with `--from=code`, all three
  validate, build, and render Spectrum stories. Three drafter fixes on the way:
  the root class is read off the stylesheet when no anchor names one (the
  extractor's Storybook sweep had put the S2A Divider's `c-divider` in
  `parts.own`); a plain tuple const (`DIVIDER_VALID_SIZES: ["s","m","l"]`, no
  `readonly`) is an enum; a slot declared twice is one slot. Card's stylesheet
  is written for both shadow (`:host`) and light DOM (`:scope`) — Adobe ships
  its own light-DOM card for collections, which is the Milo shape.
- Spectrum contracts now: avatar, badge, button, button-group, card, divider, icon.
- 2026-10-29 — **the Milo target has an atom mode.** Rendering Button as a block had
  produced a `<div>` with three authored rows: the CSS right, the JavaScript the
  wrong kind of thing. Now a contract whose archetype is an atom (button, badge /
  tag / chip, checkbox / radio, toggle / switch, input / field, helper text — or
  `tier: "atom"` in the defs) renders to `packages/milo-atoms/<slug>/` as a
  decorator over authored markup, the shape of Milo's own `decorateButtons()`:
  `decorateButton(scope)` finds `strong > a, em > a, a.button, button`, unwraps
  the cue, adds `.s2a-button` plus the style class (bold → solid, italic →
  outlined, from the contract's enum), wraps the text as `.label`, and labels
  icons before/after it `.icon-start` / `.icon-end`. A block whose slot accepts
  an atom's contract imports that decorator and calls it on its element — merch
  card's `init(el)` now calls `decorateButton(el)` instead of drawing a button.
  Six atoms render this way: button, checkbox, control-button, helper-text,
  link, radio. Roadmap step 2 is done; the token adapter (step 3) is next.

## Order of work

1. Contract **divider, card, button-group** from `@adobe/spectrum-wc` with
   `--from=code` (today: vendor, extract, draft, validate, Storybook).
2. Classifier reads modifier classes as the API when there is no `.d.ts`;
   contract **link, typography**.
3. `milo` target: atom mode (decorator + classes) and composition → decorator
   calls. Prove it on button against `decorateButtons()` side by side.
4. Token adapter: `{swc.*}` → `{s2a.*}` at render; the same button emits
   `--s2a-*`.
5. Merch card as a block composing the atoms; render; compare with Milo's.
6. Record the gaps on the board: checkbox/picker missing upstream; avatar
   styles missing upstream; Milo's own web component; where S2A diverges.

Nothing here is committed. `packages/spectrum2` is untracked.
