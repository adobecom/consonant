/*
 * Button — atom, generated from button.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=button --target=milo --system=spectrum
 *
 * An atom is never authored as rows. It is what the author already wrote,
 * upgraded in place — the shape of Milo's own decorateButtons(). A block calls
 * this on its element; the decorator finds the authored markup inside.
 *
 * Authored markup this upgrades:  strong > a, em > a, a.button, button
 * Classes it adds to that element:
 *   .s2a-button, plus one variant class
 * Variants are classes on the element (pass them in options, or let the
 * authoring cue choose):
 *   variant: primary | secondary | accent | negative
 *   fillStyle: fill | outline
 *   staticColor: white | black
 *   size: s | m | l | xl
 */
export const AUTHORED = 'strong > a, em > a, a.button, button';
// Milo's authoring convention: bold = primary, italic = secondary.
const CUES = { STRONG: 'primary', EM: 'secondary' };

export default function decorateButton(scope, options = {}) {
  const targets = scope.matches?.(AUTHORED) ? [scope] : [...scope.querySelectorAll(AUTHORED)];
  for (const el of targets) {
    const cue = el.parentElement?.nodeName;
    // Unwrap the cue, as Milo does: <strong><a> becomes <a>.
    if (cue === 'STRONG' || cue === 'EM') el.parentElement.replaceWith(el);
    // A composition can give each cue its own look: options.cues.EM.
    const chosen = { ...options, ...options.cues?.[cue] };
    el.classList.add('s2a-button');
    el.classList.add(chosen.variant ?? CUES[cue] ?? 'primary');
    if (chosen.fillStyle) el.classList.add(chosen.fillStyle);
    if (chosen.staticColor) el.classList.add(chosen.staticColor);
    if (chosen.size) el.classList.add(chosen.size);
    // Parts: the text is the label; anything the author placed before or
    // after it is an icon.
    const label = document.createElement('span');
    label.className = 'label';
    const textNodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (textNodes.length) { textNodes[0].before(label); textNodes.forEach((n) => label.append(n)); }
    for (const icon of el.querySelectorAll(':scope > img, :scope > svg, :scope > picture, :scope > span.icon')) {
      const after = label.compareDocumentPosition(icon) & Node.DOCUMENT_POSITION_FOLLOWING;
      icon.classList.add('icon');
    }
    el.classList.add('s2a-button--ready');
  }
  return targets;
}
