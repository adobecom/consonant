import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { pruneCssDuplicates, filterResponsiveCss } from '../build-tokens.js';

describe('pruneCssDuplicates', () => {
  let tempDir;
  let baseFile;
  let targetFile;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(join(tmpdir(), 'css-test-'));
    baseFile = join(tempDir, 'base.css');
    targetFile = join(tempDir, 'target.css');
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('removes duplicate CSS variables from target file', async () => {
    const baseContent = `:root {
  --spacing-small: 8px;
  --spacing-medium: 16px;
  --typography-base: 16px;
}`;

    const targetContent = `:root[data-theme="light"] {
  --spacing-small: 8px;
  --spacing-medium: 16px;
  --color-primary: #000000;
  --typography-base: 16px;
}`;

    await fs.writeFile(baseFile, baseContent, 'utf8');
    await fs.writeFile(targetFile, targetContent, 'utf8');

    await pruneCssDuplicates(baseFile, targetFile);

    const result = await fs.readFile(targetFile, 'utf8');
    expect(result).toContain('--color-primary: #000000');
    expect(result).not.toContain('--spacing-small: 8px');
    expect(result).not.toContain('--spacing-medium: 16px');
    expect(result).not.toContain('--typography-base: 16px');
  });

  it('preserves color variables when skipColorVariables is true', async () => {
    const baseContent = `:root {
  --spacing-small: 8px;
  --color-primary: #000000;
}`;

    const targetContent = `:root[data-theme="light"] {
  --spacing-small: 8px;
  --color-primary: #000000;
  --color-secondary: #ffffff;
}`;

    await fs.writeFile(baseFile, baseContent, 'utf8');
    await fs.writeFile(targetFile, targetContent, 'utf8');

    await pruneCssDuplicates(baseFile, targetFile, { skipColorVariables: true });

    const result = await fs.readFile(targetFile, 'utf8');
    expect(result).toContain('--color-primary: #000000');
    expect(result).toContain('--color-secondary: #ffffff');
    expect(result).not.toContain('--spacing-small: 8px');
  });

  it('removes color variables when skipColorVariables is false', async () => {
    const baseContent = `:root {
  --color-primary: #000000;
}`;

    const targetContent = `:root[data-theme="light"] {
  --color-primary: #000000;
  --color-secondary: #ffffff;
}`;

    await fs.writeFile(baseFile, baseContent, 'utf8');
    await fs.writeFile(targetFile, targetContent, 'utf8');

    await pruneCssDuplicates(baseFile, targetFile, { skipColorVariables: false });

    const result = await fs.readFile(targetFile, 'utf8');
    expect(result).not.toContain('--color-primary: #000000');
    expect(result).toContain('--color-secondary: #ffffff');
  });

  it('handles empty base file', async () => {
    const baseContent = `:root {
}`;

    const targetContent = `:root[data-theme="light"] {
  --spacing-small: 8px;
  --color-primary: #000000;
}`;

    await fs.writeFile(baseFile, baseContent, 'utf8');
    await fs.writeFile(targetFile, targetContent, 'utf8');

    await pruneCssDuplicates(baseFile, targetFile);

    const result = await fs.readFile(targetFile, 'utf8');
    expect(result).toContain('--spacing-small: 8px');
    expect(result).toContain('--color-primary: #000000');
  });

  it('handles empty target file', async () => {
    const baseContent = `:root {
  --spacing-small: 8px;
}`;

    const targetContent = `:root[data-theme="light"] {
}`;

    await fs.writeFile(baseFile, baseContent, 'utf8');
    await fs.writeFile(targetFile, targetContent, 'utf8');

    await pruneCssDuplicates(baseFile, targetFile);

    const result = await fs.readFile(targetFile, 'utf8');
    // Function preserves the selector and closing brace
    expect(result).toContain(':root[data-theme="light"] {');
    expect(result).toContain('}');
    expect(result.trim()).toBe(':root[data-theme="light"] {\n}');
  });

  it('removes trailing empty lines', async () => {
    const baseContent = `:root {
  --spacing-small: 8px;
}`;

    const targetContent = `:root[data-theme="light"] {
  --spacing-small: 8px;
  --color-primary: #000000;


}`;

    await fs.writeFile(baseFile, baseContent, 'utf8');
    await fs.writeFile(targetFile, targetContent, 'utf8');

    await pruneCssDuplicates(baseFile, targetFile);

    const result = await fs.readFile(targetFile, 'utf8');
    expect(result).not.toMatch(/\n\n\n$/);
    expect(result.endsWith('\n')).toBe(true);
  });

  it('handles variables with different whitespace', async () => {
    const baseContent = `:root {
  --spacing-small: 8px;
}`;

    const targetContent = `:root[data-theme="light"] {
  --spacing-small:8px;
  --color-primary: #000000;
}`;

    await fs.writeFile(baseFile, baseContent, 'utf8');
    await fs.writeFile(targetFile, targetContent, 'utf8');

    await pruneCssDuplicates(baseFile, targetFile);

    const result = await fs.readFile(targetFile, 'utf8');
    // Should not match because whitespace differs
    expect(result).toContain('--spacing-small:8px');
  });

  it('handles missing base file gracefully', async () => {
    const targetContent = `:root[data-theme="light"] {
  --spacing-small: 8px;
}`;

    await fs.writeFile(targetFile, targetContent, 'utf8');

    // Should not throw
    await pruneCssDuplicates(join(tempDir, 'nonexistent.css'), targetFile);

    const result = await fs.readFile(targetFile, 'utf8');
    expect(result).toContain('--spacing-small: 8px');
  });

  it('preserves non-duplicate variables', async () => {
    const baseContent = `:root {
  --spacing-small: 8px;
}`;

    const targetContent = `:root[data-theme="light"] {
  --spacing-small: 8px;
  --spacing-large: 24px;
  --color-primary: #000000;
}`;

    await fs.writeFile(baseFile, baseContent, 'utf8');
    await fs.writeFile(targetFile, targetContent, 'utf8');

    await pruneCssDuplicates(baseFile, targetFile);

    const result = await fs.readFile(targetFile, 'utf8');
    expect(result).toContain('--spacing-large: 24px');
    expect(result).toContain('--color-primary: #000000');
    expect(result).not.toContain('--spacing-small: 8px');
  });

  it('handles Windows line endings (CRLF)', async () => {
    const baseContent = `:root {\r\n  --spacing-small: 8px;\r\n}`;

    const targetContent = `:root[data-theme="light"] {\r\n  --spacing-small: 8px;\r\n  --color-primary: #000000;\r\n}`;

    await fs.writeFile(baseFile, baseContent, 'utf8');
    await fs.writeFile(targetFile, targetContent, 'utf8');

    await pruneCssDuplicates(baseFile, targetFile);

    const result = await fs.readFile(targetFile, 'utf8');
    expect(result).toContain('--color-primary: #000000');
    expect(result).not.toContain('--spacing-small: 8px');
  });
});

describe('filterResponsiveCss', () => {
  let tempDir;
  let inputFile;
  let outputFile;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(join(tmpdir(), 'css-test-'));
    inputFile = join(tempDir, 'input.css');
    outputFile = join(tempDir, 'output.css');
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('filters to only responsive CSS variables', async () => {
    const cssContent = `:root {
  --border-radius-action: 4px;
  --container-width: 1200px;
  --density-compact: 8px;
  --spacing-small: 8px;
  --typography-heading-1: 32px;
  --color-primary: #000000;
}`;

    await fs.writeFile(inputFile, cssContent, 'utf8');

    await filterResponsiveCss(inputFile, outputFile);

    const result = await fs.readFile(outputFile, 'utf8');
    expect(result).toContain('--border-radius-action: 4px');
    expect(result).toContain('--container-width: 1200px');
    expect(result).toContain('--density-compact: 8px');
    expect(result).toContain('--typography-heading-1: 32px');
    expect(result).not.toContain('--spacing-small: 8px');
    expect(result).not.toContain('--color-primary: #000000');
  });

  it('keeps responsive variables matching patterns', async () => {
    const cssContent = `:root {
  --border-radius-action: 4px;
  --border-radius-card: 8px;
  --container-width: 1200px;
  --container-height: 800px;
  --density-normal: 16px;
  --typography-heading-1: 32px;
  --typography-heading-2: 24px;
  --typography-title-large: 20px;
  --typography-body-base: 16px;
  --typography-logo-brand: 48px;
}`;

    await fs.writeFile(inputFile, cssContent, 'utf8');

    await filterResponsiveCss(inputFile, outputFile);

    const result = await fs.readFile(outputFile, 'utf8');
    expect(result).toContain('--border-radius-action');
    expect(result).toContain('--border-radius-card');
    expect(result).toContain('--container-width');
    expect(result).toContain('--container-height');
    expect(result).toContain('--density-normal');
    expect(result).toContain('--typography-heading-1');
    expect(result).toContain('--typography-heading-2');
    expect(result).toContain('--typography-title-large');
    expect(result).toContain('--typography-body-base');
    expect(result).toContain('--typography-logo-brand');
  });

  it('removes selector blocks with no responsive variables', async () => {
    const cssContent = `:root {
  --spacing-small: 8px;
  --color-primary: #000000;
}

@media (min-width: 768px) {
  :root {
    --container-width: 1200px;
  }
}`;

    await fs.writeFile(inputFile, cssContent, 'utf8');

    await filterResponsiveCss(inputFile, outputFile);

    const result = await fs.readFile(outputFile, 'utf8');
    expect(result).not.toContain('--spacing-small: 8px');
    expect(result).not.toContain('--color-primary: #000000');
    expect(result).toContain('--container-width: 1200px');
    expect(result).toContain('@media (min-width: 768px)');
  });

  it('preserves comments', async () => {
    const cssContent = `/* Comment */
:root {
  --container-width: 1200px;
  /* Another comment */
  --spacing-small: 8px;
}`;

    await fs.writeFile(inputFile, cssContent, 'utf8');

    await filterResponsiveCss(inputFile, outputFile);

    const result = await fs.readFile(outputFile, 'utf8');
    expect(result).toContain('/* Comment */');
    expect(result).toContain('/* Another comment */');
    expect(result).toContain('--container-width: 1200px');
    expect(result).not.toContain('--spacing-small: 8px');
  });

  it('handles media queries', async () => {
    const cssContent = `@media (min-width: 768px) {
  :root {
    --container-width: 1200px;
    --spacing-small: 8px;
  }
}`;

    await fs.writeFile(inputFile, cssContent, 'utf8');

    await filterResponsiveCss(inputFile, outputFile);

    const result = await fs.readFile(outputFile, 'utf8');
    expect(result).toContain('@media (min-width: 768px)');
    expect(result).toContain('--container-width: 1200px');
    expect(result).not.toContain('--spacing-small: 8px');
  });

  it('handles empty selector blocks', async () => {
    const cssContent = `:root {
  --spacing-small: 8px;
}

@media (min-width: 768px) {
  :root {
    --container-width: 1200px;
  }
}`;

    await fs.writeFile(inputFile, cssContent, 'utf8');

    await filterResponsiveCss(inputFile, outputFile);

    const result = await fs.readFile(outputFile, 'utf8');
    // Empty :root block should be removed
    expect(result).not.toMatch(/:root\s*\{\s*\}/);
    expect(result).toContain('--container-width: 1200px');
  });

  it('handles Windows line endings (CRLF)', async () => {
    const cssContent = `:root {\r\n  --container-width: 1200px;\r\n  --spacing-small: 8px;\r\n}`;

    await fs.writeFile(inputFile, cssContent, 'utf8');

    await filterResponsiveCss(inputFile, outputFile);

    const result = await fs.readFile(outputFile, 'utf8');
    expect(result).toContain('--container-width: 1200px');
    expect(result).not.toContain('--spacing-small: 8px');
  });

  it('removes input file after filtering', async () => {
    const cssContent = `:root {
  --container-width: 1200px;
}`;

    await fs.writeFile(inputFile, cssContent, 'utf8');

    await filterResponsiveCss(inputFile, outputFile);

    // Input file should be deleted
    await expect(fs.access(inputFile)).rejects.toThrow();
    
    // Output file should exist
    const result = await fs.readFile(outputFile, 'utf8');
    expect(result).toContain('--container-width: 1200px');
  });

  it('handles variables with partial pattern matches', async () => {
    const cssContent = `:root {
  --container-width: 1200px;
  --container-padding: 16px;
  --not-container: 8px;
  --density-compact: 8px;
  --not-density: 16px;
}`;

    await fs.writeFile(inputFile, cssContent, 'utf8');

    await filterResponsiveCss(inputFile, outputFile);

    const result = await fs.readFile(outputFile, 'utf8');
    expect(result).toContain('--container-width: 1200px');
    expect(result).toContain('--container-padding: 16px');
    expect(result).toContain('--density-compact: 8px');
    expect(result).not.toContain('--not-container: 8px');
    expect(result).not.toContain('--not-density: 16px');
  });
});

