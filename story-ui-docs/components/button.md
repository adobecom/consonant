# Button Component Usage

Button implements matt-atoms design (Figma node 141-53460). Import and use:

```js
import { Button } from '../../../../packages/components/src/button/index.js';

const primaryCta = Button({
  label: 'Learn more',
  background: 'solid',
});
```

**Props**: `label`, `background` (solid | outlined | transparent), `size` (lg | md), `state` (default | disabled), `tone` (default | knockout | inverse), `showElementEnd` (boolean).

**Note**: When using `showElementEnd: true`, load Phosphor Icons bold: `import '@phosphor-icons/web/bold'` (or add the stylesheet to your page).

Rules:
- Never hand-roll `<button>` markup.
- Use `background='solid'` for primary CTAs.
- Use `background='outlined'` for secondary CTAs.
- Use `background='transparent'` for tertiary/ghost actions.
- Use `tone='knockout'` for buttons on dark backgrounds.
