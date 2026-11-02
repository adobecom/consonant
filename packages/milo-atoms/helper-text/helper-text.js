/*
 * HelperText — atom, generated from helper-text.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=helper-text --target=milo
 *
 * An atom is never authored as rows. It is what the author already wrote,
 * upgraded in place — the shape of Milo's own decorateButtons(). A block calls
 * this on its element; the decorator finds the authored markup inside.
 *
 * Authored markup this upgrades:  .helper-text
 * Classes it adds to that element:
 *   .s2a-helper-text
 * Variants are classes on the element (pass them in options, or let the
 * authoring cue choose):
 *   intent: neutral | error
 */
export const AUTHORED = '.helper-text';

export default function decorateHelperText(scope, options = {}) {
  const targets = scope.matches?.(AUTHORED) ? [scope] : [...scope.querySelectorAll(AUTHORED)];
  for (const el of targets) {
    const cue = el.parentElement?.nodeName;
    // Unwrap the cue, as Milo does: <strong><a> becomes <a>.
    if (cue === 'STRONG' || cue === 'EM') el.parentElement.replaceWith(el);
    el.classList.add('s2a-helper-text');

    if (options.intent) el.classList.add(options.intent);
    // Parts: the text is the text; anything the author placed before or
    // after it is an icon.
    const label = document.createElement('span');
    label.className = 'text';
    const textNodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (textNodes.length) { textNodes[0].before(label); textNodes.forEach((n) => label.append(n)); }

    el.classList.add('s2a-helper-text--ready');
  }
  return targets;
}
