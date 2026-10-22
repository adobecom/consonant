// stage-site.mjs — assemble the GitHub Pages site from the three builds.
//
//   site/                 apps/site/index.html   the landing page
//   site/storybook/       storybook-static       built with STORYBOOK_BASE_PATH=/consonant/storybook/
//   site/contract-book/   dist/apps/contract-book  built with GITHUB_PAGES=true (base /consonant/contract-book/)
//   site/authoring/       dist/apps/authoring-poc  relative base, so it sits anywhere
//
// deploy-storybook.yml publishes `site/` with `clean-exclude: pr-preview`, so
// Storybook PR previews under pr-preview/ survive each deploy untouched.
// Any build that is missing is skipped with a note rather than failing the
// deploy, so a broken optional app cannot take the whole site down.
import { cp, mkdir, rm, writeFile, access } from "node:fs/promises";

const exists = (p) => access(p).then(() => true, () => false);
const parts = [
  ["storybook-static/index.html", "storybook-static", "site/storybook"],
  ["dist/apps/contract-book/index.html", "dist/apps/contract-book", "site/contract-book"],
  ["dist/apps/authoring-poc/index.html", "dist/apps/authoring-poc", "site/authoring"],
];

await rm("site", { recursive: true, force: true });
await mkdir("site", { recursive: true });
await cp("apps/site/index.html", "site/index.html");
await writeFile("site/.nojekyll", "");
for (const [marker, from, to] of parts) {
  if (!(await exists(marker))) { console.log(`skip  ${to}  (${marker} not built)`); continue; }
  await cp(from, to, { recursive: true });
  console.log(`staged ${to}  <- ${from}`);
}
console.log("site/ ready");
