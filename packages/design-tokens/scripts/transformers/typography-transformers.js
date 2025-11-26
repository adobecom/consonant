const {
  toPx,
  toRem,
  roundTo,
  stripTrailingZeros,
} = require("./unit-conversions");
const { isNumericKey, findNumericKey } = require("../utils/token-utils");
const { quoteFontFamily } = require("../utils/string-utils");

function getTypographyContext(path) {
  const [head, first, second] = path;
  const PROPERTY_NAMES = new Set([
    "font-size",
    "line-height",
    "font-family",
    "font-weight",
    "letter-spacing",
  ]);

  if (head !== "typography") {
    return {
      scope: undefined,
      key: undefined,
      alias: undefined,
      property: undefined,
    };
  }

  if (PROPERTY_NAMES.has(first) && second) {
    const alias = isNumericKey(second) ? undefined : second;
    return { scope: first, key: second, alias, property: first };
  }

  if (!isNumericKey(first) && PROPERTY_NAMES.has(second)) {
    return { scope: second, key: undefined, alias: first, property: second };
  }

  return {
    scope: undefined,
    key: undefined,
    alias: undefined,
    property: undefined,
  };
}

function collectTypographyDimensions(node, path, maps) {
  if (!node || typeof node !== "object") {
    return;
  }

  if ("$value" in node) {
    const value = node.$value;

    if (typeof value === "number") {
      const context = getTypographyContext(path);
      const { scope, key, alias, property } = context;

      if (scope === "font-size") {
        maps.fontSize.valueByKey.set(key ?? alias, value);
        if (key && isNumericKey(key)) {
          maps.fontSize.keyByValue.set(value, key);
        }
        if (alias) {
          if (!maps.aliasPairs.has(alias)) {
            maps.aliasPairs.set(alias, {});
          }
          maps.aliasPairs.get(alias).fontSize = value;
        }
      } else if (scope === "line-height") {
        maps.lineHeight.valueByKey.set(key ?? alias, value);
        if (key && isNumericKey(key)) {
          maps.lineHeight.keyByValue.set(value, key);
        }
        if (alias) {
          if (!maps.aliasPairs.has(alias)) {
            maps.aliasPairs.set(alias, {});
          }
          maps.aliasPairs.get(alias).lineHeight = value;
        }
      }
    }

    if (typeof value === "string") {
      const context = getTypographyContext(path);
      const { alias, property } = context;
      const match = value.match(
        /^\{typography\.(font-size|line-height)\.([^}]+)\}$/u,
      );
      if (match && alias) {
        const type = match[1];
        const refKey = match[2];
        if (!maps.aliasPairs.has(alias)) {
          maps.aliasPairs.set(alias, {});
        }
        if (type === "font-size" && property === "font-size") {
          maps.aliasPairs.get(alias).fontSizeRef = refKey;
        } else if (type === "line-height" && property === "line-height") {
          maps.aliasPairs.get(alias).lineHeightRef = refKey;
        }
      }
    }

    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) {
      continue;
    }
    collectTypographyDimensions(value, [...path, key], maps);
  }
}

function populateLineHeightFontSizeMap(maps) {
  // First, populate from alias pairs (semantic tokens that pair line-height with font-size)
  for (const info of maps.aliasPairs.values()) {
    const lineHeightValue =
      info.lineHeight ??
      (info.lineHeightRef
        ? maps.lineHeight.valueByKey.get(info.lineHeightRef)
        : undefined);
    const fontSizeValue =
      info.fontSize ??
      (info.fontSizeRef
        ? maps.fontSize.valueByKey.get(info.fontSizeRef)
        : undefined);

    if (lineHeightValue == null || fontSizeValue == null) {
      continue;
    }

    const key = String(lineHeightValue);
    if (!maps.lineHeightToFontSize.has(key)) {
      maps.lineHeightToFontSize.set(key, fontSizeValue);
    }
  }

  // Then, add direct mappings for primitive line-height values to their corresponding font-size values
  // These mappings are based on the design system's typography scale
  const lineHeightToFontSizeMappings = {
    12: 10, // line-height 12px → font-size 10px
    14: 11, // line-height 14px → font-size 11px
    16: 12, // line-height 16px → font-size 12px
    18: 14, // line-height 18px → font-size 14px
    20: 16, // line-height 20px → font-size 16px
    22: 18, // line-height 22px → font-size 18px
    24: 20, // line-height 24px → font-size 20px
    26: 22, // line-height 26px → font-size 22px
    30: 25, // line-height 30px → font-size 25px
    32: 28, // line-height 32px → font-size 28px
    36: 32, // line-height 36px → font-size 32px
    42: 36, // line-height 42px → font-size 36px
    46: 40, // line-height 46px → font-size 40px
    52: 45, // line-height 52px → font-size 45px
    54: 48, // line-height 54px → font-size 48px
    58: 51, // line-height 58px → font-size 51px
    66: 58, // line-height 66px → font-size 58px
    74: 65, // line-height 74px → font-size 65px
    84: 73, // line-height 84px → font-size 73px
    95: 82, // line-height 95px → font-size 82px
  };

  for (const [lineHeightPx, fontSizePx] of Object.entries(
    lineHeightToFontSizeMappings,
  )) {
    const key = String(lineHeightPx);
    if (!maps.lineHeightToFontSize.has(key)) {
      maps.lineHeightToFontSize.set(key, fontSizePx);
    }
  }
}

function ensureLineHeightPrimitives(tokens, maps) {
  const { stripTrailingZeros } = require("./unit-conversions");
  const { clone } = require("../utils/token-utils");

  const typography = tokens.typography;
  const lineHeightRoot = typography && typography["line-height"];
  if (!lineHeightRoot) {
    return;
  }

  for (const [valueStr, fontPx] of maps.lineHeightToFontSize.entries()) {
    const numericValue = Number(valueStr);
    if (!Number.isFinite(numericValue)) {
      continue;
    }

    if (!maps.lineHeight.keyByValue.has(numericValue)) {
      const key = stripTrailingZeros(numericValue);
      if (!lineHeightRoot[key]) {
        lineHeightRoot[key] = {
          $type: "number",
          $value: numericValue,
          $description: "",
          $extensions: {
            "com.figma": {
              hiddenFromPublishing: true,
              scopes: ["LINE_HEIGHT"],
              codeSyntax: {},
            },
          },
        };
      }

      maps.lineHeight.valueByKey.set(key, numericValue);
      maps.lineHeight.keyByValue.set(numericValue, key);
    }
  }
}

function convertNumberTokens(node, path, maps) {
  if (!node || typeof node !== "object") {
    return;
  }

  if ("$value" in node && typeof node.$value === "number") {
    const context = getTypographyContext(path);
    const { scope, key, alias, property } = context;
    const value = node.$value;

    if (scope === "font-size") {
      if (key && isNumericKey(key)) {
        node.$value = toRem(value);
      } else {
        const referenceKey = findNumericKey(maps.fontSize.keyByValue, value);
        node.$value = referenceKey
          ? `{typography.font-size.${referenceKey}}`
          : toRem(value);
      }
    } else if (scope === "line-height") {
      const mappedFontPx = maps.lineHeightToFontSize.get(String(value));
      const aliasFontPx =
        alias &&
        maps.aliasPairs.get(alias) &&
        maps.aliasPairs.get(alias).fontSize;
      const fallbackFontPx = key
        ? maps.fontSize.valueByKey.get(key)
        : undefined;
      const fontPx = mappedFontPx ?? aliasFontPx ?? fallbackFontPx;
      const rawRatio = fontPx ? value / fontPx : value / 16;
      // Round to 6 decimal places for line-height ratios, then strip trailing zeros
      const roundedRatio = roundTo(rawRatio, 6);
      const ratio = stripTrailingZeros(roundedRatio, 6);

      if (key && isNumericKey(key)) {
        node.$value = ratio;
      } else {
        const referenceKey = findNumericKey(maps.lineHeight.keyByValue, value);
        node.$value = referenceKey
          ? `{typography.line-height.${referenceKey}}`
          : ratio;
      }
    } else if (scope === "letter-spacing") {
      // NOTE: Letter-spacing tokens are currently filtered out due to conversion issues
      // They are being excluded from the build output until the conversion logic can be fixed
      // This prevents letter-spacing tokens from appearing in the generated CSS files
      return; // Skip processing letter-spacing tokens
    } else if (path[0] === "opacity") {
      node.$value = roundTo(Math.max(0, Math.min(1, value / 100)), 4);
    } else {
      node.$value = toPx(value);
    }
    return;
  }

  if ("$value" in node && typeof node.$value === "string") {
    const context = getTypographyContext(path);
    const { scope } = context;

    if (scope === "font-family") {
      node.$value = quoteFontFamily(node.$value);
    } else if (scope === "font-weight") {
      // Convert font-weight string values to numeric CSS values
      const fontWeightMap = {
        Regular: 400,
        Medium: 500,
        Bold: 700,
        ExtraBold: 800,
        Black: 900,
      };
      const numericValue = fontWeightMap[node.$value];
      if (numericValue !== undefined) {
        node.$value = numericValue;
      }
    }

    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) {
      continue;
    }
    convertNumberTokens(value, [...path, key], maps);
  }
}

module.exports = {
  getTypographyContext,
  collectTypographyDimensions,
  populateLineHeightFontSizeMap,
  ensureLineHeightPrimitives,
  convertNumberTokens,
};

