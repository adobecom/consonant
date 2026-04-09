import { html } from "lit";
import { NavCardMenuItem } from "../../../packages/components/src/navigation/nav-card-menu-item/nav-card-menu-item.js";
import navCardMenuItemCss from "../../../packages/components/src/navigation/nav-card-menu-item/nav-card-menu-item.css?raw";

const sampleItems = [
  { label: "Creative Cloud", href: "#" },
  { label: "Illustrator", href: "#" },
  { label: "Photoshop", href: "#" },
  { label: "Premiere Pro", href: "#" },
  { label: "After Effects", href: "#" },
  { label: "Substance 3D", href: "#" },
];

export default {
  title: "Navigation/Nav Card/Menu",
  tags: ["autodocs"],
  render: (args) =>
    html`<div style="padding: 32px; background: #f5f5f5; display: inline-flex;">${NavCardMenuItem(args)}</div>`,
  parameters: {
    docs: {
      description: {
        component: `\nNavigation card (title + links + CTA).\n\n\`\`\`css\n${navCardMenuItemCss}\n\`\`\`\n        `,
      },
    },
  },
  argTypes: {
    title: { control: "text", description: "Menu heading" },
    ctaLabel: { control: "text", description: "Bottom CTA label" },
    ctaHref: { control: "text", description: "Bottom CTA link" },
    items: { control: "object", description: "Nav link data" },
  },
  args: {
    title: "Browse",
    items: sampleItems,
    ctaLabel: "Explore",
    ctaHref: "#",
  },
};

export const Default = {};

export const WithIcons = {
  args: {
    items: sampleItems.map((item) => ({ ...item, showIconEnd: true })),
  },
};
