import { html, nothing } from "lit";
import { ProductLockup } from "../product-lockup/product-lockup.js";
import { ProgressBar } from "../progress-bar/progress-bar.js";
import "./router-marquee-item.css";

const normalizeOrientation = (value) => (value === "horizontal" ? "horizontal" : "vertical");
const normalizeStyle = (value) => (value === "eyebrow" ? "eyebrow" : "label");
const normalizeContext = (value) => (value === "on-dark" ? "on-dark" : "on-light");
const normalizeWidth = (value) => (value === "hug" ? "hug" : "fill");

const clampProgress = (value) => {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric)) return 0;
  return Math.min(100, Math.max(0, numeric));
};

const resolveWrapperTag = (href, onClick) => {
  if (href) return "a";
  if (onClick) return "button";
  return "div";
};

export const RouterMarqueeItem = ({
  label = "PDF and productivity",
  app = "acrobat-pro",
  orientation = "vertical",
  styleVariant = "label",
  context = "on-light",
  width = "fill",
  showIconStart = true,
  showIconEnd = true,
  iconSize = "auto",
  active = false,
  showProgress = true,
  progress = "50",
  body,
  children,
  href,
  ariaLabel,
  onClick,
} = {}) => {
  const normalizedOrientation = normalizeOrientation(orientation);
  const normalizedStyle = normalizeStyle(styleVariant);
  const normalizedContext = normalizeContext(context);
  const normalizedWidth = normalizeWidth(width);
  const progressValue = clampProgress(progress);

  const lockupProps = {
    label,
    app,
    orientation: normalizedOrientation,
    styleVariant: normalizedStyle,
    context: normalizedContext,
    width: normalizedWidth,
    showIconStart,
    showIconEnd,
    iconSize,
  };

  const bodyContent = body ?? ProductLockup(lockupProps);
  const tag = resolveWrapperTag(href, onClick);
  const hasChildren = Boolean(children);
  const hasProgress = Boolean(showProgress);

  const content = html`
    ${bodyContent}
    ${hasChildren ? html`<div class="c-router-marquee-item__children">${children}</div>` : nothing}
  `;

  return html`
    <${tag}
      class="c-router-marquee-item"
      data-active=${active ? "true" : "false"}
      data-context=${normalizedContext}
      data-has-progress=${hasProgress ? "true" : "false"}
      data-display=${normalizedOrientation}
      href=${href ?? nothing}
      aria-label=${ariaLabel ?? nothing}
      @click=${onClick}
      type=${tag === "button" ? "button" : nothing}
      role=${tag === "div" ? "presentation" : nothing}
    >
      <div class="c-router-marquee-item__body">${content}</div>
      ${hasProgress
        ? html`<div class="c-router-marquee-item__progress">
            ${ProgressBar({ progress: progressValue, tone: active ? "default" : "knockout" })}
          </div>`
        : nothing}
    </${tag}>
  `;
};
