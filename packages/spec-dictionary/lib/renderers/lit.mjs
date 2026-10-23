// lit.mjs — the Storybook target: a Lit function component plus its stories.
//
// This is the S2A shape: props in, template out, variants as data attributes so
// a story can force any combination. It is the renderer whose output a designer
// actually looks at, which is why the stories come from the same contract
// rather than being written by hand against it.
import { stylesheet } from "./css.mjs";

const pascal = (s) => s.split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
import { stateProp } from "../formats/matrix.mjs";
import { STATE_ATTR } from "./css.mjs";

const camel = (s) => { const p = pascal(s); return p[0].toLowerCase() + p.slice(1); };
const q = (v) => JSON.stringify(v);

/** Variants select on data attributes, so a story can set one without a class dance. */
const variant = (sel, prop, value) => `${sel}[data-${kebab(prop)}="${value}"]`;
const kebab = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// Levers, plus the state prop — see stateProp: the one non-lever a story has to
// be able to set.
const constCase = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]+/g, "_");

/** Every asset manifest this component's anatomy refers to, deduped. */
function assetManifests(ir) {
  const out = new Set();
  const walk = (n) => { if (n?.asset?.manifest) out.add(n.asset.manifest); if (n?.slot?.default?.manifest && n?.slot?.default?.icon) out.add(n.slot.default.manifest); for (const c of Object.values(n?.parts ?? {})) walk(c); };
  walk(ir.anatomy.root);
  return [...out];
}

const litProps = (ir) => {
  const st = stateProp(ir);
  return ir.props.filter((p) => p.lever !== false || (st && p.name === st.name));
};

/**
 * Which generated child renders in a composed slot, and with what. The slot's
 * default names the design's instance (a component set) and the overrides the
 * design set on it; the child's contract says which code prop each override
 * is. The caller supplies contractFor(): the CLI reads contract.json files, the
 * Book reads its registry. No contract, no child — the slot renders empty and
 * says so in a comment, which is the honest state before the leaf is done.
 */
function childFor(part, contractFor) {
  const D = part.slot?.default;
  if (!D || D.text !== undefined || D.icon) return null;
  const key = D.slug ?? part.slot.accepts?.[0];
  if (!key || !contractFor) return null;
  const c = contractFor(key);
  if (!c?.slug) return null;
  const name = pascal(c.slug);
  const byFigma = new Map((c.props ?? []).map((p) => [String(p.bindings?.figma?.property ?? "").split("#")[0].trim().toLowerCase(), p]));
  const args = {};
  // What the child discloses or wraps: rendered through ITS child's contract,
  // passed as the child's content prop (its Figma Slot, or content/children).
  let contentSrc = null;
  if (D.content) {
    const inner = childFor({ slot: { ...part.slot, default: D.content } }, contractFor);
    const contentProp = (c.props ?? []).find((p) => p.type === "expression" || /^(content|children)$/i.test(p.name));
    if (inner && contentProp) contentSrc = { prop: camel(contentProp.name), call: `${inner.name}(${inner.argsSrc})`, inner };
  }
  for (const [k, v] of Object.entries(D.props ?? {})) {
    const p = byFigma.get(String(k).split("#")[0].trim().toLowerCase());
    if (!p) continue;
    const map = p.bindings?.figma?.valueMap;
    let value = v;
    if (map) { const hit = Object.entries(map).find(([, axis]) => axis === v)?.[0]; if (hit !== undefined) value = p.type === "boolean" ? hit === "true" : hit; }
    else if (typeof v === "string" && p.type !== "text" && p.type !== "string") value = v.toLowerCase();
    else if (typeof v === "string" && Array.isArray(p.enum)) value = v.toLowerCase();
    args[camel(p.name)] = value;
  }
  // Source for the call: literals as JSON, content as the nested call.
  const entries = Object.entries(args).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`);
  if (contentSrc) entries.push(`${JSON.stringify(contentSrc.prop)}:${contentSrc.call}`);
  return { slug: c.slug, name, args, argsSrc: `{${entries.join(",")}}`, figma: D.figma, inner: contentSrc?.inner ?? null };
}

function template(ir, slug, { contractFor } = {}) {
  const root = ir.anatomy.root;
  const cls = `c-${slug}`;
  const attrProps = litProps(ir).filter((p) =>
    (p.type === "string" && Array.isArray(p.enum) && p.enum.length)
    // A boolean standing in for a two-value axis (open|closed) is an
    // attribute too — the stylesheet keys on data-open="true".
    || (p.type === "boolean" && p.bindings?.figma?.kind === "VARIANT" && p.bindings.figma.valueMap));
  const st = stateProp(ir);
  const dataAttrs = attrProps.map((p) => {
    // The resting state is the absence of a forced one: emitting
    // data-state="default" would put an attribute in the DOM that no rule
    // matches and that the overlay would show as a difference from the design.
    const expr = st && p.name === st.name
      ? `\${${camel(p.name)} && ${camel(p.name)} !== ${q(st.default ?? "default")} ? ${camel(p.name)} : nothing}`
      : p.type === "boolean" ? `\${String(${camel(p.name)})}` : `\${${camel(p.name)}}`;
    // The state prop may be called anything (state, forceState); the attribute
    // is always STATE_ATTR, because that is what the stylesheet's forced twins
    // match. Named after the prop, a forceState prop wrote data-force-state and
    // every forced cell in the matrix rendered at rest.
    const attr = st && p.name === st.name ? STATE_ATTR : `data-${kebab(p.name)}`;
    return `        ${attr}=${expr}`;
  }).join("\n");

  // A part is a structural element; a prop is content. They coincide often
  // enough (label, iconStart) that this used to interpolate a variable named
  // after the part and assume it existed — so a part with no matching prop
  // emitted `${img}` and the module threw ReferenceError before rendering
  // anything. AppIcon has exactly that shape: .c-app-icon__img is structure,
  // and its content is derived from the `app` prop by logic no contract holds.
  const propNames = new Set(litProps(ir).map((p) => camel(p.name)));
  const children = new Map();
  // Behaviour the archetype carries. A disclosure's trigger is a <button> that
  // says whether it is open and what it controls; its content is a region that
  // is hidden — from everyone — when closed. Read from the contract's
  // archetype, not guessed from layer names alone.
  const archetype = ir.component?.archetype ?? null;
  const openProp = litProps(ir).find((p) => p.type === "boolean" && p.bindings?.figma?.kind === "VARIANT" && p.bindings.figma.valueMap) ?? litProps(ir).find((p) => /^(open|expanded)$/i.test(p.name));
  // The region id is minted per render, not per component: two Collapsibles
  // on a page (a card's matrix) must not share one aria-controls target.
  const disclosure = archetype === "accordion" && openProp ? { open: camel(openProp.name), id: "${regionId}" } : null;
  // A checkbox or radio is a <label> around a native input: the input carries
  // the behaviour (checked, disabled, name, value, keyboard, the group), the
  // drawn control follows the root's data attribute, which the input keeps in
  // step. The boolean that means "on" is whichever the design or code named.
  const selProp = archetype === "checkbox / radio" ? (ir.props ?? []).find((p) => p.type === "boolean" && /^(selected|checked|on)$/i.test(p.name)) : null;
  const has = (n) => (ir.props ?? []).some((p) => p.name === n);
  const selection = selProp ? { prop: camel(selProp.name), attr: selProp.bindings?.code?.attr ?? `data-${selProp.name.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`, kind: /radio/i.test(slug) ? "radio" : "checkbox", disabled: has("disabled"), name: has("name"), value: has("value") } : null;
  const renderPart = (name, part, indent) => {
    const pcls = (part.selector || "").replace(/^\./, "") || `${cls}__${name}`;
    const v = camel(name);
    const hasProp = propNames.has(v);
    if (disclosure && /^trigger$/i.test(name)) {
      const inner = Object.entries(part.parts ?? {}).map(([n, p]) => renderPart(n, p, indent + "  ")).join("\n");
      return `${indent}<button type="button" class="${pcls}" aria-expanded=\${String(${disclosure.open})} aria-controls="${disclosure.id}" @click=\${toggleDisclosure}>\n${inner}\n${indent}</button>`;
    }
    if (disclosure && /^content$/i.test(name)) {
      const body = hasProp ? `\${${v}}` : Object.entries(part.parts ?? {}).map(([n, p]) => renderPart(n, p, indent + "  ")).join("\n");
      // inert, not hidden: hidden kills the transition; inert takes the region
      // out of the tab order and the accessibility tree while the stylesheet
      // animates it closed. The inner wrapper is what the grid rows clip.
      return `${indent}<div id="${disclosure.id}" role="region" class="${pcls}" ?inert=\${!${disclosure.open}}>\n${indent}  <div>\n${body}\n${indent}  </div>\n${indent}</div>`;
    }
    // An asset-backed part resolves a file from a prop through a shipped
    // manifest. The manifest is imported, never inlined: one table serves every
    // component that uses it, and 102 rows copied into each would drift.
    if (part.asset?.prop && part.asset?.manifest && part.asset?.field) {
      const a = part.asset;
      const el = a.element ?? "img";
      const alt = a.altField
        ? `\${(MANIFEST_${constCase(a.manifest)}.entries[${camel(a.prop)}] ?? {})[${q(a.altField)}] ?? ""}`
        : "";
      return `${indent}<${el} class="${pcls}"`
        + ` src=\${assetSrc(MANIFEST_${constCase(a.manifest)}, ${camel(a.prop)}, ${q(a.field)})}`
        + ` alt="${alt}" />`;
    }
    const D = part.slot?.default;
    // The design hides this slot at rest (Button's icons behind a Show Icon
    // toggle): it renders only when the consumer fills it. Nothing by default
    // is the design's default.
    if (D?.visible === false && !part.slot?.defaultByProp?.length) {
      return hasProp ? `${indent}\${given(${v}) ? html\`<span class="${pcls}">\${${v}}</span>\` : ""}` : "";
    }
    // What one filling renders as: a glyph from the manifest, a composed
    // child through its contract, the design's text, or nothing (with the
    // reason in a comment) when it is not resolved yet.
    const fillingExpr = (D2) => {
      if (!D2 || D2.visible === false) return "nothing";
      if (D2.manifest && D2.icon) return `unsafeSVG((MANIFEST_${constCase(D2.manifest)}.entries[${q(D2.icon)}] ?? {}).svg ?? "")`;
      if (D2.text !== undefined) return q(String(D2.text));
      const c = childFor({ slot: { ...part.slot, default: D2 } }, contractFor);
      if (c && c.slug !== slug) {
        children.set(c.name, c.slug);
        for (let inner = c.inner; inner; inner = inner.inner) children.set(inner.name, inner.slug);
        return `${c.name}(${c.argsSrc})`;
      }
      return `nothing /* ${D2.figma ?? "?"}: not resolved yet */`;
    };
    // A slot the design fills differently per variant: the entries in order,
    // first match wins, the resting filling as the fallback.
    if (part.slot?.defaultByProp?.length) {
      // Fillings keyed by the disclosure's open prop follow the DOM, not the
      // render: both are emitted, marked with the state they belong to, and
      // the stylesheet shows one — so the chevron turns when the trigger is
      // clicked, without a re-render. Other props keep the one-of expression.
      // First match wins, in the order the defs lists the entries — a hiding
      // entry before a filling one, a narrow condition before a broad one. The
      // open entry is resolved at its own position, as two spans the stylesheet
      // switches between, so the glyph swaps on click without a re-render;
      // entries after it are evaluated inside each span with open held fixed.
      const openProp = disclosure ? disclosure.open : null;
      const test = (entry, value) => value === "true" || value === "false" ? `${camel(entry.prop)} === ${value}` : `${camel(entry.prop)} === ${q(value)}`;
      const build = (entries, openFixed) => {
        if (!entries.length) return fillingExpr(D);
        const [e, ...more] = entries;
        if (openProp && camel(e.prop) === openProp) {
          const pick = (state) => e.map[state] !== undefined ? fillingExpr(e.map[state]) : build(more, state);
          if (openFixed != null) return pick(openFixed);
          return `html\`<span data-open-state="true">\${${pick("true")}}</span><span data-open-state="false">\${${pick("false")}}</span>\``;
        }
        const branches = Object.entries(e.map).map(([value, D2]) => `${test(e, value)} ? ${fillingExpr(D2)}`);
        return `${branches.join(" : ")} : ${build(more, openFixed)}`;
      };
      const expr = build(part.slot.defaultByProp, null);
      // No filling, no wrapper: an empty div is still a flex item, and the
      // row's gap lands before the label — the "padding" DevTools showed on
      // Collapsible's trigger in the default style.
      const inner = hasProp ? `given(${v}) ? ${v} : (${expr})` : expr;
      return `${indent}\${((f) => f === nothing ? nothing : html\`<div class="${pcls}">\${f}</div>\`)(${inner})}`;
    }
    // A slot the design fills by default renders that filling when the consumer
    // passes nothing — the glyph the design shows, from the shipped manifest —
    // so the state matrix compares like with like instead of an empty box.
    if (D?.manifest && D?.icon) {
      const M = `MANIFEST_${constCase(D.manifest)}`;
      const fallback = `html\`<span class="${pcls}">\${unsafeSVG((${M}.entries[${q(D.icon)}] ?? {}).svg ?? "")}</span>\``;
      // A string is a key into the same manifest (ControlButton's icon:
      // "arrow-down"); a template is rendered as given. A key the manifest
      // lacks is shown as text so the gap is visible rather than blank.
      const givenExpr = `typeof ${v} === "string" && (${M}.entries[${v}] ?? {}).svg ? unsafeSVG(${M}.entries[${v}].svg) : ${v}`;
      return hasProp ? `${indent}\${given(${v}) ? html\`<span class="${pcls}">\${${givenExpr}}</span>\` : ${fallback}}` : `${indent}\${${fallback}}`;
    }
    // A composed component: the child's generated module, called with the
    // design's overrides mapped through the child's contract. A consumer who
    // passes the slot prop replaces it.
    const child = childFor(part, contractFor);
    if (child && child.slug !== slug) {
      children.set(child.name, child.slug);
      for (let inner = child.inner; inner; inner = inner.inner) children.set(inner.name, inner.slug);
      const call = `${child.name}(${child.argsSrc})`;
      return hasProp
        ? `${indent}<div class="${pcls}">\${given(${v}) ? ${v} : ${call}}</div>`
        : `${indent}<div class="${pcls}">\${${call}}</div>`;
    }
    if (D?.figma && D.text === undefined && part.slot?.accepts?.length && !D.icon) {
      // The design composes something that has no contract yet (or an icon
      // not yet bound to the library). With a prop, the prop decides; without,
      // say so where it would render rather than render an empty box.
      return hasProp
        ? `${indent}\${given(${v}) ? html\`<span class="${pcls}">\${${v}}</span>\` : ""}`
        : `${indent}<!-- ${pcls}: composes ${D.figma}, no contract yet -->`;
    }
    // Text: the prop when there is one, the design's words otherwise.
    if (D?.text !== undefined) {
      const el = part.element ?? "span";
      return hasProp
        ? `${indent}<${el} class="${pcls}">\${${v} || ${q(String(D.text))}}</${el}>`
        : `${indent}<${el} class="${pcls}">${String(D.text).replace(/[<&]/g, (m) => ({ "<": "&lt;", "&": "&amp;" }[m]))}</${el}>`;
    }
    // Structure with structure inside.
    const inner = Object.entries(part.parts ?? {});
    if (inner.length) {
      const el = part.element ?? "div";
      return `${indent}<${el} class="${pcls}">\n${inner.map(([n, p]) => renderPart(n, p, indent + "  ")).join("\n")}\n${indent}</${el}>`;
    }
    if (!hasProp) {
      // Structure only. Left empty on purpose: the contract says this element
      // exists and what it is styled with, not what goes inside it.
      return `${indent}<${part.element ?? "span"} class="${pcls}"></${part.element ?? "span"}>`;
    }
    if (part.slot) return `${indent}\${given(${v}) ? html\`<span class="${pcls}">\${${v}}</span>\` : ""}`;
    return `${indent}<span class="${pcls}">\${${v}}</span>`;
  };
  const partMarkup = Object.entries(root.parts ?? {}).map(([name, part]) => renderPart(name, part, "      ")).join("\n");

  // The element can depend on a prop. A Button with an href is an anchor: it
  // needs to be reachable by keyboard as a link, middle-clickable, openable in a
  // new tab, and announced as a link — none of which a <button> does, however
  // many click handlers it carries. The contract has said this all along
  // (semantics.elementByProp) and the renderer was ignoring it, so the prop was
  // accepted and silently dropped.
  //
  // Lit cannot interpolate a tag name — a dynamic tag needs static-html's
  // unsafeStatic, which is a poor trade for two known tags. So the branches are
  // written out, which is also what lets each one carry the attributes that
  // only make sense on it (href belongs on the anchor, not the button).
  const byProp = root.elementByProp;
  const nativeInput = selection ? `        <input type="${selection.kind}" class="${cls}__input" ?checked=\${${selection.prop}}${selection.disabled ? " ?disabled=${disabled}" : ""}${selection.name ? " name=${name}" : ""}${selection.value ? " .value=${value}" : ""} @change=\${syncSelection} />\n` : "";
  const markup = (tag, extraAttrs = "") => `<${tag}
        class="${cls}"${extraAttrs}
${dataAttrs}
      >
${nativeInput}${partMarkup}
      </${tag}>`;

  const body = (() => {
    if (!byProp?.prop || !byProp.map) return `      ${markup(root.element || "div")}`;
    const driver = camel(byProp.prop);
    const fallback = byProp.map["*"] ?? root.element ?? "div";
    const base = byProp.map[""] ?? root.element ?? "div";
    if (fallback === base) return `      ${markup(base)}`;
    // href is the one attribute that has to ride along, because it is what makes
    // the anchor an anchor.
    const extra = (tag) => (tag === "a" && /^(href|to|link)$/i.test(byProp.prop) ? ` href=\${${driver}}` : "");
    return `      \${${driver}
        ? html\`${markup(fallback, extra(fallback))}\`
        : html\`${markup(base, extra(base))}\`}`;
  })();
  return { body, children, behaviour: disclosure ? "disclosure" : selection ? { kind: "selection", attr: selection.attr } : null };
}

export function litComponent(ir, slug, opts = {}) {
  const name = pascal(slug);
  const { body, children, behaviour } = template(ir, slug, opts);
  // Behaviour the archetype carries, as code. A disclosure toggles itself: the
  // trigger flips the root's open attribute, its own aria-expanded, and the
  // region's inert — the same three things the initial render set from the
  // prop. Nothing here is specific to this component; it is what an accordion
  // IS, and the design file only had to say that it is one.
  const behaviourHelper = behaviour === "disclosure" ? `
const toggleDisclosure = (e) => {
  const trigger = e.currentTarget;
  const root = trigger.closest(".${`c-${slug}`}");
  const region = root && document.getElementById(trigger.getAttribute("aria-controls"));
  const open = root.getAttribute("data-open") !== "true";
  root.setAttribute("data-open", String(open));
  trigger.setAttribute("aria-expanded", String(open));
  if (region) region.inert = !open;
};
let regionSeq = 0;
` : behaviour?.kind === "selection" ? `
// The native input is the truth; the drawn control reads the root's attribute.
const syncSelection = (e) => {
  const input = e.currentTarget;
  const root = input.closest(".${`c-${slug}`}");
  if (root) root.setAttribute("${behaviour.attr}", String(input.checked));
};
` : "";
  const props = litProps(ir);
  const args = props.map((p) => {
    const d = p.default !== undefined && p.default !== null ? p.default : (p.type === "boolean" ? false : "");
    return `  ${camel(p.name)} = ${typeof d === "string" ? q(d) : JSON.stringify(d)},`;
  }).join("\n");

  const manifests = assetManifests(ir);
  const hasDefaultIcon = (() => { let yes = false; const walk = (n) => { if (n?.slot?.default?.manifest && n?.slot?.default?.icon) yes = true; for (const c of Object.values(n?.parts ?? {})) walk(c); }; walk(ir.anatomy.root); return yes; })();
  const manifestImports = [
    ...(hasDefaultIcon ? ["import { unsafeSVG } from 'lit/directives/unsafe-svg.js';"] : []),
    ...manifests.map((m) => `import MANIFEST_${constCase(m)} from './assets/${m}.js';`),
    // The composed children, by their generated modules: a MerchCard imports
    // the Button it places, and renders it through Button's own contract.
    ...[...children.keys()].sort().map((childName) => `import { ${childName} } from './${childName}.js';`),
  ].join("\n");
  // One helper, not one per part: base + the entry's file, falling back to the
  // empty string so an unknown key renders nothing rather than a broken image
  // pointing at the base URL.
  // "Given" for a slot prop: null, an empty string and an empty array are the
  // absence of content, and the design's default fills in. `[]` is truthy in
  // JS, and MerchCard's features prop defaults to [] — which rendered nothing
  // where the design has a list.
  const givenHelper = `
const given = (v) => v != null && v !== "" && v !== false && !(Array.isArray(v) && !v.length);
`;
  const assetHelper = manifests.length ? `
const assetSrc = (manifest, key, field) => {
  const entry = manifest.entries[key];
  return entry && entry[field] ? \`\${manifest.base}/\${entry[field]}\` : '';
};
` : "";

  return `// Generated from ${slug}.contract.json by spec-dictionary. Do not edit by hand —
// change the contract and re-run: npm run specs:render -- --slug=${slug}
import { html, nothing } from 'lit';
import './${name}.css';${manifestImports ? "\n" + manifestImports : ""}
${givenHelper}${assetHelper}${behaviourHelper}

export const ${name} = ({
${args}
} = {}) => ${behaviour === "disclosure" ? `{
  const regionId = \`c-${slug}-\${++regionSeq}\`;
  return html\`
${body}
\`;
}` : `html\`
${body}
\``};

export default ${name};
`;
}

export function litStyles(ir, slug) {
  const cls = `.c-${slug}`;
  return stylesheet(ir, {
    header: [`/* Generated from ${slug}.contract.json. Re-run: npm run specs:render -- --slug=${slug} */`],
    variant,
    selectorFor: (part) => (part.name === "root" ? cls : part.selector || `${cls}__${part.name}`),
  });
}

/**
 * One story per derived arg set. The manifest already works out which
 * combinations are worth showing from the props' enums, so the stories are a
 * rendering of it rather than a second opinion.
 */
/** "Style=solid, Size=md, State=default" -> { style:"solid", size:"md", state:"default" } */
const axesOf = (n) => Object.fromEntries(String(n).split(",").map((p) => {
  const [k, v] = p.split("=");
  return k && v ? [k.trim().toLowerCase(), v.trim()] : [];
}).filter((e) => e.length));

/**
 * The Figma variant a story is showing, so the design overlay can find it
 * without anyone wiring node ids by hand. A story pins some args; the right
 * variant matches those and sits at the component's defaults for the rest.
 */
function variantNodeId(ir, args) {
  const variants = ir.figmaEvidence?.variantNodes ?? [];
  if (!variants.length) return null;
  const defaults = Object.fromEntries(ir.props.filter((p) => p.default != null && typeof p.default !== "object")
    .map((p) => [p.name.toLowerCase(), String(p.default).replace(/^"|"$/g, "")]));
  const wanted = { ...defaults, ...Object.fromEntries(Object.entries(args ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)])) };
  let best = null, score = -1;
  for (const v of variants) {
    const a = axesOf(v.name);
    let s = 0, ok = true;
    for (const [k, val] of Object.entries(wanted)) {
      if (a[k] === undefined) continue;
      if (a[k].toLowerCase() !== String(val).toLowerCase()) { ok = false; break; }
      s++;
    }
    if (!ok) continue;
    if ((a.state ?? "default").toLowerCase() === "default") s += 0.5;
    if (s > score) { best = v; score = s; }
  }
  return best?.id ?? null;
}

/**
 * The state matrix: every variant of the set on one grid, every state forced.
 *
 * This is the story the golden SHEET is compared against, so its geometry is
 * not cosmetic — `.s2a-matrix` must contain the cells and nothing else, at
 * exactly the cell size the sheet was composited to. Labels are deliberately
 * outside that box: the Figma sheet has no labels, and anything extra inside
 * the measured element would read as a difference.
 */
function litMatrix(ir, slug, matrix) {
  if (!matrix) return "";
  const name = pascal(slug);
  const { cols, rows, cell, cells } = matrix;
  const st = stateProp(ir);
  const stateArg = st ? camel(st.name) : null;

  const cellMarkup = cells.map((c) => {
    const args = { ...c.args, ...(stateArg && c.forced ? { [stateArg]: c.forced } : {}) };
    return `        <div class="s2a-matrix__cell">\${${name}(${JSON.stringify(args)})}</div>`;
  }).join("\n");

  return `
const MATRIX = ${JSON.stringify({ cols, rows, cell }, null, 2)};

/**
 * Every variant at once. Turn on the Design overlay to wipe this whole grid
 * against the Figma set in a single comparison.
 */
export const StateMatrix = {
  name: 'State matrix',
  parameters: {
    // \`sheet\` points the overlay at the composited golden for the whole set
    // rather than one variant's artwork.
    figma: { fileKey: ${q(ir.anchors?.figma?.fileKey ?? "")}, sheet: true, slug: ${q(slug)}, selector: '.s2a-matrix' },
    controls: { disable: true },
  },
  render: () => html\`
    <div class="s2a-matrix-wrap">
      <div class="s2a-matrix-corner"></div>
      <div class="s2a-matrix-cols">
        \${MATRIX.cols.map((c) => html\`<div class="s2a-matrix-col">\${c}</div>\`)}
      </div>
      <div class="s2a-matrix-rows">
        \${MATRIX.rows.map((r) => html\`<div class="s2a-matrix-row">\${r}</div>\`)}
      </div>
      <div class="s2a-matrix">
${cellMarkup}
      </div>
    </div>
    <style>
      .s2a-matrix-wrap {
        display: inline-grid;
        grid-template-columns: auto auto;
        gap: var(--s2a-spacing-xs);
        align-items: start;
        font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);
        color: var(--s2a-color-content-body-subtle);
      }
      .s2a-matrix-cols { display: grid; grid-template-columns: repeat(\${MATRIX.cols.length}, \${MATRIX.cell.w}px); }
      .s2a-matrix-rows { display: grid; grid-auto-rows: \${MATRIX.cell.h}px; }
      .s2a-matrix-col { text-align: center; }
      .s2a-matrix-row { display: grid; align-items: center; justify-content: end; white-space: nowrap; padding-right: var(--s2a-spacing-2xs); }
      /* Measured against the sheet: cells only, exact cell size, no gap. */
      .s2a-matrix {
        display: grid;
        grid-template-columns: repeat(\${MATRIX.cols.length}, \${MATRIX.cell.w}px);
        grid-auto-rows: \${MATRIX.cell.h}px;
        gap: 0;
      }
      /* The cells are real buttons, and a real pointer passing over one adds a
         genuine :hover on top of whatever state the cell is supposed to be
         showing — so dragging the wipe across the grid silently corrupts every
         cell the cursor crosses. In a matrix the state is SET, never pointed
         at, so nothing here takes pointer input. */
      .s2a-matrix, .s2a-matrix * { pointer-events: none; }
      /* The pad is the cell's padding, so a component that fills its
         container fills the artwork's box, not the cell's. */
      .s2a-matrix__cell { display: grid; place-items: center; padding: \${MATRIX.cell.pad}px; box-sizing: border-box; }
    </style>
  \`,
};
`;
}

export function litStories(ir, slug, manifest) {
  const name = pascal(slug);
  const fileKey = ir.anchors?.figma?.fileKey ?? null;
  const storyLines = (manifest?.derived ?? []).map((s) => {
    const id = pascal(s.id.replace(/[^a-z0-9]+/gi, "-"));
    const node = variantNodeId(ir, s.args);
    // Each story points at the variant it depicts, so the Design overlay in the
    // toolbar can pull exactly that artwork rather than the whole set.
    const params = node && fileKey
      ? `, parameters: { figma: { fileKey: ${q(fileKey)}, nodeId: ${q(node)} } }`
      : "";
    return `export const ${id} = { name: ${q(s.name)}, args: ${JSON.stringify(s.args ?? {})}${params} };`;
  });
  // Default, then the whole set, then the individual variants. Storybook lists
  // stories in file order, and the matrix was landing last — below eight
  // single-variant stories — when it is the one that shows everything at once.
  const [first, ...rest] = storyLines;
  // A slot (children) has no enum to derive a story from, and an empty slot
  // shows nothing of what the component does with its content. One story
  // fills every slot with sample content; the disclosure's opens too.
  const slotProps = litProps(ir).filter((p) => p.bindings?.figma?.kind === "SLOT" || p.type === "expression");
  const openProp = litProps(ir).find((p) => p.type === "boolean" && p.bindings?.figma?.valueMap);
  const withContent = slotProps.length
    ? `export const WithContent = { name: "With content", args: { ${slotProps.map((p) => `${camel(p.name)}: html\`<p style="margin:0">Content placed in the ${p.name} slot.</p>\``).join(", ")}${openProp ? `, ${camel(openProp.name)}: true` : ""} } };`
    : null;
  const stories = [first, "", litMatrix(ir, slug, manifest?.matrix), withContent, ...rest].filter((x) => x != null).join("\n");

  const argTypes = litProps(ir).filter((p) => Array.isArray(p.enum) && p.enum.length)
    .map((p) => `    ${camel(p.name)}: { control: 'select', options: ${JSON.stringify(p.enum)} },`).join("\n");

  return `// Generated from ${slug}.contract.json by spec-dictionary. Do not edit by hand.
import { html } from 'lit';
import { ${name} } from './${name}.js';

export default {
  title: 'Generated/${name}',
  component: '${name}',
  render: (args) => ${name}(args),
  argTypes: {
${argTypes}
  },
};

${stories}
`;
}

export const lit = {
  id: "lit",
  description: "Lit function component + CSS + Storybook stories",
  // What this target writes, derived from the slug alone. A clear needs to find
  // this output without first building an IR — the contract it would build from
  // is often the very thing being thrown away.
  paths(slug) {
    const name = pascal(slug);
    return [
      `apps/storybook/stories/generated/${name}.js`,
      `apps/storybook/stories/generated/${name}.css`,
      `apps/storybook/stories/generated/${name}.stories.js`,
    ];
  },
  files(ir, slug, { manifest, contractFor } = {}) {
    const [js, css, stories] = lit.paths(slug);
    return {
      [js]: litComponent(ir, slug, { contractFor }),
      [css]: litStyles(ir, slug),
      [stories]: litStories(ir, slug, manifest),
    };
  },
};
