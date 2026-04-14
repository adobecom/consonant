import { getNodeFills, getNodeStrokes, getTextProps, getCornerRadius, figmaColorToHex } from './utils';
import { matchColor, matchSpacing, matchRadius, matchTypography, matchTypographyStrict, matchDimension, applyColorStyle, applyStrokeColorStyle, applyTextStyle, setResponsiveMode, isLoaded, loadLibraryTokens, detectNodeColorRole } from './tokens';

// ── Types ──

interface AuditIssue {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  property: string;
  value: string;
  suggestion: string | null;
}

interface AuditResult {
  total: number;
  matched: number;
  issues: AuditIssue[];
}

// ── Scan a single node for token compliance ──

function auditNode(node: SceneNode, issues: AuditIssue[], counters: { total: number; matched: number }): void {
  // Colors — pass semantic role so content/background/border tokens match correctly
  const fillRole = detectNodeColorRole(node, 'fill');
  const fills = getNodeFills(node);
  for (const fill of fills) {
    counters.total++;
    const token = matchColor(fill.hex, fillRole);
    if (token) {
      counters.matched++;
    } else {
      issues.push({ nodeId: node.id, nodeName: node.name, nodeType: node.type, property: 'Fill', value: fill.hex.toUpperCase(), suggestion: null });
    }
  }

  const strokes = getNodeStrokes(node);
  for (const stroke of strokes) {
    counters.total++;
    const token = matchColor(stroke.hex, 'border');
    if (token) {
      counters.matched++;
    } else {
      issues.push({ nodeId: node.id, nodeName: node.name, nodeType: node.type, property: 'Stroke', value: stroke.hex.toUpperCase(), suggestion: null });
    }
  }

  // Corner radius
  const radius = getCornerRadius(node);
  if (radius !== '0' && radius !== '0px') {
    counters.total++;
    const token = matchRadius(radius.replace('px', ''));
    if (token) {
      counters.matched++;
    } else {
      issues.push({ nodeId: node.id, nodeName: node.name, nodeType: node.type, property: 'Radius', value: radius, suggestion: null });
    }
  }

  // Typography — strict match: family + size + weight must all match an S2A text style
  const text = getTextProps(node);
  if (text) {
    counters.total++;
    const fontStyle = node.type === 'TEXT' && (node as TextNode).fontName !== figma.mixed
      ? ((node as TextNode).fontName as FontName).style
      : '';
    const result = matchTypographyStrict(text.fontFamily, text.fontSize, fontStyle);
    if (result.matched) {
      counters.matched++;
    } else {
      const mismatches: string[] = [];
      if (!result.familyOk) mismatches.push(`family "${text.fontFamily}"`);
      if (!result.sizeOk) mismatches.push(`size ${text.fontSize}px`);
      if (!result.styleOk) mismatches.push(`weight "${fontStyle}"`);
      const detail = mismatches.length > 0 ? ` (no S2A match for ${mismatches.join(', ')})` : '';
      issues.push({ nodeId: node.id, nodeName: node.name, nodeType: node.type, property: 'Typography', value: `${text.fontFamily} ${fontStyle} ${text.fontSize}px${detail}`, suggestion: null });
    }
  }

  // Spacing
  if ('layoutMode' in node && (node as FrameNode).layoutMode !== 'NONE') {
    const frame = node as FrameNode;
    const spacingChecks = [
      { prop: 'Padding Top', val: frame.paddingTop },
      { prop: 'Padding Right', val: frame.paddingRight },
      { prop: 'Padding Bottom', val: frame.paddingBottom },
      { prop: 'Padding Left', val: frame.paddingLeft },
      { prop: 'Item Spacing', val: (frame.itemSpacing as any) === figma.mixed ? 0 : frame.itemSpacing as number },
    ];
    for (const check of spacingChecks) {
      if (check.val > 0) {
        counters.total++;
        const token = matchSpacing(`${check.val}`);
        if (token) {
          counters.matched++;
        } else {
          issues.push({ nodeId: node.id, nodeName: node.name, nodeType: node.type, property: check.prop, value: `${check.val}px`, suggestion: null });
        }
      }
    }
  }
}

function auditRecursive(node: SceneNode, issues: AuditIssue[], counters: { total: number; matched: number }): void {
  if ('visible' in node && !node.visible) return;
  auditNode(node, issues, counters);
  // Don't descend into instance children — they're controlled by the component
  if (node.type === 'INSTANCE') return;
  if ('children' in node) {
    for (const child of (node as any).children) {
      auditRecursive(child, issues, counters);
    }
  }
}

export async function runS2AAudit(node: SceneNode): Promise<AuditResult> {
  if (!isLoaded()) await loadLibraryTokens();
  const issues: AuditIssue[] = [];
  const counters = { total: 0, matched: 0 };
  auditRecursive(node, issues, counters);
  return { total: counters.total, matched: counters.matched, issues };
}

// ── Apply S2A tokens — EXACT MATCH ONLY ──
// If a value doesn't exactly match an S2A token, DO NOT touch it.

interface AlignResult {
  scanned: number;
  aligned: number;
  mode: string;
  unmatched: AuditIssue[];
}

async function alignNode(node: SceneNode, textOnly: boolean, result: { aligned: number; scanned: number; unmatched: AuditIssue[] }): Promise<void> {

  // ── Text styles ──
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    // Only try if fontName is not mixed
    if (textNode.fontName !== figma.mixed) {
      result.scanned++;
      const success = await applyTextStyle(textNode);
      if (success) {
        result.aligned++;
      } else {
        const props = getTextProps(node);
        if (props) {
          result.unmatched.push({
            nodeId: node.id, nodeName: node.name, nodeType: 'TEXT',
            property: 'Text Style',
            value: `${props.fontFamily} ${props.fontSize}px`,
            suggestion: null,
          });
        }
      }
    }
  }

  // ── Fill colors — EXACT MATCH ONLY (gated by textOnly) ──
  if (!textOnly && 'fills' in node && Array.isArray((node as any).fills)) {
    const fills = (node as any).fills as Paint[];
    // Only touch if ALL fills are SOLID (skip mixed types like IMAGE+SOLID)
    if (fills.length > 0 && fills.every(f => f.type === 'SOLID')) {
      result.scanned++;
      const solid = fills[0] as SolidPaint;
      const hex = figmaColorToHex(solid.color);
      const fillOpacity = solid.opacity ?? 1;
      const alignFillRole = detectNodeColorRole(node, 'fill');
      const token = matchColor(hex, alignFillRole);
      if (token) {
        const success = await applyColorStyle(node, hex, fillOpacity);
        if (success) result.aligned++;
      } else if (hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#000000') {
        // Pure black/white — leave as-is, do NOT count as aligned
      } else {
        // No match — leave untouched, report it
        result.unmatched.push({
          nodeId: node.id, nodeName: node.name, nodeType: node.type,
          property: 'Fill Color',
          value: hex.toUpperCase(),
          suggestion: null,
        });
      }
    }
  }

  // ── Stroke colors — EXACT MATCH ONLY (gated by textOnly) ──
  if (!textOnly && 'strokes' in node && Array.isArray((node as any).strokes)) {
    const strokes = (node as any).strokes as Paint[];
    if (strokes.length > 0 && strokes.every(s => s.type === 'SOLID')) {
      result.scanned++;
      const solid = strokes[0] as SolidPaint;
      const hex = figmaColorToHex(solid.color);
      const strokeOpacity = solid.opacity ?? 1;
      const token = matchColor(hex, 'border');
      if (token) {
        const success = await applyStrokeColorStyle(node, hex, strokeOpacity);
        if (success) {
          result.aligned++;
        } else {
          result.unmatched.push({
            nodeId: node.id, nodeName: node.name, nodeType: node.type,
            property: 'Stroke Color',
            value: hex.toUpperCase(),
            suggestion: null,
          });
        }
      } else {
        result.unmatched.push({
          nodeId: node.id, nodeName: node.name, nodeType: node.type,
          property: 'Stroke Color',
          value: hex.toUpperCase(),
          suggestion: null,
        });
      }
    }
  }

  // ── Dimension tokens (Full Align only) ──
  if (!textOnly) {
    // Corner radius — EXACT MATCH ONLY (use matchRadius for consistency with audit)
    if ('cornerRadius' in node && typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
      result.scanned++;
      const radiusName = matchRadius(`${node.cornerRadius}`);
      if (radiusName) {
        const match = matchDimension(node.cornerRadius, 'CORNER_RADIUS');
        if (match) {
          try {
            (node as any).setBoundVariable('topLeftRadius', match.variable);
            (node as any).setBoundVariable('topRightRadius', match.variable);
            (node as any).setBoundVariable('bottomLeftRadius', match.variable);
            (node as any).setBoundVariable('bottomRightRadius', match.variable);
            result.aligned++;
          } catch (e) {
            result.unmatched.push({
              nodeId: node.id, nodeName: node.name, nodeType: node.type,
              property: 'Corner Radius',
              value: `${node.cornerRadius}px`,
              suggestion: null,
            });
          }
        }
      }
    }

    // Stroke weight — EXACT MATCH ONLY
    if ('strokeWeight' in node && typeof node.strokeWeight === 'number' && node.strokeWeight > 0) {
      result.scanned++;
      const match = matchDimension(node.strokeWeight as number, 'STROKE_FLOAT');
      if (match) {
        try {
          (node as any).setBoundVariable('strokeWeight', match.variable);
          result.aligned++;
        } catch (e) {
          result.unmatched.push({
            nodeId: node.id, nodeName: node.name, nodeType: node.type,
            property: 'Stroke Weight',
            value: `${node.strokeWeight}px`,
            suggestion: null,
          });
        }
      }
    }

    // Auto-layout spacing — EXACT MATCH ONLY
    if ('layoutMode' in node && (node as FrameNode).layoutMode !== 'NONE') {
      const frame = node as FrameNode;
      const spacingProps = [
        { prop: 'paddingTop' as const, val: frame.paddingTop },
        { prop: 'paddingRight' as const, val: frame.paddingRight },
        { prop: 'paddingBottom' as const, val: frame.paddingBottom },
        { prop: 'paddingLeft' as const, val: frame.paddingLeft },
        { prop: 'itemSpacing' as const, val: (frame.itemSpacing as any) === figma.mixed ? 0 : frame.itemSpacing as number },
      ];
      for (const { prop, val } of spacingProps) {
        if (val > 0) {
          result.scanned++;
          const match = matchDimension(val, 'GAP');
          if (match) {
            try {
              (frame as any).setBoundVariable(prop, match.variable);
              result.aligned++;
            } catch (e) {
              result.unmatched.push({
                nodeId: node.id, nodeName: node.name, nodeType: node.type,
                property: prop, value: `${val}px`,
                suggestion: null,
              });
            }
          } else {
            result.unmatched.push({
              nodeId: node.id, nodeName: node.name, nodeType: node.type,
              property: prop, value: `${val}px`,
              suggestion: null,
            });
          }
        }
      }
    }
  }
}

async function alignRecursive(node: SceneNode, textOnly: boolean, result: { aligned: number; scanned: number; unmatched: AuditIssue[] }): Promise<void> {
  if ('visible' in node && !node.visible) return;
  await alignNode(node, textOnly, result);
  // Don't descend into instance children — they're controlled by the component
  if (node.type === 'INSTANCE') return;
  if ('children' in node) {
    for (const child of (node as any).children) {
      await alignRecursive(child, textOnly, result);
    }
  }
}

export async function runFullAlign(node: SceneNode): Promise<AlignResult> {
  if (!isLoaded()) await loadLibraryTokens();
  let mode = 'n/a';
  if ('layoutMode' in node) {
    mode = await setResponsiveMode(node as FrameNode);
  }
  const result = { aligned: 0, scanned: 0, unmatched: [] as AuditIssue[] };
  await alignRecursive(node, false, result);
  return { ...result, mode };
}

export async function runTextColorsAlign(node: SceneNode): Promise<AlignResult> {
  if (!isLoaded()) await loadLibraryTokens();
  let mode = 'n/a';
  if ('layoutMode' in node) {
    mode = await setResponsiveMode(node as FrameNode);
  }
  const result = { aligned: 0, scanned: 0, unmatched: [] as AuditIssue[] };
  await alignRecursive(node, true, result);
  return { ...result, mode };
}
