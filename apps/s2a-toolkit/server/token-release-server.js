#!/usr/bin/env node
"use strict";

/**
 * S2A Token Release trigger  (port 9401)
 *
 * The actual pipeline (sync from Figma → build → spot-check → bump →
 * changelog → package → manifest → PR) runs in GitHub Actions —
 * see .github/workflows/token-release.yml. This server's only job is to
 * dispatch that workflow via the local authenticated `gh` CLI and report
 * back progress, so the plugin never needs its own copy of Figma/GitHub
 * credentials and doesn't depend on the designer's machine having a
 * working local build environment.
 *
 * POST /tokens/release  { bump?: 'patch' | 'minor' | 'major' }
 *   Returns { jobId } immediately; poll GET /jobs/:id for progress.
 *
 * GET /jobs/:id
 *   { status: 'pending'|'done'|'error', phase, result, error }
 *
 * GET /health
 */

import http from "http";
import { spawnSync } from "child_process";

const PORT = 9401;
const WORKFLOW_FILE = "token-release.yml";
const REPO = "adobecom/consonant";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ── Job queue (mirrors figma-story-server.js) ──────────────────────────────────

const jobs = new Map();

function createJob() {
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  jobs.set(id, { id, status: "pending", phase: "Queued", result: null, error: null, createdAt: Date.now() });
  setTimeout(() => jobs.delete(id), 30 * 60 * 1000);
  return id;
}

function updateJob(id, patch) {
  const job = jobs.get(id);
  if (job) Object.assign(job, patch);
}

function gh(args, timeout = 20000) {
  const r = spawnSync("gh", args, { encoding: "utf8", timeout });
  return { ok: r.status === 0, stdout: (r.stdout || "").trim(), stderr: (r.stderr || "").trim() };
}

function ghJson(args, timeout = 20000) {
  const r = gh(args, timeout);
  if (!r.ok) return null;
  try { return JSON.parse(r.stdout); } catch { return null; }
}

// ── dispatch + poll ─────────────────────────────────────────────────────────────

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function triggerRelease(jobId, bump) {
  const phase = p => updateJob(jobId, { phase: p });

  try {
    phase("Dispatching GitHub Actions workflow…");
    const dispatchedAt = Date.now();
    const dispatch = gh(["workflow", "run", WORKFLOW_FILE, "--repo", REPO, "--ref", "main", "-f", `bump=${bump}`]);
    if (!dispatch.ok) throw new Error("Failed to dispatch workflow: " + (dispatch.stderr || dispatch.stdout) + "\n\nIs `gh` authenticated? Run `gh auth status`.");

    phase("Waiting for the run to start…");
    let run = null;
    for (let i = 0; i < 15 && !run; i++) {
      await sleep(2000);
      const runs = ghJson(["run", "list", "--repo", REPO, "--workflow", WORKFLOW_FILE, "--limit", "5", "--json", "databaseId,status,conclusion,url,createdAt"]);
      run = (runs || []).find(r => new Date(r.createdAt).getTime() >= dispatchedAt - 5000);
    }
    if (!run) throw new Error("Workflow dispatched but no run appeared within 30s — check the Actions tab manually.");

    phase(`Running in GitHub Actions… (${run.url})`);
    for (;;) {
      await sleep(4000);
      const current = ghJson(["run", "view", String(run.databaseId), "--repo", REPO, "--json", "status,conclusion,url"]);
      if (!current) continue;
      if (current.status === "completed") {
        run = { ...run, ...current };
        break;
      }
    }

    if (run.conclusion !== "success") {
      updateJob(jobId, { status: "error", phase: "Failed", error: `Workflow run ${run.conclusion} — see ${run.url}` });
      return;
    }

    phase("Looking for the release PR…");
    const prs = ghJson(["pr", "list", "--repo", REPO, "--state", "open", "--search", "release(tokens):", "--json", "url,title,createdAt", "--limit", "5"]);
    const pr = (prs || [])
      .filter(p => new Date(p.createdAt).getTime() >= dispatchedAt - 5000)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    updateJob(jobId, {
      status: "done",
      phase: "Done",
      result: { runUrl: run.url, prUrl: pr ? pr.url : null, prTitle: pr ? pr.title : null },
    });
  } catch (err) {
    updateJob(jobId, { status: "error", phase: "Failed", error: err.message });
  }
}

// ── HTTP server ───────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { ...CORS, "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, port: PORT }));
    return;
  }

  if (req.method === "GET" && req.url.startsWith("/jobs/")) {
    const jobId = req.url.slice("/jobs/".length);
    const job = jobs.get(jobId);
    if (!job) {
      res.writeHead(404, { ...CORS, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unknown job" }));
      return;
    }
    res.writeHead(200, { ...CORS, "Content-Type": "application/json" });
    res.end(JSON.stringify(job));
    return;
  }

  if (req.method === "POST" && req.url === "/tokens/release") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      let bump = "patch";
      try {
        const parsed = body ? JSON.parse(body) : {};
        if (["patch", "minor", "major"].includes(parsed.bump)) bump = parsed.bump;
      } catch {
        res.writeHead(400, { ...CORS, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }

      const jobId = createJob();
      res.writeHead(200, { ...CORS, "Content-Type": "application/json" });
      res.end(JSON.stringify({ jobId }));

      console.log(`[token-release]  dispatching ${WORKFLOW_FILE} (bump=${bump}) — job ${jobId}`);
      triggerRelease(jobId, bump);
    });
    return;
  }

  res.writeHead(404, CORS);
  res.end();
});

server.listen(PORT, "localhost", () => {
  console.log(`\n[S2A Token Release Trigger] http://localhost:${PORT}`);
  console.log(`  POST /tokens/release  { bump } — dispatch .github/workflows/token-release.yml, watch it, find the PR`);
  console.log(`  GET  /jobs/:id        — poll job status/phase`);
  console.log(`  GET  /health          — health check\n`);
  const auth = spawnSync("gh", ["auth", "status"], { encoding: "utf8" });
  if (auth.status !== 0) {
    console.warn("  ⚠ `gh` is not authenticated — run `gh auth login` before using Release Tokens.\n");
  }
});
