#!/usr/bin/env node
// build-grid-contracts.mjs — the grid contract transform.
//
//   <slug>.defs.json (judgment) + grid.code.evidence.json + grid.figma.evidence.json
//      ──▶ out/<slug>.contract.json          the contract, with every token and
//                                            breakpoint resolved to real numbers
//      ──▶ out/grid-contracts.index.json     one row per contract, for the gate,
//                                            the plugin badge and Storybook
//
// Outputs carry no timestamps, so freshness is byte equality and --check names
// the file that differs. Storybook reads these files directly: a visualization
// built from the contract cannot drift from the rules it illustrates.
//
//   node packages/grid/scripts/build-grid-contracts.mjs [--slug=a,b] [--check]
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, "..", "..", "..");
const CONTRACTS = join(ROOT, "packages", "grid", "contracts");
const EVIDENCE = join(ROOT, "packages", "grid", "evidence");
const OUT = join(ROOT, "packages", "grid", "out");
const TOKEN_CSS = join(ROOT, "dist", "packages", "tokens", "css", "dev");
export const GENERATOR = { name: "s2a-grid-contract-transform", version: "1" };

const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const sha = (s) => "sha256:" + createHash("sha256").update(s).digest("hex");
const canonical = (v) =>
  Array.isArray(v) ? `[${v.map(canonical).join(",")}]`
  : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canonical(v[k])).join(",")}}`
  : JSON.stringify(v ?? null);

export const slugs = () =>
  readdirSync(CONTRACTS).filter((f) => f.endsWith(".defs.json")).map((f) => f.replace(/\.defs\.json$/, "")).sort();

// ─── token resolution ─────────────────────────────────────────────────────────
// {s2a.spacing.lg} → --s2a-spacing-lg → 24. Follows var() chains, and reports
// the value per responsive file so a token that changes by breakpoint shows all
// four of its faces instead of only the one that happened to be read first.
export function tokenTable() {
  const perFile = new Map();
  if (existsSync(TOKEN_CSS)) {
    for (const f of readdirSync(TOKEN_CSS).filter((n) => n.endsWith(".css"))) {
      const map = new Map();
      for (const m of readFileSync(join(TOKEN_CSS, f), "utf8").matchAll(/(--s2a-[a-z0-9_-]+)\s*:\s*([^;]+);/g)) {
        map.set(m[1], m[2].trim());
      }
      perFile.set(f, map);
    }
  }
  const base = ["tokens.primitives.css", "tokens.semantic.css", "tokens.semantic.light.css"];
  const modeFile = { sm: "tokens.responsive.sm.css", md: "tokens.responsive.md.css", lg: "tokens.responsive.lg.css", xl: "tokens.responsive.xl.css" };

  const lookup = (name, mode) => {
    const order = [modeFile[mode], ...base, ...[...perFile.keys()]].filter(Boolean);
    for (const f of order) {
      const v = perFile.get(f)?.get(name);
      if (v != null) return v;
    }
    return null;
  };
  const resolve_ = (name, mode, seen = new Set()) => {
    if (seen.has(name)) return null;
    seen.add(name);
    const raw = lookup(name, mode);
    if (raw == null) return null;
    const v = /var\((--[a-z0-9_-]+)/.exec(raw);
    if (v) return resolve_(v[1], mode, seen);
    const n = /^(-?[\d.]+)px$/.exec(raw);
    return n ? Number(n[1]) : raw;
  };
  const shipped = (name) => [...perFile.values()].some((m) => m.has(name));
  return { resolve: resolve_, shipped };
}

export const refToVar = (ref) => "--" + ref.slice(1, -1).replace(/\./g, "-");

// ─── transform ────────────────────────────────────────────────────────────────
export function buildOne(slug, ctx) {
  const { code, figma, tokens, foundation } = ctx;
  const defsRaw = readJson(join(CONTRACTS, `${slug}.defs.json`));
  if (!defsRaw) throw new Error(`${slug}: no defs.json`);

  const breakpoints = (defsRaw.breakpoints ?? foundation?.breakpoints ?? []).map((bp) => {
    const declared = code.mediaQueries.find((q) => q.minWidth === bp.minWidth) ?? null;
    const tokenBoundary = code.tokenBoundaries?.[bp.id] ?? null;
    // When the stylesheet has no range at this boundary, say what it does have.
    // "stylesheet — vs tokens 1441px" tells nobody anything; "1440 vs 1441" does.
    const nearest = bp.minWidth == null ? null
      : code.mediaQueries
          .filter((q) => q.minWidth != null)
          .sort((a, b) => Math.abs(a.minWidth - bp.minWidth) - Math.abs(b.minWidth - bp.minWidth))[0] ?? null;
    return {
      ...bp,
      gutterPx: tokens.resolve("--s2a-spacing-xs", bp.id),
      stylesheet: declared ? { mediaQuery: declared.query, minWidth: declared.minWidth } : null,
      stylesheetNearest: declared ? null : nearest ? { mediaQuery: nearest.query, minWidth: nearest.minWidth } : null,
      tokenFile: tokenBoundary,
      boundaryAgrees: bp.minWidth == null ? tokenBoundary?.minWidth == null : tokenBoundary?.minWidth === bp.minWidth && declared?.minWidth === bp.minWidth,
      inherited: !defsRaw.breakpoints,
    };
  });

  const resolvedTokens = (defsRaw.tokens ?? []).map((t) => {
    const cssVar = refToVar(t.ref);
    return {
      ...t,
      cssVar,
      shipped: tokens.shipped(cssVar),
      values: Object.fromEntries(["sm", "md", "lg", "xl"].map((m) => [m, tokens.resolve(cssVar, m)])),
    };
  });

  const classes = (defsRaw.surface?.classes ?? []).map((c) => {
    const found = code.classes[c.name] ?? null;
    return {
      ...c,
      expect: c.expect ?? "present",
      present: Boolean(found),
      declaredIn: found ? found.declaredIn.map((d) => ({ media: d.media, declarations: d.declarations })) : [],
    };
  });

  const customProperties = (defsRaw.surface?.customProperties ?? []).map((p) => {
    const found = code.customProperties[p.name] ?? null;
    return {
      ...p,
      expect: p.expect ?? "present",
      present: Boolean(found),
      declaredIn: found ? found.declaredIn.map((d) => ({ media: d.media, selector: d.selector, value: d.value })) : [],
    };
  });

  // The design side, narrowed to the modes and paths this contract cites. A
  // contract that carried the whole collection would hide which values it needs.
  const citedPaths = new Set();
  for (const r of defsRaw.rules) if (r.check?.figmaPath) citedPaths.add(r.check.figmaPath);
  const design = {
    collectionId: figma.collectionId,
    designOnly: defsRaw.anchors?.figma?.designOnly ?? null,
    values: Object.fromEntries(
      [...citedPaths].sort().map((path) => [
        path,
        Object.fromEntries(["sm", "md", "lg", "xl"].map((m) => {
          const e = figma.modes[m]?.entries?.[path];
          return [m, e ? { value: e.value, alias: e.alias, resolved: e.resolved, designOnly: e.designOnly } : null];
        })),
      ])
    ),
  };

  const body = {
    id: `s2a.grid.${slug}`,
    slug,
    name: defsRaw.name,
    version: defsRaw.version ?? "0.1.0",
    kind: defsRaw.kind,
    tier: defsRaw.tier,
    status: defsRaw.status,
    supersededBy: defsRaw.supersededBy ?? null,
    description: defsRaw.description,
    anchors: defsRaw.anchors,
    breakpoints,
    breakpointBehavior: defsRaw.breakpointBehavior ?? [],
    tokens: resolvedTokens,
    surface: { classes, customProperties },
    design,
    rules: defsRaw.rules.map((r) => ({ id: r.id, statement: r.statement, severity: r.severity, check: r.check })),
    decisions: defsRaw.decisions,
    visualize: defsRaw.visualize ?? { demo: "none" },
  };
  return {
    $generated: GENERATOR,
    ...body,
    provenance: {
      defs: sha(canonical(defsRaw)),
      code: code.provenance.hash,
      figma: figma.provenance.hash,
      contract: sha(canonical(body)),
    },
  };
}

export function buildAll(only) {
  const code = readJson(join(EVIDENCE, "grid.code.evidence.json"));
  const figma = readJson(join(EVIDENCE, "grid.figma.evidence.json"));
  if (!code || !figma) throw new Error("grid evidence missing — run: npm run grid:evidence");
  const tokens = tokenTable();
  const foundation = readJson(join(CONTRACTS, "grid-foundation.defs.json"));
  const ctx = { code, figma, tokens, foundation };
  const list = (only ?? slugs()).filter((s) => existsSync(join(CONTRACTS, `${s}.defs.json`)));
  const contracts = list.map((s) => buildOne(s, ctx));

  const index = {
    $generated: GENERATOR,
    collection: "s2a-grid-contracts",
    count: contracts.length,
    breakpoints: (foundation?.breakpoints ?? []).map((b) => ({ id: b.id, label: b.label, minWidth: b.minWidth, maxWidth: b.maxWidth, columns: b.columns })),
    contracts: contracts.map((c) => ({
      id: c.id, slug: c.slug, name: c.name, kind: c.kind, tier: c.tier, status: c.status, version: c.version,
      rules: c.rules.length,
      openDecisions: c.decisions.filter((d) => d.state === "open").length,
      demo: c.visualize?.demo ?? "none",
      hash: c.provenance.contract,
    })),
  };

  const outputs = {};
  for (const c of contracts) outputs[join(OUT, `${c.slug}.contract.json`)] = JSON.stringify(c, null, 2) + "\n";
  if (!only) outputs[join(OUT, "grid-contracts.index.json")] = JSON.stringify(index, null, 2) + "\n";
  return { contracts, index, outputs };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const only = process.argv.find((a) => a.startsWith("--slug="))?.slice(7)?.split(",");
  const check = process.argv.includes("--check");
  mkdirSync(OUT, { recursive: true });
  const { outputs, contracts } = buildAll(only);
  let stale = 0;
  for (const [file, content] of Object.entries(outputs)) {
    const rel = file.slice(ROOT.length + 1);
    const onDisk = existsSync(file) ? readFileSync(file, "utf8") : null;
    if (check) {
      if (onDisk !== content) { console.error(`stale  ${rel}`); stale++; }
    } else {
      if (onDisk !== content) writeFileSync(file, content);
      console.log(`${onDisk === content ? "same " : "wrote"}  ${rel}`);
    }
  }
  if (check) {
    if (stale) { console.error(`\n${stale} generated file(s) stale — run: npm run grid:build`); process.exit(1); }
    console.log(`fresh  ${contracts.length} grid contracts`);
  }
}
