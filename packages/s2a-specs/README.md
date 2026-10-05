# @adobecom/s2a-specs

S2A's component contracts, as an installable package. What each component is —
props, variants, states, token bindings, accessibility, and what it composes with —
in a form a build can read.

This is the component-level counterpart to `@adobecom/s2a-tokens`. A consumer takes
both and builds its own implementation: the tokens say what the values are, the
contracts say what the components are. **Neither one asks you to adopt our code.**

```bash
npm install @adobecom/s2a-specs
```

```js
import { getContract, getCatalog, listContracts, index, schema } from "@adobecom/s2a-specs";

listContracts();                 // ["action-card", "button", "dot-pagination", …]
getContract("dot-pagination");   // the full contract
getCatalog("dot-pagination");    // the light entry, for pickers and agent context
index.counts;                    // { described: 37, contracted: 5 }
```

Or read the JSON directly, without the loader:

```js
import button from "@adobecom/s2a-specs/contracts/button.json" with { type: "json" };
```

## What ships

```
dist/contracts/<slug>.json    the interop contract, validating against contract.schema.json
dist/catalog/<slug>.json      the light index entry — cheap to fetch, cheap to parse
dist/index.json               every component, and whether it has a contract yet
dist/contract.schema.json     the schema the contracts conform to
dist/index.mjs                the loader above
```

**Build tooling is deliberately not shipped.** No transform, no scaffolder, no adapters.
A consumer reads contracts; it does not regenerate them. If you want to see how they are
produced, that is `packages/spec-dictionary` in this repo.

## Coverage is published on purpose

`index.json` carries `described` and `contracted` counts plus a per-component flag.
37 components are described; fewer have a contract. You can see what is covered instead
of discovering a gap through a missing file:

```js
index.described.filter((c) => !c.contracted);   // not contracted yet
```

The number moves as components are converted. Treat a missing contract as "not yet",
not as "this component does not exist".

## Where the contracts come from

They are generated, never hand-written, from three inputs that live beside each component
in `packages/components/src/<slug>/`:

```
<slug>.defs.json             human judgment, stored as data
<slug>.code.evidence.json    what the code actually exposes
<slug>.figma.evidence.json   what the design file actually contains
```

`packages/spec-dictionary` transforms those into the contract. `pack.mjs` here gathers the
results into `dist/` on `prepack`, so the files stay colocated with the component they
describe while publishing as one flat, implementation-free package.

Figma is the visual source of truth; the renderer decides how code comes out; `defs.json`
is where a human arbitrates between them when they disagree. See
`packages/spec-dictionary/README.md` for the full picture.

## Releasing

Bump `version` here and merge to `main`. `.github/workflows/publish-specs.yml` picks it up,
runs `pack.mjs`, and publishes to GitHub Packages behind an environment reviewer. A version
already on the registry is skipped rather than failing the run.
