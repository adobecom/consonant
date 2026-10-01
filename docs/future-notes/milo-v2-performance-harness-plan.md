# S2A Performance and Quality Harness: Implementation Specification

Status: phase-1 subset implemented; the full harness below remains the target design.
Updated: September 14, 2026.
Parent: [authoring and delivery plan](milo-v2-authoring-poc-plan.md).

## Implemented Slice

Run `nx run authoring-poc:perf` for five cold Chromium runs per desktop/mobile
profile, built-preview LCP/CLS/resource/long-task gates, a measured negative
blocking fixture, and 20-section editor import/edit timings. `authoring-poc:test`
checks missing-evidence failures and controller disposal; `authoring-poc:e2e`
checks editing/recovery, accessibility and responsive screenshots. Reports live in
`apps/authoring-poc/reports/` and are uploaded by the reusable quality workflow
that gates the combined Storybook/authoring Pages deployment.

This measures a **client-rendered POC preview**, not generated initial HTML, field
INP, real publishing services or adobe.com-scale capacity. The long-task sum is
not Lighthouse TBT; the editor import timing is not cold startup. The injected
fixture must fail the scorer for the self-test to pass. No Milo comparison or
human authoring-speed improvement has been measured. Details and remaining gates:
[phase-1 implementation](../../apps/authoring-poc/README.md#evidence-and-gates).

## 1. Purpose and Measurement Boundaries

Continuously prevent regressions in the editor, generated visitor pages, shared
components, media, and eventually publishing services. A release must satisfy
correctness and accessibility as well as performance; reducing rendered content
or skipping an interaction must never improve its apparent result.

Use four distinct measurement surfaces:

| Surface          | What is measured                                               | What the result can establish                                                      |
| ---------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Published page   | Real built HTML/CSS/JS/assets loaded as a top-level document   | Repeatable loading, interaction, and resource behavior of the visitor artifact.    |
| Authoring app    | Editor shell plus preview, with explicit parent/frame timings  | Editing responsiveness, persistence, large-document behavior, and lifecycle costs. |
| Field telemetry  | Eligible real visits, separated by release and audience cohort | Actual user outcomes under real devices, networks, integrations, and interactions. |
| Service capacity | Controlled staging content/publish/delivery paths              | Throughput, latency, backpressure, errors, and recovery under a specified load.    |

Do not compare an editor screenshot against a public page's speed, report a
navigation-only Lighthouse run as INP, or infer global capacity from a local build.
Lighthouse provides loading diagnostics and TBT; interaction scenarios and field
telemetry are needed for responsiveness evidence.
([Web Vitals measurement](https://web.dev/articles/vitals))

## 2. Selected Tools and Existing Work

| Tool                               | Selected role                                                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Nx + GitHub Actions                | Build exact artifacts, select affected fixtures, orchestrate checks, enforce release status.                                      |
| Lighthouse CI                      | Production navigation audits and machine-readable loading/resource assertions. Pin versions.                                      |
| Playwright                         | Actual user journeys, screenshots, JS-disabled checks, asset readiness, browser correctness, and artifact collection.             |
| Chromium CDP                       | Explicit CPU/network shaping, performance traces, network accounting, and controlled lifecycle/memory diagnostics.                |
| `web-vitals`                       | Standard browser metric computation; attribution only through a sanitized instrumentation adapter.                                |
| `@axe-core/playwright`             | Automated accessibility checks alongside keyboard and focus scenarios.                                                            |
| `packages/validators`              | Existing shared contract/token rules, with required normalization and MCP/eval wiring.                                            |
| Existing pixelmatch/pngjs workflow | Reuse visual comparison infrastructure after correcting resize/failure behavior.                                                  |
| k6                                 | Pilot content API, publishing, and controlled origin/capacity scenarios with explicit pass/fail thresholds.                       |
| JSON + HTML reports first          | Reviewable artifacts and history; adopt an existing internal dashboard when available, avoiding a bespoke dashboard prerequisite. |

Lighthouse CI supports assertions and repeated-run aggregation. Configure actual
metrics, not only a weighted performance score.
([LHCI configuration](https://googlechrome.github.io/lighthouse-ci/docs/configuration.html))
Playwright traces support investigation of actions, DOM, and network state.
([Playwright trace viewer](https://playwright.dev/docs/trace-viewer))

### Reuse and repair

1. Complete shared validator consumption. The package already exists; do not
   duplicate its token index or create a third independent spec checker.
2. Normalize structured token bindings, explicit Figma/code axis mappings, legacy
   default values, and invalid schema fields. A Figma check that was skipped is
   reported as skipped, not counted as a verified design match.
3. Obtain source/API evidence independently. Do not build a candidate's complete
   prop/variant summary by reading the expected spec and copying its values.
4. Keep demonstration examples separate from release assertions. `evals/demo.ts`
   currently prints synthetic pass/fail examples and is not the release runner.
5. Fix the Bento visual runner before using it as a gate: fail on missing goldens
   and failed cases; wait for fonts/images explicitly; fail geometry mismatch
   instead of resizing the candidate to the expected dimensions.
6. Reuse Milo Preflight/performance knowledge during integration, while testing
   the published page end to end rather than merely checking component metadata.
7. Add declared, pinned dependencies for the tools the harness actually uses;
   do not rely on transitive packages being accidentally available.

## 3. Fixture Catalog

Each fixture has an ID, content hash, registry/component/token versions, asset
manifest hash, expected section/CTA counts, readiness conditions, owner, supported
profiles, expected behavior, and budget class. Missing fixtures fail selection.

| Fixture              | Coverage                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home`               | All shared chrome, hero/media, Hub Router, grids, quote carousel, product router, footer.                                                                 |
| `bizpro`             | Product UI media, repeaters, two grid rows, merchandising; recorded empty-Offer exception.                                                                |
| `cpro-hub`           | Raster content, typographic social proof, offers, photo/use case sections.                                                                                |
| `cpro-offer`         | Promo/nav/jump links, nested merchandising, CTA and anchor behavior.                                                                                      |
| `compound-section`   | Three quote slides with assets and CTA slots; nested edit/export/reload.                                                                                  |
| `editor-20`          | Typical authoring document.                                                                                                                               |
| `editor-100`         | Supported maximum document, with realistic nested items; not 100 empty sections.                                                                          |
| `locale-expansion`   | 40% longer pseudo-localized text plus RTL and CJK representative content/fonts.                                                                           |
| `dependency-failure` | Failed/slow media and integration responses; consent refused/accepted; usable fallback.                                                                   |
| `motion-stress`      | Carousel transitions, hover/touch alternatives, scroll, pause/resume, offscreen media.                                                                    |
| `migration-pairs`    | Old source/revision and candidate route: content, URLs/metadata, interactions, author editability, performance, and absence of Milo runtime dependencies. |
| `negative-*`         | Seeded regressions used to prove the harness detects failures.                                                                                            |

Experience journeys also cover canvas inline editing, asset selection/crop,
contextual fields, repeated-item reorder/undo, and switching Edit/Preview without
losing selection. Edit stabilizes moving targets; Preview runs real choreography.
Assert that enabled motion occurs and respects pause/reduced motion. Compare
transition states as well as endpoint screenshots.

Apply the same scenarios and thresholds to the S2A shell and any Universal Editor
integration. Record extension/widget differences. Backend integration success does
not establish author-experience parity. Designer approval and representative-author
task/ease results are separate required evidence, not values inferred from
Lighthouse, screenshots, or an LLM score.

Use approved assets stored by stable ID/hash. Dynamic third-party content is
replaced with deterministic contract-faithful fixtures in baseline comparisons.
Also run separate deployed probes with real dependencies: stubbed laboratory
results cannot establish end-to-end integration performance.

Test real content distribution: short/long titles, missing optional fields,
minimum/maximum slide counts, long URLs, large images, and nested fragments.
Invalid documents fail authoring validation; they must not cause an empty page
that is then rewarded by the performance scorer.

## 4. Reproducible Run Profiles

Chosen initial profiles, versioned in `profiles.json` during implementation:

| Profile            | Viewport / DPR | CPU         | Network                                        |
| ------------------ | -------------- | ----------- | ---------------------------------------------- |
| `visitor-mobile`   | 390 x 844 / 2  | 4x slowdown | 1.6 Mbit/s down, 750 Kbit/s up, 150 ms latency |
| `visitor-desktop`  | 1440 x 900 / 1 | 1x          | 10 Mbit/s down/up, 40 ms latency               |
| `editor-reference` | 1440 x 900 / 1 | 4x slowdown | 10 Mbit/s down/up, 40 ms latency               |
| `degraded-network` | 390 x 844 / 2  | 4x          | 750 Kbit/s down, 250 Kbit/s up, 300 ms latency |

These are synthetic comparison profiles, not representations of every device or
adobe.com audience segment. Pilot measurements add actual lower-end devices and
region-appropriate networks based on field evidence.

Rules:

- Run production builds, never Vite/Storybook development mode for visitor budgets.
- Pin OS/container image, runner class, Node, Chrome, Lighthouse, Playwright, fonts,
  and tool lockfile. Record versions and configuration hashes in every result.
- LHCI uses applied DevTools throttling; Playwright applies equivalent CDP settings.
  Configure each runner once. Do not combine simulated and applied throttling or
  apply CPU/network slowdown twice. Record verified effective settings.
- Chromium timing comparisons run alone on a controlled worker. Build/lint and
  other browsers do not consume the same worker during a measurement.
- Cold means a fresh browser context with HTTP cache/storage/service workers empty.
  Warm means a second navigation with the same context/cache. A cold browser does
  not imply a cold CDN: record delivery-cache headers/status separately.
- Browser correctness uses Chromium, Firefox, and WebKit. Chromium owns initial
  timing thresholds; other browsers have functional/visual release gates. Pilot
  adds real-device Safari/Android coverage rather than assuming emulation is enough.
- Use deterministic content and explicit readiness signals, not arbitrary sleeps
  or `networkidle` as the only condition. Videos and telemetry may never become idle.
- LCP navigation collection ends before scripted interaction invalidates the
  loading scenario. Interaction/scroll runs use a separate page lifecycle.
- Keep screenshot animation freezing separate from motion/performance journeys.
  Performance measurements must not secretly disable the work being evaluated.
- The degraded profile is a required functional/fallback scenario; baseline normal
  profile timing budgets do not apply to its intentionally different network.

## 5. Initial Budgets

These are selected project budgets, not measured results or universal standards.
Baseline them during Week 1 and meet them before the relevant milestone exits.
Changing a budget requires evidence and review; a failing baseline does not
automatically justify raising the limit.

### Published-page loading and resources

All four pages must meet the normal mobile and desktop gates independently.
Use per-metric medians of five valid cold navigations; retain every raw run.

| Metric           | Mobile gate | Desktop gate | Definition                                                                                    |
| ---------------- | ----------- | ------------ | --------------------------------------------------------------------------------------------- |
| LCP              | <= 2,000 ms | <= 1,500 ms  | Direct published document, loading-only journey.                                              |
| CLS              | <= 0.05     | <= 0.05      | Navigation and separately the complete scripted page journey.                                 |
| TBT              | <= 150 ms   | <= 100 ms    | Lighthouse navigation measurement; diagnostic for loading responsiveness, not field INP.      |
| Initial JS       | <= 100 KiB  | <= 100 KiB   | All scripts actually transferred in the first 10 seconds without interaction.                 |
| Journey JS       | <= 150 KiB  | <= 150 KiB   | All scripts across the defined 60-second visitor journey, including integrations.             |
| Initial CSS      | <= 40 KiB   | <= 40 KiB    | Compressed response-body bytes requested during initial window.                               |
| Initial fonts    | <= 120 KiB  | <= 120 KiB   | Selected WOFF2/subset files actually requested; locale font variants measured separately.     |
| HTML             | <= 50 KiB   | <= 50 KiB    | Compressed document body.                                                                     |
| LCP image/poster | <= 200 KiB  | <= 350 KiB   | Actual selected responsive rendition.                                                         |
| Initial total    | <= 1 MiB    | <= 1.5 MiB   | All response bodies, including telemetry, fonts, media, and third parties, in initial window. |

KiB means 1,024 bytes; MiB means 1,048,576 bytes. Sum encoded response-body bytes
from complete browser network accounting; exclude request/response header bytes.
Record protocol wire bytes separately. Redirects and third-party resources are
included. Unknown or opaque sizes must be resolved through browser network logs
or reported as missing evidence, not silently counted as zero.

Bundle-file Brotli size is a separate deterministic build check, not a substitute
for what the deployed host actually transfers. Dynamic chunks, CSS imports, fonts,
and media must appear in the network result.

A continuous video stream is not exempt from the initial byte budget. The chosen
default is a responsive poster first; defer video until viewport/interaction and
bandwidth policy permit it. Any exception states exact bytes, affected cohort,
owner, justification, and expiry. Do not defer large work just past the initial
window: the 60-second scripted journey and idle/offscreen checks expose that.

### Public interactions and motion

| Metric/scenario              | Gate                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scripted interaction latency | p95 <= 200 ms, no measured interaction > 500 ms, for nav/menu, next slide, jump links, and demo search.                                                 |
| Interaction evidence         | At least 100 eligible interactions per fixture/profile across at least 10 independent sessions. Store action identity and duration.                     |
| Late layout movement         | Journey CLS <= 0.05 after scrolling, image completion, font load, and carousel interaction.                                                             |
| Media activity               | No offscreen/hidden-tab video playback after the agreed observer/pause interval; no automatic video under reduced motion.                               |
| Main-thread stalls           | No task > 200 ms during the fixed interaction/motion journey; longer-than-50-ms tasks counted and attributed.                                           |
| Scroll/motion quality        | Trace p95 animation frame interval <= 33.3 ms on a 60 Hz reference profile; diagnostic until runner variance is characterized, plus real-device review. |

Measure interactions using Event Timing and explicit presentation checkpoints;
do not call a `click()` duration INP. Record `web-vitals` INP where supported, with
its own metric semantics, alongside per-action latency. Absence of interactions
is missing evidence, not INP = 0. Frame intervals alone are not a proof of actual
compositor presentation or smoothness on all displays.

### Authoring responsiveness

Metrics include validation, relevant model changes, frame messaging, and visible
preview updates. Use parent-clock marks around send/acknowledgement; acknowledgements
follow the preview's render/presentation checkpoint. Record component work and
cross-frame overhead separately. Arbitrary double-animation-frame waits are only
a presentation proxy; document that limitation.

| Scenario                       | Gate on editor-reference                                                                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cold open, 20-section document | Editor controls and preview ready <= 3,000 ms median of five runs.                                                                                               |
| Text/enum/boolean edit         | p95 <= 100 ms for visible preview update.                                                                                                                        |
| Add/reorder/remove section     | p95 <= 200 ms with focus/selection preserved.                                                                                                                    |
| Undo/redo                      | p95 <= 200 ms, content and section IDs restored correctly.                                                                                                       |
| Maximum 100-section document   | p95 edit <= 200 ms, add/reorder <= 300 ms; operation count fixed.                                                                                                |
| Autosave durability            | Last acknowledged draft restored after reload; write completes <= 1,000 ms after the configured debounce.                                                        |
| Lifecycle stress               | 100 add/edit/remove cycles leave no active removed-section controllers, observers, timers, or media.                                                             |
| Memory trend                   | Post-GC retained heap growth <= max(5 MiB, 10% of starting post-GC heap) after the stress journey; isolated Chromium diagnostic plus controller-count hard gate. |

Forced GC is only used in the separate memory diagnostic, never to improve timing
results. Heap variability cannot excuse leaked controller instances. After first
calibration, the memory check becomes required on the pinned runner; unsupported
measurement APIs produce an explicit diagnostic state.

### Regression policy

An absolute budget and the baseline comparison are separate requirements.

1. Compare candidate and merge-base artifacts built with the same toolchain,
   profile, fixture, fonts, and assets on the same runner. Alternate base/head order.
2. Use five cold runs per artifact/profile/fixture. Compare per-metric medians,
   not the best run or a single representative Lighthouse report.
3. Fail an absolute budget breach. Also flag a relative timing increase greater
   than max(10% of baseline, 100 ms), or CLS growth > 0.02, even if still under budget.
4. For resource sizes, flag growth greater than max(5%, 5 KiB). Counts, missing
   assets, broken behavior, and editor-in-visitor imports are deterministic failures.
5. For a timing-only regression, run one complete paired confirmation batch. Both
   batches breaching the same comparison rule fail. Mixed results are `unstable`
   and block release pending investigation; do not rerun until lucky.
6. Excess runner variance (IQR/median > 20% for timing metrics), a failed control
   fixture, missing samples, tool errors, or incomplete network accounting is
   `infrastructure-error`/`unstable`, never a passing result. Preserve all samples.
7. A baseline is promoted only from an accepted release. Never rewrite baseline
   data automatically from a pull request. Every baseline update records its reason.

For intended content changes, evaluate both a code-only fixed-content comparison
and the actual proposed content against absolute budgets. For new fixtures without
a baseline, enforce absolute gates and require a reviewed initial baseline; label
relative comparison `not-established`. Existing fixtures losing their baseline fail.

## 6. Harness Architecture and Results

Planned structure, created during implementation:

```text
evals/
  project.json
  performance/
    budgets.json
    profiles.json
    fixtures.json
    run-navigation.ts
    run-interactions.ts
    run-editor.ts
    run-capacity.ts
    compare.ts
    report.ts
    selftest.ts
    journeys/
    baselines/manifest.json
  datasets/pages/
  datasets/performance-negative/
  authoring/
  out/<run-id>/
    manifest.json
    results.json
    report.html
    lighthouse/
    traces/
    network/
    screenshots/
```

Runner sequence:

1. Validate fixtures, versions, budget config, requested cases, and baseline manifest.
2. Build exact production artifacts, resolve asset closure, and start a controlled
   static server with compression/cache behavior specified by the profile.
3. Verify expected HTML/content and working enhancement entry before measuring.
4. Collect navigation, interactions, and editor cases in separate browser sessions.
5. Run correctness/a11y assertions, attribute resources and long tasks to section
   dependencies, compare raw results to budgets and baseline, and write reports.
6. Terminate browsers/servers, persist artifacts even on failure, then return the
   overall nonzero status when any required case did not pass.

Result example (values are illustrative, not measurements):

```json
{
  "schemaVersion": 1,
  "runId": "example-run",
  "commit": "candidate-sha",
  "baselineCommit": "merge-base-sha",
  "releaseId": "candidate-release",
  "fixture": "home",
  "fixtureHash": "sha256:example",
  "profile": "visitor-mobile",
  "profileHash": "sha256:example-profile",
  "toolchainHash": "sha256:example-tools",
  "budgetVersion": 1,
  "metric": "lcp",
  "unit": "ms",
  "samples": [1720, 1800, 1770, 1820, 1790],
  "aggregation": "median",
  "value": 1790,
  "absoluteLimit": 2000,
  "baselineValue": 1700,
  "status": "pass",
  "violations": [],
  "artifacts": { "trace": "traces/home-mobile.json" }
}
```

Full manifests also record registry/token/component/asset hashes, runtime versions,
runner identity, timestamps, cold/warm/CDN state, sample count, expected test count,
and result links. Output states: `pass`, `fail`, `unstable`, `infrastructure-error`,
`not-established`, `not-applicable`. Overall required check passes only if all
required assertions pass and any explicitly inapplicable cases are accounted for.

Stable violation codes include `PERF_LCP_BUDGET`, `PERF_CLS_BUDGET`,
`PERF_INTERACTION_BUDGET`, `PERF_JS_BYTES`, `PERF_RESOURCE_UNKNOWN`,
`PERF_REGRESSION`, `PERF_CONTROLLER_LEAK`, `PERF_MISSING_SAMPLE`,
`PERF_BASELINE_MISSING`, `PERF_UNSTABLE_RUN`, and `VISITOR_EDITOR_DEPENDENCY`.
Do not average failures into a passing composite quality score.

## 7. CI and Publishing Cadence

| Trigger                       | Required work                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local development             | Targeted contract/behavior checks and one-run performance smoke. Label single-run timing advisory.                                                                                                |
| Pull request                  | Deterministic size/contract checks, affected authoring/visitor journeys, five-run paired navigation for affected pages, plus shared smoke cases.                                                  |
| Main merge                    | Full four-page mobile/desktop run, immutable accepted-baseline candidate, hosted smoke and regression report.                                                                                     |
| Nightly                       | Full browser/theme/breakpoint correctness, motion, editor-100, memory, locale, dependency-failure, warm-cache, and deployed regional probes.                                                      |
| Content/asset publication     | Same validator and affected-page performance checks before promoting the content revision; preserve current live release on failure.                                                              |
| Token/chrome/registry release | All four pages and downstream affected families; validate dependency graph coverage explicitly.                                                                                                   |
| Pilot service change          | k6 capacity/regression scenarios on controlled staging and queue/recovery checks.                                                                                                                 |
| Migration batch               | Every page reconciled to source; candidate contracts/links/metadata and smoke checks; representative full journeys by mapping class plus all critical routes; exceptions block routing promotion. |
| Production                    | Continuous RUM plus scheduled regional synthetic checks and automated rollout freeze/rollback signals.                                                                                            |

Use the registry's page/section/asset dependency graph to select tests. Changes to
tokens, rendering, global chrome, profiles, or selection logic force the complete
set. A zero-case selection fails unless it is explicitly a documentation-only
change with no relevant dependencies.

Nx targets below are proposed deliverables, not commands available today:

```bash
npx nx run authoring-poc:build
npx nx run evals:contracts
npx nx run evals:authoring
npx nx run evals:visual
npx nx run evals:perf-smoke
npx nx run evals:perf-pages
npx nx run evals:perf-editor
npx nx run evals:perf-capacity
npx nx run evals:selftest
npx nx run evals:report
```

Define production build prerequisites, inputs, outputs, and page/asset dependencies
explicitly. Measurement targets use `cache: false` and `parallelism: false`; build
and deterministic validation may cache by their complete inputs. Runner exclusivity
also applies across CI jobs, not only within Nx. Do not replay old timing results
as measurements of a new release.
([Nx target configuration](https://nx.dev/docs/reference/project-configuration))

Keep bulky traces/screenshots in CI artifact storage. Retain ordinary run artifacts
30 days and accepted release/baseline summaries 180 days initially. Use the existing
organization artifact service for private fixtures; public demo reports contain only
approved demo data. A report links the failure to its page, action, release,
resource, owner, and evidence, not just a red score.

## 8. Field Monitoring and Rollout Decisions

For the POC, implement a telemetry adapter with a test sink and validate payloads
without claiming real-user statistical coverage. For the pilot, send the agreed
metrics to the existing operational telemetry platform. EDS already documents
operational telemetry and sampling; reconcile available metrics/dimensions before
introducing a second collector.
([EDS operational telemetry](https://www.aem.live/docs/operational-telemetry))

Use `web-vitals` where the platform does not already supply the required browser
measurements. Its standard metrics and attribution options are preferable to
handwritten approximations. Parent-document measurements do not automatically
include iframe content: measure the editor/preview separately, and test visitor
pages directly. ([web-vitals](https://github.com/GoogleChrome/web-vitals))

Payload dimensions: release ID, template/recipe version, route template, locale/
market, coarse device class, navigation type, metric ID/name/value, sample weight,
and allowlisted diagnostic attribution. Do not include author text, search queries,
user identifiers, arbitrary DOM text/selectors, or URL query strings. Integrate the
site's telemetry/consent requirements and send asynchronously within the page budget.

Deduplicate metric updates by page-view and metric ID, preserving the final value.
Handle page visibility, back/forward cache, and absent interactions correctly.
Track sample eligibility and unsupported browsers; absence is not a zero. Preserve
sampling probabilities so aggregates are weighted appropriately. Never average
regional p75 values into a global p75; compute from compatible distributions.

### Field objectives and action rules

- Required objective: p75 LCP <= 2,500 ms, INP <= 200 ms, CLS <= 0.1 for mobile and
  desktop and each designated critical locale/market/page-family cohort.
- Dashboard: release/control comparison, distribution and sample counts, errors,
  slow actions/resources, availability, publish latency/backlog, cache hit rates,
  and business task/conversion outcomes where integrated.
- Canary evaluation requires at least 200 eligible observations per metric/cohort
  and 24 hours of observation. INP needs actual interacting visits. If insufficient
  after 72 hours, retain the canary and make an explicit evidence-based decision;
  never declare success from absent data.
- Operational freeze: two consecutive 30-minute windows with >= 200 observations
  each exceeding a field objective halt further rollout in that cohort.
- Roll back the candidate when the same windows also show > 20% LCP/INP regression,
  or CLS growth > 0.02, against a comparable control, or a verified critical
  functional failure. The release owner handles ambiguous attribution.
- Compare matched device/market/template populations and contemporaneous controls.
  Slow regions cannot be hidden by stronger global averages. Browser capability
  gaps require complementary synthetic/manual evidence.
- After acceptance, retain rolling field trends and use CrUX/Search Console where
  available as external confirmation; their reporting is not the fast rollback loop.

Field objectives are outcome targets, not a guarantee that the POC traffic sample
can establish them. A production promotion needs enough representative evidence.

## 9. Capacity Harness for the Pilot

k6 supplies thresholds that fail the process, while ordinary k6 checks alone do
not determine its exit status. Define thresholds for each scenario and prove them
with an intentionally failing control.
([k6 thresholds](https://grafana.com/docs/k6/latest/using-k6/thresholds/))

Use the parent plan's synthetic envelope until actual peaks are supplied. Tests
must run against controlled staging endpoints with bounded rates, durations, and
abort thresholds. Use an open arrival-rate workload and record dropped iterations;
insufficient generator capacity is not successful service performance.

| Scenario                   | Initial load and assertion                                                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Author saves               | 50 requests/s for 30 min, 150/s burst for 5 min; p95 <= 500 ms, failed requests < 0.1%, no lost acknowledged revisions.                                                      |
| Publish queue              | 10,000 changes/hour steady, 30/s burst for 5 min; p95 visible <= 60 s at steady state; bounded queue drains within 10 min after burst.                                       |
| Duplicate/interrupted jobs | Repeat IDs, kill workers, restart processing; exactly one promoted revision, idempotent outputs, recoverable failures.                                                       |
| Delivery/origin            | Derive requests from edge volume and measured cache miss ratio; test cold-cache amplification and failure fallback. Do not equate origin-only tests with CDN capacity proof. |
| Asset/token fan-out        | Shared dependency changes affect many pages; incremental work is bounded, prior release remains available.                                                                   |
| Soak                       | Two-hour realistic mixed workload; no unbounded memory/queue growth, defined latency/error thresholds maintained.                                                            |
| Rollback/invalidation      | Prior release externally visible at p95 <= 5 min across regional probes, assets consistent.                                                                                  |

Record worker concurrency, queue depth/age, processing time, retries, dead letters,
CMS/CDN limits, cache keys, latency percentiles, and telemetry ingestion loss.
For a 10,000-request/s edge scenario with a measured 1% miss ratio, start reasoning
from approximately 100 origin requests/s before additional amplification; measure
the actual cache behavior instead of assuming that ratio.

Full production signoff uses at least 3x observed relevant peak or the larger
synthetic envelope, with provider capacity confirmation. The four-page static demo
does not establish these service targets.

## 10. Prove the Harness Works

Seed each failure behind test-only fixture configuration. The self-test expects
the inner scorer to reject the fixture; it passes only when the expected violation
code, failing status, and underlying nonzero exit behavior are observed.

| Seeded defect                               | Required detection                                                   |
| ------------------------------------------- | -------------------------------------------------------------------- |
| Oversized hero and duplicated font          | Initial/LCP-resource byte budgets fail with the resource identified. |
| Blocking 300 ms task on next-slide action   | Interaction/long-task violation; action still executed and observed. |
| Late banner without reserved space          | Journey CLS violation and trace/screenshot evidence.                 |
| Detached carousel still owns timer/observer | Controller lifecycle failure and memory diagnostic.                  |
| Import editor module into visitor bundle    | Deterministic dependency failure even if timing remains fast.        |
| Unknown/missing token or invalid spec       | Shared validator reports the expected stable code.                   |
| Missing image/font/section/CTA              | Correctness/readiness failure; empty output cannot pass performance. |
| Missing baseline or no selected tests       | Explicit baseline/selection failure.                                 |
| Partial samples/tool crash                  | Infrastructure failure, no green summary.                            |
| Candidate screenshot dimensions differ      | Geometry failure, no image resizing to conceal it.                   |
| Overload or dropped k6 iterations           | Threshold/workload failure, not a false throughput pass.             |

An LLM may help explain reports or assess subjective visual intent. It does not
decide timing, resource sizes, schema conformance, or whether a mandatory failure
can be ignored. If AI-assisted authoring is added later, its generated pages pass
this same deterministic harness plus separate task-quality evals.

## 11. Delivery Milestones and Ownership

| Due    | Deliverable                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Sep 18 | First fixture, versioned profile/budget draft, navigation result, independent contract checks, negative fixture that fails correctly. |
| Sep 25 | Paired baseline/head runs, published-HTML checks, interaction/editor timings, nonzero exit behavior, Nx/CI report artifacts.          |
| Oct 9  | Homepage and shared-section coverage; content/asset dependency selection; hosted smoke; lifecycle and byte gates.                     |
| Oct 23 | All four pages; mobile/desktop gates; nested authoring, reduced motion, locale/stress fixtures, browser visual/a11y checks.           |
| Nov 6  | Full nightly suite, field payload test sink, rollout/rollback rule tests, report attribution, budget/variance review.                 |
| Nov 13 | Accepted release baseline, complete regression report, documented field/capacity gaps, production integration and k6 backlog.         |
| Pilot  | Real telemetry, regional probes, provider/CMS integration, staging k6 suite, actual cohort evidence and capacity signoff.             |

Performance owner maintains profiles, variance controls, budgets, and triage.
Component/recipe owners fix attributed regressions. Content owners own media/copy
costs. Release engineering owns promotion/rollback. Platform operations owns field
ingestion, service objectives, capacity, and alerts.

Exceptions must name the failing metric/case, measured value, reason, affected
audience, owner, mitigation, and expiry. A release record shows the exception;
neither the raw result nor baseline is rewritten to conceal it. Budget or harness
changes receive the same review as the code they would permit to ship.

The harness is complete for the POC only when it reliably passes good fixtures,
rejects seeded regressions, produces reproducible reports, and gates every required
visitor/editor case. Field and service-capacity readiness remain separately visible
pilot requirements.
