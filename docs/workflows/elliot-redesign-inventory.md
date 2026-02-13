# Elliot Redesign Intake & Inventory Workflow

> Use this flow when Elliot's team hands off new comps. Target timeline: capture → inventory → build plan within four weeks and ship parity-tested blocks by week eight.

When the redesign drops, the workflow is: **Figma MCP capture → atomic inventory → component contracts → Story UI/Codex guardrailed build → Milo QA**. MCP pulls every detail (states, variants, responsive behavior, typography, spacing, token usage, interaction rules). Inventory steps catalog those details into foundations → atoms → molecules → organisms with dependencies. Contracts encode API/config, theming, a11y, performance, and “definition of done”. Story UI + Claude/Cursor/Codex use those contracts to generate code/stories, so we build bottom-up without reinterpreting Elliot’s intent during implementation.

## 1. Capture the handoff (Week 0–1)
- Pull the latest Figma files via MCP (see `docs/FIGMA_MCP_SETUP.md`).
- Export **states, variants, responsive notes, typography, spacing, token usage, and interaction annotations**.
- Store raw exports plus screenshots in `/screenshots/redesign-intake/` for quick reference.

## 2. Build the atomic inventory (Week 0–2)
- Break every asset into the atomic ladder:
  - **Foundations / primitives:** colors, type ramps, spacing, grids, iconography.
  - **Atoms:** buttons, tags, form inputs.
  - **Molecules:** product lockups, cards, nav elements.
  - **Organisms:** hero marquee, pricing table, etc.
- Document dependencies, shared assets, and missing tokens in `story-ui-docs/components/<component>/inventory.md` or a central tracker.
- Flag any hard-coded primitives that need new `--s2a-*` tokens before build.

## 3. Define component contracts (Week 2–3)
- For each component create/update its YAML spec in `packages/components/<component>/<component>.spec.yaml` (anatomy, slots, exposed props, allowed content, token bindings).
- Document the **variant matrix** (states, responsive breakpoints, interaction rules) and how Story UI should reference the component (import paths, required attributes).
- Capture Milo-facing API/config details: YAML + JSON schema, expected data sources, theming hooks, telemetry IDs.
- Add the quality gates: a11y expectations, performance/raster budgets, testing requirements (Storybook a11y + visual, Milo overlay, manual review if needed).
- Attach assets + dependencies: background images, icons, related tokens, and link back to the atomic inventory entry so nothing gets rebuilt twice.
- Include a “definition of done” checklist inside each spec so reviewers can verify tokens, responsiveness, states, and documentation before marking the component ready.

## 4. Prioritize the backlog (Week 3–4)
- Sequence work bottom-up so molecules only ship after their atoms exist.
- Assign owners: Design Ops for tokens, DS engineers for components, Milo partner for runtime integration.
- Track dependencies + status in the same inventory doc for transparency.

## 5. Build with AI guardrails (Week 4–7)
- Update `story-ui-docs/` and `docs/guardrails/` with the new inventory + contracts.
- Run Story UI prompts (see `story-ui-hero-marquee-prompt.md`) to scaffold stories using existing components/tokens.
- Enforce guardrail lint: no primitive usage without `/* Primitive: … */` comments, Storybook a11y checks must pass.

## 6. Milo QA & release (Week 7–8)
- Drop generated blocks into `context/milo/` sandboxes and run overlays vs. Elliot’s comps.
- Execute automated tests (a11y, visual regression, responsive) defined in Storybook.
- Once parity is confirmed, publish updated blocks + specs to Milo and communicate deprecation path for the legacy Consonant 1 equivalents (see `docs/future-notes/consonant1-deprecation.md`).

## References
- Visual timeline: `charts/elliot-redesign-inventory.html`
- Guardrail workflow: `docs/workflows/FIGMA_TO_CODE_WORKFLOW.md`
- Story UI context: `story-ui-docs/`
- Guardrails: `docs/guardrails/no-primitives-in-components.md`
