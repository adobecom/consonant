// Generated from app-icon.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=app-icon
import { html, nothing } from 'lit';
import './AppIcon.css';
import MANIFEST_ADOBE_PRODUCT_ICONS from './assets/adobe-product-icons.js';

const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);

const assetSrc = (manifest, key, field) => {
  const entry = manifest.entries[key];
  return entry && entry[field] ? `${manifest.base}/${entry[field]}` : '';
};


export const AppIcon = ({
  app = "acrobat-pro",
  size = "24",
  ariaLabel = "",
  ariaHidden = true,
} = {}) => html`
      <span
        class="c-app-icon"
        data-size=${size}
      >
      <img class="c-app-icon__img" src=${assetSrc(MANIFEST_ADOBE_PRODUCT_ICONS, app, "filename")} alt="" />
      </span>
`;

export default AppIcon;
