import { html } from "lit";
import { ButtonComponent } from "../../../../../packages/components/src/prototyping/matthewhuntsberry/button-component/button-component.js";

export default {
  title: "Prototyping/matthewhuntsberry/ButtonComponent",
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
  },
};

export const Default = {
  args: { label: "ButtonComponent" },
  render: (args) => ButtonComponent(args),
};
