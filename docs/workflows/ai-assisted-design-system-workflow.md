# AI-Assisted Design System Workflow

## How We Build, Document, and Ship S2A Components

**Status:** Draft — iterate before sharing
**Audiences:** Engineering team (how to work with the system) · Elliot / leadership (what we've built and why it matters)
**Last updated:** March 2026 · S2A Design System

---

## What this document covers

This is the end-to-end workflow for how we're building the S2A design system using AI tools. It covers how we go from a redesign brief to a fully documented component set with working code and Storybook stories — systematically, repeatably, and fast.

The same workflow serves two purposes:

1. **For engineers:** A concrete step-by-step guide for contributing components and working with the token system
2. **For leadership:** A demonstration of what's possible when AI tools are embedded into the design system workflow from the start

---

## The stack

| Tool                          | Role                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| **Claude Code** (this tool)   | Orchestration, spec writing, code generation, Figma scripting                      |
| **Cursor**                    | Code editor with repo context — generates component code against the Milo codebase |
| **Figma + Figma Console MCP** | Component authoring, design token binding, in-Figma technical spec generation      |
| **Token pipeline**            | Figma Variables → JSON → CSS custom properties (packages/tokens)                   |
| **Storybook**                 | Living component library — all variants, all states, accessibility audit           |

---

## The workflow — phase by phase

### Phase 1: Understand the redesign

**What:** Analyze the existing design (e.g. Adobe homepage redesign in Figma) to understand what components are needed, how they're used across contexts, and what variants matter.

**How:**

- Pull the Figma file using Figma Console MCP (`figma_get_file_data`, `figma_get_component`)
- Walk component usage across the page — which components repeat, which contexts they appear in (on-light, on-dark, inside cards, standalone)
- Document findings: which variants exist, which are missing, what the edge cases are

**Output:** Component inventory — a list of atoms, molecules, and patterns with their usage contexts.

**Example (Button):** Found 4 usage contexts on the homepage — Hero CTA (solid/on-dark), feature card (solid/on-light), testimonial (solid/on-dark), footer (Link, not Button). Identified missing on-dark outlined variant.

---

### Phase 2: Define component specs

**What:** Translate design observations into a formal spec — variant matrix, token mapping, layout rules, accessibility requirements.

**How:**

- Inspect the Figma component set: read `componentPropertyDefinitions` to get the actual variant matrix
- Resolve every `boundVariable` on fills, strokes, and typography to get real token names
- Map Background × Context × Size × State combinations
- Identify which combinations are valid and which are intentionally excluded (e.g. Accent has no on-dark variant)

**Output:** A variant matrix table + token map. This becomes the ground truth for both the Figma documentation sheets and the code implementation.

**Key principle:** Never invent props. All variant names, token strings, and property keys come directly from reading the live Figma component.

---

### Phase 3: Generate Figma component sets

**What:** Build or update the component set in Figma — the actual interactive design component that designers use.

**How:**

- Write `figma_execute` scripts via Figma Console MCP to create/update component frames
- Bind semantic color tokens (`setBoundVariableForPaint` — never hardcode hex)
- Apply text styles via `setTextStyleIdAsync`
- Structure components with the two-layer pattern: internal core (full variant matrix) + public wrappers (Background + Context locked, only Size + State exposed)
- Use the `.` prefix convention to hide internal components from the Assets panel

**Why the two-layer pattern matters:**

- Designers can't accidentally create invalid combinations (e.g. Accent/on-dark, which has no validated token)
- Less right-panel noise — public wrappers expose 2 properties instead of 8
- One update to the core propagates to all 14+ public wrappers instantly

**Output:** A production-ready component set in Figma, fully token-bound and accessible.

---

### Phase 4: Generate technical spec sheets in Figma

**What:** Build the in-Figma documentation — five spec sheets per component that live on the design page alongside the component set.

**Sheets generated:**

1. **Anatomy** — layer callouts, named parts, token bindings, focus state section
2. **Properties** — every configurable property with live variant previews and token tables
3. **Layout & Spacing** — Specs-style diagram showing padding vs gap vs external spacing, all tied to spacing tokens
4. **Accessibility** — POUR structure (Perceivable / Operable / Understandable / Robust), keyboard table, WCAG 2.2 AA citations with inline links
5. **Usage** — when/when not to use, variant selection guide, Do/Don't pairs, Design → Engineering handoff table

**How:**

- All five sheets are generated by `figma_execute` scripts via Figma Console MCP
- Sheets use `.sheet frame` scaffolding from the S2A Scaffolding page
- All tables built with `buildDocTable()` helper (never ad-hoc frames)
- All text uses semantic text styles and color tokens — no hardcoded values
- Copy follows educator's voice guidelines: explain what something does and why before giving technical detail
- **Anatomy annotation standard (canonical):** Badges are black circles with white sequential numbers — never blue. State labels ("Default state" / "Focus state") are standalone text placed above the card, not inside it. Cards use fill only — no stroke or border ever. Legend rows: NONE-layout badge wrapper (circle + overlaid number) + stacked textBlock (bold title / body description). Reference: Button — Anatomy `3923:254427`.

**Why this matters:**

- Engineers get the spec info that Dev Mode doesn't surface easily (token names, spacing semantics, a11y requirements)
- Designers get a single source of truth for how the component is supposed to behave
- Product gets a readable, non-jargon explanation of what the component is for
- Sheets are generated systematically — consistent structure across every component

**Output:** Five spec frames on the Figma design page, node IDs documented for automation.

---

### Phase 5: Generate code

**What:** Generate the HTML, CSS, and JavaScript implementation of the component against the Milo codebase context.

**How (in Cursor with repo context):**

- Load the Milo repo as context
- Reference the token pipeline output (`packages/tokens` CSS custom properties)
- Generate the component file structure: `component-name.js`, `component-name.css`, stories

**Two implementation paths:**

#### Path A — Data attributes (preferred)

Use `data-*` attributes to express variants. Keeps specificity flat and makes variant targeting explicit in both CSS and JavaScript.

```html
<!-- HTML -->
<button
  class="s2a-button"
  data-background="solid"
  data-context="on-light"
  data-size="md"
>
  Label
</button>
```

```css
/* CSS */
.s2a-button {
  /* base styles */
}
.s2a-button[data-background="solid"] {
  background: var(--s2a-color-button-background-primary-solid-on-light-default);
}
.s2a-button[data-background="solid"][data-context="on-dark"] {
  background: var(--s2a-color-button-background-primary-solid-on-dark-default);
}
```

**Why preferred:**

- No specificity wars — attribute selectors are all the same specificity level
- Self-documenting in the DOM — you can read the variant directly in DevTools
- Maps cleanly to the Figma property model (Background, Context, Size, State)

#### Path B — BEM

Use BEM class naming to express variants. More familiar for teams coming from traditional CSS workflows.

```html
<button
  class="s2a-button s2a-button--solid s2a-button--on-light s2a-button--md"
>
  Label
</button>
```

```css
.s2a-button {
  /* base */
}
.s2a-button--solid {
  background: var(--s2a-color-button-background-primary-solid-on-light-default);
}
```

**When to use BEM:** When the team is more comfortable with class-based selectors or when integrating with an existing BEM codebase.

**Output:** `component-name.js`, `component-name.css` matching the Figma spec exactly.

---

### Phase 6: Storybook stories

**What:** Write Storybook stories that cover every variant combination, used for QA parity and accessibility audit.

**How:**

- Generate stories using Claude Code with the component file and variant matrix as context
- Each story renders a live instance: all Background × Context × Size × State combinations
- Run `storybook-addon-a11y` — must report zero violations before merge

**Output:** `component-name.stories.js` in `apps/storybook/stories/`

---

### Phase 7: QA parity check

**What:** Side-by-side Figma vs browser comparison to confirm pixel-level and token-level accuracy.

**Checklist:**

- [ ] Label text color matches spec token
- [ ] Background color matches spec token (default, hover, active, focus, disabled)
- [ ] Focus ring: 2px solid, 2px offset, correct token color
- [ ] Padding correct for each size
- [ ] Icon renders at 16×16 in all sizes (IconButton)
- [ ] `aria-label` present in DOM (IconButton)
- [ ] No WCAG violations in a11y addon

**Tool:** `figma_check_design_parity` or manual side-by-side in browser DevTools + Figma Inspect.

---

## What we've shipped so far

| Component    | Figma set | Spec sheets  | Code | Storybook   |
| ------------ | --------- | ------------ | ---- | ----------- |
| Button       | ✓         | ✓ (5 sheets) | ✓    | In progress |
| IconButton   | ✓         | ✓ (5 sheets) | ✓    | In progress |
| Link         | ✓         | ✓            | ✓    | In progress |
| [next batch] | —         | —            | —    | —           |

---

## The gains

**Speed:** Generating a full set of five spec sheets for a new component (Anatomy through Usage) takes a fraction of the time of doing it manually. The structure is consistent across every component — no one has to figure out the template.

**Consistency:** Every component follows the same token model, the same layer structure, the same documentation format. Engineers and designers read the same source of truth.

**Confidence:** Because specs are generated from live Figma component data — not from memory or guesswork — the token names, variant matrices, and property keys in the docs are always accurate.

**Accessibility by default:** WCAG 2.2 AA requirements are embedded in the spec sheets, in the code generation prompts, and in the Storybook story generation. It's not a checklist at the end — it's part of the workflow.

---

## The limitations (honest account)

**Context window:** Long generation sessions (many `figma_execute` calls + screenshots) can hit model context limits. Solution: two-phase workflow — all generation in Phase A, screenshots in a new Phase B session.

**Figma API surface:** Some operations require workarounds (e.g. `createInstance()` only works on COMPONENT nodes, not COMPONENT_SET; `setProperties()` key names include `#nodeId` suffixes). These are documented in `docs/workflows/figma-plugin-patterns.md`.

**Human review still required:** Generated code and specs need review. AI gets structure and token bindings right consistently; nuanced UX decisions (when to use which variant, edge cases in copy) still benefit from human judgment.

**Token gaps:** If a semantic token doesn't exist yet in the pipeline, the workflow surfaces the gap clearly instead of shipping a hardcoded value. Gaps get raised in #consonant-tokens.

---

## What this unlocks next

1. **Component documentation in Figma** — publish the spec sheets as a living reference for the whole team, not just the core design system contributors
2. **Engineering onboarding** — new engineers can read the spec sheets to understand the token model and component architecture without needing a walkthrough
3. **Automated screenshots + screen recordings** — capture spec sheets, Storybook stories, and browser implementations automatically so leadership presentations don't require manual work
4. **Expanding the component library** — the workflow is repeatable; every new component follows the same path

---

## TODO — before sharing

- [ ] Add screenshots of spec sheets (Anatomy, Properties, Layout, A11y, Usage) for Button and Link
- [ ] Add screen recording of the MCP-driven spec generation workflow
- [ ] Add Storybook screenshots showing all Button/IconButton variant states
- [ ] Draft executive summary section (1 page version for Elliot)
- [ ] Identify which parts belong in a Figma documentation frame vs this markdown file
- [ ] Automate the screenshot capture step (see `docs/case-study/screenshot-guide.md`)
