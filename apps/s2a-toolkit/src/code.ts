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
    width: 'width' in first ? Math.round((first as FrameNode).width) : undefined,
    height: 'height' in first ? Math.round((first as FrameNode).height) : undefined,
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
