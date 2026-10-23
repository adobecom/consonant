# Contract Book

The contract loop, in the browser, on this repo's own components.

```
npm run contract-book        # http://localhost:6007
npm run contract-book:build  # dist/apps/contract-book
```

Modelled on Southleft's [Contract Playground](https://ds-contracts-playground.pages.dev/)
— paste a Figma link, pick a component, edit, watch every derived surface move,
and when you break it, read the refusal by name. Same shape, one deliberate
difference, below.

## Same engine

The Book does not have an engine of its own. It imports `packages/spec-dictionary`
— `buildIR`, the formats, the Lit and Milo renderers — unchanged, and runs them
in the browser. Two things stood in the way and both are handled without
forking the engine:

- `node:crypto` (a defs revision is hashed for provenance) is aliased to a
  small synchronous SHA-256, byte-identical to Node's on test inputs.
- Reading files off disk — the token CSS, evidence, the schema, asset manifests
  — is done once by `vite-plugin-s2a-data.mjs` at dev/build time and handed
  over as one virtual module. The engine's `tokensFromFiles` takes the parsed
  snapshot through the same resolver `loadShippedTokens` uses on disk.

So what the Book shows is what `npm run specs:build` writes. That is checked,
not assumed: Button's contract and CSS from the browser are byte-identical to
`button.contract.json` and `generated/Button.css` on disk.

The refusals are the same too. The schema layer is the same `defs.schema.json`
compiled by Ajv with the same options as `@adobecom/s2a-validators`; the
curation layer is `validate-defs.mjs` with its file reads replaced by the
bundled data, message for message. Checkbox's eight failures in the Book are
the eight the gate reports.

Two steps cannot run in a browser — driving Chromium, holding a Figma token —
so they sit behind two dev-server endpoints, each a thin wrapper around code
that already exists:

- **Parity** (`vite-plugin-parity.mjs`) renders the State matrix story the
  Book just derived on a bare page (`matrix.html`, which loads the same
  normalize, tokens, base and fonts as `.storybook/preview.js`), shoots it in
  headless Chromium at the golden sheet's scale, and scores it with
  `evals/visual/matrix-parity.mjs` — the file `npm run eval:visual:matrix`
  runs, imported, not copied. On Button the thirty cell scores agree with the
  CLI's to within 0.03% and the difference codes are identical. When the
  matrix has an open and a closed column the eval also **plays**: it clicks
  the trigger in every closed cell and scores what appears against the
  design's open artwork for the same row. A disclosure that only moves its
  chevron passes the static grid and fails this one.
- **Extract** (`vite-plugin-extract.mjs`) pulls a component set over the
  Figma REST API and feeds it to the toolkit's own extractor
  (`apps/s2a-toolkit/src/contract-extract.ts`, loaded through Vite so the
  TypeScript source runs as-is). `server/figma-rest.mjs` adapts the REST node
  shape to what the extractor reads off a plugin node. It then hashes and
  resolves the slug with the sync server's functions and drafts the defs with
  the real scaffolder — the same path the toolkit's Publish takes.

- **Crawl / Contract tree** (same plugin) walks the tree behind a link — every
  set the component places, to the leaves — and contracts it **leaves first**:
  draft → save → build per set, against the contracts that exist by then. A
  parent's contract composes its children's, so the order is not optional.
  `demo/contract-tree.mjs` is the headless twin.
- **Heal** (`src/heal.ts`) closes the gaps the evals and refusals open with
  evidence-bound fixers — resolve or fetch an icon, turn a Focus Ring layer
  into an outline — re-scoring after each, and records every fix as a decision.

## Composition

A contract describes a component's own layers and names what it composes.
The scaffold reads the whole layer tree: structural frames become nested
parts with their layout; text layers become text slots with the design's
words as default; instances become composed slots — restricted to that
component, defaulting to what the design placed there with the design's
overrides (`Label: "Get free app"`, `Style: solid`). The Lit renderer imports
each composed child's generated module and renders it through the child's
own contract. Nothing below an instance is read by the parent: that is the
child's contract, which is why leaves come first.

The evidence carries a layer tree **per variant**, and the scaffold reads the
union of them. One tree was never enough: Collapsible's Style=control
variants carry a leading `.icon-start` layer and no chevron, and the open
variants carry a ChevronUp — none of which exists in the resting variant. A
layer that exists in some variants only becomes a slot hidden where it is
absent (`defaultByProp` with `visible: false`, listed first so it wins), and
a layer that is absent at rest is hidden by default and filled where it
appears. A value bound on every variant the layer exists in is a base token,
not a "when closed" token. A Figma Slot's children are the design's example
and are never read as anatomy. A composed child's nested icon swap is read
as that child's own icon prop (ControlButton shows Arrow Right closed and
Arrow Down open), and Heal binds the name to the library as it does a slot
default.

## You edit the defs, not the contract

Southleft's playground puts the cursor in the contract. Here the centre pane is
the **defs** — the one human-authored file — and the contract is derived from
it live, read-only, in the next pane. In this pipeline the contract is never
edited, so a Book that let you would teach exactly the wrong habit. Change a
decision; the contract, the stylesheet, the Lit, the Milo block, the Figma
plan and the parity score all move.

## Panes

- **Library** — a Figma link field (a component set's link, with its
  `node-id`), then every contracted component with its gate state (clean /
  warn / fail), and the count still waiting for extraction. An extracted set
  joins the list as a *draft*: in memory, built like any other, on disk only
  when you click **Save**.
- **Defs** — editable; status line says valid, how many refusals, or that the
  file is not JSON. *Reset* reloads from disk. A draft shows a banner with the
  scaffolder's low-confidence guesses and *Save to repo* / *Discard*.
- **Output** — Preview (the Lit renderer's own emitted module, evaluated with
  the real token CSS and Adobe Clean, with prop and theme controls), Parity
  (the cell grid, click a cell for design / built / diff and its codes, the
  codes rolled up by state), Contract, CSS, Lit, Milo, Figma plan, Spec,
  Evidence (read-only — observed, never edited here; a draft adds the REST
  fidelity line and the draft notes), and Refusals (click one to jump to its
  key in the defs).

## What writes to disk

Only **Save** on a draft. It goes through the sync server's `handleEvidence`
(the publish path the gate's FRESH check trusts) and then writes the defs
draft beside the evidence, as `npm run specs:scaffold` would. For a component
that already has a defs, Save writes the fresh evidence and keeps the defs
unless you choose *overwrite defs too*. The data plugin watches the component
tree, so the page reloads from disk and the draft badge goes away. Shipping —
build, gate, render, sheet — stays with `/contract-ship`.

## REST versus the plugin

The same extractor runs, so the evidence is the same shape and, for Button,
the same content: axes, 30 variants, anatomy, 90 instances, text styles and
the token bindings are identical to the plugin's extraction. Three honest gaps:

- REST does not expose `width`/`height` bindings, so those 30 bindings (one
  variable) are absent. Nothing downstream reads them.
- REST cannot see variables from a library the file subscribes to
  (`/variables/local` is local by definition). The draft banner says how many
  bound variables resolved; for the ones that did not, extract in the toolkit.
- REST reports a different component `key` than the plugin API for the same
  node. It is informational in the evidence; the build does not read it.

So a REST extraction hashes differently from a plugin extraction of the same
set — the gate will call it *updated*, not *in-sync*. That is a true
statement about the two extractors, not a defect in either.
