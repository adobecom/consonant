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

/** The command that re-renders this contract, written into its generated header. */
const rerun = (ir, slug) => `npm run specs:render -- --slug=${slug} --target=milo${(ir.component.system ?? "s2a") === "s2a" ? "" : ` --system=${ir.component.system}`}`;

const kebab = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();

/** Milo variants are classes on the block element, not attributes. */
// A class cannot start with a digit (`.500` does not parse, so the whole rule is
// dropped), so a numeric value carries its prop: Avatar's size 500 is `.size-500`.
const valueClass = (prop, value) => (/^\d/.test(String(value)) ? `${kebab(prop)}-${kebab(value)}` : kebab(value));
// A value is a class on the block. A boolean prop is a flag: true is the prop's own
// class (`.subtle`), false is its absence. Writing the value made `.true`, which no
// decorator or author ever adds, so every boolean rule silently matched nothing.
const variant = (sel, prop, value) => (String(value) === "true" ? `${sel}.${kebab(prop)}`
  : String(value) === "false" ? `${sel}:not(.${kebab(prop)})` : `${sel}.${valueClass(prop, value)}`);

const variantProps = (ir) => ir.props.filter((p) => p.lever !== false && Array.isArray(p.enum) && p.enum.length);
// Only booleans a style rule keys on are classes; a show-* toggle is content, not a class.
const styledProps = (part, out = new Set()) => {
  if (!part) return out;
  for (const e of part.tokensByProp ?? []) out.add(e.prop);
  for (const e of part.statesByProp ?? []) out.add(e.prop);
  for (const e of part.tokensByCombination ?? []) e.props.forEach((p) => out.add(p));
  for (const r of part["x-compound"] ?? []) Object.keys(r.when ?? {}).forEach((p) => out.add(p));
  for (const c of Object.values(part.parts ?? {})) styledProps(c, out);
  return out;
};
const flagProps = (ir) => { const styled = styledProps(ir.anatomy?.root); return ir.props.filter((p) => p.lever !== false && p.type === "boolean" && styled.has(p.name)); };
const variantLines = (ir) => [...variantProps(ir).map((p) => ` *   ${p.name}: ${p.enum.map((v) => valueClass(p.name, v)).join(" | ")}`),
  ...flagProps(ir).map((p) => ` *   ${kebab(p.name)}: add the class to turn it on`)].join("\n");
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
const isAtomContract = (c) => c.tier === "atom" || ATOM_ARCHETYPES.has(c.archetype);

/** Where one generated file imports another from: atoms of ours are promoted, another system's sit beside their contract. */
const atomImport = (ir, c) => (ir.component.system ?? "s2a") === "s2a" ? `../../milo-atoms/${kebab(c.slug)}/${kebab(c.slug)}` : `../../${kebab(c.slug)}/milo/${kebab(c.slug)}`;

/** Every atom this contract's slots name, with the options each slot passes. */
function composedAtoms(ir, slug, contractFor) {
  const out = [];
  for (const part of ir.anatomy.parts ?? []) {
    for (const accepted of part.slot?.accepts ?? []) {
      if (accepted.startsWith("kind:")) continue;
      const c = contractFor?.(accepted);
      if (c && isAtomContract(c) && c.slug !== slug) out.push({ part: part.name, contract: c, options: part.slot["x-options"] ?? null, root: part.name === "root" });
    }
  }
  return out;
}
const importsOf = (ir, atoms) => [...new Map(atoms.map((a) => [a.contract.slug, a.contract])).values()]
  .map((c) => `import decorate${pascal(c.slug)} from '${atomImport(ir, c)}.js';`).join("\n");

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
export function miloAtom(ir, slug, { contractFor = null } = {}) {
  const atom = kebab(slug), name = pascal(slug), cls = `s2a-${atom}`;
  const authored = ir.component.authored?.selector ?? AUTHORED[ir.component.archetype] ?? `.${atom}`;
  if (ir.component.authored?.build === "select") return miloSelectAtom(ir, slug);
  if (ir.component.authored?.build === "parts") return miloPartsAtom(ir, slug, contractFor);
  const cues = cuesFor(ir);
  const top = Object.entries(ir.anatomy.root.parts ?? {});
  const textPart = top.find(([, p]) => (p.slot?.accepts ?? []).includes("kind:text"))?.[0] ?? top.find(([n]) => /label|text/i.test(n))?.[0] ?? null;
  const iconParts = top.filter(([, p]) => (p.slot?.accepts ?? []).includes("kind:icon")).map(([n]) => n);
  const variants = variantLines(ir);
  return `/*
 * ${ir.component.name} — atom, generated from ${slug}.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   ${rerun(ir, slug)}
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
    // A composition can give each cue its own look: options.cues.EM.
    const chosen = { ...options, ...options.cues?.[cue] };
    el.classList.add('${cls}');
${cues ? `    el.classList.add(chosen.${cues.prop} ?? CUES[cue] ?? '${cues.primary}');` : ""}
${variantProps(ir).filter((p) => !cues || p.name !== cues.prop).map((p) => `    if (chosen.${p.name}) el.classList.add(chosen.${p.name});`).join("\n")}${flagProps(ir).map((p) => `\n    if (chosen.${p.name}) el.classList.add('${kebab(p.name)}');`).join("")}
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

/**
 * A choice the author writes as a list: a native <select> does the choosing, so
 * keyboard, screen readers and mobile pickers all come free, and the contract
 * only styles the trigger. A paragraph right after the list is the help text.
 */
function miloSelectAtom(ir, slug) {
  const atom = kebab(slug), name = pascal(slug), cls = `s2a-${atom}`;
  const has = new Set(ir.anatomy.parts.map((p) => p.name));
  for (const part of ["field", "value", "chevron", "help-text"]) if (!has.has(part)) throw new Error(`${slug}: build "select" needs a ${part} part`);
  const label = ir.props.find((p) => p.name === "label")?.default ?? "";
  const variants = variantLines(ir);
  return `/*
 * ${ir.component.name} — atom, generated from ${slug}.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   ${rerun(ir, slug)}
 *
 * Authored markup this upgrades:  ${ir.component.authored.selector}, one item per option, optional <p> after it
 * Variants are classes on the root:
${variants}
 */
export const AUTHORED = '${ir.component.authored.selector}';

export default function decorate${name}(scope, options = {}) {
  const targets = scope.matches?.(AUTHORED) ? [scope] : [...scope.querySelectorAll(AUTHORED)];
  return targets.map((list) => {
    const root = document.createElement('div');
    root.className = '${cls}';
${variantProps(ir).map((p) => `    if (options.${p.name}) root.classList.add(options.${p.name});`).join("\n")}${flagProps(ir).map((p) => `\n    if (options.${p.name}) root.classList.add('${kebab(p.name)}');`).join("")}
    const field = document.createElement('div');
    field.className = 'field';
    const select = document.createElement('select');
    select.className = 'value';
    // S2's design hides the visible label here, so the name has to come from somewhere.
    select.setAttribute('aria-label', options.label ?? ${JSON.stringify(label)});
    [...list.children].forEach((item) => select.add(new Option(item.textContent.trim())));
    const chevron = document.createElement('span');
    chevron.className = 'chevron';
    chevron.setAttribute('aria-hidden', 'true');
    field.append(select, chevron);
    const help = list.nextElementSibling?.matches('p') ? list.nextElementSibling : null;
    list.replaceWith(root);
    root.append(field);
    if (help) {
      help.classList.add('help-text');
      root.append(help);
    }
    root.classList.add('${cls}--ready');
    return root;
  });
}
`;
}

/** Labels a part's direct children: by x-match, else by position. Emitted as data so the code stays short. */
const kidsOf = (part) => Object.entries(part.parts ?? {}).map(([n, k]) => ({ name: kebab(n), ...(k["x-match"] ? { match: k["x-match"] } : {}) }));
const MARK = `function mark(parent, kids) {
  const children = [...parent.children];
  kids.forEach(({ name, match }, i) => {
    const kid = match ? parent.querySelector(\`:scope > \${match}\`) : children[i];
    kid?.classList.add(name);
  });
}`;
const callsOf = (atoms, indent, rootVar) => atoms.map((a) => {
  const target = a.root ? rootVar : `${rootVar}.querySelector('.${kebab(a.part)}')`;
  return `${indent}if (${target}) decorate${pascal(a.contract.slug)}(${target}${a.options ? `, ${JSON.stringify(a.options)}` : ""});   // ${a.contract.name}`;
}).join("\n");

/** An atom made of other atoms: label what the author wrote, then call each one. */
function miloPartsAtom(ir, slug, contractFor) {
  const atom = kebab(slug), name = pascal(slug), cls = `s2a-${atom}`;
  const atoms = composedAtoms(ir, slug, contractFor);
  const imports = importsOf(ir, atoms);
  return `/*
 * ${ir.component.name} — atom, generated from ${slug}.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   ${rerun(ir, slug)}
 *
 * Authored markup this upgrades:  ${ir.component.authored.selector}
 * Its children, each optional:
${kidsOf(ir.anatomy.root).map((k) => ` *   ${k.match ?? "by position"}  ->  .${k.name}`).join("\n")}
 */
${imports ? imports + "\n\n" : ""}export const AUTHORED = '${ir.component.authored.selector}';
const KIDS = ${JSON.stringify(kidsOf(ir.anatomy.root))};

${MARK}

export default function decorate${name}(scope) {
  const targets = scope.matches?.(AUTHORED) ? [scope] : [...scope.querySelectorAll(AUTHORED)];
  for (const el of targets) {
    el.classList.add('${cls}');
    mark(el, KIDS);
${callsOf(atoms, "    ", "el")}
    el.classList.add('${cls}--ready');
  }
  return targets;
}
`;
}

/**
 * A block whose parts say which authored row each one is (x-row). A part with
 * children and no x-row is a wrapper the block creates: a document can only hold
 * a flat list of rows, and the card's surfaces group them.
 */
function layoutOf(parts) {
  return Object.entries(parts ?? {}).map(([n, p]) => (p["x-row"] !== undefined
    ? { row: kebab(n), ...(p["x-row"] === "inline" ? { inline: true } : {}), ...(p.parts ? { kids: kidsOf(p) } : {}) }
    : { wrap: kebab(n), parts: layoutOf(p.parts) }));
}
const hasRows = (parts) => Object.values(parts ?? {}).some((p) => p["x-row"] !== undefined || hasRows(p.parts));
const rowLines = (parts, out = []) => {
  for (const [n, p] of Object.entries(parts ?? {})) {
    if (p["x-row"] !== undefined) out.push(` *   row ${out.length + 1}  ->  .${kebab(n)}${p.slot ? `  (${p.slot.accepts.join(", ")})` : ""}`);
    else rowLines(p.parts, out);
  }
  return out;
};

function miloRowsBlock(ir, slug, contractFor) {
  const block = kebab(slug);
  const atoms = composedAtoms(ir, slug, contractFor);
  const imports = importsOf(ir, atoms);
  return `/*
 * ${ir.component.name} — generated from ${slug}.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   ${rerun(ir, slug)}
 *
 * Authored shape — one row per part, in this order:
${rowLines(ir.anatomy.root.parts).join("\n")}
 */
${imports ? imports + "\n\n" : ""}const LAYOUT = ${JSON.stringify(layoutOf(ir.anatomy.root.parts))};

${MARK}

/** Rows into the contract's wrappers. A row the author left out is simply not there. */
function place(specs, rows, parent, marks) {
  for (const spec of specs) {
    if (spec.wrap) {
      const group = document.createElement('div');
      group.className = spec.wrap;
      place(spec.parts, rows, group, marks);
      if (group.children.length) parent.append(group);
    } else {
      const row = rows.shift();
      if (!row || (!row.textContent.trim() && !row.querySelector('picture, img, a, hr'))) continue;
      // Franklin gives each row one cell; an inline row is one paragraph in it.
      const cell = row.children.length === 1 ? row.firstElementChild : null;
      if (cell?.nodeName === 'DIV') cell.replaceWith(...cell.childNodes);
      const only = row.children.length === 1 ? row.firstElementChild : null;
      if (spec.inline && only?.nodeName === 'P') only.replaceWith(...only.childNodes);
      row.classList.add(spec.row);
      parent.append(row);
      if (spec.kids) marks.push([row, spec.kids]);
    }
  }
}

export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  const marks = [];
  rows.forEach((row) => row.remove());
  place(LAYOUT, rows, el, marks);
${callsOf(atoms, "  ", "el")}
  // After the atoms: a decorator can replace what it was given.
  marks.forEach(([row, kids]) => mark(row, kids));
  el.classList.add('${block}--ready');
  return el;
}
`;
}

export function miloAtomStyles(ir, slug, { adapt = null } = {}) {
  const cls = `.s2a-${kebab(slug)}`;
  return stylesheet(ir, {
    header: [`/* ${ir.component.name} — atom, generated from ${slug}.contract.json.\n * Applied by decorate${pascal(slug)}() to the element the author wrote.\n * Re-run: ${rerun(ir, slug)} */`],
    variant,
    adapt,
    selectorFor: (part) => (part.name === "root" ? cls : `${cls} .${kebab(part.name)}`),
  });
}

export function miloBlock(ir, slug, { contractFor = null } = {}) {
  if (hasRows(ir.anatomy.root.parts)) return miloRowsBlock(ir, slug, contractFor);
  const block = kebab(slug);
  const parts = Object.entries(ir.anatomy.root.parts ?? {});
  const rows = parts.map(([name], i) => ` *   row ${i + 1}  ->  .${kebab(name)}`).join("\n");
  const variants = variantLines(ir);

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
      if (c && isAtomContract(c) && c.slug !== slug) atoms.set(c.slug, c);
    }
  }
  const imports = [...atoms.values()].map((c) => `import decorate${pascal(c.slug)} from '../../milo-atoms/${kebab(c.slug)}/${kebab(c.slug)}.js';`).join("\n");
  const calls = [...atoms.values()].map((c) => `  decorate${pascal(c.slug)}(el);   // ${c.name}: upgrades what the author wrote, in place`).join("\n");

  return `/*
 * ${ir.component.name} — generated from ${slug}.contract.json by spec-dictionary.
 * Do not edit by hand; change the contract and re-run:
 *   ${rerun(ir, slug)}
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

export function miloStyles(ir, slug, { adapt = null } = {}) {
  const block = `.${kebab(slug)}`;
  return stylesheet(ir, {
    header: [`/* ${ir.component.name} — generated from ${slug}.contract.json.\n * Re-run: ${rerun(ir, slug)} */`],
    variant,
    adapt,
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
    // Another system's contract never lands on top of our own atom of the same
    // name. It renders beside its contract until it is promoted.
    if (ir && (ir.component.system ?? "s2a") !== "s2a") return [`packages/spectrum2/out/${k}/milo/${k}.js`, `packages/spectrum2/out/${k}/milo/${k}.css`];
    const block = [`packages/milo-blocks/${k}/${k}.js`, `packages/milo-blocks/${k}/${k}.css`];
    const atom = [`packages/milo-atoms/${k}/${k}.js`, `packages/milo-atoms/${k}/${k}.css`];
    return ir ? (isAtom(ir) ? atom : block) : [...block, ...atom];
  },
  files(ir, slug, { contractFor = null, adapt = null } = {}) {
    if ((ir.component.system ?? "s2a") !== "s2a" && !adapt) throw new Error(`${slug}: Milo never loads ${ir.component.system}'s tokens; this render needs the token map`);
    const [js, css] = milo.paths(slug, { ir });
    return isAtom(ir)
      ? { [js]: miloAtom(ir, slug, { contractFor }), [css]: miloAtomStyles(ir, slug, { adapt }) }
      : { [js]: miloBlock(ir, slug, { contractFor }), [css]: miloStyles(ir, slug, { adapt }) };
  },
};
