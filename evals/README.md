# S2A evals — Button scaffold

A first, runnable slice of the eval discipline (see
[`docs/evals/eval-discipline.md`](../docs/evals/eval-discipline.md)): a golden
dataset for Button plus **deterministic, error-code-style scorers** that need no
model. It proves the loop before we invest in generation, pixel-diff, and judges.

## Run it

```bash
npm run eval:demo        # or: npx tsx evals/demo.ts
```

The demo scores known-good and known-bad candidates (including the *real*
`button.css` and `button.spec.json`) so you can see the scorers behave.

## What's here

```
evals/
  types.ts                    TestCase + ScorerResult + Violation types
  datasets/button.golden.json 8 cases: positive, negative/guardrail, edge, + 1 contract->design
  scorers/
    token-compliance.ts       HARDCODED_HEX/RGB, SUSPECTED_PRIMITIVE_TOKEN, (strict) HARDCODED_PX
    spec-conformance.ts       MISSING_VARIANT_AXIS/VALUE, MISSING_PROP, MISSING_A11Y_SC
    refusal.ts                guardrail scorer for negative cases (SHOULD_HAVE_REFUSED)
    a11y.ts                   STUB — needs Playwright + @axe-core/playwright (axe rule IDs)
  demo.ts                     runnable, no model
```

## The golden dataset

Each case pins **characteristics** (not one frozen answer) and carries
`difficulty`, `category`, and `polarity`. The contract is the component
`spec.json` — its `variants`, `props`, `tokenBindings`, and `a11y` are the golden.

- **Positive** cases: the agent should do it well.
- **Negative** cases (`polarity: "negative"`): the agent should **refuse** — e.g.
  "hardcode `#1473e6`" or "use the primitive `--s2a-spacing-16`". Passing = declining.
- **Edge**: the kitchen-sink case (many correct asks stacked) measures dependability
  under real input, not the happy path.

## Scoring philosophy

Deterministic first (fast, free, diffable), model last:

1. **Error-code scorers** — a stable violation code per finding, so runs are
   comparable ("run B added 3 `HARDCODED_HEX`"). This is most of what a design
   system needs to check.
2. **Pixel-diff** — Playwright render vs a golden screenshot (not in this scaffold).
3. **LLM-as-judge** — only the subjective visual/intent cases.

## Known gap (on purpose)

`token-compliance` flags `SUSPECTED_PRIMITIVE_TOKEN` by **naming heuristic**
(numeric suffix). That's why the real `button.css` shows suspects — the
authoritative check must resolve each token's `designOnly` flag from the token
metadata. The right fix is to extract the `s2a-ds` MCP validators
(`validate_css` / `validate_spec`) into a **shared lib** used by the agents, CI,
and these scorers — one definition of "what's a violation," everywhere.

## Next

- Wire real generation (design->code) and feed outputs through these scorers.
- Swap the token heuristic for the metadata-backed validator (shared lib).
- Add the a11y scorer (Playwright + axe) and pixel-diff against golden renders.
- Adopt a dashboard (Evalite) for run-over-run comparison.
- Reconcile with the existing harness on `chore/eval-harness-and-tooling`.
