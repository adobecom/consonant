# Product Lockup Usage

```js
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';

const lockup = ProductLockup({
  productName: 'Adobe Creative Cloud',
  showName: false,
  size: 'xl',
  tileVariant: 'default',
});
```

Guidelines:
- Always use ProductLockup for hero/product tiles.
- Pass `tileVariant` instead of injecting custom images.
- Do not inline logos or recreate tile markup.
