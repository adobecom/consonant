/*
 * ControlButton — atom, generated from control-button.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=control-button --target=milo
 *
 * An atom is never authored as rows. It is what the author already wrote,
 * upgraded in place — the shape of Milo's own decorateButtons(). A block calls
 * this on its element; the decorator finds the authored markup inside.
 *
 * Authored markup this upgrades:  strong > a, em > a, a.button, button
 * Classes it adds to that element:
 *   .s2a-control-button
 * Variants are classes on the element (pass them in options, or let the
 * authoring cue choose):
 *   size: xl | md
 *   forceState: default | hover | active | disabled | focus
 */
export const AUTHORED = 'strong > a, em > a, a.button, button';

export default function decorateControlButton(scope, options = {}) {
  const targets = scope.matches?.(AUTHORED) ? [scope] : [...scope.querySelectorAll(AUTHORED)];
  for (const el of targets) {
    const cue = el.parentElement?.nodeName;
    // Unwrap the cue, as Milo does: <strong><a> becomes <a>.
    if (cue === 'STRONG' || cue === 'EM') el.parentElement.replaceWith(el);
    // A composition can give each cue its own look: options.cues.EM.
    const chosen = { ...options, ...options.cues?.[cue] };
    el.classList.add('s2a-control-button');

    if (chosen.size) el.classList.add(chosen.size);
    if (chosen.forceState) el.classList.add(chosen.forceState);

    el.classList.add('s2a-control-button--ready');
  }
  return targets;
}
