function stripTrailingZeros(value, precision = 4) {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  const formatted = value.toFixed(precision);
  return formatted
    .replace(/(\.\d*?[1-9])0+$/u, "$1")
    .replace(/\.0+$/u, "")
    .replace(/\.$/u, "");
}

function toPx(value) {
  if (value === 0) {
    return "0px";
  }
  return `${stripTrailingZeros(value)}px`;
}

function toRem(value) {
  if (value === 0) {
    return "0rem";
  }
  const remValue = value / 16;
  return `${stripTrailingZeros(remValue)}rem`;
}

/**
 * Converts pixels to em for letter-spacing.
 * Uses 16px base font size: em = px / 16
 */
function pxToEm(value, baseFontSizePx = 16) {
  if (value === 0) {
    return "0em";
  }
  const emValue = value / baseFontSizePx;
  return `${stripTrailingZeros(emValue)}em`;
}

/**
 * Converts pixel line-height to unitless (ratio).
 * unitless = lineHeightPx / fontSizePx
 * Returns a number (no unit) for CSS line-height.
 */
function pxToUnitlessLineHeight(lineHeightPx, fontSizePx) {
  if (!fontSizePx || fontSizePx <= 0) {
    return roundTo(lineHeightPx / 16, 3);
  }
  return roundTo(lineHeightPx / fontSizePx, 3);
}

function roundTo(value, precision) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

module.exports = {
  toPx,
  toRem,
  pxToEm,
  pxToUnitlessLineHeight,
  roundTo,
  stripTrailingZeros,
};
