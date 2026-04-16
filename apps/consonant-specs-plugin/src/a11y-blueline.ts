// Waiver: annotation text uses manual fontName — these are spec overlays, not themed UI
import { generateFocusIndicators, collectFocusableElements } from './spec-focus-indicators';
import { detectFocusOrder, FocusOrderEntry } from './a11y-focus-order';
import { runStructuralScan } from './a11y-structural-scan';

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
const AI_COLOR = { r: 0.49, g: 0.23, b: 0.93 }; // #7c3aed purple
const TEXT_PRIMARY = { r: 0, g: 0, b: 0 };  // light theme
const TEXT_WHITE = { r: 0.989, g: 0.989, b: 0.989 };
const TEXT_SECONDARY_OPACITY = 0.7;
const BORDER_COLOR = { r: 0, g: 0, b: 0 };
const BORDER_OPACITY = 0.1;
const BG_COLOR = { r: 0.989, g: 0.989, b: 0.989 }; // #fcfcfc near-white
const STROKE_COLOR = { r: 0.89, g: 0.89, b: 0.89 }; // #e3e3e3

// Category overlay colors for panels mode (12% opacity fill, 50% opacity stroke)
const OVERLAY_COLORS: Record<string, { r: number; g: number; b: number }> = {
  landmarks: { r: 0.145, g: 0.388, b: 0.921 },
  ariaRoles: { r: 0.486, g: 0.228, b: 0.929 },
  aria: { r: 0.486, g: 0.228, b: 0.929 },
  domStrategy: { r: 0.278, g: 0.333, b: 0.412 },
  dom: { r: 0.278, g: 0.333, b: 0.412 },
  headings: { r: 0.855, g: 0.424, b: 0.106 },
  names: { r: 0.063, g: 0.157, b: 0.294 },
  accessibleNames: { r: 0.063, g: 0.157, b: 0.294 },
  altText: { r: 0.608, g: 0.212, b: 0.208 },
  keyboard: { r: 0.176, g: 0.541, b: 0.431 },
  keyboardPatterns: { r: 0.176, g: 0.541, b: 0.431 },
  colorContrast: { r: 0.729, g: 0.192, b: 0.482 },
  forms: { r: 0.467, g: 0.533, b: 0.176 },
  targetSize: { r: 0.776, g: 0.608, b: 0.118 },
};

const PANEL_COLS = 3;

// ---------- Category badge config (matching human reference) ----------

interface CategoryBadgeConfig {
  color: RGB;
  textColor: RGB;
  cornerRadius: number;
  iconPath?: string; // SVG path data for 12x12 icon
  iconStroke?: boolean; // true = stroked icon, false = filled
}

const CATEGORY_BADGE: Record<string, CategoryBadgeConfig> = {
  // Focus Indicators — navy pill + focus ring icon
  focusIndicators: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 6 1 C 3.24 1 1 3.24 1 6 C 1 8.76 3.24 11 6 11 C 8.76 11 11 8.76 11 6 C 11 3.24 8.76 1 6 1 Z M 6 3 C 4.34 3 3 4.34 3 6 C 3 7.66 4.34 9 6 9 C 7.66 9 9 7.66 9 6 C 9 4.34 7.66 3 6 3 Z',
    iconStroke: true,
  },
  // Focus Order — green circle
  focusOrder: {
    color: BADGE_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 16,
  },
  // Accessible Names — navy pill + headphone icon
  accessibleNames: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1.3 4.55 L 1.3 4.39 C 1.3 2.965 2.41 1.3 4.01 1.3 C 5.61 1.3 6.72 2.965 6.72 4.39 L 6.72 4.55 M 4.01 9.72 L 4.01 10.11 C 4.01 10.39 4.19 10.7 4.55 10.7 L 5.35 10.7 C 6.35 10.7 7.16 9.89 7.16 8.89 M 0.975 4.55 L 1.6 4.55 L 1.6 8.17 L 0.975 8.17 C 0.64 8.17 0.37 7.9 0.37 7.57 L 0.37 5.15 C 0.37 4.82 0.64 4.55 0.975 4.55 Z M 6.4 4.55 L 7.03 4.55 C 7.36 4.55 7.63 4.82 7.63 5.15 L 7.63 7.57 C 7.63 7.9 7.36 8.17 7.03 8.17 L 6.4 8.17 L 6.4 4.55 Z',
    iconStroke: true,
  },
  names: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1.3 4.55 L 1.3 4.39 C 1.3 2.965 2.41 1.3 4.01 1.3 C 5.61 1.3 6.72 2.965 6.72 4.39 L 6.72 4.55 M 4.01 9.72 L 4.01 10.11 C 4.01 10.39 4.19 10.7 4.55 10.7 L 5.35 10.7 C 6.35 10.7 7.16 9.89 7.16 8.89 M 0.975 4.55 L 1.6 4.55 L 1.6 8.17 L 0.975 8.17 C 0.64 8.17 0.37 7.9 0.37 7.57 L 0.37 5.15 C 0.37 4.82 0.64 4.55 0.975 4.55 Z M 6.4 4.55 L 7.03 4.55 C 7.36 4.55 7.63 4.82 7.63 5.15 L 7.63 7.57 C 7.63 7.9 7.36 8.17 7.03 8.17 L 6.4 8.17 L 6.4 4.55 Z',
    iconStroke: true,
  },
  // ARIA Roles — navy pill + </> code icon
  ariaRoles: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 4.66 10.4 L 7.26 0 M 9.86 2.6 L 10.98 3.82 C 11.3 4.14 11.3 4.66 10.98 4.98 L 9.86 6.2 M 2.06 6.2 L 0.94 4.98 C 0.62 4.66 0.62 4.14 0.94 3.82 L 2.06 2.6',
    iconStroke: true,
  },
  aria: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 4.66 10.4 L 7.26 0 M 9.86 2.6 L 10.98 3.82 C 11.3 4.14 11.3 4.66 10.98 4.98 L 9.86 6.2 M 2.06 6.2 L 0.94 4.98 C 0.62 4.66 0.62 4.14 0.94 3.82 L 2.06 2.6',
    iconStroke: true,
  },
  // Heading Hierarchy — navy pill + H icon
  headingHierarchy: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1.5 1 L 1.5 11 M 10.5 1 L 10.5 11 M 1.5 6 L 10.5 6',
    iconStroke: true,
  },
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
  keyboardPatterns: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1 0 L 11 0 C 11.55 0 12 0.45 12 1 L 12 7.5 C 12 8.05 11.55 8.5 11 8.5 L 1 8.5 C 0.45 8.5 0 8.05 0 7.5 L 0 1 C 0 0.45 0.45 0 1 0 Z M 3 6.5 L 9 6.5 M 2.5 2 L 2.5 2 M 5 2 L 5 2 M 7 2 L 7 2 M 9.5 2 L 9.5 2 M 2.5 4.25 L 2.5 4.25 M 5 4.25 L 5 4.25 M 7 4.25 L 7 4.25 M 9.5 4.25 L 9.5 4.25',
    iconStroke: true,
  },
  keyboard: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1 0 L 11 0 C 11.55 0 12 0.45 12 1 L 12 7.5 C 12 8.05 11.55 8.5 11 8.5 L 1 8.5 C 0.45 8.5 0 8.05 0 7.5 L 0 1 C 0 0.45 0.45 0 1 0 Z M 3 6.5 L 9 6.5 M 2.5 2 L 2.5 2 M 5 2 L 5 2 M 7 2 L 7 2 M 9.5 2 L 9.5 2 M 2.5 4.25 L 2.5 4.25 M 5 4.25 L 5 4.25 M 7 4.25 L 7 4.25 M 9.5 4.25 L 9.5 4.25',
    iconStroke: true,
  },
  // DOM Strategy — navy pill + tree/structure icon
  domStrategy: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 6 0 L 6 4 M 6 4 L 2 7 M 6 4 L 10 7 M 2 7 L 2 10 M 10 7 L 10 10',
    iconStroke: true,
  },
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
  // Color Contrast — navy pill + eye icon
  colorContrast: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 0 6 C 0 6 2.5 1 6 1 C 9.5 1 12 6 12 6 C 12 6 9.5 11 6 11 C 2.5 11 0 6 0 6 Z M 6 4 C 7.1 4 8 4.9 8 6 C 8 7.1 7.1 8 6 8 C 4.9 8 4 7.1 4 6 C 4 4.9 4.9 4 6 4 Z',
    iconStroke: true,
  },
  // Forms — navy pill + form icon
  forms: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1 0 L 11 0 C 11.55 0 12 0.45 12 1 L 12 11 C 12 11.55 11.55 12 11 12 L 1 12 C 0.45 12 0 11.55 0 11 L 0 1 C 0 0.45 0.45 0 1 0 Z M 3 3 L 9 3 M 3 6 L 9 6 M 3 9 L 6 9',
    iconStroke: true,
  },
  // Target Size — navy pill + target icon
  targetSize: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 6 1 C 3.24 1 1 3.24 1 6 C 1 8.76 3.24 11 6 11 C 8.76 11 11 8.76 11 6 C 11 3.24 8.76 1 6 1 Z M 6 3.5 C 4.62 3.5 3.5 4.62 3.5 6 C 3.5 7.38 4.62 8.5 6 8.5 C 7.38 8.5 8.5 7.38 8.5 6 C 8.5 4.62 7.38 3.5 6 3.5 Z M 6 5 C 5.45 5 5 5.45 5 6 C 5 6.55 5.45 7 6 7 C 6.55 7 7 6.55 7 6 C 7 5.45 6.55 5 6 5 Z',
    iconStroke: true,
  },
  // Reflow & Text Spacing — navy pill + responsive icon
  reflow: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 0 2 L 8 2 C 8.55 2 9 2.45 9 3 L 9 9 C 9 9.55 8.55 10 8 10 L 0 10 L 0 2 Z M 9 5 L 12 5 L 12 12 L 4 12 L 4 10',
    iconStroke: true,
  },
  // Language — navy pill + globe icon
  language: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 6 0 C 2.69 0 0 2.69 0 6 C 0 9.31 2.69 12 6 12 C 9.31 12 12 9.31 12 6 C 12 2.69 9.31 0 6 0 Z M 0 6 L 12 6 M 6 0 C 4 2.5 4 9.5 6 12 M 6 0 C 8 2.5 8 9.5 6 12',
    iconStroke: true,
  },
  // Time-Based Media — navy pill + play icon
  media: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 6 0 C 2.69 0 0 2.69 0 6 C 0 9.31 2.69 12 6 12 C 9.31 12 12 9.31 12 6 C 12 2.69 9.31 0 6 0 Z M 4.5 3.5 L 9 6 L 4.5 8.5 L 4.5 3.5 Z',
    iconStroke: true,
  },
  // Skip Navigation — navy pill + skip icon
  skipNav: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1 6 L 8 6 M 8 6 L 5 3 M 8 6 L 5 9 M 11 2 L 11 10',
    iconStroke: true,
  },
  // Page Title — navy pill + title icon
  pageTitle: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 2 2 L 10 2 M 6 2 L 6 10 M 4 10 L 8 10',
    iconStroke: true,
  },
  // Reduced Motion — navy pill + motion icon
  reducedMotion: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 1 6 C 2 3 4 1 6 1 C 8 1 10 3 11 6 C 10 9 8 11 6 11 C 4 11 2 9 1 6 Z M 0 0 L 12 12',
    iconStroke: true,
  },
  // Consistent Navigation — navy pill + nav icon
  consistentNav: {
    color: NAVY_COLOR,
    textColor: TEXT_WHITE,
    cornerRadius: 6,
    iconPath: 'M 0 2 L 12 2 M 0 6 L 12 6 M 0 10 L 8 10',
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

const CARD_SECTIONS: Record<string, string> = {
  focusIndicators: 'Focus Indicators',
  focusOrder: 'Focus Order',
  headings: 'Heading Hierarchy',
  headingHierarchy: 'Heading Hierarchy',
  landmarks: 'Landmarks',
  names: 'Accessible Names',
  accessibleNames: 'Accessible Names',
  altText: 'Alt-Text',
  aria: 'ARIA Roles & Attributes',
  ariaRoles: 'ARIA Roles & Attributes',
  keyboard: 'Keyboard Patterns',
  keyboardPatterns: 'Keyboard Patterns',
  dom: 'DOM Strategy',
  domStrategy: 'DOM Strategy',
  colorContrast: 'Color Contrast',
  forms: 'Forms',
  targetSize: 'Target Size',
  reflow: 'Reflow & Text Spacing',
  language: 'Language',
  media: 'Time-Based Media',
  skipNav: 'Skip Navigation',
  pageTitle: 'Page Title',
  reducedMotion: 'Reduced Motion',
  consistentNav: 'Consistent Navigation',
  autoRotationSimplified: 'Carousel (Simplified)',
  autoRotation: 'Carousel',
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
  autoRotation: 'Carousel accessibility: auto-rotation timing, pause triggers, resume behavior, slide ARIA roles, pagination keyboard patterns, and DOM strategy for inactive slides.',
  colorContrast: 'Text contrast (4.5:1 normal, 3:1 large per WCAG 1.4.3), non-text contrast (3:1 for UI components per WCAG 1.4.11), and focus indicator contrast (3:1 per WCAG 2.4.11).',
  forms: 'Form accessibility: visible labels (3.3.2), error identification (3.3.1), error suggestions (3.3.3), required field indicators, autocomplete attributes (1.3.5), and input grouping.',
  targetSize: 'Minimum interactive target sizes: 24x24 CSS pixels for desktop (WCAG 2.5.8). Touch targets should be 44x44px. Small targets can pass with 24px clear spacing.',
  reflow: 'Content must reflow without horizontal scrolling at 320px width (WCAG 1.4.10). Text spacing overrides must not cause content loss (WCAG 1.4.12). Text resizable to 200% (WCAG 1.4.4).',
  language: 'Page language declaration via html lang attribute (WCAG 3.1.1). Foreign-language text within the page must be wrapped with lang attribute (WCAG 3.1.2).',
  media: 'Captions for prerecorded video (WCAG 1.2.2), transcripts for audio-only content (WCAG 1.2.1), audio descriptions for visual-only video content (WCAG 1.2.5). No auto-playing audio.',
  skipNav: 'Skip navigation links to bypass repeated content blocks (WCAG 2.4.1). First focusable element on the page, hidden until focused, jumps to main content.',
  pageTitle: 'Descriptive page title in <title> element (WCAG 2.4.2). Format: Specific → General. Must update on SPA route changes. Unique across all pages.',
  reducedMotion: 'Non-essential animations must be disabled when prefers-reduced-motion: reduce is active (WCAG 2.3.3). No content flashing more than 3 times/second (WCAG 2.3.1).',
  consistentNav: 'Navigation mechanisms must appear in the same relative order across pages (WCAG 3.2.3). Same function must have same label across the site (WCAG 3.2.4).',
  voiceover: 'VoiceOver-specific behavior on iOS and macOS. Rotor actions, swipe gestures, announcement order, and any platform quirks.',
  talkback: 'TalkBack-specific behavior on Android. Touch exploration, gesture navigation, and any platform-specific announcements.',
  narrator: 'Narrator-specific behavior on Windows. Scan mode interactions, landmark navigation, and any platform quirks.',
  reactNative: 'React Native accessibility props: accessibilityLabel, accessibilityRole, accessibilityState, accessibilityActions, and platform bridging notes.',
  tvNote: 'TV platform accessibility: D-pad navigation, focus management, spatial navigation order, and remote control interactions.',
  generalNote: 'General accessibility notes that apply across all platforms. Live regions, announcements, and cross-platform behavior.',
  // Aliases — point to same descriptions as canonical keys
  headingHierarchy: 'The heading level structure (H1–H6) of the page. A correct hierarchy helps screen reader users navigate by section. There should be exactly one H1 per page.',
  accessibleNames: 'For sections or items that need a clear identifier, and either lack one, or whose meaning is not sufficiently explicit.\nExample: "Learn more" buttons, headerless accordion lists, icon-only controls.',
  ariaRoles: 'ARIA roles, states, and properties that communicate widget behavior to assistive technology. Use native HTML semantics first; add ARIA only when HTML falls short.',
  keyboardPatterns: 'Expected keyboard interactions for custom widgets. Standard patterns: Tab to navigate between widgets, arrow keys within composite widgets, Enter/Space to activate.',
  domStrategy: 'How the visual design maps to DOM structure. Reading order, semantic elements, skip links, and whether content is hidden vs removed from the DOM.',
  autoRotationSimplified: 'Carousel accessibility (simplified): auto-rotation timing, pause triggers, resume behavior, slide ARIA roles, pagination keyboard patterns.',
};

const loadedFonts = new Set<string>();

async function loadFonts() {
  // Regular is required — everything else is best-effort
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  loadedFonts.add('Regular');

  for (const style of ['Bold', 'Medium', 'Semi Bold'] as const) {
    try {
      await figma.loadFontAsync({ family: 'Inter', style });
      loadedFonts.add(style);
    } catch {
      // Font not available — createText will fall back to Regular
    }
  }
}

async function embedStructuralScan(node: SceneNode, parent: BaseNode & ChildrenMixin): Promise<void> {
  const scan = runStructuralScan(node);
  const json = JSON.stringify(scan);

  // Remove any existing scan node (direct children only — avoid expensive deep tree walk)
  for (const child of parent.children) {
    if (child.name === '.structural-scan' && child.type === 'TEXT') {
      child.remove();
      break;
    }
  }

  // Font must be loaded before setting characters on a TextNode
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  const scanNode = figma.createText();
  scanNode.name = '.structural-scan';
  scanNode.fontSize = 1;
  scanNode.characters = json;
  scanNode.opacity = 0;
  scanNode.locked = true;
  parent.appendChild(scanNode);
}

function createText(content: string, size: number, weight: 'Regular' | 'Bold' | 'Medium' | 'Semi Bold' = 'Regular', color?: RGB): TextNode {
  const text = figma.createText();
  const style = loadedFonts.has(weight) ? weight : 'Regular';
  text.fontName = { family: 'Inter', style };
  text.fontSize = size;
  text.characters = content;
  if (color) text.fills = [{ type: 'SOLID', color }];
  return text;
}

function createSectionFrame(title: string): FrameNode {
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

  const titleText = createText(title, 15, 'Bold', AI_COLOR);
  headerFrame.appendChild(titleText);

  const aiTag = createText('AI', 10, 'Medium', AI_COLOR);
  headerFrame.appendChild(aiTag);

  section.appendChild(headerFrame);
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

  const text = createText(`${index}`, 12, 'Semi Bold', textColor);
  badge.appendChild(text);

  // Add category icon if available
  if (categoryKey) {
    const icon = createCategoryIcon(categoryKey, textColor);
    if (icon) badge.appendChild(icon);
  }

  return badge;
}

function createDetailCard(sectionKey: string): FrameNode {
  const title = CARD_SECTIONS[sectionKey] || sectionKey;
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
  card.primaryAxisSizingMode = 'AUTO';
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
  const titleColor = groupTitle === 'Accessibility Notes' ? NAVY_COLOR : AI_COLOR;
  const titleText = createText(groupTitle, 15, 'Bold', titleColor);
  card.appendChild(titleText);

  // One sub-section per category
  for (const key of keys) {
    const title = CARD_SECTIONS[key] || key;
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

    const labelText = createText(title, 13, 'Semi Bold', TEXT_PRIMARY);
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
  categories: string[],
  options?: { grouped?: boolean },
): Promise<{ frameId: string; sections: string[] }> {
  await loadFonts();

  const sourceAbs = node.absoluteBoundingBox;
  if (!sourceAbs) throw new Error('Node has no bounding box');

  const page = figma.currentPage;

  // Clean up previous blueline output before generating new annotations
  const oldAnnotations = page.children.filter(n =>
    n.name === 'Accessibility Annotations' ||
    n.name === 'Blueline Cards' ||
    n.name === 'Tier 2 Cards' ||
    n.name === 'Focus Rectangle' ||
    n.name === '.structural-scan' ||
    (n.name === 'Badge' && n.type === 'FRAME' && n.width < 40)
  );
  for (const n of oldAnnotations) n.remove();

  // Use absolute coordinates — place everything directly on the page
  const sourceX = sourceAbs.x;
  const sourceY = sourceAbs.y;

  // All categories are AI-driven — the scaffold creates empty cards; Claude fills everything via bridge.
  const cardKeys = categories;

  if (cardKeys.length > 0) {
    const grouped = options?.grouped === true; // default to individual cards
    const NOTE_KEYS = new Set(['voiceover', 'talkback', 'narrator', 'reactNative', 'tvNote', 'generalNote']);
    const coreKeys = cardKeys.filter(k => !NOTE_KEYS.has(k));
    const noteKeys = cardKeys.filter(k => NOTE_KEYS.has(k));

    if (grouped) {
      // Grouped mode: one card per group with category sub-sections inside
      const outerContainer = figma.createFrame();
      outerContainer.name = 'Blueline Cards';
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
        coreCard.layoutSizingHorizontal = 'FILL';
      }

      if (noteKeys.length > 0) {
        const notesCard = createGroupedCard('Accessibility Notes', noteKeys);
        outerContainer.appendChild(notesCard);
        notesCard.layoutSizingHorizontal = 'FILL';
      }

      outerContainer.x = sourceX;
      outerContainer.y = sourceY + sourceAbs.height + CARDS_TOP_MARGIN;
      page.appendChild(outerContainer);
    } else {
      // Classic mode: individual card per category in a wrap layout
      const cardsContainer = figma.createFrame();
      cardsContainer.name = 'Blueline Cards';
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

      for (const key of cardKeys) {
        const card = createDetailCard(key);
        cardsContainer.appendChild(card);
      }

      cardsContainer.x = sourceX;
      cardsContainer.y = sourceY + sourceAbs.height + CARDS_TOP_MARGIN;
      page.appendChild(cardsContainer);
    }
  }

  // Embed structural scan data for Claude
  figma.ui.postMessage({ type: 'a11y-status', message: 'Running structural scan...' });
  await embedStructuralScan(node, page);

  // Zoom to show the annotation area
  figma.viewport.scrollAndZoomIntoView([node]);

  return { frameId: node.id, sections: categories };
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
  categories: string[],
): Promise<{ frameId: string; sections: string[]; sectionIds: string[] }> {
  await loadFonts();

  const sourceAbs = node.absoluteBoundingBox;
  if (!sourceAbs) throw new Error('Node has no bounding box');

  const page = figma.currentPage;

  const allPanels: string[] = [...categories];
  if (allPanels.length === 0) throw new Error('Select at least one option');

  // Detect focus order once (reused across panels)
  let focusEntries: FocusOrderEntry[] = [];
  if (categories.includes('focusOrder')) {
    focusEntries = detectFocusOrder(node);
  }

  // 3-column grid layout
  const startX = sourceAbs.x + sourceAbs.width + 200;
  const startY = sourceAbs.y;
  const sectionW = sourceAbs.width + PANEL_PAD * 2;
  const allSections: SceneNode[] = [];
  const sectionIds: string[] = [];

  // Wrap in try/catch to clean up orphaned sections on failure
  try {
    return await _generateBluelinePanelsInner();
  } catch (e) {
    // Remove any sections created before the failure
    for (const section of allSections) {
      try { section.remove(); } catch (_) {}
    }
    throw e;
  }

  async function _generateBluelinePanelsInner() {

  // Track row heights for grid positioning
  let col = 0;
  let rowY = startY;
  let rowMaxH = 0;

  for (const key of allPanels) {
    const title = CARD_SECTIONS[key] || key;

    // Create Figma Section
    const section = figma.createSection();
    section.name = `A11y ${title}`;

    // Clone the design frame
    const clone = node.clone();
    clone.name = node.name;
    clone.x = PANEL_PAD;
    clone.y = PANEL_PAD;
    section.appendChild(clone);

    // Apply visual annotations to the clone within this section
    if (key === 'focusIndicators') {
      await generateFocusIndicators(clone);
    }
    if (key === 'focusOrder' && focusEntries.length > 0) {
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

    // WCAG footer placeholder (filled later by RENDER_BLUELINE_PANELS)
    const footer = figma.createFrame();
    footer.name = 'WCAG Footer';
    footer.layoutMode = 'VERTICAL';
    footer.primaryAxisSizingMode = 'AUTO';
    footer.counterAxisSizingMode = 'FIXED';
    footer.resize(sourceAbs.width, 10);
    footer.fills = [];
    footer.paddingTop = 12;
    footer.paddingBottom = 12;
    footer.paddingLeft = 16;
    footer.paddingRight = 16;
    footer.itemSpacing = 4;
    footer.x = PANEL_PAD;
    footer.y = PANEL_PAD + sourceAbs.height + 20;
    section.appendChild(footer);

    // Resize section to fit clone + footer space
    const sectionH = PANEL_PAD + sourceAbs.height + 20 + 60 + PANEL_PAD;
    section.resizeWithoutConstraints(sectionW, sectionH);

    // Position in 3-column grid
    const panelX = startX + col * (sectionW + PANEL_GAP);
    section.x = panelX;
    section.y = rowY;

    page.appendChild(section);
    allSections.push(section);
    sectionIds.push(section.id);

    if (sectionH > rowMaxH) rowMaxH = sectionH;
    col++;
    if (col >= PANEL_COLS) {
      col = 0;
      rowY += rowMaxH + PANEL_GAP;
      rowMaxH = 0;
    }
  }

  // Embed structural scan data for Claude
  figma.ui.postMessage({ type: 'a11y-status', message: 'Running structural scan...' });
  await embedStructuralScan(node, page);

  // Zoom to show all panels
  figma.viewport.scrollAndZoomIntoView(allSections);

  return { frameId: node.id, sections: categories, sectionIds };
  } // end _generateBluelinePanelsInner
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
