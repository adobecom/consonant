import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { Button } from '../../../../packages/components/src/button/index.js';
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';

// Import the actual hero background image - Vite will process this correctly
// @ts-ignore - Vite handles image imports
import heroBackgroundImage from '../../../../packages/components/src/hero-marquee/assets/hero-background.png';

const meta: Meta = {
  title: 'Generated/Hero Marquee v3',
  id: 'hero-marquee-v3-7ddd635d',
  tags: ['autodocs'],
  parameters: { 
    layout: 'fullscreen',
  },
  argTypes: {
    heading: { control: 'text' },
    body: { control: 'text' },
    supplementalText: { control: 'text' },
    showSupplemental: { control: 'boolean' },
    showMiloTag: { control: 'boolean' },
    miloTagText: { control: 'text' },
    backgroundImage: { control: 'text' },
    backgroundImageAlt: { control: 'text' },
    primaryButtonLabel: { control: 'text' },
    secondaryButtonLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

const HeroMarquee = ({
  heading = 'Heading ipsum dolor sit.',
  body = 'Body ipsum dolor sit amet, consectetur adipiscing, sed do tempor incididunt ut labore et dolore magna.',
  supplementalText = 'Body bold supplemental text (optional)',
  showSupplemental = false,
  backgroundImage = null,
  backgroundImageAlt = 'Hero background image',
  showMiloTag = false,
  miloTagText = 'hero-mq-ctr',
  primaryButtonLabel = 'Learn more',
  secondaryButtonLabel = 'Learn more',
}) => {
  // Use default hero background if no custom image provided
  const bgImage = backgroundImage || heroBackgroundImage;
  
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
        background: var(--s2a-color-background-default);
        color: var(--s2a-color-content-default);
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
        bottom: var(--s2a-spacing-md);
        left: var(--s2a-spacing-md);
        background: var(--s2a-color-transparent-black-64);
        color: var(--s2a-color-content-knockout);
        padding: var(--s2a-spacing-2xs) var(--s2a-spacing-md);
        font-size: var(--s2a-typography-font-size-xs);
        font-family: var(--s2a-typography-font-family-adobe-clean);
        border-radius: var(--s2a-border-radius-xs);
        z-index: 1;
      }

      .c-hero-marquee__spacer {
        height: var(--s2a-spacing-4xl); /* Primitive: design spec calls for 56px, using closest token (64px) */
        width: 100%;
      }

      .c-hero-marquee__container {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 1200px;
        padding: 0 var(--s2a-spacing-lg);
        display: flex;
        justify-content: center;
      }

      .c-hero-marquee__content {
        max-width: 800px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--s2a-spacing-md);
      }

      .c-hero-marquee__product-lockup {
        display: flex;
        gap: 15px; /* Primitive: design spec calls for 15px gap between product icons */
        align-items: center;
      }

      .c-hero-marquee__heading {
        font-size: var(--s2a-typography-font-size-4xl);
        font-family: var(--s2a-typography-font-family-adobe-clean-display);
        font-weight: var(--s2a-typography-font-weight-bold);
        line-height: var(--s2a-typography-line-height-4xl);
        text-align: center;
        margin: 0;
      }

      .c-hero-marquee__body {
        font-size: var(--s2a-typography-font-size-xl);
        font-family: var(--s2a-typography-font-family-adobe-clean);
        font-weight: var(--s2a-typography-font-weight-regular);
        line-height: var(--s2a-typography-line-height-xl);
        text-align: center;
        margin: 0;
      }

      .c-hero-marquee__cta-wrap {
        display: flex;
        gap: var(--s2a-spacing-lg);
        margin-top: var(--s2a-spacing-lg);
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
      }

      .c-hero-marquee__supplemental {
        font-size: var(--s2a-typography-font-size-xl);
        font-family: var(--s2a-typography-font-family-adobe-clean);
        font-weight: var(--s2a-typography-font-weight-bold);
        line-height: var(--s2a-typography-line-height-xl);
        text-align: center;
        margin: 0;
      }

      .c-hero-marquee__milo-tag {
        position: absolute;
        top: var(--s2a-spacing-md);
        right: var(--s2a-spacing-md);
        background: var(--s2a-color-transparent-black-64);
        color: var(--s2a-color-content-knockout);
        padding: var(--s2a-spacing-2xs) var(--s2a-spacing-sm);
        font-size: var(--s2a-typography-font-size-xs);
        font-family: monospace;
        border-radius: var(--s2a-border-radius-xs);
        z-index: 10;
      }
    </style>

    <div class="c-hero-marquee">
      ${bgImage ? html`
        <div class="c-hero-marquee__background">
          <img src="${bgImage}" alt="${backgroundImageAlt}" />
          <div class="c-hero-marquee__background-alt">Alt: ${backgroundImageAlt}</div>
        </div>
      ` : ''}
      
      ${showMiloTag ? html`
        <div class="c-hero-marquee__milo-tag">${miloTagText}</div>
      ` : ''}

      <div class="c-hero-marquee__spacer"></div>

      <div class="c-hero-marquee__container">
        <div class="c-hero-marquee__content">
          <div class="c-hero-marquee__product-lockup">
            ${ProductLockup({ productName: 'Adobe', size: '2xl' })}
            ${ProductLockup({ productName: 'Photoshop', size: '2xl' })}
          </div>

          <h1 class="c-hero-marquee__heading">${heading}</h1>

          <p class="c-hero-marquee__body">${body}</p>

          <div class="c-hero-marquee__cta-wrap">
            ${secondaryButtonLabel ? Button({
              label: secondaryButtonLabel,
              kind: 'primary',
              background: 'outlined',
              size: '2xl'
            }) : ''}
            ${Button({
              label: primaryButtonLabel,
              kind: 'accent',
              background: 'solid',
              size: '2xl'
            })}
          </div>

          ${showSupplemental ? html`
            <p class="c-hero-marquee__supplemental">${supplementalText}</p>
          ` : ''}
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
    showMiloTag: true,
    miloTagText: 'hero-mq-ctr',
    backgroundImage: null, // Will use imported hero-background.png
    backgroundImageAlt: 'Hero background image',
    primaryButtonLabel: 'Learn more',
    secondaryButtonLabel: 'Learn more',
  },
  render: (args) => HeroMarquee(args),
};

export const WithoutBackground: Story = {
  args: {
    ...Default.args,
    backgroundImage: '',
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
    showMiloTag: false,
    backgroundImage: '',
    secondaryButtonLabel: '',
    primaryButtonLabel: 'Get Started',
  },
  render: (args) => html`
    <style>
      .c-hero-marquee-minimal {
        position: relative;
        width: 100%;
        min-height: 600px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: var(--s2a-color-background-default);
        color: var(--s2a-color-content-default);
        padding: var(--s2a-spacing-4xl) var(--s2a-spacing-lg);
      }

      .c-hero-marquee-minimal__content {
        max-width: 800px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--s2a-spacing-lg);
      }

      .c-hero-marquee-minimal__heading {
        font-size: var(--s2a-typography-font-size-4xl);
        font-family: var(--s2a-typography-font-family-adobe-clean-display);
        font-weight: var(--s2a-typography-font-weight-bold);
        line-height: var(--s2a-typography-line-height-4xl);
        text-align: center;
        margin: 0;
      }

      .c-hero-marquee-minimal__body {
        font-size: var(--s2a-typography-font-size-xl);
        font-family: var(--s2a-typography-font-family-adobe-clean);
        font-weight: var(--s2a-typography-font-weight-regular);
        line-height: var(--s2a-typography-line-height-xl);
        text-align: center;
        margin: 0;
      }

      .c-hero-marquee-minimal__cta-wrap {
        display: flex;
        gap: var(--s2a-spacing-lg);
        margin-top: var(--s2a-spacing-lg);
        justify-content: center;
      }
    </style>

    <div class="c-hero-marquee-minimal">
      <div class="c-hero-marquee-minimal__content">
        <h1 class="c-hero-marquee-minimal__heading">${args.heading}</h1>
        <p class="c-hero-marquee-minimal__body">${args.body}</p>
        <div class="c-hero-marquee-minimal__cta-wrap">
          ${Button({
            label: args.primaryButtonLabel,
            kind: 'accent',
            background: 'solid',
            size: '2xl'
          })}
        </div>
      </div>
    </div>
  `,
};
