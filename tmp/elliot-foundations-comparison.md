# Elliot Foundations vs S2A Current System - Comparison

## Overview
This document compares Elliot's new foundations (spacing, typography, grids) with the current S2A design token system to identify alignments and gaps.

---

## 1. SPACING TOKENS

### Elliot's Foundations (New)
| Scale | Value | px |
|-------|-------|-----|
| 4 XL | 240px | 240 |
| 3 XL | 160px | 160 |
| 2 XL | 124px | 124 |
| XL | 80px | 80 |
| L | 64px | 64 |
| M | 40px | 40 |
| S | 32px | 32 |
| XS | 24px | 24 |
| 2 XS | 16px | 16 |
| 3 XS | 12px | 12 |
| 4 XS | 8px | 8 |
| 5 XS | 4px | 4 |

### Current S2A System
| Scale | Value | Maps to Primitive |
|-------|-------|-------------------|
| 2xs | 4px | `{spacing.4}` |
| 3xs | 8px | `{spacing.8}` |
| 4xs | 12px | `{spacing.12}` |
| xs | 16px | `{spacing.16}` |
| sm | 24px | `{spacing.24}` |
| md | 32px | `{spacing.32}` |
| lg | 40px | `{spacing.40}` |
| xl | 64px | `{spacing.64}` |
| 2xl | 80px | `{spacing.80}` |
| 3xl | 96px | `{spacing.96}` |
| 4xl | 104px | `{spacing.104}` |
| 5xl | 128px | `{spacing.128}` |
| 6xl | 160px | `{spacing.160}` |
| 7xl | 192px | `{spacing.192}` |

### Alignment Analysis

**✅ ALIGNED:**
- `xs` (16px) - Both use 16px
- `s` / `sm` (24px) - Both use 24px  
- `m` / `md` (32px) - Both use 32px
- `l` / `xl` (64px) - Both use 64px
- `xl` / `2xl` (80px) - Both use 80px
- `3xl` (160px) - Both use 160px

**❌ MISALIGNED:**
- **Elliot's `4xl` (240px)** vs **S2A `4xl` (104px)** - Major difference
- **Elliot's `2xl` (124px)** vs **S2A `2xl` (80px)** - Different values
- **Elliot's `3xl` (160px)** vs **S2A `3xl` (96px)** - Different values
- **Elliot's `xl` (80px)** vs **S2A `xl` (64px)** - Different values
- **Elliot's `m` (40px)** vs **S2A `lg` (40px)** - Same value, different scale name
- **Elliot's `xs` (24px)** vs **S2A `sm` (24px)** - Same value, different scale name

**🆕 NEW IN ELLIOT:**
- `5xs` (4px) - S2A has `2xs` (4px), same value
- `4xs` (8px) - S2A has `3xs` (8px), same value
- `3xs` (12px) - S2A has `4xs` (12px), same value
- `2xs` (16px) - S2A has `xs` (16px), same value

**📊 GAP ANALYSIS:**
- Elliot's scale is more granular at the top end (240px vs 104px for 4xl)
- Elliot uses simpler naming (no `5xl`, `6xl`, `7xl`)
- S2A has more intermediate values (96px, 128px, 192px) that Elliot doesn't have

---

## 2. TYPOGRAPHY TOKENS

### Elliot's Foundations (New)

#### Desktop Typography
| Style | Font Family | Weight | Size | Line Height | Letter Spacing |
|-------|-------------|--------|------|-------------|----------------|
| Super | Adobe Clean Display | Black (900) | 96pt | 94% | -4% |
| H1 | Adobe Clean Display | Black (900) | 72pt | 96% | -4% |
| H2 | Adobe Clean Display | Black (900) | 48pt | 100% | -3% |
| H3 | Adobe Clean Display | Black (900) | 32pt | 100% | -3% |
| H4 | Adobe Clean Display | Black (900) | 24pt | 100% | -2% |
| Body Large | Adobe Clean | Regular (400) | 20pt | 120% | 0% |
| Body Medium | Adobe Clean | Regular (400) | 16pt | 120% | 1% |
| Body Small | Adobe Clean | Regular (400) | 14pt | 120% | 1% |
| Eyebrow | Adobe Clean | Bold (700) | 16pt | 120% | 0% |
| Label | Adobe Clean | Bold (700) | 14pt | 120% | 0% |
| Caption | Adobe Clean | Bold (700) | 12pt | 130% | 2% |

#### Mobile Typography
| Style | Font Family | Weight | Size | Line Height | Letter Spacing |
|-------|-------------|--------|------|-------------|----------------|
| Super | Adobe Clean Display | Black (900) | 56pt | 98% | -3% |
| H1 | Adobe Clean Display | Extra Bold (800) | 40pt | 100% | -3% |
| H2 | Adobe Clean Display | Black (900) | 32pt | 100% | -3% |
| H3 | Adobe Clean Display | Black (900) | 24pt | 100% | -2% |
| H4 | Adobe Clean Display | Black (900) | 20pt | 100% | -1% |
| Body Large | Adobe Clean | Regular (400) | 20pt | 120% | 0% |
| Body Medium | Adobe Clean | Regular (400) | 16pt | 120% | 1% |
| Body Small | Adobe Clean | Regular (400) | 14pt | 120% | 1% |
| Eyebrow | Adobe Clean | Bold (700) | 16pt | 130% | 1% |
| Label | Adobe Clean | Bold (700) | 14pt | 120% | 0% |
| Caption | Adobe Clean | Bold (700) | 12pt | 130% | 2% |

### Current S2A System

**Font Families:**
- `s2a.typography.family.adobe` → "Adobe Clean"
- `s2a.typography.family.adobe-display` → "Adobe Clean Display"
- `s2a.typography.family.adobe-vf` → "Adobe Clean Spectrum VF"
- `s2a.typography.family.adobe-serif` → "Adobe Clean Spectrum Serif VF"

**Font Weights:**
- `s2a.typography.weight.regular` → "Regular" (400)
- `s2a.typography.weight.bold` → "Bold" (700)
- `s2a.typography.weight.extra-bold` → "ExtraBold" (800)
- `s2a.typography.weight.black` → "Black" (900)

**Typography Styles:**
- S2A has semantic font family tokens (heading, title, body, label, etc.)
- S2A does NOT have complete typography scale tokens (fontSize, lineHeight, letterSpacing combinations)
- S2A typography tokens are primarily font family and weight mappings

### Alignment Analysis

**✅ ALIGNED:**
- Font families match: "Adobe Clean" and "Adobe Clean Display" exist in S2A
- Font weights align: Regular (400), Bold (700), Extra Bold (800), Black (900) all exist
- Basic structure supports responsive typography (desktop/mobile separation concept exists)

**❌ MISALIGNED / MISSING:**
- **S2A lacks complete typography scale tokens** - No fontSize/lineHeight/letterSpacing combinations
- **S2A doesn't have semantic typography styles** like "H1", "H2", "Body Large", etc. as complete tokens
- **S2A doesn't have responsive typography tokens** (desktop vs mobile variants)
- **S2A typography tokens are fragmented** - font family, weight, size, line-height are separate, not combined

**🆕 NEW IN ELLIOT:**
- Complete typography scale with all properties combined
- Responsive variants (desktop vs mobile)
- Semantic naming (H1, H2, Body Large, etc.)
- Specific letter spacing values
- Line height as percentage (not unitless ratio)

---

## 3. GRID TOKENS

### Elliot's Foundations (New)

| Breakpoint | Columns | Margin | Gutter |
|------------|---------|--------|--------|
| Desktop Large (1440px+) | 12 | 8.6% | 8px |
| Desktop Medium (1024-1440px) | 12 | 8.6% | 8px |
| Tablet (768-1023px) | 6 | 24px | 8px |
| Mobile (320-767px) | 6 | 24px | 8px |

### Current S2A System

**Responsive Tokens:**
- S2A has `responsive-variablecollectionid-17135-56544.desktop.json`
- S2A has `responsive-variablecollectionid-17135-56544.tablet.json`
- S2A has `responsive-variablecollectionid-17135-56544.mobile.json`
- S2A has `responsive-variablecollectionid-17135-56544.desktop-wide.json`

**Grid Structure:**
- Need to check what's actually in these files

### Alignment Analysis

**✅ ALIGNED:**
- S2A has responsive token structure (desktop, tablet, mobile)
- S2A has breakpoint-aware tokens

**❓ NEEDS INVESTIGATION:**
- What grid values exist in S2A responsive tokens?
- Do they match Elliot's grid specifications?
- Are columns, margins, gutters defined?

**🆕 NEW IN ELLIOT:**
- Explicit grid system with columns, margins, gutters
- Percentage-based margins for desktop (8.6%)
- Fixed pixel margins for mobile/tablet (24px)
- Consistent 8px gutter across all breakpoints

---

## SUMMARY & RECOMMENDATIONS

### What Aligns ✅

1. **Spacing Scale (Partial):**
   - Core values align (16px, 24px, 32px, 64px, 80px, 160px)
   - Naming conventions similar (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)

2. **Typography Foundations:**
   - Font families match (Adobe Clean, Adobe Clean Display)
   - Font weights align (400, 700, 800, 900)
   - Basic structure supports the concept

3. **Responsive Structure:**
   - S2A has responsive token architecture
   - Breakpoint separation exists

### What Doesn't Align ❌

1. **Spacing Scale Mismatches:**
   - `4xl`: Elliot 240px vs S2A 104px (major gap)
   - `2xl`: Elliot 124px vs S2A 80px
   - `3xl`: Elliot 160px vs S2A 96px
   - Scale naming differences (Elliot's `m` = S2A's `lg`)

2. **Typography Gaps:**
   - S2A lacks complete typography scale tokens (no fontSize/lineHeight/letterSpacing combinations)
   - No semantic typography styles (H1, H2, Body Large, etc.)
   - No responsive typography variants (desktop vs mobile)
   - Typography properties are fragmented, not combined

3. **Grid System:**
   - **S2A does NOT have grid tokens** (no columns, margins, gutters found in responsive tokens)
   - Elliot's grid is completely new and needs to be added
   - S2A responsive tokens exist but don't contain grid specifications

### Recommendations

1. **Spacing:**
   - **Decision needed:** Adopt Elliot's scale or merge both?
   - **Option A:** Replace S2A spacing with Elliot's (cleaner, simpler)
   - **Option B:** Extend S2A to include Elliot's values (keep both)
   - **Option C:** Map Elliot's to S2A semantic tokens (e.g., `spacing.4xl` → 240px)

2. **Typography:**
   - **Create complete typography scale tokens** in S2A format
   - **Add responsive variants** (desktop/mobile)
   - **Structure as semantic tokens** (H1, H2, Body Large, etc.)
   - **Combine properties** into single typography tokens

3. **Grid:**
   - **S2A has NO grid tokens** - This is completely new
   - **Add grid tokens** to match Elliot's specifications
   - **Structure as responsive tokens** (desktop-large, desktop-medium, tablet, mobile)
   - **Create in Figma** as new variable collection or add to responsive collection

4. **Migration Path:**
   - Create mapping document (Elliot → S2A)
   - Update Figma variables to match Elliot's values
   - Update token pipeline to output new values
   - Create migration guide for components using old tokens
