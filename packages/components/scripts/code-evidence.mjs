#!/usr/bin/env node
// code-evidence.mjs — code evidence for one or more S2A components.
//
// The components are Lit templates, so there is no compiler prop surface to
// extract. Evidence comes from two deterministic reads instead:
//   static   the component source: the exported render function's destructured
//            props and defaults, data-* attributes and classes in the template,
//            ARIA usage, the stylesheet's selectors (states, attributes, parts),
//            --s2a-* token references, custom properties, raw values, queries,
//            and sha256 of every source file.
//   runtime  every Storybook story for the component, rendered from the static
//            build: story args, the rendered root, observed data-* values and
//            classes, interactive elements with their accessible names.
// Output: packages/components/src/<slug>/<slug>.code.evidence.json
// (schema s2a-code-evidence/1). A file whose hash is unchanged is left alone.
//
//   node packages/components/scripts/code-evidence.mjs --slug=quote-card,button
//   node packages/components/scripts/code-evidence.mjs --all --static-only
//   --storybook=<dir>   static build to render (default storybook-static)
//   --storybook-url=<url>   a running Storybook instead of the static build
//   --dry-run           report without writing evidence files
// See docs/future-notes/s2a-contract-system-plan.md (step 2).
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import postcss from "postcss";
import { createHash } from "node:crypto";
import { join, dirname, resolve, extname, relative, sep} from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

export const EVIDENCE_SCHEMA = "s2a-code-evidence/1";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..", "..");
const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const has = (name) => args.includes(`--${name}`);
// Which component tree, and whose tokens. Both default to S2A, so every existing
// call is unchanged; a second design system passes its own.
//   --root=packages/spectrum2/src --ns=spectrum
const SRC = resolve(ROOT, flag("root") ?? join("packages", "components", "src"));
const NS = flag("ns") ?? "s2a";
// Evidence records repo-relative paths; the gate re-reads them to decide freshness,
// so they have to follow --root rather than name one tree.
const REL = relative(ROOT, SRC).split(sep).join("/");

const sha256 = (text) => "sha256:" + createHash("sha256").update(text).digest("hex");
const alnum = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
export function canonicalJson(value) {
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.keys(value).sort().map((k) => JSON.stringify(k) + ":" + canonicalJson(value[k])).join(",") + "}";
  return JSON.stringify(value === undefined ? null : value);
}
const uniq = (list) => [...new Set(list)].sort();

// ── Static: JavaScript ────────────────────────────────────────────────────────

// Split a destructuring pattern body on top-level commas, respecting nesting
// and strings, so `{ a = "x", b = [], c = { d: 1 } }` yields three entries.
function splitTopLevel(body) {
  const out = []; let depth = 0, quote = null, cur = "";
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (quote) { cur += ch; if (ch === quote && body[i - 1] !== "\\") quote = null; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; cur += ch; continue; }
    if ("([{".includes(ch)) depth++;
    if (")]}".includes(ch)) depth--;
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

export function parseExports(js) {
  const names = new Set();
  for (const m of js.matchAll(/export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of js.matchAll(/export\s*\{([^}]+)\}/g)) for (const part of m[1].split(",")) { const n = part.trim().split(/\s+as\s+/).pop(); if (n) names.add(n); }
  return [...names].sort();
}

// The render function: `export const Name = ({ ...props } = {}) =>` or
// `export function Name({ ...props } = {})`. Returns props with default source.
export function parseProps(js, preferredName) {
  const candidates = [];
  const re = /export\s+(?:const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(?\s*\{|function\s+([A-Za-z_$][\w$]*)\s*\(\s*\{)/g;
  let m;
  while ((m = re.exec(js))) {
    const name = m[1] || m[2];
    const start = js.indexOf("{", m.index + m[0].length - 1);
    let depth = 0, end = -1;
    for (let i = start; i < js.length; i++) { if (js[i] === "{") depth++; else if (js[i] === "}") { depth--; if (depth === 0) { end = i; break; } } }
    if (end < 0) continue;
    const body = js.slice(start + 1, end);
    const props = splitTopLevel(body).map((entry) => {
      const rest = entry.match(/^\.\.\.\s*([\w$]+)/);
      if (rest) return { name: rest[1], rest: true };
      const eq = entry.indexOf("=");
      const colon = entry.indexOf(":");
      let name = (eq > -1 ? entry.slice(0, eq) : entry).trim();
      if (colon > -1 && (eq === -1 || colon < eq)) name = entry.slice(0, colon).trim(); // { a: b = 1 } keeps the public key
      const def = eq > -1 ? entry.slice(eq + 1).trim() : undefined;
      const prop = { name };
      if (def !== undefined) {
        prop.default = def;
        if (/^["'`]/.test(def)) prop.type = "string";
        else if (def === "true" || def === "false") prop.type = "boolean";
        else if (/^-?\d/.test(def)) prop.type = "number";
        else if (def.startsWith("[")) prop.type = "array";
        else if (def.startsWith("{")) prop.type = "object";
        else if (/^\(|^function|=>/.test(def)) prop.type = "function";
        else prop.type = "expression";
      }
      return prop;
    });
    candidates.push({ name, props });
  }
  // Plain-parameter renders (`export function createButton(opts = {})`) read
  // their props as `opts.x` and `const { x = d } = opts` inside the body.
  const plain = /export\s+(?:function\s+([A-Za-z_$][\w$]*)\s*\(\s*([A-Za-z_$][\w$]*)\s*(?:=\s*\{\s*\})?\s*\)|const\s+([A-Za-z_$][\w$]*)\s*=\s*\(?\s*([A-Za-z_$][\w$]*)\s*(?:=\s*\{\s*\})?\s*\)?\s*=>)\s*\{/g;
  while ((m = plain.exec(js))) {
    const name = m[1] || m[3], param = m[2] || m[4];
    if (candidates.some((c) => c.name === name)) continue;
    const start = js.indexOf("{", m.index + m[0].length - 1);
    let depth = 0, end = js.length;
    for (let i = start; i < js.length; i++) { if (js[i] === "{") depth++; else if (js[i] === "}") { depth--; if (depth === 0) { end = i; break; } } }
    const body = js.slice(start + 1, end);
    const props = new Map();
    for (const dm of body.matchAll(new RegExp(`(?:const|let)\\s*\\{([^}]*)\\}\\s*=\\s*${param}\\b`, "g"))) {
      for (const entry of splitTopLevel(dm[1])) {
        const eq = entry.indexOf("=");
        const key = (eq > -1 ? entry.slice(0, eq) : entry).split(":")[0].trim().replace(/^\.\.\./, "");
        if (!key) continue;
        const def = eq > -1 ? entry.slice(eq + 1).trim() : undefined;
        props.set(key, def !== undefined ? { name: key, default: def, type: /^["'`]/.test(def) ? "string" : def === "true" || def === "false" ? "boolean" : /^-?\d/.test(def) ? "number" : def.startsWith("[") ? "array" : def.startsWith("{") ? "object" : "expression" } : { name: key });
      }
    }
    for (const rm of body.matchAll(new RegExp(`\\b${param}\\.([A-Za-z_$][\\w$]*)`, "g"))) if (!props.has(rm[1])) props.set(rm[1], { name: rm[1] });
    // JSDoc on the same function documents props that helpers read
    // (`@param {'a'|'b'} opts.style`); the annotation is the only typed surface.
    const doc = js.slice(Math.max(0, js.lastIndexOf("/**", m.index)), m.index);
    for (const jm of doc.matchAll(new RegExp(`@param\\s+\\{([^}]*)\\}\\s+\\[?${param}\\.([A-Za-z_$][\\w$]*)`, "g"))) {
      const prop = props.get(jm[2]) ?? { name: jm[2] };
      prop.jsdoc = jm[1].trim();
      if (!prop.type) prop.type = /\|/.test(jm[1]) && /'/.test(jm[1]) ? "enum" : jm[1].trim().toLowerCase();
      if (prop.type === "enum") prop.enum = [...jm[1].matchAll(/'([^']*)'/g)].map((e) => e[1]);
      props.set(jm[2], prop);
    }
    if (props.size) candidates.push({ name, props: [...props.values()], param });
  }
  if (!candidates.length) return { render: null, props: [] };
  const pick = candidates.find((c) => alnum(c.name) === alnum(preferredName)) ?? candidates.find((c) => alnum(c.name).includes(alnum(preferredName))) ?? candidates[0];
  return { render: pick.name, props: pick.props, otherRenders: candidates.filter((c) => c !== pick).map((c) => c.name) };
}

/**
 * The prop surface of a Lit web component, read from its shipped .d.ts.
 *
 * parseProps above reads a render function — `export const Button = ({...}) =>`.
 * A web component has none: the compiled class is minified and its properties
 * are installed by decorators, so that reader finds nothing and the contract
 * looks propless. The declaration file states each public property with its
 * type, and the sibling `.types.d.ts` states the exact set each type admits:
 *
 *   export declare const BUTTON_VARIANTS: readonly ["primary", "secondary", …];
 *   export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
 *   export declare class Button extends … { variant: ButtonVariant; }
 *
 * so `variant` comes back with its four values. A declaration file is part of
 * the package's published contract, which makes it better evidence than a
 * Storybook template — it cannot drift from the implementation without a
 * release. Properties marked `@internal`, and anything `protected`/`private`
 * or a method, are not public surface and are skipped.
 */
export function parseDts(dts) {
  const text = String(dts ?? "");
  // The enums first: a type alias pointing at a `readonly [...]` const.
  const consts = new Map();
  // `readonly` is usual but not universal: DIVIDER_VALID_SIZES is a plain tuple.
  for (const m of text.matchAll(/declare const (\w+)\s*:\s*(?:readonly )?\[([^\]]*)\]/g)) {
    // Members are quoted strings in most of these, but a numeric scale is
    // written bare — AVATAR_VALID_SIZES is `readonly [50, 75, 100, …]`. Reading
    // only the quoted ones lost the whole size axis, and the doc comment in
    // front of it then attached itself to the next property as a default.
    const values = [...m[2].matchAll(/["']([^"']+)["']|(-?\d+(?:\.\d+)?)/g)].map((v) => v[1] ?? v[2]);
    if (values.length) consts.set(m[1], values);
  }
  const aliases = new Map();
  for (const m of text.matchAll(/type (\w+)\s*=\s*\(typeof (\w+)\)\[number\]/g)) {
    if (consts.has(m[2])) aliases.set(m[1], consts.get(m[2]));
  }
  // Then the declared properties of every class in the file, base classes
  // included — they are vendored alongside precisely so inherited props count.
  const props = new Map();
  // Classes and the mixin interfaces they compose. A Lit component's public
  // surface is spread across both: `size` and `disabled` come from the base
  // class, `pending` from a mixin's interface.
  const blocks = [
    ...text.matchAll(/declare (?:abstract )?class \w+ extends [^{]*\{([\s\S]*?)\n\}/g),
    ...text.matchAll(/(?:export )?interface \w+(?:\s+extends [^{]*)?\s*\{([\s\S]*?)\n\}/g),
  ];
  for (const cls of blocks) {
    const body = cls[1];
    // An accessor pair is a property too: `get size(): AvatarSize;` with a
    // matching setter is how a reactive property with validation is declared,
    // and reading only `name: Type;` lost the whole size axis. Worse, the doc
    // comment in front of the getter then attached itself to the next real
    // property, so `outline` came back with the size's `@default 500`.
    for (const m of body.matchAll(/(\/\*\*(?:[^*]|\*(?!\/))*\*\/)?\s*((?:readonly|protected|private|abstract|static)\s+)*get\s+([A-Za-z_]\w*)\s*\(\s*\)\s*:\s*([^;{]+)[;{]/g)) {
      const [, doc = "", modifiers = "", name, rawType] = m;
      if (/@internal/.test(doc) || props.has(name)) continue;
      // `static get styles()` is the component's own stylesheet, and a
      // protected accessor like `hasIcon` is internal bookkeeping. Neither is
      // public surface a contract can bind to.
      if (/\b(static|protected|private)\b/.test(modifiers)) continue;
      const type = rawType.trim();
      const entry = { name };
      const values = aliases.get(type) ?? (type.match(/^\(typeof (\w+)\)\[number\]$/) ? consts.get(type.match(/^\(typeof (\w+)\)\[number\]$/)[1]) : undefined);
      if (values) { entry.type = "enum"; entry.values = values; }
      else entry.type = type === "boolean" || type === "string" || type === "number" ? type : type;
      const def = doc.match(/@default\s+(\S+)/)?.[1];
      if (def !== undefined) entry.default = def;
      const docLine = doc.replace(/\/\*\*|\*\//g, "").split("\n").map((l) => l.replace(/^\s*\*\s?/, "").trim())
        .filter((l) => l && !l.startsWith("@")).join(" ").trim();
      if (docLine) entry.description = docLine;
      props.set(name, entry);
    }
    // Walk declaration by declaration so the doc comment in front of each one
    // stays attached to it; `@internal` and `@default` both live there.
    for (const m of body.matchAll(/(\/\*\*(?:[^*]|\*(?!\/))*\*\/)?\s*((?:static|readonly|protected|private|abstract|declare)\s+)*([A-Za-z_]\w*)(\?)?\s*:\s*([^;=]+);/g)) {
      const [, doc = "", modifiers = "", name, optional, rawType] = m;
      if (/@internal/.test(doc)) continue;
      // Not public surface. `protected`/`private` sit between the doc comment
      // and the name, so an @internal tag on such a member can be missed if the
      // modifiers are not read — which is how slotPresence and slotText first
      // came through as props.
      if (/\b(protected|private|static)\b/.test(modifiers)) continue;
      // A method signature, not a property: `update(changed: PropertyValues): void`
      // parses as name `changed` with a type ending in `)`. The one legitimate
      // type with brackets is an inline enum, `(typeof ICON_VALID_SIZES)[number]`,
      // so that shape is allowed through and everything else with brackets is not.
      if (/[()]/.test(rawType) && !/^\(typeof \w+\)\[number\]$/.test(rawType.trim())) continue;
      const type = rawType.trim();
      if (!type) continue;
      // `size: BadgeSize` goes through the alias table; `size: (typeof
      // ICON_VALID_SIZES)[number]` names the const inline and needs no alias.
      const inline = type.match(/^\(typeof (\w+)\)\[number\]$/);
      const values = aliases.get(type) ?? (inline ? consts.get(inline[1]) : undefined);
      const entry = { name };
      if (values) { entry.type = "enum"; entry.values = values; }
      else if (type === "boolean") entry.type = "boolean";
      else if (type === "string") entry.type = "string";
      else if (type === "number") entry.type = "number";
      else entry.type = type;
      const def = doc.match(/@default\s+(\S+)/)?.[1];
      if (def !== undefined) entry.default = def;
      if (optional) entry.optional = true;
      const docLine = doc.replace(/\/\*\*|\*\//g, "").split("\n").map((l) => l.replace(/^\s*\*\s?/, "").trim())
        .filter((l) => l && !l.startsWith("@")).join(" ").trim();
      if (docLine) entry.description = docLine;
      props.set(name, entry);
    }
  }
  // The documented custom properties, which are the supported override seam.
  const cssProps = [...text.matchAll(/@cssprop\s+(--[\w-]+)/g)].map((m) => m[1]);
  // Slots, so a contract can check its own anatomy against them.
  const slots = [...text.matchAll(/@slot\s*(\S*)\s*-\s*([^\n*]+)/g)]
    .map((m) => ({ name: m[1] || "default", description: m[2].trim() }));
  const element = text.match(/@element\s+([\w-]+)/)?.[1] ?? null;
  return { props: [...props.values()], cssProps: uniq(cssProps), slots, element };
}

export function parseTemplate(js) {
  const attributes = {};
  for (const m of js.matchAll(/\bdata-([a-z][a-z0-9-]*)\s*=\s*("([^"]*)"|'([^']*)'|\$\{)/g)) {
    const name = "data-" + m[1];
    const entry = (attributes[name] ??= { values: new Set(), dynamic: false, sources: new Set() });
    entry.sources.add("template");
    const literal = m[3] ?? m[4];
    if (literal !== undefined && !literal.includes("${")) entry.values.add(literal); else entry.dynamic = true;
  }
  const classes = new Set();
  for (const m of js.matchAll(/\bclass\s*=\s*"([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (c && !c.includes("${")) classes.add(c);
  for (const m of js.matchAll(/\bclass\s*=\s*\$\{[^}]*?["'`]([^"'`$]+)["'`]/g)) for (const c of m[1].split(/\s+/)) if (c) classes.add(c);
  const roles = uniq([...js.matchAll(/\brole\s*=\s*"([^"]+)"/g)].map((m) => m[1]));
  const aria = uniq([...js.matchAll(/\b(aria-[a-z]+)\s*=/g)].map((m) => m[1]));
  const tags = uniq([...js.matchAll(/<(button|a|input|select|textarea|video|img|picture|ul|ol|nav|section|article|h[1-6])\b/g)].map((m) => m[1]));
  const imports = uniq([...js.matchAll(/^\s*import\s+[^"']*["']([^"']+)["']/gm)].map((m) => m[1]).filter((p) => p.startsWith(".")));
  return { attributes, classes: [...classes].sort(), roles, aria, tags, imports };
}

// ── Static: CSS ───────────────────────────────────────────────────────────────

const TOKEN_PROPS = /^(background(-color)?|color|border(-color|-top|-bottom|-left|-right)?|outline(-color)?|box-shadow|fill|stroke|font-size|padding(-[a-z-]+)?|margin(-[a-z-]+)?|gap|row-gap|column-gap|border-radius|border-(?:start|end)-(?:start|end)-radius)$/;

/**
 * The stylesheet as structure: every rule, with its selector, the at-rules it
 * sits inside, and its declarations in order.
 *
 * parseCss below reads the sheet as a bag — which token names appear, which
 * classes, which pseudo-states — and that was enough while the only consumer
 * was a conformance check. It is not enough to derive a contract. A contract
 * needs to know that `--swc-avatar-size-500` is set under `:host([size="500"])`,
 * that `outline` applies to `.swc-Avatar-image` only when `[outline]` is on the
 * host, that the 2px step lives under six size selectors. The bag loses all of
 * that, so for a library we did not write, four contracts had to be read out of
 * the CSS by hand. This keeps what the bag drops. Nothing the bag reported
 * changes; this is a field added beside it.
 *
 * postcss rather than regex because selectors nest, at-rules nest, values carry
 * commas and parentheses, and a minified Lit sheet puts a whole component on one
 * line. A parse failure is recorded, not thrown: the rest of the evidence is
 * still worth having.
 */
export function cssRules(css) {
  let root;
  try { root = postcss.parse(css); }
  catch (e) { return { rules: [], error: e instanceof Error ? e.message : String(e) }; }
  const rules = [];
  // A nested rule (`.a { &:hover {…} }`) is recorded flat, with `&` resolved,
  // so a reader never has to know the sheet was nested. Each alternative of the
  // parent list combines with each alternative of the child's.
  const resolved = (rule) => {
    const own = splitTop(rule.selector);
    const parent = rule.parent && rule.parent.type === "rule" ? resolved(rule.parent) : null;
    if (!parent) return own;
    const out = [];
    for (const p of parent) for (const c of own) out.push(c.includes("&") ? c.replace(/&/g, p) : `${p} ${c}`);
    return out;
  };
  root.walkRules((rule) => {
    const context = [];
    for (let p = rule.parent; p && p.type !== "root"; p = p.parent) {
      if (p.type === "atrule") context.unshift(`@${p.name}${p.params ? " " + p.params : ""}`);
    }
    const nested = rule.parent && rule.parent.type === "rule";
    const declarations = [];
    rule.each((node) => {
      if (node.type !== "decl") return;
      declarations.push({ prop: node.prop, value: node.value, ...(node.important ? { important: true } : {}) });
    });
    if (!declarations.length) return;
    rules.push({
      selector: nested ? resolved(rule).join(", ") : rule.selector,
      ...(nested ? { nestedIn: rule.parent.selector } : {}),
      ...(context.length ? { context } : {}),
      declarations,
    });
  });
  return { rules };
}

/** Split a selector list on top-level commas (parens and brackets protect). */
function splitTop(selector) {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of String(selector)) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export function parseCss(css, ns = "s2a") {
  const references = new Map();
  for (const m of css.matchAll(new RegExp(`var\\((--${ns}-[a-z0-9_-]+)\\s*(,)?`, "g"))) {
    const prev = references.get(m[1]);
    references.set(m[1], { fallback: (prev?.fallback ?? true) && Boolean(m[2]) });
  }
  const custom = uniq([...css.matchAll(/^\s*(--[a-z][a-z0-9-]*)\s*:/gm)].map((m) => m[1]));
  // Classes come from selectors only. A comment is prose, and prose has dots in
  // it — a licence header's apache.org yields "org", a note naming QuoteCard
  // yields a part that does not exist. The scaffolder learned this separately;
  // this is the same rule in the second place that needs it.
  const classes = uniq([...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
  const attributes = {};
  for (const m of css.matchAll(/\[(data-[a-z0-9-]+)(?:\s*[~|^$*]?=\s*"?([^"\]]*)"?)?\]/g)) {
    const entry = (attributes[m[1]] ??= { values: new Set(), dynamic: false, sources: new Set() });
    entry.sources.add("stylesheet");
    if (m[2]) entry.values.add(m[2]);
  }
  const states = uniq([...css.matchAll(/(:(?:hover|active|focus|focus-visible|focus-within|disabled|checked|visited)|\[(?:disabled|aria-[a-z]+|inert)[^\]]*\])/g)].map((m) => m[1]));
  const queries = uniq([...css.matchAll(/@(media|container|supports)\s*([^{]+)\{/g)].map((m) => `@${m[1]} ${m[2].trim()}`));
  const raw = [];
  const lines = css.split("\n");
  lines.forEach((line, i) => {
    const decl = line.match(/^\s*([a-z-]+)\s*:\s*(.+);/);
    if (!decl || !TOKEN_PROPS.test(decl[1])) return;
    const value = decl[2].replace(/var\([^()]*(?:\([^()]*\))*[^()]*\)/g, "");
    if (!/(#[0-9a-f]{3,8}\b|\brgba?\(|\b\d{2,}px\b)/i.test(value)) return;
    const context = lines.slice(Math.max(0, i - 6), i + 1).join("\n");
    if (/Primitive:|Figma|spec|golden|Milo|\d+:\d+/i.test(context)) return;
    raw.push({ line: i + 1, declaration: line.trim() });
  });
  const structured = cssRules(css);
  return { references: Object.fromEntries([...references].sort()), custom, classes, attributes, states, queries, raw,
    rules: structured.rules, ...(structured.error ? { rulesError: structured.error } : {}) };
}

// sources: template | stylesheet | runtime; onRoot marks attributes seen on
// the component's own root at runtime (the rest belong to nested components).
function mergeAttributes(...maps) {
  const out = {};
  for (const map of maps) for (const [name, entry] of Object.entries(map)) {
    const target = (out[name] ??= { values: new Set(), dynamic: false, sources: new Set(), onRoot: false });
    for (const v of entry.values) target.values.add(v);
    for (const s of entry.sources) target.sources.add(s);
    target.dynamic = target.dynamic || entry.dynamic;
    target.onRoot = target.onRoot || Boolean(entry.onRoot);
  }
  return Object.fromEntries(Object.keys(out).sort().map((k) => [k, { values: [...out[k].values].sort(), dynamic: out[k].dynamic, sources: [...out[k].sources].sort(), onRoot: out[k].onRoot }]));
}

// ── Component discovery ───────────────────────────────────────────────────────

export function listSlugs() {
  return readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.spec.json`)) || existsSync(join(SRC, d, `${d}.js`))).sort();
}

export function staticEvidence(slug) {
  const dir = join(SRC, slug);
  // spec.json is generated from this evidence (packages/spec-dictionary), so it is read
  // for identity but never hashed as a source: that would be circular.
  // .d.ts is hashed like any other source: for a web component it is where the
  // prop surface is read from, so an upstream release that changes it must show
  // up as stale evidence rather than pass unnoticed.
  const files = ["index.js", `${slug}.js`, `${slug}.css`, `${slug}.d.ts`].filter((f) => existsSync(join(dir, f)));
  const sources = Object.fromEntries(files.map((f) => [`${REL}/${slug}/${f}`, sha256(readFileSync(join(dir, f), "utf8"))]));
  const spec = existsSync(join(dir, `${slug}.spec.json`)) ? JSON.parse(readFileSync(join(dir, `${slug}.spec.json`), "utf8")) : null;
  const js = existsSync(join(dir, `${slug}.js`)) ? readFileSync(join(dir, `${slug}.js`), "utf8") : "";
  const css = existsSync(join(dir, `${slug}.css`)) ? readFileSync(join(dir, `${slug}.css`), "utf8") : "";
  const exports = parseExports(js);
  // Which export is the component. The definition says so outright when it
  // exists, and it is the only reliable answer when the export is not named
  // after the component — Spectrum's templates are all called `Template`, and
  // a name-based guess picks whichever helper happens to contain the word.
  const defsForName = existsSync(join(dir, `${slug}.defs.json`)) ? JSON.parse(readFileSync(join(dir, `${slug}.defs.json`), "utf8")) : null;
  const preferredExport = defsForName?.anchors?.code?.export ?? spec?.name ?? slug;
  let { render, props, otherRenders } = parseProps(js, preferredExport);
  const template = parseTemplate(js);
  const style = parseCss(css, NS);
  // A web component declares its props in its .d.ts, not in a render function.
  // Only consulted when the render reader found none, so nothing about an S2A
  // component changes.
  const dtsPath = join(dir, `${slug}.d.ts`);
  const declarations = !props?.length && existsSync(dtsPath) ? parseDts(readFileSync(dtsPath, "utf8")) : null;
  if (declarations?.props.length) {
    // Slots are part of the surface too. A web component takes its visible text
    // through a slot rather than a property — Spectrum 2's button has a default
    // slot documented as "Visible button label" — so a contract that binds a
    // label has something real to point `code.prop` at. Without this the only
    // way to render any text was a prop upstream does not have.
    props = [...declarations.props, ...declarations.slots.map((sl) => ({ name: sl.name, type: "slot", description: sl.description }))];
  }
  const cssClass = defsForName?.anchors?.code?.cssClass ?? spec?.cssClass ?? template.classes.find((c) => c.startsWith("c-")) ?? null;
  return {
    component: { slug, name: spec?.name ?? render ?? slug, cssClass, importPath: `${REL}/${slug}/${slug}.js`, exports, render, otherRenders: otherRenders ?? [], spec: spec ? { path: `packages/components/src/${slug}/${slug}.spec.json`, storybookId: spec.storybookId ?? null, figmaNodeId: spec.figmaNodeId ?? null } : null },
    sources,
    props,
    attributes: mergeAttributes(template.attributes, style.attributes),
    parts: { template: template.classes, stylesheet: style.classes },
    ...(declarations ? { declarations: { element: declarations.element, slots: declarations.slots, cssProps: declarations.cssProps } } : {}),
    aria: { roles: template.roles, attributes: template.aria, tags: template.tags },
    imports: template.imports,
    tokens: { references: style.references, custom: style.custom, raw: style.raw },
    // The sheet as rules, so a contract can be derived from the implementation
    // rather than only checked against it. See cssRules.
    stylesheet: { rules: style.rules, ...(style.rulesError ? { error: style.rulesError } : {}) },
    states: style.states,
    queries: style.queries,
  };
}

// ── Runtime: Storybook stories ────────────────────────────────────────────────

const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".mp4": "video/mp4" };
function serveStatic(dir) {
  const server = http.createServer((req, res) => {
    const file = join(dir, decodeURIComponent(req.url.split("?")[0]));
    try { const data = readFileSync(file); res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" }); res.end(data); }
    catch { res.writeHead(404); res.end(); }
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r({ url: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() })));
}

function storiesFor(index, evidence) {
  const entries = Object.values(index.entries).filter((e) => e.type === "story");
  const id = evidence.component.spec?.storybookId;
  const byId = id ? entries.filter((e) => e.id.startsWith(id + "--")) : [];
  if (byId.length) return byId;
  const name = alnum(evidence.component.name);
  return entries.filter((e) => alnum(e.title.split("/").pop()) === name);
}

async function runtimeEvidence(page, baseUrl, stories, cssClass) {
  const out = [];
  for (const story of stories) {
    await page.goto(`${baseUrl}iframe.html?id=${story.id}&viewMode=story`, { waitUntil: "load" });
    try { await page.locator("#storybook-root > *").first().waitFor({ timeout: 10000 }); } catch { out.push({ id: story.id, name: story.name, error: "nothing rendered" }); continue; }
    await page.waitForTimeout(150);
    const data = await page.evaluate((cssClass) => {
      const story = window.__STORYBOOK_PREVIEW__?.currentRender?.story;
      const rootEl = document.querySelector("#storybook-root");
      const root = (cssClass && rootEl.querySelector("." + cssClass)) || rootEl.firstElementChild;
      const all = root ? [root, ...root.querySelectorAll("*")] : [];
      const attributes = {}; const rootAttributes = {}; const classes = new Set(); const roles = new Set(); const aria = new Set(); const interactive = [];
      for (const el of all) {
        for (const c of el.classList) classes.add(c);
        for (const a of el.attributes) {
          if (a.name.startsWith("data-")) { (attributes[a.name] ??= new Set()).add(a.value); if (el === root) (rootAttributes[a.name] ??= new Set()).add(a.value); }
          if (a.name === "role") roles.add(a.value);
          if (a.name.startsWith("aria-")) aria.add(a.name);
        }
        if (el.matches("a[href], button, input, select, textarea, video, [tabindex], [role=button], [role=link]")) {
          const name = el.getAttribute("aria-label") || el.textContent.trim().replace(/\s+/g, " ").slice(0, 60);
          interactive.push({ tag: el.tagName.toLowerCase(), role: el.getAttribute("role"), name, disabled: el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true" });
        }
      }
      const ds = root ? Object.fromEntries(Object.entries(root.dataset)) : {};
      return {
        args: story?.initialArgs ?? null,
        root: root ? { tag: root.tagName.toLowerCase(), classes: [...root.classList], dataset: ds } : null,
        attributes: Object.fromEntries(Object.entries(attributes).map(([k, v]) => [k, [...v].sort()])),
        rootAttributes: Object.fromEntries(Object.entries(rootAttributes).map(([k, v]) => [k, [...v].sort()])),
        classes: [...classes].sort(), roles: [...roles].sort(), aria: [...aria].sort(), interactive, nodes: all.length,
      };
    }, cssClass);
    out.push({ id: story.id, name: story.name, ...data });
  }
  return out;
}

// ── Assemble ─────────────────────────────────────────────────────────────────

export function hashBody(evidence) {
  const { extractedAt, provenance, ...rest } = evidence;
  void extractedAt; void provenance;
  return sha256(canonicalJson(rest));
}

function summarize(evidence) {
  const runtimeAttrs = {};
  for (const s of evidence.stories ?? []) {
    for (const [k, v] of Object.entries(s.attributes ?? {})) for (const val of v) (runtimeAttrs[k] ??= { values: new Set(), dynamic: false, sources: new Set(["runtime"]), onRoot: false }).values.add(val);
    for (const k of Object.keys(s.rootAttributes ?? {})) if (runtimeAttrs[k]) runtimeAttrs[k].onRoot = true;
  }
  evidence.attributes = mergeAttributes(
    Object.fromEntries(Object.entries(evidence.attributes).map(([k, v]) => [k, { values: new Set(v.values), dynamic: v.dynamic, sources: new Set(v.sources), onRoot: v.onRoot }])),
    runtimeAttrs,
  );
  const observed = uniq((evidence.stories ?? []).flatMap((s) => s.classes ?? []));
  evidence.parts.runtime = observed;
  evidence.parts.own = uniq([...evidence.parts.template, ...observed].filter((c) => evidence.component.cssClass ? (c === evidence.component.cssClass || c.startsWith(evidence.component.cssClass + "__") || evidence.parts.stylesheet.includes(c)) : true));
  evidence.counts = {
    props: evidence.props.length, attributes: Object.keys(evidence.attributes).length, parts: evidence.parts.own.length,
    tokenReferences: Object.keys(evidence.tokens.references).length, tokenReferencesWithoutFallback: Object.values(evidence.tokens.references).filter((r) => !r.fallback).length,
    raw: evidence.tokens.raw.length, stories: (evidence.stories ?? []).length, storiesWithErrors: (evidence.stories ?? []).filter((s) => s.error).length,
  };
}

async function main() {
  const slugs = has("all") ? listSlugs() : (flag("slug") ?? "quote-card,social-proof-carousel").split(",").map((s) => s.trim()).filter(Boolean);
  const staticOnly = has("static-only");
  const storybookDir = resolve(ROOT, flag("storybook") ?? "storybook-static");
  const storybookUrl = flag("storybook-url");
  let server = null, browser = null, page = null, index = null, baseUrl = storybookUrl;
  if (!staticOnly) {
    if (!baseUrl) {
      if (!existsSync(join(storybookDir, "index.json"))) { console.error(`No Storybook build at ${storybookDir}; run npx nx build storybook or pass --static-only.`); process.exit(2); }
      server = await serveStatic(storybookDir); baseUrl = server.url;
    }
    if (!baseUrl.endsWith("/")) baseUrl += "/";
    index = JSON.parse(await (await fetch(baseUrl + "index.json")).text());
    const { chromium } = await import(join(ROOT, "node_modules", "playwright", "index.mjs"));
    browser = await chromium.launch(); page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
  }
  const results = [];
  try {
    for (const slug of slugs) {
      if (!existsSync(join(SRC, slug))) { results.push({ slug, status: "MISSING" }); continue; }
      const evidence = { $schema: EVIDENCE_SCHEMA, extractedAt: new Date().toISOString(), extractor: { script: "packages/components/scripts/code-evidence.mjs", version: "1" }, ...staticEvidence(slug) };
      if (!staticOnly) {
        const stories = storiesFor(index, evidence);
        evidence.stories = await runtimeEvidence(page, baseUrl, stories, evidence.component.cssClass);
      }
      summarize(evidence);
      const hash = hashBody(evidence);
      evidence.provenance = { hash };
      const file = join(SRC, slug, `${slug}.code.evidence.json`);
      let previous = null, previousSources = null;
      try { const prev = JSON.parse(readFileSync(file, "utf8")); previous = prev.provenance?.hash ?? null; previousSources = prev.sources ?? null; } catch { /* first extraction */ }
      // The body hash leaves `sources` out (see hashBody), so a source file can change
      // without changing what was extracted from it — a comment, a reordered rule. The
      // gate's FRESH check compares source hashes, so that case must still rewrite the
      // file, or the evidence reads as stale forever while the extractor calls it in sync.
      const sameSources = JSON.stringify(previousSources) === JSON.stringify(evidence.sources ?? null);
      const status = previous === hash && sameSources ? "IN-SYNC" : previous ? "UPDATED" : "NEW";
      if (status !== "IN-SYNC" && !has("dry-run")) writeFileSync(file, JSON.stringify(evidence, null, 2) + "\n");
      results.push({ slug, status, hash, counts: evidence.counts, file: `${REL}/${slug}/${slug}.code.evidence.json` });
    }
  } finally {
    await browser?.close(); server?.close();
  }
  for (const r of results) console.log(`${r.status.padEnd(8)} ${r.slug.padEnd(24)} ${r.counts ? `props ${r.counts.props} · attrs ${r.counts.attributes} · parts ${r.counts.parts} · tokens ${r.counts.tokenReferences} (${r.counts.tokenReferencesWithoutFallback} no fallback) · raw ${r.counts.raw} · stories ${r.counts.stories}${r.counts.storiesWithErrors ? ` (${r.counts.storiesWithErrors} failed)` : ""}` : ""}`);
  process.exitCode = results.some((r) => r.status === "MISSING" || r.counts?.storiesWithErrors) ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
