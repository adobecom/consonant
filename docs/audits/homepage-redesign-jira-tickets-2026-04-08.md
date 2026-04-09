# Homepage Redesign — Jira Ticket Scaffolds (2026-04-08)

Tickets to be filed against the site redesign token audit. Do not create in Jira until reviewed.

**Epic:** MWPW-187572 (Site Redesign 2026)
**Labels:** `c2-site-redesign-2026` · `token-audit`
**Status:** Backlog
**Assignee:** Unassigned

**Priority mapping:**
- High = file contains 🔴 critical (hardcoded color) violations
- Medium = 🟠 high violations only
- Low = 🟡 medium violations only

**Line number note:** Violations from `router-marquee`, `brand-concierge`, `modal`, `global-footer`, `elastic-carousel`, `base-card`, `explore-card`, `rich-content`, `news`, and `menu` were sourced from deployed AEM CSS — line numbers are approximate (`~`). `carousel-c2` was re-audited from source and line numbers are exact.

---

## TICKET 1 — router-marquee.css

**Summary:** `[Token Audit] router-marquee.css — replace hardcoded values and primitive tokens with S2A semantic tokens`
**Type:** Task
**Priority:** High
**Epic:** MWPW-187572
**Labels:** `c2-site-redesign-2026`, `token-audit`
**Component:** router-marquee
**Source file:** `context/milo/libs/c2/blocks/router-marquee/router-marquee.css`

### Description

Token audit of `router-marquee.css` found 50 violations across color, spacing, typography, blur, and border-radius.

#### Color — 11 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~141 | `.rm-card` | `background` | `rgba(0, 0, 0, 0.44)` | `--s2a-color-transparent-black-48` (Δ4%) | 🔴 critical |
| ~143 | `.rm-card` | `box-shadow` | `rgba(255, 255, 255, 0.11)` | `--s2a-color-transparent-white-12` (Δ1%) | 🔴 critical |
| ~220 | `.offset-filler:hover` | `background` | `rgba(0, 0, 0, 0.6)` | `--s2a-color-transparent-black-64` (Δ4%) | 🔴 critical |
| ~241 | `.rm-overlay` | `background` | `rgba(0, 0, 0, 0.60)` → `rgba(0,0,0,0)` | `--s2a-color-transparent-black-64` / `transparent` | 🔴 critical |
| ~282 | `.rm-arrow-next` | `background` | `rgba(0, 0, 0, 0.30)` | `--s2a-color-transparent-black-32` (Δ2%) | 🔴 critical |
| ~286 | `.rm-arrow-next` | `color` | `rgba(255, 255, 255, 0.75)` | `--s2a-color-transparent-white-64` (Δ11%) | 🔴 critical |
| ~405 | `.rm-overlay` (desktop) | `background` | `rgba(0, 0, 0, 0.56)` | `--s2a-color-transparent-black-64` (Δ8%) | 🔴 critical |
| ~135 | `.rm-card` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| ~154 | `.rm-card.is-active` | `background` | `var(--s2a-color-gray-25)` | `--s2a-color-background-default` | 🟠 high |
| ~155 | `.rm-card.is-active` | `color` | `var(--s2a-color-gray-1000)` | `--s2a-color-content-default` | 🟠 high |
| ~190 | `.rm-card-progress-bar` | `background` | `var(--s2a-color-brand-adobe-red)` | `--s2a-color-background-brand` | 🟠 high |

#### Spacing — 6 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~51 | `.rm-content-wrapper` | `max-width` | `1920px` | layout constant — no token | 🟡 medium |
| ~113 | `.rm-controls` | `gap` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| ~182 | `.rm-card-progress` | `height` | `4px` | `--s2a-spacing-2xs` | 🟠 high |
| ~279–280 | `.rm-arrow-next` | `width` / `height` | `var(--s2a-spacing-48)` | `--s2a-spacing-3xl` | 🟡 medium |
| ~299 | `.rm-cards` | `gap` | `var(--s2a-spacing-4)` | `--s2a-spacing-2xs` | 🟡 medium |
| multiple | various | `var(--s2a-spacing-24)` | `24px` | `--s2a-spacing-lg` | 🟡 medium |

#### Typography — 11 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~75 | `.rm-eyebrow` | `font-size` | `var(--s2a-font-size-16)` | `--s2a-font-size-md` | 🟡 medium |
| ~76 | `.rm-eyebrow` | `line-height` | `20px` | `--s2a-font-line-height-sm` | 🟠 high |
| ~77 | `.rm-eyebrow` | `letter-spacing` | `var(--s2a-font-letter-spacing-neg-0_2)` | `--s2a-font-letter-spacing-5xl` | 🟡 medium |
| ~175 | `.rm-card-label` | `line-height` | `18px` | `--s2a-font-line-height-xs` | 🟠 high |
| ~350 | `.rm-title` (mobile) | `line-height` | `40px` | `--s2a-font-line-height-xl` | 🟠 high |
| ~380 | `.rm-title` (tablet) | `line-height` | `56px` | `--s2a-font-line-height-3xl` | 🟠 high |
| ~386 | `.rm-body` (tablet) | `line-height` | `24px` | `--s2a-font-line-height-md` | 🟠 high |
| ~423 | `.rm-title` (desktop) | `line-height` | `76px` | `--s2a-font-line-height-5xl` | 🟠 high |
| ~349 | `.rm-title` (mobile) | `font-size` | `var(--s2a-font-size-40)` | `--s2a-font-size-4xl` | 🟡 medium |
| ~379 | `.rm-title` (tablet) | `font-size` | `var(--s2a-font-size-56)` | `--s2a-font-size-6xl` | 🟡 medium |
| ~422 | `.rm-title` (desktop) | `font-size` | `var(--s2a-font-size-80)` | `--s2a-font-size-9xl` | 🟡 medium |

#### Blur — 3 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~139 | `.rm-card` | `backdrop-filter` | `blur(12px)` | `--s2a-blur-sm` (nearest, Δ4px) | 🟠 high |
| ~156 | `.rm-card.is-active` | `backdrop-filter` | `blur(156px)` | ⚠ TRUE GAP — suggest `--s2a-blur-xl: 156px` | 🟠 high |
| ~284 | `.rm-arrow-next` | `backdrop-filter` | `blur(24px)` | `--s2a-blur-24` (primitive exists) | 🟠 high |

#### Border Radius — 2 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~136 | `.rm-card` | `border-radius` | `var(--s2a-border-radius-8)` | `--s2a-border-radius-sm` | 🟡 medium |
| ~184 | `.rm-card-progress` | `border-radius` | `var(--s2a-border-radius-4)` | `--s2a-border-radius-xs` | 🟡 medium |

### Acceptance Criteria
- [ ] All `rgba()` hardcodes replaced with nearest `--s2a-color-transparent-*` token
- [ ] All `--s2a-color-gray-N` and `--s2a-color-brand-adobe-red` primitives replaced with semantic equivalents
- [ ] All `--s2a-spacing-N`, `--s2a-font-size-N`, `--s2a-font-letter-spacing-*`, `--s2a-border-radius-N` primitives replaced with semantic equivalents
- [ ] Hardcoded `px` line-heights replaced with `--s2a-font-line-height-*` tokens
- [ ] `blur(156px)` flagged to design system team for new `--s2a-blur-xl` token consideration
- [ ] Line numbers verified against source file before implementation

---

## TICKET 2 — brand-concierge.css

**Summary:** `[Token Audit] brand-concierge.css — replace hardcoded values and primitive tokens with S2A semantic tokens`
**Type:** Task
**Priority:** High
**Epic:** MWPW-187572
**Labels:** `c2-site-redesign-2026`, `token-audit`
**Component:** brand-concierge
**Source file:** `context/milo/libs/c2/blocks/brand-concierge/brand-concierge.css`

### Description

Token audit of `brand-concierge.css` found 50 violations across color, spacing, typography, blur, and border-radius. Contains two TRUE GAPs: `#A358B1` (brand purple, no token exists) and `36px`/`44px` font sizes.

#### Color — 11 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~14 | `.brand-concierge` | `--bc-header-color` | `#131313` | `--s2a-color-content-body-strong` | 🔴 critical |
| ~20 | `.brand-concierge` | `--bc-card-text-color` | `#292929` | `--s2a-color-content-default` | 🔴 critical |
| ~35 | `.brand-concierge` | `--bc-button-color` | `#292929` | `--s2a-color-content-default` | 🔴 critical |
| ~36 | `.brand-concierge` | `--bc-button-hover-color` | `#131313` | `--s2a-color-content-body-strong` | 🔴 critical |
| ~37 | `.brand-concierge` | `--bc-keyboard-focus-color` | `#5574F7` | `--s2a-color-focus-ring-default` | 🔴 critical |
| ~73 | `.prompt-card-button` | `background` | `#fff` | `--s2a-color-background-default` | 🔴 critical |
| ~144 | `.bc-input-tooltip` | `color` | `#fff` | `--s2a-color-content-knockout` | 🔴 critical |
| ~201 | `.bc-legal` | `color` | `#4B4B4B` | `--s2a-color-content-body-subtle` | 🔴 critical |
| ~229 | `.bc-modal-title` | `color` | `#000` | `--s2a-color-content-default` | 🔴 critical |
| ~237 | `.bc-beta-label` | `color` | `#A358B1` | ⚠ TRUE GAP — brand purple, no token exists | 🔴 critical |
| ~238 | `.bc-beta-label` | `background` | `#EAEAED` | `--s2a-color-background-subtle` (nearest) | 🔴 critical |

#### Spacing — 5 violations (representative — multiple hardcoded values throughout)
| Value | Property context | Suggested Token | Severity |
|---|---|---|---|
| `40px` | `padding` | `--s2a-spacing-2xl` | 🟡 medium |
| `24px` | `padding` | `--s2a-spacing-lg` | 🟡 medium |
| `32px` | `margin-bottom` | `--s2a-spacing-xl` | 🟡 medium |
| `4px` | `gap` | `--s2a-spacing-2xs` | 🟡 medium |
| `80px` | `margin` | `--s2a-spacing-3xl` (nearest) or primitive `--s2a-spacing-80` | 🟡 medium |

#### Typography — 7 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~225 | `.bc-modal-title` | `font-size` | `16px` | `--s2a-font-size-md` | 🟠 high |
| ~227 | `.bc-modal-title` | `line-height` | `32px` | `--s2a-font-line-height-lg` | 🟠 high |
| ~228 | `.bc-modal-title` | `font-weight` | `900` | `--s2a-font-weight-adobe-clean-black` | 🟠 high |
| ~234 | `.bc-beta-label` | `font-weight` | `700` | `--s2a-font-weight-adobe-clean-bold` | 🟠 high |
| ~202 | `.bc-legal` | `font-size` | `11px` | `--s2a-font-size-xs` (nearest: 12px, Δ1) | 🟡 medium |
| ~277 | `.hero .bc-header-title` | `font-size` | `36px` | ⚠ TRUE GAP — no token at 36px, suggest `--s2a-font-size-36` | 🟡 medium |
| ~318 | `.hero .bc-header-title` | `font-size` | `44px` | ⚠ TRUE GAP — no exact token, nearest `--s2a-font-size-4xl` (40px, Δ4) | 🟡 medium |

#### Blur — 1 violation
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~125 | `.bc-floating-button::before` | `backdrop-filter` | `blur(10px)` | `--s2a-blur-xs` (8px, Δ2px) | 🟠 high |

#### Border Radius — 5 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~75 | `.prompt-card-button` | `border-radius` | `12px` | no exact — between `--s2a-border-radius-sm` (8) and `--s2a-border-radius-md` (16) | 🟡 medium |
| ~145 | `.bc-input-tooltip` | `border-radius` | `7px` | `--s2a-border-radius-sm` (8px, Δ1px) | 🟡 medium |
| ~239 | `.bc-beta-label` | `border-radius` | `4px` | `--s2a-border-radius-xs` | 🟠 high |
| ~248 | `#brand-concierge-modal` | `border-radius` | `24px` | no exact — between `--s2a-border-radius-md` (16) and `--s2a-border-radius-lg` (32) | 🟡 medium |
| ~263 | `.dialog-close:focus-visible` | `border-radius` | `8px` | `--s2a-border-radius-sm` | 🟠 high |

### Acceptance Criteria
- [ ] All hardcoded hex/rgba colors in custom properties (`--bc-*`) replaced with semantic tokens
- [ ] All `--s2a-color-gray-N` primitives replaced with semantic equivalents
- [ ] All hardcoded `px` spacing values replaced with semantic `--s2a-spacing-*` tokens
- [ ] All hardcoded `px` typography values replaced with semantic `--s2a-font-*` tokens
- [ ] `#A358B1` (brand purple) flagged to design system team — token does not exist
- [ ] `36px` and `44px` font sizes flagged to design system team for new token consideration
- [ ] Line numbers verified against source file before implementation

---

## TICKET 3 — modal.css

**Summary:** `[Token Audit] modal.css — replace hardcoded values and primitive tokens with S2A semantic tokens`
**Type:** Task
**Priority:** High
**Epic:** MWPW-187572
**Labels:** `c2-site-redesign-2026`, `token-audit`
**Component:** modal
**Source file:** `context/milo/libs/c2/blocks/modal/modal.css`

### Description

Token audit of `modal.css` found 26 violations across color, spacing, and typography. Modal dimension values (`650px`, `850px`, etc.) are intentional layout breakpoints — flagged for review, not replacement.

#### Color — 4 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~1 | `:root` | `--modal-focus-color` | `#109cde` | `--s2a-color-focus-ring-default` | 🔴 critical |
| ~6 | `:root` | `--modal-close-accent-color` | `#707070` | `--s2a-color-content-subtle` | 🔴 critical |
| ~12 | `.dialog-modal` | `background` | `#fff` | `--s2a-color-background-default` | 🔴 critical |
| ~118 | `button.dialog-close::before/after` | `background` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-knockout` | 🟠 high |

#### Spacing — 7 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~13 | `.dialog-modal` | `border-radius` | `6px` | `--s2a-border-radius-xs` (4px, Δ2) or `--s2a-border-radius-sm` (8px, Δ2) | 🟡 medium |
| ~47 | `.dialog-close` | `height` / `width` | `26px` | `--s2a-spacing-lg` (24px, Δ2) | 🟡 medium |
| ~56 | `.locale-modal` | `padding` | `48px 32px 30px` | `--s2a-spacing-3xl` / `--s2a-spacing-xl` / no 30px token | 🟠 high |
| ~74 | `.locale-modal a` | `padding` | `8px` | `--s2a-spacing-xs` | 🟠 high |
| ~84 | `.region-selector-text` | `padding` | `32px 32px 20px` | `--s2a-spacing-xl` / no 20px token | 🟡 medium |
| ~127–162 | multiple `.dialog-modal` variants | `width` / `height` | `650px`, `820px`, `850px`, `1024px`, `1100px`, `1200px`, `1280px` | Modal size breakpoints — no spacing tokens. Suggest named modal-size custom properties. | 🟡 medium |

#### Typography — 5 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~64 | `.locale-modal p` | `font-size` | `16px` | `--s2a-font-size-md` | 🟠 high |
| ~65 | `.locale-modal p` | `font-weight` | `500` | `--s2a-font-weight-adobe-clean-medium` | 🟠 high |
| ~66 | `.locale-modal p` | `line-height` | `20px` | `--s2a-font-line-height-sm` | 🟠 high |
| ~89 | `.region-selector-text p:first-of-type` | `font-size` | `24px` | `--s2a-font-size-2xl` | 🟠 high |
| ~94 | `.region-selector` | `font-size` | `14px` | `--s2a-font-size-sm` | 🟠 high |

### Acceptance Criteria
- [ ] `:root` custom properties `--modal-focus-color` and `--modal-close-accent-color` replaced with semantic tokens
- [ ] `.dialog-modal` background `#fff` replaced with `--s2a-color-background-default`
- [ ] All `--s2a-color-gray-N` primitives replaced with semantic equivalents
- [ ] Locale modal typography values replaced with semantic font tokens
- [ ] Modal size breakpoint values reviewed — recommend converting to named custom properties if not already done
- [ ] Line numbers verified against source file before implementation

---

## TICKET 4 — global-footer.css

**Summary:** `[Token Audit] global-footer.css — replace hardcoded values and primitive tokens with S2A semantic tokens`
**Type:** Task
**Priority:** High
**Epic:** MWPW-187572
**Labels:** `c2-site-redesign-2026`, `token-audit`
**Component:** global-footer
**Source file:** `context/milo/libs/c2/blocks/global-footer/global-footer.css`

### Description

Token audit of `global-footer.css` found 18 violations across color and spacing. Footer is a dark-surface context — semantic inverse/knockout tokens apply throughout.

#### Color — 5 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~100 | `.feds-social-icon` | `color` | `#808080` | no exact match — suggest `--s2a-color-content-subtle` | 🔴 critical |
| ~3 | `.global-footer` | `background` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-inverse` | 🟠 high |
| ~9 | `.feds-footer-wrapper` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| ~13 | `.feds-footer-wrapper` | `background-color` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-inverse` | 🟠 high |
| ~19 | `.feds-menu-headline` | `border-color` | `var(--s2a-color-transparent-white-12)` | acceptable primitive — no semantic equivalent exists | 🟠 high |

#### Spacing — 6 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~38 | `.feds-footer-options` | `row-gap` | `12px` | no exact — suggest `--s2a-spacing-sm` (12px) as new token | 🟡 medium |
| ~39 | `.feds-footer-options` | `column-gap` | `40px` | `--s2a-spacing-2xl` | 🟡 medium |
| ~44 | `.feds-footer-miscLinks` | `column-gap` | `30px` | no exact — nearest `--s2a-spacing-xl` (32px, Δ2) | 🟡 medium |
| ~49 | `.feds-regionPicker` | `column-gap` | `6px` | `--s2a-spacing-2xs` (4px, Δ2) | 🟡 medium |
| ~56 | `.feds-regionPicker-globe` | `width` / `height` | `20px` | no exact — nearest `--s2a-spacing-md` (16px, Δ4) | 🟡 medium |
| ~128 | `.feds-footer-privacyLink-divider` | `margin` | `5px` | `--s2a-spacing-2xs` (4px, Δ1) | 🟡 medium |

### Acceptance Criteria
- [ ] `#808080` social icon color replaced with semantic token — coordinate with DS team if `--s2a-color-content-subtle` is the right fit
- [ ] All `--s2a-color-gray-N` primitives replaced with semantic inverse/knockout tokens
- [ ] All hardcoded `px` spacing values replaced with semantic equivalents
- [ ] `12px` gap flagged to DS team for `--s2a-spacing-sm` token consideration
- [ ] Line numbers verified against source file before implementation

---

## TICKET 5 — carousel-c2.css

**Summary:** `[Token Audit] carousel-c2.css — replace hardcoded values and primitive tokens with S2A semantic tokens`
**Type:** Task
**Priority:** High
**Epic:** MWPW-187572
**Labels:** `c2-site-redesign-2026`, `token-audit`
**Component:** carousel-c2
**Source file:** `context/milo/libs/c2/blocks/carousel-c2/carousel-c2.css`

> Line numbers are exact — audited directly from source.

### Description

Token audit of `carousel-c2.css` found 27 violations across color, border-radius, and spacing. Includes 2 TRUE GAPs: `--s2a-spacing-80` (80px not in semantic series) and `20px` inset with no close token.

#### Color — 9 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 64 | `.section-background::after` | `background` | `#000000` (gradient stop) | `--s2a-color-background-knockout` | 🔴 critical |
| 64 | `.section-background::after` | `background` | `rgba(0, 0, 0, 0.09)` (gradient stop) | `--s2a-color-transparent-black-08` (Δ1%) | 🟠 high |
| 172 | `button` | `background` | `var(--s2a-color-gray-25)` | `--s2a-color-background-default` | 🟠 high |
| 193 | `.arrow-default` | `color` | `var(--s2a-color-gray-1000)` | `--s2a-color-content-default` | 🟠 high |
| 197 | `.arrow-hover` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| 233 | `button:hover` | `background` | `var(--s2a-color-gray-1000)` | `--s2a-color-background-inverse` | 🟠 high |
| 257 | `.slide-indicator.active` | `background` | `var(--s2a-color-gray-25)` | `--s2a-color-background-default` | 🟠 high |
| 335 | `:dir(rtl) .section-background::after` | `background` | `#000000` (gradient stop) | `--s2a-color-background-knockout` (RTL mirror of L64) | 🔴 critical |
| 335 | `:dir(rtl) .section-background::after` | `background` | `rgba(0, 0, 0, 0.09)` (gradient stop) | `--s2a-color-transparent-black-08` (RTL mirror of L64) | 🟠 high |

#### Border Radius — 4 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 46 | `.carousel-slide` | `border-radius` | `var(--s2a-border-radius-16)` | `--s2a-border-radius-md` | 🟡 medium |
| 63 | `.section-background::after` | `border-radius` | `var(--s2a-border-radius-16)` | `--s2a-border-radius-md` | 🟡 medium |
| 105 | `.section-background img` | `border-radius` | `var(--s2a-border-radius-16)` | `--s2a-border-radius-md` | 🟡 medium |
| 111 | `.section-background img` | `border-radius` | `var(--s2a-border-radius-16)` | `--s2a-border-radius-md` | 🟡 medium |

#### Spacing — 15 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| 7 | `.carousel-c2` | `--carousel-slides-gap` | `8px` | `--s2a-spacing-xs` | 🟡 medium |
| 71 | `.foreground` | `padding` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| 81 | `:is(h1, h2, h3, h4, h5, h6)` | `margin-bottom` | `8px` | `--s2a-spacing-xs` | 🟡 medium |
| 154 | `.foreground` | `padding-inline` | `var(--s2a-spacing-64)` | `--s2a-spacing-4xl` | 🟡 medium |
| 156 | `.content` | `max-width` (calc arg) | `var(--s2a-spacing-64)` | `--s2a-spacing-4xl` | 🟡 medium |
| 157 | `.content` | `min-width` | `360px` | layout constant — no token | 🟡 medium |
| 165 | `button` | `--btn-dimension` | `var(--s2a-spacing-40)` | `--s2a-spacing-2xl` | 🟡 medium |
| 247 | `.indicators-container` | `bottom` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| 251 | `.slide-indicator` | `width` | `var(--s2a-spacing-8)` | `--s2a-spacing-xs` | 🟡 medium |
| 252 | `.slide-indicator` | `height` | `var(--s2a-spacing-8)` | `--s2a-spacing-xs` | 🟡 medium |
| 267 | `button:is(.prev, .next)` | `--btn-inset` | `20px` | nearest `--s2a-spacing-md` (Δ4px) — confirm with design | 🟡 medium |
| 283 | `.foreground` | `padding-inline` | `var(--s2a-spacing-80)` | ⚠ TRUE GAP — 80px not in semantic series | 🟡 medium |
| 286 | `.content` | `max-width` (calc arg) | `var(--s2a-spacing-80)` | ⚠ TRUE GAP — 80px not in semantic series | 🟡 medium |
| 285 | `.content` | `min-width` | `512px` | layout constant — no token | 🟡 medium |
| 295 | `button:is(.prev, .next)` | `--btn-inset` | `40px` | `--s2a-spacing-2xl` (Δ0) | 🟡 medium |

### Acceptance Criteria
- [ ] Hardcoded `#000000` and `rgba(0,0,0,0.09)` in LTR and RTL gradients replaced with semantic tokens
- [ ] All `--s2a-color-gray-N` primitives replaced with semantic equivalents
- [ ] All 4 instances of `var(--s2a-border-radius-16)` replaced with `--s2a-border-radius-md`
- [ ] All `--s2a-spacing-N` primitives replaced with semantic equivalents
- [ ] `--s2a-spacing-80` (80px) flagged to design system team for new semantic token consideration
- [ ] `--btn-inset: 20px` value confirmed with design before token substitution

---

## TICKET 6 — elastic-carousel.css

**Summary:** `[Token Audit] elastic-carousel.css — replace primitive tokens with S2A semantic tokens`
**Type:** Task
**Priority:** Medium
**Epic:** MWPW-187572
**Labels:** `c2-site-redesign-2026`, `token-audit`
**Component:** elastic-carousel
**Source file:** `context/milo/libs/c2/blocks/elastic-carousel/elastic-carousel.css`

### Description

Token audit of `elastic-carousel.css` found 7 violations. No hardcoded colors — all violations are primitive tokens at the wrong abstraction level.

#### Color — 3 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~54 | `p` (item header) | `color` | `var(--s2a-color-gray-1000)` | `--s2a-color-content-default` | 🟠 high |
| ~199 | `.elastic-carousel-item-header p` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| ~210 | `.elastic-carousel-item-footer:after` | `background-color` | `var(--s2a-color-gray-25)` | `--s2a-color-background-default` | 🟠 high |

#### Typography — 1 violation
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~57 | `p` | `line-height` | `var(--s2a-font-line-height-18)` | `--s2a-font-line-height-xs` | 🟡 medium |

#### Spacing — 1 violation
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~47 | `img` | `width` | `24px` | `--s2a-spacing-lg` | 🟠 high |

#### Border Radius — 1 violation
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~294 | `video` (mobile) | `border-radius` | `var(--s2a-border-radius-0)` | `--s2a-border-radius-none` | 🟡 medium |

### Acceptance Criteria
- [ ] All `--s2a-color-gray-N` primitives replaced with semantic equivalents
- [ ] `var(--s2a-font-line-height-18)` replaced with `--s2a-font-line-height-xs`
- [ ] `24px` image width replaced with `--s2a-spacing-lg`
- [ ] `var(--s2a-border-radius-0)` replaced with `--s2a-border-radius-none`
- [ ] Line numbers verified against source file before implementation

---

## TICKET 7 — base-card.css

**Summary:** `[Token Audit] base-card.css — replace primitive tokens with S2A semantic tokens`
**Type:** Task
**Priority:** Medium
**Epic:** MWPW-187572
**Labels:** `c2-site-redesign-2026`, `token-audit`
**Component:** base-card
**Source file:** `context/milo/libs/c2/blocks/base-card/base-card.css`

### Description

Token audit of `base-card.css` found 7 violations. No hardcoded colors — all violations are primitive tokens and one hardcoded dimension.

#### Color — 2 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~38 | `h1–h6` | `color` | `var(--s2a-color-gray-1000)` | `--s2a-color-content-title` | 🟠 high |
| ~53 | `p` | `color` | `var(--s2a-color-transparent-black-64)` | no semantic equivalent — acceptable primitive for now | 🟠 high |

#### Spacing — 5 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~22 | `.icon img` | `width` | `24px` | `--s2a-spacing-lg` | 🟠 high |
| ~37 | `h1–h6` | `margin-bottom` | `var(--s2a-spacing-8)` | `--s2a-spacing-xs` | 🟡 medium |
| ~46 | `.standalone-link` | `margin-top` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| ~48 | `.standalone-link` | `margin-bottom` | `var(--s2a-spacing-4)` | `--s2a-spacing-2xs` | 🟡 medium |
| ~58 | `.foreground` | `padding` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |

### Acceptance Criteria
- [ ] `var(--s2a-color-gray-1000)` on headings replaced with `--s2a-color-content-title`
- [ ] All `--s2a-spacing-N` primitives replaced with semantic equivalents
- [ ] `24px` icon width replaced with `--s2a-spacing-lg`
- [ ] `var(--s2a-color-transparent-black-64)` noted as acceptable primitive until a semantic context token exists
- [ ] Line numbers verified against source file before implementation

---

## TICKET 8 — explore-card.css

**Summary:** `[Token Audit] explore-card.css — replace primitive tokens with S2A semantic tokens`
**Type:** Task
**Priority:** Medium
**Epic:** MWPW-187572
**Labels:** `c2-site-redesign-2026`, `token-audit`
**Component:** explore-card
**Source file:** `context/milo/libs/c2/blocks/explore-card/explore-card.css`

### Description

Token audit of `explore-card.css` found 7 violations. No hardcoded colors — all violations are primitive tokens at the wrong abstraction level, plus two layout constants.

#### Color — 3 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~22 | `.explore-card-link-container:hover` | `color` | `var(--s2a-color-gray-25)` | `--s2a-color-content-knockout` | 🟠 high |
| ~35 | `.explore-card-background` | `background-color` | `var(--s2a-color-transparent-black-08)` | no semantic equivalent — acceptable primitive | 🟠 high |
| ~82 | `.dark .explore-card-background` | `background-color` | `var(--s2a-color-transparent-white-08)` | no semantic equivalent — acceptable primitive | 🟠 high |

#### Border Radius — 1 violation
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~28 | `:focus-visible` | `border-radius` | `var(--s2a-border-radius-16)` | `--s2a-border-radius-md` | 🟡 medium |

#### Spacing — 3 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~60 | `img` | `width` | `32px` | `--s2a-spacing-xl` | 🟡 medium |
| ~88 | `.explore-card-content` | `min-height` | `300px` | layout constant — no token | 🟡 medium |
| ~94 | `.explore-card-content` | `min-height` | `360px` | layout constant — no token | 🟡 medium |

### Acceptance Criteria
- [ ] `var(--s2a-color-gray-25)` on hover replaced with `--s2a-color-content-knockout`
- [ ] `var(--s2a-border-radius-16)` replaced with `--s2a-border-radius-md`
- [ ] `32px` image width replaced with `--s2a-spacing-xl`
- [ ] `var(--s2a-color-transparent-black-08)` / `transparent-white-08` noted as acceptable primitives until semantic context tokens exist
- [ ] Line numbers verified against source file before implementation

---

## TICKET 9 — rich-content.css

**Summary:** `[Token Audit] rich-content.css — replace hardcoded gradient values and primitive spacing tokens`
**Type:** Task
**Priority:** High
**Epic:** MWPW-187572
**Labels:** `c2-site-redesign-2026`, `token-audit`
**Component:** rich-content
**Source file:** `context/milo/libs/c2/blocks/rich-content/rich-content.css`

### Description

Token audit of `rich-content.css` found 5 violations. Contains hardcoded colors in a gradient (same pattern as carousel-c2) and two large layout dimension constants.

#### Color — 2 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~31 | `picture::after` | `background` | `#000` (gradient stop) | `--s2a-color-background-knockout` | 🔴 critical |
| ~31 | `picture::after` | `background` | `rgba(0, 0, 0, 0.00)` (gradient stop) | `transparent` or `--s2a-color-transparent-black-00` | 🔴 critical |

#### Spacing — 3 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~7 | `.rich-content.hero` | `height` | `640px` | layout constant — no token | 🟡 medium |
| ~20 | `.action-area` | `margin-top` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| ~42 | `.section:has(.rich-content.hero)` | `height` | `1040px` | layout constant — no token | 🟡 medium |

### Acceptance Criteria
- [ ] `#000` and `rgba(0,0,0,0.00)` in gradient replaced with semantic tokens
- [ ] `var(--s2a-spacing-24)` replaced with `--s2a-spacing-lg`
- [ ] `640px` and `1040px` layout heights noted — review with design whether these should become named tokens
- [ ] Line numbers verified against source file before implementation

---

## TICKET 10 — news.css

**Summary:** `[Token Audit] news.css — replace primitive spacing tokens with S2A semantic tokens`
**Type:** Task
**Priority:** Low
**Epic:** MWPW-187572
**Labels:** `c2-site-redesign-2026`, `token-audit`
**Component:** news
**Source file:** `context/milo/libs/c2/blocks/news/news.css`

### Description

Token audit of `news.css` found 4 violations. All are primitive spacing tokens — straightforward find-and-replace.

| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~21 | `.icon` | `width` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| ~22 | `.icon` | `height` | `var(--s2a-spacing-24)` | `--s2a-spacing-lg` | 🟡 medium |
| ~69 | `.news-headline` | `padding` | `var(--s2a-spacing-0)` | `--spacing-none` | 🟡 medium |
| ~70 | `.news-headline` | `margin-bottom` | `var(--s2a-spacing-0)` | `--spacing-none` | 🟡 medium |

### Acceptance Criteria
- [ ] All `--s2a-spacing-N` primitives replaced with semantic equivalents
- [ ] Line numbers verified against source file before implementation

---

## TICKET 11 — menu.css

**Summary:** `[Token Audit] menu.css — replace hardcoded box-shadow and primitive tokens with S2A semantic tokens`
**Type:** Task
**Priority:** High
**Epic:** MWPW-187572
**Labels:** `c2-site-redesign-2026`, `token-audit`
**Component:** menu
**Source file:** `context/milo/libs/c2/blocks/menu/menu.css`

### Description

Token audit of `menu.css` found 4 violations including one hardcoded `rgba` in a box-shadow.

#### Color — 1 violation
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~7 | `.feds-popup` | `box-shadow` | `rgba(0, 0, 0, 0.08)` | `--s2a-color-transparent-black-08` (Δ0%) | 🔴 critical |

#### Spacing — 3 violations
| Line | Selector | Property | Current Value | Suggested Token | Severity |
|---|---|---|---|---|---|
| ~15 | `.feds-popup-column` | `min-width` | `200px` | layout constant — no token | 🟡 medium |
| ~16 | `.feds-popup-column` | `max-width` | `240px` | no exact token | 🟡 medium |
| ~60 | `.feds-navLink-image` | `height` | `16px` | `--s2a-spacing-md` (16px, Δ0) | 🟡 medium |

### Acceptance Criteria
- [ ] `rgba(0, 0, 0, 0.08)` in box-shadow replaced with `--s2a-color-transparent-black-08`
- [ ] `16px` nav link image height replaced with `--s2a-spacing-md`
- [ ] `200px` / `240px` popup column widths reviewed — if design-locked, document as layout constants
- [ ] Line numbers verified against source file before implementation
