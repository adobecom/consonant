# A11y Tab Redesign — Design Spec

**Date:** 2026-05-05  
**Author:** Taeho Chang  
**Status:** Draft — awaiting implementation plan

---

## Background

The Consonant Tools Figma plugin has an A11y tab that scaffolds empty accessibility annotation cards ("blueline" cards) and generates a Claude Code terminal command to fill them. The current implementation has six stated purposes but fails to meet most of them:

1. Analyze the design and flag WCAG issues
2. Annotate with confidence — blank + reason where uncertain
3. No hallucination — uncertain = flag, not fill
4. Surface issues AND suggestions, not just problems
5. Conversational — two-way, Claude asks questions
6. Designer-first UX — plain language, simple, not overwhelming

A UX and functional audit found that the tab met none of the purposes fully. The redesign below addresses all six, given one key assumption: **designers using this feature are familiar with Claude Code.** The terminal handoff is expected and comfortable, not a wall.

---

## Architecture (unchanged)

The plugin remains a **launcher + results receiver**. It does not run analysis itself.

```
Plugin (Figma)          Claude Code (terminal)          Figma canvas
     │                         │                              │
     │── generates command ───▶│                              │
     │                         │── reads structural scan ────▶│
     │                         │── asks designer questions     │
     │                         │── fills blueline cards ──────▶│
     │◀── bridge loop-back ────│                              │
     │    (issues / needs /     │                              │
     │     suggestions)         │                              │
```

The key changes are:
1. **Plugin UX** — designer-friendly labels, smart defaults, one button, confirmation screen
2. **Generated prompt** — conversational opener replacing the batch fill command
3. **Bridge results loop-back** — State 3 results panel populated from Claude Code output

---

## Part 1: Plugin UX Redesign

### Three states

**State 1 — Ready**  
The entry state. Designer selects a frame, sees category options, clicks one button.

- Header shows: `"Analyzing: [Frame Name]"` — confirms what's selected
- Category list uses plain designer language with one-line descriptions (see Category Renaming below)
- Smart defaults: common categories pre-checked, advanced options collapsed behind "Show more"
- Single CTA: `"Start A11y Review"` — no ambiguity about what happens next

**State 2 — Confirm**  
Shows exactly what will be created before touching the canvas.

- Lists the categories that will be scaffolded
- Explains: "Claude will ask you questions before filling any cards. Empty cards are normal — they mean Claude needs your input."
- Two buttons: `"Confirm & Create Cards"` / `"Back"`
- Cards are created in Figma only after the designer confirms

**State 3 — Results**  
After Claude Code runs, a summary appears in the plugin. Three sections:

- **Issues found** (red) — WCAG violations with brief plain-language descriptions
- **Needs your input** (yellow) — cards Claude left blank with the specific question it needs answered
- **Suggestions** (blue) — improvements Claude noticed that aren't hard violations

Below the summary: `"Continue in Claude Code"` button — opens the terminal command so the designer can ask follow-up questions.

### Category renaming

Replace WCAG code labels with plain designer language:

| Current label | Renamed label | Description shown |
|---|---|---|
| Keyboard Navigation | Keyboard & Focus | "Can keyboard users reach and use everything?" |
| Color Contrast | Color Contrast | "Is text readable against its background?" |
| Text Alternatives | Image Alt Text | "Do images have descriptions for screen readers?" |
| Screen Reader | Screen Reader Flow | "Does the reading order make sense?" |
| Form Accessibility | Forms | "Are inputs labeled and errors clear?" |
| ARIA Roles | ARIA & Roles | "Are interactive elements correctly labeled for assistive tech?" |
| Carousel | Carousel | "Can users navigate slides with keyboard and screen reader?" |
| *(remaining categories)* | *(existing names kept unless redesign changes them)* | One-line description added to each |

### Smart defaults

Pre-check the categories that apply to nearly every design:
- Keyboard & Focus
- Color Contrast
- Screen Reader Flow

Collapse the rest under `"Show more categories"` — expanded on demand.

### Bridge dependency

The `"Start A11y Review"` button is always enabled. Bridge disconnection is handled gracefully:
- If bridge is connected: button creates cards, generates command, waits for loop-back
- If bridge is disconnected: button creates cards, generates command, shows copy-to-terminal instruction with `"Bridge offline — paste this in Claude Code"` status note

---

## Part 2: Generated Prompt Redesign

### Problem with today's command

Today the plugin generates:

> "Fill ONLY these blueline categories for [Frame]: Keyboard Navigation, Color Contrast, ARIA Roles. Use the structural scan embedded in the Figma file."

This is a batch job. Claude runs it silently and fills what it can guess.

### New conversational opener

The generated command becomes:

```
Start an A11y review conversation for the frame "[Frame Name]".

Context:
- Categories to review: [list]
- Structural scan is embedded in the page as a JSON text node named "Structural Scan — [Frame Name]"

Instructions:
1. Read the structural scan first. Use it to ground your analysis — do not infer elements that aren't in the scan.
2. Before filling any cards, ask the designer 1–3 clarifying questions about things you need to understand to do this accurately (e.g., intended interaction, context of use, whether a pattern is intentional).
3. Fill cards you are confident about. For each, write: the issue or passing note, the WCAG criterion, and a plain-language suggestion.
4. For cards where you are uncertain, leave the annotation blank and add a note explaining exactly what you need from the designer to complete it.
5. At the end, send a summary back through the bridge in this format:

BRIDGE_RESULT:
{
  "issues": [{ "category": "...", "description": "..." }],
  "needs_input": [{ "category": "...", "question": "..." }],
  "suggestions": [{ "category": "...", "description": "..." }]
}
```

The `BRIDGE_RESULT:` block is the hook for the loop-back (see Part 3).

### Where this lives in code

File: `apps/consonant-specs-plugin/src/ui.ts`  
Function: `showAiFillInstruction()` (currently generates the batch command)

This function builds the command string. It needs to be replaced with the new template above, parameterized by `frameName` and `selectedCategories[]`.

---

## Part 3: Bridge Results Loop-Back

### What this is

After Claude Code runs and fills blueline cards, it sends a `BRIDGE_RESULT:` JSON block through standard output. The bridge captures this and posts it back to the plugin. The plugin reads it and renders State 3 (results panel).

### New bridge message type

Add a new message type to the bridge protocol:

```typescript
// Message from Claude Code → bridge → plugin
interface A11yResultMessage {
  type: 'A11Y_RESULT';
  frameName: string;
  issues: Array<{ category: string; description: string }>;
  needs_input: Array<{ category: string; question: string }>;
  suggestions: Array<{ category: string; description: string }>;
}
```

### Bridge server changes

File: `apps/consonant-specs-plugin/src/bridge-server.ts` (or equivalent — verify path before implementing)

The exact loop-back mechanism needs investigation before implementing. The bridge (figma-console) is an MCP server that Claude Code communicates with via tool calls — stdout parsing is not applicable here. Two viable approaches:

**Option A — New MCP tool (recommended):** Add a `bridge_send_a11y_result` tool to the figma-console MCP server. The generated prompt instructs Claude Code to call this tool with the result JSON when done. The bridge server forwards the payload to the plugin as `{ type: 'A11Y_RESULT', ...payload }`.

**Option B — figma_execute relay:** The prompt instructs Claude to call `figma_execute` with a small script that posts a message to the plugin (`figma.ui.postMessage({ type: 'A11Y_RESULT', ... })`). No new MCP tool required, but relies on the plugin receiving postMessage from the console.

Determine which approach is available given the current bridge implementation before writing the implementation plan.

### Plugin changes (State 3 render)

File: `apps/consonant-specs-plugin/src/ui.ts`

Add handler for `A11Y_RESULT` message:

```typescript
case 'A11Y_RESULT':
  renderA11yResults(msg.issues, msg.needs_input, msg.suggestions);
  break;
```

`renderA11yResults()` replaces the current State 1 content with State 3:
- Three sections: Issues (red), Needs Input (yellow), Suggestions (blue)
- Each item shows category name + description/question
- `"Continue in Claude Code"` button below (same terminal command, re-copyable)

### Fallback

If no result message is received within 5 minutes (or bridge is offline), State 3 shows:

> "Review complete in Claude Code. Open Claude Code to see results and continue the conversation."  
> `[Continue in Claude Code]` button

---

## Part 4: Smart Category Detection

### Problem

Today: designer can check "Carousel" even if the frame has no carousel. Claude fills a carousel card with hallucinated content.

### Solution

Before committing cards (at the confirm → create step), Claude checks the structural scan to determine which selected categories actually apply to the frame.

This check happens in the generated prompt, not the plugin. Add to the prompt instructions:

```
Before filling any category, check the structural scan for elements that match that category:
- "Carousel" → only if scan contains elements with names like "carousel", "slider", "swiper"
- "Forms" → only if scan contains input, textarea, select, or elements with role="form"
- "ARIA & Roles" → only if scan contains interactive elements or elements with ARIA attributes
- (apply similar logic to remaining categories)

If a selected category has no matching elements in the scan, skip it entirely and note in your summary: "Skipped [category] — no matching elements found in this frame."
```

This is a prompt-level guardrail, not a code change, making it easy to iterate.

### Future improvement (out of scope for this spec)

The plugin could pre-filter the category list using the structural scan before the designer even sees the checkboxes. This requires reading the scan in the plugin's TypeScript — deferred to a future spec.

---

## What is not changing

- The structural scan embedding in Figma (already grounding Claude)
- The blueline card generation functions (`generateBlueline`, `generateBluelinePanels`)
- The tab-bar plugin layout (tabs: Blueline, A11y, etc.)
- The requirement for Claude Code — conversation still happens in the terminal

---

## Open questions (resolved)

| Question | Decision |
|---|---|
| Should conversation happen in the plugin or Claude Code? | Claude Code — designers are assumed familiar with it |
| One spec or three? | One spec — all three priorities are interdependent |
| Should State 3 be gated on bridge? | No — graceful fallback if bridge offline |
| Smart detection: plugin or prompt? | Prompt-level for this spec; plugin-level is a future improvement |

---

## Success criteria

1. A designer who has never seen WCAG codes can start an A11y review without confusion
2. Claude asks at least one question before filling cards (no more silent batch runs)
3. Results surface in the plugin panel without the designer hunting the Figma canvas
4. No cards are filled for categories with no matching elements in the structural scan
5. Bridge offline does not block the workflow — graceful fallback at every step

