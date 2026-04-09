import { Test2 } from "../../../../../packages/components/src/prototyping/matthewhuntsberry/test-2/test-2.js";

export default {
  title: "Prototyping/matthewhuntsberry/Test2",
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
  },
};

export const Default = {
  args: { label: "Test2" },
  render: (args) => Test2(args),
};
