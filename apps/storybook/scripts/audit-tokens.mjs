import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import ts from "typescript";

const root = resolve(fileURLToPath(new URL("../../../", import.meta.url)));
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(`${dir}/${d.name}`) : [`${dir}/${d.name}`],
  );
const tokensDir = `${root}/dist/packages/tokens/css/dev`;
const definitions = (files) =>
  new Set(
    files.flatMap((f) =>
      [...readFileSync(f, "utf8").matchAll(/(--s2a-[\w-]+)\s*:/g)].map(
        (m) => m[1],
      ),
    ),
  );
const tokenFiles = walk(tokensDir).filter((f) => f.endsWith(".css"));
const known = definitions(tokenFiles);
for (const name of definitions(
  walk(`${root}/packages/grid/src`).filter((f) => f.endsWith(".css")),
))
  known.add(name);
const primitive = definitions(
  tokenFiles.filter((f) => /tokens\.primitives/.test(f)),
);
const semantic = definitions(
  tokenFiles.filter((f) => /tokens\.(semantic|responsive)/.test(f)),
);
const property =
  /^(?:color|background(?:-[\w-]+)?|fill|stroke(?:-width)?|(?:font|line-height|letter-spacing)(?:-[\w-]+)?|(?:margin|padding|gap|row-gap|column-gap|border|outline)(?:-[\w-]+)?|box-shadow|text-shadow|opacity|filter|backdrop-filter|transition|animation)(?:$)/;
const geometry =
  /^(?:(?:min-|max-)?(?:width|height)|top|left|right|bottom|inset(?:-[\w-]+)?|grid-template-[\w-]+|flex-basis|transform|background-size)$/;
const rawColor =
  /#[a-f\d]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch)\s*\(|\b(?:white|black|red|blue|gray|grey)\b/i;
const camel = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const findings = [];

/** Remove complete var() expressions, including nested fallbacks, for literal checks. */
export function withoutVars(value) {
  let out = "",
    cursor = 0,
    start;
  while ((start = value.indexOf("var(", cursor)) !== -1) {
    out += value.slice(cursor, start);
    let end = start + 4,
      depth = 1;
    for (; end < value.length && depth; end++) {
      if (value[end] === "(") depth++;
      if (value[end] === ")") depth--;
    }
    out += " TOKEN ";
    cursor = end;
  }
  return out + value.slice(cursor);
}

export function inspectValue(
  prop,
  value,
  {
    known: available = known,
    primitive: primitives = primitive,
    semantic: semantics = semantic,
  } = {},
) {
  const issues = [];
  for (const match of value.matchAll(/var\(\s*(--s2a-[\w-]+)/g)) {
    if (!available.has(match[1])) issues.push(["unknown-token", match[1]]);
    else if (primitives.has(match[1]) && !semantics.has(match[1]))
      issues.push(["primitive-token", match[1]]);
  }
  const bare = withoutVars(value)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/__dynamic__/g, "");
  if (property.test(prop) || prop.startsWith("--")) {
    if (rawColor.test(bare)) issues.push(["literal-color", value]);
    if (
      /(?:^|[^\w.-])(?:[1-9]\d*(?:\.\d+)?|0?\.\d+)(?:px|rem|em|ms|s)\b/.test(
        bare,
      )
    )
      issues.push(["literal-style", value]);
    if (/^font-family$/.test(prop) && !/TOKEN|inherit|initial|unset/.test(bare))
      issues.push(["literal-font", value]);
    if (
      /^(font-weight|line-height|letter-spacing)$/.test(prop) &&
      /\d/.test(bare)
    )
      issues.push(["literal-type", value]);
    if (
      /^(font-size|stroke-width)$/.test(prop) &&
      /^[1-9]\d*(?:\.\d+)?$/.test(bare.trim())
    )
      issues.push(["literal-type", value]);
  } else if (geometry.test(prop) && /\d+(?:\.\d+)?px\b/.test(bare))
    issues.push(["geometry", value]);
  return issues;
}

function auditFile(file) {
  const source = readFileSync(file, "utf8");
  const name = relative(root, file);
  const add = (prop, value, start, context = "") => {
    const line = source.slice(0, start).split("\n").length;
    const adjacent = source
      .split("\n")
      .slice(Math.max(0, line - 4), line + 1)
      .join("\n");
    for (const [kind, detail] of inspectValue(prop, value)) {
      // Explicit contract exceptions remain visible in the report.
      const documented = /Primitive:|Token exception:/.test(adjacent + context);
      findings.push({
        file: name,
        line,
        property: prop,
        value,
        kind,
        detail,
        documented,
      });
    }
  };
  const css = (text, offset) => {
    if (!text.replaceAll("__dynamic__", "").trim()) return;
    try {
      const ast = postcss.parse(text);
      ast.walkDecls((d) => {
        if (d.parent.type === "atrule" && d.parent.name === "font-face") return;
        add(
          d.prop,
          d.value,
          offset + (d.source?.start?.offset || 0),
          [d.prev(), d.next()].filter((n) => n?.type === "comment").map((n) => n.text).join('\n'),
        );
      });
    } catch (error) {
      findings.push({
        file: name,
        line: source.slice(0, offset).split("\n").length,
        kind: "parse-error",
        detail: error.reason,
      });
    }
  };
  if (extname(file) === ".css") {
    css(source, 0);
    return;
  }
  if (extname(file) === ".mdx") {
    for (const match of source.matchAll(/```css\s*\n([\s\S]*?)```/g))
      css(match[1], match.index + match[0].indexOf(match[1]));
    for (const match of source.matchAll(/style="([^"]+)"/g))
      css(`x{${match[1]}}`, match.index);
    return;
  }
  const js = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JSX,
  );
  function literal(node) {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isNumericLiteral(node)
    )
      return node.text;
    if (ts.isTemplateExpression(node))
      return (
        node.head.text +
        node.templateSpans.map((s) => "__dynamic__" + s.literal.text).join("")
      );
    return null;
  }
  function visit(node) {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateExpression(node)
    ) {
      const text = literal(node),
        offset = node.getStart(js) + 1;
      let hasStyles = false;
      for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
        css(m[1], offset + m.index + m[0].indexOf(m[1]));
        hasStyles = true;
      }
      for (const m of text.matchAll(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
        const contents = m[1] ?? m[2];
        if (contents.includes(":"))
          css(`x{${contents}}`, offset + m.index + m[0].indexOf(contents) - 2);
        hasStyles = true;
      }
      if (!hasStyles && !text.includes("<") && !text.includes("`")) {
        const firstProperty = text.trim().match(/^([a-z-]+)\s*:/)?.[1];
        if (
          firstProperty &&
          (property.test(firstProperty) ||
            geometry.test(firstProperty) ||
            /^(display|position|white-space|cursor|align-items)$/.test(
              firstProperty,
            ))
        )
          css(`x{${text}}`, offset - 2);
        else if (/^\s*(?:\/\*[\s\S]*?\*\/\s*)*[^{}]+\{[\s\S]*\}\s*$/.test(text))
          css(text, offset);
      }
      // JS palettes and function arguments can contain colors outside CSS.
      if (/^(?:#[a-f\d]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))$/i.test(text))
        add("color", text, offset);
    }
    if (
      ts.isBinaryExpression(node) &&
      /\.style\.[\w]+$/.test(node.left.getText(js))
    ) {
      const value = literal(node.right);
      if (value !== null)
        add(
          camel(node.left.getText(js).split(".").at(-1)),
          value,
          node.getStart(js),
        );
    }
    if (
      ts.isCallExpression(node) &&
      /\.(?:style|attr)$/.test(node.expression.getText(js)) &&
      node.arguments.length >= 2
    ) {
      const prop = literal(node.arguments[0]),
        value = literal(node.arguments[1]);
      if (prop && value !== null) add(prop, value, node.getStart(js));
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(js) === "Object.assign" &&
      /\.style$/.test(node.arguments[0]?.getText(js) || "")
    ) {
      for (const arg of node.arguments
        .slice(1)
        .filter(ts.isObjectLiteralExpression))
        for (const member of arg.properties) {
          if (!ts.isPropertyAssignment(member)) continue;
          const value = literal(member.initializer);
          if (value !== null)
            add(
              camel(member.name.getText(js).replace(/['"]/g, "")),
              value,
              member.getStart(js),
            );
        }
    }
    ts.forEachChild(node, visit);
  }
  visit(js);
}

export function runAudit() {
  findings.length = 0;
  const files = [
    ".storybook",
    "apps/storybook/stories",
    "packages/components/src",
    "packages/grid/src",
  ]
    .flatMap((p) => walk(`${root}/${p}`))
    .filter(
      (f) =>
        /\.(css|js|mjs|mdx)$/.test(f) &&
        !/\/assets\/|\/icons\/|\/generated\/(analyticsSnapshot|typographyScale)|\/shared\/normalize\.css$|\.test\.|\/app-library\.js$/.test(
          f,
        ),
    );
  for (const file of files) auditFile(file);
  const unique = [
    ...new Map(
      findings.map((f) => [
        JSON.stringify([f.file, f.line, f.property, f.kind, f.detail]),
        f,
      ]),
    ).values(),
  ];
  const result = {
    files: files.length,
    scope: [
      "Storybook configuration, themes, MDX, stories, generated previews, component styles, grid CSS",
    ],
    excluded: [
      "Vendor normalize.css",
      "SVG/logo artwork and asset modules",
      "Generated analytics and typography source data",
      "Tests",
    ],
    geometry:
      "Reported separately: viewport fixtures, layout constraints, measured Figma dimensions, SVG coordinates, and chart geometry are not automatically token violations.",
    findings: unique,
  };
  const dir = process.env.TOKEN_AUDIT_OUTPUT || "/tmp/s2a-token-audit";
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/audit.json`, JSON.stringify(result, null, 2) + "\n");
  const counts = Object.fromEntries(
    [...new Set(unique.map((f) => f.kind))].map((kind) => [
      kind,
      unique.filter((f) => f.kind === kind).length,
    ]),
  );
  console.log(
    JSON.stringify(
      { files: files.length, counts, report: `${dir}/audit.json` },
      null,
      2,
    ),
  );
  if (process.argv.includes("--check")) {
    const exceptions = JSON.parse(
      readFileSync(
        `${root}/apps/storybook/token-audit-exceptions.json`,
        "utf8",
      ),
    );
    const key = (f) => JSON.stringify([f.file, f.property, f.kind, f.detail]);
    const tracked = new Set(exceptions.findings.map(key));
    const unexpected = unique.filter(
      (f) => f.kind !== "geometry" && !tracked.has(key(f)),
    );
    if (unexpected.length) {
      console.error(
        "New token findings (fix the style or review the missing system alias):",
      );
      for (const finding of unexpected)
        console.error(
          `${finding.file}:${finding.line} ${finding.kind}: ${finding.detail}`,
        );
      process.exitCode = 1;
    } else
      console.log(
        `No new token debt. ${unique.filter((f) => f.kind !== "geometry").length} existing findings remain explicitly tracked.`,
      );
  }
  return result;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  runAudit();
