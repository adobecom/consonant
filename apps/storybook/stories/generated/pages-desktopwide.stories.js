import { html } from 'lit';
import { Button } from '../../../../packages/components/src/button/index.js';
import { RouterMarqueeItem } from '../../../../packages/components/src/router-marquee-item/index.js';
import { ElasticCard } from '../../../../packages/components/src/elastic-card/index.js';
import { Media } from '../../../../packages/components/src/media/index.js';

export default {
  title: 'Pages/Desktop Wide',
  parameters: { layout: 'fullscreen' },
};
The story composes three sections matching the "Desktop Wide" S2A Foundations frame:

1. **Hero** — full-bleed knockout background with radial gradient accent, title (Adobe Clean Display Black, `clamp(2.5rem, 5vw, 3.5rem)`), body copy, and two CTAs (`outlined on-dark` + `solid on-dark`).

2. **RouterMarquee strip** — white `background-default` strip with five `RouterMarqueeItem` entries; the first is `active` with a progress bar, the rest at rest.

3. **ElasticCard carousel** — `background-subtle` section with a section heading and five `ElasticCard` tiles in a horizontally-scrolling flex row, each with a `3:4` `Media` slot.

Plus two isolated stories — `HeroOnly` and `MarqueeStrip` — for focused review.

All tokens include fallbacks (`var(--token, hardcoded)`), no custom element tags, no invented token names, and no `intent="accent"` on dark surfaces.