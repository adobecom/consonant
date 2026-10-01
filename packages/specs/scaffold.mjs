#!/usr/bin/env node
// scaffold.mjs — extracted Figma evidence → <slug>.defs.json draft, through the
// spec dictionary. This is the repeatable step between "the plugin published
// evidence for a set we have no contract for" and "npm run specs:build turns
// the contract into spec.json, figma.plan.json (Build set) and the docs".
//
//   npm run specs:scaffold -- --slug=action-card [--archetype=link-card] [--name=ActionCard] [--force]
//
// The draft is honest about what it does not know: every derived choice is an
// open decision for the reviewer, code anchors are marked pending until the
// component exists, and nothing here is invented beyond the dictionary.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, unlinkSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, "..", "..");
const SRC = join(ROOT, "packages", "components", "src");
const EVIDENCE_DIR = join(ROOT, "packages", "components", "evidence");
export const DICTIONARY = JSON.parse(readFileSync(join(__dirname, "dictionary.json"), "utf8"));
const { rolesFromNames, matchCandidate, loadContracts } = require(join(ROOT, "apps", "s2a-toolkit", "server", "contract-match.cjs"));

const kebab = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
const pascal = (s) => kebab(s).split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
const abbr = (slug) => slug.split("-").map((w) => w[0]).join("");
const GENERIC = /^(Frame|Group|Rectangle|Ellipse|Line|Vector|Polygon|Star|Text|Slice|Image|Boolean|Union|Subtract|Intersect|Exclude) ?\d*$|^(Frame|Group|Rectangle|Ellipse|Line|Vector) \d+$/;
const alnumName = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const fill = (t, vars) => t.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

// Walk the evidence anatomy and claim one layer per role. Names decide first
// (the same patterns the matcher uses); layer type decides for the unnamed:
// a group of shapes is art, a stray text layer is a question, a line is a rule.
export function assignRoles(tree) {
  const claimed = new Map(); // role → { path, node }
  const extra = { text: [], art: [] };
  const visit = (node, path, insideMedia) => {
    const p = `${path}/${node.name}`;
    const named = [...rolesFromNames([node.name])];
    // Nothing inside art or a claimed layer is claimable, by name or by type.
    let role = insideMedia ? null : named.find((r) => !claimed.has(r) && r !== "text");
    if (!role && !insideMedia) {
      const shapes = ["RECTANGLE", "ELLIPSE", "VECTOR", "BOOLEAN_OPERATION"];
      const kids = node.children ?? [];
      // A Figma-generated GROUP is art in practice (designers group illustration
      // pieces; they name frames). A FRAME counts as art only when it holds shapes.
      const artGroup = node.type === "GROUP" && GENERIC.test(node.name);
      const artFrame = node.type === "FRAME" && kids.length > 0 && kids.some((c) => shapes.includes(c.type)) && !kids.some((c) => c.type === "TEXT" && !GENERIC.test(c.name));
      if (node.type === "LINE") role = claimed.has("divider") ? null : "divider";
      else if (node.type === "TEXT") role = null;
      else if (artGroup || artFrame || shapes.includes(node.type)) role = claimed.has("media") ? null : "media";
    }
    let art = false;
    if (role) claimed.set(role, { path: p, node });
    else if (node.type === "TEXT" && !insideMedia && !named.length) extra.text.push(p);
    else if (!insideMedia && ["GROUP", "RECTANGLE", "ELLIPSE", "VECTOR"].includes(node.type) && claimed.has("media") && claimed.get("media").path !== p) { extra.art.push(p); art = true; }
    // A claimed layer owns its subtree (a chevron's vector is not media; an
    // icon inside the illustration is art), and so does extra art.
    const stop = insideMedia || Boolean(role) || art;
    for (const c of node.children ?? []) visit(c, p, stop);
  };
  for (const c of tree.children ?? []) visit(c, "", false);
  return { claimed, extra };
}



// When the component already has code, its stylesheet is the authority on what
// the parts are called. Guessing a convention there produces selectors that
// match nothing — and the draft looks wrong for a reason that is purely
// cosmetic, which buries the disagreements that actually matter.
function classesFromCss(slug) {
  const file = join(SRC, slug, `${slug}.css`);
  if (!existsSync(file)) return null;
  const css = readFileSync(file, "utf8");
  return [...new Set((css.match(/\.[a-z][a-z0-9_-]*/gi) ?? []).map((c) => c.slice(1)))];
}

// A part matches a class when the class's trailing segment IS the part name.
// Failing that, the nearest prefix wins: the design's "icon-start" and
// "icon-end" both land on ".c-button__icon", because the code models one icon
// where the design models two. That is a real disagreement, so the selector
// resolves AND the draft raises it — emitting ".b-icon-start", which matches
// nothing anywhere, would only have added a second, fake problem on top.
function selectorForPart(classes, part) {
  if (!classes) return { selector: null, exact: false };
  const tail = (c) => (c.includes("__") ? c.split("__").pop() : c.replace(/^c-/, ""));
  const exact = classes.find((c) => tail(c) === part);
  if (exact) return { selector: `.${exact}`, exact: true };
  const prefixed = classes
    .filter((c) => tail(c) && part.startsWith(tail(c)))
    .sort((a, b) => tail(b).length - tail(a).length)[0];
  return prefixed ? { selector: `.${prefixed}`, exact: false } : { selector: null, exact: false };
}

// ── Component-set properties → contract ──────────────────────────────────────
// A COMPONENT_SET already declares its own API. Deriving levers from layer roles
// there is how a Button ends up with an "eyebrow" and a "mediaSrc": the role
// walker is for FRAME candidates, which have no declared properties at all.
//
// So when the evidence is a set, the properties ARE the contract, and the work
// is classification. Four rules, each of which a human can disagree with — they
// are recorded as decisions rather than applied silently.

const STATE_AXIS = /^(state|interaction|pseudo)s?$/i;
// Figma's vocabulary for the four runtime states the contract schema admits.
const STATE_VALUE = {
  hover: "hover", hovered: "hover",
  active: "active", pressed: "active",
  focus: "focus-visible", focused: "focus-visible", "focus-visible": "focus-visible",
  disabled: "disabled",
};
// "Show Icon Start" is a Figma authoring affordance, not an API. In code the
// slot either has content or it does not; nobody passes showIconStart.
const HELPER_BOOLEAN = /^(show|hide|has|with|include|enable)\s+/i;

const stripId = (name) => String(name).split("#")[0].trim();
const camel = (name) => kebab(stripId(name)).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

export function fromComponentSet(evidence) {
  const axes = evidence.axes ?? [];
  const props = [];
  const states = [];
  const notes = [];
  const slots = [];
  // Which axes became states — a code prop of the same name is a real conflict.
  const stateAxes = [];

  const swapTargets = new Map();
  for (const a of axes) if (a.type === "INSTANCE_SWAP") swapTargets.set(alnumName(stripId(a.name)), stripId(a.name));

  for (const a of axes) {
    const label = stripId(a.name);
    const name = camel(a.name);

    if (a.type === "VARIANT" && STATE_AXIS.test(label)) {
      // A State axis is runtime behaviour, never an authored prop.
      const mapped = [], unmapped = [];
      for (const opt of a.options ?? []) {
        const key = String(opt).toLowerCase();
        if (key === "default" || key === "rest" || key === "none") continue; // the absence of a state
        (STATE_VALUE[key] ? mapped : unmapped).push(STATE_VALUE[key] ?? opt);
      }
      const MECHANISM = { hover: ":hover", active: ":active", "focus-visible": ":focus-visible", disabled: "[disabled] / :disabled" };
      for (const m of [...new Set(mapped)]) {
        states.push({ name: m, figma: { kind: "VARIANT", property: a.name, notes: `${label}=${m}` },
          code: { mechanism: MECHANISM[m] ?? "tbd" }, notes: "Runtime state, never an authored prop." });
      }
      stateAxes.push(label);
      notes.push(`"${label}" read as runtime states (${mapped.join(", ") || "none"}${unmapped.length ? `; unmapped: ${unmapped.join(", ")}` : ""}), not as a prop`);
      if (unmapped.length) notes.push(`${unmapped.join(", ")} has no counterpart in the schema's four states — confirm it is not really a style`);
      continue;
    }

    if (a.type === "VARIANT") {
      props.push({ name, lever: true, type: "string", enum: a.options ?? [], ...(a.defaultValue !== undefined ? { default: a.defaultValue } : {}),
        figma: { kind: "VARIANT", property: a.name }, code: { prop: name, attr: `data-${kebab(label)}` } });
      continue;
    }

    if (a.type === "TEXT") {
      props.push({ name, lever: true, type: "string", ...(a.defaultValue !== undefined ? { default: a.defaultValue } : {}),
        figma: { kind: "TEXT", property: a.name }, code: { prop: name } });
      continue;
    }

    if (a.type === "INSTANCE_SWAP") {
      // A swap is a slot with a default. Both facts matter: the slot is what a
      // consumer fills, the prop is how they name what goes in it.
      props.push({ name, lever: true, type: "string", figma: { kind: "INSTANCE_SWAP", property: a.name }, code: { prop: name } });
      slots.push({ part: kebab(label), name: label });
      continue;
    }

    if (a.type === "BOOLEAN") {
      const helperOf = HELPER_BOOLEAN.test(label) ? label.replace(HELPER_BOOLEAN, "").trim() : null;
      const pairedSwap = helperOf ? swapTargets.get(alnumName(helperOf)) : null;
      if (pairedSwap) {
        // Paired with a real swap: a visibility toggle for it. Keep it on the
        // contract so Build set can drive it, but it is not a code lever.
        props.push({ name, lever: false, type: "boolean", ...(a.defaultValue !== undefined ? { default: a.defaultValue } : {}),
          figma: { kind: "BOOLEAN", property: a.name },
          code: { prop: name },
          notes: `Figma authoring toggle for the "${pairedSwap}" swap. In code the slot either has content or it does not — this is not a prop a consumer passes.` });
        notes.push(`"${label}" treated as a Figma visibility helper for "${pairedSwap}", not a code lever`);
        continue;
      }
      const asState = STATE_VALUE[String(name).toLowerCase()];
      if (asState) {
        // disabled is both: a prop a consumer sets and a state CSS reacts to.
        props.push({ name, lever: true, type: "boolean", ...(a.defaultValue !== undefined ? { default: a.defaultValue } : {}),
          figma: { kind: "BOOLEAN", property: a.name }, code: { prop: name } });
        if (!states.some((st) => st.name === asState)) {
          states.push({ name: asState, figma: { kind: "BOOLEAN", property: a.name, notes: `${label} toggles it` },
            code: { mechanism: asState === "disabled" ? "[disabled] / :disabled" : `:${asState}` },
            notes: "Declared as a prop and reacted to as a state." });
        }
        notes.push(`"${label}" is both a prop and the "${asState}" state — confirm the code sets an attribute CSS can select`);
        continue;
      }
      props.push({ name, lever: true, type: "boolean", ...(a.defaultValue !== undefined ? { default: a.defaultValue } : {}),
        figma: { kind: "BOOLEAN", property: a.name }, code: { prop: name } });
      continue;
    }
  }
  return { props, states, slots, notes, stateAxes };
}

export function pickArchetype(evidence, roles, forced) {
  if (forced) return { archetype: forced, why: "chosen with --archetype" };
  if (evidence.pattern?.repeats?.length) return { archetype: "collection", why: "the frame repeats one unit" };
  if (roles.has("heading") && roles.has("cta")) return { archetype: "link-card", why: "roles include heading and cta with no repeated unit" };
  if (roles.has("heading")) return { archetype: "card", why: "roles include heading; no cta role" };
  return { archetype: "card", why: "default when no stronger signal is present" };
}

export function scaffoldDefs(evidence, { slug, name, archetype: forced, dictionary = DICTIONARY, contracts = null, code = null, today = new Date().toISOString().slice(0, 10) } = {}) {
  // A set's layer name carries decoration the contract must not inherit: a
  // version suffix, a status emoji, a parenthetical. "Button — v2" is the
  // Button contract — keeping the suffix renames the component to ButtonV2 and
  // silently breaks every slot that accepts "Button".
  const undecorate = (n) => String(n || "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s*[—–-]\s*v\d+(\.\d+)*\s*$/i, "")
    .replace(/\(.*?\)/g, "")
    .trim();
  const setName = name ?? undecorate(evidence.set?.name) ?? pascal(slug);
  slug = slug ?? kebab(setName);
  const component = pascal(setName);
  const ab = abbr(slug);
  const { claimed, extra } = assignRoles(evidence.anatomy?.tree ?? { children: [] });
  const roles = new Set(claimed.keys());
  const { archetype, why } = pickArchetype(evidence, roles, forced);
  const arch = dictionary.archetypes[archetype];
  if (!arch) throw new Error(`unknown archetype ${archetype}; dictionary has ${Object.keys(dictionary.archetypes).join(", ")}`);
  const isSet = evidence.set?.type === "COMPONENT_SET";
  const decisions = [];
  // A decision is a draft note: what the scaffold chose, what else it could have
  // been, how far to trust it, and the one-line edit that corrects it. Templates
  // carry the default confidence and fix; a call site overrides either when it
  // knows better (a forced archetype is read, not guessed).
  const D = (id, key, vars, extraFields = {}) => {
    const raw = dictionary.decisions[key];
    const tpl = typeof raw === "string" ? { question: raw } : (raw ?? {});
    decisions.push({
      id: `${ab}-${id}`,
      question: fill(tpl.question ?? "", vars),
      ...(tpl.chose ? { chose: fill(tpl.chose, vars) } : {}),
      ...(tpl.confidence ? { confidence: tpl.confidence } : {}),
      ...(tpl.fix ? { fix: fill(tpl.fix, vars) } : {}),
      status: "open",
      owner: "Matt",
      ...extraFields,
    });
  };

  // Props: archetype props, then one lever per claimed role (dictionary order),
  // then the set's own axes when it is a real component set.
  // A COMPONENT_SET declares its own API, so classify THAT. Role-walking is for
  // FRAME candidates, which have no declared properties — running it over a real
  // set is how a Button acquires an "eyebrow" and a "mediaSrc".
  const setDerived = isSet && (evidence.axes ?? []).length ? fromComponentSet(evidence) : null;
  const unmatchedParts = [];
  const props = setDerived ? [...setDerived.props] : [...arch.props.map((p) => ({ ...p }))];
  const stateAxis = /^(state|breakpoint|context|orientation)$/i;
  const parts = {};
  const ordered = setDerived ? [] : [...claimed.entries()].map(([role, hit]) => ({ role, hit, def: dictionary.roles[role] })).filter((x) => x.def && !x.def.decisionOnly).sort((a, b) => (a.def.order ?? 99) - (b.def.order ?? 99));
  if (setDerived) {
    // Parts come from the set's real top-level layers, named as they are named.
    const slotByPart = new Map(setDerived.slots.map((sl) => [sl.part, sl]));
    const cssClasses = classesFromCss(slug);
    for (const child of evidence.anatomy?.tree?.children ?? []) {
      if (GENERIC.test(child.name)) continue;
      const part = kebab(child.name);
      if (!part || parts[part]) continue;
      const { selector: real, exact } = selectorForPart(cssClasses, part);
      if (cssClasses && !exact) unmatchedParts.push({ part, fellBackTo: real });
      parts[part] = { selector: real ?? `.${ab}-${part}`, figma: `/${child.name}` };
      const sl = slotByPart.get(part);
      if (sl) parts[part].slot = { name: sl.name, accepts: [], acceptsMode: "prefer",
        notes: `Instance-swap property "${sl.name}" — list what it accepts once those contracts exist.` };
    }
  }
  for (const { role, hit, def } of ordered) {
    const part = { selector: `.${ab}-${def.part}`, figma: hit.path };
    if (def.element) part.element = def.element;
    if (def.tokens) part.tokens = { ...def.tokens };
    if (def.slot) part.slot = { ...def.slot, notes: `Figma: ${hit.node.type} "${hit.node.name}"${hit.node.type === "INSTANCE" ? "" : " is raw layers today; place a library instance here so the swap is a property"}` };
    if (def.notes) part.notes = def.notes;
    if (def.parts) part.parts = Object.fromEntries(Object.entries(def.parts).map(([n, c]) => [n, { selector: `.${ab}-${def.part}__${n}`, ...c }]));
    parts[def.part] = part;
    if (def.lever) {
      const axis = (evidence.axes ?? []).find((a) => a.type !== "VARIANT" && kebab(a.name.replace(/#.*$/, "")) === kebab(def.lever.name));
      // A slot's lever points at the instance layer (INSTANCE → an instance-swap
      // property in the plan); a text lever points at the text layer (LAYER →
      // a derived TEXT property).
      const layerKind = def.slot ? "INSTANCE" : "LAYER";
      props.push({ name: def.lever.name, lever: true, type: def.lever.type, figma: axis ? { kind: axis.type, property: axis.name } : { kind: layerKind, property: hit.path, notes: `no component property in Figma yet; layer ${hit.path} (${hit.node.type})` }, code: { prop: def.lever.name }, ...(def.lever.notes ? { notes: def.lever.notes } : {}) });
    }
  }
  // Dual evidence: the design says what is authorable, the code says what the
  // component accepts. A prop in one and not the other is not an error — it is
  // the interesting part. href and onClick have no design counterpart and never
  // will; a design axis with no code prop means the component has not caught up.
  const codeOnly = [];
  if (setDerived && code) {
    const known = new Set(props.map((p) => alnumName(p.name)));
    for (const cp of code.component?.props ?? code.props ?? []) {
      if (known.has(alnumName(cp.name))) continue;
      codeOnly.push(cp.name);
      props.push({ name: cp.name, lever: true, type: cp.type === "function" ? "function" : (cp.type ?? "string"),
        figma: "NONE", code: { prop: cp.name },
        notes: "Exists in the component, has no design counterpart." });
    }
  }
  const states = setDerived ? [...setDerived.states] : [...arch.states.map((s) => ({ ...s }))];
  for (const a of setDerived ? [] : evidence.axes ?? []) {
    if (a.type === "VARIANT") {
      if (stateAxis.test(a.name)) { if (!states.some((s) => s.figma.property === a.name)) states.push({ name: a.name, figma: { kind: "VARIANT", property: a.name, notes: (a.options ?? []).join(" | ") }, code: { mechanism: "tbd" }, notes: "Design axis read as a runtime state; confirm." }); }
      else props.push({ name: kebab(a.name).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), lever: true, type: "string", enum: a.options ?? [], default: a.defaultValue, figma: { kind: "VARIANT", property: a.name }, code: { prop: kebab(a.name).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), attr: `data-${kebab(a.name)}` } });
    } else if (a.type === "BOOLEAN" && !props.some((p) => p.figma?.property === a.name)) {
      const prop = kebab(a.name.replace(/#.*$/, "")).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      props.push({ name: prop, lever: true, type: "boolean", default: a.defaultValue, figma: { kind: "BOOLEAN", property: a.name }, code: { prop } });
    }
  }

  // Decisions: everything derived rather than read.
  D("archetype", "archetype", { archetype, why, slug }, {
    alternatives: Object.keys(dictionary.archetypes).filter((a) => a !== archetype).map((a) => `${a}: ${dictionary.archetypes[a].description ?? a}`),
    // --archetype is a human reading the frame, not the scaffold guessing.
    ...(forced ? { confidence: "high", chose: `archetype ${archetype}, chosen with --archetype` } : {}),
    evidence: `roles ${[...roles].join(", ") || "none"}; pattern ${evidence.pattern ? `${evidence.pattern.kind}, ${evidence.pattern.repeats?.length ?? 0} repeats` : "n/a"}`,
  });
  if (codeOnly.length) {
    // The sharp one: the design turned a "State" axis into runtime states while
    // the component still exposes `state` as a prop. Both cannot be the truth.
    const stateAxes = setDerived.stateAxes ?? [];
    const clash = codeOnly.filter((n) => stateAxes.some((ax) => alnumName(ax) === alnumName(n)) || states.some((st) => alnumName(st.name) === alnumName(n)));
    decisions.push({ id: `${ab}-code-only-props`,
      question: `${codeOnly.join(", ")} exist in the component but have no design counterpart. Confirm each is authored (lever true) or integration-only (lever false).${clash.length ? ` "${clash.join(", ")}" collides with the ${stateAxes.join("/")} axis, which this draft read as runtime states — decide whether the code prop or the state axis is the truth.` : ""}`,
      chose: `added ${codeOnly.length} code-only prop${codeOnly.length === 1 ? "" : "s"} as levers with no design binding`,
      confidence: clash.length ? "low" : "medium",
      fix: "Set lever:false on the integration-only ones, or delete any the component should stop accepting.",
      status: "open", owner: "Matt", evidence: `${slug}.code.evidence.json` });
  }
  if (unmatchedParts.length) {
    const names = unmatchedParts.map((u) => u.part);
    const shared = [...new Set(unmatchedParts.map((u) => u.fellBackTo).filter(Boolean))];
    decisions.push({ id: `${ab}-part-selectors`,
      question: `${names.join(", ")} ${names.length === 1 ? "has" : "have"} no class of ${names.length === 1 ? "its" : "their"} own in ${slug}.css${shared.length ? ` — ${names.length > 1 ? "they all share" : "it falls back to"} ${shared.join(", ")}` : ""}. The design names ${names.length === 1 ? "this part" : "these parts"} separately and the code does not. Split the class, or model them as one part.`,
      chose: shared.length ? `pointed ${names.join(" and ")} at ${shared.join(", ")}` : `kept a derived selector that matches nothing`,
      confidence: "low", fix: `Set anatomy.root.parts.<part>.selector to the real class, or add the class to ${slug}.css.`,
      status: "open", owner: "Matt", evidence: `packages/components/src/${slug}/${slug}.css` });
  }
  if (setDerived) {
    for (const [i, note] of setDerived.notes.entries()) {
      decisions.push({ id: `${ab}-classify-${i + 1}`, question: `${note}. Confirm, or change it in props/states.`,
        chose: note, confidence: "medium", fix: "Edit props[] or states[] in this file.",
        status: "open", owner: "Matt", evidence: `${slug}.figma.evidence.json axes` });
    }
  }
  if (ordered.length) D("levers", "levers", { roles: ordered.map((o) => `${o.role} → ${o.def.lever?.name ?? o.def.part}`).join(", ") }, { evidence: ordered.map((o) => `${o.role}: ${o.hit.path}`).join("; ") });
  const unbound = evidence.unboundPaint ?? [];
  if (unbound.length) D("unbound-paint", "unboundPaint", { count: unbound.length, list: unbound.slice(0, 6).map((u) => `${u.node || "/"} ${u.properties.join("+")}`).join(", ") + (unbound.length > 6 ? ", …" : "") }, { evidence: `${slug}.figma.evidence.json unboundPaint` });
  const generic = [];
  const walkNames = (n, p) => { const q = `${p}/${n.name}`; if (GENERIC.test(n.name)) generic.push(q); for (const c of n.children ?? []) walkNames(c, q); };
  for (const c of evidence.anatomy?.tree?.children ?? []) walkNames(c, "");
  if (generic.length) D("layer-names", "genericLayers", { count: generic.length, list: generic.slice(0, 5).join(", ") + (generic.length > 5 ? ", …" : "") }, { evidence: `${slug}.figma.evidence.json anatomy` });
  if (extra.text.length) {
    const t = dictionary.decisions.strayText ?? {};
    decisions.push({ id: `${ab}-stray-text`, question: `${dictionary.roles.text.question} Layers: ${extra.text.join(", ")}.`, chose: `left ${extra.text.length} text layer${extra.text.length === 1 ? "" : "s"} out of the anatomy`, ...(t.confidence ? { confidence: t.confidence } : {}), ...(t.fix ? { fix: t.fix } : {}), status: "open", owner: "Matt", evidence: `${slug}.figma.evidence.json anatomy` });
  }
  if (extra.art.length) {
    const t = dictionary.decisions.extraArt ?? {};
    decisions.push({ id: `${ab}-extra-art`, question: `Additional shape layers outside the media group (${extra.art.slice(0, 4).join(", ")}${extra.art.length > 4 ? ", …" : ""}). Fold them into the Media instance or name them as parts.`, chose: `treated ${extra.art.length} shape layer${extra.art.length === 1 ? "" : "s"} as art, not as parts`, ...(t.confidence ? { confidence: t.confidence } : {}), ...(t.fix ? { fix: t.fix } : {}), status: "open", owner: "Matt", evidence: `${slug}.figma.evidence.json anatomy` });
  }
  if (contracts) {
    try {
      // Never match a contract against itself (re-scaffolding an existing slug).
      const others = Array.isArray(contracts) ? contracts.filter((c) => c.slug !== slug && alnumName(c.name) !== alnumName(component)) : contracts;
      const m = matchCandidate(evidence, others);
      const best = m?.unit?.[0];
      if (best && m.verdict && m.verdict !== "new") D("match", "match", { verdict: m.verdict, name: best.name, score: best.score }, { evidence: m.summary });
    } catch { /* matcher is advisory */ }
  }
  const importPath = `packages/components/src/${slug}/${slug}.js`;
  D("code-pending", "codePending", { importPath, slug });

  // Triage order: least trustworthy first, so a reviewer reads the guesses before
  // the readings. Stable within a band, so related notes stay together.
  const band = { low: 0, medium: 1, high: 2 };
  decisions.forEach((d, i) => { d._i = i; });
  decisions.sort((a, b) => (band[a.confidence] ?? 1) - (band[b.confidence] ?? 1) || a._i - b._i);
  for (const d of decisions) delete d._i;

  const defs = {
    $schema: "s2a-defs/1",
    component,
    slug,
    status: "curated-draft",
    curated: { by: `specs:scaffold from ${slug}.figma.evidence.json${evidence.provenance?.hash ? ` (${evidence.provenance.hash.slice(0, 15)}…)` : ""} through packages/specs/dictionary.json (${archetype})`, date: today, reviewer: "Matt" },
    description: arch.description,
    anchors: {
      figma: {
        fileKey: evidence.file?.key ?? "",
        kind: isSet ? "component-set" : "pattern-frame",
        nodeId: evidence.set?.id ?? "",
        nodeName: evidence.set?.name ?? setName,
        componentSetKey: isSet ? evidence.set?.key || null : null,
        deprecated: false,
        successorNodeId: null,
        usages: [],
        notes: `${isSet ? "Component set" : "Frame"} on page "${evidence.file?.page?.name?.trim() ?? "?"}"; ${evidence.counts?.nodes ?? "?"} nodes, ${evidence.counts?.bindings ?? 0} token bindings. ${isSet ? "" : "Build set from this contract produces the normalized component set; re-anchor to it once published."}`.trim(),
      },
      code: { importPath, export: component, cssClass: `c-${slug}`, pending: true },
    },
    props,
    states,
    anatomy: { root: { selector: `.c-${slug}`, figma: ".root", element: arch.root.element, tokens: { ...arch.root.tokens }, ...(arch.root.notes ? { notes: arch.root.notes } : {}), parts } },
    forbiddenCombinations: [],
    a11y: arch.a11y,
    decisions,
  };
  return defs;
}

function main() {
  const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
  const slug = arg("slug");
  if (!slug) { console.error("usage: npm run specs:scaffold -- --slug=<slug> [--evidence=path] [--archetype=link-card|card|collection] [--name=Name] [--force]"); process.exit(2); }
  const inSrc = join(SRC, slug, `${slug}.figma.evidence.json`);
  const inInbox = join(EVIDENCE_DIR, `${slug}.figma.evidence.json`);
  const evidencePath = arg("evidence") ? resolve(arg("evidence")) : existsSync(inSrc) ? inSrc : inInbox;
  if (!existsSync(evidencePath)) { console.error(`no evidence for ${slug}: expected ${inSrc} or ${inInbox} (publish it from the toolkit's Extract contract first)`); process.exit(2); }
  const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
  const dir = join(SRC, slug);
  const out = join(dir, `${slug}.defs.json`);
  if (existsSync(out) && !process.argv.includes("--force")) { console.error(`${out} exists; pass --force to overwrite the draft`); process.exit(1); }
  const contracts = (() => { try { return loadContracts(ROOT); } catch { return null; } })();
  const defs = scaffoldDefs(evidence, { slug, name: arg("name"), archetype: arg("archetype"), contracts });
  mkdirSync(dir, { recursive: true });
  writeFileSync(out, JSON.stringify(defs, null, 2) + "\n");
  if (evidencePath !== inSrc) { copyFileSync(evidencePath, inSrc); if (evidencePath === inInbox) unlinkSync(inInbox); }
  const byConf = (c) => defs.decisions.filter((d) => d.confidence === c).length;
  const low = byConf("low"), med = byConf("medium"), high = byConf("high");
  console.log(`SCAFFOLD  ${slug.padEnd(24)} ${defs.component} as ${defs.curated.by.match(/\((\S+)\)$/)?.[1]} · ${defs.props.length} props (${defs.props.filter((p) => p.lever).length} levers) · ${Object.keys(defs.anatomy.root.parts).length} parts`);
  console.log(`          wrote ${out.replace(ROOT + "/", "")}${evidencePath !== inSrc ? ` · moved evidence beside it` : ""}`);
  console.log(`          ${defs.decisions.length} draft notes: ${low} low · ${med} medium · ${high} high confidence`);
  // The guesses are the review. Print them so the terminal is a usable triage
  // surface even before the PR body renders the same list.
  for (const d of defs.decisions.filter((x) => x.confidence === "low")) {
    console.log(`          ↳ low  ${d.id}${d.chose ? ` — chose ${d.chose}` : ""}`);
    if (d.fix) console.log(`                 fix: ${d.fix}`);
  }
  console.log(`          next: npm run defs:validate && npm run specs:build && npm run gate, then review the ${low ? "low-confidence " : ""}draft notes`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
