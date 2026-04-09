---
name: figma-console-safe-execution
description: Execute Figma Console MCP code safely with timeout sizing, auto-layout guards, minimal-error retries, and compact failure reporting. Use when creating or editing Figma nodes via figma_execute or debugging figma_console errors.
---

# Figma Console Safe Execution

## When to use

Use this skill when:
- running `figma_console.figma_execute`
- debugging Figma errors (auto-layout, variables, fonts, timeouts)
- building large spec frames/tables that can timeout

## Execution checklist

Copy and follow this checklist during work:

```text
Figma Execute Checklist
- [ ] Search components for fresh node ids
- [ ] Keep this execute block focused (single logical unit)
- [ ] Timeout set to >= 5000ms for multi-node operations
- [ ] Fonts loaded before text mutation
- [ ] Child appended before setting FILL sizing
- [ ] Screenshot captured after changes
- [ ] If failed, patch once and retry once
- [ ] Report only compact error context (no full transcript/image blob)
```

## Required guardrails

1. **Timeout sizing**
   - trivial: 2000-3000ms
   - normal multi-node scripts: 5000-10000ms
   - avoid 1000ms unless tiny changes

2. **Auto-layout FILL safety**
   - only set `layoutSizingHorizontal = "FILL"` after append
   - ensure parent is auto-layout (`layoutMode !== "NONE"`)

3. **Retry policy**
   - do not spam identical retries
   - patch code first, then one retry
   - if second failure, stop and summarize root cause

4. **Context-size protection**
   - never return entire terminal logs
   - never include raw screenshot payloads
   - include only minimal failing snippet + message

## Safe code patterns

```javascript
// FILL only after append to an auto-layout parent
table.appendChild(row);
if (row.parent && row.parent.layoutMode !== "NONE") {
  row.layoutSizingHorizontal = "FILL";
}
```

```javascript
// Always load font before setting characters/style
const text = figma.createText();
await figma.loadFontAsync(text.fontName);
await text.setTextStyleIdAsync(styleId);
text.characters = content;
```

## Failure response format

Use this compact format:

```text
Tool: figma_console.figma_execute
Error: <exact error message>
Likely cause: <1 sentence>
Patch: <1-2 sentence fix>
Retry plan: timeout=<n>, one retry after patch
```

## Suggested iteration loop

1. execute focused block
2. capture screenshot
3. visual check + spacing/alignment review
4. patch
5. repeat (max 3 iterations)
