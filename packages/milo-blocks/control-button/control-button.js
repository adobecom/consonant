/*
 * ControlButton — generated from control-button.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=control-button --target=milo
 *
 * Authored shape — one row per part, in this order:
 *   row 1  ->  .frame
 *   row 2  ->  .icon
 *
 * Variants are classes on the block element:
 *   size: xl | md
 *   forceState: default | hover | active | disabled | focus
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows[0]?.classList.add('frame');
  rows[1]?.classList.add('icon');

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('control-button--ready');
  return el;
}
