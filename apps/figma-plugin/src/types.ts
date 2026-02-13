export interface SpecMeta {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
}

export interface FrameSpec {
  width: number;
  height: number;
  padding?: {
    horizontal?: number;
    vertical?: number;
  };
}

export interface LayerTokenSpec {
  fill?: string;
  stroke?: string;
  typography?: string;
}

export interface RectangleLayerFallback {
  fill?: string;
  stroke?: string;
}

export interface BaseLayerSpec {
  name: string;
  tokens?: LayerTokenSpec;
}

export interface RectangleLayerSpec extends BaseLayerSpec {
  kind: 'rectangle';
  cornerRadius?: number;
  fallback?: RectangleLayerFallback;
}

export interface TextLayerSpec extends BaseLayerSpec {
  kind: 'text';
  characters: string;
  fallback?: TextFallbackSpec;
}

export interface TextFallbackSpec {
  fill?: string;
  fontFamily: string;
  fontStyle: string;
  fontSize: number;
  letterSpacing?: number;
}

export type LayerSpec = RectangleLayerSpec | TextLayerSpec;

export interface ComponentSpec {
  meta: SpecMeta;
  component: {
    name: string;
    frame: FrameSpec;
    layers: LayerSpec[];
    variants?: VariantConfiguration;
  };
}

export interface SpecSummary {
  id: string;
  title: string;
  description?: string;
  tokens: string[];
  source: string;
  errors: string[];
}

export interface VariantConfiguration {
  name?: string;
  properties: VariantPropertySpec[];
  nodes: VariantNodeSpec[];
}

export interface VariantPropertySpec {
  name: string;
  values: string[];
}

export interface VariantNodeSpec {
  id: string;
  name?: string;
  description?: string;
  properties: Record<string, string>;
  overrides?: VariantOverrideSpec;
}

export interface VariantOverrideSpec {
  layers?: Record<string, VariantLayerOverride>;
}

export interface VariantLayerOverride {
  tokens?: LayerTokenSpec;
  fallback?: RectangleLayerFallback | TextFallbackSpec;
  characters?: string;
  cornerRadius?: number;
}
