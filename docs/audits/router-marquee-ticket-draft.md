# [DRAFT] MWPW-XXXXX — router-marquee: resolve token audit violations

> This is a dry-run ticket generated from the s2a-ds MCP audit.
> When ready to file for real, run: `/create-ticket eng "router-marquee: resolve token audit violations"`

---

**Project:** MWPW
**Type:** Story
**Team:** Consonant
**Priority:** Normal
**Assignee:** mhuntsberry
**Estimate:** 3 story points

---

## Background

An automated s2a-ds MCP audit of `router-marquee.css` (C2 homepage redesign, Milo `site-redesign-foundation` branch) found **50 token violations**: 8 critical (hardcoded `rgba` values with no token binding), 14 high (primitive tokens used directly instead of aliasing through semantic tokens), and 28 medium (additional hardcoded px dimensions with exact semantic matches). These violations prevent the component from responding correctly to theme changes and break the semantic alias chain.

Full audit: `docs/audits/homepage-redesign-token-audit-2026-04-08.md`

---

## Scope

- `context/milo/libs/c2/blocks/router-marquee/router-marquee.css`

---

## Top violations

### 🔴 Critical — hardcoded rgba (8 violations)

| Line | Selector | Value | Suggested token |
|---|---|---|---|
| 141 | `.rm-card` | `rgba(0,0,0,0.44)` | needs new token `--s2a-color-transparent-black-44` |
| 143 | `.rm-card` | `rgba(255,255,255,0.11)` | needs new token `--s2a-color-transparent-white-12` |
| 225 | `.offset-filler:hover` | `rgba(0,0,0,0.6)` | needs new token `--s2a-color-transparent-black-60` |
| 246 | `.rm-overlay` | `rgba(0,0,0,0.60)` | needs new token `--s2a-color-transparent-black-60` |
| 287 | `.rm-arrow-next` | `rgba(0,0,0,0.30)` | needs new token `--s2a-color-transparent-black-30` |
| 291 | `.rm-arrow-next` | `rgba(255,255,255,0.75)` | needs new token `--s2a-color-transparent-white-75` |
| 410 | `.rm-overlay` (desktop) | `rgba(0,0,0,0.56)` | needs new token `--s2a-color-transparent-black-56` |

### 🟠 High — primitive color tokens (5 violations)

| Line | Selector | Current | Semantic alias |
|---|---|---|---|
| 135 | `.rm-card` | `--s2a-color-gray-25` | `--s2a-color-content-knockout` |
| 154 | `.rm-card.is-active` | `--s2a-color-gray-25` | `--s2a-color-background-default` |
| 155 | `.rm-card.is-active` | `--s2a-color-gray-1000` | `--s2a-color-content-default` |
| 195 | `.rm-card-progress-bar` | `--s2a-color-brand-adobe-red` | `--s2a-color-background-brand` |

### 🟠 High — hardcoded line-heights (exact matches, easy wins)

| Line | Selector | Value | Token |
|---|---|---|---|
| 76 | `.rm-eyebrow` | `20px` | `--s2a-font-line-height-sm` |
| 175 | `.rm-card-label` | `18px` | `--s2a-font-line-height-xs` |
| 355 | `.rm-title` (mobile) | `40px` | `--s2a-font-line-height-xl` |
| 385 | `.rm-title` (tablet) | `56px` | `--s2a-font-line-height-3xl` |
| 428 | `.rm-title` (desktop) | `76px` | `--s2a-font-line-height-5xl` |

---

## Acceptance Criteria

- [ ] All 8 critical `rgba` hardcodes replaced with transparent tokens (new tokens added to primitives collection if needed)
- [ ] All primitive color tokens (`--s2a-color-gray-*`, `--s2a-color-brand-*`) aliased through semantic equivalents
- [ ] All hardcoded `line-height` values replaced with exact-match semantic tokens
- [ ] All primitive spacing tokens (`--s2a-spacing-{number}`) aliased through semantic t-shirt names
- [ ] Re-running `s2a-ds audit_css` returns zero critical and zero high violations
- [ ] Visual regression check passes — no layout or color changes visible

---

## Effort

3 story points — 470-line file, violations spread across color, spacing, typography, blur, and border-radius. Most are mechanical find-and-replace; critical `rgba` values require aligning with design on which transparent tokens to add before substituting.
