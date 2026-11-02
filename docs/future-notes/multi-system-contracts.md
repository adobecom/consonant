# Contracts across design systems, and the Contract Book

Written 2026-10-28, from two days of building against Adobe's Spectrum 2.
It updates `s2a-contract-system-plan.md` (2026-09-17), which still describes the
pipeline accurately but assumes one design system — ours. Everything specific to
a second system is new here.

Read this before changing the pipeline, the Contract Book, or `packages/spectrum2`.

---

## What this is for

Forge is a React application that renders Adobe content. It imports Spectrum's
icons and hand-writes nearly everything else: 485 component files, 131 CSS
modules, about a quarter of its declarations literal hex or pixel values, and 46
`--s2a-*` token names referenced while our token package is not a dependency and
the CSS is never loaded — so those references resolve to nothing.

The goal is a contract layer that can describe a component from **any** library,
ours or not, so Forge can be built from contracts rather than from guesses.
Hence a second design system in this repo, and hence a translation layer between
somebody else's token vocabulary and ours, which is the next piece of work.

## The one-sentence model

> **Evidence is read, never authored. Judgment lives in `defs.json`. Everything
> else is derived.**

```
design file ─(REST or the toolkit)─▶ <slug>.figma.evidence.json ─┐
implementation ─(code-evidence)────▶ <slug>.code.evidence.json  ─┼─▶ defs.json ─▶ transform ─▶ contract · spec · stories · CSS · Lit
token build ───────────────────────────────────────────────────┘      (judgment)        │
                                                                                         └─▶ gate
```

A contract that cannot be derived is **refused**, not guessed at. That rule has
earned its keep repeatedly and must not be relaxed to make a number go green.

---

## Where we are

Four Spectrum 2 contracts in `packages/spectrum2`, all passing, all measured
against the implementation rather than asserted:

| component | verified |
| --- | --- |
| button | geometry at four sizes; all variants in both themes; every state clears 4.5:1 |
| badge | four sizes; 36 variant and modifier combinations in both light and dark |
| icon | five sizes |
| avatar | seventeen sizes; outline, including the 2px step at 1000 and up |

Our own 18 contracts are unchanged throughout. The gate has one failure,
`SCHEMA_LOCK`, covering two deliberate schema changes described below.

### How these four were built, and how avatar was not

Button, badge and icon were curated **from the shipped implementation** — the
stylesheet and the type declarations — with the design file used to check the
result. Avatar was first scaffolded **from the design file**, and the result was
roughly 900 lines with 327 refusals describing a row of six boxes. The real
component is 24 CSS rules: a sized circle and an image.

**The scaffolder transcribes a Figma node tree.** That works on our own
components because our file is authored to our conventions — `.root`,
dot-prefixed parts, variables named after tokens, archetypes from our library.
None of that holds in someone else's file, where it flattens placeholder artwork
into anatomy.

> For a foreign system, treat Extract as **evidence only**. Curate the contract
> from the implementation. This is the single most important lesson here.

### Now automated: `--from=code` (2026-10-28)

The lesson above is a scaffold path. Three pieces, each tested:

1. **Structured CSS evidence.** `code-evidence.mjs` parses the stylesheet with
   postcss and records every rule as `{ selector, declarations }` under
   `stylesheet.rules`, nested `&` rules resolved flat. The old flat token list
   stays; nothing downstream changed hash.
2. **A selector classifier** (`lib/selectors.mjs`). Both grammars reduce to one
   shape — `:host([size="50"])`, `.swc-Badge--blue`, `:host([outline])
   .swc-Avatar-image` and our `.c-button[data-style="solid"]:not(:disabled):hover`
   all become `{ subject, conditions: [{prop, value}], states }`. A Spectrum
   modifier class is resolved to a prop through the `.d.ts` enums
   (`--staticWhite` → `staticColor=white`); one no prop admits (`--iconOnly`,
   `--hasIcon`) is kept as *derived* and never becomes a prop.
3. **The drafter** (`lib/from-code.mjs`). Places every declaration into the
   schema's shapes — `tokens`, `states`, `tokensByProp`, `statesByProp`,
   `tokensByCombination` — and resolves the component's own custom-property
   indirection: `:host([size="50"]) { --swc-avatar-size: var(--swc-avatar-size-50) }`
   read through `inline-size: var(--swc-avatar-size, var(--swc-avatar-size-500))`
   becomes a 17-row size map plus a `{swc.avatar.size.500}` base. A `var()` is a
   reference when the token build ships the name; an unshipped `--swc-<component>-*`
   seam resolves to its fallback; everything else is `raw:`. Shorthands
   (`outline`, `border`, `padding`, `margin`, `gap`, `inset`) land as longhands.

**Acceptance (`from-code.test.mjs`): avatar regenerated from code equals the
hand-written contract** — same six props and attributes, same part, same
seventeen sizes, same outline ring and its 2px step from 1000 up, same disabled
state, same asset binding — and the draft validates with the same eight raw-value
warnings. The differences are the code's truth, not the draft's errors: the root
is `<div>` (the markup) where the hand-written said `span`, and the image is
sized by the size map (the stylesheet) where the hand-written said `100%`.

What it refuses, as open decisions: rules keyed on structure (`:has()`,
`--hasIcon`, `--iconOnly`), three-prop combinations the schema cannot place,
`calc()`/gradient values that mix a token with a literal, and any element it
could not read from the markup. Badge drafts with 9 such notes, button with 17.

---

## What a design system has to declare

Adding a third system means declaring these. Today they are spread across the
data plugin, the extract plugin and the golden-sheet script, in three different
shapes, which is the thing that will not scale.

| | ours | Spectrum 2 |
| --- | --- | --- |
| source tree | `packages/components/src` | `packages/spectrum2/src` |
| token build | `dist/packages/tokens/css/dev` | `packages/spectrum2/tokens` |
| contract namespace | `s2a` | `spectrum` |
| **token namespace** | `s2a` | `swc` |
| root class | `c-<slug>` | the implementation's own |
| build command | `npm run specs:build` | `packages/spectrum2/scripts/build.mjs` |

The contract namespace and the token namespace differ for Spectrum: contracts
are `spectrum.button`, tokens are `{swc.*}`, because the implementation is
`@adobe/spectrum-wc` and its custom properties are `--swc-*`.

### The naming problem, which is the real one

A design-tool variable name is not a token name. Ours are identical by
construction, which hid this for a year:

```
s2a/border/width/md            →  {s2a.border.width.md}        works
Alias/background/neutral/default  →  --swc-neutral-background-color-default
```

The segments reorder, `color` is inserted, `semantic` is dropped. Of 35 refused
references on one draft, 25 resolved with one rule and 10 needed a table.
**Adobe publishes both names for every token** in `@adobe/spectrum-design-data`,
so the table can be generated.

**Do not widen the schema's reference pattern to accept the design names.** That
makes the validator pass while the reference still names nothing — the failure
mode that produced a wrong blue and an invisible icon. Translate at the
boundary; keep the shape strict. Where a name cannot be mapped, emit
`raw:<resolved literal>` plus an open decision: valid, honest, visibly unbound.

---

## Spectrum 2 specifics

- **The package is `@adobe/spectrum-wc`**, not `@spectrum-css`. The latter is the
  first-generation library with a different token vocabulary and cannot
  reproduce the S2 design file. Adobe's own component data names
  `@react-spectrum/s2` and `@adobe/spectrum-wc` as the web implementations.
- **`dist/tokens.css` alone renders nothing.** Every sized value is a space
  toggle; `dist/swc.css` collapses it and sets the `color-scheme` the
  `light-dark()` colours need. Both are vendored.
- **Props live in the `.d.ts`**, not the JS, which is minified and uses
  decorators. The reader handles numeric enums, accessor pairs and mixin
  interfaces; all three were needed for avatar alone.
- **`global-button.css` ends with `all: revert-layer !important`**, which erases
  any author styling on `.swc-Button`. Our components carry their own geometry
  and do not load it.
- **Glyphs paint with `fill="var(--iconPrimary, #222)"`**, not `currentColor`.
  The icon part maps that hook so a glyph follows its component.

### Findings worth raising with Adobe

Recorded as open decisions on the contracts; none are ours to fix.

- Badge hardcodes 7/8/9/10px radii while `corner-radius-medium-size-*` holds
  exactly those values. Across their component stylesheets, 40% of custom
  property assignments are literals.
- Badge's Medium radius is 7 in Figma and 8 in the code.
- The design file and the code disagree on line height at two button sizes.
- Figma's Button has a trailing icon; the code has one leading slot. The code
  has `truncate` and `justified`; the design has neither.
- Badge's style is one axis of three in Figma and two independent booleans in
  code, so `subtle` and `outline` can both be set — a combination the design
  cannot express and no rule covers.
- Avatar's design offers four styles; the implementation renders one `<img>`.

---

## The Contract Book, and Storybook (decided 2026-10-28)

The Book had been growing into a Storybook: a story index, controls, a
design-variant browser, a wipe. That was the wall. Its preview *reconstructed*
Spectrum from the contract, so every gap in the reconstruction was ours to
chase — the avatar's layers, the outline, the icon colour, light and dark.

**The split:**

| | Contract Book | Storybook |
| --- | --- | --- |
| evidence (figma / code), defs editor, refusals, decisions, sign-off → build | ✓ | — |
| browse variants, controls, deep links, theme toolbar | remove | ✓ |
| design overlay / wipe, parity scoring | read the eval result | ✓ (`eval:visual:matrix`) |
| what draws the component | nothing | the library's own element |

**Done:** a third renderer, `upstream` (`lib/renderers/upstream.mjs`). For a
system whose `storybook.renderer` is `upstream`, the stories import the
library's own registration module (`@adobe/spectrum-wc/components/avatar/swc-avatar.js`),
create `<swc-avatar>`, set its properties from the args, fill the default slot
with the label and the icon slot with a glyph from the system's icon manifest
wrapped in the system's icon component, and let Spectrum draw. No component,
no CSS is generated; one scoped stylesheet (`spectrum.css`, the vendored token
build with `:root` → `.swc-root`) wraps each story so Spectrum's theme setup
never touches the rest of the canvas. The toolbar's Theme global drives
`.swc-theme--light|dark`.

```bash
npm run specs:render:spectrum          # or: node packages/spectrum2/scripts/build.mjs (renders after building)
```

Stories land in `apps/storybook/stories/spectrum/` under the `Spectrum/` title;
the State matrix story carries `figma.slug: "spectrum:<name>"`, so the existing
design overlay and `eval:visual:matrix -- --slug=spectrum:badge` find the
committed sheet. `systems.mjs` (`packages/spec-dictionary/systems.mjs`) is now
the one declaration of what a system is; the Spectrum build, the golden sheet,
the matrix parity and the renderers read it.

Two things the real element shows that the reconstruction hid: the workflow
icons ship on Spectrum CSS's `--iconPrimary` hook while the web components
colour through `--swc-icon-color` (the manifest now carries the glyphs on the
web components' hook — `scripts/pull-icons.mjs`, recorded in the manifest's
`fillHook`); and a hover column cannot be forced on a shipped element, only
pointed at, so the matrix's Hover column equals Default until the parity run's
behaviour pass hovers it.

**Also done (same day): the Book is stripped.** It draws nothing. The Render
tab is Storybook's iframe for the component's default story (theme select;
`pointer-events: none`; a link opens Storybook proper). The Parity tab scores
the State matrix **as Storybook renders it** — `vite-plugin-parity.mjs` drives
headless Chromium at the Storybook URL, so what is scored is the build on
disk, for Spectrum the library's own element. Gone: `preview.ts`,
`matrix.ts`/`matrix.html`, the story strip, the controls, the Design tab, the
in-preview wipe, the `/__assets` and `node-image` routes, the verbatim token
CSS in the data bundle. Heal still patches the editor, but its score is the
build's, so its log says "save to rescore". The *Save defs* button is now
*Sign off*: write, build, regenerate stories, Storybook follows. Lit/CSS/Milo
tabs show only for our own system, since a shipped library is not generated.

**Design-only stories.** A design axis no prop binds — Avatar's Style (User
image, Gradient image, Initials, Guest), Badge's Color — used to vanish: the
stories come from the props. Now `upstream` also writes
`<Name>.design.stories.js` under `Spectrum/<Name> (design only)`: one story
per unbound axis value, showing Figma's own render of that variant (committed
under `evals/datasets/contracts/golden/<system>:<slug>/<node>.png`, fetched by
`npm run goldens:variants -- --slug=spectrum:avatar`) with the axis, the
import path it is absent from, and the decisions that discuss it. The gap is
something you can point at in Storybook rather than a variant that silently
never appears. Also: a story whose variant paints in the canvas colour
(Avatar's outline ring is gray-25 on gray-25) is placed on a `layer` ground —
`systems.mjs` declares `canvas` and `layer` per system, and every Spectrum
story has a `ground` control.

**Next, in order:** (1) make the Book's *Draft* run `--from=code` for a system
with code evidence; (2) the token adapter as a Storybook toolbar entry —
`tokens: spectrum | s2a` — loading one CSS file that maps Spectrum's
`--swc-<component>-*` seams onto `--s2a-*`, the same stories rendering both
ways.

### What the Book was meant to be (kept for the record)

Storybook, powered by a contract. Browse the variants, see the contract that
produces them, edit it, sign off, and watch the component rebuild.

Four views, one component drawn in one place:

- **Preview** — the live component with controls, the story index above them, and
  the design render underneath on a wipe.
- **Design** — every variant the *file* has, read from the evidence rather than
  the contract, with axes the code does not implement tagged `design only`.
  This is how a design/code gap becomes visible instead of invisible.
- **Parity** — the state matrix scored against a committed golden sheet, with
  per-cell design/built/diff crops and a wipe.
- **Defs editor** — live, with sign-off writing the file and running that
  system's build.

### UX rules learned the hard way

1. **Never take the render away.** The story index was briefly its own tab and
   that was wrong: picking a variant is the same act as setting a control, and a
   browser that hides what you are browsing is useless.
2. **One place draws the component.** Stories, controls and the design overlay
   all feed the same preview.
3. **An optional enum needs an empty choice.** Without one the browser picks the
   first value and the preview silently shows something nobody asked for.
4. **Align an overlay to the component's box, not the stage's.**

### Still missing

- Cross-component browsing. One component at a time; no library-wide index.
- Deep links. A story has no URL.
- The Book's *Draft* button still runs the design-first scaffolder; for a
  system with code evidence it should run `--from=code` and use the design only
  to anchor and bind.
- The Book's extract/data plugins still carry their own SYSTEMS tables (src,
  inbox, anchor, build); `systems.mjs` is the declaration they should read.
- The design-variant matcher ignores axes the contract dropped.

---

## Known structural problems

**The same bug, nine times.** Every one was a hardcoded assumption that there is
only one design system — `{s2a.…}` in the schema, `--s2a-` in the token parser,
`packages/components/src` in five scripts, a rewrite of literals into our scale.
Each fix was the same shape: make the system a parameter. Expect more.

**Two implementations of "is this contract valid".** `validate-defs.mjs` and the
Book's `curationRefusals` drift, and have cost real time twice: once on
structural values, once on assets, where the Book refused what the command line
passed. One rule now lives in `lib/structural.mjs`; the asset, slot and
composition rules are still duplicated. **Consolidate these.**

**The renderer decides things it should read.** Attributes were chosen from the
Figma binding rather than from what the stylesheet conditions on, so a boolean
bound to a Figma boolean got no attribute and Avatar's outline rule could never
match. It now reads the contract. Look for the same pattern elsewhere.

### Open schema changes (why the gate is red)

Both deliberate, both strictly loosening, both unlocked pending review:

1. Token references accept any namespace, not only `{s2a.…}`.
2. `asset` requires only `prop`; `manifest` and `field` are optional, so an
   element whose source is a prop can be expressed. Added `altProp`.

Run `npm run gate:lock` to accept them, or revert.

---

## Next: the token translation layer

Not started. The shape, from what the Spectrum work proved:

A design system declares a **naming adapter** with three jobs — design name to
contract reference, contract reference to implementation name, and the set of
names that actually ship. The second is what makes Sass or a native platform
work later, where one reference becomes a dollar variable or a Swift identifier.

For Forge specifically, the question is how a Spectrum component reskins to S2A
tokens. `--mod-*` on the first-generation library and `--swc-<component>-*` on
Spectrum 2 are the documented override seams; Button already drives them.

---

## Commands

```bash
npm run contract-book                                   # the Book, port 6007
node packages/spectrum2/scripts/build.mjs               # build the Spectrum contracts
node packages/spec-dictionary/scaffold.mjs --slug=avatar --from=code \
  --root=packages/spectrum2/src --tokens=packages/spectrum2/tokens \
  --import=@adobe/spectrum-wc/components/avatar [--force]   # draft a contract from the implementation
npm run pull -w @s2a/spectrum2                          # re-vendor from node_modules
node packages/spectrum2/scripts/pull-figma.mjs          # design evidence (needs the Book running)
npm run goldens:sheet -- --slug=spectrum:badge          # a golden sheet
npm run gate                                            # everything
node packages/components/scripts/validate-defs.mjs \
  --root=packages/spectrum2/src --tokens=packages/spectrum2/tokens \
  --ns=swc --assets=packages/spectrum2/assets           # validate another system
```

Nothing from this effort is committed. `packages/spectrum2` is untracked.
