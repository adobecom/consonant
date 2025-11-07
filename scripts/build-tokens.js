const fs = require('fs/promises');
const path = require('path');
const StyleDictionary = require('style-dictionary').default;

const FOUNDATION_SOURCES = [
  'primitives/borders/**/*.json',
  'primitives/opacity/**/*.json',
  'primitives/shadow/**/*.json',
  'primitives/spacing/**/*.json',
  'primitives/typography/**/*.json',
  'primitives/z-index/**/*.json',
  'alias/borders/**/*.json',
  'alias/spacing/**/*.json',
  'alias/typography/**/*.json'
];

const THEMES = [
  { name: 'light', selector: ':root[data-theme="light"]' },
  { name: 'dark', selector: ':root[data-theme="dark"]' }
];

const FIGMA_TOKENS_DIR = path.join(process.cwd(), 'tokens');
const FIGMA_METADATA_PATH = path.join(FIGMA_TOKENS_DIR, 'metadata.json');

(async () => {
  try {
    if (!(await hasFigmaTokens())) {
      throw new Error('Figma token export not found. Run npm run sync:figma first to generate tokens from Figma.');
    }
    console.log('Using Figma token export for build.');
    await buildFromFigma();
    console.log('✅ Design tokens built to CSS custom properties.');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

async function hasFigmaTokens() {
  try {
    await fs.access(FIGMA_METADATA_PATH);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function buildFromFigma() {
  const metadata = JSON.parse(await fs.readFile(FIGMA_METADATA_PATH, 'utf8'));
  const files = Array.isArray(metadata.files) ? metadata.files : [];

  if (!files.length) {
    throw new Error('Figma metadata found but contains no files. Run npm run sync:figma before building.');
  }

  const filesByMode = new Map();
  const colorPrimitiveFiles = [];

  for (const entry of files) {
    if (!entry || !entry.fileName) {
      continue;
    }

    // Collect color primitive files separately - they're needed for all modes
    if (entry.collection?.slug === 'primitives-color') {
      colorPrimitiveFiles.push({
        fileName: entry.fileName,
        mode: {
          name: entry.mode?.name || 'light',
          slug: entry.mode?.slug || 'light'
        }
      });
      // Use light mode color primitives as the base for reference resolution
      if (entry.mode?.slug === 'light' || entry.mode?.name === 'Light') {
        continue; // Will be added separately
      }
    }

    const modeSlug = entry.mode?.slug ? String(entry.mode.slug) : toSlug(entry.mode?.name || '');
    if (!modeSlug) {
      continue;
    }

    const normalizedEntry = {
      fileName: entry.fileName,
      mode: {
        name: entry.mode?.name || modeSlug,
        slug: modeSlug
      }
    };

    if (!filesByMode.has(modeSlug)) {
      filesByMode.set(modeSlug, []);
    }

    filesByMode.get(modeSlug).push(normalizedEntry);
  }

  if (!filesByMode.size) {
    throw new Error('No Figma token JSON files found. Run npm run sync:figma first.');
  }

  const baseSlug = determineBaseSlug(Array.from(filesByMode.keys()));
  const buildPath = path.join(process.cwd(), 'build', 'css');
  await fs.mkdir(buildPath, { recursive: true });

  const baseEntries = filesByMode.get(baseSlug);
  if (!baseEntries) {
    throw new Error('Base mode entries missing; unable to build tokens.');
  }

  // Always include color primitives (light mode) for reference resolution
  const lightColorPrimitives = colorPrimitiveFiles.filter(f => f.mode.slug === 'light');
  const baseTokens = await loadTokensForMode([...lightColorPrimitives, ...baseEntries]);

  const baseCssPath = path.join('build', 'css', 'tokens-base.css');

  for (const [modeSlug, entries] of filesByMode.entries()) {
    const isBase = modeSlug === baseSlug;
    const destination = isBase ? 'tokens-base.css' : `tokens-${modeSlug}.css`;
    const selector = isBase ? ':root' : `:root[data-theme="${modeSlug}"]`;

    // For non-base modes, also include the appropriate color primitives
    const colorPrimitivesForMode = isBase 
      ? [] 
      : colorPrimitiveFiles.filter(f => {
          // Match color primitive mode to the current mode (light/dark)
          return f.mode.slug === modeSlug || 
                 (modeSlug === 'dark' && f.mode.slug === 'dark') ||
                 (modeSlug !== 'dark' && f.mode.slug === 'light');
        });
    
    const modeTokens = isBase
      ? baseTokens
      : mergeTokenTrees(clone(baseTokens), await loadTokensForMode([...colorPrimitivesForMode, ...entries]));

    await buildCssFromTokens(modeTokens, { destination, selector });

    if (!isBase) {
      await pruneCssDuplicates(baseCssPath, path.join('build', 'css', destination));
    }
  }
}

async function buildCssFromTokens(tokens, { destination, selector, filter }) {
  const fileConfig = {
    destination,
    format: 'css/variables',
    options: {
      outputReferences: true,
      selector
    }
  };

  if (typeof filter === 'function') {
    fileConfig.filter = token => filter(token);
  }

  const sd = new StyleDictionary({
    tokens,
    log: {
      verbosity: process.env.STYLE_DICTIONARY_VERBOSITY || 'verbose'
    },
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'build/css/',
        files: [fileConfig]
      }
    }
  });

  await sd.buildAllPlatforms();
}

async function loadTokensForMode(entries) {
  const aggregate = {};

  for (const entry of entries) {
    const filePath = path.join(FIGMA_TOKENS_DIR, entry.fileName);
    let contents;

    try {
      contents = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Figma token file ${entry.fileName} is missing. Run npm run sync:figma to regenerate.`);
      }
      throw error;
    }

    let tokens;
    try {
      tokens = JSON.parse(contents);
    } catch (error) {
      throw new Error(`Unable to parse Figma token file ${entry.fileName}: ${error.message}`);
    }

    mergeTokens(aggregate, tokens);
  }

  applyUnitConversions(aggregate);

  return aggregate;
}

function mergeTokenTrees(baseTokens, overrideTokens) {
  return mergeTokens(baseTokens, overrideTokens, []);
}

function applyUnitConversions(tokens) {
  const maps = {
    fontSize: {
      valueByKey: new Map(),
      keyByValue: new Map()
    },
    lineHeight: {
      valueByKey: new Map(),
      keyByValue: new Map()
    },
    aliasPairs: new Map(),
    lineHeightToFontSize: new Map()
  };

  collectTypographyDimensions(tokens, [], maps);
  populateLineHeightFontSizeMap(maps);
  ensureLineHeightPrimitives(tokens, maps);
  convertNumberTokens(tokens, [], maps);
}

function collectTypographyDimensions(node, path, maps) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if ('$value' in node) {
    const value = node.$value;

    if (typeof value === 'number') {
      const context = getTypographyContext(path);
      const { scope, key, alias, property } = context;

      if (scope === 'font-size') {
        maps.fontSize.valueByKey.set(key ?? alias, value);
        if (key && isNumericKey(key)) {
          maps.fontSize.keyByValue.set(value, key);
        }
        if (alias) {
          if (!maps.aliasPairs.has(alias)) {
            maps.aliasPairs.set(alias, {});
          }
          maps.aliasPairs.get(alias).fontSize = value;
        }
      } else if (scope === 'line-height') {
        maps.lineHeight.valueByKey.set(key ?? alias, value);
        if (key && isNumericKey(key)) {
          maps.lineHeight.keyByValue.set(value, key);
        }
        if (alias) {
          if (!maps.aliasPairs.has(alias)) {
            maps.aliasPairs.set(alias, {});
          }
          maps.aliasPairs.get(alias).lineHeight = value;
        }
      }
    }

    if (typeof value === 'string') {
      const context = getTypographyContext(path);
      const { alias, property } = context;
      const match = value.match(/^\{typography\.(font-size|line-height)\.([^}]+)\}$/u);
      if (match && alias) {
        const type = match[1];
        const refKey = match[2];
        if (!maps.aliasPairs.has(alias)) {
          maps.aliasPairs.set(alias, {});
        }
        if (type === 'font-size' && property === 'font-size') {
          maps.aliasPairs.get(alias).fontSizeRef = refKey;
        } else if (type === 'line-height' && property === 'line-height') {
          maps.aliasPairs.get(alias).lineHeightRef = refKey;
        }
      }
    }

    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) {
      continue;
    }
    collectTypographyDimensions(value, [...path, key], maps);
  }
}

function populateLineHeightFontSizeMap(maps) {
  for (const info of maps.aliasPairs.values()) {
    const lineHeightValue = info.lineHeight ?? (info.lineHeightRef ? maps.lineHeight.valueByKey.get(info.lineHeightRef) : undefined);
    const fontSizeValue = info.fontSize ?? (info.fontSizeRef ? maps.fontSize.valueByKey.get(info.fontSizeRef) : undefined);

    if (lineHeightValue == null || fontSizeValue == null) {
      continue;
    }

    const key = String(lineHeightValue);
    if (!maps.lineHeightToFontSize.has(key)) {
      maps.lineHeightToFontSize.set(key, fontSizeValue);
    }
  }
}

function ensureLineHeightPrimitives(tokens, maps) {
  const typography = tokens.typography;
  const lineHeightRoot = typography && typography['line-height'];
  if (!lineHeightRoot) {
    return;
  }

  for (const [valueStr, fontPx] of maps.lineHeightToFontSize.entries()) {
    const numericValue = Number(valueStr);
    if (!Number.isFinite(numericValue)) {
      continue;
    }

    if (!maps.lineHeight.keyByValue.has(numericValue)) {
      const key = stripTrailingZeros(numericValue);
      if (!lineHeightRoot[key]) {
        lineHeightRoot[key] = {
          $type: 'number',
          $value: numericValue,
          $description: '',
          $extensions: {
            'com.figma': {
              hiddenFromPublishing: true,
              scopes: ['LINE_HEIGHT'],
              codeSyntax: {}
            }
          }
        };
      }

      maps.lineHeight.valueByKey.set(key, numericValue);
      maps.lineHeight.keyByValue.set(numericValue, key);
    }
  }
}

function getTypographyContext(path) {
  const [head, first, second] = path;
  const PROPERTY_NAMES = new Set(['font-size', 'line-height', 'font-family']);

  if (head !== 'typography') {
    return { scope: undefined, key: undefined, alias: undefined, property: undefined };
  }

  if (PROPERTY_NAMES.has(first) && second) {
    const alias = isNumericKey(second) ? undefined : second;
    return { scope: first, key: second, alias, property: first };
  }

  if (!isNumericKey(first) && PROPERTY_NAMES.has(second)) {
    return { scope: second, key: undefined, alias: first, property: second };
  }

  return { scope: undefined, key: undefined, alias: undefined, property: undefined };
}

function convertNumberTokens(node, path, maps) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if ('$value' in node && typeof node.$value === 'number') {
    const context = getTypographyContext(path);
    const { scope, key, alias, property } = context;
    const value = node.$value;

    if (scope === 'font-size') {
      if (key && isNumericKey(key)) {
        node.$value = toRem(value);
      } else {
        const referenceKey = findNumericKey(maps.fontSize.keyByValue, value);
        node.$value = referenceKey
          ? `{typography.font-size.${referenceKey}}`
          : toRem(value);
      }
    } else if (scope === 'line-height') {
      const mappedFontPx = maps.lineHeightToFontSize.get(String(value));
      const aliasFontPx = alias && maps.aliasPairs.get(alias) && maps.aliasPairs.get(alias).fontSize;
      const fallbackFontPx = key ? maps.fontSize.valueByKey.get(key) : undefined;
      const fontPx = mappedFontPx ?? aliasFontPx ?? fallbackFontPx;
      const ratio = stripTrailingZeros(fontPx ? value / fontPx : value / 16, 10);

      if (key && isNumericKey(key)) {
        node.$value = ratio;
      } else {
        const referenceKey = findNumericKey(maps.lineHeight.keyByValue, value);
        node.$value = referenceKey ? `{typography.line-height.${referenceKey}}` : ratio;
      }
    } else if (path[0] === 'opacity') {
      node.$value = roundTo(Math.max(0, Math.min(1, value / 100)), 4);
    } else {
      node.$value = toPx(value);
    }
    return;
  }

  if ('$value' in node && typeof node.$value === 'string') {
    const context = getTypographyContext(path);
    const { scope } = context;

    if (scope === 'font-family') {
      node.$value = quoteFontFamily(node.$value);
    }

    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) {
      continue;
    }
    convertNumberTokens(value, [...path, key], maps);
  }
}

function mergeTokens(target, source, path = []) {
  for (const [key, value] of Object.entries(source)) {
    const currentPath = [...path, key];
    
    if (isTokenGroup(value)) {
      if (!isTokenGroup(target[key])) {
        target[key] = {};
      }
      mergeTokens(target[key], value, currentPath);
    } else {
      // Silently overwrite duplicate tokens - this is expected when merging
      // multiple token files that may have overlapping definitions.
      // The latest value (from source) will be used, which is the desired behavior.
      target[key] = clone(value);
    }
  }

  return target;
}

function isTokenGroup(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && !('$value' in value);
}

function clone(value) {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function tokensEqual(a, b) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (error) {
    return false;
  }
}

function toPx(value) {
  if (value === 0) {
    return '0px';
  }
  return `${stripTrailingZeros(value)}px`;
}

function toRem(value) {
  if (value === 0) {
    return '0rem';
  }
  const remValue = value / 16;
  return `${stripTrailingZeros(remValue)}rem`;
}

function roundTo(value, precision) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function stripTrailingZeros(value, precision = 4) {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  const formatted = value.toFixed(precision);
  return formatted
    .replace(/(\.\d*?[1-9])0+$/u, '$1')
    .replace(/\.0+$/u, '')
    .replace(/\.$/u, '');
}

function isNumericKey(key) {
  return /^\d+(?:\.\d+)?$/u.test(key);
}

function findNumericKey(map, value) {
  if (map.has(value)) {
    return map.get(value);
  }

  for (const [storedValue, key] of map.entries()) {
    if (Math.abs(storedValue - value) < 1e-6) {
      return key;
    }
  }

  return undefined;
}

function quoteFontFamily(value) {
  const string = String(value).trim();

  if (/^(['"]).*\1$/u.test(string)) {
    return string;
  }

  if (/\s/u.test(string)) {
    return `"${string.replace(/"/g, '\\"')}"`;
  }

  return string;
}

async function pruneCssDuplicates(baseFile, targetFile) {
  try {
    const [baseContent, targetContent] = await Promise.all([
      fs.readFile(baseFile, 'utf8'),
      fs.readFile(targetFile, 'utf8')
    ]);

    const baseVariables = new Set(
      baseContent
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.startsWith('--'))
    );

    const targetLines = targetContent.split(/\r?\n/);
    const resultLines = [];

    for (const line of targetLines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('--') && baseVariables.has(trimmed)) {
        continue;
      }

      if (!trimmed && resultLines.length > 0 && resultLines[resultLines.length - 1].trim() === '') {
        continue;
      }

      resultLines.push(line);
    }

    while (resultLines.length > 0 && resultLines[resultLines.length - 1].trim() === '') {
      resultLines.pop();
    }

    const updatedContent = `${resultLines.join('\n')}\n`;

    if (updatedContent !== targetContent) {
      await fs.writeFile(targetFile, updatedContent, 'utf8');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

async function buildFromLocalFiles() {
  await buildFoundations();
  for (const theme of THEMES) {
    await buildTheme(theme);
  }
}

async function buildFoundations() {
  const sd = new StyleDictionary({
    source: FOUNDATION_SOURCES,
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'build/css/',
        files: [
          {
            destination: 'tokens-base.css',
            format: 'css/variables',
            options: {
              outputReferences: true,
              selector: ':root'
            }
          }
        ]
      }
    }
  });

  await sd.buildAllPlatforms();
}

async function buildTheme({ name, selector }) {
  const sd = new StyleDictionary({
    source: [`primitives/colors/${name}.json`, `alias/colors/${name}.json`],
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'build/css/',
        files: [
          {
            destination: `tokens-${name}.css`,
            format: 'css/variables',
            options: {
              outputReferences: true,
              selector
            }
          }
        ]
      }
    }
  });

  await sd.buildAllPlatforms();
}

function determineBaseSlug(slugs) {
  const preferred = [process.env.FIGMA_BASE_MODE, 'mode-1', 'default', 'base', 'light'];
  for (const candidate of preferred) {
    if (!candidate) {
      continue;
    }
    const normalized = toSlug(candidate);
    if (slugs.includes(normalized)) {
      return normalized;
    }
  }
  return slugs[0];
}

function toSlug(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || 'token';
}
