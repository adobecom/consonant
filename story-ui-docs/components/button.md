# Button Component Usage

Button implements matt-atoms design (Figma node 141-53460). Import and use:

```js
import { Button } from '../../../../packages/components/src/button/index.js';

const primaryCta = Button({
  label: 'Learn more',
  background: 'solid',
});
```

**Props**: `label`, `background` (solid | outlined), `state` (default | disabled).

Rules:
- Never hand-roll `<button>` markup.
- Use `background='solid'` for primary CTAs.
- Use `background='outlined'` for secondary CTAs.
