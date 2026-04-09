import { html } from "lit";
import { NavCardPattern } from "../../../packages/components/src/navigation/nav-card-pattern/nav-card-pattern.js";

const menuItems = [
  { label: "Creative Cloud", href: "#" },
  { label: "Illustrator", href: "#" },
  { label: "Photoshop", href: "#" },
  { label: "Premiere Pro", href: "#" },
  { label: "After Effects", href: "#" },
  { label: "Substance 3D", href: "#" },
];

export default {
  title: "Navigation/Nav Card/Patterns",
  tags: ["autodocs"],
  render: (args) =>
    html`<div style="padding: 32px; background: #f5f5f5; display: inline-flex;">${NavCardPattern(
      args
    )}</div>`,
  argTypes: {
    pattern: {
      control: "inline-radio",
      options: ["promo", "menu"],
      description: "Selects which GNAV pattern to render",
    },
    title: { control: "text", description: "Shared Title 4 heading" },
    eyebrow: {
      control: "text",
      description: "Promo only: eyebrow text shown above the title",
    },
    body: { control: "text", description: "Promo only: supporting copy" },
    ctaLinkLabel: {
      control: "text",
      description: "Promo only: inline text link label",
    },
    ctaLinkHref: {
      control: "text",
      description: "Promo only: inline text link href",
    },
    ctaButtonLabel: {
      control: "text",
      description: "Shared CTA button label",
    },
    ctaButtonHref: {
      control: "text",
      description: "Shared CTA button href",
    },
    menuItems: {
      control: "object",
      description: "Menu only: data for the stacked nav links",
    },
  },
  args: {
    pattern: "promo",
    eyebrow: "Creative Professionals",
    title: "Craft at the highest level of creative.",
    body: "Create designs, photo, video, and more with AI in Creative Cloud apps.",
    ctaLinkLabel: "See plans",
    ctaLinkHref: "#",
    ctaButtonLabel: "Explore",
    ctaButtonHref: "#",
    menuItems,
  },
};

export const Promo = {};

export const Menu = {
  args: {
    pattern: "menu",
    title: "Browse",
    ctaButtonLabel: "Explore",
    ctaButtonHref: "#",
  },
};
