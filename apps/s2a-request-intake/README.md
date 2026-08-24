# `s2a-request-intake`

A **Cloudflare Worker** that turns S2A plugin requests into **triage-ready GitHub issues**. It's the endpoint the plugin's **Request tab** POSTs to in Worker mode.

Why a Worker (vs. the plugin posting to GitHub directly):
- **No per-user GitHub account.** The Worker holds one GitHub credential server-side, so any designer can file a request — the self-serve path.
- **Image hosting.** A PAT can't attach binaries to an issue. The Worker stores uploaded images in **R2** and embeds them in the issue body. Images are served back through the Worker itself (`GET /asset/<key>`) — no public-bucket config needed.

## Endpoints

| Route | What |
|---|---|
| `POST /` | File a request. Body = the plugin's JSON payload. Returns `{ url, number, images }`. |
| `GET /asset/<key>` | Serve an uploaded image from R2 (public, immutable-cached — this is what GitHub fetches). |
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
`summary` and `useCase` are required. Up to 4 images, ≤5MB each; anything else is skipped, never blocking the issue.

## Setup & deploy

```bash
npm install

# 1. Create the R2 bucket (matches wrangler.toml binding)
wrangler r2 bucket create s2a-request-intake

# 2. Set secrets
wrangler secret put GH_TOKEN        # a PAT with Issues: read/write on adobecom/consonant
wrangler secret put INTAKE_SECRET   # optional — a long random string the plugin also sends

# 3. Ship it
npm run deploy                      # → https://s2a-request-intake.<your-subdomain>.workers.dev
```

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
