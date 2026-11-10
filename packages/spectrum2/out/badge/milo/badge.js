/*
 * Badge — generated from badge.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=badge --target=milo --system=spectrum
 *
 * Authored shape — one row per part, in this order:
 *   row 1  ->  .icon
 *   row 2  ->  .label
 *
 * Variants are classes on the block element:
 *   variant: accent | informative | neutral | positive | notice | negative | fuchsia | indigo | magenta | purple | seafoam | yellow | gray | red | orange | chartreuse | celery | green | cyan | blue | pink | turquoise | brown | cinnamon | silver
 *   size: s | m | l | xl
 *   fixed: block-start | block-end | inline-start | inline-end
 *   subtle: add the class to turn it on
 *   outline: add the class to turn it on
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows[0]?.classList.add('icon');
  rows[1]?.classList.add('label');

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('badge--ready');
  return el;
}
