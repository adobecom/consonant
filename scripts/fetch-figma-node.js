#!/usr/bin/env node

/**
 * Fetch Figma node design context via REST API.
 * Usage: node scripts/fetch-figma-node.js <fileKey> <nodeId>
 * Example: node scripts/fetch-figma-node.js WVHzjcD3hdioe7t82ZyhAW 141:53460
 */

import dotenv from 'dotenv';

dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_REST_API;
const FIGMA_API_BASE = 'https://api.figma.com';

if (!FIGMA_TOKEN) {
  console.error('❌ FIGMA_REST_API not found in .env file');
  process.exit(1);
}

async function fetchNode(fileKey, nodeId) {
  const url = `${FIGMA_API_BASE}/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`;

  const response = await fetch(url, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Figma API error (${response.status}): ${text}`);
  }

  return response.json();
}

// Node ID may be 141:53460 or 141-53460; API accepts both
const [fileKey, nodeId] = process.argv.slice(2);
if (!fileKey || !nodeId) {
  console.error('Usage: node scripts/fetch-figma-node.js <fileKey> <nodeId>');
  process.exit(1);
}

try {
  const data = await fetchNode(fileKey, nodeId);
  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error('❌', err.message);
  process.exit(1);
}
