import { html } from "lit";
import { TestProto1 } from "../../../../../packages/components/src/prototyping/matthewhuntsberry/test-proto-1/test-proto-1.js";

export default {
  title: "Prototyping/matthewhuntsberry/TestProto1",
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
  },
};

export const Default = {
  args: { label: "TestProto1" },
  render: (args) => TestProto1(args),
};
