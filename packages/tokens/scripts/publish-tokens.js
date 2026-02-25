#!/usr/bin/env node

/**
 * Publish s2a-tokens to GitHub Package Registry.
 * Loads NODE_AUTH_TOKEN from .env - npm doesn't expand ${VAR} in .npmrc reliably,
 * so we write the token into a temp .npmrc in the package dir before publishing.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function loadEnv() {
  const projectRoot = path.join(__dirname, "../../..");
  const envPath = path.join(projectRoot, ".env");

  if (!fs.existsSync(envPath)) {
    console.error("Error: .env not found at", envPath);
    process.exit(1);
  }

  const contents = fs.readFileSync(envPath, "utf8");
  const keysFound = [];
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key) {
      process.env[key] = val; // Always overwrite from .env
      keysFound.push(key);
    }
  }
  return { envPath, keysFound };
}

const { envPath, keysFound } = loadEnv();

let token = process.env.NODE_AUTH_TOKEN;
if (!token) {
  console.error("Error: NODE_AUTH_TOKEN not found.");
  console.error("  .env path:", envPath);
  console.error("  Variables loaded from .env:", keysFound.join(", ") || "(none)");
  console.error("  Required: NODE_AUTH_TOKEN=ghp_xxx (exact spelling, no spaces)");
  process.exit(1);
}
token = token.replace(/^["']|["']$/g, "").trim();

if (!token.startsWith("ghp_") && !token.startsWith("github_pat_")) {
  console.error("Warning: Token should start with ghp_ (classic) or github_pat_ (fine-grained).");
  console.error("  Got:", token.slice(0, 8) + "... (length " + token.length + ")");
}

const workspaceRoot = path.join(__dirname, "../../..");
const pkgDir = path.join(workspaceRoot, "dist", "packages", "tokens");
const npmrcPath = path.join(pkgDir, ".npmrc");

// Write .npmrc with actual token (npm doesn't expand ${VAR} from parent .npmrc)
const npmrcContent = `//npm.pkg.github.com/:_authToken=${token}
registry=https://npm.pkg.github.com
`;
fs.writeFileSync(npmrcPath, npmrcContent);

try {
  const result = spawnSync(
    "npm",
    ["publish", "--registry=https://npm.pkg.github.com"],
    {
      stdio: "inherit",
      cwd: pkgDir,
      env: process.env,
    }
  );
  process.exit(result.status || 0);
} finally {
  try {
    fs.unlinkSync(npmrcPath);
  } catch (_) {}
}
