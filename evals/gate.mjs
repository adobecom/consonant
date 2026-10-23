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
//   SCHEMA_LOCK   the schema files match packages/spec-dictionary/schema.lock.json
//   DEFS          curation checks (schema, code conformance, anatomy, composition, tokens)
//   COMPOSITION   composedOf / slot accepts name specs that exist
//   TOKENS        token bindings resolve in the shipped CSS (legacy specs warn)
//   FIGMA         design bindings verified against plugin evidence (missing evidence warns)
//   FRESH         generated specs equal a fresh build; code evidence matches the sources
//   GRID          the grid/layout contracts: defs schema, generated contracts fresh,
//                 and every layout rule run against the stylesheet, the shipped
//                 tokens and the Figma container/grid modes
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
const LOCK = join(ROOT, "packages", "spec-dictionary", "schema.lock.json");
const SCHEMA_FILES = ["apps/s2a-ds-mcp/src/spec-schema.ts", "packages/components/defs.schema.json"];
const args = process.argv.slice(2);
const full = args.includes("--full");
const updateLock = args.includes("--update-schema-lock");
const sha = (t) => "sha256:" + createHash("sha256").update(t).digest("hex");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const alnum = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
// A category accept ("kind:icon") rather than a component name.
const isKind = (s) => String(s).startsWith("kind:");

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
const tripwire = readJson(join(ROOT, "packages", "spec-dictionary", "fixtures", "tripwire.spec.json"));
if (!ComponentSpecSchema.safeParse(tripwire).success) report("SCHEMA", "TRIPWIRE_FAILED", "fail", "packages/spec-dictionary/fixtures/tripwire.spec.json", "the frozen known-good spec no longer validates: the schema or validator drifted");

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
// validate-defs prints a FAIL header and its problems indented; warnings come
// indented too, prefixed "warn:". They are warnings — counting them as
// failures made every advisory line a red mark the moment one component failed.
if (defsRun.status !== 0) for (const line of defsRun.stdout.split("\n").filter((l) => l.startsWith("FAIL") || l.startsWith("      "))) {
  const text = line.trim();
  if (text.startsWith("warn:")) report("DEFS", "DEFS_WARN", "warn", "validate-defs", text.slice(5).trim());
  else report("DEFS", "DEFS_FAILED", "fail", "validate-defs", text);
}
// Every literal a contract ships, by name. A raw: value is a property the
// design sets with no variable behind it (or one a curator typed): it renders
// correctly and is still a token gap, so it is listed here every run until it
// is bound in Figma or argued for in a decision — never silently shipped.
for (const slug of defsSlugs) {
  const defs = readJson(join(SRC, slug, `${slug}.defs.json`));
  const justified = new Set((defs?.decisions ?? []).filter((d) => d.status === "decided" && /hardcoded|raw/i.test(`${d.id} ${d.decision ?? ""}`)).map((d) => d.id));
  const walk = (part, path) => {
    const maps = [["", part.tokens]];
    for (const [st, m] of Object.entries(part.states ?? {})) maps.push([`:${st}`, m]);
    for (const e of part.tokensByProp ?? []) for (const [val, m] of Object.entries(e.map ?? {})) maps.push([`@${e.prop}=${val}`, m]);
    for (const e of part.statesByProp ?? []) for (const [val, m] of Object.entries(e.map ?? {})) maps.push([`@${e.prop}=${val}:${e.state}`, m]);
    for (const [where, m] of maps) for (const [prop, ref] of Object.entries(m ?? {})) if (String(ref).startsWith("raw:")) {
      report("DEFS", "DEFS_RAW_VALUE", "warn", `${slug}.defs.json anatomy ${path} ${prop}${where}`,
        `${ref} is hardcoded — no S2A variable behind it${justified.size ? ` (decision ${[...justified].join(", ")} records why)` : "; bind one in Figma and re-extract, or record why in a decision"}`);
    }
    for (const [n, child] of Object.entries(part.parts ?? {})) walk(child, `${path}/${n}`);
  };
  if (defs?.anatomy?.root) walk(defs.anatomy.root, "root");
}

// ── COMPOSITION ───────────────────────────────────────────────────────────────
const specByAlnum = new Map([...specs.values()].map((s) => [alnum(s.name), s.slug]));
for (const [slug, spec] of specs) {
  for (const dep of spec.composedOf ?? []) if (!isKind(dep) && !specs.has(dep) && !specByAlnum.has(alnum(dep))) report("COMPOSITION", "COMPOSITION_UNKNOWN", "fail", `${slug}.spec.json composedOf`, `"${dep}" has no spec.json`);
  const walk = (part, path) => {
    // "kind:icon" names a category, not a component — the icon rig wraps
    // hundreds of glyphs that will never each have a spec. There is nothing to
    // resolve, so there is nothing to fail on.
    if (part?.slot) for (const a of part.slot.accepts) if (!isKind(a) && !specs.has(a) && !specByAlnum.has(alnum(a))) report("COMPOSITION", "COMPOSITION_UNKNOWN", "fail", `${slug}.spec.json anatomy ${path}`, `slot ${part.slot.name} accepts "${a}" which has no spec.json`);
    for (const [n, c] of Object.entries(part?.parts ?? {})) walk(c, `${path}/${n}`);
  };
  if (spec.anatomy) walk(spec.anatomy, "root");
}

// The checks above verify that composition a contract DECLARES resolves. This is
// the other direction: composition the design file shows and the contract never
// mentions. Without it a component can be built from six others and pass clean —
// which is how DotPagination's Dot stayed invisible while its evidence recorded
// five instances of it.
//
// Warn rather than fail. Some composed sets are deliberately internal (Figma
// usually says so with a section named "do not use directly"), and that call
// belongs to a person. A decision naming the set is what settles it.
for (const slug of slugs) {
  const evPath = join(SRC, slug, `${slug}.figma.evidence.json`);
  if (!existsSync(evPath)) continue;   // no design evidence, nothing to compare against
  const ev = readJson(evPath);
  if (!ev?.instances?.length) continue;
  const spec = specs.get(slug);
  const defsPath = join(SRC, slug, `${slug}.defs.json`);
  const defs = existsSync(defsPath) ? readJson(defsPath) : null;
  // Icons arrive by the hundred and belong to an icon slot, not a contract each.
  const isIcon = (n) => /icon/i.test(n) && /^(s2|s2a)/i.test(String(n).replace(/^[._]/, ""));
  // Direct dependencies only. The crawl is a deep walk, so an instance nested
  // inside another instance is that component's dependency: action-card's
  // "Overlay" lives inside its Media instance and belongs to Media's contract.
  // Asking action-card to declare it would bill every component for its
  // dependencies' dependencies, and the fix would be a lie.
  const placed = ev.instances
    .filter((i) => (i.set ?? i.mainComponent)?.name)
    .map((i) => ({ name: (i.set ?? i.mainComponent).name, path: i.node ?? "" }));
  const transitive = (p) => placed.some((o) => o.path !== p && p.startsWith(`${o.path}/`));

  const composed = new Map();
  for (const { name, path } of placed) {
    if (isIcon(name) || transitive(path)) continue;
    const clean = String(name).replace(/^[🚫.\s_]+/, "").replace(/\s*—\s*v\d+$/, "").trim();
    if (!clean || alnum(clean) === alnum(spec?.name)) continue;
    composed.set(alnum(clean), clean);
  }
  if (!composed.size) continue;

  // Anything the contract already accounts for: composedOf, a slot's accepts,
  // or a decision that mentions it by name (how an internal set gets settled).
  const declared = new Set((spec?.composedOf ?? []).map(alnum));
  // composition[] is the structured ruling and outranks sniffing decision prose:
  // every entry is an explicit statement about what this dependency is.
  for (const c of defs?.composition ?? []) declared.add(alnum(c.name));
  const walkSlots = (part) => {
    for (const a of part?.slot?.accepts ?? []) declared.add(alnum(a));
    for (const c of Object.values(part?.parts ?? {})) walkSlots(c);
  };
  if (spec?.anatomy) walkSlots(spec.anatomy);

  // A decision settles a composed set only when it is ABOUT composition. Naming
  // the set is not enough: quote-card has decisions mentioning "Heading" and
  // "Button" that are entirely about type ramps and token names, and treating
  // those as settled would suppress four real gaps. Require composition
  // vocabulary in the same decision as the name.
  const COMPOSITIONAL = /internal|slot|compos|instance/i;
  const settles = (name) => (defs?.decisions ?? []).some((d) => {
    const text = `${d.question ?? ""} ${d.chose ?? ""} ${d.decision ?? ""} ${d.fix ?? ""}`;
    return text.toLowerCase().includes(name.toLowerCase()) && COMPOSITIONAL.test(text);
  });

  for (const [key, name] of composed) {
    if (declared.has(key)) continue;
    if (settles(name)) continue;
    const known = specs.has(key) || specByAlnum.has(key);
    report("COMPOSITION", "COMPOSITION_UNDECLARED", "warn", `${slug}.figma.evidence.json instances`,
      `builds from "${name}" and the contract never mentions it${known ? "" : " — and it has no spec.json either"}. Declare it as a slot or composedOf, or record in a decision why it is internal.`);
  }
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
const fresh = run("node", ["packages/spec-dictionary/build.mjs", "--check"]);
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

// ── GRID ──────────────────────────────────────────────────────────────────────
// The layout contracts run their own rules; the gate reports the outcome and
// adopts its exit code. Grid evidence is cheap to regenerate but is NOT
// regenerated here: a gate that rewrites its own inputs cannot fail on them.
{
  const gridValidator = join(ROOT, "packages", "grid", "scripts", "validate-grid-contracts.mjs");
  const conformancePath = join(ROOT, "packages", "grid", "out", "grid-conformance.json");
  if (!existsSync(gridValidator)) {
    report("GRID", "GRID_VALIDATOR_MISSING", "warn", "packages/grid/scripts", "no grid validator on disk");
  } else {
    const r = run("node", [gridValidator, "--quiet"]);
    if (!existsSync(conformancePath)) {
      report("GRID", "GRID_REPORT_MISSING", "fail", "packages/grid/out/grid-conformance.json", r.stderr?.trim().slice(0, 300) || "validator produced no report");
    } else {
      const gc = readJson(conformancePath);
      for (const s of gc.schema.filter((x) => !x.valid)) {
        report("GRID", "GRID_SCHEMA_INVALID", "fail", `packages/grid/contracts/${s.slug}.defs.json`, s.errors.join("; ").slice(0, 300));
      }
      for (const f of gc.freshness.filter((x) => !x.fresh)) {
        report("GRID", "GRID_CONTRACT_STALE", "fail", f.file, `${f.reason} — run: npm run grid:build`);
      }
      for (const c of gc.contracts) {
        for (const rule of c.rules.filter((x) => x.status === "fail")) {
          report("GRID", rule.severity === "fail" ? "GRID_RULE_FAILED" : "GRID_RULE_WARN", rule.severity, `${c.slug}/${rule.id}`, rule.detail);
        }
      }
      for (const f of gc.scaleFindings) {
        report("GRID", "GRID_SCALE_INVERTED", "warn", `${f.family}/${f.mode}`, f.detail);
      }
    }
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true });
const fails = findings.filter((f) => f.level === "fail"), warns = findings.filter((f) => f.level === "warn");
const summary = { date: new Date().toISOString(), mode: full ? "full" : "static", specs: slugs.length, defs: defsSlugs.length, fails: fails.length, warns: warns.length, findings };
writeFileSync(join(OUT, "gate.json"), JSON.stringify(summary, null, 2) + "\n");
const byClass = {};
for (const f of findings) (byClass[f.class] ??= { fail: 0, warn: 0 })[f.level]++;
for (const cls of ["SCHEMA", "SCHEMA_LOCK", "DEFS", "COMPOSITION", "TOKENS", "FIGMA", "FRESH", "GRID", ...(full ? ["EVALS"] : [])]) {
  const c = byClass[cls] ?? { fail: 0, warn: 0 };
  console.log(`${(c.fail ? "FAIL" : c.warn ? "WARN" : "PASS").padEnd(5)} ${cls.padEnd(12)} ${c.fail} fail · ${c.warn} warn`);
}
for (const f of fails) console.log(`  ✖ ${f.code.padEnd(26)} ${f.where}: ${f.message}`);
for (const f of warns) console.log(`  ⚠ ${f.code.padEnd(26)} ${f.where}: ${f.message}`);
console.log(`${fails.length ? "RED" : "GREEN"}: ${slugs.length} specs, ${defsSlugs.length} with defs, ${fails.length} failures, ${warns.length} warnings. Report: evals/gate/out/gate.json`);
process.exitCode = fails.length ? 1 : 0;
