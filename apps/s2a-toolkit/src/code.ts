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
    setId: first.type === 'COMPONENT_SET' ? first.id : null,
    nodeId: first.id,
    nodeName: first.name,
    nodeType: first.type,
    fileKey: figma.fileKey || null,
    fileName: figma.root.name,
    width: 'width' in first ? Math.round((first as FrameNode).width) : undefined,
    height: 'height' in first ? Math.round((first as FrameNode).height) : undefined,
    variantCount: first.type === 'COMPONENT_SET' ? (first as ComponentSetNode).children.length : undefined,
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
      let formatted = 0;
      for (const section of sections) {
        try {
          section.fills = [];
          formatted++;
        } catch {}
      }
      const note = formatted === 1 ? 'Section cleared' : `${formatted} sections cleared`;
      figma.notify(note);
      figma.ui.postMessage({ type: 'format-section:done', count: formatted });
      break;
    }

    case 'resize-for-view': {
      const w = (msg.width as number) || 320;
      const h = (msg.height as number) || 480;
      figma.ui.resize(w, h);
      break;
    }

    case 'annotate:apply': {
      const nodeId    = msg.nodeId as string;
      const categories = new Set((msg.categories as string[]) ?? []);
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) { figma.ui.postMessage({ type: 'annotate:result', error: 'Node not found' }); break; }

      const allNodes: BaseNode[] = [node];
      if ('findAll' in node) allNodes.push(...(node as any).findAll(() => true) as BaseNode[]);

      // Prefetch font-weight variable names so we avoid await inside the loop
      const weightVarIds = new Set<string>();
      for (const n of allNodes) {
        const fs = (n as any).boundVariables?.fontStyle;
        if (fs?.[0]?.id) weightVarIds.add(fs[0].id);
      }
      const weightNames = new Map<string, string>();
      await Promise.all([...weightVarIds].map(async id => {
        try { const v = await figma.variables.getVariableByIdAsync(id); if (v) weightNames.set(id, v.name); } catch {}
      }));

      let annotated = 0;
      for (const n of allNodes) {
        const bv = (n as any).boundVariables ?? {};
        const anns: Array<{ labelMarkdown: string; properties: Array<{ type: string }> }> = [];

        if (categories.has('color-fg') && n.type === 'TEXT' && (bv.fills?.length ?? 0) > 0)
          anns.push({ labelMarkdown: 'Color', properties: [{ type: 'fills' }] });

        if (categories.has('color-bg') && n.type !== 'TEXT' && (bv.fills?.length ?? 0) > 0)
          anns.push({ labelMarkdown: 'Background', properties: [{ type: 'fills' }] });

        if (categories.has('spacing')) {
          const sp: Array<{ type: string }> = [];
          if (bv.paddingTop || bv.paddingBottom || bv.paddingLeft || bv.paddingRight) sp.push({ type: 'padding' });
          if (bv.itemSpacing) sp.push({ type: 'itemSpacing' });
          if (sp.length) anns.push({ labelMarkdown: 'Spacing', properties: sp });
        }

        if (categories.has('shape')) {
          const sh: Array<{ type: string }> = [];
          if (bv.cornerRadius) sh.push({ type: 'cornerRadius' });
          if ((bv.strokes?.length ?? 0) > 0) sh.push({ type: 'strokes' });
          if (sh.length) anns.push({ labelMarkdown: 'Shape', properties: sh });
        }

        if (categories.has('typography') && n.type === 'TEXT') {
          const tp: Array<{ type: string }> = [];
          if ((bv.fontFamily?.length    ?? 0) > 0) tp.push({ type: 'fontFamily' });
          if ((bv.fontSize?.length      ?? 0) > 0) tp.push({ type: 'fontSize' });
          if ((bv.lineHeight?.length    ?? 0) > 0) tp.push({ type: 'lineHeight' });
          if ((bv.letterSpacing?.length ?? 0) > 0) tp.push({ type: 'letterSpacing' });
          if (tp.length) anns.push({ labelMarkdown: 'Typography', properties: tp });
          if ((bv.fontStyle?.length ?? 0) > 0) {
            const label = weightNames.get(bv.fontStyle[0].id) ?? 'font-weight';
            anns.push({ labelMarkdown: label, properties: [{ type: 'fontWeight' }] });
          }
        }

        if (categories.has('sizing') && n === node)
          anns.push({ labelMarkdown: (node as SceneNode).name.replace(/^\./, ''), properties: [{ type: 'width' }, { type: 'height' }] });

        if (anns.length > 0) {
          try { (n as any).annotations = anns; annotated++; } catch {}
        }
      }
      figma.ui.postMessage({ type: 'annotate:result', annotated });
      break;
    }

    case 'annotate:clear': {
      const nodeId = msg.nodeId as string;
      const node = await figma.getNodeByIdAsync(nodeId);
      if (node) {
        const all: BaseNode[] = [node];
        if ('findAll' in node) all.push(...(node as any).findAll(() => true) as BaseNode[]);
        let cleared = 0;
        for (const n of all) {
          try { if ((n as any).annotations?.length > 0) { (n as any).annotations = []; cleared++; } } catch {}
        }
        figma.ui.postMessage({ type: 'annotate:cleared', cleared });
      } else {
        figma.ui.postMessage({ type: 'annotate:cleared', cleared: 0 });
      }
      break;
    }

    case 'spec:generate': {
      try {
      const setId = msg.setId as string;
      const opts  = (msg.options as { variants: boolean; tokens: boolean; children: boolean })
                 ?? { variants: true, tokens: true, children: true };

      const specSetNode = await figma.getNodeByIdAsync(setId);
      if (!specSetNode || specSetNode.type !== 'COMPONENT_SET') {
        figma.ui.postMessage({ type: 'spec:result', error: 'Select a component set first' });
        break;
      }
      const specSet  = specSetNode as ComponentSetNode;
      const variants = specSet.children as ComponentNode[];

      await Promise.all([
        figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
        figma.loadFontAsync({ family: 'Inter', style: 'Medium' }),
        figma.loadFontAsync({ family: 'Inter', style: 'Bold' }),
        figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' }).catch(() => {}),
        figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' }).catch(() => {}),
        figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Black' }).catch(() => {}),
      ]);

      const allTextStyles = await figma.getLocalTextStylesAsync();
      function findStyle(query: string): TextStyle | undefined {
        const q = query.toLowerCase();
        return allTextStyles.find(s => s.name.toLowerCase().includes(q));
      }

      // ── Property axes ──────────────────────────────────────────────────────
      const propDefs = specSet.componentPropertyDefinitions;
      const axes = Object.entries(propDefs)
        .filter(([, d]) => d.type === 'VARIANT')
        .map(([name, d]) => ({ name, values: (d as any).variantOptions as string[] }));

      function parseProps(v: ComponentNode): Record<string, string> {
        const r: Record<string, string> = {};
        for (const part of v.name.split(', ')) {
          const eq = part.indexOf('=');
          if (eq > 0) r[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
        }
        return r;
      }

      const defaults: Record<string, string> = {};
      for (const ax of axes) defaults[ax.name] = ax.values[0];

      function pickVariant(override: Record<string, string>): ComponentNode {
        const target = { ...defaults, ...override };
        return variants.find(v => {
          const p = parseProps(v);
          return Object.entries(target).every(([k, val]) => p[k] === val);
        }) ?? variants[0];
      }

      // ── Scoped annotation helpers ─────────────────────────────────────────
      function applyAnnotations(nodes: BaseNode[]): void {
        for (const n of nodes) {
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

          if (n.type === 'TEXT') {
            const tp: Array<{ type: string }> = [];
            if ((bv.fontSize?.length      ?? 0) > 0) tp.push({ type: 'fontSize' });
            if ((bv.lineHeight?.length    ?? 0) > 0) tp.push({ type: 'lineHeight' });
            if ((bv.letterSpacing?.length ?? 0) > 0) tp.push({ type: 'letterSpacing' });
            if (tp.length) anns.push({ labelMarkdown: 'Typography', properties: tp });
          }

          if (anns.length) { try { (n as any).annotations = anns; } catch {} }
        }
      }

      function annotateScope(inst: InstanceNode, scope: 'root' | string): void {
        if (scope === 'root') {
          const nodes: BaseNode[] = [inst as BaseNode];
          for (const c of inst.children as BaseNode[]) {
            nodes.push(c);
            nodes.push(...((c as any).children ?? []) as BaseNode[]);
          }
          applyAnnotations(nodes);
        } else {
          const target = inst.findOne(n => n.name === scope) as SceneNode | null;
          if (!target) return;
          const descendants = 'findAll' in target
            ? (target as FrameNode).findAll(() => true)
            : [];
          applyAnnotations([target as BaseNode, ...descendants]);
        }
      }

      const refVariant = variants[0];
      const refRootFrame = refVariant.children[0] as FrameNode | undefined;
      const topLevelLayerNames: string[] = refRootFrame
        ? (refRootFrame.children as SceneNode[]).map(c => c.name)
        : [];

      // ── Token prefetch ────────────────────────────────────────────────────
      const [
        borderColorVar, borderWidthVar, radiusXsVar,
        contentHeadingVar, contentDefaultVar, contentSubtleVar,
      ] = await Promise.all([
        figma.variables.getVariableByIdAsync('VariableID:6:22'),       // s2a/color/border/subtle
        figma.variables.getVariableByIdAsync('VariableID:2:111'),      // s2a/border/width/sm
        figma.variables.getVariableByIdAsync('VariableID:2:97'),       // s2a/border/radius/xs
        figma.variables.getVariableByIdAsync('VariableID:2483:41398'), // s2a/color/content/heading
        figma.variables.getVariableByIdAsync('VariableID:6:82'),       // s2a/color/content/default
        figma.variables.getVariableByIdAsync('VariableID:6:84'),       // s2a/color/content/subtle
      ]);

      function setBorder(node: FrameNode): void {
        node.fills = [];
        node.strokes = borderColorVar
          ? [figma.variables.setBoundVariableForPaint(
              { type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } },
              'color', borderColorVar
            )]
          : [{ type: 'SOLID', color: { r: 0.871, g: 0.871, b: 0.871 } }];
        node.strokeWeight = 1;
        node.cornerRadius = 4;
        if (borderWidthVar) { try { node.setBoundVariable('strokeWeight', borderWidthVar); } catch {} }
        if (radiusXsVar)    { try { node.setBoundVariable('cornerRadius', radiusXsVar);   } catch {} }
      }

      // ── Layout constants ───────────────────────────────────────────────────
      const SEC_PAD  = 48;
      const refW     = variants[0].width;
      const REF_PAD  = Math.max(80, Math.round(refW * 0.5));
      const CARD_PAD = Math.max(28, Math.round(refW * 0.25));
      const CARD_W   = Math.max(120, refW + CARD_PAD * 2); // column spacing reference
      const CARD_GAP = 20;
      const LBL_GAP  = 10;

      // ── Section ────────────────────────────────────────────────────────────
      const sec = figma.createSection();
      sec.name = 'Annotations — ' + specSet.name;
      sec.x = specSet.x + specSet.width + 100;
      sec.y = specSet.y;
      figma.currentPage.appendChild(sec);
      try { (sec as any).fills = []; } catch {}

      // ── Text style queue ──────────────────────────────────────────────────
      type Var = Variable | null;
      const styleQueue: Array<{ node: TextNode; query: string; colorVar: Var }> = [];

      function bindFill(node: TextNode, colorVar: Var): void {
        if (colorVar) {
          node.fills = [figma.variables.setBoundVariableForPaint(
            { type: 'SOLID', color: { r: 0.067, g: 0.067, b: 0.067 } },
            'color', colorVar
          )];
        }
      }

      async function flushStyles(): Promise<void> {
        await Promise.all(styleQueue.map(async ({ node, query, colorVar }) => {
          const style = findStyle(query);
          if (style) { try { await node.setTextStyleIdAsync(style.id); } catch {} }
          bindFill(node, colorVar);
        }));
        styleQueue.length = 0;
      }

      // Creates a text node inside `sec`, queues S2A style + color token binding.
      function txt(
        content: string, styleQuery: string,
        colorVar: Var,
        x: number, y: number,
        extra: { upper?: boolean; ls?: number } = {}
      ): TextNode {
        const t = figma.createText();
        t.fontName = { family: 'Inter', style: 'Regular' };
        t.characters = content;
        if (extra.upper) t.textCase = 'UPPER';
        if (extra.ls)    t.letterSpacing = { value: extra.ls, unit: 'PERCENT' };
        t.textAutoResize = 'WIDTH_AND_HEIGHT';
        sec.appendChild(t);
        t.x = x; t.y = y;
        styleQueue.push({ node: t, query: styleQuery, colorVar });
        return t;
      }

      function eyebrow(label: string, x: number, y: number): TextNode {
        return txt(label, 'eyebrow', contentSubtleVar, x, y, { upper: true, ls: 8 });
      }

      let curY = SEC_PAD;

      // ── Page title ─────────────────────────────────────────────────────────
      txt(specSet.name.toUpperCase() + ' · SPEC', 'eyebrow', contentSubtleVar, SEC_PAD, curY, { upper: true, ls: 8 });
      txt(specSet.name, 'heading-lg', contentHeadingVar, SEC_PAD, curY + 18);
      txt(
        `${variants.length} variant${variants.length !== 1 ? 's' : ''}` +
        (axes.length ? '  ·  ' + axes.map(a => a.name).join('  ·  ') : ''),
        'body-md', contentSubtleVar, SEC_PAD, curY + 56
      );
      curY += 96;

      // ── One row per variant axis ────────────────────────────────────────────
      if (opts.variants) {
        const axesToShow = axes.length > 0
          ? axes
          : [{ name: 'Variants', values: variants.map(v => v.name) }];

        for (const ax of axesToShow) {
          eyebrow(ax.name, SEC_PAD, curY);
          curY += 22;

          let rowMaxH = 0;
          for (let i = 0; i < ax.values.length; i++) {
            const val = ax.values[i];
            const variant = axes.length > 0
              ? pickVariant({ [ax.name]: val })
              : (variants.find(v => v.name === val) ?? variants[0]);

            const cx = SEC_PAD + i * (CARD_W + CARD_GAP);

            const card = figma.createFrame();
            card.name = 'card-' + val;
            card.layoutMode = 'VERTICAL';
            card.primaryAxisSizingMode = 'AUTO';
            card.counterAxisSizingMode = 'AUTO';
            card.primaryAxisAlignItems = 'CENTER';
            card.counterAxisAlignItems = 'CENTER';
            card.paddingTop    = CARD_PAD;
            card.paddingBottom = CARD_PAD;
            card.paddingLeft   = CARD_PAD;
            card.paddingRight  = CARD_PAD;
            setBorder(card);
            sec.appendChild(card);
            card.x = cx; card.y = curY;

            const inst = variant.createInstance();
            card.appendChild(inst);
            rowMaxH = Math.max(rowMaxH, card.height);

            const lbl = txt(val, 'label', contentDefaultVar, 0, curY + card.height + LBL_GAP);
            lbl.x = cx + Math.round((card.width - lbl.width) / 2);
          }

          curY += rowMaxH + LBL_GAP + 24 + 40;
        }
      }

      // ── Child components ───────────────────────────────────────────────────
      if (opts.children) {
        const childMap = new Map<string, ComponentSetNode>();
        // Collect all instance nodes across all variants, then batch-resolve
        // their main components in parallel instead of sequential awaits.
        const allInstances: InstanceNode[] = [];
        for (const v of variants)
          for (const n of [v as BaseNode, ...v.findAll(() => true)])
            if (n.type === 'INSTANCE') allInstances.push(n as InstanceNode);

        const mains = await Promise.all(
          allInstances.map(inst => inst.getMainComponentAsync().catch(() => null))
        );
        for (const main of mains) {
          if (main?.parent?.type === 'COMPONENT_SET' && main.parent.id !== specSet.id)
            childMap.set(main.parent.id, main.parent as ComponentSetNode);
        }

        if (childMap.size > 0) {
          eyebrow('Child components', SEC_PAD, curY);
          curY += 22;

          let childX = SEC_PAD;
          const CHILD_PAD = 20;
          for (const [, cs] of childMap) {
            const csRef = cs.children[0] as ComponentNode;

            const card = figma.createFrame();
            card.name = 'child-' + cs.name;
            card.layoutMode = 'VERTICAL';
            card.primaryAxisSizingMode = 'AUTO';
            card.counterAxisSizingMode = 'AUTO';
            card.primaryAxisAlignItems = 'CENTER';
            card.counterAxisAlignItems = 'CENTER';
            card.paddingTop    = CHILD_PAD;
            card.paddingBottom = CHILD_PAD;
            card.paddingLeft   = CHILD_PAD;
            card.paddingRight  = CHILD_PAD;
            card.itemSpacing   = 12;
            setBorder(card);
            sec.appendChild(card);
            card.x = childX; card.y = curY;

            try {
              const ci = csRef.createInstance();
              card.appendChild(ci);
            } catch {}

            const cnLbl = figma.createText();
            cnLbl.fontName = { family: 'Inter', style: 'Regular' };
            cnLbl.characters = cs.name;
            cnLbl.textAutoResize = 'WIDTH_AND_HEIGHT';
            card.appendChild(cnLbl);
            styleQueue.push({ node: cnLbl, query: 'label', colorVar: contentDefaultVar });

            childX += card.width + 16;
          }
        }
      }

      // ── Fit main section ───────────────────────────────────────────────────
      await flushStyles();
      let maxR = 0, maxB = 0;
      for (const n of sec.children) {
        const sn = n as SceneNode;
        maxR = Math.max(maxR, sn.x + sn.width);
        maxB = Math.max(maxB, sn.y + sn.height);
      }
      try { sec.resizeWithoutConstraints(maxR + SEC_PAD, maxB + SEC_PAD); } catch {}

      // ── Annotated reference sections (one per structural layer) ────────────
      const allCreated: SectionNode[] = [sec];

      if (opts.tokens) {
        const scopes: Array<{ key: 'root' | string; label: string }> = [
          { key: 'root', label: 'Root' },
          ...topLevelLayerNames.map(name => ({ key: name, label: name })),
        ];

        const REF_SEC_GAP = 200;
        const refSecX = sec.x + sec.width + 120;
        let refSecY = sec.y;

        for (const { key, label } of scopes) {
          const refSec = figma.createSection();
          refSec.name = label;
          figma.currentPage.appendChild(refSec);
          try { (refSec as any).fills = []; } catch {}

          const eb = figma.createText();
          eb.fontName = { family: 'Inter', style: 'Regular' };
          eb.characters = label.toUpperCase();
          eb.textCase = 'UPPER';
          eb.letterSpacing = { value: 8, unit: 'PERCENT' };
          eb.textAutoResize = 'WIDTH_AND_HEIGHT';
          refSec.appendChild(eb);
          eb.x = SEC_PAD; eb.y = SEC_PAD;
          styleQueue.push({ node: eb, query: 'eyebrow', colorVar: contentSubtleVar });

          const panelY = SEC_PAD + 22 + 12;
          const panel = figma.createFrame();
          panel.name = 'panel';
          panel.layoutMode = 'VERTICAL';
          panel.primaryAxisSizingMode = 'AUTO';
          panel.counterAxisSizingMode = 'AUTO';
          panel.primaryAxisAlignItems = 'CENTER';
          panel.counterAxisAlignItems = 'CENTER';
          panel.paddingTop    = REF_PAD;
          panel.paddingBottom = REF_PAD;
          panel.paddingLeft   = REF_PAD;
          panel.paddingRight  = REF_PAD;
          setBorder(panel);
          refSec.appendChild(panel);
          panel.x = SEC_PAD; panel.y = panelY;

          const inst = refVariant.createInstance();
          panel.appendChild(inst);
          annotateScope(inst, key);

          await flushStyles();

          const secW = Math.max(panel.width, eb.width) + SEC_PAD * 2;
          const secH = panelY + panel.height + SEC_PAD;
          try { refSec.resizeWithoutConstraints(secW, secH); } catch {}

          refSec.x = refSecX;
          refSec.y = refSecY;
          refSecY += secH + REF_SEC_GAP;

          allCreated.push(refSec);
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
