# Contrast and Color Requirements

Contrast ratios, color-only communication rules, and focus indicator requirements. Use this as a reference when filling General Note cards and when analyzing screenshots for potential issues.

---

## Contrast Ratio Requirements

### Text contrast (WCAG 1.4.3)

| Text type | Minimum ratio (AA) | Enhanced ratio (AAA) |
|---|---|---|
| Normal text (<18pt regular, <14pt bold) | **4.5:1** | 7.0:1 |
| Large text (18pt+ regular, or 14pt+ bold) | **3.0:1** | 4.5:1 |

**The size threshold:** 18pt regular weight (24px) or 14pt bold (18.66px) is the boundary. Above this, the text qualifies as "large" and the ratio drops to 3:1. Below this, 4.5:1 is required.

### Non-text contrast (WCAG 1.4.11)

| Element type | Minimum ratio (AA) |
|---|---|
| UI component borders (buttons, inputs, dropdowns) | **3:1** against background |
| Icons that convey meaning | **3:1** against background |
| Focus indicators | **3:1** against adjacent colors |
| Chart elements (bars, lines, segments) | **3:1** against background |
| Form field borders | **3:1** against background |
| Custom checkboxes, radio buttons, switches | **3:1** against background |

**Exception:** Purely decorative elements (dividers that don't convey structure, ornamental graphics) have no contrast requirement.

### Focus indicator contrast (WCAG 2.4.11 / 2.4.13)

- Focus indicator must have **3:1 contrast** against adjacent colors (the colors directly next to it)
- Minimum **2px outline** (solid, not dotted)
- Recommend `outline-offset: 2px` so the outline doesn't overlap the component
- Must be visible against ALL backgrounds where the component appears — test against light, dark, and colored backgrounds
- In high contrast mode (`forced-colors: active`), focus indicator automatically updates to system colors

---

## Common Contrast Failures

These are the most frequent issues found in real designs:

| Color on white (#fff) | Ratio | Verdict | Accessible alternative |
|---|---|---|---|
| #aaaaaa (light gray) | 2.32:1 | Fails AA | #767676 (4.54:1) |
| #999999 (medium gray) | 2.85:1 | Fails AA | #767676 (4.54:1) |
| #888888 (gray) | 3.54:1 | Fails AA for normal text | #767676 (4.54:1) |
| #777777 (dark gray) | 4.48:1 | Barely fails AA | #757575 (4.60:1) |
| #66bb6a (green) | 3.06:1 | Fails AA for normal text | #2e7d32 (5.87:1) |
| #42a5f5 (blue) | 2.81:1 | Fails AA for normal text | #1565c0 (6.08:1) |
| #ef5350 (red) | 3.13:1 | Fails AA for normal text | #c62828 (5.57:1) |

**Key insight:** Colors in the 400-500 lightness range commonly fail. Shift to 600-700+ range for accessible text. The safest minimum gray for body text on white is **#767676** (4.54:1).

---

## Color-Only Communication (WCAG 1.3.3, 1.4.1)

Never convey information through color alone. Always pair color with at least one other visual indicator.

### Error states
- Required: color change (red border) **+** error icon **+** error text message
- Never: just a red border with no text explanation
- Error text should describe the issue: "Email address is required" not just "Error"

### Success states
- Required: color change (green) **+** checkmark icon **+** success text
- Never: just turning a field green

### Required fields
- Required: asterisk (*) or "Required" text label **+** optional color
- Never: just a red label or red asterisk without explanatory text (include a note: "* Required" at the top of the form)

### Status indicators
- Required: color **+** icon **+** text label
- Examples: "Active" with green dot + text, "Error" with red icon + text, "Pending" with yellow icon + text
- Never: colored dots alone without text labels

### Links within body text
- Required: underline or other visual indicator beyond color
- A link that's only distinguished by being blue fails for color-blind users
- Best practice: underline links in body text, or use a combination of color + underline + font weight

### Charts and data visualization
- Required: patterns, text labels, or legends alongside color
- Never: bar chart where the only way to distinguish categories is color
- Use: hatching patterns, data labels on each segment, clear legend with non-color distinctions

---

## Target Size (WCAG 2.5.8)

### Minimum sizes

| Context | Minimum target size |
|---|---|
| Desktop interactive elements | **24 x 24 CSS pixels** |
| Touch interfaces (mobile, tablet) | **44 x 44 CSS pixels** (recommended) |
| Inline text links in body copy | No minimum (exception) |

### Spacing rule
If a target is smaller than 24px, it can still pass if there's **24px of clear space** around it (no adjacent interactive elements within that space).

### Common violations
- Icon-only buttons at 16x16px without sufficient padding
- Close buttons in modals at 14-16px
- Checkbox/radio inputs at native 13x13px without enlarged hit area
- Small pagination dots without padding

### Design annotation
For small icons, document the required padding: "Icon 16px + 4px padding all sides = 24x24px target" or "Icon 16px + 14px padding = 44x44px touch target".

---

## Reduced Motion (WCAG 2.3.3)

- When `prefers-reduced-motion: reduce` is active, animations should be disabled or minimized
- Crossfade or instant transitions replace slide/swipe/bounce animations
- Auto-playing carousels stop rotating
- Parallax scrolling effects are disabled
- Loading spinners can remain (functional, not decorative)
- Design annotation should specify which animations are "essential" vs "decorative" — essential animations (like a progress bar filling) can remain; decorative transitions should stop

---

## When to Flag Contrast Issues in Annotations

During blueline fill, flag contrast concerns in the General Note card when:

1. Text appears on a photographic or gradient background (contrast may vary across the image)
2. Subtle UI borders are visible (light gray on white is a common failure)
3. Disabled state text is very faint (disabled elements still need 3:1 for the component boundary, though text content contrast is exempt)
4. Placeholder text in inputs appears too light
5. Focus indicators use a color that may not contrast against all page backgrounds

Note: actual contrast ratio computation should be done with a dedicated tool. The annotation should flag the concern and cite the relevant WCAG SC, not compute the ratio.
