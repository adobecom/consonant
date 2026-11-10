// token-subset.mjs — only the tokens a component reaches, nothing else.
//
// Spectrum's token build is about 130 KB. A Milo page needs the handful a card
// uses, so the render boundary records every variable it writes, walks each one
// down to its literals, and emits those definitions and no others. Renamed from
// Spectrum's `--swc-*` to one prefix, so the page depends on no Adobe stylesheet
// and cannot collide with `--s2a-*`, which Milo already loads at its own version.
//
// Spectrum sizes through "space toggles": var(--swc-theme--sizeM, 14px)
// var(--swc-theme--sizeL, 17px), collapsed by a stylesheet we do not load. The
// S2 Figma library only has the Desktop scale, so the M value is the value.
//
// Pure, like token-map.mjs: render.mjs reads the files and passes them in.

export const PREFIX = "--s2-";
const SOURCE = "--swc-";
const rename = (name) => PREFIX + name.slice(SOURCE.length);
const VAR = /var\(\s*(--swc-[a-z0-9_-]+)/g;

/** Text inside the balanced parens that open at `open`. */
function closing(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")" && --depth === 0) return i;
  }
  throw new Error(`unbalanced parens in token value: ${text}`);
}

/** Keep the sizeM value of a space toggle, drop the sizeL half. */
export function collapseToggles(value) {
  let out = String(value), m;
  while ((m = /var\(\s*--swc-theme--size([ML])\s*,/.exec(out))) {
    const open = m.index + 3;
    const end = closing(out, open);
    const inner = out.slice(m.index + m[0].length, end).trim();
    out = out.slice(0, m.index) + (m[1] === "M" ? inner : "") + out.slice(end + 1);
  }
  return out.replace(/\s+/g, " ").trim();
}

/**
 * @param {Record<string, Map<string, string>>} files the system's parsed token files
 * @returns the adapter css.mjs takes, plus `.used` and `.css()`
 */
export function tokenSubset(files) {
  const lookup = (name) => {
    for (const map of Object.values(files)) { const v = map.get(name); if (v !== undefined) return v; }
    return undefined;
  };
  const used = new Set();
  const adapt = (cssVar) => {
    // A raw value can name something that is not a token of this system.
    if (!cssVar.startsWith(SOURCE)) return { css: `var(${cssVar})`, reason: null };
    // Refused, not guessed: a name the build does not define renders as nothing.
    if (lookup(cssVar) === undefined) throw new Error(`${cssVar} is not in the token build`);
    used.add(cssVar);
    return { css: `var(${rename(cssVar)})`, reason: null };
  };
  adapt.source = SOURCE;
  adapt.used = used;
  return adapt;
}

/** The definitions for a set of `--swc-*` names and everything they lean on. */
export function subsetCss(files, names, { header = "" } = {}) {
  const lookup = (name) => {
    for (const map of Object.values(files)) { const v = map.get(name); if (v !== undefined) return v; }
    return undefined;
  };
  const defs = new Map();
  const visit = (name) => {
    if (defs.has(name)) return;
    const raw = lookup(name);
    if (raw === undefined) throw new Error(`${name} is not in the token build`);
    const value = collapseToggles(raw);
    defs.set(name, value.replace(/--swc-/g, PREFIX));
    for (const m of value.matchAll(VAR)) visit(m[1]);
  };
  [...names].forEach(visit);
  const lines = [...defs.keys()].sort().map((n) => `  ${rename(n)}: ${defs.get(n)};`);
  return { count: defs.size, css: `${header}:root {\n${lines.join("\n")}\n}\n\n/* Colours are light-dark() pairs, so a section only has to say which it is. */\n.light {\n  color-scheme: light;\n}\n\n.dark {\n  color-scheme: dark;\n}\n` };
}
