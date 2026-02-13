import { parse } from 'yaml';
import type {
  ComponentSpec,
  SpecSummary,
  LayerSpec,
  SpecMeta,
  LayerTokenSpec,
  VariantLayerOverride,
  VariantConfiguration,
  VariantNodeSpec,
  RectangleLayerSpec,
  TextLayerSpec,
  TextFallbackSpec,
  VariantPropertySpec,
  VariantOverrideSpec
} from './types.js';
import buttonSource from './specs/button.yaml?raw';
import buttonSetSource from './specs/button-component-set.yaml?raw';
import { validateSpec } from './spec-validation.js';

interface RegisteredSpec {
  id: string;
  title: string;
  description?: string;
  source: string;
  tokens: string[];
  data: ComponentSpec;
  errors: string[];
}

export interface SpecAnalysis {
  summary: SpecSummary;
  spec: ComponentSpec;
}

interface RawEntry {
  id: string;
  source: string;
}

const rawEntries: RawEntry[] = [
  {
    id: 'button-accent-solid-default',
    source: buttonSource
  },
  {
    id: 'button-accent-solid-set',
    source: buttonSetSource
  }
];

const registry: RegisteredSpec[] = rawEntries.map(entry => {
  const analysis = analyzeSource(entry.source, entry.id);
  return {
    id: analysis.spec.meta.id,
    title: analysis.spec.meta.title,
    description: analysis.spec.meta.description,
    source: entry.source,
    tokens: analysis.summary.tokens,
    data: analysis.spec,
    errors: analysis.summary.errors
  };
});

export function listSpecSummaries(): SpecSummary[] {
  return registry.map(toSummary);
}

export function getSpecById(id: string): RegisteredSpec | undefined {
  return registry.find(spec => spec.id === id);
}

export function analyzeSource(source: string, fallbackId = 'custom-spec'): SpecAnalysis {
  const spec = parseSpec(source, fallbackId);
  const tokens = collectTokens(spec);
  const errors = validateSpec(spec);
  const summary: SpecSummary = {
    id: spec.meta.id,
    title: spec.meta.title,
    description: spec.meta.description,
    tokens,
    source,
    errors
  };
  return { summary, spec };
}

export function parseSpec(source: string, fallbackId: string): ComponentSpec {
  const parsed = parse(source) as Partial<ComponentSpec> & Record<string, unknown>;
  if (!parsed) {
    throw new Error('Unable to parse spec.');
  }

  if (isAnovaExport(parsed)) {
    return convertAnovaSpec(parsed, fallbackId);
  }

  const component = coerceComponent(parsed, fallbackId);

  const meta: SpecMeta = {
    id: parsed.meta?.id ?? (parsed as any).id ?? fallbackId,
    title: parsed.meta?.title ?? component.name ?? fallbackId,
    description: parsed.meta?.description ?? (parsed as any).description,
    tags: parsed.meta?.tags ?? ((parsed as any).tags as string[] | undefined)
  };

  return {
    meta,
    component
  } as ComponentSpec;
}

function coerceComponent(
  parsed: Partial<ComponentSpec> & Record<string, unknown>,
  fallbackId: string
): ComponentSpec['component'] {
  if (parsed.component) {
    return parsed.component;
  }

  const frame = (parsed as any).frame;
  const layers = (parsed as any).layers;
  const variants = (parsed as any).variants;
  const name = (parsed as any).name ?? fallbackId;

  if (frame && Array.isArray(layers)) {
    return {
      name,
      frame,
      layers,
      variants
    } as ComponentSpec['component'];
  }

  throw new Error('Spec is missing `component` definition.');
}

function isAnovaExport(value: Record<string, unknown>): boolean {
  return Boolean(value && value.anatomy && value.default && (value as any).default?.elements);
}

function convertAnovaSpec(raw: Record<string, any>, fallbackId: string): ComponentSpec {
  const name = typeof raw.title === 'string' ? raw.title : fallbackId;
  const defaultElements = raw.default?.elements ?? {};
  const rootStyles = defaultElements.root?.styles ?? {};
  const labelStyles = defaultElements.Label?.styles ?? {};
  const labelText = defaultElements.Label?.text ?? 'Label';

  const frame = buildFrameFromAnova(rootStyles);
  const layers: LayerSpec[] = [
    buildSurfaceLayer(rootStyles),
    buildLabelLayer(labelStyles, labelText)
  ];

  const baseProperties = buildBaseVariantProperties(raw);
  const variantConfig = buildVariantConfiguration(raw, baseProperties);

  const meta: SpecMeta = {
    id: (raw.metadata?.source?.nodeId as string) ?? fallbackId,
    title: name,
    description: raw.metadata?.description ?? undefined,
    tags: raw.metadata?.tags ?? []
  };

  return {
    meta,
    component: {
      name,
      frame,
      layers,
      variants: variantConfig
    }
  };
}

function buildFrameFromAnova(rootStyles: Record<string, unknown>) {
  const width = pickNumber(rootStyles.width) ?? 320;
  const height = pickNumber(rootStyles.minHeight ?? rootStyles.height) ?? 64;
  const paddingHorizontal = averageNumbers([
    pickNumber(rootStyles.paddingLeft),
    pickNumber(rootStyles.paddingRight)
  ]) ?? 28;
  const paddingVertical = averageNumbers([
    pickNumber(rootStyles.paddingTop),
    pickNumber(rootStyles.paddingBottom)
  ]) ?? 20;

  return {
    width,
    height,
    padding: {
      horizontal: paddingHorizontal,
      vertical: paddingVertical
    }
  };
}

function buildSurfaceLayer(rootStyles: Record<string, unknown>): RectangleLayerSpec {
  const fillToken = toToken(rootStyles.fills);
  const strokeToken = toToken(rootStyles.strokes);
  const cornerRadius = pickNumber(rootStyles.cornerRadius) ?? 12;

  const tokens: LayerTokenSpec = {};
  if (fillToken) {
    tokens.fill = fillToken;
  }
  if (strokeToken) {
    tokens.stroke = strokeToken;
  }

  return {
    kind: 'rectangle',
    name: 'Surface',
    tokens,
    fallback: {
      fill: fallbackColor(rootStyles.fills) ?? '#1473E6',
      stroke: fallbackColor(rootStyles.strokes) ?? undefined
    },
    cornerRadius
  } as RectangleLayerSpec;
}

function buildLabelLayer(styles: Record<string, unknown>, text: string): TextLayerSpec {
  const fillToken = toToken(styles.fills);
  const typographyToken = toToken(styles.textStyleId);
  const fallback: TextFallbackSpec = {
    fill: fallbackColor(styles.fills) ?? '#FFFFFF',
    fontFamily: resolveFontFamily(styles.fontFamily),
    fontStyle: resolveFontStyle(styles.fontWeight),
    fontSize: pickNumber(styles.fontSize) ?? 20,
    letterSpacing: pickNumber(styles.letterSpacing)
  };

  return {
    kind: 'text',
    name: 'Label',
    characters: typeof text === 'string' ? text : 'Label',
    tokens: {
      fill: fillToken,
      typography: typographyToken
    },
    fallback
  } as TextLayerSpec;
}

function buildBaseVariantProperties(raw: Record<string, any>) {
  const defaults: Record<string, string> = {};
  const props = raw.props ?? {};
  for (const [name, config] of Object.entries(props)) {
    if (config && config.default !== undefined) {
      defaults[name] = String(config.default);
    }
  }
  const parsed = parseVariantName(raw.default?.name);
  return { ...defaults, ...parsed };
}

function buildVariantConfiguration(raw: Record<string, any>, baseProps: Record<string, string>) {
  const variants = Array.isArray(raw.variants) ? raw.variants.filter(v => !v.invalid) : [];
  if (!variants.length) {
    return undefined;
  }

  const canonicalMap = buildCanonicalPropMap(raw.props ?? {});
  const propertyMap = collectVariantProperties(raw.props ?? {}, variants, baseProps, canonicalMap);
  const propertyList: VariantPropertySpec[] = Array.from(propertyMap.entries()).map(([name, values]) => ({
    name,
    values: Array.from(values)
  }));

  const nodes: VariantNodeSpec[] = variants.map(variant => {
    const merged = { ...baseProps };
    Object.entries(variant.configuration ?? {}).forEach(([rawName, rawValue]) => {
      const canonical = canonicalMap.get(normalizePropertyName(rawName));
      if (canonical) {
        merged[canonical] = String(rawValue);
      }
    });
    Object.keys(merged).forEach(key => {
      merged[key] = String(merged[key]);
    });
    const overrides = buildVariantOverrides(variant.elements);
    const id = sanitizeId(variant.name || JSON.stringify(merged));
    return {
      id,
      name: variant.name,
      properties: merged,
      overrides
    };
  });

  return {
    name: raw.title ?? 'Component set',
    properties: propertyList,
    nodes
  } as VariantConfiguration;
}

function collectVariantProperties(
  propDefs: Record<string, any>,
  variants: Array<Record<string, any>>,
  baseProps: Record<string, string>,
  canonicalMap: Map<string, string>
) {
  const propertyMap = new Map<string, Set<string>>();
  for (const [name, def] of Object.entries(propDefs)) {
    const values = new Set<string>();
    if (Array.isArray(def?.enum)) {
      def.enum.forEach((value: unknown) => values.add(String(value)));
    }
    if (def?.default !== undefined) {
      values.add(String(def.default));
    }
    if (values.size) {
      propertyMap.set(name, values);
    }
  }

  Object.entries(baseProps).forEach(([name, value]) => {
    if (!propertyMap.has(name)) {
      propertyMap.set(name, new Set<string>());
    }
    propertyMap.get(name)!.add(String(value));
  });

  variants.forEach(variant => {
    Object.entries(variant.configuration ?? {}).forEach(([rawName, value]) => {
      const canonical = canonicalMap.get(normalizePropertyName(rawName));
      if (!canonical) {
        return;
      }
      if (!propertyMap.has(canonical)) {
        propertyMap.set(canonical, new Set<string>());
      }
      propertyMap.get(canonical)!.add(String(value));
    });
  });

  return propertyMap;
}

function buildCanonicalPropMap(propDefs: Record<string, any>) {
  const map = new Map<string, string>();
  Object.keys(propDefs).forEach(name => {
    map.set(normalizePropertyName(name), name);
  });
  return map;
}

function normalizePropertyName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function buildVariantOverrides(elements: Record<string, any> | undefined) {
  if (!elements) {
    return undefined;
  }
  const overrides: VariantOverrideSpec = { layers: {} };

  // Handle "root" element (maps to the component itself or a "Surface" layer)
  if (elements.root?.styles) {
    const surface = buildSurfaceOverride(elements.root.styles);
    if (surface) {
      // Try both "Surface" and "root" as layer names
      overrides.layers!.Surface = surface;
      overrides.layers!.root = surface;
    }
  }
  
  // Handle "Label" element
  if (elements.Label && (elements.Label.styles || typeof elements.Label.text === 'string')) {
    const label = buildLabelOverride(elements.Label);
    if (label) {
      overrides.layers!.Label = label;
    }
  }
  
  // Also check for any other element names that might exist
  Object.keys(elements).forEach(key => {
    if (key !== 'root' && key !== 'Label' && elements[key]) {
      const element = elements[key];
      if (element.styles) {
        if (element.type === 'text' || typeof element.text === 'string') {
          const textOverride = buildLabelOverride(element);
          if (textOverride) {
            overrides.layers![key] = textOverride;
          }
        } else {
          const surfaceOverride = buildSurfaceOverride(element.styles);
          if (surfaceOverride) {
            overrides.layers![key] = surfaceOverride;
          }
        }
      }
    }
  });

  if (!Object.keys(overrides.layers!).length) {
    return undefined;
  }
  return overrides;
}

function buildSurfaceOverride(styles: Record<string, any>) {
  const tokens: LayerTokenSpec = {};
  const fallback: Record<string, string | undefined> = {};
  if (styles.fills) {
    tokens.fill = toToken(styles.fills);
    fallback.fill = fallbackColor(styles.fills) ?? undefined;
  }
  if (styles.strokes) {
    tokens.stroke = toToken(styles.strokes);
    fallback.stroke = fallbackColor(styles.strokes) ?? undefined;
  }
  if (!Object.keys(tokens).length) {
    return undefined;
  }
  return {
    tokens,
    fallback
  };
}

function buildLabelOverride(node: Record<string, any>) {
  const styles = node.styles ?? {};
  const tokens: LayerTokenSpec = {};
  const fallback: TextFallbackSpec = {
    fill: fallbackColor(styles.fills) ?? '#FFFFFF',
    fontFamily: resolveFontFamily(styles.fontFamily),
    fontStyle: resolveFontStyle(styles.fontWeight),
    fontSize: pickNumber(styles.fontSize) ?? 20,
    letterSpacing: pickNumber(styles.letterSpacing)
  };

  if (styles.fills) {
    tokens.fill = toToken(styles.fills);
  }
  if (styles.textStyleId) {
    tokens.typography = toToken(styles.textStyleId);
  }

  if (!Object.keys(tokens).length && typeof node.text !== 'string') {
    return undefined;
  }

  return {
    tokens,
    fallback,
    characters: typeof node.text === 'string' ? node.text : undefined
  };
}

function parseVariantName(name: string | undefined) {
  if (!name) {
    return {};
  }
  const entries = name.split(',').map(entry => entry.trim());
  const result: Record<string, string> = {};
  entries.forEach(entry => {
    const [key, value] = entry.split('=').map(part => part.trim());
    if (key && value) {
      result[key] = value;
    }
  });
  return result;
}

function pickNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^-?\d+(\.\d+)?(px)?$/.test(trimmed)) {
      const parsed = parseFloat(trimmed.replace(/px$/, ''));
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function averageNumbers(values: Array<number | undefined>): number | undefined {
  const present = values.filter((value): value is number => typeof value === 'number');
  if (!present.length) {
    return undefined;
  }
  return present.reduce((sum, value) => sum + value, 0) / present.length;
}

const TOKEN_PREFIXES = new Set([
  'component',
  'components',
  'semantic',
  'semantic-color',
  'semantic-color-color',
  'primitives',
  'primitives-core',
  'primitives-color',
  's2a',
  'spectrum',
  'spectrum-2'
]);

function toToken(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  // If it's already a CSS custom property, return as-is
  if (value.startsWith('--')) {
    return value;
  }
  // For Figma plugin, we want to keep the original Anova path format
  // (e.g., "Component/button/color/background/accent/solid-default")
  // This will be mapped to Figma variables in token-mapper.ts
  // Don't convert to CSS format here - that happens in code generation
  return value;
}

function cleanSegment(segment: string) {
  return segment
    .replace(/&/g, 'and')
    .replace(/\([^)]*\)/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fallbackColor(value: unknown): string | undefined {
  if (typeof value === 'string' && value.startsWith('#') && (value.length === 7 || value.length === 4)) {
    return value;
  }
  return undefined;
}

function resolveFontFamily(value: unknown) {
  if (typeof value === 'string' && !value.includes('/')) {
    return value;
  }
  return 'Adobe Clean';
}

function resolveFontStyle(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return 'Regular';
}

function sanitizeId(value: string) {
  return value.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'variant';
}

function toSummary(spec: RegisteredSpec): SpecSummary {
  return {
    id: spec.id,
    title: spec.title,
    description: spec.description,
    tokens: spec.tokens,
    source: spec.source,
    errors: spec.errors
  };
}

function collectTokens(spec: ComponentSpec): string[] {
  const tokens = new Set<string>();
  collectLayerTokens(spec.component.layers, tokens);
  if (spec.component.variants) {
    collectVariantTokens(spec.component.variants, tokens);
  }
  return Array.from(tokens);
}

function collectLayerTokens(layers: LayerSpec[] = [], bucket: Set<string>) {
  layers.forEach(layer => {
    if (!layer.tokens) {
      return;
    }
    addTokens(layer.tokens, bucket);
  });
}

function collectVariantTokens(variants: VariantConfiguration, bucket: Set<string>) {
  variants.nodes?.forEach((variant: VariantNodeSpec) => {
    const overrides = variant.overrides?.layers ?? {};
    Object.values(overrides).forEach((override: VariantLayerOverride) => {
      if (override.tokens) {
        addTokens(override.tokens, bucket);
      }
    });
  });
}

function addTokens(tokens: LayerTokenSpec, bucket: Set<string>) {
  Object.values(tokens)
    .filter((value): value is string => Boolean(value))
    .forEach(token => bucket.add(token));
}
