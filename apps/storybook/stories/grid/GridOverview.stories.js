import { renderGridGuide } from "./grid-guide.js";
import { renderReport } from "./grid-report.js";

export default {
  title: "Foundations/Grid/Overview",
  globals: { figmaOverlay: "off" },
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    actions: { disable: true },
  },
};

export const Overview = {
  render: (_args, context) => renderGridGuide("overview", context),
};
export const ContractIndex = { render: () => renderReport("index") };
