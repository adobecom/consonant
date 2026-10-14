#!/usr/bin/env node
// validate-grid-contracts.mjs — the grid gate.
//
//   1. every <slug>.defs.json validates against contracts/grid-defs.schema.json
//   2. every generated out/<slug>.contract.json is fresh (byte equality)
//   3. every rule in every contract is executed against the evidence
//   4. the section-spacing scales are audited for inversions across all modes
//
// Writes out/grid-conformance.json (deterministic, no timestamps) and exits
// non-zero on any fail-severity rule. A layout rule nobody runs is a
// convention; this is what makes these contracts contracts.
//
//   node packages/grid/scripts/validate-grid-contracts.mjs [--slug=a,b] [--quiet]
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { buildAll, tokenTable, refToVar, ROOT } from "./build-grid-contracts.mjs";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTRACTS = join(ROOT, "packages", "grid", "contracts");
const EVIDENCE = join(ROOT, "packages", "grid", "evidence");
const OUT = join(ROOT, "packages", "grid", "out");
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const MODES = ["sm", "md", "lg", "xl"];

// ─── value resolution across both stylesheets ─────────────────────────────────
// A declaration inside a 1441 range may reference a custom property declared at
// the base, so resolution walks down to the nearest range at or below the one
// asking. Getting this wrong would make every rule look like it passed.
function makeResolver(code, tokens) {
  const gridProps = code.customProperties;
  const mediaMin = (m) => {
    if (!m) return 0;
    const q = code.mediaQueries.find((x) => x.query === m);
    return q?.minWidth ?? 0;
  };
  // Only :root declarations define the system's value for a custom property.
  // A class like .gutter-0 is an opt-in override, not the default, and counting
  // it made the gutter look like a literal 0 the first time this ran.
  const gridProp = (name, atMin, selector = ":root") => {
    const decls = (gridProps[name]?.declaredIn ?? []).filter((d) => d.selector === selector);
    let best = null;
    for (const d of decls) {
      const min = mediaMin(d.media);
      if (min <= atMin && (best === null || min >= mediaMin(best.media))) best = d;
    }
    return best?.value ?? null;
  };
  const toPx = (value, atMin, mode, seen = new Set()) => {
    if (value == null) return null;
    const v = String(value).trim();
    const m = /^var\((--[a-z0-9_-]+)/.exec(v);
    if (m) {
      const name = m[1];
      if (seen.has(name)) return null;
      seen.add(name);
      const fromGrid = gridProp(name, atMin);
      if (fromGrid != null) return toPx(fromGrid, atMin, mode, seen);
      return tokens.resolve(name, mode);
    }
    const px = /^(-?[\d.]+)px$/.exec(v);
    if (px) return Number(px[1]);
    if (/^-?[\d.]+$/.test(v)) return Number(v);
    return v;
  };
  return { mediaMin, gridProp, toPx };
}

// Pick the declaration block for a class in the range starting at `min`.
// Returns the nearest match too, so a failure can say what is actually there.
function classAt(code, name, min) {
  const decls = code.classes[name]?.declaredIn ?? [];
  const mins = decls.map((d) => {
    const q = d.media ? code.mediaQueries.find((x) => x.query === d.media) : null;
    return { d, min: d.media ? (q?.minWidth ?? null) : 0 };
  });
  const want = min ?? 0;
  const exact = mins.filter((x) => x.min === want);
  if (exact.length) return { hit: exact, nearest: null };
  const nearest = mins.slice().sort((a, b) => Math.abs((a.min ?? 1e9) - want) - Math.abs((b.min ?? 1e9) - want))[0] ?? null;
  return { hit: [], nearest };
}

// ─── the checks ───────────────────────────────────────────────────────────────
function runCheck(rule, ctx) {
  const { code, figma, tokens, resolver } = ctx;
  const c = rule.check;
  const ok = (detail) => ({ status: "pass", detail });
  const no = (detail) => ({ status: "fail", detail });

  switch (c.type) {
    case "manual":
      return { status: "manual", detail: c.note ?? "Requires a person to confirm." };

    case "mediaQueryPresent": {
      const found = code.mediaQueries.filter((q) => q.minWidth === c.minWidth);
      if (found.length) return ok(`${found.length} range(s) begin at ${c.minWidth}px: ${found.map((f) => f.query).join(" · ")}`);
      const near = code.mediaQueries.map((q) => q.minWidth).filter((n) => n != null).sort((a, b) => Math.abs(a - c.minWidth) - Math.abs(b - c.minWidth))[0];
      return no(`the stylesheet declares no range beginning at ${c.minWidth}px; nearest is ${near}px`);
    }

    case "boundaryAgreement": {
      const tb = code.tokenBoundaries?.[c.breakpoint];
      const cssHit = code.mediaQueries.some((q) => q.minWidth === c.expected);
      if (!tb) return no(`no shipped token file for the ${c.breakpoint} range`);
      const tokenMin = tb.minWidth;
      if (c.expected == null) {
        return tokenMin == null ? ok(`${c.breakpoint} carries no media query in either place`) : no(`token file declares ${tokenMin}px where the contract expects no query`);
      }
      if (tokenMin === c.expected && cssHit) return ok(`both begin at ${c.expected}px`);
      if (tokenMin !== c.expected && !cssHit) return no(`neither agrees: token file begins at ${tokenMin}px, the grid stylesheet has no ${c.expected}px range`);
      if (!cssHit) {
        const near = code.mediaQueries.map((q) => q.minWidth).filter((n) => n != null).sort((a, b) => Math.abs(a - c.expected) - Math.abs(b - c.expected))[0];
        return no(`${tb.file} begins at ${tokenMin}px but the grid stylesheet begins this range at ${near}px — a layout at ${Math.min(near, tokenMin)}px takes its columns from one range and its spacing from the other`);
      }
      return no(`the grid stylesheet begins at ${c.expected}px but ${tb.file} begins at ${tokenMin}px`);
    }

    case "classPresent":
      return code.classes[c.name] ? ok(`.${c.name} is declared in ${code.classes[c.name].declaredIn.length} block(s)`) : no(`.${c.name} is not in the stylesheet`);

    case "classAbsent":
      return code.classes[c.name] ? no(`.${c.name} exists but this contract expects it not to yet`) : ok(`.${c.name} is absent, as the contract states`);

    case "customPropertyEquals": {
      const prop = code.customProperties[c.name];
      if (c.expect === "absent") return prop ? no(`${c.name} exists but the contract expects it not to yet`) : ok(`${c.name} is absent, as the contract states`);
      if (!prop) return no(`${c.name} is not declared anywhere in the stylesheet`);
      const atMin = c.media ?? 0;
      const raw = resolver.gridProp(c.name, atMin, c.selector ?? ":root");
      if (raw == null) {
        const where = [...new Set(prop.declaredIn.map((d) => d.selector))].join(", ");
        return no(`${c.name} has no ${c.selector ?? ":root"} declaration in a range at or below ${atMin}px (declared on: ${where})`);
      }
      const px = resolver.toPx(raw, atMin, c.media ? (c.media >= 1441 ? "xl" : c.media >= 1280 ? "lg" : "md") : "sm");
      if (c.requireToken && !/^var\(/.test(String(raw).trim())) return no(`${c.name} is the literal ${raw} where the contract requires a token reference`);
      return px === c.expectedPx ? ok(`${c.name} = ${raw}${/^var\(/.test(String(raw)) ? ` → ${px}` : ""}`) : no(`${c.name} resolves to ${px}, expected ${c.expectedPx} (declared as ${raw})`);
    }

    case "declarationEquals": {
      const { hit, nearest } = classAt(code, c.class, c.media);
      if (!hit.length) {
        if (!code.classes[c.class]) return no(`.${c.class} is not in the stylesheet`);
        const n = nearest;
        const nearVal = n?.d?.declarations?.[c.property];
        return no(`.${c.class} has no block in a range beginning at ${c.media ?? 0}px; nearest is ${n?.min ?? "?"}px${nearVal ? ` where ${c.property} is ${nearVal}` : ""}`);
      }
      const decl = hit.map((x) => x.d.declarations[c.property]).find((v) => v != null);
      if (decl == null) return no(`.${c.class} at ${c.media ?? 0}px does not set ${c.property}`);
      if (c.expectedComputed) return /^calc\(/.test(decl) ? ok(`${c.property} is computed: ${decl}`) : no(`${c.property} is ${decl}, expected a calc() derived from the grid`);
      if (c.expectedValue != null) return decl === c.expectedValue ? ok(`${c.property} = ${decl}`) : no(`${c.property} is ${decl}, expected ${c.expectedValue}`);
      const mode = (c.media ?? 0) >= 1441 ? "xl" : (c.media ?? 0) >= 1280 ? "lg" : (c.media ?? 0) >= 768 ? "md" : "sm";
      const px = resolver.toPx(decl, c.media ?? 0, mode);
      return px === c.expectedPx ? ok(`${c.property} = ${decl}${/^var\(/.test(decl) ? ` → ${px}` : ""}`) : no(`${c.property} resolves to ${px}, expected ${c.expectedPx} (declared as ${decl})`);
    }

    case "tokenShipped": {
      const v = refToVar(c.ref);
      if (!tokens.shipped(v)) return no(`${v} is not in the built token CSS`);
      const vals = MODES.map((m) => `${m}:${tokens.resolve(v, m)}`).join(" ");
      return ok(`${v} ships — ${vals}`);
    }

    case "figmaAgrees": {
      const e = figma.modes[c.mode]?.entries?.[c.figmaPath];
      if (!e) return no(`Figma mode ${c.mode} has no ${c.figmaPath}`);
      const actual = e.resolved ?? e.value;
      return actual === c.expected
        ? ok(`Figma ${c.mode}.${c.figmaPath} = ${actual}${e.alias ? ` (via ${e.alias})` : ""}`)
        : no(`Figma ${c.mode}.${c.figmaPath} is ${actual}, the contract claims ${c.expected}`);
    }

    default:
      return no(`unknown check type "${c.type}"`);
  }
}

// ─── the spacing scale audit ──────────────────────────────────────────────────
// section-spacing.defs.json claims the validator checks this; so it does.
const SCALE = ["none", "5xs", "4xs", "3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"];
function auditScales(figma) {
  const findings = [];
  for (const family of ["section-spacing", "viewport-vertical-padding"]) {
    for (const mode of MODES) {
      const entries = figma.modes[mode]?.entries ?? {};
      const steps = SCALE.map((s) => ({ step: s, px: entries[`${family}.${s}`]?.resolved })).filter((s) => typeof s.px === "number");
      for (let i = 1; i < steps.length; i++) {
        if (steps[i].px < steps[i - 1].px) {
          findings.push({
            family, mode,
            step: steps[i].step, previous: steps[i - 1].step,
            value: steps[i].px, previousValue: steps[i - 1].px,
            detail: `${family} ${steps[i].step} (${steps[i].px}) is smaller than ${steps[i - 1].step} (${steps[i - 1].px}) at ${mode}`,
          });
        }
      }
    }
  }
  return findings;
}

// ─── main ─────────────────────────────────────────────────────────────────────
const only = process.argv.find((a) => a.startsWith("--slug="))?.slice(7)?.split(",");
const quiet = process.argv.includes("--quiet");

const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true, strict: false });
const schema = readJson(join(CONTRACTS, "grid-defs.schema.json"));
const validateDefs = ajv.compile(schema);

const code = readJson(join(EVIDENCE, "grid.code.evidence.json"));
const figma = readJson(join(EVIDENCE, "grid.figma.evidence.json"));
if (!code || !figma) { console.error("grid evidence missing — run: npm run grid:evidence"); process.exit(2); }
const tokens = tokenTable();
const resolver = makeResolver(code, tokens);
const ctx = { code, figma, tokens, resolver };

const report = { $generated: { name: "s2a-grid-conformance", version: "1" }, schema: [], freshness: [], contracts: [], scaleFindings: auditScales(figma), totals: {} };

// 1. schema
const defsFiles = readdirSync(CONTRACTS).filter((f) => f.endsWith(".defs.json")).sort();
for (const f of defsFiles) {
  const slug = f.replace(/\.defs\.json$/, "");
  if (only && !only.includes(slug)) continue;
  const defs = readJson(join(CONTRACTS, f));
  const valid = validateDefs(defs);
  report.schema.push({
    slug, valid,
    errors: valid ? [] : validateDefs.errors.map((e) => `${e.instancePath || "/"} ${e.message}`),
  });
}

// 2. freshness
const { contracts, outputs } = buildAll(only);
for (const [file, content] of Object.entries(outputs)) {
  const rel = file.slice(ROOT.length + 1);
  const onDisk = existsSync(file) ? readFileSync(file, "utf8") : null;
  report.freshness.push({ file: rel, fresh: onDisk === content, reason: onDisk === null ? "missing" : onDisk === content ? null : "differs" });
}

// 3. rules
for (const contract of contracts) {
  const results = contract.rules.map((r) => {
    const outcome = runCheck(r, ctx);
    return { id: r.id, statement: r.statement, severity: r.severity, type: r.check.type, ...outcome };
  });
  report.contracts.push({
    slug: contract.slug, name: contract.name, kind: contract.kind, tier: contract.tier, status: contract.status,
    pass: results.filter((r) => r.status === "pass").length,
    fail: results.filter((r) => r.status === "fail" && r.severity === "fail").length,
    warn: results.filter((r) => r.status === "fail" && r.severity === "warn").length,
    manual: results.filter((r) => r.status === "manual").length,
    openDecisions: contract.decisions.filter((d) => d.state === "open").map((d) => ({ id: d.id, question: d.question, owner: d.owner ?? null })),
    rules: results,
  });
}

report.totals = {
  contracts: report.contracts.length,
  rules: report.contracts.reduce((n, c) => n + c.rules.length, 0),
  pass: report.contracts.reduce((n, c) => n + c.pass, 0),
  fail: report.contracts.reduce((n, c) => n + c.fail, 0),
  warn: report.contracts.reduce((n, c) => n + c.warn, 0),
  manual: report.contracts.reduce((n, c) => n + c.manual, 0),
  schemaInvalid: report.schema.filter((s) => !s.valid).length,
  stale: report.freshness.filter((f) => !f.fresh).length,
  openDecisions: report.contracts.reduce((n, c) => n + c.openDecisions.length, 0),
  scaleFindings: report.scaleFindings.length,
};

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "grid-conformance.json"), JSON.stringify(report, null, 2) + "\n");

if (!quiet) {
  const t = report.totals;
  for (const s of report.schema.filter((x) => !x.valid)) console.log(`SCHEMA_INVALID  ${s.slug}\n                ${s.errors.join("\n                ")}`);
  for (const f of report.freshness.filter((x) => !x.fresh)) console.log(`STALE           ${f.file} (${f.reason})`);
  for (const c of report.contracts) {
    const flag = c.fail ? "FAIL" : c.warn ? "warn" : "ok  ";
    console.log(`\n${flag}  ${c.slug}  [${c.kind}/${c.tier}/${c.status}]  ${c.pass} pass · ${c.fail} fail · ${c.warn} warn · ${c.manual} manual`);
    for (const r of c.rules.filter((x) => x.status === "fail")) {
      console.log(`      ${r.severity === "fail" ? "✗" : "!"} ${r.id}  ${r.detail}`);
    }
  }
  if (report.scaleFindings.length) {
    console.log(`\nscale findings:`);
    for (const f of report.scaleFindings) console.log(`      ! ${f.detail}`);
  }
  console.log(`\n${t.contracts} contracts · ${t.rules} rules · ${t.pass} pass · ${t.fail} fail · ${t.warn} warn · ${t.manual} manual · ${t.openDecisions} open decisions`);
  console.log(`report: packages/grid/out/grid-conformance.json`);
}

if (report.totals.schemaInvalid || report.totals.fail) process.exit(1);
