import sharp from "sharp";
import { mkdir, cp, copyFile, access, writeFile } from "node:fs/promises";
import { assets, videos } from "../src/assets.ts";
const output = new URL("../public/media/", import.meta.url);
await mkdir(output, { recursive: true });
await cp(new URL("../../storybook/stories/assets/homepage/icons/", import.meta.url), new URL("icons/", output), { recursive: true });
for (const asset of assets) {
  const input = new URL(
    `../../storybook/stories/assets/${asset.source}`,
    import.meta.url,
  );
  for (const [size, width] of [
    ["small", 640],
    ["large", 1480],
  ]) {
    await sharp(input.pathname)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(new URL(`${asset.file}-${size}.webp`, output).pathname);
  }
}
// Self-host the live clips (10 × ~2 MB, cached after the first download in the
// ignored public/media/video/ and stories/assets/homepage/video/ folders).
const videoOut = new URL("video/", output);
const storybookVideoOut = new URL("../../storybook/stories/assets/homepage/video/", import.meta.url);
await mkdir(videoOut, { recursive: true });
await mkdir(storybookVideoOut, { recursive: true });
let fetched = 0, cached = 0, missing = 0;
for (const video of videos) {
  const target = new URL(`${video.file}.mp4`, videoOut);
  const storybookTarget = new URL(`${video.file}.mp4`, storybookVideoOut);
  try {
    await access(target);
    cached++;
  } catch {
    try {
      const response = await fetch(video.source);
      if (!response.ok) throw new Error(String(response.status));
      await writeFile(target, Buffer.from(await response.arrayBuffer()));
      fetched++;
    } catch (error) {
      missing++;
      console.warn(`Could not fetch ${video.id}: ${error.message}. The still image stays as the background.`);
      continue;
    }
  }
  try { await access(storybookTarget); } catch { await copyFile(target, storybookTarget); }
}
console.log(`Videos: ${fetched} fetched, ${cached} cached, ${missing} missing.`);

// Stage the latest lab/audit reports (ignored evidence files) so Studio's
// Performance panel can read them; absent reports are simply not staged.
const reportsOut = new URL("../public/reports/", import.meta.url);
await mkdir(reportsOut, { recursive: true });
let staged = 0;
for (const name of ["homepage-performance.json", "performance.json", "accessibility-audit.json"]) {
  const source = new URL(`../reports/${name}`, import.meta.url);
  try {
    await access(source);
    await copyFile(source, new URL(name, reportsOut));
    staged++;
  } catch {
    // no report yet
  }
}
console.log(
  `Prepared ${assets.length * 2} responsive images from checked-in Storybook assets; staged ${staged} report(s).`,
);
