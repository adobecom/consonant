// milo-sample.mjs — a contract's authored sample, as a Milo page would hold it.
//
// A defs' x-authored.sample is the markup an author produces. It names icons as
// {{icon:name}} for a span Milo's icon loader would fill, or {{svg:name}} for art
// placed directly. Shared by the Contract Book's preview and the visual eval so
// both exercise the same markup.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export function sampleHtml(defs, iconsDir) {
  const svg = (n) => readFileSync(join(iconsDir, `${n}.svg`), "utf8").trim();
  const body = String(defs["x-authored"]?.sample ?? "")
    .replace(/\{\{icon:([a-z0-9-]+)\}\}/g, (_, n) => `<span class="icon icon-${n}">${svg(n)}</span>`)
    .replace(/\{\{svg:([a-z0-9-]+)\}\}/g, (_, n) => svg(n));
  return defs.tier === "block" ? `<div class="${defs.slug}">${body}</div>` : body;
}
