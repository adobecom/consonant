#!/usr/bin/env node
/**
 * S2A Design System MCP Server — stdio mode
 *
 * Runs as a local MCP server via Claude Code / Cursor / any stdio MCP client.
 *
 * Data root resolution (no config needed for the published package):
 *   1. DS_ROOT env var — absolute path to a consonant repo checkout (for DS
 *      maintainers who want the server to read *live* tokens/components).
 *   2. The data/ snapshot bundled next to dist/ in the published package.
 *   3. The repo root, when running from source inside the monorepo.
 *
 * Usage — installed from GitHub Packages (bundled data, zero config):
 *   {
 *     "mcpServers": {
 *       "s2a-ds": { "command": "npx", "args": ["-y", "@adobecom/s2a-ds-mcp"] }
 *     }
 *   }
 *
 * Usage — from a repo checkout against live sources:
 *   {
 *     "mcpServers": {
 *       "s2a-ds": {
 *         "command": "node",
 *         "args": ["apps/s2a-ds-mcp/dist/local.js"],
 *         "env": { "DS_ROOT": "/absolute/path/to/consonant" }
 *       }
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync } from "fs";

import { registerTokenTools } from "./tools/tokens.js";
import { registerComponentTools } from "./tools/components.js";
import { registerValidateTools } from "./tools/validate.js";
import { registerSpecTools } from "./tools/spec.js";
import { registerAuditTools } from "./tools/audit.js";
import { instrument, telemetryEnabled } from "./telemetry.js";

// ── Resolve DS_ROOT ───────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// A directory is a valid data root if it contains the token metadata index.
const hasData = (root: string): boolean =>
  existsSync(resolve(root, "packages/tokens/json/metadata.json"));

function resolveRoot(): string | null {
  // 1. Explicit override — a live repo checkout.
  if (process.env.DS_ROOT) {
    const r = resolve(process.env.DS_ROOT);
    return hasData(r) ? r : null;
  }
  // 2. Bundled snapshot: dist/local.js → ../data (published package layout).
  const bundled = resolve(__dirname, "..", "data");
  if (hasData(bundled)) return bundled;
  // 3. Running from source inside the monorepo: dist/local.js → ../../.. = repo root.
  const repoRoot = resolve(__dirname, "../../..");
  if (hasData(repoRoot)) return repoRoot;
  return null;
}

const DS_ROOT = resolveRoot();

if (!DS_ROOT) {
  const attempted = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : "(none)";
  process.stderr.write(
    `[s2a-ds-mcp] ERROR: could not locate the design-system data.\n` +
    `  Looked for packages/tokens/json/metadata.json in: the bundled data/ snapshot, the repo root, and DS_ROOT=${attempted}.\n` +
    `  If you installed the package this should not happen — please report it. To point at a live repo, set DS_ROOT to its absolute path.\n`
  );
  process.exit(1);
}

process.stderr.write(`[s2a-ds-mcp] Starting. DS_ROOT=${DS_ROOT}\n`);

// ── Server setup ──────────────────────────────────────────────────────────
const server = new McpServer({
  name: "s2a-ds",
  version: "0.1.0",
});

// Usage telemetry (opt-out via S2A_TELEMETRY=0 / DO_NOT_TRACK). Must run BEFORE
// tools are registered so it can wrap each handler. No-op when opted out.
instrument(server);

// Register all tool groups
registerTokenTools(server, DS_ROOT);
registerComponentTools(server, DS_ROOT);
registerValidateTools(server, DS_ROOT);
registerSpecTools(server, DS_ROOT);
registerAuditTools(server, DS_ROOT);

// ── Start ─────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write(
  `[s2a-ds-mcp] Ready. Usage telemetry: ${telemetryEnabled() ? "on" : "off"}` +
    (telemetryEnabled() ? " (anonymous; set S2A_TELEMETRY=0 to disable)" : "") +
    ".\n"
);
