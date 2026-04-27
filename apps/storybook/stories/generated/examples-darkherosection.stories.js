import { html } from 'lit';
import { Button } from '../../../../packages/components/src/button/index.js';

export default {
  title: 'Examples/Dark Hero Section',
};

export const DarkHeroSection = () => html`
  <section
    style="
      background: var(--s2a-color-background-knockout, #000);
      padding: var(--s2a-spacing-3xl, 48px) var(--s2a-spacing-lg, 24px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--s2a-spacing-lg, 24px);
      min-height: 400px;
      box-sizing: border-box;
    "
  >
    <h1
      style="
        color: var(--s2a-color-content-knockout, #fff);
        font-size: var(--s2a-font-size-xl, 1.25rem);
        font-weight: var(--s2a-font-weight-title, 900);
        margin: 0;
        text-align: center;
      "
    >
      Create without limits
    </h1>

    <p
      style="
        color: var(--s2a-color-content-knockout, #fff);
        font-size: var(--s2a-font-size-md, 1rem);
        font-weight: var(--s2a-font-weight-body, 400);
        margin: 0;
        text-align: center;
        max-width: 480px;
      "
    >
      Explore the full suite of Adobe creative tools — all in one place.
    </p>

    ${Button({
      label: 'Get started',
      background: 'solid',
      context: 'on-dark',
      size: 'md',
    })}
  </section>
`;