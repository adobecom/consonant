import { generateFocusIndicators, collectFocusableElements } from './spec-focus-indicators';
import { detectFocusOrder, FocusOrderEntry } from './a11y-focus-order';

const SIDEBAR_WIDTH = 320;
const SIDEBAR_PAD = 16;
const SECTION_GAP = 24;
const CARD_WIDTH = 400;
const CARD_GAP = 16;
const CARDS_TOP_MARGIN = 40;
const BADGE_HEIGHT = 24;
const PANEL_WIDTH = 3000;
const PANEL_GAP = 100;
const PANEL_PAD = 80;
const BADGE_COLOR = { r: 0.145, g: 0.494, b: 0.333 }; // #257E55 green
const NAVY_COLOR = { r: 0.063, g: 0.157, b: 0.294 }; // #10284B dark navy
const LANDMARK_BG = { r: 0.753, g: 0.898, b: 0.875 }; // #C0E5DF light green
const TIER2_COLOR = { r: 0.49, g: 0.23, b: 0.93 }; // #7c3aed purple
const TEXT_PRIMARY = { r: 0, g: 0, b: 0 };  // light theme
const TEXT_WHITE = { r: 0.989, g: 0.989, b: 0.989 };
const TEXT_SECONDARY_OPACITY = 0.7;
const BORDER_COLOR = { r: 0, g: 0, b: 0 };
const BORDER_OPACITY = 0.1;
const BG_COLOR = { r: 0.989, g: 0.989, b: 0.989 }; // #fcfcfc near-white
const STROKE_COLOR = { r: 0.89, g: 0.89, b: 0.89 }; // #e3e3e3

// ---------- Category badge config (matching human reference) ----------

interface CategoryBadgeConfig {
  color: RGB;
  textColor: RGB;
  cornerRadius: number;
  iconPath?: string; // SVG path data for 12x12 icon
  iconStroke?: boolean; // true = stroked icon, false = filled
}

const CATEGORY_BADGE: Record<string, CategoryBadgeConfig> = {
  // Focus Order — green circle
  focusOrder: {
    color: BADGE_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 16,
  },
  // Accessible Names — navy pill + headphone icon
  names: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1.3 4.55 L 1.3 4.39 C 1.3 2.965 2.41 1.3 4.01 1.3 C 5.61 1.3 6.72 2.965 6.72 4.39 L 6.72 4.55 M 4.01 9.72 L 4.01 10.11 C 4.01 10.39 4.19 10.7 4.55 10.7 L 5.35 10.7 C 6.35 10.7 7.16 9.89 7.16 8.89 M 0.975 4.55 L 1.6 4.55 L 1.6 8.17 L 0.975 8.17 C 0.64 8.17 0.37 7.9 0.37 7.57 L 0.37 5.15 C 0.37 4.82 0.64 4.55 0.975 4.55 Z M 6.4 4.55 L 7.03 4.55 C 7.36 4.55 7.63 4.82 7.63 5.15 L 7.63 7.57 C 7.63 7.9 7.36 8.17 7.03 8.17 L 6.4 8.17 L 6.4 4.55 Z',
    iconStroke: true,
  },
  // ARIA Roles — navy pill + </> code icon
  aria: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 4.66 10.4 L 7.26 0 M 9.86 2.6 L 10.98 3.82 C 11.3 4.14 11.3 4.66 10.98 4.98 L 9.86 6.2 M 2.06 6.2 L 0.94 4.98 C 0.62 4.66 0.62 4.14 0.94 3.82 L 2.06 2.6',
    iconStroke: true,
  },
  // Heading Hierarchy — navy pill + H icon
  headings: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1.5 1 L 1.5 11 M 10.5 1 L 10.5 11 M 1.5 6 L 10.5 6',
    iconStroke: true,
  },
  // Landmarks — light green pill with dark text
  landmarks: {
    color: LANDMARK_BG,
    textColor: TEXT_PRIMARY,
    cornerRadius: 6,
  },
  // Alt-Text — navy pill + image icon
  altText: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1 0 L 11 0 C 11.55 0 12 0.45 12 1 L 12 9 C 12 9.55 11.55 10 11 10 L 1 10 C 0.45 10 0 9.55 0 9 L 0 1 C 0 0.45 0.45 0 1 0 Z M 0 7 L 3.5 4 L 7 7 M 8 6 L 10 4 L 12 6 M 8 3 C 8 3.55 7.55 4 7 4 C 6.45 4 6 3.55 6 3 C 6 2.45 6.45 2 7 2 C 7.55 2 8 2.45 8 3 Z',
    iconStroke: true,
  },
  // Keyboard Patterns — navy pill + keyboard icon
  keyboard: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1 0 L 11 0 C 11.55 0 12 0.45 12 1 L 12 7.5 C 12 8.05 11.55 8.5 11 8.5 L 1 8.5 C 0.45 8.5 0 8.05 0 7.5 L 0 1 C 0 0.45 0.45 0 1 0 Z M 3 6.5 L 9 6.5 M 2.5 2 L 2.5 2 M 5 2 L 5 2 M 7 2 L 7 2 M 9.5 2 L 9.5 2 M 2.5 4.25 L 2.5 4.25 M 5 4.25 L 5 4.25 M 7 4.25 L 7 4.25 M 9.5 4.25 L 9.5 4.25',
    iconStroke: true,
  },
  // DOM Strategy — navy pill + tree/structure icon
  dom: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 6 0 L 6 4 M 6 4 L 2 7 M 6 4 L 10 7 M 2 7 L 2 10 M 10 7 L 10 10',
    iconStroke: true,
  },
  // Auto-Rotation — navy pill + rotation icon
  autoRotationSimplified: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 10.5 3 C 9.5 1.2 7.4 0 5.5 0 C 2.5 0 0 2.7 0 6 C 0 9.3 2.5 11 5.5 11 C 8 11 10 9.3 10.5 7 M 10.5 0 L 10.5 3 L 7.5 3',
    iconStroke: true,
  },
  autoRotation: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 10.5 3 C 9.5 1.2 7.4 0 5.5 0 C 2.5 0 0 2.7 0 6 C 0 9.3 2.5 11 5.5 11 C 8 11 10 9.3 10.5 7 M 10.5 0 L 10.5 3 L 7.5 3',
    iconStroke: true,
  },
  // General Note — navy pill + document icon
  generalNote: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 8.249 5.75 L 6.75 5.75 C 6.198 5.75 5.75 6.198 5.75 6.75 L 5.75 8.249 M 8.249 5.75 C 8.25 5.737 8.25 5.724 8.25 5.711 L 8.25 1 C 8.25 0.448 7.802 0 7.25 0 L 1 0 C 0.448 0 0 0.448 0 1 L 0 7.25 C 0 7.802 0.448 8.25 1 8.25 L 5.711 8.25 C 5.724 8.25 5.737 8.25 5.75 8.249 M 8.249 5.75 C 8.239 6.001 8.135 6.24 7.957 6.418 L 6.418 7.957 C 6.24 8.135 6.001 8.239 5.75 8.249 M 2.5 2.5 L 5.75 2.5 M 2.5 4.5 L 3.75 4.5',
    iconStroke: true,
  },
  // VoiceOver — navy pill + Apple-style icon
  voiceover: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 6 0 C 6 0 9 2 9 6 C 9 10 6 12 6 12 M 6 0 C 6 0 3 2 3 6 C 3 10 6 12 6 12 M 0 6 L 12 6 M 6 0 L 6 12',
    iconStroke: true,
  },
  // TalkBack — navy pill + Android-style icon
  talkback: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 2 4 L 10 4 C 10.55 4 11 4.45 11 5 L 11 9 C 11 9.55 10.55 10 10 10 L 2 10 C 1.45 10 1 9.55 1 9 L 1 5 C 1 4.45 1.45 4 2 4 Z M 4 4 L 4 2.5 C 4 1.4 4.9 0.5 6 0.5 C 7.1 0.5 8 1.4 8 2.5 L 8 4 M 4 7 L 4 7 M 8 7 L 8 7',
    iconStroke: true,
  },
  // Narrator — navy pill + Windows-style icon
  narrator: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1 1 L 11 1 M 6 1 L 6 11 M 3.5 11 L 8.5 11 M 1 1 L 1 5 M 11 1 L 11 5',
    iconStroke: true,
  },
  // React Native — navy pill + RN icon
  reactNative: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 6 4.5 C 6.83 4.5 7.5 5.17 7.5 6 C 7.5 6.83 6.83 7.5 6 7.5 C 5.17 7.5 4.5 6.83 4.5 6 C 4.5 5.17 5.17 4.5 6 4.5 Z M 6 2 C 9.31 2 12 3.79 12 6 C 12 8.21 9.31 10 6 10 C 2.69 10 0 8.21 0 6 C 0 3.79 2.69 2 6 2 Z',
    iconStroke: true,
  },
  // TV Note — navy pill + TV icon
  tvNote: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1 2 L 11 2 C 11.55 2 12 2.45 12 3 L 12 9 C 12 9.55 11.55 10 11 10 L 1 10 C 0.45 10 0 9.55 0 9 L 0 3 C 0 2.45 0.45 2 1 2 Z M 4 10 L 4 12 M 8 10 L 8 12 M 3 12 L 9 12 M 4 0 L 6 2 L 8 0',
    iconStroke: true,
  },
};

const TIER2_SECTIONS: Record<string, string> = {
  headings: 'Heading Hierarchy',
  landmarks: 'Landmarks',
  names: 'Accessible Names',
  altText: 'Alt-Text',
  aria: 'ARIA Roles & Attributes',
  keyboard: 'Keyboard Patterns',
  dom: 'DOM Strategy',
  autoRotationSimplified: 'Auto-Rotation',
  autoRotation: 'Auto-Rotation',
  voiceover: 'VoiceOver',
  talkback: 'TalkBack',
  narrator: 'Narrator',
  reactNative: 'React Native',
  tvNote: 'TV Note',
  generalNote: 'General Note',
};

const PANEL_DESCRIPTIONS: Record<string, string> = {
  focusIndicators: 'Visual representation of the browser focus ring on interactive elements. Every focusable element must have a visible focus indicator that meets WCAG 2.4.7.',
  focusOrder: 'The sequential order in which interactive elements receive keyboard focus. Must follow a logical reading order (WCAG 2.4.3). Annotate any elements that skip, are removed, or have custom tabindex.',
  headings: 'The heading level structure (H1–H6) of the page. A correct hierarchy helps screen reader users navigate by section. There should be exactly one H1 per page.',
  landmarks: 'ARIA landmark regions (banner, main, navigation, region, etc.) that allow screen reader users to jump between major page areas.',
  names: 'For sections or items that need a clear identifier, and either lack one, or whose meaning is not sufficiently explicit.\nExample: "Learn more" buttons, headerless accordion lists, icon-only controls.',
  altText: 'Alternative text for images and media. Decorative images get alt="". Meaningful images get concise descriptions. Complex images may need long descriptions.',
  aria: 'ARIA roles, states, and properties that communicate widget behavior to assistive technology. Use native HTML semantics first; add ARIA only when HTML falls short.',
  keyboard: 'Expected keyboard interactions for custom widgets. Standard patterns: Tab to navigate between widgets, arrow keys within composite widgets, Enter/Space to activate.',
  dom: 'How the visual design maps to DOM structure. Reading order, semantic elements, skip links, and whether content is hidden vs removed from the DOM.',
  autoRotation: 'Auto-advancing content (carousels, slideshows) must be pausable (WCAG 2.2.2). Define timing, pause triggers, resume behavior, and reduced-motion handling.',
  voiceover: 'VoiceOver-specific behavior on iOS and macOS. Rotor actions, swipe gestures, announcement order, and any platform quirks.',
  talkback: 'TalkBack-specific behavior on Android. Touch exploration, gesture navigation, and any platform-specific announcements.',
  narrator: 'Narrator-specific behavior on Windows. Scan mode interactions, landmark navigation, and any platform quirks.',
  reactNative: 'React Native accessibility props: accessibilityLabel, accessibilityRole, accessibilityState, accessibilityActions, and platform bridging notes.',
  tvNote: 'TV platform accessibility: D-pad navigation, focus management, spatial navigation order, and remote control interactions.',
  generalNote: 'General accessibility notes that apply across all platforms. Live regions, announcements, and cross-platform behavior.',
};

async function loadFonts() {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'SemiBold' });
}

function createText(content: string, size: number, weight: 'Regular' | 'Bold' | 'Medium' | 'SemiBold' = 'Regular', color?: RGB): TextNode {
  const text = figma.createText();
  text.fontName = { family: 'Inter', style: weight };
  text.fontSize = size;
  text.characters = content;
  if (color) text.fills = [{ type: 'SOLID', color }];
  return text;
}

function createSectionFrame(title: string, isTier2: boolean): FrameNode {
  const section = figma.createFrame();
  section.name = title;
  section.layoutMode = 'VERTICAL';
  section.counterAxisSizingMode = 'FIXED';
  section.resize(SIDEBAR_WIDTH - SIDEBAR_PAD * 2, 40);
  section.primaryAxisSizingMode = 'AUTO';
  section.clipsContent = false;
  section.itemSpacing = 8;
  section.fills = [];

  // Section header
  const headerFrame = figma.createFrame();
  headerFrame.name = 'Section Header';
  headerFrame.layoutMode = 'HORIZONTAL';
  headerFrame.primaryAxisSizingMode = 'AUTO';
  headerFrame.counterAxisSizingMode = 'AUTO';
  headerFrame.itemSpacing = 6;
  headerFrame.paddingBottom = 8;
  headerFrame.fills = [];

  const titleText = createText(title, 15, 'Bold', isTier2 ? TIER2_COLOR : TEXT_PRIMARY);
  titleText.opacity = isTier2 ? 1 : 0.95;
  headerFrame.appendChild(titleText);

  if (isTier2) {
    const aiTag = createText('AI', 10, 'Medium', TIER2_COLOR);
    headerFrame.appendChild(aiTag);
  }

  section.appendChild(headerFrame);
  return section;
}

function createFocusOrderSection(entries: FocusOrderEntry[]): FrameNode {
  const section = createSectionFrame('Focus Order', false);

  for (const entry of entries) {
    const row = figma.createFrame();
    row.name = `${entry.name} (ID: ${entry.node.id})`;
    row.layoutMode = 'VERTICAL';
    row.counterAxisSizingMode = 'FIXED';
    row.resize(SIDEBAR_WIDTH - SIDEBAR_PAD * 2, 48);
    row.primaryAxisSizingMode = 'AUTO';
    row.clipsContent = false;
    row.itemSpacing = 8;
    row.paddingTop = 12;
    row.paddingBottom = 12;
    row.fills = [];
    // Bottom border separator
    row.strokes = [{ type: 'SOLID', color: BORDER_COLOR, opacity: BORDER_OPACITY } as any];
    row.strokeWeight = 1;
    row.strokeAlign = 'INSIDE';
    row.strokeTopWeight = 0;
    row.strokeRightWeight = 0;
    row.strokeBottomWeight = 1;
    row.strokeLeftWeight = 0;

    // Badge + name row
    const infoRow = figma.createFrame();
    infoRow.name = 'Focus Order Info';
    infoRow.layoutMode = 'HORIZONTAL';
    infoRow.primaryAxisSizingMode = 'AUTO';
    infoRow.counterAxisSizingMode = 'AUTO';
    infoRow.counterAxisAlignItems = 'CENTER';
    infoRow.itemSpacing = 8;
    infoRow.fills = [];

    const badgeBg = createNumberedBadge(entry.index, 'focusOrder');
    badgeBg.strokes = []; // no white outline in sidebar
    badgeBg.strokeWeight = 0;

    const label = createText(entry.name, 13, 'Regular', TEXT_PRIMARY);
    label.opacity = 0.95;
    infoRow.appendChild(badgeBg);
    infoRow.appendChild(label);
    row.appendChild(infoRow);
    section.appendChild(row);
  }

  return section;
}

function createCategoryIcon(categoryKey: string, color: RGB): FrameNode | null {
  const config = CATEGORY_BADGE[categoryKey];
  if (!config?.iconPath) return null;

  const iconFrame = figma.createFrame();
  iconFrame.name = 'Icon';
  iconFrame.resize(12, 12);
  iconFrame.fills = [];
  iconFrame.clipsContent = false;

  const vector = figma.createVector();
  vector.vectorPaths = [{ windingRule: 'NONZERO', data: config.iconPath }];
  if (config.iconStroke) {
    vector.fills = [];
    vector.strokes = [{ type: 'SOLID', color }];
    vector.strokeWeight = 1.2;
    vector.strokeCap = 'ROUND' as any;
    vector.strokeJoin = 'ROUND' as any;
  } else {
    vector.fills = [{ type: 'SOLID', color }];
  }

  // Fit vector inside 12x12
  const bounds = vector.absoluteBoundingBox;
  if (bounds) {
    const scale = Math.min(10 / bounds.width, 10 / bounds.height);
    vector.resize(bounds.width * scale, bounds.height * scale);
  }

  iconFrame.appendChild(vector);
  // Center the vector in the frame
  vector.x = (12 - vector.width) / 2;
  vector.y = (12 - vector.height) / 2;

  return iconFrame;
}

function createNumberedBadge(index: number, categoryKey?: string): FrameNode {
  const config = categoryKey ? CATEGORY_BADGE[categoryKey] : undefined;
  const badgeColor = config?.color || BADGE_COLOR;
  const textColor = config?.textColor || TEXT_WHITE;
  const radius = config?.cornerRadius ?? 16;

  const badge = figma.createFrame();
  badge.name = 'Badge';
  badge.resize(BADGE_HEIGHT, BADGE_HEIGHT);
  badge.cornerRadius = radius;
  badge.fills = [{ type: 'SOLID', color: badgeColor }];
  badge.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  badge.strokeWeight = 2;
  badge.strokeAlign = 'OUTSIDE';
  badge.layoutMode = 'HORIZONTAL';
  badge.primaryAxisSizingMode = 'AUTO';
  badge.counterAxisSizingMode = 'FIXED';
  badge.primaryAxisAlignItems = 'CENTER';
  badge.counterAxisAlignItems = 'CENTER';
  badge.paddingLeft = 8;
  badge.paddingRight = 8;
  badge.itemSpacing = 4;

  const text = createText(`${index}`, 12, 'SemiBold', textColor);
  badge.appendChild(text);

  // Add category icon if available
  if (categoryKey) {
    const icon = createCategoryIcon(categoryKey, textColor);
    if (icon) badge.appendChild(icon);
  }

  return badge;
}

function createDetailCard(sectionKey: string, isTier2: boolean): FrameNode {
  const title = TIER2_SECTIONS[sectionKey] || sectionKey;
  const config = CATEGORY_BADGE[sectionKey];
  const card = figma.createFrame();
  card.name = title;
  card.resize(CARD_WIDTH, 100);
  card.layoutMode = 'VERTICAL';
  card.counterAxisSizingMode = 'FIXED';
  card.primaryAxisSizingMode = 'AUTO';
  card.clipsContent = false;
  card.paddingTop = 16;
  card.paddingBottom = 16;
  card.paddingLeft = 16;
  card.paddingRight = 16;
  card.itemSpacing = 8;
  card.fills = [{ type: 'SOLID', color: BG_COLOR }];
  card.strokes = [{ type: 'SOLID', color: STROKE_COLOR }];
  card.strokeWeight = 1;
  card.strokeAlign = 'INSIDE';
  card.cornerRadius = 8;

  // Header row with category badge icon + title
  const headerFrame = figma.createFrame();
  headerFrame.name = 'Card Header';
  headerFrame.layoutMode = 'HORIZONTAL';
  headerFrame.primaryAxisSizingMode = 'AUTO';
  headerFrame.counterAxisSizingMode = 'AUTO';
  headerFrame.counterAxisAlignItems = 'CENTER';
  headerFrame.itemSpacing = 8;
  headerFrame.fills = [];

  const titleText = createText(title, 15, 'Bold', TEXT_PRIMARY);
  headerFrame.appendChild(titleText);

  // Add category icon badge to the right of the title
  if (config?.iconPath) {
    const iconBadge = figma.createFrame();
    iconBadge.name = 'Category Icon';
    iconBadge.resize(20, 20);
    iconBadge.cornerRadius = 4;
    iconBadge.fills = [{ type: 'SOLID', color: config.color }];
    iconBadge.layoutMode = 'HORIZONTAL';
    iconBadge.primaryAxisAlignItems = 'CENTER';
    iconBadge.counterAxisAlignItems = 'CENTER';
    iconBadge.paddingLeft = 4;
    iconBadge.paddingRight = 4;
    iconBadge.paddingTop = 4;
    iconBadge.paddingBottom = 4;

    const icon = createCategoryIcon(sectionKey, config.textColor);
    if (icon) iconBadge.appendChild(icon);
    headerFrame.appendChild(iconBadge);
  }

  card.appendChild(headerFrame);

  const placeholder = createText('Awaiting AI fill...', 11, 'Regular', TEXT_PRIMARY);
  placeholder.opacity = 0.4;
  card.appendChild(placeholder);

  return card;
}

function createGroupedCard(groupTitle: string, keys: string[]): FrameNode {
  const card = figma.createFrame();
  card.name = groupTitle;
  card.layoutMode = 'VERTICAL';
  card.counterAxisSizingMode = 'FIXED';
  card.primaryAxisSizingMode = 'AUTO';
  card.layoutAlign = 'STRETCH';
  card.clipsContent = false;
  card.paddingTop = 16;
  card.paddingBottom = 16;
  card.paddingLeft = 16;
  card.paddingRight = 16;
  card.itemSpacing = 12;
  card.fills = [{ type: 'SOLID', color: BG_COLOR }];
  card.strokes = [{ type: 'SOLID', color: STROKE_COLOR }];
  card.strokeWeight = 1;
  card.strokeAlign = 'INSIDE';
  card.cornerRadius = 8;

  // Card title
  const titleColor = groupTitle === 'Accessibility Notes' ? NAVY_COLOR : TIER2_COLOR;
  const titleText = createText(groupTitle, 15, 'Bold', titleColor);
  card.appendChild(titleText);

  // One sub-section per category
  for (const key of keys) {
    const title = TIER2_SECTIONS[key] || key;
    const config = CATEGORY_BADGE[key];

    const section = figma.createFrame();
    section.name = title;
    section.layoutMode = 'VERTICAL';
    section.primaryAxisSizingMode = 'AUTO';
    section.counterAxisSizingMode = 'AUTO';
    section.layoutAlign = 'STRETCH';
    section.itemSpacing = 4;
    section.fills = [];
    section.clipsContent = false;

    // Category header row: icon badge + label
    const headerRow = figma.createFrame();
    headerRow.name = `${title} Header`;
    headerRow.layoutMode = 'HORIZONTAL';
    headerRow.primaryAxisSizingMode = 'AUTO';
    headerRow.counterAxisSizingMode = 'AUTO';
    headerRow.counterAxisAlignItems = 'CENTER';
    headerRow.itemSpacing = 6;
    headerRow.fills = [];

    if (config?.iconPath) {
      const iconBadge = figma.createFrame();
      iconBadge.name = 'Category Icon';
      iconBadge.resize(18, 18);
      iconBadge.cornerRadius = 4;
      iconBadge.fills = [{ type: 'SOLID', color: config.color }];
      iconBadge.layoutMode = 'HORIZONTAL';
      iconBadge.primaryAxisAlignItems = 'CENTER';
      iconBadge.counterAxisAlignItems = 'CENTER';
      iconBadge.paddingLeft = 3;
      iconBadge.paddingRight = 3;
      iconBadge.paddingTop = 3;
      iconBadge.paddingBottom = 3;

      const icon = createCategoryIcon(key, config.textColor);
      if (icon) iconBadge.appendChild(icon);
      headerRow.appendChild(iconBadge);
    }

    const labelText = createText(title, 13, 'SemiBold', TEXT_PRIMARY);
    headerRow.appendChild(labelText);
    section.appendChild(headerRow);

    const placeholder = createText('Awaiting AI fill...', 11, 'Regular', TEXT_PRIMARY);
    placeholder.opacity = 0.4;
    section.appendChild(placeholder);

    card.appendChild(section);
  }

  return card;
}

export async function generateBlueline(
  node: SceneNode,
  tier1: string[],
  tier2: string[],
  options?: { grouped?: boolean },
): Promise<{ frameId: string; tier2Sections: string[] }> {
  await loadFonts();

  const sourceAbs = node.absoluteBoundingBox;
  if (!sourceAbs) throw new Error('Node has no bounding box');

  const page = figma.currentPage;

  // Use absolute coordinates — place everything directly on the page
  const sourceX = sourceAbs.x;
  const sourceY = sourceAbs.y;

  // --- Focus Order detection (Tier 1) ---
  let focusEntries: FocusOrderEntry[] = [];
  if (tier1.includes('focusOrder')) {
    focusEntries = detectFocusOrder(node);
  }

  // --- Sidebar: Focus Order only (compact, left of frame) ---
  let sidebar: FrameNode | null = null;

  if (focusEntries.length > 0) {
    sidebar = figma.createFrame();
    sidebar.name = 'Accessibility Annotations';
    sidebar.resize(SIDEBAR_WIDTH, 100);
    sidebar.layoutMode = 'VERTICAL';
    sidebar.counterAxisSizingMode = 'FIXED';
    sidebar.primaryAxisSizingMode = 'AUTO';
    sidebar.clipsContent = false;
    sidebar.paddingTop = SIDEBAR_PAD;
    sidebar.paddingBottom = SIDEBAR_PAD;
    sidebar.paddingLeft = SIDEBAR_PAD;
    sidebar.paddingRight = SIDEBAR_PAD;
    sidebar.itemSpacing = SECTION_GAP;
    sidebar.fills = [{ type: 'SOLID', color: BG_COLOR }];
    sidebar.strokes = [{ type: 'SOLID', color: STROKE_COLOR }];
    sidebar.strokeWeight = 1;
    sidebar.strokeAlign = 'INSIDE';
    sidebar.cornerRadius = 8;

    const headerText = createText('Accessibility Annotations', 15, 'SemiBold', TEXT_PRIMARY);
    headerText.opacity = 0.95;
    sidebar.appendChild(headerText);

    const focusSection = createFocusOrderSection(focusEntries);
    sidebar.appendChild(focusSection);

    sidebar.x = sourceX - SIDEBAR_WIDTH - 40;
    sidebar.y = sourceY;
    page.appendChild(sidebar);
  }

  // --- Focus Indicators (Tier 1) — blue rectangles on the design ---
  if (tier1.includes('focusIndicators')) {
    figma.ui.postMessage({ type: 'a11y-status', message: 'Adding focus indicators...' });
    await generateFocusIndicators(node);
  }

  // --- Numbered badges on the design (Tier 1 Focus Order) ---
  if (focusEntries.length > 0) {
    figma.ui.postMessage({ type: 'a11y-status', message: 'Adding focus order badges...' });
    for (const entry of focusEntries) {
      const abs = entry.node.absoluteBoundingBox;
      if (!abs) continue;
      const badge = createNumberedBadge(entry.index, 'focusOrder');
      badge.x = abs.x - 4;
      badge.y = abs.y - BADGE_HEIGHT - 2;
      page.appendChild(badge);
    }
  }

  // --- Tier 2 detail cards (below the design frame) ---
  if (tier2.length > 0) {
    const grouped = options?.grouped !== false; // default to grouped
    const NOTE_KEYS = new Set(['voiceover', 'talkback', 'narrator', 'reactNative', 'tvNote', 'generalNote']);
    const coreKeys = tier2.filter(k => !NOTE_KEYS.has(k));
    const noteKeys = tier2.filter(k => NOTE_KEYS.has(k));

    if (grouped) {
      // Grouped mode: one card per group with category sub-sections inside
      const outerContainer = figma.createFrame();
      outerContainer.name = 'Tier 2 Cards';
      outerContainer.layoutMode = 'HORIZONTAL';
      outerContainer.layoutWrap = 'WRAP';
      outerContainer.counterAxisSizingMode = 'AUTO';
      outerContainer.primaryAxisSizingMode = 'FIXED';
      outerContainer.resize(sourceAbs.width, 100);
      outerContainer.itemSpacing = CARD_GAP;
      outerContainer.counterAxisSpacing = CARD_GAP;
      outerContainer.fills = [];
      outerContainer.clipsContent = false;

      if (coreKeys.length > 0) {
        const coreCard = createGroupedCard('AI-assisted', coreKeys);
        outerContainer.appendChild(coreCard);
      }

      if (noteKeys.length > 0) {
        const notesCard = createGroupedCard('Accessibility Notes', noteKeys);
        outerContainer.appendChild(notesCard);
      }

      outerContainer.x = sourceX;
      outerContainer.y = sourceY + sourceAbs.height + CARDS_TOP_MARGIN;
      page.appendChild(outerContainer);
    } else {
      // Classic mode: individual card per category in a wrap layout
      const cardsContainer = figma.createFrame();
      cardsContainer.name = 'Tier 2 Cards';
      cardsContainer.layoutMode = 'HORIZONTAL';
      cardsContainer.layoutWrap = 'WRAP';
      cardsContainer.counterAxisSizingMode = 'AUTO';
      cardsContainer.primaryAxisSizingMode = 'FIXED';
      cardsContainer.resize(sourceAbs.width, 100);
      cardsContainer.primaryAxisAlignItems = 'MIN';
      cardsContainer.counterAxisAlignItems = 'MIN';
      cardsContainer.itemSpacing = CARD_GAP;
      cardsContainer.counterAxisSpacing = CARD_GAP;
      cardsContainer.fills = [];
      cardsContainer.clipsContent = false;

      for (const key of tier2) {
        const card = createDetailCard(key, true);
        cardsContainer.appendChild(card);
      }

      cardsContainer.x = sourceX;
      cardsContainer.y = sourceY + sourceAbs.height + CARDS_TOP_MARGIN;
      page.appendChild(cardsContainer);
    }
  }

  // Zoom to show the annotation area
  const viewNodes: SceneNode[] = [node];
  if (sidebar) viewNodes.push(sidebar);
  figma.viewport.scrollAndZoomIntoView(viewNodes);

  return { frameId: node.id, tier2Sections: tier2 };
}

// ---------------------------------------------------------------------------
// Panels mode: one Figma Section per a11y category, each with a cloned design
// ---------------------------------------------------------------------------

function createInstructionsCard(title: string, description: string, categoryKey?: string): FrameNode {
  const config = categoryKey ? CATEGORY_BADGE[categoryKey] : undefined;
  const card = figma.createFrame();
  card.name = 'Instructions';
  card.resize(CARD_WIDTH, 100);
  card.layoutMode = 'VERTICAL';
  card.counterAxisSizingMode = 'FIXED';
  card.primaryAxisSizingMode = 'AUTO';
  card.clipsContent = false;
  card.paddingTop = 24;
  card.paddingBottom = 24;
  card.paddingLeft = 24;
  card.paddingRight = 24;
  card.itemSpacing = 12;
  card.fills = [{ type: 'SOLID', color: BG_COLOR }];
  card.strokes = [{ type: 'SOLID', color: STROKE_COLOR }];
  card.strokeWeight = 1;
  card.strokeAlign = 'INSIDE';
  card.cornerRadius = 8;

  // Header with title + category icon
  const headerFrame = figma.createFrame();
  headerFrame.name = 'Card Header';
  headerFrame.layoutMode = 'HORIZONTAL';
  headerFrame.primaryAxisSizingMode = 'AUTO';
  headerFrame.counterAxisSizingMode = 'AUTO';
  headerFrame.counterAxisAlignItems = 'CENTER';
  headerFrame.itemSpacing = 10;
  headerFrame.fills = [];

  const titleText = createText(title, 28, 'Bold', TEXT_PRIMARY);
  headerFrame.appendChild(titleText);

  if (config?.iconPath) {
    const iconBadge = figma.createFrame();
    iconBadge.name = 'Category Icon';
    iconBadge.resize(28, 28);
    iconBadge.cornerRadius = 6;
    iconBadge.fills = [{ type: 'SOLID', color: config.color }];
    iconBadge.layoutMode = 'HORIZONTAL';
    iconBadge.primaryAxisAlignItems = 'CENTER';
    iconBadge.counterAxisAlignItems = 'CENTER';
    iconBadge.paddingLeft = 6;
    iconBadge.paddingRight = 6;
    iconBadge.paddingTop = 6;
    iconBadge.paddingBottom = 6;

    const icon = createCategoryIcon(categoryKey!, config.textColor);
    if (icon) {
      icon.resize(16, 16);
      iconBadge.appendChild(icon);
    }
    headerFrame.appendChild(iconBadge);
  }

  card.appendChild(headerFrame);

  const descText = createText(description, 14, 'Regular', TEXT_PRIMARY);
  descText.opacity = 0.7;
  descText.textAutoResize = 'HEIGHT';
  descText.resize(CARD_WIDTH - 48, descText.height);
  card.appendChild(descText);

  return card;
}

export async function generateBluelinePanels(
  node: SceneNode,
  tier1: string[],
  tier2: string[],
): Promise<{ frameId: string; tier2Sections: string[] }> {
  await loadFonts();

  const sourceAbs = node.absoluteBoundingBox;
  if (!sourceAbs) throw new Error('Node has no bounding box');

  const page = figma.currentPage;

  // Collect all panel keys in order
  const allPanels: string[] = [];
  if (tier1.includes('focusIndicators')) allPanels.push('focusIndicators');
  if (tier1.includes('focusOrder')) allPanels.push('focusOrder');
  for (const key of tier2) allPanels.push(key);

  if (allPanels.length === 0) throw new Error('Select at least one option');

  // Detect focus order once (reused across panels)
  let focusEntries: FocusOrderEntry[] = [];
  if (tier1.includes('focusOrder')) {
    focusEntries = detectFocusOrder(node);
  }

  // Starting position — place panels to the right of the source frame
  let panelX = sourceAbs.x + sourceAbs.width + 200;
  const panelY = sourceAbs.y;
  const firstSection: SceneNode[] = [];

  for (const key of allPanels) {
    const title = TIER2_SECTIONS[key] || (key === 'focusIndicators' ? 'Focus Indicators' : key === 'focusOrder' ? 'Focus Order' : key);
    const description = PANEL_DESCRIPTIONS[key] || '';

    // Create Figma Section
    const section = figma.createSection();
    section.name = `A11y ${title}`;
    section.x = panelX;
    section.y = panelY;

    // Instructions card (left side of section)
    const instructions = createInstructionsCard(title, description, key);
    instructions.x = PANEL_PAD;
    instructions.y = PANEL_PAD;
    section.appendChild(instructions);

    // Clone the design frame (right of instructions card)
    const clone = node.clone();
    clone.name = node.name;
    const cloneX = PANEL_PAD + CARD_WIDTH + 40; // card + gap
    const cloneY = PANEL_PAD;
    clone.x = cloneX;
    clone.y = cloneY;
    section.appendChild(clone);

    // Apply tier 1 annotations to the clone within this section
    if (key === 'focusIndicators') {
      await generateFocusIndicators(clone);
    }
    if (key === 'focusOrder' && focusEntries.length > 0) {
      // Re-detect on the clone (positions differ from original)
      const cloneEntries = detectFocusOrder(clone);
      const secAbs = section.absoluteBoundingBox;
      const offX = secAbs ? secAbs.x : 0;
      const offY = secAbs ? secAbs.y : 0;
      for (const entry of cloneEntries) {
        const abs = entry.node.absoluteBoundingBox;
        if (!abs) continue;
        const badge = createNumberedBadge(entry.index, 'focusOrder');
        badge.x = abs.x - 4 - offX;
        badge.y = abs.y - BADGE_HEIGHT - 2 - offY;
        section.appendChild(badge);
      }
    }

    // Resize section to fit content
    const sectionW = cloneX + sourceAbs.width + PANEL_PAD;
    const sectionH = Math.max(instructions.height, sourceAbs.height) + PANEL_PAD * 2;
    section.resizeWithoutConstraints(sectionW, sectionH);

    page.appendChild(section);
    firstSection.push(section);

    panelX += sectionW + PANEL_GAP;
  }

  // Zoom to show all panels
  figma.viewport.scrollAndZoomIntoView(firstSection);

  return { frameId: node.id, tier2Sections: tier2 };
}

// ---------------------------------------------------------------------------
// placeCategoryBadge: called during AI fill to place numbered badges on design
// ---------------------------------------------------------------------------

export async function placeCategoryBadge(
  targetNodeId: string,
  index: number,
  categoryKey: string,
): Promise<{ badgeId: string }> {
  await loadFonts();
  const target = await figma.getNodeByIdAsync(targetNodeId);
  if (!target || !('absoluteBoundingBox' in target)) {
    throw new Error(`Node ${targetNodeId} not found or has no bounding box`);
  }
  const abs = (target as SceneNode).absoluteBoundingBox;
  if (!abs) throw new Error('No bounding box');

  const badge = createNumberedBadge(index, categoryKey);

  // Desired position: above the top-left of the element
  let badgeX = abs.x - 4;
  const badgeY = abs.y - BADGE_HEIGHT - 4;

  // Check for collisions with existing badges and offset horizontally
  const page = figma.currentPage;
  const existingBadges = page.children.filter(
    n => n.name === 'Badge' && 'absoluteBoundingBox' in n,
  );
  for (const existing of existingBadges) {
    const eb = (existing as SceneNode).absoluteBoundingBox;
    if (!eb) continue;
    // Check if vertically overlapping (same row) and horizontally close
    if (Math.abs(eb.y - badgeY) < BADGE_HEIGHT + 2) {
      const overlapLeft = badgeX + badge.width + 4 > eb.x && badgeX < eb.x + eb.width + 4;
      if (overlapLeft) {
        // Push right past this badge
        badgeX = eb.x + eb.width + 4;
      }
    }
  }

  badge.x = badgeX;
  badge.y = badgeY;
  figma.currentPage.appendChild(badge);

  return { badgeId: badge.id };
}
