# Claude Fable Handoff: S2A Studio and Homepage Polish

Prepared September 14, 2026. This is a continuation brief for the current working
tree, not a request to start a new implementation.

## The Ask

We have been building the foundation for a modern S2A authoring and delivery
system that could eventually serve the breadth of adobe.com. Milo is a pain
point for the authoring experience and limits the visual experiences we want to
deliver. The goal is a beautiful, intuitive editor and a sophisticated visual
language with motion, backed by reusable components and continuous evaluation.

Codex helped establish a working POC and a top-to-bottom Homepage. There is useful
engineering here, but the result still needs a thoughtful design and interaction
polish pass. Please inspect the actual experience and improve it in place.
Preserve the working foundation; do not treat the current appearance as finished
or the earlier implementation choices as beyond critique.

Prioritize the Homepage and the Studio workflows needed to author it. Make
focused improvements and verify them. Larger platform work and wholesale
framework changes are outside this polish pass.

## Start Here

Workspace: `/Users/mhuntsberry/Desktop/consonant-2`.

1. Read root `AGENTS.md`, `CLAUDE.md`, and `docs/guardrails/`.
2. Read [the current Homepage gap register](s2a-homepage-gap-register.md).
   This is the most specific record of what was built, what deviates from Figma,
   and what still needs decisions.
3. Read [the app README](../../apps/authoring-poc/README.md) and
   [Figma-to-code workflow](../workflows/figma-to-code-workflow.md).
4. For the larger direction, consult
   [the authoring/platform plan](milo-v2-authoring-poc-plan.md) and
   [the performance harness plan](milo-v2-performance-harness-plan.md).
   Planned architecture and old inventory counts are not proof of implementation.
5. Use Nx workspace/project MCP tools if available; otherwise inspect the existing
   project configuration. Use Nx targets for builds and verification.

`docs/north-star/` and `story-ui-docs/` were absent in this checkout. Do not invent
their contents or present this POC as approved Adobe platform strategy.

### Protect the Working Tree

This checkout is intentionally dirty. The entire authoring app, Homepage assets,
new components, tests and several docs are currently untracked. They are valuable
work, not disposable scratch files. There are also pre-existing changes in
workflows, dependencies, QuoteCard/carousel code, specs and `context/milo`.

Inspect `git status` and relevant diffs first. Do not reset, clean, discard,
overwrite or sweep unrelated files into a commit. Do not automatically run
`/sync`, `/start-feature` or `/push` for this continuation: those workflows may
pull, create branches/PRs or publish work. Ask before git operations that change
the shared working state or send work remotely. No commit, push or deployment
was performed in the preceding implementation pass.

## Open the Experience

- Studio: `http://127.0.0.1:4400/?starter=homepage`
- Clean fixture preview: `http://127.0.0.1:4400/preview.html?fixture=homepage`
- Saved draft preview: `http://127.0.0.1:4400/preview.html`
- Last working Storybook preview:
  `http://127.0.0.1:6007/?path=/story/pages-homepage--full-page`

Check which servers are still running. A saved draft takes precedence over the
starter query parameter. Use the house toolbar action to load the Homepage; it
asks for confirmation and supports undo. Export valuable drafts before replacing
them. Drafts are local to the browser, origin and hosting path, not cloud saves.

Node 24 and the root lockfile are the established environment. To start Studio:

```sh
npx nx run authoring-poc:serve
```

Storybook's older server on port 6006 returned a stale missing-module error during
the last pass. We left it untouched and served a fresh static build on 6007:

```sh
npx nx run storybook:build
npx nx run storybook:serve --command='npx vite preview --outDir storybook-static --port 6007 --strictPort --host 127.0.0.1'
```

That 6007 server is a static preview, not HMR. Rebuild after Storybook/component
changes. Reuse existing servers when appropriate; do not kill unrelated processes.

## Design Authority

- WIP file: `qAF4nlt6O4ThbeXeO7jzdb`
- [Homepage frame, 12102:175100](https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/?node-id=12102-175100)
- [Original GNav WIP, 6006:294978](https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/?node-id=6006-294978)

The user's rule is important:

- If a needed component exists in S2A Figma and Storybook, reuse it and reconcile
  discrepancies in the shared implementation.
- If it exists in S2A Figma but not Storybook, build the needed component to the
  verified spec and add a story, contract and focused tests.
- If it is not in S2A Figma, flag it and circle back. Do not invent an approved
  S2A component or silently add a competing design language.

Read design context, component variants, tokens and actual paint/media assets,
not just a flattened screenshot. If Figma access is unavailable, identify what
cannot be verified and continue only with evidence-backed polish. Do not claim
pixel parity from metadata, screenshots of code alone, or passing unit tests.
Treat Figma as read-only for this pass unless the user asks for design-file edits.

The Homepage is WIP and contains placeholder/contradictory content. The gap
register records corrected merged headlines, repeated CTAs, provisional product
links and News links that currently lead to Adobe News rather than individual
articles. Do not quietly restore those defects or claim the substitutions are
approved editorial content. Any new live-adobe.com comparison needs fresh evidence.

## What Exists

The POC uses Vite, TypeScript and Lit, importing the real S2A component source and
generated tokens. It does not have a copied React/Tailwind component library.

The Homepage contains eight authored sections:

| Section | Current State |
| --- | --- |
| Global navigation | New link-only bar and mobile disclosure. Not a completed Federal/mega-menu replacement. |
| Marquee | Verified Acrobat slide, responsive image, optional multi-slide controls and keyboard/playback behavior. |
| Category router | Five categories, existing HubRouter/ElasticCard, editable text/icons/links and local stills. |
| Features and releases | Feature plus three-up MediaCard recipe using actual Figma image paints. |
| Social proof | One verified Michelle Phan quote/photo using the existing quote/carousel implementation. |
| Adobe News | Three editable TextCards with a section heading. |
| Product router | Product hero, nine linked ProductCards, editable content and icons. |
| Footer | Editable grouped links and Adobe wordmark based on an unversioned Figma page pattern. |

Studio supports section and nested-item editing, ordering, duplication/deletion,
asset selection, local autosave, undo/redo, validated JSON import/export, and
desktop/tablet/mobile iframe previews. Concurrent-tab revision checks prevent
silent lost updates. The inspector is the text-editing surface; direct on-canvas
rich text, drag-and-drop and collaborative authoring are not implemented features.

Storybook's `Pages/Homepage` uses the same Homepage document factory and component
registry as Studio, with a full-page story and seven section stories. Keep this
shared rendering relationship intact. A visual fix should not exist only in one
of the two experiences.

The visitor preview is still client-rendered. Initial-HTML publishing, CMS/DAM,
identity, consent, localization, approvals, production RUM and migration tooling
remain future work. The larger plan proposes AEM/EDS integration with an editor
UX acceptance gate; no production backend choice is implemented by this demo.
The monorepo location is deliberate because another Adobe repo may not be available.

## Code Map

Paths below are relative to the workspace root.

| Area | Files |
| --- | --- |
| Editor UI and interactions | `apps/authoring-poc/src/app.ts`, `app.css` |
| Homepage content, recipes and review flags | `apps/authoring-poc/src/homepage.ts` |
| Page contracts, validation and history | `apps/authoring-poc/src/model.ts`, `page.schema.json`, `homepage.schema.json` |
| Persistence and preview messages | `apps/authoring-poc/src/drafts.ts`, `protocol.ts` |
| Shared rendering and controller lifecycle | `apps/authoring-poc/src/registry.ts` |
| Isolated visitor/canvas preview | `apps/authoring-poc/src/preview.ts`, `preview.css`, `tokens.css` |
| Asset IDs and responsive URLs | `apps/authoring-poc/src/assets.ts` |
| Original quote fixtures | `apps/authoring-poc/src/fixtures.ts`, `quote-fixture.ts` |
| Homepage stories | `apps/storybook/stories/Homepage.stories.js`, `Homepage.stories.css` |
| New navigation and section recipes | `packages/components/src/global-navigation/`, `homepage-sections/` |
| Shared components refined in this pass | `router-marquee/`, `hub-router/`, `media-card/`, `product-card/`, `text-card/`, `rich-content/`, `app-icon/`, `social-proof-carousel/` under `packages/components/src/` |
| Image provenance | `apps/storybook/stories/assets/homepage/sources.json` |
| Asset preparation | `apps/authoring-poc/scripts/prepare-assets.mjs`, `fetch-homepage-assets.mjs` |
| Browser/performance checks | `apps/authoring-poc/scripts/homepage-e2e.mjs`, `e2e.mjs`, `perf.mjs`, `perf-score.mjs`, `browser-utils.mjs` |
| Unit and source/spec contract tests | `apps/authoring-poc/src/*.test.ts` |
| Nx tasks and CI | `apps/authoring-poc/project.json`, `.github/workflows/authoring-checks.yml` |

The asset capture script is a one-time provenance/download step. Normal builds
use checked-in source assets and generate local responsive WebP renditions; they
must not depend on expiring Figma MCP URLs. Do not substitute a full-page screenshot
for component rendering or introduce unverified stock art to hide design gaps.

## Recommended Polish Order

1. **Capture the baseline.** Inspect Studio, standalone preview and Storybook at
   desktop and mobile sizes. Make a short, prioritized discrepancy list with
   screenshots and Figma references. Passing tests are not a visual approval.
2. **Resolve typography first.** Compare actual loaded fonts, weights, line breaks
   and token resolution. Storybook's `.storybook/preview.js` loads font faces/kits
   that Studio does not currently mirror, so typography can differ. Verify font
   delivery rights and measure the cost of any change; do not commit restricted
   font binaries or rely on fonts installed on the developer's machine.
3. **Refine the page top to bottom.** Tune section rhythm, content measures,
   spacing, card density, image crops and text-over-image legibility against the
   verified design. Keep normal hero proportions while allowing long copy to
   expand. Validate the category rail, feature grid, quote, product grid and footer,
   not only the first viewport. Keep a glimpse of the next section where practical.
4. **Improve the editor experience.** Make selection, nested-item controls,
   field grouping, labels, component-picker previews, asset choice and review
   flags feel deliberate. Preserve focus while typing and predictable scrolling.
   Use accurate previews and human-readable names where possible. Keep the editor
   a quiet working tool, not a marketing page. Every visible control must work.
5. **Polish motion deliberately.** Prefer verified S2A motion and lightweight
   transitions. Keep keyboard/touch alternatives, explicit pause/play, reduced
   motion, offscreen/hidden-document pausing and controller disposal. Do not add
   autoplay video, parallax or scroll animation without appropriate assets and
   measured behavior. Authoring mode must stay still and usable.
6. **Close evidence-backed gaps selectively.** GNav menus, QuoteCard v2 and footer
   utilities are larger follow-on items, not quick cosmetic fixes. Separate
   missing code from missing design/content/platform integration. Agree on a
   bounded next batch rather than expanding this polish pass into a new platform.

## Guardrails and Known Traps

Paste this reminder before MCP code generation:

```text
Guardrail reminder:
- Use semantic/component tokens only in generated CSS.
- If you *must* use a primitive token, add a comment starting with "Primitive:" explaining why.
- Point out primitive usages in your response so we can replace them during token maintenance.
```

- Preserve the shared component APIs, strict schemas, safe-link validation,
  stable IDs, local-draft safety, undo and import/export. Changes to contracts need
  corresponding tests and compatibility handling, not silent draft breakage.
- Keep editor-only code out of the visitor entry. Do not replace the shared
  registry with a second hardcoded Homepage. Avoid unrelated library refactors.
- Semantic theme variables are scoped to the document root. A `data-theme` on a
  nested story element alone does not switch them. The Homepage story has a dark
  global; the iframe root reflects the authored page theme.
- Keep letter spacing at zero and do not scale text size with viewport width.
  Use existing S2A tokens/icons and intentional responsive type steps. Preserve
  readable contrast, clear focus states and unclipped maximum-length content.
- Fixed-dark backgrounds and mobile scrims have documented `Primitive:`
  exceptions, as does the marquee button's minimum size. Reconcile them with
  approved semantic/component tokens; do not use a theme-adaptive inverse token
  that makes a fixed-black surface white in dark mode.
- A category rail snap mismatch caused automatic mobile scrolling before first
  paint and suppressed LCP reporting. Matching its scroll padding to the inset
  fixed it. Keep the initial-scroll regression check and fail missing metrics.
- The final inspector fix explicitly selects the authored option when Lit creates
  dynamic dropdown options. Test non-first product icons through edit, reload and
  export; a displayed default can disagree with valid saved data.
- One testimonial is verified; the marquee now carries the five live router slides. Hidden single-item controls are
  intentional. Do not invent four more hero contents or customer testimonials.
- The hero source has a baked-in frame-label artifact visible at some mobile
  crops. Obtain approved clean art; the current crop is not production-ready.
- The Homepage's quote instance references a deprecated Figma master. Existing
  QuoteCard code is not verified v2 parity. The footer is not an approved,
  versioned S2A component contract yet.
- News destinations, several CTA corrections and product links need editorial
  approval. Account, region, consent and privacy controls need real integrations;
  do not make convincing but nonfunctional substitutes.
- Storybook build preparation can regenerate analytics data; failures previously
  emptied Figma arrays. Preserve existing data and avoid unrelated generated-file
  churn. Nx formatting can also touch root config. Inspect diffs after tooling.

## Verification and Performance

The last pass had 50 passing unit/contract tests, passing typecheck and Storybook
builds, original Studio regression journeys, and Homepage browser checks across
1920, 1440, 768, 390 and 320px. Checks include images, overflow, maximum-length
marquee copy, keyboard behavior, dropdown persistence, autosave/export and
automated accessibility. The built Storybook page was checked separately at
desktop/mobile sizes. These checks are not full accessibility certification or
approved pixel-diff baselines.

Run relevant checks after changes, with performance serial and isolated from
builds, other browser tests and CPU-intensive work:

```sh
npx nx run-many -t typecheck,test -p authoring-poc --parallel=1
npx nx run authoring-poc:e2e
npx nx run authoring-poc:homepage-e2e
npx nx run storybook:build
npx nx run authoring-poc:homepage-e2e --args=--storybook-url=http://127.0.0.1:6007/
npx nx run authoring-poc:perf
npx nx run authoring-poc:homepage-perf
```

The Storybook URL check requires a running server with a fresh build. Browser
checks may require permission to launch Chromium/listen locally. Evidence lives
in ignored `apps/authoring-poc/reports/`; CI uploads reports even on failure.

| Gate | Mobile | Desktop |
| --- | --- | --- |
| Median LCP | <=2,000ms | <=1,500ms |
| CLS | <=0.05 | <=0.05 |
| Compressed JS | <=100KiB | <=100KiB |
| Compressed CSS | <=40KiB | <=40KiB |
| Initial transfer | <=1MiB | <=1.5MiB |
| Observed long-task blocking | <=150ms | <=100ms |

Five fresh cold runs per profile, 10s observation. Mobile uses CPU 4x and
1.6Mbps/150ms network. A measured 700ms blocking fault must fail the gate.
The 20-section editor stress case requires ready <=3s and update roundtrip
p95 <=100ms. Do not weaken budgets or replace missing measurements with zero.

Last Homepage run, September 14 at 19:10 UTC, Chromium 151: median LCP 1,936ms
mobile / 380ms desktop, CLS 0, compressed JS 70,744 bytes, CSS 12,634 bytes.
Editor update roundtrip p95 was 7ms; the seeded fault was detected. Mobile LCP
has little headroom, so font and motion changes deserve particular scrutiny.
The final inspector-only dropdown fix was browser/typecheck-tested afterward;
visitor preview bundles were unchanged from that measured run. Re-measure your
changes instead of quoting this baseline as a result for the polished version.

These are synthetic local POC results, not production field INP/RUM, global
capacity evidence, a real Milo comparison or proof of adobe.com-scale readiness.

## Completion and Handoff Back

Deliver a visibly more polished Homepage and authoring workflow while preserving
real editability and shared Storybook/Studio rendering. Start with the discrepancy
list, then implement the highest-value bounded fixes. Ask only where missing
design evidence or a material product decision requires the user's input.

Finish with before/after desktop/mobile screenshots, the changes and their
locations, commands/results actually run, updated performance evidence, and the
remaining gaps. Update the gap register as items are resolved or newly verified.
Call out temporary token exceptions and any unverified Figma fidelity explicitly.
Leave usable local URLs available. Do not commit, push, deploy or edit Figma
without the user's authorization.

## Outcome, September 14 (Claude pass)

Completed as a bounded polish pass; see the updated
[gap register](s2a-homepage-gap-register.md) for the reconciled items, the
motion evidence, the Studio changes and the fresh verification numbers. The
responsive [Original Design Specs](https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/?node-id=9672-83669)
(9672:83669) were used for tablet/mobile fidelity alongside the 1920 WIP frame,
and the live adobe.com homepage was recorded with Playwright as the motion
reference. No commit, push, deployment or Figma edit was made.

## Outcome, September 15 (harness pass)

Second bounded pass on the same tree: Milo's sticky-hero parallax, rail
slide-in and card stagger are ported and held by a motion eval (27/27); the
visual eval covers 1920 dark plus the four light breakpoints (33/33 after three
layout fixes: page gutters, the 1024 tab rail, the 375 quote peek); a
token-binding eval compares Figma bindings, component CSS and shipped tokens
(8/8 resolve, 46 pipeline name gaps listed); and CPro hub and BizPro have
section catalogs ready for goldens. Details and follow-ups are in the
[gap register](s2a-homepage-gap-register.md) (Motion, Evals, Next Batch) and
the [eval harness plan](s2a-eval-harness-plan.md). No commit, push, deployment
or Figma edit was made.
