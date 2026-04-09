---
skill: figma-console-safe-execution
description: Run reliable figma-console MCP executions for complex spec generation. Enforces timeout sizing, auto-layout FILL ordering, minimal retries, and compact error reporting to avoid context-window failures.
command: /figma-safe-exec [task]
---

## Why this skill exists
Large `figma_console.figma_execute` scripts fail in three common ways: invalid auto-layout operations, short timeouts, and oversized chat payloads. **`figma_capture_screenshot` on huge nodes (especially a PAGE) returns multi‑MB PNGs that get embedded in the chat transcript and trigger `Your input exceeds the context window`**—that is a payload-size issue, not a Figma bug. This skill standardizes safer execution and screenshot scope.

## Codex setup you can follow (two threads)
1. **Thread 1 — Build only:** Run every `figma_execute` until docs are done. Return **only** `{ sheetName, nodeId }[]` plus a one-line summary. **Never** call `figma_capture_screenshot` here.
2. **Thread 2 — Screenshots only:** New Codex session. First message: paste the node-id list + “capture each for repo thumbnails.” Call `figma_get_status`, then **at most one** `figma_capture_screenshot` per assistant turn. If the client still errors, **stop using MCP for images** and export from Figma (File / Export or `docs/case-study/screenshot-guide.md`).
3. **Optional:** Upgrade Codex (`brew upgrade codex`); old clients hit limits sooner.

This pattern avoids **history + image bytes** in a single request, which is what kills “rolling” compaction.

## Execution policy
1. Keep each execute block focused (one logical unit: one table/section/card).
2. Use timeouts by scope:
   - tiny edits: `2000-3000`
   - multi-node table/card/frame generation: `5000-10000`
3. Do not retry identical failing code repeatedly.
   - patch once, retry once
4. Never paste full terminal logs or image payloads into chat.
   - report only: tool name, error string, and 10-30 lines of relevant code

## Screenshot safety (context window)
- **Never** call `figma_capture_screenshot` with a **PAGE** node id or any node whose bounds cover a whole page or variant matrix. Prefer a **single FRAME** (e.g. one “Link — Anatomy” doc frame, ~800–1200px wide).
- If you only need confirmation, prefer **`figma_get_status`** / **`figma_generate_component_doc`** (text) over screenshots.
- After a capture succeeds, **do not** re-embed the image in the assistant reply if the tool already returned bytes—summarize in words (“captured anatomy frame, ~1200×800”) or save to repo path only if your workflow writes files outside chat.
- Use **`scale: 1`** (or lower if supported); avoid 2× on large frames.
- Split visuals: three **small** frames (usage / anatomy / tokens) = **three** screenshot calls on **three** node ids, in **separate** Codex turns if the session is already large—**start a new thread** if token usage is high (~400k+).

## Auto-layout safety rules
- Set `layoutSizingHorizontal = 'FILL'` only after appending to an auto-layout parent.
- Guard assignment when needed:
  ```js
  parent.appendChild(node);
  if (node.parent && node.parent.layoutMode !== 'NONE') {
    node.layoutSizingHorizontal = 'FILL';
  }
  ```

## Text + variable safety rules
- **Always load fonts before setting text characters/styles.** New text nodes default to Inter Regular — if not loaded, `set_characters` throws even before applying a style. Required minimum:
  ```js
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Black' }); // title-4 — NOT ExtraBold
  await figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' });
  ```
- **`createInstance()` is on COMPONENT, not COMPONENT_SET** — calling it on a set throws `TypeError: not a function`.
- **Reassert `primaryAxisSizingMode = 'AUTO'` after every `resize()`** — resize() resets it to FIXED.
- Resolve variables once and reuse references where possible.
- Full reference: `docs/workflows/figma-plugin-patterns.md`

## Suggested run loop
1. `figma_execute` (focused script block)
2. `figma_capture_screenshot` (**narrow FRAME** only, same logical section—not the whole page)
3. visual validation summary (concise, **no image paste**)
4. patch + rerun (max 3 cycles)

## Failure response format
```text
Tool: figma_console.figma_execute
Error: <exact message>
Root cause: <1 sentence>
Patch: <1-2 sentences>
Retry: timeout=<n>, one retry only
```

## Checklist
```text
- [ ] Fresh node ids verified
- [ ] Timeout sized for workload
- [ ] FILL set only after append
- [ ] Font loaded before text mutation
- [ ] One retry max after patch
- [ ] No transcript/image blob pasted in chat
- [ ] Screenshot target is a small FRAME, not PAGE / full matrix
- [ ] New Codex session if prior turn returned huge images or token use is high
```

## MCP `tool call failed` / `figma_get_status` 0ms
That usually means the **Figma Console MCP server or desktop bridge is not running** (or `npx` could not reach npm). On your machine: ensure Figma Desktop has the plugin/bridge connected, restart the MCP server from your Codex/Cursor config, and run `npx` with network access if you install on the fly.
