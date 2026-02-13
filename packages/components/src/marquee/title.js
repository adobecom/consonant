import { html } from 'lit';
import './title.css';

/**
 * Title Component
 * Sub-component for marquee sections
 * 
 * @param {Object} args - Component arguments
 * @param {string} args.title - Title text
 * @param {string} args.size - Title size: "xl" | "lg" (default: "xl")
 * @param {string} args.variant - Title variant: "default" | "knockout" (default: "default")
 * @param {string} args.align - Text alignment: "left" | "center" (default: "center")
 */
export const Title = ({
  title = '{title}',
  size = 'xl',
  variant = 'default',
  align = 'center'
}) => {
  return html`
    <div
      class="c-marquee-title"
      data-size="${size}"
      data-variant="${variant}"
      data-align="${align}"
    >
      <p class="c-marquee-title__text">${title}</p>
    </div>
  `;
};
