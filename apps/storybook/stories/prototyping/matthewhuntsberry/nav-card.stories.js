import { html } from "lit";
import { NavCard } from "../../../../../packages/components/src/prototyping/matthewhuntsberry/nav-card/nav-card.js";

export default {
  title: "Prototyping/matthewhuntsberry/NavCard",
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
  },
};

export const Default = {
  args: { label: "NavCard" },
  render: (args) => NavCard(args),
};
