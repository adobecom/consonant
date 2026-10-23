/*
 * ActionCard — generated from action-card.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=action-card --target=milo
 *
 * Authored shape — one row per part, in this order:
 *   row 1  ->  .media
 *   row 2  ->  .copy
 *
 * Variants are classes on the block element:
 *   (none)
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows[0]?.classList.add('media');
  rows[1]?.classList.add('copy');

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('action-card--ready');
  return el;
}
