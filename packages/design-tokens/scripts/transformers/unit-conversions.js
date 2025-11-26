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

function roundTo(value, precision) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

module.exports = {
  toPx,
  toRem,
  roundTo,
  stripTrailingZeros,
};
