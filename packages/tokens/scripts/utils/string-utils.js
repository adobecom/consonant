/**
 * Normalizes a string for use as a token path segment.
 * Preserves underscores (used in Figma for decimal points, e.g. neg_3_84).
 * Replaces other non-alphanumeric chars with hyphens.
 */
function toSlug(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/_+/g, "_"); // Collapse multiple underscores
  return normalized || "token";
}

function determineBaseSlug(slugs, baseModeEnv = null) {
  const preferred = [
    baseModeEnv,
    "mode-1",
    "default",
    "base",
    "light",
  ];
  for (const candidate of preferred) {
    if (!candidate) {
      continue;
    }
    const normalized = toSlug(candidate);
    if (slugs.includes(normalized)) {
      return normalized;
    }
  }
  return slugs[0];
}

function quoteFontFamily(value) {
  const string = String(value).trim();

  if (string === "") {
    return "";
  }

  if (/^(['"]).*\1$/u.test(string)) {
    return string;
  }

  // Always quote to prevent multi-word families (e.g. "Adobe Clean") being parsed
  // as separate identifiers. Single-word families are also quoted for consistency.
  return `"${string.replace(/"/g, '\\"')}"`;
}

module.exports = {
  toSlug,
  determineBaseSlug,
  quoteFontFamily,
};

