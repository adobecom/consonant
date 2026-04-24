// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function postToPlugin(type: string, payload?: Record<string, unknown>) {
  parent.postMessage({ pluginMessage: { type, ...payload } }, 'https://www.figma.com');
}

// ── Navigation ────────────────────────────────────────────────────────────────

type View = 'home' | 'variables' | 'select' | 'settings' | 'prototype';

const homeView       = document.getElementById('homeView') as HTMLElement;
const variablesPanel = document.getElementById('variablesPanel') as HTMLElement;
const selectPanel    = document.getElementById('selectPanel') as HTMLElement;
const settingsPanel  = document.getElementById('settingsPanel') as HTMLElement;
const protoPanel     = document.getElementById('protoPanel') as HTMLElement;
const headerTitle    = document.getElementById('headerTitle') as HTMLElement;
const backBtn        = document.getElementById('backBtn') as HTMLButtonElement;
const settingsBtn    = document.getElementById('settingsBtn') as HTMLButtonElement;

const views: Record<View, { el: HTMLElement; title: string }> = {
  home:      { el: homeView,       title: 'S2A Toolkit' },
  variables: { el: variablesPanel, title: 'Variables' },
  select:    { el: selectPanel,    title: 'Select Variants' },
  settings:  { el: settingsPanel,  title: 'GitHub Settings' },
  prototype: { el: protoPanel,     title: 'Generate Prototype' },
};

let currentView: View = 'home';

function navigateTo(view: View) {
  currentView = view;
  Object.entries(views).forEach(([key, v]) => {
    v.el.style.display = key === view ? 'block' : 'none';
  });
  headerTitle.textContent = views[view].title;
  backBtn.classList.toggle('visible', view !== 'home');
  settingsBtn.style.display = view === 'settings' ? 'none' : 'flex';

  if (view === 'prototype') {
    postToPlugin('resize-for-view', { width: 520, height: 680 });
    checkServerHealth();
    loadProtoBranches();
  } else {
    postToPlugin('resize-for-view', { width: 320, height: 480 });
  }
}

backBtn.addEventListener('click', () => navigateTo('home'));
settingsBtn.addEventListener('click', () => {
  postToPlugin('get-settings');
  navigateTo('settings');
});

document.querySelectorAll<HTMLButtonElement>('.tool-card').forEach(card => {
  card.addEventListener('click', () => {
    const tool = card.dataset.tool as View;
    if (tool) navigateTo(tool);
  });
});

navigateTo('home');

// ── Bridge ────────────────────────────────────────────────────────────────────

let bridgeConnected = false;
let bridgeWs: WebSocket | null = null;
let bridgeWsPort: number | null = null;
let bridgeKeepaliveTimer: ReturnType<typeof setInterval> | null = null;
let bridgeReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let bridgeReconnectAttempts = 0;
let bridgeUserDisconnected = false;

const BRIDGE_MAX_RECONNECT = 20;
const BRIDGE_RECONNECT_BASE_MS = 2000;
const WS_PORTS = [9220, 9221, 9222, 9223, 9224, 9225, 9226, 9227, 9228, 9229, 9230, 9231, 9232];

const pendingRequests = new Map<string, {
  resolve: (v: any) => void;
  reject: (e: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}>();
let requestCounter = 0;

function sendBridgeCommand(method: string, params: Record<string, unknown> = {}, timeoutMs = 15000): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestId = method.toLowerCase() + '_' + (++requestCounter) + '_' + Date.now();
    const timeoutId = setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        reject(new Error(method + ' timed out after ' + timeoutMs + 'ms'));
      }
    }, timeoutMs);
    pendingRequests.set(requestId, { resolve, reject, timeoutId });
    postToPlugin('bridge:command', { requestId, method, params });
  });
}

// Bridge pill + popover
const bridgePill      = document.getElementById('bridgePill') as HTMLButtonElement;
const bridgeDot       = document.getElementById('bridgeDot') as HTMLElement;
const bridgePillLabel = document.getElementById('bridgePillLabel') as HTMLElement;
const bridgePopover   = document.getElementById('bridgePopover') as HTMLElement;
const popoverDot      = document.getElementById('popoverDot') as HTMLElement;
const popoverLabel    = document.getElementById('popoverLabel') as HTMLElement;
const popoverSub      = document.getElementById('popoverSub') as HTMLElement;
const bridgeToggleBtn = document.getElementById('bridgeToggleBtn') as HTMLButtonElement;

let popoverOpen = false;

bridgePill.addEventListener('click', (e) => {
  e.stopPropagation();
  popoverOpen = !popoverOpen;
  bridgePopover.classList.toggle('open', popoverOpen);
});

document.addEventListener('click', () => {
  if (popoverOpen) { popoverOpen = false; bridgePopover.classList.remove('open'); }
});

bridgePopover.addEventListener('click', e => e.stopPropagation());

bridgeToggleBtn.addEventListener('click', () => {
  if (bridgeConnected) bridgeDisconnect();
  else bridgeConnect();
});

function updateBridgeUi() {
  if (bridgeConnected) {
    bridgeDot.classList.add('on');
    bridgePill.classList.add('connected');
    bridgePillLabel.textContent = 'Claude Code';
    popoverDot.classList.add('on');
    popoverLabel.textContent = 'Connected';
    popoverSub.textContent = 'Variables auto-sync on connect.';
    bridgeToggleBtn.textContent = 'Disconnect';
    bridgeToggleBtn.className = 'btn btn-ghost';
  } else {
    bridgeDot.classList.remove('on');
    bridgePill.classList.remove('connected');
    bridgePillLabel.textContent = 'Connect';
    popoverDot.classList.remove('on');
    popoverLabel.textContent = 'Not connected';
    popoverSub.textContent = 'Start Claude Code, then connect.';
    bridgeToggleBtn.textContent = 'Connect';
    bridgeToggleBtn.className = 'btn';
  }
}

function bridgeStartKeepalive() {
  if (bridgeKeepaliveTimer) clearInterval(bridgeKeepaliveTimer);
  bridgeKeepaliveTimer = setInterval(() => {
    if (bridgeWs?.readyState === 1) try { bridgeWs.send(JSON.stringify({ type: 'PING' })); } catch {}
  }, 15000);
}

function bridgeStopKeepalive() {
  if (bridgeKeepaliveTimer) { clearInterval(bridgeKeepaliveTimer); bridgeKeepaliveTimer = null; }
}

function initBridgeConnection(ws: WebSocket) {
  sendBridgeCommand('GET_FILE_INFO', {}).then(result => {
    if (ws.readyState !== 1 || !result) return;
    const info = result.fileInfo || result;
    if (!info.fileKey) info.fileKey = 'local-' + Date.now();
    info.pluginVersion = '0.1.0';
    ws.send(JSON.stringify({ type: 'FILE_INFO', data: info }));
  }).catch(() => {});

  sendBridgeCommand('REFRESH_VARIABLES', {}, 30000).then(result => {
    if (ws.readyState !== 1 || !result?.data) return;
    ws.send(JSON.stringify({ type: 'VARIABLES_DATA', data: result.data }));
    renderVariables(result.data);
    setVarMeta(result.data.variables.length + ' variables');
  }).catch(() => {});
}

function attachWsHandlers(ws: WebSocket, port: number) {
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (!msg.id || !msg.method) return;

      sendBridgeCommand(msg.method, msg.params || {}, 15000)
        .then(result => { if (ws.readyState === 1) ws.send(JSON.stringify({ id: msg.id, result })); })
        .catch(err => { if (ws.readyState === 1) ws.send(JSON.stringify({ id: msg.id, error: err.message })); });
    } catch {}
  };

  ws.onclose = () => {
    bridgeStopKeepalive();
    bridgeWs = null;
    bridgeConnected = false;
    for (const [, p] of pendingRequests) { clearTimeout(p.timeoutId); p.reject(new Error('Bridge disconnected')); }
    pendingRequests.clear();
    updateBridgeUi();
    if (!bridgeUserDisconnected) scheduleReconnect(port);
  };

  ws.onerror = () => {};
}

function scheduleReconnect(port: number) {
  if (bridgeUserDisconnected || bridgeReconnectAttempts >= BRIDGE_MAX_RECONNECT) return;
  bridgeReconnectAttempts++;
  const delay = Math.min(BRIDGE_RECONNECT_BASE_MS * Math.pow(1.5, bridgeReconnectAttempts - 1), 30000);
  bridgeReconnectTimer = setTimeout(() => {
    if (!bridgeUserDisconnected) reconnectToPort(port);
  }, delay);
}

function reconnectToPort(port: number) {
  try {
    const ws = new WebSocket('ws://localhost:' + port);
    const t = setTimeout(() => { if (ws.readyState !== 1) ws.close(); }, 3000);
    ws.onopen = () => { clearTimeout(t); bridgeWs = ws; bridgeWsPort = port; bridgeConnected = true; bridgeReconnectAttempts = 0; updateBridgeUi(); attachWsHandlers(ws, port); initBridgeConnection(ws); bridgeStartKeepalive(); };
    ws.onerror = () => { clearTimeout(t); };
    ws.onclose = () => { clearTimeout(t); if (!bridgeConnected && !bridgeUserDisconnected) bridgeConnect(); };
  } catch { if (!bridgeUserDisconnected) bridgeConnect(); }
}

function bridgeConnect() {
  bridgeUserDisconnected = false;
  if (bridgeReconnectTimer) { clearTimeout(bridgeReconnectTimer); bridgeReconnectTimer = null; }
  bridgeToggleBtn.textContent = 'Connecting…';
  bridgeToggleBtn.disabled = true;

  let found = false;
  let pending = WS_PORTS.length;

  WS_PORTS.forEach(port => {
    if (found) return;
    try {
      const ws = new WebSocket('ws://localhost:' + port);
      const t = setTimeout(() => { if (ws.readyState !== 1) ws.close(); }, 3000);
      ws.onopen = () => {
        clearTimeout(t);
        if (found) { ws.close(); return; }
        found = true;
        bridgeWs = ws; bridgeWsPort = port; bridgeConnected = true; bridgeReconnectAttempts = 0;
        updateBridgeUi();
        bridgeToggleBtn.disabled = false;
        attachWsHandlers(ws, port);
        initBridgeConnection(ws);
        bridgeStartKeepalive();
      };
      ws.onerror = () => { clearTimeout(t); };
      ws.onclose = () => { clearTimeout(t); if (!found) { pending--; if (pending <= 0) connectFailed(); } };
    } catch { pending--; if (pending <= 0 && !found) connectFailed(); }
  });
}

function connectFailed() {
  bridgeToggleBtn.textContent = 'Connect';
  bridgeToggleBtn.disabled = false;
  popoverSub.textContent = 'No MCP server found — start Claude Code first.';
}

function bridgeDisconnect() {
  bridgeUserDisconnected = true;
  bridgeStopKeepalive();
  if (bridgeReconnectTimer) { clearTimeout(bridgeReconnectTimer); bridgeReconnectTimer = null; }
  try { bridgeWs?.close(); } catch {}
  bridgeWs = null; bridgeWsPort = null; bridgeConnected = false; bridgeReconnectAttempts = 0;
  updateBridgeUi();
}

// ── Variables ─────────────────────────────────────────────────────────────────

let variablesCache: { variables: any[]; variableCollections: any[] } | null = null;

function setVarMeta(text: string) {
  const el = document.getElementById('varMeta');
  if (el) el.textContent = text;
}

function setVarStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('varStatus') as HTMLElement;
  el.textContent = msg;
  el.className = 'status' + (type ? ' ' + type : '');
}

function updateExportButtons() {
  const localBtn  = document.getElementById('varExportLocalBtn')  as HTMLButtonElement;
  const githubBtn = document.getElementById('varExportGithubBtn') as HTMLButtonElement;
  const hasVars = !!variablesCache;
  const hasGhSettings = !!(githubSettings?.token && githubSettings?.owner && githubSettings?.repo);
  if (localBtn)  localBtn.disabled  = !hasVars;
  if (githubBtn) githubBtn.disabled = !hasVars || !hasGhSettings;
}

function renderVariables(data: { variables: any[]; variableCollections: any[] }) {
  variablesCache = data;
  const el = document.getElementById('varCollections') as HTMLElement;
  if (!el) return;

  if (data.variableCollections.length === 0) {
    el.innerHTML = '<div class="empty-state">No collections found</div>';
    return;
  }

  const byCol: Record<string, number> = {};
  for (const v of data.variables) byCol[v.variableCollectionId] = (byCol[v.variableCollectionId] || 0) + 1;

  el.innerHTML = '<div class="collection-list">' + data.variableCollections.map((c: any) =>
    `<div class="collection-row">
      <span class="collection-name">${esc(c.name)}</span>
      <span class="collection-count">${byCol[c.id] || 0}</span>
    </div>`
  ).join('') + '</div>';

  setVarMeta(data.variables.length + ' variables');
  updateExportButtons();
}

document.getElementById('varRefreshBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('varRefreshBtn') as HTMLButtonElement;
  btn.textContent = 'Refreshing…'; btn.disabled = true;
  setVarStatus('Loading…');
  try {
    const result = await sendBridgeCommand('REFRESH_VARIABLES', {}, 30000);
    if (result?.data) { renderVariables(result.data); setVarStatus(result.data.variables.length + ' variables loaded', 'ok'); }
    else setVarStatus('No data returned', 'err');
  } catch (e: any) {
    setVarStatus(e.message || 'Error', 'err');
  } finally {
    btn.textContent = 'Refresh'; btn.disabled = false;
  }
});

// Export Local → dev-server
document.getElementById('varExportLocalBtn')?.addEventListener('click', () => {
  if (!variablesCache) { setVarStatus('No variables — hit Refresh first', 'err'); return; }
  const btn = document.getElementById('varExportLocalBtn') as HTMLButtonElement;
  btn.textContent = 'Exporting…'; btn.disabled = true;
  setVarStatus('Sending to dev-server…');
  fetch('http://localhost:9300/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variablesCache),
  })
    .then(r => r.json())
    .then((data: any) => {
      if (data.ok) setVarStatus(`✓ ${data.variables} vars → dist/css/`, 'ok');
      else setVarStatus('❌ ' + (data.error || 'Build failed'), 'err');
    })
    .catch(() => setVarStatus('❌ Dev server not running — run: npm run dev-server', 'err'))
    .finally(() => { btn.textContent = 'Export Local'; updateExportButtons(); });
});

// Export → GitHub API
document.getElementById('varExportGithubBtn')?.addEventListener('click', async () => {
  if (!variablesCache || !githubSettings?.token) return;
  const btn = document.getElementById('varExportGithubBtn') as HTMLButtonElement;
  btn.textContent = 'Pushing…'; btn.disabled = true;
  setVarStatus('Pushing to GitHub…');
  try {
    await pushToGitHub(variablesCache, githubSettings);
    setVarStatus('✓ Committed to ' + githubSettings.repo + ' / ' + githubSettings.branch, 'ok');
  } catch (e: any) {
    setVarStatus('❌ ' + (e.message || 'GitHub push failed'), 'err');
  } finally {
    btn.textContent = '↑ GitHub'; updateExportButtons();
  }
});

// ── GitHub API ────────────────────────────────────────────────────────────────

interface GitHubSettings {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
}

let githubSettings: GitHubSettings | null = null;

async function pushToGitHub(data: any, settings: GitHubSettings): Promise<void> {
  const { token, owner, repo, branch, filePath } = settings;
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // Get current SHA (needed to update an existing file)
  let sha: string | undefined;
  const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
  if (getRes.ok) {
    sha = (await getRes.json()).sha;
  } else if (getRes.status !== 404) {
    throw new Error((await getRes.json()).message || `GitHub ${getRes.status}`);
  }

  // Encode as base64 (handles Unicode)
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
  const body: Record<string, any> = {
    message: 'chore: sync tokens from Figma',
    content,
    branch,
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(apiBase, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    throw new Error((await putRes.json()).message || `GitHub ${putRes.status}`);
  }
}

// ── Settings ──────────────────────────────────────────────────────────────────

function setSettingsStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('settingsStatus') as HTMLElement;
  el.textContent = msg;
  el.className = 'status' + (type ? ' ' + type : '');
}

function applySettings(settings: GitHubSettings | null) {
  githubSettings = settings;
  if (!settings) return;
  (document.getElementById('ghToken')    as HTMLInputElement).value = settings.token    || '';
  (document.getElementById('ghOwner')    as HTMLInputElement).value = settings.owner    || '';
  (document.getElementById('ghRepo')     as HTMLInputElement).value = settings.repo     || '';
  (document.getElementById('ghBranch')   as HTMLInputElement).value = settings.branch   || 'main';
  (document.getElementById('ghFilePath') as HTMLInputElement).value = settings.filePath || 'packages/toolkit-tokens/json/figma-export.json';
  updateExportButtons();
}

document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
  const settings: GitHubSettings = {
    token:    (document.getElementById('ghToken')    as HTMLInputElement).value.trim(),
    owner:    (document.getElementById('ghOwner')    as HTMLInputElement).value.trim(),
    repo:     (document.getElementById('ghRepo')     as HTMLInputElement).value.trim(),
    branch:   (document.getElementById('ghBranch')   as HTMLInputElement).value.trim() || 'main',
    filePath: (document.getElementById('ghFilePath') as HTMLInputElement).value.trim() || 'packages/toolkit-tokens/json/figma-export.json',
  };
  if (!settings.token || !settings.owner || !settings.repo) {
    setSettingsStatus('Token, owner, and repo are required', 'err');
    return;
  }
  postToPlugin('save-settings', { settings });
});

// ── Select ────────────────────────────────────────────────────────────────────

let selectSetId: string | null = null;

function setSelectMeta(text: string) {
  const el = document.getElementById('selectMeta');
  if (el) el.textContent = text;
}

function renderAxes(setId: string, setName: string, axes: Array<{ name: string; type: string; variantOptions?: string[] }>) {
  selectSetId = setId;

  const empty  = document.getElementById('selectEmpty') as HTMLElement;
  const body   = document.getElementById('selectBody') as HTMLElement;
  const nameEl = document.getElementById('selectSetName') as HTMLElement;
  const axesEl = document.getElementById('selectAxes') as HTMLElement;
  const status = document.getElementById('selectStatus') as HTMLElement;

  empty.style.display = 'none';
  body.style.display = 'block';
  nameEl.textContent = setName;
  if (status) status.textContent = '';

  const variantAxes = axes.filter(a => a.type === 'VARIANT');
  setSelectMeta(setName);

  if (variantAxes.length === 0) {
    axesEl.innerHTML = '<div class="empty-state">No variant axes found</div>';
    return;
  }

  axesEl.innerHTML = variantAxes.map(axis => {
    const chips = (axis.variantOptions || []).map(v =>
      `<button class="chip on" data-axis="${esc(axis.name)}" data-value="${esc(v)}">${esc(v)}</button>`
    ).join('');
    return `<div class="axis-group">
      <div class="axis-label">${esc(axis.name)}</div>
      <div class="axis-values">${chips}</div>
    </div>`;
  }).join('');

  axesEl.querySelectorAll<HTMLButtonElement>('.chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('on'));
  });
}

function clearSelect() {
  selectSetId = null;
  const empty = document.getElementById('selectEmpty') as HTMLElement;
  const body  = document.getElementById('selectBody') as HTMLElement;
  empty.style.display = 'block';
  body.style.display = 'none';
  setSelectMeta('Select a component set');
}

document.getElementById('selectApplyBtn')?.addEventListener('click', () => {
  if (!selectSetId) return;
  const filter: Record<string, string[]> = {};
  document.querySelectorAll<HTMLButtonElement>('.chip.on').forEach(chip => {
    const axis = chip.dataset.axis!;
    if (!filter[axis]) filter[axis] = [];
    filter[axis].push(chip.dataset.value!);
  });
  postToPlugin('select:apply-filter', { setId: selectSetId, filter });
});

document.getElementById('selectAllBtn')?.addEventListener('click', () => {
  document.querySelectorAll<HTMLButtonElement>('.chip').forEach(c => c.classList.add('on'));
});

document.getElementById('selectNoneBtn')?.addEventListener('click', () => {
  document.querySelectorAll<HTMLButtonElement>('.chip').forEach(c => c.classList.remove('on'));
});

// ── Plugin messages ───────────────────────────────────────────────────────────

window.addEventListener('message', (event) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;

  switch (msg.type) {
    case 'bridge:command-result': {
      const p = pendingRequests.get(msg.requestId as string);
      if (p) {
        clearTimeout(p.timeoutId);
        pendingRequests.delete(msg.requestId as string);
        if (msg.success) {
          const result: Record<string, unknown> = { ...msg };
          delete result.type; delete result.requestId;
          p.resolve(result);
        } else {
          p.reject(new Error((msg.error as string) || 'Unknown error'));
        }
      }
      break;
    }
    case 'settings-loaded': {
      applySettings(msg.settings as GitHubSettings | null);
      break;
    }
    case 'settings-saved': {
      if (msg.success) {
        githubSettings = {
          token:    (document.getElementById('ghToken')    as HTMLInputElement).value.trim(),
          owner:    (document.getElementById('ghOwner')    as HTMLInputElement).value.trim(),
          repo:     (document.getElementById('ghRepo')     as HTMLInputElement).value.trim(),
          branch:   (document.getElementById('ghBranch')   as HTMLInputElement).value.trim() || 'main',
          filePath: (document.getElementById('ghFilePath') as HTMLInputElement).value.trim() || 'packages/toolkit-tokens/json/figma-export.json',
        };
        setSettingsStatus('Saved', 'ok');
        updateExportButtons();
      } else {
        setSettingsStatus('Save failed: ' + (msg.error as string), 'err');
      }
      break;
    }
    case 'select:axes': {
      if (msg.setId) renderAxes(msg.setId as string, msg.setName as string, msg.axes as any[]);
      else clearSelect();
      break;
    }
    case 'select:result': {
      const el = document.getElementById('selectStatus') as HTMLElement;
      if (el) { el.textContent = msg.message as string; el.className = 'status ok'; }
      break;
    }
    case 'selection-changed': {
      if (msg.nodeId) {
        updateProtoSelection({
          id: msg.nodeId as string,
          name: msg.nodeName as string,
          nodeType: msg.nodeType as string,
          width: msg.width as number | undefined,
          height: msg.height as number | undefined,
        });
      } else {
        updateProtoSelection(null);
      }
      break;
    }
  }
});

// ── Server health ─────────────────────────────────────────────────────────────

const serverDot         = document.getElementById('serverDot') as HTMLElement;
const serverStatusLabel = document.getElementById('serverStatusLabel') as HTMLElement;

async function checkServerHealth() {
  serverStatusLabel.textContent = 'Checking…';
  serverDot.classList.remove('on');
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch('http://localhost:9400/health', { signal: ctrl.signal });
    clearTimeout(tid);
    const data = await res.json() as { ok?: boolean };
    if (data.ok) {
      serverDot.classList.add('on');
      serverStatusLabel.textContent = 'Servers ready';
    } else {
      serverStatusLabel.textContent = 'Server error — check logs';
    }
  } catch {
    serverStatusLabel.textContent = 'Offline — log in to start servers';
  }
}

document.getElementById('serverRefreshBtn')?.addEventListener('click', checkServerHealth);

// ── Prototype ─────────────────────────────────────────────────────────────────

interface ProtoSelection {
  id: string;
  name: string;
  nodeType: string;
  width?: number;
  height?: number;
}

let protoSelection: ProtoSelection | null = null;

function setProtoMeta(text: string) {
  const el = document.getElementById('protoMeta');
  if (el) el.textContent = text;
}

function setProtoStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('protoStatus') as HTMLElement;
  el.textContent = msg;
  el.className = 'status' + (type ? ' ' + type : '');
}

function updateProtoSelection(sel: ProtoSelection | null) {
  protoSelection = sel;
  const empty    = document.getElementById('protoSelectionEmpty') as HTMLElement;
  const info     = document.getElementById('protoSelectionInfo') as HTMLElement;
  const nameEl   = document.getElementById('protoFrameName') as HTMLElement;
  const typeEl   = document.getElementById('protoFrameType') as HTMLElement;
  const genBtn   = document.getElementById('protoGenerateBtn') as HTMLButtonElement;

  if (sel) {
    empty.style.display = 'none';
    info.style.display = 'flex';
    nameEl.textContent = sel.name;
    typeEl.textContent = sel.nodeType + (sel.width ? ` · ${sel.width}×${sel.height}` : '');
    genBtn.disabled = false;
    setProtoMeta(sel.name);
    // Auto-fill branch name only if the user hasn't typed something custom
    const bi = document.getElementById('branchInput') as HTMLInputElement;
    if (bi && (!bi.value || bi.dataset.autoFilled === 'true')) {
      bi.value = autoBranchName(sel.name);
      bi.dataset.autoFilled = 'true';
    }
  } else {
    empty.style.display = 'block';
    info.style.display = 'none';
    genBtn.disabled = true;
    setProtoMeta('Select a frame to start');
  }
}

type StepState = 'idle' | 'active' | 'done' | 'error';

function setProtoStep(index: number, state: StepState, label?: string) {
  const step = document.getElementById('protoStep' + index);
  if (!step) return;
  step.dataset.state = state;
  if (label) {
    const lbl = step.querySelector('.proto-step-label');
    if (lbl) lbl.textContent = label;
  }
}

function resetProtoSteps() {
  [0, 1, 2, 3].forEach(i => setProtoStep(i, 'idle'));
  const steps      = document.getElementById('protoSteps') as HTMLElement;
  const storyEmbed = document.getElementById('storyEmbed') as HTMLElement;
  const storyIframe = document.getElementById('storyIframe') as HTMLIFrameElement;
  steps.style.display = 'none';
  storyEmbed.style.display = 'none';
  storyIframe.src = 'about:blank';
  storyIframe.style.display = 'none';
  const storyLoading = document.getElementById('storyLoading') as HTMLElement;
  if (storyLoading) storyLoading.style.display = 'none';
  postToPlugin('resize-for-view', { width: 520, height: 680 });
  setProtoStatus('');
}

async function waitForStory(storyId: string, maxAttempts = 20, intervalMs = 2000): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise<void>(r => setTimeout(r, intervalMs));
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 2000);
      const res = await fetch('http://localhost:6006/index.json', { signal: ctrl.signal });
      clearTimeout(tid);
      if (res.ok) {
        const json = await res.json() as { entries?: Record<string, unknown>; stories?: Record<string, unknown> };
        if (json.entries?.[storyId] || json.stories?.[storyId]) return;
      }
    } catch {}
  }
  // Timed out — load anyway so the user sees something
}

document.getElementById('protoGenerateBtn')?.addEventListener('click', async () => {
  if (!protoSelection) return;

  const prompt  = (document.getElementById('protoPrompt') as HTMLTextAreaElement).value.trim();
  const branch  = (document.getElementById('branchInput') as HTMLInputElement).value.trim() || undefined;
  const genBtn  = document.getElementById('protoGenerateBtn') as HTMLButtonElement;
  const steps   = document.getElementById('protoSteps') as HTMLElement;

  genBtn.disabled = true;
  genBtn.textContent = 'Generating…';
  resetProtoSteps();
  steps.style.display = 'flex';
  setProtoStatus('');

  // Step 0: read selection data from plugin
  setProtoStep(0, 'active');
  let selectionData: Record<string, unknown>;
  try {
    const result = await sendBridgeCommand('GET_SELECTION_DATA', {}, 10000);
    selectionData = result.selectionData as Record<string, unknown>;
    setProtoStep(0, 'done');
  } catch (e: any) {
    setProtoStep(0, 'error', 'Reading selection — failed');
    setProtoStatus('Could not read selection: ' + (e.message || 'unknown error'), 'err');
    genBtn.disabled = false;
    genBtn.textContent = 'Generate Prototype';
    return;
  }

  // Steps 1–3: handled by local prototype server
  setProtoStep(1, 'active');
  try {
    const res = await fetch('http://localhost:9400/prototype/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selection: selectionData, prompt, branch }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json() as {
      storyFile?: string;
      branchName?: string;
      prUrl?: string;
      previewUrl?: string;
      checks?: { lint?: boolean; typecheck?: boolean; storybook?: boolean };
    };

    setProtoStep(1, 'done');
    setProtoStep(2, data.checks?.lint && data.checks?.typecheck ? 'done' : 'error');
    setProtoStep(3, data.prUrl ? 'done' : 'idle');
    // Refresh branch list so the new branch appears in the picker
    loadProtoBranches();

    // Show inline Storybook preview
    const storyEmbed  = document.getElementById('storyEmbed') as HTMLElement;
    const storyIframe = document.getElementById('storyIframe') as HTMLIFrameElement;
    const storyOpenBtn = document.getElementById('storyOpenBtn') as HTMLAnchorElement;
    const storyPRBtn   = document.getElementById('storyPRBtn') as HTMLAnchorElement;

    if (data.storyFile) {
      const componentName = (data.storyFile.split('/').pop() || '').replace('.stories.js', '');
      const storyId  = 'prototypes-generated-' + componentName.toLowerCase() + '--default';
      const storyUrl = 'http://localhost:6006/?path=/story/' + storyId;
      storyOpenBtn.href = storyUrl;
      if (data.prUrl) storyPRBtn.href = data.prUrl;

      // Show embed area with loading state while Storybook recompiles
      const storyLoading = document.getElementById('storyLoading') as HTMLElement;
      storyLoading.style.display = 'flex';
      storyIframe.style.display = 'none';
      storyIframe.src = 'about:blank';
      storyEmbed.style.display = 'block';
      postToPlugin('resize-for-view', { width: 520, height: 900 });
      setProtoStatus('⏳ Waiting for Storybook to compile…');

      // Poll index.json until the story appears, then load the iframe
      await waitForStory(storyId);
      storyLoading.style.display = 'none';
      storyIframe.style.display = 'block';
      storyIframe.src = storyUrl;
      setProtoStatus('✓ ' + (data.storyFile.split('/').pop() || 'story') + ' ready', 'ok');
    }

    if (!data.storyFile) {
      setProtoStatus('✓ Done', 'ok');
    }

  } catch (e: any) {
    const msg = e.message || 'Unknown error';
    if (msg.includes('fetch') || msg.includes('NetworkError') || msg.includes('Failed to fetch')) {
      setProtoStep(1, 'error', 'Generating story — server not running');
      setProtoStatus('❌ Prototype server not running — run: npm run prototype-server', 'err');
    } else {
      setProtoStep(1, 'error');
      setProtoStatus('❌ ' + msg, 'err');
    }
  } finally {
    genBtn.disabled = false;
    genBtn.textContent = 'Generate Prototype';
  }
});

// ── Branch picker ─────────────────────────────────────────────────────────────

const branchInput    = document.getElementById('branchInput')    as HTMLInputElement;
const branchPickBtn  = document.getElementById('branchPickBtn')  as HTMLButtonElement;
const branchDropdown = document.getElementById('branchDropdown') as HTMLElement;

let branchDropdownOpen = false;
let cachedProtoBranches: string[] = [];

function autoBranchName(frameName: string): string {
  const slug = frameName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  return `figma-prototype/${slug}-${date}`;
}

function closeBranchDropdown() {
  branchDropdownOpen = false;
  branchDropdown?.classList.remove('open');
}

async function loadProtoBranches() {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch('http://localhost:9400/git/branches', { signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) return;
    const data = await res.json() as { prototypeBranches?: string[] };
    cachedProtoBranches = data.prototypeBranches || [];
  } catch {}
}

function renderBranchDropdown(branches: string[]) {
  if (!branchDropdown) return;
  if (branches.length === 0) {
    branchDropdown.innerHTML = '<div class="branch-dropdown-empty">No existing branches yet</div>';
    return;
  }
  branchDropdown.innerHTML = branches.map(b => {
    const label = b.replace('figma-prototype/', '');
    return `<button class="branch-dropdown-item" data-branch="${b}">${label}</button>`;
  }).join('');
  branchDropdown.querySelectorAll<HTMLButtonElement>('.branch-dropdown-item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (branchInput) { branchInput.value = btn.dataset.branch!; branchInput.dataset.autoFilled = 'false'; }
      closeBranchDropdown();
    });
  });
}

branchInput?.addEventListener('input', () => { branchInput.dataset.autoFilled = 'false'; });

branchPickBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  branchDropdownOpen = !branchDropdownOpen;
  if (branchDropdownOpen) { renderBranchDropdown(cachedProtoBranches); branchDropdown?.classList.add('open'); }
  else closeBranchDropdown();
});

document.addEventListener('click', () => { if (branchDropdownOpen) closeBranchDropdown(); });
branchDropdown?.addEventListener('click', e => e.stopPropagation());

// ── Open in Cursor ────────────────────────────────────────────────────────────

document.getElementById('openCursorBtn')?.addEventListener('click', async () => {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 3000);
    await fetch('http://localhost:9400/open-cursor', { signal: ctrl.signal });
    clearTimeout(tid);
  } catch {}
});

postToPlugin('ui-ready');
postToPlugin('get-settings');
