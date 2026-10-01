// The portability test, and the whole reason the engine lives in its own folder.
//
// This runs the spec dictionary with a hand-written IR, no S2A defs, no token
// pipeline, no evidence, no repo layout — nothing from this project at all. If
// this ever needs something from S2A to work, the engine has stopped being an
// engine and has become part of the app.
//
//   node packages/specs/examples/minimal/run.mjs
//
// Writes to examples/minimal/out/. Delete it freely; it regenerates.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { runTransform } from "../../engine/index.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const defs = JSON.parse(readFileSync(join(HERE, "defs.json"), "utf8"));

// A minimal adapter: defs straight through, shaped as a contract. Twenty lines
// is the honest size of a schema target once the engine exists.
const demo = {
  name: "demo",
  artifacts: (ir) => ir.defs.map((d) => ({
    name: d.name.toLowerCase(),
    data: { $schema: "./contract.schema.json", version: "1.0.0", status: "draft", ...d },
    note: `${d.props.length} props`,
  })),
};

const written = runTransform({
  ir: { defs },
  adapters: [demo],
  formats: ["yaml", "md", "ts"],
  write(relPath, contents) {
    const p = join(HERE, "out", relPath);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, contents);
  },
  log: (l) => console.log(`  ${l}`),
});
console.log(`${written.length} files → packages/specs/examples/minimal/out/`);
