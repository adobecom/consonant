import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../../../packages/components/src/product-lockup/index.js';
import '../../../../packages/components/src/button/index.js';

const meta: Meta = {
  title: 'Generated/Firefly Hero Section v7',
  id: 'firefly-hero-section-v7-e4e038ec',
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
          max-width: 720px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
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
              font-family: var(--s2a-font-family-heading, 'Adobe Clean', sans-serif);
              font-size: var(--s2a-font-size-heading-xl, 3rem);
              font-weight: var(--s2a-font-weight-bold, 700);
              color: var(--s2a-color-text-on-dark, #ffffff);
              margin: 0;
              line-height: 1.15;
            "
          >
            Imagine beyond your wildest dreams
          </h1>

          <p
            style="
              font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
              font-size: var(--s2a-font-size-body-lg, 1.25rem);
              color: var(--s2a-color-text-secondary-on-dark, #b3b3b3);
              margin: 0;
              max-width: 560px;
              line-height: 1.5;
            "
          >
            Use generative AI to create extraordinary images, transform text into stunning visuals, and bring your creative vision to life — all powered by Adobe Firefly.
          </p>
        </div>

        <div style="margin-top: 8px;">
          <s2a-button
            label="Start creating for free"
            intent="primary"
            context="dark"
            size="large"
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
          max-width: 600px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
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
            font-family: var(--s2a-font-family-heading, 'Adobe Clean', sans-serif);
            font-size: var(--s2a-font-size-heading-lg, 2.25rem);
            font-weight: var(--s2a-font-weight-bold, 700);
            color: var(--s2a-color-text-on-dark, #ffffff);
            margin: 0;
            line-height: 1.2;
          "
        >
          Create with generative AI
        </h1>

        <p
          style="
            font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
            font-size: var(--s2a-font-size-body-md, 1rem);
            color: var(--s2a-color-text-secondary-on-dark, #b3b3b3);
            margin: 0;
            line-height: 1.5;
          "
        >
          Generate stunning images from text prompts with Adobe Firefly's creative AI models.
        </p>

        <div style="margin-top: 8px;">
          <s2a-button
            label="Try Firefly free"
            intent="primary"
            context="dark"
            size="medium"
          ></s2a-button>
        </div>
      </div>
    </div>
  `,
};