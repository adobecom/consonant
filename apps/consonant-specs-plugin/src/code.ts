import { getTokenVersion, getTokenCount, loadLibraryTokens, forceMatch } from './tokens';
import { getNodeProperties } from './annotations';
import { specIt } from './spec-it';
import { runS2AAudit, runFullAlign, runTextColorsAlign } from './s2a-audit';
import { localize, TranslationProvider } from './localize';
import { generateBlueline, generateBluelinePanels, placeCategoryBadge } from './a11y-blueline';

// Expose for eval/EXECUTE_CODE access
(globalThis as any).__generateBlueline = generateBlueline;
(globalThis as any).__generateBluelinePanels = generateBluelinePanels;
(globalThis as any).__placeCategoryBadge = placeCategoryBadge;

// ── Bridge method helpers ─────────────────────────────────────────────────

function hexToFigmaRGB(hex: string): { r: number; g: number; b: number; a: number } {
  hex = hex.replace(/^#/, '');
  if (!/^[0-9A-Fa-f]+$/.test(hex)) throw new Error('Invalid hex color: "' + hex + '"');
  let r: number, g: number, b: number, a = 1;
  if (hex.length === 3) { r = parseInt(hex[0]+hex[0],16)/255; g = parseInt(hex[1]+hex[1],16)/255; b = parseInt(hex[2]+hex[2],16)/255; }
  else if (hex.length === 6) { r = parseInt(hex.substring(0,2),16)/255; g = parseInt(hex.substring(2,4),16)/255; b = parseInt(hex.substring(4,6),16)/255; }
  else if (hex.length === 8) { r = parseInt(hex.substring(0,2),16)/255; g = parseInt(hex.substring(2,4),16)/255; b = parseInt(hex.substring(4,6),16)/255; a = parseInt(hex.substring(6,8),16)/255; }
  else throw new Error('Invalid hex length: ' + hex);
  return { r, g, b, a };
}

function serializeVariable(v: Variable): Record<string, unknown> {
  return { id: v.id, name: v.name, key: v.key, resolvedType: v.resolvedType, valuesByMode: v.valuesByMode, variableCollectionId: v.variableCollectionId, scopes: v.scopes, codeSyntax: v.codeSyntax || {}, description: v.description, hiddenFromPublishing: v.hiddenFromPublishing };
}

function serializeCollection(c: VariableCollection): Record<string, unknown> {
  return { id: c.id, name: c.name, key: c.key, modes: c.modes, defaultModeId: c.defaultModeId, variableIds: c.variableIds };
}

function serializeNode(node: BaseNode & { x?: number; y?: number; width?: number; height?: number }): Record<string, unknown> {
  return { id: node.id, name: node.name, type: node.type, x: (node as any).x, y: (node as any).y, width: (node as any).width, height: (node as any).height };
}

async function handleBridgeMethod(method: string, params: Record<string, any>): Promise<Record<string, unknown>> {
  switch (method) {
    // ── Code execution ──
    case 'EXECUTE_CODE': {
      const code = params.code as string;
      const timeout = (params.timeout as number) || 5000;
      const wrappedCode = '(async function() {\n' + code + '\n})()';
      const timeoutPromise = new Promise((_r, reject) => { setTimeout(() => reject(new Error('Execution timed out after ' + timeout + 'ms')), timeout); });
      let codePromise: any;
      try { codePromise = eval(wrappedCode); } catch (syntaxError: any) { throw new Error('Syntax error: ' + (syntaxError.message || String(syntaxError))); }
      const result = await Promise.race([codePromise, timeoutPromise]);
      return { result, fileContext: { fileName: figma.root.name, fileKey: figma.fileKey || null } };
    }

    // ── Screenshot ──
    case 'CAPTURE_SCREENSHOT': {
      const nodeId = params.nodeId as string | undefined;
      const node = nodeId ? await figma.getNodeByIdAsync(nodeId) : figma.currentPage;
      if (!node) throw new Error('Node not found: ' + nodeId);
      if (!('exportAsync' in node)) throw new Error('Node type ' + node.type + ' does not support export');
      const format = (params.format as 'PNG' | 'JPG' | 'SVG') || 'PNG';
      let scale = (params.scale as number) || 1;
      const AI_MAX = 1568;
      let nw = 0, nh = 0;
      if ('width' in node && 'height' in node) { nw = (node as any).width; nh = (node as any).height; }
      if (nw > 0 && nh > 0) { const longest = Math.max(nw, nh); if (longest * scale > AI_MAX) scale = AI_MAX / longest; }
      const bytes = await (node as SceneNode).exportAsync({ format, constraint: { type: 'SCALE', value: scale } });
      const base64 = figma.base64Encode(bytes);
      return { image: { base64, format, scale, byteLength: bytes.length, node: { id: node.id, name: node.name, type: node.type } } };
    }

    // ── Blueline generator ──
    case 'GENERATE_BLUELINE': {
      const nodeId = params.nodeId as string | undefined;
      const sel = nodeId ? [await figma.getNodeByIdAsync(nodeId)] : figma.currentPage.selection;
      if (!sel || sel.length === 0 || !sel[0]) throw new Error('Select a frame or provide nodeId');
      const tier1 = Array.isArray(params.tier1) ? (params.tier1 as string[]) : [];
      const tier2 = Array.isArray(params.tier2) ? (params.tier2 as string[]) : [];
      const result = await generateBlueline(sel[0] as SceneNode, tier1, tier2);
      return result;
    }

    // ── File info ──
    case 'GET_FILE_INFO': {
      const selection = figma.currentPage.selection;
      return { fileInfo: { fileName: figma.root.name, fileKey: figma.fileKey || null, currentPage: figma.currentPage.name, currentPageId: figma.currentPage.id, selectionCount: selection ? selection.length : 0, editorType: figma.editorType || 'figma', pluginVersion: '1.0.0' } };
    }

    // ── Variable methods ──
    case 'UPDATE_VARIABLE': {
      const v = await figma.variables.getVariableByIdAsync(params.variableId);
      if (!v) throw new Error('Variable not found: ' + params.variableId);
      let value = params.value;
      if (typeof value === 'string' && value.startsWith('VariableID:')) { value = { type: 'VARIABLE_ALIAS', id: value }; }
      else if (v.resolvedType === 'COLOR' && typeof value === 'string') { value = hexToFigmaRGB(value); }
      v.setValueForMode(params.modeId, value);
      return { variable: serializeVariable(v) };
    }
    case 'CREATE_VARIABLE': {
      const collection = await figma.variables.getVariableCollectionByIdAsync(params.collectionId);
      if (!collection) throw new Error('Collection not found: ' + params.collectionId);
      const v = figma.variables.createVariable(params.name, collection, params.resolvedType);
      if (params.valuesByMode) { for (const modeId in params.valuesByMode) { let val = params.valuesByMode[modeId]; if (params.resolvedType === 'COLOR' && typeof val === 'string') val = hexToFigmaRGB(val); v.setValueForMode(modeId, val); } }
      if (params.description) v.description = params.description;
      if (params.scopes) v.scopes = params.scopes;
      return { variable: serializeVariable(v) };
    }
    case 'DELETE_VARIABLE': {
      const v = await figma.variables.getVariableByIdAsync(params.variableId);
      if (!v) throw new Error('Variable not found: ' + params.variableId);
      const info = { id: v.id, name: v.name };
      v.remove();
      return { deleted: info };
    }
    case 'CREATE_VARIABLE_COLLECTION': {
      const c = figma.variables.createVariableCollection(params.name);
      if (params.initialModeName && c.modes.length > 0) c.renameMode(c.modes[0].modeId, params.initialModeName);
      if (params.additionalModes) { for (const modeName of params.additionalModes) c.addMode(modeName); }
      return { collection: serializeCollection(c) };
    }
    case 'DELETE_VARIABLE_COLLECTION': {
      const c = await figma.variables.getVariableCollectionByIdAsync(params.collectionId);
      if (!c) throw new Error('Collection not found: ' + params.collectionId);
      const info = { id: c.id, name: c.name, variableCount: c.variableIds.length };
      c.remove();
      return { deleted: info };
    }
    case 'RENAME_VARIABLE': {
      const v = await figma.variables.getVariableByIdAsync(params.variableId);
      if (!v) throw new Error('Variable not found: ' + params.variableId);
      const oldName = v.name;
      v.name = params.newName;
      return { variable: serializeVariable(v), oldName };
    }
    case 'SET_VARIABLE_DESCRIPTION': {
      const v = await figma.variables.getVariableByIdAsync(params.variableId);
      if (!v) throw new Error('Variable not found: ' + params.variableId);
      v.description = params.description || '';
      return { variable: serializeVariable(v) };
    }
    case 'ADD_MODE': {
      const c = await figma.variables.getVariableCollectionByIdAsync(params.collectionId);
      if (!c) throw new Error('Collection not found: ' + params.collectionId);
      const newModeId = c.addMode(params.modeName);
      return { collection: serializeCollection(c), newMode: { modeId: newModeId, name: params.modeName } };
    }
    case 'RENAME_MODE': {
      const c = await figma.variables.getVariableCollectionByIdAsync(params.collectionId);
      if (!c) throw new Error('Collection not found: ' + params.collectionId);
      const currentMode = c.modes.find(m => m.modeId === params.modeId);
      if (!currentMode) throw new Error('Mode not found: ' + params.modeId);
      const oldName = currentMode.name;
      c.renameMode(params.modeId, params.newName);
      return { collection: serializeCollection(c), oldName };
    }
    case 'REFRESH_VARIABLES':
    case 'GET_VARIABLES_DATA': {
      const variables = await figma.variables.getLocalVariablesAsync();
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      const data = { success: true, timestamp: Date.now(), fileKey: figma.fileKey || null, variables: variables.map(serializeVariable), variableCollections: collections.map(serializeCollection) };
      figma.ui.postMessage({ type: 'bridge:variables-data', data });
      return { data };
    }

    // ── Component methods ──
    case 'GET_LOCAL_COMPONENTS': {
      const components: Record<string, unknown>[] = [];
      function findComponents(n: BaseNode) {
        if (n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && (!n.parent || n.parent.type !== 'COMPONENT_SET'))) {
          components.push({ id: n.id, name: n.name, key: (n as ComponentNode | ComponentSetNode).key, type: n.type, description: (n as ComponentNode).description || null });
        }
        if ('children' in n) { for (const child of (n as FrameNode).children) { try { findComponents(child); } catch {} } }
      }
      for (const child of figma.currentPage.children) { try { findComponents(child); } catch {} }
      return { data: { components, totalComponents: components.length } };
    }
    case 'INSTANTIATE_COMPONENT': {
      let component: ComponentNode | null = null;
      if (params.componentKey) {
        try { component = await figma.importComponentByKeyAsync(params.componentKey) as ComponentNode; } catch {}
      }
      if (!component && params.nodeId) {
        const node = await figma.getNodeByIdAsync(params.nodeId);
        if (node && node.type === 'COMPONENT') component = node as ComponentNode;
        else if (node && node.type === 'COMPONENT_SET') component = (node as ComponentSetNode).defaultVariant as ComponentNode;
      }
      if (!component) throw new Error('Component not found');
      const instance = component.createInstance();
      if (params.position) { instance.x = params.position.x || 0; instance.y = params.position.y || 0; }
      if (params.parentId) { const parent = await figma.getNodeByIdAsync(params.parentId); if (parent && 'appendChild' in parent) (parent as FrameNode).appendChild(instance); }
      return { instance: { id: instance.id, name: instance.name, x: instance.x, y: instance.y, width: instance.width, height: instance.height } };
    }
    case 'GET_COMPONENT': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error('Node not found: ' + params.nodeId);
      const isVariant = node.type === 'COMPONENT' && node.parent && node.parent.type === 'COMPONENT_SET';
      return { data: { nodeId: params.nodeId, component: { id: node.id, name: node.name, type: node.type, description: (node as any).description || null, isVariant, componentPropertyDefinitions: (node.type === 'COMPONENT_SET' || (node.type === 'COMPONENT' && !isVariant)) ? (node as any).componentPropertyDefinitions : undefined, children: ('children' in node) ? (node as any).children.map((c: any) => ({ id: c.id, name: c.name, type: c.type })) : undefined } } };
    }
    case 'SET_INSTANCE_PROPERTIES': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error('Node not found: ' + params.nodeId);
      if (node.type !== 'INSTANCE') throw new Error('Node must be an INSTANCE. Got: ' + node.type);
      const inst = node as InstanceNode;
      await inst.getMainComponentAsync();
      const currentProps = inst.componentProperties;
      const propsToSet: Record<string, any> = {};
      for (const propName in params.properties) {
        if (currentProps[propName] !== undefined) { propsToSet[propName] = params.properties[propName]; }
        else { for (const existing in currentProps) { if (existing.startsWith(propName + '#')) { propsToSet[existing] = params.properties[propName]; break; } } }
      }
      if (Object.keys(propsToSet).length === 0) throw new Error('No valid properties. Available: ' + Object.keys(currentProps).join(', '));
      inst.setProperties(propsToSet);
      return { instance: { id: inst.id, name: inst.name, propertiesSet: Object.keys(propsToSet) } };
    }
    case 'ADD_COMPONENT_PROPERTY': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error('Node not found: ' + params.nodeId);
      if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') throw new Error('Must be COMPONENT or COMPONENT_SET');
      const propNameId = (node as ComponentNode).addComponentProperty(params.propertyName, params.propertyType, params.defaultValue);
      return { propertyName: propNameId };
    }
    case 'EDIT_COMPONENT_PROPERTY': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error('Node not found: ' + params.nodeId);
      if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') throw new Error('Must be COMPONENT or COMPONENT_SET');
      const propNameId = (node as ComponentNode).editComponentProperty(params.propertyName, params.newValue);
      return { propertyName: propNameId };
    }
    case 'DELETE_COMPONENT_PROPERTY': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error('Node not found: ' + params.nodeId);
      if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') throw new Error('Must be COMPONENT or COMPONENT_SET');
      (node as ComponentNode).deleteComponentProperty(params.propertyName);
      return { deleted: true };
    }

    // ── Node manipulation ──
    case 'RESIZE_NODE': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error('Node not found: ' + params.nodeId);
      if (!('resize' in node)) throw new Error('Node does not support resize');
      if (params.withConstraints !== false) (node as FrameNode).resize(params.width, params.height);
      else (node as FrameNode).resizeWithoutConstraints(params.width, params.height);
      return { node: serializeNode(node) };
    }
    case 'MOVE_NODE': {
      const node = await figma.getNodeByIdAsync(params.nodeId) as SceneNode;
      if (!node) throw new Error('Node not found: ' + params.nodeId);
      node.x = params.x;
      node.y = params.y;
      return { node: serializeNode(node) };
    }
    case 'CLONE_NODE': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node || !('clone' in node)) throw new Error('Node not found or cannot be cloned');
      const clone = (node as SceneNode).clone();
      return { node: serializeNode(clone) };
    }
    case 'DELETE_NODE': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error('Node not found: ' + params.nodeId);
      const info = { id: node.id, name: node.name };
      (node as SceneNode).remove();
      return { deleted: info };
    }
    case 'RENAME_NODE': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error('Node not found: ' + params.nodeId);
      const oldName = node.name;
      node.name = params.newName;
      return { node: serializeNode(node), oldName };
    }
    case 'CREATE_CHILD_NODE': {
      const parent = await figma.getNodeByIdAsync(params.parentId);
      if (!parent || !('appendChild' in parent)) throw new Error('Parent not found or cannot have children');
      let newNode: SceneNode;
      const props = params.properties || {};
      switch (params.nodeType) {
        case 'RECTANGLE': newNode = figma.createRectangle(); break;
        case 'ELLIPSE': newNode = figma.createEllipse(); break;
        case 'FRAME': newNode = figma.createFrame(); break;
        case 'TEXT': {
          const t = figma.createText();
          await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
          t.fontName = { family: 'Inter', style: 'Regular' };
          if (props.text) t.characters = props.text;
          newNode = t;
          break;
        }
        case 'LINE': newNode = figma.createLine(); break;
        case 'POLYGON': newNode = figma.createPolygon(); break;
        case 'STAR': newNode = figma.createStar(); break;
        case 'VECTOR': newNode = figma.createVector(); break;
        default: throw new Error('Unsupported node type: ' + params.nodeType);
      }
      if (props.name) newNode.name = props.name;
      if (props.x !== undefined) newNode.x = props.x;
      if (props.y !== undefined) newNode.y = props.y;
      if (props.width !== undefined && props.height !== undefined) newNode.resize(props.width, props.height);
      if (props.fills) {
        const processed = props.fills.map((f: any) => {
          if (f.type === 'SOLID' && typeof f.color === 'string') { const rgb = hexToFigmaRGB(f.color); return { type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: rgb.a }; }
          return f;
        });
        (newNode as any).fills = processed;
      }
      (parent as FrameNode).appendChild(newNode);
      return { node: serializeNode(newNode) };
    }
    case 'SET_NODE_DESCRIPTION': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error('Node not found: ' + params.nodeId);
      if (!('description' in node)) throw new Error('Node does not support description');
      (node as any).description = params.description || '';
      if (params.descriptionMarkdown && 'descriptionMarkdown' in node) (node as any).descriptionMarkdown = params.descriptionMarkdown;
      return { node: { id: node.id, name: node.name, description: (node as any).description } };
    }

    // ── Visual properties ──
    case 'SET_NODE_FILLS': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node || !('fills' in node)) throw new Error('Node not found or does not support fills');
      const processed = params.fills.map((f: any) => {
        if (f.type === 'SOLID' && typeof f.color === 'string') { const rgb = hexToFigmaRGB(f.color); return { type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: rgb.a !== undefined ? rgb.a : (f.opacity !== undefined ? f.opacity : 1) }; }
        return f;
      });
      (node as any).fills = processed;
      return { node: { id: node.id, name: node.name } };
    }
    case 'SET_NODE_STROKES': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node || !('strokes' in node)) throw new Error('Node not found or does not support strokes');
      const processed = params.strokes.map((s: any) => {
        if (s.type === 'SOLID' && typeof s.color === 'string') { const rgb = hexToFigmaRGB(s.color); return { type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: rgb.a !== undefined ? rgb.a : (s.opacity !== undefined ? s.opacity : 1) }; }
        return s;
      });
      (node as any).strokes = processed;
      if (params.strokeWeight !== undefined) (node as any).strokeWeight = params.strokeWeight;
      return { node: { id: node.id, name: node.name } };
    }
    case 'SET_NODE_OPACITY': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node || !('opacity' in node)) throw new Error('Node not found or does not support opacity');
      (node as any).opacity = Math.max(0, Math.min(1, params.opacity));
      return { node: { id: node.id, name: node.name, opacity: (node as any).opacity } };
    }
    case 'SET_NODE_CORNER_RADIUS': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node || !('cornerRadius' in node)) throw new Error('Node not found or does not support corner radius');
      (node as any).cornerRadius = params.radius;
      return { node: { id: node.id, name: node.name, cornerRadius: (node as any).cornerRadius } };
    }
    case 'SET_TEXT_CONTENT': {
      const node = await figma.getNodeByIdAsync(params.nodeId);
      if (!node || node.type !== 'TEXT') throw new Error('Node not found or not a TEXT node');
      const textNode = node as TextNode;
      const fontName = textNode.fontName;
      if (fontName !== figma.mixed) await figma.loadFontAsync(fontName);
      else await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      textNode.characters = params.text;
      if (params.fontSize) textNode.fontSize = params.fontSize;
      return { node: { id: textNode.id, name: textNode.name, characters: textNode.characters } };
    }
    case 'SET_IMAGE_FILL': {
      const bytes = new Uint8Array(params.imageBytes);
      const image = figma.createImage(bytes);
      const fill = { type: 'IMAGE' as const, scaleMode: (params.scaleMode || 'FILL') as 'FILL' | 'FIT' | 'CROP' | 'TILE', imageHash: image.hash };
      const nodeIds: string[] = params.nodeIds || (params.nodeId ? [params.nodeId] : []);
      const updatedNodes: Array<{ id: string; name: string }> = [];
      for (const nid of nodeIds) {
        const node = await figma.getNodeByIdAsync(nid);
        if (node && 'fills' in node) { (node as any).fills = [fill]; updatedNodes.push({ id: node.id, name: node.name }); }
      }
      return { imageHash: image.hash, updatedCount: updatedNodes.length, nodes: updatedNodes };
    }

    // ── Analysis ──
    case 'LINT_DESIGN': {
      const rootNode = params.nodeId ? await figma.getNodeByIdAsync(params.nodeId) : figma.currentPage;
      if (!rootNode) throw new Error('Node not found');
      const findings: Array<{ nodeId: string; nodeName: string; rule: string; message: string }> = [];
      const maxFindings = params.maxFindings || 50;
      const maxDepth = params.maxDepth || 8;
      function lintWalk(n: BaseNode, depth: number) {
        if (depth > maxDepth || findings.length >= maxFindings) return;
        try {
          if (n.type === 'TEXT') {
            const tn = n as TextNode;
            if (tn.fontSize !== figma.mixed && typeof tn.fontSize === 'number' && tn.fontSize < 12) findings.push({ nodeId: n.id, nodeName: n.name, rule: 'wcag-text-size', message: 'Text size ' + tn.fontSize + 'px < 12px minimum' });
            if (!tn.textStyleId) findings.push({ nodeId: n.id, nodeName: n.name, rule: 'no-text-style', message: 'Text node not using a text style' });
          }
          if ((n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'INSTANCE') && 'children' in n) {
            const frame = n as FrameNode;
            if (frame.children.length === 0) findings.push({ nodeId: n.id, nodeName: n.name, rule: 'empty-container', message: 'Frame has no children' });
            else if (frame.children.length > 1 && frame.layoutMode === 'NONE') findings.push({ nodeId: n.id, nodeName: n.name, rule: 'no-autolayout', message: 'Frame with multiple children has no auto-layout' });
          }
          if (/^(Frame|Rectangle|Ellipse|Group|Text|Line|Vector|Component|Instance)(\s+\d+)?$/.test(n.name)) findings.push({ nodeId: n.id, nodeName: n.name, rule: 'default-name', message: 'Node has default Figma name' });
        } catch {}
        if ('children' in n) { for (const child of (n as FrameNode).children) { try { lintWalk(child, depth + 1); } catch {} } }
      }
      lintWalk(rootNode, 0);
      return { data: { findings, totalFindings: findings.length, truncated: findings.length >= maxFindings } };
    }
    case 'AUDIT_COMPONENT_ACCESSIBILITY': {
      const rootNode = params.nodeId ? await figma.getNodeByIdAsync(params.nodeId) : figma.currentPage.selection[0];
      if (!rootNode) throw new Error('No node selected or found');
      const issues: Array<{ nodeId: string; nodeName: string; issue: string; severity: string }> = [];
      const targetSize = params.targetSize || 24;
      function a11yWalk(n: BaseNode, depth: number) {
        if (depth > 6 || issues.length > 30) return;
        try {
          if ((n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'INSTANCE') && /button|link|input|checkbox|radio|switch|toggle|tab/i.test(n.name)) {
            const frame = n as FrameNode;
            if (frame.width < targetSize || frame.height < targetSize) issues.push({ nodeId: n.id, nodeName: n.name, issue: `Target size ${Math.round(frame.width)}x${Math.round(frame.height)} < ${targetSize}x${targetSize}`, severity: 'critical' });
          }
          if (n.type === 'TEXT') {
            const tn = n as TextNode;
            if (tn.fontSize !== figma.mixed && typeof tn.fontSize === 'number' && tn.fontSize < 12) issues.push({ nodeId: n.id, nodeName: n.name, issue: 'Text too small: ' + tn.fontSize + 'px', severity: 'warning' });
          }
        } catch {}
        if ('children' in n) { for (const child of (n as FrameNode).children) { try { a11yWalk(child, depth + 1); } catch {} } }
      }
      a11yWalk(rootNode, 0);
      return { data: { issues, totalIssues: issues.length, nodeId: rootNode.id, nodeName: rootNode.name } };
    }

    default:
      throw new Error('Unknown bridge method: ' + method);
  }
}

function apiKeyStorageKey(provider: string): string {
  return `api-key-${provider}`;
}

function maskKey(key: string): string {
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 6)}…${key.slice(-4)}`;
}

async function postApiKeyState(provider: string): Promise<void> {
  const key = await figma.clientStorage.getAsync(apiKeyStorageKey(provider));
  figma.ui.postMessage({
    type: 'api-key-state',
    hasKey: typeof key === 'string' && key.length > 0,
    masked: typeof key === 'string' && key.length > 0 ? maskKey(key) : undefined,
  });
}

figma.showUI(__html__, { width: 360, height: 500, themeColors: true });

figma.ui.onmessage = async (msg: { type: string; [key: string]: unknown }) => {
  switch (msg.type) {
    case 'ui-ready':
      notifySelection();
      figma.ui.postMessage({ type: 'token-status', count: 0, version: 'loading library...' });
      try {
        figma.notify('Loading S2A library...');
        await loadLibraryTokens();
        const count = getTokenCount();
        figma.ui.postMessage({
          type: 'token-status',
          count,
          version: count > 0 ? getTokenVersion() : 'no library',
        });
        figma.notify(count > 0 ? `S2A library: ${count} tokens loaded` : 'No S2A tokens found');
      } catch (e: any) {
        figma.ui.postMessage({ type: 'token-status', count: 0, version: `error: ${e.message}` });
        figma.notify(`Library load error: ${e.message}`, { error: true });
      }
      break;
    case 's2a-audit': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a node first'); break; }
      const audit = await runS2AAudit(sel[0]);
      const pct = audit.total > 0 ? Math.round((audit.matched / audit.total) * 100) : 0;
      figma.notify(`S2A Audit: ${audit.matched}/${audit.total} properties matched (${pct}%) — ${audit.issues.length} issues`);
      figma.ui.postMessage({
        type: 's2a-audit-result',
        matched: audit.matched,
        total: audit.total,
        issues: audit.issues,
      });
      break;
    }
    case 'full-align-s2a': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a node first'); break; }
      figma.notify('Aligning to S2A library...');
      try {
        const result = await runFullAlign(sel[0]);
        figma.notify(`Full Align: ${result.aligned} bound to S2A, ${result.unmatched.length} unmatched (mode: ${result.mode})`);
        figma.ui.postMessage({ type: 's2a-align-result', ...result });
      } catch (e: any) {
        figma.notify(`Full Align failed: ${e.message}`, { error: true });
      }
      break;
    }
    case 'text-colors-align': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a node first'); break; }
      figma.notify('Aligning text & colors to S2A library...');
      try {
        const result = await runTextColorsAlign(sel[0]);
        figma.notify(`Text & Colors: ${result.aligned} bound to S2A, ${result.unmatched.length} unmatched (mode: ${result.mode})`);
        figma.ui.postMessage({ type: 's2a-align-result', ...result });
      } catch (e: any) {
        figma.notify(`Text & Colors failed: ${e.message}`, { error: true });
      }
      break;
    }
    case 'apply-grid': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a frame first'); break; }
      const node = sel[0];
      if (!('layoutGrids' in node)) { figma.notify('Select a frame'); break; }
      try {
        const frame = node as FrameNode;
        const width = frame.width;
        const isMobile = width < 768;
        const grid = {
          pattern: 'COLUMNS' as const,
          alignment: 'STRETCH' as const,
          count: isMobile ? 6 : 12,
          gutterSize: 8,
          offset: isMobile ? 24 : Math.round(width * 0.08333),
          visible: true,
          color: { r: 0x12 / 255, g: 0x5E / 255, b: 0xDE / 255, a: 0.1 },
        };
        frame.layoutGrids = [...frame.layoutGrids, grid] as ReadonlyArray<LayoutGrid>;
        const mode = isMobile ? '6-col mobile' : '12-col desktop';
        figma.notify(`Grid applied: ${mode}`);
        figma.ui.postMessage({ type: 'grid-result', message: `Applied ${mode} grid (${Math.round(width)}px)` });
      } catch (e: any) {
        figma.notify(`Grid failed: ${e.message}`, { error: true });
        figma.ui.postMessage({ type: 'grid-result', message: `Error: ${e.message}` });
      }
      break;
    }
    case 'apply-grid-xl': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a frame first'); break; }
      const node = sel[0];
      if (!('layoutGrids' in node)) { figma.notify('Select a frame'); break; }
      try {
        const frame = node as FrameNode;
        if (frame.width < 1920) {
          figma.notify(`Frame is ${Math.round(frame.width)}px — needs to be at least 1920px`, { error: true });
          figma.ui.postMessage({ type: 'grid-result', message: `Frame too narrow (${Math.round(frame.width)}px < 1920px)` });
          break;
        }
        const margin = Math.round((frame.width - 1920) / 2);
        const grid = {
          pattern: 'COLUMNS' as const,
          alignment: 'STRETCH' as const,
          count: 12,
          gutterSize: 8,
          offset: margin,
          visible: true,
          color: { r: 0x12 / 255, g: 0x5E / 255, b: 0xDE / 255, a: 0.1 },
        };
        frame.layoutGrids = [...frame.layoutGrids, grid] as ReadonlyArray<LayoutGrid>;
        figma.notify('XL grid applied: 1920px centered');
        figma.ui.postMessage({ type: 'grid-result', message: `Applied XL grid (1920px centered, margin: ${margin}px)` });
      } catch (e: any) {
        figma.notify(`Grid XL failed: ${e.message}`, { error: true });
        figma.ui.postMessage({ type: 'grid-result', message: `Error: ${e.message}` });
      }
      break;
    }
    case 'clear-grids': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a frame first'); break; }
      const node = sel[0];
      if (!('layoutGrids' in node)) { figma.notify('Select a frame'); break; }
      (node as FrameNode).layoutGrids = [];
      figma.notify('Grids cleared');
      figma.ui.postMessage({ type: 'grid-result', message: 'All grids cleared' });
      break;
    }
    case 'force-match': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a node first'); break; }
      if (!Array.isArray(msg.categories)) { figma.notify('No categories selected'); break; }
      const categories = msg.categories as string[];
      try {
        const result = await forceMatch(sel[0], categories);
        figma.notify(`Matched ${result.applied} properties to closest S2A tokens`);
        figma.ui.postMessage({ type: 'match-result', message: `Done: ${result.applied} matched, ${result.skipped} skipped` });
      } catch (e: any) {
        figma.notify(`Match failed: ${e.message}`, { error: true });
        figma.ui.postMessage({ type: 'match-result', message: `Error: ${e.message}` });
      }
      break;
    }
    case 'navigate-to-node': {
      const nodeId = msg.nodeId as string;
      if (nodeId) {
        const target = (await figma.getNodeByIdAsync(nodeId)) as SceneNode | null;
        if (target) {
          figma.currentPage.selection = [target];
          figma.viewport.scrollAndZoomIntoView([target]);
        }
      }
      break;
    }
    case 'spec-it': {
      const sel = figma.currentPage.selection;
      if (sel.length > 0) {
        try {
          const sections = Array.isArray(msg.sections) ? (msg.sections as string[]) : ['anatomy', 'layout', 'typography', 'components'];
          await specIt(sel[0], sections);
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : 'Unknown error';
          figma.ui.postMessage({ type: 'spec-it-status', message: `Error: ${errorMsg}` });
          figma.notify(`Spec it failed: ${errorMsg}`, { error: true });
        }
      }
      break;
    }
    case 'generate-blueline': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a frame first'); break; }
      try {
        const tier1 = Array.isArray(msg.tier1) ? (msg.tier1 as string[]) : [];
        const tier2 = Array.isArray(msg.tier2) ? (msg.tier2 as string[]) : [];
        figma.ui.postMessage({ type: 'a11y-status', message: 'Generating blueline...' });
        const grouped = msg.grouped !== false; // default true
        const result = await generateBlueline(sel[0], tier1, tier2, { grouped });

        if (tier2.length > 0) {
          // Try to notify consonant-mcp — the UI handler will show status or fallback
          figma.ui.postMessage({
            type: 'a11y-tier2-request',
            frameId: result.frameId,
            sections: result.tier2Sections,
            frameName: sel[0].name,
          });
        } else {
          figma.ui.postMessage({ type: 'a11y-status', message: 'Blueline generated!' });
        }
        figma.notify(`Blueline created for "${sel[0].name}"`);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        figma.ui.postMessage({ type: 'a11y-status', message: `Error: ${errorMsg}` });
        figma.notify(`Blueline failed: ${errorMsg}`, { error: true });
      }
      break;
    }
    case 'generate-blueline-panels': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a frame first'); break; }
      try {
        const tier1 = Array.isArray(msg.tier1) ? (msg.tier1 as string[]) : [];
        const tier2 = Array.isArray(msg.tier2) ? (msg.tier2 as string[]) : [];
        figma.ui.postMessage({ type: 'a11y-status', message: 'Generating panels...' });
        const result = await generateBluelinePanels(sel[0], tier1, tier2);
        figma.ui.postMessage({ type: 'a11y-tier2-request', mode: 'sections' });
        figma.notify(`Blueline panels created for "${sel[0].name}"`);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        figma.ui.postMessage({ type: 'a11y-status', message: `Error: ${errorMsg}` });
        figma.notify(`Panels failed: ${errorMsg}`, { error: true });
      }
      break;
    }
    case 'get-api-key': {
      const provider = typeof msg.provider === 'string' ? msg.provider : 'anthropic';
      await postApiKeyState(provider);
      break;
    }
    case 'save-api-key': {
      const key = typeof msg.key === 'string' ? msg.key.trim() : '';
      const provider = typeof msg.provider === 'string' ? msg.provider : 'anthropic';
      if (!key) { figma.notify('Empty API key', { error: true }); break; }
      await figma.clientStorage.setAsync(apiKeyStorageKey(provider), key);
      await postApiKeyState(provider);
      figma.notify('API key saved');
      break;
    }
    case 'clear-api-key': {
      const provider = typeof msg.provider === 'string' ? msg.provider : 'anthropic';
      await figma.clientStorage.deleteAsync(apiKeyStorageKey(provider));
      await postApiKeyState(provider);
      figma.notify('API key cleared');
      break;
    }
    // ── Bridge unified command handler (figma-console MCP protocol) ──────
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
case 'localize': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a frame first'); break; }
      const provider = (typeof msg.provider === 'string' ? msg.provider : 'mymemory') as TranslationProvider;
      const needsKey = ['deepl', 'google', 'azure', 'anthropic'].includes(provider);
      let apiKey = '';
      if (needsKey) {
        apiKey = await figma.clientStorage.getAsync(apiKeyStorageKey(provider)) || '';
        if (!apiKey) {
          figma.ui.postMessage({ type: 'localize-status', message: `Add your ${provider} API key first.` });
          break;
        }
      }
      const languages = Array.isArray(msg.languages) ? (msg.languages as string[]) : [];
      const applyRtl = Boolean(msg.applyRtl);
      if (languages.length === 0) {
        figma.ui.postMessage({ type: 'localize-status', message: 'Select at least one language.' });
        break;
      }
      try {
        const result = await localize(sel[0], languages, applyRtl, provider, apiKey);
        const errTail = result.errors.length > 0 ? ` (errors: ${result.errors.join('; ')})` : '';
        figma.ui.postMessage({ type: 'localize-status', message: `Created ${result.created} localized frame(s).${errTail}` });
        figma.notify(`Localized ${result.created} frame(s)`);
      } catch (e: any) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        figma.ui.postMessage({ type: 'localize-status', message: `Error: ${errorMsg}` });
        figma.notify(`Localize failed: ${errorMsg}`, { error: true });
      }
      break;
    }
  }
};

figma.on('selectionchange', () => {
  notifySelection();
});

figma.on('currentpagechange', () => {
  figma.ui.postMessage({
    type: 'bridge:page-changed',
    page: { id: figma.currentPage.id, name: figma.currentPage.name },
  });
});

function notifySelection() {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) {
    figma.ui.postMessage({ type: 'selection-changed', selection: null, count: 0, hasAutoLayout: false });
    figma.ui.postMessage({ type: 'bridge:selection-changed', selection: [] });
    return;
  }
  const node = sel[0];
  const hasAutoLayout = 'layoutMode' in node && node.layoutMode !== 'NONE';
  figma.ui.postMessage({
    type: 'selection-changed',
    selection: {
      name: node.name,
      type: node.type,
      width: 'width' in node ? node.width : 0,
      height: 'height' in node ? node.height : 0,
    },
    count: sel.length,
    hasAutoLayout,
  });

  // Forward selection event for bridge
  figma.ui.postMessage({
    type: 'bridge:selection-changed',
    selection: sel.map(n => ({ id: n.id, name: n.name, type: n.type })),
  });

  if (sel.length > 0) {
    const properties = getNodeProperties(sel[0]);
    figma.ui.postMessage({ type: 'node-properties', properties });
  }
}
