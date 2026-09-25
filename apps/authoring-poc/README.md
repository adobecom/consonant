# S2A Studio: Phase 1

## Homepage Starter

Open `http://127.0.0.1:4400/?starter=homepage` for the new top-to-bottom Homepage
starter. A saved draft is preserved; use the house toolbar action to replace it
with confirmation and undo. The saved page opens through **Open preview**.

The full page and isolated sections are in Storybook under `Pages/Homepage`.
See the [Homepage gap register](../../docs/future-notes/s2a-homepage-gap-register.md)
for verified Figma references, incomplete areas, editorial decisions and checks.
Run `nx run authoring-poc:homepage-e2e` and `nx run authoring-poc:homepage-perf`
alongside the existing quote-fixture evaluations. Add `--args=--motion` to a
perf target to measure with animations allowed; the default keeps the
reduced-motion baseline. `nx run authoring-poc:recipe-previews` regenerates the
"Add section" thumbnails in `src/recipe-previews/` from the built preview.
`nx run authoring-poc:a11y-audit` runs the deep accessibility audit (see
[the audit report](../../docs/future-notes/s2a-homepage-accessibility-audit.md)),
and `npm run eval:visual:homepage` pixel-diffs each section against the Figma
goldens in `evals/datasets/homepage/` at 1920 dark and 1920/1440/1024/375
light (`--group=` runs one, `--page=cpro-hub` lists another catalog).
`npm run eval:motion:homepage` checks the Milo motion contracts and
`npm run eval:tokens:homepage` compares Figma bindings, component CSS and
shipped tokens. The asset step also downloads the ten
live clips into `public/media/video/` and stages the latest lab and audit
reports into `public/reports/` for Studio's Performance panel.

## Original Spike

A standalone visual-authoring spike inside the existing Nx monorepo. It imports
the actual QuoteCard, SocialProofCarousel, Button and IconButton implementations
and generated S2A tokens. There is no copied component library, new repository,
CMS account, API key or runtime backend requirement.

## Run

Use Node 24 and the root lockfile:

```sh
npm ci
npx nx serve authoring-poc
```

The default URL is `http://127.0.0.1:4400/`. Vite chooses the next available port
if occupied. The Nx target prepares responsive WebP assets and builds tokens
before launching. JSON token changes still need `nx build tokens`; component and
generated CSS changes reload through Vite.

```sh
npx nx run authoring-poc:typecheck
npx nx run authoring-poc:test
npx nx run authoring-poc:inventory
npx playwright install chromium
npx nx run authoring-poc:e2e
npx nx run authoring-poc:perf
npx nx build authoring-poc
```

Run performance separately from other browser/CPU-intensive work. `perf` takes
roughly two minutes. Browser tests launch and close their own temporary local
server. Reports and screenshots go to `apps/authoring-poc/reports/`, ignored by
Git and uploaded as CI evidence.

## What Authors Use

The first screen is the working editor: page outline, canvas and properties.
Authors compose sections, select carousel stories, edit copy and CTA links, choose
approved fixture images, reorder/duplicate/delete sections, and add/remove/reorder
slides. Desktop/tablet/mobile are actual iframe layout widths, scaled to fit the
workspace. Light/dark themes affect the page, not the editor chrome. Preview mode
enables normal visitor navigation and carousel motion; reduced motion is honored.

Text changes update the canvas. Continuous typing is grouped for undo/redo.
Draft text can be empty while an author rewrites it; required-content publication
validation belongs to the later publishing phase. Structural and link safety
validation still applies to every saved/imported draft.
Drafts autosave in IndexedDB, scoped to the hosting path and browser origin.
Revision checks reject conflicting saves from another tab. Export remains
available after storage failure. JSON import is size-limited and fully validated
before replacing the draft, and remains undoable.

**Local draft means this browser/device only.** A preview URL is not a shared
publication, backup or cloud save. Use JSON export/import to move a draft between
devices. Export before clearing browser data or moving to another host/port.
Storage remains subject to browser eviction. Opening preview uses the last
successfully saved draft, and refuses to silently show stale content after a save
failure.

The inspector is the phase-1 text editing surface. Direct on-canvas rich-text
editing, drag-and-drop, multi-user editing, upload/DAM integration, review,
scheduling, localization and production publishing are later work, not hidden
capabilities of this build.

## Hosting in This Repository

`nx build authoring-poc` produces `dist/apps/authoring-poc/` with relative asset
paths and separate editor/preview HTML entry points. It can be hosted beneath a
directory on an ordinary HTTPS static host, without SPA rewrite rules. For a
fixed mount, `AUTHORING_BASE_PATH=/some/path/` is supported and included in the Nx
build cache key. The supplied browser harness tests the default relative build
beneath `/authoring/`.

The existing Storybook and PR-preview workflows now run the reusable authoring
quality workflow before deployment. A failed authoring gate holds the combined
Pages deployment. After Storybook builds, `nx run authoring-poc:stage-pages`
copies the authoring build into `storybook-static/authoring/`. The existing
deployment action publishes one combined artifact; it does not overwrite the
Storybook index or create a competing gh-pages deploy. Closing a PR still runs
preview cleanup when the quality job is skipped.

Expected paths after merging/deploying, assuming the existing Pages settings:

- Main: `https://adobecom.github.io/consonant/authoring/`
- PR: `https://adobecom.github.io/consonant/pr-preview/pr-N/authoring/`

No commit, push or remote deployment is performed by local build commands.
Repository Actions/Pages permissions and publishing policy still apply; a
monorepo does not bypass Adobe's security or content approval. This POC has no
authentication. Serve only approved demo assets on publicly reachable hosting.
`noindex` is included but is not access control.

## Contracts and Boundaries

| File                         | Responsibility                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `src/page.schema.json`       | JSON Schema 2020-12: versions, sections, nested quotes, asset IDs, typed CTA slots and limits |
| `src/model.ts`               | Ajv validation, safe URLs, globally unique node IDs, import/export, history                   |
| `src/registry.ts`            | Explicit source-component adapters and mount/dispose ownership                                |
| `src/preview.ts`             | Isolated page renderer; keyed mounts and controller preservation                              |
| `src/protocol.ts`            | Revisioned editor/frame protocol; exact origin/source/channel checks                          |
| `src/drafts.ts`              | Atomic IndexedDB compare-and-write transactions                                               |
| `inventory.json`             | Section-family classification and explicitly pending Figma leaf audit                         |
| `scripts/prepare-assets.mjs` | Repeatable 640/1480px WebP renditions from tracked Storybook JPEGs                            |

The iframe isolates CSS and viewport behavior, **not hostile executable code**.
No arbitrary JS, HTML, CSS, remote component modules or unregistered asset URLs
can be imported. Lit escapes text; the existing Button factory uses textContent
for labels. CTA URLs allow HTTPS, root-relative paths and fragment links, not
script/data URLs, credentials or protocol-relative URLs. Any future rich HTML
or code extension needs a separate trust/sanitization design.

The preview is currently client-rendered and uses local draft storage. It is not
the planned static initial-HTML publisher or a deployed AEM/EDS integration.
The visitor entry excludes editor UI and icon-font CSS, but still shares the
POC validation/draft modules. Package extraction waits for a second consumer.

## Evidence and Gates

- Unit tests cover schema/ID/URL failures, round trips, independent AST-to-spec
  prop conformance, history, fail-closed scoring and 100 controller disposal cycles.
- Browser journeys cover nested editing, ordering, CTA slots, drafts/reload,
  conflicts, JSON import/export/rejection, keyboard/reduced-motion behavior,
  desktop/phone layouts, images, and axe WCAG A/AA checks.
- Performance loads the built standalone preview in five fresh contexts for
  each desktop/mobile profile, with CDP CPU/network shaping and a 10-second
  observation window. Raw resource and performance entries are retained.
- Gates currently cover median LCP, session-window CLS, compressed JS/CSS,
  transferred bytes, failed requests, missing primary images, editor-entry leaks,
  and long-task blocking time in the observation window. The latter is **not
  Lighthouse TBT**. These measurements are not INP or real-user telemetry.
- A server-injected 700 ms task must fail the same blocking-time scorer; the
  overall self-test passes only when that expected regression is detected.
  Scorer unit tests also reject missing evidence, excessive JS and layout shift.
- The editor check imports 20 sections into an already-open editor and measures
  import-to-render plus edit-message round-trip p95. It does not establish cold
  editor startup, end-to-end human task time, large-document production capacity,
  or the cost of storage beyond the tested local fixture.
- The reusable GitHub workflow runs before main/PR Pages deployment, manually,
  and every weekday. Reports include source commit, dirty state, artifact hash,
  browser version, profiles, samples and limits. CI hardware results must be
  reviewed before treating a local baseline as a cross-machine comparison.

The larger [harness plan](../../docs/future-notes/milo-v2-performance-harness-plan.md)
still owns Lighthouse/trace diagnostics, interaction INP/RUM, image/font-specific
budgets, visual baseline approval, WebKit/Firefox, failure-mode expansion,
100-section stress, real network journeys, and publishing/service-capacity gates.
Chrome DevTools MCP was unavailable in this session; the measurements here come
from the checked-in Playwright/CDP harness, not a DevTools MCP audit.

## Remaining Phase-1 Signoff

The engineering spike is implemented; **the whole phase is not signed off**.

1. Complete the actual leaf/component/asset inventory for all four planned pages.
   Their roots and named section structure were freshly verified with the official
   Figma metadata connection after Desktop Bridge failed. `inventory.json` records
   IDs, visibility, widths and opaque-instance counts. Metadata is not paint,
   token, content, interaction or full descendant verification.
2. Assign design/content approvers and confirm the empty BizPro Offer exception.
3. Record the real Milo baseline and comparable author task recordings. Current
   numbers measure S2A only and do not prove an improvement over Milo.
4. Review this editor with representative authors, including keyboard and assistive
   technology users. Automated axe results are not a usability/accessibility signoff.
5. Confirm demo content/image rights and approved font delivery before sharing.
   Storybook images/names and the new sample copy are demo fixtures, not approved
   customer testimonials. No licensed Adobe font files are added; the HTML entries load
   the same Adobe Fonts kits as Storybook without render blocking, system-installed
   Adobe fonts are used when available, and Trebuchet MS/sans-serif is the fallback.

Known inherited issues: the token build succeeds with unresolved/filter-reference
warnings, including `s2a.shadow.level-1.color`; the current root dependency install
reports audit findings. They are not silently fixed by a broad dependency upgrade.
The quote's two invariant media-scrim primitive references now have explicit
`Primitive:` comments; semantic overlay aliases remain a token-maintenance task.

Implementation conventions follow the repository's
[Figma-to-code workflow](../../docs/workflows/figma-to-code-workflow.md),
[token guardrail](../../docs/guardrails/no-primitives-in-components.md),
[Nx project configuration](https://nx.dev/docs/reference/project-configuration),
[Vite multi-page build](https://vite.dev/guide/build#multi-page-app), and
[Ajv 2020-12 support](https://ajv.js.org/json-schema).
