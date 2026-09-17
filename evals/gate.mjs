#!/usr/bin/env node
// evals/gate.mjs — the one command. Every check class of the contract system
// runs here, emits stable codes, and any FAIL sets a non-zero exit. CI runs
// the same command; a red gate blocks merge.
//
//   npm run gate                 static checks (seconds)
//   npm run gate:full            + build + page evals (visual, motion, tokens, a11y, perf)
//   npm run gate:lock            re-vendor the schema lock after a deliberate schema change
//
// Check classes (docs/future-notes/s2a-contract-system-plan.md, step 5):
//   SCHEMA        every spec.json validates against the vendored zod schema;
//                 the frozen tripwire spec must validate (else the tooling drifted)
//   SCHEMA_LOCK   the schema files match packages/specs/schema.lock.json
//   DEFS          curation checks (schema, code conformance, anatomy, composition, tokens)
//   COMPOSITION   composedOf / slot accepts name specs that exist
//   TOKENS        token bindings resolve in the shipped CSS (legacy specs warn)
//   FIGMA         design bindings verified against plugin evidence (missing evidence warns)
//   FRESH         generated specs equal a fresh build; code evidence matches the sources
//   EVALS (full)  homepage tokens, motion, visual, a11y, perf
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = join(ROOT, "packages", "components", "src");
const OUT = join(__dirname, "gate", "out");
const LOCK = join(ROOT, "packages", "specs", "schema.lock.json");
const SCHEMA_FILES = ["apps/s2a-ds-mcp/src/spec-schema.ts", "packages/components/defs.schema.json"];
const args = process.argv.slice(2);
const full = args.includes("--full");
const updateLock = args.includes("--update-schema-lock");
const sha = (t) => "sha256:" + createHash("sha256").update(t).digest("hex");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const alnum = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const findings = [];
const report = (cls, code, level, where, message) => findings.push({ class: cls, code, level, where, message });
const run = (cmd, cmdArgs, opts = {}) => spawnSync(cmd, cmdArgs, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...opts });

const slugs = readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.spec.json`)));
const specs = new Map(slugs.map((s) => [s, readJson(join(SRC, s, `${s}.spec.json`))]));
const defsSlugs = slugs.filter((s) => existsSync(join(SRC, s, `${s}.defs.json`)));

// ── SCHEMA ────────────────────────────────────────────────────────────────────
const { ComponentSpecSchema } = await import(join(ROOT, "apps", "s2a-ds-mcp", "src", "spec-schema.ts"));
for (const [slug, spec] of specs) {
  const r = ComponentSpecSchema.safeParse(spec);
  if (!r.success) report("SCHEMA", "SCHEMA_INVALID", "fail", `${slug}.spec.json`, r.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
}
const tripwire = readJson(join(ROOT, "packages", "specs", "fixtures", "tripwire.spec.json"));
if (!ComponentSpecSchema.safeParse(tripwire).success) report("SCHEMA", "TRIPWIRE_FAILED", "fail", "packages/specs/fixtures/tripwire.spec.json", "the frozen known-good spec no longer validates: the schema or validator drifted");

// ── SCHEMA_LOCK ───────────────────────────────────────────────────────────────
const current = Object.fromEntries(SCHEMA_FILES.map((f) => [f, sha(readFileSync(join(ROOT, f), "utf8"))]));
if (updateLock) {
  writeFileSync(LOCK, JSON.stringify({ note: "Hashes of the vendored contract schemas. A change here is deliberate: validate every spec and defs against the new schema (npm run gate), then npm run gate:lock.", updated: new Date().toISOString().slice(0, 10), files: current }, null, 2) + "\n");
  console.log(`schema lock updated: ${LOCK.slice(ROOT.length + 1)}`);
}
const lock = existsSync(LOCK) ? readJson(LOCK) : null;
if (!lock) report("SCHEMA_LOCK", "SCHEMA_LOCK_MISSING", "fail", LOCK.slice(ROOT.length + 1), "run npm run gate:lock once the schemas are reviewed");
else for (const [f, h] of Object.entries(current)) if (lock.files[f] !== h) report("SCHEMA_LOCK", "SCHEMA_LOCK_DRIFT", "fail", f, "schema changed since the lock; review the change, run the gate, then npm run gate:lock");

// ── DEFS ──────────────────────────────────────────────────────────────────────
const defsRun = run("node", ["packages/components/scripts/validate-defs.mjs"]);
if (defsRun.status !== 0) for (const line of defsRun.stdout.split("\n").filter((l) => l.startsWith("FAIL") || l.startsWith("      "))) report("DEFS", "DEFS_FAILED", "fail", "validate-defs", line.trim());

// ── COMPOSITION ───────────────────────────────────────────────────────────────
const specByAlnum = new Map([...specs.values()].map((s) => [alnum(s.name), s.slug]));
for (const [slug, spec] of specs) {
  for (const dep of spec.composedOf ?? []) if (!specs.has(dep) && !specByAlnum.has(alnum(dep))) report("COMPOSITION", "COMPOSITION_UNKNOWN", "fail", `${slug}.spec.json composedOf`, `"${dep}" has no spec.json`);
  const walk = (part, path) => {
    if (part?.slot) for (const a of part.slot.accepts) if (!specs.has(a) && !specByAlnum.has(alnum(a))) report("COMPOSITION", "COMPOSITION_UNKNOWN", "fail", `${slug}.spec.json anatomy ${path}`, `slot ${part.slot.name} accepts "${a}" which has no spec.json`);
    for (const [n, c] of Object.entries(part?.parts ?? {})) walk(c, `${path}/${n}`);
  };
  if (spec.anatomy) walk(spec.anatomy, "root");
}

// ── TOKENS ────────────────────────────────────────────────────────────────────
const TOKENS_DIR = join(ROOT, "dist", "packages", "tokens", "css", "dev");
const shipped = new Set();
if (existsSync(TOKENS_DIR)) for (const f of readdirSync(TOKENS_DIR)) for (const m of readFileSync(join(TOKENS_DIR, f), "utf8").matchAll(/(--s2a-[a-z0-9_-]+)\s*:/g)) shipped.add(m[1]);
if (!shipped.size) report("TOKENS", "TOKENS_NOT_BUILT", "fail", TOKENS_DIR.slice(ROOT.length + 1), "no shipped token CSS; run npx nx build tokens");
else {
  const legacy = new Map();
  for (const [slug, spec] of specs) for (const [key, name] of Object.entries(spec.tokenBindings ?? {})) {
    const v = name.startsWith("--") ? name : `--${name}`;
    if (shipped.has(v)) continue;
    if (defsSlugs.includes(slug)) report("TOKENS", "TOKEN_UNSHIPPED", "fail", `${slug}.spec.json tokenBindings.${key}`, `${v} is not a shipped token`);
    else legacy.set(v, [...(legacy.get(v) ?? []), slug]);
  }
  for (const [v, where] of legacy) report("TOKENS", "TOKEN_UNSHIPPED_LEGACY", "warn", where.join(", "), `${v} bound in a hand-written spec is not shipped`);
}

// ── FIGMA ─────────────────────────────────────────────────────────────────────
for (const slug of defsSlugs) {
  const spec = specs.get(slug);
  if (!spec.bindings?.figma?.evidence) { report("FIGMA", "FIGMA_EVIDENCE_MISSING", "warn", `${slug}`, "no figma.evidence.json published from the toolkit yet; design bindings are unverified"); continue; }
  for (const p of spec.props) if (p.bindings && p.bindings.figma !== "NONE" && p.bindings.figma.verified === false) report("FIGMA", "FIGMA_BINDING_UNVERIFIED", "fail", `${slug}.spec.json props.${p.name}`, `${p.bindings.figma.kind} "${p.bindings.figma.property}" is not a property of the anchored set`);
}

// ── FRESH ─────────────────────────────────────────────────────────────────────
const fresh = run("node", ["packages/specs/build.mjs", "--check"]);
if (fresh.status !== 0) for (const line of fresh.stdout.split("\n").filter((l) => l.startsWith("       "))) report("FRESH", "SPEC_STALE", "fail", "specs:check", line.trim());
for (const slug of slugs) {
  const ev = join(SRC, slug, `${slug}.code.evidence.json`);
  if (!existsSync(ev)) {
    if (defsSlugs.includes(slug)) {
      const pending = Boolean(readJson(join(SRC, slug, `${slug}.defs.json`))?.anchors?.code?.pending);
      if (pending) report("FRESH", "CODE_EVIDENCE_PENDING", "warn", slug, "contract scaffolded from design; no code yet (anchors.code.pending). Generate the component, then npm run evidence:code");
      else report("FRESH", "CODE_EVIDENCE_MISSING", "fail", slug, "defs without code evidence; run npm run evidence:code");
    }
    continue;
  }
  for (const [file, hash] of Object.entries(readJson(ev).sources ?? {})) {
    const now = existsSync(join(ROOT, file)) ? sha(readFileSync(join(ROOT, file), "utf8")) : null;
    if (now !== hash) report("FRESH", "CODE_EVIDENCE_STALE", "fail", file, `changed since ${slug}.code.evidence.json was extracted; run npm run evidence:code -- --slug=${slug}`);
  }
}

// ── EVALS (full) ─────────────────────────────────────────────────────────────
if (full) {
  const steps = [
    ["build", "npx", ["nx", "build", "authoring-poc"]],
    ["tokens", "node", ["evals/tokens/homepage-tokens.mjs"]],
    ["motion", "node", ["evals/motion/homepage-motion.mjs"]],
    ["visual", "node", ["evals/visual/homepage-parity.mjs"]],
    ["a11y", "npx", ["nx", "run", "authoring-poc:a11y-audit", "--skip-nx-cache"]],
    ["perf", "npx", ["nx", "run", "authoring-poc:homepage-perf", "--skip-nx-cache"]],
  ];
  for (const [name, cmd, a] of steps) {
    const started = Date.now();
    const r = run(cmd, a);
    const last = (r.stdout + r.stderr).trim().split("\n").filter((l) => l.trim() && !/configure-ai-agents/.test(l)).slice(-1)[0] ?? "";
    console.log(`eval ${name.padEnd(7)} ${r.status === 0 ? "ok  " : "FAIL"} ${((Date.now() - started) / 1000).toFixed(0)}s  ${last.slice(0, 120)}`);
    if (r.status !== 0) report("EVALS", `EVAL_${name.toUpperCase()}_FAILED`, "fail", name, last.slice(0, 300));
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true });
const fails = findings.filter((f) => f.level === "fail"), warns = findings.filter((f) => f.level === "warn");
const summary = { date: new Date().toISOString(), mode: full ? "full" : "static", specs: slugs.length, defs: defsSlugs.length, fails: fails.length, warns: warns.length, findings };
writeFileSync(join(OUT, "gate.json"), JSON.stringify(summary, null, 2) + "\n");
const byClass = {};
for (const f of findings) (byClass[f.class] ??= { fail: 0, warn: 0 })[f.level]++;
for (const cls of ["SCHEMA", "SCHEMA_LOCK", "DEFS", "COMPOSITION", "TOKENS", "FIGMA", "FRESH", ...(full ? ["EVALS"] : [])]) {
  const c = byClass[cls] ?? { fail: 0, warn: 0 };
  console.log(`${(c.fail ? "FAIL" : c.warn ? "WARN" : "PASS").padEnd(5)} ${cls.padEnd(12)} ${c.fail} fail · ${c.warn} warn`);
}
for (const f of fails) console.log(`  ✖ ${f.code.padEnd(26)} ${f.where}: ${f.message}`);
for (const f of warns) console.log(`  ⚠ ${f.code.padEnd(26)} ${f.where}: ${f.message}`);
console.log(`${fails.length ? "RED" : "GREEN"}: ${slugs.length} specs, ${defsSlugs.length} with defs, ${fails.length} failures, ${warns.length} warnings. Report: evals/gate/out/gate.json`);
process.exitCode = fails.length ? 1 : 0;
