import { lookupTextStyleById } from './tokens';

/**
 * Clone the node, place it to the right, and add text property annotations.
 * If a text node has an S2A text style bound, show the S2A token name and pin textStyleId.
 * If non-S2A style or no style, show individual font properties.
 * Deduplicates by node name — each unique text role annotated once.
 */
export async function generateTextPropertyAnnotations(node: SceneNode, yOffset = 0): Promise<number> {
  const clone = node.clone();

  const sourceX = node.absoluteTransform[0][2];
  const sourceY = node.absoluteTransform[1][2];
  figma.currentPage.appendChild(clone);
  clone.x = sourceX;
  clone.y = sourceY + node.height + 40 + yOffset;

  let count = 0;
  const seen = new Set<string>();

  async function walk(n: SceneNode): Promise<void> {
    if ('visible' in n && !n.visible) return;

    if (n.type === 'TEXT') {
      const textNode = n as TextNode;
      const label = n.name;
      const fontSize = textNode.fontSize !== figma.mixed ? textNode.fontSize : 0;
      const key = `${label}:${fontSize}`;
      if (!seen.has(key)) {
        seen.add(key);
        try {
          const styleId = textNode.textStyleId;
          const hasStyle = !!styleId && styleId !== '' && styleId !== figma.mixed;
          const s2aStyle = hasStyle ? lookupTextStyleById(styleId as string) : null;

          if (s2aStyle) {
            const tokenName = s2aStyle.name.replace('s2a/typography/', '');
            const size = textNode.fontSize !== figma.mixed ? textNode.fontSize : '?';
            const lh = textNode.lineHeight !== figma.mixed && typeof textNode.lineHeight === 'object'
              ? (textNode.lineHeight as any).unit === 'PIXELS' ? `${(textNode.lineHeight as any).value}` : `${(textNode.lineHeight as any).value}%`
              : 'auto';
            (n as any).annotations = [{
              labelMarkdown: `**${label}**\n${tokenName} ${size}/${lh}`,
              properties: [{ type: 'textStyleId' }],
            }];
          } else {
            (n as any).annotations = [{
              labelMarkdown: `**${label}**`,
              properties: [
                { type: 'fontFamily' },
                { type: 'fontSize' },
                { type: 'fontWeight' },
                { type: 'fontStyle' },
                { type: 'lineHeight' },
                { type: 'letterSpacing' },
              ],
            }];
          }
          count++;
        } catch (e) {
          console.warn(`Text annotation failed on "${label}":`, e);
        }
      }
    }

    if ('children' in n) {
      for (const child of (n as any).children) {
        await walk(child);
      }
    }
  }

  await walk(clone);
  figma.ui.postMessage({ type: 'spec-it-status', message: `Added ${count} text property annotations` });
  return clone.height + 40;
}
