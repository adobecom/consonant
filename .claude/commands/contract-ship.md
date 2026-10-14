# Contract Ship

Take a curated definition the rest of the way: validate it, build the artefacts, run the gate, and update the published coverage. One command for the four steps that always follow `<slug>.defs.json` being saved.

This is what the plugin means when it says *"regenerate and run the gate"*.

## Usage

```
/contract-ship <slug>
/contract-ship --all
```

Examples:
- `/contract-ship dot-pagination`
- `/contract-ship --all` — rebuild every contracted component

---

## What to run

Run these in order, from the repo root, and **stop at the first failure** — each step depends on the one before it.

### 1. Validate the definition

```bash
npm run defs:validate -- --slug={slug}
```

A failure here is the useful kind. The common ones:

- **`code prop "x" not in the extracted surface`** — the definition names a prop the component does not have. Either the component needs it or the definition is wrong; do not "fix" it by deleting the check.
- **`code prop "x" is not curated`** — the component has a prop the definition ignores. Add it with `lever: true` if an author sets it, `lever: false` if it is an integration detail.
- **`anatomy … has no matching class`** — the selector names a class the template and stylesheet do not define.
- **`→ … is not a shipped token`** — the token reference does not resolve in the built CSS.

If the code evidence is missing, regenerate it first — it takes a second and its absence is not a reason to skip the check:

```bash
npm run evidence:code -- --slug={slug}
```

**Stop and report** if validation fails. Show the problems verbatim; do not attempt to fix the definition without being asked.

### 2. Build the artefacts

```bash
npm run specs:build -- --slug={slug}
```

Writes, beside the component: `.contract.json` (the interop contract), `.catalog.json` (the light index entry), `.spec.json` (our working format — **this overwrites a hand-written spec**), `.spec.md`. And under `packages/spec-dictionary/out/{slug}/`: `figma.plan.json`, `stories.manifest.json`.

### 3. Run the gate

```bash
npm run gate
```

Eight classes: SCHEMA, SCHEMA_LOCK, DEFS, COMPOSITION, TOKENS, FIGMA, FRESH, EVALS. Any **fail** blocks; warnings do not.

Two warnings worth reading out rather than skipping past:

- **`COMPOSITION_UNDECLARED`** — the design file shows this component is built from something the contract never mentions. Either declare it as a slot, or record in a decision why it is internal.
- **`TOKEN_UNSHIPPED_LEGACY`** — a token bound in a hand-written spec that does not exist in the built CSS.

### 4. Update the published coverage

```bash
node packages/s2a-specs/pack.mjs
```

Reassembles `@adobecom/s2a-specs`, so `index.json`'s `contracted` count reflects the new contract.

---

### 5. Render the implementations, and check them against the design

```bash
npm run specs:render -- --slug={slug}
```

Writes the Lit component + stories into `apps/storybook/stories/generated/` and the
Milo block into `packages/milo-blocks/{slug}/`.

If the set has a **State axis**, the stories file also gets a `State matrix` story —
every variant on one grid, each state forced with `data-state` rather than pointed
at. That is the surface the design comparison runs on, so give it a golden and score
it:

```bash
npm run goldens:sheet -- --slug={slug}       # one request, one committed PNG
npm run eval:visual:matrix -- --slug={slug}  # per-cell score + difference codes
```

`goldens:sheet` is the only step that needs `FIGMA_ACCESS_TOKEN` (it is in `.env`).
The sheet is committed, so everything downstream — Storybook's Design overlay, the
diff, a fresh clone, CI — needs no token. Re-shoot it whenever the Figma component
changes, or the following diff will blame the code for a design edit.

Read the output as a grid. A single bad cell is one variant; a whole column failing
is one missing rule. Watch for the line that flags a state which is consistently
worse than the others **without** failing — a thin detail like a focus ring is only
a few percent of a cell's area, so it hides under a threshold.

The difference codes say which property to look at:

| code | region | likely cause |
|---|---|---|
| `VD01 PAINT_OUTSIDE_BOX` | outside the border box | missing `outline` / `box-shadow` (focus ring, shadow) |
| `VD02 EDGE_DELTA` | the border band | `border-width` / `border-color` / `border-radius` |
| `VD03 FILL_DELTA` | the interior | `background-color` token resolving wrong |
| `VD04 TEXT_DELTA` | the text | `color` or type metrics — often just rasterisation noise |

A difference is **not** automatically a code bug. Decide which side is wrong before
fixing: if the design is wrong, fix Figma, bump its `s2a:meta` version, re-shoot the
sheet. If the code is wrong, change the **defs** — never the contract and never the
generated CSS, both of which are overwritten on the following build.

Skip this step for a component whose set has no State axis; `spec.md` will say so.

## Report back

A short summary, in this shape:

```
dot-pagination
  validate   PASS  4 props (3 levers) · 1 open decision
  build      4 props · 2 parts · 5 token bindings · figma evidence yes
  gate       GREEN  0 failures, 51 warnings
  coverage   5 of 37 contracted
  render     lit + milo, 5 files - State matrix 6x5
  matrix     30/30 cells within 8% - VD01 focus ring missing in 6/6 rows
```

Then, if there are any, the composition warnings for this slug and what they imply.

Do **not** commit. Say what changed and let the person decide.

---

## When it fails

Report the failure verbatim and stop. The whole point of these checks is that they catch a contract describing something the code does not do — working around one produces a contract a consumer cannot trust, which is worse than no contract.

If the definition needs changing, say what you would change and why, and wait.
