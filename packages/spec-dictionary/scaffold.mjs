#!/usr/bin/env node
// scaffold.mjs — extracted Figma evidence → <slug>.defs.json draft, through the
// spec dictionary. This is the repeatable step between "the plugin published
// evidence for a set we have no contract for" and "npm run specs:build turns
// the contract into spec.json, figma.plan.json (Build set) and the docs".
//
//   npm run specs:scaffold -- --slug=action-card [--archetype=link-card] [--name=ActionCard] [--force]
//
// The draft is honest about what it does not know: every derived choice is an
// open decision for the reviewer, code anchors are marked pending until the
// component exists, and nothing here is invented beyond the dictionary.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, unlinkSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, "..", "..");
const SRC = join(ROOT, "packages", "components", "src");
const EVIDENCE_DIR = join(ROOT, "packages", "components", "evidence");
export const DICTIONARY = JSON.parse(readFileSync(join(__dirname, "dictionary.json"), "utf8"));
const { rolesFromNames, matchCandidate, loadContracts } = require(join(ROOT, "apps", "s2a-toolkit", "server", "contract-match.cjs"));
import { deriveArchetype } from "./lib/archetype.mjs";

const kebab = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
const pascal = (s) => kebab(s).split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
const abbr = (slug) => slug.split("-").map((w) => w[0]).join("");

// --- anatomy tokens, read from the component instead of an archetype --------
//
// This used to be `tokens: { ...arch.root.tokens }` — the archetype's defaults,
// copied in and never reconciled with the component. Button was scaffolded as a
// "card" and inherited a card's padding (spacing/xl), a card's radius
// (border-radius/md) and a card's gap, while its evidence said, correctly and
// all along, border/radius/999, spacing/lg and spacing/xs. The evidence was
// extracted, hashed, published and gated — and then ignored at the one step
// that decided the tokens.
//
// So: read the bindings. The archetype is the fallback for properties the
// component says nothing about, not the default that overrides it.

const CSS_OF = {
  fills: "background-color", strokes: "border-color", opacity: "opacity",
  itemSpacing: "gap", counterAxisSpacing: "row-gap",
  paddingLeft: "padding-left", paddingRight: "padding-right", paddingTop: "padding-top", paddingBottom: "padding-bottom",
  cornerRadius: "border-radius", topLeftRadius: "border-radius", topRightRadius: "border-radius",
  bottomLeftRadius: "border-radius", bottomRightRadius: "border-radius",
  strokeWeight: "border-width", strokeTopWeight: "border-width", strokeBottomWeight: "border-width",
  strokeLeftWeight: "border-width", strokeRightWeight: "border-width",
  fontSize: "font-size", lineHeight: "line-height", letterSpacing: "letter-spacing",
  fontFamily: "font-family", fontStyle: "font-weight",
};
const STATE_VALUES = new Set(["default", "hover", "active", "pressed", "focus", "focused", "focus-visible", "disabled"]);
const refOf = (variableName) => `{${String(variableName).replace(/\//g, ".")}}`;

// --- literals -----------------------------------------------------------------
//
// A property the file sets with no variable behind it is still a property the
// stylesheet needs. Divider's height is 1px in Figma and bound to nothing, and
// reading only the bindings produced a contract whose render was invisible. So
// the literals come through as `raw:` values — the same syntax a curator uses
// for a deliberate exception — and every one is flagged as a token gap in a
// decision, so it gets bound in Figma or argued for, not quietly shipped.
const CSS_OF_LITERAL = { ...CSS_OF, width: "width", height: "height" };
const hex = (c) => Math.round(c * 255).toString(16).padStart(2, "0");
function rawRef(u) {
  const v = u.value;
  if (typeof v === "number") return `raw:${Number.isInteger(v) ? v : +v.toFixed(2)}px`;
  if (v && typeof v === "object") {
    return v.a !== undefined && v.a < 1
      ? `raw:rgba(${Math.round(v.r * 255)}, ${Math.round(v.g * 255)}, ${Math.round(v.b * 255)}, ${+v.a.toFixed(3)})`
      : `raw:#${hex(v.r)}${hex(v.g)}${hex(v.b)}`;
  }
  return null;
}

// --- the component's own words ----------------------------------------------
//
// This used to be `description: arch.description` — the archetype's sentence.
// Button was scaffolded as a "card" and its contract therefore announced "A
// non-interactive content card; actions live in a slot", about the most
// interactive component in the system. Meanwhile its Figma description already
// read: "The primary action trigger — a text button with optional leading and
// trailing icons, in six styles."
//
// The description is written once, in Figma, next to the component. Everything
// downstream should quote it rather than describe the template it was matched
// against.

/** The prose under an `— s2a:meta —` fence: everything after it, first paragraph. */
export function proseFrom(description) {
  if (!description) return null;
  const lines = String(description).split("\n");
  let idx = 0;
  if (/s2a:meta/i.test(lines[0] ?? "")) {
    let end = 1;
    while (end < lines.length && lines[end].trim() !== "") end++;
    idx = end + 1;
  }
  const rest = lines.slice(idx).join("\n").trim();
  const first = rest.split(/\n##\s/)[0].split(/\n\s*\n/)[0].trim();
  return first || null;
}

/** A named `## Section` out of the same description. */
export function sectionFrom(description, heading) {
  if (!description) return null;
  const m = String(description).match(new RegExp(`##\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, "i"));
  const body = m?.[1]?.trim();
  return body || null;
}

/** "- a\n- b" -> ["a", "b"], so prose bullets land as real notes. */
const bullets = (text) => String(text ?? "").split("\n").map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);

/** "Style=outlined, Size=md, State=hover" -> { Style: "outlined", Size: "md", State: "hover" } */
function axesOf(variantName) {
  const out = {};
  for (const pair of String(variantName).split(",")) {
    const [k, v] = pair.split("=");
    if (k && v) out[k.trim()] = v.trim();
  }
  return out;
}

/**
 * Every token this node binds, split into the resting case and whatever varies.
 *
 * A property bound to one variable across every variant is a base token. One
 * that changes is not noise to be averaged away — it is the component telling
 * us which axis it depends on, which is exactly what tokensByProp and
 * statesByProp exist to carry.
 */
export function tokensFromEvidence(evidence, nodePath, { isText = false, isIcon = false } = {}) {
  // Text paints with `color`, and so does an icon: the glyph takes currentColor,
  // and the "Icon color" rectangle S2A puts over an icon is that colour, not a
  // box behind it. Read as background-color it rendered a solid square.
  const paintsAs = isText || isIcon ? "color" : "background-color";
  // css property -> variant name -> token ref (or raw: literal)
  const byCss = new Map();
  const put = (css, variant, ref) => { if (!byCss.has(css)) byCss.set(css, new Map()); byCss.get(css).set(variant, ref); };
  for (const b of (evidence.bindings ?? []).filter((x) => x.node === nodePath && x.variable && CSS_OF[x.property])) {
    const v = evidence.variables?.[b.variable];
    if (!v?.name) continue;
    put(b.property === "fills" ? paintsAs : CSS_OF[b.property], b.variant, refOf(v.name));
  }
  // The literals, where nothing is bound for that property on that variant.
  for (const u of (evidence.unboundValues ?? []).filter((x) => x.node === nodePath && CSS_OF_LITERAL[x.property])) {
    const css = u.property === "fills" ? paintsAs : CSS_OF_LITERAL[u.property];
    if (byCss.get(css)?.has(u.variant)) continue;
    const ref = rawRef(u);
    if (ref) put(css, u.variant, ref);
  }
  if (!byCss.size) return null;

  // The State axis, by name — or by content, when an axis carries a real
  // interaction state. "default" alone is not one: MerchCard's Features List
  // axis is default|closed, and reading it as State filed "closed" as a state.
  const stateAxis = (evidence.axes ?? []).map((a) => a.name).find((n) => /^state$/i.test(n) && (evidence.axes.find((a) => a.name === n)?.options ?? []).some((o) => STATE_VALUES.has(String(o).toLowerCase()) && String(o).toLowerCase() !== "default"))
    ?? ((evidence.variants ?? []).length && Object.entries(axesOf(evidence.variants[0].name)).find(([, v]) => STATE_VALUES.has(v.toLowerCase()) && v.toLowerCase() !== "default")?.[0]);
  // A boolean prop stands in for a two-value axis (open|closed → open). Its
  // maps are keyed by the prop's value, which is what the attribute carries.
  const valueMaps = new Map();
  for (const a of evidence.axes ?? []) {
    if (a.type !== "VARIANT" || !/^(state|interaction|pseudo)s?$/i.test(String(a.name).split("#")[0].trim())) continue;
    const opts = (a.options ?? []).map(String);
    if (!opts.length || opts.some((o) => STATE_VALUES.has(o.toLowerCase()) && o.toLowerCase() !== "default")) continue;
    const on = opts.find((o) => /^(open|expanded|on|selected|checked|active|visible|shown|true|yes)$/i.test(o));
    if (opts.length === 2 && on) valueMaps.set(a.name, { prop: kebab(on.toLowerCase()).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()), map: Object.fromEntries(opts.map((o) => [o, o === on ? "true" : "false"])) });
  }
  const propKey = (axis, value) => valueMaps.get(axis)?.map?.[value] ?? value;

  const total = (evidence.variants ?? []).length || 0;
  // The variants this layer exists in at all. ChevronDown lives only in the
  // closed variants; its 20px box bound in all of them is its size, not a
  // size "when closed". Presence is read from the variant trees when the
  // evidence carries them, else from any record that names the node.
  const presentIn = (() => {
    const trees = evidence.anatomy?.variants;
    if (trees && nodePath) {
      const has = (node, segs) => !segs.length || (node.children ?? []).some((c) => c.name === segs[0] && has(c, segs.slice(1)));
      const segs = nodePath.split("/").filter(Boolean);
      return new Set(Object.entries(trees).filter(([, t]) => has(t, segs)).map(([n]) => n));
    }
    const out = new Set();
    for (const r of [...(evidence.bindings ?? []), ...(evidence.unboundValues ?? []), ...(evidence.instances ?? [])]) if (r.node === nodePath) out.add(r.variant);
    return out.size ? out : null;
  })();
  const tokens = {}, byProp = new Map(), byState = new Map(), plainStates = {};
  for (const [css, perVariant] of byCss) {
    const distinct = new Set(perVariant.values());

    // One value everywhere is only a base token if it is bound EVERYWHERE.
    // Button binds opacity on 6 of its 30 variants — all of them State=disabled
    // — and reading that as the resting case would have faded every button on
    // the page. A property bound on a subset is conditional by definition; the
    // subset says which condition.
    if (distinct.size === 1) {
      const covered = [...perVariant.keys()];
      if (!total || covered.length >= total) { tokens[css] = [...distinct][0]; continue; }
      if (presentIn && [...presentIn].every((n) => perVariant.has(n))) { tokens[css] = [...distinct][0]; continue; }
      const shared = (axis) => {
        const vals = new Set(covered.map((n) => axesOf(n)[axis]));
        return vals.size === 1 ? [...vals][0] : null;
      };
      const st = stateAxis && shared(stateAxis);
      if (st) { (plainStates[st.toLowerCase()] ??= {})[css] = [...distinct][0]; continue; }
      const axisNames = [...new Set(covered.flatMap((n) => Object.keys(axesOf(n))))];
      const only = axisNames.map((a) => [a, shared(a)]).find(([, v]) => v);
      if (only) {
        const key = only[0];
        if (!byProp.has(key)) byProp.set(key, {});
        (byProp.get(key)[propKey(key, only[1])] ??= {})[css] = [...distinct][0];
        continue;
      }
      // Bound on a subset no single axis explains — record it and let curation
      // decide rather than asserting it is the resting case.
      tokens[css] = [...distinct][0];
      continue;
    }

    // Which axis explains the variation? The one whose value predicts the token.
    const names = [...perVariant.keys()];
    const axisNames = [...new Set(names.flatMap((n) => Object.keys(axesOf(n))))];
    const explains = (axis) => {
      const seen = new Map();
      for (const n of names) {
        const key = `${axesOf(n)[axis]}|${axis === stateAxis ? "" : axesOf(n)[stateAxis] ?? ""}`;
        const tok = perVariant.get(n);
        if (seen.has(key) && seen.get(key) !== tok) return false;
        seen.set(key, tok);
      }
      return true;
    };
    // An axis with one value explains everything and decides nothing — a set
    // whose Style is only ever "media" would otherwise file every state token
    // under style=media and make a prop of an axis the code does not have.
    const varies = (axis) => new Set(names.map((n) => axesOf(n)[axis])).size > 1;
    // ...and an axis only OWNS a property if changing the axis changes the
    // token, state held constant. Size "explains" a background that is the same
    // at md and xl only in the trivial sense; the state is what moves it.
    const discriminates = (axis) => {
      const byState = new Map();
      for (const n of names) {
        const st = axesOf(n)[stateAxis] ?? "";
        const group = byState.get(st) ?? new Map();
        group.set(axesOf(n)[axis], perVariant.get(n));
        byState.set(st, group);
      }
      return [...byState.values()].some((group) => new Set(group.values()).size > 1);
    };
    const design = axisNames.filter((a) => a !== stateAxis && varies(a) && explains(a) && discriminates(a));
    const axis = design[0];
    if (!axis && stateAxis && explains(stateAxis)) {
      // Only the state moves it: the resting value is the base, the rest are states.
      const base = names.map((n) => [(axesOf(n)[stateAxis] ?? "default").toLowerCase(), perVariant.get(n)]).find(([st]) => st === "default")?.[1];
      for (const n of names) {
        const state = (axesOf(n)[stateAxis] ?? "default").toLowerCase();
        if (state === "default") tokens[css] = perVariant.get(n);
        else if (perVariant.get(n) !== base) (plainStates[state] ??= {})[css] = perVariant.get(n);
      }
      continue;
    }
    if (!axis) {
      // Nothing single-axis accounts for it: Collapsible's label is `label` at
      // Size=default, `heading-6` at Size=lg and `heading-5` at Size=lg,
      // Style=control. Read the way a stylesheet is written: the resting value
      // is the base; the axis whose values predict the most variants files its
      // entries; the variants it got wrong fall to the next axis, whose entry
      // is emitted after it and so wins the cascade. Every entry is traceable
      // to the variants it came from, and nothing is averaged.
      const restingName = names.find((n) => (axesOf(n)[stateAxis] ?? "default").toLowerCase() === "default" && Object.entries(axesOf(n)).every(([a, v]) => a === stateAxis || v === (evidence.axes?.find((x) => x.name === a)?.options?.[0] ?? v)))
        ?? names.find((n) => (axesOf(n)[stateAxis] ?? "default").toLowerCase() === "default");
      const base = restingName ? perVariant.get(restingName) : [...distinct][0];
      tokens[css] = base;
      // What the cascade currently gives each variant; an entry for axis=value
      // rewrites every variant with that value, so it may only carry a token
      // that every already-correct variant in the group has too.
      const current = new Map(names.map((n) => [n, base]));
      const wrong = () => names.filter((n) => current.get(n) !== perVariant.get(n));
      const candidates = axisNames.filter((a) => a !== stateAxis && varies(a));
      for (let guard = 0; wrong().length && guard < candidates.length; guard++) {
        let best = null;
        for (const a of candidates) {
          const values = [...new Set(names.map((n) => axesOf(n)[a]))];
          let score = 0; const picks = new Map();
          for (const v of values) {
            const group = names.filter((n) => axesOf(n)[a] === v);
            const fixed = group.filter((n) => current.get(n) === perVariant.get(n));
            const allowed = new Set(fixed.length ? [perVariant.get(fixed[0])] : group.map((n) => perVariant.get(n)));
            if (fixed.some((n) => !allowed.has(perVariant.get(n)))) continue; // the correct ones disagree: no single entry fits
            let pick = null, gain = 0;
            for (const tok of allowed) { const g = group.filter((n) => current.get(n) !== perVariant.get(n) && perVariant.get(n) === tok).length; if (g > gain) { gain = g; pick = tok; } }
            if (pick !== null) { picks.set(v, pick); score += gain; }
          }
          if (score && (!best || score > best.score)) best = { a, score, picks };
        }
        if (!best) break;
        for (const [v, tok] of best.picks) {
          if (!byProp.has(best.a)) byProp.set(best.a, {});
          (byProp.get(best.a)[propKey(best.a, v)] ??= {})[css] = tok;
          for (const n of names) if (axesOf(n)[best.a] === v) current.set(n, tok);
        }
      }
      continue;
    }
    // The resting token per axis value, so a state entry is only written when
    // the state actually changes it — not a copy of the resting value under
    // every state, which says nothing and buries the entries that do.
    const resting = new Map();
    for (const n of names) if ((axesOf(n)[stateAxis] ?? "default").toLowerCase() === "default") resting.set(axesOf(n)[axis], perVariant.get(n));
    for (const n of names) {
      const a = axesOf(n);
      const value = a[axis];
      const state = (a[stateAxis] ?? "default").toLowerCase();
      if (state !== "default" && resting.has(value) && resting.get(value) === perVariant.get(n)) continue;
      const target = state === "default" ? byProp : byState;
      const key = state === "default" ? axis : `${axis}|${state}`;
      if (!target.has(key)) target.set(key, {});
      (target.get(key)[propKey(axis, value)] ??= {})[css] = perVariant.get(n);
    }
  }

  const out = {};
  if (Object.keys(tokens).length) out.tokens = tokens;
  if (Object.keys(plainStates).length) out.states = plainStates;
  // Keyed by the prop as props[] names it (camelCase of the axis), not the
  // kebab of the axis: "Features List" is the prop featuresList, and a map
  // filed under features-list points at a prop that does not exist.
  const propName = (axis) => valueMaps.get(axis)?.prop ?? kebab(axis).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  if (byProp.size) out.tokensByProp = [...byProp].map(([prop, map]) => ({ prop: propName(prop), map }));
  if (byState.size) out.statesByProp = [...byState].map(([key, map]) => {
    const [prop, state] = key.split("|");
    return { prop: propName(prop), state, map };
  });
  return out;
}

// A shorthand the component expresses in longhands has to go, or the two fight:
// the archetype's `padding: xl` next to the component's `padding-left: lg`
// silently keeps 32px on top and bottom.
const LONGHANDS = { padding: "padding-", margin: "margin-", gap: "row-gap", "border-width": "border-", "border-radius": "border-top-" };

/**
 * Figma auto-layout, read as CSS layout.
 *
 * The evidence has carried layoutMode and sizing all along and nothing read
 * them, so the generated stylesheet had every colour and no `display`. An
 * auto-layout frame IS a flex container; HUG is content-sized and FILL grows.
 * Nothing here is inferred — it is a direct translation of what the file says.
 */
function layoutFromEvidence(node, parentMode = null) {
  if (!node) return null;
  const out = {};
  if (node.layoutMode === "HORIZONTAL" || node.layoutMode === "VERTICAL") {
    // A component that hugs its content is inline-flex; one that fills is flex.
    out.display = node.sizing?.horizontal === "HUG" ? "inline-flex" : "flex";
    out.direction = node.layoutMode === "HORIZONTAL" ? "row" : "column";
  }
  // Figma names the axes primary/counter; CSS names them justify/align, and
  // which is which flips with the direction. MIN/MAX are start/end.
  const AXIS = { MIN: "start", CENTER: "center", MAX: "end", SPACE_BETWEEN: "space-between", BASELINE: "baseline" };
  if (node.align) {
    const justify = AXIS[node.align.primary];
    let align = AXIS[node.align.counter];
    // Figma centres a child on the counter axis only if the child does not
    // FILL it; a FILL child spans regardless. In CSS that is align-items:
    // stretch — a centred frame whose children all fill is a stretching one.
    const counter = node.layoutMode === "HORIZONTAL" ? "vertical" : "horizontal";
    const sized = (node.children ?? []).filter((c) => c.sizing && c.visible !== false);
    if (sized.length && sized.every((c) => c.sizing[counter] === "FILL")) align = "stretch";
    if (justify && justify !== "start") out.justify = justify;
    if (align && align !== "start") out.align = align;
  }
  if (node.wrap) out.wrap = true;
  // FILL along the parent's main axis is flex-grow; FILL across it is
  // align-self: stretch. A Collapsible filling the width of a column parent
  // was growing (a no-op in a column) and hugging its label instead.
  const h = node.sizing?.horizontal === "FILL", v = node.sizing?.vertical === "FILL";
  if (parentMode === "VERTICAL") { if (h) out.stretch = true; if (v) out.grow = true; }
  else if (parentMode === "HORIZONTAL") { if (h) out.grow = true; if (v) out.stretch = true; }
  else if (h) out.grow = true;
  return Object.keys(out).length ? out : null;
}

/** Merge what the component says over what the archetype guessed. */
function anatomyTokens(evidence, nodePath, archTokens, opts) {
  const read = tokensFromEvidence(evidence, nodePath, opts);
  if (!read) return { tokens: { ...(archTokens ?? {}) } };

  // Every CSS property the component speaks to, conditionally or not. A
  // property the component sets only per style is still the component's answer
  // — leaving the archetype's value in the base rule means a button with no
  // matching style falls back to a card's grey.
  const spoken = new Set(Object.keys(read.tokens ?? {}));
  for (const m of Object.values(read.states ?? {})) for (const k of Object.keys(m)) spoken.add(k);
  for (const e of read.tokensByProp ?? []) for (const m of Object.values(e.map)) for (const k of Object.keys(m)) spoken.add(k);
  for (const e of read.statesByProp ?? []) for (const m of Object.values(e.map)) for (const k of Object.keys(m)) spoken.add(k);

  const kept = {};
  for (const [k, v] of Object.entries(archTokens ?? {})) {
    if (spoken.has(k)) continue;                                     // the component answered this
    const prefix = LONGHANDS[k];
    if (prefix && [...spoken].some((s) => s.startsWith(prefix))) continue;  // ...in longhand
    kept[k] = v;
  }
  const tokens = { ...kept, ...(read.tokens ?? {}) };
  const out = { tokens };
  if (read.states) out.states = read.states;
  if (read.tokensByProp) out.tokensByProp = read.tokensByProp;
  if (read.statesByProp) out.statesByProp = read.statesByProp;
  return out;
}
const GENERIC = /^(Frame|Group|Rectangle|Ellipse|Line|Vector|Polygon|Star|Text|Slice|Image|Boolean|Union|Subtract|Intersect|Exclude) ?\d*$|^(Frame|Group|Rectangle|Ellipse|Line|Vector) \d+$/;
const alnumName = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const fill = (t, vars) => t.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

// Walk the evidence anatomy and claim one layer per role. Names decide first
// (the same patterns the matcher uses); layer type decides for the unnamed:
// a group of shapes is art, a stray text layer is a question, a line is a rule.
export function assignRoles(tree) {
  const claimed = new Map(); // role → { path, node }
  const extra = { text: [], art: [] };
  const visit = (node, path, insideMedia) => {
    const p = `${path}/${node.name}`;
    const named = [...rolesFromNames([node.name])];
    // Nothing inside art or a claimed layer is claimable, by name or by type.
    let role = insideMedia ? null : named.find((r) => !claimed.has(r) && r !== "text");
    if (!role && !insideMedia) {
      const shapes = ["RECTANGLE", "ELLIPSE", "VECTOR", "BOOLEAN_OPERATION"];
      const kids = node.children ?? [];
      // A Figma-generated GROUP is art in practice (designers group illustration
      // pieces; they name frames). A FRAME counts as art only when it holds shapes.
      const artGroup = node.type === "GROUP" && GENERIC.test(node.name);
      const artFrame = node.type === "FRAME" && kids.length > 0 && kids.some((c) => shapes.includes(c.type)) && !kids.some((c) => c.type === "TEXT" && !GENERIC.test(c.name));
      if (node.type === "LINE") role = claimed.has("divider") ? null : "divider";
      else if (node.type === "TEXT") role = null;
      else if (artGroup || artFrame || shapes.includes(node.type)) role = claimed.has("media") ? null : "media";
    }
    let art = false;
    if (role) claimed.set(role, { path: p, node });
    else if (node.type === "TEXT" && !insideMedia && !named.length) extra.text.push(p);
    else if (!insideMedia && ["GROUP", "RECTANGLE", "ELLIPSE", "VECTOR"].includes(node.type) && claimed.has("media") && claimed.get("media").path !== p) { extra.art.push(p); art = true; }
    // A claimed layer owns its subtree (a chevron's vector is not media; an
    // icon inside the illustration is art), and so does extra art.
    const stop = insideMedia || Boolean(role) || art;
    for (const c of node.children ?? []) visit(c, p, stop);
  };
  for (const c of tree.children ?? []) visit(c, "", false);
  return { claimed, extra };
}



// When the component already has code, its stylesheet is the authority on what
// the parts are called. Guessing a convention there produces selectors that
// match nothing — and the draft looks wrong for a reason that is purely
// cosmetic, which buries the disagreements that actually matter.
function classesFromCss(slug) {
  const file = join(SRC, slug, `${slug}.css`);
  if (!existsSync(file)) return null;
  // Comments are not selectors: "/* .ring — 18×18 */" described a layer, and
  // the scanner handed the part a bare .ring that would style every ring.
  const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  return [...new Set((css.match(/\.[a-z][a-z0-9_-]*/gi) ?? []).map((c) => c.slice(1)))];
}

// A part matches a class when the class's trailing segment IS the part name.
// Failing that, the nearest prefix wins: the design's "icon-start" and
// "icon-end" both land on ".c-button__icon", because the code models one icon
// where the design models two. That is a real disagreement, so the selector
// resolves AND the draft raises it — emitting ".b-icon-start", which matches
// nothing anywhere, would only have added a second, fake problem on top.
function selectorForPart(classes, part) {
  if (!classes) return { selector: null, exact: false };
  const tail = (c) => (c.includes("__") ? c.split("__").pop() : c.replace(/^c-/, ""));
  // A block class (c-radio) is the root's; a part named like the component
  // must not inherit it, or the part and the root share every rule.
  const partish = (c) => c.includes("__") || !/^c-/.test(c);
  const exact = classes.find((c) => partish(c) && tail(c) === part);
  if (exact) return { selector: `.${exact}`, exact: true };
  const prefixed = classes
    .filter((c) => partish(c) && tail(c) && part.startsWith(tail(c)))
    .sort((a, b) => tail(b).length - tail(a).length)[0];
  return prefixed ? { selector: `.${prefixed}`, exact: false } : { selector: null, exact: false };
}

// ── Component-set properties → contract ──────────────────────────────────────
// A COMPONENT_SET already declares its own API. Deriving levers from layer roles
// there is how a Button ends up with an "eyebrow" and a "mediaSrc": the role
// walker is for FRAME candidates, which have no declared properties at all.
//
// So when the evidence is a set, the properties ARE the contract, and the work
// is classification. Four rules, each of which a human can disagree with — they
// are recorded as decisions rather than applied silently.

const STATE_AXIS = /^(state|interaction|pseudo)s?$/i;
// Figma's vocabulary for the four runtime states the contract schema admits.
const STATE_VALUE = {
  hover: "hover", hovered: "hover",
  active: "active", pressed: "active",
  focus: "focus-visible", focused: "focus-visible", "focus-visible": "focus-visible",
  disabled: "disabled",
};
// "Show Icon Start" is a Figma authoring affordance, not an API. In code the
// slot either has content or it does not; nobody passes showIconStart.
const HELPER_BOOLEAN = /^(show|hide|has|with|include|enable)\s+/i;

const stripId = (name) => String(name).split("#")[0].trim();
const camel = (name) => kebab(stripId(name)).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

export function fromComponentSet(evidence) {
  const axes = evidence.axes ?? [];
  const props = [];
  const states = [];
  const notes = [];
  const slots = [];
  // Which axes became states — a code prop of the same name is a real conflict.
  const stateAxes = [];

  const swapTargets = new Map();
  for (const a of axes) if (a.type === "INSTANCE_SWAP") swapTargets.set(alnumName(stripId(a.name)), stripId(a.name));

  for (const a of axes) {
    const label = stripId(a.name);
    const name = camel(a.name);

    if (a.type === "VARIANT" && STATE_AXIS.test(label) && (a.options ?? []).length && !(a.options ?? []).some((o) => STATE_VALUE[String(o).toLowerCase()])) {
      // "State" with no interaction state in it — open|closed, expanded|
      // collapsed, on|off — is a prop the consumer sets, not runtime behaviour.
      // Two values become a boolean named after the "on" value, with the map
      // back to the axis so the matrix and the stylesheet can still find the
      // variant; more than two stay a string enum.
      const opts = (a.options ?? []).map(String);
      const ON = /^(open|expanded|on|selected|checked|active|visible|shown|true|yes)$/i;
      const on = opts.find((o) => ON.test(o));
      if (opts.length === 2 && on) {
        const off = opts.find((o) => o !== on);
        const propName = camel(on.toLowerCase());
        props.push({ name: propName, lever: true, type: "boolean", default: String(a.defaultValue ?? off).toLowerCase() === on.toLowerCase(),
          figma: { kind: "VARIANT", property: a.name, valueMap: { true: on, false: off } },
          code: { prop: propName, attr: `data-${kebab(propName)}` } });
        notes.push(`"${label}" (${opts.join("|")}) read as the boolean prop "${propName}", not as runtime states — a consumer sets it; the design's ${on} is true`);
      } else {
        props.push({ name, lever: true, type: "string", enum: opts, ...(a.defaultValue !== undefined ? { default: a.defaultValue } : {}),
          figma: { kind: "VARIANT", property: a.name }, code: { prop: name, attr: `data-${kebab(label)}` } });
        notes.push(`"${label}" (${opts.join("|")}) read as a prop, not as runtime states — none of its values is an interaction state`);
      }
      continue;
    }
    if (a.type === "VARIANT" && (a.options ?? []).length === 2) {
      // A two-value axis whose values are a yes and a no — Selected=true|false,
      // Checked=on|off — is a boolean named after the AXIS; the map back to the
      // axis keeps the matrix and the stylesheet on the variant.
      const opts = (a.options ?? []).map(String);
      const YES = /^(true|yes|on|checked|selected)$/i, NO = /^(false|no|off|unchecked|unselected)$/i;
      const on = opts.find((o) => YES.test(o)), off = opts.find((o) => NO.test(o));
      if (on && off) {
        props.push({ name, lever: true, type: "boolean", default: String(a.defaultValue ?? off).toLowerCase() === on.toLowerCase(),
          figma: { kind: "VARIANT", property: a.name, valueMap: { true: on, false: off } },
          code: { prop: name, attr: `data-${kebab(label)}` } });
        notes.push(`"${label}" (${opts.join("|")}) read as the boolean prop "${name}"; the design's ${on} is true`);
        continue;
      }
    }

    if (a.type === "VARIANT" && STATE_AXIS.test(label)) {
      // A State axis is runtime behaviour, never an authored prop.
      const mapped = [], unmapped = [];
      for (const opt of a.options ?? []) {
        const key = String(opt).toLowerCase();
        if (key === "default" || key === "rest" || key === "none") continue; // the absence of a state
        (STATE_VALUE[key] ? mapped : unmapped).push(STATE_VALUE[key] ?? opt);
      }
      const MECHANISM = { hover: ":hover", active: ":active", "focus-visible": ":focus-visible", disabled: "[disabled] / :disabled" };
      for (const m of [...new Set(mapped)]) {
        states.push({ name: m, figma: { kind: "VARIANT", property: a.name, notes: `${label}=${m}` },
          code: { mechanism: MECHANISM[m] ?? "tbd" }, notes: "Runtime state, never an authored prop." });
      }
      stateAxes.push(label);
      notes.push(`"${label}" read as runtime states (${mapped.join(", ") || "none"}${unmapped.length ? `; unmapped: ${unmapped.join(", ")}` : ""}), not as a prop`);
      if (unmapped.length) notes.push(`${unmapped.join(", ")} has no counterpart in the schema's four states — confirm it is not really a style`);
      continue;
    }

    if (a.type === "VARIANT" && (a.options ?? []).length < 2) {
      // One value is not a choice. The tokens it carries are the component's
      // base tokens; a prop for it would claim a lever the code does not have.
      notes.push(`"${label}" has a single value (${(a.options ?? []).join("") || "none"}) — read as fixed, not as a prop; add the prop when a second value exists`);
      continue;
    }

    if (a.type === "VARIANT") {
      props.push({ name, lever: true, type: "string", enum: a.options ?? [], ...(a.defaultValue !== undefined ? { default: a.defaultValue } : {}),
        figma: { kind: "VARIANT", property: a.name }, code: { prop: name, attr: `data-${kebab(label)}` } });
      continue;
    }

    if (a.type === "TEXT") {
      props.push({ name, lever: true, type: "string", ...(a.defaultValue !== undefined ? { default: a.defaultValue } : {}),
        figma: { kind: "TEXT", property: a.name }, code: { prop: name } });
      continue;
    }

    if (a.type === "SLOT") {
      // A Figma Slot: children go here. The prop is the content a consumer
      // passes (an expression, not a string); the part named like the slot
      // accepts anything, because that is what a slot is for.
      props.push({ name, lever: true, type: "expression", figma: { kind: "SLOT", property: a.name }, code: { prop: name },
        notes: "Children. A Figma Slot; anything may be placed here." });
      slots.push({ part: kebab(label), name: label, open: true });
      continue;
    }

    if (a.type === "INSTANCE_SWAP") {
      // A swap is a slot with a default. Both facts matter: the slot is what a
      // consumer fills, the prop is how they name what goes in it.
      props.push({ name, lever: true, type: "string", figma: { kind: "INSTANCE_SWAP", property: a.name }, code: { prop: name } });
      slots.push({ part: kebab(label), name: label });
      continue;
    }

    if (a.type === "BOOLEAN") {
      const helperOf = HELPER_BOOLEAN.test(label) ? label.replace(HELPER_BOOLEAN, "").trim() : null;
      const pairedSwap = helperOf ? swapTargets.get(alnumName(helperOf)) : null;
      if (pairedSwap) {
        // Paired with a real swap: a visibility toggle for it. Keep it on the
        // contract so Build set can drive it, but it is not a code lever.
        props.push({ name, lever: false, type: "boolean", ...(a.defaultValue !== undefined ? { default: a.defaultValue } : {}),
          figma: { kind: "BOOLEAN", property: a.name },
          code: { prop: name },
          notes: `Figma authoring toggle for the "${pairedSwap}" swap. In code the slot either has content or it does not — this is not a prop a consumer passes.` });
        notes.push(`"${label}" treated as a Figma visibility helper for "${pairedSwap}", not a code lever`);
        continue;
      }
      const asState = STATE_VALUE[String(name).toLowerCase()];
      if (asState) {
        // disabled is both: a prop a consumer sets and a state CSS reacts to.
        props.push({ name, lever: true, type: "boolean", ...(a.defaultValue !== undefined ? { default: a.defaultValue } : {}),
          figma: { kind: "BOOLEAN", property: a.name }, code: { prop: name } });
        if (!states.some((st) => st.name === asState)) {
          states.push({ name: asState, figma: { kind: "BOOLEAN", property: a.name, notes: `${label} toggles it` },
            code: { mechanism: asState === "disabled" ? "[disabled] / :disabled" : `:${asState}` },
            notes: "Declared as a prop and reacted to as a state." });
        }
        notes.push(`"${label}" is both a prop and the "${asState}" state — confirm the code sets an attribute CSS can select`);
        continue;
      }
      props.push({ name, lever: true, type: "boolean", ...(a.defaultValue !== undefined ? { default: a.defaultValue } : {}),
        figma: { kind: "BOOLEAN", property: a.name }, code: { prop: name } });
      continue;
    }
  }
  return { props, states, slots, notes, stateAxes };
}

export function pickArchetype(evidence, roles, forced) {
  if (forced) return { archetype: forced, why: "chosen with --archetype" };
  if (evidence.pattern?.repeats?.length) return { archetype: "collection", why: "the frame repeats one unit" };
  if (roles.has("heading") && roles.has("cta")) return { archetype: "link-card", why: "roles include heading and cta with no repeated unit" };
  if (roles.has("heading")) return { archetype: "card", why: "roles include heading; no cta role" };
  return { archetype: "card", why: "default when no stronger signal is present" };
}

export function scaffoldDefs(evidence, { slug, name, archetype: forced, dictionary = DICTIONARY, contracts = null, code = null, today = new Date().toISOString().slice(0, 10) } = {}) {
  // A set's layer name carries decoration the contract must not inherit: a
  // version suffix, a status emoji, a parenthetical. "Button — v2" is the
  // Button contract — keeping the suffix renames the component to ButtonV2 and
  // silently breaks every slot that accepts "Button".
  const undecorate = (n) => String(n || "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s*[—–-]\s*v\d+(\.\d+)*\s*$/i, "")
    .replace(/\(.*?\)/g, "")
    .trim();
  // undecorate() has always stripped the "— v2" suffix, but only off the
  // evidence's own set name — a name passed in (which is what the plugin does,
  // handing over the Figma set name verbatim) skipped it. So the plugin path
  // produced "ButtonV2" while the CLI produced "Button", and QuoteCard's slot
  // was left accepting a name nothing answered to. "Button — v2" is one
  // component at version 2; the version has its own field.
  const setName = undecorate(name ?? evidence.set?.name) ?? pascal(slug);
  slug = slug ?? kebab(setName);
  const component = pascal(setName);
  const ab = abbr(slug);
  const { claimed, extra } = assignRoles(evidence.anatomy?.tree ?? { children: [] });
  const roles = new Set(claimed.keys());
  // `forced` is either --archetype (a person read the frame) or the output of
  // deriveArchetype (signals that agreed). Both are readings, not guesses, so
  // both keep their reasoning — which is the thing that was missing when Button
  // silently became a card.
  const derived = forced && typeof forced === "object" ? forced : null;
  const { archetype, why } = derived
    ? { archetype: derived.archetype, why: derived.why.join("; ") }
    : pickArchetype(evidence, roles, forced);
  // The derivation vocabulary is wider than the dictionary: it can answer
  // "banner", "collection", "none" and more, while only nine archetypes ship a
  // base template. Refusing to draft in that gap is the wrong trade — it throws
  // away a whole extraction because the scaffold could not pick a FLOOR, which
  // is the one part of a draft a person can supply in a second. An archetype
  // with no template simply contributes nothing, which is exactly what
  // base.mjs already does for an unknown one.
  const NO_ARCHETYPE = { description: null, when: "", root: { element: "div" }, props: [], states: [], a11y: null };
  const arch = dictionary.archetypes[archetype] ?? NO_ARCHETYPE;
  const untemplated = !dictionary.archetypes[archetype];
  // A single COMPONENT is a one-variant set: TrustBadge and FeatureSection are
  // components with a layer tree and no axes, not frames to be role-walked.
  const isSet = evidence.set?.type === "COMPONENT_SET" || evidence.set?.type === "COMPONENT";
  const decisions = [];
  // A decision is a draft note: what the scaffold chose, what else it could have
  // been, how far to trust it, and the one-line edit that corrects it. Templates
  // carry the default confidence and fix; a call site overrides either when it
  // knows better (a forced archetype is read, not guessed).
  const D = (id, key, vars, extraFields = {}) => {
    const raw = dictionary.decisions[key];
    const tpl = typeof raw === "string" ? { question: raw } : (raw ?? {});
    decisions.push({
      id: `${ab}-${id}`,
      question: fill(tpl.question ?? "", vars),
      ...(tpl.chose ? { chose: fill(tpl.chose, vars) } : {}),
      ...(tpl.confidence ? { confidence: tpl.confidence } : {}),
      ...(tpl.fix ? { fix: fill(tpl.fix, vars) } : {}),
      status: "open",
      owner: "scaffold",
      ...extraFields,
    });
  };

  // An archetype the dictionary cannot template is not a failure, but it is not
  // nothing either: the draft ships with no element, no a11y floor and no base
  // CSS, so the one thing that must not happen is it going unmentioned.
  if (untemplated) {
    decisions.push({
      id: `${ab}-archetype-untemplated`,
      question: `The archetype read as "${archetype}", which has no template in the dictionary (it has: ${Object.keys(dictionary.archetypes).join(", ")}). Without one the draft gets no HTML element, no accessibility floor and no base CSS — the root falls back to <div>. Which archetype is this, really?`,
      chose: `drafted with no archetype floor; root element defaults to div`,
      confidence: "low",
      fix: `Set "archetype" in the defs to one the dictionary templates, or re-scaffold with --archetype=<name>. If none fit, the dictionary needs a new entry.`,
      status: "open",
      owner: "scaffold",
      evidence: why || "no signal strong enough to name an archetype",
    });
  }

  // Props: archetype props, then one lever per claimed role (dictionary order),
  // then the set's own axes when it is a real component set.
  // A COMPONENT_SET declares its own API, so classify THAT. Role-walking is for
  // FRAME candidates, which have no declared properties — running it over a real
  // set is how a Button acquires an "eyebrow" and a "mediaSrc".
  const setDerived = isSet && (evidence.axes ?? []).length ? fromComponentSet(evidence) : null;
  const unmatchedParts = [];
  const props = setDerived ? [...setDerived.props] : [...arch.props.map((p) => ({ ...p }))];
  const stateAxis = /^(state|breakpoint|context|orientation)$/i;
  const parts = {};
  const iconDefaults = [];
  const composition = [];
  const ordered = (isSet && evidence.anatomy?.tree) ? [] : [...claimed.entries()].map(([role, hit]) => ({ role, hit, def: dictionary.roles[role] })).filter((x) => x.def && !x.def.decisionOnly).sort((a, b) => (a.def.order ?? 99) - (b.def.order ?? 99));
  // Any set with a layer tree — axes or not — gets its parts from that tree.
  // Role-walking is for FRAME candidates, which have no declared structure;
  // TrustBadge (one variant, no axes) is still a set whose layers are its
  // anatomy, and reading it as "icon + cta" from the archetype gave it a
  // chevron it never had and dropped its text.
  const fromTree = isSet && Boolean(evidence.anatomy?.tree);
  if (fromTree) {
    const slotByPart = new Map((setDerived?.slots ?? []).map((sl) => [sl.part, sl]));
    // Parts are the set's real layer tree, read all the way down. A structural
    // frame (.body, .content, a generic wrapper) is a part with its layout and
    // its own parts; a text layer is a text slot with the design's words as
    // default; an INSTANCE is a composed component — a slot restricted to that
    // component, defaulting to what the design placed there, with the design's
    // overrides. Nothing below an instance is read: that is its own contract.
    const cssClasses = classesFromCss(slug);
    const ICON_COLOR = /^icon[ -]?colou?r$/i;
    const STRUCTURAL = new Set(["FRAME", "GROUP", "SECTION", "COMPONENT", "SLOT"]);
    const resting = evidence.anatomy?.variant;
    // By node id first: two sibling instances of the same set share a layer
    // name and therefore a path (MerchCard's two Buttons), and matching the
    // path gave the second button the first one's label.
    const instanceAt = (path, id, variant = resting) => (evidence.instances ?? []).find((i) => i.variant === variant && ((id && i.nodeId === id) || (!id && i.node === path)));
    // What each variant puts directly inside a layer path — the composed set
    // per variant, for a slot whose filling the design switches. A named
    // (dot-prefixed) layer is a part in its own right and never a filling of
    // an anonymous position beside it: Collapsible's `.icon-start` is not
    // "what the chevron becomes in Style=control"; it is another layer.
    const slotFillings = (path, named) => {
      const out = new Map();
      for (const v of evidence.variants ?? []) {
        const direct = (evidence.instances ?? []).filter((i) => i.variant === v.name && i.node.startsWith(path + "/") && !i.node.slice(path.length + 1).includes("/")
          && (named === undefined || i.node.slice(path.length + 1).startsWith(".") === named));
        const first = direct.find((i) => i.set ?? i.mainComponent);
        if (first) out.set(v.name, { set: first.set ?? first.mainComponent, inst: first });
      }
      return out;
    };
    const axesOf = (variantName) => Object.fromEntries(variantName.split(",").map((kv) => kv.split("=").map((x) => x.trim())).filter((kv) => kv.length === 2));
    // A position the design fills differently per variant, as a slot default
    // plus ordered defaultByProp entries: for every filling other than the
    // resting one, the axis value that picks exactly its variants. First
    // matching entry wins at render time; the resting filling is the fallback.
    // Collapsible's trigger: Style=control → ControlButton; State=open →
    // ChevronUp; otherwise ChevronDown.
    const fillingsToSlot = (fillings, describe) => {
      const restingFill = fillings.get(resting) ?? [...fillings.values()][0];
      const names = [...fillings.keys()];
      const axisOrder = (evidence.axes ?? []).filter((a) => a.type === "VARIANT").map((a) => stripId(a.name));
      const byName = new Map();
      for (const [n, f] of fillings) { const k = f.set.name; if (!byName.has(k)) byName.set(k, { f, variants: [] }); byName.get(k).variants.push(n); }
      // Greedy, in axis order, over the variants no earlier entry claimed:
      // Style=control takes the control variants (a ControlButton), then
      // State=open takes the open ones that remain (a ChevronUp). Read
      // together, first match wins, the rest fall to the resting filling.
      const entries = [];
      const remaining = new Set(names);
      // To a fixpoint: State=open is only uniform once Style=control's variants
      // are out of the way, and Style comes after State in the axis order.
      let changed = true;
      while (changed) {
        changed = false;
        for (const axis of axisOrder) {
          for (const value of [...new Set([...remaining].map((n) => axesOf(n)[axis]))].filter((v) => v !== undefined)) {
            const group = [...remaining].filter((n) => axesOf(n)[axis] === value);
            const fills = new Set(group.map((n) => fillings.get(n).set.name));
            if (fills.size !== 1 || [...fills][0] === restingFill.set.name) continue;
            const f = fillings.get(group[0]);
            const prop = props.find((pp) => pp.figma?.property === axis)?.name ?? camel(axis);
            entries.push({ prop, axis, map: { [valueKeyFor(axis, value)]: describe(f) } });
            for (const n of group) remaining.delete(n);
            changed = true;
          }
        }
      }
      const claimed = new Set(entries.flatMap((e) => Object.values(e.map).map((d) => d.figma)));
      return { def: describe(restingFill), byProp: entries.map(({ prop, map }) => ({ prop, map })), unexplained: [...byName.keys()].filter((k) => k !== restingFill.set.name && !claimed.has(k)) };
    };
    // One instance per variant in the same place is a filling; two Buttons in
    // .actions are two parts, not one slot.
    const singleFilling = (path, named) => { const f = slotFillings(path, named); return [...f.values()].length && (evidence.variants ?? []).every((v) => (evidence.instances ?? []).filter((i) => i.variant === v.name && i.node.startsWith(path + "/") && !i.node.slice(path.length + 1).includes("/") && (named === undefined || i.node.slice(path.length + 1).startsWith(".") === named)).length <= 1) ? f : null; };
    // The variants a condition picks out, as defaultByProp entries: greedy in
    // axis order, to a fixpoint, like fillingsToSlot. Style=control explains
    // "the chevron is absent"; State=open explains "the ChevronUp is present".
    const explainVariants = (wanted, universe) => {
      const all = universe ? [...universe] : (evidence.variants ?? []).map((v) => v.name);
      const axisOrder = (evidence.axes ?? []).filter((a) => a.type === "VARIANT").map((a) => stripId(a.name));
      const remaining = new Set(wanted);
      const entries = [];
      // Every axis value that picks out only wanted variants, broadest first:
      // Style=default covers all four variants the ControlButton is missing
      // from, so Size=default is never written beside it — which would have
      // hidden the button from a consumer asking for style=control at the
      // default size, a combination the set does not draw but code can.
      const candidates = [];
      for (const axis of axisOrder) {
        for (const value of [...new Set([...wanted].map((n) => axesOf(n)[axis]))].filter((v) => v !== undefined)) {
          const group = all.filter((n) => axesOf(n)[axis] === value);
          if (group.every((n) => wanted.has(n))) candidates.push({ axis, value, group });
        }
      }
      candidates.sort((a, b) => b.group.length - a.group.length);
      for (const c of candidates) {
        if (!c.group.some((n) => remaining.has(n))) continue;
        const prop = props.find((pp) => pp.figma?.property === c.axis)?.name ?? camel(c.axis);
        entries.push({ prop, value: valueKeyFor(c.axis, c.value) });
        for (const n of c.group) remaining.delete(n);
      }
      return { entries, unexplained: [...remaining] };
    };
    // Every layer the set places directly under a path, across ALL variants:
    // the resting variant's order, with each other variant's extras slotted in
    // after the neighbour they follow. An anonymous instance (an icon the
    // design placed, not a named layer) at a position another variant fills
    // with a different anonymous instance is the same position — one slot,
    // two fillings. Each child carries the variants it exists in and the
    // variants whose tree was deep enough to say.
    const treesByVariant = evidence.anatomy?.variants ?? null;
    const nodeAt = (tree, path) => { let n = tree; for (const seg of path.split("/").filter(Boolean)) { n = (n?.children ?? []).find((c) => c.name === seg); if (!n) return null; } return n; };
    const unionChildren = (children, parentPath) => {
      const out = (children ?? []).map((c) => ({ ...c, __variants: new Set([resting]), __known: new Set([resting]), __from: resting }));
      if (!treesByVariant) return out;
      // By name: `.content` is a FRAME in one variant and a SLOT in another
      // and is one layer either way.
      const key = (c) => c.name;
      const walked = [];
      for (const [vname, tree] of Object.entries(treesByVariant)) {
        const parent = nodeAt(tree, parentPath);
        if (!parent || !Array.isArray(parent.children)) continue; // cut by depth: unknown, not absent
        walked.push(vname);
        const kids = parent.children;
        const kidKeys = new Set(kids.map(key));
        let prev = -1;
        for (const k of kids) {
          let i = out.findIndex((o) => key(o) === key(k));
          if (i < 0 && !k.name.startsWith(".") && k.type === "INSTANCE") {
            i = out.findIndex((o, idx) => idx > prev && !o.name.startsWith(".") && o.type === "INSTANCE" && !kidKeys.has(key(o)) && !o.__variants.has(vname));
          }
          if (i < 0) { i = prev + 1; out.splice(i, 0, { ...k, __variants: new Set(), __known: new Set(walked), __from: vname }); }
          out[i].__variants.add(vname);
          prev = i;
        }
        for (const o of out) o.__known.add(vname);
      }
      return out;
    };
    const valueKeyFor = (axis, value) => { const pp = props.find((x) => x.figma?.property === axis); const vm = pp?.figma?.valueMap; if (!vm) return value; return Object.entries(vm).find(([, av]) => av === value)?.[0] ?? value; };
    const stripIds = (o) => Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k.split("#")[0].trim(), v]));
    const S2A = /^S2a_Icon_/i;
    // A layer that exists in some variants and not others is a slot the design
    // fills in those variants only. Absent in Style=control → hidden there;
    // present only in Style=control → hidden at rest, filled there. The
    // entries go FIRST in defaultByProp, so a hiding condition beats a filling
    // one, and each is a decision a reviewer can overturn.
    // The design's placement of a composed child: the set, its contract, the
    // overrides on the instance — and the glyph swapped into it one level
    // down. Collapsible's ControlButton shows Arrow Right closed and Arrow
    // Down open; the swap lives on the button's own Icon property, so it is
    // recorded as that property with the design's icon name. Heal binds the
    // name to the library, as it does for a slot default.
    const describeComposed = (inst, set, hit) => {
      const props = inst?.props ? stripIds(inst.props) : {};
      const swap = hit?.defs?.props?.find((p) => p.figma?.kind === "INSTANCE_SWAP");
      if (inst && swap) {
        const key = stripId(swap.figma.property);
        const nested = (evidence.instances ?? []).find((x) => x.variant === inst.variant && x.node.startsWith(inst.node + "/") && /^S2a?_Icon_/i.test(x.mainComponent?.name ?? ""));
        if (nested && props[key] === undefined) props[key] = nested.mainComponent.name;
      }
      return { figma: set.name, ...(hit ? { slug: hit.slug } : {}), ...(Object.keys(props).length ? { props } : {}) };
    };
    // A frame with no auto-layout whose children are fixed boxes (a 20px
    // control holding an 18px ring and an 8px dot) draws them on top of one
    // another, centred. One grid cell holds them all; each child stacks in it.
    const stackIfFree = (child, entry, sub) => {
      if (child.layoutMode || !Object.keys(sub).length) return;
      entry.layout = { display: "grid", align: "center", justify: "center" };
      for (const p of Object.values(sub)) p.layout = { ...(p.layout ?? {}), stack: true };
    };
    const presenceToSlot = (child, entry, part) => {
      if (!child.__known || child.__known.size <= 1) return;
      if (!entry.slot) {
        // Not a slot — a drawn layer (the dot) that some variants have and
        // others do not. Presence is display: shown by default where the
        // resting variant has it, hidden where it does not; the reverse when
        // the resting variant lacks it. Each condition is one axis value.
        const absent = new Set([...child.__known].filter((v) => !child.__variants.has(v)));
        if (!absent.size) return;
        const shown = entry.layout?.display ?? "block";
        const push = (e, display) => { entry.tokensByProp ??= []; entry.tokensByProp.push({ prop: e.prop, map: { [e.value]: { display: `raw:${display}` } } }); };
        if (child.__variants.has(resting)) { for (const e of explainVariants(absent).entries) push(e, "none"); }
        else { entry.tokens = { ...(entry.tokens ?? {}), display: "raw:none" }; for (const e of explainVariants(child.__variants).entries) push(e, shown); }
        return;
      }
      const absent = new Set([...child.__known].filter((v) => !child.__variants.has(v)));
      if (!absent.size) return;
      const hidden = [];
      if (child.__variants.has(resting)) {
        const { entries, unexplained } = explainVariants(absent);
        for (const e of entries) hidden.push({ prop: e.prop, map: { [e.value]: { visible: false } } });
        if (unexplained.length) decisions.push({ id: `${ab}-${part}-presence`, question: `"${child.name}" is missing from ${unexplained.join("; ")} and no single axis value explains why.`, chose: "left it visible there", confidence: "low", fix: "Add a slot.defaultByProp entry with visible:false for the condition that hides it.", status: "open", owner: "scaffold", evidence: `${slug}.figma.evidence.json anatomy.variants` });
      } else {
        // Not in the resting variant: hidden where it is absent (those entries
        // first, so they win), then each distinct placement keyed by what picks
        // it out among the variants that have it, the commonest placement last.
        const placed = { ...(entry.slot.default ?? {}) }; delete placed.visible;
        entry.slot.default = { visible: false };
        for (const e of explainVariants(absent).entries) hidden.push({ prop: e.prop, map: { [e.value]: { visible: false } } });
        const present = [...child.__variants];
        const groups = new Map();
        for (const v of present) { const d = entry.__describe?.(v) ?? placed; const k = JSON.stringify(d); if (!groups.has(k)) groups.set(k, { d, variants: [] }); groups.get(k).variants.push(v); }
        const ordered = [...groups.values()].sort((a, b) => a.variants.length - b.variants.length);
        const base = ordered.pop();
        const unexplained = [];
        for (const g of ordered) { const r = explainVariants(new Set(g.variants), present); for (const e of r.entries) hidden.push({ prop: e.prop, map: { [e.value]: g.d } }); unexplained.push(...r.unexplained); }
        { const r = explainVariants(new Set(present)); for (const e of r.entries) hidden.push({ prop: e.prop, map: { [e.value]: base.d } }); unexplained.push(...r.unexplained); }
        if (unexplained.length) decisions.push({ id: `${ab}-${part}-presence`, question: `"${child.name}" appears only in ${present.join("; ")} and no single axis value explains ${[...new Set(unexplained)].join("; ")}.`, chose: "hidden by default; shown by the entries that do explain", confidence: "low", fix: "Add a slot.defaultByProp entry for the condition that shows it.", status: "open", owner: "scaffold", evidence: `${slug}.figma.evidence.json anatomy.variants` });
      }
      delete entry.__describe;
      if (hidden.length) entry.slot.defaultByProp = [...hidden, ...(entry.slot.defaultByProp ?? [])];
    };
    const partsFrom = (children, parentPath, into, depth, parentMode = evidence.anatomy?.tree?.layoutMode ?? null, parentEntry = null) => {
      for (const child of unionChildren(children, parentPath)) {
        const figmaPath = `${parentPath}/${child.name}`;
        const structural = STRUCTURAL.has(child.type);
        if (GENERIC.test(child.name) && !structural) continue; // a stray "Rectangle 3"; a generic frame still lays out its children
        if (/^\[.*\]$/.test(child.name)) {
          // A bracketed layer is a state's paint, not a part: [hover halo] is
          // the control's hover background, [focus ring] its focus outline.
          // A fill becomes the parent's background in the states the layer
          // exists in; a stroke is Heal's (an outline needs the geometry).
          if (parentEntry && child.__variants) {
            const stateAxisName = (evidence.axes ?? []).find((a) => a.type === "VARIANT" && STATE_AXIS.test(stripId(a.name)))?.name;
            for (const vn of child.__variants) {
              const st = stateAxisName ? String(axesOf(vn)[stateAxisName] ?? "default").toLowerCase() : "default";
              if (st === "default") continue;
              const fill = (evidence.bindings ?? []).find((b) => b.variant === vn && b.node === figmaPath && b.property === "fills" && b.variable);
              const vname = fill && evidence.variables?.[fill.variable]?.name;
              if (!vname) continue;
              parentEntry.states ??= {};
              parentEntry.states[st] = { ...(parentEntry.states[st] ?? {}), "background-color": refOf(vname) };
              if (child.type === "ELLIPSE") parentEntry.tokens = { ...(parentEntry.tokens ?? {}), "border-radius": "raw:50%" };
            }
          }
          continue;
        }
        const inst = child.type === "INSTANCE" ? instanceAt(figmaPath, child.id, child.__from) : null;
        const set = inst?.set ?? inst?.mainComponent;
        // An icon rig or a product mnemonic (B_app_*) is an asset in a slot,
        // never a composed component.
        const isIcon = ICON_COLOR.test(child.name) || (child.type === "INSTANCE" && /^(s2a?_icon|scale\/s2a-icons|b_app_)|_icon_/i.test(set?.name ?? child.name));
        const base = ICON_COLOR.test(child.name) && depth === 0 && slotByPart.has("icon") ? "icon"
          : child.type === "INSTANCE" && set?.name ? kebab(undecorate(set.name) || set.name)
          : kebab(child.name);
        if (!base) continue;
        let part = base; for (let n = 2; into[part]; n++) part = `${base}-${n}`;
        // The hand-written stylesheet's class when it has this exact part;
        // otherwise the part's own BEM class, which the generated stylesheet
        // defines. A prefix match is not a match: "merch-card-pricing-display"
        // used to land on .c-merch-card — the root — and style the whole card.
        const { selector: real, exact } = selectorForPart(cssClasses, part);
        if (cssClasses && !exact) unmatchedParts.push({ part, fellBackTo: real });
        const entry = {
          selector: exact ? real : `.c-${slug}__${part}`, figma: figmaPath,
          ...anatomyTokens(evidence, figmaPath, null, { isText: child.type === "TEXT", isIcon }),
          ...(layoutFromEvidence(child, parentMode) ? { layout: layoutFromEvidence(child, parentMode) } : {}),
        };
        if (entry.tokens && !Object.keys(entry.tokens).length) delete entry.tokens;
        if (["RECTANGLE", "ELLIPSE", "VECTOR", "BOOLEAN_OPERATION"].includes(child.type)) {
          // A drawn shape is a box with no children. An ellipse is a circle,
          // and a stroke drawn INSIDE it leaves the box the size Figma says.
          entry.element = "div";
          if (child.type === "ELLIPSE") entry.tokens = { ...(entry.tokens ?? {}), "border-radius": "raw:50%" };
          const inside = (evidence.unboundValues ?? []).some((u) => u.variant === child.__from && u.node === figmaPath && u.property === "strokeAlign" && u.value === "INSIDE");
          if (inside && Object.keys(entry.tokens ?? {}).some((k) => k.startsWith("border"))) entry.tokens["box-sizing"] = "raw:border-box";
        }

        if (child.type === "INSTANCE" && set?.name && /^[._]/.test(set.name)) {
          // An instance of a hidden (dot-prefixed) set: its layers are this
          // component's — SelectPromo's .select/trigger is SelectPromo's
          // trigger, not a component anyone else places. Read through it.
          entry.element = "div";
          // A hidden set named for the component itself (_radio inside Radio)
          // is the component's own control, not a part that borrows the root's name.
          if (alnumName(part) === alnumName(slug)) { part = "control"; const r2 = selectorForPart(cssClasses, part); entry.selector = r2.exact ? r2.selector : `.c-${slug}__control`; }
          const sub = {};
          partsFrom(child.children, figmaPath, sub, depth + 1, child.layoutMode ?? null, entry);
          if (Object.keys(sub).length) entry.parts = sub;
          stackIfFree(child, entry, sub);
          into[part] = entry;
          continue;
        }
        if (child.type === "INSTANCE" && set?.name && isIcon && !(depth === 0 && slotByPart.has(part))) {
          // A placed icon — not a swap property, just an instance the design
          // put here. Which glyph is recorded (resolving it to the library is
          // Heal's); when the glyph or the whole filling changes with a
          // variant (ChevronDown/ChevronUp; a ControlButton in Style=control),
          // the fillings are keyed by the prop that decides, like any slot.
          const box = (evidence.unboundValues ?? []).find((u) => u.variant === child.__from && u.node === figmaPath && u.property === "width");
          const describe = (f) => {
            const iconish = /^(s2a?_icon|scale\/s2a-icons|b_app_)|_icon_/i.test(f.set.name);
            const hit = iconish ? null : (Array.isArray(contracts) ? contracts : []).find((k) => alnumName(k.name) === alnumName(undecorate(f.set.name)));
            const b = (evidence.unboundValues ?? []).find((u) => u.variant === (f.inst?.variant ?? resting) && u.node === f.inst?.node && u.property === "width");
            return { figma: f.set.name, ...(b ? { size: b.value } : {}), ...(hit ? { slug: hit.slug } : {}), ...(f.inst?.props && !iconish ? { props: stripIds(f.inst.props) } : {}) };
          };
          const fillings = singleFilling(parentPath, child.name.startsWith("."));
          const slot = fillings && new Set([...fillings.values()].map((f) => f.set.name)).size > 1 ? fillingsToSlot(fillings, describe) : null;
          entry.slot = { name: child.name, accepts: ["kind:icon", ...(slot ? [...new Set(Object.values(Object.assign({}, ...slot.byProp.map((e) => e.map))).map((d) => d.slug ? undecorate(d.figma) : null).filter(Boolean))] : [])], acceptsMode: "restrict",
            default: slot ? slot.def : { figma: set.name, ...(box ? { size: box.value } : {}) },
            ...(slot?.byProp.length ? { defaultByProp: slot.byProp } : {}) };
          if (child.visible === false) entry.slot.default.visible = false;
          iconDefaults.push({ part, figma: set.name });
          presenceToSlot(child, entry, part);
          into[part] = entry;
          continue;
        }
        if (child.type === "INSTANCE" && set?.name && !isIcon) {
          // A composed component. The slot accepts that component by name and
          // defaults to the design's placement, overrides included. The
          // wrapper's layout is how the instance SITS (fill or hug), not the
          // child's own auto-layout, which is the child's contract's business —
          // and so are its tokens: what the instance binds belongs to the child.
          delete entry.tokens; delete entry.states; delete entry.tokensByProp; delete entry.statesByProp;
          const sit = layoutFromEvidence({ sizing: child.sizing }, parentMode) ?? {};
          entry.layout = { display: "flex", direction: "column", ...(sit.grow ? { grow: true } : {}), ...(sit.stretch ? { stretch: true } : {}) };
          const hit = (Array.isArray(contracts) ? contracts : []).find((k) => alnumName(k.name) === alnumName(undecorate(set.name)));
          entry.slot = {
            name: child.name, accepts: [hit ? hit.name : (undecorate(set.name) || set.name)], acceptsMode: "restrict",
            default: describeComposed(inst, set, hit),
            notes: hit ? `Composes ${hit.name} (${hit.slug}).` : `Composes "${set.name}", which has no contract yet — contract it first (leaves before parents).`,
          };
          entry.__describe = (v) => { const i = instanceAt(figmaPath, null, v); return i ? describeComposed(i, i.set ?? i.mainComponent, hit) : null; };
        } else if (child.type === "TEXT") {
          entry.element = "span";
          entry.slot = { name: child.name.replace(/^\./, ""), accepts: ["kind:text"], acceptsMode: "prefer", default: { text: child.text ?? "" } };
        } else if (child.type === "SLOT" && slotFillings(figmaPath).size > 1) {
          // A Figma Slot the design fills differently per variant — a List
          // when Features List=default, a Collapsible when closed. The resting
          // filling is the default; the others are keyed by the prop whose
          // value predicts them. The slot renders the composed child directly,
          // so nothing below it becomes a part of this component.
          const fillings = slotFillings(figmaPath);           // variant name → { set, inst }
          const describe = (f) => {
            const hit = (Array.isArray(contracts) ? contracts : []).find((k) => alnumName(k.name) === alnumName(undecorate(f.set.name)));
            return { figma: f.set.name, ...(hit ? { slug: hit.slug } : {}), ...(f.inst?.props ? { props: stripIds(f.inst.props) } : {}) };
          };
          const slot = fillingsToSlot(fillings, describe);
          entry.element = "div";
          entry.slot = {
            name: child.name, accepts: [...new Set([...fillings.values()].map((f) => undecorate(f.set.name) || f.set.name))], acceptsMode: "restrict",
            default: slot.def,
            notes: `Figma Slot; the design fills it with ${[...new Set([...fillings.values()].map((f) => f.set.name))].join(" or ")} depending on the variant.`,
          };
          if (slot.byProp.length) {
            // A disclosure with an empty content slot standing in for the
            // other filling discloses that filling: "closed" shows the list
            // collapsed, not a different list. Read from the archetypes, written
            // as a decision because it is a reading.
            const archetypeOf = (d) => (Array.isArray(contracts) ? contracts : []).find((k) => k.slug === d.slug)?.defs?.archetype ?? null;
            for (const e of slot.byProp) for (const [value, d] of Object.entries(e.map)) {
              if (archetypeOf(d) !== "accordion") continue;
              d.content = { ...slot.def };
              decisions.push({ id: `${ab}-disclosure-content`, question: `The "${child.name}" slot holds ${slot.def.figma} at rest and a ${d.figma} when ${e.prop}=${value}, with the disclosure's content slot empty in the design. Read as: the disclosure contains the ${slot.def.figma}.`, chose: `composed ${d.figma} with ${slot.def.figma} as its content`, confidence: "medium", fix: `If the collapsed state shows something else, set slot.defaultByProp.map.${value}.content.`, status: "open", owner: "scaffold", evidence: `${slug}.figma.evidence.json instances` });
            }
            entry.slot.defaultByProp = slot.byProp;
          }
          into[part] = entry;
          continue;
        } else if (structural && (child.type === "SLOT" || (depth === 0 && slotByPart.get(part)?.open) || (treesByVariant && Object.values(treesByVariant).some((t) => nodeAt(t, figmaPath)?.type === "SLOT")))) {
          // A Figma Slot: whatever the design placed in it is an example for
          // the artboard, not this component's anatomy. Nothing below it is
          // read; the slot stays open.
          entry.element = "div";
          const placed = [...new Set((evidence.instances ?? []).filter((i) => i.node.startsWith(figmaPath + "/") && !i.node.slice(figmaPath.length + 1).includes("/")).map((i) => (i.set ?? i.mainComponent)?.name).filter(Boolean))];
          if (placed.length) entry.notes = `The design shows ${placed.join(", ")} here as an example; the slot is open.`;
        } else if (structural) {
          entry.element = "div";
          const sub = {};
          partsFrom(child.children, figmaPath, sub, depth + 1, child.layoutMode ?? null, entry);
          if (Object.keys(sub).length) entry.parts = sub;
          stackIfFree(child, entry, sub);
        }

        // The design hides this layer at rest (a Show Icon toggle off, a
        // collapsed section): whatever the slot holds is not shown unless asked.
        if (child.visible === false && entry.slot) entry.slot.default = { ...(entry.slot.default ?? {}), visible: false };
        presenceToSlot(child, entry, part);
        // An INSTANCE_SWAP axis names a top-level layer as its slot: the icon
        // it holds by default is recorded, resolution to the library left open.
        const sl = depth === 0 ? slotByPart.get(part) : null;
        if (sl && sl.open) {
          // A Figma Slot axis: open to any children, no default filling.
          entry.slot = { name: sl.name, accepts: [], acceptsMode: "open", notes: `Figma Slot "${sl.name}": children go here.` };
          delete entry.tokensByProp; // its box is the children's; only the collapse geometry stays
        } else if (sl) {
          entry.slot = { name: sl.name, accepts: [], acceptsMode: "prefer",
            notes: `Instance-swap property "${sl.name}" — list what it accepts once those contracts exist.` };
          const all = (evidence.instances ?? []).filter((i) => i.variant === resting && i.mainComponent?.name);
          const underHere = all.filter((i) => i.node === figmaPath || i.node.startsWith(figmaPath + "/"));
          const pick = underHere.find((i) => S2A.test(i.mainComponent.name)) ?? underHere.find((i) => /icon/i.test(i.mainComponent.name))
            ?? (isIcon ? all.find((i) => S2A.test(i.mainComponent.name)) : null);
          if (pick) {
            const box = (evidence.unboundValues ?? []).find((u) => u.variant === resting && u.node === pick.node && u.property === "width");
            entry.slot.accepts = ["kind:icon"];
            entry.slot.default = { figma: pick.mainComponent.name, ...(box ? { size: box.value } : {}), ...(child.visible === false ? { visible: false } : {}) };
            iconDefaults.push({ part, figma: pick.mainComponent.name });
          }
        }
        into[part] = entry;
      }
    };
    partsFrom(evidence.anatomy?.tree?.children, "", parts, 0);
  }
  for (const { role, hit, def } of ordered) {
    const part = { selector: `.${ab}-${def.part}`, figma: hit.path };
    if (def.element) part.element = def.element;
    // Same rule for a part: what the layer binds beats what the archetype guessed.
    Object.assign(part, anatomyTokens(evidence, hit.path, def.tokens, { isText: hit.node?.type === "TEXT" }));
    if (!part.tokens || !Object.keys(part.tokens).length) delete part.tokens;
    if (def.slot) part.slot = { ...def.slot, notes: `Figma: ${hit.node.type} "${hit.node.name}"${hit.node.type === "INSTANCE" ? "" : " is raw layers today; place a library instance here so the swap is a property"}` };
    if (def.notes) part.notes = def.notes;
    if (def.parts) part.parts = Object.fromEntries(Object.entries(def.parts).map(([n, c]) => [n, { selector: `.${ab}-${def.part}__${n}`, ...c }]));
    parts[def.part] = part;
    if (def.lever) {
      const axis = (evidence.axes ?? []).find((a) => a.type !== "VARIANT" && kebab(a.name.replace(/#.*$/, "")) === kebab(def.lever.name));
      // A slot's lever points at the instance layer (INSTANCE → an instance-swap
      // property in the plan); a text lever points at the text layer (LAYER →
      // a derived TEXT property).
      const layerKind = def.slot ? "INSTANCE" : "LAYER";
      props.push({ name: def.lever.name, lever: true, type: def.lever.type, figma: axis ? { kind: axis.type, property: axis.name } : { kind: layerKind, property: hit.path, notes: `no component property in Figma yet; layer ${hit.path} (${hit.node.type})` }, code: { prop: def.lever.name }, ...(def.lever.notes ? { notes: def.lever.notes } : {}) });
    }
  }
  // Dual evidence: the design says what is authorable, the code says what the
  // component accepts. A prop in one and not the other is not an error — it is
  // the interesting part. href and onClick have no design counterpart and never
  // will; a design axis with no code prop means the component has not caught up.
  const codeOnly = [];
  // Whenever there is code: a set with no axes (List) still has code props,
  // and the dual-evidence rule holds for it like any other.
  if (code) {
    const known = new Set(props.map((p) => alnumName(p.name)));
    // The State axis is runtime behaviour, but a component that lets code FORCE
    // a state (state, forceState) is exposing that axis as a prop on purpose —
    // for previews, docs and the state matrix, which is how the design parity
    // check reaches hover and focus without a pointer. Link the two rather
    // than filing the prop as "no design counterpart".
    const stateAxisDef = (evidence.axes ?? []).find((a) => a.type === "VARIANT" && STATE_AXIS.test(stripId(a.name)));
    for (const cp of code.component?.props ?? code.props ?? []) {
      if (known.has(alnumName(cp.name))) continue;
      if (stateAxisDef && /^(force)?state$/i.test(cp.name) && !props.some((p) => p.figma?.property === stateAxisDef.name)) {
        const options = (stateAxisDef.options ?? []).map((o) => String(o).toLowerCase());
        // The generated stylesheet keys every forced state on data-state (see
        // renderers/css.mjs STATE_ATTR); the attribute the hand-written code
        // used is noted, not adopted, or the forced twins would never match.
        const attr = Object.entries(code.attributes ?? {}).find(([, v]) => (v.values ?? []).some((x) => options.includes(String(x).toLowerCase())))?.[0];
        props.push({ name: cp.name, lever: true, type: "string", enum: options, default: options.includes("default") ? "default" : options[0],
          figma: { kind: "VARIANT", property: stateAxisDef.name },
          code: { prop: cp.name, attr: "data-state" },
          notes: `The State axis, forceable from code. At runtime the states come from interaction; forcing one is for previews, docs and the state matrix.${attr && attr !== "data-state" ? ` The hand-written component used ${attr}; generated code uses data-state.` : ""}` });
        setDerived?.notes?.push(`"${cp.name}" read as the code's handle on the "${stripId(stateAxisDef.name)}" axis${attr ? ` (${attr})` : ""}, so every state can be rendered without a pointer`);
        continue;
      }
      // The same prop under another name: the design says Selected, the code
      // says checked. Bind the design's prop to the code's and say so, rather
      // than filing one as "not in the surface" and the other as "code only".
      const SYN = { checked: /^(selected|on|active)$/i, selected: /^checked$/i, expanded: /^open$/i, open: /^expanded$/i };
      const codeNames = new Set((code.component?.props ?? code.props ?? []).map((x) => x.name));
      const twin = SYN[cp.name] ? props.find((p) => p.figma && p.figma !== "NONE" && SYN[cp.name].test(p.name) && !codeNames.has(p.code?.prop)) : null;
      if (twin) {
        twin.code = { ...(twin.code ?? {}), prop: cp.name };
        twin.notes = `${twin.notes ? twin.notes + " " : ""}The hand-written component calls this "${cp.name}"; generated code binds to it.`;
        setDerived?.notes?.push(`"${twin.name}" (design) and "${cp.name}" (code) read as one prop`);
        continue;
      }
      codeOnly.push(cp.name);
      const TYPES = new Set(["string", "boolean", "number", "function", "expression", "array", "object"]);
      props.push({ name: cp.name, lever: true, type: TYPES.has(cp.type) ? cp.type : cp.type === "function" ? "function" : "string",
        figma: "NONE", code: { prop: cp.name },
        notes: `Exists in the component, has no design counterpart.${cp.type && !TYPES.has(cp.type) ? ` (code type ${cp.type})` : ""}` });
    }
  }
  // A State axis with real interaction states that no code prop claims still
  // has to be reachable without a pointer, or the matrix has no columns and
  // hover, focus and disabled are never compared with the design. Generated
  // code carries forceState (data-state); it is not a lever — nobody authors
  // a radio in its hover state — and the hand-written component may ignore it.
  {
    const axis = (evidence.axes ?? []).find((a) => a.type === "VARIANT" && STATE_AXIS.test(stripId(a.name)) && (a.options ?? []).some((o) => STATE_VALUE[String(o).toLowerCase()] && String(o).toLowerCase() !== "default"));
    if (axis && !props.some((p) => p.figma?.property === axis.name)) {
      const options = (axis.options ?? []).map((o) => String(o).toLowerCase());
      props.push({ name: "forceState", lever: false, type: "string", enum: options, default: options.includes("default") ? "default" : options[0],
        figma: { kind: "VARIANT", property: axis.name }, code: { prop: "forceState", attr: "data-state" },
        notes: "The State axis, forceable from code for previews, docs and the state matrix. At runtime the states come from interaction." });
      setDerived?.notes?.push(`"forceState" added for the "${stripId(axis.name)}" axis so every state can be rendered without a pointer`);
    }
  }
  const states = setDerived ? [...setDerived.states] : [...arch.states.map((s) => ({ ...s }))];
  for (const a of setDerived ? [] : evidence.axes ?? []) {
    if (a.type === "VARIANT") {
      if (stateAxis.test(a.name)) { if (!states.some((s) => s.figma.property === a.name)) states.push({ name: a.name, figma: { kind: "VARIANT", property: a.name, notes: (a.options ?? []).join(" | ") }, code: { mechanism: "tbd" }, notes: "Design axis read as a runtime state; confirm." }); }
      else props.push({ name: kebab(a.name).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), lever: true, type: "string", enum: a.options ?? [], default: a.defaultValue, figma: { kind: "VARIANT", property: a.name }, code: { prop: kebab(a.name).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), attr: `data-${kebab(a.name)}` } });
    } else if (a.type === "BOOLEAN" && !props.some((p) => p.figma?.property === a.name)) {
      const prop = kebab(a.name.replace(/#.*$/, "")).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      props.push({ name: prop, lever: true, type: "boolean", default: a.defaultValue, figma: { kind: "BOOLEAN", property: a.name }, code: { prop } });
    }
  }

  // Decisions: everything derived rather than read.
  D("archetype", "archetype", { archetype, why, slug }, {
    alternatives: Object.keys(dictionary.archetypes).filter((a) => a !== archetype).map((a) => `${a}: ${dictionary.archetypes[a].description ?? a}`),
    // --archetype is a human reading the frame, not the scaffold guessing.
    ...(derived
      ? { confidence: derived.confidence, chose: `${archetype} \u2014 ${derived.why.join("; ")}`,
          ...(derived.alternatives?.length ? { alternatives: derived.alternatives.map((a) => `${a}: ${dictionary.archetypes[a]?.description ?? a}`) } : {}) }
      : typeof forced === "string" ? { confidence: "high", chose: `archetype ${archetype}, chosen with --archetype` } : {}),
    evidence: derived
      ? `decided by ${derived.decidedBy}; token namespaces ${Object.entries(derived.state?.tokenNamespaces ?? {}).map(([k, n]) => `${k}\u00d7${n}`).join(", ") || "none"}; state axis ${derived.state?.stateValues?.join("/") || "none"}`
      : `roles ${[...roles].join(", ") || "none"}; pattern ${evidence.pattern ? `${evidence.pattern.kind}, ${evidence.pattern.repeats?.length ?? 0} repeats` : "n/a"}`,
  });
  if (codeOnly.length) {
    // The sharp one: the design turned a "State" axis into runtime states while
    // the component still exposes `state` as a prop. Both cannot be the truth.
    const stateAxes = setDerived?.stateAxes ?? [];
    const clash = codeOnly.filter((n) => stateAxes.some((ax) => alnumName(ax) === alnumName(n)) || states.some((st) => alnumName(st.name) === alnumName(n)));
    decisions.push({ id: `${ab}-code-only-props`,
      question: `${codeOnly.join(", ")} exist in the component but have no design counterpart. Confirm each is authored (lever true) or integration-only (lever false).${clash.length ? ` "${clash.join(", ")}" collides with the ${stateAxes.join("/")} axis, which this draft read as runtime states — decide whether the code prop or the state axis is the truth.` : ""}`,
      chose: `added ${codeOnly.length} code-only prop${codeOnly.length === 1 ? "" : "s"} as levers with no design binding`,
      confidence: clash.length ? "low" : "medium",
      fix: "Set lever:false on the integration-only ones, or delete any the component should stop accepting.",
      status: "open", owner: "scaffold", evidence: `${slug}.code.evidence.json` });
  }
  if (unmatchedParts.length) {
    const names = unmatchedParts.map((u) => u.part);
    const shared = [...new Set(unmatchedParts.map((u) => u.fellBackTo).filter(Boolean))];
    decisions.push({ id: `${ab}-part-selectors`,
      question: `${names.join(", ")} ${names.length === 1 ? "has" : "have"} no class of ${names.length === 1 ? "its" : "their"} own in ${slug}.css${shared.length ? ` — ${names.length > 1 ? "they all share" : "it falls back to"} ${shared.join(", ")}` : ""}. The design names ${names.length === 1 ? "this part" : "these parts"} separately and the code does not. Split the class, or model them as one part.`,
      chose: shared.length ? `pointed ${names.join(" and ")} at ${shared.join(", ")}` : `kept a derived selector that matches nothing`,
      confidence: "low", fix: `Set anatomy.root.parts.<part>.selector to the real class, or add the class to ${slug}.css.`,
      status: "open", owner: "scaffold", evidence: `packages/components/src/${slug}/${slug}.css` });
  }
  if (setDerived) {
    for (const [i, note] of (setDerived?.notes ?? []).entries()) {
      decisions.push({ id: `${ab}-classify-${i + 1}`, question: `${note}. Confirm, or change it in props/states.`,
        chose: note, confidence: "medium", fix: "Edit props[] or states[] in this file.",
        status: "open", owner: "scaffold", evidence: `${slug}.figma.evidence.json axes` });
    }
  }
  if (ordered.length) D("levers", "levers", { roles: ordered.map((o) => `${o.role} → ${o.def.lever?.name ?? o.def.part}`).join(", ") }, { evidence: ordered.map((o) => `${o.role}: ${o.hit.path}`).join("; ") });
  const unbound = evidence.unboundPaint ?? [];
  if (unbound.length) D("unbound-paint", "unboundPaint", { count: unbound.length, list: unbound.slice(0, 6).map((u) => `${u.node || "/"} ${u.properties.join("+")}`).join(", ") + (unbound.length > 6 ? ", …" : "") }, { evidence: `${slug}.figma.evidence.json unboundPaint` });
  const generic = [];
  const walkNames = (n, p) => { const q = `${p}/${n.name}`; if (GENERIC.test(n.name)) generic.push(q); for (const c of n.children ?? []) walkNames(c, q); };
  for (const c of evidence.anatomy?.tree?.children ?? []) walkNames(c, "");
  if (generic.length) D("layer-names", "genericLayers", { count: generic.length, list: generic.slice(0, 5).join(", ") + (generic.length > 5 ? ", …" : "") }, { evidence: `${slug}.figma.evidence.json anatomy` });
  if (extra.text.length) {
    const t = dictionary.decisions.strayText ?? {};
    decisions.push({ id: `${ab}-stray-text`, question: `${dictionary.roles.text.question} Layers: ${extra.text.join(", ")}.`, chose: `left ${extra.text.length} text layer${extra.text.length === 1 ? "" : "s"} out of the anatomy`, ...(t.confidence ? { confidence: t.confidence } : {}), ...(t.fix ? { fix: t.fix } : {}), status: "open", owner: "scaffold", evidence: `${slug}.figma.evidence.json anatomy` });
  }
  if (extra.art.length) {
    const t = dictionary.decisions.extraArt ?? {};
    decisions.push({ id: `${ab}-extra-art`, question: `Additional shape layers outside the media group (${extra.art.slice(0, 4).join(", ")}${extra.art.length > 4 ? ", …" : ""}). Fold them into the Media instance or name them as parts.`, chose: `treated ${extra.art.length} shape layer${extra.art.length === 1 ? "" : "s"} as art, not as parts`, ...(t.confidence ? { confidence: t.confidence } : {}), ...(t.fix ? { fix: t.fix } : {}), status: "open", owner: "scaffold", evidence: `${slug}.figma.evidence.json anatomy` });
  }
  if (contracts) {
    try {
      // Never match a contract against itself (re-scaffolding an existing slug).
      const others = Array.isArray(contracts) ? contracts.filter((c) => c.slug !== slug && alnumName(c.name) !== alnumName(component)) : contracts;
      const m = matchCandidate(evidence, others);
      const best = m?.unit?.[0];
      if (best && m.verdict && m.verdict !== "new") D("match", "match", { verdict: m.verdict, name: best.name, score: best.score }, { evidence: m.summary });
    } catch { /* matcher is advisory */ }
  }
  // What this component is BUILT FROM. The extractor records every nested
  // instance and the set it came from; until now nothing read it, so a
  // component could be composed of six others and scaffold clean. The gate
  // only checks composition a contract DECLARES — it is blind to composition
  // a contract omits, which is the direction that actually goes wrong.
  //
  // Leaves have to be contracted before the things built from them, or any
  // slot naming one of them fails COMPOSITION. Raising it here is what makes
  // that ordering visible while someone is already looking at the component.
  {
    const seen = new Map();
    // Direct dependencies only: an instance nested inside another instance is
    // that component's composition, not this one's. Same rule as the validator.
    const placed = (evidence.instances ?? []).filter((i) => (i.set ?? i.mainComponent)?.name).map((i) => ({ i, path: i.node ?? "" }));
    const direct = placed.filter((x) => !placed.some((o) => o.path !== x.path && x.path.startsWith(`${o.path}/`)));
    for (const { i: ins } of direct) {
      const set = ins.set ?? ins.mainComponent;
      const name = undecorate(set.name) || set.name;
      if (alnumName(name) === alnumName(component)) continue; // itself
      // Keyed by the set's own name: "Button — v2" and "🚫 Button — v1" share a
      // bare name and are two different sets, one of them retired.
      if (!seen.has(set.name)) seen.set(set.name, { name, raw: set.name, key: set.key ?? null, count: 0 });
      seen.get(set.name).count++;
    }
    // Icons arrive by the hundred and are a slot concern, not a contract each.
    const isIcon = (n) => (/icon/i.test(n) && /^(s2|s2a)/i.test(n.replace(/^[._]/, ""))) || /^b_app_/i.test(n);
    const DEPRECATED = /🚫|\bdeprecated\b/i;
    // Only a dot-prefixed hidden set is "internal" — its variants are the
    // parent's (Checkbox's .checkbox). A namespaced sub-set (MerchCard/
    // PricingDisplay) is a component in its own right that the design chose
    // to file under its parent: it gets a contract, under a derived slug.
    const internalOf = (raw) => /^[._]/.test(raw) ? "hidden (dot- or underscore-prefixed) set in Figma — its variants belong in this contract until it is published on its own" : null;
    // The judgment the schema asks for, drafted per direct dependency: a real
    // component gets `contract` (with its slug when one exists), a hidden or
    // namespaced sub-set gets `internal` with the reason, an icon rig `icon`.
    const deprecatedUse = [];
    for (const c of seen.values()) {
      if (isIcon(c.name)) { composition.push({ name: c.raw, treatment: "icon" }); continue; }
      const why = internalOf(c.raw);
      if (why) { composition.push({ name: c.raw, treatment: "internal", why }); continue; }
      const hit = (Array.isArray(contracts) ? contracts : []).find((k) => alnumName(k.name) === alnumName(c.name) || alnumName(k.slug) === alnumName(c.name));
      composition.push({ name: c.raw, treatment: "contract", slug: hit ? hit.slug : kebab(c.raw.includes("/") ? c.name : c.name) });
      if (DEPRECATED.test(c.raw)) deprecatedUse.push(c);
    }
    if (deprecatedUse.length) decisions.push({
      id: `${ab}-deprecated-dependency`,
      question: `The design still composes ${deprecatedUse.map((c) => `${c.raw}${c.count > 1 ? ` ×${c.count}` : ""}`).join(", ")} — a set the file marks deprecated. The contract names it as found; the fix is in Figma: swap the instance for the successor and re-extract.`,
      chose: "recorded the deprecated set as a contract dependency, as the design has it",
      confidence: "high",
      fix: "In Figma, swap the instance to the current set (e.g. Button — v2), then re-extract.",
      status: "open", owner: "scaffold", evidence: `${slug}.figma.evidence.json instances`,
    });
    const composed = [...seen.values()].filter((c) => !isIcon(c.name));
    const icons = [...seen.values()].length - composed.length;
    if (composed.length) {
      const known = new Set((Array.isArray(contracts) ? contracts : []).map((c) => alnumName(c.name)));
      const missing = composed.filter((c) => !known.has(alnumName(c.name)));
      const have = composed.length - missing.length;
      const list = (xs) => xs.map((c) => `${c.name}${c.count > 1 ? ` ×${c.count}` : ""}`).join(", ");
      decisions.push({
        id: `${ab}-composes`,
        question: missing.length
          ? `Built from ${composed.length} component set${composed.length === 1 ? "" : "s"}; ${missing.length} ha${missing.length === 1 ? "s" : "ve"} no contract yet: ${list(missing)}. A slot or part naming one of these fails the COMPOSITION check until it exists. Contract the leaves first, or record why each is internal to this component.`
          : `Built from ${composed.length} component set${composed.length === 1 ? "" : "s"}, all of which already have a contract: ${list(composed)}. Confirm the anatomy models them as slots or parts deliberately.`,
        chose: `recorded ${composed.length} composed set${composed.length === 1 ? "" : "s"}${have ? `, ${have} already contracted` : ""}${icons ? `; ${icons} icon set${icons === 1 ? "" : "s"} left for the icon slot` : ""}`,
        confidence: missing.length ? "high" : "medium",
        ...(missing.length ? { fix: `Scaffold each missing set first (npm run specs:scaffold -- --slug=<slug>), then declare the slot here. If a set is internal to this component — a Figma section marking it "do not use directly" is the usual tell — say so in this decision and model it as a part instead.` } : {}),
        status: missing.length ? "open" : "decided",
        ...(missing.length ? {} : { decision: `All composed sets are contracted; anatomy models them deliberately.` }),
        owner: "scaffold",
        evidence: `${slug}.figma.evidence.json instances`,
      });
    }
  }

  const importPath = `packages/components/src/${slug}/${slug}.js`;
  if (!existsSync(join(SRC, slug, `${slug}.js`))) D("code-pending", "codePending", { importPath, slug });
  else if (!existsSync(join(SRC, slug, `${slug}.code.evidence.json`))) {
    decisions.push({ id: `${ab}-code-evidence`, status: "open", confidence: "high",
      question: `${slug}.js exists but its code evidence does not, so the props below were derived from Figma alone and nothing has checked them against the component.`,
      fix: `npm run evidence:code -- --slug=${slug}, then re-scaffold or reconcile the props by hand.`,
      owner: "scaffold", evidence: `${slug}.js` });
  }

  // Triage order: least trustworthy first, so a reviewer reads the guesses before
  // the readings. Stable within a band, so related notes stay together.
  const band = { low: 0, medium: 1, high: 2 };
  decisions.forEach((d, i) => { d._i = i; });
  decisions.sort((a, b) => (band[a.confidence] ?? 1) - (band[b.confidence] ?? 1) || a._i - b._i);
  for (const d of decisions) delete d._i;

  // A prop that navigates makes the root an anchor. The archetype cannot know
  // this — "button" is the right floor either way — so it is read off the props
  // instead, and drafted rather than left for someone to notice the href being
  // silently dropped at render time.
  const NAVIGATES = /^(href|to|link|url)$/i;
  const navProp = props.find((p) => NAVIGATES.test(p.name) || NAVIGATES.test(p.code?.prop ?? ""));
  const navElement = navProp && arch.root.element && arch.root.element !== "a"
    ? { elementByProp: { prop: navProp.name, map: { "": arch.root.element, "*": "a" } } }
    : {};
  if (navProp && navElement.elementByProp) {
    decisions.push({
      id: `${ab}-navigates-as-anchor`,
      question: `"${navProp.name}" navigates, but the archetype's element is <${arch.root.element}>. Rendered as <${arch.root.element}> it is not reachable as a link, cannot be middle-clicked or opened in a new tab, and is announced with the wrong role. Should this component navigate at all?`,
      chose: `drafted elementByProp: ${navProp.name} empty -> <${arch.root.element}>, present -> <a>`,
      confidence: "medium",
      fix: `If it should never navigate, remove the "${navProp.name}" prop. If it always navigates, set anatomy.root.element to "a" and drop elementByProp.`,
      status: "open",
      owner: "scaffold",
      evidence: "WCAG 2.1.1 Keyboard",
    });
  }

  if (iconDefaults.length) decisions.push({
    id: `${ab}-icon-defaults`,
    question: `The design fills ${iconDefaults.map((d) => `the "${d.part}" slot with ${d.figma}`).join(" and ")}. The contract records the design's choice; binding it to the code icon library (packages/components/src/icons, manifest s2a-icons) is a decision — Heal in the Contract Book makes it when the names match, or set slot.default.manifest and slot.default.icon by hand.`,
    chose: "recorded the design's default instance; left the library binding open",
    confidence: "medium",
    fix: `Set anatomy.root.parts.<part>.slot.default to { "manifest": "s2a-icons", "icon": "<name>" }; add the SVG to packages/components/src/icons if it is missing, then npm run specs:assets.`,
    status: "open", owner: "scaffold", evidence: `${slug}.figma.evidence.json instances`,
  });
  // A disclosure's content is 0px tall in the closed variant because that is
  // how a design file draws "collapsed". The archetype's behaviour owns the
  // collapse (it animates it); a literal height would freeze it.
  if (archetype === "accordion" && parts.content) {
    const strip = (map) => { for (const m of Object.values(map ?? {})) { delete m?.height; delete m?.width; } };
    strip(parts.content.states); for (const e of parts.content.tokensByProp ?? []) strip(e.map); for (const e of parts.content.statesByProp ?? []) strip(e.map);
    for (const k of ["tokensByProp", "statesByProp"]) if (Array.isArray(parts.content[k])) { parts.content[k] = parts.content[k].filter((e) => Object.values(e.map ?? {}).some((m) => Object.keys(m ?? {}).length)); if (!parts.content[k].length) delete parts.content[k]; }
    if (parts.content.tokens) { delete parts.content.tokens.height; delete parts.content.tokens.width; if (!Object.keys(parts.content.tokens).length) delete parts.content.tokens; }
  }
  const rootTokens = anatomyTokens(evidence, "", arch.root.tokens);
  // A root's width is the container's, never a state's. The design draws
  // Collapsible 386px wide when open and hugging when closed; read literally
  // that made the component change width on click — the chevron slid instead
  // of the content opening. So: a root that is FIXED or FILL across in any
  // variant fills its container (width: 100%), the design's number is kept in
  // a decision, and no state or open/closed value may carry root geometry.
  {
    const stateLike = new Set(props.filter((p) => (p.type === "boolean" && p.figma?.valueMap) || (p.figma?.kind === "VARIANT" && /^(state|interaction|pseudo)s?$/i.test(String(p.figma.property).split("#")[0]))).map((p) => p.name));
    const GEOM = ["width", "height"];
    const dropGeom = (map) => { for (const g of GEOM) delete map?.[g]; };
    for (const e of rootTokens.tokensByProp ?? []) if (stateLike.has(e.prop)) for (const m of Object.values(e.map ?? {})) dropGeom(m);
    for (const e of rootTokens.statesByProp ?? []) for (const m of Object.values(e.map ?? {})) dropGeom(m);
    for (const m of Object.values(rootTokens.states ?? {})) dropGeom(m);
    for (const k of ["tokensByProp", "statesByProp"]) if (Array.isArray(rootTokens[k])) { rootTokens[k] = rootTokens[k].map((e) => ({ ...e, map: Object.fromEntries(Object.entries(e.map).filter(([, m]) => Object.keys(m ?? {}).length)) })).filter((e) => Object.keys(e.map).length); if (!rootTokens[k].length) delete rootTokens[k]; }
    const rootSizing = (evidence.anatomy?.tree?.sizing?.horizontal ?? "HUG");
    const anyWide = (evidence.variants ?? []).some((v) => (evidence.unboundValues ?? []).some((u) => u.variant === v.name && u.node === "" && u.property === "width")) || rootSizing === "FILL";
    const literal = rootTokens.tokens?.width;
    if (anyWide) {
      rootTokens.tokens = { ...(rootTokens.tokens ?? {}), width: "raw:100%" };
      decisions.push({ id: `${ab}-root-width`, question: `The set draws the component ${literal ? literal.replace(/^raw:/, "") + " wide" : "at a fixed width"} on its page. Is that the component's width, or the frame it was drawn in?`, chose: "the container's: width 100%. A component's width belongs to where it is placed; the design's number is the artboard.", confidence: "medium", fix: `If this component really has an intrinsic width, set anatomy.root.tokens.width to it${literal ? ` (${literal})` : ""}.`, status: "open", owner: "scaffold", evidence: `${slug}.figma.evidence.json variants` });
    }
  }
  // Every literal the anatomy carries, in one decision: a token gap list the
  // reviewer works through — bind it in Figma, or keep the raw: and say why.
  const rawRefs = [];
  const collect = (part, path) => {
    const maps = [["", part.tokens]];
    for (const [st, mm] of Object.entries(part.states ?? {})) maps.push([`:${st}`, mm]);
    for (const e of part.tokensByProp ?? []) for (const [val, mm] of Object.entries(e.map ?? {})) maps.push([`@${e.prop}=${val}`, mm]);
    for (const e of part.statesByProp ?? []) for (const [val, mm] of Object.entries(e.map ?? {})) maps.push([`@${e.prop}=${val}:${e.state}`, mm]);
    // display (presence), a circle's radius and box-sizing are shape and
    // structure, not values a variable could hold — not token gaps.
    const structural = (css, ref) => css === "display" || css === "box-sizing" || (css === "border-radius" && ref === "raw:50%");
    for (const [where, mm] of maps) for (const [css, ref] of Object.entries(mm ?? {})) if (String(ref).startsWith("raw:") && !structural(css, ref)) rawRefs.push(`${path} ${css}${where} = ${String(ref).slice(4)}`);
    for (const [n, child] of Object.entries(part.parts ?? {})) collect(child, `${path}/${n}`);
  };
  collect({ tokens: rootTokens.tokens, states: rootTokens.states, tokensByProp: rootTokens.tokensByProp, statesByProp: rootTokens.statesByProp, parts }, "root");
  if (rawRefs.length) decisions.push({
    id: `${ab}-hardcoded-values`,
    question: `${rawRefs.length} value${rawRefs.length === 1 ? "" : "s"} in the design ${rawRefs.length === 1 ? "is" : "are"} set with no variable behind ${rawRefs.length === 1 ? "it" : "them"}: ${rawRefs.slice(0, 6).join("; ")}${rawRefs.length > 6 ? "; …" : ""}. A literal in a contract is a token gap: bind the property to an S2A variable in Figma and re-extract, or keep the raw: value and record why here.`,
    chose: `carried ${rawRefs.length === 1 ? "it" : "them"} through as raw: value${rawRefs.length === 1 ? "" : "s"} so the render matches the file`,
    confidence: "low",
    fix: "In Figma, bind the layer's property to an S2A variable, then re-extract; or replace the raw: with a {s2a.…} token that resolves to the same value.",
    status: "open", owner: "scaffold", evidence: `${slug}.figma.evidence.json unboundValues`,
  });

  const defs = {
    $schema: "s2a-defs/1",
    component,
    slug,
    status: "curated-draft",
    curated: { by: `specs:scaffold from ${slug}.figma.evidence.json${evidence.provenance?.hash ? ` (${evidence.provenance.hash.slice(0, 15)}…)` : ""} through packages/spec-dictionary/dictionary.json (${archetype})`, date: today, reviewer: "Matt" },
    // Figma first; the archetype only when the component has nothing to say.
    // A string or absent — never null. An archetype with no template has no
    // description to fall back on, and `null` satisfies neither the schema nor
    // a reader; the field simply does not exist yet.
    ...((proseFrom(evidence.set?.description) ?? arch.description)
      ? { description: proseFrom(evidence.set?.description) ?? arch.description }
      : {}),
    // The kind, as a field rather than a sentence buried in curated.by. The
    // contract format has a closed 22-value enum for exactly this and a
    // consumer reads it to know what it is dealing with — emitting nothing
    // there was how "button" stayed a private note.
    archetype,
    // Versioning is its own thing, not prose. The fence states it, the contract
    // carries it as a field, and the description never mentions it.
    ...(/^\d+\.\d+\.\d+$/.test(evidence.set?.meta?.version ?? "") ? { version: evidence.set.meta.version } : {}),
    anchors: {
      figma: {
        fileKey: evidence.file?.key ?? "",
        kind: isSet ? "component-set" : "pattern-frame",
        nodeId: evidence.set?.id ?? "",
        nodeName: evidence.set?.name ?? setName,
        componentSetKey: isSet ? evidence.set?.key || null : null,
        deprecated: false,
        successorNodeId: null,
        usages: [],
        notes: `${isSet ? "Component set" : "Frame"} on page "${evidence.file?.page?.name?.trim() ?? "?"}"; ${evidence.counts?.nodes ?? "?"} nodes, ${evidence.counts?.bindings ?? 0} token bindings. ${isSet ? "" : "Build set from this contract produces the normalized component set; re-anchor to it once published."}`.trim(),
      },
      // "pending" means there is no component yet — it makes validate-defs skip
      // code conformance, so claiming it when the component DOES exist lets a
      // contract describe props the code has never had. Decide it from the
      // source file, not from the evidence: evidence is regenerable in a second
      // and its absence says nothing about whether the component exists.
      code: { importPath, export: component, cssClass: `c-${slug}`, ...(existsSync(join(SRC, slug, `${slug}.js`)) ? {} : { pending: true }) },
    },
    props,
    states,
    ...(composition.length ? { composition } : {}),
    anatomy: { root: { selector: `.c-${slug}`, figma: ".root", element: arch.root.element, ...navElement, ...rootTokens,
      ...(layoutFromEvidence(evidence.anatomy?.tree) ? { layout: layoutFromEvidence(evidence.anatomy.tree) } : {}), ...(arch.root.notes ? { notes: arch.root.notes } : {}), parts } },
    forbiddenCombinations: [],
    // Same rule: an object or absent. With no archetype template and nothing
    // written in the design file there is no a11y block to emit.
    ...(((a11y) => (a11y ? { a11y } : {}))((() => {
      const written = sectionFrom(evidence.set?.description, "Accessibility");
      if (!written) return arch.a11y ?? null;
      // Keep the archetype's WCAG list (it is a checklist, not prose) and add
      // what the designer actually wrote about this component.
      //
      // wcag is required by the schema, and an untemplated archetype has no
      // checklist to contribute — but the designer's own accessibility notes
      // are real content and must not be dropped on the floor because of it.
      // An empty list is the honest statement: no criteria claimed yet. The
      // untemplated-archetype decision already says the floor is missing.
      return { wcag: [], ...(arch.a11y ?? {}), notes: [...new Set([...(arch.a11y?.notes ?? []), ...bullets(written)])] };
    })())),
    decisions,
  };
  return defs;
}

async function main() {
  const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
  const slug = arg("slug");
  if (!slug) { console.error("usage: npm run specs:scaffold -- --slug=<slug> [--evidence=path] [--archetype=link-card|card|collection] [--name=Name] [--force]"); process.exit(2); }
  const inSrc = join(SRC, slug, `${slug}.figma.evidence.json`);
  const inInbox = join(EVIDENCE_DIR, `${slug}.figma.evidence.json`);
  const evidencePath = arg("evidence") ? resolve(arg("evidence")) : existsSync(inSrc) ? inSrc : inInbox;
  if (!existsSync(evidencePath)) { console.error(`no evidence for ${slug}: expected ${inSrc} or ${inInbox} (publish it from the toolkit's Extract contract first)`); process.exit(2); }
  const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
  const dir = join(SRC, slug);
  const out = join(dir, `${slug}.defs.json`);
  if (existsSync(out) && !process.argv.includes("--force")) { console.error(`${out} exists; pass --force to overwrite the draft`); process.exit(1); }
  const contracts = (() => { try { return loadContracts(ROOT); } catch { return null; } })();
  // Derive the kind before scaffolding. An explicit --archetype still wins: a
  // person reading the frame beats any decider.
  const forcedName = arg("archetype");
  const archetype = forcedName ?? await deriveArchetype(evidence, { prefer: process.argv.includes("--no-jev") ? "heuristic" : undefined });
  const defs = scaffoldDefs(evidence, { slug, name: arg("name"), archetype, contracts });
  mkdirSync(dir, { recursive: true });
  writeFileSync(out, JSON.stringify(defs, null, 2) + "\n");
  if (evidencePath !== inSrc) { copyFileSync(evidencePath, inSrc); if (evidencePath === inInbox) unlinkSync(inInbox); }
  const byConf = (c) => defs.decisions.filter((d) => d.confidence === c).length;
  const low = byConf("low"), med = byConf("medium"), high = byConf("high");
  console.log(`SCAFFOLD  ${slug.padEnd(24)} ${defs.component} as ${defs.curated.by.match(/\((\S+)\)$/)?.[1]} · ${defs.props.length} props (${defs.props.filter((p) => p.lever).length} levers) · ${Object.keys(defs.anatomy.root.parts).length} parts`);
  console.log(`          wrote ${out.replace(ROOT + "/", "")}${evidencePath !== inSrc ? ` · moved evidence beside it` : ""}`);
  console.log(`          ${defs.decisions.length} draft notes: ${low} low · ${med} medium · ${high} high confidence`);
  // The guesses are the review. Print them so the terminal is a usable triage
  // surface even before the PR body renders the same list.
  for (const d of defs.decisions.filter((x) => x.confidence === "low")) {
    console.log(`          ↳ low  ${d.id}${d.chose ? ` — chose ${d.chose}` : ""}`);
    if (d.fix) console.log(`                 fix: ${d.fix}`);
  }
  console.log(`          next: npm run defs:validate && npm run specs:build && npm run gate, then review the ${low ? "low-confidence " : ""}draft notes`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
