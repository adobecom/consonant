/*
 * Collapsible — generated from collapsible.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=collapsible --target=milo
 *
 * Authored shape — one row per part, in this order:
 *   row 1  ->  .trigger
 *   row 2  ->  .content
 *
 * Variants are classes on the block element:
 *   size: default | lg
 *   style: default | control
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows[0]?.classList.add('trigger');
  rows[1]?.classList.add('content');

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('collapsible--ready');
  return el;
}
