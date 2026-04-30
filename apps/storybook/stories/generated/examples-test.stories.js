import { html } from 'lit';
import { Button } from '../../../../packages/components/src/button/index.js';
import { AppIcon } from '../../../../packages/components/src/app-icon/index.js';
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';

export default {
  title: 'Examples/Test',
};

export const Test = () => html`
  <section
    style="
      background: var(--s2a-color-background-default, #fff);
      padding: var(--s2a-spacing-xl, 32px);
      display: flex;
      flex-direction: column;
      gap: var(--s2a-spacing-lg, 24px);
      box-sizing: border-box;
    "
  >
    <h1
      style="
        color: var(--s2a-color-content-title, #000);
        font-size: var(--s2a-font-size-xl, 1.25rem);
        font-weight: var(--s2a-font-weight-title, 900);
        margin: 0;
      "
    >
      Component Test
    </h1>

    <div style="display: flex; gap: var(--s2a-spacing-sm, 12px); align-items: center;">
      ${AppIcon({ app: 'acrobat-pro', size: 'md' })}
      ${ProductLockup({ label: 'Acrobat Pro', app: 'acrobat-pro', orientation: 'horizontal' })}
    </div>

    <div style="display: flex; gap: var(--s2a-spacing-sm, 12px);">
      ${Button({ label: 'Primary', background: 'solid', context: 'on-light', size: 'md' })}
      ${Button({ label: 'Outlined', background: 'outlined', context: 'on-light', size: 'md' })}
      ${Button({ label: 'Ghost', background: 'transparent', context: 'on-light', size: 'md' })}
    </div>
  </section>
`;