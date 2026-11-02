// from-code.mjs — a defs draft read from the implementation, not the design file.
//
// For a shipped library the stylesheet and the type declarations ARE the
// contract; the design file is a cross-check. This reads the structured code
// evidence (props from the .d.ts, rules from the stylesheet) and writes the
// same defs shape the design-first scaffolder does, so everything downstream —
// validate, build, the Book — is unchanged.
//
// What it decides, and how:
//
//   WHAT a rule styles        selectors.mjs: root, or a named part
//   WHEN it applies           selectors.mjs: prop conditions + states
//   WHAT it sets              the declarations, with the component's own
//                             custom-property indirections resolved — Spectrum
//                             writes `:host([size="50"]) { --swc-avatar-size:
//                             var(--swc-avatar-size-50) }` and then reads
//                             `--swc-avatar-size` everywhere; the contract says
//                             what each size resolves to on each declaration.
//   a token or a literal      `var(--x)` is `{x}` when the token build ships
//                             --x; an unshipped name with a fallback (a
//                             `--swc-<component>-*` override seam) resolves to
//                             the fallback; everything else is `raw:`.
//
// Anything it cannot derive is left out and recorded as a decision — never
// guessed. Pure; the caller writes the file.

import { classifyRules, inferParts } from "./selectors.mjs";

const STATE_NAMES = new Set(["hover", "active", "pressed", "focus", "focused", "focus-visible", "disabled"]);
const VENDOR = /^-(webkit|moz|ms|o)-/;
const pascal = (s) => String(s).replace(/(^|[-_\s]+)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
const kebab = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
const abbr = (slug) => slug.split("-").map((w) => w[0]).join("");
const varToRef = (name) => `{${name.replace(/^--/, "").replace(/-/g, ".")}}`;

/** Shorthands the contract writes as longhands, so a token lands on one property. */
const SHORTHANDS = {
  outline: edge("outline"),
  border: edge("border"),
  padding: box("padding"),
  margin: box("margin"),
  inset: (v) => Object.fromEntries(box("")(v).map(([k, x]) => [k.replace(/^-/, ""), x])),
  gap: (v) => { const p = parts(v); return p.length === 1 ? { "row-gap": p[0], "column-gap": p[0] } : { "row-gap": p[0], "column-gap": p[1] }; },
};
function parts(value) { return splitSpace(value); }
/**
 * `outline: <width> <style> <color>` in any order: each piece lands where its
 * type says. The type is read off the RESOLVED piece (`peek`), since a var()
 * name says nothing about what it holds: `var(--x-stroke, 1px)` is a width.
 */
function edge(prefix) {
  const STYLES = new Set(["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset", "auto"]);
  return (value, peek = (x) => `raw:${x}`) => {
    const out = {};
    for (const piece of splitSpace(value)) {
      const got = String(peek(piece) ?? "");
      if (STYLES.has(piece) || STYLES.has(got.replace(/^raw:/, ""))) out[`${prefix}-style`] = piece;
      else if (/^raw:(\d|\.\d|thin$|medium$|thick$)/.test(got) || /^\{[^}]*(width|size|stroke|thickness)[^}]*\}$/.test(got)) out[`${prefix}-width`] = piece;
      else out[`${prefix}-color`] = piece;
    }
    return out;
  };
}
/** 1–4 value box shorthand → four longhands, with the `-top` order CSS uses. */
function box(prefix) {
  return (value) => {
    const p = splitSpace(value);
    const [t, r = t, b = t, l = r] = p;
    const name = (side) => (prefix ? `${prefix}-${side}` : `-${side}`);
    return Object.entries({ [name("top")]: t, [name("right")]: r, [name("bottom")]: b, [name("left")]: l });
  };
}
/** Split on spaces outside parentheses. */
function splitSpace(value) {
  const out = []; let depth = 0, cur = "";
  for (const ch of String(value)) {
    if (ch === "(") depth++; else if (ch === ")") depth--;
    if (/\s/.test(ch) && depth === 0) { if (cur) out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}
/** `var(--a, fb)` → { name, fallback } ; anything else → null. */
function parseVar(value) {
  const m = String(value).trim().match(/^var\(\s*(--[a-z_][a-z0-9_-]*)\s*(?:,\s*([\s\S]*))?\)$/i);
  if (!m) return null;
  return { name: m[1], fallback: m[2]?.trim() ?? null };
}
const condKey = (conds) => conds.map((c) => `${c.prop}=${c.value}`).sort().join("&");

/**
 * The root class, when no defs anchor names one yet: the class in the
 * stylesheet that the other classes extend (`swc-Card` under `swc-Card-media`,
 * `swc-Card--quiet`). Read from the rules, not from `parts.own`, because the
 * evidence extractor also sweeps Storybook by slug and a second system's
 * Divider stories put `c-divider` and the matrix classes in there.
 */
function inferRoot(code) {
  const classes = new Set();
  for (const r of code.stylesheet?.rules ?? []) for (const m of String(r.selector).matchAll(/\.([A-Za-z_][\w-]*)/g)) classes.add(m[1]);
  const template = new Set(code.parts?.template ?? []);
  let best = null, score = -1;
  for (const c of classes) {
    if (c.includes("--") || /__/.test(c)) continue;
    let n = 0;
    for (const o of classes) if (o !== c && (o.startsWith(c + "-") || o.startsWith(c + "__"))) n++;
    const sc = n * 10 + (template.has(c) ? 5 : 0) - c.length / 100;
    if (sc > score) { best = c; score = sc; }
  }
  return best ?? code.parts?.template?.[0] ?? null;
}

/**
 * Draft a defs document from code evidence.
 *
 * @param code     <slug>.code.evidence.json, with `stylesheet.rules` (postcss)
 * @param opts.tokens   the shipped-token resolver (loadShippedTokens); `names`
 *                      decides what is a token and what is a literal
 * @param opts.figma    optional figma evidence, used only to anchor the set and
 *                      bind props whose names match; never to derive anatomy
 * @param opts.template optional source text of the module, to read each
 *                      class's element from the markup
 */
export function fromImplementation(code, { slug, name, tokens, figma = null, template = null, importPath = null, today = new Date().toISOString().slice(0, 10), curator = "scaffold --from=code" } = {}) {
  slug = slug ?? code.component?.slug;
  const component = pascal(name ?? code.component?.name ?? slug);
  const ab = abbr(slug);
  // The anchor's class, when the stylesheet actually has it; otherwise read the
  // root off the stylesheet. A placeholder anchor (`c-<slug>` from an earlier
  // draft) must not become the root, or every real rule reads as foreign.
  const sheetClasses = new Set();
  for (const r of code.stylesheet?.rules ?? []) for (const m of String(r.selector).matchAll(/\.([A-Za-z_][\w-]*)/g)) sheetClasses.add(m[1]);
  const anchored = code.component?.cssClass;
  const inferred = inferRoot(code);
  // An anchor that names a PART of the inferred root (`swc-Card-collection`
  // under `swc-Card`) is a leftover from a draft, not the root.
  const anchorIsPart = anchored && inferred && anchored !== inferred && (anchored.startsWith(inferred + "-") || anchored.startsWith(inferred + "__"));
  // A sheet with no classes at all (Icon styles :host and svg) keeps the anchor.
  const root = anchored && sheetClasses.has(anchored) && !anchorIsPart ? anchored : (inferred ?? anchored);
  if (!root) throw new Error(`${slug}: the code evidence names no root class`);
  const shipped = tokens?.names ?? new Set();
  const decisions = [];
  const D = (id, fields) => decisions.push({ id: `${ab}-${id}`, status: "open", owner: "scaffold", ...fields });

  // ---- props, from the declarations --------------------------------------
  // One entry per name: a slot declared twice (ButtonGroup's default) is one slot.
  const codeProps = (code.props ?? []).filter((p, i, all) => all.findIndex((x) => x.name === p.name) === i);
  const stateProps = new Set(codeProps.filter((p) => p.type === "boolean" && STATE_NAMES.has(p.name)).map((p) => p.name));

  // ---- rules ----------------------------------------------------------------
  const rules = code.stylesheet?.rules ?? [];
  // A class on the root's naming convention is a part, whether or not the
  // template names it: Button's icon is slotted, its class only ever appears in
  // the stylesheet.
  const partNames = inferParts(rules, root);
  const classified = classifyRules(rules, { root, parts: partNames.length ? partNames : undefined, props: codeProps });

  // Conditions that name a boolean state prop are states, not variants:
  // `:host([disabled]) .swc-Avatar` is the disabled state of the root.
  for (const r of classified) {
    const keep = [];
    for (const c of r.conditions) {
      if (stateProps.has(c.prop) && c.value === true) r.states.push(c.prop);
      else keep.push(c);
    }
    r.conditions = keep;
    r.states = [...new Set(r.states.map((s) => (s === "focused" ? "focus" : s)))];
  }

  // ---- the component's own custom properties --------------------------------
  // An assignment `--x: v` in a rule with conditions C on subject S. Readers of
  // --x on S (or on a descendant, since custom properties inherit) take v under
  // C. Spectrum's host-level assignments inherit into every part.
  const assignments = new Map(); // name -> [{ conditions, states, subject, value }]
  for (const r of classified) {
    for (const d of r.declarations) {
      if (!d.prop.startsWith("--")) continue;
      (assignments.get(d.prop) ?? assignments.set(d.prop, []).get(d.prop)).push({ conditions: r.conditions, states: r.states, subject: r.subject, value: d.value });
    }
  }
  const unresolvedComposite = new Set();

  /**
   * One CSS value → one contract value (`{ref}`, `raw:…`) at rest, plus the
   * conditional values that any custom-property indirection fans out into.
   * Returns { base, byConditions: [{ conditions, states, value }] }.
   */
  function resolveValue(value, depth = 0) {
    const v = String(value).trim();
    const asVar = parseVar(v);
    if (asVar) {
      const { name: n, fallback } = asVar;
      const local = assignments.get(n) ?? [];
      const unconditional = local.find((a) => !a.conditions.length && !a.states.length);
      const conditional = local.filter((a) => a.conditions.length || a.states.length);
      // What --x is when nothing conditions it: an unconditional assignment,
      // else the shipped token, else the fallback, else nothing.
      let base;
      if (unconditional && depth < 8) base = resolveValue(unconditional.value, depth + 1).base;
      else if (shipped.has(n)) base = varToRef(n);
      else if (fallback !== null && depth < 8) base = resolveValue(fallback, depth + 1).base;
      else base = null;
      const byConditions = [];
      for (const a of conditional) {
        const inner = depth < 8 ? resolveValue(a.value, depth + 1) : { base: null, byConditions: [] };
        if (inner.base !== null) byConditions.push({ conditions: a.conditions, states: a.states, value: inner.base });
      }
      return { base, byConditions };
    }
    if (/var\(/.test(v)) {
      // A var() inside something else: calc(), a gradient, a shorthand piece.
      // Rewrite each var() to its resolved reference when the whole thing is
      // only refs separated by spaces; otherwise it is a literal the contract
      // cannot bind, kept raw and flagged.
      const pieces = splitSpace(v);
      if (pieces.length > 1 && pieces.every((p) => parseVar(p) || !/var\(/.test(p))) {
        const resolved = pieces.map((p) => resolveValue(p, depth + 1).base);
        if (resolved.every((x) => x && x.startsWith("{"))) return { base: resolved.join(" "), byConditions: [] };
      }
      unresolvedComposite.add(v);
      return { base: `raw:${v}`, byConditions: [] };
    }
    return { base: `raw:${v}`, byConditions: [] };
  }

  // ---- parts --------------------------------------------------------------------
  const elementOf = (cls) => {
    if (!template) return null;
    // The class token exactly: `swc-Button` must not match `swc-Button-label`.
    const esc = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = template.match(new RegExp(`<([a-z][a-z0-9-]*)\\b[^>]*class=["']?(?:[^"'>]*\\s)?${esc}(?=["'\\s>])`));
    return m?.[1] ?? null;
  };
  const partClass = (p) => (code.parts?.own ?? []).find((c) => c === `${root}__${p}`) ?? `${root}-${p}`;
  const mkPart = (selector, element) => ({ selector, ...(element ? { element } : {}), tokens: {} });
  const rootPart = mkPart(`.${root}`, elementOf(root));
  const partDefs = {};
  for (const p of partNames) partDefs[p] = mkPart(`.${partClass(p)}`, elementOf(partClass(p)));
  const subjectPart = (s) => (s === "root" || s === "*" || s === null ? rootPart : partDefs[s] ?? null);

  // ---- place every declaration ---------------------------------------------------
  // target(part).at(conditions, states)[cssProp] = value, then written into the
  // schema's shapes: tokens / states / tokensByProp / statesByProp /
  // tokensByCombination.
  const slots = new Map(); // part -> Map(key -> { conditions, states, tokens })
  const put = (part, conditions, states, cssProp, value) => {
    const bucket = slots.get(part) ?? slots.set(part, new Map()).get(part);
    const key = `${condKey(conditions)}|${[...states].sort().join("&")}`;
    const cell = bucket.get(key) ?? bucket.set(key, { conditions, states, tokens: {} }).get(key);
    cell.tokens[cssProp] = value;
  };
  const mergeConds = (a, b) => {
    const out = [...a];
    for (const c of b) if (!out.some((x) => x.prop === c.prop && x.value === c.value)) out.push(c);
    return out;
  };
  const skipped = new Set();

  for (const r of classified) {
    const targets = r.subject === "*" ? [rootPart, ...Object.values(partDefs)] : [subjectPart(r.subject)].filter(Boolean);
    if (!targets.length) { skipped.add(r.raw); continue; }
    if (r.structural || r.derived.length) {
      D(`rule-${decisions.length}`, {
        question: `The rule \`${r.raw}\` conditions on something the props do not express (${[...r.derived, r.structural ? "a :has() structure" : ""].filter(Boolean).join(", ")}). It is not in the draft.`,
        confidence: "high", fix: "If this is a real variant, add the prop it keys on and re-scaffold; if it is internal state, leave it out.",
        evidence: r.declarations.map((d) => `${d.prop}: ${d.value}`).join("; "),
      });
      continue;
    }
    for (const d of r.declarations) {
      if (d.prop.startsWith("--")) continue; // an assignment, consumed by resolveValue
      if (VENDOR.test(d.prop) || VENDOR.test(d.value)) continue;
      const expanded = SHORTHANDS[d.prop] ? SHORTHANDS[d.prop](d.value, (piece) => resolveValue(piece).base) : { [d.prop]: d.value };
      const entries = Array.isArray(expanded) ? expanded : Object.entries(expanded);
      for (const [cssProp, raw] of entries) {
        const { base, byConditions } = resolveValue(raw);
        for (const t of targets) {
          if (base !== null) put(t, r.conditions, r.states, cssProp, base);
          for (const c of byConditions) put(t, mergeConds(r.conditions, c.conditions), [...new Set([...r.states, ...c.states])], cssProp, c.value);
        }
      }
    }
  }

  // ---- write the schema shapes -------------------------------------------------
  const conditioned = new Set();
  const undrafted = [];
  for (const [part, bucket] of slots) {
    for (const { conditions, states, tokens: map } of bucket.values()) {
      for (const c of conditions) conditioned.add(c.prop);
      const stateList = states.filter((s) => STATE_NAMES.has(s));
      if (states.length !== stateList.length) { undrafted.push({ part: part.selector, conditions, states, map }); continue; }
      if (!conditions.length && !stateList.length) { Object.assign(part.tokens, map); continue; }
      if (!conditions.length && stateList.length === 1) { (part.states ??= {})[stateList[0]] = { ...(part.states?.[stateList[0]] ?? {}), ...map }; continue; }
      if (conditions.length === 1 && !stateList.length) {
        const [c] = conditions;
        const entry = (part.tokensByProp ??= []).find((e) => e.prop === c.prop) ?? (part.tokensByProp.push({ prop: c.prop, map: {} }), part.tokensByProp.at(-1));
        entry.map[String(c.value)] = { ...(entry.map[String(c.value)] ?? {}), ...map };
        continue;
      }
      if (conditions.length === 1 && stateList.length === 1) {
        const [c] = conditions;
        const entry = (part.statesByProp ??= []).find((e) => e.prop === c.prop && e.state === stateList[0]) ?? (part.statesByProp.push({ prop: c.prop, state: stateList[0], map: {} }), part.statesByProp.at(-1));
        entry.map[String(c.value)] = { ...(entry.map[String(c.value)] ?? {}), ...map };
        continue;
      }
      if (conditions.length === 2 && !stateList.length) {
        const sorted = [...conditions].sort((a, b) => a.prop.localeCompare(b.prop));
        const props = sorted.map((c) => c.prop);
        const entry = (part.tokensByCombination ??= []).find((e) => e.props.join() === props.join()) ?? (part.tokensByCombination.push({ props, rows: [] }), part.tokensByCombination.at(-1));
        const values = sorted.map((c) => String(c.value));
        const row = entry.rows.find((x) => x.values.join() === values.join()) ?? (entry.rows.push({ values, tokens: {} }), entry.rows.at(-1));
        Object.assign(row.tokens, map);
        continue;
      }
      undrafted.push({ part: part.selector, conditions, states, map });
    }
  }
  if (undrafted.length) D("undrafted-rules", {
    question: `${undrafted.length} rule${undrafted.length === 1 ? "" : "s"} condition on more than the schema can place (three props, a state on a combination, or a state the schema does not name) and are not in the draft: ${undrafted.map((u) => `${u.part} when ${u.conditions.map((c) => `${c.prop}=${c.value}`).concat(u.states).join(" & ")}`).join("; ")}.`,
    confidence: "high", fix: "Either the schema grows a shape for them or the contract records them as decisions.",
  });
  if (unresolvedComposite.size) D("composite-values", {
    question: `${unresolvedComposite.size} value${unresolvedComposite.size === 1 ? "" : "s"} mix a token with a literal (calc(), a gradient, a shadow) and are kept as raw: ${[...unresolvedComposite].join(" · ")}.`,
    chose: "kept raw, unbound", confidence: "high", fix: "Name a token that carries the computed value, or accept the literal.",
  });
  if (skipped.size) D("rules-off-anatomy", {
    question: `${skipped.size} rule${skipped.size === 1 ? "" : "s"} style an element that is not the root or a named part and are not in the draft: ${[...skipped].join(" · ")}.`,
    confidence: "high", fix: "If it is a part, name it on the component's class convention.",
  });

  // ---- props as the contract carries them --------------------------------------
  const figmaProps = figma ? bindFromFigma(figma, codeProps) : new Map();
  const props = codeProps.map((p) => {
    const isEnum = p.type === "enum" && Array.isArray(p.values);
    const type = isEnum ? "string" : /^boolean/.test(p.type) ? "boolean" : /^number/.test(p.type) ? "number" : "string";
    const attr = conditioned.has(p.name) && !stateProps.has(p.name) ? { attr: `data-${kebab(p.name)}` } : {};
    const out = {
      name: p.name, lever: true, type,
      ...(isEnum ? { enum: p.values.map(String) } : {}),
      ...(p.default !== undefined ? { default: type === "boolean" ? p.default === true || p.default === "true" : type === "number" ? Number(p.default) : String(p.default).replace(/^['"]|['"]$/g, "") } : type === "boolean" ? { default: false } : {}),
      figma: figmaProps.get(p.name) ?? "NONE",
      code: { prop: p.name, ...attr },
      ...(p.description ? { notes: p.description } : {}),
    };
    return out;
  });
  const states = [...stateProps].filter((s) => classified.some((r) => r.states.includes(s))).map((s) => ({
    name: s, figma: figmaProps.get(`state:${s}`) ?? "NONE", code: { mechanism: `[${s}]` },
    notes: `Set from the ${s} prop.`,
  }));

  // An image part whose source is a prop is an asset; the contract has to say
  // so or the renderer can only emit an empty element.
  for (const [pname, part] of Object.entries(partDefs)) {
    if (part.element !== "img") continue;
    const src = codeProps.find((p) => /^(src|source|href|url)$/i.test(p.name));
    if (!src) continue;
    const alt = codeProps.find((p) => /^alt(text)?$/i.test(p.name));
    part.asset = { prop: src.name, ...(alt ? { altProp: alt.name } : {}), element: "img" };
    D(`asset-${pname}`, {
      question: `The ${pname} part renders <img>; where does its source come from?`,
      chose: `asset { prop: ${src.name}${alt ? `, altProp: ${alt.name}` : ""} }`, confidence: "high", status: "decided",
      decision: `The markup renders <img> and the declarations carry a ${src.name} prop described as its source${alt ? `, with ${alt.name} as its text` : ""}; the contract names the prop as the asset's source so the renderer can emit the element.`,
    });
  }

  const unknownElements = [rootPart, ...Object.values(partDefs)].filter((p) => !p.element);
  if (unknownElements.length) D("elements", {
    question: `No markup was available to read the element of ${unknownElements.map((p) => p.selector).join(", ")}; the renderer will default.`,
    confidence: "medium", fix: "Set element on each part.",
  });

  D("rebuilt-from-code", {
    question: `Drafted from the implementation${importPath ? ` (${importPath})` : ""}: ${rules.length} rules, ${codeProps.length} declared props, ${partNames.length} part${partNames.length === 1 ? "" : "s"}. The design file${figma ? " anchored the set and bound matching props" : " was not consulted"}.`,
    chose: "code is the source; design is the check", confidence: "high", status: "decided",
    decision: "For a shipped library the stylesheet and the type declarations are the contract. Every token, condition and state here is read from a rule; nothing is transcribed from the design file's layer tree.",
    evidence: Object.keys(code.sources ?? {}).join(", "),
  });

  const anchorsFigma = figma?.set
    ? { fileKey: figma.file?.key ?? "", kind: figma.set.type === "COMPONENT_SET" ? "component-set" : "pattern-frame", nodeId: figma.set.id, nodeName: figma.set.name, componentSetKey: figma.set.key || null, deprecated: false, successorNodeId: null, usages: [] }
    : { fileKey: "", kind: "none" };

  return {
    $schema: "s2a-defs/1",
    component, slug, status: "curated-draft",
    description: code.component?.description ?? `${component}, as the implementation ships it.`,
    curated: { by: `${curator}, read from ${Object.keys(code.sources ?? {}).map((s) => s.split("/").pop()).join(", ")}`, date: today },
    anchors: { figma: anchorsFigma, code: { importPath: importPath ?? code.component?.importPath ?? "", export: code.component?.exports?.[0] ?? component, cssClass: root } },
    props, states, composition: [],
    anatomy: { root: { ...rootPart, ...(Object.keys(partDefs).length ? { parts: partDefs } : {}) } },
    forbiddenCombinations: [],
    decisions,
  };
}

/**
 * Bind code props to design properties where the names agree, by normalised
 * name; enum values by normalised prefix ("500" ↔ "500 (40x40)"). A prop with
 * no match stays "NONE" — the design file never invents a prop here.
 */
function bindFromFigma(figma, codeProps) {
  const norm = (s) => String(s).toLowerCase().replace(/#.*$/, "").replace(/[^a-z0-9]/g, "");
  const out = new Map();
  for (const axis of figma.axes ?? []) {
    const axisName = String(axis.name).replace(/#.*$/, "");
    const hit = codeProps.find((p) => norm(p.name) === norm(axisName) || (axis.type === "BOOLEAN" && norm(axisName).endsWith(norm(p.name))));
    if (hit && axis.type === "VARIANT" && Array.isArray(hit.values)) {
      const valueMap = {};
      for (const v of hit.values) {
        const opt = (axis.options ?? []).find((o) => norm(o) === norm(v) || norm(o).startsWith(norm(v)));
        if (opt !== undefined) valueMap[String(v)] = String(opt);
      }
      out.set(hit.name, { kind: "VARIANT", property: axisName, ...(Object.keys(valueMap).length ? { valueMap } : {}) });
    } else if (hit && axis.type === "BOOLEAN") {
      out.set(hit.name, { kind: "BOOLEAN", property: axisName });
    } else if (axis.type === "VARIANT" && /^state$/i.test(axisName)) {
      // A State axis binds each boolean state prop by option name.
      for (const opt of axis.options ?? []) {
        const s = codeProps.find((p) => p.type === "boolean" && norm(p.name) === norm(opt));
        if (s) {
          out.set(s.name, { kind: "VARIANT", property: axisName, valueMap: { true: String(opt), false: (axis.options ?? []).find((o) => /^default$/i.test(String(o))) ?? String(opt) } });
          out.set(`state:${s.name}`, { kind: "VARIANT", property: axisName, notes: `${axisName}=${opt}` });
        }
      }
    }
  }
  return out;
}
