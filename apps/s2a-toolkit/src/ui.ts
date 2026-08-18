// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function postToPlugin(type: string, payload?: Record<string, unknown>) {
  parent.postMessage({ pluginMessage: { type, ...payload } }, 'https://www.figma.com');
}

// ── Telemetry — UsageStore in localStorage ────────────────────────────────────

const USAGE_KEY = 's2a:usage';

interface UsageStore {
  events: { featureId: string; timestamp: number }[];
  totals: Record<string, number>;
  lastUsed: Record<string, number>;
}

function loadUsage(): UsageStore {
  try {
    const raw = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    return {
      events:   Array.isArray(raw.events)   ? raw.events   : [],
      totals:   raw.totals   && typeof raw.totals   === 'object' ? raw.totals   : {},
      lastUsed: raw.lastUsed && typeof raw.lastUsed === 'object' ? raw.lastUsed : {},
    };
  } catch { return { events: [], totals: {}, lastUsed: {} }; }
}

function saveUsage(store: UsageStore) {
  try { localStorage.setItem(USAGE_KEY, JSON.stringify(store)); } catch {}
}

function logEvent(featureId: string) {
  const store = loadUsage();
  store.events.push({ featureId, timestamp: Date.now() });
  if (store.events.length > 500) store.events = store.events.slice(-500);
  store.totals[featureId]   = (store.totals[featureId]   || 0) + 1;
  store.lastUsed[featureId] = Date.now();
  saveUsage(store);
}

function heatOf(featureId: string): 'hot' | 'warm' | 'cold' {
  const { events } = loadUsage();
  const now      = Date.now();
  const weekAgo  = now - 7  * 24 * 3600 * 1000;
  const monthAgo = now - 30 * 24 * 3600 * 1000;
  if (events.some(e => e.featureId === featureId && e.timestamp >= weekAgo))  return 'hot';
  if (events.some(e => e.featureId === featureId && e.timestamp >= monthAgo)) return 'warm';
  return 'cold';
}

function recentlyUsed(n = 5): Feature[] {
  const { lastUsed } = loadUsage();
  return Object.entries(lastUsed)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([id]) => FEATURES.find(f => f.id === id)!)
    .filter(Boolean);
}

// ── State vars (declared early so FEATURES closures can reference them) ───────

let annotateNodeId: string | null = null;
let llmCaptureNodeId: string | null = null;
let selectSetId:    string | null = null;
let docSetId:     string | null = null;
let bridgeConnected      = false;
let bridgeWs: WebSocket | null = null;
let bridgeWsPort: number | null = null;
let bridgeKeepaliveTimer: ReturnType<typeof setInterval>  | null = null;
let bridgeReconnectTimer: ReturnType<typeof setTimeout>   | null = null;
let bridgeReconnectAttempts = 0;
let bridgeUserDisconnected  = false;
let activePanel: Panel = 'home';
let isMini = false;
let popoverOpen = false;

const pendingRequests = new Map<string, {
  resolve: (v: any) => void;
  reject:  (e: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}>();
let requestCounter = 0;

// ── Panel switching ───────────────────────────────────────────────────────────

type Panel = 'home' | 'tools';

const panelEls: Record<Panel, HTMLElement> = {
  home:     document.getElementById('homePanel')     as HTMLElement,
  tools:    document.getElementById('toolsPanel')    as HTMLElement,
};

function switchPanel(panel: Panel) {
  activePanel = panel;
  Object.entries(panelEls).forEach(([key, el]) => {
    el.classList.toggle('active', key === panel);
  });
  document.querySelectorAll<HTMLButtonElement>('.tab[data-panel]').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.panel === panel);
  });
  if (panel === 'home') renderHomeView();
}

document.querySelectorAll<HTMLButtonElement>('.tab[data-panel]').forEach(tab => {
  tab.addEventListener('click', () => {
    const p = tab.dataset.panel as Panel;
    if (p) switchPanel(p);
  });
});

// ── Feature registry ──────────────────────────────────────────────────────────

interface Feature {
  id: string;
  name: string;
  description: string;
  category: 'Tokens' | 'Tools' | 'Bridge';
  pluginAction?: string;
  pluginPayload?: Record<string, unknown>;
  uiAction?: () => void;
}

const FEATURES: Feature[] = [
  // Tools
  {
    id: 'tools:copy-link',
    name: 'Copy Figma link',
    description: 'Copy a shareable link for the selected node(s)',
    category: 'Tools',
    uiAction: () => (document.getElementById('copyNodeBtn') as HTMLButtonElement)?.click(),
  },
  {
    id: 'tools:llm-capture',
    name: 'Send screenshot to LLM',
    description: 'Capture the selected node and send image + metadata to the local LLM bridge',
    category: 'Tools',
    uiAction: () => switchPanel('tools'),
  },
  {
    id: 'tools:format-section',
    name: 'Format section',
    description: 'Reflow the selected section with consistent spacing',
    category: 'Tools',
    pluginAction: 'format-section',
  },
  {
    id: 'tools:select-filter',
    name: 'Filter variant set',
    description: 'Select a subset of variants by axis value',
    category: 'Tools',
    uiAction: () => switchPanel('tools'),
  },
  {
    id: 'tools:annotate',
    name: 'Annotate selection',
    description: 'Add token and a11y annotations to the selected node',
    category: 'Tools',
    uiAction: () => switchPanel('tools'),
  },
  {
    id: 'tools:annotate-clear',
    name: 'Clear annotations',
    description: 'Remove all annotation layers from selection',
    category: 'Tools',
    uiAction: () => {
      if (annotateNodeId) postToPlugin('annotate:clear', { nodeId: annotateNodeId });
    },
  },
  {
    id: 'tools:doc',
    name: 'Generate component doc',
    description: 'Build a full component documentation page for the selected component set',
    category: 'Tools',
    uiAction: () => switchPanel('tools'),
  },

  // Bridge
  {
    id: 'bridge:connect',
    name: 'Connect Bridge',
    description: 'Open WebSocket connection to Claude Code',
    category: 'Bridge',
    uiAction: () => bridgeConnect(),
  },
  {
    id: 'bridge:disconnect',
    name: 'Disconnect Bridge',
    description: 'Close the Bridge WebSocket connection',
    category: 'Bridge',
    uiAction: () => bridgeDisconnect(),
  },
];

const QUICK_ACTION_IDS = [
  'tools:llm-capture',
  'tools:copy-link',
  'tools:annotate',
  'tools:select-filter',
  'tools:doc',
];

// ── Fire a feature ────────────────────────────────────────────────────────────

function fireFeature(feat: Feature) {
  logEvent(feat.id);
  closePalette();
  if (feat.uiAction) {
    feat.uiAction();
  } else if (feat.pluginAction) {
    postToPlugin(feat.pluginAction, feat.pluginPayload ?? {});
  }
  // Refresh home if it's visible (heat badges may change)
  if (activePanel === 'home') renderHomeView();
}

// ── Home view ─────────────────────────────────────────────────────────────────

function badgeHtml(heat: 'hot' | 'warm' | 'cold'): string {
  if (heat === 'cold') return '';
  return `<span class="badge badge-${heat}">${heat}</span>`;
}

function actionRowsHtml(feats: Feature[]): string {
  return feats.map(f =>
    `<button class="action-row" data-id="${esc(f.id)}">${esc(f.name)}${badgeHtml(heatOf(f.id))}</button>`
  ).join('');
}

function bindActionList(el: HTMLElement) {
  el.querySelectorAll<HTMLButtonElement>('.action-row').forEach(row => {
    row.addEventListener('click', () => {
      const feat = FEATURES.find(f => f.id === row.dataset.id);
      if (feat) fireFeature(feat);
    });
  });
}

function renderHomeView() {
  const quickEl   = document.getElementById('homeQuickActions') as HTMLElement;
  const recentsEl = document.getElementById('homeRecents') as HTMLElement;
  const recentsSection = document.getElementById('homeRecentsSection') as HTMLElement;

  const quickFeats = QUICK_ACTION_IDS
    .map(id => FEATURES.find(f => f.id === id)!)
    .filter(Boolean);
  quickEl.innerHTML = actionRowsHtml(quickFeats);
  bindActionList(quickEl);

  const recents = recentlyUsed(5);
  if (recents.length === 0) {
    recentsSection.style.display = 'none';
  } else {
    recentsSection.style.display = 'block';
    recentsEl.innerHTML = actionRowsHtml(recents);
    bindActionList(recentsEl);
  }
}

// ── Command palette ───────────────────────────────────────────────────────────

let paletteOpen    = false;
let paletteSelected = 0;
let paletteFiltered: Feature[] = [];

const paletteOverlay = document.getElementById('paletteOverlay') as HTMLElement;
const paletteInput   = document.getElementById('paletteInput')   as HTMLInputElement;
const paletteList    = document.getElementById('paletteList')    as HTMLElement;

function openPalette() {
  paletteOpen = true;
  paletteInput.value = '';
  filterPalette('');
  paletteOverlay.classList.add('open');
  requestAnimationFrame(() => paletteInput.focus());
}

function closePalette() {
  paletteOpen = false;
  paletteOverlay.classList.remove('open');
}

function filterPalette(q: string) {
  const lower = q.toLowerCase();
  paletteFiltered = q
    ? FEATURES.filter(f =>
        f.name.toLowerCase().includes(lower) ||
        f.description.toLowerCase().includes(lower) ||
        f.category.toLowerCase().includes(lower) ||
        f.id.toLowerCase().includes(lower)
      )
    : FEATURES;
  paletteSelected = 0;
  renderPalette();
}

function renderPalette() {
  const cats = [...new Set(paletteFiltered.map(f => f.category))];
  let globalIdx = 0;

  paletteList.innerHTML = cats.map(cat => {
    const items = paletteFiltered.filter(f => f.category === cat);
    const rows = items.map(f => {
      const idx = globalIdx++;
      const heat = heatOf(f.id);
      return `<button class="palette-row" data-id="${esc(f.id)}" data-idx="${idx}" data-selected="${idx === paletteSelected}">
        <span class="palette-name">${esc(f.name)}</span>${badgeHtml(heat)}
        <span class="palette-desc">${esc(f.description)}</span>
      </button>`;
    }).join('');
    return `<div class="palette-group"><div class="palette-group-label">${esc(cat)}</div>${rows}</div>`;
  }).join('');

  paletteList.querySelectorAll<HTMLButtonElement>('.palette-row').forEach(row => {
    row.addEventListener('click', () => {
      const feat = FEATURES.find(f => f.id === row.dataset.id);
      if (feat) fireFeature(feat);
    });
    row.addEventListener('mouseenter', () => {
      paletteSelected = Number(row.dataset.idx);
      paletteList.querySelectorAll('.palette-row').forEach((r, i) =>
        r.setAttribute('data-selected', String(i === paletteSelected))
      );
    });
  });
}

paletteInput.addEventListener('input', () => filterPalette(paletteInput.value));

paletteInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    paletteSelected = Math.min(paletteSelected + 1, paletteFiltered.length - 1);
    renderPalette();
    paletteList.querySelector(`[data-selected="true"]`)?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    paletteSelected = Math.max(paletteSelected - 1, 0);
    renderPalette();
    paletteList.querySelector(`[data-selected="true"]`)?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') {
    const feat = paletteFiltered[paletteSelected];
    if (feat) fireFeature(feat);
  } else if (e.key === 'Escape') {
    closePalette();
  }
});

// Close on backdrop click (but not on the box itself)
paletteOverlay.addEventListener('click', (e) => {
  if (e.target === paletteOverlay) closePalette();
});

// ⌘K / Ctrl+K global shortcut
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    paletteOpen ? closePalette() : openPalette();
  }
  if (e.key === 'Escape' && paletteOpen) closePalette();
});

// Palette hint button in Home panel
document.getElementById('paletteHintBtn')?.addEventListener('click', () => openPalette());

// ── Minimize / expand ─────────────────────────────────────────────────────────

const app = document.getElementById('app') as HTMLElement;
const toggleMiniBtn = document.getElementById('toggleMiniBtn') as HTMLButtonElement;

toggleMiniBtn.addEventListener('click', () => {
  isMini = !isMini;
  app.classList.toggle('mini', isMini);
  postToPlugin('resize-for-view', { width: 320, height: isMini ? 40 : 460 });
  if (isMini && popoverOpen) closePopover();
});

// ── Copy frame link ───────────────────────────────────────────────────────────

const copyNodeBtn   = document.getElementById('copyNodeBtn')   as HTMLButtonElement;
const headerSelName = document.getElementById('headerSelName') as HTMLElement;

let _copyFileKey:  string | null = null;
let _copyFileName: string | null = null;
let _copyAllNodes: Array<{ id: string; name: string }> = [];

function copyToClipboard(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand('copy'); } catch {}
  document.body.removeChild(ta);
  try { navigator.clipboard?.writeText(text).catch(() => {}); } catch {}
}

function updateCopyBtn(
  sel: { id: string; name: string; nodeType: string } | null,
  fileKey: string | null,
  fileName?: string | null,
  allNodes?: Array<{ id: string; name: string }>,
) {
  _copyFileKey  = fileKey;
  _copyFileName = fileName ?? null;
  _copyAllNodes = allNodes ?? (sel ? [{ id: sel.id, name: sel.name }] : []);

  const count  = _copyAllNodes.length;
  const hasNode = !!(sel && fileKey);
  copyNodeBtn.classList.toggle('hidden', !hasNode);

  if (count > 1) {
    copyNodeBtn.title = `Copy ${count} Figma links`;
    copyNodeBtn.setAttribute('aria-label', `Copy ${count} Figma links`);
  } else {
    copyNodeBtn.title = 'Copy Figma link';
    copyNodeBtn.setAttribute('aria-label', 'Copy Figma link');
  }

  if (sel) {
    headerSelName.textContent = count > 1 ? `${count} selected` : sel.name;
    headerSelName.classList.add('has-sel');
  } else {
    headerSelName.textContent = '—';
    headerSelName.classList.remove('has-sel');
  }
}

let _copyResetTimer: ReturnType<typeof setTimeout> | null = null;

copyNodeBtn.addEventListener('click', () => {
  if (!_copyFileKey || _copyAllNodes.length === 0) return;
  const slug = (_copyFileName || 'file')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const urls = _copyAllNodes.map(n => {
    const nid = n.id.replace(':', '-');
    return `https://www.figma.com/design/${_copyFileKey}/${slug}?node-id=${nid}`;
  });

  if (_copyResetTimer) clearTimeout(_copyResetTimer);
  copyNodeBtn.classList.add('copied');
  _copyResetTimer = setTimeout(() => {
    copyNodeBtn.classList.remove('copied');
    _copyResetTimer = null;
  }, 1500);

  copyToClipboard(urls.join('\n'));
  const msg = urls.length > 1 ? `Copied ${urls.length} links` : 'Copied link';
  postToPlugin('notify', { message: msg });
});

// ── LLM capture ──────────────────────────────────────────────────────────────

function setLlmCaptureStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('llmCaptureStatus') as HTMLElement;
  el.textContent = msg;
  el.className = 'status' + (type ? ' ' + type : '');
}

function updateLlmCaptureSelection(sel: { id: string; name: string; nodeType: string } | null) {
  llmCaptureNodeId = sel?.id ?? null;
  const emptyEl = document.getElementById('llmCaptureSelectionEmpty') as HTMLElement;
  const infoEl  = document.getElementById('llmCaptureSelectionInfo')  as HTMLElement;
  const nameEl  = document.getElementById('llmCaptureNodeName') as HTMLElement;
  const typeEl  = document.getElementById('llmCaptureNodeType') as HTMLElement;
  const sendBtn = document.getElementById('llmCaptureSendBtn') as HTMLButtonElement;
  if (sel) {
    emptyEl.style.display = 'none';
    infoEl.style.display = 'flex';
    nameEl.textContent = sel.name;
    typeEl.textContent = sel.nodeType;
    sendBtn.disabled = false;
  } else {
    emptyEl.style.display = 'block';
    infoEl.style.display = 'none';
    sendBtn.disabled = true;
  }
}

async function pollLlmCaptureJob(jobId: string) {
  for (;;) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const res = await fetch(`http://localhost:4002/jobs/${encodeURIComponent(jobId)}`);
    if (!res.ok) throw new Error(`Job status failed (${res.status})`);
    const job = await res.json();
    if (job.phase) setLlmCaptureStatus(job.phase);
    if (job.status === 'done') return job.result;
    if (job.status === 'error') throw new Error(job.error || 'LLM job failed');
  }
}

document.getElementById('llmCaptureSendBtn')?.addEventListener('click', () => {
  if (!llmCaptureNodeId) return;
  const btn = document.getElementById('llmCaptureSendBtn') as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = 'Capturing…';
  setLlmCaptureStatus('Capturing selected node…');
  postToPlugin('llm-capture:selection', { maxDimension: 2048 });
});

// ── Section bar ───────────────────────────────────────────────────────────────

const sectionBar      = document.getElementById('sectionBar')      as HTMLElement;
const sectionBarName  = document.getElementById('sectionBarName')  as HTMLElement;
const formatSectionBtn = document.getElementById('formatSectionBtn') as HTMLButtonElement;

function updateSectionBar(hasSection: boolean, sectionCount: number, firstName: string) {
  sectionBar.classList.toggle('hidden', !hasSection);
  if (hasSection) {
    sectionBarName.textContent = sectionCount > 1 ? `${sectionCount} sections` : firstName;
  }
}

formatSectionBtn.addEventListener('click', () => {
  formatSectionBtn.disabled = true;
  formatSectionBtn.textContent = '…';
  postToPlugin('format-section');
});

// ── Bridge ────────────────────────────────────────────────────────────────────

const BRIDGE_RECONNECT_BASE_MS = 2000;
const BRIDGE_RECONNECT_MAX_MS  = 30000;
const WS_PORTS = [9223,9224,9225,9226,9227,9228,9229,9230,9231,9232];

const bridgeDot       = document.getElementById('bridgeDot')       as HTMLElement;
const bridgeDotMini   = document.getElementById('bridgeDotMini')   as HTMLElement;
const popoverDot      = document.getElementById('popoverDot')      as HTMLElement;
const bridgePortLabel = document.getElementById('bridgePortLabel') as HTMLElement;
const bridgePillLabel = document.getElementById('bridgePillLabel') as HTMLElement;
const bridgeToggleBtn = document.getElementById('bridgeToggleBtn') as HTMLButtonElement;
const bridgePopover   = document.getElementById('bridgePopover')   as HTMLElement;
const bridgeTabBtn    = document.getElementById('bridgeTabBtn')    as HTMLButtonElement;
const bridgeMiniBtn   = document.getElementById('bridgeMiniBtn')   as HTMLButtonElement;

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

function openPopover()  { popoverOpen = true;  bridgePopover.classList.add('open'); }
function closePopover() { popoverOpen = false; bridgePopover.classList.remove('open'); }

bridgeTabBtn.addEventListener('click',  (e) => { e.stopPropagation(); popoverOpen ? closePopover() : openPopover(); });
bridgeMiniBtn?.addEventListener('click', (e) => { e.stopPropagation(); popoverOpen ? closePopover() : openPopover(); });
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
    if (bridgePillLabel) bridgePillLabel.textContent = 'Connected';
    bridgeTabBtn?.classList.add('connected');
  } else {
    setAllDots(false);
    bridgePortLabel.textContent = '—';
    bridgeToggleBtn.textContent = 'Connect';
    bridgeToggleBtn.className   = 'btn';
    bridgeToggleBtn.disabled    = false;
    if (bridgePillLabel) bridgePillLabel.textContent = 'Connect';
    bridgeTabBtn?.classList.remove('connected');
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
  if (bridgeUserDisconnected) return;
  bridgeReconnectAttempts++;
  const delay = Math.min(BRIDGE_RECONNECT_BASE_MS * Math.pow(1.5, bridgeReconnectAttempts - 1), BRIDGE_RECONNECT_MAX_MS);
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

// ── Tools — Select ────────────────────────────────────────────────────────────

function renderAxes(setId: string, setName: string, axes: Array<{ name: string; type: string; variantOptions?: string[] }>) {
  selectSetId = setId;
  const emptyEl  = document.getElementById('selectEmpty')  as HTMLElement;
  const bodyEl   = document.getElementById('selectBody')   as HTMLElement;
  const nameEl   = document.getElementById('selectSetName') as HTMLElement;
  const axesEl   = document.getElementById('selectAxes')   as HTMLElement;
  const statusEl = document.getElementById('selectStatus') as HTMLElement;

  emptyEl.style.display = 'none';
  bodyEl.style.display  = 'block';
  nameEl.textContent = setName;
  if (statusEl) statusEl.textContent = '';

  const variantAxes = axes.filter(a => a.type === 'VARIANT');
  if (variantAxes.length === 0) {
    axesEl.innerHTML = '<div class="empty-state" style="padding:12px 0 0;">No variant axes found</div>';
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

// ── Tools — Annotate ──────────────────────────────────────────────────────────

function setAnnotateStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('annotateStatus') as HTMLElement;
  el.textContent = msg; el.className = 'status' + (type ? ' ' + type : '');
}

function updateAnnotateSelection(sel: { id: string; name: string; nodeType: string } | null) {
  annotateNodeId = sel?.id ?? null;
  const emptyEl  = document.getElementById('annotateSelectionEmpty') as HTMLElement;
  const infoEl   = document.getElementById('annotateSelectionInfo')  as HTMLElement;
  const nameEl   = document.getElementById('annotateNodeName') as HTMLElement;
  const typeEl   = document.getElementById('annotateNodeType') as HTMLElement;
  const applyBtn = document.getElementById('annotateApplyBtn') as HTMLButtonElement;
  if (sel) {
    emptyEl.style.display = 'none'; infoEl.style.display = 'flex';
    nameEl.textContent = sel.name; typeEl.textContent = sel.nodeType;
    applyBtn.disabled = false;
  } else {
    emptyEl.style.display = 'block'; infoEl.style.display = 'none';
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

// ── Tools — Doc ─────────────────────────────────────────────────────────────

function setDocStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('docStatus') as HTMLElement;
  el.textContent = msg; el.className = 'status' + (type ? ' ' + type : '');
}

// Doc generation needs a full COMPONENT_SET (not a single COMPONENT).
function updateDocSelection(sel: { id: string; name: string; nodeType: string; variantCount?: number } | null) {
  const isSet = sel?.nodeType === 'COMPONENT_SET';
  docSetId = isSet ? (sel?.id ?? null) : null;
  const emptyEl = document.getElementById('docSelectionEmpty') as HTMLElement;
  const infoEl  = document.getElementById('docSelectionInfo')  as HTMLElement;
  const nameEl  = document.getElementById('docSetName')  as HTMLElement;
  const countEl = document.getElementById('docSetCount') as HTMLElement;
  const btn     = document.getElementById('docGenerateBtn') as HTMLButtonElement;
  if (isSet && sel) {
    emptyEl.style.display = 'none'; infoEl.style.display = 'flex';
    nameEl.textContent  = sel.name;
    countEl.textContent = (sel.variantCount ?? 0) + ' variants';
    btn.disabled = false;
  } else {
    emptyEl.style.display = 'block'; infoEl.style.display = 'none';
    btn.disabled = true;
  }
}

document.getElementById('docGenerateBtn')?.addEventListener('click', () => {
  if (!docSetId) return;
  const btn = document.getElementById('docGenerateBtn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Generating…';
  setDocStatus('');
  postToPlugin('doc:generate', { setId: docSetId });
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
          variantCount: msg.variantCount as number | undefined,
        };
        updateLlmCaptureSelection(sel);
        updateAnnotateSelection(sel);
        updateDocSelection(sel);
        updateCopyBtn(sel, msg.fileKey as string | null, msg.fileName as string | null, msg.allNodes as Array<{ id: string; name: string }> | undefined);
        updateSectionBar(
          !!(msg.isSection as boolean),
          (msg.sectionCount as number) ?? 0,
          (msg.sectionName as string)  ?? sel.name,
        );
      } else {
        updateLlmCaptureSelection(null);
        updateAnnotateSelection(null);
        updateDocSelection(null);
        updateCopyBtn(null, null);
        updateSectionBar(false, 0, '');
      }
      break;
    }
    case 'llm-capture:result': {
      const btn = document.getElementById('llmCaptureSendBtn') as HTMLButtonElement;
      const resetBtn = () => {
        btn.disabled = !llmCaptureNodeId;
        btn.textContent = 'Send Screenshot';
      };
      if (msg.error) {
        resetBtn();
        setLlmCaptureStatus('❌ ' + (msg.error as string), 'err');
        break;
      }
      const capture = msg.capture as Record<string, any>;
      const prompt = ((document.getElementById('llmCapturePrompt') as HTMLTextAreaElement)?.value || '').trim();
      setLlmCaptureStatus('Sending image + metadata to local LLM bridge…');
      btn.textContent = 'Sending…';
      fetch('http://localhost:4002/llm/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capture,
          prompt: prompt || 'Inspect this Figma selection and summarize the layout, visual system, tokens, and implementation notes.',
        }),
      })
        .then(async res => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || `LLM bridge returned ${res.status}`);
          if (data.jobId) return pollLlmCaptureJob(data.jobId as string);
          return data;
        })
        .then((result: any) => {
          const label = result?.fileName
            ? `✓ Sent · ${result.fileName}`
            : result?.title
              ? `✓ Sent · ${result.title}`
              : '✓ Sent to LLM';
          setLlmCaptureStatus(label, 'ok');
          resetBtn();
        })
        .catch((e: any) => {
          const hint = /Failed to fetch|NetworkError|Load failed/i.test(e.message || '')
            ? 'Local LLM bridge is not running. Run: npm run figma-story'
            : (e.message || 'Capture failed');
          setLlmCaptureStatus('❌ ' + hint, 'err');
          resetBtn();
        });
      break;
    }
    case 'format-section:done': {
      formatSectionBtn.disabled = false;
      formatSectionBtn.textContent = 'Format';
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
    case 'gh-token:value': {
      ghToken = (msg.token as string) || null;
      syncTokenReleaseAuthUi();
      break;
    }

    case 'doc:result': {
      const btn = document.getElementById('docGenerateBtn') as HTMLButtonElement;
      btn.disabled = !docSetId; btn.textContent = 'Generate component doc';
      if (msg.error) setDocStatus('❌ ' + (msg.error as string), 'err');
      else {
        const vars = msg.variantCount as number;
        const warn = msg.warning ? ' · ⚠ ' + (msg.warning as string) : '';
        setDocStatus(`✓ Component doc generated · ${vars} variant${vars !== 1 ? 's' : ''}${warn}`, 'ok');
      }
      break;
    }
  }
});

// ── Token release ────────────────────────────────────────────────────────────
// Dispatches .github/workflows/token-release.yml on GitHub Actions DIRECTLY via
// the GitHub REST API — no local server. Auth is a fine-grained PAT the user
// pastes once, persisted in figma.clientStorage (main thread) — never written
// to the Figma file. The workflow does all real work (sync → build → PR).

const GH_REPO = 'adobecom/consonant';
const GH_WORKFLOW = 'token-release.yml';
const GH_API = `https://api.github.com/repos/${GH_REPO}`;

let tokenReleaseBump: 'patch' | 'minor' | 'major' = 'patch';
let ghToken: string | null = null;

document.querySelectorAll<HTMLButtonElement>('#tokenReleaseBump .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll<HTMLButtonElement>('#tokenReleaseBump .chip').forEach(c => c.classList.remove('on'));
    chip.classList.add('on');
    tokenReleaseBump = chip.dataset.bump as 'patch' | 'minor' | 'major';
  });
});

function setTokenReleaseStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('tokenReleaseStatus') as HTMLElement;
  el.innerHTML = msg;
  el.className = 'status' + (type ? ' ' + type : '');
}

function syncTokenReleaseAuthUi() {
  const setup = document.getElementById('ghTokenSetup') as HTMLElement;
  const release = document.getElementById('tokenReleaseControls') as HTMLElement;
  const hasToken = Boolean(ghToken);
  setup.style.display = hasToken ? 'none' : 'block';
  release.style.display = hasToken ? 'block' : 'none';
}

document.getElementById('ghTokenSaveBtn')?.addEventListener('click', () => {
  const input = document.getElementById('ghTokenInput') as HTMLInputElement;
  const value = input.value.trim();
  if (!value) return;
  ghToken = value;
  input.value = '';
  postToPlugin('gh-token:set', { token: value });
  syncTokenReleaseAuthUi();
  setTokenReleaseStatus('Token saved to Figma client storage.', 'ok');
});

document.getElementById('ghTokenClearBtn')?.addEventListener('click', () => {
  ghToken = null;
  postToPlugin('gh-token:set', { token: '' });
  syncTokenReleaseAuthUi();
  setTokenReleaseStatus('Token cleared.');
});

function ghHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${ghToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function ghJson(path: string) {
  const res = await fetch(`${GH_API}${path}`, { headers: ghHeaders() });
  if (!res.ok) throw new Error(`GitHub API ${res.status} on ${path}`);
  return res.json();
}

document.getElementById('tokenReleaseBtn')?.addEventListener('click', async () => {
  if (!ghToken) return;
  const btn = document.getElementById('tokenReleaseBtn') as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = 'Releasing…';
  const dispatchedAt = Date.now();

  try {
    setTokenReleaseStatus('Dispatching GitHub Actions workflow…');
    const res = await fetch(`${GH_API}/actions/workflows/${GH_WORKFLOW}/dispatches`, {
      method: 'POST',
      headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'main', inputs: { bump: tokenReleaseBump } }),
    });
    if (res.status === 401 || res.status === 403) {
      throw new Error(`GitHub rejected the token (${res.status}). It needs Actions read/write on ${GH_REPO} — and for an org repo, SSO/org authorization. Clear and re-save a valid token.`);
    }
    if (res.status !== 204) throw new Error(`Dispatch failed (${res.status}).`);

    setTokenReleaseStatus('Dispatched — waiting for the run to start…');
    let run: { id: number; status: string; conclusion: string | null; html_url: string } | null = null;
    for (let i = 0; i < 15 && !run; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const data = await ghJson(`/actions/workflows/${GH_WORKFLOW}/runs?per_page=5`);
      run = (data.workflow_runs || []).find(
        (r: { created_at: string }) => new Date(r.created_at).getTime() >= dispatchedAt - 5000,
      ) ?? null;
    }
    if (!run) throw new Error('Dispatched, but no run appeared within 30s — check the Actions tab.');

    const runLink = `<a href="${run.html_url}" target="_blank">Actions run →</a>`;
    setTokenReleaseStatus(`Running in GitHub Actions… ${runLink}`);
    for (;;) {
      await new Promise(r => setTimeout(r, 4000));
      const current = await ghJson(`/actions/runs/${run.id}`);
      if (current.status === 'completed') { run = current; break; }
    }

    if (run!.conclusion !== 'success') {
      throw new Error(`Workflow run ${run!.conclusion} — see ${run!.html_url}`);
    }

    setTokenReleaseStatus(`Run succeeded — looking for the release PR… ${runLink}`);
    const prs = await ghJson('/pulls?state=open&sort=created&direction=desc&per_page=10');
    const pr = (prs as Array<{ title: string; html_url: string; created_at: string }>).find(
      p => p.title.startsWith('release(tokens):') && new Date(p.created_at).getTime() >= dispatchedAt - 5000,
    );
    if (pr) {
      setTokenReleaseStatus(`✓ ${pr.title} · <a href="${pr.html_url}" target="_blank">Review PR →</a> · ${runLink}`, 'ok');
    } else {
      setTokenReleaseStatus(`Run succeeded, no PR opened — likely nothing to release (Figma unchanged since last sync). ${runLink}`, 'ok');
    }
  } catch (err) {
    setTokenReleaseStatus('❌ ' + (err instanceof Error ? err.message : String(err)), 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Release Tokens';
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────

postToPlugin('ui-ready');
postToPlugin('gh-token:get');
postToPlugin('resize-for-view', { width: 320, height: 460 });

renderHomeView();

// Self-heal: reconnect when Figma tab regains focus
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !bridgeConnected && !bridgeUserDisconnected && !bridgeReconnectTimer) {
    bridgeReconnectAttempts = 0;
    bridgeConnect();
  }
});

// Heartbeat: every 45s kick off a fresh scan if disconnected
setInterval(() => {
  if (!bridgeConnected && !bridgeUserDisconnected && !bridgeReconnectTimer) {
    bridgeReconnectAttempts = 0;
    bridgeConnect();
  }
}, 45000);
