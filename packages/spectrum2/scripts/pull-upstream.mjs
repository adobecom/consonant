#!/usr/bin/env node
// Re-vendor Spectrum's own files from node_modules. Nothing here is authored.
//
// Why vendor at all: the code-evidence extractor reads a stylesheet and a
// template off disk, and the evidence it writes records a hash — so an upstream
// release shows up as stale rather than silently changing what our contract
// claims. Re-run after bumping a dependency.
//
// Which upstream: @adobe/spectrum-wc, the Spectrum 2 web components. Adobe's own
// component data names that package and @react-spectrum/s2 as the Spectrum 2 web
// implementations. @spectrum-css is the earlier library and carries a different
// token vocabulary (--spectrum-component-pill-edge-to-text-* against this one's
// --swc-base-padding-horizontal-*), which is why a contract written against it
// could not reproduce the S2 design file.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const PKG = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Resolved by path, not require.resolve: the package's "exports" map does not
// expose ./package.json, and these are files rather than modules anyway.
const WC = join(PKG, "node_modules", "@adobe", "spectrum-wc");
const VERSION = JSON.parse(readFileSync(join(WC, "package.json"), "utf8")).version;
const DIST = join(WC, "dist");

const header = (from) => `/* Vendored from @adobe/spectrum-wc@${VERSION} — ${from}.
   Not ours and not edited. Staged here only so the code-evidence extractor can
   read it; the evidence records a hash, so an upstream change shows up as stale
   rather than silently drifting. Regenerate with: npm run pull -w @s2a/spectrum2 */
`;

// One standalone stylesheet per component that ships one. Components whose
// styles live inside their Lit class (badge, icon) have no file to vendor and
// are listed so the gap is visible rather than forgotten.
const STYLESHEETS = { button: "global-button.css" };

for (const [slug, file] of Object.entries(STYLESHEETS)) {
  const src = join(DIST, file);
  if (!existsSync(src)) { console.error(`MISS   ${file} — upstream layout changed`); continue; }
  const dir = join(PKG, "src", slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}.css`), header(file) + readFileSync(src, "utf8"));
  console.log(`VENDOR src/${slug}/${slug}.css  <- ${file}`);
}
// Components that ship no global-*.css keep their stylesheet inside a Lit
// module: `import { css as e } from "lit"; var t = e`…`;`. The CSS is real and
// complete, just wrapped, so it is unwrapped rather than skipped — otherwise the
// evidence extractor sees no stylesheet at all and the contract has nothing to
// check its anatomy against.
//
// These sheets are written for a shadow root, so their rules are `:host` rather
// than a class. They are vendored exactly as shipped; re-expressing them on a
// class is the contract's job, not this script's.
const LIT_STYLESHEETS = {
  avatar: "components/avatar/avatar.js",
  badge: "components/badge/badge.js",
  icon: "stylesheets/_lit-styles/icon-base.js",
  divider: "components/divider/divider.js",
  card: "components/card/card.js",
  "button-group": "components/button-group/button-group.js",
};
const unwrap = (js) => {
  const open = js.indexOf("`"), close = js.lastIndexOf("`");
  if (open < 0 || close <= open) return null;
  return js.slice(open + 1, close).replace(/\\(["'`\\])/g, "$1").replace(/\\n/g, "\n");
};
for (const [slug, rel] of Object.entries(LIT_STYLESHEETS)) {
  const src = join(DIST, rel);
  if (!existsSync(src)) { console.error(`MISS   ${rel} — upstream layout changed`); continue; }
  const css = unwrap(readFileSync(src, "utf8"));
  if (!css) { console.error(`MISS   ${rel} — no css template found`); continue; }
  const dir = join(PKG, "src", slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}.css`), header(`${rel} (the css\`\` template, unwrapped)`) + css + "\n");
  console.log(`VENDOR src/${slug}/${slug}.css  <- ${rel}`);
}

// The component module itself. Not for its props — it is minified and its
// properties are installed by decorators — but so the vendored tree is the
// Spectrum 2 component and not a leftover from the earlier library. Leaving the
// old @spectrum-css template.js in place meant the extractor kept reading it and
// reported that library's surface (rootClass, iconSet, customStyles) as if it
// were Spectrum 2's.
const MODULES = {
  avatar: "components/avatar/Avatar2.js",
  badge: "components/badge/Badge2.js",
  button: "components/button/Button2.js",
  icon: "components/icon/Icon.js",
  divider: "components/divider/Divider2.js",
  card: "components/card/Card2.js",
  "button-group": "components/button-group/ButtonGroup.js",
};
for (const [slug, rel] of Object.entries(MODULES)) {
  const src = join(DIST, rel);
  if (!existsSync(src)) { console.error(`MISS   ${rel} — upstream layout changed`); continue; }
  const dir = join(PKG, "src", slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}.js`), header(rel) + readFileSync(src, "utf8"));
  console.log(`VENDOR src/${slug}/${slug}.js   <- ${rel}`);
}

// The prop surface comes from the shipped type declarations, not from the
// JavaScript. These are Lit web components: the compiled class is minified and
// its properties are applied by decorators, while the .d.ts states every public
// property with its type, its default and a sentence of documentation, and the
// .types.d.ts holds the exact enum each one accepts. It is the better evidence —
// a declaration file is part of the package's public contract.
const DECLARATIONS = {
  avatar: [
    ["@adobe/spectrum-wc", "dist/components/avatar/Avatar.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/avatar/Avatar.base.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/avatar/Avatar.types.d.ts"],
  ],
  badge: [
    ["@adobe/spectrum-wc", "dist/components/badge/Badge.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/badge/Badge.base.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/badge/Badge.types.d.ts"],
  ],
  icon: [
    ["@adobe/spectrum-wc", "dist/components/icon/Icon.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/icon/Icon.base.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/icon/Icon.types.d.ts"],
  ],
  divider: [
    ["@adobe/spectrum-wc", "dist/components/divider/Divider.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/divider/Divider.base.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/divider/Divider.types.d.ts"],
  ],
  card: [
    ["@adobe/spectrum-wc", "dist/components/card/Card.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/card/Card.base.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/card/Card.types.d.ts"],
  ],
  "button-group": [
    ["@adobe/spectrum-wc", "dist/components/button-group/ButtonGroup.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/button-group/ButtonGroup.base.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/button-group/ButtonGroup.types.d.ts"],
  ],
  button: [
    ["@adobe/spectrum-wc", "dist/components/button/Button.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/button/Button.base.d.ts"],
    ["@adobe/spectrum-wc-core", "dist/components/button/Button.types.d.ts"],
    // The mixins the class composes. Their properties are public surface too —
    // `pending` is a documented Button option but is declared here, not on the
    // class, so leaving them out made the contract look as if it had no pending
    // state while the design file and Adobe's component data both list one.
    ["@adobe/spectrum-wc-core", "dist/mixins/pending-mixin.d.ts"],
  ],
};
for (const [slug, files] of Object.entries(DECLARATIONS)) {
  const parts = [];
  for (const [pkg, rel] of files) {
    const src = join(PKG, "node_modules", ...pkg.split("/"), ...rel.split("/"));
    if (!existsSync(src)) { console.error(`MISS   ${pkg}/${rel}`); continue; }
    parts.push(`/* ---- ${pkg}/${rel} ---- */\n` + readFileSync(src, "utf8"));
  }
  if (!parts.length) continue;
  writeFileSync(join(PKG, "src", slug, `${slug}.d.ts`), header("the shipped type declarations") + parts.join("\n"));
  console.log(`VENDOR src/${slug}/${slug}.d.ts  <- ${files.length} declaration file(s)`);
}

// The token layer, split into the file names the resolver's lookup chain expects.
//
// Two files, not one, and the second is not optional. tokens.css declares every
// value twice behind a space toggle:
//
//   --swc-component-height-100: var(--swc-theme--sizeM, 32px) var(--swc-theme--sizeL, 40px);
//
// With neither axis variable set, that resolves to "32px 40px" — not a length,
// so the declaration is dropped and the component renders at no size at all.
// swc.css is what collapses it to one value, and it also sets the color-scheme
// the light-dark() colours read. Vendoring tokens.css alone silently produced a
// button with no height, no radius and no padding.
mkdirSync(join(PKG, "tokens"), { recursive: true });
copyFileSync(join(DIST, "tokens.css"), join(PKG, "tokens", "tokens.primitives.css"));
const setup = readFileSync(join(DIST, "swc.css"), "utf8").replace(/@import[^;]+;/g, "");
writeFileSync(join(PKG, "tokens", "tokens.semantic.css"), header("swc.css (theme and scale setup)") + setup);
for (const f of ["tokens.semantic.light.css", "tokens.semantic.dark.css"]) {
  writeFileSync(join(PKG, "tokens", f), `/* Spectrum 2 themes with color-scheme and light-dark(); see tokens.semantic.css. */\n`);
}
console.log(`VENDOR tokens/tokens.primitives.css  <- tokens.css`);
console.log(`VENDOR tokens/tokens.semantic.css    <- swc.css (scale toggle + color-scheme)`);
console.log(`\n@adobe/spectrum-wc@${VERSION}`);
