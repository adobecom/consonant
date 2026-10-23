import { renderGuide } from "./foundation-guide.js";

export default {
  title: "Foundations/Responsive",
  globals: { figmaOverlay: "off" },
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    actions: { disable: true },
  },
};

export const Guide = {
  name: "Guide",
  render: (_args, context) => renderGuide("responsive", context),
};
