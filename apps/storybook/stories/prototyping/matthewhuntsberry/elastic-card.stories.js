import { html } from "lit";
import { ElasticCard } from "../../../../../packages/components/src/prototyping/matthewhuntsberry/elastic-card/elastic-card.js";

export default {
  title: "Prototyping/matthewhuntsberry/ElasticCard",
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
  },
};

export const Default = {
  args: { label: "ElasticCard" },
  render: (args) => ElasticCard(args),
};
