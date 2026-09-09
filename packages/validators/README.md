# `@adobecom/s2a-validators`

**One authoritative home** for S2A token/spec validation — the same logic the
`s2a-ds` MCP, CI, and the eval scorers should all call. One definition of "what's
a violation," everywhere. (See `docs/evals/eval-discipline.md`.)

## Use

```ts
import { loadTokenIndex, validateCss, validateSpec } from "@adobecom/s2a-validators";

const index = loadTokenIndex(repoRoot);          // built once from the shipped token CSS
const { ok, score, violations } = validateCss(css, index);
```

CLI (for CI):

```bash
npm run validate:css -- packages/components/src/button/button.css
# or, once built:  s2a-validate-css [--strict] <file.css ...>
```

Demo (no deps beyond tsx): `npx tsx packages/validators/demo.ts`

## Why it's authoritative (and the JSON approach isn't)

The primitive/semantic split is read from the **built token CSS**, not the source
JSON:

- Anything **defined** in `tokens.primitives*.css` is a design-only primitive.
- Anything in `tokens.semantic*/responsive*.css` is a shippable semantic token.

We tried the obvious source-JSON signal — `figma.hiddenFromPublishing` — and it's
**wrong**: semantic tokens like `--s2a-spacing-md` carry that flag too, so it
over-reports. The built CSS separates the two cleanly by file.

`validateCss` also learns the custom properties a file **defines itself**
(component context aliases like `--s2a-color-button-background-solid-default`) so
those aren't mistaken for unknowns.

## Codes

| Code | Severity | Meaning |
|---|---|---|
| `HARDCODED_HEX` / `HARDCODED_RGB` | hard (fails) | Raw color — use a semantic color token |
| `PRIMITIVE_TOKEN` | hard (fails) | A design-only primitive used in component CSS |
| `HARDCODED_PX` | hard (`--strict` only) | Raw px — likely a spacing/radius token |
| `UNKNOWN_TOKEN` | **warning** | `var()` the shipped registry doesn't know |

`UNKNOWN_TOKEN` is intentionally a **warning**, not a failure: component tokens are
currently *filtered out of the shipped token CSS*, so a component may legitimately
reference `--s2a-color-<component>-*` vars that aren't in the global registry. It
informs; it doesn't gate. (Running this on the real `button.css` surfaces exactly
that — 28 such references — which is a genuine finding about the component-token
pipeline, worth fixing at the source.)

## Wiring it up (the "shared" in shared lib)

- **CI** — the `cli` is a ready consumer.
- **Evals** — `evals/scorers/token-compliance.ts` should import `validateCss`
  instead of its naming heuristic.
- **MCP** — `s2a-ds`'s `validate_css` should delegate here so the tool and the
  evals never diverge.

The last two are follow-ups (the MCP change touches the published bundle; the eval
scorer lives on a separate branch). This package is the destination both migrate to.
