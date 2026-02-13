const fs = require("fs");
const path = require("path");

// Read directly from the real design tokens instead of a temporary file.
// This points at the primitives core token JSON which includes typography.
// Dynamically find the primitives-core file since collection IDs can change
const tokensDir = path.resolve(
  __dirname,
  "../../../packages/design-tokens/tokens",
);
const metadataPath = path.join(tokensDir, "metadata.json");

let FONT_SOURCE_PATH;
if (fs.existsSync(metadataPath)) {
  // Use metadata to find the primitives-core file
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
  const primitivesCoreFiles =
    metadata.files?.filter(
      (f) =>
        f.collection?.slug === "primitives-core" && f.mode?.slug === "mode-1",
    ) || [];

  // Try each primitives-core file until we find one with typography data
  for (const primitivesCoreFile of primitivesCoreFiles) {
    const candidatePath = path.join(tokensDir, primitivesCoreFile.fileName);
    if (fs.existsSync(candidatePath)) {
      try {
        const testData = JSON.parse(fs.readFileSync(candidatePath, "utf-8"));
        if (testData.typography && testData.typography["font-size"]) {
          FONT_SOURCE_PATH = candidatePath;
          break;
        }
      } catch (e) {
        // Continue to next file if this one can't be parsed
        continue;
      }
    }
  }

  // If no file with typography found, just use the first one
  if (!FONT_SOURCE_PATH && primitivesCoreFiles.length > 0) {
    const firstFile = primitivesCoreFiles[0];
    const candidatePath = path.join(tokensDir, firstFile.fileName);
    if (fs.existsSync(candidatePath)) {
      FONT_SOURCE_PATH = candidatePath;
    }
  }
}

// Fallback: find any primitives-core file if metadata doesn't have it
if (!FONT_SOURCE_PATH || !fs.existsSync(FONT_SOURCE_PATH)) {
  const files = fs.readdirSync(tokensDir);
  const primitivesCoreFiles = files.filter(
    (f) => f.startsWith("primitives-core-") && f.endsWith(".mode-1.json"),
  );

  // Try each file to find one with typography
  for (const fileName of primitivesCoreFiles) {
    const candidatePath = path.join(tokensDir, fileName);
    try {
      const testData = JSON.parse(fs.readFileSync(candidatePath, "utf-8"));
      if (testData.typography && testData.typography["font-size"]) {
        FONT_SOURCE_PATH = candidatePath;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  // If still not found, use the first one
  if (!FONT_SOURCE_PATH && primitivesCoreFiles.length > 0) {
    FONT_SOURCE_PATH = path.join(tokensDir, primitivesCoreFiles[0]);
  }
}

if (!FONT_SOURCE_PATH || !fs.existsSync(FONT_SOURCE_PATH)) {
  throw new Error(
    `Could not find primitives-core token file. Looked in: ${tokensDir}`,
  );
}

// Line-height values also live in the same token file.
const LINE_HEIGHT_PATH = FONT_SOURCE_PATH;
const OUTPUT_DIR = path.resolve(__dirname, "../stories/generated");
const OUTPUT_MODULE = path.join(OUTPUT_DIR, "typographyScale.js");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const stripUnits = (value, unit) => {
  if (!value.endsWith(unit)) return Number.NaN;
  return parseFloat(value.replace(unit, ""));
};

const formatPx = (pxValue) => {
  if (Number.isNaN(pxValue)) return null;
  const rounded = Number(pxValue.toFixed(3));
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded}px`;
};

const fontSource = JSON.parse(fs.readFileSync(FONT_SOURCE_PATH, "utf-8"));
const fontSizeTokens =
  (fontSource.typography && fontSource.typography["font-size"]) || {};

// primitives-core tokens store numeric font sizes under `$value` (in px).
// Here we derive both px and rem representations for the stories.
const fontEntries = Object.entries(fontSizeTokens).map(([token, node]) => {
  const raw = node.$value;
  const pxNumber =
    typeof raw === "number" ? raw : Number.parseFloat(String(raw));
  const px = formatPx(pxNumber);
  const remNumber = pxNumber / 16;
  const rem = Number.isNaN(remNumber) ? null : `${remNumber}rem`;
  return { token, rem, px };
});

const lineHeightSource = JSON.parse(fs.readFileSync(LINE_HEIGHT_PATH, "utf-8"));
const lineHeightTokens =
  (lineHeightSource.typography && lineHeightSource.typography["line-height"]) ||
  {};
const lineHeightEntries = Object.entries(lineHeightTokens).map(
  ([token, node]) => {
    const raw = node.$value;
    const number = Number.parseFloat(String(raw));
    return {
      token,
      value: raw,
      number,
    };
  },
);

const fallbackLineHeight = lineHeightEntries[lineHeightEntries.length - 1] ?? {
  token: null,
  value: null,
  number: Number.NaN,
};
const resolvedLineHeights = fontEntries.map((_, index) => {
  const entry = lineHeightEntries[index] ?? fallbackLineHeight;
  return { token: entry.token, value: entry.value, number: entry.number };
});

const typographyScale = fontEntries.map((fontEntry, index) => {
  const lineEntry = resolvedLineHeights[index] ?? fallbackLineHeight;
  return {
    ...fontEntry,
    lineHeightToken: lineEntry.token,
    lineHeight: lineEntry.value,
  };
});

const serialise = (data) => JSON.stringify(data, null, 2);

const fileContents = `// Auto-generated by scripts/prepare-story-data.js
export const fontSizes = ${serialise(fontEntries)};
export const lineHeights = ${serialise(resolvedLineHeights)};
export const typographyScale = ${serialise(typographyScale)};
export default { fontSizes, lineHeights, typographyScale };
`;

ensureDir(OUTPUT_DIR);
fs.writeFileSync(OUTPUT_MODULE, fileContents);
console.log("✅ Generated stories/generated/typographyScale.js");
