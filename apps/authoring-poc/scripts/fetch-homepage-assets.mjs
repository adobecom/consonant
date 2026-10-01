import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import sharp from "sharp";

// One-time capture, never part of build/serve. Builds use the checked-in assets.
const root = new URL("../../storybook/stories/assets/homepage/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("sources.json", root), "utf8"));
for (const asset of manifest.assets) {
  if (await access(new URL(asset.file, root)).then(() => true, () => false)) continue;
  const response = await fetch(asset.url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status}: ${asset.file}`);
  const input = Buffer.from(await response.arrayBuffer());
  const output = await sharp(input).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
  await writeFile(new URL(asset.file, root), output);
  console.log(`${asset.file}: ${output.length} bytes`);
}
const icons = new URL("icons/", root);
await mkdir(icons, { recursive: true });
for (const name of ["creative-cloud", "experience-cloud", "firefly", "acrobat", "photoshop", "illustrator", "premiere", "cc-express", "lightroom", "stock"]) {
  if (await access(new URL(`${name}.svg`, icons)).then(() => true, () => false)) continue;
  const response = await fetch(`https://www.adobe.com/content/dam/shared/images/product-icons/svg/${name}.svg`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${response.status}: ${name}`);
  const svg = await response.text();
  if (!svg.includes("<svg")) throw new Error(`Not SVG: ${name}`);
  await writeFile(new URL(`${name}.svg`, icons), svg);
  console.log(`Icon captured: ${name}`);
}
