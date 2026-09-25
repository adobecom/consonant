# S2A Homepage: Build and Gap Register

Reviewed against the WIP on 2026-09-14, then polished the same day against the
responsive Original Design Specs and fresh live-site evidence. This is a local
authoring POC, not an adobe.com replacement or a claim of complete Figma parity.

## Deliverable

- [Homepage reference](https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/?node-id=12102-175100)
  (1920 only, all-dark WIP)
- [Home — Original Design Specs, 9672:83669](https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/?node-id=9672-83669):
  responsive frames `8278:188665` (1920), `8278:189186` (1440), `8278:189703`
  (1024) and `8278:190283` (375, ends after News). These use a light body with
  dark hero/products/footer, which matches the live homepage. The authored
  starter now defaults to this light theme (switched 2026-09-14 at Matt's
  request); the dark theme still renders correctly from the Studio toggle.
- [GNav WIP](https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/?node-id=6006-294978)
- Studio: `/?starter=homepage`. Saved drafts take precedence. The house toolbar
  action replaces a draft only after confirmation, with undo available.
- Preview: `/preview.html?fixture=homepage`; omit `fixture` to load the saved page.
- Storybook: `Pages/Homepage`, full page plus seven section stories, using the
  same document and component registry as Studio.
- Workflow: [Figma to tokens to Storybook to Milo](../workflows/figma-to-code-workflow.md).

Eight authored sections run from navigation to footer. Copy, links, images,
product icons, item ordering and footer groups are validated structured data.
The page is not a flattened image. Existing customer-story drafts remain valid.

## Coverage

| Section | Figma Evidence | Built | Still Open |
| --- | --- | --- | --- |
| GNav | Bar `5011:275645`, variant `5007:240035` | New link-only bar, mobile disclosure, keyboard Escape and real destinations | Mega-menus, all context/background axes, app switcher and signed-in states. Partial bar parity only. |
| Marquee | `12102:175105`; 1440 spec `8278:189188` (hero 810 incl. nav); RouterNavItem v2 `11280:219298`; live router-marquee | The full RouterMarquee: five router slides mirroring the live homepage (same tabs, copy, order and video sources as the Organisms/RouterMarquee story), tab rail, play/pause, autoplay in visitor/preview mode, muted looping background video per slide with a local still as poster/fallback. Title/leading come from the responsive heading-1 tokens; hero height follows the 1440 spec. Stills are first frames of the live videos (`sources.json`); the Figma still with the baked-in label is no longer used by the starter. | Approved hero art and copy sign-off (slides 2–5 are live-site copy, not Figma-verified); video sources are the live adobe.com CDN files. |
| Category router | `12102:175264`; existing HubRouter/ElasticCard; mobile `8278:190405` | Five editable categories using existing S2A Storybook stills. On mobile one card fills the rail inset (capped at the v2 360px mobile width) with the v2 media inset and radius. | Exact latest crops and motion sources. Stronger text token used to correct a 4.43:1 dark-card contrast failure. |
| Features/releases | `12102:175360`; MediaCard `9171:34388`, v1.1.0 | New feature/three-up section recipe, exact Figma paints, MediaCard density variants and h3 headings | Approval of corrected text/icons/CTA labels and product links; no video sources supplied. |
| Social proof | `12102:175374`; deprecated `.QuoteCard` `9334:3814`; mobile `8278:190283` | Existing functioning quote/carousel renderer; verified Michelle Phan quote and actual Figma photo. Mobile slides run edge to edge at the heading-1 sm step, and maximum-length copy now grows the card instead of being clipped. | Active QuoteCard v2 reconciliation; other distinct testimonials. Existing code is not claimed as v2 parity. |
| News | `12102:175420`; TextCard v2 `11362:245184` | Responsive three-up recipe, semantic headings, editable copy/links | Article destinations and editorial freshness; starter CTAs open Adobe News. |
| Products | `12102:175437`, `12102:175454`; ProductCard v2 `11370:245496` | Exact hero paint, editable heading/CTA, nine native whole-card product links. Mobile tiles are content-height instead of 254px empty canvases; the mobile hero is shorter. | Per-product hover artwork, mobile design approval (no mobile product frame exists in either Figma reference) and complete AppIcon pixel-size API migration. |
| Footer | Unversioned page pattern `12102:175540` | Grouped editable links and existing Adobe Logo | Approved S2A contract, featured-product/social rows, remaining corporate links, region and consent utilities. |

## Missing Design Versus Missing Code

**Present in Figma, still requiring code or reconciliation:** GNav mega-menus and
Region Select; active QuoteCard v2 (named as the supported successor, not
extracted this pass); ProductCard hover content; footer featured-products/social
rows. These are not mislabeled as missing designs.

**Needs a design/content/integration decision:** Quick Actions was present in the
previously inspected live navigation but not demonstrated in this GNav WIP;
App Switcher and signed-in panels have no complete verified state contract here;
four alternate hero contents, clean mobile artwork and remaining testimonials
are not supplied in this Homepage. No replacement UI or testimonials were invented.

Region, consent, AdChoices, account identity and privacy preferences must use real
platform integrations. The POC does not provide look-alike controls that do nothing.

Hidden `AgenticSearch` (`12102:175517`) and the old What's New branch
(`12102:175303`) are intentionally omitted from the visible-page implementation.

## Deliberate Deviations

1. The merged AI-model headline is corrected to "Generate with top AI models in
   one place." Figma has fragments of the upscale headline on both ends.
2. Repeated "Explore Premiere" links and unrelated Firefly icons are replaced
   with matching product labels/icons and product landing pages. These are
   provisional editorial choices, not claims about the original Figma content.
3. News placeholder CTAs become "Visit Adobe News" until article URLs are supplied.
   Footer and product links also require production content/localization approval.
4. GNav labels use intrinsic widths instead of the broken 47px instances. Plain
   destination links do not pretend to open menus.
5. Letter spacing is zero per working instructions. Studio and the visitor
   preview now load the same Adobe Fonts kits Storybook uses (hah7vzn for Adobe
   Clean, mie2rub for Adobe Clean Display 800) without render blocking; the kits
   declare `font-display: optional`, so a cold first view keeps the fallback and
   never reflows, and repeat views get the webfont. No font binaries were added.
   Adobe Clean Display Black (900) still needs an approved delivery path; the kit
   only carries 800.
6. The story carousel still has one verified testimonial and hides its inactive
   controls. The marquee now carries five slides; slides 2–5 use live-site copy.
   Mobile layouts are responsive adaptations, not approved mobile pixel matches.
7. The marquee's preferred height is half the container width (738px at 1440,
   matching the 1440 spec), capped so the next section still peeks below the
   nav on short viewports; long authored copy can expand it. The mobile scrim is
   lighter than before so the art reads, and the crop is anchored to the top
   edge so the source's baked-in frame label never shows.

## Video

The adobe.com video CDN refuses cross-origin requests (HTTP/2 protocol errors in
Chrome, not only in automation), so remote clips never played from this origin.
The ten live clips (five marquee slides, five category cards) are now
self-hosted: `scripts/prepare-assets.mjs` downloads them once into the ignored
`public/media/video/` and `stories/assets/homepage/video/` folders, and a
`videos` registry in `assets.ts` gives each an ID. Items carry
`videoAssetId` (schema enum; "Background video" / "Hover video" selects in
Studio) instead of a free URL.

- Marquee: the active slide plays its clip muted and looped; nothing is fetched
  under reduced motion, in authoring mode, or while paused, and the local still
  stays as the background. Inactive stills load only when activated or
  prefetched after the hero lands.
- Category cards: the still is the poster, `preload="none"`, and the clip plays
  on hover and on keyboard focus (Milo's hover-play pattern) and pauses on leave.

Verified in Chrome: the marquee clip reaches readyState 4 and advances; a
category clip plays on hover and on focus and pauses on mouse-leave.

## Surface tokens and the card color

The category card is bound to `s2a/color/surface/subtle` in Figma (ElasticCard
v2), but no `surface/*` token had shipped, so the CSS fell back to
`background/subtle`, which is gray-700 (#505050) in dark mode; the card should
be gray-900 (#131313) on a `surface/default` (#000) section. The four surface
tokens (default, subtle, inverse, inverse-subtle) are added to the semantic
color theme JSON in both modes with the values read from the Figma bindings,
the token CSS is rebuilt, and the category section uses `surface/default`.
Measured after the change: dark #000 section / #131313 card, light #fff / #f8f8f8.
The next Figma variable sync should confirm the same values. A token audit
through the S2A MCP (`audit_css`) was run on the new stylesheets; the raw
values it flagged in code from this pass (24px targets, 700 weights, 48px
margins) were replaced with semantic tokens. Remaining raw values are layout
dimensions from Figma (hero and tile heights) and the documented
`Primitive:` exceptions.

## Evals

The repo's eval harness (`evals/`) covered Button and Bento only. A Homepage
visual-parity eval now exists: `npm run eval:visual:homepage` renders each
section of the built visitor preview at 1920 dark, pixel-diffs it against Figma
section renders of the WIP frame (`evals/datasets/homepage/golden/`,
manifest `cases.json`), and writes diffs and a report to
`evals/visual/out/homepage/`. Thresholds start wide and are meant to be
ratcheted down; the goldens carry known editorial deviations, so the score
measures drift, not approval.

First run (2026-09-14, 1920 dark): marquee 50% (golden is a video frame with a
different crop; baseline 55%), category rail 38% after the fixes below (golden
has a hover-expanded card; baseline 50%), features 33%, social proof 29%,
footer 21%, products 16%, news 9% (default 35%). The rail diff exposed a real
bug: the two Storybook category stills were named the other way round from the
live categories (the runner is Creativity and design, the Firefly generate UI
is Content creation), so the stills disagreed with the hover clips; the asset
registry now maps them correctly. The WIP metadata also corrected three rhythm
values: marquee copy sits 104px below the nav bar and the tab rail 80px above
the hero's bottom edge at desktop, the category section has no bottom padding
(the next section supplies the 124px gap), and the news section uses 124px
above and below instead of 80px.

### Breakpoints and light theme (2026-09-15)

`cases.json` now has five groups: 1920 dark (WIP frame) and 1920/1440/1024/375
light, cropped from the Original Design Specs frames (`8278:188665`,
`8278:189186`, `8278:189703`, `8278:190283`) with the frame metadata; 33 cases.
Masks exclude the transparent Figma nav over the hero (the nav is a stub here)
and the 375 frame's iOS status bar. The first run found three real layout
drifts, all fixed:

- Page gutters: the design uses 128px (`layout-lg`) at 1440 and 88px at 1024;
  the sections used 40px below 1920. Media at 1440 fell from 48% to 33%, at
  1024 from 39% to 32%. Mobile gutters are 24px (`spacing-lg`), not 16px.
- Router rail at 1024: five tiles are meant to share the row at 168px; the rail
  kept every tile at 220px and overflowed (`min-width: auto` on the flex rail).
- Quote carousel at 375: the spec (`8278:190566`) is a 327×542 active slide at
  x=24 with 8px gaps and rounded corners, i.e. a 16px peek; the code had gone
  edge to edge at 40px type. Restored the peek, corners and the 48px step. The
  first marquee tab is "PDF and productivity" in every design frame.

What remains in the high scores is not code drift: the hero goldens are video
frames with two CTAs (candidate: local still, one CTA); the category goldens
show a hover-expanded card, and at 375 a stacked card deck the carousel does
not implement; the 375 quote golden crops the quote above the section. Those
cases carry measured baselines (hero 58–85%, category 40–60%, 375 quote 60%)
with notes, and only ratchet down. Run after the fixes: 33/33 within baseline.

### Token binding (2026-09-15)

`npm run eval:tokens:homepage` compares the variables Figma binds on each
section node (`evals/datasets/homepage/tokens.json`, from the MCP
`get_variable_defs`) with the `--s2a-*` names the section's stylesheets
reference and with the shipped token CSS. 8/8 sections resolve every token they
reference through a fallback, but the pipeline view lists 46 names the code
expects that `dist/` does not define: the whole `color/button/*` and
`color/icon-button/*` families as the components name them (the shipped tokens
use `primary-solid-on-light` style names instead), `router-nav-item/*`,
`router-card-*`, `product-lockup-gap-*`, `elastic-card-width-resting`, and a
malformed `--s2a-grid-container-measure-narrow-_max-width` in RichContent. Figma
side, the same nodes bind `s2a/color/button/background/knockout/default`,
`s2a/color/router-nav-item/*`, `s2a/color/surface/*` (now shipped) and
`product-lockup-gap-*`, so the families agree on intent and disagree on names:
a token-pipeline item, not a component one. The scorer also lists the legacy
bindings on the design side (S2AC palette, product tile colors, `Desktop/Label`
text styles, unprefixed `--typography-*` variables, `--s2a-color-gray-800`
primitives on the ElasticCard) for the Figma audit.

### Page catalog

`evals/datasets/cpro-hub/cases.json` (10 sections from `12164:44174`) and
`evals/datasets/bizpro/cases.json` (9 sections from `11333:235687`) name the
section nodes for the next two pages in the same shape as the Homepage manifest.
Both are `catalog-only`: `node evals/visual/homepage-parity.mjs --page=cpro-hub`
lists them without a browser run until goldens are captured. Most BizPro
section frames are unnamed in Figma and the frame is 2560 wide; both need
naming before capture. Neither page has Studio recipes for its hero, offer,
immersive feature, plans or agentic-search sections yet.

## Studio performance panel

The preview frame now reports live metrics to Studio (LCP, CLS, long-task
blocking, JS/CSS/image/video bytes, request count) after each render; the
canvas footer shows them with pass/warn against the desktop gates, labelled as
an unthrottled local sanity check (byte figures carry no state on the dev
server, where modules are unbundled). The Performance button opens a panel with
the same strip, the last lab run (`reports/homepage-performance.json`, staged
into `public/reports/` by the asset step) with per-profile medians, limits,
editor stress and the seeded-fault result, and the latest accessibility audit
summary. Editor-only code stays in the Studio entry; the preview adds only the
observers, and only when embedded.

RouterNavItem fix (shared component): the tile now owns the label ink
(`.c-router-nav-item .c-product-lockup[data-style] { color: inherit }`). The
lockup used to carry its own theme-dependent `content/label` color, which made
the active label white-on-white in dark mode and, after any slide advance,
left the previously active tile with dark text on dark glass because the
controller swaps `data-state` on the tile but not the lockup's baked style.
Both tile surfaces are theme-invariant, so the ink now follows the tile in
every theme and state; verified after autoplay advance in light and dark.

## Motion

Fresh evidence, 2026-09-14: the live adobe.com homepage was recorded with
Playwright in headed Chrome at 1440 and 390 (headless Chromium is blocked). Its
motion is Milo's C2 scroll-driven system (`context/milo/libs/c2/styles/styles.css`):
`parallax-move-up-fast` and `parallax-fade-to-dark` on the sticky hero,
`enable-parallax` on section headers and the elastic carousel,
`enable-parallax-stagger` on card and news grids, `parallax-scale-down` on card
pictures, carousel-c2 enter keyframes on the quote carousel, and a shared
`cubic-bezier(0.42, 0, 0, 1)` curve with 300–750ms hover transitions. Reduced
motion disables the scroll-linked and autoplay motion, not the short UI transitions.

Ported (2026-09-15, `homepage-sections.css`, CSS-only): the sticky hero moves up
35vh and fades to dark over the first 80vh of scroll while the next section
rides over it with 32px rounded corners (`parallax-move-up-fast`,
`parallax-fade-to-dark`, `.rounded-corners-top`); section headers and the
category heading ease into place (`parallax-move-up`); the category rail slides
in 200px and its card gaps shrink from 2.75rem (`elasticCarouselSlideIn`,
`elasticItemsGapShrink`); card grids stagger by column with a 48px drift
(`enable-parallax-stagger`, index 1.5/3.25/5.5); card images settle from 1.1×
(`parallax-scale-down`). Media cards zoom 1.03 over 0.75s on hover and product
tiles lift, on the shared `cubic-bezier(0.42, 0, 0, 1)` curve. Everything is
gated by `@supports (animation-timeline: view())`, `prefers-reduced-motion`,
hover-capable pointers and Studio's authoring mode (`html[data-editing="true"]`),
and uses only opacity/transform. Verified by `npm run eval:motion:homepage`:
27/27 contracts hold under normal and reduced motion (Web Animations API
inspection of timelines, ranges and easing, plus video, pause-control,
hover-play and hover-zoom behaviors), and scroll probes measured the hero at
−315px with the overlay at 0.75 after 720px of scroll at 1440×900. Not ported:
carousel-c2 content enters on the quote carousel. The hero and category videos
now play (see Video).

## Assets and Tokens

Provenance: `apps/storybook/stories/assets/homepage/sources.json`. The one-time
capture script is `apps/authoring-poc/scripts/fetch-homepage-assets.mjs`; builds
never fetch expiring MCP URLs. Local 640/1480px WebP candidates have stable
dimensions. The hero is eager/high-priority; downstream media is lazy. Ten official
Adobe CDN app icons are captured and served locally by the visitor preview.

Fixed-dark surface fallbacks in the new GNav/Homepage CSS have `Primitive:`
comments. The quote card's mobile type step uses `--s2a-font-size-5xl` with a
`Primitive:` comment because the responsive heading-1 token is viewport-scoped
and the card sizes by container query. Replace them with approved theme-invariant semantic aliases; using
background/inverse would turn those surfaces white in dark mode. Existing
RouterMarquee/ProductCard exceptions are not evidence of token parity.

## Evaluation

```sh
npx nx run-many -t typecheck,test -p authoring-poc
npx nx run authoring-poc:e2e
npx nx run authoring-poc:homepage-e2e
npx nx run authoring-poc:perf
npx nx run authoring-poc:homepage-perf
npx nx run storybook:build
```

- Data tests cover all new recipes, limits, assets, unsafe nested URLs, arbitrary
  properties, duplicate IDs, duplication and undo. AST checks compare actual
  component inputs with specs.
- Browser checks cover nested authoring, images, ordering, persistence/export,
  1920/1440/768/390/320px layouts, navigation and automated WCAG A/AA checks.
  They also cover explicit marquee playback, keyboard slide navigation and
  pausing all marquees when entering edit mode, plus maximum-length mobile
  marquee headlines, descriptions and CTA labels without clipping.
- With a local Storybook server running, add
  `--args=--storybook-url=http://127.0.0.1:6007/` to `homepage-e2e` to check the
  actual full-page story, theme and visible assets at desktop/mobile widths.
- Performance budgets are unchanged: five cold runs/profile, 10s observation,
  mobile CPU 4x and 1.6Mbps/150ms network; median LCP <=2s mobile/1.5s desktop,
  CLS <=0.05, compressed JS <=100KiB, CSS <=40KiB, total <=1MiB/1.5MiB.
- A measured 700ms main-thread fault must fail the blocking-time gate. The new
  editor stress case uses 20 authored marquees with update roundtrip p95 <=100ms.
- Separate `homepage-performance.json`, browser reports and screenshots live in
  ignored `apps/authoring-poc/reports/`. CI runs both fixtures serially in the
  existing scheduled quality workflow and uploads evidence even on failure.

These are synthetic POC evaluations, not field INP/RUM, production-publishing
benchmarks, visual-diff approval, full accessibility certification, or proof of
adobe.com-scale infrastructure. Missing metrics are failures, never assumed passes.

The first mobile evaluation exposed an automatic snap-scroll in the category
rail before the first paint, leaving LCP unreported. Matching `scroll-padding`
to the rail inset removed that initial scroll. The harness retains paint/scroll
diagnostics and an explicit initial-position regression check; no missing-value
fallback or relaxed threshold was added.

### Local Verification, 2026-09-14 (first pass)

- Typecheck and all 50 data/contract tests passed.
- Original Studio journeys and Homepage authoring, dropdown persistence/export,
  maximum-copy, responsive, accessibility and built-Storybook checks passed.
- Homepage lab run at 19:10 UTC, Chromium 151: median LCP 1,936ms mobile / 380ms
  desktop; CLS 0 in both profiles; compressed JS 70,744 bytes and CSS 12,634 bytes.
  Initial transfer was 528,399 bytes mobile / 421,133 bytes desktop.
- The measured blocking fault was detected. The 20-marquee editor case reported
  a 7ms update roundtrip p95. The original quote fixture also passed its gates.

### Local Verification, 2026-09-15 (harness pass)

- Typecheck and all 50 data/contract tests pass; Studio journeys (8) and the
  Homepage browser checks pass, including the built-Storybook full-page check
  (fresh `storybook:build`, served from `storybook-static/`). Two assertions
  were updated for corrected behavior: the mobile quote slide sits 24px in at
  viewport − 48 wide (the spec's peek, not edge to edge), and the controls check
  measures against the CTA row rather than the padded copy block.
- Evals: visual 33/33 within baseline across five groups (the symmetric slide
  offset also lowered every quote-carousel score, 375 to 53.5%); motion 27/27;
  tokens 8/8 sections resolve, 46 pipeline names listed.
- Lab run at 14:49 UTC, Chromium 151, reduced motion: median LCP 1,632ms mobile
  / 328ms desktop, CLS 0, JS 73,585 bytes, CSS 15,312 bytes (+585 bytes for the
  motion port and gutters), initial transfer 574,055 / 466,789 bytes, worst
  blocking 131ms mobile / 0ms desktop; all gates pass, seeded fault detected,
  editor stress 80ms ready / 11ms p95.
- Accessibility audit: 10 findings (8 moderate, 2 minor), unchanged by this pass.

### Local Verification, 2026-09-14 (polish pass)

- Typecheck and all 50 data/contract tests passed after the changes.
- Studio journeys (8) and Homepage browser checks (5, plus the built-Storybook
  check against a fresh `storybook:build` served on 6007) passed; the two
  assertions that encoded superseded behavior were updated (item row instead of
  dropdown, edge-to-edge mobile slide).
- Homepage lab run at 20:21 UTC, Chromium 151, reduced motion: median LCP
  1,948ms mobile / 372ms desktop; CLS 0 in both; compressed JS 70,945 bytes,
  CSS 14,583 bytes (the two kit stylesheets add ~2KB; no font file is fetched on
  a cold, uncached view because the kits use `font-display: optional`); initial
  transfer 531,331 bytes mobile / 424,065 desktop; worst observed blocking 104ms
  mobile / 0ms desktop. Editor: 20-marquee ready 55ms, roundtrip p95 7ms. The
  seeded 700ms fault was detected.
- Same run with motion allowed (`--motion`): median LCP 1,948ms / 380ms, CLS 0,
  worst blocking 101ms mobile; the scroll-driven reveal has no measurable cost
  in this lab. The quote fixture also passed all gates.
- After the five-slide router marquee landed (21:04 UTC): median LCP 1,720ms
  mobile / 368ms desktop, CLS 0, compressed JS 71,837 bytes, initial transfer
  571,577 bytes mobile / 464,311 desktop, worst blocking 133ms mobile; all gates
  pass. Inactive slide stills carry no `src` until activated or prefetched after
  the hero lands (an eager variant measured 2,076ms and failed the mobile gate).
  Homepage checks and the built-Storybook check pass with five tabs.
- Final run of the day (after self-hosted video, surface tokens, landmark
  restructure and rhythm fixes; 22:1x UTC): reduced motion median LCP 1,612ms
  mobile / 324ms desktop, CLS 0, JS 73,316 bytes, CSS 14,727 bytes, initial
  transfer 573,202 / 465,936 bytes, worst blocking 121ms mobile; all gates pass,
  seeded fault detected, editor stress 76ms ready / 11ms p95.
- With motion allowed (`--motion`), the hero now autoplays its clip and
  advances after five seconds, so the desktop profile fetches two 2.2MB clips
  inside the 10s window and the initial-transfer gate fails (4.87MB against
  1.5MiB); mobile stays under budget (628KB) because the throttled link fetches
  only part of the first clip. This is the live site's behavior, not a
  regression of the static page, and the budget was not changed: whether
  streamed video counts as initial transfer, or whether the hero should start
  with a lighter clip, is a product decision. The reduced-motion baseline above
  remains the gate.
- Accessibility audit after fixes: 14 findings (11 moderate, 3 minor), 0 axe
  violations on the visitor page and Studio; the remaining items are the open
  list in the audit report. Homepage visual eval: 7/7 within baseline.
- These remain synthetic local POC results, not field data; any further font,
  hero or video change must be re-measured.
- Evidence: `apps/authoring-poc/reports/` (performance JSON, browser reports,
  screenshots) and `reports/polish/` (before/after page and Studio captures,
  Figma reference renders, live adobe.com scroll recordings and motion inventory).

## Studio

The editor pass kept every contract and added: per-recipe outline icons; an
"Add section" picker with real renders of each recipe (`src/recipe-previews/`,
regenerated by `nx run authoring-poc:recipe-previews`) and one-line
descriptions; inspector fields grouped into Section, Button/Call to action and
Image with plain-language labels per section (Sign-in label, Column heading,
Product name, Category label); product icons listed by name; and an item list in
place of the dropdown, with the product shown beside each item. The saved data
shape, validation, undo grouping and import/export are unchanged.

## Next Batch

0. Token pipeline: reconcile the `color/button/*`, `color/icon-button/*`,
   `router-nav-item/*`, `router-card-*` and `product-lockup-gap-*` names between
   Figma, the shipped tokens and the components (see Token binding); rename the
   BizPro section frames; decide whether the mobile category deck (375 golden)
   replaces the carousel.
1. Review the built page and resolve the flags in Studio's Design Review panels.
   Obtain approved clean hero art. The starter is light like the Original Specs
   and the live site; the newer 1920 WIP frame is dark, so the dark toggle
   remains supported.
2. Finish GNav patterns against existing desktop/tablet/mobile designs.
3. Reconcile QuoteCard v2; approve/version the footer and its utility states.
4. Capture approved visual, font, locale, long-copy and reduced-motion baselines.
5. Integrate publishing, identity, consent, localization, analytics and RUM before
   production rollout. Local JSON authoring alone does not provide those systems.
