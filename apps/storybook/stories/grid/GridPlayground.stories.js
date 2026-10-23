import { renderGridGuide } from "./grid-guide.js";
export default {
  title: "Foundations/Grid/Playground",
  globals: { figmaOverlay: "off" },
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    actions: { disable: true },
  },
};
export const Explore = {
  render: (_args, context) => renderGridGuide("playground", context),
};
