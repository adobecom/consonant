
/**
 * Clone the node, place it to the right, and add color annotations.
 * Uses the node name as the annotation title (bold), and links to fills/strokes
 * properties so Figma's UI shows the bound token or color value.
 * Text nodes also get textStyleId property for the text badge.
 * Deduplicates by node name + property type — each unique role annotated once.
 * Skips images, vectors, and icon-like elements.
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

  function shouldSkip(n: SceneNode): boolean {
    const skipTypes = new Set(['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'LINE', 'POLYGON', 'ELLIPSE']);
    if (skipTypes.has(n.type)) return true;

    if ('fills' in n) {
      const fills = (n as any).fills;
      if (Array.isArray(fills) && fills.some((f: any) => f.type === 'IMAGE')) return true;
    }

    // Skip small non-text leaf elements (likely icons), but never skip text or containers
    const hasChildren = 'children' in n && (n as any).children.length > 0;
    if (n.type !== 'TEXT' && !hasChildren && (n.width < 24 || n.height < 24)) return true;

    return false;
  }

  async function walk(n: SceneNode, isRoot = false): Promise<void> {
    if ('visible' in n && !n.visible) return;
    if (shouldSkip(n)) return;

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
      // Include fontSize for text nodes so same-named nodes with different styles each get annotated
      let extra = '';
      if (n.type === 'TEXT') {
        const fontSize = (n as TextNode).fontSize;
        extra = `:${fontSize !== figma.mixed ? fontSize : 0}`;
      }
      const key = `${label}:${properties.map(p => p.type).join(',')}${extra}`;
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
