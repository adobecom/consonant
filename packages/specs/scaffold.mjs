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

export function pickArchetype(evidence, roles, forced) {
  if (forced) return { archetype: forced, why: "chosen with --archetype" };
  if (evidence.pattern?.repeats?.length) return { archetype: "collection", why: "the frame repeats one unit" };
  if (roles.has("heading") && roles.has("cta")) return { archetype: "link-card", why: "roles include heading and cta with no repeated unit" };
  if (roles.has("heading")) return { archetype: "card", why: "roles include heading; no cta role" };
  return { archetype: "card", why: "default when no stronger signal is present" };
}

export function scaffoldDefs(evidence, { slug, name, archetype: forced, dictionary = DICTIONARY, contracts = null, today = new Date().toISOString().slice(0, 10) } = {}) {
  const setName = name ?? evidence.set?.name ?? pascal(slug);
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
  const D = (id, key, vars, extraFields = {}) => decisions.push({ id: `${ab}-${id}`, question: fill(dictionary.decisions[key], vars), status: "open", owner: "Matt", ...extraFields });

  // Props: archetype props, then one lever per claimed role (dictionary order),
  // then the set's own axes when it is a real component set.
  const props = [...arch.props.map((p) => ({ ...p }))];
  const stateAxis = /^(state|breakpoint|context|orientation)$/i;
  const parts = {};
  const ordered = [...claimed.entries()].map(([role, hit]) => ({ role, hit, def: dictionary.roles[role] })).filter((x) => x.def && !x.def.decisionOnly).sort((a, b) => (a.def.order ?? 99) - (b.def.order ?? 99));
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
  const states = [...arch.states.map((s) => ({ ...s }))];
  for (const a of evidence.axes ?? []) {
    if (a.type === "VARIANT") {
      if (stateAxis.test(a.name)) { if (!states.some((s) => s.figma.property === a.name)) states.push({ name: a.name, figma: { kind: "VARIANT", property: a.name, notes: (a.options ?? []).join(" | ") }, code: { mechanism: "tbd" }, notes: "Design axis read as a runtime state; confirm." }); }
      else props.push({ name: kebab(a.name).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), lever: true, type: "string", enum: a.options ?? [], default: a.defaultValue, figma: { kind: "VARIANT", property: a.name }, code: { prop: kebab(a.name).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), attr: `data-${kebab(a.name)}` } });
    } else if (a.type === "BOOLEAN" && !props.some((p) => p.figma?.property === a.name)) {
      const prop = kebab(a.name.replace(/#.*$/, "")).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      props.push({ name: prop, lever: true, type: "boolean", default: a.defaultValue, figma: { kind: "BOOLEAN", property: a.name }, code: { prop } });
    }
  }

  // Decisions: everything derived rather than read.
  D("archetype", "archetype", { archetype, why, slug }, { evidence: `roles ${[...roles].join(", ") || "none"}; pattern ${evidence.pattern ? `${evidence.pattern.kind}, ${evidence.pattern.repeats?.length ?? 0} repeats` : "n/a"}` });
  if (ordered.length) D("levers", "levers", { roles: ordered.map((o) => `${o.role} → ${o.def.lever?.name ?? o.def.part}`).join(", ") }, { evidence: ordered.map((o) => `${o.role}: ${o.hit.path}`).join("; ") });
  const unbound = evidence.unboundPaint ?? [];
  if (unbound.length) D("unbound-paint", "unboundPaint", { count: unbound.length, list: unbound.slice(0, 6).map((u) => `${u.node || "/"} ${u.properties.join("+")}`).join(", ") + (unbound.length > 6 ? ", …" : "") }, { evidence: `${slug}.figma.evidence.json unboundPaint` });
  const generic = [];
  const walkNames = (n, p) => { const q = `${p}/${n.name}`; if (GENERIC.test(n.name)) generic.push(q); for (const c of n.children ?? []) walkNames(c, q); };
  for (const c of evidence.anatomy?.tree?.children ?? []) walkNames(c, "");
  if (generic.length) D("layer-names", "genericLayers", { count: generic.length, list: generic.slice(0, 5).join(", ") + (generic.length > 5 ? ", …" : "") }, { evidence: `${slug}.figma.evidence.json anatomy` });
  if (extra.text.length) decisions.push({ id: `${ab}-stray-text`, question: `${dictionary.roles.text.question} Layers: ${extra.text.join(", ")}.`, status: "open", owner: "Matt", evidence: `${slug}.figma.evidence.json anatomy` });
  if (extra.art.length) decisions.push({ id: `${ab}-extra-art`, question: `Additional shape layers outside the media group (${extra.art.slice(0, 4).join(", ")}${extra.art.length > 4 ? ", …" : ""}). Fold them into the Media instance or name them as parts.`, status: "open", owner: "Matt", evidence: `${slug}.figma.evidence.json anatomy` });
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
  console.log(`SCAFFOLD  ${slug.padEnd(24)} ${defs.component} as ${defs.curated.by.match(/\((\S+)\)$/)?.[1]} · ${defs.props.length} props (${defs.props.filter((p) => p.lever).length} levers) · ${Object.keys(defs.anatomy.root.parts).length} parts · ${defs.decisions.length} open decisions`);
  console.log(`          wrote ${out.replace(ROOT + "/", "")}${evidencePath !== inSrc ? ` · moved evidence beside it` : ""}`);
  console.log(`          next: npm run defs:validate && npm run specs:build && npm run gate, then review the decisions`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
