# S2A Authoring and Delivery Platform: POC to Adobe.com Scale

Status: phase-1 engineering spike implemented; design inventory and author-baseline signoff remain open.
Updated: September 14, 2026. Demo deadline: November 27, 2026.

## Implementation Update

The POC now lives in this monorepo at [apps/authoring-poc](../../apps/authoring-poc/README.md).
It includes a Vite/Lit editor, actual S2A QuoteCard/carousel rendering in an isolated
preview, nested slide/CTA editing, local drafts with conflict protection, undo/redo,
JSON import/export, responsive assets and executable quality/performance checks.
Main and PR GitHub Pages workflows stage it beside Storybook under `authoring/`,
with the reusable quality workflow gating the combined deployment. No second
repository, live CMS or new backend is needed for this phase; no remote deployment
has been performed in this implementation session.

The source census is now 39 components and 33 schema-accepted specs: QuoteCard and
SocialProofCarousel specs were added and Surface's nullable role was corrected.
Source/spec validity is not Figma parity. The machine-readable inventory preserves
all four page references, section-family classifications and the BizPro exception.
The official Figma metadata connection verified all four roots and named sections
after Desktop Bridge returned `Transport closed`. It also distinguishes the hidden
older What's New branch from the visible MediaCard branch on Home. Opaque-instance
descendants, paint/assets, motion and detailed component parity still need review;
metadata alone is not a completed leaf audit. Real Milo and representative-author baselines also
remain pending. Do not mark the entire first milestone complete on code evidence alone.

## 1. Outcome

Create a system in which governed tokens, component contracts, reusable page
sections, visual authoring, and continuously measured delivery work together.
The long-term target is the breadth of adobe.com: many products, markets,
languages, authoring teams, shared experiences, and high-volume visitor traffic.

The selected direction is **an S2A-designed visual authoring experience and section
recipes; Vite/Lit for the standalone editor; AEM Sites content management and Edge
Delivery Services (EDS) for the production path, retaining established CDN
infrastructure**. Universal Editor is the preferred production integration candidate
only if it passes the experience acceptance gate below. The custom editor remains
the reference experience and the fallback production shell; CMS and delivery
choices do not determine the quality or appearance of that shell.
This is a technical recommendation, not a claim about Adobe's current internal
deployment or a platform decision already approved by the Milo team.

The November deliverable is a working four-page demonstration plus an executable
quality/performance harness. It establishes the architecture and measurable
benefits. Global production readiness requires the later integration, operational,
and rollout gates in this plan.

Adobe already documents visual component editing, property panels, and enterprise
content management with Universal Editor/AEM Sites. Production adoption should
reuse those capabilities where they meet the required experience. The pitch is
S2A's visual language, intuitive authoring, governed composition, reliable
contracts, faster authoring, and measured quality.
([AEM authoring](https://www.aem.live/docs/aem-authoring))

## 2. Scope and Verified Baseline

### November deliverables

- Four editable fixtures: Homepage, BizPro, CPro hub, and CPro offer.
- Section picker, generated property controls, nested repeaters/slots, reorder,
  duplicate/remove, undo/redo, autosave, import/export, and responsive preview.
- Actual S2A source components and tokens in an isolated preview document.
- Separately built visitor pages with readable initial HTML, working enhancements,
  responsive media, and no editor dependencies in the visitor entry point.
- Contract, behavior, accessibility, visual, and performance checks from the first
  working slice, including deliberately broken fixtures that prove checks fail.
- A shareable demo, reproducible reports, a timed authoring comparison, and a
  production integration proposal with explicit remaining gates.

Live SharePoint/DA/AEM integration, real customer data, SSO, multi-user editing,
production migration, and full Milo block coverage belong to the pilot. Content
interchange formats and offline adapter fixtures are in scope now. An available
AEM sandbox can enable an earlier integration experiment; the demo does not depend
on external access being granted.

### Evidence, September 11

Repository snapshot: `2a45e29d`, with pre-existing working-tree changes. Counts
describe this checkout/tool response, not production adoption.

| Area             | Verified state and planning consequence                                                                                                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Milo authoring   | `context/milo/fstab.yaml` mounts SharePoint. It does not establish every workflow across adobe.com.                                                                                                                                 |
| Shared design    | `context/milo/libs/styles/styles.css` contains shared color, spacing, typography, and layout variables. Remove the claim that Milo has no shared design foundation.                                                                 |
| Milo performance | Preflight has checks under `context/milo/libs/blocks/preflight/checks/performance.js`; Milo's package includes Lighthouse. Build on that investment during integration.                                                             |
| Block count      | Local directories: 120 core plus 33 C2. Inventory deployable capabilities before putting a block count in the pitch.                                                                                                                |
| S2A coverage     | Live MCP: 39 components, 30 accepted specs. Disk: 31 spec files. Surface's `a11y.role: null` conflicts with the current string schema; it also uses a different Figma ID field. A present file is not necessarily a valid contract. |
| Distribution     | `packages/components/scripts/build-components.js` includes only Button, Tabs, JumpLink. It removes CSS imports from already dependency-free code; it does not compile arbitrary Lit components.                                     |
| Rendering        | The catalog mixes Lit templates, DOM factories, and separately initialized controllers. Explicit adapters and lifecycle work are required.                                                                                          |
| Spec validation  | Sampled Button: 17 issues; RichContent: 7. Some are token-binding format and Figma/code naming mismatches. Reconcile contracts before treating every result as a rendering defect.                                                  |
| Validators       | `packages/validators/` exists. Complete its MCP/eval integration instead of creating another validator library.                                                                                                                     |
| Evals            | `evals/demo.ts` demonstrates scorers; its complete summary comes from the spec itself. Bento visual checks exist but need stricter failure and evidence handling for release use.                                                   |
| Telemetry        | `apps/s2a-telemetry-collector/` is an MCP usage POC with one global Durable Object. It is not a global visitor RUM platform.                                                                                                        |
| Hosting          | Existing GitHub Actions publish Storybook and PR previews. Reuse this pattern for approved demo fixtures.                                                                                                                           |

Follow [the workflow primer](../workflows/figma-to-code-workflow.md),
[token guardrails](../guardrails/no-primitives-in-components.md), and
[eval discipline](../evals/eval-discipline.md). The referenced `docs/north-star/`
and `story-ui-docs/` directories are absent here; do not invent their contents or
present this plan as approved company strategy.

## 3. Selected Architecture

| Decision               | Selection                                                                                   | Reason                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POC stack              | `apps/authoring-poc/`, Vite, TypeScript, Lit                                                | Matches existing components and Storybook; wrap current JavaScript without a library-wide rewrite.                                                         |
| Production authoring   | S2A experience over AEM content; Universal Editor subject to UX gate, custom shell fallback | Reuse enterprise capabilities without assuming their default UI meets the intended experience. Validate write/workflow integration for the selected shell. |
| Interchange            | Versioned `PageDocument` and typed section recipes                                          | Content/layout intent stays independent of framework objects and CMS storage format.                                                                       |
| Visitor runtime        | Semantic HTML, extracted CSS, selective ES module enhancements                              | Content renders before enhancement code; authoring outages do not stop delivery.                                                                           |
| Production delivery    | EDS and the established CDN                                                                 | Integrate with existing delivery and operations rather than replacing them for the POC.                                                                    |
| POC persistence        | IndexedDB draft adapter plus JSON import/download and committed fixtures                    | Structured drafts and local recovery; clearly distinguish local save from a shared release.                                                                |
| Production persistence | AEM revision through a content-store adapter                                                | One authoritative content store; no parallel primary database requiring dual writes.                                                                       |
| Preview                | Isolated iframe plus standalone full-page preview                                           | Correct viewport media queries, root themes, fonts, and scroll behavior.                                                                                   |
| Assets                 | Versioned manifest now; AEM Assets/DAM adapter in production                                | Stable IDs, responsive renditions, locale variants, and dependency tracking.                                                                               |
| Publishing             | Immutable release, checks, then promotion                                                   | Reproducibility and rollback of content, code, and assets together.                                                                                        |
| Performance            | Lighthouse CI, Playwright/CDP, `web-vitals`; k6 for pilot capacity                          | Different tools cover loading, interactions, field outcomes, and backend throughput.                                                                       |
| CI                     | Nx targets through GitHub Actions; controlled performance runners                           | Repository consistency and comparable measurements.                                                                                                        |
| Production telemetry   | Existing EDS/Adobe operational telemetry, extended with release/recipe attribution          | One supported measurement path instead of duplicate browser collectors.                                                                                    |

EDS supports existing CDN infrastructure and multiple content sources. Preserve
that separation of responsibilities.
([EDS architecture](https://www.aem.live/docs/architecture))

```text
Figma + governed tokens + component specs
                  |
        Versioned section registry
        /                       \
S2A editor                 Universal Editor adapter (if UX gate passes)
        \                       /
             PageDocument projection
                      |
          Validation + asset resolution
                      |
          Preview / publishing adapter
                      |
       Immutable release -> gates -> promotion
                      |
       Demo hosting / production EDS + CDN
                      |
       Synthetic checks + field data + rollback
```

The production PageDocument is a validated projection of the authoritative CMS
revision. Editing adapters write through revision checks; it is not a second
content database.

### Rendering and packaging

1. Registry entries identify Lit templates, DOM factories, decorators, CSS/assets,
   dependencies, and controllers. Do not assume a common export or return type.
2. The editor preview invokes actual source APIs through typed adapters.
3. Use Playwright build-time prerendering for the four standalone demo pages:
   render in a controlled browser, wait for explicit readiness, serialize HTML,
   and emit the exact dependency/asset manifest. This supports current DOM and Lit
   APIs without pretending the existing package build provides SSR.
4. Separate construction from enhancement. Serialization loses listeners; each
   interactive section needs `mount/update/dispose` against existing HTML. Refactor
   only required components and test parity where an adapter needs different markup.
5. Visitor bundles load only required enhancements. They exclude the editor,
   Storybook, picker, MCP, and a second hidden client render of the full page.
6. The production adapter uses EDS authored semantic block HTML and S2A decorators.
   Prove actual publish/output parity in the pilot. Browser prerendering is a
   bounded POC compatibility approach, not an assumed global publishing engine.

Initial-HTML checks cover headings, copy, links, navigation, CTAs, and the LCP asset
with JavaScript disabled. Essential content must survive enhancement failure.
Controllers attach without replacing the entire document or losing focus.

Do not put experimental SSR on November's critical path. Lit SSR can be evaluated
behind the render adapter later; its documented Lit Labs status and compatibility
limitations require a separate assessment, especially for DOM factories.
([Lit SSR](https://lit.dev/docs/ssr/overview/))

## 4. Content and Authoring Contracts

### PageDocument v1

Selected structure, with illustrative IDs/copy:

```json
{
  "schemaVersion": 1,
  "id": "home",
  "revision": "draft-12",
  "locale": "en-US",
  "market": "us",
  "path": "/us/",
  "theme": "dark",
  "metadata": { "title": "Adobe", "description": "Approved description" },
  "registryVersion": "poc-1",
  "sections": [
    {
      "id": "social-proof-1",
      "type": "social-proof-carousel",
      "version": 1,
      "props": { "label": "Customer stories" },
      "items": [
        {
          "id": "quote-1",
          "type": "quote-card",
          "version": 1,
          "props": {
            "quote": "Approved customer quote",
            "attributionName": "Customer name",
            "image": { "assetId": "portrait-1", "alt": "" }
          },
          "slots": {
            "actions": [
              {
                "id": "quote-cta-1",
                "type": "link-action",
                "version": 1,
                "props": { "label": "Read story", "href": "/us/story/" }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

Store JSON values and stable IDs, never functions, DOM nodes, Lit results,
executable expressions, arbitrary CSS, or unvalidated HTML. Metadata also supports
canonical URL, robots, social preview, language alternates, and appropriate
structured data. Rich text uses a constrained structured model, rendered through
trusted code with URL and element validation.

### Registry rules

- Keep `spec.json` as the component implementation contract. Add companion section
  `authoring.schema.json` files using JSON Schema 2020-12 and Ajv. Validate strict
  types and unknown fields before rendering or persistence.
- Generate scalar types/defaults/enums from valid component contracts. Authoring
  definitions add labels/order, asset/link/action types, typed repeaters, named
  slots, allowed children, and field visibility conditions.
- The picker offers approved sections such as hero, news grid, or product router.
  Atoms are edited within recipes; arbitrary placement is not the default workflow.
- Registry adapters convert action/asset/slot values to existing component props.
  Hide callback props and forced visual states from authors. Define explicit
  Figma-axis-to-code mappings instead of requiring identical naming.
- Parse legacy string-encoded defaults structurally; never evaluate JavaScript.
  Unsupported defaults require an explicit authoring default.
- Initial limits: 2 MiB document JSON, 100 sections, 50 repeated items per section,
  depth 8. These are chosen POC limits, not measured adobe.com characteristics.
- Unknown versions block publication and remain recoverable. Migrate a copy with
  recorded history; retain the original. Duplicate IDs and cyclic references fail.
- Shared fragments and product/offer references resolve to pinned revisions at
  publication. Missing dependencies and invalid links block release.

### What authors actually use

Authors use a browser-based visual page editor designed around the S2A experience
requirements below. The POC uses our Vite/Lit app. Production uses an extended
Universal Editor only if it meets those requirements; otherwise the S2A app remains
the author-facing shell with an AEM content/workflow adapter. Authors do not write JSON, HTML, CSS, or
Lit. The JSON contract is how the system validates and exchanges their work.

| Author action          | Visible UI                                                       | Stored content                                            |
| ---------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| Create page            | Page type, name, URL, language, market                           | Page identity, metadata, locale/market, registry version. |
| Add hero               | Section picker and live preview                                  | Hero recipe and permitted properties.                     |
| Write copy             | Headline, body, constrained rich text                            | Text and allowed semantic formatting.                     |
| Choose imagery         | Asset picker, alt/decorative controls, focal point               | Asset ID, rendition policy, locale, alt text/focal point. |
| Add cards/quotes       | Add-item controls inside grid/carousel                           | Typed repeated items with stable IDs.                     |
| Set CTA                | Label and internal page/product/offer reference or external link | Structured validated action, not a callback.              |
| Change layout          | Approved variation, alignment, density, theme                    | Recipe/token choices, not freeform CSS.                   |
| Use shared information | Legal/footer/catalog selector                                    | Owned reference pinned at publication.                    |
| Preview and submit     | Device preview, validation, review/publish action                | Draft/revision/workflow state, then an immutable release. |

For example, a product marketer selects a Product page starter, adds a Hero and
Product Grid, writes a headline, selects images and three product IDs, edits CTA
labels, previews mobile, and submits for review. Recipes supply responsive layout,
semantics, and performance-sensitive defaults. Pricing comes from the approved
offer integration, not separately entered copy that can drift from checkout.

Page type controls available sections. Authors compose approved recipes; the
design-system team creates new recipes; shared navigation, legal, and commerce
retain their respective owners. Validation identifies the affected field and
remedy. Autosaving a draft does not make it public.

POC drafts live in IndexedDB and can be exported. Production drafts, approvals,
and revisions live in AEM; assets live in the DAM. The publishing adapter produces
visitor HTML, so the authoring database is not queried on every visitor request.

### Editing implementation and preview

The first spike must edit a QuoteCard **and a three-slide carousel with CTA slots**,
then insert/remove/reorder slides, undo, export, reload, and change theme/viewport.
A scalar form alone does not satisfy it.

Use operation-based history and stable IDs. Preserve selection and focus on
updates; debounce draft writes; surface save errors/quota exhaustion; prevent a
second tab from silently overwriting a newer revision. Reorder has keyboard/move
controls as well as drag. Imports produce field errors without losing the draft.

Preview widths are 390, 768, 1024, 1440, and 1920 CSS pixels, with extra boundary
tests at actual component breakpoints. Scale the displayed frame without changing
its internal viewport. Set theme on the preview document root and share an explicit
token/font/reset entry with visitor rendering, not Storybook's documentation setup.

Use a versioned frame message protocol with revision, operation ID, validated
payload, acknowledgement/error, origin/source checks, and stale-update rejection.
Update affected sections only. `mount` is idempotent; `dispose` removes listeners,
observers, timers, and media activity. Unrelated text edits must not restart video.

### Visual language and author experience requirements

Public-page design and editor usability are independent acceptance dimensions.
Both receive deliberate interaction/visual design work from Week 1. Technical
component reuse or an attractive final screenshot is insufficient to establish
either an intuitive workflow or a polished moving experience.

| Experience               | Required behavior and design                                                                                                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public visual language   | Art-directed typography, responsive composition, inspectable product imagery, coherent light/dark treatment, and rich media matching the four Figma pages. New section designs can be added without replacing the platform. |
| Public motion            | Choreographed transitions, card expansion, carousel movement, and purposeful scroll-linked sequences where designed. Motion responds to interaction and device capabilities while preserving readable initial content.      |
| Editor workspace         | Canvas-led layout, clear hierarchy, searchable visual section library, contextual controls, predictable navigation, restrained chrome, and complete loading/empty/error/save states.                                        |
| Direct manipulation      | Select content on the canvas, edit supported text inline, reorder with visible insertion feedback, duplicate, and move repeated items without losing selection or focus. Keyboard equivalents are required.                 |
| Properties               | Human labels, appropriate field widgets, logical grouping, progressive disclosure, visual asset selection/cropping, and relevant options. Generated forms are intentionally designed, not a dump of every developer prop.   |
| Motion authoring         | Preview approved motion presets, select supported variants, pause/replay, and compare reduced motion. Designers own the choreography; authors can use it without writing animation code.                                    |
| Confidence and recovery  | Visible save state, undo/redo, version recovery, relevant validation, reliable preview, and an understandable submit/publish workflow.                                                                                      |
| Production collaboration | Existing review/approval integration, comments/version comparison, ownership, and conflict handling. Integrate these during the pilot; do not imply they exist in the local-only POC.                                       |

Example: an author drops a Social Proof section into the page, clicks the quote to
edit it, chooses a portrait in the asset picker, reorders three slides, selects the
approved slide transition, and uses Preview to play it at mobile width. Returning
to Edit restores the selected slide and pauses automatic movement. They can undo
the reorder without restarting the page or re-entering copy.

Use separate Edit and Preview modes. Edit keeps selection targets stable and pauses
automatic carousels/video and nonessential scroll choreography. Preview runs the
real visitor behavior with pause/replay controls. Device preview uses the actual
viewport and rendered assets, not a scaled screenshot. Motion presets carry IDs,
versions, permitted triggers, timing/easing tokens, reduced-motion alternatives,
and performance/behavior fixtures in the registry.

Authors can create differentiated pages through section variants, combinations,
assets, themes, and approved motion. Designers can introduce new recipes and motion
packs as versioned additions with the same release checks. The initial catalog is
a starting point, not a permanent ceiling on the site's visual language. Arbitrary
per-page scripts/CSS are not the mechanism for extending the design system.

Reduced-motion support is a project requirement, including for nonessential
interaction-triggered effects. Continuous automatically moving content gets
appropriate pause controls. These capabilities preserve expressive design for
people who want it while providing an equally usable alternative. WCAG's animation
from interactions criterion is AAA; do not mislabel it as a blanket AA obligation.
([W3C animation guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
[pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html))

### Production editor experience gate

The prototype establishes the intended workflow and visual reference first.
Universal Editor is evaluated against it, not treated as proof that the authoring
experience is already solved. Adobe documents header, properties rail, modal, and
custom field extension points; those do not establish unrestricted replacement of
the full editor. Current documentation also lists restrictions on field conditions
inside repeatable containers, relevant to the nested authoring spike.
([extension points](https://developer.adobe.com/uix/docs/services/aem-universal-editor/api/),
[customization limits](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/customizing))

By Sep 25, record supported extension/API paths and demonstrate the critical tasks
in a sandbox where available: inline edit, nested repeaters and conditional fields,
asset selection, reorder/undo, stable Edit mode, live motion Preview, and revision
save/recovery. Compare with the S2A prototype using the same fixture and author task.
If access is unavailable, mark fit unverified; no claim of equivalence is made and
the custom editor continues as the POC/reference.

Select Universal Editor for production only when every required task has a working,
supported implementation, acceptable UI fidelity, and meets the same usability and
responsiveness gates. Do not rely on unsupported editor CSS overrides or promise
extensions that have not been tested. If it fails, keep the custom Vite/Lit shell
and validate an AEM write/revision/workflow adapter during the pilot. Headless reads
alone do not prove custom authoring writes and approvals can be integrated.

An owned production editor requires additional product design, integration, QA,
accessibility, and maintenance capacity. Re-estimate the pilot accordingly; the
four-page POC remains the November deliverable. Final shell selection is required
before production author onboarding or migration handoff.

### Experience acceptance evidence

- Week 1: designed editor workspace and one complete interaction flow using real
  components/assets, plus visual/motion references for the flagship page sections.
- Week 2: working inline quote edit, asset replacement, slide reorder/undo, and
  motion preview; designer review against the reference and author task testing.
- Every required recipe: default, hover/focus, expanded, loading/error, responsive,
  and motion states as applicable; check the actual transition, not just endpoints.
- By Nov 6: the five-author task study includes ease and confidence ratings. At
  least four authors complete unassisted, median ease is >= 6/7, and no recurring
  critical usability issue remains. Record sample limitations and observed failures.
- Release candidate: design owner approves public-page and editor fidelity; the
  behavior/performance harness passes; no visual score compensates for task failure
  or a performance score for missing motion/content.

## 5. Four-Page Coverage

CPro Figma file: `qAF4nlt6O4ThbeXeO7jzdb`. Structural notes below come from the prior
investigation, not a fresh leaf-level audit. Week 1 captures every section's node,
copy/assets, responsive behavior, implementation, owner, and acceptance fixture.

| Page / node                 | Required sequence                                                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage / `12102:175099`   | Nav; Hero; Hub Router; full-width What's New; three-column What's New; Social Proof; News; Product Router hero/wide rows/product grids; Agentic Search; Footer. |
| BizPro / `11333:235687`     | Hero; routing carousel; unresolved Offer; Flow - Grid to UI; two What's New rows; Hub Merch; Product Router/Footer.                                             |
| CPro hub / `12164:44174`    | Hero; two content sections; populated Offer; Globe raster section; Typographic Social Proof; LG Photo Dark; Use Case.                                           |
| CPro offer / `13027:189173` | PromoCTA; Hero/Nav; RichContent/JumpLink; nested merchandising/social proof; Agentic/Footer. Resolve wrappers before fixture lock.                              |

| Section                  | Reuse                                                   | Explicit remaining work                                                                                                              |
| ------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Nav                      | Logo, Button, Link, existing patterns                   | New governed nav/mobile section; no registered `Nav` today. Production targets existing Federal/global navigation.                   |
| Hero                     | RichContent, Media, Button, ProductLockup               | Layout recipe, H1, responsive asset priority; RouterMarquee only where the design matches.                                           |
| Hub Router               | HubRouter, ElasticCard, SectionHeader, Media            | HubRouter spec, repeater model, keyboard/touch/reduced-motion behavior, verified motion mapping.                                     |
| Social Proof             | SocialProofCarousel, QuoteCard, IconButton              | Carousel/quote specs, editable slides/CTAs, controller lifecycle, motion/a11y.                                                       |
| What's New               | Candidate Bento/MediaCard/TextCard compositions         | Verify design mapping; one/two-row layouts; TextCard spec if used.                                                                   |
| News                     | Candidate TextCard/MediaCard and Link                   | Editorial section recipe, heading structure, content model.                                                                          |
| Product Router           | ProductCard, AppIcon, ProductLockup, RichContent, Media | ProductCard and any RouterMarquee/RouterNavItem specs; hero/wide/grid recipes and product references.                                |
| Hub Merch                | Candidate MerchCard, RichContent, actions               | New section matching the Figma design, contract, and story.                                                                          |
| Typographic Social Proof | Typography tokens/content primitives                    | New section distinct from the QuoteCard carousel.                                                                                    |
| Flow - Grid to UI        | Media and section recipe                                | Approved product imagery/video, not a newly implemented collaboration/invoicing app.                                                 |
| Globe/photo/use case     | Media and verified layouts                              | Preserve raster sources as content; do not claim screenshots are interactive UI.                                                     |
| Offer                    | MerchCard and approved fixtures                         | Use verified CPro offer copy. Omit the empty BizPro Offer in the initial fixture and record the design exception; invent no pricing. |
| Agentic Search           | New search section                                      | Deterministic fixture-backed search labeled as demo behavior; real search/AI is a separate service.                                  |
| Footer/region nav        | Logo, Link, ProductLockup                               | New section contracts and mobile disclosures; retain existing production ownership.                                                  |
| PromoCTA/JumpLink        | Existing components                                     | Anchors, designed sticky behavior, source/spec parity, viewport tests.                                                               |

Create a machine-readable inventory with `verified-reuse`, `needs-spec`,
`needs-adapter`, `new-section`, `design-exception`, or `unverified` per leaf. All
four fixtures must be supported at release candidate; Homepage gets the main demo
slot, not a weaker quality requirement for the other pages.

### Content and motion

Asset records include stable ID, source/Figma node, hash, dimensions, mime type,
alt/decorative intent, focal point, renditions, poster, locale, and approved usage.
Verify existing Storybook assets and concrete Milo/S2A media URLs before reuse.
Do not claim all source references are placeholders or rely on expiring Figma URLs.
Optimize/export assets repeatably. Video requires actual media and a poster;
a Figma still is not a motion source.

For Hub Router, Social Proof, carousel entrances, and RouterMarquee, specify
trigger, state, sequence, duration, pause, and reduced-motion alternatives.
Keyframe counts are not acceptance criteria. Touch/keyboard must work without
hover. Pause offscreen/hidden-tab media, reserve dimensions, and avoid downloading
every carousel video before interaction.

## 6. Quality and Performance as Release Gates

The companion [performance harness plan](milo-v2-performance-harness-plan.md) defines
tools, budgets, profiles, datasets, statistical rules, results, CI cadence, field
monitoring, service capacity tests, and rollback thresholds.

| Layer         | Required evidence                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Contracts     | Schemas, composition, variants, assets/links, migrations, independent source/API conformance.                                   |
| Tokens        | Existing shared validators, documented `Primitive:` exceptions, resolved shipped tokens, normalized token/Figma mappings.       |
| Behavior      | Editing/persistence/recovery; controller disposal; published navigation, CTAs, and failure states.                              |
| Accessibility | Playwright/axe, keyboard/focus, headings, reduced motion, zoom/reflow; manual assistive-technology review before pilot rollout. |
| Visual        | Exact viewport/theme and approved assets/fonts; separate Figma parity from browser regression thresholds.                       |
| Performance   | Loading, interactions, scrolling/media, large editor documents, transfer budgets, field CWV.                                    |
| Publishing    | Initial HTML, complete dependencies, immutable manifest, promotion/rollback, correct assets, no editor code in visitor bundles. |

Public field targets: p75 LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1, segmented by
device and critical audience cohorts. These match current Core Web Vitals good
thresholds. CI uses tighter project budgets; Lighthouse navigation does not measure
INP. ([Web Vitals](https://web.dev/articles/vitals))

The first gate must detect deliberately oversized media, blocking scripts, layout
shifts, and broken controllers. Missing results and empty selections never pass.
Content, asset, token, and third-party changes trigger checks, not only code edits.

## 7. Execution to November 27

Staffing assumption: two implementation engineers, design/content support around
0.5 FTE, performance/QA support around 0.5 FTE, and named Milo/AEM counterparts.
These are required roles, not confirmed assignments. With one engineer, re-estimate
four-page delivery after Week 1 while retaining architectural and quality gates.

Assign named owners at kickoff. The lead owns contracts/rendering; authoring
engineering owns UI/persistence; QA/performance owns the harness; design/content
owns fixtures; the platform liaison owns integration and production requirements.
Design/content capacity explicitly includes product/interaction design for the
editor, not only page copy and asset collection. Complete the experience checkpoints
above alongside the dated technical milestones; polish is not deferred to November.

| Dates        | Deliverables                                                                                                                             | Exit gate                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sep 11-18    | Inventory/spec reconciliation; Figma leaves/assets; registry/Nx boundaries; editor/preview spike; task and page baselines.               | Every section classified; BizPro exception recorded; nested carousel edit/save/reload works; first negative performance fixture fails correctly. |
| Sep 21-25    | Repeaters/slots/history; initial HTML and controller lifecycle; offline Universal Editor definitions/models/filters; first hosted slice. | CTA/carousel work from serialized HTML; JS-disabled content passes; isolated preview and versioned baseline/head reports.                        |
| Sep 28-Oct 9 | Full picker/editing/recovery; nav/hero/news/footer recipes; Homepage and shared product router.                                          | Homepage built through UI, reload fidelity, mobile/desktop checks and budgets pass; visitor bundle excludes editor.                              |
| Oct 12-23    | Hub Merch and Typographic Social Proof; finish BizPro/CPro pages; assets/motion; stress and pseudo-localized fixtures.                   | All four pages editable; required recipes have valid contracts, stories, lifecycle, and quality/performance cases.                               |
| Oct 26-Nov 6 | Media/performance/accessibility hardening; repeated editing; dependency failures; rollback; nightly matrix; author task study.           | No unowned critical failures; task study completed; reports attribute failures; rollback drill succeeds.                                         |
| Nov 9-13     | Release candidate; comparison recording/deck; capacity model; production integration backlog and operational draft.                      | Four fixtures pass; content frozen; equivalent comparison content; explicit production gates.                                                    |
| Nov 16-20    | Rehearsals, independent author trial, device checks, contingency recording.                                                              | Two complete live runs without blocking failure; save/reload and visitor checks for every fixture.                                               |
| Nov 23-27    | Buffer and presentation; rehearse by Nov 24 to avoid reliance on US holiday availability.                                                | Demo/report/deck and fallback release accessible; no new features.                                                                               |

### First ten working sessions

1. Record versions, tool access, Figma evidence, fixture exceptions, and owners;
   reproduce spec coverage discrepancies.
2. Normalize required contracts and shared validation; add negative cases and
   authoring schemas for QuoteCard and carousel slides.
3. Implement PageDocument, assets/actions, registry, strict validation, migration
   boundaries, and JSON round-trip cases.
4. Scaffold Vite/Lit editor and iframe; generate scalar/repeater/slot controls;
   render one QuoteCard and a three-slide carousel.
5. Implement lifecycle adapters; measure edits and test slide removal, repeated
   updates, keyboard navigation, and reduced motion.
6. Add drafts/history; test invalid imports, second-tab conflicts, duplicate IDs,
   quota errors, and crash/reload recovery.
7. Emit standalone initial HTML and selective enhancements; verify usable content
   without JS and full interactions with JS.
8. Wire Nx quality/performance targets, pinned profiles, paired baseline checks,
   result artifacts, and deliberately bad fixtures.
9. Host the slice using the existing preview deployment pattern; check subpath
   assets/fonts and performance on the direct visitor page.
10. Review the complete slice with design/authors; re-estimate missing sections and
    adapter effort using actual throughput, with every remaining item owned.

### Usability and comparison

Use five representative authors and identical approved copy/assets. Task: start a
page, add hero/cards/quote, edit a CTA, reorder, preview mobile, save/reload, and open
the visitor page. Record time, errors, assistance, and recovery against the actual
current workflow. Target: at least four finish unassisted within five minutes,
no lost content, and median time improves at least 30%. This is directional
usability evidence, not a statistically representative study.

The under-one-minute presentation beat is a smaller rehearsed insert-and-edit
task, labeled accordingly. Secure a real baseline authoring example in Week 1;
finish the shareable recording and deck by Nov 13.

## 8. Production Pilot and Global Adoption

### Stage A: one product and market, approximately 6-8 weeks after POC acceptance

- Use an owned AEM sandbox/EDS preview environment. For a selected Universal Editor
  integration, generate definitions/models/filters and preserve its instrumentation
  during DOM decoration.
- Complete the editor experience gate. If the custom shell is selected, prove its
  authenticated content-write, revision, and workflow integration before onboarding
  production authors; Universal Editor-specific artifacts become an optional adapter.
- Prove one complete page: edit -> preview -> publish -> rollback -> export,
  including repeaters, assets, shared content, and revision equivalence.
- Integrate SSO/RBAC, approvals/audit history, DAM, scheduling, translation,
  preview access, and optimistic concurrency through established services.
- Preserve Federal navigation, consent, identity, commerce, and search ownership.
  S2A supplies typed integration contracts and measured UI.
- Shadow-publish before routing real traffic. Canary by route/product/market only
  after functionality, field performance, operations, and business measures pass.

Universal Editor integrations require component definitions/models/filters and
preservation of `data-aue-*` attributes when mutating DOM. Treat those as concrete
adapter deliverables. ([Universal Editor blocks](https://www.aem.live/developer/universal-editor-blocks))

### Stage B: several products and locales, approximately 8-12 additional weeks

Add locale/market inheritance and explicit overrides, translation status, shared
fragment ownership, offer/product service bindings, RTL, CJK fonts/line breaking,
locale-correct formatting/links, canonical/hreflang, redirects, and sitemaps.
Preserve URLs during migration. Extend to structurally different page families.

Central owners govern tokens, contracts, release policy, and budgets. Product teams
own recipes/content within those limits. Breaking versions need tested migrations,
a support window, and usage evidence. Global chrome/token changes trigger broad tests.

### Stage C: global rollout, sized after pilot evidence

Migrate by page family and market with independent routing and rollback. Keep
supported legacy blocks behind adapters until usage is empty and replacements are
verified. Plan content operations, localization, accessibility, security, analytics,
commerce/search integrations, release engineering, and on-call staffing as part of
the platform, not as unfinished work after a frontend launch.

### Migrate all existing pages and retire Milo

The end state is that migrated routes are edited in the new system and served by
the S2A delivery path with no Milo runtime dependency. Retaining EDS or an
independently supported Federal navigation service does not mean retaining Milo.
A temporary legacy adapter is migration debt, not a completed migration.

Two conversions are required: authored documents become structured AEM/S2A
content, and Milo blocks/decoration/integrations become supported S2A sections and
delivery adapters. Changing tokens or copying rendered HTML completes neither.

The submodule holds code and fixtures, not the complete site's authored content.
Inventory actual SharePoint documents, DA content, AEM repositories if used,
assets, fragments, redirects, and publish metadata. A public crawl supplements
exports but cannot recover drafts, approvals, full history, or all targeting rules.

| Phase                     | Implementation and evidence                                                                                                                                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inventory                 | Reconcile sitemaps, source exports, analytics, routing data, and crawl. Record canonical URL, locale/market, source/revision, owner, block variants, fragments, assets, integrations, traffic, and last update. Include active unpublished drafts separately. |
| Disposition               | Owners assign migrate, consolidate, intentionally retire, or investigate. Preserve migrated URLs; consolidation/retirement uses explicit redirect/status policies. Unclassified pages cannot disappear from totals.                                           |
| Map                       | Versioned rules convert block name/variants/authored rows/metadata into recipe props/items/slots, including section metadata, headings, anchors, responsive media, offers, forms, analytics, consent, and experiments.                                        |
| Convert                   | Parse source exports or undecorated authored HTML with structured parsers. Emit PageDocument, asset/reference map, conversion log, and unresolved items; preserve the original revision. Decorated browser DOM is a last-resort source.                       |
| Resolve exceptions        | Unknown variants, scripts, ambiguous layouts, assets, and business rules enter an owned queue. Build reusable replacements or make explicit editorial decisions; never silently flatten to screenshots or opaque HTML.                                        |
| Import and shadow-publish | Import into nonpublic AEM, resolve dependencies, publish to preview, compare content/behavior/metadata/visuals/performance, and verify author editability.                                                                                                    |
| Switch batch              | Reconcile the final source delta, hand off editing ownership, then change CDN/origin routing. Preserve the public URL and run canary/field checks.                                                                                                            |
| Retire                    | After observation, remove the route's legacy dependencies. Remove shared blocks/services only after dependency inventory and telemetry show zero consumers.                                                                                                   |

Migrate shared dependencies and platform integrations first, then a representative
low-risk but nontrivial page family in one market. Expand across families/locales
with proven mappings, followed by high-traffic and custom cases. Track both traffic
and structural coverage so the long tail remains owned.

The default conversion preserves approved content, URLs, information architecture,
and business behavior. Treat redesign as an intentional separate change with
updated visual expectations. Authors review exceptions rather than rebuilding
every page manually; rules apply across page families.

### Migration runner and acceptance

Build an idempotent runner with source adapters, block-to-recipe transforms, asset
import, dependency resolution, dry runs, target writes, checkpoints, and revision-
aware delta imports. Source key plus revision identifies the conversion; repeated
runs must not duplicate pages or assets. Use proven document/HTML parsers and
preserve rich text and link relationships instead of string replacements.

Before bulk import, curate at least 30 representative pages across block families,
locales, metadata patterns, and integrations; extend until every known mapping and
high-risk exception has coverage. Add malformed/ambiguous sources that must be
rejected. AI may propose mappings for review; unattended conversion uses tested,
versioned rules and flags ambiguity rather than guessing.

Every migrated page requires:

- Reconciliation of text, links, assets, section order, metadata, shared references,
  locale, and all intentional differences against its source revision.
- Correct canonical URL, query/anchor behavior, redirects, hreflang, sitemap,
  robots, social metadata, and applicable structured data.
- Verified forms, purchases, identity, search, consent, experiments, and analytics;
  matching appearance alone is insufficient.
- Actual editing and republishing in the new editor. A frozen HTML blob or an
  embedded legacy block is not a fully migrated page.
- Passing accessibility, browser, visual, and performance checks on the candidate
  route; existing defects have explicit remediation/disposition.
- A resource/dependency scan showing no Milo loader, block bundle, shared CSS, or
  transitively imported utility for a route marked fully migrated.

Maintain a ledger: inventoried -> mapped -> converted -> validated -> author-
accepted -> switched -> observed -> legacy-retired. Report page counts and traffic
coverage, plus remaining block families, locales, exceptions, and owners. Account
for unsupported pages and drafts rather than excluding them from completion.

### Editing handoff and rollback

Existing sources remain authoritative until route handoff. Import source revisions
incrementally and resolve conflicts. Use a short per-batch editing freeze, import
the final delta, record old/new revision mappings, make that old source read-only,
and direct its authors to the new editor. Choose one active writer instead of
maintaining indefinite bidirectional synchronization.

Switch at the CDN/origin routing layer, not with browser JavaScript redirects.
Retain the old release/routing manifest during observation. If rollback is needed,
restore delivery and account for edits made since handoff: preserve new revisions,
pause publication, and reconcile before reopening old editing or switching forward.
Availability of old HTML alone does not establish a safe content rollback.

Retire a Milo capability only when no active route, authoring entry, fragment,
scheduled job, or runtime import consumes it; owners accept archival disposition;
the observation window is complete; and a restore drill passes. Use established
retention policies. Bulk repository/document deletion is not an automatic step.

Estimate the global date after inventory and measured pilot throughput: page count
by conversion class, automation rate, exception review hours, shared-block work,
locale QA, and owner acceptance capacity. A fixed deadline for all of adobe.com
without those inputs would not be credible.

### Capacity and service objectives

Actual traffic, content counts, author concurrency, and publish rates are unknown
here. Collect 28 days of peaks, audience mix, cache behavior, dependency traffic,
publish backlog, and incidents before capacity signoff. Meanwhile use this
**synthetic engineering envelope**, not as a claim about adobe.com:

| Dimension  | Chosen envelope                          | Design/test consequence                                                                         |
| ---------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Content    | 1 million page/locale/market variants    | Indexed dependency graph; incremental publishing, no whole-site rebuild for one page.           |
| Authors    | 500 active sessions, one save/10 seconds | 50 writes/s steady and 150 writes/s burst against pilot content APIs.                           |
| Publishing | 10,000 changed variants/hour; 30/s burst | Bounded workers, durable queue, idempotency, deduplication, retries/dead letters, backpressure. |
| Delivery   | Illustrative 10,000 edge requests/s      | Cached HTML/assets; test origin amplification and controlled cold-cache conditions.             |
| Editor     | 20 typical sections; 100 maximum         | Incremental rendering and measured history/persistence costs.                                   |

Before production, size for at least 3x the observed relevant peak, retaining the
larger synthetic envelope where applicable. Load tests use controlled staging and
agreed ceilings. They never imply authorization to load-test adobe.com itself.

Proposed pilot objectives: visitor availability >= 99.95% monthly, publish success

> = 99.9%, p95 approved-revision-to-visible <= 60 s under agreed steady workload,
> and p95 rollback visibility <= 5 minutes across regional probes. Confirm service
> limits/ownership before turning these targets into commitments.

### Publishing and resilience

- Pin content, registry, component/token versions, assets, and integration config
  in each manifest. Promote complete tested releases and retain prior artifacts.
- Prevent HTML from referencing unpublished/deleted assets. Verify rollback through
  the real CDN path. Test interrupted workers, duplicates, stale previews, asset
  failures, and failed invalidation.
- Cache keys explicitly cover locale, market, and bounded experiment variants.
  Prefer a cacheable base page with measured progressive personalization; avoid
  unbounded per-user full-page cache fragmentation.
- Keep authoring off the visitor critical path. Define fallback behavior for search,
  commerce, identity, consent, and telemetry failures. Fixture pricing never reaches
  an actual purchase flow.
- Use existing operational telemetry for production, not the MCP collector's
  one-global-object aggregation.

## 9. Ownership and Release Gates

| Risk                             | Required control                                                 | Owner               |
| -------------------------------- | ---------------------------------------------------------------- | ------------------- |
| Model cannot represent sections  | Nested carousel/CTA round-trip spike                             | Implementation lead |
| Mixed APIs break delivery        | Adapters, initial HTML checks, lifecycle/output parity           | Implementation lead |
| Design gaps expand scope         | Week 1 leaf inventory and recorded exceptions                    | Design/content      |
| Rich pages exceed budgets        | Asset presets, section costs, PR/publish gates, field alerts     | Performance owner   |
| False-green evals                | Negative fixtures, failure exit codes, missing-data handling     | QA owner            |
| POC differs from production      | Contract and fixture parity across rendering/publishing adapters | Platform liaison    |
| Content bypasses checks          | Candidate validation/performance before promotion                | Content operations  |
| Third parties regress UX         | Dependency inventory and consent/failure/latency scenarios       | Integration owners  |
| Global release amplifies defects | Version pins, limited canaries, rehearsed rollback               | Release owner       |
| Schedule exceeds staffing        | Evidence-based Week 1 estimate; retain quality gates             | Project lead        |

November is complete when all four supported fixtures can be authored/restored;
initial HTML and enhancements work; budgets and correctness checks pass; the
harness detects seeded regressions; comparison/demo artifacts exist; and pilot
requirements are explicit. A beautiful screenshot or a single Lighthouse score
does not satisfy the release gate.

## 10. Planned Locations and Working Rules

The application, local checks and workflow integration are implemented. The
package/eval extractions below remain proposed responsibility boundaries:

```text
apps/authoring-poc/             editor, drafts, preview, fixtures
packages/page-model/            schemas, migrations, registry types
packages/page-renderer/         composition, lifecycle, visitor entry
packages/publish-adapters/      demo output; AEM/EDS mapping and later integration
packages/components/src/        existing components and required scoped changes
packages/validators/            existing shared validation, completed wiring
evals/performance/              budgets, profiles, journeys, baselines, scorer
evals/authoring/                editing and persistence journeys
evals/datasets/                 page, asset, locale, and negative fixtures
.github/workflows/              quality, performance, preview, release gates
```

Keep modules together until a second consumer justifies a package. These are
responsibility boundaries, not a request for empty scaffolds. Reuse Storybook
stories/assets for build-time picker thumbnails rather than many live iframes.

Run builds/checks through Nx. The companion defines proposed commands; do not use
the nonexistent `npm run eval` as a current gate. Nx MCP tools were not exposed in
this planning session, so project files and official Nx documentation were used.

Before implementation/codegen, include the repository reminder:

```text
Guardrail reminder:
- Use semantic/component tokens only in generated CSS.
- If you *must* use a primitive token, add a comment starting with "Primitive:" explaining why.
- Point out primitive usages in your response so we can replace them during token maintenance.
```

See the application's README for executable Nx targets, measurement boundaries,
hosting instructions and remaining phase-1 signoff. The subsequent publishing,
four-page parity, integration and migration milestones remain planned work.
