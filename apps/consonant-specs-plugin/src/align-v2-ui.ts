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
  // Sort groups alphabetically; within each group, sort by numeric value when
  // both items have numbers (dimensions), otherwise by leaf name alphabetically.
  const sortedGroupKeys = Array.from(groups.keys()).sort();

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
      const { leaf } = splitTokenPath(c.tokenName);
      // Format value for direct comparison with currentValue: numbers → "Npx", strings → as-is.
      let valuePart = '';
      if (typeof c.value === 'number') valuePart = ` ${c.value}px`;
      else if (typeof c.value === 'string' && c.value !== '') valuePart = ` ${c.value}`;
      const optionLabel = `${leaf}${valuePart}`;
      out += `<option value="${esc(id)}" ${id === chosen ? 'selected' : ''}>${esc(optionLabel)}</option>`;
    }
    out += `</optgroup>`;
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
  flex-shrink: 0;
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
`;
  document.head.appendChild(style);
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

    const dropdownOpts = buildGroupedDropdownOptions(group.allCandidates, chosen);

    // "No S2A token" rows: show a dropdown with a placeholder so the user can manually pick
    const noSuggestionDropdown = disabled && group.allCandidates.length > 0
      ? `<select data-group-key="${gk}" data-no-suggestion="1"><option value="" disabled ${!chosen ? 'selected' : ''}>Select a token…</option>${dropdownOpts}</select>`
      : null;

    const suggestCell = noSuggestionDropdown
      ? noSuggestionDropdown
      : disabled
        ? `<span style="color:var(--text-secondary)">No S2A token</span>`
        : `<select data-group-key="${gk}">${dropdownOpts}</select>`;

    const badge = (!disabled && group.suggestion?.isExactMatch)
      ? `<span class="v2-badge">Match</span>`
      : '';

    const countBadge = group.items.length > 1
      ? `<span class="v2-count">${group.items.length} items</span>`
      : '';

    // Use the first item's nodeId for navigation click (representative node)
    const firstNodeId = esc(group.items[0]?.nodeId ?? '');

    // For no-suggestion rows that have candidates: checkbox starts disabled+unchecked,
    // but becomes enabled once the user picks a token from the dropdown.
    const isPickable = disabled && noSuggestionDropdown !== null;
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

  // Dropdown listeners
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

  // Row click → navigate to the first node in the group
  body.querySelectorAll<HTMLElement>('.alignv2-group[data-first-node-id]').forEach(row => {
    row.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'OPTION') return;
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
  (document.getElementById('alignV2ApplyBtn') as HTMLButtonElement).textContent = `Apply ${groupCount}`;
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
