/** Resolve at the point of use for APIs such as D3 that need concrete values. */
export function tokenValue(name, element = document.documentElement) {
  const value = getComputedStyle(element)
    .getPropertyValue(`--s2a-${name}`)
    .trim();
  if (!value) throw new Error(`Missing design token: --s2a-${name}`);
  return value;
}
