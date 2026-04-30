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

  // Always notify with full node info for prototype panel
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
      const setId      = msg.setId as string;
      const categories = (msg.categories as string[]) ?? [];

      if (categories.length === 0) {
        figma.ui.postMessage({ type: 'spec:result', error: 'Select at least one category' });
        break;
      }

      const specSetNode = await figma.getNodeByIdAsync(setId);
      if (!specSetNode || specSetNode.type !== 'COMPONENT_SET') {
        figma.ui.postMessage({ type: 'spec:result', error: 'Component set not found — select it and try again' });
        break;
      }
      const specSet = specSetNode as ComponentSetNode;
      const variants = specSet.children as ComponentNode[];

      // Prefetch all fontStyle variable IDs across all variants
      const specWeightIds = new Set<string>();
      for (const v of variants) {
        for (const n of [v as BaseNode, ...v.findAll(() => true)]) {
          const fs = (n as any).boundVariables?.fontStyle;
          if (fs?.[0]?.id) specWeightIds.add(fs[0].id);
        }
      }
      const specWeightNames = new Map<string, string>();
      await Promise.all([...specWeightIds].map(async id => {
        try { const v = await figma.variables.getVariableByIdAsync(id); if (v) specWeightNames.set(id, v.name); } catch {}
      }));

      const CAT_LABELS: Record<string, string> = {
        'color-fg': 'Color Fg', 'color-bg': 'Color Bg', 'spacing': 'Spacing',
        'shape': 'Shape', 'typography': 'Typography', 'sizing': 'Sizing',
      };

      // Returns a fingerprint of the property values relevant to a given category.
      // Variants with the same fingerprint are visually identical for that category —
      // we show only one representative per unique fingerprint.
      const getVariantFingerprint = (v: ComponentNode, cat: string): string => {
        const all = [v as BaseNode, ...v.findAll(() => true)];
        const roundColor = (c: any) => c ? `${Math.round((c.r ?? 0) * 255)},${Math.round((c.g ?? 0) * 255)},${Math.round((c.b ?? 0) * 255)}` : '';
        switch (cat) {
          case 'shape':
            return all.map(n => {
              const cr = (n as any).cornerRadius;
              const sl = ((n as any).strokes ?? []).length;
              return `${typeof cr === 'number' ? Math.round(cr) : '?'}:${sl}`;
            }).join('|');
          case 'spacing':
            return all.filter(n => n.type === 'FRAME' || n.type === 'COMPONENT').map(n => {
              const f = n as any;
              return `${f.paddingTop ?? 0},${f.paddingBottom ?? 0},${f.paddingLeft ?? 0},${f.paddingRight ?? 0},${f.itemSpacing ?? 0}`;
            }).join('|');
          case 'color-fg':
            return all.filter(n => n.type === 'TEXT').map(n =>
              ((n as any).fills ?? []).map((f: any) => roundColor(f.color) + ':' + Math.round((f.opacity ?? 1) * 100)).join(';')
            ).join('|');
          case 'color-bg':
            return all.filter(n => n.type !== 'TEXT').map(n =>
              ((n as any).fills ?? []).map((f: any) => roundColor(f.color) + ':' + Math.round((f.opacity ?? 1) * 100)).join(';')
            ).join('|');
          case 'typography':
            return all.filter(n => n.type === 'TEXT').map(n => {
              const f = n as any;
              const fn = typeof f.fontName === 'object' ? `${f.fontName?.family}/${f.fontName?.style}` : '';
              return `${f.fontSize}:${fn}`;
            }).join('|');
          case 'sizing':
            return `${Math.round((v as any).width)}:${Math.round((v as any).height)}`;
          default:
            return v.id;
        }
      };

      // One section per category, stacked vertically to the right of the component set
      const xBase = specSet.x + specSet.width + 100;
      let yOffset = specSet.y;
      const allSections: SectionNode[] = [];

      for (const cat of categories) {
        const section = figma.createSection();
        section.name = specSet.name + ' — ' + (CAT_LABELS[cat] ?? cat) + ' Spec';
        section.x = xBase;
        section.y = yOffset;
        figma.currentPage.appendChild(section);
        try { (section as any).fills = []; } catch {}
        allSections.push(section);

        // Single continuous white frame holding all variants
        const row = figma.createFrame();
        row.name = 'variants';
        row.layoutMode = 'HORIZONTAL';
        row.primaryAxisSizingMode = 'AUTO';
        row.counterAxisSizingMode = 'AUTO';
        row.primaryAxisAlignItems = 'CENTER';
        row.counterAxisAlignItems = 'CENTER';
        row.paddingLeft = 24; row.paddingRight = 24;
        row.paddingTop = 24;  row.paddingBottom = 24;
        row.itemSpacing = 16;
        row.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

        // Only include one representative per unique property value for this category
        const seenFps = new Set<string>();
        const catVariants: ComponentNode[] = [];
        for (const v of variants) {
          const fp = getVariantFingerprint(v, cat);
          if (!seenFps.has(fp)) { seenFps.add(fp); catVariants.push(v); }
        }

        for (const variant of catVariants) {
          const instance = variant.createInstance();
          row.appendChild(instance);

          // Component nodes are the source of truth for bound variables.
          // Instance override nodes only expose explicit overrides — shape
          // bindings (cornerRadius, strokes) live on the master component and
          // won't appear on the instance tree unless overridden.
          const compNodes: BaseNode[] = [variant as BaseNode, ...variant.findAll(() => true)];
          const allNodes: BaseNode[] = [instance];
          if ('findAll' in instance) allNodes.push(...(instance as any).findAll(() => true) as BaseNode[]);

          for (let ni = 0; ni < allNodes.length; ni++) {
            const n = allNodes[ni];
            const instBv = (n as any).boundVariables ?? {};
            const compBv = ni < compNodes.length ? ((compNodes[ni] as any).boundVariables ?? {}) : {};
            // Component bindings as base; instance overrides on top
            const bv: Record<string, any> = { ...compBv, ...instBv };
            const anns: Array<{ labelMarkdown: string; properties: Array<{ type: string }> }> = [];

            if (cat === 'color-fg' && n.type === 'TEXT' && (bv.fills?.length ?? 0) > 0)
              anns.push({ labelMarkdown: 'Color', properties: [{ type: 'fills' }] });

            if (cat === 'color-bg' && n.type !== 'TEXT' && (bv.fills?.length ?? 0) > 0)
              anns.push({ labelMarkdown: 'Background', properties: [{ type: 'fills' }] });

            if (cat === 'spacing') {
              const sp: Array<{ type: string }> = [];
              if (bv.paddingTop || bv.paddingBottom || bv.paddingLeft || bv.paddingRight) sp.push({ type: 'padding' });
              if (bv.itemSpacing) sp.push({ type: 'itemSpacing' });
              if (sp.length) anns.push({ labelMarkdown: 'Spacing', properties: sp });
            }

            if (cat === 'shape') {
              const sh: Array<{ type: string }> = [];
              const compN = ni < compNodes.length ? compNodes[ni] : null;
              // Bound variable check (any corner key) OR raw non-zero value on the component node
              const hasCornerVar = bv.cornerRadius || bv.topLeftRadius || bv.topRightRadius || bv.bottomLeftRadius || bv.bottomRightRadius;
              const rawCorner = compN ? (compN as any).cornerRadius : undefined;
              const hasCornerRaw = typeof rawCorner === 'number' && rawCorner > 0;
              const nodeAcceptsCorner = n.type === 'FRAME' || n.type === 'RECTANGLE' || n.type === 'INSTANCE' || n.type === 'COMPONENT' || n.type === 'ELLIPSE';
              if ((hasCornerVar || hasCornerRaw) && nodeAcceptsCorner) sh.push({ type: 'cornerRadius' });
              // Bound variable check OR actual strokes on the component node
              const hasStrokesVar = (bv.strokes?.length ?? 0) > 0;
              const compStrokes = compN ? (compN as any).strokes : null;
              const hasStrokesRaw = Array.isArray(compStrokes) && compStrokes.length > 0;
              if (hasStrokesVar || hasStrokesRaw) sh.push({ type: 'strokes' });
              if (sh.length) anns.push({ labelMarkdown: 'Shape', properties: sh });
            }

            if (cat === 'typography' && n.type === 'TEXT') {
              const tp: Array<{ type: string }> = [];
              if ((bv.fontFamily?.length    ?? 0) > 0) tp.push({ type: 'fontFamily' });
              if ((bv.fontSize?.length      ?? 0) > 0) tp.push({ type: 'fontSize' });
              if ((bv.lineHeight?.length    ?? 0) > 0) tp.push({ type: 'lineHeight' });
              if ((bv.letterSpacing?.length ?? 0) > 0) tp.push({ type: 'letterSpacing' });
              if (tp.length) anns.push({ labelMarkdown: 'Typography', properties: tp });
              if ((bv.fontStyle?.length ?? 0) > 0) {
                const label = specWeightNames.get(bv.fontStyle[0].id) ?? 'font-weight';
                anns.push({ labelMarkdown: label, properties: [{ type: 'fontWeight' }] });
              }
            }

            if (cat === 'sizing' && n === instance)
              anns.push({ labelMarkdown: (instance as SceneNode).name.replace(/^\./, ''), properties: [{ type: 'width' }, { type: 'height' }] });

            if (anns.length > 0) {
              try { (n as any).annotations = anns; } catch {}
            }
          }
        }

        section.appendChild(row);
        row.x = 24;
        row.y = 40;
        section.resizeWithoutConstraints(row.width + 48, row.height + 72);
        yOffset += section.height + 40;
      }

      if (allSections.length > 0) {
        figma.currentPage.selection = allSections;
        figma.viewport.scrollAndZoomIntoView(allSections);
      }
      figma.ui.postMessage({ type: 'spec:result', categoryCount: categories.length, variantCount: variants.length });
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
