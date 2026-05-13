// apps/consonant-specs-plugin/src/align-v2-ui.ts

interface V2Issue {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  property: string;
  currentValue: string;
  source: 'hardcoded' | 'wrong-library';
  currentBindingName?: string;
  suggestion: {
    tokenName: string;
    variableId?: string;
    textStyleId?: string;
    isExactMatch: boolean;
  } | null;
  allCandidates: Array<{ tokenName: string; variableId?: string; textStyleId?: string; value: string | number; darkValue?: string }>;
}

interface V2Result {
  colors: V2Issue[];
  dimensions: V2Issue[];
  typography: V2Issue[];
}

type V2Tab = 'colors' | 'dimensions' | 'typography';

// ─── New group types ────────────────────────────────────────────────────────

interface GroupItem {
  nodeId: string;
  nodeName: string;
  bindingKeys: string[]; // [] for color/typography; ['paddingTop'] for single dim; 4-element for collapsed corners
}

interface V2Group {
  groupKey: string;         // `${nodeType}|${property}|${currentValue}|${suggestion?.tokenName ?? 'none'}`
  nodeType: string;
  property: string;
  currentValue: string;
  source: 'hardcoded' | 'wrong-library';
  suggestion: V2Issue['suggestion'];
  allCandidates: V2Issue['allCandidates'];
  items: GroupItem[];
}

// ─── State ──────────────────────────────────────────────────────────────────

let v2State: {
  result: V2Result | null;
  activeTab: V2Tab;
  groups: Record<V2Tab, V2Group[]>;
  checkedGroupKeys: Set<string>;
  chosenOverrides: Map<string, string>; // groupKey → variableId or textStyleId
  forceMatchedKeys: Set<string>;        // groupKey → was set via Force Match (closest-value, not exact)
  clearedSuggestionKeys: Set<string>;   // groupKey → user explicitly opted out of the auto-suggestion (treat as no suggestion)
} = {
  result: null,
  activeTab: 'colors',
  groups: { colors: [], dimensions: [], typography: [] },
  checkedGroupKeys: new Set(),
  chosenOverrides: new Map(),
  forceMatchedKeys: new Set(),
  clearedSuggestionKeys: new Set(),
};

// ─── Color popover open state ────────────────────────────────────────────────

let v2OpenPopover: { groupKey: string; el: HTMLElement } | null = null;

// ─── Color popover tab state ─────────────────────────────────────────────────

type ColorPopoverTab = 'surface' | 'text' | 'component' | 'overlay' | 'palette';
let v2ColorPopoverTab: ColorPopoverTab = 'surface';

function closeOpenPopover(): void {
  if (v2OpenPopover) {
    v2OpenPopover.el.remove();
    v2OpenPopover = null;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function bindingKeyFor(property: string): string | undefined {
  switch (property) {
    case 'Top-Left Radius':     return 'topLeftRadius';
    case 'Top-Right Radius':    return 'topRightRadius';
    case 'Bottom-Left Radius':  return 'bottomLeftRadius';
    case 'Bottom-Right Radius': return 'bottomRightRadius';
    case 'Padding Top':         return 'paddingTop';
    case 'Padding Right':       return 'paddingRight';
    case 'Padding Bottom':      return 'paddingBottom';
    case 'Padding Left':        return 'paddingLeft';
    case 'Item Spacing':        return 'itemSpacing';
    case 'Stroke Weight':       return 'strokeWeight';
    default:                    return undefined;
  }
}

const CORNER_PROPS = new Set(['Top-Left Radius', 'Top-Right Radius', 'Bottom-Left Radius', 'Bottom-Right Radius']);
const CORNER_BINDING_KEYS = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];

// ─── Grouping ────────────────────────────────────────────────────────────────

function groupIssues(issues: V2Issue[]): V2Group[] {
  // ── Pass 1: intra-node corner collapse ──────────────────────────────────
  // For each node, if all 4 corner-radius properties share the same currentValue
  // AND the same suggestion?.tokenName, collapse them into a single virtual issue
  // with property='Corner Radius' and bindingKeys set to all 4 keys.

  // Group corners by nodeId
  const cornersByNode = new Map<string, V2Issue[]>();
  const nonCornerIssues: V2Issue[] = [];

  for (const issue of issues) {
    if (CORNER_PROPS.has(issue.property)) {
      const list = cornersByNode.get(issue.nodeId) ?? [];
      list.push(issue);
      cornersByNode.set(issue.nodeId, list);
    } else {
      nonCornerIssues.push(issue);
    }
  }

  const pass1: V2Issue[] = [...nonCornerIssues];

  for (const [, corners] of cornersByNode) {
    // Check if all 4 corners are present with same currentValue and same suggestion tokenName
    const allFour = corners.length === 4
      && corners.every(c => CORNER_PROPS.has(c.property));

    if (!allFour) {
      // Less than 4 corners — leave them un-collapsed
      pass1.push(...corners);
      continue;
    }

    const firstVal = corners[0].currentValue;
    const firstToken = corners[0].suggestion?.tokenName ?? null;
    const uniform = corners.every(c =>
      c.currentValue === firstVal &&
      (c.suggestion?.tokenName ?? null) === firstToken
    );

    if (!uniform) {
      // Non-uniform corners — leave un-collapsed
      pass1.push(...corners);
      continue;
    }

    // All 4 corners uniform — emit a single collapsed virtual issue
    // Use the first corner's data for suggestion / candidates
    const base = corners[0];
    const collapsed: V2Issue = {
      nodeId: base.nodeId,
      nodeName: base.nodeName,
      nodeType: base.nodeType,
      property: 'Corner Radius',
      currentValue: base.currentValue,
      source: base.source,
      currentBindingName: base.currentBindingName,
      suggestion: base.suggestion,
      allCandidates: base.allCandidates,
    };
    pass1.push(collapsed);
  }

  // ── Pass 2: cross-node grouping ─────────────────────────────────────────
  // Key = `${nodeType}|${property}|${currentValue}|${suggestion?.tokenName ?? 'none'}`
  const groupMap = new Map<string, V2Group>();

  for (const issue of pass1) {
    const tokenName = issue.suggestion?.tokenName ?? 'none';
    const gKey = `${issue.nodeType}|${issue.property}|${issue.currentValue}|${tokenName}`;

    let group = groupMap.get(gKey);
    if (!group) {
      group = {
        groupKey: gKey,
        nodeType: issue.nodeType,
        property: issue.property,
        currentValue: issue.currentValue,
        source: issue.source,
        suggestion: issue.suggestion,
        allCandidates: issue.allCandidates,
        items: [],
      };
      groupMap.set(gKey, group);
    }

    // Determine bindingKeys for this item
    let bindingKeys: string[];
    if (issue.property === 'Corner Radius') {
      // Collapsed corner — binds to all 4 radius properties
      bindingKeys = CORNER_BINDING_KEYS.slice();
    } else {
      const bk = bindingKeyFor(issue.property);
      bindingKeys = bk ? [bk] : [];
    }

    group.items.push({
      nodeId: issue.nodeId,
      nodeName: issue.nodeName,
      bindingKeys,
    });
  }

  return Array.from(groupMap.values());
}

// ─── Token dropdown helpers ──────────────────────────────────────────────────

function splitTokenPath(tokenName: string): { group: string; leaf: string } {
  const lastSlash = tokenName.lastIndexOf('/');
  if (lastSlash === -1) return { group: '', leaf: tokenName };
  const base = { group: tokenName.slice(0, lastSlash), leaf: tokenName.slice(lastSlash + 1) };
  // Typography sub-grouping: split "s2a/typography/title-1" into group "s2a/typography/title"
  // so titles, body styles, etc. cluster under their own optgroup headers.
  if (base.group === 's2a/typography') {
    const dashIdx = base.leaf.indexOf('-');
    const category = dashIdx === -1 ? base.leaf : base.leaf.slice(0, dashIdx);
    return { group: `s2a/typography/${category}`, leaf: base.leaf };
  }
  return base;
}

/** Pick a readable text color (black or white) for max contrast against a hex background. */
function pickReadableTextColor(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length < 6) return '#000';
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#000' : '#fff';
}

function buildGroupedDropdownOptions(
  candidates: ReadonlyArray<{ tokenName: string; variableId?: string; textStyleId?: string; value: string | number }>,
  chosen: string,
): string {
  // Group by path prefix
  const groups = new Map<string, Array<{ tokenName: string; variableId?: string; textStyleId?: string; value: string | number }>>();
  for (const c of candidates) {
    const { group } = splitTokenPath(c.tokenName);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(c);
  }
  // Sort groups: canonical S2A groups first (in priority order), then everything else
  // alphabetically. Within each group, sort by numeric value when both items have numbers
  // (dimensions), otherwise by leaf name alphabetically.
  const GROUP_PRIORITY: string[] = [
    // Spacing / layout
    's2a/spacing',
    's2a/layout',
    // Radii + stroke widths
    's2a/border/radius',
    's2a/border/width',
    // Typography (custom typographic order)
    's2a/typography/super',
    's2a/typography/title',
    's2a/typography/body',
    's2a/typography/eyebrow',
    's2a/typography/label',
    's2a/typography/caption',
    // Colors — canonical surfaces first, then utilities, then primary variants
    's2a/color/background',
    's2a/color/background/utility',
    's2a/color/content',
    's2a/color/content/utility',
    's2a/color/border',
    's2a/color/border/utility',
    's2a/color/background/primary',
    's2a/color/content/primary',
    's2a/color/border/primary',
  ];
  const sortedGroupKeys = Array.from(groups.keys()).sort((a, b) => {
    const ai = GROUP_PRIORITY.indexOf(a);
    const bi = GROUP_PRIORITY.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  let out = '';
  for (const groupKey of sortedGroupKeys) {
    const items = groups.get(groupKey)!.slice().sort((a, b) => {
      const an = typeof a.value === 'number' ? a.value : NaN;
      const bn = typeof b.value === 'number' ? b.value : NaN;
      if (!isNaN(an) && !isNaN(bn)) return an - bn;
      return splitTokenPath(a.tokenName).leaf.localeCompare(splitTokenPath(b.tokenName).leaf, undefined, { numeric: true });
    });
    const groupLabel = groupKey || '(uncategorised)';
    out += `<optgroup label="${esc(groupLabel)}">`;
    for (const c of items) {
      const id = c.variableId ?? c.textStyleId ?? '';
      // Format value for direct comparison with currentValue: numbers → "(Npx)", strings → "(value)".
      let valuePart = '';
      if (typeof c.value === 'number') valuePart = ` (${c.value}px)`;
      else if (typeof c.value === 'string' && c.value !== '') valuePart = ` (${c.value})`;
      // Full path so the collapsed-select state shows the full token name; the optgroup
      // header still provides hierarchical grouping when the dropdown is open.
      const optionLabel = `${c.tokenName}${valuePart}`;
      // For color tokens (hex string value starting with #), apply inline background-color
      // as a best-effort visual swatch in the dropdown list. Chromium honors this; the
      // separate v2-color-swatch element below guarantees a visible swatch regardless.
      const isHex = typeof c.value === 'string' && c.value.startsWith('#');
      const styleAttr = isHex ? ` style="background-color:${esc(c.value)};color:${pickReadableTextColor(c.value as string)}"` : '';
      out += `<option value="${esc(id)}"${styleAttr} ${id === chosen ? 'selected' : ''}>${esc(optionLabel)}</option>`;
    }
    out += `</optgroup>`;
  }
  return out;
}

// ─── Tab filter helpers ───────────────────────────────────────────────────────

const SURFACE_TEXT_LEAVES = new Set(['default', 'subtle', 'strong', 'brand', 'disabled', 'knockout', 'inverse']);
const TEXT_LEAVES = new Set(['body-strong', 'body-subtle', 'label', 'caption', 'subheading', 'eyebrow', 'title']);

function matchesColorPopoverTab(
  tokenName: string,
  tab: ColorPopoverTab,
): boolean {
  const n = tokenName.toLowerCase();
  switch (tab) {
    case 'surface':
      // Surface = background + border + focus-ring only. Content moved to its own tab.
      return n.startsWith('s2a/color/background/')
        || n.startsWith('s2a/color/border/')
        || n.startsWith('s2a/color/focus-ring/');
    case 'text':
      // "Content" tab (formerly "Text"): everything under s2a/color/content/*
      return n.startsWith('s2a/color/content/');
    case 'component':
      return n.startsWith('s2a/color/button/') || n.startsWith('s2a/color/iconbutton/');
    case 'overlay':
      return n.startsWith('s2a/color/transparent/');
    case 'palette':
      return n.startsWith('s2a/color/blue/') || n.startsWith('s2a/color/green/') ||
             n.startsWith('s2a/color/red/') || n.startsWith('s2a/color/orange/') ||
             n.startsWith('s2a/color/yellow/') || n.startsWith('s2a/color/gray/') ||
             n.startsWith('s2a/color/brand/');
    default:
      return false;
  }
}

/**
 * Build the inner HTML for a color popover — tab strip + Figma-style table layout.
 * Columns: swatch/name | Light hex | Dark hex
 */
function buildColorPopoverContent(
  candidates: ReadonlyArray<{ tokenName: string; variableId?: string; textStyleId?: string; value: string | number; darkValue?: string }>,
  chosen: string,
  tab: ColorPopoverTab = v2ColorPopoverTab,
): string {
  // Filter by tab
  const filtered = candidates.filter(c => matchesColorPopoverTab(c.tokenName, tab));

  // Group by path prefix
  const groups = new Map<string, Array<{ tokenName: string; variableId?: string; textStyleId?: string; value: string | number; darkValue?: string }>>();
  for (const c of filtered) {
    const { group } = splitTokenPath(c.tokenName);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(c);
  }

  const sortedGroupKeys = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));

  // Tab strip
  const tabDefs: Array<{ id: ColorPopoverTab; label: string }> = [
    { id: 'surface',   label: 'Surface'   },
    { id: 'text',      label: 'Content'   },
    { id: 'component', label: 'Component' },
    { id: 'overlay',   label: 'Overlay'   },
    { id: 'palette',   label: 'Palette'   },
  ];
  let out = `<div class="v2-cp-tabs">`;
  for (const t of tabDefs) {
    out += `<button class="v2-cp-tab${t.id === tab ? ' v2-cp-tab-active' : ''}" data-cptab="${esc(t.id)}">${esc(t.label)}</button>`;
  }
  out += `</div>`;

  // Clear-selection button — shown only when there's a current chosen value.
  // Lets the user back out of a selection (auto-suggested OR manually picked).
  if (chosen) {
    out += `<button type="button" class="v2-color-clear-btn">× Clear selection</button>`;
  }

  // Table header
  out += `<div class="v2-color-table-header">`;
  out += `<span class="v2-cth-name">Name</span>`;
  out += `<span class="v2-cth-hex">Light</span>`;
  out += `<span class="v2-cth-hex">Dark</span>`;
  out += `</div>`;

  if (sortedGroupKeys.length === 0) {
    out += `<div style="padding:10px 12px;font-size:11px;color:var(--text-secondary);">No tokens in this tab.</div>`;
    return out;
  }

  for (const groupKey of sortedGroupKeys) {
    const items = groups.get(groupKey)!.slice().sort((a, b) =>
      splitTokenPath(a.tokenName).leaf.localeCompare(splitTokenPath(b.tokenName).leaf, undefined, { numeric: true })
    );
    const groupLabel = groupKey || '(uncategorised)';
    out += `<div class="v2-color-group-header">${esc(groupLabel)}</div>`;
    for (const c of items) {
      const id = c.variableId ?? c.textStyleId ?? '';
      const lightHex = (typeof c.value === 'string' && (c.value as string).startsWith('#')) ? (c.value as string) : '#cccccc';
      const darkHex = (typeof c.darkValue === 'string' && c.darkValue.startsWith('#')) ? c.darkValue : lightHex;
      const { leaf } = splitTokenPath(c.tokenName);
      const selectedAttr = id === chosen ? ' data-selected="1"' : '';
      out += `<button class="v2-color-option${id === chosen ? ' v2-color-option-selected' : ''}" data-id="${esc(id)}"${selectedAttr}>`;
      out += `<span class="v2-color-option-label">${esc(leaf)}</span>`;
      out += `<span class="v2-color-cell-hex">`;
      out += `<span class="v2-mini-swatch" style="--swatch:${esc(lightHex)}"></span>`;
      out += `${esc(lightHex)}`;
      out += `</span>`;
      out += `<span class="v2-color-cell-hex">`;
      out += `<span class="v2-mini-swatch" style="--swatch:${esc(darkHex)}"></span>`;
      out += `${esc(darkHex)}`;
      out += `</span>`;
      out += `</button>`;
    }
  }
  return out;
}

// ─── CSS injection (one-time) ────────────────────────────────────────────────

let v2StyleInjected = false;

function ensureV2Styles(): void {
  if (v2StyleInjected) return;
  v2StyleInjected = true;

  const style = document.createElement('style');
  style.textContent = `
/* Align V2 group rows — two-line layout */
.alignv2-group {
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}
.alignv2-group.disabled { opacity: 0.5; cursor: default; }
.alignv2-group-line1 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.alignv2-group-line1 input[type="checkbox"] {
  flex-shrink: 0;
  margin: 0;
}
.v2-meta {
  flex: 1;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.v2-count {
  flex-shrink: 0;
  font-size: 10px;
  color: var(--text-secondary);
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 8px;
  padding: 1px 6px;
}
.alignv2-group-line2 {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 24px;
  margin-top: 2px;
  font-size: 11px;
}
.alignv2-group-line2 .v2-value {
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 140px;
  min-width: 0;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 4px;
  padding: 3px 8px;
  box-sizing: border-box;
  overflow: hidden;
}
.alignv2-group-line2 .v2-value-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.alignv2-group-line2 .v2-arrow {
  color: var(--text-secondary);
  flex-shrink: 0;
}
.alignv2-group-line2 select {
  font-size: 11px;
  padding: 2px 4px;
  flex: 1;
  min-width: 0;
}
.alignv2-group-line2 .v2-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 18px;
  font-size: 9px;
  padding: 0 6px;
  border-radius: 8px;
  background: var(--success-bg, #e6f4ea);
  color: var(--success, #137333);
  box-sizing: border-box;
}
.alignv2-group-line2 .v2-badge.v2-badge-muted {
  background: var(--bg-secondary, #f0f0f0);
  color: var(--text-secondary, #999);
}
.alignv2-group-line2 .v2-badge.v2-badge-force {
  background: #fff1e0;
  color: #b35900;
}
/* Clickable "Match" badge — same grey pill as Select but interactive.
   Only override the bits of <button> chrome that differ from <span>; let all
   pill sizing (padding, font-size, line-height, min-width) inherit from
   .v2-badge so the dimensions match Align / Select / Matched exactly. */
.alignv2-group-line2 button.v2-badge.v2-badge-match {
  cursor: pointer;
  border: 0;
  appearance: none;
  -webkit-appearance: none;
  font-family: inherit;
}
/* Hover state on the green (Align — click to clear) variant. Lower-specificity
   rule applies only when neither -muted nor -force is on the element. */
.alignv2-group-line2 button.v2-badge.v2-badge-match:hover {
  background: #d0eedb;
  color: #0c5224;
}
/* Hover state on the grey (force-match OR restore-align) variant. */
.alignv2-group-line2 button.v2-badge.v2-badge-muted.v2-badge-match:hover {
  background: var(--border, #e0e0e0);
  color: var(--text);
}
/* Hover state on the orange (clear) variant. */
.alignv2-group-line2 button.v2-badge.v2-badge-force.v2-badge-match:hover {
  background: #ffe2c0;
  color: #8a4400;
}
.alignv2-group-line2 .v2-color-swatch {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid var(--border, #e5e5e5);
  flex-shrink: 0;
  box-sizing: border-box;
}
#alignV2ApplyBtn {
  width: auto;
  padding: 4px 10px;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
#alignV2ApplyBtn .v2-apply-count {
  background: rgba(0, 0, 0, 0.2);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}
.v2-color-dropdown {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  background: var(--bg-secondary, #fff);
  border: 1px solid var(--border, #e5e5e5);
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
  font-size: 11px;
  text-align: left;
}
.v2-color-dropdown .v2-color-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.v2-color-dropdown .v2-color-caret {
  color: var(--text-secondary);
  flex-shrink: 0;
}
.v2-color-popover .v2-color-clear-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 12px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--border, #e5e5e5);
  font-size: 11px;
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
}
.v2-color-popover .v2-color-clear-btn:hover {
  background: var(--bg-secondary, #f5f5f5);
}
.v2-color-popover {
  position: fixed;
  background: var(--bg, #fff);
  border: 1px solid var(--border, #e5e5e5);
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.14);
  max-height: 380px;
  overflow-y: auto;
  z-index: 10000;
  min-width: 380px;
  max-width: 480px;
  padding: 0 0 6px 0;
  font-size: 12px;
}
/* Tab strip */
.v2-cp-tabs {
  display: flex;
  border-bottom: 1px solid var(--border, #e5e5e5);
  padding: 0 4px;
  gap: 2px;
  position: sticky;
  top: 0;
  background: var(--bg, #fff);
  z-index: 1;
  flex-shrink: 0;
}
.v2-cp-tab {
  padding: 6px 10px;
  font-size: 11px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  color: var(--text-secondary, #888);
  white-space: nowrap;
  margin-bottom: -1px;
  border-radius: 0;
}
.v2-cp-tab:hover {
  color: var(--text, #222);
}
.v2-cp-tab.v2-cp-tab-active {
  color: var(--text, #222);
  border-bottom-color: var(--accent, #0066cc);
  font-weight: 500;
}
/* Table header row */
.v2-color-table-header {
  display: grid;
  grid-template-columns: 1fr 90px 90px;
  padding: 4px 12px;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary, #888);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border, #f0f0f0);
}
/* Group header */
.v2-color-popover .v2-color-group-header {
  padding: 8px 12px 2px 12px;
  color: var(--text-secondary, #888);
  font-weight: 400;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
/* Option row — 3-column grid: name | light | dark */
.v2-color-popover .v2-color-option {
  display: grid;
  grid-template-columns: 1fr 90px 90px;
  align-items: center;
  width: 100%;
  padding: 5px 12px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: var(--text, #222);
  font-size: 11px;
  gap: 0;
  box-sizing: border-box;
}
.v2-color-popover .v2-color-option:hover {
  background: var(--hover-bg, #f5f5f5);
}
.v2-color-popover .v2-color-option.v2-color-option-selected {
  background: var(--hover-bg, #f0f0f0);
}
.v2-color-popover .v2-color-option-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 8px;
}
/* Hex cell with mini swatch */
.v2-color-cell-hex {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-family: monospace;
  color: var(--text-secondary, #666);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.v2-mini-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(0,0,0,0.12);
  flex-shrink: 0;
  /* Layered: solid color on top, checker pattern underneath — transparency in the color
     reveals the checker so alpha tokens are visually obvious. */
  background-image:
    linear-gradient(var(--swatch, transparent), var(--swatch, transparent)),
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: auto auto, 6px 6px, 6px 6px, 6px 6px, 6px 6px;
  background-position: 0 0, 0 0, 0 3px, 3px -3px, -3px 0;
  background-color: #fff;
}
`;
  document.head.appendChild(style);

  // Global click-outside listener: close popover when clicking outside it
  document.addEventListener('click', (e) => {
    if (!v2OpenPopover) return;
    const target = e.target as Node;
    if (!v2OpenPopover.el.contains(target)) {
      closeOpenPopover();
    }
  }, true);

  // Global Escape key listener: close popover
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && v2OpenPopover) {
      closeOpenPopover();
    }
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function renderAlignV2ScanResult(result: V2Result, selectionName: string, selectionType: string): void {
  ensureV2Styles();

  v2State.result = result;
  v2State.activeTab = 'colors';
  v2State.chosenOverrides = new Map();
  v2State.checkedGroupKeys = new Set();
  v2State.forceMatchedKeys = new Set();
  v2State.clearedSuggestionKeys = new Set();

  // Build groups for all tabs upfront so counts are correct
  v2State.groups = {
    colors:     groupIssues(result.colors),
    dimensions: groupIssues(result.dimensions),
    typography: groupIssues(result.typography),
  };

  // Default-check all groups that have a suggestion
  for (const tab of ['colors', 'dimensions', 'typography'] as const) {
    for (const group of v2State.groups[tab]) {
      if (group.suggestion !== null) v2State.checkedGroupKeys.add(group.groupKey);
    }
  }

  document.getElementById('alignV2Selection')!.textContent = `${selectionName} (${selectionType})`;
  document.getElementById('alignV2Tabs')!.style.display = '';
  document.getElementById('alignV2Toolbar')!.style.display = 'flex';
  document.getElementById('alignV2Footer')!.style.display = 'flex';

  // Tab counts = group counts
  document.getElementById('alignV2ColorsCount')!.textContent     = String(v2State.groups.colors.length);
  document.getElementById('alignV2DimensionsCount')!.textContent = String(v2State.groups.dimensions.length);
  document.getElementById('alignV2TypographyCount')!.textContent = String(v2State.groups.typography.length);

  renderV2Body();
}

function renderV2Body(): void {
  // Close any open popover before re-rendering
  closeOpenPopover();

  const body = document.getElementById('alignV2Body')!;
  if (!v2State.result) { body.innerHTML = ''; return; }

  const groups = v2State.groups[v2State.activeTab];

  if (groups.length === 0) {
    body.innerHTML = `<div style="padding:12px;color:var(--text-secondary);font-size:11px;">No issues in this tab.</div>`;
    updateV2Footer();
    return;
  }

  body.innerHTML = groups.map(group => {
    const gk = esc(group.groupKey);
    const checked = v2State.checkedGroupKeys.has(group.groupKey);
    // Effective suggestion: null when the user has explicitly cleared the
    // auto-suggestion via the popover's "Clear selection" button. Treat the
    // row as if no S2A suggestion existed in the first place.
    const effectiveSuggestion = v2State.clearedSuggestionKeys.has(group.groupKey)
      ? null
      : group.suggestion;
    const disabled = effectiveSuggestion === null;
    const chosen = v2State.chosenOverrides.get(group.groupKey)
      ?? (effectiveSuggestion?.variableId ?? effectiveSuggestion?.textStyleId ?? '');

    const isColorRow = group.property === 'Fill' || group.property === 'Stroke';

    // Visual swatch for the LEFT (current) value on color rows so the designer can
    // compare current vs. target at a glance. currentValue is either '#RRGGBB'
    // (hardcoded) or 'libName / coll / name (#RRGGBB)' (wrong-library) — take the
    // LAST hex match so wrong-library picks the trailing resolved hex, not a hex
    // that happens to be inside a variable path.
    let currentColorSwatch = '';
    if (isColorRow) {
      const hexMatches = group.currentValue.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g);
      const currentHex = hexMatches ? hexMatches[hexMatches.length - 1] : '';
      if (currentHex) {
        currentColorSwatch = `<span class="v2-color-swatch" style="background-color:${esc(currentHex)}"></span>`;
      }
    }

    let suggestCell: string;

    if (isColorRow) {
      // Color rows: use custom popover button (no external swatch, no native <select>)
      if (group.allCandidates.length === 0) {
        // No candidates at all — static text
        suggestCell = `<span style="color:var(--text-secondary)">No S2A token</span>`;
      } else {
        // Has candidates: show the custom dropdown button
        const chosenCandidate = group.allCandidates.find(c => (c.variableId ?? c.textStyleId) === chosen);
        const chosenHex = (typeof chosenCandidate?.value === 'string') ? chosenCandidate.value : '';
        const swatchStyle = `background-color:${esc(chosenHex || '#cccccc')}`;
        const labelText = chosenCandidate
          ? esc(`${chosenCandidate.tokenName} (${chosenCandidate.value})`)
          : (disabled ? 'Select a color…' : 'Select a color…');
        const noSuggAttr = disabled ? ' data-no-suggestion="1"' : '';
        suggestCell = `<button class="v2-color-dropdown" data-group-key="${gk}"${noSuggAttr}>` +
          `<span class="v2-color-swatch" style="${swatchStyle}"></span>` +
          `<span class="v2-color-label">${labelText}</span>` +
          `<span class="v2-color-caret">▾</span>` +
          `</button>`;
      }
    } else {
      // Dimension / Typography rows: keep native <select>
      const dropdownOpts = buildGroupedDropdownOptions(group.allCandidates, chosen);

      const noSuggestionDropdown = disabled && group.allCandidates.length > 0
        ? `<select data-group-key="${gk}" data-no-suggestion="1"><option value="" disabled ${!chosen ? 'selected' : ''}>Select a token…</option>${dropdownOpts}</select>`
        : null;

      suggestCell = noSuggestionDropdown
        ? noSuggestionDropdown
        : disabled
          ? `<span style="color:var(--text-secondary)">No S2A token</span>`
          : `<select data-group-key="${gk}">${dropdownOpts}</select>`;
    }

    // Five-state badge — color + label carry the meaning. All clickable variants
    // share class .v2-badge-match and one click handler that figures out the
    // action from current state.
    // Green   "Align"  — exact-match S2A suggestion is active   → click CLEARS it
    // Orange  "Match"  — value chosen (force-match or manual)   → click CLEARS it
    // Gray    "Select" — Align suggestion exists but was cleared → click RESTORES it
    // Gray    "Match"  — no suggestion ever, candidates exist   → click FORCE-MATCHES
    // Gray    "Select" — no candidates, no action possible      → static span
    const chosenValueId = v2State.chosenOverrides.get(group.groupKey)
      ?? effectiveSuggestion?.variableId
      ?? effectiveSuggestion?.textStyleId
      ?? null;
    const isClearedAlign = group.suggestion !== null && v2State.clearedSuggestionKeys.has(group.groupKey);

    let badge: string;
    if (effectiveSuggestion?.isExactMatch) {
      badge = `<button type="button" class="v2-badge v2-badge-match" data-group-key="${gk}">Align</button>`;
    } else if (chosenValueId) {
      badge = `<button type="button" class="v2-badge v2-badge-force v2-badge-match" data-group-key="${gk}">Match</button>`;
    } else if (isClearedAlign) {
      badge = `<button type="button" class="v2-badge v2-badge-muted v2-badge-match" data-group-key="${gk}">Select</button>`;
    } else if (group.allCandidates.length > 0) {
      badge = `<button type="button" class="v2-badge v2-badge-muted v2-badge-match" data-group-key="${gk}">Match</button>`;
    } else {
      badge = `<span class="v2-badge v2-badge-muted">Select</span>`;
    }

    const countBadge = group.items.length > 1
      ? `<span class="v2-count">${group.items.length} items</span>`
      : '';

    // Use the first item's nodeId for navigation click (representative node)
    const firstNodeId = esc(group.items[0]?.nodeId ?? '');

    // For no-suggestion rows that have candidates: checkbox starts disabled+unchecked,
    // but becomes enabled once the user picks a token from the dropdown.
    const noSuggestionHasCandidates = disabled && group.allCandidates.length > 0;
    const isPickable = noSuggestionHasCandidates;
    const hasOverride = isPickable && !!v2State.chosenOverrides.get(group.groupKey);
    const cbChecked = isPickable ? hasOverride : checked;
    const cbDisabled = isPickable ? !hasOverride : disabled;

    return `<div class="alignv2-group ${(disabled && !isPickable) ? 'disabled' : ''}" data-group-key="${gk}" data-first-node-id="${firstNodeId}">
  <div class="alignv2-group-line1">
    <input type="checkbox" data-group-key="${gk}" ${cbChecked ? 'checked' : ''} ${cbDisabled ? 'disabled' : ''}>
    <span class="v2-meta">${esc(group.nodeType)} &middot; ${esc(group.property)}</span>
    ${countBadge}
  </div>
  <div class="alignv2-group-line2">
    <span class="v2-value">${currentColorSwatch}<span class="v2-value-text">${esc(group.currentValue)}</span></span>
    <span class="v2-arrow">→</span>
    ${suggestCell}
    ${badge}
  </div>
</div>`;
  }).join('');

  // Checkbox listeners
  body.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-group-key]').forEach(cb => {
    cb.addEventListener('change', () => {
      const k = cb.dataset.groupKey!;
      if (cb.checked) v2State.checkedGroupKeys.add(k); else v2State.checkedGroupKeys.delete(k);
      updateV2Footer();
    });
  });

  // Clickable badge handler — every interactive pill (green Align, orange Match,
  // grey Select-restore, grey Match-force) shares class .v2-badge-match. The
  // handler figures out the action from current state.
  body.querySelectorAll<HTMLButtonElement>('button.v2-badge-match[data-group-key]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const k = btn.dataset.groupKey!;
      const g = v2State.groups[v2State.activeTab].find(gg => gg.groupKey === k);
      if (!g) return;

      const isCleared = v2State.clearedSuggestionKeys.has(k);
      const effSugg = isCleared ? null : g.suggestion;
      const hasChosen = v2State.chosenOverrides.has(k);

      if (effSugg?.isExactMatch) {
        // Green Align → CLEAR. Mark the suggestion as cleared; row flips to grey Select.
        v2State.clearedSuggestionKeys.add(k);
        v2State.chosenOverrides.delete(k);
        v2State.forceMatchedKeys.delete(k);
        v2State.checkedGroupKeys.delete(k);
      } else if (hasChosen) {
        // Orange Match → CLEAR chosen value. Don't touch clearedSuggestionKeys
        // so an Align-then-cleared-then-force-matched row goes back to grey Select,
        // not back to green Align.
        v2State.chosenOverrides.delete(k);
        v2State.forceMatchedKeys.delete(k);
        v2State.checkedGroupKeys.delete(k);
      } else if (g.suggestion !== null && isCleared) {
        // Grey Select on a previously-cleared Align row → RESTORE the Align suggestion.
        v2State.clearedSuggestionKeys.delete(k);
        v2State.checkedGroupKeys.add(k);
      } else if (g.allCandidates.length > 0) {
        // Grey Match on a row that never had a suggestion → FORCE-MATCH.
        const candidate = pickClosestByCategory(g);
        if (!candidate) return;
        const candidateId = candidate.variableId ?? candidate.textStyleId;
        if (!candidateId) return;
        v2State.chosenOverrides.set(k, candidateId);
        v2State.forceMatchedKeys.add(k);
        v2State.checkedGroupKeys.add(k);
      }
      renderV2Body();
    });
  });

  // Native <select> listeners (dimension / typography rows only)
  body.querySelectorAll<HTMLSelectElement>('select[data-group-key]').forEach(sel => {
    sel.addEventListener('change', () => {
      const k = sel.dataset.groupKey!;
      const val = sel.value;
      if (val) {
        v2State.chosenOverrides.set(k, val);
      } else {
        v2State.chosenOverrides.delete(k);
      }

      // Manual override removes force-match flag — user's explicit choice
      v2State.forceMatchedKeys.delete(k);

      // For no-suggestion rows, sync the paired checkbox
      if (sel.dataset.noSuggestion) {
        const cb = body.querySelector<HTMLInputElement>(`input[type="checkbox"][data-group-key="${CSS.escape(k)}"]`);
        if (cb) {
          if (val) {
            cb.disabled = false;
            cb.checked = true;
            v2State.checkedGroupKeys.add(k);
          } else {
            cb.disabled = true;
            cb.checked = false;
            v2State.checkedGroupKeys.delete(k);
          }
        }
      }

      updateV2Footer();
    });
  });

  // Color popover button listeners
  body.querySelectorAll<HTMLButtonElement>('button.v2-color-dropdown[data-group-key]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const k = btn.dataset.groupKey!;

      // If this popover is already open, close it and return
      if (v2OpenPopover && v2OpenPopover.groupKey === k) {
        closeOpenPopover();
        return;
      }

      // Close any other open popover
      closeOpenPopover();

      // Find the group data for building popover content
      const groupArr = v2State.groups[v2State.activeTab];
      const grp = groupArr.find(g => g.groupKey === k);
      if (!grp) return;

      // Honor the cleared-suggestion flag: if the user cleared the auto-suggestion,
      // open the popover as if no suggestion existed (so chosenVal is '' and the
      // Clear button is hidden until they pick something fresh).
      const effSuggForPopover = v2State.clearedSuggestionKeys.has(k) ? null : grp.suggestion;
      const chosenVal = v2State.chosenOverrides.get(k)
        ?? (effSuggForPopover?.variableId ?? effSuggForPopover?.textStyleId ?? '');

      // Auto-switch the popover tab so it opens on the tab containing the
      // currently-chosen value (saves the user from hunting through tabs).
      if (chosenVal) {
        const chosenCandidate = grp.allCandidates.find(c => (c.variableId ?? c.textStyleId) === chosenVal);
        if (chosenCandidate) {
          const tabsToCheck: ColorPopoverTab[] = ['surface', 'text', 'component', 'overlay', 'palette'];
          for (const t of tabsToCheck) {
            if (matchesColorPopoverTab(chosenCandidate.tokenName, t)) {
              v2ColorPopoverTab = t;
              break;
            }
          }
        }
      }

      // Build popover
      const popover = document.createElement('div');
      popover.className = 'v2-color-popover';
      popover.dataset.forGroupKey = k;
      popover.innerHTML = buildColorPopoverContent(grp.allCandidates, chosenVal, v2ColorPopoverTab);

      // Initial position: below + left-aligned with the button.
      const rect = btn.getBoundingClientRect();
      popover.style.top = `${rect.bottom + 2}px`;
      popover.style.left = `${rect.left}px`;
      popover.style.minWidth = `${Math.max(rect.width, 380)}px`;

      document.body.appendChild(popover);
      v2OpenPopover = { groupKey: k, el: popover };

      // Smart positioning: clamp inside the iframe viewport.
      // 1) If popover overflows the bottom, flip above the button (or shrink to fit).
      // 2) If popover overflows the right, shift left so it fits.
      // Measured AFTER append so layout is real.
      const PADDING = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pop = popover.getBoundingClientRect();

      // Vertical: prefer below; if not enough room, try above; else clamp to viewport with scroll.
      const roomBelow = vh - rect.bottom - PADDING;
      const roomAbove = rect.top - PADDING;
      if (pop.height > roomBelow && roomAbove > roomBelow) {
        // Flip above
        const maxH = Math.min(pop.height, roomAbove);
        popover.style.top = `${rect.top - maxH - 2}px`;
        popover.style.maxHeight = `${maxH}px`;
      } else {
        // Stay below, cap height to room below
        popover.style.maxHeight = `${Math.max(roomBelow, 120)}px`;
      }

      // Horizontal: if right edge overflows, shift left so popover.right === vw - PADDING.
      const popAfter = popover.getBoundingClientRect();
      if (popAfter.right > vw - PADDING) {
        const shift = popAfter.right - (vw - PADDING);
        const newLeft = Math.max(PADDING, rect.left - shift);
        popover.style.left = `${newLeft}px`;
      }

      // Scroll the currently-selected option into view inside the popover.
      const selectedOpt = popover.querySelector<HTMLElement>('button.v2-color-option.v2-color-option-selected');
      if (selectedOpt) {
        selectedOpt.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      }

      /** Attach option click listeners to .v2-color-option buttons inside the popover. */
      function attachOptionListeners(): void {
        popover.querySelectorAll<HTMLButtonElement>('button.v2-color-option').forEach(opt => {
          opt.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const val = opt.dataset.id!;
            if (!val) return;

            v2State.chosenOverrides.set(k, val);
            // Manual override removes force-match flag — user's explicit choice
            v2State.forceMatchedKeys.delete(k);

            // Update the collapsed button's swatch and label
            const cand = grp.allCandidates.find(c => (c.variableId ?? c.textStyleId) === val);
            const newHex = (cand && typeof cand.value === 'string') ? cand.value : '#cccccc';
            const swatchInBtn = btn.querySelector<HTMLElement>('.v2-color-swatch');
            if (swatchInBtn) swatchInBtn.style.backgroundColor = newHex;
            const labelInBtn = btn.querySelector<HTMLElement>('.v2-color-label');
            if (labelInBtn && cand) labelInBtn.textContent = `${cand.tokenName} (${cand.value})`;

            // For no-suggestion color rows, enable + check the paired checkbox
            if (btn.dataset.noSuggestion) {
              const cb = body.querySelector<HTMLInputElement>(`input[type="checkbox"][data-group-key="${CSS.escape(k)}"]`);
              if (cb) {
                cb.disabled = false;
                cb.checked = true;
                v2State.checkedGroupKeys.add(k);
              }
            }

            updateV2Footer();
            closeOpenPopover();
          });
        });
      }

      attachOptionListeners();

      // Clear-selection click — event delegation so it survives tab-change innerHTML rebuilds.
      // Removes any chosen override + force-match flag for this row, unchecks the row's
      // checkbox (user explicitly opted out of applying anything), closes the popover,
      // and re-renders so the row's button + badge reflect the cleared state.
      popover.addEventListener('click', (ev) => {
        const clearBtn = (ev.target as HTMLElement).closest<HTMLButtonElement>('button.v2-color-clear-btn');
        if (!clearBtn) return;
        ev.stopPropagation();
        v2State.chosenOverrides.delete(k);
        v2State.forceMatchedKeys.delete(k);
        v2State.checkedGroupKeys.delete(k);
        // Mark the row's auto-suggestion as explicitly cleared. From now on this
        // row is rendered as if no suggestion existed: badge becomes "Select",
        // dropdown shows "Select a color…", checkbox stays unchecked.
        v2State.clearedSuggestionKeys.add(k);
        closeOpenPopover();
        renderV2Body();
      });

      // Tab clicks — use event delegation on the popover to avoid re-attachment after innerHTML rebuilds
      popover.addEventListener('click', (ev) => {
        const tabBtn = (ev.target as HTMLElement).closest<HTMLButtonElement>('button.v2-cp-tab[data-cptab]');
        if (!tabBtn) return;
        ev.stopPropagation();
        const newTab = tabBtn.dataset.cptab as ColorPopoverTab;
        if (!newTab || newTab === v2ColorPopoverTab) return;
        v2ColorPopoverTab = newTab;
        const effSuggForTab = v2State.clearedSuggestionKeys.has(k) ? null : grp.suggestion;
        const currentChosen = v2State.chosenOverrides.get(k)
          ?? (effSuggForTab?.variableId ?? effSuggForTab?.textStyleId ?? '');
        popover.innerHTML = buildColorPopoverContent(grp.allCandidates, currentChosen, v2ColorPopoverTab);
        attachOptionListeners();
        // Delegation listener persists on the popover element itself — no re-attachment needed
      });
    });
  });

  // Row click → navigate to the first node in the group
  body.querySelectorAll<HTMLElement>('.alignv2-group[data-first-node-id]').forEach(row => {
    row.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'OPTION' ||
        target.closest('button.v2-color-dropdown') !== null
      ) return;
      const nid = row.dataset.firstNodeId;
      if (nid) parent.postMessage({ pluginMessage: { type: 'navigate-to-node', nodeId: nid } }, '*');
    });
  });

  updateV2Footer();
}

function updateV2Footer(): void {
  const groups = v2State.groups[v2State.activeTab];
  const checkedGroups = groups.filter(g => v2State.checkedGroupKeys.has(g.groupKey));
  const groupCount = checkedGroups.length;
  const itemCount = checkedGroups.reduce((sum, g) => sum + g.items.length, 0);

  document.getElementById('alignV2FooterCount')!.textContent =
    `Update ${groupCount} ${v2State.activeTab} across ${itemCount} item${itemCount !== 1 ? 's' : ''}.`;
  (document.getElementById('alignV2ApplyBtn') as HTMLButtonElement).disabled = groupCount === 0;
  (document.getElementById('alignV2ApplyBtn') as HTMLButtonElement).innerHTML = `Apply <span class="v2-apply-count">${groupCount}</span>`;
}

export function setV2ActiveTab(tab: V2Tab): void {
  v2State.activeTab = tab;
  document.querySelectorAll<HTMLElement>('.alignv2-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.v2tab === tab);
  });
  renderV2Body();
}

export function collectV2ApplySelections(): Array<{ nodeId: string; property: string; bindingKey?: string; variableId?: string; textStyleId?: string }> {
  const out: Array<{ nodeId: string; property: string; bindingKey?: string; variableId?: string; textStyleId?: string }> = [];
  const groups = v2State.groups[v2State.activeTab];

  for (const group of groups) {
    if (!v2State.checkedGroupKeys.has(group.groupKey)) continue;
    const chosen = v2State.chosenOverrides.get(group.groupKey)
      ?? (group.suggestion?.variableId ?? group.suggestion?.textStyleId);
    if (!chosen) continue;

    // isTextStyle: check suggestion first; for no-suggestion rows, check if the chosen
    // value appears as a textStyleId in allCandidates; also fall back to the property name.
    const chosenAsTextStyle = group.suggestion === null
      ? group.allCandidates.some(c => c.textStyleId === chosen)
      : false;
    const isTextStyle = !!group.suggestion?.textStyleId || group.property === 'Text Style' || chosenAsTextStyle;

    for (const item of group.items) {
      if (group.property === 'Fill' || group.property === 'Stroke') {
        out.push({
          nodeId: item.nodeId,
          property: group.property,
          ...(isTextStyle ? { textStyleId: chosen } : { variableId: chosen }),
        });
      } else if (item.bindingKeys.length === 0) {
        // Typography — no bindingKey
        out.push({ nodeId: item.nodeId, property: group.property, textStyleId: chosen });
      } else {
        // Dimensions — one selection per bindingKey (handles 4-corner collapse)
        for (const bk of item.bindingKeys) {
          out.push({ nodeId: item.nodeId, property: group.property, bindingKey: bk, variableId: chosen });
        }
      }
    }
  }

  return out;
}

export function renderAlignV2ApplyResult(results: Array<{ nodeId: string; property: string; success: boolean; error?: string }>): void {
  const succeeded = results.filter(r => r.success).length;
  const failed = results.length - succeeded;

  if (v2State.result) {
    // Build a set of `${nodeId}|${property}` keys that fully succeeded.
    // For collapsed corners (property='Corner Radius'), each result carries the
    // original property name (e.g. 'Top-Left Radius'). We treat a group item as
    // fully succeeded when ALL of its bindingKeys' corresponding results succeeded.
    //
    // Strategy: collect all successful (nodeId, bindingKey-property) pairs, then
    // for each group, check whether every item × bindingKey is in the success set.

    // Map from `${nodeId}|${originalProperty}` → success
    const successSet = new Set(
      results.filter(r => r.success).map(r => `${r.nodeId}|${r.property}`)
    );

    // Also track which (nodeId, bindingKey-property) combos the apply emitted for
    // Corner Radius groups. Since `collectV2ApplySelections` emits individual
    // bindingKey entries (topLeftRadius etc.), the handler in code.ts applies each
    // and returns results with the original property from the scan — which is
    // 'Corner Radius' for the collapsed virtual issue. Build success from the
    // property names actually present in results.
    const successNodeProp = new Set(results.filter(r => r.success).map(r => `${r.nodeId}|${r.property}`));

    for (const tab of ['colors', 'dimensions', 'typography'] as const) {
      v2State.groups[tab] = v2State.groups[tab].filter(group => {
        // Check if all items in this group fully succeeded
        const allSucceeded = group.items.every(item =>
          successNodeProp.has(`${item.nodeId}|${group.property}`)
        );
        if (allSucceeded) {
          v2State.checkedGroupKeys.delete(group.groupKey);
          return false; // remove group
        }

        // Partial success — remove succeeded items, keep group
        group.items = group.items.filter(item =>
          !successNodeProp.has(`${item.nodeId}|${group.property}`)
        );
        return true;
      });

      // Sync raw result counts for the tab — approximate via remaining group item totals
      // (The raw V2Result is no longer the source of truth for rendering; only groups are.)
    }

    // Update tab counts to reflect remaining groups
    document.getElementById('alignV2ColorsCount')!.textContent     = String(v2State.groups.colors.length);
    document.getElementById('alignV2DimensionsCount')!.textContent = String(v2State.groups.dimensions.length);
    document.getElementById('alignV2TypographyCount')!.textContent = String(v2State.groups.typography.length);

    renderV2Body();
  }

  // Toast
  const toast = document.createElement('div');
  toast.textContent = `${succeeded} updated${failed > 0 ? `, ${failed} failed` : ''}`;
  toast.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:6px 12px;border-radius:4px;font-size:11px;z-index:9999;';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── Toolbar: Check All ───────────────────────────────────────────────────────

document.getElementById('alignV2CheckAllBtn')?.addEventListener('click', () => {
  const groups = v2State.groups[v2State.activeTab];
  // Force Match (single button): if EVERY row is currently checked, uncheck them all
  // (toggle). Otherwise: for every row without a value, run closest-by-category force
  // match, then check every row.
  const allChecked = groups.length > 0 &&
    groups.every(g => v2State.checkedGroupKeys.has(g.groupKey));

  if (allChecked) {
    for (const g of groups) v2State.checkedGroupKeys.delete(g.groupKey);
  } else {
    for (const g of groups) {
      const hasValue = g.suggestion !== null || v2State.chosenOverrides.has(g.groupKey);
      if (!hasValue) {
        const candidate = pickClosestByCategory(g);
        if (candidate) {
          const candidateId = candidate.variableId ?? candidate.textStyleId;
          if (candidateId) {
            v2State.chosenOverrides.set(g.groupKey, candidateId);
            v2State.forceMatchedKeys.add(g.groupKey);
          } else {
            continue;
          }
        } else {
          continue;
        }
      }
      v2State.checkedGroupKeys.add(g.groupKey);
    }
  }
  renderV2Body();
});

// ─── Force Match: closest-value picker ───────────────────────────────────────

function pickClosestByCategory(g: V2Group): V2Group['allCandidates'][number] | null {
  if (g.allCandidates.length === 0) return null;

  const prop = g.property;
  const currentValue = g.currentValue;

  // ── Color ──────────────────────────────────────────────────────────────────
  // Detect by property name (Fill / Stroke) or hex-like currentValue
  const isColorProp = prop === 'Fill' || prop === 'Stroke';
  if (isColorProp) {
    // Extract last #RRGGBB or #RGB from currentValue
    const hexMatch = currentValue.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g);
    const lastHex = hexMatch ? hexMatch[hexMatch.length - 1] : null;
    if (!lastHex) return null;

    const parseHex = (h: string): [number, number, number] | null => {
      const clean = h.replace('#', '');
      if (clean.length === 3) {
        const r = parseInt(clean[0] + clean[0], 16);
        const g2 = parseInt(clean[1] + clean[1], 16);
        const b = parseInt(clean[2] + clean[2], 16);
        return [r, g2, b];
      }
      if (clean.length === 6) {
        return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
      }
      return null;
    };

    const srcRgb = parseHex(lastHex);
    if (!srcRgb) return null;

    let best: V2Group['allCandidates'][number] | null = null;
    let bestDist = Infinity;
    for (const c of g.allCandidates) {
      const hexVal = typeof c.value === 'string' ? c.value.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/)?.[0] ?? null : null;
      if (!hexVal) continue;
      const rgb = parseHex(hexVal);
      if (!rgb) continue;
      const dist = (srcRgb[0] - rgb[0]) ** 2 + (srcRgb[1] - rgb[1]) ** 2 + (srcRgb[2] - rgb[2]) ** 2;
      if (dist < bestDist) { bestDist = dist; best = c; }
    }
    return best;
  }

  // ── Typography ────────────────────────────────────────────────────────────
  // Typography currentValue format: "Family Style Npx" or similar — extract trailing number+px
  const isTypographyProp = prop === 'Text Style' || prop === 'Typography';
  if (isTypographyProp) {
    const sizeMatch = currentValue.match(/(\d+(?:\.\d+)?)px/);
    const srcSize = sizeMatch ? parseFloat(sizeMatch[1]) : NaN;
    if (isNaN(srcSize)) return null;

    let best: V2Group['allCandidates'][number] | null = null;
    let bestDist = Infinity;
    for (const c of g.allCandidates) {
      // candidate.value for typography is typically "Family Style Npx" or numeric
      let candSize: number = NaN;
      if (typeof c.value === 'number') {
        candSize = c.value;
      } else if (typeof c.value === 'string') {
        const m = c.value.match(/(\d+(?:\.\d+)?)px/);
        if (m) candSize = parseFloat(m[1]);
      }
      if (isNaN(candSize)) continue;
      const dist = Math.abs(srcSize - candSize);
      if (dist < bestDist) { bestDist = dist; best = c; }
    }
    return best;
  }

  // ── Dimensions (default) ──────────────────────────────────────────────────
  // Parse the leading numeric portion of currentValue: "24px" → 24, "S2AC / sizing / S (2px)" → 2
  // Strategy: find the first standalone integer/float in the string
  const numMatch = currentValue.match(/(\d+(?:\.\d+)?)/);
  const srcNum = numMatch ? parseFloat(numMatch[1]) : NaN;
  if (isNaN(srcNum)) return null;

  let best: V2Group['allCandidates'][number] | null = null;
  let bestDist = Infinity;
  for (const c of g.allCandidates) {
    let candNum: number = NaN;
    if (typeof c.value === 'number') {
      candNum = c.value;
    } else if (typeof c.value === 'string') {
      const m = c.value.match(/(\d+(?:\.\d+)?)/);
      if (m) candNum = parseFloat(m[1]);
    }
    if (isNaN(candNum)) continue;
    const dist = Math.abs(srcNum - candNum);
    if (dist < bestDist) { bestDist = dist; best = c; }
  }
  return best;
}
