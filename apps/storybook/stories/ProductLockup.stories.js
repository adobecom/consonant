import { html } from 'lit';
import { expect } from 'storybook/test';
import { ProductLockup } from './ProductLockup';

const runA11yCheck = async ({ canvasElement }) => {
  await expect(canvasElement).toBeAccessible();
};

export default {
  title: 'Components/ProductLockup',
  tags: ['autodocs'],
  render: (args) => ProductLockup(args),
  argTypes: {
    productName: {
      control: 'text',
      description: 'Product name text',
    },
    showName: {
      control: 'boolean',
      description: 'Whether to show the product name',
    },
    size: {
      control: { type: 'select' },
      options: ['xl', '2xl'],
      description: 'Lockup size variant (XL, 2XL)',
    },
    tileVariant: {
      control: { type: 'select' },
      options: ['default', 'experience-cloud'],
      description: 'Tile variant: default (Adobe red) or experience-cloud',
    },
    productTile: {
      control: 'text',
      description: 'Product tile image URL or custom HTML (overrides tileVariant)',
    },
  },
  args: {
    productName: 'Adobe',
    showName: true,
    size: '2xl',
    tileVariant: 'default',
    productTile: null,
  },
};

export const Default = {
  args: {
    productName: 'Adobe',
    showName: true,
  },
  play: runA11yCheck,
};

export const WithoutName = {
  args: {
    productName: 'Adobe',
    showName: false,
  },
};

export const CustomProductName = {
  args: {
    productName: 'Experience Cloud',
    showName: true,
  },
};

export const ExperienceCloudTile = {
  args: {
    productName: 'Experience Cloud',
    showName: true,
    tileVariant: 'experience-cloud',
  },
};

export const SizeXL = {
  args: {
    productName: 'Adobe',
    showName: true,
    size: 'xl',
  },
};

export const Size2XL = {
  args: {
    productName: 'Adobe',
    showName: true,
    size: '2xl',
  },
};

export const AllSizes = {
  render: () => {
    const sizes = ['xl', '2xl'];
    return html`
      <div style="display: flex; flex-direction: column; gap: 32px; padding: 20px;">
        ${sizes.map(size => html`
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="min-width: 60px; font-weight: 600;">${size.toUpperCase()}:</span>
            ${ProductLockup({ productName: 'Adobe', showName: true, size })}
          </div>
        `)}
      </div>
    `;
  },
};
