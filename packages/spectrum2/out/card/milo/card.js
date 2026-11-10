/*
 * Card — generated from card.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=card --target=milo --system=spectrum
 *
 * Authored shape — one row per part, in this order:
 *   row 1  ->  .media
 *   row 2  ->  .collection
 *   row 3  ->  .content
 *
 * Variants are classes on the block element:
 *   variant: primary | secondary | tertiary | quiet
 *   density: compact | regular | spacious
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows[0]?.classList.add('media');
  rows[1]?.classList.add('collection');
  rows[2]?.classList.add('content');

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('card--ready');
  return el;
}
