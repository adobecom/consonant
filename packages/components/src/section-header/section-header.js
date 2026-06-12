import { html } from "lit";
import { RichContent } from "../rich-content/rich-content.js";
import "./section-header.css";

export const SectionHeader = ({
  eyebrow = "",
  showEyebrow = true,
  title = "",
  body = "",
  theme = "on-light",
  showActions = false,
  actions,
} = {}) => html`
  <div
    class="c-section-header"
    data-theme=${theme === "on-dark" ? "on-dark" : "on-light"}
  >
    ${RichContent({
      theme,
      density: "tight",
      justifyContent: "center",
      measure: "wide",
      eyebrow,
      showEyebrow,
      title,
      body,
      showActions,
      actions,
    })}
  </div>
`;
