# IconButton Component Usage

IconButton implements matt-atoms design (Figma node 2142-53869). Icon-only circular button. Import and use:

```js
import { IconButton } from '../../../../packages/components/src/icon-button/index.js';

// Pause control
IconButton({
  ariaLabel: 'Pause',
  icon: 'pause',
  background: 'solid',
});
```

**Props**: `ariaLabel` (required), `icon` (Phosphor name: pause, play, x, etc.), `background` (solid | outlined | transparent), `size` (lg | md), `state` (default | disabled), `tone` (default | knockout).

**Note**: Pause icon is from Figma (matt-atoms). Other icons (play, etc.) use Phosphor — load `@phosphor-icons/web/bold` for those.

Rules:
- Never create custom icon-only buttons.
- Use for play/pause, close, menu toggles, and other icon-only actions.
- `ariaLabel` is required (no visible text).
