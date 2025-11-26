function toSlug(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
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

  if (/^(['"]).*\1$/u.test(string)) {
    return string;
  }

  if (/\s/u.test(string)) {
    return `"${string.replace(/"/g, '\\"')}"`;
  }

  return string;
}

module.exports = {
  toSlug,
  determineBaseSlug,
  quoteFontFamily,
};

