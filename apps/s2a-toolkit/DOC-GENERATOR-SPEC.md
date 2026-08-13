# In‑Plugin Component Doc Generator — Build Spec

**Goal:** anyone selects a component set, clicks one button, and gets a fully‑populated component doc in the current house style — no Claude, no bridge. Turns "ask Matt to run the doc script" into "click Generate."

Status: spec / not built. Supersedes the plugin's old **Spec sheet** (dark‑section) generator.

---

## 1. User flow

1. Select a `COMPONENT_SET` on canvas.
2. Tools → **Docs → Generate component doc**.
3. Panel shows what was detected (name, version/status from the meta fence, axes for the variant grid) with smart defaults; author can tweak or just hit **Generate**.
4. A complete component doc appears to the right of the set on the same page; canvas zooms to it.

Re‑running on a set that already has a `… · Docs` frame → **Update in place** vs **New version**.

---

## 2. Inputs

| Input | Source | Default |
|---|---|---|
| Component set | current selection | — (error if not a `COMPONENT_SET`) |
| Doc title | — | `{SetName} · Docs` |
| Version / status / changelog | the `— s2a:meta —` fence in `set.description` | parsed automatically; editable |
| Variant grid axes | auto‑detected from variant x/y clustering | auto; override only if mis‑detected |
| Sections to include | checkboxes | all applicable ones on |
| Placement | — | right of the set, same page |

---

## 3. What it reads off the set — fully automatic

- **Variants** — `set.children.filter(c => c.type==='COMPONENT')`, parse each `Prop=Value, …` name → axes + values.
- **Property table** — `set.componentPropertyDefinitions` → rows (variant / boolean / instance‑swap / text) with their options.
- **Anatomy** — walk the default variant's layer tree → dot‑named layers (`.root`, `.icon-start`, `.label`, …) → anatomy list.
- **Tokens / text styles** — bound variables on fills/strokes/spacing/radius + `getTextStyleIdAsync` on text layers (reuse the plugin's existing annotate/token‑binding helpers).
- **Meta fence** — parse `— s2a:meta —` from `set.description`: `version`, `status`, `updated`, `changelog`, plus the `## Good to know` / `## Accessibility` prose blocks.

**The fence is the contract:** if the description's meta + prose are current, the generator produces a complete doc with zero manual editing. (Ties directly to the versioning model.)

---

## 4. Output — the doc layout

The generator **clones a canonical Doc Template** (a real frame in the file) and only swaps *content*, never structure. Sections (rows), each shown/hidden based on what the set actually has:

1. **Hero + Versioning** — default‑variant instance + name; version/status/updated/changelog from the fence.
2. **All variants** — the variant grid **+ axis labels** (row = one axis, columns = another).
3. **Anatomy + Properties** — dot‑named layer list + the property table.
4. **Slots** — only if the set uses Figma slots.
5. **Good to know + Accessibility** — prose from the fence (or placeholders).
6. **Dark‑mode preview** — the grid/hero re‑rendered in the dark theme mode.
7. **Built from real surfaces** *(optional)* — provenance card.

> **Why a template, not build‑from‑scratch:** the template owns the *style* (tokens, spacing, corner radii, type). When the house style evolves, you update **one template**, not the generator. The generator owns *content* only.

---

## 5. Repopulate algorithm (deterministic)

Mirrors the clone‑and‑repopulate recipe we already run via the bridge:

1. **Validate** selection is a `COMPONENT_SET`; parse the meta fence.
2. **Clone** the Doc Template; rename `{Set} · Docs`; place right of the set on its page.
3. **Hero** — `createInstance()` on the default `COMPONENT` variant; set the name text (Adobe Clean Display Bold).
4. **Versioning card** — fill version / status / updated / changelog from the fence.
5. **All variants** — remove template placeholders; place one instance per variant; run the **axis‑labeler**:
   - cluster variants by rounded `x` (columns) and `y` (rows);
   - a property that's constant down a column → column header; constant across a row → row label; skip globally‑constant props;
   - **misaligned grids** (variant widths/heights differ so cells don't line up): align column headers to the top row and row labels to the left column — the three patterns already handled (variable‑width like IconButton/PromoCTA, variable‑height like RouterNavItem).
6. **Anatomy** — emit the dot‑named layer list from the default variant.
7. **Properties** — build the table from `componentPropertyDefinitions`.
8. **Good to know / Accessibility** — inject the fence's prose blocks; if absent, leave template placeholders + flag.
9. **Dark preview** — clone the grid/hero row; `setExplicitVariableModeForCollection(themeCollection, darkModeId)` on it.
10. **Reflow** — reassert auto‑layout sizing bottom‑up: inner VERTICAL frames `primaryAxisSizingMode='AUTO'`, HORIZONTAL frames `counterAxisSizingMode='AUTO'`, doc `primaryAxisSizingMode='AUTO'`.
11. **Select + zoom** to the doc; toast.

---

## 6. Automatic vs. needs‑input

| Fully automatic | Needs input (smart default) |
|---|---|
| Variant grid + axis labels | Doc title |
| Property table | Section toggles |
| Anatomy | Axis override (rare) |
| Version / status / changelog (from fence) | Prose: Good to know / Accessibility — **auto if written in the fence**, else placeholder |
| Dark preview, placement, reflow | |

The only genuinely non‑automatable content is the *prose* — and even that is automatic if the author keeps it in the component description (which the versioning model already asks them to do).

---

## 7. Architecture

- **`code.ts`** — `doc:generate` message handler containing the algorithm (pure Figma API). Reuses existing token‑binding / annotate helpers.
- **`ui.ts`** — a **Docs** tool: "Generate component doc" button + detected‑axes confirmation + optional config fields.
- **Doc Template** — a clean, dedicated template frame on a `📐 Templates` page, referenced by a stable name. **Prerequisite:** build this as a *placeholder* template (no embedded real component set), unlike today's `Button — v2 · Docs` which embeds the real Button set and is fragile to clone.

---

## 8. Generalization strategy (the hard part)

The variance between components is handled by **conditional sections + a robust grid labeler**, not per‑component code:

- Anatomy, property table, versioning, dark preview → generic, work for any set.
- Variant grid → the axis‑labeler already covers clean grids + the three misaligned patterns.
- Section variance (a button hero ≠ a card hero; Slots only sometimes) → the template contains every section; the generator **shows/hides** rows based on what the set has.
- **Coverage phasing:** v1 = atoms + simple molecules (buttons, icon buttons, lockups, cards, inputs). v2 = complex/nested (marquees, routers, multi‑part cards).

---

## 9. Guardrails / known gotchas (learned building these by hand)

- Selection not a `COMPONENT_SET` → clear error.
- Single‑variant set → skip grid labels.
- **Missing meta fence** → generate with placeholders + warn ("add a meta fence for auto version/changelog").
- **Unloaded fonts** → load all range fonts (`getRangeAllFontNames`) before any text write, or it throws / silently no‑ops.
- **`resize()` resets `primaryAxisSizingMode` to FIXED** → always reassert `'AUTO'` after resizing an auto‑height frame (else it clips its children).
- **Hidden layers** (e.g. an intentionally‑hidden body) → report, don't force visible.
- `textAutoResize='FILL'` is invalid — it's `WIDTH_AND_HEIGHT`; and a `TRUNCATE` text node won't accept FILL until switched to `HEIGHT`.

---

## 10. MVP (Phase 1)

Select set → clone template → **Hero + Versioning (from fence) + All‑variants grid with axis labels + Properties + Anatomy + Dark preview + reflow**. Prose pulled from fence or placeholder.

**Defer:** provenance card, update‑in‑place/versioned regeneration, complex‑component coverage.

## 11. Effort / risk

Most of the logic already exists as bridge scripts — axis‑labeling, clone‑and‑repopulate, dark‑mirror, meta‑fence parsing. The work is **porting it into deterministic `code.ts` + building the clean template**. Biggest ongoing risk is keeping the template in sync and the prose‑automation boundary — mitigated by the rule: **template owns style, fence owns content.**
