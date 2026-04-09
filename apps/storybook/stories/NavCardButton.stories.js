import { html } from "lit";
import { NavCardButton } from "../../../packages/components/src/navigation/nav-card-button/nav-card-button.js";
import navCardButtonCss from "../../../packages/components/src/navigation/nav-card-button/nav-card-button.css?raw";

export default {
  title: "Navigation/Nav Card/CTA Button",
  tags: ["autodocs"],
  render: (args) =>
    html`<div style="padding: 32px; background: #f5f5f5; width: 340px;">${NavCardButton(args)}</div>`,
  parameters: {
    docs: {
      description: {
        component: `\nGNAV pill CTA used under every nav card/menu item.\n\n\`\`\`css\n${navCardButtonCss}\n\`\`\`\n        `,
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "CTA text" },
    href: { control: "text", description: "Optional link destination" },
    state: {
      control: "select",
      options: ["default", "hover", "active", "focus", "disabled"],
      description: "Debug helper — forces a visual state",
    },
  },
  args: {
    label: "Explore",
    href: "#",
    state: "default",
  },
};

export const Default = {};

export const Hover = {
  args: { state: "hover" },
};

export const Active = {
  args: { state: "active" },
};

export const Disabled = {
  args: { state: "disabled", href: "" },
};
