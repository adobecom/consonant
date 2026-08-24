# `s2a-request-intake`

A **Cloudflare Worker** that turns S2A plugin requests into **triage-ready GitHub issues**. It's the endpoint the plugin's **Request tab** POSTs to in Worker mode.

Why a Worker (vs. the plugin posting to GitHub directly):
- **No per-user GitHub account.** The Worker holds one GitHub credential server-side, so any designer can file a request — the self-serve path.
- **Image hosting.** A PAT can't attach binaries to an issue. The Worker stores uploaded images in **Workers KV** (free tier, no payment method) with a **TTL** so storage auto-expires, and serves them back through the Worker itself (`GET /asset/<key>`). Images use KV instead of R2 specifically because R2 requires a card on file; KV does not.

## Endpoints

| Route | What |
|---|---|
| `POST /` | File a request. Body = the plugin's JSON payload. Returns `{ url, number, images }`. |
| `GET /asset/<key>` | Serve an uploaded image from KV (public, immutable-cached — this is what GitHub fetches). Note: KV is eventually consistent, so a brand-new image can 404 for up to ~60s before it propagates. |
| `GET /` | One-line health string. |

Every issue is created with the `s2a-request` + `needs-triage` labels — identical to the [issue form](../../docs/contributing.md#requesting-a-token-component-or-change) and the direct-mode plugin path, so all three feed one triage queue.

## Payload

```jsonc
{
  "kind": "New token", "priority": "Blocking",
  "summary": "…", "useCase": "…",
  "figmaUrl": "https://figma.com/design/…?node-id=…",
  "fileName": "…", "page": "…", "nodeName": "…", "tokenName": "s2a/color/…",
  "requester": "Jane D.",
  "images": [{ "name": "mock.png", "type": "image/png", "dataUrl": "data:image/png;base64,…" }]
}
```
`summary` and `useCase` are required. Up to 4 images, ≤5MB each; anything else is skipped, never blocking the issue. Images are stored in KV with a 90-day TTL, so storage self-expires and stays a rounding error against the free tier.

## Setup & deploy

```bash
npm install

# 1. Create the KV namespace (paste the returned id into wrangler.toml)
wrangler kv namespace create INTAKE_KV

# 2. Set secrets
wrangler secret put GH_TOKEN        # a PAT with Issues: read/write on adobecom/consonant
wrangler secret put INTAKE_SECRET   # optional — a long random string the plugin also sends

# 3. Ship it
npm run deploy                      # → https://s2a-request-intake.<your-subdomain>.workers.dev
```

> Already deployed at `https://s2a-request-intake.mmhuntsberry.workers.dev` (KV namespace `INTAKE_KV` = `8ad4542426ab44e4970978c3b2c7a67e`). Only `GH_TOKEN` remains to be set for it to file issues.

Local dev: copy `.dev.vars.example` → `.dev.vars`, then `npm run dev` (→ `http://localhost:8787`).

## Wire the plugin to it

In `apps/s2a-toolkit/src/ui.ts`, set:

```ts
const REQUEST_ENDPOINT = 'https://s2a-request-intake.<your-subdomain>.workers.dev';
const REQUEST_SECRET   = '<the INTAKE_SECRET you set>'; // '' if you skipped it
```

The Worker host is already in `apps/s2a-toolkit/manifest.json` → `networkAccess.allowedDomains` (`localhost:8787` for dev is there too). Rebuild the plugin (`npm run build`) and re-import it. Requests — and their images — now flow through the Worker, and the GitHub author becomes the bot token (the body's **Requested by** is the real requester).

## The GitHub token

Prefer a **fine-grained PAT** scoped to `adobecom/consonant` with **Issues: read/write** (and org SSO authorized). This one credential is the only place a GitHub account is needed — requesters use none.
