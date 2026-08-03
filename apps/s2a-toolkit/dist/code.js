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
function tokenGroup(name) {
  var _a;
  const parts = name.split("/").filter((p) => p !== "s2a");
  if (parts.length >= 4 && parts[1] === "transparent") return parts[0] + " / " + parts[1] + " / " + parts[2];
  if (parts.length >= 3) return parts[0] + " / " + parts[1];
  return (_a = parts[0]) != null ? _a : name;
}
function fmtTokenValue(val) {
  if (val === null || val === void 0) return "\u2014";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") return val;
  if (typeof val === "boolean") return String(val);
  if (typeof val === "object" && "r" in val) {
    const c = val;
    const h = (n) => Math.round(n * 255).toString(16).padStart(2, "0");
    if (c.a !== void 0 && Math.abs(c.a - 1) > 4e-3) {
      return "rgba(" + Math.round(c.r * 255) + ", " + Math.round(c.g * 255) + ", " + Math.round(c.b * 255) + ", " + Math.round(c.a * 100) / 100 + ")";
    }
    return "#" + h(c.r) + h(c.g) + h(c.b);
  }
  return JSON.stringify(val);
}
var DARK_VAR = {
  bgKnockout: "VariableID:6:18",
  bgSubtle: "VariableID:6:47",
  borderSubtle: "VariableID:6:22",
  cBodySubtle: "VariableID:2483:41396",
  cSubheading: "VariableID:2483:41397",
  cKnockout: "VariableID:6:81",
  collectionId: "VariableCollectionId:6:17"
};
function bfv(node, v) {
  const f = node.fills;
  if (!f || f === figma.mixed || !f.length) return;
  const ps = [...f];
  ps[0] = figma.variables.setBoundVariableForPaint(ps[0], "color", v);
  node.fills = ps;
}
async function applyDarkStyle(sec, opts = {}) {
  const rebind = opts.rebindText !== false;
  const [vBg, , vBorder, vBody, vSub, vKo] = await Promise.all([
    figma.variables.getVariableByIdAsync(DARK_VAR.bgKnockout),
    figma.variables.getVariableByIdAsync(DARK_VAR.bgSubtle),
    figma.variables.getVariableByIdAsync(DARK_VAR.borderSubtle),
    figma.variables.getVariableByIdAsync(DARK_VAR.cBodySubtle),
    figma.variables.getVariableByIdAsync(DARK_VAR.cSubheading),
    figma.variables.getVariableByIdAsync(DARK_VAR.cKnockout)
  ]);
  const colls = await figma.variables.getLocalVariableCollectionsAsync();
  const coll = colls.find((c) => c.id === DARK_VAR.collectionId);
  const darkId = coll.modes.find((m) => m.name === "Dark").modeId;
  let bg = sec.children.find(
    (c) => c.type === "RECTANGLE" && c.x === 0 && c.y === 0 && c.height > 10
  );
  if (!bg) {
    bg = figma.createRectangle();
    bg.x = 0;
    bg.y = 0;
    sec.insertChild(0, bg);
  }
  bg.resize(sec.width, sec.height);
  bg.fills = [{ type: "SOLID", color: { r: 0.04, g: 0.04, b: 0.047 } }];
  if (vBg) bfv(bg, vBg);
  let frame = sec.children.find((c) => c.name === ".content" && c.type === "FRAME");
  if (!frame) {
    frame = figma.createFrame();
    frame.name = ".content";
    frame.fills = [];
    frame.clipsContent = false;
    frame.layoutMode = "NONE";
    sec.appendChild(frame);
    const others = [...sec.children].filter((c) => c !== bg && c !== frame);
    for (const n of others) frame.appendChild(n);
  }
  frame.resize(sec.width, sec.height);
  frame.setExplicitVariableModeForCollection(coll, darkId);
  if (!rebind) return;
  for (const child of [...frame.children]) {
    if (child.type === "RECTANGLE") {
      const r = child;
      if (r.height <= 2 && vBorder) bfv(r, vBorder);
    } else if (child.type === "TEXT") {
      const t = child;
      const sz = typeof t.fontSize === "number" ? t.fontSize : 18;
      const st = typeof t.fontName === "object" && t.fontName !== figma.mixed ? (t.fontName.style || "").toLowerCase() : "";
      const bold = st.includes("bold") || st.includes("black");
      const v = sz >= 40 ? vKo : bold && sz >= 16 ? vSub : vBody;
      if (v) bfv(t, v);
    }
  }
}
async function handleBridgeMethod(method, params) {
  switch (method) {
    case "EXECUTE_CODE": {
      const code = params.code;
      if (typeof code !== "string") throw new Error("EXECUTE_CODE: params.code must be a string");
      if (code.length > 65536) throw new Error("EXECUTE_CODE: code exceeds 64KB limit");
      const timeout = Math.min(params.timeout || 5e3, 6e4);
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
    setId: first.type === "COMPONENT_SET" || first.type === "COMPONENT" ? first.id : null,
    nodeId: first.id,
    nodeName: first.name,
    nodeType: first.type,
    fileKey: figma.fileKey || null,
    fileName: figma.root.name,
    width: "width" in first ? Math.round(first.width) : void 0,
    height: "height" in first ? Math.round(first.height) : void 0,
    variantCount: first.type === "COMPONENT_SET" ? first.children.length : first.type === "COMPONENT" ? 1 : void 0,
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
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R;
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
    case "get-figma-token": {
      try {
        const token = await figma.clientStorage.getAsync("figma-api-token");
        figma.ui.postMessage({ type: "figma-token-loaded", token: token != null ? token : "" });
      } catch (e) {
        figma.ui.postMessage({ type: "figma-token-loaded", token: "" });
      }
      break;
    }
    case "save-figma-token": {
      try {
        await figma.clientStorage.setAsync("figma-api-token", msg.token);
        figma.ui.postMessage({ type: "figma-token-saved", success: true });
      } catch (e) {
        figma.ui.postMessage({ type: "figma-token-saved", success: false, error: e.message || String(e) });
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
      let styled = 0;
      for (const section of sections) {
        try {
          await applyDarkStyle(section);
          styled++;
        } catch (e) {
        }
      }
      const note = styled === 1 ? "Section styled" : `${styled} sections styled`;
      figma.notify(note);
      figma.ui.postMessage({ type: "format-section:done", count: styled });
      break;
    }
    case "resize-for-view": {
      const w = msg.width || 320;
      const h = msg.height || 480;
      figma.ui.resize(w, h);
      break;
    }
    case "annotate:apply": {
      let bvLabel2 = function(bv, key) {
        var _a2, _b2;
        const val = bv[key];
        if (!val) return "";
        const id = Array.isArray(val) ? ((_a2 = val.find((v) => v == null ? void 0 : v.id)) != null ? _a2 : {}).id : val == null ? void 0 : val.id;
        return id ? (_b2 = varNames.get(id)) != null ? _b2 : "" : "";
      };
      var bvLabel = bvLabel2;
      const categories = new Set((_a = msg.categories) != null ? _a : []);
      const selection = figma.currentPage.selection;
      if (!selection.length) {
        figma.ui.postMessage({ type: "annotate:result", error: "No selection" });
        break;
      }
      const rootSet = new Set(selection);
      const allNodes = [];
      for (const sel of selection) {
        allNodes.push(sel);
        if ("findAll" in sel) allNodes.push(...sel.findAll(() => true));
      }
      const varIdSet = /* @__PURE__ */ new Set();
      for (const n of allNodes) {
        const bv = (_b = n.boundVariables) != null ? _b : {};
        for (const key of Object.keys(bv)) {
          const val = bv[key];
          if (!val) continue;
          if (Array.isArray(val)) val.forEach((v) => {
            if (v == null ? void 0 : v.id) varIdSet.add(v.id);
          });
          else if (val == null ? void 0 : val.id) varIdSet.add(val.id);
        }
      }
      const varNames = /* @__PURE__ */ new Map();
      await Promise.all([...varIdSet].map(async (id) => {
        try {
          const v = await figma.variables.getVariableByIdAsync(id);
          if (v) varNames.set(id, "--" + v.name.replace(/\//g, "-"));
        } catch (e) {
        }
      }));
      let annotated = 0;
      for (const n of allNodes) {
        const bv = (_c = n.boundVariables) != null ? _c : {};
        const anns = [];
        const pdVar = (_e = (_d = n.getPluginData) == null ? void 0 : _d.call(n, "s2aTokenVar")) != null ? _e : "";
        const pdProp = (_g = (_f = n.getPluginData) == null ? void 0 : _f.call(n, "s2aTokenProp")) != null ? _g : "";
        if (categories.has("color-fg") && n.type === "TEXT") {
          if (((_i = (_h = bv.fills) == null ? void 0 : _h.length) != null ? _i : 0) > 0) {
            anns.push({ label: bvLabel2(bv, "fills") || "color-fg", properties: [{ type: "fills" }] });
          } else if (pdVar && pdProp === "fills") {
            anns.push({ label: pdVar, properties: [{ type: "fills" }] });
          }
        }
        if (categories.has("color-bg") && n.type !== "TEXT") {
          if (((_k = (_j = bv.fills) == null ? void 0 : _j.length) != null ? _k : 0) > 0) {
            anns.push({ label: bvLabel2(bv, "fills") || "color-bg", properties: [{ type: "fills" }] });
          } else if (pdVar && pdProp === "fills") {
            anns.push({ label: pdVar, properties: [{ type: "fills" }] });
          }
        }
        if (categories.has("spacing")) {
          const padKeys = ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"];
          const boundPad = padKeys.filter((k) => bv[k]);
          if (boundPad.length) {
            const lbl = bvLabel2(bv, boundPad[0]);
            anns.push({ label: lbl || "padding", properties: [{ type: "padding" }] });
          }
          if (bv.itemSpacing) {
            const lbl = bvLabel2(bv, "itemSpacing");
            anns.push({ label: lbl || "gap", properties: [{ type: "itemSpacing" }] });
          }
          if (pdVar && pdProp === "spacing") {
            anns.push({ label: pdVar, properties: [{ type: "width" }] });
          }
        }
        if (categories.has("shape")) {
          const radiusKey = ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius", "cornerRadius"].find((k) => bv[k]);
          if (radiusKey) {
            anns.push({ label: bvLabel2(bv, radiusKey) || "border-radius", properties: [{ type: "cornerRadius" }] });
          } else if (pdVar && pdProp === "cornerRadius") {
            anns.push({ label: pdVar, properties: [{ type: "cornerRadius" }] });
          }
          if (bv.strokeWeight) {
            anns.push({ label: bvLabel2(bv, "strokeWeight") || "border-width", properties: [{ type: "strokeWeight" }] });
          } else if (pdVar && pdProp === "strokeWeight") {
            anns.push({ label: pdVar, properties: [{ type: "strokeWeight" }] });
          }
        }
        if (categories.has("typography") && n.type === "TEXT") {
          const tp = [];
          if (((_m = (_l = bv.fontFamily) == null ? void 0 : _l.length) != null ? _m : 0) > 0) tp.push({ type: "fontFamily" });
          if (((_o = (_n = bv.fontSize) == null ? void 0 : _n.length) != null ? _o : 0) > 0) tp.push({ type: "fontSize" });
          if (((_q = (_p = bv.lineHeight) == null ? void 0 : _p.length) != null ? _q : 0) > 0) tp.push({ type: "lineHeight" });
          if (((_s = (_r = bv.letterSpacing) == null ? void 0 : _r.length) != null ? _s : 0) > 0) tp.push({ type: "letterSpacing" });
          if (tp.length) {
            const lbl = bvLabel2(bv, "fontSize") || bvLabel2(bv, "fontFamily") || "typography";
            anns.push({ label: lbl, properties: tp });
          }
          if (((_u = (_t = bv.fontStyle) == null ? void 0 : _t.length) != null ? _u : 0) > 0) {
            const lbl = bvLabel2(bv, "fontStyle");
            anns.push({ label: lbl || "font-weight", properties: [{ type: "fontWeight" }] });
          }
        }
        if (categories.has("blur")) {
          const isBlurNode = pdProp === "blur" || pdProp === "width" && n.name === ".blur-swatch";
          if (pdVar && isBlurNode) {
            anns.push({ label: pdVar, properties: [] });
          }
        }
        if (categories.has("opacity")) {
          const isOpacityNode = pdProp === "opacity" || n.name === ".opacity-swatch";
          if (pdVar && isOpacityNode) {
            anns.push({ label: pdVar, properties: [] });
          }
        }
        if (categories.has("sizing") && rootSet.has(n) && ["INSTANCE", "COMPONENT", "COMPONENT_SET"].includes(n.type))
          anns.push({ label: n.name.replace(/^\./, ""), properties: [{ type: "width" }, { type: "height" }] });
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
      const clearSel = figma.currentPage.selection;
      const all = [];
      for (const sel of clearSel) {
        all.push(sel);
        if ("findAll" in sel) all.push(...sel.findAll(() => true));
      }
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
      break;
    }
    case "token-docs:generate": {
      const collectionId = msg.collectionId;
      const group = msg.group;
      try {
        let hTxt2 = function(chars, family, style, size, v, fixedW) {
          const n = figma.createText();
          n.fontName = { family, style };
          n.fontSize = size;
          n.characters = chars;
          n.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
          if (fixedW) n.resize(fixedW, n.height);
          n.textAutoResize = "HEIGHT";
          frame.appendChild(n);
          if (!fixedW) n.layoutSizingHorizontal = "FILL";
          if (v) bfv(n, v);
          return n;
        }, hSpacer2 = function(h) {
          const sp = figma.createFrame();
          sp.fills = [];
          sp.resize(W - M * 2, h);
          sp.primaryAxisSizingMode = "FIXED";
          frame.appendChild(sp);
          sp.layoutSizingHorizontal = "FILL";
        }, hDiv2 = function() {
          const r = figma.createRectangle();
          r.resize(W - M * 2, 1);
          r.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }];
          frame.appendChild(r);
          r.layoutSizingHorizontal = "FILL";
          if (vBorder2) bfv(r, vBorder2);
        }, bindStroke2 = function(node, v) {
          var _a2;
          const ss = [...(_a2 = node.strokes) != null ? _a2 : []];
          if (!ss.length) return;
          ss[0] = figma.variables.setBoundVariableForPaint(ss[0], "color", v);
          node.strokes = ss;
        };
        var hTxt = hTxt2, hSpacer = hSpacer2, hDiv = hDiv2, bindStroke = bindStroke2;
        if (collectionId === "text-styles") {
          const tsAllColls = await figma.variables.getLocalVariableCollectionsAsync();
          const responsiveColl = tsAllColls.find((c) => /Responsive/.test(c.name));
          if (!responsiveColl) throw new Error("Responsive variable collection not found");
          const MODE_ORDER_TS = ["sm", "md", "lg", "xl"];
          const tsSortedModes = [...responsiveColl.modes].sort(
            (a, b) => MODE_ORDER_TS.indexOf(a.name.toLowerCase()) - MODE_ORDER_TS.indexOf(b.name.toLowerCase())
          );
          const tsAllVars = await figma.variables.getLocalVariablesAsync();
          const allTypoVars = tsAllVars.filter(
            (v) => v.variableCollectionId === responsiveColl.id && v.name.toLowerCase().includes("/typography/")
          );
          const resolveVarMode = async (v, modeId) => {
            let cur = v.valuesByMode[modeId];
            for (let depth = 0; depth < 3; depth++) {
              if (typeof cur === "number") return cur;
              if (cur && typeof cur === "object" && cur.type === "VARIABLE_ALIAS") {
                try {
                  const ref = await figma.variables.getVariableByIdAsync(cur.id);
                  if (!ref) break;
                  cur = ref.valuesByMode[Object.keys(ref.valuesByMode)[0]];
                } catch (e) {
                  break;
                }
              } else {
                break;
              }
            }
            return typeof cur === "number" ? cur : null;
          };
          const tsTextStyles = await figma.getLocalTextStylesAsync();
          const TS_STYLE_ORDER = [
            "super",
            "heading-1",
            "heading-2",
            "heading-3",
            "heading-4",
            "heading-5",
            "heading-6",
            "body-lg",
            "body-md",
            "body-sm",
            "body-xs",
            "eyebrow",
            "label",
            "caption"
          ];
          const typoStyles = tsTextStyles.filter((s) => s.name.startsWith("s2a/typography/")).sort((a, b) => {
            const an = a.name.replace("s2a/typography/", "");
            const bn = b.name.replace("s2a/typography/", "");
            const ai = TS_STYLE_ORDER.indexOf(an);
            const bi = TS_STYLE_ORDER.indexOf(bn);
            if (ai !== -1 && bi !== -1) return ai - bi;
            if (ai !== -1) return -1;
            if (bi !== -1) return 1;
            return a.name.localeCompare(b.name);
          });
          if (typoStyles.length === 0) throw new Error("No s2a/typography/* text styles found in this file");
          await Promise.all([
            figma.loadFontAsync({ family: "Adobe Clean Display", style: "Bold" }),
            figma.loadFontAsync({ family: "Adobe Clean Display", style: "Black" }).catch(() => {
            }),
            figma.loadFontAsync({ family: "Adobe Clean", style: "Bold" }),
            figma.loadFontAsync({ family: "Adobe Clean", style: "Regular" }),
            figma.loadFontAsync({ family: "Adobe Clean", style: "ExtraBold" }).catch(() => {
            })
          ]);
          const themeColl2 = tsAllColls.find((c) => c.id === DARK_VAR.collectionId);
          const tsDarkId = themeColl2.modes.find((m) => m.name === "Dark").modeId;
          const [tsVBg, tsVBorder, tsVBody, tsVSub, tsVKo] = await Promise.all([
            figma.variables.getVariableByIdAsync(DARK_VAR.bgKnockout),
            figma.variables.getVariableByIdAsync(DARK_VAR.borderSubtle),
            figma.variables.getVariableByIdAsync(DARK_VAR.cBodySubtle),
            figma.variables.getVariableByIdAsync(DARK_VAR.cSubheading),
            figma.variables.getVariableByIdAsync(DARK_VAR.cKnockout)
          ]);
          const tsPage = figma.currentPage;
          const tsSections = tsPage.children.filter((n) => n.type === "SECTION");
          const tsLastSec = tsSections.reduce(
            (a, b) => !a || b.y + b.height > a.y + a.height ? b : a,
            null
          );
          let tsPlaceY = tsLastSec ? tsLastSec.y + tsLastSec.height + 80 : 0;
          const tsPlaceX = (_w = tsLastSec == null ? void 0 : tsLastSec.x) != null ? _w : 0;
          const TS_W = 2400, TS_M = 120;
          const createdSections = [];
          for (const mode of tsSortedModes) {
            const sec2 = figma.createSection();
            sec2.name = `typography \u2014 ${mode.name}`;
            sec2.x = tsPlaceX;
            sec2.y = tsPlaceY;
            sec2.resizeWithoutConstraints(TS_W, 800);
            const bgRect2 = figma.createRectangle();
            bgRect2.resize(TS_W, 800);
            bgRect2.x = 0;
            bgRect2.y = 0;
            bgRect2.fills = [{ type: "SOLID", color: { r: 0.04, g: 0.04, b: 0.047 } }];
            sec2.appendChild(bgRect2);
            if (tsVBg) bfv(bgRect2, tsVBg);
            const frame2 = figma.createFrame();
            frame2.name = ".content";
            frame2.fills = [];
            frame2.clipsContent = false;
            frame2.layoutMode = "VERTICAL";
            frame2.resize(TS_W, 800);
            frame2.primaryAxisSizingMode = "AUTO";
            frame2.counterAxisSizingMode = "FIXED";
            frame2.paddingTop = 160;
            frame2.paddingBottom = 120;
            frame2.paddingLeft = TS_M;
            frame2.paddingRight = TS_M;
            frame2.itemSpacing = 0;
            frame2.counterAxisAlignItems = "MIN";
            frame2.x = 0;
            frame2.y = 0;
            sec2.appendChild(frame2);
            frame2.setExplicitVariableModeForCollection(themeColl2, tsDarkId);
            try {
              frame2.setExplicitVariableModeForCollection(responsiveColl, mode.modeId);
            } catch (e) {
            }
            const hT = (chars, family, style, size, v) => {
              const n = figma.createText();
              n.fontName = { family, style };
              n.fontSize = size;
              n.characters = chars;
              n.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
              n.textAutoResize = "HEIGHT";
              frame2.appendChild(n);
              n.layoutSizingHorizontal = "FILL";
              if (v) bfv(n, v);
              return n;
            };
            const hSp = (h) => {
              const sp = figma.createFrame();
              sp.fills = [];
              sp.resize(TS_W - TS_M * 2, h);
              sp.primaryAxisSizingMode = "FIXED";
              frame2.appendChild(sp);
              sp.layoutSizingHorizontal = "FILL";
            };
            const hDv = () => {
              const r = figma.createRectangle();
              r.resize(TS_W - TS_M * 2, 1);
              r.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }];
              frame2.appendChild(r);
              r.layoutSizingHorizontal = "FILL";
              if (tsVBorder) bfv(r, tsVBorder);
            };
            hT(`typography \u2014 ${mode.name}`, "Adobe Clean Display", "Bold", 56, tsVKo);
            hSp(24);
            hT(`S2A Responsive \xB7 ${mode.name.toUpperCase()} breakpoint`, "Adobe Clean", "Regular", 20, tsVBody);
            hSp(24);
            hT("May 2026  \xB7  @matt", "Adobe Clean", "Regular", 14, tsVBody);
            hSp(80);
            hDv();
            hSp(56);
            for (const ts of typoStyles) {
              const styleName = ts.name.replace("s2a/typography/", "");
              const fsVar = (_x = allTypoVars.find((v) => v.name === `s2a/typography/font-size/${styleName}`)) != null ? _x : null;
              const lhVar = (_y = allTypoVars.find((v) => v.name === `s2a/typography/line-height/${styleName}`)) != null ? _y : null;
              const lsVar = (_z = allTypoVars.find((v) => v.name === `s2a/typography/letter-spacing/${styleName}`)) != null ? _z : null;
              const isDisplayStyle = ["super", "heading-1", "heading-2"].includes(styleName);
              const isSmallStyle = ["eyebrow", "label", "caption"].includes(styleName);
              const sampleText = isDisplayStyle ? "Make anything." : isSmallStyle ? "Everything you need to make anything you want." : "Everything you need to make anything.";
              hT(styleName, "Adobe Clean", "Bold", 11, tsVSub);
              hSp(8);
              const textNode = figma.createText();
              textNode.fontName = { family: "Adobe Clean", style: "Regular" };
              textNode.fontSize = 16;
              textNode.characters = sampleText;
              frame2.appendChild(textNode);
              textNode.layoutSizingHorizontal = "FILL";
              textNode.textAutoResize = "HEIGHT";
              try {
                await textNode.setTextStyleIdAsync(ts.id);
              } catch (e) {
              }
              if (fsVar) try {
                textNode.setBoundVariable("fontSize", fsVar);
              } catch (e) {
              }
              if (lhVar) try {
                textNode.setBoundVariable("lineHeight", lhVar);
              } catch (e) {
              }
              if (lsVar) try {
                textNode.setBoundVariable("letterSpacing", lsVar);
              } catch (e) {
              }
              if (tsVKo) bfv(textNode, tsVKo);
              const fs = fsVar ? await resolveVarMode(fsVar, mode.modeId) : null;
              const lh = lhVar ? await resolveVarMode(lhVar, mode.modeId) : null;
              const ls = lsVar ? await resolveVarMode(lsVar, mode.modeId) : null;
              hSp(8);
              const fmtPx = (n) => n !== null ? n + "px" : "\u2014";
              const fmtLs = (n) => n === null ? "\u2014" : n === 0 ? "0" : n.toFixed(2) + "px";
              const vNode = figma.createText();
              vNode.fontName = { family: "Adobe Clean", style: "Regular" };
              vNode.fontSize = 13;
              vNode.characters = `font-size ${fmtPx(fs)}  \xB7  line-height ${fmtPx(lh)}  \xB7  letter-spacing ${fmtLs(ls)}`;
              frame2.appendChild(vNode);
              vNode.layoutSizingHorizontal = "FILL";
              vNode.textAutoResize = "HEIGHT";
              if (tsVBody) bfv(vNode, tsVBody);
              hSp(32);
              hDv();
              hSp(32);
            }
            const finalH2 = frame2.height;
            sec2.resizeWithoutConstraints(TS_W, finalH2);
            bgRect2.resize(TS_W, finalH2);
            tsPlaceY += finalH2 + 80;
            createdSections.push(sec2);
          }
          if (createdSections.length > 0) figma.viewport.scrollAndZoomIntoView(createdSections);
          figma.notify(`${createdSections.length} typography breakpoint sections generated`);
          figma.ui.postMessage({ type: "token-docs:result", sectionId: (_B = (_A = createdSections[0]) == null ? void 0 : _A.id) != null ? _B : "", count: createdSections.length });
          break;
        }
        if (group.toLowerCase().includes("section-padding")) {
          const spAllColls = await figma.variables.getLocalVariableCollectionsAsync();
          const spColl = spAllColls.find((c) => c.id === collectionId);
          if (!spColl) throw new Error("Collection not found: " + collectionId);
          const MODE_ORDER_SP = ["sm", "md", "lg", "xl"];
          const spSortedModes = [...spColl.modes].sort(
            (a, b) => MODE_ORDER_SP.indexOf(a.name.toLowerCase()) - MODE_ORDER_SP.indexOf(b.name.toLowerCase())
          );
          const spAllVars = await figma.variables.getLocalVariablesAsync();
          const spVars = spAllVars.filter(
            (v) => v.variableCollectionId === collectionId && v.name.toLowerCase().includes("section-padding")
          );
          if (spVars.length === 0) throw new Error("No section-padding variables found in collection");
          const SP_SIZE_ORDER = ["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"];
          const sortedSpVars = [...spVars].sort((a, b) => {
            var _a2, _b2;
            const an = (_a2 = a.name.split("/").pop()) != null ? _a2 : "";
            const bn = (_b2 = b.name.split("/").pop()) != null ? _b2 : "";
            const ai = SP_SIZE_ORDER.indexOf(an);
            const bi = SP_SIZE_ORDER.indexOf(bn);
            if (ai !== -1 && bi !== -1) return ai - bi;
            if (ai !== -1) return -1;
            if (bi !== -1) return 1;
            return a.name.localeCompare(b.name);
          });
          const resolveSpMode = async (v, modeId) => {
            let cur = v.valuesByMode[modeId];
            for (let depth = 0; depth < 3; depth++) {
              if (typeof cur === "number") return cur;
              if (cur && typeof cur === "object" && cur.type === "VARIABLE_ALIAS") {
                try {
                  const ref = await figma.variables.getVariableByIdAsync(cur.id);
                  if (!ref) break;
                  cur = ref.valuesByMode[Object.keys(ref.valuesByMode)[0]];
                } catch (e) {
                  break;
                }
              } else {
                break;
              }
            }
            return typeof cur === "number" ? cur : null;
          };
          await Promise.all([
            figma.loadFontAsync({ family: "Adobe Clean Display", style: "Bold" }),
            figma.loadFontAsync({ family: "Adobe Clean", style: "Bold" }),
            figma.loadFontAsync({ family: "Adobe Clean", style: "Regular" })
          ]);
          const spThemeColl = spAllColls.find((c) => c.id === DARK_VAR.collectionId);
          const spDarkId = spThemeColl.modes.find((m) => m.name === "Dark").modeId;
          const [spVBg, spVBorder, spVBody, spVSub, spVKo, spVBgSub] = await Promise.all([
            figma.variables.getVariableByIdAsync(DARK_VAR.bgKnockout),
            figma.variables.getVariableByIdAsync(DARK_VAR.borderSubtle),
            figma.variables.getVariableByIdAsync(DARK_VAR.cBodySubtle),
            figma.variables.getVariableByIdAsync(DARK_VAR.cSubheading),
            figma.variables.getVariableByIdAsync(DARK_VAR.cKnockout),
            figma.variables.getVariableByIdAsync(DARK_VAR.bgSubtle)
          ]);
          const spPage = figma.currentPage;
          const spSections = spPage.children.filter((n) => n.type === "SECTION");
          const spLastSec = spSections.reduce(
            (a, b) => !a || b.y + b.height > a.y + a.height ? b : a,
            null
          );
          let spPlaceY = spLastSec ? spLastSec.y + spLastSec.height + 80 : 0;
          const spPlaceX = (_C = spLastSec == null ? void 0 : spLastSec.x) != null ? _C : 0;
          const SP_W = 2400, SP_M = 120;
          const spCreated = [];
          for (const mode of spSortedModes) {
            const sec2 = figma.createSection();
            sec2.name = `viewport / section-padding \u2014 ${mode.name}`;
            sec2.x = spPlaceX;
            sec2.y = spPlaceY;
            sec2.resizeWithoutConstraints(SP_W, 800);
            const bgRect2 = figma.createRectangle();
            bgRect2.resize(SP_W, 800);
            bgRect2.x = 0;
            bgRect2.y = 0;
            bgRect2.fills = [{ type: "SOLID", color: { r: 0.04, g: 0.04, b: 0.047 } }];
            sec2.appendChild(bgRect2);
            if (spVBg) bfv(bgRect2, spVBg);
            const frame2 = figma.createFrame();
            frame2.name = ".content";
            frame2.fills = [];
            frame2.clipsContent = false;
            frame2.layoutMode = "VERTICAL";
            frame2.resize(SP_W, 800);
            frame2.primaryAxisSizingMode = "AUTO";
            frame2.counterAxisSizingMode = "FIXED";
            frame2.paddingTop = 160;
            frame2.paddingBottom = 120;
            frame2.paddingLeft = SP_M;
            frame2.paddingRight = SP_M;
            frame2.itemSpacing = 0;
            frame2.counterAxisAlignItems = "MIN";
            frame2.x = 0;
            frame2.y = 0;
            sec2.appendChild(frame2);
            frame2.setExplicitVariableModeForCollection(spThemeColl, spDarkId);
            try {
              frame2.setExplicitVariableModeForCollection(spColl, mode.modeId);
            } catch (e) {
            }
            const spHT = (chars, family, style, size, v) => {
              const n = figma.createText();
              n.fontName = { family, style };
              n.fontSize = size;
              n.characters = chars;
              n.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
              n.textAutoResize = "HEIGHT";
              frame2.appendChild(n);
              n.layoutSizingHorizontal = "FILL";
              if (v) bfv(n, v);
              return n;
            };
            const spHSp = (h) => {
              const sp = figma.createFrame();
              sp.fills = [];
              sp.resize(SP_W - SP_M * 2, h);
              sp.primaryAxisSizingMode = "FIXED";
              frame2.appendChild(sp);
              sp.layoutSizingHorizontal = "FILL";
            };
            const spHDv = () => {
              const r = figma.createRectangle();
              r.resize(SP_W - SP_M * 2, 1);
              r.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }];
              frame2.appendChild(r);
              r.layoutSizingHorizontal = "FILL";
              if (spVBorder) bfv(r, spVBorder);
            };
            spHT(`viewport / section-padding \u2014 ${mode.name}`, "Adobe Clean Display", "Bold", 56, spVKo);
            spHSp(24);
            spHT(`S2A Responsive \xB7 ${mode.name.toUpperCase()} breakpoint`, "Adobe Clean", "Regular", 20, spVBody);
            spHSp(24);
            spHT("May 2026  \xB7  @matt", "Adobe Clean", "Regular", 14, spVBody);
            spHSp(80);
            spHDv();
            spHSp(56);
            for (const sv of sortedSpVars) {
              const sizeName = (_D = sv.name.split("/").pop()) != null ? _D : sv.name;
              const cssVar = "--" + sv.name.replace(/^s2a\//, "s2a-").replace(/\//g, "-");
              const resolvedPx = await resolveSpMode(sv, mode.modeId);
              const fmtPx = (n) => n !== null ? n + "px" : "\u2014";
              const rowFrame = figma.createFrame();
              rowFrame.name = sizeName;
              rowFrame.fills = [];
              rowFrame.layoutMode = "HORIZONTAL";
              rowFrame.primaryAxisSizingMode = "FIXED";
              rowFrame.counterAxisSizingMode = "AUTO";
              rowFrame.counterAxisAlignItems = "CENTER";
              rowFrame.itemSpacing = 32;
              rowFrame.resize(SP_W - SP_M * 2, 40);
              frame2.appendChild(rowFrame);
              rowFrame.layoutSizingHorizontal = "FILL";
              const infoCol = figma.createFrame();
              infoCol.name = "info";
              infoCol.fills = [];
              infoCol.layoutMode = "VERTICAL";
              infoCol.primaryAxisSizingMode = "AUTO";
              infoCol.counterAxisSizingMode = "AUTO";
              infoCol.itemSpacing = 4;
              rowFrame.appendChild(infoCol);
              infoCol.layoutSizingHorizontal = "FILL";
              const nameNode = figma.createText();
              nameNode.fontName = { family: "Adobe Clean", style: "Bold" };
              nameNode.fontSize = 14;
              nameNode.characters = sizeName;
              nameNode.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
              nameNode.textAutoResize = "WIDTH_AND_HEIGHT";
              infoCol.appendChild(nameNode);
              if (spVKo) bfv(nameNode, spVKo);
              const metaNode = figma.createText();
              metaNode.fontName = { family: "Adobe Clean", style: "Regular" };
              metaNode.fontSize = 12;
              metaNode.characters = `${cssVar}  \xB7  ${fmtPx(resolvedPx)}`;
              metaNode.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
              metaNode.textAutoResize = "WIDTH_AND_HEIGHT";
              infoCol.appendChild(metaNode);
              if (spVBody) bfv(metaNode, spVBody);
              const swatchCol = figma.createFrame();
              swatchCol.name = "swatch";
              swatchCol.fills = [];
              swatchCol.layoutMode = "HORIZONTAL";
              swatchCol.primaryAxisSizingMode = "AUTO";
              swatchCol.counterAxisSizingMode = "AUTO";
              swatchCol.counterAxisAlignItems = "CENTER";
              rowFrame.appendChild(swatchCol);
              const swSizePx = resolvedPx !== null && resolvedPx > 0 ? Math.min(resolvedPx, 120) : null;
              const swDisplay = swSizePx != null ? swSizePx : 4;
              const sw = figma.createRectangle();
              sw.resize(swDisplay, swDisplay);
              sw.cornerRadius = 4;
              sw.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.35 } }];
              swatchCol.appendChild(sw);
              if (spVBgSub) bfv(sw, spVBgSub);
              if (swSizePx !== null) {
                try {
                  sw.setBoundVariable("width", sv);
                } catch (e) {
                }
                try {
                  sw.setBoundVariable("height", sv);
                } catch (e) {
                }
              }
              sw.setPluginData("s2aTokenVar", sv.name);
              sw.setPluginData("s2aTokenProp", "spacing");
              spHSp(16);
            }
            spHDv();
            spHSp(56);
            const finalH2 = frame2.height;
            sec2.resizeWithoutConstraints(SP_W, finalH2);
            bgRect2.resize(SP_W, finalH2);
            spPlaceY += finalH2 + 80;
            spCreated.push(sec2);
          }
          if (spCreated.length > 0) figma.viewport.scrollAndZoomIntoView(spCreated);
          figma.notify(`${spCreated.length} section-padding breakpoint sections generated`);
          figma.ui.postMessage({ type: "token-docs:result", sectionId: (_F = (_E = spCreated[0]) == null ? void 0 : _E.id) != null ? _F : "", count: spCreated.length });
          break;
        }
        const allVars = await figma.variables.getLocalVariablesAsync();
        const groupVars = allVars.filter(
          (v) => v.variableCollectionId === collectionId && tokenGroup(v.name) === group
        );
        if (groupVars.length === 0) throw new Error("No variables found for group: " + group);
        const allColls = await figma.variables.getLocalVariableCollectionsAsync();
        const coll = allColls.find((c) => c.id === collectionId);
        if (!coll) throw new Error("Collection not found: " + collectionId);
        const defaultModeId = coll.defaultModeId;
        const rows = [];
        for (const v of groupVars) {
          const rawVal = v.valuesByMode[defaultModeId];
          let value = "", alias = "";
          let rawNum;
          if (rawVal && typeof rawVal === "object" && "type" in rawVal && rawVal.type === "VARIABLE_ALIAS") {
            try {
              const refVar = await figma.variables.getVariableByIdAsync(rawVal.id);
              if (refVar) {
                alias = refVar.name;
                const refModeId = Object.keys(refVar.valuesByMode)[0];
                const refVal = refVar.valuesByMode[refModeId];
                value = fmtTokenValue(refVal);
                if (typeof refVal === "number") rawNum = refVal;
              }
            } catch (e) {
            }
          } else {
            value = fmtTokenValue(rawVal);
            if (typeof rawVal === "number") rawNum = rawVal;
          }
          rows.push({
            path: v.name,
            cssVar: "--" + v.name.replace(/\//g, "-"),
            value,
            alias,
            variable: v,
            resolvedType: v.resolvedType,
            rawNum
          });
        }
        const TSHIRT = {
          "none": 0,
          "base": 1,
          "5xs": 2,
          "4xs": 3,
          "3xs": 4,
          "2xs": 5,
          "xs": 6,
          "sm": 7,
          "md": 8,
          "lg": 9,
          "xl": 10,
          "2xl": 11,
          "3xl": 12,
          "4xl": 13,
          "5xl": 14,
          "round": 98,
          "pill": 98,
          "full": 98,
          "circle": 99
        };
        rows.sort((a, b) => {
          var _a2, _b2;
          const ak = ((_a2 = a.path.split("/").pop()) != null ? _a2 : "").toLowerCase();
          const bk = ((_b2 = b.path.split("/").pop()) != null ? _b2 : "").toLowerCase();
          const ao = ak in TSHIRT ? TSHIRT[ak] : -1;
          const bo = bk in TSHIRT ? TSHIRT[bk] : -1;
          if (ao !== -1 && bo !== -1) return ao - bo;
          if (ao !== -1) return -1;
          if (bo !== -1) return 1;
          if (a.rawNum !== void 0 && b.rawNum !== void 0) return a.rawNum - b.rawNum;
          return a.path.localeCompare(b.path);
        });
        await Promise.all([
          figma.loadFontAsync({ family: "Adobe Clean Display", style: "Bold" }),
          figma.loadFontAsync({ family: "Adobe Clean Display", style: "Black" }).catch(() => {
          }),
          figma.loadFontAsync({ family: "Adobe Clean", style: "Bold" }),
          figma.loadFontAsync({ family: "Adobe Clean", style: "Regular" }),
          figma.loadFontAsync({ family: "Adobe Clean", style: "ExtraBold" }).catch(() => {
          })
        ]);
        const [vBg2, vBorder2, vBody2, vSub2, vKo2, vBgSub2] = await Promise.all([
          figma.variables.getVariableByIdAsync(DARK_VAR.bgKnockout),
          figma.variables.getVariableByIdAsync(DARK_VAR.borderSubtle),
          figma.variables.getVariableByIdAsync(DARK_VAR.cBodySubtle),
          figma.variables.getVariableByIdAsync(DARK_VAR.cSubheading),
          figma.variables.getVariableByIdAsync(DARK_VAR.cKnockout),
          figma.variables.getVariableByIdAsync(DARK_VAR.bgSubtle)
        ]);
        const themeColl = allColls.find((c) => c.id === DARK_VAR.collectionId);
        const darkId = themeColl.modes.find((m) => m.name === "Dark").modeId;
        const page = figma.currentPage;
        const pageSections = page.children.filter((n) => n.type === "SECTION");
        const lastSec = pageSections.reduce(
          (a, b) => !a || b.y + b.height > a.y + a.height ? b : a,
          null
        );
        const placeX = (_G = lastSec == null ? void 0 : lastSec.x) != null ? _G : 0;
        const placeY = lastSec ? lastSec.y + lastSec.height + 80 : 0;
        const W = 2400, M = 120;
        const sec = figma.createSection();
        sec.name = group;
        sec.x = placeX;
        sec.y = placeY;
        sec.resizeWithoutConstraints(W, 800);
        const bgRect = figma.createRectangle();
        bgRect.resize(W, 800);
        bgRect.x = 0;
        bgRect.y = 0;
        bgRect.fills = [{ type: "SOLID", color: { r: 0.04, g: 0.04, b: 0.047 } }];
        sec.appendChild(bgRect);
        if (vBg2) bfv(bgRect, vBg2);
        const frame = figma.createFrame();
        frame.name = ".content";
        frame.fills = [];
        frame.clipsContent = false;
        frame.layoutMode = "VERTICAL";
        frame.resize(W, 800);
        frame.primaryAxisSizingMode = "AUTO";
        frame.counterAxisSizingMode = "FIXED";
        frame.paddingTop = 160;
        frame.paddingBottom = 120;
        frame.paddingLeft = M;
        frame.paddingRight = M;
        frame.itemSpacing = 0;
        frame.counterAxisAlignItems = "MIN";
        frame.x = 0;
        frame.y = 0;
        sec.appendChild(frame);
        frame.setExplicitVariableModeForCollection(themeColl, darkId);
        hTxt2(group, "Adobe Clean Display", "Bold", 56, vKo2);
        hSpacer2(24);
        hTxt2(coll.name, "Adobe Clean", "Regular", 20, vBody2, 1600);
        hSpacer2(24);
        hTxt2("May 2026  \xB7  @matt", "Adobe Clean", "Regular", 14, vBody2, 600);
        hSpacer2(80);
        hDiv2();
        hSpacer2(56);
        const gl = group.toLowerCase();
        const isTypography = gl.includes("typography");
        if (isTypography) {
          const MODE_ORDER = ["sm", "md", "lg", "xl"];
          const sortedModes = [...coll.modes].sort(
            (a, b) => MODE_ORDER.indexOf(a.name.toLowerCase()) - MODE_ORDER.indexOf(b.name.toLowerCase())
          );
          const allTypoVars = allVars.filter(
            (v) => v.variableCollectionId === collectionId && v.name.toLowerCase().includes("/typography/")
          );
          const textStyles = await figma.getLocalTextStylesAsync();
          const STYLE_ORDER = [
            "super",
            "heading-1",
            "heading-2",
            "heading-3",
            "heading-4",
            "heading-5",
            "heading-6",
            "body-lg",
            "body-md",
            "body-sm",
            "body-xs",
            "eyebrow",
            "label",
            "caption"
          ];
          const availableStyles = STYLE_ORDER.filter(
            (s) => allTypoVars.some((v) => v.name.endsWith(`/${s}`))
          );
          for (const styleName of availableStyles) {
            const fsVar = (_H = allTypoVars.find((v) => v.name === `s2a/typography/font-size/${styleName}`)) != null ? _H : null;
            const lhVar = (_I = allTypoVars.find((v) => v.name === `s2a/typography/line-height/${styleName}`)) != null ? _I : null;
            const lsVar = (_J = allTypoVars.find((v) => v.name === `s2a/typography/letter-spacing/${styleName}`)) != null ? _J : null;
            const textStyle = (_K = textStyles.find((s) => s.name === `s2a/typography/${styleName}`)) != null ? _K : null;
            hTxt2(styleName, "Adobe Clean", "Bold", 18, vSub2);
            hSpacer2(12);
            const isDisplayStyle = ["super", "heading-1", "heading-2"].includes(styleName);
            const isSmallStyle = ["eyebrow", "label", "caption"].includes(styleName);
            const sampleText = isDisplayStyle ? "Make anything." : isSmallStyle ? "Everything you need to make anything you want." : "Everything you need to make anything.";
            const bpFrame = figma.createFrame();
            bpFrame.name = ".breakpoints";
            bpFrame.layoutMode = "HORIZONTAL";
            bpFrame.primaryAxisSizingMode = "AUTO";
            bpFrame.counterAxisSizingMode = "AUTO";
            bpFrame.itemSpacing = 1;
            bpFrame.fills = [];
            frame.appendChild(bpFrame);
            bpFrame.layoutSizingHorizontal = "FILL";
            for (const mode of sortedModes) {
              const colFrame = figma.createFrame();
              colFrame.name = mode.name.toUpperCase();
              colFrame.layoutMode = "VERTICAL";
              colFrame.primaryAxisSizingMode = "AUTO";
              colFrame.counterAxisSizingMode = "AUTO";
              colFrame.paddingTop = 24;
              colFrame.paddingBottom = 24;
              colFrame.paddingLeft = 24;
              colFrame.paddingRight = 24;
              colFrame.itemSpacing = 12;
              colFrame.fills = [];
              bpFrame.appendChild(colFrame);
              colFrame.layoutSizingHorizontal = "FILL";
              try {
                colFrame.setExplicitVariableModeForCollection(coll, mode.modeId);
              } catch (e) {
              }
              const modeLabel = figma.createText();
              modeLabel.fontName = { family: "Adobe Clean", style: "Bold" };
              modeLabel.fontSize = 11;
              modeLabel.characters = mode.name.toUpperCase();
              colFrame.appendChild(modeLabel);
              modeLabel.layoutSizingHorizontal = "FILL";
              if (vSub2) bfv(modeLabel, vSub2);
              const textNode = figma.createText();
              textNode.fontName = { family: "Adobe Clean", style: "Regular" };
              textNode.fontSize = 16;
              textNode.characters = sampleText;
              colFrame.appendChild(textNode);
              textNode.layoutSizingHorizontal = "FILL";
              textNode.textAutoResize = "HEIGHT";
              if (textStyle) {
                try {
                  await textNode.setTextStyleIdAsync(textStyle.id);
                } catch (e) {
                }
              }
              if (fsVar) try {
                textNode.setBoundVariable("fontSize", fsVar);
              } catch (e) {
              }
              if (lhVar) try {
                textNode.setBoundVariable("lineHeight", lhVar);
              } catch (e) {
              }
              if (lsVar) try {
                textNode.setBoundVariable("letterSpacing", lsVar);
              } catch (e) {
              }
              if (vKo2) bfv(textNode, vKo2);
              const annProps = [];
              if (fsVar) annProps.push({ type: "fontSize" });
              if (lhVar) annProps.push({ type: "lineHeight" });
              if (lsVar) annProps.push({ type: "letterSpacing" });
              try {
                textNode.annotations = [{ label: `s2a/typography/${styleName}`, properties: annProps }];
              } catch (e) {
              }
            }
            hSpacer2(24);
            hDiv2();
            hSpacer2(32);
          }
        } else {
          for (const row of rows) {
            const rowFrame = figma.createFrame();
            rowFrame.name = (_L = row.path.split("/").pop()) != null ? _L : row.path;
            rowFrame.layoutMode = "HORIZONTAL";
            rowFrame.primaryAxisSizingMode = "AUTO";
            rowFrame.counterAxisSizingMode = "AUTO";
            rowFrame.paddingTop = 16;
            rowFrame.paddingBottom = 16;
            rowFrame.paddingLeft = 0;
            rowFrame.paddingRight = 0;
            rowFrame.itemSpacing = 40;
            rowFrame.counterAxisAlignItems = "CENTER";
            rowFrame.fills = [];
            frame.appendChild(rowFrame);
            rowFrame.layoutSizingHorizontal = "FILL";
            const textCol = figma.createFrame();
            textCol.name = ".text";
            textCol.layoutMode = "VERTICAL";
            textCol.primaryAxisSizingMode = "AUTO";
            textCol.counterAxisSizingMode = "AUTO";
            textCol.itemSpacing = 4;
            textCol.fills = [];
            rowFrame.appendChild(textCol);
            textCol.layoutSizingHorizontal = "FILL";
            const rTxt = (chars, style, size, v) => {
              const n = figma.createText();
              n.fontName = { family: "Adobe Clean", style };
              n.fontSize = size;
              n.characters = chars;
              n.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
              n.textAutoResize = "HEIGHT";
              textCol.appendChild(n);
              n.layoutSizingHorizontal = "FILL";
              if (v) bfv(n, v);
              return n;
            };
            rTxt(row.path, "Bold", 16, vSub2);
            rTxt(row.cssVar, "Regular", 14, vBody2);
            rTxt(row.alias ? row.value + "  \u2192  " + row.alias : row.value, "Regular", 14, vBody2);
            const swatchCol = figma.createFrame();
            swatchCol.name = ".swatch";
            swatchCol.layoutMode = "VERTICAL";
            swatchCol.counterAxisSizingMode = "FIXED";
            swatchCol.primaryAxisAlignItems = "CENTER";
            swatchCol.counterAxisAlignItems = "CENTER";
            swatchCol.fills = [];
            rowFrame.appendChild(swatchCol);
            swatchCol.resize(200, 1);
            swatchCol.primaryAxisSizingMode = "AUTO";
            swatchCol.layoutSizingVertical = "HUG";
            const annotLabel = row.cssVar;
            if (row.resolvedType === "COLOR") {
              const sw = figma.createRectangle();
              sw.resize(200, 56);
              sw.cornerRadius = 6;
              const isTransparentBlack = gl.includes("transparent") && gl.includes("black");
              const isTransparentWhite = gl.includes("transparent") && gl.includes("white");
              const isTransparent = gl.includes("transparent");
              const baseColor = isTransparentBlack ? { r: 1, g: 1, b: 1 } : isTransparentWhite ? { r: 0.2, g: 0.2, b: 0.2 } : isTransparent ? { r: 0.5, g: 0.5, b: 0.5 } : null;
              const placeholder = { type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 } };
              sw.fills = baseColor ? [{ type: "SOLID", color: baseColor }, placeholder] : [placeholder];
              swatchCol.appendChild(sw);
              sw.layoutSizingHorizontal = "FILL";
              try {
                const f = [...sw.fills];
                const bindIdx = baseColor ? 1 : 0;
                f[bindIdx] = figma.variables.setBoundVariableForPaint(f[bindIdx], "color", row.variable);
                sw.fills = f;
              } catch (e) {
              }
              if (vBorder2) {
                sw.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
                sw.strokeWeight = 1;
                sw.strokeAlign = "INSIDE";
                bindStroke2(sw, vBorder2);
              }
              sw.setPluginData("s2aTokenVar", annotLabel);
              sw.setPluginData("s2aTokenProp", "fills");
              try {
                sw.annotations = [{ label: annotLabel, properties: [{ type: "fills" }] }];
              } catch (e) {
              }
            } else if (row.resolvedType === "FLOAT") {
              const num = (_M = row.rawNum) != null ? _M : 4;
              if (gl.includes("radius")) {
                const sw = figma.createRectangle();
                sw.resize(80, 80);
                sw.cornerRadius = Math.min(num, 40);
                if (num > 0) {
                  for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) {
                    try {
                      sw.setBoundVariable(corner, row.variable);
                    } catch (e) {
                    }
                  }
                }
                sw.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.25 } }];
                if (vBgSub2) bfv(sw, vBgSub2);
                sw.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
                sw.strokeWeight = 1;
                sw.strokeAlign = "INSIDE";
                if (vBorder2) bindStroke2(sw, vBorder2);
                sw.setPluginData("s2aTokenVar", annotLabel);
                sw.setPluginData("s2aTokenProp", num > 0 ? "cornerRadius" : "fills");
                swatchCol.appendChild(sw);
                const crProp = num > 0 ? "cornerRadius" : "fills";
                try {
                  sw.annotations = [{ label: annotLabel, properties: [{ type: crProp }] }];
                } catch (e) {
                }
              } else if (gl.includes("width") || gl.includes("stroke") || gl.includes("border")) {
                const sw = figma.createRectangle();
                sw.resize(80, 80);
                sw.fills = [];
                sw.cornerRadius = 4;
                sw.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
                sw.strokeWeight = Math.max(1, Math.min(num, 20));
                sw.strokeAlign = "CENTER";
                if (vBorder2) bindStroke2(sw, vBorder2);
                try {
                  sw.setBoundVariable("strokeWeight", row.variable);
                } catch (e) {
                }
                sw.setPluginData("s2aTokenVar", annotLabel);
                sw.setPluginData("s2aTokenProp", "strokeWeight");
                swatchCol.appendChild(sw);
                try {
                  sw.annotations = [{ label: annotLabel, properties: [{ type: "strokeWeight" }] }];
                } catch (e) {
                }
              } else if (gl.includes("spacing") || gl.includes("gap") || gl.includes("padding") || gl.includes("margin")) {
                const isBlockPadding = gl.includes("section-padding");
                const swSize = Math.max(num, isBlockPadding ? 4 : 1);
                const sw = figma.createRectangle();
                sw.resize(swSize, isBlockPadding ? swSize : 32);
                sw.cornerRadius = 4;
                sw.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.35 } }];
                if (vBgSub2) bfv(sw, vBgSub2);
                try {
                  sw.setBoundVariable("width", row.variable);
                } catch (e) {
                }
                if (isBlockPadding) {
                  try {
                    sw.setBoundVariable("height", row.variable);
                  } catch (e) {
                  }
                }
                sw.setPluginData("s2aTokenVar", annotLabel);
                sw.setPluginData("s2aTokenProp", "spacing");
                swatchCol.appendChild(sw);
                const annPropsSp = isBlockPadding ? [{ type: "width" }, { type: "height" }] : [{ type: "width" }];
                try {
                  sw.annotations = [{ label: annotLabel, properties: annPropsSp }];
                } catch (e) {
                }
              } else if (gl.includes("opacity")) {
                const swFrame = figma.createFrame();
                swFrame.name = ".opacity-swatch";
                swFrame.resize(160, 64);
                swFrame.cornerRadius = 8;
                swFrame.clipsContent = true;
                swFrame.fills = [{ type: "SOLID", color: { r: 0.62, g: 0.62, b: 0.67 } }];
                const fullBlock = figma.createRectangle();
                fullBlock.resize(78, 64);
                fullBlock.x = 0;
                fullBlock.y = 0;
                fullBlock.fills = [{ type: "SOLID", color: { r: 0.06, g: 0.06, b: 0.14 } }];
                fullBlock.opacity = 1;
                swFrame.appendChild(fullBlock);
                const fadeBlock = figma.createRectangle();
                fadeBlock.resize(78, 64);
                fadeBlock.x = 82;
                fadeBlock.y = 0;
                fadeBlock.fills = [{ type: "SOLID", color: { r: 0.06, g: 0.06, b: 0.14 } }];
                fadeBlock.opacity = Math.max(0, Math.min(1, num / 100));
                swFrame.appendChild(fadeBlock);
                try {
                  fadeBlock.setBoundVariable("opacity", row.variable);
                } catch (e) {
                }
                swatchCol.appendChild(swFrame);
                swFrame.setPluginData("s2aTokenVar", annotLabel);
                swFrame.setPluginData("s2aTokenProp", "opacity");
                try {
                  swFrame.annotations = [{ label: annotLabel, properties: [] }];
                } catch (e) {
                }
              } else if (gl.includes("blur")) {
                const swFrame = figma.createFrame();
                swFrame.name = ".blur-swatch";
                swFrame.resize(200, 80);
                swFrame.cornerRadius = 8;
                swFrame.clipsContent = true;
                swFrame.fills = [{ type: "SOLID", color: { r: 0.06, g: 0.06, b: 0.08 } }];
                const bar = figma.createRectangle();
                bar.resize(160, 3);
                bar.x = 20;
                bar.y = 38;
                bar.cornerRadius = 2;
                bar.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.9 }];
                bar.effects = [{ type: "LAYER_BLUR", radius: num, visible: true }];
                bar.constraints = { horizontal: "STRETCH", vertical: "CENTER" };
                swFrame.appendChild(bar);
                swatchCol.appendChild(swFrame);
                swFrame.setPluginData("s2aTokenVar", annotLabel);
                swFrame.setPluginData("s2aTokenProp", "blur");
                try {
                  swFrame.annotations = [{ label: annotLabel, properties: [] }];
                } catch (e) {
                }
              } else {
                const sw = figma.createRectangle();
                sw.resize(64, 64);
                sw.cornerRadius = 4;
                sw.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.24 } }];
                if (vBgSub2) bfv(sw, vBgSub2);
                swatchCol.appendChild(sw);
                try {
                  sw.annotations = [{ label: annotLabel, properties: [{ type: "width" }, { type: "height" }] }];
                } catch (e) {
                }
              }
            }
            hDiv2();
          }
        }
        const finalH = frame.height;
        sec.resizeWithoutConstraints(W, finalH);
        bgRect.resize(W, finalH);
        figma.viewport.scrollAndZoomIntoView([sec]);
        figma.notify(rows.length + " tokens documented");
        figma.ui.postMessage({ type: "token-docs:result", sectionId: sec.id, count: rows.length });
      } catch (e) {
        figma.ui.postMessage({ type: "token-docs:result", error: e.message || String(e) });
      }
      break;
    }
    case "spec:generate": {
      try {
        let makeDarkSection2 = function(name, w, x, y) {
          const sec = figma.createSection();
          sec.name = name;
          sec.x = x;
          sec.y = y;
          sec.resizeWithoutConstraints(w, 800);
          figma.currentPage.appendChild(sec);
          const bg = figma.createRectangle();
          bg.resize(w, 800);
          bg.x = 0;
          bg.y = 0;
          bg.fills = [{ type: "SOLID", color: { r: 0.04, g: 0.04, b: 0.047 } }];
          sec.insertChild(0, bg);
          if (vBg) bfv(bg, vBg);
          const frame = figma.createFrame();
          frame.name = ".content";
          frame.fills = [];
          frame.clipsContent = false;
          frame.layoutMode = "NONE";
          frame.resize(w, 800);
          frame.x = 0;
          frame.y = 0;
          sec.appendChild(frame);
          if (coll && darkId) frame.setExplicitVariableModeForCollection(coll, darkId);
          const M2 = 120, CW2 = w - 240;
          let cy = 0;
          function mkTxt(chars, family, style, size, v, ww) {
            const n = figma.createText();
            n.fontName = { family, style };
            n.fontSize = size;
            n.characters = chars;
            n.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
            n.x = M2;
            n.y = cy;
            if (ww) {
              n.resize(ww, n.height);
              n.textAutoResize = "HEIGHT";
            } else n.textAutoResize = "WIDTH_AND_HEIGHT";
            frame.appendChild(n);
            if (v) bfv(n, v);
            cy += n.height;
            return n;
          }
          function gap(px) {
            cy += px;
          }
          function divider() {
            const r = figma.createRectangle();
            r.resize(CW2, 1);
            r.x = M2;
            r.y = cy;
            r.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }];
            frame.appendChild(r);
            if (vBorderSubtle) bfv(r, vBorderSubtle);
            cy += 1;
          }
          function finish(bottomPad = 120) {
            const finalH = cy + bottomPad;
            sec.resizeWithoutConstraints(w, finalH);
            bg.resize(w, finalH);
            frame.resize(w, finalH);
          }
          function getCy() {
            return cy;
          }
          function setCy(v2) {
            cy = v2;
          }
          return { sec, frame, mkTxt, gap, divider, finish, getCy, setCy, M: M2, CW: CW2, BW: Math.min(1600, CW2) };
        }, annotateTree2 = function(root) {
          var _a2;
          const isComposite = !!((_a2 = root.findOne) == null ? void 0 : _a2.call(root, (n) => n.type === "INSTANCE"));
          function annotateNode(n) {
            var _a3, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k2, _l2, _m2;
            if (isComposite && n.type === "TEXT") return;
            const bv = (_a3 = n.boundVariables) != null ? _a3 : {};
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
            if (!isComposite && n.type === "TEXT") {
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
          annotateNode(root);
          function walkChildren(n) {
            if (!("children" in n)) return;
            for (const child of n.children) {
              annotateNode(child);
              if (child.type !== "INSTANCE") walkChildren(child);
            }
          }
          walkChildren(root);
        };
        var makeDarkSection = makeDarkSection2, annotateTree = annotateTree2;
        const setId = msg.setId;
        const opts = (_N = msg.options) != null ? _N : { variants: true, tokens: true, children: true };
        const specSetNode = await figma.getNodeByIdAsync(setId);
        if (!specSetNode || specSetNode.type !== "COMPONENT_SET" && specSetNode.type !== "COMPONENT") {
          figma.ui.postMessage({ type: "spec:result", error: "Select a component or component set first" });
          break;
        }
        const specSet = specSetNode;
        const variants = specSetNode.type === "COMPONENT_SET" ? specSetNode.children : [specSetNode];
        await Promise.all([
          figma.loadFontAsync({ family: "Adobe Clean Display", style: "Bold" }),
          figma.loadFontAsync({ family: "Adobe Clean", style: "Regular" }),
          figma.loadFontAsync({ family: "Adobe Clean", style: "Bold" })
        ]);
        const propDefs = specSet.componentPropertyDefinitions;
        const axes = Object.entries(propDefs).filter(([, d]) => d.type === "VARIANT").map(([name, d]) => ({ name, values: d.variantOptions }));
        const [vBg, vBorderSubtle, vBodySubtle, vSubheading, vKnockout] = await Promise.all([
          figma.variables.getVariableByIdAsync(DARK_VAR.bgKnockout),
          figma.variables.getVariableByIdAsync(DARK_VAR.borderSubtle),
          figma.variables.getVariableByIdAsync(DARK_VAR.cBodySubtle),
          figma.variables.getVariableByIdAsync(DARK_VAR.cSubheading),
          figma.variables.getVariableByIdAsync(DARK_VAR.cKnockout)
        ]);
        await figma.loadAllPagesAsync();
        const splitComp = figma.root.findOne(
          (n) => n.type === "COMPONENT" && n.name === ".Surface Split"
        );
        const colls = await figma.variables.getLocalVariableCollectionsAsync();
        const coll = colls.find((c) => c.id === DARK_VAR.collectionId);
        const darkId = (_O = coll == null ? void 0 : coll.modes.find((m) => m.name === "Dark")) == null ? void 0 : _O.modeId;
        const lightId = (_Q = (_P = coll == null ? void 0 : coll.modes.find((m) => m.name === "Light")) == null ? void 0 : _P.modeId) != null ? _Q : coll == null ? void 0 : coll.defaultModeId;
        const originX = specSet.x + specSet.width + 200;
        const originY = specSet.y;
        const OW = 2400;
        const s1 = makeDarkSection2(specSet.name, OW, originX, originY);
        s1.setCy(160);
        s1.mkTxt(specSet.name, "Adobe Clean Display", "Bold", 56, vKnockout, s1.CW);
        s1.gap(24);
        const subtitle = `${variants.length} variant${variants.length !== 1 ? "s" : ""}` + (axes.length ? "  \xB7  " + axes.map((a) => a.name).join("  \xB7  ") : "");
        s1.mkTxt(subtitle, "Adobe Clean", "Regular", 20, vBodySubtle, s1.BW);
        s1.gap(24);
        const now = /* @__PURE__ */ new Date();
        const monthName = now.toLocaleString("en-US", { month: "long" });
        s1.mkTxt(`${monthName} ${now.getFullYear()}  \xB7  @matt`, "Adobe Clean", "Regular", 14, vBodySubtle, 600);
        s1.gap(80);
        s1.divider();
        s1.gap(56);
        specSet.x = s1.M;
        specSet.y = s1.getCy();
        s1.frame.appendChild(specSet);
        if (coll && lightId) specSet.setExplicitVariableModeForCollection(coll, lightId);
        if (splitComp && coll) {
          const split = splitComp.createInstance();
          split.name = ".Surface Split";
          const csIdx = s1.frame.children.indexOf(specSet);
          s1.frame.insertChild(csIdx, split);
          const SP = 40;
          split.resizeWithoutConstraints(specSet.width + SP * 2, specSet.height + SP * 2);
          split.x = specSet.x - SP;
          split.y = specSet.y - SP;
          split.clearExplicitVariableModeForCollection(coll);
        }
        s1.setCy(s1.getCy() + specSet.height);
        s1.gap(56);
        s1.divider();
        s1.gap(56);
        s1.mkTxt("Properties", "Adobe Clean", "Bold", 18, vSubheading, s1.CW);
        s1.gap(12);
        if (axes.length) {
          s1.mkTxt(axes.map((a) => `${a.name}: ${a.values.join(", ")}`).join("   \xB7   "), "Adobe Clean", "Regular", 18, vBodySubtle, s1.BW);
          s1.gap(32);
        }
        if (opts.children) {
          const childMap = /* @__PURE__ */ new Map();
          const allInstances = [];
          for (const v of variants)
            for (const n of [v, ...v.findAll(() => true)])
              if (n.type === "INSTANCE") allInstances.push(n);
          const mains = await Promise.all(allInstances.map((inst) => inst.getMainComponentAsync().catch(() => null)));
          for (const main of mains) {
            if (((_R = main == null ? void 0 : main.parent) == null ? void 0 : _R.type) === "COMPONENT_SET") {
              const isSelf = specSet.type === "COMPONENT_SET" ? main.parent.id === specSet.id : main.id === specSet.id;
              if (!isSelf) childMap.set(main.parent.id, main.parent);
            }
          }
          if (childMap.size > 0) {
            s1.gap(24);
            s1.mkTxt("Uses", "Adobe Clean", "Bold", 18, vSubheading, s1.CW);
            s1.gap(12);
            s1.mkTxt([...childMap.values()].map((cs) => cs.name).join("   \xB7   "), "Adobe Clean", "Regular", 18, vBodySubtle, s1.BW);
          }
        }
        s1.finish();
        const allCreated = [s1.sec];
        if (opts.tokens) {
          const maxCompW = Math.max(...variants.map((v) => v.width));
          const VW = Math.max(800, maxCompW + 600);
          const varSecX = originX + OW + 120;
          let varSecY = originY;
          for (const variant of variants) {
            const readableName = variant.name.split(", ").map((p) => {
              var _a2;
              return (_a2 = p.split("=")[1]) != null ? _a2 : p;
            }).join("  \xB7  ");
            const vs = makeDarkSection2(`${specSet.name} \u2014 ${readableName}`, VW, varSecX, varSecY);
            vs.setCy(60);
            vs.mkTxt(readableName, "Adobe Clean", "Bold", 18, vSubheading);
            vs.gap(6);
            vs.mkTxt(specSet.name, "Adobe Clean", "Regular", 13, vBodySubtle);
            vs.gap(24);
            vs.divider();
            const contentAreaY = vs.getCy();
            const annotPad = Math.max(240, variant.height * 4);
            vs.gap(annotPad);
            const inst = variant.createInstance();
            inst.x = vs.M;
            inst.y = vs.getCy();
            vs.frame.appendChild(inst);
            if (coll && lightId) inst.setExplicitVariableModeForCollection(coll, lightId);
            annotateTree2(inst);
            vs.setCy(vs.getCy() + inst.height);
            vs.gap(annotPad);
            vs.finish(0);
            if (splitComp && coll) {
              const split = splitComp.createInstance();
              split.name = ".Surface Split";
              const instIdx = vs.frame.children.indexOf(inst);
              vs.frame.insertChild(Math.max(0, instIdx), split);
              split.resizeWithoutConstraints(VW, vs.sec.height - contentAreaY);
              split.x = 0;
              split.y = contentAreaY;
              split.clearExplicitVariableModeForCollection(coll);
            }
            allCreated.push(vs.sec);
            varSecY += vs.sec.height + 240;
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
