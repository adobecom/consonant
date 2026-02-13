# North Star Addendum: CAS + Authoring Platform Alignment + Periodic Re-evaluation

Date: 2026-01-29  
Context: Notes synthesized from meeting with Engineering + Elliot’s team (AI-generated transcript; verify details)

---

## Why this addendum exists

We have platform and architecture assumptions (performance, authoring model, encapsulation choices) that were made ~7–8 years ago. The platform has delivered strong outcomes (notably performance), but the usability cost and system drift risks are becoming more visible.

This addendum proposes:

1. A **repeatable re-evaluation cadence** for major platform assumptions.
2. A **practical path to improve authoring UX** without triggering a “CMS replacement” platform rewrite.
3. A **clear alignment plan for CAS (Card as a Service)** so it does not diverge from the global design system.

---

## Meeting notes (condensed and organized)

### 1) CAS (Card as a Service): architecture + design implications

**What CAS does**

- Renders collections of cards (search/filter/interaction).
- Can scale to very large libraries (up to ~10,000 cards).
- Cards can be dynamically populated and personalized.

**Design variability**

- Legacy decisions allow variable grid/gutter/spacing patterns.
- Multiple stakeholders want fewer options + clearer standards.

**Encapsulation**

- CAS delivers content + encapsulated styles (functionally “iframe-like” isolation).
- Upside: consistency of CAS across pages/sites.
- Downside: makes global design updates harder and risks parity drift with non-CAS page elements.

**Scope reality**

- CAS is not universal. Many “card-like” and triptych patterns exist outside CAS.
- Improvements to CAS alone do not automatically “fix cards everywhere.”

---

### 2) Authoring platform: principles + constraints

**Author-first philosophy**

- Content authors (not engineers) are the primary builders of pages.
- Authoring is text-driven and intended to be readable and low-skill.
- Content is structured in Word/DA docs before code is written.

**Consistency and structure**

- Structured, machine-readable content is core: fewer duplicates, scalable patterns.
- Must support responsive behavior (mobile/desktop) consistently.

**Performance**

- Performance is treated as a top-level requirement (Core Web Vitals / Lighthouse goals).
- Platform chosen in part due to performance/scalability shortcomings in older systems.

**Accessibility and global readiness**

- Accessibility is non-negotiable; metadata (alt text, etc.) is expected upstream.
- Internationalization matters (variable content lengths, languages, RTL/LTR).

**Current authoring limitations**

- Limited formatting controls by design (font sizing/alignment restrictions).
- Variants and tables/flags used to control layout/features.
- Acknowledged pain: lack of intuitive controls / WYSIWYG; complexity managing variants.

---

### 3) Flexibility vs simplicity debate (key tension)

**Shared goal**

- Reduce author confusion and system bloat while supporting both:
  - Standardized “template” content (majority)
  - Exceptional, high-craft “moments” (minority)

**Proposed mechanism**

- Templates + variants for the 80–90%.
- “Sandbox moments” lane for bespoke/high-impact exceptions.
- Strong defaults and selective exposure of advanced features.

---

### 4) Workflow demo takeaways

- Authors use Sidekick to insert blocks, configure variants, manage breakpoints via tables/flags.
- Media handling varies by breakpoint; preview exists and can be iterated quickly.
- Accessibility metadata depends on upstream providers reliably supplying it.
- Desire: better QA tools (overlay comps during preview).

---

### 5) Follow-up tasks captured in meeting

- Align CAS styling with global design system tokens/updates to prevent parallel changes.
- Define what design controls authors should/shouldn’t have (padding/type/alignment, etc.).
- Improve accessibility metadata flow (e.g., alt text) from providers through ingestion.
- Establish rules for text alignment and variance (RTL/LTR and global content).
- Evaluate implementing a comp overlay feature in DA preview for faster QA.

---

## Observations (what the meeting is really revealing)

### A) CAS achieves consistency by isolation — but increases drift risk

Encapsulation prevents pages from breaking CAS styling, but it also creates a second styling universe unless CAS is explicitly token-aligned and versioned against the global design system.

### B) The authoring platform achieves scalability by restriction — but author UX is costly

The platform’s strictness is intentional and valuable, but the current authoring surface (docs + blocks + tables) is difficult to use for many teams and can become a friction multiplier.

### C) Everyone is converging on the same shape of solution

- Templates first.
- Small, curated variant set.
- A formal “sandbox moments” lane.
- Better QA tooling.
- Stronger upstream metadata governance (a11y + global readiness).

---

## Proposal: add these capabilities to the North Star

### 1) Continuous Architecture Re-evaluation (cadence + mechanism)

**Principle:** Re-validate major platform assumptions on a predictable cadence (e.g., every 24 months or when constraints shift materially).

**Why now**

- Authoring pain is high.
- Design drift risks are emerging (CAS vs global DS).
- Discovery patterns are changing (AI summaries/zero-click behaviors), widening the trade space beyond classic “SEO-only thinking.”

**Mechanism**

- Define hypotheses.
- Run small, reversible pilots.
- Use clear success criteria and publish results.

---

### 2) Authoring Experience Layer (improve authoring without replacing delivery)

**Goal:** Fix the “building pages in Word/DA tables” pain without sacrificing platform fundamentals (performance, consistency, scalability).

**Strategy**

- Keep the delivery model (Milo/EDS) stable.
- Add a guided authoring layer that outputs/compiles into the same block model.

**Key idea**

- One delivery engine (fast, proven).
- Multiple authoring experiences (choose what works for authors/designers).
- A consistent “content model → blocks” contract in the middle.

**What this unlocks**

- Better UX for authors.
- Less variant-table/flag complexity exposed to humans.
- Guardrails remain intact.

---

### 3) Sandbox Moments Lane (formal escape hatch)

**Definition**
A controlled lane for bespoke, high-craft pages/moments where designers + engineers collaborate.

**Why**

- Prevents “system bloat” in the core templates.
- Protects the author-first platform from becoming a design-tool-in-a-CMS.
- Makes exceptions explicit, owned, and governable.

**Guardrails**

- Intake criteria (impact threshold).
- Owners and maintenance plan.
- Sunset/retire strategy.
- Token parity requirements.

---

### 4) Design Parity Contract for CAS

**Goal:** Ensure CAS stays aligned with global design system tokens and updates.

**Mechanism**

- Define a CAS styling contract:
  - tokens CAS must consume (type scale, spacing, radii, colors, shadows, etc.)
  - minimal allowable overrides
- Version tokens and enforce dependency alignment.
- Add parity checks in review:
  - typography parity
  - spacing parity
  - grid/gutter parity
  - a11y parity

---

### 5) QA Overlay in Preview (reduce churn)

**Goal:** Reduce ticket churn and subjective debates by enabling overlay of design comps during DA preview.

**Outcome**

- Faster alignment.
- Clearer “what changed” feedback.
- Less back-and-forth across design/engineering/authoring.

---

## Risks (and how to de-risk)

### Key risks

- Pilot becomes a proxy war or political referendum.
- Scope creep: “one moment” becomes a second platform.
- Testing the wrong thing (authoring change + runtime change + tags change all at once).
- Edge routing/caching mistakes create artificial perf regressions.
- Analytics/RUM attribution becomes ambiguous (can’t segment Milo vs pilot cleanly).
- SEO/canonical mistakes cause crawl/index problems.
- Operational overhead: second pipeline, monitoring, incident response.
- Design system divergence if pilot doesn’t consume the same tokens/contracts.

### De-risk guardrails

- Pre-register success criteria and scope boundaries.
- Change one variable at a time (authoring UX vs runtime).
- Route-based, reversible deployment with strict robots/canonical controls.
- Ensure segmentation in RUM/analytics from day one.
- Require token parity and a11y parity as non-negotiables.

---

## Practical next steps (smallest meaningful progress)

### 1) Define the “author controls menu”

Document the limited set of controls authors should have (and why):

- Allowed: (examples) layout template choice, density presets, safe CTA variants, image/video selection, module ordering.
- Restricted: arbitrary padding, arbitrary typography, arbitrary alignment (unless governed).
- Include global content/RTL/LTR considerations.

### 2) Standardize grid/gutter options for CAS

Reduce option explosion:

- pick 2–3 approved grid/gutter presets.
- document when each is allowed.

### 3) Create the “Moments template library”

Start with 3–5 templates:

- Base Moment (hero + copy + CTAs)
- Gallery/collection Moment (cards)
- Video/feature Moment
- Comparison Moment (if applicable)
  Each template:
- has strong defaults
- exposes a small variant set
- includes accessibility requirements

### 4) Start a “single moment” pilot plan (if needed)

Goal: validate authoring improvements and parity (not a platform rewrite).

- One moment built with improved authoring workflow.
- Rendered through the existing delivery engine.
- Measure: authoring time, QA churn, parity outcomes, and vitals.

### 5) Improve accessibility metadata reliability

Work with providers/ingestion to ensure:

- alt text is mandatory and preserved
- meta tags are consistent
- validation occurs at ingestion, not after publish

---

## North Star statements (paste-ready)

### North Star principle

**Performance remains a hard requirement, but platform decisions must be periodically re-validated with data and optimized across outcomes: user experience, authoring velocity, maintainability, global readiness, and discoverability.**

### Capability statements

- **Continuous Architecture Re-evaluation:** Validate core assumptions every 24 months with controlled, reversible experiments.
- **Authoring Experience Layer:** Improve authoring UX via templates and guided controls that compile into platform blocks.
- **Sandbox Moments Lane:** Enable bespoke experiences with explicit governance and ownership.
- **CAS Parity Contract:** Ensure CAS consumes global tokens and inherits global design updates predictably.
- **QA Overlay in Preview:** Reduce churn by enabling comp overlays in DA preview workflows.

---

## Open questions to answer next

1. What are the 5–7 author controls we permit (and why)?
2. What qualifies as a sandbox moment (and who owns it long-term)?
3. What are the approved grid/gutter presets (CAS + general page)?
4. What is the CAS token/versioning dependency model?
5. How do we enforce a11y metadata completeness upstream?

---
