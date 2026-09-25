# packages/specs — the spec dictionary

Style Dictionary's architecture, one level up the stack. Style Dictionary takes one
token source and fans it out to many platforms. This takes one canonical IR — curated
definitions plus whatever evidence we extracted — and fans it out along **two orthogonal
axes**.

```
                 defs.json  (human judgment, stored as data)
   code evidence ─┐
                  ├──▶  IR  ──▶  adapters (SCHEMA)  ×  formats (SERIALIZATION)
 design evidence ─┘                    │                      │
                            s2a · southleft · catalog   json · yaml · mjs · ts · md
```

**Adapters** decide the *shape*: which schema the data conforms to.
**Formats** decide the *serialization*: how that shape is written down.

They never know about each other. A new schema target costs one adapter file and
inherits every format. A new serialization costs one entry in `engine/formats.mjs` and
every adapter gets it for free.

## Why two axes instead of one format

Nobody knows yet whose component-contract format becomes the recommended one. Today we
align to [`southleft/ds-contracts-poc`](https://github.com/southleft/ds-contracts-poc),
which is the closest thing to a standard that exists and is publicly developed. That may
or may not be what a W3C-level recommendation eventually looks like.

Betting the pipeline on one schema means rewriting the pipeline when the bet moves.
Betting on an adapter means writing one file. That is the whole argument for this shape.

## Layout

```
engine/          the transform engine — ZERO dependencies on this project
  index.mjs        runTransform({ ir, adapters, formats, write, log })
  formats.mjs      FORMATS = { json, yaml, mjs, ts, md }
adapters/        the schema targets
  s2a.mjs          our working format (spec.json)
  southleft.mjs    the interop contract (contract.json)
  catalog.mjs      the light index entry (catalog.json)
lib/             project-specific: IR construction, token resolution, emitters
examples/minimal/  the portability proof — runs standalone, uses nothing from S2A
dictionary.json  the ROLE vocabulary (a different thing — see below)
```

`engine/` is inside this workspace but depends on nothing in it. That is the portability
test: if it ever needs to know about S2A to work, it has stopped being an engine.
`examples/minimal/run.mjs` proves it with a hand-written IR, no defs, no tokens, no repo
layout — run it and see.

## Two things called "dictionary"

Worth stating plainly, because the word is overloaded:

- **`engine/` — the spec dictionary.** A transform engine. Adapters × formats. Knows
  nothing about any design system.
- **`dictionary.json` — the role vocabulary.** Roles, canonical parts, token defaults,
  archetypes. It is what lets `scaffold.mjs` turn raw Figma evidence into a first-draft
  definition. It is entirely about *our* design system.

They are complementary, not competing. The vocabulary produces a definition; the engine
transforms it.

## The three adapters

| Adapter | Emits | For |
|---|---|---|
| `s2a` | `<slug>.spec.json` | our tooling — resolved token values, evidence hashes, open decisions |
| `southleft` | `<slug>.contract.json` | a second party — validates against the vendored external schema |
| `catalog` | `<slug>.catalog.json` | pickers, the MCP directory, agent context windows |

The split matters. The interop contract is strict (`additionalProperties: false`
everywhere), so resolved values, evidence hashes and decisions have nowhere to live in
it. Rather than smuggle them in, they stay in our working format, and the catalog carries
the browse-level summary. Three audiences, three artifacts, one source.

## Commands

```bash
npm run specs:build                                   # canonical artifacts, beside each component
npm run specs:check                                   # freshness — hand edits and staleness fail
npm run specs:export -- --format=ts,yaml,md           # renditions, into out/exports/
npm run specs:export -- --slug=action-card --format=ts
npm run specs:export -- --adapters=southleft,catalog
npm run specs:upstream                                # drift against the external schema + conformance
node packages/specs/examples/minimal/run.mjs          # the portability proof
```

**Canonical output belongs to `specs:build`**, because that is what the freshness leg of
the gate compares against. `specs:export` writes renditions only, into a gitignored tree.
A rendition is never a source — if it could be, a format nobody gates would eventually
be edited by hand and believed.

## The `ts` rendition

Worth calling out because it is the one people actually read. JSON is the wire format the
gate validates; TypeScript is how a human reviews a contract. Descriptions become doc
comments, the object is typed with `as const`, and an exported type comes with it. Open
it in the editor rather than reading JSON in a browser tab.
