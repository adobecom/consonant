#!/usr/bin/env node
// contract-sync-apply.cjs — the sync pipeline body, one implementation for
// both transports. Reads published evidence (the inbox the relay commits, or
// --file=), places it with the same logic the local server uses, refreshes
// the code evidence and generated spec for that component, runs the gate, and
// writes a Markdown summary the PR body reuses. Exit 1 on a red gate: the
// caller (workflow) then commits nothing, which is the revert.
//
//   node apps/s2a-toolkit/server/contract-sync-apply.cjs [--file=path] [--summary=path] [--dry-run]
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { handleEvidence, contractIndex } = require("./contract-sync-server.cjs");
const { proposalFor } = require("./contract-proposal.cjs");

const REPO_ROOT = process.env.S2A_CONTRACT_REPO_ROOT || path.resolve(__dirname, "..", "..", "..");
const INBOX = path.join(REPO_ROOT, "packages", "components", "evidence", "inbox");
const args = process.argv.slice(2);
const flag = (n) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const dryRun = args.includes("--dry-run");
const summaryPath = flag("summary");

const run = (cmd, cmdArgs) => {
  if (dryRun) { console.log(`[dry-run] ${cmd} ${cmdArgs.join(" ")}`); return { status: 0, stdout: "", stderr: "" }; }
  return spawnSync(cmd, cmdArgs, { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, env: { ...process.env, S2A_CONTRACT_REPO_ROOT: undefined } });
};

const files = flag("file") ? [path.resolve(flag("file"))] : fs.existsSync(INBOX) ? fs.readdirSync(INBOX).filter((f) => f.endsWith(".json")).map((f) => path.join(INBOX, f)) : [];
if (!files.length) { console.log("Nothing to apply: no evidence in the inbox and no --file."); process.exit(0); }

const summary = [];
let red = false;
for (const file of files) {
  const evidence = JSON.parse(fs.readFileSync(file, "utf8"));
  const slugHint = path.basename(file).replace(/\.figma\.evidence\.json$|\.json$/, "");
  const [status, placed] = dryRun ? [200, { status: "dry-run", slug: slugHint, path: "(not written)", hash: null, spec: null }] : handleEvidence({ evidence, slug: fs.existsSync(path.join(REPO_ROOT, "packages", "components", "src", slugHint)) ? slugHint : undefined });
  if (status !== 200) { summary.push(`### ❌ ${slugHint}\n\n${placed.error}`); red = true; continue; }
  const slug = placed.slug;
  const hasComponent = fs.existsSync(path.join(REPO_ROOT, "packages", "components", "src", slug, `${slug}.js`));
  let hasDefs = fs.existsSync(path.join(REPO_ROOT, "packages", "components", "src", slug, `${slug}.defs.json`));
  summary.push(`### ${placed.status === "in-sync" ? "🟰" : "📥"} ${slug}: evidence ${placed.status}`, "", `- set: **${evidence.set?.name}** \`${evidence.set?.id}\` (${evidence.counts?.variants ?? "?"} variants, ${evidence.counts?.bindings ?? "?"} bindings)`, `- file: \`${placed.path}\``, `- hash: \`${placed.hash ?? "—"}\`${placed.previousHash ? ` (was \`${placed.previousHash}\`)` : ""}`, "");
  if (!dryRun && file.startsWith(INBOX)) fs.unlinkSync(file);
  if (hasComponent) {
    const ev = run("node", ["packages/components/scripts/code-evidence.mjs", `--slug=${slug}`, "--static-only"]);
    summary.push(`- code evidence: ${ev.status === 0 ? (ev.stdout.trim().split("\n")[0] || "refreshed") : "FAILED"}`);
    if (ev.status !== 0) red = true;
  }
  if (hasDefs) {
    const build = run("node", ["packages/specs/build.mjs", `--slug=${slug}`]);
    summary.push(`- spec: ${build.status === 0 ? (build.stdout.trim().split("\n")[0] || "rebuilt") : "BUILD FAILED"}`);
    if (build.status !== 0) red = true;
  } else {
    // A set with no contract: draft one through the spec dictionary so the PR
    // carries a reviewable defs.json + generated spec, not only a proposal.
    const scaffold = run("node", ["packages/specs/scaffold.mjs", `--slug=${slug}`]);
    if (scaffold.status === 0) {
      hasDefs = true;
      summary.push(`- contract: ${scaffold.stdout.trim().split("\n")[0] || "scaffolded"} (anchors.code.pending until the component exists)`);
      const build = run("node", ["packages/specs/build.mjs", `--slug=${slug}`]);
      summary.push(`- spec: ${build.status === 0 ? (build.stdout.trim().split("\n")[0] || "built") : "BUILD FAILED"}`);
      if (build.status !== 0) red = true;
      const defsPath = path.join(REPO_ROOT, "packages", "components", "src", slug, `${slug}.defs.json`);
      const open = fs.existsSync(defsPath) ? JSON.parse(fs.readFileSync(defsPath, "utf8")).decisions.filter((d) => d.status === "open") : [];
      if (open.length) summary.push("", `#### Decisions to review (${open.length})`, "", ...open.map((d) => `- [ ] **${d.id}** — ${d.question}`));
      summary.push("", "<details><summary>Extraction proposal</summary>", "", proposalFor(evidence, slug).markdown, "", "</details>");
    } else {
      summary.push(`- scaffold FAILED: ${(scaffold.stderr || scaffold.stdout).trim().split("\n").slice(-3).join(" ")}`, "", `- no defs.json yet: this PR is the curation request.`, "", proposalFor(evidence, slug).markdown);
      red = true;
    }
  }
  summary.push("");
}
// Any placement changes the committed contract index, defs or not.
const index = run("node", ["packages/specs/build.mjs", "--index-only"]);
if (index.status !== 0) { summary.push("- contracts index: REBUILD FAILED"); red = true; }
const gate = run("node", ["--import", "tsx", "evals/gate.mjs"]);
const gateLines = gate.stdout.trim().split("\n");
summary.push("### Gate", "", "```", ...gateLines.filter((l) => /^(PASS|WARN|FAIL|RED|GREEN|  ✖)/.test(l)).slice(-16), "```", "");
if (gate.status !== 0) red = true;
if (!dryRun && fs.existsSync(INBOX) && !fs.readdirSync(INBOX).length) fs.rmdirSync(INBOX);
const text = `${red ? "## 🔴 Contract sync: gate red, nothing committed" : "## 🟢 Contract sync"}\n\n${summary.join("\n")}\n`;
if (summaryPath) { fs.mkdirSync(path.dirname(summaryPath), { recursive: true }); fs.writeFileSync(summaryPath, text); }
console.log(text);
process.exit(red ? 1 : 0);
