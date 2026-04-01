# Button Component Usage

Button implements matt-atoms design (Figma node 141-53460). Import and use:

```js
import { Button } from '../../../../packages/components/src/button/index.js';

const primaryCta = Button({
  label: 'Learn more',
  background: 'solid',
});
```

**Props**: `label`, `intent` (primary | accent), `background` (solid | outlined | transparent), `context` (on-light | on-dark), `size` (md | xs), `state` (default | hover | active | focus | disabled), `showIconStart`, `showIconEnd`, `iconStart`, `iconEnd`, `onClick`.

**Note**: Icon slots accept either a Lit template (preferred) or a legacy Phosphor icon name. Import Spectrum 2 icons via `@spectrum-web-components/icons-workflow` (or run `npm run icons:fetch Download Folder`) and pass the rendered template into `iconStart` / `iconEnd`.

Rules:
- Never hand-roll `<button>` markup.
- `intent="primary"` + `background="solid"` is the default CTA; `intent="accent"` exposes the blue hero CTA.
- Use `context="on-dark"` when the button sits on a dark background (focus ring + color inversion handled automatically).
- `background="outlined"` is used for secondary CTAs; `background="transparent"` is reserved for tertiary/ghost actions.
- Prefer `size="xs"` only for dense layouts (toolbars, cards); default to `size="md"` everywhere else.
