/*
 * AppIcon — generated from app-icon.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=app-icon --target=milo
 *
 * Authored shape — one row per part, in this order:
 *   row 1  ->  .img
 *
 * Variants are classes on the block element:
 *   size: 16 | 18 | 24 | 32 | 48 | 80
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows[0]?.classList.add('img');

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('app-icon--ready');
  return el;
}
