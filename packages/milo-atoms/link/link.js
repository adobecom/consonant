/*
 * Link — atom, generated from link.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=link --target=milo
 *
 * An atom is never authored as rows. It is what the author already wrote,
 * upgraded in place — the shape of Milo's own decorateButtons(). A block calls
 * this on its element; the decorator finds the authored markup inside.
 *
 * Authored markup this upgrades:  strong > a, em > a, a.button, button
 * Classes it adds to that element:
 *   .s2a-link, plus one kind class
 * Variants are classes on the element (pass them in options, or let the
 * authoring cue choose):
 *   emphasis: default | subtle
 *   kind: action | text
 */
export const AUTHORED = 'strong > a, em > a, a.button, button';
// Milo's authoring convention: bold = primary, italic = secondary.
const CUES = { STRONG: 'action', EM: 'action' };

export default function decorateLink(scope, options = {}) {
  const targets = scope.matches?.(AUTHORED) ? [scope] : [...scope.querySelectorAll(AUTHORED)];
  for (const el of targets) {
    const cue = el.parentElement?.nodeName;
    // Unwrap the cue, as Milo does: <strong><a> becomes <a>.
    if (cue === 'STRONG' || cue === 'EM') el.parentElement.replaceWith(el);
    // A composition can give each cue its own look: options.cues.EM.
    const chosen = { ...options, ...options.cues?.[cue] };
    el.classList.add('s2a-link');
    el.classList.add(chosen.kind ?? CUES[cue] ?? 'action');
    if (chosen.emphasis) el.classList.add(chosen.emphasis);
    // Parts: the text is the label-wrap; anything the author placed before or
    // after it is an icon.
    const label = document.createElement('span');
    label.className = 'label-wrap';
    const textNodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (textNodes.length) { textNodes[0].before(label); textNodes.forEach((n) => label.append(n)); }

    el.classList.add('s2a-link--ready');
  }
  return targets;
}
