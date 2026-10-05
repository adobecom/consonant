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

## Report back

A short summary, in this shape:

```
dot-pagination
  validate   PASS  4 props (3 levers) · 1 open decision
  build      4 props · 2 parts · 5 token bindings · figma evidence yes
  gate       GREEN  0 failures, 51 warnings
  coverage   5 of 37 contracted
```

Then, if there are any, the composition warnings for this slug and what they imply.

Do **not** commit. Say what changed and let the person decide.

---

## When it fails

Report the failure verbatim and stop. The whole point of these checks is that they catch a contract describing something the code does not do — working around one produces a contract a consumer cannot trust, which is worse than no contract.

If the definition needs changing, say what you would change and why, and wait.
