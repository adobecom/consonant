/**
 * milo-button-adapter.js — PROOF OF CONCEPT, not adopted anywhere.
 *
 * Shows the swap-in point for Milo's real `decorateButtons(el, size)`
 * (context/milo/libs/utils/decorate.js) if it called S2A's `decorateButton`
 * instead of applying its own `con-button`/`blue`/`outline` classes.
 *
 * Same authored-link selector Milo already uses:
 *   el.querySelectorAll('em a, strong a, p > a strong')
 * — i.e. this is a drop-in replacement for that one function, not a new
 * authoring convention.
 */
import { decorateButton } from './s2a-components/js/button.js';

const STYLE_BY_WRAPPER = {
  STRONG: 'solid',
  EM: 'outlined',
};

export function decorateS2AButtons(el) {
  const buttons = el.querySelectorAll('em a, strong a, p > a strong');
  buttons.forEach((button) => {
    const parent = button.parentElement;
    let target = button;
    const style = STYLE_BY_WRAPPER[parent.nodeName] || 'outlined';

    if (button.nodeName === 'STRONG') {
      target = parent;
    } else {
      parent.insertAdjacentElement('afterend', button);
      parent.remove();
    }

    decorateButton(target, { style });
  });
}
