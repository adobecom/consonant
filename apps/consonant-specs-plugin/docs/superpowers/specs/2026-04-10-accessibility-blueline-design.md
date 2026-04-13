# Accessibility Blueline Generator — Design Spec

**Date:** 2026-04-10
**Status:** Approved

## Overview

Add accessibility blueline annotation generation to the Consonant Tools Figma plugin. Produces Stark-format accessibility specs — annotated design overlays, a structured sidebar with numbered entries, and detail cards — directly on the Figma canvas.

The system has two tiers:
- **Tier 1 (Plugin):** High-confidence, deterministic detection that runs locally — Focus Indicators and Focus Order.
- **Tier 2 (AI-assisted):** Claude-powered analysis delivered through a Bridge connection — headings, landmarks, accessible names, alt-text, ARIA, keyboard patterns, DOM strategy, auto-rotation, screen reader notes. All AI output is visually marked for human review.

## Plugin Changes

### Rename: Consonant Specs → Consonant Tools

The plugin has grown beyond specs. Rename everywhere:
- `manifest.json` — plugin name
- `package.json` — package name
- `ui.html` — header title
- `dist/ui.html` — built output

### New Tab: Accessibility (A11y)

Added to the existing tab bar after Specs, before Localize.

**Checkboxes — Tier 1 (always available):**
- Focus Indicators — blue rings around interactive elements (existing `spec-focus-indicators.ts`, moved to a11y module)
- Focus Order — numbered badges sorted by reading position (top-to-bottom, left-to-right)

**Checkboxes — Tier 2 (requires Bridge connection):**
- Heading Hierarchy
- Landmarks
- Accessible Names
- Alt-Text
- ARIA Roles & Attributes
- Keyboard Patterns
- DOM Strategy
- Auto-Rotation
- Screen Reader Notes

When Bridge is disconnected, Tier 2 checkboxes are grayed out with a "connect bridge" label. When connected, they become active with purple accent color and a green "bridge connected" indicator.

**Generate Blueline button:** Runs Tier 1 locally, creates scaffolding for checked Tier 2 sections, then attempts to send Tier 2 request to the custom MCP server. Falls back to manual invoke message if MCP is unavailable.

### New Tab: Bridge

On-demand WebSocket connection to the figma-console MCP server. The WebSocket lives in the UI iframe and persists across tab switches.

**Disconnected state:** Connect button, description text ("Connect to Claude Code for AI-powered features"), note that connection persists across all tabs.

**Connected state:** Green status pill, file/page info, connection log, Disconnect button.

**Connection behavior:**
- Not auto-connected on plugin open — user clicks Connect when ready
- Scans ports 9223-9232 for the MCP server WebSocket
- Survives tab switches because the UI iframe stays loaded
- Shows connection log (WebSocket connected, file name, page name)

## Blueline Output Structure

Generated on the Figma canvas as a Section named "Blueline — {Frame Name}".

### Annotated Design Frame

Clone of the selected frame overlaid with:
- **Marching ants** — dashed-stroke rectangles around detected regions
- **Numbered badges** — blue circles with white numbers, positioned on each annotated element
- **Focus rings** — blue stroke rectangles around focusable elements (from Focus Indicators)

### Sidebar Frame (320px wide)

Placed to the left of the annotated design. Contains sections in order:

**Tier 1 sections (blue, presented as fact):**
- Focus Order — numbered list of focusable elements in tab order

**Tier 2 sections (purple left border + "AI" tag, or "Awaiting AI fill..." placeholder):**
- Alt-Text
- Heading Hierarchy
- Landmarks
- Accessible Names
- ARIA Roles & Attributes
- Keyboard Patterns
- Screen Reader Notes

Each section has: title, numbered entries, element name, value/content, and optional note field.

### Detail Cards

Placed below the annotated design. Only generated when applicable:
- **H1 Strategy** — heading structure decisions (Tier 2)
- **DOM Strategy** — DOM structure recommendations for dynamic components (Tier 2, only when applicable)
- **Auto-Rotation Behavior** — rotation rules (Tier 2, only when carousel detected)

Detail cards use the same visual language: purple left border + "AI" tag for Tier 2 content.

## Visual Language

### Tier 1 — Auto-detected
- Blue numbered badges
- Blue focus rings and marching ants
- Clean sidebar sections
- Presented as factual data

### Tier 2 — AI-assisted
- Purple left border on sections and detail cards
- "AI" tag next to section titles
- Same layout structure, visually distinct
- Signals "review this" to the reader

## Custom MCP Server (consonant-mcp)

A small Node.js server (~100 lines) that bridges plugin UI requests to Claude Code.

### Location

```
consonant-figma-plugin/
├── mcp/
│   ├── index.ts          # MCP server
│   ├── package.json      # deps: @modelcontextprotocol/sdk, express
│   └── tsconfig.json
└── .mcp.json             # registers both MCP servers
```

### Components

**HTTP endpoint (port 9300):**
- `POST /request` — plugin sends `{ frameId, sections: ["headings", "aria", ...] }`
- Stores request in a queue

**MCP tools (exposed to Claude):**
- `get_blueline_request` — returns pending request from queue, or `{ status: "no_request" }`
- `blueline_complete` — Claude calls when done, server notifies plugin UI

### .mcp.json

```json
{
  "figma-console": {
    "command": "npx",
    "args": ["figma-console-mcp"]
  },
  "consonant": {
    "command": "node",
    "args": ["mcp/dist/index.js"]
  }
}
```

### Fallback Behavior

When the plugin can't reach consonant-mcp (POST to port 9300 fails/times out):
1. Tier 1 still runs and scaffolding is still created
2. Plugin shows a warning message: "Claude Code not detected"
3. Displays a copyable command: `fill the blueline for "{Frame Name}"`
4. User pastes this in Claude Code to trigger the skill manually

## Claude Skill (Tier 2 Fill)

### Location

```
skills/accessibility/
├── blueline.md              # Main skill — orchestrates the fill
├── wcag-patterns.md         # Reference: ARIA patterns from WAI-ARIA APG
├── carousel-a11y.md         # Reference: carousel-specific rules
└── landmarks-guide.md       # Reference: landmark mapping rules
```

### Execution Flow

**Phase 1 — Gather Context:**
1. Take screenshot of the design frame (visual understanding)
2. Read node tree via `figma_execute` depth 4-5 (names, types, sizes, hierarchy)
3. Extract all text content (for heading analysis, accessible names)
4. Find the scaffolding frame (locate "Awaiting AI fill..." placeholders)

**Phase 2 — Reason About Each Section:**
5. For each checked Tier 2 section, analyze and generate content

**Phase 3 — Write to Canvas:**
6. Replace "Awaiting AI fill..." with generated content via `figma_execute`
7. Add purple left border + "AI" marker to each filled section
8. Create detail cards (DOM Strategy, Auto-Rotation, H1) if applicable
9. Notify completion

### Section Details

**Heading Hierarchy:** Analyzes text sizes, visual weight, and position to determine H1-H6 structure. Understands context (e.g., eyebrow vs heading, logo as H1).

**Landmarks:** Maps visual sections to ARIA landmark roles based on content and purpose. Assigns `role`, `aria-label`, `aria-roledescription` where applicable.

**Accessible Names:** Provides context-aware names beyond visible text. Generates patterns (e.g., "Learn more about + {eyebrow}") so devs can apply to all instances.

**Alt-Text:** Takes screenshots of individual image nodes and writes descriptive alt-text. Marks decorative images as decorative.

**ARIA Roles & Attributes:** Identifies UI patterns (tablist, carousel, dialog, etc.) and assigns correct ARIA following WAI-ARIA APG. Includes state management (aria-selected, tabindex, aria-hidden).

**Keyboard Patterns:** Specifies key-by-key interaction behavior per WAI-ARIA APG pattern. Includes arrow keys, Home/End, Tab, Enter/Space as applicable.

**DOM Strategy:** Recommends DOM structure for dynamic components (e.g., all panels in DOM with inert, vs lazy load). Generated as a detail card.

**Auto-Rotation:** Detects carousels and specifies WCAG-compliant rotation: prefers-reduced-motion, interval, pause on focus/hover, resume rules, manual stop. Generated as a detail card. Only when carousel is detected.

**Screen Reader Notes:** Platform-specific guidance for VoiceOver, TalkBack, Narrator. Only generated when platform behavior differs from standard ARIA. Empty sections are omitted.

### Quality Safeguards

- Every AI section gets a purple marker — never presented as authoritative fact
- Skill references WAI-ARIA APG — following the spec, not inventing patterns
- Screenshot + tree analysis — Claude sees both visual design and structural data
- Conditional generation — no filler content, sections only appear when relevant
- Pattern notes — provides reusable patterns, not just one-off values

## Data Flow Summary

```
User clicks "Generate Blueline"
  → Plugin runs Tier 1 (Focus Indicators + Focus Order)
  → Plugin creates scaffolding (sidebar + placeholders)
  → Plugin POSTs to consonant-mcp (port 9300)
    → Success: Claude skill picks up request, fills Tier 2 via figma_execute
    → Failure: Plugin shows fallback with copyable command
```

## Scope Boundaries

**In scope:**
- Plugin: A11y tab, Bridge tab, Tier 1 generation, scaffolding, plugin rename
- MCP: Custom consonant-mcp server with request queue
- Skill: Blueline fill with all 9 Tier 2 sections
- Output: Stark-format blueline annotations on Figma canvas

**Out of scope:**
- Editing existing bluelines (regenerate from scratch)
- Multi-frame batch generation
- Export to HTML/PDF
- Integration with actual Stark plugin
- Figma comments or dev mode annotations
