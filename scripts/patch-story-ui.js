#!/usr/bin/env node
// Patches @tpitre/story-ui panel index to add missing .js extensions (ESM requirement).
// Run automatically via postinstall.
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = resolve(__dirname, '../node_modules/@tpitre/story-ui/dist/templates/StoryUI/index.js');

try {
  const original = readFileSync(target, 'utf8');
  const patched = original
    .replace("from './StoryUIPanel'", "from './StoryUIPanel.js'")
    .replace('from "./StoryUIPanel"', 'from "./StoryUIPanel.js"');

  if (patched !== original) {
    writeFileSync(target, patched, 'utf8');
    console.log('✓ Patched @tpitre/story-ui panel index.js (.js extensions added)');
  } else {
    console.log('✓ @tpitre/story-ui panel already patched');
  }
} catch (e) {
  console.warn('Could not patch @tpitre/story-ui:', e.message);
}
