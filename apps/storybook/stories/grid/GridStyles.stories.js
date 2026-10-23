import { renderGridGuide } from "./grid-guide.js";
export default {
  title: "Foundations/Grid/Figma styles",
  globals: { figmaOverlay: "off" },
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    actions: { disable: true },
  },
};
export const Guide = {
  render: (_args, context) => renderGridGuide("styles", context),
};
