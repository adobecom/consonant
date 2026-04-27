import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../../../packages/components/src/product-lockup/index.js';
import '../../../../packages/components/src/button/index.js';

const meta: Meta = {
  title: 'Generated/Firefly Hero Section v5',
  id: 'firefly-hero-section-v5-4a823226',
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
    <div style="
      background: var(--s2a-color-background-dark, #1a1a2e);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
    ">
      <div style="
        max-width: 720px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 32px;
      ">
        <product-lockup
          label="Firefly"
          app="firefly"
          orientation="horizontal"
          style-variant="default"
          context="dark"
        ></product-lockup>

        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        ">
          <h1 style="
            font-family: var(--s2a-font-family-heading, 'Adobe Clean', sans-serif);
            font-size: var(--s2a-font-size-heading-xl, 3rem);
            font-weight: var(--s2a-font-weight-bold, 700);
            color: var(--s2a-color-text-on-dark, #ffffff);
            margin: 0;
            line-height: var(--s2a-line-height-heading, 1.15);
            letter-spacing: var(--s2a-letter-spacing-tight, -0.02em);
          ">
            Create stunning visuals with generative AI
          </h1>

          <p style="
            font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
            font-size: var(--s2a-font-size-body-lg, 1.25rem);
            color: var(--s2a-color-text-secondary-on-dark, #b0b0c0);
            margin: 0;
            line-height: var(--s2a-line-height-body, 1.6);
            max-width: 560px;
          ">
            Use simple text prompts to generate extraordinary images, transform text styles, and explore limitless creative possibilities.
          </p>
        </div>

        <div style="margin-top: 8px;">
          <s2a-button
            label="Start creating for free"
            intent="primary"
            context="dark"
            size="lg"
          ></s2a-button>
        </div>
      </div>
    </div>
  `,
};

export const Compact: Story = {
  render: () => html`
    <div style="
      background: var(--s2a-color-background-dark, #1a1a2e);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
    ">
      <div style="
        max-width: 600px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        gap: 24px;
      ">
        <product-lockup
          label="Firefly"
          app="firefly"
          orientation="horizontal"
          style-variant="default"
          context="dark"
        ></product-lockup>

        <h1 style="
          font-family: var(--s2a-font-family-heading, 'Adobe Clean', sans-serif);
          font-size: var(--s2a-font-size-heading-lg, 2.25rem);
          font-weight: var(--s2a-font-weight-bold, 700);
          color: var(--s2a-color-text-on-dark, #ffffff);
          margin: 0;
          line-height: var(--s2a-line-height-heading, 1.15);
        ">
          Imagine it. Type it. See it.
        </h1>

        <p style="
          font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
          font-size: var(--s2a-font-size-body-md, 1rem);
          color: var(--s2a-color-text-secondary-on-dark, #b0b0c0);
          margin: 0;
          line-height: var(--s2a-line-height-body, 1.6);
        ">
          Adobe Firefly brings generative AI directly into your creative workflows.
        </p>

        <div style="margin-top: 8px;">
          <s2a-button
            label="Try Firefly free"
            intent="primary"
            context="dark"
            size="md"
          ></s2a-button>
        </div>
      </div>
    </div>
  `,
};