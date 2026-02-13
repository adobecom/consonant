import { html } from 'lit';
import './button.css';

/**
 * Button Component
 * Pure HTML/CSS component using data attributes for variants
 * 
 * @param {Object} args - Component arguments
 * @param {string} args.label - Button label text
 * @param {string} args.size - Button size: "lg" | "xl" | "2xl" (default: "2xl")
 * @param {string} args.state - Button state: "default" | "disabled" | "hover"
 * @param {string} args.kind - Button kind: "accent" | "primary" | "secondary"
 * @param {string} args.background - Background style: "solid" | "outlined" | "glass"
 * @param {string} args.surface - Surface context: "default" | "on-media" (default: "default")
 * @param {Function} args.onClick - Click handler function
 */
export const Button = ({ 
  label = 'Label', 
  size = '2xl', 
  state = 'default', 
  kind = 'accent', 
  background = 'solid',
  surface = 'default',
  onClick 
}) => {
  return html`
    <button
      class="c-button"
      data-size="${size}"
      data-state="${state}"
      data-kind="${kind}"
      data-background="${background}"
      data-surface="${surface}"
      @click=${onClick}
      type="button"
    >
      <span class="c-button__label">${label}</span>
    </button>
  `;
};
