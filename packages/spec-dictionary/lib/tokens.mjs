// Shipped-token reader: resolves {s2a.path.to.token} references against the
// built token CSS (dist/packages/tokens/css/dev), following var() chains into
// the primitives, per theme and breakpoint mode.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export const refToVar = (ref) => "--" + ref.replace(/^\{|\}$/g, "").replace(/\./g, "-");
export const refToFigma = (ref) => ref.replace(/^\{|\}$/g, "").replace(/\./g, "/");
/**
 * A token reference, in any design system's namespace.
 *
 * The first segment names the system — `s2a` for ours, `spectrum` for a contract
 * that describes Adobe's Spectrum 2 — and matches what defs.schema.json accepts
 * and what southleft/contract.schema.json has always accepted. Widening this is
 * safe for us: every S2A reference still matches, and a name the token build
 * does not know already comes back `shipped: false` rather than throwing.
 *
 * It is not cosmetic. buildIR resolves token maps through this regex, so a
 * reference it does not match is silently dropped — no resolved value, no CSS
 * declaration, and a component that renders with its colour and sizing missing.
 */
export const REF = /\{[a-z][a-z0-9-]*\.[a-z0-9.-]+\}/g;

/**
 * One token CSS file's declarations: `--name: value` pairs, nothing else.
 *
 * Any custom-property prefix, for the same reason REF above takes any namespace:
 * a Spectrum token build declares `--spectrum-*`, and a parser that only knew
 * `--s2a-*` returned an empty map, so every Spectrum reference resolved to
 * `shipped: false` with no error anywhere. These are token files, so a wider
 * match only ever reads more token names.
 */
const DECL = /(--[a-z][a-z0-9_-]*)\s*:\s*([^;]+);/g;
export function parseTokenCss(css) {
  const map = new Map();
  for (const m of String(css).matchAll(DECL)) map.set(m[1], m[2].trim());
  return map;
}

/**
 * The Node entry: read the shipped token CSS off disk, then hand the parsed
 * files to the pure resolver. Everything that decides what a token resolves
 * to lives in tokensFromFiles so a browser — which cannot read a directory —
 * runs the identical lookup chain on the identical data.
 */
export function loadShippedTokens(dir, opts) {
  const files = {};
  if (!existsSync(dir)) return tokensFromFiles(files, opts);
  for (const f of readdirSync(dir)) files[f] = parseTokenCss(readFileSync(join(dir, f), "utf8"));
  return tokensFromFiles({ ...files, ...(opts?.files ?? {}) }, opts);
}

/**
 * The resolver, from already-parsed files: `{ "tokens.semantic.css": Map }`.
 * Plain objects of name -> value are accepted too, so a JSON snapshot of the
 * token files (what the Contract Book bundles) needs no re-wrapping.
 */
/**
 * @param {Record<string, Map<string, string> | Record<string, string>>} input
 * @param {{ extraChain?: string[] }} [opts]
 */
export function tokensFromFiles(input, { extraChain = [] } = {}) {
  const files = {};
  for (const [f, v] of Object.entries(input ?? {})) files[f] = v instanceof Map ? v : new Map(Object.entries(v ?? {}));
  const names = new Set(Object.values(files).flatMap((m) => [...m.keys()]));
  // Lookup order per mode: mode-specific semantic → shared semantic → primitives.
  // `extraChain` is appended last in every mode: a tier consulted only when the
  // global files do not define a name. Spectrum has a component tier our own
  // system does not — `--spectrum-button-min-width` and
  // `--spectrum-button-border-radius` are declared in the component's own
  // stylesheet, derived by calc() from its height. They are real, documented
  // Spectrum tokens, so a contract should be able to reference them; without
  // this they resolved to `shipped: false` and the contract had to hardcode the
  // numbers that calc() produces. Appended rather than prepended so a component
  // tier can never shadow a global token of the same name.
  const chains = {
    light: ["tokens.responsive.xl.css", "tokens.semantic.light.css", "tokens.semantic.css", "tokens.primitives.light.css", "tokens.primitives.css", ...extraChain],
    dark: ["tokens.responsive.xl.css", "tokens.semantic.dark.css", "tokens.semantic.css", "tokens.primitives.light.css", "tokens.primitives.css", ...extraChain],
    sm: ["tokens.responsive.sm.css", "tokens.semantic.light.css", "tokens.semantic.css", "tokens.primitives.light.css", "tokens.primitives.css", ...extraChain],
  };
  function lookup(name, mode) {
    for (const f of chains[mode]) { const v = files[f]?.get(name); if (v !== undefined) return v; }
    return undefined;
  }
  function resolveVar(name, mode, depth = 0) {
    const raw = lookup(name, mode);
    if (raw === undefined) return undefined;
    if (depth > 12) return raw;
    // Follows a var() chain in any namespace, for the same reason as DECL.
    return raw.replace(/var\((--[a-z][a-z0-9_-]*)(?:\s*,\s*([^)]+))?\)/g, (_, inner, fallback) => resolveVar(inner, mode, depth + 1) ?? fallback ?? `var(${inner})`);
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
