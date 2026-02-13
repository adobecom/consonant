import { html } from 'lit';
import './subhead.css';

/**
 * Subhead Component
 * Sub-component for marquee sections
 * 
 * @param {Object} args - Component arguments
 * @param {string} args.subhead - Subhead text
 * @param {string} args.variant - Subhead variant: "default" | "knockout" (default: "default")
 * @param {string} args.align - Text alignment: "left" | "center" (default: "center")
 */
export const Subhead = ({
  subhead = '{subhead}',
  variant = 'default',
  align = 'center'
}) => {
  return html`
    <div
      class="c-marquee-subhead"
      data-variant="${variant}"
      data-align="${align}"
    >
      <p class="c-marquee-subhead__text">${subhead}</p>
    </div>
  `;
};
