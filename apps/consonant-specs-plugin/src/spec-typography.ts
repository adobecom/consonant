// Waiver: annotation text uses manual fontName — these are spec overlays, not themed UI
import { getTextProps } from './utils';
import { matchTypography } from './tokens';

interface TypographyEntry {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: string;
  letterSpacing: string;
  token: string | null;
  usedBy: string[];
}

function collectTextStyles(node: SceneNode, styles: Map<string, TypographyEntry>): void {
  const text = getTextProps(node);
  if (text) {
    const key = `${text.fontFamily}-${text.fontSize}-${text.fontWeight}-${text.lineHeight}`;
    const existing = styles.get(key);
    if (existing) {
      if (!existing.usedBy.includes(node.name)) {
        existing.usedBy.push(node.name);
      }
    } else {
      styles.set(key, {
        fontFamily: text.fontFamily,
        fontSize: text.fontSize,
        fontWeight: text.fontWeight,
        lineHeight: text.lineHeight,
        letterSpacing: text.letterSpacing,
        token: matchTypography(text.fontFamily) || matchTypography(`${text.fontSize}`),
        usedBy: [node.name],
      });
    }
  }

  if ('children' in node) {
    for (const child of node.children) {
      collectTextStyles(child, styles);
    }
  }
}

const LABEL_COLOR: RGB = { r: 0.45, g: 0.45, b: 0.45 };
const VALUE_COLOR: RGB = { r: 0.15, g: 0.15, b: 0.15 };
const TOKEN_COLOR: RGB = { r: 0.18, g: 0.62, b: 0.47 };
const HEADER_BG: RGB = { r: 0.95, g: 0.95, b: 0.95 };
const ROW_FONT_SIZE = 10;

function createTableHeader(parent: FrameNode): void {
  const row = figma.createFrame();
  row.name = 'header-row';
  row.layoutMode = 'HORIZONTAL';
  row.primaryAxisSizingMode = 'FIXED';
  row.counterAxisSizingMode = 'AUTO';
  row.resize(800, 1);
  row.layoutAlign = 'STRETCH';
  row.fills = [{ type: 'SOLID', color: HEADER_BG }];
  row.paddingTop = 6;
  row.paddingBottom = 6;
  row.paddingLeft = 8;
  row.paddingRight = 8;
  row.itemSpacing = 0;

  const columns = ['Font Family', 'Size', 'Weight', 'Line Height', 'Letter Sp.', 'Token', 'Used By'];
  const widths = [140, 50, 55, 75, 70, 160, 250];

  for (let i = 0; i < columns.length; i++) {
    const cell = figma.createText();
    cell.fontName = { family: 'Inter', style: 'Bold' };
    cell.fontSize = ROW_FONT_SIZE;
    cell.characters = columns[i];
    cell.fills = [{ type: 'SOLID', color: LABEL_COLOR }];
    cell.textAutoResize = 'HEIGHT';
    row.appendChild(cell);
    cell.layoutSizingHorizontal = 'FIXED';
    cell.resize(widths[i], cell.height);
  }

  parent.appendChild(row);
}

function createTableRow(entry: TypographyEntry, parent: FrameNode): void {
  const row = figma.createFrame();
  row.name = `type-${entry.fontFamily}-${entry.fontSize}`;
  row.layoutMode = 'HORIZONTAL';
  row.primaryAxisSizingMode = 'FIXED';
  row.counterAxisSizingMode = 'AUTO';
  row.resize(800, 1);
  row.layoutAlign = 'STRETCH';
  row.fills = [];
  row.paddingTop = 5;
  row.paddingBottom = 5;
  row.paddingLeft = 8;
  row.paddingRight = 8;
  row.itemSpacing = 0;

  const values = [
    entry.fontFamily,
    `${entry.fontSize}`,
    `${entry.fontWeight}`,
    entry.lineHeight,
    entry.letterSpacing,
    entry.token || '—',
    entry.usedBy.slice(0, 3).join(', ') + (entry.usedBy.length > 3 ? ` +${entry.usedBy.length - 3}` : ''),
  ];
  const widths = [140, 50, 55, 75, 70, 160, 250];

  for (let i = 0; i < values.length; i++) {
    const cell = figma.createText();
    cell.fontName = { family: 'Inter', style: 'Regular' };
    cell.fontSize = ROW_FONT_SIZE;
    cell.characters = values[i];
    cell.fills = [{ type: 'SOLID', color: i === 5 && entry.token ? TOKEN_COLOR : VALUE_COLOR }];
    cell.textAutoResize = 'HEIGHT';
    row.appendChild(cell);
    cell.layoutSizingHorizontal = 'FIXED';
    cell.resize(widths[i], cell.height);
  }

  // Row divider
  const div = figma.createRectangle();
  div.name = 'row-divider';
  div.resize(800, 1);
  div.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.93, b: 0.93 } }];
  div.layoutAlign = 'STRETCH';

  parent.appendChild(row);
  parent.appendChild(div);
}

export async function generateTypographySection(sourceNode: SceneNode): Promise<FrameNode | null> {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  const styles = new Map<string, TypographyEntry>();
  collectTextStyles(sourceNode, styles);

  if (styles.size === 0) return null;

  const section = figma.createFrame();
  section.name = 'Typography Summary';
  section.layoutMode = 'VERTICAL';
  section.primaryAxisSizingMode = 'AUTO';
  section.counterAxisSizingMode = 'AUTO';
  section.fills = [];
  section.itemSpacing = 16;

  // Section title
  const title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = 24;
  title.characters = 'Typography';
  title.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  section.appendChild(title);

  // Table container
  const table = figma.createFrame();
  table.name = 'typography-table';
  table.layoutMode = 'VERTICAL';
  table.primaryAxisSizingMode = 'AUTO';
  table.counterAxisSizingMode = 'AUTO';
  table.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 } }];
  table.cornerRadius = 8;
  table.paddingTop = 8;
  table.paddingBottom = 8;
  table.paddingLeft = 8;
  table.paddingRight = 8;
  table.itemSpacing = 0;

  createTableHeader(table);

  // Sort by font size descending
  const sorted = Array.from(styles.values()).sort((a, b) => b.fontSize - a.fontSize);
  for (const entry of sorted) {
    createTableRow(entry, table);
  }

  section.appendChild(table);

  return section;
}
