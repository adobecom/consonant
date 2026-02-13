# Consonant 2 × Milo North Star Presentation

> Run time: ~30 minutes. Below is a slide-by-slide breakdown with suggested speaker notes. Cite the repo docs live where helpful.

---

## Slide 1 – Title & Objective

**Title:** "Figma → Milo: Guardrail-Driven Workflow for Consonant 2"

**Speaker notes:** "Today I'll walk through the proposal for how we _will_ convert Figma designs into Milo-ready HTML/CSS/JS using the design token pipeline, Figma MCP, and Story UI guardrails. The repo already sketches the system; I'll show the path to make it our standard flow."

---

## Slide 2 – Where We Are Today

**Bullets:**

- **Token pipeline disconnected** – s2a-tokens exists, but without a shared repo/hand-off process, every drop requires manual coordination, so drift and delays creep in.
- **Components aren't atomic** – Milo blocks are monolithic; there's no atom/molecule library, so Story UI/Codex can't reuse building blocks.
- **Reactive block builds** – Consonant + Milo collaborate per hero/lockup without a shared architecture, so every rebuild starts from scratch.
- **No automation** – Without guardrails + automated tests, we can't auto-generate code/stories. Engineers spend time re-creating markup instead of focusing on the final 20% (performance, UX, a11y).

**Speaker notes:** "Let's be honest about where we are today. First, the token pipeline is disconnected. s2a-tokens exists, but without a shared repo and hand-off process, every drop requires manual coordination. Drift and delays creep in. Second, components aren't atomic. Milo blocks are monolithic—there's no atom/molecule library, so Story UI and Codex can't reuse building blocks. Third, we have reactive block builds. Consonant and Milo collaborate per hero, per lockup, without a shared architecture. Every rebuild starts from scratch. And fourth, there's no automation. Without guardrails and automated tests, we can't auto-generate code or stories. Engineers spend time recreating markup instead of focusing on that final 20 percent—performance, UX, accessibility. This is the friction we live with today."

---

## Slide 3 – Where We Want To Be

**Bullets:**

- Single automated loop: Figma → `s2a-tokens` → guardrailed Story UI → Milo blocks.
- Components are atomized (atoms → molecules → blocks). Assets come straight from Figma MCP.
- Storybook is the "developer API": stories + YAML drive documentation, a11y, visual regression, overlays vs. design intent.
- Milo engineers auto-generate ~80–90% of each block from those specs and spend their time on fit + finish.

**Speaker notes:** "So here's the North Star: a single automated loop. Figma flows into our token pipeline—that's `s2a-tokens`—then through guardrailed Story UI, and out comes Milo blocks. Components are atomized—atoms, molecules, blocks. Assets come straight from Figma MCP, so there's no drift. Storybook becomes the developer API. Stories plus YAML drive documentation, accessibility checks, visual regression, and overlays against design intent. And here's the key: Milo engineers auto-generate 80 to 90 percent of each block from those specs. Their time goes to fit and finish—performance tuning, UX nuance, accessibility edge cases. The North Star is a predictable system. Designers stay in Figma, devs stay in HTML/CSS/JS, AI assists but never leaves the rails, and Milo gets clean handoffs."

---

## Slide 4 – North Star Diagram

**Graphic:** simple arrow diagram: Figma → Token pipeline (`s2a-tokens`) → Guardrails (`docs/guardrails/`, `story-ui-docs/`) → Milo blocks.

**Speaker notes:** "Here's the flow in simple terms: tokens originate in Figma Variables. They flow through `s2a-tokens`—that's our versioned token pipeline. Then Story UI and Codex reuse our existing Button, Product Lockup, hero assets—all the components that live in the Consonant repo. The guardrails—those are in `docs/guardrails/` and `story-ui-docs/`—they keep everything on track. And the output? Plain HTML/CSS/JS blocks for Milo. No framework lock-in, no interpretation. Just clean, repeatable blocks."

---

## Slide 5 – Workflow Overview

**Content:** Table of phases 1-8 (Design, FigmaLint, MCP Codegen, Token Binding, Asset Download, Component Scaffold, Storybook, Refine). See [`docs/workflows/phase-table.md`](../workflows/phase-table.md).

**Speaker notes:** "This is the eight-phase workflow. Design happens in Figma. Then we run FigmaLint to validate. MCP codegen pulls the context. Token binding connects everything. Asset download gets the backgrounds and logos. Component scaffold builds the structure. Storybook validates and documents. And finally, we refine. Each phase is documented in `docs/workflows/FIGMA_TO_CODE_WORKFLOW.md`. The key is: designers stay in Figma, devs use HTML/CSS/JS, and Storybook runs all the validation checks. No one has to learn a new tool or leave their comfort zone."

---

## Slide 6 – Guardrail Deep Dive

**Bullets (keep simple):**

- **Tokens** – One canonical set of design tokens; no hard-coded colors or sizes.
- **Components** – Button, Product Lockup, hero assets all live in the Consonant repo so AI + humans reuse them instead of rebuilding.
- **Storybook** – Acts as the contract: every story runs accessibility/visual checks and captures the intended behavior.
- **Assets** – Backgrounds/logos come straight from Figma so the final block matches design.
- **Milo handoff** – Storybook + specs become the "developer API," letting Milo engineers auto-generate most of the block and focus on polish.

**Speaker notes:** "This is the secret sauce. Five guardrails that make this work. First, tokens: one canonical set. No hard-coded colors, no hard-coded sizes. Everything flows from the token pipeline. Second, components: Button, Product Lockup, hero assets—they all live in the Consonant repo. AI and humans reuse them instead of rebuilding. Third, Storybook: it's not just documentation. It's the contract. Every story runs accessibility checks, visual regression, and captures the intended behavior. Fourth, assets: backgrounds, logos—they come straight from Figma MCP. No manual downloads, no drift. The final block matches design exactly. And fifth, the Milo handoff: Storybook plus specs become the developer API. Milo engineers auto-generate most of the block and focus on polish. This is the secret sauce. AI sees real examples in `story-ui-docs/`, and our guardrails catch any drift before it becomes a problem."

---

## Slide 7 – Architecture Artifacts

**Table:**
| Area | Artifact |
|------|----------|
| Workflow | `docs/workflows/FIGMA_TO_CODE_WORKFLOW.md` |
| Guardrails | `docs/guardrails/*` |
| Story UI Context | `story-ui-docs/` |
| Design Tokens | `packages/design-tokens/` |
| Components | `packages/components/` |
| Storybook | `apps/storybook/` |
| Milo Runtime | `context/milo/` |

**Speaker notes:** "I want to emphasize: every box in this table exists in the repo today. This isn't a proposal for something we need to build. The workflow is documented. The guardrails are written. Story UI context is there. Design tokens are versioned and released. Components are built. Storybook is running. And we have the Milo runtime context. This is real. It's sketched out, it's working, and we're proposing to make it the standard flow. You can go look at any of these right now."

---

## Slide 8 – Demo: Building Atomic Components

**Content:** Screenshots showing:

1. Creating atomic components in Figma (Button with variants, Product Lockup)
2. FigmaLint validation showing component readiness for MCP and design system best practices
3. Sign-off checkpoint

**Speaker notes:** "Let me walk you through what we've actually built. First, we created two atomic components: Button with a couple variants, and Product Lockup. These are the building blocks. Then we ran FigmaLint to establish how ready these components are for MCP—checking design system best practices, token bindings, variant structure. Once we have sign-off on that, we know these components are ready for the next phase. This is the foundation: atomic, validated components."

---

## Slide 9 – Demo: Generating Storybook Components

**Content:** Screenshots showing:

1. Using Figma MCP + Codex/Cursor in code editor
2. Generating components in Storybook instance
3. Iteration process (showing refinements needed due to non-tokenized Consonant 1 elements)

**Speaker notes:** "Next, we go into Cursor—or whatever your code editor is—and we use Figma MCP along with Codex to create those components inside a Storybook instance. Now, I had to do a couple iterations on this because things from Consonant 1 aren't fully tokenized, so I had to makeshift some of this. But the point still holds true: Figma MCP pulls the design context, Codex generates the code, and we get Storybook components. We review them, make sure they're good, and then we're ready for the next step."

---

## Slide 10 – Demo: Story UI Block Generation

**Content:** Slide showing "Block Generation with Story UI" with:

**Three Hero Block Examples (top):**

- Left: hero-sq-ctr variant with image background
- Middle: hero-mq-ctr variant with product lockup (Adobe/Photoshop)
- Right: hero-mq-ctr variant (refined version)

**Three Attempt Sections (bottom):**

- **First Attempt:** Initial prompt to Story UI with full context—hero marquee block, product lockup, buttons, background image. Generated block has basic structure but missing key elements and proper component usage.
- **Second Attempt:** Refined prompt, shorter and more focused on specific components (Button, Product Lockup) and token usage. Block shows improvement with product lockup appearing, but still needs refinement.
- **Third Attempt:** Final iteration with learned context from previous attempts. Block closely matches design intent with proper component usage, token alignment, and correct layout structure.

**Speaker notes:** "Now here's where it gets interesting. I open Story UI, coming in as a designer or product manager. I say, 'Look, I have this old block from Consonant 1, but I want to use my new updated components and I want to use my tokens.' And here you can see three attempts at generating the hero marquee block. First attempt: I give Story UI enough context to understand what I'm trying to build—the hero marquee with product lockup, buttons, background. It generates something, but it's not quite right. Second attempt: I refine the prompt, keep it short and sweet, focus on the key elements. We're getting closer. Third attempt: By this point, Story UI has learned from the previous iterations, and we're very close to alignment with the design. Look at these three blocks—you can see the progression. The first one is basic, the second adds the product lockup properly, and the third is refined. And remember: this is all with a kind of broken, piecemeal system. We're working with components that aren't fully atomic yet, tokens that aren't fully connected. But you can only imagine: when we have everything atomized, everything tokenized, and we're able to bring those things in cleanly, we can have the specs—the coded designs—exactly as we intended as design system designers and architects. This isn't just a design-level thing. We need to be thinking at both the design and dev level. And people can come in and iterate, riff off ideas inside Story UI. That's the demo: generating components, generating a block, and iterating until it's right."

---

## Slide 11 – Demo: The Full Loop

**Content:** Summary diagram or final screenshot showing:

- Components created → Tokenized → Figma MCP → Storybook → Story UI → Block generated
- "Package up and deploy" handoff point

**Speaker notes:** "So here's the full loop we just walked through. We build the components and tokenize them. We use Figma MCP along with an LLM to generate those components in Storybook. We look them over, make sure they're all good. Then we go into Story UI, create a marquee, see how close we can get—how many prompt attempts it takes to get there—even with this kind of broken setup, this incomplete setup. And from there, it would be package up and deploy and hand off. Now, I want to be clear: this demo shows what's possible with our current piecemeal system. When we have everything fully atomicized and tokenized, this process will be even smoother, even faster, and the outputs will be even better. But this proves the concept works. The foundation is there."

---

## Slide 12 – Process – Who Owns Each Phase?

**Caption:** "End-to-end workflow diagram showing phases 1–7 (Demand & MVP → Token Pipeline → Build/Ship) with ownership callouts. Full interactive version: https://adobedotcom-c2.netlify.app/c2-technical-workflow."

**Speaker notes:** "This chart makes the workflow feel real. You can see exactly who owns what. Demand and MVP sits with product—that's Elliot's team driving the redesign. Design contracts and token authoring sit with the Design System crew—that's us. Automation lives in the MCP/Story UI phase. And Milo engineering owns the ship and telemetry loop. Everyone can see where they plug in and where the handoffs occur. There's no ambiguity about who's responsible for what. The full interactive version is at that URL if you want to dive deeper."

---

## Slide 13 – What It Takes

- **Process** – Formalize the 8 workflow phases with clear owners (Design → FigmaLint → MCP → Storybook → Milo).
- **Automation** – Guardrail lint + CI checks, Story UI pipeline integration, MCP connectors trained on our docs.
- **Tooling** – Maintain the Consonant repo (tokens + components + docs), Storybook CI, Milo runtime environments.
- **People/Time** – Small pilot squad (design tokens lead, component engineer, doc writer, Milo partner) to run the loop and report metrics.

**Speaker notes:** "This isn't just a slide deck. Here's what we actually need to make this real. Process: we need to formalize those eight workflow phases with clear owners. Design, FigmaLint, MCP, Storybook, Milo—each phase needs someone accountable. Automation: guardrail lint plus CI checks, Story UI pipeline integration, MCP connectors trained on our docs. Tooling: we need to maintain the Consonant repo—tokens, components, docs—plus Storybook CI and Milo runtime environments. And people: a small pilot squad. Design tokens lead, component engineer, doc writer, Milo partner. That's it. They run the loop and report metrics. Everything else is already sketched in this repo. We're not starting from zero."

---

## Slide 14 – Roadmap & Metrics

**Phases:**

1. Current: hero marquee + lockup shipped with guardrails.
2. Next: more blocks + lint rule to reject guardrail violations.
3. Later: integrate Milo deployment + QA dashboards.
4. Scale: open the workflow to other teams.

**Metrics:** design→code lead time, # blocks generated, accessibility pass rate, token drift issues caught.

**Speaker notes:** "Here's the roadmap. Current state: we've shipped hero marquee and lockup with guardrails. That's proof of concept. Next: more blocks plus a lint rule that actually rejects guardrail violations in CI. No more 'we'll fix it later'—if it violates the guardrails, it doesn't merge. Later: integrate Milo deployment and QA dashboards. And finally, scale: open the workflow to other teams. The metrics we'll track: design-to-code lead time, number of blocks generated, accessibility pass rate, and token drift issues caught. These phases tie directly to our North Star doc. One more thing: we'll keep the system aligned with Milo's actual codebase by training Story UI and Codex on `context/milo/`. Today Milo blocks aren't atomic, so this proposal pushes us to build Consonant 2 as true atoms, molecules, organisms—giving Story UI the building blocks it needs to assemble new blocks safely."

---

## Slide 15 – What's the value

**Bullets:**

- Predictable delivery pipeline, measurable velocity gains, and fewer regressions eating into engineering time.
- Reusable authoring workflow where AI co-pilots stay inside guardrails and blocks ship faster.
- Design systems + AI finally pull in the same direction, with MCP-powered proof that Consonant 2 can scale.

**Speaker notes:** "So what's the value? First, we get a predictable delivery pipeline. Measurable velocity gains. Fewer regressions eating into engineering time. Every block follows the same path, so you know what to expect. Second, we get a reusable authoring workflow. AI co-pilots stay inside guardrails, and blocks ship faster. It's not AI running wild—it's AI that stays on the rails. And third, design systems and AI finally pull in the same direction. This is MCP-powered proof that Consonant 2 can scale. Everyone in the chain sees real benefits. This isn't just a tech demo—this is how we scale Consonant 2."

---

## Slide 16 – Benefits for the org

**Bullets:**

- **Consistency & Theming** – One token pipeline + atomic components mean every block looks/behaves the same across surfaces.
- **Accessibility & Performance** – Storybook guardrails run a11y/visual checks; engineers focus on final polish.
- **Scalable & Team-Agnostic** – Doc-driven system lets any team use Story UI to generate new blocks without tribal knowledge.
- **Fast Experimentation** – AI + Story UI become safe sandboxes for rapid iterations, so we can test ideas in hours instead of weeks.

**Speaker notes:** "Let's talk about the benefits for the organization. First, consistency and theming. One token pipeline plus atomic components means every block looks and behaves the same across surfaces. No more drift, no more 'this looks different on this page.' Second, accessibility and performance. Storybook guardrails run accessibility and visual checks automatically. Engineers focus on final polish, not recreating markup. Third, it's scalable and team-agnostic. The doc-driven system lets any team use Story UI to generate new blocks without tribal knowledge. You don't need to know the secret handshake. And fourth, fast experimentation. AI and Story UI become safe sandboxes for rapid iterations. We can test ideas in hours instead of weeks. That's the organizational value."

---

## Slide 17 – Call to Action

**Ask:**

- Endorse continued investment in guardrail-driven automation.
- Greenlight integration with Milo's deploy pipeline.
- Support rollout to other teams (docs, training, MCP connectors).

**Speaker notes:** "So here's what I'm asking for. First, endorse continued investment in guardrail-driven automation. This is the foundation—without it, everything else falls apart. Second, greenlight integration with Milo's deploy pipeline. We need that handoff to be seamless. And third, support rollout to other teams. That means docs, training, MCP connectors—everything that makes this accessible beyond just our pilot squad. With your approval, we can make this the default way Consonant 2 ships Milo blocks. Not an experiment. Not a pilot. The standard. Questions?"

---

## Demo Decision Point (For Discussion with Josh & Takahiro)

**Current Demo State:**

- Shows the workflow with existing piecemeal system (Button, Product Lockup, hero marquee)
- Demonstrates concept works even with non-atomic/non-tokenized components
- Proves the loop: Figma → MCP → Storybook → Story UI → Block generation
- Shows iteration/refinement process (4 screens of alignment improvement)

**Options for Making Demo More Robust:**

**Option A: Full End-to-End Rebuild (Danielle's idea)**

- Take an existing Consonant 1 block
- Rebuild it completely in Consonant 2 (atomic components, tokens, guardrails)
- Show full workflow from start to finish
- **Pros:** Shows complete system working, real-world example
- **Cons:** Requires significant time investment, may delay presentation

**Option B: Start Fresh with Elliot's Redesign**

- Take Elliot's redesign designs
- Do the inventory (foundations → atoms → molecules → organisms)
- Run the full workflow as a test case
- **Pros:** Aligns with actual redesign work, proves system with real designs
- **Cons:** Requires coordination with Elliot's team, may need design handoff

**Option C: Keep Current Demo, Enhance with Context**

- Use existing screenshots but add more context slides
- Emphasize "this works now with broken system, imagine with full system"
- Add a slide showing "what full system would look like" (vision)
- **Pros:** Ready now, shows potential clearly, doesn't require rebuild
- **Cons:** Less "complete" feeling, requires strong narrative about potential

**Recommendation:** Option C for presentation, with Option B as follow-up pilot work. The current demo proves the concept; the redesign intake sprint (8 weeks) can be the full proof point.

---

_Use the supporting docs for deeper dives or follow-up questions._
