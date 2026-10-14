/*
 * MerchCardPricingDisplay — generated from merch-card-pricing-display.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=merch-card-pricing-display --target=milo
 *
 * Authored shape — one row per part, in this order:
 *   row 1  ->  .pricing
 *   row 2  ->  .details-zone
 *
 * Variants are classes on the block element:
 *   (none)
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows[0]?.classList.add('pricing');
  rows[1]?.classList.add('details-zone');

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('merch-card-pricing-display--ready');
  return el;
}
