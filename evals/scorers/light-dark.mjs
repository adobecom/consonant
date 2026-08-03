// Light/Dark scorer (deterministic).
//
// Encodes the lessons that cost the most real time — with room for the human's
// domain judgment (the data-flywheel / human-in-the-loop part):
//
//   1. MODELESS DEFINITION (hard) — a component definition must not bake an
//      explicit Theme-collection mode pin UNLESS the golden case explicitly
//      allowlists it. Instance-level pins in consumer files are always wrong;
//      a deliberate, documented definition-level pin (e.g. the highlight card's
//      `.body` pinned Light so the featured body stays white in both modes) is
//      legitimate — declare it in the case's `allowedModePins`.
//
//   2. ADAPTS (soft / warning) — color paints that are identical in light and
//      dark and aren't a known-frozen token get reported as warnings, not
//      failures. "Doesn't flip" is sometimes intentional (brand accent, always-
//      white pills) and needs a human call, so it informs rather than gates.
//
//   3. CONTRAST (hard, when pairs present) — declared fg/bg pairs must clear
//      3:1 in both modes.
//
// Signature: score(snapshot, caseDef?) — caseDef carries allowedModePins.

import { THEME_COLLECTION_HINT, isFrozenToken } from "../lib/conventions.mjs";

function luminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  if (la == null || lb == null) return null;
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * @param {import("../lib/types.mjs").Snapshot} snap
 * @param {{ allowedModePins?: {match:string, reason:string}[] }} [caseDef]
 */
export function score(snap, caseDef = {}) {
  const allow = caseDef.allowedModePins || [];
  const isAllowed = (pin) => allow.some((a) => (pin.nodePath || "").includes(a.match));

  // 1) modeless (hard) — only non-allowlisted theme pins fail
  const themePins = (snap.modePins || []).filter((p) =>
    (p.collectionName || "").includes(THEME_COLLECTION_HINT),
  );
  const strayPins = themePins.filter((p) => !isAllowed(p));
  const allowedPins = themePins.filter(isAllowed);
  const modelessOk = strayPins.length === 0;

  // 2) adapts (soft) — warnings only
  const colorPaints = (snap.paints || []).filter((p) => p.light && p.dark);
  const nonAdapting = colorPaints
    .filter((p) => p.light.toLowerCase() === p.dark.toLowerCase() && !isFrozenToken(p.token || ""))
    .map((p) => ({ node: p.nodePath, token: p.token, value: p.light }));

  // 3) contrast (hard, when declared)
  const pairs = snap.contrastPairs || [];
  const contrastFails = [];
  for (const pr of pairs) {
    for (const mode of ["light", "dark"]) {
      const c = contrast(pr[mode]?.fg, pr[mode]?.bg);
      if (c != null && c < 3) contrastFails.push({ pair: pr.label, mode, ratio: +c.toFixed(2) });
    }
  }
  const contrastOk = contrastFails.length === 0;

  // Score from the HARD checks only. Adapts is advisory.
  const hard = [modelessOk, contrastOk];
  const pass = hard.every(Boolean);
  const scoreVal = hard.filter(Boolean).length / hard.length;

  return {
    name: "LightDark",
    score: scoreVal,
    pass,
    details: {
      modeless: { ok: modelessOk, strayPins, allowedPins: allowedPins.map((p) => ({ node: p.nodePath, reason: allow.find((a) => (p.nodePath || "").includes(a.match))?.reason })) },
      contrast: pairs.length ? { ok: contrastOk, fails: contrastFails } : "no pairs declared",
      warnings: nonAdapting.length ? { nonAdaptingTokens: nonAdapting.slice(0, 15) } : "none",
    },
  };
}
