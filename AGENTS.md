<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

# AGENTS.md

Repo orientation for Claude Code, Codex, Cursor, and any other LLM coding agent.
`CLAUDE.md` imports this file and adds the designer-facing rules on top.

## What this is

S2A, the Spectrum 2 design system for adobe.com: tokens, components, Storybook,
a Figma plugin, MCP servers, and a contract pipeline that reads a component
from its evidence (Figma file, shipped code) and generates the rest. Lately it
also describes Adobe's own Spectrum 2 library, so Forge and Milo can be built
from one source.

## Layout

```
apps/
  contract-book/     edit a contract's defs, see refusals, sign off (dev server on 6007)
  storybook/         every component and variant; Generated/ is ours, Spectrum/ mounts Adobe's elements
  s2a-toolkit/       the Figma plugin: Extract contract, docs tools, the figma-console bridge
  authoring-poc/     S2A Studio, the page-authoring prototype
  s2a-ds-mcp/        MCP server for tokens and component specs
packages/
  components/        our components: defs, evidence, contract, spec per slug (18 contracted)
  spec-dictionary/   the pipeline: scaffold, build, render (lit · milo · upstream), systems.mjs
  spectrum2/         Spectrum 2 vendored from @adobe/spectrum-wc, with its own contracts
  tokens/            the token source (Figma export) and the CSS build
  milo-atoms/        generated: decorators over authored markup, for Milo
  milo-blocks/       generated: Milo blocks
evals/               gate, visual parity, golden sheets and variant renders
docs/                workflows, guardrails, audits, future-notes (handoff briefs live here)
context/             HANDOFF.md, the Milo submodule (reference only), golden dataset (gitignored)
playbooks/           methods, including the agent-workflow playbook this file follows
scripts/             repo scripts and the agent hooks
inbox/               rough drops for /sort (gitignored except README)
```

## Conventions

- **Branches:** `main` is what ships. Work on a feature branch; `/start-feature`
  makes one with a draft PR and a preview URL.
- **Commits:** scoped prefix when the scope is obvious (`tokens: move md breakpoint
  to 768`), plain prose otherwise. No emojis unless asked.
- **Co-authored-by:** include the trailer when an agent materially contributed.
- **Never commit, push, deploy, or open a PR unless asked.**
- **Tokens:** semantic only in components and CSS; never a primitive, never a
  literal without an inline `Primitive:` or `hardcoded:` reason. `validate_css`
  on the `s2a-ds` MCP checks this.
- **Figma is the design truth for our own components; the shipped code is the
  truth for a library someone else ships.** Never edit a Figma design to match
  code. Never edit a derived file (`*.contract.json`, generated CSS/JS); change
  the defs and rebuild.

## Where things stand

Each active area keeps a `STATUS.md`: what it is, how to run it, what is in
progress, open threads, and decisions with the reason for each. Read the area's
file before starting work there. At the end of a session, update it. Git stays
the record of what changed in code; the status file says why and what's next.

| Area | Status file | Other notes |
|------|-------------|-------------|
| Contract pipeline | `packages/spec-dictionary/STATUS.md` | `docs/future-notes/multi-system-contracts.md` |
| Spectrum 2 contracts | `packages/spectrum2/STATUS.md` | `docs/future-notes/merch-card-from-s2-atoms.md` |
| Our components | `packages/components/STATUS.md` | |
| Tokens | `packages/tokens/STATUS.md` | `packages/tokens/CHANGELOG.md` |
| Contract Book | `apps/contract-book/STATUS.md` | `apps/contract-book/README.md` |
| Storybook | `apps/storybook/STATUS.md` | |
| Figma plugin | `apps/s2a-toolkit/STATUS.md` | |
| Evals and gate | `evals/STATUS.md` | `docs/evals/eval-discipline.md` |

## Starting and ending a session

Every session, whichever tool runs it:

- **Start:** read `context/HANDOFF.md`, then the STATUS file of the area you
  will work in.
- **End:** follow the save procedure in `.claude/skills/handoff/SKILL.md`.
  Update the STATUS file of each area you touched, then replace
  `context/HANDOFF.md`. In Claude Code this is `/handoff save`; a Stop hook
  will remind you once if there is work newer than the last handoff. In
  Codex and Cursor, read the skill file and do the same steps.

## Working rules

- **Stay in the area you're working on.** Mention a problem elsewhere in a
  sentence; don't fix it unless asked.
- **Write plainly.** Short sentences the owner can read out loud. No jargon
  they would have to define. Every substantive reply opens with a TL;DR.
- **Prototype in the real code**, not in a throwaway document. Diagrams and
  boards go to Figma or FigJam through the figma-console MCP, never to a chat
  artifact.
- **Never print secrets.** Name the variable and where it lives (`FIGMA_ACCESS_TOKEN`
  in `.env`), never its value.
- **Evidence is read, never authored.** Judgment lives in `*.defs.json`. A
  contract that cannot be derived is refused, not guessed at.

## Design-System Guardrails

- Before running any MCP codegen (Codex/Claude/Cursor), read the guardrail docs in [`docs/guardrails/`](docs/guardrails/) and paste the "Guardrail reminder" snippet from [`docs/guardrails/no-primitives-in-components.md`](docs/guardrails/no-primitives-in-components.md) into the agent prompt.
- Reject or fix any generated code that uses primitive tokens without an inline `Primitive:` comment.
- When authoring or editing **documentation frames in Figma**, follow [`docs/guardrails/figma-documentation-readability.md`](docs/guardrails/figma-documentation-readability.md): cap every text node per the measured table (never over 80 characters), 150% line height, pin the frame's theme collection to Dark, and re-resolve paint literals.

## Repository Docs to Reference

- Use the workflow primer in [`docs/workflows/figma-to-code-workflow.md`](docs/workflows/figma-to-code-workflow.md) whenever the conversation touches the end-to-end process (Figma → tokens → Storybook → Milo).
- Pull contextual rules/examples from [`story-ui-docs/`](story-ui-docs/) so Story UI/Codex stay aligned with the existing components/tokens.
- Strategy/north-star conversations should cite [`docs/north-star/`](docs/north-star/) (e.g., `GOALS_2026.md`, `PRESENTATION_OUTLINE.md`).
- The audit playbook (`docs/workflows/design-system-audit-*.md`) is how a design-system audit becomes a FigJam board and a roadmap.
