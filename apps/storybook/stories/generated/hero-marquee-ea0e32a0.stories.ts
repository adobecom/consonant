import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../../../packages/components/src/button/index.js';
import '../../../../packages/components/src/product-lockup/index.js';

const meta: Meta = {
  title: 'Generated/Hero Marquee v2',
  id: 'hero-marquee-v2-ea0e32a0',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    heading: { control: 'text' },
    body: { control: 'text' },
    supplementalText: { control: 'text' },
    showSupplemental: { control: 'boolean' },
    backgroundImage: { control: 'text' },
    showMiloTag: { control: 'boolean' },
    miloTagText: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    heading: 'Heading ipsum dolor sit.',
    body: 'Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna.',
    supplementalText: 'Body bold supplemental text (optional)',
    showSupplemental: true,
    backgroundImage: 'https://picsum.photos/1920/1080?random=1',
    showMiloTag: true,
    miloTagText: 'hero-mq-ctr',
  },
  render: (args) => html`
    <style>
      .c-hero-marquee {
        position: relative;
        width: 100%;
        min-height: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--s2a-color-background-default, #ffffff);
        overflow: hidden;
      }

      .c-hero-marquee__background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
      }

      .c-hero-marquee__background-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .c-hero-marquee__container {
        position: relative;
        z-index: 1;
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        padding: var(--s2a-spacing-4xl, 64px) var(--s2a-spacing-lg, 24px);
      }

      .c-hero-marquee__content {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--s2a-spacing-lg, 24px);
      }

      .c-hero-marquee__product-lockup {
        display: flex;
        gap: 15px;
        align-items: center;
      }

      .c-hero-marquee__heading {
        font-size: var(--s2a-typography-font-size-5xl, 32px);
        line-height: var(--s2a-typography-line-height-5xl, 36px);
        color: var(--s2a-color-content-default, #292929);
        text-align: center;
        margin: 0;
        font-weight: 600;
      }

      .c-hero-marquee__body {
        font-size: var(--s2a-typography-font-size-2xl, 22px);
        line-height: var(--s2a-spacing-lg, 24px); /* Primitive: awaiting typography line-height alias */
        color: var(--s2a-color-content-default, #292929);
        text-align: center;
        margin: 0;
      }

      .c-hero-marquee__cta-wrap {
        display: flex;
        gap: var(--s2a-spacing-lg, 24px);
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: var(--s2a-spacing-md, 16px);
      }

      .c-hero-marquee__supplemental {
        font-size: var(--s2a-typography-font-size-lg, 18px);
        color: var(--s2a-color-content-default, #292929);
        text-align: center;
        font-weight: 700;
        margin: 0;
      }

      .c-hero-marquee__milo-tag {
        position: absolute;
        top: var(--s2a-spacing-md, 16px);
        right: var(--s2a-spacing-md, 16px);
        background-color: rgba(0, 0, 0, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        font-size: 12px;
        border-radius: 4px;
        z-index: 2;
      }

      .c-hero-marquee__alt-badge {
        position: absolute;
        bottom: var(--s2a-spacing-md, 16px);
        left: var(--s2a-spacing-md, 16px);
        background-color: rgba(0, 0, 0, 0.7);
        color: #ffffff;
        padding: 4px 8px;
        font-size: 12px;
        border-radius: 4px;
        z-index: 1;
      }
    </style>

    <div class="c-hero-marquee">
      ${args.backgroundImage ? html`
        <div class="c-hero-marquee__background">
          <img 
            class="c-hero-marquee__background-image"
            src="${args.backgroundImage}" 
            alt="Hero background imagery"
          />
          <div class="c-hero-marquee__alt-badge">Alt: Hero background imagery</div>
        </div>
      ` : ''}

      ${args.showMiloTag ? html`
        <div class="c-hero-marquee__milo-tag">${args.miloTagText}</div>
      ` : ''}

      <div class="c-hero-marquee__container">
        <div class="c-hero-marquee__content">
          <div class="c-hero-marquee__product-lockup">
            <s2a-product-lockup 
              product-name="Adobe" 
              size="xl" 
              tile-variant="icon-only"
            ></s2a-product-lockup>
            <s2a-product-lockup 
              product-name="Photoshop" 
              size="xl" 
              tile-variant="icon-only"
            ></s2a-product-lockup>
          </div>

          <h1 class="c-hero-marquee__heading">${args.heading}</h1>

          <p class="c-hero-marquee__body">${args.body}</p>

          <div class="c-hero-marquee__cta-wrap">
            <s2a-button 
              label="Learn more" 
              size="2xl" 
              kind="primary" 
              background="outlined"
            ></s2a-button>
            <s2a-button 
              label="Learn more" 
              size="2xl" 
              kind="accent" 
              background="solid"
            ></s2a-button>
          </div>

          ${args.showSupplemental ? html`
            <p class="c-hero-marquee__supplemental">${args.supplementalText}</p>
          ` : ''}
        </div>
      </div>
    </div>
  `,
};

export const WithoutBackground: Story = {
  args: {
    heading: 'Heading ipsum dolor sit.',
    body: 'Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna.',
    supplementalText: 'Body bold supplemental text (optional)',
    showSupplemental: true,
    backgroundImage: null,
    showMiloTag: true,
    miloTagText: 'hero-mq-ctr',
  },
  render: (args) => Default.render!(args),
};

export const WithoutSupplemental: Story = {
  args: {
    heading: 'Heading ipsum dolor sit.',
    body: 'Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna.',
    showSupplemental: false,
    backgroundImage: 'https://picsum.photos/1920/1080?random=4',
    showMiloTag: true,
    miloTagText: 'hero-mq-ctr',
  },
  render: (args) => Default.render!(args),
};

export const WithoutMiloTag: Story = {
  args: {
    heading: 'Heading ipsum dolor sit.',
    body: 'Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna.',
    supplementalText: 'Body bold supplemental text (optional)',
    showSupplemental: true,
    backgroundImage: 'https://picsum.photos/1920/1080?random=5',
    showMiloTag: false,
  },
  render: (args) => Default.render!(args),
};

export const Minimal: Story = {
  args: {
    heading: 'Heading ipsum dolor sit.',
    body: 'Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna.',
    showSupplemental: false,
    backgroundImage: null,
    showMiloTag: false,
  },
  render: (args) => html`
    <style>
      .c-hero-marquee {
        position: relative;
        width: 100%;
        min-height: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--s2a-color-background-default, #ffffff);
        overflow: hidden;
      }

      .c-hero-marquee__container {
        position: relative;
        z-index: 1;
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        padding: var(--s2a-spacing-4xl, 64px) var(--s2a-spacing-lg, 24px);
      }

      .c-hero-marquee__content {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--s2a-spacing-lg, 24px);
      }

      .c-hero-marquee__heading {
        font-size: var(--s2a-typography-font-size-5xl, 32px);
        line-height: var(--s2a-typography-line-height-5xl, 36px);
        color: var(--s2a-color-content-default, #292929);
        text-align: center;
        margin: 0;
        font-weight: 600;
      }

      .c-hero-marquee__body {
        font-size: var(--s2a-typography-font-size-2xl, 22px);
        line-height: var(--s2a-spacing-lg, 24px); /* Primitive: awaiting typography line-height alias */
        color: var(--s2a-color-content-default, #292929);
        text-align: center;
        margin: 0;
      }

      .c-hero-marquee__cta-wrap {
        display: flex;
        gap: var(--s2a-spacing-lg, 24px);
        align-items: center;
        justify-content: center;
        margin-top: var(--s2a-spacing-md, 16px);
      }
    </style>

    <div class="c-hero-marquee">
      <div class="c-hero-marquee__container">
        <div class="c-hero-marquee__content">
          <h1 class="c-hero-marquee__heading">${args.heading}</h1>
          <p class="c-hero-marquee__body">${args.body}</p>
          <div class="c-hero-marquee__cta-wrap">
            <s2a-button 
              label="Learn more" 
              size="2xl" 
              kind="accent" 
              background="solid"
            ></s2a-button>
          </div>
        </div>
      </div>
    </div>
  `,
};