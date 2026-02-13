## C2 Parity Compiler Loop (PCL)

**Define once (contracts), compile outputs, enforce parity with deterministic gates.**

---

## 0) Why PCL exists (why we go deep on design ↔ code alignment)

### Without explicit design–code parity

- Design becomes a suggestion; code becomes an interpretation.  
- Every component is rebuilt from scratch → variant explosion + drift.  
- Docs + authoring become manual, churny, and inconsistent.  
- Accessibility becomes late‑stage cleanup (“we’ll fix it later”).  
- “Performance” and “platform limitations” stay a black box (opinion‑driven).

### With explicit parity (contracts + reference truth)

- Debates change from “no” → constraint + evidence → tradeoff → decision.  
- Storybook becomes the reference truth (DOM/CSS/JS + a11y + tests + docs).  
- Milo/Platform integrates instead of reinventing.  
- Telemetry becomes possible (adoption + variant usage + ROI).

> **Bottom line:** the *details* are the contract. The contract is what scales.

---

## 0) Principles (the rules of the game)

- Tokens + specs are the **source of truth** (versioned, validated, reviewed).  
- Figma is a **consumer**, not the system of record.  
- Storybook is the **parity lock** (reference DOM/CSS/JS + tests + docs).  
- Milo is **integration + runtime constraints**, not “design system engineering.”  
- Guardrails are **modular + short** (small markdown files, big impact).  
- AI accelerators (scaffolding + synthesis) are allowed, but **gates are deterministic**  
  (schema/tests/a11y/visual).

---

## 0.5) Parity charter (what “1:1” means)

**Parity is:**

- Same **variant axes in design and code** (size/variant/tone/state, etc.).  
- Same **token bindings** (semantic keys; no copied values).  
- Same **DOM intent** (semantic structure + behaviors).  
- Same **a11y contract** (keyboard, focus, accessible name rules, ARIA only when needed).  
- Same **docs + tests** generated/validated from the contract.

**Parity is NOT:**

- “Figma layers equal DOM nodes.”

**Instead, every Figma layer must map to one of:**

1. A real DOM element, or  
2. A real CSS mechanism (background/border/pseudo‑element), or  
3. A documented design‑only affordance (rare, intentional).

---

## 1) Roles + lanes (org model PCL assumes)

**Demand lane**

- Feature UX / Redesign: provides demand signal + MVP designs.

**Systemization lane**

- UX Scaling: systemization gate (axes, states, responsive completeness, rationale).

**System of Record lane**

- Architect + DS Design + Design Engineer/Technologist: tokens/specs/guardrails, Storybook reference truth, docs, tests, releases.

**Platform lane**

- Milo/Platform: integration, perf budgets, CI/CD enforcement, authoring integration constraints.

---

## 2) PCL steps (the full loop)

### Step 1 — Establish foundations (Token Product)

**Purpose:** make “design language” consumable and enforceable.

- **Inputs:** primitives + semantics → component tokens (+ modes).  
- **Outputs:** `tokens.css`, tokens JSON (and optional typed maps), versioned release.  
- **Gates:** naming/taxonomy validation, mode completeness, collision checks, migration maps for renames.  
- **Owner:** Architect + DS Eng.

---

### Step 2 — Spec Product (component contract as data)

**Purpose:** define the contract design + code must both satisfy.

- **Inputs:** systemized design intent (from UX Scaling).  
- **Outputs:** one spec per component/block (YAML/JSON) containing:
  - Identity + status (core/extension/bespoke).  
  - DOM blueprint (semantic root, slots, forbidden structures).  
  - Variant axes (names/values are source of truth).  
  - Token bindings (semantic keys).  
  - Behavior model.  
  - A11y contract.  
  - Docs fields.  
  - Constraints + invalid combos + rationale.  
- **Gates:** schema validation + completeness checks (required fields).  
- **Owner:** Architect + UX Scaling + DS Design/Eng.

---

### Step 3 — UX Scaling Gate (systemization decision)

**Purpose:** prevent one‑offs from becoming permanent debt.

- **Input:** MVP needs + redesign patterns.  
- **Output:** “system‑ready package”:
  - Normalized axes, states, responsive completeness.  
  - Decision log (why this axis, why these constraints).  
  - Authoring implications (what can authors pick?).  
- **Gate:** scale decision and variant explosion control.  
- **Owner:** UX Scaling.

---

### Step 4 — Figma Build Rules (No Fake Web)

**Purpose:** ensure Figma components map cleanly to the web and to the contract so implementation is repeatable, not interpretive.

- **Inputs:**
  - Spec contract (axes, DOM intent, token bindings, a11y requirements).  
  - Tokens/variables (semantic keys + modes).  
- **Output:** Figma components with:
  - Semantic root intent (built like the real element).  
  - Variants that match contract axes (same names + allowed values).  
  - Token bindings for visuals (no copied values).  
  - Slot‑based anatomy (icons/label/etc map to real “parts”).  
- **Core rule:** contract parity (not “layer = DOM”).
  - Figma layers do **not** need to equal DOM nodes.  
  - Every layer must map to one of:
    1. Real DOM element, or  
    2. Real CSS mechanism (background/border/pseudo‑element), or  
    3. Documented design‑only affordance (rare, intentional).  
- **Owner:** DS Designers + Figma Builders.  
- **Gate:** Figma parity checklist review.

#### “No Fake Web” checklist (required)

1. **Model the semantic root like the real element**
   - Button root represents `<button>`.  
   - Link root represents `<a>`.  
   - Input root represents `<input>` (wrapper only when truly required).  
   *Rule: prefer native semantics; avoid “role hacks” when a native element exists.*

2. **Don’t add implementation‑fiction layers**
   - Avoid absolute‑position background layers used only to simulate fill.  
   - Prefer root fills/strokes/effects that map to CSS background, border, box‑shadow.  
   *Exception (must be explicit): if you truly need an overlay, treat it as a pseudo‑element equivalent (e.g. `overlay::before`) and document why.*

3. **Variant property names must map to real prop axes**
   - Figma variant properties use the same axis names as code/spec (variant, size, tone, state, layout, emphasis, icon, etc.).  
   *Rule: if it can’t map to a real axis, it doesn’t belong as a variant prop.*

4. **Bind everything to tokens/variables**
   - Spacing, radius, typography, color, shadow → variables/tokens.  
   - No “mystery values” except explicitly documented exceptions.

5. **Slot‑based structure over decorative structure**
   - Clear slots like “left icon”, “label”, “right icon”.  
   - Don’t encode “mask stacks” or implementation quirks as required anatomy.

6. **States must be representable in code**
   - Hover / focus‑visible / disabled states map to real browser states and behaviors.  
   - Focus rings modeled as focus‑visible intent, not a permanent visual trick.

**Gate: Figma parity checklist review (pass/fail)**  
Fail if:

- Variant props don’t match spec axis names/values.  
- Visuals are not token‑bound.  
- Component relies on implementation‑fiction layers.  
- Slot intent is unclear or inconsistent.  
- State modeling cannot map to real web behavior (esp. focus‑visible/disabled).

**Optional (future‑ready) — “Extractor preflight”**

If exporting ANOVA (or other tooling) from Figma:

- Treat “oddities” as signals to fix (not requirements to replicate).  
- Normalize axis names/values.  
- Document any intentional exceptions (overlay pseudo‑element, etc.).

---

### Step 5 — Storybook Reference Implementation (parity lock)

**Purpose:** ship the “truth surface” the platform can trust.

- **Input:** spec + tokens.  
- **Outputs:**
  - Reference HTML structure.  
  - Reference CSS (token‑driven).  
  - Reference JS behaviors (only where needed).  
  - Variant matrix stories (full axis/state coverage).  
  - Docs scaffolds hooked to spec fields.  
- **Gate:** story completeness (every axis/state).  
- **Owner:** Design Engineer/Technologist + Architect.

#### Key design decision: the “public API”

Use **data‑attributes as props** (framework‑neutral, lintable, maps to Figma), e.g.:

```html
<button
  data-variant="primary"
  data-size="l"
  data-tone="neutral"
  data-state="default"
>
  Save
</button>
```

Why data‑attrs:

1. **Framework‑neutral**
   - Milo is HTML/CSS/JS blocks; contract should outlive any framework (React/WC/etc).  
   - `data-*` works with plain HTML, server‑rendered markup, Markdown‑to‑HTML, web components, React, etc.

2. **Map 1:1 to Figma variant axes**
   - Spec axes = Figma variant axes (variant/size/tone/state).  
   - `data-variant="primary"` is literally the code‑side equivalent of Figma’s `variant=primary`.

3. **Lintable and contract‑testable**
   - Values are enumerable, so CI can validate:
     - Only known axis names exist.  
     - Only known values exist.  
     - Invalid combos are blocked via constraints.  
   - Contract can be enforced in CI without humans eyeballing PRs.

4. **Keep “API” separate from implementation**
   - Classes often become a junk drawer (API‑ish, internal, accidental).  
   - With data‑attrs you can draw a hard line:
     - **Public contract (stable):** `data-variant`, `data-size`, `data-tone`, etc.  
     - **Internal implementation (free to change):** any classes inside the component.  
   - Result: internals can be refactored without breaking the system contract.

5. **Perfect for authoring + telemetry**
   - Authoring contract is already “tag/preset → variant choice.”  
   - With data‑attrs, public contract is the data layer; internal implementation remains flexible.

---

### Tag Manifest → deterministic markup → measurable variant usage

Tag Manifest is a lookup table that says:

> “When an author chooses preset/tag *Promo / Primary / Large*, render:  
> • `block = promo`  
> • `variant = primary`  
> • `size = l`  
> • `tone = brand`”

- Authoring choice becomes explicit **axis values**.  
- Runtime output becomes **deterministic markup**; block generator always emits the same shape:

```html
<section data-c2="promo" data-variant="primary" data-size="l" data-tone="brand">
  …
</section>
```

- Telemetry becomes easy:
  - Find all `[data-c2="promo"]`.  
  - Group by `data-variant`, `data-size`, `data-tone`.  
- That yields **measurable variant usage**, feeding governance and ROI.

---

### Step 6 — Deterministic Gates (tests + a11y + visual)

**Purpose:** enforce parity and quality automatically.

- Contract validation: schema validation, enums, token keys exist.  
- A11y tests: Storybook a11y checks + CI runner.  
- Unit tests: utilities + behaviors + generators.  
- Interaction tests: keyboard/focus/state transitions.  
- Visual regression: variant matrix snapshots to detect drift.  
- **Owner:** DS Eng (setup) + Platform (enforcement in pipeline).

---

### Step 7 — Docs compilation (from the same contract)

**Purpose:** docs stay current without double work.

- **Input:** spec + stories.  
- **Outputs:** docs pages with:
  - Prop/axis tables.  
  - Variant matrix.  
  - Usage guidance.  
  - A11y notes.  
  - Token coverage report.  
- **Gate:** docs required fields or **no release**.  
- **Owner:** DS Eng + DS Design.

---

### Step 8 — Release (ship tokens/specs/reference as a product)

**Purpose:** release is a product event, not just code merge.

- **Outputs shipped together:**
  - Tokens + specs.  
  - Storybook reference build.  
  - Docs.  
  - Tag Manifest updates.  
- **Gate:** changelog + semver + migration notes.  
- **Owner:** Architect + DS Eng.

---

### Step 9 — Milo integration (platform boundary)

**Purpose:** Milo remains the shipping authority without reinventing the system.

- **Inputs:** versioned artifacts + reference truth.  
- **Outputs:** Milo integration that:
  - Respects contract axes naming + behavior.  
  - Satisfies runtime constraints (perf, bundling, rollout).  
  - Gate: platform CI/CD + perf budgets.  
- **Gate:** changelog + semver + migration notes.  
- **Non‑negotiable rule:**  
  If Milo can’t implement something, require **constraint → evidence → alternative → documented decision**.  
  No “performance says no” as a black box.

---

### Step 10 — Authoring Contract (tags/presets as the API)

**Purpose:** authoring is a first‑class consumer.

- **Inputs:** spec axes + constraints.  
- **Outputs:** Tag Manifest (machine‑readable mapping):
  - Tag → block + axis values.  
  - Presets for Sidekick picker.  
  - Legacy compat mappings.  
- **Owner:** Architect + DS Eng (manifest) + Platform (integration).

---

### Step 11 — Telemetry (adoption + ROI)

**Purpose:** governance becomes decisionable.

- **Outputs (MVP):**
  - Where blocks/tags are used.  
  - Which variants are used.  
  - Deprecated usage tracking.  
  - Cost‑model strawman inputs.  
- **Owner:** Platform + DS Eng.

---

### Step 12 — Governance loop (tier policy + promotion path)

- **Tiering:**
  - Tier 0 Core (DS owned, contract governed, Milo core).  
  - Tier 1 Extension (surface‑owned, DS‑governed contract; promotable).  
  - Tier 2 Bespoke (rare, time‑boxed, exit plan; baseline gates still apply).  
- **Promotion:** Tier 2 → 1 → 0 based on **telemetry + reuse**.  
- **Owner:** Architect + governance group.

---

## 3) The Guardrail Ecosystem (“skills” markdown files)

These are the files AI/MCP reads before generating/editing anything.

**Minimal must‑have guardrails (examples):**

- `ARCHITECTURE.md`  
- `PARITY_CHARTER.md`  
- `COMPONENT_CONTRACT_SCHEMA.md`  
- `DOM_BLUEPRINTS.md`  
- `DATA_ATTRIBUTE_API.md`  
- `CSS_ARCHITECTURE.md`  
- `JS_BEHAVIOR_PATTERNS.md`  
- `STORYBOOK_STANDARDS.md`  
- `TESTING_STRATEGY.md`  
- `ACCESSIBILITY_CONTRACTS.md`  
- `MILO_INTEGRATION_CONSTRAINTS.md`  
- `AUTHORING_CONTRACT.md`  
- `VERSIONING_RELEASES.md`  
- `MIGRATIONS_DEPRECATIONS.md`  
- `ROADMAP.md`  
- `AI_OPERATING_RULES.md`

> Key idea: for any given task, load only the 4–6 relevant files, not the entire library.

