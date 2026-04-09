// src/types.ts — Shared interfaces for S2A DS MCP

/** One leaf token from a DTCG JSON file, fully flattened */
export interface TokenEntry {
  /** Slash-path for user-facing display, e.g. "s2a/color/background/default" */
  displayPath: string;
  /** CSS variable string, e.g. "var(--s2a-color-background-default)" */
  cssVar: string;
  /** Raw CSS custom property name, e.g. "--s2a-color-background-default" */
  cssProp: string;
  /** DTCG $type: "color" | "number" | "string" | "dimension" etc. */
  type: string;
  /** Raw $value — may be an alias like "{color.gray.25}" or a literal */
  rawValue: string | number;
  description: string;
  /** True when hiddenFromPublishing — design-only, not shipped in CSS */
  designOnly: boolean;
  /** Collection slug from metadata.json, e.g. "s2a-semantic-color-theme" */
  collection: string;
  /** Human-readable collection name */
  collectionName: string;
  /** Mode slug, e.g. "light" | "dark" | "desktop" | "mobile" */
  mode: string;
  /** Source filename */
  sourceFile: string;
}

/** All tokens indexed for fast lookup */
export interface TokenIndex {
  /** CSS prop → entries (one per mode) */
  byProp: Map<string, TokenEntry[]>;
  /** Display path → entries (one per mode) */
  byPath: Map<string, TokenEntry[]>;
  /** All unique collection slugs */
  collections: string[];
  /** Collection slug → human name */
  collectionNames: Map<string, string>;
  /** Flat array of all entries */
  all: TokenEntry[];
}

/** Resolved token result — what tools return to callers */
export interface ResolvedToken {
  name: string;
  cssVar: string;
  cssProp: string;
  type: string;
  description: string;
  designOnly: boolean;
  collection: string;
  collectionName: string;
  /** Values keyed by mode slug */
  values: Record<string, string | number>;
}

/** Component metadata */
export interface ComponentEntry {
  name: string;       // "Button"
  slug: string;       // "button"
  cssClass: string;   // "c-button" — derived from CSS source
  jsPath: string;     // relative from DS_ROOT
  cssPath: string;
  jsSource: string;
  cssSource: string;
  /** --s2a-* custom properties referenced in cssSource */
  tokensUsed: string[];
  /** Figma node ID from first comment in .js if present */
  figmaNodeId?: string;
  /** Prop names parsed from JS function signature */
  props: PropDef[];
  /** Structured spec from {slug}.spec.json if present */
  spec?: ComponentSpec;
}

export interface PropDef {
  name: string;
  defaultValue?: string;
  type?: string;
  description?: string;
  required?: boolean;
}

/** Canonical machine-readable spec — lives in {slug}.spec.json */
export interface ComponentSpec {
  /** Display name, e.g. "Button" */
  name: string;
  /** npm-style slug, e.g. "button" */
  slug: string;
  /** Figma component set node ID, e.g. "141-53460" */
  figmaNodeId?: string;
  /** Primary CSS class, e.g. "c-button" */
  cssClass: string;
  /** Storybook story ID if one exists */
  storybookId?: string;
  /** Variant axes and their allowed values */
  variants: Record<string, string[]>;
  /** Forbidden variant combinations — array of {prop: value} objects */
  forbiddenCombinations?: Array<Record<string, string>>;
  /** Full prop definitions */
  props: SpecPropDef[];
  /** Token bindings: variant key → CSS custom property */
  tokenBindings: Record<string, string>;
  /** Accessibility requirements */
  a11y: ComponentA11y;
  /** Short description for LLM context */
  description?: string;
  /** Components this one composes internally */
  composedOf?: string[];
}

export interface SpecPropDef {
  name: string;
  type: string;
  defaultValue?: string;
  description?: string;
  required?: boolean;
  /** Allowed string values if the prop is an enum */
  enum?: string[];
  deprecated?: boolean;
  deprecatedReason?: string;
}

export interface ComponentA11y {
  /** ARIA role on the root element */
  role?: string;
  /** Required ARIA attributes */
  requiredAriaAttrs?: string[];
  /** WCAG 2.2 AA success criteria codes, e.g. ["1.4.3", "2.1.1"] */
  wcag: string[];
  /** Keyboard interactions */
  keyboard?: Array<{ key: string; action: string }>;
  /** Plain-language implementation notes */
  notes?: string[];
}

/** Standard error shape — tools never throw, always return this on failure */
export interface ToolError {
  success: false;
  error:
    | "token_not_found"
    | "component_not_found"
    | "parse_error"
    | "file_not_found"
    | "invalid_input"
    | "internal_error";
  message: string;
  suggestion?: string;
}
