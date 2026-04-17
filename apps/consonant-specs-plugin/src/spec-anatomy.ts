import { figmaColorToHex, getNodeFills, getNodeStrokes, getTextProps, getCornerRadius, getEffects, getAutoLayoutProps } from './utils';
import { matchColor, matchS2ATextStyle, matchRadius, detectNodeColorRole } from './tokens';

// Waiver: annotation text uses manual fontName — these are spec overlays, not themed UI
// ─── Constants ────────────────────────────────────────────────────────────────

const MARKER_COLOR: RGB = { r: 0.09, g: 0.60, b: 0.97 };    // #1899F9 blue
const DOT_SIZE = 24;
const DOT_FONT_SIZE = 12;

const ICON_COLOR: RGB = { r: 0.42, g: 0.42, b: 0.42 };      // #6B6B6B
const ICON_SIZE = 20;

const TOKEN_PILL_BG: RGB = { r: 1, g: 1, b: 1 };             // transparent/white (no bg)
const TOKEN_PILL_TEXT: RGB = { r: 0.09, g: 0.47, b: 0.82 };  // #1778D2 blue (Spectral style)

const CONTENT_BG: RGB = { r: 0.95, g: 0.95, b: 0.95 };      // #F2F2F2
const CONTENT_RADIUS = 12;

const HEADER_FONT_SIZE = 16;
const PROP_FONT_SIZE = 12;
const LABEL_WIDTH = 144;
const CARD_GAP = 24;
const ROW_GAP = 4;
const SECTION_TITLE_SIZE = 48;
const EXHIBIT_GAP = 64;
const CONTENT_RAIL_WIDTH = 500;

const BLACK: RGB = { r: 0, g: 0, b: 0 };
const TITLE_COLOR: RGB = { r: 0.1, g: 0.1, b: 0.1 };

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface AnatomyEntry {
  index: number;
  node: SceneNode;
  name: string;
  type: string;
}

// ─── Element Collection (deduplicated) ────────────────────────────────────────

async function collectSignificantNodes(node: SceneNode, entries: AnatomyEntry[], seen: Set<string>, depth: number = 0): Promise<void> {
  if (depth > 0) {
    // For text nodes, include fontSize in the dedup key so same-named nodes
    // with different styles (e.g. "Type" as eyebrow vs heading) each get annotated
    let key = `${node.name}::${node.type}`;
    if (node.type === 'TEXT') {
      const fontSize = (node as TextNode).fontSize;
      key += `::${fontSize !== figma.mixed ? fontSize : 0}`;
    }
    if (!seen.has(key)) {
      // Match Spectral's filtering: only TEXT and meaningful INSTANCE nodes.
      // Skip vectors, tiles, raw shapes, and structural containers.
      let isSignificant = false;

      // Skip hidden or fully transparent nodes
      if ('visible' in node && !(node as any).visible) return;
      if ('opacity' in node && (node as any).opacity === 0) return;

      if (node.type === 'TEXT') {
        isSignificant = true;
      } else if ((node.type === 'FRAME' || node.type === 'COMPONENT') && await isCallToAction(node)) {
        // Named button/CTA frames (e.g. "Button", "CTA / Primary")
        isSignificant = true;
      } else if (node.type === 'INSTANCE') {
        // Only include instances that are substantial components (not tiny icons/tiles).
        // Spectral shows component thumbnails for app icons, buttons, etc.
        // Skip instances smaller than 20x20 (decorative icons).
        const w = (node as any).width ?? 0;
        const h = (node as any).height ?? 0;
        if (w >= 20 && h >= 20) {
          // Deduplicate by base component name (strip variant suffix)
          const baseName = node.name.replace(/\s*\/\s*(Primary|Secondary|Tertiary|Dark|Light|Default|Hover|Pressed|Disabled).*$/i, '');
          const instanceKey = `instance::${baseName}`;
          if (!seen.has(instanceKey)) {
            seen.add(instanceKey);
            isSignificant = true;
          }
        }
      }
      // Skip VECTOR, RECTANGLE, LINE, ELLIPSE — Spectral doesn't annotate these

      if (isSignificant) {
        seen.add(key);
        entries.push({
          index: entries.length + 1,
          node,
          name: node.name,
          type: node.type,
        });
      }
    }
  }
  if ('children' in node && depth < 10) {
    for (const child of node.children) {
      // Skip hidden/invisible nodes
      if ('visible' in child && !(child as any).visible) continue;
      // Skip fully transparent nodes
      if ('opacity' in child && (child as any).opacity === 0) continue;
      await collectSignificantNodes(child, entries, seen, depth + 1);
    }
  }
}

// ─── Type Icons ───────────────────────────────────────────────────────────────

function getTypeIcon(type: string): string {
  switch (type) {
    case 'FRAME': return '⊞';
    case 'TEXT': return 'T';
    case 'INSTANCE': return '◈';
    case 'COMPONENT': return '◆';
    case 'VECTOR': return '∿';
    case 'RECTANGLE': return '□';
    case 'ELLIPSE': return '○';
    case 'GROUP': return '⊟';
    default: return '·';
  }
}

// ─── Token Pill ───────────────────────────────────────────────────────────────

function createTokenPill(tokenName: string, parent: FrameNode): void {
  const pill = figma.createFrame();
  pill.name = 'token-pill';
  pill.layoutMode = 'HORIZONTAL';
  pill.primaryAxisSizingMode = 'AUTO';
  pill.counterAxisSizingMode = 'AUTO';
  pill.fills = [];
  pill.cornerRadius = 0;
  pill.paddingTop = 0;
  pill.paddingBottom = 0;
  pill.paddingLeft = 0;
  pill.paddingRight = 0;

  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Regular' };
  text.fontSize = PROP_FONT_SIZE;
  text.characters = tokenName;
  text.fills = [{ type: 'SOLID', color: TOKEN_PILL_TEXT }];
  pill.appendChild(text);

  parent.appendChild(pill);
}

// ─── Property Row ─────────────────────────────────────────────────────────────

function addPropRow(parent: FrameNode, label: string, value: string, options?: { bold?: boolean; tokenPill?: string }): void {
  const row = figma.createFrame();
  row.name = `prop-${label}`;
  row.layoutMode = 'HORIZONTAL';
  row.primaryAxisSizingMode = 'AUTO';
  row.counterAxisSizingMode = 'AUTO';
  row.fills = [];
  row.itemSpacing = 6;

  const labelText = figma.createText();
  labelText.fontName = { family: 'Inter', style: 'Regular' };
  labelText.fontSize = PROP_FONT_SIZE;
  labelText.characters = label;
  labelText.fills = [{ type: 'SOLID', color: BLACK }];
  labelText.resize(LABEL_WIDTH, labelText.height);
  labelText.textAutoResize = 'HEIGHT';
  row.appendChild(labelText);

  if (options?.tokenPill) {
    createTokenPill(options.tokenPill, row);
  } else {
    const valueText = figma.createText();
    valueText.fontName = { family: 'Inter', style: options?.bold ? 'Bold' : 'Regular' };
    valueText.fontSize = PROP_FONT_SIZE;
    valueText.characters = value;
    valueText.fills = [{ type: 'SOLID', color: BLACK }];
    row.appendChild(valueText);
  }

  parent.appendChild(row);
}

// ─── Call-to-Action Detection ─────────────────────────────────────────────────

const CTA_NAME_PATTERNS = /\b(cta|call[\s\-_]?to[\s\-_]?action|button|btn|link|action)\b/i;

async function isCallToAction(node: SceneNode): Promise<boolean> {
  if (CTA_NAME_PATTERNS.test(node.name)) return true;

  // Walk up 3 parents checking name
  let p: BaseNode | null = node.parent;
  for (let i = 0; i < 3 && p; i++) {
    if ('name' in p && CTA_NAME_PATTERNS.test((p as any).name)) return true;
    p = p.parent;
  }

  if (node.type === 'INSTANCE') {
    const mc = await (node as InstanceNode).getMainComponentAsync();
    const mainName = mc?.name || '';
    const parentName = mc?.parent?.name || '';
    if (CTA_NAME_PATTERNS.test(mainName) || CTA_NAME_PATTERNS.test(parentName)) return true;
  }

  if (node.type === 'TEXT') {
    const t = node as TextNode;
    const chars = t.characters || '';

    // 1. Chevron/arrow suffix in characters
    if (/[›»→>]\s*$/.test(chars.trim()) && chars.length < 60) return true;

    // 2. Underlined short text (link style)
    if (t.textDecoration === 'UNDERLINE' && chars.length < 60) return true;

    // 3. Parent is a small horizontal auto-layout frame with a vector/instance sibling
    //    (e.g. "Explore Firefly ›" where the chevron is a separate icon node)
    const parent = t.parent as any;
    if (parent && (parent.type === 'FRAME' || parent.type === 'GROUP' || parent.type === 'INSTANCE' || parent.type === 'COMPONENT')) {
      if (parent.layoutMode === 'HORIZONTAL' && parent.children && parent.children.length >= 2 && chars.length < 80) {
        for (const sib of parent.children) {
          if (sib === t) continue;
          if (sib.type === 'VECTOR' || sib.type === 'INSTANCE' || sib.type === 'BOOLEAN_OPERATION') {
            // Size filter — small icon next to short text
            if ((sib.width ?? 0) <= 40 && (sib.height ?? 0) <= 40) return true;
          }
        }
      }
    }
  }

  return false;
}

function findFirstTextChild(node: SceneNode): TextNode | null {
  if (node.type === 'TEXT') return node as TextNode;
  if ('children' in node) {
    for (const child of (node as any).children) {
      const found = findFirstTextChild(child);
      if (found) return found;
    }
  }
  return null;
}

async function addCtaProperties(node: InstanceNode, content: FrameNode): Promise<void> {
  // Label
  const label = findFirstTextChild(node);
  if (label) {
    addPropRow(content, 'Label:', `"${label.characters}"`, { bold: true });
  }

  // Variant / component name
  const mc = await node.getMainComponentAsync();
  const mainName = mc?.name;
  if (mainName) {
    addPropRow(content, 'Component:', mainName);
  }

  // Size
  addPropRow(content, 'Width:', `${Math.round(node.width)}`);
  addPropRow(content, 'Height:', `${Math.round(node.height)}`);

  // Background fill
  const fills = getNodeFills(node);
  const anatFillRole = detectNodeColorRole(node, 'fill');
  for (const fill of fills) {
    const colorToken = matchColor(fill.hex, anatFillRole);
    if (colorToken) {
      addPropRow(content, 'Background:', '', { tokenPill: colorToken });
    } else {
      addPropRow(content, 'Background:', fill.hex.toUpperCase());
    }
  }

  // Border
  const strokes = getNodeStrokes(node);
  for (const stroke of strokes) {
    const strokeToken = matchColor(stroke.hex, 'border');
    if (strokeToken) {
      addPropRow(content, 'Border color:', '', { tokenPill: strokeToken });
    } else {
      addPropRow(content, 'Border color:', stroke.hex.toUpperCase());
    }
    addPropRow(content, 'Border weight:', `${stroke.weight}`);
  }

  // Corner radius
  const radius = getCornerRadius(node);
  if (radius !== '0') {
    const radiusToken = matchRadius(radius.replace('px', ''));
    if (radiusToken) {
      addPropRow(content, 'Border radius:', '', { tokenPill: radiusToken });
    } else {
      addPropRow(content, 'Border radius:', radius);
    }
  }

  // Auto-layout / padding
  const auto = getAutoLayoutProps(node);
  if (auto) {
    if (auto.paddingTop === auto.paddingBottom && auto.paddingLeft === auto.paddingRight && auto.paddingTop === auto.paddingLeft) {
      addPropRow(content, 'Padding:', `${auto.paddingTop}`);
    } else {
      addPropRow(content, 'Padding:', `${auto.paddingTop} ${auto.paddingRight} ${auto.paddingBottom} ${auto.paddingLeft}`);
    }
    if (auto.gap) {
      addPropRow(content, 'Gap:', `${auto.gap}`);
    }
  }

  // Label typography
  if (label) {
    const tp = getTextProps(label);
    if (tp) {
      addPropRow(content, 'Font family:', tp.fontFamily);
      addPropRow(content, 'Font weight:', `${tp.fontWeight}`);
      addPropRow(content, 'Font size:', `${tp.fontSize}`);
      const labelFills = getNodeFills(label);
      for (const f of labelFills) {
        const tok = matchColor(f.hex, 'content');
        if (tok) {
          addPropRow(content, 'Text color:', '', { tokenPill: tok });
        } else {
          addPropRow(content, 'Text color:', f.hex.toUpperCase());
        }
      }
    }
  }

  // Effects (shadows, etc.)
  const effects = getEffects(node);
  for (const effect of effects) {
    addPropRow(content, `${effect.type}:`, effect.description);
  }
}

// ─── Type-Driven Property Builder ─────────────────────────────────────────────

async function buildPropertiesForNode(node: SceneNode, content: FrameNode): Promise<void> {
  // CTA frames/components route to dedicated handler (before type switch)
  if ((node.type === 'FRAME' || node.type === 'COMPONENT') && await isCallToAction(node)) {
    await addCtaProperties(node as any, content);
    return;
  }

  switch (node.type) {
    case 'TEXT': {
      const text = getTextProps(node);
      if (!text) break;

      // Text preview — render using the ACTUAL font from the design
      const preview = figma.createFrame();
      preview.name = 'text-preview';
      preview.layoutMode = 'VERTICAL';
      preview.primaryAxisSizingMode = 'AUTO';
      preview.counterAxisSizingMode = 'FIXED';
      preview.resize(CONTENT_RAIL_WIDTH - 32, 1);
      preview.fills = [];
      preview.paddingTop = 12;
      preview.paddingBottom = 16;
      preview.paddingLeft = 4;
      preview.paddingRight = 4;

      // Use the actual font from the source node
      const srcFont = (node as TextNode).fontName as FontName;
      const srcSize = text.fontSize;
      // Cap preview size between 14-36px for readability
      const previewSize = Math.min(36, Math.max(14, srcSize));

      let fontLoaded = false;
      try {
        await figma.loadFontAsync(srcFont);
        fontLoaded = true;
      } catch (_) {
        // Fallback to Inter if the design font isn't available
      }

      const previewText = figma.createText();
      previewText.fontName = fontLoaded ? srcFont : { family: 'Inter', style: 'Bold' };
      previewText.fontSize = previewSize;
      previewText.characters = (node as TextNode).characters.substring(0, 80);
      previewText.fills = [{ type: 'SOLID', color: BLACK }];
      previewText.textAutoResize = 'HEIGHT';
      preview.appendChild(previewText);
      previewText.layoutSizingHorizontal = 'FILL';
      content.appendChild(preview);

      // Attributes area
      const attrs = figma.createFrame();
      attrs.name = 'attributes';
      attrs.layoutMode = 'VERTICAL';
      attrs.primaryAxisSizingMode = 'AUTO';
      attrs.counterAxisSizingMode = 'AUTO';
      attrs.fills = [];
      attrs.itemSpacing = ROW_GAP;

      // Always show full typography — Text style (if token), then all font props
      const token = matchS2ATextStyle(node);
      // Extract the last segment of the token path for display (e.g. "body-md" from "s2a/typography/body-md")
      const tokenLabel = token ? token.split('/').pop()! : null;

      if (token) {
        addPropRow(attrs, 'Text style', '', { tokenPill: token });
      }
      addPropRow(attrs, 'Font family', '', { tokenPill: text.fontFamily });
      addPropRow(attrs, 'Font style', '', { tokenPill: `${text.fontWeight === 700 ? 'Bold' : text.fontWeight === 900 ? 'Black' : 'Regular'}` });
      addPropRow(attrs, 'Font size', '', { tokenPill: tokenLabel || `${text.fontSize}` });
      addPropRow(attrs, 'Line height', '', { tokenPill: tokenLabel || `${text.lineHeight}` });
      addPropRow(attrs, 'Letter spacing', '', { tokenPill: tokenLabel || `${text.letterSpacing}` });

      content.appendChild(attrs);

      // If this text is a CTA, append CTA-specific info (parent button bg, etc.)
      if (await isCallToAction(node)) {
        addPropRow(content, 'Role:', 'Call to action', { bold: true });
        const parent = node.parent;
        if (parent && parent.type === 'FRAME') {
          const parentFills = getNodeFills(parent as any);
          for (const f of parentFills) {
            const tok = matchColor(f.hex, 'background');
            if (tok) addPropRow(content, 'Button bg:', '', { tokenPill: tok });
            else addPropRow(content, 'Button bg:', f.hex.toUpperCase());
          }
          const pr = getCornerRadius(parent as any);
          if (pr !== '0') {
            const rt = matchRadius(pr.replace('px', ''));
            if (rt) addPropRow(content, 'Button radius:', '', { tokenPill: rt });
            else addPropRow(content, 'Button radius:', pr);
          }
        }
      }

      return; // Early return — we built content directly
    }

    case 'INSTANCE': {
      // Small thumbnail clone
      const thumb = figma.createFrame();
      thumb.name = 'thumbnail';
      thumb.layoutMode = 'HORIZONTAL';
      thumb.primaryAxisSizingMode = 'AUTO';
      thumb.counterAxisSizingMode = 'AUTO';
      thumb.fills = [{ type: 'SOLID', color: CONTENT_BG }];
      thumb.paddingTop = 8;
      thumb.paddingBottom = 8;
      thumb.paddingLeft = 8;
      thumb.paddingRight = 8;

      try {
        const instanceClone = node.clone();
        const maxThumbW = 360;
        if (instanceClone.width > maxThumbW) {
          const s = maxThumbW / instanceClone.width;
          instanceClone.rescale(s);
        }
        instanceClone.x = 0;
        instanceClone.y = 0;
        thumb.appendChild(instanceClone);
      } catch (_) {
        // If clone fails, just skip thumbnail
      }
      content.appendChild(thumb);

      // CTA detection: buttons, links, call-to-action components
      if (await isCallToAction(node)) {
        await addCtaProperties(node as InstanceNode, content);
      }
      return;
    }

    case 'VECTOR':
    case 'LINE': {
      addPropRow(content, 'Height:', `${Math.round(node.height)}`);
      addPropRow(content, 'Width:', `${Math.round(node.width)}`);

      const strokes = getNodeStrokes(node);
      for (const stroke of strokes) {
        addPropRow(content, 'Border color:', stroke.hex.toUpperCase());
        addPropRow(content, 'Border weight:', `${stroke.weight}`);
      }
      if ('strokeAlign' in node) {
        addPropRow(content, 'Stroke alignment:', node.strokeAlign as string);
      }

      if (node.width > 0 && node.height > 0) {
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const w = Math.round(node.width);
        const h = Math.round(node.height);
        const d = gcd(w, h);
        addPropRow(content, 'Aspect ratio:', `${w / d}:${h / d}`);
      }
      break;
    }

    default: {
      if (node.width > 0) addPropRow(content, 'Width:', `${Math.round(node.width)}`);
      if (node.height > 0) addPropRow(content, 'Height:', `${Math.round(node.height)}`);

      const fills = getNodeFills(node);
      const defaultFillRole = detectNodeColorRole(node, 'fill');
      for (const fill of fills) {
        const colorToken = matchColor(fill.hex, defaultFillRole);
        if (colorToken) {
          addPropRow(content, 'Background color:', '', { tokenPill: colorToken });
        } else {
          addPropRow(content, 'Background color:', fill.hex.toUpperCase());
        }
      }

      const radius = getCornerRadius(node);
      if (radius !== '0') {
        const radiusToken = matchRadius(radius.replace('px', ''));
        if (radiusToken) {
          addPropRow(content, 'Border radius:', '', { tokenPill: radiusToken });
        } else {
          addPropRow(content, 'Border radius:', radius);
        }
      }

      const isImage = node.name.toLowerCase().includes('image') || node.name.toLowerCase().includes('asset');
      if (isImage && node.width > 0 && node.height > 0) {
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const w = Math.round(node.width);
        const h = Math.round(node.height);
        const d = gcd(w, h);
        addPropRow(content, 'Aspect ratio:', `${w / d}:${h / d}`);
      }

      const effects = getEffects(node);
      for (const effect of effects) {
        addPropRow(content, `${effect.type}:`, effect.description);
      }
      break;
    }
  }
}

// ─── Card Builder ─────────────────────────────────────────────────────────────

async function buildAnatomyCard(entry: AnatomyEntry): Promise<FrameNode> {
  const card = figma.createFrame();
  card.name = `anatomy-${entry.index}`;
  card.layoutMode = 'VERTICAL';
  card.primaryAxisSizingMode = 'AUTO';
  card.counterAxisSizingMode = 'AUTO';
  card.fills = [];
  card.itemSpacing = 8;

  // Header: numbered blue dot + element name (Spectral style)
  const header = figma.createFrame();
  header.name = 'header';
  header.layoutMode = 'HORIZONTAL';
  header.primaryAxisSizingMode = 'AUTO';
  header.counterAxisSizingMode = 'AUTO';
  header.fills = [];
  header.itemSpacing = 8;
  header.counterAxisAlignItems = 'CENTER';

  const dot = figma.createFrame();
  dot.name = `dot-${entry.index}`;
  dot.resize(DOT_SIZE, DOT_SIZE);
  dot.cornerRadius = DOT_SIZE / 2;
  dot.fills = [{ type: 'SOLID', color: MARKER_COLOR }];
  dot.layoutMode = 'HORIZONTAL';
  dot.primaryAxisSizingMode = 'FIXED';
  dot.counterAxisSizingMode = 'FIXED';
  dot.primaryAxisAlignItems = 'CENTER';
  dot.counterAxisAlignItems = 'CENTER';

  const dotText = figma.createText();
  dotText.fontName = { family: 'Inter', style: 'Bold' };
  dotText.fontSize = DOT_FONT_SIZE;
  dotText.characters = `${entry.index}`;
  dotText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  dot.appendChild(dotText);
  header.appendChild(dot);

  const nameText = figma.createText();
  nameText.fontName = { family: 'Inter', style: 'Bold' };
  nameText.fontSize = HEADER_FONT_SIZE;
  nameText.characters = entry.name;
  nameText.fills = [{ type: 'SOLID', color: BLACK }];
  header.appendChild(nameText);

  card.appendChild(header);

  // Content area with properties
  const content = figma.createFrame();
  content.name = 'content';
  content.layoutMode = 'VERTICAL';
  content.primaryAxisSizingMode = 'AUTO';
  content.counterAxisSizingMode = 'AUTO';
  content.fills = [{ type: 'SOLID', color: CONTENT_BG }];
  content.cornerRadius = CONTENT_RADIUS;
  content.paddingTop = 12;
  content.paddingBottom = 12;
  content.paddingLeft = 16;
  content.paddingRight = 16;
  content.itemSpacing = ROW_GAP;

  await buildPropertiesForNode(entry.node, content);

  card.appendChild(content);

  return card;
}

// ─── Marker System ────────────────────────────────────────────────────────────

function createMarkerDot(index: number, x: number, y: number, parent: FrameNode): void {
  const dot = figma.createFrame();
  dot.name = `marker-${index}`;
  dot.resize(DOT_SIZE, DOT_SIZE);
  dot.cornerRadius = DOT_SIZE / 2;
  dot.fills = [{ type: 'SOLID', color: MARKER_COLOR }];
  dot.layoutMode = 'HORIZONTAL';
  dot.primaryAxisSizingMode = 'FIXED';
  dot.counterAxisSizingMode = 'FIXED';
  dot.primaryAxisAlignItems = 'CENTER';
  dot.counterAxisAlignItems = 'CENTER';
  dot.x = x;
  dot.y = y;

  const text = figma.createText();
  text.fontName = { family: 'Inter', style: 'Bold' };
  text.fontSize = DOT_FONT_SIZE;
  text.characters = `${index}`;
  text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  dot.appendChild(text);

  parent.appendChild(dot);
}

function createMarkerLine(x1: number, y1: number, x2: number, y2: number, parent: FrameNode): void {
  const line = figma.createRectangle();
  line.name = 'marker-line';

  const startX = Math.min(x1, x2);
  const width = Math.abs(x2 - x1);
  line.resize(Math.max(width, 1), 1);
  line.x = startX;
  line.y = y1;

  line.fills = [{ type: 'SOLID', color: MARKER_COLOR }];
  parent.appendChild(line);
}

// ─── Section Generator ────────────────────────────────────────────────────────

export async function generateAnatomySection(sourceNode: SceneNode): Promise<FrameNode> {
  // Ensure fonts are loaded (idempotent — cached after first call)
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  const section = figma.createFrame();
  section.name = 'Anatomy';
  section.layoutMode = 'VERTICAL';
  section.primaryAxisSizingMode = 'AUTO';
  section.counterAxisSizingMode = 'AUTO';
  section.fills = [];
  section.itemSpacing = CARD_GAP;

  // Section title
  const title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = SECTION_TITLE_SIZE;
  title.characters = 'Anatomy';
  title.fills = [{ type: 'SOLID', color: TITLE_COLOR }];
  section.appendChild(title);

  // Exhibit: artwork (left) + content rail (right)
  const exhibit = figma.createFrame();
  exhibit.name = 'anatomy-exhibit';
  exhibit.layoutMode = 'HORIZONTAL';
  exhibit.primaryAxisSizingMode = 'AUTO';
  exhibit.counterAxisSizingMode = 'AUTO';
  exhibit.fills = [];
  exhibit.itemSpacing = EXHIBIT_GAP;

  // Left: 1:1 clone with markers
  const artworkContainer = figma.createFrame();
  artworkContainer.name = 'artwork';
  artworkContainer.clipsContent = false;
  artworkContainer.fills = [{ type: 'SOLID', color: CONTENT_BG }];
  artworkContainer.cornerRadius = 8;
  artworkContainer.paddingTop = 40;
  artworkContainer.paddingBottom = 40;
  artworkContainer.paddingLeft = 40;
  artworkContainer.paddingRight = 40;

  const clone = sourceNode.clone();
  artworkContainer.appendChild(clone);
  clone.x = 40;
  clone.y = 40;
  artworkContainer.resize(clone.width + 80, clone.height + 80);

  // Collect elements and add markers to artwork
  const rawEntries: AnatomyEntry[] = [];
  const seen = new Set<string>();
  await collectSignificantNodes(sourceNode, rawEntries, seen);

  // Sort: plain text first, then CTAs, then instances/media (each by Y position)
  const byY = (a: AnatomyEntry, b: AnatomyEntry) =>
    a.node.absoluteTransform[1][2] - b.node.absoluteTransform[1][2];
  // Pre-compute CTA status for each entry (async)
  const ctaFlags = new Map<SceneNode, boolean>();
  for (const e of rawEntries) {
    ctaFlags.set(e.node, await isCallToAction(e.node));
  }
  const textEntries = rawEntries
    .filter(e => e.type === 'TEXT' && !ctaFlags.get(e.node))
    .sort(byY);
  // CTAs — dedupe by the label's font styling signature.
  // Works for TEXT CTAs and for FRAME/COMPONENT/INSTANCE CTAs (using their inner text).
  const ctaSeen = new Set<string>();
  const ctaSignature = (n: SceneNode): string | null => {
    const label: TextNode | null =
      n.type === 'TEXT' ? (n as TextNode) : findFirstTextChild(n);
    if (!label) return null;
    const tp = getTextProps(label);
    if (!tp) return null;
    const fills = getNodeFills(label);
    const colorHex = fills[0]?.hex ?? '';
    return `${tp.fontFamily}|${tp.fontWeight}|${tp.fontSize}|${label.textDecoration}|${colorHex}`;
  };
  const ctaEntries = rawEntries
    .filter(e => ctaFlags.get(e.node))
    .sort(byY)
    .filter(e => {
      const sig = ctaSignature(e.node);
      if (!sig) return true;
      if (ctaSeen.has(sig)) return false;
      ctaSeen.add(sig);
      return true;
    });
  // Collect names of text nodes already in entries, so we can skip wrapper instances
  const textNames = new Set(textEntries.map(e => e.name));
  const instanceEntries = rawEntries
    .filter(e => e.type === 'INSTANCE' && !ctaFlags.get(e.node))
    .filter(e => {
      // Skip instances that are just wrappers around already-annotated text children
      if ('children' in e.node) {
        const children = (e.node as any).children as SceneNode[];
        const hasAnnotatedTextChild = children.some((c: SceneNode) =>
          c.type === 'TEXT' && textNames.has(c.name)
        );
        if (hasAnnotatedTextChild) return false;
      }
      return true;
    })
    .sort(byY);
  const entries = [...textEntries, ...ctaEntries, ...instanceEntries].map((e, i) => ({
    ...e,
    index: i + 1,
  }));

  // Collect dot positions first, then resolve collisions before drawing
  const dotPositions: Array<{ index: number; x: number; y: number; altX: number; altY: number; flipped: boolean }> = [];

  for (const entry of entries) {
    const entryNode = entry.node;
    const relX = entryNode.absoluteTransform[0][2] - sourceNode.absoluteTransform[0][2];
    const relY = entryNode.absoluteTransform[1][2] - sourceNode.absoluteTransform[1][2];
    const w = entryNode.width;
    const h = entryNode.height;

    let dotX: number;
    let dotY: number;
    let altX: number; // alternate position (right side for text, offset for others)
    let altY: number;
    if (entryNode.type === 'TEXT') {
      const t = entryNode as TextNode;
      const align = t.textAlignHorizontal;
      const centerY = relY + h / 2;
      // Estimate actual rendered text width (avg char width ≈ 0.55 × fontSize)
      const fontSize = t.fontSize !== figma.mixed ? (t.fontSize as number) : 14;
      const estTextWidth = Math.min(t.characters.length * fontSize * 0.55, w);
      if (align === 'CENTER') {
        dotX = relX - DOT_SIZE - 2;
        dotY = relY + h / 2 - DOT_SIZE / 2;
        altX = relX + (w + estTextWidth) / 2 + 2;
        altY = dotY;
      } else if (align === 'RIGHT') {
        dotX = relX + w - DOT_SIZE - 2;
        dotY = centerY - DOT_SIZE / 2;
        altX = relX - DOT_SIZE - 2;
        altY = dotY;
      } else {
        // LEFT / JUSTIFIED — default left, alt right of actual text
        dotX = relX - DOT_SIZE - 2;
        dotY = centerY - DOT_SIZE / 2;
        altX = relX + estTextWidth + 4;
        altY = dotY;
      }
    } else {
      dotX = relX + 4;
      dotY = relY + 4;
      altX = relX + w - DOT_SIZE - 4;
      altY = relY + 4;
    }

    dotPositions.push({ index: entry.index, x: dotX + 40, y: dotY + 40, altX: altX + 40, altY: altY + 40, flipped: false });
  }

  // Resolve collisions: if markers overlap, flip the later one to its alternate position
  const minDist = DOT_SIZE + 4;
  function getPos(p: typeof dotPositions[0]) {
    return { x: p.flipped ? p.altX : p.x, y: p.flipped ? p.altY : p.y };
  }
  function overlaps(b: typeof dotPositions[0]): boolean {
    const bp = getPos(b);
    for (const a of dotPositions) {
      if (a === b) continue;
      const ap = getPos(a);
      const dx = bp.x - ap.x;
      const dy = bp.y - ap.y;
      if (Math.sqrt(dx * dx + dy * dy) < minDist) return true;
    }
    return false;
  }
  for (let i = 0; i < dotPositions.length; i++) {
    if (overlaps(dotPositions[i])) {
      dotPositions[i].flipped = true;
    }
  }

  for (const pos of dotPositions) {
    const finalX = pos.flipped ? pos.altX : pos.x;
    const finalY = pos.flipped ? pos.altY : pos.y;
    createMarkerDot(pos.index, finalX, finalY, artworkContainer);
  }

  exhibit.appendChild(artworkContainer);

  // Right: content rail with cards
  const contentRail = figma.createFrame();
  contentRail.name = 'content-rail';
  contentRail.layoutMode = 'VERTICAL';
  contentRail.counterAxisSizingMode = 'FIXED';
  contentRail.resize(CONTENT_RAIL_WIDTH, 1);
  contentRail.primaryAxisSizingMode = 'AUTO';
  contentRail.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  contentRail.itemSpacing = CARD_GAP;
  contentRail.paddingTop = 16;
  contentRail.paddingBottom = 16;
  contentRail.paddingLeft = 16;
  contentRail.paddingRight = 16;

  for (const entry of entries) {
    const card = await buildAnatomyCard(entry);
    contentRail.appendChild(card);
  }

  exhibit.appendChild(contentRail);
  section.appendChild(exhibit);

  return section;
}
