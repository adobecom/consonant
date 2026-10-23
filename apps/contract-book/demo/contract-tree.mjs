// contract-tree.mjs — contract a whole component tree from one Figma link,
// leaves first, through the Book's own endpoints. Headless twin of the Book's
// "Contract tree" action: same crawl, same draft, same save, same build.
//
//   node apps/contract-book/demo/contract-tree.mjs --url=<figma link> [--render] [--dry] [--force]
//
// Needs the Book on :6007. Skips sets that already have a contract on disk,
// dot-prefixed hidden sets (they belong to their parent), and anything the
// token cannot read. With --render, renders every contracted slug afterwards,
// children before parents, so composed imports resolve.
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const has = (f) => process.argv.includes(`--${f}`);
const BOOK = "http://localhost:6007";
const url = arg("url");
if (!url) { console.error("usage: --url=<figma link> [--render] [--dry]"); process.exit(2); }
const ROOT = resolve(new URL(".", import.meta.url).pathname, "..", "..", "..");
const post = async (path, body) => (await fetch(`${BOOK}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })).json();
const t = (ms) => `${(ms / 1000).toFixed(1)}s`;

let t0 = Date.now();
const tree = await post("/__extract/crawl", { url });
if (!tree.ok) { console.error("crawl failed:", tree.message ?? tree.reason); process.exit(1); }
console.log(`crawled ${Object.keys(tree.nodes).length} nodes in ${t(Date.now() - t0)}; order (leaves first):`);
for (const id of tree.order) {
  const n = tree.nodes[id];
  const state = n.kind !== "set" ? n.kind : n.onDisk?.contract ? "contracted" : n.onDisk?.spec ? "spec-only" : "new";
  console.log(`  ${"  ".repeat(n.depth ?? 0)}${n.name ?? id}  →  ${n.slug ?? "?"}  [${state}${n.onDisk?.code ? ", code" : ""}]  ${n.variants ?? 0} variants, ${n.deps?.length ?? 0} deps`);
}
if (has("dry")) process.exit(0);

const done = [];
for (const id of tree.order) {
  const n = tree.nodes[id];
  if (n.kind !== "set") { console.log(`skip  ${id}: ${n.kind} (${n.error ?? ""})`); continue; }
  if (!n.slug) { console.log(`skip  ${n.name}: no slug`); continue; }
  if (n.name.startsWith(".")) { console.log(`skip  ${n.name}: hidden set, belongs to its parent`); continue; }
  // --only=a,b re-drafts just those slugs (and the root); --force re-drafts every draft.
  const only = (arg("only", "") || "").split(",").filter(Boolean);
  const wanted = only.length ? only.includes(n.slug) || id === tree.root : has("force") || id === tree.root;
  if (n.onDisk?.contract && !wanted) { console.log(`have  ${n.name} → ${n.slug} (contract on disk)`); done.push(n.slug); continue; }
  if (done.includes(n.slug)) { console.log(`have  ${n.name} → ${n.slug} (done this run)`); continue; }
  t0 = Date.now();
  const d = await post("/__extract/draft", { evidence: n.evidence, slug: n.slug });
  if (!d.ok) { console.log(`FAIL  ${n.name}: draft — ${d.message ?? d.reason}`); continue; }
  const lows = (d.notes ?? []).filter((x) => x.confidence === "low").map((x) => x.id);
  // Overwrite only what this run is allowed to: a draft, or the root when
  // asked. A curated defs is refused by the endpoint regardless.
  const s = await post("/__extract/save", { slug: d.slug, evidence: d.evidence, defs: d.defs, overwriteDefs: wanted, build: true });
  if (!s.ok) { console.log(`FAIL  ${n.name}: save — ${s.message}`); continue; }
  console.log(`made  ${n.name} → ${d.slug}  defs ${s.defs?.status}, evidence ${s.evidence?.status}${s.code ? `, code ${s.code.status}` : ""}, ${s.build?.status ?? "not built"}  (${t(Date.now() - t0)})`
    + (lows.length ? `\n        low-confidence: ${lows.join(", ")}` : "")
    + (s.build?.line && s.build.status !== "built" ? `\n        ${s.build.line}` : ""));
  done.push(d.slug);
}

if (has("render")) {
  console.log("\nrendering, children first:");
  for (const slug of done) {
    try { const out = execSync(`npm run specs:render -- --slug=${slug}`, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); console.log(`  ${slug}: ${out.trim().split("\n").pop()}`); }
    catch (e) { console.log(`  ${slug}: render failed\n${(e.stdout ?? "").slice(-300)}${(e.stderr ?? "").slice(-300)}`); }
  }
}
console.log(`\n${done.length} contracted: ${done.join(", ")}`);
