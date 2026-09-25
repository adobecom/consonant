// Shipped-token reader: resolves {s2a.path.to.token} references against the
// built token CSS (dist/packages/tokens/css/dev), following var() chains into
// the primitives, per theme and breakpoint mode.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export const refToVar = (ref) => "--" + ref.replace(/^\{|\}$/g, "").replace(/\./g, "-");
export const refToFigma = (ref) => ref.replace(/^\{|\}$/g, "").replace(/\./g, "/");
export const REF = /\{s2a\.[a-z0-9.-]+\}/g;

export function loadShippedTokens(dir) {
  const files = {};
  if (!existsSync(dir)) return { files, names: new Set(), resolve: () => ({ shipped: false }) };
  for (const f of readdirSync(dir)) {
    const map = new Map();
    for (const m of readFileSync(join(dir, f), "utf8").matchAll(/(--s2a-[a-z0-9_-]+)\s*:\s*([^;]+);/g)) map.set(m[1], m[2].trim());
    files[f] = map;
  }
  const names = new Set(Object.values(files).flatMap((m) => [...m.keys()]));
  // Lookup order per mode: mode-specific semantic → shared semantic → primitives.
  const chains = {
    light: ["tokens.responsive.xl.css", "tokens.semantic.light.css", "tokens.semantic.css", "tokens.primitives.light.css", "tokens.primitives.css"],
    dark: ["tokens.responsive.xl.css", "tokens.semantic.dark.css", "tokens.semantic.css", "tokens.primitives.light.css", "tokens.primitives.css"],
    sm: ["tokens.responsive.sm.css", "tokens.semantic.light.css", "tokens.semantic.css", "tokens.primitives.light.css", "tokens.primitives.css"],
  };
  function lookup(name, mode) {
    for (const f of chains[mode]) { const v = files[f]?.get(name); if (v !== undefined) return v; }
    return undefined;
  }
  function resolveVar(name, mode, depth = 0) {
    const raw = lookup(name, mode);
    if (raw === undefined) return undefined;
    if (depth > 12) return raw;
    return raw.replace(/var\((--s2a-[a-z0-9_-]+)(?:\s*,\s*([^)]+))?\)/g, (_, inner, fallback) => resolveVar(inner, mode, depth + 1) ?? fallback ?? `var(${inner})`);
  }
  return {
    files, names,
    resolve(ref) {
      const name = refToVar(ref);
      if (!names.has(name)) return { ref, cssVar: name, figma: refToFigma(ref), shipped: false };
      const light = resolveVar(name, "light"), dark = resolveVar(name, "dark"), sm = resolveVar(name, "sm");
      const out = { ref, cssVar: name, figma: refToFigma(ref), shipped: true, value: light };
      if (dark !== light) out.dark = dark;
      if (sm !== light) out.sm = sm;
      return out;
    },
  };
}
