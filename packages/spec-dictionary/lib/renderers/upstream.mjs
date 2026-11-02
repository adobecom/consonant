// upstream.mjs — the Storybook target for a shipped library.
//
// Our own components are generated from the contract (lit.mjs): the contract
// is the implementation. A library someone else ships — Spectrum 2's
// `@adobe/spectrum-wc` — already has an implementation, and a better one than
// anything regenerated from a description of it. So this target writes no
// component and no CSS. It mounts the element the contract anchors
// (`anchors.code.importPath` → `<swc-avatar>`), sets its properties from the
// story args, fills its slots from the contract's slot defaults, and lets the
// library draw. Every pixel is the library's; the contract supplies the
// variants, the args, the sample content and the Figma node each story depicts.
//
// One shared stylesheet accompanies the stories: the system's vendored token
// build with `:root` rewritten to `.swc-root`, so Spectrum's theme setup is
// scoped to a wrapper around each story instead of restyling the whole
// Storybook canvas.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { stateProp } from "../formats/matrix.mjs";
import { variantNodeId, litMatrix } from "./lit.mjs";

const pascal = (s) => s.split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
const q = (v) => JSON.stringify(v);

/** The custom element tag: declared by the code evidence, else read off the import path. */
function tagOf(ir) {
  return ir.code?.declarations?.element ?? `${ir.component.system === "spectrum" ? "swc" : ir.component.system}-${ir.component.slug}`;
}

/**
 * Each story arg and how it reaches the element:
 *   prop   — a property on the element (`el.size = "500"`)
 *   text   — text in the default slot (the contract's prop binds code "default")
 *   icon   — a glyph from the system's icon manifest, into a named or the default slot
 */
function argsOf(ir, system) {
  const declaredSlots = new Set((ir.code?.declarations?.slots ?? []).map((s) => s.name));
  const slotParts = (ir.anatomy?.parts ?? []).filter((p) => p.slot);
  const args = [];
  const seen = new Set();
  for (const p of ir.props) {
    const codeProp = p.bindings?.code?.prop ?? p.name;
    const slotPart = slotParts.find((s) => s.slot.name === codeProp || s.slot.name === p.name);
    const isIcon = slotPart && (slotPart.slot.accepts ?? []).includes("kind:icon");
    const entry = { name: p.name, type: p.enum ? "enum" : p.type, enum: p.enum ?? null, description: p.description ?? null };
    if (codeProp === "default") args.push({ ...entry, kind: "text", default: p.default ?? null });
    else if (isIcon) {
      const slot = declaredSlots.has(slotPart.slot.name) ? slotPart.slot.name : null;
      args.push({ ...entry, kind: "icon", slot, default: slotPart.slot.default?.icon ?? null, manifest: slotPart.slot.default?.manifest ?? null });
      seen.add(slotPart.path);
    } else {
      let def = p.default ?? null;
      // A slot default can name the prop's sample value (avatar's picture);
      // `assets/<file>` is served from the system's assets directory.
      for (const s of slotParts) { const v = s.slot.default?.props?.[p.name]; if (v !== undefined) def = v; }
      if (typeof def === "string" && def.startsWith("assets/")) def = `/${system.id}-assets/${def.slice("assets/".length)}`;
      args.push({ ...entry, kind: "prop", prop: codeProp, default: def });
    }
  }
  // A glyph slot no prop drives (the icon component's own glyph) still needs
  // an arg, or the story shows an empty box.
  for (const s of slotParts) {
    if (seen.has(s.path) || !(s.slot.accepts ?? []).includes("kind:icon")) continue;
    const slot = declaredSlots.has(s.slot.name) ? s.slot.name : null;
    args.push({ name: s.slot.name, kind: "icon", type: "string", enum: null, slot, default: s.slot.default?.icon ?? null, manifest: s.slot.default?.manifest ?? null, description: s.slot.notes ?? null });
  }
  return args;
}

const axisKey = (name) => String(name).replace(/#.*$/, "");
const STATE_AXIS = /^(state|breakpoint|context|orientation)$/i;
/** "Style=Initials, Size=500 (40x40)" → { style: "Initials", size: "500 (40x40)" } */
const axesOfName = (n) => Object.fromEntries(String(n).split(",").map((p) => { const [k, v] = p.split("="); return k && v ? [k.trim().toLowerCase(), v.trim()] : []; }).filter((e) => e.length));

/**
 * Every design variant the contract cannot ask for.
 *
 * A design axis no prop binds — Avatar's Style (User image, Gradient image,
 * Initials, Guest), Badge's Color — is invisible to the stories, because the
 * stories come from the props. That is exactly the gap worth seeing: the
 * design has it, the implementation does not. One entry per unbound axis
 * value, with the Figma node that shows it at the component's defaults.
 */
export function designOnlyVariants(ir) {
  const fe = ir.figmaEvidence;
  if (!fe?.axes?.length || !fe.variantNodes?.length) return [];
  const bound = new Set(ir.props.map((p) => p.bindings?.figma?.property).filter(Boolean).map((n) => axisKey(n).toLowerCase()));
  const defaults = {};
  for (const p of ir.props) {
    const f = p.bindings?.figma;
    if (!f?.property || p.default == null) continue;
    const label = f.valueMap?.[String(p.default)] ?? String(p.default);
    defaults[axisKey(f.property).toLowerCase()] = label;
  }
  const out = [];
  for (const axis of fe.axes) {
    const key = axisKey(axis.name);
    if (!axis.options?.length || bound.has(key.toLowerCase()) || STATE_AXIS.test(key)) continue;
    for (const option of axis.options) {
      // "--" is the design's way of saying another axis is in use; not a value.
      if (/^-+$/.test(String(option).trim())) continue;
      const wanted = { ...defaults, [key.toLowerCase()]: String(option), state: "Default" };
      let best = null, score = -1;
      for (const v of fe.variantNodes) {
        const a = axesOfName(v.name);
        if ((a[key.toLowerCase()] ?? "").toLowerCase() !== String(option).toLowerCase()) continue;
        let sc = 0;
        for (const [k, val] of Object.entries(wanted)) if (a[k] !== undefined && a[k].toLowerCase() === String(val).toLowerCase()) sc++;
        if (sc > score) { best = v; score = sc; }
      }
      if (best) out.push({ axis: key, value: String(option), nodeId: best.id, name: best.name });
    }
  }
  return out;
}

/**
 * Does a story set a value whose own tokens paint in the canvas colour? Then
 * it needs a layer under it, or it shows nothing: Avatar's outline ring is the
 * canvas colour by design.
 */
function paintsInCanvas(ir, args, canvasValue) {
  if (!canvasValue) return false;
  const parts = ir.anatomy?.parts ?? [];
  for (const [prop, value] of Object.entries(args ?? {})) {
    for (const part of parts) {
      const map = (part.tokensByProp ?? []).find((e) => e.prop === prop)?.map?.[String(value)];
      for (const cell of Object.values(map ?? {})) if ((cell?.tokens ?? []).some((t) => t.value === canvasValue)) return true;
    }
  }
  return false;
}

/** The vendored token build, scoped to a wrapper class instead of :root. */
export function scopedTokens(system) {
  const files = ["tokens.primitives.css", "tokens.semantic.css", "tokens.semantic.light.css", "tokens.semantic.dark.css"];
  const parts = [];
  for (const f of files) {
    const p = join(system.tokensDir, f);
    if (!existsSync(p)) continue;
    parts.push(`/* ${f} */\n` + readFileSync(p, "utf8").replace(/^@import[^\n]*\n/gm, "").replace(/:root\b/g, ".swc-root"));
  }
  return `/* Generated by spec-dictionary from ${system.tokensDir.replace(/.*\/packages\//, "packages/")}. Do not edit by hand.
   The system's own token build, with :root rewritten to .swc-root so its theme
   setup applies inside a story wrapper and nowhere else. */
.swc-root { font-family: var(--swc-sans-font-family-stack); font-size: var(--swc-font-size); color: var(--swc-neutral-content-color-default, CanvasText); }
${parts.join("\n")}`;
}

/**
 * The system's own icon component, when it has one: a glyph slotted into a
 * button or a badge goes through it, which is what colours the glyph — Spectrum
 * draws paths with `fill: var(--iconPrimary)` and <swc-icon> is what sets that
 * to currentColor. A bare <svg> in the slot paints #222 on every background.
 */
function iconComponent(system, selfSlug) {
  if (selfSlug === "icon" || !system.src) return null;
  const dir = join(system.src, "icon");
  const defs = existsSync(join(dir, "icon.defs.json")) ? JSON.parse(readFileSync(join(dir, "icon.defs.json"), "utf8")) : null;
  const code = existsSync(join(dir, "icon.code.evidence.json")) ? JSON.parse(readFileSync(join(dir, "icon.code.evidence.json"), "utf8")) : null;
  const tag = code?.declarations?.element;
  if (!defs?.anchors?.code?.importPath || !tag) return null;
  return { tag, register: system.storybook.register ? system.storybook.register(defs.anchors.code.importPath, tag) : defs.anchors.code.importPath };
}

export function upstreamStories(ir, slug, manifest, { system, storyDir, tokens = null }) {
  const name = pascal(slug);
  const tag = tagOf(ir);
  const iconWrap = iconComponent(system, slug);
  const grounds = system.storybook.canvas ? { canvas: system.storybook.canvas, layer: system.storybook.layer ?? system.storybook.canvas } : null;
  const canvasValue = grounds && tokens ? tokens.resolve(grounds.canvas).value : null;
  const refVar = (ref) => "--" + ref.replace(/^\{|\}$/g, "").replace(/\./g, "-");
  const key = `${system.id}:${slug}`;
  const fileKey = ir.anchors?.figma?.fileKey ?? null;
  const args = argsOf(ir, system);
  const iconArgs = args.filter((a) => a.kind === "icon");
  const manifestName = iconArgs.find((a) => a.manifest)?.manifest ?? null;
  const manifestFile = manifestName && system.assets ? join(system.assets, `${manifestName}.json`) : null;
  const manifestImport = manifestFile && existsSync(manifestFile)
    ? `import ICONS from ${q(relativeImport(storyDir, manifestFile))} with { type: "json" };`
    : null;
  const defaults = Object.fromEntries(args.filter((a) => a.default !== null && a.default !== undefined).map((a) => [a.name, a.default]));

  const groundArgType = grounds ? `    ground: { control: 'select', options: ['canvas', 'layer'], description: "What the component sits on: the application canvas, or one layer up." },\n` : "";
  const argTypes = groundArgType + args.map((a) => {
    if (a.kind === "icon") return `    ${a.name}: { control: 'select', options: ${manifestImport ? "ICON_NAMES" : "[]"}${a.description ? `, description: ${q(a.description)}` : ""} },`;
    if (a.type === "enum") return `    ${a.name}: { control: 'select', options: ${q(a.enum)}${a.description ? `, description: ${q(a.description)}` : ""} },`;
    if (a.type === "boolean") return `    ${a.name}: { control: 'boolean'${a.description ? `, description: ${q(a.description)}` : ""} },`;
    return `    ${a.name}: { control: 'text'${a.description ? `, description: ${q(a.description)}` : ""} },`;
  }).join("\n");

  const storyLines = (manifest?.derived ?? []).map((s) => {
    const id = pascal(s.id.replace(/[^a-z0-9]/gi, " "));
    const node = variantNodeId(ir, s.args);
    const params = node && fileKey ? `, parameters: { figma: { nodeId: ${q(node)} } }` : "";
    // A variant that paints in the canvas colour sits on a layer, or it is invisible.
    const onLayer = grounds && paintsInCanvas(ir, s.args, canvasValue);
    const args = onLayer ? { ...(s.args ?? {}), ground: "layer" } : (s.args ?? {});
    return `export const ${id} = { name: ${q(onLayer ? `${s.name} (on a layer)` : s.name)}, args: ${q(args)}${params} };`;
  });
  const [first, ...rest] = storyLines;
  const matrix = litMatrix(ir, slug, manifest?.matrix, { slugKey: key, selector: ".s2a-matrix" });
  const stories = [first, "", matrix, ...rest].filter((x) => x != null).join("\n");

  return `// Generated from ${slug}.contract.json by spec-dictionary. Do not edit by hand.
//
// This mounts the element ${system.ns === "spectrum" ? "Adobe ships" : "the library ships"} — <${tag}> from ${ir.anchors.code.importPath} —
// and sets it up from the contract. Nothing here re-implements the component;
// what you see is the library's own rendering, under the library's own tokens.
import { html } from 'lit';
import ${q(system.storybook.register ? system.storybook.register(ir.anchors.code.importPath, tag) : ir.anchors.code.importPath)};
import './${system.id}.css';${iconWrap && manifestImport ? `\nimport ${q(iconWrap.register)};` : ""}
${manifestImport ?? ""}

const TAG = ${q(tag)};
${manifestImport ? "const ICON_NAMES = ['', ...Object.keys(ICONS.entries)];" : ""}
/** How each arg reaches the element. */
const ARGS = ${JSON.stringify(args.map(({ name, kind, prop, slot, type }) => ({ name, kind, ...(prop ? { prop } : {}), ...(slot ? { slot } : {}), type })), null, 2)};
// Not exported: Storybook would list any export as a story.
const DEFAULTS = ${JSON.stringify(defaults, null, 2)};

${manifestImport ? `function glyph(name, slot) {
  const entry = ICONS.entries[name];
  if (!entry) return null;
  const t = document.createElement('template');
  t.innerHTML = entry.svg.trim();
  const svg = t.content.firstElementChild;
  if (!svg) return null;
  ${iconWrap ? `// Through the system's icon component, so the glyph takes the slot's colour.
  const wrap = document.createElement(${q(iconWrap.tag)});
  wrap.append(svg);
  if (slot) wrap.setAttribute('slot', slot);
  return wrap;` : `if (slot) svg.setAttribute('slot', slot);
  return svg;`}
}
` : ""}
function ${name}(args = {}) {
  const a = { ...DEFAULTS, ...args };
  const el = document.createElement(TAG);
  for (const spec of ARGS) {
    const v = a[spec.name];
    if (v === undefined || v === null || v === '') continue;
    if (spec.kind === 'prop') {
      const value = spec.type === 'boolean' ? v === true || v === 'true' : v;
      // A derived, getter-only property (Button's pendingActive) cannot be
      // assigned; the attribute is the other way in, and harmless if ignored.
      try { el[spec.prop] = value; }
      catch { if (value !== false) el.setAttribute(spec.prop.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()), value === true ? '' : String(value)); }
    }
    else if (spec.kind === 'text') el.append(document.createTextNode(String(v)));
    ${manifestImport ? "else if (spec.kind === 'icon') { const g = glyph(String(v), spec.slot ?? null); if (g) el.append(g); }" : ""}
  }
  return el;
}

const theme = (ctx) => (ctx.globals?.theme === 'dark' ? 'dark' : 'light');

export default {
  title: ${q(`${system.storybook.title}/${name}`)},
  component: TAG,
  render: (args) => ${name}(args),
  args: DEFAULTS,
  argTypes: {
${argTypes}
  },
  parameters: {
    // The design overlay: this system's goldens are filed under the composite
    // slug, and the element itself is what gets measured.
    figma: { fileKey: ${q(fileKey ?? "")}, slug: ${q(key)}, selector: TAG },
  },
  decorators: [
    // The library's theme setup, scoped: swc-theme classes drive color-scheme
    // and the size toggles; the toolbar's Theme global picks light or dark.
    (story, ctx) => html\`<div class="swc-root swc-theme swc-theme--\${theme(ctx)} swc-theme--sizeM" style="display:inline-block; padding:16px; background: var(\${${grounds ? `ctx.args?.ground === 'layer' ? ${q(refVar(grounds.layer))} : ${q(refVar(grounds.canvas))}` : q("--swc-gray-25")}})">\${story()}</div>\`,
  ],
};

${stories}
`;
}

/**
 * The design-only stories: one per variant the design has and the contract
 * cannot ask for. Each shows the Figma render (the committed golden for that
 * node, `npm run goldens:variants -- --slug=<system>:<slug>`), says which
 * axis it is, and names the decisions that discuss it.
 */
export function designOnlyStories(ir, slug, { system }) {
  const name = pascal(slug);
  const key = `${system.id}:${slug}`;
  const variants = designOnlyVariants(ir);
  const fileKey = ir.anchors?.figma?.fileKey ?? "";
  const decisionsFor = (axis) => (ir.decisions ?? []).filter((d) => new RegExp(`\\b${axis.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(`${d.question ?? ""} ${d.decision ?? ""}`)).map((d) => d.id);
  const stories = variants.map((v) => {
    const id = pascal(`${v.axis} ${v.value}`.replace(/[^a-z0-9]/gi, " "));
    return `export const ${id} = {
  name: ${q(`${v.axis}: ${v.value}`)},
  parameters: { figma: { nodeId: ${q(v.nodeId)} } },
  render: () => designOnly(${q({ axis: v.axis, value: v.value, nodeId: v.nodeId, variant: v.name, decisions: decisionsFor(v.axis) })}),
};`;
  });
  return `// Generated from ${slug}.contract.json by spec-dictionary. Do not edit by hand.
//
// What the design has that the implementation cannot be asked for. These are
// not the component: they are the design file's own renders, one per value of
// every axis no prop binds. A design/code gap you can point at, instead of a
// variant that silently never appears.
import { html } from 'lit';

const GOLDENS = ${q(`/figma-goldens/${key}/`)};
const IMPORT = ${q(ir.anchors.code.importPath)};

function designOnly({ axis, value, nodeId, variant, decisions }) {
  const src = GOLDENS + nodeId.replace(':', '-') + '.png';
  const onError = (e) => { e.target.replaceWith(Object.assign(document.createElement('div'), { className: 'design-only__missing', textContent: 'No render on disk for ' + nodeId + '. Fetch it: npm run goldens:variants -- --slug=' + ${q(key)} })); };
  return html\`
    <figure class="design-only">
      <img class="design-only__shot" src=\${src} alt=\${variant} @error=\${onError}>
      <figcaption>
        <b>\${axis}: \${value}</b> — in the design file; no prop in the contract binds it, so no story can ask <code>\${IMPORT}</code> for it.
        \${decisions.length ? html\`<br>See \${decisions.map((d) => html\`<code>\${d}</code> \`)}in the contract.\` : ''}
        <br><small>\${variant} · node \${nodeId}</small>
      </figcaption>
    </figure>
    <style>
      .design-only { margin: 0; display: inline-flex; flex-direction: column; gap: 10px; max-width: 520px; font: 13px/1.5 system-ui, sans-serif; }
      .design-only__shot { display: block; max-width: 100%; zoom: .5; image-rendering: auto; border: 1px dashed #c8c8c8; border-radius: 8px; padding: 12px; background:
        repeating-conic-gradient(#f4f4f4 0 25%, #fff 0 50%) 0 0 / 24px 24px; }
      .design-only__missing { padding: 12px; border: 1px dashed #c8641e; border-radius: 8px; color: #c8641e; font-family: ui-monospace, monospace; font-size: 12px; }
      .design-only figcaption { color: #444; }
      .design-only code { font-size: 12px; }
    </style>\`;
}

export default {
  title: ${q(`${system.storybook.title}/${name} (design only)`)},
  parameters: { figma: { fileKey: ${q(fileKey)}, slug: ${q(key)}, selector: '.design-only__shot' }, controls: { disable: true } },
};

${stories.join("\n")}
`;
}

function relativeImport(fromDir, file) {
  // Story files live under apps/storybook/stories/<system>/; the manifest is in
  // the system's package. A relative path keeps Vite's resolver out of it.
  const up = fromDir.split("/").filter(Boolean).length;
  return "../".repeat(up) + file.replace(/.*?\/packages\//, "packages/");
}

export const upstream = {
  id: "upstream",
  description: "Storybook stories that mount the library's own element; no component is generated",
  // With an IR the design-only file is listed only when there is something to
  // put in it; without one (a clear) every possible output is named.
  paths(slug, { system, ir = null }) {
    const name = pascal(slug);
    const out = [`${system.storybook.dir}/${name}.stories.js`, `${system.storybook.dir}/${system.id}.css`];
    if (!ir || designOnlyVariants(ir).length) out.push(`${system.storybook.dir}/${name}.design.stories.js`);
    return out;
  },
  files(ir, slug, { manifest, system } = {}) {
    if (!system) throw new Error("upstream target needs a system");
    const [stories, css, design] = upstream.paths(slug, { system, ir });
    const tokens = typeof system.tokens === "function" ? system.tokens() : null;
    return {
      [stories]: upstreamStories(ir, slug, manifest, { system, storyDir: system.storybook.dir, tokens }),
      [css]: scopedTokens(system),
      ...(design ? { [design]: designOnlyStories(ir, slug, { system }) } : {}),
    };
  },
};
