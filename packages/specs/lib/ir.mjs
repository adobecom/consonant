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

function resolveTree(part, name, tokens) {
  const resolved = {};
  for (const [cssProp, ref] of Object.entries(part.tokens ?? {})) {
    const refs = [...ref.matchAll(REF)].map((m) => m[0]);
    resolved[cssProp] = { value: ref, raw: ref.startsWith("raw:"), tokens: refs.map((r) => tokens.resolve(r)) };
  }
  const out = { selector: part.selector };
  if (part.figma) out.figma = part.figma;
  if (part.element) out.element = part.element;
  if (Object.keys(resolved).length) out.tokens = resolved;
  if (part.slot) out.slot = part.slot;
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
    const resolvedTokens = {};
    for (const [cssProp, ref] of Object.entries(part.tokens ?? {})) {
      const refs = [...ref.matchAll(REF)].map((m) => m[0]);
      resolvedTokens[cssProp] = { value: ref, raw: ref.startsWith("raw:"), tokens: refs.map((r) => tokens.resolve(r)) };
      if (refs.length && !ref.startsWith("raw:")) tokenBindings[`${name}-${cssProp}`] = tokens.resolve(refs[0]).cssVar;
    }
    if (part.slot) for (const a of part.slot.accepts) composed.add(a);
    parts.push({ path, name, selector: part.selector, figma: part.figma ?? null, element: part.element ?? null, tokens: resolvedTokens, slot: part.slot ?? null, notes: part.notes ?? null });
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
    evidence: figma ? { hash: figma.provenance?.hash ?? null, extractedAt: figma.extractedAt, axes: figma.axes, variants: figma.variants.length, meta: figma.set.meta, variableNames: [...new Set(Object.values(figma.variables ?? {}).map((v) => v.name))].sort() } : null,
  };

  return {
    generator,
    component: { name: defs.component, slug: defs.slug, description: defs.description ?? null, status: defs.status, cssClass: defs.anchors.code.cssClass, storybookId: code?.component?.spec?.storybookId ?? null },
    anchors: { figma: figmaBlock.anchors, code: { importPath: defs.anchors.code.importPath, export: defs.anchors.code.export, controller: defs.anchors.code.controller ?? null, cssClass: defs.anchors.code.cssClass } },
    figmaEvidence: figmaBlock.evidence,
    props, variants,
    states: defs.states ?? [],
    forbiddenCombinations: defs.forbiddenCombinations ?? [],
    anatomy: { root: resolveTree(defs.anatomy.root, "root", tokens), parts },
    tokenBindings,
    composedOf: [...composed].map((n) => alnum(n)),
    composedOfNames: [...composed],
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
