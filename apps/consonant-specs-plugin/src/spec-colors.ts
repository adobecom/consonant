
/**
 * Clone the node, place it to the right, and add color annotations.
 * Uses the node name as the annotation title (bold), and links to fills/strokes
 * properties so Figma's UI shows the bound token or color value.
 * Text nodes also get textStyleId property for the text badge.
 * Deduplicates by visual identity (fill color, font, size, radius) — not layer name.
 * Skips vectors and icon-like elements. Image fills skip annotation but still walk children.
 */
export async function generateColorAnnotations(node: SceneNode, yOffset = 0): Promise<number> {
  const clone = node.clone();

  const sourceX = node.absoluteTransform[0][2];
  const sourceY = node.absoluteTransform[1][2];
  figma.currentPage.appendChild(clone);
  clone.x = sourceX;
  clone.y = sourceY + node.height + 40 + yOffset;

  let count = 0;
  const seen = new Set<string>();

  /** Nodes that should be skipped entirely (no annotation, no child walk) */
  function shouldSkipEntirely(n: SceneNode): boolean {
    const skipTypes = new Set(['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'LINE', 'POLYGON', 'ELLIPSE']);
    if (skipTypes.has(n.type)) return true;

    // Skip small non-text leaf elements (likely icons), but never skip text or containers
    const hasChildren = 'children' in n && (n as any).children.length > 0;
    if (n.type !== 'TEXT' && !hasChildren && (n.width < 24 || n.height < 24)) return true;

    return false;
  }

  /** Nodes with image fills: skip annotation but still walk children */
  function hasImageFill(n: SceneNode): boolean {
    if ('fills' in n) {
      const fills = (n as any).fills;
      if (Array.isArray(fills) && fills.some((f: any) => f.type === 'IMAGE')) return true;
    }
    return false;
  }

  /** Build a dedup key from visual properties instead of layer name */
  function visualKey(n: SceneNode, properties: Array<{ type: string }>): string {
    const parts: string[] = [n.type, properties.map(p => p.type).join(',')];

    // Fill color
    if ('fills' in n) {
      const fills = (n as any).fills;
      if (Array.isArray(fills)) {
        const solid = fills.find((f: any) => f.type === 'SOLID' && f.visible !== false);
        if (solid) {
          const c = solid.color;
          parts.push(`f:${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${(solid.opacity ?? 1).toFixed(2)}`);
        }
      }
    }

    // Stroke color
    if ('strokes' in n) {
      const strokes = (n as any).strokes;
      if (Array.isArray(strokes)) {
        const solid = strokes.find((f: any) => f.type === 'SOLID' && f.visible !== false);
        if (solid) {
          const c = solid.color;
          parts.push(`s:${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)}`);
        }
      }
    }

    // Text identity: font family + style + size
    if (n.type === 'TEXT') {
      const tn = n as TextNode;
      const fn = tn.fontName;
      if (fn !== figma.mixed) {
        parts.push(`t:${fn.family}/${fn.style}`);
      }
      const fs = tn.fontSize;
      parts.push(`fs:${fs !== figma.mixed ? fs : 0}`);
    }

    // Size category (small/medium/large) to distinguish differently-sized elements
    const area = n.width * n.height;
    const sizeCat = area < 2000 ? 'S' : area < 20000 ? 'M' : 'L';
    parts.push(`sz:${sizeCat}`);

    // Corner radius
    if ('cornerRadius' in n) {
      const cr = (n as any).cornerRadius;
      if (cr !== figma.mixed && cr > 0) parts.push(`r:${cr}`);
    }

    return parts.join('|');
  }

  async function walk(n: SceneNode, isRoot = false): Promise<void> {
    if ('visible' in n && !n.visible) return;
    if (shouldSkipEntirely(n)) return;

    // Image fills: skip annotation but still walk children
    const skipAnnotation = hasImageFill(n);

    if (!skipAnnotation) {
      const properties: Array<{ type: string }> = [];
      const label = isRoot ? 'Background' : n.name;

      // Check fills
      if ('fills' in n) {
        const fills = (n as any).fills;
        if (Array.isArray(fills) && fills.some((f: any) => f.type === 'SOLID' && f.visible !== false)) {
          properties.push({ type: 'fills' });
        }
      }

      // Check strokes
      if ('strokes' in n) {
        const strokes = (n as any).strokes;
        if (Array.isArray(strokes) && strokes.some((f: any) => f.type === 'SOLID' && f.visible !== false)) {
          properties.push({ type: 'strokes' });
        }
      }

      // Text nodes: use textStyleId if a style is bound, otherwise use fontFamily
      if (n.type === 'TEXT') {
        const textNode = n as TextNode;
        const hasStyle = textNode.textStyleId && textNode.textStyleId !== '' && textNode.textStyleId !== figma.mixed;
        properties.push({ type: hasStyle ? 'textStyleId' : 'fontFamily' });
      }

      // Frames with effects get effects property
      if ('effects' in n) {
        const effects = (n as any).effects;
        if (Array.isArray(effects) && effects.length > 0 && effects.some((e: any) => e.visible !== false)) {
          properties.push({ type: 'effects' });
        }
      }

      if (properties.length > 0) {
        const key = visualKey(n, properties);
        if (!seen.has(key)) {
          seen.add(key);
          try {
            (n as any).annotations = [{
              labelMarkdown: `**${label}**`,
              properties,
            }];
            count++;
          } catch (e) {
            console.warn(`Annotation failed on "${label}":`, e);
          }
        }
      }
    }

    // Always walk children (even for image fill nodes)
    if ('children' in n) {
      for (const child of (n as any).children) {
        await walk(child);
      }
    }
  }

  await walk(clone, true);
  figma.ui.postMessage({ type: 'spec-it-status', message: `Added ${count} color annotations` });
  return clone.height + 40;
}
