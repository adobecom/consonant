# S2A Strict Token Matching — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the consonant-specs-plugin exclusively use S2A / Foundations library tokens for all features — matching, annotations, specs, and audits. No S2C, no other library.

**Architecture:** Add `fontStyle` (the raw Figma font style string like "Bold", "Regular") to `getTextProps()` return, create a new `matchS2ATextStyle(node)` convenience function that extracts font data from a TextNode and returns the S2A token name or null, then replace all 3 broken `matchTypography()` call sites with the new function. Update `spec-text-properties.ts` to show S2A token names in annotation labels when matched, with `textStyleId` pinned as a property, falling back to individual font properties when not S2A.

**Tech Stack:** TypeScript, Figma Plugin API, esbuild

---

### Task 1: Add `fontStyle` to `getTextProps()` return type

**Files:**
- Modify: `apps/consonant-specs-plugin/src/utils.ts:82-105`

- [ ] **Step 1: Add `fontStyle` field to return type and implementation**

In `utils.ts`, update `getTextProps` to include the raw font style string:

```typescript
export function getTextProps(node: SceneNode): {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: string;
  lineHeight: string;
  letterSpacing: string;
} | null {
  if (node.type !== 'TEXT') return null;
  if (node.fontName === figma.mixed || node.fontSize === figma.mixed ||
      node.lineHeight === figma.mixed || node.letterSpacing === figma.mixed) {
    return null;
  }
  const font = node.fontName as FontName;
  const size = node.fontSize as number;
  const lh = node.lineHeight as LineHeight;
  const ls = node.letterSpacing as LetterSpacing;
  return {
    fontFamily: font.family,
    fontSize: size,
    fontWeight: getFontWeight(font.style),
    fontStyle: font.style,
    lineHeight: lh.unit === 'AUTO' ? 'auto' : lh.unit === 'PIXELS' ? `${lh.value}px` : `${lh.value}%`,
    letterSpacing: ls.unit === 'PIXELS' ? `${ls.value}px` : `${ls.value}%`,
  };
}
```

The only change: add `fontStyle: string;` to the return type and `fontStyle: font.style,` to the return value.

- [ ] **Step 2: Build and verify no compile errors**

Run: `cd apps/consonant-specs-plugin && node esbuild.config.mjs`
Expected: `Build complete.` — adding a field to an object return is backwards compatible; no callers break.

- [ ] **Step 3: Commit**

```bash
git add apps/consonant-specs-plugin/src/utils.ts
git commit -m "feat: add fontStyle to getTextProps return type"
```

---

### Task 2: Create `matchS2ATextStyle()` convenience function

**Files:**
- Modify: `apps/consonant-specs-plugin/src/tokens.ts:279-286`

- [ ] **Step 1: Add `matchS2ATextStyle` below existing `matchTypographyStrict`**

In `tokens.ts`, after line 309 (end of `matchTypographyStrict`), add:

```typescript
/**
 * Match a TextNode's font properties against S2A text styles.
 * Returns the S2A token name (e.g. "s2a/typography/body-md") or null.
 * Requires all three fields (family, size, style) to match the same S2A token.
 */
export function matchS2ATextStyle(node: SceneNode): string | null {
  if (node.type !== 'TEXT') return null;
  const textNode = node as TextNode;
  if (textNode.fontName === figma.mixed || textNode.fontSize === figma.mixed) return null;
  const font = textNode.fontName as FontName;
  const size = textNode.fontSize as number;
  const result = matchTypographyStrict(font.family, size, font.style);
  return result.matched ? result.name : null;
}
```

This function:
- Takes a `SceneNode` (same type all callers already have)
- Reads `fontName.style` directly from the TextNode (no lossy conversion)
- Delegates to the proven `matchTypographyStrict`
- Returns `string | null` (compatible with all `token:` fields)
- Handles `figma.mixed` gracefully

- [ ] **Step 2: Export `matchS2ATextStyle` from tokens.ts**

It's already exported via the `export function` keyword in the code above. Verify it's accessible.

- [ ] **Step 3: Build and verify**

Run: `cd apps/consonant-specs-plugin && node esbuild.config.mjs`
Expected: `Build complete.`

- [ ] **Step 4: Commit**

```bash
git add apps/consonant-specs-plugin/src/tokens.ts
git commit -m "feat: add matchS2ATextStyle convenience function for strict S2A matching"
```

---

### Task 3: Fix `annotations.ts` — replace broken `matchTypography` calls

**Files:**
- Modify: `apps/consonant-specs-plugin/src/annotations.ts:1-65`

- [ ] **Step 1: Replace the import and text property matching**

Change the import on line 2:
```typescript
// Before:
import { matchColor, matchRadius, matchTypography, detectNodeColorRole } from './tokens';

// After:
import { matchColor, matchRadius, matchS2ATextStyle, detectNodeColorRole } from './tokens';
```

Replace lines 58-64 (the text section):
```typescript
  const text = getTextProps(node);
  if (text) {
    const s2aToken = matchS2ATextStyle(node);
    props.push({ name: 'Font', value: text.fontFamily, token: s2aToken });
    props.push({ name: 'Size', value: `${text.fontSize}px`, token: s2aToken });
    props.push({ name: 'Weight', value: `${text.fontWeight}`, token: s2aToken });
    props.push({ name: 'Line Height', value: text.lineHeight, token: s2aToken });
    props.push({ name: 'Letter Spacing', value: text.letterSpacing, token: s2aToken });
  }
```

Now all text property rows show the SAME S2A token (or null if not S2A). The individual values (family, size, weight, line height, letter spacing) are always shown as `value` regardless.

- [ ] **Step 2: Build and verify**

Run: `cd apps/consonant-specs-plugin && node esbuild.config.mjs`
Expected: `Build complete.`

- [ ] **Step 3: Commit**

```bash
git add apps/consonant-specs-plugin/src/annotations.ts
git commit -m "fix: use strict S2A token matching in node properties panel"
```

---

### Task 4: Fix `spec-typography.ts` — replace broken `matchTypography` calls

**Files:**
- Modify: `apps/consonant-specs-plugin/src/spec-typography.ts:1-34`

- [ ] **Step 1: Update import and `collectTextStyles` to pass the node through**

Change line 2:
```typescript
// Before:
import { matchTypography } from './tokens';

// After:
import { matchS2ATextStyle } from './tokens';
```

Change the `collectTextStyles` function to accept and pass the node:

```typescript
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
        token: matchS2ATextStyle(node),
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
```

The key change: `token: matchS2ATextStyle(node)` replaces `token: matchTypography(text.fontFamily) || matchTypography(\`${text.fontSize}\`)`.

- [ ] **Step 2: Build and verify**

Run: `cd apps/consonant-specs-plugin && node esbuild.config.mjs`
Expected: `Build complete.`

- [ ] **Step 3: Commit**

```bash
git add apps/consonant-specs-plugin/src/spec-typography.ts
git commit -m "fix: use strict S2A token matching in typography summary table"
```

---

### Task 5: Fix `spec-anatomy.ts` — replace broken `matchTypography` call

**Files:**
- Modify: `apps/consonant-specs-plugin/src/spec-anatomy.ts:1-5,393-406`

- [ ] **Step 1: Update import**

In the imports at the top of the file, replace `matchTypography` with `matchS2ATextStyle`:

```typescript
// Find the import line that includes matchTypography and replace it:
// Before:
import { matchColor, matchRadius, matchTypography, ... } from './tokens';

// After:
import { matchColor, matchRadius, matchS2ATextStyle, ... } from './tokens';
```

Keep all other imports (matchColor, matchRadius, detectNodeColorRole, etc.) unchanged.

- [ ] **Step 2: Update the text style matching at lines 395-406**

The `generateAnatomyCard` function receives `node: SceneNode` as a parameter. Find the text annotation section (around line 395) and replace:

```typescript
// Before:
const token = matchTypography(`${text.fontSize}`);
const tokenLabel = token ? token.split('/').pop()! : null;

// After:
const token = matchS2ATextStyle(node);
const tokenLabel = token ? token.split('/').pop()! : null;
```

Everything after this (the `if (token)` block, `addPropRow` calls) stays the same — `token` is still `string | null` and `tokenLabel` derivation is unchanged.

- [ ] **Step 3: Verify the `node` parameter is accessible in scope**

Check that the function containing this code has access to the original `SceneNode`. The function signature should be something like `async function generateAnatomyCard(node: SceneNode, ...)`. If the node is not directly available (e.g., only `text` from `getTextProps` is in scope), you need to find where the original node reference is. Look for the walk/loop that calls this section.

- [ ] **Step 4: Build and verify**

Run: `cd apps/consonant-specs-plugin && node esbuild.config.mjs`
Expected: `Build complete.`

- [ ] **Step 5: Commit**

```bash
git add apps/consonant-specs-plugin/src/spec-anatomy.ts
git commit -m "fix: use strict S2A token matching in anatomy exhibits"
```

---

### Task 6: Fix `spec-text-properties.ts` — show S2A token name with pinned property

**Files:**
- Modify: `apps/consonant-specs-plugin/src/spec-text-properties.ts`

- [ ] **Step 1: Rewrite to use `lookupTextStyleById` for S2A detection + native property pinning**

```typescript
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
```

This handles 3 cases:
- **S2A style bound:** Shows `**Eyebrow**\neyebrow 16/20` in the label AND pins `textStyleId` as a native property
- **Non-S2A style bound:** Falls back to individual font properties (fontFamily, fontSize, etc.)
- **No style bound:** Falls back to individual font properties

- [ ] **Step 2: Build and verify**

Run: `cd apps/consonant-specs-plugin && node esbuild.config.mjs`
Expected: `Build complete.`

- [ ] **Step 3: Commit**

```bash
git add apps/consonant-specs-plugin/src/spec-text-properties.ts
git commit -m "fix: show S2A token name in text property annotations, fall back for non-S2A"
```

---

### Task 7: Remove deprecated `matchTypography()` function

**Files:**
- Modify: `apps/consonant-specs-plugin/src/tokens.ts:276-286`

- [ ] **Step 1: Verify no remaining callers**

Run: `grep -rn 'matchTypography[^S]' apps/consonant-specs-plugin/src/ --include='*.ts'`

Expected: Only the function definition itself in `tokens.ts` and possibly the import in `s2a-audit.ts` (which imports it but may not call it). If any caller remains, fix it first.

- [ ] **Step 2: Remove the function and its TODO comment**

Delete lines 276-286 in `tokens.ts`:
```typescript
// DELETE these lines:
// TODO: The single-string API is ambiguous — a value like "16" could be a font size
// or a family name. Future refactor should accept structured input
// (e.g. { family, style, size }) to eliminate guessing.
export function matchTypography(value: string): string | null {
  const normalized = value.toLowerCase();
  for (const ts of textStyleMap) {
    if (ts.fontFamily.toLowerCase() === normalized) return ts.name;
    if (`${ts.fontSize}` === value) return ts.name;
  }
  return null;
}
```

- [ ] **Step 3: Remove `matchTypography` from any remaining import lists**

Check `s2a-audit.ts` line 2 — if it imports `matchTypography`, remove it from the import list (keep all other imports).

- [ ] **Step 4: Build and verify**

Run: `cd apps/consonant-specs-plugin && node esbuild.config.mjs`
Expected: `Build complete.`

- [ ] **Step 5: Commit**

```bash
git add apps/consonant-specs-plugin/src/tokens.ts apps/consonant-specs-plugin/src/s2a-audit.ts
git commit -m "chore: remove deprecated matchTypography function"
```

---

### Task 8: Live QC — test all features in Figma

**Files:** None (testing only)

Use the Figma plugin connected to Hub — A.com file at node `8320:162984` for testing.

- [ ] **Step 1: Reload plugin and verify token count**

Reload the consonant-specs-plugin in Figma. Check the footer shows `Tokens: S2A / Foundations — 283 tokens loaded`.

- [ ] **Step 2: Test node properties panel (annotations.ts)**

Select a text node with an S2A style (e.g., a card Body using body-md). Verify the properties panel shows the S2A token name `s2a/typography/body-md` for Font, Size, and Weight rows.

Select a text node with a non-S2A style (e.g., a hero Title using S2C). Verify no S2A token is shown — only raw values.

- [ ] **Step 3: Test Specs → Text Properties (spec-text-properties.ts)**

Run Specs with Text Properties enabled on the frame at `8320:162984`. Take a screenshot of the result. Verify:
- S2A-styled text shows token name (e.g., "eyebrow 16/20") in annotation label
- Non-S2A-styled text shows individual font properties (fontFamily, fontSize, etc.)

- [ ] **Step 4: Test Specs → Typography Summary (spec-typography.ts)**

Run Specs with Typography Summary enabled. Take a screenshot. Verify:
- S2A-matched text rows show the correct S2A token name in the Token column
- Non-S2A text rows show `null` / no token

- [ ] **Step 5: Test Specs → Anatomy (spec-anatomy.ts)**

Run Specs with Anatomy enabled on a component. Take a screenshot. Verify:
- Text style row shows correct S2A token when matched
- Font size / line height rows show token label or raw value appropriately

- [ ] **Step 6: Test S2A Audit**

Run S2A Audit on the frame. Verify it still works correctly — should report non-S2A styles as issues, S2A styles as matched.

- [ ] **Step 7: Test Align / Full Align**

Run Full Align on a frame with mixed S2A and non-S2A text. Verify:
- S2A-matching text gets styles applied
- Non-S2A text is not incorrectly force-matched to an S2A style

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "test: verify all S2A strict matching across plugin features"
```
