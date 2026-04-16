"use strict";
(() => {
  var __defProp = Object.defineProperty;
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

  // src/ui.ts
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  async function copyToClipboard(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }
  var tabs = document.querySelectorAll(".tab");
  var panels = document.querySelectorAll(".tab-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = document.querySelector(`[data-panel="${target}"]`);
      if (panel) panel.classList.add("active");
    });
  });
  var currentSelection = { count: 0, hasAutoLayout: false };
  function updateAlignControls() {
    const placeholder = document.getElementById("alignPlaceholder");
    const controls = document.getElementById("alignControls");
    if (currentSelection.count === 0) {
      placeholder.style.display = "block";
      controls.style.display = "none";
      return;
    }
    placeholder.style.display = "none";
    controls.style.display = "block";
  }
  function updateDesignControls() {
    const placeholder = document.getElementById("designPlaceholder");
    const controls = document.getElementById("designControls");
    if (currentSelection.count === 0) {
      placeholder.style.display = "block";
      controls.style.display = "none";
      return;
    }
    placeholder.style.display = "none";
    controls.style.display = "block";
  }
  function updateMatchControls() {
    const placeholder = document.getElementById("matchPlaceholder");
    const controls = document.getElementById("matchControls");
    if (currentSelection.count === 0) {
      placeholder.style.display = "block";
      controls.style.display = "none";
      return;
    }
    placeholder.style.display = "none";
    controls.style.display = "block";
  }
  function updateLocalizeControls() {
    const placeholder = document.getElementById("localizePlaceholder");
    const controls = document.getElementById("localizeControls");
    if (currentSelection.count === 0) {
      placeholder.style.display = "block";
      controls.style.display = "none";
      return;
    }
    placeholder.style.display = "none";
    controls.style.display = "block";
  }
  function updateSpecsControls() {
    const placeholder = document.getElementById("specsPlaceholder");
    const controls = document.getElementById("specsControls");
    if (currentSelection.count === 0) {
      placeholder.style.display = "block";
      controls.style.display = "none";
      return;
    }
    placeholder.style.display = "none";
    controls.style.display = "block";
  }
  function updateSelectionInfo(data) {
    const el = document.getElementById("selectionInfo");
    if (!el) return;
    if (!data) {
      el.innerHTML = '<span class="selection-label">No selection</span>';
      return;
    }
    el.innerHTML = `<span class="selection-label"><strong>${esc(data.name)}</strong> (${esc(data.type)}) &mdash; ${Math.round(data.width)} &times; ${Math.round(data.height)}</span>`;
  }
  function updateTokenStatus(count, version) {
    const el = document.getElementById("footer");
    if (!el) return;
    el.innerHTML = `<span class="token-status">Tokens: ${esc(version)} &mdash; ${count} tokens loaded</span>`;
  }
  function postToPlugin(type, payload) {
    parent.postMessage({ pluginMessage: __spreadValues({ type }, payload) }, "https://www.figma.com");
  }
  window.addEventListener("message", (event) => {
    const msg = event.data.pluginMessage;
    if (!msg) return;
    switch (msg.type) {
      case "selection-changed":
        updateSelectionInfo(msg.selection);
        currentSelection = { count: msg.count, hasAutoLayout: msg.hasAutoLayout };
        updateAlignControls();
        updateMatchControls();
        updateDesignControls();
        updateSpecsControls();
        updateLocalizeControls();
        updateA11yControls();
        break;
      case "api-key-state":
        updateApiKeyUi(msg.hasKey, msg.masked);
        break;
      case "localize-status":
        updateLocalizeStatus(msg.message);
        break;
      case "localize-bridge-prompt":
        showLocalizeBridgePrompt(msg);
        break;
      case "token-status":
        updateTokenStatus(msg.count, msg.version);
        break;
      case "node-properties":
        renderPropertyList(msg.properties);
        break;
      case "spec-it-status":
        updateSpecStatus(msg.message);
        break;
      case "s2a-audit-result":
        renderAuditResult(msg);
        break;
      case "s2a-align-result":
        renderAlignResult(msg);
        break;
      case "match-result":
        updateMatchStatus(msg.message);
        break;
      case "grid-result":
        updateGridStatus(msg.message);
        break;
      case "a11y-status":
        updateA11yStatus(msg.message);
        break;
      case "a11y-fill-request":
        if (autoFillMode === "auto") {
          sendAutoFillRequest(!!msg.plainLanguage);
        } else {
          showAiFillInstruction(msg.mode, msg.sections, msg.frameName, msg.plainLanguage);
        }
        autoFillMode = null;
        break;
      case "a11y-panels-fill-request":
        showPanelsFillInstruction(msg.sections, msg.frameName, msg.sectionIds);
        break;
      // Unified bridge command result from code.ts
      case "bridge:command-result": {
        const pending = bridgePendingRequests.get(msg.requestId);
        if (pending) {
          clearTimeout(pending.timeoutId);
          bridgePendingRequests.delete(msg.requestId);
          if (msg.success) {
            const result = __spreadValues({}, msg);
            delete result.type;
            delete result.requestId;
            pending.resolve(result);
          } else {
            pending.reject(new Error(msg.error || "Unknown error"));
          }
        }
        break;
      }
      // Variables data from code.ts (auto-sync)
      case "bridge:variables-data": {
        if (bridgeWs && bridgeWs.readyState === 1) {
          try {
            bridgeWs.send(JSON.stringify({ type: "VARIABLES_DATA", data: msg.data }));
          } catch (e) {
          }
        }
        break;
      }
      // Event forwarding to WebSocket
      case "bridge:selection-changed": {
        if (bridgeWs && bridgeWs.readyState === 1) {
          try {
            bridgeWs.send(JSON.stringify({ type: "SELECTION_CHANGE", data: { selection: msg.selection } }));
          } catch (e) {
          }
        }
        break;
      }
      case "bridge:page-changed": {
        if (bridgeWs && bridgeWs.readyState === 1) {
          try {
            bridgeWs.send(JSON.stringify({ type: "PAGE_CHANGE", data: msg.page }));
          } catch (e) {
          }
        }
        break;
      }
    }
  });
  function navigateToNode(nodeId) {
    postToPlugin("navigate-to-node", { nodeId });
  }
  function renderAuditResult(result) {
    var _a23;
    const list = document.getElementById("propertyList");
    if (!list) return;
    const pct = result.total > 0 ? Math.round(result.matched / result.total * 100) : 0;
    const color = pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "#e34850";
    const annotateBtn = result.issues.length > 0 ? `<button id="annotateAuditBtn" style="background:none;border:1px solid var(--border,#e5e5e5);border-radius:4px;color:var(--text-secondary);font-size:10px;cursor:pointer;padding:2px 8px;">Annotate</button>` : "";
    let html = `<div style="padding:8px 0;margin-bottom:8px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <strong style="font-size:13px;color:${color}">${pct}% S2A compliant</strong>
      <span style="color:var(--text-secondary);font-size:10px;display:block">${result.matched}/${result.total} properties matched \u2014 ${result.issues.length} issues</span>
    </div>
    ${annotateBtn}
  </div>`;
    if (result.issues.length > 0) {
      html += '<div class="section-title" style="margin-top:8px">Issues (click to navigate)</div>';
      html += result.issues.map(
        (issue) => `<div class="property-row" data-node-id="${esc(issue.nodeId)}" style="cursor:pointer">
        <span class="property-name">${esc(issue.nodeName)}</span>
        <span class="property-value">${esc(issue.property)}: ${esc(issue.value)}</span>
        <span class="token-badge token-badge-miss">No token</span>
      </div>`
      ).join("");
    }
    list.innerHTML = html;
    list.querySelectorAll(".property-row[data-node-id]").forEach((row) => {
      row.addEventListener("click", () => {
        const nodeId = row.dataset.nodeId;
        if (nodeId) navigateToNode(nodeId);
      });
    });
    (_a23 = document.getElementById("annotateAuditBtn")) == null ? void 0 : _a23.addEventListener("click", () => {
      postToPlugin("annotate-audit-issues", { issues: result.issues });
    });
  }
  function renderAlignResult(result) {
    const list = document.getElementById("propertyList");
    if (!list) return;
    let html = `<div style="padding:8px 0;margin-bottom:8px;border-bottom:1px solid var(--border)">
    <strong style="font-size:13px;color:var(--success)">${result.aligned} bound to S2A</strong>
    <span style="color:var(--text-secondary);font-size:10px;display:block">${result.scanned} nodes scanned \u2014 mode: ${esc(result.mode)}</span>
  </div>`;
    if (result.unmatched.length > 0) {
      html += '<div class="section-title" style="margin-top:8px">Not Found in S2A (click to navigate)</div>';
      html += result.unmatched.map(
        (item) => `<div class="property-row" data-node-id="${esc(item.nodeId)}" style="cursor:pointer">
        <span class="property-name">${esc(item.nodeName)}</span>
        <span class="property-value">${esc(item.property)}: ${esc(item.value)}</span>
        <span class="token-badge token-badge-miss">No match</span>
      </div>`
      ).join("");
    } else {
      html += '<div style="padding:12px 0;color:var(--success);text-align:center">All properties matched S2A tokens</div>';
    }
    list.innerHTML = html;
    list.querySelectorAll(".property-row[data-node-id]").forEach((row) => {
      row.addEventListener("click", () => {
        const nodeId = row.dataset.nodeId;
        if (nodeId) navigateToNode(nodeId);
      });
    });
  }
  function renderPropertyList(properties) {
    const list = document.getElementById("propertyList");
    if (!list || properties.length === 0) return;
    list.innerHTML = properties.map((prop) => {
      const safeColor = prop.colorSwatch && CSS.supports("color", prop.colorSwatch) ? prop.colorSwatch : "";
      const swatch = safeColor ? `<span class="color-swatch" style="background:${safeColor}"></span>` : "";
      const badge = prop.token ? `<span class="token-badge token-badge-match">${esc(prop.token)}</span>` : `<span class="token-badge token-badge-miss">No token</span>`;
      const copyValue = prop.token ? `var(${prop.token})` : prop.value;
      return `<div class="property-row" data-copy="${esc(copyValue)}" title="Click to copy">
      <span class="property-name">${esc(prop.name)}</span>
      <span class="property-value">${swatch}${esc(prop.value)}</span>
      ${badge}
    </div>`;
    }).join("");
    list.querySelectorAll(".property-row").forEach((row) => {
      row.addEventListener("click", () => {
        const value = row.dataset.copy || "";
        copyToClipboard(value);
      });
    });
  }
  var _a;
  (_a = document.getElementById("s2aAuditBtn")) == null ? void 0 : _a.addEventListener("click", () => postToPlugin("s2a-audit"));
  var _a2;
  (_a2 = document.getElementById("fullAlignBtn")) == null ? void 0 : _a2.addEventListener("click", () => postToPlugin("full-align-s2a"));
  var _a3;
  (_a3 = document.getElementById("textColorsAlignBtn")) == null ? void 0 : _a3.addEventListener("click", () => postToPlugin("text-colors-align"));
  var _a4;
  (_a4 = document.getElementById("gridBtn")) == null ? void 0 : _a4.addEventListener("click", () => {
    postToPlugin("apply-grid");
    updateGridStatus("Applying grid...");
  });
  var _a5;
  (_a5 = document.getElementById("gridXlBtn")) == null ? void 0 : _a5.addEventListener("click", () => {
    postToPlugin("apply-grid-xl");
    updateGridStatus("Applying XL grid...");
  });
  var _a6;
  (_a6 = document.getElementById("clearGridBtn")) == null ? void 0 : _a6.addEventListener("click", () => {
    postToPlugin("clear-grids");
    updateGridStatus("Clearing grids...");
  });
  function updateGridStatus(message) {
    const el = document.getElementById("gridStatus");
    if (el) el.innerHTML = `<span style="color:var(--text-secondary)">${esc(message)}</span>`;
  }
  var _a7;
  (_a7 = document.getElementById("matchCheckAll")) == null ? void 0 : _a7.addEventListener("click", () => {
    const ids = ["matchTypography", "matchFillColors", "matchStrokeColors", "matchBorderRadius", "matchBorderWidth", "matchSpacing", "matchOpacity", "matchDropShadow", "matchBlur"];
    const boxes = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const allChecked = boxes.every((cb) => cb.checked);
    boxes.forEach((cb) => {
      cb.checked = !allChecked;
    });
    const btn = document.getElementById("matchCheckAll");
    if (btn) btn.textContent = allChecked ? "Check All" : "Uncheck All";
  });
  var _a8;
  (_a8 = document.getElementById("matchBtn")) == null ? void 0 : _a8.addEventListener("click", () => {
    const categories = [];
    if (document.getElementById("matchTypography").checked) categories.push("typography");
    if (document.getElementById("matchFillColors").checked) categories.push("fillColors");
    if (document.getElementById("matchStrokeColors").checked) categories.push("strokeColors");
    if (document.getElementById("matchBorderRadius").checked) categories.push("borderRadius");
    if (document.getElementById("matchBorderWidth").checked) categories.push("borderWidth");
    if (document.getElementById("matchSpacing").checked) categories.push("spacing");
    if (document.getElementById("matchOpacity").checked) categories.push("opacity");
    if (document.getElementById("matchDropShadow").checked) categories.push("dropShadow");
    if (document.getElementById("matchBlur").checked) categories.push("blur");
    if (categories.length === 0) return;
    postToPlugin("force-match", { categories });
    updateMatchStatus("Matching...");
  });
  function updateMatchStatus(message) {
    const el = document.getElementById("matchStatus");
    if (!el) return;
    el.innerHTML = `<span style="color:var(--text-secondary)">${esc(message)}</span>`;
  }
  var _a9;
  (_a9 = document.getElementById("fullSpecsBtn")) == null ? void 0 : _a9.addEventListener("click", () => {
    postToPlugin("spec-it", { sections: ["anatomy", "layout", "typography", "components"] });
    updateSpecStatus("Generating full specs...");
  });
  var _a10;
  (_a10 = document.getElementById("specItBtn")) == null ? void 0 : _a10.addEventListener("click", () => {
    var _a23, _b, _c, _d, _e, _f;
    const sections = [];
    if ((_a23 = document.getElementById("specAnatomy")) == null ? void 0 : _a23.checked) sections.push("anatomy");
    if ((_b = document.getElementById("specCardGaps")) == null ? void 0 : _b.checked) sections.push("cardGaps");
    if ((_c = document.getElementById("specSpacingGeneral")) == null ? void 0 : _c.checked) sections.push("spacingGeneral");
    if ((_d = document.getElementById("specSpacing")) == null ? void 0 : _d.checked) sections.push("spacing");
    if ((_e = document.getElementById("specColors")) == null ? void 0 : _e.checked) sections.push("colors");
    if ((_f = document.getElementById("specTextProps")) == null ? void 0 : _f.checked) sections.push("textProperties");
    if (sections.length === 0) {
      updateSpecStatus("Select at least one section.");
      return;
    }
    postToPlugin("spec-it", { sections });
    updateSpecStatus("Generating spec...");
  });
  function updateSpecStatus(message) {
    const el = document.getElementById("specStatus");
    if (el) el.innerHTML = `<span style="color:var(--text-secondary)">${esc(message)}</span>`;
  }
  var KEYED_PROVIDERS = /* @__PURE__ */ new Set(["deepl", "google", "azure"]);
  var providerSelect = document.getElementById("providerSelect");
  var apiKeySection = document.getElementById("apiKeySection");
  function syncKeySection() {
    const provider = (providerSelect == null ? void 0 : providerSelect.value) || "mymemory";
    if (apiKeySection) apiKeySection.style.display = KEYED_PROVIDERS.has(provider) ? "block" : "none";
    postToPlugin("get-api-key", { provider });
  }
  providerSelect == null ? void 0 : providerSelect.addEventListener("change", syncKeySection);
  syncKeySection();
  var _a11;
  (_a11 = document.getElementById("locCheckAll")) == null ? void 0 : _a11.addEventListener("click", () => {
    const ids = ["locDe", "locZh", "locTh", "locAr"];
    const boxes = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const allChecked = boxes.every((b) => b.checked);
    boxes.forEach((b) => {
      b.checked = !allChecked;
    });
    const locRtlEl = document.getElementById("locRtl");
    if (locRtlEl && !allChecked) locRtlEl.checked = true;
  });
  var locAr = document.getElementById("locAr");
  var locRtl = document.getElementById("locRtl");
  locAr == null ? void 0 : locAr.addEventListener("change", () => {
    if (locAr.checked && locRtl && !locRtl.checked) locRtl.checked = true;
  });
  var _a12;
  (_a12 = document.getElementById("localizeBtn")) == null ? void 0 : _a12.addEventListener("click", () => {
    const languages = [];
    if (document.getElementById("locDe").checked) languages.push("de");
    if (document.getElementById("locZh").checked) languages.push("zh");
    if (document.getElementById("locTh").checked) languages.push("th");
    if (document.getElementById("locAr").checked) languages.push("ar");
    if (languages.length === 0) {
      updateLocalizeStatus("Select at least one language.");
      return;
    }
    const provider = (providerSelect == null ? void 0 : providerSelect.value) || "mymemory";
    const applyRtl = document.getElementById("locRtl").checked;
    postToPlugin("localize", { languages, applyRtl, provider });
    updateLocalizeStatus("Localizing \u2014 this may take a moment...");
  });
  var _a13;
  (_a13 = document.getElementById("saveKeyBtn")) == null ? void 0 : _a13.addEventListener("click", () => {
    const input = document.getElementById("apiKeyInput");
    const key = input.value.trim();
    if (!key) return;
    const provider = (providerSelect == null ? void 0 : providerSelect.value) || "";
    postToPlugin("save-api-key", { key, provider });
    input.value = "";
  });
  var _a14;
  (_a14 = document.getElementById("clearKeyBtn")) == null ? void 0 : _a14.addEventListener("click", () => {
    const provider = (providerSelect == null ? void 0 : providerSelect.value) || "";
    postToPlugin("clear-api-key", { provider });
  });
  function updateLocalizeStatus(message) {
    const el = document.getElementById("localizeStatus");
    if (el) el.innerHTML = `<span style="color:var(--text-secondary)">${esc(message)}</span>`;
  }
  var LANG_NAMES = { de: "German", zh: "Chinese", th: "Thai", ar: "Arabic" };
  function showLocalizeBridgePrompt(data) {
    var _a23;
    const langList = data.languages.map((l) => LANG_NAMES[l] || l).join(", ");
    const cmd = `Use /project:fill-localize to translate the frame "${data.frameName}" (${data.frameId}) into: ${langList}. ${data.sourceTexts.length} text strings to translate.${data.applyRtl ? " Apply RTL layout for Arabic." : ""}`;
    const el = document.getElementById("localizeStatus");
    if (el) {
      el.innerHTML = `
      <div style="padding:10px;background:var(--bg-secondary,#f5f5f5);border-radius:6px;border-left:3px solid var(--accent,#1473E6);">
        <div style="font-weight:600;font-size:11px;color:var(--accent,#1473E6);margin-bottom:4px;">Ready for translation &#x2714;</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">Paste this in Claude Code to translate via bridge:</div>
        <code id="localizeCmdText" style="display:block;background:var(--bg,#fff);padding:6px 8px;border-radius:4px;font-size:10px;border:1px solid var(--border,#e5e5e5);line-height:1.4;">${esc(cmd)}</code>
        <button class="btn btn-secondary" id="copyLocalizeCmd" style="margin-top:6px;padding:4px 8px;font-size:10px;width:100%;">Copy</button>
        <div style="font-size:10px;color:var(--text-tertiary,#999);margin-top:6px;">Requires Bridge connected + Claude Code open in this project</div>
      </div>`;
      (_a23 = document.getElementById("copyLocalizeCmd")) == null ? void 0 : _a23.addEventListener("click", async () => {
        await copyToClipboard(cmd);
        const btn = document.getElementById("copyLocalizeCmd");
        if (btn) {
          btn.textContent = "Copied!";
          setTimeout(() => {
            btn.textContent = "Copy";
          }, 1500);
        }
      });
    }
  }
  function updateApiKeyUi(hasKey, masked) {
    const status = document.getElementById("apiKeyStatus");
    if (status) status.textContent = hasKey ? `Saved: ${masked || "\u2022\u2022\u2022\u2022"}` : "No key saved.";
  }
  function updateA11yControls() {
    const placeholder = document.getElementById("a11yPlaceholder");
    const controls = document.getElementById("a11yControls");
    if (currentSelection.count === 0) {
      placeholder.style.display = "block";
      controls.style.display = "none";
      return;
    }
    placeholder.style.display = "none";
    controls.style.display = "block";
  }
  function updateA11yBridgeState() {
    const badge = document.getElementById("a11yBridgeBadge");
    const items = document.querySelectorAll(".a11y-item");
    const checkboxes = document.querySelectorAll('.a11y-item input[type="checkbox"]');
    const genBtn = document.getElementById("generateBluelineBtn");
    const plainBtn = document.getElementById("generateBluelinePlainBtn");
    if (genBtn) genBtn.disabled = false;
    if (plainBtn) plainBtn.disabled = false;
    if (bridgeConnected) {
      badge.textContent = "\u2713 bridge connected";
      badge.classList.add("connected");
      items.forEach((el) => el.classList.add("enabled"));
      checkboxes.forEach((cb) => cb.disabled = false);
    } else {
      badge.textContent = "connect bridge";
      badge.classList.remove("connected");
      items.forEach((el) => el.classList.remove("enabled"));
      checkboxes.forEach((cb) => {
        cb.disabled = true;
        cb.checked = false;
      });
    }
  }
  function updateA11yStatus(message) {
    const el = document.getElementById("a11yStatus");
    if (el) el.innerHTML = `<span style="color:var(--text-secondary)">${esc(message)}</span>`;
  }
  var autoFillTimer = null;
  var autoFillStartTime = 0;
  var autoFillMode = null;
  function startAutoFillTimer() {
    autoFillStartTime = Date.now();
    const el = document.getElementById("a11yStatus");
    if (!el) return;
    updateAutoFillTimerDisplay(el);
    autoFillTimer = setInterval(() => updateAutoFillTimerDisplay(el), 1e3);
  }
  function updateAutoFillTimerDisplay(el) {
    const elapsed = Math.floor((Date.now() - autoFillStartTime) / 1e3);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    const timeStr = `${min}:${sec.toString().padStart(2, "0")}`;
    el.innerHTML = `
    <div class="autofill-progress">
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="autofill-pulse"></span>
        <span style="font-weight:600;font-size:11px;">Auto-filling...</span>
        <span class="autofill-timer">${timeStr}</span>
      </div>
      <div style="font-size:10px;color:var(--text-tertiary,#999);margin-top:4px;">Claude is analyzing and filling cards</div>
    </div>`;
  }
  function stopAutoFillTimer(message, success) {
    if (autoFillTimer) {
      clearInterval(autoFillTimer);
      autoFillTimer = null;
    }
    const elapsed = Math.floor((Date.now() - autoFillStartTime) / 1e3);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    const timeStr = `${min}:${sec.toString().padStart(2, "0")}`;
    const el = document.getElementById("a11yStatus");
    if (el) {
      const color = success ? "var(--success,#2d9d78)" : "var(--warning,#e68619)";
      const icon = success ? "\u2714" : "\u2718";
      el.innerHTML = `
      <div class="autofill-progress" style="border-left-color:${color};">
        <div style="font-weight:600;font-size:11px;color:${color};">${icon} ${esc(message)}</div>
        <div style="font-size:10px;color:var(--text-tertiary,#999);margin-top:2px;">Completed in ${timeStr}</div>
      </div>`;
    }
  }
  function sendAutoFillRequest(plainLanguage) {
    if (!bridgeConnected || !bridgeWs) {
      updateA11yStatus("Connect Bridge first for auto-fill.");
      return;
    }
    bridgeWs.send(JSON.stringify({ type: "START_AUTO_FILL", data: { plainLanguage } }));
    startAutoFillTimer();
  }
  function handleAutoFillMessage(msg) {
    var _a23, _b;
    if (msg.type === "AUTO_FILL_STARTED") {
      return;
    }
    if (msg.type === "AUTO_FILL_COMPLETE") {
      const filled = ((_a23 = msg.data) == null ? void 0 : _a23.filledCards) || [];
      stopAutoFillTimer(`Filled ${filled.length} cards`, true);
      return;
    }
    if (msg.type === "AUTO_FILL_FAILED") {
      const error = ((_b = msg.data) == null ? void 0 : _b.error) || "Unknown error";
      stopAutoFillTimer(error, false);
      return;
    }
  }
  function showAiFillInstruction(mode, sections, frameName, plainLanguage) {
    var _a23;
    let cmd;
    const langNote = plainLanguage ? ' Use plain language: lead with questions like "What headings does this use?", explain WHY before giving technical detail, include "Why this matters" sections.' : "";
    const agentNote = " Call figma_get_blueline_data first \u2014 it returns structural data and orchestration instructions. Then call figma_get_knowledge for each agent group to fetch expert knowledge. Dispatch parallel agents, then call figma_render_blueline with all card JSON.";
    if (mode === "sections") {
      cmd = `Fill the blueline cards on the current Figma page.${agentNote}${langNote}`;
    } else {
      const categoryList = sections && sections.length > 0 ? sections.join(", ") : "all categories";
      const frame = frameName ? ` for "${frameName}"` : "";
      cmd = `Fill ONLY these blueline categories${frame}: ${categoryList}.${agentNote} Do not fill cards from other categories or previous generations.${langNote}`;
    }
    const el = document.getElementById("a11yStatus");
    if (el) {
      el.innerHTML = `
      <div style="padding:10px;background:var(--bg-secondary,#f5f5f5);border-radius:6px;border-left:3px solid var(--accent,#1473E6);">
        <div style="font-weight:600;font-size:11px;color:var(--accent,#1473E6);margin-bottom:4px;">Scaffolding done &#x2714;</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">To fill AI sections, paste this in Claude Code:</div>
        <code id="fillCmdText" style="display:block;background:var(--bg,#fff);padding:6px 8px;border-radius:4px;font-size:10px;border:1px solid var(--border,#e5e5e5);line-height:1.4;">${esc(cmd)}</code>
        <button class="btn btn-secondary" id="copyFillCmd" style="margin-top:6px;padding:4px 8px;font-size:10px;width:100%;">Copy</button>
        <div style="font-size:10px;color:var(--text-tertiary,#999);margin-top:6px;">Requires Bridge connected + Claude Code open in this project</div>
      </div>`;
      (_a23 = document.getElementById("copyFillCmd")) == null ? void 0 : _a23.addEventListener("click", async () => {
        await copyToClipboard(cmd);
        const btn = document.getElementById("copyFillCmd");
        if (btn) {
          btn.textContent = "Copied!";
          setTimeout(() => {
            btn.textContent = "Copy";
          }, 1500);
        }
      });
    }
  }
  function showPanelsFillInstruction(sections, frameName, sectionIds) {
    var _a23;
    const sectionList = sections.join(", ");
    const cmd = `Fill the blueline panels on the current Figma page for "${frameName}". Categories: ${sectionList}.

Call figma_get_blueline_data first \u2014 it returns structural data (including nodeIds for all elements) and orchestration instructions. Then call figma_get_knowledge for each agent group to fetch expert knowledge.

Dispatch parallel agents. IMPORTANT: Each agent must return items with these additional fields:
- nodeId (string|null): the node ID from the structural scan that this item refers to. Null if no element match.
- annotationType ("element"|"region"|"none"): "element" for specific UI elements (buttons, links, inputs), "region" for area-level concepts (landmarks, sections), "none" for abstract/page-level items.

Then call figma_render_blueline with mode: "panels" and all item JSON. The panels have already been scaffolded with cloned designs \u2014 the render call will place native Figma annotations on the clones.`;
    const el = document.getElementById("a11yStatus");
    if (el) {
      el.innerHTML = `
      <div style="padding:10px;background:var(--bg-secondary,#f5f5f5);border-radius:6px;border-left:3px solid var(--accent,#1473E6);">
        <div style="font-weight:600;font-size:11px;color:var(--accent,#1473E6);margin-bottom:4px;">Panels scaffolded &#x2714;</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">To fill annotations, paste this in your current Claude session:</div>
        <code id="panelsFillCmdText" style="display:block;background:var(--bg,#fff);padding:6px 8px;border-radius:4px;font-size:10px;border:1px solid var(--border,#e5e5e5);line-height:1.4;white-space:pre-wrap;">${esc(cmd)}</code>
        <button class="btn btn-secondary" id="copyPanelsFillCmd" style="margin-top:6px;padding:4px 8px;font-size:10px;width:100%;">Copy</button>
        <div style="font-size:10px;color:var(--text-tertiary,#999);margin-top:6px;">Paste into your current Claude Code session (Bridge must be connected)</div>
      </div>`;
      (_a23 = document.getElementById("copyPanelsFillCmd")) == null ? void 0 : _a23.addEventListener("click", async () => {
        await copyToClipboard(cmd);
        const btn = document.getElementById("copyPanelsFillCmd");
        if (btn) {
          btn.textContent = "Copied!";
          setTimeout(() => {
            btn.textContent = "Copy";
          }, 1500);
        }
      });
    }
  }
  var _a15;
  (_a15 = document.getElementById("a11yCheckAllAi")) == null ? void 0 : _a15.addEventListener("click", () => {
    if (!bridgeConnected) return;
    const aiIds = ["a11yFocusIndicators", "a11yFocusOrder", "a11yHeadings", "a11yLandmarksNav", "a11yNamesAlt", "a11yColorContrast", "a11yAriaKeyboard", "a11yTargetSize", "a11yPageSetup"];
    const boxes = aiIds.map((id) => document.getElementById(id)).filter(Boolean);
    const allChecked = boxes.every((cb) => cb.checked);
    boxes.forEach((cb) => {
      cb.checked = !allChecked;
    });
    const btn = document.getElementById("a11yCheckAllAi");
    if (btn) btn.textContent = allChecked ? "Check All" : "Uncheck All";
  });
  var _a16;
  (_a16 = document.getElementById("a11yCheckAllNotes")) == null ? void 0 : _a16.addEventListener("click", () => {
    if (!bridgeConnected) return;
    const noteIds = ["a11yForms", "a11yCarousel", "a11yDom", "a11yMotionMedia", "a11yScreenReader", "a11yReactNative", "a11yTvNote", "a11yGeneralNote"];
    const boxes = noteIds.map((id) => document.getElementById(id)).filter(Boolean);
    const allChecked = boxes.every((cb) => cb.checked);
    boxes.forEach((cb) => {
      cb.checked = !allChecked;
    });
    const btn = document.getElementById("a11yCheckAllNotes");
    if (btn) btn.textContent = allChecked ? "Check All" : "Uncheck All";
  });
  function getCheckedA11yCategories() {
    var _a23, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    const categories = [];
    if ((_a23 = document.getElementById("a11yFocusIndicators")) == null ? void 0 : _a23.checked) categories.push("focusIndicators");
    if ((_b = document.getElementById("a11yFocusOrder")) == null ? void 0 : _b.checked) categories.push("focusOrder");
    if ((_c = document.getElementById("a11yHeadings")) == null ? void 0 : _c.checked) categories.push("headings");
    if ((_d = document.getElementById("a11yLandmarksNav")) == null ? void 0 : _d.checked) {
      categories.push("landmarks", "skipNav", "consistentNav");
    }
    if ((_e = document.getElementById("a11yNamesAlt")) == null ? void 0 : _e.checked) {
      categories.push("names", "altText");
    }
    if ((_f = document.getElementById("a11yColorContrast")) == null ? void 0 : _f.checked) categories.push("colorContrast");
    if ((_g = document.getElementById("a11yAriaKeyboard")) == null ? void 0 : _g.checked) {
      categories.push("aria", "keyboard");
    }
    if ((_h = document.getElementById("a11yTargetSize")) == null ? void 0 : _h.checked) categories.push("targetSize");
    if ((_i = document.getElementById("a11yPageSetup")) == null ? void 0 : _i.checked) {
      categories.push("pageTitle", "language");
    }
    if ((_j = document.getElementById("a11yForms")) == null ? void 0 : _j.checked) categories.push("forms");
    if ((_k = document.getElementById("a11yCarousel")) == null ? void 0 : _k.checked) categories.push("autoRotation");
    if ((_l = document.getElementById("a11yDom")) == null ? void 0 : _l.checked) categories.push("dom");
    if ((_m = document.getElementById("a11yMotionMedia")) == null ? void 0 : _m.checked) {
      categories.push("reducedMotion", "media", "reflow");
    }
    if ((_n = document.getElementById("a11yScreenReader")) == null ? void 0 : _n.checked) {
      categories.push("voiceover", "talkback", "narrator");
    }
    if ((_o = document.getElementById("a11yReactNative")) == null ? void 0 : _o.checked) categories.push("reactNative");
    if ((_p = document.getElementById("a11yTvNote")) == null ? void 0 : _p.checked) categories.push("tvNote");
    if ((_q = document.getElementById("a11yGeneralNote")) == null ? void 0 : _q.checked) categories.push("generalNote");
    return categories;
  }
  function getCheckedPluginAnnotations() {
    var _a23, _b;
    const annotations = [];
    if ((_a23 = document.getElementById("a11yPluginFocusIndicators")) == null ? void 0 : _a23.checked) annotations.push("focusIndicators");
    if ((_b = document.getElementById("a11yPluginFocusOrder")) == null ? void 0 : _b.checked) annotations.push("focusOrder");
    return annotations;
  }
  function triggerBlueline(mode) {
    const pluginAnnotations = getCheckedPluginAnnotations();
    const categories = getCheckedA11yCategories();
    if (pluginAnnotations.length === 0 && categories.length === 0) {
      updateA11yStatus("Select at least one option.");
      return;
    }
    if (pluginAnnotations.length > 0) {
      postToPlugin("generate-plugin-annotations", { annotations: pluginAnnotations });
    }
    if (categories.length > 0) {
      if (!bridgeConnected) {
        updateA11yStatus("Connect Bridge for AI-assisted categories.");
        return;
      }
      const plainLanguage = mode === "auto-plain";
      autoFillMode = mode === "copy" ? "copy" : "auto";
      postToPlugin("generate-blueline", { categories, plainLanguage, autoFill: mode !== "copy" });
    } else if (pluginAnnotations.length > 0) {
      updateA11yStatus("Generating annotations...");
    }
  }
  var _a17;
  (_a17 = document.getElementById("generateBluelineBtn")) == null ? void 0 : _a17.addEventListener("click", () => triggerBlueline("auto"));
  var _a18;
  (_a18 = document.getElementById("generateBluelinePlainBtn")) == null ? void 0 : _a18.addEventListener("click", () => triggerBlueline("auto-plain"));
  var _a19;
  (_a19 = document.getElementById("copyFillCmdBtn")) == null ? void 0 : _a19.addEventListener("click", () => triggerBlueline("copy"));
  function triggerBluelinePanels() {
    const pluginAnnotations = getCheckedPluginAnnotations();
    const categories = getCheckedA11yCategories();
    if (pluginAnnotations.length === 0 && categories.length === 0) {
      updateA11yStatus("Select at least one option.");
      return;
    }
    if (pluginAnnotations.length > 0) {
      postToPlugin("generate-plugin-annotations", { annotations: pluginAnnotations });
    }
    if (categories.length > 0) {
      if (!bridgeConnected) {
        updateA11yStatus("Connect Bridge for AI-assisted categories.");
        return;
      }
      postToPlugin("generate-blueline-panels", { categories });
    } else if (pluginAnnotations.length > 0) {
      updateA11yStatus("Generating annotations...");
    }
  }
  var _a20;
  (_a20 = document.getElementById("generateBluelinePanelsBtn")) == null ? void 0 : _a20.addEventListener("click", () => triggerBluelinePanels());
  var bridgeConnected = false;
  var bridgeWs = null;
  var bridgeWsPort = null;
  var bridgeKeepaliveTimer = null;
  var bridgeReconnectTimer = null;
  var bridgeReconnectAttempts = 0;
  var bridgeUserDisconnected = false;
  var bridgeSessionNonce = null;
  var bridgeNonceSent = false;
  function generateNonce() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  var BRIDGE_MAX_RECONNECT = 20;
  var BRIDGE_RECONNECT_BASE_MS = 2e3;
  var bridgePendingRequests = /* @__PURE__ */ new Map();
  var bridgeRequestCounter = 0;
  function sendBridgeCommand(method, params, timeoutMs = 15e3) {
    return new Promise((resolve, reject) => {
      const requestId = method.toLowerCase() + "_" + ++bridgeRequestCounter + "_" + Date.now();
      const timeoutId = setTimeout(() => {
        if (bridgePendingRequests.has(requestId)) {
          bridgePendingRequests.delete(requestId);
          reject(new Error(method + " timed out after " + timeoutMs + "ms"));
        }
      }, timeoutMs);
      bridgePendingRequests.set(requestId, { resolve, reject, timeoutId });
      postToPlugin("bridge:command", { requestId, method, params });
    });
  }
  function handleSetImageFill(params) {
    const binaryStr = atob(params.imageData);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
    return sendBridgeCommand("SET_IMAGE_FILL", {
      nodeIds: Array.isArray(params.nodeIds) ? params.nodeIds : params.nodeId ? [params.nodeId] : [],
      imageBytes: Array.from(bytes),
      scaleMode: params.scaleMode || "FILL"
    }, 6e4);
  }
  var BRIDGE_METHOD_TIMEOUTS = {
    "EXECUTE_CODE": 7e3,
    "CAPTURE_SCREENSHOT": 3e4,
    "GET_LOCAL_COMPONENTS": 3e5,
    "REFRESH_VARIABLES": 3e5,
    "GET_VARIABLES_DATA": 3e5,
    "LINT_DESIGN": 12e4,
    "AUDIT_COMPONENT_ACCESSIBILITY": 12e4,
    "SET_IMAGE_FILL": 6e4,
    "INSTANTIATE_COMPONENT": 3e4
  };
  function bridgeHandleMethod(method, params) {
    if (method === "SET_IMAGE_FILL") return handleSetImageFill(params);
    if (method === "EXECUTE_CODE") {
      const timeout2 = (params.timeout || 5e3) + 2e3;
      return sendBridgeCommand(method, params, timeout2);
    }
    const timeout = BRIDGE_METHOD_TIMEOUTS[method] || 15e3;
    return sendBridgeCommand(method, params, timeout);
  }
  function updateBridgeUi() {
    const disconnected = document.getElementById("bridgeDisconnected");
    const connected = document.getElementById("bridgeConnected");
    if (bridgeConnected) {
      disconnected.style.display = "none";
      connected.style.display = "block";
    } else {
      disconnected.style.display = "block";
      connected.style.display = "none";
    }
    updateA11yBridgeState();
  }
  function appendBridgeLog(message) {
    const log = document.getElementById("bridgeLog");
    if (!log) return;
    const line = document.createElement("div");
    line.textContent = `\u2713 ${message}`;
    log.appendChild(line);
    while (log.children.length > 80) log.removeChild(log.firstChild);
    log.scrollTop = log.scrollHeight;
  }
  function bridgeStartKeepalive() {
    bridgeStopKeepalive();
    bridgeKeepaliveTimer = setInterval(() => {
      if (bridgeWs && bridgeWs.readyState === 1) {
        try {
          bridgeWs.send(JSON.stringify({ type: "PING" }));
        } catch (e) {
        }
      }
    }, 15e3);
  }
  function bridgeStopKeepalive() {
    if (bridgeKeepaliveTimer) {
      clearInterval(bridgeKeepaliveTimer);
      bridgeKeepaliveTimer = null;
    }
  }
  function bridgeConnect() {
    bridgeUserDisconnected = false;
    if (bridgeReconnectTimer) {
      clearTimeout(bridgeReconnectTimer);
      bridgeReconnectTimer = null;
    }
    const btn = document.getElementById("bridgeConnectBtn");
    if (btn) {
      btn.textContent = "Connecting...";
      btn.disabled = true;
    }
    const WS_PORTS = [9220, 9221, 9222, 9223, 9224, 9225, 9226, 9227, 9228, 9229, 9230, 9231, 9232];
    let found = false;
    let pending = WS_PORTS.length;
    WS_PORTS.forEach((port) => {
      if (found) return;
      try {
        const testWs = new WebSocket("ws://localhost:" + port);
        const timeout = setTimeout(() => {
          if (testWs.readyState !== 1) testWs.close();
        }, 3e3);
        testWs.onopen = () => {
          clearTimeout(timeout);
          if (found) {
            testWs.close();
            return;
          }
          found = true;
          bridgeWs = testWs;
          bridgeWsPort = port;
          bridgeConnected = true;
          bridgeReconnectAttempts = 0;
          updateBridgeUi();
          appendBridgeLog("WebSocket connected (port " + port + ")");
          attachBridgeWsHandlers(testWs, port);
          initBridgeConnection(testWs);
          bridgeStartKeepalive();
        };
        testWs.onerror = () => {
          clearTimeout(timeout);
          pending--;
          if (pending <= 0 && !found) bridgeConnectFailed();
        };
        testWs.onclose = () => {
          clearTimeout(timeout);
          if (!found) {
            pending--;
            if (pending <= 0) bridgeConnectFailed();
          }
        };
      } catch (e) {
        pending--;
        if (pending <= 0 && !found) bridgeConnectFailed();
      }
    });
  }
  function bridgeConnectFailed() {
    const btn = document.getElementById("bridgeConnectBtn");
    if (btn) {
      btn.textContent = "Connect";
      btn.disabled = false;
    }
    const info = document.querySelector("#bridgeDisconnected p:last-child");
    if (info) {
      info.textContent = "No figma-console MCP server found \u2014 start Claude Code first";
      info.style.color = "#e34850";
    }
  }
  function bridgeScheduleReconnect(port) {
    if (bridgeUserDisconnected) return;
    if (bridgeReconnectAttempts >= BRIDGE_MAX_RECONNECT) {
      appendBridgeLog("Max reconnect attempts reached");
      return;
    }
    bridgeReconnectAttempts++;
    const delay = Math.min(BRIDGE_RECONNECT_BASE_MS * Math.pow(1.5, bridgeReconnectAttempts - 1), 3e4);
    appendBridgeLog("Reconnecting in " + Math.round(delay / 1e3) + "s (attempt " + bridgeReconnectAttempts + ")...");
    bridgeReconnectTimer = setTimeout(() => {
      if (bridgeUserDisconnected) return;
      if (port) {
        bridgeReconnectToPort(port);
      } else {
        bridgeConnect();
      }
    }, delay);
  }
  function bridgeReconnectToPort(port) {
    try {
      const testWs = new WebSocket("ws://localhost:" + port);
      const timeout = setTimeout(() => {
        if (testWs.readyState !== 1) testWs.close();
      }, 3e3);
      testWs.onopen = () => {
        clearTimeout(timeout);
        bridgeWs = testWs;
        bridgeWsPort = port;
        bridgeConnected = true;
        bridgeReconnectAttempts = 0;
        updateBridgeUi();
        appendBridgeLog("Reconnected (port " + port + ")");
        attachBridgeWsHandlers(testWs, port);
        initBridgeConnection(testWs);
        bridgeStartKeepalive();
      };
      testWs.onerror = () => {
        clearTimeout(timeout);
      };
      testWs.onclose = () => {
        clearTimeout(timeout);
        if (!bridgeConnected && !bridgeUserDisconnected) {
          bridgeConnect();
        }
      };
    } catch (e) {
      if (!bridgeUserDisconnected) bridgeConnect();
    }
  }
  function initBridgeConnection(ws) {
    const nonce = generateNonce();
    bridgeSessionNonce = null;
    bridgeNonceSent = false;
    sendBridgeCommand("GET_FILE_INFO", {}).then((result) => {
      if (ws.readyState !== 1 || !result) return;
      const info = result.fileInfo || result;
      if (!info.fileKey) {
        info.fileKey = "local-" + Date.now();
      }
      info.pluginVersion = "1.0.0";
      info.sessionNonce = nonce;
      ws.send(JSON.stringify({ type: "FILE_INFO", data: info }));
      bridgeSessionNonce = nonce;
      bridgeNonceSent = true;
      appendBridgeLog("File info sent: " + (info.fileName || "unknown") + " (key: " + (info.fileKey || "?") + ")");
    }).catch(() => {
    });
    sendBridgeCommand("REFRESH_VARIABLES", {}, 3e4).then((result) => {
      var _a23, _b;
      if (ws.readyState !== 1 || !result) return;
      ws.send(JSON.stringify({ type: "VARIABLES_DATA", data: result.data }));
      appendBridgeLog("Variables synced: " + (((_b = (_a23 = result.data) == null ? void 0 : _a23.variables) == null ? void 0 : _b.length) || 0) + " vars");
    }).catch(() => {
    });
  }
  function attachBridgeWsHandlers(ws, port) {
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "SERVER_HELLO" && message.data) {
          appendBridgeLog("Server v" + (message.data.serverVersion || "?") + " on port " + port);
          return;
        }
        if (message.type === "AUTO_FILL_STARTED" || message.type === "AUTO_FILL_COMPLETE" || message.type === "AUTO_FILL_FAILED") {
          handleAutoFillMessage(message);
          return;
        }
        if (!message.id || !message.method) return;
        if (message.method === "EXECUTE_CODE" && bridgeNonceSent) {
          if (!bridgeSessionNonce || (message.params || {}).sessionNonce !== bridgeSessionNonce) {
            if (ws.readyState === 1) {
              ws.send(JSON.stringify({ id: message.id, error: "Unauthorized: missing or invalid sessionNonce" }));
            }
            appendBridgeLog("\u26A0 EXECUTE_CODE rejected \u2014 invalid nonce");
            return;
          }
        }
        appendBridgeLog("\u2190 " + message.method);
        Promise.resolve(bridgeHandleMethod(message.method, message.params || {})).then((result) => {
          if (ws.readyState === 1) {
            ws.send(JSON.stringify({ id: message.id, result }));
            appendBridgeLog("\u2192 " + message.method + " OK");
          }
        }).catch((err) => {
          if (ws.readyState === 1) {
            ws.send(JSON.stringify({ id: message.id, error: err.message || String(err) }));
            appendBridgeLog("\u2192 " + message.method + " ERR: " + err.message);
          }
        });
      } catch (e) {
      }
    };
    ws.onclose = (event) => {
      bridgeStopKeepalive();
      bridgeWs = null;
      bridgeSessionNonce = null;
      bridgeNonceSent = false;
      bridgeConnected = false;
      updateBridgeUi();
      const wasReplaced = event.code === 1e3 && (event.reason === "Replaced by new connection" || event.reason === "Replaced by same file reconnection");
      if (wasReplaced) {
        appendBridgeLog("Replaced by newer connection \u2014 stopping");
        return;
      }
      appendBridgeLog("Disconnected (code " + event.code + ")");
      if (!bridgeUserDisconnected) {
        bridgeScheduleReconnect(port);
      }
    };
    ws.onerror = () => {
    };
  }
  function bridgeDisconnect() {
    bridgeUserDisconnected = true;
    bridgeStopKeepalive();
    if (bridgeReconnectTimer) {
      clearTimeout(bridgeReconnectTimer);
      bridgeReconnectTimer = null;
    }
    if (bridgeWs) {
      try {
        bridgeWs.close();
      } catch (e) {
      }
      bridgeWs = null;
      bridgeWsPort = null;
    }
    bridgeConnected = false;
    bridgeReconnectAttempts = 0;
    updateBridgeUi();
    const btn = document.getElementById("bridgeConnectBtn");
    if (btn) {
      btn.textContent = "Connect";
      btn.disabled = false;
    }
    const info = document.querySelector("#bridgeDisconnected p:last-child");
    if (info) {
      info.textContent = "Connection persists across all tabs";
      info.style.color = "";
    }
  }
  var _a21;
  (_a21 = document.getElementById("bridgeConnectBtn")) == null ? void 0 : _a21.addEventListener("click", () => bridgeConnect());
  var _a22;
  (_a22 = document.getElementById("bridgeDisconnectBtn")) == null ? void 0 : _a22.addEventListener("click", () => bridgeDisconnect());
  postToPlugin("ui-ready");
})();
