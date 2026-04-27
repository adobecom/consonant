import { html } from 'lit';
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';
import { RichContent } from '../../../../packages/components/src/rich-content/index.js';
import { Button } from '../../../../packages/components/src/button/index.js';

export default {
  title: 'Examples/Firefly Hero',
};

export const FireflyHero = () => html`
  <section
    style="
      background: var(--s2a-color-background-knockout, #000);
      padding: var(--s2a-spacing-3xl, 48px) var(--s2a-spacing-lg, 24px);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s2a-spacing-lg, 24px);
      min-height: 480px;
      box-sizing: border-box;
    "
  >
    ${ProductLockup({
      app: 'firefly',
      label: 'Adobe Firefly',
      orientation: 'horizontal',
      styleVariant: 'label',
      context: 'on-dark',
      width: 'hug',
      showIconStart: true,
      showIconEnd: false,
      iconSize: 'md',
    })}

    ${RichContent({
      theme: 'on-dark',
      density: 'regular',
      justifyContent: 'start',
      measure: 'narrow',
      title: 'Imagine. Create. Inspire.',
      body: 'Generate stunning images, vectors, and creative content with Adobe Firefly — AI designed for creators.',
      showEyebrow: false,
      showActions: true,
      actions: html`
        ${Button({
          label: 'Get started',
          background: 'solid',
          context: 'on-dark',
          size: 'md',
        })}
      `,
    })}
  </section>
`;