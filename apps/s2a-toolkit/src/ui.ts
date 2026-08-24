// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function postToPlugin(type: string, payload?: Record<string, unknown>) {
  parent.postMessage({ pluginMessage: { type, ...payload } }, 'https://www.figma.com');
}

// ── Usage telemetry (network) — POC ───────────────────────────────────────────
// Emits one anonymized event per action to a collector. OFF unless an endpoint is
// set below. Nothing sensitive is sent — just the action id, timestamp, ok/error,
// an anonymous per-install id (from clientStorage, provisioned by code.ts), and
// the plugin version. Every path is fail-silent and never blocks the UI.
const PLUGIN_VERSION = '0.2.0';
// Set to your collector to enable, e.g. 'http://localhost:8787' (dev) or the
// deployed Worker URL. Empty string = telemetry disabled. The chosen host must
// also be listed in manifest.json → networkAccess.allowedDomains.
const TELEMETRY_ENDPOINT = 'https://s2a-telemetry-collector.mmhuntsberry.workers.dev';
let telemetryAnonId = '';
let telemetryOptOut = false;

function sendTelemetry(action: string, status: 'ok' | 'error' = 'ok') {
  if (!TELEMETRY_ENDPOINT || telemetryOptOut) return;
  try {
    fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        tool: action,
        status,
        durationMs: 0,
        ts: new Date().toISOString(),
        anonId: telemetryAnonId || 'unknown',
        version: PLUGIN_VERSION,
        server: 's2a-toolkit',
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* best-effort */
  }
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
  sendTelemetry(featureId); // network emit alongside the local UsageStore
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

type Panel = 'home' | 'tools' | 'request';

const panelEls: Record<Panel, HTMLElement> = {
  home:     document.getElementById('homePanel')     as HTMLElement,
  tools:    document.getElementById('toolsPanel')    as HTMLElement,
  request:  document.getElementById('requestPanel')  as HTMLElement,
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
  if (panel === 'request') postToPlugin('request:capture'); // refresh the context card
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
  {
    id: 'tools:request',
    name: 'Request a change',
    description: 'File a token/component/change request as a triage-ready GitHub issue',
    category: 'Tools',
    uiAction: () => switchPanel('request'),
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
  'tools:copy-link',
  'tools:annotate',
  'tools:select-filter',
  'tools:doc',
  'tools:request',
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

// Current full-view size — the single source of truth so a drag-resize persists
// across the minimize toggle and re-expands to whatever the user last set.
const MIN_W = 300, MIN_H = 360, MAX_W = 1400, MAX_H = 1400;
const winSize = { width: 320, height: 460 };

function applySize() {
  postToPlugin('resize-for-view', { width: winSize.width, height: isMini ? 40 : winSize.height });
}

toggleMiniBtn.addEventListener('click', () => {
  isMini = !isMini;
  app.classList.toggle('mini', isMini);
  applySize();
  if (isMini && popoverOpen) closePopover();
});

// ── Drag-to-resize (bottom-right grip) ─────────────────────────────────────────

const resizeGrip = document.getElementById('resizeGrip') as HTMLElement;

resizeGrip?.addEventListener('pointerdown', (e: PointerEvent) => {
  if (isMini) return;
  e.preventDefault();
  resizeGrip.setPointerCapture(e.pointerId);

  const onMove = (ev: PointerEvent) => {
    // The grip sits at the window's bottom-right, so the pointer's client
    // coordinates are the new width/height. +4 keeps the cursor over the grip.
    winSize.width = Math.max(MIN_W, Math.min(MAX_W, Math.round(ev.clientX + 4)));
    winSize.height = Math.max(MIN_H, Math.min(MAX_H, Math.round(ev.clientY + 4)));
    applySize();
  };
  const onUp = (ev: PointerEvent) => {
    resizeGrip.releasePointerCapture(ev.pointerId);
    resizeGrip.removeEventListener('pointermove', onMove);
    resizeGrip.removeEventListener('pointerup', onUp);
  };
  resizeGrip.addEventListener('pointermove', onMove);
  resizeGrip.addEventListener('pointerup', onUp);
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
  sendTelemetry('action:copy-link');
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
  sendTelemetry('action:format-section');
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
  sendTelemetry('action:apply-filter');
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
  sendTelemetry('action:annotate');
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
  sendTelemetry('action:annotate-clear');
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
  sendTelemetry('action:doc-generate');
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
    case 'telemetry:config': {
      telemetryAnonId = (msg.anonId as string) || '';
      telemetryOptOut = msg.optOut === true;
      break;
    }
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
        updateAnnotateSelection(sel);
        updateDocSelection(sel);
        updateCopyBtn(sel, msg.fileKey as string | null, msg.fileName as string | null, msg.allNodes as Array<{ id: string; name: string }> | undefined);
        updateSectionBar(
          !!(msg.isSection as boolean),
          (msg.sectionCount as number) ?? 0,
          (msg.sectionName as string)  ?? sel.name,
        );
      } else {
        updateAnnotateSelection(null);
        updateDocSelection(null);
        updateCopyBtn(null, null);
        updateSectionBar(false, 0, '');
      }
      if (activePanel === 'request') postToPlugin('request:capture');
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

    case 'request:context': {
      requestCtx = {
        user:      (msg.user as string) ?? null,
        node:      (msg.node as { id: string; name: string; type: string } | null) ?? null,
        fileKey:   (msg.fileKey as string) ?? null,
        fileName:  (msg.fileName as string) ?? '',
        page:      (msg.page as string) ?? '',
        tokenName: (msg.tokenName as string) ?? '',
      };
      renderRequestCtx(requestCtx);
      if (_reqCtxResolve) { const r = _reqCtxResolve; _reqCtxResolve = null; r(requestCtx); }
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
  sendTelemetry('action:token-release');
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

// ── Request tab ────────────────────────────────────────────────────────────
// Files a triage-ready request as a GitHub issue, matching the merged issue
// form (.github/ISSUE_TEMPLATE/s2a-request.yml): labels s2a-request + needs-triage,
// the Type/Priority/summary/use-case body, plus the auto-captured Figma context.
//
// Two submit paths:
//   • Worker mode  — POST to the intake Worker (no GitHub account needed). Set
//     REQUEST_ENDPOINT once the Worker is deployed + add its host to manifest
//     networkAccess.allowedDomains. This is the self-serve path.
//   • Direct mode  — reuse the saved GitHub PAT (Tools → Token release) to POST
//     the issue straight to the API. Works today; the token needs Issues:write.
// REQUEST_ENDPOINT empty ⇒ direct mode. Set to the deployed intake Worker for
// the self-serve path (no per-user GitHub token; images hosted server-side).
const REQUEST_ENDPOINT = 'https://s2a-request-intake.mmhuntsberry.workers.dev';
const REQUEST_SECRET = ''; // optional — sent as x-intake-secret when the Worker has INTAKE_SECRET set

interface RequestCtx {
  user: string | null;
  node: { id: string; name: string; type: string } | null;
  fileKey: string | null;
  fileName: string;
  page: string;
  tokenName: string;
}
let requestCtx: RequestCtx | null = null;
let reqKind = 'New token';
let reqPriority = 'Nice to have';

// Ask code.ts for a fresh context snapshot and resolve when it answers (or on a
// short timeout, falling back to the last known context). Used both to refresh
// the card and — critically — at submit, so the issue never carries stale/empty
// context because of a missed round-trip.
let _reqCtxResolve: ((c: RequestCtx | null) => void) | null = null;
function captureContext(timeoutMs = 1500): Promise<RequestCtx | null> {
  return new Promise(resolve => {
    _reqCtxResolve = resolve;
    postToPlugin('request:capture');
    setTimeout(() => {
      if (_reqCtxResolve === resolve) { _reqCtxResolve = null; resolve(requestCtx); }
    }, timeoutMs);
  });
}

function renderRequestCtx(ctx: RequestCtx | null) {
  const nodeEl  = document.getElementById('reqCtxNode')  as HTMLElement;
  const tokenEl = document.getElementById('reqCtxToken') as HTMLElement;
  const fileEl  = document.getElementById('reqCtxFile')  as HTMLElement;
  const userEl  = document.getElementById('reqCtxUser')  as HTMLElement;
  if (!ctx) return;

  if (ctx.node) {
    nodeEl.textContent = `${ctx.node.name} · ${ctx.node.type.toLowerCase().replace(/_/g, ' ')}`;
    nodeEl.classList.remove('muted');
  } else {
    nodeEl.textContent = '— none selected (file & page still captured)';
    nodeEl.classList.add('muted');
  }

  if (ctx.tokenName) {
    tokenEl.textContent = ctx.tokenName;
    tokenEl.classList.remove('muted');
  } else {
    tokenEl.textContent = '—';
    tokenEl.classList.add('muted');
  }

  fileEl.textContent = ctx.fileName ? `${ctx.fileName} › ${ctx.page}` : '—';
  fileEl.classList.toggle('muted', !ctx.fileName);
  userEl.textContent = ctx.user || '(unknown)';
  userEl.classList.toggle('muted', !ctx.user);
}

// Build the deep-link to the selected node — same shape as the copy-link button.
function figmaNodeUrl(ctx: RequestCtx): string {
  if (!ctx.fileKey || !ctx.node) return '';
  const slug = (ctx.fileName || 'file').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `https://www.figma.com/design/${ctx.fileKey}/${slug}?node-id=${ctx.node.id.replace(':', '-')}`;
}

function setReqStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('reqStatus') as HTMLElement;
  el.innerHTML = msg;
  el.className = 'status' + (type ? ' ' + type : '');
}

// Single-select chip group (radio-style), like the token-release bump chips.
function bindReqChips(containerId: string, dataKey: 'kind' | 'priority', onPick: (v: string) => void) {
  document.querySelectorAll<HTMLButtonElement>(`#${containerId} .chip`).forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll<HTMLButtonElement>(`#${containerId} .chip`).forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
      onPick(chip.dataset[dataKey]!);
    });
  });
}
bindReqChips('reqKind', 'kind', v => { reqKind = v; });
bindReqChips('reqPriority', 'priority', v => { reqPriority = v; });

// ── Image attachments ────────────────────────────────────────────────────────
// Read to data URLs in the UI thread and carried in the submit payload. Hosting
// is the Worker's job (uploads to object storage, embeds the URLs) — a PAT can't
// attach binaries to an issue, so direct mode files the issue without them.
interface ReqImage { name: string; type: string; dataUrl: string; size: number; }
let reqImages: ReqImage[] = [];
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB each

function renderReqImages() {
  const wrap = document.getElementById('reqImages') as HTMLElement;
  wrap.innerHTML = reqImages.map((img, i) =>
    `<div class="req-thumb"><img src="${img.dataUrl}" alt="${esc(img.name)}"><button class="req-thumb-rm" data-i="${i}" title="Remove image" type="button">×</button></div>`
  ).join('');
  wrap.querySelectorAll<HTMLButtonElement>('.req-thumb-rm').forEach(b => {
    b.addEventListener('click', () => { reqImages.splice(Number(b.dataset.i), 1); renderReqImages(); });
  });
  const addBtn = document.getElementById('reqAddImageBtn') as HTMLButtonElement | null;
  if (addBtn) addBtn.style.display = reqImages.length >= MAX_IMAGES ? 'none' : '';
}

document.getElementById('reqAddImageBtn')?.addEventListener('click', () => {
  (document.getElementById('reqImageInput') as HTMLInputElement).click();
});

document.getElementById('reqImageInput')?.addEventListener('change', (e) => {
  const input = e.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  input.value = ''; // let the same file be re-picked later
  for (const file of files) {
    if (reqImages.length >= MAX_IMAGES) { setReqStatus(`Up to ${MAX_IMAGES} images.`, 'err'); break; }
    if (file.size > MAX_IMAGE_BYTES) { setReqStatus(`"${file.name}" is over 4MB — skipped.`, 'err'); continue; }
    const reader = new FileReader();
    reader.onload = () => {
      reqImages.push({ name: file.name, type: file.type, dataUrl: String(reader.result), size: file.size });
      renderReqImages();
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('reqSubmitBtn')?.addEventListener('click', async () => {
  const summaryEl = document.getElementById('reqSummary') as HTMLInputElement;
  const useCaseEl = document.getElementById('reqUseCase') as HTMLTextAreaElement;
  const summary = summaryEl.value.trim();
  const useCase = useCaseEl.value.trim();
  if (!summary) { setReqStatus('Add a one-line summary first.', 'err'); summaryEl.focus(); return; }
  if (!useCase) { setReqStatus('Add a use case — it helps triage.', 'err'); useCaseEl.focus(); return; }

  sendTelemetry('action:request-submit');
  const btn = document.getElementById('reqSubmitBtn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Submitting…';
  setReqStatus('');

  const ctx = await captureContext(); // fresh snapshot — never a stale cache
  const figmaUrl = ctx ? figmaNodeUrl(ctx) : '';
  const bodyLines = [
    `**Requested by:** ${ctx?.user || '(unknown)'}`,
    `**Type:** ${reqKind} · **Priority:** ${reqPriority}`,
    '',
    '### What', summary,
    '',
    '### Use case', useCase,
    '',
  ];
  if (figmaUrl)        bodyLines.push(`**Figma:** ${figmaUrl}`);
  if (ctx?.tokenName)  bodyLines.push(`**Token:** \`${ctx.tokenName}\``);
  if (ctx?.fileName)   bodyLines.push(`**File / page:** ${ctx.fileName} › ${ctx.page}` + (ctx.node ? ` · **Node:** ${ctx.node.name}` : ''));
  bodyLines.push('', '<sub>Filed from the S2A Toolkit plugin · Request tab.</sub>');
  const issueBody = bodyLines.join('\n');
  const title  = `[Request] ${summary.slice(0, 70)}`;
  const labels = ['s2a-request', 'needs-triage'];

  try {
    let issueUrl = '';
    let issueNumber = 0;

    if (REQUEST_ENDPOINT) {
      // Worker mode — the endpoint holds the GitHub credential.
      const res = await fetch(REQUEST_ENDPOINT, {
        method: 'POST',
        headers: REQUEST_SECRET
          ? { 'content-type': 'application/json', 'x-intake-secret': REQUEST_SECRET }
          : { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: reqKind, priority: reqPriority, summary, useCase, figmaUrl,
          fileName: ctx?.fileName, page: ctx?.page, nodeName: ctx?.node?.name,
          tokenName: ctx?.tokenName, requester: ctx?.user,
          images: reqImages.map(i => ({ name: i.name, type: i.type, dataUrl: i.dataUrl })),
        }),
      });
      if (!res.ok) throw new Error(`Intake endpoint returned ${res.status}.`);
      const data = await res.json();
      issueUrl = data.url; issueNumber = data.number;
    } else if (ghToken) {
      // Direct mode — reuse the saved PAT (needs Issues: read/write).
      const res = await fetch(`${GH_API}/issues`, {
        method: 'POST',
        headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body: issueBody, labels }),
      });
      if (res.status === 401 || res.status === 403) {
        throw new Error(`GitHub rejected the token (${res.status}). The Request tab needs Issues: read/write on ${GH_REPO} added to your fine-grained PAT (and SSO/org authorization).`);
      }
      if (res.status !== 201) throw new Error(`Create failed (${res.status}).`);
      const data = await res.json();
      issueUrl = data.html_url; issueNumber = data.number;
    } else {
      throw new Error('No intake endpoint set and no GitHub token saved. Save a PAT in Tools → Token release (add Issues: read/write), or configure the intake Worker.');
    }

    // Direct mode (no Worker) can't host images — say so instead of dropping them silently.
    const imgNote = (!REQUEST_ENDPOINT && reqImages.length)
      ? ` · ⚠ ${reqImages.length} image${reqImages.length !== 1 ? 's' : ''} not attached (needs the intake Worker)`
      : '';
    setReqStatus(`✓ Filed as <a href="${issueUrl}" target="_blank">#${issueNumber} →</a> — triage will pick it up.${imgNote}`, 'ok');
    summaryEl.value = '';
    useCaseEl.value = '';
    reqImages = [];
    renderReqImages();
  } catch (err) {
    setReqStatus('❌ ' + (err instanceof Error ? err.message : String(err)), 'err');
  } finally {
    btn.disabled = false; btn.textContent = 'Submit request';
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────

postToPlugin('ui-ready');
postToPlugin('gh-token:get');
applySize();

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

// Ask code.ts for the anonymous telemetry id (provisioned in clientStorage).
postToPlugin('telemetry:init');
