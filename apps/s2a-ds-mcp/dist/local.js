#!/usr/bin/env node
/**
 * S2A Design System MCP Server — stdio mode
 *
 * Runs as a local MCP server via Claude Code / Cursor / any stdio MCP client.
 *
 * Requirements:
 *   DS_ROOT env var — absolute path to the consonant-2 repo root.
 *   Defaults to the directory two levels above this file (apps/s2a-ds-mcp → repo root).
 *
 * Usage (Claude Code .claude/settings.json):
 *   {
 *     "mcpServers": {
 *       "s2a-ds": {
 *         "command": "node",
 *         "args": ["apps/s2a-ds-mcp/dist/local.js"],
 *         "env": { "DS_ROOT": "/absolute/path/to/consonant-2" }
 *       }
 *     }
 *   }
 *
 * Or via NPX after publish:
 *   { "command": "npx", "args": ["-y", "@adobecom/s2a-ds-mcp"], "env": { "DS_ROOT": "." } }
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
// ── Resolve DS_ROOT ───────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Default: dist/local.js is at apps/s2a-ds-mcp/dist/local.js → ../../.. = repo root
const DEFAULT_ROOT = resolve(__dirname, "../../..");
const DS_ROOT = process.env.DS_ROOT
    ? resolve(process.env.DS_ROOT)
    : DEFAULT_ROOT;
// Sanity check
if (!existsSync(resolve(DS_ROOT, "packages/tokens/json/metadata.json"))) {
    process.stderr.write(`[s2a-ds-mcp] ERROR: DS_ROOT "${DS_ROOT}" does not look like the consonant-2 repo root.\n` +
        `  Expected to find packages/tokens/json/metadata.json.\n` +
        `  Set the DS_ROOT environment variable to the absolute path of the repo.\n`);
    process.exit(1);
}
process.stderr.write(`[s2a-ds-mcp] Starting. DS_ROOT=${DS_ROOT}\n`);
// ── Server setup ──────────────────────────────────────────────────────────
const server = new McpServer({
    name: "s2a-ds",
    version: "0.1.0",
});
// Register all tool groups
registerTokenTools(server, DS_ROOT);
registerComponentTools(server, DS_ROOT);
registerValidateTools(server, DS_ROOT);
registerSpecTools(server, DS_ROOT);
registerAuditTools(server, DS_ROOT);
// ── Start ─────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("[s2a-ds-mcp] Ready.\n");
//# sourceMappingURL=local.js.map