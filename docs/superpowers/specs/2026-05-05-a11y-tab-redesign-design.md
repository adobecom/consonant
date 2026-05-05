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

The actual checkboxes in `src/ui.html:121-145` use these labels. The table shows the proposed rename and one-line description for each (confirmed against `a11y-blueline.ts:307-376`):

**Group 1 — AI-assisted** (visible by default)

| Current label | Proposed label | Description shown |
|---|---|---|
| Focus Indicators (AI) | Focus Indicators | "Do interactive elements have a visible focus ring?" |
| Focus Order (AI) | Focus Order | "Does the keyboard tab order match the visual layout?" |
| Heading Hierarchy | Heading Hierarchy | "Are headings structured so screen readers can navigate?" |
| Landmarks & Navigation | Landmarks & Navigation | "Are page regions labeled so screen readers can jump to them?" |
| Names & Alt-Text | Names & Alt-Text | "Do images and controls have clear names for assistive tech?" |
| Color Contrast | Color Contrast | "Is text readable against its background?" |
| ARIA & Keyboard | ARIA & Keyboard | "Are custom widgets correctly labeled and keyboard-operable?" |
| Target Size | Target Size | "Are tap/click targets large enough for motor accessibility?" |
| Page Setup | Page Setup | "Does the page have a title and language declared?" |

**Group 2 — Accessibility notes** (collapsed under "Show more" by default)

| Current label | Proposed label | Description shown |
|---|---|---|
| Forms | Forms | "Are inputs labeled and error messages clear?" |
| Carousel | Carousel | "Can users navigate slides with keyboard and screen reader?" |
| DOM Strategy | DOM Strategy | "Does the DOM order support the correct reading sequence?" |
| Motion & Media | Motion & Media | "Can users pause motion and is media accessible?" |
| Screen Reader Notes | Screen Reader Notes | "Platform-specific notes for VoiceOver, TalkBack, Narrator" |
| React Native | React Native | "Accessibility notes specific to the React Native platform" |
| TV Note | TV Note | "Notes for TV/10-foot UI accessibility" |
| General Note | General Note | "Any other accessibility notes for this frame" |

### Smart defaults

Pre-check the four categories that apply to nearly every interactive design (confirmed by peer review against `PANEL_DESCRIPTIONS` in `a11y-blueline.ts:342-376`):
- Focus Indicators
- Focus Order
- Color Contrast
- Names & Alt-Text

Collapse Group 2 under `"Show more categories"` — expanded on demand. Group 1 items not in the default set (Heading Hierarchy, Landmarks & Navigation, ARIA & Keyboard, Target Size, Page Setup) remain visible but unchecked.

### Bridge dependency

The `"Start A11y Review"` button is always enabled. Bridge disconnection is handled gracefully:
- If bridge is connected: button creates cards, generates command, waits for loop-back
- If bridge is disconnected: button creates cards, generates command, shows copy-to-terminal instruction with `"Bridge offline — paste this in Claude Code"` status note

---

## Part 2: Generated Prompt Redesign

### Problem with today's command

Today `showAiFillInstruction()` in `src/ui.ts:502-511` generates:

> "Fill ONLY these blueline categories for "[Frame]": [categories]. Call `figma_get_blueline_data` first — it returns structural data and orchestration instructions. Then call `figma_get_knowledge` for each agent group to fetch expert knowledge. Dispatch parallel agents, then call `figma_render_blueline` with all card JSON."

This is a batch job. Claude runs it silently and fills what it can guess. It never asks a question.

### What the existing pipeline does (confirmed by peer review)

The render pipeline must be preserved — it is what actually writes content to Figma:

1. `figma_get_blueline_data` — reads the `.structural-scan` text node, takes a screenshot, returns agent orchestration instructions and `availableKnowledge` keys (`mcp/index.ts:563-639`)
2. `figma_get_knowledge` per agent group — fetches expert WCAG knowledge content
3. `figma_render_blueline({ cards })` — writes card content to Figma; `cards` is keyed by category slug (e.g. `focusIndicators`, `colorContrast`) with `{ items: [{ title, desc }], notes?, warnings? }` per key (`mcp/index.ts:693-737`)

The new command wraps this pipeline with a conversational layer — it does not replace any of these calls.

### New conversational command

```
Start an A11y review conversation for the frame "[Frame Name]".

Categories to review: [comma-separated category slugs]

Step 1 — Ground yourself:
Call figma_get_blueline_data. It returns the structural scan (a hidden text node named .structural-scan), a screenshot, and per-agent orchestration instructions. Read the structural scan carefully. Do not infer elements that aren't in it.

Step 2 — Ask questions first (REQUIRED before any rendering):
Before calling figma_render_blueline, ask the designer 1–3 clarifying questions about things you genuinely need to know to be accurate. Examples: intended interaction pattern, whether a visual-only element is intentional, context of use for a form. If you have no real questions, say so briefly and proceed.

Wait for the designer's answers before continuing.

Step 3 — Analyze:
For each selected category, call figma_get_knowledge for its agent group. Use the structural scan + screenshot + designer answers to assess each category.

Step 4 — Render:
Call figma_render_blueline with the cards object. For categories you are confident about: write the issue or passing note, the WCAG criterion, and a plain-language suggestion in desc. For categories where you are uncertain: pass an empty string for desc and put the open question in notes (e.g. "notes": "Need to know: is this button keyboard-only or also touch?").

Step 5 — Send summary to plugin:
After figma_render_blueline completes, call bridge_send_a11y_result with:
{
  "frameName": "[Frame Name]",
  "issues": [{ "category": "...", "description": "..." }],
  "needs_input": [{ "category": "...", "question": "..." }],
  "suggestions": [{ "category": "...", "description": "..." }]
}
This updates the plugin panel so the designer can see the results without hunting the Figma canvas.
```

### Where this lives in code

File: `apps/consonant-specs-plugin/src/ui.ts`  
Function: `showAiFillInstruction()` (`ui.ts:502-528`)

Replace the function body with the new template, parameterized by `frameName` and `selectedCategories[]` (canonical category slugs from `getCheckedA11yCategories()` at `ui.ts:574-607`).

---

## Part 3: Bridge Results Loop-Back

### What this is

After Claude Code calls `figma_render_blueline`, it calls a new MCP tool `bridge_send_a11y_result` with a structured JSON summary. The bridge forwards this to the plugin as an `A11Y_RESULT` WebSocket event. The plugin handles it and renders State 3.

**Option A confirmed by peer review** — figma-console communicates with Claude Code via stdio (MCP) and with plugins via WebSocket. A fire-and-forget `sendEvent` on the WebSocket server is the correct mechanism. `figma_execute` relay (Option B) was ruled out due to active-client routing instability when multiple plugins are connected.

### Change 1 — figma-console: add fire-and-forget push

File: `apps/figma-console-mcp/src/core/websocket-server.ts`

Add a `sendEvent(type: string, data: unknown): void` method that sends `{ type, data }` to the active client without registering a pending-promise entry. This is a one-way push, not a request/response.

### Change 2 — figma-console: register the new MCP tool

File: `apps/figma-console-mcp/src/local.ts`

Register `bridge_send_a11y_result` with this schema:

```typescript
{
  frameName: z.string(),
  issues: z.array(z.object({ category: z.string(), description: z.string() })),
  needs_input: z.array(z.object({ category: z.string(), question: z.string() })),
  suggestions: z.array(z.object({ category: z.string(), description: z.string() })),
}
```

Handler calls `this.wsServer.sendEvent('A11Y_RESULT', args)` and returns `{ content: [{ type: 'text', text: 'sent' }] }`.

Rebuild dist after this change: `npm run build:local` in `apps/figma-console-mcp/`.

### Change 3 — plugin: handle the event and render State 3

File: `apps/consonant-specs-plugin/src/ui.ts`

In the `ws.onmessage` handler (around `ui.ts:910`), add a branch **before** the existing early-return for unrecognized messages:

```typescript
if (message.type === 'A11Y_RESULT') {
  renderA11yResults(message.data);
  return;
}
```

`renderA11yResults(data)` replaces the current panel content with State 3:
- Three sections: Issues (red), Needs Input (yellow), Suggestions (blue)
- Each item shows category name + description/question
- `"Continue in Claude Code"` button below (same command string, re-copyable)

### Fallback

If no `A11Y_RESULT` event arrives within 5 minutes (or bridge is offline), the plugin remains on State 2 and shows:

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
| Bridge loop-back: Option A or B? | Option A (new MCP tool) — `figma_execute` relay is unstable when multiple plugins are connected |
| Smart defaults: 3 or 4? | 4 — Focus Indicators, Focus Order, Color Contrast, Names & Alt-Text (confirmed against actual checkbox structure) |

---

## Success criteria

1. A designer who has never seen WCAG codes can start an A11y review without confusion
2. Claude asks at least one question before filling cards (no more silent batch runs)
3. Results surface in the plugin panel without the designer hunting the Figma canvas
4. No cards are filled for categories with no matching elements in the structural scan
5. Bridge offline does not block the workflow — graceful fallback at every step

