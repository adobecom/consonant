# Prompt — bulk contract extraction with figma-console

A brief for driving the contract pipeline across many component sets at once,
without a person clicking **Extract** in the toolkit each time.

Paste the block under **The prompt**. Everything above it is why it is written
that way; everything below it is the traps it is written to avoid.

---

## What makes this possible

**`figma_execute` runs inside the S2A Toolkit itself.** The toolkit *is* the
Desktop Bridge (plugin id `1672001342733547591`), so an agent evaluating code
through figma-console is already in the plugin's own sandbox — same file, same
selection, same `figma.*`.

What it could not reach was the plugin's own code: esbuild scopes the bundle, so
`extractEvidence` was invisible to an evaluated snippet. The alternative — ship a
second copy of the extractor as a ~23 KB code payload — works, but a second copy
drifts, and a drifted extractor produces evidence that disagrees with the
plugin's for reasons nobody can see.

So `src/code.ts` now publishes it:

```js
globalThis.S2A = { version, extract(node), hashableBody, canonicalJson }
```

`S2A.extract(node)` is the same function the **Extract** button calls, with the
api already wired to `figma.*`. One extractor, one behaviour, whoever drives it.
Extraction from an agent is then:

```js
const node = await figma.getNodeByIdAsync('11223:203954');
return await globalThis.S2A.extract(node);
```

The agent writes the result to
`packages/components/src/<slug>/<slug>.figma.evidence.json`. The sync server is
not involved — it only matters for the plugin's own Publish button.

> Rebuilding the plugin (`npm run build` in `apps/s2a-toolkit`) makes Figma drop
> the connection. Reopen the toolkit in Figma afterwards, and confirm with
> `typeof globalThis.S2A` before extracting anything.

> **The sandbox evaluates plain JavaScript, not TypeScript.** A stray `as
> unknown as {…}` fails with `Syntax error: expecting ')'`, which reads like a
> connection problem and is not one.

Verified round trip on `PromoCTA — v2` (`11223:203954`): 6 variants, 7 axes
including `State[default|hover|active]`, 202 bindings, 30 instances, 22
variables, `s2a:meta` 2.0.0 — matching the set's own children and property
definitions.

## Scope — what to actually contract

The file has **227** component nodes. Most are not contract material:

| | count |
|---|---|
| deprecated (🚫 prefix) | 36 |
| icon rig | 34 |
| hidden/internal (`.name`) | 27 |
| public | 130 |

Of the public ones, after excluding the GNav/WIP and Playground pages:

- **47 component sets** — have variant axes, extract cleanly, produce a state matrix
- **63 standalone components** — no variants (`Label`, `Tabs`, `JumpLink`, `Selector`…)

Start with the 47 sets. The standalone components are a different shape and the
pipeline has never been run on one — treat the first as an experiment, not a
batch.

---

## The prompt

> You are extending the S2A contract pipeline across the Figma library. Work in
> `/Users/mhuntsberry/Desktop/consonant-2`. Read `CLAUDE.md` first, then
> `.claude/commands/contract-ship.md`, then this file's **Traps** section —
> every item there cost real debugging time and you will hit them.
>
> **Goal.** Produce trustworthy contracts for a chosen subset of the Figma
> component sets, render each to Lit + Milo, and leave each one measurable
> against its design in Storybook.
>
> **Reference standard.** `context/golden-dataset/` holds the Workiva contract
> POC — the quality bar for what a contract should contain. Theirs generates
> code from the contract; ours also generates Figma. Match their rigour, not
> their shape.
>
> ### Step 1 — choose, do not batch
>
> Run `npm run specs:composition` and read `packages/spec-dictionary/out/contracts.index.json`.
> Then propose a ranked shortlist of 5–8 component sets and **stop for approval
> before extracting anything**. Rank by:
>
> - has a `State` axis on the set itself (produces a real state matrix)
> - has a coded component already (`<slug>.js`), so `defs:validate` can check the
>   contract against something real
> - few or no composed dependencies, or dependencies that are already contracted
> - not on the GNav/WIP or Playground pages; not deprecated, hidden or an icon
> - **low `unboundPaint` count.** Every unbound paint is a colour with no token
>   behind it, so it cannot be expressed in a contract and will surface later as
>   a visual diff nobody can fix from the defs. PromoCTA reports 132 — a lot to
>   clean up before it is worth contracting. Report the count per candidate and
>   let it weigh against the pick.
>
> Say explicitly which ones you are NOT proposing and why. A component whose
> states live in a hidden child set is a poor first pick — see Traps.
>
> ### Step 2 — extract, one at a time
>
> Confirm `typeof globalThis.S2A === "object"` first; if it is undefined the
> toolkit needs reopening in Figma. Then for each approved set, via
> `mcp__figma-console__figma_execute`:
>
> ```js
> const node = await figma.getNodeByIdAsync('<setId>');
> return await globalThis.S2A.extract(node);
> ```
>
> Write the result to `packages/components/src/<slug>/<slug>.figma.evidence.json`.
> Do not reimplement extraction — this is the same code the Extract button runs,
> and a second implementation drifts silently.
>
> Verify before moving on: the variant count matches the set's children, and the
> axes match the set's `componentPropertyDefinitions`. If they do not, stop —
> do not curate on top of bad evidence.
>
> ### Step 3 — scaffold and curate
>
> `npm run evidence:code -- --slug=<slug>` then scaffold the defs. Then curate:
>
> - every code prop is either `lever: true` or `lever: false`, never absent
> - `composition[]` has one entry per **direct** dependency, each `contract`,
>   `internal` (with a `why`) or `icon`
> - every judgment goes in `decisions[]` with real reasoning, not a restatement
>
> ### Step 4 — ship
>
> `/contract-ship <slug>`. It validates, builds, gates, repacks coverage,
> renders, shoots the golden sheet and scores the matrix. **Stop at the first
> failure and report it verbatim.** A failure here is the system working.
>
> ### Step 5 — close the loop, with a referee
>
> `npm run eval:visual:matrix -- --slug=<slug>` scores every cell and emits
> difference codes (VD01 paint outside the box, VD02 edge, VD03 fill, VD04
> text). For each finding:
>
> 1. Decide **which side is wrong** before changing anything.
> 2. If the code is wrong → change the **defs**, never the contract and never
>    the generated CSS; both are overwritten on the next build.
> 3. If the design is wrong → **say so and ask**. Do not edit Figma.
> 4. Re-render, re-score. Keep the change only if that cell's diff drops and no
>    other cell rises. Otherwise revert it.
>
> Watch the line that flags a state consistently worse than the others *without*
> failing — a focus ring is only a few percent of a cell and hides under the
> threshold.
>
> ### Rules
>
> - Never commit. Report what changed and let Matt decide.
> - Never run `specs:clear` with `--force`; it destroys uncommitted curation.
> - Figma is the target. "Fix" always means align the code.
> - Verify by looking at a render, not by reasoning about the code. Every real
>   defect in this pipeline was caught by looking.

---

## Traps

Each of these produced a wrong result that looked right.

**Hidden components own the states.** `Checkbox` has one variant (`Style=default`);
its sibling `.checkbox` has two (`State=unchecked|checked`) and that is where the
state lives. The coded component has seven props. Extraction of the parent alone
can never produce an honest contract. Conventions seen so far: a dot prefix
(`.checkbox`), a slash namespace (`PromoCTA/Arrow Button`), and plain names
(`Label`, `Media`).

**The crawl is a deep walk.** `instances` includes instances nested inside other
instances. `action-card`'s `Overlay` sits inside its `Media` instance and belongs
to Media's contract. Only the shallowest are direct dependencies.

**A component's own root is never in `instances`.** Everything in that list is an
instance of some other component.

**Figma strokes are not CSS borders.** `strokeAlign: INSIDE` does not change a
shape's size; a CSS border on an auto-width control does. Strokes render as an
inset `box-shadow`. An unused border is not an absent one — a `<button>` carries
a 2px outset UA border, so the floor zeroes it.

**Dark goldens lose mode-dependent alpha.** A token whose alpha differs between
modes exports opaque — `transparent/white/12` came out at alpha 1.0 in both REST
and plugin export. Before treating a dark diff as a code bug, read the variable
back with `resolveForConsumer`; if it agrees with the CSS, the artwork is wrong.

**Re-shoot goldens after any Figma edit**, or the next diff blames the code for a
design change.

**`resize()` flips auto-layout sizing to FIXED.** Reassert
`primaryAxisSizingMode = 'AUTO'` after every resize.

**The sync server caches ESM modules** for the life of the process. If it is in
play, restart it after changing anything under `packages/spec-dictionary/`.

**An eval threshold is an area test.** A 2px focus ring is ~4% of a cell and
passes an 8% bar while being 100% absent.
