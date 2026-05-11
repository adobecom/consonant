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

let v2State: { result: V2Result | null; activeTab: V2Tab; checkedKeys: Set<string>; chosenOverrides: Map<string, string> } = {
  result: null,
  activeTab: 'colors',
  checkedKeys: new Set(),
  chosenOverrides: new Map(),
};

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function keyOf(i: V2Issue): string {
  return `${i.nodeId}|${i.property}`;
}

function bindingKeyFor(property: string): string | undefined {
  switch (property) {
    case 'Top-Left Radius': return 'topLeftRadius';
    case 'Top-Right Radius': return 'topRightRadius';
    case 'Bottom-Left Radius': return 'bottomLeftRadius';
    case 'Bottom-Right Radius': return 'bottomRightRadius';
    case 'Padding Top': return 'paddingTop';
    case 'Padding Right': return 'paddingRight';
    case 'Padding Bottom': return 'paddingBottom';
    case 'Padding Left': return 'paddingLeft';
    case 'Item Spacing': return 'itemSpacing';
    case 'Stroke Weight': return 'strokeWeight';
    default: return undefined;
  }
}

export function renderAlignV2ScanResult(result: V2Result, selectionName: string, selectionType: string): void {
  v2State.result = result;
  v2State.activeTab = 'colors';
  v2State.checkedKeys = new Set();
  v2State.chosenOverrides = new Map();

  for (const tab of ['colors', 'dimensions', 'typography'] as const) {
    for (const issue of result[tab]) {
      if (issue.suggestion !== null) v2State.checkedKeys.add(keyOf(issue));
    }
  }

  document.getElementById('alignV2Selection')!.textContent = `${selectionName} (${selectionType})`;
  document.getElementById('alignV2Tabs')!.style.display = '';
  document.getElementById('alignV2Footer')!.style.display = 'flex';

  document.getElementById('alignV2ColorsCount')!.textContent = String(result.colors.length);
  document.getElementById('alignV2DimensionsCount')!.textContent = String(result.dimensions.length);
  document.getElementById('alignV2TypographyCount')!.textContent = String(result.typography.length);

  renderV2Body();
}

function renderV2Body(): void {
  const body = document.getElementById('alignV2Body')!;
  if (!v2State.result) { body.innerHTML = ''; return; }
  const issues = v2State.result[v2State.activeTab];

  if (issues.length === 0) {
    body.innerHTML = `<div style="padding:12px;color:var(--text-secondary);font-size:11px;">No issues in this tab.</div>`;
    updateV2Footer();
    return;
  }

  body.innerHTML = issues.map(issue => {
    const k = keyOf(issue);
    const checked = v2State.checkedKeys.has(k);
    const disabled = issue.suggestion === null;
    const chosen = v2State.chosenOverrides.get(k) ?? (issue.suggestion?.variableId ?? issue.suggestion?.textStyleId ?? '');
    const dropdownOpts = issue.allCandidates.map(c => {
      const id = c.variableId ?? c.textStyleId ?? '';
      return `<option value="${esc(id)}" ${id === chosen ? 'selected' : ''}>${esc(c.tokenName)}</option>`;
    }).join('');
    const suggestCell = disabled
      ? `<span style="color:var(--text-secondary)">No S2A token</span>`
      : `<select data-key="${esc(k)}">${dropdownOpts}</select>`;
    const badge = (!disabled && issue.suggestion?.isExactMatch) ? `<span class="v2-badge">Match</span>` : '';
    return `<div class="alignv2-row ${disabled ? 'disabled' : ''}" data-node-id="${esc(issue.nodeId)}">
      <input type="checkbox" data-key="${esc(k)}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
      <span class="v2-name">${esc(issue.nodeName)}</span>
      <span class="v2-prop">${esc(issue.property)}</span>
      <span class="v2-value">${esc(issue.currentValue)}</span>
      <span class="v2-arrow">→</span>
      ${suggestCell}
      ${badge}
    </div>`;
  }).join('');

  body.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-key]').forEach(cb => {
    cb.addEventListener('change', () => {
      const k = cb.dataset.key!;
      if (cb.checked) v2State.checkedKeys.add(k); else v2State.checkedKeys.delete(k);
      updateV2Footer();
    });
  });
  body.querySelectorAll<HTMLSelectElement>('select[data-key]').forEach(sel => {
    sel.addEventListener('change', () => {
      const k = sel.dataset.key!;
      v2State.chosenOverrides.set(k, sel.value);
    });
  });
  body.querySelectorAll<HTMLElement>('.alignv2-row[data-node-id]').forEach(row => {
    row.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'OPTION') return;
      const nid = row.dataset.nodeId;
      if (nid) parent.postMessage({ pluginMessage: { type: 'navigate-to-node', nodeId: nid } }, '*');
    });
  });

  updateV2Footer();
}

function updateV2Footer(): void {
  if (!v2State.result) return;
  const issues = v2State.result[v2State.activeTab];
  const checkedInTab = issues.filter(i => v2State.checkedKeys.has(keyOf(i))).length;
  document.getElementById('alignV2FooterCount')!.textContent = `Update ${checkedInTab} ${v2State.activeTab}.`;
  (document.getElementById('alignV2ApplyBtn') as HTMLButtonElement).disabled = checkedInTab === 0;
  (document.getElementById('alignV2ApplyBtn') as HTMLButtonElement).textContent = `Apply ${checkedInTab}`;
}

export function setV2ActiveTab(tab: V2Tab): void {
  v2State.activeTab = tab;
  document.querySelectorAll<HTMLElement>('.alignv2-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.v2tab === tab);
  });
  renderV2Body();
}

export function collectV2ApplySelections(): Array<{ nodeId: string; property: string; bindingKey?: string; variableId?: string; textStyleId?: string }> {
  if (!v2State.result) return [];
  const issues = v2State.result[v2State.activeTab];
  const out: Array<{ nodeId: string; property: string; bindingKey?: string; variableId?: string; textStyleId?: string }> = [];
  for (const issue of issues) {
    const k = keyOf(issue);
    if (!v2State.checkedKeys.has(k)) continue;
    const chosen = v2State.chosenOverrides.get(k) ?? (issue.suggestion?.variableId ?? issue.suggestion?.textStyleId);
    if (!chosen) continue;
    const isTextStyle = !!issue.suggestion?.textStyleId || issue.property === 'Text Style';
    out.push({
      nodeId: issue.nodeId,
      property: issue.property,
      bindingKey: bindingKeyFor(issue.property),
      ...(isTextStyle ? { textStyleId: chosen } : { variableId: chosen }),
    });
  }
  return out;
}

export function renderAlignV2ApplyResult(results: Array<{ nodeId: string; property: string; success: boolean; error?: string }>): void {
  const succeeded = results.filter(r => r.success).length;
  const failed = results.length - succeeded;
  if (v2State.result) {
    const successKeys = new Set(results.filter(r => r.success).map(r => `${r.nodeId}|${r.property}`));
    for (const tab of ['colors', 'dimensions', 'typography'] as const) {
      v2State.result[tab] = v2State.result[tab].filter(i => !successKeys.has(keyOf(i)));
      for (const k of Array.from(v2State.checkedKeys)) {
        if (successKeys.has(k)) v2State.checkedKeys.delete(k);
      }
    }
    document.getElementById('alignV2ColorsCount')!.textContent = String(v2State.result.colors.length);
    document.getElementById('alignV2DimensionsCount')!.textContent = String(v2State.result.dimensions.length);
    document.getElementById('alignV2TypographyCount')!.textContent = String(v2State.result.typography.length);
    renderV2Body();
  }
  const toast = document.createElement('div');
  toast.textContent = `${succeeded} updated${failed > 0 ? `, ${failed} failed` : ''}`;
  toast.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:6px 12px;border-radius:4px;font-size:11px;z-index:9999;';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
