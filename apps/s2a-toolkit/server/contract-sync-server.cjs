#!/usr/bin/env node
// contract-sync-server.cjs — local transport for the toolkit's "Extract contract".
//
//   POST /evidence   { evidence, hash?, slug? }  → writes <slug>.figma.evidence.json
//   GET  /contracts                              → contract index (specs + evidence state)
//   GET  /health
//
// One implementation, two transports: this server in development; the CI
// workflow (dispatch behind a relay) takes the same body later. It never
// writes spec.json: evidence in, curation and transform decide the rest.
// See docs/future-notes/s2a-contract-system-plan.md.
"use strict";

const http   = require("http");
const fs     = require("fs");
const path   = require("path");
const crypto = require("crypto");
const { proposalFor } = require("./contract-proposal.cjs");
const { matchCandidate, loadContracts } = require("./contract-match.cjs");

const PORT       = Number(process.env.S2A_CONTRACT_SYNC_PORT || 9410);
const REPO_ROOT  = process.env.S2A_CONTRACT_REPO_ROOT || path.resolve(__dirname, "..", "..", "..");
const SRC_DIR    = path.join(REPO_ROOT, "packages", "components", "src");
const NEW_DIR    = path.join(REPO_ROOT, "packages", "components", "evidence");
const MAX_BODY   = 8 * 1024 * 1024;
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Stable serialization shared with the plugin (contract-extract.ts).
function canonicalJson(value) {
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  if (value && typeof value === "object") {
    return "{" + Object.keys(value).sort().map((k) => JSON.stringify(k) + ":" + canonicalJson(value[k])).join(",") + "}";
  }
  return JSON.stringify(value === undefined ? null : value);
}
function hashEvidence(evidence) {
  const { extractedAt, provenance, ...rest } = evidence;
  void extractedAt; void provenance;
  return "sha256:" + crypto.createHash("sha256").update(canonicalJson(rest)).digest("hex");
}

// Set names carry version and status markers ("Button — v2", "🚫 Button — v1");
// the slug is the bare name, matched against the spec names when one exists.
function normalizeName(name) {
  return String(name || "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s*[—–-]\s*v\d+(\.\d+)*\s*$/i, "")
    .replace(/\(.*?\)/g, "")
    .trim();
}
function kebab(name) {
  return normalizeName(name)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
function alnum(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }

function readSpecs() {
  const specs = [];
  if (!fs.existsSync(SRC_DIR)) return specs;
  for (const dir of fs.readdirSync(SRC_DIR)) {
    const file = path.join(SRC_DIR, dir, `${dir}.spec.json`);
    if (!fs.existsSync(file)) continue;
    try {
      const spec = JSON.parse(fs.readFileSync(file, "utf8"));
      specs.push({ slug: dir, name: spec.name || dir, figmaNodeId: spec.figmaNodeId || null, specPath: path.relative(REPO_ROOT, file) });
    } catch { /* unreadable spec: skip */ }
  }
  return specs;
}
function evidenceState(slug) {
  for (const file of [path.join(SRC_DIR, slug, `${slug}.figma.evidence.json`), path.join(NEW_DIR, `${slug}.figma.evidence.json`)]) {
    if (!fs.existsSync(file)) continue;
    try {
      const e = JSON.parse(fs.readFileSync(file, "utf8"));
      return { path: path.relative(REPO_ROOT, file), hash: e.provenance?.hash || null, extractedAt: e.extractedAt || null, setKey: e.set?.key || null, setId: e.set?.id || null };
    } catch { return { path: path.relative(REPO_ROOT, file), hash: null }; }
  }
  return null;
}
function resolveSlug(evidence, override) {
  const specs = readSpecs();
  if (override) return { slug: kebab(override), spec: specs.find((s) => s.slug === kebab(override)) || null };
  const setName = normalizeName(evidence.set?.name);
  const byName = specs.find((s) => alnum(s.name) === alnum(setName)) || specs.find((s) => s.slug === kebab(setName));
  const byNode = evidence.set?.id ? specs.find((s) => s.figmaNodeId === evidence.set.id) : null;
  const spec = byNode || byName || null;
  return { slug: spec ? spec.slug : kebab(setName), spec };
}
function contractIndex() {
  const specs = readSpecs();
  const items = specs.map((s) => ({ ...s, hasDefs: fs.existsSync(path.join(SRC_DIR, s.slug, `${s.slug}.defs.json`)), figmaEvidence: evidenceState(s.slug) }));
  if (fs.existsSync(NEW_DIR)) {
    for (const file of fs.readdirSync(NEW_DIR)) {
      const m = file.match(/^(.+)\.figma\.evidence\.json$/);
      if (m && !specs.find((s) => s.slug === m[1])) items.push({ slug: m[1], name: m[1], figmaNodeId: null, specPath: null, hasDefs: false, figmaEvidence: evidenceState(m[1]) });
    }
  }
  return { count: items.length, items };
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json", ...CORS });
  res.end(status === 204 ? undefined : JSON.stringify(body));
}

function handleEvidence(body) {
  const evidence = body.evidence;
  if (!evidence || evidence.$schema !== "s2a-figma-evidence/1" || !evidence.set?.name) {
    return [400, { error: "Body must be { evidence } with $schema s2a-figma-evidence/1" }];
  }
  const hash = hashEvidence(evidence);
  if (body.hash && body.hash !== hash) return [409, { error: "Hash mismatch: the server's canonical hash differs from the plugin's", serverHash: hash, clientHash: body.hash }];
  const { slug, spec } = resolveSlug(evidence, body.slug);
  if (!slug) return [400, { error: "Could not derive a slug from the set name" }];
  const dir = spec ? path.join(SRC_DIR, slug) : NEW_DIR;
  const file = path.join(dir, `${slug}.figma.evidence.json`);
  const previous = evidenceState(slug);
  if (previous && previous.hash === hash) {
    return [200, { status: "in-sync", slug, path: previous.path, hash, spec: spec ? spec.specPath : null }];
  }
  fs.mkdirSync(dir, { recursive: true });
  const stored = { ...evidence, provenance: { ...(evidence.provenance || {}), hash } };
  fs.writeFileSync(file, JSON.stringify(stored, null, 2) + "\n");
  return [200, { status: previous ? "updated" : "new", slug, path: path.relative(REPO_ROOT, file), hash, previousHash: previous?.hash || null, spec: spec ? spec.specPath : null, proposal: spec ? null : "No spec.json for this set yet: the sync pipeline opens a PR with a draft proposal from the axes.", proposalMarkdown: spec ? null : proposalFor(evidence, slug, matchCandidate(evidence, loadContracts(REPO_ROOT))).markdown }];
}

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString().slice(11, 19)} ${req.method} ${req.url}`);
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
  if (req.method === "GET" && req.url === "/health") return json(res, 200, { ok: true, port: PORT, repo: REPO_ROOT });
  if (req.method === "GET" && req.url.startsWith("/contracts")) return json(res, 200, contractIndex());
  if (req.method === "GET" && req.url.startsWith("/plan/")) {
    const slug = decodeURIComponent(req.url.slice(6)).replace(/[^a-z0-9-]/g, "");
    const file = path.join(REPO_ROOT, "packages", "specs", "out", slug, "figma.plan.json");
    if (!fs.existsSync(file)) return json(res, 404, { error: `no figma.plan.json for ${slug}; run npm run specs:build` });
    return json(res, 200, JSON.parse(fs.readFileSync(file, "utf8")));
  }
  if (req.method === "POST" && req.url === "/match") {
    let raw = ""; req.on("data", (c) => { raw += c; if (raw.length > MAX_BODY) req.destroy(); });
    req.on("end", () => {
      let body; try { body = JSON.parse(raw); } catch { return json(res, 400, { error: "Invalid JSON" }); }
      if (!body.evidence?.set) return json(res, 400, { error: "Body must be { evidence }" });
      try { return json(res, 200, matchCandidate(body.evidence, loadContracts(REPO_ROOT))); } catch (err) { return json(res, 500, { error: err.message }); }
    });
    return;
  }
  if (req.method === "POST" && req.url === "/log") {
    let raw = ""; req.on("data", (c) => { raw += c; }); req.on("end", () => { try { const b = JSON.parse(raw); console.log(`  plugin ${b.event}${b.detail !== undefined ? " " + JSON.stringify(b.detail).slice(0, 400) : ""}`); } catch { console.log("  plugin (unparseable log)"); } json(res, 204, {}); });
    return;
  }
  if (req.method === "POST" && req.url === "/evidence") {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; if (raw.length > MAX_BODY) { req.destroy(); } });
    req.on("end", () => {
      let body;
      try { body = JSON.parse(raw); } catch { return json(res, 400, { error: "Invalid JSON" }); }
      try { const [status, out] = handleEvidence(body); return json(res, status, out); }
      catch (err) { return json(res, 500, { error: err.message }); }
    });
    return;
  }
  json(res, 404, { error: "Not found" });
});

if (require.main === module) {
  // The plugin fetches "localhost", which Chromium may resolve to ::1 first;
  // listen on both loopback addresses so neither resolution is refused.
  server.listen(PORT, "127.0.0.1", () => {
    console.log(`s2a contract sync: http://localhost:${PORT}  (POST /evidence, GET /contracts)  repo ${REPO_ROOT}`);
  });
  http.createServer(server.listeners("request")[0]).listen(PORT, "::1").on("error", () => { /* no IPv6 loopback */ });
}

module.exports = { server, handleEvidence, contractIndex, hashEvidence, canonicalJson, kebab, normalizeName, resolveSlug };
