const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const CSS_DIR = path.join(BUILD_DIR, 'css');

if (!fs.existsSync(BUILD_DIR) || !fs.existsSync(CSS_DIR)) {
  throw new Error('build/css directory not found. Run `npm run build:tokens` before packaging.');
}

const rootPackage = require(path.join(ROOT_DIR, 'package.json'));
const packageName = 'consonant-design-tokens';

const packageJson = {
  name: packageName,
  version: rootPackage.version || '0.0.0',
  description: rootPackage.description || 'Design token build output for Consonant.',
  license: rootPackage.license || 'UNLICENSED',
  files: ['css/'],
  main: 'css/tokens-base.css',
  style: 'css/tokens-base.css',
  keywords: ['design-tokens', 'css', 'consonant'],
  private: false
};

fs.writeFileSync(path.join(BUILD_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));

const readmeContent = `# Consonant Design Tokens\n\nGenerated CSS custom properties for the Consonant design system.\n\n## Contents\n- tokens-base.css: Base primitives and alias tokens.\n- tokens-light.css: Light theme semantic tokens.\n- tokens-dark.css: Dark theme semantic tokens.\n\n## Usage\n1. Install the package archive.\n2. Import the relevant CSS file(s) into your project.\n`;

fs.writeFileSync(path.join(BUILD_DIR, 'README.md'), readmeContent);

if (fs.existsSync(path.join(ROOT_DIR, 'LICENSE'))) {
  fs.copyFileSync(path.join(ROOT_DIR, 'LICENSE'), path.join(BUILD_DIR, 'LICENSE'));
}

console.log('📦 Prepared build directory for packaging.');
