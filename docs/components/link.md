# Link Component Reference (ELI5)

This page mirrors the in-Figma "Link — Usage/Anatomy/Accessibility/Visual Spec" boards so designers and engineers have the same friendly walkthrough outside of the file `svi0B0G925V2XG0yX0DDaz (node 2987:4193)`.

## Overview

Links move people somewhere else—another page, section, or document. Our Link component is a skinny horizontal auto-layout frame with a label on the left and an optional trailing icon on the right. Tokens drive every visual change (context, emphasis, state), so nobody hand-styles colors or spacing.

### Quick facts

- **What it does**: Navigational text CTA for light/dark surfaces.
- **Anatomy**: Label + optional trailing icon + focus ring background (when needed).
- **Variants**: `State` (default · hover · active · focus), `Context` (on-light · on-dark), `Emphasis` (default · subtle), `Kind` (action · text), plus props for icon visibility/content.
- **Token contract**: All spacing, typography, and color tokens are semantic/component aliases. If you ever see a primitive, add the required `Primitive:` comment and file a token request.

## Onboarding (Explain It Like I'm 5)

1. **Pick the right primitive** – If the interaction changes the URL or opens a new document, use Link. If it triggers something inline (submit, open dialog), use Button (WCAG separates the behaviors).
2. **Choose the outfit** – Set Context (light/dark background), Emphasis (default CTA vs subtle inline link), Kind (action vs text), and State. Toggle icon on/off and pick the Spectrum icon if needed.
3. **Drop it into layout** – Place the variant, resize horizontally only. Auto layout + tokens handle spacing. Update the label; the icon “just works” because its sibling rectangle inherits the same color token.
4. **Check tokens** – Inspect Dev Mode to confirm bindings stay semantic (`--s2a-link-color-content-*`, `--s2a-spacing-*`). Never paste hardcoded colors/spacing in code.
5. **Document extras outside the component** – If you need callouts, duplicate the frame on the “Link — Annotations” page and add arrows there so MCP/Story UI never ingest sticky notes.

## Usage Guidance

### Do

- Use short, specific text (“Download Creative Cloud”, “Learn more about Stock”).
- Let the underline/contrast stay unless the CTA context already provides a strong affordance.
- Keep one action per line; stack multiple Links only if they’re semantically different destinations.
- Pair Link + icon only when the icon reinforces the destination (e.g., external/share/download).

### Don't

- Don’t trigger dialogs, toggles, or submits—that’s Button territory.
- Don’t use vague labels (“Click here”, “Learn more”) without surrounding context; WCAG 2.4.4/2.4.9 require clear destinations.
- Don’t mix on-light tokens on a dark surface (or vice versa). Pick the correct Context variant instead.
- Don’t delete the focus ring background; WCAG 2.4.11 requires visible focus.

## Anatomy & Layout

| # | Layer | Notes |
|---|-------|-------|
| 1 | Root frame | Horizontal auto layout, gap `8px` (`--s2a-spacing-xs`). Horizontal padding `--s2a-spacing-sm`, vertical padding `--s2a-spacing-xxs`.
| 2 | `Call to Action` text | Typography token swaps based on `Kind` (action uses bold 14/18 token, text uses inline-link 16/20 token). Color inherits from semantic content token per context.
| 3 | `Icon color` rectangle | Invisible sibling with the same color token as the label; forces Spectrum icon to inherit the label color.
| 4 | `end-icon` frame | Spectrum icon instance, never recolored directly. Replace via instance swap.
| 5 | `Focus Ring Background` | Appears only in `State=focus`. Uses `--s2a-link-border-focus` (light) or `--s2a-link-border-focus-on-dark` (dark). Keep it under the label/icon.

### Screenshot references

Export these annotated frames (Specs-style) and keep them in `docs/case-study/screenshots/`:

- `link-usage.png` – DO/DON'T panel with numbered steps.
- `link-anatomy.png` – Layer breakdown with callouts 1–5 above.
- `link-tokens.png` – Token bindings table (colors, typography, spacing, focus ring).

## Variant & Property Reference

| Property | Values | When to use |
|----------|--------|-------------|
| `State` | default · hover · active · focus | Visual feedback + accessible focus indicator.
| `Context` | on-light · on-dark | Select the version that contrasts with the background.
| `Emphasis` | default · subtle | Default = CTA-level contrast. Subtle = inline text link.
| `Kind` | action · text | Action feels button-like (uppercase/bold). Text blends with body copy.
| `Has Icon` | true · false | Trail an icon when it adds meaning (download, external).
| `Icon` | Spectrum icon swap | Choose the actual icon asset. Color inherits automatically.
| `Label` | any text | Describe destination; keep it short.

## Token Callouts

- **Spacing**: `gap = --s2a-spacing-xs`, `padding-x = --s2a-spacing-sm`, `padding-y = --s2a-spacing-xxs`. All tied to the spacing scale.
- **Typography**: `Kind=action` → `--s2a-typography-body-cta` (bold 14/18). `Kind=text` → `--s2a-typography-inline-link` (regular 16/20, slight negative tracking).
- **Colors**:
  - `Context=on-light, Emphasis=default` → `--s2a-link-color-content-accent-default`.
  - `Context=on-light, Emphasis=subtle` → `--s2a-link-color-content-subtle`.
  - `Context=on-dark` → `--s2a-link-color-content-on-dark-*` tokens (default/subtle matching state).
  - State-specific hover/active tokens already defined in the “State token map” table in Figma; keep that chart updated as the single source of truth.
- **Focus**: `--s2a-link-border-focus` (light) / `--s2a-link-border-focus-on-dark`. Meets WCAG 2.4.11 area + contrast.
- **Icon**: `Icon color` rectangle shares the label token, so the Spectrum icon never needs manual fills.

## Accessibility (POUR)

- **Perceivable**: Text contrast meets WCAG 1.4.3, focus ring meets WCAG 2.4.11. Leave the underline or equivalent cue for inline links.
- **Operable**: `<a href>` handles keyboard automatically. Custom elements must add `role="link"`, support Enter/Space, and keep pointer events accessible (WCAG 2.1.1).
- **Understandable**: Label describes destination (WCAG 2.4.4/2.4.9). Provide `aria-label` or hidden context if multiple identical links appear.
- **Robust**: Use semantic HTML anchor. When in a SPA, ensure router links still expose `role="link"` and focus order remains sequential. Add `aria-current="page"` for active nav links.

## Workflow Reminder (Figma → MCP → Storybook)

1. Clean the component set (no sticky notes) and update Dev Mode description with the Overview + Usage bullets above.
2. Run the Codex/Claude "Component Doc" skill with the guardrail reminder and `Figma-Console-Safe-Execution` if the node is large.
3. Convert MCP output into Storybook docs (Docs → Usage → Anatomy → Properties) and this markdown.
4. Export annotated PNGs and embed them here or in Storybook so engineers can see the Specs-style visuals.
5. In code, run `rg "--s2a-" packages/components/link` to confirm only semantic/component tokens remain; primitives require inline `/* Primitive: ... */` notes and follow-up token work.

## Annotation Pattern (Specs-style)

- Maintain a dedicated "Link — Docs" frame outside the published component that mirrors the Nathan Curtis “Specs” plugin layout: screenshot, layer stack, token list.
- Use numbered circles and arrows; match the `.sheet header` typography so visuals stay consistent with the rest of the DS documentation.
- Store exports under `docs/case-study/screenshots/` (or project-specific folder) for easy re-use in decks, Storybook, or onboarding.
- When variants change, update the annotation frames first, then regenerate screenshots to keep everything synced.

---
_Last updated: 2026-03-23_
