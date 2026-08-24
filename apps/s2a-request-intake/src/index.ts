/// <reference types="@cloudflare/workers-types" />
//
// s2a-request-intake — a Cloudflare Worker that turns S2A plugin requests into
// triage-ready GitHub issues. It holds the GitHub credential server-side, so
// requesters need no GitHub account (the self-serve path), and it stores any
// attached images in Workers KV (free tier, no payment method) and embeds them.
//
//   POST /            file a request  → { url, number, images }
//   GET  /asset/<key> serve an uploaded image from KV (public, for GitHub)
//   GET  /            a one-line health/info string
//
// Images live in KV with a TTL, so storage self-expires and usage stays a
// rounding error against the free tier. KV is eventually consistent, so a
// freshly-uploaded image can 404 for up to ~60s before it propagates to the
// edge GitHub fetches from — fine for triage, and GitHub re-fetches.
//
// Deploy:  npm install && npm run deploy   (see README for KV + secret setup)
// Local:   npm run dev                     → http://localhost:8787

export interface Env {
  // KV namespace that stores uploaded images. Served back via GET /asset/<key>.
  INTAKE_KV: KVNamespace;
  // GitHub PAT with Issues: read/write on GH_REPO. Set as a Wrangler secret.
  GH_TOKEN: string;
  // Optional shared secret. If set (as a Wrangler secret), POSTs must send a
  // matching `x-intake-secret` header. Unset = open.
  INTAKE_SECRET?: string;
  // Target repo, e.g. "adobecom/consonant".
  GH_REPO: string;
}

// The payload the plugin's Request tab POSTs (Worker mode).
interface IntakePayload {
  kind?: string;
  priority?: string;
  summary?: string;
  useCase?: string;
  figmaUrl?: string;
  fileName?: string;
  page?: string;
  nodeName?: string;
  tokenName?: string;
  requester?: string;
  images?: Array<{ name?: string; type?: string; dataUrl?: string }>;
}

const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-intake-secret",
};

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB per image (KV value limit is 25MB)
const IMAGE_TTL_SECONDS = 90 * 24 * 60 * 60; // auto-expire after 90 days

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json", ...CORS },
  });
}

// Decode a `data:<type>;base64,<data>` URL into bytes + content type.
function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; contentType: string } | null {
  const m = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/.exec(dataUrl || "");
  if (!m) return null;
  const contentType = m[1] || "application/octet-stream";
  try {
    if (m[2]) {
      const bin = atob(m[3]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return { bytes, contentType };
    }
    return { bytes: new TextEncoder().encode(decodeURIComponent(m[3])), contentType };
  } catch {
    return null;
  }
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

function escapeMd(s: string): string {
  return String(s).replace(/([[\]()])/g, "\\$1");
}

function renderBody(p: IntakePayload, imageMd: string[]): string {
  const lines = [
    `**Requested by:** ${p.requester || "(unknown)"}`,
    `**Type:** ${p.kind || "—"} · **Priority:** ${p.priority || "—"}`,
    "",
    "### What",
    p.summary || "",
    "",
    "### Use case",
    p.useCase || "",
    "",
  ];
  if (p.figmaUrl) lines.push(`**Figma:** ${p.figmaUrl}`);
  if (p.tokenName) lines.push(`**Token:** \`${p.tokenName}\``);
  if (p.fileName) {
    lines.push(
      `**File / page:** ${p.fileName} › ${p.page || ""}` +
        (p.nodeName ? ` · **Node:** ${p.nodeName}` : ""),
    );
  }
  if (imageMd.length) lines.push("", "### Images", ...imageMd);
  lines.push("", "<sub>Filed via the S2A intake Worker.</sub>");
  return lines.join("\n");
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    // ── Serve an uploaded image (public — GitHub fetches these at render) ──────
    if (req.method === "GET" && url.pathname.startsWith("/asset/")) {
      const key = decodeURIComponent(url.pathname.slice("/asset/".length));
      const { value, metadata } = await env.INTAKE_KV.getWithMetadata<{ contentType: string }>(
        key,
        "arrayBuffer",
      );
      if (!value) return new Response("Not found", { status: 404 });
      return new Response(value, {
        headers: {
          "content-type": metadata?.contentType || "application/octet-stream",
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    }

    if (req.method === "GET") {
      return new Response("s2a-request-intake — POST a request to file a GitHub issue.", {
        headers: { "content-type": "text/plain", ...CORS },
      });
    }

    if (req.method !== "POST") return json({ error: "POST only" }, 405);

    // ── Auth (optional shared secret) ─────────────────────────────────────────
    if (env.INTAKE_SECRET && req.headers.get("x-intake-secret") !== env.INTAKE_SECRET) {
      return json({ error: "unauthorized" }, 401);
    }

    let p: IntakePayload;
    try {
      p = (await req.json()) as IntakePayload;
    } catch {
      return json({ error: "invalid JSON" }, 400);
    }
    if (!p.summary || !p.useCase) {
      return json({ error: "summary and useCase are required" }, 422);
    }

    // ── Store images in KV (with TTL) → markdown served from this Worker ───────
    const imageMd: string[] = [];
    const images = Array.isArray(p.images) ? p.images.slice(0, MAX_IMAGES) : [];
    for (const img of images) {
      if (!img?.dataUrl) continue;
      const decoded = decodeDataUrl(img.dataUrl);
      if (!decoded) continue;
      if (!decoded.contentType.startsWith("image/")) continue;
      if (decoded.bytes.length > MAX_IMAGE_BYTES) continue;
      const ext = EXT_BY_TYPE[decoded.contentType] || "bin";
      const key = `intake/${crypto.randomUUID()}.${ext}`;
      try {
        await env.INTAKE_KV.put(key, decoded.bytes, {
          expirationTtl: IMAGE_TTL_SECONDS,
          metadata: { contentType: decoded.contentType },
        });
        imageMd.push(`![${escapeMd(img.name || "attachment")}](${url.origin}/asset/${key})`);
      } catch {
        /* skip an image that fails to store — never block the issue */
      }
    }

    // ── Create the GitHub issue ───────────────────────────────────────────────
    const title = `[Request] ${String(p.summary).slice(0, 70)}`;
    const body = renderBody(p, imageMd);

    const res = await fetch(`https://api.github.com/repos/${env.GH_REPO}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "s2a-request-intake",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body, labels: ["s2a-request", "needs-triage"] }),
    });

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      return json({ error: `GitHub API ${res.status}`, detail }, 502);
    }

    const issue = (await res.json()) as { html_url: string; number: number };
    return json({ url: issue.html_url, number: issue.number, images: imageMd.length });
  },
};
