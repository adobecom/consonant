import { renderReport } from "./grid-report.js";

export default {
  title: "Foundations/Grid/Conformance",
  globals: { figmaOverlay: "off" },
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    actions: { disable: true },
  },
};

export const Conformance = { render: () => renderReport("conformance") };
