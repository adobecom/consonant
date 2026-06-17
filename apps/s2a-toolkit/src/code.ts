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

// ── Token group helpers ───────────────────────────────────────────────────────

function tokenGroup(name: string): string {
  const parts = name.split('/').filter(p => p !== 's2a');
  if (parts.length >= 4 && parts[1] === 'transparent') return parts[0] + ' / ' + parts[1] + ' / ' + parts[2];
  if (parts.length >= 3) return parts[0] + ' / ' + parts[1];
  return parts[0] ?? name;
}

function fmtTokenValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') return val;
  if (typeof val === 'boolean') return String(val);
  if (typeof val === 'object' && 'r' in (val as any)) {
    const c = val as { r: number; g: number; b: number; a?: number };
    const h = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    if (c.a !== undefined && Math.abs(c.a - 1) > 0.004) {
      return 'rgba(' + Math.round(c.r*255) + ', ' + Math.round(c.g*255) + ', ' + Math.round(c.b*255) + ', ' + (Math.round(c.a*100)/100) + ')';
    }
    return '#' + h(c.r) + h(c.g) + h(c.b);
  }
  return JSON.stringify(val);
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

    case 'get-settings': {
      try {
        const settings = await figma.clientStorage.getAsync('github-settings');
        figma.ui.postMessage({ type: 'settings-loaded', settings: settings ?? null });
      } catch {
        figma.ui.postMessage({ type: 'settings-loaded', settings: null });
      }
      break;
    }

    case 'save-settings': {
      try {
        await figma.clientStorage.setAsync('github-settings', msg.settings);
        figma.ui.postMessage({ type: 'settings-saved', success: true });
      } catch (e: any) {
        figma.ui.postMessage({ type: 'settings-saved', success: false, error: e.message || String(e) });
      }
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

    case 'token-docs:generate': {
      const collectionId = msg.collectionId as string;
      const group        = msg.group as string;
      try {
        // ── Text Styles path — 4 breakpoint sections from native text styles ──
        if (collectionId === 'text-styles') {
          const tsAllColls = await figma.variables.getLocalVariableCollectionsAsync();
          const responsiveColl = tsAllColls.find(c => /Responsive/.test(c.name));
          if (!responsiveColl) throw new Error('Responsive variable collection not found');

          const MODE_ORDER_TS = ['sm', 'md', 'lg', 'xl'];
          const tsSortedModes = [...responsiveColl.modes].sort((a, b) =>
            MODE_ORDER_TS.indexOf(a.name.toLowerCase()) - MODE_ORDER_TS.indexOf(b.name.toLowerCase())
          );

          const tsAllVars = await figma.variables.getLocalVariablesAsync();
          const allTypoVars = tsAllVars.filter(v =>
            v.variableCollectionId === responsiveColl.id &&
            v.name.toLowerCase().includes('/typography/')
          );

          // Resolve a variable's value for a specific mode, following up to 3 levels of aliases
          const resolveVarMode = async (v: Variable, modeId: string): Promise<number | null> => {
            let cur: any = v.valuesByMode[modeId];
            for (let depth = 0; depth < 3; depth++) {
              if (typeof cur === 'number') return cur;
              if (cur && typeof cur === 'object' && cur.type === 'VARIABLE_ALIAS') {
                try {
                  const ref = await figma.variables.getVariableByIdAsync(cur.id);
                  if (!ref) break;
                  cur = ref.valuesByMode[Object.keys(ref.valuesByMode)[0]];
                } catch { break; }
              } else { break; }
            }
            return typeof cur === 'number' ? cur : null;
          };

          const tsTextStyles = await figma.getLocalTextStylesAsync();
          const TS_STYLE_ORDER = [
            'super', 'heading-1', 'heading-2', 'heading-3', 'heading-4', 'heading-5', 'heading-6',
            'body-lg', 'body-md', 'body-sm', 'body-xs', 'eyebrow', 'label', 'caption',
          ];
          const typoStyles = tsTextStyles
            .filter(s => s.name.startsWith('s2a/typography/'))
            .sort((a, b) => {
              const an = a.name.replace('s2a/typography/', '');
              const bn = b.name.replace('s2a/typography/', '');
              const ai = TS_STYLE_ORDER.indexOf(an);
              const bi = TS_STYLE_ORDER.indexOf(bn);
              if (ai !== -1 && bi !== -1) return ai - bi;
              if (ai !== -1) return -1;
              if (bi !== -1) return 1;
              return a.name.localeCompare(b.name);
            });
          if (typoStyles.length === 0) throw new Error('No s2a/typography/* text styles found in this file');

          await Promise.all([
            figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Bold' }),
            figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Black' }).catch(() => {}),
            figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' }),
            figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' }),
            figma.loadFontAsync({ family: 'Adobe Clean', style: 'ExtraBold' }).catch(() => {}),
          ]);

          const themeColl = tsAllColls.find(c => c.id === DARK_VAR.collectionId)!;
          const tsDarkId  = themeColl.modes.find(m => m.name === 'Dark')!.modeId;

          const [tsVBg, tsVBorder, tsVBody, tsVSub, tsVKo] = await Promise.all([
            figma.variables.getVariableByIdAsync(DARK_VAR.bgKnockout),
            figma.variables.getVariableByIdAsync(DARK_VAR.borderSubtle),
            figma.variables.getVariableByIdAsync(DARK_VAR.cBodySubtle),
            figma.variables.getVariableByIdAsync(DARK_VAR.cSubheading),
            figma.variables.getVariableByIdAsync(DARK_VAR.cKnockout),
          ]);

          const tsPage     = figma.currentPage;
          const tsSections = tsPage.children.filter(n => n.type === 'SECTION') as SectionNode[];
          const tsLastSec  = tsSections.reduce<SectionNode | null>(
            (a, b) => (!a || b.y + b.height > a.y + a.height ? b : a), null
          );
          let tsPlaceY = tsLastSec ? tsLastSec.y + tsLastSec.height + 80 : 0;
          const tsPlaceX = tsLastSec?.x ?? 0;
          const TS_W = 2400, TS_M = 120;
          const createdSections: SectionNode[] = [];

          for (const mode of tsSortedModes) {
            const sec = figma.createSection();
            sec.name = `typography — ${mode.name}`;
            sec.x = tsPlaceX; sec.y = tsPlaceY;
            sec.resizeWithoutConstraints(TS_W, 800);

            const bgRect = figma.createRectangle();
            bgRect.resize(TS_W, 800); bgRect.x = 0; bgRect.y = 0;
            bgRect.fills = [{ type: 'SOLID', color: { r: 0.04, g: 0.04, b: 0.047 } }];
            sec.appendChild(bgRect);
            if (tsVBg) bfv(bgRect, tsVBg);

            const frame = figma.createFrame();
            frame.name = '.content';
            frame.fills = []; frame.clipsContent = false;
            frame.layoutMode = 'VERTICAL';
            frame.resize(TS_W, 800);
            frame.primaryAxisSizingMode   = 'AUTO';
            frame.counterAxisSizingMode   = 'FIXED';
            frame.paddingTop    = 160; frame.paddingBottom = 120;
            frame.paddingLeft   = TS_M; frame.paddingRight  = TS_M;
            frame.itemSpacing   = 0;
            frame.counterAxisAlignItems = 'MIN';
            frame.x = 0; frame.y = 0;
            sec.appendChild(frame);
            frame.setExplicitVariableModeForCollection(themeColl, tsDarkId);
            // Bind this section's text to the correct responsive breakpoint
            try { frame.setExplicitVariableModeForCollection(responsiveColl, mode.modeId); } catch {}

            const hT = (chars: string, family: string, style: string, size: number, v: Variable | null): TextNode => {
              const n = figma.createText();
              n.fontName = { family, style };
              n.fontSize = size;
              n.characters = chars;
              n.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              n.textAutoResize = 'HEIGHT';
              frame.appendChild(n);
              n.layoutSizingHorizontal = 'FILL';
              if (v) bfv(n, v);
              return n;
            };
            const hSp = (h: number): void => {
              const sp = figma.createFrame();
              sp.fills = []; sp.resize(TS_W - TS_M * 2, h);
              sp.primaryAxisSizingMode = 'FIXED';
              frame.appendChild(sp);
              sp.layoutSizingHorizontal = 'FILL';
            };
            const hDv = (): void => {
              const r = figma.createRectangle();
              r.resize(TS_W - TS_M * 2, 1);
              r.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }];
              frame.appendChild(r);
              r.layoutSizingHorizontal = 'FILL';
              if (tsVBorder) bfv(r, tsVBorder);
            };

            // Section header
            hT(`typography — ${mode.name}`, 'Adobe Clean Display', 'Bold', 56, tsVKo);
            hSp(24);
            hT(`S2A Responsive · ${mode.name.toUpperCase()} breakpoint`, 'Adobe Clean', 'Regular', 20, tsVBody);
            hSp(24);
            hT('May 2026  ·  @matt', 'Adobe Clean', 'Regular', 14, tsVBody);
            hSp(80);
            hDv();
            hSp(56);

            // One row per text style
            for (const ts of typoStyles) {
              const styleName = ts.name.replace('s2a/typography/', '');
              const fsVar = allTypoVars.find(v => v.name === `s2a/typography/font-size/${styleName}`) ?? null;
              const lhVar = allTypoVars.find(v => v.name === `s2a/typography/line-height/${styleName}`) ?? null;
              const lsVar = allTypoVars.find(v => v.name === `s2a/typography/letter-spacing/${styleName}`) ?? null;

              const isDisplayStyle = ['super', 'heading-1', 'heading-2'].includes(styleName);
              const isSmallStyle   = ['eyebrow', 'label', 'caption'].includes(styleName);
              const sampleText = isDisplayStyle ? 'Make anything.'
                : isSmallStyle ? 'Everything you need to make anything you want.'
                : 'Everything you need to make anything.';

              // Style name label
              hT(styleName, 'Adobe Clean', 'Bold', 11, tsVSub);
              hSp(8);

              // Text sample — inherits the section's responsive mode, displays at breakpoint scale
              const textNode = figma.createText();
              textNode.fontName = { family: 'Adobe Clean', style: 'Regular' };
              textNode.fontSize = 16;
              textNode.characters = sampleText;
              frame.appendChild(textNode);
              textNode.layoutSizingHorizontal = 'FILL';
              textNode.textAutoResize = 'HEIGHT';
              try { await textNode.setTextStyleIdAsync(ts.id); } catch {}
              if (fsVar) try { (textNode as any).setBoundVariable('fontSize', fsVar); } catch {}
              if (lhVar) try { (textNode as any).setBoundVariable('lineHeight', lhVar); } catch {}
              if (lsVar) try { (textNode as any).setBoundVariable('letterSpacing', lsVar); } catch {}
              if (tsVKo) bfv(textNode, tsVKo);
              // Variable bindings stay so the Annotate panel can read them on demand —
              // annotations are not pre-wired here to keep sections visually clean.

              // Resolved primitive values for this breakpoint — always shown, dashes if alias chain fails
              const fs = fsVar ? await resolveVarMode(fsVar, mode.modeId) : null;
              const lh = lhVar ? await resolveVarMode(lhVar, mode.modeId) : null;
              const ls = lsVar ? await resolveVarMode(lsVar, mode.modeId) : null;
              hSp(8);
              const fmtPx = (n: number | null) => n !== null ? n + 'px' : '—';
              const fmtLs = (n: number | null) => n === null ? '—' : n === 0 ? '0' : n.toFixed(2) + 'px';
              const vNode = figma.createText();
              vNode.fontName = { family: 'Adobe Clean', style: 'Regular' };
              vNode.fontSize = 13;
              vNode.characters = `font-size ${fmtPx(fs)}  ·  line-height ${fmtPx(lh)}  ·  letter-spacing ${fmtLs(ls)}`;
              frame.appendChild(vNode);
              vNode.layoutSizingHorizontal = 'FILL';
              vNode.textAutoResize = 'HEIGHT';
              if (tsVBody) bfv(vNode, tsVBody);

              hSp(32);
              hDv();
              hSp(32);
            }

            const finalH = frame.height;
            sec.resizeWithoutConstraints(TS_W, finalH);
            bgRect.resize(TS_W, finalH);

            tsPlaceY += finalH + 80;
            createdSections.push(sec);
          }

          if (createdSections.length > 0) figma.viewport.scrollAndZoomIntoView(createdSections);
          figma.notify(`${createdSections.length} typography breakpoint sections generated`);
          figma.ui.postMessage({ type: 'token-docs:result', sectionId: createdSections[0]?.id ?? '', count: createdSections.length });
          break;
        }

        // ── Section-padding path — 4 breakpoint sections ─────────────────
        if (group.toLowerCase().includes('section-padding')) {
          const spAllColls = await figma.variables.getLocalVariableCollectionsAsync();
          const spColl = spAllColls.find(c => c.id === collectionId);
          if (!spColl) throw new Error('Collection not found: ' + collectionId);

          const MODE_ORDER_SP = ['sm', 'md', 'lg', 'xl'];
          const spSortedModes = [...spColl.modes].sort((a, b) =>
            MODE_ORDER_SP.indexOf(a.name.toLowerCase()) - MODE_ORDER_SP.indexOf(b.name.toLowerCase())
          );

          const spAllVars = await figma.variables.getLocalVariablesAsync();
          const spVars = spAllVars.filter(v =>
            v.variableCollectionId === collectionId &&
            v.name.toLowerCase().includes('section-padding')
          );
          if (spVars.length === 0) throw new Error('No section-padding variables found in collection');

          const SP_SIZE_ORDER = ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
          const sortedSpVars = [...spVars].sort((a, b) => {
            const an = a.name.split('/').pop() ?? '';
            const bn = b.name.split('/').pop() ?? '';
            const ai = SP_SIZE_ORDER.indexOf(an);
            const bi = SP_SIZE_ORDER.indexOf(bn);
            if (ai !== -1 && bi !== -1) return ai - bi;
            if (ai !== -1) return -1;
            if (bi !== -1) return 1;
            return a.name.localeCompare(b.name);
          });

          const resolveSpMode = async (v: Variable, modeId: string): Promise<number | null> => {
            let cur: any = v.valuesByMode[modeId];
            for (let depth = 0; depth < 3; depth++) {
              if (typeof cur === 'number') return cur;
              if (cur && typeof cur === 'object' && cur.type === 'VARIABLE_ALIAS') {
                try {
                  const ref = await figma.variables.getVariableByIdAsync(cur.id);
                  if (!ref) break;
                  cur = ref.valuesByMode[Object.keys(ref.valuesByMode)[0]];
                } catch { break; }
              } else { break; }
            }
            return typeof cur === 'number' ? cur : null;
          };

          await Promise.all([
            figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Bold' }),
            figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' }),
            figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' }),
          ]);

          const spThemeColl = spAllColls.find(c => c.id === DARK_VAR.collectionId)!;
          const spDarkId    = spThemeColl.modes.find(m => m.name === 'Dark')!.modeId;

          const [spVBg, spVBorder, spVBody, spVSub, spVKo, spVBgSub] = await Promise.all([
            figma.variables.getVariableByIdAsync(DARK_VAR.bgKnockout),
            figma.variables.getVariableByIdAsync(DARK_VAR.borderSubtle),
            figma.variables.getVariableByIdAsync(DARK_VAR.cBodySubtle),
            figma.variables.getVariableByIdAsync(DARK_VAR.cSubheading),
            figma.variables.getVariableByIdAsync(DARK_VAR.cKnockout),
            figma.variables.getVariableByIdAsync(DARK_VAR.bgSubtle),
          ]);

          const spPage     = figma.currentPage;
          const spSections = spPage.children.filter(n => n.type === 'SECTION') as SectionNode[];
          const spLastSec  = spSections.reduce<SectionNode | null>(
            (a, b) => (!a || b.y + b.height > a.y + a.height ? b : a), null
          );
          let spPlaceY = spLastSec ? spLastSec.y + spLastSec.height + 80 : 0;
          const spPlaceX = spLastSec?.x ?? 0;
          const SP_W = 2400, SP_M = 120;
          const spCreated: SectionNode[] = [];

          for (const mode of spSortedModes) {
            const sec = figma.createSection();
            sec.name = `viewport / section-padding — ${mode.name}`;
            sec.x = spPlaceX; sec.y = spPlaceY;
            sec.resizeWithoutConstraints(SP_W, 800);

            const bgRect = figma.createRectangle();
            bgRect.resize(SP_W, 800); bgRect.x = 0; bgRect.y = 0;
            bgRect.fills = [{ type: 'SOLID', color: { r: 0.04, g: 0.04, b: 0.047 } }];
            sec.appendChild(bgRect);
            if (spVBg) bfv(bgRect, spVBg);

            const frame = figma.createFrame();
            frame.name = '.content';
            frame.fills = []; frame.clipsContent = false;
            frame.layoutMode = 'VERTICAL';
            frame.resize(SP_W, 800);
            frame.primaryAxisSizingMode   = 'AUTO';
            frame.counterAxisSizingMode   = 'FIXED';
            frame.paddingTop    = 160; frame.paddingBottom = 120;
            frame.paddingLeft   = SP_M; frame.paddingRight  = SP_M;
            frame.itemSpacing   = 0;
            frame.counterAxisAlignItems = 'MIN';
            frame.x = 0; frame.y = 0;
            sec.appendChild(frame);
            frame.setExplicitVariableModeForCollection(spThemeColl, spDarkId);
            try { frame.setExplicitVariableModeForCollection(spColl, mode.modeId); } catch {}

            const spHT = (chars: string, family: string, style: string, size: number, v: Variable | null): TextNode => {
              const n = figma.createText();
              n.fontName = { family, style };
              n.fontSize = size;
              n.characters = chars;
              n.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              n.textAutoResize = 'HEIGHT';
              frame.appendChild(n);
              n.layoutSizingHorizontal = 'FILL';
              if (v) bfv(n, v);
              return n;
            };
            const spHSp = (h: number): void => {
              const sp = figma.createFrame();
              sp.fills = []; sp.resize(SP_W - SP_M * 2, h);
              sp.primaryAxisSizingMode = 'FIXED';
              frame.appendChild(sp);
              sp.layoutSizingHorizontal = 'FILL';
            };
            const spHDv = (): void => {
              const r = figma.createRectangle();
              r.resize(SP_W - SP_M * 2, 1);
              r.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }];
              frame.appendChild(r);
              r.layoutSizingHorizontal = 'FILL';
              if (spVBorder) bfv(r, spVBorder);
            };

            // Section header
            spHT(`viewport / section-padding — ${mode.name}`, 'Adobe Clean Display', 'Bold', 56, spVKo);
            spHSp(24);
            spHT(`S2A Responsive · ${mode.name.toUpperCase()} breakpoint`, 'Adobe Clean', 'Regular', 20, spVBody);
            spHSp(24);
            spHT('May 2026  ·  @matt', 'Adobe Clean', 'Regular', 14, spVBody);
            spHSp(80);
            spHDv();
            spHSp(56);

            for (const sv of sortedSpVars) {
              const sizeName   = sv.name.split('/').pop() ?? sv.name;
              const cssVar     = '--' + sv.name.replace(/^s2a\//, 's2a-').replace(/\//g, '-');
              const resolvedPx = await resolveSpMode(sv, mode.modeId);
              const fmtPx      = (n: number | null) => n !== null ? n + 'px' : '—';

              // Horizontal row: info (left, fills) + swatch (right)
              const rowFrame = figma.createFrame();
              rowFrame.name = sizeName;
              rowFrame.fills = [];
              rowFrame.layoutMode = 'HORIZONTAL';
              rowFrame.primaryAxisSizingMode   = 'FIXED';
              rowFrame.counterAxisSizingMode   = 'AUTO';
              rowFrame.counterAxisAlignItems   = 'CENTER';
              rowFrame.itemSpacing = 32;
              rowFrame.resize(SP_W - SP_M * 2, 40);
              frame.appendChild(rowFrame);
              rowFrame.layoutSizingHorizontal = 'FILL';

              // Info column
              const infoCol = figma.createFrame();
              infoCol.name = 'info';
              infoCol.fills = [];
              infoCol.layoutMode = 'VERTICAL';
              infoCol.primaryAxisSizingMode = 'AUTO';
              infoCol.counterAxisSizingMode = 'AUTO';
              infoCol.itemSpacing = 4;
              rowFrame.appendChild(infoCol);
              infoCol.layoutSizingHorizontal = 'FILL';

              const nameNode = figma.createText();
              nameNode.fontName = { family: 'Adobe Clean', style: 'Bold' };
              nameNode.fontSize = 14;
              nameNode.characters = sizeName;
              nameNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              nameNode.textAutoResize = 'WIDTH_AND_HEIGHT';
              infoCol.appendChild(nameNode);
              if (spVKo) bfv(nameNode, spVKo);

              const metaNode = figma.createText();
              metaNode.fontName = { family: 'Adobe Clean', style: 'Regular' };
              metaNode.fontSize = 12;
              metaNode.characters = `${cssVar}  ·  ${fmtPx(resolvedPx)}`;
              metaNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              metaNode.textAutoResize = 'WIDTH_AND_HEIGHT';
              infoCol.appendChild(metaNode);
              if (spVBody) bfv(metaNode, spVBody);

              // Swatch column
              const swatchCol = figma.createFrame();
              swatchCol.name = 'swatch';
              swatchCol.fills = [];
              swatchCol.layoutMode = 'HORIZONTAL';
              swatchCol.primaryAxisSizingMode = 'AUTO';
              swatchCol.counterAxisSizingMode = 'AUTO';
              swatchCol.counterAxisAlignItems = 'CENTER';
              rowFrame.appendChild(swatchCol);

              const swSizePx = resolvedPx !== null && resolvedPx > 0 ? Math.min(resolvedPx, 120) : null;
              const swDisplay = swSizePx ?? 4;
              const sw = figma.createRectangle();
              sw.resize(swDisplay, swDisplay);
              sw.cornerRadius = 4;
              sw.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.35 } }];
              swatchCol.appendChild(sw);
              if (spVBgSub) bfv(sw, spVBgSub);
              if (swSizePx !== null) {
                try { (sw as any).setBoundVariable('width', sv); } catch {}
                try { (sw as any).setBoundVariable('height', sv); } catch {}
              }
              sw.setPluginData('s2aTokenVar', sv.name);
              sw.setPluginData('s2aTokenProp', 'spacing');

              spHSp(16);
            }

            spHDv();
            spHSp(56);

            const finalH = frame.height;
            sec.resizeWithoutConstraints(SP_W, finalH);
            bgRect.resize(SP_W, finalH);

            spPlaceY += finalH + 80;
            spCreated.push(sec);
          }

          if (spCreated.length > 0) figma.viewport.scrollAndZoomIntoView(spCreated);
          figma.notify(`${spCreated.length} section-padding breakpoint sections generated`);
          figma.ui.postMessage({ type: 'token-docs:result', sectionId: spCreated[0]?.id ?? '', count: spCreated.length });
          break;
        }

        // ── Data collection ─────────────────────────────────────────────
        const allVars   = await figma.variables.getLocalVariablesAsync();
        const groupVars = allVars.filter(v =>
          v.variableCollectionId === collectionId && tokenGroup(v.name) === group
        );
        if (groupVars.length === 0) throw new Error('No variables found for group: ' + group);

        const allColls      = await figma.variables.getLocalVariableCollectionsAsync();
        const coll          = allColls.find(c => c.id === collectionId);
        if (!coll) throw new Error('Collection not found: ' + collectionId);
        const defaultModeId = coll.defaultModeId;

        const rows: Array<{
          path: string; cssVar: string; value: string; alias: string;
          variable: Variable; resolvedType: VariableResolvedDataType; rawNum?: number;
        }> = [];

        for (const v of groupVars) {
          const rawVal = v.valuesByMode[defaultModeId];
          let value = '', alias = '';
          let rawNum: number | undefined;
          if (rawVal && typeof rawVal === 'object' && 'type' in rawVal && (rawVal as any).type === 'VARIABLE_ALIAS') {
            try {
              const refVar = await figma.variables.getVariableByIdAsync((rawVal as any).id);
              if (refVar) {
                alias = refVar.name;
                const refModeId = Object.keys(refVar.valuesByMode)[0];
                const refVal    = refVar.valuesByMode[refModeId];
                value = fmtTokenValue(refVal);
                if (typeof refVal === 'number') rawNum = refVal as number;
              }
            } catch {}
          } else {
            value = fmtTokenValue(rawVal);
            if (typeof rawVal === 'number') rawNum = rawVal as number;
          }
          rows.push({
            path: v.name,
            cssVar: '--' + v.name.replace(/\//g, '-'),
            value, alias,
            variable: v, resolvedType: v.resolvedType, rawNum,
          });
        }
        // Canonical t-shirt size order, then raw numeric, then alphabetical
        const TSHIRT: Record<string, number> = {
          'none': 0, 'base': 1, '5xs': 2, '4xs': 3, '3xs': 4, '2xs': 5, 'xs': 6,
          'sm': 7, 'md': 8, 'lg': 9, 'xl': 10, '2xl': 11, '3xl': 12, '4xl': 13, '5xl': 14,
          'round': 98, 'pill': 98, 'full': 98, 'circle': 99,
        };
        rows.sort((a, b) => {
          const ak = (a.path.split('/').pop() ?? '').toLowerCase();
          const bk = (b.path.split('/').pop() ?? '').toLowerCase();
          const ao = ak in TSHIRT ? TSHIRT[ak] : -1;
          const bo = bk in TSHIRT ? TSHIRT[bk] : -1;
          if (ao !== -1 && bo !== -1) return ao - bo;           // both t-shirt → canonical order
          if (ao !== -1) return -1;                              // only a is t-shirt → a first
          if (bo !== -1) return 1;                              // only b is t-shirt → b first
          if (a.rawNum !== undefined && b.rawNum !== undefined) return a.rawNum - b.rawNum; // numeric
          return a.path.localeCompare(b.path);                  // fallback alphabetical
        });

        // ── Fonts + token variables ──────────────────────────────────────
        await Promise.all([
          figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Bold' }),
          figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Black' }).catch(() => {}),
          figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' }),
          figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' }),
          figma.loadFontAsync({ family: 'Adobe Clean', style: 'ExtraBold' }).catch(() => {}),
        ]);

        const [vBg2, vBorder2, vBody2, vSub2, vKo2, vBgSub2] = await Promise.all([
          figma.variables.getVariableByIdAsync(DARK_VAR.bgKnockout),
          figma.variables.getVariableByIdAsync(DARK_VAR.borderSubtle),
          figma.variables.getVariableByIdAsync(DARK_VAR.cBodySubtle),
          figma.variables.getVariableByIdAsync(DARK_VAR.cSubheading),
          figma.variables.getVariableByIdAsync(DARK_VAR.cKnockout),
          figma.variables.getVariableByIdAsync(DARK_VAR.bgSubtle),
        ]);

        const themeColl = allColls.find(c => c.id === DARK_VAR.collectionId)!;
        const darkId    = themeColl.modes.find(m => m.name === 'Dark')!.modeId;

        // ── Placement ────────────────────────────────────────────────────
        const page = figma.currentPage;
        const pageSections = page.children.filter(n => n.type === 'SECTION') as SectionNode[];
        const lastSec = pageSections.reduce<SectionNode | null>(
          (a, b) => (!a || b.y + b.height > a.y + a.height ? b : a), null
        );
        const placeX = lastSec?.x ?? 0;
        const placeY = lastSec ? lastSec.y + lastSec.height + 80 : 0;

        const W = 2400, M = 120;

        // ── Section skeleton ─────────────────────────────────────────────
        const sec = figma.createSection();
        sec.name = group;
        sec.x = placeX; sec.y = placeY;
        sec.resizeWithoutConstraints(W, 800);

        const bgRect = figma.createRectangle();
        bgRect.resize(W, 800); bgRect.x = 0; bgRect.y = 0;
        bgRect.fills = [{ type: 'SOLID', color: { r: 0.04, g: 0.04, b: 0.047 } }];
        sec.appendChild(bgRect);
        if (vBg2) bfv(bgRect, vBg2);

        // .content: VERTICAL auto-layout so height auto-sizes to content
        const frame = figma.createFrame();
        frame.name = '.content';
        frame.fills = []; frame.clipsContent = false;
        frame.layoutMode = 'VERTICAL';
        frame.resize(W, 800);
        frame.primaryAxisSizingMode   = 'AUTO';
        frame.counterAxisSizingMode   = 'FIXED';
        frame.paddingTop    = 160;
        frame.paddingBottom = 120;
        frame.paddingLeft   = M;
        frame.paddingRight  = M;
        frame.itemSpacing   = 0;
        frame.counterAxisAlignItems = 'MIN';
        frame.x = 0; frame.y = 0;
        sec.appendChild(frame);
        frame.setExplicitVariableModeForCollection(themeColl, darkId);

        // ── Helpers ──────────────────────────────────────────────────────
        function hTxt(chars: string, family: string, style: string, size: number, v: Variable | null, fixedW?: number): TextNode {
          const n = figma.createText();
          n.fontName = { family, style };
          n.fontSize = size;
          n.characters = chars;
          n.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
          if (fixedW) n.resize(fixedW, n.height);
          n.textAutoResize = 'HEIGHT';
          frame.appendChild(n);
          if (!fixedW) n.layoutSizingHorizontal = 'FILL';
          if (v) bfv(n, v);
          return n;
        }

        function hSpacer(h: number): void {
          const sp = figma.createFrame();
          sp.fills = []; sp.resize(W - M * 2, h);
          sp.primaryAxisSizingMode = 'FIXED';
          frame.appendChild(sp);
          sp.layoutSizingHorizontal = 'FILL';
        }

        function hDiv(): void {
          const r = figma.createRectangle();
          r.resize(W - M * 2, 1);
          r.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }];
          frame.appendChild(r);
          r.layoutSizingHorizontal = 'FILL';
          if (vBorder2) bfv(r, vBorder2);
        }

        function bindStroke(node: SceneNode, v: Variable): void {
          const ss: Paint[] = [...((node as any).strokes ?? [])];
          if (!ss.length) return;
          ss[0] = figma.variables.setBoundVariableForPaint(ss[0] as SolidPaint, 'color', v);
          (node as any).strokes = ss;
        }

        // ── Header ───────────────────────────────────────────────────────
        hTxt(group, 'Adobe Clean Display', 'Bold', 56, vKo2);
        hSpacer(24);
        hTxt(coll.name, 'Adobe Clean', 'Regular', 20, vBody2, 1600);
        hSpacer(24);
        hTxt('May 2026  ·  @matt', 'Adobe Clean', 'Regular', 14, vBody2, 600);
        hSpacer(80);
        hDiv();
        hSpacer(56);

        // ── Token rows ───────────────────────────────────────────────────
        const gl = group.toLowerCase();
        const isTypography = gl.includes('typography');

        if (isTypography) {
          // Sort modes: sm → md → lg → xl
          const MODE_ORDER = ['sm', 'md', 'lg', 'xl'];
          const sortedModes = [...coll.modes].sort((a, b) =>
            MODE_ORDER.indexOf(a.name.toLowerCase()) - MODE_ORDER.indexOf(b.name.toLowerCase())
          );

          // All typography vars across font-size / line-height / letter-spacing
          const allTypoVars = allVars.filter(v =>
            v.variableCollectionId === collectionId &&
            v.name.toLowerCase().includes('/typography/')
          );

          const textStyles = await figma.getLocalTextStylesAsync();

          const STYLE_ORDER = [
            'super', 'heading-1', 'heading-2', 'heading-3', 'heading-4', 'heading-5', 'heading-6',
            'body-lg', 'body-md', 'body-sm', 'body-xs', 'eyebrow', 'label', 'caption',
          ];
          const availableStyles = STYLE_ORDER.filter(s =>
            allTypoVars.some(v => v.name.endsWith(`/${s}`))
          );

          for (const styleName of availableStyles) {
            const fsVar = allTypoVars.find(v => v.name === `s2a/typography/font-size/${styleName}`) ?? null;
            const lhVar = allTypoVars.find(v => v.name === `s2a/typography/line-height/${styleName}`) ?? null;
            const lsVar = allTypoVars.find(v => v.name === `s2a/typography/letter-spacing/${styleName}`) ?? null;
            const textStyle = textStyles.find(s => s.name === `s2a/typography/${styleName}`) ?? null;

            // Style label
            hTxt(styleName, 'Adobe Clean', 'Bold', 18, vSub2);
            hSpacer(12);

            // Sample text — shorter for large display styles to keep the layout readable
            const isDisplayStyle = ['super', 'heading-1', 'heading-2'].includes(styleName);
            const isSmallStyle = ['eyebrow', 'label', 'caption'].includes(styleName);
            const sampleText = isDisplayStyle ? 'Make anything.'
              : isSmallStyle ? 'Everything you need to make anything you want.'
              : 'Everything you need to make anything.';

            // 4 columns — one per breakpoint, each with an explicit mode override so
            // Figma renders the text at the actual scale for that breakpoint
            const bpFrame = figma.createFrame();
            bpFrame.name = '.breakpoints';
            bpFrame.layoutMode = 'HORIZONTAL';
            bpFrame.primaryAxisSizingMode = 'AUTO';
            bpFrame.counterAxisSizingMode = 'AUTO';
            bpFrame.itemSpacing = 1;
            bpFrame.fills = [];
            frame.appendChild(bpFrame);
            bpFrame.layoutSizingHorizontal = 'FILL';

            for (const mode of sortedModes) {
              const colFrame = figma.createFrame();
              colFrame.name = mode.name.toUpperCase();
              colFrame.layoutMode = 'VERTICAL';
              colFrame.primaryAxisSizingMode = 'AUTO';
              colFrame.counterAxisSizingMode = 'AUTO';
              colFrame.paddingTop = 24; colFrame.paddingBottom = 24;
              colFrame.paddingLeft = 24; colFrame.paddingRight = 24;
              colFrame.itemSpacing = 12;
              colFrame.fills = [];
              bpFrame.appendChild(colFrame);
              colFrame.layoutSizingHorizontal = 'FILL';
              // Explicit mode forces this column's text to resolve at the correct breakpoint
              try { colFrame.setExplicitVariableModeForCollection(coll, mode.modeId); } catch {}

              const modeLabel = figma.createText();
              modeLabel.fontName = { family: 'Adobe Clean', style: 'Bold' };
              modeLabel.fontSize = 11;
              modeLabel.characters = mode.name.toUpperCase();
              colFrame.appendChild(modeLabel);
              modeLabel.layoutSizingHorizontal = 'FILL';
              if (vSub2) bfv(modeLabel, vSub2);

              const textNode = figma.createText();
              textNode.fontName = { family: 'Adobe Clean', style: 'Regular' };
              textNode.fontSize = 16;
              textNode.characters = sampleText;
              colFrame.appendChild(textNode);
              textNode.layoutSizingHorizontal = 'FILL';
              textNode.textAutoResize = 'HEIGHT';
              if (textStyle) { try { await textNode.setTextStyleIdAsync(textStyle.id); } catch {} }
              if (fsVar) try { (textNode as any).setBoundVariable('fontSize', fsVar); } catch {}
              if (lhVar) try { (textNode as any).setBoundVariable('lineHeight', lhVar); } catch {}
              if (lsVar) try { (textNode as any).setBoundVariable('letterSpacing', lsVar); } catch {}
              if (vKo2) bfv(textNode, vKo2);
              const annProps: Array<{ type: string }> = [];
              if (fsVar) annProps.push({ type: 'fontSize' });
              if (lhVar) annProps.push({ type: 'lineHeight' });
              if (lsVar) annProps.push({ type: 'letterSpacing' });
              try { textNode.annotations = [{ label: `s2a/typography/${styleName}`, properties: annProps as any }]; } catch {}
            }

            hSpacer(24);
            hDiv();
            hSpacer(32);
          }
        } else {

        for (const row of rows) {
          // Row: HORIZONTAL frame, fills content width, text col + swatch col
          const rowFrame = figma.createFrame();
          rowFrame.name = row.path.split('/').pop() ?? row.path;
          rowFrame.layoutMode = 'HORIZONTAL';
          rowFrame.primaryAxisSizingMode = 'AUTO';
          rowFrame.counterAxisSizingMode = 'AUTO';
          rowFrame.paddingTop = 16; rowFrame.paddingBottom = 16;
          rowFrame.paddingLeft = 0; rowFrame.paddingRight = 0;
          rowFrame.itemSpacing = 40;
          rowFrame.counterAxisAlignItems = 'CENTER';
          rowFrame.fills = [];
          frame.appendChild(rowFrame);
          rowFrame.layoutSizingHorizontal = 'FILL';

          // Text column: VERTICAL, fills remaining width
          const textCol = figma.createFrame();
          textCol.name = '.text';
          textCol.layoutMode = 'VERTICAL';
          textCol.primaryAxisSizingMode = 'AUTO';
          textCol.counterAxisSizingMode = 'AUTO';
          textCol.itemSpacing = 4;
          textCol.fills = [];
          rowFrame.appendChild(textCol);
          textCol.layoutSizingHorizontal = 'FILL';

          const rTxt = (chars: string, style: string, size: number, v: Variable | null): TextNode => {
            const n = figma.createText();
            n.fontName = { family: 'Adobe Clean', style };
            n.fontSize = size;
            n.characters = chars;
            n.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
            n.textAutoResize = 'HEIGHT';
            textCol.appendChild(n);
            n.layoutSizingHorizontal = 'FILL';
            if (v) bfv(n, v);
            return n;
          };

          rTxt(row.path, 'Bold', 16, vSub2);
          rTxt(row.cssVar, 'Regular', 14, vBody2);
          rTxt(row.alias ? row.value + '  →  ' + row.alias : row.value, 'Regular', 14, vBody2);

          // Swatch column: fixed 200px wide, hugs content height, centers children
          const swatchCol = figma.createFrame();
          swatchCol.name = '.swatch';
          swatchCol.layoutMode = 'VERTICAL';
          swatchCol.counterAxisSizingMode = 'FIXED';
          swatchCol.primaryAxisAlignItems = 'CENTER';
          swatchCol.counterAxisAlignItems = 'CENTER';
          swatchCol.fills = [];
          rowFrame.appendChild(swatchCol);
          // Must set after appendChild — Figma resets sizing on insertion
          swatchCol.resize(200, 1);
          swatchCol.primaryAxisSizingMode = 'AUTO';
          swatchCol.layoutSizingVertical = 'HUG';

          // Annotation label = CSS variable name (the token designers + engineers reference)
          const annotLabel = row.cssVar;

          if (row.resolvedType === 'COLOR') {
            const sw = figma.createRectangle();
            sw.resize(200, 56);
            sw.cornerRadius = 6;
            // Transparent token groups need a contrast base so alpha is visible.
            // Use white base for black-alpha tokens, dark gray for white-alpha tokens,
            // a 50% gray split for generic transparent groups, nothing for solid colors.
            const isTransparentBlack = gl.includes('transparent') && gl.includes('black');
            const isTransparentWhite = gl.includes('transparent') && gl.includes('white');
            const isTransparent = gl.includes('transparent');
            const baseColor = isTransparentBlack ? { r: 1,   g: 1,   b: 1   }
                            : isTransparentWhite ? { r: 0.2, g: 0.2, b: 0.2 }
                            : isTransparent      ? { r: 0.5, g: 0.5, b: 0.5 }
                            : null;
            const placeholder: SolidPaint = { type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } };
            sw.fills = baseColor
              ? [{ type: 'SOLID', color: baseColor }, placeholder]  // base + variable layer
              : [placeholder];
            swatchCol.appendChild(sw);
            sw.layoutSizingHorizontal = 'FILL';
            try {
              const f = [...sw.fills] as SolidPaint[];
              const bindIdx = baseColor ? 1 : 0;
              f[bindIdx] = figma.variables.setBoundVariableForPaint(f[bindIdx], 'color', row.variable);
              sw.fills = f;
            } catch {}
            if (vBorder2) {
              sw.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              sw.strokeWeight = 1;
              sw.strokeAlign = 'INSIDE';
              bindStroke(sw, vBorder2);
            }
            sw.setPluginData('s2aTokenVar', annotLabel);
            sw.setPluginData('s2aTokenProp', 'fills');
            try { sw.annotations = [{ label: annotLabel, properties: [{ type: 'fills' }] }]; } catch {}
          } else if (row.resolvedType === 'FLOAT') {
            const num = row.rawNum ?? 4;
            if (gl.includes('radius')) {
              const sw = figma.createRectangle();
              sw.resize(80, 80);
              sw.cornerRadius = Math.min(num, 40);
              // Bind all four corners — 'cornerRadius' is not a valid bindable field
              if (num > 0) {
                for (const corner of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
                  try { (sw as any).setBoundVariable(corner, row.variable); } catch {}
                }
              }
              sw.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.25 } }];
              if (vBgSub2) bfv(sw, vBgSub2);
              sw.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              sw.strokeWeight = 1; sw.strokeAlign = 'INSIDE';
              if (vBorder2) bindStroke(sw, vBorder2);
              sw.setPluginData('s2aTokenVar', annotLabel);
              sw.setPluginData('s2aTokenProp', num > 0 ? 'cornerRadius' : 'fills');
              swatchCol.appendChild(sw);
              const crProp = num > 0 ? 'cornerRadius' : 'fills';
              try { sw.annotations = [{ label: annotLabel, properties: [{ type: crProp }] }]; } catch {}
            } else if (gl.includes('width') || gl.includes('stroke') || gl.includes('border')) {
              const sw = figma.createRectangle();
              sw.resize(80, 80);
              sw.fills = []; sw.cornerRadius = 4;
              sw.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              sw.strokeWeight = Math.max(1, Math.min(num, 20));
              sw.strokeAlign = 'CENTER';
              if (vBorder2) bindStroke(sw, vBorder2);
              try { (sw as any).setBoundVariable('strokeWeight', row.variable); } catch {}
              sw.setPluginData('s2aTokenVar', annotLabel);
              sw.setPluginData('s2aTokenProp', 'strokeWeight');
              swatchCol.appendChild(sw);
              try { sw.annotations = [{ label: annotLabel, properties: [{ type: 'strokeWeight' }] }]; } catch {}
            } else if (gl.includes('spacing') || gl.includes('gap') || gl.includes('padding') || gl.includes('margin')) {
              // Block/section padding tokens represent 2D space — show as a square
              const isBlockPadding = gl.includes('section-padding');
              const swSize = Math.max(num, isBlockPadding ? 4 : 1);
              const sw = figma.createRectangle();
              sw.resize(swSize, isBlockPadding ? swSize : 32);
              sw.cornerRadius = 4;
              sw.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.35 } }];
              if (vBgSub2) bfv(sw, vBgSub2);
              try { (sw as any).setBoundVariable('width', row.variable); } catch {}
              if (isBlockPadding) { try { (sw as any).setBoundVariable('height', row.variable); } catch {} }
              sw.setPluginData('s2aTokenVar', annotLabel);
              sw.setPluginData('s2aTokenProp', 'spacing');
              swatchCol.appendChild(sw);
              const annPropsSp = isBlockPadding
                ? [{ type: 'width' }, { type: 'height' }]
                : [{ type: 'width' }];
              try { sw.annotations = [{ label: annotLabel, properties: annPropsSp }]; } catch {}
            } else if (gl.includes('opacity')) {
              // Split swatch: left = 100% (reference), right = token opacity
              // Medium-gray bg bleeds through the right side to show the fade
              const swFrame = figma.createFrame();
              swFrame.name = '.opacity-swatch';
              swFrame.resize(160, 64);
              swFrame.cornerRadius = 8;
              swFrame.clipsContent = true;
              swFrame.fills = [{ type: 'SOLID', color: { r: 0.62, g: 0.62, b: 0.67 } }];
              const fullBlock = figma.createRectangle();
              fullBlock.resize(78, 64); fullBlock.x = 0; fullBlock.y = 0;
              fullBlock.fills = [{ type: 'SOLID', color: { r: 0.06, g: 0.06, b: 0.14 } }];
              fullBlock.opacity = 1;
              swFrame.appendChild(fullBlock);
              const fadeBlock = figma.createRectangle();
              fadeBlock.resize(78, 64); fadeBlock.x = 82; fadeBlock.y = 0;
              fadeBlock.fills = [{ type: 'SOLID', color: { r: 0.06, g: 0.06, b: 0.14 } }];
              fadeBlock.opacity = Math.max(0, Math.min(1, num / 100));
              swFrame.appendChild(fadeBlock);
              try { (fadeBlock as any).setBoundVariable('opacity', row.variable); } catch {}
              swatchCol.appendChild(swFrame);
              swFrame.setPluginData('s2aTokenVar', annotLabel);
              swFrame.setPluginData('s2aTokenProp', 'opacity');
              try { swFrame.annotations = [{ label: annotLabel, properties: [] }]; } catch {}
            } else if (gl.includes('blur')) {
              const swFrame = figma.createFrame();
              swFrame.name = '.blur-swatch';
              swFrame.resize(200, 80);
              swFrame.cornerRadius = 8;
              swFrame.clipsContent = true;
              swFrame.fills = [{ type: 'SOLID', color: { r: 0.06, g: 0.06, b: 0.08 } }];
              const bar = figma.createRectangle();
              bar.resize(160, 3);
              bar.x = 20; bar.y = 38;
              bar.cornerRadius = 2;
              bar.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.9 }];
              bar.effects = [{ type: 'LAYER_BLUR', radius: num, visible: true }];
              bar.constraints = { horizontal: 'STRETCH', vertical: 'CENTER' };
              swFrame.appendChild(bar);
              swatchCol.appendChild(swFrame);
              swFrame.setPluginData('s2aTokenVar', annotLabel);
              swFrame.setPluginData('s2aTokenProp', 'blur');
              try { swFrame.annotations = [{ label: annotLabel, properties: [] }]; } catch {}
            } else {
              const sw = figma.createRectangle();
              sw.resize(64, 64);
              sw.cornerRadius = 4;
              sw.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.24 } }];
              if (vBgSub2) bfv(sw, vBgSub2);
              swatchCol.appendChild(sw);
              try { sw.annotations = [{ label: annotLabel, properties: [{ type: 'width' }, { type: 'height' }] }]; } catch {}
            }
          }

          hDiv();
        }
        } // end else (non-typography)

        // ── Sync section to auto-sized content frame ─────────────────────
        const finalH = frame.height;
        sec.resizeWithoutConstraints(W, finalH);
        bgRect.resize(W, finalH);

        figma.viewport.scrollAndZoomIntoView([sec]);
        figma.notify(rows.length + ' tokens documented');
        figma.ui.postMessage({ type: 'token-docs:result', sectionId: sec.id, count: rows.length });
      } catch (e: any) {
        figma.ui.postMessage({ type: 'token-docs:result', error: e.message || String(e) });
      }
      break;
    }

    case 'spec:generate': {
      try {
      const setId = msg.setId as string;
      const opts  = (msg.options as { variants: boolean; tokens: boolean; children: boolean })
                 ?? { variants: true, tokens: true, children: true };

      const specSetNode = await figma.getNodeByIdAsync(setId);
      if (!specSetNode || (specSetNode.type !== 'COMPONENT_SET' && specSetNode.type !== 'COMPONENT')) {
        figma.ui.postMessage({ type: 'spec:result', error: 'Select a component or component set first' });
        break;
      }
      const specSet  = specSetNode as ComponentSetNode | ComponentNode;
      const variants: ComponentNode[] = specSetNode.type === 'COMPONENT_SET'
        ? ((specSetNode as ComponentSetNode).children as ComponentNode[])
        : [specSetNode as ComponentNode];

      await Promise.all([
        figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Bold' }),
        figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' }),
        figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' }),
      ]);

      // ── Property axes ──────────────────────────────────────────────────────
      const propDefs = specSet.componentPropertyDefinitions;
      const axes = Object.entries(propDefs)
        .filter(([, d]) => d.type === 'VARIANT')
        .map(([name, d]) => ({ name, values: (d as any).variantOptions as string[] }));

      // ── Token prefetch ─────────────────────────────────────────────────────
      const [vBg, vBorderSubtle, vBodySubtle, vSubheading, vKnockout] = await Promise.all([
        figma.variables.getVariableByIdAsync(DARK_VAR.bgKnockout),
        figma.variables.getVariableByIdAsync(DARK_VAR.borderSubtle),
        figma.variables.getVariableByIdAsync(DARK_VAR.cBodySubtle),
        figma.variables.getVariableByIdAsync(DARK_VAR.cSubheading),
        figma.variables.getVariableByIdAsync(DARK_VAR.cKnockout),
      ]);

      // Search the whole document for the .Surface Split component
      // loadAllPagesAsync required before root.findOne in dynamic-page mode
      await figma.loadAllPagesAsync();
      const splitComp = figma.root.findOne(
        (n: BaseNode) => n.type === 'COMPONENT' && (n as ComponentNode).name === '.Surface Split'
      ) as ComponentNode | null;

      const colls = await figma.variables.getLocalVariableCollectionsAsync();
      const coll  = colls.find(c => c.id === DARK_VAR.collectionId)!;
      const darkId  = coll?.modes.find(m => m.name === 'Dark')?.modeId;
      const lightId = coll?.modes.find(m => m.name === 'Light')?.modeId ?? coll?.defaultModeId;

      // ── Shared dark section factory ────────────────────────────────────────
      // Returns { sec, frame, mkTxt, gap, divider, finish }
      // `finish` resizes sec/bg/frame to the current cursor y + bottom pad.
      function makeDarkSection(name: string, w: number, x: number, y: number) {
        const sec = figma.createSection();
        sec.name = name;
        sec.x = x; sec.y = y;
        sec.resizeWithoutConstraints(w, 800);
        figma.currentPage.appendChild(sec);

        const bg = figma.createRectangle();
        bg.resize(w, 800); bg.x = 0; bg.y = 0;
        bg.fills = [{ type: 'SOLID', color: { r: 0.04, g: 0.04, b: 0.047 } }];
        sec.insertChild(0, bg);
        if (vBg) bfv(bg, vBg);

        const frame = figma.createFrame();
        frame.name = '.content';
        frame.fills = []; frame.clipsContent = false; frame.layoutMode = 'NONE';
        frame.resize(w, 800); frame.x = 0; frame.y = 0;
        sec.appendChild(frame);
        if (coll && darkId) frame.setExplicitVariableModeForCollection(coll, darkId);

        const M2 = 120, CW2 = w - 240;
        let cy = 0;

        function mkTxt(chars: string, family: string, style: string, size: number, v: Variable | null, ww?: number): TextNode {
          const n = figma.createText();
          n.fontName = { family, style }; n.fontSize = size;
          n.characters = chars;
          n.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
          n.x = M2; n.y = cy;
          if (ww) { n.resize(ww, n.height); n.textAutoResize = 'HEIGHT'; }
          else n.textAutoResize = 'WIDTH_AND_HEIGHT';
          frame.appendChild(n);
          if (v) bfv(n, v);
          cy += n.height;
          return n;
        }

        function gap(px: number): void { cy += px; }

        function divider(): void {
          const r = figma.createRectangle();
          r.resize(CW2, 1); r.x = M2; r.y = cy;
          r.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }];
          frame.appendChild(r);
          if (vBorderSubtle) bfv(r, vBorderSubtle);
          cy += 1;
        }

        function finish(bottomPad = 120): void {
          const finalH = cy + bottomPad;
          sec.resizeWithoutConstraints(w, finalH);
          bg.resize(w, finalH);
          frame.resize(w, finalH);
        }

        function getCy(): number { return cy; }
        function setCy(v2: number): void { cy = v2; }

        return { sec, frame, mkTxt, gap, divider, finish, getCy, setCy, M: M2, CW: CW2, BW: Math.min(1600, CW2) };
      }

      // ── Helper: annotate own structural tokens, skip sub-component internals ─
      //
      // Atom   (no nested instances): annotate everything — fills, strokes,
      //        radius, spacing, text color, typography.
      //
      // Molecule / Organism (has nested instances): annotate ONLY structural
      //        properties on frames and rects (fills, strokes, radius, padding,
      //        gap). Skip all TEXT nodes — their typography and color are already
      //        documented in the sub-component spec sections.
      function annotateTree(root: BaseNode): void {
        // Detect molecule/organism: any INSTANCE descendant inside root
        const isComposite = !!(root as any).findOne?.((n: BaseNode) => n.type === 'INSTANCE');

        function annotateNode(n: BaseNode): void {
          // Molecules/organisms: skip text nodes entirely
          if (isComposite && n.type === 'TEXT') return;

          const bv: Record<string, any> = (n as any).boundVariables ?? {};
          const anns: Array<{ labelMarkdown: string; properties: Array<{ type: string }> }> = [];

          if ((bv.fills?.length ?? 0) > 0)
            anns.push({ labelMarkdown: n.type === 'TEXT' ? 'Color' : 'Fill', properties: [{ type: 'fills' }] });
          if ((bv.strokes?.length ?? 0) > 0)
            anns.push({ labelMarkdown: 'Border', properties: [{ type: 'strokes' }] });
          if (bv.cornerRadius?.id || bv.topLeftRadius?.id)
            anns.push({ labelMarkdown: 'Radius', properties: [{ type: 'cornerRadius' }] });

          const sp: Array<{ type: string }> = [];
          if (bv.paddingTop || bv.paddingBottom || bv.paddingLeft || bv.paddingRight) sp.push({ type: 'padding' });
          if (bv.itemSpacing) sp.push({ type: 'itemSpacing' });
          if (sp.length) anns.push({ labelMarkdown: 'Spacing', properties: sp });

          // Typography only on atoms
          if (!isComposite && n.type === 'TEXT') {
            const tp: Array<{ type: string }> = [];
            if ((bv.fontSize?.length      ?? 0) > 0) tp.push({ type: 'fontSize' });
            if ((bv.lineHeight?.length    ?? 0) > 0) tp.push({ type: 'lineHeight' });
            if ((bv.letterSpacing?.length ?? 0) > 0) tp.push({ type: 'letterSpacing' });
            if (tp.length) anns.push({ labelMarkdown: 'Typography', properties: tp });
          }

          if (anns.length) { try { (n as any).annotations = anns; } catch {} }
        }

        annotateNode(root);
        function walkChildren(n: BaseNode): void {
          if (!('children' in n)) return;
          for (const child of (n as any).children) {
            annotateNode(child);
            if (child.type !== 'INSTANCE') walkChildren(child);
          }
        }
        walkChildren(root);
      }

      // ── Layout origin ──────────────────────────────────────────────────────
      const originX = specSet.x + specSet.width + 200;
      const originY = specSet.y;

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 1 — Overview: all variants, no annotations
      // ══════════════════════════════════════════════════════════════════════
      const OW = 2400;
      const s1 = makeDarkSection(specSet.name, OW, originX, originY);
      s1.setCy(160);

      s1.mkTxt(specSet.name, 'Adobe Clean Display', 'Bold', 56, vKnockout, s1.CW);
      s1.gap(24);

      const subtitle = `${variants.length} variant${variants.length !== 1 ? 's' : ''}` +
        (axes.length ? '  ·  ' + axes.map(a => a.name).join('  ·  ') : '');
      s1.mkTxt(subtitle, 'Adobe Clean', 'Regular', 20, vBodySubtle, s1.BW);
      s1.gap(24);

      const now = new Date();
      const monthName = now.toLocaleString('en-US', { month: 'long' });
      s1.mkTxt(`${monthName} ${now.getFullYear()}  ·  @matt`, 'Adobe Clean', 'Regular', 14, vBodySubtle, 600);
      s1.gap(80); s1.divider(); s1.gap(56);

      // Move the original component set into the doc section — no duplicate
      specSet.x = s1.M; specSet.y = s1.getCy();
      s1.frame.appendChild(specSet);
      // Reset to Light so it doesn't inherit the frame's Dark override
      if (coll && lightId) specSet.setExplicitVariableModeForCollection(coll, lightId);

      // Surface Split behind the component set (warm charcoal / deep-black backdrop)
      if (splitComp && coll) {
        const split = splitComp.createInstance();
        split.name = '.Surface Split';
        const csIdx = s1.frame.children.indexOf(specSet);
        s1.frame.insertChild(csIdx, split);
        const SP = 40;
        split.resizeWithoutConstraints(specSet.width + SP * 2, specSet.height + SP * 2);
        split.x = specSet.x - SP; split.y = specSet.y - SP;
        split.clearExplicitVariableModeForCollection(coll);
      }

      s1.setCy(s1.getCy() + specSet.height);
      s1.gap(56); s1.divider(); s1.gap(56);

      // Properties table
      s1.mkTxt('Properties', 'Adobe Clean', 'Bold', 18, vSubheading, s1.CW);
      s1.gap(12);
      if (axes.length) {
        s1.mkTxt(axes.map(a => `${a.name}: ${a.values.join(', ')}`).join('   ·   '), 'Adobe Clean', 'Regular', 18, vBodySubtle, s1.BW);
        s1.gap(32);
      }

      // Child components
      if (opts.children) {
        const childMap = new Map<string, ComponentSetNode>();
        const allInstances: InstanceNode[] = [];
        for (const v of variants)
          for (const n of [v as BaseNode, ...v.findAll(() => true)])
            if (n.type === 'INSTANCE') allInstances.push(n as InstanceNode);
        const mains = await Promise.all(allInstances.map(inst => inst.getMainComponentAsync().catch(() => null)));
        for (const main of mains) {
          if (main?.parent?.type === 'COMPONENT_SET') {
            const isSelf = specSet.type === 'COMPONENT_SET'
              ? main.parent.id === specSet.id
              : main.id === specSet.id;
            if (!isSelf) childMap.set(main.parent.id, main.parent as ComponentSetNode);
          }
        }

        if (childMap.size > 0) {
          s1.gap(24);
          s1.mkTxt('Uses', 'Adobe Clean', 'Bold', 18, vSubheading, s1.CW);
          s1.gap(12);
          s1.mkTxt([...childMap.values()].map(cs => cs.name).join('   ·   '), 'Adobe Clean', 'Regular', 18, vBodySubtle, s1.BW);
        }
      }

      s1.finish();
      const allCreated: SectionNode[] = [s1.sec];

      // ══════════════════════════════════════════════════════════════════════
      // SECTIONS 2+ — One per variant, with native annotations
      // ══════════════════════════════════════════════════════════════════════
      if (opts.tokens) {
        // Compact width: enough room for the component + annotation bubbles
        const maxCompW = Math.max(...variants.map(v => v.width));
        const VW = Math.max(800, maxCompW + 600);
        const varSecX = originX + OW + 120;
        let varSecY = originY;

        for (const variant of variants) {
          // Simplify the variant name to readable values only
          // "State=default, Size=md" → "default  ·  md"
          const readableName = variant.name
            .split(', ')
            .map(p => p.split('=')[1] ?? p)
            .join('  ·  ');

          const vs = makeDarkSection(`${specSet.name} — ${readableName}`, VW, varSecX, varSecY);
          vs.setCy(60);

          // Variant label
          vs.mkTxt(readableName, 'Adobe Clean', 'Bold', 18, vSubheading);
          vs.gap(6);
          vs.mkTxt(specSet.name, 'Adobe Clean', 'Regular', 13, vBodySubtle);
          vs.gap(24); vs.divider();

          // Track where content area starts — Surface Split fills from here to section bottom
          const contentAreaY = vs.getCy();

          // Single instance — annotated
          // Large padding so annotation bubbles have room to spread
          const annotPad = Math.max(240, variant.height * 4);
          vs.gap(annotPad);
          const inst = variant.createInstance();
          inst.x = vs.M; inst.y = vs.getCy();
          vs.frame.appendChild(inst);
          // Reset to Light so instance doesn't inherit the frame's Dark override
          if (coll && lightId) inst.setExplicitVariableModeForCollection(coll, lightId);
          annotateTree(inst);
          vs.setCy(vs.getCy() + inst.height);
          vs.gap(annotPad);

          vs.finish(0);

          // Surface Split backdrop — inserted behind the instance, spans content area
          if (splitComp && coll) {
            const split = splitComp.createInstance();
            split.name = '.Surface Split';
            const instIdx = vs.frame.children.indexOf(inst);
            vs.frame.insertChild(Math.max(0, instIdx), split);
            split.resizeWithoutConstraints(VW, vs.sec.height - contentAreaY);
            split.x = 0; split.y = contentAreaY;
            split.clearExplicitVariableModeForCollection(coll);
          }

          allCreated.push(vs.sec);
          varSecY += vs.sec.height + 240;
        }
      }

      figma.currentPage.selection = allCreated;
      figma.viewport.scrollAndZoomIntoView(allCreated);
      figma.ui.postMessage({ type: 'spec:result', variantCount: variants.length });
      } catch (e: any) {
        figma.ui.postMessage({ type: 'spec:result', error: e.message || String(e) });
      }
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
  }
};
