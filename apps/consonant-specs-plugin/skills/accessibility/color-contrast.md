# Color Contrast

Contrast ratio requirements for text, non-text UI, and focus indicators. Use this as the primary reference when filling the Color Contrast card.

---

## Text Contrast (WCAG 1.4.3)

| Text type | Minimum ratio (AA) |
|---|---|
| Normal text (<18pt regular, <14pt bold) | **4.5:1** |
| Large text (18pt+ regular, or 14pt+ bold) | **3.0:1** |

**Size threshold:** 18pt regular (24px) or 14pt bold (18.66px). Above = "large text" at 3:1. Below = 4.5:1.

## Non-Text Contrast (WCAG 1.4.11)

| Element | Minimum ratio |
|---|---|
| Button/input borders | **3:1** against background |
| Meaningful icons | **3:1** against background |
| Focus indicators | **3:1** against adjacent colors |
| Chart elements (bars, lines) | **3:1** against background |
| Custom checkboxes, radios, switches | **3:1** against background |

**Exception:** Purely decorative elements (ornamental dividers, background patterns) have no contrast requirement.

## Focus Indicator Contrast (WCAG 2.4.11 / 2.4.13)

- **3:1 contrast** against adjacent colors
- Minimum **2px outline** (solid, not dotted)
- Must be visible against ALL backgrounds the component appears on
- In `forced-colors: active`, focus indicator uses system colors automatically

## Common Failures

| Color on white (#fff) | Ratio | Verdict | Fix |
|---|---|---|---|
| #aaaaaa | 2.32:1 | Fails | #767676 (4.54:1) |
| #999999 | 2.85:1 | Fails | #767676 (4.54:1) |
| #888888 | 3.54:1 | Fails normal text | #767676 (4.54:1) |
| #777777 | 4.48:1 | Barely fails | #757575 (4.60:1) |
| #42a5f5 (blue) | 2.81:1 | Fails | #1565c0 (6.08:1) |
| #ef5350 (red) | 3.13:1 | Fails | #c62828 (5.57:1) |

**Rule of thumb:** Colors in the 400-500 lightness range commonly fail. Shift to 600-700+ for accessible text. Safest minimum gray on white: **#767676**.

## Detection Heuristics for Figma

- Check all text nodes: extract fill color and parent background color, estimate contrast
- Flag text on photographic/gradient backgrounds — contrast varies across the image
- Check input/button borders: light gray borders on white are a common failure
- Disabled state text: exempt from text contrast but component boundary still needs 3:1
- Placeholder text in inputs: often too light

## Blueline Card Output

- Title = element name or color pair (e.g. "Body text on hero", "Input border")
- Desc = ratio finding and verdict (e.g. "Gray #999 on white — 2.85:1, fails 4.5:1 AA minimum")
- Notes = cite WCAG 1.4.3 for text, 1.4.11 for non-text
- Warnings = only for confirmed failures visible in the design
