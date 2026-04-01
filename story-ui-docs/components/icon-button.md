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

**Props**: `ariaLabel` (required), `icon` (string → legacy Phosphor name or a Lit template such as `<sp-icon-play>`), `context` (on-light | on-dark), `background` (solid | outlined | transparent), `size` (md | lg), `state` (default | hover | active | focus | disabled).

**Note**: Strings still map to Phosphor icons for backward compatibility, but the preferred path is Spectrum 2 icons. Run `npm run icons:fetch Play Pause Close` to download official SVGs into `packages/components/src/icon-button/assets/`, or import the Spectrum Web Components directly in Storybook examples (see `apps/storybook/stories/IconButton.stories.js`).

Rules:
- Never create custom icon-only buttons.
- Use for play/pause, close, menu toggles, and other icon-only actions.
- `ariaLabel` is required (no visible text).
- Set `context="on-dark"` when the control lives on dark photography/video.
