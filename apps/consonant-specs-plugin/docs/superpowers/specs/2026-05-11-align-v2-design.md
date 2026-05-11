# Align V2 — Design Spec

**Date:** 2026-05-11
**Status:** Draft — awaiting user review
**Author:** Taeho Chang (with Claude)

## Problem

The existing **S2A Audit** (under the `Align` button) reports a misleadingly high compliance percentage on real designs.

When applied to the frame `Nav - Products - Featured` it reported `90% S2A compliant`, while Figma's native **Check designs** feature found 4 wrong-library color bindings, 6 wrong-library dimensions, and 6 unconnected components on the same frame. The plugin missed all of these.

Root cause, verified by reading the code:

- `tokens.ts:266–283` (`matchColor`) matches by hex value only. It does not inspect `boundVariables`.
- `tokens.ts:331–384` (`matchSpacing`, `matchRadius`, `matchDimension`) match by numeric value only.
- `utils.ts:60–80` (`getNodeFills`, `getNodeStrokes`) returns resolved hex and ignores the binding.
- A fill bound to a legacy variable (e.g. `S2AC/Palette/gray/50`) whose resolved value happens to also exist in the canonical S2A token map is reported as `matched`.
- Typography (`s2a-audit.ts:60–101`) *does* check the binding's S2A identity via `lookupTextStyleById` — this is the only category currently doing so.

In addition, the existing audit UI (`ui.ts:270–312`) renders each issue as a flat row with a `No token` badge and only supports click-to-navigate. It does not show a suggested replacement, does not allow per-row override, and does not preview before applying via Full Align / Force Match.

## Goal

Add a new **Align V2** screen that:

1. Detects wrong-library bindings (in addition to hardcoded values) for fills, strokes, corner radius, padding, item spacing, and stroke weight.
2. Presents results in a Check-designs-style UI: per-tab categorisation, per-row suggestion + override dropdown, and a per-tab `Apply` button.
3. Does not modify the existing `Align` button, `s2a-audit.ts`, `tokens.ts` match functions, or `ui.ts` render functions. The existing flow remains fully operational.

## Non-goals

- ML-ranked suggestions. Value-distance matching is sufficient.
- Component-source detection (detached instances, non-S2A library components). The plugin API does not expose source library name for components (verified against `@figma/plugin-typings/plugin-api.d.ts:2383`), so any non-detached check would be unreliable. Deferred.
- Effects, drop shadow, blur, opacity. Existing decision in `tokens.ts:894` notes effect-level variable binding is unsupported in the current flow; not changing this here.
- Refactoring `s2a-audit.ts` or any shared low-level code. Align V2 is fully independent.
- Removing the dead Drop Shadow / Blur checkboxes in the Match tab (`ui.html:97–98`). Surface as a follow-up.

## Navigation

A new nav entry in the `DESIGN` section of the plugin sidebar, directly below `Align`:

```
DESIGN
  Align          ← existing, untouched
  Align V2       ← NEW
  Match
  Grids
  Specs
```

Selecting `Align V2` **widens the plugin window** to ~800px and switches to a **split-pane layout**: the existing nav (DESIGN/COMPLIANCE/UTILITIES) remains visible on the left, and the Align V2 content (tabs + rows + apply) renders on the right. This approximates the visual feel of Check designs' side-by-side panel within the single-window constraint of the Figma plugin API. Existing buttons (`s2aAuditBtn`, `fullAlignBtn`, etc.) and their handlers remain untouched.

Leaving Align V2 (clicking back, or clicking any other nav item) resizes the window back to the default width and restores the normal single-pane behavior.

> **Why split-pane and not a separate window:** Figma plugins are limited to a single UI window per plugin (`UIAPI` is a singleton in `@figma/plugin-typings/plugin-api.d.ts:2615`; `figma.showUI` opens only one iframe). Check designs achieves its two-window look as a first-party Figma feature. Plugins cannot replicate this; the split-pane layout is the closest approximation.

## UI layout

```
┌─ Align V2 ────────────────────────────────────── ✕ ─┐
│ Selection: Nav - Products - Featured (FRAME)        │
│ ───────────────────────────────────────────────── │
│ [Colors 4]  [Dimensions 6]  [Typography 0]          │
│ ───────────────────────────────────────────────── │
│ ☑ Frame  │ Fill   │ #515151        → [s2a/...▾]    │
│ ☑ Shape  │ Fill   │ S2AC/Pal/gray  → [s2a/...▾]    │
│ ⊘ Shape  │ Stroke │ #FF00FF        → No S2A token  │
│ ☑ Text   │ Fill   │ S2AC/Pal/black → [s2a/...▾]    │
│ ───────────────────────────────────────────────── │
│ Update 3 colors across 4 items.       [Apply 3]    │
└─────────────────────────────────────────────────────┘
```

Three tabs (no Components tab): `Colors`, `Dimensions`, `Typography`. Each shows a live count in its label. The body of each tab is a scrollable list of issue rows. The footer shows a counter line and a single `[Apply N]` button scoped to the active tab.

### Row structure

| Column | Content |
|---|---|
| Checkbox | Default checked when `suggestion !== null`. Disabled when no suggestion. |
| Node name | Short, click-to-navigate (same behavior as existing `ui.ts:302–307`). |
| Property | `Fill`, `Stroke`, `Corner Radius`, `Padding Top`, `Item Spacing`, `Stroke Weight`, etc. |
| Current value | Hex (for hardcoded) or non-S2A variable/style name (for wrong-library). |
| → Suggestion | Dropdown with the auto-pick selected by default. Dropdown lists **all** S2A tokens in that category (Colors / Dimensions / Typography). When no S2A token matches the value, the suggestion column reads `No S2A token` and the row checkbox is disabled. |
| Match badge | `Match` shown when the suggestion is an exact value match. Hidden otherwise. |

## Detection logic per tab

"S2A library" is identified using the same logic that `loadLibraryTokens` already uses at `tokens.ts:120–137`:

- The variable's `variableCollectionId` resolves to a collection whose `key` is in `S2A_COLLECTION_KEYS`, **or**
- The collection's `libraryName === 'S2A / Foundations'`, **or**
- The collection's `name.startsWith('S2A / ')` (fallback per `tokens.ts:136`)

### Colors tab — fills + strokes

For each visible `SOLID` paint on every node (recursing the selection, skipping `INSTANCE` descendants):

| Paint state | Detection | Suggestion |
|---|---|---|
| No `boundVariables.color` (hardcoded hex) | Look up hex in `colorVarMap` | If exact match → suggest that S2A token. If not → row shown, Apply disabled, "No S2A token". |
| `boundVariables.color` → variable IS in S2A collections | Skip; counts as compliant. | n/a |
| `boundVariables.color` → variable NOT in S2A collections | Flag as `source: 'wrong-library'` | Look up the bound variable's resolved hex in `colorVarMap` → suggest canonical S2A token. |

### Dimensions tab

Properties audited: `cornerRadius` (per-corner), `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `itemSpacing`, `strokeWeight`.

Same three states using `node.boundVariables` keys (`topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, `bottomRightRadius`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `itemSpacing`, `strokeWeight`). Numeric value lookup via `matchDimension` with the appropriate scope (`CORNER_RADIUS`, `GAP`, `STROKE_FLOAT`).

### Typography tab

Reuses the typography logic already in `s2a-audit.ts:60–101`:

| Text state | Detection | Suggestion |
|---|---|---|
| `textStyleId` bound to an S2A style (`lookupTextStyleById` returns non-null) | Skip. | n/a |
| `textStyleId` bound to a non-S2A style | Flag as `source: 'wrong-library'`. | Match by family + size + weight via `matchTypographyStrict` → suggest S2A text style. |
| No `textStyleId` (raw fontName) | Match by family + size + weight. | If match → suggest. If not → row shown, Apply disabled. |

## Data shape

```ts
interface AlignV2Result {
  colors: AlignV2Issue[];
  dimensions: AlignV2Issue[];
  typography: AlignV2Issue[];
}

interface AlignV2Issue {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  property: string;             // 'Fill' | 'Stroke' | 'Corner Radius' | 'Padding Top' | …
  currentValue: string;         // hex, "18px", "Inter Regular 14px"
  source: 'hardcoded' | 'wrong-library';
  currentBindingName?: string;  // for 'wrong-library': the non-S2A variable/style name
  suggestion: {
    tokenName: string;
    variableId?: string;        // present for colors + dimensions (used with setBoundVariable)
    textStyleId?: string;       // present for typography (used with setTextStyleIdAsync)
    isExactMatch: boolean;
  } | null;                     // null when no S2A token exists for this value
  allCandidates: TokenCandidate[];
}

interface TokenCandidate {
  tokenName: string;
  variableId?: string;
  textStyleId?: string;
  value: string | number;       // for display in dropdown
}
```

## Apply flow

1. User checks / unchecks rows. Default: every row with `suggestion !== null` is checked. Disabled rows (`suggestion === null`) cannot be checked.
2. User clicks `[Apply N]` for the active tab.
3. UI sends one `align-v2-apply` message to `code.ts` with `{ tab, selections: Array<{ nodeId, property, variableId | textStyleId }> }`.
4. Plugin sandbox iterates each selection:
   - `await figma.getNodeByIdAsync(nodeId)`
   - For colors/dimensions: `node.setBoundVariable(propertyKey, variable)`
   - For typography: `await textNode.setTextStyleIdAsync(textStyleId)`
5. After all selections processed, send `align-v2-apply-result` with success/failure counts and per-row results.
6. UI: rows that succeeded are removed from the list; rows that failed remain with a small error indicator.
7. Toast: `N updated, M failed`.

## Re-scan behavior

The screen has a `Scan` button. Each click runs a fresh scan. There is no preservation of per-row state across scans — the new result wins. (Simpler than reconciling stale `nodeId`s against new audit output.)

## Edge cases and defaults

| Edge case | Behavior | Rationale |
|---|---|---|
| Hidden nodes (`visible === false`) | Skip during scan | Consistent with `s2a-audit.ts:128` |
| Instance children (`node.type === 'INSTANCE'`) | Skip descendants (don't recurse) | Consistent with `s2a-audit.ts:131` — overrides belong to the master |
| Mixed paint arrays (SOLID + IMAGE) | Audit each SOLID independently | Consistent with `getNodeFills` filter |
| `fontName === figma.mixed` or `strokeWeight === figma.mixed` | Skip the row | Binding a single value to mixed properties is destructive |
| Pure black/white fills (`#FFFFFF`, `#000000`) | Skip | Consistent with `s2a-audit.ts:196` — usually intentional |
| Tokens not yet loaded | `await loadLibraryTokens()` before scanning | Consistent with `s2a-audit.ts:140` |
| Re-scan while a scan is already in progress | Ignore the second click | Avoid race conditions |
| Apply failure (variable deleted between scan and apply, node moved, etc.) | Row stays with error indicator; toast reports failed count | Surface failures honestly |
| Selection is empty | Disable `Scan`; show empty state "Select a frame to scan" | Consistent with existing Align |
| Selection is not a frame / component / component set | Disable `Scan`; show hint | Same constraint as existing Align |

## Files added (no existing files modified)

- `src/align-v2.ts` — new audit module: detection + types + scan orchestration. Independent of `s2a-audit.ts`.
- `src/align-v2-ui.ts` — new UI rendering: tabs, rows, dropdown population, apply submission. Independent of `renderAuditResult` / `renderAlignResult`.
- `src/ui.html` — additions only: new `Align V2` nav button, new `<section>` for the V2 pane and its DOM scaffolding. No edits to existing markup.
- `src/code.ts` — additions only: new message handlers `align-v2-scan` and `align-v2-apply`. No edits to existing handlers.

## Reused (no modifications)

- `tokens.ts` constants and loaders: `S2A_COLLECTION_KEYS`, `loadLibraryTokens`, `isLoaded`, `colorVarMap`, `dimensionVarMap`, `textStyleMap`, `lookupTextStyleById`, `matchColor`, `matchRadius`, `matchSpacing`, `matchDimension`, `matchTypographyStrict`, `detectNodeColorRole`.
- `utils.ts`: `figmaColorToHex`, `getCornerRadius` (helpers that don't strip binding info).

## Risks

- **No live behavioral test.** This spec is derived from code reading and the Check designs docs; the actual on-frame behavior of Align V2 has not been observed. First implementation should be tested against the `Nav - Products - Featured` frame referenced above and compared against Check designs' output for the same frame.
- **`boundVariables` shape varies by property.** Need to verify in implementation that the property key passed to `setBoundVariable` matches Figma's exact API name (e.g., `topLeftRadius` vs `cornerRadius`). Existing `s2a-audit.ts:252–255` already binds the four per-corner radius keys individually — same pattern.
- **Performance on large selections.** A frame with thousands of nodes may block the UI during scan. If observed, add a yield-to-UI loop. Not pre-optimised.

## Follow-ups (out of scope here)

- Remove or implement the Drop Shadow / Blur checkboxes in the Match tab (`ui.html:97–98` send `dropShadow`/`blur` categories to `forceMatch`, which explicitly drops them at `tokens.ts:894`).
- Component-source detection — revisit if Figma exposes a library-name plugin API.
- Backport binding-library detection to the original `s2a-audit.ts` once V2 is proven (corrects the false 90% on the original Align flow too).
