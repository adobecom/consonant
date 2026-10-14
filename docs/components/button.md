# Button — v3 spec (redesign)

Status: **proposal, for review** · Target: Figma component set `Button` (new) · Code: `packages/components/src/button/` (`c-button`) · Proposed version: `3.0.0`

Author: Claude, 2026-10-09, from the v2 contract (`button.defs.json`, node `10715:35477`), the S2A token set (via `s2a-ds`), and the design-systems knowledge base (Spectrum, Carbon, Primer, Material, EightShapes naming, WCAG 2.2).

> The in-progress Figma set was not readable this session (Desktop Bridge not connected, no link supplied). Everything below is derived from the v2 set's extracted evidence plus the token system. Section 11 lists what to confirm against the canvas before building.

---

## 1. TL;DR

- **One `Style` axis, flat values, one value = one token namespace.** `solid` · `outlined` · `transparent` · `accent` · `knockout` · `outline-inverse`. This is the model the tokens already use (the nested `primary/solid/on-light` tokens were deprecated in favour of it). Adding a style never multiplies variants.
- **Add a `Size` axis now** (`sm` · `md` · `lg`), ship `md` first. Sizing moves from a raw `14px` padding to five new component tokens so every number is a token.
- **No `Context` axis.** Light/dark comes from variable modes. `knockout` and `outline-inverse` are static white styles for media and colored surfaces, not a theme.
- **Figma API:** Variants `State`, `Size`, `Style` → Booleans `Show Icon Start`, `Show Icon End` → Instance swaps `Icon Start`, `Icon End` → Text `Label`. Set in that order at creation.
- **One accessibility defect found in the tokens:** the default focus ring is black at 48% in both modes, so on a dark page it measures **1.07:1** (needs 3:1). Fix in tokens before the set ships.
- **Decisions you need to make** are in section 11. The three that block the build: focus-ring dark value, md icon size (12 vs 16), and whether `lg` gets its own label type size.

---

## 2. What the button is

The primary action trigger for adobe.com marketing surfaces. A label with optional leading and trailing icons. It renders a native `<button>`, or an `<a>` when it has an `href`. Light and dark are handled by page-level variable modes, so a designer chooses a style, never a theme.

Not this component: icon-only controls (that is `IconButton`, which has its own token namespace), links in running text (`Link`), segmented or toggle controls.

---

## 3. Decisions and why

| # | Decision | Why | Alternative considered |
|---|---|---|---|
| D1 | Single `Style` axis with flat values | Matches `s2a/color/button/background/{style}/{state}`. Each style is self-describing and the token path is derivable from the variant value. Spectrum's `variant × style × staticColor` model needs a token per intersection, which is the nested scheme S2A already deprecated. | Two axes, `Variant` (primary / accent / negative) × `Style` (fill / outline). Rejected: 3×2 intersections, most of which would need new tokens, and `knockout` still would not fit. |
| D2 | `Size` axis with `sm` / `md` / `lg` | Industry baseline (Spectrum S/M/L/XL, Carbon sm/md/lg, Primer small/medium/large). Marketing CTAs need a hero size and a compact size. `md` is the only size designed today, so it ships first. | Keep md only. Rejected: every consumer asks for a hero CTA within a quarter; adding the axis later reorders the property panel, which breaks instance overrides. |
| D3 | State values `default` · `hover` · `active` · `focus` · `disabled` | The tokens say `active` (`button/background/solid/active`); token names are the source of truth. `focus` is the v2 name and maps to `:focus-visible` in code. | `pressed` / `focused` from the CLAUDE.md canonical list. Those contradict the token names; see Q5. |
| D4 | Icons are `Icon Start` / `Icon End`, not left/right or leading/trailing | Logical names survive RTL. Already the S2A dictionary convention (`iconStart` / `iconEnd`) and matches CSS logical properties. | Primer's `leadingVisual` / `trailingVisual`. Equivalent, but S2A already standardised on start/end. |
| D5 | `Show Icon Start` / `Show Icon End` booleans stay Figma-only | In code a slot is either filled or empty. The booleans exist so a designer can toggle without detaching. They are `lever: false` in the contract. | Drop the booleans and rely on hiding the layer. Rejected: hidden layers are not discoverable in the properties panel. |
| D6 | Uniform border width on every style (`border/width/md`, transparent where invisible) | A button that grows 1px on hover or differs 1px between styles shifts neighbours. One width, colour does the work. | v2 behaviour (1px solid / 2px outlined, 2px appears on solid hover). |
| D7 | Vertical sizing by `min-height`, not `padding-block` | v2 uses a raw `14px` because `(40 − 18) / 2 = 11` is not on the spacing scale. A height token plus centre alignment removes the raw value and keeps the label on the `label` type style. | Add `spacing/11`. Rejected: a one-off primitive for one component. |
| D8 | Icons use `currentColor` in code; in Figma the icon fill binds to the same token as the label | One token decision per style instead of two. | Separate icon content tokens. Rejected: no style needs an icon colour that differs from its label. |
| D9 | No `Width` (`fill` / `hug`) variant | Figma handles this with instance layout sizing; code gets a `fullWidth` boolean. A variant would double the set for a layout concern. | `Width` axis as in some S2A molecules. |

---

## 4. Figma component API

Property panel order is set once at creation and never reordered (reordering destroys instance override connections).

### 4.1 Variants (◆) — axis order `State` → `Size` → `Style`

| Property | Values (lowercase-kebab) | Default | Notes |
|---|---|---|---|
| `State` | `default` · `hover` · `active` · `focus` · `disabled` | `default` | Runtime states. Never a code prop except for forced previews (`data-state`). |
| `Size` | `sm` · `md` · `lg` | `md` | Build `md` first. `sm` and `lg` are reserved values with proposed tokens (section 6). |
| `Style` | `solid` · `outlined` · `transparent` · `accent` · `knockout` · `outline-inverse` | `solid` | One value = one token namespace under `s2a/color/button/`. |

Full set: 5 × 3 × 6 = **90 variants**. Phase 1 (md only): **30 variants**. First variant on the canvas is `State=default, Size=md, Style=solid`.

### 4.2 Booleans (○) — show/hide only

| Property | Default | Controls |
|---|---|---|
| `Show Icon Start` | `false` | visibility of `.icon-start` |
| `Show Icon End` | `false` | visibility of `.icon-end` |

### 4.3 Instance swaps (◇)

| Property | Default instance | Accepts |
|---|---|---|
| `Icon Start` | the existing S2 icon default (v2 uses `S2_Icon_Circle_20_N`) | S2 / S2a icon components only. Never a placeholder frame. |
| `Icon End` | same, chevron-right is the common choice (`S2a_Icon_Chevron_Right`) | same |

### 4.4 Text (@)

| Property | Default | Layer |
|---|---|---|
| `Label` | `Label` | `label` |

No nested props are exposed. No slots: the button does not use Figma's Slot feature.

---

## 5. Code API (`c-button`)

Prop names are camelCase. Enum values are the Figma values verbatim.

| Prop | Type | Default | Figma binding | Notes |
|---|---|---|---|---|
| `label` | string | required | TEXT `Label` | The accessible name. Empty is forbidden (use `IconButton`). |
| `style` | `solid` · `outlined` · `transparent` · `accent` · `knockout` · `outline-inverse` | `solid` | VARIANT `Style` | Emitted as `data-style`. |
| `size` | `sm` · `md` · `lg` | `md` | VARIANT `Size` | Emitted as `data-size`. |
| `iconStart` | string (icon name) or Node | — | INSTANCE_SWAP `Icon Start` | Decorative, `aria-hidden`. |
| `iconEnd` | string (icon name) or Node | — | INSTANCE_SWAP `Icon End` | Decorative, `aria-hidden`. |
| `href` | string | — | none | Present → renders `<a>`; absent → `<button type="button">`. |
| `type` | `button` · `submit` · `reset` | `button` | none | Only when rendering `<button>`. |
| `disabled` | boolean | `false` | VARIANT `State=disabled` | `<button disabled>`; on `<a>` use `aria-disabled="true"` and drop `href`. |
| `fullWidth` | boolean | `false` | none (instance layout sizing) | Stretches to the container. Layout, not a token. |
| `onClick` | function | — | none | Integration only. |
| `state` | `default` · `hover` · `active` · `focus` · `disabled` | `default` | VARIANT `State` | Forced state for docs, previews, and the visual eval matrix. Emitted as `data-state`. |
| `showIconStart` / `showIconEnd` | boolean | `false` | BOOLEAN | **Not code levers.** Kept only so the contract round-trips; the slot being filled is the switch. |

---

## 6. Tokens

### 6.1 Colour by style and state (existing tokens, all `s2a/color/…`)

Light / dark resolution is handled by the mode. `knockout` and `outline-inverse` resolve the same in both modes by design.

| Style | Background `default` / `hover` / `active` | Border (width `border/width/md`) | Label and icon |
|---|---|---|---|
| `solid` | `button/background/solid/default` · `/hover` · `/active` | hover only: `border/knockout` (v2 behaviour; see D6, kept as colour-only) | `button/content/solid/default` (see Q1) |
| `outlined` | `button/background/outlined/default` · `/hover` · `/active` | `border/knockout` | `content/default`; in `active` the fill inverts so the label uses `button/content/outlined/active` |
| `transparent` | `button/background/transparent/default` · `/hover` · `/active` | transparent | `content/default` |
| `accent` | `button/background/accent/default` · `/hover` · `/active` | transparent | `content/knockout` (always white) |
| `knockout` | `button/background/knockout/default` · `/hover` · `/active` | `button/border/knockout/default` (always white) | `button/content/knockout` (always near-black) |
| `outline-inverse` | `button/background/outline-inverse/default` · `/hover` · `/active` | `button/border/outline-inverse/default` (always white) | `button/content/outline-inverse` (always white) |

Shared: `focus` state keeps the `default` background and adds the focus ring (6.3). `disabled` keeps the `default` background and applies `s2a/opacity/disabled` (48%) to the whole control.

Primitive currently leaking in v2 that this spec removes: the accent `focus` background is bound to `color/blue/1100` directly. Bind `button/background/accent/default` instead (focus does not change the fill).

### 6.2 Size tokens (new — proposed, `S2A / Responsive / Container / Grid` collection, namespace `s2a/button/`)

These are the tokens that replace every raw number in v2 (`height: 40px`, `padding: 14px`, icon `12px`).

| Token | `sm` | `md` | `lg` | Aliases |
|---|---|---|---|---|
| `s2a/button/min-height/{size}` | 32 | 40 | 48 | new primitives, or `spacing/xl` · `2xl` · `3xl` if you prefer aliasing (same values) |
| `s2a/button/padding-inline/{size}` | 16 | 24 | 32 | `spacing/md` · `spacing/lg` · `spacing/xl` |
| `s2a/button/gap/{size}` | 4 | 8 | 8 | `spacing/2xs` · `spacing/xs` · `spacing/xs` |
| `s2a/button/icon-size/{size}` | 12 | **16** | 20 | v2 md is 12 (see Q2) |
| `s2a/button/border-radius` | round | round | round | `border/radius/round` (999) — one token, not per size |

Type: all sizes use the `label` type style (`font/family/label`, `font/weight/label`, `typography/font-size/label` 14, `typography/line-height/label` 18, `typography/letter-spacing/label`). Whether `lg` gets a larger label size is Q3.

Border width: `border/width/md` (2px) on every style, colour transparent where no border shows (D6).

### 6.3 Focus ring

| Property | Token |
|---|---|
| outline colour, theme-driven styles | `color/focus-ring/default` |
| outline colour, `knockout` and `outline-inverse` | `color/focus-ring/knockout` |
| outline width | `border/width/md` |
| outline offset | `spacing/3xs` (2px) |
| outline radius | follows the control (`border/radius/round`) |

**Defect:** `color/focus-ring/default` is `transparent/black/48` in **both** modes. Measured against the dark page background (`gray/900`, #131313) that is **1.07:1**. WCAG 1.4.11 needs 3:1 for the indicator against adjacent colours. The light value is fine (3.69:1 on white, 5.69:1 against the solid button). Fix: give the dark mode a white-based alpha (for example `transparent/white/48`, if it exists, or `gray/25`). This is a token change, not a component change, and it fixes every component that uses the ring.

### 6.4 Contrast audit (computed from the resolved token values)

Text needs 4.5:1 (1.4.3); borders, icons and focus rings need 3:1 (1.4.11). Disabled controls are exempt from 1.4.3.

| Pairing | Ratio | Result |
|---|---|---|
| `solid` light: white label on black | 21.0 | pass |
| `solid` light `hover`: white label on black@64 over white | 6.69 | pass |
| `solid` dark `hover`: black label on white@64 over #131313 | 9.04 | pass |
| `accent` default: white on #3B63FB | 4.81 | pass (close to the floor; do not lighten the blue) |
| `accent` hover / active: white on #274DEA / #1D3ECF | 6.30 / 7.95 | pass |
| `accent` fill against dark page (non-text) | 3.86 | pass |
| `outlined` light / dark: label and border vs page | 21.0 / 18.6 | pass |
| `knockout` default / hover / active: black on #FFF / #F8F8F8 / #E9E9E9 | 21.0 / 19.8 / 17.3 | pass |
| `knockout` and `outline-inverse` on media | unknown | depends on the image: require a scrim or test per placement |
| focus ring light vs page / vs solid button | 3.69 / 5.69 | pass |
| **focus ring dark vs page** | **1.07** | **fail** (6.3) |
| `solid` disabled light (48% opacity) | 2.03 | exempt, acceptable |

---

## 7. Anatomy and layers

```
Button                                   ← COMPONENT_SET
  └─ State=default, Size=md, Style=solid ← COMPONENT (auto-named)
       └─ .root                          ← auto-layout, horizontal, centre/centre, hug width,
            │                               height bound to min-height/{size}, padding-inline bound,
            │                               gap bound, radius bound, fill + stroke bound
            ├─ .icon-start               ← instance, hidden by default, size bound to icon-size/{size}
            ├─ label                     ← text, `Label` style, fill bound to the style's content token
            ├─ .icon-end                 ← instance, hidden by default
            └─ [focus ring]              ← present only in State=focus; stroke bound to focus-ring/*
```

Code mirrors it: `.c-button` › `.c-button__icon-start` · `.c-button__label` · `.c-button__icon-end`. The focus ring is a CSS `outline`, not an element.

Layout rules: label does not wrap (`white-space: nowrap`); `fullWidth` centres the content; icons never shrink; `min-width: 0` on the label so long strings truncate rather than overflow.

---

## 8. Dark mode and surfaces

- No `Context` axis. Drop an instance into a frame whose variable mode is dark and `solid` / `outlined` / `transparent` / `accent` flip through their tokens.
- `knockout` and `outline-inverse` are static white. Use them on media, video, and brand-colour surfaces. They are forbidden on `background/default` in light mode (white on white).
- Glass: v2 applies `blur/md` backdrop blur to the always-white styles. Keep that in code; Figma represents it with a background-blur effect on `.root` for `knockout` and `outline-inverse` only.

---

## 9. Accessibility contract

Role: native `button` (or `link` when `href`). No ARIA role attribute is ever added by hand.

| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | moves focus to and from the control |
| `Enter` | activates (`<button>` and `<a>`) |
| `Space` | activates (`<button>` only; browsers scroll on `<a>`) |

WCAG 2.2 AA criteria the component owns:

| SC | Plain language | How the spec meets it |
|---|---|---|
| 1.4.1 Use of Color | state is not conveyed by colour alone | disabled changes opacity **and** is exposed as `disabled` / `aria-disabled`; focus has a ring, not just a fill change |
| 1.4.3 Contrast (Minimum) | label 4.5:1 | section 6.4; `accent` sits at 4.81 so its blue is frozen |
| 1.4.11 Non-text Contrast | borders, icons, focus ring 3:1 | section 6.4; focus-ring dark value must change |
| 2.1.1 Keyboard | fully operable by keyboard | native element, no custom handlers |
| 2.4.7 Focus Visible | focus is visible | ring in 6.3, shipped in code via `:focus-visible` |
| 2.4.11 Focus Not Obscured (Minimum) | focused control is not hidden | 2px offset ring stays outside the control; nothing in the component overlays it |
| 2.5.8 Target Size (Minimum) | 24×24 minimum | `sm` is 32px tall; all sizes exceed it. Touch guidance: prefer `md` or `lg` (40 / 48) on mobile |
| 4.1.2 Name, Role, Value | name, role and state are exposed | label is the name; native role; `disabled` state native |

Notes carried from the v2 contract: never a `div` with a click handler; the label is the accessible name; on media keep the label at 4.5:1 and add a scrim if the image does not deliver it.

---

## 10. Forbidden combinations

| Combination | Why | Use instead |
|---|---|---|
| empty `label` | no accessible name | `IconButton` |
| `knockout` or `outline-inverse` on `background/default`, light mode | invisible | `solid` or `outlined` |
| `href` with `disabled` | a disabled link is not a thing | render `<a aria-disabled="true">` with no `href`, or use a `<button>` |
| `type="submit"` with `href` | contradictory elements | pick one |
| `Show Icon Start` true with the swap set to a non-icon component | breaks sizing and colour binding | an S2 / S2a icon |

---

## 11. Open questions (decide before build)

| # | Question | Recommendation |
|---|---|---|
| Q1 | The `solid` label token. The deprecation note on `button/content/solid/default` says "replaced by `content/inverse`", but `content/inverse` is a 64% alpha white in light mode. A primary CTA label at 64% is a visual and contrast regression (white@64 on black is ~8:1, so it passes, but it is not the design). | Keep `button/content/solid/default` and remove its deprecation flag, or add a non-alpha `content/on-solid`. Your call since you own the token names. |
| Q2 | md icon size: v2 is 12px next to a 14px label. Spectrum pairs 14px text with 18px icons; Primer 16px. | 16 for `md` (12 / 16 / 20 across sizes). Confirm against the redesign canvas. |
| Q3 | Does `lg` get a larger label (16/24) or stay at `label` (14/18)? There is only one `label` type style today. | Stay at `label` for phase 1. If the hero CTA needs 16px, add `label-lg` to the type scale as its own release. |
| Q4 | Focus-ring dark value (6.3). | `transparent/white/48` or equivalent. Blocks the build. |
| Q5 | CLAUDE.md lists canonical state values as `pressed` / `focused`; tokens and the v2 set use `active` / `focus`. | Follow the tokens (`active`, `focus`) and update the CLAUDE.md list, or rename the tokens in the v1 token release. Pick one; mixing is what breaks agents. |
| Q6 | `outlined` vs `outline-inverse` is an inconsistent pair (adjective vs noun). | Leave as-is to avoid churn now; rename to `outlined-inverse` in the v1 token release alongside the deprecated-token removal. |
| Q7 | Should `solid` keep the 2px knockout border on hover (v2)? It is the only style whose border appears on hover. | Keep, as colour only (D6 makes the width constant). Confirm it survived the redesign. |
| Q8 | Reserved future styles. | Reserve `negative` (destructive, needs a red namespace that does not exist yet) and `glass` (if the blur treatment becomes its own style rather than a property of knockout). Do not build them now. |

---

## 12. Extension recipe (how the spec scales)

**Adding a style `X`:**
1. Tokens: `s2a/color/button/background/X/{default,hover,active}`; `s2a/color/button/border/X/default` if it has a visible border; `s2a/color/button/content/X` only if `content/default` is wrong for it.
2. Contrast: add rows to 6.4 for default, hover, active, and the focus ring against its fill.
3. Figma: add the `Style` value `X` (18 new variants at 3 sizes, 5 states), bind the four properties above. Nothing else changes.
4. Code: one `[data-style="X"]` block in `button.css`.
5. Stamp the version (minor: additive).

**Adding a size:** five new size tokens, one `Size` value, one `[data-size]` block. Minor.

**Adding a state** (for example `pending`): a `State` value, a token for anything it changes, a runtime mechanism in code. Minor, but it multiplies by 18, so justify it.

Everything else (a theme, a surface, a breakpoint) is a variable mode, never an axis.

---

## 13. Build plan for the Figma set

1. Connect the bridge (open the s2a-toolkit plugin) and share the link to the in-progress set.
2. Read the WIP set: confirm which styles exist (you described a white-fill knockout and an outlined one), their bindings, and whether they already use the simplified `button/*` tokens.
3. Create the size tokens in 6.2 and fix the focus-ring dark value (Q4) first, so bindings are real at build time.
4. Scaffold `Button` inside a named Section: 30 variants (`md` only), properties in the 4.x order, layers per section 7, every fill, stroke, radius, padding, gap and height bound.
5. Visual check per style on light, dark, and a media frame; screenshot each frame, not the page.
6. Stamp `s2a:meta` version `3.0.0` with the changelog, then extract the contract so `button.defs.json` regenerates from the real set.
