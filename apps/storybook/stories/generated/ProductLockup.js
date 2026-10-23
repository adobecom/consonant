// Generated from product-lockup.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=product-lockup
import { html, nothing } from 'lit';
import './ProductLockup.css';
import { AppIcon } from './AppIcon.js';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);


export const ProductLockup = ({
  label = "Product label",
  orientation = "horizontal",
  showAppIcon = true,
  showIconEnd = true,
  showSecondAppIcon = false,
  style = "label",
  width = "hug",
  productName = "",
  app = "experience-cloud",
  secondApp = "experience-cloud",
  showSecondIcon = false,
  styleVariant = "",
  showIconStart = true,
  showIcon = "",
  iconSize = "auto",
  caret = "",
} = {}) => html`
      <div
        class="c-product-lockup"
        data-orientation=${orientation}
        data-style=${style}
        data-width=${width}
      >
      <div class="c-product-lockup__frame-1">
        <div class="icons">
          <div class="c-product-lockup__app-icon">${AppIcon({"size":"24"})}</div>

        </div>
        <span class="c-product-lockup__label">${label || "Product label"}</span>
      </div>
      <span class="c-product-lockup__s2a-icon-chevron-right"></span>
      </div>
`;

export default ProductLockup;
