import type {
  ComponentSpec,
  LayerSpec,
  VariantConfiguration,
  VariantNodeSpec,
  VariantPropertySpec
} from './types.js';

export function validateSpec(spec: ComponentSpec): string[] {
  const errors: string[] = [];
  if (!spec.component) {
    return ['Missing `component` definition.'];
  }
  if (!spec.component.frame) {
    errors.push('Component.frame is required.');
  } else {
    if (!isPositive(spec.component.frame.width) || !isPositive(spec.component.frame.height)) {
      errors.push('Component.frame width/height must be positive numbers.');
    }
  }
  if (!Array.isArray(spec.component.layers) || spec.component.layers.length === 0) {
    errors.push('At least one layer must be defined.');
  } else {
    spec.component.layers.forEach((layer, index) => {
      validateLayer(layer, index, errors);
    });
  }

  if (spec.component.variants) {
    validateVariants(spec.component.variants, errors);
  }

  return errors;
}

function validateLayer(layer: LayerSpec, index: number, errors: string[]) {
  if (!layer.name) {
    errors.push(`Layer ${index + 1} is missing a name.`);
  }
  if (layer.kind !== 'rectangle' && layer.kind !== 'text') {
    errors.push(`Layer ${layer.name || index + 1} has unsupported kind: ${layer.kind}`);
  }
  if (layer.kind === 'text') {
    if (!('characters' in layer) || !layer.characters) {
      errors.push(`Text layer ${layer.name || index + 1} requires \\"characters\\" content.`);
    }
  }
}

function validateVariants(config: VariantConfiguration, errors: string[]) {
  if (!Array.isArray(config.properties) || config.properties.length === 0) {
    errors.push('Variants.properties must declare at least one property.');
  }
  const propertyNames = new Set<string>();
  config.properties.forEach((prop: VariantPropertySpec) => {
    if (!prop.name) {
      errors.push('Variant property missing a name.');
      return;
    }
    propertyNames.add(prop.name);
    if (!Array.isArray(prop.values) || prop.values.length === 0) {
      errors.push(`Variant property ${prop.name} requires one or more values.`);
    }
  });

  if (!Array.isArray(config.nodes) || config.nodes.length === 0) {
    errors.push('Variants.nodes must include at least one variant entry.');
    return;
  }

  config.nodes.forEach((node: VariantNodeSpec) => {
    if (!node.properties) {
      errors.push(`Variant ${node.name || node.id} is missing properties mapping.`);
      return;
    }
    propertyNames.forEach(propName => {
      if (!(propName in node.properties)) {
        errors.push(`Variant ${node.name || node.id} is missing value for property ${propName}.`);
      }
    });
  });
}

function isPositive(value: number | undefined): boolean {
  return typeof value === 'number' && value > 0;
}
