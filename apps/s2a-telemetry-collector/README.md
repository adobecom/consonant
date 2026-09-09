# `s2a-telemetry-collector`

A minimal **Cloudflare Worker + Durable Object** that ingests the usage events
`s2a-ds-mcp` emits and aggregates them **live**. It's the collector end of the
telemetry POC — the thing `S2A_TELEMETRY_ENDPOINT` points at.

## Endpoints

| Route | What |
|---|---|
| `POST /` | Ingest one event (the JSON the MCP emits). Returns `202`. |
| `GET /stats` | Aggregated stats as JSON. |
| `GET /` | A tiny live dashboard (auto-refreshes every 3s). |

## Why a Durable Object

All events route to **one** DO instance (`idFromName("global")`). A DO is
single-threaded and strongly consistent, so concurrent POSTs update one coherent
aggregate with no races — ideal for **running per-tool counts** and a
**unique-user set**. Raw history/queries would instead go to Analytics Engine or
D1; this POC keeps it to the live aggregate.

## Run it locally

```bash
cd apps/s2a-telemetry-collector
npm install
npm run dev          # → http://localhost:8787  (local DO via workerd, no CF account needed)
```

Then point the MCP at it and use some tools:

```bash
export S2A_TELEMETRY_ENDPOINT=http://localhost:8787
# ...run s2a-ds-mcp and call a few tools...
```

Or fire a test event by hand:

```bash
curl -s -XPOST http://localhost:8787 -H 'content-type: application/json' \
  -d '{"tool":"resolve_token","status":"ok","durationMs":5,"ts":"2026-08-19T21:00:00.000Z","anonId":"abc123","version":"0.1.0"}'
curl -s http://localhost:8787/stats
```

Open <http://localhost:8787> to watch the dashboard update.

## What's stored

Per tool: `count`, `ok`, `error`, `avgMs`. Plus `events`, `uniqueUsers` (count
only — **no ids are exposed** via `/stats`), per-version and per-day tallies. The
DO persists its aggregate, so restarts don't lose the tally.

## Deploy (when you're ready)

```bash
npm run deploy       # needs a Cloudflare account + `wrangler login`
```

Lock down ingestion with a shared secret (optional):

```bash
npx wrangler secret put INGEST_TOKEN
# then send `Authorization: Bearer <token>` from the client
```

If `INGEST_TOKEN` is unset, ingestion is open — fine for local, not for a public
production endpoint.
