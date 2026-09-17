#!/usr/bin/env node
// validate-defs.mjs — the curation checks the gate will run (plan step 5):
//   1. every <slug>.defs.json validates against packages/components/defs.schema.json
//   2. every defs prop names a prop the code evidence extracted (code conformance)
//   3. every anatomy selector's class is a part the template or stylesheet defines
//   4. every slot `accepts` names a component with a spec.json (composition)
//   5. every {s2a.…} token reference resolves in the shipped token CSS
// Usage: node packages/components/scripts/validate-defs.mjs [--slug=a,b]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Ajv = require("ajv");
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..", "..");
const SRC = join(ROOT, "packages", "components", "src");
const TOKENS_DIR = join(ROOT, "dist", "packages", "tokens", "css", "dev");
const only = process.argv.find((a) => a.startsWith("--slug="))?.slice(7)?.split(",");

const schema = JSON.parse(readFileSync(join(ROOT, "packages", "components", "defs.schema.json"), "utf8"));
const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
const specs = new Map(readdirSync(SRC).filter((d) => existsSync(join(SRC, d, `${d}.spec.json`))).map((d) => [d, JSON.parse(readFileSync(join(SRC, d, `${d}.spec.json`), "utf8"))]));
const specByName = new Map([...specs.values()].map((s) => [String(s.name).toLowerCase(), s]));
const shipped = new Set();
if (existsSync(TOKENS_DIR)) for (const f of readdirSync(TOKENS_DIR)) for (const m of readFileSync(join(TOKENS_DIR, f), "utf8").matchAll(/(--s2a-[a-z0-9_-]+)\s*:/g)) shipped.add(m[1]);
const toVar = (ref) => "--" + ref.slice(1, -1).replace(/\./g, "-");

function walkParts(part, path, out) {
  out.push({ path, part });
  for (const [name, child] of Object.entries(part.parts ?? {})) walkParts(child, `${path}/${name}`, out);
}

let failures = 0;
const slugs = (only ?? readdirSync(SRC)).filter((d) => existsSync(join(SRC, d, `${d}.defs.json`)));
for (const slug of slugs) {
  const defs = JSON.parse(readFileSync(join(SRC, slug, `${slug}.defs.json`), "utf8"));
  const problems = [];
  if (!validate(defs)) for (const e of validate.errors) problems.push(`schema ${e.instancePath || "/"} ${e.message}`);
  const evidencePath = join(SRC, slug, `${slug}.code.evidence.json`);
  const evidence = existsSync(evidencePath) ? JSON.parse(readFileSync(evidencePath, "utf8")) : null;
  const pending = Boolean(defs.anchors?.code?.pending);
  const warnings = [];
  if (!evidence && !pending) problems.push(`no code evidence: run npm run evidence:code -- --slug=${slug}`);
  else if (!evidence) warnings.push(`code pending: no code evidence yet; code-conformance and selector checks skipped (anchors.code.pending)`);
  if (evidence || pending) {
    // Code conformance and selector checks need the code; a pending contract
    // still gets its tokens, slots and decisions checked.
    const codeProps = evidence ? new Set(evidence.props.map((p) => p.name)) : null;
    if (codeProps) {
      for (const p of defs.props) if (!codeProps.has(p.code.prop)) problems.push(`prop ${p.name}: code prop "${p.code.prop}" not in the extracted surface (${[...codeProps].join(", ")})`);
      for (const name of codeProps) if (!defs.props.some((p) => p.code.prop === name)) problems.push(`code prop "${name}" is not curated (add it with lever true/false)`);
    }
    const parts = evidence ? new Set([...evidence.parts.template, ...evidence.parts.stylesheet, ...(evidence.parts.runtime ?? [])]) : null;
    const all = []; walkParts(defs.anatomy.root, "root", all);
    for (const { path, part } of all) {
      const cls = part.selector.match(/^\.([\w-]+)/)?.[1];
      if (parts && cls && !parts.has(cls)) problems.push(`anatomy ${path}: selector ${part.selector} has no matching class in the template, stylesheet or rendered stories`);
      for (const [prop, ref] of Object.entries(part.tokens ?? {})) for (const m of ref.matchAll(/\{s2a\.[a-z0-9.-]+\}/g)) {
        const v = toVar(m[0]);
        if (shipped.size && !shipped.has(v)) problems.push(`anatomy ${path} ${prop}: ${m[0]} → ${v} is not a shipped token`);
      }
      if (part.slot) for (const name of part.slot.accepts) if (!specByName.has(name.toLowerCase()) && !specs.has(name)) problems.push(`slot ${part.slot.name}: accepts "${name}" but no spec.json has that name`);
    }
    for (const d of defs.decisions) if (d.status === "decided" && !d.decision) problems.push(`decision ${d.id} is decided without a decision text`);
  }
  const open = defs.decisions?.filter((d) => d.status === "open").length ?? 0;
  console.log(`${problems.length ? "FAIL" : "PASS"}  ${slug.padEnd(24)} ${defs.status} · ${defs.props.length} props (${defs.props.filter((p) => p.lever).length} levers) · ${open} open decisions${warnings.length ? " · code pending" : ""}`);
  for (const p of problems) console.log(`      ${p}`);
  for (const w of warnings) console.log(`      warn: ${w}`);
  if (problems.length) failures++;
}
console.log(`${slugs.length - failures}/${slugs.length} defs pass.`);
process.exitCode = failures ? 1 : 0;
