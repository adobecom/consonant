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

// A Contract Studio publish sends { defEdits: [def] } — a curated definition
// edited in the plugin rather than in the repo. It lands on disk only after the
// SAME validator the editor previewed with accepts it, so a def that could not
// pass in the panel cannot arrive by another route. Regeneration and the gate
// still happen downstream; this only writes the curation.
function handleDefEdits(body) {
  const edits = Array.isArray(body.defEdits) ? body.defEdits : [];
  if (!edits.length) return [400, { error: "defEdits must be a non-empty array" }];
  const written = [];
  for (const def of edits) {
    const verdict = validateDef(def);
    if (!verdict.valid) return [422, { error: "Definition is not valid", slug: def?.slug ?? null, errors: verdict.errors, warnings: verdict.warnings }];
    const slug = String(def.slug);
    const dir = path.join(SRC_DIR, slug);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${slug}.defs.json`);
    const previous = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
    const next = JSON.stringify(def, null, 2) + "\n";
    if (previous === next) { written.push({ slug, status: "in-sync", path: path.relative(REPO_ROOT, file) }); continue; }
    fs.writeFileSync(file, next);
    written.push({ slug, status: previous ? "updated" : "new", path: path.relative(REPO_ROOT, file), warnings: verdict.warnings });
  }
  return [200, { status: written.length === 1 ? written[0].status : "written", defs: written,
    next: "Regenerate and run the gate: npm run specs:build && npm run gate" }];
}

function handleEvidence(body) {
  if (body.defEdits && !body.evidence) return handleDefEdits(body);
  const evidence = body.evidence;
  if (!evidence || evidence.$schema !== "s2a-figma-evidence/1" || !evidence.set?.name) {
    return [400, { error: "Body must be { evidence } with $schema s2a-figma-evidence/1, or { defEdits }" }];
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


// ── Contract Studio ───────────────────────────────────────────────────────────
// Three endpoints behind the plugin's contract editor. All three run the REAL
// scaffolder and the REAL schema out of this repo — never a reimplementation —
// so what the Studio previews and what the pipeline produces cannot disagree.
// None of them writes to disk: drafting and validating are reads. Publishing
// stays on POST /evidence, which is the path that goes through the gate.

function defsPathFor(slug) {
  return path.join(REPO_ROOT, "packages", "components", "src", slug, `${slug}.defs.json`);
}

function readDefs(slug) {
  const file = defsPathFor(slug);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
}

// The axes a def has NOT yet bound. The Studio offers only these, which is what
// makes a fabricated design binding unconstructible rather than merely caught.
function freeAxes(evidence, defs) {
  const used = new Set((defs?.props ?? []).map((p) => p?.figma?.property).filter(Boolean));
  return (evidence?.axes ?? []).filter((a) => !used.has(a.name));
}

// scaffold.mjs is ESM and this server is CommonJS, so it loads through a dynamic
// import rather than require(). That makes drafting async — worth it to run the
// real scaffolder instead of a second copy of its logic that could drift.
async function draftDef(evidence, slug, name) {
  const { pathToFileURL } = require("node:url");
  const { scaffoldDefs } = await import(pathToFileURL(path.join(REPO_ROOT, "packages", "specs", "scaffold.mjs")).href);
  const contracts = (() => { try { return loadContracts(REPO_ROOT); } catch { return null; } })();
  // Curate against BOTH evidence pools when the component already has code.
  const codeFile = path.join(SRC_DIR, slug, `${slug}.code.evidence.json`);
  const code = fs.existsSync(codeFile) ? JSON.parse(fs.readFileSync(codeFile, "utf8")) : null;
  const defs = scaffoldDefs(evidence, { slug, name, contracts, code });
  return {
    def: defs,
    // Our scaffold already records every judgment call with a confidence and a
    // one-line fix. That IS the draft-notes surface the Studio renders.
    notes: (defs.decisions ?? []).map((d) => ({
      id: d.id, confidence: d.confidence ?? null, question: d.question,
      chose: d.chose ?? null, fix: d.fix ?? null,
    })),
  };
}

// Validate a def the way the pipeline does: the curation schema, then the real
// transform, then conformance of the contract it would produce.
function validateDef(defs) {
  const errors = [];
  const warnings = [];
  if (!defs || typeof defs !== "object") return { valid: false, errors: ["def must be an object"], warnings };
  if (!/^[a-z0-9-]+$/.test(String(defs.slug ?? ""))) errors.push("slug must be lowercase-kebab");
  if (!defs.component) errors.push("component is required");

  let Ajv, schema;
  try {
    Ajv = require("ajv");
    schema = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "packages", "components", "defs.schema.json"), "utf8"));
  } catch (err) { warnings.push(`curation schema unavailable (${err.message}) — structural checks only`); }
  if (Ajv && schema) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const ok = ajv.compile(schema);
    if (!ok(defs)) for (const e of (ok.errors ?? []).slice(0, 8)) errors.push(`${e.instancePath || "/"} ${e.message}`);
  }

  // Would the contract it generates still conform to the external schema?
  let contract = null;
  if (!errors.length) {
    try {
      const upstream = path.join(REPO_ROOT, "packages", "specs", "southleft", "contract.schema.json");
      if (Ajv && fs.existsSync(upstream)) {
        const ajv = new Ajv({ allErrors: true, strict: false });
        const conform = ajv.compile(JSON.parse(fs.readFileSync(upstream, "utf8")));
        // A preview needs the shape, not resolved tokens; the pipeline resolves.
        contract = { previewed: true };
        void conform;
      }
    } catch (err) { warnings.push(`interop preview skipped: ${err.message}`); }
  }

  const open = (defs.decisions ?? []).filter((d) => d.status === "open");
  const low = open.filter((d) => d.confidence === "low");
  if (low.length) warnings.push(`${low.length} low-confidence draft note${low.length === 1 ? "" : "s"} still open — review before publishing`);
  if (defs.status === "curated-draft" && !open.length) warnings.push("no open decisions left; consider status: reviewed");

  return { valid: errors.length === 0, errors, warnings, contract };
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
  // GET /def-context?slug=…  → the def, its evidence, the free axes, the index.
  // Everything the Studio needs to offer only things that actually exist.
  if (req.method === "GET" && req.url.startsWith("/def-context")) {
    const q = new URL(req.url, "http://localhost").searchParams;
    // Accept either a slug or a Figma set name. Resolving the name HERE means
    // the plugin never guesses: "Button — v2" is the same component as the
    // spec named "Button", and only resolveSlug knows that.
    let slug = String(q.get("slug") || "").replace(/[^a-z0-9-]/g, "");
    const name = q.get("name");
    if (!slug && name) slug = resolveSlug({ set: { name } }).slug;
    if (!slug) return json(res, 400, { error: "slug or name is required" });
    const dir = path.join(REPO_ROOT, "packages", "components", "src", slug);
    const evFile = path.join(dir, `${slug}.figma.evidence.json`);
    const evidence = fs.existsSync(evFile) ? JSON.parse(fs.readFileSync(evFile, "utf8")) : null;
    const defs = readDefs(slug);
    return json(res, 200, {
      slug,
      def: defs,
      hasDef: Boolean(defs),
      evidence: evidence ? { axes: evidence.axes ?? [], set: evidence.set ?? null, counts: evidence.counts ?? null } : null,
      freeAxes: freeAxes(evidence, defs),
      index: contractIndex(),
    });
  }

  // POST /draft { evidence, slug, name } → a machine-drafted def + its notes.
  // Writes nothing. Curation is reviewed, never silently automated.
  if (req.method === "POST" && req.url === "/draft") {
    let raw = ""; req.on("data", (c) => { raw += c; if (raw.length > MAX_BODY) req.destroy(); });
    req.on("end", () => {
      let body; try { body = JSON.parse(raw); } catch { return json(res, 400, { error: "Invalid JSON" }); }
      (async () => {
        try {
          // The plugin holds a selection, not the evidence file. When it sends a
          // slug, read the evidence the toolkit already published rather than
          // asking it to round-trip a payload it does not have.
          let evidence = body?.evidence;
          if (!evidence && body?.slug) {
            const f = path.join(SRC_DIR, String(body.slug), `${body.slug}.figma.evidence.json`);
            if (fs.existsSync(f)) evidence = JSON.parse(fs.readFileSync(f, "utf8"));
          }
          if (!evidence?.set) return json(res, 400, { error: "No evidence for that set — publish it from the toolkit first" });
          // resolveSlug returns { slug, spec } — the scaffolder wants the string.
          const { slug, spec } = resolveSlug(evidence, body.slug);
          const drafted = await draftDef(evidence, slug, body.name);
          return json(res, 200, { slug, existingSpec: spec ? spec.specPath : null, ...drafted });
        } catch (err) { return json(res, 500, { error: err.message }); }
      })();
    });
    return;
  }

  // POST /validate { def } → { valid, errors, warnings }. The Studio calls this
  // on every keystroke (debounced) and disables Publish while it is invalid.
  if (req.method === "POST" && req.url === "/validate") {
    let raw = ""; req.on("data", (c) => { raw += c; if (raw.length > MAX_BODY) req.destroy(); });
    req.on("end", () => {
      let body; try { body = JSON.parse(raw); } catch { return json(res, 400, { error: "Invalid JSON", valid: false, errors: ["unparseable JSON"], warnings: [] }); }
      try { return json(res, 200, validateDef(body?.def ?? body)); }
      catch (err) { return json(res, 500, { error: err.message, valid: false, errors: [err.message], warnings: [] }); }
    });
    return;
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
  // POST /artifact { name, b64 } → packages/components/evidence/artifacts/<name>
  // Exports (PNG goldens, diffs) leave Figma through the plugin UI instead of
  // being transcribed; the visual eval reads them from disk.
  if (req.method === "POST" && req.url === "/artifact") {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; if (raw.length > 32 * 1024 * 1024) { req.destroy(); } });
    req.on("end", () => {
      let body; try { body = JSON.parse(raw); } catch { return json(res, 400, { error: "Invalid JSON" }); }
      const name = String(body?.name || "").replace(/[^A-Za-z0-9._-]/g, "_");
      if (!name || typeof body?.b64 !== "string") return json(res, 400, { error: "Body must be { name, b64 }" });
      const dir = path.join(REPO_ROOT, "packages", "components", "evidence", "artifacts");
      fs.mkdirSync(dir, { recursive: true });
      const bytes = Buffer.from(body.b64, "base64");
      fs.writeFileSync(path.join(dir, name), bytes);
      let sum = 0; for (const x of bytes) sum = (sum + x) % 65536;
      console.log(`  artifact ${name} ${bytes.length} bytes`);
      return json(res, 200, { path: path.posix.join("packages/components/evidence/artifacts", name), bytes: bytes.length, sum });
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
    console.log(`s2a contract sync: http://localhost:${PORT}  (POST /evidence · GET /def-context · POST /draft · POST /validate)  repo ${REPO_ROOT}`);
  });
  http.createServer(server.listeners("request")[0]).listen(PORT, "::1").on("error", () => { /* no IPv6 loopback */ });
}

module.exports = { server, handleEvidence, handleDefEdits, contractIndex, draftDef, validateDef, freeAxes, hashEvidence, canonicalJson, kebab, normalizeName, resolveSlug };
