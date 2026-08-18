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
function parseVariantProps(name) {
  const props = {};
  for (const part of name.split(",")) {
    const eq = part.indexOf("=");
    if (eq !== -1) props[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return props;
}
function parseMetaFence(desc) {
  const out = {
    version: "",
    status: "",
    updated: "",
    changelog: "",
    goodToKnow: "",
    accessibility: "",
    description: "",
    hadFence: false
  };
  if (!desc) return out;
  const lines = desc.split("\n");
  let idx = 0;
  if (/s2a:meta/i.test(lines[0] || "")) {
    out.hadFence = true;
    let end = 1;
    while (end < lines.length && lines[end].trim() !== "") end++;
    const changelog = [];
    let inChangelog = false;
    for (const line of lines.slice(1, end)) {
      const kv = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
      if (kv && !/^\s/.test(line)) {
        inChangelog = false;
        const k = kv[1].toLowerCase();
        const v = kv[2].trim();
        if (k === "version") out.version = v;
        else if (k === "status") out.status = v;
        else if (k === "updated") out.updated = v;
        else if (k === "changelog") {
          inChangelog = true;
          if (v) changelog.push(v);
        }
      } else if (inChangelog) {
        changelog.push(line.trim());
      }
    }
    if (changelog.length) out.changelog = "changelog\n  " + changelog.join("\n  ");
    idx = end + 1;
  }
  const rest = lines.slice(idx).join("\n").trim();
  const gtk = rest.match(/##\s*Good to know\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  const a11y = rest.match(/##\s*Accessibility\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (gtk) out.goodToKnow = gtk[1].trim();
  if (a11y) out.accessibility = a11y[1].trim();
  out.description = rest.split(/\n##\s/)[0].split(/\n\s*\n/)[0].trim();
  return out;
}
function pageOfNode(node) {
  let p = node;
  while (p && p.type !== "PAGE") p = p.parent;
  return p != null ? p : null;
}
function pickDefaultVariant(variants) {
  if (!variants.length) return void 0;
  const DEFAULTISH = /* @__PURE__ */ new Set([
    "default",
    "resting",
    "standard",
    "md",
    "solid",
    "hug",
    "block",
    "horizontal",
    "on-light"
  ]);
  let best = variants[0];
  let bestScore = -1;
  for (const v of variants) {
    const score = Object.values(parseVariantProps(v.name)).filter((x) => DEFAULTISH.has(x.toLowerCase())).length;
    if (score > bestScore) {
      best = v;
      bestScore = score;
    }
  }
  return best;
}
function clearDocSlot(frame) {
  for (const c of [...frame.children]) c.remove();
}
function anatomyList(comp) {
  const lines = [];
  function walk(node, depth) {
    if (node !== comp && (node.name.startsWith(".") || node.name.startsWith("["))) {
      lines.push("  ".repeat(Math.max(0, depth - 1)) + node.name);
    }
    if ("children" in node && depth < 4) {
      for (const c of node.children) walk(c, depth + 1);
    }
  }
  walk(comp, 0);
  return lines.length ? lines.join("\n") : ".root";
}
function setUsesNativeSlots(set) {
  const v = set.children[0];
  if (v && "findOne" in v) {
    try {
      return !!v.findOne((n) => n.type === "SLOT");
    } catch (e) {
    }
  }
  return false;
}
function clusterPositions(vals, tol) {
  const sorted = Array.from(new Set(vals)).sort((a, b) => a - b);
  const reps = [];
  for (const v of sorted) if (!reps.some((r) => Math.abs(r - v) <= tol)) reps.push(v);
  return reps;
}
function mkAxisLabel(chars, style, size, colorVar) {
  const t = figma.createText();
  t.name = "axis-label";
  t.fontName = { family: "Adobe Clean", style };
  t.fontSize = size;
  t.characters = chars;
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  t.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  if (colorVar) bfv(t, colorVar);
  return t;
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
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
  switch (msg.type) {
    case "ui-ready":
      notifySelection();
      break;
    // GitHub PAT for the Token Release feature — persisted in clientStorage
    // (local to this user's Figma install; never written into the document).
    case "gh-token:get": {
      const token = (_a = await figma.clientStorage.getAsync("gh-token")) != null ? _a : "";
      figma.ui.postMessage({ type: "gh-token:value", token });
      break;
    }
    case "gh-token:set": {
      const token = msg.token || "";
      if (token) await figma.clientStorage.setAsync("gh-token", token);
      else await figma.clientStorage.deleteAsync("gh-token");
      break;
    }
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
      const categories = new Set((_b = msg.categories) != null ? _b : []);
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
        const bv = (_c = n.boundVariables) != null ? _c : {};
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
        const bv = (_d = n.boundVariables) != null ? _d : {};
        const anns = [];
        const pdVar = (_f = (_e = n.getPluginData) == null ? void 0 : _e.call(n, "s2aTokenVar")) != null ? _f : "";
        const pdProp = (_h = (_g = n.getPluginData) == null ? void 0 : _g.call(n, "s2aTokenProp")) != null ? _h : "";
        if (categories.has("color-fg") && n.type === "TEXT") {
          if (((_j = (_i = bv.fills) == null ? void 0 : _i.length) != null ? _j : 0) > 0) {
            anns.push({ label: bvLabel2(bv, "fills") || "color-fg", properties: [{ type: "fills" }] });
          } else if (pdVar && pdProp === "fills") {
            anns.push({ label: pdVar, properties: [{ type: "fills" }] });
          }
        }
        if (categories.has("color-bg") && n.type !== "TEXT") {
          if (((_l = (_k = bv.fills) == null ? void 0 : _k.length) != null ? _l : 0) > 0) {
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
          if (((_n = (_m = bv.fontFamily) == null ? void 0 : _m.length) != null ? _n : 0) > 0) tp.push({ type: "fontFamily" });
          if (((_p = (_o = bv.fontSize) == null ? void 0 : _o.length) != null ? _p : 0) > 0) tp.push({ type: "fontSize" });
          if (((_r = (_q = bv.lineHeight) == null ? void 0 : _q.length) != null ? _r : 0) > 0) tp.push({ type: "lineHeight" });
          if (((_t = (_s = bv.letterSpacing) == null ? void 0 : _s.length) != null ? _t : 0) > 0) tp.push({ type: "letterSpacing" });
          if (tp.length) {
            const lbl = bvLabel2(bv, "fontSize") || bvLabel2(bv, "fontFamily") || "typography";
            anns.push({ label: lbl, properties: tp });
          }
          if (((_v = (_u = bv.fontStyle) == null ? void 0 : _u.length) != null ? _v : 0) > 0) {
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
          if (((_w = n.annotations) == null ? void 0 : _w.length) > 0) {
            n.annotations = [];
            cleared++;
          }
        } catch (e) {
        }
      }
      figma.ui.postMessage({ type: "annotate:cleared", cleared });
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
    case "doc:generate": {
      try {
        const setId = msg.setId;
        const node = await figma.getNodeByIdAsync(setId);
        if (!node || node.type !== "COMPONENT_SET") {
          figma.ui.postMessage({ type: "doc:result", error: "Select a component set first" });
          break;
        }
        const set = node;
        await Promise.all([
          figma.loadFontAsync({ family: "Adobe Clean Display", style: "Bold" }),
          figma.loadFontAsync({ family: "Adobe Clean", style: "Regular" }),
          figma.loadFontAsync({ family: "Adobe Clean", style: "Bold" })
        ]);
        await figma.loadAllPagesAsync();
        const tplPage = figma.root.children.find((p) => p.name === "\u{1F4D0} Templates");
        const template = tplPage == null ? void 0 : tplPage.children.find((c) => c.name === "Doc Template");
        if (!template) {
          figma.ui.postMessage({ type: "doc:result", error: 'Template not found \u2014 add "Doc Template" to the "\u{1F4D0} Templates" page' });
          break;
        }
        const bColls = await figma.variables.getLocalVariableCollectionsAsync();
        const themeColl = bColls.find((c) => c.id === "VariableCollectionId:6:17");
        const darkModeId = (_x = themeColl == null ? void 0 : themeColl.modes.find((m) => m.name === "Dark")) == null ? void 0 : _x.modeId;
        const [cLabel, cCaption, cBody] = await Promise.all([
          figma.variables.getVariableByIdAsync("VariableID:2483:41392"),
          // content/label
          figma.variables.getVariableByIdAsync("VariableID:2483:41395"),
          // content/caption
          figma.variables.getVariableByIdAsync("VariableID:2483:41396")
          // content/body-subtle
        ]);
        const meta = parseMetaFence(set.description || "");
        const doc = template.clone();
        doc.name = `${set.name} \xB7 Docs`;
        const container = set.parent;
        container.appendChild(doc);
        doc.x = set.x + set.width + 200;
        doc.y = set.y;
        const find = (name) => doc.findOne((n) => n.name === name);
        async function setText(name, value) {
          const t = find(name);
          if (!t || t.type !== "TEXT" || value == null) return;
          const tn = t;
          const fonts = tn.getRangeAllFontNames(0, Math.max(1, tn.characters.length));
          for (const f of fonts) await figma.loadFontAsync(f);
          tn.characters = value;
        }
        await setText("@hero-name", set.name);
        await setText("@hero-desc", meta.description || "One-line description of what this component is and when to use it.");
        await setText("@version", meta.version || "0.0.0");
        await setText("@status", meta.status || "active");
        await setText("@updated", meta.updated ? `updated ${meta.updated}` : "updated \u2014");
        await setText("@changelog", meta.changelog || "changelog\n  \u2014");
        if (meta.goodToKnow) await setText("@good-to-know", meta.goodToKnow);
        if (meta.accessibility) await setText("@accessibility", meta.accessibility);
        const variants = set.children.filter((c) => c.type === "COMPONENT");
        const defaultVariant = pickDefaultVariant(variants);
        const heroSlot = find("@slot-hero");
        if (heroSlot && defaultVariant) {
          clearDocSlot(heroSlot);
          heroSlot.clipsContent = false;
          heroSlot.paddingTop = 20;
          heroSlot.paddingBottom = 20;
          heroSlot.counterAxisSizingMode = "AUTO";
          heroSlot.appendChild(defaultVariant.createInstance());
        }
        if (defaultVariant) await setText("@anatomy", anatomyList(defaultVariant));
        const propsSlot = find("@properties");
        if (propsSlot) {
          clearDocSlot(propsSlot);
          propsSlot.strokes = [];
          propsSlot.dashPattern = [];
          propsSlot.fills = [];
          propsSlot.layoutMode = "VERTICAL";
          propsSlot.primaryAxisAlignItems = "MIN";
          propsSlot.counterAxisAlignItems = "MIN";
          propsSlot.itemSpacing = 8;
          propsSlot.paddingTop = 0;
          propsSlot.paddingBottom = 0;
          propsSlot.paddingLeft = 0;
          propsSlot.paddingRight = 0;
          for (const [rawName, def] of Object.entries(set.componentPropertyDefinitions)) {
            const nm = rawName.split("#")[0];
            const opts = def.variantOptions;
            const line = `${nm}  \xB7  ${String(def.type).toLowerCase()}` + (opts ? "  \xB7  " + opts.join(" / ") : "");
            const t = figma.createText();
            t.fontName = { family: "Adobe Clean", style: "Regular" };
            t.fontSize = 14;
            t.characters = line;
            t.textAutoResize = "HEIGHT";
            propsSlot.appendChild(t);
            t.layoutSizingHorizontal = "FILL";
            if (cBody) bfv(t, cBody);
          }
          propsSlot.primaryAxisSizingMode = "AUTO";
        }
        const gridSlot = find("@slot-all-variants");
        if (gridSlot && variants.length) {
          clearDocSlot(gridSlot);
          gridSlot.strokes = [];
          gridSlot.dashPattern = [];
          gridSlot.fills = [];
          gridSlot.layoutMode = "NONE";
          gridSlot.clipsContent = false;
          const items = variants.map((v) => ({
            v,
            props: parseVariantProps(v.name),
            nx: 0,
            ny: 0,
            w: Math.round(v.width),
            h: Math.round(v.height),
            rx: Math.round(v.x),
            ry: Math.round(v.y)
          }));
          const minX = Math.min(...items.map((i) => i.rx));
          const minY = Math.min(...items.map((i) => i.ry));
          for (const it of items) {
            it.nx = it.rx - minX;
            it.ny = it.ry - minY;
          }
          const propNames = Array.from(new Set(items.flatMap((i) => Object.keys(i.props))));
          const varying = propNames.filter((p) => new Set(items.map((i) => i.props[p])).size > 1);
          const yReps = clusterPositions(items.map((i) => i.ny), 6);
          const rowOf = (ny) => {
            var _a2;
            return (_a2 = yReps.find((y) => Math.abs(y - ny) <= 6)) != null ? _a2 : ny;
          };
          const rowProps = varying.filter(
            (p) => yReps.every((y) => new Set(items.filter((i) => rowOf(i.ny) === y).map((i) => i.props[p])).size === 1)
          );
          const colProps = varying.filter((p) => !rowProps.includes(p));
          const GUTTER_Y = 34;
          const rowLabels = [];
          for (const y of yReps) {
            const rep = items.find((i) => rowOf(i.ny) === y);
            const txt = rowProps.map((p) => rep.props[p]).filter(Boolean).join(" \xB7 ");
            if (!txt) continue;
            const t = mkAxisLabel(txt, "Bold", 12, cLabel);
            gridSlot.appendChild(t);
            rowLabels.push({ t, y, h: rep.h });
          }
          const maxLW = rowLabels.length ? Math.max(...rowLabels.map((r) => r.t.width)) : 0;
          const GUTTER_X = Math.max(56, Math.round(maxLW) + 24);
          let maxRight = 0, maxBottom = 0;
          for (const it of items) {
            const inst = it.v.createInstance();
            gridSlot.appendChild(inst);
            inst.x = GUTTER_X + it.nx;
            inst.y = GUTTER_Y + it.ny;
            maxRight = Math.max(maxRight, inst.x + it.w);
            maxBottom = Math.max(maxBottom, inst.y + it.h);
          }
          for (const r of rowLabels) {
            r.t.x = GUTTER_X - 16 - r.t.width;
            r.t.y = GUTTER_Y + r.y + Math.round(r.h / 2) - Math.round(r.t.height / 2);
          }
          const topY = Math.min(...yReps);
          const topRow = items.filter((i) => rowOf(i.ny) === topY).sort((a, b) => a.nx - b.nx);
          for (const it of topRow) {
            const txt = colProps.map((p) => it.props[p]).filter(Boolean).join(" \xB7 ");
            if (!txt) continue;
            const t = mkAxisLabel(txt, "Regular", 11, cCaption);
            gridSlot.appendChild(t);
            t.x = GUTTER_X + it.nx;
            t.y = GUTTER_Y - 22;
          }
          gridSlot.resize(Math.max(maxRight + 24, gridSlot.width), maxBottom + 24);
        }
        const slotsRow = doc.findOne((n) => n.name === "row: slots");
        if (slotsRow) slotsRow.visible = setUsesNativeSlots(set);
        const darkSlot = find("@slot-dark-preview");
        if (darkSlot && gridSlot) {
          clearDocSlot(darkSlot);
          darkSlot.strokes = [];
          darkSlot.dashPattern = [];
          darkSlot.fills = [];
          darkSlot.layoutMode = "NONE";
          darkSlot.clipsContent = false;
          const gclone = gridSlot.clone();
          darkSlot.appendChild(gclone);
          gclone.x = 0;
          gclone.y = 0;
          if (themeColl && darkModeId) gclone.setExplicitVariableModeForCollection(themeColl, darkModeId);
          darkSlot.resize(Math.max(darkSlot.width, gclone.width), gclone.height + 8);
        }
        for (const child of doc.children) {
          if (child.type === "FRAME") {
            const f = child;
            if (f.layoutMode === "VERTICAL") f.primaryAxisSizingMode = "AUTO";
            else if (f.layoutMode === "HORIZONTAL") f.counterAxisSizingMode = "AUTO";
          }
        }
        doc.primaryAxisSizingMode = "AUTO";
        const page = pageOfNode(set);
        if (page && page !== figma.currentPage) await figma.setCurrentPageAsync(page);
        figma.currentPage.selection = [doc];
        figma.viewport.scrollAndZoomIntoView([doc]);
        figma.ui.postMessage({
          type: "doc:result",
          nodeId: doc.id,
          variantCount: variants.length,
          warning: meta.hadFence ? void 0 : "No s2a:meta fence in the set description \u2014 used placeholders for version / changelog / prose"
        });
      } catch (e) {
        figma.ui.postMessage({ type: "doc:result", error: e.message || String(e) });
      }
      break;
    }
  }
};
