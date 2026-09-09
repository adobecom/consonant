# The Eval Discipline (S2A)

You have agents that generate things — component code from a design, Figma
component sets from a contract, docs, token releases. Some outputs are great. Some
are a mess. Without a way to **measure** quality, every change from here is
guesswork. This doc establishes the discipline that lets us improve on purpose.

> **If you can't measure it, you can't improve it.** Every improvement technique —
> better prompts, better context, better tools, a new model — is meaningless
> without a number to compare against. That number comes from evals.

---

## Why evals (and not just unit tests)

Traditional software has unit tests: given an input, assert an exact output. Our
generation is **probabilistic** — the same prompt can produce different output run
to run. A unit test can't tell you whether the model got "good enough," and it
can't catch a regression where the output still passes a hardcoded check but is
subtly worse.

Evals are our test suite for that world. They:

- **Establish a baseline** — how good is the system *right now*.
- **Catch regressions** — a prompt tweak, model upgrade, or tool refactor that
  makes things worse.
- **Measure improvement** — prove a change actually helped, with a number.
- **Expose weaknesses** — hard cases the system can't handle yet become concrete
  targets.

---

## Golden datasets

"Golden dataset" is not an AI term — it's the classic idea of a **true,
verified reference set** you compare against. The canonical example: you have 100
screenshot tests for a web app, you refactor from Vue to React, everything is
*supposed* to look identical. You re-run the screenshots and diff the React output
against the **golden** (the validated Vue screenshots). Any pixel delta means the
React version is wrong — because the golden was established as true.

A golden dataset is a **curated, verified set of outcomes** — captured, generated,
or hand-written — that you've validated as accurate. For us, each test case has:

- **`input`** — what the user (or upstream contract) provides.
- **`direction`** — which generation flow (see below).
- **`expectedCharacteristics`** — *properties* a good output has (not one exact
  output). "3 rectangles labeled Start/Process/End connected by 2 arrows" — not
  exact pixel positions.
- **`difficulty`** — simple / medium / hard / edge.
- **`category`** — tokens / a11y / layout / variants / functionality / structure.
- **`polarity`** — positive (should do) or negative (should refuse — see below).
- **`golden`** *(optional)* — validated reference artifacts for deterministic
  comparison: a golden screenshot, an expected token-binding map, the spec itself.

The key move: we pin the agent to **characteristics**, not a single frozen answer.
A component that renders pixel-correct and passes axe is a good response whether or
not its source matches ours line-for-line.

---

## Our two directions — and the one thing they share

Everything we eval is "generate an artifact from a contract, then score the
artifact **against that contract**." The contract is the **component `spec.json`**
(it already declares `variants`, `props`, `tokenBindings`, and `a11y`). That spec —
plus a validated reference render — is the golden.

### Direction A — Design → Code

An engineer generates a pixel-perfect component implementation (our web-component +
CSS) from the design system (Figma / the `s2a-ds` MCP / the tokens).

**Score the generated code against the spec + a golden render:**

| Dimension | How | Deterministic? |
|---|---|---|
| **Pixel-perfect** | Playwright renders each variant/state/breakpoint → screenshot → pixel-diff vs a golden reference (Figma export or a validated baseline) | Mostly (threshold on diff) |
| **Token compliance** | `s2a-ds` MCP `validate_css` / `audit_css` — no primitive tokens, no hardcoded hex/px | ✅ (error codes) |
| **Spec conformance** | Diff generated props/variants/states against `spec.json` | ✅ |
| **Functionality** | Playwright interaction — click, disabled, keyboard nav, focus | ✅ |
| **Accessibility** | `@axe-core/playwright` — violations with stable rule IDs | ✅ (error codes) |
| **Visual quality / intent** | LLM-as-judge against `expectedCharacteristics` | ✗ (judged) |

### Direction B — Contract → Design

A designer generates a Figma component set from a component contract — the variant
matrix, token bindings, layer structure, property order, and rules.

**Score the generated Figma against the spec, read back via the figma-console MCP:**

| Dimension | How | Deterministic? |
|---|---|---|
| **Structural conformance** | Read back the component set — variant axes/values match the spec, correct count, property-panel order, layer naming (`.root`, `.label`, …) | ✅ (reuse `/audit-figma`) |
| **Token binding** | Every fill/stroke/spacing/radius bound to an S2A variable — never a raw value | ✅ (error codes) |
| **Contract adherence** | The `s2a:meta` fence / description matches the contract | ✅ |
| **Visual** | Screenshot the generated set vs a golden reference | Mostly |
| **Visual quality / intent** | LLM-as-judge | ✗ (judged) |

Both directions iterate: generate → score → fix → re-score until it matches the
contract.

---

## Designing test cases

Spread cases across difficulty so the baseline has room to climb. The gains show up
in the hard and edge cases — that's the point.

- **Simple** — a Button, a basic Card. One variant axis, obvious tokens. The agent
  should ace these. *(These are your regression evals.)*
- **Medium** — a component with 2–3 variant axes, a nested sub-component, a
  responsive rule.
- **Hard** — MerchCard with slots and light/dark de-slotting, ElasticCard
  expansion, a dense variant matrix, a full component-doc suite. The naive agent
  struggles here. *(These are your capability evals.)*
- **Edge (2–3)** — vague ("make me a card"), contradictory ("a knockout card on a
  white surface"), or the **kitchen sink**: *"build the component with these five
  variants, bind all tokens, add the a11y annotations, generate the docs, and don't
  forget the dark mode."* Technically all things the agent should do — but stacked
  so high it stretches the agent to its limit. This is where you learn the
  **dependability** of the agent under real, messy input.

### Positive vs negative cases

Not every case is "do this well." Some are **"nah, I'm not doing that"** — the
agent *should refuse* or correct course. These test your guardrails:

- "Build this with hardcoded `#ff0000` and `16px`." → should refuse / use semantic
  tokens instead. (Your token hierarchy is non-negotiable.)
- "Add `bgBrand` to this doc surface." → should refuse (Adobe red, inaccessible).
- "Hardcode `Context=on-dark`." → should use variable modes instead.

A good suite says explicitly: *we want coverage for these; we want the agent to
**refuse** these.* Passing a negative case = correctly declining.

> **Who are you building this for?** If you only solve the happy path — the user
> who pasted a perfect JSON contract with every detail — you've built a demo. The
> value is in the hard, vague, over-stuffed, and adversarial inputs. Design the
> dataset for the users you actually have.

---

## Scoring

### Three kinds of scorer, in order of preference

1. **Deterministic / error-code scorers (prefer these).** Code decides pass/fail
   and emits a **stable violation code**, not a fuzzy number. Examples: axe rule
   IDs (`color-contrast`, `button-name`), our own token codes
   (`PRIMITIVE_TOKEN_IN_CSS`, `HARDCODED_HEX`, `MISSING_TOKEN`), spec-conformance
   diffs. Fast, free, reproducible, and **diffable across runs** — you can say "run
   B introduced 3 new `HARDCODED_HEX` violations." Most of what we care about is
   code-checkable, so most of the suite should be this. *(This is the "error codes"
   approach — a categorized violation taxonomy beats a single vibe score.)*
2. **Pixel-diff scorers.** Render (Playwright) → screenshot → diff vs golden
   (`pixelmatch` / `odiff`). Score = % match or SSIM, with a threshold. Deterministic
   given a stable render environment.
3. **LLM-as-judge (last resort).** For genuinely subjective calls — "is the visual
   hierarchy right," "does this match the design intent" — that code can't decide.
   Costs tokens, non-deterministic; reserve it for what the first two can't cover.

### The 1–5 rubric

For the judged cases (and manual review), one shared rubric so scores don't drift:

| Score | Meaning |
|---|---|
| **5** | Excellent. Matches all expected characteristics. Pixel-correct, tokens clean, a11y passes, functionality correct. |
| **4** | Good. Most characteristics. Minor issue — a slightly off value, imperfect spacing. |
| **3** | Acceptable. Basic structure there, noticeable issues — a primitive token slipped in, one wrong variant, a missing label. |
| **2** | Poor. Recognizable attempt, major problems — broken layout, wrong token tier throughout, missing states. |
| **1** | Failed. Empty, errored, or completely wrong (built a flat component when the spec declared a variant set). |

### Reliability metrics (because it's non-deterministic)

Run each case **k** times:

- **pass@k** — correct in *at least one* of k attempts. For "best-of-k" creative
  generation.
- **pass^k** — *all* k attempts correct. This is the one that matters for
  **shipping tokens/components others depend on** — you need it right every time,
  not once in five.

### Capability vs regression

- **Regression evals** = the simple cases. "Did we break the basics?" Gate CI on
  these.
- **Capability evals** = the hard cases. "Can the agent now handle MerchCard
  slots?" These start low and should climb as we improve.

A good suite has both.

---

## The scorer toolbox

| Tool | Role |
|---|---|
| **Playwright** | Headless render, interaction, keyboard/focus, screenshots — the backbone of code-side evals |
| **pixelmatch / odiff** | Pixel-diff a render against a golden screenshot |
| **@axe-core/playwright** | Accessibility violations as stable rule IDs (deterministic a11y scoring) |
| **`s2a-ds` MCP** (`validate_css`, `audit_css`, `validate_spec`) | Deterministic token + spec scorers — the same validators the agents use, reused as eval scorers |
| **figma-console MCP** | Read back generated Figma for structural + token-binding assertions (Direction B) |
| **LLM-as-judge** | The subjective visual/intent cases only |
| **Evalite** (candidate) | TypeScript-native eval framework: dashboard, scorer functions, run-over-run comparison — so nobody hand-edits JSON |

> The highest-leverage move: extract our validators (`validate_css` / `audit_css` /
> `validate_spec`) into a shared lib consumed three ways — by the agents (MCP
> tools), by CI, and by the eval scorers. One definition of "what's a violation,"
> one source of truth, deterministic everywhere.

---

## Where this lives

There's already a partial harness on `chore/eval-harness-and-tooling` (`evals/`,
`npm run eval`, with scorers like DimensionBinding, VersionHygiene, and deprecation
checks, gated in CI). This doc is the **discipline that harness should grow into**:
golden datasets with difficulty + polarity, the two directions, deterministic-first
scoring, capability vs regression, and pass^k for the must-always-be-right cases.

**Next steps:**

1. Author `evals/datasets/golden.json` for real components — start with Button
   (regression), grow to MerchCard / ElasticCard (capability), and add negative
   cases for the token-hierarchy guardrails.
2. Wire the deterministic scorers first (token codes, spec conformance, axe) — they
   pay for themselves immediately and need no model.
3. Add Playwright pixel-diff against golden renders.
4. Adopt a dashboard (Evalite) so runs are comparable without squinting at JSON.
5. Reserve LLM-as-judge for the visual/intent cases the above can't decide.

---

*Concept credit: the general eval discipline (golden datasets, capability vs
regression, pass@k/pass^k, the 1–5 rubric) follows the standard AI-engineering
framing; everything above is adapted to S2A's contracts, tokens, and the two
generation directions.*
