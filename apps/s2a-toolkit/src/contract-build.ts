// contract-build.ts — build a component set in Figma from a contract's
// figma.plan.json (packages/specs/out/<slug>/figma.plan.json).
//
// Deterministic scaffold, not a finished design: variants from the VARIANT
// axes, named layers from the anatomy in the repo's naming rules (.root, .part),
// auto layout, variables bound by name, text styles applied by name, TEXT /
// BOOLEAN / INSTANCE_SWAP properties wired to the layers they drive, everything
// placed in a named Section. Art and slot contents stay for the designer.
// Follows the figma_execute rules in CLAUDE.md: fonts loaded first, variables
// prefetched, appendChild before FILL sizing, combineAsVariants then reposition,
// never floating on the canvas.

export interface PlanLayer {
  name: string;
  element: string | null;
  bindings: Record<string, string[]>;   // css property → Figma variable names
  slot: { name: string; accepts: string[]; mode: string } | null;
  children: PlanLayer[];
}
export interface FigmaPlan {
  component: string;
  setName: string;
  anatomy: PlanLayer;
  properties: Array<{ name: string; type: 'VARIANT' | 'TEXT' | 'BOOLEAN' | 'INSTANCE_SWAP'; options?: string[]; defaultValue?: unknown; forProp?: string; layer?: string; derived?: boolean }>;
  textStyles: string[];
}
export interface BuildReport {
  set: string; setId: string; variants: number; layers: number; boundVariables: number;
  unresolvedVariables: string[]; stylesApplied: number; stylesMissing: string[]; properties: number; notes: string[];
}

const TEXT_ELEMENTS = /^(p|span|h[1-6]|a|button|label|blockquote|cite|small|strong|em)$/;
const ROW_LAYERS = /actions|footer|attribution|row|meta|lockup|controls|nav/i;

const CSS_TO_FIGMA: Record<string, string[]> = {
  'background-color': ['fills'], background: ['fills'], color: ['fills'],
  padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  'padding-top': ['paddingTop'], 'padding-right': ['paddingRight'], 'padding-bottom': ['paddingBottom'], 'padding-left': ['paddingLeft'],
  'padding-inline': ['paddingLeft', 'paddingRight'], 'padding-block': ['paddingTop', 'paddingBottom'],
  gap: ['itemSpacing'], 'row-gap': ['counterAxisSpacing'], 'column-gap': ['itemSpacing'],
  'border-radius': ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'],
  'border-width': ['strokeWeight'], 'border-color': ['strokes'], border: ['strokes'],
  width: ['width'], height: ['height'], 'min-height': ['minHeight'], 'min-width': ['minWidth'],
  'font-size': ['fontSize'], 'line-height': ['lineHeight'], 'letter-spacing': ['letterSpacing'], 'font-family': ['fontFamily'], 'font-weight': ['fontStyle'],
};

function combos(axes: Array<{ name: string; options: string[] }>): Array<Record<string, string>> {
  let out: Array<Record<string, string>> = [{}];
  for (const a of axes) {
    const next: Array<Record<string, string>> = [];
    for (const c of out) for (const o of a.options) next.push({ ...c, [a.name]: o });
    out = next;
  }
  return out.slice(0, 24);
}

const cleanName = (n: string): string => n.replace(/^\./, '');
const toTitle = (n: string): string => cleanName(n).replace(/[-_]/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());

export async function buildSetFromPlan(plan: FigmaPlan): Promise<BuildReport> {
  const report: BuildReport = { set: '', setId: '', variants: 0, layers: 0, boundVariables: 0, unresolvedVariables: [], stylesApplied: 0, stylesMissing: [], properties: 0, notes: [] };

  // Fonts first (every text touch needs them); missing fonts fall back to Inter.
  const fonts: FontName[] = [
    { family: 'Adobe Clean', style: 'Regular' }, { family: 'Adobe Clean', style: 'Bold' },
    { family: 'Adobe Clean Display', style: 'Black' }, { family: 'Inter', style: 'Regular' }, { family: 'Inter', style: 'Bold' },
  ];
  const loaded: FontName[] = [];
  for (const f of fonts) { try { await figma.loadFontAsync(f); loaded.push(f); } catch { /* not installed */ } }
  const fallbackFont = loaded.find(f => f.family === 'Inter' && f.style === 'Regular') ?? loaded[0];
  if (!fallbackFont) throw new Error('No font could be loaded (Adobe Clean or Inter)');

  // Prefetch variables and styles once; bind synchronously afterwards.
  const [variables, styles] = await Promise.all([figma.variables.getLocalVariablesAsync(), figma.getLocalTextStylesAsync()]);
  const byName = new Map<string, Variable>();
  for (const v of variables) byName.set(v.name, v);
  const styleByName = new Map<string, TextStyle>();
  for (const st of styles) { styleByName.set(st.name, st); styleByName.set(st.name.split('/').pop() ?? st.name, st); }
  // Exact name, then the file's spelling: "s2a/border-radius/md" is
  // "s2a/border/radius/md" here, so fall back to a normalised match.
  const norm = (s: string): string => s.toLowerCase().replace(/^s2a[/-]/, '').replace(/[^a-z0-9]/g, '');
  const byNorm = new Map<string, Variable>();
  for (const v of variables) if (!byNorm.has(norm(v.name))) byNorm.set(norm(v.name), v);
  const missingVars = new Set<string>();
  const findVar = (name: string): Variable | null => {
    const v = byName.get(name) ?? byName.get(name.replace(/^s2a\//, '')) ?? byNorm.get(norm(name)) ?? null;
    if (!v) missingVars.add(name);
    return v;
  };
  // Slot contents: an accepted library component (by set name) becomes the
  // placeholder's default instance, and the swap default for its property.
  await figma.loadAllPagesAsync();
  const setsByName = new Map<string, ComponentSetNode | ComponentNode>();
  for (const n of figma.root.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })) {
    if (n.type === 'COMPONENT' && n.parent?.type === 'COMPONENT_SET') continue;
    const k = n.name.replace(/\s*[—-]\s*v\d+$/i, '').toLowerCase();
    if (!setsByName.has(k) || /v2$/i.test(n.name)) setsByName.set(k, n);
  }
  const libraryDefault = (accepts: string[] | undefined): ComponentNode | null => {
    for (const a of accepts ?? []) { const s = setsByName.get(a.toLowerCase()); if (s) return s.type === 'COMPONENT_SET' ? s.defaultVariant : s; }
    return null;
  };
  const slotAccepts = new Map<string, string[]>();
  const collectSlots = (l: PlanLayer): void => { if (l.slot) slotAccepts.set(cleanName(l.name), l.slot.accepts); for (const c of l.children) collectSlots(c); };
  collectSlots(plan.anatomy);
  const findStyle = (typographyName: string): TextStyle | null =>
    styleByName.get(typographyName) ?? styleByName.get(typographyName.split('/').pop() ?? '') ?? null;
  // Text styles apply asynchronously; the report waits for them before it counts.
  const stylePromises: Promise<void>[] = [];

  // Instance-swap defaults are component ids from the design evidence; resolve
  // them up front (async) so the property loop stays synchronous.
  const swapDefaults = new Map<string, ComponentNode>();
  await Promise.all(plan.properties.filter(p => p.type === 'INSTANCE_SWAP' && typeof p.defaultValue === 'string' && p.defaultValue).map(async p => {
    const n = await figma.getNodeByIdAsync(String(p.defaultValue));
    const comp = n?.type === 'COMPONENT' ? n : n?.type === 'COMPONENT_SET' ? n.defaultVariant : null;
    if (comp) swapDefaults.set(p.name, comp);
  }));
  // No design default: the slot the property drives names the library component to use.
  for (const p of plan.properties) if (p.type === 'INSTANCE_SWAP' && !swapDefaults.has(p.name)) {
    const target = [...slotAccepts.keys()].find(k => (p.layer ?? '').split('/').some(seg => cleanName(seg).toLowerCase() === k) || k === (p.forProp ?? '').replace(/(Src|Source|Url)$/, '').toLowerCase());
    const comp = libraryDefault(target ? slotAccepts.get(target) : undefined);
    if (comp) swapDefaults.set(p.name, comp);
  }

  function bindPaint(node: SceneNode, prop: 'fills' | 'strokes', v: Variable): void {
    const paints = [...(((node as any)[prop] as Paint[]) || [])];
    const base: SolidPaint = (paints[0] && paints[0].type === 'SOLID' ? paints[0] : { type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }) as SolidPaint;
    // Overwrite the literal with the variable's resolved value so the paint
    // reads correctly in every mode (bound-variable literal mismatch gotcha).
    const resolved = v.resolveForConsumer(node);
    const literal = resolved && typeof resolved.value === 'object' && 'r' in (resolved.value as any) ? (resolved.value as RGBA) : null;
    const paint = figma.variables.setBoundVariableForPaint({ ...base, ...(literal ? { color: { r: literal.r, g: literal.g, b: literal.b }, opacity: literal.a } : {}) }, 'color', v);
    (node as any)[prop] = [paint];
    report.boundVariables++;
  }

  function bindLayer(node: SceneNode, bindings: Record<string, string[]>): void {
    for (const [cssProp, names] of Object.entries(bindings)) {
      const targets = CSS_TO_FIGMA[cssProp];
      if (!targets || !names.length) continue;
      // Shorthands: padding "a b" → top/bottom = a, left/right = b.
      const pick = (i: number): string => names.length === 1 ? names[0] : cssProp === 'padding' && names.length === 2 ? (i % 2 === 0 ? names[0] : names[1]) : names[Math.min(i, names.length - 1)];
      targets.forEach((field, i) => {
        const v = findVar(pick(i));
        if (!v) return;
        try {
          if (field === 'fills' || field === 'strokes') { if (node.type !== 'TEXT' || field === 'fills') bindPaint(node, field, v); }
          else if (field === 'fontFamily' || field === 'fontStyle' || field === 'fontSize' || field === 'lineHeight' || field === 'letterSpacing') { if (node.type === 'TEXT') { (node as TextNode).setBoundVariable(field as any, v); report.boundVariables++; } }
          else { (node as any).setBoundVariable(field, v); report.boundVariables++; }
        } catch (err: any) { report.notes.push(`${node.name}.${field}: ${err?.message || err}`); }
      });
    }
  }

  function buildLayer(layer: PlanLayer, parent: FrameNode | ComponentNode, depth: number): SceneNode {
    const textLike = (layer.element && TEXT_ELEMENTS.test(layer.element)) || Boolean(layer.bindings['font-size'] || layer.bindings['font-family']);
    // A text-styled layer with children (a CTA with its chevron) is a row
    // holding a .label text plus the children; a leaf is the text itself.
    const isText = textLike && !layer.children.length;
    const isImage = layer.element === 'img' || /\b(img|image|picture|video)\b/i.test(cleanName(layer.name));
    let node: SceneNode;
    if (textLike && layer.children.length) {
      const row = figma.createFrame();
      row.name = layer.name;
      row.fills = [];
      row.layoutMode = 'HORIZONTAL';
      row.primaryAxisSizingMode = 'AUTO';
      row.counterAxisSizingMode = 'AUTO';
      row.counterAxisAlignItems = 'CENTER';
      row.itemSpacing = 8;
      parent.appendChild(row);
      buildLayer({ name: '.label', element: 'span', bindings: layer.bindings, slot: null, children: [] }, row, depth + 1);
      for (const child of layer.children) buildLayer(child, row, depth + 1);
      report.layers++;
      try { if (parent.layoutMode !== 'NONE') row.layoutSizingHorizontal = parent.layoutMode === 'VERTICAL' ? 'FILL' : 'HUG'; } catch { /* not applicable */ }
      return row;
    }
    if (isText) {
      const t = figma.createText();
      t.name = layer.name;
      t.fontName = fallbackFont;
      t.characters = toTitle(layer.name);
      const sizeVar = layer.bindings['font-size']?.[0];
      const styleName = sizeVar ? sizeVar.replace('typography/font-size/', 'typography/') : null;
      const style = styleName ? findStyle(styleName) : null;
      parent.appendChild(t);
      if (style) { stylePromises.push(t.setTextStyleIdAsync(style.id).then(() => { report.stylesApplied++; }).catch(() => { report.stylesMissing.push(styleName!); })); }
      else if (styleName) report.stylesMissing.push(styleName);
      t.textAutoResize = 'HEIGHT';
      bindLayer(t, { color: layer.bindings.color ?? [] , fills: layer.bindings.fills ?? [] });
      node = t;
    } else if (isImage) {
      const r = figma.createRectangle();
      r.name = layer.name;
      r.resize(320, 180);
      r.fills = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.85 } }];
      parent.appendChild(r);
      node = r;
    } else if (layer.element === 'hr' || /^(divider|rule|separator)$/i.test(cleanName(layer.name))) {
      // A rule: 1px high, full width, stroke bound (border-color) — not an empty 100×100 frame.
      const f = figma.createFrame();
      f.name = layer.name;
      f.fills = [];
      f.resize(320, 1);
      f.strokeWeight = 1;
      f.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }];
      parent.appendChild(f);
      bindLayer(f, layer.bindings);
      node = f;
    } else if (/^svg|^i$/.test(layer.element ?? '') || /icon|chevron|arrow|caret|glyph/i.test(cleanName(layer.name))) {
      // An icon placeholder: a fixed 24×24 frame the designer swaps for the real glyph.
      const f = figma.createFrame();
      f.name = layer.name;
      f.resize(24, 24);
      f.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
      f.cornerRadius = 4;
      parent.appendChild(f);
      bindLayer(f, layer.bindings);
      node = f;
      report.layers++;
      return node;   // fixed size: never FILL
    } else {
      const f = figma.createFrame();
      f.name = layer.name;
      f.fills = [];
      f.clipsContent = false;
      f.layoutMode = ROW_LAYERS.test(cleanName(layer.name)) ? 'HORIZONTAL' : 'VERTICAL';
      f.primaryAxisSizingMode = 'AUTO';
      f.counterAxisSizingMode = 'AUTO';
      f.itemSpacing = 8;
      parent.appendChild(f);
      bindLayer(f, layer.bindings);
      if (layer.slot) {
        // A library component the slot accepts fills it; otherwise a dashed placeholder.
        const comp = libraryDefault(layer.slot.accepts);
        if (comp) {
          const inst = comp.createInstance();
          inst.name = `[${layer.slot.name}]`;
          f.appendChild(inst);
          report.notes.push(`slot ${layer.slot.name}: filled with ${comp.parent?.type === 'COMPONENT_SET' ? comp.parent.name : comp.name}`);
        } else {
          const placeholder = figma.createFrame();
          placeholder.name = `[${layer.slot.name}: ${layer.slot.accepts.join(' | ')}]`;
          placeholder.resize(120, 40);
          placeholder.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.93, b: 0.93 } }];
          placeholder.strokes = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
          placeholder.dashPattern = [4, 4];
          f.appendChild(placeholder);
        }
        report.layers++;
      }
      for (const child of layer.children) buildLayer(child, f, depth + 1);
      node = f;
    }
    report.layers++;
    // Children of an auto-layout parent fill the cross axis (after appendChild).
    // Text included: a text node left at HUG wraps at ~50px in a vertical stack.
    try { if (parent.layoutMode !== 'NONE') (node as any).layoutSizingHorizontal = parent.layoutMode === 'VERTICAL' ? 'FILL' : 'HUG'; } catch { /* not applicable */ }
    return node;
  }

  // Variants
  const axes = plan.properties.filter(p => p.type === 'VARIANT').map(p => ({ name: p.name, options: p.options ?? [] })).filter(a => a.options.length);
  const variantProps = combos(axes);
  const components: ComponentNode[] = [];
  const page = figma.currentPage;
  for (const props of variantProps) {
    const c = figma.createComponent();
    c.name = axes.length ? Object.entries(props).map(([k, v]) => `${k}=${v}`).join(', ') : plan.component;
    c.layoutMode = ROW_LAYERS.test(cleanName(plan.anatomy.name)) ? 'HORIZONTAL' : 'VERTICAL';
    c.primaryAxisSizingMode = 'AUTO';
    c.counterAxisSizingMode = 'FIXED';
    c.resize(480, 320);
    c.primaryAxisSizingMode = 'AUTO';
    c.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    c.itemSpacing = 8;
    page.appendChild(c);
    bindLayer(c, plan.anatomy.bindings);
    for (const child of plan.anatomy.children) buildLayer(child, c, 1);
    report.layers++;
    components.push(c);
  }

  // Section + set
  let maxX = 0, minY = Infinity;
  for (const n of page.children) { if ('x' in n && 'width' in n) { maxX = Math.max(maxX, (n as FrameNode).x + (n as FrameNode).width); minY = Math.min(minY, (n as FrameNode).y); } }
  if (!isFinite(minY)) minY = 0;
  const section = figma.createSection();
  section.name = `Contracts / ${plan.component} (generated)`;
  page.appendChild(section);
  section.x = maxX + 200; section.y = minY;
  const set = components.length > 1 ? figma.combineAsVariants(components, section) : (() => { section.appendChild(components[0]); return components[0]; })();
  set.name = `${plan.component} — generated`;
  if (set.type === 'COMPONENT_SET') {
    // combineAsVariants stacks variants at 0,0: lay them out in a row.
    let x = 20;
    for (const v of set.children as ComponentNode[]) { v.x = x; v.y = 20; x += v.width + 40; }
    set.layoutMode = 'NONE';
    const w = x + 20, h = Math.max(...(set.children as ComponentNode[]).map(v => v.height)) + 40;
    set.resizeWithoutConstraints(Math.max(w, 200), Math.max(h, 100));
  }
  set.x = 40; set.y = 80;
  section.resizeWithoutConstraints(set.width + 80, set.height + 120);

  // Non-variant properties, wired to the layers they drive.
  const variantsList = set.type === 'COMPONENT_SET' ? (set.children as ComponentNode[]) : [set as ComponentNode];
  // The layer a property drives: every segment of its layer path from the
  // innermost out ("{metaname}" → "Name" → "Meta" → ".attribution"), then the
  // prop name (showCta → .cta, attributionName → .name / .attributionName).
  const key = (s: string): string => cleanName(s).toLowerCase().replace(/^\{|\}$/g, '');
  const findLayer = (root: SceneNode, prop: { forProp?: string; layer?: string }): SceneNode | null => {
    const fromPath = (prop.layer ?? '').split('/').map(s => s.trim()).filter(Boolean).reverse();
    const fp = prop.forProp ?? '';
    const tail = fp.replace(/^show/i, '').replace(/^.*?([A-Z][a-z0-9]*)$/, '$1');
    const head = fp.replace(/[A-Z].*$/, '');           // ctaLabel → cta
    const cands = [...fromPath, fp.replace(/^show/i, ''), tail, head, fp].map(key).filter(Boolean);
    const all = 'findAll' in root ? (root as any).findAll(() => true) as SceneNode[] : [];
    // A TEXT property wants a layer with text in it: skip candidates that have none
    // (the chevron sits on the CTA's path, but the label is the text).
    const want = (prop as any).type === 'TEXT' ? (n: SceneNode) => n.type === 'TEXT' || ('findOne' in n && Boolean((n as any).findOne((x: SceneNode) => x.type === 'TEXT'))) : () => true;
    for (const c of cands) { const hit = all.find(n => key(n.name) === c && want(n)); if (hit) return hit; }
    for (const c of cands) { const hit = all.find(n => key(n.name) === c); if (hit) return hit; }
    return null;
  };
  const insideInstance = (n: SceneNode): boolean => { let p: BaseNode | null = n.parent; while (p && p.type !== 'COMPONENT' && p.type !== 'COMPONENT_SET' && p.type !== 'PAGE') { if (p.type === 'INSTANCE') return true; p = p.parent; } return false; };
  // A TEXT property that lands on a container wires to the first text inside it
  // (.cta → .cta/.label); an INSTANCE_SWAP that lands on a slot frame wires to
  // the instance inside it.
  const descend = (target: SceneNode, type: 'TEXT' | 'INSTANCE'): SceneNode | null =>
    target.type === type ? target : ('findOne' in target ? (target as any).findOne((n: SceneNode) => n.type === type) as SceneNode | null : null);
  for (const prop of plan.properties.filter(p => p.type !== 'VARIANT')) {
    // Figma appends its own "#id" to property names; the design's suffix must not travel.
    const name = prop.name.replace(/#\d+:\d+$/, '');
    try {
      const host: ComponentSetNode | ComponentNode = set as any;
      const swapDefault = prop.type === 'INSTANCE_SWAP' ? swapDefaults.get(prop.name) ?? null : null;
      if (prop.type === 'INSTANCE_SWAP' && !swapDefault) { report.notes.push(`property ${name}: no default component to swap (evidence default ${prop.defaultValue ?? 'missing'} not found in this file); skipped`); continue; }
      const textDefault = String(prop.defaultValue ?? '').replace(/^"|"$/g, '') || toTitle(prop.forProp ?? name);
      const propKey = host.addComponentProperty(name, prop.type as 'TEXT' | 'BOOLEAN' | 'INSTANCE_SWAP', prop.type === 'BOOLEAN' ? prop.defaultValue !== false : prop.type === 'TEXT' ? textDefault : swapDefault!.id);
      report.properties++;
      for (const v of variantsList) {
        let target = findLayer(v, prop);
        if (!target) { report.notes.push(`property ${name}: no layer found to wire (looked for ${prop.layer ?? prop.forProp ?? name})`); continue; }
        if (prop.type === 'TEXT') {
          const text = descend(target, 'TEXT');
          if (!text) { report.notes.push(`property ${name}: layer ${target.name} is a ${target.type} with no text inside; wire it by hand`); continue; }
          // Text inside a slotted instance belongs to that component: Figma
          // forbids wiring it here. The panel exposes the nested property instead.
          if (insideInstance(text)) { report.notes.push(`property ${name}: text lives inside the slotted instance; expose the instance's own text property (nested property) instead of a card-level one`); continue; }
          text.componentPropertyReferences = { ...(text.componentPropertyReferences || {}), characters: propKey };
        } else if (prop.type === 'BOOLEAN') {
          target.componentPropertyReferences = { ...(target.componentPropertyReferences || {}), visible: propKey };
        } else if (prop.type === 'INSTANCE_SWAP') {
          target = descend(target, 'INSTANCE') ?? target;
          // The scaffold's placeholder becomes an instance of the default component, in place.
          if (target.type !== 'INSTANCE') {
            const parent = target.parent as (FrameNode | ComponentNode);
            const inst = swapDefault!.createInstance();
            inst.name = target.name;
            parent.insertChild(parent.children.indexOf(target), inst);
            try { if (parent.layoutMode !== 'NONE') inst.layoutSizingHorizontal = parent.layoutMode === 'VERTICAL' ? 'FILL' : 'HUG'; } catch { /* not applicable */ }
            target.remove();
            target = inst;
          }
          target.componentPropertyReferences = { ...(target.componentPropertyReferences || {}), mainComponent: propKey };
        }
      }
    } catch (err: any) { report.notes.push(`property ${name}: ${err?.message || err}`); }
  }

  await Promise.all(stylePromises);
  report.set = set.name; report.setId = set.id; report.variants = variantsList.length; report.unresolvedVariables = [...missingVars];
  figma.currentPage.selection = [set as SceneNode];
  figma.viewport.scrollAndZoomIntoView([set as SceneNode]);
  return report;
}
