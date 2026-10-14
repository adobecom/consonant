import { renderGuide } from "./foundation-guide.js";

export default {
  title: "Foundations/Layout",
  globals: { figmaOverlay: "off" },
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    actions: { disable: true },
  },
};

export const Guide = {
  name: "Guide",
  render: (_args, context) => renderGuide("layout", context),
};
