// relay.mjs — the ~100 lines that let the toolkit publish to CI without holding
// a repository token. Portable: runs as a Cloudflare Worker (worker.mjs) or a
// local Node server (local.mjs); only `fetch` is required.
//
//   POST /evidence  { evidence, hash? }  → in-sync | dispatched { branch, hash, actions }
//   GET  /contracts                      → the committed contract index
//   GET  /health
//
// Flow: hash the evidence exactly as the sync server does; if the committed
// index already carries that hash for the slug, answer in-sync and touch
// nothing. Otherwise create branch contract/<slug>/<hash8> from the base
// branch, commit the evidence into packages/components/evidence/inbox/, and
// dispatch contract-sync.yml on that branch; the workflow applies it, runs
// the gate, and opens the PR (or commits nothing when the gate is red).

export function canonicalJson(value) {
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.keys(value).sort().map((k) => JSON.stringify(k) + ":" + canonicalJson(value[k])).join(",") + "}";
  return JSON.stringify(value === undefined ? null : value);
}
export async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return "sha256:" + [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function hashEvidence(evidence) {
  const { extractedAt, provenance, ...rest } = evidence;
  void extractedAt; void provenance;
  return sha256(canonicalJson(rest));
}
export function normalizeName(name) {
  return String(name || "").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").replace(/\s*[—–-]\s*v\d+(\.\d+)*\s*$/i, "").replace(/\(.*?\)/g, "").trim();
}
export function kebab(name) {
  return normalizeName(name).replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
}
const alnum = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, x-s2a-relay-key" };
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...CORS } });
const b64 = (text) => (typeof btoa === "function" ? btoa(unescape(encodeURIComponent(text))) : Buffer.from(text, "utf8").toString("base64"));

export function createRelay(config) {
  const { token, repo, baseBranch = "main", workflow = "contract-sync.yml", indexPath = "packages/specs/out/contracts.index.json", relayKey = "", fetchImpl = globalThis.fetch, apiBase = "https://api.github.com", rawBase = "https://raw.githubusercontent.com" } = config;
  const gh = async (method, path, body) => {
    const res = await fetchImpl(`${apiBase}/repos/${repo}${path}`, { method, headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "content-type": "application/json", "user-agent": "s2a-contract-relay" }, body: body ? JSON.stringify(body) : undefined });
    const text = await res.text();
    let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    return { status: res.status, data };
  };
  async function index() {
    try { const res = await fetchImpl(`${rawBase}/${repo}/${baseBranch}/${indexPath}`, { headers: { "user-agent": "s2a-contract-relay" } }); return res.ok ? await res.json() : null; } catch { return null; }
  }

  return async function handle(request) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (request.method === "GET" && url.pathname === "/health") return json(200, { ok: true, repo, baseBranch, workflow });
    if (request.method === "GET" && url.pathname === "/contracts") { const idx = await index(); return idx ? json(200, idx) : json(404, { error: `no ${indexPath} on ${baseBranch}; run npm run specs:build and commit the index` }); }
    if (request.method !== "POST" || url.pathname !== "/evidence") return json(404, { error: "Not found" });
    if (relayKey && request.headers.get("x-s2a-relay-key") !== relayKey) return json(401, { error: "relay key required" });
    if (!token) return json(500, { error: "relay has no GITHUB_TOKEN configured" });
    let body; try { body = await request.json(); } catch { return json(400, { error: "Invalid JSON" }); }
    const evidence = body.evidence;
    if (!evidence || evidence.$schema !== "s2a-figma-evidence/1" || !evidence.set?.name) return json(400, { error: "Body must be { evidence } with $schema s2a-figma-evidence/1" });
    const hash = await hashEvidence(evidence);
    if (body.hash && body.hash !== hash) return json(409, { error: "Hash mismatch between plugin and relay", serverHash: hash, clientHash: body.hash });

    const idx = await index();
    const name = normalizeName(evidence.set.name);
    const known = idx?.items?.find((i) => alnum(i.name) === alnum(name) || i.slug === kebab(name) || (evidence.set.id && i.figmaNodeId === evidence.set.id));
    const slug = body.slug ? kebab(body.slug) : known?.slug ?? kebab(name);
    if (known?.figmaEvidence?.hash === hash) return json(200, { status: "in-sync", slug, hash, note: `${baseBranch} already carries this evidence` });

    const short = hash.slice(7, 15);
    const branch = `contract/${slug}/${short}`;
    const base = await gh("GET", `/git/ref/heads/${baseBranch}`);
    if (base.status !== 200) return json(502, { error: `cannot read ${baseBranch}: ${base.status}`, detail: base.data });
    const created = await gh("POST", "/git/refs", { ref: `refs/heads/${branch}`, sha: base.data.object.sha });
    if (created.status !== 201 && created.status !== 422) return json(502, { error: `cannot create branch ${branch}: ${created.status}`, detail: created.data });
    const filePath = `packages/components/evidence/inbox/${slug}.figma.evidence.json`;
    const existing = await gh("GET", `/contents/${filePath}?ref=${encodeURIComponent(branch)}`);
    const put = await gh("PUT", `/contents/${filePath}`, { message: `chore(contracts): publish ${slug} evidence ${short}`, content: b64(JSON.stringify({ ...evidence, provenance: { ...(evidence.provenance || {}), hash } }, null, 2) + "\n"), branch, ...(existing.status === 200 && existing.data?.sha ? { sha: existing.data.sha } : {}) });
    if (put.status !== 200 && put.status !== 201) return json(502, { error: `cannot commit evidence: ${put.status}`, detail: put.data });
    const dispatched = await gh("POST", `/actions/workflows/${workflow}/dispatches`, { ref: branch, inputs: { slug, hash } });
    if (dispatched.status !== 204) return json(502, { error: `evidence committed to ${branch} but dispatch failed: ${dispatched.status}`, detail: dispatched.data, branch, hash });
    return json(200, { status: "dispatched", slug, hash, branch, path: filePath, existingContract: Boolean(known?.specPath), actions: `https://github.com/${repo}/actions/workflows/${workflow}`, note: "The workflow applies the evidence, runs the gate, and opens a PR when green." });
  };
}
