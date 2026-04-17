export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const val = Math.round(n * 255);
    return val.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function figmaColorToHex(color: RGB): string {
  return rgbToHex(color.r, color.g, color.b);
}

export function getBoundingBox(node: SceneNode): { x: number; y: number; width: number; height: number } {
  return {
    x: node.absoluteTransform[0][2],
    y: node.absoluteTransform[1][2],
    width: node.width,
    height: node.height,
  };
}

export function getSpacingBetween(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): { horizontal: number; vertical: number } {
  const horizontal = b.x >= a.x + a.width
    ? b.x - (a.x + a.width)
    : a.x >= b.x + b.width
    ? a.x - (b.x + b.width)
    : 0;

  const vertical = b.y >= a.y + a.height
    ? b.y - (a.y + a.height)
    : a.y >= b.y + b.height
    ? a.y - (b.y + b.height)
    : 0;

  return { horizontal, vertical };
}

export function getAutoLayoutProps(node: SceneNode): {
  direction: string;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  gap: number;
} | null {
  if (!('layoutMode' in node) || node.layoutMode === 'NONE') return null;
  return {
    direction: node.layoutMode,
    paddingTop: node.paddingTop,
    paddingRight: node.paddingRight,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
    gap: (node.itemSpacing as any) === figma.mixed ? 0 : node.itemSpacing as number,
  };
}

export function getNodeFills(node: SceneNode): Array<{ hex: string; opacity: number }> {
  if (!('fills' in node) || !Array.isArray(node.fills)) return [];
  return (node.fills as ReadonlyArray<Paint>)
    .filter((f): f is SolidPaint => f.type === 'SOLID' && f.visible !== false)
    .map((f) => ({
      hex: figmaColorToHex(f.color),
      opacity: f.opacity ?? 1,
    }));
}

export function getNodeStrokes(node: SceneNode): Array<{ hex: string; weight: number }> {
  if (!('strokes' in node) || !Array.isArray(node.strokes)) return [];
  const rawWeight = 'strokeWeight' in node ? node.strokeWeight : 0;
  const weight = typeof rawWeight === 'number' ? rawWeight : 0;
  return (node.strokes as ReadonlyArray<Paint>)
    .filter((s): s is SolidPaint => s.type === 'SOLID' && s.visible !== false)
    .map((s) => ({
      hex: figmaColorToHex(s.color),
      weight,
    }));
}

export function getTextProps(node: SceneNode): {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: string;
  lineHeight: string;
  letterSpacing: string;
} | null {
  if (node.type !== 'TEXT') return null;
  if (node.fontName === figma.mixed || node.fontSize === figma.mixed ||
      node.lineHeight === figma.mixed || node.letterSpacing === figma.mixed) {
    return null;
  }
  const font = node.fontName as FontName;
  const size = node.fontSize as number;
  const lh = node.lineHeight as LineHeight;
  const ls = node.letterSpacing as LetterSpacing;
  return {
    fontFamily: font.family,
    fontSize: size,
    fontWeight: getFontWeight(font.style),
    fontStyle: font.style,
    lineHeight: lh.unit === 'AUTO' ? 'auto' : lh.unit === 'PIXELS' ? `${lh.value}px` : `${lh.value}%`,
    letterSpacing: ls.unit === 'PIXELS' ? `${ls.value}px` : `${ls.value}%`,
  };
}

function getFontWeight(style: string): number {
  const map: Record<string, number> = {
    Thin: 100, ExtraLight: 200, Light: 300, Regular: 400,
    Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800, Black: 900,
  };
  for (const [name, weight] of Object.entries(map)) {
    if (style.includes(name)) return weight;
  }
  return 400;
}

export function getCornerRadius(node: SceneNode): string {
  if (!('cornerRadius' in node)) return '0';
  if (typeof node.cornerRadius === 'number') return `${node.cornerRadius}px`;
  if ('topLeftRadius' in node) {
    const tl = node.topLeftRadius;
    const tr = node.topRightRadius;
    const br = node.bottomRightRadius;
    const bl = node.bottomLeftRadius;
    if (tl === tr && tr === br && br === bl) return `${tl}px`;
    return `${tl}px ${tr}px ${br}px ${bl}px`;
  }
  return '0';
}

export function getEffects(node: SceneNode): Array<{ type: string; description: string }> {
  if (!('effects' in node) || !Array.isArray(node.effects)) return [];
  return (node.effects as ReadonlyArray<Effect>)
    .filter((e) => e.visible !== false)
    .map((e) => {
      if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
        const color = figmaColorToHex(e.color);
        return {
          type: e.type === 'DROP_SHADOW' ? 'Shadow' : 'Inner Shadow',
          description: `${e.offset.x}px ${e.offset.y}px ${e.radius}px ${color}`,
        };
      }
      if (e.type === 'LAYER_BLUR' || e.type === 'BACKGROUND_BLUR') {
        return {
          type: e.type === 'LAYER_BLUR' ? 'Blur' : 'Background Blur',
          description: `${e.radius}px`,
        };
      }
      return { type: e.type, description: '' };
    });
}
