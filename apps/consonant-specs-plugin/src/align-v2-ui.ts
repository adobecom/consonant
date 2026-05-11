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
  allCandidates: Array<{ tokenName: string; variableId?: string; textStyleId?: string; value: string | number }>;
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
} = {
  result: null,
  activeTab: 'colors',
  groups: { colors: [], dimensions: [], typography: [] },
  checkedGroupKeys: new Set(),
  chosenOverrides: new Map(),
};

// ─── Color popover open state ────────────────────────────────────────────────

let v2OpenPopover: { groupKey: string; el: HTMLElement } | null = null;

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
  return { group: tokenName.slice(0, lastSlash), leaf: tokenName.slice(lastSlash + 1) };
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
    's2a/spacing',
    's2a/layout',
    's2a/border/radius',
    's2a/border/width',
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

/**
 * Build the inner HTML for a color popover (grouped buttons with swatches).
 * Uses the same group priority + sort logic as buildGroupedDropdownOptions.
 */
function buildColorPopoverContent(
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

  const GROUP_PRIORITY: string[] = [
    's2a/spacing',
    's2a/layout',
    's2a/border/radius',
    's2a/border/width',
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
    out += `<div class="v2-color-group-header">${esc(groupLabel)}</div>`;
    for (const c of items) {
      const id = c.variableId ?? c.textStyleId ?? '';
      const isHex = typeof c.value === 'string' && (c.value as string).startsWith('#');
      const hexVal = isHex ? (c.value as string) : '#cccccc';
      const { leaf } = splitTokenPath(c.tokenName);
      let valuePart = '';
      if (typeof c.value === 'string' && c.value !== '') valuePart = ` (${c.value})`;
      const optLabel = `${leaf}${valuePart}`;
      const selectedAttr = id === chosen ? ' data-selected="1"' : '';
      out += `<button class="v2-color-option${id === chosen ? ' v2-color-option-selected' : ''}" data-id="${esc(id)}"${selectedAttr}>`;
      out += `<span class="v2-color-swatch" style="background-color:${esc(hexVal)}"></span>`;
      out += `<span class="v2-color-option-label">${esc(optLabel)}</span>`;
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
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 140px;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 4px;
  padding: 3px 8px;
  box-sizing: border-box;
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
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--success-bg, #e6f4ea);
  color: var(--success, #137333);
}
.alignv2-group-line2 .v2-badge.v2-badge-muted {
  background: var(--bg-secondary, #f0f0f0);
  color: var(--text-secondary, #999);
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
.v2-color-popover {
  position: fixed;
  background: var(--bg, #fff);
  border: 1px solid var(--border, #e5e5e5);
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  max-height: 320px;
  overflow-y: auto;
  z-index: 10000;
  min-width: 220px;
  padding: 4px 0;
  font-size: 11px;
}
.v2-color-popover .v2-color-group-header {
  padding: 4px 10px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.v2-color-popover .v2-color-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 10px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}
.v2-color-popover .v2-color-option:hover {
  background: var(--hover-bg, #f0f0f0);
}
.v2-color-popover .v2-color-option.v2-color-option-selected {
  background: var(--hover-bg, #f0f0f0);
}
.v2-color-popover .v2-color-option-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
    const disabled = group.suggestion === null;
    const chosen = v2State.chosenOverrides.get(group.groupKey)
      ?? (group.suggestion?.variableId ?? group.suggestion?.textStyleId ?? '');

    const isColorRow = group.property === 'Fill' || group.property === 'Stroke';

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

    // Always render a badge for consistent right-edge alignment.
    // Green "Match" when the suggestion exactly matches the current value;
    // muted/grayed placeholder otherwise.
    const badge = (!disabled && group.suggestion?.isExactMatch)
      ? `<span class="v2-badge">Match</span>`
      : `<span class="v2-badge v2-badge-muted">Match</span>`;

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
    <span class="v2-value">${esc(group.currentValue)}</span>
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

      const chosenVal = v2State.chosenOverrides.get(k)
        ?? (grp.suggestion?.variableId ?? grp.suggestion?.textStyleId ?? '');

      // Build popover
      const popover = document.createElement('div');
      popover.className = 'v2-color-popover';
      popover.dataset.forGroupKey = k;
      popover.innerHTML = buildColorPopoverContent(grp.allCandidates, chosenVal);

      // Position below the button
      const rect = btn.getBoundingClientRect();
      popover.style.top = `${rect.bottom + 2}px`;
      popover.style.left = `${rect.left}px`;
      popover.style.minWidth = `${Math.max(rect.width, 220)}px`;

      document.body.appendChild(popover);
      v2OpenPopover = { groupKey: k, el: popover };

      // Option click listeners
      popover.querySelectorAll<HTMLButtonElement>('button.v2-color-option').forEach(opt => {
        opt.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const val = opt.dataset.id!;
          if (!val) return;

          v2State.chosenOverrides.set(k, val);

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
