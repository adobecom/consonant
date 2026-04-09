import { html } from "lit";
import { Test3 } from "../../../../../packages/components/src/prototyping/matthewhuntsberry/test-3/test-3.js";

export default {
  title: "Prototyping/matthewhuntsberry/Test3",
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
  },
};

export const Default = {
  args: { label: "Test3" },
  render: (args) => Test3(args),
};
