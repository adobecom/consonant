# S2 Icon Color Inheritance in Figma Components

When you build a component that uses an S2 icon via an Instance Swap property, you cannot rely on fill overrides inside the icon instance to carry the icon's color. Figma does not reliably transfer variable binding overrides to a newly swapped icon. The result: the icon appears in its library default color (usually black/`content/default`) regardless of the context it lives in.

## The problem

```
MyComponent (COMPONENT)
  └─ S2_Icon_UIArrow_N (INSTANCE) ← Icon property wired here
       └─ Frame
            └─ iconPrimary (VECTOR, fill bound to content/knockout)
```

When a designer swaps `UIArrow` → `UIPlus`, the `iconPrimary` fill override stays tied to the UIArrow node ID — it does not transfer to UIPlus's `iconPrimary`. The icon renders black on a dark background and disappears.

## The fix — the "Icon color" mask pattern

This is the same pattern the S2 Button component uses. The color lives **outside** the swappable icon in a rectangle whose fill never changes during swaps.

### Layer order inside the icon slot (top = front in Figma layer panel)

```
[Front]  Icon color  (RECTANGLE, 12×12)   ← fill bound to color variable
[Back]   Frame       (FRAME, 12×12, isMask=true, clipsContent=true,
                      layoutMode=HORIZONTAL, CENTER×CENTER)
           └─ icon instance (S2_Icon_*_N, layoutSizing=FILL×FILL)
                └─ iconPrimary (VECTOR, opaque fill — acts as mask alpha)
```

### How it works

1. `Frame (isMask=true)` is a Figma mask. Its children's combined alpha defines what is revealed.
2. The `iconPrimary` vector is opaque (any solid fill) — it makes the mask fully opaque in the icon shape.
3. `Icon color` sits in front. Figma reveals it only where the mask behind it is opaque — which is exactly the icon shape.
4. The icon's fill color is now purely the `Icon color` rect's fill variable. Swapping the icon changes the shape; the rect stays untouched.

### Plugin implementation (figma_execute)

```js
// For each component variant:
// 1. Switch to NONE layout if the component uses auto-layout
variant.layoutMode = 'NONE';

// 2. Create mask frame (back, lowest z-order = appended first)
const maskFrame = figma.createFrame();
maskFrame.name = 'Frame';
maskFrame.resize(ICON_SIZE, ICON_SIZE);
maskFrame.clipsContent = true;
maskFrame.isMask = true;
maskFrame.fills = [];
// Auto-layout centers the icon inside the mask frame — critical for swap correctness
maskFrame.layoutMode = 'HORIZONTAL';
maskFrame.primaryAxisAlignItems = 'CENTER';
maskFrame.counterAxisAlignItems = 'CENTER';
maskFrame.primaryAxisSizingMode = 'FIXED';
maskFrame.counterAxisSizingMode = 'FIXED';
maskFrame.paddingLeft = maskFrame.paddingRight = maskFrame.paddingTop = maskFrame.paddingBottom = 0;
variant.appendChild(maskFrame);

// IMPORTANT: set FILL sizing on the icon BEFORE appending so it fills the mask frame
iconInstance.layoutSizingHorizontal = 'FILL';
iconInstance.layoutSizingVertical = 'FILL';
iconInstance.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
// Clear the icon's background fill — if left as SOLID WHITE it makes the entire
// 12×12 area opaque, revealing the color rect as a square instead of just the icon shape.
// Only the iconPrimary vector's fill should create mask alpha.
iconInstance.fills = [];
// Force CENTER alignment — different icons nest their glyph at different sizes
// (e.g. UIAdd Size=200 wraps a Size50 glyph at 8×8). CENTER ensures any inner
// glyph is centered in the slot regardless of its dimensions.
iconInstance.primaryAxisAlignItems = 'CENTER';
iconInstance.counterAxisAlignItems = 'CENTER';
maskFrame.appendChild(iconInstance);  // icon moves inside
maskFrame.x = (COMPONENT_SIZE - ICON_SIZE) / 2;
maskFrame.y = (COMPONENT_SIZE - ICON_SIZE) / 2;

// 3. Create Icon color rect (front, highest z-order = appended last)
const colorRect = figma.createRectangle();
colorRect.name = 'Icon color';
colorRect.resize(ICON_SIZE, ICON_SIZE);
colorRect.x = maskFrame.x;
colorRect.y = maskFrame.y;
colorRect.fills = [figma.variables.setBoundVariableForPaint(
  { type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 },
  'color',
  iconColorVariable   // e.g., content/knockout for dark bg, content/default for light bg
)];
variant.appendChild(colorRect);

// 4. Keep the Instance Swap property wired to the icon instance
iconInstance.componentPropertyReferences = { mainComponent: 'Icon#xxxx' };
```

### Choosing the right color variable per state

| Context | Token | Use when |
|---|---|---|
| Icon on dark background | `s2a/color/content/knockout` | Button bg is dark/black |
| Icon on light background | `s2a/color/content/default` | Button bg is white/light |
| Icon on brand background | `s2a/color/content/knockout` | Button bg is Adobe red/brand |

### Centering and sizing after swap

Without the FILL/STRETCH setup, a swapped icon will appear **tiny and off-center**. What happens:

- Figma places the new icon instance at its own native position within the mask frame
- If the icon's `iconPrimary` vector occupies a small portion of its container (e.g., a 4×4 "+" in a 12×12 frame), it appears tiny
- The mask reveals only that small shape, making the icon look broken

The fix — `layoutSizingHorizontal/Vertical = 'FILL'` on the icon instance — forces it to always fill the mask frame on every swap. The mask frame's auto-layout (CENTER×CENTER) guarantees the icon is visually centered even if its internal content has different proportions.

These properties survive instance swaps because they live on the **instance node**, not the main component.

### What NOT to do

```js
// ❌ Override iconPrimary fill inside the icon instance — breaks on swap
iconPrimary.fills = [{ type: 'SOLID', ... }];
iconPrimary.setBoundVariableForPaint(..., colorVar);

// ❌ Set fills directly on the icon INSTANCE level — does not affect iconPrimary
iconInstance.fills = [{ type: 'SOLID', ... }];
```

## References

- First applied in `MasterPromoCTA/ButtonWrap` (MWPW-194618)
- Button component (`.Button/Core/Primary`, page `↳ Button [ Published ]`) — authoritative reference for this pattern in S2A
- `VariableID:6:81` — `s2a/color/content/knockout` (white for dark backgrounds)
- `VariableID:6:82` — `s2a/color/content/default` (dark for light backgrounds)
