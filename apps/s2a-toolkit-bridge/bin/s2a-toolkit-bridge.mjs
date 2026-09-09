#!/usr/bin/env node
/**
 * @adobecom/s2a-toolkit-bridge
 *
 * A thin, blessed launcher for the S2A Toolkit's Claude Code Bridge. It runs a
 * pinned, known-good `figma-console-mcp` with the defaults the toolkit expects,
 * so teammates paste ONE command instead of chasing package versions and flags.
 *
 * It does not replace the toolkit plugin (that installs from Adobe Enterprise in
 * Figma) — it's the local MCP server the plugin's Bridge tab connects to over
 * ws://localhost:9223–9232.
 *
 * Required (per person): a Figma personal access token, passed as FIGMA_ACCESS_TOKEN.
 * We default ENABLE_MCP_APPS=true so the design-system tools are available.
 */

import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { hostname, userInfo } from "node:os";

const require = createRequire(import.meta.url);

// Resolve the pinned figma-console-mcp entry via its package.json + bin map,
// which works regardless of the package's "exports" configuration.
let entry;
try {
  const pkgJsonPath = require.resolve("figma-console-mcp/package.json");
  const pkg = require("figma-console-mcp/package.json");
  const binRel = typeof pkg.bin === "string" ? pkg.bin : pkg.bin["figma-console-mcp"];
  entry = resolve(dirname(pkgJsonPath), binRel);
} catch {
  process.stderr.write(
    "[s2a-toolkit-bridge] Could not locate figma-console-mcp. Reinstall the package (its dependency should be bundled).\n"
  );
  process.exit(1);
}

const env = { ...process.env };

// Preset the toolkit's expected defaults without clobbering an explicit override.
if (env.ENABLE_MCP_APPS === undefined) env.ENABLE_MCP_APPS = "true";

// Friendly preflight — warn on stderr only (stdout is the MCP protocol channel).
if (!env.FIGMA_ACCESS_TOKEN) {
  process.stderr.write(
    "[s2a-toolkit-bridge] Warning: FIGMA_ACCESS_TOKEN is not set.\n" +
    "  The Bridge needs a Figma personal access token (starts with 'figd_').\n" +
    "  Set it in your MCP client config, e.g. \"env\": { \"FIGMA_ACCESS_TOKEN\": \"figd_...\" }.\n" +
    "  Create one: https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens\n"
  );
}

// ── Usage telemetry (POC) ─────────────────────────────────────────────────────
// Records that the Bridge was used — a session start and its duration. Nothing
// sensitive: just the event, a timestamp, an anonymous machine id, and version.
// OFF unless S2A_TELEMETRY_ENDPOINT is set; opt out with S2A_TELEMETRY=0 /
// DO_NOT_TRACK. Every path is fail-silent.
const TEL_ENDPOINT = process.env.S2A_TELEMETRY_ENDPOINT?.trim() || "";
const TEL_OPTOUT = process.env.S2A_TELEMETRY === "0" || process.env.DO_NOT_TRACK === "1";
let TEL_VERSION = "0.0.0";
try {
  TEL_VERSION = require("../package.json").version;
} catch {
  /* keep default */
}
let _anonId;
function anonId() {
  if (_anonId) return _anonId;
  let seed = "unknown";
  try {
    seed = `${hostname()}::${userInfo().username}`;
  } catch {
    /* keep default */
  }
  _anonId = createHash("sha256").update(seed).digest("hex").slice(0, 16);
  return _anonId;
}
async function emit(tool, durationMs) {
  if (!TEL_ENDPOINT || TEL_OPTOUT) return;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 800);
    await fetch(TEL_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tool,
        status: "ok",
        durationMs,
        ts: new Date().toISOString(),
        anonId: anonId(),
        version: TEL_VERSION,
        server: "s2a-toolkit-bridge",
      }),
      signal: ctrl.signal,
    }).catch(() => {});
    clearTimeout(timer);
  } catch {
    /* best-effort */
  }
}

const startedAt = Date.now();
emit("bridge:start", 0); // fire-and-forget; the process keeps running

// Hand off transparently: the child speaks MCP over inherited stdio.
const child = spawn(process.execPath, [entry, ...process.argv.slice(2)], {
  stdio: "inherit",
  env,
});

async function shutdown(code, signal) {
  // Best-effort session-duration event, bounded by emit()'s 800ms timeout.
  await emit("bridge:stop", Date.now() - startedAt);
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
}
child.on("exit", (code, signal) => {
  void shutdown(code, signal);
});
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
