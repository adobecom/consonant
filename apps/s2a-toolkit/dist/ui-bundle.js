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
  function postToPlugin(type, payload) {
    parent.postMessage({ pluginMessage: __spreadValues({ type }, payload) }, "https://www.figma.com");
  }
  var USAGE_KEY = "s2a:usage";
  function loadUsage() {
    try {
      const raw = JSON.parse(localStorage.getItem(USAGE_KEY) || "{}");
      return {
        events: Array.isArray(raw.events) ? raw.events : [],
        totals: raw.totals && typeof raw.totals === "object" ? raw.totals : {},
        lastUsed: raw.lastUsed && typeof raw.lastUsed === "object" ? raw.lastUsed : {}
      };
    } catch (e) {
      return { events: [], totals: {}, lastUsed: {} };
    }
  }
  function saveUsage(store) {
    try {
      localStorage.setItem(USAGE_KEY, JSON.stringify(store));
    } catch (e) {
    }
  }
  function logEvent(featureId) {
    const store = loadUsage();
    store.events.push({ featureId, timestamp: Date.now() });
    if (store.events.length > 500) store.events = store.events.slice(-500);
    store.totals[featureId] = (store.totals[featureId] || 0) + 1;
    store.lastUsed[featureId] = Date.now();
    saveUsage(store);
  }
  function heatOf(featureId) {
    const { events } = loadUsage();
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 3600 * 1e3;
    const monthAgo = now - 30 * 24 * 3600 * 1e3;
    if (events.some((e) => e.featureId === featureId && e.timestamp >= weekAgo)) return "hot";
    if (events.some((e) => e.featureId === featureId && e.timestamp >= monthAgo)) return "warm";
    return "cold";
  }
  function recentlyUsed(n = 5) {
    const { lastUsed } = loadUsage();
    return Object.entries(lastUsed).sort((a, b) => b[1] - a[1]).slice(0, n).map(([id]) => FEATURES.find((f) => f.id === id)).filter(Boolean);
  }
  var annotateNodeId = null;
  var selectSetId = null;
  var specSetId = null;
  var versionSetId = null;
  var docsSetId = null;
  var variablesCache = null;
  var githubSettings = null;
  var bridgeConnected = false;
  var bridgeWs = null;
  var bridgeWsPort = null;
  var bridgeKeepaliveTimer = null;
  var bridgeReconnectTimer = null;
  var bridgeReconnectAttempts = 0;
  var bridgeUserDisconnected = false;
  var BRIDGE_PREFERRED_PORT_KEY = "s2a:bridge:port";
  var bridgeRespondingPorts = [];
  var bridgeExecInFlight = 0;
  var bridgeExecStartTime = null;
  var bridgeExecTimer = null;
  var activePanel = "home";
  var settingsOpen = false;
  var isMini = false;
  var popoverOpen = false;
  var connectedFiles = [];
  var pendingWsRequests = /* @__PURE__ */ new Map();
  var wsRequestCounter = 0;
  var pendingRequests = /* @__PURE__ */ new Map();
  var requestCounter = 0;
  var panelEls = {
    home: document.getElementById("homePanel"),
    tokens: document.getElementById("tokensPanel"),
    tools: document.getElementById("toolsPanel"),
    files: document.getElementById("filesPanel"),
    settings: document.getElementById("settingsPanel")
  };
  function switchPanel(panel) {
    if (panel !== "settings") {
      settingsOpen = false;
      settingsBtn == null ? void 0 : settingsBtn.classList.remove("active");
    }
    activePanel = panel;
    Object.entries(panelEls).forEach(([key, el]) => {
      el.classList.toggle("active", key === panel);
    });
    document.querySelectorAll(".tab[data-panel]").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.panel === panel);
    });
    if (panel === "settings") {
      postToPlugin("get-settings");
      postToPlugin("get-figma-token");
    }
    if (panel === "home") renderHomeView();
    if (panel === "files") refreshConnectedFiles();
  }
  document.querySelectorAll(".tab[data-panel]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const p = tab.dataset.panel;
      if (p) switchPanel(p);
    });
  });
  var settingsBtn = document.getElementById("settingsBtn");
  settingsBtn == null ? void 0 : settingsBtn.addEventListener("click", () => {
    if (settingsOpen) {
      settingsOpen = false;
      settingsBtn.classList.remove("active");
      switchPanel(activePanel === "settings" ? "home" : activePanel);
    } else {
      settingsOpen = true;
      settingsBtn.classList.add("active");
      switchPanel("settings");
    }
  });
  var FEATURES = [
    // Tokens
    {
      id: "tokens:refresh",
      name: "Refresh variables",
      description: "Re-fetch all Figma variables from the current file",
      category: "Tokens",
      uiAction: () => {
        var _a22;
        return (_a22 = document.getElementById("varRefreshBtn")) == null ? void 0 : _a22.click();
      }
    },
    {
      id: "tokens:export-local",
      name: "Export tokens locally",
      description: "Push token JSON to local dev server on port 9300",
      category: "Tokens",
      uiAction: () => {
        var _a22;
        return (_a22 = document.getElementById("varExportLocalBtn")) == null ? void 0 : _a22.click();
      }
    },
    {
      id: "tokens:export-github",
      name: "Push tokens to GitHub",
      description: "Commit token JSON to your configured repo",
      category: "Tokens",
      uiAction: () => {
        var _a22;
        return (_a22 = document.getElementById("varExportGithubBtn")) == null ? void 0 : _a22.click();
      }
    },
    {
      id: "tokens:doc-gen",
      name: "Generate token docs",
      description: "Build a Figma doc sheet for a token group",
      category: "Tokens",
      uiAction: () => switchPanel("tokens")
    },
    // Tools
    {
      id: "tools:copy-link",
      name: "Copy Figma link",
      description: "Copy a shareable link for the selected node(s)",
      category: "Tools",
      uiAction: () => {
        var _a22;
        return (_a22 = document.getElementById("copyNodeBtn")) == null ? void 0 : _a22.click();
      }
    },
    {
      id: "tools:format-section",
      name: "Format section",
      description: "Reflow the selected section with consistent spacing",
      category: "Tools",
      pluginAction: "format-section"
    },
    {
      id: "tools:select-filter",
      name: "Filter variant set",
      description: "Select a subset of variants by axis value",
      category: "Tools",
      uiAction: () => switchPanel("tools")
    },
    {
      id: "tools:annotate",
      name: "Annotate selection",
      description: "Add token and a11y annotations to the selected node",
      category: "Tools",
      uiAction: () => switchPanel("tools")
    },
    {
      id: "tools:annotate-clear",
      name: "Clear annotations",
      description: "Remove all annotation layers from selection",
      category: "Tools",
      uiAction: () => {
        if (annotateNodeId) postToPlugin("annotate:clear", { nodeId: annotateNodeId });
      }
    },
    {
      id: "tools:spec",
      name: "Generate spec sheet",
      description: "Scaffold a Figma spec doc for a component set",
      category: "Tools",
      uiAction: () => switchPanel("tools")
    },
    {
      id: "tools:version",
      name: "Version component",
      description: "Bump (patch/minor/major) or deprecate the selected component",
      category: "Tools",
      uiAction: () => switchPanel("tools")
    },
    {
      id: "tools:docs",
      name: "Generate component docs",
      description: "Scaffold the bento doc for the selected component set",
      category: "Tools",
      uiAction: () => switchPanel("tools")
    },
    // Bridge
    {
      id: "bridge:connect",
      name: "Connect Bridge",
      description: "Open WebSocket connection to Claude Code",
      category: "Bridge",
      uiAction: () => bridgeConnect()
    },
    {
      id: "bridge:disconnect",
      name: "Disconnect Bridge",
      description: "Close the Bridge WebSocket connection",
      category: "Bridge",
      uiAction: () => bridgeDisconnect()
    }
  ];
  var QUICK_ACTION_IDS = [
    "tools:copy-link",
    "tokens:refresh",
    "tools:annotate",
    "tools:select-filter",
    "tokens:export-local",
    "tools:spec"
  ];
  function fireFeature(feat) {
    var _a22;
    logEvent(feat.id);
    closePalette();
    if (feat.uiAction) {
      feat.uiAction();
    } else if (feat.pluginAction) {
      postToPlugin(feat.pluginAction, (_a22 = feat.pluginPayload) != null ? _a22 : {});
    }
    if (activePanel === "home") renderHomeView();
  }
  function badgeHtml(heat) {
    if (heat === "cold") return "";
    return `<span class="badge badge-${heat}">${heat}</span>`;
  }
  function actionRowsHtml(feats) {
    return feats.map(
      (f) => `<button class="action-row" data-id="${esc(f.id)}">${esc(f.name)}${badgeHtml(heatOf(f.id))}</button>`
    ).join("");
  }
  function bindActionList(el) {
    el.querySelectorAll(".action-row").forEach((row) => {
      row.addEventListener("click", () => {
        const feat = FEATURES.find((f) => f.id === row.dataset.id);
        if (feat) fireFeature(feat);
      });
    });
  }
  function renderHomeView() {
    const quickEl = document.getElementById("homeQuickActions");
    const recentsEl = document.getElementById("homeRecents");
    const recentsSection = document.getElementById("homeRecentsSection");
    const quickFeats = QUICK_ACTION_IDS.map((id) => FEATURES.find((f) => f.id === id)).filter(Boolean);
    quickEl.innerHTML = actionRowsHtml(quickFeats);
    bindActionList(quickEl);
    const recents = recentlyUsed(5);
    if (recents.length === 0) {
      recentsSection.style.display = "none";
    } else {
      recentsSection.style.display = "block";
      recentsEl.innerHTML = actionRowsHtml(recents);
      bindActionList(recentsEl);
    }
  }
  var paletteOpen = false;
  var paletteSelected = 0;
  var paletteFiltered = [];
  var paletteOverlay = document.getElementById("paletteOverlay");
  var paletteInput = document.getElementById("paletteInput");
  var paletteList = document.getElementById("paletteList");
  function openPalette() {
    paletteOpen = true;
    paletteInput.value = "";
    filterPalette("");
    paletteOverlay.classList.add("open");
    requestAnimationFrame(() => paletteInput.focus());
  }
  function closePalette() {
    paletteOpen = false;
    paletteOverlay.classList.remove("open");
  }
  function filterPalette(q) {
    const lower = q.toLowerCase();
    paletteFiltered = q ? FEATURES.filter(
      (f) => f.name.toLowerCase().includes(lower) || f.description.toLowerCase().includes(lower) || f.category.toLowerCase().includes(lower) || f.id.toLowerCase().includes(lower)
    ) : FEATURES;
    paletteSelected = 0;
    renderPalette();
  }
  function renderPalette() {
    const cats = [...new Set(paletteFiltered.map((f) => f.category))];
    let globalIdx = 0;
    paletteList.innerHTML = cats.map((cat) => {
      const items = paletteFiltered.filter((f) => f.category === cat);
      const rows = items.map((f) => {
        const idx = globalIdx++;
        const heat = heatOf(f.id);
        return `<button class="palette-row" data-id="${esc(f.id)}" data-idx="${idx}" data-selected="${idx === paletteSelected}">
        <span class="palette-name">${esc(f.name)}</span>${badgeHtml(heat)}
        <span class="palette-desc">${esc(f.description)}</span>
      </button>`;
      }).join("");
      return `<div class="palette-group"><div class="palette-group-label">${esc(cat)}</div>${rows}</div>`;
    }).join("");
    paletteList.querySelectorAll(".palette-row").forEach((row) => {
      row.addEventListener("click", () => {
        const feat = FEATURES.find((f) => f.id === row.dataset.id);
        if (feat) fireFeature(feat);
      });
      row.addEventListener("mouseenter", () => {
        paletteSelected = Number(row.dataset.idx);
        paletteList.querySelectorAll(".palette-row").forEach(
          (r, i) => r.setAttribute("data-selected", String(i === paletteSelected))
        );
      });
    });
  }
  paletteInput.addEventListener("input", () => filterPalette(paletteInput.value));
  paletteInput.addEventListener("keydown", (e) => {
    var _a22, _b;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      paletteSelected = Math.min(paletteSelected + 1, paletteFiltered.length - 1);
      renderPalette();
      (_a22 = paletteList.querySelector(`[data-selected="true"]`)) == null ? void 0 : _a22.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      paletteSelected = Math.max(paletteSelected - 1, 0);
      renderPalette();
      (_b = paletteList.querySelector(`[data-selected="true"]`)) == null ? void 0 : _b.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      const feat = paletteFiltered[paletteSelected];
      if (feat) fireFeature(feat);
    } else if (e.key === "Escape") {
      closePalette();
    }
  });
  paletteOverlay.addEventListener("click", (e) => {
    if (e.target === paletteOverlay) closePalette();
  });
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      paletteOpen ? closePalette() : openPalette();
    }
    if (e.key === "Escape" && paletteOpen) closePalette();
  });
  var _a;
  (_a = document.getElementById("paletteHintBtn")) == null ? void 0 : _a.addEventListener("click", () => openPalette());
  var app = document.getElementById("app");
  var toggleMiniBtn = document.getElementById("toggleMiniBtn");
  toggleMiniBtn.addEventListener("click", () => {
    isMini = !isMini;
    app.classList.toggle("mini", isMini);
    postToPlugin("resize-for-view", { width: 320, height: isMini ? 40 : 460 });
    if (isMini && popoverOpen) closePopover();
  });
  var copyNodeBtn = document.getElementById("copyNodeBtn");
  var headerSelName = document.getElementById("headerSelName");
  var _copyFileKey = null;
  var _copyFileName = null;
  var _copyAllNodes = [];
  function copyToClipboard(text) {
    var _a22;
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {
    }
    document.body.removeChild(ta);
    try {
      (_a22 = navigator.clipboard) == null ? void 0 : _a22.writeText(text).catch(() => {
      });
    } catch (e) {
    }
  }
  function updateCopyBtn(sel, fileKey, fileName, allNodes) {
    _copyFileKey = fileKey;
    _copyFileName = fileName != null ? fileName : null;
    _copyAllNodes = allNodes != null ? allNodes : sel ? [{ id: sel.id, name: sel.name }] : [];
    const count = _copyAllNodes.length;
    const hasNode = !!(sel && fileKey);
    copyNodeBtn.classList.toggle("hidden", !hasNode);
    if (count > 1) {
      copyNodeBtn.title = `Copy ${count} Figma links`;
      copyNodeBtn.setAttribute("aria-label", `Copy ${count} Figma links`);
    } else {
      copyNodeBtn.title = "Copy Figma link";
      copyNodeBtn.setAttribute("aria-label", "Copy Figma link");
    }
    if (sel) {
      headerSelName.textContent = count > 1 ? `${count} selected` : sel.name;
      headerSelName.classList.add("has-sel");
    } else {
      headerSelName.textContent = "\u2014";
      headerSelName.classList.remove("has-sel");
    }
    if (activePanel === "files") updateActiveFileCard();
  }
  var _copyResetTimer = null;
  copyNodeBtn.addEventListener("click", () => {
    if (!_copyFileKey || _copyAllNodes.length === 0) return;
    const slug = (_copyFileName || "file").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const urls = _copyAllNodes.map((n) => {
      const nid = n.id.replace(":", "-");
      return `https://www.figma.com/design/${_copyFileKey}/${slug}?node-id=${nid}`;
    });
    if (_copyResetTimer) clearTimeout(_copyResetTimer);
    copyNodeBtn.classList.add("copied");
    _copyResetTimer = setTimeout(() => {
      copyNodeBtn.classList.remove("copied");
      _copyResetTimer = null;
    }, 1500);
    copyToClipboard(urls.join("\n"));
    const msg = urls.length > 1 ? `Copied ${urls.length} links` : "Copied link";
    postToPlugin("notify", { message: msg });
  });
  var sectionBar = document.getElementById("sectionBar");
  var sectionBarName = document.getElementById("sectionBarName");
  var formatSectionBtn = document.getElementById("formatSectionBtn");
  function updateSectionBar(hasSection, sectionCount, firstName) {
    sectionBar.classList.toggle("hidden", !hasSection);
    if (hasSection) {
      sectionBarName.textContent = sectionCount > 1 ? `${sectionCount} sections` : firstName;
    }
  }
  formatSectionBtn.addEventListener("click", () => {
    formatSectionBtn.disabled = true;
    formatSectionBtn.textContent = "\u2026";
    postToPlugin("format-section");
  });
  var BRIDGE_RECONNECT_BASE_MS = 2e3;
  var BRIDGE_RECONNECT_MAX_MS = 3e4;
  var WS_PORTS = [9223, 9224, 9225, 9226, 9227, 9228, 9230, 9231, 9232];
  var bridgeDot = document.getElementById("bridgeDot");
  var bridgeDotMini = document.getElementById("bridgeDotMini");
  var popoverDot = document.getElementById("popoverDot");
  var bridgePortLabel = document.getElementById("bridgePortLabel");
  var bridgePillLabel = document.getElementById("bridgePillLabel");
  var bridgeToggleBtn = document.getElementById("bridgeToggleBtn");
  var bridgePopover = document.getElementById("bridgePopover");
  var bridgeTabBtn = document.getElementById("bridgeTabBtn");
  var bridgeMiniBtn = document.getElementById("bridgeMiniBtn");
  var bridgeMultiServerWarn = document.getElementById("bridgeMultiServerWarn");
  var bridgeMultiServerMsg = document.getElementById("bridgeMultiServerMsg");
  var bridgeMultiServerCopyBtn = document.getElementById("bridgeMultiServerCopy");
  var bridgeExecProgress = document.getElementById("bridgeExecProgress");
  var bridgeExecLabelEl = document.getElementById("bridgeExecLabel");
  function sendBridgeCommand(method, params = {}, timeoutMs = 15e3) {
    return new Promise((resolve, reject) => {
      const requestId = method.toLowerCase() + "_" + ++requestCounter + "_" + Date.now();
      const isExec = method === "EXECUTE_CODE";
      if (isExec) startExecProgress();
      const timeoutId = setTimeout(() => {
        if (pendingRequests.has(requestId)) {
          pendingRequests.delete(requestId);
          if (isExec) stopExecProgress();
          reject(new Error(method + " timed out after " + timeoutMs + "ms"));
        }
      }, timeoutMs);
      pendingRequests.set(requestId, {
        resolve: (v) => {
          if (isExec) stopExecProgress();
          resolve(v);
        },
        reject: (e) => {
          if (isExec) stopExecProgress();
          reject(e);
        },
        timeoutId
      });
      postToPlugin("bridge:command", { requestId, method, params });
    });
  }
  function startExecProgress() {
    bridgeExecInFlight++;
    if (bridgeExecInFlight === 1) {
      bridgeExecStartTime = Date.now();
      if (bridgeExecTimer) clearInterval(bridgeExecTimer);
      bridgeExecProgress.style.display = "flex";
      bridgeExecLabelEl.textContent = "Running\u2026";
      bridgeExecTimer = setInterval(() => {
        if (bridgeExecStartTime === null) return;
        const elapsed = Math.floor((Date.now() - bridgeExecStartTime) / 1e3);
        bridgeExecLabelEl.textContent = "Running\u2026 " + elapsed + "s";
      }, 1e3);
    }
  }
  function stopExecProgress() {
    bridgeExecInFlight = Math.max(0, bridgeExecInFlight - 1);
    if (bridgeExecInFlight === 0) {
      if (bridgeExecTimer) {
        clearInterval(bridgeExecTimer);
        bridgeExecTimer = null;
      }
      bridgeExecStartTime = null;
      bridgeExecProgress.style.display = "none";
    }
  }
  function showMultiServerWarn(ports) {
    const killCmd = "kill $(lsof -ti :" + ports.join(" :") + ")";
    bridgeMultiServerMsg.textContent = "\u26A0 " + ports.length + " MCP servers running \u2014 port conflict";
    bridgeMultiServerWarn.dataset.kill = killCmd;
    bridgeMultiServerWarn.style.display = "block";
  }
  function hideMultiServerWarn() {
    bridgeMultiServerWarn.style.display = "none";
    bridgeRespondingPorts = [];
  }
  function openPopover() {
    popoverOpen = true;
    bridgePopover.classList.add("open");
  }
  function closePopover() {
    popoverOpen = false;
    bridgePopover.classList.remove("open");
  }
  bridgeTabBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    popoverOpen ? closePopover() : openPopover();
  });
  bridgeMiniBtn == null ? void 0 : bridgeMiniBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    popoverOpen ? closePopover() : openPopover();
  });
  document.addEventListener("click", () => {
    if (popoverOpen) closePopover();
  });
  bridgePopover.addEventListener("click", (e) => e.stopPropagation());
  bridgeToggleBtn.addEventListener("click", () => {
    if (bridgeConnected) bridgeDisconnect();
    else bridgeConnect();
  });
  bridgeMultiServerCopyBtn == null ? void 0 : bridgeMultiServerCopyBtn.addEventListener("click", () => {
    const cmd = (bridgeMultiServerWarn == null ? void 0 : bridgeMultiServerWarn.dataset.kill) || "";
    if (!cmd) return;
    copyToClipboard(cmd);
    bridgeMultiServerCopyBtn.textContent = "Copied!";
    setTimeout(() => {
      bridgeMultiServerCopyBtn.textContent = "Copy fix";
    }, 1500);
  });
  function setAllDots(on) {
    [bridgeDot, bridgeDotMini, popoverDot].forEach((el) => el == null ? void 0 : el.classList.toggle("on", on));
  }
  function updateBridgeUi() {
    if (bridgeConnected) {
      setAllDots(true);
      bridgePortLabel.textContent = "Port " + bridgeWsPort;
      bridgeToggleBtn.textContent = "Disconnect";
      bridgeToggleBtn.className = "btn btn-ghost";
      if (bridgePillLabel) bridgePillLabel.textContent = "Connected";
      bridgeTabBtn == null ? void 0 : bridgeTabBtn.classList.add("connected");
    } else {
      setAllDots(false);
      bridgePortLabel.textContent = "\u2014";
      bridgeToggleBtn.textContent = "Connect";
      bridgeToggleBtn.className = "btn";
      bridgeToggleBtn.disabled = false;
      if (bridgePillLabel) bridgePillLabel.textContent = "Connect";
      bridgeTabBtn == null ? void 0 : bridgeTabBtn.classList.remove("connected");
    }
    if (activePanel === "files") updateActiveFileCard();
  }
  function bridgeStartKeepalive() {
    if (bridgeKeepaliveTimer) clearInterval(bridgeKeepaliveTimer);
    bridgeKeepaliveTimer = setInterval(() => {
      if ((bridgeWs == null ? void 0 : bridgeWs.readyState) === 1) try {
        bridgeWs.send(JSON.stringify({ type: "PING" }));
      } catch (e) {
      }
    }, 15e3);
  }
  function bridgeStopKeepalive() {
    if (bridgeKeepaliveTimer) {
      clearInterval(bridgeKeepaliveTimer);
      bridgeKeepaliveTimer = null;
    }
  }
  function initBridgeConnection(ws) {
    const fallbackFileInfo = { fileKey: "local-" + Date.now(), fileName: "S2A Toolkit", pluginVersion: "0.3.0" };
    console.log("[bridge] ws.readyState on open:", ws.readyState, "sending FILE_INFO...");
    try {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "FILE_INFO", data: fallbackFileInfo }));
        console.log("[bridge] FILE_INFO sent OK, fileKey=", fallbackFileInfo.fileKey);
      } else {
        console.log("[bridge] ws not OPEN, skipping FILE_INFO send. readyState=", ws.readyState);
      }
    } catch (e) {
      console.error("[bridge] FILE_INFO send threw:", e);
    }
    sendBridgeCommand("GET_FILE_INFO", {}).then((result) => {
      if (ws.readyState !== 1 || !result) return;
      const info = result.fileInfo || result;
      if (!info.fileKey) info.fileKey = fallbackFileInfo.fileKey;
      info.pluginVersion = "0.3.0";
      ws.send(JSON.stringify({ type: "FILE_INFO", data: info }));
    }).catch(() => {
    });
    sendBridgeCommand("REFRESH_VARIABLES", {}, 3e4).then((result) => {
      if (ws.readyState !== 1 || !(result == null ? void 0 : result.data)) return;
      ws.send(JSON.stringify({ type: "VARIABLES_DATA", data: result.data }));
      renderVariables(result.data);
      renderTokenGroups(result.data);
      setVarMeta(result.data.variables.length + " variables");
    }).catch(() => {
    });
  }
  function attachWsHandlers(ws, port) {
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "CONNECTED_FILES_UPDATE" && msg.data) {
          handleConnectedFilesUpdate(msg.data);
          return;
        }
        if (msg.type === "SERVER_HELLO" || msg.type === "PLUGIN_UPDATE_AVAILABLE") return;
        if (msg.id && !msg.method) {
          const pending = pendingWsRequests.get(msg.id);
          if (pending) {
            clearTimeout(pending.timeoutId);
            pendingWsRequests.delete(msg.id);
            if (msg.error) pending.reject(new Error(msg.error));
            else pending.resolve(msg.result);
            return;
          }
        }
        if (!msg.id || !msg.method) return;
        sendBridgeCommand(msg.method, msg.params || {}, 15e3).then((result) => {
          if (ws.readyState === 1) ws.send(JSON.stringify({ id: msg.id, result }));
        }).catch((err) => {
          if (ws.readyState === 1) ws.send(JSON.stringify({ id: msg.id, error: err.message }));
        });
      } catch (e) {
      }
    };
    ws.onclose = (e) => {
      console.log("[bridge] attachWsHandlers.onclose port", port, "code", e.code, e.reason);
      bridgeStopKeepalive();
      bridgeWs = null;
      bridgeConnected = false;
      for (const [, p] of pendingRequests) {
        clearTimeout(p.timeoutId);
        p.reject(new Error("Bridge disconnected"));
      }
      pendingRequests.clear();
      updateBridgeUi();
      if (!bridgeUserDisconnected) scheduleReconnect(port);
    };
    ws.onerror = (e) => {
      console.log("[bridge] attachWsHandlers.onerror port", port, e);
    };
  }
  function scheduleReconnect(port) {
    if (bridgeUserDisconnected) return;
    bridgeReconnectAttempts++;
    const delay = Math.min(BRIDGE_RECONNECT_BASE_MS * Math.pow(1.5, bridgeReconnectAttempts - 1), BRIDGE_RECONNECT_MAX_MS);
    bridgeReconnectTimer = setTimeout(() => {
      if (!bridgeUserDisconnected) reconnectToPort(port);
    }, delay);
  }
  function reconnectToPort(port) {
    console.log("[bridge] reconnectToPort", port);
    try {
      const ws = new WebSocket("ws://localhost:" + port);
      const t = setTimeout(() => {
        console.log("[bridge] reconnectToPort timeout, readyState=", ws.readyState);
        if (ws.readyState !== 1) ws.close();
      }, 3e3);
      ws.onopen = () => {
        clearTimeout(t);
        console.log("[bridge] reconnectToPort.onopen port", port, "readyState=", ws.readyState);
        bridgeWs = ws;
        bridgeWsPort = port;
        bridgeConnected = true;
        bridgeReconnectAttempts = 0;
        try {
          localStorage.setItem(BRIDGE_PREFERRED_PORT_KEY, String(port));
        } catch (e) {
        }
        updateBridgeUi();
        attachWsHandlers(ws, port);
        initBridgeConnection(ws);
        bridgeStartKeepalive();
      };
      ws.onerror = (e) => {
        clearTimeout(t);
        console.log("[bridge] reconnectToPort.onerror port", port, e);
      };
      ws.onclose = (e) => {
        clearTimeout(t);
        console.log("[bridge] reconnectToPort.onclose port", port, "code", e.code);
        if (!bridgeConnected && !bridgeUserDisconnected) bridgeConnect();
      };
    } catch (e) {
      console.log("[bridge] reconnectToPort threw", e);
      if (!bridgeUserDisconnected) bridgeConnect();
    }
  }
  function bridgeConnect() {
    bridgeUserDisconnected = false;
    if (bridgeReconnectTimer) {
      clearTimeout(bridgeReconnectTimer);
      bridgeReconnectTimer = null;
    }
    bridgeToggleBtn.textContent = "Connecting\u2026";
    bridgeToggleBtn.disabled = true;
    hideMultiServerWarn();
    const giveUpTimer = setTimeout(() => {
      if (!bridgeConnected) {
        bridgeToggleBtn.textContent = "Connect";
        bridgeToggleBtn.disabled = false;
        bridgePortLabel.textContent = "No server found";
      }
    }, 6e3);
    fanOutConnect(giveUpTimer);
  }
  function fanOutConnect(giveUpTimer) {
    if (bridgeConnected) {
      if (giveUpTimer) clearTimeout(giveUpTimer);
      return;
    }
    const ports = WS_PORTS;
    let found = false;
    const done = /* @__PURE__ */ new Set();
    const responding = [];
    const markDone = (port) => {
      if (done.has(port)) return;
      done.add(port);
      if (done.size === ports.length) {
        if (giveUpTimer) clearTimeout(giveUpTimer);
        if (responding.length > 1) {
          bridgeRespondingPorts = [...responding];
          showMultiServerWarn(responding);
        }
        if (!found) {
          bridgeToggleBtn.textContent = "Connect";
          bridgeToggleBtn.disabled = false;
          bridgePortLabel.textContent = "No server found";
        }
      }
    };
    ports.forEach((port) => {
      try {
        const ws = new WebSocket("ws://localhost:" + port);
        const t = setTimeout(() => {
          markDone(port);
          try {
            ws.close();
          } catch (e) {
          }
        }, 3e3);
        ws.onopen = () => {
          clearTimeout(t);
          responding.push(port);
          console.log("[bridge] ws.onopen port", port, "found=", found);
          if (!found) {
            found = true;
            if (giveUpTimer) clearTimeout(giveUpTimer);
            try {
              localStorage.setItem(BRIDGE_PREFERRED_PORT_KEY, String(port));
            } catch (e) {
            }
            bridgeWs = ws;
            bridgeWsPort = port;
            bridgeConnected = true;
            bridgeReconnectAttempts = 0;
            updateBridgeUi();
            attachWsHandlers(ws, port);
            initBridgeConnection(ws);
            bridgeStartKeepalive();
            markDone(port);
          } else {
            markDone(port);
            try {
              ws.close();
            } catch (e) {
            }
          }
        };
        ws.onerror = (e) => {
          clearTimeout(t);
          console.log("[bridge] ws.onerror port", port, e);
          markDone(port);
        };
        ws.onclose = (e) => {
          clearTimeout(t);
          console.log("[bridge] ws.onclose port", port, "code", e.code, e.reason);
          markDone(port);
        };
      } catch (e) {
        markDone(port);
      }
    });
  }
  function bridgeDisconnect() {
    bridgeUserDisconnected = true;
    bridgeStopKeepalive();
    if (bridgeReconnectTimer) {
      clearTimeout(bridgeReconnectTimer);
      bridgeReconnectTimer = null;
    }
    try {
      bridgeWs == null ? void 0 : bridgeWs.close();
    } catch (e) {
    }
    bridgeWs = null;
    bridgeWsPort = null;
    bridgeConnected = false;
    bridgeReconnectAttempts = 0;
    updateBridgeUi();
  }
  function getTokenGroup(name) {
    var _a22;
    const parts = name.split("/").filter((p) => p !== "s2a");
    if (parts.length >= 4 && parts[1] === "transparent") return parts[0] + " / " + parts[1] + " / " + parts[2];
    if (parts.length >= 3) return parts[0] + " / " + parts[1];
    return (_a22 = parts[0]) != null ? _a22 : name;
  }
  function setVarMeta(_text) {
  }
  function setVarStatus(msg, type = "") {
    const el = document.getElementById("varStatus");
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  }
  function updateExportButtons() {
    const localBtn = document.getElementById("varExportLocalBtn");
    const githubBtn = document.getElementById("varExportGithubBtn");
    const hasVars = !!variablesCache;
    const hasGhSettings = !!((githubSettings == null ? void 0 : githubSettings.token) && (githubSettings == null ? void 0 : githubSettings.owner) && (githubSettings == null ? void 0 : githubSettings.repo));
    if (localBtn) localBtn.disabled = !hasVars;
    if (githubBtn) githubBtn.disabled = !hasVars || !hasGhSettings;
  }
  function renderVariables(data) {
    variablesCache = data;
    const el = document.getElementById("varCollections");
    if (!el) return;
    if (data.variableCollections.length === 0) {
      el.innerHTML = '<div class="empty-state">No collections found</div>';
      return;
    }
    const byCol = {};
    for (const v of data.variables) byCol[v.variableCollectionId] = (byCol[v.variableCollectionId] || 0) + 1;
    el.innerHTML = data.variableCollections.map(
      (c) => `<div class="collection-row">
      <span class="collection-name">${esc(c.name)}</span>
      <span class="collection-count">${byCol[c.id] || 0}</span>
    </div>`
    ).join("");
    updateExportButtons();
  }
  function renderTokenGroups(data) {
    const labelEl = document.getElementById("tokenGroupLabel");
    const listEl = document.getElementById("tokenGroupList");
    if (!listEl) return;
    const semanticColls = data.variableCollections.filter(
      (c) => /Semantic|Responsive/.test(c.name) || /Primitives/.test(c.name) && /Color/.test(c.name) || /Primitives/.test(c.name) && /Dimension/.test(c.name)
    );
    if (semanticColls.length === 0) {
      listEl.innerHTML = "";
      if (labelEl) labelEl.classList.add("hidden");
      return;
    }
    const collIdToName = /* @__PURE__ */ new Map();
    for (const c of data.variableCollections) collIdToName.set(c.id, c.name);
    const collSet = new Set(semanticColls.map((c) => c.id));
    const groups = /* @__PURE__ */ new Map();
    for (const v of data.variables) {
      if (!collSet.has(v.variableCollectionId)) continue;
      const collName = collIdToName.get(v.variableCollectionId) || "";
      const grp = getTokenGroup(v.name);
      if (/Primitives/.test(collName) && /Dimension/.test(collName) && grp !== "opacity") continue;
      const key = v.variableCollectionId + "::" + grp;
      if (!groups.has(key)) {
        groups.set(key, { collectionId: v.variableCollectionId, collectionName: collName, group: grp, count: 0 });
      }
      groups.get(key).count++;
    }
    const sorted = [...groups.values()].sort((a, b) => {
      if (a.collectionName !== b.collectionName) return a.collectionName.localeCompare(b.collectionName);
      return a.group.localeCompare(b.group);
    });
    if (labelEl) labelEl.classList.remove("hidden");
    listEl.innerHTML = sorted.map(
      (g) => `<div class="collection-row token-group-row" data-col="${esc(g.collectionId)}" data-group="${esc(g.group)}">
      <span class="collection-name">${esc(g.group)}</span>
      <span class="collection-count">${g.count}</span>
      <button class="gen-btn" title="Generate docs for ${esc(g.group)}">\u2192</button>
    </div>`
    ).join("");
    listEl.insertAdjacentHTML(
      "beforeend",
      `<div class="collection-row token-group-row" style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08)" data-col="text-styles" data-group="text-styles">
      <span class="collection-name">Text Styles</span>
      <span class="collection-count">\u2014</span>
      <button class="gen-btn" title="Generate 4 breakpoint sections from native text styles">\u2192</button>
    </div>`
    );
  }
  var _a2;
  (_a2 = document.getElementById("tokenGroupList")) == null ? void 0 : _a2.addEventListener("click", (e) => {
    var _a22;
    const btn = e.target.closest(".gen-btn");
    if (!btn || btn.disabled) return;
    const row = btn.closest(".token-group-row");
    if (!row) return;
    btn.disabled = true;
    btn.textContent = "\u2026";
    setVarStatus("Generating " + ((_a22 = row.dataset.group) != null ? _a22 : "") + "\u2026");
    postToPlugin("token-docs:generate", { collectionId: row.dataset.col, group: row.dataset.group });
  });
  var _a3;
  (_a3 = document.getElementById("varRefreshBtn")) == null ? void 0 : _a3.addEventListener("click", async () => {
    const btn = document.getElementById("varRefreshBtn");
    btn.textContent = "Refreshing\u2026";
    btn.disabled = true;
    setVarStatus("Loading\u2026");
    try {
      const result = await sendBridgeCommand("REFRESH_VARIABLES", {}, 3e4);
      if (result == null ? void 0 : result.data) {
        renderVariables(result.data);
        renderTokenGroups(result.data);
        setVarStatus(result.data.variables.length + " variables loaded", "ok");
      } else {
        setVarStatus("No data returned", "err");
      }
    } catch (e) {
      setVarStatus(e.message || "Error", "err");
    } finally {
      btn.textContent = "Refresh";
      btn.disabled = false;
    }
  });
  var _a4;
  (_a4 = document.getElementById("varExportLocalBtn")) == null ? void 0 : _a4.addEventListener("click", () => {
    if (!variablesCache) {
      setVarStatus("No variables \u2014 hit Refresh first", "err");
      return;
    }
    const btn = document.getElementById("varExportLocalBtn");
    btn.textContent = "Exporting\u2026";
    btn.disabled = true;
    setVarStatus("Sending to dev-server\u2026");
    fetch("http://localhost:9300/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variablesCache)
    }).then((r) => r.json()).then((data) => {
      if (data.ok) setVarStatus(`\u2713 ${data.variables} vars \u2192 dist/css/`, "ok");
      else setVarStatus("\u274C " + (data.error || "Build failed"), "err");
    }).catch(() => setVarStatus("\u274C Dev server not running \u2014 run: npm run dev-server", "err")).finally(() => {
      btn.textContent = "Local";
      updateExportButtons();
    });
  });
  var _a5;
  (_a5 = document.getElementById("varExportGithubBtn")) == null ? void 0 : _a5.addEventListener("click", async () => {
    if (!variablesCache || !(githubSettings == null ? void 0 : githubSettings.token)) return;
    const btn = document.getElementById("varExportGithubBtn");
    btn.textContent = "Pushing\u2026";
    btn.disabled = true;
    setVarStatus("Pushing to GitHub\u2026");
    try {
      await pushToGitHub(variablesCache, githubSettings);
      setVarStatus("\u2713 Committed to " + githubSettings.repo + " / " + githubSettings.branch, "ok");
    } catch (e) {
      setVarStatus("\u274C " + (e.message || "GitHub push failed"), "err");
    } finally {
      btn.textContent = "\u2191 GitHub";
      updateExportButtons();
    }
  });
  async function pushToGitHub(data, settings) {
    const { token, owner, repo, branch, filePath } = settings;
    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const headers = {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    };
    let sha;
    const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
    if (getRes.ok) sha = (await getRes.json()).sha;
    else if (getRes.status !== 404) throw new Error((await getRes.json()).message || `GitHub ${getRes.status}`);
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    const body = { message: "chore: sync tokens from Figma", content, branch };
    if (sha) body.sha = sha;
    const putRes = await fetch(apiBase, { method: "PUT", headers, body: JSON.stringify(body) });
    if (!putRes.ok) throw new Error((await putRes.json()).message || `GitHub ${putRes.status}`);
  }
  function setSettingsStatus(msg, type = "") {
    const el = document.getElementById("settingsStatus");
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  }
  function applySettings(settings) {
    githubSettings = settings;
    if (!settings) return;
    document.getElementById("ghToken").value = settings.token || "";
    document.getElementById("ghOwner").value = settings.owner || "";
    document.getElementById("ghRepo").value = settings.repo || "";
    document.getElementById("ghBranch").value = settings.branch || "main";
    document.getElementById("ghFilePath").value = settings.filePath || "packages/toolkit-tokens/json/figma-export.json";
    updateExportButtons();
  }
  var _a6;
  (_a6 = document.getElementById("saveSettingsBtn")) == null ? void 0 : _a6.addEventListener("click", () => {
    const settings = {
      token: document.getElementById("ghToken").value.trim(),
      owner: document.getElementById("ghOwner").value.trim(),
      repo: document.getElementById("ghRepo").value.trim(),
      branch: document.getElementById("ghBranch").value.trim() || "main",
      filePath: document.getElementById("ghFilePath").value.trim() || "packages/toolkit-tokens/json/figma-export.json"
    };
    if (!settings.token || !settings.owner || !settings.repo) {
      setSettingsStatus("Token, owner, and repo are required", "err");
      return;
    }
    postToPlugin("save-settings", { settings });
  });
  var figmaApiToken = "";
  function sendServerRequest(type, data = {}, timeoutMs = 5e3) {
    return new Promise((resolve, reject) => {
      if (!bridgeWs || bridgeWs.readyState !== 1) {
        reject(new Error("Not connected to bridge"));
        return;
      }
      const id = "sr_" + ++wsRequestCounter + "_" + Date.now();
      const timeoutId = setTimeout(() => {
        pendingWsRequests.delete(id);
        reject(new Error(type + " timed out"));
      }, timeoutMs);
      pendingWsRequests.set(id, { resolve, reject, timeoutId });
      try {
        bridgeWs.send(JSON.stringify({ type, id, data }));
      } catch (e) {
        pendingWsRequests.delete(id);
        clearTimeout(timeoutId);
        reject(e);
      }
    });
  }
  function handleConnectedFilesUpdate(data) {
    connectedFiles = data.files || [];
    if (activePanel === "files") renderConnectedFiles();
  }
  function setFilesStatus(msg, type = "") {
    const el = document.getElementById("filesStatus");
    if (el) {
      el.textContent = msg;
      el.className = "status" + (type ? " " + type : "");
    }
  }
  function renderConnectedFiles() {
    const listEl = document.getElementById("connectedFilesList");
    if (!listEl) return;
    if (!bridgeConnected) {
      listEl.innerHTML = '<div class="empty-state">Connect to bridge first</div>';
      return;
    }
    if (connectedFiles.length === 0) {
      listEl.innerHTML = '<div class="empty-state">Only this file is connected.<br>Open the plugin in another Figma file to see it here.</div>';
      return;
    }
    listEl.innerHTML = connectedFiles.map(
      (f) => `<div class="file-card${f.isActive ? " file-card--active" : ""}">
      <div class="file-card-icon">${f.isActive ? "\u25C9" : "\u25CB"}</div>
      <div class="file-card-meta">
        <span class="file-card-name">${esc(f.fileName)}</span>
        <span class="file-card-sub">${f.currentPage ? esc(f.currentPage) + " \xB7 " : ""}${esc(f.fileKey)}</span>
      </div>
      ${f.isActive ? '<span class="badge badge-hot" style="font-size:9px;margin-left:auto;">Active</span>' : `<button class="btn btn-ghost btn-sm" data-switch="${esc(f.fileKey)}" style="margin-left:auto;">Switch</button>`}
    </div>`
    ).join("");
    listEl.querySelectorAll("[data-switch]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const fileKey = btn.dataset.switch;
        btn.disabled = true;
        btn.textContent = "\u2026";
        try {
          await sendServerRequest("SET_ACTIVE_FILE", { fileKey });
          setFilesStatus("Active file switched", "ok");
        } catch (e) {
          setFilesStatus("Switch failed: " + (e.message || "error"), "err");
          btn.disabled = false;
          btn.textContent = "Switch";
        }
      });
    });
  }
  async function refreshConnectedFiles() {
    setFilesStatus("Scanning\u2026");
    try {
      const result = await sendServerRequest("GET_CONNECTED_FILES", {}, 5e3);
      connectedFiles = result.files || [];
      renderConnectedFiles();
      setFilesStatus("");
    } catch (e) {
      connectedFiles = [];
      renderConnectedFiles();
      if (!bridgeConnected) setFilesStatus("Connect to bridge first", "err");
      else setFilesStatus("Could not fetch file list", "err");
    }
  }
  var _a7;
  (_a7 = document.getElementById("filesRefreshBtn")) == null ? void 0 : _a7.addEventListener("click", () => refreshConnectedFiles());
  function setFigmaTokenStatus(msg, type = "") {
    const el = document.getElementById("figmaTokenStatus");
    if (el) {
      el.textContent = msg;
      el.className = "status" + (type ? " " + type : "");
    }
  }
  var _a8;
  (_a8 = document.getElementById("saveFigmaTokenBtn")) == null ? void 0 : _a8.addEventListener("click", () => {
    var _a22;
    const token = (((_a22 = document.getElementById("figmaApiToken")) == null ? void 0 : _a22.value) || "").trim();
    postToPlugin("save-figma-token", { token });
  });
  function renderAxes(setId, setName, axes) {
    selectSetId = setId;
    const emptyEl = document.getElementById("selectEmpty");
    const bodyEl = document.getElementById("selectBody");
    const nameEl = document.getElementById("selectSetName");
    const axesEl = document.getElementById("selectAxes");
    const statusEl = document.getElementById("selectStatus");
    emptyEl.style.display = "none";
    bodyEl.style.display = "block";
    nameEl.textContent = setName;
    if (statusEl) statusEl.textContent = "";
    const variantAxes = axes.filter((a) => a.type === "VARIANT");
    if (variantAxes.length === 0) {
      axesEl.innerHTML = '<div class="empty-state" style="padding:12px 0 0;">No variant axes found</div>';
      return;
    }
    axesEl.innerHTML = variantAxes.map(
      (axis) => `<div class="axis-group">
      <div class="axis-label">${esc(axis.name)}</div>
      <div class="axis-values">${(axis.variantOptions || []).map(
        (v) => `<button class="chip on" data-axis="${esc(axis.name)}" data-value="${esc(v)}">${esc(v)}</button>`
      ).join("")}</div>
    </div>`
    ).join("");
    axesEl.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => chip.classList.toggle("on"));
    });
  }
  function clearSelect() {
    selectSetId = null;
    document.getElementById("selectEmpty").style.display = "block";
    document.getElementById("selectBody").style.display = "none";
  }
  var _a9;
  (_a9 = document.getElementById("selectApplyBtn")) == null ? void 0 : _a9.addEventListener("click", () => {
    if (!selectSetId) return;
    const filter = {};
    document.querySelectorAll(".chip.on[data-axis]").forEach((chip) => {
      const axis = chip.dataset.axis;
      if (!filter[axis]) filter[axis] = [];
      filter[axis].push(chip.dataset.value);
    });
    postToPlugin("select:apply-filter", { setId: selectSetId, filter });
  });
  var _a10;
  (_a10 = document.getElementById("selectAllBtn")) == null ? void 0 : _a10.addEventListener("click", () => {
    document.querySelectorAll("#selectAxes .chip").forEach((c) => c.classList.add("on"));
  });
  var _a11;
  (_a11 = document.getElementById("selectNoneBtn")) == null ? void 0 : _a11.addEventListener("click", () => {
    document.querySelectorAll("#selectAxes .chip").forEach((c) => c.classList.remove("on"));
  });
  function setAnnotateStatus(msg, type = "") {
    const el = document.getElementById("annotateStatus");
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  }
  function updateAnnotateSelection(sel) {
    var _a22;
    annotateNodeId = (_a22 = sel == null ? void 0 : sel.id) != null ? _a22 : null;
    const emptyEl = document.getElementById("annotateSelectionEmpty");
    const infoEl = document.getElementById("annotateSelectionInfo");
    const nameEl = document.getElementById("annotateNodeName");
    const typeEl = document.getElementById("annotateNodeType");
    const applyBtn = document.getElementById("annotateApplyBtn");
    if (sel) {
      emptyEl.style.display = "none";
      infoEl.style.display = "flex";
      nameEl.textContent = sel.name;
      typeEl.textContent = sel.nodeType;
      applyBtn.disabled = false;
    } else {
      emptyEl.style.display = "block";
      infoEl.style.display = "none";
      applyBtn.disabled = true;
    }
  }
  document.querySelectorAll("#annotateCats .chip").forEach((chip) => {
    chip.addEventListener("click", () => chip.classList.toggle("on"));
  });
  var _a12;
  (_a12 = document.getElementById("annotateApplyBtn")) == null ? void 0 : _a12.addEventListener("click", () => {
    if (!annotateNodeId) return;
    const categories = Array.from(
      document.querySelectorAll("#annotateCats .chip.on")
    ).map((c) => c.dataset.cat);
    if (categories.length === 0) {
      setAnnotateStatus("Select at least one category", "err");
      return;
    }
    const btn = document.getElementById("annotateApplyBtn");
    btn.disabled = true;
    btn.textContent = "Annotating\u2026";
    setAnnotateStatus("");
    postToPlugin("annotate:apply", { nodeId: annotateNodeId, categories });
  });
  var _a13;
  (_a13 = document.getElementById("annotateClearBtn")) == null ? void 0 : _a13.addEventListener("click", () => {
    if (!annotateNodeId) return;
    const btn = document.getElementById("annotateClearBtn");
    btn.disabled = true;
    setAnnotateStatus("Clearing\u2026");
    postToPlugin("annotate:clear", { nodeId: annotateNodeId });
  });
  function setSpecStatus(msg, type = "") {
    const el = document.getElementById("specStatus");
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  }
  function updateSpecSelection(sel) {
    var _a22, _b;
    const isValid = (sel == null ? void 0 : sel.nodeType) === "COMPONENT_SET" || (sel == null ? void 0 : sel.nodeType) === "COMPONENT";
    specSetId = isValid ? (_a22 = sel == null ? void 0 : sel.id) != null ? _a22 : null : null;
    const emptyEl = document.getElementById("specSelectionEmpty");
    const infoEl = document.getElementById("specSelectionInfo");
    const nameEl = document.getElementById("specSetName");
    const countEl = document.getElementById("specSetCount");
    const genBtn = document.getElementById("specGenerateBtn");
    if (isValid && sel) {
      emptyEl.style.display = "none";
      infoEl.style.display = "flex";
      nameEl.textContent = sel.name;
      countEl.textContent = sel.nodeType === "COMPONENT_SET" ? ((_b = sel.variantCount) != null ? _b : 0) + " variants" : "1 variant";
      genBtn.disabled = false;
    } else {
      emptyEl.style.display = "block";
      infoEl.style.display = "none";
      genBtn.disabled = true;
    }
  }
  document.querySelectorAll("#specOpts .chip").forEach((chip) => {
    chip.addEventListener("click", () => chip.classList.toggle("on"));
  });
  var _a14;
  (_a14 = document.getElementById("specGenerateBtn")) == null ? void 0 : _a14.addEventListener("click", () => {
    if (!specSetId) return;
    const on = new Set(
      Array.from(document.querySelectorAll("#specOpts .chip.on")).map((c) => c.dataset.opt)
    );
    if (on.size === 0) {
      setSpecStatus("Select at least one section to include", "err");
      return;
    }
    const btn = document.getElementById("specGenerateBtn");
    btn.disabled = true;
    btn.textContent = "Generating\u2026";
    setSpecStatus("");
    postToPlugin("spec:generate", {
      setId: specSetId,
      options: { variants: on.has("variants"), tokens: on.has("tokens"), children: on.has("children") }
    });
  });
  function setVersionStatus(msg, type = "") {
    const el = document.getElementById("versionStatus");
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  }
  function updateVersionSelection(sel, meta) {
    var _a22;
    const isValid = (sel == null ? void 0 : sel.nodeType) === "COMPONENT_SET" || (sel == null ? void 0 : sel.nodeType) === "COMPONENT";
    versionSetId = isValid ? (_a22 = sel == null ? void 0 : sel.id) != null ? _a22 : null : null;
    const emptyEl = document.getElementById("versionSelectionEmpty");
    const infoEl = document.getElementById("versionSelectionInfo");
    const nameEl = document.getElementById("versionSetName");
    const curEl = document.getElementById("versionCurrent");
    const badgeEl = document.getElementById("versionBadge");
    const initRow = document.getElementById("versionInitRow");
    const activeBox = document.getElementById("versionActiveBox");
    const deprecatedBox = document.getElementById("versionDeprecatedBox");
    const forkNote = document.getElementById("versionForkNote");
    forkNote.style.display = "none";
    setVersionStatus("");
    if (!isValid || !sel) {
      emptyEl.style.display = "block";
      infoEl.style.display = "none";
      initRow.style.display = activeBox.style.display = deprecatedBox.style.display = "none";
      return;
    }
    emptyEl.style.display = "none";
    infoEl.style.display = "flex";
    nameEl.textContent = sel.name;
    const versioned = !!(meta && meta.version);
    if (!versioned) {
      curEl.textContent = "unversioned";
      badgeEl.textContent = "none";
      badgeEl.className = "version-badge unversioned";
      badgeEl.style.display = "inline-block";
      initRow.style.display = "flex";
      activeBox.style.display = deprecatedBox.style.display = "none";
      return;
    }
    curEl.textContent = "v" + meta.version + (meta.updated ? " \xB7 " + meta.updated : "");
    badgeEl.textContent = meta.status;
    badgeEl.className = "version-badge " + meta.status;
    badgeEl.style.display = "inline-block";
    initRow.style.display = "none";
    if (meta.status === "deprecated") {
      activeBox.style.display = "none";
      deprecatedBox.style.display = "block";
      const contract = document.getElementById("versionContract");
      contract.textContent = `status:     deprecated
replacedBy: ${meta.replacedBy || "\u26A0 missing"}
removeBy:   ${meta.removeBy || "\u26A0 missing"}`;
    } else {
      deprecatedBox.style.display = "none";
      activeBox.style.display = "block";
      document.getElementById("versionSummary").value = "";
    }
  }
  function fireVersion(op, extra = {}) {
    var _a22, _b;
    if (!versionSetId) return;
    const summary = (_b = (_a22 = document.getElementById("versionSummary")) == null ? void 0 : _a22.value) != null ? _b : "";
    setVersionStatus("Applying\u2026");
    postToPlugin("version:apply", __spreadValues({ nodeId: versionSetId, op, summary }, extra));
  }
  var _a15;
  (_a15 = document.getElementById("versionInitBtn")) == null ? void 0 : _a15.addEventListener("click", () => fireVersion("init"));
  var _a16;
  (_a16 = document.getElementById("versionPatchBtn")) == null ? void 0 : _a16.addEventListener("click", () => fireVersion("patch"));
  var _a17;
  (_a17 = document.getElementById("versionMinorBtn")) == null ? void 0 : _a17.addEventListener("click", () => fireVersion("minor"));
  var _a18;
  (_a18 = document.getElementById("versionMajorBtn")) == null ? void 0 : _a18.addEventListener("click", () => fireVersion("major"));
  var _a19;
  (_a19 = document.getElementById("versionReactivateBtn")) == null ? void 0 : _a19.addEventListener("click", () => fireVersion("reactivate"));
  var _a20;
  (_a20 = document.getElementById("versionDeprecateBtn")) == null ? void 0 : _a20.addEventListener("click", () => {
    const replacedBy = document.getElementById("versionReplacedBy").value.trim();
    const removeBy = document.getElementById("versionRemoveBy").value.trim();
    if (!replacedBy || !removeBy) {
      setVersionStatus("Deprecating needs both a replacement and a remove-by date", "err");
      return;
    }
    fireVersion("deprecate", { replacedBy, removeBy });
  });
  function setDocsStatus(msg, type = "") {
    const el = document.getElementById("docsStatus");
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  }
  function updateDocsSelection(sel) {
    var _a22, _b;
    const isValid = (sel == null ? void 0 : sel.nodeType) === "COMPONENT_SET";
    docsSetId = isValid ? (_a22 = sel == null ? void 0 : sel.id) != null ? _a22 : null : null;
    const emptyEl = document.getElementById("docsSelectionEmpty");
    const infoEl = document.getElementById("docsSelectionInfo");
    const nameEl = document.getElementById("docsSetName");
    const countEl = document.getElementById("docsSetCount");
    const genBtn = document.getElementById("docsGenerateBtn");
    if (isValid && sel) {
      emptyEl.style.display = "none";
      infoEl.style.display = "flex";
      nameEl.textContent = sel.name;
      countEl.textContent = ((_b = sel.variantCount) != null ? _b : 0) + " variants";
      genBtn.disabled = false;
    } else {
      emptyEl.style.display = "block";
      infoEl.style.display = "none";
      genBtn.disabled = true;
    }
  }
  var _a21;
  (_a21 = document.getElementById("docsGenerateBtn")) == null ? void 0 : _a21.addEventListener("click", () => {
    if (!docsSetId) return;
    const btn = document.getElementById("docsGenerateBtn");
    btn.disabled = true;
    btn.textContent = "Generating\u2026";
    setDocsStatus("");
    postToPlugin("docs:generate", { nodeId: docsSetId });
  });
  window.addEventListener("message", (event) => {
    var _a22, _b, _c;
    const msg = event.data.pluginMessage;
    if (!msg) return;
    switch (msg.type) {
      case "bridge:command-result": {
        const p = pendingRequests.get(msg.requestId);
        if (p) {
          clearTimeout(p.timeoutId);
          pendingRequests.delete(msg.requestId);
          if (msg.success) {
            const result = __spreadValues({}, msg);
            delete result.type;
            delete result.requestId;
            p.resolve(result);
          } else {
            p.reject(new Error(msg.error || "Unknown error"));
          }
        }
        break;
      }
      case "figma-token-loaded": {
        figmaApiToken = msg.token || "";
        const el = document.getElementById("figmaApiToken");
        if (el) el.value = figmaApiToken;
        break;
      }
      case "figma-token-saved": {
        if (msg.success) {
          figmaApiToken = (((_a22 = document.getElementById("figmaApiToken")) == null ? void 0 : _a22.value) || "").trim();
          setFigmaTokenStatus("Saved", "ok");
        } else {
          setFigmaTokenStatus("Save failed: " + msg.error, "err");
        }
        break;
      }
      case "settings-loaded":
        applySettings(msg.settings);
        break;
      case "settings-saved": {
        if (msg.success) {
          githubSettings = {
            token: document.getElementById("ghToken").value.trim(),
            owner: document.getElementById("ghOwner").value.trim(),
            repo: document.getElementById("ghRepo").value.trim(),
            branch: document.getElementById("ghBranch").value.trim() || "main",
            filePath: document.getElementById("ghFilePath").value.trim() || "packages/toolkit-tokens/json/figma-export.json"
          };
          setSettingsStatus("Saved", "ok");
          updateExportButtons();
        } else {
          setSettingsStatus("Save failed: " + msg.error, "err");
        }
        break;
      }
      case "select:axes": {
        if (msg.setId) renderAxes(msg.setId, msg.setName, msg.axes);
        else clearSelect();
        break;
      }
      case "select:result": {
        const el = document.getElementById("selectStatus");
        if (el) {
          el.textContent = msg.message;
          el.className = "status ok";
        }
        break;
      }
      case "selection-changed": {
        if (msg.nodeId) {
          const sel = {
            id: msg.nodeId,
            name: msg.nodeName,
            nodeType: msg.nodeType,
            variantCount: msg.variantCount
          };
          updateAnnotateSelection(sel);
          updateSpecSelection(sel);
          updateVersionSelection(sel, msg.versionMeta);
          updateDocsSelection(sel);
          updateCopyBtn(sel, msg.fileKey, msg.fileName, msg.allNodes);
          updateSectionBar(
            !!msg.isSection,
            (_b = msg.sectionCount) != null ? _b : 0,
            (_c = msg.sectionName) != null ? _c : sel.name
          );
        } else {
          updateAnnotateSelection(null);
          updateSpecSelection(null);
          updateVersionSelection(null, null);
          updateDocsSelection(null);
          updateCopyBtn(null, null);
          updateSectionBar(false, 0, "");
        }
        break;
      }
      case "token-docs:result": {
        document.querySelectorAll(".gen-btn").forEach((b) => {
          b.disabled = false;
          b.textContent = "\u2192";
        });
        if (msg.error) setVarStatus("\u274C " + msg.error, "err");
        else setVarStatus("\u2713 " + msg.count + " tokens documented", "ok");
        break;
      }
      case "format-section:done": {
        formatSectionBtn.disabled = false;
        formatSectionBtn.textContent = "Format";
        break;
      }
      case "annotate:result": {
        const btn = document.getElementById("annotateApplyBtn");
        btn.disabled = !annotateNodeId;
        btn.textContent = "Annotate";
        if (msg.error) setAnnotateStatus("\u274C " + msg.error, "err");
        else {
          const n = msg.annotated;
          setAnnotateStatus(`\u2713 ${n} node${n !== 1 ? "s" : ""} annotated`, "ok");
        }
        break;
      }
      case "annotate:cleared": {
        const btn = document.getElementById("annotateClearBtn");
        btn.disabled = false;
        const n = msg.cleared;
        setAnnotateStatus(n > 0 ? `Cleared ${n} annotation${n !== 1 ? "s" : ""}` : "Nothing to clear", "ok");
        break;
      }
      case "spec:result": {
        const btn = document.getElementById("specGenerateBtn");
        btn.disabled = !specSetId;
        btn.textContent = "Generate Spec";
        if (msg.error) setSpecStatus("\u274C " + msg.error, "err");
        else {
          const vars = msg.variantCount;
          setSpecStatus(`\u2713 Spec generated \xB7 ${vars} variant${vars !== 1 ? "s" : ""}`, "ok");
        }
        break;
      }
      case "docs:result": {
        const btn = document.getElementById("docsGenerateBtn");
        btn.disabled = !docsSetId;
        btn.textContent = "Generate Docs";
        if (msg.error) setDocsStatus("\u274C " + msg.error, "err");
        else {
          const t = msg.tiles;
          setDocsStatus(`\u2713 Docs generated \xB7 ${t} tile${t !== 1 ? "s" : ""}`, "ok");
        }
        break;
      }
      case "version:result": {
        if (msg.error) {
          setVersionStatus("\u274C " + msg.error, "err");
          break;
        }
        const meta = msg.meta;
        updateVersionSelection({ id: msg.nodeId, name: document.getElementById("versionSetName").textContent || "", nodeType: "COMPONENT_SET" }, meta);
        const h = msg.hygiene;
        if (h && !h.pass) setVersionStatus("\u26A0 v" + meta.version + " \u2014 " + h.issues.join("; "), "err");
        else setVersionStatus("\u2713 v" + meta.version + " \xB7 " + meta.status, "ok");
        if (msg.forkReminder) {
          const note = document.getElementById("versionForkNote");
          const forkName = msg.replacedByName || "a new \u2014 v" + meta.version.split(".")[0];
          note.innerHTML = `<strong>Major = breaking.</strong> Duplicate this set as \u201C${forkName}\u201D, then deprecate this one pointing at it. The version metadata is stamped; the fork is yours to make.`;
          note.style.display = "block";
        }
        break;
      }
    }
  });
  postToPlugin("ui-ready");
  postToPlugin("get-settings");
  postToPlugin("get-figma-token");
  postToPlugin("resize-for-view", { width: 320, height: 460 });
  renderHomeView();
  bridgeConnect();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !bridgeConnected && !bridgeUserDisconnected && !bridgeReconnectTimer) {
      bridgeReconnectAttempts = 0;
      bridgeConnect();
    }
  });
  setInterval(() => {
    if (!bridgeConnected && !bridgeUserDisconnected && !bridgeReconnectTimer) {
      bridgeReconnectAttempts = 0;
      bridgeConnect();
    }
  }, 45e3);
})();
