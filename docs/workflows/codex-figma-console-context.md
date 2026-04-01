# Codex + Figma Console MCP — keeping context healthy

## Problem

`figma_capture_screenshot` returns **PNG bytes in the chat transcript**. After many `figma_execute` calls, the history is already huge; **one screenshot** can push the next request over the model limit (`Your input exceeds the context window`). That is a **payload + history** issue, not a broken Figma file.

## Fix: two-phase workflow

| Phase | Codex thread | Tools |
| --- | --- | --- |
| **A — Build** | Same session as long as needed | `figma_get_status`, `figma_execute`, etc. **No** `figma_capture_screenshot`. |
| **B — Capture** | **New** Codex session | Paste only the list of **sheet FRAME** node ids. Then **one** `figma_capture_screenshot` per turn (`scale: 1`). Never target a **PAGE**. |

End Phase A by handing off: sheet names + node ids (e.g. `.Link — Anatomy` → `3885:713`).

## If Phase B still fails

Export frames from Figma (see [`docs/case-study/screenshot-guide.md`](../case-study/screenshot-guide.md)) and commit PNGs under `docs/case-study/screenshots/` (or your component folder).

## Repo automation

- Codex: `.codex/skills/component-docs.skill.md` and `.codex/skills/figma-console-safe-execution.skill.md`
- Claude Code command: `.claude/commands/component-docs.md`
- Cursor: `.cursor/rules/figma-console-execution.mdc`
