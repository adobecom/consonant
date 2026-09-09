// ── Color Study (Block build) ─────────────────────────────────────────────
// Figma-right-rail style colour inspector backed by S2A tokens:
//   • Fill / Stroke / Effects of the selected layer (exactly one selected)
//   • Selection colours: every solid fill/stroke inside the selection, so the
//     UI can aggregate by distinct colour/token like Figma's "Selection colors"
//   • The S2A colour catalogue with light + dark values for the picker
// Apply binds a chosen variable to specific paints.
//
// Independent from align-v2 on purpose: Align audits what is off-token; this
// lists everything, bound or not.

import { getColorVarMap, detectNodeColorRole, ColorPropertyRole } from './tokens';
import { rgbToHex } from './utils';

export interface ColorStudyPaint {
  property: 'Fill' | 'Stroke';
  /** Index into node.fills / node.strokes. */
  paintIndex: number;
  hex: string;
  opacity: number;
  /** Grouping key for "same colour elsewhere": variable id when bound, else hex@opacity. */
  key: string;
  role: ColorPropertyRole;
  variableId?: string;
  tokenName?: string;
  /** True when the bound variable belongs to the loaded S2A catalogue. */
  isS2A: boolean;
  lightHex?: string;
  darkHex?: string;
}

export interface ColorStudyEffect {
  type: string;          // DROP_SHADOW | INNER_SHADOW | LAYER_BLUR | BACKGROUND_BLUR
  radius: number;
  hex?: string;          // shadows only
  opacity?: number;      // shadows only
  radiusTokenName?: string;
  colorTokenName?: string;
}

export interface ColorStudyLayer {
  nodeId: string;
  name: string;
  type: string;
  /** Short ancestor path below the studied root, e.g. "Promo Card › Plan Details". */
  path: string;
  /** True when the layer sits inside a component instance (binding creates an override). */
  inInstance: boolean;
  paints: ColorStudyPaint[];
}

export interface ColorStudySelected {
  nodeId: string;
  name: string;
  type: string;
  fills: ColorStudyPaint[];
  strokes: ColorStudyPaint[];
  effects: ColorStudyEffect[];
}

export interface ColorStudyToken {
  variableId: string;
  name: string;
  lightHex: string;
  darkHex: string;
  opacity: number;
  role: ColorPropertyRole | null;
  /** True for s2a/color/* names (the semantic set); false for _c2, primitives, etc. */
  semantic: boolean;
}

export interface ColorStudyResult {
  /** Present when exactly one layer is selected. */
  selected: ColorStudySelected | null;
  selectionCount: number;
  layers: ColorStudyLayer[];
  tokens: ColorStudyToken[];
  inspected: number;
}

function ancestorPath(node: SceneNode, root: SceneNode): { path: string; inInstance: boolean } {
  const names: string[] = [];
  let inInstance = false;
  let p: BaseNode | null = node.parent;
  while (p && p.type !== 'PAGE' && p.type !== 'DOCUMENT') {
    if (p.type === 'INSTANCE') inInstance = true;
    if (p.id === root.id) break;
    names.unshift(p.name);
    p = p.parent;
  }
  let q: BaseNode | null = root.parent;
  while (q && q.type !== 'PAGE' && q.type !== 'DOCUMENT') { if (q.type === 'INSTANCE') inInstance = true; q = q.parent; }
  if (root.type === 'INSTANCE' && node.id !== root.id) inInstance = true;
  return { path: names.slice(-2).join(' › '), inInstance };
}

function tokenRole(cv: { name: string; semanticRole: ColorPropertyRole | null }): ColorPropertyRole | null {
  if (cv.semanticRole) return cv.semanticRole;
  if (/\/surface\//i.test(cv.name)) return 'background'; // surface tokens are backgrounds here
  return null;
}

export function buildColorStudyCatalog(): ColorStudyToken[] {
  return getColorVarMap().map(cv => ({
    variableId: cv.variable.id,
    name: cv.name,
    lightHex: cv.hex,
    darkHex: cv.darkHex ?? cv.hex,
    opacity: cv.opacity,
    role: tokenRole(cv),
    semantic: /^s2a\/color\//i.test(cv.name),
  }));
}

async function variableName(id: string | undefined): Promise<string | undefined> {
  if (!id) return undefined;
  try { const v = await figma.variables.getVariableByIdAsync(id); return v ? v.name : '(unknown variable)'; }
  catch { return '(unknown variable)'; }
}

async function describePaints(node: SceneNode, arrKey: 'fills' | 'strokes'): Promise<ColorStudyPaint[]> {
  const arr = (node as any)[arrKey];
  if (!Array.isArray(arr)) return []; // figma.mixed or unsupported node
  const property: 'Fill' | 'Stroke' = arrKey === 'fills' ? 'Fill' : 'Stroke';
  const role = detectNodeColorRole(node, arrKey === 'fills' ? 'fill' : 'stroke');
  const byVarId = new Map(getColorVarMap().map(cv => [cv.variable.id, cv] as const));
  const out: ColorStudyPaint[] = [];
  for (let i = 0; i < arr.length; i++) {
    const p = arr[i] as Paint;
    if (p.type !== 'SOLID' || p.visible === false) continue;
    const hex = rgbToHex(p.color.r, p.color.g, p.color.b);
    const opacity = typeof p.opacity === 'number' ? p.opacity : 1;
    const boundId: string | undefined = (p as any).boundVariables?.color?.id;
    const paint: ColorStudyPaint = {
      property, paintIndex: i, hex, opacity, role,
      key: boundId ? `var:${boundId}` : `${hex}@${Math.round(opacity * 100)}`,
      isS2A: false,
    };
    if (boundId) {
      paint.variableId = boundId;
      const cv = byVarId.get(boundId);
      if (cv) {
        paint.isS2A = true;
        paint.tokenName = cv.name;
        paint.lightHex = cv.hex;
        paint.darkHex = cv.darkHex ?? cv.hex;
      } else {
        paint.tokenName = await variableName(boundId);
      }
    }
    out.push(paint);
  }
  return out;
}

async function describeEffects(node: SceneNode): Promise<ColorStudyEffect[]> {
  const arr = (node as any).effects;
  if (!Array.isArray(arr)) return [];
  const out: ColorStudyEffect[] = [];
  for (const e of arr as Effect[]) {
    if (e.visible === false) continue;
    const bv = (e as any).boundVariables || {};
    const item: ColorStudyEffect = {
      type: e.type,
      radius: (e as any).radius ?? 0,
      radiusTokenName: await variableName(bv.radius?.id),
    };
    if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
      item.hex = rgbToHex(e.color.r, e.color.g, e.color.b);
      item.opacity = e.color.a;
      item.colorTokenName = await variableName(bv.color?.id);
    }
    out.push(item);
  }
  return out;
}

/** Study the current selection: each root plus all visible descendants. */
export async function runColorStudy(roots: readonly SceneNode[]): Promise<ColorStudyResult> {
  const seen = new Set<string>();
  const layers: ColorStudyLayer[] = [];
  let inspected = 0;

  for (const root of roots) {
    const nodes: SceneNode[] = [root];
    if ('findAll' in root) nodes.push(...(root as ChildrenMixin & SceneNode).findAll(n => n.visible));
    for (const node of nodes) {
      if (seen.has(node.id)) continue;
      seen.add(node.id);
      inspected++;
      const paints = [...await describePaints(node, 'fills'), ...await describePaints(node, 'strokes')];
      if (paints.length === 0) continue;
      const { path, inInstance } = ancestorPath(node, root);
      layers.push({ nodeId: node.id, name: node.name, type: node.type, path, inInstance, paints });
    }
  }

  let selected: ColorStudySelected | null = null;
  if (roots.length === 1) {
    const n = roots[0];
    selected = {
      nodeId: n.id, name: n.name, type: n.type,
      fills: await describePaints(n, 'fills'),
      strokes: await describePaints(n, 'strokes'),
      effects: await describeEffects(n),
    };
  }

  return { selected, selectionCount: roots.length, layers, tokens: buildColorStudyCatalog(), inspected };
}

export interface ColorStudyTarget { nodeId: string; property: 'Fill' | 'Stroke'; paintIndex: number }
export interface ColorStudyApplyResult { nodeId: string; property: string; success: boolean; error?: string }

/** Bind one variable to each target paint. Other paints on the node are left as they are. */
export async function applyColorStudy(targets: ColorStudyTarget[], variableId: string): Promise<ColorStudyApplyResult[]> {
  const results: ColorStudyApplyResult[] = [];
  const variable = await figma.variables.getVariableByIdAsync(variableId);
  if (!variable) return targets.map(t => ({ nodeId: t.nodeId, property: t.property, success: false, error: 'Variable not found' }));

  for (const t of targets) {
    try {
      const node = await figma.getNodeByIdAsync(t.nodeId);
      if (!node) { results.push({ nodeId: t.nodeId, property: t.property, success: false, error: 'Node not found' }); continue; }
      const arrKey = t.property === 'Fill' ? 'fills' : 'strokes';
      const arr = (node as any)[arrKey] as Paint[] | undefined;
      if (!Array.isArray(arr) || !arr[t.paintIndex] || arr[t.paintIndex].type !== 'SOLID') {
        results.push({ nodeId: t.nodeId, property: t.property, success: false, error: 'No solid paint at that index' });
        continue;
      }
      const next = arr.slice();
      next[t.paintIndex] = figma.variables.setBoundVariableForPaint(arr[t.paintIndex] as SolidPaint, 'color', variable);
      (node as any)[arrKey] = next;
      results.push({ nodeId: t.nodeId, property: t.property, success: true });
    } catch (e: any) {
      results.push({ nodeId: t.nodeId, property: t.property, success: false, error: e?.message ?? String(e) });
    }
  }
  return results;
}
