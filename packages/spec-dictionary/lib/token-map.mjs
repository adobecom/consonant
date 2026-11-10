// token-map.mjs — the thin layer at the render boundary.
//
// Pure: takes the parsed lib/token-map.json and answers "what does this Spectrum
// variable become in Milo?". The renderers are also bundled for the browser, so
// nothing here touches the disk; render.mjs reads the file and passes it in.
//
// An alias becomes var(--s2a-*). Anything else becomes Spectrum's own value as a
// literal with its reason beside it, so the render never guesses a token and the
// open decision is visible in the generated CSS.

/** @param {{ rows: Array<{ swc: string, outcome: string, target: string|null, literal: string|null }> }} map */
export function tokenAdapter(map) {
  const rows = new Map(map.rows.map((r) => [r.swc, r]));
  const adapt = (cssVar) => {
    const row = rows.get(cssVar);
    // Refused, not guessed: a name the map has never seen means the map is stale.
    if (!row) throw new Error(`token map has no row for ${cssVar}; run npm run tokens:map`);
    if (row.outcome === "unresolved") throw new Error(`${cssVar} has no value to render: ${row.why}`);
    if (row.outcome === "alias") return { css: `var(${row.target})`, reason: null };
    return { css: row.literal, reason: `hardcoded: ${row.outcome} ${cssVar}` };
  };
  adapt.source = "--swc-";
  return adapt;
}
