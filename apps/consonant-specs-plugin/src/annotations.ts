import { getNodeFills, getNodeStrokes, getTextProps, getCornerRadius, getEffects } from './utils';
import { matchColor, matchRadius, matchTypography } from './tokens';

interface PropertyEntry {
  name: string;
  value: string;
  token: string | null;
  colorSwatch?: string;
}

function collectProperties(node: SceneNode): PropertyEntry[] {
  const props: PropertyEntry[] = [];

  props.push({
    name: 'Size',
    value: `${Math.round(node.width)} x ${Math.round(node.height)}`,
    token: null,
  });

  const fills = getNodeFills(node);
  for (const fill of fills) {
    props.push({
      name: 'Fill',
      value: fill.hex.toUpperCase(),
      token: matchColor(fill.hex),
      colorSwatch: fill.hex,
    });
  }

  const strokes = getNodeStrokes(node);
  for (const stroke of strokes) {
    props.push({
      name: 'Stroke',
      value: `${stroke.hex.toUpperCase()} / ${stroke.weight}px`,
      token: matchColor(stroke.hex),
      colorSwatch: stroke.hex,
    });
  }

  const radius = getCornerRadius(node);
  if (radius !== '0') {
    props.push({
      name: 'Radius',
      value: radius,
      token: matchRadius(radius.replace(/px/g, '')),
    });
  }

  if ('opacity' in node && typeof node.opacity === 'number' && node.opacity < 1) {
    props.push({
      name: 'Opacity',
      value: `${Math.round(node.opacity * 100)}%`,
      token: null,
    });
  }

  const text = getTextProps(node);
  if (text) {
    props.push({ name: 'Font', value: text.fontFamily, token: matchTypography(text.fontFamily) });
    props.push({ name: 'Size', value: `${text.fontSize}px`, token: matchTypography(`${text.fontSize}`) });
    props.push({ name: 'Weight', value: `${text.fontWeight}`, token: matchTypography(`${text.fontWeight}`) });
    props.push({ name: 'Line Height', value: text.lineHeight, token: null });
    props.push({ name: 'Letter Spacing', value: text.letterSpacing, token: null });
  }

  const effects = getEffects(node);
  for (const effect of effects) {
    props.push({ name: effect.type, value: effect.description, token: null });
  }

  return props;
}

export function getNodeProperties(node: SceneNode): PropertyEntry[] {
  return collectProperties(node);
}
