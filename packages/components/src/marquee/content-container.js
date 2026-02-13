import { html } from 'lit';
import './content-container.css';
import { Title } from './title.js';
import { Subhead } from './subhead.js';
import { Button } from '../button/index.js';

/**
 * Content Container Component
 * Sub-component for marquee sections that contains title, subhead, and buttons
 * 
 * @param {Object} args - Component arguments
 * @param {string} args.title - Title text
 * @param {string} args.subhead - Subhead text
 * @param {string} args.align - Content alignment: "left" | "center" (default: "center")
 * @param {string} args.width - Container width: "wide" | "md" (default: "wide")
 * @param {string} args.variant - Text variant: "default" | "knockout" (default: "default")
 * @param {Object} args.primaryButton - Primary button config (label, onClick, etc.)
 * @param {Object} args.secondaryButton - Secondary button config (label, onClick, etc.)
 */
export const ContentContainer = ({
  title = '{title}',
  subhead = '{subhead}',
  align = 'center',
  width = 'wide',
  variant = 'default',
  primaryButton = null,
  secondaryButton = null
}) => {
  const hasButtons = primaryButton || secondaryButton;
  
  // Determine title size based on width
  const titleSize = width === 'md' ? 'lg' : 'xl';
  
  return html`
    <div
      class="c-marquee-content-container"
      data-align="${align}"
      data-width="${width}"
    >
      <div class="c-marquee-content-container__top">
        ${Title({ title, size: titleSize, variant, align })}
        ${Subhead({ subhead, variant, align })}
      </div>
      ${hasButtons ? html`
        <div class="c-marquee-content-container__bottom">
          <div class="c-marquee-content-container__actions">
            ${primaryButton ? html`
              ${Button({
                label: primaryButton.label || 'Label',
                size: 'lg',
                kind: 'primary',
                background: 'solid',
                surface: 'on-media',
                onClick: primaryButton.onClick
              })}
            ` : ''}
            ${secondaryButton ? html`
              ${Button({
                label: secondaryButton.label || 'Label',
                size: 'lg',
                kind: 'secondary',
                background: 'glass',
                surface: 'on-media',
                onClick: secondaryButton.onClick
              })}
            ` : ''}
          </div>
        </div>
      ` : ''}
    </div>
  `;
};
