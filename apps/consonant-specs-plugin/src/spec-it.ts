import { generateAnatomySection } from './spec-anatomy';
import { generateLayoutSection, generateSpacingSection } from './spec-layout';
import { generateTypographySection } from './spec-typography';
import { generateComponentDetailsSection } from './spec-components';
import { generateColorAnnotations } from './spec-colors';
import { generateTextPropertyAnnotations } from './spec-text-properties';
import { generateSpacingGeneral } from './spec-spacing-general';
import { generateCardGaps } from './spec-card-gaps';

const SPEC_GAP = 40;
const SECTION_GAP = 64;

export async function specIt(node: SceneNode, sections: string[] = ['anatomy', 'layout', 'typography', 'components']): Promise<void> {
  const enabled = new Set(sections);
  let cloneYOffset = 0;

  // Colors: clone with annotations, no spec frame needed
  if (enabled.has('colors')) {
    figma.ui.postMessage({ type: 'spec-it-status', message: 'Adding color annotations...' });
    cloneYOffset += await generateColorAnnotations(node, cloneYOffset);
  }

  // Spacing In Between: overlay gap bands between card-like elements directly on node
  if (enabled.has('cardGaps')) {
    figma.ui.postMessage({ type: 'spec-it-status', message: 'Generating spacing in between...' });
    await generateCardGaps(node);
  }

  // Spacing General: clone with overlay bands
  if (enabled.has('spacingGeneral')) {
    figma.ui.postMessage({ type: 'spec-it-status', message: 'Generating spacing general...' });
    cloneYOffset += await generateSpacingGeneral(node, cloneYOffset);
  }

  // Text Properties: clone with text annotations, no spec frame needed
  if (enabled.has('textProperties')) {
    figma.ui.postMessage({ type: 'spec-it-status', message: 'Adding text property annotations...' });
    cloneYOffset += await generateTextPropertyAnnotations(node, cloneYOffset);
  }

  const sourceX = node.absoluteTransform[0][2];
  const sourceY = node.absoluteTransform[1][2];

  // Helper to place a section frame below the source
  function placeSection(frame: FrameNode) {
    figma.currentPage.appendChild(frame);
    frame.x = sourceX;
    frame.y = sourceY + node.height + 40 + cloneYOffset;
    cloneYOffset += frame.height + 40;
  }

  const needsFonts = enabled.has('anatomy') || enabled.has('spacing') || enabled.has('layout') || enabled.has('typography') || enabled.has('components');
  if (needsFonts) {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  }

  if (enabled.has('anatomy')) {
    figma.ui.postMessage({ type: 'spec-it-status', message: 'Generating anatomy...' });
    const anatomySection = await generateAnatomySection(node);
    placeSection(anatomySection);
  }

  // Spacing Detailed: overlay bands directly on node
  if (enabled.has('spacing')) {
    figma.ui.postMessage({ type: 'spec-it-status', message: 'Generating spacing detailed...' });
    await generateSpacingSection(node);
  }

  if (enabled.has('layout')) {
    figma.ui.postMessage({ type: 'spec-it-status', message: 'Generating layout & spacing...' });
    const layoutSection = await generateLayoutSection(node);
    if (layoutSection) placeSection(layoutSection);
  }

  if (enabled.has('typography')) {
    figma.ui.postMessage({ type: 'spec-it-status', message: 'Generating typography summary...' });
    const typoSection = await generateTypographySection(node);
    if (typoSection) placeSection(typoSection);
  }

  if (enabled.has('components')) {
    figma.ui.postMessage({ type: 'spec-it-status', message: 'Generating component details...' });
    const componentsSection = await generateComponentDetailsSection(node);
    if (componentsSection) placeSection(componentsSection);
  }

  figma.ui.postMessage({ type: 'spec-it-status', message: 'Spec complete!' });
}
