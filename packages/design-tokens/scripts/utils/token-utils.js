function isTokenGroup(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !("$value" in value)
  );
}

function clone(value) {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function isNumericKey(key) {
  return /^\d+(?:\.\d+)?$/u.test(key);
}

function findNumericKey(map, value) {
  if (map.has(value)) {
    return map.get(value);
  }

  for (const [storedValue, key] of map.entries()) {
    if (Math.abs(storedValue - value) < 1e-6) {
      return key;
    }
  }

  return undefined;
}

function mergeTokens(target, source, path = []) {
  for (const [key, value] of Object.entries(source)) {
    const currentPath = [...path, key];

    if (isTokenGroup(value)) {
      if (!isTokenGroup(target[key])) {
        target[key] = {};
      }
      mergeTokens(target[key], value, currentPath);
    } else {
      // Silently overwrite duplicate tokens - this is expected when merging
      // multiple token files that may have overlapping definitions.
      // The latest value (from source) will be used, which is the desired behavior.
      target[key] = clone(value);
    }
  }

  return target;
}

function mergeTokenTrees(baseTokens, overrideTokens) {
  return mergeTokens(baseTokens, overrideTokens, []);
}

function collectColorPaths(node, path, paths) {
  if (!node || typeof node !== "object") {
    return;
  }

  if ("$value" in node) {
    // This is a token - if it's a color, record its path
    if (path[0] === "color") {
      paths.add(path.join("."));
    }
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) {
      continue;
    }
    collectColorPaths(value, [...path, key], paths);
  }
}

function extractColorTokens(source, sourcePath, target, targetPath) {
  if (!source || typeof source !== "object") {
    return;
  }

  if ("$value" in source) {
    // This is a token - if it's a color, copy it to target
    if (sourcePath[0] === "color") {
      let cursor = target;
      for (let i = 0; i < targetPath.length - 1; i++) {
        if (!cursor[targetPath[i]]) {
          cursor[targetPath[i]] = {};
        }
        cursor = cursor[targetPath[i]];
      }
      cursor[targetPath[targetPath.length - 1]] = clone(source);
    }
    return;
  }

  for (const [key, value] of Object.entries(source)) {
    if (key.startsWith("$")) {
      continue;
    }
    extractColorTokens(value, [...sourcePath, key], target, [
      ...targetPath,
      key,
    ]);
  }
}

module.exports = {
  isTokenGroup,
  clone,
  isNumericKey,
  findNumericKey,
  mergeTokens,
  mergeTokenTrees,
  collectColorPaths,
  extractColorTokens,
};
