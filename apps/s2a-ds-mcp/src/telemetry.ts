// src/telemetry.ts — usage telemetry (proof of concept)
//
// Goal: see which tools get used, how often, and roughly by how many distinct
// users — WITHOUT collecting anything sensitive. No arguments, no results, no
// token values, no file contents. Just: which tool, when, ok/error, how long.
//
// Privacy posture (POC defaults):
//   • Nothing leaves the machine by default. With no S2A_TELEMETRY_ENDPOINT set,
//     events are appended to a local JSONL file so you can inspect them.
//   • Set S2A_TELEMETRY_ENDPOINT to POST events to a collector (fire-and-forget).
//   • Opt out entirely with S2A_TELEMETRY=0 or the standard DO_NOT_TRACK=1.
//   • The only identifier is a one-way hash of hostname+username, truncated —
//     stable per machine, not reversible to a person.
//
// Telemetry must never change behavior: every path here is fail-silent and
// non-blocking, and the wrapper always returns the tool's real result.

import { createHash } from "node:crypto";
import { hostname, userInfo, homedir } from "node:os";
import { appendFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let VERSION = "0.0.0";
try {
  VERSION = require("../package.json").version;
} catch {
  /* keep default */
}

const OPT_OUT = process.env.S2A_TELEMETRY === "0" || process.env.DO_NOT_TRACK === "1";
const ENDPOINT = process.env.S2A_TELEMETRY_ENDPOINT?.trim() || "";
const DEBUG = process.env.S2A_TELEMETRY_DEBUG === "1";
const LOCAL_LOG = join(homedir(), ".s2a-ds-mcp", "usage.jsonl");

let _anonId: string | null = null;
/** Stable, anonymous machine id: truncated one-way hash of hostname+username. */
function anonId(): string {
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

export interface UsageEvent {
  tool: string;
  status: "ok" | "error";
  durationMs: number;
  ts: string;
  anonId: string;
  version: string;
  server: "s2a-ds-mcp";
}

export function telemetryEnabled(): boolean {
  return !OPT_OUT;
}

/** Fire-and-forget. Never throws, never blocks a tool result. */
function emit(partial: Pick<UsageEvent, "tool" | "status" | "durationMs">): void {
  if (OPT_OUT) return;
  const ev: UsageEvent = {
    ...partial,
    ts: new Date().toISOString(),
    anonId: anonId(),
    version: VERSION,
    server: "s2a-ds-mcp",
  };
  const line = JSON.stringify(ev);
  if (DEBUG) process.stderr.write(`[s2a-ds-mcp:telemetry] ${line}\n`);

  if (ENDPOINT) {
    // Non-blocking POST; swallow every failure — telemetry is best-effort.
    void (async () => {
      try {
        await fetch(ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: line,
        });
      } catch {
        /* best-effort */
      }
    })();
  } else {
    // Local POC sink so events are visible without any collector.
    void (async () => {
      try {
        await mkdir(dirname(LOCAL_LOG), { recursive: true });
        await appendFile(LOCAL_LOG, line + "\n");
      } catch {
        /* best-effort */
      }
    })();
  }
}

type ToolHandler = (...args: unknown[]) => unknown | Promise<unknown>;

// Structural type for "something with a .tool registrar". `any` here is
// deliberate: McpServer.tool is heavily overloaded, and this wrapper is
// signature-agnostic (it only cares that the handler is the last argument).
type ToolRegistrar = { tool: (...args: any[]) => any };

/**
 * Instrument an McpServer so every registered tool emits a usage event on call.
 * One line to wire up — no per-tool changes. Wraps `server.tool`, intercepting
 * the handler (always the last argument across the SDK's overloads).
 */
export function instrument(server: ToolRegistrar): void {
  if (OPT_OUT) {
    if (DEBUG) process.stderr.write("[s2a-ds-mcp:telemetry] disabled (opt-out)\n");
    return;
  }
  const original = server.tool.bind(server);
  server.tool = (...args: any[]) => {
    const name = typeof args[0] === "string" ? (args[0] as string) : "unknown";
    const handler = args[args.length - 1];
    if (typeof handler === "function") {
      const orig = handler as ToolHandler;
      args[args.length - 1] = async (...hArgs: unknown[]) => {
        const start = Date.now();
        try {
          const res = (await orig(...hArgs)) as { isError?: boolean } | undefined;
          emit({ tool: name, status: res?.isError ? "error" : "ok", durationMs: Date.now() - start });
          return res;
        } catch (err) {
          emit({ tool: name, status: "error", durationMs: Date.now() - start });
          throw err;
        }
      };
    }
    return original(...args);
  };
}
