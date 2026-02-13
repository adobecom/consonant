import { html } from 'lit';
import './product-lockup.css';
import tileBackground from './assets/tile-background.svg';
import mnemonicLogo from './assets/mnemonic-logo.svg';

/**
 * Product Lockup Component
 * Pure HTML/CSS component using data attributes for variants
 * 
 * @param {Object} args - Component arguments
 * @param {string} args.productName - Product name text (default: "Adobe")
 * @param {boolean} args.showName - Whether to show the product name (default: true)
 * @param {string} args.size - Lockup size: "xl" | "2xl" (default: "2xl")
 * @param {string} args.tileVariant - Tile variant: "default" (Adobe red) or "experience-cloud" (default: "default")
 * @param {string|HTMLElement} args.productTile - Custom product tile HTML or image URL (overrides tileVariant)
 */
export const ProductLockup = ({ 
  productName = 'Adobe',
  showName = true,
  size = '2xl',
  tileVariant = 'default',
  productTile = null
}) => {
  // If productTile is provided as a string (URL), create an img element
  // If it's already HTML, use it directly
  let tileContent = productTile;
  if (typeof productTile === 'string') {
    tileContent = html`<img src="${productTile}" alt="Product icon" />`;
  } else if (!productTile) {
    // Default tile with background and logo from Figma
    // Support tile variants: "default" (Adobe red) or "experience-cloud"
    tileContent = html`
      <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
        <img 
          src="${tileBackground}" 
          alt="" 
          style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;" 
        />
        <img 
          src="${mnemonicLogo}" 
          alt="Adobe logo" 
          style="position: relative; width: 59.25%; height: auto; max-width: 59.25%; max-height: 53.71%; object-fit: contain; z-index: 1;" 
        />
      </div>
    `;
  }

  return html`
    <div
      class="c-product-lockup"
      data-size="${size}"
      data-show-name="${showName}"
      data-tile-variant="${tileVariant}"
    >
      <div class="c-product-lockup__tile">
        ${tileContent}
      </div>
      ${showName ? html`
        <div class="c-product-lockup__name">
          <p>${productName}</p>
        </div>
      ` : ''}
    </div>
  `;
};
