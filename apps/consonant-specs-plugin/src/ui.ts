import { renderAlignV2ScanResult, renderAlignV2ApplyResult, setV2ActiveTab, collectV2ApplySelections } from './align-v2-ui';

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function copyToClipboard(text: string): Promise<boolean> {
  // navigator.clipboard is unavailable in Figma plugin iframes — use textarea fallback
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

interface PropertyEntry {
  name: string;
  value: string;
  token: string | null;
  colorSwatch?: string;
}

declare const FEATURE_A11Y: boolean;
declare const FEATURE_LEGACY_ALIGN: boolean;
declare const __PLUGIN_VERSION__: string;
declare const __PLUGIN_BUILD_SHA__: string;
declare const __PLUGIN_BUILD_TIME__: string;

// Feature flag: remove A11y if disabled
const a11yPanel = document.querySelector<HTMLElement>('.tab-panel[data-panel="a11y"]');
if (!FEATURE_A11Y) {
  document.getElementById('menuA11yItem')?.remove();
  document.getElementById('hamburgerA11yItem')?.remove();
  a11yPanel?.remove();
}

// Feature flag: remove legacy Align + Match (the V1 token-alignment tool and the closest-match tool)
// when the new "Align to S2A" (data-tool="alignv2") replaces them.
if (!FEATURE_LEGACY_ALIGN) {
  document.getElementById('menuAlignItem')?.remove();
  document.getElementById('hamburgerAlignItem')?.remove();
  document.getElementById('menuMatchItem')?.remove();
  document.getElementById('hamburgerMatchItem')?.remove();
  document.querySelector<HTMLElement>('.tab-panel[data-panel="align"]')?.remove();
  document.querySelector<HTMLElement>('.tab-panel[data-panel="match"]')?.remove();
}

const panels = document.querySelectorAll<HTMLElement>('.tab-panel');

function navigateTo(toolId: string, toolName: string) {
  panels.forEach(p => p.classList.remove('active'));
  const panel = document.querySelector(`[data-panel="${toolId}"]`);
  if (panel) panel.classList.add('active');

  const menuView = document.getElementById('menuView');
  const tabContent = document.getElementById('tabContent');
  const headerMenu = document.getElementById('headerMenu');
  const headerDetail = document.getElementById('headerDetail');
  const backLabel = document.getElementById('backLabel');
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const hamburgerBtn = document.getElementById('hamburgerBtn');

  if (menuView) menuView.style.display = 'none';
  if (tabContent) tabContent.style.display = '';
  if (headerMenu) headerMenu.style.display = 'none';
  if (headerDetail) headerDetail.style.display = 'flex';
  if (backLabel) backLabel.textContent = toolName;
  if (hamburgerMenu) hamburgerMenu.classList.remove('open');
  if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');

  document.querySelectorAll<HTMLElement>('.hamburger-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === toolId);
  });
}

function navigateBack() {
  const menuView = document.getElementById('menuView');
  const tabContent = document.getElementById('tabContent');
  const headerMenu = document.getElementById('headerMenu');
  const headerDetail = document.getElementById('headerDetail');
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const hamburgerBtn = document.getElementById('hamburgerBtn');

  if (menuView) menuView.style.display = '';
  if (tabContent) tabContent.style.display = 'none';
  if (headerMenu) headerMenu.style.display = '';
  if (headerDetail) headerDetail.style.display = 'none';
  if (hamburgerMenu) hamburgerMenu.classList.remove('open');
  if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
}

// Menu items
document.querySelectorAll<HTMLButtonElement>('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    const tool = item.dataset.tool ?? '';
    const name = item.querySelector('.menu-item-name')?.textContent ?? tool;
    navigateTo(tool, name);
  });
});

// Hamburger items
document.querySelectorAll<HTMLButtonElement>('.hamburger-item').forEach(item => {
  item.addEventListener('click', () => {
    const tool = item.dataset.tool ?? '';
    const menuItem = document.querySelector<HTMLElement>(`.menu-item[data-tool="${tool}"]`);
    const name = menuItem?.querySelector('.menu-item-name')?.textContent ?? tool;
    navigateTo(tool, name);
  });
});

// Bridge status pills — click to connect/disconnect (one on menu, one on tool header)
document.querySelectorAll<HTMLButtonElement>('.bridge-status-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    if (bridgeConnected) {
      bridgeDisconnect();
    } else {
      bridgeConnect();
    }
  });
});

// Back button
document.getElementById('backBtn')?.addEventListener('click', navigateBack);

// Hamburger toggle
document.getElementById('hamburgerBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const menu = document.getElementById('hamburgerMenu');
  const btn = document.getElementById('hamburgerBtn');
  const isOpen = menu?.classList.toggle('open');
  btn?.setAttribute('aria-expanded', String(!!isOpen));
});

document.addEventListener('click', () => {
  document.getElementById('hamburgerMenu')?.classList.remove('open');
  document.getElementById('hamburgerBtn')?.setAttribute('aria-expanded', 'false');
});

document.getElementById('s2aBannerDismiss')?.addEventListener('click', () => {
  const banner = document.getElementById('s2aBanner');
  if (banner) banner.style.display = 'none';
});


let currentSelection: { count: number; hasAutoLayout: boolean } = { count: 0, hasAutoLayout: false };

function updateTabControls(prefix: string) {
  const placeholder = document.getElementById(`${prefix}Placeholder`) as HTMLElement;
  const controls = document.getElementById(`${prefix}Controls`) as HTMLElement;
  const empty = currentSelection.count === 0;
  placeholder.style.display = empty ? 'block' : 'none';
  controls.style.display = empty ? 'none' : 'block';
}

function updateSelectionInfo(data: { name: string; type: string; width: number; height: number } | null) {
  const el = document.getElementById('selectionInfo');
  if (!el) return;
  if (!data) {
    el.innerHTML = '<span class="selection-label">No selection</span>';
    return;
  }
  el.innerHTML = `<span class="selection-label"><strong>${esc(data.name)}</strong> (${esc(data.type)}) &mdash; ${Math.round(data.width)} &times; ${Math.round(data.height)}</span>`;
}

function updateTokenStatus(count: number, version: string) {
  const el = document.getElementById('footer');
  if (!el) return;
  const buildMarker = `v${__PLUGIN_VERSION__} (${__PLUGIN_BUILD_SHA__} · ${__PLUGIN_BUILD_TIME__})`;
  el.innerHTML = `<span class="token-status">Tokens: ${esc(version)} &mdash; ${count} tokens loaded</span> <span class="build-marker" style="opacity:0.55;font-size:10px;">${esc(buildMarker)}</span>`;
}

function postToPlugin(type: string, payload?: Record<string, unknown>) {
  parent.postMessage({ pluginMessage: { type, ...payload } }, 'https://www.figma.com');
}

// On plugin load, append the build marker to the footer even before tokens load,
// so the user can verify which bundle is running at a glance.
(function injectBuildMarker(): void {
  const el = document.getElementById('footer');
  if (!el) return;
  const marker = `v${__PLUGIN_VERSION__} (${__PLUGIN_BUILD_SHA__} · ${__PLUGIN_BUILD_TIME__})`;
  if (!el.querySelector('.build-marker')) {
    const span = document.createElement('span');
    span.className = 'build-marker';
    span.style.cssText = 'opacity:0.55;font-size:10px;margin-left:8px;';
    span.textContent = marker;
    el.appendChild(span);
  }
})();

window.addEventListener('message', (event) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;

  switch (msg.type) {
    case 'selection-changed':
      updateSelectionInfo(msg.selection);
      currentSelection = { count: msg.count, hasAutoLayout: msg.hasAutoLayout };
      updateTabControls('align');
      updateTabControls('match');
      updateTabControls('design');
      updateTabControls('specs');
      updateTabControls('localize');
      updateA11yControls();
      break;
    case 'api-key-state':
      updateApiKeyUi(msg.hasKey as boolean, msg.masked as string | undefined);
      break;
    case 'localize-status':
      updateLocalizeStatus(msg.message as string);
      break;
    case 'localize-bridge-prompt':
      showLocalizeBridgePrompt(msg as any);
      break;
    case 'token-status': {
      updateTokenStatus(msg.count as number, msg.version as string);
      const banner = document.getElementById('s2aBanner');
      if (banner) banner.style.display = msg.hasS2ALibrary === false ? 'flex' : 'none';
      break;
    }
    case 'node-properties':
      renderPropertyList(msg.properties as PropertyEntry[]);
      break;
    case 'spec-it-status':
      updateSpecStatus(msg.message as string);
      break;
    case 's2a-audit-result':
      renderAuditResult(msg as any);
      break;
    case 's2a-align-result':
      renderAlignResult(msg as any);
      break;
    case 'align-v2-scan-result':
      if ((msg as any).error) {
        const sel = document.getElementById('alignV2Selection');
        if (sel) sel.textContent = String((msg as any).error);
      } else {
        renderAlignV2ScanResult((msg as any).result, (msg as any).selectionName, (msg as any).selectionType);
      }
      break;
    case 'align-v2-apply-result':
      renderAlignV2ApplyResult((msg as any).results);
      break;
    case 'match-result':
      updateMatchStatus(msg.message as string);
      break;
    case 'grid-result':
      updateGridStatus(msg.message);
      break;
    case 'a11y-status':
      updateA11yStatus(msg.message as string);
      break;
    case 'a11y-annotate-status':
      updateA11yStatus(msg.message as string);
      break;
    case 'a11y-fill-request':
      showAiFillInstruction(msg.mode as string, msg.sections as string[], msg.frameName as string, msg.frameId as string | undefined);
      break;
    case 'a11y-panels-fill-request':
      showPanelsFillInstruction(msg.sections as string[], msg.frameName as string, msg.sectionIds as string[], msg.frameId as string | undefined);
      break;
    // Unified bridge command result from code.ts
    case 'bridge:command-result': {
      const pending = bridgePendingRequests.get(msg.requestId as string);
      if (pending) {
        clearTimeout(pending.timeoutId);
        bridgePendingRequests.delete(msg.requestId as string);
        if (msg.success) {
          const result: Record<string, unknown> = { ...msg };
          delete result.type;
          delete result.requestId;
          pending.resolve(result);
        } else {
          pending.reject(new Error(msg.error || 'Unknown error'));
        }
      }
      break;
    }
    // Variables data from code.ts (auto-sync)
    case 'bridge:variables-data': {
      if (bridgeWs && bridgeWs.readyState === 1) {
        try { bridgeWs.send(JSON.stringify({ type: 'VARIABLES_DATA', data: msg.data })); } catch {}
      }
      break;
    }
    // Event forwarding to WebSocket
    case 'bridge:selection-changed': {
      if (bridgeWs && bridgeWs.readyState === 1) {
        try { bridgeWs.send(JSON.stringify({ type: 'SELECTION_CHANGE', data: { selection: msg.selection } })); } catch {}
      }
      break;
    }
    case 'bridge:page-changed': {
      if (bridgeWs && bridgeWs.readyState === 1) {
        try { bridgeWs.send(JSON.stringify({ type: 'PAGE_CHANGE', data: msg.page })); } catch {}
      }
      break;
    }
  }
});

function navigateToNode(nodeId: string) {
  postToPlugin('navigate-to-node', { nodeId });
}

function renderAuditResult(result: { matched: number; total: number; issues: Array<{ nodeId: string; nodeName: string; property: string; value: string }> }) {
  const list = document.getElementById('propertyList');
  if (!list) return;

  const pct = result.total > 0 ? Math.round((result.matched / result.total) * 100) : 0;
  const color = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : '#e34850';

  const annotateBtn = result.issues.length > 0
    ? `<button id="annotateAuditBtn" style="background:none;border:1px solid var(--border,#e5e5e5);border-radius:4px;color:var(--text-secondary);font-size:10px;cursor:pointer;padding:2px 8px;">Annotate</button>`
    : '';

  let html = `<div style="padding:8px 0;margin-bottom:8px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <strong style="font-size:13px;color:${color}">${pct}% S2A compliant</strong>
      <span style="color:var(--text-secondary);font-size:10px;display:block">${result.matched}/${result.total} properties matched — ${result.issues.length} issues</span>
    </div>
    ${annotateBtn}
  </div>`;

  if (result.issues.length > 0) {
    html += '<div class="section-title" style="margin-top:8px">Issues (click to navigate)</div>';
    html += result.issues.map(issue =>
      `<div class="property-row" data-node-id="${esc(issue.nodeId)}" style="cursor:pointer">
        <span class="property-name">${esc(issue.nodeName)}</span>
        <span class="property-value">${esc(issue.property)}: ${esc(issue.value)}</span>
        <span class="token-badge token-badge-miss">No token</span>
      </div>`
    ).join('');
  }

  list.innerHTML = html;

  list.querySelectorAll('.property-row[data-node-id]').forEach((row) => {
    row.addEventListener('click', () => {
      const nodeId = (row as HTMLElement).dataset.nodeId;
      if (nodeId) navigateToNode(nodeId);
    });
  });

  document.getElementById('annotateAuditBtn')?.addEventListener('click', () => {
    postToPlugin('annotate-audit-issues', { issues: result.issues });
  });
}

function renderAlignResult(result: { aligned: number; scanned: number; mode: string; unmatched: Array<{ nodeId: string; nodeName: string; property: string; value: string }> }) {
  const list = document.getElementById('propertyList');
  if (!list) return;

  let html = `<div style="padding:8px 0;margin-bottom:8px;border-bottom:1px solid var(--border)">
    <strong style="font-size:13px;color:var(--success)">${result.aligned} bound to S2A</strong>
    <span style="color:var(--text-secondary);font-size:10px;display:block">${result.scanned} nodes scanned — mode: ${esc(result.mode)}</span>
  </div>`;

  if (result.unmatched.length > 0) {
    html += '<div class="section-title" style="margin-top:8px">Not Found in S2A (click to navigate)</div>';
    html += result.unmatched.map(item =>
      `<div class="property-row" data-node-id="${esc(item.nodeId)}" style="cursor:pointer">
        <span class="property-name">${esc(item.nodeName)}</span>
        <span class="property-value">${esc(item.property)}: ${esc(item.value)}</span>
        <span class="token-badge token-badge-miss">No match</span>
      </div>`
    ).join('');
  } else {
    html += '<div style="padding:12px 0;color:var(--success);text-align:center">All properties matched S2A tokens</div>';
  }

  list.innerHTML = html;

  list.querySelectorAll('.property-row[data-node-id]').forEach((row) => {
    row.addEventListener('click', () => {
      const nodeId = (row as HTMLElement).dataset.nodeId;
      if (nodeId) navigateToNode(nodeId);
    });
  });
}

// Align tab — property inspection
function renderPropertyList(properties: PropertyEntry[]) {
  const list = document.getElementById('propertyList');
  if (!list || properties.length === 0) return;

  list.innerHTML = properties.map((prop) => {
    const safeColor = prop.colorSwatch && CSS.supports('color', prop.colorSwatch) ? prop.colorSwatch : '';
    const swatch = safeColor
      ? `<span class="color-swatch" style="background:${safeColor}"></span>`
      : '';
    const badge = prop.token
      ? `<span class="token-badge token-badge-match">${esc(prop.token)}</span>`
      : `<span class="token-badge token-badge-miss">No token</span>`;
    const copyValue = prop.token ? `var(${prop.token})` : prop.value;

    return `<div class="property-row" data-copy="${esc(copyValue)}" title="Click to copy">
      <span class="property-name">${esc(prop.name)}</span>
      <span class="property-value">${swatch}${esc(prop.value)}</span>
      ${badge}
    </div>`;
  }).join('');

  list.querySelectorAll('.property-row').forEach((row) => {
    row.addEventListener('click', () => {
      const value = (row as HTMLElement).dataset.copy || '';
      copyToClipboard(value);
    });
  });
}

// Align tab — action buttons
document.getElementById('s2aAuditBtn')?.addEventListener('click', () => postToPlugin('s2a-audit'));
document.getElementById('fullAlignBtn')?.addEventListener('click', () => postToPlugin('full-align-s2a'));
document.getElementById('textColorsAlignBtn')?.addEventListener('click', () => postToPlugin('text-colors-align'));

// Design tab
document.getElementById('gridBtn')?.addEventListener('click', () => {
  postToPlugin('apply-grid');
  updateGridStatus('Applying grid...');
});

document.getElementById('gridXlBtn')?.addEventListener('click', () => {
  postToPlugin('apply-grid-xl');
  updateGridStatus('Applying XL grid...');
});

document.getElementById('clearGridBtn')?.addEventListener('click', () => {
  postToPlugin('clear-grids');
  updateGridStatus('Clearing grids...');
});

function updateGridStatus(message: string) {
  const el = document.getElementById('gridStatus');
  if (el) el.innerHTML = `<span style="color:var(--text-secondary)">${esc(message)}</span>`;
}

// Match tab — Check All / Uncheck All
document.getElementById('matchCheckAll')?.addEventListener('click', () => {
  const ids = ['matchTypography', 'matchFillColors', 'matchStrokeColors', 'matchBorderRadius', 'matchBorderWidth', 'matchSpacing', 'matchOpacity', 'matchDropShadow', 'matchBlur'];
  const boxes = ids.map(id => document.getElementById(id) as HTMLInputElement).filter(Boolean);
  const allChecked = boxes.every(cb => cb.checked);
  boxes.forEach(cb => { cb.checked = !allChecked; });
  const btn = document.getElementById('matchCheckAll');
  if (btn) btn.textContent = allChecked ? 'Check All' : 'Uncheck All';
});

document.getElementById('matchBtn')?.addEventListener('click', () => {
  const categories: string[] = [];
  if ((document.getElementById('matchTypography') as HTMLInputElement).checked) categories.push('typography');
  if ((document.getElementById('matchFillColors') as HTMLInputElement).checked) categories.push('fillColors');
  if ((document.getElementById('matchStrokeColors') as HTMLInputElement).checked) categories.push('strokeColors');
  if ((document.getElementById('matchBorderRadius') as HTMLInputElement).checked) categories.push('borderRadius');
  if ((document.getElementById('matchBorderWidth') as HTMLInputElement).checked) categories.push('borderWidth');
  if ((document.getElementById('matchSpacing') as HTMLInputElement).checked) categories.push('spacing');
  if ((document.getElementById('matchOpacity') as HTMLInputElement).checked) categories.push('opacity');
  if ((document.getElementById('matchDropShadow') as HTMLInputElement).checked) categories.push('dropShadow');
  if ((document.getElementById('matchBlur') as HTMLInputElement).checked) categories.push('blur');

  if (categories.length === 0) return;
  postToPlugin('force-match', { categories });
  updateMatchStatus('Matching...');
});

function updateMatchStatus(message: string) {
  const el = document.getElementById('matchStatus');
  if (!el) return;
  el.innerHTML = `<span style="color:var(--text-secondary)">${esc(message)}</span>`;
}

// Specs tab
document.getElementById('fullSpecsBtn')?.addEventListener('click', () => {
  postToPlugin('spec-it', { sections: ['anatomy', 'layout', 'typography', 'components'] });
  updateSpecStatus('Generating full specs...');
});

document.getElementById('specItBtn')?.addEventListener('click', () => {
  const sections: string[] = [];
  if ((document.getElementById('specAnatomy') as HTMLInputElement)?.checked) sections.push('anatomy');
  if ((document.getElementById('specCardGaps') as HTMLInputElement)?.checked) sections.push('cardGaps');
  if ((document.getElementById('specSpacingGeneral') as HTMLInputElement)?.checked) sections.push('spacingGeneral');
  if ((document.getElementById('specSpacing') as HTMLInputElement)?.checked) sections.push('spacing');
  if ((document.getElementById('specColors') as HTMLInputElement)?.checked) sections.push('colors');
  if ((document.getElementById('specTextProps') as HTMLInputElement)?.checked) sections.push('textProperties');
  if (sections.length === 0) {
    updateSpecStatus('Select at least one section.');
    return;
  }
  postToPlugin('spec-it', { sections });
  updateSpecStatus('Generating spec...');
});

function updateSpecStatus(message: string) {
  const el = document.getElementById('specStatus');
  if (el) el.innerHTML = `<span style="color:var(--text-secondary)">${esc(message)}</span>`;
}

// Localize tab
const KEYED_PROVIDERS = new Set(['deepl', 'google', 'azure']);

const providerSelect = document.getElementById('providerSelect') as HTMLSelectElement | null;
const apiKeySection = document.getElementById('apiKeySection') as HTMLElement | null;

function syncKeySection() {
  const provider = providerSelect?.value || 'mymemory';
  if (apiKeySection) apiKeySection.style.display = KEYED_PROVIDERS.has(provider) ? 'block' : 'none';
  postToPlugin('get-api-key', { provider });
}

providerSelect?.addEventListener('change', syncKeySection);
syncKeySection();

document.getElementById('locCheckAll')?.addEventListener('click', () => {
  const ids = ['locDe', 'locZh', 'locTh', 'locAr'];
  const boxes = ids.map(id => document.getElementById(id) as HTMLInputElement).filter(Boolean);
  const allChecked = boxes.every(b => b.checked);
  boxes.forEach(b => { b.checked = !allChecked; });
  // Auto-check RTL when Arabic is checked
  const locRtlEl = document.getElementById('locRtl') as HTMLInputElement | null;
  if (locRtlEl && !allChecked) locRtlEl.checked = true;
});

const locAr = document.getElementById('locAr') as HTMLInputElement | null;
const locRtl = document.getElementById('locRtl') as HTMLInputElement | null;
locAr?.addEventListener('change', () => {
  if (locAr.checked && locRtl && !locRtl.checked) locRtl.checked = true;
});

document.getElementById('localizeBtn')?.addEventListener('click', () => {
  const languages: string[] = [];
  if ((document.getElementById('locDe') as HTMLInputElement).checked) languages.push('de');
  if ((document.getElementById('locZh') as HTMLInputElement).checked) languages.push('zh');
  if ((document.getElementById('locTh') as HTMLInputElement).checked) languages.push('th');
  if ((document.getElementById('locAr') as HTMLInputElement).checked) languages.push('ar');
  if (languages.length === 0) {
    updateLocalizeStatus('Select at least one language.');
    return;
  }
  const provider = providerSelect?.value || 'mymemory';
  const applyRtl = (document.getElementById('locRtl') as HTMLInputElement).checked;
  postToPlugin('localize', { languages, applyRtl, provider });
  updateLocalizeStatus('Localizing — this may take a moment...');
});

document.getElementById('saveKeyBtn')?.addEventListener('click', () => {
  const input = document.getElementById('apiKeyInput') as HTMLInputElement;
  const key = input.value.trim();
  if (!key) return;
  const provider = providerSelect?.value || '';
  postToPlugin('save-api-key', { key, provider });
  input.value = '';
});

document.getElementById('clearKeyBtn')?.addEventListener('click', () => {
  const provider = providerSelect?.value || '';
  postToPlugin('clear-api-key', { provider });
});

function updateLocalizeStatus(message: string) {
  const el = document.getElementById('localizeStatus');
  if (el) el.innerHTML = `<span style="color:var(--text-secondary)">${esc(message)}</span>`;
}

const LANG_NAMES: Record<string, string> = { de: 'German', zh: 'Chinese', th: 'Thai', ar: 'Arabic' };

function showLocalizeBridgePrompt(data: { frameName: string; frameId: string; languages: string[]; applyRtl: boolean; sourceTexts: { nodeId: string; text: string }[] }) {
  const langList = data.languages.map(l => LANG_NAMES[l] || l).join(', ');
  const cmd = `Translate the frame "${data.frameName}" (${data.frameId}) into ${langList}. ${data.sourceTexts.length} text strings to translate.${data.applyRtl ? ' Apply RTL layout for Arabic.' : ''}\n\nUse figma_execute to: 1) get text nodes from the frame, 2) clone the frame with a [${data.languages.join('/')}] prefix, 3) load fonts, 4) apply translations to the cloned text nodes.`;
  const el = document.getElementById('localizeStatus');
  if (el) {
    el.innerHTML = `
      <div style="padding:10px;background:var(--bg-secondary,#f5f5f5);border-radius:6px;border-left:3px solid var(--accent,#1473E6);">
        <div style="font-weight:600;font-size:11px;color:var(--accent,#1473E6);margin-bottom:4px;">Ready for translation &#x2714;</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">Paste this in Claude Code to translate via bridge:</div>
        <code id="localizeCmdText" style="display:block;background:var(--bg,#fff);padding:6px 8px;border-radius:4px;font-size:10px;border:1px solid var(--border,#e5e5e5);line-height:1.4;">${esc(cmd)}</code>
        <button class="btn btn-secondary" id="copyLocalizeCmd" style="margin-top:6px;padding:4px 8px;font-size:10px;width:100%;">Copy</button>
        <div style="font-size:10px;color:var(--text-tertiary,#999);margin-top:6px;">Requires Bridge connected + Claude Code open in this project</div>
      </div>`;
    document.getElementById('copyLocalizeCmd')?.addEventListener('click', async () => {
      await copyToClipboard(cmd);
      const btn = document.getElementById('copyLocalizeCmd');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
    });
  }
}

function updateApiKeyUi(hasKey: boolean, masked?: string) {
  const status = document.getElementById('apiKeyStatus') as HTMLElement;
  if (status) status.textContent = hasKey ? `Saved: ${masked || '••••'}` : 'No key saved.';
}

// A11y tab — controls visibility
function updateA11yControls() {
  const placeholder = document.getElementById('a11yPlaceholder') as HTMLElement;
  const controls = document.getElementById('a11yControls') as HTMLElement;
  if (currentSelection.count === 0) {
    placeholder.style.display = 'block';
    controls.style.display = 'none';
    return;
  }
  placeholder.style.display = 'none';
  controls.style.display = 'block';
}

function updateA11yBridgeState() {
  const badge = document.getElementById('a11yBridgeBadge') as HTMLElement;
  const items = document.querySelectorAll('.a11y-item');
  const checkboxes = document.querySelectorAll('.a11y-item input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
  const genBtn = document.getElementById('a11yStartBtn') as HTMLButtonElement;
  // Generate buttons are always enabled (plugin-generated doesn't need bridge)
  if (genBtn) genBtn.disabled = false;
  if (bridgeConnected) {
    if (badge) { badge.textContent = '\u2713 bridge connected'; badge.classList.add('connected'); }
    items.forEach(el => el.classList.add('enabled'));
    checkboxes.forEach(cb => cb.disabled = false);
    const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
    if (!anyChecked) {
      const defaults = ['a11yFocusIndicators', 'a11yFocusOrder', 'a11yColorContrast', 'a11yNamesAlt'];
      defaults.forEach(id => {
        const cb = document.getElementById(id) as HTMLInputElement;
        if (cb) cb.checked = true;
      });
    }
  } else {
    if (badge) { badge.textContent = 'connect bridge'; badge.classList.remove('connected'); }
    items.forEach(el => el.classList.remove('enabled'));
    checkboxes.forEach(cb => { cb.disabled = true; cb.checked = false; });
  }
}

function updateA11yStatus(message: string) {
  const el = document.getElementById('a11yStatus');
  if (el) el.innerHTML = `<span style="color:var(--text-secondary)">${esc(message)}</span>`;
}

function showAiFillInstruction(mode?: string, sections?: string[], frameName?: string, frameId?: string) {
  const categoryList = sections && sections.length > 0 ? sections.join(', ') : 'all categories';
  const frame = frameName ? `"${frameName}"` : 'the selected frame';
  const frameIdArg = frameId ? ` with frameId: "${frameId}"` : '';
  const bridgeNote = bridgeConnected ? '' : '\n\n⚠ Bridge offline — paste this in Claude Code manually.';

  let cmd: string;
  if (mode === 'sections') {
    cmd = `Fill the blueline cards for the frame "${frameName ?? 'selected'}" (ID: ${frameId ?? 'unknown'}). Call figma_get_blueline_data${frameIdArg} first — it returns structural data and orchestration instructions scoped to this frame. Then call figma_get_knowledge for each agent group to fetch expert knowledge. Dispatch parallel agents, then call figma_render_blueline with all card JSON.`;
  } else {
    cmd = `Start an A11y review conversation for the frame ${frame}.

Categories to review: ${categoryList}

Step 1 — Ground yourself:
Call figma_get_blueline_data${frameIdArg}. It returns the structural scan (a hidden text node named .structural-scan), a screenshot, and per-agent orchestration instructions — all scoped to this frame. Read the structural scan carefully. Do not infer elements that are not present in it.

Step 2 — Ask questions first (REQUIRED before any rendering):
Before calling figma_render_blueline, ask the designer 1–3 clarifying questions about things you genuinely need to know to be accurate — e.g. intended interaction pattern, whether a visual-only element is intentional, context of use. If you have no real questions, say so briefly and proceed.
Wait for the designer's answers before continuing.

Step 3 — Analyze:
For each selected category, call figma_get_knowledge for its agent group. Use the structural scan + screenshot + designer answers to assess each category.
Before filling a category, check whether the structural scan contains elements that match it:
- "autoRotation" (Carousel) → skip if no carousel/slider elements in scan
- "forms" → skip if no input/select/textarea elements in scan
- "reducedMotion"/"media"/"reflow" → skip if no animation or media elements in scan
If a category has no matching elements, skip it and note: "Skipped [category] — no matching elements found."

Step 4 — Render:
Call figma_render_blueline with the cards object. For confident items: write the issue or passing note, WCAG criterion, and a plain-language suggestion in desc. For uncertain items: pass an empty string for desc and put the open question in notes (e.g. "notes": "Need to know: is this button keyboard-only or also touch?").

Step 5 — Send summary to plugin:
After figma_render_blueline completes, call bridge_send_a11y_result with:
{
  "frameName": "${frameName ?? 'the selected frame'}",
  "issues": [{ "category": "...", "description": "..." }],
  "needs_input": [{ "category": "...", "question": "..." }],
  "suggestions": [{ "category": "...", "description": "..." }]
}
This updates the plugin panel so the designer can see results without hunting the Figma canvas.${bridgeNote}`;
  }

  lastA11yCmd = cmd;

  const el = document.getElementById('a11yStatus');
  if (el) {
    el.innerHTML = `
      <div style="padding:10px;background:var(--bg-secondary,#f5f5f5);border-radius:6px;border-left:3px solid var(--accent,#1473E6);">
        <div style="font-weight:600;font-size:11px;color:var(--accent,#1473E6);margin-bottom:4px;">Cards created &#x2714; — waiting for Claude</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">Paste this in Claude Code to start the review:</div>
        <code id="fillCmdText" style="display:block;background:var(--bg,#fff);padding:6px 8px;border-radius:4px;font-size:10px;border:1px solid var(--border,#e5e5e5);line-height:1.4;white-space:pre-wrap;">${esc(cmd)}</code>
        <button class="btn btn-secondary" id="copyFillCmd" style="margin-top:6px;padding:4px 8px;font-size:10px;width:100%;">Copy</button>
        <div style="font-size:10px;color:var(--text-tertiary,#999);margin-top:6px;">Results will appear here when Claude finishes.</div>
      </div>`;
    document.getElementById('copyFillCmd')?.addEventListener('click', async () => {
      await copyToClipboard(cmd);
      const btn = document.getElementById('copyFillCmd');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
    });
  }
}

interface A11yResultItem { category: string; description: string; }
interface A11yNeedsInputItem { category: string; question: string; }
interface A11yResultPayload {
  frameName: string;
  issues: A11yResultItem[];
  needs_input: A11yNeedsInputItem[];
  suggestions: A11yResultItem[];
}

function renderA11yResults(data: A11yResultPayload) {
  const el = document.getElementById('a11yStatus');
  if (!el) return;

  function section(title: string, cls: string, items: Array<{ label: string; text: string }>, itemCls: string) {
    if (items.length === 0) return '';
    const rows = items.map(i =>
      `<div class="a11y-result-item ${itemCls}"><strong>${esc(i.label)}</strong> — ${esc(i.text)}</div>`
    ).join('');
    return `<div class="a11y-results-section">
      <div class="a11y-results-section-title ${cls}">${title} (${items.length})</div>
      ${rows}
    </div>`;
  }

  const issueItems = (Array.isArray(data.issues) ? data.issues : []).map(i => ({ label: i?.category ?? '', text: i?.description ?? '' }));
  const needsItems = (Array.isArray(data.needs_input) ? data.needs_input : []).map(i => ({ label: i?.category ?? '', text: i?.question ?? '' }));
  const suggItems  = (Array.isArray(data.suggestions) ? data.suggestions : []).map(i => ({ label: i?.category ?? '', text: i?.description ?? '' }));

  const empty = issueItems.length === 0 && needsItems.length === 0 && suggItems.length === 0;

  el.innerHTML = `
    <div style="padding:10px;background:var(--bg-secondary,#f5f5f5);border-radius:6px;border-left:3px solid var(--accent,#1473E6);">
      <div style="font-weight:600;font-size:11px;color:var(--accent,#1473E6);margin-bottom:8px;">Review complete — ${esc(data.frameName ?? '')}</div>
      <div class="a11y-results">
        ${empty
          ? '<div class="a11y-results-empty">No issues or suggestions returned.</div>'
          : section('Issues', 'issues', issueItems, 'issue') +
            section('Needs your input', 'needs-input', needsItems, 'needs') +
            section('Suggestions', 'suggestions', suggItems, 'suggestion')
        }
      </div>
      <button class="btn btn-secondary" id="a11yContinueBtn" style="margin-top:8px;font-size:10px;width:100%;">Continue in Claude Code</button>
    </div>`;

  const continueBtn = document.getElementById('a11yContinueBtn') as HTMLButtonElement | null;
  if (continueBtn) {
    if (!lastA11yCmd) {
      continueBtn.disabled = true;
      continueBtn.title = 'Re-generate the blueline cards to restore this prompt.';
    }
    continueBtn.addEventListener('click', async () => {
      if (!lastA11yCmd) return;
      await copyToClipboard(lastA11yCmd);
      continueBtn.textContent = 'Copied — paste in Claude Code';
      setTimeout(() => { continueBtn.textContent = 'Continue in Claude Code'; }, 2000);
    });
  }
}

function showPanelsFillInstruction(sections: string[], frameName: string, sectionIds: string[], frameId?: string) {
  const sectionList = sections.join(', ');
  const frameIdArg = frameId ? ` with frameId: "${frameId}"` : '';
  const cmd = `Fill the blueline panels for the frame "${frameName}"${frameId ? ` (ID: ${frameId})` : ''}. Categories: ${sectionList}.\n\nCall figma_get_blueline_data${frameIdArg} first — it returns structural data (including nodeIds for all elements) and orchestration instructions scoped to this frame. Then call figma_get_knowledge for each agent group to fetch expert knowledge.\n\nDispatch parallel agents. IMPORTANT: Each agent must return items with these additional fields:\n- nodeId (string|null): the node ID from the structural scan that this item refers to. Null if no element match.\n- annotationType ("element"|"region"|"none"): "element" for specific UI elements (buttons, links, inputs), "region" for area-level concepts (landmarks, sections), "none" for abstract/page-level items.\n\nThen call figma_render_blueline with mode: "panels" and all item JSON. The panels have already been scaffolded with cloned designs — the render call will place native Figma annotations on the clones.`;
  const el = document.getElementById('a11yStatus');
  if (el) {
    el.innerHTML = `
      <div style="padding:10px;background:var(--bg-secondary,#f5f5f5);border-radius:6px;border-left:3px solid var(--accent,#1473E6);">
        <div style="font-weight:600;font-size:11px;color:var(--accent,#1473E6);margin-bottom:4px;">Panels scaffolded &#x2714;</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">To fill annotations, paste this in your current Claude session:</div>
        <code id="panelsFillCmdText" style="display:block;background:var(--bg,#fff);padding:6px 8px;border-radius:4px;font-size:10px;border:1px solid var(--border,#e5e5e5);line-height:1.4;white-space:pre-wrap;">${esc(cmd)}</code>
        <button class="btn btn-secondary" id="copyPanelsFillCmd" style="margin-top:6px;padding:4px 8px;font-size:10px;width:100%;">Copy</button>
        <div style="font-size:10px;color:var(--text-tertiary,#999);margin-top:6px;">Paste into your current Claude Code session (Bridge must be connected)</div>
      </div>`;
    document.getElementById('copyPanelsFillCmd')?.addEventListener('click', async () => {
      await copyToClipboard(cmd);
      const btn = document.getElementById('copyPanelsFillCmd');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
    });
  }
}

// Check All / Uncheck All — AI-assisted section
document.getElementById('a11yCheckAllAi')?.addEventListener('click', () => {
  if (!bridgeConnected) return;
  const aiIds = ['a11yFocusIndicators', 'a11yFocusOrder', 'a11yHeadings', 'a11yLandmarksNav', 'a11yNamesAlt', 'a11yColorContrast', 'a11yAriaKeyboard', 'a11yTargetSize', 'a11yPageSetup'];
  const boxes = aiIds.map(id => document.getElementById(id) as HTMLInputElement).filter(Boolean);
  const allChecked = boxes.every(cb => cb.checked);
  boxes.forEach(cb => { cb.checked = !allChecked; });
  const btn = document.getElementById('a11yCheckAllAi');
  if (btn) btn.textContent = allChecked ? 'Check All' : 'Uncheck All';
});

document.getElementById('a11yShowMore')?.addEventListener('click', () => {
  const section = document.getElementById('a11yConditionalSection');
  const btn = document.getElementById('a11yShowMore') as HTMLButtonElement;
  if (!section || !btn) return;
  const isHidden = section.style.display === 'none';
  section.style.display = isHidden ? '' : 'none';
  btn.textContent = isHidden ? '▾ Hide extra categories' : '▸ Show more categories';
  btn.setAttribute('aria-expanded', String(isHidden));
});

// Check All / Uncheck All — Accessibility Notes section
document.getElementById('a11yCheckAllNotes')?.addEventListener('click', () => {
  if (!bridgeConnected) return;
  const noteIds = ['a11yForms', 'a11yCarousel', 'a11yDom', 'a11yMotionMedia', 'a11yScreenReader', 'a11yReactNative', 'a11yTvNote', 'a11yGeneralNote'];
  const boxes = noteIds.map(id => document.getElementById(id) as HTMLInputElement).filter(Boolean);
  const allChecked = boxes.every(cb => cb.checked);
  boxes.forEach(cb => { cb.checked = !allChecked; });
  const btn = document.getElementById('a11yCheckAllNotes');
  if (btn) btn.textContent = allChecked ? 'Check All' : 'Uncheck All';
});

const A11Y_LABELS: Record<string, string> = {
  a11yFocusIndicators: 'Focus Indicators',
  a11yFocusOrder: 'Focus Order',
  a11yHeadings: 'Heading Hierarchy',
  a11yLandmarksNav: 'Landmarks & Navigation',
  a11yNamesAlt: 'Names & Alt-Text',
  a11yColorContrast: 'Color Contrast',
  a11yAriaKeyboard: 'ARIA & Keyboard',
  a11yTargetSize: 'Target Size',
  a11yPageSetup: 'Page Setup',
  a11yForms: 'Forms',
  a11yCarousel: 'Carousel',
  a11yDom: 'DOM Strategy',
  a11yMotionMedia: 'Motion & Media',
  a11yScreenReader: 'Screen Reader Notes',
  a11yReactNative: 'React Native',
  a11yTvNote: 'TV Note',
  a11yGeneralNote: 'General Note',
};

function getCheckedA11yCheckboxIds(): string[] {
  return Object.keys(A11Y_LABELS).filter(
    id => (document.getElementById(id) as HTMLInputElement)?.checked
  );
}

function showConfirmPanel(checkedIds: string[]) {
  const categoryView = document.getElementById('a11yCategoryView');
  const statusEl = document.getElementById('a11yStatus');
  if (!statusEl) return;
  if (categoryView) categoryView.style.display = 'none';
  const labels = checkedIds.map(id => A11Y_LABELS[id] || id).join(', ');
  const frameLabel = 'the selected frame';
  statusEl.innerHTML = `
    <div class="a11y-confirm-panel">
      <h4>Create ${checkedIds.length} annotation card${checkedIds.length === 1 ? '' : 's'} for ${esc(frameLabel)}</h4>
      <div class="a11y-confirm-categories">${esc(labels)}</div>
      <div class="a11y-confirm-note">Claude will ask you questions before filling any cards. Empty cards are normal — they mean Claude needs more information from you.</div>
      <div class="a11y-confirm-actions">
        <button class="btn btn-secondary" id="a11yConfirmBack">Back</button>
        <button class="btn" id="a11yConfirmGo">Confirm &amp; Create Cards</button>
      </div>
    </div>`;
  document.getElementById('a11yConfirmBack')?.addEventListener('click', () => {
    statusEl.innerHTML = '';
    if (categoryView) categoryView.style.display = 'block';
  });
  document.getElementById('a11yConfirmGo')?.addEventListener('click', () => {
    statusEl.innerHTML = '';
    if (categoryView) categoryView.style.display = 'block';
    postToPlugin('generate-blueline', { categories: getCheckedA11yCategories() });
  });
}

// Collect checked a11y categories
function getCheckedA11yCategories(): string[] {
  const categories: string[] = [];
  // Core
  if ((document.getElementById('a11yFocusIndicators') as HTMLInputElement)?.checked) categories.push('focusIndicators');
  if ((document.getElementById('a11yFocusOrder') as HTMLInputElement)?.checked) categories.push('focusOrder');
  if ((document.getElementById('a11yHeadings') as HTMLInputElement)?.checked) categories.push('headings');
  if ((document.getElementById('a11yLandmarksNav') as HTMLInputElement)?.checked) {
    categories.push('landmarks', 'skipNav', 'consistentNav');
  }
  if ((document.getElementById('a11yNamesAlt') as HTMLInputElement)?.checked) {
    categories.push('names', 'altText');
  }
  if ((document.getElementById('a11yColorContrast') as HTMLInputElement)?.checked) categories.push('colorContrast');
  if ((document.getElementById('a11yAriaKeyboard') as HTMLInputElement)?.checked) {
    categories.push('aria', 'keyboard');
  }
  if ((document.getElementById('a11yTargetSize') as HTMLInputElement)?.checked) categories.push('targetSize');
  if ((document.getElementById('a11yPageSetup') as HTMLInputElement)?.checked) {
    categories.push('pageTitle', 'language');
  }
  // Conditional
  if ((document.getElementById('a11yForms') as HTMLInputElement)?.checked) categories.push('forms');
  if ((document.getElementById('a11yCarousel') as HTMLInputElement)?.checked) categories.push('autoRotation');
  if ((document.getElementById('a11yDom') as HTMLInputElement)?.checked) categories.push('dom');
  if ((document.getElementById('a11yMotionMedia') as HTMLInputElement)?.checked) {
    categories.push('reducedMotion', 'media', 'reflow');
  }
  if ((document.getElementById('a11yScreenReader') as HTMLInputElement)?.checked) {
    categories.push('voiceover', 'talkback', 'narrator');
  }
  if ((document.getElementById('a11yReactNative') as HTMLInputElement)?.checked) categories.push('reactNative');
  if ((document.getElementById('a11yTvNote') as HTMLInputElement)?.checked) categories.push('tvNote');
  if ((document.getElementById('a11yGeneralNote') as HTMLInputElement)?.checked) categories.push('generalNote');
  return categories;
}

document.getElementById('a11yStartBtn')?.addEventListener('click', () => {
  const checkedIds = getCheckedA11yCheckboxIds();
  if (checkedIds.length === 0) {
    updateA11yStatus('Select at least one category.');
    return;
  }
  showConfirmPanel(checkedIds);
});

function triggerBluelinePanels() {
  const categories = getCheckedA11yCategories();
  if (categories.length === 0) {
    updateA11yStatus('Select at least one option.');
    return;
  }
  if (!bridgeConnected) { updateA11yStatus('Connect Bridge for AI-assisted categories.'); return; }
  postToPlugin('generate-blueline-panels', { categories });
}

document.getElementById('generateBluelinePanelsBtn')?.addEventListener('click', () => triggerBluelinePanels());


let lastA11yCmd = '';

// ── Annotation mode ──────────────────────────────────────────────────────────
let annotationMode = false;

document.getElementById('a11yAnnotateToggle')?.addEventListener('click', () => {
  annotationMode = !annotationMode;
  const btn = document.getElementById('a11yAnnotateToggle') as HTMLButtonElement;
  if (btn) {
    btn.textContent = annotationMode ? 'Turn off annotation' : 'Turn on annotation';
    btn.classList.toggle('active', annotationMode);
  }
  if (annotationMode) {
    updateA11yStatus('Annotation mode on — select one category.');
  } else {
    // Uncheck all to reset single-select state
    const allBoxes = document.querySelectorAll('.a11y-item input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    allBoxes.forEach(cb => { cb.checked = false; });
    postToPlugin('a11y-annotate-cleanup', {});
    updateA11yStatus('Annotation mode off.');
  }
});

// Single-select enforcement and annotation dispatch in annotation mode
// Listener on the parent view so it covers both #a11yItemList and #a11yConditionalList
document.getElementById('a11yCategoryView')?.addEventListener('change', (e) => {
  if (!annotationMode) return;
  const target = e.target as HTMLInputElement;
  if (target.type !== 'checkbox' || !target.checked || !target.closest('.a11y-item')) return;

  // Enforce single-select: uncheck all other a11y checkboxes
  const allBoxes = document.querySelectorAll('.a11y-item input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
  allBoxes.forEach(cb => { if (cb !== target) cb.checked = false; });

  // Dispatch annotation request to plugin
  const categoryId = target.id;
  const categoryLabel = A11Y_LABELS[categoryId] || categoryId;
  postToPlugin('a11y-annotate-category', { categoryId, categoryLabel });
  updateA11yStatus(`Annotating ${categoryLabel}…`);
});

// Bridge tab — WebSocket connection to figma-console MCP
let bridgeConnected = false;
let bridgeWs: WebSocket | null = null;
let bridgeWsPort: number | null = null;
let bridgeKeepaliveTimer: ReturnType<typeof setInterval> | null = null;
let bridgeReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let bridgeReconnectAttempts = 0;
let bridgeUserDisconnected = false; // true when user clicks Disconnect

// Session nonce for EXECUTE_CODE — generated per WS connection.
// Any WS message invoking EXECUTE_CODE must carry a matching `sessionNonce` field.
// This is a defence-in-depth measure: it prevents any local process other than the
// MCP server (which receives the nonce via the HELLO handshake) from running
// arbitrary code in the Figma sandbox.
// NOTE: This plugin must remain INTERNAL — the eval() path should never be exposed
// in a publicly distributed plugin.
//
// bridgeSessionNonce is null until FILE_INFO is sent to the server. During this
// window EXECUTE_CODE is allowed without nonce validation — the server can't
// echo a nonce it hasn't received yet. Once FILE_INFO is sent the nonce is
// enforced for all subsequent requests.
let bridgeSessionNonce: string | null = null;
let bridgeNonceSent = false;
function generateNonce(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}
const BRIDGE_MAX_RECONNECT = 20;
const BRIDGE_RECONNECT_BASE_MS = 2000;

// Pending request infrastructure for code.ts round-trips
const bridgePendingRequests = new Map<string, { resolve: (v: any) => void; reject: (e: Error) => void; timeoutId: ReturnType<typeof setTimeout> }>();
let bridgeRequestCounter = 0;

function sendBridgeCommand(method: string, params: Record<string, unknown>, timeoutMs = 15000): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestId = method.toLowerCase() + '_' + (++bridgeRequestCounter) + '_' + Date.now();
    const timeoutId = setTimeout(() => {
      if (bridgePendingRequests.has(requestId)) {
        bridgePendingRequests.delete(requestId);
        reject(new Error(method + ' timed out after ' + timeoutMs + 'ms'));
      }
    }, timeoutMs);
    bridgePendingRequests.set(requestId, { resolve, reject, timeoutId });
    postToPlugin('bridge:command', { requestId, method, params });
  });
}

// SET_IMAGE_FILL needs special handling: decode base64 in browser context (atob available here)
function handleSetImageFill(params: any): Promise<any> {
  const binaryStr = atob(params.imageData);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  return sendBridgeCommand('SET_IMAGE_FILL', {
    nodeIds: Array.isArray(params.nodeIds) ? params.nodeIds : (params.nodeId ? [params.nodeId] : []),
    imageBytes: Array.from(bytes),
    scaleMode: params.scaleMode || 'FILL',
  }, 60000);
}

// Generic method forwarder — most methods just pass through to code.ts
// Only special cases get custom timeouts or param transformations
const BRIDGE_METHOD_TIMEOUTS: Record<string, number> = {
  'EXECUTE_CODE': 7000,
  'CAPTURE_SCREENSHOT': 30000,
  'GET_LOCAL_COMPONENTS': 300000,
  'REFRESH_VARIABLES': 300000,
  'GET_VARIABLES_DATA': 300000,
  'LINT_DESIGN': 120000,
  'AUDIT_COMPONENT_ACCESSIBILITY': 120000,
  'SET_IMAGE_FILL': 60000,
  'INSTANTIATE_COMPONENT': 30000,
};

function bridgeHandleMethod(method: string, params: any): Promise<any> {
  // Special case: SET_IMAGE_FILL needs base64 decode in browser
  if (method === 'SET_IMAGE_FILL') return handleSetImageFill(params);
  // Special case: EXECUTE_CODE timeout based on params
  if (method === 'EXECUTE_CODE') {
    const timeout = (params.timeout || 5000) + 2000;
    return sendBridgeCommand(method, params, timeout);
  }
  const timeout = BRIDGE_METHOD_TIMEOUTS[method] || 15000;
  return sendBridgeCommand(method, params, timeout);
}

function updateBridgeUi() {
  const disconnected = document.getElementById('bridgeDisconnected') as HTMLElement;
  const connected = document.getElementById('bridgeConnected') as HTMLElement;
  if (bridgeConnected) {
    disconnected.style.display = 'none';
    connected.style.display = 'block';
  } else {
    disconnected.style.display = 'block';
    connected.style.display = 'none';
  }
  document.querySelectorAll<HTMLButtonElement>('.bridge-status-pill').forEach(pill => {
    pill.disabled = false;
    pill.classList.toggle('connected', bridgeConnected);
  });
  updateA11yBridgeState();
}

function appendBridgeLog(message: string) {
  const log = document.getElementById('bridgeLog');
  if (!log) return;
  const line = document.createElement('div');
  line.textContent = `\u2713 ${message}`;
  log.appendChild(line);
  // Keep log from growing unbounded
  while (log.children.length > 80) log.removeChild(log.firstChild!);
  log.scrollTop = log.scrollHeight;
}

function bridgeStartKeepalive() {
  bridgeStopKeepalive();
  bridgeKeepaliveTimer = setInterval(() => {
    if (bridgeWs && bridgeWs.readyState === 1) {
      try { bridgeWs.send(JSON.stringify({ type: 'PING' })); } catch {}
    }
  }, 15000);
}

function bridgeStopKeepalive() {
  if (bridgeKeepaliveTimer) { clearInterval(bridgeKeepaliveTimer); bridgeKeepaliveTimer = null; }
}

function bridgeConnect() {
  bridgeUserDisconnected = false;
  if (bridgeReconnectTimer) { clearTimeout(bridgeReconnectTimer); bridgeReconnectTimer = null; }

  document.querySelectorAll<HTMLButtonElement>('.bridge-status-pill').forEach(pill => {
    pill.disabled = true;
  });

  const btn = document.getElementById('bridgeConnectBtn') as HTMLButtonElement;
  if (btn) { btn.textContent = 'Connecting...'; btn.disabled = true; }

  const WS_PORTS = [9220, 9221, 9222];
  let found = false;
  let pending = WS_PORTS.length;

  WS_PORTS.forEach((port) => {
    if (found) return;
    try {
      const testWs = new WebSocket('ws://localhost:' + port);
      const timeout = setTimeout(() => { if (testWs.readyState !== 1) testWs.close(); }, 3000);

      testWs.onopen = () => {
        clearTimeout(timeout);
        if (found) { testWs.close(); return; }
        found = true;
        bridgeWs = testWs;
        bridgeWsPort = port;
        bridgeConnected = true;
        bridgeReconnectAttempts = 0;
        updateBridgeUi();
        appendBridgeLog('WebSocket connected (port ' + port + ')');
        attachBridgeWsHandlers(testWs, port);
        initBridgeConnection(testWs);
        bridgeStartKeepalive();
      };

      testWs.onerror = () => {
        clearTimeout(timeout);
        // Don't decrement here — onclose always fires after onerror,
        // so we count completions in onclose only to avoid double-decrement.
      };

      testWs.onclose = () => {
        clearTimeout(timeout);
        if (!found) {
          pending--;
          if (pending <= 0) bridgeConnectFailed();
        }
      };
    } catch {
      pending--;
      if (pending <= 0 && !found) bridgeConnectFailed();
    }
  });
}

function bridgeConnectFailed() {
  const btn = document.getElementById('bridgeConnectBtn') as HTMLButtonElement;
  if (btn) { btn.textContent = 'Connect'; btn.disabled = false; }
  const info = document.querySelector('#bridgeDisconnected p:last-child') as HTMLElement;
  if (info) {
    info.textContent = 'No figma-console MCP server found — start Claude Code first';
    info.style.color = '#e34850';
  }
}

function bridgeScheduleReconnect(port: number) {
  if (bridgeUserDisconnected) return;
  if (bridgeReconnectAttempts >= BRIDGE_MAX_RECONNECT) {
    appendBridgeLog('Max reconnect attempts reached');
    return;
  }
  bridgeReconnectAttempts++;
  const delay = Math.min(BRIDGE_RECONNECT_BASE_MS * Math.pow(1.5, bridgeReconnectAttempts - 1), 30000);
  appendBridgeLog('Reconnecting in ' + Math.round(delay / 1000) + 's (attempt ' + bridgeReconnectAttempts + ')...');

  bridgeReconnectTimer = setTimeout(() => {
    if (bridgeUserDisconnected) return;
    // Try the last known port first, then fall back to full scan
    if (port) {
      bridgeReconnectToPort(port);
    } else {
      bridgeConnect();
    }
  }, delay);
}

function bridgeReconnectToPort(port: number) {
  try {
    const testWs = new WebSocket('ws://localhost:' + port);
    const timeout = setTimeout(() => { if (testWs.readyState !== 1) testWs.close(); }, 3000);

    testWs.onopen = () => {
      clearTimeout(timeout);
      bridgeWs = testWs;
      bridgeWsPort = port;
      bridgeConnected = true;
      bridgeReconnectAttempts = 0;
      updateBridgeUi();
      appendBridgeLog('Reconnected (port ' + port + ')');
      attachBridgeWsHandlers(testWs, port);
      initBridgeConnection(testWs);
      bridgeStartKeepalive();
    };

    testWs.onerror = () => {
      clearTimeout(timeout);
    };

    testWs.onclose = () => {
      clearTimeout(timeout);
      // Port-specific reconnect failed, try full scan
      if (!bridgeConnected && !bridgeUserDisconnected) {
        bridgeConnect();
      }
    };
  } catch {
    if (!bridgeUserDisconnected) bridgeConnect();
  }
}

function initBridgeConnection(ws: WebSocket) {
  // Generate a new session nonce for this connection. The nonce is NOT enforced
  // until FILE_INFO has been sent to the server (bridgeNonceSent flag).
  const nonce = generateNonce();
  bridgeSessionNonce = null; // clear until FILE_INFO is sent
  bridgeNonceSent = false;

  // Send FILE_INFO to the server after GET_FILE_INFO from code.ts
  // fileKey is REQUIRED by the server — without it, the client stays "pending" and gets dropped after 30s
  sendBridgeCommand('GET_FILE_INFO', {}).then((result) => {
    if (ws.readyState !== 1 || !result) return;
    const info = result.fileInfo || result;
    // Fallback if fileKey is still null
    if (!info.fileKey) {
      info.fileKey = 'local-' + Date.now();
    }
    info.pluginVersion = '1.0.0';
    info.sessionNonce = nonce; // MCP server must echo this in EXECUTE_CODE params
    ws.send(JSON.stringify({ type: 'FILE_INFO', data: info }));
    // Now activate nonce enforcement — the server has the nonce
    bridgeSessionNonce = nonce;
    bridgeNonceSent = true;
    appendBridgeLog('File info sent: ' + (info.fileName || 'unknown') + ' (key: ' + (info.fileKey || '?') + ')');
  }).catch(() => {});

  // Auto-sync variables on connection
  sendBridgeCommand('REFRESH_VARIABLES', {}, 30000).then((result) => {
    if (ws.readyState !== 1 || !result) return;
    ws.send(JSON.stringify({ type: 'VARIABLES_DATA', data: result.data }));
    appendBridgeLog('Variables synced: ' + ((result.data?.variables?.length) || 0) + ' vars');
  }).catch(() => {});
}

function attachBridgeWsHandlers(ws: WebSocket, port: number) {
  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);

      // Handle server identity
      if (message.type === 'SERVER_HELLO' && message.data) {
        appendBridgeLog('Server v' + (message.data.serverVersion || '?') + ' on port ' + port);
        return;
      }

      // Handle A11y results loop-back from bridge_send_a11y_result MCP tool
      if (message.type === 'A11Y_RESULT' && message.data && typeof message.data === 'object') {
        const d = message.data as Record<string, unknown>;
        const safe: A11yResultPayload = {
          frameName: typeof d.frameName === 'string' ? d.frameName : '',
          issues: Array.isArray(d.issues) ? d.issues : [],
          needs_input: Array.isArray(d.needs_input) ? d.needs_input : [],
          suggestions: Array.isArray(d.suggestions) ? d.suggestions : [],
        };
        renderA11yResults(safe);
        return;
      }

      // Ignore pong or other non-command messages
      if (!message.id || !message.method) return;

      // Gate EXECUTE_CODE behind the session nonce. Any process can connect to the
      // localhost WS port, but only the MCP server (which received the nonce via FILE_INFO)
      // can supply the correct value.
      // Before FILE_INFO is sent (bridgeNonceSent === false), we allow commands through
      // because the server can't echo a nonce it hasn't received yet.
      if (message.method === 'EXECUTE_CODE' && bridgeNonceSent) {
        if (!bridgeSessionNonce || (message.params || {}).sessionNonce !== bridgeSessionNonce) {
          if (ws.readyState === 1) {
            ws.send(JSON.stringify({ id: message.id, error: 'Unauthorized: missing or invalid sessionNonce' }));
          }
          appendBridgeLog('\u26a0 EXECUTE_CODE rejected — invalid nonce');
          return;
        }
      }

      appendBridgeLog('\u2190 ' + message.method);

      Promise.resolve(bridgeHandleMethod(message.method, message.params || {}))
        .then((result) => {
          if (ws.readyState === 1) {
            ws.send(JSON.stringify({ id: message.id, result }));
            appendBridgeLog('\u2192 ' + message.method + ' OK');
          }
        })
        .catch((err) => {
          if (ws.readyState === 1) {
            ws.send(JSON.stringify({ id: message.id, error: err.message || String(err) }));
            appendBridgeLog('\u2192 ' + message.method + ' ERR: ' + err.message);
          }
        });
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = (event) => {
    bridgeStopKeepalive();
    bridgeWs = null;
    bridgeSessionNonce = null; // invalidate nonce so it can't be reused after disconnect
    bridgeNonceSent = false;
    bridgeConnected = false;

    // Drain pending bridge promises so callers aren't stuck forever
    for (const [id, pending] of bridgePendingRequests) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error('Bridge disconnected'));
    }
    bridgePendingRequests.clear();

    // Stop auto-fill timer if running
    updateBridgeUi();

    const wasReplaced = event.code === 1000 && (
      event.reason === 'Replaced by new connection' ||
      event.reason === 'Replaced by same file reconnection'
    );

    if (wasReplaced) {
      appendBridgeLog('Replaced by newer connection — stopping');
      return;
    }

    appendBridgeLog('Disconnected (code ' + event.code + ')');

    if (!bridgeUserDisconnected) {
      bridgeScheduleReconnect(port);
    }
  };

  ws.onerror = () => {
    // onclose fires after onerror
  };
}

function bridgeDisconnect() {
  bridgeUserDisconnected = true;
  bridgeStopKeepalive();
  if (bridgeReconnectTimer) { clearTimeout(bridgeReconnectTimer); bridgeReconnectTimer = null; }
  if (bridgeWs) {
    try { bridgeWs.close(); } catch {}
    bridgeWs = null;
    bridgeWsPort = null;
  }
  bridgeConnected = false;
  bridgeReconnectAttempts = 0;
  updateBridgeUi();
  const btn = document.getElementById('bridgeConnectBtn') as HTMLButtonElement;
  if (btn) { btn.textContent = 'Connect'; btn.disabled = false; }
  const info = document.querySelector('#bridgeDisconnected p:last-child') as HTMLElement;
  if (info) { info.textContent = 'Connection persists across all tabs'; info.style.color = ''; }
}

document.getElementById('bridgeConnectBtn')?.addEventListener('click', () => bridgeConnect());
document.getElementById('bridgeDisconnectBtn')?.addEventListener('click', () => bridgeDisconnect());

// ── Align to S2A: resize iframe to give the table more room ───────────────
// We rely on the existing navigateTo flow to swap menu → tab-content; only the
// window resize and scan-button enable are alignv2-specific.
function enterAlignV2Mode(): void {
  document.body.classList.add('alignv2-active');
  parent.postMessage({ pluginMessage: { type: 'align-v2-window-resize', wide: true } }, '*');
  const scan = document.getElementById('alignV2ScanBtn') as HTMLButtonElement | null;
  if (scan) scan.disabled = false;
}

function exitAlignV2Mode(): void {
  if (!document.body.classList.contains('alignv2-active')) return;
  document.body.classList.remove('alignv2-active');
  parent.postMessage({ pluginMessage: { type: 'align-v2-window-resize', wide: false } }, '*');
}

document.querySelectorAll<HTMLElement>('.menu-item[data-tool="alignv2"], .hamburger-item[data-tool="alignv2"]').forEach(btn => {
  btn.addEventListener('click', () => enterAlignV2Mode());
});

document.querySelectorAll<HTMLElement>('.menu-item:not([data-tool="alignv2"]), .hamburger-item:not([data-tool="alignv2"])').forEach(btn => {
  btn.addEventListener('click', () => exitAlignV2Mode());
});
document.getElementById('backBtn')?.addEventListener('click', () => exitAlignV2Mode());

// ── Align V2 buttons ──────────────────────────────────────────────────────
document.getElementById('alignV2ScanBtn')?.addEventListener('click', () => {
  parent.postMessage({ pluginMessage: { type: 'align-v2-scan' } }, '*');
});

document.querySelectorAll<HTMLButtonElement>('.alignv2-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.v2tab as 'colors' | 'dimensions' | 'typography';
    if (tab) setV2ActiveTab(tab);
  });
});

document.getElementById('alignV2ApplyBtn')?.addEventListener('click', () => {
  const selections = collectV2ApplySelections();
  if (selections.length === 0) return;
  parent.postMessage({ pluginMessage: { type: 'align-v2-apply', selections } }, '*');
});

postToPlugin('ui-ready');
