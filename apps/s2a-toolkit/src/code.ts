// ── Serializers ──────────────────────────────────────────────────────────────

function serializeVariable(v: Variable): Record<string, unknown> {
  return {
    id: v.id,
    name: v.name,
    key: v.key,
    resolvedType: v.resolvedType,
    valuesByMode: v.valuesByMode,
    variableCollectionId: v.variableCollectionId,
    scopes: v.scopes,
    codeSyntax: v.codeSyntax || {},
    description: v.description,
    hiddenFromPublishing: v.hiddenFromPublishing,
  };
}

function serializeCollection(c: VariableCollection): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    key: c.key,
    modes: c.modes,
    defaultModeId: c.defaultModeId,
    variableIds: c.variableIds,
  };
}

// ── Dark section style ────────────────────────────────────────────────────────

const DARK_VAR = {
  bgKnockout:   'VariableID:6:18',
  bgSubtle:     'VariableID:6:47',
  borderSubtle: 'VariableID:6:22',
  cBodySubtle:  'VariableID:2483:41396',
  cSubheading:  'VariableID:2483:41397',
  cKnockout:    'VariableID:6:81',
  collectionId: 'VariableCollectionId:6:17',
};

function bfv(node: SceneNode, v: Variable): void {
  const f = (node as any).fills;
  if (!f || f === figma.mixed || !f.length) return;
  const ps = [...f];
  ps[0] = figma.variables.setBoundVariableForPaint(ps[0], 'color', v);
  (node as any).fills = ps;
}

// Applies the dark doc style to a section: bg rect + .content frame (explicit
// Dark mode) + optional fill rebinding for text/divider children.
async function applyDarkStyle(sec: SectionNode, opts: { rebindText?: boolean } = {}): Promise<void> {
  const rebind = opts.rebindText !== false;

  const [vBg, , vBorder, vBody, vSub, vKo] = await Promise.all([
    figma.variables.getVariableByIdAsync(DARK_VAR.bgKnockout),
    figma.variables.getVariableByIdAsync(DARK_VAR.bgSubtle),
    figma.variables.getVariableByIdAsync(DARK_VAR.borderSubtle),
    figma.variables.getVariableByIdAsync(DARK_VAR.cBodySubtle),
    figma.variables.getVariableByIdAsync(DARK_VAR.cSubheading),
    figma.variables.getVariableByIdAsync(DARK_VAR.cKnockout),
  ]);

  const colls = await figma.variables.getLocalVariableCollectionsAsync();
  const coll  = colls.find(c => c.id === DARK_VAR.collectionId)!;
  const darkId = coll.modes.find(m => m.name === 'Dark')!.modeId;

  // Background rect — create or resize
  let bg = sec.children.find(
    c => c.type === 'RECTANGLE' && (c as RectangleNode).x === 0 && (c as RectangleNode).y === 0 && (c as RectangleNode).height > 10
  ) as RectangleNode | undefined;
  if (!bg) {
    bg = figma.createRectangle();
    bg.x = 0; bg.y = 0;
    sec.insertChild(0, bg);
  }
  bg.resize(sec.width, sec.height);
  bg.fills = [{ type: 'SOLID', color: { r: 0.04, g: 0.04, b: 0.047 } }];
  if (vBg) bfv(bg, vBg);

  // .content frame — create or find, then set dark mode
  let frame = sec.children.find(c => c.name === '.content' && c.type === 'FRAME') as FrameNode | undefined;
  if (!frame) {
    frame = figma.createFrame();
    frame.name = '.content';
    frame.fills = [];
    frame.clipsContent = false;
    frame.layoutMode = 'NONE';
    sec.appendChild(frame);
    const others = [...sec.children].filter(c => c !== bg && c !== frame);
    for (const n of others) frame.appendChild(n);
  }
  frame.resize(sec.width, sec.height);
  frame.setExplicitVariableModeForCollection(coll, darkId);

  if (!rebind) return;

  for (const child of [...frame.children]) {
    if (child.type === 'RECTANGLE') {
      const r = child as RectangleNode;
      if (r.height <= 2 && vBorder) bfv(r, vBorder);
    } else if (child.type === 'TEXT') {
      const t = child as TextNode;
      const sz   = typeof t.fontSize === 'number' ? t.fontSize : 18;
      const st   = typeof t.fontName === 'object' && t.fontName !== figma.mixed ? (t.fontName.style || '').toLowerCase() : '';
      const bold = st.includes('bold') || st.includes('black');
      const v    = sz >= 40 ? vKo : (bold && sz >= 16) ? vSub : vBody;
      if (v) bfv(t, v);
    }
  }
}

// ── Bridge method handler ────────────────────────────────────────────────────

async function handleBridgeMethod(method: string, params: Record<string, any>): Promise<Record<string, unknown>> {
  switch (method) {
    case 'EXECUTE_CODE': {
      const code = params.code as string;
      if (typeof code !== 'string') throw new Error('EXECUTE_CODE: params.code must be a string');
      if (code.length > 65536) throw new Error('EXECUTE_CODE: code exceeds 64KB limit');
      const timeout = Math.min((params.timeout as number) || 5000, 30000);
      const wrappedCode = '(async function() {\n' + code + '\n})()';
      const timeoutPromise = new Promise((_r, reject) => {
        setTimeout(() => reject(new Error('Execution timed out after ' + timeout + 'ms')), timeout);
      });
      let codePromise: any;
      try { codePromise = eval(wrappedCode); } catch (err: any) {
        throw new Error('Syntax error: ' + (err.message || String(err)));
      }
      const result = await Promise.race([codePromise, timeoutPromise]);
      return { result, fileContext: { fileName: figma.root.name, fileKey: figma.fileKey || null } };
    }

    case 'GET_FILE_INFO': {
      return {
        fileInfo: {
          fileName: figma.root.name,
          fileKey: figma.fileKey || null,
          currentPage: { id: figma.currentPage.id, name: figma.currentPage.name },
        },
      };
    }

    case 'REFRESH_VARIABLES':
    case 'GET_VARIABLES_DATA': {
      const variables = await figma.variables.getLocalVariablesAsync();
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      const data = {
        success: true,
        timestamp: Date.now(),
        fileKey: figma.fileKey || null,
        variables: variables.map(serializeVariable),
        variableCollections: collections.map(serializeCollection),
      };
      return { data };
    }

    case 'GET_SELECTION_DATA': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) return { selectionData: null };
      const node = serializeNodeForProto(sel[0]);
      return {
        selectionData: {
          ...node,
          fileKey: figma.fileKey || null,
          fileName: figma.root.name,
          page: { id: figma.currentPage.id, name: figma.currentPage.name },
        },
      };
    }

    default:
      throw new Error('Unknown method: ' + method);
  }
}

// ── Selection change ──────────────────────────────────────────────────────────

const PROTO_FRAME_TYPES = new Set([
  'FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'GROUP', 'SECTION',
]);

function notifySelection() {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) {
    figma.ui.postMessage({ type: 'selection-changed', setId: null, nodeId: null });
    return;
  }
  const first = sel[0];

  const sectionNodes = sel.filter(n => n.type === 'SECTION');

  figma.ui.postMessage({
    type: 'selection-changed',
    setId: (first.type === 'COMPONENT_SET' || first.type === 'COMPONENT') ? first.id : null,
    nodeId: first.id,
    nodeName: first.name,
    nodeType: first.type,
    fileKey: figma.fileKey || null,
    fileName: figma.root.name,
    width: 'width' in first ? Math.round((first as FrameNode).width) : undefined,
    height: 'height' in first ? Math.round((first as FrameNode).height) : undefined,
    variantCount: first.type === 'COMPONENT_SET' ? (first as ComponentSetNode).children.length : first.type === 'COMPONENT' ? 1 : undefined,
    allNodes: sel.map(n => ({ id: n.id, name: n.name })),
    isSection: sectionNodes.length > 0,
    sectionCount: sectionNodes.length,
    sectionName: sectionNodes.length > 0 ? sectionNodes[0].name : null,
  });

  // Select tab — send variant axes when a COMPONENT_SET is selected
  if (first.type === 'COMPONENT_SET') {
    const defs = (first as ComponentSetNode).componentPropertyDefinitions;
    const axes = Object.entries(defs).map(([name, def]) => ({
      name,
      type: def.type,
      variantOptions: (def as any).variantOptions as string[] | undefined,
    }));
    figma.ui.postMessage({ type: 'select:axes', setId: first.id, setName: first.name, axes });
  }
}

function serializeNodeForProto(node: SceneNode, depth = 0): Record<string, unknown> {
  const base: Record<string, unknown> = {
    id: node.id,
    name: node.name,
    type: node.type,
  };
  if ('width' in node) {
    base.width = Math.round((node as FrameNode).width);
    base.height = Math.round((node as FrameNode).height);
  }
  if ('componentPropertyDefinitions' in node) {
    const defs = (node as ComponentSetNode).componentPropertyDefinitions;
    base.componentProperties = Object.fromEntries(
      Object.entries(defs).map(([k, v]) => [k, { type: v.type, defaultValue: v.defaultValue }])
    );
  }
  if (depth < 2 && 'children' in node) {
    base.children = (node as FrameNode).children.slice(0, 20).map(
      (c: SceneNode) => serializeNodeForProto(c, depth + 1)
    );
  }
  return base;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    bin += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(bin);
}

// ── Bento doc generator helpers ────────────────────────────────────────────────

function parseVariantProps(name: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const part of name.split(',')) {
    const eq = part.indexOf('=');
    if (eq !== -1) props[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return props;
}

interface BentoMeta {
  version: string; status: string; updated: string; changelog: string;
  goodToKnow: string; accessibility: string; description: string; hadFence: boolean;
}

// Parse the `— s2a:meta —` fence plus the `## Good to know` / `## Accessibility`
// prose blocks out of a component set's description. Tolerates a missing fence.
function parseMetaFence(desc: string): BentoMeta {
  const out: BentoMeta = {
    version: '', status: '', updated: '', changelog: '',
    goodToKnow: '', accessibility: '', description: '', hadFence: false,
  };
  if (!desc) return out;
  const lines = desc.split('\n');
  let idx = 0;
  if (/s2a:meta/i.test(lines[0] || '')) {
    out.hadFence = true;
    let end = 1;
    while (end < lines.length && lines[end].trim() !== '') end++;
    const changelog: string[] = [];
    let inChangelog = false;
    for (const line of lines.slice(1, end)) {
      const kv = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
      if (kv && !/^\s/.test(line)) {
        inChangelog = false;
        const k = kv[1].toLowerCase(); const v = kv[2].trim();
        if (k === 'version') out.version = v;
        else if (k === 'status') out.status = v;
        else if (k === 'updated') out.updated = v;
        else if (k === 'changelog') { inChangelog = true; if (v) changelog.push(v); }
      } else if (inChangelog) {
        changelog.push(line.trim());
      }
    }
    if (changelog.length) out.changelog = 'changelog\n  ' + changelog.join('\n  ');
    idx = end + 1;
  }
  const rest = lines.slice(idx).join('\n').trim();
  const gtk  = rest.match(/##\s*Good to know\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  const a11y = rest.match(/##\s*Accessibility\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (gtk)  out.goodToKnow    = gtk[1].trim();
  if (a11y) out.accessibility = a11y[1].trim();
  out.description = rest.split(/\n##\s/)[0].split(/\n\s*\n/)[0].trim();
  return out;
}

function pageOfNode(node: BaseNode): PageNode | null {
  let p: BaseNode | null = node;
  while (p && p.type !== 'PAGE') p = p.parent;
  return (p as PageNode) ?? null;
}

// Prefer the variant whose values look like the default / resting state.
function pickDefaultVariant(variants: ComponentNode[]): ComponentNode | undefined {
  if (!variants.length) return undefined;
  const DEFAULTISH = new Set([
    'default', 'resting', 'standard', 'md', 'solid', 'hug', 'block', 'horizontal', 'on-light',
  ]);
  let best = variants[0]; let bestScore = -1;
  for (const v of variants) {
    const score = Object.values(parseVariantProps(v.name))
      .filter(x => DEFAULTISH.has(x.toLowerCase())).length;
    if (score > bestScore) { best = v; bestScore = score; }
  }
  return best;
}

function clearBentoSlot(frame: FrameNode): void {
  for (const c of [...frame.children]) c.remove();
}

// Dot-named layer tree of a variant → an indented anatomy list.
function anatomyList(comp: ComponentNode): string {
  const lines: string[] = [];
  function walk(node: SceneNode, depth: number): void {
    if (node !== comp && (node.name.startsWith('.') || node.name.startsWith('['))) {
      lines.push('  '.repeat(Math.max(0, depth - 1)) + node.name);
    }
    if ('children' in node && depth < 4) {
      for (const c of (node as FrameNode).children) walk(c, depth + 1);
    }
  }
  walk(comp, 0);
  return lines.length ? lines.join('\n') : '.root';
}

function setUsesNativeSlots(set: ComponentSetNode): boolean {
  const v = set.children[0];
  if (v && 'findOne' in v) {
    try { return !!(v as ComponentNode).findOne(n => (n.type as string) === 'SLOT'); }
    catch { /* older API — treat as no slots */ }
  }
  return false;
}

// Cluster numeric positions into representative buckets within a tolerance —
// lets the axis-labeler treat near-equal x/y (sub-pixel drift) as one row/column.
function clusterPositions(vals: number[], tol: number): number[] {
  const sorted = Array.from(new Set(vals)).sort((a, b) => a - b);
  const reps: number[] = [];
  for (const v of sorted) if (!reps.some(r => Math.abs(r - v) <= tol)) reps.push(v);
  return reps;
}

function mkAxisLabel(chars: string, style: string, size: number, colorVar: Variable | null): TextNode {
  const t = figma.createText();
  t.name = 'axis-label';
  t.fontName = { family: 'Adobe Clean', style };
  t.fontSize = size;
  t.characters = chars;
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  if (colorVar) bfv(t, colorVar);
  return t;
}

figma.on('selectionchange', notifySelection);

figma.on('currentpagechange', () => {
  figma.ui.postMessage({
    type: 'page-changed',
    page: { id: figma.currentPage.id, name: figma.currentPage.name },
  });
});

// ── Message handler ──────────────────────────────────────────────────────────

figma.showUI(__html__, { width: 320, height: 480, themeColors: true });

figma.ui.onmessage = async (msg: { type: string; [key: string]: unknown }) => {
  switch (msg.type) {
    case 'ui-ready':
      notifySelection();
      break;

    case 'select:apply-filter': {
      const setNode = await figma.getNodeByIdAsync(msg.setId as string);
      if (!setNode || setNode.type !== 'COMPONENT_SET') {
        figma.notify('Component set not found — click into it and try again');
        break;
      }
      const filter = (msg.filter || {}) as Record<string, string[]>;
      const variants = (setNode as ComponentSetNode).children as ComponentNode[];

      function parseProps(name: string): Record<string, string> {
        const props: Record<string, string> = {};
        for (const part of name.split(',')) {
          const eq = part.indexOf('=');
          if (eq !== -1) props[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
        }
        return props;
      }

      const axes = Object.keys(filter);
      const matched = variants.filter(v => {
        if (axes.length === 0) return true;
        const props = parseProps(v.name);
        return axes.every(axis => {
          const allowed = filter[axis];
          return !allowed || allowed.length === 0 || allowed.includes(props[axis]);
        });
      });

      figma.currentPage.selection = matched;
      if (matched.length > 0) figma.viewport.scrollAndZoomIntoView(matched);
      figma.ui.postMessage({
        type: 'select:result',
        message: `Selected ${matched.length} of ${variants.length} variants`,
      });
      break;
    }

    case 'notify': {
      figma.notify(msg.message as string);
      break;
    }

    case 'format-section': {
      const sections = figma.currentPage.selection.filter(
        n => n.type === 'SECTION'
      ) as SectionNode[];
      if (sections.length === 0) {
        figma.notify('Select a section first');
        figma.ui.postMessage({ type: 'format-section:done', count: 0 });
        break;
      }
      let styled = 0;
      for (const section of sections) {
        try {
          await applyDarkStyle(section);
          styled++;
        } catch {}
      }
      const note = styled === 1 ? 'Section styled' : `${styled} sections styled`;
      figma.notify(note);
      figma.ui.postMessage({ type: 'format-section:done', count: styled });
      break;
    }

    case 'resize-for-view': {
      const w = (msg.width as number) || 320;
      const h = (msg.height as number) || 480;
      figma.ui.resize(w, h);
      break;
    }

    case 'llm-capture:selection': {
      const node = figma.currentPage.selection[0];
      if (!node) {
        figma.ui.postMessage({ type: 'llm-capture:result', error: 'Select a frame, section, component, or instance first' });
        break;
      }
      if (!('exportAsync' in node)) {
        figma.ui.postMessage({ type: 'llm-capture:result', error: `${node.type} cannot be exported as an image` });
        break;
      }

      try {
        const maxDimension = Math.max(256, Math.min((msg.maxDimension as number) || 2048, 4096));
        const width = 'width' in node ? (node as any).width : maxDimension;
        const height = 'height' in node ? (node as any).height : maxDimension;
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        const bytes = await (node as any).exportAsync({
          format: 'JPG',
          constraint: { type: 'SCALE', value: scale },
        });
        const capture = {
          imageBase64: bytesToBase64(bytes),
          mediaType: 'image/jpeg',
          scale,
          maxDimension,
          byteLength: bytes.length,
          node: serializeNodeForProto(node),
          fileKey: figma.fileKey || null,
          fileName: figma.root.name,
          page: { id: figma.currentPage.id, name: figma.currentPage.name },
        };
        figma.ui.postMessage({ type: 'llm-capture:result', capture });
      } catch (e: any) {
        figma.ui.postMessage({ type: 'llm-capture:result', error: e.message || String(e) });
      }
      break;
    }

    case 'annotate:apply': {
      const categories = new Set((msg.categories as string[]) ?? []);
      const selection  = figma.currentPage.selection;
      if (!selection.length) { figma.ui.postMessage({ type: 'annotate:result', error: 'No selection' }); break; }

      // Walk every selected node and all descendants
      const rootSet  = new Set<BaseNode>(selection);
      const allNodes: BaseNode[] = [];
      for (const sel of selection) {
        allNodes.push(sel);
        if ('findAll' in sel) allNodes.push(...(sel as any).findAll(() => true) as BaseNode[]);
      }

      // Collect every bound variable ID across the entire subtree, then batch-fetch names
      const varIdSet = new Set<string>();
      for (const n of allNodes) {
        const bv = (n as any).boundVariables ?? {};
        for (const key of Object.keys(bv)) {
          const val = bv[key];
          if (!val) continue;
          if (Array.isArray(val)) val.forEach((v: any) => { if (v?.id) varIdSet.add(v.id); });
          else if (val?.id) varIdSet.add(val.id);
        }
      }
      const varNames = new Map<string, string>();
      await Promise.all([...varIdSet].map(async id => {
        try {
          const v = await figma.variables.getVariableByIdAsync(id);
          if (v) varNames.set(id, '--' + v.name.replace(/\//g, '-'));
        } catch {}
      }));

      // Returns the CSS-var label for the first bound variable on a property
      function bvLabel(bv: any, key: string): string {
        const val = bv[key];
        if (!val) return '';
        const id = Array.isArray(val) ? (val.find((v: any) => v?.id) ?? {}).id : val?.id;
        return id ? (varNames.get(id) ?? '') : '';
      }

      let annotated = 0;
      for (const n of allNodes) {
        const bv = (n as any).boundVariables ?? {};
        const anns: Array<{ label: string; properties: Array<{ type: string }> }> = [];

        const pdVar  = (n as any).getPluginData?.('s2aTokenVar')  ?? '';
        const pdProp = (n as any).getPluginData?.('s2aTokenProp') ?? '';

        if (categories.has('color-fg') && n.type === 'TEXT') {
          if ((bv.fills?.length ?? 0) > 0) {
            anns.push({ label: bvLabel(bv, 'fills') || 'color-fg', properties: [{ type: 'fills' }] });
          } else if (pdVar && pdProp === 'fills') {
            anns.push({ label: pdVar, properties: [{ type: 'fills' }] });
          }
        }

        if (categories.has('color-bg') && n.type !== 'TEXT') {
          if ((bv.fills?.length ?? 0) > 0) {
            anns.push({ label: bvLabel(bv, 'fills') || 'color-bg', properties: [{ type: 'fills' }] });
          } else if (pdVar && pdProp === 'fills') {
            anns.push({ label: pdVar, properties: [{ type: 'fills' }] });
          }
        }

        if (categories.has('spacing')) {
          // Live variable bindings on auto-layout frames
          const padKeys = ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'] as const;
          const boundPad = padKeys.filter(k => bv[k]);
          if (boundPad.length) {
            const lbl = bvLabel(bv, boundPad[0]);
            anns.push({ label: lbl || 'padding', properties: [{ type: 'padding' }] });
          }
          if (bv.itemSpacing) {
            const lbl = bvLabel(bv, 'itemSpacing');
            anns.push({ label: lbl || 'gap', properties: [{ type: 'itemSpacing' }] });
          }
          // Spacing doc swatches (plugin data fallback)
          if (pdVar && pdProp === 'spacing') {
            anns.push({ label: pdVar, properties: [{ type: 'width' }] });
          }
        }

        if (categories.has('shape')) {
          // Corner radius — check individual bound corners, fall back to plugin data
          const radiusKey = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius', 'cornerRadius']
            .find(k => bv[k]);
          if (radiusKey) {
            anns.push({ label: bvLabel(bv, radiusKey) || 'border-radius', properties: [{ type: 'cornerRadius' }] });
          } else if (pdVar && pdProp === 'cornerRadius') {
            anns.push({ label: pdVar, properties: [{ type: 'cornerRadius' }] });
          }

          // Stroke weight — check bound variable, fall back to plugin data
          if (bv.strokeWeight) {
            anns.push({ label: bvLabel(bv, 'strokeWeight') || 'border-width', properties: [{ type: 'strokeWeight' }] });
          } else if (pdVar && pdProp === 'strokeWeight') {
            anns.push({ label: pdVar, properties: [{ type: 'strokeWeight' }] });
          }
        }

        if (categories.has('typography') && n.type === 'TEXT') {
          const tp: Array<{ type: string }> = [];
          if ((bv.fontFamily?.length    ?? 0) > 0) tp.push({ type: 'fontFamily' });
          if ((bv.fontSize?.length      ?? 0) > 0) tp.push({ type: 'fontSize' });
          if ((bv.lineHeight?.length    ?? 0) > 0) tp.push({ type: 'lineHeight' });
          if ((bv.letterSpacing?.length ?? 0) > 0) tp.push({ type: 'letterSpacing' });
          if (tp.length) {
            const lbl = bvLabel(bv, 'fontSize') || bvLabel(bv, 'fontFamily') || 'typography';
            anns.push({ label: lbl, properties: tp });
          }
          if ((bv.fontStyle?.length ?? 0) > 0) {
            const lbl = bvLabel(bv, 'fontStyle');
            anns.push({ label: lbl || 'font-weight', properties: [{ type: 'fontWeight' }] });
          }
        }

        if (categories.has('blur')) {
          const isBlurNode = pdProp === 'blur' || (pdProp === 'width' && (n as any).name === '.blur-swatch');
          if (pdVar && isBlurNode) {
            anns.push({ label: pdVar, properties: [] });
          }
        }

        if (categories.has('opacity')) {
          const isOpacityNode = pdProp === 'opacity' || (n as any).name === '.opacity-swatch';
          if (pdVar && isOpacityNode) {
            anns.push({ label: pdVar, properties: [] });
          }
        }

        if (categories.has('sizing') && rootSet.has(n) &&
            ['INSTANCE', 'COMPONENT', 'COMPONENT_SET'].includes(n.type))
          anns.push({ label: (n as SceneNode).name.replace(/^\./, ''), properties: [{ type: 'width' }, { type: 'height' }] });

        if (anns.length > 0) {
          try { (n as any).annotations = anns; annotated++; } catch {}
        }
      }
      figma.ui.postMessage({ type: 'annotate:result', annotated });
      break;
    }

    case 'annotate:clear': {
      const clearSel = figma.currentPage.selection;
      const all: BaseNode[] = [];
      for (const sel of clearSel) {
        all.push(sel);
        if ('findAll' in sel) all.push(...(sel as any).findAll(() => true) as BaseNode[]);
      }
      let cleared = 0;
      for (const n of all) {
        try { if ((n as any).annotations?.length > 0) { (n as any).annotations = []; cleared++; } } catch {}
      }
      figma.ui.postMessage({ type: 'annotate:cleared', cleared });
      break;
    }

    case 'bridge:command': {
      const requestId = msg.requestId as string;
      const method = msg.method as string;
      const params = (msg.params || {}) as Record<string, any>;
      try {
        const result = await handleBridgeMethod(method, params);
        figma.ui.postMessage({ type: 'bridge:command-result', requestId, success: true, ...result });
      } catch (e: any) {
        figma.ui.postMessage({ type: 'bridge:command-result', requestId, success: false, error: e.message || String(e) });
      }
      break;
    }

    case 'bento:generate': {
      try {
        const setId = msg.setId as string;
        const node = await figma.getNodeByIdAsync(setId);
        if (!node || node.type !== 'COMPONENT_SET') {
          figma.ui.postMessage({ type: 'bento:result', error: 'Select a component set first' });
          break;
        }
        const set = node as ComponentSetNode;

        await Promise.all([
          figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Bold' }),
          figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' }),
          figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' }),
        ]);

        // Find the clean template (by name, not id — ids differ per file).
        // loadAllPagesAsync required before root/page traversal in dynamic-page mode.
        await figma.loadAllPagesAsync();
        const tplPage  = figma.root.children.find(p => p.name === '📐 Templates') as PageNode | undefined;
        const template = tplPage?.children.find(c => c.name === 'Bento Doc Template') as FrameNode | undefined;
        if (!template) {
          figma.ui.postMessage({ type: 'bento:result', error: 'Template not found — add "Bento Doc Template" to the "📐 Templates" page' });
          break;
        }

        // Theme collection (for the dark preview) + axis-label colors.
        const bColls    = await figma.variables.getLocalVariableCollectionsAsync();
        const themeColl = bColls.find(c => c.id === 'VariableCollectionId:6:17');
        const darkModeId = themeColl?.modes.find(m => m.name === 'Dark')?.modeId;
        const [cLabel, cCaption, cBody] = await Promise.all([
          figma.variables.getVariableByIdAsync('VariableID:2483:41392'), // content/label
          figma.variables.getVariableByIdAsync('VariableID:2483:41395'), // content/caption
          figma.variables.getVariableByIdAsync('VariableID:2483:41396'), // content/body-subtle
        ]);

        const meta = parseMetaFence(set.description || '');

        // Clone the template and place it next to the set (same coordinate space).
        const doc = template.clone();
        doc.name = `${set.name} · Docs`;
        const container = set.parent as BaseNode & ChildrenMixin;
        container.appendChild(doc);
        doc.x = set.x + set.width + 200;
        doc.y = set.y;

        const find = (name: string) => doc.findOne(n => n.name === name) as SceneNode | null;

        // Set a named text node's characters — load its own fonts first (else it throws).
        async function setText(name: string, value: string): Promise<void> {
          const t = find(name);
          if (!t || t.type !== 'TEXT' || value == null) return;
          const tn = t as TextNode;
          const fonts = tn.getRangeAllFontNames(0, Math.max(1, tn.characters.length));
          for (const f of fonts) await figma.loadFontAsync(f);
          tn.characters = value;
        }

        // Hero + versioning text (all from the meta fence / description).
        await setText('@hero-name', set.name);
        await setText('@hero-desc', meta.description || 'One-line description of what this component is and when to use it.');
        await setText('@version',   meta.version || '0.0.0');
        await setText('@status',    meta.status || 'active');
        await setText('@updated',   meta.updated ? `updated ${meta.updated}` : 'updated —');
        await setText('@changelog', meta.changelog || 'changelog\n  —');
        if (meta.goodToKnow)    await setText('@good-to-know', meta.goodToKnow);
        if (meta.accessibility) await setText('@accessibility', meta.accessibility);

        const variants = set.children.filter(c => c.type === 'COMPONENT') as ComponentNode[];
        const defaultVariant = pickDefaultVariant(variants);

        // Hero slot — a live instance of the default variant.
        const heroSlot = find('@slot-hero') as FrameNode | null;
        if (heroSlot && defaultVariant) {
          clearBentoSlot(heroSlot);
          heroSlot.clipsContent = false;
          heroSlot.paddingTop = 20; heroSlot.paddingBottom = 20;
          heroSlot.counterAxisSizingMode = 'AUTO'; // hug the instance height
          heroSlot.appendChild(defaultVariant.createInstance());
        }

        // Anatomy — dot-named layer tree of the default variant.
        if (defaultVariant) await setText('@anatomy', anatomyList(defaultVariant));

        // Properties — one stacked row per property definition.
        const propsSlot = find('@properties') as FrameNode | null;
        if (propsSlot) {
          clearBentoSlot(propsSlot);
          propsSlot.strokes = []; propsSlot.dashPattern = []; propsSlot.fills = [];
          propsSlot.layoutMode = 'VERTICAL';
          propsSlot.primaryAxisAlignItems = 'MIN';
          propsSlot.counterAxisAlignItems = 'MIN';
          propsSlot.itemSpacing = 8;
          propsSlot.paddingTop = 0; propsSlot.paddingBottom = 0;
          propsSlot.paddingLeft = 0; propsSlot.paddingRight = 0;
          for (const [rawName, def] of Object.entries(set.componentPropertyDefinitions)) {
            const nm   = rawName.split('#')[0];
            const opts = (def as { variantOptions?: string[] }).variantOptions;
            const line = `${nm}  ·  ${String(def.type).toLowerCase()}` + (opts ? '  ·  ' + opts.join(' / ') : '');
            const t = figma.createText();
            t.fontName = { family: 'Adobe Clean', style: 'Regular' };
            t.fontSize = 14;
            t.characters = line;
            t.textAutoResize = 'HEIGHT';
            propsSlot.appendChild(t);
            t.layoutSizingHorizontal = 'FILL';
            if (cBody) bfv(t, cBody);
          }
          propsSlot.primaryAxisSizingMode = 'AUTO';
        }

        // ── All-variants grid + axis labels ────────────────────────────────
        // Place one instance per variant at the set's own normalized grid
        // positions, then label the axes: a property that's constant down every
        // row is a "row" axis (labelled in the left gutter); the rest vary along
        // the columns (headers anchored to the TOP row, which also keeps
        // misaligned grids — variable-width IconButton/PromoCTA, variable-height
        // RouterNavItem — readable since headers follow the row that defines x).
        const gridSlot = find('@slot-all-variants') as FrameNode | null;
        if (gridSlot && variants.length) {
          clearBentoSlot(gridSlot);
          gridSlot.strokes = []; gridSlot.dashPattern = []; gridSlot.fills = [];
          gridSlot.layoutMode = 'NONE'; gridSlot.clipsContent = false;

          const items = variants.map(v => ({
            v, props: parseVariantProps(v.name),
            nx: 0, ny: 0, w: Math.round(v.width), h: Math.round(v.height),
            rx: Math.round(v.x), ry: Math.round(v.y),
          }));
          const minX = Math.min(...items.map(i => i.rx));
          const minY = Math.min(...items.map(i => i.ry));
          for (const it of items) { it.nx = it.rx - minX; it.ny = it.ry - minY; }

          const propNames = Array.from(new Set(items.flatMap(i => Object.keys(i.props))));
          const varying   = propNames.filter(p => new Set(items.map(i => i.props[p])).size > 1);
          const yReps = clusterPositions(items.map(i => i.ny), 6);
          const rowOf = (ny: number) => yReps.find(y => Math.abs(y - ny) <= 6) ?? ny;
          const rowProps = varying.filter(p =>
            yReps.every(y => new Set(items.filter(i => rowOf(i.ny) === y).map(i => i.props[p])).size === 1),
          );
          const colProps = varying.filter(p => !rowProps.includes(p));

          const GUTTER_Y = 34;
          // Create row labels first so we can measure the gutter width.
          const rowLabels: { t: TextNode; y: number; h: number }[] = [];
          for (const y of yReps) {
            const rep = items.find(i => rowOf(i.ny) === y)!;
            const txt = rowProps.map(p => rep.props[p]).filter(Boolean).join(' · ');
            if (!txt) continue;
            const t = mkAxisLabel(txt, 'Bold', 12, cLabel);
            gridSlot.appendChild(t);
            rowLabels.push({ t, y, h: rep.h });
          }
          const maxLW    = rowLabels.length ? Math.max(...rowLabels.map(r => r.t.width)) : 0;
          const GUTTER_X = Math.max(56, Math.round(maxLW) + 24);

          // Place the variant instances.
          let maxRight = 0, maxBottom = 0;
          for (const it of items) {
            const inst = it.v.createInstance();
            gridSlot.appendChild(inst);
            inst.x = GUTTER_X + it.nx;
            inst.y = GUTTER_Y + it.ny;
            maxRight  = Math.max(maxRight,  inst.x + it.w);
            maxBottom = Math.max(maxBottom, inst.y + it.h);
          }
          // Position row labels: right-aligned into the gutter, centered on the row.
          for (const r of rowLabels) {
            r.t.x = GUTTER_X - 16 - r.t.width;
            r.t.y = GUTTER_Y + r.y + Math.round(r.h / 2) - Math.round(r.t.height / 2);
          }
          // Column headers anchored to the top row.
          const topY   = Math.min(...yReps);
          const topRow = items.filter(i => rowOf(i.ny) === topY).sort((a, b) => a.nx - b.nx);
          for (const it of topRow) {
            const txt = colProps.map(p => it.props[p]).filter(Boolean).join(' · ');
            if (!txt) continue;
            const t = mkAxisLabel(txt, 'Regular', 11, cCaption);
            gridSlot.appendChild(t);
            t.x = GUTTER_X + it.nx;
            t.y = GUTTER_Y - 22;
          }
          gridSlot.resize(Math.max(maxRight + 24, gridSlot.width), maxBottom + 24);
        }

        // Slots row — hide unless the set actually uses native slots.
        const slotsRow = doc.findOne(n => n.name === 'row: slots');
        if (slotsRow) slotsRow.visible = setUsesNativeSlots(set);

        // Dark-mode preview — clone the finished grid and pin the clone to Dark.
        const darkSlot = find('@slot-dark-preview') as FrameNode | null;
        if (darkSlot && gridSlot) {
          clearBentoSlot(darkSlot);
          darkSlot.strokes = []; darkSlot.dashPattern = []; darkSlot.fills = [];
          darkSlot.layoutMode = 'NONE'; darkSlot.clipsContent = false;
          const gclone = gridSlot.clone();
          darkSlot.appendChild(gclone);
          gclone.x = 0; gclone.y = 0;
          if (themeColl && darkModeId) gclone.setExplicitVariableModeForCollection(themeColl, darkModeId);
          darkSlot.resize(Math.max(darkSlot.width, gclone.width), gclone.height + 8);
        }

        // Reflow — re-hug row/doc heights after the slot resizes.
        for (const child of doc.children) {
          if (child.type === 'FRAME') {
            const f = child as FrameNode;
            if (f.layoutMode === 'VERTICAL') f.primaryAxisSizingMode = 'AUTO';
            else if (f.layoutMode === 'HORIZONTAL') f.counterAxisSizingMode = 'AUTO';
          }
        }
        doc.primaryAxisSizingMode = 'AUTO';

        // Select + zoom to the new doc.
        const page = pageOfNode(set);
        if (page && page !== figma.currentPage) await figma.setCurrentPageAsync(page);
        figma.currentPage.selection = [doc];
        figma.viewport.scrollAndZoomIntoView([doc]);

        figma.ui.postMessage({
          type: 'bento:result',
          nodeId: doc.id,
          variantCount: variants.length,
          warning: meta.hadFence ? undefined
            : 'No s2a:meta fence in the set description — used placeholders for version / changelog / prose',
        });
      } catch (e: any) {
        figma.ui.postMessage({ type: 'bento:result', error: e.message || String(e) });
      }
      break;
    }

  }
};
