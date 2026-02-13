import { html } from "lit";
import { expect, fn } from "storybook/test";

import { Marquee } from "./Marquee";

// Import images as modules for Storybook
import example1Image from "./assets/marquee/example-1.png";
import example2Image from "./assets/marquee/example-2.png";

const runA11yCheck = async ({ canvasElement }) => {
  await expect(canvasElement).toBeAccessible();
};

export default {
  title: "Components/Marquee",
  tags: ["autodocs"],
  render: (args) => Marquee(args),
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "fullwidth"],
      description:
        "Marquee variant (default: fixed width, fullwidth: 100% width/height)",
    },
    mediaImage: {
      control: "text",
      description: "Media background image URL",
    },
    mediaImageAlt: {
      control: "text",
      description: "Alt text for media image",
    },
    pattern: {
      control: { type: "select" },
      options: ["center", "left"],
      description: "Content pattern (center or left aligned)",
    },
    size: {
      control: { type: "select" },
      options: ["lg", "md"],
      description: "Size variant (lg: 940px height, md: 720px height)",
    },
    width: {
      control: { type: "select" },
      options: ["wide", "md"],
      description: "Content width (wide: 998px, md: 512px)",
    },
    title: {
      control: "text",
      description: "Title text",
    },
    subhead: {
      control: "text",
      description: "Subhead text",
    },
    showScrim: {
      control: "boolean",
      description: "Whether to show the overlay scrim",
    },
    imageScale: {
      control: { type: "select" },
      options: ["1", "1.12", "1.25", "1.5", "2"],
      description:
        "Image scale factor (1 = normal, 1.12 = 12% larger, 1.25 = 25% larger, 1.5 = 50% larger, 2 = 100% larger)",
    },
  },
  args: {
    variant: "default",
    mediaImage: null,
    mediaImageAlt: "Background image",
    pattern: "center",
    size: "lg",
    width: "wide",
    title: "Everything you need to make anything.",
    subhead: "Subhead text goes here",
    primaryButton: { label: "Learn More", onClick: fn() },
    secondaryButton: { label: "Watch Video", onClick: fn() },
    showScrim: true,
  },
};

export const Default = {
  args: {
    variant: "default",
    mediaImage: example1Image,
    mediaImageAlt: "Marquee background image",
    pattern: "center",
    size: "lg",
    width: "wide",
    title: "Everything you need to make anything.",
    subhead: "Subhead text goes here",
    primaryButton: { label: "Learn More", onClick: fn() },
    secondaryButton: { label: "Watch Video", onClick: fn() },
    showScrim: true,
  },
  play: runA11yCheck,
};

export const FullWidth = {
  args: {
    variant: "fullwidth",
    mediaImage: example2Image,
    mediaImageAlt: "Marquee background image - fullwidth",
    pattern: "center",
    size: "lg",
    width: "wide",
    title: "Everything you need to make anything.",
    subhead: "Subhead text goes here",
    primaryButton: { label: "Learn More", onClick: fn() },
    secondaryButton: { label: "Watch Video", onClick: fn() },
    showScrim: true,
  },
  decorators: [
    (story) => html`
      <div style="width: 100%; height: 100vh; min-height: 600px;">
        ${story()}
      </div>
    `,
  ],
};

export const CenterLgWide = {
  args: {
    variant: "default",
    pattern: "center",
    size: "lg",
    width: "wide",
    title: "Everything you need to make anything.",
    subhead: "Subhead text goes here",
    primaryButton: { label: "Learn More", onClick: fn() },
    secondaryButton: { label: "Watch Video", onClick: fn() },
    showScrim: true,
  },
};

export const CenterLgMD = {
  args: {
    variant: "default",
    pattern: "center",
    size: "lg",
    width: "md",
    title: "Everything you need to make anything.",
    subhead: "Subhead text goes here",
    primaryButton: { label: "Learn More", onClick: fn() },
    secondaryButton: { label: "Watch Video", onClick: fn() },
    showScrim: true,
  },
};

export const CenterMdWide = {
  args: {
    variant: "default",
    pattern: "center",
    size: "md",
    width: "wide",
    title: "Everything you need to make anything.",
    subhead: "Subhead text goes here",
    primaryButton: { label: "Learn More", onClick: fn() },
    secondaryButton: { label: "Watch Video", onClick: fn() },
    showScrim: true,
  },
};

export const LeftMdMD = {
  args: {
    variant: "default",
    pattern: "left",
    size: "md",
    width: "md",
    title: "Everything you need to make anything.",
    subhead: "Subhead text goes here",
    primaryButton: { label: "Learn More", onClick: fn() },
    secondaryButton: { label: "Watch Video", onClick: fn() },
    showScrim: true,
  },
};

export const Example1 = {
  args: {
    variant: "default",
    mediaImage: example1Image,
    mediaImageAlt: "Marquee background image example 1",
    pattern: "center",
    size: "lg",
    width: "wide",
    title: "Everything you need to make anything.",
    subhead: "Subhead text goes here",
    primaryButton: { label: "Learn More", onClick: fn() },
    secondaryButton: { label: "Watch Video", onClick: fn() },
    showScrim: true,
    imageScale: "1.12", // Scale 12% larger
  },
};

export const Example2 = {
  args: {
    variant: "default",
    mediaImage: example2Image,
    mediaImageAlt:
      "Marquee background image example 2 - Industry standard creative tools",
    pattern: "left",
    size: "md",
    width: "md",
    title: "Industry standard creative tools.",
    subhead:
      "Get Photoshop, Illustrator, Premiere Pro, Lightroom, After Effects, and more in one plan. Powerful tools, pro workflows, and built-in AI to help you design, edit, and deliver your best work faster.",
    primaryButton: { label: "Learn More", onClick: fn() },
    secondaryButton: { label: "Watch Video", onClick: fn() },
    showScrim: true,
    imageScale: "1", // Normal size, no scaling
  },
  play: runA11yCheck,
};

export const CustomImage = {
  args: {
    variant: "default",
    mediaImage:
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=1440&h=940&fit=crop",
    mediaImageAlt: "Abstract background",
    pattern: "center",
    size: "lg",
    width: "wide",
    title: "Everything you need to make anything.",
    subhead: "Subhead text goes here",
    primaryButton: { label: "Learn More", onClick: fn() },
    secondaryButton: { label: "Watch Video", onClick: fn() },
    showScrim: true,
  },
};

export const NoScrim = {
  args: {
    variant: "default",
    pattern: "center",
    size: "lg",
    width: "wide",
    title: "Everything you need to make anything.",
    subhead: "Subhead text goes here",
    primaryButton: { label: "Learn More", onClick: fn() },
    secondaryButton: { label: "Watch Video", onClick: fn() },
    showScrim: false,
  },
};

export const NoButtons = {
  args: {
    variant: "default",
    pattern: "center",
    size: "lg",
    width: "wide",
    title: "Everything you need to make anything.",
    subhead: "Subhead text goes here",
    primaryButton: null,
    secondaryButton: null,
    showScrim: true,
  },
};

// All variants showcase
export const AllVariants = {
  render: () => {
    return html`
      <div
        style="display: flex; flex-direction: column; gap: 60px; padding: 40px;"
      >
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">
            Default Variant - Center LG Wide
          </h3>
          ${Marquee({
            variant: "default",
            pattern: "center",
            size: "lg",
            width: "wide",
            title: "Everything you need to make anything.",
            subhead: "Subhead text goes here",
            primaryButton: { label: "Learn More", onClick: fn() },
            secondaryButton: { label: "Watch Video", onClick: fn() },
            showScrim: true,
          })}
        </div>
        <div>
          <h3 style="margin-bottom: 20px; font-weight: 600;">
            Default Variant - Left MD MD
          </h3>
          ${Marquee({
            variant: "default",
            pattern: "left",
            size: "md",
            width: "md",
            title: "Everything you need to make anything.",
            subhead: "Subhead text goes here",
            primaryButton: { label: "Learn More", onClick: fn() },
            secondaryButton: { label: "Watch Video", onClick: fn() },
            showScrim: true,
          })}
        </div>
      </div>
    `;
  },
};
