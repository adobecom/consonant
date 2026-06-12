import { html } from "lit";
import { NavCardMenuItem } from "../../../packages/components/src/navigation/nav-card-menu-item/nav-card-menu-item.js";

const sampleItems = [
  { label: "Creative Cloud", href: "#" },
  { label: "Illustrator", href: "#" },
  { label: "Photoshop", href: "#" },
  { label: "Premiere Pro", href: "#" },
  { label: "After Effects", href: "#" },
  { label: "Substance 3D", href: "#" },
];

export default {
  title: "Organisms/NavCard/Menu",
  tags: ["autodocs"],
  render: (args) =>
    html`<div style="padding: 32px; background: #f5f5f5; display: inline-flex;">${NavCardMenuItem(args)}</div>`,
  parameters: {
    docs: {
      description: {
        component: "Navigation menu card — title heading, link list, and a bottom CTA.",
      },
      source: {
        language: "html",
        code: `<div class="c-nav-card-menu-item">
  <h3 class="c-nav-card-menu-item__title">Browse</h3>
  <ul class="c-nav-card-menu-item__list" role="list">
    <li><a class="c-nav-card-menu-item__link" href="#">Creative Cloud</a></li>
    <li><a class="c-nav-card-menu-item__link" href="#">Illustrator</a></li>
    <li><a class="c-nav-card-menu-item__link" href="#">Photoshop</a></li>
    <li><a class="c-nav-card-menu-item__link" href="#">Premiere Pro</a></li>
    <!-- …more items -->
  </ul>
  <a class="c-nav-card-button" href="#">Explore</a>
</div>`,
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
