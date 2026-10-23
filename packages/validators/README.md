# `@adobecom/s2a-validators`

**One authoritative home** for S2A token/spec and responsive CSS validation — the same logic the
`s2a-ds` MCP, CI, and the eval scorers should all call. One definition of "what's
a violation," everywhere. (See `docs/evals/eval-discipline.md`.)

## Figma and Milo: errors, warnings, and CI

The shared runner produces the same JSON schema and Markdown report for either
source, with severity, stable rule code, scope, and CSS location or Figma link.

| Source   | Errors                                                                                                          | Review warnings                                                                                                           |
| -------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Figma    | Direct primitive bindings, unbound UI paints, missing local mode values, incompatible alias types, self aliases | Raw spacing/radii, artwork colors, missing descriptions, missing exports, unresolved bindings/styles, incomplete metadata |
| Milo CSS | Existing breakpoint violations, literal hex/color functions, undocumented primitive references                  | Raw pixel dimensions, unknown runtime tokens, documented primitive exceptions                                             |

Errors fail CI by default. Add `--fail-on warning` to fail on either level.
`--audit` retains the failing gate in JSON but returns success after a
completed inventory. Input errors and malformed CSS always return **2**;
findings failing the gate return **1**; passing checks return **0**.
JSON `ok` means no errors; `gate.passed` applies the selected threshold.
Counts describe findings, not unique defects or demonstrated user impact.

Run from the repository root; these Nx tasks build the token registry first:

```bash
# All C2 Milo blocks, inventory mode, JSON + Markdown in .tmp/validators/.
npx nx run validators:audit-c2

# One block, with errors failing the process.
npx nx run validators:audit-library -- --source milo --milo context/milo --layer c2 --block elastic-carousel --json .tmp/validators/elastic-carousel-library.json --markdown .tmp/validators/elastic-carousel-library.md

# Both classic and C2 directories.
npx nx run validators:audit-library -- --source milo --milo context/milo --layer all --audit

# Full CPro Figma file. Set FIGMA_ACCESS_TOKEN in the environment or root .env.
npx nx run validators:check-figma -- --figma-url qAF4nlt6O4ThbeXeO7jzdb --json .tmp/validators/figma.json --markdown .tmp/validators/figma.md --write-snapshot .tmp/validators/figma.snapshot.json

# Selected component set; add --include-docs to inspect documentation too.
npx nx run validators:check-figma -- --figma-url 'https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb?node-id=11280-224039'

# Repeat captured validation at build time, without network or credentials.
npx nx run validators:check-figma -- --snapshot .tmp/validators/figma.snapshot.json --fail-on warning
```

After building, use `s2a-validate-library` with the same arguments and
`--ds-root /path/to/token-repo`. The exported `auditMilo` and `validateFigma`
functions return `LibraryReport`; `libraryGate` applies the threshold and
`libraryMarkdown` renders it. The old media-only CLI and baseline remain
unchanged. `validators:audit-milo` still inventories classic `libs/blocks`
media queries; use `audit-c2` or `audit-library` for combined checks.

### Figma capture and coverage

A node URL scopes validation to that subtree. A file key audits components
across the file; `--include-docs` also checks documentation visual properties.
Selected frame/page roots include all descendants. Component-set canvas
decoration is excluded. No Figma content is modified.

Snapshots (`s2a-figma-snapshot/1`) preserve capture time, file key/version when
available, exact roots, variable coverage, and available style definitions.
A replay describes that captured state, not a fresh Figma check.
`scripts/figma-snapshot.plugin.js` provides read-only connected-app capture:
supply `AUDIT_FILE_KEY` and `AUDIT_ROOT_IDS`, with roots on one page per call.
It includes referenced variables, alias targets, and styles. Transfer large
connector responses in chunks; never truncate or label a sample a full audit.

Live REST capture requires `file_content:read` and qualifying
`file_variables:read` access. See Figma's
[variables endpoint](https://developers.figma.com/docs/rest-api/variables-endpoints/)
and [API scopes](https://developers.figma.com/docs/rest-api/scopes/).
Missing access fails capture. `--allow-missing-variables` explicitly permits
partial capture with coverage warnings. Missing remote alias targets remain
warnings because absent metadata alone does not prove a broken link.
REST style summaries do not include full definitions; those gaps also warn.

WEB code syntax or canonical S2A names map variables to the built CSS index.
Explicit primitive collections also identify primitives.
`hiddenFromPublishing` never determines primitive status.
Semantic-to-primitive aliases are valid; direct UI bindings to primitives fail.
Frame widths are not interpreted as CSS breakpoints. These checks do not prove
responsive behavior, accessibility, every text-run override, or visual parity.

### CI and builds

The **Design system validators** workflow runs package tests on PRs.
Its manual Milo audit supports `c2` (default), `classic`, or `all` and uses
combined token + responsive validation. Its separate live Figma job accepts
`figma_file` and `figma_fail_on`, and requires the repository secret
`FIGMA_ACCESS_TOKEN`. Reports attach even when a gate fails.

Use `validators:check-figma -- --snapshot path/to/reviewed.snapshot.json` as a
consuming build prerequisite for repeatable checks, or `--figma-url` for fresh
validation. Existing Storybook/component builds retain their media regression
gate; they do not automatically acquire a live Figma network dependency.
No Figma baseline or automatic suppression is introduced.

For Milo, `--strict-tokens` promotes dimension reviews to errors;
`--config` accepts the existing media policy and exact reflow exceptions.
CSS checks inspect declarations, excluding comments, selectors, strings and
URLs. Named colors, non-pixel dimensions, JS, HTML, and computed styles remain
outside this pass.

## Use

```ts
import {
  loadTokenIndex,
  validateCss,
  validateSpec,
} from "@adobecom/s2a-validators";

const index = loadTokenIndex(repoRoot); // built once from the shipped token CSS
const { ok, score, violations } = validateCss(css, index);
```

CLI (for CI):

```bash
npm run validate:css -- packages/components/src/button/button.css
# or, once built:  s2a-validate-css [--strict] <file.css ...>
```

Demo (no deps beyond tsx): `npx tsx packages/validators/demo.ts`

## Media queries: Will's block rules

The package exports `validateMediaQueries` for evals and individual CSS strings,
and `auditMediaQueries` for component trees or a Milo checkout. The
`s2a-validate-media` executable is included when this package is built/packed.

| Size | Width condition                     |
| ---- | ----------------------------------- |
| SM   | Mobile styles in the unqueried base |
| MD   | `@media (width >= 768px)`           |
| LG   | `@media (width >= 1280px)`          |
| XL   | `@media (width >= 1441px)`          |

Policy `will-block-css-v1` records William Blanton's supplied rules. Equivalent
`min-width` and reversed range syntax are accepted. Values are never rounded:
`1440px` differs from `1441px`, and `width > 767px` differs from `width >= 768px`
at fractional viewport widths. See [CSS Media Queries Level 4](https://www.w3.org/TR/mediaqueries-4/#mq-range-context).

Run from the repository root:

```bash
# Build and test the reusable package.
npx nx run validators:build
npx nx run validators:test

# Regression gate: components, grid, and generated Milo blocks.
npx nx run validators:check-media

# Inventory the local Milo submodule; reports all debt without failing on it.
npx nx run validators:audit-milo

# Any checkout, with an optional block filter. Omit --audit for a strict gate.
npx nx run validators:audit-media -- --milo /path/to/milo --block modal --audit --json /tmp/modal.json --markdown /tmp/modal.md

# Strict validation of arbitrary CSS (repeat --root or --block as needed).
npx nx run validators:audit-media -- --root path/to/blocks
```

After building, another repository can run `s2a-validate-media --milo .` through
the installed package. This change does not publish a new package version.

```ts
import {
  validateMediaQueries,
  auditMediaQueries,
} from "@adobecom/s2a-validators";

const evaluation = validateMediaQueries(css, { file: "carousel/carousel.css" });
// evaluation.ok, queries[].classification, violations[].code/line/column/message
const inventory = auditMediaQueries({
  roots: ["libs/blocks"],
  blocks: ["modal"],
});
// inventory.summary, rows (William's table), files (full evidence)
```

### Reflow exceptions

Nonstandard queries are findings until their layout reason is documented.
A threshold in the inclusive **840–960px** portrait band, or a bounded range
using standard thresholds, may carry an adjacent comment:

```css
/* s2a-reflow: Keep carousel controls beside cards in tablet landscape. */
@media (width >= 900px) {
  .carousel {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

The comment must immediately precede the media rule or be its first child.
There must be an actual layout declaration; a color-only override cannot qualify.
For other bespoke thresholds, pass `--config path/to/media-policy.json` with an
exact file/query exception and a specific reason:

```json
{
  "exceptions": [
    {
      "file": "elastic-carousel/elastic-carousel.css",
      "query": "(768px <= width < 1700px)",
      "kind": "reflow",
      "reason": "Keep complete cards visible beside the navigation controls before the four-card layout fits."
    }
  ]
}
```

Paths are relative to a single scan root. With multiple roots, reports prefix
each path with that root's final two segments (for example
`components/src/card/card.css`); use the exact reported path in exceptions.
No glob or whole-file suppressions are supported. A custom `policy` object can
replace the defaults explicitly; its ID, breakpoint values, and portrait band
are included in every JSON report and baseline.

Reduced motion, hover, color scheme, orientation-only, height-only, and print
queries are inventoried as environment conditions. Width conditions combined
with orientation still have to satisfy the width policy. Relative units,
calculated widths, unsupported width logic, and contradictory ranges fail for
review; the validator never guesses their equivalence.

This is static CSS validation. It inventories `.css` files, including nested
rules and comma-separated query branches. It does not scan JavaScript
`matchMedia`, HTML style blocks, or prove a reflow works visually. The reason and
layout-property check make exceptions reviewable; responsive browser testing is
still needed before approving a block's behavior.

### CI, builds, and existing debt

`components:build` and `storybook:build` depend on `validators:check-media`.
The GitHub **Design system validators** workflow runs the same gate, package
tests/build, and the Storybook token checks. Manual workflow dispatch can also
check `adobecom/milo` at a chosen ref, in `audit` or `strict` mode. It reads Milo
without modifying its source. Reports appear in job artifacts and the summary.

The repository gate uses `baselines/blocks.json`: an inventory of existing debt,
**not approved reflow exceptions or a claim of compliance**. It fails new or
increased findings by file, normalized query, and rule code. Moving a rule to a
different line does not invalidate the baseline. Resolved findings are reported
so the baseline can be reduced after review. Milo has no blanket baseline by
default. To establish one explicitly in another repository:

```bash
npx nx run validators:audit-media -- --milo /path/to/milo --audit --write-baseline /tmp/milo-baseline.json
# Review and commit the baseline in the consuming repository, then gate with:
npx nx run validators:audit-media -- --milo /path/to/milo --baseline /path/to/reviewed-baseline.json
```

CI cannot write its own baseline. Policy changes require explicit baseline
review. Malformed CSS cannot be baselined. Missing roots, empty CSS scopes, and
unknown block selections fail instead of producing a misleading green result.

Exit codes: **0** pass (or completed inventory with `--audit`), **1** responsive
policy/regression failure, **2** invalid configuration/input or malformed CSS.
Even with `--audit`, JSON `ok` remains false when there are violations. Default
repository reports are `.tmp/validators/{blocks,milo}.{json,md}`.

| Rule code                                          | Meaning                                              |
| -------------------------------------------------- | ---------------------------------------------------- |
| `MQ_NONSTANDARD_BREAKPOINT`                        | Threshold outside the three standards                |
| `MQ_MOBILE_FIRST`                                  | Upper/bounded query needs a justified reflow         |
| `MQ_BOUNDARY_OPERATOR`                             | Inclusive/exclusive boundary changes behavior        |
| `MQ_REFLOW_REASON_REQUIRED`                        | Range lacks a reflow explanation                     |
| `MQ_EXCEPTION_REASON`                              | Exception reason is missing detail                   |
| `MQ_EXCEPTION_NOT_REFLOW`                          | Exception contains no recognized layout change       |
| `MQ_EXCEPTION_REVIEW`                              | Bespoke threshold needs an exact configuration entry |
| `MQ_UNSUPPORTED_UNIT` / `MQ_UNSUPPORTED_CONDITION` | Cannot safely compare with the policy                |
| `CSS_PARSE_ERROR`                                  | Invalid CSS; always an input failure                 |

## Leadership report

Generate the two-page Elastic Carousel brief, its self-contained HTML version,
and the supporting audit JSON:

```bash
npx nx run validators:report-elastic-carousel
```

Outputs are in `.tmp/validators/elastic-carousel-leadership/`. The report embeds
the repository's semantic tokens and local Adobe Clean fonts for internal sharing.
It includes an executive summary, proposed owners, a breakpoint coverage chart,
and links to source lines at the exact audited Milo commit. It distinguishes
policy findings from demonstrated customer impact.

The generator reruns the audit and refuses stale editorial counts or changed
finding queries. The reviewed narrative lives in `reports/elastic-carousel.json`.
Playwright checks page fit, embedded fonts, two-page PDF output, and mobile HTML
overflow. The HTML also supports printing directly from a browser.

### Rich Content / Jump Links review

Generate the four-page leadership PDF and self-contained HTML:

```bash
npx nx run validators:report-rich-content
```

The brief covers the six saved instances in the October 13 Figma stress test,
the documented container/spacing/indent/scrim decisions, and a fresh combined
token + responsive audit of Milo's complete Rich Content CSS block. It separates
confirmed saved-state observations from behavior that still needs reproduction.
The proposed variant-switch and browser checks are not represented as implemented.

The profile in `reports/rich-content.json` requires the captured
`.tmp/validators/rich-content-page-inspection.json` and four PNG screenshots in
`.tmp/validators/rich-content-leadership/assets/`, named by node ID with a dash.
Capture those from the connected Figma file before regenerating in a new checkout.
These local evidence files are intentionally outside the published package.

Outputs include `rich-content-leadership.pdf`, standalone HTML, complete
`audit.json`/`audit.md`, captured Figma inspection, source and screenshot hashes,
and verification results in `.tmp/validators/rich-content-leadership/`.
The generator rejects changed Milo revisions, source edits, unexpected finding
counts, or inconsistent image-override evidence. Playwright verifies four Letter
pages, loaded fonts/images, page fit, and mobile HTML overflow.

### Rich Content browser evidence and FigJam audit

```bash
npx nx run validators:capture-rich-content
# Optional: fail on differences from the captured C2 examples.
npx nx run validators:capture-rich-content -- --fail-on-parity
```

The capture loads Milo's shared C2 CSS, section metadata CSS, and Rich Content
CSS/JavaScript unchanged from the checked-in revision. It uses an explicit local
authored fixture (`rich-content jump-link hero indent container fixed`), the same
heading and link content as the C2 examples, local Adobe fonts, and a background
layer exported from Figma. It does not represent an unidentified production page.

Inputs are `.tmp/validators/rich-content-figjam/figma-inspection.json` and
`background.png`, captured through the connected Figma file. The inspection must
include the four instances and their container geometry. These evidence inputs
are local and are not included in the published package.

Outputs in that directory include original browser PNGs at 12 widths, 45 resize
frames, a WebM recording, `browser-evidence.json`, `geometry-eval.json`, and the
full CSS audit. Source hashes and the Milo commit identify the exact code tested.
The unwrapped probe separately checks what happens without the container context.

The geometry eval compares height, content left edge, heading width, and top and
bottom padding at four matched widths, with a 0.5px tolerance. It reports captured
sample differences by default. `--fail-on-parity` returns exit 1 on a difference;
these sample expectations are not a signed universal grid contract. This new
browser target is not yet wired into CI. The existing CSS gate remains separate.

The [first FigJam audit](https://www.figma.com/board/YfKMCRYvZhPbK87aQKE9Qg/Agentic-S2A?node-id=2076-4209)
contains the C2/Milo comparisons, recording poster, measured breakpoint chart,
editable source snippets, validator coverage, limitations, and review decisions.
The full-resolution WebM and animated GIF remain in the local evidence bundle.
The connected FigJam asset uploader does not accept video; the uploaded GIF
rendered blank in the board preview, so a still poster is used on the canvas.

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

| Code                              | Severity               | Meaning                                       |
| --------------------------------- | ---------------------- | --------------------------------------------- |
| `HARDCODED_HEX` / `HARDCODED_RGB` | hard (fails)           | Raw color — use a semantic color token        |
| `PRIMITIVE_TOKEN`                 | hard (fails)           | A design-only primitive used in component CSS |
| `HARDCODED_PX`                    | hard (`--strict` only) | Raw px — likely a spacing/radius token        |
| `UNKNOWN_TOKEN`                   | **warning**            | `var()` the shipped registry doesn't know     |

`UNKNOWN_TOKEN` remains a **warning** in the existing CSS API for compatibility.
It identifies a reference absent from the built registry and the file's local
definitions; inspect the reference and token export before accepting it. The
Storybook token gate separately treats new unknown references as failures.

## Wiring it up (the "shared" in shared lib)

- **CI** — the `cli` is a ready consumer.
- **Evals** — `evals/scorers/token-compliance.ts` should import `validateCss`
  instead of its naming heuristic.
- **MCP** — `s2a-ds`'s `validate_css` should delegate here so the tool and the
  evals never diverge.

The last two are follow-ups (the MCP change touches the published bundle; the eval
scorer lives on a separate branch). This package is the destination both migrate to.
