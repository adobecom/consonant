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
  const sectionNodes = sel.filter((n) => n.type === "SECTION");
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
    variantCount: first.type === "COMPONENT_SET" ? first.children.length : void 0,
    allNodes: sel.map((n) => ({ id: n.id, name: n.name })),
    isSection: sectionNodes.length > 0,
    sectionCount: sectionNodes.length,
    sectionName: sectionNodes.length > 0 ? sectionNodes[0].name : null
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
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
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
    case "notify": {
      figma.notify(msg.message);
      break;
    }
    case "format-section": {
      const sections = figma.currentPage.selection.filter(
        (n) => n.type === "SECTION"
      );
      if (sections.length === 0) {
        figma.notify("Select a section first");
        figma.ui.postMessage({ type: "format-section:done", count: 0 });
        break;
      }
      let formatted = 0;
      for (const section of sections) {
        try {
          section.fills = [];
          formatted++;
        } catch (e) {
        }
      }
      const note = formatted === 1 ? "Section cleared" : `${formatted} sections cleared`;
      figma.notify(note);
      figma.ui.postMessage({ type: "format-section:done", count: formatted });
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
      try {
        let findStyle2 = function(query) {
          const q = query.toLowerCase();
          return allTextStyles.find((s) => s.name.toLowerCase().includes(q));
        }, parseProps2 = function(v) {
          const r = {};
          for (const part of v.name.split(", ")) {
            const eq = part.indexOf("=");
            if (eq > 0) r[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
          }
          return r;
        }, pickVariant2 = function(override) {
          var _a2;
          const target = __spreadValues(__spreadValues({}, defaults), override);
          return (_a2 = variants.find((v) => {
            const p = parseProps2(v);
            return Object.entries(target).every(([k, val]) => p[k] === val);
          })) != null ? _a2 : variants[0];
        }, applyAnnotations2 = function(nodes) {
          var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k2, _l2, _m2;
          for (const n of nodes) {
            const bv = (_a2 = n.boundVariables) != null ? _a2 : {};
            const anns = [];
            if (((_c2 = (_b2 = bv.fills) == null ? void 0 : _b2.length) != null ? _c2 : 0) > 0)
              anns.push({ labelMarkdown: n.type === "TEXT" ? "Color" : "Fill", properties: [{ type: "fills" }] });
            if (((_e2 = (_d2 = bv.strokes) == null ? void 0 : _d2.length) != null ? _e2 : 0) > 0)
              anns.push({ labelMarkdown: "Border", properties: [{ type: "strokes" }] });
            if (((_f2 = bv.cornerRadius) == null ? void 0 : _f2.id) || ((_g2 = bv.topLeftRadius) == null ? void 0 : _g2.id))
              anns.push({ labelMarkdown: "Radius", properties: [{ type: "cornerRadius" }] });
            const sp = [];
            if (bv.paddingTop || bv.paddingBottom || bv.paddingLeft || bv.paddingRight) sp.push({ type: "padding" });
            if (bv.itemSpacing) sp.push({ type: "itemSpacing" });
            if (sp.length) anns.push({ labelMarkdown: "Spacing", properties: sp });
            if (n.type === "TEXT") {
              const tp = [];
              if (((_i2 = (_h2 = bv.fontSize) == null ? void 0 : _h2.length) != null ? _i2 : 0) > 0) tp.push({ type: "fontSize" });
              if (((_k2 = (_j2 = bv.lineHeight) == null ? void 0 : _j2.length) != null ? _k2 : 0) > 0) tp.push({ type: "lineHeight" });
              if (((_m2 = (_l2 = bv.letterSpacing) == null ? void 0 : _l2.length) != null ? _m2 : 0) > 0) tp.push({ type: "letterSpacing" });
              if (tp.length) anns.push({ labelMarkdown: "Typography", properties: tp });
            }
            if (anns.length) {
              try {
                n.annotations = anns;
              } catch (e) {
              }
            }
          }
        }, annotateScope2 = function(inst, scope) {
          var _a2;
          if (scope === "root") {
            const nodes = [inst];
            for (const c of inst.children) {
              nodes.push(c);
              nodes.push(...(_a2 = c.children) != null ? _a2 : []);
            }
            applyAnnotations2(nodes);
          } else {
            const target = inst.findOne((n) => n.name === scope);
            if (!target) return;
            const descendants = "findAll" in target ? target.findAll(() => true) : [];
            applyAnnotations2([target, ...descendants]);
          }
        }, setBorder2 = function(node) {
          node.fills = [];
          node.strokes = borderColorVar ? [figma.variables.setBoundVariableForPaint(
            { type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } },
            "color",
            borderColorVar
          )] : [{ type: "SOLID", color: { r: 0.871, g: 0.871, b: 0.871 } }];
          node.strokeWeight = 1;
          node.cornerRadius = 4;
          if (borderWidthVar) {
            try {
              node.setBoundVariable("strokeWeight", borderWidthVar);
            } catch (e) {
            }
          }
          if (radiusXsVar) {
            try {
              node.setBoundVariable("cornerRadius", radiusXsVar);
            } catch (e) {
            }
          }
        }, bindFill2 = function(node, colorVar) {
          if (colorVar) {
            node.fills = [figma.variables.setBoundVariableForPaint(
              { type: "SOLID", color: { r: 0.067, g: 0.067, b: 0.067 } },
              "color",
              colorVar
            )];
          }
        }, txt2 = function(content, styleQuery, colorVar, x, y, extra = {}) {
          const t = figma.createText();
          t.fontName = { family: "Inter", style: "Regular" };
          t.characters = content;
          if (extra.upper) t.textCase = "UPPER";
          if (extra.ls) t.letterSpacing = { value: extra.ls, unit: "PERCENT" };
          t.textAutoResize = "WIDTH_AND_HEIGHT";
          sec.appendChild(t);
          t.x = x;
          t.y = y;
          styleQueue.push({ node: t, query: styleQuery, colorVar });
          return t;
        }, eyebrow2 = function(label, x, y) {
          return txt2(label, "eyebrow", contentSubtleVar, x, y, { upper: true, ls: 8 });
        };
        var findStyle = findStyle2, parseProps = parseProps2, pickVariant = pickVariant2, applyAnnotations = applyAnnotations2, annotateScope = annotateScope2, setBorder = setBorder2, bindFill = bindFill2, txt = txt2, eyebrow = eyebrow2;
        const setId = msg.setId;
        const opts = (_w = msg.options) != null ? _w : { variants: true, tokens: true, children: true };
        const specSetNode = await figma.getNodeByIdAsync(setId);
        if (!specSetNode || specSetNode.type !== "COMPONENT_SET") {
          figma.ui.postMessage({ type: "spec:result", error: "Select a component set first" });
          break;
        }
        const specSet = specSetNode;
        const variants = specSet.children;
        await Promise.all([
          figma.loadFontAsync({ family: "Inter", style: "Regular" }),
          figma.loadFontAsync({ family: "Inter", style: "Medium" }),
          figma.loadFontAsync({ family: "Inter", style: "Bold" }),
          figma.loadFontAsync({ family: "Adobe Clean", style: "Regular" }).catch(() => {
          }),
          figma.loadFontAsync({ family: "Adobe Clean", style: "Bold" }).catch(() => {
          }),
          figma.loadFontAsync({ family: "Adobe Clean Display", style: "Black" }).catch(() => {
          })
        ]);
        const allTextStyles = await figma.getLocalTextStylesAsync();
        const propDefs = specSet.componentPropertyDefinitions;
        const axes = Object.entries(propDefs).filter(([, d]) => d.type === "VARIANT").map(([name, d]) => ({ name, values: d.variantOptions }));
        const defaults = {};
        for (const ax of axes) defaults[ax.name] = ax.values[0];
        const refVariant = variants[0];
        const refRootFrame = refVariant.children[0];
        const topLevelLayerNames = refRootFrame ? refRootFrame.children.map((c) => c.name) : [];
        const [
          borderColorVar,
          borderWidthVar,
          radiusXsVar,
          contentHeadingVar,
          contentDefaultVar,
          contentSubtleVar
        ] = await Promise.all([
          figma.variables.getVariableByIdAsync("VariableID:6:22"),
          // s2a/color/border/subtle
          figma.variables.getVariableByIdAsync("VariableID:2:111"),
          // s2a/border/width/sm
          figma.variables.getVariableByIdAsync("VariableID:2:97"),
          // s2a/border/radius/xs
          figma.variables.getVariableByIdAsync("VariableID:2483:41398"),
          // s2a/color/content/heading
          figma.variables.getVariableByIdAsync("VariableID:6:82"),
          // s2a/color/content/default
          figma.variables.getVariableByIdAsync("VariableID:6:84")
          // s2a/color/content/subtle
        ]);
        const SEC_PAD = 48;
        const refW = variants[0].width;
        const REF_PAD = Math.max(80, Math.round(refW * 0.5));
        const CARD_PAD = Math.max(28, Math.round(refW * 0.25));
        const CARD_W = Math.max(120, refW + CARD_PAD * 2);
        const CARD_GAP = 20;
        const LBL_GAP = 10;
        const sec = figma.createSection();
        sec.name = "Annotations \u2014 " + specSet.name;
        sec.x = specSet.x + specSet.width + 100;
        sec.y = specSet.y;
        figma.currentPage.appendChild(sec);
        try {
          sec.fills = [];
        } catch (e) {
        }
        const styleQueue = [];
        async function flushStyles() {
          await Promise.all(styleQueue.map(async ({ node, query, colorVar }) => {
            const style = findStyle2(query);
            if (style) {
              try {
                await node.setTextStyleIdAsync(style.id);
              } catch (e) {
              }
            }
            bindFill2(node, colorVar);
          }));
          styleQueue.length = 0;
        }
        let curY = SEC_PAD;
        txt2(specSet.name.toUpperCase() + " \xB7 SPEC", "eyebrow", contentSubtleVar, SEC_PAD, curY, { upper: true, ls: 8 });
        txt2(specSet.name, "heading-lg", contentHeadingVar, SEC_PAD, curY + 18);
        txt2(
          `${variants.length} variant${variants.length !== 1 ? "s" : ""}` + (axes.length ? "  \xB7  " + axes.map((a) => a.name).join("  \xB7  ") : ""),
          "body-md",
          contentSubtleVar,
          SEC_PAD,
          curY + 56
        );
        curY += 96;
        if (opts.variants) {
          const axesToShow = axes.length > 0 ? axes : [{ name: "Variants", values: variants.map((v) => v.name) }];
          for (const ax of axesToShow) {
            eyebrow2(ax.name, SEC_PAD, curY);
            curY += 22;
            let rowMaxH = 0;
            for (let i = 0; i < ax.values.length; i++) {
              const val = ax.values[i];
              const variant = axes.length > 0 ? pickVariant2({ [ax.name]: val }) : (_x = variants.find((v) => v.name === val)) != null ? _x : variants[0];
              const cx = SEC_PAD + i * (CARD_W + CARD_GAP);
              const card = figma.createFrame();
              card.name = "card-" + val;
              card.layoutMode = "VERTICAL";
              card.primaryAxisSizingMode = "AUTO";
              card.counterAxisSizingMode = "AUTO";
              card.primaryAxisAlignItems = "CENTER";
              card.counterAxisAlignItems = "CENTER";
              card.paddingTop = CARD_PAD;
              card.paddingBottom = CARD_PAD;
              card.paddingLeft = CARD_PAD;
              card.paddingRight = CARD_PAD;
              setBorder2(card);
              sec.appendChild(card);
              card.x = cx;
              card.y = curY;
              const inst = variant.createInstance();
              card.appendChild(inst);
              rowMaxH = Math.max(rowMaxH, card.height);
              const lbl = txt2(val, "label", contentDefaultVar, 0, curY + card.height + LBL_GAP);
              lbl.x = cx + Math.round((card.width - lbl.width) / 2);
            }
            curY += rowMaxH + LBL_GAP + 24 + 40;
          }
        }
        if (opts.children) {
          const childMap = /* @__PURE__ */ new Map();
          const allInstances = [];
          for (const v of variants)
            for (const n of [v, ...v.findAll(() => true)])
              if (n.type === "INSTANCE") allInstances.push(n);
          const mains = await Promise.all(
            allInstances.map((inst) => inst.getMainComponentAsync().catch(() => null))
          );
          for (const main of mains) {
            if (((_y = main == null ? void 0 : main.parent) == null ? void 0 : _y.type) === "COMPONENT_SET" && main.parent.id !== specSet.id)
              childMap.set(main.parent.id, main.parent);
          }
          if (childMap.size > 0) {
            eyebrow2("Child components", SEC_PAD, curY);
            curY += 22;
            let childX = SEC_PAD;
            const CHILD_PAD = 20;
            for (const [, cs] of childMap) {
              const csRef = cs.children[0];
              const card = figma.createFrame();
              card.name = "child-" + cs.name;
              card.layoutMode = "VERTICAL";
              card.primaryAxisSizingMode = "AUTO";
              card.counterAxisSizingMode = "AUTO";
              card.primaryAxisAlignItems = "CENTER";
              card.counterAxisAlignItems = "CENTER";
              card.paddingTop = CHILD_PAD;
              card.paddingBottom = CHILD_PAD;
              card.paddingLeft = CHILD_PAD;
              card.paddingRight = CHILD_PAD;
              card.itemSpacing = 12;
              setBorder2(card);
              sec.appendChild(card);
              card.x = childX;
              card.y = curY;
              try {
                const ci = csRef.createInstance();
                card.appendChild(ci);
              } catch (e) {
              }
              const cnLbl = figma.createText();
              cnLbl.fontName = { family: "Inter", style: "Regular" };
              cnLbl.characters = cs.name;
              cnLbl.textAutoResize = "WIDTH_AND_HEIGHT";
              card.appendChild(cnLbl);
              styleQueue.push({ node: cnLbl, query: "label", colorVar: contentDefaultVar });
              childX += card.width + 16;
            }
          }
        }
        await flushStyles();
        let maxR = 0, maxB = 0;
        for (const n of sec.children) {
          const sn = n;
          maxR = Math.max(maxR, sn.x + sn.width);
          maxB = Math.max(maxB, sn.y + sn.height);
        }
        try {
          sec.resizeWithoutConstraints(maxR + SEC_PAD, maxB + SEC_PAD);
        } catch (e) {
        }
        const allCreated = [sec];
        if (opts.tokens) {
          const scopes = [
            { key: "root", label: "Root" },
            ...topLevelLayerNames.map((name) => ({ key: name, label: name }))
          ];
          const REF_SEC_GAP = 200;
          const refSecX = sec.x + sec.width + 120;
          let refSecY = sec.y;
          for (const { key, label } of scopes) {
            const refSec = figma.createSection();
            refSec.name = label;
            figma.currentPage.appendChild(refSec);
            try {
              refSec.fills = [];
            } catch (e) {
            }
            const eb = figma.createText();
            eb.fontName = { family: "Inter", style: "Regular" };
            eb.characters = label.toUpperCase();
            eb.textCase = "UPPER";
            eb.letterSpacing = { value: 8, unit: "PERCENT" };
            eb.textAutoResize = "WIDTH_AND_HEIGHT";
            refSec.appendChild(eb);
            eb.x = SEC_PAD;
            eb.y = SEC_PAD;
            styleQueue.push({ node: eb, query: "eyebrow", colorVar: contentSubtleVar });
            const panelY = SEC_PAD + 22 + 12;
            const panel = figma.createFrame();
            panel.name = "panel";
            panel.layoutMode = "VERTICAL";
            panel.primaryAxisSizingMode = "AUTO";
            panel.counterAxisSizingMode = "AUTO";
            panel.primaryAxisAlignItems = "CENTER";
            panel.counterAxisAlignItems = "CENTER";
            panel.paddingTop = REF_PAD;
            panel.paddingBottom = REF_PAD;
            panel.paddingLeft = REF_PAD;
            panel.paddingRight = REF_PAD;
            setBorder2(panel);
            refSec.appendChild(panel);
            panel.x = SEC_PAD;
            panel.y = panelY;
            const inst = refVariant.createInstance();
            panel.appendChild(inst);
            annotateScope2(inst, key);
            await flushStyles();
            const secW = Math.max(panel.width, eb.width) + SEC_PAD * 2;
            const secH = panelY + panel.height + SEC_PAD;
            try {
              refSec.resizeWithoutConstraints(secW, secH);
            } catch (e) {
            }
            refSec.x = refSecX;
            refSec.y = refSecY;
            refSecY += secH + REF_SEC_GAP;
            allCreated.push(refSec);
          }
        }
        figma.currentPage.selection = allCreated;
        figma.viewport.scrollAndZoomIntoView(allCreated);
        figma.ui.postMessage({ type: "spec:result", variantCount: variants.length });
      } catch (e) {
        figma.ui.postMessage({ type: "spec:result", error: e.message || String(e) });
      }
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
