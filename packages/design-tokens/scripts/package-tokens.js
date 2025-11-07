const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../..');
const BUILD_DIR = path.join(ROOT_DIR, 'dist', 'packages', 'design-tokens');
const CSS_DIR = path.join(BUILD_DIR, 'css');
const PACKAGE_JSON_PATH = path.join(BUILD_DIR, 'package.json');

if (!fs.existsSync(BUILD_DIR) || !fs.existsSync(CSS_DIR)) {
  throw new Error('dist/packages/design-tokens/css directory not found. Run `nx build design-tokens` before packaging.');
}

// Verify package.json exists (it should be copied during build)
if (!fs.existsSync(PACKAGE_JSON_PATH)) {
  throw new Error('dist/packages/design-tokens/package.json not found. Run `nx build design-tokens` first.');
}

console.log('📦 Package.json found in dist/packages/design-tokens/');
