# Homepage Redesign — Engineering Fix Brief

**Source branch:** `site-redesign-foundation-bkp` (adobecom/milo)
**Block path:** `libs/c2/blocks/<block>/<block>.css`
**Base styles:** `libs/c2/styles/styles.css`
**Token reference:** `dist/packages/tokens/css/dev/tokens.semantic.light.css`
**Audit tool:** `audit_css` via S2A DS MCP (`https://s2a-ds-mcp.vercel.app/api/mcp`)
**Scope:** All CSS files in `libs/c2/` and `libs/` that reference `--s2a-*` tokens
**Date:** 2026-04-02 (color) / 2026-04-02 (full — all token categories)
**Line numbers:** Grep-verified against source files. All line numbers confirmed accurate.

---

## How to read this brief

Each violation is marked with one of four dispositions:

| Symbol | Meaning |
|---|---|
| ✅ **Apply directly** | High confidence — exact or near-exact token match. No design review needed. |
| ⚠️ **Verify intent** | Medium confidence — closest match found, but confirm the design intent before applying. |
| ❓ **Design question** | Low confidence or off-system value. A decision is needed before this can be fixed. |
| 🔴 **Token gap** | No matching token exists. Token must be added to the system first. |

---

## How milo uses these tokens

These tokens are **not installed as an npm package**. The compiled CSS files are committed directly to `libs/c2/styles/deps/` and loaded as static assets:

```
libs/c2/styles/deps/tokens.primitives.css
libs/c2/styles/deps/tokens.semantic.css
libs/c2/styles/deps/tokens.semantic.light.css
libs/c2/styles/deps/tokens.semantic.dark.css
libs/c2/styles/deps/tokens.responsive.*.css
```

Engineers working in the milo repo **do not need the consonant-2 repo locally** to understand token names and values. The MCP server (`https://s2a-ds-mcp.vercel.app/api/mcp`) has all token data bundled and can be queried without any local install. Token values can also be read directly from the committed CSS files above.

---

## Token gaps — must be resolved before some fixes can land

| Token name | Value | Used in |
|---|---|---|
| `--s2a-color-transparent-black-44` | `rgba(0,0,0,0.44)` | router-marquee |
| `--s2a-color-transparent-black-32` | `rgba(0,0,0,0.32)` | router-marquee |
| `--s2a-color-transparent-white-12` | `rgba(255,255,255,0.11–0.12)` | router-marquee |
| `--s2a-color-background-brand-blue` | `#3b63fb` (default) / `#274dea` (hover) | styles.css `.blue` button |

> **Already exists:** `--s2a-color-transparent-black-64` (64%), `-12`, `-16`, `-24`, `-32`, `-48` are now all in the token set (confirmed in the deployed primitives). The `--s2a-color-transparent-black-44` is the only transparent-black gap for scrim values.
>
> **Also exists:** `--s2a-color-transparent-white-12` is in the token set. Router-marquee was using `rgba(255,255,255,0.11)` which rounds to 12 — this is now a ✅ fix, not a gap.
>
> **Undefined token in use:** `--s2a-color-white` is referenced in `global-footer.css` L380 but does not exist in the token set. This will silently produce no color in the browser. Fix immediately with `--s2a-color-content-knockout`.

---

## Summary

| File | ✅ Apply | ⚠️ Verify | ❓ Question | 🔴 Gap |
|---|---|---|---|---|
| `brand-concierge.css` | 8 | 1 | 3 | 0 |
| `router-marquee.css` | 4 | 0 | 6 | 1 |
| `carousel-c2.css` | 4 | 0 | 1 | 0 |
| `rich-content.css` | 1 | 0 | 1 | 0 |
| `base-card.css` | 1 | 0 | 1 | 0 |
| `elastic-carousel.css` | 3 | 0 | 0 | 0 |
| `box.css` | 1 | 0 | 0 | 0 |
| `explore-card.css` | 3 | 0 | 2 | 0 |
| `global-footer.css` | 16 | 1 | 1 | 1 |
| `modal.css` | 2 | 0 | 2 | 0 |
| `region-nav.css` | 0 | 1 | 0 | 0 |
| `s2a-fontcheck.css` | 1 | 0 | 1 | 0 |
| `georoutingv2.css` | 2 | 2 | 2 | 0 |
| `styles.css` | 11 | 3 | 1 | 1 |
| **Total** | **57** | **8** | **21** | **3** |

**Clean (0 violations):** `menu.css`, `news.css`, `section-metadata.css`, `sum26.css`, `global-navigation.css`

---

## Recommended order of work

1. **Bug fix now** — `global-footer.css` L380: `--s2a-color-white` is undefined, causes a silent rendering failure. Fix immediately.
2. **Token gap** — add `--s2a-color-transparent-black-44` and a semantic blue CTA token before fixing those specific lines.
3. **Design questions** — get decisions on gray body text (#222, #4B4B4B, #808080), the modal scrim, focus colors, and the blue button.
4. **Clean fixes anytime** — the 57 ✅ violations can be fixed independently and require no design input.

---

## `brand-concierge.css`

> `--bc-*` custom properties (L12–35) define component-scoped variables. The audit tool cannot infer namespace from a custom property name alone — recommendations below are based on how each variable is used. Verify before applying.

### ✅ Apply directly

| Line | Current value | Fix |
|---|---|---|
| L54 | `background: var(--s2a-color-gray-1000)` | `background: var(--s2a-color-background-knockout)` |
| L88 | `background: #fff` | `background: var(--s2a-color-background-default)` |
| L218 | `color: #fff` | `color: var(--s2a-color-content-knockout)` |
| L586 | `color: #000` | `color: var(--s2a-color-content-body-strong)` |

### ✅ Apply — `--bc-*` component alias fixes

| Line | Variable | Current value | Fix |
|---|---|---|---|
| L12 | `--bc-header-color` | `#131313` | `var(--s2a-color-content-body-strong)` |
| L18 | `--bc-card-text-color` | `#292929` | `var(--s2a-color-content-default)` |
| L33 | `--bc-button-color` | `#292929` | `var(--s2a-color-content-default)` |
| L34 | `--bc-button-hover-color` | `#131313` | `var(--s2a-color-content-body-strong)` |

> `#131313` → `--s2a-color-content-body-strong` and `#292929` → `--s2a-color-content-default` are Δ0 exact matches.

### ⚠️ Verify intent

| Line | Current value | Likely fix | Question |
|---|---|---|---|
| L595 | `background: #EAEAED` | `var(--s2a-color-background-subtle)` | Background-subtle resolves to #f8f8f8 — Δ30 from #EAEAED. Is this a card surface or something else? If it's a divider used as a background, there may be no matching token. |

### ❓ Design questions

**L35 — `--bc-keyboard-focus-color: #5574F7`**
Blue focus ring. `--s2a-color-focus-ring-default` exists for this purpose but resolves to a different blue.
- Is `#5574F7` intentionally off-system (brand-specific)?
- Or should it align to `--s2a-color-focus-ring-default`?

**L327, L339 — `color: #4B4B4B`**
Medium gray text. No exact semantic match — closest is `--s2a-color-content-subtle` but Δ97. Two occurrences in the file.
- What role does this color serve? Subdued body copy? Secondary label?
- Cannot be fixed until a semantic role is confirmed.

**L594 — `color: #A358B1`**
Purple accent. No S2A token exists for this.
- Is this intentionally off-system?
- Or should a `--s2a-color-content-accent` or brand color token be added?

---

## `router-marquee.css`

> Most violations are transparent `rgba` overlay/scrim values. One token gap blocks a fix.

### ✅ Apply directly

| Line | Current value | Fix |
|---|---|---|
| L61 | `color: #fff` | `color: var(--s2a-color-content-knockout)` |
| L135 | `box-shadow: rgba(255, 255, 255, 0.11)` | `box-shadow: var(--s2a-color-transparent-white-12)` |
| L146 | `background: #fff` | `background: var(--s2a-color-background-default)` |
| L147 | `color: #000` | `color: var(--s2a-color-content-body-strong)` |
| L187 | `background: #eb1000` | `background: var(--s2a-color-background-brand)` |

> **Note on L135:** `rgba(255,255,255,0.11)` rounds to 12% — `--s2a-color-transparent-white-12` exists in the token set. This is a ✅ fix.

### 🔴 Token gap — blocked

| Line | Current value | Needed token |
|---|---|---|
| L133, L212 | `background: rgba(0, 0, 0, 0.44)` | `--s2a-color-transparent-black-44` |

### ❓ Design questions — transparent overlays

**L217 — `background: rgba(0, 0, 0, 0.60)` (hover state)**
`--s2a-color-transparent-black-64` exists and is close (Δ4% opacity). Round up to 64%?

**L239 — `background: linear-gradient(108deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0.00) 98.86%)`**
Gradient with a 0.60 dark stop and a transparent stop. Two questions:
- Round the 0.60 stop to `--s2a-color-transparent-black-64` (Δ4%)?
- The transparent stop: use CSS `transparent` keyword. No token needed.

**L371 — `background: linear-gradient(108deg, rgba(0, 0, 0, 0.56) 0%, rgba(0, 0, 0, 0.00) 98.86%)`**
Same gradient pattern — round 0.56 to `--s2a-color-transparent-black-64` (Δ8%)?

**L299 — `background: rgba(0, 0, 0, 0.30)`**
`--s2a-color-transparent-black-32` exists (Δ2%). Round to 32%?

**L303 — `color: rgba(255, 255, 255, 0.75)`**
Semi-transparent white text on dark. Intentional subdued label, or should it be `--s2a-color-content-knockout` (fully opaque white)?
- If intentional: `--s2a-color-transparent-white-64` or `-80` may need to be added.

---

## `carousel-c2.css`

### ✅ Apply directly

| Line | Current value | Fix |
|---|---|---|
| L64 | `background: #000000` | `background: var(--s2a-color-background-knockout)` |
| L193 | `color: var(--s2a-color-gray-1000)` | `color: var(--s2a-color-content-body-strong)` |
| L197 | `color: var(--s2a-color-gray-25)` | `color: var(--s2a-color-content-knockout)` |
| L257 | `background: var(--s2a-color-gray-25)` | `background: var(--s2a-color-background-default)` |

### ❓ Design question

**L64 — `background: rgba(0, 0, 0, 0.09)` (card shadow, within the same gradient shorthand)**
Very low-opacity black for a card shadow. `--s2a-color-transparent-black-08` (8%) or `-12` (12%) are the nearest options.
- Is this shadow value acceptable as a hardcoded value in `box-shadow` shorthand (common practice in design systems)?
- If it must be tokenized: round to `--s2a-color-transparent-black-08`.

---

## `rich-content.css`

### ✅ Apply directly

| Line | Current value | Fix |
|---|---|---|
| L65 | `background: #000` | `background: var(--s2a-color-background-knockout)` |

### ❓ Design question

**L65 — `background: rgba(0, 0, 0, 0.00)` (gradient stop, within the same gradient shorthand)**
Transparent gradient stop. Use CSS `transparent` keyword — no token needed.

---

## `base-card.css`

### ✅ Apply directly

| Line | Current value | Fix |
|---|---|---|
| L58 | `color: var(--s2a-color-gray-1000)` | `color: var(--s2a-color-content-body-strong)` |

### ❓ Design question

**L73 — `color: var(--s2a-color-transparent-black-64)`**
This is already using the correct token name. `--s2a-color-transparent-black-64` now exists in the shipped token set — confirm with design and remove this question if confirmed.

---

## `elastic-carousel.css`

### ✅ Apply directly — all three violations are clean primitive → semantic swaps

| Line | Current value | Fix |
|---|---|---|
| L74 | `color: var(--s2a-color-gray-1000)` | `color: var(--s2a-color-content-body-strong)` |
| L245 | `color: var(--s2a-color-gray-25)` | `color: var(--s2a-color-content-knockout)` |
| L250 | `background-color: var(--s2a-color-gray-25)` | `background-color: var(--s2a-color-background-default)` |

---

## `box.css`

### ✅ Apply directly

| Line | Current value | Fix |
|---|---|---|
| L20 | `color: var(--s2a-color-gray-25)` | `color: var(--s2a-color-content-knockout)` |

> Context: text on a `--s2a-color-red-400` surface — knockout (white) text is correct. Note that `--s2a-color-red-400` is a primitive. If this box uses a brand surface, confirm whether a semantic `--s2a-color-background-brand-*` should be used for the fill.

---

## `explore-card.css`

### ✅ Apply directly

| Line | Current value | Fix |
|---|---|---|
| L25 | `color: var(--s2a-color-gray-25)` (hover state) | `color: var(--s2a-color-content-knockout)` |
| L133 | `color: var(--s2a-color-gray-25)` (inside `.dark`) | `color: var(--s2a-color-content-knockout)` |

> L133 is inside a `.dark` component variant block — it is a component-level property, not a global theme override. Using the semantic knockout token is correct here.

### ❓ Design questions

**L7 — `color: var(--s2a-color-gray-1000)` (base link container color)**
Pure black on light surface. Closest semantic is `--s2a-color-content-body-strong` (gray-900 = `#131313`) — Δ very small. Is pure black intentional here, or is `--s2a-color-content-body-strong` the right target?

**L18 — `background: linear-gradient(180deg, rgba(0 0 0 / 0%) 38.93%, rgba(0 0 0 / 59%) 70%)`**
Gradient overlay on hover. Two stops:
- `rgba(0 0 0 / 0%)` → use CSS `transparent`
- `rgba(0 0 0 / 59%)` → `--s2a-color-transparent-black-64` is Δ5%. Round up to 64%?

---

## `global-footer.css`

> The footer is a dark surface (`--s2a-color-background-knockout`). All `--s2a-color-gray-25` usages in this file are text/icon/border on dark — they should all use the knockout semantic tokens.

### ✅ Apply directly — gray-25 on dark surface (group fix)

All lines using `--s2a-color-gray-25` for text or `fill`:

| Lines | Property | Fix |
|---|---|---|
| L30, L44, L53, L76, L93, L114, L122, L201, L226, L282, L293, L389 | `color` | `color: var(--s2a-color-content-knockout)` |
| L116, L124, L283, L294 | `fill` (SVG) | `fill: var(--s2a-color-content-knockout)` |

All lines using `--s2a-color-gray-25` for borders:

| Lines | Property | Fix |
|---|---|---|
| L58, L115, L123 | `border-color` | `border-color: var(--s2a-color-border-inverse)` |

Background tokens:

| Line | Current value | Fix |
|---|---|---|
| L5 | `background: var(--s2a-color-gray-1000)` | `background: var(--s2a-color-background-knockout)` |
| L34 | `background-color: var(--s2a-color-gray-1000)` | `background-color: var(--s2a-color-background-knockout)` |

**🚨 Bug fix (L380) — undefined token:**

| Line | Current value | Fix |
|---|---|---|
| L380 | `color: var(--s2a-color-white)` | `color: var(--s2a-color-content-knockout)` |

> `--s2a-color-white` does not exist in the token set. This silently renders no color in the browser. Fix immediately.

### ⚠️ Verify intent

**L389 — `color: var(--s2a-color-gray-25); opacity: 0.6`**
Gray-25 (white) at 60% opacity for legal copy on the dark footer. After fixing to `--s2a-color-content-knockout`, the `opacity: 0.6` treatment remains. Is this intentional fading of the legal text, or should it use a dedicated muted knockout token?
- If intentional: `--s2a-color-transparent-white-64` could replace the opaque color + opacity pattern.

### ❓ Design question

**L222 — `color: #808080`**
Social icon default state color (muted gray, brightens to white on hover). `#808080` falls between `--s2a-color-gray-500` (#8f8f8f) and `--s2a-color-gray-600` (#717171) — no exact match.
- What semantic role is this? A "muted icon" variant?
- A new semantic token (`--s2a-color-content-muted` or similar) may be needed. ❓

---

## `modal.css`

### ✅ Apply directly

| Line | Current value | Fix |
|---|---|---|
| L18 | `background: #fff` | `background: var(--s2a-color-background-default)` |
| L305 | `background: var(--s2a-color-gray-1000)` | `background: var(--s2a-color-background-knockout)` |

### ❓ Design questions

**L2 — `--modal-focus-color: #109cde`**
Blue focus ring for the modal. `--s2a-color-focus-ring-default` exists — does this modal use the system focus ring, or does it have a brand-specific blue focus treatment?

**L7 — `--modal-close-accent-color: #707070`**
Medium-dark gray for the close button. `#707070` ≈ gray-600 (#717171, Δ1). No semantic token maps to this gray.
- Is this a subdued icon color? If so, `--s2a-color-content-subtle` (gray-700) is the nearest semantic, but Δ33.
- Or should this be `--s2a-color-content-default` (gray-800)?

**L124 — `background: rgb(50 50 50 / 80%)`**
Dark scrim behind the modal. `rgb(50,50,50)` is not pure black — it's a warm-gray tinted dark. No matching token.
- Can this be replaced with `--s2a-color-transparent-black-64` (pure black, 64%)?
- Or is the specific warm-gray tint intentional?

---

## `region-nav.css`

### ⚠️ Verify intent

| Line | Current value | Likely fix | Question |
|---|---|---|---|
| L77 | `color: var(--s2a-color-gray-1000)` | `color: var(--s2a-color-content-body-strong)` | gray-1000 (#000) vs content-body-strong (gray-900 = #131313) — Δ small but different. Is pure black intentional here? |

---

## `s2a-fontcheck.css`

> This file sets up font and typography overrides for the `s2a` theme, including a two-tone heading color feature.

### ✅ Apply directly

| Line | Variable | Current value | Fix |
|---|---|---|---|
| L12 | `--two-tone-heading-color-red` | `#EB1000` | `var(--s2a-color-brand-adobe-red)` | Δ0 exact match. |

### ❓ Design question

**L10 — `--two-tone-heading-color-gray: #717171`**
The gray accent for two-tone headings on light surfaces. `#717171` = `--s2a-color-gray-600` (primitive, Δ0). No semantic token exists for this accent gray.
- Should this reference a semantic token like `--s2a-color-content-subtle` (gray-700, Δ33 — not close enough)?
- Or should a `--s2a-color-content-accent-gray` or `--s2a-color-content-muted` semantic token be added?

---

## `georoutingv2.css`

> This file styles the geo-routing modal/dialog. Several hardcoded values have no semantic token equivalents.

### ✅ Apply directly

| Line | Current value | Fix |
|---|---|---|
| L31 | `background: #FFF` | `background: var(--s2a-color-background-default)` |
| L230 | `border-bottom: 1px solid var(--s2a-color-gray-1000)` | `border-bottom: 1px solid var(--s2a-color-border-knockout)` |

### ⚠️ Verify intent

| Line | Current value | Likely fix | Question |
|---|---|---|---|
| L32 | `box-shadow: 0 1px 4px #00000026` | `0 1px 4px var(--s2a-color-transparent-black-16)` | `#00000026` ≈ rgba(0,0,0,0.15) — rounding to 16% transparent-black. Δ1%. Visually imperceptible — apply? |
| L63 | `color: #222` | `color: var(--s2a-color-content-default)` | `#222222` (Δ~7 from gray-800 #292929). Close but not exact — is `--s2a-color-content-default` the right semantic role for this text? |

### ❓ Design questions

**L33 — `border: 1px solid #B1B1B1`**
`#B1B1B1` falls between gray-400 (#c6c6c6) and gray-500 (#8f8f8f). No semantic border token at this value.
- `--s2a-color-border-subtle` resolves to gray-300 (#dadada) — too light.
- `--s2a-color-border-default` resolves to gray-800 (#292929) — too dark.
- What border role does this serve? A new semantic border token may be needed for "medium" borders.

**L216, L222 — `border-color: var(--s2a-color-gray-500)`**
Gray-500 (#8f8f8f) used as a mid-gray border. Same problem as L33 — no semantic border token at this weight.
- Should `--s2a-color-border-subtle` be redefined to a darker value, or is a new `--s2a-color-border-medium` token needed?

**L68 — `background-color: rgb(229 229 229)`**
`#e5e5e5` ≈ gray-200 (#e1e1e1, Δ4). Could approximate to `--s2a-color-background-subtle` (gray-50 #f8f8f8, Δ large) — no, that's too light. No semantic background token at this gray weight.
- Is this a hover/press surface? A specific semantic token may be needed.

---

## `styles.css`

> `styles.css` is the base theme stylesheet. It defines the full primitive and semantic token set (`:root` blocks, lines 1–470) — those definitions are not violations. The `.dark {}` semantic token overrides (lines 463–469) are intentional dark-mode aliases and are also excluded.
>
> The violations below are in component/base styles that reference primitives directly, and a `/* Missing color */` comment left by engineers themselves.

### ✅ Apply directly — button dark variant (`.dark .con-button`)

Inside `.dark {}`, these are component-level dark variant styles (not theme token overrides):

| Lines | Current value | Fix |
|---|---|---|
| L847–848 | `--cta-background: var(--s2a-color-gray-25)` / `--cta-border-color: var(--s2a-color-gray-25)` | `var(--s2a-color-background-inverse)` / `var(--s2a-color-border-inverse)` |
| L853, L857 | `color: var(--s2a-color-gray-1000)` | `color: var(--s2a-color-content-inverse)` |
| L862–863 | `--cta-background: var(--s2a-color-gray-25)` / `--cta-border-color: var(--s2a-color-gray-25)` | `var(--s2a-color-background-inverse)` / `var(--s2a-color-border-inverse)` |
| L864 | `color: var(--s2a-color-gray-1000)` | `color: var(--s2a-color-content-inverse)` |

### ✅ Apply directly — button base states

| Line | Current value | Fix |
|---|---|---|
| L778–779 | `--cta-background: var(--s2a-color-gray-1000)` / `--cta-border-color` | `var(--s2a-color-background-knockout)` |
| L806 | `color: var(--s2a-color-gray-25)` (outline:active) | `color: var(--s2a-color-content-knockout)` |
| L820, L826, L832 | `color: var(--s2a-color-gray-25)` (.blue and .fill states) | `color: var(--s2a-color-content-knockout)` |

### ⚠️ Verify intent

| Line | Current value | Likely fix | Question |
|---|---|---|---|
| L492 | `color: var(--s2a-color-gray-1000)` (`body`) | `color: var(--s2a-color-content-body-strong)` | gray-1000 = #000; content-body-strong = gray-900 = #131313. Is pure black intentional for base body text? |
| L555 | `color: var(--s2a-color-gray-1000)` (`a` links) | `color: var(--s2a-color-content-body-strong)` | Same question for base link color. |
| L784 | `color: var(--s2a-color-gray-1000)` (`.con-button` label) | `color: var(--s2a-color-content-body-strong)` | Same question for default button text. |

### 🔴 Token gap — blue button (engineer-flagged)

> These lines already have `/* Missing color */` comments from the engineers who wrote them.

| Lines | Current value | What's needed |
|---|---|---|
| L818–819 | `background-color: #3b63fb; border-color: #3b63fb` | A semantic `--s2a-color-background-brand-blue` or `--s2a-color-button-cta-blue` token (resolves to `--s2a-color-blue-900`) |
| L824–825 | `background-color: #274dea; border-color: #274dea` (hover) | Same token in hover/pressed mode, or a hover variant (`--s2a-color-blue-1000`) |

> `#3b63fb` = `--s2a-color-blue-900`, `#274dea` = `--s2a-color-blue-1000` in the primitive scale. These values exist as primitives — only the semantic CTA token is missing.

### Exempt — debug UI

**L529, L539 — `#ff00a0`**
Hot-pink debug indicator for `div[data-failed="true"]`. Developer-facing error display, not a design system token concern. Exempt from this audit.

---

## Clean files — no violations

| File | Note |
|---|---|
| `menu.css` | No hardcoded or primitive color values — fully tokenized |
| `news.css` | No hardcoded or primitive color values |
| `section-metadata.css` | No hardcoded or primitive color values |
| `sum26.css` | Summit 2026 skin — no hardcoded colors, typography overrides only |
| `global-navigation.css` | No hardcoded or primitive color values |

---
---

# Non-Color Violations — Spacing, Typography, Radius, Border, Blur

> Audited with `audit_css` v2 (all token categories). Only **high-confidence violations** (exact token match, Δ0) are listed as ✅ apply directly. Low-confidence results (layout-specific fixed widths/heights like `width: 600px`, `height: 394px`) are excluded — those values don't map to spacing tokens and are acceptable hardcoded layout constraints.
>
> **Primitive → semantic upgrades** (already using `--s2a-*` but the numbered form instead of the t-shirt alias) are labeled as such. These are medium-priority — functionally correct today, but the named alias is more maintainable.

## What "primitive vs semantic" means for non-color tokens

| Primitive (numbered) | Semantic (t-shirt) | px value |
|---|---|---|
| `--s2a-spacing-4` | `--s2a-spacing-2xs` | 4px |
| `--s2a-spacing-8` | `--s2a-spacing-xs` | 8px |
| `--s2a-spacing-24` | `--s2a-spacing-lg` | 24px |
| `--s2a-spacing-48` | `--s2a-spacing-3xl` | 48px |
| `--s2a-border-radius-0` | `--s2a-border-radius-none` | 0 |
| `--s2a-border-radius-4` | `--s2a-border-radius-xs` | 4px |
| `--s2a-border-radius-8` | `--s2a-border-radius-sm` | 8px |
| `--s2a-border-radius-16` | `--s2a-border-radius-md` | 16px |
| `--s2a-border-radius-32` | `--s2a-border-radius-lg` | 32px |
| `--s2a-font-line-height-18` | `--s2a-font-line-height-xs` | 18px |
| `--s2a-font-line-height-20` | `--s2a-font-line-height-sm` | 20px |
| `--s2a-font-line-height-24` | `--s2a-font-line-height-md` | 24px |
| `--s2a-font-line-height-32` | `--s2a-font-line-height-lg` | 32px |

> **Note on shorthand padding/margin:** When a row shows `padding: 48px 32px 30px`, the tool surfaces the best-matching token for each unique px value in the shorthand. Apply tokens to individual sub-values using `padding-top`, `padding-right` etc., or replace the shorthand entirely with tokens. Values without exact matches (e.g. `30px`) should remain hardcoded or be aligned to the nearest token step as a design decision.

---

## `router-marquee.css` — 25 high-confidence non-color violations

### ✅ Spacing

| Line | Current | Fix |
|---|---|---|
| L105 | `gap: 24px` | `gap: var(--s2a-spacing-lg)` |
| L179 | `height: 4px` | `height: var(--s2a-spacing-2xs)` |
| L243 | `gap: 8px` | `gap: var(--s2a-spacing-xs)` |
| L296 | `width: 48px` | `width: var(--s2a-spacing-3xl)` |

### ✅ Border radius

| Line | Current | Fix |
|---|---|---|
| L128 | `border-radius: 8px` | `border-radius: var(--s2a-border-radius-sm)` |
| L181 | `border-radius: 4px` | `border-radius: var(--s2a-border-radius-xs)` |

### ✅ Font size

| Line | Current | Fix |
|---|---|---|
| L67 | `font-size: 16px` | `font-size: var(--s2a-font-size-md)` |
| L165 | `font-size: 14px` | `font-size: var(--s2a-font-size-sm)` |
| L321 | `font-size: 40px` | `font-size: var(--s2a-font-size-4xl)` |
| L348 | `font-size: 56px` | `font-size: var(--s2a-font-size-6xl)` |
| L354 | `font-size: 18px` | `font-size: var(--s2a-font-size-lg)` |
| L388 | `font-size: 80px` | `font-size: var(--s2a-font-size-9xl)` |
| L394 | `font-size: 20px` | `font-size: var(--s2a-font-size-xl)` |

### ✅ Line height

| Line | Current | Fix |
|---|---|---|
| L68 | `line-height: 20px` | `line-height: var(--s2a-font-line-height-sm)` |
| L167 | `line-height: 18px` | `line-height: var(--s2a-font-line-height-xs)` |
| L322 | `line-height: 40px` | `line-height: var(--s2a-font-line-height-xl)` |
| L349 | `line-height: 56px` | `line-height: var(--s2a-font-line-height-3xl)` |
| L355 | `line-height: 24px` | `line-height: var(--s2a-font-line-height-md)` |
| L389 | `line-height: 76px` | `line-height: var(--s2a-font-line-height-5xl)` |

### ✅ Letter spacing

| Line | Current | Fix |
|---|---|---|
| L69 | `letter-spacing: -0.2px` | `letter-spacing: var(--s2a-font-letter-spacing-5xl)` |
| L323 | `letter-spacing: -1.2px` | `letter-spacing: var(--s2a-font-letter-spacing-2xl)` |
| L350 | `letter-spacing: -1.68px` | `letter-spacing: var(--s2a-font-letter-spacing-lg)` |
| L390 | `letter-spacing: -3.2px` | `letter-spacing: var(--s2a-font-letter-spacing-sm)` |

### ✅ Font weight

| Line | Current | Fix |
|---|---|---|
| L66 | `font-weight: 700` | `font-weight: var(--s2a-font-weight-adobe-clean-bold)` |
| L74 | `font-weight: 900` | `font-weight: var(--s2a-font-weight-adobe-clean-black)` |

> **Blur violations (3):** `router-marquee.css` also uses hardcoded blur values. Check lines with `backdrop-filter` or `filter: blur()` and replace with `--s2a-blur-*` tokens (e.g. `--s2a-blur-8`, `--s2a-blur-16`).

---

## `brand-concierge.css` — 10 high-confidence non-color violations

### ✅ Spacing

| Line | Current | Fix |
|---|---|---|
| L38 | `padding: 40px 24px 12px` | Replace with spacing tokens per sub-value (40px has no exact match; 24px = `--s2a-spacing-lg`) |
| L62 | `gap: 4px` | `gap: var(--s2a-spacing-2xs)` |
| L115 | `gap: 8px` | `gap: var(--s2a-spacing-xs)` |
| L702 | `padding: 80px 48px 24px` | Replace per sub-value (80px = `--s2a-spacing-80`; 48px = `--s2a-spacing-3xl`; 24px = `--s2a-spacing-lg`) |

### ✅ Border radius

| Line | Current | Fix |
|---|---|---|
| L556 | `border-radius: 8px` | `border-radius: var(--s2a-border-radius-sm)` |
| L596 | `border-radius: 4px` | `border-radius: var(--s2a-border-radius-xs)` |

### ✅ Typography

| Line | Category | Current | Fix |
|---|---|---|---|
| L504 | font-size | `font-size: 16px` | `font-size: var(--s2a-font-size-md)` |
| L584 | line-height | `line-height: 32px` | `line-height: var(--s2a-font-line-height-lg)` |
| L585 | font-weight | `font-weight: 900` | `font-weight: var(--s2a-font-weight-adobe-clean-black)` |
| L591 | font-weight | `font-weight: 700` | `font-weight: var(--s2a-font-weight-adobe-clean-bold)` |

> **27 low-confidence violations** in `brand-concierge.css` are layout-specific fixed dimensions (card widths, heights, calculated layout values). These don't have token equivalents and should remain hardcoded.

---

## `modal.css` — 7 high-confidence non-color violations

### ✅ Spacing

| Line | Current | Fix |
|---|---|---|
| L189 | `padding: 48px 32px 30px` | `48px → var(--s2a-spacing-3xl)`; `32px → var(--s2a-spacing-32)`; 30px has no exact match |
| L207 | `padding: 8px` | `padding: var(--s2a-spacing-xs)` |
| L231 | `margin: 0 0 4px` | `4px sub-value → var(--s2a-spacing-2xs)` (use `margin-bottom: var(--s2a-spacing-2xs)` or individual properties) |

### ✅ Typography

| Line | Category | Current | Fix |
|---|---|---|---|
| L221 | font-size | `font-size: 16px` (`.region-selector > div > p`) | `font-size: var(--s2a-font-size-md)` |
| L235 | font-size | `font-size: 24px` | `font-size: var(--s2a-font-size-2xl)` |
| L249 | font-size | `font-size: 14px` | `font-size: var(--s2a-font-size-sm)` |
| L198 | font-weight | `font-weight: 500` | `font-weight: var(--s2a-font-weight-adobe-clean-medium)` |

> **Note:** `line-height: 1.25rem` at L199 resolves to 20px at base font size. If targeting this, use `line-height: var(--s2a-font-line-height-sm)` — but confirm the rem value is intentional before converting to a px token.
>
> **21 low-confidence violations** in `modal.css` are fixed dialog dimensions (`width: 300px`, `width: 600px`, `max-width: 516px` etc.) — these are component-specific layout constraints, not spacing tokens.

---

## `georoutingv2.css` — 8 high-confidence non-color violations

### ✅ Spacing

| Line | Current | Fix |
|---|---|---|
| L12 | `padding: 56px 24px 40px` | `56px` no exact match; `24px → var(--s2a-spacing-lg)`; `40px → var(--s2a-spacing-40)` |
| L38 | `margin-bottom: 8px` | `margin-bottom: var(--s2a-spacing-xs)` |
| L95 | `margin-left: 4px` | `margin-left: var(--s2a-spacing-2xs)` |

### ✅ Border

| Line | Category | Current | Fix |
|---|---|---|---|
| L34 | border-radius | `border-radius: 4px` | `border-radius: var(--s2a-border-radius-xs)` |
| L114 | border-width | `border-width: 0 0 2px` | Bottom border width `2px → var(--s2a-border-width-md)` (use `border-bottom-width` individually) |

### ✅ Typography

| Line | Category | Current | Fix |
|---|---|---|---|
| L64 | font-size | `font-size: 14px` | `font-size: var(--s2a-font-size-sm)` |
| L81 | line-height | `line-height: 48px` | `line-height: var(--s2a-font-line-height-2xl)` |

### ⚠️ Font family

| Line | Current | Question |
|---|---|---|
| L3 | `font-family: 'Adobe Clean', adobe-clean, 'Trebuchet MS', sans-serif` | Should use `var(--s2a-font-family-default)` which resolves to `"adobe-clean"`. But confirm whether overriding `font-family` here is intentional — if this is already set globally by `s2a-fontcheck.css`, this declaration may be redundant. |

---

## `global-footer.css` — 2 high-confidence non-color violations

| Line | Category | Current | Fix |
|---|---|---|---|
| L128 | spacing | `width: 8px` | `width: var(--s2a-spacing-xs)` |
| L129 | spacing | `height: 4px` | `height: var(--s2a-spacing-2xs)` |

> **12 low-confidence violations** are fixed dimensions for the footer grid layout — acceptable as hardcoded.

---

## `base-card.css` — 5 high-confidence non-color violations

> All are primitive-to-semantic upgrades — the file already uses `--s2a-spacing-*` tokens, just the numbered form instead of the t-shirt alias.

| Line | Current | Fix |
|---|---|---|
| L37 | `width: 24px` | `width: var(--s2a-spacing-lg)` |
| L57 | `margin-bottom: var(--s2a-spacing-8)` | `margin-bottom: var(--s2a-spacing-xs)` |
| L66 | `margin-top: var(--s2a-spacing-24)` | `margin-top: var(--s2a-spacing-lg)` |
| L68 | `margin-bottom: var(--s2a-spacing-4)` | `margin-bottom: var(--s2a-spacing-2xs)` |
| L78 | `padding: var(--s2a-spacing-24)` | `padding: var(--s2a-spacing-lg)` |

---

## `elastic-carousel.css` — 3 high-confidence non-color violations

> All primitive-to-semantic upgrades.

| Line | Category | Current | Fix |
|---|---|---|---|
| L67 | spacing | `width: 24px` | `width: var(--s2a-spacing-lg)` |
| L379 | border-radius | `var(--s2a-border-radius-0)` | `var(--s2a-border-radius-none)` |
| L77 | line-height | `var(--s2a-font-line-height-18)` | `var(--s2a-font-line-height-xs)` |

---

## `explore-card.css` — 1 high-confidence non-color violation

| Line | Category | Current | Fix |
|---|---|---|---|
| L31 | border-radius | `var(--s2a-border-radius-16)` | `var(--s2a-border-radius-md)` |

---

## `rich-content.css` — 1 high-confidence non-color violation

| Line | Category | Current | Fix |
|---|---|---|---|
| L37 | spacing | `margin-top: var(--s2a-spacing-24)` | `margin-top: var(--s2a-spacing-lg)` |

---

## `region-nav.css` — 1 high-confidence non-color violation

| Line | Category | Current | Fix |
|---|---|---|---|
| L56 | font-size | `font-size: 14px` | `font-size: var(--s2a-font-size-sm)` |

---

## `s2a-fontcheck.css` — 4 high-confidence non-color violations

> This file defines the S2A theme's button and typography size overrides. The hardcoded px values should be replaced with tokens, but note that some padding values in shorthands are only partial matches.

| Line | Category | Current | Fix |
|---|---|---|---|
| L184 | font-size | `font-size: 20px` | `font-size: var(--s2a-font-size-xl)` |
| L194 | font-size | `font-size: 18px` | `font-size: var(--s2a-font-size-lg)` |
| L214 | font-size | `font-size: 16px` | `font-size: var(--s2a-font-size-md)` |
| L187 | spacing | `padding: 14px 24px 8px` | `24px → var(--s2a-spacing-lg)`; `8px → var(--s2a-spacing-xs)`; `14px` has no exact spacing token match |

> **5 low-confidence violations** are responsive heading size overrides (e.g. `font-size: 73px`, `font-size: 52px`) — these are intentional one-off typographic scale values that don't map to the base font-size token scale.

---

## `styles.css` — 2 high-confidence non-color violations

| Line | Category | Current | Fix |
|---|---|---|---|
| L3 | font-weight | `font-weight: 900` | `font-weight: var(--s2a-font-weight-adobe-clean-black)` |
| L540 | font-weight | `font-weight: 700` (debug `::before` element) | `font-weight: var(--s2a-font-weight-adobe-clean-bold)` |

> **15 low-confidence violations** in `styles.css` include the CTA button's base `border-radius: 50px` (pill radius — no token at this value, `--s2a-border-radius-round` = 999px is the closest), various media query width breakpoints, and one `height: 2px` indicator line. These are all acceptable hardcoded values.
>
> **Note on `border-radius: 50px` (`.button-lg`):** The nearest token is `--s2a-border-radius-round` (999px) which renders identically for small elements. ⚠️ Verify if the pill button should use `--s2a-border-radius-round` or if 50px is an intentional constraint.

---

## Non-color violations summary

| File | Spacing | Radius | Border-W | Font-size | Line-h | Letter-s | Font-w | Font-fam | Blur | Total ✅ |
|---|---|---|---|---|---|---|---|---|---|---|
| `router-marquee.css` | 4 | 2 | 0 | 7 | 6 | 4 | 2 | 0 | 3\* | **25** |
| `brand-concierge.css` | 4 | 2 | 0 | 1 | 1 | 0 | 2 | 0 | 0 | **10** |
| `modal.css` | 3 | 0 | 0 | 3 | 0† | 0 | 1 | 0 | 0 | **7** |
| `georoutingv2.css` | 3 | 1 | 1 | 1 | 1 | 0 | 0 | ⚠️ | 0 | **8** |
| `base-card.css` | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **5** |
| `s2a-fontcheck.css` | 1 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | **4** |
| `elastic-carousel.css` | 1 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | **3** |
| `global-footer.css` | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **2** |
| `styles.css` | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | **2** |
| `rich-content.css` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **1** |
| `explore-card.css` | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **1** |
| `region-nav.css` | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | **1** |
| `carousel-c2.css` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| `box.css` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| **Total** | **24** | **7** | **1** | **16** | **8** | **4** | **7** | **1⚠️** | **3\*** | **72** |

\* Blur token names: check lines with `backdrop-filter: blur(Xpx)` in router-marquee and replace with `var(--s2a-blur-{X})` where X ∈ {8, 16, 24, 32, 64, 128}.

† `modal.css` L199 has `line-height: 1.25rem` (= 20px). If converting to a token, use `--s2a-font-line-height-sm`, but first confirm whether the rem value is intentional. Not counted in the total until confirmed.
