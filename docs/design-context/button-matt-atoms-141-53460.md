# Button Component Design Context (matt-atoms)

**Source**: Figma file `matt-atoms` (WVHzjcD3hdioe7t82ZyhAW), node `141:53460`  
**Retrieved**: Via Figma REST API (Figma MCP not available in session)  
**Guardrail reminder**: Use semantic tokens (`--s2a-spacing-*`, `--s2a-color-*`, etc.) only. No primitives without a `Primitive:` comment.

---

## 1. Component Type

**COMPONENT_SET** named "Button" with multiple axes.

---

## 2. Component Variant Axes (from Figma)

| Axis | Type | Default | Options |
|------|------|---------|---------|
| **Background** | VARIANT | `solid` | `solid`, `outlined`, `transparent` |
| **Intent** | VARIANT | `primary` | `primary` |
| **Size** | VARIANT | `lg` | `lg`, `md` |
| **State** | VARIANT | `default` | `default`, `hover`, `active`, `disabled`, `focus` |
| **Tone** | VARIANT | `default` | `default`, `knockout`, `inverse` |
| **Show Element End** | BOOLEAN | `true` | Optional label-end element (CaretDown/chevron) |

---

## 3. HTML Structure

```html
<button
  class="c-button"
  data-background="solid|outlined|transparent"
  data-size="lg|md"
  data-state="default|disabled"
  data-tone="default|knockout|inverse"
  type="button"
>
  <span class="c-button__label">Label</span>
  <!-- Optional: only when Show Element End is true -->
  <span class="c-button__end" aria-hidden="true">
    <svg><!-- CaretDown chevron --></svg>
  </span>
</button>
```

**Notes:**
- `data-state="hover"`, `data-state="active"`, `data-state="focus"` are inferred via CSS (`:hover`, `:active`, `:focus-visible`), not set in markup.
- The **CaretDown** icon is optional and controlled by the "Show Element End" prop.

---

## 4. Layout & Spacing (from Figma)

| Property | Size `lg` | Size `md` | Semantic token |
|----------|-----------|-----------|----------------|
| padding | 12px vertical, 24px horizontal | 4px vertical, 12px horizontal | `--s2a-spacing-sm`, `--s2a-spacing-lg` (lg); `--s2a-spacing-2xs`, `--s2a-spacing-sm` (md) |
| itemSpacing (gap) | 8px | 8px | `--s2a-spacing-xs` |
| layout | horizontal, center align | same | — |
| border-radius | 32px | 16px (transparent) / 32px (solid/outlined) | `--s2a-border-radius-lg` (32px); `--s2a-border-radius-md` (16px for md) |

**Outlined** buttons: subtract border width from padding to preserve visual size.

---

## 5. Typography (from Figma)

| Property | Value | Token |
|----------|-------|-------|
| fontFamily | Adobe Clean | `--s2a-font-family-default` |
| fontStyle | Bold | `--s2a-font-weight-adobe-clean-bold` (700) |
| fontSize | 14px | `--s2a-font-size-sm` |
| lineHeight | 16px | `--s2a-font-line-height-2xs` |
| letterSpacing | 0 | — |
| textAlign | center | — |

---

## 6. Colors & Design Token Mapping (Figma Variables)

Figma uses bound variables. Map to S2A semantic tokens:

| Figma usage | Semantic token | Notes |
|-------------|----------------|-------|
| Background fill (solid default) | `--s2a-color-background-knockout` | Black / primary CTA |
| Background fill (solid hover/active) | Gray-900 / Gray-800 | Primitive: no semantic yet for solid-button hover/active |
| Background (outlined/transparent default) | `transparent` | — |
| Background (outlined hover) | `--s2a-color-transparent-black-08` | 8% black overlay |
| Background (outlined active) | `--s2a-color-transparent-black-12` | 12% black overlay |
| Stroke (outlined default) | `--s2a-color-content-default` | Black border |
| Content color (default tone) | `--s2a-color-content-default` | Black text |
| Content color (knockout tone) | `--s2a-color-content-knockout` | White text on dark bg |
| Disabled background | `--s2a-color-background-disabled` | Light gray |
| Disabled content/border | `--s2a-color-content-disabled` / `--s2a-color-border-disabled` | — |
| Focus ring | `--s2a-color-focus-ring` | Blue outline |
| Border width | `--s2a-border-width-sm` (1px) | — |

---

## 7. Component Variants (States × Background × Tone × Size)

### Background variants

- **solid**: filled background (black default, gray-900 hover, gray-800 active)
- **outlined**: transparent fill, 1px border
- **transparent**: transparent fill, no border; some use `BACKGROUND_BLUR` effect

### State behavior

- **default**: base styling
- **hover**: darker/lighter backgrounds, overlays
- **active**: pressed state (e.g. gray-800 for solid)
- **disabled**: muted colors, `cursor: not-allowed`
- **focus**: focus ring via `:focus-visible` (box-shadow)

### Tone

- **default**: black text/border on light
- **knockout**: white text on dark (e.g. outlined on dark media)
- **inverse**: for use on dark surfaces (light bg, dark text)

---

## 8. Focus Ring (from existing button.css)

```css
.c-button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 var(--s2a-spacing-3xs, 2px) var(--s2a-color-background-default, #ffffff),
    0 0 0 var(--s2a-spacing-2xs, 4px) var(--s2a-color-focus-ring, var(--s2a-color-blue-900, #3b63fb));
}
```

---

## 9. Size Specs (from Figma)

| Size | paddingTop/Bottom | paddingLeft/Right | cornerRadius | height (approx) |
|------|-------------------|-------------------|--------------|-----------------|
| lg | 12px | 24px | 32px | 40px |
| md | 4px (transparent) / 12px | 12px | 16px (transparent) / 32px | 24px |

---

## 10. Screenshot

Screenshot saved to `docs/design-context/button-matt-atoms-141-53460-screenshot.png`. Visual reference shows:

- Solid (default, hover, active, disabled) in default and inverse tones
- Outlined (default, hover, active, disabled) in default and knockout tones
- Transparent (default, hover, active, disabled) in default and knockout tones
- Sizes: `lg` and `md`
- Optional CaretDown chevron on label end

---

## 11. Gaps vs Current Implementation

| Item | Figma | Current `button.css` |
|------|-------|----------------------|
| Background variant | `solid`, `outlined`, `transparent` | `solid`, `outlined` only |
| Size | `lg`, `md` | Only lg (2xl) |
| Tone | `default`, `knockout`, `inverse` | Implicit (knockout for solid) |
| Optional end icon | CaretDown via "Show Element End" | Not supported |
| Transparent variant | Exists with optional blur | Not implemented |

---

## 12. Token Checklist (Guardrail)

- Use `--s2a-spacing-*`, `--s2a-color-*`, `--s2a-border-radius-*`, `--s2a-font-*`, `--s2a-border-width-*` only.
- For solid hover/active, current code uses `--s2a-color-gray-900` / `--s2a-color-gray-800` with `Primitive:` comments until semantic aliases exist.
- Avoid primitives without `Primitive:` comments.
