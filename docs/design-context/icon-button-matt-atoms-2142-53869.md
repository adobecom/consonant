# IconButton Component Design Context (matt-atoms)

**Source**: Figma file `matt-atoms` (WVHzjcD3hdioe7t82ZyhAW), node `2142:53869`  
**Retrieved**: Via Figma REST API (`scripts/fetch-figma-node.js`) and `scripts/download-figma-images.js`  
**Guardrail reminder**: Use semantic tokens (`--s2a-spacing-*`, `--s2a-color-*`, etc.) only. No primitives without a `Primitive:` comment.

---

## 1. Component Type

**COMPONENT_SET** named **IconButton** — icon-only circular button (no text label).

---

## 2. Component Variant Axes (from Figma)

| Axis | Type | Default | Options |
|------|------|---------|---------|
| **Background** | VARIANT | `solid` | `solid`, `outlined`, `transparent` |
| **Intent** | VARIANT | `primary` | `primary`, `secondary` |
| **Size** | VARIANT | `lg` | `lg`, `md` |
| **State** | VARIANT | `default` | `default`, `hover`, `active`, `disabled`, `focus` |
| **Tone** | VARIANT | `default` | `default`, `knockout` |

**Note**: IconButton has only `default` and `knockout` tone (no `inverse` vs. the text Button).

---

## 3. HTML Structure

```html
<button
  class="c-icon-button"
  data-background="solid|outlined|transparent"
  data-size="lg|md"
  data-state="default|disabled"
  data-tone="default|knockout"
  type="button"
  aria-label="[Action description]"
>
  <span class="c-icon-button__icon" aria-hidden="true">
    <svg><!-- Icon (e.g. Pause, Play, etc.) --></svg>
  </span>
</button>
```

**Notes:**
- `aria-label` is required (no visible text).
- `data-state="hover"`, `data-state="active"`, `data-state="focus"` are inferred via CSS (`:hover`, `:active`, `:focus-visible`).
- Icon is configurable (Figma shows "Pause" as example instance).

---

## 4. Layout & Spacing (from Figma)

| Property | Size `lg` | Size `md` | Semantic token |
|----------|-----------|-----------|----------------|
| padding | 8px all sides | 4px all sides | `--s2a-spacing-xs` (8px); `--s2a-spacing-2xs` (4px) |
| itemSpacing (gap) | 8px | 4px | `--s2a-spacing-xs`; `--s2a-spacing-2xs` |
| layout | horizontal, center align | same | — |
| border-radius | 32px | 32px | `--s2a-border-radius-lg` (32px) |
| stroke width | 1px | 1px | `--s2a-border-width-sm` |

**Figma bound variables:**
- `padding*` → VariableID:3:60 (lg) / 3:61 (md)
- `itemSpacing` → VariableID:3:60 (lg) / 3:62 (md)
- `individualStrokeWeights` → VariableID:2:111
- `rectangleCornerRadii` → VariableID:2:94

---

## 5. Typography

IconButton has no typography. Icon stroke uses design token for color; icon size is bound to VariableID:3:56.

---

## 6. Colors & Design Token Mapping (Figma Variables)

Figma uses bound variables from S2A Component Color Theme (VariableCollectionId:6:116, mode 6:3). Map to S2A semantic tokens:

| Figma usage | Semantic token | Notes |
|-------------|----------------|-------|
| Background fill (solid default) | `--s2a-color-background-knockout` | Black / primary CTA |
| Background fill (solid hover/active) | Gray-900 / Gray-800 | Primitive: no semantic yet for solid-button hover/active |
| Background (outlined/transparent default) | `transparent` | — |
| Background (outlined hover) | `--s2a-color-transparent-black-08` | 8% black overlay |
| Background (outlined active) | `--s2a-color-transparent-black-12` | 12% black overlay |
| Stroke (outlined default) | `--s2a-color-content-default` | Black border |
| Stroke (outlined knockout) | `--s2a-color-content-knockout` | White border on dark bg |
| Icon/content color (default tone) | `--s2a-color-content-default` | Black icon |
| Icon/content color (knockout tone) | `--s2a-color-content-knockout` | White icon on dark bg |
| Disabled background | `--s2a-color-background-disabled` | Light gray |
| Disabled content/border | `--s2a-color-content-disabled` / `--s2a-color-border-disabled` | — |
| Focus ring | `--s2a-color-focus-ring` | Blue outline |

**Variable IDs (from node):**
- Fills: VariableID:2081:244
- Strokes: VariableID:2081:237
- Icon stroke: VariableID:2142:53935
- Background blur (transparent): VariableID:2140:53773

---

## 7. Icon Specs

| Property | Size `lg` | Size `md` |
|----------|-----------|-----------|
| Icon container | 24×24px | 24×24px (or 16×16 for md) |
| Stroke weight | ~1.94px (1px at 1x) | same |
| Stroke cap/join | ROUND | ROUND |

**Icon swap**: Component uses `INSTANCE` of icon components (e.g. Pause). Icon is swappable via slot or prop.

---

## 8. Effects

- **Transparent variant**: `BACKGROUND_BLUR` (radius 32, bound to VariableID:2140:53773) on some instances.
- **Solid/outlined**: No blur.

---

## 9. Component Variants (States × Background × Tone × Size)

### Background variants

- **solid**: Filled background (black default, gray-900 hover, gray-800 active)
- **outlined**: Transparent fill, 1px border
- **transparent**: Transparent fill, no border; optional `BACKGROUND_BLUR` effect

### State behavior

- **default**: Base styling
- **hover**: Darker/lighter backgrounds, overlays
- **active**: Pressed state (e.g. gray-800 for solid)
- **disabled**: Muted colors, `cursor: not-allowed`
- **focus**: Focus ring via `:focus-visible` (box-shadow)

### Tone

- **default**: Black icon/border on light background
- **knockout**: White icon/border on dark (e.g. on dark media)

---

## 10. Size Specs (from Figma)

| Size | padding | cornerRadius | height/width (approx) |
|------|---------|--------------|------------------------|
| lg | 8px | 32px | 40px |
| md | 4px | 32px | 24px |

---

## 11. Focus Ring (align with button.css)

```css
.c-icon-button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 var(--s2a-spacing-3xs, 2px) var(--s2a-color-background-default, #ffffff),
    0 0 0 var(--s2a-spacing-2xs, 4px) var(--s2a-color-focus-ring, var(--s2a-color-blue-900, #3b63fb));
}
```

---

## 12. Screenshot

Screenshot saved to `docs/design-context/icon-button-matt-atoms-2142-53869-screenshot.png`. Visual reference shows:

- Solid (default, hover, active, disabled) in default and knockout tones
- Outlined (default, hover, active, disabled) in default and knockout tones
- Transparent (default, hover, active, disabled) in default and knockout tones
- Sizes: `lg` and `md`
- Icon: Pause (example instance)

---

## 13. Figma MCP Status

Figma MCP (`get_design_context`) was not available in this session. Data was retrieved via:

1. **REST API** (`scripts/fetch-figma-node.js`) — node tree, variant axes, bound variables, layout, fills, strokes
2. **Image export** (`scripts/download-figma-images.js`) — PNG screenshot
3. **Project tokens** (`packages/tokens/json/`) — semantic token mappings

---

## 14. Token Checklist (Guardrail)

- Use `--s2a-spacing-*`, `--s2a-color-*`, `--s2a-border-radius-*`, `--s2a-border-width-*` only.
- For solid hover/active, use `--s2a-color-gray-900` / `--s2a-color-gray-800` with `Primitive:` comments until semantic aliases exist.
- Avoid primitives without `Primitive:` comments.
