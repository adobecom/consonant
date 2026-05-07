# Design Audit Tool — Design Spec

**Date:** 2026-05-07
**Status:** Approved for implementation planning
**Type:** New standalone Chrome Extension (unrelated to Consonant plugin)

---

## Overview

A Chrome Extension that lets designers and engineers load any website or prototype into an embedded browser, extract structured design data from its code (design system tokens, animations, a11y, localization, etc.), and interact with Claude Opus 4.7 in a right-side chat panel to analyze, transform, and export that data. Outputs include preview tabs, saved files, and Figma annotations pushed via the Consonant plugin bridge.

**Target users:** Adobe design team (internal, team-wide distribution)
**Distribution:** Zip file shared internally; each user loads unpacked in Chrome developer mode. No Chrome Web Store.

---

## Architecture

### Platform

Chrome Extension, Manifest V3. Opens as a dedicated full-screen tab (`chrome-extension://[id]/app.html`). Not a popup, not a side panel — a first-class tab that acts as the app shell.

### Three-Column Layout

```
┌─────────────────┬──────────────────────────────┬─────────────────────┐
│   Left Rail     │        Center: iframe        │    Right Rail       │
│   (Extract)     │     (embedded browser)       │   (Claude Chat)     │
│   ~200px        │        flex: 1               │    ~280px           │
└─────────────────┴──────────────────────────────┴─────────────────────┘
```

### Center: Embedded Browser

- An `<iframe>` element with `sandbox` attributes permitting scripts and same-origin
- `declarativeNetRequest` API with dynamic rules: strips `X-Frame-Options` and `frame-src` CSP response headers for the current URL before the iframe loads
- Rules are applied per-URL, added on navigate and removed on close
- Because the iframe runs in the user's Chrome session, authentication cookies, localStorage, and session state are shared natively — password-protected pages load without any special handling
- Includes a URL bar above the iframe with back/forward buttons and a reload button

### Strict-CSP Fallback (Side Panel Mode)

When the iframe fails to load (e.g., inline `<meta>` CSP that cannot be stripped by `declarativeNetRequest`):

1. Extension shows an error card in the center: "This site blocks embedding. Switch to Side Panel mode?"
2. User clicks "Switch" — extension opens the URL in a real Chrome tab
3. Chrome's Side Panel API opens the Claude chat on the right of that tab
4. A content script injects the left rail as an overlay at the top-left of the real page
5. All extraction tools work identically — DOM access via `chrome.scripting.executeScript` into the real tab instead of the iframe
6. Preview tab and Save to Folder outputs unchanged
7. Figma bridge unchanged
8. When user closes the side panel or navigates away, they return to the extension tab

Side Panel mode is full-featured, not degraded. The only difference is the page renders in a real tab.

### Background Service Worker (`background.js`)

Owns all heavy work across three modules:

**Claude API Client**
- Anthropic SDK, streaming responses via Server-Sent Events
- Model: `claude-opus-4-7`
- Tool calling enabled — Claude can invoke any registered tool
- Conversation history maintained per session in memory; cleared on extension tab close
- API key read from `chrome.storage.sync` on each request

**Tool Executor**
Routes Claude's tool calls to their implementations. See Tool Definitions section.

**DOM Bridge**
- Injects content scripts into the iframe via `chrome.scripting.executeScript({ frameId })`
- In Side Panel mode, targets the real tab's frame ID instead
- Returns: full outer HTML, all `<style>` blocks, all linked stylesheet text, computed styles on key elements, detected JS libraries, page title and meta

### App Shell (`app.html`)

React + Vite + TypeScript + Tailwind CSS. Three panels communicating via `chrome.runtime.sendMessage`.

---

## Rail Collapse Behavior

Both rails collapse independently.

### Collapse

- **Left rail:** `‹ Collapse` label + chevron in the top-left of the rail, just above the "Extract" section header
- **Right rail:** `Collapse ›` label + chevron in the top-right of the Claude header row (right of the "Claude" title)
- Clicking either trigger slides the rail out with a 200ms `ease` CSS transition on `width` and `opacity`

### Expand (when collapsed)

- A circular purple FAB (40px, `#6c47ff`, box-shadow) appears at the **top** of the browser content area — not the bottom
- Left FAB: top-left corner of the iframe/browser, just below the URL bar. Icon: ☰
- Right FAB: top-right corner of the iframe/browser, just below the URL bar. Icon: 💬
- FABs are positioned absolutely within the center column, so they never overlap the live site content below
- Clicking a FAB slides its rail back in

### Persistence

Rail open/closed state saved in `chrome.storage.local` per user, restored on next open. Default is both rails expanded.

---

## Left Rail — Extraction Modes

Each button:
1. Triggers the DOM Bridge to collect the full page snapshot from the iframe (or real tab in Side Panel mode)
2. Sends the snapshot to Claude Opus 4.7 with a specialized system prompt for that extraction type
3. Streams the result into the right rail chat as a structured output card
4. Offers export actions (spec table, Figma push, save file) within the output card

### Seven Modes

| Mode | What Claude extracts | Primary output |
|---|---|---|
| 🎨 **Design System** | Color palette, typography scale, spacing scale, elevation, border radius, icon set. Returns structured JSON + human-readable summary. | Spec card + optional Figma push |
| 🗺 **DS Mapping** | Maps the page's classes/tokens to known design systems (S2A, Material, Spectrum, etc.). Identifies custom vs. borrowed patterns. Shows confidence score per match. | Spec card |
| ✏️ **Design Style** | Visual language: tone (minimal, expressive, corporate), aesthetic patterns, brand personality signals from typography, color usage, layout density. | Spec card |
| 📐 **Design Principles** | Infers design principles from UI patterns: hierarchy strategy, interaction model, information density philosophy. Named and explained. | Spec card |
| 🎬 **Animation** | All CSS transitions, `@keyframes`, animation libraries detected (Framer, GSAP, etc.), timing functions, durations, easing. Returns engineering-ready spec table. | Spec table + optional Figma push |
| 🌍 **Localization** | Hardcoded strings vs. i18n keys, locale-specific patterns (date formats, RTL support, currency), untranslated content flags. | Spec card |
| ♿ **A11y** | ARIA roles + labels, color contrast (WCAG AA/AAA), keyboard navigation, focus order, missing alt text, form labels. Issues and suggestions with WCAG SC references. | Spec card + optional Figma push |

---

## Right Rail — Claude Chat

### Interface

- Conversation thread with streaming responses
- User input: text field + send button
- Each Claude response may include one or more output cards (see below)
- Settings icon (top-right of header): opens API key entry field, saved to `chrome.storage.sync`

### Output Card Types

**Spec Table Card**
Renders structured extraction data as a scrollable table inside the chat. Action buttons: "Push to Figma ↗", "Save as CSV ↗", "Save as Markdown ↗".

**Preview Tab Card**
Shown after Claude generates modified HTML. Displays a summary of changes made. Action buttons: "Compare tabs" (focuses the preview tab), "Save files ↗".

**Figma Card**
Shown after a successful `push_to_figma` tool call. Displays what was created in Figma. Action button: "Open in Figma ↗" (deep-link to the relevant frame).

**Error Card**
Shown when a tool call fails (Figma not connected, iframe blocked, download failed). Includes the error message and a suggested recovery action.

---

## Claude's Tool Definitions

Claude Opus 4.7 calls these tools automatically based on user intent. The background service worker executes them.

| Tool | Description |
|---|---|
| `read_page()` | Returns full DOM HTML, all stylesheets, detected JS libraries, page metadata from the iframe/active tab |
| `read_page_scripts()` | Returns all JS source (inline + linked). Used for animation library detection and logic analysis |
| `preview_in_tab(html: string)` | Opens a new Chrome tab with the provided HTML as a Blob URL. Returns tab ID. |
| `save_files(files: {name, content}[])` | Saves files to the user's designated folder via `chrome.downloads`. Auto-opens `index.html` if present. On first use, prompts user to pick a default save folder (stored in `chrome.storage.local`). |
| `push_to_figma(method: string, params: object)` | POSTs to `http://localhost:9240/figma` (Consonant MCP HTTP bridge). Requires Consonant plugin open in Figma. Returns Figma response or error. |
| `navigate(url: string)` | Navigates the iframe/active tab to a new URL. Used when Claude needs to follow links or check multiple pages. |
| `screenshot()` | Captures a screenshot of the current iframe viewport using `chrome.tabs` API. Returns base64 PNG for Claude's visual context. |

---

## Figma Bridge

### What exists today

The consonant-specs MCP server (`apps/consonant-specs-plugin/mcp/index.ts`) uses stdio transport only (line 1487). It also runs a WebSocket server on ports 9220–9222 (line 102) that the Figma Desktop plugin connects to. All Figma commands route through `sendCommand()` (line 257).

### Required addition

A second HTTP server on port `9240` added to `index.ts`. The `http` module is already imported at line 6.

**Endpoints:**

```
POST http://localhost:9240/figma
Body: { method: string, params: object, timeout?: number }
Response: { result: any } | { error: string }
Routes to: sendCommand(method, params, timeout)

GET http://localhost:9240/status
Response: { connected: boolean, port: number }
Used by: extension to check if Figma plugin is open before attempting push
```

CORS headers must allow `chrome-extension://` origin.

### Team requirements

Each team member needs:
1. The Consonant Figma plugin open in Figma Desktop
2. The consonant-specs MCP server running (started by Claude Code automatically via `.mcp.json`)
3. Their own Claude API key in the extension settings

This is the same setup requirement as using Claude Code with the Consonant plugin today.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Extension shell | React + Vite + TypeScript | Team-scale UI with complex state (rail collapse, streaming, tool cards) |
| Styling | Tailwind CSS | Consistent utility-first, fast iteration |
| Manifest | V3 | Required for modern Chrome extensions |
| Claude | Anthropic SDK, `claude-opus-4-7` | Streaming + tool calling; Opus for complex analysis tasks |
| Build | Vite with `@crxjs/vite-plugin` (or equivalent MV3-compatible Vite plugin) | Native MV3 extension build support with HMR |
| Storage | `chrome.storage.sync` (API key), `chrome.storage.local` (rail state, save folder) | sync for cross-device key, local for UI prefs |
| Permissions | `declarativeNetRequest`, `scripting`, `downloads`, `storage`, `tabs`, `sidePanel` | All required, all standard MV3 APIs |

---

## Project Location

New repository: `/Users/taehoc/Desktop/Taeho/design-audit-tool/`

Separate from the consonant monorepo. Only dependency on consonant: the HTTP bridge addition to `apps/consonant-specs-plugin/mcp/index.ts`.

---

## Open Questions

None blocking implementation. The following are build-time decisions:

1. **Exact port for HTTP bridge** — 9240 chosen to avoid conflicts with consonant-specs WS (9220–9222) and figma-console-mcp (9223–9232). Confirm no other local servers use 9240.
2. **Save folder UX** — On first `save_files` call, use `chrome.downloads` with `saveAs: true` to let the user pick their destination, then store it in `chrome.storage.local` for all future saves. Lower friction than prompting on extension open — user picks the folder when they first actually need it.
3. **Conversation persistence** — Currently clears on tab close. If team wants persistent history, add `chrome.storage.local` serialization of the conversation array.

---

## Out of Scope (v1)

- Chrome Web Store publication
- Multi-tab session management (one active session at a time)
- Sharing extraction results with teammates (export only, no sync)
- Real-time collaboration
- Custom extraction mode builder
