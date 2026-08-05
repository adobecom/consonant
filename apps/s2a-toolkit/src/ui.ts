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
let selectSetId:    string | null = null;
let specSetId:      string | null = null;
let versionSetId:   string | null = null;
let docsSetId:      string | null = null;
let variablesCache: { variables: any[]; variableCollections: any[] } | null = null;
let githubSettings: GitHubSettings | null = null;
let bridgeConnected      = false;
let bridgeWs: WebSocket | null = null;
let bridgeWsPort: number | null = null;
let bridgeKeepaliveTimer: ReturnType<typeof setInterval>  | null = null;
let bridgeReconnectTimer: ReturnType<typeof setTimeout>   | null = null;
let bridgeReconnectAttempts = 0;
let bridgeUserDisconnected  = false;
const BRIDGE_PREFERRED_PORT_KEY = 's2a:bridge:port';
let bridgeRespondingPorts: number[] = [];
let bridgeExecInFlight = 0;
let bridgeExecStartTime: number | null = null;
let bridgeExecTimer: ReturnType<typeof setInterval> | null = null;
let activePanel: Panel = 'home';
let settingsOpen = false;
let isMini = false;
let popoverOpen = false;

interface ConnectedFile {
  fileKey: string;
  fileName: string;
  currentPage: string;
  isActive: boolean;
}

let connectedFiles: ConnectedFile[] = [];

const pendingWsRequests = new Map<string, {
  resolve: (v: any) => void;
  reject:  (e: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}>();
let wsRequestCounter = 0;

const pendingRequests = new Map<string, {
  resolve: (v: any) => void;
  reject:  (e: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}>();
let requestCounter = 0;

// ── Panel switching ───────────────────────────────────────────────────────────

type Panel = 'home' | 'tokens' | 'tools' | 'files' | 'settings';

const panelEls: Record<Panel, HTMLElement> = {
  home:     document.getElementById('homePanel')     as HTMLElement,
  tokens:   document.getElementById('tokensPanel')   as HTMLElement,
  tools:    document.getElementById('toolsPanel')    as HTMLElement,
  files:    document.getElementById('filesPanel')    as HTMLElement,
  settings: document.getElementById('settingsPanel') as HTMLElement,
};

function switchPanel(panel: Panel) {
  if (panel !== 'settings') {
    settingsOpen = false;
    settingsBtn?.classList.remove('active');
  }
  activePanel = panel;
  Object.entries(panelEls).forEach(([key, el]) => {
    el.classList.toggle('active', key === panel);
  });
  document.querySelectorAll<HTMLButtonElement>('.tab[data-panel]').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.panel === panel);
  });
  if (panel === 'settings') { postToPlugin('get-settings'); postToPlugin('get-figma-token'); }
  if (panel === 'home') renderHomeView();
  if (panel === 'files') refreshConnectedFiles();
}

document.querySelectorAll<HTMLButtonElement>('.tab[data-panel]').forEach(tab => {
  tab.addEventListener('click', () => {
    const p = tab.dataset.panel as Panel;
    if (p) switchPanel(p);
  });
});

const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement;
settingsBtn?.addEventListener('click', () => {
  if (settingsOpen) {
    settingsOpen = false;
    settingsBtn.classList.remove('active');
    switchPanel(activePanel === 'settings' ? 'home' : activePanel);
  } else {
    settingsOpen = true;
    settingsBtn.classList.add('active');
    switchPanel('settings');
  }
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
  // Tokens
  {
    id: 'tokens:refresh',
    name: 'Refresh variables',
    description: 'Re-fetch all Figma variables from the current file',
    category: 'Tokens',
    uiAction: () => (document.getElementById('varRefreshBtn') as HTMLButtonElement)?.click(),
  },
  {
    id: 'tokens:export-local',
    name: 'Export tokens locally',
    description: 'Push token JSON to local dev server on port 9300',
    category: 'Tokens',
    uiAction: () => (document.getElementById('varExportLocalBtn') as HTMLButtonElement)?.click(),
  },
  {
    id: 'tokens:export-github',
    name: 'Push tokens to GitHub',
    description: 'Commit token JSON to your configured repo',
    category: 'Tokens',
    uiAction: () => (document.getElementById('varExportGithubBtn') as HTMLButtonElement)?.click(),
  },
  {
    id: 'tokens:doc-gen',
    name: 'Generate token docs',
    description: 'Build a Figma doc sheet for a token group',
    category: 'Tokens',
    uiAction: () => switchPanel('tokens'),
  },

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
    id: 'tools:spec',
    name: 'Generate spec sheet',
    description: 'Scaffold a Figma spec doc for a component set',
    category: 'Tools',
    uiAction: () => switchPanel('tools'),
  },
  {
    id: 'tools:version',
    name: 'Version component',
    description: 'Bump (patch/minor/major) or deprecate the selected component',
    category: 'Tools',
    uiAction: () => switchPanel('tools'),
  },
  {
    id: 'tools:docs',
    name: 'Generate component docs',
    description: 'Scaffold the bento doc for the selected component set',
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
  'tools:copy-link',
  'tokens:refresh',
  'tools:annotate',
  'tools:select-filter',
  'tokens:export-local',
  'tools:spec',
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
  if (activePanel === 'files') updateActiveFileCard();
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
const WS_PORTS = [9223,9224,9225,9226,9227,9228,9230,9231,9232]; // 9229 excluded — Node.js debugger port

const bridgeDot       = document.getElementById('bridgeDot')       as HTMLElement;
const bridgeDotMini   = document.getElementById('bridgeDotMini')   as HTMLElement;
const popoverDot      = document.getElementById('popoverDot')      as HTMLElement;
const bridgePortLabel = document.getElementById('bridgePortLabel') as HTMLElement;
const bridgePillLabel = document.getElementById('bridgePillLabel') as HTMLElement;
const bridgeToggleBtn = document.getElementById('bridgeToggleBtn') as HTMLButtonElement;
const bridgePopover   = document.getElementById('bridgePopover')   as HTMLElement;
const bridgeTabBtn    = document.getElementById('bridgeTabBtn')    as HTMLButtonElement;
const bridgeMiniBtn            = document.getElementById('bridgeMiniBtn')            as HTMLButtonElement;
const bridgeMultiServerWarn    = document.getElementById('bridgeMultiServerWarn')    as HTMLElement;
const bridgeMultiServerMsg     = document.getElementById('bridgeMultiServerMsg')     as HTMLElement;
const bridgeMultiServerCopyBtn = document.getElementById('bridgeMultiServerCopy')    as HTMLButtonElement;
const bridgeExecProgress       = document.getElementById('bridgeExecProgress')       as HTMLElement;
const bridgeExecLabelEl        = document.getElementById('bridgeExecLabel')          as HTMLElement;

function sendBridgeCommand(method: string, params: Record<string, unknown> = {}, timeoutMs = 15000): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestId = method.toLowerCase() + '_' + (++requestCounter) + '_' + Date.now();
    const isExec = method === 'EXECUTE_CODE';
    if (isExec) startExecProgress();
    const timeoutId = setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        if (isExec) stopExecProgress();
        reject(new Error(method + ' timed out after ' + timeoutMs + 'ms'));
      }
    }, timeoutMs);
    pendingRequests.set(requestId, {
      resolve: (v: any) => { if (isExec) stopExecProgress(); resolve(v); },
      reject:  (e: Error) => { if (isExec) stopExecProgress(); reject(e); },
      timeoutId,
    });
    postToPlugin('bridge:command', { requestId, method, params });
  });
}

function startExecProgress() {
  bridgeExecInFlight++;
  if (bridgeExecInFlight === 1) {
    bridgeExecStartTime = Date.now();
    if (bridgeExecTimer) clearInterval(bridgeExecTimer);
    bridgeExecProgress.style.display = 'flex';
    bridgeExecLabelEl.textContent = 'Running…';
    bridgeExecTimer = setInterval(() => {
      if (bridgeExecStartTime === null) return;
      const elapsed = Math.floor((Date.now() - bridgeExecStartTime) / 1000);
      bridgeExecLabelEl.textContent = 'Running… ' + elapsed + 's';
    }, 1000);
  }
}

function stopExecProgress() {
  bridgeExecInFlight = Math.max(0, bridgeExecInFlight - 1);
  if (bridgeExecInFlight === 0) {
    if (bridgeExecTimer) { clearInterval(bridgeExecTimer); bridgeExecTimer = null; }
    bridgeExecStartTime = null;
    bridgeExecProgress.style.display = 'none';
  }
}

function showMultiServerWarn(ports: number[]) {
  const killCmd = 'kill $(lsof -ti :' + ports.join(' :') + ')';
  bridgeMultiServerMsg.textContent = '⚠ ' + ports.length + ' MCP servers running — port conflict';
  bridgeMultiServerWarn.dataset.kill = killCmd;
  bridgeMultiServerWarn.style.display = 'block';
}

function hideMultiServerWarn() {
  bridgeMultiServerWarn.style.display = 'none';
  bridgeRespondingPorts = [];
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

bridgeMultiServerCopyBtn?.addEventListener('click', () => {
  const cmd = bridgeMultiServerWarn?.dataset.kill || '';
  if (!cmd) return;
  copyToClipboard(cmd);
  bridgeMultiServerCopyBtn.textContent = 'Copied!';
  setTimeout(() => { bridgeMultiServerCopyBtn.textContent = 'Copy fix'; }, 1500);
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
  if (activePanel === 'files') updateActiveFileCard();
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
  // Send FILE_INFO immediately with a fallback key so the server doesn't close
  // the connection after its 30s pending timeout. We update with real file info
  // once GET_FILE_INFO resolves.
  const fallbackFileInfo = { fileKey: 'local-' + Date.now(), fileName: 'S2A Toolkit', pluginVersion: '0.3.0' };
  console.log('[bridge] ws.readyState on open:', ws.readyState, 'sending FILE_INFO...');
  try {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'FILE_INFO', data: fallbackFileInfo }));
      console.log('[bridge] FILE_INFO sent OK, fileKey=', fallbackFileInfo.fileKey);
    } else {
      console.log('[bridge] ws not OPEN, skipping FILE_INFO send. readyState=', ws.readyState);
    }
  } catch (e) {
    console.error('[bridge] FILE_INFO send threw:', e);
  }

  sendBridgeCommand('GET_FILE_INFO', {}).then(result => {
    if (ws.readyState !== 1 || !result) return;
    const info = result.fileInfo || result;
    if (!info.fileKey) info.fileKey = fallbackFileInfo.fileKey;
    info.pluginVersion = '0.3.0';
    ws.send(JSON.stringify({ type: 'FILE_INFO', data: info }));
  }).catch(() => {});

  sendBridgeCommand('REFRESH_VARIABLES', {}, 30000).then(result => {
    if (ws.readyState !== 1 || !result?.data) return;
    ws.send(JSON.stringify({ type: 'VARIABLES_DATA', data: result.data }));
    renderVariables(result.data);
    renderTokenGroups(result.data);
    setVarMeta(result.data.variables.length + ' variables');
  }).catch(() => {});
}

function attachWsHandlers(ws: WebSocket, port: number) {
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      // Server-pushed broadcasts (no id)
      if (msg.type === 'CONNECTED_FILES_UPDATE' && msg.data) {
        handleConnectedFilesUpdate(msg.data as { files: ConnectedFile[]; activeFileKey: string });
        return;
      }
      if (msg.type === 'SERVER_HELLO' || msg.type === 'PLUGIN_UPDATE_AVAILABLE') return;
      // Responses to plugin-initiated server requests (id present, no method)
      if (msg.id && !msg.method) {
        const pending = pendingWsRequests.get(msg.id as string);
        if (pending) {
          clearTimeout(pending.timeoutId);
          pendingWsRequests.delete(msg.id as string);
          if (msg.error) pending.reject(new Error(msg.error as string));
          else pending.resolve(msg.result);
          return;
        }
      }
      // Claude's command requests (id + method)
      if (!msg.id || !msg.method) return;
      sendBridgeCommand(msg.method, msg.params || {}, 15000)
        .then(result => { if (ws.readyState === 1) ws.send(JSON.stringify({ id: msg.id, result })); })
        .catch(err  => { if (ws.readyState === 1) ws.send(JSON.stringify({ id: msg.id, error: err.message })); });
    } catch {}
  };
  ws.onclose = (e) => {
    console.log('[bridge] attachWsHandlers.onclose port', port, 'code', e.code, e.reason);
    bridgeStopKeepalive();
    bridgeWs = null; bridgeConnected = false;
    for (const [, p] of pendingRequests) { clearTimeout(p.timeoutId); p.reject(new Error('Bridge disconnected')); }
    pendingRequests.clear();
    updateBridgeUi();
    if (!bridgeUserDisconnected) scheduleReconnect(port);
  };
  ws.onerror = (e) => { console.log('[bridge] attachWsHandlers.onerror port', port, e); };
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
  console.log('[bridge] reconnectToPort', port);
  try {
    const ws = new WebSocket('ws://localhost:' + port);
    const t = setTimeout(() => {
      console.log('[bridge] reconnectToPort timeout, readyState=', ws.readyState);
      if (ws.readyState !== 1) ws.close();
    }, 3000);
    ws.onopen = () => {
      clearTimeout(t);
      console.log('[bridge] reconnectToPort.onopen port', port, 'readyState=', ws.readyState);
      bridgeWs = ws; bridgeWsPort = port; bridgeConnected = true; bridgeReconnectAttempts = 0;
      try { localStorage.setItem(BRIDGE_PREFERRED_PORT_KEY, String(port)); } catch {}
      updateBridgeUi(); attachWsHandlers(ws, port); initBridgeConnection(ws); bridgeStartKeepalive();
    };
    ws.onerror = (e) => { clearTimeout(t); console.log('[bridge] reconnectToPort.onerror port', port, e); };
    ws.onclose = (e) => { clearTimeout(t); console.log('[bridge] reconnectToPort.onclose port', port, 'code', e.code); if (!bridgeConnected && !bridgeUserDisconnected) bridgeConnect(); };
  } catch (e) { console.log('[bridge] reconnectToPort threw', e); if (!bridgeUserDisconnected) bridgeConnect(); }
}

function bridgeConnect() {
  bridgeUserDisconnected = false;
  if (bridgeReconnectTimer) { clearTimeout(bridgeReconnectTimer); bridgeReconnectTimer = null; }
  bridgeToggleBtn.textContent = 'Connecting…';
  bridgeToggleBtn.disabled = true;
  hideMultiServerWarn();

  // Hard fallback: Figma's plugin sandbox silently drops blocked WS connections
  // without firing onerror/onclose, leaving fanOut permanently pending. If we're
  // still not connected after 6s, reset the button so the user can see a failure.
  const giveUpTimer = setTimeout(() => {
    if (!bridgeConnected) {
      bridgeToggleBtn.textContent = 'Connect';
      bridgeToggleBtn.disabled = false;
      bridgePortLabel.textContent = 'No server found';
    }
  }, 6000);

  fanOutConnect(giveUpTimer);
}

function fanOutConnect(giveUpTimer?: ReturnType<typeof setTimeout>) {
  if (bridgeConnected) { if (giveUpTimer) clearTimeout(giveUpTimer); return; }
  const ports = WS_PORTS;
  let found = false;
  const done = new Set<number>();
  const responding: number[] = [];

  const markDone = (port: number) => {
    if (done.has(port)) return;
    done.add(port);
    if (done.size === ports.length) {
      if (giveUpTimer) clearTimeout(giveUpTimer);
      if (responding.length > 1) { bridgeRespondingPorts = [...responding]; showMultiServerWarn(responding); }
      if (!found) { bridgeToggleBtn.textContent = 'Connect'; bridgeToggleBtn.disabled = false; bridgePortLabel.textContent = 'No server found'; }
    }
  };

  ports.forEach(port => {
    try {
      const ws = new WebSocket('ws://localhost:' + port);
      const t = setTimeout(() => {
        // Figma may not fire onclose when we call close() on a CONNECTING socket —
        // call markDone directly before attempting close to avoid a permanent hang.
        markDone(port);
        try { ws.close(); } catch {}
      }, 3000);
      ws.onopen = () => {
        clearTimeout(t);
        responding.push(port);
        console.log('[bridge] ws.onopen port', port, 'found=', found);
        if (!found) {
          found = true;
          if (giveUpTimer) clearTimeout(giveUpTimer);
          try { localStorage.setItem(BRIDGE_PREFERRED_PORT_KEY, String(port)); } catch {}
          bridgeWs = ws; bridgeWsPort = port; bridgeConnected = true; bridgeReconnectAttempts = 0;
          updateBridgeUi(); attachWsHandlers(ws, port); initBridgeConnection(ws); bridgeStartKeepalive();
          markDone(port);
        } else {
          markDone(port);
          try { ws.close(); } catch {}
        }
      };
      ws.onerror = (e) => { clearTimeout(t); console.log('[bridge] ws.onerror port', port, e); markDone(port); };
      ws.onclose = (e) => { clearTimeout(t); console.log('[bridge] ws.onclose port', port, 'code', e.code, e.reason); markDone(port); };
    } catch { markDone(port); }
  });
}

function probeForExtras(connectedPort: number) {
  const otherPorts = WS_PORTS.filter(p => p !== connectedPort);
  const extras: number[] = [];
  otherPorts.forEach(port => {
    try {
      const ws = new WebSocket('ws://localhost:' + port);
      const t = setTimeout(() => { try { ws.close(); } catch {} }, 1500);
      ws.onopen = () => {
        clearTimeout(t);
        extras.push(port);
        ws.close();
        showMultiServerWarn([connectedPort, ...extras]);
      };
      ws.onerror = () => { clearTimeout(t); };
      ws.onclose = () => { clearTimeout(t); };
    } catch {}
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

// ── Token group helpers ───────────────────────────────────────────────────────

function getTokenGroup(name: string): string {
  const parts = name.split('/').filter(p => p !== 's2a');
  if (parts.length >= 4 && parts[1] === 'transparent') return parts[0] + ' / ' + parts[1] + ' / ' + parts[2];
  if (parts.length >= 3) return parts[0] + ' / ' + parts[1];
  return parts[0] ?? name;
}

// ── Variables / Tokens panel ──────────────────────────────────────────────────

function setVarMeta(_text: string) {}

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

function renderTokenGroups(data: { variables: any[]; variableCollections: any[] }) {
  const labelEl = document.getElementById('tokenGroupLabel') as HTMLElement;
  const listEl  = document.getElementById('tokenGroupList')  as HTMLElement;
  if (!listEl) return;

  const semanticColls = data.variableCollections.filter(c =>
    /Semantic|Responsive/.test(c.name) ||
    (/Primitives/.test(c.name) && /Color/.test(c.name)) ||
    (/Primitives/.test(c.name) && /Dimension/.test(c.name))
  );
  if (semanticColls.length === 0) {
    listEl.innerHTML = '';
    if (labelEl) labelEl.classList.add('hidden');
    return;
  }

  const collIdToName = new Map<string, string>();
  for (const c of data.variableCollections) collIdToName.set(c.id, c.name);

  const collSet = new Set(semanticColls.map((c: any) => c.id));
  const groups = new Map<string, { collectionId: string; collectionName: string; group: string; count: number }>();
  for (const v of data.variables) {
    if (!collSet.has(v.variableCollectionId)) continue;
    const collName: string = collIdToName.get(v.variableCollectionId) || '';
    const grp = getTokenGroup(v.name);
    if (/Primitives/.test(collName) && /Dimension/.test(collName) && grp !== 'opacity') continue;
    const key = v.variableCollectionId + '::' + grp;
    if (!groups.has(key)) {
      groups.set(key, { collectionId: v.variableCollectionId, collectionName: collName, group: grp, count: 0 });
    }
    groups.get(key)!.count++;
  }

  const sorted = [...groups.values()].sort((a, b) => {
    if (a.collectionName !== b.collectionName) return a.collectionName.localeCompare(b.collectionName);
    return a.group.localeCompare(b.group);
  });

  if (labelEl) labelEl.classList.remove('hidden');
  listEl.innerHTML = sorted.map(g =>
    `<div class="collection-row token-group-row" data-col="${esc(g.collectionId)}" data-group="${esc(g.group)}">
      <span class="collection-name">${esc(g.group)}</span>
      <span class="collection-count">${g.count}</span>
      <button class="gen-btn" title="Generate docs for ${esc(g.group)}">→</button>
    </div>`
  ).join('');
  listEl.insertAdjacentHTML('beforeend',
    `<div class="collection-row token-group-row" style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08)" data-col="text-styles" data-group="text-styles">
      <span class="collection-name">Text Styles</span>
      <span class="collection-count">—</span>
      <button class="gen-btn" title="Generate 4 breakpoint sections from native text styles">→</button>
    </div>`
  );
}

document.getElementById('tokenGroupList')?.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.gen-btn');
  if (!btn || btn.disabled) return;
  const row = btn.closest<HTMLElement>('.token-group-row');
  if (!row) return;
  btn.disabled = true;
  btn.textContent = '…';
  setVarStatus('Generating ' + (row.dataset.group ?? '') + '…');
  postToPlugin('token-docs:generate', { collectionId: row.dataset.col, group: row.dataset.group });
});

document.getElementById('varRefreshBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('varRefreshBtn') as HTMLButtonElement;
  btn.textContent = 'Refreshing…'; btn.disabled = true;
  setVarStatus('Loading…');
  try {
    const result = await sendBridgeCommand('REFRESH_VARIABLES', {}, 30000);
    if (result?.data) {
      renderVariables(result.data);
      renderTokenGroups(result.data);
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

// ── Files panel ───────────────────────────────────────────────────────────────

let figmaApiToken = '';

function sendServerRequest(type: string, data: Record<string, unknown> = {}, timeoutMs = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!bridgeWs || bridgeWs.readyState !== 1) { reject(new Error('Not connected to bridge')); return; }
    const id = 'sr_' + (++wsRequestCounter) + '_' + Date.now();
    const timeoutId = setTimeout(() => {
      pendingWsRequests.delete(id);
      reject(new Error(type + ' timed out'));
    }, timeoutMs);
    pendingWsRequests.set(id, { resolve, reject, timeoutId });
    try { bridgeWs.send(JSON.stringify({ type, id, data })); }
    catch (e) { pendingWsRequests.delete(id); clearTimeout(timeoutId); reject(e); }
  });
}

function handleConnectedFilesUpdate(data: { files: ConnectedFile[]; activeFileKey: string }) {
  connectedFiles = data.files || [];
  if (activePanel === 'files') renderConnectedFiles();
}

function setFilesStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('filesStatus') as HTMLElement;
  if (el) { el.textContent = msg; el.className = 'status' + (type ? ' ' + type : ''); }
}

function renderConnectedFiles() {
  const listEl = document.getElementById('connectedFilesList') as HTMLElement;
  if (!listEl) return;

  if (!bridgeConnected) {
    listEl.innerHTML = '<div class="empty-state">Connect to bridge first</div>';
    return;
  }
  if (connectedFiles.length === 0) {
    listEl.innerHTML = '<div class="empty-state">Only this file is connected.<br>Open the plugin in another Figma file to see it here.</div>';
    return;
  }

  listEl.innerHTML = connectedFiles.map(f =>
    `<div class="file-card${f.isActive ? ' file-card--active' : ''}">
      <div class="file-card-icon">${f.isActive ? '◉' : '○'}</div>
      <div class="file-card-meta">
        <span class="file-card-name">${esc(f.fileName)}</span>
        <span class="file-card-sub">${f.currentPage ? esc(f.currentPage) + ' · ' : ''}${esc(f.fileKey)}</span>
      </div>
      ${f.isActive
        ? '<span class="badge badge-hot" style="font-size:9px;margin-left:auto;">Active</span>'
        : `<button class="btn btn-ghost btn-sm" data-switch="${esc(f.fileKey)}" style="margin-left:auto;">Switch</button>`
      }
    </div>`
  ).join('');

  listEl.querySelectorAll<HTMLButtonElement>('[data-switch]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const fileKey = btn.dataset.switch!;
      btn.disabled = true; btn.textContent = '…';
      try {
        await sendServerRequest('SET_ACTIVE_FILE', { fileKey });
        setFilesStatus('Active file switched', 'ok');
      } catch (e: any) {
        setFilesStatus('Switch failed: ' + (e.message || 'error'), 'err');
        btn.disabled = false; btn.textContent = 'Switch';
      }
    });
  });
}

async function refreshConnectedFiles() {
  setFilesStatus('Scanning…');
  try {
    const result = await sendServerRequest('GET_CONNECTED_FILES', {}, 5000);
    connectedFiles = result.files || [];
    renderConnectedFiles();
    setFilesStatus('');
  } catch {
    connectedFiles = [];
    renderConnectedFiles();
    if (!bridgeConnected) setFilesStatus('Connect to bridge first', 'err');
    else setFilesStatus('Could not fetch file list', 'err');
  }
}

document.getElementById('filesRefreshBtn')?.addEventListener('click', () => refreshConnectedFiles());

// Figma token save (for GitHub export auth — kept in Settings)
function setFigmaTokenStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('figmaTokenStatus') as HTMLElement;
  if (el) { el.textContent = msg; el.className = 'status' + (type ? ' ' + type : ''); }
}

document.getElementById('saveFigmaTokenBtn')?.addEventListener('click', () => {
  const token = ((document.getElementById('figmaApiToken') as HTMLInputElement)?.value || '').trim();
  postToPlugin('save-figma-token', { token });
});

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

// ── Tools — Spec ──────────────────────────────────────────────────────────────

function setSpecStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('specStatus') as HTMLElement;
  el.textContent = msg; el.className = 'status' + (type ? ' ' + type : '');
}

function updateSpecSelection(sel: { id: string; name: string; nodeType: string; variantCount?: number } | null) {
  const isValid = sel?.nodeType === 'COMPONENT_SET' || sel?.nodeType === 'COMPONENT';
  specSetId = isValid ? (sel?.id ?? null) : null;
  const emptyEl  = document.getElementById('specSelectionEmpty') as HTMLElement;
  const infoEl   = document.getElementById('specSelectionInfo')  as HTMLElement;
  const nameEl   = document.getElementById('specSetName')   as HTMLElement;
  const countEl  = document.getElementById('specSetCount')  as HTMLElement;
  const genBtn   = document.getElementById('specGenerateBtn') as HTMLButtonElement;
  if (isValid && sel) {
    emptyEl.style.display = 'none'; infoEl.style.display = 'flex';
    nameEl.textContent  = sel.name;
    countEl.textContent = sel.nodeType === 'COMPONENT_SET'
      ? (sel.variantCount ?? 0) + ' variants'
      : '1 variant';
    genBtn.disabled = false;
  } else {
    emptyEl.style.display = 'block'; infoEl.style.display = 'none';
    genBtn.disabled = true;
  }
}

document.querySelectorAll<HTMLButtonElement>('#specOpts .chip').forEach(chip => {
  chip.addEventListener('click', () => chip.classList.toggle('on'));
});

document.getElementById('specGenerateBtn')?.addEventListener('click', () => {
  if (!specSetId) return;
  const on = new Set(
    Array.from(document.querySelectorAll<HTMLButtonElement>('#specOpts .chip.on'))
      .map(c => c.dataset.opt!)
  );
  if (on.size === 0) { setSpecStatus('Select at least one section to include', 'err'); return; }
  const btn = document.getElementById('specGenerateBtn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Generating…';
  setSpecStatus('');
  postToPlugin('spec:generate', {
    setId: specSetId,
    options: { variants: on.has('variants'), tokens: on.has('tokens'), children: on.has('children') },
  });
});

// ── Tools — Versioning ─────────────────────────────────────────────────────────

interface VersionMeta {
  version: string | null;
  status: 'active' | 'deprecated';
  updated: string | null;
  replacedBy: string | null;
  removeBy: string | null;
  changelog: Array<{ version: string; date: string; level: string; summary: string }>;
}

function setVersionStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('versionStatus') as HTMLElement;
  el.textContent = msg; el.className = 'status' + (type ? ' ' + type : '');
}

function updateVersionSelection(
  sel: { id: string; name: string; nodeType: string } | null,
  meta: VersionMeta | null,
) {
  const isValid = sel?.nodeType === 'COMPONENT_SET' || sel?.nodeType === 'COMPONENT';
  versionSetId = isValid ? (sel?.id ?? null) : null;

  const emptyEl = document.getElementById('versionSelectionEmpty') as HTMLElement;
  const infoEl  = document.getElementById('versionSelectionInfo')  as HTMLElement;
  const nameEl  = document.getElementById('versionSetName')  as HTMLElement;
  const curEl   = document.getElementById('versionCurrent')  as HTMLElement;
  const badgeEl = document.getElementById('versionBadge')    as HTMLElement;
  const initRow = document.getElementById('versionInitRow')  as HTMLElement;
  const activeBox = document.getElementById('versionActiveBox') as HTMLElement;
  const deprecatedBox = document.getElementById('versionDeprecatedBox') as HTMLElement;
  const forkNote = document.getElementById('versionForkNote') as HTMLElement;

  forkNote.style.display = 'none';
  setVersionStatus('');

  if (!isValid || !sel) {
    emptyEl.style.display = 'block';
    infoEl.style.display = 'none';
    initRow.style.display = activeBox.style.display = deprecatedBox.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  infoEl.style.display = 'flex';
  nameEl.textContent = sel.name;

  const versioned = !!(meta && meta.version);
  if (!versioned) {
    curEl.textContent = 'unversioned';
    badgeEl.textContent = 'none';
    badgeEl.className = 'version-badge unversioned';
    badgeEl.style.display = 'inline-block';
    initRow.style.display = 'flex';
    activeBox.style.display = deprecatedBox.style.display = 'none';
    return;
  }

  curEl.textContent = 'v' + meta!.version + (meta!.updated ? ' · ' + meta!.updated : '');
  badgeEl.textContent = meta!.status;
  badgeEl.className = 'version-badge ' + meta!.status;
  badgeEl.style.display = 'inline-block';
  initRow.style.display = 'none';

  if (meta!.status === 'deprecated') {
    activeBox.style.display = 'none';
    deprecatedBox.style.display = 'block';
    const contract = document.getElementById('versionContract') as HTMLElement;
    contract.textContent =
      `status:     deprecated\n` +
      `replacedBy: ${meta!.replacedBy || '⚠ missing'}\n` +
      `removeBy:   ${meta!.removeBy || '⚠ missing'}`;
  } else {
    deprecatedBox.style.display = 'none';
    activeBox.style.display = 'block';
    (document.getElementById('versionSummary') as HTMLInputElement).value = '';
  }
}

function fireVersion(op: string, extra: Record<string, unknown> = {}) {
  if (!versionSetId) return;
  const summary = (document.getElementById('versionSummary') as HTMLInputElement)?.value ?? '';
  setVersionStatus('Applying…');
  postToPlugin('version:apply', { nodeId: versionSetId, op, summary, ...extra });
}

document.getElementById('versionInitBtn')?.addEventListener('click', () => fireVersion('init'));
document.getElementById('versionPatchBtn')?.addEventListener('click', () => fireVersion('patch'));
document.getElementById('versionMinorBtn')?.addEventListener('click', () => fireVersion('minor'));
document.getElementById('versionMajorBtn')?.addEventListener('click', () => fireVersion('major'));
document.getElementById('versionReactivateBtn')?.addEventListener('click', () => fireVersion('reactivate'));
document.getElementById('versionDeprecateBtn')?.addEventListener('click', () => {
  const replacedBy = (document.getElementById('versionReplacedBy') as HTMLInputElement).value.trim();
  const removeBy   = (document.getElementById('versionRemoveBy')   as HTMLInputElement).value.trim();
  if (!replacedBy || !removeBy) {
    setVersionStatus('Deprecating needs both a replacement and a remove-by date', 'err');
    return;
  }
  fireVersion('deprecate', { replacedBy, removeBy });
});

// ── Tools — Component docs ──────────────────────────────────────────────────────

function setDocsStatus(msg: string, type: '' | 'ok' | 'err' = '') {
  const el = document.getElementById('docsStatus') as HTMLElement;
  el.textContent = msg; el.className = 'status' + (type ? ' ' + type : '');
}

function updateDocsSelection(sel: { id: string; name: string; nodeType: string; variantCount?: number } | null) {
  const isValid = sel?.nodeType === 'COMPONENT_SET';
  docsSetId = isValid ? (sel?.id ?? null) : null;
  const emptyEl = document.getElementById('docsSelectionEmpty') as HTMLElement;
  const infoEl  = document.getElementById('docsSelectionInfo')  as HTMLElement;
  const nameEl  = document.getElementById('docsSetName')  as HTMLElement;
  const countEl = document.getElementById('docsSetCount') as HTMLElement;
  const genBtn  = document.getElementById('docsGenerateBtn') as HTMLButtonElement;
  if (isValid && sel) {
    emptyEl.style.display = 'none'; infoEl.style.display = 'flex';
    nameEl.textContent = sel.name;
    countEl.textContent = (sel.variantCount ?? 0) + ' variants';
    genBtn.disabled = false;
  } else {
    emptyEl.style.display = 'block'; infoEl.style.display = 'none';
    genBtn.disabled = true;
  }
}

document.getElementById('docsGenerateBtn')?.addEventListener('click', () => {
  if (!docsSetId) return;
  const btn = document.getElementById('docsGenerateBtn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Generating…';
  setDocsStatus('');
  postToPlugin('docs:generate', { nodeId: docsSetId });
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
    case 'figma-token-loaded': {
      figmaApiToken = (msg.token as string) || '';
      const el = document.getElementById('figmaApiToken') as HTMLInputElement;
      if (el) el.value = figmaApiToken;
      break;
    }
    case 'figma-token-saved': {
      if (msg.success) {
        figmaApiToken = ((document.getElementById('figmaApiToken') as HTMLInputElement)?.value || '').trim();
        setFigmaTokenStatus('Saved', 'ok');
      } else {
        setFigmaTokenStatus('Save failed: ' + (msg.error as string), 'err');
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
          variantCount: msg.variantCount as number | undefined,
        };
        updateAnnotateSelection(sel);
        updateSpecSelection(sel);
        updateVersionSelection(sel, msg.versionMeta as VersionMeta | null);
        updateDocsSelection(sel);
        updateCopyBtn(sel, msg.fileKey as string | null, msg.fileName as string | null, msg.allNodes as Array<{ id: string; name: string }> | undefined);
        updateSectionBar(
          !!(msg.isSection as boolean),
          (msg.sectionCount as number) ?? 0,
          (msg.sectionName as string)  ?? sel.name,
        );
      } else {
        updateAnnotateSelection(null);
        updateSpecSelection(null);
        updateVersionSelection(null, null);
        updateDocsSelection(null);
        updateCopyBtn(null, null);
        updateSectionBar(false, 0, '');
      }
      break;
    }
    case 'token-docs:result': {
      document.querySelectorAll<HTMLButtonElement>('.gen-btn').forEach(b => {
        b.disabled = false; b.textContent = '→';
      });
      if (msg.error) setVarStatus('❌ ' + (msg.error as string), 'err');
      else setVarStatus('✓ ' + (msg.count as number) + ' tokens documented', 'ok');
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
    case 'spec:result': {
      const btn = document.getElementById('specGenerateBtn') as HTMLButtonElement;
      btn.disabled = !specSetId; btn.textContent = 'Generate Spec';
      if (msg.error) setSpecStatus('❌ ' + (msg.error as string), 'err');
      else {
        const vars = msg.variantCount as number;
        setSpecStatus(`✓ Spec generated · ${vars} variant${vars !== 1 ? 's' : ''}`, 'ok');
      }
      break;
    }
    case 'docs:result': {
      const btn = document.getElementById('docsGenerateBtn') as HTMLButtonElement;
      btn.disabled = !docsSetId; btn.textContent = 'Generate Docs';
      if (msg.error) setDocsStatus('❌ ' + (msg.error as string), 'err');
      else {
        const t = msg.tiles as number;
        setDocsStatus(`✓ Docs generated · ${t} tile${t !== 1 ? 's' : ''}`, 'ok');
      }
      break;
    }
    case 'version:result': {
      if (msg.error) { setVersionStatus('❌ ' + (msg.error as string), 'err'); break; }
      const meta = msg.meta as VersionMeta;
      // Re-render the panel to the new state (keeps the selection id).
      updateVersionSelection({ id: msg.nodeId as string, name: (document.getElementById('versionSetName') as HTMLElement).textContent || '', nodeType: 'COMPONENT_SET' }, meta);
      const h = msg.hygiene as { pass: boolean; issues: string[] } | undefined;
      if (h && !h.pass) setVersionStatus('⚠ v' + meta.version + ' — ' + h.issues.join('; '), 'err');
      else setVersionStatus('✓ v' + meta.version + ' · ' + meta.status, 'ok');
      // After a major bump, surface the fork reminder (you do the clone).
      if (msg.forkReminder) {
        const note = document.getElementById('versionForkNote') as HTMLElement;
        const forkName = (msg.replacedByName as string) || 'a new — v' + meta.version.split('.')[0];
        note.innerHTML =
          `<strong>Major = breaking.</strong> Duplicate this set as ` +
          `“${forkName}”, then deprecate this one pointing at it. ` +
          `The version metadata is stamped; the fork is yours to make.`;
        note.style.display = 'block';
      }
      break;
    }
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────

postToPlugin('ui-ready');
postToPlugin('get-settings');
postToPlugin('get-figma-token');
postToPlugin('resize-for-view', { width: 320, height: 460 });

renderHomeView();

// Auto-connect on startup — don't require user to click Connect
bridgeConnect();

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
