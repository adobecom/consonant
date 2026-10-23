import { cp, access } from "node:fs/promises";
await access("storybook-static/index.html");
await access("dist/apps/authoring-poc/index.html");
await cp("dist/apps/authoring-poc", "storybook-static/authoring", {
  recursive: true,
});
console.log(
  "Staged S2A Studio in storybook-static/authoring; existing Storybook and PR previews are preserved.",
);
