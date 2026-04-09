# Claude Code commands (Consonant / S2A)

Slash commands in this folder encode **how we want Figma ↔ tokens ↔ docs** to behave when using Claude with **figma-console MCP**.

## Commands

| Command | File | Intent |
| --- | --- | --- |
| `/component-docs` | [`commands/component-docs.md`](./commands/component-docs.md) | **Human tech specs** in Figma: five `.sheet frame` sections, ELI5 copy, live instances, semantic tokens, **padding vs gap vs margin** (spacing-scale tokens), Specs-style visuals, WCAG-oriented accessibility, do/don’t usage — onboarding + reference for design **and** eng. |
| `/spec` | [`commands/spec.md`](./commands/spec.md) | **Design spec frames** (Structure, Color, API, Index) next to the component for dense QA and token/prop readouts. Complements `/component-docs`, does not replace it. |

## Shared goals (north star)

1. **Truth from the file** — Variants, properties, and variable bindings come from `figma_execute`, not guesswork.
2. **Semantic tokens only** on doc surfaces — See `docs/guardrails/no-primitives-in-components.md` for code; same spirit in Figma (bind variables / text styles, no ad-hoc hex).
3. **Annotations off the component** — Doc and spec frames sit **beside** the component set; don’t pollute the published component with sticky layers (see `docs/guardrails/figma-component-authoring.md`).
4. **Context-safe MCP** — Long build sessions + inline screenshots blow Codex/Claude context; use **two-phase** capture in `docs/workflows/codex-figma-console-context.md`.

## Canonical workflow write-up

For the **full reconstructed process**, goal-to-sheet mapping, POUR template, safe-execution rules, and per-component checklist, see **[`docs/workflows/in-figma-component-documentation.md`](../docs/workflows/in-figma-component-documentation.md)**.

## Codex parity

The same workflows are mirrored under `.codex/skills/` for OpenAI Codex (`component-docs.skill.md`, `figma-console-safe-execution.skill.md`).
