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
  function updateProtoSelection(_sel) {
  }
  var panels = {
    variables: document.getElementById("variablesPanel"),
    select: document.getElementById("selectPanel"),
    annotate: document.getElementById("annotatePanel"),
    spec: document.getElementById("specPanel"),
    settings: document.getElementById("settingsPanel")
  };
  var activePanel = "variables";
  function switchPanel(panel) {
    activePanel = panel;
    Object.entries(panels).forEach(([key, el]) => {
      el.classList.toggle("active", key === panel);
    });
    document.querySelectorAll(".tab[data-panel]").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.panel === panel);
    });
    if (panel === "settings") postToPlugin("get-settings");
  }
  document.querySelectorAll(".tab[data-panel]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const p = tab.dataset.panel;
      if (p) switchPanel(p);
    });
  });
  var isMini = false;
  var app = document.getElementById("app");
  var toggleMiniBtn = document.getElementById("toggleMiniBtn");
  toggleMiniBtn.addEventListener("click", () => {
    isMini = !isMini;
    app.classList.toggle("mini", isMini);
    postToPlugin("resize-for-view", {
      width: 320,
      height: isMini ? 36 : 460
    });
    if (isMini && popoverOpen) closePopover();
  });
  var copyNodeBtn = document.getElementById("copyNodeBtn");
  var headerSelName = document.getElementById("headerSelName");
  var _copyFileKey = null;
  var _copyFileName = null;
  var _copyAllNodes = [];
  function copyToClipboard(text) {
    var _a11;
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
      (_a11 = navigator.clipboard) == null ? void 0 : _a11.writeText(text).catch(() => {
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
  var BRIDGE_MAX_RECONNECT = 20;
  var BRIDGE_RECONNECT_BASE_MS = 2e3;
  var WS_PORTS = [9220, 9221, 9222, 9223, 9224, 9225, 9226, 9227, 9228, 9229, 9230, 9231, 9232];
  var bridgeConnected = false;
  var bridgeWs = null;
  var bridgeWsPort = null;
  var bridgeKeepaliveTimer = null;
  var bridgeReconnectTimer = null;
  var bridgeReconnectAttempts = 0;
  var bridgeUserDisconnected = false;
  var pendingRequests = /* @__PURE__ */ new Map();
  var requestCounter = 0;
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
  var bridgeDot = document.getElementById("bridgeDot");
  var bridgeDotMini = document.getElementById("bridgeDotMini");
  var popoverDot = document.getElementById("popoverDot");
  var bridgePortLabel = document.getElementById("bridgePortLabel");
  var bridgeToggleBtn = document.getElementById("bridgeToggleBtn");
  var bridgePopover = document.getElementById("bridgePopover");
  var bridgeTabBtn = document.getElementById("bridgeTabBtn");
  var bridgeMiniBtn = document.getElementById("bridgeMiniBtn");
  var popoverOpen = false;
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
  bridgeMiniBtn.addEventListener("click", (e) => {
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
    } else {
      setAllDots(false);
      bridgePortLabel.textContent = "\u2014";
      bridgeToggleBtn.textContent = "Connect";
      bridgeToggleBtn.className = "btn";
      bridgeToggleBtn.disabled = false;
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
      renderVariables(result.data);
      setVarMeta(result.data.variables.length + " variables");
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
    if (bridgeUserDisconnected || bridgeReconnectAttempts >= BRIDGE_MAX_RECONNECT) return;
    bridgeReconnectAttempts++;
    const delay = Math.min(BRIDGE_RECONNECT_BASE_MS * Math.pow(1.5, bridgeReconnectAttempts - 1), 3e4);
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
  var variablesCache = null;
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
  var _a;
  (_a = document.getElementById("varRefreshBtn")) == null ? void 0 : _a.addEventListener("click", async () => {
    const btn = document.getElementById("varRefreshBtn");
    btn.textContent = "Refreshing\u2026";
    btn.disabled = true;
    setVarStatus("Loading\u2026");
    try {
      const result = await sendBridgeCommand("REFRESH_VARIABLES", {}, 3e4);
      if (result == null ? void 0 : result.data) {
        renderVariables(result.data);
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
  var _a2;
  (_a2 = document.getElementById("varExportLocalBtn")) == null ? void 0 : _a2.addEventListener("click", () => {
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
  var _a3;
  (_a3 = document.getElementById("varExportGithubBtn")) == null ? void 0 : _a3.addEventListener("click", async () => {
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
  var githubSettings = null;
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
  var _a4;
  (_a4 = document.getElementById("saveSettingsBtn")) == null ? void 0 : _a4.addEventListener("click", () => {
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
  var selectSetId = null;
  function renderAxes(setId, setName, axes) {
    selectSetId = setId;
    const empty = document.getElementById("selectEmpty");
    const body = document.getElementById("selectBody");
    const nameEl = document.getElementById("selectSetName");
    const axesEl = document.getElementById("selectAxes");
    const status = document.getElementById("selectStatus");
    empty.style.display = "none";
    body.style.display = "block";
    nameEl.textContent = setName;
    if (status) status.textContent = "";
    const variantAxes = axes.filter((a) => a.type === "VARIANT");
    if (variantAxes.length === 0) {
      axesEl.innerHTML = '<div class="empty-state">No variant axes found</div>';
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
  var _a5;
  (_a5 = document.getElementById("selectApplyBtn")) == null ? void 0 : _a5.addEventListener("click", () => {
    if (!selectSetId) return;
    const filter = {};
    document.querySelectorAll(".chip.on[data-axis]").forEach((chip) => {
      const axis = chip.dataset.axis;
      if (!filter[axis]) filter[axis] = [];
      filter[axis].push(chip.dataset.value);
    });
    postToPlugin("select:apply-filter", { setId: selectSetId, filter });
  });
  var _a6;
  (_a6 = document.getElementById("selectAllBtn")) == null ? void 0 : _a6.addEventListener("click", () => {
    document.querySelectorAll("#selectAxes .chip").forEach((c) => c.classList.add("on"));
  });
  var _a7;
  (_a7 = document.getElementById("selectNoneBtn")) == null ? void 0 : _a7.addEventListener("click", () => {
    document.querySelectorAll("#selectAxes .chip").forEach((c) => c.classList.remove("on"));
  });
  var annotateNodeId = null;
  function setAnnotateStatus(msg, type = "") {
    const el = document.getElementById("annotateStatus");
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  }
  function updateAnnotateSelection(sel) {
    var _a11;
    annotateNodeId = (_a11 = sel == null ? void 0 : sel.id) != null ? _a11 : null;
    const empty = document.getElementById("annotateSelectionEmpty");
    const info = document.getElementById("annotateSelectionInfo");
    const nameEl = document.getElementById("annotateNodeName");
    const typeEl = document.getElementById("annotateNodeType");
    const applyBtn = document.getElementById("annotateApplyBtn");
    if (sel) {
      empty.style.display = "none";
      info.style.display = "flex";
      nameEl.textContent = sel.name;
      typeEl.textContent = sel.nodeType;
      applyBtn.disabled = false;
    } else {
      empty.style.display = "block";
      info.style.display = "none";
      applyBtn.disabled = true;
    }
  }
  document.querySelectorAll("#annotateCats .chip").forEach((chip) => {
    chip.addEventListener("click", () => chip.classList.toggle("on"));
  });
  var _a8;
  (_a8 = document.getElementById("annotateApplyBtn")) == null ? void 0 : _a8.addEventListener("click", () => {
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
  var _a9;
  (_a9 = document.getElementById("annotateClearBtn")) == null ? void 0 : _a9.addEventListener("click", () => {
    if (!annotateNodeId) return;
    const btn = document.getElementById("annotateClearBtn");
    btn.disabled = true;
    setAnnotateStatus("Clearing\u2026");
    postToPlugin("annotate:clear", { nodeId: annotateNodeId });
  });
  var specSetId = null;
  function setSpecStatus(msg, type = "") {
    const el = document.getElementById("specStatus");
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  }
  function updateSpecSelection(sel) {
    var _a11, _b;
    const isSet = (sel == null ? void 0 : sel.nodeType) === "COMPONENT_SET";
    specSetId = isSet ? (_a11 = sel == null ? void 0 : sel.id) != null ? _a11 : null : null;
    const empty = document.getElementById("specSelectionEmpty");
    const info = document.getElementById("specSelectionInfo");
    const nameEl = document.getElementById("specSetName");
    const countEl = document.getElementById("specSetCount");
    const genBtn = document.getElementById("specGenerateBtn");
    if (isSet && sel) {
      empty.style.display = "none";
      info.style.display = "flex";
      nameEl.textContent = sel.name;
      countEl.textContent = ((_b = sel.variantCount) != null ? _b : 0) + " variants";
      genBtn.disabled = false;
    } else {
      empty.style.display = "block";
      info.style.display = "none";
      genBtn.disabled = true;
    }
  }
  document.querySelectorAll("#specOpts .chip").forEach((chip) => {
    chip.addEventListener("click", () => chip.classList.toggle("on"));
  });
  var _a10;
  (_a10 = document.getElementById("specGenerateBtn")) == null ? void 0 : _a10.addEventListener("click", () => {
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
  window.addEventListener("message", (event) => {
    var _a11, _b;
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
            width: msg.width,
            height: msg.height,
            variantCount: msg.variantCount
          };
          updateProtoSelection(sel);
          updateAnnotateSelection(sel);
          updateSpecSelection(sel);
          updateCopyBtn(sel, msg.fileKey, msg.fileName, msg.allNodes);
          updateSectionBar(
            !!msg.isSection,
            (_a11 = msg.sectionCount) != null ? _a11 : 0,
            (_b = msg.sectionName) != null ? _b : sel.name
          );
        } else {
          updateProtoSelection(null);
          updateAnnotateSelection(null);
          updateSpecSelection(null);
          updateCopyBtn(null, null);
          updateSectionBar(false, 0, "");
        }
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
    }
  });
  postToPlugin("ui-ready");
  postToPlugin("get-settings");
  postToPlugin("resize-for-view", { width: 320, height: 460 });
})();
