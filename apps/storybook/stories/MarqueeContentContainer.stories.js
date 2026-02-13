import { html } from 'lit';
import { expect, fn } from 'storybook/test';

import { ContentContainer } from './MarqueeContentContainer';

const runA11yCheck = async ({ canvasElement }) => {
  await expect(canvasElement).toBeAccessible();
};

export default {
  title: 'Components/Marquee/ContentContainer',
  tags: ['autodocs'],
  render: (args) => ContentContainer(args),
  argTypes: {
    title: {
      control: 'text',
      description: 'Title text',
    },
    subhead: {
      control: 'text',
      description: 'Subhead text',
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'center'],
      description: 'Content alignment',
    },
    width: {
      control: { type: 'select' },
      options: ['wide', 'md'],
      description: 'Container width (wide: 998px, md: 512px)',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'knockout'],
      description: 'Text variant (default for dark text, knockout for white text on media)',
    },
  },
  args: {
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    align: 'center',
    width: 'wide',
    variant: 'default',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
};

export const Default = {
  args: {
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    align: 'center',
    width: 'wide',
    variant: 'default',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
  play: runA11yCheck,
};

export const CenterWide = {
  args: {
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    align: 'center',
    width: 'wide',
    variant: 'default',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
};

export const CenterMD = {
  args: {
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    align: 'center',
    width: 'md',
    variant: 'default',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
};

export const LeftWide = {
  args: {
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    align: 'left',
    width: 'wide',
    variant: 'default',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
};

export const LeftMD = {
  args: {
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    align: 'left',
    width: 'md',
    variant: 'default',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
};

export const Knockout = {
  args: {
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    align: 'center',
    width: 'wide',
    variant: 'knockout',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
  decorators: [
    (story) => html`
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; display: flex; align-items: center; justify-content: center; min-height: 400px;">
        ${story()}
      </div>
    `,
  ],
};

export const NoButtons = {
  args: {
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    align: 'center',
    width: 'wide',
    variant: 'default',
    primaryButton: null,
    secondaryButton: null,
  },
};

export const PrimaryButtonOnly = {
  args: {
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    align: 'center',
    width: 'wide',
    variant: 'default',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: null,
  },
};

export const SecondaryButtonOnly = {
  args: {
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    align: 'center',
    width: 'wide',
    variant: 'default',
    primaryButton: null,
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
};

// All variants showcase
export const AllVariants = {
  render: () => {
    return html`
      <div style="display: flex; flex-direction: column; gap: 60px; padding: 40px;">
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">Center Wide</h3>
          ${ContentContainer({
            title: 'Everything you need to make anything.',
            subhead: 'Subhead text goes here',
            align: 'center',
            width: 'wide',
            variant: 'default',
            primaryButton: { label: 'Learn More', onClick: fn() },
            secondaryButton: { label: 'Watch Video', onClick: fn() },
          })}
        </div>
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">Center MD</h3>
          ${ContentContainer({
            title: 'Everything you need to make anything.',
            subhead: 'Subhead text goes here',
            align: 'center',
            width: 'md',
            variant: 'default',
            primaryButton: { label: 'Learn More', onClick: fn() },
            secondaryButton: { label: 'Watch Video', onClick: fn() },
          })}
        </div>
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">Left Wide</h3>
          ${ContentContainer({
            title: 'Everything you need to make anything.',
            subhead: 'Subhead text goes here',
            align: 'left',
            width: 'wide',
            variant: 'default',
            primaryButton: { label: 'Learn More', onClick: fn() },
            secondaryButton: { label: 'Watch Video', onClick: fn() },
          })}
        </div>
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">Left MD</h3>
          ${ContentContainer({
            title: 'Everything you need to make anything.',
            subhead: 'Subhead text goes here',
            align: 'left',
            width: 'md',
            variant: 'default',
            primaryButton: { label: 'Learn More', onClick: fn() },
            secondaryButton: { label: 'Watch Video', onClick: fn() },
          })}
        </div>
      </div>
    `;
  },
};
