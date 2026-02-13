#!/usr/bin/env node

/**
 * Download images from Figma using REST API
 * 
 * Usage:
 *   node scripts/download-figma-images.js <fileKey> <nodeId> <outputPath>
 * 
 * Example:
 *   node scripts/download-figma-images.js p8qJ8vKqHZfYr9kL7mN3oP 18824:37797 apps/storybook/stories/assets/marquee/example-1.png
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIGMA_TOKEN = process.env.FIGMA_REST_API;
const FIGMA_API_BASE = 'https://api.figma.com';

if (!FIGMA_TOKEN) {
  console.error('❌ FIGMA_REST_API not found in .env file');
  process.exit(1);
}

async function downloadImage(fileKey, nodeId, outputPath) {
  // Figma API accepts node IDs with colons (18824:37797) or dashes (18824-37797)
  // We'll use the format as provided, but the API may return it in a different format
  // So we need to check both formats in the response
  
  // Export the node as PNG
  const exportUrl = `${FIGMA_API_BASE}/v1/images/${fileKey}?ids=${nodeId}&format=png&scale=2`;
  
  console.log(`📥 Fetching export URL for node ${nodeId}...`);
  
  const exportResponse = await fetch(exportUrl, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });

  if (!exportResponse.ok) {
    const errorText = await exportResponse.text();
    throw new Error(`Failed to get export URL (${exportResponse.status}): ${errorText}`);
  }

  const exportData = await exportResponse.json();
  // Check both colon and dash formats
  const imageUrl = exportData.images[nodeId] || exportData.images[nodeId.replace(':', '-')] || exportData.images[nodeId.replace('-', ':')];

  if (!imageUrl) {
    const availableNodes = Object.keys(exportData.images || {}).join(', ');
    throw new Error(`No image URL returned for node ${nodeId}. Available nodes: ${availableNodes}`);
  }

  console.log(`📥 Downloading image from ${imageUrl}...`);

  // Download the image
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error(`Failed to download image (${imageResponse.status}): ${imageResponse.statusText}`);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save the image
  const buffer = await imageResponse.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));

  console.log(`✅ Saved image to ${outputPath}`);
  console.log(`   Size: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: node scripts/download-figma-images.js <fileKey> <nodeId> <outputPath>');
    console.error('');
    console.error('Example:');
    console.error('  node scripts/download-figma-images.js p8qJ8vKqHZfYr9kL7mN3oP 18824:37797 apps/storybook/stories/assets/marquee/example-1.png');
    process.exit(1);
  }

  const [fileKey, nodeId, outputPath] = args;

  try {
    await downloadImage(fileKey, nodeId, outputPath);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
