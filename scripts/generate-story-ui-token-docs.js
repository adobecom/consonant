#!/usr/bin/env node
// Generates story-ui-docs/tokens/s2a-tokens.md from compiled CSS token files.
// Run: node scripts/generate-story-ui-token-docs.js
// Also runs as part of tokens:build via postbuild hook.

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function readCss(file) {
  try { return readFileSync(resolve(ROOT, file), 'utf8'); } catch { return ''; }
}

function extractVars(css) {
  const map = {};
  for (const m of css.matchAll(/--s2a-([\w-]+):\s*([^;]+);/g)) {
    map[`--s2a-${m[1]}`] = m[2].trim();
  }
  return map;
}

function resolveValue(val, primitives) {
  // Unwrap var(--s2a-*) one level using primitives
  const m = val.match(/^var\((--s2a-[\w-]+)(?:,\s*([^)]+))?\)/);
  if (!m) return val;
  return primitives[m[1]] ?? m[2] ?? val;
}

const semantic   = extractVars(readCss('dist/packages/tokens/css/dev/tokens.semantic.css'));
const lightMode  = extractVars(readCss('dist/packages/tokens/css/dev/tokens.semantic.light.css'));
const primitives = extractVars(readCss('dist/packages/tokens/css/dev/tokens.primitives.css'));

// Merge light-mode overrides
const tokens = { ...semantic, ...lightMode };

function section(heading, prefix) {
  const entries = Object.entries(tokens).filter(([k]) => k.startsWith(prefix));
  if (!entries.length) return '';
  const rows = entries.map(([k, v]) => {
    const resolved = resolveValue(v, primitives);
    return `| \`${k}\` | ${resolved} |`;
  }).join('\n');
  return `### ${heading}\n\n| Token | Resolved value |\n|---|---|\n${rows}\n`;
}

const out = `# S2A Design Tokens — Authoritative Reference

> Auto-generated from \`dist/packages/tokens/css/dev/\`. Do not edit manually.
> Regenerate: \`node scripts/generate-story-ui-token-docs.js\`

## ⚠️ MANDATORY RULES

1. **ALWAYS use semantic tokens** — never hardcode hex, rgb, or raw px values
2. **Fallback syntax** — always include a fallback: \`var(--s2a-spacing-lg, 24px)\`
3. **Never use primitive tokens** (--s2a-color-gray-*, --s2a-spacing-16, etc.) — semantic aliases only

\`\`\`css
/* ✅ CORRECT */
padding: var(--s2a-spacing-lg, 24px);
color: var(--s2a-color-content-default, #292929);
background: var(--s2a-color-background-default, #ffffff);

/* ❌ WRONG */
padding: 24px;
color: #1a1a1a;
background: #f5f0ff;
background: linear-gradient(135deg, #f5f0ff 0%, #ede8ff 50%);
\`\`\`

---

## Spacing

${section('Spacing', '--s2a-spacing-')}

## Color — Background

${section('Background', '--s2a-color-background-')}

## Color — Content (text)

${section('Content', '--s2a-color-content-')}

## Color — Border

${section('Border', '--s2a-color-border-')}

## Border Radius

${section('Border Radius', '--s2a-border-radius-')}
`;

const outPath = resolve(ROOT, 'story-ui-docs/tokens/s2a-tokens.md');
writeFileSync(outPath, out, 'utf8');
console.log(`✓ Written ${outPath}`);
