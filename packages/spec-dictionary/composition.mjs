#!/usr/bin/env node
// composition.mjs — what is built from what, and therefore what to contract first.
//
// A contract that declares a slot naming something with no contract fails the
// COMPOSITION check. So contracts have to be written leaves-first, and "leaves
// first" is a property of the graph, not a thing to decide by feel.
//
// Depth is the real ordering signal: 0 is a leaf, and a component's depth is one
// more than the deepest thing it composes. The atomic group (atom / molecule /
// organism / card) is kept alongside because it is how people browse the library,
// but it does NOT order the work and is not a rule — Button is an atom that
// composes icons, Media is an atom that composes Overlay. The group is a
// taxonomy; depth is a fact.
//
//   npm run specs:composition              the conversion order, with repo state
//   npm run specs:composition -- --group=atom
//   npm run specs:composition -- --missing     only what has no spec at all
//   npm run specs:composition -- --refresh     how to re-capture from Figma
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const SRC = join(ROOT, "packages", "components", "src");
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const has = (f) => process.argv.includes(`--${f}`);

if (has("refresh")) {
  console.log(`Re-capture from the design file, which is the visual source of truth.

Run this through figma-console against the CPro file, then paste the result into
composition.json's "composes" and "groups":

  // groups — atomic level lives in page ORDER, not nesting: a separator page
  // opens a group and every indented page after it belongs to that group.
  // composes — for each COMPONENT_SET / standalone COMPONENT on a component
  // page, resolve every nested INSTANCE to the set it came from.

composition.json records when it was captured. It is a snapshot of the file and
goes stale when the file changes.`);
  process.exit(0);
}

const doc = JSON.parse(readFileSync(join(__dirname, "composition.json"), "utf8"));
const alnum = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
// Graph identity keeps the internal prefix: ".checkbox" and "Checkbox" are two
// different nodes, and collapsing them invents a cycle out of a real edge.
const bare = (s) => String(s).replace(/\s*—\s*v\d+$/, "").trim();
// Spec lookup drops it, because the repo names the file without the prefix.
const specKey = (s) => alnum(bare(s).replace(/^[._]/, ""));
// Graph key must keep them apart: alnum() alone strips the dot, so ".checkbox"
// and "Checkbox" collapse and the edge between them reads as a cycle.
const gkey = (s) => (/^[._]/.test(String(s).trim()) ? "internal:" : "") + alnum(bare(s));

// what the repo has
const slugs = readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.spec.json`)));
const specByName = new Map();
for (const s of slugs) {
  const spec = JSON.parse(readFileSync(join(SRC, s, `${s}.spec.json`), "utf8"));
  specByName.set(alnum(spec.name), { slug: s, contract: existsSync(join(SRC, s, `${s}.contract.json`)) });
}

// Depth: a leaf is 0; anything else is one past the deepest thing it composes.
// Cycles would be a design error, so they are capped and reported rather than
// looped on.
const composes = doc.composes ?? {};
const depthOf = (name, seen = new Set()) => {
  const key = gkey(name);
  if (seen.has(key)) return { d: 0, cycle: true };
  const kids = (composes[name] ?? composes[Object.keys(composes).find((k) => gkey(k) === key)] ?? [])
    .filter((k) => !k.startsWith("Scale/") && !k.startsWith("B_app"));
  if (!kids.length) return { d: 0, cycle: false };
  const next = new Set(seen); next.add(key);
  let d = 0, cycle = false;
  for (const k of kids) { const r = depthOf(k, next); d = Math.max(d, r.d + 1); cycle = cycle || r.cycle; }
  return { d, cycle };
};

const groupOf = (name) => doc.groups[name] ?? doc.groups[bare(name)] ?? "—";
const every = [...new Set([...Object.keys(composes), ...Object.values(composes).flat()])];

const rows = every
  .filter((n) => !n.startsWith("Scale/") && !n.startsWith("B_app"))
  .map((n) => {
    const { d, cycle } = depthOf(n);
    const hit = specByName.get(specKey(n));
    return { name: n, depth: d, cycle, group: groupOf(n), spec: Boolean(hit), contract: Boolean(hit?.contract),
             uses: (composes[n] ?? []).filter((k) => !k.startsWith("Scale/") && !k.startsWith("B_app")).length };
  })
  .filter((r) => (arg("group") ? r.group === arg("group") : true))
  .filter((r) => (has("missing") ? !r.spec : true))
  .sort((a, b) => a.depth - b.depth || a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

const W = Math.max(24, ...rows.map((r) => r.name.length));
console.log(`Composition order — captured ${doc.capturedAt} from ${doc.fileKey}\n`);
console.log(`${"component".padEnd(W)}  depth  group       uses  spec  contract`);
console.log("-".repeat(W + 38));
let lastDepth = -1;
for (const r of rows) {
  if (r.depth !== lastDepth) { console.log(`${"".padEnd(W)}  ${r.depth === 0 ? "--- leaves: contract these first ---" : `--- depth ${r.depth} ---`}`); lastDepth = r.depth; }
  console.log(`${r.name.padEnd(W)}  ${String(r.depth).padStart(5)}  ${r.group.padEnd(10)}  ${String(r.uses).padStart(4)}  ${r.spec ? " yes" : " NO "}  ${r.contract ? "  yes" : "   - "}${r.cycle ? "   (cycle)" : ""}`);
}

const noSpec = rows.filter((r) => !r.spec);
const noContract = rows.filter((r) => r.spec && !r.contract);
console.log(`\n${rows.length} components in the graph`);
console.log(`  contracted      ${rows.filter((r) => r.contract).length}`);
console.log(`  spec, no contract ${noContract.length}`);
console.log(`  no spec at all    ${noSpec.length}`);
if (noSpec.length) console.log(`\nNo spec at all, shallowest first — these block everything above them:\n  ${noSpec.map((r) => `${r.name} (d${r.depth})`).join("\n  ")}`);
