/*
 * Icon — atom, generated from icon.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=icon --target=milo --system=spectrum
 *
 * An atom is never authored as rows. It is what the author already wrote,
 * upgraded in place — the shape of Milo's own decorateButtons(). A block calls
 * this on its element; the decorator finds the authored markup inside.
 *
 * Authored markup this upgrades:  span.icon
 * Classes it adds to that element:
 *   .s2a-icon
 * Variants are classes on the element (pass them in options, or let the
 * authoring cue choose):
 *   size: xs | s | m | l | xl
 */
export const AUTHORED = 'span.icon';

export default function decorateIcon(scope, options = {}) {
  const targets = scope.matches?.(AUTHORED) ? [scope] : [...scope.querySelectorAll(AUTHORED)];
  for (const el of targets) {
    const cue = el.parentElement?.nodeName;
    // Unwrap the cue, as Milo does: <strong><a> becomes <a>.
    if (cue === 'STRONG' || cue === 'EM') el.parentElement.replaceWith(el);
    // A composition can give each cue its own look: options.cues.EM.
    const chosen = { ...options, ...options.cues?.[cue] };
    el.classList.add('s2a-icon');

    if (chosen.size) el.classList.add(chosen.size);

    el.classList.add('s2a-icon--ready');
  }
  return targets;
}
