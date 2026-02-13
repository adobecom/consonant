import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { Button } from '../../../../packages/components/src/button/index.js';
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';
import heroBackground from '../../../../packages/components/src/hero-marquee/assets/hero-background.png';

const meta: Meta = {
  title: 'Generated/Hero Marquee Component',
  id: 'hero-marquee-component-a2a1b28f',
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
    body: { control: 'text' },
    supplementalText: { control: 'text' },
    showSupplemental: { control: 'boolean' },
    backgroundImage: { control: 'text' },
    backgroundImageAlt: { control: 'text' },
    showMiloTag: { control: 'boolean' },
    miloTagText: { control: 'text' },
    primaryButtonLabel: { control: 'text' },
    secondaryButtonLabel: { control: 'text' },
    lockupName: { control: 'text' },
    lockupVariant: {
      control: { type: 'select' },
      options: ['default', 'experience-cloud'],
    },
    usePlaceholderBackground: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

const renderHero = (args) => {
  const lockup = ProductLockup({
    productName: args.lockupName,
    showName: false,
    size: 'xl',
    tileVariant: args.lockupVariant,
  });

  const primaryCta = args.primaryButtonLabel
    ? Button({
        label: args.primaryButtonLabel,
        size: '2xl',
        kind: 'accent',
        background: 'solid',
      })
    : null;

  const secondaryCta = args.secondaryButtonLabel
    ? Button({
        label: args.secondaryButtonLabel,
        size: '2xl',
        kind: 'primary',
        background: 'outlined',
      })
    : null;

  const hasCustomBackground = typeof args.backgroundImage === 'string' && args.backgroundImage.length > 0;
  const shouldShowPlaceholder = args.usePlaceholderBackground !== false;
  const backgroundSrc = hasCustomBackground
    ? args.backgroundImage
    : shouldShowPlaceholder
      ? heroBackground
      : '';

  return html`
    <style>
      .c-hero-marquee {
        position: relative;
        width: 100%;
        min-height: 600px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: var(--s2a-color-background-default, #ffffff);
        color: var(--s2a-color-content-default, #292929);
        overflow: hidden;
      }

      .c-hero-marquee__background {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
      }

      .c-hero-marquee__background img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .c-hero-marquee__alt-badge {
        position: absolute;
        bottom: var(--s2a-spacing-xs, 8px);
        left: var(--s2a-spacing-xs, 8px);
        background: rgba(0, 0, 0, 0.75);
        color: var(--s2a-color-content-knockout, #ffffff);
        padding: var(--s2a-spacing-3xs, 4px) var(--s2a-spacing-2xs, 8px);
        font-size: var(--s2a-typography-font-size-sm, 14px);
        border-radius: var(--s2a-border-radius-sm, 8px);
      }

      .c-hero-marquee__spacer {
        height: var(--s2a-spacing-4xl, 64px);
      }

      .c-hero-marquee__container {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 1200px;
        padding: 0 var(--s2a-spacing-lg, 24px);
        display: flex;
        justify-content: center;
      }

      .c-hero-marquee__content {
        width: 100%;
        max-width: 800px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--s2a-spacing-md, 16px);
      }

      .c-hero-marquee__heading {
        font-size: var(--s2a-typography-font-size-5xl, 32px);
        line-height: var(--s2a-typography-line-height-5xl, 36px);
        text-align: center;
        margin: var(--s2a-spacing-md, 16px) 0 0 0;
      }

      .c-hero-marquee__body {
        font-size: var(--s2a-typography-font-size-2xl, 22px);
        line-height: var(--s2a-spacing-lg, 24px); /* Primitive: dedicated line-height alias pending */
        text-align: center;
        margin: var(--s2a-spacing-lg, 24px) 0 0 0;
      }

      .c-hero-marquee__supplemental {
        font-size: var(--s2a-typography-font-size-lg, 18px);
        text-align: center;
        margin-top: var(--s2a-spacing-md, 16px);
      }

      .c-hero-marquee__cta-wrap {
        display: flex;
        gap: var(--s2a-spacing-lg, 24px);
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: var(--s2a-spacing-lg, 24px);
      }

      .c-hero-marquee__milo-tag {
        position: absolute;
        top: var(--s2a-spacing-md, 16px);
        right: var(--s2a-spacing-md, 16px);
        background: rgba(0, 0, 0, 0.75);
        color: var(--s2a-color-content-knockout, #ffffff);
        padding: var(--s2a-spacing-3xs, 4px) var(--s2a-spacing-2xs, 8px);
        font-size: var(--s2a-typography-font-size-sm, 14px);
        border-radius: var(--s2a-border-radius-sm, 8px);
        font-family: monospace;
        z-index: 10;
      }
    </style>

    <div class="c-hero-marquee">
      ${backgroundSrc
        ? html`<div class="c-hero-marquee__background">
            <img src="${backgroundSrc}" alt="${args.backgroundImageAlt || 'Hero marquee background'}" />
            <div class="c-hero-marquee__alt-badge">
              Alt: ${args.backgroundImageAlt || 'Hero marquee background'}
            </div>
          </div>`
        : ''}

      ${args.showMiloTag ? html`<div class="c-hero-marquee__milo-tag">${args.miloTagText}</div>` : ''}

      <div class="c-hero-marquee__spacer"></div>

      <div class="c-hero-marquee__container">
        <div class="c-hero-marquee__content">
          ${lockup}
          <h1 class="c-hero-marquee__heading">${args.heading}</h1>
          <p class="c-hero-marquee__body">${args.body}</p>
          <div class="c-hero-marquee__cta-wrap">
            ${primaryCta}
            ${secondaryCta}
          </div>
          ${args.showSupplemental
            ? html`<p class="c-hero-marquee__supplemental">${args.supplementalText}</p>`
            : ''}
        </div>
      </div>

      <div class="c-hero-marquee__spacer"></div>
    </div>
  `;
};

export const Default: Story = {
  args: {
    heading: 'Heading ipsum dolor sit.',
    body: 'Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna.',
    supplementalText: 'Body bold supplemental text (optional)',
    showSupplemental: true,
    backgroundImage: heroBackground,
    backgroundImageAlt: 'Hero placeholder background',
    showMiloTag: true,
    miloTagText: 'hero-mq-ctr',
    primaryButtonLabel: 'Learn more',
    secondaryButtonLabel: 'Get started',
    lockupName: 'Adobe Creative Cloud',
    lockupVariant: 'default',
    usePlaceholderBackground: true,
  },
  render: renderHero,
};

export const WithoutBackground: Story = {
  args: {
    ...Default.args,
    backgroundImage: '',
    usePlaceholderBackground: false,
  },
  render: renderHero,
};

export const WithoutSupplemental: Story = {
  args: {
    ...Default.args,
    showSupplemental: false,
  },
  render: renderHero,
};

export const WithoutMiloTag: Story = {
  args: {
    ...Default.args,
    showMiloTag: false,
  },
  render: renderHero,
};

export const Minimal: Story = {
  args: {
    heading: 'Simple Hero Heading',
    body: 'A concise body text that explains the key value proposition.',
    supplementalText: '',
    showSupplemental: false,
    backgroundImage: '',
    backgroundImageAlt: 'Background image',
    showMiloTag: false,
    miloTagText: '',
    primaryButtonLabel: 'Get started',
    secondaryButtonLabel: '',
    lockupName: 'Adobe Express',
    lockupVariant: 'experience-cloud',
  },
  render: renderHero,
};
