import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createRelay, hashEvidence } from "../src/relay.mjs";

const require = createRequire(import.meta.url);
const syncServer = require("../../s2a-toolkit/server/contract-sync-server.cjs");

const evidence = { $schema: "s2a-figma-evidence/1", extractedAt: "2026-09-17T00:00:00Z", extractor: { plugin: "t", version: "0" }, file: {}, set: { id: "9334:3814", key: "k", name: "QuoteCard — v2", type: "COMPONENT_SET" }, axes: [{ name: "State", type: "VARIANT", options: ["default", "hover"] }], variants: [], counts: { variants: 2, bindings: 3 }, provenance: { hash: null } };

function mockGitHub({ index = null, baseSha = "abc123" } = {}) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, method: init.method ?? "GET", body: init.body ? JSON.parse(init.body) : null });
    const ok = (status, data) => new Response(JSON.stringify(data), { status });
    if (url.includes("raw.githubusercontent.com")) return index ? ok(200, index) : new Response("", { status: 404 });
    if (url.endsWith("/git/ref/heads/main")) return ok(200, { object: { sha: baseSha } });
    if (url.endsWith("/git/refs")) return ok(201, {});
    if (/\/contents\/.+\?ref=/.test(url)) return new Response(null, { status: 404 });
    if (url.includes("/contents/")) return ok(201, { content: { path: "x" } });
    if (url.includes("/dispatches")) return new Response(null, { status: 204 });
    return ok(500, { error: "unexpected " + url });
  };
  return { calls, fetchImpl };
}

test("relay hash matches the sync server hash", async () => {
  assert.equal(await hashEvidence(evidence), syncServer.hashEvidence(evidence));
});

test("publishes: branch from base, evidence into the inbox, workflow dispatched on the branch", async () => {
  const gh = mockGitHub();
  const handle = createRelay({ token: "T", repo: "adobecom/consonant", fetchImpl: gh.fetchImpl });
  const res = await handle(new Request("https://relay.test/evidence", { method: "POST", body: JSON.stringify({ evidence }) }));
  const out = await res.json();
  assert.equal(res.status, 200); assert.equal(out.status, "dispatched"); assert.equal(out.slug, "quote-card");
  assert.match(out.branch, /^contract\/quote-card\/[0-9a-f]{8}$/);
  const ref = gh.calls.find((c) => c.url.endsWith("/git/refs"));
  assert.deepEqual(ref.body, { ref: `refs/heads/${out.branch}`, sha: "abc123" });
  const put = gh.calls.find((c) => c.method === "PUT");
  assert.ok(put.url.endsWith("/contents/packages/components/evidence/inbox/quote-card.figma.evidence.json"));
  assert.equal(put.body.branch, out.branch);
  const stored = JSON.parse(Buffer.from(put.body.content, "base64").toString("utf8"));
  assert.equal(stored.provenance.hash, out.hash);
  const dispatch = gh.calls.find((c) => c.url.includes("/dispatches"));
  assert.deepEqual(dispatch.body, { ref: out.branch, inputs: { slug: "quote-card", hash: out.hash } });
});

test("a byte-identical publish is in-sync when the committed index carries the hash", async () => {
  const hash = await hashEvidence(evidence);
  const gh = mockGitHub({ index: { items: [{ slug: "quote-card", name: "QuoteCard", figmaNodeId: "9334:3814", specPath: "x", figmaEvidence: { hash } }] } });
  const handle = createRelay({ token: "T", repo: "adobecom/consonant", fetchImpl: gh.fetchImpl });
  const out = await (await handle(new Request("https://relay.test/evidence", { method: "POST", body: JSON.stringify({ evidence, hash }) }))).json();
  assert.equal(out.status, "in-sync");
  assert.ok(!gh.calls.some((c) => c.method === "POST" || c.method === "PUT"), "nothing written");
});

test("rejects bad bodies, wrong hashes and missing relay key; serves the index", async () => {
  const gh = mockGitHub({ index: { count: 1, items: [] } });
  const handle = createRelay({ token: "T", repo: "o/r", relayKey: "secret", fetchImpl: gh.fetchImpl });
  assert.equal((await handle(new Request("https://relay.test/evidence", { method: "POST", body: "{}" }))).status, 401);
  const withKey = (body) => new Request("https://relay.test/evidence", { method: "POST", headers: { "x-s2a-relay-key": "secret" }, body: JSON.stringify(body) });
  assert.equal((await handle(withKey({ evidence: { $schema: "nope" } }))).status, 400);
  assert.equal((await handle(withKey({ evidence, hash: "sha256:wrong" }))).status, 409);
  assert.equal((await handle(new Request("https://relay.test/contracts"))).status, 200);
  assert.equal((await handle(new Request("https://relay.test/health"))).status, 200);
});
