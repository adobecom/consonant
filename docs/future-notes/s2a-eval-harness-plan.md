# S2A Eval Harness: Golden Sources, Scorers, Pages

Drafted 2026-09-15 from the Homepage polish work. Purpose: make every page we
build in S2A Studio answerable to the same three golden sources, in CI, with
scores that only ratchet down.

## Golden sources

| What | Where it lives | How it is read |
| --- | --- | --- |
| Visual design | Figma, `qAF4nlt6O4ThbeXeO7jzdb`. Per theme: `12102:175099` (Home 1441+ v2 Dark; its child frame `12102:175100` is the section source) and the light sibling when it lands. Per breakpoint: `9672:83669` (Home — Original Design Specs: 1920, 1440, 1024, 375). | Figma MCP `get_screenshot` per section node, saved as PNG goldens with a manifest of node IDs and capture date. |
| Component and token usage | The same Figma frames: which S2A components are instanced and which variables each layer binds. | Figma MCP `get_variable_defs` per section node, saved as a variable manifest per section, theme and breakpoint. |
| Motion and behavior | Milo: `context/milo/libs/c2/styles/styles.css` (parallax recipe), `libs/c2/blocks/*` (elastic-carousel, carousel-c2, base-card, news), `libs/utils/decorate.js` (video); the live adobe.com recording as evidence of what ships. | Written down as motion contracts per section: element, animation, timeline kind, range, easing, reduced-motion rule; behaviors for video, pause, hover, focus. |
| Accessibility | WCAG 2.2 AA | `nx run authoring-poc:a11y-audit` |
| Performance | The lab budgets in `scripts/perf-score.mjs` | `nx run authoring-poc:homepage-perf` |

## Scorers

All scorers run against the same candidate: the section registry that renders
Studio's canvas, the visitor preview and the Storybook page story. Each emits
stable codes so two runs can be diffed.

1. **Visual parity** (`evals/visual/homepage-parity.mjs`, done for 1920 dark).
   Section screenshot at the golden width and theme, pixel-diffed against the
   Figma render; sub-region selectors when a golden covers part of a section;
   per-case baselines that start at the first measured run and only go down.
   Next: light theme, the four breakpoints, and region masks for content the
   register records as deliberately different (so editorial deviations stop
   inflating scores).
2. **Motion parity** (`evals/motion/homepage-motion.mjs`, done for the Homepage).
   Contracts in `evals/datasets/homepage/motion.json`; the scorer reads the Web
   Animations API (`getAnimations`, `ScrollTimeline` / `ViewTimeline`, ranges,
   keyframe easing), computed layout for sticky/overlap, and interaction
   behaviors, under normal and reduced motion.
3. **Token binding** (`evals/tokens/homepage-tokens.mjs`, done for the
   Homepage). For each section: the `--s2a-*` names the section's stylesheets
   reference versus the variables Figma binds on the golden nodes
   (`tokens.json`) versus the shipped token CSS. Fails when a referenced token
   is unshipped and has no fallback; lists unshipped Figma bindings (how
   `surface/*` was found), unbound families, raw values without a `Primitive:`
   note, and the design-side legacy bindings for the Figma audit.
4. **Accessibility** and **performance**, already gates.

## Page catalog

One manifest per page under `evals/datasets/<page>/`:

```
cases.json      visual goldens: node per section × theme × breakpoint
motion.json     motion contracts per section
tokens.json     variable bindings per section (generated from Figma)
golden/         PNG renders
```

The Homepage has all three. `cpro-hub/` and `bizpro/` carry `cases.json`
catalogs (section nodes named, `status: "catalog-only"`), which the visual runner
lists via `--page=` until goldens land; Milo's own build status per page is a
question for that team and does not gate the harness.

## Runner

`npm run eval:visual:homepage`, `npm run eval:motion:homepage`,
`nx run authoring-poc:a11y-audit`, `nx run authoring-poc:homepage-perf`. Each
writes JSON to `evals/*/out/` or `apps/authoring-poc/reports/`; Studio's
Performance panel already reads the perf and audit reports. Wire the four into
the existing quality workflow so a PR shows drift per section rather than a
single pass/fail.

## Order

1. Motion parity for the Homepage: done (27/27 contracts, sticky hero port).
2. Visual parity across light theme and breakpoints with region masks: done
   (33 cases, 5 groups; three layout drifts found and fixed; baselines set).
3. Token-binding scorer from Figma variable defs: done
   (`evals/tokens/homepage-tokens.mjs`; 46 pipeline name gaps listed).
4. Page catalog for CPro hub and BizPro: manifests written, catalog-only until
   goldens are captured and the BizPro frames are named; breakpoint frames for
   the remaining components remain the open item for Chip.

Results and the follow-ups live in the
[gap register](s2a-homepage-gap-register.md) under Evals.
