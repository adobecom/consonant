# Structural Scan for Accessibility Pattern Detection

**Date:** 2026-04-15
**Status:** Approved
**Goal:** Give Claude richer structural data from the plugin so Tier 2 blueline cards get filled more accurately — especially when designers don't name their layers.

---

## Problem

The consonant specs plugin detects focusable elements (Tier 1) using layer name keywords — "button", "tab", "input", etc. This works well when designers name layers correctly.

But Tier 2 card fills depend entirely on Claude analyzing a screenshot and node tree at fill time. Claude has no structural hints about what patterns exist in the design. When layer names are "Frame 47" and "Group 3", Claude is essentially looking at a picture and guessing.

The plugin already walks the node tree for Tier 1. It could extract much more structural information during that walk — information that helps Claude identify patterns more accurately, regardless of layer names.

## Solution

Add a structural scan module that extracts name-independent signals from the Figma node tree, embeds the result in the blueline frame as a hidden node, and update Claude's skills to read and use that data alongside screenshots.

## Architecture

### What stays the same

- **Tier 1 detection** (`spec-focus-indicators.ts`, `a11y-focus-order.ts`) — working well, no changes
- **Tier 2 card scaffolding** (`a11y-blueline.ts`) — same visual output, same card structure
- **Plugin UI** — no checkbox or button changes
- **Bridge/WebSocket architecture** — scan data travels through the Figma file, not the bridge
- **All 7 a11y skill reference files** — already comprehensive
- **Designer workflow** — no steps change, just better output

### What changes

1. **New file: `a11y-structural-scan.ts`** — the scan module
2. **`a11y-blueline.ts`** — calls the scan after generating scaffolding, embeds result as hidden node
3. **`blueline.md` skill** — updated to read scan data and use it during fill

## Structural Scan Module

### What it extracts

The scan walks the Figma node tree and collects six categories of structural signals. None of these require correct layer names — they use physical properties (size, position, nesting, layout mode, fills, child count).

#### 1. Text nodes (heading candidates)

Every text element in the frame, collected with:
- Text content (first 80 characters)
- Font size, weight, and family
- Position (x, y) and dimensions
- Whether it has an underline decoration
- Fill color (for link detection)
- Parent name and nesting depth from root

Sorted by font size descending. Claude uses this to determine heading hierarchy — biggest text is H1 candidate, next largest is H2, etc. Font family and weight help distinguish headings from body text (e.g., Adobe Clean Display Black = heading, Adobe Clean Regular = body).

#### 2. Repeating groups (tabs, nav, pagination, card grids)

Any container with 3 or more visible children of roughly the same size:
- Container node ID and name
- Layout mode (horizontal, vertical, or none)
- Child count
- Average child width and height
- Size variance (low variance = uniform children = likely a pattern)
- Whether one child is visually distinct (different fill = selected tab, active dot)
- Position and dimensions

Examples of what this catches:
- Horizontal row of 4 same-height elements, one with different background = tab bar
- Row of small circles = pagination dots
- Grid of tall rectangles each containing image + text + button = card grid
- Horizontal bar of same-height items = navigation

#### 3. Image nodes (alt-text candidates)

Every element with an IMAGE fill:
- Node ID
- Position and dimensions
- Whether it's "full bleed" (covers >90% of parent) — likely a decorative background
- Whether it has a text sibling — likely a hero image with text overlay
- Parent name

Claude uses `isFullBleed` to distinguish decorative backgrounds (`alt=""`) from content images that need descriptive alt text.

#### 4. Icon-only frames (aria-label candidates)

Small frames (under 48px) that contain a vector or icon but no text:
- Node ID
- Position and dimensions
- Whether it has a vector child
- Whether it has a text child (false = icon-only, needs `aria-label`)
- Parent name

These are icon-only buttons — close buttons, search icons, hamburger menus, share buttons — that need accessible names because there's no visible text.

#### 5. Paired stacks (accordion candidates)

Vertical containers where elements alternate between small and large — a short element followed by a taller element, repeating:
- Container node ID and name
- Number of pairs (3+ pairs = likely accordion)
- Average header height and content height
- Position

This structural pattern matches accordions — clickable headers followed by expandable content panels.

#### 6. Overlays (modal/dialog candidates)

Large frames that cover most of their parent, especially with a semi-transparent sibling behind them:
- Node ID and name
- Dimensions
- What percentage of the parent it covers (>70% = likely modal)
- Whether there's a semi-transparent sibling (scrim/backdrop)

## Data Flow

### Current flow

```
Designer clicks "Generate Blueline"
  -> Plugin creates focus rings + empty Tier 2 cards
  -> Plugin shows "paste this in Claude Code" message
  -> Designer triggers Claude
  -> Claude takes a screenshot, reads node tree on its own
  -> Claude fills cards
```

### New flow

```
Designer clicks "Generate Blueline"
  -> Plugin creates focus rings + empty Tier 2 cards (same)
  -> Plugin runs structural scan (~1 second)
  -> Plugin embeds scan result as a hidden node named ".structural-scan" in the blueline frame
  -> Plugin shows "paste this in Claude Code" message (same)
  -> Designer triggers Claude
  -> Claude finds the .structural-scan node, parses the JSON
  -> Claude takes a screenshot (same)
  -> Claude uses BOTH structural data + screenshot to fill cards
```

### Why a hidden text node

The scan data is stored as a hidden text node (zero opacity, collapsed size) inside the blueline frame. This is the simplest way to pass data from the plugin to Claude without:
- Changing the WebSocket bridge protocol
- Adding new message types
- Requiring the bridge to be connected at scan time

Claude already reads the Figma node tree during fill. It simply finds the `.structural-scan` node and parses its JSON content. No new APIs needed.

## Skill File Changes

### `blueline.md` — Phase 1 update

Add a new first step before the existing flow:

> 1. Look for a node named `.structural-scan` inside the blueline frame. If it exists, parse the JSON. This is the plugin's structural analysis of the design. Use it alongside screenshots to make more accurate decisions.

### Per-category guidance updates

**Heading Hierarchy:** Check the `textNodes` list — already sorted by font size. Biggest text is H1 candidate. Use font family to distinguish headings (Adobe Clean Display = heading) from body text (Adobe Clean Regular). Cross-reference with the screenshot to confirm.

**ARIA Roles & Keyboard Patterns:** Check `repeatingGroups` — horizontal group of 3-5 same-sized elements with one distinct child is likely tabs. Row of small circles is likely pagination. Look up matching pattern in `wcag-patterns.md` for exact contract.

**Accessible Names:** Check `iconFrames` for `hasTextChild: false` — these need `aria-label`. Check `focusableElements` detected as `textLink` — may have vague text needing context enrichment.

**Alt-Text:** Check `imageNodes` — `isFullBleed: true` = likely decorative (`alt=""`). `isFullBleed: false` = likely content image needing description. Screenshot individual content images to write alt text.

**Landmarks:** Use screenshot + node positions. Topmost horizontal section = likely banner. Largest content area = main. Bottom section = footer.

**DOM Strategy:** Check for `overlays` (modals need `inert` on background content), `repeatingGroups` that match carousel patterns (slides need `aria-hidden` management).

**Screen Reader Notes:** Only generate if scan shows complex patterns — overlays (focus trap), carousels (swipe conflicts), etc.

## What the designer experiences

Nothing changes in their workflow. Same steps, same UI, same buttons. The blueline generation takes approximately one second longer for the scan. The Tier 2 cards get filled more accurately when Claude runs.

## Edge cases

- **No structural patterns found:** Scan data is mostly empty. Claude falls back to screenshot-only analysis (same as today, no regression).
- **Well-named layers:** Keyword detection works great. Scan data confirms what names already told us. Claude has even more confidence.
- **Very large frames (100+ nodes):** Scan should cap tree depth at 8-10 levels and limit output to the most relevant signals (top 50 text nodes, top 20 repeating groups, etc.) to keep the JSON reasonable.
- **Multiple blueline generations on same frame:** Each generation overwrites the previous `.structural-scan` node.
- **JSON size:** The scan output should stay under 10KB. If it exceeds this, truncate lower-priority data (drop text nodes beyond top 30, drop repeating groups below 3 children, etc.).

## Success criteria

1. The scan runs in under 2 seconds on a typical design frame (50-200 nodes)
2. Claude's Tier 2 fills are noticeably more accurate on files with poorly named layers
3. No regression on well-named files — the scan adds information, never removes it
4. Designer workflow is unchanged — no new steps, buttons, or decisions
