#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const ROOT_PACKAGE_JSON_PATH = path.join(__dirname, '..', '..', '..', 'package.json');

const versionType = process.argv[2];

if (!versionType || !['patch', 'minor', 'major'].includes(versionType)) {
  console.error('Usage: node version.js <patch|minor|major>');
  process.exit(1);
}

// Read current package.json
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
const currentVersion = packageJson.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

let newVersion;
switch (versionType) {
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
}

// Update tokens package.json
packageJson.version = newVersion;
fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
console.log(`✅ Updated tokens version: ${currentVersion} → ${newVersion}`);

// Optionally update root package.json to match
if (fs.existsSync(ROOT_PACKAGE_JSON_PATH)) {
  const rootPackageJson = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON_PATH, 'utf8'));
  rootPackageJson.version = newVersion;
  fs.writeFileSync(ROOT_PACKAGE_JSON_PATH, JSON.stringify(rootPackageJson, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated root package.json version: ${currentVersion} → ${newVersion}`);
}

console.log(`\n📝 Next steps:`);
console.log(`   1. Review the changes in ${PACKAGE_JSON_PATH}`);
console.log(`   2. Commit the version bump: git add package.json packages/tokens/package.json`);
console.log(`   3. Build and package: npm run tokens:build && npm run tokens:package`);

