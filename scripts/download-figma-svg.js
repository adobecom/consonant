#!/usr/bin/env node

/**
 * Download SVG from Figma using REST API
 * Usage: node scripts/download-figma-svg.js <fileKey> <nodeId> <outputPath>
 * Example: node scripts/download-figma-svg.js WVHzjcD3hdioe7t82ZyhAW 2142:53865 packages/components/src/icon-button/assets/pause.svg
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_REST_API;
const FIGMA_API_BASE = "https://api.figma.com";

if (!FIGMA_TOKEN) {
  console.error("❌ FIGMA_REST_API not found in .env file");
  process.exit(1);
}

async function downloadSvg(fileKey, nodeId, outputPath) {
  const exportUrl = `${FIGMA_API_BASE}/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=svg`;

  const response = await fetch(exportUrl, {
    headers: { "X-Figma-Token": FIGMA_TOKEN },
  });

  if (!response.ok) {
    throw new Error(`Figma API error (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  const imageUrl = data.images[nodeId] ?? data.images[nodeId.replace(":", "-")];

  if (!imageUrl) {
    throw new Error(`No SVG URL for node ${nodeId}. Keys: ${Object.keys(data.images || {}).join(", ")}`);
  }

  const svgResponse = await fetch(imageUrl);
  if (!svgResponse.ok) {
    throw new Error(`Download failed (${svgResponse.status})`);
  }

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let svg = await svgResponse.text();

  fs.writeFileSync(outputPath, svg);
  console.log(`✅ Saved SVG to ${outputPath}`);
}

const [fileKey, nodeId, outputPath] = process.argv.slice(2);
if (!fileKey || !nodeId || !outputPath) {
  console.error("Usage: node scripts/download-figma-svg.js <fileKey> <nodeId> <outputPath>");
  process.exit(1);
}

downloadSvg(fileKey, nodeId, outputPath).catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
