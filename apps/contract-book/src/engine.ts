// engine.ts — the real pipeline, run in the browser.
//
// This is `buildOne` from packages/spec-dictionary/build.mjs with the file
// reads replaced by the bundled repo data, and `validate-defs.mjs` with its
// file reads replaced the same way. Nothing here decides anything; every
// judgment is made by the modules imported from spec-dictionary — the same
// ones `npm run specs:build` and `/contract-ship` call. If the Book and the
// CLI ever disagree, that is a bug in this file, not a difference of opinion.
//
// The one thing the Book does that the CLI does not: it runs on an UNSAVED
// defs object, so a person can change a decision and watch every derived
// artifact — contract, CSS, Lit, Milo, Figma plan — move, before writing
// anything to disk.

// @ts-ignore — engine modules are plain ESM .mjs with no types
import { canonicalJson, hashOf } from "../../../packages/spec-dictionary/lib/canonical.mjs";
// @ts-ignore
import { tokensFromFiles } from "../../../packages/spec-dictionary/lib/tokens.mjs";
// @ts-ignore
import { buildIR } from "../../../packages/spec-dictionary/lib/ir.mjs";
// @ts-ignore
import { specJson } from "../../../packages/spec-dictionary/lib/formats/spec-json.mjs";
// @ts-ignore
import { contractJson } from "../../../packages/spec-dictionary/lib/formats/contract-json.mjs";
// @ts-ignore
import catalogAdapter from "../../../packages/spec-dictionary/adapters/catalog.mjs";
// @ts-ignore
import { markdown } from "../../../packages/spec-dictionary/lib/formats/markdown.mjs";
// @ts-ignore
import { storiesManifest } from "../../../packages/spec-dictionary/lib/formats/stories.mjs";
// @ts-ignore
import { figmaPlan } from "../../../packages/spec-dictionary/lib/formats/figma-plan.mjs";
// @ts-ignore
import { renderers } from "../../../packages/spec-dictionary/lib/renderers/index.mjs";
import Ajv from "ajv";
import data from "virtual:s2a-data";

export const GENERATOR = { name: "s2a-spec-transform", version: "1" };

export type Component = (typeof data)["components"][number];
export const components: Component[] = data.components;
export const contracted = components.filter((c) => c.contracted);
export const capturedAt: string = data.capturedAt;

const tokens = tokensFromFiles(data.tokenFiles);
const shippedNames: Set<string> = tokens.names;

// Same rule as build.mjs's slugIndex(): a component's display name or its
// slug, lowercased and stripped, resolves to its slug.
const alnum = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const slugMap = new Map<string, string>();
for (const c of components) { slugMap.set(alnum(c.name), c.slug); slugMap.set(alnum(c.slug), c.slug); }
const slugOf = (name: string) => slugMap.get(alnum(name)) ?? name;

// ── schema ────────────────────────────────────────────────────────────────────
// Same ajv configuration as @adobecom/s2a-validators: allErrors so one run
// names every problem; strict:false because the schema carries annotations.
const ajv = new Ajv({ allErrors: true, strict: false });
const validateDefsSchema = ajv.compile(data.schemas.defs);

export interface Refusal {
  /** Where, as a JSON pointer into the defs — what you go and fix. */
  path: string;
  message: string;
  /** schema: the file is malformed. curation: it is well-formed and wrong. */
  layer: "schema" | "curation";
  severity: "fail" | "warn";
}

function schemaRefusals(defs: unknown): Refusal[] {
  if (validateDefsSchema(defs)) return [];
  return (validateDefsSchema.errors ?? []).map((e) => {
    const params = (e.params ?? {}) as Record<string, unknown>;
    const prop = params.missingProperty ?? params.additionalProperty;
    const where = e.instancePath || "/";
    const what = prop ? `${where === "/" ? "" : where}/${prop}` : where;
    return { path: what, message: `${what} ${e.message}`, layer: "schema", severity: "fail" };
  });
}

// ── curation (validate-defs.mjs, minus the disk) ─────────────────────────────
function curationRefusals(defs: any, c: Component): Refusal[] {
  const out: Refusal[] = [];
  const fail = (path: string, message: string) => out.push({ path, message, layer: "curation", severity: "fail" });
  const warn = (path: string, message: string) => out.push({ path, message, layer: "curation", severity: "warn" });

  const code = c.code;
  const pending = Boolean(defs.anchors?.code?.pending);
  if (!code && !pending) fail("/anchors/code", `no code evidence: run npm run evidence:code -- --slug=${c.slug}`);

  const walk = (part: any, path: string, fn: (p: any, path: string) => void) => {
    fn(part, path);
    for (const [n, child] of Object.entries(part?.parts ?? {})) walk(child, `${path}/${n}`, fn);
  };

  // composition[] against what the design actually contains — direct only.
  if (defs.composition?.length) {
    const placed = (c.figma?.instances ?? [])
      .filter((i: any) => i.set?.name ?? i.mainComponent?.name)
      .map((i: any) => ({ name: i.set?.name ?? i.mainComponent?.name, path: i.node ?? "" }));
    const observed = new Set<string>(placed
      .filter((x: any) => !placed.some((o: any) => o.path !== x.path && x.path.startsWith(`${o.path}/`)))
      .map((x: any) => x.name));
    const seen = new Set<string>();
    defs.composition.forEach((entry: any, i: number) => {
      const p = `/composition/${i}`;
      if (seen.has(entry.name)) fail(p, `composition: "${entry.name}" listed twice`);
      seen.add(entry.name);
      if (entry.treatment === "internal" && !entry.why?.trim())
        fail(`${p}/why`, `composition "${entry.name}": internal without a why — "internal" is a claim that this is not a component, and it has to be argued`);
      if (entry.treatment === "contract") {
        const target = entry.slug ?? components.find((k) => alnum(k.slug) === alnum(entry.name))?.slug;
        const known = target && components.find((k) => k.slug === target);
        if (!known) warn(p, `composition "${entry.name}": treatment "contract" but no component resolves to it yet — it still needs building`);
        else if (!known.contracted) warn(p, `composition "${entry.name}": ${target} has a spec but no contract yet`);
      }
      if (c.figma && !observed.has(entry.name))
        warn(p, `composition "${entry.name}": not in the Figma evidence any more — the design no longer uses it, or the name changed`);
    });
    for (const name of observed) if (!seen.has(name))
      fail("/composition", `composition: the design builds from "${name}" and composition[] does not say what it is (contract, internal or icon)`);
  }

  if (code || pending) {
    const codeProps = code ? new Set<string>(code.props.map((p: any) => p.name)) : null;
    if (codeProps) {
      defs.props.forEach((p: any, i: number) => {
        if (codeProps.has(p.code?.prop)) return;
        const designHas = p.figma && p.figma !== "NONE";
        (designHas ? warn : fail)(`/props/${i}`, `prop ${p.name}: code prop "${p.code?.prop}" not in the extracted surface (${[...codeProps].join(", ")})${designHas ? " — the design has it; the hand-written component has not caught up. Generated code carries it; implement it there or drop the design property." : ""}`);
      });
      for (const name of codeProps) if (!defs.props.some((p: any) => p.code?.prop === name))
        fail("/props", `code prop "${name}" is not curated (add it with lever true/false)`);
    }
    const parts = code ? new Set<string>([...code.parts.template, ...code.parts.stylesheet, ...(code.parts.runtime ?? [])]) : null;

    walk(defs.anatomy.root, "root", (part, path) => {
      const jp = "/anatomy/" + path.replace(/^root/, "root").split("/").join("/parts/").replace(/^root\/parts\//, "root/parts/");
      const cls = part.selector?.match(/^\.([\w-]+)/)?.[1];
      if (parts && cls && !parts.has(cls)) warn(`${jp}/selector`, `anatomy ${path}: selector ${part.selector} has no matching class in the hand-written template or stylesheet — generated code defines it; implement it there or rename the part`);

      // every token ref, in every conditional map
      const maps: [string, any][] = [["", part.tokens]];
      for (const [st, m] of Object.entries(part.states ?? {})) maps.push([`:${st}`, m]);
      for (const e of part.tokensByProp ?? []) for (const [val, m] of Object.entries(e.map ?? {})) maps.push([`@${e.prop}=${val}`, m]);
      for (const e of part.statesByProp ?? []) for (const [val, m] of Object.entries(e.map ?? {})) maps.push([`@${e.prop}=${val}:${e.state}`, m]);
      for (const e of part.tokensByCombination ?? []) for (const r of e.rows ?? []) maps.push([`@${(e.props ?? []).map((p: string, i: number) => `${p}=${r.values?.[i] ?? "*"}`).join(",")}`, r.tokens]);
      for (const [where, map] of maps) for (const [prop, ref] of Object.entries(map ?? {}) as [string, string][]) {
        for (const m of ref.matchAll(/\{s2a\.[a-z0-9.-]+\}/g)) {
          const v = "--" + m[0].slice(1, -1).replace(/\./g, "-");
          if (shippedNames.size && !shippedNames.has(v)) fail(`${jp}/tokens/${prop}`, `anatomy ${path} ${prop}${where}: ${m[0]} → ${v} is not a shipped token`);
        }
        if (ref.startsWith("raw:")) warn(`${jp}/tokens/${prop}`, `anatomy ${path} ${prop}${where}: ${ref} is hardcoded — no S2A variable behind it. Bind one in Figma and re-extract, or keep the raw: value with the reason in a decision`);
      }

      if (part.asset) {
        const a = part.asset;
        if (!defs.props.some((pp: any) => pp.name === a.prop)) fail(`${jp}/asset/prop`, `anatomy ${path} asset: names prop "${a.prop}", which this component does not have`);
        const doc = data.assets[a.manifest];
        if (!doc) fail(`${jp}/asset/manifest`, `anatomy ${path} asset: manifest "${a.manifest}" has not been built — run npm run specs:assets`);
        else {
          const sample = Object.values(doc.entries ?? {})[0] as Record<string, unknown> ?? {};
          if (!(a.field in sample)) fail(`${jp}/asset/field`, `anatomy ${path} asset: manifest "${a.manifest}" entries have no "${a.field}" field (they have: ${Object.keys(sample).join(", ")})`);
        }
      }

      if (part.slot?.default) {
        const d = part.slot.default;
        if (d.manifest || d.icon) {
          if (!d.manifest || !d.icon) fail(`${jp}/slot/default`, `anatomy ${path} slot default: needs both manifest and icon (has ${d.manifest ? "manifest" : "icon"} only)`);
          else {
            const doc = data.assets[d.manifest];
            if (!doc) fail(`${jp}/slot/default/manifest`, `anatomy ${path} slot default: manifest "${d.manifest}" has not been built — run npm run specs:assets`);
            else if (!doc.entries?.[d.icon]) fail(`${jp}/slot/default/icon`, `anatomy ${path} slot default: "${d.icon}" is not in manifest ${d.manifest} (${Object.keys(doc.entries ?? {}).length} entries) — add the SVG to ${doc.derivedFrom?.module ?? "the library"} and run npm run specs:assets`);
          }
        } else if (d.figma) {
          warn(`${jp}/slot/default`, `anatomy ${path} slot: the design fills it with "${d.figma}" and the contract has not bound that to a code icon — Heal, or set slot.default.manifest and slot.default.icon`);
        }
      }

      if (path === "root") {
        const NAV = /^(href|to|link|url)$/i;
        const nav = defs.props.find((p: any) => NAV.test(p.name) || NAV.test(p.code?.prop ?? ""));
        if (nav && part.element && part.element !== "a" && !part.elementByProp)
          fail("/anatomy/root/element", `anatomy root: prop "${nav.name}" navigates but the root element is <${part.element}> and nothing says otherwise. Add anatomy.root.elementByProp — e.g. { "prop": "${nav.name}", "map": { "": "${part.element}", "*": "a" } } — or drop the prop. WCAG 2.1.1; a link rendered as a button cannot be opened in a new tab or announced as a link.`);
        if (part.elementByProp && !defs.props.some((p: any) => p.name === part.elementByProp.prop))
          fail("/anatomy/root/elementByProp", `anatomy root: elementByProp names prop "${part.elementByProp.prop}", which this component does not have`);
      }

      // geometry on a state reflows the control (border-width excluded: strokes are inset shadows)
      const GEOM = /^(padding|padding-.*|gap|row-gap|column-gap|height|width|min-|max-|font-size|line-height|letter-spacing)/;
      const base = Object.fromEntries(Object.entries(part.tokens ?? {}).filter(([k]) => GEOM.test(k)));
      for (const [st, m] of Object.entries(part.states ?? {}) as [string, any][])
        for (const [prop, ref] of Object.entries(m ?? {})) if (GEOM.test(prop) && base[prop] && base[prop] !== ref)
          warn(`${jp}/states/${st}/${prop}`, `anatomy ${path} ${prop}:${st}: ${ref} differs from the resting ${base[prop]} — a geometry change on a state reflows the control.`);
    });

    for (const d of defs.decisions ?? []) if (d.status === "decided" && !d.decision)
      fail(`/decisions`, `decision ${d.id} is decided without a decision text`);
  }
  return out;
}

// A composed child renders through its own contract, resolved by slug or by
// the name a slot accepts. Same rule as render.mjs, over the Book's registry.
export function contractFor(key: string): { slug: string; name: string; props: any[] } | null {
  const k = alnum(key);
  const c = components.find((x) => x.contract && (x.slug === key || alnum(x.name) === k || alnum(x.slug) === k));
  return c ? { slug: c.slug, name: c.contract.name ?? c.name, props: c.contract.props ?? [] } : null;
}

// ── the build ─────────────────────────────────────────────────────────────────
export interface BuildResult {
  slug: string;
  ir: any;
  refusals: Refusal[];
  /** True when the defs is well-formed enough to derive from. */
  ok: boolean;
  artifacts: Record<string, string>;
  rendered: Record<string, Record<string, string>>;
  manifest: any;
  error?: string;
}

export function build(slug: string, defs: unknown): BuildResult {
  const c = components.find((k) => k.slug === slug);
  if (!c) throw new Error(`unknown component ${slug}`);

  const schema = schemaRefusals(defs);
  // A malformed file does not get derived from: deriving from it would answer
  // a question the file cannot pose, and the refusal is the answer.
  if (schema.length) return { slug, ir: null, refusals: schema, ok: false, artifacts: {}, rendered: {}, manifest: null };

  const d = defs as any;
  const refusals = curationRefusals(d, c);
  try {
    const withHash = { ...d, $hash: hashOf(d) };
    const ir = buildIR({ defs: withHash, code: c.code, figma: c.figma, tokens, generator: GENERATOR });
    const manifest = { $generated: GENERATOR, ...storiesManifest(ir) };
    const artifacts: Record<string, string> = {
      [`${slug}.contract.json`]: JSON.stringify(contractJson(ir, { id: `s2a.${slug}` }), null, 2),
      [`${slug}.spec.json`]: JSON.stringify(specJson(ir, { slugOf }), null, 2),
      [`${slug}.catalog.json`]: JSON.stringify(catalogAdapter.artifacts(ir)[0].data, null, 2),
      [`${slug}.spec.md`]: markdown(ir),
      ["stories.manifest.json"]: JSON.stringify(manifest, null, 2),
      ["figma.plan.json"]: JSON.stringify({ $generated: GENERATOR, ...figmaPlan(ir) }, null, 2),
    };
    const rendered: Record<string, Record<string, string>> = {};
    for (const [id, r] of Object.entries(renderers) as [string, any][]) rendered[id] = r.files(ir, slug, { manifest, contractFor });
    return { slug, ir, refusals, ok: !refusals.some((r) => r.severity === "fail"), artifacts, rendered, manifest };
  } catch (e) {
    // The engine refusing to derive is itself a named outcome, not a crash.
    const message = e instanceof Error ? e.message : String(e);
    return { slug, ir: null, refusals: [...refusals, { path: "/", message: `engine: ${message}`, layer: "curation", severity: "fail" }], ok: false, artifacts: {}, rendered: {}, manifest: null, error: message };
  }
}

// ── drafts ────────────────────────────────────────────────────────────────────
// A component extracted from Figma in this session and not (yet) on disk. It
// joins the library in memory so build() can derive from it like any other;
// Save writes it, and the data plugin's watcher reloads the page from disk.
export function registerDraft(c: Component) {
  const i = components.findIndex((k) => k.slug === c.slug);
  if (i >= 0) components[i] = c; else components.push(c);
  const j = contracted.findIndex((k) => k.slug === c.slug);
  if (j >= 0) contracted[j] = c; else contracted.push(c);
  slugMap.set(alnum(c.name), c.slug);
  slugMap.set(alnum(c.slug), c.slug);
}

export { canonicalJson };
