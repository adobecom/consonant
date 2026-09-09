export interface Ratio {
  label: string;
  w: number;
  h: number;
  note: string;
}

// Unique ratio families, landscape-normalized (w >= h). The UI's orientation
// toggle applies them as-is (landscape) or swapped (portrait: h:w) — so 4:3
// doubles as 3:4, 16:9 as 9:16 (story/reel), 5:4 as 4:5 (social portrait).
export const RATIOS: Ratio[] = [
  { label: '1:1',    w: 1,   h: 1,   note: 'avatar, tile' },
  { label: '5:4',    w: 5,   h: 4,   note: 'photo · social' },
  { label: '4:3',    w: 4,   h: 3,   note: 'classic photo' },
  { label: '3:2',    w: 3,   h: 2,   note: 'DSLR · poster' },
  { label: '16:9',   w: 16,  h: 9,   note: 'video · story' },
  { label: '1.91:1', w: 191, h: 100, note: 'social card' },
  { label: '21:9',   w: 21,  h: 9,   note: 'ultrawide' },
];

// Portrait application swaps the terms; the label swaps its halves so the
// button always shows exactly what will be applied.
export function swapLabel(label: string): string {
  const [a, b] = label.split(':');
  return `${b}:${a}`;
}

// Width stays; height = width scaled to the ratio. 1px is our own sensible
// minimum (Figma's actual resize() floor is 0.01, per the plugin typings).
export function heightFor(width: number, ratioW: number, ratioH: number): number {
  return Math.max(1, Math.round((width * ratioH) / ratioW));
}

// Node types excluded from ratio apply even though they technically expose
// resize(): LINE requires height exactly 0 (every apply would throw); TEXT
// with auto-height would be silently converted to fixed sizing (future edits
// clip) or re-hug on the next edit — either way a surprise. (Review 2026-08-14.)
export function isRatioApplicableType(type: string): boolean {
  return type !== 'LINE' && type !== 'TEXT';
}

// NOTE (empirically verified 2026-08-14, live Plugin API): resize() sticks even
// on FILL children and HUG frames — Figma converts the vertical sizing to FIXED,
// same as a manual drag. TEXT is different: resize() flips textAutoResize to
// NONE silently, which is why TEXT is excluded above.
