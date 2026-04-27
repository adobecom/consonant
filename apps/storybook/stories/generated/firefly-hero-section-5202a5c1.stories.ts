import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../../../packages/components/src/product-lockup/index.js';
import '../../../../packages/components/src/button/index.js';

const meta: Meta = {
  title: 'Generated/Firefly Hero Section v6',
  id: 'firefly-hero-section-v6-5202a5c1',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div
      style="
        background: var(--s2a-color-background-dark, #1a1a1a);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
      "
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 720px;
          gap: 32px;
        "
      >
        <product-lockup
          label="Firefly"
          app="firefly"
          orientation="horizontal"
          style-variant="default"
          context="dark"
        ></product-lockup>

        <div
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          "
        >
          <h1
            style="
              font-size: var(--s2a-font-size-heading-xl, 3rem);
              font-weight: var(--s2a-font-weight-bold, 700);
              color: var(--s2a-color-text-on-dark, #ffffff);
              margin: 0;
              line-height: var(--s2a-line-height-heading, 1.2);
              letter-spacing: var(--s2a-letter-spacing-tight, -0.02em);
            "
          >
            Generative AI. Made for creators.
          </h1>

          <p
            style="
              font-size: var(--s2a-font-size-body-lg, 1.25rem);
              color: var(--s2a-color-text-secondary-on-dark, #b3b3b3);
              margin: 0;
              line-height: var(--s2a-line-height-body, 1.6);
              max-width: 560px;
            "
          >
            Use everyday language and Adobe Firefly generative AI to create
            extraordinary new content from reference images, vectors, and more.
          </p>
        </div>

        <div style="margin-top: 8px;">
          <s2a-button
            label="Start creating for free"
            intent="primary"
            context="dark"
            size="lg"
            @click=${() => console.log('CTA clicked')}
          ></s2a-button>
        </div>
      </div>
    </div>
  `,
};

export const Compact: Story = {
  render: () => html`
    <div
      style="
        background: var(--s2a-color-background-dark, #1a1a1a);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 64px 24px;
      "
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          max-width: 640px;
          gap: 24px;
        "
      >
        <product-lockup
          label="Firefly"
          app="firefly"
          orientation="horizontal"
          style-variant="default"
          context="dark"
        ></product-lockup>

        <h1
          style="
            font-size: var(--s2a-font-size-heading-lg, 2.25rem);
            font-weight: var(--s2a-font-weight-bold, 700);
            color: var(--s2a-color-text-on-dark, #ffffff);
            margin: 0;
            line-height: var(--s2a-line-height-heading, 1.2);
          "
        >
          Imagine, create, and iterate with generative AI
        </h1>

        <p
          style="
            font-size: var(--s2a-font-size-body-md, 1rem);
            color: var(--s2a-color-text-secondary-on-dark, #b3b3b3);
            margin: 0;
            line-height: var(--s2a-line-height-body, 1.6);
          "
        >
          Turn your wildest ideas into images, vectors, videos, and so much
          more with Adobe Firefly.
        </p>

        <div style="margin-top: 8px;">
          <s2a-button
            label="Get started"
            intent="primary"
            context="dark"
            size="md"
          ></s2a-button>
        </div>
      </div>
    </div>
  `,
};