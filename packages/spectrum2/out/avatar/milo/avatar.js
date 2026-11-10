/*
 * Avatar — generated from avatar.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=avatar --target=milo --system=spectrum
 *
 * Authored shape — one row per part, in this order:
 *   row 1  ->  .image
 *
 * Variants are classes on the block element:
 *   size: size-50 | size-75 | size-100 | size-200 | size-300 | size-400 | size-500 | size-600 | size-700 | size-800 | size-900 | size-1000 | size-1100 | size-1200 | size-1300 | size-1400 | size-1500
 *   outline: add the class to turn it on
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows[0]?.classList.add('image');

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('avatar--ready');
  return el;
}
