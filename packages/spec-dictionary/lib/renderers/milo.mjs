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
const pascal = (s) => String(s).split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");

/**
 * Atoms and blocks are different tiers in Milo, and the target has to know which
 * a contract is.
 *
 * A BLOCK is authored as rows in a document and decorated into a section of the
 * page: init(el) labels the rows. An ATOM is never authored as rows — a button
 * is an <a> the author wrote, upgraded in place by a decorator, the way Milo's
 * own decorateButtons() turns `**link**` into `.con-button`. Rendering Button as
 * a block produced a <div> with three rows: the CSS was right and the
 * JavaScript was the wrong kind of thing. The archetype says which tier; a defs
 * can also say `tier: "atom"` outright.
 */
export const ATOM_ARCHETYPES = new Set(["button", "badge / tag / chip", "checkbox / radio", "toggle / switch", "input / field", "helper text"]);
export const isAtom = (ir) => ir.component.tier === "atom" || ATOM_ARCHETYPES.has(ir.component.archetype);
const isAtomArchetype = (archetype) => ATOM_ARCHETYPES.has(archetype);

/**
 * What an author writes that means this atom, per archetype. Milo's convention
 * for buttons is bold = primary, italic = secondary; everything else is an
 * element carrying the atom's class.
 */
const AUTHORED = {
  button: "strong > a, em > a, a.button, button",
};

/** The style prop, if the atom has one, and the two values authoring cues map to. */
function cuesFor(ir) {
  // Only a prop that means "which look" can take an authoring cue; a size or a
  // state cannot be meant by bold or italic.
  const style = variantProps(ir).find((p) => /^(style|variant|kind|appearance)$/i.test(p.name));
  if (!style) return null;
  const primary = style.default != null ? String(style.default) : style.enum[0];
  const secondary = style.enum.find((v) => /outline|secondary|quiet/i.test(v) && v !== primary) ?? null;
  return { prop: style.name, primary, secondary };
}

/**
 * The atom: a decorator plus classes, nothing else. Called by blocks on their
 * own element (it finds what the author wrote), or by anything that already
 * holds the element.
 */
export function miloAtom(ir, slug) {
  const atom = kebab(slug), name = pascal(slug), cls = `s2a-${atom}`;
  const authored = AUTHORED[ir.component.archetype] ?? `.${atom}`;
  const cues = cuesFor(ir);
  const top = Object.entries(ir.anatomy.root.parts ?? {});
  const textPart = top.find(([, p]) => (p.slot?.accepts ?? []).includes("kind:text"))?.[0] ?? top.find(([n]) => /label|text/i.test(n))?.[0] ?? null;
  const iconParts = top.filter(([, p]) => (p.slot?.accepts ?? []).includes("kind:icon")).map(([n]) => n);
  const variants = variantProps(ir).map((p) => ` *   ${p.name}: ${p.enum.join(" | ")}`).join("\n");
  return `/*
 * ${ir.component.name} — atom, generated from ${slug}.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   npm run specs:render -- --slug=${slug} --target=milo
 *
 * An atom is never authored as rows. It is what the author already wrote,
 * upgraded in place — the shape of Milo's own decorateButtons(). A block calls
 * this on its element; the decorator finds the authored markup inside.
 *
 * Authored markup this upgrades:  ${authored}
 * Classes it adds to that element:
 *   .${cls}${cues ? `, plus one ${cues.prop} class` : ""}
${variants ? ` * Variants are classes on the element (pass them in options, or let the\n * authoring cue choose):\n${variants}` : " *   (no variants)"}
 */
export const AUTHORED = '${authored}';
${cues ? `// Milo's authoring convention: bold = primary, italic = secondary.
const CUES = { STRONG: '${cues.primary}', EM: '${cues.secondary ?? cues.primary}' };
` : ""}
export default function decorate${name}(scope, options = {}) {
  const targets = scope.matches?.(AUTHORED) ? [scope] : [...scope.querySelectorAll(AUTHORED)];
  for (const el of targets) {
    const cue = el.parentElement?.nodeName;
    // Unwrap the cue, as Milo does: <strong><a> becomes <a>.
    if (cue === 'STRONG' || cue === 'EM') el.parentElement.replaceWith(el);
    el.classList.add('${cls}');
${cues ? `    el.classList.add(options.${cues.prop} ?? CUES[cue] ?? '${cues.primary}');` : ""}
${variantProps(ir).filter((p) => !cues || p.name !== cues.prop).map((p) => `    if (options.${p.name}) el.classList.add(options.${p.name});`).join("\n")}
${textPart ? `    // Parts: the text is the ${textPart}; anything the author placed before or
    // after it is an icon.
    const label = document.createElement('span');
    label.className = '${kebab(textPart)}';
    const textNodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (textNodes.length) { textNodes[0].before(label); textNodes.forEach((n) => label.append(n)); }
${iconParts.length ? `    for (const icon of el.querySelectorAll(':scope > img, :scope > svg, :scope > picture, :scope > span.icon')) {
      const after = label.compareDocumentPosition(icon) & Node.DOCUMENT_POSITION_FOLLOWING;
      icon.classList.add(${iconParts.length > 1 ? `after ? '${kebab(iconParts[1])}' : '${kebab(iconParts[0])}'` : `'${kebab(iconParts[0])}'`});
    }` : ""}` : ""}
    el.classList.add('${cls}--ready');
  }
  return targets;
}
`;
}

export function miloAtomStyles(ir, slug) {
  const cls = `.s2a-${kebab(slug)}`;
  return stylesheet(ir, {
    header: [`/* ${ir.component.name} — atom, generated from ${slug}.contract.json.\n * Applied by decorate${pascal(slug)}() to the element the author wrote.\n * Re-run: npm run specs:render -- --slug=${slug} --target=milo */`],
    variant,
    selectorFor: (part) => (part.name === "root" ? cls : `${cls} .${kebab(part.name)}`),
  });
}

export function miloBlock(ir, slug, { contractFor = null } = {}) {
  const block = kebab(slug);
  const parts = Object.entries(ir.anatomy.root.parts ?? {});
  const rows = parts.map(([name], i) => ` *   row ${i + 1}  ->  .${kebab(name)}`).join("\n");
  const variants = variantProps(ir).map((p) => ` *   ${p.name}: ${p.enum.join(" | ")}`).join("\n");

  const assigns = parts.map(([name], i) =>
    `  rows[${i}]?.classList.add('${kebab(name)}');`).join("\n");
  // Composition: a slot that accepts an atom's contract is upgraded by that
  // atom's decorator, called on the block (it finds the authored markup), rather
  // than drawn again here. The atom's file sits beside the blocks.
  const atoms = new Map();
  for (const part of ir.anatomy.parts ?? []) {
    for (const accepted of part.slot?.accepts ?? []) {
      if (accepted.startsWith("kind:")) continue;
      const c = contractFor?.(accepted);
      if (c && isAtomArchetype(c.archetype) && c.slug !== slug) atoms.set(c.slug, c);
    }
  }
  const imports = [...atoms.values()].map((c) => `import decorate${pascal(c.slug)} from '../../milo-atoms/${kebab(c.slug)}/${kebab(c.slug)}.js';`).join("\n");
  const calls = [...atoms.values()].map((c) => `  decorate${pascal(c.slug)}(el);   // ${c.name}: upgrades what the author wrote, in place`).join("\n");

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
${imports ? imports + "\n\n" : ""}export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
${assigns}
${calls ? "\n" + calls + "\n" : ""}
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
  description: "Milo: an atom (decorator that upgrades authored markup) or a block (init(el) over rows), plus class-based CSS",
  // See lit.paths — the same reasoning: clearing must not need a working IR.
  // With an IR the tier is known; without one (a clear) both are named.
  paths(slug, { ir = null } = {}) {
    const k = kebab(slug);
    const block = [`packages/milo-blocks/${k}/${k}.js`, `packages/milo-blocks/${k}/${k}.css`];
    const atom = [`packages/milo-atoms/${k}/${k}.js`, `packages/milo-atoms/${k}/${k}.css`];
    return ir ? (isAtom(ir) ? atom : block) : [...block, ...atom];
  },
  files(ir, slug, { contractFor = null } = {}) {
    const [js, css] = milo.paths(slug, { ir });
    return isAtom(ir)
      ? { [js]: miloAtom(ir, slug), [css]: miloAtomStyles(ir, slug) }
      : { [js]: miloBlock(ir, slug, { contractFor }), [css]: miloStyles(ir, slug) };
  },
};
