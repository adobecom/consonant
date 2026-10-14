# Contract Render

Turn one contract into every implementation that needs it. The contract is the
only input; each target decides what files it needs and where they go.

This is the step after `/contract-ship`. Ship produces the contract; render
produces the code.

## Usage

```
/contract-render <slug>                  every target
/contract-render <slug> --target=milo    one target
/contract-render --all
/contract-render --all --check           fail if anything is stale, write nothing
```

---

## Targets

| id | what it writes | where |
|---|---|---|
| `lit` | Lit function component, CSS, Storybook stories | `apps/storybook/stories/generated/` |
| `milo` | `init(el)` block decorator + class-based CSS | `packages/milo-blocks/<block>/` |

Neither writes into `packages/components/src/`. Hand-written components and
generated ones never occupy the same file, so a regeneration can never silently
eat someone's work.

## What to run

```bash
npm run specs:render -- --slug={slug}
```

A render needs a contract, so if it errors with `no defs.json`, the component has
not been through `/contract-ship` yet. Do that first; do not hand-write a defs
file to get past it.

Then check the output actually holds together:

```bash
npm run specs:render -- --all --check     # byte-identical to a fresh render?
npm run gate
```

## Report back

```
button
  lit     Button.js · Button.css · Button.stories.js        35 token bindings
  milo    button.js · button.css                            6 style classes
  check   fresh
```

Then say what the generated CSS actually covers — the number of styles and
states that made it through — because that is the thing a reader cannot see from
a file list.

---

## The two shapes, and why they differ

**Lit** is props in, template out. Variants are data attributes so a story can
force any combination:

```css
.c-button[data-style="knockout"]:hover { ... }
```

**Milo** decorates markup an author already wrote. Nothing renders from props —
`init(el)` finds the authored rows and rearranges them, and variants arrive as
classes on the block element:

```css
.button.knockout:hover { ... }
```

The row convention is load-bearing: **a part's position in the contract's
anatomy is the authored row it expects**. The generated block writes that
mapping into its own header comment so nobody has to infer it.

## Adding a target

A target is `{ id, description, files(ir, slug, extras) }` returning
`{ relativePath: contents }`. Add a module under
`packages/spec-dictionary/lib/renderers/` and one line in `index.mjs`. Nothing
upstream of the contract changes — that is the point of having a contract.

## When it looks wrong

If the generated CSS has fewer rules than the component has variants, the
contract is the problem, not the renderer. Check that the defs use
`tokensByProp` / `statesByProp` rather than a single flat `tokens` map — a flat
map can only describe the resting case, and the renderer can only emit what the
contract carries.
