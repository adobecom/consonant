#!/usr/bin/env node
// Run the relay on a laptop (Node 24: fetch, crypto.subtle and Request are
// built in). Same handler as the Worker.
//   GITHUB_TOKEN=… REPO=owner/name node apps/s2a-contract-relay/local.mjs
import http from "node:http";
import { createRelay } from "./src/relay.mjs";

const PORT = Number(process.env.PORT || 9420);
const handle = createRelay({ token: process.env.GITHUB_TOKEN || "", repo: process.env.REPO || "adobecom/consonant", baseBranch: process.env.BASE_BRANCH || "main", workflow: process.env.WORKFLOW || "contract-sync.yml", relayKey: process.env.RELAY_KEY || "" });
const serve = async (req, res) => {
  let body = ""; for await (const chunk of req) body += chunk;
  const request = new Request(`http://127.0.0.1:${PORT}${req.url}`, { method: req.method, headers: req.headers, body: ["GET", "HEAD", "OPTIONS"].includes(req.method) ? undefined : body });
  const response = await handle(request);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
};
http.createServer(serve).listen(PORT, "127.0.0.1", () => console.log(`s2a contract relay: http://localhost:${PORT}  (POST /evidence, GET /contracts)`));
http.createServer(serve).listen(PORT, "::1").on("error", () => { /* no IPv6 loopback */ });
