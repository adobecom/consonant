// milo.mjs — the Milo target: a block that decorates authored markup.
//
// A Milo block is the opposite shape to a Lit component. Nothing renders from
// props: an author writes a table in a document, Franklin turns it into
// `<div class="block"><div><div>…` and the block's init(el) rearranges what is
// already there. Variants arrive as extra classes on the block element, taken
// from the authored block name. All 123 blocks in context/milo/libs/blocks
// follow that shape — action-item is the clearest 40-line example.
//
// So the same contract produces a very different artefact, and the mapping has
// to be stated rather than guessed:
//
//   anatomy.root            -> the block element, el
//   anatomy.root.parts[n]   -> the nth authored row (:scope > div), in order
//   props[].enum values     -> class names the author can add to the block
//   tokens / tokensByProp   -> .block / .block.variant rules
//
// The row convention is the load-bearing assumption: a part's position in the
// contract is the row an author is expected to fill. It is written into the
// generated comment so nobody has to infer it from the code.
import { stylesheet } from "./css.mjs";

const kebab = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();

/** Milo variants are classes on the block element, not attributes. */
const variant = (sel, prop, value) => `${sel}.${kebab(value)}`;

const variantProps = (ir) => ir.props.filter((p) => p.lever !== false && Array.isArray(p.enum) && p.enum.length);

export function miloBlock(ir, slug) {
  const block = kebab(slug);
  const parts = Object.entries(ir.anatomy.root.parts ?? {});
  const rows = parts.map(([name], i) => ` *   row ${i + 1}  ->  .${kebab(name)}`).join("\n");
  const variants = variantProps(ir).map((p) => ` *   ${p.name}: ${p.enum.join(" | ")}`).join("\n");

  const assigns = parts.map(([name], i) =>
    `  rows[${i}]?.classList.add('${kebab(name)}');`).join("\n");

  return `/*
 * ${ir.component.name} — generated from ${slug}.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=${slug} --target=milo
 *
 * Authored shape — one row per part, in this order:
${rows || " *   (no parts; the block is a single row)"}
 *
 * Variants are classes on the block element:
${variants || " *   (none)"}
 */
export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
${assigns}

  // Anything the author left out simply is not there — a Milo block degrades to
  // what was written rather than rendering an empty slot.
  rows.filter((r) => !r.textContent.trim() && !r.querySelector('picture, img, a')).forEach((r) => r.remove());

  el.classList.add('${block}--ready');
  return el;
}
`;
}

export function miloStyles(ir, slug) {
  const block = `.${kebab(slug)}`;
  return stylesheet(ir, {
    header: [`/* ${ir.component.name} — generated from ${slug}.contract.json.\n * Re-run: npm run specs:render -- --slug=${slug} --target=milo */`],
    variant,
    selectorFor: (part) => (part.name === "root" ? block : `${block} .${kebab(part.name)}`),
  });
}

export const milo = {
  id: "milo",
  description: "Milo block: init(el) decorator + class-based CSS",
  // See lit.paths — the same reasoning: clearing must not need a working IR.
  paths(slug) {
    const block = kebab(slug);
    return [
      `packages/milo-blocks/${block}/${block}.js`,
      `packages/milo-blocks/${block}/${block}.css`,
    ];
  },
  files(ir, slug) {
    const [js, css] = milo.paths(slug);
    return { [js]: miloBlock(ir, slug), [css]: miloStyles(ir, slug) };
  },
};
