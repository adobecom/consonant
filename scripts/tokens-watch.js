import { watch } from "node:fs";
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

let debounce = null;
let building = false;

function rebuild() {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => {
    if (building) {
      // Queue another rebuild after current one finishes
      building = "queued";
      return;
    }
    runBuild();
  }, 300);
}

function runBuild() {
  building = true;
  console.log("\n[tokens:watch] rebuilding...");
  const child = spawn("node", ["packages/tokens/scripts/build-tokens.js"], {
    stdio: "inherit",
    cwd: ROOT,
  });
  child.on("exit", (code) => {
    const wasQueued = building === "queued";
    building = false;
    if (code === 0) {
      console.log("[tokens:watch] done");
    } else {
      console.error("[tokens:watch] build failed (exit " + code + ")");
    }
    if (wasQueued) runBuild();
  });
}

const watchDirs = [
  resolve(ROOT, "packages/tokens/json"),
  resolve(ROOT, "packages/tokens/scripts"),
];

for (const dir of watchDirs) {
  try {
    watch(dir, { recursive: true }, rebuild);
  } catch {
    // Directory may not exist yet (json/ before first sync)
  }
}

console.log("[tokens:watch] watching packages/tokens/{json,scripts} for changes");
