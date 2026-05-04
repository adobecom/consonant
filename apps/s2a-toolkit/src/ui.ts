// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function postToPlugin(type: string, payload?: Record<string, unknown>) {
  parent.postMessage({ pluginMessage: { type, ...payload } }, 'https://www.figma.com');
}

// Stub — prototype chat panel removed
function updateProtoSelection(_sel: { id: string; name: string; nodeType: string } | null) {}

// ── Tab navigation ────────────────────────────────────────────────────────────

type Panel = 'variables' | 'select' | 'annotate' | 'spec' | 'settings';

const panels: Record<Panel, HTMLElement> = {
  variables: document.getElementById('variablesPanel') as HTMLElement,
  select:    document.getElementById('selectPanel')    as HTMLElement,
  annotate:  document.getElementById('annotatePanel')  as HTMLElement,
  spec:      document.getElementById('specPanel')      as HTMLElement,
  settings:  document.getElementById('settingsPanel')  as HTMLElement,
};

let activePanel: Panel = 'variables';

function switchPanel(panel: Panel) {
  activePanel = panel;
  Object.entries(panels).forEach(([key, el]) => {
    el.classList.toggle('active', key === panel);
  });
  document.querySelectorAll<HTMLButtonElement>('.tab[data-panel]').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.panel === panel);
  });
  if (panel === 'settings') postToPlugin('get-settings');
}

document.querySelectorAll<HTMLButtonElement>('.tab[data-panel]').forEach(tab => {
  tab.addEventListener('click', () => {
    const p = tab.dataset.panel as Panel;
    if (p) switchPanel(p);
  });
});

// ── Minimize / expand ─────────────────────────────────────────────────────────

let isMini = false;
const app = document.getElementById('app') as HTMLElement;

const toggleMiniBtn = document.getElementById('toggleMiniBtn') as HTMLButtonElement;

toggleMiniBtn.addEventListener('click', () => {
  isMini = !isMini;
  app.classList.toggle('mini', isMini);
  postToPlugin('resize-for-view', {
    width: 320,
    height: isMini ? 36 : 460,
  });
  if (isMini && popoverOpen) closePopover();
});

// ── Copy frame link ───────────────────────────────────────────────────────────

const copyNodeBtn  = document.getElementById('copyNodeBtn')  as HTMLButtonElement;
const headerSelName = document.getElementById('headerSelName') as HTMLElement;

let _copyFileKey: string | null = null;
let _copyNodeId:  string | null = null;
let _copyFileName: string | null = null;

function updateCopyBtn(
  sel: { id: string; name: string; nodeType: string } | null,
  fileKey: string | null,
  fileName?: string | null,
) {
  _copyFileKey  = fileKey;
  _copyNodeId   = sel?.id ?? null;
  _copyFileName = fileName ?? null;

  const hasNode = !!(sel && fileKey);
  copyNodeBtn.classList.toggle('hidden', !hasNode);

  // Mini header selection label
  if (sel) {
    headerSelName.textContent = sel.name;
    headerSelName.classList.add('has-sel');
  } else {
    headerSelName.textContent = '—';
    headerSelName.classList.remove('has-sel');
  }
}

copyNodeBtn.addEventListener('click', () => {
  if (!_copyFileKey || !_copyNodeId) return;
  const slug = (_copyFileName || 'file')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const nid = _copyNodeId.replace(':', '-');
  const url = `https://www.figma.com/design/${_copyFileKey}/${slug}?node-id=${nid}`;
  navigator.clipboard.writeText(url).catch(() => {});
  // Briefly flash the button
  copyNodeBtn.style.color = 'var(--accent)';
  setTimeout(() => { copyNodeBtn.style.color = ''; }, 1200);
});

// ── Bridge ────────────────────────────────────────────────────────────────────

const BRIDGE_MAX_RECONNECT    = 20;
const BRIDGE_RECONNECT_BASE_MS = 2000;
const WS_PORTS = [9220,9221,9222,9223,9224,9225,9226,9227,9228,9229,9230,9231,9232];

let bridgeConnected      = false;
let bridgeWs: WebSocket | null = null;
let bridgeWsPort: number | null = null;
let bridgeKeepaliveTimer: ReturnType<typeof setInterval> | null = null;
let bridgeReconnectTimer: ReturnType<typeof setTimeout>  | null = null;
let bridgeReconnectAttempts = 0;
let bridgeUserDisconnected  = false;

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

const bridgeDot       = document.getElementById('bridgeDot')       as HTMLElement;
const bridgeDotMini   = document.getElementById('bridgeDotMini')   as HTMLElement;
const popoverDot      = document.getElementById('popoverDot')      as HTMLElement;
const bridgePortLabel = document.getElementById('bridgePortLabel') as HTMLElement;
const bridgeToggleBtn = document.getElementById('bridgeToggleBtn') as HTMLButtonElement;
const bridgePopover   = document.getElementById('bridgePopover')   as HTMLElement;
const bridgeTabBtn    = document.getElementById('bridgeTabBtn')    as HTMLButtonElement;
const bridgeMiniBtn   = document.getElementById('bridgeMiniBtn')   as HTMLButtonElement;

let popoverOpen = false;
function openPopover()  { popoverOpen = true;  bridgePopover.classList.add('open'); }
function closePopover() { popoverOpen = false; bridgePopover.classList.remove('open'); }

bridgeTabBtn.addEventListener('click',  (e) => { e.stopPropagation(); popoverOpen ? closePopover() : openPopover(); });
bridgeMiniBtn.addEventListener('click', (e) => { e.stopPropagation(); popoverOpen ? closePopover() : openPopover(); });
document.addEventListener('click', () => { if (popoverOpen) closePopover(); });
bridgePopover.addEventListener('click', e => e.stopPropagation());

bridgeToggleBtn.addEventListener('click', () => {
  if (bridgeConnected) bridgeDisconnect(); else bridgeConnect();
});

function setAllDots(on: boolean) {
  [bridgeDot, bridgeDotMini, popoverDot].forEach(el => el?.classList.toggle('on', on));
}

function updateBridgeUi() {
  if (bridgeConnected) {
    setAllDots(true);
    bridgePortLabel.textContent = 'Port ' + bridgeWsPort;
    bridgeToggleBtn.textContent = 'Disconnect';
    bridgeToggleBtn.className   = 'btn btn-ghost';
  } else {
    setAllDots(false);
    bridgePortLabel.textContent = '—';
    bridgeToggleBtn.textContent = 'Connect';
    bridgeToggleBtn.className   = 'btn';
    bridgeToggleBtn.disabled    = false;
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
    info.pluginVersion = '0.2.0';
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
        .catch(err  => { if (ws.readyState === 1) ws.send(JSON.stringify({ id: msg.id, error: err.message })); });
    } catch {}
  };
  ws.onclose = () => {
    bridgeStopKeepalive();
    bridgeWs = null; bridgeConnected = false;
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
    ws.onopen = () => {
      clearTimeout(t);
      bridgeWs = ws; bridgeWsPort = port; bridgeConnected = true; bridgeReconnectAttempts = 0;
      updateBridgeUi(); attachWsHandlers(ws, port); initBridgeConnection(ws); bridgeStartKeepalive();
    };
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
        attachWsHandlers(ws, port); initBridgeConnection(ws); bridgeStartKeepalive();
      };
      ws.onerror = () => { clearTimeout(t); };
      ws.onclose = () => {
        clearTimeout(t);
        if (!found) {
          pending--;
          if (pending <= 0) {
            bridgeToggleBtn.textContent = 'Connect';
            bridgeToggleBtn.disabled    = false;
            bridgePortLabel.textContent = 'No server found';
          }
        }
      };
    } catch { pending--; if (pending <= 0 && !found) { bridgeToggleBtn.textContent = 'Connect'; bridgeToggleBtn.disabled = false; } }
  });
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

function setVarMeta(_text: string) {}  // no meta field in new design

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

  el.innerHTML = data.variableCollections.map((c: any) =>
    `<div class="collection-row">
      <span class="collection-name">${esc(c.name)}</span>
      <span class="collection-count">${byCol[c.id] || 0}</span>
    </div>`
  ).join('');

  updateExportButtons();
}

document.getElementById('varRefreshBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('varRefreshBtn') as HTMLButtonElement;
  btn.textContent = 'Refreshing…'; btn.disabled = true;
  setVarStatus('Loading…');
  try {
    const result = await sendBridgeCommand('REFRESH_VARIABLES', {}, 30000);
    if (result?.data) {
      renderVariables(result.data);
      setVarStatus(result.data.variables.length + ' variables loaded', 'ok');
    } else {
      setVarStatus('No data returned', 'err');
    }
  } catch (e: any) {
    setVarStatus(e.message || 'Error', 'err');
  } finally {
    btn.textContent = 'Refresh'; btn.disabled = false;
  }
});

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
    .finally(() => { btn.textContent = 'Local'; updateExportButtons(); });
});

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
  token: string; owner: string; repo: string; branch: string; filePath: string;
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
  let sha: string | undefined;
  const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
  if (getRes.ok) sha = (await getRes.json()).sha;
  else if (getRes.status !== 404) throw new Error((await getRes.json()).message || `GitHub ${getRes.status}`);
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
  const body: Record<string, any> = { message: 'chore: sync tokens from Figma', content, branch };
  if (sha) body.sha = sha;
  const putRes = await fetch(apiBase, { method: 'PUT', headers, body: JSON.stringify(body) });
  if (!putRes.ok) throw new Error((await putRes.json()).message || `GitHub ${putRes.status}`);
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

function renderAxes(setId: string, setName: string, axes: Array<{ name: string; type: string; variantOptions?: string[] }>) {
  selectSetId = setId;
  const empty  = document.getElementById('selectEmpty') as HTMLElement;
  const body   = document.getElementById('selectBody')  as HTMLElement;
  const nameEl = document.getElementById('selectSetName') as HTMLElement;
  const axesEl = document.getElementById('selectAxes') as HTMLElement;
  const status = document.getElementById('selectStatus') as HTMLElement;

  empty.style.display = 'none';
  body.style.display = 'block';
  nameEl.textContent = setName;
  if (status) status.textContent = '';

  const variantAxes = axes.filter(a => a.type === 'VARIANT');

  if (variantAxes.length === 0) {
    axesEl.innerHTML = '<div class="empty-state">No variant axes found</div>';
    return;
  }

  axesEl.innerHTML = variantAxes.map(axis =>
    `<div class="axis-group">
      <div class="axis-label">${esc(axis.name)}</div>
      <div class="axis-values">${(axis.variantOptions || []).map(v =>
        `<button class="chip on" data-axis="${esc(axis.name)}" data-value="${esc(v)}">${esc(v)}</button>`
      ).join('')}</div>
    </div>`
  ).join('');

  axesEl.querySelectorAll<HTMLButtonElement>('.chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('on'));
  });
}

function clearSelect() {
  selectSetId = null;
  (document.getElementById('selectEmpty') as HTMLElement).style.display = 'block';
  (document.getElementById('selectBody')  as HTMLElement).style.display = 'none';
}

document.getElementById('selectApplyBtn')?.addEventListener('click', () => {
  if (!selectSetId) return;
  const filter: Record<string, string[]> = {};
  document.querySelectorAll<HTMLButtonElement>('.chip.on[data-axis]').forEach(chip => {
    const axis = chip.dataset.axis!;
    if (!filter[axis]) filter[axis] = [];
    filter[axis].push(chip.dataset.value!);
  });
  postToPlugin('select:apply-filter', { setId: selectSetId, filter });
});

document.getElementById('selectAllBtn')?.addEventListener('click', () => {
  document.querySelectorAll<HTMLButtonElement>('#selectAxes .chip').forEach(c => c.classList.add('on'));
});
document.getElementById('selectNoneBtn')?.addEventListener('click', () => {
  document.querySelectorAll<HTMLButtonElement>('#selectAxes .chip').forEach(c => c.classList.remove('on'));
});

// ── Annotate ──────────────────────────────────────────────────────────────────

let annotateNodeId: string | null = null;

function setAnnotateStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('annotateStatus') as HTMLElement;
  el.textContent = msg; el.className = 'status' + (type ? ' ' + type : '');
}

function updateAnnotateSelection(sel: { id: string; name: string; nodeType: string } | null) {
  annotateNodeId = sel?.id ?? null;
  const empty    = document.getElementById('annotateSelectionEmpty') as HTMLElement;
  const info     = document.getElementById('annotateSelectionInfo') as HTMLElement;
  const nameEl   = document.getElementById('annotateNodeName') as HTMLElement;
  const typeEl   = document.getElementById('annotateNodeType') as HTMLElement;
  const applyBtn = document.getElementById('annotateApplyBtn') as HTMLButtonElement;
  if (sel) {
    empty.style.display = 'none'; info.style.display = 'flex';
    nameEl.textContent = sel.name; typeEl.textContent = sel.nodeType;
    applyBtn.disabled = false;
  } else {
    empty.style.display = 'block'; info.style.display = 'none';
    applyBtn.disabled = true;
  }
}

document.querySelectorAll<HTMLButtonElement>('#annotateCats .chip').forEach(chip => {
  chip.addEventListener('click', () => chip.classList.toggle('on'));
});

document.getElementById('annotateApplyBtn')?.addEventListener('click', () => {
  if (!annotateNodeId) return;
  const categories = Array.from(
    document.querySelectorAll<HTMLButtonElement>('#annotateCats .chip.on')
  ).map(c => c.dataset.cat!);
  if (categories.length === 0) { setAnnotateStatus('Select at least one category', 'err'); return; }
  const btn = document.getElementById('annotateApplyBtn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Annotating…';
  setAnnotateStatus('');
  postToPlugin('annotate:apply', { nodeId: annotateNodeId, categories });
});

document.getElementById('annotateClearBtn')?.addEventListener('click', () => {
  if (!annotateNodeId) return;
  const btn = document.getElementById('annotateClearBtn') as HTMLButtonElement;
  btn.disabled = true; setAnnotateStatus('Clearing…');
  postToPlugin('annotate:clear', { nodeId: annotateNodeId });
});

// ── Spec ──────────────────────────────────────────────────────────────────────

let specSetId: string | null = null;

function setSpecStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('specStatus') as HTMLElement;
  el.textContent = msg; el.className = 'status' + (type ? ' ' + type : '');
}

function updateSpecSelection(sel: { id: string; name: string; nodeType: string; variantCount?: number } | null) {
  const isSet = sel?.nodeType === 'COMPONENT_SET';
  specSetId = isSet ? (sel?.id ?? null) : null;
  const empty   = document.getElementById('specSelectionEmpty') as HTMLElement;
  const info    = document.getElementById('specSelectionInfo')  as HTMLElement;
  const nameEl  = document.getElementById('specSetName')  as HTMLElement;
  const countEl = document.getElementById('specSetCount') as HTMLElement;
  const genBtn  = document.getElementById('specGenerateBtn') as HTMLButtonElement;
  if (isSet && sel) {
    empty.style.display = 'none'; info.style.display = 'flex';
    nameEl.textContent  = sel.name;
    countEl.textContent = (sel.variantCount ?? 0) + ' variants';
    genBtn.disabled = false;
  } else {
    empty.style.display = 'block'; info.style.display = 'none';
    genBtn.disabled = true;
  }
}

document.querySelectorAll<HTMLButtonElement>('#specCats .chip').forEach(chip => {
  chip.addEventListener('click', () => chip.classList.toggle('on'));
});
document.getElementById('specAllBtn')?.addEventListener('click', () => {
  document.querySelectorAll<HTMLButtonElement>('#specCats .chip').forEach(c => c.classList.add('on'));
});
document.getElementById('specNoneBtn')?.addEventListener('click', () => {
  document.querySelectorAll<HTMLButtonElement>('#specCats .chip').forEach(c => c.classList.remove('on'));
});

document.getElementById('specGenerateBtn')?.addEventListener('click', () => {
  if (!specSetId) return;
  const categories = Array.from(
    document.querySelectorAll<HTMLButtonElement>('#specCats .chip.on')
  ).map(c => c.dataset.cat!);
  if (categories.length === 0) { setSpecStatus('Select at least one category', 'err'); return; }
  const btn = document.getElementById('specGenerateBtn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Generating…';
  setSpecStatus('');
  postToPlugin('spec:generate', { setId: specSetId, categories });
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
    case 'settings-loaded': applySettings(msg.settings as GitHubSettings | null); break;
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
        const sel = {
          id: msg.nodeId as string,
          name: msg.nodeName as string,
          nodeType: msg.nodeType as string,
          width: msg.width as number | undefined,
          height: msg.height as number | undefined,
          variantCount: msg.variantCount as number | undefined,
        };
        updateProtoSelection(sel);
        updateAnnotateSelection(sel);
        updateSpecSelection(sel);
        updateCopyBtn(sel, msg.fileKey as string | null, msg.fileName as string | null);
      } else {
        updateProtoSelection(null);
        updateAnnotateSelection(null);
        updateSpecSelection(null);
        updateCopyBtn(null, null);
      }
      break;
    }
    case 'annotate:result': {
      const btn = document.getElementById('annotateApplyBtn') as HTMLButtonElement;
      btn.disabled = !annotateNodeId; btn.textContent = 'Annotate';
      if (msg.error) setAnnotateStatus('❌ ' + (msg.error as string), 'err');
      else {
        const n = msg.annotated as number;
        setAnnotateStatus(`✓ ${n} node${n !== 1 ? 's' : ''} annotated`, 'ok');
      }
      break;
    }
    case 'annotate:cleared': {
      const btn = document.getElementById('annotateClearBtn') as HTMLButtonElement;
      btn.disabled = false;
      const n = msg.cleared as number;
      setAnnotateStatus(n > 0 ? `Cleared ${n} annotation${n !== 1 ? 's' : ''}` : 'Nothing to clear', 'ok');
      break;
    }
    case 'spec:result': {
      const btn = document.getElementById('specGenerateBtn') as HTMLButtonElement;
      btn.disabled = !specSetId; btn.textContent = 'Generate';
      if (msg.error) setSpecStatus('❌ ' + (msg.error as string), 'err');
      else {
        const cats = msg.categoryCount as number;
        const vars = msg.variantCount as number;
        setSpecStatus(`✓ ${cats} categor${cats !== 1 ? 'ies' : 'y'} · ${vars} variant${vars !== 1 ? 's' : ''}`, 'ok');
      }
      break;
    }
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────

postToPlugin('ui-ready');
postToPlugin('get-settings');
postToPlugin('resize-for-view', { width: 320, height: 460 });
