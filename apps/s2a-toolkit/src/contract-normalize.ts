// contract-normalize.ts — Build set, golden first. When the contract's anchor
// resolves in this file, the design already exists: clone it (pixels stay
// exactly what the designer drew), then apply the contract on top:
//   • layers named after the anatomy (.root, .media, .headline …)
//   • component properties wired to the layers they drive, with the golden's
//     own text as each TEXT default
//   • tokens bound only where the drawn value already equals the token's
//     resolved value; every mismatch is reported as drift, never painted over
//   • a component (or the cloned set) inside a named Section
// Scaffolding from the dictionary (contract-build.ts) is the fallback for
// contracts whose anchor is not in the file.
import type { FigmaPlan, PlanLayer, BuildReport } from './contract-build';

export interface NormalizeReport extends BuildReport {
  sourceId: string;
  mode: 'normalize' | 'adopt';
  renamed: Array<{ from: string; to: string }>;
  drift: Array<{ layer: string; property: string; drawn: string; token: string; tokenValue: string }>;
  adopted: Array<{ layer: string; property: string; drawn: string; token: string; tokenValue: string }>;
  unmapped: string[];
}
export interface NormalizeOptions {
  // adopt: where the drawn value disagrees with the token, bind anyway so the
  // value snaps to the system (recorded under `adopted`). Default: leave the
  // pixels alone and report the gap under `drift`.
  adopt?: boolean;
}

type PlanWithSource = FigmaPlan & { anchors?: { nodeId?: string | null; kind?: string }; anatomy: PlanLayer & { source?: string | null } };
type SourceLayer = PlanLayer & { source?: string | null; children: SourceLayer[] };

const CSS_TO_FIELD: Record<string, string[]> = {
  'background-color': ['fills'], background: ['fills'], color: ['fills'],
  padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  'padding-top': ['paddingTop'], 'padding-right': ['paddingRight'], 'padding-bottom': ['paddingBottom'], 'padding-left': ['paddingLeft'],
  gap: ['itemSpacing'], 'border-radius': ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'],
  'border-color': ['strokes'], 'border-width': ['strokeWeight'],
  'font-size': ['fontSize'], 'line-height': ['lineHeight'], 'letter-spacing': ['letterSpacing'], 'font-family': ['fontFamily'], 'font-weight': ['fontStyle'],
};
const hex = (c: RGB | RGBA): string => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('') + ('a' in c && c.a !== undefined && c.a < 1 ? Math.round(c.a * 100) + '%' : '');
const near = (a: number, b: number, tol = 0.5): boolean => Math.abs(a - b) <= tol;
const colorNear = (a: RGB | RGBA, b: RGB | RGBA): boolean => near(a.r, b.r, 2 / 255) && near(a.g, b.g, 2 / 255) && near(a.b, b.b, 2 / 255) && near(('a' in a ? a.a : 1) ?? 1, ('a' in b ? b.a : 1) ?? 1, 0.02);

// Resolve an evidence path ("/Copy >/Headline") inside a node. Layer names may
// themselves contain "/" ("Meta/Name"), so try the longest prefix first.
function byPath(root: SceneNode, path: string): SceneNode | null {
  const segs = path.replace(/^\//, '').split('/').filter(Boolean);
  let node: SceneNode = root;
  let i = 0;
  while (i < segs.length) {
    if (!('children' in node)) return null;
    let hit: SceneNode | null = null, used = 0;
    for (let len = segs.length - i; len >= 1 && !hit; len--) {
      const name = segs.slice(i, i + len).join('/');
      hit = (node as ChildrenMixin).children.find(c => c.name === name) ?? null;
      if (hit) used = len;
    }
    if (!hit) return null;
    node = hit; i += used;
  }
  return node;
}

export async function normalizeFromSource(plan: PlanWithSource, options: NormalizeOptions = {}): Promise<NormalizeReport> {
  const adopt = Boolean(options.adopt);
  const report: NormalizeReport = { set: '', setId: '', sourceId: plan.anchors?.nodeId ?? '', mode: adopt ? 'adopt' : 'normalize', variants: 0, layers: 0, boundVariables: 0, unresolvedVariables: [], stylesApplied: 0, stylesMissing: [], properties: 0, notes: [], renamed: [], drift: [], adopted: [], unmapped: [] };
  const src = plan.anchors?.nodeId ? await figma.getNodeByIdAsync(plan.anchors.nodeId) : null;
  if (!src || !('clone' in src)) throw new Error(`anchor ${plan.anchors?.nodeId ?? '(none)'} is not in this file; use the dictionary scaffold instead`);

  // Variables and styles, prefetched; names resolve exact → normalised.
  const [variables, styles] = await Promise.all([figma.variables.getLocalVariablesAsync(), figma.getLocalTextStylesAsync()]);
  const norm = (s: string): string => s.toLowerCase().replace(/^s2a[/-]/, '').replace(/[^a-z0-9]/g, '');
  const byName = new Map<string, Variable>(), byNorm = new Map<string, Variable>();
  for (const v of variables) { byName.set(v.name, v); if (!byNorm.has(norm(v.name))) byNorm.set(norm(v.name), v); }
  const findVar = (name: string): Variable | null => { const v = byName.get(name) ?? byNorm.get(norm(name)) ?? null; if (!v) report.unresolvedVariables.push(name); return v; };
  const styleByName = new Map<string, TextStyle>();
  for (const st of styles) { styleByName.set(st.name, st); styleByName.set(st.name.split('/').pop() ?? st.name, st); }
  const fontsNeeded = new Set<string>();

  // 1. Clone the golden into a named section. A frame becomes a component; a
  //    component or set is kept as it is.
  const page = figma.currentPage;
  let maxX = 0, minY = Infinity;
  for (const n of page.children) { if ('x' in n) { maxX = Math.max(maxX, n.x + n.width); minY = Math.min(minY, n.y); } }
  if (!isFinite(minY)) minY = 0;
  const section = figma.createSection();
  section.name = `Contracts / ${plan.component} (${adopt ? 'tokenized' : 'normalized'})`;
  page.appendChild(section);
  section.x = maxX + 200; section.y = minY;
  const clone = (src as SceneNode & { clone(): SceneNode }).clone();
  section.appendChild(clone);
  clone.x = 40; clone.y = 80;
  let host: ComponentNode | ComponentSetNode;
  if (clone.type === 'COMPONENT' || clone.type === 'COMPONENT_SET') host = clone;
  else if (clone.type === 'FRAME' || clone.type === 'INSTANCE') host = figma.createComponentFromNode(clone.type === 'INSTANCE' ? await (clone as InstanceNode).detachInstance() : clone);
  else throw new Error(`cannot normalise a ${clone.type}`);
  host.name = plan.component;
  section.resizeWithoutConstraints(host.width + 80, host.height + 120);
  const variants: SceneNode[] = host.type === 'COMPONENT_SET' ? [...host.children] : [host];

  // 2. Map anatomy parts to source layers (per variant), wire properties to
  //    them while the source names are still intact, then rename.
  const parts: Array<{ layer: SourceLayer; canonical: string }> = [];
  const collect = (l: SourceLayer, canonical: string): void => { if (l.source) parts.push({ layer: l, canonical }); for (const c of l.children ?? []) collect(c as SourceLayer, c.name); };
  for (const c of (plan.anatomy.children ?? []) as SourceLayer[]) collect(c, c.name);

  // A mismatch either stays as drift (normalize) or is bound anyway (adopt).
  const mismatch = (entry: { layer: string; property: string; drawn: string; token: string; tokenValue: string }, bind: () => void): void => {
    if (!adopt) { report.drift.push(entry); return; }
    try { bind(); report.boundVariables++; report.adopted.push(entry); } catch (err: any) { report.notes.push(`${entry.layer}.${entry.property}: ${err?.message || err}`); report.drift.push(entry); }
  };
  const bindIfEqual = (target: SceneNode, layerName: string, bindings: Record<string, string[]>): void => {
    let node: SceneNode = target;
    for (const [cssProp, names] of Object.entries(bindings)) {
      const fields = CSS_TO_FIELD[cssProp]; if (!fields || !names.length) continue;
      fields.forEach((field, i) => {
        const v = findVar(names.length === 1 ? names[0] : cssProp === 'padding' && names.length === 2 ? (i % 2 === 0 ? names[0] : names[1]) : names[Math.min(i, names.length - 1)]);
        if (!v) return;
        const resolved = v.resolveForConsumer(node);
        const val = resolved?.value;
        try {
          if (field === 'fills' || field === 'strokes') {
            // An icon instance carries its colour on the glyph inside, not on the frame.
            let painted: SceneNode = node;
            if (!(((node as any)[field] as Paint[]) || []).some(p => p.type === 'SOLID') && 'findOne' in node) {
              const glyph = (node as any).findOne((x: SceneNode) => (x.type === 'VECTOR' || x.type === 'BOOLEAN_OPERATION') && (((x as any)[field] as Paint[]) || []).some(p => p.type === 'SOLID')) as SceneNode | null;
              if (glyph) painted = glyph;
            }
            node = painted;
            const paints = ((node as any)[field] as Paint[]) || [];
            const solid = paints.find(p => p.type === 'SOLID') as SolidPaint | undefined;
            if (!solid) { report.drift.push({ layer: layerName, property: cssProp, drawn: paints.length ? paints[0].type.toLowerCase() : 'none', token: v.name, tokenValue: typeof val === 'object' && val && 'r' in val ? hex(val as RGBA) : String(val) }); return; }
            const drawn: RGBA = { ...solid.color, a: solid.opacity ?? 1 };
            if (typeof val === 'object' && val && 'r' in val && colorNear(drawn, val as RGBA)) {
              (node as any)[field] = paints.map(p => p === solid ? figma.variables.setBoundVariableForPaint(solid, 'color', v) : p);
              report.boundVariables++;
            } else mismatch({ layer: layerName, property: cssProp, drawn: hex(drawn), token: v.name, tokenValue: typeof val === 'object' && val && 'r' in val ? hex(val as RGBA) : String(val) }, () => {
              // Overwrite the literal with the token's resolved colour (bound-variable literal gotcha).
              const lit = val as RGBA;
              (node as any)[field] = paints.map(p => p === solid ? figma.variables.setBoundVariableForPaint({ ...solid, color: { r: lit.r, g: lit.g, b: lit.b }, opacity: lit.a ?? 1 }, 'color', v) : p);
            });
          } else if (field === 'fontFamily' || field === 'fontStyle') {
            if (node.type !== 'TEXT') return;
            const fn = (node as TextNode).fontName as FontName;
            const drawn = field === 'fontFamily' ? fn.family : fn.style;
            if (String(val).toLowerCase() === String(drawn).toLowerCase()) { (node as TextNode).setBoundVariable(field as any, v); report.boundVariables++; }
            else mismatch({ layer: layerName, property: cssProp, drawn: String(drawn), token: v.name, tokenValue: String(val) }, () => { (node as TextNode).setBoundVariable(field as any, v); });
          } else if (field === 'fontSize' || field === 'lineHeight' || field === 'letterSpacing') {
            if (node.type !== 'TEXT') return;
            const t = node as TextNode;
            const drawn = field === 'fontSize' ? (t.fontSize as number) : field === 'lineHeight' ? ((t.lineHeight as any).value ?? NaN) : ((t.letterSpacing as any).value ?? NaN);
            if (typeof val === 'number' && near(drawn, val)) { t.setBoundVariable(field as any, v); report.boundVariables++; }
            else mismatch({ layer: layerName, property: cssProp, drawn: String(Math.round(drawn * 100) / 100), token: v.name, tokenValue: String(val) }, () => { t.setBoundVariable(field as any, v); });
          } else {
            const drawn = (node as any)[field];
            if (typeof drawn !== 'number' || typeof val !== 'number') { report.drift.push({ layer: layerName, property: cssProp, drawn: String(drawn), token: v.name, tokenValue: String(val) }); return; }
            if (near(drawn, val)) { (node as any).setBoundVariable(field, v); report.boundVariables++; }
            else mismatch({ layer: layerName, property: cssProp, drawn: String(Math.round(drawn * 100) / 100), token: v.name, tokenValue: String(val) }, () => { (node as any).setBoundVariable(field, v); });
          }
        } catch (err: any) { report.notes.push(`${layerName}.${field}: ${err?.message || err}`); }
      });
    }
  };

  const resolved: Array<{ variant: SceneNode; nodes: Map<string, SceneNode> }> = [];
  for (const variant of variants) {
    const nodes = new Map<string, SceneNode>();
    for (const { layer, canonical } of parts) {
      const n = byPath(variant, layer.source!);
      if (n) nodes.set(canonical, n); else report.unmapped.push(`${variant === host ? '' : variant.name + ' '}${layer.source} → ${canonical}`);
    }
    resolved.push({ variant, nodes });
  }

  // Properties first (source paths still valid). TEXT defaults are the golden's own words.
  const stripId = (n: string): string => n.replace(/#\d+:\d+$/, '');
  const existingProps = new Set(Object.keys(host.componentPropertyDefinitions ?? {}));
  for (const prop of plan.properties.filter(p => p.type !== 'VARIANT')) {
    const name = stripId(prop.name);
    // A property the source already defines is carried by the clone as it is.
    if (existingProps.has(prop.name)) { report.properties++; continue; }
    try {
      const targets = resolved.map(r => ({ r, node: prop.layer ? byPath(r.variant, prop.layer) ?? (prop.layer.startsWith('.') ? r.nodes.get(prop.layer.split('/').pop()!.replace(/^\./, '')) ?? null : null) : null }));
      const textNode = (n: SceneNode | null): TextNode | null => !n ? null : n.type === 'TEXT' ? n : ('findOne' in n ? (n as any).findOne((x: SceneNode) => x.type === 'TEXT') as TextNode | null : null);
      if (prop.type === 'TEXT') {
        const first = textNode(targets[0]?.node ?? null);
        if (!first) { report.notes.push(`property ${name}: no text layer at ${prop.layer ?? '(no layer)'}`); continue; }
        let p: BaseNode | null = first.parent; let inInstance = false;
        while (p && p.type !== 'COMPONENT' && p.type !== 'PAGE') { if (p.type === 'INSTANCE') { inInstance = true; break; } p = p.parent; }
        if (inInstance) { report.notes.push(`property ${name}: text sits inside a nested instance; expose that instance's text property instead`); continue; }
        const key = host.addComponentProperty(name, 'TEXT', first.characters || name);
        report.properties++;
        for (const t of targets) { const tn = textNode(t.node); if (tn) tn.componentPropertyReferences = { ...(tn.componentPropertyReferences || {}), characters: key }; }
      } else if (prop.type === 'BOOLEAN') {
        if (!targets[0]?.node) { report.notes.push(`property ${name}: no layer at ${prop.layer ?? '(no layer)'}`); continue; }
        const key = host.addComponentProperty(name, 'BOOLEAN', prop.defaultValue !== false);
        report.properties++;
        for (const t of targets) if (t.node) t.node.componentPropertyReferences = { ...(t.node.componentPropertyReferences || {}), visible: key };
      } else if (prop.type === 'INSTANCE_SWAP') {
        const inst = targets[0]?.node && targets[0].node.type === 'INSTANCE' ? targets[0].node as InstanceNode : null;
        if (!inst) { report.notes.push(`property ${name}: ${prop.layer ?? '(no layer)'} is raw layers, not an instance; place a library instance there before it can swap`); continue; }
        const main = await inst.getMainComponentAsync();
        if (!main) { report.notes.push(`property ${name}: instance has no main component`); continue; }
        const key = host.addComponentProperty(name, 'INSTANCE_SWAP', main.id);
        report.properties++;
        for (const t of targets) if (t.node && t.node.type === 'INSTANCE') t.node.componentPropertyReferences = { ...(t.node.componentPropertyReferences || {}), mainComponent: key };
      }
    } catch (err: any) { report.notes.push(`property ${name}: ${err?.message || err}`); }
  }

  // Rename, bind-if-equal, and apply text styles only where the drawn type already matches.
  for (const { variant, nodes } of resolved) {
    if (variant.type === 'COMPONENT' && host.type === 'COMPONENT') { /* root keeps the component name */ }
    for (const { layer, canonical } of parts) {
      const n = nodes.get(canonical); if (!n) continue;
      if (n.name !== canonical) { report.renamed.push({ from: n.name, to: canonical }); n.name = canonical; }
      bindIfEqual(n, canonical, layer.bindings);
      const sizeVar = layer.bindings['font-size']?.[0];
      if (n.type === 'TEXT' && sizeVar) {
        const styleName = sizeVar.replace('typography/font-size/', 'typography/');
        const st = styleByName.get(styleName) ?? styleByName.get(styleName.split('/').pop() ?? '') ?? null;
        const t = n as TextNode; const fn = t.fontName as FontName;
        const styleEntry = st ? { layer: canonical, property: 'text-style', drawn: `${fn.family} ${fn.style} ${Math.round(t.fontSize as number)}`, token: st.name, tokenValue: `${st.fontName.family} ${st.fontName.style} ${st.fontSize}` } : null;
        if (st && st.fontName.family === fn.family && st.fontName.style === fn.style && near(st.fontSize, t.fontSize as number)) {
          fontsNeeded.add(JSON.stringify(fn));
          await figma.loadFontAsync(fn);
          await t.setTextStyleIdAsync(st.id); report.stylesApplied++;
        } else if (st && adopt) {
          // Adopt the style: the text takes the system's family, weight, size and leading.
          await figma.loadFontAsync(fn); await figma.loadFontAsync(st.fontName);
          await t.setTextStyleIdAsync(st.id); report.stylesApplied++; report.adopted.push(styleEntry!);
        } else if (st) report.drift.push(styleEntry!);
        else report.stylesMissing.push(styleName);
      }
      report.layers++;
    }
    bindIfEqual(variant, '.root', plan.anatomy.bindings);
  }

  report.set = host.name; report.setId = host.id; report.variants = variants.length;
  report.unresolvedVariables = [...new Set(report.unresolvedVariables)];
  figma.currentPage.selection = [host];
  figma.viewport.scrollAndZoomIntoView([host]);
  return report;
}
