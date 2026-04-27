#!/usr/bin/env node
"use strict";

const http   = require("http");
const fs     = require("fs");
const path   = require("path");
const { spawnSync } = require("child_process");

const PORT       = 9300;
const PKG_DIR    = path.join(__dirname, "..");
const EXPORT_FILE = path.join(PKG_DIR, "json", "figma-export.json");

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/export") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        if (!Array.isArray(data.variables) || !Array.isArray(data.variableCollections)) {
          res.writeHead(400, { ...CORS, "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid payload — expected { variables, variableCollections }" }));
          return;
        }

        fs.writeFileSync(EXPORT_FILE, JSON.stringify(data, null, 2));
        console.log(`[export] ${data.variables.length} variables across ${data.variableCollections.length} collections → json/figma-export.json`);

        console.log("[build]  Running build.js...");
        const result = spawnSync("node", ["scripts/build.js"], {
          cwd: PKG_DIR,
          encoding: "utf8",
        });

        if (result.status !== 0) {
          console.error("[build]  Failed:\n", result.stderr);
          res.writeHead(500, { ...CORS, "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Build failed", stderr: result.stderr }));
          return;
        }

        console.log("[build]  Done.");
        res.writeHead(200, { ...CORS, "Content-Type": "application/json" });
        res.end(JSON.stringify({
          ok: true,
          variables:   data.variables.length,
          collections: data.variableCollections.length,
        }));
      } catch (err) {
        console.error("[export] Error:", err.message);
        res.writeHead(500, { ...CORS, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, CORS);
  res.end();
});

server.listen(PORT, () => {
  console.log(`\n🎯  toolkit-tokens dev server`);
  console.log(`    POST http://localhost:${PORT}/export\n`);
  console.log(`    Waiting for plugin exports...\n`);
});
