#!/bin/bash
# Sync S2A tokens from the consonant repo into a flat JSON lookup map.
# Source: consonant/packages/tokens/json/*.json
# Output: tokens/s2a-tokens.json

set -euo pipefail

CONSONANT_TOKENS="/Users/taehoc/Desktop/vscode-git/consonant/packages/tokens/json"
OUTPUT="tokens/s2a-tokens.json"

if [ ! -d "$CONSONANT_TOKENS" ]; then
  echo "Error: consonant tokens directory not found at $CONSONANT_TOKENS"
  exit 1
fi

mkdir -p tokens

# Use node to parse and flatten the token JSON files
node -e "
const fs = require('fs');
const path = require('path');

const tokenDir = '$CONSONANT_TOKENS';
const result = { colors: {}, spacing: {}, typography: {}, radii: {}, other: {} };

function walk(obj, prefix) {
  for (const [key, val] of Object.entries(obj)) {
    const name = prefix ? prefix + '-' + key : key;
    if (val && typeof val === 'object' && '\$value' in val) {
      const resolved = String(val['\$value']);
      const cssName = name.replace(/\./g, '-');
      const cssVar = cssName.startsWith('s2a-') ? '--' + cssName : '--s2a-' + cssName;
      const type = val['\$type'] || 'other';
      if (type === 'color') {
        result.colors[resolved.toLowerCase()] = cssVar;
      } else if (type === 'dimension' && name.includes('spacing')) {
        result.spacing[resolved] = cssVar;
      } else if (type === 'dimension' && name.includes('radius')) {
        result.radii[resolved] = cssVar;
      } else if (type === 'fontFamily' || type === 'fontSize' || type === 'fontWeight' || type === 'lineHeight') {
        result.typography[resolved] = cssVar;
      } else {
        result.other[resolved] = cssVar;
      }
    } else if (val && typeof val === 'object') {
      walk(val, name);
    }
  }
}

const files = fs.readdirSync(tokenDir).filter(f => f.endsWith('.json'));
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(tokenDir, file), 'utf8'));
  walk(data, '');
}

const meta = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  tokenCount: Object.values(result).reduce((sum, cat) => sum + Object.keys(cat).length, 0),
};

fs.writeFileSync('$OUTPUT', JSON.stringify({ meta, ...result }, null, 2));
console.log('Wrote ' + meta.tokenCount + ' tokens to $OUTPUT');
"
