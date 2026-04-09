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
export {};
//# sourceMappingURL=local.d.ts.map