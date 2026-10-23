#!/usr/bin/env node
// composition.mjs — what every crawled set is actually built from, and which of
// those dependencies still need a contract.
//
// The gate already warns, per component, when the design shows a dependency the
// contract never mentions. What it cannot answer is the question you ask when
// planning: across everything extracted so far, what is the WORKLIST? Which
// dependencies are real components that need contracts of their own, which are
// icon glyphs that never will, and which are internal structure nobody should
// publish?
//
// Classification is derived and then reported — never silently applied. The
// decision belongs in the defs (a slot's `accepts`, `composedOf`, or a decision
// recording why something is internal); this only says what is unresolved.
//
//   npm run specs:composition
//   npm run specs:composition -- --missing     only what needs a contract
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const SRC = join(ROOT, "packages", "components", "src");
const has = (f) => process.argv.includes(`--${f}`);

const alnum = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

// The icon rig is hundreds of glyphs behind one swappable slot. They are a
// CATEGORY (kind:icon), not components anyone writes a contract for, and
// listing them as gaps would bury the handful that matter.
const ICON = /^(s2a?_icon|icon[_-]|.*_icon_|b_app_)/i;

/**
 * How a dependency should be treated. Derived from the design file's own
 * naming plus what exists on disk — deliberately not from a hand-maintained
 * list, which would go stale the moment someone adds a component.
 */
// Set names carry version and status markers ("Button — v2", "🚫 Button — v1");
// the bare name is what matches a spec. Same rule as the sync server's slug.
const bare = (name) => String(name ?? "")
  .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
  .replace(/\s*[—–-]\s*v\d+(\.\d+)*\s*$/i, "")
  .replace(/\(.*?\)/g, "")
  .trim();
const DEPRECATED = /🚫|\bdeprecated\b/i;

function classify(name, { slug, specs, defs }) {
  if (ICON.test(name)) return { kind: "icon", need: false, note: "icon rig — belongs to kind:icon, not its own contract" };
  // The design still builds from a set it has retired. That is a design-side
  // finding before it is a contract question: the successor is what to compose.
  if (DEPRECATED.test(name)) {
    return { kind: "deprecated", need: true, note: `deprecated set — the design composes it still; swap the instance for its successor (${bare(name)})` };
  }
  // "MerchCard/PricingDisplay": a sub-set namespaced under this component. Its
  // variants belong in this contract, or it needs one of its own — like a
  // dot-prefixed hidden set, with the ownership written in the name.
  const owner = String(name).split("/")[0];
  if (String(name).includes("/") && alnum(bare(owner)) === alnum(slug)) {
    return { kind: "internal", need: true, note: "sub-set of this component — its variants belong in this contract, or it needs one of its own" };
  }
  // A dot prefix is the house convention for a hidden/internal component. It is
  // still a real component — Checkbox's ".checkbox" is a two-variant set that
  // carries the whole State axis — so it is never "nothing", and the states it
  // owns have to end up in SOMEONE's contract.
  //
  // This used to be classified as "the component's own layer" on the grounds
  // that the name matched the slug. That was wrong twice over: alnum(".checkbox")
  // equals alnum("checkbox") by coincidence, and more fundamentally a
  // component's own root is never in `instances` at all — every entry there is
  // an instance of some OTHER component.
  if (name.startsWith(".")) {
    return { kind: "internal", need: true,
             note: "hidden component — its variants belong in the parent's contract, or it needs one of its own" };
  }
  const key = alnum(bare(name));
  const bySlug = [...specs].find((s) => alnum(s) === key);
  if (bySlug && defs.has(bySlug)) return { kind: "contracted", need: false, note: `contract exists (${bySlug})` };
  if (bySlug) return { kind: "spec-only", need: true, note: `${bySlug} has a spec.json but no contract` };
  return { kind: "missing", need: true, note: "no spec and no contract — build it, or mark it internal" };
}

/** What the defs already say about this dependency, if anything. */
function declaredIn(defsJson, name) {
  if (!defsJson) return null;
  const key = alnum(name);
  const hits = [];
  // composition[] is the declaration the schema asks for; an entry by exact
  // set name is the judgment, whatever the anatomy does with it.
  const entry = (defsJson.composition ?? []).find((c) => c.name === name);
  if (entry) hits.push(`composition: ${entry.treatment}${entry.slug ? ` (${entry.slug})` : ""}`);
  const walk = (part, path) => {
    if (part?.slot?.accepts?.some((a) => alnum(a) === key)) hits.push(`slot ${path}`);
    for (const [n, c] of Object.entries(part?.parts ?? {})) walk(c, `${path}/${n}`);
  };
  if (defsJson.anatomy?.root) walk(defsJson.anatomy.root, "root");
  // The gate accepts a decision as settling a dependency when it names it AND
  // talks about composition; mirror that here rather than inventing a second
  // rule the two could disagree on.
  const COMPOSITIONAL = /internal|slot|compos|instance/i;
  for (const d of defsJson.decisions ?? []) {
    const text = `${d.question ?? ""} ${d.chose ?? ""} ${d.decision ?? ""} ${d.fix ?? ""}`;
    if (text.toLowerCase().includes(String(name).toLowerCase()) && COMPOSITIONAL.test(text)) hits.push(`decision ${d.id}`);
  }
  return hits.length ? hits.join(", ") : null;
}

const slugs = readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.figma.evidence.json`)));
const specs = new Set(readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.spec.json`))));
const defs = new Set(readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.defs.json`))));

const queue = new Map(); // name -> { kind, note, wantedBy: [] }
const rows = [];

for (const slug of slugs) {
  const ev = JSON.parse(readFileSync(join(SRC, slug, `${slug}.figma.evidence.json`), "utf8"));
  const defsPath = join(SRC, slug, `${slug}.defs.json`);
  const defsJson = existsSync(defsPath) ? JSON.parse(readFileSync(defsPath, "utf8")) : null;

  // The crawl is a DEEP walk, so it reports instances nested inside other
  // instances as if this component placed them. It does not: action-card's
  // "Overlay" lives at /.media/Overlay, inside the Media instance, which makes
  // it Media's business and Media's contract. Counting it here would bill every
  // component for its dependencies' dependencies and bury the ones it actually
  // owns. An instance whose path sits under another instance's path is
  // transitive; only the shallowest are direct.
  const paths = (ev.instances ?? [])
    .filter((i) => i.set?.name ?? i.mainComponent?.name)
    .map((i) => ({ name: i.set?.name ?? i.mainComponent?.name, path: i.node ?? "" }));
  const isTransitive = (p) => paths.some((o) => o.path !== p && p.startsWith(`${o.path}/`));

  const seen = new Map();
  for (const { name, path } of paths) {
    const e = seen.get(name) ?? { count: 0, direct: false, via: new Set() };
    e.count++;
    if (isTransitive(path)) {
      const owner = paths.filter((o) => o.path !== path && path.startsWith(`${o.path}/`))
        .sort((a, b) => b.path.length - a.path.length)[0];
      if (owner) e.via.add(owner.name);
    } else e.direct = true;
    seen.set(name, e);
  }

  const deps = [...seen.entries()].map(([name, e]) => {
    const c = classify(name, { slug, specs, defs });
    // A purely transitive dependency is never this component's to contract.
    const need = c.need && e.direct;
    return { name, count: e.count, ...c, need, direct: e.direct, via: [...e.via],
             declared: declaredIn(defsJson, name) };
  }).sort((a, b) => Number(b.need) - Number(a.need) || Number(b.direct) - Number(a.direct) || b.count - a.count);

  rows.push({ slug, contracted: defs.has(slug), deps });
  for (const d of deps) {
    if (!d.need) continue;
    const e = queue.get(d.name) ?? { kind: d.kind, note: d.note, wantedBy: [] };
    e.wantedBy.push(slug);
    queue.set(d.name, e);
  }
}

if (!slugs.length) {
  console.log("No component has Figma evidence yet — nothing has been crawled.");
  process.exit(0);
}

const MARK = { contracted: "✓", "spec-only": "~", missing: "✗", internal: "◦", icon: "·", deprecated: "🚫" };

if (!has("missing")) {
  for (const { slug, contracted, deps } of rows) {
    console.log(`\n${slug}${contracted ? "" : "  (not contracted yet)"}`);
    if (!deps.length) { console.log("    composes nothing"); continue; }
    for (const d of deps) {
      const where = d.direct
        ? (d.declared ? `declared: ${d.declared}` : (d.need ? "NOT DECLARED" : ""))
        : `via ${d.via.join(", ")} — their contract, not this one's`;
      console.log(`    ${MARK[d.kind]} ${d.name.padEnd(30)} x${String(d.count).padEnd(3)} ${d.kind.padEnd(11)} ${where}`);
      if (d.need && !d.declared) console.log(`        ${d.note}`);
    }
  }
  console.log("\n  ✓ contracted   ~ spec only, no contract   ✗ nothing   ◦ hidden/internal   · icon rig");
  console.log("  Indented under another name means transitive — it belongs to that dependency's contract.\n");
}

console.log(queue.size ? "Contracts to build (or mark internal):" : "Every real dependency is contracted.");
for (const [name, e] of [...queue].sort((a, b) => b[1].wantedBy.length - a[1].wantedBy.length)) {
  console.log(`  ${name.padEnd(30)} ${e.kind.padEnd(11)} needed by ${e.wantedBy.join(", ")}`);
}
// Only 3 of 46 components have been crawled; a clean report here means the
// crawled ones are clean, not the library.
const uncrawled = readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.spec.json`)) && !slugs.includes(d)).length;
if (uncrawled) console.log(`\n  ${slugs.length} crawled, ${uncrawled} with a spec but no Figma evidence — their composition is still unknown.`);
