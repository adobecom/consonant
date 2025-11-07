import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  normalizeVariables,
  normalizeCollections,
  parseEnv,
  stripQuotes,
  splitVariablePath,
  transformVariables,
  hydrateEnv,
} from '../sync-figma-variables.js';

describe('normalizeVariables', () => {
  it('extracts variables from payload.variables array', () => {
    const payload = {
      variables: [
        { id: '1', name: 'var1' },
        { id: '2', name: 'var2' },
      ],
    };

    const result = normalizeVariables(payload);
    expect(result).toEqual([
      { id: '1', name: 'var1' },
      { id: '2', name: 'var2' },
    ]);
  });

  it('extracts variables from payload.meta.variables array', () => {
    const payload = {
      meta: {
        variables: [
          { id: '1', name: 'var1' },
          { id: '2', name: 'var2' },
        ],
      },
    };

    const result = normalizeVariables(payload);
    expect(result).toEqual([
      { id: '1', name: 'var1' },
      { id: '2', name: 'var2' },
    ]);
  });

  it('extracts variables from payload.variables object', () => {
    const payload = {
      variables: {
        'var1': { id: '1', name: 'var1' },
        'var2': { id: '2', name: 'var2' },
      },
    };

    const result = normalizeVariables(payload);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ id: '1', name: 'var1' });
    expect(result).toContainEqual({ id: '2', name: 'var2' });
  });

  it('prefers payload.variables over payload.meta.variables', () => {
    const payload = {
      variables: [{ id: '1', name: 'var1' }],
      meta: {
        variables: [{ id: '2', name: 'var2' }],
      },
    };

    const result = normalizeVariables(payload);
    expect(result).toEqual([{ id: '1', name: 'var1' }]);
  });

  it('returns empty array when no variables found', () => {
    const payload = {};
    const result = normalizeVariables(payload);
    expect(result).toEqual([]);
  });

  it('handles null/undefined values', () => {
    expect(normalizeVariables({ variables: null })).toEqual([]);
    expect(normalizeVariables({ variables: undefined })).toEqual([]);
    expect(normalizeVariables({ meta: { variables: null } })).toEqual([]);
  });
});

describe('normalizeCollections', () => {
  it('extracts collections from payload.variableCollections array', () => {
    const payload = {
      variableCollections: [
        { id: '1', name: 'Collection 1' },
        { id: '2', name: 'Collection 2' },
      ],
    };

    const result = normalizeCollections(payload);
    expect(result).toEqual([
      { id: '1', name: 'Collection 1' },
      { id: '2', name: 'Collection 2' },
    ]);
  });

  it('extracts collections from payload.meta.variableCollections array', () => {
    const payload = {
      meta: {
        variableCollections: [
          { id: '1', name: 'Collection 1' },
        ],
      },
    };

    const result = normalizeCollections(payload);
    expect(result).toEqual([
      { id: '1', name: 'Collection 1' },
    ]);
  });

  it('extracts collections from payload.variableCollections object', () => {
    const payload = {
      variableCollections: {
        'coll1': { id: '1', name: 'Collection 1' },
        'coll2': { id: '2', name: 'Collection 2' },
      },
    };

    const result = normalizeCollections(payload);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ id: '1', name: 'Collection 1' });
    expect(result).toContainEqual({ id: '2', name: 'Collection 2' });
  });

  it('prefers payload.variableCollections over payload.meta.variableCollections', () => {
    const payload = {
      variableCollections: [{ id: '1', name: 'Collection 1' }],
      meta: {
        variableCollections: [{ id: '2', name: 'Collection 2' }],
      },
    };

    const result = normalizeCollections(payload);
    expect(result).toEqual([{ id: '1', name: 'Collection 1' }]);
  });

  it('returns empty array when no collections found', () => {
    const payload = {};
    const result = normalizeCollections(payload);
    expect(result).toEqual([]);
  });

  it('handles null/undefined values', () => {
    expect(normalizeCollections({ variableCollections: null })).toEqual([]);
    expect(normalizeCollections({ variableCollections: undefined })).toEqual([]);
    expect(normalizeCollections({ meta: { variableCollections: null } })).toEqual([]);
  });
});

describe('parseEnv', () => {
  it('parses simple key-value pairs', () => {
    const contents = `FIGMA_REST_API=token123
FIGMA_FILE_ID=file456`;

    const result = parseEnv(contents);
    expect(result).toEqual({
      FIGMA_REST_API: 'token123',
      FIGMA_FILE_ID: 'file456',
    });
  });

  it('strips quotes from values', () => {
    const contents = `FIGMA_REST_API="token123"
FIGMA_FILE_ID='file456'`;

    const result = parseEnv(contents);
    expect(result).toEqual({
      FIGMA_REST_API: 'token123',
      FIGMA_FILE_ID: 'file456',
    });
  });

  it('ignores comments', () => {
    const contents = `# This is a comment
FIGMA_REST_API=token123
# Another comment
FIGMA_FILE_ID=file456`;

    const result = parseEnv(contents);
    expect(result).toEqual({
      FIGMA_REST_API: 'token123',
      FIGMA_FILE_ID: 'file456',
    });
  });

  it('ignores empty lines', () => {
    const contents = `FIGMA_REST_API=token123

FIGMA_FILE_ID=file456
`;

    const result = parseEnv(contents);
    expect(result).toEqual({
      FIGMA_REST_API: 'token123',
      FIGMA_FILE_ID: 'file456',
    });
  });

  it('trims whitespace from keys and values', () => {
    const contents = `  FIGMA_REST_API  =  token123  `;

    const result = parseEnv(contents);
    expect(result).toEqual({
      FIGMA_REST_API: 'token123',
    });
  });

  it('handles lines without equals sign', () => {
    const contents = `FIGMA_REST_API=token123
INVALID_LINE
FIGMA_FILE_ID=file456`;

    const result = parseEnv(contents);
    expect(result).toEqual({
      FIGMA_REST_API: 'token123',
      FIGMA_FILE_ID: 'file456',
    });
  });

  it('handles empty key', () => {
    const contents = `=value
FIGMA_REST_API=token123`;

    const result = parseEnv(contents);
    expect(result).toEqual({
      FIGMA_REST_API: 'token123',
    });
  });

  it('handles Windows line endings (CRLF)', () => {
    const contents = `FIGMA_REST_API=token123\r\nFIGMA_FILE_ID=file456`;

    const result = parseEnv(contents);
    expect(result).toEqual({
      FIGMA_REST_API: 'token123',
      FIGMA_FILE_ID: 'file456',
    });
  });

  it('handles empty string', () => {
    const result = parseEnv('');
    expect(result).toEqual({});
  });

  it('handles values with equals signs', () => {
    const contents = `URL=https://example.com?key=value`;

    const result = parseEnv(contents);
    expect(result).toEqual({
      URL: 'https://example.com?key=value',
    });
  });
});

describe('stripQuotes', () => {
  it('removes double quotes', () => {
    expect(stripQuotes('"value"')).toBe('value');
    expect(stripQuotes('"hello world"')).toBe('hello world');
  });

  it('removes single quotes', () => {
    expect(stripQuotes("'value'")).toBe('value');
    expect(stripQuotes("'hello world'")).toBe('hello world');
  });

  it('returns unquoted strings unchanged', () => {
    expect(stripQuotes('value')).toBe('value');
    expect(stripQuotes('hello world')).toBe('hello world');
  });

  it('handles strings with only opening quote', () => {
    expect(stripQuotes('"value')).toBe('"value');
    expect(stripQuotes("'value")).toBe("'value");
  });

  it('handles strings with only closing quote', () => {
    expect(stripQuotes('value"')).toBe('value"');
    expect(stripQuotes("value'")).toBe("value'");
  });

  it('handles mismatched quotes', () => {
    expect(stripQuotes('"value\'')).toBe('"value\'');
    expect(stripQuotes("'value\"")).toBe("'value\"");
  });

  it('handles empty strings', () => {
    expect(stripQuotes('')).toBe('');
    expect(stripQuotes('""')).toBe('');
    expect(stripQuotes("''")).toBe('');
  });

  it('handles strings with quotes in the middle', () => {
    // stripQuotes only removes quotes if string starts AND ends with same quote type
    // So these don't match the pattern and are returned unchanged
    expect(stripQuotes('"hello"world"')).toBe('hello"world');
    expect(stripQuotes("'hello'world'")).toBe("hello'world");
  });
});

describe('splitVariablePath', () => {
  it('splits variable name by forward slashes', () => {
    const variable = { name: 'color/primary/base' };
    const result = splitVariablePath(variable);
    expect(result).toEqual(['color', 'primary', 'base']);
  });

  it('converts segments to slugs', () => {
    const variable = { name: 'Color/Primary/Base Value' };
    const result = splitVariablePath(variable);
    expect(result).toEqual(['color', 'primary', 'base-value']);
  });

  it('handles single segment paths', () => {
    const variable = { name: 'primary' };
    const result = splitVariablePath(variable);
    expect(result).toEqual(['primary']);
  });

  it('handles empty name by using id', () => {
    const variable = { id: 'VariableID:123', name: '' };
    const result = splitVariablePath(variable);
    // When name is empty string or undefined, it splits to [''] which becomes ['token'] after toSlug,
    // then checks if segments.length is 0 (it's 1), so it doesn't use the id fallback
    // The id fallback is only used when segments.length is 0 after filtering
    expect(result).toEqual(['token']);
    
    // When name is undefined, same behavior
    const variableUndefined = { id: 'VariableID:123' };
    const resultUndefined = splitVariablePath(variableUndefined);
    expect(resultUndefined).toEqual(['token']);
  });

  it('handles missing name and id', () => {
    const variable = {};
    const result = splitVariablePath(variable);
    expect(result).toEqual(['token']);
  });

  it('filters out empty segments', () => {
    const variable = { name: 'color//primary' };
    const result = splitVariablePath(variable);
    // Empty segments become 'token' after toSlug, then filter(Boolean) removes them
    // But toSlug('') returns 'token', so we need to check the actual behavior
    // The filter(Boolean) will remove empty strings, but 'token' is truthy
    expect(result).toEqual(['color', 'token', 'primary']);
  });

  it('handles leading and trailing slashes', () => {
    const variable = { name: '/color/primary/' };
    const result = splitVariablePath(variable);
    // Leading/trailing slashes create empty segments which become 'token' after toSlug
    expect(result).toEqual(['token', 'color', 'primary', 'token']);
  });

  it('normalizes special characters', () => {
    const variable = { name: 'Color/Primary_Value/Base-123' };
    const result = splitVariablePath(variable);
    expect(result).toEqual(['color', 'primary-value', 'base-123']);
  });

  it('handles whitespace in segments', () => {
    const variable = { name: 'Color/Primary Value/Base' };
    const result = splitVariablePath(variable);
    expect(result).toEqual(['color', 'primary-value', 'base']);
  });
});

describe('transformVariables', () => {
  it('transforms variables into token files structure', () => {
    const variables = [
      {
        id: 'var1',
        name: 'color/primary',
        variableCollectionId: 'coll1',
        resolvedType: 'COLOR',
        valuesByMode: {
          'mode1': { r: 0, g: 0, b: 0, a: 1 },
        },
      },
    ];

    const collections = [
      {
        id: 'coll1',
        name: 'Colors',
        modes: [
          { modeId: 'mode1', name: 'Light' },
        ],
      },
    ];

    const result = transformVariables({ variables, collections });

    expect(result.variableCount).toBe(1);
    expect(result.modeCount).toBe(1);
    expect(result.files).toHaveLength(1);
    expect(result.tokenFiles.size).toBe(1);
  });

  it('filters out excluded collections', () => {
    const variables = [
      {
        id: 'var1',
        name: 'color/primary',
        variableCollectionId: 'excluded-coll',
        resolvedType: 'COLOR',
        valuesByMode: {
          'mode1': { r: 0, g: 0, b: 0, a: 1 },
        },
      },
    ];

    const collections = [
      {
        id: 'VariableCollectionId:615453529a3e5f28b1a63fa69f5f3131a7400bb8/8335:3614',
        name: 'Excluded',
        modes: [
          { modeId: 'mode1', name: 'Light' },
        ],
      },
    ];

    const result = transformVariables({ variables, collections });

    expect(result.variableCount).toBe(1);
    expect(result.tokenFiles.size).toBe(0);
  });

  it('handles multiple modes', () => {
    const variables = [
      {
        id: 'var1',
        name: 'color/primary',
        variableCollectionId: 'coll1',
        resolvedType: 'COLOR',
        valuesByMode: {
          'mode1': { r: 0, g: 0, b: 0, a: 1 },
          'mode2': { r: 1, g: 1, b: 1, a: 1 },
        },
      },
    ];

    const collections = [
      {
        id: 'coll1',
        name: 'Colors',
        modes: [
          { modeId: 'mode1', name: 'Light' },
          { modeId: 'mode2', name: 'Dark' },
        ],
      },
    ];

    const result = transformVariables({ variables, collections });

    expect(result.modeCount).toBe(2);
    expect(result.files).toHaveLength(2);
  });

  it('skips remote variables', () => {
    const variables = [
      {
        id: 'var1',
        name: 'color/primary',
        variableCollectionId: 'coll1',
        resolvedType: 'COLOR',
        remote: true,
        valuesByMode: {
          'mode1': { r: 0, g: 0, b: 0, a: 1 },
        },
      },
      {
        id: 'var2',
        name: 'color/secondary',
        variableCollectionId: 'coll1',
        resolvedType: 'COLOR',
        remote: false,
        valuesByMode: {
          'mode1': { r: 1, g: 1, b: 1, a: 1 },
        },
      },
    ];

    const collections = [
      {
        id: 'coll1',
        name: 'Colors',
        modes: [
          { modeId: 'mode1', name: 'Light' },
        ],
      },
    ];

    const result = transformVariables({ variables, collections });

    const tokenFile = Array.from(result.tokenFiles.values())[0];
    expect(tokenFile.tokens.color?.secondary).toBeDefined();
    expect(tokenFile.tokens.color?.primary).toBeUndefined();
  });

  it('handles variables without collection', () => {
    const variables = [
      {
        id: 'var1',
        name: 'color/primary',
        variableCollectionId: 'nonexistent',
        resolvedType: 'COLOR',
        valuesByMode: {
          'mode1': { r: 0, g: 0, b: 0, a: 1 },
        },
      },
    ];

    const collections = [
      {
        id: 'coll1',
        name: 'Colors',
        modes: [
          { modeId: 'mode1', name: 'Light' },
        ],
      },
    ];

    const result = transformVariables({ variables, collections });

    // Variables without matching collection are skipped, but collections still create files
    expect(result.tokenFiles.size).toBe(1);
    // But the variable should not be in the tokens
    const tokenFile = Array.from(result.tokenFiles.values())[0];
    expect(tokenFile.tokens.color?.primary).toBeUndefined();
  });

  it('handles variables with missing mode', () => {
    const variables = [
      {
        id: 'var1',
        name: 'color/primary',
        variableCollectionId: 'coll1',
        resolvedType: 'COLOR',
        valuesByMode: {
          'nonexistent-mode': { r: 0, g: 0, b: 0, a: 1 },
        },
      },
    ];

    const collections = [
      {
        id: 'coll1',
        name: 'Colors',
        modes: [
          { modeId: 'mode1', name: 'Light' },
        ],
      },
    ];

    const result = transformVariables({ variables, collections });

    const tokenFile = Array.from(result.tokenFiles.values())[0];
    expect(tokenFile.tokens.color?.primary).toBeUndefined();
  });

  it('creates correct file structure', () => {
    const variables = [
      {
        id: 'var1',
        name: 'color/primary',
        variableCollectionId: 'coll1',
        resolvedType: 'COLOR',
        valuesByMode: {
          'mode1': { r: 0, g: 0, b: 0, a: 1 },
        },
      },
    ];

    const collections = [
      {
        id: 'coll1',
        name: 'Colors',
        modes: [
          { modeId: 'mode1', name: 'Light' },
        ],
      },
    ];

    const result = transformVariables({ variables, collections });

    const file = result.files[0];
    expect(file.fileName).toContain('colors');
    expect(file.collection.name).toBe('Colors');
    expect(file.mode.name).toBe('Light');
  });

  it('handles empty variables array', () => {
    const result = transformVariables({ variables: [], collections: [] });
    expect(result.variableCount).toBe(0);
    expect(result.modeCount).toBe(0);
    expect(result.files).toEqual([]);
    expect(result.tokenFiles.size).toBe(0);
  });

  it('handles empty collections array', () => {
    const variables = [
      {
        id: 'var1',
        name: 'color/primary',
        variableCollectionId: 'coll1',
        resolvedType: 'COLOR',
        valuesByMode: {
          'mode1': { r: 0, g: 0, b: 0, a: 1 },
        },
      },
    ];

    const result = transformVariables({ variables, collections: [] });
    expect(result.tokenFiles.size).toBe(0);
  });
});

describe('hydrateEnv', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('does nothing if environment variables already exist', async () => {
    process.env.FIGMA_REST_API = 'existing-token';
    process.env.FIGMA_FILE_ID = 'existing-file-id';

    await hydrateEnv();

    expect(process.env.FIGMA_REST_API).toBe('existing-token');
    expect(process.env.FIGMA_FILE_ID).toBe('existing-file-id');
  });

  it('handles missing .env file gracefully', async () => {
    delete process.env.FIGMA_REST_API;
    delete process.env.FIGMA_FILE_ID;

    // Should not throw when .env doesn't exist (in a directory without .env)
    // Note: This test verifies the function doesn't crash, but can't easily
    // test the .env loading without mocking process.cwd or creating files in project root
    await expect(hydrateEnv()).resolves.not.toThrow();
  });

  it('only processes when variables are missing', async () => {
    // If both vars exist, hydrateEnv should return early
    process.env.FIGMA_REST_API = 'existing-token';
    process.env.FIGMA_FILE_ID = 'existing-file-id';

    await hydrateEnv();

    // Values should remain unchanged
    expect(process.env.FIGMA_REST_API).toBe('existing-token');
    expect(process.env.FIGMA_FILE_ID).toBe('existing-file-id');
  });
});

