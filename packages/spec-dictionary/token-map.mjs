#!/usr/bin/env node
// token-map.mjs — every Spectrum 2 token against S2A, as a file.
//
//   npm run tokens:map            write lib/token-map.json
//   npm run tokens:map -- --check fail if the file is stale, write nothing
//
// Reads the two token builds and the judgment file lib/token-map.roles.json.
// Each Spectrum token lands in one bucket:
//
//   alias   same value, same kind of thing: renders as var(--s2a-*)
//   decide  a near match exists but the value or the role is in question:
//           renders as Spectrum's literal until someone answers in the roles file
//   adopt   S2A has nothing like it (motion, component heights, status hues):
//           renders as Spectrum's literal
//   unresolved  a component stylesheet points at a name nothing declares; there is
//           no value to carry, so a contract binding one is refused at render
//
// plus the reverse list, `ours`: S2A names nothing in Spectrum maps to.
//
// Two rules decide everything else. A colour only aliases through a row in the
// roles file, because equal values do not imply equal roles. A primitive is never
// a target, because components only use semantic tokens; a primitive that matches
// exactly is offered as a candidate on a decide row.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SYSTEMS, slugsOf, ROOT } from "./systems.mjs";
import { isPrimitive } from "./lib/renderers/semantic-tokens.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "lib", "token-map.json");
const ROLES = JSON.parse(readFileSync(join(HERE, "lib", "token-map.roles.json"), "utf8")).roles;
const MILO_TOKENS = join(ROOT, "context", "milo", "libs", "c2", "styles", "s2a-tokens.css");

// ---- evaluating a value, per colour scheme and density ----------------------

/** Replace every call of fn(...) in a string, with balanced parentheses. */
function replaceCalls(str, fn, make) {
  let out = "", i = 0;
  for (;;) {
    const at = str.indexOf(`${fn}(`, i);
    if (at < 0) return out + str.slice(i);
    let depth = 0, j = at + fn.length, comma = -1;
    for (; j < str.length; j++) {
      if (str[j] === "(") depth++;
      else if (str[j] === ")" && --depth === 0) break;
      else if (str[j] === "," && depth === 1 && comma < 0) comma = j;
    }
    const a = comma < 0 ? str.slice(at + fn.length + 1, j) : str.slice(at + fn.length + 1, comma);
    const b = comma < 0 ? null : str.slice(comma + 1, j);
    out += str.slice(i, at) + make(a.trim(), b?.trim() ?? null);
    i = j + 1;
  }
}

function evaluator(files) {
  const raw = (name) => {
    for (const m of Object.values(files)) { const v = m.get(name); if (v !== undefined) return v; }
    return undefined;
  };
  // The component tier is read out of minified stylesheets, so a value can run on
  // into the next rule; a declaration ends at the first closing brace.
  const clean = (v) => String(v).split("}")[0].replace(/\s+/g, " ").trim();
  const ev = (name, mode, scale, depth = 0) => {
    const v = raw(name);
    if (v === undefined || depth > 16) return undefined;
    return evalValue(clean(v), mode, scale, depth);
  };
  const evalValue = (value, mode, scale, depth) => {
    let s = replaceCalls(value, "light-dark", (a, b) => (mode === "dark" ? b : a));
    s = replaceCalls(s, "var", (a, b) => {
      if (a === "--swc-theme--sizeM") return scale === "desktop" ? b ?? "" : "";
      if (a === "--swc-theme--sizeL") return scale === "mobile" ? b ?? "" : "";
      return ev(a, mode, scale, depth + 1) ?? (b ? evalValue(b, mode, scale, depth + 1) : `var(${a})`);
    });
    return s.includes("light-dark(") ? evalValue(s, mode, scale, depth + 1) : s.replace(/\s+/g, " ").trim();
  };
  return ev;
}

// ---- comparing values -------------------------------------------------------

/** A colour as r,g,b,a, or null if the string is not one colour. */
function colour(v) {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "transparent") return "0,0,0,0";
  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    const h = m[1].length <= 4 ? [...m[1]].map((c) => c + c).join("") : m[1];
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return `${n(0)},${n(2)},${n(4)},${h.length === 8 ? +(n(6) / 255).toFixed(2) : 1}`;
  }
  m = s.match(/^rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)\s*(?:[,/]\s*([\d.]+)(%?))?\s*\)$/);
  if (!m) return null;
  const a = m[4] === undefined ? 1 : m[5] ? +m[4] / 100 : +m[4];
  return `${m[1]},${m[2]},${m[3]},${+a.toFixed(2)}`;
}

/** A length in px, a bare number, or a percentage as a number; null otherwise. */
function number(v) {
  const s = String(v ?? "").trim();
  let m = s.match(/^(-?[\d.]+)(px|rem)?$/);
  if (m) return m[2] === "rem" ? +m[1] * 16 : +m[1];
  m = s.match(/^(-?[\d.]+)%$/);
  return m ? +m[1] / 100 : null;
}

const same = (a, b) => {
  const ca = colour(a), cb = colour(b);
  if (ca || cb) return ca === cb;
  const na = number(a), nb = number(b);
  if (na !== null && nb !== null && !/%/.test(String(a)) === !/%/.test(String(b))) return na === nb;
  if (na !== null && nb !== null) return na === nb;
  return String(a).replace(/["']/g, "").toLowerCase() === String(b).replace(/["']/g, "").toLowerCase();
};

// ---- categories -------------------------------------------------------------

function category(name, light) {
  const n = name.replace(/^--swc-/, "");
  if (/opacity/.test(n) && number(light) !== null) return "opacity";
  if (/font-family/.test(n)) return "font-family";
  if (/font-weight/.test(n)) return "font-weight";
  if (/line-height/.test(n)) return "line-height";
  if (/font-size/.test(n)) return "font-size";
  if (colour(light)) return "colour";
  if (/shadow|elevation/.test(n)) return "shadow";
  if (/animation|duration|easing|transition/.test(n)) return "motion";
  if (/corner-radius|border-radius/.test(n)) return "radius";
  if (/border-width|thickness|stroke-width/.test(n)) return "border-width";
  if (/padding|gap|spacing|margin|-to-|edge/.test(n) && number(light) !== null) return "spacing";
  if (/height|width|size|icon|aspect/.test(n)) return "sizing";
  return "other";
}

/** The S2A names a Spectrum category may alias to, semantic only. */
const FAMILY = {
  spacing: /^--s2a-spacing-/,
  radius: /^--s2a-border-radius-/,
  "border-width": /^--s2a-border-width-/,
  "font-size": /^--s2a-font-size-/,
  "line-height": /^--s2a-font-line-height-/,
  "font-weight": /^--s2a-font-weight-(body|label|heading)$/,
};
const PRIMITIVE_FAMILY = {
  spacing: /^--s2a-spacing-\d/, radius: /^--s2a-border-radius-\d/, "border-width": /^--s2a-border-width-\d/,
  "font-size": /^--s2a-font-size-\d/, "line-height": /^--s2a-font-line-height-\d/, opacity: /^--s2a-opacity-\d/,
  colour: /^--s2a-color-/,
};
// These colours belong to one component; offering them for a general Spectrum
// role would only add noise to the decide queue.
const COMPONENT_COLOUR = /^--s2a-color-(button|icon-?button|control|promo|merch|router)/;

// ---- build ------------------------------------------------------------------

export function buildMap() {
  const sp = SYSTEMS.spectrum.tokens(), s2 = SYSTEMS.s2a.tokens();
  const ev = evaluator(sp.files);
  const refFor = (n) => `{${n.slice(2).replace(/-/g, ".")}}`;
  const ours = [...s2.names].sort().map((name) => {
    const r = s2.resolve(refFor(name));
    return { name, light: r.value, dark: r.dark ?? r.value, primitive: isPrimitive(name) };
  });
  const byName = new Map(ours.map((o) => [o.name, o]));
  const inMilo = existsSync(MILO_TOKENS)
    ? new Set([...readFileSync(MILO_TOKENS, "utf8").matchAll(/(--s2a-[a-z0-9_-]+)\s*:/g)].map((m) => m[1]))
    : null;

  const usedBy = new Map();
  for (const slug of slugsOf(SYSTEMS.spectrum)) {
    const f = join(SYSTEMS.spectrum.src, slug, `${slug}.contract.json`);
    if (!existsSync(f)) continue;
    for (const m of readFileSync(f, "utf8").matchAll(/\{swc\.([a-z0-9.-]+)\}/g)) {
      const name = `--swc-${m[1].replace(/\./g, "-")}`;
      if (!usedBy.has(name)) usedBy.set(name, new Set());
      usedBy.get(name).add(slug);
    }
  }
  for (const name of Object.keys(ROLES)) {
    if (!sp.names.has(name)) throw new Error(`roles file names ${name}, which Spectrum does not ship`);
    if (!byName.has(ROLES[name].target)) throw new Error(`roles file targets ${ROLES[name].target}, which S2A does not ship`);
  }

  const targeted = new Set();
  const rows = [...sp.names].filter((n) => n.startsWith("--swc-") && !n.startsWith("--swc-theme")).sort().map((swc) => {
    const light = ev(swc, "light", "desktop"), dark = ev(swc, "dark", "desktop"), mobile = ev(swc, "light", "mobile");
    const cat = category(swc, light);
    if (/var\(/.test(light)) {
      return { swc, category: cat, outcome: "unresolved", target: null, light, literal: null, candidates: [], why: "Points at a name no Spectrum file declares.", usedBy: [...(usedBy.get(swc) ?? [])].sort() };
    }
    const row = {
      swc, category: cat, outcome: "adopt", target: null, light,
      ...(dark !== light ? { dark } : {}),
      ...(mobile !== light ? { mobile } : {}),
      literal: dark !== light ? `light-dark(${light}, ${dark})` : light,
      candidates: [], why: "",
      usedBy: [...(usedBy.get(swc) ?? [])].sort(),
    };
    const alias = (target, why) => { row.outcome = "alias"; row.target = target; row.why = why; targeted.add(target); };
    const flags = (target) => {
      const t = byName.get(target);
      if (row.dark && t && !same(row.dark, t.dark)) row.darkOurs = t.dark;
      if (row.mobile) row.mobileLost = true;
      row.ours = t?.light;
    };
    const role = ROLES[swc];
    if (role) {
      const t = byName.get(role.target);
      flags(role.target);
      if (role.decided === "ours") alias(role.target, `Decided: ours. ${role.why}`);
      else if (role.decided === "theirs") { row.outcome = "adopt"; row.why = `Decided: theirs. ${role.why}`; }
      else if (same(light, t.light)) alias(role.target, role.why);
      else { row.outcome = "decide"; row.candidates = [role.target]; row.why = role.why; targeted.add(role.target); }
      return row;
    }
    const primitives = ours.filter((o) => o.primitive && PRIMITIVE_FAMILY[cat]?.test(o.name) && same(light, o.light)).map((o) => o.name);
    if (cat === "colour") {
      const semantic = ours.filter((o) => !o.primitive && /^--s2a-color-/.test(o.name) && !COMPONENT_COLOUR.test(o.name) && same(light, o.light)).map((o) => o.name);
      row.candidates = [...semantic, ...primitives];
      if (row.candidates.length) { row.outcome = "decide"; row.why = "Same light value, role unconfirmed. Equal colours do not imply equal roles."; semantic.forEach((n) => targeted.add(n)); }
      else row.why = "S2A has no colour with this value.";
      return row;
    }
    const family = FAMILY[cat];
    if (family) {
      const peers = ours.filter((o) => family.test(o.name) && !o.primitive);
      const exact = peers.find((o) => same(light, o.light));
      if (exact) { flags(exact.name); alias(exact.name, `Same ${cat} value.`); return row; }
      const n = number(light);
      if (n !== null) {
        const near = peers.filter((o) => number(o.light) !== null).sort((a, b) => Math.abs(number(a.light) - n) - Math.abs(number(b.light) - n)).slice(0, 2).map((o) => o.name);
        row.outcome = "decide"; row.candidates = [...primitives, ...near];
        row.why = primitives.length ? "S2A has this value only as a primitive, which components may not use." : "No S2A step at this value; the nearest two are listed.";
        return row;
      }
    }
    if (primitives.length) { row.outcome = "decide"; row.candidates = primitives; row.why = "S2A has this value only as a primitive, which components may not use."; return row; }
    row.why = cat === "shadow" ? "Three-layer stacks there, single layers here; settle when a contract first binds one."
      : cat === "motion" ? "S2A has no motion tokens." : cat === "sizing" ? "S2A has no component size tokens." : "S2A has nothing like it.";
    return row;
  });

  const oursOnly = ours.filter((o) => !o.primitive && !targeted.has(o.name) && !COMPONENT_COLOUR.test(o.name)).map((o) => o.name);
  const count = (list, key) => list.reduce((acc, r) => { acc[r[key]] = (acc[r[key]] ?? 0) + 1; return acc; }, {});
  const used = rows.filter((r) => r.usedBy.length);
  const aliasMissingInMilo = inMilo ? [...new Set(used.filter((r) => r.outcome === "alias" && !inMilo.has(r.target)).map((r) => r.target))] : null;
  return {
    $comment: "Generated by token-map.mjs. Do not edit; answer decisions in token-map.roles.json and re-run.",
    summary: {
      all: count(rows, "outcome"),
      usedByContracts: count(used, "outcome"),
      byCategory: Object.fromEntries(Object.entries(count(rows, "category")).map(([cat]) => [cat, count(rows.filter((r) => r.category === cat), "outcome")])),
      oursOnly: oursOnly.length,
      aliasTargetsMissingFromMilo: aliasMissingInMilo,
    },
    rows,
    oursOnly,
  };
}

/** One row per line, so a change to one token is a one-line diff. */
const serialise = (map) => {
  const { rows, oursOnly, ...head } = map;
  const lines = JSON.stringify(head, null, 2).replace(/\n}$/, "");
  return `${lines},\n  "rows": [\n${rows.map((r) => `    ${JSON.stringify(r)}`).join(",\n")}\n  ],\n  "oursOnly": ${JSON.stringify(oursOnly)}\n}\n`;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const text = serialise(buildMap());
  if (process.argv.includes("--check")) {
    if (!existsSync(OUT) || readFileSync(OUT, "utf8") !== text) { console.error("token-map.json is stale; run npm run tokens:map"); process.exit(1); }
    console.log("token-map.json is fresh.");
  } else {
    writeFileSync(OUT, text);
    console.log(JSON.stringify(JSON.parse(text).summary, null, 2));
  }
}
