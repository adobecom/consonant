// Parse the generated CSS, preserving aliases. These helpers also run in Node tests.
export function parseTokens(css, layer, source) {
  return Object.fromEntries(
    [
      ...css.matchAll(
        /(--s2a-[\w-]+)\s*:\s*([^;{}]+);(?:[ \t]*\/\*\*?\s*([^]*?)\*\/)?/g,
      ),
    ].map(([, name, value, description]) => [
      name,
      {
        name,
        value: value.trim(),
        description: (description || "").trim(),
        layer,
        source,
      },
    ]),
  );
}

export function resolveToken(name, tokens, seen = new Set()) {
  if (seen.has(name) || !tokens[name]) return null;
  const next = new Set(seen).add(name);
  let missing = false;
  const value = tokens[name].value.replace(
    /var\((--s2a-[\w-]+)\)/g,
    (_, ref) => {
      const resolved = resolveToken(ref, tokens, next);
      if (resolved === null) missing = true;
      return resolved ?? ref;
    },
  );
  return missing || value.includes("var(") ? null : value;
}

export function traceToken(name, tokens, seen = new Set()) {
  if (seen.has(name))
    return [{ name, missing: true, label: "Circular reference" }];
  const token = tokens[name];
  if (!token) return [{ name, missing: true, label: "Not in this build" }];
  const refs = [...token.value.matchAll(/var\((--s2a-[\w-]+)\)/g)].map(
    (m) => m[1],
  );
  return [
    ...refs.flatMap((ref) => traceToken(ref, tokens, new Set(seen).add(name))),
    token,
  ].filter(
    (item, i, all) => all.findIndex((other) => other.name === item.name) === i,
  );
}

export function pixels(value) {
  if (!value || !/^-?[\d.]+(?:rem|px)?$/.test(value)) return null;
  return Number.parseFloat(value) * (value.endsWith("rem") ? 16 : 1);
}

export function modeAt(width, ranges) {
  return ranges.reduce(
    (mode, range) => (width >= range.min ? range.id : mode),
    ranges[0].id,
  );
}
