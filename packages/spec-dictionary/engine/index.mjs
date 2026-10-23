// Spec Dictionary — Style Dictionary's architecture, one level up the stack.
//
// Style Dictionary takes one token source and fans it out to many platforms.
// This takes one canonical IR (curated defs + whatever evidence the project
// extracted) and fans it out along two orthogonal axes:
//
//   adapters — the SCHEMA axis. What shape does the spec take? Our own working
//              format, an external contract schema, a light catalog entry. A new
//              schema target is one adapter file, not a rewrite.
//   formats  — the SERIALIZATION axis. How is that shape written down?
//              json / yaml / mjs / ts / md.
//
// Why the axes are separate: nobody knows yet whose component-contract format
// becomes the recommended one. Betting the pipeline on a single schema means
// rewriting the pipeline when that bet moves. Betting on an adapter means
// writing one file.
//
// This package is deliberately project-agnostic. Nothing in here knows about
// S2A, this repo's layout, or where files live — the caller supplies `ir` and
// `write`. If it ever needs to know, it has stopped being an engine.
// `examples/minimal/` is the proof: it runs standalone.
//
//   import { runTransform, FORMATS } from "../engine/index.mjs";
//   runTransform({ ir, adapters, formats: ["ts", "yaml"], write, log });
//
// Adapter interface:   { name, artifacts(ir) -> [{ name, data, note? }] }
// Writer interface:    write(relativePath, contents)
import { FORMATS } from "./formats.mjs";

export { FORMATS };

export function runTransform({ ir, adapters, formats = [], write, log = () => {} }) {
  if (!ir) throw new Error("runTransform: ir is required");
  if (typeof write !== "function") throw new Error("runTransform: write(relPath, contents) is required");
  if (!Array.isArray(adapters) || !adapters.length) throw new Error("runTransform: at least one adapter is required");

  // json is always emitted as the canonical artifact, so it is never an "extra".
  const extra = formats.filter((f) => f !== "json");
  for (const f of extra) {
    if (!FORMATS[f]) throw new Error(`unknown format "${f}" — have: ${Object.keys(FORMATS).join(", ")}`);
  }

  const written = [];
  for (const adapter of adapters) {
    if (typeof adapter?.artifacts !== "function") throw new Error(`adapter "${adapter?.name ?? "?"}" has no artifacts(ir)`);
    for (const art of adapter.artifacts(ir)) {
      const canonical = `${art.name}.json`;
      write(canonical, FORMATS.json.serialize(art.data));
      written.push(canonical);
      for (const fmt of extra) {
        const p = `exports/${fmt}/${adapter.name}/${art.name}.${FORMATS[fmt].ext}`;
        write(p, FORMATS[fmt].serialize(art.data));
        written.push(p);
      }
      log(`[${adapter.name}] ${canonical}${art.note ? `  (${art.note})` : ""}${extra.length ? `  +${extra.join("/")}` : ""}`);
    }
  }
  return written;
}
