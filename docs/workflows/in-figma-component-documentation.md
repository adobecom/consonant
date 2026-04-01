# In-Figma component documentation kit — what we’re building

This document **reconstructs the intended process** from:

- `.codex/skills/component-docs.skill.md`
- `.claude/commands/component-docs.md`
- `.codex/skills/figma-console-safe-execution.skill.md`

Use it as the **north star** for generating component docs inside Figma via **Figma Console MCP**, and as a **repeatable template** per component.

---

## 1. Outcomes (why this exists)

We generate **high-quality technical documentation directly in Figma** so **designers and engineers share one readable spec**: how the component is built, which tokens it uses, how to configure it, and how to ship it accessibly.

| Principle | Meaning |
| --- | --- |
| **ELI5, not shallow** | Short sentences, plain words, scannable layout — but **accurate** (real props, real tokens, real WCAG refs). |
| **Live truth** | Data comes from **`figma_execute`** against the actual component set: `componentPropertyDefinitions`, variants, layer tree, bound variables — **no invented APIs**. |
| **Token truth** | Doc surfaces use **semantic S2A variables** and **text styles** (`setTextStyleIdAsync`). No raw hex on sheets. |
| **Specs-style visuals** | Each section should feel like a **spec board**: preview + breakdown + token readout (similar in spirit to Nathan Curtis–style / Specs-plugin layouts — **not** a plugin rebuild; same clarity for designers **and** devs new to the system). |
| **Clean component set** | Callouts and long copy live on **`.sheet frame` siblings**, **not** inside the published component — so MCP/codegen don’t ingest junk layers (`docs/workflows/figma-to-code-workflow.md`, `docs/guardrails/figma-component-authoring.md`). |
| **Downstream mirror** | Where we ship code, **Storybook / `docs/` / story-ui-docs** should echo the same story — Figma = design-system spec surface; repo = **executable** contract. |

---

## 2. How goals map to the five sheets

The kit is **five named frames** per component, in a **fixed order**, placed in a **row to the right** of the component set.

| Your goal | Where it lives in the kit |
| --- | --- |
| **Anatomy** | **Sheet 1 — Anatomy** — Live instance(s), numbered **`.step`** legend, layer/part → token mapping. |
| **Architecture** | Same sheet — treat “architecture” as **structure**: hierarchy, slots, what wraps what (preview + legend). Optional small “layer stack” list or table. |
| **Properties** | **Sheet 2 — Properties** — One block per prop from `componentPropertyDefinitions`; **preview instances** per value where useful. |
| **Layout** | **Sheet 3 — Layout & Spacing** — **Padding vs gap vs margin** (Figma ↔ CSS), all from the **spacing token scale**; Specs-style diagram + `buildDocTable()` with a **Notes** column that explains *why* each choice (see §3–§4). |
| **Usage** | **Sheet 5 — Usage** — **Do / Don’t** columns with `.step` bullets, anti-patterns, content rules. |
| **Workflow** | **Sheet 5** (and short intros on other sheets) — e.g. “Figma → tokens → Storybook → Milo”, `#consonant-tokens` escalation, Dev Mode tip. |
| **Onboarding** | **Every sheet** — One-line **Description** in the sheet header + **intro paragraph** on the `Desktop` frame (“start here” tone). |
| **Accessibility (POUR)** | **Sheet 4 — Accessibility** — Organized by **Perceivable / Operable / Understandable / Robust** (see §6). |

---

## 3. Spacing model: padding, gap, and margin (design ↔ code alignment)

S2A does **not** ship a separate “gap token” family. **Gap** in Figma auto-layout and **`gap` in CSS** should still be filled from the **same spacing scale** as padding—e.g. `s2a/spacing/*` (or your published semantic spacing aliases). The doc kit must **name the token**, not raw px, so designers and engineers stop making **ambiguous** spacing choices.

### ELI5: three different jobs

| Concept | Think of it as… | Figma (auto-layout) | CSS (typical) | Use it for… |
| --- | --- | --- | --- | --- |
| **Padding** | “Breathing room **inside** the component’s box.” | Padding on the **frame** that is the component (or inner wrapper). | `padding` on the root / slot container | Touch targets, inset of label/icon from the component edge, consistent internal rhythm. |
| **Gap** | “Space **between siblings** inside the same layout.” | **Item spacing** (gap) on horizontal/vertical auto-layout. | `gap` (flex/grid) | Space between icon and text, between stacked rows inside the component, between pills in a chip group. |
| **Margin** | “Space **outside** this box, pushing away neighbors.” | Often **not** on the component itself—usually the **parent layout** or **page** applies spacing. Rarely: wrap in a frame with padding, or absolute offsets for annotations only. | `margin` on the host, or parent `gap` | Distance from this component to an adjacent component, section spacing, layout grid gutters—**layout owns margin**, not the atom in most cases. |

### Rules of thumb (dogfooding — put these on Sheet 3 + Usage)

1. **Inside the component:** prefer **padding** (inset) and **gap** (between children). Document **each** with a **spacing token** in the spec table.
2. **Between this component and the next:** prefer **parent `gap` / stack spacing / grid** or **page section tokens**—not random margin on the instance. Say so explicitly on **Usage**: “Don’t add extra frames for spacing; use the parent stack gap token `…`.”
3. **Never** mix unexplained px with tokens on the same surface—if the file shows 12px but the token is `sm`, the caption must read the **token path** and note “12px resolved from token.”
4. **Per component**, the **Layout & Spacing** sheet must include a short **“Spacing decisions”** block (body-lg or caption table row): *“Root padding uses …; label↔icon gap uses …; external spacing is owned by the layout, not this component.”*

### What to generate on Sheet 3 (Layout & Spacing)

- A **`buildDocTable()`** with rows that **label the mechanism**: `Padding (root)`, `Gap (primary axis)`, `Gap (cross / wrap if any)`, `External spacing (parent)`, `Fixed dimensions (icon, min width)`, each with **Token / value** and **Notes** (“why gap not margin”).
- Optional **overlay diagram**: dimension lines or tinted regions (use `border/default` or a subtle spec color) showing **inside vs between vs outside**—same spirit as a Specs readout, not decoration inside the live component.

---

## 4. Specs-style visualization (Nathan Curtis–aligned, not a plugin clone)

We are **not** rebuilding Specs. We **are** borrowing the **clarity pattern**: *see the thing, see the measures, see the tokens.*

### Per sheet, aim for three layers (when useful)

| Layer | Purpose |
| --- | --- |
| **1. Screenshot / live instance** | The real component (instance), so the spec stays honest. |
| **2. Structure readout** | Layer list, variant matrix snippet, or “what wraps what” — ties to **Anatomy / Architecture**. |
| **3. Measures + tokens** | Numbers tied to **named tokens** (padding, gap, radius, type, color)—ties to **Layout** and **Properties**. |

### Accessibility of the documentation itself

- **Language:** short sentences, define terms once per sheet (padding vs gap vs margin).
- **Visual:** high contrast spec lines and labels; don’t rely on color alone for “good vs bad” in Usage (neutral wording per existing command).
- **Audience:** write so a **new designer** and a **new engineer** both know **what to set in Figma** and **what to expect in CSS** for the same token.

### Where this shows up in the five sheets

- **Anatomy** — Layer 1 + 2 + token callouts on legend (Layer 3 lite).
- **Layout & Spacing** — Full **Layer 3** + diagram; explicit **padding / gap / margin** guidance.
- **Properties** — Layer 1 previews + token breakdown per value (Layer 3 per variant).

---

## 5. Reconstructed generation process (end-to-end)

### Phase 0 — Connect and load

1. **`figma_get_status`** — If it fails instantly, restart **Figma Desktop Bridge** / MCP server (see safe-execution skill).
2. Parse **Figma URL** → `node-id` (`2987-4193` → `2987:4193`).
3. In the **first** `figma_execute` (or early block), run:
   ```js
   await figma.loadAllPagesAsync();
   const vars = await figma.variables.getLocalVariablesAsync();
   const styles = await figma.getLocalTextStylesAsync();
   ```
4. **Discover** component set + scaffolding page (don’t assume stale ids if the file moved — verify with a small script when unsure).

### Phase 1 — Read the component (read-only)

Use **focused** `figma_execute` blocks (see §5):

- Locate **component set** / main component.
- Dump **variants**, **`componentPropertyDefinitions`**, representative **layer names** (depth-limited), **fills/strokes** with **variable bindings**.
- Resolve variable ids with **`getVariableByIdAsync`** to human-readable token paths for copy.

**Never** mutate the published component; only **read** it.

### Phase 2 — Scaffold five sheets

For each section, repeat the **sheet setup pattern** from `component-docs.md`:

1. On **Scaffolding** page: instance **`.sheet frame` Size=Default** (`2081:39858`) [or Large `2081:39861` if needed].
2. Move to **target page**, append instance, set **Title / Description / Date** text, **`detachInstance()`**.
3. Name frame **`.{ComponentName} — {Section}`** (leading dot optional but consistent).
4. Configure **`Desktop`** child: **VERTICAL** auto-layout, padding, `itemSpacing`, **background/subtle** fill via variable.
5. Position sheets in a **row** east of the component set: `x = compSet.x + compSet.width + 200 + index * (sheetWidth + gap)`.

**Idempotency:** If a sheet with that name exists, **remove** it then recreate (same as command doc).

### Phase 3 — Fill each sheet (content rules)

Apply **only** approved text styles and color variables (tables in skill + command).

- **Tables** — Always **`buildDocTable()`** (canonical rules: collapsed vertical wrapper, row fills, bottom stroke only — see command doc for full snippet).
- **Numbered lists / callouts** — **`.step`** component `2914:4879`.
- **Previews** — **Live COMPONENT instances** inside **card** frames (`bg/default` + `border/subtle`), not static screenshots.

### Phase 4 — Resize

After content: shrink **`Desktop`** height to content; resize **outer sheet** to header + desktop (+ margin). Pattern is in `component-docs.md` (sum child heights + spacing + padding).

### Phase 5 — Capture (separate from bulk build)

**Do not** call **`figma_capture_screenshot`** at the end of a long build thread.

- **Phase A done:** Return **`{ sheet name, nodeId }`** for each sheet frame.
- **Phase B:** New chat — one screenshot per turn, **FRAME only**, `scale: 1`, or **manual export** (`docs/case-study/screenshot-guide.md`, `docs/workflows/codex-figma-console-context.md`).

---

## 6. POUR on the Accessibility sheet (practical template)

Structure **Sheet 4** so each block maps to WCAG **POUR** (cite **WCAG 2.2 AA** success criteria where useful — the command file lists examples).

| POUR | What to include on the canvas |
| --- | --- |
| **Perceivable** | Contrast + non-color cues (underline, focus ring visibility); which **semantic color** tokens apply; **1.4.3**, **1.4.11** where relevant. |
| **Operable** | **Keyboard** table via `buildDocTable()` (Tab, Enter, Space, Escape as applicable); focus order note; **2.1.1**. |
| **Understandable** | Correct **role/semantics** (`<a>` vs `<button>`, labels); **2.4.4**, **4.1.2**. |
| **Robust** | Valid patterns for SPAs / custom elements; **`aria-*`** when the Figma prop implies it; name/value exposure. |

Include a **focus-state instance** in a small card (token for focus ring from variables).

---

## 7. Safe execution (avoid Codex timeouts / context blow-ups)

When invoking the agent, include **`figma-console-safe-execution`** (or `/figma-safe-exec`) expectations:

| Rule | Practice |
| --- | --- |
| **Small blocks** | One logical unit per `figma_execute`: e.g. one sheet’s `Desktop` content, or one `buildDocTable`, not five sheets in one giant string. |
| **Timeouts** | ~**2000–3000 ms** tiny edits; **5000–10000 ms** (or **30000 ms** only for very heavy single-sheet builds) for multi-node layouts. |
| **Auto-layout** | **`appendChild` then `FILL`** — never set `layoutSizingHorizontal = 'FILL'` before the node is in an auto-layout parent. |
| **Fonts** | **`loadFontAsync`** (and preload **Adobe Clean Display Black** etc.) before mutating text that uses those styles. |
| **Retries** | **One** patch + **one** retry per error — don’t loop identical code. |
| **Errors in chat** | Tool name + message + **10–30 lines** of code — not full logs. |
| **Screenshots** | Never **PAGE**; never many captures in a **long** session; prefer **Phase B** thread. |
| **Stroke API** | Don’t set **`stroke.visible = false`** on plugin stroke objects if read-only — use **stroke weights** (e.g. bottom only) as in `buildDocTable` patterns. |

---

## 8. Repeatable per-component template (checklist)

Copy this for **each** new component.

### Naming & placement

- [ ] Component set verified; **no edits** inside published set.
- [ ] Five sheets: **`.{Name} — Anatomy`**, **Properties**, **Layout & Spacing**, **Accessibility**, **Usage**.
- [ ] Sheets in a **horizontal row** to the **right** of the set with consistent **80px** (or team standard) gutter.

### Sheet 1 — Anatomy + architecture

- [ ] **Title** (title-4) + **intro** (body-lg).
- [ ] **Two columns:** preview card with **instance(s)** + **legend** with `.step` rows (number, part name, token caption).
- [ ] Cover **text, icons, wrappers, focus ring** if present in the file.

### Sheet 2 — Properties

- [ ] For each **property** from definitions: eyebrow + label + body + **preview row** (instances set to that value).
- [ ] VARIANT / BOOLEAN / TEXT / INSTANCE_SWAP each handled per command doc.

### Sheet 3 — Layout & spacing

- [ ] Instance in card + **measurement list** or **Specs-style diagram** (inside vs between vs outside).
- [ ] **`buildDocTable()`**: rows for **padding**, **gap(s)**, **external spacing (parent-owned)**, fixed sizes, radius — each with **token path** and a **Notes** cell explaining *padding vs gap vs margin*.
- [ ] Short **“Spacing decisions”** paragraph: what belongs inside the component vs what the **layout** owns.

### Sheet 4 — Accessibility (POUR)

- [ ] Four subsections (or stepped list) mapped to **P / O / U / R**.
- [ ] Keyboard table + focus instance + contrast notes + WCAG IDs.

### Sheet 5 — Usage + workflow + onboarding

- [ ] **Do** / **Don’t** columns (`.step` + body-lg).
- [ ] **Workflow** card: handoff steps + channel for token questions.
- [ ] **Onboarding**: one sentence on what the component *is for* at top of Usage (and one line in sheet header Description).

### Quality gates

- [ ] All doc text uses **`setTextStyleIdAsync`** — minimum body **body-lg**.
- [ ] No **brand** red backgrounds on doc surfaces.
- [ ] All fills on docs use **variable binding** where color applies.
- [ ] Tabular data only via **`buildDocTable()`**.
- [ ] **Phase A** complete → hand off **node id list**; **Phase B** or **manual** PNG export for repo/Storybook.

---

## 9. Related repo paths

| Topic | Doc |
| --- | --- |
| MCP context / screenshots | `docs/workflows/codex-figma-console-context.md` |
| Screenshot how-to | `docs/case-study/screenshot-guide.md` |
| No stickies in components | `docs/guardrails/figma-component-authoring.md` |
| Token guardrails in code | `docs/guardrails/no-primitives-in-components.md` |
| Codex skills | `.codex/skills/component-docs.skill.md`, `.codex/skills/figma-console-safe-execution.skill.md` |
| Claude commands | `.claude/commands/component-docs.md`, `.claude/README.md` |

---

## 10. One-line agent prompt (paste before a run)

> Follow `docs/workflows/in-figma-component-documentation.md`, `.claude/commands/component-docs.md`, and `figma-console-safe-execution`: small `figma_execute` blocks, correct timeouts, append-then-FILL, load fonts first, build all five `.sheet frame` sheets with live data and semantic tokens; on **Layout & Spacing**, document **padding vs gap vs margin** with spacing tokens (no fake “gap tokens”—use the spacing scale), Specs-style measures, and **no** `figma_capture_screenshot` until Phase B (new thread) or manual export.

This is the **fully fleshed** description of what we’re building and how to run it repeatably.
