# RouterCard Usage

```js
import { RouterCard } from '../../../../packages/components/src/router-card/index.js';

const tile = RouterCard({
  label: 'Creativity and design',
  app: 'experience-cloud',
  title: 'Adobe Express',
  body: 'Create standout content with quick actions and guided templates.',
  state: 'resting',
  mediaSrc: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  href: '#express',
});
```

Guidelines:
- Mirrors matt-atoms component set `.RouterCard` (node `4006-461133`). Keep `data-state="resting|expanded|mobile"` in markup so CSS variants match the Figma axes.
- **Hover = expansion.** Cards rendered with `state="resting"` automatically interpolate to the expanded (knockout) visuals on `:hover` / `:focus-visible`. Use that for Milo router hero interactions and reserve `state="expanded"` for forced states.
- Header must use the shared `ProductLockup` component; `RouterCard` wires this up automatically, but if you roll custom markup make sure icon sizes follow the `md` (24px) spec and flip `context` when you step into `expanded` / `mobile` states.
- Media defaults to a 3:4 portrait crop. Override via `mediaAspect` (`"16:9"`, `"4:3"`, `"1:1"`) or pass a full `mediaTemplate` (picture/video/iframe) when you need art-directed sources.
- `state="expanded"` and `state="mobile"` swap into the knockout surface token set (dark background, white typography) and enable the blurred glass effect. Pair these states with knock-out imagery or overlays so copy stays readable.
- Set `showCaret=false` whenever the trailing affordance is replaced with a custom `actionTemplate` (icon button, CTA chip, etc.).
- Wrap the card in a semantic `<a>` for router navigation. If you’re toggling panels instead, render it as a `<button>` and wire `onClick` to the tab logic. Add `aria-label` (or visible `title`) so screen readers announce the destination.
- For dense routers on desktop, stack one `RouterCard` (`state="expanded"`) next to two `Card` / `RouterMarqueeItem` instances. Mobile screens typically swap to a single `state="mobile"` card per view.
