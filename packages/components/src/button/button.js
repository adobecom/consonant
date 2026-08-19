import './button.css';

const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M0.642896 3.64278C0.642896 3.42347 0.726604 3.20417 0.894012 3.03676C1.22883 2.70194 1.77125 2.70194 2.10606 3.03676L6.00004 6.93073L9.89401 3.03676C10.2288 2.70194 10.7712 2.70194 11.1061 3.03676C11.4409 3.37157 11.4409 3.91399 11.1061 4.24881L6.60606 8.74881C6.27125 9.08363 5.72883 9.08363 5.39401 8.74881L0.894012 4.24881C0.726604 4.0814 0.642896 3.86209 0.642896 3.64278Z" fill="currentColor"/></svg>`;

const STYLES = ['solid', 'outlined', 'transparent', 'accent', 'knockout', 'outline-inverse'];

/**
 * Map v1 props (background/intent/context) to a v2 style.
 * v2 has no Context axis — page theme comes from the S2A variable modes
 * (:root[data-theme]); the old on-dark variants became first-class styles
 * (solid/on-dark → knockout, outlined/on-dark → outline-inverse).
 */
function resolveStyle({ style, background, intent, context } = {}) {
  if (style && STYLES.includes(style)) return style;
  if (intent === 'accent') return 'accent';
  if (background === 'solid' && context === 'on-dark') return 'knockout';
  if (background === 'outlined' && context === 'on-dark') return 'outline-inverse';
  if (STYLES.includes(background)) return background;
  return 'solid';
}

function makeIconSpan(modifier, content) {
  const wrap = document.createElement('span');
  wrap.className = `c-button__icon c-button__icon--${modifier}`;
  wrap.setAttribute('aria-hidden', 'true');
  if (content instanceof Node) {
    wrap.append(content);
  } else if (typeof content === 'string') {
    wrap.innerHTML = content;
  }
  return wrap;
}

/**
 * Decorate an existing <a> or <button> in place.
 * Milo pattern: the block hands you authored DOM, you reshape it.
 *
 * Matches Figma "Button — v2" component set (node 10715:35477).
 *
 * @param {HTMLElement} el
 * @param {object} opts
 * @param {'solid'|'outlined'|'transparent'|'accent'|'knockout'|'outline-inverse'} opts.style
 * @param {'md'} opts.size
 * @param {boolean} opts.disabled
 */
export function decorateButton(el, opts = {}) {
  const { size = 'md', disabled = false } = opts;

  el.classList.add('c-button');
  el.dataset.style = resolveStyle(opts);
  el.dataset.size = size;

  if (!el.querySelector('.c-button__label')) {
    const text = el.textContent.trim();
    el.textContent = '';
    const label = document.createElement('span');
    label.className = 'c-button__label';
    label.textContent = text;
    el.append(label);
  }

  if (disabled) {
    if (el.tagName === 'BUTTON') {
      el.disabled = true;
    } else {
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('tabindex', '-1');
      el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); }, { capture: true });
    }
  }

  return el;
}

/**
 * Create a new S2A button element from scratch.
 * Storybook and programmatic use — when there's no authored DOM to decorate.
 *
 * Matches Figma "Button — v2" component set (node 10715:35477):
 * Style × Size × State, plus Label / Show Icon Start / Show Icon End props.
 * There is no context prop — light/dark theming flows from the S2A variable
 * modes (:root[data-theme="light|dark"]). knockout and outline-inverse are
 * the styles for always-dark media surfaces.
 *
 * @param {object} opts
 * @param {string} opts.label
 * @param {string} [opts.href]        - renders <a> when set, <button> otherwise
 * @param {'solid'|'outlined'|'transparent'|'accent'|'knockout'|'outline-inverse'} opts.style
 * @param {'md'} opts.size
 * @param {'default'|'hover'|'active'|'focus'|'disabled'} opts.state
 * @param {boolean} opts.showIconStart
 * @param {boolean} opts.showIconEnd
 * @param {Node|string} opts.iconStart  - DOM node or HTML string
 * @param {Node|string} opts.iconEnd    - DOM node or HTML string; defaults to caret
 * @param {Function} opts.onClick
 */
export function createButton(opts = {}) {
  const {
    label = 'Label',
    href,
    size = 'md',
    state = 'default',
    showIconStart = false,
    showIconEnd = false,
    iconStart,
    iconEnd,
    onClick,
  } = opts;

  const isDisabled = state === 'disabled';
  const forceState = state !== 'default' ? state : null;

  const el = document.createElement(href ? 'a' : 'button');

  if (href) {
    if (!isDisabled) el.href = href;
    if (isDisabled) {
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('tabindex', '-1');
      el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); }, { capture: true });
    }
  } else {
    el.type = 'button';
    if (isDisabled) el.disabled = true;
  }

  el.classList.add('c-button');
  el.dataset.style = resolveStyle(opts);
  el.dataset.size = size;
  el.dataset.hasIconStart = String(showIconStart);
  el.dataset.hasIconEnd = String(showIconEnd);
  if (forceState) el.dataset.forceState = forceState;

  if (onClick && !isDisabled) el.addEventListener('click', onClick);

  if (showIconStart) el.append(makeIconSpan('start', iconStart));

  const labelEl = document.createElement('span');
  labelEl.className = 'c-button__label';
  labelEl.textContent = label;
  el.append(labelEl);

  if (showIconEnd) el.append(makeIconSpan('end', iconEnd ?? CHEVRON_DOWN));

  return el;
}
