# RouterMarqueeItem Usage

```js
import { RouterMarqueeItem } from '../../../../packages/components/src/router-marquee-item/index.js';

const tile = RouterMarqueeItem({
  label: 'PDF and productivity',
  app: 'acrobat-pro',
  active: true,
  progress: '100',
});
```

Guidelines:
- Wrap the component in a dark container when showing the knockout (default) state so the glass background reads correctly.
- Active state flips to a white tile (`active={true}`) — always pair it with the progress bar to signal playback.
- `body` defaults to `ProductLockup`. Pass your own `body` slot if the tile needs richer content, or use the `children` slot to add badges.
- For mobile layouts, simply constrain the parent width (the tile is width-agnostic) and keep `orientation="vertical"`.
