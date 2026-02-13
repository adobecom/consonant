import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { Button } from '../../../../packages/components/src/button/index.js';
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';

// Import the actual hero background image from assets directory
// @ts-ignore - Vite handles image imports
import heroBackgroundImage from '../../../../packages/components/src/hero-marquee/assets/hero-background.png';

const meta: Meta = {
  title: 'Generated/Hero Marquee v4',
  id: 'hero-marquee-v4-9a237dba',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    heading: { control: 'text' },
    body: { control: 'text' },
    supplementalText: { control: 'text' },
    showSupplemental: { control: 'boolean' },
    showBackground: { control: 'boolean' },
    showMiloTag: { control: 'boolean' },
    miloTagText: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

const HeroMarquee = ({
  heading = 'Heading ipsum dolor sit.',
  body = 'Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna.',
  supplementalText = 'Body bold supplemental text (optional)',
  showSupplemental = false,
  showBackground = true,
  backgroundImageUrl = null,
  backgroundImageAlt = 'Hero background image',
  primaryButtonLabel = 'Learn more',
  secondaryButtonLabel = 'Learn more',
  showMiloTag = false,
  miloTagText = 'hero-mq-ctr',
}) => {
  // Use imported hero background image if no custom URL provided
  const bgImage = backgroundImageUrl || heroBackgroundImage;
  
  return html`
  <style>
    .c-hero-marquee {
      position: relative;
      width: 100%;
      background: var(--s2a-color-background-default, #ffffff);
      color: var(--s2a-color-content-default, #292929);
      overflow: hidden;
    }

    .c-hero-marquee__background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }

    .c-hero-marquee__background-alt {
      position: absolute;
      bottom: var(--s2a-spacing-md);
      left: var(--s2a-spacing-md);
      background: var(--s2a-color-transparent-black-64);
      color: var(--s2a-color-content-knockout);
      padding: var(--s2a-spacing-2xs) var(--s2a-spacing-xs);
      font-size: var(--s2a-typography-font-size-xs);
      font-family: var(--s2a-typography-font-family-adobe-clean);
      font-weight: var(--s2a-typography-font-weight-regular);
      border-radius: var(--s2a-border-radius-xs);
      z-index: 1;
    }

    .c-hero-marquee__spacer {
      height: var(--s2a-spacing-4xl, 64px);
    }

    .c-hero-marquee__container {
      position: relative;
      z-index: 1;
      max-width: 1200px;
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
    }

    .c-hero-marquee__heading {
      font-size: var(--s2a-typography-font-size-4xl);
      font-family:
        "adobe-clean-display",
        var(--s2a-typography-font-family-adobe-clean-display, "Adobe Clean Display"),
        "Inter",
        -apple-system,
        BlinkMacSystemFont,
        sans-serif;
      font-weight: var(--s2a-typography-font-weight-bold);
      line-height: var(--s2a-typography-line-height-4xl);
      margin: 0;
    }

    .c-hero-marquee__body {
      font-size: var(--s2a-typography-font-size-xl);
      font-family:
        "adobe-clean",
        var(--s2a-typography-font-family-adobe-clean, "Adobe Clean"),
        "Inter",
        -apple-system,
        BlinkMacSystemFont,
        sans-serif;
      font-weight: var(--s2a-typography-font-weight-regular);
      line-height: var(--s2a-typography-line-height-xl);
      margin: 0;
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
      font-size: var(--s2a-typography-font-size-xl);
      font-family:
        "adobe-clean",
        var(--s2a-typography-font-family-adobe-clean, "Adobe Clean"),
        "Inter",
        -apple-system,
        BlinkMacSystemFont,
        sans-serif;
      font-weight: var(--s2a-typography-font-weight-bold);
      line-height: var(--s2a-typography-line-height-xl);
      margin: 0;
    }

    .c-hero-marquee__milo-tag {
      position: absolute;
      top: var(--s2a-spacing-md);
      right: var(--s2a-spacing-md);
      background: var(--s2a-color-transparent-black-72);
      color: var(--s2a-color-content-knockout);
      padding: var(--s2a-spacing-2xs) var(--s2a-spacing-sm);
      font-size: var(--s2a-typography-font-size-xs);
      font-family: monospace;
      font-weight: var(--s2a-typography-font-weight-regular);
      border-radius: var(--s2a-border-radius-xs);
      z-index: 2;
    }
  </style>

  <div class="c-hero-marquee">
    ${showBackground
      ? html`
          <img
            class="c-hero-marquee__background"
            src="${bgImage}"
            alt="${backgroundImageAlt}"
          />
          <div class="c-hero-marquee__background-alt">
            ${backgroundImageAlt}
          </div>
        `
      : ''}
    
    ${showMiloTag
      ? html`<div class="c-hero-marquee__milo-tag">${miloTagText}</div>`
      : ''}

    <div class="c-hero-marquee__spacer"></div>

    <div class="c-hero-marquee__container">
      <div class="c-hero-marquee__content">
        <div class="c-hero-marquee__product-lockup">
          ${ProductLockup({
            productName: 'Adobe',
            showName: false,
            size: 'xl',
            tileVariant: 'default',
          })}
          ${ProductLockup({
            productName: 'Photoshop',
            showName: false,
            size: 'xl',
            tileVariant: 'default',
          })}
        </div>

        <h1 class="c-hero-marquee__heading">${heading}</h1>

        <p class="c-hero-marquee__body">${body}</p>

        <div class="c-hero-marquee__cta-wrap">
          ${Button({
            label: secondaryButtonLabel,
            size: '2xl',
            kind: 'primary',
            background: 'outlined',
          })}
          ${Button({
            label: primaryButtonLabel,
            size: '2xl',
            kind: 'accent',
            background: 'solid',
          })}
        </div>

        ${showSupplemental
          ? html`<p class="c-hero-marquee__supplemental">
              ${supplementalText}
            </p>`
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
    showBackground: true,
    showMiloTag: true,
    miloTagText: 'hero-mq-ctr',
    primaryButtonLabel: 'Learn more',
    secondaryButtonLabel: 'Learn more',
  },
  render: (args) => HeroMarquee(args),
};

export const WithoutBackground: Story = {
  args: {
    ...Default.args,
    showBackground: false,
  },
  render: (args) => HeroMarquee(args),
};

export const WithoutSupplemental: Story = {
  args: {
    ...Default.args,
    showSupplemental: false,
  },
  render: (args) => HeroMarquee(args),
};

export const WithoutMiloTag: Story = {
  args: {
    ...Default.args,
    showMiloTag: false,
  },
  render: (args) => HeroMarquee(args),
};

export const Minimal: Story = {
  args: {
    heading: 'Simple Hero Heading',
    body: 'A minimal hero with just the essentials.',
    showSupplemental: false,
    showBackground: false,
    showMiloTag: false,
    primaryButtonLabel: 'Get Started',
    secondaryButtonLabel: '',
  },
  render: (args) => html`
    <style>
      .c-hero-marquee {
        position: relative;
        width: 100%;
        background: var(--s2a-color-background-default, #ffffff);
        color: var(--s2a-color-content-default, #292929);
      }

      .c-hero-marquee__spacer {
        height: var(--s2a-spacing-4xl, 64px);
      }

      .c-hero-marquee__container {
        max-width: 1200px;
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
        font-size: var(--s2a-typography-font-size-4xl);
        font-family:
          "adobe-clean-display",
          var(--s2a-typography-font-family-adobe-clean-display, "Adobe Clean Display"),
          "Inter",
          -apple-system,
          BlinkMacSystemFont,
          sans-serif;
        font-weight: var(--s2a-typography-font-weight-bold);
        line-height: var(--s2a-typography-line-height-4xl);
        margin: 0;
      }

      .c-hero-marquee__body {
        font-size: var(--s2a-typography-font-size-xl);
        font-family:
          "adobe-clean",
          var(--s2a-typography-font-family-adobe-clean, "Adobe Clean"),
          "Inter",
          -apple-system,
          BlinkMacSystemFont,
          sans-serif;
        font-weight: var(--s2a-typography-font-weight-regular);
        line-height: var(--s2a-typography-line-height-xl);
        margin: 0;
      }

      .c-hero-marquee__cta-wrap {
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
            ${Button({
              label: args.primaryButtonLabel,
              size: '2xl',
              kind: 'accent',
              background: 'solid',
            })}
          </div>
        </div>
      </div>

      <div class="c-hero-marquee__spacer"></div>
    </div>
  `,
};