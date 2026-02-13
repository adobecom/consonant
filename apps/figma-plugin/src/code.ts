import uiTemplate from './ui.html?raw';
import { analyzeSource, getSpecById, listSpecSummaries } from './spec-registry.js';
import {
  type ComponentSpec,
  type RectangleLayerSpec,
  type TextLayerSpec,
  type TextFallbackSpec,
  type VariantOverrideSpec,
  type VariantLayerOverride,
  type VariantConfiguration,
  type VariantNodeSpec
} from './types.js';
import { validateSpec } from './spec-validation.js';
import { applyTokenToNode, mapTokenWithOverrides, resolveFigmaVariable } from './token-mapper.js';

figma.showUI(uiTemplate, { width: 420, height: 560 });

figma.ui.onmessage = async msg => {
  if (!msg) {
    return;
  }

  switch (msg.type) {
    case 'ui-ready': {
      figma.ui.postMessage({ type: 'spec-list', payload: listSpecSummaries() });
      break;
    }

    case 'preview-custom-spec': {
      const source = String(msg.payload?.source ?? '').trim();
      if (!source) {
        figma.ui.postMessage({ type: 'custom-spec-summary', payload: null });
        break;
      }
      try {
        const { summary } = analyzeSource(source, 'custom-preview');
        figma.ui.postMessage({ type: 'custom-spec-summary', payload: summary });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to parse YAML.';
        figma.ui.postMessage({ type: 'error', payload: message });
      }
      break;
    }

    case 'generate-component': {
      await handleGeneration(msg.payload);
      break;
    }

    default:
      break;
  }
};

async function handleGeneration(payload: { specId?: string; source?: string }) {
  let spec: ComponentSpec | undefined;
  let tokens: string[] = [];

  if (payload?.source) {
    try {
      const { spec: parsed, summary } = analyzeSource(payload.source, 'custom-runtime');
      spec = parsed;
      tokens = summary.tokens;
      if (summary.errors.length) {
        figma.ui.postMessage({ type: 'error', payload: summary.errors.join('\n') });
        figma.notify('Spec validation failed.');
        return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse custom YAML.';
      figma.ui.postMessage({ type: 'error', payload: message });
      return;
    }
  } else if (payload?.specId) {
    const specRecord = getSpecById(payload.specId);
    if (!specRecord) {
      figma.ui.postMessage({ type: 'error', payload: `Spec ${payload.specId} not found.` });
      return;
    }
    const validationErrors = validateSpec(specRecord.data);
    if (validationErrors.length) {
      figma.ui.postMessage({ type: 'error', payload: validationErrors.join('\n') });
      figma.notify('Spec validation failed.');
      return;
    }
    spec = specRecord.data;
    tokens = specRecord.tokens;
  } else {
    figma.ui.postMessage({ type: 'error', payload: 'Select a spec or provide YAML input.' });
    return;
  }

  try {
    const result = await buildFromSpec(spec);
    result.node.setPluginData('consonant:tokens', JSON.stringify(tokens));
    figma.ui.postMessage({
      type: 'generation-complete',
      payload: { name: result.node.name, kind: result.kind }
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Component generation failed.';
    figma.notify('Component generation failed.');
    figma.ui.postMessage({ type: 'error', payload: message });
  }
}

async function buildFromSpec(spec: ComponentSpec) {
  if (spec.component.variants && spec.component.variants.nodes?.length) {
    const node = await createComponentSetFromSpec(spec.component.variants, spec);
    return { kind: 'component-set' as const, node };
  }
  const node = await instantiateComponent(spec);
  figma.currentPage.appendChild(node);
  figma.currentPage.selection = [node];
  figma.viewport.scrollAndZoomIntoView([node]);
  return { kind: 'component' as const, node };
}

async function instantiateComponent(spec: ComponentSpec, overrides?: VariantNodeSpec) {
  const {
    component: { name, frame, layers }
  } = spec;
  const component = figma.createComponent();
  component.name = overrides?.name ?? name;
  component.resize(frame.width, frame.height);
  component.layoutMode = 'NONE';
  component.counterAxisSizingMode = 'AUTO';
  component.primaryAxisSizingMode = 'AUTO';
  
  // Apply root/Surface styles directly to the component frame (not a separate layer)
  // Find the Surface layer in the spec and apply its styles to the component
  const surfaceLayer = layers.find(layer => layer.name === 'Surface' || layer.name === 'root');
  if (surfaceLayer && surfaceLayer.kind === 'rectangle') {
    // Apply fills, strokes, and cornerRadius to the component frame itself
    applyFill(component, surfaceLayer.tokens?.fill, surfaceLayer.fallback?.fill);
    if (surfaceLayer.tokens?.stroke || surfaceLayer.fallback?.stroke) {
      applyStroke(component, surfaceLayer.tokens?.stroke, surfaceLayer.fallback?.stroke);
    }
    if (surfaceLayer.cornerRadius !== undefined) {
      component.cornerRadius = surfaceLayer.cornerRadius;
    }
  } else {
    // Default: no fill
    component.fills = [];
  }

  // Add child layers (skip Surface/root - it's the frame itself)
  for (const layer of layers) {
    // Skip Surface/root - those styles go on the component frame
    if (layer.name === 'Surface' || layer.name === 'root') {
      continue;
    }
    if (layer.kind === 'rectangle') {
      component.appendChild(createRectangleLayer(layer, frame));
      continue;
    }
    if (layer.kind === 'text') {
      component.appendChild(await createTextLayer(layer, frame));
    }
  }

  if (overrides?.overrides) {
    await applyVariantOverrides(component, overrides.overrides);
  }

  return component;
}

async function createComponentSetFromSpec(variants: VariantConfiguration, spec: ComponentSpec) {
  // Create a frame to hold the component set (Figma component sets are frames containing components)
  const componentSetFrame = figma.createFrame();
  componentSetFrame.name = variants.name ?? spec.meta.title ?? spec.component.name;
  componentSetFrame.layoutMode = 'NONE';
  
  // Set up componentPropertyDefinitions FIRST
  // This tells Figma what variant properties exist
  const propertyDefinitions: ComponentPropertyDefinitions = {};
  
  for (const property of variants.properties) {
    // Try to find a Figma variable for this property's default value
    // Format: "button/property/{propertyName}/default" or similar
    const defaultVariablePath = `button/property/${property.name.toLowerCase()}/default`;
    const defaultVariableId = resolveFigmaVariable(defaultVariablePath);
    
    const propDef: ComponentPropertyDefinition = {
      type: 'VARIANT',
      variantOptions: property.values,
      defaultValue: property.values[0] // Use first value as default
    };
    
    // If we found a variable, bind it to the defaultValue
    if (defaultVariableId) {
      propDef.boundVariables = {
        defaultValue: {
          type: 'VARIABLE_ALIAS',
          id: defaultVariableId
        }
      };
      console.log(`✓ Bound variable "${defaultVariablePath}" to property "${property.name}" defaultValue`);
    }
    
    propertyDefinitions[property.name] = propDef;
  }
  
  // Create all variant components as children of the frame
  const columns = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(variants.nodes.length))));
  const gap = 32;
  const frameWidth = spec.component.frame.width;
  const frameHeight = spec.component.frame.height;

  for (let index = 0; index < variants.nodes.length; index++) {
    const variantNode = variants.nodes[index];
    const component = await instantiateComponent(spec, variantNode);
    
    // Name component with just the variant identifier (Figma will use property definitions)
    // Format: "Property1=Value1, Property2=Value2"
    const propString = Object.entries(variantNode.properties || {})
      .map(([key, value]) => `${key}=${value}`)
      .join(', ');
    component.name = propString || variantNode.name || `Variant ${index + 1}`;
    
    const col = index % columns;
    const row = Math.floor(index / columns);
    component.x = col * (frameWidth + gap);
    component.y = row * (frameHeight + gap);
    
    // Add component as child of the frame
    componentSetFrame.appendChild(component);
  }

  // Convert the frame to a component set
  // Note: Figma doesn't have a direct "createComponentSet" API
  // We need to use combineAsVariants on the children
  const children = componentSetFrame.children.filter(child => child.type === 'COMPONENT') as ComponentNode[];
  
  if (children.length === 0) {
    throw new Error('No components created');
  }

  // Remove frame from page temporarily for combining
  figma.currentPage.appendChild(componentSetFrame);
  
  // Combine children into component set
  const componentSet = figma.combineAsVariants(children, figma.currentPage);
  
  if (!componentSet) {
    // Fallback: if combineAsVariants fails, try a different approach
    // Create component set by converting frame (this might not work, but worth trying)
    throw new Error('Failed to create component set - combineAsVariants returned null');
  }

  componentSet.name = variants.name ?? spec.meta.title ?? spec.component.name;
  
  // Apply property definitions
  componentSet.componentPropertyDefinitions = propertyDefinitions;

  // Layout the component set in a grid
  layoutComponentSetInGrid(componentSet, columns, frameWidth, frameHeight, gap);

  // Remove the temporary frame if it still exists
  if (componentSetFrame.parent) {
    componentSetFrame.remove();
  }

  figma.currentPage.selection = [componentSet];
  figma.viewport.scrollAndZoomIntoView([componentSet]);
  return componentSet;
}

/**
 * Layouts component set children in a grid for documentation
 */
function layoutComponentSetInGrid(
  componentSet: ComponentSetNode,
  columns: number,
  itemWidth: number,
  itemHeight: number,
  gap: number
) {
  let index = 0;
  Array.from(componentSet.children).forEach((child) => {
    if (child.type === 'COMPONENT') {
      const col = index % columns;
      const row = Math.floor(index / columns);
      child.x = col * (itemWidth + gap);
      child.y = row * (itemHeight + gap);
      index++;
    }
  });
}

// NOTE: This function is no longer used since variantGroupProperties is read-only
// Figma automatically creates variant groups from the variantProperties on child components
// Keeping it for reference but it should not be called
function buildVariantGroupProperties(variants: VariantConfiguration): ComponentSetVariantGroupProperties {
  const group: ComponentSetVariantGroupProperties = {};
  variants.properties.forEach(property => {
    const values: Record<string, {}> = {};
    property.values.forEach(value => {
      values[value] = {};
    });
    group[property.name] = { values };
  });
  return group;
}

async function applyVariantOverrides(component: ComponentNode, overrides: VariantOverrideSpec) {
  if (!overrides.layers) {
    return;
  }
  
  console.log('Applying variant overrides to component:', component.name, 'Layers:', Object.keys(overrides.layers));
  
  // Apply overrides to component frame itself (for "root" element)
  // The component frame IS the background - no separate Surface layer
  if (overrides.layers.root || overrides.layers.Surface) {
    const rootOverride = overrides.layers.root || overrides.layers.Surface;
    console.log('Applying root override to component frame:', rootOverride);
    if (rootOverride && rootOverride.tokens) {
      if (rootOverride.tokens.fill) {
        console.log('Applying fill token to frame:', rootOverride.tokens.fill, 'fallback:', (rootOverride.fallback as any)?.fill);
        applyFill(component, rootOverride.tokens.fill, (rootOverride.fallback as any)?.fill);
      }
      if (rootOverride.tokens.stroke) {
        console.log('Applying stroke token to frame:', rootOverride.tokens.stroke, 'fallback:', (rootOverride.fallback as any)?.stroke);
        applyStroke(component, rootOverride.tokens.stroke, (rootOverride.fallback as any)?.stroke);
      }
    }
  }
  
  // Apply overrides to child layers (NOT root/Surface - that's the frame)
  for (const [layerName, override] of Object.entries(overrides.layers)) {
    // Skip root/Surface - those are applied to the component frame above
    if (layerName === 'root' || layerName === 'Surface') {
      continue;
    }
    
    console.log('Looking for layer:', layerName);
    
    // Try to find the layer by name (case-insensitive search)
    const target = component.findOne(node => {
      if ('name' in node) {
        return node.name.toLowerCase() === layerName.toLowerCase();
      }
      return false;
    }) as SceneNode | null;
    
    if (!target) {
      console.warn('Layer not found:', layerName, 'Available layers:', component.children.map(c => 'name' in c ? c.name : 'unnamed'));
      // If not found, try searching all children
      const allChildren = component.findAll(node => 'name' in node);
      const found = allChildren.find(node => 
        'name' in node && (node as any).name.toLowerCase() === layerName.toLowerCase()
      );
      if (found) {
        console.log('Found layer via findAll:', found.name);
        if (found.type === 'RECTANGLE') {
          applyRectangleOverride(found, override);
        } else if (found.type === 'TEXT') {
          await applyTextOverride(found, override);
        }
      }
      continue;
    }
    
    console.log('Found layer:', target.name, 'type:', target.type);
    if (target.type === 'RECTANGLE') {
      applyRectangleOverride(target, override);
    } else if (target.type === 'TEXT') {
      await applyTextOverride(target, override);
    }
  }
}

function createRectangleLayer(layer: RectangleLayerSpec, frame: ComponentSpec['component']['frame']) {
  const rect = figma.createRectangle();
  rect.name = layer.name;
  rect.resize(frame.width, frame.height);
  rect.cornerRadius = layer.cornerRadius ?? 0;
  applyFill(rect, layer.tokens?.fill, layer.fallback?.fill);
  if (layer.tokens?.stroke || layer.fallback?.stroke) {
    applyStroke(rect, layer.tokens?.stroke, layer.fallback?.stroke);
  }
  if (layer.tokens?.fill) {
    rect.setPluginData('token:fill', layer.tokens.fill);
  }
  if (layer.tokens?.stroke) {
    rect.setPluginData('token:stroke', layer.tokens.stroke);
  }
  return rect;
}

async function createTextLayer(layer: TextLayerSpec, frame: ComponentSpec['component']['frame']) {
  const textNode = figma.createText();
  textNode.name = layer.name;

  const fallback = layer.fallback as TextFallbackSpec | undefined;
  const fontName = fallback
    ? { family: fallback.fontFamily, style: fallback.fontStyle }
    : { family: 'Inter', style: 'Regular' };

  await figma.loadFontAsync(fontName);
  textNode.fontName = fontName;
  textNode.characters = layer.characters;
  const paddingX = frame.padding?.horizontal ?? 0;
  const paddingY = frame.padding?.vertical ?? 0;
  textNode.resize(frame.width - paddingX * 2, frame.height - paddingY * 2);
  textNode.textAutoResize = 'HEIGHT';
  textNode.textAlignHorizontal = 'CENTER';
  textNode.textAlignVertical = 'CENTER';

  if (fallback?.fontSize) {
    textNode.fontSize = fallback.fontSize;
  }
  if (typeof fallback?.letterSpacing === 'number') {
    textNode.letterSpacing = { value: fallback.letterSpacing, unit: 'PIXELS' };
  }

  applyFill(textNode, layer.tokens?.fill, fallback?.fill ?? '#FFFFFF');

  if (layer.tokens?.typography) {
    textNode.setPluginData('token:typography', layer.tokens.typography);
  }
  if (layer.tokens?.fill) {
    textNode.setPluginData('token:fill', layer.tokens.fill);
  }

  textNode.x = paddingX;
  textNode.y = paddingY;

  return textNode;
}

function applyRectangleOverride(node: RectangleNode, override: VariantLayerOverride) {
  if (typeof override.cornerRadius === 'number') {
    node.cornerRadius = override.cornerRadius;
  }
  if (override.tokens?.fill || (override.fallback as any)?.fill) {
    const fallback = override.fallback as { fill?: string } | undefined;
    applyFill(node, override.tokens?.fill, fallback?.fill);
  }
  if (override.tokens?.stroke || (override.fallback as any)?.stroke) {
    const fallback = override.fallback as { stroke?: string } | undefined;
    applyStroke(node, override.tokens?.stroke, fallback?.stroke);
  }
  if (override.tokens?.fill) {
    node.setPluginData('token:fill', override.tokens.fill);
  }
  if (override.tokens?.stroke) {
    node.setPluginData('token:stroke', override.tokens.stroke);
  }
}

async function applyTextOverride(node: TextNode, override: VariantLayerOverride) {
  const fontName = node.fontName === figma.mixed ? { family: 'Inter', style: 'Regular' } : (node.fontName as FontName);
  await figma.loadFontAsync(fontName);
  if (node.fontName === figma.mixed) {
    node.fontName = fontName;
  }

  if (typeof override.characters === 'string') {
    node.characters = override.characters;
  }

  const fallback = override.fallback as TextFallbackSpec | undefined;
  if (override.tokens?.fill || fallback?.fill) {
    applyFill(node, override.tokens?.fill, fallback?.fill);
  }
  if (override.tokens?.fill) {
    node.setPluginData('token:fill', override.tokens.fill);
  }
  if (override.tokens?.typography) {
    node.setPluginData('token:typography', override.tokens.typography);
  }
}

function applyFill(node: GeometryMixin, token?: string, fallbackHex?: string | number) {
  if (token) {
    // Try to apply token using Figma variables
    const applied = applyTokenToNode(node, token, fallbackHex, 'fill');
    if (applied) {
      return; // Successfully applied via variable
    }
  }
  
  // Fallback to hex color if token not found or no token provided
  if (fallbackHex) {
    const color = hexToPaint(String(fallbackHex));
    if (color) {
      node.fills = [color];
    }
  }
  
  // Store token reference for debugging/auditing
  if (token) {
    const variableName = mapTokenWithOverrides(token);
    node.setPluginData('token:fill', token);
    node.setPluginData('variable:fill', variableName);
  }
}

function applyStroke(node: GeometryMixin, token?: string, fallbackHex?: string | number) {
  if (token) {
    // Try to apply token using Figma variables
    const applied = applyTokenToNode(node, token, fallbackHex, 'stroke');
    if (applied) {
      return; // Successfully applied via variable
    }
  }
  
  // Fallback to hex color if token not found or no token provided
  if (fallbackHex) {
    const color = hexToPaint(String(fallbackHex));
    if (color) {
      node.strokes = [color];
      node.strokeWeight = 1;
    }
  }
  
  // Store token reference for debugging/auditing
  if (token) {
    const variableName = mapTokenWithOverrides(token);
    node.setPluginData('token:stroke', token);
    node.setPluginData('variable:stroke', variableName);
  }
}

function hexToPaint(value: string): Paint | null {
  const hex = value.startsWith('#') ? value.slice(1) : value;
  if (hex.length !== 6) {
    return null;
  }
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return {
    type: 'SOLID',
    color: { r, g, b },
    opacity: 1
  };
}
