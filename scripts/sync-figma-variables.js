#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');

// Variable collections we want to ignore entirely when exporting.
const EXCLUDED_COLLECTION_IDS = new Set([
  'VariableCollectionId:615453529a3e5f28b1a63fa69f5f3131a7400bb8/8335:3614'
]);

async function main() {
  try {
    await hydrateEnv();

    const token = process.env.FIGMA_REST_API;
    const fileId = process.env.FIGMA_FILE_ID;
    const apiBase = process.env.FIGMA_API_BASE_URL || 'https://api.figma.com';

    if (!token) {
      throw new Error('Missing FIGMA_REST_API environment variable (Figma personal access token).');
    }

    if (!fileId) {
      throw new Error('Missing FIGMA_FILE_ID environment variable (Figma file key).');
    }

    const endpoint = new URL(`/v1/files/${fileId}/variables/local`, apiBase);

    const response = await fetch(endpoint, {
      headers: {
        'X-Figma-Token': token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const detail = await safeParseJson(response);
      throw new Error(`Failed to fetch Figma variables (${response.status} ${response.statusText}): ${detail}`);
    }

    const payload = await response.json();
    const variables = normalizeVariables(payload);
    const collections = normalizeCollections(payload);

    if (!variables.length) {
      console.warn('Warning: no variables returned from Figma. Check that the file contains variables and the token has access.');
    }

    const transformResult = transformVariables({ variables, collections });

    const outputDir = path.join(process.cwd(), 'tokens');
    await fs.mkdir(outputDir, { recursive: true });
    await cleanOutputDirectory(outputDir);

    await Promise.all([
      fs.writeFile(
        path.join(outputDir, 'raw.json'),
        JSON.stringify(payload, null, 2) + '\n',
        'utf8'
      ),
      fs.writeFile(
        path.join(outputDir, 'metadata.json'),
        JSON.stringify({
          fileId,
          apiBase,
          generatedAt: new Date().toISOString(),
          files: transformResult.files
        }, null, 2) + '\n',
        'utf8'
      )
    ]);

    for (const [fileName, record] of transformResult.tokenFiles.entries()) {
      const filePath = path.join(outputDir, fileName);
      await fs.writeFile(filePath, JSON.stringify(record.tokens, null, 2) + '\n', 'utf8');
    }

    console.log(
      `Synced ${transformResult.variableCount} variables across ${transformResult.modeCount} modes from Figma.`
    );
  } catch (error) {
    console.error('Figma variable sync failed.');
    console.error(error);
    process.exitCode = 1;
  }
}

async function hydrateEnv() {
  if (process.env.FIGMA_REST_API && process.env.FIGMA_FILE_ID) {
    return;
  }

  const envPath = path.join(process.cwd(), '.env');

  try {
    const contents = await fs.readFile(envPath, 'utf8');
    const vars = parseEnv(contents);
    for (const [key, value] of Object.entries(vars)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function parseEnv(contents) {
  const vars = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, eqIndex).trim();
    const rawValue = trimmed.slice(eqIndex + 1).trim();
    const value = stripQuotes(rawValue);
    if (key) {
      vars[key] = value;
    }
  }
  return vars;
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
    return value.slice(1, -1);
  }
  return value;
}

async function cleanOutputDirectory(outputDir) {
  let entries = [];
  try {
    entries = await fs.readdir(outputDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }
    throw error;
  }

  await Promise.all(
    entries
      .filter(name => name.endsWith('.json'))
      .map(async name => {
        const filePath = path.join(outputDir, name);
        await fs.rm(filePath, { force: true });
      })
  );
}

function normalizeVariables(payload) {
  const candidateSets = [
    payload.variables,
    payload.meta?.variables
  ];

  for (const candidate of candidateSets) {
    if (!candidate) {
      continue;
    }
    if (Array.isArray(candidate)) {
      return candidate;
    }
    if (typeof candidate === 'object') {
      return Object.values(candidate);
    }
  }

  return [];
}

function normalizeCollections(payload) {
  const sources = [payload.variableCollections, payload.meta?.variableCollections];

  for (const source of sources) {
    if (!source) {
      continue;
    }
    if (Array.isArray(source)) {
      return source;
    }
    if (typeof source === 'object') {
      return Object.values(source);
    }
  }

  return [];
}

function transformVariables({ variables, collections }) {
  const iterableCollections = Array.isArray(collections)
    ? collections.filter(collection => !EXCLUDED_COLLECTION_IDS.has(collection.id))
    : [];
  const collectionById = new Map();
  const modeInfoById = new Map();
  const fileRecords = new Map();
  const variablesById = new Map();

  for (const variable of variables) {
    if (variable && variable.id) {
      variablesById.set(variable.id, variable);
    }
  }

  for (const collection of iterableCollections) {
    if (!collection || !collection.id) {
      continue;
    }

    collectionById.set(collection.id, collection);

    const collectionSlug = toSlug(collection.name || 'collection');
    const collectionIdSlug = toSlug(collection.id || 'collection');

    for (const mode of collection.modes || []) {
      const modeSlug = toSlug(mode.name || 'default');
      const fileName = `${collectionSlug}-${collectionIdSlug}.${modeSlug}.json`;
      const info = {
        collectionId: collection.id,
        collectionName: collection.name || 'Collection',
        collectionSlug,
        collectionIdSlug,
        modeId: mode.modeId,
        modeName: mode.name || 'Mode',
        modeSlug,
        fileName
      };

      modeInfoById.set(mode.modeId, info);

      if (!fileRecords.has(fileName)) {
        fileRecords.set(fileName, {
          info,
          tokens: {}
        });
      }
    }
  }

  for (const variable of variables) {
    if (!variable || variable.remote) {
      continue;
    }

    const collectionId = variable.variableCollectionId || variable.variableCollection;
    const collection = collectionById.get(collectionId);
    if (!collection) {
      continue;
    }
    if (!collection) {
      continue;
    }

    const pathSegments = splitVariablePath(variable);

    for (const [modeId, rawValue] of Object.entries(variable.valuesByMode || {})) {
      const modeInfo = modeInfoById.get(modeId);
      if (!modeInfo) {
        continue;
      }

      const record = fileRecords.get(modeInfo.fileName);
      if (!record) {
        continue;
      }

      const value = tokenValueFromVariable(variable, rawValue, variablesById);
      if (value === undefined) {
        continue;
      }

      const token = createToken(variable, value);
      setTokenAtPath(record.tokens, pathSegments, token);
    }
  }

  const files = Array.from(fileRecords.values()).map(record => ({
    fileName: record.info.fileName,
    collection: {
      id: record.info.collectionId,
      name: record.info.collectionName,
      slug: record.info.collectionSlug,
      idSlug: record.info.collectionIdSlug
    },
    mode: {
      id: record.info.modeId,
      name: record.info.modeName,
      slug: record.info.modeSlug
    }
  }));

  const modeCount = new Set(files.map(file => file.mode.slug)).size;

  return {
    files,
    tokenFiles: fileRecords,
    variableCount: variables.length,
    modeCount
  };
}

function splitVariablePath(variable) {
  const segments = (variable.name || '')
    .split('/')
    .map(segment => toSlug(segment))
    .filter(Boolean);

  if (!segments.length) {
    segments.push(toSlug(variable.id || 'token'));
  }

  return segments;
}

function createToken(variable, value) {
  const token = {
    $type: tokenTypeFromVariable(variable),
    $value: value,
    $description: variable.description || ''
  };

  token.$extensions = {
    'com.figma': {
      hiddenFromPublishing: Boolean(variable.hiddenFromPublishing),
      scopes: Array.isArray(variable.scopes) ? variable.scopes : [],
      codeSyntax: variable.codeSyntax || {}
    }
  };

  return token;
}

function tokenTypeFromVariable(variable) {
  switch (variable.resolvedType) {
    case 'BOOLEAN':
      return 'boolean';
    case 'COLOR':
      return 'color';
    case 'FLOAT':
      return 'number';
    case 'STRING':
      return 'string';
    default:
      return 'string';
  }
}

function tokenValueFromVariable(variable, rawValue, variablesById) {
  if (rawValue == null) {
    return undefined;
  }

  if (typeof rawValue === 'object' && !Array.isArray(rawValue)) {
    if (rawValue.type === 'VARIABLE_ALIAS' && rawValue.id) {
      const target = variablesById.get(rawValue.id);
      if (!target) {
        console.warn(`Warning: unknown alias target ${rawValue.id} for variable ${variable.name}. Skipping.`);
        return undefined;
      }
      const aliasPath = splitVariablePath(target).join('.');
      return `{${aliasPath}}`;
    }

    if ('r' in rawValue && 'g' in rawValue && 'b' in rawValue) {
      return colorToHex(rawValue);
    }
  }

  switch (variable.resolvedType) {
    case 'COLOR':
      return colorToHex(rawValue);
    case 'FLOAT':
      return typeof rawValue === 'number' ? rawValue : Number(rawValue);
    case 'STRING':
      return String(rawValue);
    case 'BOOLEAN':
      return Boolean(rawValue);
    default:
      return rawValue;
  }
}

function colorToHex(value) {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const r = clampTo255(value.r);
  const g = clampTo255(value.g);
  const b = clampTo255(value.b);
  const a = clampTo255(value.a !== undefined ? value.a : 1);

  const hex = [r, g, b].map(toHex).join('');
  const alphaHex = a < 255 ? toHex(a) : '';
  return `#${hex}${alphaHex}`.toUpperCase();
}

function clampTo255(component) {
  const number = typeof component === 'number' ? component : Number(component);
  if (Number.isNaN(number)) {
    return 0;
  }
  if (number <= 1) {
    return Math.round(number * 255);
  }
  return Math.round(Math.min(Math.max(number, 0), 255));
}

function toHex(component) {
  return component.toString(16).padStart(2, '0');
}

function setTokenAtPath(target, pathSegments, value) {
  if (!Array.isArray(pathSegments) || !pathSegments.length) {
    return;
  }

  let cursor = target;
  const lastIndex = pathSegments.length - 1;

  for (let index = 0; index < lastIndex; index += 1) {
    const segment = pathSegments[index];
    if (!cursor[segment] || typeof cursor[segment] !== 'object' || Array.isArray(cursor[segment])) {
      cursor[segment] = {};
    }
    if ('$value' in cursor[segment]) {
      console.warn(`Warning: token path conflict at ${pathSegments.slice(0, index + 1).join('.')}. Overwriting existing value.`);
      cursor[segment] = {};
    }
    cursor = cursor[segment];
  }

  const lastSegment = pathSegments[lastIndex];
  if (cursor[lastSegment] && typeof cursor[lastSegment] === 'object' && '$value' in cursor[lastSegment]) {
    console.warn(`Warning: duplicate token at ${pathSegments.join('.')}. Overwriting.`);
  }
  cursor[lastSegment] = value;
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

async function safeParseJson(response) {
  try {
    const text = await response.text();
    return text ? JSON.stringify(JSON.parse(text), null, 2) : '<empty body>';
  } catch (error) {
    return '<unparseable body>';
  }
}

main();
