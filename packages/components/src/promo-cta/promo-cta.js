import { html, nothing } from 'lit';
import { APP_OPTIONS } from '../app-icon/app-icon.js';
import './promo-cta.css';

const CDN = 'https://www.adobe.com/content/dam/shared/images/product-icons/svg';

const ARROW_SVG = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M11.106 5.39376L7.50582 1.79359C7.171 1.45878 6.62859 1.45878 6.29377 1.79359C5.95895 2.12841 5.95895 2.67083 6.29377 3.00564L8.43076 5.14264H1.49997C1.0262 5.14264 0.642822 5.52601 0.642822 5.99978C0.642822 6.47355 1.0262 6.85692 1.49997 6.85692H8.43077L6.29378 8.99392C5.95896 9.32874 5.95896 9.87115 6.29378 10.206C6.46119 10.3734 6.68049 10.4571 6.8998 10.4571C7.11911 10.4571 7.33842 10.3734 7.50583 10.206L11.106 6.6058C11.4408 6.27098 11.4408 5.72858 11.106 5.39376Z" fill="currentColor"/>
  </svg>
`;

/**
 * PromoCta — v2. Dark promotional pill with app icon, label, and arrow button.
 * Matches Figma set "PromoCTA — v2" (11223:203954) + "PromoCTA/Arrow Button" (11223:211366).
 *
 * v2 architecture changes vs v1:
 *  - Size axis is lg-only (32px arrow button); the v1 xl size is retired ("xl" maps to "lg")
 *  - Colors bind the dedicated s2a/color/promo-cta/* token family (fallback-chained to
 *    shipped equivalents until that family lands in a tokens release)
 *  - Active arrow: black fill + white border (v1 inverted to white fill)
 *
 * @param {object} opts
 * @param {'lg'} opts.size              - lg only in v2 ('xl' accepted as deprecated alias)
 * @param {'default'|'hover'|'active'} opts.state
 * @param {'hug'|'fill'} opts.width     - hug wraps content; fill stretches to container
 * @param {string} opts.label           - CTA copy
 * @param {boolean} opts.showApp        - Figma "Show App Icon"
 * @param {boolean} opts.showIconEnd    - Figma "Show Icon End" (arrow button)
 * @param {string} opts.app             - app slug from APP_LIBRARY (e.g. 'creative-cloud')
 */
export function PromoCta({
  size = 'lg',
  state = 'default',
  width = 'hug',
  label = 'Learn more',
  showApp = true,
  showIconEnd,
  showIcon,
  app = 'creative-cloud',
} = {}) {
  const resolvedShowIconEnd = showIconEnd ?? showIcon ?? true;
  const appEntry = APP_OPTIONS.find((o) => o.slug === app) ?? APP_OPTIONS[0];
  const iconSrc = `${CDN}/${appEntry.filename}`;

  return html`
    <button
      class="c-promo-cta"
      data-size="lg"
      data-state=${state}
      data-width=${width}
      data-show-app=${String(showApp)}
      data-show-icon-end=${String(resolvedShowIconEnd)}
      type="button"
    >
      <span class="c-promo-cta__left">
        ${showApp ? html`
          <span class="c-promo-cta__app-icon">
            <img
              src=${iconSrc}
              alt=${appEntry.label}
              width="32"
              height="32"
              style="border-radius:18%;display:block;"
              decoding="async"
              draggable="false"
            />
          </span>
        ` : nothing}
        <span class="c-promo-cta__label-wrapper">
          <span class="c-promo-cta__label">${label}</span>
        </span>
      </span>
      ${resolvedShowIconEnd ? html`
        <span class="c-promo-cta__right">
          <span class="c-promo-cta__control">
            <span class="c-promo-cta__control-icon">${ARROW_SVG}</span>
          </span>
        </span>
      ` : nothing}
    </button>
  `;
}

/**
 * Decorate an existing element in place (Milo block pattern).
 *
 * @param {HTMLElement} el
 * @param {object} opts
 */
export function decoratePromoCta(el, {
  width = 'hug',
  label,
  showApp = true,
  showIconEnd,
  showIcon,
  app = 'creative-cloud',
} = {}) {
  const resolvedShowIconEnd = showIconEnd ?? showIcon ?? true;
  el.classList.add('c-promo-cta');
  el.dataset.size = 'lg';
  el.dataset.width = width;
  el.dataset.showApp = String(showApp);
  el.dataset.showIconEnd = String(resolvedShowIconEnd);

  const text = label ?? el.textContent.trim();
  el.textContent = '';

  const appEntry = APP_OPTIONS.find((o) => o.slug === app) ?? APP_OPTIONS[0];

  const left = document.createElement('span');
  left.className = 'c-promo-cta__left';

  if (showApp) {
    const iconWrap = document.createElement('span');
    iconWrap.className = 'c-promo-cta__app-icon';
    const img = document.createElement('img');
    img.src = `${CDN}/${appEntry.filename}`;
    img.alt = appEntry.label;
    img.width = 32;
    img.height = 32;
    img.style.cssText = 'border-radius:18%;display:block;';
    img.decoding = 'async';
    iconWrap.append(img);
    left.append(iconWrap);
  }

  const labelWrap = document.createElement('span');
  labelWrap.className = 'c-promo-cta__label-wrapper';
  const labelEl = document.createElement('span');
  labelEl.className = 'c-promo-cta__label';
  labelEl.textContent = text;
  labelWrap.append(labelEl);
  left.append(labelWrap);
  el.append(left);

  if (resolvedShowIconEnd) {
    const right = document.createElement('span');
    right.className = 'c-promo-cta__right';
    const control = document.createElement('span');
    control.className = 'c-promo-cta__control';
    const iconEl = document.createElement('span');
    iconEl.className = 'c-promo-cta__control-icon';
    iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M11.106 5.39376L7.50582 1.79359C7.171 1.45878 6.62859 1.45878 6.29377 1.79359C5.95895 2.12841 5.95895 2.67083 6.29377 3.00564L8.43076 5.14264H1.49997C1.0262 5.14264 0.642822 5.52601 0.642822 5.99978C0.642822 6.47355 1.0262 6.85692 1.49997 6.85692H8.43077L6.29378 8.99392C5.95896 9.32874 5.95896 9.87115 6.29378 10.206C6.46119 10.3734 6.68049 10.4571 6.8998 10.4571C7.11911 10.4571 7.33842 10.3734 7.50583 10.206L11.106 6.6058C11.4408 6.27098 11.4408 5.72858 11.106 5.39376Z" fill="currentColor"/></svg>`;
    control.append(iconEl);
    right.append(control);
    el.append(right);
  }

  return el;
}
