import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const tokenRoot = resolve("dist/packages/tokens/css/dev");
const declarations = (file) =>
  Object.fromEntries(
    [
      ...readFileSync(resolve(tokenRoot, file), "utf8").matchAll(
        /(--s2a-[\w-]+)\s*:\s*([^;]+);/g,
      ),
    ].map((m) => [m[1], m[2].trim()]),
  );
const shared = Object.assign(
  {},
  ...readdirSync(tokenRoot)
    .filter((f) => /^tokens\.(primitives|semantic)\.css$/.test(f))
    .map(declarations),
);
function theme(mode) {
  const tokens = { ...shared, ...declarations(`tokens.semantic.${mode}.css`) };
  function value(name, seen = new Set()) {
    if (!tokens[name] || seen.has(name))
      throw new Error(`Cannot resolve theme token ${name}`);
    return tokens[name].replace(/var\((--s2a-[\w-]+)\)/g, (_, ref) =>
      value(ref, new Set([...seen, name])),
    );
  }
  const get = (name) => value(`--s2a-${name}`);
  return {
    base: mode,
    colorPrimary: get("color-content-default"),
    colorSecondary: get("color-border-accent"),
    appBg: get("color-surface-subtle"),
    appContentBg: get("color-surface-default"),
    appPreviewBg: get("color-surface-default"),
    appBorderColor: get("color-border-subtle"),
    appBorderRadius: parseFloat(get("border-radius-sm")),
    barBg: get("color-surface-subtle"),
    barTextColor: get("color-content-body-subtle"),
    barSelectedColor: get("color-content-default"),
    barHoverColor: get("color-content-default"),
    fontBase: get("font-family-body"),
    fontCode: get("font-family-body"),
    textColor: get("color-content-default"),
    textInverseColor: get("color-surface-default"),
    textMutedColor: get("color-content-body-subtle"),
    inputBg: get("color-surface-default"),
    inputBorder: get("color-border-subtle"),
    inputTextColor: get("color-content-default"),
    inputBorderRadius: parseFloat(get("border-radius-xs")),
  };
}

// Storybook's theme API requires resolved colors/numbers. This is build output,
// never a second palette; regenerate it whenever the design tokens change.
writeFileSync(
  ".storybook/token-theme.generated.json",
  JSON.stringify({ light: theme("light"), dark: theme("dark") }, null, 2) +
    "\n",
);
console.log("Prepared Storybook themes from shipped semantic tokens.");
