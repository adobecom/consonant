# Handoff

Where the last session stopped and what to pick up. Read this first, then the
STATUS file of the area you will work in. Replace this file at the end of
every session; the STATUS files hold the detail, this points at them.

Agents writing here at the same time: read the file again just before you
write, keep the other session's entries, and add your own.

## Last session

- **Date:** November 2, 2026.
- **Tool:** Claude Code. The work itself ran October 27 to 30; this note was written when the agent-workflow playbook was set up.
- **Branch:** `feat/plugin-doc-single-component`. About 140 paths uncommitted, including whole untracked trees (`packages/spectrum2/`, `packages/milo-atoms/`, `playbooks/`, the golden folders under `evals/datasets/contracts/golden/spectrum:*`). Not pushed. Nothing from the Spectrum 2 work is committed yet.
- **Servers:** none running. Storybook (6006) and the Contract Book (6007) were both killed by the OS for memory during the session; start them from your own terminal, not from an agent.

### Touched

- **Contract pipeline** — contracts can be drafted from shipped code (`--from=code`); a selector classifier reads Spectrum's and our CSS grammars into one shape; `systems.mjs` declares what a design system is; a third renderer (`upstream`) mounts a library's own element in Storybook; the Milo target has an atom mode. Details: `packages/spec-dictionary/STATUS.md`.
- **Spectrum 2 contracts** — seven contracts read from `@adobe/spectrum-wc`: avatar, badge, button, button-group, card, divider, icon. Details: `packages/spectrum2/STATUS.md`.
- **Contract Book** — stripped to evidence, defs, refusals, sign-off; Render and Parity use Storybook. Details: `apps/contract-book/STATUS.md`.
- **Storybook** — `Spectrum/` group of Adobe's real elements, plus "design only" stories for variants the code cannot show. Details: `apps/storybook/STATUS.md`.
- **Tokens** — answered the heading-2 / h5 breakpoint report: Milo's copy of the tokens predates 0.0.22, where `md` moved from 1024 to 768. Details: `packages/tokens/STATUS.md`.
- **Docs and board** — `docs/future-notes/multi-system-contracts.md`, `docs/future-notes/merch-card-from-s2-atoms.md`, and the FigJam board "The contract layer, explained" (Agentic S2A → Forge x S2 x Milo Audit, section `2285:19720`).
- **Agent workflow** — the playbook set up: AGENTS.md, eight STATUS files, hooks, skills, inbox, and `scripts/session-digest.py` (written from the playbook spec; the `phantom` repo it says to copy from does not exist). First run read this week's sessions and caught one repeated correction. The owner still has by-hand steps (see Watch).

## Pick up here

1. **Token adapter** (roadmap step 3): a Spectrum contract's `{swc.*}` references rendered as `--s2a-*`, generated from `@adobe/spectrum-design-data`, which publishes both names per token. Start in `packages/spec-dictionary/lib/renderers/milo.mjs` and `css.mjs`; the acceptance is Button's atom emitting `--s2a-*` from the Spectrum contract.
2. **CSS-only atoms** (typography, link): a contract from a stylesheet with no `.d.ts`. The drafter (`lib/from-code.mjs`) has to read `--modifier` classes as the API.
3. **Milo token bump**: the heading-2 / h5 thread wants Milo's `libs/c2/styles` token files moved to tokens 0.0.23, and the `@media (width >= 1024px)` block in Milo's `styles.css` moved to 768. Not our repo; make sure the owner of the Milo change has the answer in the Slack thread.
4. **Hooks not yet active**: run `bash scripts/hooks/install-claude-hooks.sh`, restart Claude Code (see Watch).

## Watch

- `packages/spectrum2/` and `packages/milo-atoms/` are untracked. Nothing from the Spectrum 2 work is committed; a bad `git clean` loses it.
- The gate is red on purpose: `SCHEMA_LOCK` covers two deliberate schema loosenings (any token namespace; `asset` needs only `prop`). Relock with `npm run gate:lock` or revert — the owner's call, still open.
- `packages/milo-blocks/*.css` is stale against the renderer (round radius, no fallbacks); re-render before relying on it. The six atoms (button, checkbox, control-button, helper-text, link, radio) moved to `packages/milo-atoms/` and their old block folders were deleted.
- `.env` holds `FIGMA_ACCESS_TOKEN`; it is gitignored and excluded from the zip at `~/Desktop/consonant-2-2026-10-30.zip`.
- The toolkit manifest (`apps/s2a-toolkit/manifest.json`) gained `figjam` in `editorType` so the bridge runs on FigJam boards.
- By-hand steps from the playbook still to do: install the Claude hooks, set `cleanupPeriodDays` and `CLAUDE_CODE_FORCE_SESSION_PERSISTENCE` in the global `~/.claude/settings.json`, trust the hooks in Codex with `/hooks`, confirm the prompt log appears, then commit.
- Six decisions are waiting on the owner (on the FigJam board, chapter 6): what Recast is; Milo's web-component line; the missing avatar styles; which Figma library holds the merch-card redesign; the schema lock; whether Forge keeps React Spectrum for components or only icons.
