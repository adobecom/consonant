"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};

// src/contract-extract.ts
var EVIDENCE_SCHEMA = "s2a-figma-evidence/1";
var PAINT_PROPS = ["fills", "strokes"];
function parseVariantName(name) {
  const props = {};
  for (const part of name.split(",")) {
    const eq = part.indexOf("=");
    if (eq !== -1) props[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return props;
}
function parseMeta(desc) {
  const out = { version: "", status: "", updated: "", changelog: "" };
  if (!desc) return out;
  const lines = desc.split("\n");
  if (!/s2a:meta/i.test(lines[0] || "")) return out;
  let end = 1;
  while (end < lines.length && lines[end].trim() !== "") end++;
  const changelog = [];
  let inChangelog = false;
  for (const line of lines.slice(1, end)) {
    const kv = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (kv && !/^\s/.test(line)) {
      inChangelog = false;
      const k = kv[1].toLowerCase();
      const v = kv[2].trim();
      if (k === "version") out.version = v;
      else if (k === "status") out.status = v;
      else if (k === "updated") out.updated = v;
      else if (k === "changelog") {
        inChangelog = true;
        if (v) changelog.push(v);
      }
    } else if (inChangelog) changelog.push(line.trim());
  }
  out.changelog = changelog.join("\n");
  return out;
}
function canonicalJson(value) {
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  if (value && typeof value === "object") {
    const obj = value;
    return "{" + Object.keys(obj).sort().map((k) => JSON.stringify(k) + ":" + canonicalJson(obj[k])).join(",") + "}";
  }
  return JSON.stringify(value === void 0 ? null : value);
}
function boundIds(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => v == null ? void 0 : v.id).filter(Boolean);
  return value.id ? [value.id] : [];
}
function layerTree(node, depth) {
  const layer = { name: node.name, type: node.type };
  const frame = node;
  if ("layoutMode" in node && frame.layoutMode && frame.layoutMode !== "NONE") layer.layoutMode = frame.layoutMode;
  try {
    if ("layoutSizingHorizontal" in node) layer.sizing = { horizontal: node.layoutSizingHorizontal, vertical: node.layoutSizingVertical };
  } catch (e) {
  }
  if (depth < 8 && "children" in node && node.children.length) {
    layer.children = node.children.map((c) => layerTree(c, depth + 1));
  }
  return layer;
}
var GENERIC_NAME = /^(Group|Frame|Rectangle|Ellipse|Line|Vector|Polygon|Star|Union|Subtract|Intersect|Exclude|Boolean|Slice|image|Image|Screenshot|ChatGPT Image)(\s+[\d_.:\- ]+.*)?$|^\d+x\d+$|^[a-z]$/i;
var isGenericName = (name) => GENERIC_NAME.test(name.trim());
function structureSignature(node, depth = 0) {
  const names = [];
  const walkNames = (n, d, prefix) => {
    if (d > 3) return;
    for (const c of "children" in n ? n.children : []) {
      const label = isGenericName(c.name) ? `(${c.type.toLowerCase()})` : c.name.trim();
      names.push(prefix + label);
      walkNames(c, d + 1, prefix + label + "/");
    }
  };
  walkNames(node, depth, "");
  const w = "width" in node ? Math.round(node.width / 8) * 8 : 0;
  const h = "height" in node ? Math.round(node.height / 8) * 8 : 0;
  return { names: [...new Set(names)].sort(), size: `${w}x${h}` };
}
function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = (/* @__PURE__ */ new Set([...a, ...b])).size;
  return union ? inter / union : 1;
}
function detectRepeats(container) {
  const children = ("children" in container ? [...container.children] : []).filter((c) => "children" in c);
  if (children.length < 2) return [];
  const sigs = children.map((c) => ({ node: c, sig: structureSignature(c) }));
  const groups = [];
  for (const entry of sigs) {
    const named = entry.sig.names.filter((n) => !n.includes("("));
    const home = groups.find((g) => {
      const first = g.members[0];
      const firstNamed = first.sig.names.filter((n) => !n.includes("("));
      const nameScore = named.length || firstNamed.length ? jaccard(named, firstNamed) : jaccard(entry.sig.names, first.sig.names);
      return nameScore >= 0.6 && entry.sig.size === first.sig.size;
    });
    if (home) home.members.push(entry);
    else groups.push({ members: [entry], key: entry.sig.size });
  }
  return groups.filter((g) => g.members.length >= 2).map((g) => {
    const shared = g.members.map((m) => new Set(m.sig.names.filter((n) => !n.includes("(")))).reduce((acc, set) => acc.filter((n) => set.has(n)), [...g.members[0].sig.names.filter((n) => !n.includes("("))]);
    return {
      signature: `${g.key}:${shared.join("|")}`,
      count: g.members.length,
      members: g.members.map((m) => ({ id: m.node.id, name: m.node.name, path: "/" + m.node.name, width: Math.round(m.node.width), height: Math.round(m.node.height) })),
      unit: layerTree(g.members[0].node, 0),
      sharedLayers: shared
    };
  }).sort((a, b) => b.count - a.count);
}
var ROLE_PATTERNS = [
  ["heading", /head|title|headline|quote/i],
  ["body", /body|description|meta|role|subtitle|caption/i],
  ["cta", /cta|link|button|action|chevron|caret|arrow/i],
  ["media", /media|image|img|asset|art|illustration|photo|video|picture|thumbnail/i],
  ["icon", /icon|lockup|logo|glyph/i],
  ["eyebrow", /eyebrow|label|tag|badge/i],
  ["pagination", /pagination|dots|indicator/i],
  ["divider", /divider|line|rule|separator/i]
];
function inferRoles(root) {
  const roles = /* @__PURE__ */ new Set();
  const visit = (n, d) => {
    if (d > 6) return;
    const name = n.name.trim();
    if (!isGenericName(name)) {
      for (const [role, re] of ROLE_PATTERNS) if (re.test(name)) roles.add(role);
    }
    if (n.type === "TEXT") roles.add(/head|title|quote/i.test(name) ? "heading" : /body|description|meta|role|subtitle|caption/i.test(name) ? "body" : "text");
    if (["RECTANGLE", "VECTOR", "ELLIPSE", "BOOLEAN_OPERATION", "POLYGON", "STAR", "LINE"].includes(n.type) && isGenericName(name)) roles.add("artwork");
    if ("fills" in n && Array.isArray(n.fills) && n.fills.some((f) => (f == null ? void 0 : f.type) === "IMAGE" && f.visible !== false)) roles.add("media");
    for (const c of "children" in n ? n.children : []) visit(c, d + 1);
  };
  visit(root, 0);
  if (roles.has("artwork") && !roles.has("media")) roles.add("media");
  roles.delete("artwork");
  return [...roles].sort();
}
function pickDefaultVariant(variants, axes) {
  if (!variants.length) return void 0;
  const defaults = axes.filter((a) => a.type === "VARIANT").map((a) => [a.name, String(a.defaultValue)]);
  let best = variants[0];
  let bestScore = -1;
  for (const v of variants) {
    const props = parseVariantName(v.name);
    const score = defaults.filter(([k, val]) => props[k] === val).length;
    if (score > bestScore) {
      best = v;
      bestScore = score;
    }
  }
  return best;
}
async function extractEvidence(api, set) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const isSetLike = set.type === "COMPONENT_SET" || set.type === "COMPONENT";
  const target = set.type === "COMPONENT" && set.parent && set.parent.type === "COMPONENT_SET" ? set.parent : set;
  const variants = target.type === "COMPONENT_SET" ? target.children.filter((c) => c.type === "COMPONENT") : [target];
  const axes = [];
  let defs = {};
  try {
    defs = "componentPropertyDefinitions" in target ? target.componentPropertyDefinitions : {};
  } catch (e) {
    defs = {};
  }
  for (const [name, def] of Object.entries(defs)) {
    const axis = { name, type: def.type, defaultValue: (_a = def.defaultValue) != null ? _a : null };
    if (def.type === "VARIANT") axis.options = (_b = def.variantOptions) != null ? _b : [];
    if (def.type === "INSTANCE_SWAP" && def.preferredValues) {
      axis.preferredValues = def.preferredValues.map((p) => ({ type: p.type, key: p.key }));
    }
    axes.push(axis);
  }
  axes.sort((a, b) => a.name.localeCompare(b.name));
  const bindings = [];
  const explicitModes = [];
  const instanceNodes = [];
  const styleIds = /* @__PURE__ */ new Set();
  const variableIds = /* @__PURE__ */ new Set();
  let nodeCount = 0;
  let unboundPaintNodes = 0;
  const unboundPaint = [];
  function walk(node, variant, path) {
    var _a2, _b2;
    nodeCount++;
    const bv = (_a2 = node.boundVariables) != null ? _a2 : {};
    let paintBound = false;
    for (const property of Object.keys(bv).sort()) {
      for (const id of boundIds(bv[property])) {
        variableIds.add(id);
        bindings.push({ variant, node: path, nodeId: node.id, nodeType: node.type, property, variable: id });
        if (PAINT_PROPS.includes(property)) paintBound = true;
      }
    }
    if (!paintBound) {
      const painted = PAINT_PROPS.filter((p) => Array.isArray(node[p]) && node[p].some((paint) => (paint == null ? void 0 : paint.visible) !== false));
      if (painted.length) {
        unboundPaintNodes++;
        if (unboundPaint.length < 200) unboundPaint.push({ variant, node: path, nodeId: node.id, nodeType: node.type, properties: painted });
      }
    }
    if (node.type === "TEXT") {
      const styleId = node.textStyleId;
      if (typeof styleId === "string" && styleId) {
        styleIds.add(styleId);
        bindings.push({ variant, node: path, nodeId: node.id, nodeType: node.type, property: "textStyle", textStyle: styleId });
      }
    }
    const modes = (_b2 = node.explicitVariableModes) != null ? _b2 : {};
    for (const [collectionId, modeId] of Object.entries(modes)) explicitModes.push({ variant, node: path, collectionId, modeId });
    if (node.type === "INSTANCE") instanceNodes.push({ variant, node: path, instance: node });
    if ("children" in node) {
      for (const child of node.children) walk(child, variant, path + "/" + child.name);
    }
  }
  for (const v of variants) walk(v, v.name, "");
  const variables = /* @__PURE__ */ new Map();
  let pending = [...variableIds];
  for (let round = 0; round < 8 && pending.length; round++) {
    const fetched = await Promise.all(pending.map((id) => api.getVariableByIdAsync(id).catch(() => null)));
    const next = /* @__PURE__ */ new Set();
    fetched.forEach((v, i) => {
      if (!v) return;
      variables.set(pending[i], v);
      for (const value of Object.values(v.valuesByMode)) {
        const alias = value;
        if (alias && typeof alias === "object" && alias.type === "VARIABLE_ALIAS" && !variables.has(alias.id)) next.add(alias.id);
      }
    });
    pending = [...next].filter((id) => !variables.has(id));
  }
  const collectionIds = new Set([...variables.values()].map((v) => v.variableCollectionId));
  for (const m of explicitModes) collectionIds.add(m.collectionId);
  const collections = /* @__PURE__ */ new Map();
  const fetchedCollections = await Promise.all([...collectionIds].map((id) => api.getVariableCollectionByIdAsync(id).catch(() => null)));
  [...collectionIds].forEach((id, i) => {
    const c = fetchedCollections[i];
    if (c) collections.set(id, c);
  });
  const modeName = (collectionId, modeId) => {
    var _a2, _b2, _c2;
    return (_c2 = (_b2 = (_a2 = collections.get(collectionId)) == null ? void 0 : _a2.modes.find((m) => m.modeId === modeId)) == null ? void 0 : _b2.name) != null ? _c2 : modeId;
  };
  function resolve(v, modeId, depth) {
    var _a2, _b2, _c2, _d2, _e2, _f2;
    const raw = (_c2 = v.valuesByMode[modeId]) != null ? _c2 : v.valuesByMode[(_b2 = (_a2 = collections.get(v.variableCollectionId)) == null ? void 0 : _a2.defaultModeId) != null ? _b2 : ""];
    const alias = raw;
    if (alias && typeof alias === "object" && alias.type === "VARIABLE_ALIAS") {
      const target2 = variables.get(alias.id);
      if (!target2 || depth > 8) return { unresolvedAlias: alias.id };
      const targetCollection = collections.get(target2.variableCollectionId);
      const wanted = modeName(v.variableCollectionId, modeId);
      const targetMode = (_f2 = (_e2 = (_d2 = targetCollection == null ? void 0 : targetCollection.modes.find((m) => m.name === wanted)) == null ? void 0 : _d2.modeId) != null ? _e2 : targetCollection == null ? void 0 : targetCollection.defaultModeId) != null ? _f2 : modeId;
      return resolve(target2, targetMode, depth + 1);
    }
    return raw;
  }
  const variableRecords = {};
  for (const id of [...variableIds].sort()) {
    const v = variables.get(id);
    if (!v) continue;
    const collection = collections.get(v.variableCollectionId);
    const valuesByMode = {};
    const resolved = {};
    for (const [modeId, value] of Object.entries(v.valuesByMode)) {
      const name = modeName(v.variableCollectionId, modeId);
      const alias = value;
      valuesByMode[name] = alias && typeof alias === "object" && alias.type === "VARIABLE_ALIAS" ? { alias: (_d = (_c = variables.get(alias.id)) == null ? void 0 : _c.name) != null ? _d : alias.id } : value;
      resolved[name] = resolve(v, modeId, 0);
    }
    variableRecords[id] = {
      name: v.name,
      key: v.key,
      collection: (_e = collection == null ? void 0 : collection.name) != null ? _e : v.variableCollectionId,
      collectionId: v.variableCollectionId,
      resolvedType: v.resolvedType,
      codeSyntax: (_f = v.codeSyntax) != null ? _f : {},
      valuesByMode,
      resolved
    };
  }
  const textStyles = {};
  const styles = await Promise.all([...styleIds].map((id) => api.getStyleByIdAsync(id).catch(() => null)));
  [...styleIds].forEach((id, i) => {
    const s = styles[i];
    if (s) textStyles[id] = { name: s.name, key: s.key };
  });
  const mains = await Promise.all(instanceNodes.map((n) => n.instance.getMainComponentAsync().catch(() => null)));
  const instances = instanceNodes.map((n, i) => {
    const main = mains[i];
    const parent = (main == null ? void 0 : main.parent) && main.parent.type === "COMPONENT_SET" ? main.parent : null;
    return {
      variant: n.variant,
      node: n.node,
      nodeId: n.instance.id,
      mainComponent: main ? { id: main.id, key: main.key, name: main.name } : null,
      set: parent ? { id: parent.id, key: parent.key, name: parent.name } : null
    };
  });
  const defaultVariant = isSetLike ? pickDefaultVariant(variants, axes) : variants[0];
  let pattern;
  if (!isSetLike) {
    const root = target;
    let generic = 0, named = 0;
    const count = (n) => {
      isGenericName(n.name) ? generic++ : named++;
      for (const c of "children" in n ? n.children : []) count(c);
    };
    count(root);
    pattern = {
      kind: "frame",
      repeats: detectRepeats(root),
      genericLayers: generic,
      namedLayers: named,
      roles: inferRoles(root),
      instancedSets: [...new Set(instances.map((i) => {
        var _a2, _b2, _c2;
        return (_c2 = (_a2 = i.set) == null ? void 0 : _a2.name) != null ? _c2 : (_b2 = i.mainComponent) == null ? void 0 : _b2.name;
      }).filter((n) => Boolean(n)))].sort()
    };
  }
  let page = target;
  while (page && page.type !== "PAGE") page = page.parent;
  const evidence = __spreadProps(__spreadValues({
    $schema: EVIDENCE_SCHEMA,
    extractedAt: (/* @__PURE__ */ new Date()).toISOString(),
    extractor: { plugin: "s2a-toolkit", version: api.pluginVersion },
    file: { key: api.fileKey, name: api.fileName, page: page ? { id: page.id, name: page.name } : null },
    set: {
      id: target.id,
      key: (_g = target.key) != null ? _g : "",
      name: target.name,
      type: target.type,
      description: (_h = target.description) != null ? _h : "",
      meta: parseMeta((_i = target.description) != null ? _i : ""),
      documentationLinks: ((_j = target.documentationLinks) != null ? _j : []).map((l) => l.uri)
    },
    axes,
    variants: variants.map((v) => {
      var _a2;
      return { id: v.id, key: (_a2 = v.key) != null ? _a2 : "", name: v.name, props: isSetLike ? parseVariantName(v.name) : {}, width: Math.round(v.width), height: Math.round(v.height) };
    }),
    anatomy: defaultVariant ? { variant: defaultVariant.name, tree: layerTree(defaultVariant, 0) } : null,
    bindings,
    variables: variableRecords,
    textStyles,
    explicitModes: explicitModes.map((m) => {
      var _a2, _b2;
      return { variant: m.variant, node: m.node, collection: (_b2 = (_a2 = collections.get(m.collectionId)) == null ? void 0 : _a2.name) != null ? _b2 : m.collectionId, mode: modeName(m.collectionId, m.modeId) };
    }),
    instances,
    counts: { variants: variants.length, nodes: nodeCount, bindings: bindings.length, unboundPaintNodes },
    unboundPaint
  }, pattern ? { pattern } : {}), {
    provenance: { hash: null }
  });
  return evidence;
}
function hashableBody(evidence) {
  const _a = evidence, { extractedAt, provenance } = _a, rest = __objRest(_a, ["extractedAt", "provenance"]);
  void extractedAt;
  void provenance;
  return canonicalJson(rest);
}

// src/contract-build.ts
var TEXT_ELEMENTS = /^(p|span|h[1-6]|a|button|label|blockquote|cite|small|strong|em)$/;
var ROW_LAYERS = /actions|footer|attribution|row|meta|lockup|controls|nav/i;
var CSS_TO_FIGMA = {
  "background-color": ["fills"],
  background: ["fills"],
  color: ["fills"],
  padding: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
  "padding-top": ["paddingTop"],
  "padding-right": ["paddingRight"],
  "padding-bottom": ["paddingBottom"],
  "padding-left": ["paddingLeft"],
  "padding-inline": ["paddingLeft", "paddingRight"],
  "padding-block": ["paddingTop", "paddingBottom"],
  gap: ["itemSpacing"],
  "row-gap": ["counterAxisSpacing"],
  "column-gap": ["itemSpacing"],
  "border-radius": ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"],
  "border-width": ["strokeWeight"],
  "border-color": ["strokes"],
  border: ["strokes"],
  width: ["width"],
  height: ["height"],
  "min-height": ["minHeight"],
  "min-width": ["minWidth"],
  "font-size": ["fontSize"],
  "line-height": ["lineHeight"],
  "letter-spacing": ["letterSpacing"],
  "font-family": ["fontFamily"],
  "font-weight": ["fontStyle"]
};
function combos(axes) {
  let out = [{}];
  for (const a of axes) {
    const next = [];
    for (const c of out) for (const o of a.options) next.push(__spreadProps(__spreadValues({}, c), { [a.name]: o }));
    out = next;
  }
  return out.slice(0, 24);
}
var cleanName = (n) => n.replace(/^\./, "");
var toTitle = (n) => cleanName(n).replace(/[-_]/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
async function buildSetFromPlan(plan) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const report = { set: "", setId: "", variants: 0, layers: 0, boundVariables: 0, unresolvedVariables: [], stylesApplied: 0, stylesMissing: [], properties: 0, notes: [] };
  const fonts = [
    { family: "Adobe Clean", style: "Regular" },
    { family: "Adobe Clean", style: "Bold" },
    { family: "Adobe Clean Display", style: "Black" },
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Bold" }
  ];
  const loaded = [];
  for (const f of fonts) {
    try {
      await figma.loadFontAsync(f);
      loaded.push(f);
    } catch (e) {
    }
  }
  const fallbackFont = (_a = loaded.find((f) => f.family === "Inter" && f.style === "Regular")) != null ? _a : loaded[0];
  if (!fallbackFont) throw new Error("No font could be loaded (Adobe Clean or Inter)");
  const [variables, styles] = await Promise.all([figma.variables.getLocalVariablesAsync(), figma.getLocalTextStylesAsync()]);
  const byName = /* @__PURE__ */ new Map();
  for (const v of variables) byName.set(v.name, v);
  const styleByName = /* @__PURE__ */ new Map();
  for (const st of styles) {
    styleByName.set(st.name, st);
    styleByName.set((_b = st.name.split("/").pop()) != null ? _b : st.name, st);
  }
  const norm = (s) => s.toLowerCase().replace(/^s2a[/-]/, "").replace(/[^a-z0-9]/g, "");
  const byNorm = /* @__PURE__ */ new Map();
  for (const v of variables) if (!byNorm.has(norm(v.name))) byNorm.set(norm(v.name), v);
  const missingVars = /* @__PURE__ */ new Set();
  const findVar = (name) => {
    var _a2, _b2, _c2;
    const v = (_c2 = (_b2 = (_a2 = byName.get(name)) != null ? _a2 : byName.get(name.replace(/^s2a\//, ""))) != null ? _b2 : byNorm.get(norm(name))) != null ? _c2 : null;
    if (!v) missingVars.add(name);
    return v;
  };
  await figma.loadAllPagesAsync();
  const setsByName = /* @__PURE__ */ new Map();
  for (const n of figma.root.findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] })) {
    if (n.type === "COMPONENT" && ((_c = n.parent) == null ? void 0 : _c.type) === "COMPONENT_SET") continue;
    const k = n.name.replace(/\s*[—-]\s*v\d+$/i, "").toLowerCase();
    if (!setsByName.has(k) || /v2$/i.test(n.name)) setsByName.set(k, n);
  }
  const libraryDefault = (accepts) => {
    for (const a of accepts != null ? accepts : []) {
      const s = setsByName.get(a.toLowerCase());
      if (s) return s.type === "COMPONENT_SET" ? s.defaultVariant : s;
    }
    return null;
  };
  const slotAccepts = /* @__PURE__ */ new Map();
  const collectSlots = (l) => {
    if (l.slot) slotAccepts.set(cleanName(l.name), l.slot.accepts);
    for (const c of l.children) collectSlots(c);
  };
  collectSlots(plan.anatomy);
  const findStyle = (typographyName) => {
    var _a2, _b2, _c2;
    return (_c2 = (_b2 = styleByName.get(typographyName)) != null ? _b2 : styleByName.get((_a2 = typographyName.split("/").pop()) != null ? _a2 : "")) != null ? _c2 : null;
  };
  const stylePromises = [];
  const swapDefaults = /* @__PURE__ */ new Map();
  await Promise.all(plan.properties.filter((p) => p.type === "INSTANCE_SWAP" && typeof p.defaultValue === "string" && p.defaultValue).map(async (p) => {
    const n = await figma.getNodeByIdAsync(String(p.defaultValue));
    const comp = (n == null ? void 0 : n.type) === "COMPONENT" ? n : (n == null ? void 0 : n.type) === "COMPONENT_SET" ? n.defaultVariant : null;
    if (comp) swapDefaults.set(p.name, comp);
  }));
  for (const p of plan.properties) if (p.type === "INSTANCE_SWAP" && !swapDefaults.has(p.name)) {
    const target = [...slotAccepts.keys()].find((k) => {
      var _a2, _b2;
      return ((_a2 = p.layer) != null ? _a2 : "").split("/").some((seg) => cleanName(seg).toLowerCase() === k) || k === ((_b2 = p.forProp) != null ? _b2 : "").replace(/(Src|Source|Url)$/, "").toLowerCase();
    });
    const comp = libraryDefault(target ? slotAccepts.get(target) : void 0);
    if (comp) swapDefaults.set(p.name, comp);
  }
  function bindPaint(node, prop, v) {
    const paints = [...node[prop] || []];
    const base = paints[0] && paints[0].type === "SOLID" ? paints[0] : { type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 } };
    const resolved = v.resolveForConsumer(node);
    const literal = resolved && typeof resolved.value === "object" && "r" in resolved.value ? resolved.value : null;
    const paint = figma.variables.setBoundVariableForPaint(__spreadValues(__spreadValues({}, base), literal ? { color: { r: literal.r, g: literal.g, b: literal.b }, opacity: literal.a } : {}), "color", v);
    node[prop] = [paint];
    report.boundVariables++;
  }
  function bindLayer(node, bindings) {
    for (const [cssProp, names] of Object.entries(bindings)) {
      const targets = CSS_TO_FIGMA[cssProp];
      if (!targets || !names.length) continue;
      const pick = (i) => names.length === 1 ? names[0] : cssProp === "padding" && names.length === 2 ? i % 2 === 0 ? names[0] : names[1] : names[Math.min(i, names.length - 1)];
      targets.forEach((field, i) => {
        const v = findVar(pick(i));
        if (!v) return;
        try {
          if (field === "fills" || field === "strokes") {
            if (node.type !== "TEXT" || field === "fills") bindPaint(node, field, v);
          } else if (field === "fontFamily" || field === "fontStyle" || field === "fontSize" || field === "lineHeight" || field === "letterSpacing") {
            if (node.type === "TEXT") {
              node.setBoundVariable(field, v);
              report.boundVariables++;
            }
          } else {
            node.setBoundVariable(field, v);
            report.boundVariables++;
          }
        } catch (err) {
          report.notes.push(`${node.name}.${field}: ${(err == null ? void 0 : err.message) || err}`);
        }
      });
    }
  }
  function buildLayer(layer, parent, depth) {
    var _a2, _b2, _c2, _d2, _e2;
    const textLike = layer.element && TEXT_ELEMENTS.test(layer.element) || Boolean(layer.bindings["font-size"] || layer.bindings["font-family"]);
    const isText = textLike && !layer.children.length;
    const isImage = layer.element === "img" || /\b(img|image|picture|video)\b/i.test(cleanName(layer.name));
    let node;
    if (textLike && layer.children.length) {
      const row = figma.createFrame();
      row.name = layer.name;
      row.fills = [];
      row.layoutMode = "HORIZONTAL";
      row.primaryAxisSizingMode = "AUTO";
      row.counterAxisSizingMode = "AUTO";
      row.counterAxisAlignItems = "CENTER";
      row.itemSpacing = 8;
      parent.appendChild(row);
      buildLayer({ name: ".label", element: "span", bindings: layer.bindings, slot: null, children: [] }, row, depth + 1);
      for (const child of layer.children) buildLayer(child, row, depth + 1);
      report.layers++;
      try {
        if (parent.layoutMode !== "NONE") row.layoutSizingHorizontal = parent.layoutMode === "VERTICAL" ? "FILL" : "HUG";
      } catch (e) {
      }
      return row;
    }
    if (isText) {
      const t = figma.createText();
      t.name = layer.name;
      t.fontName = fallbackFont;
      t.characters = toTitle(layer.name);
      const sizeVar = (_a2 = layer.bindings["font-size"]) == null ? void 0 : _a2[0];
      const styleName = sizeVar ? sizeVar.replace("typography/font-size/", "typography/") : null;
      const style = styleName ? findStyle(styleName) : null;
      parent.appendChild(t);
      if (style) {
        stylePromises.push(t.setTextStyleIdAsync(style.id).then(() => {
          report.stylesApplied++;
        }).catch(() => {
          report.stylesMissing.push(styleName);
        }));
      } else if (styleName) report.stylesMissing.push(styleName);
      t.textAutoResize = "HEIGHT";
      bindLayer(t, { color: (_b2 = layer.bindings.color) != null ? _b2 : [], fills: (_c2 = layer.bindings.fills) != null ? _c2 : [] });
      node = t;
    } else if (isImage) {
      const r = figma.createRectangle();
      r.name = layer.name;
      r.resize(320, 180);
      r.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.85 } }];
      parent.appendChild(r);
      node = r;
    } else if (layer.element === "hr" || /^(divider|rule|separator)$/i.test(cleanName(layer.name))) {
      const f = figma.createFrame();
      f.name = layer.name;
      f.fills = [];
      f.resize(320, 1);
      f.strokeWeight = 1;
      f.strokes = [{ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } }];
      parent.appendChild(f);
      bindLayer(f, layer.bindings);
      node = f;
    } else if (/^svg|^i$/.test((_d2 = layer.element) != null ? _d2 : "") || /icon|chevron|arrow|caret|glyph/i.test(cleanName(layer.name))) {
      const f = figma.createFrame();
      f.name = layer.name;
      f.resize(24, 24);
      f.fills = [{ type: "SOLID", color: { r: 0.6, g: 0.6, b: 0.6 } }];
      f.cornerRadius = 4;
      parent.appendChild(f);
      bindLayer(f, layer.bindings);
      node = f;
      report.layers++;
      return node;
    } else {
      const f = figma.createFrame();
      f.name = layer.name;
      f.fills = [];
      f.clipsContent = false;
      f.layoutMode = ROW_LAYERS.test(cleanName(layer.name)) ? "HORIZONTAL" : "VERTICAL";
      f.primaryAxisSizingMode = "AUTO";
      f.counterAxisSizingMode = "AUTO";
      f.itemSpacing = 8;
      parent.appendChild(f);
      bindLayer(f, layer.bindings);
      if (layer.slot) {
        const comp = libraryDefault(layer.slot.accepts);
        if (comp) {
          const inst = comp.createInstance();
          inst.name = `[${layer.slot.name}]`;
          f.appendChild(inst);
          report.notes.push(`slot ${layer.slot.name}: filled with ${((_e2 = comp.parent) == null ? void 0 : _e2.type) === "COMPONENT_SET" ? comp.parent.name : comp.name}`);
        } else {
          const placeholder = figma.createFrame();
          placeholder.name = `[${layer.slot.name}: ${layer.slot.accepts.join(" | ")}]`;
          placeholder.resize(120, 40);
          placeholder.fills = [{ type: "SOLID", color: { r: 0.93, g: 0.93, b: 0.93 } }];
          placeholder.strokes = [{ type: "SOLID", color: { r: 0.6, g: 0.6, b: 0.6 } }];
          placeholder.dashPattern = [4, 4];
          f.appendChild(placeholder);
        }
        report.layers++;
      }
      for (const child of layer.children) buildLayer(child, f, depth + 1);
      node = f;
    }
    report.layers++;
    try {
      if (parent.layoutMode !== "NONE") node.layoutSizingHorizontal = parent.layoutMode === "VERTICAL" ? "FILL" : "HUG";
    } catch (e) {
    }
    return node;
  }
  const axes = plan.properties.filter((p) => p.type === "VARIANT").map((p) => {
    var _a2;
    return { name: p.name, options: (_a2 = p.options) != null ? _a2 : [] };
  }).filter((a) => a.options.length);
  const variantProps = combos(axes);
  const components = [];
  const page = figma.currentPage;
  for (const props of variantProps) {
    const c = figma.createComponent();
    c.name = axes.length ? Object.entries(props).map(([k, v]) => `${k}=${v}`).join(", ") : plan.component;
    c.layoutMode = ROW_LAYERS.test(cleanName(plan.anatomy.name)) ? "HORIZONTAL" : "VERTICAL";
    c.primaryAxisSizingMode = "AUTO";
    c.counterAxisSizingMode = "FIXED";
    c.resize(480, 320);
    c.primaryAxisSizingMode = "AUTO";
    c.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    c.itemSpacing = 8;
    page.appendChild(c);
    bindLayer(c, plan.anatomy.bindings);
    for (const child of plan.anatomy.children) buildLayer(child, c, 1);
    report.layers++;
    components.push(c);
  }
  let maxX = 0, minY = Infinity;
  for (const n of page.children) {
    if ("x" in n && "width" in n) {
      maxX = Math.max(maxX, n.x + n.width);
      minY = Math.min(minY, n.y);
    }
  }
  if (!isFinite(minY)) minY = 0;
  const section = figma.createSection();
  section.name = `Contracts / ${plan.component} (generated)`;
  page.appendChild(section);
  section.x = maxX + 200;
  section.y = minY;
  const set = components.length > 1 ? figma.combineAsVariants(components, section) : (() => {
    section.appendChild(components[0]);
    return components[0];
  })();
  set.name = `${plan.component} \u2014 generated`;
  if (set.type === "COMPONENT_SET") {
    let x = 20;
    for (const v of set.children) {
      v.x = x;
      v.y = 20;
      x += v.width + 40;
    }
    set.layoutMode = "NONE";
    const w = x + 20, h = Math.max(...set.children.map((v) => v.height)) + 40;
    set.resizeWithoutConstraints(Math.max(w, 200), Math.max(h, 100));
  }
  set.x = 40;
  set.y = 80;
  section.resizeWithoutConstraints(set.width + 80, set.height + 120);
  const variantsList = set.type === "COMPONENT_SET" ? set.children : [set];
  const key = (s) => cleanName(s).toLowerCase().replace(/^\{|\}$/g, "");
  const findLayer = (root, prop) => {
    var _a2, _b2;
    const fromPath = ((_a2 = prop.layer) != null ? _a2 : "").split("/").map((s) => s.trim()).filter(Boolean).reverse();
    const fp = (_b2 = prop.forProp) != null ? _b2 : "";
    const tail = fp.replace(/^show/i, "").replace(/^.*?([A-Z][a-z0-9]*)$/, "$1");
    const head = fp.replace(/[A-Z].*$/, "");
    const cands = [...fromPath, fp.replace(/^show/i, ""), tail, head, fp].map(key).filter(Boolean);
    const all = "findAll" in root ? root.findAll(() => true) : [];
    const want = prop.type === "TEXT" ? (n) => n.type === "TEXT" || "findOne" in n && Boolean(n.findOne((x) => x.type === "TEXT")) : () => true;
    for (const c of cands) {
      const hit = all.find((n) => key(n.name) === c && want(n));
      if (hit) return hit;
    }
    for (const c of cands) {
      const hit = all.find((n) => key(n.name) === c);
      if (hit) return hit;
    }
    return null;
  };
  const insideInstance = (n) => {
    let p = n.parent;
    while (p && p.type !== "COMPONENT" && p.type !== "COMPONENT_SET" && p.type !== "PAGE") {
      if (p.type === "INSTANCE") return true;
      p = p.parent;
    }
    return false;
  };
  const descend = (target, type) => target.type === type ? target : "findOne" in target ? target.findOne((n) => n.type === type) : null;
  for (const prop of plan.properties.filter((p) => p.type !== "VARIANT")) {
    const name = prop.name.replace(/#\d+:\d+$/, "");
    try {
      const host = set;
      const swapDefault = prop.type === "INSTANCE_SWAP" ? (_d = swapDefaults.get(prop.name)) != null ? _d : null : null;
      if (prop.type === "INSTANCE_SWAP" && !swapDefault) {
        report.notes.push(`property ${name}: no default component to swap (evidence default ${(_e = prop.defaultValue) != null ? _e : "missing"} not found in this file); skipped`);
        continue;
      }
      const textDefault = String((_f = prop.defaultValue) != null ? _f : "").replace(/^"|"$/g, "") || toTitle((_g = prop.forProp) != null ? _g : name);
      const propKey = host.addComponentProperty(name, prop.type, prop.type === "BOOLEAN" ? prop.defaultValue !== false : prop.type === "TEXT" ? textDefault : swapDefault.id);
      report.properties++;
      for (const v of variantsList) {
        let target = findLayer(v, prop);
        if (!target) {
          report.notes.push(`property ${name}: no layer found to wire (looked for ${(_i = (_h = prop.layer) != null ? _h : prop.forProp) != null ? _i : name})`);
          continue;
        }
        if (prop.type === "TEXT") {
          const text = descend(target, "TEXT");
          if (!text) {
            report.notes.push(`property ${name}: layer ${target.name} is a ${target.type} with no text inside; wire it by hand`);
            continue;
          }
          if (insideInstance(text)) {
            report.notes.push(`property ${name}: text lives inside the slotted instance; expose the instance's own text property (nested property) instead of a card-level one`);
            continue;
          }
          text.componentPropertyReferences = __spreadProps(__spreadValues({}, text.componentPropertyReferences || {}), { characters: propKey });
        } else if (prop.type === "BOOLEAN") {
          target.componentPropertyReferences = __spreadProps(__spreadValues({}, target.componentPropertyReferences || {}), { visible: propKey });
        } else if (prop.type === "INSTANCE_SWAP") {
          target = (_j = descend(target, "INSTANCE")) != null ? _j : target;
          if (target.type !== "INSTANCE") {
            const parent = target.parent;
            const inst = swapDefault.createInstance();
            inst.name = target.name;
            parent.insertChild(parent.children.indexOf(target), inst);
            try {
              if (parent.layoutMode !== "NONE") inst.layoutSizingHorizontal = parent.layoutMode === "VERTICAL" ? "FILL" : "HUG";
            } catch (e) {
            }
            target.remove();
            target = inst;
          }
          target.componentPropertyReferences = __spreadProps(__spreadValues({}, target.componentPropertyReferences || {}), { mainComponent: propKey });
        }
      }
    } catch (err) {
      report.notes.push(`property ${name}: ${(err == null ? void 0 : err.message) || err}`);
    }
  }
  await Promise.all(stylePromises);
  report.set = set.name;
  report.setId = set.id;
  report.variants = variantsList.length;
  report.unresolvedVariables = [...missingVars];
  figma.currentPage.selection = [set];
  figma.viewport.scrollAndZoomIntoView([set]);
  return report;
}

// src/contract-normalize.ts
var CSS_TO_FIELD = {
  "background-color": ["fills"],
  background: ["fills"],
  color: ["fills"],
  padding: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
  "padding-top": ["paddingTop"],
  "padding-right": ["paddingRight"],
  "padding-bottom": ["paddingBottom"],
  "padding-left": ["paddingLeft"],
  gap: ["itemSpacing"],
  "border-radius": ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"],
  "border-color": ["strokes"],
  "border-width": ["strokeWeight"],
  "font-size": ["fontSize"],
  "line-height": ["lineHeight"],
  "letter-spacing": ["letterSpacing"],
  "font-family": ["fontFamily"],
  "font-weight": ["fontStyle"]
};
var hex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("") + ("a" in c && c.a !== void 0 && c.a < 1 ? Math.round(c.a * 100) + "%" : "");
var near = (a, b, tol = 0.5) => Math.abs(a - b) <= tol;
var colorNear = (a, b) => {
  var _a, _b;
  return near(a.r, b.r, 2 / 255) && near(a.g, b.g, 2 / 255) && near(a.b, b.b, 2 / 255) && near((_a = "a" in a ? a.a : 1) != null ? _a : 1, (_b = "a" in b ? b.a : 1) != null ? _b : 1, 0.02);
};
function byPath(root, path) {
  var _a;
  const segs = path.replace(/^\//, "").split("/").filter(Boolean);
  let node = root;
  let i = 0;
  while (i < segs.length) {
    if (!("children" in node)) return null;
    let hit = null, used = 0;
    for (let len = segs.length - i; len >= 1 && !hit; len--) {
      const name = segs.slice(i, i + len).join("/");
      hit = (_a = node.children.find((c) => c.name === name)) != null ? _a : null;
      if (hit) used = len;
    }
    if (!hit) return null;
    node = hit;
    i += used;
  }
  return node;
}
async function normalizeFromSource(plan, options = {}) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
  const adopt = Boolean(options.adopt);
  const report = { set: "", setId: "", sourceId: (_b = (_a = plan.anchors) == null ? void 0 : _a.nodeId) != null ? _b : "", mode: adopt ? "adopt" : "normalize", variants: 0, layers: 0, boundVariables: 0, unresolvedVariables: [], stylesApplied: 0, stylesMissing: [], properties: 0, notes: [], renamed: [], drift: [], adopted: [], unmapped: [] };
  const src = ((_c = plan.anchors) == null ? void 0 : _c.nodeId) ? await figma.getNodeByIdAsync(plan.anchors.nodeId) : null;
  if (!src || !("clone" in src)) throw new Error(`anchor ${(_e = (_d = plan.anchors) == null ? void 0 : _d.nodeId) != null ? _e : "(none)"} is not in this file; use the dictionary scaffold instead`);
  const [variables, styles] = await Promise.all([figma.variables.getLocalVariablesAsync(), figma.getLocalTextStylesAsync()]);
  const norm = (s) => s.toLowerCase().replace(/^s2a[/-]/, "").replace(/[^a-z0-9]/g, "");
  const byName = /* @__PURE__ */ new Map(), byNorm = /* @__PURE__ */ new Map();
  for (const v of variables) {
    byName.set(v.name, v);
    if (!byNorm.has(norm(v.name))) byNorm.set(norm(v.name), v);
  }
  const findVar = (name) => {
    var _a2, _b2;
    const v = (_b2 = (_a2 = byName.get(name)) != null ? _a2 : byNorm.get(norm(name))) != null ? _b2 : null;
    if (!v) report.unresolvedVariables.push(name);
    return v;
  };
  const styleByName = /* @__PURE__ */ new Map();
  for (const st of styles) {
    styleByName.set(st.name, st);
    styleByName.set((_f = st.name.split("/").pop()) != null ? _f : st.name, st);
  }
  const fontsNeeded = /* @__PURE__ */ new Set();
  const page = figma.currentPage;
  let maxX = 0, minY = Infinity;
  for (const n of page.children) {
    if ("x" in n) {
      maxX = Math.max(maxX, n.x + n.width);
      minY = Math.min(minY, n.y);
    }
  }
  if (!isFinite(minY)) minY = 0;
  const section = figma.createSection();
  section.name = `Contracts / ${plan.component} (${adopt ? "tokenized" : "normalized"})`;
  page.appendChild(section);
  section.x = maxX + 200;
  section.y = minY;
  const clone = src.clone();
  section.appendChild(clone);
  clone.x = 40;
  clone.y = 80;
  let host;
  if (clone.type === "COMPONENT" || clone.type === "COMPONENT_SET") host = clone;
  else if (clone.type === "FRAME" || clone.type === "INSTANCE") host = figma.createComponentFromNode(clone.type === "INSTANCE" ? await clone.detachInstance() : clone);
  else throw new Error(`cannot normalise a ${clone.type}`);
  host.name = plan.component;
  section.resizeWithoutConstraints(host.width + 80, host.height + 120);
  const variants = host.type === "COMPONENT_SET" ? [...host.children] : [host];
  const parts = [];
  const collect = (l, canonical) => {
    var _a2;
    if (l.source) parts.push({ layer: l, canonical });
    for (const c of (_a2 = l.children) != null ? _a2 : []) collect(c, c.name);
  };
  for (const c of (_g = plan.anatomy.children) != null ? _g : []) collect(c, c.name);
  const mismatch = (entry, bind) => {
    if (!adopt) {
      report.drift.push(entry);
      return;
    }
    try {
      bind();
      report.boundVariables++;
      report.adopted.push(entry);
    } catch (err) {
      report.notes.push(`${entry.layer}.${entry.property}: ${(err == null ? void 0 : err.message) || err}`);
      report.drift.push(entry);
    }
  };
  const bindIfEqual = (target, layerName, bindings) => {
    let node = target;
    for (const [cssProp, names] of Object.entries(bindings)) {
      const fields = CSS_TO_FIELD[cssProp];
      if (!fields || !names.length) continue;
      fields.forEach((field, i) => {
        var _a2, _b2, _c2;
        const v = findVar(names.length === 1 ? names[0] : cssProp === "padding" && names.length === 2 ? i % 2 === 0 ? names[0] : names[1] : names[Math.min(i, names.length - 1)]);
        if (!v) return;
        const resolved2 = v.resolveForConsumer(node);
        const val = resolved2 == null ? void 0 : resolved2.value;
        try {
          if (field === "fills" || field === "strokes") {
            let painted = node;
            if (!(node[field] || []).some((p) => p.type === "SOLID") && "findOne" in node) {
              const glyph = node.findOne((x) => (x.type === "VECTOR" || x.type === "BOOLEAN_OPERATION") && (x[field] || []).some((p) => p.type === "SOLID"));
              if (glyph) painted = glyph;
            }
            node = painted;
            const paints = node[field] || [];
            const solid2 = paints.find((p) => p.type === "SOLID");
            if (!solid2) {
              report.drift.push({ layer: layerName, property: cssProp, drawn: paints.length ? paints[0].type.toLowerCase() : "none", token: v.name, tokenValue: typeof val === "object" && val && "r" in val ? hex(val) : String(val) });
              return;
            }
            const drawn = __spreadProps(__spreadValues({}, solid2.color), { a: (_a2 = solid2.opacity) != null ? _a2 : 1 });
            if (typeof val === "object" && val && "r" in val && colorNear(drawn, val)) {
              node[field] = paints.map((p) => p === solid2 ? figma.variables.setBoundVariableForPaint(solid2, "color", v) : p);
              report.boundVariables++;
            } else mismatch({ layer: layerName, property: cssProp, drawn: hex(drawn), token: v.name, tokenValue: typeof val === "object" && val && "r" in val ? hex(val) : String(val) }, () => {
              const lit = val;
              node[field] = paints.map((p) => {
                var _a3;
                return p === solid2 ? figma.variables.setBoundVariableForPaint(__spreadProps(__spreadValues({}, solid2), { color: { r: lit.r, g: lit.g, b: lit.b }, opacity: (_a3 = lit.a) != null ? _a3 : 1 }), "color", v) : p;
              });
            });
          } else if (field === "fontFamily" || field === "fontStyle") {
            if (node.type !== "TEXT") return;
            const fn = node.fontName;
            const drawn = field === "fontFamily" ? fn.family : fn.style;
            if (String(val).toLowerCase() === String(drawn).toLowerCase()) {
              node.setBoundVariable(field, v);
              report.boundVariables++;
            } else mismatch({ layer: layerName, property: cssProp, drawn: String(drawn), token: v.name, tokenValue: String(val) }, () => {
              node.setBoundVariable(field, v);
            });
          } else if (field === "fontSize" || field === "lineHeight" || field === "letterSpacing") {
            if (node.type !== "TEXT") return;
            const t = node;
            const drawn = field === "fontSize" ? t.fontSize : field === "lineHeight" ? (_b2 = t.lineHeight.value) != null ? _b2 : NaN : (_c2 = t.letterSpacing.value) != null ? _c2 : NaN;
            if (typeof val === "number" && near(drawn, val)) {
              t.setBoundVariable(field, v);
              report.boundVariables++;
            } else mismatch({ layer: layerName, property: cssProp, drawn: String(Math.round(drawn * 100) / 100), token: v.name, tokenValue: String(val) }, () => {
              t.setBoundVariable(field, v);
            });
          } else {
            const drawn = node[field];
            if (typeof drawn !== "number" || typeof val !== "number") {
              report.drift.push({ layer: layerName, property: cssProp, drawn: String(drawn), token: v.name, tokenValue: String(val) });
              return;
            }
            if (near(drawn, val)) {
              node.setBoundVariable(field, v);
              report.boundVariables++;
            } else mismatch({ layer: layerName, property: cssProp, drawn: String(Math.round(drawn * 100) / 100), token: v.name, tokenValue: String(val) }, () => {
              node.setBoundVariable(field, v);
            });
          }
        } catch (err) {
          report.notes.push(`${layerName}.${field}: ${(err == null ? void 0 : err.message) || err}`);
        }
      });
    }
  };
  const resolved = [];
  for (const variant of variants) {
    const nodes = /* @__PURE__ */ new Map();
    for (const { layer, canonical } of parts) {
      const n = byPath(variant, layer.source);
      if (n) nodes.set(canonical, n);
      else report.unmapped.push(`${variant === host ? "" : variant.name + " "}${layer.source} \u2192 ${canonical}`);
    }
    resolved.push({ variant, nodes });
  }
  const stripId = (n) => n.replace(/#\d+:\d+$/, "");
  const existingProps = new Set(Object.keys((_h = host.componentPropertyDefinitions) != null ? _h : {}));
  for (const prop of plan.properties.filter((p) => p.type !== "VARIANT")) {
    const name = stripId(prop.name);
    if (existingProps.has(prop.name)) {
      report.properties++;
      continue;
    }
    try {
      const targets = resolved.map((r) => {
        var _a2, _b2;
        return { r, node: prop.layer ? (_b2 = byPath(r.variant, prop.layer)) != null ? _b2 : prop.layer.startsWith(".") ? (_a2 = r.nodes.get(prop.layer.split("/").pop().replace(/^\./, ""))) != null ? _a2 : null : null : null };
      });
      const textNode = (n) => !n ? null : n.type === "TEXT" ? n : "findOne" in n ? n.findOne((x) => x.type === "TEXT") : null;
      if (prop.type === "TEXT") {
        const first = textNode((_j = (_i = targets[0]) == null ? void 0 : _i.node) != null ? _j : null);
        if (!first) {
          report.notes.push(`property ${name}: no text layer at ${(_k = prop.layer) != null ? _k : "(no layer)"}`);
          continue;
        }
        let p = first.parent;
        let inInstance = false;
        while (p && p.type !== "COMPONENT" && p.type !== "PAGE") {
          if (p.type === "INSTANCE") {
            inInstance = true;
            break;
          }
          p = p.parent;
        }
        if (inInstance) {
          report.notes.push(`property ${name}: text sits inside a nested instance; expose that instance's text property instead`);
          continue;
        }
        const key = host.addComponentProperty(name, "TEXT", first.characters || name);
        report.properties++;
        for (const t of targets) {
          const tn = textNode(t.node);
          if (tn) tn.componentPropertyReferences = __spreadProps(__spreadValues({}, tn.componentPropertyReferences || {}), { characters: key });
        }
      } else if (prop.type === "BOOLEAN") {
        if (!((_l = targets[0]) == null ? void 0 : _l.node)) {
          report.notes.push(`property ${name}: no layer at ${(_m = prop.layer) != null ? _m : "(no layer)"}`);
          continue;
        }
        const key = host.addComponentProperty(name, "BOOLEAN", prop.defaultValue !== false);
        report.properties++;
        for (const t of targets) if (t.node) t.node.componentPropertyReferences = __spreadProps(__spreadValues({}, t.node.componentPropertyReferences || {}), { visible: key });
      } else if (prop.type === "INSTANCE_SWAP") {
        const inst = ((_n = targets[0]) == null ? void 0 : _n.node) && targets[0].node.type === "INSTANCE" ? targets[0].node : null;
        if (!inst) {
          report.notes.push(`property ${name}: ${(_o = prop.layer) != null ? _o : "(no layer)"} is raw layers, not an instance; place a library instance there before it can swap`);
          continue;
        }
        const main = await inst.getMainComponentAsync();
        if (!main) {
          report.notes.push(`property ${name}: instance has no main component`);
          continue;
        }
        const key = host.addComponentProperty(name, "INSTANCE_SWAP", main.id);
        report.properties++;
        for (const t of targets) if (t.node && t.node.type === "INSTANCE") t.node.componentPropertyReferences = __spreadProps(__spreadValues({}, t.node.componentPropertyReferences || {}), { mainComponent: key });
      }
    } catch (err) {
      report.notes.push(`property ${name}: ${(err == null ? void 0 : err.message) || err}`);
    }
  }
  for (const { variant, nodes } of resolved) {
    if (variant.type === "COMPONENT" && host.type === "COMPONENT") {
    }
    for (const { layer, canonical } of parts) {
      const n = nodes.get(canonical);
      if (!n) continue;
      if (n.name !== canonical) {
        report.renamed.push({ from: n.name, to: canonical });
        n.name = canonical;
      }
      bindIfEqual(n, canonical, layer.bindings);
      const sizeVar = (_p = layer.bindings["font-size"]) == null ? void 0 : _p[0];
      if (n.type === "TEXT" && sizeVar) {
        const styleName = sizeVar.replace("typography/font-size/", "typography/");
        const st = (_s = (_r = styleByName.get(styleName)) != null ? _r : styleByName.get((_q = styleName.split("/").pop()) != null ? _q : "")) != null ? _s : null;
        const t = n;
        const fn = t.fontName;
        const styleEntry = st ? { layer: canonical, property: "text-style", drawn: `${fn.family} ${fn.style} ${Math.round(t.fontSize)}`, token: st.name, tokenValue: `${st.fontName.family} ${st.fontName.style} ${st.fontSize}` } : null;
        if (st && st.fontName.family === fn.family && st.fontName.style === fn.style && near(st.fontSize, t.fontSize)) {
          fontsNeeded.add(JSON.stringify(fn));
          await figma.loadFontAsync(fn);
          await t.setTextStyleIdAsync(st.id);
          report.stylesApplied++;
        } else if (st && adopt) {
          await figma.loadFontAsync(fn);
          await figma.loadFontAsync(st.fontName);
          await t.setTextStyleIdAsync(st.id);
          report.stylesApplied++;
          report.adopted.push(styleEntry);
        } else if (st) report.drift.push(styleEntry);
        else report.stylesMissing.push(styleName);
      }
      report.layers++;
    }
    bindIfEqual(variant, ".root", plan.anatomy.bindings);
  }
  report.set = host.name;
  report.setId = host.id;
  report.variants = variants.length;
  report.unresolvedVariables = [...new Set(report.unresolvedVariables)];
  figma.currentPage.selection = [host];
  figma.viewport.scrollAndZoomIntoView([host]);
  return report;
}

// src/doc-check.ts
var CHAR_WIDTH = { 56: 27.5, 24: 11.9, 20: 8.42, 16: 6.74, 14: 5.9 };
var MAX_CHARS = 80;
var MAX_WIDTH = { 24: 640, 20: 640, 16: 500 };
var BODY_SIZES = [24, 20, 16];
var THEME_COLLECTION = "VariableCollectionId:6:17";
var srgb = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
var luminance = (c) => 0.2126 * srgb(c.r) + 0.7152 * srgb(c.g) + 0.0722 * srgb(c.b);
var contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
var solid = (node) => {
  const fills = node.fills;
  if (!Array.isArray(fills)) return null;
  const f = fills.find((p) => p.visible !== false && p.type === "SOLID");
  return f ? f.color : null;
};
var surfaceOf = (node, root) => {
  let n = node.parent;
  while (n && n !== root.parent) {
    const c = solid(n);
    if (c) return c;
    n = n.parent;
  }
  return solid(root);
};
async function checkDocFrame(frame) {
  var _a, _b;
  const issues = [];
  const add = (level, code2, message, nodeId) => issues.push({ level, code: code2, message, nodeId });
  let themeName = null;
  try {
    const theme = await figma.variables.getVariableCollectionByIdAsync(THEME_COLLECTION);
    if (theme) {
      const modeId = frame.resolvedVariableModes[theme.id];
      themeName = (_b = (_a = theme.modes.find((m) => m.modeId === modeId)) == null ? void 0 : _a.name) != null ? _b : null;
      if (themeName && themeName !== "Dark") {
        add("fail", "DOC_THEME_MODE", `theme resolves ${themeName}, not Dark \u2014 this frame will render black on black`, frame.id);
      }
    }
  } catch (e) {
  }
  const texts = frame.findAll((n) => n.type === "TEXT");
  for (const t of texts) {
    const size = typeof t.fontSize === "number" ? t.fontSize : null;
    if (size === null) {
      add("warn", "DOC_MIXED_SIZE", `mixed font sizes in one node \u2014 "${t.characters.slice(0, 36)}\u2026"`, t.id);
      continue;
    }
    const cw = CHAR_WIDTH[size];
    if (!cw) {
      add("warn", "DOC_UNMEASURED_SIZE", `${size}px has no measured character width \u2014 measure it and add it to CHAR_WIDTH`, t.id);
      continue;
    }
    const lines = Math.max(1, Math.round(t.height / (size * 1.5)));
    const chars = lines === 1 ? t.characters.length : Math.round(t.width / cw);
    if (chars > MAX_CHARS) {
      add("fail", "DOC_MEASURE", `${size}px runs ${chars} characters \u2014 WCAG 1.4.8 caps a line at ${MAX_CHARS}`, t.id);
    }
    const lh = t.lineHeight;
    if (BODY_SIZES.includes(size)) {
      const ok = typeof lh === "object" && lh.unit === "PERCENT" && lh.value >= 150;
      if (!ok) {
        const shown = typeof lh === "object" && lh.unit === "PERCENT" ? `${lh.value}%` : typeof lh === "object" ? lh.unit : "mixed";
        add("fail", "DOC_LINE_HEIGHT", `${size}px line height is ${shown} \u2014 WCAG 1.4.8 wants at least 150%`, t.id);
      }
    }
    if (t.textAlignHorizontal === "JUSTIFIED") {
      add("fail", "DOC_JUSTIFIED", `justified text \u2014 WCAG 1.4.8 forbids it: "${t.characters.slice(0, 36)}\u2026"`, t.id);
    }
    const cap = MAX_WIDTH[size];
    if (cap && typeof t.maxWidth === "number" && t.maxWidth > cap) {
      add("warn", "DOC_MAXWIDTH", `${size}px maxWidth ${Math.round(t.maxWidth)} exceeds the ${cap} cap for that size`, t.id);
    }
    const ink = solid(t);
    const bg = surfaceOf(t, frame);
    if (ink && bg) {
      const r = contrast(ink, bg);
      const large = size >= 24;
      const aa = large ? 3 : 4.5;
      const aaa = large ? 4.5 : 7;
      if (r < aa) add("fail", "DOC_CONTRAST", `${size}px contrast ${r.toFixed(2)}:1 \u2014 below WCAG AA (${aa}:1)`, t.id);
      else if (r < aaa) add("warn", "DOC_CONTRAST_AAA", `${size}px contrast ${r.toFixed(2)}:1 \u2014 passes AA, below AAA (${aaa}:1)`, t.id);
    }
  }
  const unnamed = frame.findAll((n) => /^(Frame|Group|Rectangle|Ellipse|Vector|Line) \d+$/.test(n.name));
  for (const n of unnamed.slice(0, 8)) add("warn", "DOC_UNNAMED_LAYER", `unnamed layer "${n.name}"`, n.id);
  if (unnamed.length > 8) add("warn", "DOC_UNNAMED_LAYER", `\u2026and ${unnamed.length - 8} more unnamed layers`);
  const card = frame.children.find((c) => c.name === "Desktop");
  if (card) {
    const names = card.children.map((c) => c.name);
    for (let i = 0; i < names.length - 1; i++) {
      if (names[i] === "separator" && names[i + 1] === "separator") {
        add("warn", "DOC_DOUBLE_RULE", `two separators stacked at position ${i}`, card.children[i].id);
      }
    }
    if (names.length && names[0] !== "section") add("warn", "DOC_RHYTHM", `card starts with "${names[0]}", expected a section`);
    if (names.length && names[names.length - 1] !== "section") add("warn", "DOC_RHYTHM", `card ends with "${names[names.length - 1]}", expected a section`);
  }
  return { issues, textNodes: texts.length, theme: themeName };
}

// src/code.ts
function serializeVariable(v) {
  return {
    id: v.id,
    name: v.name,
    key: v.key,
    resolvedType: v.resolvedType,
    valuesByMode: v.valuesByMode,
    variableCollectionId: v.variableCollectionId,
    scopes: v.scopes,
    codeSyntax: v.codeSyntax || {},
    description: v.description,
    hiddenFromPublishing: v.hiddenFromPublishing
  };
}
function serializeCollection(c) {
  return {
    id: c.id,
    name: c.name,
    key: c.key,
    modes: c.modes,
    defaultModeId: c.defaultModeId,
    variableIds: c.variableIds
  };
}
var DARK_VAR = {
  bgKnockout: "VariableID:6:18",
  bgSubtle: "VariableID:6:47",
  borderSubtle: "VariableID:6:22",
  cBodySubtle: "VariableID:2483:41396",
  cSubheading: "VariableID:2483:41397",
  cKnockout: "VariableID:6:81",
  collectionId: "VariableCollectionId:6:17"
};
function bfv(node, v) {
  const f = node.fills;
  if (!f || f === figma.mixed || !f.length) return;
  const ps = [...f];
  ps[0] = figma.variables.setBoundVariableForPaint(ps[0], "color", v);
  node.fills = ps;
}
async function applyDarkStyle(sec, opts = {}) {
  const rebind = opts.rebindText !== false;
  const [vBg, , vBorder, vBody, vSub, vKo] = await Promise.all([
    figma.variables.getVariableByIdAsync(DARK_VAR.bgKnockout),
    figma.variables.getVariableByIdAsync(DARK_VAR.bgSubtle),
    figma.variables.getVariableByIdAsync(DARK_VAR.borderSubtle),
    figma.variables.getVariableByIdAsync(DARK_VAR.cBodySubtle),
    figma.variables.getVariableByIdAsync(DARK_VAR.cSubheading),
    figma.variables.getVariableByIdAsync(DARK_VAR.cKnockout)
  ]);
  const colls = await figma.variables.getLocalVariableCollectionsAsync();
  const coll = colls.find((c) => c.id === DARK_VAR.collectionId);
  const darkId = coll.modes.find((m) => m.name === "Dark").modeId;
  let bg = sec.children.find(
    (c) => c.type === "RECTANGLE" && c.x === 0 && c.y === 0 && c.height > 10
  );
  if (!bg) {
    bg = figma.createRectangle();
    bg.x = 0;
    bg.y = 0;
    sec.insertChild(0, bg);
  }
  bg.resize(sec.width, sec.height);
  bg.fills = [{ type: "SOLID", color: { r: 0.04, g: 0.04, b: 0.047 } }];
  if (vBg) bfv(bg, vBg);
  let frame = sec.children.find((c) => c.name === ".content" && c.type === "FRAME");
  if (!frame) {
    frame = figma.createFrame();
    frame.name = ".content";
    frame.fills = [];
    frame.clipsContent = false;
    frame.layoutMode = "NONE";
    sec.appendChild(frame);
    const others = [...sec.children].filter((c) => c !== bg && c !== frame);
    for (const n of others) frame.appendChild(n);
  }
  frame.resize(sec.width, sec.height);
  frame.setExplicitVariableModeForCollection(coll, darkId);
  if (!rebind) return;
  for (const child of [...frame.children]) {
    if (child.type === "RECTANGLE") {
      const r = child;
      if (r.height <= 2 && vBorder) bfv(r, vBorder);
    } else if (child.type === "TEXT") {
      const t = child;
      const sz = typeof t.fontSize === "number" ? t.fontSize : 18;
      const st = typeof t.fontName === "object" && t.fontName !== figma.mixed ? (t.fontName.style || "").toLowerCase() : "";
      const bold = st.includes("bold") || st.includes("black");
      const v = sz >= 40 ? vKo : bold && sz >= 16 ? vSub : vBody;
      if (v) bfv(t, v);
    }
  }
}
async function handleBridgeMethod(method, params) {
  switch (method) {
    case "EXECUTE_CODE": {
      const code = params.code;
      if (typeof code !== "string") throw new Error("EXECUTE_CODE: params.code must be a string");
      if (code.length > 65536) throw new Error("EXECUTE_CODE: code exceeds 64KB limit");
      const timeout = Math.min(params.timeout || 5e3, 3e4);
      const wrappedCode = "(async function() {\n" + code + "\n})()";
      const timeoutPromise = new Promise((_r, reject) => {
        setTimeout(() => reject(new Error("Execution timed out after " + timeout + "ms")), timeout);
      });
      let codePromise;
      try {
        codePromise = eval(wrappedCode);
      } catch (err) {
        throw new Error("Syntax error: " + (err.message || String(err)));
      }
      const result = await Promise.race([codePromise, timeoutPromise]);
      return { result, fileContext: { fileName: figma.root.name, fileKey: figma.fileKey || null } };
    }
    case "GET_FILE_INFO": {
      return {
        fileInfo: {
          fileName: figma.root.name,
          fileKey: figma.fileKey || null,
          currentPage: { id: figma.currentPage.id, name: figma.currentPage.name }
        }
      };
    }
    case "REFRESH_VARIABLES":
    case "GET_VARIABLES_DATA": {
      const variables = await figma.variables.getLocalVariablesAsync();
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      const data = {
        success: true,
        timestamp: Date.now(),
        fileKey: figma.fileKey || null,
        variables: variables.map(serializeVariable),
        variableCollections: collections.map(serializeCollection)
      };
      return { data };
    }
    case "GET_SELECTION_DATA": {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) return { selectionData: null };
      const node = serializeNodeForProto(sel[0]);
      return {
        selectionData: __spreadProps(__spreadValues({}, node), {
          fileKey: figma.fileKey || null,
          fileName: figma.root.name,
          page: { id: figma.currentPage.id, name: figma.currentPage.name }
        })
      };
    }
    // CAPTURE_SCREENSHOT — export a node (or the current page) as PNG/JPG/SVG via
    // exportAsync; mirrors the bundled Desktop Bridge so figma_capture_screenshot works
    // through the toolkit. Scale is capped so the longest side is ≤ 1568px (Claude's
    // vision ceiling) — larger exports only cost bandwidth and tokens.
    case "CAPTURE_SCREENSHOT": {
      const node = params.nodeId ? await figma.getNodeByIdAsync(params.nodeId) : figma.currentPage;
      if (!node) throw new Error("Node not found: " + params.nodeId);
      if (!("exportAsync" in node)) throw new Error("Node type " + node.type + " does not support export");
      const format = (params.format || "PNG").toUpperCase();
      const requestedScale = Number(params.scale) > 0 ? Number(params.scale) : 1;
      let scale = requestedScale;
      const AI_MAX_DIMENSION = 1568;
      let w = 0, h = 0;
      if (node.type === "PAGE") {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const child of node.children) {
          const bb = child.absoluteBoundingBox;
          if (child.visible !== false && bb) {
            minX = Math.min(minX, bb.x);
            minY = Math.min(minY, bb.y);
            maxX = Math.max(maxX, bb.x + bb.width);
            maxY = Math.max(maxY, bb.y + bb.height);
          }
        }
        if (minX !== Infinity) {
          w = maxX - minX;
          h = maxY - minY;
        }
      } else if ("width" in node && "height" in node) {
        w = node.width;
        h = node.height;
      }
      if (w > 0 && h > 0) {
        const longest = Math.max(w, h);
        if (longest * scale > AI_MAX_DIMENSION) scale = AI_MAX_DIMENSION / longest;
      }
      const advice = [];
      if (scale < requestedScale) advice.push("Scale capped from " + requestedScale + "x to " + scale.toFixed(2) + "x (AI vision max: 1568px).");
      if (node.type === "PAGE" && scale < 0.5) advice.push("Full-page capture at " + scale.toFixed(2) + "x \u2014 text may be unreadable. Pass a nodeId to target a specific frame.");
      const settings = format === "SVG" ? { format: "SVG" } : { format, constraint: { type: "SCALE", value: scale } };
      const bytes = await node.exportAsync(settings);
      const bounds = "absoluteBoundingBox" in node ? node.absoluteBoundingBox : null;
      return {
        image: {
          base64: figma.base64Encode(bytes),
          format,
          scale,
          byteLength: bytes.length,
          node: { id: node.id, name: node.name, type: node.type },
          bounds,
          formatAdvice: advice.join(" ")
        }
      };
    }
    // CREATE_SLOT — add a native Slot to a COMPONENT (one call per variant for a set).
    // createSlot() takes no arguments; renaming the returned node is the naming API.
    case "CREATE_SLOT": {
      const target = await figma.getNodeByIdAsync(params.nodeId);
      if (!target) throw new Error("Node not found: " + params.nodeId);
      if (target.type !== "COMPONENT") {
        throw new Error("Node must be a COMPONENT (standalone or a variant inside a COMPONENT_SET). Got: " + target.type + ". For a COMPONENT_SET, call this once per variant component.");
      }
      const comp = target;
      if (typeof comp.createSlot !== "function") {
        throw new Error("createSlot() is not available. Update Figma Desktop to a version with Slots support.");
      }
      const slot = comp.createSlot();
      if (params.name) slot.name = String(params.name);
      if (params.layoutMode === "GRID") throw new Error("GRID layoutMode is not allowed on slot nodes");
      if (params.layoutMode) slot.layoutMode = params.layoutMode;
      if (params.width !== void 0 || params.height !== void 0) {
        slot.resize(
          params.width !== void 0 ? Number(params.width) : slot.width,
          params.height !== void 0 ? Number(params.height) : slot.height
        );
      }
      let propertyKey = null;
      try {
        const refs = slot.componentPropertyReferences;
        if (refs && refs.slotContentId) propertyKey = refs.slotContentId;
      } catch (e) {
      }
      return {
        slot: {
          id: slot.id,
          name: slot.name,
          type: slot.type,
          propertyKey,
          width: slot.width,
          height: slot.height,
          layoutMode: slot.layoutMode
        }
      };
    }
    default:
      throw new Error("Unknown method: " + method);
  }
}
var PROTO_FRAME_TYPES = /* @__PURE__ */ new Set([
  "FRAME",
  "COMPONENT",
  "COMPONENT_SET",
  "INSTANCE",
  "GROUP",
  "SECTION"
]);
function notifySelection() {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) {
    figma.ui.postMessage({ type: "selection-changed", setId: null, nodeId: null });
    return;
  }
  const first = sel[0];
  const sectionNodes = sel.filter((n) => n.type === "SECTION");
  figma.ui.postMessage({
    type: "selection-changed",
    setId: first.type === "COMPONENT_SET" || first.type === "COMPONENT" ? first.id : null,
    nodeId: first.id,
    nodeName: first.name,
    nodeType: first.type,
    fileKey: figma.fileKey || null,
    fileName: figma.root.name,
    width: "width" in first ? Math.round(first.width) : void 0,
    height: "height" in first ? Math.round(first.height) : void 0,
    variantCount: first.type === "COMPONENT_SET" ? first.children.length : first.type === "COMPONENT" ? 1 : void 0,
    allNodes: sel.map((n) => ({ id: n.id, name: n.name })),
    isSection: sectionNodes.length > 0,
    sectionCount: sectionNodes.length,
    sectionName: sectionNodes.length > 0 ? sectionNodes[0].name : null
  });
  if (first.type === "COMPONENT_SET") {
    const defs = first.componentPropertyDefinitions;
    const axes = Object.entries(defs).map(([name, def]) => ({
      name,
      type: def.type,
      variantOptions: def.variantOptions
    }));
    figma.ui.postMessage({ type: "select:axes", setId: first.id, setName: first.name, axes });
  }
}
function serializeNodeForProto(node, depth = 0) {
  const base = {
    id: node.id,
    name: node.name,
    type: node.type
  };
  if ("width" in node) {
    base.width = Math.round(node.width);
    base.height = Math.round(node.height);
  }
  if ("componentPropertyDefinitions" in node) {
    const defs = node.componentPropertyDefinitions;
    base.componentProperties = Object.fromEntries(
      Object.entries(defs).map(([k, v]) => [k, { type: v.type, defaultValue: v.defaultValue }])
    );
  }
  if (depth < 2 && "children" in node) {
    base.children = node.children.slice(0, 20).map(
      (c) => serializeNodeForProto(c, depth + 1)
    );
  }
  return base;
}
function parseVariantProps(name) {
  const props = {};
  for (const part of name.split(",")) {
    const eq = part.indexOf("=");
    if (eq !== -1) props[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return props;
}
function parseMetaFence(desc) {
  const out = {
    version: "",
    status: "",
    updated: "",
    changelog: "",
    goodToKnow: "",
    accessibility: "",
    description: "",
    hadFence: false
  };
  if (!desc) return out;
  const lines = desc.split("\n");
  let idx = 0;
  if (/s2a:meta/i.test(lines[0] || "")) {
    out.hadFence = true;
    let end = 1;
    while (end < lines.length && lines[end].trim() !== "") end++;
    const changelog = [];
    let inChangelog = false;
    for (const line of lines.slice(1, end)) {
      const kv = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
      if (kv && !/^\s/.test(line)) {
        inChangelog = false;
        const k = kv[1].toLowerCase();
        const v = kv[2].trim();
        if (k === "version") out.version = v;
        else if (k === "status") out.status = v;
        else if (k === "updated") out.updated = v;
        else if (k === "changelog") {
          inChangelog = true;
          if (v) changelog.push(v);
        }
      } else if (inChangelog) {
        changelog.push(line.trim());
      }
    }
    if (changelog.length) out.changelog = "changelog\n  " + changelog.join("\n  ");
    idx = end + 1;
  }
  const rest = lines.slice(idx).join("\n").trim();
  const gtk = rest.match(/##\s*Good to know\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  const a11y = rest.match(/##\s*Accessibility\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (gtk) out.goodToKnow = gtk[1].trim();
  if (a11y) out.accessibility = a11y[1].trim();
  out.description = rest.split(/\n##\s/)[0].split(/\n\s*\n/)[0].trim();
  return out;
}
function pageOfNode(node) {
  let p = node;
  while (p && p.type !== "PAGE") p = p.parent;
  return p != null ? p : null;
}
function pickDefaultVariant2(variants) {
  if (!variants.length) return void 0;
  const DEFAULTISH = /* @__PURE__ */ new Set([
    "default",
    "resting",
    "standard",
    "md",
    "solid",
    "hug",
    "block",
    "horizontal",
    "on-light"
  ]);
  let best = variants[0];
  let bestScore = -1;
  for (const v of variants) {
    const score = Object.values(parseVariantProps(v.name)).filter((x) => DEFAULTISH.has(x.toLowerCase())).length;
    if (score > bestScore) {
      best = v;
      bestScore = score;
    }
  }
  return best;
}
function clearDocSlot(frame) {
  for (const c of [...frame.children]) c.remove();
}
function anatomyList(comp) {
  const lines = [];
  function walk(node, depth) {
    if (node !== comp && (node.name.startsWith(".") || node.name.startsWith("["))) {
      lines.push("  ".repeat(Math.max(0, depth - 1)) + node.name);
    }
    if ("children" in node && depth < 4) {
      for (const c of node.children) walk(c, depth + 1);
    }
  }
  walk(comp, 0);
  return lines.length ? lines.join("\n") : ".root";
}
function setUsesNativeSlots(set) {
  const v = set.children[0];
  if (v && "findOne" in v) {
    try {
      return !!v.findOne((n) => n.type === "SLOT");
    } catch (e) {
    }
  }
  return false;
}
function clusterPositions(vals, tol) {
  const sorted = Array.from(new Set(vals)).sort((a, b) => a - b);
  const reps = [];
  for (const v of sorted) if (!reps.some((r) => Math.abs(r - v) <= tol)) reps.push(v);
  return reps;
}
function mkAxisLabel(chars, style, size, colorVar) {
  const t = figma.createText();
  t.name = "axis-label";
  t.fontName = { family: "Adobe Clean", style };
  t.fontSize = size;
  t.characters = chars;
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  t.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  if (colorVar) bfv(t, colorVar);
  return t;
}
figma.on("selectionchange", notifySelection);
figma.on("currentpagechange", () => {
  figma.ui.postMessage({
    type: "page-changed",
    page: { id: figma.currentPage.id, name: figma.currentPage.name }
  });
});
var PLUGIN_VERSION = "0.2.1";
figma.showUI(__html__, { width: 320, height: 480, themeColors: true });
function genAnonId() {
  const rnd = () => Math.floor(Math.random() * 4294967295).toString(16).padStart(8, "0");
  return (rnd() + rnd()).slice(0, 16);
}
figma.ui.onmessage = async (msg) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O;
  switch (msg.type) {
    case "ui-ready":
      notifySelection();
      break;
    // Provision the anonymous telemetry id (and opt-out flag) for the UI.
    case "telemetry:init": {
      let anonId = await figma.clientStorage.getAsync("telemetry-anon-id");
      if (!anonId) {
        anonId = genAnonId();
        await figma.clientStorage.setAsync("telemetry-anon-id", anonId);
      }
      const optOut = await figma.clientStorage.getAsync("telemetry-opt-out") === true;
      figma.ui.postMessage({ type: "telemetry:config", anonId, optOut });
      break;
    }
    // GitHub PAT for the Token Release feature — persisted in clientStorage
    // (local to this user's Figma install; never written into the document).
    case "gh-token:get": {
      const token = (_a = await figma.clientStorage.getAsync("gh-token")) != null ? _a : "";
      figma.ui.postMessage({ type: "gh-token:value", token });
      break;
    }
    // Contract sync endpoint: localhost:9410 in development, the relay when
    // published. Per user, never in the document. The relay key is optional.
    case "contract-endpoint:get": {
      const endpoint = await figma.clientStorage.getAsync("contract-endpoint") || "http://localhost:9410";
      const relayKey = await figma.clientStorage.getAsync("contract-relay-key") || "";
      figma.ui.postMessage({ type: "contract-endpoint:value", endpoint, relayKey });
      break;
    }
    case "contract-endpoint:set": {
      const endpoint = (msg.endpoint || "").trim();
      const relayKey = (msg.relayKey || "").trim();
      if (endpoint) await figma.clientStorage.setAsync("contract-endpoint", endpoint);
      else await figma.clientStorage.deleteAsync("contract-endpoint");
      if (relayKey) await figma.clientStorage.setAsync("contract-relay-key", relayKey);
      else await figma.clientStorage.deleteAsync("contract-relay-key");
      break;
    }
    case "gh-token:set": {
      const token = msg.token || "";
      if (token) await figma.clientStorage.setAsync("gh-token", token);
      else await figma.clientStorage.deleteAsync("gh-token");
      break;
    }
    // Gather the Figma context the Request tab attaches to an intake issue:
    // the requester, the selected node, the file/page, and the first S2A token
    // bound to that node (if any). Sent on demand — the UI asks when the Request
    // tab opens and again on each selection change while it's active.
    case "request:capture": {
      let user = null;
      try {
        user = (_c = (_b = figma.currentUser) == null ? void 0 : _b.name) != null ? _c : null;
      } catch (e) {
      }
      const sel = (_d = figma.currentPage.selection[0]) != null ? _d : null;
      let tokenName = "";
      if (sel) {
        try {
          const bv = (_e = sel.boundVariables) != null ? _e : {};
          let firstId = "";
          for (const k of Object.keys(bv)) {
            const val = bv[k];
            if (!val) continue;
            const id = Array.isArray(val) ? ((_f = val.find((v) => v == null ? void 0 : v.id)) != null ? _f : {}).id : val == null ? void 0 : val.id;
            if (id) {
              firstId = id;
              break;
            }
          }
          if (firstId) {
            const v = await figma.variables.getVariableByIdAsync(firstId);
            if (v) tokenName = v.name;
          }
        } catch (e) {
        }
      }
      let fileName = "";
      let fileKey = null;
      let page = "";
      try {
        fileName = figma.root.name;
      } catch (e) {
      }
      try {
        fileKey = (_g = figma.fileKey) != null ? _g : null;
      } catch (e) {
      }
      try {
        page = figma.currentPage.name;
      } catch (e) {
      }
      figma.ui.postMessage({
        type: "request:context",
        user,
        node: sel ? { id: sel.id, name: sel.name, type: sel.type } : null,
        fileKey,
        fileName,
        page,
        tokenName
      });
      break;
    }
    case "select:apply-filter": {
      let parseProps2 = function(name) {
        const props = {};
        for (const part of name.split(",")) {
          const eq = part.indexOf("=");
          if (eq !== -1) props[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
        }
        return props;
      };
      var parseProps = parseProps2;
      const setNode = await figma.getNodeByIdAsync(msg.setId);
      if (!setNode || setNode.type !== "COMPONENT_SET") {
        figma.notify("Component set not found \u2014 click into it and try again");
        break;
      }
      const filter = msg.filter || {};
      const variants = setNode.children;
      const axes = Object.keys(filter);
      const matched = variants.filter((v) => {
        if (axes.length === 0) return true;
        const props = parseProps2(v.name);
        return axes.every((axis) => {
          const allowed = filter[axis];
          return !allowed || allowed.length === 0 || allowed.includes(props[axis]);
        });
      });
      figma.currentPage.selection = matched;
      if (matched.length > 0) figma.viewport.scrollAndZoomIntoView(matched);
      figma.ui.postMessage({
        type: "select:result",
        message: `Selected ${matched.length} of ${variants.length} variants`
      });
      break;
    }
    case "notify": {
      figma.notify(msg.message);
      break;
    }
    // Build a component set from a contract's figma.plan.json (see contract-build.ts).
    // Export a node as PNG and hand it to the sync server through the UI
    // (see ui.ts contract:artifact). { nodeId, name, scale? } → file on disk.
    case "contract:export": {
      try {
        const node = await figma.getNodeByIdAsync(String(msg.nodeId));
        if (!node || !("exportAsync" in node)) throw new Error(`node ${msg.nodeId} not exportable`);
        const bytes = await node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: Number(msg.scale) || 1 } });
        figma.ui.postMessage({ type: "contract:artifact", name: String(msg.name || `${node.name}.png`), b64: figma.base64Encode(bytes) });
      } catch (err) {
        figma.ui.postMessage({ type: "contract:artifact:saved", name: msg.name, error: (err == null ? void 0 : err.message) || String(err) });
      }
      break;
    }
    case "contract:build-set": {
      try {
        const plan = msg.plan;
        const anchored = ((_h = plan == null ? void 0 : plan.anchors) == null ? void 0 : _h.nodeId) ? await figma.getNodeByIdAsync(plan.anchors.nodeId) : null;
        const report = anchored && "clone" in anchored ? await normalizeFromSource(plan, { adopt: Boolean(msg.adopt) }) : await buildSetFromPlan(plan);
        const drift = (_j = (_i = report.drift) == null ? void 0 : _i.length) != null ? _j : 0;
        figma.notify(`Built ${report.set}: ${report.variants} variant${report.variants === 1 ? "" : "s"}, ${report.layers} layers${drift ? `, ${drift} token drift` : ""}`);
        figma.ui.postMessage({ type: "contract:build-set:done", report });
      } catch (err) {
        figma.ui.postMessage({ type: "contract:build-set:done", error: ((err == null ? void 0 : err.message) || String(err)) + ((err == null ? void 0 : err.stack) ? " @ " + ((_k = String(err.stack).split("\n")[1]) == null ? void 0 : _k.trim()) : "") });
      }
      break;
    }
    // Contract evidence: a deterministic walk of the selected component set
    // (or the set behind a selected variant / instance). No judgment here; the
    // UI hashes and publishes the result to the sync server.
    case "contract:extract": {
      const startedAt = Date.now();
      try {
        let node = msg.setId ? await figma.getNodeByIdAsync(msg.setId) : (_l = figma.currentPage.selection[0]) != null ? _l : null;
        if (node && node.type === "INSTANCE") node = await node.getMainComponentAsync();
        const EXTRACTABLE = ["COMPONENT_SET", "COMPONENT", "FRAME", "SECTION", "GROUP"];
        if (!node || !EXTRACTABLE.includes(node.type)) {
          figma.ui.postMessage({ type: "contract:evidence", error: "Select a component set, a variant, an instance, or a frame to extract as a candidate" });
          break;
        }
        const candidateName = (msg.name || "").trim();
        const isFrameLike = node.type === "FRAME" || node.type === "SECTION" || node.type === "GROUP";
        if (candidateName && isFrameLike && msg.rename) node.name = candidateName;
        const evidence = await extractEvidence({
          fileKey: (_m = figma.fileKey) != null ? _m : null,
          fileName: figma.root.name,
          pluginVersion: PLUGIN_VERSION,
          getVariableByIdAsync: (id) => figma.variables.getVariableByIdAsync(id),
          getVariableCollectionByIdAsync: (id) => figma.variables.getVariableCollectionByIdAsync(id),
          getStyleByIdAsync: (id) => figma.getStyleByIdAsync(id)
        }, node);
        if (candidateName && isFrameLike) {
          evidence.set.layerName = msg.rename ? candidateName : node.name;
          evidence.set.name = candidateName;
        }
        figma.ui.postMessage({
          type: "contract:evidence",
          evidence,
          hashInput: hashableBody(evidence),
          canonical: canonicalJson(evidence),
          durationMs: Date.now() - startedAt
        });
      } catch (err) {
        figma.ui.postMessage({ type: "contract:evidence", error: ((err == null ? void 0 : err.message) || String(err)) + ((err == null ? void 0 : err.stack) ? " @ " + ((_n = String(err.stack).split("\n")[1]) == null ? void 0 : _n.trim()) : "") });
      }
      break;
    }
    case "format-section": {
      const sections = figma.currentPage.selection.filter(
        (n) => n.type === "SECTION"
      );
      if (sections.length === 0) {
        figma.notify("Select a section first");
        figma.ui.postMessage({ type: "format-section:done", count: 0 });
        break;
      }
      let styled = 0;
      for (const section of sections) {
        try {
          await applyDarkStyle(section);
          styled++;
        } catch (e) {
        }
      }
      const note = styled === 1 ? "Section styled" : `${styled} sections styled`;
      figma.notify(note);
      figma.ui.postMessage({ type: "format-section:done", count: styled });
      break;
    }
    case "resize-for-view": {
      const w = msg.width || 320;
      const h = msg.height || 480;
      figma.ui.resize(w, h);
      break;
    }
    case "annotate:apply": {
      let bvLabel2 = function(bv, key) {
        var _a2, _b2;
        const val = bv[key];
        if (!val) return "";
        const id = Array.isArray(val) ? ((_a2 = val.find((v) => v == null ? void 0 : v.id)) != null ? _a2 : {}).id : val == null ? void 0 : val.id;
        return id ? (_b2 = varNames.get(id)) != null ? _b2 : "" : "";
      };
      var bvLabel = bvLabel2;
      const categories = new Set((_o = msg.categories) != null ? _o : []);
      const selection = figma.currentPage.selection;
      if (!selection.length) {
        figma.ui.postMessage({ type: "annotate:result", error: "No selection" });
        break;
      }
      const rootSet = new Set(selection);
      const allNodes = [];
      for (const sel of selection) {
        allNodes.push(sel);
        if ("findAll" in sel) allNodes.push(...sel.findAll(() => true));
      }
      const varIdSet = /* @__PURE__ */ new Set();
      for (const n of allNodes) {
        const bv = (_p = n.boundVariables) != null ? _p : {};
        for (const key of Object.keys(bv)) {
          const val = bv[key];
          if (!val) continue;
          if (Array.isArray(val)) val.forEach((v) => {
            if (v == null ? void 0 : v.id) varIdSet.add(v.id);
          });
          else if (val == null ? void 0 : val.id) varIdSet.add(val.id);
        }
      }
      const varNames = /* @__PURE__ */ new Map();
      await Promise.all([...varIdSet].map(async (id) => {
        try {
          const v = await figma.variables.getVariableByIdAsync(id);
          if (v) varNames.set(id, "--" + v.name.replace(/\//g, "-"));
        } catch (e) {
        }
      }));
      let annotated = 0;
      for (const n of allNodes) {
        const bv = (_q = n.boundVariables) != null ? _q : {};
        const anns = [];
        const pdVar = (_s = (_r = n.getPluginData) == null ? void 0 : _r.call(n, "s2aTokenVar")) != null ? _s : "";
        const pdProp = (_u = (_t = n.getPluginData) == null ? void 0 : _t.call(n, "s2aTokenProp")) != null ? _u : "";
        if (categories.has("color-fg") && n.type === "TEXT") {
          if (((_w = (_v = bv.fills) == null ? void 0 : _v.length) != null ? _w : 0) > 0) {
            anns.push({ label: bvLabel2(bv, "fills") || "color-fg", properties: [{ type: "fills" }] });
          } else if (pdVar && pdProp === "fills") {
            anns.push({ label: pdVar, properties: [{ type: "fills" }] });
          }
        }
        if (categories.has("color-bg") && n.type !== "TEXT") {
          if (((_y = (_x = bv.fills) == null ? void 0 : _x.length) != null ? _y : 0) > 0) {
            anns.push({ label: bvLabel2(bv, "fills") || "color-bg", properties: [{ type: "fills" }] });
          } else if (pdVar && pdProp === "fills") {
            anns.push({ label: pdVar, properties: [{ type: "fills" }] });
          }
        }
        if (categories.has("spacing")) {
          const padKeys = ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"];
          const boundPad = padKeys.filter((k) => bv[k]);
          if (boundPad.length) {
            const lbl = bvLabel2(bv, boundPad[0]);
            anns.push({ label: lbl || "padding", properties: [{ type: "padding" }] });
          }
          if (bv.itemSpacing) {
            const lbl = bvLabel2(bv, "itemSpacing");
            anns.push({ label: lbl || "gap", properties: [{ type: "itemSpacing" }] });
          }
          if (pdVar && pdProp === "spacing") {
            anns.push({ label: pdVar, properties: [{ type: "width" }] });
          }
        }
        if (categories.has("shape")) {
          const radiusKey = ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius", "cornerRadius"].find((k) => bv[k]);
          if (radiusKey) {
            anns.push({ label: bvLabel2(bv, radiusKey) || "border-radius", properties: [{ type: "cornerRadius" }] });
          } else if (pdVar && pdProp === "cornerRadius") {
            anns.push({ label: pdVar, properties: [{ type: "cornerRadius" }] });
          }
          if (bv.strokeWeight) {
            anns.push({ label: bvLabel2(bv, "strokeWeight") || "border-width", properties: [{ type: "strokeWeight" }] });
          } else if (pdVar && pdProp === "strokeWeight") {
            anns.push({ label: pdVar, properties: [{ type: "strokeWeight" }] });
          }
        }
        if (categories.has("typography") && n.type === "TEXT") {
          const tp = [];
          if (((_A = (_z = bv.fontFamily) == null ? void 0 : _z.length) != null ? _A : 0) > 0) tp.push({ type: "fontFamily" });
          if (((_C = (_B = bv.fontSize) == null ? void 0 : _B.length) != null ? _C : 0) > 0) tp.push({ type: "fontSize" });
          if (((_E = (_D = bv.lineHeight) == null ? void 0 : _D.length) != null ? _E : 0) > 0) tp.push({ type: "lineHeight" });
          if (((_G = (_F = bv.letterSpacing) == null ? void 0 : _F.length) != null ? _G : 0) > 0) tp.push({ type: "letterSpacing" });
          if (tp.length) {
            const lbl = bvLabel2(bv, "fontSize") || bvLabel2(bv, "fontFamily") || "typography";
            anns.push({ label: lbl, properties: tp });
          }
          if (((_I = (_H = bv.fontStyle) == null ? void 0 : _H.length) != null ? _I : 0) > 0) {
            const lbl = bvLabel2(bv, "fontStyle");
            anns.push({ label: lbl || "font-weight", properties: [{ type: "fontWeight" }] });
          }
        }
        if (categories.has("blur")) {
          const isBlurNode = pdProp === "blur" || pdProp === "width" && n.name === ".blur-swatch";
          if (pdVar && isBlurNode) {
            anns.push({ label: pdVar, properties: [] });
          }
        }
        if (categories.has("opacity")) {
          const isOpacityNode = pdProp === "opacity" || n.name === ".opacity-swatch";
          if (pdVar && isOpacityNode) {
            anns.push({ label: pdVar, properties: [] });
          }
        }
        if (categories.has("sizing") && rootSet.has(n) && ["INSTANCE", "COMPONENT", "COMPONENT_SET"].includes(n.type))
          anns.push({ label: n.name.replace(/^\./, ""), properties: [{ type: "width" }, { type: "height" }] });
        if (anns.length > 0) {
          try {
            n.annotations = anns;
            annotated++;
          } catch (e) {
          }
        }
      }
      figma.ui.postMessage({ type: "annotate:result", annotated });
      break;
    }
    case "annotate:clear": {
      const clearSel = figma.currentPage.selection;
      const all = [];
      for (const sel of clearSel) {
        all.push(sel);
        if ("findAll" in sel) all.push(...sel.findAll(() => true));
      }
      let cleared = 0;
      for (const n of all) {
        try {
          if (((_J = n.annotations) == null ? void 0 : _J.length) > 0) {
            n.annotations = [];
            cleared++;
          }
        } catch (e) {
        }
      }
      figma.ui.postMessage({ type: "annotate:cleared", cleared });
      break;
    }
    case "bridge:command": {
      const requestId = msg.requestId;
      const method2 = msg.method;
      const params2 = msg.params || {};
      try {
        const result2 = await handleBridgeMethod(method2, params2);
        figma.ui.postMessage(__spreadValues({ type: "bridge:command-result", requestId, success: true }, result2));
      } catch (e) {
        figma.ui.postMessage({ type: "bridge:command-result", requestId, success: false, error: e.message || String(e) });
      }
      break;
    }
    // Clicking a reported issue jumps to the layer it is about — a finding you
    // cannot locate is barely a finding.
    // An INSTANCE_SWAP already declares what belongs in it: a default component
    // and Figma's preferred-values list. Reading that beats asking a person to
    // scan every contract in the repo for the one the set already points at.
    case "studio:swap-targets": {
      try {
        let node = await figma.getNodeByIdAsync(msg.setId);
        if (node && node.type === "COMPONENT" && ((_K = node.parent) == null ? void 0 : _K.type) === "COMPONENT_SET") node = node.parent;
        if (!node || node.type !== "COMPONENT_SET" && node.type !== "COMPONENT") {
          figma.ui.postMessage({ type: "studio:swap-targets-result", targets: {} });
          break;
        }
        const defs = (_L = node.componentPropertyDefinitions) != null ? _L : {};
        const setNameOf = (n) => !n ? null : n.parent && n.parent.type === "COMPONENT_SET" ? n.parent.name : n.name;
        const targets = {};
        for (const [prop, def] of Object.entries(defs)) {
          if (def.type !== "INSTANCE_SWAP") continue;
          const found = [];
          const seen = /* @__PURE__ */ new Set();
          const add = (role, name) => {
            if (name && !seen.has(name)) {
              seen.add(name);
              found.push({ role, name });
            }
          };
          const dv = def.defaultValue;
          if (dv) {
            try {
              add("default", setNameOf(await figma.getNodeByIdAsync(dv)));
            } catch (e) {
            }
          }
          for (const pv of (_M = def.preferredValues) != null ? _M : []) {
            try {
              const imported = pv.type === "COMPONENT_SET" ? await figma.importComponentSetByKeyAsync(pv.key) : await figma.importComponentByKeyAsync(pv.key);
              add("preferred", setNameOf(imported));
            } catch (e) {
            }
          }
          targets[prop] = found;
        }
        figma.ui.postMessage({ type: "studio:swap-targets-result", targets });
      } catch (e) {
        figma.ui.postMessage({ type: "studio:swap-targets-result", targets: {}, error: e.message || String(e) });
      }
      break;
    }
    case "docs:reveal": {
      const node = await figma.getNodeByIdAsync(msg.nodeId);
      if (!node || !("visible" in node)) {
        figma.notify("That layer is gone \u2014 re-run the check");
        break;
      }
      const page = (() => {
        let n = node;
        while (n && n.type !== "PAGE") n = n.parent;
        return n;
      })();
      if (page && page !== figma.currentPage) await figma.setCurrentPageAsync(page);
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
      break;
    }
    case "docs:check": {
      try {
        const node = await figma.getNodeByIdAsync(msg.nodeId);
        if (!node || node.type !== "FRAME") {
          figma.ui.postMessage({ type: "docs:check-result", error: "Select a documentation frame" });
          break;
        }
        const { issues, textNodes, theme } = await checkDocFrame(node);
        figma.ui.postMessage({
          type: "docs:check-result",
          name: node.name,
          textNodes,
          theme,
          fails: issues.filter((i) => i.level === "fail").length,
          warns: issues.filter((i) => i.level === "warn").length,
          issues
        });
      } catch (e) {
        figma.ui.postMessage({ type: "docs:check-result", error: e.message || String(e) });
      }
      break;
    }
    case "doc:generate": {
      try {
        const setId = msg.setId;
        let node = await figma.getNodeByIdAsync(setId);
        if (node && node.type === "COMPONENT" && node.parent && node.parent.type === "COMPONENT_SET") {
          node = node.parent;
        }
        if (!node || node.type !== "COMPONENT_SET" && node.type !== "COMPONENT") {
          figma.ui.postMessage({ type: "doc:result", error: "Select a component or component set first" });
          break;
        }
        const isSingle = node.type === "COMPONENT";
        const set = node;
        await Promise.all([
          figma.loadFontAsync({ family: "Adobe Clean Display", style: "Bold" }),
          figma.loadFontAsync({ family: "Adobe Clean", style: "Regular" }),
          figma.loadFontAsync({ family: "Adobe Clean", style: "Bold" })
        ]);
        await figma.loadAllPagesAsync();
        const tplPage = figma.root.children.find((p) => p.name === "\u{1F4D0} Templates");
        const template = tplPage == null ? void 0 : tplPage.children.find((c) => c.name === "Doc Template");
        if (!template) {
          figma.ui.postMessage({ type: "doc:result", error: 'Template not found \u2014 add "Doc Template" to the "\u{1F4D0} Templates" page' });
          break;
        }
        const bColls = await figma.variables.getLocalVariableCollectionsAsync();
        const themeColl = bColls.find((c) => c.id === "VariableCollectionId:6:17");
        const darkModeId = (_N = themeColl == null ? void 0 : themeColl.modes.find((m) => m.name === "Dark")) == null ? void 0 : _N.modeId;
        const [cLabel, cCaption, cBody] = await Promise.all([
          figma.variables.getVariableByIdAsync("VariableID:2483:41392"),
          // content/label
          figma.variables.getVariableByIdAsync("VariableID:2483:41395"),
          // content/caption
          figma.variables.getVariableByIdAsync("VariableID:2483:41396")
          // content/body-subtle
        ]);
        const meta = parseMetaFence(set.description || "");
        const doc = template.clone();
        doc.name = `${set.name} \xB7 Docs`;
        const container = set.parent;
        container.appendChild(doc);
        doc.x = set.x + set.width + 200;
        doc.y = set.y;
        const find = (name) => doc.findOne((n) => n.name === name);
        async function setText(name, value) {
          const t = find(name);
          if (!t || t.type !== "TEXT" || value == null) return;
          const tn = t;
          const fonts = tn.getRangeAllFontNames(0, Math.max(1, tn.characters.length));
          for (const f of fonts) await figma.loadFontAsync(f);
          tn.characters = value;
        }
        await setText("@hero-name", set.name);
        await setText("@hero-desc", meta.description || "One-line description of what this component is and when to use it.");
        await setText("@version", meta.version || "0.0.0");
        await setText("@status", meta.status || "active");
        await setText("@updated", meta.updated ? `updated ${meta.updated}` : "updated \u2014");
        await setText("@changelog", meta.changelog || "changelog\n  \u2014");
        if (meta.goodToKnow) await setText("@good-to-know", meta.goodToKnow);
        if (meta.accessibility) await setText("@accessibility", meta.accessibility);
        const variants = isSingle ? [node] : set.children.filter((c) => c.type === "COMPONENT");
        const defaultVariant = pickDefaultVariant2(variants);
        const heroSlot = find("@slot-hero");
        if (heroSlot && defaultVariant) {
          clearDocSlot(heroSlot);
          heroSlot.clipsContent = false;
          heroSlot.paddingTop = 20;
          heroSlot.paddingBottom = 20;
          heroSlot.counterAxisSizingMode = "AUTO";
          heroSlot.appendChild(defaultVariant.createInstance());
        }
        if (defaultVariant) await setText("@anatomy", anatomyList(defaultVariant));
        const propsSlot = find("@properties");
        if (propsSlot) {
          clearDocSlot(propsSlot);
          propsSlot.strokes = [];
          propsSlot.dashPattern = [];
          propsSlot.fills = [];
          propsSlot.layoutMode = "VERTICAL";
          propsSlot.primaryAxisAlignItems = "MIN";
          propsSlot.counterAxisAlignItems = "MIN";
          propsSlot.itemSpacing = 8;
          propsSlot.paddingTop = 0;
          propsSlot.paddingBottom = 0;
          propsSlot.paddingLeft = 0;
          propsSlot.paddingRight = 0;
          for (const [rawName, def] of Object.entries(set.componentPropertyDefinitions)) {
            const nm = rawName.split("#")[0];
            const opts = def.variantOptions;
            const line = `${nm}  \xB7  ${String(def.type).toLowerCase()}` + (opts ? "  \xB7  " + opts.join(" / ") : "");
            const t = figma.createText();
            t.fontName = { family: "Adobe Clean", style: "Regular" };
            t.fontSize = 14;
            t.characters = line;
            t.textAutoResize = "HEIGHT";
            propsSlot.appendChild(t);
            t.layoutSizingHorizontal = "FILL";
            if (cBody) bfv(t, cBody);
          }
          propsSlot.primaryAxisSizingMode = "AUTO";
        }
        const gridSlot = find("@slot-all-variants");
        if (gridSlot && variants.length) {
          clearDocSlot(gridSlot);
          gridSlot.strokes = [];
          gridSlot.dashPattern = [];
          gridSlot.fills = [];
          gridSlot.layoutMode = "NONE";
          gridSlot.clipsContent = false;
          const items = variants.map((v) => ({
            v,
            props: parseVariantProps(v.name),
            nx: 0,
            ny: 0,
            w: Math.round(v.width),
            h: Math.round(v.height),
            rx: Math.round(v.x),
            ry: Math.round(v.y)
          }));
          const minX = Math.min(...items.map((i) => i.rx));
          const minY = Math.min(...items.map((i) => i.ry));
          for (const it of items) {
            it.nx = it.rx - minX;
            it.ny = it.ry - minY;
          }
          const propNames = Array.from(new Set(items.flatMap((i) => Object.keys(i.props))));
          const varying = propNames.filter((p) => new Set(items.map((i) => i.props[p])).size > 1);
          const yReps = clusterPositions(items.map((i) => i.ny), 6);
          const rowOf = (ny) => {
            var _a2;
            return (_a2 = yReps.find((y) => Math.abs(y - ny) <= 6)) != null ? _a2 : ny;
          };
          const rowProps = varying.filter(
            (p) => yReps.every((y) => new Set(items.filter((i) => rowOf(i.ny) === y).map((i) => i.props[p])).size === 1)
          );
          const colProps = varying.filter((p) => !rowProps.includes(p));
          const GUTTER_Y = 34;
          const rowLabels = [];
          for (const y of yReps) {
            const rep = items.find((i) => rowOf(i.ny) === y);
            const txt = rowProps.map((p) => rep.props[p]).filter(Boolean).join(" \xB7 ");
            if (!txt) continue;
            const t = mkAxisLabel(txt, "Bold", 12, cLabel);
            gridSlot.appendChild(t);
            rowLabels.push({ t, y, h: rep.h });
          }
          const maxLW = rowLabels.length ? Math.max(...rowLabels.map((r) => r.t.width)) : 0;
          const GUTTER_X = Math.max(56, Math.round(maxLW) + 24);
          let maxRight = 0, maxBottom = 0;
          for (const it of items) {
            const inst = it.v.createInstance();
            gridSlot.appendChild(inst);
            inst.x = GUTTER_X + it.nx;
            inst.y = GUTTER_Y + it.ny;
            maxRight = Math.max(maxRight, inst.x + it.w);
            maxBottom = Math.max(maxBottom, inst.y + it.h);
          }
          for (const r of rowLabels) {
            r.t.x = GUTTER_X - 16 - r.t.width;
            r.t.y = GUTTER_Y + r.y + Math.round(r.h / 2) - Math.round(r.t.height / 2);
          }
          const topY = Math.min(...yReps);
          const topRow = items.filter((i) => rowOf(i.ny) === topY).sort((a, b) => a.nx - b.nx);
          for (const it of topRow) {
            const txt = colProps.map((p) => it.props[p]).filter(Boolean).join(" \xB7 ");
            if (!txt) continue;
            const t = mkAxisLabel(txt, "Regular", 11, cCaption);
            gridSlot.appendChild(t);
            t.x = GUTTER_X + it.nx;
            t.y = GUTTER_Y - 22;
          }
          gridSlot.resize(Math.max(maxRight + 24, gridSlot.width), maxBottom + 24);
        }
        const slotsRow = doc.findOne((n) => n.name === "row: slots");
        if (slotsRow) {
          let usesSlots = false;
          try {
            usesSlots = !!((_O = variants[0]) == null ? void 0 : _O.findOne((n) => n.type === "SLOT"));
          } catch (e) {
          }
          slotsRow.visible = usesSlots;
        }
        const darkSlot = find("@slot-dark-preview");
        if (darkSlot && gridSlot) {
          clearDocSlot(darkSlot);
          darkSlot.strokes = [];
          darkSlot.dashPattern = [];
          darkSlot.fills = [];
          darkSlot.layoutMode = "NONE";
          darkSlot.clipsContent = false;
          const gclone = gridSlot.clone();
          darkSlot.appendChild(gclone);
          gclone.x = 0;
          gclone.y = 0;
          if (themeColl && darkModeId) gclone.setExplicitVariableModeForCollection(themeColl, darkModeId);
          darkSlot.resize(Math.max(darkSlot.width, gclone.width), gclone.height + 8);
        }
        for (const child of doc.children) {
          if (child.type === "FRAME") {
            const f = child;
            if (f.layoutMode === "VERTICAL") f.primaryAxisSizingMode = "AUTO";
            else if (f.layoutMode === "HORIZONTAL") f.counterAxisSizingMode = "AUTO";
          }
        }
        doc.primaryAxisSizingMode = "AUTO";
        const page = pageOfNode(set);
        if (page && page !== figma.currentPage) await figma.setCurrentPageAsync(page);
        figma.currentPage.selection = [doc];
        figma.viewport.scrollAndZoomIntoView([doc]);
        figma.ui.postMessage({
          type: "doc:result",
          nodeId: doc.id,
          variantCount: variants.length,
          warning: meta.hadFence ? void 0 : "No s2a:meta fence in the set description \u2014 used placeholders for version / changelog / prose"
        });
      } catch (e) {
        figma.ui.postMessage({ type: "doc:result", error: e.message || String(e) });
      }
      break;
    }
  }
};
