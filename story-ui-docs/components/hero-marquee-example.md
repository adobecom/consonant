# Hero Marquee Example (Reference)

```js
import { html } from 'lit';
import { Button } from '../../../../packages/components/src/button/index.js';
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';
import heroBackground from '../../../../packages/components/src/hero-marquee/assets/hero-background.png';

export const HeroMarqueeExample = () => html`
  <style>
    .c-hero-marquee {
      background: var(--s2a-color-background-default, #fff);
      color: var(--s2a-color-content-default, #292929);
    }
  </style>
  <div class="c-hero-marquee">
    ${ProductLockup({ productName: 'Adobe', showName: false, size: 'xl', tileVariant: 'default' })}
    ${Button({ label: 'Learn more', size: '2xl', kind: 'accent', background: 'solid' })}
  </div>
`;
```
