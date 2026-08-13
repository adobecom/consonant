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
  var llmCaptureNodeId = null;
  var selectSetId = null;
  var docSetId = null;
  var bridgeConnected = false;
  var bridgeWs = null;
  var bridgeWsPort = null;
  var bridgeKeepaliveTimer = null;
  var bridgeReconnectTimer = null;
  var bridgeReconnectAttempts = 0;
  var bridgeUserDisconnected = false;
  var activePanel = "home";
  var isMini = false;
  var popoverOpen = false;
  var pendingRequests = /* @__PURE__ */ new Map();
  var requestCounter = 0;
  var panelEls = {
    home: document.getElementById("homePanel"),
    tools: document.getElementById("toolsPanel")
  };
  function switchPanel(panel) {
    activePanel = panel;
    Object.entries(panelEls).forEach(([key, el]) => {
      el.classList.toggle("active", key === panel);
    });
    document.querySelectorAll(".tab[data-panel]").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.panel === panel);
    });
    if (panel === "home") renderHomeView();
  }
  document.querySelectorAll(".tab[data-panel]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const p = tab.dataset.panel;
      if (p) switchPanel(p);
    });
  });
  var FEATURES = [
    // Tools
    {
      id: "tools:copy-link",
      name: "Copy Figma link",
      description: "Copy a shareable link for the selected node(s)",
      category: "Tools",
      uiAction: () => {
        var _a9;
        return (_a9 = document.getElementById("copyNodeBtn")) == null ? void 0 : _a9.click();
      }
    },
    {
      id: "tools:llm-capture",
      name: "Send screenshot to LLM",
      description: "Capture the selected node and send image + metadata to the local LLM bridge",
      category: "Tools",
      uiAction: () => switchPanel("tools")
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
      id: "tools:doc",
      name: "Generate component doc",
      description: "Build a full component documentation page for the selected component set",
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
    "tools:llm-capture",
    "tools:copy-link",
    "tools:annotate",
    "tools:select-filter",
    "tools:doc"
  ];
  function fireFeature(feat) {
    var _a9;
    logEvent(feat.id);
    closePalette();
    if (feat.uiAction) {
      feat.uiAction();
    } else if (feat.pluginAction) {
      postToPlugin(feat.pluginAction, (_a9 = feat.pluginPayload) != null ? _a9 : {});
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
    var _a9, _b;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      paletteSelected = Math.min(paletteSelected + 1, paletteFiltered.length - 1);
      renderPalette();
      (_a9 = paletteList.querySelector(`[data-selected="true"]`)) == null ? void 0 : _a9.scrollIntoView({ block: "nearest" });
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
    var _a9;
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
      (_a9 = navigator.clipboard) == null ? void 0 : _a9.writeText(text).catch(() => {
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
  function setLlmCaptureStatus(msg, type = "") {
    const el = document.getElementById("llmCaptureStatus");
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  }
  function updateLlmCaptureSelection(sel) {
    var _a9;
    llmCaptureNodeId = (_a9 = sel == null ? void 0 : sel.id) != null ? _a9 : null;
    const emptyEl = document.getElementById("llmCaptureSelectionEmpty");
    const infoEl = document.getElementById("llmCaptureSelectionInfo");
    const nameEl = document.getElementById("llmCaptureNodeName");
    const typeEl = document.getElementById("llmCaptureNodeType");
    const sendBtn = document.getElementById("llmCaptureSendBtn");
    if (sel) {
      emptyEl.style.display = "none";
      infoEl.style.display = "flex";
      nameEl.textContent = sel.name;
      typeEl.textContent = sel.nodeType;
      sendBtn.disabled = false;
    } else {
      emptyEl.style.display = "block";
      infoEl.style.display = "none";
      sendBtn.disabled = true;
    }
  }
  async function pollLlmCaptureJob(jobId) {
    for (; ; ) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const res = await fetch(`http://localhost:4002/jobs/${encodeURIComponent(jobId)}`);
      if (!res.ok) throw new Error(`Job status failed (${res.status})`);
      const job = await res.json();
      if (job.phase) setLlmCaptureStatus(job.phase);
      if (job.status === "done") return job.result;
      if (job.status === "error") throw new Error(job.error || "LLM job failed");
    }
  }
  var _a2;
  (_a2 = document.getElementById("llmCaptureSendBtn")) == null ? void 0 : _a2.addEventListener("click", () => {
    if (!llmCaptureNodeId) return;
    const btn = document.getElementById("llmCaptureSendBtn");
    btn.disabled = true;
    btn.textContent = "Capturing\u2026";
    setLlmCaptureStatus("Capturing selected node\u2026");
    postToPlugin("llm-capture:selection", { maxDimension: 2048 });
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
  var WS_PORTS = [9223, 9224, 9225, 9226, 9227, 9228, 9229, 9230, 9231, 9232];
  var bridgeDot = document.getElementById("bridgeDot");
  var bridgeDotMini = document.getElementById("bridgeDotMini");
  var popoverDot = document.getElementById("popoverDot");
  var bridgePortLabel = document.getElementById("bridgePortLabel");
  var bridgePillLabel = document.getElementById("bridgePillLabel");
  var bridgeToggleBtn = document.getElementById("bridgeToggleBtn");
  var bridgePopover = document.getElementById("bridgePopover");
  var bridgeTabBtn = document.getElementById("bridgeTabBtn");
  var bridgeMiniBtn = document.getElementById("bridgeMiniBtn");
  function sendBridgeCommand(method, params = {}, timeoutMs = 15e3) {
    return new Promise((resolve, reject) => {
      const requestId = method.toLowerCase() + "_" + ++requestCounter + "_" + Date.now();
      const timeoutId = setTimeout(() => {
        if (pendingRequests.has(requestId)) {
          pendingRequests.delete(requestId);
          reject(new Error(method + " timed out after " + timeoutMs + "ms"));
        }
      }, timeoutMs);
      pendingRequests.set(requestId, { resolve, reject, timeoutId });
      postToPlugin("bridge:command", { requestId, method, params });
    });
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
    sendBridgeCommand("GET_FILE_INFO", {}).then((result) => {
      if (ws.readyState !== 1 || !result) return;
      const info = result.fileInfo || result;
      if (!info.fileKey) info.fileKey = "local-" + Date.now();
      info.pluginVersion = "0.2.0";
      ws.send(JSON.stringify({ type: "FILE_INFO", data: info }));
    }).catch(() => {
    });
    sendBridgeCommand("REFRESH_VARIABLES", {}, 3e4).then((result) => {
      if (ws.readyState !== 1 || !(result == null ? void 0 : result.data)) return;
      ws.send(JSON.stringify({ type: "VARIABLES_DATA", data: result.data }));
    }).catch(() => {
    });
  }
  function attachWsHandlers(ws, port) {
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (!msg.id || !msg.method) return;
        sendBridgeCommand(msg.method, msg.params || {}, 15e3).then((result) => {
          if (ws.readyState === 1) ws.send(JSON.stringify({ id: msg.id, result }));
        }).catch((err) => {
          if (ws.readyState === 1) ws.send(JSON.stringify({ id: msg.id, error: err.message }));
        });
      } catch (e) {
      }
    };
    ws.onclose = () => {
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
    ws.onerror = () => {
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
    try {
      const ws = new WebSocket("ws://localhost:" + port);
      const t = setTimeout(() => {
        if (ws.readyState !== 1) ws.close();
      }, 3e3);
      ws.onopen = () => {
        clearTimeout(t);
        bridgeWs = ws;
        bridgeWsPort = port;
        bridgeConnected = true;
        bridgeReconnectAttempts = 0;
        updateBridgeUi();
        attachWsHandlers(ws, port);
        initBridgeConnection(ws);
        bridgeStartKeepalive();
      };
      ws.onerror = () => {
        clearTimeout(t);
      };
      ws.onclose = () => {
        clearTimeout(t);
        if (!bridgeConnected && !bridgeUserDisconnected) bridgeConnect();
      };
    } catch (e) {
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
    let found = false;
    let pending = WS_PORTS.length;
    WS_PORTS.forEach((port) => {
      if (found) return;
      try {
        const ws = new WebSocket("ws://localhost:" + port);
        const t = setTimeout(() => {
          if (ws.readyState !== 1) ws.close();
        }, 3e3);
        ws.onopen = () => {
          clearTimeout(t);
          if (found) {
            ws.close();
            return;
          }
          found = true;
          bridgeWs = ws;
          bridgeWsPort = port;
          bridgeConnected = true;
          bridgeReconnectAttempts = 0;
          updateBridgeUi();
          attachWsHandlers(ws, port);
          initBridgeConnection(ws);
          bridgeStartKeepalive();
        };
        ws.onerror = () => {
          clearTimeout(t);
        };
        ws.onclose = () => {
          clearTimeout(t);
          if (!found) {
            pending--;
            if (pending <= 0) {
              bridgeToggleBtn.textContent = "Connect";
              bridgeToggleBtn.disabled = false;
              bridgePortLabel.textContent = "No server found";
            }
          }
        };
      } catch (e) {
        pending--;
        if (pending <= 0 && !found) {
          bridgeToggleBtn.textContent = "Connect";
          bridgeToggleBtn.disabled = false;
        }
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
  var _a3;
  (_a3 = document.getElementById("selectApplyBtn")) == null ? void 0 : _a3.addEventListener("click", () => {
    if (!selectSetId) return;
    const filter = {};
    document.querySelectorAll(".chip.on[data-axis]").forEach((chip) => {
      const axis = chip.dataset.axis;
      if (!filter[axis]) filter[axis] = [];
      filter[axis].push(chip.dataset.value);
    });
    postToPlugin("select:apply-filter", { setId: selectSetId, filter });
  });
  var _a4;
  (_a4 = document.getElementById("selectAllBtn")) == null ? void 0 : _a4.addEventListener("click", () => {
    document.querySelectorAll("#selectAxes .chip").forEach((c) => c.classList.add("on"));
  });
  var _a5;
  (_a5 = document.getElementById("selectNoneBtn")) == null ? void 0 : _a5.addEventListener("click", () => {
    document.querySelectorAll("#selectAxes .chip").forEach((c) => c.classList.remove("on"));
  });
  function setAnnotateStatus(msg, type = "") {
    const el = document.getElementById("annotateStatus");
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  }
  function updateAnnotateSelection(sel) {
    var _a9;
    annotateNodeId = (_a9 = sel == null ? void 0 : sel.id) != null ? _a9 : null;
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
  var _a6;
  (_a6 = document.getElementById("annotateApplyBtn")) == null ? void 0 : _a6.addEventListener("click", () => {
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
  var _a7;
  (_a7 = document.getElementById("annotateClearBtn")) == null ? void 0 : _a7.addEventListener("click", () => {
    if (!annotateNodeId) return;
    const btn = document.getElementById("annotateClearBtn");
    btn.disabled = true;
    setAnnotateStatus("Clearing\u2026");
    postToPlugin("annotate:clear", { nodeId: annotateNodeId });
  });
  function setDocStatus(msg, type = "") {
    const el = document.getElementById("docStatus");
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  }
  function updateDocSelection(sel) {
    var _a9, _b;
    const isSet = (sel == null ? void 0 : sel.nodeType) === "COMPONENT_SET";
    docSetId = isSet ? (_a9 = sel == null ? void 0 : sel.id) != null ? _a9 : null : null;
    const emptyEl = document.getElementById("docSelectionEmpty");
    const infoEl = document.getElementById("docSelectionInfo");
    const nameEl = document.getElementById("docSetName");
    const countEl = document.getElementById("docSetCount");
    const btn = document.getElementById("docGenerateBtn");
    if (isSet && sel) {
      emptyEl.style.display = "none";
      infoEl.style.display = "flex";
      nameEl.textContent = sel.name;
      countEl.textContent = ((_b = sel.variantCount) != null ? _b : 0) + " variants";
      btn.disabled = false;
    } else {
      emptyEl.style.display = "block";
      infoEl.style.display = "none";
      btn.disabled = true;
    }
  }
  var _a8;
  (_a8 = document.getElementById("docGenerateBtn")) == null ? void 0 : _a8.addEventListener("click", () => {
    if (!docSetId) return;
    const btn = document.getElementById("docGenerateBtn");
    btn.disabled = true;
    btn.textContent = "Generating\u2026";
    setDocStatus("");
    postToPlugin("doc:generate", { setId: docSetId });
  });
  window.addEventListener("message", (event) => {
    var _a9, _b, _c;
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
          updateLlmCaptureSelection(sel);
          updateAnnotateSelection(sel);
          updateDocSelection(sel);
          updateCopyBtn(sel, msg.fileKey, msg.fileName, msg.allNodes);
          updateSectionBar(
            !!msg.isSection,
            (_a9 = msg.sectionCount) != null ? _a9 : 0,
            (_b = msg.sectionName) != null ? _b : sel.name
          );
        } else {
          updateLlmCaptureSelection(null);
          updateAnnotateSelection(null);
          updateDocSelection(null);
          updateCopyBtn(null, null);
          updateSectionBar(false, 0, "");
        }
        break;
      }
      case "llm-capture:result": {
        const btn = document.getElementById("llmCaptureSendBtn");
        const resetBtn = () => {
          btn.disabled = !llmCaptureNodeId;
          btn.textContent = "Send Screenshot";
        };
        if (msg.error) {
          resetBtn();
          setLlmCaptureStatus("\u274C " + msg.error, "err");
          break;
        }
        const capture = msg.capture;
        const prompt = (((_c = document.getElementById("llmCapturePrompt")) == null ? void 0 : _c.value) || "").trim();
        setLlmCaptureStatus("Sending image + metadata to local LLM bridge\u2026");
        btn.textContent = "Sending\u2026";
        fetch("http://localhost:4002/llm/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            capture,
            prompt: prompt || "Inspect this Figma selection and summarize the layout, visual system, tokens, and implementation notes."
          })
        }).then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || `LLM bridge returned ${res.status}`);
          if (data.jobId) return pollLlmCaptureJob(data.jobId);
          return data;
        }).then((result) => {
          const label = (result == null ? void 0 : result.fileName) ? `\u2713 Sent \xB7 ${result.fileName}` : (result == null ? void 0 : result.title) ? `\u2713 Sent \xB7 ${result.title}` : "\u2713 Sent to LLM";
          setLlmCaptureStatus(label, "ok");
          resetBtn();
        }).catch((e) => {
          const hint = /Failed to fetch|NetworkError|Load failed/i.test(e.message || "") ? "Local LLM bridge is not running. Run: npm run figma-story" : e.message || "Capture failed";
          setLlmCaptureStatus("\u274C " + hint, "err");
          resetBtn();
        });
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
      case "doc:result": {
        const btn = document.getElementById("docGenerateBtn");
        btn.disabled = !docSetId;
        btn.textContent = "Generate component doc";
        if (msg.error) setDocStatus("\u274C " + msg.error, "err");
        else {
          const vars = msg.variantCount;
          const warn = msg.warning ? " \xB7 \u26A0 " + msg.warning : "";
          setDocStatus(`\u2713 Component doc generated \xB7 ${vars} variant${vars !== 1 ? "s" : ""}${warn}`, "ok");
        }
        break;
      }
    }
  });
  postToPlugin("ui-ready");
  postToPlugin("resize-for-view", { width: 320, height: 460 });
  renderHomeView();
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
