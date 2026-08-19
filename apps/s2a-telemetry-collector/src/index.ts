/// <reference types="@cloudflare/workers-types" />
//
// s2a-telemetry-collector — a minimal Cloudflare Worker that ingests s2a-ds-mcp
// usage events and aggregates them live in a single Durable Object.
//
//   POST /            ingest one event (the JSON s2a-ds-mcp emits)
//   GET  /stats       aggregated stats as JSON
//   GET  /            a tiny live dashboard
//
// Why a Durable Object: it gives one strongly-consistent, in-memory aggregate
// that every Worker request updates without races — perfect for running per-tool
// counts and a unique-user set (many concurrent POSTs, one coherent tally).
//
// Run locally:  npm install && npm run dev   → http://localhost:8787
// Point the MCP at it:  S2A_TELEMETRY_ENDPOINT=http://localhost:8787

export interface Env {
  AGG: DurableObjectNamespace;
  // Optional shared secret. If set (as a Wrangler secret), POSTs must send
  // `Authorization: Bearer <token>`. Unset = open (fine for local POC).
  INGEST_TOKEN?: string;
}

/** The event shape emitted by s2a-ds-mcp's telemetry. */
interface UsageEvent {
  tool: string;
  status: "ok" | "error";
  durationMs: number;
  ts: string;
  anonId: string;
  version: string;
  server?: string;
}

const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, authorization",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json", ...CORS },
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    const stub = env.AGG.get(env.AGG.idFromName("global"));

    // Ingest — any POST path.
    if (req.method === "POST") {
      if (env.INGEST_TOKEN) {
        const auth = req.headers.get("authorization") ?? "";
        if (auth !== `Bearer ${env.INGEST_TOKEN}`) return json({ error: "unauthorized" }, 401);
      }
      let ev: UsageEvent;
      try {
        ev = (await req.json()) as UsageEvent;
      } catch {
        return json({ error: "invalid json" }, 400);
      }
      if (!ev || typeof ev.tool !== "string") return json({ error: "missing tool" }, 400);
      await stub.fetch("https://do/record", { method: "POST", body: JSON.stringify(ev) });
      return json({ ok: true }, 202);
    }

    if (url.pathname === "/stats") {
      const res = await stub.fetch("https://do/stats");
      return new Response(await res.text(), {
        headers: { "content-type": "application/json", ...CORS },
      });
    }

    // Default: the dashboard.
    return new Response(DASHBOARD, { headers: { "content-type": "text/html; charset=utf-8" } });
  },
};

// ── Durable Object: one global aggregator ───────────────────────────────────

interface ToolAgg {
  count: number;
  ok: number;
  error: number;
  totalMs: number;
}
interface Agg {
  events: number;
  firstSeen: string | null;
  lastSeen: string | null;
  tools: Record<string, ToolAgg>;
  users: Record<string, number>; // anonId (hashed) -> event count
  versions: Record<string, number>;
  days: Record<string, number>; // YYYY-MM-DD -> count
}
function emptyAgg(): Agg {
  return { events: 0, firstSeen: null, lastSeen: null, tools: {}, users: {}, versions: {}, days: {} };
}

export class Aggregator {
  private storage: DurableObjectStorage;
  private agg: Agg = emptyAgg();
  private ready: Promise<void>;

  constructor(state: DurableObjectState) {
    this.storage = state.storage;
    // Load persisted aggregate before serving any request.
    this.ready = state.blockConcurrencyWhile(async () => {
      this.agg = (await this.storage.get<Agg>("agg")) ?? emptyAgg();
    });
  }

  async fetch(req: Request): Promise<Response> {
    await this.ready;
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/record") {
      const ev = (await req.json()) as UsageEvent;
      this.record(ev);
      await this.storage.put("agg", this.agg);
      return new Response("ok");
    }

    return new Response(JSON.stringify(this.stats(), null, 2), {
      headers: { "content-type": "application/json" },
    });
  }

  private record(ev: UsageEvent): void {
    const a = this.agg;
    a.events++;
    a.lastSeen = ev.ts || new Date().toISOString();
    if (!a.firstSeen) a.firstSeen = a.lastSeen;

    const t = (a.tools[ev.tool] ??= { count: 0, ok: 0, error: 0, totalMs: 0 });
    t.count++;
    if (ev.status === "error") t.error++;
    else t.ok++;
    t.totalMs += Number(ev.durationMs) || 0;

    if (ev.anonId) a.users[ev.anonId] = (a.users[ev.anonId] || 0) + 1;
    if (ev.version) a.versions[ev.version] = (a.versions[ev.version] || 0) + 1;

    const day = (ev.ts || "").slice(0, 10) || new Date().toISOString().slice(0, 10);
    a.days[day] = (a.days[day] || 0) + 1;
  }

  private stats() {
    const a = this.agg;
    const tools = Object.entries(a.tools)
      .map(([tool, s]) => ({
        tool,
        count: s.count,
        ok: s.ok,
        error: s.error,
        avgMs: s.count ? Math.round(s.totalMs / s.count) : 0,
      }))
      .sort((x, y) => y.count - x.count);
    return {
      events: a.events,
      uniqueUsers: Object.keys(a.users).length, // count only — no ids exposed
      firstSeen: a.firstSeen,
      lastSeen: a.lastSeen,
      tools,
      versions: a.versions,
      days: a.days,
    };
  }
}

const DASHBOARD = `<!doctype html><html><head><meta charset="utf-8">
<title>S2A DS MCP — usage</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif; max-width: 820px; margin: 40px auto; padding: 0 20px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: #888; margin-bottom: 24px; }
  .cards { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
  .card { border: 1px solid #8883; border-radius: 10px; padding: 14px 18px; min-width: 120px; }
  .card .n { font-size: 26px; font-weight: 700; }
  .card .l { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #8882; }
  th { color: #888; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .err { color: #c0392b; }
  .muted { color: #999; }
</style></head><body>
  <h1>S2A DS MCP — usage</h1>
  <div class="sub">Live from the Durable Object · refreshes every 3s</div>
  <div class="cards" id="cards"></div>
  <table><thead><tr><th>Tool</th><th class="num">Calls</th><th class="num">Errors</th><th class="num">Avg ms</th></tr></thead>
  <tbody id="rows"></tbody></table>
  <p class="muted" id="seen"></p>
<script>
async function tick(){
  try{
    const s = await (await fetch('/stats')).json();
    document.getElementById('cards').innerHTML =
      card(s.events,'events') + card(s.uniqueUsers,'unique users') + card((s.tools||[]).length,'tools used');
    document.getElementById('rows').innerHTML = (s.tools||[]).map(t =>
      '<tr><td>'+t.tool+'</td><td class="num">'+t.count+'</td><td class="num '+(t.error?'err':'')+'">'+t.error+'</td><td class="num">'+t.avgMs+'</td></tr>'
    ).join('') || '<tr><td colspan="4" class="muted">No events yet — POST one to see it here.</td></tr>';
    document.getElementById('seen').textContent = s.lastSeen ? ('last event: '+new Date(s.lastSeen).toLocaleString()) : '';
  }catch(e){}
}
function card(n,l){ return '<div class="card"><div class="n">'+n+'</div><div class="l">'+l+'</div></div>'; }
tick(); setInterval(tick, 3000);
</script></body></html>`;
