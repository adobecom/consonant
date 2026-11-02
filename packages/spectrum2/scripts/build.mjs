#!/usr/bin/env node
// Build the Spectrum contracts with the same transform our own components use.
//
// There is deliberately no second copy of the transform here. build.mjs takes a
// source tree, a token build and a contract namespace as arguments, so this file
// is only the three values that differ — which is the whole point of the
// exercise: if the pipeline needed its own Spectrum branch it would not be a
// design-system-neutral pipeline.
//
//   node packages/spectrum2/scripts/build.mjs            # every slug
//   node packages/spectrum2/scripts/build.mjs --slug=button
import { readdirSync, writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildOne, slugIndex } from "../../spec-dictionary/build.mjs";
import { SYSTEMS, buildOpts } from "../../spec-dictionary/systems.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, "..");
const SRC = join(PKG, "src");
// What differs from our own system is declared once, in spec-dictionary/systems.mjs
// (source tree, token build, the component tier, namespaces); this script is
// the command line around it.
const OPTS = { ...buildOpts(SYSTEMS.spectrum), slugOf: slugIndex(SRC) };

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--slug="))?.slice(7).split(",").map((s) => s.trim()).filter(Boolean);
const slugs = only ?? readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.defs.json`))).sort();

let failed = 0;
for (const slug of slugs) {
  try {
    const { ir, outputs } = buildOne(slug, OPTS);
    for (const [file, content] of Object.entries(outputs)) {
      mkdirSync(dirname(file), { recursive: true });
      if (!existsSync(file) || readFileSync(file, "utf8") !== content) writeFileSync(file, content);
    }
    const bind = (ir.tokens ?? ir.bindings ?? []).length;
    console.log(`BUILT  spectrum.${slug.padEnd(20)} ${Object.keys(ir.props ?? {}).length} props · ${bind} token bindings`);
  } catch (e) {
    failed++;
    console.error(`FAIL   spectrum.${slug}: ${e.message}`);
  }
}
console.log(`${slugs.length - failed}/${slugs.length} built.`);
// The contract's stories: Storybook mounts Spectrum's own element from them.
if (!failed && !args.includes("--no-render")) {
  const { spawnSync } = await import("node:child_process");
  const render = spawnSync(process.execPath, [join(PKG, "..", "spec-dictionary", "render.mjs"), "--system=spectrum", ...(only ? [`--slug=${only[0]}`] : ["--all"])], { cwd: resolve(PKG, "..", ".."), encoding: "utf8" });
  process.stdout.write(render.stdout ?? "");
  if (render.status !== 0) { process.stderr.write(render.stderr ?? ""); process.exit(render.status ?? 1); }
}
process.exit(failed ? 1 : 0);
