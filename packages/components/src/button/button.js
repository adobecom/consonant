import { html, nothing } from "lit";
import "./button.css";

/** Phosphor CaretDown icon - requires @phosphor-icons/web bold stylesheet to be loaded */
const CaretDownIcon = () => html`<i class="ph-bold ph-caret-down" aria-hidden="true"></i>`;

const normalizeIntent = (intent) => (intent === "accent" ? "accent" : "primary");

const normalizeContext = (intent, context, tone) => {
  if (intent === "accent") return "on-light";
  if (context) return context;
  if (!tone) return "on-light";
  if (tone === "inverse" || tone === "knockout") return "on-dark";
  return "on-light";
};

const resolveIcon = (icon) => (typeof icon === "function" ? icon() : icon);

/**
 * Button Component
 * Implements matt-atoms Button from Figma (node 141-53460).
 *
 * @param {Object} args - Component arguments
 * @param {string} args.label - Button label text
 * @param {string} args.background - "solid" | "outlined" | "transparent"
 * @param {string} args.intent - "primary" | "accent"
 * @param {string} args.context - "on-light" | "on-dark"
 * @param {string} args.size - "md" | "xs"
 * @param {string} args.state - "default" | "hover" | "active" | "focus" | "disabled"
 * @param {string} args.tone - (deprecated) "default" | "knockout" | "inverse" — maps to context
 * @param {boolean} args.showIconStart - show leading icon slot
 * @param {boolean} args.showIconEnd - show trailing icon slot
 * @param {unknown} args.iconStart - template/renderable for start icon
 * @param {unknown} args.iconEnd - template/renderable for end icon
 * @param {Function} args.onClick - Click handler
 */
export const Button = ({
  label = "Label",
  background = "solid",
  intent,
  context,
  size = "md",
  state = "default",
  tone,
  showIconStart = false,
  showIconEnd = false,
  iconStart,
  iconEnd,
  showElementEnd,
  href,
  onClick,
} = {}) => {
  const resolvedIntent = normalizeIntent(intent);
  const resolvedContext = normalizeContext(resolvedIntent, context, tone);
  const resolvedSize = size === "xs" ? "xs" : "md";
  const finalShowIconEnd = typeof showElementEnd === "boolean" ? showElementEnd : showIconEnd;
  const forceState = state && state !== "default" ? state : null;
  const isDisabled = state === "disabled";

  // Lit 3+: dynamic tag names (<${tag}>) are not allowed with standard `html`.
  // Use separate static <a> / <button> templates instead of lit/static-html.
  const content = html`
    ${showIconStart
      ? html`<span class="c-button__icon c-button__icon--start" aria-hidden="true">
          ${resolveIcon(iconStart) ?? nothing}
        </span>`
      : nothing}
    <span class="c-button__label">${label}</span>
    ${finalShowIconEnd
      ? html`<span class="c-button__icon c-button__icon--end" aria-hidden="true">
          ${resolveIcon(iconEnd) ?? CaretDownIcon()}
        </span>`
      : nothing}
  `;

  if (href) {
    return html`
      <a
        class="c-button"
        data-background=${background}
        data-intent=${resolvedIntent}
        data-context=${resolvedContext}
        data-size=${resolvedSize}
        data-force-state=${forceState ?? nothing}
        data-has-icon-start=${showIconStart ? "true" : "false"}
        data-has-icon-end=${finalShowIconEnd ? "true" : "false"}
        href=${href}
        @click=${onClick}
      >
        ${content}
      </a>
    `;
  }

  return html`
    <button
      class="c-button"
      data-background=${background}
      data-intent=${resolvedIntent}
      data-context=${resolvedContext}
      data-size=${resolvedSize}
      data-force-state=${forceState ?? nothing}
      data-has-icon-start=${showIconStart ? "true" : "false"}
      data-has-icon-end=${finalShowIconEnd ? "true" : "false"}
      ?disabled=${isDisabled}
      type="button"
      @click=${onClick}
    >
      ${content}
    </button>
  `;
};
