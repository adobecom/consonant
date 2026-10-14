/*
 * MerchCardSelectPromo — generated from merch-card-select-promo.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=merch-card-select-promo --target=milo
 *
 * Authored shape — one row per part, in this order:
 *   row 1  ->  .select-trigger
 *   row 2  ->  .helper
 *
 * Variants are classes on the block element:
 *   state: collapsed
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows[0]?.classList.add('select-trigger');
  rows[1]?.classList.add('helper');

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('merch-card-select-promo--ready');
  return el;
}
