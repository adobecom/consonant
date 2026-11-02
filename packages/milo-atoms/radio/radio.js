/*
 * Radio — atom, generated from radio.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=radio --target=milo
 *
 * An atom is never authored as rows. It is what the author already wrote,
 * upgraded in place — the shape of Milo's own decorateButtons(). A block calls
 * this on its element; the decorator finds the authored markup inside.
 *
 * Authored markup this upgrades:  .radio
 * Classes it adds to that element:
 *   .s2a-radio
 *   (no variants)
 */
export const AUTHORED = '.radio';

export default function decorateRadio(scope, options = {}) {
  const targets = scope.matches?.(AUTHORED) ? [scope] : [...scope.querySelectorAll(AUTHORED)];
  for (const el of targets) {
    const cue = el.parentElement?.nodeName;
    // Unwrap the cue, as Milo does: <strong><a> becomes <a>.
    if (cue === 'STRONG' || cue === 'EM') el.parentElement.replaceWith(el);
    el.classList.add('s2a-radio');


    // Parts: the text is the label; anything the author placed before or
    // after it is an icon.
    const label = document.createElement('span');
    label.className = 'label';
    const textNodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (textNodes.length) { textNodes[0].before(label); textNodes.forEach((n) => label.append(n)); }

    el.classList.add('s2a-radio--ready');
  }
  return targets;
}
