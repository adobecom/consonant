import { collectSignificantNodes, isCallToAction, AnatomyEntry } from './spec-anatomy';
import { getTextProps } from './utils';

const CATEGORY_DEFS: Array<{ label: string; color: AnnotationCategoryColor }> = [
  { label: 'Text', color: 'red' },
  { label: 'CTA / Button', color: 'blue' },
  { label: 'Subcomponent', color: 'violet' },
  { label: 'Icon / Image', color: 'orange' },
  { label: 'Container', color: 'teal' },
];

const ICON_IMAGE_PATTERNS = /\b(icon|image|img|media|photo|asset|illustration|logo|avatar|thumbnail|badge|chevron|arrow)\b/i;

type AnnotationCategoryColor = 'yellow' | 'orange' | 'red' | 'pink' | 'violet' | 'blue' | 'teal' | 'green';

async function ensureCategories(): Promise<Map<string, string>> {
  const existing = await figma.annotations.getAnnotationCategoriesAsync();
  const labelToId = new Map<string, string>();

  for (const def of CATEGORY_DEFS) {
    const found = existing.find(c => c.label === def.label);
    if (found) {
      labelToId.set(def.label, found.id);
    } else {
      const cat = await figma.annotations.addAnnotationCategoryAsync(def);
      labelToId.set(def.label, cat.id);
    }
  }

  return labelToId;
}

function hasImageFill(node: SceneNode): boolean {
  if (!('fills' in node)) return false;
  const fills = (node as any).fills;
  if (!Array.isArray(fills)) return false;
  return fills.some((f: Paint) => f.type === 'IMAGE');
}

function describeTextRole(node: TextNode): string {
  const props = getTextProps(node);
  if (!props) return 'Text';
  const size = props.fontSize;
  const weight = props.fontWeight;
  const chars = node.characters.trim();

  if (size >= 40) return 'Heading';
  if (size >= 28) return 'Heading';
  if (size >= 20) return 'Subheading';
  if (size <= 11) return 'Eyebrow Copy';
  if (size <= 13 && weight >= 600) return 'Eyebrow Copy';
  if (size <= 13 && chars.length < 40) return 'Label Text';
  if (size <= 14) return 'Body';
  if (size <= 18) return 'Body';
  return 'Text';
}

function describeNodeRole(node: SceneNode): string {
  const name = node.name.toLowerCase();

  if (/\b(video|player)\b/i.test(name)) return 'Video';
  if (/\b(play|pause)\b/i.test(name)) return 'Pause/Play Button';
  if (/\b(progress[\s-]?bar)\b/i.test(name)) return 'Video Progress Bar';
  if (/\b(divider|separator|rule)\b/i.test(name)) return 'Divider';
  if (/\b(chevron|arrow)\b/i.test(name)) return 'Chevron Icon';
  if (/\b(logo)\b/i.test(name)) return 'Logo';
  if (/\b(avatar)\b/i.test(name)) return 'Avatar';
  if (/\b(badge)\b/i.test(name)) return 'Badge';
  if (/\b(thumbnail)\b/i.test(name)) return 'Thumbnail';
  if (/\b(icon)\b/i.test(name)) return 'Icon';
  if (ICON_IMAGE_PATTERNS.test(name)) return 'Image';

  if (hasImageFill(node)) return 'Media Background';

  if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION') return 'Icon';
  if (node.type === 'LINE') return 'Divider';

  return node.name;
}

const MEDIA_NAME_PATTERNS = /\b(icon|image|img|media|photo|asset|illustration|logo|avatar|thumbnail|badge|chevron|arrow|video|play|pause|progress|divider|separator|line|rule)\b/i;

async function classifyNode(node: SceneNode): Promise<{ category: string; role: string }> {
  if (await isCallToAction(node)) {
    const role = node.type === 'TEXT' ? 'Text Link' : 'Button';
    return { category: 'CTA / Button', role };
  }

  if (node.type === 'TEXT') {
    return { category: 'Text', role: describeTextRole(node as TextNode) };
  }

  if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION' || node.type === 'LINE') {
    return { category: 'Icon / Image', role: describeNodeRole(node) };
  }

  if (node.type === 'INSTANCE') {
    if (MEDIA_NAME_PATTERNS.test(node.name) || hasImageFill(node)) {
      return { category: 'Icon / Image', role: describeNodeRole(node) };
    }
    return { category: 'Subcomponent', role: node.name };
  }

  if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
    if (MEDIA_NAME_PATTERNS.test(node.name) || hasImageFill(node)) {
      return { category: 'Icon / Image', role: describeNodeRole(node) };
    }
    if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
      return { category: 'Icon / Image', role: describeNodeRole(node) };
    }
    return { category: 'Container', role: node.name };
  }

  if (hasImageFill(node) || MEDIA_NAME_PATTERNS.test(node.name)) {
    return { category: 'Icon / Image', role: describeNodeRole(node) };
  }

  return { category: 'Container', role: node.name };
}

export async function generateAnatomyAnnotations(sourceNode: SceneNode): Promise<number> {
  const categoryIds = await ensureCategories();

  const rawEntries: AnatomyEntry[] = [];
  const seen = new Set<string>();
  await collectSignificantNodes(sourceNode, rawEntries, seen, 0, true);

  let annotated = 0;

  for (const entry of rawEntries) {
    const { category, role } = await classifyNode(entry.node);
    const categoryId = categoryIds.get(category);
    if (!categoryId) continue;

    try {
      (entry.node as any).annotations = [{
        label: role,
        categoryId,
      }];
      annotated++;
    } catch (e) {
      console.warn(`Annotation failed on "${entry.name}":`, e);
    }
  }

  return annotated;
}
