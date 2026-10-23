import { renderGuide } from "./foundation-guide.js";

export default {
  title: "Foundations/Start Here",
  globals: { figmaOverlay: "off" },
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    actions: { disable: true },
  },
};

export const Guide = {
  name: "Guide",
  render: (_args, context) => renderGuide("start", context),
};
