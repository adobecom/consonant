// token-index.ts — build the AUTHORITATIVE token index from the BUILT CSS.
//
// Why the built CSS and not the source JSON:
//   - The primitive/semantic split is clean by file: anything DEFINED in
//     tokens.primitives*.css is a design-only primitive; anything in
//     tokens.semantic*/responsive*.css is a shippable semantic token. (The source
//     JSON's `hiddenFromPublishing` flag over-flags semantic tokens, so it's the
//     wrong signal.)
//   - The built CSS is what actually ships, so it's the true registry of valid
//     --s2a-* custom properties.
//
// Note: component tokens are often defined *locally* inside a component's own CSS
// (context aliases), so validateCss also learns definitions from the file under
// test — see validate-css.ts.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

export interface TokenIndex {
  /** cssProp names defined in the primitives CSS (design-only). */
  primitive: Set<string>;
  /** every cssProp name defined in the shipped token CSS. */
  known: Set<string>;
}

/** Matches a custom-property DEFINITION: `--s2a-foo: value`. */
const DEF_RE = /(--s2a-[a-z0-9-]+)\s*:/g;

/** Load the token index from the built token CSS under a repo root. */
export function loadTokenIndex(dsRoot: string): TokenIndex {
  const dir = resolve(dsRoot, "dist/packages/tokens/css/dev");
  const primitive = new Set<string>();
  const known = new Set<string>();

  if (!existsSync(dir)) {
    throw new Error(`[s2a-validators] built token CSS not found at ${dir}. Run the token build first.`);
  }

  for (const fileName of readdirSync(dir)) {
    if (!fileName.endsWith(".css")) continue;
    const isPrimitiveFile = fileName.startsWith("tokens.primitives");
    const css = readFileSync(join(dir, fileName), "utf-8");
    for (const m of css.matchAll(DEF_RE)) {
      const name = m[1];
      known.add(name);
      if (isPrimitiveFile) primitive.add(name);
    }
  }

  return { primitive, known };
}
