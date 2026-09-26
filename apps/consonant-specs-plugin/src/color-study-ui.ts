// ── Color Study UI ────────────────────────────────────────────────────────
// Figma-right-rail style panel: Fill / Stroke / Effects of the selected layer,
// then "Selection colors" aggregated across everything inside the selection.
// Any swatch opens the S2A token picker (light + dark columns).
// Talks to the plugin side through the `post` callback from initColorStudyUi().

import type { ColorStudyResult, ColorStudyPaint, ColorStudyToken, ColorStudyTarget, ColorStudyEffect } from './color-study';

type Post = (type: string, payload?: Record<string, unknown>) => void;

let post: Post = () => {};
let lastResult: ColorStudyResult | null = null;
let selectionColorsOpen = false; // collapsed by default, like Figma
let showAllColors = false;
const expandedKeys = new Set<string>();
type PickerTab = 'surface' | 'content' | 'component' | 'overlay' | 'palette' | 'other';
let pickerTab: PickerTab = 'surface';
let pickerQuery = '';
let pickerCtx: { title: string; sub: string; paint: ColorStudyPaint; targets: ColorStudyTarget[] } | null = null;

const COLLAPSED_ROWS = 10;

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function swatch(hex: string, opacity = 1, extraClass = ''): string {
  const op = opacity < 1 ? `opacity:${opacity};` : '';
  return `<span class="cs-swatch ${extraClass}" style="--swatch:${esc(hex)};${op}"></span>`;
}

function hexLabel(hex: string, opacity: number): string {
  return opacity < 1 ? `${hex.toUpperCase()} · ${Math.round(opacity * 100)}%` : hex.toUpperCase();
}

/** Trim the s2a/color/ prefix so names read like Figma's right rail. */
function shortName(name: string): string {
  return name.replace(/^s2a\/color\//i, '');
}

function isPanelActive(): boolean {
  return !!document.querySelector('.tab-panel[data-panel="colorstudy"].active');
}

// ── Selection line ────────────────────────────────────────────────────────

// The plugin's global selection bar already names the selection, so this panel
// shows nothing of its own until there is a result.
export function updateColorStudySelection(_selection: { name?: string; type?: string } | null, count: number): void {
  // Follow the canvas selection while the panel is open.
  if (isPanelActive()) {
    if (count === 0) renderColorStudyResult(null);
    else post('color-study-scan');
  }
}

// ── Aggregation ───────────────────────────────────────────────────────────

interface ColorGroup { key: string; sample: ColorStudyPaint; uses: Array<{ nodeId: string; name: string; path: string; inInstance: boolean; paint: ColorStudyPaint }> }

function groupColors(result: ColorStudyResult): ColorGroup[] {
  const map = new Map<string, ColorGroup>();
  for (const l of result.layers) {
    for (const p of l.paints) {
      let g = map.get(p.key);
      if (!g) { g = { key: p.key, sample: p, uses: [] }; map.set(p.key, g); }
      g.uses.push({ nodeId: l.nodeId, name: l.name, path: l.path, inInstance: l.inInstance, paint: p });
    }
  }
  return [...map.values()].sort((a, b) => b.uses.length - a.uses.length);
}

function targetsOf(g: ColorGroup): ColorStudyTarget[] {
  return g.uses.map(u => ({ nodeId: u.nodeId, property: u.paint.property, paintIndex: u.paint.paintIndex }));
}

// ── Rendering ─────────────────────────────────────────────────────────────

/** Figma-style hover text: full token name, then hex · opacity (light / dark when bound). */
function paintTip(p: ColorStudyPaint): string {
  if (p.tokenName) {
    const modes = p.isS2A && p.lightHex && p.darkHex
      ? `\nLight ${hexLabel(p.lightHex, p.opacity)}\nDark ${hexLabel(p.darkHex, p.opacity)}`
      : `\n${hexLabel(p.hex, p.opacity)}`;
    return `${p.tokenName}${modes}`;
  }
  return `Not bound to a variable\n${hexLabel(p.hex, p.opacity)}`;
}

function tokenCell(p: ColorStudyPaint): string {
  if (p.tokenName) {
    const cls = p.isS2A ? 'cs-token' : 'cs-token cs-token-foreign';
    return `<span class="${cls}">${esc(shortName(p.tokenName))}</span>`;
  }
  return `<span class="cs-token cs-unbound">${esc(hexLabel(p.hex, p.opacity))}</span>`;
}

function modeCell(p: ColorStudyPaint): string {
  if (p.isS2A && p.lightHex && p.darkHex) {
    return `<span class="cs-modes">`
      + `<span title="Light ${esc(hexLabel(p.lightHex, p.opacity))}">${swatch(p.lightHex, p.opacity)}</span>`
      + `<span title="Dark ${esc(hexLabel(p.darkHex, p.opacity))}">${swatch(p.darkHex, p.opacity)}</span>`
      + `</span>`;
  }
  return `<span class="cs-modes cs-modes-empty" title="No light/dark values (not an S2A token)">—</span>`;
}

function paintRow(p: ColorStudyPaint, data: string, extra = ''): string {
  // Figma-style chip: swatch + name is one click target.
  return `<div class="cs-row" ${data}>
    <button class="cs-chip" data-pick title="${esc(paintTip(p))}\nClick to change">${swatch(p.hex, p.opacity, 'cs-swatch-lg')}${tokenCell(p)}</button>
    ${modeCell(p)}
    ${extra}
  </div>`;
}

function effectRow(e: ColorStudyEffect): string {
  const label = { DROP_SHADOW: 'Drop shadow', INNER_SHADOW: 'Inner shadow', LAYER_BLUR: 'Layer blur', BACKGROUND_BLUR: 'Background blur' }[e.type] ?? e.type;
  const radius = e.radiusTokenName ? `<span class="cs-token" title="${esc(e.radiusTokenName)}">${esc(e.radiusTokenName.split('/').slice(-2).join('/'))}</span>` : `<span class="cs-token cs-unbound">${e.radius}px</span>`;
  const color = e.hex ? swatch(e.hex, e.opacity ?? 1, 'cs-swatch-lg') : `<span class="cs-swatch cs-swatch-lg cs-swatch-none"></span>`;
  return `<div class="cs-row cs-row-static">
    <span class="cs-chip cs-chip-static">${color}<span class="cs-effect-label">${esc(label)}</span></span>
    ${radius}
  </div>`;
}

function section(title: string, body: string, count?: number): string {
  const c = count !== undefined ? `<span class="cs-section-count">${count}</span>` : '';
  return `<div class="cs-section"><div class="cs-section-head">${esc(title)}${c}</div>${body}</div>`;
}

/** Collapsible section: the whole head is the toggle; collapsed shows a swatch preview + "+N". */
function collapsibleSection(title: string, open: boolean, preview: string, body: string): string {
  return `<div class="cs-section">
    <button class="cs-section-head cs-section-toggle${open ? ' open' : ''}" id="csSelectionToggle" aria-expanded="${open}">
      <span>${esc(title)}</span>
      ${open ? '' : `<span class="cs-preview">${preview}</span>`}
      <span class="cs-chev">&#8250;</span>
    </button>
    ${open ? body : ''}
  </div>`;
}

function renderSelected(result: ColorStudyResult): string {
  const s = result.selected;
  if (!s) return '';
  const fills = s.fills.map(p => paintRow(p, `data-node="${esc(s.nodeId)}" data-prop="Fill" data-idx="${p.paintIndex}"`)).join('');
  const strokes = s.strokes.map(p => paintRow(p, `data-node="${esc(s.nodeId)}" data-prop="Stroke" data-idx="${p.paintIndex}"`)).join('');
  const effects = s.effects.map(effectRow).join('');
  return section('Fill', fills) + section('Stroke', strokes) + section('Effects', effects);
}

function renderSelectionColors(result: ColorStudyResult): string {
  const groups = groupColors(result);
  if (groups.length === 0) return section('Selection colors', `<div class="cs-empty">No solid colors inside the selection.</div>`);
  const previewSwatches = groups.slice(0, 3).map(g => `<span title="${esc(paintTip(g.sample))}">${swatch(g.sample.hex, g.sample.opacity)}</span>`).join('');
  const preview = previewSwatches + (groups.length > 3 ? `<span class="cs-preview-more">+${groups.length - 3}</span>` : '');
  const visible = showAllColors ? groups : groups.slice(0, COLLAPSED_ROWS);
  const rows = visible.map(g => {
    const open = expandedKeys.has(g.key);
    const uses = open ? `<div class="cs-uses">${g.uses.map(u =>
      `<div class="cs-use"><span class="cs-use-prop">${u.paint.property}</span><span class="cs-use-name" title="${esc(u.path ? u.path + ' › ' + u.name : u.name)}">${u.path ? `<span class="cs-layer-path">${esc(u.path)} ›</span>` : ''}${esc(u.name)}</span>${u.inInstance ? '<span class="cs-badge">override</span>' : ''}</div>`
    ).join('')}</div>` : '';
    const count = `<button class="cs-uses-toggle${open ? ' open' : ''}" data-toggle="${esc(g.key)}" title="${open ? 'Hide' : 'Show'} layers">${g.uses.length} <span class="cs-chev">&#8250;</span></button>`;
    return paintRow(g.sample, `data-group="${esc(g.key)}"`, count) + uses;
  }).join('');
  const more = groups.length > COLLAPSED_ROWS
    ? `<button class="cs-see-all" id="csSeeAll">${showAllColors ? 'Show fewer' : `See all ${groups.length} colors`}</button>`
    : '';
  return collapsibleSection('Selection colors', selectionColorsOpen, preview, rows + more);
}

export function renderColorStudyResult(result: ColorStudyResult | null, error?: string): void {
  const body = document.getElementById('colorStudyBody');
  if (!body) return;
  lastResult = result;
  if (error) { body.innerHTML = `<div class="cs-empty">${esc(error)}</div>`; return; }
  if (!result) { body.innerHTML = `<div class="cs-empty">Select a frame, group, or layer to study its colors.</div>`; return; }
  body.innerHTML = renderSelected(result) + renderSelectionColors(result);
  document.getElementById('csSeeAll')?.addEventListener('click', () => { showAllColors = !showAllColors; renderColorStudyResult(lastResult); });
  document.getElementById('csSelectionToggle')?.addEventListener('click', () => { selectionColorsOpen = !selectionColorsOpen; renderColorStudyResult(lastResult); });
}

export function renderColorStudyApplyResult(results: Array<{ nodeId: string; property: string; success: boolean; error?: string }>): void {
  const failed = results.filter(r => !r.success);
  const status = document.getElementById('colorStudyStatus');
  if (status) {
    status.textContent = failed.length === 0
      ? `Applied to ${results.length} color${results.length === 1 ? '' : 's'}.`
      : `${results.length - failed.length} applied, ${failed.length} failed: ${failed[0].error ?? 'unknown error'}`;
    status.style.display = '';
    window.setTimeout(() => { status.style.display = 'none'; }, 4000);
  }
}

// ── Token picker ──────────────────────────────────────────────────────────
// Same tab model as Align's colour popover (kept as a local copy so Align stays
// untouched), plus: surface/* under Surface, and an Other tab for non-s2a tokens.

const PICKER_TABS: Array<{ id: PickerTab; label: string }> = [
  { id: 'surface',   label: 'Surface' },
  { id: 'content',   label: 'Content' },
  { id: 'component', label: 'Component' },
  { id: 'overlay',   label: 'Overlay' },
  { id: 'palette',   label: 'Palette' },
  { id: 'other',     label: 'Other' },
];

function tabOf(name: string): PickerTab {
  const n = name.toLowerCase();
  if (!n.startsWith('s2a/color/')) return 'other';
  if (n.startsWith('s2a/color/background/') || n.startsWith('s2a/color/surface/') || n.startsWith('s2a/color/border/') || n.startsWith('s2a/color/focus-ring/')) return 'surface';
  if (n.startsWith('s2a/color/content/')) return 'content';
  if (n.startsWith('s2a/color/button/') || n.startsWith('s2a/color/iconbutton/')) return 'component';
  if (n.startsWith('s2a/color/transparent/')) return 'overlay';
  if (/^s2a\/color\/(blue|green|red|orange|yellow|gray|brand)\//.test(n)) return 'palette';
  return 'other';
}

function defaultTabFor(role: ColorStudyPaint['role']): PickerTab {
  return role === 'content' ? 'content' : 'surface';
}

function splitPath(name: string): { group: string; leaf: string } {
  const i = name.lastIndexOf('/');
  return i === -1 ? { group: '', leaf: name } : { group: name.slice(0, i), leaf: name.slice(i + 1) };
}

function pickerTokens(): ColorStudyToken[] {
  if (!lastResult || !pickerCtx) return [];
  const q = pickerQuery.trim().toLowerCase();
  return lastResult.tokens
    .filter(t => tabOf(t.name) === pickerTab)
    .filter(t => !q || t.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

function optionHtml(t: ColorStudyToken, currentId?: string): string {
  const { leaf } = splitPath(t.name);
  return `<button class="cs-option${t.variableId === currentId ? ' cs-option-current' : ''}" data-var="${esc(t.variableId)}" title="${esc(t.name)}">
    <span class="cs-option-name">${esc(leaf)}</span>
    <span class="cs-option-mode">${swatch(t.lightHex, t.opacity)}<span>${esc(hexLabel(t.lightHex, t.opacity))}</span></span>
    <span class="cs-option-mode">${swatch(t.darkHex, t.opacity)}<span>${esc(hexLabel(t.darkHex, t.opacity))}</span></span>
  </button>`;
}

function renderPickerList(host: HTMLElement): void {
  const listEl = host.querySelector<HTMLElement>('.cs-picker-list');
  if (!listEl || !pickerCtx) return;
  const tokens = pickerTokens();
  if (tokens.length === 0) { listEl.innerHTML = `<div class="cs-empty">No tokens match.</div>`; return; }
  // Group by path prefix, headers like Align's ("S2A/COLOR/BACKGROUND").
  const groups = new Map<string, ColorStudyToken[]>();
  for (const t of tokens) { const { group } = splitPath(t.name); if (!groups.has(group)) groups.set(group, []); groups.get(group)!.push(t); }
  const currentId = pickerCtx.paint.variableId;
  listEl.innerHTML = [...groups.keys()].sort((a, b) => a.localeCompare(b)).map(g =>
    `<div class="cs-group-head">${esc((g || '(uncategorised)').toUpperCase())}</div>` + groups.get(g)!.map(t => optionHtml(t, currentId)).join('')
  ).join('');
  listEl.querySelectorAll<HTMLButtonElement>('.cs-option').forEach(b => b.addEventListener('click', () => {
    if (!pickerCtx) return;
    post('color-study-apply', { targets: pickerCtx.targets, variableId: b.dataset.var ?? '' });
    closePicker();
  }));
}

function renderPicker(): void {
  const host = document.getElementById('colorStudyPicker');
  if (!host || !pickerCtx) return;
  const { title, sub, paint } = pickerCtx;
  host.innerHTML = `
    <div class="cs-picker-head">
      <div class="cs-picker-title">
        ${swatch(paint.hex, paint.opacity, 'cs-swatch-lg')}
        <span class="cs-picker-layer" title="${esc(title)}">${esc(title)}</span>
        <span class="cs-picker-sub">${esc(sub)}</span>
      </div>
      <button class="cs-picker-close" id="csPickerClose" aria-label="Close">&times;</button>
    </div>
    <div class="cs-picker-tabs">${PICKER_TABS.map(t => `<button class="cs-picker-tab${pickerTab === t.id ? ' active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('')}</div>
    <input class="cs-picker-search" id="csPickerSearch" type="search" placeholder="Search tokens" value="${esc(pickerQuery)}">
    <div class="cs-picker-modes"><span class="cs-picker-modes-name">Name</span><span>Light</span><span>Dark</span></div>
    <div class="cs-picker-list"></div>
  `;
  host.style.display = 'flex';
  document.getElementById('csPickerClose')?.addEventListener('click', closePicker);
  host.querySelectorAll<HTMLButtonElement>('.cs-picker-tab').forEach(b => b.addEventListener('click', () => { pickerTab = b.dataset.tab as PickerTab; renderPicker(); }));
  const search = document.getElementById('csPickerSearch') as HTMLInputElement | null;
  if (search) {
    search.addEventListener('input', () => { pickerQuery = search.value; renderPickerList(host); });
    search.focus();
  }
  renderPickerList(host);
}

function openPicker(ctx: NonNullable<typeof pickerCtx>): void {
  pickerCtx = ctx;
  // Open on the tab holding the current token if bound to S2A, else the role's tab.
  pickerTab = ctx.paint.isS2A && ctx.paint.tokenName ? tabOf(ctx.paint.tokenName) : defaultTabFor(ctx.paint.role);
  pickerQuery = '';
  post('color-study-window', { wide: true });
  renderPicker();
}

function closePicker(): void {
  if (!pickerCtx) return;
  pickerCtx = null;
  const host = document.getElementById('colorStudyPicker');
  if (host) { host.style.display = 'none'; host.innerHTML = ''; }
  post('color-study-window', { wide: false });
}

// ── Init ──────────────────────────────────────────────────────────────────

export function initColorStudyUi(postFn: Post): void {
  post = postFn;

  // Entering the tool from the menu or hamburger triggers a scan of whatever is selected.
  document.querySelectorAll<HTMLElement>('.menu-item[data-tool="colorstudy"], .hamburger-item[data-tool="colorstudy"]')
    .forEach(b => b.addEventListener('click', () => post('color-study-scan')));

  document.getElementById('colorStudyBody')?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!lastResult) return;

    const toggle = target.closest<HTMLElement>('[data-toggle]');
    if (toggle) {
      const key = toggle.dataset.toggle ?? '';
      if (expandedKeys.has(key)) expandedKeys.delete(key); else expandedKeys.add(key);
      renderColorStudyResult(lastResult);
      return;
    }

    const pick = target.closest<HTMLElement>('[data-pick]');
    if (!pick) return;
    const row = pick.closest<HTMLElement>('.cs-row');
    if (!row) return;

    if (row.dataset.group) {
      const g = groupColors(lastResult).find(x => x.key === row.dataset.group);
      if (!g) return;
      openPicker({ title: g.sample.tokenName ? shortName(g.sample.tokenName) : hexLabel(g.sample.hex, g.sample.opacity), sub: `${g.uses.length} layer${g.uses.length === 1 ? '' : 's'}`, paint: g.sample, targets: targetsOf(g) });
      return;
    }

    const s = lastResult.selected;
    if (!s || row.dataset.node !== s.nodeId) return;
    const prop = (row.dataset.prop as 'Fill' | 'Stroke') ?? 'Fill';
    const idx = Number(row.dataset.idx ?? 0);
    const paint = (prop === 'Fill' ? s.fills : s.strokes).find(p => p.paintIndex === idx);
    if (!paint) return;
    openPicker({ title: s.name, sub: prop, paint, targets: [{ nodeId: s.nodeId, property: prop, paintIndex: idx }] });
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pickerCtx) closePicker(); });
}
