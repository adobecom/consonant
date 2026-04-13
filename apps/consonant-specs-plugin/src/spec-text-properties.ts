/**
 * Clone the node, place it to the right, and add text property annotations.
 * If a text node has an S2A text style bound, only show textStyleId (the token).
 * If no S2A token, show individual properties so the values are visible.
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

  function hasTextStyle(n: TextNode): boolean {
    const styleId = n.textStyleId;
    return !!styleId && styleId !== '' && styleId !== figma.mixed;
  }

  async function walk(n: SceneNode): Promise<void> {
    if ('visible' in n && !n.visible) return;

    if (n.type === 'TEXT') {
      const textNode = n as TextNode;
      const label = n.name;
      // Dedup by name + fontSize so same-named nodes with different styles each get annotated
      const fontSize = textNode.fontSize !== figma.mixed ? textNode.fontSize : 0;
      const key = `${label}:${fontSize}`;
      if (!seen.has(key)) {
        seen.add(key);
        const properties = hasTextStyle(textNode)
          ? [{ type: 'fontFamily' }]
          : [
              { type: 'fontFamily' },
              { type: 'fontSize' },
              { type: 'fontWeight' },
              { type: 'fontStyle' },
              { type: 'lineHeight' },
              { type: 'letterSpacing' },
            ];
        try {
          (n as any).annotations = [{
            labelMarkdown: `**${label}**`,
            properties,
          }];
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
