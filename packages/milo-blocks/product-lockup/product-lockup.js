/*
 * ProductLockup — generated from product-lockup.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=product-lockup --target=milo
 *
 * Authored shape — one row per part, in this order:
 *   row 1  ->  .frame-1
 *   row 2  ->  .s2a-icon-chevron-right
 *
 * Variants are classes on the block element:
 *   orientation: horizontal | vertical
 *   style: label | eyebrow | knockout | inverse
 *   width: hug | fill
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows[0]?.classList.add('frame-1');
  rows[1]?.classList.add('s2a-icon-chevron-right');

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('product-lockup--ready');
  return el;
}
