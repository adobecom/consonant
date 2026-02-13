import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../../../packages/components/src/button/index.js';
import '../../../../packages/components/src/product-lockup/index.js';

const meta: Meta = {
  title: 'Generated/Hero Marquee',
  id: 'hero-marquee-d1fa1011',
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

const HeroMarqueeTemplate = ({
  heading = 'Heading ipsum dolor sit.',
  body = 'Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna.',
  supplementalText = 'Body bold supplemental text (optional)',
  showSupplemental = false,
  backgroundImage = '',
  backgroundImageAlt = 'Alt text (background image)',
  showMiloTag = true,
  miloTagText = 'hero-mq-ctr',
  primaryButtonLabel = 'Learn more',
  secondaryButtonLabel = 'Learn more',
  productIcon1 = 'https://picsum.photos/56/56?random=10',
  productIcon1Alt = 'Adobe',
  productIcon2 = 'https://picsum.photos/56/56?random=11',
  productIcon2Alt = 'Photoshop',
}) => html`
  <style>
    .c-hero-marquee {
      position: relative;
      width: 100%;
      min-height: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: var(--s2a-color-background-default, #ffffff);
      color: var(--s2a-color-content-default, #292929);
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

    .c-hero-marquee__background img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .c-hero-marquee__background-alt {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(219, 0, 255, 0.9);
      color: white;
      padding: var(--s2a-spacing-xs, 8px) var(--s2a-spacing-md, 16px);
      font-size: 12px;
      text-align: center;
    }

    .c-hero-marquee__spacer {
      height: var(--s2a-spacing-4xl, 64px);
    }

    .c-hero-marquee__container {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 0 var(--s2a-spacing-lg, 24px);
    }

    .c-hero-marquee__content {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--s2a-spacing-md, 16px);
      text-align: center;
    }

    .c-hero-marquee__product-lockup {
      display: flex;
      gap: 15px;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--s2a-spacing-md, 16px);
    }

    .c-hero-marquee__heading {
      font-size: var(--s2a-typography-font-size-5xl, 32px);
      line-height: var(--s2a-typography-line-height-5xl, 36px);
      font-weight: 700;
      margin: 0;
      color: var(--s2a-color-content-default, #292929);
    }

    .c-hero-marquee__body {
      font-size: var(--s2a-typography-font-size-2xl, 22px);
      line-height: var(--s2a-spacing-lg, 24px); /* Primitive: awaiting typography line-height alias */
      margin: 0;
      color: var(--s2a-color-content-default, #292929);
    }

    .c-hero-marquee__cta-wrap {
      display: flex;
      gap: var(--s2a-spacing-lg, 24px);
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: var(--s2a-spacing-lg, 24px);
    }

    .c-hero-marquee__supplemental {
      font-size: var(--s2a-typography-font-size-lg, 18px);
      font-weight: 700;
      margin: 0;
      margin-top: var(--s2a-spacing-md, 16px);
      color: var(--s2a-color-content-default, #292929);
    }

    .c-hero-marquee__milo-tag {
      position: absolute;
      top: 0;
      right: 0;
      background-color: rgba(59, 99, 251, 0.9);
      color: white;
      padding: var(--s2a-spacing-xs, 8px) var(--s2a-spacing-md, 16px);
      font-size: 12px;
      z-index: 2;
    }
  </style>

  <div class="c-hero-marquee" data-variant="default">
    ${backgroundImage
      ? html`
          <div class="c-hero-marquee__background">
            <img src="${backgroundImage}" alt="${backgroundImageAlt}" />
            <div class="c-hero-marquee__background-alt">${backgroundImageAlt}</div>
          </div>
        `
      : ''}
    
    ${showMiloTag
      ? html`<div class="c-hero-marquee__milo-tag">Milo: ${miloTagText}</div>`
      : ''}

    <div class="c-hero-marquee__spacer"></div>

    <div class="c-hero-marquee__container">
      <div class="c-hero-marquee__content">
        <div class="c-hero-marquee__product-lockup">
          <s2a-product-lockup size="xl" .icon="${productIcon1}" .alt="${productIcon1Alt}"></s2a-product-lockup>
          <s2a-product-lockup size="xl" .icon="${productIcon2}" .alt="${productIcon2Alt}"></s2a-product-lockup>
        </div>

        <h1 class="c-hero-marquee__heading">${heading}</h1>

        <p class="c-hero-marquee__body">${body}</p>

        <div class="c-hero-marquee__cta-wrap">
          <s2a-button
            kind="primary"
            background="outlined"
            size="2xl"
            label="${secondaryButtonLabel}"
          ></s2a-button>
          <s2a-button
            kind="accent"
            background="solid"
            size="2xl"
            label="${primaryButtonLabel}"
          ></s2a-button>
        </div>

        ${showSupplemental
          ? html`<p class="c-hero-marquee__supplemental">${supplementalText}</p>`
          : ''}
      </div>
    </div>

    <div class="c-hero-marquee__spacer"></div>
  </div>
`;

export const Default: Story = {
  args: {
    heading: 'Heading ipsum dolor sit.',
    body: 'Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna.',
    supplementalText: 'Body bold supplemental text (optional)',
    showSupplemental: true,
    backgroundImage: 'https://picsum.photos/1600/600?random=1',
    backgroundImageAlt: 'Alt text (background image)',
    showMiloTag: true,
    miloTagText: 'hero-mq-ctr',
    primaryButtonLabel: 'Learn more',
    secondaryButtonLabel: 'Learn more',
    productIcon1: 'https://picsum.photos/56/56?random=10',
    productIcon1Alt: 'Adobe',
    productIcon2: 'https://picsum.photos/56/56?random=11',
    productIcon2Alt: 'Photoshop',
  },
  render: (args) => HeroMarqueeTemplate(args),
};

export const WithoutBackground: Story = {
  args: {
    ...Default.args,
    backgroundImage: '',
  },
  render: (args) => HeroMarqueeTemplate(args),
};

export const WithoutSupplemental: Story = {
  args: {
    ...Default.args,
    showSupplemental: false,
  },
  render: (args) => HeroMarqueeTemplate(args),
};

export const WithoutMiloTag: Story = {
  args: {
    ...Default.args,
    showMiloTag: false,
  },
  render: (args) => HeroMarqueeTemplate(args),
};

export const Minimal: Story = {
  args: {
    heading: 'Heading ipsum dolor sit.',
    body: 'Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna.',
    showSupplemental: false,
    backgroundImage: '',
    showMiloTag: false,
    primaryButtonLabel: 'Learn more',
    secondaryButtonLabel: '',
  },
  render: (args) => html`
    <style>
      .c-hero-marquee {
        position: relative;
        width: 100%;
        min-height: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: var(--s2a-color-background-default, #ffffff);
        color: var(--s2a-color-content-default, #292929);
      }

      .c-hero-marquee__spacer {
        height: var(--s2a-spacing-4xl, 64px);
      }

      .c-hero-marquee__container {
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        padding: 0 var(--s2a-spacing-lg, 24px);
      }

      .c-hero-marquee__content {
        max-width: 800px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--s2a-spacing-md, 16px);
        text-align: center;
      }

      .c-hero-marquee__heading {
        font-size: var(--s2a-typography-font-size-5xl, 32px);
        line-height: var(--s2a-typography-line-height-5xl, 36px);
        font-weight: 700;
        margin: 0;
        color: var(--s2a-color-content-default, #292929);
      }

      .c-hero-marquee__body {
        font-size: var(--s2a-typography-font-size-2xl, 22px);
        line-height: var(--s2a-spacing-lg, 24px);
        margin: 0;
        color: var(--s2a-color-content-default, #292929);
      }

      .c-hero-marquee__cta-wrap {
        display: flex;
        gap: var(--s2a-spacing-lg, 24px);
        align-items: center;
        justify-content: center;
        margin-top: var(--s2a-spacing-lg, 24px);
      }
    </style>

    <div class="c-hero-marquee">
      <div class="c-hero-marquee__spacer"></div>

      <div class="c-hero-marquee__container">
        <div class="c-hero-marquee__content">
          <h1 class="c-hero-marquee__heading">${args.heading}</h1>
          <p class="c-hero-marquee__body">${args.body}</p>
          <div class="c-hero-marquee__cta-wrap">
            <s2a-button
              kind="accent"
              background="solid"
              size="2xl"
              label="${args.primaryButtonLabel}"
            ></s2a-button>
          </div>
        </div>
      </div>

      <div class="c-hero-marquee__spacer"></div>
    </div>
  `,
};