import './button.css';

const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M0.642896 3.64278C0.642896 3.42347 0.726604 3.20417 0.894012 3.03676C1.22883 2.70194 1.77125 2.70194 2.10606 3.03676L6.00004 6.93073L9.89401 3.03676C10.2288 2.70194 10.7712 2.70194 11.1061 3.03676C11.4409 3.37157 11.4409 3.91399 11.1061 4.24881L6.60606 8.74881C6.27125 9.08363 5.72883 9.08363 5.39401 8.74881L0.894012 4.24881C0.726604 4.0814 0.642896 3.86209 0.642896 3.64278Z" fill="currentColor"/></svg>`;

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
 * @param {HTMLElement} el
 * @param {object} opts
 * @param {'solid'|'outlined'|'transparent'} opts.background
 * @param {'on-light'|'on-dark'} opts.context
 * @param {'primary'|'accent'} opts.intent
 * @param {'md'|'xs'} opts.size
 * @param {boolean} opts.disabled
 */
export function decorateButton(el, {
  background = 'solid',
  context = 'on-light',
  intent = 'primary',
  size = 'md',
  disabled = false,
} = {}) {
  el.classList.add('c-button');
  el.dataset.background = background;
  el.dataset.intent = intent;
  el.dataset.context = context;
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
 * @param {object} opts
 * @param {string} opts.label
 * @param {string} [opts.href]        - renders <a> when set, <button> otherwise
 * @param {'solid'|'outlined'|'transparent'} opts.background
 * @param {'on-light'|'on-dark'} opts.context
 * @param {'primary'|'accent'} opts.intent
 * @param {'md'|'xs'} opts.size
 * @param {'default'|'hover'|'active'|'focus'|'disabled'} opts.state
 * @param {boolean} opts.showIconStart
 * @param {boolean} opts.showIconEnd
 * @param {Node|string} opts.iconStart  - DOM node or HTML string
 * @param {Node|string} opts.iconEnd    - DOM node or HTML string; defaults to caret
 * @param {Function} opts.onClick
 */
export function createButton({
  label = 'Label',
  href,
  background = 'solid',
  context = 'on-light',
  intent = 'primary',
  size = 'md',
  state = 'default',
  showIconStart = false,
  showIconEnd = false,
  iconStart,
  iconEnd,
  onClick,
} = {}) {
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
  el.dataset.background = background;
  el.dataset.intent = intent;
  el.dataset.context = context;
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
