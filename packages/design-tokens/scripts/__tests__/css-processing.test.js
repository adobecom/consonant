import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { pruneCssDuplicates, filterResponsiveCss, shorthandHexColors, modernizeColorSyntax, dropZeroUnits } from '../build-tokens.js';

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

describe('shorthandHexColors', () => {
  it('converts 6-digit hex colors to 3-digit shorthand when possible', () => {
    const css = `:root {
  --color-white: #ffffff;
  --color-black: #000000;
  --color-red: #ff0000;
  --color-green: #00ff00;
  --color-blue: #0000ff;
}`;

    const result = shorthandHexColors(css);

    expect(result).toContain('--color-white: #fff;');
    expect(result).toContain('--color-black: #000;');
    expect(result).toContain('--color-red: #f00;');
    expect(result).toContain('--color-green: #0f0;');
    expect(result).toContain('--color-blue: #00f;');
  });

  it('does not convert hex colors that cannot be shortened', () => {
    const css = `:root {
  --color-gray: #f8f8f8;
  --color-custom: #123456;
  --color-mixed: #a1b2c3;
}`;

    const result = shorthandHexColors(css);

    expect(result).toContain('--color-gray: #f8f8f8;');
    expect(result).toContain('--color-custom: #123456;');
    expect(result).toContain('--color-mixed: #a1b2c3;');
  });

  it('converts 8-digit hex colors with alpha to 4-digit shorthand when possible', () => {
    const css = `:root {
  --color-white-alpha: #ffffffff;
  --color-black-alpha: #000000ff;
  --color-red-alpha: #ff0000ff;
}`;

    const result = shorthandHexColors(css);

    expect(result).toContain('--color-white-alpha: #ffff;');
    expect(result).toContain('--color-black-alpha: #000f;');
    expect(result).toContain('--color-red-alpha: #f00f;');
  });

  it('handles mixed shorthand and full hex colors', () => {
    const css = `:root {
  --color-1: #ffffff;
  --color-2: #f8f8f8;
  --color-3: #000000;
  --color-4: #123456;
}`;

    const result = shorthandHexColors(css);

    expect(result).toContain('--color-1: #fff;');
    expect(result).toContain('--color-2: #f8f8f8;');
    expect(result).toContain('--color-3: #000;');
    expect(result).toContain('--color-4: #123456;');
  });

  it('preserves non-color hex values', () => {
    const css = `:root {
  --spacing: 16px;
  --border: 1px solid #ffffff;
}`;

    const result = shorthandHexColors(css);

    expect(result).toContain('--border: 1px solid #fff;');
    expect(result).toContain('--spacing: 16px;');
  });
});

describe('modernizeColorSyntax', () => {
  it('converts rgba() to modern rgb() space-separated syntax with percentage alpha', () => {
    const css = `:root {
  --shadow-color: rgba(0, 0, 0, 0.16);
  --overlay: rgba(255, 255, 255, 0.5);
  --transparent: rgba(0, 0, 0, 0);
}`;

    const result = modernizeColorSyntax(css);

    expect(result).toContain('--shadow-color: rgb(0 0 0 / 16%);');
    expect(result).toContain('--overlay: rgb(255 255 255 / 50%);');
    expect(result).toContain('--transparent: rgb(0 0 0 / 0%);');
  });

  it('converts rgb() with alpha to modern space-separated syntax with percentage alpha', () => {
    const css = `:root {
  --color-with-alpha: rgb(255, 255, 255, 0.8);
  --color-opaque: rgb(0, 0, 0, 1);
}`;

    const result = modernizeColorSyntax(css);

    expect(result).toContain('--color-with-alpha: rgb(255 255 255 / 80%);');
    expect(result).toContain('--color-opaque: rgb(0 0 0 / 100%);');
  });

  it('converts rgb() without alpha to space-separated syntax', () => {
    const css = `:root {
  --color-black: rgb(0, 0, 0);
  --color-white: rgb(255, 255, 255);
}`;

    const result = modernizeColorSyntax(css);

    expect(result).toContain('--color-black: rgb(0 0 0);');
    expect(result).toContain('--color-white: rgb(255 255 255);');
  });

  it('handles rgba() in property values with percentage alpha', () => {
    const css = `:root {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
}`;

    const result = modernizeColorSyntax(css);

    expect(result).toContain('box-shadow: 0 1px 2px rgb(0 0 0 / 10%);');
    expect(result).toContain('border: 1px solid rgb(255 255 255 / 50%);');
  });

  it('handles multiple rgba() values in the same CSS with percentage alpha', () => {
    const css = `:root {
  --shadow-1: rgba(0, 0, 0, 0.12);
  --shadow-2: rgba(0, 0, 0, 0.16);
  --shadow-3: rgba(0, 0, 0, 0.24);
}`;

    const result = modernizeColorSyntax(css);

    expect(result).toContain('--shadow-1: rgb(0 0 0 / 12%);');
    expect(result).toContain('--shadow-2: rgb(0 0 0 / 16%);');
    expect(result).toContain('--shadow-3: rgb(0 0 0 / 24%);');
  });

  it('converts decimal alpha to percentage even in already modern syntax', () => {
    const css = `:root {
  --color: rgb(0 0 0 / 0.16);
  --other: rgb(255 255 255);
}`;

    const result = modernizeColorSyntax(css);

    expect(result).toContain('--color: rgb(0 0 0 / 16%);');
    expect(result).toContain('--other: rgb(255 255 255);');
  });

  it('preserves already modern syntax with percentage alpha', () => {
    const css = `:root {
  --color: rgb(0 0 0 / 16%);
  --other: rgb(255 255 255);
}`;

    const result = modernizeColorSyntax(css);

    expect(result).toBe(css);
  });

  it('handles rgba() with different spacing and converts to percentage alpha', () => {
    const css = `:root {
  --color-1: rgba(0,0,0,0.16);
  --color-2: rgba( 255 , 255 , 255 , 0.5 );
}`;

    const result = modernizeColorSyntax(css);

    expect(result).toContain('--color-1: rgb(0 0 0 / 16%);');
    expect(result).toContain('--color-2: rgb(255 255 255 / 50%);');
  });
});

describe('dropZeroUnits', () => {
  it('removes units from zero values', () => {
    const css = `:root {
  --spacing-none: 0px;
  --border-none: 0rem;
  --margin-none: 0em;
  --width-none: 0%;
}`;

    const result = dropZeroUnits(css);

    expect(result).toContain('--spacing-none: 0;');
    expect(result).toContain('--border-none: 0;');
    expect(result).toContain('--margin-none: 0;');
    expect(result).toContain('--width-none: 0;');
  });

  it('does not remove units from non-zero values', () => {
    const css = `:root {
  --spacing-small: 8px;
  --spacing-medium: 16rem;
  --width-half: 50%;
}`;

    const result = dropZeroUnits(css);

    expect(result).toContain('--spacing-small: 8px;');
    expect(result).toContain('--spacing-medium: 16rem;');
    expect(result).toContain('--width-half: 50%;');
  });

  it('handles zero values in property declarations', () => {
    const css = `:root {
  margin: 0px;
  padding: 0rem;
  border-width: 0px;
}`;

    const result = dropZeroUnits(css);

    expect(result).toContain('margin: 0;');
    expect(result).toContain('padding: 0;');
    expect(result).toContain('border-width: 0;');
  });

  it('handles various CSS units', () => {
    const css = `:root {
  --zero-px: 0px;
  --zero-rem: 0rem;
  --zero-em: 0em;
  --zero-percent: 0%;
  --zero-vh: 0vh;
  --zero-vw: 0vw;
  --zero-deg: 0deg;
  --zero-ms: 0ms;
}`;

    const result = dropZeroUnits(css);

    expect(result).toContain('--zero-px: 0;');
    expect(result).toContain('--zero-rem: 0;');
    expect(result).toContain('--zero-em: 0;');
    expect(result).toContain('--zero-percent: 0;');
    expect(result).toContain('--zero-vh: 0;');
    expect(result).toContain('--zero-vw: 0;');
    expect(result).toContain('--zero-deg: 0;');
    expect(result).toContain('--zero-ms: 0;');
  });

  it('does not affect values like 10px or 0.5rem', () => {
    const css = `:root {
  --spacing: 10px;
  --opacity: 0.5rem;
  --zero: 0px;
}`;

    const result = dropZeroUnits(css);

    expect(result).toContain('--spacing: 10px;');
    expect(result).toContain('--opacity: 0.5rem;');
    expect(result).toContain('--zero: 0;');
  });

  it('handles zero values in calc() expressions', () => {
    const css = `:root {
  --width: calc(100% - 0px);
  --height: calc(50vh - 0rem);
}`;

    const result = dropZeroUnits(css);

    expect(result).toContain('--width: calc(100% - 0);');
    expect(result).toContain('--height: calc(50vh - 0);');
  });
});

