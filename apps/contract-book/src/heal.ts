// heal.ts — the loop that closes the gap the evals opened.
//
// Parity says WHERE a render drifts from the design and WHICH property owns
// the region (VD01 outside the box: outline/box-shadow; VD03 inside: fill...).
// A refusal says what the contract has not decided. This module turns those
// findings into edits to the defs — never the contract, never the CSS — one
// named fixer at a time, and the caller re-scores after each. It stops when
// nothing applies or everything passes. Every fixer records what it did as a
// decision in the defs, so the healed file reads like a curator's.
//
// The fixers are deliberately few and evidence-bound. A fixer that cannot
// point at the evidence it used does not get to edit.
import data from "virtual:s2a-data";
import { components } from "./engine";

export interface Finding { code: string; state: string; rows: number; worst: number }
export interface ParitySummary { total: number; failing: number; byState: [string, number][]; suspicious: [string, number][]; codes: Finding[] }
export interface HealContext {
  slug: string;
  defs: any;
  evidence: any;
  /** The last parity run, when there is one. Some fixers need it; some only need the defs. */
  parity: { rows: string[]; summary: ParitySummary } | null;
  refusals: { path: string; message: string; severity: string }[];
}
export interface Patch {
  fixer: string;
  /** The finding this answers, in the words the eval or validator used. */
  finding: string;
  /** What changed, one line. */
  change: string;
  /** The evidence the fix was read from. */
  evidence: string;
  defs: any;
}
export interface Fixer { id: string; applies(ctx: HealContext): Patch | null }

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const alnum = (s: string) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const refOf = (variableName: string) => `{${String(variableName).replace(/\//g, ".")}}`;

function walkParts(root: any, fn: (part: any, path: string) => void) {
  const visit = (part: any, path: string) => { fn(part, path); for (const [n, c] of Object.entries(part?.parts ?? {})) visit(c, `${path}/${n}`); };
  visit(root, "root");
}

/** Every slot default a part carries: the resting one and each per-prop filling, with a label for the log. */
function slotDefaults(part: any, path: string): { d: any; where: string }[] {
  const out: { d: any; where: string }[] = [];
  if (part?.slot?.default) out.push({ d: part.slot.default, where: path });
  for (const e of part?.slot?.defaultByProp ?? []) for (const [value, d] of Object.entries(e.map ?? {})) out.push({ d, where: `${path} @${e.prop}=${value}` });
  return out;
}

// A design name and a library entry name describe the same glyph when they
// match letter for letter after the family prefix and the size/weight
// suffix: S2_Icon_ChevronDown_20_N and chevron-down. The family may differ
// (S2 vs S2a), which is why an exact figmaName match is tried first.
const strip = (n: string) => alnum(String(n).replace(/^S2a?_Icon_/i, "").replace(/_(\d+)_[A-Z]$/i, "").replace(/_Size\d+_[A-Z]$/i, ""));

function decide(defs: any, d: { id: string; question: string; decision: string; evidence: string }) {
  defs.decisions ??= [];
  const i = defs.decisions.findIndex((x: any) => x.id === d.id);
  const entry = { id: d.id, question: d.question, chose: d.decision, decision: d.decision, status: "decided", owner: "heal", evidence: d.evidence, confidence: "high" };
  if (i >= 0) defs.decisions[i] = entry; else defs.decisions.push(entry);
}

// ── 1. an unresolved slot default → the code icon library ───────────────────
// The scaffold records the design's icon by name; this binds it to the entry in
// the s2a-icons manifest whose key or Figma name has the same letters. It is a
// decision because two libraries can disagree, so it is written as one.
const iconResolve: Fixer = {
  id: "icon-resolve",
  applies(ctx) {
    const manifest = data.assets["s2a-icons"];
    if (!manifest?.entries) return null;
    let patch: Patch | null = null;
    const defs = clone(ctx.defs);
    walkParts(defs.anatomy?.root, (part, path) => {
      if (patch) return;
      for (const { d, where } of slotDefaults(part, path)) {
        // A composed child whose Icon swap the design set by name: the same
        // binding, on the child's prop rather than on a slot default.
        if (d?.slug && d.props) {
          const child = components.find((c) => c.slug === d.slug);
          const swap = child?.defs?.props?.find((p: any) => p.figma?.kind === "INSTANCE_SWAP");
          const key = swap ? String(swap.figma.property).split("#")[0].trim() : null;
          const name = key ? d.props[key] : undefined;
          if (key && typeof name === "string" && /^S2a?_Icon_/i.test(name)) {
            const hit = Object.keys(manifest.entries).find((k) => manifest.entries[k].figmaName === name);
            if (hit) {
              d.props[key] = hit;
              decide(defs, {
                id: `heal-icon-${where.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${key.toLowerCase()}`,
                question: `The design swaps ${name} into ${d.figma}'s ${key} at ${where}. Which code icon is that?`,
                decision: `${name} → s2a-icons/${hit} (${manifest.entries[hit].file}): the library entry for exactly this glyph.`,
                evidence: `${ctx.slug}.figma.evidence.json instances · packages/spec-dictionary/out/assets/s2a-icons.json`,
              });
              patch = { fixer: "icon-resolve", finding: `${where}: ${d.figma}'s ${key} is "${name}", not bound to a code icon`, change: `${where} props.${key} → "${hit}"`, evidence: `s2a-icons entry ${hit} (figmaName ${name})`, defs };
              return;
            }
          }
        }
        if (!d?.figma || d.icon || d.slug) continue;
        // Exact: the library entry fetched from, or named for, this very glyph.
        const key = Object.keys(manifest.entries).find((k) => manifest.entries[k].figmaName === d.figma);
        if (!key) continue;
        d.manifest = "s2a-icons";
        d.icon = key;
        decide(defs, {
          id: `heal-icon-${where.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
          question: `The design fills ${where} with ${d.figma}. Which code icon is that?`,
          decision: `${d.figma} → s2a-icons/${key} (${manifest.entries[key].file}): the library entry for exactly this glyph.`,
          evidence: `${ctx.slug}.figma.evidence.json instances · packages/spec-dictionary/out/assets/s2a-icons.json`,
        });
        patch = { fixer: "icon-resolve", finding: `${where}: design default "${d.figma}" not bound to a code icon`, change: `${where} → { manifest: "s2a-icons", icon: "${key}" }`, evidence: `s2a-icons entry ${key} (figmaName ${manifest.entries[key].figmaName})`, defs };
        return;
      }
    });
    return patch;
  },
};

// ── 2. the design paints a ring outside the box in the focus state ──────────
// VD01 in the focus column, every row — or the column flagged as consistently
// worse — and a Focus Ring layer in the focus variant stroked with a token: the
// ring becomes an outline on the root, sized from the layer's own geometry.
const focusRing: Fixer = {
  id: "focus-ring",
  applies(ctx) {
    const p = ctx.parity;
    if (!p) return null;
    const systematic = p.summary.codes.find((c) => c.code === "VD01" && /focus/i.test(c.state) && c.rows === p.rows.length);
    const suspicious = p.summary.suspicious.some(([state]) => /focus/i.test(state));
    if (!systematic && !suspicious) return null;
    const root = ctx.defs.anatomy?.root;
    if (!root) return null;

    const ev = ctx.evidence;
    const variant = (ev?.variants ?? []).find((v: any) => /state=focus/i.test(v.name));
    if (!variant) return null;
    const ring = (ev.bindings ?? []).filter((b: any) => b.variant === variant.name && /focus.?ring/i.test(b.node));
    const stroke = ring.find((b: any) => b.property === "strokes" && b.variable);
    if (!stroke) return null;
    // The ring goes around the layer that holds it: a radio's [focus ring]
    // sits inside the 20px control, not around the whole label. The part
    // whose figma path is the ring layer's parent is the target; the root
    // when the ring is a direct child of the variant.
    const parentPath = String(stroke.node).replace(/\/[^/]*$/, "");
    let target: any = root, targetWhere = "root";
    const find = (part: any, path: string) => { for (const [n, c] of Object.entries(part?.parts ?? {}) as [string, any][]) { if (c.figma === parentPath) { target = c; targetWhere = `${path}/${n}`; return true; } if (find(c, `${path}/${n}`)) return true; } return false; };
    if (parentPath) find(root, "root");
    if (target.states?.focus?.["outline-color"]) return null;
    const colour = ev.variables?.[stroke.variable]?.name;
    const weightBinding = ring.find((b: any) => /^stroke(Top)?Weight$/.test(b.property) && b.variable);
    const weightName = weightBinding ? ev.variables?.[weightBinding.variable]?.name : null;
    const weightPx = weightBinding
      ? Number(Object.values(ev.variables?.[weightBinding.variable]?.resolved ?? {})[0]) || 1
      : Number((ev.unboundValues ?? []).find((u: any) => u.variant === variant.name && u.node === stroke.node && u.property === "strokeWeight")?.value) || 1;
    const literal = (prop: string) => (ev.unboundValues ?? []).find((u: any) => u.variant === variant.name && u.node === stroke.node && u.property === prop)?.value;
    const ringW = Number(literal("width"));
    const rootW = target === root ? Number(variant.width) : Number(String(target.tokens?.width ?? "").replace(/^raw:/, "").replace(/px$/, "")) || Number(variant.width);
    // CSS draws an outline outside the element, offset from its edge. Where
    // the design's ring sits depends on how its stroke is aligned to the ring
    // layer's box: OUTSIDE adds the weight beyond the box, INSIDE keeps it
    // within, CENTER splits it. ControlButton's ring is a 34px box with a 1px
    // OUTSIDE stroke around a 32px root: offset 1, not 0.
    const align = String(literal("strokeAlign") ?? "INSIDE");
    const inside = align === "INSIDE" ? weightPx : align === "CENTER" ? weightPx / 2 : 0;
    const offset = Number.isFinite(ringW) && Number.isFinite(rootW) ? Math.max(0, Math.round(((ringW - rootW) / 2 - inside) * 100) / 100) : 1;
    if (!colour) return null;

    const defs = clone(ctx.defs);
    let r: any = defs.anatomy.root;
    if (target !== root) { for (const seg of targetWhere.split("/").slice(1)) r = r.parts[seg]; }
    // An outline follows the element's border-radius. A round ring layer on a
    // square box would draw a square ring; the box takes the layer's shape.
    const trees = ev.anatomy?.variants ?? {};
    const nodeAt = (tree: any, path: string) => { let n = tree; for (const seg of path.split("/").filter(Boolean)) { n = (n?.children ?? []).find((c: any) => c.name === seg); if (!n) return null; } return n; };
    const ringLayer = nodeAt(trees[variant.name], stroke.node);
    if (ringLayer?.type === "ELLIPSE" && !r.tokens?.["border-radius"]) r.tokens = { ...(r.tokens ?? {}), "border-radius": "raw:50%" };
    r.states ??= {};
    r.states.focus = {
      ...(r.states.focus ?? {}),
      "outline-color": refOf(colour),
      "outline-width": weightName ? refOf(weightName) : `raw:${weightPx}px`,
      "outline-style": "raw:solid",
      "outline-offset": `raw:${offset}px`,
    };
    decide(defs, {
      id: "heal-focus-ring",
      question: `Figma draws the focus state's ring as a child layer (${stroke.node}) stroked with ${colour}, on the State=focus variant. A child layer is how a design file paints outside the shape without resizing it. Carry it as a part, a border, or an outline?`,
      decision: `outline on the ${targetWhere} in the focus state: colour ${colour}, width ${weightName ?? `${weightPx}px`}, offset ${offset}px — the ring is a ${ringW}px box with a ${weightPx}px ${align} stroke around the ${rootW}px ${targetWhere === "root" ? "root" : "part"}. A part would put a box inside the shape; a border would resize it.`,
      evidence: `${ctx.slug}.figma.evidence.json bindings, variant "${variant.name}", node ${stroke.node}`,
    });
    const finding = systematic
      ? `VD01 PAINT_OUTSIDE_BOX in "${systematic.state}", ${systematic.rows}/${p.rows.length} rows — the design paints beyond the border box`
      : `"focus" consistently worse than the other states in every row — the shape of a ring missing everywhere`;
    return {
      fixer: "focus-ring",
      finding,
      change: `anatomy ${targetWhere} states.focus → outline ${refOf(colour)} ${weightName ? refOf(weightName) : `${weightPx}px`} solid, offset ${offset}px`,
      evidence: `evidence: "${variant.name}" ${stroke.node} strokes → ${colour}`,
      defs,
    };
  },
};

// ── 1b. an icon the library does not have → fetch it from the design file ───
// The library is where a glyph is supposed to live, so a design icon with no
// entry is pulled in — SVG export of the very node the design uses — and then
// resolved like any other. Asynchronous, because it talks to Figma and to disk.
export async function iconFetch(ctx: HealContext): Promise<Patch | null> {
  const manifest = data.assets["s2a-icons"];
  let target: { path: string; d: any } | null = null;
  walkParts(ctx.defs.anatomy?.root, (part, path) => {
    for (const { d, where } of slotDefaults(part, path)) {
      if (target || !d?.figma || d.icon || d.slug) continue;
      const have = manifest?.entries && Object.keys(manifest.entries).some((k) => manifest.entries[k].figmaName === d.figma);
      if (!have) target = { path: where, d };
    }
  });
  if (!target) return null;
  const { path, d } = target as { path: string; d: any };
  const ev = ctx.evidence;
  const inst = (ev?.instances ?? []).find((i: any) => i.mainComponent?.name === d.figma);
  const fileKey = ev?.file?.key;
  if (!inst?.mainComponent?.id || !fileKey) return null;
  const res = await fetch("/__extract/icon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileKey, nodeId: inst.mainComponent.id, key: inst.mainComponent.key, figmaName: d.figma }) });
  const out = await res.json();
  if (!out.ok) return null;
  // The page's copy of the manifest, so the preview renders it without a reload.
  if (manifest?.entries) manifest.entries[out.icon] = out.entry;
  const assets = (window as any).__s2aAssets;
  if (assets?.["s2a-icons"]?.entries) assets["s2a-icons"].entries[out.icon] = out.entry;
  const defs = clone(ctx.defs);
  walkParts(defs.anatomy?.root, (part, p) => { for (const { d: dd, where } of slotDefaults(part, p)) if (where === path) { dd.manifest = out.manifest; dd.icon = out.icon; } });
  decide(defs, {
    id: `heal-icon-${path.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    question: `The design fills the ${path} slot with ${d.figma}, and the icon library has no such glyph. Add it, or substitute?`,
    decision: `Fetched ${d.figma} from the design file (node ${inst.mainComponent.id}) as ${out.file} and bound the slot to s2a-icons/${out.icon}. Review the glyph; it is the design's, not a redraw.`,
    evidence: `${ctx.slug}.figma.evidence.json instances · ${out.file} · packages/components/src/icons/figma-sources.json`,
  });
  return {
    fixer: "icon-fetch",
    finding: `${path} slot: design default "${d.figma}" is not in the icon library`,
    change: `fetched ${out.file} from Figma; slot.default → { manifest: "s2a-icons", icon: "${out.icon}" }`,
    evidence: `Figma ${fileKey} node ${inst.mainComponent.id} → ${out.file}`,
    defs,
  };
}

// ── 3. a token the design binds that the build does not ship ────────────────
// The design is bound to s2a/product-lockup/gap-inline; the token CSS has no
// such variable. That is a token-pipeline gap, not a design error, and until
// the token ships the contract carries the value the design resolves to — as
// a raw: literal, flagged like every other literal, with the token named in
// the decision so it is a one-line swap when it lands.
const tokenUnshipped: Fixer = {
  id: "token-unshipped",
  applies(ctx) {
    const r = ctx.refusals.find((x) => x.severity === "fail" && /is not a shipped token/.test(x.message));
    if (!r) return null;
    const m = r.message.match(/anatomy (\S+) ([a-z-]+)(?:(@[^:]+)?(:[a-z-]+)?)?: (\{s2a\.[a-z0-9.-]+\})/);
    if (!m) return null;
    const [, path, css, , , ref] = m;
    const name = ref.slice(1, -1).replace(/\./g, "/");
    const variable = Object.values(ctx.evidence?.variables ?? {}).find((v: any) => v.name === name) as any;
    if (!variable) return null;
    const value = Object.values(variable.resolved ?? {})[0] as any;
    const literal = typeof value === "number" ? `raw:${value}px`
      : value && typeof value === "object" && "r" in value ? `raw:rgba(${Math.round(value.r * 255)}, ${Math.round(value.g * 255)}, ${Math.round(value.b * 255)}, ${value.a ?? 1})`
      : null;
    if (!literal) return null;
    const defs = clone(ctx.defs);
    let changed = false;
    walkParts(defs.anatomy?.root, (part, p) => {
      if (p !== path) return;
      const maps: any[] = [part.tokens, ...Object.values(part.states ?? {}), ...(part.tokensByProp ?? []).flatMap((e: any) => Object.values(e.map ?? {})), ...(part.statesByProp ?? []).flatMap((e: any) => Object.values(e.map ?? {}))];
      for (const map of maps) if (map && map[css] === ref) { map[css] = literal; changed = true; }
    });
    if (!changed) return null;
    decide(defs, {
      id: `heal-token-${name.split("/").slice(-2).join("-")}`,
      question: `The design binds ${name} and the built token CSS does not ship it. Carry the literal until it does?`,
      decision: `${ref} → ${literal}, the value the design resolves to. A token-pipeline gap: when ${name} ships, replace the literal with ${ref}.`,
      evidence: `${ctx.slug}.figma.evidence.json variables · dist/packages/tokens/css/dev`,
    });
    return { fixer: "token-unshipped", finding: r.message, change: `anatomy ${path} ${css}: ${ref} → ${literal}`, evidence: `evidence variable ${name} resolves to ${JSON.stringify(value)}`, defs };
  },
};

// ── 1c. a glyph of the same name from another family ────────────────────────
// When the exact glyph cannot be fetched, a library entry with the same name
// after prefix and size (S2_Icon_ChevronDown_20_N ↔ S2a chevron-down) is the
// nearest honest answer — written as one to review, because two families
// draw a chevron differently.
const iconNear: Fixer = {
  id: "icon-near",
  applies(ctx) {
    const manifest = data.assets["s2a-icons"];
    if (!manifest?.entries) return null;
    let patch: Patch | null = null;
    const defs = clone(ctx.defs);
    walkParts(defs.anatomy?.root, (part, path) => {
      if (patch) return;
      for (const { d, where } of slotDefaults(part, path)) {
        if (!d?.figma || d.icon || d.slug) continue;
        const want = strip(d.figma);
        const key = Object.keys(manifest.entries).find((k) => alnum(k) === want || strip(manifest.entries[k].figmaName ?? "") === want);
        if (!key) continue;
        d.manifest = "s2a-icons"; d.icon = key;
        decide(defs, {
          id: `heal-icon-${where.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
          question: `The design fills ${where} with ${d.figma}, which the library does not have and Figma would not export. Nearest glyph by name?`,
          decision: `${d.figma} → s2a-icons/${key} (${manifest.entries[key].figmaName}) — same name, different family. Review the glyph; replace with the exact one if the family matters.`,
          evidence: `packages/spec-dictionary/out/assets/s2a-icons.json`,
        });
        patch = { fixer: "icon-near", finding: `${where}: "${d.figma}" has no exact library entry`, change: `${where} → s2a-icons/${key} (nearest by name)`, evidence: `s2a-icons entry ${key}`, defs };
        return;
      }
    });
    return patch;
  },
};

export const FIXERS: Fixer[] = [tokenUnshipped, iconResolve, focusRing];

/** The first fixer that has something to do, or null when the loop should stop. */
export async function nextPatch(ctx: HealContext): Promise<Patch | null> {
  for (const f of FIXERS) { const p = f.applies(ctx); if (p) return p; }
  return (await iconFetch(ctx)) ?? iconNear.applies(ctx);
}
