#!/usr/bin/env node
// upstream.mjs — hold S2A's contract format against Southleft's.
//
// There is no industry standard for component contracts. southleft/ds-contracts-poc
// is the closest thing and it is public and active, so it is the alignment target,
// not a reference. This script answers three questions on demand:
//
//   DRIFT       has upstream's schema moved since we vendored it?
//   TRIPWIRE    does upstream's own known-good contract still validate against our
//               vendored copy? It can only fail one way — WE drifted.
//   CONFORMANCE how many of our generated spec.json files validate against it?
//               Expected to fail today; the number is the migration's progress bar.
//
//   npm run specs:upstream              report
//   npm run specs:upstream -- --update  re-vendor schema + golden, repin
//   npm run specs:upstream -- --detail  per-spec error breakdown
//
// Network is only touched for DRIFT and --update; both degrade to a skip offline so
// this is safe to run anywhere.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const DIR = join(__dirname, "southleft");
const SRC = join(ROOT, "packages", "components", "src");
const PIN = join(DIR, "pin.json");
const args = process.argv.slice(2);
const update = args.includes("--update");
const detail = args.includes("--detail");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

// Untrusted-free, but keep the arg-array habit: never build a shell string.
const gh = (path, jq) => {
  try {
    return execFileSync("gh", ["api", path, "--jq", jq], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
};

const pin = readJson(PIN);
const findings = [];
const report = (cls, code, level, message) => findings.push({ cls, code, level, message });

// ── DRIFT ────────────────────────────────────────────────────────────────────
if (update) {
  for (const [local, meta] of Object.entries(pin.files)) {
    const content = gh(`repos/${pin.repo}/contents/${meta.path}`, ".content");
    const sha = gh(`repos/${pin.repo}/contents/${meta.path}`, ".sha");
    if (!content || !sha) { report("DRIFT", "UPSTREAM_UNREACHABLE", "warn", `could not fetch ${meta.path}; left the vendored copy alone`); continue; }
    writeFileSync(join(DIR, local), Buffer.from(content, "base64"));
    pin.files[local].blobSha = sha;
    report("DRIFT", "REVENDORED", "info", `${local} ← ${pin.repo}/${meta.path} @ ${sha.slice(0, 7)}`);
  }
  pin.repoCommit = gh(`repos/${pin.repo}/commits`, ".[0].sha") ?? pin.repoCommit;
  pin.vendoredAt = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  writeFileSync(PIN, JSON.stringify(pin, null, 2) + "\n");
} else {
  let reachable = false, moved = 0;
  for (const [local, meta] of Object.entries(pin.files)) {
    const sha = gh(`repos/${pin.repo}/contents/${meta.path}`, ".sha");
    if (!sha) continue;
    reachable = true;
    if (sha !== meta.blobSha) { moved++; report("DRIFT", "SCHEMA_MOVED", "warn", `${local}: upstream is ${sha.slice(0, 7)}, we vendored ${meta.blobSha.slice(0, 7)} — review the change, then npm run specs:upstream -- --update`); }
  }
  if (!reachable) report("DRIFT", "UPSTREAM_UNREACHABLE", "info", `could not reach ${pin.repo} (no gh auth or offline) — drift unchecked`);
  else if (!moved) report("DRIFT", "PINNED_CURRENT", "info", `vendored copies match ${pin.repo} HEAD (${(pin.repoCommit ?? "").slice(0, 7)}), pinned ${pin.vendoredAt.slice(0, 10)}`);
}

// ── TRIPWIRE ─────────────────────────────────────────────────────────────────
// Conformance comes from @adobecom/s2a-validators, which loads this same
// vendored schema. A private compile here would be a second opinion on what
// upstream requires, and the whole point of this check is that there is one.
const validatorsDist = join(ROOT, "packages", "validators", "dist", "index.js");
if (!existsSync(validatorsDist)) {
  console.error("upstream: @adobecom/s2a-validators is not built.\n  cd packages/validators && npm install && npm run build");
  process.exit(2);
}
const { validateContract } = await import(pathToFileURL(validatorsDist).href);
const validate = (data) => validateContract(data, ROOT);

const golden = readJson(join(DIR, "golden.button.contract.json"));
const goldenResult = validate(golden);
if (!goldenResult.ok) {
  report("TRIPWIRE", "GOLDEN_REJECTED", "fail", `upstream's own ${golden.id} no longer validates against our vendored schema — our copy or validator drifted: ${goldenResult.violations.map((v) => v.message).join("; ").slice(0, 200)}`);
} else {
  report("TRIPWIRE", "GOLDEN_OK", "info", `${golden.id} v${golden.version} validates — the vendored pair is self-consistent`);
}

// ── CONFORMANCE ──────────────────────────────────────────────────────────────
// A component has a contract only once it has a curated def to generate one from,
// so this is two numbers, not one: of the contracts we emit, how many conform
// (must be all of them), and of our components, how many emit one at all (the
// coverage backlog). Collapsing them into a single percentage would hide which
// of the two is actually blocked.
const slugs = existsSync(SRC) ? readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.spec.json`))) : [];
const withContract = slugs.filter((d) => existsSync(join(SRC, d, `${d}.contract.json`)));
const missingReq = new Map(), extraProp = new Map();
let conform = 0;
const per = [];
for (const slug of withContract) {
  const contract = readJson(join(SRC, slug, `${slug}.contract.json`));
  const { ok, violations: errs } = validate(contract);
  if (ok) conform++;
  // Root-level only: a missing field on a nested part is a different problem
  // from one the contract itself omits, and ranking them together misleads.
  for (const e of errs) {
    if (e.keyword === "required" && e.value === "/" && e.property) missingReq.set(e.property, (missingReq.get(e.property) ?? 0) + 1);
    if (e.keyword === "additionalProperties" && e.value === "/" && e.property) extraProp.set(e.property, (extraProp.get(e.property) ?? 0) + 1);
  }
  per.push({ slug, ok, errors: errs.length, first: errs[0]?.message ?? "" });
}
const rank = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} (${n})`).join(", ");
report("CONFORMANCE", "VALID", conform === withContract.length ? "info" : "fail", `${conform}/${withContract.length} emitted contracts validate against ${pin.repo}`);
report("CONFORMANCE", "COVERAGE", withContract.length === slugs.length ? "info" : "warn", `${withContract.length}/${slugs.length} components emit a contract — the rest have no curated def yet`);
if (missingReq.size) report("CONFORMANCE", "MISSING_REQUIRED", "info", `required fields missing: ${rank(missingReq)}`);
if (extraProp.size) report("CONFORMANCE", "UNKNOWN_FIELDS", "info", `fields the schema forbids: ${rank(extraProp)}`);

// ── output ───────────────────────────────────────────────────────────────────
const icon = { fail: "✖", warn: "⚠", info: "·" };
for (const cls of ["DRIFT", "TRIPWIRE", "CONFORMANCE"]) {
  const rows = findings.filter((f) => f.cls === cls);
  if (!rows.length) continue;
  const worst = rows.some((r) => r.level === "fail") ? "FAIL" : rows.some((r) => r.level === "warn") ? "WARN" : "PASS";
  console.log(`${worst.padEnd(5)} ${cls}`);
  for (const r of rows) console.log(`  ${icon[r.level]} ${r.code.padEnd(22)} ${r.message}`);
}
if (detail) {
  console.log("\nPer spec:");
  for (const p of [...per].sort((a, b) => a.errors - b.errors)) console.log(`  ${p.ok ? "✓" : "✖"} ${p.slug.padEnd(28)} ${p.errors} errors`);
}
const failed = findings.some((f) => f.level === "fail");
console.log(`\n${failed ? "RED" : "OK"}: schema ${pin.files["contract.schema.json"].blobSha.slice(0, 7)} · golden ${golden.id} · ${conform}/${slugs.length} specs conform`);
process.exit(failed ? 1 : 0);
