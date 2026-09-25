import { makeState, stateName } from './studio';
import { createJsonEditor, type JsonEditorHandle } from './json-editor';
import { emptyStudio, mutateDef, slotsOf, rootTokens, unboundAxes, acceptNames, propFromAxis, verdictOf, canPublish, STATE_NAMES, ACCEPTS_MODES, type StudioState } from './studio';
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
const PLUGIN_VERSION = '0.2.1';
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
let contractSetId: string | null = null;
let contractEvidence: { evidence: Record<string, unknown>; canonical: string; hash: string } | null = null;
let contractIndexCache: { at: number; slugs: Map<string, string> } | null = null;
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

type Panel = 'home' | 'tools' | 'contract' | 'request';

const panelEls: Record<Panel, HTMLElement> = {
  home:     document.getElementById('homePanel')     as HTMLElement,
  tools:    document.getElementById('toolsPanel')    as HTMLElement,
  contract: document.getElementById('contractPanel') as HTMLElement,
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
  if (panel === 'contract') studioRefreshIndex();
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
    description: 'Build a full documentation page for the selected component or component set',
    category: 'Tools',
    uiAction: () => switchPanel('tools'),
  },
  {
    id: 'tools:contract',
    name: 'Extract contract',
    description: 'Record the selected component set as design evidence (axes, variants, token bindings per mode) and publish it',
    category: 'Tools',
    uiAction: () => { switchPanel('contract'); if (contractSetId) runContractExtract(); },
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
    info.pluginVersion = '0.3.0';
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

// Doc generation accepts a COMPONENT_SET or a single COMPONENT (a selected
// variant is resolved to its set in code.ts).
function updateDocSelection(sel: { id: string; name: string; nodeType: string; variantCount?: number } | null) {
  const isDocable = sel?.nodeType === 'COMPONENT_SET' || sel?.nodeType === 'COMPONENT';
  docSetId = isDocable ? (sel?.id ?? null) : null;
  const emptyEl = document.getElementById('docSelectionEmpty') as HTMLElement;
  const infoEl  = document.getElementById('docSelectionInfo')  as HTMLElement;
  const nameEl  = document.getElementById('docSetName')  as HTMLElement;
  const countEl = document.getElementById('docSetCount') as HTMLElement;
  const btn     = document.getElementById('docGenerateBtn') as HTMLButtonElement;
  if (isDocable && sel) {
    emptyEl.style.display = 'none'; infoEl.style.display = 'flex';
    nameEl.textContent  = sel.name;
    countEl.textContent = sel.nodeType === 'COMPONENT_SET'
      ? (sel.variantCount ?? 0) + ' variants'
      : 'single component';
    btn.disabled = false;
  } else {
    emptyEl.style.display = 'block'; infoEl.style.display = 'none';
    btn.disabled = true;
  }
}

// Doc readability runs against a documentation FRAME — the page-level card, not
// a component. Reports only; it never edits the frame.
let docCheckId: string | null = null;
function updateDocCheckSelection(sel: { id: string; name: string; nodeType: string; width?: number; height?: number } | null) {
  const ok = sel?.nodeType === 'FRAME';
  docCheckId = ok ? (sel?.id ?? null) : null;
  const emptyEl = document.getElementById('docCheckSelectionEmpty') as HTMLElement;
  const infoEl  = document.getElementById('docCheckSelectionInfo')  as HTMLElement;
  const nameEl  = document.getElementById('docCheckName') as HTMLElement;
  const metaEl  = document.getElementById('docCheckMeta') as HTMLElement;
  const btn     = document.getElementById('docCheckBtn') as HTMLButtonElement;
  if (ok && sel) {
    emptyEl.style.display = 'none'; infoEl.style.display = 'flex';
    nameEl.textContent = sel.name;
    metaEl.textContent = sel.width && sel.height ? `${Math.round(sel.width)} × ${Math.round(sel.height)}` : 'frame';
    btn.disabled = false;
  } else {
    emptyEl.style.display = 'block'; infoEl.style.display = 'none';
    btn.disabled = true;
    const issues = document.getElementById('docCheckIssues') as HTMLElement;
    issues.style.display = 'none'; issues.innerHTML = '';
  }
}

document.getElementById('docCheckBtn')?.addEventListener('click', () => {
  if (!docCheckId) return;
  sendTelemetry('action:docs-check');
  const btn = document.getElementById('docCheckBtn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Checking…';
  const status = document.getElementById('docCheckStatus') as HTMLElement;
  status.textContent = '';
  postToPlugin('docs:check', { nodeId: docCheckId });
});

document.getElementById('docGenerateBtn')?.addEventListener('click', () => {
  if (!docSetId) return;
  sendTelemetry('action:doc-generate');
  const btn = document.getElementById('docGenerateBtn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Generating…';
  setDocStatus('');
  postToPlugin('doc:generate', { setId: docSetId });
});


// ── Contract Studio ───────────────────────────────────────────────────────────
// Curation, done by the person who drew the component. See src/studio.ts for
// the two rules this UI exists to enforce: the GUI offers only what exists, and
// nothing lands without going through the gate.

let studio: StudioState = emptyStudio();
let studioSel: { id: string; name: string; nodeType: string; variantCount?: number } | null = null;
let studioValidateTimer: number | undefined;

const $s = (id: string) => document.getElementById(id) as HTMLElement;

// "Failed to fetch" is what the browser says when nothing is listening. It tells
// a designer nothing, so every studio call turns it into the one instruction
// that fixes it.
const SYNC_DOWN = `No sync server at ${'{endpoint}'}. Start it: npm run contract-sync (in apps/s2a-toolkit).`;
const syncDownMessage = () => SYNC_DOWN.replace('{endpoint}', contractEndpoint);

async function studioApi(path: string, init?: RequestInit) {
  try {
    return await fetch(`${contractEndpoint}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } });
  } catch {
    throw new Error(syncDownMessage());
  }
}

function studioSetSelection(sel: { id: string; name: string; nodeType: string; variantCount?: number } | null) {
  const usable = ['COMPONENT_SET', 'COMPONENT', 'INSTANCE', 'FRAME', 'SECTION', 'GROUP'].includes(sel?.nodeType ?? '');
  studioSel = usable ? sel : null;
  const empty = $s('studioSelEmpty'), info = $s('studioSelInfo');
  const btn = $s('studioOpenBtn') as HTMLButtonElement;
  if (usable && sel) {
    empty.style.display = 'none'; info.style.display = 'flex';
    $s('studioSelName').textContent = sel.name;
    $s('studioSelMeta').textContent = sel.nodeType === 'COMPONENT_SET' ? `${sel.variantCount ?? 0} variants` : sel.nodeType.toLowerCase();
    btn.disabled = false;
  } else {
    empty.style.display = 'block'; info.style.display = 'none';
    btn.disabled = true;
  }
}

async function studioRefreshIndex() {
  const host = $s('studioIndex');
  host.innerHTML = '<div style="font-size:10.5px; opacity:.6; padding:4px 0;">loading…</div>';
  try {
    const res = await studioApi('/contracts');
    if (!res.ok) throw new Error(`sync server returned ${res.status}`);
    // The endpoint answers { count, items: [...] }. Treating it as a keyed map
    // silently yields [count, items] and renders two "undefined" rows.
    const index = await res.json();
    studio.index = index;
    const rows: any[] = Array.isArray(index?.items) ? index.items : [];
    if (!rows.length) { host.innerHTML = '<div class="studio-empty">No contracts yet — select a component set above and Extract.</div>'; return; }
    host.innerHTML = '';
    for (const c of [...rows].sort((a, b) => String(a.name ?? a.slug).localeCompare(String(b.name ?? b.slug)))) {
      const row = document.createElement('button');
      row.className = 'studio-row';
      const name = document.createElement('span');
      name.className = 'studio-row-name';
      name.textContent = String(c.name ?? c.slug);
      const badge = document.createElement('span');
      badge.className = `badge ${c.hasDefs ? 'badge-hot' : 'badge-cold'}`;
      badge.textContent = c.hasDefs ? 'curated' : 'evidence only';
      const slug = document.createElement('span');
      slug.className = 'studio-row-slug';
      slug.textContent = String(c.slug);
      row.append(name, badge, slug);
      row.addEventListener('click', () => studioOpen(String(c.slug)));
      host.appendChild(row);
    }
  } catch {
    host.innerHTML = `<div class="studio-empty">${esc(syncDownMessage())}</div>`;
  }
}

function studioShow(view: 'list' | 'editor') {
  $s('studioList').style.display = view === 'list' ? 'block' : 'none';
  $s('studioEditor').style.display = view === 'editor' ? 'block' : 'none';
}

async function studioOpen(ref: string, by: 'slug' | 'name' = 'slug') {
  studioUnmountEditor();
  studio = { ...emptyStudio(), slug: by === 'slug' ? ref : null, busy: true };
  studioResult = null;
  studioShow('editor');
  $s('studioId').textContent = ref;
  $s('studioSub').textContent = 'loading…';
  $s('studioGui').innerHTML = '';
  $s('studioDraftNotes').style.display = 'none';
  try {
    const res = await studioApi(`/def-context?${by}=${encodeURIComponent(ref)}`);
    // A 404 here means the sync server predates this endpoint. Reading the body
    // anyway yields hasDef undefined, which renders as "no contract yet" — a
    // wrong answer dressed as a real one. Unknown is not an empty state.
    if (!res.ok) {
      const hint = res.status === 404
        ? 'Sync server is running older code. Restart it: npm run contract-sync (in apps/s2a-toolkit).'
        : `Sync server returned ${res.status}.`;
      throw new Error(hint);
    }
    const ctx = await res.json();
    studio.slug = ctx.slug ?? studio.slug;
    studio.def = ctx.def;
    studio.evidence = ctx.evidence;
    studio.freeAxes = ctx.freeAxes ?? [];
    studio.index = ctx.index ?? {};
    studio.busy = false;
    if (!ctx.hasDef) {
      // No curated definition yet. Say so once, give the footer a real verdict —
      // leaving it on "validating…" reads as a hung panel — and offer the one
      // action that moves this forward, when there is evidence to draft from.
      studio.validation = { valid: false, errors: ['no curated definition for this set yet'], warnings: [] };
      studioRender();
      studioRenderEmpty(Boolean(ctx.evidence?.axes?.length));
      return;
    }
    studioRender();
    studioValidate();
    // Ask the canvas what each swap points at; the answer arrives asynchronously
    // and re-renders the slots section when it does.
    if (studioSel && slotsOf(studio.def ?? {}).length) postToPlugin('studio:swap-targets', { setId: studioSel.id });
  } catch (err: any) {
    studio.busy = false;
    studio.validation = { valid: false, errors: [String(err?.message ?? err)], warnings: [] };
    $s('studioSub').textContent = studio.slug ?? ref;
    $s('studioGui').innerHTML = '';
    $s('studioGui').appendChild(el('div', 'studio-empty', String(err?.message ?? err)));
    $s('studioDraftNotes').style.display = 'none';
    studioRenderFooter();
  }
}

function studioValidate() {
  studioResult = null;
  window.clearTimeout(studioValidateTimer);
  studioValidateTimer = window.setTimeout(async () => {
    if (!studio.def) return;
    try {
      const res = await studioApi('/validate', { method: 'POST', body: JSON.stringify({ def: studio.def }) });
      studio.validation = res.ok
        ? await res.json()
        : { valid: false, errors: [res.status === 404 ? 'sync server is running older code — restart it' : `validate returned ${res.status}`], warnings: [] };
    } catch (err: any) {
      // Unknown is not valid. A checker that cannot run must not report a pass.
      studio.validation = { valid: false, errors: [String(err?.message ?? syncDownMessage())], warnings: [] };
    }
    studioRenderFooter();
  }, 400) as unknown as number;
}

function studioEdit(fn: (def: any) => void) {
  studioResult = null;
  studio.def = mutateDef(studio, fn);
  studio.dirty = true;
  studio.validation = null;
  if (studio.jsonMode) studioEditor?.setValue(JSON.stringify(studio.def, null, 2));
  studioRender();
  studioValidate();
}

let studioResult: { tone: 'ok' | 'bad'; text: string } | null = null;

function studioRenderFooter() {
  const v = studioResult ?? verdictOf(studio);
  const node = $s('studioVerdict');
  node.className = `studio-verdict ${v.tone}`;
  node.textContent = v.text;
  const warn = (studio.validation?.warnings ?? []).map((w) => `⚠ ${w}`).join('\n');
  $s('studioWarnings').textContent = warn;
  $s('studioWarnings').style.display = warn ? 'block' : 'none';
  ($s('studioPublishBtn') as HTMLButtonElement).disabled = !canPublish(studio);
}

// ── GUI mode ──────────────────────────────────────────────────────────────────
const el = (tag: string, cls?: string, text?: string) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};

function studioSection(title: string, add?: HTMLElement) {
  const sec = el('div', 'studio-sec');
  const head = el('div', 'studio-sec-head');
  const h = el('div', 'section-label', title);
  h.style.margin = '0';
  head.appendChild(h);
  if (add) head.appendChild(add);
  sec.appendChild(head);
  return sec;
}

function studioAddButton(label: string, options: Array<{ value: string; text: string }>, onPick: (v: string) => void) {
  if (!options.length) return undefined;
  const wrap = el('div');
  wrap.style.cssText = 'position:relative;';
  const btn = el('button', 'studio-add', label) as HTMLButtonElement;
  const menu = el('select') as HTMLSelectElement;
  menu.style.cssText = 'position:absolute; inset:0; opacity:0; cursor:pointer; width:100%;';
  menu.innerHTML = '<option value=""></option>' + options.map((o) => `<option value="${esc(o.value)}">${esc(o.text)}</option>`).join('');
  menu.addEventListener('change', () => { if (menu.value) { onPick(menu.value); menu.value = ''; } });
  wrap.append(btn, menu);
  return wrap;
}

const stripHash = (n: string) => String(n).split('#')[0].trim();
const kebabish = (n: string) => String(n).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function studioRenderGui() {
  const host = $s('studioGui');
  host.innerHTML = '';
  const d = studio.def;
  if (!d) {
    host.appendChild(el('div', 'studio-empty', 'No curated definition for this set yet. Extract its evidence in the Tools tab, and the draft will appear here with every judgment call listed.'));
    return;
  }

  // Props — offered only from axes nothing has bound yet.
  const free = unboundAxes(studio);
  const props = studioSection(`Props · ${(d.props ?? []).length}`,
    studioAddButton('+ from an axis', free.map((a: any) => ({ value: a.name, text: `${a.name} · ${a.type}` })),
      (name) => studioEdit((def) => {
        const axis = (studio.evidence?.axes ?? []).find((a: any) => a.name === name);
        if (axis) (def.props = def.props ?? []).push(propFromAxis(axis));
      })));
  for (const [i, prop] of (d.props ?? []).entries()) {
    const row = el('div', 'studio-item');
    row.appendChild(el('span', 'studio-item-name', prop.name));
    row.appendChild(el('span', 'studio-item-bind', prop.figma?.property ? `${prop.figma.kind} · ${prop.figma.property}` : 'no design counterpart'));
    const lever = el('input') as HTMLInputElement;
    lever.type = 'checkbox'; lever.checked = Boolean(prop.lever);
    lever.title = 'Lever: authored by a designer. Unchecked means integration-only.';
    lever.addEventListener('change', () => studioEdit((def) => { def.props[i].lever = lever.checked; }));
    row.appendChild(lever);
    const del = el('button', 'studio-del', '×') as HTMLButtonElement;
    del.title = `Remove ${prop.name}`;
    del.addEventListener('click', () => studioEdit((def) => { def.props.splice(i, 1); }));
    row.appendChild(del);
    props.appendChild(row);
  }
  if (!(d.props ?? []).length) props.appendChild(el('div', 'studio-empty', free.length ? 'No props curated yet — add one from a real axis.' : 'No props, and no unbound axes to add from.'));
  host.appendChild(props);

  // States — the schema's four, never an invented one.
  const used: string[] = (d.states ?? []).map(stateName).filter(Boolean);
  const states = studioSection('States',
    studioAddButton('+ add', STATE_NAMES.filter((n) => !used.includes(n)).map((n) => ({ value: n, text: n })),
      // A state is an object in the schema, not the string the chip shows.
      (n) => studioEdit((def) => { (def.states = def.states ?? []).push(makeState(n, studio.evidence)); })));
  const chips = el('div');
  for (const [i, st] of used.entries()) {
    const c = el('button', 'studio-toggle on', st) as HTMLButtonElement;
    c.title = `Remove ${st}`;
    c.addEventListener('click', () => studioEdit((def) => { def.states.splice(i, 1); if (!def.states.length) delete def.states; }));
    chips.appendChild(c);
  }
  if (!used.length) chips.appendChild(el('div', 'studio-empty', 'No runtime states declared.'));
  states.appendChild(chips);
  host.appendChild(states);

  // Slots — accepts comes from the contract index, so a slot cannot accept a
  // component the repo has no contract for.
  const slots = slotsOf(d);
  if (slots.length) {
    const sec = studioSection(`Slots · ${slots.length}`);
    for (const { path, node } of slots) {
      const box = el('div', 'studio-item');
      box.style.cssText = 'flex-direction:column; align-items:stretch; gap:var(--s-2);';
      const head = el('div');
      head.style.cssText = 'display:flex; align-items:center; gap:var(--s-2);';
      const label = el('span', 'studio-item-name', path);
      const mode = el('select', 'form-input') as HTMLSelectElement;
      mode.style.cssText = 'width:auto; font-size:10px; padding:2px 4px;';
      mode.innerHTML = ACCEPTS_MODES.map((m) => `<option ${node.slot.acceptsMode === m ? 'selected' : ''}>${m}</option>`).join('');
      mode.addEventListener('change', () => studioEdit((def) => {
        const t = slotsOf(def).find((x) => x.path === path); if (t) t.node.slot.acceptsMode = mode.value;
      }));
      head.append(label, mode);
      box.appendChild(head);
      const names = acceptNames(studio);
      const acc = el('div');
      for (const n of names) {
        const on = (node.slot.accepts ?? []).includes(n);
        const b = el('button', `studio-toggle${on ? ' on' : ''}`, n) as HTMLButtonElement;
        b.addEventListener('click', () => studioEdit((def) => {
          const t = slotsOf(def).find((x) => x.path === path); if (!t) return;
          const a = (t.node.slot.accepts = t.node.slot.accepts ?? []);
          const at = a.indexOf(n); if (at >= 0) a.splice(at, 1); else a.push(n);
        }));
        acc.appendChild(b);
      }
      if (!names.length) acc.appendChild(el('div', 'studio-empty', 'No other contracts to accept yet.'));
      box.appendChild(acc);

      // What the set itself points this swap at. If that component has no
      // contract it cannot be accepted yet — say which one, and why, instead of
      // leaving a list of 37 unrelated names as the only hint.
      const swapProp = (d.props ?? []).find((p: any) => p.figma?.kind === 'INSTANCE_SWAP' && kebabish(stripHash(p.figma.property)) === path.split('.').pop());
      const declared = swapProp ? (studioSwapTargets[swapProp.figma.property] ?? []) : [];
      if (declared.length) {
        const hint = el('div', 'studio-swap-hint');
        for (const t of declared) {
          const known = names.includes(t.name);
          const line = el('div', 'studio-swap-line');
          line.appendChild(el('span', 'studio-note-conf', t.role));
          if (known) {
            const b = el('button', 'studio-toggle', `accept ${t.name}`) as HTMLButtonElement;
            b.addEventListener('click', () => studioEdit((def) => {
              const tgt = slotsOf(def).find((x) => x.path === path); if (!tgt) return;
              const a = (tgt.node.slot.accepts = tgt.node.slot.accepts ?? []);
              if (!a.includes(t.name)) a.push(t.name);
            }));
            line.appendChild(b);
          } else {
            line.appendChild(el('span', undefined, `${t.name} — no contract yet, so it cannot be accepted. Extract it first.`));
          }
          hint.appendChild(line);
        }
        box.appendChild(hint);
      }
      sec.appendChild(box);
    }
    host.appendChild(sec);
  }

  // Root tokens — read-only. Retargeting a binding is a design edit, made in
  // Figma and re-extracted, not typed into a panel.
  const toks = rootTokens(d);
  const tokens = studioSection(`Root tokens · ${Object.keys(toks).length}`);
  for (const [prop, ref] of Object.entries(toks)) {
    const row = el('div', 'studio-kv');
    row.append(el('span', 'studio-kv-key', prop), el('span', 'studio-kv-val', String(ref)));
    tokens.appendChild(row);
  }
  if (!Object.keys(toks).length) tokens.appendChild(el('div', 'studio-empty', 'No root token bindings.'));
  host.appendChild(tokens);
}

let studioAwaitingExtract = false;
// Figma's own answer to "what goes in this swap", per INSTANCE_SWAP property.
let studioSwapTargets: Record<string, Array<{ role: string; name: string }>> = {};
let studioEditor: JsonEditorHandle | null = null;

// Extraction from the Contract tab. Telling someone to go to another tab to get
// the thing this tab is named after is the kind of seam a person reads as broken.
function studioExtract(btn: HTMLButtonElement, name = '', rename = false) {
  if (!studioSel) return;
  sendTelemetry('action:studio-extract');
  studioAwaitingExtract = true;
  btn.disabled = true; btn.textContent = 'Reading the set…';
  postToPlugin('contract:extract', { setId: studioSel.id, name, rename });
}

// Extract → publish → reopen. One press, because on its own a published
// evidence file is not something a designer wanted; a contract is.
async function studioOnEvidence(msg: Record<string, unknown>) {
  const reset = () => { const b = document.querySelector('#studioGui .btn') as HTMLButtonElement | null; if (b) { b.disabled = false; b.textContent = 'Extract this set'; } };
  const fail = (text: string) => { $s('studioVerdict').className = 'studio-verdict bad'; $s('studioVerdict').textContent = text; reset(); };
  if (msg.error) return fail(`Extract failed: ${msg.error}`);
  try {
    const evidence = msg.evidence as Record<string, unknown>;
    const hash = 'sha256:' + await sha256Hex(msg.hashInput as string);
    const res = await fetch(`${contractEndpoint.replace(/\/$/, '')}/evidence`, {
      method: 'POST', headers: contractHeaders(), body: JSON.stringify({ evidence, hash }),
    });
    const out = await res.json();
    if (!res.ok) throw new Error(out.error || `sync endpoint returned ${res.status}`);
    contractIndexCache = null;
    // Reopen on the slug the server resolved, so the panel and the repo agree.
    studioOpen(String(out.slug ?? studio.slug ?? (evidence.set as any)?.name), out.slug ? 'slug' : 'name');
  } catch (err: any) {
    fail(`Could not publish the evidence: ${err?.message ?? err}`);
  }
}

// The state 34 of our 37 sets are in: evidence, no curation. A panel that only
// says "nothing here" is a dead end, so it offers the step that ends it.
function studioRenderEmpty(hasEvidence: boolean) {
  const host = $s('studioGui');
  host.innerHTML = '';
  if (!hasEvidence) {
    host.appendChild(el('div', 'studio-empty', 'Nothing published for this set yet. Extracting reads its real variant axes, token bindings and structure, and records only what is there — it never infers an API.'));
    // A frame's layer name is rarely the component's name, and the name given
    // here becomes the evidence's identity. Ask rather than inherit "Frame 412".
    const isFrame = studioSel?.nodeType === 'FRAME';
    let nameInput: HTMLInputElement | undefined;
    let renameBox: HTMLInputElement | undefined;
    if (isFrame) {
      const field = el('div', 'form-field');
      field.style.marginTop = 'var(--s-3)';
      const label = el('label', 'form-label', 'Name this candidate');
      nameInput = el('input', 'form-input') as HTMLInputElement;
      nameInput.type = 'text';
      nameInput.placeholder = 'e.g. FeatureTile';
      const check = el('label', 'form-label');
      check.style.cssText = 'display:flex; gap:6px; align-items:center; margin-top:var(--s-2); font-weight:400;';
      renameBox = el('input') as HTMLInputElement;
      renameBox.type = 'checkbox'; renameBox.checked = true;
      check.append(renameBox, document.createTextNode('Rename the layer in Figma to match'));
      field.append(label, nameInput, check);
      host.appendChild(field);
    }
    const row = el('div', 'btn-row');
    const btn = el('button', 'btn', 'Extract this set') as HTMLButtonElement;
    btn.style.flex = '1';
    btn.disabled = !studioSel;
    if (!studioSel) btn.title = 'Select the component set in Figma first';
    btn.addEventListener('click', () => {
      const name = nameInput?.value.trim() ?? '';
      if (isFrame && !name) {
        nameInput?.focus();
        $s('studioVerdict').className = 'studio-verdict bad';
        $s('studioVerdict').textContent = 'A frame needs a name before it can be extracted.';
        return;
      }
      studioExtract(btn, name, Boolean(renameBox?.checked));
    });
    row.appendChild(btn);
    host.appendChild(row);
    return;
  }
  host.appendChild(el('div', 'studio-empty', 'Evidence is published for this set but nobody has curated it yet. Drafting reads the real axes and proposes a definition — every judgment call it makes is listed for you to review before anything is published.'));
  const row = el('div', 'btn-row');
  const btn = el('button', 'btn', 'Draft a contract from the evidence') as HTMLButtonElement;
  btn.style.flex = '1';
  btn.addEventListener('click', async () => {
    btn.disabled = true; btn.textContent = 'Drafting…';
    try {
      const res = await studioApi('/draft', { method: 'POST', body: JSON.stringify({ slug: studio.slug, name: studioSel?.name }) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error ?? (res.status === 404
        ? 'Sync server is running older code. Restart it: npm run contract-sync (in apps/s2a-toolkit).'
        : `draft failed (${res.status})`));
      studio.def = out.def;
      studio.dirty = true;
      studio.validation = null;
      studioRender();
      studioValidate();
    } catch (err: any) {
      btn.disabled = false; btn.textContent = 'Draft a contract from the evidence';
      $s('studioVerdict').className = 'studio-verdict bad';
      $s('studioVerdict').textContent = `Could not draft: ${err.message ?? err}`;
    }
  });
  row.appendChild(btn);
  host.appendChild(row);
}

function studioRenderNotes() {
  const host = $s('studioDraftNotes');
  const notes = (studio.def?.decisions ?? []).filter((n: any) => n.status === 'open');
  if (!notes.length) { host.style.display = 'none'; host.innerHTML = ''; return; }
  const low = notes.filter((n: any) => n.confidence === 'low').length;
  host.innerHTML = '';
  host.appendChild(el('div', 'studio-notes-head',
    `${notes.length} judgment call${notes.length === 1 ? '' : 's'} to review${low ? ` · ${low} low confidence` : ''}`));
  const band = (c: string) => (c === 'low' ? 0 : c === 'medium' ? 1 : 2);
  for (const n of [...notes].sort((a: any, b: any) => band(a.confidence) - band(b.confidence)).slice(0, 6)) {
    const row = el('div', 'studio-note');
    const conf = el('span', `studio-note-conf${n.confidence === 'low' ? ' low' : ''}`, n.confidence ?? '—');
    const body = el('span', undefined, n.chose ? n.chose : n.question);
    if (n.fix) row.title = `If wrong: ${n.fix}`;
    row.append(conf, body);
    host.appendChild(row);
  }
  host.style.display = 'block';
}

function studioRender() {
  const d = studio.def;
  $s('studioId').textContent = d?.component ? `${d.component} · ${studio.slug}` : (studio.slug ?? '—');
  const set = studio.evidence?.set;
  $s('studioSub').textContent = set ? `${set.name ?? ''} · ${studio.evidence?.axes?.length ?? 0} axes` : (studio.slug ?? '');
  $s('studioDraftChip').style.display = d?.status === 'curated-draft' ? 'inline-block' : 'none';
  studioRenderNotes();
  if (studio.jsonMode) { studioRenderFooter(); return; }
  studioRenderGui();
  studioRenderFooter();
}

function studioSetMode(json: boolean) {
  // Refuse to leave JSON mode while it is unparseable — switching would silently
  // discard whatever the person was in the middle of typing.
  if (!json && studio.jsonMode && studio.jsonError) return;
  studio.jsonMode = json;
  $s('studioModeGui').classList.toggle('active', !json);
  $s('studioModeJson').classList.toggle('active', json);
  $s('studioGui').style.display = json ? 'none' : 'block';
  $s('studioJsonWrap').style.display = json ? 'block' : 'none';
  if (json) studioMountEditor();
  studioRender();
}

// The editor is created on entry and torn down on exit rather than kept alive,
// so it can never hold a document that disagrees with studio.def.
function studioMountEditor() {
  const host = $s('studioJson');
  const text = JSON.stringify(studio.def, null, 2);
  if (studioEditor) { studioEditor.setValue(text); return; }
  host.innerHTML = '';
  studioEditor = createJsonEditor(host, {
    doc: text,
    onChange: (value) => {
      studioResult = null;
      try {
        studio.def = JSON.parse(value);
        studio.jsonError = null;
        studio.validation = null;
        studio.dirty = true;
        studioValidate();
      } catch (err: any) {
        // The editor already underlines the offending line; the footer only has
        // to say that publishing is off the table until it parses.
        studio.jsonError = String(err?.message ?? err).replace(/^JSON\.parse: /, '');
        studio.validation = null;
      }
      studioRenderFooter();
    },
    // Schema errors the parser cannot see, mapped onto the whole document —
    // better than a message with no location at all.
    externalDiagnostics: () => (studio.validation?.errors ?? []).map((message) => ({
      from: 0, to: 0, severity: 'warning' as const, message,
    })),
  });
}

function studioUnmountEditor() {
  studioEditor?.destroy();
  studioEditor = null;
}

document.getElementById('studioOpenBtn')?.addEventListener('click', () => {
  if (!studioSel) return;
  sendTelemetry('action:studio-open');
  // Send the set's name and let the server resolve it. A client-side kebab turns
  // "Button — v2" into a slug that does not exist; resolveSlug knows it is Button.
  studioOpen(studioSel.name, 'name');
});
document.getElementById('studioBackBtn')?.addEventListener('click', () => { studioUnmountEditor(); studioShow('list'); studioRefreshIndex(); });
document.getElementById('studioModeGui')?.addEventListener('click', () => studioSetMode(false));
for (const [id, depth] of [['studioFold1', 1], ['studioFold2', 2], ['studioFold3', 3]] as const) {
  document.getElementById(id)?.addEventListener('click', () => studioEditor?.foldToDepth(depth));
}
document.getElementById('studioUnfold')?.addEventListener('click', () => studioEditor?.unfoldAll());
document.getElementById('studioModeJson')?.addEventListener('click', () => studioSetMode(true));


document.getElementById('studioPublishBtn')?.addEventListener('click', async () => {
  if (!canPublish(studio) || !studio.def) return;
  sendTelemetry('action:studio-publish');
  const btn = $s('studioPublishBtn') as HTMLButtonElement;
  studio.busy = true; btn.disabled = true; btn.textContent = 'Publishing…';
  try {
    // Same endpoint every other change uses: regenerate, gate, PR. The editor
    // has no privileged path in.
    const res = await studioApi('/evidence', { method: 'POST', body: JSON.stringify({ defEdits: [studio.def], slug: studio.slug }) });
    const out = await res.json();
    studioResult = res.ok
      ? { tone: 'ok', text: `Saved to ${out.defs?.[0]?.path ?? 'the repo'} — regenerate and run the gate.` }
      : { tone: 'bad', text: `Failed: ${(out.errors ?? [out.error ?? res.status]).slice(0, 2).join(' · ')}` };
    studio.dirty = !res.ok;
  } catch (err: any) {
    studioResult = { tone: 'bad', text: `Failed: ${err.message ?? err}` };
  } finally {
    studio.busy = false; btn.textContent = 'Publish contract →';
    // studioRenderFooter() re-derives the verdict from state, so the result has
    // to live in state too — otherwise the success message is overwritten by the
    // stale verdict the instant it is shown.
    studioRenderFooter();
  }
});

// ── Contract evidence ─────────────────────────────────────────────────────────
// Extract runs in the sandbox (contract-extract.ts); this side hashes, shows a
// summary, and talks to the local sync server. Badge: ✓ has a contract when a
// spec.json exists for the set's slug, ○ new when none does, unknown offline.

// Per-user sync endpoint (clientStorage via code.ts): localhost in
// development, the contract relay when published. Same request body either way.
let contractEndpoint = 'http://localhost:9410';
let contractRelayKey = '';
const contractHeaders = (): Record<string, string> => ({ 'Content-Type': 'application/json', ...(contractRelayKey ? { 'x-s2a-relay-key': contractRelayKey } : {}) });

function setContractStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('contractStatus') as HTMLElement;
  el.innerHTML = msg; el.className = 'status' + (type ? ' ' + type : '');
}

function contractSlug(name: string): string {
  return name
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s*[—–-]\s*v\d+(\.\d+)*\s*$/i, '')
    .replace(/\(.*?\)/g, '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

async function contractIndex(): Promise<Map<string, string> | null> {
  if (contractIndexCache && Date.now() - contractIndexCache.at < 30000) return contractIndexCache.slugs;
  try {
    const res = await fetch(`${contractEndpoint.replace(/\/$/, '')}/contracts`, { headers: contractHeaders() });
    if (!res.ok) return null;
    const data = await res.json() as { items: Array<{ slug: string; name: string; figmaEvidence: { hash: string } | null }> };
    const slugs = new Map<string, string>();
    for (const item of data.items) slugs.set(item.slug, item.figmaEvidence ? 'evidence' : 'spec');
    contractIndexCache = { at: Date.now(), slugs };
    return slugs;
  } catch { return null; }
}

let contractIsFrame = false;
async function updateContractSelection(sel: { id: string; name: string; nodeType: string; variantCount?: number } | null) {
  const setLike = sel?.nodeType === 'COMPONENT_SET' || sel?.nodeType === 'COMPONENT' || sel?.nodeType === 'INSTANCE';
  contractIsFrame = sel?.nodeType === 'FRAME' || sel?.nodeType === 'SECTION' || sel?.nodeType === 'GROUP';
  const ok = setLike || contractIsFrame;
  (document.getElementById('contractNameField') as HTMLElement).style.display = contractIsFrame ? 'block' : 'none';
  (document.getElementById('contractMatch') as HTMLElement).style.display = 'none';
  (document.getElementById('contractBuildRow') as HTMLElement).style.display = 'none';
  if (contractIsFrame && sel) (document.getElementById('contractNameInput') as HTMLInputElement).placeholder = contractSlug(sel.name) || 'candidate-name';
  contractSetId = ok ? (sel?.id ?? null) : null;
  contractEvidence = null;
  // One card now serves extraction and curation, so this no longer owns a
  // selection card of its own — it only writes the contract status line.
  const statusEl = document.getElementById('contractSetStatus') as HTMLElement;
  const extract  = document.getElementById('contractExtractBtn') as HTMLButtonElement;
  const copy     = document.getElementById('contractCopyBtn')    as HTMLButtonElement;
  const publish  = document.getElementById('contractPublishBtn') as HTMLButtonElement;
  const summary  = document.getElementById('contractSummary')    as HTMLElement;
  summary.style.display = 'none';
  copy.disabled = true; publish.disabled = true;
  if (!ok || !sel) { statusEl.textContent = ''; extract.disabled = true; return; }
  extract.disabled = false;
  statusEl.textContent = 'checking…';
  const slugs = await contractIndex();
  if (contractSetId !== sel.id) return; // selection moved on
  const slug = contractSlug(sel.name);
  if (contractIsFrame) { statusEl.textContent = `${sel.nodeType.toLowerCase()} · candidate; Extract to see repeats and the closest contracts`; return; }
  if (!slugs) statusEl.textContent = `${slug} · status unknown (${contractEndpoint} unreachable)`;
  else if (slugs.get(slug) === 'evidence') { statusEl.textContent = `✓ ${slug} · contract + evidence`; (document.getElementById('contractBuildRow') as HTMLElement).style.display = 'flex'; }
  else if (slugs.get(slug) === 'spec') { statusEl.textContent = `✓ ${slug} · has a contract, no evidence yet`; (document.getElementById('contractBuildRow') as HTMLElement).style.display = 'flex'; }
  else statusEl.textContent = `○ ${slug} · new`;
}

// SHA-256 without WebCrypto: the plugin UI iframe is not a secure context in
// Figma, so crypto.subtle is unavailable there. Pure JS, same digest.
function sha256Sync(text: string): string {
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const bytes = new TextEncoder().encode(text);
  const bitLen = bytes.length * 8;
  const padded = new Uint8Array(((bytes.length + 9 + 63) >> 6) << 6);
  padded.set(bytes); padded[bytes.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000)); dv.setUint32(padded.length - 4, bitLen >>> 0);
  let h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a,h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
  const w = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) { const s0 = rotr(w[i-15],7) ^ rotr(w[i-15],18) ^ (w[i-15] >>> 3); const s1 = rotr(w[i-2],17) ^ rotr(w[i-2],19) ^ (w[i-2] >>> 10); w[i] = (w[i-16] + s0 + w[i-7] + s1) >>> 0; }
    let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,h=h7;
    for (let i = 0; i < 64; i++) { const S1 = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25); const ch = (e & f) ^ (~e & g); const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0; const S0 = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22); const maj = (a & b) ^ (a & c) ^ (b & c); const t2 = (S0 + maj) >>> 0; h=g; g=f; f=e; e=(d + t1) >>> 0; d=c; c=b; b=a; a=(t1 + t2) >>> 0; }
    h0=(h0+a)>>>0; h1=(h1+b)>>>0; h2=(h2+c)>>>0; h3=(h3+d)>>>0; h4=(h4+e)>>>0; h5=(h5+f)>>>0; h6=(h6+g)>>>0; h7=(h7+h)>>>0;
  }
  return [h0,h1,h2,h3,h4,h5,h6,h7].map(x => x.toString(16).padStart(8, '0')).join('');
}

async function sha256Hex(text: string): Promise<string> {
  try {
    if (globalThis.crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch { /* fall through */ }
  return sha256Sync(text);
}

// Best-effort debug line to the sync endpoint (POST /log), so what happens
// inside Figma is readable from the terminal that runs the server.
function contractLog(event: string, detail?: unknown) {
  try {
    fetch(`${contractEndpoint.replace(/\/$/, '')}/log`, { method: 'POST', headers: contractHeaders(), body: JSON.stringify({ event, detail, at: new Date().toISOString() }), keepalive: true }).catch(() => {});
  } catch { /* ignore */ }
}

function runContractExtract() {
  if (!contractSetId) return;
  sendTelemetry('action:contract-extract');
  // Frames rarely carry a usable layer name; the candidate name given here
  // becomes the evidence's set name (and, if ticked, the layer's name).
  const name = contractIsFrame ? (document.getElementById('contractNameInput') as HTMLInputElement).value.trim() : '';
  const rename = contractIsFrame && (document.getElementById('contractRenameLayer') as HTMLInputElement).checked;
  contractLog('extract:start', { setId: contractSetId, name: name || undefined });
  const btn = document.getElementById('contractExtractBtn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Extracting…';
  setContractStatus('');
  postToPlugin('contract:extract', { setId: contractSetId, name, rename });
}

document.getElementById('contractExtractBtn')?.addEventListener('click', runContractExtract);

document.getElementById('contractCopyBtn')?.addEventListener('click', async () => {
  if (!contractEvidence) return;
  const text = JSON.stringify({ ...contractEvidence.evidence, provenance: { hash: contractEvidence.hash } }, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    setContractStatus('Evidence JSON copied', 'ok');
  } catch {
    // Figma's iframe can refuse the async clipboard; fall back to a hidden textarea.
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    const done = document.execCommand('copy'); ta.remove();
    setContractStatus(done ? 'Evidence JSON copied' : 'Copy failed', done ? 'ok' : 'err');
  }
});

document.getElementById('contractPublishBtn')?.addEventListener('click', async () => {
  if (!contractEvidence) return;
  sendTelemetry('action:contract-publish');
  contractLog('publish:start', { hash: contractEvidence.hash, endpoint: contractEndpoint });
  const btn = document.getElementById('contractPublishBtn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Publishing…';
  try {
    const res = await fetch(`${contractEndpoint.replace(/\/$/, '')}/evidence`, {
      method: 'POST',
      headers: contractHeaders(),
      body: JSON.stringify({ evidence: contractEvidence.evidence, hash: contractEvidence.hash, ...(contractIsFrame ? { slug: (document.getElementById('contractNameInput') as HTMLInputElement).value.trim() || undefined } : {}) }),
    });
    const out = await res.json() as { status?: string; path?: string; branch?: string; actions?: string; error?: string; proposal?: string | null; note?: string };
    if (!res.ok) throw new Error(out.error || `Sync endpoint returned ${res.status}`);
    contractIndexCache = null;
    // Local server: new | updated | in-sync with a path. Relay: dispatched with a branch.
    const note = out.status === 'in-sync' ? 'Already in sync' : out.status === 'dispatched' ? 'Published to CI' : out.status === 'new' ? 'Written (new)' : 'Updated';
    const where = out.branch ? `branch <code>${esc(out.branch)}</code>${out.actions ? ` · <a href="${esc(out.actions)}" target="_blank">Actions →</a>` : ''}` : `<code>${esc(out.path || '')}</code>`;
    setContractStatus(`${note}: ${where}${out.proposal ? '<br>' + esc(out.proposal) : ''}${out.note && out.status === 'dispatched' ? '<br>' + esc(out.note) : ''}`, 'ok');
  } catch (err: any) {
    contractLog('publish:error', err?.message || String(err));
    setContractStatus(`Publish failed: ${esc(err?.message || String(err))}. Local: <code>npm run contract-sync</code> in apps/s2a-toolkit; or set the relay URL under Sync endpoint.`, 'err');
  } finally {
    btn.disabled = false; btn.textContent = 'Publish';
  }
});

async function onContractEvidence(msg: Record<string, unknown>) {
  // The Contract tab can start an extraction too. Route the reply back there
  // rather than into the Tools panel the person is not looking at.
  if (studioAwaitingExtract) { studioAwaitingExtract = false; void studioOnEvidence(msg); return; }
  const btn = document.getElementById('contractExtractBtn') as HTMLButtonElement;
  btn.disabled = !contractSetId; btn.textContent = 'Extract contract';
  if (msg.error) { contractLog('extract:error', msg.error); setContractStatus('❌ ' + esc(msg.error as string), 'err'); return; }
  try {
  const evidence = msg.evidence as Record<string, unknown>;
  const hash = 'sha256:' + await sha256Hex(msg.hashInput as string);
  const setInfo = evidence.set as { name: string; layerName?: string };
  if (setInfo?.layerName && setInfo.layerName !== setInfo.name) (document.getElementById('studioSelName') as HTMLElement).textContent = `${setInfo.name} (layer: ${setInfo.layerName})`;
  contractLog('extract:ok', { set: (evidence.set as any)?.name, counts: evidence.counts, durationMs: msg.durationMs, hash });
  contractEvidence = { evidence, canonical: msg.canonical as string, hash };
  const counts = evidence.counts as { variants: number; nodes: number; bindings: number; unboundPaintNodes: number };
  const axes = evidence.axes as Array<{ name: string; type: string; options?: string[] }>;
  const variables = Object.values(evidence.variables as Record<string, { name: string; collection: string }>);
  const collections = [...new Set(variables.map(v => v.collection))];
  const instances = evidence.instances as Array<{ set: { name: string } | null }>;
  const nested = [...new Set(instances.map(i => i.set?.name).filter(Boolean))];
  const meta = (evidence.set as { meta: { version: string; status: string } }).meta;
  const pattern = evidence.pattern as { repeats: Array<{ count: number; unit: { name: string }; sharedLayers: string[] }>; genericLayers: number; namedLayers: number; roles: string[]; instancedSets: string[] } | undefined;
  const summary = document.getElementById('contractSummary') as HTMLElement;
  summary.textContent = [
    `${meta.version ? 'v' + meta.version + (meta.status ? ' · ' + meta.status : '') : 'no s2a:meta version'}`,
    `${counts.variants} variants · ${counts.nodes} nodes · ${counts.bindings} bindings in ${(msg.durationMs as number) ?? 0}ms`,
    `axes: ${axes.map(a => a.name + (a.options ? `[${a.options.length}]` : ':' + a.type.toLowerCase())).join(', ') || 'none'}`,
    `variables: ${variables.length} across ${collections.join(', ') || 'none'}`,
    `nested sets: ${nested.join(', ') || 'none'}`,
    counts.unboundPaintNodes ? `⚠ ${counts.unboundPaintNodes} painted nodes with no variable` : 'all painted nodes bound',
    ...(pattern ? [
      pattern.repeats.length ? `repeats: ${pattern.repeats[0].count}× "${pattern.repeats[0].unit.name}" (shared: ${pattern.repeats[0].sharedLayers.join(', ') || 'none named'})` : 'repeats: none',
      `roles: ${pattern.roles.join(', ') || 'none'} · S2A instances inside: ${pattern.instancedSets.join(', ') || 'none'}`,
      `${pattern.genericLayers} of ${pattern.genericLayers + pattern.namedLayers} layers have generated names`,
    ] : []),
    hash,
  ].join('\n');
  summary.style.display = 'block';
  void showContractMatch(evidence);
  (document.getElementById('contractCopyBtn') as HTMLButtonElement).disabled = false;
  (document.getElementById('contractPublishBtn') as HTMLButtonElement).disabled = false;
  setContractStatus('Extracted. Publish sends it to the sync server; Copy puts the JSON on the clipboard.', 'ok');
  } catch (err: any) {
    contractLog('extract:ui-error', err?.message || String(err));
    setContractStatus('❌ Could not summarize the evidence: ' + esc(err?.message || String(err)), 'err');
  }
}

// Structural match against the contract index: does this already exist, can
// it be extended, or is it new? Computed by the sync endpoint from roles.
async function showContractMatch(evidence: Record<string, unknown>) {
  const el = document.getElementById('contractMatch') as HTMLElement;
  try {
    const res = await fetch(`${contractEndpoint.replace(/\/$/, '')}/match`, { method: 'POST', headers: contractHeaders(), body: JSON.stringify({ evidence }) });
    if (!res.ok) { el.style.display = 'none'; return; }
    const m = await res.json() as { verdict: string; summary: string; unit: Array<{ name: string; slug: string; score: number; missing: string[]; verified: boolean }>; organism: Array<{ name: string; score: number; acceptsBest: boolean }>; candidate: { repeats: { count: number } | null } };
    contractLog('match', { verdict: m.verdict, top: m.unit.slice(0, 3).map(u => `${u.slug}:${u.score}`) });
    el.textContent = [
      `${m.verdict === 'extend' ? '↔ extend' : m.verdict === 'new' ? '＋ new contract' : '↔ extend or ＋ new'}: ${m.summary}`,
      ...m.unit.slice(0, 3).map(u => `  ${u.name} ${u.score}${u.missing.length ? ` · would need ${u.missing.join(', ')}` : ''}${u.verified ? ' · evidence ✓' : ''}`),
      ...(m.candidate.repeats ? [`  organism (${m.candidate.repeats.count}× unit): ${m.organism.length ? m.organism.map(o => `${o.name} ${o.score}${o.acceptsBest ? ' ✓ accepts' : ''}`).join(' · ') : 'no collection contract yet'}`] : []),
    ].join('\n');
    el.style.display = 'block';
  } catch { el.style.display = 'none'; }
}

// Build a component set on the current page from the contract's figma.plan.json.
document.getElementById('contractBuildBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('contractBuildBtn') as HTMLButtonElement;
  const name = (document.getElementById('studioSelName') as HTMLElement).textContent || '';
  const slug = contractSlug(name);
  btn.disabled = true; btn.textContent = 'Building…';
  try {
    const res = await fetch(`${contractEndpoint.replace(/\/$/, '')}/plan/${encodeURIComponent(slug)}`, { headers: contractHeaders() });
    if (!res.ok) throw new Error((await res.json()).error || `no plan for ${slug}`);
    const plan = await res.json();
    contractLog('build-set:start', { slug });
    postToPlugin('contract:build-set', { plan, slug });
  } catch (err: any) {
    contractLog('build-set:error', err?.message || String(err));
    setContractStatus(`Build failed: ${esc(err?.message || String(err))}`, 'err');
    btn.disabled = false; btn.textContent = 'Build set from contract';
  }
});

document.getElementById('contractEndpointSaveBtn')?.addEventListener('click', () => {
  const endpoint = (document.getElementById('contractEndpointInput') as HTMLInputElement).value.trim() || 'http://localhost:9410';
  const relayKey = (document.getElementById('contractRelayKeyInput') as HTMLInputElement).value.trim();
  contractEndpoint = endpoint; contractRelayKey = relayKey; contractIndexCache = null;
  postToPlugin('contract-endpoint:set', { endpoint, relayKey });
  setContractStatus(`Sync endpoint: <code>${esc(endpoint)}</code>`, 'ok');
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
        updateDocCheckSelection({ ...sel, width: msg.width as number | undefined, height: msg.height as number | undefined });
        studioSetSelection(sel);
        void updateContractSelection(sel);
        updateCopyBtn(sel, msg.fileKey as string | null, msg.fileName as string | null, msg.allNodes as Array<{ id: string; name: string }> | undefined);
        updateSectionBar(
          !!(msg.isSection as boolean),
          (msg.sectionCount as number) ?? 0,
          (msg.sectionName as string)  ?? sel.name,
        );
      } else {
        updateAnnotateSelection(null);
        updateDocSelection(null);
        void updateContractSelection(null);
        updateCopyBtn(null, null);
        updateSectionBar(false, 0, '');
      }
      if (activePanel === 'request') postToPlugin('request:capture');
      break;
    }
    case 'contract-endpoint:value': {
      contractEndpoint = (msg.endpoint as string) || 'http://localhost:9410';
      contractRelayKey = (msg.relayKey as string) || '';
      (document.getElementById('contractEndpointInput') as HTMLInputElement).value = contractEndpoint;
      (document.getElementById('contractRelayKeyInput') as HTMLInputElement).value = contractRelayKey;
      break;
    }
    case 'contract:evidence': {
      void onContractEvidence(msg as Record<string, unknown>);
      break;
    }
    // Sandbox → sync server file drop (PNG goldens, diffs): bytes never pass
    // through the console. Sent by code.ts with figma.ui.postMessage.
    case 'contract:artifact': {
      fetch(`${contractEndpoint.replace(/\/$/, '')}/artifact`, { method: 'POST', headers: contractHeaders(), body: JSON.stringify({ name: msg.name, b64: msg.b64 }) })
        .then(r => r.json())
        .then(r => { contractLog('artifact:saved', r); parent.postMessage({ pluginMessage: { type: 'contract:artifact:saved', name: msg.name, result: r } }, '*'); })
        .catch(err => contractLog('artifact:error', err?.message || String(err)));
      break;
    }
    case 'contract:build-set:done': {
      const btn = document.getElementById('contractBuildBtn') as HTMLButtonElement;
      btn.disabled = false; btn.textContent = 'Build set from contract';
      if (msg.error) { contractLog('build-set:error', msg.error); setContractStatus('❌ Build failed: ' + esc(msg.error as string), 'err'); break; }
      const r = msg.report as { set: string; variants: number; layers: number; boundVariables: number; unresolvedVariables: string[]; stylesApplied: number; stylesMissing: string[]; properties: number; notes: string[] };
      contractLog('build-set:done', r);
      setContractStatus(`Built <code>${esc(r.set)}</code>: ${r.variants} variants, ${r.layers} layers, ${r.boundVariables} variables bound, ${r.stylesApplied} text styles, ${r.properties} properties${r.unresolvedVariables.length ? `; ${r.unresolvedVariables.length} variables not found locally (${esc(r.unresolvedVariables.slice(0, 4).join(', '))}…)` : ''}${r.stylesMissing.length ? `; styles missing: ${esc(r.stylesMissing.join(', '))}` : ''}${r.notes?.length ? `; ${r.notes.length} notes in the log` : ''}`, r.unresolvedVariables.length || r.stylesMissing.length ? '' : 'ok');
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

    case 'studio:swap-targets-result': {
      studioSwapTargets = (msg.targets ?? {}) as Record<string, Array<{ role: string; name: string }>>;
      if (studio.def && !studio.jsonMode) studioRenderGui();
      break;
    }

    case 'docs:check-result': {
      const btn = document.getElementById('docCheckBtn') as HTMLButtonElement;
      btn.disabled = false; btn.textContent = 'Check readability';
      const status = document.getElementById('docCheckStatus') as HTMLElement;
      const list = document.getElementById('docCheckIssues') as HTMLElement;
      if (msg.error) { status.textContent = String(msg.error); list.style.display = 'none'; list.innerHTML = ''; break; }
      const fails = msg.fails as number, warns = msg.warns as number;
      status.textContent = fails === 0 && warns === 0
        ? `Pass — ${msg.textNodes} text nodes, theme ${msg.theme ?? '?'}`
        : `${fails} to fix, ${warns} to look at — ${msg.textNodes} text nodes`;
      const issues = (msg.issues ?? []) as Array<{ level: string; code: string; message: string; nodeId?: string }>;
      if (!issues.length) { list.style.display = 'none'; list.innerHTML = ''; break; }
      // Least-forgiving first, so the things that actually break reading are on top.
      const order = (l: string) => (l === 'fail' ? 0 : 1);
      list.innerHTML = '';
      for (const i of [...issues].sort((a, b) => order(a.level) - order(b.level))) {
        const row = document.createElement('div');
        row.style.cssText = 'font-size:10.5px; line-height:1.45; padding:4px 6px; margin-bottom:3px; border-left:2px solid ' +
          (i.level === 'fail' ? '#d4594a' : '#b8862b') + '; cursor:' + (i.nodeId ? 'pointer' : 'default') + ';';
        row.textContent = `${i.level === 'fail' ? 'fix' : 'look'} · ${i.code} — ${i.message}`;
        if (i.nodeId) row.addEventListener('click', () => postToPlugin('docs:reveal', { nodeId: i.nodeId }));
        list.appendChild(row);
      }
      list.style.display = 'block';
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
// REQUEST_ENDPOINT empty ⇒ direct mode.
const REQUEST_ENDPOINT = '';

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
        headers: { 'content-type': 'application/json' },
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
postToPlugin('contract-endpoint:get');
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
