/*
 * MerchCardTrustBadge — generated from merch-card-trust-badge.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=merch-card-trust-badge --target=milo
 *
 * Authored shape — one row per part, in this order:
 *   row 1  ->  .s2-icon-lock-20-n
 *   row 2  ->  .secure-transaction
 *
 * Variants are classes on the block element:
 *   (none)
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows[0]?.classList.add('s2-icon-lock-20-n');
  rows[1]?.classList.add('secure-transaction');

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('merch-card-trust-badge--ready');
  return el;
}
