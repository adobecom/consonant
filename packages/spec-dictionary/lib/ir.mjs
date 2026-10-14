// The canonical intermediate representation: defs (judgment) + code evidence
// + Figma evidence (when the plugin has published one) + shipped tokens.
// Formats read only this object; adding a schema or serialization never
// touches the inputs. Nothing here guesses: a missing Figma evidence file
// leaves design-side fields null, never invented.
import { REF } from "./tokens.mjs";

const alnum = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

function walk(part, name, path, visit) {
  visit(part, name, path);
  for (const [childName, child] of Object.entries(part.parts ?? {})) walk(child, childName, `${path}/${childName}`, visit);
}

// Code evidence carries defaults as source text (`""`, `"#"`, `true`, `[]`);
// defs carry values. Normalize to a value plus the source form.
export function parseDefault(source) {
  if (source === undefined || source === null) return { value: null, source: null };
  if (typeof source !== "string") return { value: source, source: JSON.stringify(source) };
  try { return { value: JSON.parse(source), source }; } catch { /* not JSON */ }
  const single = source.match(/^'(.*)'$/s);
  if (single) return { value: single[1], source: JSON.stringify(single[1]) };
  return { value: null, source, expression: true };
}

// One token map — { "background-color": "{s2a...}" } — resolved against the
// shipped CSS. Every conditional shape below is just this map under a condition,
// so they all go through here rather than each re-implementing the lookup.
function resolveTokenMap(map, tokens) {
  const resolved = {};
  for (const [cssProp, ref] of Object.entries(map ?? {})) {
    const refs = [...ref.matchAll(REF)].map((m) => m[0]);
    resolved[cssProp] = { value: ref, raw: ref.startsWith("raw:"), tokens: refs.map((r) => tokens.resolve(r)) };
  }
  return resolved;
}

const mapOfMaps = (obj, tokens) =>
  Object.fromEntries(Object.entries(obj ?? {}).map(([k, m]) => [k, resolveTokenMap(m, tokens)]));

// The conditional token shapes, resolved the same way as the base map. They
// mirror the upstream contract's own vocabulary (tokensByProp,
// tokensByCombination, states, statesByProp) so the emit step stays close to a
// pass-through instead of inventing a second grammar for the same idea.
function resolveConditionals(part, tokens) {
  const out = {};
  if (part.states) out.states = mapOfMaps(part.states, tokens);
  if (part.tokensByProp?.length) {
    out.tokensByProp = part.tokensByProp.map((e) => ({ prop: e.prop, map: mapOfMaps(e.map, tokens), ...(e.notes ? { notes: e.notes } : {}) }));
  }
  if (part.statesByProp?.length) {
    out.statesByProp = part.statesByProp.map((e) => ({ prop: e.prop, state: e.state, map: mapOfMaps(e.map, tokens), ...(e.notes ? { notes: e.notes } : {}) }));
  }
  if (part.tokensByCombination?.length) {
    out.tokensByCombination = part.tokensByCombination.map((e) => ({
      props: e.props,
      rows: e.rows.map((r) => ({ values: r.values, tokens: resolveTokenMap(r.tokens, tokens) })),
      ...(e.notes ? { notes: e.notes } : {}),
    }));
  }
  return out;
}

/** Every resolved token node under a part, base and conditional alike. */
export function allTokenNodes(part) {
  const nodes = [...Object.values(part.tokens ?? {})];
  for (const m of Object.values(part.states ?? {})) nodes.push(...Object.values(m));
  for (const e of part.tokensByProp ?? []) for (const m of Object.values(e.map)) nodes.push(...Object.values(m));
  for (const e of part.statesByProp ?? []) for (const m of Object.values(e.map)) nodes.push(...Object.values(m));
  for (const e of part.tokensByCombination ?? []) for (const r of e.rows) nodes.push(...Object.values(r.tokens));
  return nodes;
}

function resolveTree(part, name, tokens) {
  const resolved = resolveTokenMap(part.tokens, tokens);
  const out = { selector: part.selector };
  if (part.figma) out.figma = part.figma;
  if (part.element) out.element = part.element;
  if (part.elementByProp) out.elementByProp = part.elementByProp;
  if (part.layout) out.layout = part.layout;
  if (Object.keys(resolved).length) out.tokens = resolved;
  Object.assign(out, resolveConditionals(part, tokens));
  if (part.slot) out.slot = part.slot;
  // An asset-backed part carries how to resolve its src; a renderer that never
  // sees it can only emit an empty element.
  if (part.asset) out.asset = part.asset;
  if (part.notes) out.notes = part.notes;
  if (part.parts) out.parts = Object.fromEntries(Object.entries(part.parts).map(([n, c]) => [n, resolveTree(c, n, tokens)]));
  return out;
}

function typeOf(defsProp, codeProp) {
  if (defsProp.type) return defsProp.type;
  if (codeProp?.enum) return "string";
  if (codeProp?.type === "expression" || !codeProp?.type) return "unknown";
  return codeProp.type;
}

export function buildIR({ defs, code, figma = null, tokens, generator }) {
  const codeProps = new Map((code?.props ?? []).map((p) => [p.name, p]));
  const figmaAxes = new Map((figma?.axes ?? []).map((a) => [a.name, a]));

  const props = defs.props.map((p) => {
    const cp = codeProps.get(p.code.prop) ?? null;
    // Axes the plugin can verify: component property definitions of these
    // kinds. LAYER / INSTANCE / SLOT bindings point at layers, not properties,
    // so they stay unverified (null) until a richer check exists.
    const verifiable = p.figma !== "NONE" && ["VARIANT", "BOOLEAN", "TEXT", "INSTANCE_SWAP"].includes(p.figma.kind);
    const axis = verifiable ? figmaAxes.get(p.figma.property) ?? null : null;
    const axisMatches = axis ? axis.type === p.figma.kind : false;
    const type = typeOf(p, cp);
    // defs give a value; evidence gives source text.
    const def = p.default !== undefined ? { value: p.default, source: JSON.stringify(p.default) } : parseDefault(cp?.default);
    // Option lists: curated enum, else the design's VARIANT options (design is
    // the source of truth for names), else what the code documents. Booleans
    // never carry an enum even when they map to a two-option axis.
    const enumList = type === "boolean" ? null : p.enum ?? (axisMatches && axis.type === "VARIANT" ? axis.options : null) ?? cp?.enum ?? null;
    const prop = {
      name: p.name,
      lever: p.lever,
      type,
      default: def.value,
      defaultSource: def.source,
      enum: enumList,
      description: p.notes ?? null,
      bindings: {
        figma: p.figma === "NONE" ? "NONE" : { ...p.figma, verified: verifiable ? (figma ? axisMatches : null) : null, options: axisMatches && axis.type === "VARIANT" ? axis.options : undefined },
        code: { prop: p.code.prop, attr: p.code.attr ?? null, extracted: Boolean(cp), jsdoc: cp?.jsdoc ?? null },
      },
    };
    return prop;
  });

  // Variants: props bound to VARIANT axes; option lists come from the Figma
  // evidence when present, else from the curated or documented enum.
  const variants = {};
  for (const p of props) if (p.bindings.figma !== "NONE" && p.bindings.figma.kind === "VARIANT") {
    const options = p.bindings.figma.options ?? p.enum;
    if (options) variants[p.bindings.figma.property] = options;
  }

  // Anatomy with resolved tokens.
  const parts = [];
  const tokenBindings = {};
  const composed = new Set();
  walk(defs.anatomy.root, "root", "root", (part, name, path) => {
    const resolvedTokens = resolveTokenMap(part.tokens, tokens);
    for (const [cssProp, node] of Object.entries(resolvedTokens)) {
      if (node.tokens.length && !node.raw) tokenBindings[`${name}-${cssProp}`] = node.tokens[0].cssVar;
    }
    const conditional = resolveConditionals(part, tokens);
    // A binding that only exists under a variant or a state is still a binding.
    // Keying it by the condition is what stops knockout's background from
    // overwriting solid's in a flat map.
    for (const [state, m] of Object.entries(conditional.states ?? {})) {
      for (const [cssProp, node] of Object.entries(m)) if (node.tokens.length && !node.raw) tokenBindings[`${name}-${cssProp}:${state}`] = node.tokens[0].cssVar;
    }
    for (const e of conditional.tokensByProp ?? []) {
      for (const [value, m] of Object.entries(e.map)) for (const [cssProp, node] of Object.entries(m)) {
        if (node.tokens.length && !node.raw) tokenBindings[`${name}-${cssProp}@${e.prop}=${value}`] = node.tokens[0].cssVar;
      }
    }
    for (const e of conditional.statesByProp ?? []) {
      for (const [value, m] of Object.entries(e.map)) for (const [cssProp, node] of Object.entries(m)) {
        if (node.tokens.length && !node.raw) tokenBindings[`${name}-${cssProp}@${e.prop}=${value}:${e.state}`] = node.tokens[0].cssVar;
      }
    }
    for (const e of conditional.tokensByCombination ?? []) {
      for (const r of e.rows) for (const [cssProp, node] of Object.entries(r.tokens)) {
        if (node.tokens.length && !node.raw) tokenBindings[`${name}-${cssProp}@${e.props.map((p, i) => `${p}=${r.values[i] ?? "*"}`).join(",")}`] = node.tokens[0].cssVar;
      }
    }
    if (part.slot) for (const a of part.slot.accepts) composed.add(a);
    parts.push({ path, name, selector: part.selector, figma: part.figma ?? null, element: part.element ?? null, layout: part.layout ?? null, tokens: resolvedTokens, ...conditional, slot: part.slot ?? null, asset: part.asset ?? null, notes: part.notes ?? null });
  });

  const stories = (code?.stories ?? []).map((s) => ({ id: s.id, name: s.name, args: s.args ?? null }));
  const figmaAnchor = defs.anchors.figma;
  const figmaBlock = {
    anchors: {
      fileKey: figmaAnchor.fileKey, kind: figmaAnchor.kind, nodeId: figmaAnchor.nodeId ?? null, nodeName: figmaAnchor.nodeName ?? null,
      componentSetKey: figma?.set?.key ?? figmaAnchor.componentSetKey ?? null,
      deprecated: figmaAnchor.deprecated ?? false, successorNodeId: figmaAnchor.successorNodeId ?? null, usages: figmaAnchor.usages ?? [],
    },
    // variableNames: the file's real variable names (the plan crosswalks the
    // dotted token paths onto them; "border-radius/md" is "border/radius/md" in Figma).
    evidence: figma ? { hash: figma.provenance?.hash ?? null, extractedAt: figma.extractedAt, axes: figma.axes, variants: figma.variants.length,
      // id + name per variant, so a story can point the design overlay at the
      // exact artwork it depicts instead of the whole set. Deliberately not the
      // full variant record — this travels into every generated story file.
      variantNodes: figma.variants.map((v) => ({ id: v.id, name: v.name })),
      // The largest artwork in the set. A state matrix lays every variant on
      // one grid, and the cell has to fit the biggest of them — both when the
      // story renders the grid and when the golden sheet is composited to the
      // same geometry.
      variantBox: figma.variants.reduce((b, v) => ({ w: Math.max(b.w, Math.round(v.width ?? 0)), h: Math.max(b.h, Math.round(v.height ?? 0)) }), { w: 0, h: 0 }),
      meta: figma.set.meta, variableNames: [...new Set(Object.values(figma.variables ?? {}).map((v) => v.name))].sort() } : null,
  };

  return {
    generator,
    component: { name: defs.component, slug: defs.slug, description: defs.description ?? null, status: defs.status, version: defs.version ?? null, archetype: defs.archetype ?? null, tier: defs.tier ?? "component", cssClass: defs.anchors.code.cssClass, storybookId: code?.component?.spec?.storybookId ?? null },
    anchors: { figma: figmaBlock.anchors, code: { importPath: defs.anchors.code.importPath, export: defs.anchors.code.export, controller: defs.anchors.code.controller ?? null, cssClass: defs.anchors.code.cssClass } },
    figmaEvidence: figmaBlock.evidence,
    props, variants,
    states: defs.states ?? [],
    forbiddenCombinations: defs.forbiddenCombinations ?? [],
    anatomy: { root: resolveTree(defs.anatomy.root, "root", tokens), parts },
    tokenBindings,
    composedOf: [...composed].map((n) => alnum(n)),
    composedOfNames: [...composed].filter((n) => !String(n).startsWith("kind:")),
    a11y: defs.a11y ?? null,
    decisions: defs.decisions ?? [],
    stories,
    code: code ? { render: code.component.render, exports: code.component.exports, attributes: code.attributes, parts: code.parts, states: code.states, queries: code.queries, tokenReferences: Object.keys(code.tokens.references).length, raw: code.tokens.raw, sources: code.sources } : null,
    provenance: {
      defs: defs.$hash ?? null,
      codeEvidence: code?.provenance?.hash ?? null,
      figmaEvidence: figma?.provenance?.hash ?? null,
    },
  };
}
