# Homepage Redesign — Token Audit (2026-04-08)

Audit performed against 15 CSS files fetched from the Adobe homepage redesign on the **`site-redesign-foundation`** milo branch (loaded via `?milolibs=site-redesign-foundation`). One file (`global-navigation.css`) had no content and was skipped. All remaining files were processed with `mcp__s2a-ds__audit_css`.

> **Branch note:** A prior run against `main--milo--adobecom.aem.live` produced structurally identical findings but against the wrong source. All references below are from `site-redesign-foundation--milo--adobecom.aem.live`.

---

## Summary Table

| File | 🔴 Hardcoded | 🟠 Primitive | 🟡 Other | Total |
|---|---|---|---|---|
| `router-marquee.css` | 8 | 20 | 22 | **50** |
| `brand-concierge.css` | 11 | 18 | 21 | **50** |
| `modal.css` | 3 | 8 | 15 | **26** |
| `global-footer.css` | 1 | 10 | 7 | **18** |
| `carousel-c2.css` | 3 | 8 | 16 | **27** |
| `elastic-carousel.css` | 0 | 5 | 2 | **7** |
| `base-card.css` | 0 | 5 | 2 | **7** |
| `explore-card.css` | 0 | 4 | 3 | **7** |
| `rich-content.css` | 2 | 1 | 2 | **5** |
| `news.css` | 0 | 4 | 0 | **4** |
| `menu.css` | 1 | 0 | 3 | **4** |
| `styles.css` | 0 | 0 | 0 | **0** |
| `global-navigation.css` | — | — | — | **empty** |
| **TOTAL** | **28** | **81** | **79** | **188** |

> **Legend:** 🔴 Hardcoded = raw hex/rgba values · 🟠 Primitive = `--s2a-*-{number}` tokens that should be aliased through semantic tokens · 🟡 Other = additional medium-severity violations (hardcoded px dimensions with no close token match, etc.)

---

## Per-file Findings

---

### router-marquee.css
**50 violations** — 8 critical · 14 high · 28 medium

#### Color
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~141 | `.rm-card` | `background` | `rgba(0, 0, 0, 0.44)` | `--s2a-color-transparent-black-48` (existing, Δ4%) | 🔴 critical |
| ~143 | `.rm-card` | `box-shadow` | `rgba(255, 255, 255, 0.11)` | `--s2a-color-transparent-white-12` (existing, Δ1%) | 🔴 critical |
| ~220 | `.offset-filler:hover` | `background` | `rgba(0, 0, 0, 0.6)` | `--s2a-color-transparent-black-64` (existing, Δ4%) | 🔴 critical |
| ~241 | `.rm-overlay` | `background` | `rgba(0, 0, 0, 0.60)` / `rgba(0,0,0,0)` | `--s2a-color-transparent-black-64` / `transparent` | 🔴 critical |
| ~282 | `.rm-arrow-next` | `background` | `rgba(0, 0, 0, 0.30)` | `--s2a-color-transparent-black-32` (existing, Δ2%) | 🔴 critical |
| ~286 | `.rm-arrow-next` | `color` | `rgba(255, 255, 255, 0.75)` | `--s2a-color-transparent-white-64` (existing, Δ11% — largest gap) | 🔴 critical |
| ~405 | `.rm-overlay` (desktop) | `background` | `rgba(0, 0, 0, 0.56)` | `--s2a-color-transparent-black-64` (existing, Δ8%) | 🔴 critical |
| ~135 | `.rm-card` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| ~154 | `.rm-card.is-active` | `background` | `var(--s2a-color-gray-25)` | `--s2a-color-background-default` | 🟠 high |
| ~155 | `.rm-card.is-active` | `color` | `var(--s2a-color-gray-1000)` | `--s2a-color-content-default` | 🟠 high |
| ~190 | `.rm-card-progress-bar` | `background` | `var(--s2a-color-brand-adobe-red)` | `--s2a-color-background-brand` | 🟠 high |

#### Spacing
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~51 | `.rm-content-wrapper` | `max-width` | `1920px` | no token (design constant) | 🟡 medium |
| ~113 | `.rm-controls` | `gap` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟠 medium |
| ~182 | `.rm-card-progress` | `height` | `4px` | `--s2a-spacing-2xs` | 🟠 high |
| ~279–280 | `.rm-arrow-next` | `width/height` | `var(--s2a-spacing-48)` | `--s2a-spacing-3xl` | 🟠 medium |
| ~299 | `.rm-cards` | `gap` | `var(--s2a-spacing-4)` | `--s2a-spacing-2xs` | 🟠 medium |
| Multiple | Various | `var(--s2a-spacing-24)` | `24px` | `--s2a-spacing-lg` | 🟠 medium |

#### Typography
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~75 | `.rm-eyebrow` | `font-size` | `var(--s2a-font-size-16)` | `--s2a-font-size-md` | 🟠 medium |
| ~76 | `.rm-eyebrow` | `line-height` | `20px` | `--s2a-font-line-height-sm` | 🟠 high |
| ~77 | `.rm-eyebrow` | `letter-spacing` | `var(--s2a-font-letter-spacing-neg-0_2)` | `--s2a-font-letter-spacing-5xl` | 🟠 medium |
| ~175 | `.rm-card-label` | `line-height` | `18px` | `--s2a-font-line-height-xs` | 🟠 high |
| ~350 | `.rm-title` (mobile) | `line-height` | `40px` | `--s2a-font-line-height-xl` | 🟠 high |
| ~380 | `.rm-title` (tablet) | `line-height` | `56px` | `--s2a-font-line-height-3xl` | 🟠 high |
| ~386 | `.rm-body` (tablet) | `line-height` | `24px` | `--s2a-font-line-height-md` | 🟠 high |
| ~423 | `.rm-title` (desktop) | `line-height` | `76px` | `--s2a-font-line-height-5xl` | 🟠 high |
| ~349 | `.rm-title` (mobile) | `font-size` | `var(--s2a-font-size-40)` | `--s2a-font-size-4xl` | 🟠 medium |
| ~379 | `.rm-title` (tablet) | `font-size` | `var(--s2a-font-size-56)` | `--s2a-font-size-6xl` | 🟠 medium |
| ~422 | `.rm-title` (desktop) | `font-size` | `var(--s2a-font-size-80)` | `--s2a-font-size-9xl` | 🟠 medium |

#### Blur
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~139 | `.rm-card` | `backdrop-filter` | `blur(12px)` | `--s2a-blur-sm` (closest; gap 4px) | 🟠 high |
| ~156 | `.rm-card.is-active` | `backdrop-filter` | `blur(156px)` | no token — suggest `--s2a-blur-xl: 156px` | 🟠 high |
| ~284 | `.rm-arrow-next` | `backdrop-filter` | `blur(24px)` | `--s2a-blur-24` (primitive exists) | 🟠 high |

#### Border Radius
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~136 | `.rm-card` | `border-radius` | `var(--s2a-border-radius-8)` | `--s2a-border-radius-sm` | 🟠 medium |
| ~184 | `.rm-card-progress` | `border-radius` | `var(--s2a-border-radius-4)` | `--s2a-border-radius-xs` | 🟠 medium |

---

### brand-concierge.css
**50 violations** — 11 critical · 11 high · 28 medium

#### Color
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~14 | `.brand-concierge` | `--bc-header-color` | `#131313` | `--s2a-color-content-body-strong` | 🔴 critical |
| ~20 | `.brand-concierge` | `--bc-card-text-color` | `#292929` | `--s2a-color-content-default` | 🔴 critical |
| ~35 | `.brand-concierge` | `--bc-button-color` | `#292929` | `--s2a-color-content-default` | 🔴 critical |
| ~36 | `.brand-concierge` | `--bc-button-hover-color` | `#131313` | `--s2a-color-content-body-strong` | 🔴 critical |
| ~37 | `.brand-concierge` | `--bc-keyboard-focus-color` | `#5574F7` | `--s2a-color-focus-ring-default` | 🔴 critical |
| ~73 | `.prompt-card-button` | `background` | `#fff` | `--s2a-color-background-default` | 🔴 critical |
| ~144 | `.bc-input-tooltip` | `color` | `#fff` | `--s2a-color-content-knockout` | 🔴 critical |
| ~201 | `.bc-legal` | `color` | `#4B4B4B` | `--s2a-color-content-body-subtle` (suggest new) | 🔴 critical |
| ~229 | `.bc-modal-title` | `color` | `#000` | `--s2a-color-content-default` | 🔴 critical |
| ~237 | `.bc-beta-label` | `color` | `#A358B1` | no token — brand purple missing | 🔴 critical |
| ~238 | `.bc-beta-label` | `background` | `#EAEAED` | `--s2a-color-background-subtle` (nearest) | 🔴 critical |

#### Spacing
Multiple hardcoded values throughout: `40px`, `24px`, `12px`, `4px`, `32px`, `12px`, `16px`, `8px`, `10px`, `14px`, `56px`, `80px` — all have semantic equivalents. Key ones:
- `40px` padding → `--s2a-spacing-2xl`
- `24px` padding → `--s2a-spacing-lg`
- `4px` gap → `--s2a-spacing-2xs`
- `32px` margin-bottom → `--s2a-spacing-xl` (nearest)
- `80px` margin → `--s2a-spacing-3xl` (primitive `--s2a-spacing-80` exists)

#### Typography
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~225 | `.bc-modal-title` | `font-size` | `16px` | `--s2a-font-size-md` | 🟠 high |
| ~227 | `.bc-modal-title` | `line-height` | `32px` | `--s2a-font-line-height-lg` | 🟠 high |
| ~228 | `.bc-modal-title` | `font-weight` | `900` | `--s2a-font-weight-adobe-clean-black` | 🟠 high |
| ~234 | `.bc-beta-label` | `font-weight` | `700` | `--s2a-font-weight-adobe-clean-bold` | 🟠 high |
| ~202 | `.bc-legal` | `font-size` | `11px` | `--s2a-font-size-xs` (nearest: 12px) | 🟡 medium |
| ~277 | `.hero .bc-header-title` | `font-size` | `36px` | no exact match — suggest `--s2a-font-size-36` | 🟡 medium |
| ~318 | `.hero .bc-header-title` | `font-size` | `44px` | no exact match — suggest `--s2a-font-size-4xl` (40) or new | 🟡 medium |

#### Blur
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~125 | `.bc-floating-button::before` | `backdrop-filter` | `blur(10px)` | `--s2a-blur-xs` (8px, Δ2px) | 🟠 high |

#### Border Radius
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~75 | `.prompt-card-button` | `border-radius` | `12px` | no exact — between `--s2a-border-radius-sm` (8) and `--s2a-border-radius-md` (16) | 🟡 medium |
| ~145 | `.bc-input-tooltip` | `border-radius` | `7px` | `--s2a-border-radius-sm` (8px, Δ1px) | 🟡 medium |
| ~239 | `.bc-beta-label` | `border-radius` | `4px` | `--s2a-border-radius-xs` | 🟠 high |
| ~248 | `#brand-concierge-modal` | `border-radius` | `24px` | no exact — between md (16) and lg (32) | 🟡 medium |
| ~263 | `.dialog-close:focus-visible` | `border-radius` | `8px` | `--s2a-border-radius-sm` | 🟠 high |

---

### modal.css
**26 violations** — 3 critical · 8 high · 15 medium

#### Color
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~1 | `:root` | `--modal-focus-color` | `#109cde` | `--s2a-color-focus-ring-default` (off-shade — see token gap) | 🔴 critical |
| ~6 | `:root` | `--modal-close-accent-color` | `#707070` | `--s2a-color-content-subtle` (suggest new) | 🔴 critical |
| ~12 | `.dialog-modal` | `background` | `#fff` | `--s2a-color-background-default` | 🔴 critical |
| ~118 | `&::after` (close button) | `background` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-knockout` | 🟠 high |

#### Spacing (hardcoded modal dimensions — intentional layout constants, flag for review)
| Line | Selector | Property | Current Value | Note | Severity |
|---|---|---|---|---|---|
| ~13 | `.dialog-modal` | `border-radius` | `6px` | `--s2a-border-radius-xs` (4px, Δ2) or `--s2a-border-radius-sm` (8px, Δ2) | 🟡 medium |
| ~47 | `.dialog-close` | `height/width` | `26px` | `--s2a-spacing-lg` (24px, Δ2) | 🟡 medium |
| ~56 | `.locale-modal` | `padding` | `48px 32px 30px` | `--s2a-spacing-3xl` / `--s2a-spacing-xl` / no 30px token | 🟠 high |
| ~74 | `.locale-modal a` | `padding` | `8px` | `--s2a-spacing-xs` | 🟠 high |
| ~84 | `.region-selector-text` | `padding` | `32px 32px 20px` | `--s2a-spacing-xl` / no 20px token | 🟡 medium |
| ~127–162 | Multiple `.dialog-modal` variants | `width/height` | `650px`, `850px`, `820px`, `1024px`, `1100px`, `1200px`, `1280px`, `1000px` | No spacing tokens — these are modal size breakpoints. Suggest custom properties with named modal-size tokens. | 🟡 medium |

#### Typography
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~64 | `.locale-modal p` | `font-size` | `16px` | `--s2a-font-size-md` | 🟠 high |
| ~65 | `.locale-modal p` | `font-weight` | `500` | `--s2a-font-weight-adobe-clean-medium` | 🟠 high |
| ~66 | `.locale-modal p` | `line-height` | `20px` | `--s2a-font-line-height-sm` | 🟠 high |
| ~89 | `.region-selector-text p:first-of-type` | `font-size` | `24px` | `--s2a-font-size-2xl` | 🟠 high |
| ~94 | `.region-selector` | `font-size` | `14px` | `--s2a-font-size-sm` | 🟠 high |

---

### global-footer.css
**18 violations** — 1 critical · 4 high · 13 medium

#### Color
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~100 | `.feds-social-icon` | `color` | `#808080` | no exact match — suggest `--s2a-color-content-subtle` | 🔴 critical |
| ~3 | `.global-footer` | `background` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-inverse` | 🟠 high |
| ~9 | `.feds-footer-wrapper` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| ~13 | `.feds-footer-wrapper` | `background-color` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-inverse` | 🟠 high |
| ~19 | `.feds-menu-headline` | `border-color` | `var(--s2a-color-transparent-white-12)` | acceptable primitive (no semantic equivalent) | 🟠 high |

#### Spacing (hardcoded layout values)
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~38 | `.feds-footer-options` | `row-gap` | `12px` | no token (gap between 8px and 16px — suggest `--s2a-spacing-sm: 12px`) | 🟡 medium |
| ~39 | `.feds-footer-options` | `column-gap` | `40px` | `--s2a-spacing-2xl` | 🟡 medium |
| ~44 | `.feds-footer-miscLinks` | `column-gap` | `30px` | no token (gap between lg 24 and xl 32 — suggest `--s2a-spacing-xl: 32px` or new) | 🟡 medium |
| ~49 | `.feds-regionPicker` | `column-gap` | `6px` | `--s2a-spacing-2xs` (4px, Δ2) | 🟡 medium |
| ~56 | `.feds-regionPicker-globe` | `width/height` | `20px` | `--s2a-spacing-md` (16) or primitive `--s2a-spacing-20` | 🟡 medium |
| ~128 | `.feds-footer-privacyLink-divider` | `margin` | `5px` | `--s2a-spacing-2xs` (4px, Δ1) | 🟡 medium |

---

### carousel-c2.css
> **Source:** `context/milo/libs/c2/blocks/carousel-c2/carousel-c2.css` — line numbers are exact.
> **Note:** Previous audit had 10 violations sourced from deployed AEM CSS with approximate line numbers. Re-audited from source; audit tool also does not detect `var(--s2a-spacing-N)` primitive token references — those were added manually.

**27 violations** — 3 critical · 8 high · 16 medium

#### Color
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 64 | `.section-background::after` | `background` | `#000000` | `--s2a-color-background-knockout` | 🔴 critical |
| 64 | `.section-background::after` | `background` | `rgba(0,0,0,0.09)` | `--s2a-color-transparent-black-08` (existing, Δ1%) | 🟠 high |
| 172 | `button` | `background` | `var(--s2a-color-gray-25)` | `--s2a-color-background-default` | 🟠 high |
| 193 | `.arrow-default` | `color` | `var(--s2a-color-gray-1000)` | `--s2a-color-content-default` | 🟠 high |
| 197 | `.arrow-hover` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| 233 | `button:hover` | `background` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-inverse` | 🟠 high |
| 257 | `.slide-indicator.active` | `background` | `var(--s2a-color-gray-25)` | `--s2a-color-background-default` | 🟠 high |
| 335 | `:dir(rtl) .section-background::after` | `background` | `#000000` | `--s2a-color-background-knockout` (RTL mirror of L64) | 🔴 critical |
| 335 | `:dir(rtl) .section-background::after` | `background` | `rgba(0,0,0,0.09)` | `--s2a-color-transparent-black-08` (RTL mirror of L64) | 🟠 high |

#### Border Radius
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 46 | `.carousel-slide` | `border-radius` | `var(--s2a-border-radius-16)` | `--s2a-border-radius-md` | 🟡 medium |
| 63 | `.section-background::after` | `border-radius` | `var(--s2a-border-radius-16)` | `--s2a-border-radius-md` | 🟡 medium |
| 105 | `.section-background img` | `border-radius` | `var(--s2a-border-radius-16)` | `--s2a-border-radius-md` | 🟡 medium |
| 111 | `.section-background img` | `border-radius` | `var(--s2a-border-radius-16)` | `--s2a-border-radius-md` (second rule) | 🟡 medium |

#### Spacing — primitive `var(--s2a-spacing-N)` tokens + hardcoded px
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 7 | `.carousel-c2` | `--carousel-slides-gap` | `8px` | `--s2a-spacing-xs` | 🟡 medium |
| 71 | `.foreground` | `padding` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| 81 | `:is(h1, h2, h3, h4, h5, h6)` | `margin-bottom` | `8px` | `--s2a-spacing-xs` | 🔴 critical |
| 154 | `.foreground` | `padding-inline` | `var(--s2a-spacing-64)` | `--s2a-spacing-4xl` | 🟡 medium |
| 156 | `.content` | `max-width` (calc arg) | `var(--s2a-spacing-64)` | `--s2a-spacing-4xl` | 🟡 medium |
| 157 | `.content` | `min-width` | `360px` | layout constant — no token | 🟡 medium |
| 165 | `button` | `--btn-dimension` | `var(--s2a-spacing-40)` | `--s2a-spacing-2xl` | 🟡 medium |
| 247 | `.indicators-container` | `bottom` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| 251 | `.slide-indicator` | `width` | `var(--s2a-spacing-8)` | `--s2a-spacing-xs` | 🟡 medium |
| 252 | `.slide-indicator` | `height` | `var(--s2a-spacing-8)` | `--s2a-spacing-xs` | 🟡 medium |
| 267 | `button:is(.prev, .next)` | `--btn-inset` | `20px` | no exact match — nearest `--s2a-spacing-md` (Δ4px) | 🟡 medium |
| 283 | `.foreground` | `padding-inline` | `var(--s2a-spacing-80)` | ⚠ TRUE GAP — 80px not in semantic series | 🟡 medium |
| 286 | `.content` | `max-width` (calc arg) | `var(--s2a-spacing-80)` | ⚠ TRUE GAP — 80px not in semantic series | 🟡 medium |
| 285 | `.content` | `min-width` | `512px` | layout constant — no token | 🟡 medium |
| 295 | `button:is(.prev, .next)` | `--btn-inset` | `40px` | `--s2a-spacing-2xl` (Δ0) | 🟡 medium |

---

### elastic-carousel.css
**7 violations** — 0 critical · 4 high · 3 medium

#### Color
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~54 | `p` (item header) | `color` | `var(--s2a-color-gray-1000)` | `--s2a-color-content-default` | 🟠 high |
| ~199 | `.elastic-carousel-item-header p` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| ~210 | `.elastic-carousel-item-footer:after` | `background-color` | `var(--s2a-color-gray-25)` | `--s2a-color-background-default` | 🟠 high |

#### Typography
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~57 | `p` | `line-height` | `var(--s2a-font-line-height-18)` | `--s2a-font-line-height-xs` | 🟠 medium |

#### Spacing
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~47 | `img` | `width` | `24px` | `--s2a-spacing-lg` | 🟠 high |
| ~73 | `video` | `height` | `394px` | no token (design constant) | 🟡 medium |

#### Border Radius
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~294 | `video` (mobile) | `border-radius` | `var(--s2a-border-radius-0)` | `--s2a-border-radius-none` | 🟠 medium |

---

### base-card.css
**7 violations** — 0 critical · 3 high · 4 medium

#### Color
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~38 | `h1–h6` | `color` | `var(--s2a-color-gray-1000)` | `--s2a-color-content-title` | 🟠 high |
| ~53 | `p` | `color` | `var(--s2a-color-transparent-black-64)` | no semantic equivalent — acceptable primitive | 🟠 high |

#### Spacing
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~22 | `.icon img` | `width` | `24px` | `--s2a-spacing-lg` | 🟠 high |
| ~37 | `h1–h6` | `margin-bottom` | `var(--s2a-spacing-8)` | `--s2a-spacing-xs` | 🟠 medium |
| ~46 | `.standalone-link` | `margin-top` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟠 medium |
| ~48 | `.standalone-link` | `margin-bottom` | `var(--s2a-spacing-4)` | `--s2a-spacing-2xs` | 🟠 medium |
| ~58 | `.foreground` | `padding` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟠 medium |

---

### explore-card.css
**7 violations** — 0 critical · 3 high · 4 medium

#### Color
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~22 | `.explore-card-link-container:hover` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| ~35 | `.explore-card-background` | `background-color` | `var(--s2a-color-transparent-black-08)` | no semantic equivalent — acceptable primitive | 🟠 high |
| ~82 | `.dark .explore-card-background` | `background-color` | `var(--s2a-color-transparent-white-08)` | no semantic equivalent — acceptable primitive | 🟠 high |

#### Border Radius
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~28 | `:focus-visible` | `border-radius` | `var(--s2a-border-radius-16)` | `--s2a-border-radius-md` | 🟠 medium |

#### Spacing
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~60 | `img` | `width` | `32px` | `--s2a-spacing-xl` or primitive `--s2a-spacing-32` | 🟡 medium |
| ~88 | `.explore-card-content` | `min-height` | `300px` | no token (layout constant) | 🟡 medium |
| ~94 | `.explore-card-content` | `min-height` | `360px` | no token (layout constant) | 🟡 medium |

---

### rich-content.css
**5 violations** — 2 critical · 0 high · 3 medium

#### Color
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~31 | `picture::after` | `background` | `#000` (in gradient) | `--s2a-color-background-knockout` | 🔴 critical |
| ~31 | `picture::after` | `background` | `rgba(0, 0, 0, 0.00)` (in gradient) | transparent-black token (existing or new) | 🔴 critical |

#### Spacing
| Line | Selector | Property | Current Value | Note | Severity |
|---|---|---|---|---|---|
| ~7 | `.rich-content.hero` | `height` | `640px` | no token (page-level layout constant) | 🟡 medium |
| ~20 | `.action-area` | `margin-top` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟠 medium |
| ~42 | `.section:has(.rich-content.hero)` | `height` | `1040px` | no token (page-level layout constant) | 🟡 medium |

---

### news.css
**4 violations** — 0 critical · 0 high · 4 medium
All violations are primitive spacing tokens that should be aliased to semantic equivalents.

| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~21 | `.icon` | `width` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| ~22 | `.icon` | `height` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| ~69 | `.news-headline` | `padding` | `var(--s2a-spacing-0)` | `--spacing-none` | 🟡 medium |
| ~70 | `.news-headline` | `margin-bottom` | `var(--s2a-spacing-0)` | `--spacing-none` | 🟡 medium |

---

### menu.css
**4 violations** — 1 critical · 0 high · 3 medium

#### Color
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~7 | `.feds-popup` | `box-shadow` | `rgba(0, 0, 0, 0.08)` | `--s2a-color-transparent-black-08` (existing, Δ0%) | 🔴 critical |

#### Spacing
| Line | Selector | Property | Current Value | Note | Severity |
|---|---|---|---|---|---|
| ~15 | `.feds-popup-column` | `min-width` | `200px` | no token (layout constant) | 🟡 medium |
| ~16 | `.feds-popup-column` | `max-width` | `240px` | `--s2a-spacing-240` (primitive exists) | 🟡 medium |
| ~60 | `.feds-navLink-image` | `height` | `16px` | `--s2a-spacing-md` (16px) | 🟡 medium |

---

### styles.css
**0 violations** — clean.

---

## Token Gaps

Values with no usable existing token. The transparent token series (`00, 04, 08, 12, 16, 24, 32, 48, 64`) covers most rgba values in this codebase within an acceptable Δ — only items below are true gaps.

| Value | Occurrences | Files | Gap / Suggested Action |
|---|---|---|---|
| `rgba(250 250 250 / 85%)` | 1 | `brand-concierge.css` | Off-white frosted glass — no transparent-white token applies (not pure white). True gap: suggest `--s2a-color-background-frosted` or component-scoped custom property. |
| `blur(12px)` | 2 | `router-marquee.css` | `--s2a-blur-xs` = 8px (Δ4), `--s2a-blur-sm` = 16px (Δ4). True gap — suggest adding `--s2a-blur-sm` = 12px or accepting nearest token. |
| `blur(156px)` | 1 | `router-marquee.css` | No blur token near 156px. Likely a one-off glass blur on the active card. Suggest custom property `--rm-card-active-blur`. |
| `36px` font-size | 2 | `brand-concierge.css` | Gap between `--s2a-font-size-3xl` (32px) and `--s2a-font-size-4xl` (40px). Add `--s2a-font-size-36` or redesign to use 32/40. |
| `44px` font-size | 1 | `brand-concierge.css` | Gap between 4xl (40) and 5xl (48). Add `--s2a-font-size-44` or align to 40. |
| `45px` / `55px` line-height | 2 | `brand-concierge.css` | Non-standard values paired with non-standard font-sizes above. Will resolve if font-sizes are aligned to the scale. |
| `#4B4B4B` | 2 | `brand-concierge.css` | Mid-gray (~50% lightness) not in semantic token set. Closest: `--s2a-color-content-subtle` (once confirmed value). |
| `#A358B1` | 1 | `brand-concierge.css` | Brand purple (beta label). Not in S2A token set. Use product-specific token or `--s2a-color-content-brand-purple` (pending). |

**Not gaps** (use existing tokens — previously mis-flagged):

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

## Files With No Violations

| File | Notes |
|---|---|
| `styles.css` | Single rule (`border-bottom: none`) — no tokenizable values. |
| `global-navigation.css` | Empty — content fetch returned 0 bytes. |

---

## Priority Recommendations

1. **brand-concierge.css** and **router-marquee.css** are the highest-risk files (50 violations each). Both make heavy use of raw `rgba()` overlays and hardcoded color variables in `:root`/component scope that will not adapt to theme changes. Address color first.

2. **Map `rgba()` overlays to existing transparent tokens.** The `--s2a-color-transparent-black-*` and `--s2a-color-transparent-white-*` series already covers most values in use (08, 12, 32, 48, 64). Values like `rgba(0,0,0,0.44)`, `rgba(0,0,0,0.30)`, and `rgba(255,255,255,0.11)` all have matching tokens within Δ4%. No new tokens are needed for the marquee. Only `rgba(250,250,250/85%)` (frosted glass in brand-concierge) is a true gap.

3. **Alias all `--s2a-{property}-{number}` primitives to semantic t-shirt tokens.** Across all files, ~81 violations are primitive tokens used directly. The fix is mechanical: replace e.g. `var(--s2a-spacing-24)` → `var(--s2a-spacing-lg)`.

4. **Add `--s2a-font-size-36` to the type scale.** The value 36px appears 2+ times with no matching semantic token (gap between 3xl=32 and 4xl=40).

5. **modal.css focus color mismatch.** `--modal-focus-color: #109cde` does not match `--s2a-color-focus-ring-default` (#3b63fb). This is a WCAG 2.2 SC 2.4.11 risk — the focus ring color should be unified to the system token.
