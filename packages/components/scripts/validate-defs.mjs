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
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..", "..");
const SRC = join(ROOT, "packages", "components", "src");
const TOKENS_DIR = join(ROOT, "dist", "packages", "tokens", "css", "dev");
const only = process.argv.find((a) => a.startsWith("--slug="))?.slice(7)?.split(",");

// Schema conformance comes from @adobecom/s2a-validators, not a private ajv
// compile here. Two copies of "what valid means" is how the writer and the
// checker drift apart. If the package is not built the run stops — a validator
// that quietly skips its first check is worse than no validator.
const validatorsDist = join(ROOT, "packages", "validators", "dist", "index.js");
if (!existsSync(validatorsDist)) {
  console.error("validate-defs: @adobecom/s2a-validators is not built.\n  cd packages/validators && npm install && npm run build");
  process.exit(2);
}
const { validateDefs } = await import(pathToFileURL(validatorsDist).href);
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
  for (const v of validateDefs(defs, ROOT).violations) problems.push(`schema ${v.message}`);
  const evidencePath = join(SRC, slug, `${slug}.code.evidence.json`);
  const evidence = existsSync(evidencePath) ? JSON.parse(readFileSync(evidencePath, "utf8")) : null;
  const pending = Boolean(defs.anchors?.code?.pending);
  const warnings = [];
  if (!evidence && !pending) problems.push(`no code evidence: run npm run evidence:code -- --slug=${slug}`);
  else if (!evidence) warnings.push(`code pending: no code evidence yet; code-conformance and selector checks skipped (anchors.code.pending)`);
  // composition[] — the judgment about what this component is built from.
  // Checked against the Figma evidence so an entry cannot quietly outlive the
  // dependency it describes, which is how a stale "internal" ends up hiding a
  // component that now matters.
  const figmaEvidencePath = join(SRC, slug, `${slug}.figma.evidence.json`);
  const figmaEvidence = existsSync(figmaEvidencePath) ? JSON.parse(readFileSync(figmaEvidencePath, "utf8")) : null;
  if (defs.composition?.length) {
    // Direct dependencies only. The crawl is a deep walk, so an instance
    // nested inside another instance belongs to THAT component's contract —
    // requiring a ruling on it here would make every component answer for its
    // dependencies' dependencies.
    const placed = (figmaEvidence?.instances ?? [])
      .filter((i) => i.set?.name ?? i.mainComponent?.name)
      .map((i) => ({ name: i.set?.name ?? i.mainComponent?.name, path: i.node ?? "" }));
    const observed = new Set(placed
      .filter((x) => !placed.some((o) => o.path !== x.path && x.path.startsWith(`${o.path}/`)))
      .map((x) => x.name));
    const seen = new Set();
    for (const c of defs.composition) {
      if (seen.has(c.name)) problems.push(`composition: "${c.name}" listed twice`);
      seen.add(c.name);
      if (c.treatment === "internal" && !c.why?.trim()) {
        problems.push(`composition "${c.name}": internal without a why — "internal" is a claim that this is not a component, and it has to be argued`);
      }
      if (c.treatment === "contract") {
        const target = c.slug ?? [...specs.keys()].find((d) => d.replace(/[^a-z0-9]/g, "") === String(c.name).toLowerCase().replace(/[^a-z0-9]/g, ""));
        if (!target || !specs.has(target)) warnings.push(`composition "${c.name}": treatment "contract" but no component resolves to it yet — it still needs building`);
        else if (!existsSync(join(SRC, target, `${target}.defs.json`))) warnings.push(`composition "${c.name}": ${target} has a spec but no contract yet`);
      }
      if (figmaEvidence && !observed.has(c.name)) {
        warnings.push(`composition "${c.name}": not in the Figma evidence any more — the design no longer uses it, or the name changed`);
      }
    }
    // The other direction: something the design uses that nobody has ruled on.
    for (const name of observed) {
      if (seen.has(name)) continue;
      problems.push(`composition: the design builds from "${name}" and composition[] does not say what it is (contract, internal or icon)`);
    }
  }

  if (evidence || pending) {
    // Code conformance and selector checks need the code; a pending contract
    // still gets its tokens, slots and decisions checked.
    const codeProps = evidence ? new Set(evidence.props.map((p) => p.name)) : null;
    if (codeProps) {
      for (const p of defs.props) if (!codeProps.has(p.code.prop)) {
        // A prop the design has and the code does not is the component not
        // having caught up — the contract is right to carry it, and the
        // generated code will. A prop in neither is a mistake in the defs.
        const designHas = p.figma && p.figma !== "NONE";
        (designHas ? warnings : problems).push(`prop ${p.name}: code prop "${p.code.prop}" not in the extracted surface (${[...codeProps].join(", ")})${designHas ? " — the design has it; the hand-written component has not caught up. Generated code carries it; implement it there or drop the design property." : ""}`);
      }
      for (const name of codeProps) if (!defs.props.some((p) => p.code.prop === name)) problems.push(`code prop "${name}" is not curated (add it with lever true/false)`);
    }
    const parts = evidence ? new Set([...evidence.parts.template, ...evidence.parts.stylesheet, ...(evidence.parts.runtime ?? [])]) : null;
    const all = []; walkParts(defs.anatomy.root, "root", all);
    for (const { path, part } of all) {
      const cls = part.selector.match(/^\.([\w-]+)/)?.[1];
      // The generated stylesheet defines every part's class; the hand-written
      // one may not. That is the component not having caught up with the
      // design's anatomy — reported, not refused.
      if (parts && cls && !parts.has(cls)) warnings.push(`anatomy ${path}: selector ${part.selector} has no matching class in the hand-written template or stylesheet — generated code defines it; implement it there or rename the part`);
      // Base tokens plus every conditional map. A token that only appears under
      // style=knockout is just as unshipped as one in the resting case, and
      // checking only the base map was how they used to slip through.
      const maps = [["", part.tokens]];
      for (const [st, m] of Object.entries(part.states ?? {})) maps.push([`:${st}`, m]);
      for (const e of part.tokensByProp ?? []) for (const [val, m] of Object.entries(e.map ?? {})) maps.push([`@${e.prop}=${val}`, m]);
      for (const e of part.statesByProp ?? []) for (const [val, m] of Object.entries(e.map ?? {})) maps.push([`@${e.prop}=${val}:${e.state}`, m]);
      for (const e of part.tokensByCombination ?? []) for (const r of e.rows ?? []) maps.push([`@${(e.props ?? []).map((p, i) => `${p}=${r.values?.[i] ?? "*"}`).join(",")}`, r.tokens]);
      for (const [where, map] of maps) {
        for (const [prop, ref] of Object.entries(map ?? {})) {
          for (const m of ref.matchAll(/\{s2a\.[a-z0-9.-]+\}/g)) {
            const v = toVar(m[0]);
            if (shipped.size && !shipped.has(v)) problems.push(`anatomy ${path} ${prop}${where}: ${m[0]} → ${v} is not a shipped token`);
          }
          // A literal is a token gap, whichever side it came from: a value the
          // design sets with no variable, or one a curator typed. It ships, but
          // never silently — bind it in Figma, or keep it with the reason recorded.
          // Structure, not values: presence (display), a circle's radius and
          // box-sizing are what a shape IS; no variable could hold them.
          const structural = prop === "display" || prop === "box-sizing" || (prop === "border-radius" && ref === "raw:50%");
          if (ref.startsWith("raw:") && !structural) warnings.push(`anatomy ${path} ${prop}${where}: ${ref} is hardcoded — no S2A variable behind it. Bind one in Figma and re-extract, or keep the raw: value with the reason in a decision`);
        }
      }
      // An asset-backed part points at a shipped manifest and a prop. Both have
      // to exist, or the generated component resolves every src to the empty
      // string and renders a column of blank images that look like a CSS bug.
      if (part.asset) {
        const a = part.asset;
        if (!defs.props.some((pp) => pp.name === a.prop)) {
          problems.push(`anatomy ${path} asset: names prop "${a.prop}", which this component does not have`);
        }
        const mf = join(ROOT, "packages", "spec-dictionary", "out", "assets", `${a.manifest}.json`);
        if (!existsSync(mf)) {
          problems.push(`anatomy ${path} asset: manifest "${a.manifest}" has not been built — run npm run specs:assets`);
        } else {
          const doc = JSON.parse(readFileSync(mf, "utf8"));
          const sample = Object.values(doc.entries ?? {})[0] ?? {};
          if (!(a.field in sample)) {
            problems.push(`anatomy ${path} asset: manifest "${a.manifest}" entries have no "${a.field}" field (they have: ${Object.keys(sample).join(", ")})`);
          }
          if (a.altField && !(a.altField in sample)) {
            problems.push(`anatomy ${path} asset: manifest "${a.manifest}" entries have no "${a.altField}" field for altField`);
          }
        }
      }

      // A slot's default filling: the design's name is evidence; the manifest
      // binding is a decision, and a half-made one (a manifest with no icon, or
      // an icon the manifest does not have) renders nothing and looks like CSS.
      if (part.slot?.default) {
        const d = part.slot.default;
        if (d.manifest || d.icon) {
          if (!d.manifest || !d.icon) problems.push(`anatomy ${path} slot default: needs both manifest and icon (has ${d.manifest ? "manifest" : "icon"} only)`);
          else {
            const mf = join(ROOT, "packages", "spec-dictionary", "out", "assets", `${d.manifest}.json`);
            if (!existsSync(mf)) problems.push(`anatomy ${path} slot default: manifest "${d.manifest}" has not been built — run npm run specs:assets`);
            else {
              const doc = JSON.parse(readFileSync(mf, "utf8"));
              if (!doc.entries?.[d.icon]) problems.push(`anatomy ${path} slot default: "${d.icon}" is not in manifest ${d.manifest} (${Object.keys(doc.entries ?? {}).length} entries) — add the SVG to ${doc.derivedFrom?.module ?? "the library"} and run npm run specs:assets`);
            }
          }
        } else if (d.figma) {
          warnings.push(`anatomy ${path} slot: the design fills it with "${d.figma}" and the contract has not bound that to a code icon — Heal in the Contract Book, or set slot.default.manifest and slot.default.icon`);
        }
      }

      // An element that navigates must BE a link. A component carrying an
      // href/to/link prop while its root is a <button> renders something that
      // looks clickable and is not a link: no middle-click, no open-in-new-tab,
      // not reachable as a link, and announced with the wrong role. Button
      // shipped exactly this — an href prop the template accepted and dropped —
      // while its own Figma a11y note said "render as <button> (or <a> when it
      // navigates via href)". The rule the design already stated, enforced.
      if (path === "root") {
        const NAVIGATES = /^(href|to|link|url)$/i;
        const nav = defs.props.find((p) => NAVIGATES.test(p.name) || NAVIGATES.test(p.code?.prop ?? ""));
        const el = part.element;
        if (nav && el && el !== "a" && !part.elementByProp) {
          problems.push(`anatomy root: prop "${nav.name}" navigates but the root element is <${el}> and nothing says otherwise. `
            + `Add anatomy.root.elementByProp — e.g. { "prop": "${nav.name}", "map": { "": "${el}", "*": "a" } } — `
            + `or drop the prop. WCAG 2.1.1; a link rendered as a button cannot be opened in a new tab or announced as a link.`);
        }
        if (part.elementByProp && !defs.props.some((p) => p.name === part.elementByProp.prop)) {
          problems.push(`anatomy root: elementByProp names prop "${part.elementByProp.prop}", which this component does not have`);
        }
      }

      // A geometry property that changes with STATE reflows the page. Colour can
      // change freely on hover; size cannot — the control should only grow when
      // its content does.
      //
      // border-width is deliberately NOT in this list. It used to be, because a
      // real CSS border adds to an auto-width control and Button — v2 binds sm at
      // rest and md on hover. The renderers now draw strokes as an inset
      // box-shadow (see lib/renderers/css.mjs), which paints inside the shape and
      // costs no layout, so a stroke that changes with state is just a colour
      // change wearing a size's name. Keeping it here would warn about a reflow
      // that cannot happen and push people to flatten designs that are fine.
      const GEOMETRY = /^(padding|padding-.*|gap|row-gap|column-gap|height|width|min-|max-|font-size|line-height|letter-spacing)/;
      const baseGeom = Object.fromEntries(Object.entries(part.tokens ?? {}).filter(([k]) => GEOMETRY.test(k)));
      const flagShift = (where, map) => {
        for (const [prop, ref] of Object.entries(map ?? {})) {
          if (!GEOMETRY.test(prop)) continue;
          const at = baseGeom[prop];
          if (at && at !== ref) warnings.push(`anatomy ${path} ${prop}${where}: ${ref} differs from the resting ${at} — a geometry change on a state reflows the control. Colour may change on hover; size should not.`);
        }
      };
      for (const [st, m] of Object.entries(part.states ?? {})) flagShift(`:${st}`, m);
      for (const e of part.statesByProp ?? []) for (const [val, m] of Object.entries(e.map ?? {})) {
        // compare against that variant's own resting value, not the root default
        const resting = (part.tokensByProp ?? []).find((x) => x.prop === e.prop)?.map?.[val] ?? {};
        for (const [prop, ref] of Object.entries(m ?? {})) {
          if (!GEOMETRY.test(prop)) continue;
          const at = resting[prop] ?? baseGeom[prop];
          if (at && at !== ref) warnings.push(`anatomy ${path} ${prop} @${e.prop}=${val}:${e.state}: ${ref} differs from the resting ${at} — a geometry change on a state reflows the control.`);
        }
      }

      // A conditional has to name a prop that exists, or it can never apply.
      const propNames = new Set((defs.props ?? []).map((p) => p.name));
      for (const e of [...(part.tokensByProp ?? []), ...(part.statesByProp ?? [])]) {
        if (!propNames.has(e.prop)) problems.push(`anatomy ${path}: tokens vary by prop "${e.prop}", which is not in props[]`);
      }
      for (const e of part.tokensByCombination ?? []) for (const n of e.props ?? []) {
        if (!propNames.has(n)) problems.push(`anatomy ${path}: tokensByCombination names prop "${n}", which is not in props[]`);
      }
      if (part.slot) {
        // A kind: entry names a CATEGORY, not a component, so there is no spec
        // to look for — only a fixed vocabulary to stay inside.
        const KINDS = new Set(["icon", "media", "text", "action"]);
        for (const name of part.slot.accepts) {
          if (name.startsWith("kind:")) {
            const k = name.slice(5);
            if (!KINDS.has(k)) problems.push(`slot ${part.slot.name}: accepts "${name}" but "${k}" is not a kind (${[...KINDS].join(", ")})`);
            continue;
          }
          if (!specByName.has(name.toLowerCase()) && !specs.has(name)) problems.push(`slot ${part.slot.name}: accepts "${name}" but no spec.json has that name`);
        }
        const { min, max, name: slotName, accepts, acceptsMode } = part.slot;
        // Cardinality has to be satisfiable. min > max is unbuildable, and the
        // schema cannot catch it because it compares two sibling fields.
        if (min != null && max != null && min > max) problems.push(`slot ${slotName}: min ${min} is greater than max ${max}`);
        // A required slot that accepts nothing nameable can never be filled.
        if ((min ?? 0) > 0 && acceptsMode === "restrict" && accepts.length === 0) problems.push(`slot ${slotName}: requires at least ${min} child but restricts to an empty accepts list`);
      }
    }
    // A block is a contract whose job is arrangement. One with no slots composes
    // nothing, which means it is a component that has been mislabelled — and the
    // label is what tells a consumer to build it out of other contracts.
    if (defs.tier === "block") {
      const slots = all.filter(({ part }) => part.slot);
      if (!slots.length) problems.push(`tier "block" but no part declares a slot — a block is an arrangement of other contracts`);
      // kind: entries are categories, not components — they compose nothing.
      const composes = new Set(slots.flatMap(({ part }) => part.slot.accepts).filter((n) => !n.startsWith("kind:")));
      if (slots.length && !composes.size) problems.push(`tier "block" but no slot names anything in accepts — nothing to compose`);
    }
    for (const d of defs.decisions) if (d.status === "decided" && !d.decision) problems.push(`decision ${d.id} is decided without a decision text`);
  }
  const open = defs.decisions?.filter((d) => d.status === "open").length ?? 0;
  const tier = defs.tier ?? "component";
  console.log(`${problems.length ? "FAIL" : "PASS"}  ${slug.padEnd(24)} ${tier === "block" ? "block · " : ""}${defs.status} · ${defs.props.length} props (${defs.props.filter((p) => p.lever).length} levers) · ${open} open decisions${warnings.some((w) => w.startsWith("code pending")) ? " · code pending" : ""}${warnings.filter((w) => !w.startsWith("code pending")).length ? ` · ${warnings.filter((w) => !w.startsWith("code pending")).length} warning${warnings.filter((w) => !w.startsWith("code pending")).length === 1 ? "" : "s"}` : ""}`);
  for (const p of problems) console.log(`      ${p}`);
  for (const w of warnings) console.log(`      warn: ${w}`);
  if (problems.length) failures++;
}
console.log(`${slugs.length - failures}/${slugs.length} defs pass.`);
process.exitCode = failures ? 1 : 0;
