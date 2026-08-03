# Light / Dark Mode Audit

Tracking token coverage, missing On Dark variants, and doc surface split fixes across all S2A components.

---

## Platform Constraint: Slots Break Variable Mode Inheritance

**Figma limitation — no workaround on the platform side.**

Slot nodes create a boundary in the frame hierarchy that blocks variable mode propagation. Any component instance placed inside a slot will NOT inherit the parent frame's On Light / On Dark mode — regardless of how the slot or its parent are configured.

This affects two distinct patterns in S2A:

### 1. Doc surface splits
Component instances are currently **pasted on top** of surface split frames, not inside them. Even when moved inside, if they land in a slot, the mode still won't apply.

**Fix:** Each surface split frame needs a true child frame (not a slot) containing the component instance. The component must be a direct descendant of the mode-bearing frame.

### 2. Slotted content in components
Components that use slots for composable content (e.g. `List → .items SLOT → ListItem instances`) will have their slotted children fail to respond to variable mode switches — even when the token bindings are correct.

**Fix:** Replace `.items`-style SLOT containers with regular auto-layout frames. This removes the drag-drop slot affordance in Figma's UI but restores token/mode behavior.

**System-wide rule:** If a component or its children need to respond to variable modes, their content cannot live inside a Slot. Composability via slots and token-driven theming are mutually exclusive in the current Figma platform. Design accordingly.

---

## Authoring Rule: Component Definitions Must Be Modeless

**Never assign a variable mode to a component's root frame or its parent frame on the component's page.**

If a mode is set at the component definition level, it becomes baked into every instance. Instance overrides can only be applied at the instance level — the parent frame or page can no longer control the mode. This breaks the core design system promise that dropping a component onto a dark surface "just works."

**The correct pattern:**
- Component definition page: no mode set on any ancestor frame of the component
- Mode is set exclusively on the **surface the component is placed into** (a section, frame, or page in the consumer file)
- Instances inherit from their parent automatically — no per-instance override needed

**Consequence of getting this wrong:** If you accidentally set On Light on the component page, every instance in the file will show On Light values regardless of context until manually overridden at the instance level.

---

## Token Gaps

| Token | Status | Notes |
|---|---|---|
| `border/subtle-inverse` | ✅ Resolved | Created as `s2a/color/divider/subtle-inverse` — tw16 Light, tw08 Dark. |

---

## New Tokens Created This Session

| Token | ID | Light | Dark | Purpose |
|---|---|---|---|---|
| `s2a/color/router-nav-item/background/active` | `VariableID:11280:219675` | gray/25 (#fff) | gray/25 (#fff) | Always-white active pill on media surface |
| `s2a/color/router-nav-item/content/active` | `VariableID:11280:219676` | gray/1000 (#000) | gray/1000 (#000) | Always-black text/icon on active pill |
| `s2a/color/page/default` | `VariableID:11320:225670` | gray/25 (white) | gray/1000 (#000) | Canvas background — deepest layer |
| `s2a/color/page/inverse` | `VariableID:11320:225671` | gray/1000 (#000) | gray/25 (white) | Inverted canvas (dark hero on light page) |
| `s2a/color/section/default` | `VariableID:11320:225672` | gray/25 (white) | gray/1000 (#000) | Zone background — inherits page by default |

**Note:** User raised concern about proliferating component-level tokens. Future direction: evaluate whether `surface/*` tokens (currently zero internal or external usage) can replace component-level tokens for this pattern. `surface/subtle` is the leading candidate for ElasticCard.

---

## Surface Token Status

**Zero internal and zero external usage** — completely clean slate. Current resolved values:

| Token | Light | Dark |
|---|---|---|
| `surface/default` | #ffffff | #2c2c2c |
| `surface/subtle` | #f8f8f8 | #181818 |
| `surface/strong` | #eeeeee | #444444 |
| `surface/inverse` | #181818 | #f8f8f8 |
| `surface/knockout` | #000000 | #000000 |

ElasticCard plan: wire to `surface/subtle`, update dark mode value from #181818 → #131313 (matches Firefly reference frame `11280:224912`).

---

## Library Analytics (key findings)

| Token | Files | Usages | Notes |
|---|---|---|---|
| `body-strong` | 231 | 14,060 | Heavy usage in Hub, Plans, C2-Rich Content, Home — do not mutate |
| `background/subtle` | 138 | 15,417 | Wide usage — additive only |
| `surface/*` (all) | 0 | 0 | Safe to evolve values and establish pattern |

---

## Homepage Token Audit — RouterMarquee (in progress)

**sec-HERO frame** (`10086:103156`) — Playground page, `elastic-card-updates` file.

Current issues:
- Frame has explicit dark variable mode set (`VariableCollectionId:6:17 = 6:1`) — blocks page-level mode switching
- Eyebrow (`10086:103159`) + Title (`10086:103160`): `content/knockout` ✅ correct for media surface, no change needed
- Body (`10086:103161`): hardcoded `#717171` — no token binding, wrong value for dark bg

**Comment posted** (`ID: 1852514030`) on sec-HERO explaining the issue.

**Next steps — NOT YET EXECUTED:**
1. Remove explicit dark mode from `sec-HERO` frame
2. Rebind body text to `content/knockout` (always white, correct for dark media bg — `#717171` has no matching S2A semantic token and would be low-contrast on dark photo)

---

## Component Status

| Component | Status | Notes |
|---|---|---|
| Button | ⏳ Pending | Styles: solid, outlined, transparent, accent. Visual map in Exploration. `accent` is a11y on both contexts — no on-dark variant needed. |
| IconButton | ⏳ Pending | Same scope as Button. |
| ControlButton | ✅ Done | 10 variants, `media` style only. 23 `control-button/*` semantic tokens. |
| PromoCTA | ✅ Done | 6 variants, local arrow button. 10 `s2a/color/promo-cta/*` tokens (confirmed correct path). |
| Divider | ✅ Done | 5 variants, all token-bound, `subtle-inverse` gap resolved. |
| ProductLockup | ✅ Done | **v2** (`11272:217527`): Context axis removed, 16→8 variants + 4 knockout variants = 12 total. **v1** (`11267:215193`): accidentally modified — user needs to CMD+Z to restore, then leave v1 untouched. |
| RouterNavItem | ✅ Done | Both sets in section `11273:218674`. Active state: `background/inverse` → `router-nav-item/background/active` (always white), label/icon → `router-nav-item/content/active` (always black). |
| ElasticCard | 🚧 Next up | Wire to `surface/subtle`. Set dark mode value #181818 → #131313 (Firefly reference: `11280:224912`). Light mode #f8f8f8 stays. Zero blast radius — no external surface token usage. |
| CheckboxTile | ⏳ Pending | `Show Icon` boolean + `Icon` instance swap need manual binding in Figma. |
| Checkbox | ⏳ Pending | On Dark variant check needed. |
| Label | ⏳ Pending | Verify On Dark applies via variable mode on parent frame. |
| AppIcon | ⏳ Pending | Not yet audited. |
| Tag | ⏳ Pending | Not yet audited. |
| Link | ⏳ Pending | Not yet audited. |

---

## Status Key

- ✅ Done — audited, tokens verified
- 🚧 In progress / Next up — clear next action defined
- ⏳ Pending — not yet started
- ❌ Blocked — token gap or other blocker
