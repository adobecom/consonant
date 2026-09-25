import { readdir, readFile, mkdir, writeFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { ComponentSpecSchema } from "../../s2a-ds-mcp/src/spec-schema.ts";

const root = new URL("../../../packages/components/src/", import.meta.url);
const components = [];
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === "icons") continue;
  try {
    await access(new URL(`${entry.name}/${entry.name}.js`, root));
  } catch {
    continue;
  }
  const specUrl = new URL(`${entry.name}/${entry.name}.spec.json`, root);
  try {
    const spec = JSON.parse(await readFile(specUrl, "utf8"));
    const parsed = ComponentSpecSchema.safeParse(spec);
    components.push({
      component: entry.name,
      status: parsed.success ? "source-spec-present" : "invalid-spec",
      ...(parsed.success ? {} : { issues: parsed.error.issues }),
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    components.push({ component: entry.name, status: "needs-spec" });
  }
}
const assets = [];
for (const number of [1, 2, 3]) {
  const source = `apps/storybook/stories/assets/carousel/slide-${number}.jpg`;
  const bytes = await readFile(source);
  const metadata = await sharp(bytes).metadata();
  assets.push({
    id: `story-${number}`,
    source,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    width: metadata.width,
    height: metadata.height,
    mime: "image/jpeg",
    bytes: bytes.length,
    decorative: true,
    usage:
      "Existing Storybook demo asset; production rights/content approval not asserted",
    renditions: [640, 1480],
    locale: "en-US",
    figmaNode: null,
  });
}
const designInventory = JSON.parse(
  await readFile(new URL("../inventory.json", import.meta.url), "utf8"),
);
const output = new URL("../reports/", import.meta.url);
await mkdir(output, { recursive: true });
await writeFile(
  new URL("inventory.json", output),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      components,
      assets,
      designInventory,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      components: components.length,
      validSpecs: components.filter(
        (item) => item.status === "source-spec-present",
      ).length,
      missing: components
        .filter((item) => item.status === "needs-spec")
        .map((item) => item.component),
      invalid: components.filter((item) => item.status === "invalid-spec"),
      figmaLeafAudit: "pending",
    },
    null,
    2,
  ),
);
if (components.some((item) => item.status === "invalid-spec"))
  process.exitCode = 1;
