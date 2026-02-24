# Figma Plugin Delivery Plan

This document outlines how we will introduce a YAML-driven Figma plugin into the Consonant Nx workspace. The effort is structured across the familiar **MVP → Cupcake → Birthday Cake → Wedding** maturity ladder so we can stage investment and feedback loops while keeping alignment with the Consonant design-token guardrails.

## Guiding Principles

- **Stay token-aligned** – the plugin must resolve semantic/component tokens first and only fall back to primitives when explicitly annotated (`Primitive:` comments), mirroring `docs/guardrails/no-primitives-in-components.md`.
- **Meet Nx expectations** – every deliverable is an Nx project with documented `build`, `serve/watch`, and `package` targets so Story UI and the existing CI can orchestrate it like `tokens` and `storybook`.
- **Specs live as code** – YAML specs should be validated and versioned inside the repo (likely `packages/figma-specs/` eventually) so engineers and designers can review deltas through Git.

## Stage Breakdown

### MVP (Weeks 1–2)

**Goal:** Create a working Nx-managed plugin that can ingest a local YAML file and emit a single component instance inside Figma for validation.

- Scaffold `apps/figma-plugin` with manifest, worker (`code.ts`), and UI (`ui.tsx` or plain JS) bundles using `esbuild`.
- Implement a **Spec Loader** module that reads a YAML file bundled with the plugin (start with a hardcoded sample spec under `apps/figma-plugin/specs/button.yaml`).
- Support a minimal schema: component name, frame size, and a stack of layers (rectangles + text) with token references for fill, stroke, text style.
- Ship a simple UI that lets the designer select one of the bundled specs and click “Generate”; no editing yet.
- Provide validation + logging so invalid specs surface an error in the UI and via `figma.notify`.
- Document CLI/Nx steps for building (`nx build consonant-yaml-components`) and locally loading the manifest into Figma Desktop.

**Exit criteria:** Designers can load the plugin, pick `button.yaml`, and receive a component frame that already uses Consonant tokens for fills/typography.

### Cupcake (Weeks 3–4)

**Goal:** Expand from single-instance generation to component/component-set authoring from YAML plus configurable inputs.

- Evolve the schema to describe **variants** (properties + possible values) and map each variant combination to layer overrides.
- Create component sets and attach variant properties programmatically (`figma.combineAsVariants`).
- Add the ability to paste in external YAML (textarea upload) or choose from multiple bundled specs so designers aren’t blocked by rebuilds.
- Introduce schema validation (e.g., JSON Schema compiled at build time) so authors get actionable feedback before Figma node creation.
- Persist guardrail metadata (list of tokens referenced, primitive fallbacks) and show it in the plugin UI so designers can fix upstream specs.
- Extend Nx targets with `nx lint consonant-yaml-components` (schema + TypeScript checks) and ensure Storybook docs reference how to use the Cupcake features.

**Exit criteria:** Designers can pick a YAML spec that defines variants, click generate, and get a fully wired component set reflecting the schema.

### Birthday Cake (Weeks 5–7)

**Goal:** Cover production workflows: syncing specs from the repo, associating them with Story UI, and supporting assets.

- Move specs into a dedicated workspace package (e.g., `packages/figma-specs`) with its own build/test targets and shareable TypeScript types.
- Implement **repo sync**: the plugin fetches the latest committed specs via GitHub raw URLs or a local dev server (no manual copy-paste). Offline fallback keeps the bundled defaults.
- Support asset references (SVGs, PNGs) defined in YAML and automatically attach exported images (use `figma.importSVG`/`figma.createImage`).
- Add Story UI hooks so component metadata (name, variants, token usage) flows back into Story UI docs automatically.
- Harden QA: add Vitest suites that run schema validation and spec-to-node simulations (using a lightweight mock of the Figma API) to catch regressions before designers install the plugin.

**Exit criteria:** Specs are single source of truth in Git, the plugin hydrates them automatically, and we can generate asset-backed component sets plus share metadata downstream.

### Wedding (Weeks 8+)

**Goal:** Enterprise-ready automation with downstream integrations and governance.

- Implement bidirectional updates: allow designers to push Figma component metadata (e.g., resolved token IDs, missing aliases) back into the repo via MCP or git patches.
- Introduce a spec registry service (tiny Node/Nx app) that brokers spec versions, approvals, and notifications when guardrails fail.
- Add multi-file orchestration so large specs (e.g., hero marquee) can stitch together nested atoms/molecules and share sub-specs.
- Expand to automated release pipelines: `nx release consonant-yaml-components` packages the plugin, runs integration tests inside Figma Desktop via Playwright automation, and publishes signed bundles to a shared location.
- Provide observability (telemetry events, error tracking) so we can monitor adoption and triage failures.

**Exit criteria:** The YAML → Figma workflow is production-hardened, observable, and embedded in Consonant’s release/approval process.

## Immediate Next Steps

1. Finalize Cupcake validation (multi-variant YAML specs + pasted YAML UX) through designer feedback sessions.
2. Socialize the Cupcake schema with design engineering so we can lock the variant vocabulary before scaling to other components.
3. Start the Birthday Cake backlog grooming (spec syncing + asset support) while Cupcake usage data settles.

## Stage Status

- **MVP** – ✅ available in repo (hardcoded YAML + single component generation)
- **Cupcake** – 🚧 implemented (variant schema, component sets, pasted YAML flow) awaiting broader testing
- **Birthday Cake** – ⏳ not started
- **Wedding** – ⏳ not started
