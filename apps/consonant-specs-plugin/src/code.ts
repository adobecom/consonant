import { getTokenVersion, getTokenCount, loadLibraryTokens, forceMatch } from './tokens';
import { getNodeProperties } from './annotations';
import { specIt } from './spec-it';
import { runS2AAudit, runFullAlign, runTextColorsAlign } from './s2a-audit';
import { localize, collectSourceText, TranslationProvider } from './localize';
import { generateBlueline, generateBluelinePanels, placeCategoryBadge } from './a11y-blueline';
import { runStructuralScan } from './a11y-structural-scan';
import { generateFocusIndicators, collectFocusableElements } from './spec-focus-indicators';

// Expose for eval/EXECUTE_CODE access
(globalThis as any).__generateBlueline = generateBlueline;
(globalThis as any).__generateBluelinePanels = generateBluelinePanels;
(globalThis as any).__placeCategoryBadge = placeCategoryBadge;
(globalThis as any).__runStructuralScan = runStructuralScan;

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
      if (typeof code !== 'string') throw new Error('EXECUTE_CODE: params.code must be a string');
      // 64KB cap — sufficient for any legitimate MCP script, blocks payload-stuffing abuse
      if (code.length > 65536) throw new Error('EXECUTE_CODE: code exceeds 64KB limit');
      const timeout = Math.min((params.timeout as number) || 5000, 30000); // hard cap at 30s
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
      const categories = Array.isArray(params.categories) ? (params.categories as string[]) : [];
      const result = await generateBlueline(sel[0] as SceneNode, categories);
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
      if (params.fontSize) textNode.fontSize = params.fontSize;
      textNode.characters = params.text;
      return { node: { id: textNode.id, name: textNode.name, characters: textNode.characters } };
    }
    case 'SET_IMAGE_FILL': {
      if (!Array.isArray(params.imageBytes)) throw new Error('SET_IMAGE_FILL: imageBytes must be an array');
      const MAX_IMAGE_BYTES = 52_428_800; // 50MB
      if (params.imageBytes.length > MAX_IMAGE_BYTES) throw new Error(`SET_IMAGE_FILL: imageBytes exceeds ${MAX_IMAGE_BYTES / 1_048_576}MB limit`);
      const bytes = new Uint8Array(params.imageBytes as number[]);
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

    // ── Blueline data retrieval (for AI review + fill) ──
    case 'GET_BLUELINE_DATA': {
      const page = figma.currentPage;
      // Structural scan
      const scanNode = page.findOne(n => n.name === '.structural-scan' && n.type === 'TEXT') as TextNode | null;
      const structuralScan = scanNode ? scanNode.characters : null;

      // Focus order sidebar
      const sidebars = page.findAll(n => n.name === 'Accessibility Annotations' && n.type === 'FRAME');
      const sidebar = sidebars[sidebars.length - 1] as FrameNode | null;
      const focusOrder: { index: number; name: string; nodeId?: string }[] = [];
      if (sidebar && 'children' in sidebar) {
        let idx = 0;
        const walk = (node: SceneNode) => {
          if (node.name === 'Focus Order Info' && 'children' in node) {
            idx++;
            // Element name is in the parent row, e.g. "CTA - Secondary (ID: 103:13426)"
            const parentRow = node.parent;
            let elemName = '';
            let nodeId: string | undefined;
            if (parentRow && parentRow.type !== 'PAGE' && parentRow.type !== 'DOCUMENT') {
              const rowName = parentRow.name;
              const idMatch = rowName.match(/^(.+?)\s*\(ID:\s*([^)]+)\)$/);
              if (idMatch) {
                elemName = idMatch[1].trim();
                nodeId = idMatch[2].trim();
              } else {
                elemName = rowName;
              }
            }
            if (!elemName) {
              const frame = node as FrameNode;
              const textChild = frame.findOne(c => c.type === 'TEXT' && c.name !== 'Badge') as TextNode | null;
              elemName = textChild?.characters || `Element ${idx}`;
            }
            focusOrder.push({ index: idx, name: elemName, ...(nodeId ? { nodeId } : {}) });
          }
          if ('children' in node) {
            for (const child of (node as FrameNode).children) walk(child);
          }
        };
        walk(sidebar);
      }

      // Focus rectangles
      const focusRects = page.findAll(n => n.name === 'Focus Rectangle' && n.parent?.type === 'PAGE');
      const focusIndicators = focusRects.map(r => ({
        x: Math.round(r.x), y: Math.round(r.y),
        width: Math.round(r.width), height: Math.round(r.height),
      }));

      // Blueline cards — flat list of all card frames with category keys
      // Display name → category key mapping
      const NAME_TO_KEY: Record<string, string> = {
        'Focus Indicators': 'focusIndicators',
        'Focus Order': 'focusOrder',
        'Heading Hierarchy': 'headingHierarchy',
        'Landmarks': 'landmarks',
        'Skip Navigation': 'skipNav',
        'Consistent Navigation': 'consistentNav',
        'Accessible Names': 'accessibleNames',
        'Alt-Text': 'altText',
        'Color Contrast': 'colorContrast',
        'ARIA Roles & Attributes': 'ariaRoles',
        'Keyboard Patterns': 'keyboardPatterns',
        'Target Size': 'targetSize',
        'Page Title': 'pageTitle',
        'Language': 'language',
        'Forms': 'forms',
        'Carousel': 'autoRotation',
        'DOM Strategy': 'domStrategy',
        'Reduced Motion': 'reducedMotion',
        'Time-Based Media': 'media',
        'Reflow & Text Spacing': 'reflow',
        'VoiceOver': 'voiceover',
        'TalkBack': 'talkback',
        'Narrator': 'narrator',
        'React Native': 'reactNative',
        'TV Note': 'tvNote',
        'General Note': 'generalNote',
      };

      const cardContainers = page.findAll(n => n.name === 'Blueline Cards' || n.name === 'Tier 2 Cards');
      const cardContainer = cardContainers[cardContainers.length - 1] as FrameNode | null;
      const bluelineCards: { id: string; name: string; categoryKey: string; filled: boolean; container: string }[] = [];
      if (cardContainer && 'children' in cardContainer) {
        for (const child of cardContainer.children) {
          if (child.type !== 'FRAME' || !('children' in child)) continue;
          const childFrame = child as FrameNode;
          // Check if this is a card itself (has Card Header) or a sub-container
          const isCard = childFrame.children.some(c => c.name === 'Card Header');
          if (isCard) {
            const hasPlaceholder = childFrame.findOne(
              c => c.type === 'TEXT' && (c as TextNode).characters.includes('Awaiting AI fill')
            );
            bluelineCards.push({ id: child.id, name: child.name, categoryKey: NAME_TO_KEY[child.name] || child.name, filled: !hasPlaceholder, container: cardContainer.name });
          } else {
            // Sub-container — scan its children
            for (const grandchild of childFrame.children) {
              if (grandchild.type !== 'FRAME') continue;
              const hasPlaceholder = ('children' in grandchild) && (grandchild as FrameNode).findOne(
                c => c.type === 'TEXT' && (c as TextNode).characters.includes('Awaiting AI fill')
              );
              bluelineCards.push({ id: grandchild.id, name: grandchild.name, categoryKey: NAME_TO_KEY[grandchild.name] || grandchild.name, filled: !hasPlaceholder, container: child.name });
            }
          }
        }
      }

      // Find the target design frame (for screenshot reference)
      let targetFrameId: string | null = null;
      const annoSidebars = page.findAll(n => n.name === 'Accessibility Annotations' && n.type === 'FRAME');
      if (annoSidebars.length > 0) {
        // The annotation sidebar is placed next to the target frame — find sibling frame
        const sidebar = annoSidebars[annoSidebars.length - 1];
        // Look for the design frame near the sidebar (by proximity)
        const allTopFrames = page.children.filter(n => n.type === 'FRAME' && n.name !== 'Accessibility Annotations' && !n.name.includes('Blueline Cards') && !n.name.includes('Tier 2') && n.id !== sidebar.id);
        if (allTopFrames.length > 0) {
          // Find the closest frame to the left of the sidebar
          let closest = allTopFrames[0];
          let closestDist = Infinity;
          for (const f of allTopFrames) {
            const dist = Math.abs(f.x + f.width - sidebar.x);
            if (dist < closestDist) { closestDist = dist; closest = f; }
          }
          targetFrameId = closest.id;
        }
      }

      return {
        structuralScan: structuralScan ? (() => { try { return JSON.parse(structuralScan); } catch { return null; } })() : null,
        focusOrder,
        focusIndicators,
        bluelineCards,
        targetFrameId,
        plainLanguage: !!params.plainLanguage,
      };
    }

    // ── Fill a blueline card with structured content ──
    case 'FILL_CARD':
    case 'FILL_TIER2_CARD': {
      const cardId = params.cardId as string;
      const items = params.items as Array<{ title: string; desc: string }> | undefined;
      const notes = params.notes as string[] | undefined;
      const warnings = params.warnings as string[] | undefined;
      // Backwards compat: accept old sections format
      const sections = params.sections as Array<{ type: string; text: string }> | undefined;
      if (!cardId) throw new Error('cardId is required');

      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });

      const card = await figma.getNodeByIdAsync(cardId) as FrameNode | null;
      if (!card || !('children' in card)) throw new Error('Card not found: ' + cardId);

      // Remove placeholder text and any existing Content frame
      for (const child of [...card.children]) {
        if (child.type === 'TEXT' && (child as TextNode).characters.includes('Awaiting AI fill')) child.remove();
        if (child.type === 'FRAME' && child.name === 'Content') child.remove();
      }

      const W = card.width - (card.paddingLeft || 16) - (card.paddingRight || 16);
      const BLACK: RGB = { r: 0, g: 0, b: 0 };
      const GRAY: RGB = { r: 0.45, g: 0.45, b: 0.45 };
      const BLUE: RGB = { r: 0.2, g: 0.4, b: 0.7 };
      const ORANGE: RGB = { r: 0.8, g: 0.35, b: 0 };
      const DIV_C: RGB = { r: 0.9, g: 0.9, b: 0.9 };

      const content = figma.createFrame();
      content.name = 'Content';
      content.layoutMode = 'VERTICAL';
      content.primaryAxisSizingMode = 'AUTO';
      content.counterAxisSizingMode = 'FIXED';
      content.resize(W, 10);
      content.fills = [];
      content.itemSpacing = 0;

      function addDiv() {
        const d = figma.createRectangle();
        d.name = 'Divider';
        d.resize(W, 1);
        d.fills = [{ type: 'SOLID', color: DIV_C }];
        content.appendChild(d);
        d.layoutSizingHorizontal = 'FILL';
        d.layoutSizingVertical = 'FIXED';
      }

      function wrapText(textNode: TextNode, padTop: number, padBot: number, name: string) {
        const f = figma.createFrame();
        f.name = name;
        f.layoutMode = 'VERTICAL';
        f.primaryAxisSizingMode = 'AUTO';
        f.counterAxisSizingMode = 'FIXED';
        f.resize(W, 10);
        f.fills = [];
        f.paddingTop = padTop;
        f.paddingBottom = padBot;
        f.appendChild(textNode);
        textNode.layoutSizingHorizontal = 'FILL';
        content.appendChild(f);
        f.layoutSizingHorizontal = 'FILL';
        f.layoutSizingVertical = 'HUG';
      }

      // If new structured format provided
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const t = figma.createText();
          t.resize(W, 10);
          t.textAutoResize = 'HEIGHT';
          let chars = item.title;
          if (item.desc) chars += '\n' + item.desc;
          t.characters = chars;
          t.setRangeFontName(0, item.title.length, { family: 'Inter', style: 'Semi Bold' });
          t.setRangeFontSize(0, item.title.length, 11);
          t.setRangeFills(0, item.title.length, [{ type: 'SOLID', color: BLACK }]);
          if (item.desc) {
            const ds = item.title.length + 1;
            t.setRangeFontName(ds, chars.length, { family: 'Inter', style: 'Regular' });
            t.setRangeFontSize(ds, chars.length, 10);
            t.setRangeFills(ds, chars.length, [{ type: 'SOLID', color: GRAY }]);
          }
          wrapText(t, 8, 8, item.title.substring(0, 30));
          if (i < items.length - 1) addDiv();
        }
      } else if (sections) {
        // Legacy sections format fallback — convert to items
        for (let i = 0; i < sections.length; i++) {
          const s = sections[i];
          const t = figma.createText();
          t.resize(W, 10);
          t.textAutoResize = 'HEIGHT';
          t.characters = s.text;
          if (s.type === 'heading') {
            t.fontName = { family: 'Inter', style: 'Semi Bold' };
            t.fontSize = 11;
            t.fills = [{ type: 'SOLID', color: BLACK }];
          } else {
            t.fontName = { family: 'Inter', style: 'Regular' };
            t.fontSize = 10;
            t.fills = [{ type: 'SOLID', color: GRAY }];
          }
          wrapText(t, 8, 8, s.text.substring(0, 30));
          if (i < sections.length - 1) addDiv();
        }
      }

      // WCAG notes (blue)
      if (notes) {
        for (const note of notes) {
          addDiv();
          const t = figma.createText();
          t.resize(W, 10);
          t.textAutoResize = 'HEIGHT';
          t.characters = note;
          t.fontName = { family: 'Inter', style: 'Regular' };
          t.fontSize = 10;
          t.fills = [{ type: 'SOLID', color: BLUE }];
          wrapText(t, 8, 4, 'WCAG Note');
        }
      }

      // Warnings (orange)
      if (warnings) {
        for (const warn of warnings) {
          addDiv();
          const t = figma.createText();
          t.resize(W, 10);
          t.textAutoResize = 'HEIGHT';
          t.characters = warn;
          t.fontName = { family: 'Inter', style: 'Semi Bold' };
          t.fontSize = 10;
          t.fills = [{ type: 'SOLID', color: ORANGE }];
          wrapText(t, 6, 4, 'Warning');
        }
      }

      card.appendChild(content);
      content.layoutSizingHorizontal = 'FILL';
      content.layoutSizingVertical = 'HUG';

      return { filled: true, cardId, itemCount: (items || []).length, noteCount: (notes || []).length, warningCount: (warnings || []).length };
    }

    // ── Render all blueline content in one call ──
    case 'RENDER_BLUELINE': {
      const cards = params.cards as Record<string, { items: Array<{ title: string; desc: string }>; notes: string[]; warnings: string[] }>;
      const focusOrderData = params.focusOrder as Array<{ nodeId: string; name: string }> | undefined;
      const nodeId = params.nodeId as string | undefined;
      if (!cards || Object.keys(cards).length === 0) throw new Error('cards object is required');

      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

      const page = figma.currentPage;

      // Find the Blueline Cards container
      const containers = page.findAll(n => n.name === 'Blueline Cards' || n.name === 'Tier 2 Cards');
      const container = containers[containers.length - 1] as FrameNode | null;
      if (!container || !('children' in container)) throw new Error('Blueline Cards container not found');

      const filledCards: string[] = [];
      const W_CARD = 400;
      const W_CONTENT = W_CARD - 32; // 16px padding each side
      const BLACK: RGB = { r: 0, g: 0, b: 0 };
      const GRAY: RGB = { r: 0.45, g: 0.45, b: 0.45 };
      const BLUE: RGB = { r: 0.2, g: 0.4, b: 0.7 };
      const ORANGE: RGB = { r: 0.8, g: 0.35, b: 0 };
      const DIV_C: RGB = { r: 0.9, g: 0.9, b: 0.9 };

      // Explicit key→display name aliases for names that don't fuzzy-match
      const KEY_ALIASES: Record<string, string[]> = {
        autoRotation: ['carousel'],
        screenReaderNotes: ['voiceover', 'talkback', 'narrator'],
        accessibleNames: ['accessiblenames'],
        ariaRoles: ['ariarolesattributes', 'ariaroles'],
      };

      // Collect ALL card frames (search nested sub-containers too)
      const allCardFrames: FrameNode[] = [];
      for (const child of container.children) {
        if (child.type === 'FRAME' && 'children' in child) {
          // Check if this is a card itself (has Card Header) or a sub-container
          const isCard = (child as FrameNode).children.some(c => c.name === 'Card Header');
          if (isCard) {
            allCardFrames.push(child as FrameNode);
          } else {
            // Sub-container (e.g., "AI-assisted", "Accessibility Notes") — search its children
            for (const grandchild of (child as FrameNode).children) {
              if (grandchild.type === 'FRAME') allCardFrames.push(grandchild as FrameNode);
            }
          }
        }
      }

      // Fill each card by matching category key to card name
      for (const [key, data] of Object.entries(cards)) {
        const keyNorm = key.toLowerCase().replace(/[^a-z]/g, '');
        const aliases = KEY_ALIASES[key] || [];

        // Find matching card in all collected frames
        const card = allCardFrames.find(c => {
          const cardName = c.name.toLowerCase().replace(/[^a-z]/g, '');
          // Check direct fuzzy match
          if (cardName.includes(keyNorm) || keyNorm.includes(cardName)) return true;
          // Check aliases
          return aliases.some(a => cardName.includes(a) || a.includes(cardName));
        }) || null;

        if (!card) continue;

        // Remove placeholder and existing content
        for (const child of [...card.children]) {
          if (child.type === 'TEXT' && (child as TextNode).characters.includes('Awaiting AI fill')) child.remove();
          if (child.type === 'FRAME' && child.name === 'Content') child.remove();
        }

        const W = card.width - (card.paddingLeft || 16) - (card.paddingRight || 16);
        const contentFrame = figma.createFrame();
        contentFrame.name = 'Content';
        contentFrame.layoutMode = 'VERTICAL';
        contentFrame.primaryAxisSizingMode = 'AUTO';
        contentFrame.counterAxisSizingMode = 'FIXED';
        contentFrame.resize(W, 10);
        contentFrame.fills = [];
        contentFrame.itemSpacing = 0;

        function addDivider(parent: FrameNode) {
          const d = figma.createRectangle();
          d.name = 'Divider'; d.resize(W, 1);
          d.fills = [{ type: 'SOLID', color: DIV_C }];
          parent.appendChild(d);
          d.layoutSizingHorizontal = 'FILL';
          d.layoutSizingVertical = 'FIXED';
        }

        function wrapInFrame(textNode: TextNode, padTop: number, padBot: number, name: string, parent: FrameNode) {
          const f = figma.createFrame();
          f.name = name;
          f.layoutMode = 'VERTICAL';
          f.primaryAxisSizingMode = 'AUTO';
          f.counterAxisSizingMode = 'FIXED';
          f.resize(W, 10); f.fills = [];
          f.paddingTop = padTop; f.paddingBottom = padBot;
          f.appendChild(textNode);
          textNode.layoutSizingHorizontal = 'FILL';
          parent.appendChild(f);
          f.layoutSizingHorizontal = 'FILL';
          f.layoutSizingVertical = 'HUG';
        }

        // Items
        for (let i = 0; i < data.items.length; i++) {
          const item = data.items[i];
          const t = figma.createText();
          t.resize(W, 10); t.textAutoResize = 'HEIGHT';
          let chars = item.title;
          if (item.desc) chars += '\n' + item.desc;
          t.characters = chars;
          t.setRangeFontName(0, item.title.length, { family: 'Inter', style: 'Semi Bold' });
          t.setRangeFontSize(0, item.title.length, 11);
          t.setRangeFills(0, item.title.length, [{ type: 'SOLID', color: BLACK }]);
          if (item.desc) {
            const ds = item.title.length + 1;
            t.setRangeFontName(ds, chars.length, { family: 'Inter', style: 'Regular' });
            t.setRangeFontSize(ds, chars.length, 10);
            t.setRangeFills(ds, chars.length, [{ type: 'SOLID', color: GRAY }]);
          }
          wrapInFrame(t, 8, 8, item.title.substring(0, 30), contentFrame);
          if (i < data.items.length - 1) addDivider(contentFrame);
        }

        // Notes
        for (const note of (data.notes || [])) {
          addDivider(contentFrame);
          const t = figma.createText();
          t.resize(W, 10); t.textAutoResize = 'HEIGHT';
          t.characters = note;
          t.fontName = { family: 'Inter', style: 'Regular' };
          t.fontSize = 10;
          t.fills = [{ type: 'SOLID', color: BLUE }];
          wrapInFrame(t, 8, 4, 'WCAG Note', contentFrame);
        }

        // Warnings
        for (const warn of (data.warnings || [])) {
          addDivider(contentFrame);
          const t = figma.createText();
          t.resize(W, 10); t.textAutoResize = 'HEIGHT';
          t.characters = warn;
          t.fontName = { family: 'Inter', style: 'Semi Bold' };
          t.fontSize = 10;
          t.fills = [{ type: 'SOLID', color: ORANGE }];
          wrapInFrame(t, 6, 4, 'Warning', contentFrame);
        }

        card.appendChild(contentFrame);
        contentFrame.layoutSizingHorizontal = 'FILL';
        contentFrame.layoutSizingVertical = 'HUG';
        filledCards.push(card.name);
      }

      // Create focus annotations if provided
      let focusResult: Record<string, unknown> | null = null;
      if (focusOrderData && focusOrderData.length > 0) {
        focusResult = await handleBridgeMethod('CREATE_FOCUS_ANNOTATIONS', {
          nodeId,
          focusOrder: focusOrderData,
        });
      }

      return {
        rendered: true,
        filledCards,
        focusAnnotations: focusResult ? { created: true, entryCount: (focusResult as any).entryCount } : null,
      };
    }

    // ── Render blueline panels — native annotations + region overlays ──
    case 'RENDER_BLUELINE_PANELS': {
      const panelsData = params.panels as Record<string, {
        items: Array<{ title: string; desc: string; nodeId: string | null; annotationType: 'element' | 'region' | 'none' }>;
        notes: string[];
        warnings: string[];
      }>;
      if (!panelsData || Object.keys(panelsData).length === 0) throw new Error('panels object is required');

      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

      const page = figma.currentPage;

      // Category overlay colors (12% opacity fill, 50% opacity stroke)
      const OVERLAY_COLORS: Record<string, { r: number; g: number; b: number }> = {
        landmarks: { r: 0.145, g: 0.388, b: 0.921 },
        ariaRoles: { r: 0.486, g: 0.228, b: 0.929 },
        aria: { r: 0.486, g: 0.228, b: 0.929 },
        domStrategy: { r: 0.278, g: 0.333, b: 0.412 },
        dom: { r: 0.278, g: 0.333, b: 0.412 },
        headings: { r: 0.855, g: 0.424, b: 0.106 },
        names: { r: 0.063, g: 0.157, b: 0.294 },
        accessibleNames: { r: 0.063, g: 0.157, b: 0.294 },
        altText: { r: 0.608, g: 0.212, b: 0.208 },
        keyboard: { r: 0.176, g: 0.541, b: 0.431 },
        keyboardPatterns: { r: 0.176, g: 0.541, b: 0.431 },
        colorContrast: { r: 0.729, g: 0.192, b: 0.482 },
        forms: { r: 0.467, g: 0.533, b: 0.176 },
        targetSize: { r: 0.776, g: 0.608, b: 0.118 },
      };

      const SECTIONS_MAP: Record<string, string> = {
        focusIndicators: 'Focus Indicators', focusOrder: 'Focus Order',
        headings: 'Heading Hierarchy', headingHierarchy: 'Heading Hierarchy',
        landmarks: 'Landmarks', names: 'Accessible Names', accessibleNames: 'Accessible Names',
        altText: 'Alt-Text', aria: 'ARIA Roles & Attributes', ariaRoles: 'ARIA Roles & Attributes',
        keyboard: 'Keyboard Patterns', keyboardPatterns: 'Keyboard Patterns',
        dom: 'DOM Strategy', domStrategy: 'DOM Strategy', colorContrast: 'Color Contrast',
        forms: 'Forms', targetSize: 'Target Size', reflow: 'Reflow & Text Spacing',
        language: 'Language', media: 'Time-Based Media', skipNav: 'Skip Navigation',
        pageTitle: 'Page Title', reducedMotion: 'Reduced Motion',
        consistentNav: 'Consistent Navigation', autoRotation: 'Carousel',
      };

      const filledPanels: string[] = [];

      for (const [key, data] of Object.entries(panelsData)) {
        const title = SECTIONS_MAP[key] || key;
        const sectionName = `A11y ${title}`;

        // Find the Section on the current page
        const section = page.findOne(n => n.type === 'SECTION' && n.name === sectionName) as SectionNode | null;
        if (!section) continue;

        // Find the cloned design frame inside the section (first non-footer frame)
        const clone = section.children.find(
          c => c.type === 'FRAME' && c.name !== 'WCAG Footer'
        ) as FrameNode | null;
        if (!clone) continue;

        // Collect all nodes in the clone subtree by name for matching
        const cloneNodesFlat: SceneNode[] = [];
        function collectNodes(n: SceneNode) {
          cloneNodesFlat.push(n);
          if ('children' in n) {
            for (const child of (n as FrameNode).children) collectNodes(child);
          }
        }
        collectNodes(clone);

        // For each item, place annotation or overlay
        for (const item of data.items) {
          if (item.annotationType === 'none' || !item.nodeId) continue;

          // Find the original node to get its name, then find by name in clone
          const originalNode = await figma.getNodeByIdAsync(item.nodeId);
          if (!originalNode) continue;

          // Find matching node in clone by name
          const targetNode = cloneNodesFlat.find(n => n.name === originalNode.name);
          if (!targetNode) continue;

          if (item.annotationType === 'element') {
            // Native Figma annotation on the clone node
            try {
              (targetNode as any).annotations = [{
                labelMarkdown: `**${item.title}**\n${item.desc}`,
              }];
            } catch (e) {
              console.warn(`Annotation failed on "${item.title}":`, e);
            }
          } else if (item.annotationType === 'region') {
            // Semi-transparent overlay rectangle + annotation on the overlay
            const abs = targetNode.absoluteBoundingBox;
            const secAbs = section.absoluteBoundingBox;
            if (!abs || !secAbs) continue;

            const overlayColor = OVERLAY_COLORS[key] || { r: 0.145, g: 0.388, b: 0.921 };
            const overlay = figma.createRectangle();
            overlay.name = `Overlay: ${item.title}`;
            overlay.resize(abs.width, abs.height);
            overlay.x = abs.x - secAbs.x;
            overlay.y = abs.y - secAbs.y;
            overlay.fills = [{ type: 'SOLID', color: overlayColor, opacity: 0.12 }];
            overlay.strokes = [{ type: 'SOLID', color: overlayColor, opacity: 0.5 }];
            overlay.strokeWeight = 2;
            section.appendChild(overlay);

            // Pin annotation on the overlay
            try {
              (overlay as any).annotations = [{
                labelMarkdown: `**${item.title}**\n${item.desc}`,
              }];
            } catch (e) {
              console.warn(`Overlay annotation failed on "${item.title}":`, e);
            }
          }
        }

        // Fill WCAG footer with notes
        const footer = section.findOne(n => n.name === 'WCAG Footer') as FrameNode | null;
        if (footer && data.notes && data.notes.length > 0) {
          for (const note of data.notes) {
            const t = figma.createText();
            t.characters = note;
            t.fontName = { family: 'Inter', style: 'Regular' };
            t.fontSize = 10;
            t.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.4, b: 0.7 } }];
            t.textAutoResize = 'HEIGHT';
            t.resize(footer.width - 32, t.height);
            footer.appendChild(t);
            t.layoutSizingHorizontal = 'FILL';
          }
        }

        // Add warnings to footer
        if (footer && data.warnings && data.warnings.length > 0) {
          for (const warn of data.warnings) {
            const t = figma.createText();
            t.characters = warn;
            t.fontName = { family: 'Inter', style: 'Semi Bold' };
            t.fontSize = 10;
            t.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.35, b: 0 } }];
            t.textAutoResize = 'HEIGHT';
            t.resize(footer.width - 32, t.height);
            footer.appendChild(t);
            t.layoutSizingHorizontal = 'FILL';
          }
        }

        filledPanels.push(sectionName);
      }

      return { rendered: true, filledPanels };
    }

    // ── Create focus order sidebar + badges + focus indicator rectangles ──
    case 'CREATE_FOCUS_ANNOTATIONS': {
      const nodeId = params.nodeId as string | undefined;
      const entries = params.focusOrder as Array<{
        nodeId: string;
        name: string;
      }>;
      if (!entries || entries.length === 0) throw new Error('focusOrder array is required');

      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

      const page = figma.currentPage;
      const targetNode = nodeId
        ? await figma.getNodeByIdAsync(nodeId)
        : figma.currentPage.selection[0];
      if (!targetNode) throw new Error('Target node not found');
      const targetAbs = (targetNode as SceneNode).absoluteBoundingBox;
      if (!targetAbs) throw new Error('Target node has no bounding box');

      // Clean up previous annotations
      const oldNodes: SceneNode[] = [];
      for (const child of page.children) {
        if (child.name === 'Accessibility Annotations' ||
            child.name === 'Badge' ||
            child.name === 'Focus Rectangle') {
          oldNodes.push(child);
        }
      }
      for (const n of oldNodes) n.remove();

      // Resolve all entry nodes and get their bounds + corner radii
      const entryNodes = await Promise.all(
        entries.map(e => figma.getNodeByIdAsync(e.nodeId))
      );
      const resolved: Array<{
        name: string; id: string;
        x: number; y: number; w: number; h: number; r: number;
      }> = [];
      for (let i = 0; i < entries.length; i++) {
        const n = entryNodes[i] as SceneNode | null;
        if (!n) continue;
        const abs = n.absoluteBoundingBox;
        if (!abs) continue;
        let r = 0;
        if ('cornerRadius' in n) {
          const cr = (n as any).cornerRadius;
          r = (typeof cr === 'number' && cr !== figma.mixed) ? cr : 0;
        }
        // Circular elements: use half size as radius
        if (Math.abs(abs.width - abs.height) < 2 && abs.width < 50) {
          r = Math.max(r, Math.round(abs.width / 2));
        }
        resolved.push({
          name: entries[i].name, id: entries[i].nodeId,
          x: abs.x, y: abs.y, w: abs.width, h: abs.height, r,
        });
      }

      const BADGE_COLOR = { r: 0.188, g: 0.514, b: 0.322 };
      const BADGE_TEXT_C = { r: 1, g: 1, b: 1 };
      const FOCUS_BLUE = { r: 0.08, g: 0.45, b: 0.9 };
      const BG = { r: 1, g: 1, b: 1 };
      const STROKE = { r: 0.9, g: 0.9, b: 0.9 };
      const TEXT_P = { r: 0.12, g: 0.13, b: 0.18 };
      const BSIZE = 22;

      // ── Sidebar ──
      const sidebar = figma.createFrame();
      sidebar.name = 'Accessibility Annotations';
      sidebar.resize(320, 100);
      sidebar.layoutMode = 'VERTICAL';
      sidebar.counterAxisSizingMode = 'FIXED';
      sidebar.primaryAxisSizingMode = 'AUTO';
      sidebar.clipsContent = false;
      sidebar.paddingTop = 20; sidebar.paddingBottom = 20;
      sidebar.paddingLeft = 20; sidebar.paddingRight = 20;
      sidebar.itemSpacing = 8;
      sidebar.fills = [{ type: 'SOLID', color: BG }];
      sidebar.strokes = [{ type: 'SOLID', color: STROKE }];
      sidebar.strokeWeight = 1; sidebar.strokeAlign = 'INSIDE';
      sidebar.cornerRadius = 8;

      const hdr = figma.createText();
      hdr.characters = 'Accessibility Annotations';
      hdr.fontSize = 15;
      hdr.fontName = { family: 'Inter', style: 'Semi Bold' };
      hdr.fills = [{ type: 'SOLID', color: TEXT_P }];
      sidebar.appendChild(hdr);

      const secTitle = figma.createText();
      secTitle.characters = 'Focus Order';
      secTitle.fontSize = 13;
      secTitle.fontName = { family: 'Inter', style: 'Bold' };
      secTitle.fills = [{ type: 'SOLID', color: TEXT_P }];
      sidebar.appendChild(secTitle);

      for (let i = 0; i < resolved.length; i++) {
        const e = resolved[i];
        const row = figma.createFrame();
        row.name = `${e.name} (ID: ${e.id})`;
        row.layoutMode = 'HORIZONTAL';
        row.counterAxisSizingMode = 'AUTO';
        row.primaryAxisSizingMode = 'AUTO';
        row.itemSpacing = 10;
        row.counterAxisAlignItems = 'CENTER';
        row.fills = [];

        // Circular badge
        const badge = figma.createFrame();
        badge.name = 'Badge';
        badge.resize(BSIZE, BSIZE);
        badge.layoutMode = 'NONE';
        badge.cornerRadius = BSIZE / 2;
        badge.fills = [{ type: 'SOLID', color: BADGE_COLOR }];
        const bNum = figma.createText();
        bNum.characters = String(i + 1);
        bNum.fontSize = 10;
        bNum.fontName = { family: 'Inter', style: 'Bold' };
        bNum.fills = [{ type: 'SOLID', color: BADGE_TEXT_C }];
        bNum.textAlignHorizontal = 'CENTER';
        badge.appendChild(bNum);
        bNum.x = (BSIZE - bNum.width) / 2;
        bNum.y = (BSIZE - bNum.height) / 2;
        row.appendChild(badge);

        // Hidden info node for GET_BLUELINE_DATA parsing
        const info = figma.createFrame();
        info.name = 'Focus Order Info';
        info.resize(1, 1); info.fills = []; info.visible = false;
        row.appendChild(info);

        const label = figma.createText();
        label.characters = e.name;
        label.fontSize = 12;
        label.fontName = { family: 'Inter', style: 'Regular' };
        label.fills = [{ type: 'SOLID', color: TEXT_P }];
        row.appendChild(label);

        sidebar.appendChild(row);
        if (i < resolved.length - 1) {
          const div = figma.createFrame();
          div.name = 'Divider';
          div.resize(280, 1);
          div.fills = [{ type: 'SOLID', color: STROKE }];
          sidebar.appendChild(div);
          div.layoutSizingHorizontal = 'FILL';
        }
      }

      sidebar.x = targetAbs.x - 360;
      sidebar.y = targetAbs.y;
      page.appendChild(sidebar);

      // ── Badges on design ──
      for (let j = 0; j < resolved.length; j++) {
        const e = resolved[j];
        const b = figma.createFrame();
        b.name = 'Badge';
        b.resize(BSIZE, BSIZE);
        b.layoutMode = 'NONE';
        b.cornerRadius = BSIZE / 2;
        b.fills = [{ type: 'SOLID', color: BADGE_COLOR }];
        const num = figma.createText();
        num.characters = String(j + 1);
        num.fontSize = 10;
        num.fontName = { family: 'Inter', style: 'Bold' };
        num.fills = [{ type: 'SOLID', color: BADGE_TEXT_C }];
        num.textAlignHorizontal = 'CENTER';
        b.appendChild(num);
        num.x = (BSIZE - num.width) / 2;
        num.y = (BSIZE - num.height) / 2;
        b.x = e.x - 4;
        b.y = e.y - BSIZE - 2;
        page.appendChild(b);
      }

      // ── Focus indicator rectangles (shape-matched) ──
      const pad = 3;
      for (let k = 0; k < resolved.length; k++) {
        const f = resolved[k];
        const rect = figma.createRectangle();
        rect.name = 'Focus Rectangle';
        rect.x = f.x - pad;
        rect.y = f.y - pad;
        rect.resize(f.w + pad * 2, f.h + pad * 2);
        rect.fills = [];
        rect.strokes = [{ type: 'SOLID', color: FOCUS_BLUE }];
        rect.strokeWeight = 2;
        rect.cornerRadius = f.r > 0 ? f.r + pad : 2;
        page.appendChild(rect);
      }

      return {
        created: true,
        sidebarId: sidebar.id,
        entryCount: resolved.length,
        entries: resolved.map((e, i) => ({ index: i + 1, name: e.name, nodeId: e.id })),
      };
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
    case 'annotate-audit-issues': {
      const issues: Array<{ nodeId: string; nodeName: string; property: string; value: string }> = msg.issues || [];
      if (issues.length === 0) { figma.notify('No issues to annotate'); break; }
      let annotated = 0;
      for (const issue of issues) {
        try {
          const node = await figma.getNodeByIdAsync(issue.nodeId);
          if (!node) continue;
          (node as any).annotations = [{
            labelMarkdown: `**${issue.property}**: ${issue.value} — no S2A token`,
            properties: [],
          }];
          annotated++;
        } catch (e) {
          console.warn(`Annotation failed on "${issue.nodeName}":`, e);
        }
      }
      figma.notify(`Annotated ${annotated} of ${issues.length} issues`);
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
        figma.ui.postMessage({ type: 'match-result', message: `Done: ${result.applied} matched, ${result.skipped} skipped`, issues: result.issues });
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
    case 'generate-plugin-annotations': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a frame first'); break; }
      const annotations = Array.isArray(msg.annotations) ? (msg.annotations as string[]) : [];
      try {
        const target = sel[0];
        let count = 0;
        if (annotations.includes('focusIndicators')) {
          await generateFocusIndicators(target);
          count++;
        }
        if (annotations.includes('focusOrder')) {
          const focusable = collectFocusableElements(target);
          if (focusable.length > 0) {
            await handleBridgeMethod('CREATE_FOCUS_ANNOTATIONS', {
              nodeId: target.id,
              focusOrder: focusable.map((n, i) => ({ nodeId: n.id, name: n.name || `Element ${i + 1}` })),
            });
            count++;
          } else {
            figma.notify('No focusable elements found for focus order.');
          }
        }
        figma.ui.postMessage({ type: 'a11y-status', message: count > 0 ? 'Annotations created.' : 'Nothing to generate.' });
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        figma.ui.postMessage({ type: 'a11y-status', message: `Error: ${errorMsg}` });
        figma.notify(`Annotation failed: ${errorMsg}`, { error: true });
      }
      break;
    }
    case 'generate-blueline': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a frame first'); break; }
      try {
        const categories = Array.isArray(msg.categories) ? (msg.categories as string[]) : [];
        figma.ui.postMessage({ type: 'a11y-status', message: 'Creating blueline scaffold...' });
        const grouped = msg.grouped === true;
        const plainLanguage = msg.plainLanguage === true;
        const result = await generateBlueline(sel[0], categories, { grouped });

        // Always trigger AI fill via bridge
        figma.ui.postMessage({
          type: 'a11y-fill-request',
          mode: 'sections',
          frameId: result.frameId,
          sections: result.sections,
          frameName: sel[0].name,
          plainLanguage,
        });
        figma.notify(`Blueline scaffold created for "${sel[0].name}"`);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        figma.ui.postMessage({ type: 'a11y-status', message: `Error: ${errorMsg}` });
        figma.notify(`Blueline failed: ${errorMsg}`, { error: true });
      }
      break;
    }
    case 'generate-blueline-panels': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a frame first'); break; }
      try {
        const categories = Array.isArray(msg.categories) ? (msg.categories as string[]) : [];
        figma.ui.postMessage({ type: 'a11y-status', message: 'Creating blueline panels...' });
        const result = await generateBluelinePanels(sel[0], categories);

        // Panels always use copy-prompt flow
        figma.ui.postMessage({
          type: 'a11y-panels-fill-request',
          sections: result.sections,
          frameName: sel[0].name,
          sectionIds: result.sectionIds,
        });
        figma.notify(`Blueline panels created for "${sel[0].name}"`);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        figma.ui.postMessage({ type: 'a11y-status', message: `Error: ${errorMsg}` });
        figma.notify(`Panels failed: ${errorMsg}`, { error: true });
      }
      break;
    }
    case 'get-api-key': {
      const provider = typeof msg.provider === 'string' ? msg.provider : 'mymemory';
      await postApiKeyState(provider);
      break;
    }
    case 'save-api-key': {
      const key = typeof msg.key === 'string' ? msg.key.trim() : '';
      const provider = typeof msg.provider === 'string' ? msg.provider : 'mymemory';
      if (!key) { figma.notify('Empty API key', { error: true }); break; }
      await figma.clientStorage.setAsync(apiKeyStorageKey(provider), key);
      await postApiKeyState(provider);
      figma.notify('API key saved');
      break;
    }
    case 'clear-api-key': {
      const provider = typeof msg.provider === 'string' ? msg.provider : 'mymemory';
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
      const languages = Array.isArray(msg.languages) ? (msg.languages as string[]) : [];
      const applyRtl = Boolean(msg.applyRtl);
      if (languages.length === 0) {
        figma.ui.postMessage({ type: 'localize-status', message: 'Select at least one language.' });
        break;
      }

      // Bridge provider — collect text and send to UI for prompt generation
      if (provider === 'bridge') {
        const sourceTexts = collectSourceText(sel[0]);
        if (sourceTexts.length === 0) {
          figma.ui.postMessage({ type: 'localize-status', message: 'No text found in selection.' });
          break;
        }
        figma.ui.postMessage({
          type: 'localize-bridge-prompt',
          frameName: sel[0].name,
          frameId: sel[0].id,
          languages,
          applyRtl,
          sourceTexts,
        });
        break;
      }

      const needsKey = ['deepl', 'google', 'azure'].includes(provider);
      let apiKey = '';
      if (needsKey) {
        apiKey = await figma.clientStorage.getAsync(apiKeyStorageKey(provider)) || '';
        if (!apiKey) {
          figma.ui.postMessage({ type: 'localize-status', message: `Add your ${provider} API key first.` });
          break;
        }
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
