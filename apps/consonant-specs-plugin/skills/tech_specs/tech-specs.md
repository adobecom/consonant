# Tech Specs Skills

List and describe the available tech-specs skills for Figma design token workflows.

## Available Skills

| Skill | Description |
|---|---|
| `/grid` | Applies responsive 12-col (desktop) or 6-col (mobile) layout grid overlay based on frame width. #125EDE at 10% opacity. |
| `/grid-xl` | Applies a fixed 1920px centered 12-col grid with 8px gutters. For frames >= 1920px. |
| `/s2a-styles` | Applies S2A colors (fills + strokes) and text styles. Sets responsive typography mode (xl/lg/md/sm) based on frame width. |
| `/s2a-styles-all` | Everything in `/s2a-styles` plus dimension tokens: border radius, border width, spacing, layout, opacity, and blur. |
| `/frame-sizes` | Adds width annotation labels (e.g., "1920px") above selected frames. Inter Semi Bold 70px, white. |
| `/languages` | Generates a 6-language localization section (EN, DE, ZH, TH, AR, RTL) from existing English frames with translated text and instruction cards. |
| `/focus-indicators` | Adds blue (#1473E6) focus ring rectangles around all focusable elements in the selected frame. 2px stroke, 4px padding, corner radius matched per element type. |

## Instructions

When this skill is invoked, simply display the table above to the user. Do not execute any Figma operations.
