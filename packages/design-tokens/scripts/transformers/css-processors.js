function shorthandHexColors(css) {
  // Convert full 6-digit hex colors to 3-digit shorthand when possible
  // Pattern: #rrggbb where r=r, g=g, b=b (e.g., #ffffff → #fff, #ff0000 → #f00)
  // Also handles 8-digit hex with alpha: #rrggbbaa where a=a (e.g., #ffffffff → #ffff)
  return css
    .replace(
      /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])\b/g,
      (match, r1, r2, g1, g2, b1, b2, a1, a2) => {
        // 8-digit hex with alpha
        if (r1 === r2 && g1 === g2 && b1 === b2 && a1 === a2) {
          return `#${r1}${g1}${b1}${a1}`;
        }
        return match;
      },
    )
    .replace(
      /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])\b/g,
      (match, r1, r2, g1, g2, b1, b2) => {
        // 6-digit hex without alpha
        if (r1 === r2 && g1 === g2 && b1 === b2) {
          return `#${r1}${g1}${b1}`;
        }
        return match;
      },
    );
}

function modernizeColorSyntax(css) {
  // Convert rgba() to modern space-separated syntax: rgba(r, g, b, a) → rgb(r g b / a%)
  // Also handles rgb() with alpha: rgb(r, g, b, a) → rgb(r g b / a%)
  // Converts decimal alpha values (0.12) to percentage (12%)
  // Handles both comma-separated and space-separated input formats
  const convertAlphaToPercentage = (alpha) => {
    const num = parseFloat(alpha);
    if (!isNaN(num) && num >= 0 && num <= 1) {
      // Convert decimal to percentage
      return `${Math.round(num * 100)}%`;
    }
    return alpha; // Return as-is if not a valid decimal 0-1
  };

  return (
    css
      // Convert rgba(r, g, b, a) to rgb(r g b / a%)
      .replace(/rgba\(([^)]+)\)/g, (match, content) => {
        const parts = content.split(",").map((p) => p.trim());
        if (parts.length === 4) {
          const [r, g, b, a] = parts;
          const alphaPercent = convertAlphaToPercentage(a);
          return `rgb(${r} ${g} ${b} / ${alphaPercent})`;
        }
        return match;
      })
      // Convert rgb(r, g, b, a) to rgb(r g b / a%) (if alpha is present)
      .replace(/rgb\(([^)]+)\)/g, (match, content) => {
        // Check if it's space-separated with / (already modern format)
        if (content.includes("/")) {
          const parts = content.split("/").map((p) => p.trim());
          if (parts.length === 2) {
            const [rgbPart, alphaPart] = parts;
            const alphaPercent = convertAlphaToPercentage(alphaPart);
            return `rgb(${rgbPart} / ${alphaPercent})`;
          }
        }
        // Handle comma-separated format
        const parts = content.split(",").map((p) => p.trim());
        if (parts.length === 4) {
          const [r, g, b, a] = parts;
          const alphaPercent = convertAlphaToPercentage(a);
          return `rgb(${r} ${g} ${b} / ${alphaPercent})`;
        }
        // Convert rgb(r, g, b) to rgb(r g b) (space-separated, no alpha)
        if (parts.length === 3) {
          const [r, g, b] = parts;
          return `rgb(${r} ${g} ${b})`;
        }
        return match;
      })
  );
}

function dropZeroUnits(css) {
  // Remove units from zero values: 0px → 0, 0rem → 0, 0em → 0, etc.
  // Matches zero values with common CSS units
  // Handle % separately since it's not a word character
  return css
    .replace(
      /\b0(px|rem|em|ch|ex|vh|vw|vmin|vmax|deg|rad|grad|turn|ms|s|Hz|kHz|dpi|dpcm|dppx)\b/g,
      "0",
    )
    .replace(/\b0%/g, "0");
}

module.exports = {
  shorthandHexColors,
  modernizeColorSyntax,
  dropZeroUnits,
};

