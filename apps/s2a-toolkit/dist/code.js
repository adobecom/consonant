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
    width: "width" in first ? Math.round(first.width) : void 0,
    height: "height" in first ? Math.round(first.height) : void 0
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
