# NavFilter — Spec Audit (2026-04-10)

**Spec:** `packages/components/src/nav-filter/nav-filter.spec.json`
**Violations:** 8 — 0 high · 4 medium · 4 low
**Industry reference:** Chip (Filter variant) blueprint · WAI-ARIA APG Filter Patterns · Web Components Best Practices (Google web.dev)

---

## Findings

| # | Severity | Check | Field | Current | Expected |
|---|---|---|---|---|---|
| 1 | Medium | 3.1 Non-standard field | `unresolvedTokens` | Present | Not in canonical spec.json schema — remove. Unresolved font primitives are already in the extraction log, not the spec. |
| 2 | Medium | 3.7 Token coverage | `tokenBindings` | `color` only bound for `:default` | Active and hover text color is unspecified. If unchanged, add explicit bindings: `"color:active": "--s2a-color-content-default"`, `"color:hover": "--s2a-color-content-default"`. Unspecified bindings create ambiguity at handoff. |
| 3 | Medium | 3.8 A11y role | `a11y.role` | `"button"` | The knowledge base identifies this as a **Chip (filter)** pattern. Two valid ARIA approaches — pick one and commit: **(a)** Standalone toggle: `role="button"` + `aria-pressed="true/false"`. **(b)** Tab group: `role="tab"` + `aria-selected="true/false"` inside `role="tablist"`. The current notes say "depends on context" — that's not a spec, it's a deferral. Decide and document. |
| 4 | Medium | 3.8 Keyboard format | `a11y.keyboard` | `["Enter or Space to activate"]` (flat string array) | Object array required for consistency with other specs: `[{ "key": "Enter", "action": "Activates the filter" }, { "key": "Space", "action": "Activates the filter" }]`. If role becomes `tab`, add: `{ "key": "ArrowLeft/ArrowRight", "action": "Moves focus to adjacent filter" }`. |
| 5 | Low | 3.6 Missing prop | `props` | No `onClick` | All interactive components must expose an event handler. Add `{ "name": "onClick", "type": "function", "description": "Called when the filter is activated." }` |
| 6 | Low | 3.6 Missing prop | `props` | No `disabled` | Filter tabs are routinely disabled when their category has no results. Add `{ "name": "disabled", "type": "boolean", "defaultValue": "false", "description": "Prevents interaction and applies disabled styling." }` |
| 7 | Low | 3.9 Industry benchmark | `props` | Selection via `state: "active"` | Chip (filter) and Tab patterns across Carbon, Material, and Polaris expose selection as a **boolean** prop (`selected` or `active`) separate from a visual `state` string. Mixing selection state with forced visual state in one prop conflicts with Web Components best practices (Google web.dev): "Always accept primitive data as attributes or properties." Consider adding `active: boolean` for programmatic selection, keeping `state` for testing/docs-only forced rendering. |
| 8 | Low | 3.9 Industry benchmark | `props` | No `count` prop | Several filter chip implementations (Polaris, Carbon) support an optional count/badge showing how many results match the filter. Low priority, but worth noting for future extensibility. |

---

## Industry benchmark notes

**Closest match: Chip (filter variant)**
The design-systems knowledge base Chip blueprint explicitly lists **Filtering** as primary use case, with anatomy of Container + Label Text — matching NavFilter exactly. Key patterns across 27+ design systems:

| System | Component name | Selection prop | Event | Disabled |
|---|---|---|---|---|
| Material Design | FilterChip | `selected: boolean` | `onSelected` | `disabled: boolean` |
| IBM Carbon | Tag (filter) | `filter: boolean` | `onClose` | `disabled: boolean` |
| Shopify Polaris | Tag | `disabled: boolean` | `onClick` | `disabled: boolean` |
| Adobe Spectrum | ActionButton | `isSelected: boolean` | `onPress` | `isDisabled: boolean` |

All expose selection as a boolean, not as a value within a `state` string enum.

**ARIA note from WAI-ARIA APG:**
The APG has a dedicated "Filter Patterns" section. Its guidance: prefer native HTML elements (`<button>`) over ARIA roles where possible. A `<button>` with `aria-pressed` is the simplest correct implementation for a standalone filter toggle. Only use `role="tab"` if NavFilter is always rendered inside a `role="tablist"` container — which requires the parent component to manage arrow key navigation, focus, and `aria-selected`.

---

## Token binding notes

All 6 tokens verified via `check_token_exists` — no primitives detected.

One observation: `--s2a-typography-font-size-label`, `--s2a-typography-line-height-label`, and `--s2a-typography-letter-spacing-label` are in the `s2a-responsive-container-grid` collection. These are valid and resolve correctly, but the collection name is unexpected for typography tokens — worth confirming with the token team that this is intentional and not a miscategorisation.

---

## Actions (ordered by priority)

1. **Decide and commit on `a11y.role`** — standalone `button` + `aria-pressed`, or `tab` + `aria-selected` in a tablist. Update role, keyboard interactions, and notes accordingly. This is the most impactful fix.
2. **Remove `unresolvedTokens` field** from spec.json.
3. **Add explicit `color:active` and `color:hover` token bindings.**
4. **Fix `a11y.keyboard`** to object array format.
5. **Add `onClick` and `disabled` props.**
6. **Consider `active: boolean` prop** for programmatic selection alongside `state`.
7. **Rebuild s2a-ds MCP** so this spec is indexed: `cd apps/s2a-ds-mcp && npm run copy-data && npm run build`.
