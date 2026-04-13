"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// apps/consonant-specs-plugin/src/utils.ts
function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const val = Math.round(n * 255);
    return val.toString(16).padStart(2, "0");
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function figmaColorToHex(color) {
  return rgbToHex(color.r, color.g, color.b);
}
function getAutoLayoutProps(node) {
  if (!("layoutMode" in node) || node.layoutMode === "NONE") return null;
  return {
    direction: node.layoutMode,
    paddingTop: node.paddingTop,
    paddingRight: node.paddingRight,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
    gap: node.itemSpacing === figma.mixed ? 0 : node.itemSpacing
  };
}
function getNodeFills(node) {
  if (!("fills" in node) || !Array.isArray(node.fills)) return [];
  return node.fills.filter((f) => f.type === "SOLID" && f.visible !== false).map((f) => {
    var _a;
    return {
      hex: figmaColorToHex(f.color),
      opacity: (_a = f.opacity) != null ? _a : 1
    };
  });
}
function getNodeStrokes(node) {
  if (!("strokes" in node) || !Array.isArray(node.strokes)) return [];
  const rawWeight = "strokeWeight" in node ? node.strokeWeight : 0;
  const weight = typeof rawWeight === "number" ? rawWeight : 0;
  return node.strokes.filter((s) => s.type === "SOLID" && s.visible !== false).map((s) => ({
    hex: figmaColorToHex(s.color),
    weight
  }));
}
function getTextProps(node) {
  if (node.type !== "TEXT") return null;
  if (node.fontName === figma.mixed || node.fontSize === figma.mixed || node.lineHeight === figma.mixed || node.letterSpacing === figma.mixed) {
    return null;
  }
  const font = node.fontName;
  const size = node.fontSize;
  const lh = node.lineHeight;
  const ls = node.letterSpacing;
  return {
    fontFamily: font.family,
    fontSize: size,
    fontWeight: getFontWeight(font.style),
    lineHeight: lh.unit === "AUTO" ? "auto" : lh.unit === "PIXELS" ? `${lh.value}px` : `${lh.value}%`,
    letterSpacing: ls.unit === "PIXELS" ? `${ls.value}px` : `${ls.value}%`
  };
}
function getFontWeight(style) {
  const map = {
    Thin: 100,
    ExtraLight: 200,
    Light: 300,
    Regular: 400,
    Medium: 500,
    SemiBold: 600,
    Bold: 700,
    ExtraBold: 800,
    Black: 900
  };
  for (const [name, weight] of Object.entries(map)) {
    if (style.includes(name)) return weight;
  }
  return 400;
}
function getCornerRadius(node) {
  if (!("cornerRadius" in node)) return "0";
  if (typeof node.cornerRadius === "number") return `${node.cornerRadius}px`;
  if ("topLeftRadius" in node) {
    const tl = node.topLeftRadius;
    const tr = node.topRightRadius;
    const br = node.bottomRightRadius;
    const bl = node.bottomLeftRadius;
    if (tl === tr && tr === br && br === bl) return `${tl}px`;
    return `${tl}px ${tr}px ${br}px ${bl}px`;
  }
  return "0";
}
function getEffects(node) {
  if (!("effects" in node) || !Array.isArray(node.effects)) return [];
  return node.effects.filter((e) => e.visible !== false).map((e) => {
    if (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW") {
      const color = figmaColorToHex(e.color);
      return {
        type: e.type === "DROP_SHADOW" ? "Shadow" : "Inner Shadow",
        description: `${e.offset.x}px ${e.offset.y}px ${e.radius}px ${color}`
      };
    }
    if (e.type === "LAYER_BLUR" || e.type === "BACKGROUND_BLUR") {
      return {
        type: e.type === "LAYER_BLUR" ? "Blur" : "Background Blur",
        description: `${e.radius}px`
      };
    }
    return { type: e.type, description: "" };
  });
}

// apps/consonant-specs-plugin/src/tokens.ts
var TEXT_STYLE_KEYS = {
  "super": "564079c9833ea03f5c5f8d7b759b17ee39778812",
  "title-1": "2ca3a4b582cbdeeac82b0dba6fc0657c4785ba5d",
  "title-2": "a4f7c56b483cc9de25de0eff562eda9da4b49b7b",
  "title-3": "642cf45e2b9a74fad45b548c2b102dd910288194",
  "title-4": "5cf014300bccf1230a6e660f60bd4f4252a72816",
  "body-lg": "565931e51de6b933b7b1e79eec5803a05e080e86",
  "body-md": "8f9651588cc275ebe89d81b01b6344b3cf245539",
  "body-sm": "688dea125c625313cdb9914dd76f7ef91c0cbe7a",
  "body-xs": "ceb0450e2807d926b4fd00637fa00e1cffc02379",
  "eyebrow": "152b1b57fb441ccfd288060043e1cd0a4365737f",
  "label": "536bbf234b1a0a717cffe0e3c578fb0052669086",
  "caption": "e572ca6995cb534da839d4c8bef75ec523efeb6f"
};
var textStyleMap = [];
var colorVarMap = [];
var dimensionVarMap = [];
var loaded = false;
var tokenCount = 0;
var loadingPromise = null;
async function loadLibraryTokens() {
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    try {
      textStyleMap = [];
      colorVarMap = [];
      dimensionVarMap = [];
      tokenCount = 0;
      loaded = false;
      for (const [name, key] of Object.entries(TEXT_STYLE_KEYS)) {
        try {
          const style = await figma.importStyleByKeyAsync(key);
          if (style.type === "TEXT") {
            const ts = style;
            textStyleMap.push({
              name: `s2a/typography/${name}`,
              styleId: ts.id,
              fontFamily: ts.fontName.family,
              fontStyle: ts.fontName.style,
              fontSize: ts.fontSize
            });
          }
        } catch (e) {
        }
      }
      const S2A_LIBRARY_NAME = /s2a|spectrum 2/i;
      try {
        const allCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
        const s2aCollections = allCollections.filter((c) => S2A_LIBRARY_NAME.test(c.libraryName) || S2A_LIBRARY_NAME.test(c.name));
        for (const collection of s2aCollections) {
          try {
            const libVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(collection.key);
            for (const v of libVars) {
              try {
                const imported = await figma.variables.importVariableByKeyAsync(v.key);
                const modeId = Object.keys(imported.valuesByMode)[0];
                let value = imported.valuesByMode[modeId];
                let depth = 0;
                while (value && typeof value === "object" && "type" in value && value.type === "VARIABLE_ALIAS" && depth < 5) {
                  try {
                    const alias = await figma.variables.getVariableByIdAsync(value.id);
                    if (alias) {
                      value = alias.valuesByMode[Object.keys(alias.valuesByMode)[0]];
                    } else break;
                  } catch (_) {
                    break;
                  }
                  depth++;
                }
                if (imported.resolvedType === "COLOR") {
                  if (value && typeof value === "object" && "r" in value) {
                    const color = value;
                    colorVarMap.push({
                      name: imported.name,
                      variable: imported,
                      hex: rgbToHex(color.r, color.g, color.b),
                      opacity: "a" in color ? color.a : 1
                    });
                  }
                } else if (imported.resolvedType === "FLOAT") {
                  if (typeof value === "number") {
                    dimensionVarMap.push({
                      name: imported.name,
                      variable: imported,
                      value,
                      scopes: imported.scopes
                    });
                  }
                }
              } catch (_) {
              }
            }
          } catch (_) {
          }
        }
      } catch (_) {
      }
      tokenCount = textStyleMap.length + colorVarMap.length + dimensionVarMap.length;
      loaded = true;
    } finally {
      loadingPromise = null;
    }
  })();
  return loadingPromise;
}
function getTokenVersion() {
  return "S2A / Foundations";
}
function getTokenCount() {
  return tokenCount;
}
function isLoaded() {
  return loaded;
}
function matchColor(hex) {
  const normalized = hex.toLowerCase();
  for (let i = colorVarMap.length - 1; i >= 0; i--) {
    if (colorVarMap[i].hex.toLowerCase() === normalized) {
      return colorVarMap[i].name;
    }
  }
  return null;
}
function matchTypography(value) {
  const normalized = value.toLowerCase();
  for (const ts of textStyleMap) {
    if (ts.fontFamily.toLowerCase() === normalized) return ts.name;
    if (`${ts.fontSize}` === value) return ts.name;
  }
  return null;
}
var NAME_SPACING = /spacing|layout|gap|margin|padding/i;
var NAME_RADIUS = /radius|corner|border[\-\/]radius/i;
var NAME_BLUR = /blur/i;
function matchSpacing(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  for (const v of dimensionVarMap) {
    if (v.value === num && NAME_SPACING.test(v.name)) return v.name;
  }
  for (const v of dimensionVarMap) {
    if (v.value === num && v.scopes.some((s) => s === "GAP") && !NAME_RADIUS.test(v.name) && !NAME_BLUR.test(v.name)) return v.name;
  }
  return null;
}
function matchRadius(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  for (const v of dimensionVarMap) {
    if (v.value === num && NAME_RADIUS.test(v.name)) return v.name;
  }
  for (const v of dimensionVarMap) {
    if (v.value === num && v.scopes.some((s) => s === "CORNER_RADIUS") && !NAME_SPACING.test(v.name) && !NAME_BLUR.test(v.name)) return v.name;
  }
  return null;
}
function matchDimension(value, scope) {
  const nameFilter = scope === "GAP" ? NAME_SPACING : scope === "CORNER_RADIUS" ? NAME_RADIUS : null;
  if (nameFilter) {
    for (const v of dimensionVarMap) {
      if (v.value === value && nameFilter.test(v.name)) return v;
    }
  }
  for (const v of dimensionVarMap) {
    if (v.value !== value) continue;
    if (!v.scopes.some((s) => s === scope)) continue;
    if (scope === "GAP" && NAME_RADIUS.test(v.name)) continue;
    if (scope === "CORNER_RADIUS" && NAME_SPACING.test(v.name)) continue;
    return v;
  }
  for (const v of dimensionVarMap) {
    if (v.value !== value) continue;
    if (!v.scopes.some((s) => s === "ALL_SCOPES")) continue;
    if (scope === "GAP" && (NAME_RADIUS.test(v.name) || NAME_BLUR.test(v.name))) continue;
    if (scope === "CORNER_RADIUS" && (NAME_SPACING.test(v.name) || NAME_BLUR.test(v.name))) continue;
    return v;
  }
  return null;
}
async function applyColorStyle(node, hex, fillOpacity) {
  var _a, _b;
  const normalized = hex.toLowerCase();
  if (!("fills" in node)) return false;
  const liveFills = node.fills;
  if (!Array.isArray(liveFills) || liveFills.length === 0) return false;
  if (!(liveFills.length > 0 && liveFills[0].type === "SOLID")) return false;
  const originalFill = liveFills[0];
  const origHex = rgbToHex(originalFill.color.r, originalFill.color.g, originalFill.color.b).toLowerCase();
  const origOpacity = (_a = originalFill.opacity) != null ? _a : 1;
  const savedFills = liveFills.map((f) => __spreadValues({}, f));
  for (const cv of colorVarMap) {
    if (cv.hex.toLowerCase() !== normalized) continue;
    if (Math.abs(cv.opacity - fillOpacity) > 0.01) continue;
    try {
      const newFill = figma.variables.setBoundVariableForPaint(originalFill, "color", cv.variable);
      node.fills = [newFill, ...liveFills.slice(1)];
      const readBack = node.fills;
      if (Array.isArray(readBack) && readBack.length > 0 && readBack[0].type === "SOLID") {
        const rbFill = readBack[0];
        const rbHex = rgbToHex(rbFill.color.r, rbFill.color.g, rbFill.color.b).toLowerCase();
        const rbOpacity = (_b = rbFill.opacity) != null ? _b : 1;
        if (rbHex === origHex && Math.abs(rbOpacity - origOpacity) < 0.01) {
          return true;
        }
      }
      node.fills = savedFills;
    } catch (_) {
      try {
        node.fills = savedFills;
      } catch (_2) {
      }
    }
  }
  return false;
}
async function applyStrokeColorStyle(node, hex, strokeOpacity) {
  var _a, _b;
  const normalized = hex.toLowerCase();
  if (!("strokes" in node)) return false;
  const liveStrokes = node.strokes;
  if (!Array.isArray(liveStrokes) || liveStrokes.length === 0) return false;
  if (!(liveStrokes.length > 0 && liveStrokes[0].type === "SOLID")) return false;
  const originalStroke = liveStrokes[0];
  const origHex = rgbToHex(originalStroke.color.r, originalStroke.color.g, originalStroke.color.b).toLowerCase();
  const origOpacity = (_a = originalStroke.opacity) != null ? _a : 1;
  const savedStrokes = liveStrokes.map((s) => __spreadValues({}, s));
  for (const cv of colorVarMap) {
    if (cv.hex.toLowerCase() !== normalized) continue;
    if (Math.abs(cv.opacity - strokeOpacity) > 0.01) continue;
    try {
      const newStroke = figma.variables.setBoundVariableForPaint(originalStroke, "color", cv.variable);
      node.strokes = [newStroke, ...liveStrokes.slice(1)];
      const readBack = node.strokes;
      if (Array.isArray(readBack) && readBack.length > 0 && readBack[0].type === "SOLID") {
        const rbStroke = readBack[0];
        const rbHex = rgbToHex(rbStroke.color.r, rbStroke.color.g, rbStroke.color.b).toLowerCase();
        const rbOpacity = (_b = rbStroke.opacity) != null ? _b : 1;
        if (rbHex === origHex && Math.abs(rbOpacity - origOpacity) < 0.01) {
          return true;
        }
      }
      node.strokes = savedStrokes;
    } catch (_) {
      try {
        node.strokes = savedStrokes;
      } catch (_2) {
      }
    }
  }
  return false;
}
async function applyTextStyle(node) {
  const fontName = node.fontName;
  if (fontName === figma.mixed) return false;
  const fontSize = node.fontSize;
  if (typeof fontSize !== "number") return false;
  const family = fontName.family;
  const style = fontName.style;
  const origFontName = node.fontName;
  const origFontSize = node.fontSize;
  const origLineHeight = node.lineHeight;
  const origLetterSpacing = node.letterSpacing;
  for (const ts of textStyleMap) {
    if (ts.fontFamily !== family || ts.fontStyle !== style || ts.fontSize !== fontSize) continue;
    try {
      node.textStyleId = ts.styleId;
      const newFontName = node.fontName;
      const newFontSize = node.fontSize;
      const newLineHeight = node.lineHeight;
      const newLetterSpacing = node.letterSpacing;
      let identical = true;
      if (newFontName === figma.mixed || newFontSize === figma.mixed) {
        identical = false;
      } else {
        const fn = newFontName;
        if (fn.family !== family || fn.style !== style || newFontSize !== fontSize) {
          identical = false;
        }
      }
      if (identical && origLineHeight !== figma.mixed && newLineHeight !== figma.mixed) {
        const oLH = origLineHeight;
        const nLH = newLineHeight;
        if (oLH.unit !== nLH.unit) {
          identical = false;
        } else if (oLH.unit !== "AUTO" && nLH.unit !== "AUTO") {
          if (Math.abs(oLH.value - nLH.value) > 0.01) {
            identical = false;
          }
        }
      }
      if (identical && origLetterSpacing !== figma.mixed && newLetterSpacing !== figma.mixed) {
        const oLS = origLetterSpacing;
        const nLS = newLetterSpacing;
        if (oLS.unit !== nLS.unit) {
          identical = false;
        } else if (Math.abs(oLS.value - nLS.value) > 0.01) {
          identical = false;
        }
      }
      if (identical) {
        return true;
      }
      node.textStyleId = "";
      await figma.loadFontAsync(origFontName);
      node.fontName = origFontName;
      node.fontSize = origFontSize;
      if (origLineHeight !== figma.mixed) node.lineHeight = origLineHeight;
      if (origLetterSpacing !== figma.mixed) node.letterSpacing = origLetterSpacing;
    } catch (_) {
      try {
        node.textStyleId = "";
        await figma.loadFontAsync(origFontName);
        node.fontName = origFontName;
        node.fontSize = origFontSize;
        if (origLineHeight !== figma.mixed) node.lineHeight = origLineHeight;
        if (origLetterSpacing !== figma.mixed) node.letterSpacing = origLetterSpacing;
      } catch (_2) {
      }
    }
  }
  return false;
}
async function setResponsiveMode(node) {
  const width = node.width;
  let modeName;
  if (width >= 1920) modeName = "xl";
  else if (width >= 1280) modeName = "lg";
  else if (width >= 1024) modeName = "md";
  else modeName = "sm";
  try {
    const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    const responsiveCol = collections.find((c) => /responsive/i.test(c.name) && /s2a|spectrum 2/i.test(c.libraryName));
    if (!responsiveCol) return `mode not set (collection not found)`;
    const libVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(responsiveCol.key);
    if (libVars.length === 0) return `mode not set (no vars)`;
    const firstVar = await figma.variables.importVariableByKeyAsync(libVars[0].key);
    const collection = await figma.variables.getVariableCollectionByIdAsync(firstVar.variableCollectionId);
    if (!collection) return `mode not set (collection resolve failed)`;
    const mode = collection.modes.find((m) => m.name.toLowerCase() === modeName);
    if (!mode) return `mode not set (mode "${modeName}" not found)`;
    node.setExplicitVariableModeForCollection(collection, mode.modeId);
    return modeName;
  } catch (e) {
    return `error: ${e.message}`;
  }
}
function colorDistance(hex1, hex2) {
  const parse = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const [r1, g1, b1] = parse(hex1.toLowerCase());
  const [r2, g2, b2] = parse(hex2.toLowerCase());
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}
function findClosestColor(hex, fillOpacity) {
  let best = null;
  let bestDist = Infinity;
  for (const cv of colorVarMap) {
    if (Math.abs(cv.opacity - fillOpacity) > 0.05) continue;
    const dist = colorDistance(hex, cv.hex);
    if (dist < bestDist) {
      bestDist = dist;
      best = cv;
    }
  }
  return best;
}
function findClosestDimension(value, scope) {
  const nameFilter = scope === "GAP" ? NAME_SPACING : scope === "CORNER_RADIUS" ? NAME_RADIUS : null;
  let best = null;
  let bestDist = Infinity;
  if (nameFilter) {
    for (const v of dimensionVarMap) {
      if (!nameFilter.test(v.name)) continue;
      const dist = Math.abs(v.value - value);
      if (dist < bestDist) {
        bestDist = dist;
        best = v;
      }
    }
    if (best) return best;
  }
  for (const v of dimensionVarMap) {
    if (!v.scopes.some((s) => s === scope)) continue;
    if (scope === "GAP" && NAME_RADIUS.test(v.name)) continue;
    if (scope === "CORNER_RADIUS" && NAME_SPACING.test(v.name)) continue;
    const dist = Math.abs(v.value - value);
    if (dist < bestDist) {
      bestDist = dist;
      best = v;
    }
  }
  if (best) return best;
  for (const v of dimensionVarMap) {
    if (!v.scopes.some((s) => s === "ALL_SCOPES")) continue;
    if (scope === "GAP" && (NAME_RADIUS.test(v.name) || NAME_BLUR.test(v.name))) continue;
    if (scope === "CORNER_RADIUS" && (NAME_SPACING.test(v.name) || NAME_BLUR.test(v.name))) continue;
    const dist = Math.abs(v.value - value);
    if (dist < bestDist) {
      bestDist = dist;
      best = v;
    }
  }
  return best;
}
function findClosestTextStyle(family, style, size) {
  let best = null;
  let bestDist = Infinity;
  for (const ts of textStyleMap) {
    let dist = Math.abs(ts.fontSize - size) * 1e3;
    if (ts.fontStyle !== style) dist += 10;
    if (ts.fontFamily !== family) dist += 1;
    if (dist < bestDist) {
      bestDist = dist;
      best = ts;
    }
  }
  return best;
}
async function forceMatchNode(node, categories, result2) {
  var _a, _b;
  if (categories.has("typography") && node.type === "TEXT") {
    const textNode = node;
    if (textNode.fontName !== figma.mixed && typeof textNode.fontSize === "number") {
      const fn = textNode.fontName;
      const closest = findClosestTextStyle(fn.family, fn.style, textNode.fontSize);
      if (closest) {
        try {
          await figma.loadFontAsync({ family: closest.fontFamily, style: closest.fontStyle });
          textNode.textStyleId = closest.styleId;
          result2.applied++;
        } catch (_) {
          result2.skipped++;
        }
      }
    }
  }
  if (categories.has("fillColors") && "fills" in node) {
    const fills = node.fills;
    if (Array.isArray(fills) && fills.length > 0 && fills.every((f) => f.type === "SOLID")) {
      const solid = fills[0];
      const hex = rgbToHex(solid.color.r, solid.color.g, solid.color.b);
      const opacity = (_a = solid.opacity) != null ? _a : 1;
      const closest = findClosestColor(hex, opacity);
      if (closest) {
        try {
          const newFill = figma.variables.setBoundVariableForPaint(solid, "color", closest.variable);
          node.fills = [newFill, ...fills.slice(1)];
          result2.applied++;
        } catch (_) {
          result2.skipped++;
        }
      }
    }
  }
  if (categories.has("strokeColors") && "strokes" in node) {
    const strokes = node.strokes;
    if (Array.isArray(strokes) && strokes.length > 0 && strokes.every((s) => s.type === "SOLID")) {
      const solid = strokes[0];
      const hex = rgbToHex(solid.color.r, solid.color.g, solid.color.b);
      const opacity = (_b = solid.opacity) != null ? _b : 1;
      const closest = findClosestColor(hex, opacity);
      if (closest) {
        try {
          const newStroke = figma.variables.setBoundVariableForPaint(solid, "color", closest.variable);
          node.strokes = [newStroke, ...strokes.slice(1)];
          result2.applied++;
        } catch (_) {
          result2.skipped++;
        }
      }
    }
  }
  if (categories.has("borderRadius") && "cornerRadius" in node && typeof node.cornerRadius === "number" && node.cornerRadius > 0) {
    const closest = findClosestDimension(node.cornerRadius, "CORNER_RADIUS");
    if (closest) {
      try {
        node.setBoundVariable("topLeftRadius", closest.variable);
        node.setBoundVariable("topRightRadius", closest.variable);
        node.setBoundVariable("bottomLeftRadius", closest.variable);
        node.setBoundVariable("bottomRightRadius", closest.variable);
        result2.applied++;
      } catch (_) {
        result2.skipped++;
      }
    }
  }
  if (categories.has("borderWidth") && "strokeWeight" in node && typeof node.strokeWeight === "number" && node.strokeWeight > 0) {
    const closest = findClosestDimension(node.strokeWeight, "STROKE_FLOAT");
    if (closest) {
      try {
        node.setBoundVariable("strokeWeight", closest.variable);
        result2.applied++;
      } catch (_) {
        result2.skipped++;
      }
    }
  }
  if (categories.has("spacing") && "layoutMode" in node && node.layoutMode !== "NONE") {
    const frame = node;
    for (const prop of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "itemSpacing"]) {
      const val = frame[prop];
      if (val > 0) {
        const closest = findClosestDimension(val, "GAP");
        if (closest) {
          try {
            frame.setBoundVariable(prop, closest.variable);
            result2.applied++;
          } catch (_) {
            result2.skipped++;
          }
        }
      }
    }
  }
  if (categories.has("opacity") && "opacity" in node && typeof node.opacity === "number" && node.opacity < 1) {
    const pct = Math.round(node.opacity * 100);
    const closest = findClosestDimension(pct, "OPACITY");
    if (closest) {
      try {
        node.setBoundVariable("opacity", closest.variable);
        result2.applied++;
      } catch (_) {
        result2.skipped++;
      }
    }
  }
}
async function forceMatchRecursive(node, categories, result2) {
  if ("visible" in node && !node.visible) return;
  await forceMatchNode(node, categories, result2);
  if (node.type === "INSTANCE") return;
  if ("children" in node) {
    for (const child of node.children) {
      await forceMatchRecursive(child, categories, result2);
    }
  }
}
async function forceMatch(node, categories) {
  if ("layoutMode" in node) {
    await setResponsiveMode(node);
  }
  const result2 = { applied: 0, skipped: 0 };
  await forceMatchRecursive(node, new Set(categories), result2);
  return result2;
}

// apps/consonant-specs-plugin/src/annotations.ts
function collectProperties(node) {
  const props = [];
  props.push({
    name: "Size",
    value: `${Math.round(node.width)} x ${Math.round(node.height)}`,
    token: null
  });
  const fills = getNodeFills(node);
  for (const fill of fills) {
    props.push({
      name: "Fill",
      value: fill.hex.toUpperCase(),
      token: matchColor(fill.hex),
      colorSwatch: fill.hex
    });
  }
  const strokes = getNodeStrokes(node);
  for (const stroke of strokes) {
    props.push({
      name: "Stroke",
      value: `${stroke.hex.toUpperCase()} / ${stroke.weight}px`,
      token: matchColor(stroke.hex),
      colorSwatch: stroke.hex
    });
  }
  const radius = getCornerRadius(node);
  if (radius !== "0") {
    props.push({
      name: "Radius",
      value: radius,
      token: matchRadius(radius.replace(/px/g, ""))
    });
  }
  if ("opacity" in node && typeof node.opacity === "number" && node.opacity < 1) {
    props.push({
      name: "Opacity",
      value: `${Math.round(node.opacity * 100)}%`,
      token: null
    });
  }
  const text = getTextProps(node);
  if (text) {
    props.push({ name: "Font", value: text.fontFamily, token: matchTypography(text.fontFamily) });
    props.push({ name: "Size", value: `${text.fontSize}px`, token: matchTypography(`${text.fontSize}`) });
    props.push({ name: "Weight", value: `${text.fontWeight}`, token: matchTypography(`${text.fontWeight}`) });
    props.push({ name: "Line Height", value: text.lineHeight, token: null });
    props.push({ name: "Letter Spacing", value: text.letterSpacing, token: null });
  }
  const effects = getEffects(node);
  for (const effect of effects) {
    props.push({ name: effect.type, value: effect.description, token: null });
  }
  return props;
}
function getNodeProperties(node) {
  return collectProperties(node);
}

// apps/consonant-specs-plugin/src/spec-anatomy.ts
var MARKER_COLOR = { r: 0.09, g: 0.6, b: 0.97 };
var DOT_SIZE = 24;
var DOT_FONT_SIZE = 12;
var TOKEN_PILL_TEXT = { r: 0.09, g: 0.47, b: 0.82 };
var CONTENT_BG = { r: 0.95, g: 0.95, b: 0.95 };
var CONTENT_RADIUS = 12;
var HEADER_FONT_SIZE = 16;
var PROP_FONT_SIZE = 12;
var LABEL_WIDTH = 144;
var CARD_GAP = 24;
var ROW_GAP = 4;
var SECTION_TITLE_SIZE = 48;
var EXHIBIT_GAP = 64;
var CONTENT_RAIL_WIDTH = 500;
var BLACK = { r: 0, g: 0, b: 0 };
var TITLE_COLOR = { r: 1, g: 1, b: 1 };
function collectSignificantNodes(node, entries, seen, depth = 0) {
  var _a, _b;
  if (depth > 0) {
    let key = `${node.name}::${node.type}`;
    if (node.type === "TEXT") {
      const fontSize = node.fontSize;
      key += `::${fontSize !== figma.mixed ? fontSize : 0}`;
    }
    if (!seen.has(key)) {
      let isSignificant = false;
      if ("visible" in node && !node.visible) return;
      if ("opacity" in node && node.opacity === 0) return;
      if (node.type === "TEXT") {
        isSignificant = true;
      } else if ((node.type === "FRAME" || node.type === "COMPONENT") && isCallToAction(node)) {
        isSignificant = true;
      } else if (node.type === "INSTANCE") {
        const w = (_a = node.width) != null ? _a : 0;
        const h = (_b = node.height) != null ? _b : 0;
        if (w >= 20 && h >= 20) {
          const baseName = node.name.replace(/\s*\/\s*(Primary|Secondary|Tertiary|Dark|Light|Default|Hover|Pressed|Disabled).*$/i, "");
          const instanceKey = `instance::${baseName}`;
          if (!seen.has(instanceKey)) {
            seen.add(instanceKey);
            isSignificant = true;
          }
        }
      }
      if (isSignificant) {
        seen.add(key);
        entries.push({
          index: entries.length + 1,
          node,
          name: node.name,
          type: node.type
        });
      }
    }
  }
  if ("children" in node && depth < 10) {
    for (const child of node.children) {
      if ("visible" in child && !child.visible) continue;
      if ("opacity" in child && child.opacity === 0) continue;
      collectSignificantNodes(child, entries, seen, depth + 1);
    }
  }
}
function createTokenPill(tokenName, parent) {
  const pill = figma.createFrame();
  pill.name = "token-pill";
  pill.layoutMode = "HORIZONTAL";
  pill.primaryAxisSizingMode = "AUTO";
  pill.counterAxisSizingMode = "AUTO";
  pill.fills = [];
  pill.cornerRadius = 0;
  pill.paddingTop = 0;
  pill.paddingBottom = 0;
  pill.paddingLeft = 0;
  pill.paddingRight = 0;
  const text = figma.createText();
  text.fontName = { family: "Inter", style: "Regular" };
  text.fontSize = PROP_FONT_SIZE;
  text.characters = tokenName;
  text.fills = [{ type: "SOLID", color: TOKEN_PILL_TEXT }];
  pill.appendChild(text);
  parent.appendChild(pill);
}
function addPropRow(parent, label, value, options) {
  const row = figma.createFrame();
  row.name = `prop-${label}`;
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.fills = [];
  row.itemSpacing = 6;
  const labelText = figma.createText();
  labelText.fontName = { family: "Inter", style: "Regular" };
  labelText.fontSize = PROP_FONT_SIZE;
  labelText.characters = label;
  labelText.fills = [{ type: "SOLID", color: BLACK }];
  labelText.resize(LABEL_WIDTH, labelText.height);
  labelText.textAutoResize = "HEIGHT";
  row.appendChild(labelText);
  if (options == null ? void 0 : options.tokenPill) {
    createTokenPill(options.tokenPill, row);
  } else {
    const valueText = figma.createText();
    valueText.fontName = { family: "Inter", style: (options == null ? void 0 : options.bold) ? "Bold" : "Regular" };
    valueText.fontSize = PROP_FONT_SIZE;
    valueText.characters = value;
    valueText.fills = [{ type: "SOLID", color: BLACK }];
    row.appendChild(valueText);
  }
  parent.appendChild(row);
}
var CTA_NAME_PATTERNS = /\b(cta|call[\s\-_]?to[\s\-_]?action|button|btn|link|action)\b/i;
function isCallToAction(node) {
  var _a, _b, _c, _d, _e;
  if (CTA_NAME_PATTERNS.test(node.name)) return true;
  let p = node.parent;
  for (let i = 0; i < 3 && p; i++) {
    if ("name" in p && CTA_NAME_PATTERNS.test(p.name)) return true;
    p = p.parent;
  }
  if (node.type === "INSTANCE") {
    const mainName = ((_a = node.mainComponent) == null ? void 0 : _a.name) || "";
    const parentName = ((_c = (_b = node.mainComponent) == null ? void 0 : _b.parent) == null ? void 0 : _c.name) || "";
    if (CTA_NAME_PATTERNS.test(mainName) || CTA_NAME_PATTERNS.test(parentName)) return true;
  }
  if (node.type === "TEXT") {
    const t = node;
    const chars = t.characters || "";
    if (/[›»→>]\s*$/.test(chars.trim()) && chars.length < 60) return true;
    if (t.textDecoration === "UNDERLINE" && chars.length < 60) return true;
    const parent = t.parent;
    if (parent && (parent.type === "FRAME" || parent.type === "GROUP" || parent.type === "INSTANCE" || parent.type === "COMPONENT")) {
      if (parent.layoutMode === "HORIZONTAL" && parent.children && parent.children.length >= 2 && chars.length < 80) {
        for (const sib of parent.children) {
          if (sib === t) continue;
          if (sib.type === "VECTOR" || sib.type === "INSTANCE" || sib.type === "BOOLEAN_OPERATION") {
            if (((_d = sib.width) != null ? _d : 0) <= 40 && ((_e = sib.height) != null ? _e : 0) <= 40) return true;
          }
        }
      }
    }
  }
  return false;
}
function findFirstTextChild(node) {
  if (node.type === "TEXT") return node;
  if ("children" in node) {
    for (const child of node.children) {
      const found = findFirstTextChild(child);
      if (found) return found;
    }
  }
  return null;
}
function addCtaProperties(node, content) {
  var _a;
  const label = findFirstTextChild(node);
  if (label) {
    addPropRow(content, "Label:", `"${label.characters}"`, { bold: true });
  }
  const mainName = (_a = node.mainComponent) == null ? void 0 : _a.name;
  if (mainName) {
    addPropRow(content, "Component:", mainName);
  }
  addPropRow(content, "Width:", `${Math.round(node.width)}`);
  addPropRow(content, "Height:", `${Math.round(node.height)}`);
  const fills = getNodeFills(node);
  for (const fill of fills) {
    const colorToken = matchColor(fill.hex);
    if (colorToken) {
      addPropRow(content, "Background:", "", { tokenPill: colorToken });
    } else {
      addPropRow(content, "Background:", fill.hex.toUpperCase());
    }
  }
  const strokes = getNodeStrokes(node);
  for (const stroke of strokes) {
    const strokeToken = matchColor(stroke.hex);
    if (strokeToken) {
      addPropRow(content, "Border color:", "", { tokenPill: strokeToken });
    } else {
      addPropRow(content, "Border color:", stroke.hex.toUpperCase());
    }
    addPropRow(content, "Border weight:", `${stroke.weight}`);
  }
  const radius = getCornerRadius(node);
  if (radius !== "0") {
    const radiusToken = matchRadius(radius.replace("px", ""));
    if (radiusToken) {
      addPropRow(content, "Border radius:", "", { tokenPill: radiusToken });
    } else {
      addPropRow(content, "Border radius:", radius);
    }
  }
  const auto = getAutoLayoutProps(node);
  if (auto) {
    if (auto.paddingTop === auto.paddingBottom && auto.paddingLeft === auto.paddingRight && auto.paddingTop === auto.paddingLeft) {
      addPropRow(content, "Padding:", `${auto.paddingTop}`);
    } else {
      addPropRow(content, "Padding:", `${auto.paddingTop} ${auto.paddingRight} ${auto.paddingBottom} ${auto.paddingLeft}`);
    }
    if (auto.gap) {
      addPropRow(content, "Gap:", `${auto.gap}`);
    }
  }
  if (label) {
    const tp = getTextProps(label);
    if (tp) {
      addPropRow(content, "Font family:", tp.fontFamily);
      addPropRow(content, "Font weight:", `${tp.fontWeight}`);
      addPropRow(content, "Font size:", `${tp.fontSize}`);
      const labelFills = getNodeFills(label);
      for (const f of labelFills) {
        const tok = matchColor(f.hex);
        if (tok) {
          addPropRow(content, "Text color:", "", { tokenPill: tok });
        } else {
          addPropRow(content, "Text color:", f.hex.toUpperCase());
        }
      }
    }
  }
  const effects = getEffects(node);
  for (const effect of effects) {
    addPropRow(content, `${effect.type}:`, effect.description);
  }
}
async function buildPropertiesForNode(node, content) {
  if ((node.type === "FRAME" || node.type === "COMPONENT") && isCallToAction(node)) {
    addCtaProperties(node, content);
    return;
  }
  switch (node.type) {
    case "TEXT": {
      const text = getTextProps(node);
      if (!text) break;
      const preview = figma.createFrame();
      preview.name = "text-preview";
      preview.layoutMode = "VERTICAL";
      preview.primaryAxisSizingMode = "AUTO";
      preview.counterAxisSizingMode = "FIXED";
      preview.resize(CONTENT_RAIL_WIDTH - 32, 1);
      preview.fills = [];
      preview.paddingTop = 12;
      preview.paddingBottom = 16;
      preview.paddingLeft = 4;
      preview.paddingRight = 4;
      const srcFont = node.fontName;
      const srcSize = text.fontSize;
      const previewSize = Math.min(36, Math.max(14, srcSize));
      let fontLoaded = false;
      try {
        await figma.loadFontAsync(srcFont);
        fontLoaded = true;
      } catch (_) {
      }
      const previewText = figma.createText();
      previewText.fontName = fontLoaded ? srcFont : { family: "Inter", style: "Bold" };
      previewText.fontSize = previewSize;
      previewText.characters = node.characters.substring(0, 80);
      previewText.fills = [{ type: "SOLID", color: BLACK }];
      previewText.textAutoResize = "HEIGHT";
      preview.appendChild(previewText);
      previewText.layoutSizingHorizontal = "FILL";
      content.appendChild(preview);
      const attrs = figma.createFrame();
      attrs.name = "attributes";
      attrs.layoutMode = "VERTICAL";
      attrs.primaryAxisSizingMode = "AUTO";
      attrs.counterAxisSizingMode = "AUTO";
      attrs.fills = [];
      attrs.itemSpacing = ROW_GAP;
      const token = matchTypography(`${text.fontSize}`);
      const tokenLabel = token ? token.split("/").pop() : null;
      if (token) {
        addPropRow(attrs, "Text style", "", { tokenPill: token });
      }
      addPropRow(attrs, "Font family", "", { tokenPill: text.fontFamily });
      addPropRow(attrs, "Font style", "", { tokenPill: `${text.fontWeight === 700 ? "Bold" : text.fontWeight === 900 ? "Black" : "Regular"}` });
      addPropRow(attrs, "Font size", "", { tokenPill: tokenLabel || `${text.fontSize}` });
      addPropRow(attrs, "Line height", "", { tokenPill: tokenLabel || `${text.lineHeight}` });
      addPropRow(attrs, "Letter spacing", "", { tokenPill: tokenLabel || `${text.letterSpacing}` });
      content.appendChild(attrs);
      if (isCallToAction(node)) {
        addPropRow(content, "Role:", "Call to action", { bold: true });
        const parent = node.parent;
        if (parent && parent.type === "FRAME") {
          const parentFills = getNodeFills(parent);
          for (const f of parentFills) {
            const tok = matchColor(f.hex);
            if (tok) addPropRow(content, "Button bg:", "", { tokenPill: tok });
            else addPropRow(content, "Button bg:", f.hex.toUpperCase());
          }
          const pr = getCornerRadius(parent);
          if (pr !== "0") {
            const rt = matchRadius(pr.replace("px", ""));
            if (rt) addPropRow(content, "Button radius:", "", { tokenPill: rt });
            else addPropRow(content, "Button radius:", pr);
          }
        }
      }
      return;
    }
    case "INSTANCE": {
      const thumb = figma.createFrame();
      thumb.name = "thumbnail";
      thumb.layoutMode = "HORIZONTAL";
      thumb.primaryAxisSizingMode = "AUTO";
      thumb.counterAxisSizingMode = "AUTO";
      thumb.fills = [{ type: "SOLID", color: CONTENT_BG }];
      thumb.paddingTop = 8;
      thumb.paddingBottom = 8;
      thumb.paddingLeft = 8;
      thumb.paddingRight = 8;
      try {
        const instanceClone = node.clone();
        const maxThumbW = 360;
        if (instanceClone.width > maxThumbW) {
          const s = maxThumbW / instanceClone.width;
          instanceClone.rescale(s);
        }
        instanceClone.x = 0;
        instanceClone.y = 0;
        thumb.appendChild(instanceClone);
      } catch (_) {
      }
      content.appendChild(thumb);
      if (isCallToAction(node)) {
        addCtaProperties(node, content);
      }
      return;
    }
    case "VECTOR":
    case "LINE": {
      addPropRow(content, "Height:", `${Math.round(node.height)}`);
      addPropRow(content, "Width:", `${Math.round(node.width)}`);
      const strokes = getNodeStrokes(node);
      for (const stroke of strokes) {
        addPropRow(content, "Border color:", stroke.hex.toUpperCase());
        addPropRow(content, "Border weight:", `${stroke.weight}`);
      }
      if ("strokeAlign" in node) {
        addPropRow(content, "Stroke alignment:", node.strokeAlign);
      }
      if (node.width > 0 && node.height > 0) {
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const w = Math.round(node.width);
        const h = Math.round(node.height);
        const d = gcd(w, h);
        addPropRow(content, "Aspect ratio:", `${w / d}:${h / d}`);
      }
      break;
    }
    default: {
      if (node.width > 0) addPropRow(content, "Width:", `${Math.round(node.width)}`);
      if (node.height > 0) addPropRow(content, "Height:", `${Math.round(node.height)}`);
      const fills = getNodeFills(node);
      for (const fill of fills) {
        const colorToken = matchColor(fill.hex);
        if (colorToken) {
          addPropRow(content, "Background color:", "", { tokenPill: colorToken });
        } else {
          addPropRow(content, "Background color:", fill.hex.toUpperCase());
        }
      }
      const radius = getCornerRadius(node);
      if (radius !== "0") {
        const radiusToken = matchRadius(radius.replace("px", ""));
        if (radiusToken) {
          addPropRow(content, "Border radius:", "", { tokenPill: radiusToken });
        } else {
          addPropRow(content, "Border radius:", radius);
        }
      }
      const isImage = node.name.toLowerCase().includes("image") || node.name.toLowerCase().includes("asset");
      if (isImage && node.width > 0 && node.height > 0) {
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const w = Math.round(node.width);
        const h = Math.round(node.height);
        const d = gcd(w, h);
        addPropRow(content, "Aspect ratio:", `${w / d}:${h / d}`);
      }
      const effects = getEffects(node);
      for (const effect of effects) {
        addPropRow(content, `${effect.type}:`, effect.description);
      }
      break;
    }
  }
}
async function buildAnatomyCard(entry) {
  const card = figma.createFrame();
  card.name = `anatomy-${entry.index}`;
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "AUTO";
  card.fills = [];
  card.itemSpacing = 8;
  const header = figma.createFrame();
  header.name = "header";
  header.layoutMode = "HORIZONTAL";
  header.primaryAxisSizingMode = "AUTO";
  header.counterAxisSizingMode = "AUTO";
  header.fills = [];
  header.itemSpacing = 8;
  header.counterAxisAlignItems = "CENTER";
  const dot = figma.createFrame();
  dot.name = `dot-${entry.index}`;
  dot.resize(DOT_SIZE, DOT_SIZE);
  dot.cornerRadius = DOT_SIZE / 2;
  dot.fills = [{ type: "SOLID", color: MARKER_COLOR }];
  dot.layoutMode = "HORIZONTAL";
  dot.primaryAxisSizingMode = "FIXED";
  dot.counterAxisSizingMode = "FIXED";
  dot.primaryAxisAlignItems = "CENTER";
  dot.counterAxisAlignItems = "CENTER";
  const dotText = figma.createText();
  dotText.fontName = { family: "Inter", style: "Bold" };
  dotText.fontSize = DOT_FONT_SIZE;
  dotText.characters = `${entry.index}`;
  dotText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  dot.appendChild(dotText);
  header.appendChild(dot);
  const nameText = figma.createText();
  nameText.fontName = { family: "Inter", style: "Bold" };
  nameText.fontSize = HEADER_FONT_SIZE;
  nameText.characters = entry.name;
  nameText.fills = [{ type: "SOLID", color: BLACK }];
  header.appendChild(nameText);
  card.appendChild(header);
  const content = figma.createFrame();
  content.name = "content";
  content.layoutMode = "VERTICAL";
  content.primaryAxisSizingMode = "AUTO";
  content.counterAxisSizingMode = "AUTO";
  content.fills = [{ type: "SOLID", color: CONTENT_BG }];
  content.cornerRadius = CONTENT_RADIUS;
  content.paddingTop = 12;
  content.paddingBottom = 12;
  content.paddingLeft = 16;
  content.paddingRight = 16;
  content.itemSpacing = ROW_GAP;
  await buildPropertiesForNode(entry.node, content);
  card.appendChild(content);
  return card;
}
function createMarkerDot(index, x, y, parent) {
  const dot = figma.createFrame();
  dot.name = `marker-${index}`;
  dot.resize(DOT_SIZE, DOT_SIZE);
  dot.cornerRadius = DOT_SIZE / 2;
  dot.fills = [{ type: "SOLID", color: MARKER_COLOR }];
  dot.layoutMode = "HORIZONTAL";
  dot.primaryAxisSizingMode = "FIXED";
  dot.counterAxisSizingMode = "FIXED";
  dot.primaryAxisAlignItems = "CENTER";
  dot.counterAxisAlignItems = "CENTER";
  dot.x = x;
  dot.y = y;
  const text = figma.createText();
  text.fontName = { family: "Inter", style: "Bold" };
  text.fontSize = DOT_FONT_SIZE;
  text.characters = `${index}`;
  text.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  dot.appendChild(text);
  parent.appendChild(dot);
}
async function generateAnatomySection(sourceNode) {
  const section = figma.createFrame();
  section.name = "Anatomy";
  section.layoutMode = "VERTICAL";
  section.primaryAxisSizingMode = "AUTO";
  section.counterAxisSizingMode = "AUTO";
  section.fills = [];
  section.itemSpacing = CARD_GAP;
  const title = figma.createText();
  title.fontName = { family: "Inter", style: "Bold" };
  title.fontSize = SECTION_TITLE_SIZE;
  title.characters = "Anatomy";
  title.fills = [{ type: "SOLID", color: TITLE_COLOR }];
  section.appendChild(title);
  const exhibit = figma.createFrame();
  exhibit.name = "anatomy-exhibit";
  exhibit.layoutMode = "HORIZONTAL";
  exhibit.primaryAxisSizingMode = "AUTO";
  exhibit.counterAxisSizingMode = "AUTO";
  exhibit.fills = [];
  exhibit.itemSpacing = EXHIBIT_GAP;
  const artworkContainer = figma.createFrame();
  artworkContainer.name = "artwork";
  artworkContainer.clipsContent = false;
  artworkContainer.fills = [{ type: "SOLID", color: CONTENT_BG }];
  artworkContainer.cornerRadius = 8;
  artworkContainer.paddingTop = 40;
  artworkContainer.paddingBottom = 40;
  artworkContainer.paddingLeft = 40;
  artworkContainer.paddingRight = 40;
  const clone = sourceNode.clone();
  artworkContainer.appendChild(clone);
  clone.x = 40;
  clone.y = 40;
  artworkContainer.resize(clone.width + 80, clone.height + 80);
  const rawEntries = [];
  const seen = /* @__PURE__ */ new Set();
  collectSignificantNodes(sourceNode, rawEntries, seen);
  const byY = (a, b) => a.node.absoluteTransform[1][2] - b.node.absoluteTransform[1][2];
  const textEntries = rawEntries.filter((e) => e.type === "TEXT" && !isCallToAction(e.node)).sort(byY);
  const ctaSeen = /* @__PURE__ */ new Set();
  const ctaSignature = (n) => {
    var _a, _b;
    const label = n.type === "TEXT" ? n : findFirstTextChild(n);
    if (!label) return null;
    const tp = getTextProps(label);
    if (!tp) return null;
    const fills = getNodeFills(label);
    const colorHex = (_b = (_a = fills[0]) == null ? void 0 : _a.hex) != null ? _b : "";
    return `${tp.fontFamily}|${tp.fontWeight}|${tp.fontSize}|${label.textDecoration}|${colorHex}`;
  };
  const ctaEntries = rawEntries.filter((e) => isCallToAction(e.node)).sort(byY).filter((e) => {
    const sig = ctaSignature(e.node);
    if (!sig) return true;
    if (ctaSeen.has(sig)) return false;
    ctaSeen.add(sig);
    return true;
  });
  const textNames = new Set(textEntries.map((e) => e.name));
  const instanceEntries = rawEntries.filter((e) => e.type === "INSTANCE" && !isCallToAction(e.node)).filter((e) => {
    if ("children" in e.node) {
      const children = e.node.children;
      const hasAnnotatedTextChild = children.some(
        (c) => c.type === "TEXT" && textNames.has(c.name)
      );
      if (hasAnnotatedTextChild) return false;
    }
    return true;
  }).sort(byY);
  const entries = [...textEntries, ...ctaEntries, ...instanceEntries].map((e, i) => __spreadProps(__spreadValues({}, e), {
    index: i + 1
  }));
  const dotPositions = [];
  for (const entry of entries) {
    const entryNode = entry.node;
    const relX = entryNode.absoluteTransform[0][2] - sourceNode.absoluteTransform[0][2];
    const relY = entryNode.absoluteTransform[1][2] - sourceNode.absoluteTransform[1][2];
    const w = entryNode.width;
    const h = entryNode.height;
    let dotX;
    let dotY;
    let altX;
    let altY;
    if (entryNode.type === "TEXT") {
      const t = entryNode;
      const align = t.textAlignHorizontal;
      const centerY = relY + h / 2;
      const fontSize = t.fontSize !== figma.mixed ? t.fontSize : 14;
      const estTextWidth = Math.min(t.characters.length * fontSize * 0.55, w);
      if (align === "CENTER") {
        dotX = relX - DOT_SIZE - 2;
        dotY = relY + h / 2 - DOT_SIZE / 2;
        altX = relX + (w + estTextWidth) / 2 + 2;
        altY = dotY;
      } else if (align === "RIGHT") {
        dotX = relX + w - DOT_SIZE - 2;
        dotY = centerY - DOT_SIZE / 2;
        altX = relX - DOT_SIZE - 2;
        altY = dotY;
      } else {
        dotX = relX - DOT_SIZE - 2;
        dotY = centerY - DOT_SIZE / 2;
        altX = relX + estTextWidth + 4;
        altY = dotY;
      }
    } else {
      dotX = relX + 4;
      dotY = relY + 4;
      altX = relX + w - DOT_SIZE - 4;
      altY = relY + 4;
    }
    dotPositions.push({ index: entry.index, x: dotX + 40, y: dotY + 40, altX: altX + 40, altY: altY + 40, flipped: false });
  }
  const minDist = DOT_SIZE + 4;
  function getPos(p) {
    return { x: p.flipped ? p.altX : p.x, y: p.flipped ? p.altY : p.y };
  }
  function overlaps(b) {
    const bp = getPos(b);
    for (const a of dotPositions) {
      if (a === b) continue;
      const ap = getPos(a);
      const dx = bp.x - ap.x;
      const dy = bp.y - ap.y;
      if (Math.sqrt(dx * dx + dy * dy) < minDist) return true;
    }
    return false;
  }
  for (let i = 0; i < dotPositions.length; i++) {
    if (overlaps(dotPositions[i])) {
      dotPositions[i].flipped = true;
    }
  }
  for (const pos of dotPositions) {
    const finalX = pos.flipped ? pos.altX : pos.x;
    const finalY = pos.flipped ? pos.altY : pos.y;
    createMarkerDot(pos.index, finalX, finalY, artworkContainer);
  }
  exhibit.appendChild(artworkContainer);
  const contentRail = figma.createFrame();
  contentRail.name = "content-rail";
  contentRail.layoutMode = "VERTICAL";
  contentRail.counterAxisSizingMode = "FIXED";
  contentRail.resize(CONTENT_RAIL_WIDTH, 1);
  contentRail.primaryAxisSizingMode = "AUTO";
  contentRail.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  contentRail.itemSpacing = CARD_GAP;
  contentRail.paddingTop = 16;
  contentRail.paddingBottom = 16;
  contentRail.paddingLeft = 16;
  contentRail.paddingRight = 16;
  for (const entry of entries) {
    const card = await buildAnatomyCard(entry);
    contentRail.appendChild(card);
  }
  exhibit.appendChild(contentRail);
  section.appendChild(exhibit);
  return section;
}

// apps/consonant-specs-plugin/src/spec-layout.ts
function removeOverlays(node, overlayName) {
  if (!("children" in node)) return;
  const toRemove = node.children.filter((c) => c.name === overlayName);
  for (const child of toRemove) child.remove();
  for (const child of node.children) {
    if ("children" in child) {
      const nested = child.children.filter((c) => c.name === overlayName);
      for (const n of nested) n.remove();
    }
  }
}
var SECTION_TITLE_SIZE2 = 48;
var DARK = "#1A1A1A";
var GRAY = "#999999";
var LABEL_GRAY = "#737373";
var VALUE_DARK = "#262626";
var WHITE = "#FFFFFF";
var BG_LIGHT = "#F7F7F7";
var OVERLAY_OUTLINE = "#D42B2B";
var OVERLAY_INNER = "#E8A0BF";
var OVERLAY_INNER_OPACITY = 0.25;
var LABEL_PX_BG = "#C54500";
var LABEL_TOKEN_BG = "#D946A8";
var OUTLINE_WEIGHT = 1.5;
var OUTLINE_DASH = [6, 4];
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255
  };
}
function collectLayoutEntries(node, entries, depth = 0) {
  const autoLayout = getAutoLayoutProps(node);
  if (autoLayout !== null && "children" in node && node.children.length > 0) {
    entries.push({ node, name: node.name, depth });
  }
  if ("children" in node) {
    for (const child of node.children) {
      collectLayoutEntries(child, entries, depth + 1);
    }
  }
}
function buildLayerTree(node, depth = 0) {
  const treeNode = {
    name: node.name,
    type: node.type,
    depth,
    nodeId: node.id,
    children: []
  };
  if ("children" in node) {
    for (const child of node.children) {
      treeNode.children.push(buildLayerTree(child, depth + 1));
    }
  }
  return treeNode;
}
function flattenLayerTree(tree) {
  const result2 = [];
  function walk(n) {
    result2.push({ name: n.name, depth: n.depth, nodeId: n.nodeId });
    for (const child of n.children) {
      walk(child);
    }
  }
  walk(tree);
  return result2;
}
function renderLayerTreePanel(layerTree, currentNodeId) {
  const panel = figma.createFrame();
  panel.name = "layer-tree-panel";
  panel.layoutMode = "VERTICAL";
  panel.counterAxisSizingMode = "FIXED";
  panel.resize(280, 1);
  panel.primaryAxisSizingMode = "AUTO";
  panel.fills = [];
  panel.itemSpacing = 2;
  const flat = flattenLayerTree(layerTree);
  for (const entry of flat) {
    const row = figma.createFrame();
    row.name = `layer-${entry.nodeId}`;
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisSizingMode = "AUTO";
    row.counterAxisSizingMode = "AUTO";
    row.fills = [];
    row.itemSpacing = 0;
    row.paddingLeft = entry.depth * 12;
    const label = figma.createText();
    const isCurrent = entry.nodeId === currentNodeId;
    label.fontName = { family: "Inter", style: isCurrent ? "Bold" : "Regular" };
    label.fontSize = 11;
    label.characters = entry.name;
    label.fills = [{ type: "SOLID", color: hexToRgb(isCurrent ? DARK : GRAY) }];
    row.appendChild(label);
    panel.appendChild(row);
  }
  return panel;
}
function getSizingMode(node, axis) {
  if (axis === "horizontal") {
    if ("layoutSizingHorizontal" in node) {
      const mode = node.layoutSizingHorizontal;
      if (mode === "HUG") return "Hug";
      if (mode === "FILL") return "Fill";
    }
    return "Fixed";
  } else {
    if ("layoutSizingVertical" in node) {
      const mode = node.layoutSizingVertical;
      if (mode === "HUG") return "Hug";
      if (mode === "FILL") return "Fill";
    }
    return "Fixed";
  }
}
function getAlignmentString(node) {
  var _a, _b;
  if (!("primaryAxisAlignItems" in node)) return "Top Left";
  const primary = node.primaryAxisAlignItems;
  const counter = node.counterAxisAlignItems;
  const direction = "layoutMode" in node ? node.layoutMode : "NONE";
  let vertPos;
  let horizPos;
  const primaryMap = {
    MIN: direction === "VERTICAL" ? "Top" : "Left",
    CENTER: "Center",
    MAX: direction === "VERTICAL" ? "Bottom" : "Right",
    SPACE_BETWEEN: "Space Between"
  };
  if (direction === "VERTICAL") {
    vertPos = (_a = primaryMap[primary]) != null ? _a : "Top";
    horizPos = counter === "MIN" ? "Left" : counter === "CENTER" ? "Center" : counter === "MAX" ? "Right" : "Left";
  } else {
    horizPos = (_b = primaryMap[primary]) != null ? _b : "Left";
    vertPos = counter === "MIN" ? "Top" : counter === "CENTER" ? "Center" : counter === "MAX" ? "Bottom" : "Top";
  }
  return `${vertPos} ${horizPos}`;
}
function addPropertyRow(parent, label, value, icon) {
  const row = figma.createFrame();
  row.name = `prop-${label}`;
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.fills = [];
  row.itemSpacing = 6;
  const labelText = figma.createText();
  labelText.fontName = { family: "Inter", style: "Regular" };
  labelText.fontSize = 11;
  labelText.characters = label;
  labelText.fills = [{ type: "SOLID", color: hexToRgb(LABEL_GRAY) }];
  row.appendChild(labelText);
  if (icon) {
    const valueFrame = figma.createFrame();
    valueFrame.name = "value-frame";
    valueFrame.layoutMode = "HORIZONTAL";
    valueFrame.primaryAxisSizingMode = "AUTO";
    valueFrame.counterAxisSizingMode = "AUTO";
    valueFrame.fills = [];
    valueFrame.itemSpacing = 4;
    const iconText = figma.createText();
    iconText.fontName = { family: "Inter", style: "Regular" };
    iconText.fontSize = 11;
    iconText.characters = icon;
    iconText.fills = [{ type: "SOLID", color: hexToRgb(VALUE_DARK) }];
    valueFrame.appendChild(iconText);
    const valueText = figma.createText();
    valueText.fontName = { family: "Inter", style: "Medium" };
    valueText.fontSize = 11;
    valueText.characters = value;
    valueText.fills = [{ type: "SOLID", color: hexToRgb(VALUE_DARK) }];
    valueFrame.appendChild(valueText);
    row.appendChild(valueFrame);
  } else {
    const valueText = figma.createText();
    valueText.fontName = { family: "Inter", style: "Medium" };
    valueText.fontSize = 11;
    valueText.characters = value;
    valueText.fills = [{ type: "SOLID", color: hexToRgb(VALUE_DARK) }];
    row.appendChild(valueText);
  }
  parent.appendChild(row);
}
function renderPropertyPanel(entry) {
  const panel = figma.createFrame();
  panel.name = "property-panel";
  panel.layoutMode = "VERTICAL";
  panel.counterAxisSizingMode = "FIXED";
  panel.resize(250, 1);
  panel.primaryAxisSizingMode = "AUTO";
  panel.fills = [];
  panel.itemSpacing = 8;
  const node = entry.node;
  const nameText = figma.createText();
  nameText.fontName = { family: "Inter", style: "Bold" };
  nameText.fontSize = 13;
  nameText.characters = node.name;
  nameText.fills = [{ type: "SOLID", color: hexToRgb(DARK) }];
  panel.appendChild(nameText);
  const wMode = getSizingMode(node, "horizontal");
  addPropertyRow(panel, "Width", `${wMode} ${Math.round(node.width)}px`);
  const hMode = getSizingMode(node, "vertical");
  addPropertyRow(panel, "Height", `${hMode} ${Math.round(node.height)}px`);
  const fills = getNodeFills(node);
  if (fills.length > 0) {
    const fill = fills[0];
    const token = matchColor(fill.hex);
    if (token) {
      addPropertyRow(panel, "Fill variable", token);
    }
  }
  const autoLayout = getAutoLayoutProps(node);
  if (autoLayout) {
    const dirArrow = autoLayout.direction === "VERTICAL" ? "\u2193" : "\u2192";
    const dirLabel = autoLayout.direction === "VERTICAL" ? "Vertical" : "Horizontal";
    addPropertyRow(panel, "Direction", `${dirArrow} ${dirLabel}`);
    addPropertyRow(panel, "Align Children", getAlignmentString(node));
    const { paddingTop: pt, paddingRight: pr, paddingBottom: pb, paddingLeft: pl } = autoLayout;
    if (pt > 0 || pr > 0 || pb > 0 || pl > 0) {
      let paddingStr;
      if (pt === pr && pr === pb && pb === pl) {
        paddingStr = `${pt}px`;
      } else if (pt === pb && pr === pl) {
        paddingStr = `${pt}px ${pr}px`;
      } else {
        paddingStr = `${pt}px ${pr}px ${pb}px ${pl}px`;
      }
      addPropertyRow(panel, "Padding", paddingStr);
    }
    const gap = autoLayout.gap;
    if (gap > 0) {
      const gapToken = matchSpacing(`${gap}`);
      const gapStr = gapToken ? gapToken : `${gap}`;
      addPropertyRow(panel, "Gap", gapStr);
    }
  }
  return panel;
}
function getRelativeBox(node, root, scale) {
  const nodeABB = "absoluteBoundingBox" in node ? node.absoluteBoundingBox : null;
  const rootABB = "absoluteBoundingBox" in root ? root.absoluteBoundingBox : null;
  if (nodeABB && rootABB) {
    return {
      x: (nodeABB.x - rootABB.x) * scale,
      y: (nodeABB.y - rootABB.y) * scale,
      width: nodeABB.width * scale,
      height: nodeABB.height * scale
    };
  }
  const nodeX = node.absoluteTransform[0][2];
  const nodeY = node.absoluteTransform[1][2];
  const rootX = root.absoluteTransform[0][2];
  const rootY = root.absoluteTransform[1][2];
  return {
    x: (nodeX - rootX) * scale,
    y: (nodeY - rootY) * scale,
    width: node.width * scale,
    height: node.height * scale
  };
}
function drawDashedRect(box, parent) {
  const rect = figma.createRectangle();
  rect.name = "outline-dashed";
  rect.resize(Math.max(box.width, 1), Math.max(box.height, 1));
  rect.x = box.x;
  rect.y = box.y;
  rect.fills = [];
  rect.strokes = [{ type: "SOLID", color: hexToRgb(OVERLAY_OUTLINE) }];
  rect.strokeWeight = OUTLINE_WEIGHT;
  rect.dashPattern = OUTLINE_DASH;
  parent.appendChild(rect);
}
function drawOverlayRect(x, y, w, h, color, opacity, parent) {
  if (w <= 0 || h <= 0) return;
  const rect = figma.createRectangle();
  rect.name = "overlay-band";
  rect.resize(w, h);
  rect.x = x;
  rect.y = y;
  rect.fills = [{
    type: "SOLID",
    color: hexToRgb(color),
    opacity
  }];
  parent.appendChild(rect);
}
function drawPaddingBands(artworkFrame, exhibitedNode, sourceNode, scale, margin) {
  const autoLayout = getAutoLayoutProps(exhibitedNode);
  if (!autoLayout) return;
  const raw = getRelativeBox(exhibitedNode, sourceNode, scale);
  const box = { x: raw.x + margin, y: raw.y + margin, width: raw.width, height: raw.height };
  const { paddingTop, paddingRight, paddingBottom, paddingLeft } = autoLayout;
  const pt = paddingTop * scale;
  const pr = paddingRight * scale;
  const pb = paddingBottom * scale;
  const pl = paddingLeft * scale;
  if (pt > 0) drawOverlayRect(box.x, box.y, box.width, pt, OVERLAY_INNER, OVERLAY_INNER_OPACITY, artworkFrame);
  if (pb > 0) drawOverlayRect(box.x, box.y + box.height - pb, box.width, pb, OVERLAY_INNER, OVERLAY_INNER_OPACITY, artworkFrame);
  if (pl > 0) drawOverlayRect(box.x, box.y, pl, box.height, OVERLAY_INNER, OVERLAY_INNER_OPACITY, artworkFrame);
  if (pr > 0) drawOverlayRect(box.x + box.width - pr, box.y, pr, box.height, OVERLAY_INNER, OVERLAY_INNER_OPACITY, artworkFrame);
}
function drawSpacingBands(artworkFrame, exhibitedNode, sourceNode, scale, margin) {
  const autoLayout = getAutoLayoutProps(exhibitedNode);
  if (!autoLayout) return;
  if (!("children" in exhibitedNode) || exhibitedNode.children.length < 2) return;
  const gap = autoLayout.gap * scale;
  if (gap <= 0) return;
  const rawNodeBox = getRelativeBox(exhibitedNode, sourceNode, scale);
  const nodeBox = { x: rawNodeBox.x + margin, y: rawNodeBox.y + margin, width: rawNodeBox.width, height: rawNodeBox.height };
  const children = Array.from(exhibitedNode.children).filter((c) => !c.name.includes("-overlay"));
  for (let i = 0; i < children.length - 1; i++) {
    const a = children[i];
    const b = children[i + 1];
    const rawA = getRelativeBox(a, sourceNode, scale);
    const rawB = getRelativeBox(b, sourceNode, scale);
    const aBox = { x: rawA.x + margin, y: rawA.y + margin, width: rawA.width, height: rawA.height };
    const bBox = { x: rawB.x + margin, y: rawB.y + margin, width: rawB.width, height: rawB.height };
    if (autoLayout.direction === "HORIZONTAL") {
      const gapX = aBox.x + aBox.width;
      const gapY = nodeBox.y;
      const gapW = bBox.x - gapX;
      const gapH = nodeBox.height;
      drawOverlayRect(gapX, gapY, gapW, gapH, OVERLAY_INNER, OVERLAY_INNER_OPACITY, artworkFrame);
    } else {
      const gapX = nodeBox.x;
      const gapY = aBox.y + aBox.height;
      const gapW = nodeBox.width;
      const gapH = bBox.y - gapY;
      drawOverlayRect(gapX, gapY, gapW, gapH, OVERLAY_INNER, OVERLAY_INNER_OPACITY, artworkFrame);
    }
  }
}
function createMeasureLabel(value, x, y, parent) {
  const bg = figma.createFrame();
  bg.name = "measure-label";
  bg.layoutMode = "HORIZONTAL";
  bg.primaryAxisSizingMode = "AUTO";
  bg.counterAxisSizingMode = "AUTO";
  bg.fills = [{ type: "SOLID", color: hexToRgb(LABEL_PX_BG) }];
  bg.cornerRadius = 3;
  bg.paddingTop = 2;
  bg.paddingBottom = 2;
  bg.paddingLeft = 5;
  bg.paddingRight = 5;
  bg.x = x;
  bg.y = y;
  const text = figma.createText();
  text.fontName = { family: "Inter", style: "Bold" };
  text.fontSize = 10;
  text.characters = value;
  text.fills = [{ type: "SOLID", color: hexToRgb(WHITE) }];
  bg.appendChild(text);
  parent.appendChild(bg);
}
function createTokenBadge(tokenName, value, x, y, parent) {
  const bg = figma.createFrame();
  bg.name = "token-badge";
  bg.layoutMode = "HORIZONTAL";
  bg.primaryAxisSizingMode = "AUTO";
  bg.counterAxisSizingMode = "AUTO";
  bg.fills = [{ type: "SOLID", color: hexToRgb(LABEL_TOKEN_BG) }];
  bg.cornerRadius = 3;
  bg.paddingTop = 2;
  bg.paddingBottom = 2;
  bg.paddingLeft = 6;
  bg.paddingRight = 6;
  bg.x = x;
  bg.y = y;
  const text = figma.createText();
  text.fontName = { family: "Inter", style: "Medium" };
  text.fontSize = 9;
  text.characters = `${tokenName} ${value}`;
  text.fills = [{ type: "SOLID", color: hexToRgb(WHITE) }];
  bg.appendChild(text);
  parent.appendChild(bg);
}
function drawMeasurements(artworkFrame, exhibitedNode, sourceNode, scale, margin) {
  const autoLayout = getAutoLayoutProps(exhibitedNode);
  const rawBox = getRelativeBox(exhibitedNode, sourceNode, scale);
  const box = { x: rawBox.x + margin, y: rawBox.y + margin, width: rawBox.width, height: rawBox.height };
  const widthStr = `${Math.round(exhibitedNode.width)}`;
  const widthToken = matchSpacing(`${Math.round(exhibitedNode.width)}`);
  const labelW = widthStr.length * 6;
  createMeasureLabel(widthStr, box.x + box.width / 2 - labelW / 2, box.y - 20, artworkFrame);
  if (widthToken) {
    createTokenBadge(widthToken, widthStr, box.x + box.width / 2 - labelW / 2, box.y - 36, artworkFrame);
  }
  if (autoLayout) {
    const { paddingTop, paddingRight, paddingBottom, paddingLeft, gap } = autoLayout;
    const pt = paddingTop * scale;
    const pr = paddingRight * scale;
    const pb = paddingBottom * scale;
    const pl = paddingLeft * scale;
    if (pt > 0) {
      createMeasureLabel(`${paddingTop}px`, box.x + box.width / 2 - 15, box.y + pt / 2 - 8, artworkFrame);
    }
    if (pb > 0) {
      createMeasureLabel(`${paddingBottom}px`, box.x + box.width / 2 - 15, box.y + box.height - pb + pb / 2 - 8, artworkFrame);
    }
    if (pl > 0) {
      createMeasureLabel(`${paddingLeft}px`, box.x + pl / 2 - 12, box.y + box.height / 2 - 8, artworkFrame);
    }
    if (pr > 0) {
      createMeasureLabel(`${paddingRight}px`, box.x + box.width - pr + pr / 2 - 12, box.y + box.height / 2 - 8, artworkFrame);
    }
    if ("children" in exhibitedNode && exhibitedNode.children.length > 0) {
      const allChildren = Array.from(exhibitedNode.children);
      const children = allChildren.slice(0, 8);
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const rawChildBox = getRelativeBox(child, sourceNode, scale);
        const childBox = { x: rawChildBox.x + margin, y: rawChildBox.y + margin, width: rawChildBox.width, height: rawChildBox.height };
        const childWidthStr = `${Math.round(child.width)}`;
        const cLabelW = childWidthStr.length * 6;
        createMeasureLabel(childWidthStr, childBox.x + childBox.width / 2 - cLabelW / 2, childBox.y + childBox.height + 4, artworkFrame);
        createMeasureLabel(
          `${Math.round(child.height)}`,
          childBox.x + childBox.width + 4,
          childBox.y + childBox.height / 2 - 7,
          artworkFrame
        );
        if (i < children.length - 1 && gap > 0) {
          const next = children[i + 1];
          const rawNextBox = getRelativeBox(next, sourceNode, scale);
          const nextBox = { x: rawNextBox.x + margin, y: rawNextBox.y + margin, width: rawNextBox.width, height: rawNextBox.height };
          const gapStr = `${gap}px`;
          const gToken = matchSpacing(`${gap}`);
          if (autoLayout.direction === "HORIZONTAL") {
            const gapMidX = childBox.x + childBox.width + (nextBox.x - childBox.x - childBox.width) / 2;
            const gapMidY = childBox.y + childBox.height / 2 - 8;
            createMeasureLabel(gapStr, gapMidX - 12, gapMidY, artworkFrame);
            if (gToken) {
              createTokenBadge(gToken, gapStr, gapMidX - 20, gapMidY - 16, artworkFrame);
            }
          } else {
            const gapMidX = childBox.x + childBox.width / 2 - 12;
            const gapMidY = childBox.y + childBox.height + (nextBox.y - childBox.y - childBox.height) / 2 - 8;
            createMeasureLabel(gapStr, gapMidX, gapMidY, artworkFrame);
            if (gToken) {
              createTokenBadge(gToken, gapStr, gapMidX - 8, gapMidY - 16, artworkFrame);
            }
          }
        }
      }
    }
  }
}
var ARTWORK_MARGIN = 40;
function createArtworkPanel(sourceNode, exhibitedNode) {
  const artworkFrame = figma.createFrame();
  artworkFrame.name = "artwork-panel";
  artworkFrame.clipsContent = false;
  artworkFrame.fills = [];
  const clone = sourceNode.clone();
  clone.x = ARTWORK_MARGIN;
  clone.y = ARTWORK_MARGIN;
  const scale = 1;
  artworkFrame.appendChild(clone);
  artworkFrame.resize(
    Math.max(clone.width + ARTWORK_MARGIN * 2, 1),
    Math.max(clone.height + ARTWORK_MARGIN * 2, 1)
  );
  const rawExhibitBox = getRelativeBox(exhibitedNode, sourceNode, scale);
  const exhibitBox = {
    x: rawExhibitBox.x + ARTWORK_MARGIN,
    y: rawExhibitBox.y + ARTWORK_MARGIN,
    width: rawExhibitBox.width,
    height: rawExhibitBox.height
  };
  drawDashedRect(exhibitBox, artworkFrame);
  drawPaddingBands(artworkFrame, exhibitedNode, sourceNode, scale, ARTWORK_MARGIN);
  drawSpacingBands(artworkFrame, exhibitedNode, sourceNode, scale, ARTWORK_MARGIN);
  drawMeasurements(artworkFrame, exhibitedNode, sourceNode, scale, ARTWORK_MARGIN);
  return artworkFrame;
}
function createExhibit(sourceNode, entry, layerTree) {
  const exhibit = figma.createFrame();
  exhibit.name = `exhibit-${entry.name}`;
  exhibit.layoutMode = "HORIZONTAL";
  exhibit.primaryAxisSizingMode = "AUTO";
  exhibit.counterAxisSizingMode = "AUTO";
  exhibit.fills = [{ type: "SOLID", color: hexToRgb(BG_LIGHT) }];
  exhibit.cornerRadius = 8;
  exhibit.paddingTop = 24;
  exhibit.paddingBottom = 24;
  exhibit.paddingLeft = 24;
  exhibit.paddingRight = 24;
  exhibit.itemSpacing = 32;
  const layerPanel = renderLayerTreePanel(layerTree, entry.node.id);
  const artworkPanel = createArtworkPanel(sourceNode, entry.node);
  const propPanel = renderPropertyPanel(entry);
  exhibit.appendChild(layerPanel);
  exhibit.appendChild(artworkPanel);
  exhibit.appendChild(propPanel);
  return exhibit;
}
function drawSpacingOnlyMeasurements(artworkFrame, exhibitedNode, sourceNode, scale, margin) {
  const autoLayout = getAutoLayoutProps(exhibitedNode);
  if (!autoLayout) return;
  const rawBox = getRelativeBox(exhibitedNode, sourceNode, scale);
  const box = { x: rawBox.x + margin, y: rawBox.y + margin, width: rawBox.width, height: rawBox.height };
  const { paddingTop, paddingRight, paddingBottom, paddingLeft, gap } = autoLayout;
  const pt = paddingTop * scale;
  const pr = paddingRight * scale;
  const pb = paddingBottom * scale;
  const pl = paddingLeft * scale;
  if (pt > 0) {
    const x = box.x + box.width / 2 - 15, y = box.y + pt / 2 - 8;
    const t = matchSpacing(`${paddingTop}`);
    if (t) createTokenBadge(t, `${paddingTop}px`, x - 8, y, artworkFrame);
    else createMeasureLabel(`${paddingTop}px`, x, y, artworkFrame);
  }
  if (pb > 0) {
    const x = box.x + box.width / 2 - 15, y = box.y + box.height - pb + pb / 2 - 8;
    const t = matchSpacing(`${paddingBottom}`);
    if (t) createTokenBadge(t, `${paddingBottom}px`, x - 8, y, artworkFrame);
    else createMeasureLabel(`${paddingBottom}px`, x, y, artworkFrame);
  }
  if (pl > 0) {
    const x = box.x + pl / 2 - 12, y = box.y + box.height / 2 - 8;
    const t = matchSpacing(`${paddingLeft}`);
    if (t) createTokenBadge(t, `${paddingLeft}px`, x - 8, y, artworkFrame);
    else createMeasureLabel(`${paddingLeft}px`, x, y, artworkFrame);
  }
  if (pr > 0) {
    const x = box.x + box.width - pr + pr / 2 - 12, y = box.y + box.height / 2 - 8;
    const t = matchSpacing(`${paddingRight}`);
    if (t) createTokenBadge(t, `${paddingRight}px`, x - 8, y, artworkFrame);
    else createMeasureLabel(`${paddingRight}px`, x, y, artworkFrame);
  }
  if ("children" in exhibitedNode && exhibitedNode.children.length > 1 && gap > 0) {
    const children = Array.from(exhibitedNode.children).filter((c) => !c.name.includes("-overlay")).slice(0, 8);
    for (let i = 0; i < children.length - 1; i++) {
      const rawA = getRelativeBox(children[i], sourceNode, scale);
      const rawB = getRelativeBox(children[i + 1], sourceNode, scale);
      const aBox = { x: rawA.x + margin, y: rawA.y + margin, width: rawA.width, height: rawA.height };
      const bBox = { x: rawB.x + margin, y: rawB.y + margin, width: rawB.width, height: rawB.height };
      const gapStr = `${gap}px`;
      const gToken = matchSpacing(`${gap}`);
      if (autoLayout.direction === "HORIZONTAL") {
        const gapMidX = aBox.x + aBox.width + (bBox.x - aBox.x - aBox.width) / 2;
        const gapMidY = aBox.y + aBox.height / 2 - 8;
        if (gToken) createTokenBadge(gToken, gapStr, gapMidX - 20, gapMidY, artworkFrame);
        else createMeasureLabel(gapStr, gapMidX - 12, gapMidY, artworkFrame);
      } else {
        const gapMidX = aBox.x + aBox.width / 2 - 12;
        const gapMidY = aBox.y + aBox.height + (bBox.y - aBox.y - aBox.height) / 2 - 8;
        if (gToken) createTokenBadge(gToken, gapStr, gapMidX - 8, gapMidY, artworkFrame);
        else createMeasureLabel(gapStr, gapMidX, gapMidY, artworkFrame);
      }
    }
  }
}
async function generateSpacingSection(sourceNode) {
  if (!("children" in sourceNode) || sourceNode.children.length === 0) return;
  removeOverlays(sourceNode, "spacing-detailed-overlay");
  const overlay = figma.createFrame();
  overlay.name = "spacing-detailed-overlay";
  overlay.resize(sourceNode.width, sourceNode.height);
  overlay.fills = [];
  overlay.clipsContent = false;
  if ("clipsContent" in sourceNode) sourceNode.clipsContent = false;
  sourceNode.appendChild(overlay);
  if ("layoutMode" in sourceNode && sourceNode.layoutMode !== "NONE") {
    overlay.layoutPositioning = "ABSOLUTE";
  }
  overlay.resize(sourceNode.width, sourceNode.height);
  overlay.x = 0;
  overlay.y = 0;
  const scale = 1;
  const margin = 0;
  drawPaddingBands(overlay, sourceNode, sourceNode, scale, margin);
  drawSpacingBands(overlay, sourceNode, sourceNode, scale, margin);
  drawSpacingOnlyMeasurements(overlay, sourceNode, sourceNode, scale, margin);
  function drawChildSpacing(node) {
    if (!("children" in node)) return;
    for (const child of node.children) {
      if (child.name === "spacing-detailed-overlay") continue;
      if (child.height <= 48) continue;
      const al = getAutoLayoutProps(child);
      if (al && "children" in child && child.children.length > 0) {
        drawPaddingBands(overlay, child, sourceNode, scale, margin);
        drawSpacingBands(overlay, child, sourceNode, scale, margin);
        drawSpacingOnlyMeasurements(overlay, child, sourceNode, scale, margin);
      }
      drawChildSpacing(child);
    }
  }
  drawChildSpacing(sourceNode);
}
async function generateLayoutSection(sourceNode) {
  const entries = [];
  collectLayoutEntries(sourceNode, entries);
  if (entries.length === 0) return null;
  const layerTree = buildLayerTree(sourceNode);
  const section = figma.createFrame();
  section.name = "Layout and spacing";
  section.layoutMode = "VERTICAL";
  section.primaryAxisSizingMode = "AUTO";
  section.counterAxisSizingMode = "AUTO";
  section.fills = [];
  section.itemSpacing = 24;
  const title = figma.createText();
  title.fontName = { family: "Inter", style: "Bold" };
  title.fontSize = SECTION_TITLE_SIZE2;
  title.characters = "Layout and spacing";
  title.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  section.appendChild(title);
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    figma.ui.postMessage({
      type: "spec-it-status",
      message: `Generating layout exhibit ${i + 1} of ${entries.length}: ${entry.name}\u2026`
    });
    const exhibit = createExhibit(sourceNode, entry, layerTree);
    section.appendChild(exhibit);
  }
  return section;
}

// apps/consonant-specs-plugin/src/spec-typography.ts
function collectTextStyles(node, styles) {
  const text = getTextProps(node);
  if (text) {
    const key = `${text.fontFamily}-${text.fontSize}-${text.fontWeight}-${text.lineHeight}`;
    const existing = styles.get(key);
    if (existing) {
      if (!existing.usedBy.includes(node.name)) {
        existing.usedBy.push(node.name);
      }
    } else {
      styles.set(key, {
        fontFamily: text.fontFamily,
        fontSize: text.fontSize,
        fontWeight: text.fontWeight,
        lineHeight: text.lineHeight,
        letterSpacing: text.letterSpacing,
        token: matchTypography(text.fontFamily) || matchTypography(`${text.fontSize}`),
        usedBy: [node.name]
      });
    }
  }
  if ("children" in node) {
    for (const child of node.children) {
      collectTextStyles(child, styles);
    }
  }
}
var LABEL_COLOR = { r: 0.45, g: 0.45, b: 0.45 };
var VALUE_COLOR = { r: 0.15, g: 0.15, b: 0.15 };
var TOKEN_COLOR = { r: 0.18, g: 0.62, b: 0.47 };
var HEADER_BG = { r: 0.95, g: 0.95, b: 0.95 };
var ROW_FONT_SIZE = 10;
function createTableHeader(parent) {
  const row = figma.createFrame();
  row.name = "header-row";
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.resize(800, 1);
  row.layoutAlign = "STRETCH";
  row.fills = [{ type: "SOLID", color: HEADER_BG }];
  row.paddingTop = 6;
  row.paddingBottom = 6;
  row.paddingLeft = 8;
  row.paddingRight = 8;
  row.itemSpacing = 0;
  const columns = ["Font Family", "Size", "Weight", "Line Height", "Letter Sp.", "Token", "Used By"];
  const widths = [140, 50, 55, 75, 70, 160, 250];
  for (let i = 0; i < columns.length; i++) {
    const cell = figma.createText();
    cell.fontName = { family: "Inter", style: "Bold" };
    cell.fontSize = ROW_FONT_SIZE;
    cell.characters = columns[i];
    cell.fills = [{ type: "SOLID", color: LABEL_COLOR }];
    cell.resize(widths[i], cell.height);
    cell.textAutoResize = "HEIGHT";
    row.appendChild(cell);
  }
  parent.appendChild(row);
}
function createTableRow(entry, parent) {
  const row = figma.createFrame();
  row.name = `type-${entry.fontFamily}-${entry.fontSize}`;
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.resize(800, 1);
  row.layoutAlign = "STRETCH";
  row.fills = [];
  row.paddingTop = 5;
  row.paddingBottom = 5;
  row.paddingLeft = 8;
  row.paddingRight = 8;
  row.itemSpacing = 0;
  const values = [
    entry.fontFamily,
    `${entry.fontSize}`,
    `${entry.fontWeight}`,
    entry.lineHeight,
    entry.letterSpacing,
    entry.token || "\u2014",
    entry.usedBy.slice(0, 3).join(", ") + (entry.usedBy.length > 3 ? ` +${entry.usedBy.length - 3}` : "")
  ];
  const widths = [140, 50, 55, 75, 70, 160, 250];
  for (let i = 0; i < values.length; i++) {
    const cell = figma.createText();
    cell.fontName = { family: "Inter", style: "Regular" };
    cell.fontSize = ROW_FONT_SIZE;
    cell.characters = values[i];
    cell.fills = [{ type: "SOLID", color: i === 5 && entry.token ? TOKEN_COLOR : VALUE_COLOR }];
    cell.resize(widths[i], cell.height);
    cell.textAutoResize = "HEIGHT";
    row.appendChild(cell);
  }
  const div = figma.createRectangle();
  div.name = "row-divider";
  div.resize(800, 1);
  div.fills = [{ type: "SOLID", color: { r: 0.93, g: 0.93, b: 0.93 } }];
  div.layoutAlign = "STRETCH";
  parent.appendChild(row);
  parent.appendChild(div);
}
async function generateTypographySection(sourceNode) {
  const styles = /* @__PURE__ */ new Map();
  collectTextStyles(sourceNode, styles);
  if (styles.size === 0) return null;
  const section = figma.createFrame();
  section.name = "Typography Summary";
  section.layoutMode = "VERTICAL";
  section.primaryAxisSizingMode = "AUTO";
  section.counterAxisSizingMode = "AUTO";
  section.fills = [];
  section.itemSpacing = 16;
  const title = figma.createText();
  title.fontName = { family: "Inter", style: "Bold" };
  title.fontSize = 24;
  title.characters = "Typography";
  title.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  section.appendChild(title);
  const table = figma.createFrame();
  table.name = "typography-table";
  table.layoutMode = "VERTICAL";
  table.primaryAxisSizingMode = "AUTO";
  table.counterAxisSizingMode = "AUTO";
  table.fills = [{ type: "SOLID", color: { r: 0.97, g: 0.97, b: 0.97 } }];
  table.cornerRadius = 8;
  table.paddingTop = 8;
  table.paddingBottom = 8;
  table.paddingLeft = 8;
  table.paddingRight = 8;
  table.itemSpacing = 0;
  createTableHeader(table);
  const sorted = Array.from(styles.values()).sort((a, b) => b.fontSize - a.fontSize);
  for (const entry of sorted) {
    createTableRow(entry, table);
  }
  section.appendChild(table);
  return section;
}

// apps/consonant-specs-plugin/src/spec-components.ts
var BADGE_COLOR = { r: 0.91, g: 0.48, b: 0.18 };
var PROP_LABEL_COLOR = { r: 0.45, g: 0.45, b: 0.45 };
var PROP_VALUE_COLOR = { r: 0.15, g: 0.15, b: 0.15 };
var TOKEN_COLOR2 = { r: 0.18, g: 0.62, b: 0.47 };
var PROP_FONT_SIZE2 = 10;
var TABLE_WIDTH = 500;
var NEST_INDENT = 24;
var MAX_DEPTH = 4;
function collectInstances(node, depth) {
  const results = [];
  if (!("children" in node)) return results;
  for (const child of node.children) {
    if (child.type === "INSTANCE") {
      const entry = {
        node: child,
        depth,
        children: depth < MAX_DEPTH ? collectInstances(child, depth + 1) : []
      };
      results.push(entry);
    } else {
      results.push(...collectInstances(child, depth));
    }
  }
  return results;
}
function addPropRow2(parent, label, value, isToken = false) {
  const row = figma.createFrame();
  row.name = `prop-${label}`;
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.resize(TABLE_WIDTH - 24, 1);
  row.layoutAlign = "STRETCH";
  row.fills = [];
  row.itemSpacing = 8;
  const labelText = figma.createText();
  labelText.fontName = { family: "Inter", style: "Regular" };
  labelText.fontSize = PROP_FONT_SIZE2;
  labelText.characters = label;
  labelText.fills = [{ type: "SOLID", color: PROP_LABEL_COLOR }];
  row.appendChild(labelText);
  const valueText = figma.createText();
  valueText.fontName = { family: "Inter", style: "Medium" };
  valueText.fontSize = PROP_FONT_SIZE2;
  valueText.characters = value;
  valueText.fills = [{ type: "SOLID", color: isToken ? TOKEN_COLOR2 : PROP_VALUE_COLOR }];
  row.appendChild(valueText);
  parent.appendChild(row);
}
async function buildInstanceCard(entry, parent) {
  const node = entry.node;
  const card = figma.createFrame();
  card.name = `instance-${node.name}`;
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "FIXED";
  card.resize(TABLE_WIDTH, 1);
  card.layoutAlign = "STRETCH";
  card.fills = [];
  card.itemSpacing = 2;
  card.paddingTop = 8;
  card.paddingBottom = 12;
  card.paddingLeft = 12 + entry.depth * NEST_INDENT;
  card.paddingRight = 12;
  const headerRow = figma.createFrame();
  headerRow.name = "header";
  headerRow.layoutMode = "HORIZONTAL";
  headerRow.primaryAxisSizingMode = "AUTO";
  headerRow.counterAxisSizingMode = "AUTO";
  headerRow.fills = [];
  headerRow.itemSpacing = 8;
  const icon = figma.createText();
  icon.fontName = { family: "Inter", style: "Regular" };
  icon.fontSize = 11;
  icon.characters = "\u25C8";
  icon.fills = [{ type: "SOLID", color: BADGE_COLOR }];
  headerRow.appendChild(icon);
  const nameText = figma.createText();
  nameText.fontName = { family: "Inter", style: "Bold" };
  nameText.fontSize = 11;
  nameText.characters = node.name;
  nameText.fills = [{ type: "SOLID", color: PROP_VALUE_COLOR }];
  headerRow.appendChild(nameText);
  card.appendChild(headerRow);
  const mainComponent = await node.getMainComponentAsync();
  if (mainComponent) {
    addPropRow2(card, "Main component:", mainComponent.name);
    const setParent = mainComponent.parent;
    if (setParent && setParent.type === "COMPONENT_SET") {
      addPropRow2(card, "Component set:", setParent.name);
    }
    const variantProps = node.variantProperties;
    if (variantProps) {
      const pairs = Object.entries(variantProps).map(([k, v]) => `${k}=${v}`).join(", ");
      addPropRow2(card, "Variant properties:", pairs);
    }
    if (setParent && setParent.type === "COMPONENT_SET") {
      const variantNames = setParent.children.map((c) => c.name);
      const display = variantNames.length <= 6 ? variantNames.join(", ") : variantNames.slice(0, 5).join(", ") + ` +${variantNames.length - 5} more`;
      addPropRow2(card, "Available variants:", display);
    }
    const overrides = node.overrides;
    if (overrides && overrides.length > 0) {
      for (const override of overrides) {
        const overriddenNode = await figma.getNodeByIdAsync(override.id);
        if (!overriddenNode) continue;
        for (const field of override.overriddenFields) {
          if (field === "characters" && overriddenNode.type === "TEXT") {
            addPropRow2(card, `Override (${overriddenNode.name}):`, `text = "${overriddenNode.characters}"`);
          } else if (field === "fills" && "fills" in overriddenNode) {
            const fills = getNodeFills(overriddenNode);
            for (const fill of fills) {
              const token = matchColor(fill.hex);
              addPropRow2(
                card,
                `Override (${overriddenNode.name}):`,
                token ? `fill = ${fill.hex.toUpperCase()} \u2192 ${token}` : `fill = ${fill.hex.toUpperCase()}`,
                !!token
              );
            }
          } else if (field === "visible" && "visible" in overriddenNode) {
            addPropRow2(card, `Override (${overriddenNode.name}):`, `visible = ${overriddenNode.visible}`);
          }
        }
      }
    }
    addPropRow2(card, "Component ID:", mainComponent.id);
  } else {
    addPropRow2(card, "Main component:", "Detached instance");
  }
  const div = figma.createRectangle();
  div.name = "divider";
  div.resize(TABLE_WIDTH - 24, 1);
  div.fills = [{ type: "SOLID", color: { r: 0.92, g: 0.92, b: 0.92 } }];
  div.layoutAlign = "STRETCH";
  card.appendChild(div);
  parent.appendChild(card);
  if (entry.children.length > 0) {
    for (const child of entry.children) {
      await buildInstanceCard(child, parent);
    }
  } else if (entry.depth >= MAX_DEPTH) {
    let deepCount = 0;
    const countDeep = (n) => {
      if (n.type === "INSTANCE") deepCount++;
      if ("children" in n) n.children.forEach(countDeep);
    };
    node.children.forEach(countDeep);
    if (deepCount > 0) {
      const note = figma.createText();
      note.fontName = { family: "Inter", style: "Regular" };
      note.fontSize = PROP_FONT_SIZE2;
      note.characters = `\u2026 ${deepCount} deeper instance${deepCount > 1 ? "s" : ""}`;
      note.fills = [{ type: "SOLID", color: PROP_LABEL_COLOR }];
      note.layoutAlign = "STRETCH";
      parent.appendChild(note);
    }
  }
}
async function generateComponentDetailsSection(sourceNode) {
  const instances = collectInstances(sourceNode, 0);
  if (instances.length === 0) return null;
  const section = figma.createFrame();
  section.name = "Component Details";
  section.layoutMode = "VERTICAL";
  section.primaryAxisSizingMode = "AUTO";
  section.counterAxisSizingMode = "AUTO";
  section.fills = [];
  section.itemSpacing = 16;
  const title = figma.createText();
  title.fontName = { family: "Inter", style: "Bold" };
  title.fontSize = 24;
  title.characters = "Component Details";
  title.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  section.appendChild(title);
  const container = figma.createFrame();
  container.name = "components-container";
  container.layoutMode = "VERTICAL";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "AUTO";
  container.fills = [{ type: "SOLID", color: { r: 0.97, g: 0.97, b: 0.97 } }];
  container.cornerRadius = 8;
  container.paddingTop = 12;
  container.paddingBottom = 12;
  container.paddingLeft = 12;
  container.paddingRight = 12;
  container.itemSpacing = 0;
  for (const entry of instances) {
    await buildInstanceCard(entry, container);
  }
  section.appendChild(container);
  return section;
}

// apps/consonant-specs-plugin/src/spec-colors.ts
async function generateColorAnnotations(node, yOffset = 0) {
  const clone = node.clone();
  const sourceX = node.absoluteTransform[0][2];
  const sourceY = node.absoluteTransform[1][2];
  figma.currentPage.appendChild(clone);
  clone.x = sourceX;
  clone.y = sourceY + node.height + 40 + yOffset;
  let count = 0;
  const seen = /* @__PURE__ */ new Set();
  function shouldSkipEntirely(n) {
    const skipTypes = /* @__PURE__ */ new Set(["VECTOR", "BOOLEAN_OPERATION", "STAR", "LINE", "POLYGON", "ELLIPSE"]);
    if (skipTypes.has(n.type)) return true;
    const hasChildren = "children" in n && n.children.length > 0;
    if (n.type !== "TEXT" && !hasChildren && (n.width < 24 || n.height < 24)) return true;
    return false;
  }
  function hasImageFill(n) {
    if ("fills" in n) {
      const fills = n.fills;
      if (Array.isArray(fills) && fills.some((f) => f.type === "IMAGE")) return true;
    }
    return false;
  }
  function visualKey(n, properties) {
    var _a;
    const parts = [n.type, properties.map((p) => p.type).join(",")];
    if ("fills" in n) {
      const fills = n.fills;
      if (Array.isArray(fills)) {
        const solid = fills.find((f) => f.type === "SOLID" && f.visible !== false);
        if (solid) {
          const c = solid.color;
          parts.push(`f:${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${((_a = solid.opacity) != null ? _a : 1).toFixed(2)}`);
        }
      }
    }
    if ("strokes" in n) {
      const strokes = n.strokes;
      if (Array.isArray(strokes)) {
        const solid = strokes.find((f) => f.type === "SOLID" && f.visible !== false);
        if (solid) {
          const c = solid.color;
          parts.push(`s:${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)}`);
        }
      }
    }
    if (n.type === "TEXT") {
      const tn = n;
      const fn = tn.fontName;
      if (fn !== figma.mixed) {
        parts.push(`t:${fn.family}/${fn.style}`);
      }
      const fs = tn.fontSize;
      parts.push(`fs:${fs !== figma.mixed ? fs : 0}`);
    }
    const area = n.width * n.height;
    const sizeCat = area < 2e3 ? "S" : area < 2e4 ? "M" : "L";
    parts.push(`sz:${sizeCat}`);
    if ("cornerRadius" in n) {
      const cr = n.cornerRadius;
      if (cr !== figma.mixed && cr > 0) parts.push(`r:${cr}`);
    }
    return parts.join("|");
  }
  async function walk(n, isRoot = false) {
    if ("visible" in n && !n.visible) return;
    if (shouldSkipEntirely(n)) return;
    const skipAnnotation = hasImageFill(n);
    if (!skipAnnotation) {
      const properties = [];
      const label = isRoot ? "Background" : n.name;
      if ("fills" in n) {
        const fills = n.fills;
        if (Array.isArray(fills) && fills.some((f) => f.type === "SOLID" && f.visible !== false)) {
          properties.push({ type: "fills" });
        }
      }
      if ("strokes" in n) {
        const strokes = n.strokes;
        if (Array.isArray(strokes) && strokes.some((f) => f.type === "SOLID" && f.visible !== false)) {
          properties.push({ type: "strokes" });
        }
      }
      if (n.type === "TEXT") {
        const textNode = n;
        const hasStyle = textNode.textStyleId && textNode.textStyleId !== "" && textNode.textStyleId !== figma.mixed;
        properties.push({ type: hasStyle ? "textStyleId" : "fontFamily" });
      }
      if ("effects" in n) {
        const effects = n.effects;
        if (Array.isArray(effects) && effects.length > 0 && effects.some((e) => e.visible !== false)) {
          properties.push({ type: "effects" });
        }
      }
      if (properties.length > 0) {
        const key = visualKey(n, properties);
        if (!seen.has(key)) {
          seen.add(key);
          try {
            n.annotations = [{
              labelMarkdown: `**${label}**`,
              properties
            }];
            count++;
          } catch (e) {
            console.warn(`Annotation failed on "${label}":`, e);
          }
        }
      }
    }
    if ("children" in n) {
      for (const child of n.children) {
        await walk(child);
      }
    }
  }
  await walk(clone, true);
  figma.ui.postMessage({ type: "spec-it-status", message: `Added ${count} color annotations` });
  return clone.height + 40;
}

// apps/consonant-specs-plugin/src/spec-text-properties.ts
async function generateTextPropertyAnnotations(node, yOffset = 0) {
  const clone = node.clone();
  const sourceX = node.absoluteTransform[0][2];
  const sourceY = node.absoluteTransform[1][2];
  figma.currentPage.appendChild(clone);
  clone.x = sourceX;
  clone.y = sourceY + node.height + 40 + yOffset;
  let count = 0;
  const seen = /* @__PURE__ */ new Set();
  function hasTextStyle(n) {
    const styleId = n.textStyleId;
    return !!styleId && styleId !== "" && styleId !== figma.mixed;
  }
  async function walk(n) {
    if ("visible" in n && !n.visible) return;
    if (n.type === "TEXT") {
      const textNode = n;
      const label = n.name;
      const fontSize = textNode.fontSize !== figma.mixed ? textNode.fontSize : 0;
      const key = `${label}:${fontSize}`;
      if (!seen.has(key)) {
        seen.add(key);
        const properties = hasTextStyle(textNode) ? [{ type: "fontFamily" }] : [
          { type: "fontFamily" },
          { type: "fontSize" },
          { type: "fontWeight" },
          { type: "fontStyle" },
          { type: "lineHeight" },
          { type: "letterSpacing" }
        ];
        try {
          n.annotations = [{
            labelMarkdown: `**${label}**`,
            properties
          }];
          count++;
        } catch (e) {
          console.warn(`Text annotation failed on "${label}":`, e);
        }
      }
    }
    if ("children" in n) {
      for (const child of n.children) {
        await walk(child);
      }
    }
  }
  await walk(clone);
  figma.ui.postMessage({ type: "spec-it-status", message: `Added ${count} text property annotations` });
  return clone.height + 40;
}

// apps/consonant-specs-plugin/src/spec-spacing-general.ts
var BLUE_OVERLAY = { r: 0.05, g: 0.41, b: 0.83, a: 0.2 };
var ORANGE_BADGE = { r: 0.93, g: 0.55, b: 0.15 };
var MAGENTA_BADGE = { r: 0.78, g: 0.18, b: 0.53 };
async function generateSpacingGeneral(node, yOffset = 0) {
  var _a, _b, _c, _d, _e;
  if (!("layoutMode" in node)) {
    figma.ui.postMessage({ type: "spec-it-status", message: "Node has no auto-layout \u2014 skipping spacing general." });
    return 0;
  }
  const frame = node;
  if (frame.layoutMode === "NONE") {
    figma.ui.postMessage({ type: "spec-it-status", message: "Node has no auto-layout \u2014 skipping spacing general." });
    return 0;
  }
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  const clone = node.clone();
  const sourceX = node.absoluteTransform[0][2];
  const sourceY = node.absoluteTransform[1][2];
  figma.currentPage.appendChild(clone);
  clone.x = sourceX;
  clone.y = sourceY + node.height + 40 + yOffset;
  const overlay = figma.createFrame();
  overlay.name = "spacing-general-overlay";
  overlay.resize(node.width, node.height);
  overlay.x = 0;
  overlay.y = 0;
  overlay.fills = [];
  overlay.clipsContent = false;
  clone.clipsContent = false;
  clone.appendChild(overlay);
  overlay.layoutPositioning = "ABSOLUTE";
  overlay.resize(node.width, node.height);
  overlay.x = 0;
  overlay.y = 0;
  const isVertical = frame.layoutMode === "VERTICAL";
  const padTop = (_a = frame.paddingTop) != null ? _a : 0;
  const padBottom = (_b = frame.paddingBottom) != null ? _b : 0;
  const padLeft = (_c = frame.paddingLeft) != null ? _c : 0;
  const padRight = (_d = frame.paddingRight) != null ? _d : 0;
  const gap = frame.itemSpacing !== figma.mixed ? (_e = frame.itemSpacing) != null ? _e : 0 : 0;
  const w = node.width;
  const h = node.height;
  if (padTop > 0) addBand(overlay, 0, 0, w, padTop, padTop, "top", w);
  if (padBottom > 0) addBand(overlay, 0, h - padBottom, w, padBottom, padBottom, "bottom", w);
  if (padLeft > 0) addBand(overlay, 0, 0, padLeft, h, padLeft, "left", w);
  if (padRight > 0) addBand(overlay, w - padRight, 0, padRight, h, padRight, "right", w);
  if (gap > 0 && "children" in frame) {
    const origChildren = frame.children;
    const visibleChildren = origChildren.filter((c) => "visible" in c && c.visible);
    for (let i = 0; i < visibleChildren.length - 1; i++) {
      const child = visibleChildren[i];
      const childRel = getRelPos(child, node);
      if (isVertical) {
        const gapY = childRel.y + child.height;
        addBand(overlay, 0, gapY, w, gap, gap, "gap", w);
      } else {
        const gapX = childRel.x + child.width;
        addBand(overlay, gapX, 0, gap, h, gap, "gap", w);
      }
    }
  }
  figma.ui.postMessage({ type: "spec-it-status", message: "Spacing general complete!" });
  return clone.height + 40;
}
function getRelPos(child, parent) {
  return {
    x: child.absoluteTransform[0][2] - parent.absoluteTransform[0][2],
    y: child.absoluteTransform[1][2] - parent.absoluteTransform[1][2]
  };
}
function addBand(parent, x, y, w, h, value, position, frameWidth) {
  const color = BLUE_OVERLAY;
  const band = figma.createRectangle();
  band.name = `spacing-${position}`;
  band.resize(Math.max(w, 1), Math.max(h, 1));
  band.x = x;
  band.y = y;
  band.fills = [{ type: "SOLID", color: { r: color.r, g: color.g, b: color.b }, opacity: color.a }];
  parent.appendChild(band);
  let labelText;
  let badgeColor;
  const token = matchSpacing(String(value));
  if ((position === "left" || position === "right") && frameWidth > 0) {
    const pct = value / frameWidth * 100;
    if (Math.abs(pct - 8.333) < 0.5) {
      labelText = `8.333%`;
      badgeColor = MAGENTA_BADGE;
    } else if (token) {
      labelText = `${token} ${value}px`;
      badgeColor = MAGENTA_BADGE;
    } else {
      labelText = `${value}px`;
      badgeColor = ORANGE_BADGE;
    }
  } else if (token) {
    labelText = `${token} ${value}px`;
    badgeColor = MAGENTA_BADGE;
  } else {
    labelText = `${value}px`;
    badgeColor = ORANGE_BADGE;
  }
  const badge = figma.createFrame();
  badge.name = "spacing-label";
  badge.layoutMode = "HORIZONTAL";
  badge.primaryAxisSizingMode = "AUTO";
  badge.counterAxisSizingMode = "AUTO";
  badge.paddingTop = 2;
  badge.paddingBottom = 2;
  badge.paddingLeft = 6;
  badge.paddingRight = 6;
  badge.cornerRadius = 4;
  badge.fills = [{ type: "SOLID", color: badgeColor }];
  const text = figma.createText();
  text.fontName = { family: "Inter", style: "Bold" };
  text.fontSize = 10;
  text.characters = labelText;
  text.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  badge.appendChild(text);
  parent.appendChild(badge);
  if (position === "top" || position === "bottom" || position === "gap") {
    if (w > h) {
      badge.x = x + w / 2 - badge.width / 2;
      badge.y = y + h / 2 - badge.height / 2;
    } else {
      badge.x = x + w / 2 - badge.width / 2;
      badge.y = y + h / 2 - badge.height / 2;
    }
  } else if (position === "left") {
    badge.x = x + w / 2 - badge.width / 2;
    badge.y = y + h / 2 - badge.height / 2;
  } else if (position === "right") {
    badge.x = x + w / 2 - badge.width / 2;
    badge.y = y + h / 2 - badge.height / 2;
  }
}

// apps/consonant-specs-plugin/src/spec-card-gaps.ts
var BLUE_OVERLAY2 = { r: 0.05, g: 0.41, b: 0.83, a: 0.2 };
var ORANGE_BADGE2 = { r: 0.93, g: 0.55, b: 0.15 };
var MAGENTA_BADGE2 = { r: 0.78, g: 0.18, b: 0.53 };
async function generateCardGaps(node) {
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  if ("children" in node) {
    const old = node.children.filter((c) => c.name === "spacing-in-between-overlay");
    for (const o of old) o.remove();
  }
  const overlay = figma.createFrame();
  overlay.name = "spacing-in-between-overlay";
  overlay.resize(node.width, node.height);
  overlay.fills = [];
  overlay.clipsContent = false;
  if ("clipsContent" in node) node.clipsContent = false;
  node.appendChild(overlay);
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    overlay.layoutPositioning = "ABSOLUTE";
  }
  overlay.resize(node.width, node.height);
  overlay.x = 0;
  overlay.y = 0;
  const cards = [];
  findCardGroups(node, node, cards);
  if (cards.length < 2) {
    figma.ui.postMessage({ type: "spec-it-status", message: "No card gaps found." });
    overlay.remove();
    return;
  }
  cards.sort((a, b) => a.y - b.y || a.x - b.x);
  const rows = [];
  let currentRow = [cards[0]];
  for (let i = 1; i < cards.length; i++) {
    if (Math.abs(cards[i].y - currentRow[0].y) < 5) {
      currentRow.push(cards[i]);
    } else {
      rows.push(currentRow);
      currentRow = [cards[i]];
    }
  }
  rows.push(currentRow);
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    for (let i = 0; i < row.length - 1; i++) {
      const gap = row[i + 1].x - row[i].right;
      if (gap > 0) {
        addBand2(overlay, row[i].right, row[i].y, gap, row[i].h, gap, "gap");
      }
    }
  }
  for (let i = 0; i < rows.length - 1; i++) {
    const topRow = rows[i];
    const bottomRow = rows[i + 1];
    const topBottom = Math.max(...topRow.map((c) => c.bottom));
    const bottomTop = Math.min(...bottomRow.map((c) => c.y));
    const gap = bottomTop - topBottom;
    if (gap > 0) {
      const leftEdge = Math.min(...topRow.map((c) => c.x), ...bottomRow.map((c) => c.x));
      const rightEdge = Math.max(...topRow.map((c) => c.right), ...bottomRow.map((c) => c.right));
      addBand2(overlay, leftEdge, topBottom, rightEdge - leftEdge, gap, gap, "gap");
    }
  }
  figma.ui.postMessage({ type: "spec-it-status", message: `Found ${cards.length} cards, ${rows.length} rows` });
}
function findCardGroups(n, root, cards) {
  if (!("children" in n)) return;
  const parent = n;
  const children = parent.children.filter((c) => "visible" in c && c.visible);
  if (children.length >= 2) {
    const sizes = children.map((c) => ({ w: Math.round(c.width), h: Math.round(c.height) }));
    const sizeMap = /* @__PURE__ */ new Map();
    for (const s of sizes) {
      const key = `${s.w}x${s.h}`;
      sizeMap.set(key, (sizeMap.get(key) || 0) + 1);
    }
    let bestSize = "";
    let bestCount = 0;
    for (const [key, count] of sizeMap) {
      if (count > bestCount) {
        bestCount = count;
        bestSize = key;
      }
    }
    if (bestCount >= 2) {
      const [tw, th] = bestSize.split("x").map(Number);
      const parentW = parent.width;
      if (tw > parentW * 0.8) {
        for (const child of children) {
          findCardGroups(child, root, cards);
        }
        return;
      }
      for (const child of children) {
        if (Math.abs(child.height - th) < th * 0.15) {
          if (Math.abs(child.width - tw) > tw * 0.5 && "children" in child) {
            const innerChildren = child.children.filter(
              (c) => "visible" in c && c.visible
            );
            if (innerChildren.length === 1 && Math.abs(innerChildren[0].height - th) < th * 0.15) {
              const inner = innerChildren[0];
              const relX2 = inner.absoluteTransform[0][2] - root.absoluteTransform[0][2];
              const relY2 = inner.absoluteTransform[1][2] - root.absoluteTransform[1][2];
              cards.push({
                x: relX2,
                y: relY2,
                w: inner.width,
                h: inner.height,
                right: relX2 + inner.width,
                bottom: relY2 + inner.height
              });
              continue;
            }
          }
          const relX = child.absoluteTransform[0][2] - root.absoluteTransform[0][2];
          const relY = child.absoluteTransform[1][2] - root.absoluteTransform[1][2];
          cards.push({
            x: relX,
            y: relY,
            w: child.width,
            h: child.height,
            right: relX + child.width,
            bottom: relY + child.height
          });
        }
      }
      return;
    }
  }
  for (const child of children) {
    findCardGroups(child, root, cards);
  }
}
function addBand2(parent, x, y, w, h, value, position) {
  const band = figma.createRectangle();
  band.name = `card-gap-${position}`;
  band.resize(Math.max(w, 1), Math.max(h, 1));
  band.x = x;
  band.y = y;
  band.fills = [{ type: "SOLID", color: { r: BLUE_OVERLAY2.r, g: BLUE_OVERLAY2.g, b: BLUE_OVERLAY2.b }, opacity: BLUE_OVERLAY2.a }];
  parent.appendChild(band);
  const token = matchSpacing(String(Math.round(value)));
  const labelText = token ? `${token} ${Math.round(value)}px` : `${Math.round(value)}px`;
  const badgeColor = token ? MAGENTA_BADGE2 : ORANGE_BADGE2;
  const badge = figma.createFrame();
  badge.name = "gap-label";
  badge.layoutMode = "HORIZONTAL";
  badge.primaryAxisSizingMode = "AUTO";
  badge.counterAxisSizingMode = "AUTO";
  badge.paddingTop = 2;
  badge.paddingBottom = 2;
  badge.paddingLeft = 6;
  badge.paddingRight = 6;
  badge.cornerRadius = 4;
  badge.fills = [{ type: "SOLID", color: badgeColor }];
  const text = figma.createText();
  text.fontName = { family: "Inter", style: "Bold" };
  text.fontSize = 10;
  text.characters = labelText;
  text.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  badge.appendChild(text);
  parent.appendChild(badge);
  badge.x = x + w / 2 - badge.width / 2;
  badge.y = y + h / 2 - badge.height / 2;
}

// apps/consonant-specs-plugin/src/spec-it.ts
async function specIt(node, sections = ["anatomy", "layout", "typography", "components"]) {
  const enabled = new Set(sections);
  let cloneYOffset = 0;
  if (enabled.has("colors")) {
    figma.ui.postMessage({ type: "spec-it-status", message: "Adding color annotations..." });
    cloneYOffset += await generateColorAnnotations(node, cloneYOffset);
  }
  if (enabled.has("cardGaps")) {
    figma.ui.postMessage({ type: "spec-it-status", message: "Generating spacing in between..." });
    await generateCardGaps(node);
  }
  if (enabled.has("spacingGeneral")) {
    figma.ui.postMessage({ type: "spec-it-status", message: "Generating spacing general..." });
    cloneYOffset += await generateSpacingGeneral(node, cloneYOffset);
  }
  if (enabled.has("textProperties")) {
    figma.ui.postMessage({ type: "spec-it-status", message: "Adding text property annotations..." });
    cloneYOffset += await generateTextPropertyAnnotations(node, cloneYOffset);
  }
  const sourceX = node.absoluteTransform[0][2];
  const sourceY = node.absoluteTransform[1][2];
  function placeSection(frame) {
    figma.currentPage.appendChild(frame);
    frame.x = sourceX;
    frame.y = sourceY + node.height + 40 + cloneYOffset;
    cloneYOffset += frame.height + 40;
  }
  const needsFonts = enabled.has("anatomy") || enabled.has("spacing") || enabled.has("layout") || enabled.has("typography") || enabled.has("components");
  if (needsFonts) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  }
  if (enabled.has("anatomy")) {
    figma.ui.postMessage({ type: "spec-it-status", message: "Generating anatomy..." });
    const anatomySection = await generateAnatomySection(node);
    placeSection(anatomySection);
  }
  if (enabled.has("spacing")) {
    figma.ui.postMessage({ type: "spec-it-status", message: "Generating spacing detailed..." });
    await generateSpacingSection(node);
  }
  if (enabled.has("layout")) {
    figma.ui.postMessage({ type: "spec-it-status", message: "Generating layout & spacing..." });
    const layoutSection = await generateLayoutSection(node);
    if (layoutSection) placeSection(layoutSection);
  }
  if (enabled.has("typography")) {
    figma.ui.postMessage({ type: "spec-it-status", message: "Generating typography summary..." });
    const typoSection = await generateTypographySection(node);
    if (typoSection) placeSection(typoSection);
  }
  if (enabled.has("components")) {
    figma.ui.postMessage({ type: "spec-it-status", message: "Generating component details..." });
    const componentsSection = await generateComponentDetailsSection(node);
    if (componentsSection) placeSection(componentsSection);
  }
  figma.ui.postMessage({ type: "spec-it-status", message: "Spec complete!" });
}

// apps/consonant-specs-plugin/src/s2a-audit.ts
function auditNode(node, issues, counters) {
  const fills = getNodeFills(node);
  for (const fill of fills) {
    counters.total++;
    const token = matchColor(fill.hex);
    if (token) {
      counters.matched++;
    } else {
      issues.push({ nodeId: node.id, nodeName: node.name, nodeType: node.type, property: "Fill", value: fill.hex.toUpperCase(), suggestion: null });
    }
  }
  const strokes = getNodeStrokes(node);
  for (const stroke of strokes) {
    counters.total++;
    const token = matchColor(stroke.hex);
    if (token) {
      counters.matched++;
    } else {
      issues.push({ nodeId: node.id, nodeName: node.name, nodeType: node.type, property: "Stroke", value: stroke.hex.toUpperCase(), suggestion: null });
    }
  }
  const radius = getCornerRadius(node);
  if (radius !== "0" && radius !== "0px") {
    counters.total++;
    const token = matchRadius(radius.replace("px", ""));
    if (token) {
      counters.matched++;
    } else {
      issues.push({ nodeId: node.id, nodeName: node.name, nodeType: node.type, property: "Radius", value: radius, suggestion: null });
    }
  }
  const text = getTextProps(node);
  if (text) {
    counters.total++;
    const familyToken = matchTypography(text.fontFamily);
    const sizeToken = matchTypography(`${text.fontSize}`);
    if (familyToken || sizeToken) {
      counters.matched++;
    } else {
      issues.push({ nodeId: node.id, nodeName: node.name, nodeType: node.type, property: "Typography", value: `${text.fontFamily} ${text.fontSize}px`, suggestion: null });
    }
  }
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    const frame = node;
    const spacingChecks = [
      { prop: "Padding Top", val: frame.paddingTop },
      { prop: "Padding Right", val: frame.paddingRight },
      { prop: "Padding Bottom", val: frame.paddingBottom },
      { prop: "Padding Left", val: frame.paddingLeft },
      { prop: "Item Spacing", val: frame.itemSpacing === figma.mixed ? 0 : frame.itemSpacing }
    ];
    for (const check of spacingChecks) {
      if (check.val > 0) {
        counters.total++;
        const token = matchSpacing(`${check.val}`);
        if (token) {
          counters.matched++;
        } else {
          issues.push({ nodeId: node.id, nodeName: node.name, nodeType: node.type, property: check.prop, value: `${check.val}px`, suggestion: null });
        }
      }
    }
  }
}
function auditRecursive(node, issues, counters) {
  if ("visible" in node && !node.visible) return;
  auditNode(node, issues, counters);
  if (node.type === "INSTANCE") return;
  if ("children" in node) {
    for (const child of node.children) {
      auditRecursive(child, issues, counters);
    }
  }
}
async function runS2AAudit(node) {
  if (!isLoaded()) await loadLibraryTokens();
  const issues = [];
  const counters = { total: 0, matched: 0 };
  auditRecursive(node, issues, counters);
  return { total: counters.total, matched: counters.matched, issues };
}
async function alignNode(node, textOnly, result2) {
  var _a, _b;
  if (node.type === "TEXT") {
    const textNode = node;
    if (textNode.fontName !== figma.mixed) {
      result2.scanned++;
      const success = await applyTextStyle(textNode);
      if (success) {
        result2.aligned++;
      } else {
        const props = getTextProps(node);
        if (props) {
          result2.unmatched.push({
            nodeId: node.id,
            nodeName: node.name,
            nodeType: "TEXT",
            property: "Text Style",
            value: `${props.fontFamily} ${props.fontSize}px`,
            suggestion: null
          });
        }
      }
    }
  }
  if (!textOnly && "fills" in node && Array.isArray(node.fills)) {
    const fills = node.fills;
    if (fills.length > 0 && fills.every((f) => f.type === "SOLID")) {
      result2.scanned++;
      const solid = fills[0];
      const hex = figmaColorToHex(solid.color);
      const fillOpacity = (_a = solid.opacity) != null ? _a : 1;
      const token = matchColor(hex);
      if (token) {
        const success = await applyColorStyle(node, hex, fillOpacity);
        if (success) result2.aligned++;
      } else if (hex.toLowerCase() === "#ffffff" || hex.toLowerCase() === "#000000") {
      } else {
        result2.unmatched.push({
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          property: "Fill Color",
          value: hex.toUpperCase(),
          suggestion: null
        });
      }
    }
  }
  if (!textOnly && "strokes" in node && Array.isArray(node.strokes)) {
    const strokes = node.strokes;
    if (strokes.length > 0 && strokes.every((s) => s.type === "SOLID")) {
      result2.scanned++;
      const solid = strokes[0];
      const hex = figmaColorToHex(solid.color);
      const strokeOpacity = (_b = solid.opacity) != null ? _b : 1;
      const token = matchColor(hex);
      if (token) {
        const success = await applyStrokeColorStyle(node, hex, strokeOpacity);
        if (success) {
          result2.aligned++;
        } else {
          result2.unmatched.push({
            nodeId: node.id,
            nodeName: node.name,
            nodeType: node.type,
            property: "Stroke Color",
            value: hex.toUpperCase(),
            suggestion: null
          });
        }
      } else {
        result2.unmatched.push({
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          property: "Stroke Color",
          value: hex.toUpperCase(),
          suggestion: null
        });
      }
    }
  }
  if (!textOnly) {
    if ("cornerRadius" in node && typeof node.cornerRadius === "number" && node.cornerRadius > 0) {
      result2.scanned++;
      const radiusName = matchRadius(`${node.cornerRadius}`);
      if (radiusName) {
        const match = matchDimension(node.cornerRadius, "CORNER_RADIUS");
        if (match) {
          try {
            node.setBoundVariable("topLeftRadius", match.variable);
            node.setBoundVariable("topRightRadius", match.variable);
            node.setBoundVariable("bottomLeftRadius", match.variable);
            node.setBoundVariable("bottomRightRadius", match.variable);
            result2.aligned++;
          } catch (e) {
            result2.unmatched.push({
              nodeId: node.id,
              nodeName: node.name,
              nodeType: node.type,
              property: "Corner Radius",
              value: `${node.cornerRadius}px`,
              suggestion: null
            });
          }
        }
      }
    }
    if ("strokeWeight" in node && typeof node.strokeWeight === "number" && node.strokeWeight > 0) {
      result2.scanned++;
      const match = matchDimension(node.strokeWeight, "STROKE_FLOAT");
      if (match) {
        try {
          node.setBoundVariable("strokeWeight", match.variable);
          result2.aligned++;
        } catch (e) {
          result2.unmatched.push({
            nodeId: node.id,
            nodeName: node.name,
            nodeType: node.type,
            property: "Stroke Weight",
            value: `${node.strokeWeight}px`,
            suggestion: null
          });
        }
      }
    }
    if ("layoutMode" in node && node.layoutMode !== "NONE") {
      const frame = node;
      const spacingProps = [
        { prop: "paddingTop", val: frame.paddingTop },
        { prop: "paddingRight", val: frame.paddingRight },
        { prop: "paddingBottom", val: frame.paddingBottom },
        { prop: "paddingLeft", val: frame.paddingLeft },
        { prop: "itemSpacing", val: frame.itemSpacing === figma.mixed ? 0 : frame.itemSpacing }
      ];
      for (const { prop, val } of spacingProps) {
        if (val > 0) {
          result2.scanned++;
          const match = matchDimension(val, "GAP");
          if (match) {
            try {
              frame.setBoundVariable(prop, match.variable);
              result2.aligned++;
            } catch (e) {
              result2.unmatched.push({
                nodeId: node.id,
                nodeName: node.name,
                nodeType: node.type,
                property: prop,
                value: `${val}px`,
                suggestion: null
              });
            }
          } else {
            result2.unmatched.push({
              nodeId: node.id,
              nodeName: node.name,
              nodeType: node.type,
              property: prop,
              value: `${val}px`,
              suggestion: null
            });
          }
        }
      }
    }
  }
}
async function alignRecursive(node, textOnly, result2) {
  if ("visible" in node && !node.visible) return;
  await alignNode(node, textOnly, result2);
  if (node.type === "INSTANCE") return;
  if ("children" in node) {
    for (const child of node.children) {
      await alignRecursive(child, textOnly, result2);
    }
  }
}
async function runFullAlign(node) {
  if (!isLoaded()) await loadLibraryTokens();
  let mode = "n/a";
  if ("layoutMode" in node) {
    mode = await setResponsiveMode(node);
  }
  const result2 = { aligned: 0, scanned: 0, unmatched: [] };
  await alignRecursive(node, false, result2);
  return __spreadProps(__spreadValues({}, result2), { mode });
}
async function runTextColorsAlign(node) {
  if (!isLoaded()) await loadLibraryTokens();
  let mode = "n/a";
  if ("layoutMode" in node) {
    mode = await setResponsiveMode(node);
  }
  const result2 = { aligned: 0, scanned: 0, unmatched: [] };
  await alignRecursive(node, true, result2);
  return __spreadProps(__spreadValues({}, result2), { mode });
}

// apps/consonant-specs-plugin/src/localize.ts
var LANG_META = {
  de: {
    name: "German",
    fallbackFont: null,
    // Latin — original font works fine
    codes: { mymemory: "de", lingva: "de", deepl: "DE", google: "de", azure: "de", anthropic: "German", bridge: "German" }
  },
  zh: {
    name: "Chinese",
    fallbackFont: "Noto Sans SC",
    codes: { mymemory: "zh-CN", lingva: "zh", deepl: "ZH", google: "zh-CN", azure: "zh-Hans", anthropic: "Simplified Chinese", bridge: "Simplified Chinese" }
  },
  th: {
    name: "Thai",
    fallbackFont: "Noto Sans Thai",
    codes: { mymemory: "th", lingva: "th", deepl: "TH", google: "th", azure: "th", anthropic: "Thai", bridge: "Thai" }
  },
  ar: {
    name: "Arabic",
    fallbackFont: "Noto Sans Arabic",
    codes: { mymemory: "ar", lingva: "ar", deepl: "AR", google: "ar", azure: "ar", anthropic: "Arabic", bridge: "Arabic" }
  }
};
function norm(s) {
  return s.replace(/[\u2028\u2029\n\r]+/g, " ").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
}
function collectTextNodes(node, acc) {
  if (node.type === "TEXT" && node.characters.length > 0) acc.push(node);
  if ("children" in node) {
    for (const child of node.children) collectTextNodes(child, acc);
  }
}
function collectFonts(nodes) {
  const seen = /* @__PURE__ */ new Set();
  const fonts = [];
  for (const n of nodes) {
    try {
      const fn = n.getRangeFontName(0, 1);
      if (fn === figma.mixed) continue;
      const key = JSON.stringify(fn);
      if (!seen.has(key)) {
        seen.add(key);
        fonts.push(fn);
      }
    } catch (_) {
    }
  }
  return fonts;
}
async function loadFonts(fonts) {
  for (const f of fonts) {
    try {
      await figma.loadFontAsync(f);
    } catch (_) {
    }
  }
}
async function translateMyMemory(strings, langCode) {
  var _a;
  const results = [];
  for (const s of strings) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(s)}&langpair=en|${langCode}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`MyMemory error ${res.status}`);
    const data = await res.json();
    results.push(((_a = data == null ? void 0 : data.responseData) == null ? void 0 : _a.translatedText) || s);
  }
  return results;
}
async function translateLingva(strings, langCode) {
  const instances = ["lingva.ml", "lingva.thedaviddelta.com"];
  const results = [];
  for (const s of strings) {
    let translated = null;
    for (const host of instances) {
      try {
        const url = `https://${host}/api/v1/en/${langCode}/${encodeURIComponent(s)}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        if (data == null ? void 0 : data.translation) {
          translated = data.translation;
          break;
        }
      } catch (_) {
      }
    }
    results.push(translated || s);
  }
  return results;
}
async function translateDeepL(strings, langCode, apiKey) {
  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `DeepL-Auth-Key ${apiKey}` },
    body: JSON.stringify({ text: strings, source_lang: "EN", target_lang: langCode })
  });
  if (!res.ok) {
    let msg = `DeepL error ${res.status}`;
    try {
      const b = await res.json();
      if (b == null ? void 0 : b.message) msg = b.message;
    } catch (_) {
    }
    throw new Error(msg);
  }
  const data = await res.json();
  return data.translations.map((t) => t.text);
}
async function translateGoogle(strings, langCode, apiKey) {
  var _a;
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: strings, source: "en", target: langCode, format: "text" })
  });
  if (!res.ok) {
    let msg = `Google error ${res.status}`;
    try {
      const b = await res.json();
      if ((_a = b == null ? void 0 : b.error) == null ? void 0 : _a.message) msg = b.error.message;
    } catch (_) {
    }
    throw new Error(msg);
  }
  const data = await res.json();
  return data.data.translations.map((t) => t.translatedText);
}
async function translateAzure(strings, langCode, apiKey) {
  var _a;
  const res = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=${langCode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": apiKey
    },
    body: JSON.stringify(strings.map((s) => ({ Text: s })))
  });
  if (!res.ok) {
    let msg = `Azure error ${res.status}`;
    try {
      const b = await res.json();
      if ((_a = b == null ? void 0 : b.error) == null ? void 0 : _a.message) msg = b.error.message;
    } catch (_) {
    }
    throw new Error(msg);
  }
  const data = await res.json();
  return data.map((t) => t.translations[0].text);
}
async function translateClaude(strings, langName, apiKey) {
  var _a, _b, _c;
  const system = "You are a UI localization expert. Translate the given English UI strings to " + langName + ". Preserve tone. Keep button labels concise. Do NOT translate brand names, proper nouns, or placeholders like {username}, {count}, %s, {{var}}. Return ONLY a JSON array of translated strings, same length and order as input. No prose, no markdown.";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: JSON.stringify(strings) }]
    })
  });
  if (!res.ok) {
    let msg = `API error ${res.status}`;
    try {
      const b = await res.json();
      if ((_a = b == null ? void 0 : b.error) == null ? void 0 : _a.message) msg = b.error.message;
    } catch (_) {
    }
    throw new Error(msg);
  }
  const data = await res.json();
  const content = (_c = (_b = data == null ? void 0 : data.content) == null ? void 0 : _b[0]) == null ? void 0 : _c.text;
  if (typeof content !== "string") throw new Error("Unexpected API response");
  let cleaned = content.trim();
  if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed) || parsed.length !== strings.length) {
    throw new Error(`Translation count mismatch: expected ${strings.length}, got ${Array.isArray(parsed) ? parsed.length : "N/A"}`);
  }
  return parsed.map((s) => String(s));
}
async function translateStrings(provider, strings, langCode, langName, apiKey) {
  switch (provider) {
    case "mymemory":
      return translateMyMemory(strings, langCode);
    case "lingva":
      return translateLingva(strings, langCode);
    case "deepl":
      return translateDeepL(strings, langCode, apiKey);
    case "google":
      return translateGoogle(strings, langCode, apiKey);
    case "azure":
      return translateAzure(strings, langCode, apiKey);
    case "anthropic":
      return translateClaude(strings, langName, apiKey);
  }
}
function applyRTL(node) {
  if (node.type === "TEXT") {
    try {
      node.textAlignHorizontal = "RIGHT";
    } catch (_) {
    }
  }
  if ((node.type === "FRAME" || node.type === "INSTANCE" || node.type === "COMPONENT") && "layoutMode" in node) {
    const frame = node;
    if (frame.layoutMode === "HORIZONTAL") {
      const children = [...frame.children];
      for (let i = children.length - 1; i >= 0; i--) {
        try {
          frame.appendChild(children[i]);
        } catch (_) {
        }
      }
    }
    if (frame.layoutMode === "VERTICAL") {
      try {
        frame.counterAxisAlignItems = "MAX";
      } catch (_) {
      }
    }
  }
  if ("children" in node) {
    for (const child of node.children) applyRTL(child);
  }
}
async function rewriteTextNodes(nodes, translations, fallbackFontFamily) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const translated = translations[i];
    if (typeof translated !== "string") continue;
    try {
      const existing = node.getRangeFontName(0, Math.max(1, node.characters.length));
      if (existing === figma.mixed) continue;
      const currentFont = existing;
      await figma.loadFontAsync(currentFont);
      if (fallbackFontFamily) {
        const targetFont = { family: fallbackFontFamily, style: currentFont.style };
        try {
          await figma.loadFontAsync(targetFont);
          node.fontName = targetFont;
        } catch (_) {
          const regularFont = { family: fallbackFontFamily, style: "Regular" };
          await figma.loadFontAsync(regularFont);
          node.fontName = regularFont;
        }
      }
      node.characters = translated;
    } catch (_) {
    }
  }
}
function collectSourceText(node) {
  const textNodes = [];
  collectTextNodes(node, textNodes);
  return textNodes.map((n) => ({ nodeId: n.id, text: norm(n.characters) }));
}
async function localize(node, languages, applyRtl, provider, apiKey) {
  const errors = [];
  let created = 0;
  if (!("clone" in node)) throw new Error("Selected node cannot be cloned.");
  const GAP = 40;
  let cursorX = node.x + node.width + GAP;
  const baseY = node.y;
  const parent = node.parent;
  if (!parent || !("appendChild" in parent)) throw new Error("Selected node has no parent container.");
  for (const code2 of languages) {
    const meta = LANG_META[code2];
    if (!meta) {
      errors.push(`Unknown language: ${code2}`);
      continue;
    }
    figma.ui.postMessage({ type: "localize-status", message: `Collecting source text for ${meta.name}...` });
    const clone = node.clone();
    clone.name = `[${code2}] ${node.name}`;
    parent.appendChild(clone);
    clone.x = cursorX;
    clone.y = baseY;
    cursorX += clone.width + GAP;
    const textNodes = [];
    collectTextNodes(clone, textNodes);
    if (textNodes.length === 0) {
      created++;
      continue;
    }
    const originals = textNodes.map((n) => norm(n.characters));
    const sourceFonts = collectFonts(textNodes);
    await loadFonts(sourceFonts);
    try {
      figma.ui.postMessage({ type: "localize-status", message: `Translating ${originals.length} strings to ${meta.name}...` });
      const langCode = meta.codes[provider];
      if (provider === "deepl" && code2 === "th") {
        errors.push("Thai: DeepL does not support Thai \u2014 skipping");
        created++;
        continue;
      }
      const translations = await translateStrings(provider, originals, langCode, meta.name, apiKey);
      await rewriteTextNodes(textNodes, translations, meta.fallbackFont);
      if (code2 === "ar" && applyRtl) applyRTL(clone);
      created++;
    } catch (e) {
      const errMsg = e.message || String(e);
      errors.push(`${meta.name}: ${errMsg}`);
      if (errMsg.includes("credit") || errMsg.includes("API error") || errMsg.includes("authentication") || errMsg.includes("invalid") || errMsg.includes("rate") || errMsg.includes("quota") || errMsg.includes("key")) {
        try {
          clone.remove();
        } catch (_) {
        }
        break;
      }
    }
  }
  try {
    figma.viewport.scrollAndZoomIntoView([node]);
  } catch (_) {
  }
  return { created, errors };
}

// apps/consonant-specs-plugin/src/spec-focus-indicators.ts
var FOCUS_COLOR = { r: 0.08, g: 0.45, b: 0.9 };
var FOCUS_STROKE = 2;
var FOCUS_PAD = 4;
var MIN_SIZE = 8;
function isLeafInteractive(node) {
  const name = node.name.toLowerCase();
  const keywords = [
    "button",
    "cta",
    "search",
    "close",
    "play",
    "pause",
    "toggle",
    "radio",
    "input",
    "avatar",
    "sign in",
    "sign-in",
    "application",
    "carousel",
    "arrow",
    "chevron"
  ];
  if (keywords.some((k) => name.includes(k)) && node.width <= 300 && node.height <= 100) {
    return true;
  }
  if (name === "logo" && node.width >= 20 && node.width <= 200 && node.height <= 80) {
    return true;
  }
  return false;
}
function isCardOrTile(node) {
  const name = node.name.toLowerCase();
  if ((name.includes("card") || name.includes("tile")) && node.width >= 80 && node.height >= 40) {
    return true;
  }
  return false;
}
function isNavItem(node) {
  var _a, _b;
  const name = node.name.toLowerCase();
  if (!/^item[\s_-]*\d/.test(name)) return false;
  const parentName = ((_b = (_a = node.parent) == null ? void 0 : _a.name) == null ? void 0 : _b.toLowerCase()) || "";
  return parentName.includes("nav") || parentName.includes("menu") || parentName.includes("tab") || parentName.includes("bar");
}
function isPaginationGroup(node) {
  const name = node.name.toLowerCase();
  if (!(name.includes("pagination") || name.includes("indicator") || name.includes("dots"))) return false;
  if (!("children" in node)) return false;
  if (node.width < 20 || node.height < 6) return false;
  return true;
}
function getCornerRadius2(node) {
  if ("cornerRadius" in node) {
    const cr = node.cornerRadius;
    if (typeof cr === "number" && cr > 0) return cr + FOCUS_PAD;
  }
  const w = node.width;
  const h = node.height;
  if (w === h && w < 48) return 100;
  if (h < 24) return 4;
  if (h >= 28 && h <= 56 && w > 60) return Math.round(h / 2);
  if (w > 100 && h > 100) return 12;
  return 4;
}
function collectFocusable(node, results, depth = 0) {
  if (depth > 10) return;
  if (!("children" in node)) return;
  const container = node;
  for (const child of container.children) {
    if (!child.visible) continue;
    if (child.width < MIN_SIZE || child.height < MIN_SIZE) continue;
    if (isLeafInteractive(child)) {
      results.push(child);
      continue;
    }
    if (isCardOrTile(child)) {
      results.push(child);
      continue;
    }
    if (isNavItem(child)) {
      results.push(child);
      continue;
    }
    if (isPaginationGroup(child)) {
      results.push(child);
      continue;
    }
    if ("children" in child) {
      collectFocusable(child, results, depth + 1);
    }
  }
}
function collectFocusableElements(node) {
  const focusable = [];
  collectFocusable(node, focusable);
  if (focusable.length === 0) return [];
  const ids = new Set(focusable.map((n) => n.id));
  return focusable.filter((n) => {
    let p = n.parent;
    while (p && p.type !== "PAGE") {
      if (ids.has(p.id)) return false;
      p = p.parent;
    }
    return true;
  });
}
async function generateFocusIndicators(node) {
  const filtered = collectFocusableElements(node);
  if (filtered.length === 0) {
    figma.notify("No focusable elements found.");
    return;
  }
  const parent = node.parent;
  if (!parent) return;
  const parentAbs = "absoluteBoundingBox" in parent ? parent.absoluteBoundingBox : null;
  const offsetX = parentAbs ? parentAbs.x : 0;
  const offsetY = parentAbs ? parentAbs.y : 0;
  for (const el of filtered) {
    const abs = el.absoluteBoundingBox;
    if (!abs) continue;
    const rect = figma.createRectangle();
    rect.name = "Focus Rectangle";
    rect.x = abs.x - FOCUS_PAD - offsetX;
    rect.y = abs.y - FOCUS_PAD - offsetY;
    rect.resize(abs.width + FOCUS_PAD * 2, abs.height + FOCUS_PAD * 2);
    rect.fills = [];
    rect.strokes = [{ type: "SOLID", color: FOCUS_COLOR }];
    rect.strokeWeight = FOCUS_STROKE;
    rect.strokeAlign = "CENTER";
    rect.cornerRadius = getCornerRadius2(el);
    parent.appendChild(rect);
  }
  figma.notify(`${filtered.length} focus indicators added.`);
}

// apps/consonant-specs-plugin/src/a11y-focus-order.ts
function detectFocusOrder(root) {
  const focusable = collectFocusableElements(root);
  if (focusable.length === 0) return [];
  const withPos = focusable.map((node) => {
    const abs = node.absoluteBoundingBox;
    return {
      node,
      name: node.name,
      x: abs ? abs.x : 0,
      y: abs ? abs.y : 0
    };
  });
  const ROW_TOLERANCE = 20;
  withPos.sort((a, b) => {
    if (Math.abs(a.y - b.y) <= ROW_TOLERANCE) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });
  return withPos.map((entry, i) => ({
    index: i + 1,
    node: entry.node,
    name: entry.name,
    x: entry.x,
    y: entry.y
  }));
}

// apps/consonant-specs-plugin/src/a11y-blueline.ts
var SIDEBAR_WIDTH = 320;
var SIDEBAR_PAD = 16;
var SECTION_GAP = 24;
var CARD_WIDTH = 400;
var CARD_GAP2 = 16;
var CARDS_TOP_MARGIN = 40;
var BADGE_HEIGHT = 24;
var PANEL_GAP = 100;
var PANEL_PAD = 80;
var BADGE_COLOR2 = { r: 0.145, g: 0.494, b: 0.333 };
var NAVY_COLOR = { r: 0.063, g: 0.157, b: 0.294 };
var LANDMARK_BG = { r: 0.753, g: 0.898, b: 0.875 };
var TIER2_COLOR = { r: 0.49, g: 0.23, b: 0.93 };
var TEXT_PRIMARY = { r: 0, g: 0, b: 0 };
var TEXT_WHITE = { r: 0.989, g: 0.989, b: 0.989 };
var BORDER_COLOR = { r: 0, g: 0, b: 0 };
var BORDER_OPACITY = 0.1;
var BG_COLOR = { r: 0.989, g: 0.989, b: 0.989 };
var STROKE_COLOR = { r: 0.89, g: 0.89, b: 0.89 };
var CATEGORY_BADGE = {
  // Focus Order — green circle
  focusOrder: {
    color: BADGE_COLOR2,
    textColor: TEXT_WHITE,
    cornerRadius: 16
  },
  // Accessible Names — navy pill + headphone icon
  names: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 1.3 4.55 L 1.3 4.39 C 1.3 2.965 2.41 1.3 4.01 1.3 C 5.61 1.3 6.72 2.965 6.72 4.39 L 6.72 4.55 M 4.01 9.72 L 4.01 10.11 C 4.01 10.39 4.19 10.7 4.55 10.7 L 5.35 10.7 C 6.35 10.7 7.16 9.89 7.16 8.89 M 0.975 4.55 L 1.6 4.55 L 1.6 8.17 L 0.975 8.17 C 0.64 8.17 0.37 7.9 0.37 7.57 L 0.37 5.15 C 0.37 4.82 0.64 4.55 0.975 4.55 Z M 6.4 4.55 L 7.03 4.55 C 7.36 4.55 7.63 4.82 7.63 5.15 L 7.63 7.57 C 7.63 7.9 7.36 8.17 7.03 8.17 L 6.4 8.17 L 6.4 4.55 Z",
    iconStroke: true
  },
  // ARIA Roles — navy pill + </> code icon
  aria: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 4.66 10.4 L 7.26 0 M 9.86 2.6 L 10.98 3.82 C 11.3 4.14 11.3 4.66 10.98 4.98 L 9.86 6.2 M 2.06 6.2 L 0.94 4.98 C 0.62 4.66 0.62 4.14 0.94 3.82 L 2.06 2.6",
    iconStroke: true
  },
  // Heading Hierarchy — navy pill + H icon
  headings: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 1.5 1 L 1.5 11 M 10.5 1 L 10.5 11 M 1.5 6 L 10.5 6",
    iconStroke: true
  },
  // Landmarks — light green pill with dark text
  landmarks: {
    color: LANDMARK_BG,
    textColor: TEXT_PRIMARY,
    cornerRadius: 6
  },
  // Alt-Text — navy pill + image icon
  altText: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 1 0 L 11 0 C 11.55 0 12 0.45 12 1 L 12 9 C 12 9.55 11.55 10 11 10 L 1 10 C 0.45 10 0 9.55 0 9 L 0 1 C 0 0.45 0.45 0 1 0 Z M 0 7 L 3.5 4 L 7 7 M 8 6 L 10 4 L 12 6 M 8 3 C 8 3.55 7.55 4 7 4 C 6.45 4 6 3.55 6 3 C 6 2.45 6.45 2 7 2 C 7.55 2 8 2.45 8 3 Z",
    iconStroke: true
  },
  // Keyboard Patterns — navy pill + keyboard icon
  keyboard: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 1 0 L 11 0 C 11.55 0 12 0.45 12 1 L 12 7.5 C 12 8.05 11.55 8.5 11 8.5 L 1 8.5 C 0.45 8.5 0 8.05 0 7.5 L 0 1 C 0 0.45 0.45 0 1 0 Z M 3 6.5 L 9 6.5 M 2.5 2 L 2.5 2 M 5 2 L 5 2 M 7 2 L 7 2 M 9.5 2 L 9.5 2 M 2.5 4.25 L 2.5 4.25 M 5 4.25 L 5 4.25 M 7 4.25 L 7 4.25 M 9.5 4.25 L 9.5 4.25",
    iconStroke: true
  },
  // DOM Strategy — navy pill + tree/structure icon
  dom: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 6 0 L 6 4 M 6 4 L 2 7 M 6 4 L 10 7 M 2 7 L 2 10 M 10 7 L 10 10",
    iconStroke: true
  },
  // Auto-Rotation — navy pill + rotation icon
  autoRotationSimplified: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 10.5 3 C 9.5 1.2 7.4 0 5.5 0 C 2.5 0 0 2.7 0 6 C 0 9.3 2.5 11 5.5 11 C 8 11 10 9.3 10.5 7 M 10.5 0 L 10.5 3 L 7.5 3",
    iconStroke: true
  },
  autoRotation: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 10.5 3 C 9.5 1.2 7.4 0 5.5 0 C 2.5 0 0 2.7 0 6 C 0 9.3 2.5 11 5.5 11 C 8 11 10 9.3 10.5 7 M 10.5 0 L 10.5 3 L 7.5 3",
    iconStroke: true
  },
  // General Note — navy pill + document icon
  generalNote: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 8.249 5.75 L 6.75 5.75 C 6.198 5.75 5.75 6.198 5.75 6.75 L 5.75 8.249 M 8.249 5.75 C 8.25 5.737 8.25 5.724 8.25 5.711 L 8.25 1 C 8.25 0.448 7.802 0 7.25 0 L 1 0 C 0.448 0 0 0.448 0 1 L 0 7.25 C 0 7.802 0.448 8.25 1 8.25 L 5.711 8.25 C 5.724 8.25 5.737 8.25 5.75 8.249 M 8.249 5.75 C 8.239 6.001 8.135 6.24 7.957 6.418 L 6.418 7.957 C 6.24 8.135 6.001 8.239 5.75 8.249 M 2.5 2.5 L 5.75 2.5 M 2.5 4.5 L 3.75 4.5",
    iconStroke: true
  },
  // VoiceOver — navy pill + Apple-style icon
  voiceover: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 6 0 C 6 0 9 2 9 6 C 9 10 6 12 6 12 M 6 0 C 6 0 3 2 3 6 C 3 10 6 12 6 12 M 0 6 L 12 6 M 6 0 L 6 12",
    iconStroke: true
  },
  // TalkBack — navy pill + Android-style icon
  talkback: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 2 4 L 10 4 C 10.55 4 11 4.45 11 5 L 11 9 C 11 9.55 10.55 10 10 10 L 2 10 C 1.45 10 1 9.55 1 9 L 1 5 C 1 4.45 1.45 4 2 4 Z M 4 4 L 4 2.5 C 4 1.4 4.9 0.5 6 0.5 C 7.1 0.5 8 1.4 8 2.5 L 8 4 M 4 7 L 4 7 M 8 7 L 8 7",
    iconStroke: true
  },
  // Narrator — navy pill + Windows-style icon
  narrator: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 1 1 L 11 1 M 6 1 L 6 11 M 3.5 11 L 8.5 11 M 1 1 L 1 5 M 11 1 L 11 5",
    iconStroke: true
  },
  // React Native — navy pill + RN icon
  reactNative: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 6 4.5 C 6.83 4.5 7.5 5.17 7.5 6 C 7.5 6.83 6.83 7.5 6 7.5 C 5.17 7.5 4.5 6.83 4.5 6 C 4.5 5.17 5.17 4.5 6 4.5 Z M 6 2 C 9.31 2 12 3.79 12 6 C 12 8.21 9.31 10 6 10 C 2.69 10 0 8.21 0 6 C 0 3.79 2.69 2 6 2 Z",
    iconStroke: true
  },
  // TV Note — navy pill + TV icon
  tvNote: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: "M 1 2 L 11 2 C 11.55 2 12 2.45 12 3 L 12 9 C 12 9.55 11.55 10 11 10 L 1 10 C 0.45 10 0 9.55 0 9 L 0 3 C 0 2.45 0.45 2 1 2 Z M 4 10 L 4 12 M 8 10 L 8 12 M 3 12 L 9 12 M 4 0 L 6 2 L 8 0",
    iconStroke: true
  }
};
var TIER2_SECTIONS = {
  headings: "Heading Hierarchy",
  landmarks: "Landmarks",
  names: "Accessible Names",
  altText: "Alt-Text",
  aria: "ARIA Roles & Attributes",
  keyboard: "Keyboard Patterns",
  dom: "DOM Strategy",
  autoRotationSimplified: "Auto-Rotation",
  autoRotation: "Auto-Rotation",
  voiceover: "VoiceOver",
  talkback: "TalkBack",
  narrator: "Narrator",
  reactNative: "React Native",
  tvNote: "TV Note",
  generalNote: "General Note"
};
var PANEL_DESCRIPTIONS = {
  focusIndicators: "Visual representation of the browser focus ring on interactive elements. Every focusable element must have a visible focus indicator that meets WCAG 2.4.7.",
  focusOrder: "The sequential order in which interactive elements receive keyboard focus. Must follow a logical reading order (WCAG 2.4.3). Annotate any elements that skip, are removed, or have custom tabindex.",
  headings: "The heading level structure (H1\u2013H6) of the page. A correct hierarchy helps screen reader users navigate by section. There should be exactly one H1 per page.",
  landmarks: "ARIA landmark regions (banner, main, navigation, region, etc.) that allow screen reader users to jump between major page areas.",
  names: 'For sections or items that need a clear identifier, and either lack one, or whose meaning is not sufficiently explicit.\nExample: "Learn more" buttons, headerless accordion lists, icon-only controls.',
  altText: 'Alternative text for images and media. Decorative images get alt="". Meaningful images get concise descriptions. Complex images may need long descriptions.',
  aria: "ARIA roles, states, and properties that communicate widget behavior to assistive technology. Use native HTML semantics first; add ARIA only when HTML falls short.",
  keyboard: "Expected keyboard interactions for custom widgets. Standard patterns: Tab to navigate between widgets, arrow keys within composite widgets, Enter/Space to activate.",
  dom: "How the visual design maps to DOM structure. Reading order, semantic elements, skip links, and whether content is hidden vs removed from the DOM.",
  autoRotation: "Auto-advancing content (carousels, slideshows) must be pausable (WCAG 2.2.2). Define timing, pause triggers, resume behavior, and reduced-motion handling.",
  voiceover: "VoiceOver-specific behavior on iOS and macOS. Rotor actions, swipe gestures, announcement order, and any platform quirks.",
  talkback: "TalkBack-specific behavior on Android. Touch exploration, gesture navigation, and any platform-specific announcements.",
  narrator: "Narrator-specific behavior on Windows. Scan mode interactions, landmark navigation, and any platform quirks.",
  reactNative: "React Native accessibility props: accessibilityLabel, accessibilityRole, accessibilityState, accessibilityActions, and platform bridging notes.",
  tvNote: "TV platform accessibility: D-pad navigation, focus management, spatial navigation order, and remote control interactions.",
  generalNote: "General accessibility notes that apply across all platforms. Live regions, announcements, and cross-platform behavior."
};
async function loadFonts2() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
}
function createText(content, size, weight = "Regular", color) {
  const text = figma.createText();
  text.fontName = { family: "Inter", style: weight };
  text.fontSize = size;
  text.characters = content;
  if (color) text.fills = [{ type: "SOLID", color }];
  return text;
}
function createSectionFrame(title, isTier2) {
  const section = figma.createFrame();
  section.name = title;
  section.layoutMode = "VERTICAL";
  section.counterAxisSizingMode = "FIXED";
  section.resize(SIDEBAR_WIDTH - SIDEBAR_PAD * 2, 40);
  section.primaryAxisSizingMode = "AUTO";
  section.clipsContent = false;
  section.itemSpacing = 8;
  section.fills = [];
  const headerFrame = figma.createFrame();
  headerFrame.name = "Section Header";
  headerFrame.layoutMode = "HORIZONTAL";
  headerFrame.primaryAxisSizingMode = "AUTO";
  headerFrame.counterAxisSizingMode = "AUTO";
  headerFrame.itemSpacing = 6;
  headerFrame.paddingBottom = 8;
  headerFrame.fills = [];
  const titleText = createText(title, 15, "Bold", isTier2 ? TIER2_COLOR : TEXT_PRIMARY);
  titleText.opacity = isTier2 ? 1 : 0.95;
  headerFrame.appendChild(titleText);
  if (isTier2) {
    const aiTag = createText("AI", 10, "Medium", TIER2_COLOR);
    headerFrame.appendChild(aiTag);
  }
  section.appendChild(headerFrame);
  return section;
}
function createFocusOrderSection(entries) {
  const section = createSectionFrame("Focus Order", false);
  for (const entry of entries) {
    const row = figma.createFrame();
    row.name = `${entry.name} (ID: ${entry.node.id})`;
    row.layoutMode = "VERTICAL";
    row.counterAxisSizingMode = "FIXED";
    row.resize(SIDEBAR_WIDTH - SIDEBAR_PAD * 2, 48);
    row.primaryAxisSizingMode = "AUTO";
    row.clipsContent = false;
    row.itemSpacing = 8;
    row.paddingTop = 12;
    row.paddingBottom = 12;
    row.fills = [];
    row.strokes = [{ type: "SOLID", color: BORDER_COLOR, opacity: BORDER_OPACITY }];
    row.strokeWeight = 1;
    row.strokeAlign = "INSIDE";
    row.strokeTopWeight = 0;
    row.strokeRightWeight = 0;
    row.strokeBottomWeight = 1;
    row.strokeLeftWeight = 0;
    const infoRow = figma.createFrame();
    infoRow.name = "Focus Order Info";
    infoRow.layoutMode = "HORIZONTAL";
    infoRow.primaryAxisSizingMode = "AUTO";
    infoRow.counterAxisSizingMode = "AUTO";
    infoRow.counterAxisAlignItems = "CENTER";
    infoRow.itemSpacing = 8;
    infoRow.fills = [];
    const badgeBg = createNumberedBadge(entry.index, "focusOrder");
    badgeBg.strokes = [];
    badgeBg.strokeWeight = 0;
    const label = createText(entry.name, 13, "Regular", TEXT_PRIMARY);
    label.opacity = 0.95;
    infoRow.appendChild(badgeBg);
    infoRow.appendChild(label);
    row.appendChild(infoRow);
    section.appendChild(row);
  }
  return section;
}
function createCategoryIcon(categoryKey, color) {
  const config = CATEGORY_BADGE[categoryKey];
  if (!(config == null ? void 0 : config.iconPath)) return null;
  const iconFrame = figma.createFrame();
  iconFrame.name = "Icon";
  iconFrame.resize(12, 12);
  iconFrame.fills = [];
  iconFrame.clipsContent = false;
  const vector = figma.createVector();
  vector.vectorPaths = [{ windingRule: "NONZERO", data: config.iconPath }];
  if (config.iconStroke) {
    vector.fills = [];
    vector.strokes = [{ type: "SOLID", color }];
    vector.strokeWeight = 1.2;
    vector.strokeCap = "ROUND";
    vector.strokeJoin = "ROUND";
  } else {
    vector.fills = [{ type: "SOLID", color }];
  }
  const bounds = vector.absoluteBoundingBox;
  if (bounds) {
    const scale = Math.min(10 / bounds.width, 10 / bounds.height);
    vector.resize(bounds.width * scale, bounds.height * scale);
  }
  iconFrame.appendChild(vector);
  vector.x = (12 - vector.width) / 2;
  vector.y = (12 - vector.height) / 2;
  return iconFrame;
}
function createNumberedBadge(index, categoryKey) {
  var _a;
  const config = categoryKey ? CATEGORY_BADGE[categoryKey] : void 0;
  const badgeColor = (config == null ? void 0 : config.color) || BADGE_COLOR2;
  const textColor = (config == null ? void 0 : config.textColor) || TEXT_WHITE;
  const radius = (_a = config == null ? void 0 : config.cornerRadius) != null ? _a : 16;
  const badge = figma.createFrame();
  badge.name = "Badge";
  badge.resize(BADGE_HEIGHT, BADGE_HEIGHT);
  badge.cornerRadius = radius;
  badge.fills = [{ type: "SOLID", color: badgeColor }];
  badge.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  badge.strokeWeight = 2;
  badge.strokeAlign = "OUTSIDE";
  badge.layoutMode = "HORIZONTAL";
  badge.primaryAxisSizingMode = "AUTO";
  badge.counterAxisSizingMode = "FIXED";
  badge.primaryAxisAlignItems = "CENTER";
  badge.counterAxisAlignItems = "CENTER";
  badge.paddingLeft = 8;
  badge.paddingRight = 8;
  badge.itemSpacing = 4;
  const text = createText(`${index}`, 12, "Semi Bold", textColor);
  badge.appendChild(text);
  if (categoryKey) {
    const icon = createCategoryIcon(categoryKey, textColor);
    if (icon) badge.appendChild(icon);
  }
  return badge;
}
function createDetailCard(sectionKey, isTier2) {
  const title = TIER2_SECTIONS[sectionKey] || sectionKey;
  const config = CATEGORY_BADGE[sectionKey];
  const card = figma.createFrame();
  card.name = title;
  card.resize(CARD_WIDTH, 100);
  card.layoutMode = "VERTICAL";
  card.counterAxisSizingMode = "FIXED";
  card.primaryAxisSizingMode = "AUTO";
  card.clipsContent = false;
  card.paddingTop = 16;
  card.paddingBottom = 16;
  card.paddingLeft = 16;
  card.paddingRight = 16;
  card.itemSpacing = 8;
  card.fills = [{ type: "SOLID", color: BG_COLOR }];
  card.strokes = [{ type: "SOLID", color: STROKE_COLOR }];
  card.strokeWeight = 1;
  card.strokeAlign = "INSIDE";
  card.cornerRadius = 8;
  const headerFrame = figma.createFrame();
  headerFrame.name = "Card Header";
  headerFrame.layoutMode = "HORIZONTAL";
  headerFrame.primaryAxisSizingMode = "AUTO";
  headerFrame.counterAxisSizingMode = "AUTO";
  headerFrame.counterAxisAlignItems = "CENTER";
  headerFrame.itemSpacing = 8;
  headerFrame.fills = [];
  const titleText = createText(title, 15, "Bold", TEXT_PRIMARY);
  headerFrame.appendChild(titleText);
  if (config == null ? void 0 : config.iconPath) {
    const iconBadge = figma.createFrame();
    iconBadge.name = "Category Icon";
    iconBadge.resize(20, 20);
    iconBadge.cornerRadius = 4;
    iconBadge.fills = [{ type: "SOLID", color: config.color }];
    iconBadge.layoutMode = "HORIZONTAL";
    iconBadge.primaryAxisAlignItems = "CENTER";
    iconBadge.counterAxisAlignItems = "CENTER";
    iconBadge.paddingLeft = 4;
    iconBadge.paddingRight = 4;
    iconBadge.paddingTop = 4;
    iconBadge.paddingBottom = 4;
    const icon = createCategoryIcon(sectionKey, config.textColor);
    if (icon) iconBadge.appendChild(icon);
    headerFrame.appendChild(iconBadge);
  }
  card.appendChild(headerFrame);
  const placeholder = createText("Awaiting AI fill...", 11, "Regular", TEXT_PRIMARY);
  placeholder.opacity = 0.4;
  card.appendChild(placeholder);
  return card;
}
function createGroupedCard(groupTitle, keys) {
  const card = figma.createFrame();
  card.name = groupTitle;
  card.layoutMode = "VERTICAL";
  card.counterAxisSizingMode = "FIXED";
  card.primaryAxisSizingMode = "AUTO";
  card.layoutAlign = "STRETCH";
  card.clipsContent = false;
  card.paddingTop = 16;
  card.paddingBottom = 16;
  card.paddingLeft = 16;
  card.paddingRight = 16;
  card.itemSpacing = 12;
  card.fills = [{ type: "SOLID", color: BG_COLOR }];
  card.strokes = [{ type: "SOLID", color: STROKE_COLOR }];
  card.strokeWeight = 1;
  card.strokeAlign = "INSIDE";
  card.cornerRadius = 8;
  const titleColor = groupTitle === "Accessibility Notes" ? NAVY_COLOR : TIER2_COLOR;
  const titleText = createText(groupTitle, 15, "Bold", titleColor);
  card.appendChild(titleText);
  for (const key of keys) {
    const title = TIER2_SECTIONS[key] || key;
    const config = CATEGORY_BADGE[key];
    const section = figma.createFrame();
    section.name = title;
    section.layoutMode = "VERTICAL";
    section.primaryAxisSizingMode = "AUTO";
    section.counterAxisSizingMode = "AUTO";
    section.layoutAlign = "STRETCH";
    section.itemSpacing = 4;
    section.fills = [];
    section.clipsContent = false;
    const headerRow = figma.createFrame();
    headerRow.name = `${title} Header`;
    headerRow.layoutMode = "HORIZONTAL";
    headerRow.primaryAxisSizingMode = "AUTO";
    headerRow.counterAxisSizingMode = "AUTO";
    headerRow.counterAxisAlignItems = "CENTER";
    headerRow.itemSpacing = 6;
    headerRow.fills = [];
    if (config == null ? void 0 : config.iconPath) {
      const iconBadge = figma.createFrame();
      iconBadge.name = "Category Icon";
      iconBadge.resize(18, 18);
      iconBadge.cornerRadius = 4;
      iconBadge.fills = [{ type: "SOLID", color: config.color }];
      iconBadge.layoutMode = "HORIZONTAL";
      iconBadge.primaryAxisAlignItems = "CENTER";
      iconBadge.counterAxisAlignItems = "CENTER";
      iconBadge.paddingLeft = 3;
      iconBadge.paddingRight = 3;
      iconBadge.paddingTop = 3;
      iconBadge.paddingBottom = 3;
      const icon = createCategoryIcon(key, config.textColor);
      if (icon) iconBadge.appendChild(icon);
      headerRow.appendChild(iconBadge);
    }
    const labelText = createText(title, 13, "Semi Bold", TEXT_PRIMARY);
    headerRow.appendChild(labelText);
    section.appendChild(headerRow);
    const placeholder = createText("Awaiting AI fill...", 11, "Regular", TEXT_PRIMARY);
    placeholder.opacity = 0.4;
    section.appendChild(placeholder);
    card.appendChild(section);
  }
  return card;
}
async function generateBlueline(node, tier1, tier2, options) {
  await loadFonts2();
  const sourceAbs = node.absoluteBoundingBox;
  if (!sourceAbs) throw new Error("Node has no bounding box");
  const page = figma.currentPage;
  const sourceX = sourceAbs.x;
  const sourceY = sourceAbs.y;
  let focusEntries = [];
  if (tier1.includes("focusOrder")) {
    focusEntries = detectFocusOrder(node);
  }
  let sidebar = null;
  if (focusEntries.length > 0) {
    sidebar = figma.createFrame();
    sidebar.name = "Accessibility Annotations";
    sidebar.resize(SIDEBAR_WIDTH, 100);
    sidebar.layoutMode = "VERTICAL";
    sidebar.counterAxisSizingMode = "FIXED";
    sidebar.primaryAxisSizingMode = "AUTO";
    sidebar.clipsContent = false;
    sidebar.paddingTop = SIDEBAR_PAD;
    sidebar.paddingBottom = SIDEBAR_PAD;
    sidebar.paddingLeft = SIDEBAR_PAD;
    sidebar.paddingRight = SIDEBAR_PAD;
    sidebar.itemSpacing = SECTION_GAP;
    sidebar.fills = [{ type: "SOLID", color: BG_COLOR }];
    sidebar.strokes = [{ type: "SOLID", color: STROKE_COLOR }];
    sidebar.strokeWeight = 1;
    sidebar.strokeAlign = "INSIDE";
    sidebar.cornerRadius = 8;
    const headerText = createText("Accessibility Annotations", 15, "Semi Bold", TEXT_PRIMARY);
    headerText.opacity = 0.95;
    sidebar.appendChild(headerText);
    const focusSection = createFocusOrderSection(focusEntries);
    sidebar.appendChild(focusSection);
    sidebar.x = sourceX - SIDEBAR_WIDTH - 40;
    sidebar.y = sourceY;
    page.appendChild(sidebar);
  }
  if (tier1.includes("focusIndicators")) {
    figma.ui.postMessage({ type: "a11y-status", message: "Adding focus indicators..." });
    await generateFocusIndicators(node);
  }
  if (focusEntries.length > 0) {
    figma.ui.postMessage({ type: "a11y-status", message: "Adding focus order badges..." });
    for (const entry of focusEntries) {
      const abs = entry.node.absoluteBoundingBox;
      if (!abs) continue;
      const badge = createNumberedBadge(entry.index, "focusOrder");
      badge.x = abs.x - 4;
      badge.y = abs.y - BADGE_HEIGHT - 2;
      page.appendChild(badge);
    }
  }
  if (tier2.length > 0) {
    const grouped = (options == null ? void 0 : options.grouped) !== false;
    const NOTE_KEYS = /* @__PURE__ */ new Set(["voiceover", "talkback", "narrator", "reactNative", "tvNote", "generalNote"]);
    const coreKeys = tier2.filter((k) => !NOTE_KEYS.has(k));
    const noteKeys = tier2.filter((k) => NOTE_KEYS.has(k));
    if (grouped) {
      const outerContainer = figma.createFrame();
      outerContainer.name = "Tier 2 Cards";
      outerContainer.layoutMode = "HORIZONTAL";
      outerContainer.layoutWrap = "WRAP";
      outerContainer.counterAxisSizingMode = "AUTO";
      outerContainer.primaryAxisSizingMode = "FIXED";
      outerContainer.resize(sourceAbs.width, 100);
      outerContainer.itemSpacing = CARD_GAP2;
      outerContainer.counterAxisSpacing = CARD_GAP2;
      outerContainer.fills = [];
      outerContainer.clipsContent = false;
      if (coreKeys.length > 0) {
        const coreCard = createGroupedCard("AI-assisted", coreKeys);
        outerContainer.appendChild(coreCard);
      }
      if (noteKeys.length > 0) {
        const notesCard = createGroupedCard("Accessibility Notes", noteKeys);
        outerContainer.appendChild(notesCard);
      }
      outerContainer.x = sourceX;
      outerContainer.y = sourceY + sourceAbs.height + CARDS_TOP_MARGIN;
      page.appendChild(outerContainer);
    } else {
      const cardsContainer = figma.createFrame();
      cardsContainer.name = "Tier 2 Cards";
      cardsContainer.layoutMode = "HORIZONTAL";
      cardsContainer.layoutWrap = "WRAP";
      cardsContainer.counterAxisSizingMode = "AUTO";
      cardsContainer.primaryAxisSizingMode = "FIXED";
      cardsContainer.resize(sourceAbs.width, 100);
      cardsContainer.primaryAxisAlignItems = "MIN";
      cardsContainer.counterAxisAlignItems = "MIN";
      cardsContainer.itemSpacing = CARD_GAP2;
      cardsContainer.counterAxisSpacing = CARD_GAP2;
      cardsContainer.fills = [];
      cardsContainer.clipsContent = false;
      for (const key of tier2) {
        const card = createDetailCard(key, true);
        cardsContainer.appendChild(card);
      }
      cardsContainer.x = sourceX;
      cardsContainer.y = sourceY + sourceAbs.height + CARDS_TOP_MARGIN;
      page.appendChild(cardsContainer);
    }
  }
  const viewNodes = [node];
  if (sidebar) viewNodes.push(sidebar);
  figma.viewport.scrollAndZoomIntoView(viewNodes);
  return { frameId: node.id, tier2Sections: tier2 };
}
function createInstructionsCard(title, description, categoryKey) {
  const config = categoryKey ? CATEGORY_BADGE[categoryKey] : void 0;
  const card = figma.createFrame();
  card.name = "Instructions";
  card.resize(CARD_WIDTH, 100);
  card.layoutMode = "VERTICAL";
  card.counterAxisSizingMode = "FIXED";
  card.primaryAxisSizingMode = "AUTO";
  card.clipsContent = false;
  card.paddingTop = 24;
  card.paddingBottom = 24;
  card.paddingLeft = 24;
  card.paddingRight = 24;
  card.itemSpacing = 12;
  card.fills = [{ type: "SOLID", color: BG_COLOR }];
  card.strokes = [{ type: "SOLID", color: STROKE_COLOR }];
  card.strokeWeight = 1;
  card.strokeAlign = "INSIDE";
  card.cornerRadius = 8;
  const headerFrame = figma.createFrame();
  headerFrame.name = "Card Header";
  headerFrame.layoutMode = "HORIZONTAL";
  headerFrame.primaryAxisSizingMode = "AUTO";
  headerFrame.counterAxisSizingMode = "AUTO";
  headerFrame.counterAxisAlignItems = "CENTER";
  headerFrame.itemSpacing = 10;
  headerFrame.fills = [];
  const titleText = createText(title, 28, "Bold", TEXT_PRIMARY);
  headerFrame.appendChild(titleText);
  if (config == null ? void 0 : config.iconPath) {
    const iconBadge = figma.createFrame();
    iconBadge.name = "Category Icon";
    iconBadge.resize(28, 28);
    iconBadge.cornerRadius = 6;
    iconBadge.fills = [{ type: "SOLID", color: config.color }];
    iconBadge.layoutMode = "HORIZONTAL";
    iconBadge.primaryAxisAlignItems = "CENTER";
    iconBadge.counterAxisAlignItems = "CENTER";
    iconBadge.paddingLeft = 6;
    iconBadge.paddingRight = 6;
    iconBadge.paddingTop = 6;
    iconBadge.paddingBottom = 6;
    const icon = createCategoryIcon(categoryKey, config.textColor);
    if (icon) {
      icon.resize(16, 16);
      iconBadge.appendChild(icon);
    }
    headerFrame.appendChild(iconBadge);
  }
  card.appendChild(headerFrame);
  const descText = createText(description, 14, "Regular", TEXT_PRIMARY);
  descText.opacity = 0.7;
  descText.textAutoResize = "HEIGHT";
  descText.resize(CARD_WIDTH - 48, descText.height);
  card.appendChild(descText);
  return card;
}
async function generateBluelinePanels(node, tier1, tier2) {
  await loadFonts2();
  const sourceAbs = node.absoluteBoundingBox;
  if (!sourceAbs) throw new Error("Node has no bounding box");
  const page = figma.currentPage;
  const allPanels = [];
  if (tier1.includes("focusIndicators")) allPanels.push("focusIndicators");
  if (tier1.includes("focusOrder")) allPanels.push("focusOrder");
  for (const key of tier2) allPanels.push(key);
  if (allPanels.length === 0) throw new Error("Select at least one option");
  let focusEntries = [];
  if (tier1.includes("focusOrder")) {
    focusEntries = detectFocusOrder(node);
  }
  let panelX = sourceAbs.x + sourceAbs.width + 200;
  const panelY = sourceAbs.y;
  const firstSection = [];
  for (const key of allPanels) {
    const title = TIER2_SECTIONS[key] || (key === "focusIndicators" ? "Focus Indicators" : key === "focusOrder" ? "Focus Order" : key);
    const description = PANEL_DESCRIPTIONS[key] || "";
    const section = figma.createSection();
    section.name = `A11y ${title}`;
    section.x = panelX;
    section.y = panelY;
    const instructions = createInstructionsCard(title, description, key);
    instructions.x = PANEL_PAD;
    instructions.y = PANEL_PAD;
    section.appendChild(instructions);
    const clone = node.clone();
    clone.name = node.name;
    const cloneX = PANEL_PAD + CARD_WIDTH + 40;
    const cloneY = PANEL_PAD;
    clone.x = cloneX;
    clone.y = cloneY;
    section.appendChild(clone);
    if (key === "focusIndicators") {
      await generateFocusIndicators(clone);
    }
    if (key === "focusOrder" && focusEntries.length > 0) {
      const cloneEntries = detectFocusOrder(clone);
      const secAbs = section.absoluteBoundingBox;
      const offX = secAbs ? secAbs.x : 0;
      const offY = secAbs ? secAbs.y : 0;
      for (const entry of cloneEntries) {
        const abs = entry.node.absoluteBoundingBox;
        if (!abs) continue;
        const badge = createNumberedBadge(entry.index, "focusOrder");
        badge.x = abs.x - 4 - offX;
        badge.y = abs.y - BADGE_HEIGHT - 2 - offY;
        section.appendChild(badge);
      }
    }
    const sectionW = cloneX + sourceAbs.width + PANEL_PAD;
    const sectionH = Math.max(instructions.height, sourceAbs.height) + PANEL_PAD * 2;
    section.resizeWithoutConstraints(sectionW, sectionH);
    page.appendChild(section);
    firstSection.push(section);
    panelX += sectionW + PANEL_GAP;
  }
  figma.viewport.scrollAndZoomIntoView(firstSection);
  return { frameId: node.id, tier2Sections: tier2 };
}
async function placeCategoryBadge(targetNodeId, index, categoryKey) {
  await loadFonts2();
  const target = await figma.getNodeByIdAsync(targetNodeId);
  if (!target || !("absoluteBoundingBox" in target)) {
    throw new Error(`Node ${targetNodeId} not found or has no bounding box`);
  }
  const abs = target.absoluteBoundingBox;
  if (!abs) throw new Error("No bounding box");
  const badge = createNumberedBadge(index, categoryKey);
  let badgeX = abs.x - 4;
  const badgeY = abs.y - BADGE_HEIGHT - 4;
  const page = figma.currentPage;
  const existingBadges = page.children.filter(
    (n) => n.name === "Badge" && "absoluteBoundingBox" in n
  );
  for (const existing of existingBadges) {
    const eb = existing.absoluteBoundingBox;
    if (!eb) continue;
    if (Math.abs(eb.y - badgeY) < BADGE_HEIGHT + 2) {
      const overlapLeft = badgeX + badge.width + 4 > eb.x && badgeX < eb.x + eb.width + 4;
      if (overlapLeft) {
        badgeX = eb.x + eb.width + 4;
      }
    }
  }
  badge.x = badgeX;
  badge.y = badgeY;
  figma.currentPage.appendChild(badge);
  return { badgeId: badge.id };
}

// apps/consonant-specs-plugin/src/code.ts
globalThis.__generateBlueline = generateBlueline;
globalThis.__generateBluelinePanels = generateBluelinePanels;
globalThis.__placeCategoryBadge = placeCategoryBadge;
function hexToFigmaRGB(hex) {
  hex = hex.replace(/^#/, "");
  if (!/^[0-9A-Fa-f]+$/.test(hex)) throw new Error('Invalid hex color: "' + hex + '"');
  let r, g, b, a = 1;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  } else if (hex.length === 8) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
    a = parseInt(hex.substring(6, 8), 16) / 255;
  } else throw new Error("Invalid hex length: " + hex);
  return { r, g, b, a };
}
function serializeVariable(v) {
  return { id: v.id, name: v.name, key: v.key, resolvedType: v.resolvedType, valuesByMode: v.valuesByMode, variableCollectionId: v.variableCollectionId, scopes: v.scopes, codeSyntax: v.codeSyntax || {}, description: v.description, hiddenFromPublishing: v.hiddenFromPublishing };
}
function serializeCollection(c) {
  return { id: c.id, name: c.name, key: c.key, modes: c.modes, defaultModeId: c.defaultModeId, variableIds: c.variableIds };
}
function serializeNode(node) {
  return { id: node.id, name: node.name, type: node.type, x: node.x, y: node.y, width: node.width, height: node.height };
}
async function handleBridgeMethod(method, params) {
  switch (method) {
    // ── Code execution ──
    case "EXECUTE_CODE": {
      const code = params.code;
      const timeout = params.timeout || 5e3;
      const wrappedCode = "(async function() {\n" + code + "\n})()";
      const timeoutPromise = new Promise((_r, reject) => {
        setTimeout(() => reject(new Error("Execution timed out after " + timeout + "ms")), timeout);
      });
      let codePromise;
      try {
        codePromise = eval(wrappedCode);
      } catch (syntaxError) {
        throw new Error("Syntax error: " + (syntaxError.message || String(syntaxError)));
      }
      const result = await Promise.race([codePromise, timeoutPromise]);
      return { result, fileContext: { fileName: figma.root.name, fileKey: figma.fileKey || null } };
    }
    // ── Screenshot ──
    case "CAPTURE_SCREENSHOT": {
      const nodeId = params.nodeId;
      const node = nodeId ? await figma.getNodeByIdAsync(nodeId) : figma.currentPage;
      if (!node) throw new Error("Node not found: " + nodeId);
      if (!("exportAsync" in node)) throw new Error("Node type " + node.type + " does not support export");
      const format = params.format || "PNG";
      let scale = params.scale || 1;
      const AI_MAX = 1568;
      let nw = 0, nh = 0;
      if ("width" in node && "height" in node) {
        nw = node.width;
        nh = node.height;
      }
      if (nw > 0 && nh > 0) {
        const longest = Math.max(nw, nh);
        if (longest * scale > AI_MAX) scale = AI_MAX / longest;
      }
      const bytes = await node.exportAsync({ format, constraint: { type: "SCALE", value: scale } });
      const base64 = figma.base64Encode(bytes);
      return { image: { base64, format, scale, byteLength: bytes.length, node: { id: node.id, name: node.name, type: node.type } } };
    }
    // ── Blueline generator ──
    case "GENERATE_BLUELINE": {
      const nodeId = params.nodeId;
      const sel = nodeId ? [await figma.getNodeByIdAsync(nodeId)] : figma.currentPage.selection;
      if (!sel || sel.length === 0 || !sel[0]) throw new Error("Select a frame or provide nodeId");
      const tier1 = Array.isArray(params.tier1) ? params.tier1 : [];
      const tier2 = Array.isArray(params.tier2) ? params.tier2 : [];
      const result2 = await generateBlueline(sel[0], tier1, tier2);
      return result2;
    }
    // ── File info ──
    case "GET_FILE_INFO": {
      const selection = figma.currentPage.selection;
      return { fileInfo: { fileName: figma.root.name, fileKey: figma.fileKey || null, currentPage: figma.currentPage.name, currentPageId: figma.currentPage.id, selectionCount: selection ? selection.length : 0, editorType: figma.editorType || "figma", pluginVersion: "1.0.0" } };
    }
    // ── Variable methods ──
    case "UPDATE_VARIABLE": {
      const v = await figma.variables.getVariableByIdAsync(params.variableId);
      if (!v) throw new Error("Variable not found: " + params.variableId);
      let value = params.value;
      if (typeof value === "string" && value.startsWith("VariableID:")) {
        value = { type: "VARIABLE_ALIAS", id: value };
      } else if (v.resolvedType === "COLOR" && typeof value === "string") {
        value = hexToFigmaRGB(value);
      }
      v.setValueForMode(params.modeId, value);
      return { variable: serializeVariable(v) };
    }
    case "CREATE_VARIABLE": {
      const collection = await figma.variables.getVariableCollectionByIdAsync(params.collectionId);
      if (!collection) throw new Error("Collection not found: " + params.collectionId);
      const v = figma.variables.createVariable(params.name, collection, params.resolvedType);
      if (params.valuesByMode) {
        for (const modeId in params.valuesByMode) {
          let val = params.valuesByMode[modeId];
          if (params.resolvedType === "COLOR" && typeof val === "string") val = hexToFigmaRGB(val);
          v.setValueForMode(modeId, val);
        }
      }
      if (params.description) v.description = params.description;
      if (params.scopes) v.scopes = params.scopes;
      return { variable: serializeVariable(v) };
    }
    case "DELETE_VARIABLE": {
      const v = await figma.variables.getVariableByIdAsync(params.variableId);
      if (!v) throw new Error("Variable not found: " + params.variableId);
      const info = { id: v.id, name: v.name };
      v.remove();
      return { deleted: info };
    }
    case "CREATE_VARIABLE_COLLECTION": {
      const c = figma.variables.createVariableCollection(params.name);
      if (params.initialModeName && c.modes.length > 0) c.renameMode(c.modes[0].modeId, params.initialModeName);
      if (params.additionalModes) {
        for (const modeName of params.additionalModes) c.addMode(modeName);
      }
      return { collection: serializeCollection(c) };
    }
    case "DELETE_VARIABLE_COLLECTION": {
      const c = await figma.variables.getVariableCollectionByIdAsync(params.collectionId);
      if (!c) throw new Error("Collection not found: " + params.collectionId);
      const info = { id: c.id, name: c.name, variableCount: c.variableIds.length };
      c.remove();
      return { deleted: info };
    }
    case "RENAME_VARIABLE": {
      const v = await figma.variables.getVariableByIdAsync(params.variableId);
      if (!v) throw new Error("Variable not found: " + params.variableId);
      const oldName = v.name;
      v.name = params.newName;
      return { variable: serializeVariable(v), oldName };
    }
    case "SET_VARIABLE_DESCRIPTION": {
      const v = await figma.variables.getVariableByIdAsync(params.variableId);
      if (!v) throw new Error("Variable not found: " + params.variableId);
      v.description = params.description || "";
      return { variable: serializeVariable(v) };
    }
    case "ADD_MODE": {
      const c = await figma.variables.getVariableCollectionByIdAsync(params.collectionId);
      if (!c) throw new Error("Collection not found: " + params.collectionId);
      const newModeId = c.addMode(params.modeName);
      return { collection: serializeCollection(c), newMode: { modeId: newModeId, name: params.modeName } };
    }
    case "RENAME_MODE": {
      const c = await figma.variables.getVariableCollectionByIdAsync(params.collectionId);
      if (!c) throw new Error("Collection not found: " + params.collectionId);
      const currentMode = c.modes.find((m) => m.modeId === params.modeId);
      if (!currentMode) throw new Error("Mode not found: " + params.modeId);
      const oldName = currentMode.name;
      c.renameMode(params.modeId, params.newName);
      return { collection: serializeCollection(c), oldName };
    }
    case "REFRESH_VARIABLES":
    case "GET_VARIABLES_DATA": {
      const variables = await figma.variables.getLocalVariablesAsync();
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      const data = { success: true, timestamp: Date.now(), fileKey: figma.fileKey || null, variables: variables.map(serializeVariable), variableCollections: collections.map(serializeCollection) };
      figma.ui.postMessage({ type: "bridge:variables-data", data });
      return { data };
    }
    // ── Component methods ──
    case "GET_LOCAL_COMPONENTS": {
      let findComponents2 = function(n) {
        if (n.type === "COMPONENT_SET" || n.type === "COMPONENT" && (!n.parent || n.parent.type !== "COMPONENT_SET")) {
          components.push({ id: n.id, name: n.name, key: n.key, type: n.type, description: n.description || null });
        }
        if ("children" in n) {
          for (const child of n.children) {
            try {
              findComponents2(child);
            } catch (e) {
            }
          }
        }
      };
      var findComponents = findComponents2;
      const components = [];
      for (const child of figma.currentPage.children) {
        try {
          findComponents2(child);
        } catch (e) {
        }
      }
      return { data: { components, totalComponents: components.length } };
    }
    case "INSTANTIATE_COMPONENT": {
      let component = null;
      if (params.componentKey) {
        try {
          component = await figma.importComponentByKeyAsync(params.componentKey);
        } catch (e) {
        }
      }
      if (!component && params.nodeId) {
        const node = await figma.getNodeByIdAsync(params.nodeId);
        if (node && node.type === "COMPONENT") component = node;
        else if (node && node.type === "COMPONENT_SET") component = node.defaultVariant;
      }
      if (!component) throw new Error("Component not found");
      const instance = component.createInstance();
      if (params.position) {
        instance.x = params.position.x || 0;
        instance.y = params.position.y || 0;
      }
      if (params.parentId) {
        const parent = await figma.getNodeByIdAsync(params.parentId);
        if (parent && "appendChild" in parent) parent.appendChild(instance);
      }
      return { instance: { id: instance.id, name: instance.name, x: instance.x, y: instance.y, width: instance.width, height: instance.height } };
    }
    case "GET_COMPONENT": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error("Node not found: " + params.nodeId);
      const isVariant = node.type === "COMPONENT" && node.parent && node.parent.type === "COMPONENT_SET";
      return { data: { nodeId: params.nodeId, component: { id: node.id, name: node.name, type: node.type, description: node.description || null, isVariant, componentPropertyDefinitions: node.type === "COMPONENT_SET" || node.type === "COMPONENT" && !isVariant ? node.componentPropertyDefinitions : void 0, children: "children" in node ? node.children.map((c) => ({ id: c.id, name: c.name, type: c.type })) : void 0 } } };
    }
    case "SET_INSTANCE_PROPERTIES": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error("Node not found: " + params.nodeId);
      if (node.type !== "INSTANCE") throw new Error("Node must be an INSTANCE. Got: " + node.type);
      const inst = node;
      await inst.getMainComponentAsync();
      const currentProps = inst.componentProperties;
      const propsToSet = {};
      for (const propName in params.properties) {
        if (currentProps[propName] !== void 0) {
          propsToSet[propName] = params.properties[propName];
        } else {
          for (const existing in currentProps) {
            if (existing.startsWith(propName + "#")) {
              propsToSet[existing] = params.properties[propName];
              break;
            }
          }
        }
      }
      if (Object.keys(propsToSet).length === 0) throw new Error("No valid properties. Available: " + Object.keys(currentProps).join(", "));
      inst.setProperties(propsToSet);
      return { instance: { id: inst.id, name: inst.name, propertiesSet: Object.keys(propsToSet) } };
    }
    case "ADD_COMPONENT_PROPERTY": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error("Node not found: " + params.nodeId);
      if (node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") throw new Error("Must be COMPONENT or COMPONENT_SET");
      const propNameId = node.addComponentProperty(params.propertyName, params.propertyType, params.defaultValue);
      return { propertyName: propNameId };
    }
    case "EDIT_COMPONENT_PROPERTY": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error("Node not found: " + params.nodeId);
      if (node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") throw new Error("Must be COMPONENT or COMPONENT_SET");
      const propNameId = node.editComponentProperty(params.propertyName, params.newValue);
      return { propertyName: propNameId };
    }
    case "DELETE_COMPONENT_PROPERTY": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error("Node not found: " + params.nodeId);
      if (node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") throw new Error("Must be COMPONENT or COMPONENT_SET");
      node.deleteComponentProperty(params.propertyName);
      return { deleted: true };
    }
    // ── Node manipulation ──
    case "RESIZE_NODE": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error("Node not found: " + params.nodeId);
      if (!("resize" in node)) throw new Error("Node does not support resize");
      if (params.withConstraints !== false) node.resize(params.width, params.height);
      else node.resizeWithoutConstraints(params.width, params.height);
      return { node: serializeNode(node) };
    }
    case "MOVE_NODE": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error("Node not found: " + params.nodeId);
      node.x = params.x;
      node.y = params.y;
      return { node: serializeNode(node) };
    }
    case "CLONE_NODE": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node || !("clone" in node)) throw new Error("Node not found or cannot be cloned");
      const clone = node.clone();
      return { node: serializeNode(clone) };
    }
    case "DELETE_NODE": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error("Node not found: " + params.nodeId);
      const info = { id: node.id, name: node.name };
      node.remove();
      return { deleted: info };
    }
    case "RENAME_NODE": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error("Node not found: " + params.nodeId);
      const oldName = node.name;
      node.name = params.newName;
      return { node: serializeNode(node), oldName };
    }
    case "CREATE_CHILD_NODE": {
      const parent = await figma.getNodeByIdAsync(params.parentId);
      if (!parent || !("appendChild" in parent)) throw new Error("Parent not found or cannot have children");
      let newNode;
      const props = params.properties || {};
      switch (params.nodeType) {
        case "RECTANGLE":
          newNode = figma.createRectangle();
          break;
        case "ELLIPSE":
          newNode = figma.createEllipse();
          break;
        case "FRAME":
          newNode = figma.createFrame();
          break;
        case "TEXT": {
          const t = figma.createText();
          await figma.loadFontAsync({ family: "Inter", style: "Regular" });
          t.fontName = { family: "Inter", style: "Regular" };
          if (props.text) t.characters = props.text;
          newNode = t;
          break;
        }
        case "LINE":
          newNode = figma.createLine();
          break;
        case "POLYGON":
          newNode = figma.createPolygon();
          break;
        case "STAR":
          newNode = figma.createStar();
          break;
        case "VECTOR":
          newNode = figma.createVector();
          break;
        default:
          throw new Error("Unsupported node type: " + params.nodeType);
      }
      if (props.name) newNode.name = props.name;
      if (props.x !== void 0) newNode.x = props.x;
      if (props.y !== void 0) newNode.y = props.y;
      if (props.width !== void 0 && props.height !== void 0) newNode.resize(props.width, props.height);
      if (props.fills) {
        const processed = props.fills.map((f) => {
          if (f.type === "SOLID" && typeof f.color === "string") {
            const rgb = hexToFigmaRGB(f.color);
            return { type: "SOLID", color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: rgb.a };
          }
          return f;
        });
        newNode.fills = processed;
      }
      parent.appendChild(newNode);
      return { node: serializeNode(newNode) };
    }
    case "SET_NODE_DESCRIPTION": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error("Node not found: " + params.nodeId);
      if (!("description" in node)) throw new Error("Node does not support description");
      node.description = params.description || "";
      if (params.descriptionMarkdown && "descriptionMarkdown" in node) node.descriptionMarkdown = params.descriptionMarkdown;
      return { node: { id: node.id, name: node.name, description: node.description } };
    }
    // ── Visual properties ──
    case "SET_NODE_FILLS": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node || !("fills" in node)) throw new Error("Node not found or does not support fills");
      const processed = params.fills.map((f) => {
        if (f.type === "SOLID" && typeof f.color === "string") {
          const rgb = hexToFigmaRGB(f.color);
          return { type: "SOLID", color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: rgb.a !== void 0 ? rgb.a : f.opacity !== void 0 ? f.opacity : 1 };
        }
        return f;
      });
      node.fills = processed;
      return { node: { id: node.id, name: node.name } };
    }
    case "SET_NODE_STROKES": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node || !("strokes" in node)) throw new Error("Node not found or does not support strokes");
      const processed = params.strokes.map((s) => {
        if (s.type === "SOLID" && typeof s.color === "string") {
          const rgb = hexToFigmaRGB(s.color);
          return { type: "SOLID", color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: rgb.a !== void 0 ? rgb.a : s.opacity !== void 0 ? s.opacity : 1 };
        }
        return s;
      });
      node.strokes = processed;
      if (params.strokeWeight !== void 0) node.strokeWeight = params.strokeWeight;
      return { node: { id: node.id, name: node.name } };
    }
    case "SET_NODE_OPACITY": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node || !("opacity" in node)) throw new Error("Node not found or does not support opacity");
      node.opacity = Math.max(0, Math.min(1, params.opacity));
      return { node: { id: node.id, name: node.name, opacity: node.opacity } };
    }
    case "SET_NODE_CORNER_RADIUS": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node || !("cornerRadius" in node)) throw new Error("Node not found or does not support corner radius");
      node.cornerRadius = params.radius;
      return { node: { id: node.id, name: node.name, cornerRadius: node.cornerRadius } };
    }
    case "SET_TEXT_CONTENT": {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node || node.type !== "TEXT") throw new Error("Node not found or not a TEXT node");
      const textNode = node;
      const fontName = textNode.fontName;
      if (fontName !== figma.mixed) await figma.loadFontAsync(fontName);
      else await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      textNode.characters = params.text;
      if (params.fontSize) textNode.fontSize = params.fontSize;
      return { node: { id: textNode.id, name: textNode.name, characters: textNode.characters } };
    }
    case "SET_IMAGE_FILL": {
      const bytes = new Uint8Array(params.imageBytes);
      const image = figma.createImage(bytes);
      const fill = { type: "IMAGE", scaleMode: params.scaleMode || "FILL", imageHash: image.hash };
      const nodeIds = params.nodeIds || (params.nodeId ? [params.nodeId] : []);
      const updatedNodes = [];
      for (const nid of nodeIds) {
        const node = await figma.getNodeByIdAsync(nid);
        if (node && "fills" in node) {
          node.fills = [fill];
          updatedNodes.push({ id: node.id, name: node.name });
        }
      }
      return { imageHash: image.hash, updatedCount: updatedNodes.length, nodes: updatedNodes };
    }
    // ── Analysis ──
    case "LINT_DESIGN": {
      let lintWalk2 = function(n, depth) {
        if (depth > maxDepth || findings.length >= maxFindings) return;
        try {
          if (n.type === "TEXT") {
            const tn = n;
            if (tn.fontSize !== figma.mixed && typeof tn.fontSize === "number" && tn.fontSize < 12) findings.push({ nodeId: n.id, nodeName: n.name, rule: "wcag-text-size", message: "Text size " + tn.fontSize + "px < 12px minimum" });
            if (!tn.textStyleId) findings.push({ nodeId: n.id, nodeName: n.name, rule: "no-text-style", message: "Text node not using a text style" });
          }
          if ((n.type === "FRAME" || n.type === "COMPONENT" || n.type === "INSTANCE") && "children" in n) {
            const frame = n;
            if (frame.children.length === 0) findings.push({ nodeId: n.id, nodeName: n.name, rule: "empty-container", message: "Frame has no children" });
            else if (frame.children.length > 1 && frame.layoutMode === "NONE") findings.push({ nodeId: n.id, nodeName: n.name, rule: "no-autolayout", message: "Frame with multiple children has no auto-layout" });
          }
          if (/^(Frame|Rectangle|Ellipse|Group|Text|Line|Vector|Component|Instance)(\s+\d+)?$/.test(n.name)) findings.push({ nodeId: n.id, nodeName: n.name, rule: "default-name", message: "Node has default Figma name" });
        } catch (e) {
        }
        if ("children" in n) {
          for (const child of n.children) {
            try {
              lintWalk2(child, depth + 1);
            } catch (e) {
            }
          }
        }
      };
      var lintWalk = lintWalk2;
      const rootNode = params.nodeId ? await figma.getNodeByIdAsync(params.nodeId) : figma.currentPage;
      if (!rootNode) throw new Error("Node not found");
      const findings = [];
      const maxFindings = params.maxFindings || 50;
      const maxDepth = params.maxDepth || 8;
      lintWalk2(rootNode, 0);
      return { data: { findings, totalFindings: findings.length, truncated: findings.length >= maxFindings } };
    }
    case "AUDIT_COMPONENT_ACCESSIBILITY": {
      let a11yWalk2 = function(n, depth) {
        if (depth > 6 || issues.length > 30) return;
        try {
          if ((n.type === "FRAME" || n.type === "COMPONENT" || n.type === "INSTANCE") && /button|link|input|checkbox|radio|switch|toggle|tab/i.test(n.name)) {
            const frame = n;
            if (frame.width < targetSize || frame.height < targetSize) issues.push({ nodeId: n.id, nodeName: n.name, issue: `Target size ${Math.round(frame.width)}x${Math.round(frame.height)} < ${targetSize}x${targetSize}`, severity: "critical" });
          }
          if (n.type === "TEXT") {
            const tn = n;
            if (tn.fontSize !== figma.mixed && typeof tn.fontSize === "number" && tn.fontSize < 12) issues.push({ nodeId: n.id, nodeName: n.name, issue: "Text too small: " + tn.fontSize + "px", severity: "warning" });
          }
        } catch (e) {
        }
        if ("children" in n) {
          for (const child of n.children) {
            try {
              a11yWalk2(child, depth + 1);
            } catch (e) {
            }
          }
        }
      };
      var a11yWalk = a11yWalk2;
      const rootNode = params.nodeId ? await figma.getNodeByIdAsync(params.nodeId) : figma.currentPage.selection[0];
      if (!rootNode) throw new Error("No node selected or found");
      const issues = [];
      const targetSize = params.targetSize || 24;
      a11yWalk2(rootNode, 0);
      return { data: { issues, totalIssues: issues.length, nodeId: rootNode.id, nodeName: rootNode.name } };
    }
    default:
      throw new Error("Unknown bridge method: " + method);
  }
}
function apiKeyStorageKey(provider) {
  return `api-key-${provider}`;
}
function maskKey(key) {
  if (key.length <= 8) return "\u2022\u2022\u2022\u2022";
  return `${key.slice(0, 6)}\u2026${key.slice(-4)}`;
}
async function postApiKeyState(provider) {
  const key = await figma.clientStorage.getAsync(apiKeyStorageKey(provider));
  figma.ui.postMessage({
    type: "api-key-state",
    hasKey: typeof key === "string" && key.length > 0,
    masked: typeof key === "string" && key.length > 0 ? maskKey(key) : void 0
  });
}
figma.showUI(__html__, { width: 360, height: 500, themeColors: true });
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "ui-ready":
      notifySelection();
      figma.ui.postMessage({ type: "token-status", count: 0, version: "loading library..." });
      try {
        figma.notify("Loading S2A library...");
        await loadLibraryTokens();
        const count = getTokenCount();
        figma.ui.postMessage({
          type: "token-status",
          count,
          version: count > 0 ? getTokenVersion() : "no library"
        });
        figma.notify(count > 0 ? `S2A library: ${count} tokens loaded` : "No S2A tokens found");
      } catch (e) {
        figma.ui.postMessage({ type: "token-status", count: 0, version: `error: ${e.message}` });
        figma.notify(`Library load error: ${e.message}`, { error: true });
      }
      break;
    case "s2a-audit": {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) {
        figma.notify("Select a node first");
        break;
      }
      const audit = await runS2AAudit(sel[0]);
      const pct = audit.total > 0 ? Math.round(audit.matched / audit.total * 100) : 0;
      figma.notify(`S2A Audit: ${audit.matched}/${audit.total} properties matched (${pct}%) \u2014 ${audit.issues.length} issues`);
      figma.ui.postMessage({
        type: "s2a-audit-result",
        matched: audit.matched,
        total: audit.total,
        issues: audit.issues
      });
      break;
    }
    case "full-align-s2a": {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) {
        figma.notify("Select a node first");
        break;
      }
      figma.notify("Aligning to S2A library...");
      try {
        const result2 = await runFullAlign(sel[0]);
        figma.notify(`Full Align: ${result2.aligned} bound to S2A, ${result2.unmatched.length} unmatched (mode: ${result2.mode})`);
        figma.ui.postMessage(__spreadValues({ type: "s2a-align-result" }, result2));
      } catch (e) {
        figma.notify(`Full Align failed: ${e.message}`, { error: true });
      }
      break;
    }
    case "text-colors-align": {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) {
        figma.notify("Select a node first");
        break;
      }
      figma.notify("Aligning text & colors to S2A library...");
      try {
        const result2 = await runTextColorsAlign(sel[0]);
        figma.notify(`Text & Colors: ${result2.aligned} bound to S2A, ${result2.unmatched.length} unmatched (mode: ${result2.mode})`);
        figma.ui.postMessage(__spreadValues({ type: "s2a-align-result" }, result2));
      } catch (e) {
        figma.notify(`Text & Colors failed: ${e.message}`, { error: true });
      }
      break;
    }
    case "apply-grid": {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) {
        figma.notify("Select a frame first");
        break;
      }
      const node = sel[0];
      if (!("layoutGrids" in node)) {
        figma.notify("Select a frame");
        break;
      }
      try {
        const frame = node;
        const width = frame.width;
        const isMobile = width < 768;
        const grid = {
          pattern: "COLUMNS",
          alignment: "STRETCH",
          count: isMobile ? 6 : 12,
          gutterSize: 8,
          offset: isMobile ? 24 : Math.round(width * 0.08333),
          visible: true,
          color: { r: 18 / 255, g: 94 / 255, b: 222 / 255, a: 0.1 }
        };
        frame.layoutGrids = [...frame.layoutGrids, grid];
        const mode = isMobile ? "6-col mobile" : "12-col desktop";
        figma.notify(`Grid applied: ${mode}`);
        figma.ui.postMessage({ type: "grid-result", message: `Applied ${mode} grid (${Math.round(width)}px)` });
      } catch (e) {
        figma.notify(`Grid failed: ${e.message}`, { error: true });
        figma.ui.postMessage({ type: "grid-result", message: `Error: ${e.message}` });
      }
      break;
    }
    case "apply-grid-xl": {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) {
        figma.notify("Select a frame first");
        break;
      }
      const node = sel[0];
      if (!("layoutGrids" in node)) {
        figma.notify("Select a frame");
        break;
      }
      try {
        const frame = node;
        if (frame.width < 1920) {
          figma.notify(`Frame is ${Math.round(frame.width)}px \u2014 needs to be at least 1920px`, { error: true });
          figma.ui.postMessage({ type: "grid-result", message: `Frame too narrow (${Math.round(frame.width)}px < 1920px)` });
          break;
        }
        const margin = Math.round((frame.width - 1920) / 2);
        const grid = {
          pattern: "COLUMNS",
          alignment: "STRETCH",
          count: 12,
          gutterSize: 8,
          offset: margin,
          visible: true,
          color: { r: 18 / 255, g: 94 / 255, b: 222 / 255, a: 0.1 }
        };
        frame.layoutGrids = [...frame.layoutGrids, grid];
        figma.notify("XL grid applied: 1920px centered");
        figma.ui.postMessage({ type: "grid-result", message: `Applied XL grid (1920px centered, margin: ${margin}px)` });
      } catch (e) {
        figma.notify(`Grid XL failed: ${e.message}`, { error: true });
        figma.ui.postMessage({ type: "grid-result", message: `Error: ${e.message}` });
      }
      break;
    }
    case "clear-grids": {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) {
        figma.notify("Select a frame first");
        break;
      }
      const node = sel[0];
      if (!("layoutGrids" in node)) {
        figma.notify("Select a frame");
        break;
      }
      node.layoutGrids = [];
      figma.notify("Grids cleared");
      figma.ui.postMessage({ type: "grid-result", message: "All grids cleared" });
      break;
    }
    case "force-match": {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) {
        figma.notify("Select a node first");
        break;
      }
      if (!Array.isArray(msg.categories)) {
        figma.notify("No categories selected");
        break;
      }
      const categories = msg.categories;
      try {
        const result2 = await forceMatch(sel[0], categories);
        figma.notify(`Matched ${result2.applied} properties to closest S2A tokens`);
        figma.ui.postMessage({ type: "match-result", message: `Done: ${result2.applied} matched, ${result2.skipped} skipped` });
      } catch (e) {
        figma.notify(`Match failed: ${e.message}`, { error: true });
        figma.ui.postMessage({ type: "match-result", message: `Error: ${e.message}` });
      }
      break;
    }
    case "navigate-to-node": {
      const nodeId = msg.nodeId;
      if (nodeId) {
        const target = await figma.getNodeByIdAsync(nodeId);
        if (target) {
          figma.currentPage.selection = [target];
          figma.viewport.scrollAndZoomIntoView([target]);
        }
      }
      break;
    }
    case "spec-it": {
      const sel = figma.currentPage.selection;
      if (sel.length > 0) {
        try {
          const sections = Array.isArray(msg.sections) ? msg.sections : ["anatomy", "layout", "typography", "components"];
          await specIt(sel[0], sections);
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : "Unknown error";
          figma.ui.postMessage({ type: "spec-it-status", message: `Error: ${errorMsg}` });
          figma.notify(`Spec it failed: ${errorMsg}`, { error: true });
        }
      }
      break;
    }
    case "generate-blueline": {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) {
        figma.notify("Select a frame first");
        break;
      }
      try {
        const tier1 = Array.isArray(msg.tier1) ? msg.tier1 : [];
        const tier2 = Array.isArray(msg.tier2) ? msg.tier2 : [];
        figma.ui.postMessage({ type: "a11y-status", message: "Generating blueline..." });
        const grouped = msg.grouped !== false;
        const result2 = await generateBlueline(sel[0], tier1, tier2, { grouped });
        if (tier2.length > 0) {
          figma.ui.postMessage({
            type: "a11y-tier2-request",
            frameId: result2.frameId,
            sections: result2.tier2Sections,
            frameName: sel[0].name
          });
        } else {
          figma.ui.postMessage({ type: "a11y-status", message: "Blueline generated!" });
        }
        figma.notify(`Blueline created for "${sel[0].name}"`);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown error";
        figma.ui.postMessage({ type: "a11y-status", message: `Error: ${errorMsg}` });
        figma.notify(`Blueline failed: ${errorMsg}`, { error: true });
      }
      break;
    }
    case "generate-blueline-panels": {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) {
        figma.notify("Select a frame first");
        break;
      }
      try {
        const tier1 = Array.isArray(msg.tier1) ? msg.tier1 : [];
        const tier2 = Array.isArray(msg.tier2) ? msg.tier2 : [];
        figma.ui.postMessage({ type: "a11y-status", message: "Generating panels..." });
        const result2 = await generateBluelinePanels(sel[0], tier1, tier2);
        figma.ui.postMessage({ type: "a11y-tier2-request", mode: "sections" });
        figma.notify(`Blueline panels created for "${sel[0].name}"`);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown error";
        figma.ui.postMessage({ type: "a11y-status", message: `Error: ${errorMsg}` });
        figma.notify(`Panels failed: ${errorMsg}`, { error: true });
      }
      break;
    }
    case "get-api-key": {
      const provider = typeof msg.provider === "string" ? msg.provider : "anthropic";
      await postApiKeyState(provider);
      break;
    }
    case "save-api-key": {
      const key = typeof msg.key === "string" ? msg.key.trim() : "";
      const provider = typeof msg.provider === "string" ? msg.provider : "anthropic";
      if (!key) {
        figma.notify("Empty API key", { error: true });
        break;
      }
      await figma.clientStorage.setAsync(apiKeyStorageKey(provider), key);
      await postApiKeyState(provider);
      figma.notify("API key saved");
      break;
    }
    case "clear-api-key": {
      const provider = typeof msg.provider === "string" ? msg.provider : "anthropic";
      await figma.clientStorage.deleteAsync(apiKeyStorageKey(provider));
      await postApiKeyState(provider);
      figma.notify("API key cleared");
      break;
    }
    // ── Bridge unified command handler (figma-console MCP protocol) ──────
    case "bridge:command": {
      const requestId = msg.requestId;
      const method2 = msg.method;
      const params2 = msg.params || {};
      try {
        const result2 = await handleBridgeMethod(method2, params2);
        figma.ui.postMessage(__spreadValues({ type: "bridge:command-result", requestId, success: true }, result2));
      } catch (e) {
        figma.ui.postMessage({ type: "bridge:command-result", requestId, success: false, error: e.message || String(e) });
      }
      break;
    }
    case "localize": {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) {
        figma.notify("Select a frame first");
        break;
      }
      const provider = typeof msg.provider === "string" ? msg.provider : "mymemory";
      const languages = Array.isArray(msg.languages) ? msg.languages : [];
      const applyRtl = Boolean(msg.applyRtl);
      if (languages.length === 0) {
        figma.ui.postMessage({ type: "localize-status", message: "Select at least one language." });
        break;
      }
      if (provider === "bridge") {
        const sourceTexts = collectSourceText(sel[0]);
        if (sourceTexts.length === 0) {
          figma.ui.postMessage({ type: "localize-status", message: "No text found in selection." });
          break;
        }
        figma.ui.postMessage({
          type: "localize-bridge-prompt",
          frameName: sel[0].name,
          frameId: sel[0].id,
          languages,
          applyRtl,
          sourceTexts
        });
        break;
      }
      const needsKey = ["deepl", "google", "azure", "anthropic"].includes(provider);
      let apiKey = "";
      if (needsKey) {
        apiKey = await figma.clientStorage.getAsync(apiKeyStorageKey(provider)) || "";
        if (!apiKey) {
          figma.ui.postMessage({ type: "localize-status", message: `Add your ${provider} API key first.` });
          break;
        }
      }
      try {
        const result2 = await localize(sel[0], languages, applyRtl, provider, apiKey);
        const errTail = result2.errors.length > 0 ? ` (errors: ${result2.errors.join("; ")})` : "";
        figma.ui.postMessage({ type: "localize-status", message: `Created ${result2.created} localized frame(s).${errTail}` });
        figma.notify(`Localized ${result2.created} frame(s)`);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown error";
        figma.ui.postMessage({ type: "localize-status", message: `Error: ${errorMsg}` });
        figma.notify(`Localize failed: ${errorMsg}`, { error: true });
      }
      break;
    }
  }
};
figma.on("selectionchange", () => {
  notifySelection();
});
figma.on("currentpagechange", () => {
  figma.ui.postMessage({
    type: "bridge:page-changed",
    page: { id: figma.currentPage.id, name: figma.currentPage.name }
  });
});
function notifySelection() {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) {
    figma.ui.postMessage({ type: "selection-changed", selection: null, count: 0, hasAutoLayout: false });
    figma.ui.postMessage({ type: "bridge:selection-changed", selection: [] });
    return;
  }
  const node = sel[0];
  const hasAutoLayout = "layoutMode" in node && node.layoutMode !== "NONE";
  figma.ui.postMessage({
    type: "selection-changed",
    selection: {
      name: node.name,
      type: node.type,
      width: "width" in node ? node.width : 0,
      height: "height" in node ? node.height : 0
    },
    count: sel.length,
    hasAutoLayout
  });
  figma.ui.postMessage({
    type: "bridge:selection-changed",
    selection: sel.map((n) => ({ id: n.id, name: n.name, type: n.type }))
  });
  if (sel.length > 0) {
    const properties = getNodeProperties(sel[0]);
    figma.ui.postMessage({ type: "node-properties", properties });
  }
}
