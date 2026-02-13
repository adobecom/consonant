import { html } from 'lit';
import { expect } from 'storybook/test';

import { Title } from './MarqueeTitle';

const runA11yCheck = async ({ canvasElement }) => {
  await expect(canvasElement).toBeAccessible();
};

export default {
  title: 'Components/Marquee/Title',
  tags: ['autodocs'],
  render: (args) => Title(args),
  argTypes: {
    title: {
      control: 'text',
      description: 'Title text',
    },
    size: {
      control: { type: 'select' },
      options: ['xl', 'lg'],
      description: 'Title size variant (XL, LG)',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'knockout'],
      description: 'Title variant (default for dark text, knockout for white text on media)',
    },
  },
  args: {
    title: 'Everything you need to make anything.',
    size: 'xl',
    variant: 'default',
  },
};

export const Default = {
  args: {
    title: 'Everything you need to make anything.',
    size: 'xl',
    variant: 'default',
  },
  play: runA11yCheck,
};

export const SizeXL = {
  args: {
    title: 'Everything you need to make anything.',
    size: 'xl',
    variant: 'default',
  },
};

export const SizeLG = {
  args: {
    title: 'Everything you need to make anything.',
    size: 'lg',
    variant: 'default',
  },
};

export const Knockout = {
  args: {
    title: 'Everything you need to make anything.',
    size: 'xl',
    variant: 'knockout',
  },
  decorators: [
    (story) => html`
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; display: flex; align-items: center; justify-content: center; min-height: 200px;">
        ${story()}
      </div>
    `,
  ],
};

export const KnockoutLG = {
  args: {
    title: 'Everything you need to make anything.',
    size: 'lg',
    variant: 'knockout',
  },
  decorators: [
    (story) => html`
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; display: flex; align-items: center; justify-content: center; min-height: 200px;">
        ${story()}
      </div>
    `,
  ],
};

// All variants showcase
export const AllVariants = {
  render: () => {
    return html`
      <div style="display: flex; flex-direction: column; gap: 40px; padding: 40px;">
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">Size XL - Default</h3>
          ${Title({ title: 'Everything you need to make anything.', size: 'xl', variant: 'default' })}
        </div>
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">Size LG - Default</h3>
          ${Title({ title: 'Everything you need to make anything.', size: 'lg', variant: 'default' })}
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 8px;">
          <h3 style="margin-bottom: 20px; font-weight: 600; color: white;">Size XL - Knockout</h3>
          ${Title({ title: 'Everything you need to make anything.', size: 'xl', variant: 'knockout' })}
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 8px;">
          <h3 style="margin-bottom: 20px; font-weight: 600; color: white;">Size LG - Knockout</h3>
          ${Title({ title: 'Everything you need to make anything.', size: 'lg', variant: 'knockout' })}
        </div>
      </div>
    `;
  },
};
