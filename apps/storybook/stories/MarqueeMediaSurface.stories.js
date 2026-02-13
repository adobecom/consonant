import { html } from 'lit';
import { expect, fn } from 'storybook/test';

import { MediaSurface } from './MarqueeMediaSurface';

const runA11yCheck = async ({ canvasElement }) => {
  await expect(canvasElement).toBeAccessible();
};

export default {
  title: 'Components/Marquee/MediaSurface',
  tags: ['autodocs'],
  render: (args) => MediaSurface(args),
  argTypes: {
    mediaImage: {
      control: 'text',
      description: 'Media background image URL',
    },
    mediaImageAlt: {
      control: 'text',
      description: 'Alt text for media image',
    },
    pattern: {
      control: { type: 'select' },
      options: ['center', 'left'],
      description: 'Content pattern (center or left aligned)',
    },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md'],
      description: 'Size variant (lg: 940px height, md: 720px height)',
    },
    width: {
      control: { type: 'select' },
      options: ['wide', 'md'],
      description: 'Content width (wide: 998px, md: 512px)',
    },
    title: {
      control: 'text',
      description: 'Title text',
    },
    subhead: {
      control: 'text',
      description: 'Subhead text',
    },
  },
  args: {
    mediaImage: null,
    mediaImageAlt: 'Background image',
    pattern: 'center',
    size: 'lg',
    width: 'wide',
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
};

export const Default = {
  args: {
    pattern: 'center',
    size: 'lg',
    width: 'wide',
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
  play: runA11yCheck,
};

export const CenterLgWide = {
  args: {
    pattern: 'center',
    size: 'lg',
    width: 'wide',
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
};

export const CenterLgMD = {
  args: {
    pattern: 'center',
    size: 'lg',
    width: 'md',
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
};

export const CenterMdWide = {
  args: {
    pattern: 'center',
    size: 'md',
    width: 'wide',
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
};

export const LeftMdMD = {
  args: {
    pattern: 'left',
    size: 'md',
    width: 'md',
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
};

export const CustomImage = {
  args: {
    mediaImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1440&h=940&fit=crop',
    mediaImageAlt: 'Abstract background',
    pattern: 'center',
    size: 'lg',
    width: 'wide',
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: { label: 'Watch Video', onClick: fn() },
  },
};

export const NoButtons = {
  args: {
    pattern: 'center',
    size: 'lg',
    width: 'wide',
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    primaryButton: null,
    secondaryButton: null,
  },
};

export const PrimaryButtonOnly = {
  args: {
    pattern: 'center',
    size: 'lg',
    width: 'wide',
    title: 'Everything you need to make anything.',
    subhead: 'Subhead text goes here',
    primaryButton: { label: 'Learn More', onClick: fn() },
    secondaryButton: null,
  },
};

// All patterns showcase
export const AllPatterns = {
  render: () => {
    return html`
      <div style="display: flex; flex-direction: column; gap: 60px; padding: 40px;">
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">Center LG Wide</h3>
          ${MediaSurface({
            pattern: 'center',
            size: 'lg',
            width: 'wide',
            title: 'Everything you need to make anything.',
            subhead: 'Subhead text goes here',
            primaryButton: { label: 'Learn More', onClick: fn() },
            secondaryButton: { label: 'Watch Video', onClick: fn() },
          })}
        </div>
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">Center LG MD</h3>
          ${MediaSurface({
            pattern: 'center',
            size: 'lg',
            width: 'md',
            title: 'Everything you need to make anything.',
            subhead: 'Subhead text goes here',
            primaryButton: { label: 'Learn More', onClick: fn() },
            secondaryButton: { label: 'Watch Video', onClick: fn() },
          })}
        </div>
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">Center MD Wide</h3>
          ${MediaSurface({
            pattern: 'center',
            size: 'md',
            width: 'wide',
            title: 'Everything you need to make anything.',
            subhead: 'Subhead text goes here',
            primaryButton: { label: 'Learn More', onClick: fn() },
            secondaryButton: { label: 'Watch Video', onClick: fn() },
          })}
        </div>
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">Left MD MD</h3>
          ${MediaSurface({
            pattern: 'left',
            size: 'md',
            width: 'md',
            title: 'Everything you need to make anything.',
            subhead: 'Subhead text goes here',
            primaryButton: { label: 'Learn More', onClick: fn() },
            secondaryButton: { label: 'Watch Video', onClick: fn() },
          })}
        </div>
      </div>
    `;
  },
};
