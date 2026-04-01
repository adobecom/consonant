# Product Lockup Usage

```js
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';

const lockup = ProductLockup({
  label: 'Adobe Firefly',
  app: 'firefly',
  orientation: 'horizontal',
  styleVariant: 'label',
  context: 'on-light',
  width: 'hug',
  showIconStart: true,
  showIconEnd: true,
  iconSize: 'sm', // optional override (auto keeps md unless you opt into other sizes)
});
```

Guidelines:
- Use `orientation="vertical"` for stacked tiles (icon remains 24px per matt-atoms) and `orientation="horizontal"` for inline nav.
- Switch `styleVariant` between `label` (14px) and `eyebrow` (16px tracking) to match the Figma Style control.
- Use `context="on-dark"` whenever the lockup sits on a dark/knockout surface to flip the typography tokens.
- Set `width="fill"` when composing inside grid columns so the label truncates properly.
- Toggle `showIconStart` / `showIconEnd` to match the Figma "Show Icon" / "Show Icon End" controls.
- Override `iconSize` only when the layout explicitly calls for a different tile size; leave it undefined to follow the matt-atoms defaults (md for both orientations).
