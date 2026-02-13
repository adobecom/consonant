# Adobe.com Design System North Star — Operating Model + Pilot (C2 + Milo)

## Problem Statement (where we are)

Today, Adobe.com’s design system and Milo platform are being built reactively, block‑by‑block:

- **No shared architectural contract** between design (Consonant and redesign) and Milo and code.
- **Fragmented design patterns** create unconnected variants and surface bugs in production.
- **“Test once” can’t roll out clearly** across surfaces (Figma → Milo → authoring).
- **Redundancy, confusion, and limited scalability** slow or block C2 adoption.

## Telemetry Gap (missing wedge for leadership buy‑in)

We’re missing adoption + ROI telemetry, so everyone is guessing:

- **“We can’t measure design‑system adoption today.”**
- **“We can’t see which variants are used, where.”**
- **“We can’t quantify cost vs value (ROI).”**
- **“Telemetry turns governance from vibes → actionable tradeoffs.”**
- **“Pilot must include a telemetry MVP + cost model storyline.”**

## North Star (destination)

Adobe.com’s design system becomes a **versioned product** where:

- Tokens + component specs are the **source of truth**.
- Figma, Milo, docs, and future frameworks are **compiled outputs**.
- Outputs are powered by **automation and agentic workflows.**

## North Star – EXPANDED

In 2026, Adobe.com runs on a **compiler‑style design system**:

- Tokens and components/blocks are **versioned products** that define:
  - Styling, anatomy, variants, accessibility requirements, and Milo authoring semantics.
- From those contracts, we **compile repeatable outputs**:
  - System‑ready Figma libraries, Milo block configs, docs, and spec‑driven code.
- Governance and telemetry make:
  - **Promotion paths** from bespoke “Tier 2 moments” → core system.
  - **Quality, performance, and platform constraints** first‑class.
- The system dramatically **reduces drift** between redesign intent and implementation.

---

## What this North Star _is_

- **An operating model for shipping a design system**
  - Map of how work moves:
    - strategy/ownership → systemization → build → verification gates → runtime integration → publishing.
  - Answers: **“How does C2 actually get built and shipped safely?”**

- **A roles‑and‑responsibilities contract**
  - Defines who owns what (even if informally):
    - Architect sets direction + contracts.
    - Docs/DevEx shapes publishing / enablement + AI inputs.
    - Accessibility DRI defines gates + expectations.
    - Builders + Design Engineers turn specs into reusable system parts.
    - Platform engineers integrate into runtime.
  - Answers: **“Who is accountable for each part of the machine?”**

- **A dependency graph + sequencing tool**
  - Shows what has to exist before other things can happen  
    (contracts → specs → implementation → tests → integration).
  - Helps avoid **“we can’t ship because X wasn’t defined.”**

- **A governance and quality‑gates model**
  - Makes “quality” explicit as **gates** (a11y requirements, tests, docs alignment)  
    instead of vibe‑based review.

- **A shared language for alignment**
  - Aligns design + engineering + leadership around the **same mental model**,  
    so conversations stop being abstract.

## What this North Star _is not_

- **Not** a big‑bang rewrite of Adobe.com or Milo.
- **Not** “AI designs the system” — **contracts** are the source of truth.
- **Not** React‑first / framework‑specific (Milo is blocks in HTML/CSS/JS).
- **Not** adding bureaucracy — it’s about making **quality explicit and repeatable.**
- **Not** blocking MVPs — MVPs still happen; **scaling is gated.**
- **Not** perfection upfront — we **prove via pilot + metrics.**

---

## Thesis (how we get there)

We get there by:

- Treating **tokens and component/block specs as versioned products** (system of record).
- Compiling **repeatable outputs** for Milo, documentation, and authoring.
- Gradually syncing Figma to those specs (assisted workflows now; more automation later).
- Using **AI/MCP** to accelerate the repetitive 80% (discovery, scaffolding, validation, docs).
- Making **a11y + CI/CD gates** non‑negotiable quality rails.

This requires a **deliberately cross‑functional team model**:

- Clear contract ownership (architect/operator).
- UX scaling for systemization.
- DS designers for componentization.
- Design engineers for implementation.
- Platform engineering for runtime + CI enforcement.

---

## Why now (2026 inflection)

- **Design systems are shifting** from handoffs + tribal knowledge → **contracts + pipelines.**
- The winning pattern is **“define once → compile outputs”** (design, runtime, docs, authoring).
- **AI accelerates the repetitive 80%**; humans focus on judgment (UX, a11y nuance, performance, platform constraints).
- Adobe.com scale **requires contracts + governance**, not “a few people keeping it together.”
- The redesign is the **perfect proving ground**: real needs + real constraints + real rollout.

## Current state (what’s working)

- Milo is a **real production platform** with established constraints and distribution.
- Consonant provides **pattern gravity and mental models** for blocks.
- Token/variables momentum exists (taxonomy, variable work, export pipeline underway).
- People already **“think in systems”**, but are missing the **system infrastructure.**
- Sidekick already matters as an **authoring surface** (tags as API).
- Author teams are already doing system thinking — the **workflows + source of truth** need to catch up.

---

## Updated mental model (two “tops”)

### Top A — Initiative Driver (Demand)

- **Elliot / Feature UX**
  - Redesign drives real UI needs and MVP designs (demand signal).
  - Produces MVP designs; not responsible for systemization.

### Top B — System of Record (Contracts)

- **System Architect + DS governance (tokens + specs + guardrails)**
  - Own **contracts + pipelines + guardrails**; prevent drift.
  - UX Scaling is the **systemization gate**: decides what becomes site‑wide vs MVP‑only.
  - DS Designers / Figma Builders:
    - Take the system‑ready package and build **token‑wired C2 blocks** in the Figma library.
  - Design Engineer / Technologist + Architect:
    - Build Storybook refs, run a11y tooling, write dev docs — **leveraging MCP/AI.**
  - Milo/Platform + Design Engineer:
    - Partner to implement in Milo and satisfy runtime constraints.
  - Authoring:
    - Is a **consumption surface**; tags/presets are the author‑facing API.
    - Constraints feed back upstream into specs.

> **System of record lives in the DS repo**: versioned tokens + versioned specs + validation gates.

---

## North Star model (at a glance)

**Flow: Demand → Contracts → Systemization → Outputs**

### Product 1: Token Pipeline (versioned)

- Primitives + semantics → **component tokens.**
- Outputs platform‑safe bundles (CSS vars, JSON, typed maps).

### Product 2: Component Specs Repo (versioned)

- YAML/JSON contracts:
  - Anatomy, slots, variants, behaviors, a11y constraints.
- Includes a **Milo authoring contract** (tags/axes/mapping).

### Compiler Outputs (stretch)

- Figma: component sets + variants + variable bindings + docs frames.
- Milo: block scaffolds/registry + token consumption + behavior hooks.
- Docs: MDX pages, prop tables, token coverage + a11y checklists.
- Future targets: React/WC/etc via render adapters (optional).

### Pillar A – Tokens as Product (design ↔ dev contract)

- Canonical token repo, versioned and validated.
- Figma variables are **synced/validated** against token version.
- Milo consumes tokens as a dependency (not copied values).
- CI rules:
  - Naming + structure enforcement.
  - Mode completeness (no missing values).
  - Renames require migration map.
- Outputs: CSS custom properties, JSON, optional TS maps.

### Pillar B – Component Specs as Data (the contract)

Each component/block spec defines:

- Anatomy: parts, slots, required structure.
- Variant axes: size/state/treatment/layout/etc.
- Props/API: what consumers set.
- Token bindings: canonical keys (semantic/component tokens).
- Behavior model: what changes on states (hover/focus/disabled).
- Accessibility contract: keyboard, ARIA, focus, contrast expectations.
- Constraints: invalid combos + rationale.
- Docs fields: usage guidance templates.

> Component APIs‑as‑data replace hand‑built variants as the primary work.

### Pillar C – Compiler Outputs (Figma + Milo + Docs)

- Figma generator (plugin):
  - Paste/load YAML spec + preflight validation.
  - Create component sets, variants, properties.
  - Bind to variables by canonical keys.
  - Generate docs frames: variant table, props, token list, a11y checklist.
- Milo generator (CLI):
  - Generate block registry entries + variant maps.
  - Generate token usage expectations + hooks.
- Docs generator:
  - MDX/Markdown pages from spec fields.
  - Prop tables + variant matrices.
  - Token coverage report + “required tokens”.
  - A11y test checklist.

---

## Team Flow + Authoring Surface (lanes)

### Lanes

- **System of Record (Versioned Products)**
- **Reference + Docs**
- **Build + Ship**
- **Authoring (Consumption Surface + Feedback)**

### Must include

- MVP design package → **“system‑ready package”**.
- Contracts/specs → generators → Storybook/docs.
- Token bundles → Milo runtime.
- Tag Manifest → Sidekick presets/tag picker.
- Feedback loop: authoring constraints → UX Scaling/specs.

### Redesign‑driven Flow + System Contracts (lifecycle)

Stage flow (explicit):

1. Feature UX ships MVP (demand).
2. Design Engineer + Architect build refs / docs / a11y tooling.
3. Gate: should scale?
4. UX Scaling systematizes (axes/states/responsive completeness + rules).
5. DS Designers/Figma Builders componentize + bind tokens.
6. Milo/Platform + Design Engineer integrate into runtime + CI/CD enforcement.
7. Authoring consumes (tags/presets); constraints feed back upstream.

---

## Milo Authoring Contract (tags become first‑class)

### Today

- Tags are opaque codes mapping to **block + variant classes/config**.
- Under the hood: tag → block + variant config.
- Authors choose variants via tags (Sidekick/SharePoint).

### North Star

- Tags become **structured + semantic** (machine/doc/AI‑readable).
- **Tag Manifest** generated from specs:
  - tag → block + variant axes/values.
  - Feeds Sidekick Tag Selector/presets.
  - Keeps legacy tags working (compat mapping).
- Authoring is the **real API**: tags are the contract surface for content teams.

---

## Governance: one‑offs, extensions, promotion path (Tier policy)

One‑offs vs system‑wide: **99% system / 1% “moments.”**

- **Tier 0 – Core C2**  
  DS‑owned, token/spec‑governed, Milo core.

- **Tier 1 – Extensions**  
  Surface‑owned, DS‑governed via contracts; **promotable.**

- **Tier 2 – Bespoke moments**  
  Rare, time‑boxed; require a11y + baseline contracts + exit plan.

- **Promotion path**  
  Tier 2 → Tier 1 → Tier 0 based on **reuse + telemetry.**

---

## Quality Gates + Accessibility Ownership

### Ownership

- **UX Scaling + DS Designers**: a11y baselines + intent (semantics, focus/keyboard, content rules).
- **Architect + Design Engineer**: required spec fields + Storybook/a11y SDX setup.
- **Platform Engineers**: CI/CD enforcement (block regressions, keep checks stable).

### Gates to show

- Validation gate (schema/spec completeness).
- A11y gate (Storybook + pipeline).
- Platform gate (runtime constraints/perf).
- Docs gate (required fields + publish).

---

## Team Org + AI Leverage

- **Feature UX (Redesign Driver)** — AI: Low  
  Produces MVP designs; not responsible for systemization.

- **System Architect / Compiler Operator** — AI: High  
  Owns contracts + pipelines + guardrails.

- **UX Scaling (Consonant)** — AI: Medium  
  Uses AI for discovery/clustering + doc drafts, not for “design generation.”

- **DS Designers** — AI: Medium  
  Componentize manually today; use AI for checklists/docs and drift validation.

- **Design Engineers** — AI: High  
  Code/story/test/a11y scaffolding; automation‑heavy.

- **Milo Platform Engineers** — AI: Medium  
  Runtime constraints, integration, compat/perf checks.

---

## Pilot plan (How to eat an elephant)

### Pilot focus

Pilot = **Elliot’s site redesign**, aligned to roadmap POC block build.

### Deliverables for the pilot

- Token pipeline stable enough for redesign (versioned artifacts, CI checks).
- Lock in redesign block/component family that moves through:
  - Stage 1 MVP → Stage 2 scaling → Stage 3 contract/build.

### Outputs ship together

- Milo implementation + tests.
- Storybook/reference page.
- Docs generated.
- Tag Manifest entry (or preset list) for authoring.

### Success criteria

- Adding a new variant becomes **a contract update + repeatable build.**
- Fewer outliers / less churn / less drift during rollout.
- Telemetry captured (adoption + variant usage).
