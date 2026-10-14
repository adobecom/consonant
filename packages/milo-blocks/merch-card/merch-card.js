/*
 * MerchCard — generated from merch-card.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=merch-card --target=milo
 *
 * Authored shape — one row per part, in this order:
 *   row 1  ->  .body
 *   row 2  ->  .features
 *
 * Variants are classes on the block element:
 *   featuresList: default | closed
 *   style: default | highlight
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows[0]?.classList.add('body');
  rows[1]?.classList.add('features');

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('merch-card--ready');
  return el;
}
