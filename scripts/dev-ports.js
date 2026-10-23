#!/usr/bin/env node
// dev-ports.js — see and clean up the local S2A dev servers.
//
// These are long-lived background processes (the Figma bridge, the contract sync
// server, Storybook) that are easy to start and easy to forget. Orphans cause
// two specific failures that look like bugs:
//
//   * a second figma-console bridge on 9224/9225 while the plugin talks to 9223,
//     so figma_execute lands in a file you are not looking at;
//   * a weeks-old contract sync server still serving older code, which the
//     toolkit reports as "Sync server is running older code. Restart it."
//
// Status is the default and never kills anything.
//
//   node scripts/dev-ports.js                 what is running (safe)
//   node scripts/dev-ports.js --clean         kill anything older than --older-than
//   node scripts/dev-ports.js --clean --all   kill every match, regardless of age
//   node scripts/dev-ports.js --clean --keep 9223
//   node scripts/dev-ports.js --free 4002,6006        used by `predev`
//   node scripts/dev-ports.js --older-than 2d
//
// npm run dev:ports            npm run dev:ports:clean
import { execSync } from "node:child_process";

const SERVERS = [
  { port: 6006, name: "Storybook", start: "npm run storybook" },
  { port: 4002, name: "token watch", start: "npm run tokens:watch" },
  { port: 9400, name: "prototype server", start: "npm run prototype-server" },
  { port: 9410, name: "contract sync", start: "npm run contract-sync  (in apps/s2a-toolkit)" },
  { port: 9420, name: "contract relay", start: "npm run contract:relay" },
  // The primary bridge is long-lived on purpose — it stays up for the whole
  // session, so age says nothing about it. The failure mode is a SECOND bridge:
  // the plugin talks to 9223 while a stray one on 9224+ answers your tool calls
  // against a different file. Any of those is an orphan no matter how new.
  { port: 9223, name: "figma-console bridge (primary)", start: "started by the MCP client", longLived: true },
  ...Array.from({ length: 9 }, (_, i) => ({
    port: 9224 + i,
    name: `figma-console bridge #${i + 2}`,
    start: "started by the MCP client — only one bridge should be running",
    duplicate: true,
  })),
];

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };

// "90m", "2d", "12h" -> seconds. Default 1 day: anything older is an orphan from
// a previous session, anything newer is probably the one you are using now.
function toSeconds(s = "1d") {
  const m = /^(\d+)([smhd])$/.exec(s.trim());
  if (!m) throw new Error(`--older-than wants something like 90m, 12h or 2d (got "${s}")`);
  return Number(m[1]) * { s: 1, m: 60, h: 3600, d: 86400 }[m[2]];
}

const sh = (cmd) => { try { return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };

// elapsed time as ps reports it: [[dd-]hh:]mm:ss
function etimeToSeconds(etime) {
  const [left, right] = etime.includes("-") ? etime.split("-") : [null, etime];
  const parts = right.split(":").map(Number);
  const [h, m, s] = parts.length === 3 ? parts : [0, parts[0], parts[1]];
  return (Number(left) || 0) * 86400 + h * 3600 + m * 60 + s;
}

const fmtAge = (sec) => sec >= 86400 ? `${Math.floor(sec / 86400)}d` : sec >= 3600 ? `${Math.floor(sec / 3600)}h` : `${Math.floor(sec / 60)}m`;

function listening(port) {
  const pids = [...new Set(sh(`lsof -tiTCP:${port} -sTCP:LISTEN`).split("\n").filter(Boolean))];
  return pids.map((pid) => {
    const line = sh(`ps -p ${pid} -o etime=,command=`);
    const [etime, ...cmd] = line.trim().split(/\s+/);
    return { pid, etime, ageSec: etime ? etimeToSeconds(etime) : 0, cmd: cmd.join(" ") };
  });
}

// The npm wrapper that spawned a server is a separate process. Killing only the
// child leaves the parent behind, which is exactly how 17-day-old orphans happen.
function parentOf(pid) {
  const ppid = sh(`ps -p ${pid} -o ppid=`).trim();
  if (!ppid || ppid === "1") return null;
  const cmd = sh(`ps -p ${ppid} -o command=`).trim();
  return /npm|node/.test(cmd) && !/^-?(zsh|bash|sh|login)/.test(cmd) ? { pid: ppid, cmd } : null;
}

function kill(pid) {
  sh(`kill ${pid}`);
  execSync("sleep 1");
  if (sh(`ps -p ${pid} -o pid=`)) { sh(`kill -9 ${pid}`); return "KILL"; }
  return "TERM";
}

// --free: the narrow pre-`npm run dev` behaviour. Clear these ports, no questions.
if (has("--free")) {
  const ports = (val("--free") || "").split(",").map((p) => Number(p.trim())).filter(Boolean);
  for (const port of ports) {
    const procs = listening(port);
    for (const p of procs) kill(p.pid);
    if (procs.length) console.log(`✓ cleared port ${port}`);
  }
  process.exit(0);
}

const clean = has("--clean");
const all = has("--all");
const keep = new Set((val("--keep") || "").split(",").map((p) => p.trim()).filter(Boolean));
const olderThan = toSeconds(val("--older-than"));

const rows = [];
for (const s of SERVERS) for (const p of listening(s.port)) rows.push({ ...s, ...p });

if (!rows.length) { console.log("No S2A dev servers are running."); process.exit(0); }

const width = Math.max(...rows.map((r) => r.name.length));
console.log(clean ? "Cleaning up:\n" : "S2A dev servers:\n");

let killed = 0;
for (const r of rows) {
  const kept = keep.has(String(r.port));
  // A duplicate bridge is always an orphan. A long-lived server (the primary
  // bridge) is never stale on age alone — only --all takes it.
  const stale = r.duplicate || (!r.longLived && r.ageSec >= olderThan);
  const target = clean && !kept && (all || stale);
  const note = kept ? "kept (--keep)" : target ? "" : r.duplicate ? "duplicate" : stale ? "stale" : r.longLived ? "in use" : "";
  console.log(`  ${String(r.port).padEnd(5)} ${r.name.padEnd(width)}  pid ${String(r.pid).padEnd(7)} ${fmtAge(r.ageSec).padStart(4)}  ${target ? "→ killing" : note}`);
  if (!target) continue;
  const parent = parentOf(r.pid);
  kill(r.pid);
  if (parent) { kill(parent.pid); console.log(`${" ".repeat(9)}also killed its npm parent (pid ${parent.pid})`); }
  killed++;
}

if (!clean) {
  const stale = rows.filter((r) => r.duplicate || (!r.longLived && r.ageSec >= olderThan));
  console.log(stale.length
    ? `\n${stale.length} to clean up (duplicate bridges, or older than ${val("--older-than") || "1d"}): npm run dev:ports:clean`
    : `\nNothing to clean up.`);
} else {
  console.log(`\nKilled ${killed}. Restart what you need:`);
  for (const s of SERVERS.filter((s) => rows.some((r) => r.port === s.port))) console.log(`  ${String(s.port).padEnd(5)} ${s.start}`);
}
