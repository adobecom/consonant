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

// src/code.ts
function serializeVariable(v) {
  return {
    id: v.id,
    name: v.name,
    key: v.key,
    resolvedType: v.resolvedType,
    valuesByMode: v.valuesByMode,
    variableCollectionId: v.variableCollectionId,
    scopes: v.scopes,
    codeSyntax: v.codeSyntax || {},
    description: v.description,
    hiddenFromPublishing: v.hiddenFromPublishing
  };
}
function serializeCollection(c) {
  return {
    id: c.id,
    name: c.name,
    key: c.key,
    modes: c.modes,
    defaultModeId: c.defaultModeId,
    variableIds: c.variableIds
  };
}
async function handleBridgeMethod(method, params) {
  switch (method) {
    case "EXECUTE_CODE": {
      const code = params.code;
      if (typeof code !== "string") throw new Error("EXECUTE_CODE: params.code must be a string");
      if (code.length > 65536) throw new Error("EXECUTE_CODE: code exceeds 64KB limit");
      const timeout = Math.min(params.timeout || 5e3, 3e4);
      const wrappedCode = "(async function() {\n" + code + "\n})()";
      const timeoutPromise = new Promise((_r, reject) => {
        setTimeout(() => reject(new Error("Execution timed out after " + timeout + "ms")), timeout);
      });
      let codePromise;
      try {
        codePromise = eval(wrappedCode);
      } catch (err) {
        throw new Error("Syntax error: " + (err.message || String(err)));
      }
      const result = await Promise.race([codePromise, timeoutPromise]);
      return { result, fileContext: { fileName: figma.root.name, fileKey: figma.fileKey || null } };
    }
    case "GET_FILE_INFO": {
      return {
        fileInfo: {
          fileName: figma.root.name,
          fileKey: figma.fileKey || null,
          currentPage: { id: figma.currentPage.id, name: figma.currentPage.name }
        }
      };
    }
    case "REFRESH_VARIABLES":
    case "GET_VARIABLES_DATA": {
      const variables = await figma.variables.getLocalVariablesAsync();
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      const data = {
        success: true,
        timestamp: Date.now(),
        fileKey: figma.fileKey || null,
        variables: variables.map(serializeVariable),
        variableCollections: collections.map(serializeCollection)
      };
      return { data };
    }
    case "GET_SELECTION_DATA": {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) return { selectionData: null };
      const node = serializeNodeForProto(sel[0]);
      return {
        selectionData: __spreadProps(__spreadValues({}, node), {
          fileKey: figma.fileKey || null,
          fileName: figma.root.name,
          page: { id: figma.currentPage.id, name: figma.currentPage.name }
        })
      };
    }
    default:
      throw new Error("Unknown method: " + method);
  }
}
var PROTO_FRAME_TYPES = /* @__PURE__ */ new Set([
  "FRAME",
  "COMPONENT",
  "COMPONENT_SET",
  "INSTANCE",
  "GROUP",
  "SECTION"
]);
function notifySelection() {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) {
    figma.ui.postMessage({ type: "selection-changed", setId: null, nodeId: null });
    return;
  }
  const first = sel[0];
  figma.ui.postMessage({
    type: "selection-changed",
    setId: first.type === "COMPONENT_SET" ? first.id : null,
    nodeId: first.id,
    nodeName: first.name,
    nodeType: first.type,
    fileKey: figma.fileKey || null,
    fileName: figma.root.name,
    width: "width" in first ? Math.round(first.width) : void 0,
    height: "height" in first ? Math.round(first.height) : void 0,
    variantCount: first.type === "COMPONENT_SET" ? first.children.length : void 0
  });
  if (first.type === "COMPONENT_SET") {
    const defs = first.componentPropertyDefinitions;
    const axes = Object.entries(defs).map(([name, def]) => ({
      name,
      type: def.type,
      variantOptions: def.variantOptions
    }));
    figma.ui.postMessage({ type: "select:axes", setId: first.id, setName: first.name, axes });
  }
}
function serializeNodeForProto(node, depth = 0) {
  const base = {
    id: node.id,
    name: node.name,
    type: node.type
  };
  if ("width" in node) {
    base.width = Math.round(node.width);
    base.height = Math.round(node.height);
  }
  if ("componentPropertyDefinitions" in node) {
    const defs = node.componentPropertyDefinitions;
    base.componentProperties = Object.fromEntries(
      Object.entries(defs).map(([k, v]) => [k, { type: v.type, defaultValue: v.defaultValue }])
    );
  }
  if (depth < 2 && "children" in node) {
    base.children = node.children.slice(0, 20).map(
      (c) => serializeNodeForProto(c, depth + 1)
    );
  }
  return base;
}
figma.on("selectionchange", notifySelection);
figma.on("currentpagechange", () => {
  figma.ui.postMessage({
    type: "page-changed",
    page: { id: figma.currentPage.id, name: figma.currentPage.name }
  });
});
figma.showUI(__html__, { width: 320, height: 480, themeColors: true });
figma.ui.onmessage = async (msg) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S;
  switch (msg.type) {
    case "ui-ready":
      notifySelection();
      break;
    case "select:apply-filter": {
      let parseProps2 = function(name) {
        const props = {};
        for (const part of name.split(",")) {
          const eq = part.indexOf("=");
          if (eq !== -1) props[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
        }
        return props;
      };
      var parseProps = parseProps2;
      const setNode = await figma.getNodeByIdAsync(msg.setId);
      if (!setNode || setNode.type !== "COMPONENT_SET") {
        figma.notify("Component set not found \u2014 click into it and try again");
        break;
      }
      const filter = msg.filter || {};
      const variants = setNode.children;
      const axes = Object.keys(filter);
      const matched = variants.filter((v) => {
        if (axes.length === 0) return true;
        const props = parseProps2(v.name);
        return axes.every((axis) => {
          const allowed = filter[axis];
          return !allowed || allowed.length === 0 || allowed.includes(props[axis]);
        });
      });
      figma.currentPage.selection = matched;
      if (matched.length > 0) figma.viewport.scrollAndZoomIntoView(matched);
      figma.ui.postMessage({
        type: "select:result",
        message: `Selected ${matched.length} of ${variants.length} variants`
      });
      break;
    }
    case "get-settings": {
      try {
        const settings = await figma.clientStorage.getAsync("github-settings");
        figma.ui.postMessage({ type: "settings-loaded", settings: settings != null ? settings : null });
      } catch (e) {
        figma.ui.postMessage({ type: "settings-loaded", settings: null });
      }
      break;
    }
    case "save-settings": {
      try {
        await figma.clientStorage.setAsync("github-settings", msg.settings);
        figma.ui.postMessage({ type: "settings-saved", success: true });
      } catch (e) {
        figma.ui.postMessage({ type: "settings-saved", success: false, error: e.message || String(e) });
      }
      break;
    }
    case "resize-for-view": {
      const w = msg.width || 320;
      const h = msg.height || 480;
      figma.ui.resize(w, h);
      break;
    }
    case "annotate:apply": {
      const nodeId = msg.nodeId;
      const categories = new Set((_a = msg.categories) != null ? _a : []);
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        figma.ui.postMessage({ type: "annotate:result", error: "Node not found" });
        break;
      }
      const allNodes = [node];
      if ("findAll" in node) allNodes.push(...node.findAll(() => true));
      const weightVarIds = /* @__PURE__ */ new Set();
      for (const n of allNodes) {
        const fs = (_b = n.boundVariables) == null ? void 0 : _b.fontStyle;
        if ((_c = fs == null ? void 0 : fs[0]) == null ? void 0 : _c.id) weightVarIds.add(fs[0].id);
      }
      const weightNames = /* @__PURE__ */ new Map();
      await Promise.all([...weightVarIds].map(async (id) => {
        try {
          const v = await figma.variables.getVariableByIdAsync(id);
          if (v) weightNames.set(id, v.name);
        } catch (e) {
        }
      }));
      let annotated = 0;
      for (const n of allNodes) {
        const bv = (_d = n.boundVariables) != null ? _d : {};
        const anns = [];
        if (categories.has("color-fg") && n.type === "TEXT" && ((_f = (_e = bv.fills) == null ? void 0 : _e.length) != null ? _f : 0) > 0)
          anns.push({ labelMarkdown: "Color", properties: [{ type: "fills" }] });
        if (categories.has("color-bg") && n.type !== "TEXT" && ((_h = (_g = bv.fills) == null ? void 0 : _g.length) != null ? _h : 0) > 0)
          anns.push({ labelMarkdown: "Background", properties: [{ type: "fills" }] });
        if (categories.has("spacing")) {
          const sp = [];
          if (bv.paddingTop || bv.paddingBottom || bv.paddingLeft || bv.paddingRight) sp.push({ type: "padding" });
          if (bv.itemSpacing) sp.push({ type: "itemSpacing" });
          if (sp.length) anns.push({ labelMarkdown: "Spacing", properties: sp });
        }
        if (categories.has("shape")) {
          const sh = [];
          if (bv.cornerRadius) sh.push({ type: "cornerRadius" });
          if (((_j = (_i = bv.strokes) == null ? void 0 : _i.length) != null ? _j : 0) > 0) sh.push({ type: "strokes" });
          if (sh.length) anns.push({ labelMarkdown: "Shape", properties: sh });
        }
        if (categories.has("typography") && n.type === "TEXT") {
          const tp = [];
          if (((_l = (_k = bv.fontFamily) == null ? void 0 : _k.length) != null ? _l : 0) > 0) tp.push({ type: "fontFamily" });
          if (((_n = (_m = bv.fontSize) == null ? void 0 : _m.length) != null ? _n : 0) > 0) tp.push({ type: "fontSize" });
          if (((_p = (_o = bv.lineHeight) == null ? void 0 : _o.length) != null ? _p : 0) > 0) tp.push({ type: "lineHeight" });
          if (((_r = (_q = bv.letterSpacing) == null ? void 0 : _q.length) != null ? _r : 0) > 0) tp.push({ type: "letterSpacing" });
          if (tp.length) anns.push({ labelMarkdown: "Typography", properties: tp });
          if (((_t = (_s = bv.fontStyle) == null ? void 0 : _s.length) != null ? _t : 0) > 0) {
            const label = (_u = weightNames.get(bv.fontStyle[0].id)) != null ? _u : "font-weight";
            anns.push({ labelMarkdown: label, properties: [{ type: "fontWeight" }] });
          }
        }
        if (categories.has("sizing") && n === node)
          anns.push({ labelMarkdown: node.name.replace(/^\./, ""), properties: [{ type: "width" }, { type: "height" }] });
        if (anns.length > 0) {
          try {
            n.annotations = anns;
            annotated++;
          } catch (e) {
          }
        }
      }
      figma.ui.postMessage({ type: "annotate:result", annotated });
      break;
    }
    case "annotate:clear": {
      const nodeId = msg.nodeId;
      const node = await figma.getNodeByIdAsync(nodeId);
      if (node) {
        const all = [node];
        if ("findAll" in node) all.push(...node.findAll(() => true));
        let cleared = 0;
        for (const n of all) {
          try {
            if (((_v = n.annotations) == null ? void 0 : _v.length) > 0) {
              n.annotations = [];
              cleared++;
            }
          } catch (e) {
          }
        }
        figma.ui.postMessage({ type: "annotate:cleared", cleared });
      } else {
        figma.ui.postMessage({ type: "annotate:cleared", cleared: 0 });
      }
      break;
    }
    case "spec:generate": {
      const setId = msg.setId;
      const categories = (_w = msg.categories) != null ? _w : [];
      if (categories.length === 0) {
        figma.ui.postMessage({ type: "spec:result", error: "Select at least one category" });
        break;
      }
      const specSetNode = await figma.getNodeByIdAsync(setId);
      if (!specSetNode || specSetNode.type !== "COMPONENT_SET") {
        figma.ui.postMessage({ type: "spec:result", error: "Component set not found \u2014 select it and try again" });
        break;
      }
      const specSet = specSetNode;
      const variants = specSet.children;
      const specWeightIds = /* @__PURE__ */ new Set();
      for (const v of variants) {
        for (const n of [v, ...v.findAll(() => true)]) {
          const fs = (_x = n.boundVariables) == null ? void 0 : _x.fontStyle;
          if ((_y = fs == null ? void 0 : fs[0]) == null ? void 0 : _y.id) specWeightIds.add(fs[0].id);
        }
      }
      const specWeightNames = /* @__PURE__ */ new Map();
      await Promise.all([...specWeightIds].map(async (id) => {
        try {
          const v = await figma.variables.getVariableByIdAsync(id);
          if (v) specWeightNames.set(id, v.name);
        } catch (e) {
        }
      }));
      const CAT_LABELS = {
        "color-fg": "Color Fg",
        "color-bg": "Color Bg",
        "spacing": "Spacing",
        "shape": "Shape",
        "typography": "Typography",
        "sizing": "Sizing"
      };
      const getVariantFingerprint = (v, cat) => {
        const all = [v, ...v.findAll(() => true)];
        const roundColor = (c) => {
          var _a2, _b2, _c2;
          return c ? `${Math.round(((_a2 = c.r) != null ? _a2 : 0) * 255)},${Math.round(((_b2 = c.g) != null ? _b2 : 0) * 255)},${Math.round(((_c2 = c.b) != null ? _c2 : 0) * 255)}` : "";
        };
        switch (cat) {
          case "shape":
            return all.map((n) => {
              var _a2;
              const cr = n.cornerRadius;
              const sl = ((_a2 = n.strokes) != null ? _a2 : []).length;
              return `${typeof cr === "number" ? Math.round(cr) : "?"}:${sl}`;
            }).join("|");
          case "spacing":
            return all.filter((n) => n.type === "FRAME" || n.type === "COMPONENT").map((n) => {
              var _a2, _b2, _c2, _d2, _e2;
              const f = n;
              return `${(_a2 = f.paddingTop) != null ? _a2 : 0},${(_b2 = f.paddingBottom) != null ? _b2 : 0},${(_c2 = f.paddingLeft) != null ? _c2 : 0},${(_d2 = f.paddingRight) != null ? _d2 : 0},${(_e2 = f.itemSpacing) != null ? _e2 : 0}`;
            }).join("|");
          case "color-fg":
            return all.filter((n) => n.type === "TEXT").map(
              (n) => {
                var _a2;
                return ((_a2 = n.fills) != null ? _a2 : []).map((f) => {
                  var _a3;
                  return roundColor(f.color) + ":" + Math.round(((_a3 = f.opacity) != null ? _a3 : 1) * 100);
                }).join(";");
              }
            ).join("|");
          case "color-bg":
            return all.filter((n) => n.type !== "TEXT").map(
              (n) => {
                var _a2;
                return ((_a2 = n.fills) != null ? _a2 : []).map((f) => {
                  var _a3;
                  return roundColor(f.color) + ":" + Math.round(((_a3 = f.opacity) != null ? _a3 : 1) * 100);
                }).join(";");
              }
            ).join("|");
          case "typography":
            return all.filter((n) => n.type === "TEXT").map((n) => {
              var _a2, _b2;
              const f = n;
              const fn = typeof f.fontName === "object" ? `${(_a2 = f.fontName) == null ? void 0 : _a2.family}/${(_b2 = f.fontName) == null ? void 0 : _b2.style}` : "";
              return `${f.fontSize}:${fn}`;
            }).join("|");
          case "sizing":
            return `${Math.round(v.width)}:${Math.round(v.height)}`;
          default:
            return v.id;
        }
      };
      const xBase = specSet.x + specSet.width + 100;
      let yOffset = specSet.y;
      const allSections = [];
      for (const cat of categories) {
        const section = figma.createSection();
        section.name = specSet.name + " \u2014 " + ((_z = CAT_LABELS[cat]) != null ? _z : cat) + " Spec";
        section.x = xBase;
        section.y = yOffset;
        figma.currentPage.appendChild(section);
        try {
          section.fills = [];
        } catch (e) {
        }
        allSections.push(section);
        const row = figma.createFrame();
        row.name = "variants";
        row.layoutMode = "HORIZONTAL";
        row.primaryAxisSizingMode = "AUTO";
        row.counterAxisSizingMode = "AUTO";
        row.primaryAxisAlignItems = "CENTER";
        row.counterAxisAlignItems = "CENTER";
        row.paddingLeft = 24;
        row.paddingRight = 24;
        row.paddingTop = 24;
        row.paddingBottom = 24;
        row.itemSpacing = 16;
        row.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        const seenFps = /* @__PURE__ */ new Set();
        const catVariants = [];
        for (const v of variants) {
          const fp = getVariantFingerprint(v, cat);
          if (!seenFps.has(fp)) {
            seenFps.add(fp);
            catVariants.push(v);
          }
        }
        for (const variant of catVariants) {
          const instance = variant.createInstance();
          row.appendChild(instance);
          const compNodes = [variant, ...variant.findAll(() => true)];
          const allNodes = [instance];
          if ("findAll" in instance) allNodes.push(...instance.findAll(() => true));
          for (let ni = 0; ni < allNodes.length; ni++) {
            const n = allNodes[ni];
            const instBv = (_A = n.boundVariables) != null ? _A : {};
            const compBv = ni < compNodes.length ? (_B = compNodes[ni].boundVariables) != null ? _B : {} : {};
            const bv = __spreadValues(__spreadValues({}, compBv), instBv);
            const anns = [];
            if (cat === "color-fg" && n.type === "TEXT" && ((_D = (_C = bv.fills) == null ? void 0 : _C.length) != null ? _D : 0) > 0)
              anns.push({ labelMarkdown: "Color", properties: [{ type: "fills" }] });
            if (cat === "color-bg" && n.type !== "TEXT" && ((_F = (_E = bv.fills) == null ? void 0 : _E.length) != null ? _F : 0) > 0)
              anns.push({ labelMarkdown: "Background", properties: [{ type: "fills" }] });
            if (cat === "spacing") {
              const sp = [];
              if (bv.paddingTop || bv.paddingBottom || bv.paddingLeft || bv.paddingRight) sp.push({ type: "padding" });
              if (bv.itemSpacing) sp.push({ type: "itemSpacing" });
              if (sp.length) anns.push({ labelMarkdown: "Spacing", properties: sp });
            }
            if (cat === "shape") {
              const sh = [];
              const compN = ni < compNodes.length ? compNodes[ni] : null;
              const hasCornerVar = bv.cornerRadius || bv.topLeftRadius || bv.topRightRadius || bv.bottomLeftRadius || bv.bottomRightRadius;
              const rawCorner = compN ? compN.cornerRadius : void 0;
              const hasCornerRaw = typeof rawCorner === "number" && rawCorner > 0;
              const nodeAcceptsCorner = n.type === "FRAME" || n.type === "RECTANGLE" || n.type === "INSTANCE" || n.type === "COMPONENT" || n.type === "ELLIPSE";
              if ((hasCornerVar || hasCornerRaw) && nodeAcceptsCorner) sh.push({ type: "cornerRadius" });
              const hasStrokesVar = ((_H = (_G = bv.strokes) == null ? void 0 : _G.length) != null ? _H : 0) > 0;
              const compStrokes = compN ? compN.strokes : null;
              const hasStrokesRaw = Array.isArray(compStrokes) && compStrokes.length > 0;
              if (hasStrokesVar || hasStrokesRaw) sh.push({ type: "strokes" });
              if (sh.length) anns.push({ labelMarkdown: "Shape", properties: sh });
            }
            if (cat === "typography" && n.type === "TEXT") {
              const tp = [];
              if (((_J = (_I = bv.fontFamily) == null ? void 0 : _I.length) != null ? _J : 0) > 0) tp.push({ type: "fontFamily" });
              if (((_L = (_K = bv.fontSize) == null ? void 0 : _K.length) != null ? _L : 0) > 0) tp.push({ type: "fontSize" });
              if (((_N = (_M = bv.lineHeight) == null ? void 0 : _M.length) != null ? _N : 0) > 0) tp.push({ type: "lineHeight" });
              if (((_P = (_O = bv.letterSpacing) == null ? void 0 : _O.length) != null ? _P : 0) > 0) tp.push({ type: "letterSpacing" });
              if (tp.length) anns.push({ labelMarkdown: "Typography", properties: tp });
              if (((_R = (_Q = bv.fontStyle) == null ? void 0 : _Q.length) != null ? _R : 0) > 0) {
                const label = (_S = specWeightNames.get(bv.fontStyle[0].id)) != null ? _S : "font-weight";
                anns.push({ labelMarkdown: label, properties: [{ type: "fontWeight" }] });
              }
            }
            if (cat === "sizing" && n === instance)
              anns.push({ labelMarkdown: instance.name.replace(/^\./, ""), properties: [{ type: "width" }, { type: "height" }] });
            if (anns.length > 0) {
              try {
                n.annotations = anns;
              } catch (e) {
              }
            }
          }
        }
        section.appendChild(row);
        row.x = 24;
        row.y = 40;
        section.resizeWithoutConstraints(row.width + 48, row.height + 72);
        yOffset += section.height + 40;
      }
      if (allSections.length > 0) {
        figma.currentPage.selection = allSections;
        figma.viewport.scrollAndZoomIntoView(allSections);
      }
      figma.ui.postMessage({ type: "spec:result", categoryCount: categories.length, variantCount: variants.length });
      break;
    }
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
  }
};
