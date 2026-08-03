# S2A Component Evals

An eval harness for the design-system pipeline, modeled on AI-engineering eval
discipline: **you can't improve what you can't measure.** Instead of eyeballing
every generated/edited component, we score it against encoded S2A rules and
track it over time — so a prompt, model, or component change is *proven* better
or worse, and regressions get caught before merge.

## Model: extract → snapshot → score

Figma output can't be `zod.parse`d like JSON, so we normalize a component set
into a **snapshot** (plain JSON), then score the snapshot offline. That keeps
scoring deterministic and CI-runnable, and decouples it from a live Figma.

```
figma-console (extract) ──▶ evals/snapshots/<slug>.json ──▶ npm run eval
```

1. **Extract** — run `evals/extract-snapshot.figma.js` inside `figma_execute`
   against a component-set node id (Claude + figma-console does this). Save the
   returned object to `evals/snapshots/<slug>.json`.
2. **Score** — `npm run eval` loads `golden.json`, pairs each case with its
   snapshot, runs every scorer, and prints a scorecard. Non-zero exit on a
   gating failure, so it works as a CI merge gate.

```bash
npm run eval            # score every case
npm run eval -- radio   # score only cases matching "radio"
```

## Scorers (deterministic)

| Scorer | What it enforces | Origin |
|---|---|---|
| **TokenBinding** | Every fill/stroke bound to a *semantic* token — no primitives, no raw hex, no designOnly leaks | the `validate_css` / no-primitives rule |
| **SpecConvention** | Variant axis order (State→Size→Style→…), Title-Case property names, lowercase-kebab variant values | CLAUDE.md + the variant-casing correction |
| **LightDark** | Modeless definition (no baked Theme-mode pins), colors actually adapt light↔dark (or are intentionally frozen), optional 3:1 contrast in both modes | the highlight/mode-pin lessons |
| **Fidelity** | Does the rebuild *match the reference spec*? Diffs a feature vector (control/dot size, label size/weight/style, container padding, gaps, radius) against the spec, within a 1px tolerance | the manual "type/ring/padding looks off vs Chip's spec" catches |

Rules live in `lib/conventions.mjs`. The first three scorers take a snapshot; Fidelity takes a `{ reference, candidate }` feature file. Scorers return `{ name, score (0–1), pass, details }`.

### Fidelity (correctness vs. matching the spec)
The first three scorers check a component is *well-made*; Fidelity checks it *matches the intended design*. It doesn't diff node-by-node (the spec's ad-hoc frames and our composable components differ structurally) — it compares a small **feature vector** extracted from both. Workflow:
1. Run `evals/extract-features.figma.js` in figma_execute with the spec container + the rebuild container node ids → `{ reference, candidate }`. Save to `evals/features/<slug>.json`.
2. Add `"fidelity": true` to the golden case. `npm run eval` runs the Fidelity scorer alongside the others and lists every delta.

**Every manual "that looks off vs the spec" is a feature to add here** — that's the flywheel.

## Golden dataset

`golden.json` — one case per component: the node to extract, the snapshot to
score, expected characteristics, difficulty, and whether it gates CI. Spread
cases across difficulty (atom → molecule → organism) so the score has room to
move. **Capture real corrections as new cases** — every "that's wrong, it
should…" from a session becomes a regression test (the data flywheel).

## Roadmap
- LLM-as-judge scorer for fuzzy checks (doc voice, anatomy-annotation standard).
- Contrast pairs auto-derived from the component (fg/bg adjacency).
- `pass^k`: extract/score a generation k times to measure *consistency*, not just one pass.
- CI: add `npm run eval` to `.github/workflows/ai-review.yml` as a gate.
