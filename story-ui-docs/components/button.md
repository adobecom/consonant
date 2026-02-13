# Button Component Usage

Always import and use our existing Button:

```js
import { Button } from '../../../../packages/components/src/button/index.js';

const primaryCta = Button({
  label: 'Learn more',
  size: '2xl',
  kind: 'accent',
  background: 'solid',
});
```

Rules:
- Never hand-roll `<button>` markup.
- Use `size='2xl'` for hero CTAs.
- For secondary CTAs, use `{ kind: 'primary', background: 'outlined' }`.
```
