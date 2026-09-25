import { html } from "lit";
import { RichContent } from "../rich-content/rich-content.js";
import "./section-header.css";

export const SectionHeader = ({
  eyebrow = "",
  showEyebrow = true,
  title = "",
  body = "",
  showActions = false,
  actions,
} = {}) => html`
  <div class="c-section-header">
    ${RichContent({
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
