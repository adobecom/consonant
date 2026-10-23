#!/usr/bin/env node
// overlay.mjs — build the visual parity inspector from the last eval run.
//
// A pass/fail number tells you THAT something differs, never what. Every real
// defect today was found by looking at a render — a black square, an invisible
// label, a black ring on a transparent button. This makes the looking
// repeatable: wipe between the Figma design and the Storybook build, fade
// between them, or light up only the differing pixels.
//
//   npm run eval:visual:contracts && npm run eval:visual:overlay
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const OUT = join(__dirname, "out", "contracts");

const dataUri = (rel) => {
  const p = join(ROOT, rel);
  return existsSync(p) ? `data:image/png;base64,${readFileSync(p).toString("base64")}` : null;
};

const reportPath = join(OUT, "report.json");
if (!existsSync(reportPath)) {
  console.error("no report — run npm run eval:visual:contracts first");
  process.exit(2);
}
const report = JSON.parse(readFileSync(reportPath, "utf8"));

// Images are inlined so the page is one file: it opens from disk, survives being
// sent to someone, and needs no server to hold the screenshots.
const cases = report.results
  .filter((r) => r.ratio != null && r.golden && r.candidate)
  .map((r) => ({
    name: r.name, variant: r.variant ?? "", dims: r.dims ?? "",
    ratio: r.ratio, status: r.status,
    golden: dataUri(r.golden), candidate: dataUri(r.candidate), diff: dataUri(r.diff),
  }))
  .filter((c) => c.golden && c.candidate);

const html = readFileSync(join(__dirname, "overlay.template.html"), "utf8")
  .replace("/*__DATA__*/null", JSON.stringify(cases))
  .replace("/*__THRESHOLD__*/0", String(report.threshold ?? 0.08));

mkdirSync(OUT, { recursive: true });
const dest = join(OUT, "overlay.html");
writeFileSync(dest, html);
console.log(`overlay: ${dest.slice(ROOT.length + 1)}  ·  ${cases.length} cases  ·  ${Math.round(html.length / 1024)}KB`);
