/**
 * S2A Design System MCP Server — Vercel Serverless HTTP handler
 *
 * Exposes all S2A DS tools over the MCP Streamable HTTP transport.
 * Stateless mode — no session persistence between requests (safe for serverless).
 *
 * Endpoint: POST /api/mcp  (or whatever Vercel routes to this file)
 *
 * Claude.ai / Cursor remote MCP config:
 *   {
 *     "mcpServers": {
 *       "s2a-ds": {
 *         "url": "https://<your-deployment>.vercel.app/api/mcp"
 *       }
 *     }
 *   }
 *
 * DS_ROOT env var:
 *   Set in Vercel project settings → Environment Variables.
 *   Defaults to the bundled data/ directory at build time — no manual config needed.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync } from "fs";

import { registerTokenTools } from "../src/tools/tokens.js";
import { registerComponentTools } from "../src/tools/components.js";
import { registerValidateTools } from "../src/tools/validate.js";
import { registerSpecTools } from "../src/tools/spec.js";
import { registerAuditTools } from "../src/tools/audit.js";

// ── Resolve DS_ROOT ───────────────────────────────────────────────────────────
// Priority:
//   1. DS_ROOT env var (manual override / local dev)
//   2. Bundled data/ directory copied at build time (Vercel production)
//   3. Repo root relative to this file (local dev from source)

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function resolveRoot(): string {
  if (process.env.DS_ROOT) return resolve(process.env.DS_ROOT);

  // Bundled data/ (Vercel): data/ sits next to api/ at the project root
  const bundled = resolve(__dirname, "..", "data");
  if (existsSync(resolve(bundled, "packages/tokens/json/metadata.json"))) {
    return bundled;
  }

  // Dev fallback: this file is at apps/s2a-ds-mcp/api/mcp.ts → ../../../ = repo root
  const devRoot = resolve(__dirname, "../../..");
  return devRoot;
}

const DS_ROOT = resolveRoot();

// ── CORS helper ───────────────────────────────────────────────────────────────
function setCors(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Mcp-Session-Id");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
}

// ── Vercel handler ────────────────────────────────────────────────────────────
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setCors(res);

  // Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.method === "GET" && (req as IncomingMessage & { url?: string }).url === "/api/mcp") {
    const body = JSON.stringify({ status: "ok", name: "s2a-ds", version: "0.1.0", dsRoot: DS_ROOT });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(body);
    return;
  }

  // Create a new server per request — stateless serverless pattern.
  // Module-level cache (dsCache) persists across warm invocations automatically.
  const server = new McpServer({
    name: "s2a-ds",
    version: "0.1.0",
  });

  registerTokenTools(server, DS_ROOT);
  registerComponentTools(server, DS_ROOT);
  registerValidateTools(server, DS_ROOT);
  registerSpecTools(server, DS_ROOT);
  registerAuditTools(server, DS_ROOT);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — required for serverless
  });

  await server.connect(transport);

  // Collect body for POST requests (Vercel may or may not pre-parse)
  const parsedBody = await getParsedBody(req);
  await transport.handleRequest(req, res, parsedBody);
}

/** Read and parse the request body if not already parsed by the framework */
async function getParsedBody(req: IncomingMessage): Promise<unknown> {
  // Vercel may attach a pre-parsed body
  const r = req as IncomingMessage & { body?: unknown };
  if (r.body !== undefined) return r.body;

  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : undefined);
      } catch {
        resolve(undefined);
      }
    });
    req.on("error", reject);
  });
}
