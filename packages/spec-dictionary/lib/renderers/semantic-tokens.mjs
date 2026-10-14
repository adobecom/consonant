// Exact, non-color aliases only. Equal color values do not imply equal roles:
// a component binding must retain its light/dark behavior and state intent.
const families = {
  spacing: { 0: 'none', 2: '3xs', 4: '2xs', 8: 'xs', 12: 'sm', 16: 'md', 24: 'lg', 32: 'xl', 40: '2xl', 48: '3xl', 64: '4xl' },
  'border-radius': { 0: 'none', 2: '3xs', 4: '2xs', 8: 'xs', 12: 'sm', 16: 'md', 22: 'lg', 32: 'xl', 999: 'round' },
  'border-width': { 1: 'sm', 2: 'md', 4: 'lg' },
  'font-size': { 12: 'xs', 14: 'sm', 16: 'md', 18: 'lg', 20: 'xl', 24: '2xl', 32: '3xl', 36: '4xl', 40: '5xl', 48: '6xl', 56: '7xl', 64: '8xl', 72: '9xl', 80: '10xl', 96: '11xl' },
  'font-line-height': { 16: '2xs', 18: 'xs', 20: 'sm', 24: 'md', 32: 'lg', 40: 'xl', 48: '2xl', 56: '3xl', 69: '4xl', 76: '5xl', 92: '6xl' },
  blur: { 8: 'xs', 16: 'sm', 32: 'md', 64: 'lg' },
};
const named = {
  '--s2a-font-family-adobe-clean': '--s2a-font-family-body',
  '--s2a-font-family-adobe-clean-display': '--s2a-font-family-heading',
  '--s2a-font-weight-adobe-clean-regular': '--s2a-font-weight-body',
  '--s2a-font-weight-adobe-clean-bold': '--s2a-font-weight-label',
  '--s2a-font-weight-adobe-clean-display-black': '--s2a-font-weight-heading',
  '--s2a-opacity-48': '--s2a-opacity-disabled',
};
export function semanticAlias(name) {
  if (named[name]) return named[name];
  const match = name.match(/^--s2a-(spacing|border-radius|border-width|font-size|font-line-height|blur)-(\d+)$/);
  const suffix = match && families[match[1]][match[2]];
  return suffix ? `--s2a-${match[1]}-${suffix}` : name;
}
export const isPrimitive = (name) => /^--s2a-(?:color-(?:gray|blue|red|green|orange|yellow|purple|pink|transparent-(?:white|black))-\d+|(?:spacing|border-radius|border-width|font-size|font-line-height|opacity|blur)-\d+|font-(?:family|weight)-adobe-clean(?:-[\w-]+)?)$/.test(name);

export function semanticLiteral(property, value) {
  let family;
  if (/^(?:padding|margin|gap|row-gap|column-gap)(?:-|$)/.test(property)) family = 'spacing';
  else if (/radius$/.test(property)) family = 'border-radius';
  else if (/^(?:border-width|outline-width|outline-offset)$/.test(property) || /^--.*-bw$/.test(property)) family = 'border-width';
  else if (property === 'font-size') family = 'font-size';
  else if (property === 'line-height') family = 'font-line-height';
  if (!family) return value;
  return value.replace(/(?<![\w.-])(\d+)px\b/g, (literal, number) => {
    const suffix = families[family][number];
    return suffix ? `var(--s2a-${family}-${suffix})` : literal;
  });
}
