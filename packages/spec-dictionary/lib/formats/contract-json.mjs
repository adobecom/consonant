// contract.json — the interop artifact, conformant to southleft/ds-contracts-poc.
//
// Why this is separate from spec.json rather than a migration of it: the two
// answer different questions. spec.json is our working format — it carries
// resolved token values, evidence hashes and the open decisions, all of which
// the upstream schema forbids (it is additionalProperties:false at every level)
// and all of which our own tooling reads. The contract is the portable statement
// of the component's API, and it is what a second party can validate.
//
// Same relationship upstream has: a curated def is the input, the contract is the
// generated output, and the working detail lives beside it rather than inside it.
//
// Everything here is a mapping, never an invention. When a field cannot be
// expressed honestly it is omitted, not guessed — the conformance count in
// npm run specs:upstream is only meaningful if nothing is faked to raise it.

// semantics.element is a closed enum upstream; a part's element is a free string.
const ELEMENTS = new Set(["button", "span", "div", "a", "input", "article", "section", "header", "footer", "label", "nav", "hr", "ul", "li", "p", "textarea", "select", "fieldset", "blockquote", "code", "kbd", "h1", "h2", "h3", "h4", "h5", "h6"]);
const STATES = new Set(["hover", "active", "focus-visible", "disabled"]);
// Our vocabulary for the same four runtime states.
const STATE_ALIAS = { focused: "focus-visible", focus: "focus-visible", pressed: "active" };
const ARCHETYPES = new Set(["button", "badge / tag / chip", "checkbox / radio", "toggle / switch", "banner / alert / toast", "input / field", "card", "avatar", "tabs", "accordion", "progress / spinner", "slider", "select / combobox", "modal / dialog", "tooltip / popover", "menu / dropdown", "pagination", "table / data-grid", "calendar / date-picker", "breadcrumb", "nav (top / side)", "none"]);

const SEMVER = /^\d+\.\d+\.\d+$/;
const SHA = /^sha256:[0-9a-f]{64}$/;

const statusOf = (defsStatus, deprecated) => {
  if (deprecated) return "deprecated";
  return defsStatus === "approved" ? "stable" : "draft";
};

// Our resolved token node is { value, raw, tokens[] }; upstream wants the bare
// ref string. A raw: value is not a token, so it belongs in literals instead.
const splitTokens = (nodeTokens = {}) => {
  const tokens = {}, literals = {};
  for (const [cssProp, t] of Object.entries(nodeTokens)) {
    const value = typeof t === "string" ? t : t?.value;
    if (typeof value !== "string") continue;
    if (value.startsWith("raw:")) literals[cssProp] = value.slice(4);
    else if (/^\{[a-z0-9.{}-]+\}$/.test(value)) tokens[cssProp] = value;
    else literals[cssProp] = value;
  }
  return { tokens, literals };
};

const mapType = (p) => {
  if (Array.isArray(p.enum) && p.enum.length) return { enum: p.enum.map(String) };
  if (p.type === "boolean") return "boolean";
  if (p.type === "number") return "number";
  return "text";
};

// Upstream requires BOTH bindings on every prop, and its kind vocabulary is five
// values. Ours carries three more, so they are narrowed to the nearest honest
// upstream kind rather than passed through:
//   INSTANCE → INSTANCE_SWAP   an instance layer becomes a swap property
//   SLOT     → NONE            Figma Slots postdate this schema; the slot itself
//                              is still fully described in anatomy.<part>.slot
//   LAYER    → NONE            literally true: no component property exists yet,
//                              only a layer path, which spec.json keeps
// NONE is their sanctioned "declared: no design counterpart" — a statement, not a
// gap — so narrowing loses detail but never asserts something false.
const FIGMA_KIND = { VARIANT: "VARIANT", BOOLEAN: "BOOLEAN", TEXT: "TEXT", INSTANCE_SWAP: "INSTANCE_SWAP", INSTANCE: "INSTANCE_SWAP", SLOT: "NONE", LAYER: "NONE", NONE: "NONE" };

const mapPropBindings = (p) => {
  const f = p.bindings?.figma;
  let figma;
  if (!f || f === "NONE") figma = { kind: "NONE", property: "—" };
  else {
    const kind = FIGMA_KIND[f.kind] ?? "NONE";
    // A narrowed binding has no property to name upstream; say so rather than
    // pointing at a layer path as if it were a component property.
    figma = kind === "NONE" ? { kind: "NONE", property: "—" } : { kind, property: f.property ? String(f.property) : "—", ...(f.values ? { values: f.values } : {}), ...(f.valueMap ? { valueMap: f.valueMap } : {}) };
  }
  // The schema is framework-agnostic — nothing in it is React-shaped; code bindings
  // are {prop, initial, values} and anchors are {importPath, export}. The one hole
  // for a web-component platform like Milo is that it assumes ONE code-side name,
  // while a custom element has two: a property and an attribute. We emit the public
  // name here and keep the prop/attr pair in spec.json. Worth proposing upstream as
  // an optional `attr`, since it is what makes the schema usable off React.
  const code = { prop: p.bindings?.code?.prop ?? p.name };
  return { figma, code };
};

const mapNode = (node) => {
  if (!node || typeof node !== "object") return {};
  const out = {};
  // Our `notes` is their `description`; `selector` and `figma` have no home
  // upstream (selectors derive from the id and part path by convention).
  const description = node.description ?? node.notes;
  if (description) out.description = Array.isArray(description) ? description.join(" ") : String(description);
  if (node.element) out.element = String(node.element);
  // Upstream has a `layout` field for exactly this. Tokens say what a thing
  // looks like; layout says how it sits. A contract carrying only the first
  // renders a button with the right colours and no display property.
  if (node.layout && typeof node.layout === "object") {
    const L = {};
    for (const k of ["display", "direction", "align", "justify", "grow", "wrap", "stretch", "stack"]) if (node.layout[k] !== undefined) L[k] = node.layout[k];
    if (Object.keys(L).length) out.layout = L;
  }
  const { tokens, literals } = splitTokens(node.tokens);
  if (Object.keys(tokens).length) out.tokens = tokens;
  if (Object.keys(literals).length) out.literals = literals;
  // An asset-backed part: the content is a file chosen by a prop, not markup a
  // consumer passes in. Carried verbatim — a generator needs all of it to emit
  // a src, and the manifest it names ships alongside the contracts.
  if (node.asset?.prop && node.asset?.manifest && node.asset?.field) {
    out.asset = {
      prop: String(node.asset.prop),
      manifest: String(node.asset.manifest),
      field: String(node.asset.field),
      element: node.asset.element ?? "img",
      ...(node.asset.altField ? { altField: String(node.asset.altField) } : {}),
    };
  }
  if (node.slot) {
    const s = { name: node.slot.name ?? "slot" };
    if (Array.isArray(node.slot.accepts) && node.slot.accepts.length) s.accepts = node.slot.accepts.map(String);
    if (["prefer", "restrict", "open"].includes(node.slot.acceptsMode)) s.acceptsMode = node.slot.acceptsMode;
    if (Number.isInteger(node.slot.min)) s.min = node.slot.min;
    if (Number.isInteger(node.slot.max) && node.slot.max >= 1) s.max = node.slot.max;
    if (typeof node.slot.required === "boolean") s.required = node.slot.required;
    // The design's default filling, in the upstream shape: defaultContent is a
    // list of { id, props }. Resolved, the id names the manifest entry
    // (s2a-icons:arrow-right); unresolved, it names the design's instance so a
    // consumer can see what is still a decision.
    if (node.slot.default && typeof node.slot.default === "object") {
      const d = node.slot.default;
      const props = {};
      if (d.figma) props.figma = String(d.figma);
      if (d.size !== undefined) props.size = String(d.size);
      for (const [k, v] of Object.entries(d.props ?? {})) props[k] = typeof v === "boolean" ? v : String(v);
      const id = d.manifest && d.icon ? `${d.manifest}:${d.icon}` : d.slug ? d.slug : d.figma ? `figma:${d.figma}` : d.text !== undefined ? "text" : null;
      if (id) s.defaultContent = [{ id, ...(Object.keys(props).length ? { props } : {}), ...(d.text !== undefined ? { text: String(d.text) } : {}) }];
    }
    // The filling the design switches by a prop value (S2A extension).
    if (Array.isArray(node.slot.defaultByProp)) {
      const content = (d) => {
        const props = {};
        if (d.figma) props.figma = String(d.figma);
        for (const [k, v] of Object.entries(d.props ?? {})) props[k] = typeof v === "boolean" ? v : String(v);
        const id = d.manifest && d.icon ? `${d.manifest}:${d.icon}` : d.slug ? d.slug : d.figma ? `figma:${d.figma}` : "text";
        return [{ id, ...(Object.keys(props).length ? { props } : {}), ...(d.text !== undefined ? { text: String(d.text) } : {}), ...(d.content ? { children: content(d.content) } : {}) }];
      };
      const cc = [];
      for (const e of node.slot.defaultByProp) for (const [value, d] of Object.entries(e.map ?? {})) cc.push({ prop: String(e.prop), value: String(value), content: content(d) });
      if (cc.length) s.conditionalContent = cc;
    }
    out.slot = s;
  }
  if (node.states && typeof node.states === "object" && !Array.isArray(node.states)) {
    const states = {};
    for (const [name, decls] of Object.entries(node.states)) {
      const key = STATE_ALIAS[name] ?? name;
      if (!STATES.has(key)) continue;
      const { tokens: st } = splitTokens(decls);
      if (Object.keys(st).length) states[key] = st;
    }
    if (Object.keys(states).length) out.states = states;
  }
  // The conditional shapes. Upstream already has a vocabulary for all of this
  // — tokensByProp, statesByProp, tokensByCombination — so emitting is close to
  // a pass-through: split each map into tokens and literals the same way the
  // base map is split, and normalise our state names onto their four.
  const splitMap = (m) => {
    const tokens = {}, literals = {};
    for (const [value, decls] of Object.entries(m ?? {})) {
      const { tokens: t, literals: l } = splitTokens(decls);
      if (Object.keys(t).length) tokens[value] = t;
      if (Object.keys(l).length) literals[value] = l;
    }
    return { tokens, literals };
  };
  if (Array.isArray(node.tokensByProp) && node.tokensByProp.length) {
    const byProp = [], litByProp = [];
    for (const e of node.tokensByProp) {
      const { tokens: t, literals: l } = splitMap(e.map);
      if (Object.keys(t).length) byProp.push({ prop: String(e.prop), map: t });
      if (Object.keys(l).length) litByProp.push({ prop: String(e.prop), map: l });
    }
    if (byProp.length) out.tokensByProp = byProp;
    if (litByProp.length) out.literalsByProp = litByProp;
  }
  if (Array.isArray(node.statesByProp) && node.statesByProp.length) {
    const rows = [];
    for (const e of node.statesByProp) {
      const key = STATE_ALIAS[e.state] ?? e.state;
      if (!STATES.has(key)) continue;
      const { tokens: t } = splitMap(e.map);
      if (Object.keys(t).length) rows.push({ prop: String(e.prop), state: key, map: t });
    }
    if (rows.length) out.statesByProp = rows;
  }
  if (Array.isArray(node.tokensByCombination) && node.tokensByCombination.length) {
    const combos = [];
    for (const e of node.tokensByCombination) {
      if (!Array.isArray(e.props) || e.props.length !== 2) continue;
      const rows = [];
      for (const r of e.rows ?? []) {
        const { tokens: t } = splitTokens(r.tokens);
        if (Object.keys(t).length) rows.push({ values: r.values.map((v) => (v == null ? null : String(v))), tokens: t });
      }
      if (rows.length) combos.push({ props: e.props.map(String), rows });
    }
    if (combos.length) out.tokensByCombination = combos;
  }
  if (node.parts && Object.keys(node.parts).length) {
    out.parts = Object.fromEntries(Object.entries(node.parts).map(([n, c]) => [n, mapNode(c)]));
  }
  return out;
};

// Our states are objects describing a design axis; upstream's are four runtime
// names. Read the names out of ours and keep only the ones that are real states.
const mapStates = (irStates = []) => {
  const found = new Set();
  for (const s of irStates) {
    const haystack = [s.name, s.figma?.property, s.figma?.notes, ...(Array.isArray(s.options) ? s.options : [])].filter(Boolean).join(" ").toLowerCase();
    for (const token of haystack.split(/[^a-z-]+/)) {
      const key = STATE_ALIAS[token] ?? token;
      if (STATES.has(key)) found.add(key);
    }
  }
  return [...found];
};

export function contractJson(ir, { id }) {
  const defsStatus = ir.component.status;
  const deprecated = Boolean(ir.anchors.figma?.deprecated);
  const contract = {
    $schema: "../../../spec-dictionary/southleft/contract.schema.json",
    id,
    name: ir.component.name,
    version: SEMVER.test(ir.component.version ?? "") ? ir.component.version : "0.1.0",
    status: statusOf(defsStatus, deprecated),
    description: ir.component.description ?? ir.component.name,
  };
  if (ARCHETYPES.has(ir.component.archetype)) contract.archetype = ir.component.archetype;

  const element = ir.anatomy.root?.element;
  contract.semantics = { element: ELEMENTS.has(element) ? element : "div" };
  // A tag that depends on a prop is not a footnote — a consumer generating from
  // this has to know that href turns a button into an anchor, or it emits the
  // wrong element and the wrong keyboard behaviour with it.
  const byProp = ir.anatomy.root?.elementByProp;
  if (byProp?.prop && byProp.map && Object.values(byProp.map).every((v) => ELEMENTS.has(v))) {
    contract.semantics.elementByProp = { prop: byProp.prop, map: byProp.map };
  }
  const role = ir.a11y?.role;
  if (typeof role === "string" && /^[a-z][a-z-]*$/.test(role)) contract.semantics.role = role;

  contract.props = (ir.props ?? []).map((p) => {
    const out = { name: p.name, type: mapType(p) };
    if (p.description) out.description = String(p.description);
    if (p.defaultSource !== null && p.defaultSource !== undefined) out.default = p.defaultSource;
    out.bindings = mapPropBindings(p);
    return out;
  });

  const states = mapStates(ir.states);
  if (states.length) contract.states = states;

  contract.anatomy = { root: mapNode(ir.anatomy.root) };

  // Their three fields are assertions a checker can verify; ours are the
  // documentation. a11y is not additionalProperties:false, so both ride along.
  const a11y = { contrast: "AA" };
  if (ir.a11y?.focusVisible !== undefined) a11y.focusVisible = ir.a11y.focusVisible;
  if (typeof ir.a11y?.minHitArea === "number") a11y.minHitArea = ir.a11y.minHitArea;
  for (const k of ["role", "wcag", "keyboard", "requiredAriaAttrs", "notes"]) if (ir.a11y?.[k] !== undefined) a11y[k] = ir.a11y[k];
  contract.a11y = a11y;

  const fa = ir.anchors.figma ?? {};
  const ca = ir.anchors.code ?? {};
  contract.bindings = {
    figma: { anchors: { fileKey: fa.fileKey || null, componentSetKey: fa.componentSetKey || null, ...(fa.nodeId ? { nodeId: fa.nodeId } : {}) } },
    code: { anchors: { importPath: ca.importPath ?? "UNSET", export: ca.export ?? ir.component.name } },
  };

  const rev = ir.provenance?.defs;
  if (SHA.test(rev ?? "")) {
    contract.provenance = {
      version: 1,
      canonicalRevision: rev,
      source: { kind: ir.provenance.codeEvidence ? "code" : "design", adapter: `${ir.generator.name}@${ir.generator.version}`, revision: ir.provenance.codeEvidence && SHA.test(ir.provenance.codeEvidence) ? ir.provenance.codeEvidence : rev },
    };
  }
  return contract;
}
