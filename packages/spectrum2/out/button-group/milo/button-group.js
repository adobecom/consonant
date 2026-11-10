/*
 * ButtonGroup — generated from button-group.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=button-group --target=milo --system=spectrum
 *
 * Authored shape — one row per part, in this order:
 *   (no parts; the block is a single row)
 *
 * Variants are classes on the block element:
 *   size: s | m | l | xl
 *   orientation: horizontal | vertical
 *   align: start | center | end
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];


  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('button-group--ready');
  return el;
}
