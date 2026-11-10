// systems.mjs — what a design system has to declare, once.
//
// The pipeline is system-neutral; these are the values that differ. Every
// script that used to carry its own copy (the Spectrum build, the golden sheet,
// the matrix parity, the renderers) reads this instead, so adding a third
// system is one entry here and nothing else.
//
//   src          the component tree: <src>/<slug>/<slug>.{defs,code.evidence,figma.evidence}.json
//   out          where the build writes stories.manifest.json and friends
//   ns           the contract namespace: contracts are `<ns>.<slug>`
//   tokenNs      the token namespace: references are `{<tokenNs>.…}`, variables `--<tokenNs>-…`
//   tokensDir    the token build the references resolve against
//   tokens()     the resolver, with any extra tier the system has
//   assets       a directory of sample art the contracts' slot defaults name (`assets/<file>`)
//   storybook    how this system's stories are titled, where they are written, and
//                which renderer draws them — our own components are generated
//                from the contract (lit); a shipped library is mounted as it
//                ships (upstream)
//   build        the command that rebuilds one contract (what the Book runs on sign-off)
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadShippedTokens, parseTokenCss } from "./lib/tokens.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, "..", "..");

/**
 * Spectrum has a tier our own system does not: a component's own stylesheet
 * declares `--swc-<component>-*` properties, several derived by calc() from its
 * height. They are real, documented Spectrum tokens, so the vendored component
 * CSS is read as one extra, lowest-priority tier and a contract can reference
 * them instead of hardcoding the numbers calc() produces.
 */
function componentTier(src) {
  const map = new Map();
  for (const slug of existsSync(src) ? readdirSync(src) : []) {
    const css = join(src, slug, `${slug}.css`);
    if (existsSync(css)) for (const [k, v] of parseTokenCss(readFileSync(css, "utf8"))) if (!map.has(k)) map.set(k, v);
  }
  return map;
}
const COMPONENT_TIER = "tokens.component.css";
// Tokens S2 does not have, written by us. See the file's own header.
const LAYER_TIER = "tokens.layer.css";

export const SYSTEMS = {
  s2a: {
    id: "s2a",
    src: join(ROOT, "packages", "components", "src"),
    out: join(ROOT, "packages", "spec-dictionary", "out"),
    ns: "s2a",
    tokenNs: "s2a",
    tokensDir: join(ROOT, "dist", "packages", "tokens", "css", "dev"),
    tokens() { return loadShippedTokens(this.tokensDir); },
    assets: null,
    storybook: { title: "Generated", dir: "apps/storybook/stories/generated", renderer: "lit" },
    build: (slug) => `npm run specs:build -- --slug=${slug}`,
  },
  spectrum: {
    id: "spectrum",
    src: join(ROOT, "packages", "spectrum2", "src"),
    out: join(ROOT, "packages", "spectrum2", "out"),
    ns: "spectrum",
    tokenNs: "swc",
    tokensDir: join(ROOT, "packages", "spectrum2", "tokens"),
    tokens() { return loadShippedTokens(this.tokensDir, { files: { [COMPONENT_TIER]: componentTier(this.src) }, extraChain: [COMPONENT_TIER, LAYER_TIER] }); },
    assets: join(ROOT, "packages", "spectrum2", "assets"),
    storybook: {
      title: "Spectrum", dir: "apps/storybook/stories/spectrum", renderer: "upstream",
      // The package's `components/<name>` entry exports the class only; the
      // custom element is registered by `components/<name>/swc-<name>.js`.
      register: (importPath, tag) => `${importPath}/${tag}.js`,
      // The grounds a story can sit on. `canvas` is the application
      // background; `layer` is one step up, for a variant that paints in the
      // canvas colour and would otherwise be invisible (Avatar's outline ring
      // is gray-25 on gray-25 — it exists for avatars that overlap).
      canvas: "{swc.gray.25}",
      layer: "{swc.gray.100}",
    },
    build: (slug) => `node packages/spectrum2/scripts/build.mjs --slug=${slug}`,
  },
};

/**
 * Resolve a slug that may name another system: `badge` is ours, `spectrum:badge`
 * is Spectrum's. Returns { system, slug, key } where key is the composite form
 * the goldens are filed under, or null for a system nobody declared.
 */
export function locate(slug) {
  const i = String(slug).indexOf(":");
  if (i < 0) return { system: SYSTEMS.s2a, slug, key: slug };
  const system = SYSTEMS[slug.slice(0, i)];
  if (!system) return null;
  const name = slug.slice(i + 1);
  return { system, slug: name, key: `${system.id}:${name}` };
}

/** buildOne() options for a system. */
export function buildOpts(system) {
  return { src: system.src, ns: system.ns, out: system.out, tokens: system.tokens() };
}

/** The slugs a system has contracts for. */
export function slugsOf(system) {
  return existsSync(system.src) ? readdirSync(system.src).filter((d) => existsSync(join(system.src, d, `${d}.defs.json`))).sort() : [];
}
