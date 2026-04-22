# Homepage Redesign — Token Audit (2026-04-16)

Audit performed against 10 CSS files read from the local milo submodule on branch **`site-redesign-foundation`** (updated to commit `9a8bb9b4a` from `afeeccf72`). All files are from `context/milo/libs/c2/blocks/`. One file (`global-navigation.css`) was empty and skipped. All 10 remaining files were audited with `mcp__s2a-ds__audit_css`.

---

## Summary Table

| File | 🔴 Critical | 🟠 High | 🟡 Medium | Total | vs Apr 8 |
|---|---|---|---|---|---|
| `router-marquee.css` | 8 | 14 | 28 | **50** | — |
| `brand-concierge.css` | 11 | 12 | 27 | **50** | — |
| `modal.css` | 3 | 8 | 12 | **23** | ▼ 3 |
| `global-footer.css` | 1 | 4 | 10 | **15** | ▼ 3 |
| `carousel-c2.css` | 2 | 5 | 3 | **10** | ▼ 17 |
| `elastic-carousel.css` | 0 | 4 | 3 | **7** | — |
| `base-card.css` | 0 | 3 | 2 | **5** | ▼ 2 |
| `explore-card.css` | 0 | 2 | 4 | **6** | ▼ 1 |
| `rich-content.css` | 2 | 0 | 3 | **5** | — |
| `news.css` | 0 | 0 | 4 | **4** | — |
| `global-navigation.css` | — | — | — | **empty** | — |
| **TOTAL** | **27** | **52** | **96** | **175** | ▼ 9 |

> **Legend:** 🔴 Critical = hardcoded hex/rgba · 🟠 High = primitive `--s2a-*` color/spacing token used directly · 🟡 Medium = hardcoded px dimension or other primitive alias
>
> **vs Apr 8:** Comparison excludes `menu.css` and `styles.css` (audited Apr 8, not present in this run). Apr 8 comparable total: 184 → Apr 16: 175 = **−9 violations**. Carousel-c2 accounts for −17 of that gain (CSS refactored to custom properties).

---

## Per-file Findings

---

### router-marquee.css
**50 violations** — 8 critical · 14 high · 28 medium

#### Color
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 142 | `.rm-card` | `background` | `rgba(0, 0, 0, 0.44)` | `--s2a-color-transparent-black-48` (Δ4%) | 🔴 critical |
| 144 | `.rm-card` | `box-shadow` | `rgba(255, 255, 255, 0.11)` | `--s2a-color-transparent-white-12` (Δ1%) | 🔴 critical |
| 226 | `.offset-filler:hover` | `background` | `rgba(0, 0, 0, 0.6)` | `--s2a-color-transparent-black-64` (Δ4%) | 🔴 critical |
| 247 | `.rm-overlay` | `background` | `rgba(0, 0, 0, 0.60)` / `rgba(0,0,0,0)` | `--s2a-color-transparent-black-64` / transparent | 🔴 critical |
| 288 | `.rm-arrow-next` | `background` | `rgba(0, 0, 0, 0.30)` | `--s2a-color-transparent-black-32` (Δ2%) | 🔴 critical |
| 292 | `.rm-arrow-next` | `color` | `rgba(255, 255, 255, 0.75)` | `--s2a-color-transparent-white-64` (Δ11%) | 🔴 critical |
| 413 | `.rm-overlay` (desktop) | `background` | `rgba(0, 0, 0, 0.56)` | `--s2a-color-transparent-black-64` (Δ8%) | 🔴 critical |
| 136 | `.rm-card` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| 155 | `.rm-card.is-active` | `background` | `var(--s2a-color-gray-25)` | `--s2a-color-background-default` | 🟠 high |
| 156 | `.rm-card.is-active` | `color` | `var(--s2a-color-gray-1000)` | `--s2a-color-content-default` | 🟠 high |
| 196 | `.rm-card-progress-bar` | `background` | `var(--s2a-color-brand-adobe-red)` | `--s2a-color-background-brand` | 🟠 high |

#### Spacing
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 52 | `.rm-content-wrapper` | `max-width` | `1920px` | design constant — no token | 🟡 medium |
| 114 | `.rm-controls` | `gap` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| 188 | `.rm-card-progress` | `height` | `4px` | `--s2a-spacing-2xs` | 🟠 high |
| 163 | `.rm-card-icon` | `width` | `18px` | no exact token — Δ6 from `--s2a-spacing-lg` | 🟡 medium |
| 285–286 | `.rm-arrow-next` | `width/height` | `var(--s2a-spacing-48)` | `--s2a-spacing-3xl` | 🟡 medium |
| 305 | `.rm-cards` | `gap` | `var(--s2a-spacing-4)` | `--s2a-spacing-2xs` | 🟡 medium |
| 252 | `.rm-content` | `max-width` | `484px` | layout constant — no token | 🟡 medium |
| 453–454 | `.rm-card` | `min-width/max-width` | `131px / 220px` | layout constants — no token | 🟡 medium |
| Multiple | Various | `var(--s2a-spacing-24)` | 24px | `--s2a-spacing-lg` | 🟡 medium |

#### Typography
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 76 | `.rm-eyebrow` | `font-size` | `var(--s2a-font-size-16)` | `--s2a-font-size-md` | 🟡 medium |
| 77 | `.rm-eyebrow` | `line-height` | `20px` | `--s2a-font-line-height-sm` | 🟠 high |
| 78 | `.rm-eyebrow` | `letter-spacing` | `var(--s2a-font-letter-spacing-neg-0_2)` | `--s2a-font-letter-spacing-5xl` | 🟡 medium |
| 176 | `.rm-card-label` | `line-height` | `18px` | `--s2a-font-line-height-xs` | 🟠 high |
| 356–358 | `.rm-title` (mobile) | `font-size / line-height / letter-spacing` | `var(--s2a-font-size-40)` / `40px` / `var(--s2a-font-letter-spacing-neg-1_2)` | `--s2a-font-size-4xl` / `--s2a-font-line-height-xl` / `--s2a-font-letter-spacing-2xl` | 🟠/🟡 |
| 387–389 | `.rm-title` (tablet) | `font-size / line-height / letter-spacing` | `var(--s2a-font-size-56)` / `56px` / `var(--s2a-font-letter-spacing-neg-1_68)` | `--s2a-font-size-6xl` / `--s2a-font-line-height-3xl` / `--s2a-font-letter-spacing-lg` | 🟠/🟡 |
| 393–394 | `.rm-body` (tablet) | `font-size / line-height` | `var(--s2a-font-size-18)` / `24px` | `--s2a-font-size-lg` / `--s2a-font-line-height-md` | 🟠/🟡 |
| 430–432 | `.rm-title` (desktop) | `font-size / line-height / letter-spacing` | `var(--s2a-font-size-80)` / `76px` / `var(--s2a-font-letter-spacing-neg-3_2)` | `--s2a-font-size-9xl` / `--s2a-font-line-height-5xl` / `--s2a-font-letter-spacing-sm` | 🟠/🟡 |

#### Blur
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 140 | `.rm-card` | `backdrop-filter` | `blur(12px)` | `--s2a-blur-xs` (8px, Δ4) — true gap | 🟠 high |
| 157 | `.rm-card.is-active` | `backdrop-filter` | `blur(156px)` | no token — suggest `--rm-card-active-blur` custom prop | 🟠 high |
| 290 | `.rm-arrow-next` | `backdrop-filter` | `blur(24px)` | `--s2a-blur-24` (primitive exists) | 🟠 high |

#### Border Radius
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 137 | `.rm-card` | `border-radius` | `var(--s2a-border-radius-8)` | `--s2a-border-radius-sm` | 🟡 medium |
| 190 | `.rm-card-progress` | `border-radius` | `var(--s2a-border-radius-4)` | `--s2a-border-radius-xs` | 🟡 medium |

---

### brand-concierge.css
**50 violations** — 11 critical · 12 high · 27 medium

#### Color
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 15 | `.brand-concierge` | `--bc-header-color` | `#131313` | `--s2a-color-content-body-strong` | 🔴 critical |
| 21 | `.brand-concierge` | `--bc-card-text-color` | `#292929` | `--s2a-color-content-default` | 🔴 critical |
| 36 | `.brand-concierge` | `--bc-button-color` | `#292929` | `--s2a-color-content-default` | 🔴 critical |
| 37 | `.brand-concierge` | `--bc-button-hover-color` | `#131313` | `--s2a-color-content-body-strong` | 🔴 critical |
| 38 | `.brand-concierge` | `--bc-keyboard-focus-color` | `#5574F7` | `--s2a-color-focus-ring-default` (Δ31) | 🔴 critical |
| 89 | `.prompt-card-button` | `background` | `#fff` | `--s2a-color-background-default` | 🔴 critical |
| 189 | `.bc-input-tooltip` | `color` | `#fff` | `--s2a-color-content-knockout` | 🔴 critical |
| 229 | `.bc-legal` | `color` | `#4B4B4B` | no exact match — suggest `--s2a-color-content-body-subtle` | 🔴 critical |
| 257 | `.bc-modal-title` | `color` | `#000` | `--s2a-color-content-default` | 🔴 critical |
| 265 | `.bc-beta-label` | `color` | `#A358B1` | no token — brand purple missing | 🔴 critical |
| 266 | `.bc-beta-label` | `background` | `#EAEAED` | `--s2a-color-background-subtle` (nearest) | 🔴 critical |
| 55 | `main:has(&)` | `background` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-knockout` | 🟠 high |

#### Spacing & Border Radius
Key hardcoded values (all have semantic equivalents):

| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 41 | `.brand-concierge` | `padding` | `40px 24px 12px` | `--s2a-spacing-2xl` / `--s2a-spacing-lg` / `--s2a-spacing-sm` | 🟠/🟡 |
| 63 | `.bc-header` | `gap` | `4px` | `--s2a-spacing-2xs` | 🟠 high |
| 65 | `.bc-header` | `margin-bottom` | `32px` | `--s2a-spacing-xl` (nearest, Δ8) | 🟡 medium |
| 91 | `.prompt-card-button` | `border-radius` | `12px` | between `--s2a-border-radius-sm` (8) and `--s2a-border-radius-md` (16) | 🟡 medium |
| 108 | `.prompt-card-text` | `gap` | `8px` | `--s2a-spacing-xs` | 🟠 high |
| 111 | `.prompt-card-text` | `padding` | `12px 16px` | `--s2a-spacing-sm` / `--s2a-spacing-md` | 🟡 medium |
| 267 | `.bc-beta-label` | `border-radius` | `4px` | `--s2a-border-radius-xs` | 🟠 high |
| 279 | `#brand-concierge-modal` | `border-radius` | `24px 24px 0 0` | between `--s2a-border-radius-md` (16) and `--s2a-border-radius-lg` (32) | 🟡 medium |
| 298 | `.dialog-close:focus-visible` | `border-radius` | `8px` | `--s2a-border-radius-sm` | 🟠 high |
| 322 | `.bc-input-field` | `margin` | `80px` | ⚠ TRUE GAP — 80px not in semantic series | 🟡 medium |
| 326 | `.brand-concierge.hero` | `padding` | `80px 48px 24px` | `--s2a-spacing-3xl` / `--s2a-spacing-lg` | 🟠 high |

#### Typography
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 230 | `.bc-legal` | `font-size` | `11px` | `--s2a-font-size-xs` (12px, Δ1) | 🟡 medium |
| 253 | `.bc-modal-title` | `font-size` | `16px` | `--s2a-font-size-md` | 🟠 high |
| 254 | `.bc-modal-title` | `letter-spacing` | `-0.9px` | `--s2a-font-letter-spacing-3xl` (−0.96px, Δ0.06) | 🟡 medium |
| 255 | `.bc-modal-title` | `line-height` | `32px` | `--s2a-font-line-height-lg` | 🟠 high |
| 256 | `.bc-modal-title` | `font-weight` | `900` | `--s2a-font-weight-adobe-clean-black` | 🟠 high |
| 261 | `.bc-beta-label` | `font-size` | `10px` | `--s2a-font-size-xs` (12px, Δ2) | 🟡 medium |
| 262 | `.bc-beta-label` | `font-weight` | `700` | `--s2a-font-weight-adobe-clean-bold` | 🟠 high |
| 263 | `.bc-beta-label` | `line-height` | `14px` | `--s2a-font-line-height-2xs` (16px, Δ2) | 🟡 medium |
| 302 | `.hero .bc-header-title` | `font-size` | `36px` | ⚠ TRUE GAP — between `--s2a-font-size-3xl` (32) and `--s2a-font-size-4xl` (40) | 🟡 medium |
| 303 | `.hero .bc-header-title` | `line-height` | `45px` | `--s2a-font-line-height-2xl` (48px, Δ3) | 🟡 medium |
| 340 | `.hero .bc-header-title` (desktop) | `font-size` | `44px` | ⚠ TRUE GAP — between `--s2a-font-size-4xl` (40) and `--s2a-font-size-5xl` (48) | 🟡 medium |
| 341 | `.hero .bc-header-title` (desktop) | `line-height` | `55px` | `--s2a-font-line-height-3xl` (56px, Δ1) | 🟡 medium |

#### Blur
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 152 | `.bc-floating-button::before` | `backdrop-filter` | `blur(10px)` | `--s2a-blur-xs` (8px, Δ2) | 🟠 high |

---

### modal.css
**23 violations** — 3 critical · 8 high · 12 medium

#### Color
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 2 | `:root` | `--modal-focus-color` | `#109cde` | `--s2a-color-focus-ring-default` (#3b63fb, Δ77) — WCAG 2.4.11 risk | 🔴 critical |
| 7 | `:root` | `--modal-close-accent-color` | `#707070` | no exact match — suggest `--s2a-color-content-subtle` | 🔴 critical |
| 13 | `.dialog-modal` | `background` | `#fff` | `--s2a-color-background-default` | 🔴 critical |
| 102 | `&::after` (close button) | `background` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-knockout` | 🟠 high |

#### Typography
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 53 | `.locale-modal p` | `font-size` | `16px` | `--s2a-font-size-md` | 🟠 high |
| 54 | `.locale-modal p` | `font-weight` | `500` | `--s2a-font-weight-adobe-clean-medium` | 🟠 high |
| 55 | `.locale-modal p` | `line-height` | `20px` | `--s2a-font-line-height-sm` | 🟠 high |
| 73 | `.region-selector-text p:first-of-type` | `font-size` | `24px` | `--s2a-font-size-2xl` | 🟠 high |
| 78 | `.region-selector` | `font-size` | `14px` | `--s2a-font-size-sm` | 🟠 high |

#### Spacing (modal size constants — flagged but unlikely to be tokenized)
| Line | Selector | Property | Value | Note | Severity |
|---|---|---|---|---|---|
| 14 | `.dialog-modal` | `border-radius` | `6px` | `--s2a-border-radius-xs` (4px, Δ2) or `--s2a-border-radius-sm` (8px, Δ2) | 🟡 medium |
| 36 | `.dialog-close` | `height/width` | `26px` | `--s2a-spacing-lg` (24px, Δ2) | 🟡 medium |
| 45 | `.locale-modal` | `padding` | `48px 32px 30px` | `--s2a-spacing-3xl` / `--s2a-spacing-xl` / no 30px token | 🟠/🟡 |
| 63 | `.locale-modal a` | `padding` | `8px` | `--s2a-spacing-xs` | 🟠 high |
| 68 | `.region-selector-text` | `padding` | `32px 32px 20px` | `--s2a-spacing-xl` / no 20px token | 🟡 medium |
| 110–127 | Various `.dialog-modal` variants | `width/height` | `650px`, `1024px`, `850px`, `820px`, `1100px`, `1280px` | modal size constants — suggest named custom properties | 🟡 medium |

---

### global-footer.css
**15 violations** — 1 critical · 4 high · 10 medium

#### Color
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 68 | `.feds-social-icon` | `color` | `#808080` | no exact match — suggest `--s2a-color-content-subtle` | 🔴 critical |
| 4 | `.global-footer` | `background` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-inverse` | 🟠 high |
| 16 | `.feds-footer-wrapper` | `background-color` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-inverse` | 🟠 high |
| 12 | `.feds-footer-wrapper` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| 22 | `.feds-menu-headline` | `border-color` | `var(--s2a-color-transparent-white-12)` | acceptable primitive (no semantic equiv) | 🟠 high |

#### Spacing
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 29 | `.feds-footer-options` | `row-gap` | `12px` | `--s2a-spacing-xs` (Δ4) — gap at 12px | 🟡 medium |
| 30 | `.feds-footer-options` | `column-gap` | `40px` | `--s2a-spacing-3xl` (48px, Δ8) | 🟡 medium |
| 35 | `.feds-footer-miscLinks` | `column-gap` | `30px` | `--s2a-spacing-xl` (32px, Δ2) — nearest | 🟡 medium |
| 40 | `.feds-regionPicker` | `column-gap` | `6px` | `--s2a-spacing-2xs` (4px, Δ2) | 🟡 medium |
| 45 | `.feds-regionPicker-globe` | `width/height` | `20px` | `--s2a-spacing-20` (primitive) | 🟡 medium |
| 52 | `.feds-regionPicker-wrapper > .fragment` | `bottom` | `10px` | `--s2a-spacing-xs` (8px, Δ2) | 🟡 medium |
| 56–57 | `.feds-regionPicker-wrapper > .fragment` | `min-width / max-height` | `130px / 300px` | layout constants — no token | 🟡 medium |
| 75 | `.feds-footer-options` | `row-gap` | `26px` | `--s2a-spacing-lg` (24px, Δ2) | 🟡 medium |
| 80 | `.feds-footer-privacyLink` | `column-gap` | `5px` | `--s2a-spacing-2xs` (4px, Δ1) | 🟡 medium |

---

### carousel-c2.css
**10 violations** — 2 critical · 5 high · 3 medium _(−17 from Apr 8 — CSS refactored to use custom properties)_

#### Color
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 23 | `.section-background::after` | `background` | `#000000` (gradient stop) | `--s2a-color-background-knockout` | 🔴 critical |
| 23 | `.section-background::after` | `background` | `rgba(0, 0, 0, 0.09)` (gradient stop) | `--s2a-color-transparent-black-08` (Δ1%) | 🔴 critical |
| 73 | `.arrow-default` | `color` | `var(--s2a-color-gray-1000)` | `--s2a-color-content-default` | 🟠 high |
| 77 | `.arrow-hover` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| 81 | `button:hover` | `background` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-inverse` | 🟠 high |
| 100 | `.slide-indicator.active` | `background` | `var(--s2a-color-gray-25)` | `--s2a-color-background-default` | 🟠 high |

#### Border Radius
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 22 | `.section-background::after` | `border-radius` | `var(--s2a-border-radius-16)` | `--s2a-border-radius-md` | 🟡 medium |

#### Spacing
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 30 | `:is([class*="title-"])` | `margin-bottom` | `8px` | `--s2a-spacing-xs` | 🟠 high |
| 56 | `.content` | `min-width` | `360px` | layout constant — no token | 🟡 medium |
| 123 | `.content` | `min-width` | `512px` | layout constant — no token | 🟡 medium |

---

### elastic-carousel.css
**7 violations** — 0 critical · 4 high · 3 medium

#### Color
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 80 | `p` (item header) | `color` | `var(--s2a-color-gray-1000)` | `--s2a-color-content-default` | 🟠 high |
| 174 | `.elastic-carousel-item-header p` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| 185 | `.elastic-carousel-item-footer:after` | `background-color` | `var(--s2a-color-gray-25)` | `--s2a-color-background-default` | 🟠 high |

#### Typography
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 83 | `p` (item header) | `line-height` | `var(--s2a-font-line-height-18)` | `--s2a-font-line-height-xs` | 🟡 medium |

#### Spacing
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 73 | `img` (header icon) | `width` | `24px` | `--s2a-spacing-lg` | 🟠 high |
| 99 | `video` | `height` | `394px` | design constant — no token | 🟡 medium |

#### Border Radius
| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 246 | `video` (mobile) | `border-radius` | `var(--s2a-border-radius-0)` | `--s2a-border-radius-none` | 🟡 medium |

---

### base-card.css
**5 violations** — 0 critical · 3 high · 2 medium

| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 37 | `.icon img` | `width` | `24px` | `--s2a-spacing-lg` | 🟠 high |
| 63 | `h1–h6` | `color` | `var(--s2a-color-gray-1000)` | `--s2a-color-content-title` | 🟠 high |
| 84 | `p` | `color` | `var(--s2a-color-transparent-black-64)` | acceptable primitive — no semantic equiv | 🟠 high |
| 62 | `h1–h6` | `margin-bottom` | `var(--s2a-spacing-8)` | `--s2a-spacing-xs` | 🟡 medium |
| 89 | `.foreground` | `padding` | `var(--s2a-spacing-24)` (multiple) | `--s2a-spacing-lg` | 🟡 medium |

---

### explore-card.css
**6 violations** — 0 critical · 2 high · 4 medium

| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 24 | `&:hover` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| 79 | `.dark .explore-card-background` | `background-color` | `var(--s2a-color-transparent-white-08)` | acceptable primitive — no semantic equiv | 🟠 high |
| 30 | `:focus-visible` | `border-radius` | `var(--s2a-border-radius-16)` | `--s2a-border-radius-md` | 🟡 medium |
| 61 | `img` | `width` | `32px` | `--s2a-spacing-xl` (nearest, Δ8) | 🟡 medium |
| 85 | `.explore-card-content` | `min-height` | `300px` | layout constant — no token | 🟡 medium |
| 91 | `.explore-card-content` | `min-height` | `360px` | layout constant — no token | 🟡 medium |

---

### rich-content.css
**5 violations** — 2 critical · 0 high · 3 medium

| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 39 | `picture::after` | `background` | `#000` (gradient stop) | `--s2a-color-background-knockout` | 🔴 critical |
| 39 | `picture::after` | `background` | `rgba(0, 0, 0, 0.00)` (gradient stop) | transparent / `--s2a-color-transparent-black-00` | 🔴 critical |
| 8 | `.rich-content.hero` | `height` | `640px` | layout constant — no token | 🟡 medium |
| 21 | `.action-area` | `margin-top` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| 50 | `.section:has(.rich-content.hero)` | `height` | `1040px` | layout constant — no token | 🟡 medium |

---

### news.css
**4 violations** — 0 critical · 0 high · 4 medium
All violations are primitive spacing tokens that should be aliased to semantic equivalents.

| Line | Selector | Property | Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 22 | `.icon` | `width` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| 23 | `.icon` | `height` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| 71 | `.news-headline` | `padding` | `var(--s2a-spacing-0)` | `--spacing-none` | 🟡 medium |
| 72 | `.news-headline` | `margin-bottom` | `var(--s2a-spacing-0)` | `--spacing-none` | 🟡 medium |

---

## Token Gaps

Values with no usable existing semantic token. The transparent token series (`00, 04, 08, 12, 16, 24, 32, 48, 64`) covers most rgba values within an acceptable Δ — only items below are true gaps.

| Value | Occurrences | Files | Gap / Suggested Action |
|---|---|---|---|
| `blur(12px)` | 2 | `router-marquee.css` | `--s2a-blur-xs` = 8px (Δ4), `--s2a-blur-sm` = 16px (Δ4). True gap — add `--s2a-blur-sm: 12px` or accept nearest. |
| `blur(156px)` | 1 | `router-marquee.css` | No blur token near 156px. Component-specific — suggest `--rm-card-active-blur` custom property. |
| `36px` font-size | 2 | `brand-concierge.css` | Gap between `--s2a-font-size-3xl` (32px) and `--s2a-font-size-4xl` (40px). Add `--s2a-font-size-36` or redesign to 32/40. |
| `44px` font-size | 1 | `brand-concierge.css` | Gap between `--s2a-font-size-4xl` (40) and `--s2a-font-size-5xl` (48). Add `--s2a-font-size-44` or align to 40. |
| `45px / 55px` line-height | 2 | `brand-concierge.css` | Paired with non-standard font sizes above — resolve by fixing font-sizes. |
| `#4B4B4B` | 1 | `brand-concierge.css` | Mid-gray (~50% lightness) not in semantic token set. Nearest: `--s2a-color-content-body-strong` (Δ97). Suggest new semantic token. |
| `#A358B1` | 1 | `brand-concierge.css` | Brand purple (beta label). Not in S2A token set. Needs `--s2a-color-content-brand-purple` or product-scoped token. |
| `80px` spacing | 2 | `brand-concierge.css`, `carousel-c2.css` | Gap in semantic spacing scale after `--s2a-spacing-4xl` (64px). Add `--s2a-spacing-5xl: 80px`. |
| `#808080` | 1 | `global-footer.css` | Mid-gray social icon — not in semantic set. Closest: `--s2a-color-content-subtle` (pending value confirmation). |

**Not gaps** (use existing tokens — commonly mis-flagged):

| Value | Correct token | Δ |
|---|---|---|
| `rgba(0, 0, 0, 0.44)` | `--s2a-color-transparent-black-48` | 4% |
| `rgba(0, 0, 0, 0.30)` | `--s2a-color-transparent-black-32` | 2% |
| `rgba(0, 0, 0, 0.56)` | `--s2a-color-transparent-black-64` | 8% |
| `rgba(0, 0, 0, 0.60)` | `--s2a-color-transparent-black-64` | 4% |
| `rgba(0, 0, 0, 0.09)` | `--s2a-color-transparent-black-08` | 1% |
| `rgba(255, 255, 255, 0.11)` | `--s2a-color-transparent-white-12` | 1% |
| `rgba(255, 255, 255, 0.75)` | `--s2a-color-transparent-white-64` | 11% — acceptable, use existing |

---

## Delta vs April 8 Audit

| File | Apr 8 | Apr 16 | Δ | Notes |
|---|---|---|---|---|
| `router-marquee.css` | 50 | 50 | — | No changes |
| `brand-concierge.css` | 50 | 50 | — | Same total; slight breakdown shift |
| `modal.css` | 26 | 23 | **−3** | 3 medium violations resolved |
| `global-footer.css` | 18 | 15 | **−3** | 3 medium violations resolved |
| `carousel-c2.css` | 27 | 10 | **−17** | CSS refactored — direct primitives replaced with `--carousel-*` custom properties |
| `elastic-carousel.css` | 7 | 7 | — | No changes |
| `base-card.css` | 7 | 5 | **−2** | 2 primitive spacing violations resolved |
| `explore-card.css` | 7 | 6 | **−1** | 1 primitive color violation resolved |
| `rich-content.css` | 5 | 5 | — | No changes |
| `news.css` | 4 | 4 | — | No changes |
| **Comparable total** | **184** | **175** | **−9** | |

> **Not included in Apr 16 run:** `menu.css` (4 violations Apr 8) · `styles.css` (0 violations Apr 8)

---

## Priority Recommendations

1. **`router-marquee.css` and `brand-concierge.css` remain the highest-risk files (50 violations each).** Neither improved since April 8. Both make heavy use of raw `rgba()` overlays and hardcoded color custom properties that won't adapt to themes. Color violations should be addressed first in both.

2. **Map `rgba()` overlays to the existing transparent token series.** `--s2a-color-transparent-black-*` and `--s2a-color-transparent-white-*` already cover most rgba values in this codebase within Δ4–8%. The only true gap is `rgba(250,250,250/85%)` (frosted glass in brand-concierge) and `blur(12px)` (marquee card). All other transparent values have matching tokens — no new tokens needed for the marquee overlay system.

3. **Alias all `--s2a-{property}-{number}` primitives to semantic t-shirt tokens.** Across all files, ~52 high-severity violations are primitive tokens used directly. The fix is mechanical: `var(--s2a-spacing-24)` → `var(--s2a-spacing-lg)`, `var(--s2a-color-gray-1000)` → `var(--s2a-color-content-default)`, etc. Eng tickets for each file where this is the primary violation type (elastic-carousel, base-card, news) are small scope — 1–2 pts each.

4. **Fix `--modal-focus-color` (#109cde) — WCAG risk.** This does not match `--s2a-color-focus-ring-default` (#3b63fb). The focus ring color mismatch is a WCAG 2.2 SC 2.4.11 concern — the system token should be used to ensure consistency and pass automated accessibility checks.

5. **Add `--s2a-font-size-36` and `--s2a-spacing-5xl: 80px` to the token scale.** Both gaps appear in brand-concierge. Resolving the font-size gaps also resolves the associated line-height violations.

6. **Carousel-c2 improvement validates the pattern.** The −17 reduction came from moving fixed primitive values into `--carousel-*` scoped custom properties and reducing duplicated rules. The same pattern (component-scoped custom properties that alias to semantics at the root) should be applied to router-marquee's overlay stack (`rgba` values → component custom props → semantic tokens).
