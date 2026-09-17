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
import { createHash } from "node:crypto";
import { join, dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

export const EVIDENCE_SCHEMA = "s2a-code-evidence/1";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..", "..");
const SRC = join(ROOT, "packages", "components", "src");
const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const has = (name) => args.includes(`--${name}`);

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

export function parseCss(css) {
  const references = new Map();
  for (const m of css.matchAll(/var\((--s2a-[a-z0-9_-]+)\s*(,)?/g)) {
    const prev = references.get(m[1]);
    references.set(m[1], { fallback: (prev?.fallback ?? true) && Boolean(m[2]) });
  }
  const custom = uniq([...css.matchAll(/^\s*(--[a-z][a-z0-9-]*)\s*:/gm)].map((m) => m[1]));
  const classes = uniq([...css.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
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
  return { references: Object.fromEntries([...references].sort()), custom, classes, attributes, states, queries, raw };
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
  // spec.json is generated from this evidence (packages/specs), so it is read
  // for identity but never hashed as a source: that would be circular.
  const files = ["index.js", `${slug}.js`, `${slug}.css`].filter((f) => existsSync(join(dir, f)));
  const sources = Object.fromEntries(files.map((f) => [`packages/components/src/${slug}/${f}`, sha256(readFileSync(join(dir, f), "utf8"))]));
  const spec = existsSync(join(dir, `${slug}.spec.json`)) ? JSON.parse(readFileSync(join(dir, `${slug}.spec.json`), "utf8")) : null;
  const js = existsSync(join(dir, `${slug}.js`)) ? readFileSync(join(dir, `${slug}.js`), "utf8") : "";
  const css = existsSync(join(dir, `${slug}.css`)) ? readFileSync(join(dir, `${slug}.css`), "utf8") : "";
  const exports = parseExports(js);
  const { render, props, otherRenders } = parseProps(js, spec?.name ?? slug);
  const template = parseTemplate(js);
  const style = parseCss(css);
  const cssClass = spec?.cssClass ?? template.classes.find((c) => c.startsWith("c-")) ?? null;
  return {
    component: { slug, name: spec?.name ?? render ?? slug, cssClass, importPath: `packages/components/src/${slug}/${slug}.js`, exports, render, otherRenders: otherRenders ?? [], spec: spec ? { path: `packages/components/src/${slug}/${slug}.spec.json`, storybookId: spec.storybookId ?? null, figmaNodeId: spec.figmaNodeId ?? null } : null },
    sources,
    props,
    attributes: mergeAttributes(template.attributes, style.attributes),
    parts: { template: template.classes, stylesheet: style.classes },
    aria: { roles: template.roles, attributes: template.aria, tags: template.tags },
    imports: template.imports,
    tokens: { references: style.references, custom: style.custom, raw: style.raw },
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
      let previous = null;
      try { previous = JSON.parse(readFileSync(file, "utf8")).provenance?.hash ?? null; } catch { /* first extraction */ }
      const status = previous === hash ? "IN-SYNC" : previous ? "UPDATED" : "NEW";
      if (status !== "IN-SYNC" && !has("dry-run")) writeFileSync(file, JSON.stringify(evidence, null, 2) + "\n");
      results.push({ slug, status, hash, counts: evidence.counts, file: `packages/components/src/${slug}/${slug}.code.evidence.json` });
    }
  } finally {
    await browser?.close(); server?.close();
  }
  for (const r of results) console.log(`${r.status.padEnd(8)} ${r.slug.padEnd(24)} ${r.counts ? `props ${r.counts.props} · attrs ${r.counts.attributes} · parts ${r.counts.parts} · tokens ${r.counts.tokenReferences} (${r.counts.tokenReferencesWithoutFallback} no fallback) · raw ${r.counts.raw} · stories ${r.counts.stories}${r.counts.storiesWithErrors ? ` (${r.counts.storiesWithErrors} failed)` : ""}` : ""}`);
  process.exitCode = results.some((r) => r.status === "MISSING" || r.counts?.storiesWithErrors) ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
