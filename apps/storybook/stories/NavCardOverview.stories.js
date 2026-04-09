import { html } from "lit";
import { NavCard } from "../../../packages/components/src/navigation/nav-card/nav-card.js";
import { NavCardMenuItem } from "../../../packages/components/src/navigation/nav-card-menu-item/nav-card-menu-item.js";

const menuItems = [
  { label: "Creative Cloud", href: "#" },
  { label: "Illustrator", href: "#" },
  { label: "Photoshop", href: "#" },
  { label: "Premiere Pro", href: "#" },
  { label: "After Effects", href: "#" },
  { label: "Substance 3D", href: "#" },
];

export default {
  title: "Navigation/Nav Card/Overview",
};

const contentProps = {
  eyebrow: "Creative Professionals",
  title: "Craft at the highest level of creative.",
  body: "Create designs, photo, video, and more with AI in Creative Cloud apps.",
  ctaLinkLabel: "See plans",
  ctaLinkHref: "#",
  ctaButtonLabel: "Explore",
  ctaButtonHref: "#",
};

const menuProps = {
  title: "Browse",
  items: menuItems,
  ctaLabel: "Explore",
  ctaHref: "#",
};

export const Variants = () => html`
  <div
    style="
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
      padding: 32px;
      background: #f5f5f5;
    "
  >
    ${NavCard(contentProps)}
    ${NavCardMenuItem(menuProps)}
  </div>
`;
