#!/usr/bin/env node
// render.mjs — one contract, many implementations.
//
//   npm run specs:render -- --slug=button                 every target
//   npm run specs:render -- --slug=button --target=milo   just one
//   npm run specs:render -- --all --target=lit
//   npm run specs:render -- --slug=button --check         fail if stale, write nothing
//
// The contract is the only input. Each target decides what files it needs and
// where they go, so the two never collide: Lit output lands in Storybook's
// generated/ folder, Milo output in packages/milo-blocks/. Neither touches the
// hand-written components in packages/components/src.
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildOne, ROOT } from "./build.mjs";
import { renderers, targets } from "./lib/renderers/index.mjs";

// A composed child is rendered through its own contract. Resolved by slug or by
// the name a contract carries (slot.accepts says "Button"; the file is
// button.contract.json), from the contracts beside the components.
const CONTRACTS_DIR = join(ROOT, "packages", "components", "src");
const contractIndex = (() => {
  const out = [];
  for (const d of existsSync(CONTRACTS_DIR) ? readdirSync(CONTRACTS_DIR) : []) {
    const f = join(CONTRACTS_DIR, d, `${d}.contract.json`);
    if (existsSync(f)) { try { const c = JSON.parse(readFileSync(f, "utf8")); out.push({ slug: d, name: c.name ?? c.component?.name ?? d, props: c.props ?? [] }); } catch { /* unreadable: not a contract */ } }
  }
  return out;
})();
const alnumKey = (x) => String(x ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const contractFor = (key) => contractIndex.find((c) => c.slug === key || alnumKey(c.name) === alnumKey(key) || alnumKey(c.slug) === alnumKey(key)) ?? null;

const SRC = join(ROOT, "packages", "components", "src");
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const has = (f) => process.argv.includes(`--${f}`);

const wanted = (arg("target") ?? "all").split(",").map((s) => s.trim());
const chosen = wanted.includes("all") ? targets : wanted;
const unknown = chosen.filter((t) => !renderers[t]);
if (unknown.length) {
  console.error(`unknown target(s): ${unknown.join(", ")}\nknown: ${targets.join(", ")}`);
  process.exit(2);
}

const slugs = has("all")
  ? readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.defs.json`)))
  : [arg("slug")].filter(Boolean);

if (!slugs.length) {
  console.error("usage: npm run specs:render -- --slug=<slug> [--target=lit|milo|all] [--check]\n       npm run specs:render -- --all");
  process.exit(2);
}

let failures = 0, written = 0, stale = [];
for (const slug of slugs) {
  try {
    const { ir } = buildOne(slug);
    // The manifest is already derived during the build; the Lit target renders
    // it rather than deciding story combinations a second time.
    const manifestPath = join(ROOT, "packages", "spec-dictionary", "out", slug, "stories.manifest.json");
    const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : null;

    const produced = [];
    for (const id of chosen) {
      const files = renderers[id].files(ir, slug, { manifest, contractFor });
      for (const [rel, contents] of Object.entries(files)) {
        const file = resolve(ROOT, rel);
        if (has("check")) {
          const onDisk = existsSync(file) ? readFileSync(file, "utf8") : null;
          if (onDisk !== contents) stale.push(`${rel} (${onDisk === null ? "missing" : "differs from a fresh render"})`);
        } else {
          mkdirSync(dirname(file), { recursive: true });
          writeFileSync(file, contents);
          written++;
        }
        produced.push(`${id}:${rel.split("/").pop()}`);
      }
    }
    console.log(`${has("check") ? "CHECK" : "RENDER"} ${slug.padEnd(24)} ${chosen.join(" + ").padEnd(12)} ${produced.length} files`);
  } catch (err) {
    console.log(`ERROR  ${slug}: ${err.message}`);
    failures++;
  }
}

if (has("check") && stale.length) {
  console.log(`\nSTALE — re-run without --check:`);
  for (const s of stale) console.log(`  ${s}`);
  process.exit(1);
}
console.log(has("check") ? `\n${slugs.length} checked, all fresh.` : `\n${written} files written for ${slugs.length} component(s).`);
process.exit(failures ? 1 : 0);
