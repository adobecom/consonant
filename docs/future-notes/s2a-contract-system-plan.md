# S2A Contract System: Plan

Drafted 2026-09-17. This takes the discipline of the portable "contract system"
(evidence → curation → transform → gate → generation, with a plugin round trip)
and builds it into S2A, which already has the piece that system lacked: a token
foundation the contract can be verified against. Nothing here replaces an
existing tool; each step adds a script where today there is judgment or a prompt.

## Where S2A stands against the five layers

| Layer | S2A today | Gap |
| --- | --- | --- |
| Contract | `packages/components/src/<slug>/<slug>.spec.json` (36), zod schema in `apps/s2a-ds-mcp/src/spec-schema.ts` | No design/code anchors beyond an optional `figmaNodeId`; no provenance; `tokenBindings` is a flat name map, not per anatomy part and CSS property |
| Evidence, design | Figma MCP reads, `figma_execute` scripts, the toolkit's annotation walker, this week's `evals/datasets/homepage/tokens.json` | No stored, deterministic evidence file per component; `/figma-to-json` fuses extraction and judgment in one agent step |
| Evidence, code | none | Components are Lit templates, so there is no compiler prop surface to extract |
| Curation | inside `spec.json` and the `/audit-spec` prompt | Judgment and machinery in one file; no way for a designer to propose |
| Transform | token pipeline (`packages/tokens/scripts`: Figma sync → JSON → CSS via Style Dictionary transformers) | No spec transform; specs are written, not built |
| Gate | `s2a-ds` MCP validators, 7 eval scorers, Figma health scorers, `authoring-checks.yml`, page evals (visual, motion, tokens) | Not one command; not a required check; no code-conformance or freshness class |
| Generation | `/spec-to-html`, `/json-to-figma`, `/spec-to-doc`, `/component-docs` | Agent-driven, never diffed against disk |
| Round trip | s2a-toolkit plugin: sandbox owns selection, UI owns network; WebSocket bridge to Claude Code; GitHub workflow dispatch and issue creation | Publishes requests and token releases, not evidence; holds a GitHub PAT client-side |

## Target architecture

```
Figma component set ──(plugin: Extract)──▶ <slug>.figma.evidence.json ─┐
Built component     ──(runtime extractor)─▶ <slug>.code.evidence.json  ─┤
<slug>.defs.json (curated, reviewed)                                   ─┼─▶ spec transform ─▶ <slug>.spec.json (canonical)
packages/tokens/json (token source of truth)                           ─┘        │
                                                                                  ├─▶ stories · doc-sheet data · Markdown · Figma build plan
                                                                                  └─▶ gate (schema · composition · tokens · design-binding · code · freshness · page evals)
```

Both ends stay native. Design stays in Figma with its variable modes and
`s2a:meta` versions; code stays Lit + CSS. Only the agreement is generated,
versioned and checked.

### 1. Design evidence (step 1, built 2026-09-17)

The toolkit gains an **Extract contract** tool. Selecting a component set (or a
variant, or an instance) and pressing Extract runs a deterministic walk in the
plugin sandbox, with no agent involved, and produces `figma.evidence.json`:

- `file`, `set`: file key and name, set id, key, name, description, parsed
  `s2a:meta` (version, status, updated, changelog), documentation links.
- `axes`: every component property definition: VARIANT options and default,
  BOOLEAN, TEXT, INSTANCE_SWAP with preferred values.
- `variants`: id, key, name, parsed axis values, size.
- `anatomy`: the default variant's layer tree (names, types, layout mode,
  sizing), which is the design's own description of the anatomy.
- `bindings`: one row per node, property and bound variable across every
  variant (fills, strokes, padding, gap, radius, stroke weight, typography,
  size), plus text-style bindings and explicit variable modes on frames.
- `variables`: each referenced variable once, with collection, mode names,
  the raw value per mode and the alias-resolved value per mode. This is the
  part the MCP cannot give: `get_variable_defs` returns defaults, and the
  breakpoint and theme modes are where the Homepage evals found drift.
- `instances`: nested component instances with their main component and set,
  so composition comes from the file rather than from a guess.
- `provenance`: extractor version, timestamp, sha256 of the canonical body.

The UI shows a badge per selected set (✓ has a contract, ○ new, or unknown
when the sync server is offline), lets the designer copy the JSON, and posts it
to the local sync server (`apps/s2a-toolkit/server/contract-sync-server.cjs`,
port 9410). The server maps the set name to a component slug through the
existing spec names, writes `packages/components/src/<slug>/<slug>.figma.evidence.json`
(or `packages/components/evidence/<slug>.figma.evidence.json` for sets with no
component yet), and answers "in sync" when the hash is unchanged so repeated
publishes cause no churn. The CI transport (workflow dispatch behind a relay)
reuses the same request body later.

### 2. Code evidence (step 2, built 2026-09-17)

`packages/components/scripts/code-evidence.mjs` (`npm run evidence:code
--slug=a,b`, `--all`, `--static-only`, `--dry-run`) writes
`<slug>.code.evidence.json` from two deterministic reads:

- **Static**, from the source: the exported render function's destructured
  props with default source and inferred type (plain-parameter renders such as
  `createButton(opts)` are read through `opts.x` and `const { x } = opts`),
  `data-*` attributes and classes in the template, ARIA roles and attributes,
  and from the stylesheet the selector surface (attribute values, states,
  container and media queries, classes), `--s2a-*` references with their
  fallback state, custom properties, raw values on token-governed properties
  without a `Primitive:` note, plus sha256 of every source file.
- **Runtime**, from the static Storybook build served locally (or
  `--storybook-url`): every story mapped through the spec's `storybookId`
  renders in Playwright, recording its args, the rendered root, every observed
  `data-*` value (flagged `onRoot` when it sits on the component's own root
  rather than a nested component), classes, roles, and interactive elements
  with their accessible names.

Attributes carry their sources (`template`, `stylesheet`, `runtime`), so the
gate can tell a variant the stylesheet styles but no story exercises from one
the template never sets. First run on the slice plus Button:

| Component | props | attrs | parts | token refs (no fallback) | raw | stories |
| --- | --- | --- | --- | --- | --- | --- |
| quote-card | 12 | 4 | 13 | 20 (0) | 1 | 7 |
| social-proof-carousel | 2 | 7 | 8 | 2 (0) | 2 | 3 |
| button | 9 | 6 | 5 | 64 (39) | 0 | 10 |

Button's 39 references without a fallback are the same button color family
the Homepage token eval found unshipped: the first thing check 3 will fail on.
Tests: `npm run evidence:code:test`.

### 3. Curation as data (step 3, built 2026-09-17)

`<slug>.defs.json` holds what no extractor can decide, validated by
`packages/components/defs.schema.json` (`s2a-defs/1`):

- `anchors`: the Figma node of record (component set or, when the design has
  none, the pattern frame), whether it is deprecated and what succeeds it, the
  frames that use it; the code import, export, controller and root class.
- `props`: every extracted prop with `lever` (a design decision an author
  makes, or an integration detail), its Figma binding as a real kind and
  property (`VARIANT`, `TEXT`, `LAYER`, `INSTANCE`, …) or an explicit `NONE`,
  and its code prop or attribute.
- `states`: design axes that are runtime behavior in code (Breakpoint,
  Context, slide state), with the mechanism named.
- `anatomy`: parts by selector and Figma layer, per-part token bindings as
  `{s2a.path}` references (Figma variable names with slashes as dots) or
  `raw:` values, and slots with `accepts` and `acceptsMode`.
- `decisions`: the questions extraction cannot answer, each `open` or
  `decided` with owner and evidence. Sets without a contract get their draft
  from the plugin's proposal; here they are written by hand for the slice.

`npm run defs:validate` is the first slice of the gate: schema conformance,
code conformance (every curated prop exists in the code evidence and every
extracted prop is curated), anatomy selectors present in the template,
stylesheet or rendered stories, slot `accepts` naming real specs, and every
token reference resolving in the shipped token CSS. Each check was tripped on
purpose with a broken copy of the QuoteCard defs before the fixture was removed.

Slice status: QuoteCard (12 props, 8 levers, 3 open decisions: the v2 set of
record, the 48px container-scoped type step, the unshipped Button knockout
tokens) and SocialProofCarousel (2 props, 1 lever, 2 open decisions: which
arrow component the frame means, and the untokenized pagination dots). Both
anchor to the deprecated `.QuoteCard` (9334:3814) because that is what the
Homepage frames still instance; the anchors carry `deprecated: true` and an
empty `successorNodeId` rather than a guess.

### 4. Spec transform (step 4, built 2026-09-17)

`packages/specs/build.mjs` (`npm run specs:build`, `--slug=`, `--all`;
`npm run specs:check` for freshness) is the Spec Dictionary: one dependency-free
folder, one IR, formats hanging off it.

```
defs.json + code.evidence.json + figma.evidence.json? + dist tokens
   └─ lib/ir.mjs        canonical IR: merged props with bindings, variants from
                        Figma axes (else the code enum), states, anatomy with
                        every {s2a.…} resolved (cssVar, shipped, light/dark/sm
                        values), composition from slots, provenance hashes
        ├─ formats/spec-json.mjs   <slug>.spec.json   the contract (gated)
        ├─ formats/markdown.mjs    <slug>.spec.md     the readable page
        ├─ formats/stories.mjs     out/<slug>/stories.manifest.json
        └─ formats/figma-plan.mjs  out/<slug>/figma.plan.json
```

Rules the transform enforces: a missing `figma.evidence.json` leaves
design-side fields null (`verified: null`, no set key), never invented; a
Figma VARIANT axis in evidence wins over the code enum for option lists; token
references that do not exist in the shipped CSS are flagged `shipped: false`,
not resolved; outputs carry no timestamps, so freshness is byte equality and
`--check` names the file that differs. The MCP zod schema
(`apps/s2a-ds-mcp/src/spec-schema.ts`) gained the additive fields (`$generated`,
`lever`, `bindings`, `states`, `anatomy`, `decisions`, `provenance`), so
generated and hand-written specs both load.

The two slice specs are now generated. Against the hand-written versions:
name, slug, class, story id, variants, composition and a11y are identical;
props keep their names, types and source-text defaults; descriptions come from
the defs; `figmaNodeId` is now set from the anchor; `tokenBindings` grew from 4
to 21 entries (QuoteCard) because every part's bindings are recorded, not a
sample. The stories manifest derives one story per lever value and reports
`deferred` (implied, no story) and `extra` (stories the contract does not
imply); the Figma plan lists the properties, layer bindings as variable names,
and text styles `/json-to-figma` should apply. Tests: `npm run specs:test`.

Schema deltas, all additive to `spec-schema.ts`:

```jsonc
"anatomy": { "root": { "tokens": { "background-color": "{s2a.color.surface.subtle}" },
             "parts": { "label": { "tokens": {...}, "slot": { "accepts": [...], "acceptsMode": "prefer" } } } } },
"bindings": { "figma": { "anchors": { "fileKey": "…", "componentSetKey": "…", "nodeId": "…" } },
              "code":  { "anchors": { "importPath": "@s2a/components", "export": "QuoteCard" } } },
"props[].bindings": { "figma": { "kind": "VARIANT", "property": "State" } | "NONE", "code": { "attr": "data-state" } },
"provenance": { "figma": "sha256:…", "code": "sha256:…", "defs": "sha256:…", "generatedBy": "spec-transform@x" }
```

### 5. One gate (step 5, built 2026-09-17)

`npm run gate` (`evals/gate.mjs`) runs every check class in order, emits
stable codes, writes `evals/gate/out/gate.json`, and exits red on any FAIL.
`npm run gate:full` adds the build and the page evals. CI
(`.github/workflows/authoring-checks.yml`) runs the static gate before the
authoring tests and the page evals after them, and uploads every report.

| Class | Codes | Rule |
| --- | --- | --- |
| SCHEMA | `SCHEMA_INVALID`, `TRIPWIRE_FAILED` | every spec validates against the MCP zod schema; `packages/specs/fixtures/tripwire.spec.json` (a frozen hand-written spec) must validate, or the tooling drifted |
| SCHEMA_LOCK | `SCHEMA_LOCK_DRIFT`, `SCHEMA_LOCK_MISSING` | `spec-schema.ts` and `defs.schema.json` hash-match `packages/specs/schema.lock.json`; a schema change is deliberate: review, run the gate, `npm run gate:lock` |
| DEFS | `DEFS_FAILED` | `validate-defs` (schema, code conformance both ways, anatomy, composition, tokens) |
| COMPOSITION | `COMPOSITION_UNKNOWN` | every `composedOf` and slot `accepts` names a spec that exists |
| TOKENS | `TOKEN_UNSHIPPED` (fail), `TOKEN_UNSHIPPED_LEGACY` (warn), `TOKENS_NOT_BUILT` | bindings in generated specs must ship; hand-written specs warn until they are curated |
| FIGMA | `FIGMA_BINDING_UNVERIFIED` (fail), `FIGMA_EVIDENCE_MISSING` (warn) | with plugin evidence, every VARIANT/BOOLEAN/TEXT/INSTANCE_SWAP binding must be a property of the anchored set |
| FRESH | `SPEC_STALE`, `CODE_EVIDENCE_STALE`, `CODE_EVIDENCE_MISSING` | generated outputs equal a fresh build; the sources hashed in the code evidence are unchanged |
| EVALS (full) | `EVAL_<NAME>_FAILED` | tokens, motion, visual, a11y, perf |

First run: GREEN with 71 warnings. The first static run was red for two
reasons the gate was right about: two hand-written specs carried prose inside
`composedOf` (moved to their descriptions, references made real slugs), and
the code evidence had hashed `spec.json` as a source, which is circular now
that the spec is generated (dropped). The 69 `TOKEN_UNSHIPPED_LEGACY`
warnings across 15 hand-written specs are the crosswalk backlog: 50 are
`--s2a-color-*` names (button, icon-button, promo-cta, router families), the
rest are typography paths written in Figma form. Each check was tripped on
purpose (schema lock, tripwire, stale evidence, hand-edited spec) and fired
with the file named.

### 6. Publish transport (step 6, built 2026-09-17)

One pipeline, two transports. The plugin's Publish posts the same body to a
per-user **sync endpoint** (Contract section → Sync endpoint; stored in
`clientStorage`, never in the document): `http://localhost:9410` in
development, the relay when published. The shipped build and the dev build
are the same build.

```
plugin Publish ──▶ relay (apps/s2a-contract-relay, Worker or local.mjs)
                     ├─ hash == committed contracts.index.json hash → in-sync, nothing written
                     └─ branch contract/<slug>/<hash8> from main
                        commit packages/components/evidence/inbox/<slug>.figma.evidence.json
                        dispatch .github/workflows/contract-sync.yml on that branch
                            └─ contract-sync-apply.cjs: place evidence, refresh code
                               evidence (static), rebuild the spec, run the gate
                                 ├─ green → commit, push, open/refresh the PR (summary as body)
                                 └─ red   → commit nothing; summary + inbox left on the branch
```

- `apps/s2a-contract-relay/src/relay.mjs` is the ~100-line relay that holds
  the repository token (fine-grained PAT: contents, actions, pull requests on
  this repo; optional `RELAY_KEY` header check). `worker.mjs` is the
  Cloudflare entry, `local.mjs` the Node one (port 9420). Its hash is the
  sync server's hash (tested equal).
- `packages/specs/out/contracts.index.json` is written by every `specs:build`
  and checked for freshness: every component's spec, defs, generated flag and
  evidence hashes. The relay serves it as `GET /contracts` so the plugin badge
  works against CI, and reads it to answer in-sync without a checkout.
- `apps/s2a-toolkit/server/contract-sync-apply.cjs` (`npm run contract:apply`)
  is the pipeline body the workflow runs; the local server exposes the same
  placement logic. For a set with no `defs.json` the summary carries the draft
  proposal (`contract-proposal.cjs`): suggested props from the axes, the
  anatomy from the default variant, then exactly the questions extraction
  cannot answer, as a checklist. The PR is the curation request.
- Verified locally: relay tests (branch, commit, dispatch, in-sync, auth) with
  the GitHub API mocked; the apply pipeline run through the inbox with a
  fixture set ("Logo Wall", no component). The first run went red: placing
  evidence for a new set changes `contracts.index.json`, and the gate's
  freshness check caught that the index had not been rebuilt. The apply step
  now rebuilds the index after every placement (`specs:build --index-only`);
  the rerun was green, the proposal rendered, and the fixture was removed.
  Not yet exercised: the workflow on GitHub and the deployed Worker, which
  need a push and `wrangler deploy`.

### First real extraction (2026-09-17)

Matt ran Extract and Publish on `.QuoteCard` from Figma Desktop. Two plugin
bugs surfaced only against the real environment and are fixed: the sync
server listened on IPv4 while the plugin fetches `localhost` (now both
loopbacks), and the panel hashed with `crypto.subtle`, which does not exist in
Figma's plugin iframe (now a pure-JS SHA-256, verified against Node). The
panel also posts a debug line per step to the sync endpoint (`POST /log`).

The evidence (2 variants, 70 nodes, 188 bindings, 44ms) corrected three
guesses in the defs: Show Attribution, Show CTA and Media are real component
properties (BOOLEAN, BOOLEAN, INSTANCE_SWAP), so those bindings are now
verified against the set; the quote and attribution texts are layers inside
nested Heading and Meta instances, not TEXT properties, so they stay `LAYER`
bindings with a v2 question attached; and the changelog names the successor,
`QuoteCard — v2` (13549:190801), now recorded as `successorNodeId`. It also
answered a carousel decision: the card's DotPagination binds spacing/xs,
radius/round, transparent/white/64 and content/knockout, so the carousel's raw
dot colors are now tokens. New open decisions from the same file: the quote
binds content/default while the attribution binds content/knockout, and
heading-2 resolves to 32px at sm where the page frame and code use 48.

### Candidates from frames (2026-09-17)

Extract now accepts any frame, section or group, for the case where a designer
is combing pages for component candidates rather than starting from a set:

1. **Frame evidence.** The same walk, plus a `pattern` block: sibling groups
   that share a structure signature (meaningful layer names at shallow depth
   and rounded size) are reported as one repeated unit with a count, the unit's
   layer tree, and the layers all members share; layers with Figma-generated
   names are counted as a hygiene signal; roles (heading, body, cta, media,
   icon, eyebrow, pagination, divider) are inferred from names and node types;
   S2A sets already instanced inside are listed.
2. **Structural match** (`contract-match.cjs`, `POST /match`). Candidate roles
   are compared with every contract's roles, derived from its anatomy, props
   and code parts (never from prose), by weighted Jaccard. The verdict is
   `extend`, `extend-or-new` or `new`, with what each closest contract would
   need; a repeated unit also ranks collection contracts as organism
   candidates and marks the ones whose slots accept the closest unit. The
   system's keyword `find_component_for_use_case` ranked Collapsible first for
   the feature tiles; the structural match ranks QuoteCard, ProductCard and
   MediaCard, which is at least the right neighbourhood.
3. **Proposal with decomposition.** For frames the draft proposal opens with
   the match table, then organism (the frame and its repeat count), molecule
   (the unit) and atoms (S2A instances inside, or "raw layers"), and derives
   suggested levers from the roles when the frame has no properties. Frames
   take a candidate name in the panel, which becomes the slug.
4. **Build set from contract** (`contract-build.ts`, `GET /plan/<slug>`). From
   `figma.plan.json`: variants from VARIANT axes, named layers from the
   anatomy with auto layout, variables bound by name with the literal
   overwritten from the resolved value, text styles applied by name, TEXT /
   BOOLEAN / INSTANCE_SWAP properties added and wired to the layers they
   drive, slots as dashed placeholders, all inside a "Contracts / <name>
   (generated)" section with variants laid out in a row. LAYER bindings that
   have no property yet are proposed as derived TEXT or BOOLEAN properties. It
   is a scaffold: art and slot contents stay with the designer, and the report
   lists variables and styles it could not find locally.

Exercised with fakes and the real contract index; the in-Figma run of Build
set is the next thing to try on `.QuoteCard`.

### Adoption checklist

1. `npx wrangler secret put GITHUB_TOKEN` and `npx wrangler deploy` in
   `apps/s2a-contract-relay` (optionally `RELAY_KEY`).
2. Commit `packages/specs/out/contracts.index.json` on main (the relay reads it).
3. In the plugin: Tools → Contract → Sync endpoint → the Worker URL (+ key).
4. Repository settings: make the authoring-checks gate a required check.
5. Extract `QuoteCard — v2` (13549:190801) and the Social Proof section so
   the successor and the carousel have evidence too; `.QuoteCard` is done.

## Honest limits

- Generation stays partly agent-driven. Scaffolding component sets from axes
  and code from props is deterministic; visual work is not. The gate and the
  evals are what make agent generation safe, so they are not optional.
- Extending the schema touches 36 specs. Additive fields only, with the
  transform back-filling anchors from evidence.
- The plugin cannot read a component set's usage across files; composition
  evidence is limited to what the set itself instances.

## Sequence

1. Design evidence in the toolkit plus the local sync server (done).
2. Code evidence extractor over the built package (done).
3. `defs.json` for the first slice: QuoteCard and SocialProofCarousel (done,
   drafts awaiting review).
4. Spec transform with the additive schema; regenerate the two specs (done).
5. `npm run gate` as one command and the CI step (done; making it a required
   branch check is a repository setting).
6. Relay plus workflow-dispatch publish; plugin badge reads the contract index
   (done; deploy and required-check are the adoption checklist).

## File map

```
apps/s2a-toolkit/src/contract-extract.ts       deterministic evidence walk (sandbox)
apps/s2a-toolkit/src/code.ts                   contract:extract handler
apps/s2a-toolkit/src/ui.ts / ui.html           Extract contract tool, badge, publish
apps/s2a-toolkit/server/contract-sync-server.cjs  POST /evidence, GET /contracts (port 9410)
apps/s2a-toolkit/test/contract-extract.test.ts fake-API test of the walk and hash
packages/components/src/<slug>/<slug>.figma.evidence.json   design evidence (generated)
packages/components/evidence/<slug>.figma.evidence.json     evidence for sets with no component yet
packages/components/scripts/code-evidence.mjs               code evidence extractor (+ .test.mjs)
packages/components/src/<slug>/<slug>.code.evidence.json    code evidence (generated)
packages/components/defs.schema.json                         defs schema (s2a-defs/1)
packages/components/scripts/validate-defs.mjs                curation checks (schema, code conformance, anatomy, composition, tokens)
packages/components/src/<slug>/<slug>.defs.json             curation (written by people, reviewed in PRs)
packages/specs/build.mjs (+ lib/, build.test.mjs)          spec transform: IR + formats, freshness check
packages/specs/out/<slug>/                                   stories.manifest.json, figma.plan.json (generated)
packages/components/src/<slug>/<slug>.spec.md               generated spec page
evals/gate.mjs                                               the gate (npm run gate | gate:full | gate:lock)
apps/s2a-contract-relay/                                     relay: src/relay.mjs, src/worker.mjs, local.mjs, test/
apps/s2a-toolkit/server/contract-sync-apply.cjs              pipeline body (npm run contract:apply)
apps/s2a-toolkit/server/contract-proposal.cjs                draft proposal (+ decomposition for frames)
apps/s2a-toolkit/server/contract-match.cjs                   structural match: roles, verdict, organism candidates
apps/s2a-toolkit/src/contract-build.ts                       Build set from figma.plan.json (sandbox)
.github/workflows/contract-sync.yml                          dispatched by the relay; commits + PR on green
packages/specs/out/contracts.index.json                      committed contract index (relay + plugin badge)
packages/specs/schema.lock.json, fixtures/tripwire.spec.json  schema lock and the frozen known-good spec
```
