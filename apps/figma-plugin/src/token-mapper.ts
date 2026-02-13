/**
 * Token Mapper: Maps Anova token paths to Figma variable names
 * 
 * Key insight: Figma variables use "/" separators in their names
 * Anova exports also use "/" separators
 * 
 * Anova format: "Component/button/color/background/accent/solid-default"
 * Figma format: "button/color/background/accent/solid-default"
 * 
 * The mapping is simple: remove "Component/" prefix and use the path directly
 */

/**
 * Maps Anova token path to Figma variable name
 * 
 * @param anovaPath - Anova token path like "Component/button/color/background/accent/solid-default"
 * @returns Figma variable name like "button/color/background/accent/solid-default"
 */
export function mapAnovaTokenToFigmaVariable(anovaPath: string): string {
  if (!anovaPath) {
    return '';
  }

  // Remove Component/ prefix
  let path = anovaPath.replace(/^Component\//, '');
  
  // Handle Semantic (Color) -> semantic/color
  path = path.replace(/^Semantic\s*\(Color\)\//, 'semantic/color/');
  path = path.replace(/^Semantic\s*\/color\//, 'semantic/color/');
  path = path.replace(/^Semantic\//, 'semantic/');
  
  // Handle Primitives (Core) -> primitives/core
  path = path.replace(/^Primitives\s*\(Core\)\//, 'primitives/core/');
  path = path.replace(/^Primitives\//, 'primitives/');
  
  // Clean up any double slashes
  path = path.replace(/\/+/g, '/');
  
  // Remove trailing slash
  path = path.replace(/\/$/, '');
  
  return path;
}

/**
 * Resolves Figma variable by name from local variables
 * 
 * Figma variables use "/" separators in their names (e.g., "button/color/background/accent/solid-default")
 * We search by exact match on variable.name
 */
export function resolveFigmaVariable(variableName: string): string | null {
  try {
    const localVariables = figma.variables.getLocalVariables();
    
    // Normalize: trim and handle case-insensitive matching
    const normalizedSearch = variableName.trim().toLowerCase();
    
    console.log(`Searching for Figma variable: "${variableName}"`);
    
    // Try exact match (case-insensitive)
    for (const variable of localVariables) {
      const varName = (variable.name || '').trim().toLowerCase();
      if (varName === normalizedSearch) {
        console.log(`✓ Found exact match: "${variable.name}" (ID: ${variable.id})`);
        return variable.id;
      }
    }
    
    // Log sample variables for debugging
    if (localVariables.length > 0) {
      const sampleVars = localVariables
        .slice(0, 10)
        .map(v => v.name)
        .filter(Boolean);
      console.log(`Sample variable names:`, sampleVars);
    }
    
    console.log(`✗ Variable not found: "${variableName}"`);
    return null;
  } catch (error) {
    console.warn('Error resolving Figma variable:', error);
    return null;
  }
}

/**
 * Creates a Paint object from a Figma variable ID
 */
export function createPaintFromVariable(variableId: string): Paint | null {
  try {
    const variable = figma.variables.getVariableById(variableId);
    if (!variable) {
      return null;
    }

    // Get the resolved value for the current mode
    const resolvedValue = variable.valuesByMode;
    const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
    const modeId = collection?.modes[0]?.modeId;
    
    if (!modeId || !resolvedValue[modeId]) {
      return null;
    }

    const value = resolvedValue[modeId];
    
    // Handle different variable types
    if (variable.resolvedType === 'COLOR') {
      // If it's a variable alias, resolve it
      if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
        const aliasedVar = figma.variables.getVariableById(value.id);
        if (aliasedVar) {
          return createPaintFromVariable(aliasedVar.id);
        }
      }
      // If it's a direct color value
      if (typeof value === 'object' && 'r' in value) {
        return {
          type: 'SOLID',
          color: {
            r: value.r,
            g: value.g,
            b: value.b
          },
          opacity: value.a !== undefined ? value.a : 1
        };
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Error creating paint from variable:', error);
    return null;
  }
}

/**
 * Gets a fallback color for a token path (when variable can't be resolved)
 */
function getTokenFallbackColor(anovaTokenPath: string, property: 'fill' | 'stroke'): string | undefined {
  // Common token fallbacks - these are placeholder colors until variables are set up
  const fallbacks: Record<string, string> = {
    // Button accent colors
    'Component/button/color/background/accent/solid-default': '#1473E6',
    'Component/button/color/background/accent/solid-hover': '#0D66D0',
    'Component/button/color/background/primary/outlined-default': 'transparent',
    'Component/button/color/background/primary/outlined-hover': '#F5F5F5',
    'Component/button/color/border/primary/outlined-default': '#1473E6',
    'Component/button/color/border/primary/outlined-hover': '#0D66D0',
    'Component/button/color/content/primary/outlined-hover': '#0D66D0',
    // Semantic colors
    'Semantic (Color)/color/background/disabled': '#E5E5E5',
    'Semantic (Color)/color/content/disabled': '#999999',
    'Semantic (Color)/color/content/knockout': '#FFFFFF',
    'Semantic (Color)/color/content/default': '#2C2C2C',
    'Semantic (Color)/color/border/disabled': '#CCCCCC',
  };
  
  return fallbacks[anovaTokenPath];
}

/**
 * Applies a token to a node, trying Figma variable first, then fallback
 */
export function applyTokenToNode(
  node: GeometryMixin,
  anovaTokenPath: string,
  fallbackColor?: string | number,
  property: 'fill' | 'stroke' = 'fill'
): boolean {
  // Map Anova path to Figma variable name
  const figmaVariableName = mapAnovaTokenToFigmaVariable(anovaTokenPath);
  if (!figmaVariableName) {
    // No token, use provided fallback or token-specific fallback
    const color = fallbackColor ? String(fallbackColor) : getTokenFallbackColor(anovaTokenPath, property);
    if (color && color !== 'transparent') {
      const paint = hexToPaint(color);
      if (paint) {
        if (property === 'fill') {
          node.fills = [paint];
        } else {
          node.strokes = [paint];
          node.strokeWeight = 1;
        }
      }
    } else if (color === 'transparent') {
      // Handle transparent fills
      if (property === 'fill') {
        node.fills = [];
      } else {
        node.strokes = [];
      }
    }
    return false;
  }

  // Try to resolve the variable
  const variableId = resolveFigmaVariable(figmaVariableName);
  if (variableId) {
    // Get the variable to check its type
    const variable = figma.variables.getVariableById(variableId);
    if (variable && variable.resolvedType === 'COLOR') {
      // Bind the variable to the fill/stroke using boundVariables
      // This creates a live link to the variable, not just a static color
      try {
        if (property === 'fill') {
          // Create a paint with the variable bound
          const paint: SolidPaint = {
            type: 'SOLID',
            color: { r: 0, g: 0, b: 0 }, // Placeholder - will be resolved by variable
            opacity: 1
          };
          node.fills = [paint];
          // Bind the variable to the fill
          node.setBoundVariable('fills', 0, variableId);
        } else {
          // For stroke, create paint and bind variable
          const paint: SolidPaint = {
            type: 'SOLID',
            color: { r: 0, g: 0, b: 0 }, // Placeholder - will be resolved by variable
            opacity: 1
          };
          node.strokes = [paint];
          node.strokeWeight = 1;
          // Bind the variable to the stroke
          node.setBoundVariable('strokes', 0, variableId);
        }
        // Store the token reference for debugging
        node.setPluginData(`token:${property}`, anovaTokenPath);
        node.setPluginData(`variable:${property}`, figmaVariableName);
        node.setPluginData(`variableId:${property}`, variableId);
        console.log(`✓ Bound variable "${figmaVariableName}" (${variableId}) to ${property}`);
        return true;
      } catch (error) {
        console.warn(`Failed to bind variable ${variableId} to ${property}:`, error);
        // Fall through to use resolved color as fallback
      }
    }
  }

  // Variable not found, use fallback
  const color = fallbackColor ? String(fallbackColor) : getTokenFallbackColor(anovaTokenPath, property);
  if (color && color !== 'transparent') {
    const paint = hexToPaint(color);
    if (paint) {
      if (property === 'fill') {
        node.fills = [paint];
      } else {
        node.strokes = [paint];
        node.strokeWeight = 1;
      }
      console.log(`✓ Applied fallback color ${color} to ${property} (variable "${figmaVariableName}" not found)`);
    }
  } else if (color === 'transparent') {
    // Handle transparent
    if (property === 'fill') {
      node.fills = [];
    } else {
      node.strokes = [];
    }
    console.log(`✓ Applied transparent to ${property}`);
  }
  
  // Store token info even if variable not found (for debugging)
  node.setPluginData(`token:${property}`, anovaTokenPath);
  node.setPluginData(`variable:${property}`, figmaVariableName);
  
  return false;
}

/**
 * Enhanced token mapper that checks overrides first
 * (Currently just passes through - can be extended for custom mappings)
 */
export function mapTokenWithOverrides(anovaPath: string): string {
  // For now, just use the standard mapping
  // Can add override logic here if needed
  return mapAnovaTokenToFigmaVariable(anovaPath);
}

/**
 * Converts hex color string to Figma Paint
 */
function hexToPaint(value: string): Paint | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  // Remove # if present
  const hex = value.replace(/^#/, '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16) / 255;
    const g = parseInt(hex[1] + hex[1], 16) / 255;
    const b = parseInt(hex[2] + hex[2], 16) / 255;
    return { type: 'SOLID', color: { r, g, b } };
  }
  
  // Handle 6-digit hex
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return { type: 'SOLID', color: { r, g, b } };
  }
  
  return null;
}
