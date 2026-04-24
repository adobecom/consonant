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
  var homeView = document.getElementById("homeView");
  var variablesPanel = document.getElementById("variablesPanel");
  var selectPanel = document.getElementById("selectPanel");
  var settingsPanel = document.getElementById("settingsPanel");
  var protoPanel = document.getElementById("protoPanel");
  var headerTitle = document.getElementById("headerTitle");
  var backBtn = document.getElementById("backBtn");
  var settingsBtn = document.getElementById("settingsBtn");
  var views = {
    home: { el: homeView, title: "S2A Toolkit" },
    variables: { el: variablesPanel, title: "Variables" },
    select: { el: selectPanel, title: "Select Variants" },
    settings: { el: settingsPanel, title: "GitHub Settings" },
    prototype: { el: protoPanel, title: "Generate Prototype" }
  };
  var currentView = "home";
  function navigateTo(view) {
    currentView = view;
    Object.entries(views).forEach(([key, v]) => {
      v.el.style.display = key === view ? "block" : "none";
    });
    headerTitle.textContent = views[view].title;
    backBtn.classList.toggle("visible", view !== "home");
    settingsBtn.style.display = view === "settings" ? "none" : "flex";
    if (view === "prototype") {
      postToPlugin("resize-for-view", { width: 520, height: 680 });
      checkServerHealth();
    } else {
      postToPlugin("resize-for-view", { width: 320, height: 480 });
    }
  }
  backBtn.addEventListener("click", () => navigateTo("home"));
  settingsBtn.addEventListener("click", () => {
    postToPlugin("get-settings");
    navigateTo("settings");
  });
  document.querySelectorAll(".tool-card").forEach((card) => {
    card.addEventListener("click", () => {
      const tool = card.dataset.tool;
      if (tool) navigateTo(tool);
    });
  });
  navigateTo("home");
  var bridgeConnected = false;
  var bridgeWs = null;
  var bridgeWsPort = null;
  var bridgeKeepaliveTimer = null;
  var bridgeReconnectTimer = null;
  var bridgeReconnectAttempts = 0;
  var bridgeUserDisconnected = false;
  var BRIDGE_MAX_RECONNECT = 20;
  var BRIDGE_RECONNECT_BASE_MS = 2e3;
  var WS_PORTS = [9220, 9221, 9222, 9223, 9224, 9225, 9226, 9227, 9228, 9229, 9230, 9231, 9232];
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
  var bridgePill = document.getElementById("bridgePill");
  var bridgeDot = document.getElementById("bridgeDot");
  var bridgePillLabel = document.getElementById("bridgePillLabel");
  var bridgePopover = document.getElementById("bridgePopover");
  var popoverDot = document.getElementById("popoverDot");
  var popoverLabel = document.getElementById("popoverLabel");
  var popoverSub = document.getElementById("popoverSub");
  var bridgeToggleBtn = document.getElementById("bridgeToggleBtn");
  var popoverOpen = false;
  bridgePill.addEventListener("click", (e) => {
    e.stopPropagation();
    popoverOpen = !popoverOpen;
    bridgePopover.classList.toggle("open", popoverOpen);
  });
  document.addEventListener("click", () => {
    if (popoverOpen) {
      popoverOpen = false;
      bridgePopover.classList.remove("open");
    }
  });
  bridgePopover.addEventListener("click", (e) => e.stopPropagation());
  bridgeToggleBtn.addEventListener("click", () => {
    if (bridgeConnected) bridgeDisconnect();
    else bridgeConnect();
  });
  function updateBridgeUi() {
    if (bridgeConnected) {
      bridgeDot.classList.add("on");
      bridgePill.classList.add("connected");
      bridgePillLabel.textContent = "Claude Code";
      popoverDot.classList.add("on");
      popoverLabel.textContent = "Connected";
      popoverSub.textContent = "Variables auto-sync on connect.";
      bridgeToggleBtn.textContent = "Disconnect";
      bridgeToggleBtn.className = "btn btn-ghost";
    } else {
      bridgeDot.classList.remove("on");
      bridgePill.classList.remove("connected");
      bridgePillLabel.textContent = "Connect";
      popoverDot.classList.remove("on");
      popoverLabel.textContent = "Not connected";
      popoverSub.textContent = "Start Claude Code, then connect.";
      bridgeToggleBtn.textContent = "Connect";
      bridgeToggleBtn.className = "btn";
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
      info.pluginVersion = "0.1.0";
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
          bridgeToggleBtn.disabled = false;
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
            if (pending <= 0) connectFailed();
          }
        };
      } catch (e) {
        pending--;
        if (pending <= 0 && !found) connectFailed();
      }
    });
  }
  function connectFailed() {
    bridgeToggleBtn.textContent = "Connect";
    bridgeToggleBtn.disabled = false;
    popoverSub.textContent = "No MCP server found \u2014 start Claude Code first.";
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
  function setVarMeta(text) {
    const el = document.getElementById("varMeta");
    if (el) el.textContent = text;
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
    el.innerHTML = '<div class="collection-list">' + data.variableCollections.map(
      (c) => `<div class="collection-row">
      <span class="collection-name">${esc(c.name)}</span>
      <span class="collection-count">${byCol[c.id] || 0}</span>
    </div>`
    ).join("") + "</div>";
    setVarMeta(data.variables.length + " variables");
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
      } else setVarStatus("No data returned", "err");
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
      btn.textContent = "Export Local";
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
    if (getRes.ok) {
      sha = (await getRes.json()).sha;
    } else if (getRes.status !== 404) {
      throw new Error((await getRes.json()).message || `GitHub ${getRes.status}`);
    }
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    const body = {
      message: "chore: sync tokens from Figma",
      content,
      branch
    };
    if (sha) body.sha = sha;
    const putRes = await fetch(apiBase, {
      method: "PUT",
      headers,
      body: JSON.stringify(body)
    });
    if (!putRes.ok) {
      throw new Error((await putRes.json()).message || `GitHub ${putRes.status}`);
    }
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
  function setSelectMeta(text) {
    const el = document.getElementById("selectMeta");
    if (el) el.textContent = text;
  }
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
    setSelectMeta(setName);
    if (variantAxes.length === 0) {
      axesEl.innerHTML = '<div class="empty-state">No variant axes found</div>';
      return;
    }
    axesEl.innerHTML = variantAxes.map((axis) => {
      const chips = (axis.variantOptions || []).map(
        (v) => `<button class="chip on" data-axis="${esc(axis.name)}" data-value="${esc(v)}">${esc(v)}</button>`
      ).join("");
      return `<div class="axis-group">
      <div class="axis-label">${esc(axis.name)}</div>
      <div class="axis-values">${chips}</div>
    </div>`;
    }).join("");
    axesEl.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => chip.classList.toggle("on"));
    });
  }
  function clearSelect() {
    selectSetId = null;
    const empty = document.getElementById("selectEmpty");
    const body = document.getElementById("selectBody");
    empty.style.display = "block";
    body.style.display = "none";
    setSelectMeta("Select a component set");
  }
  var _a5;
  (_a5 = document.getElementById("selectApplyBtn")) == null ? void 0 : _a5.addEventListener("click", () => {
    if (!selectSetId) return;
    const filter = {};
    document.querySelectorAll(".chip.on").forEach((chip) => {
      const axis = chip.dataset.axis;
      if (!filter[axis]) filter[axis] = [];
      filter[axis].push(chip.dataset.value);
    });
    postToPlugin("select:apply-filter", { setId: selectSetId, filter });
  });
  var _a6;
  (_a6 = document.getElementById("selectAllBtn")) == null ? void 0 : _a6.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.add("on"));
  });
  var _a7;
  (_a7 = document.getElementById("selectNoneBtn")) == null ? void 0 : _a7.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("on"));
  });
  window.addEventListener("message", (event) => {
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
      case "settings-loaded": {
        applySettings(msg.settings);
        break;
      }
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
          updateProtoSelection({
            id: msg.nodeId,
            name: msg.nodeName,
            nodeType: msg.nodeType,
            width: msg.width,
            height: msg.height
          });
        } else {
          updateProtoSelection(null);
        }
        break;
      }
    }
  });
  var serverDot = document.getElementById("serverDot");
  var serverStatusLabel = document.getElementById("serverStatusLabel");
  async function checkServerHealth() {
    serverStatusLabel.textContent = "Checking\u2026";
    serverDot.classList.remove("on");
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 3e3);
      const res = await fetch("http://localhost:9400/health", { signal: ctrl.signal });
      clearTimeout(tid);
      const data = await res.json();
      if (data.ok) {
        serverDot.classList.add("on");
        serverStatusLabel.textContent = "Servers ready";
      } else {
        serverStatusLabel.textContent = "Server error \u2014 check logs";
      }
    } catch (e) {
      serverStatusLabel.textContent = "Offline \u2014 log in to start servers";
    }
  }
  var _a8;
  (_a8 = document.getElementById("serverRefreshBtn")) == null ? void 0 : _a8.addEventListener("click", checkServerHealth);
  var protoSelection = null;
  function setProtoMeta(text) {
    const el = document.getElementById("protoMeta");
    if (el) el.textContent = text;
  }
  function setProtoStatus(msg, type = "") {
    const el = document.getElementById("protoStatus");
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
  }
  function updateProtoSelection(sel) {
    protoSelection = sel;
    const empty = document.getElementById("protoSelectionEmpty");
    const info = document.getElementById("protoSelectionInfo");
    const nameEl = document.getElementById("protoFrameName");
    const typeEl = document.getElementById("protoFrameType");
    const genBtn = document.getElementById("protoGenerateBtn");
    if (sel) {
      empty.style.display = "none";
      info.style.display = "flex";
      nameEl.textContent = sel.name;
      typeEl.textContent = sel.nodeType + (sel.width ? ` \xB7 ${sel.width}\xD7${sel.height}` : "");
      genBtn.disabled = false;
      setProtoMeta(sel.name);
    } else {
      empty.style.display = "block";
      info.style.display = "none";
      genBtn.disabled = true;
      setProtoMeta("Select a frame to start");
    }
  }
  function setProtoStep(index, state, label) {
    const step = document.getElementById("protoStep" + index);
    if (!step) return;
    step.dataset.state = state;
    if (label) {
      const lbl = step.querySelector(".proto-step-label");
      if (lbl) lbl.textContent = label;
    }
  }
  function resetProtoSteps() {
    [0, 1, 2, 3].forEach((i) => setProtoStep(i, "idle"));
    const steps = document.getElementById("protoSteps");
    const storyEmbed = document.getElementById("storyEmbed");
    const storyIframe = document.getElementById("storyIframe");
    steps.style.display = "none";
    storyEmbed.style.display = "none";
    storyIframe.src = "about:blank";
    storyIframe.style.display = "none";
    const storyLoading = document.getElementById("storyLoading");
    if (storyLoading) storyLoading.style.display = "none";
    postToPlugin("resize-for-view", { width: 520, height: 680 });
    setProtoStatus("");
  }
  async function waitForStory(storyId, maxAttempts = 20, intervalMs = 2e3) {
    var _a10, _b;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, intervalMs));
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 2e3);
        const res = await fetch("http://localhost:6006/index.json", { signal: ctrl.signal });
        clearTimeout(tid);
        if (res.ok) {
          const json = await res.json();
          if (((_a10 = json.entries) == null ? void 0 : _a10[storyId]) || ((_b = json.stories) == null ? void 0 : _b[storyId])) return;
        }
      } catch (e) {
      }
    }
  }
  var _a9;
  (_a9 = document.getElementById("protoGenerateBtn")) == null ? void 0 : _a9.addEventListener("click", async () => {
    var _a10, _b;
    if (!protoSelection) return;
    const prompt = document.getElementById("protoPrompt").value.trim();
    const genBtn = document.getElementById("protoGenerateBtn");
    const steps = document.getElementById("protoSteps");
    genBtn.disabled = true;
    genBtn.textContent = "Generating\u2026";
    resetProtoSteps();
    steps.style.display = "flex";
    setProtoStatus("");
    setProtoStep(0, "active");
    let selectionData;
    try {
      const result = await sendBridgeCommand("GET_SELECTION_DATA", {}, 1e4);
      selectionData = result.selectionData;
      setProtoStep(0, "done");
    } catch (e) {
      setProtoStep(0, "error", "Reading selection \u2014 failed");
      setProtoStatus("Could not read selection: " + (e.message || "unknown error"), "err");
      genBtn.disabled = false;
      genBtn.textContent = "Generate Prototype";
      return;
    }
    setProtoStep(1, "active");
    try {
      const res = await fetch("http://localhost:9400/prototype/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selection: selectionData, prompt })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setProtoStep(1, "done");
      setProtoStep(2, ((_a10 = data.checks) == null ? void 0 : _a10.lint) && ((_b = data.checks) == null ? void 0 : _b.typecheck) ? "done" : "error");
      setProtoStep(3, data.prUrl ? "done" : "idle");
      const storyEmbed = document.getElementById("storyEmbed");
      const storyIframe = document.getElementById("storyIframe");
      const storyOpenBtn = document.getElementById("storyOpenBtn");
      const storyPRBtn = document.getElementById("storyPRBtn");
      if (data.storyFile) {
        const componentName = (data.storyFile.split("/").pop() || "").replace(".stories.js", "");
        const storyId = "prototypes-generated-" + componentName.toLowerCase() + "--default";
        const storyUrl = "http://localhost:6006/?path=/story/" + storyId;
        storyOpenBtn.href = storyUrl;
        if (data.prUrl) storyPRBtn.href = data.prUrl;
        const storyLoading = document.getElementById("storyLoading");
        storyLoading.style.display = "flex";
        storyIframe.style.display = "none";
        storyIframe.src = "about:blank";
        storyEmbed.style.display = "block";
        postToPlugin("resize-for-view", { width: 520, height: 900 });
        setProtoStatus("\u23F3 Waiting for Storybook to compile\u2026");
        await waitForStory(storyId);
        storyLoading.style.display = "none";
        storyIframe.style.display = "block";
        storyIframe.src = storyUrl;
        setProtoStatus("\u2713 " + (data.storyFile.split("/").pop() || "story") + " ready", "ok");
      }
      if (!data.storyFile) {
        setProtoStatus("\u2713 Done", "ok");
      }
    } catch (e) {
      const msg = e.message || "Unknown error";
      if (msg.includes("fetch") || msg.includes("NetworkError") || msg.includes("Failed to fetch")) {
        setProtoStep(1, "error", "Generating story \u2014 server not running");
        setProtoStatus("\u274C Prototype server not running \u2014 run: npm run prototype-server", "err");
      } else {
        setProtoStep(1, "error");
        setProtoStatus("\u274C " + msg, "err");
      }
    } finally {
      genBtn.disabled = false;
      genBtn.textContent = "Generate Prototype";
    }
  });
  postToPlugin("ui-ready");
  postToPlugin("get-settings");
})();
