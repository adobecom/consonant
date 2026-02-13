import { html } from 'lit';
import { expect } from 'storybook/test';

import { Subhead } from './MarqueeSubhead';

const runA11yCheck = async ({ canvasElement }) => {
  await expect(canvasElement).toBeAccessible();
};

export default {
  title: 'Components/Marquee/Subhead',
  tags: ['autodocs'],
  render: (args) => Subhead(args),
  argTypes: {
    subhead: {
      control: 'text',
      description: 'Subhead text',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'knockout'],
      description: 'Subhead variant (default for dark text, knockout for white text on media)',
    },
  },
  args: {
    subhead: 'Subhead text goes here',
    variant: 'default',
  },
};

export const Default = {
  args: {
    subhead: 'Subhead text goes here',
    variant: 'default',
  },
  play: runA11yCheck,
};

export const Knockout = {
  args: {
    subhead: 'Subhead text goes here',
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

export const LongText = {
  args: {
    subhead: 'This is a longer subhead text that demonstrates how the component handles multiple words and longer content.',
    variant: 'default',
  },
};

// All variants showcase
export const AllVariants = {
  render: () => {
    return html`
      <div style="display: flex; flex-direction: column; gap: 40px; padding: 40px;">
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">Default Variant</h3>
          ${Subhead({ subhead: 'Subhead text goes here', variant: 'default' })}
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 8px;">
          <h3 style="margin-bottom: 20px; font-weight: 600; color: white;">Knockout Variant</h3>
          ${Subhead({ subhead: 'Subhead text goes here', variant: 'knockout' })}
        </div>
      </div>
    `;
  },
};
