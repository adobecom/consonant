import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { validateCss } from "../src/validate-css.js";
import { validateFigma, type FigmaSnapshot } from "../src/validate-figma.js";
import { fetchFigmaSnapshot, parseFigmaTarget } from "../src/figma-rest.js";
import { libraryGate, libraryMarkdown } from "../src/library-report.js";
import { auditMilo } from "../src/audit-milo.js";

const index = {
  known: new Set([
    "--s2a-color-ink",
    "--s2a-color-content",
    "--s2a-spacing-sm",
  ]),
  primitive: new Set(["--s2a-color-ink"]),
};
const alias = (id: string) => ({ type: "VARIABLE_ALIAS", id });
const paint = { type: "SOLID", color: { r: 1, g: 0, b: 0 } };
function fixture(): FigmaSnapshot {
  return {
    schema: "s2a-figma-snapshot/1",
    fileKey: "abc123",
    name: "Test library",
    capturedAt: "2026-10-13T00:00:00Z",
    scope: "file",
    variablesStatus: "complete",
    roots: [
      {
        id: "0:0",
        name: "Document",
        type: "DOCUMENT",
        children: [
          {
            id: "1:1",
            name: "Button",
            type: "COMPONENT",
            description: "Submit a form.",
            fills: [{ ...paint, boundVariables: { color: alias("semantic") } }],
          },
        ],
      },
    ],
    variables: {
      semantic: {
        id: "semantic",
        name: "s2a/color/content",
        variableCollectionId: "c",
        resolvedType: "COLOR",
        hiddenFromPublishing: true,
        valuesByMode: { light: alias("primitive") },
      },
      primitive: {
        id: "primitive",
        name: "s2a/color/ink",
        variableCollectionId: "p",
        resolvedType: "COLOR",
        valuesByMode: { light: { r: 0, g: 0, b: 0 } },
      },
    },
    collections: {
      c: {
        id: "c",
        name: "Semantic",
        modes: [{ modeId: "light", name: "Light" }],
      },
      p: {
        id: "p",
        name: "S2A / Primitives / Color",
        modes: [{ modeId: "light", name: "Light" }],
      },
    },
  };
}
const component = (s: FigmaSnapshot) => s.roots[0].children![0];
const codes = (s: FigmaSnapshot) =>
  validateFigma(s, index).findings.map((f) => f.code);

test("CSS ignores comments, selectors, URLs and strings while inspecting declaration colors", () => {
  const r = validateCss(
    '/* #fff 40px */ #abc { background: url("file.svg#fff"); content: "#fff"; color: #123456; }',
    index,
  );
  assert.deepEqual(
    r.violations.map((v) => v.code),
    ["HARDCODED_HEX"],
  );
  assert.equal(r.ok, false);
});
test("CSS warnings are explicit and do not silently fail the default gate", () => {
  const r = validateCss(
    ".x { color: var(--s2a-missing); padding: 1.5px; }",
    index,
    { reviewDimensions: true },
  );
  assert.equal(r.ok, true);
  assert.deepEqual(
    r.violations.map((v) => v.severity),
    ["warning", "warning"],
  );
  assert.equal(
    validateCss(".x { padding: 1.5px; }", index, { strict: true }).ok,
    false,
  );
});
test("CSS recognizes local aliases and documents primitive exceptions without hiding them", () => {
  assert.equal(
    validateCss(
      ".x { --s2a-local: var(--s2a-color-content); color:var(--s2a-local); }",
      index,
    ).violations.length,
    0,
  );
  const r = validateCss(
    ".x { color:var(--s2a-color-ink); /* Primitive: awaiting the matching semantic border alias. */ }",
    index,
  );
  assert.equal(r.ok, true);
  assert.equal(r.violations[0].code, "PRIMITIVE_EXCEPTION");
  assert.equal(
    validateCss(".x { color:var(--s2a-color-ink); }", index).ok,
    false,
  );
});
test("malformed CSS is an error", () => {
  assert.equal(
    validateCss(".x {", index).violations[0].code,
    "CSS_PARSE_ERROR",
  );
});
test("a variable alpha does not hide hardcoded color channels", () => {
  const r = validateCss(
    ".x { color:rgba(255, 0, 0, var(--opacity)); background:rgb(var(--s2a-color-content)); }",
    index,
  );
  assert.deepEqual(
    r.violations.map((v) => v.code),
    ["HARDCODED_RGB"],
  );
});
test("hidden semantic variables and semantic-to-primitive aliases are valid", () => {
  assert.deepEqual(codes(fixture()), []);
});
test("direct primitive bindings error, with a deep link", () => {
  const s = fixture();
  component(s).fills[0].boundVariables.color = alias("primitive");
  const r = validateFigma(s, index);
  assert.equal(r.counts.errors, 1);
  assert.equal(r.findings[0].code, "FIGMA_PRIMITIVE_BINDING");
  assert.match(r.findings[0].url!, /node-id=1%3A1/);
  assert.equal(libraryGate(r), false);
});
test("duplicate node/paint binding representation produces one finding", () => {
  const s = fixture(),
    n = component(s);
  n.fills[0].boundVariables.color = alias("primitive");
  n.boundVariables = { fills: [alias("primitive")] };
  assert.equal(validateFigma(s, index).counts.errors, 1);
});
test("literal UI paints error, artwork warns, image content is excluded", () => {
  const s = fixture();
  component(s).fills = [paint];
  component(s).children = [
    { id: "2:1", name: "Logo", type: "VECTOR", fills: [paint] },
    { id: "2:2", name: "Photo", type: "RECTANGLE", fills: [{ type: "IMAGE" }] },
  ];
  const r = validateFigma(s, index);
  assert.deepEqual(r.counts, { errors: 1, warnings: 1 });
});
test("dimensions warn but frame widths are never treated as breakpoints", () => {
  const s = fixture(),
    n = component(s);
  Object.assign(n, {
    width: 1700,
    layoutMode: "HORIZONTAL",
    paddingLeft: 12,
    cornerRadius: 0,
  });
  const r = validateFigma(s, index);
  assert.deepEqual(
    r.findings.map((f) => f.code),
    ["FIGMA_UNBOUND_DIMENSION"],
  );
  assert.equal(libraryGate(r), true);
  assert.equal(libraryGate(r, "warning"), false);
});
test("binding paint opacity does not make a literal color tokenized", () => {
  const s = fixture();
  component(s).fills = [
    { ...paint, boundVariables: { opacity: alias("semantic") } },
  ];
  assert.ok(codes(s).includes("FIGMA_UNBOUND_PAINT"));
});
test("bound radii do not mask unbound padding", () => {
  const s = fixture(),
    n = component(s);
  Object.assign(n, {
    layoutMode: "HORIZONTAL",
    paddingLeft: 12,
    boundVariables: { rectangleCornerRadii: [alias("semantic")] },
  });
  assert.ok(codes(s).includes("FIGMA_UNBOUND_DIMENSION"));
});
test("unknown variables and missing styles explicitly report coverage gaps", () => {
  const s = fixture();
  component(s).fills[0].boundVariables.color = alias("remote");
  s.scope = "nodes";
  component(s).textStyleId = "unavailable";
  component(s).type = "TEXT";
  s.variablesStatus = "unavailable";
  const r = validateFigma(s, index);
  assert.ok(r.findings.some((f) => f.code === "FIGMA_VARIABLE_COVERAGE"));
  assert.ok(r.findings.some((f) => f.code === "FIGMA_BINDING_UNRESOLVED"));
  assert.ok(r.findings.some((f) => f.code === "FIGMA_STYLE_COVERAGE"));
  assert.equal(libraryGate(r, "warning"), false);
});
test("shared paint styles are inspected instead of assuming style means compliant", () => {
  const s = fixture();
  component(s).fills = [paint];
  component(s).styles = { fill: "style1" };
  s.styles = {
    style1: { id: "style1", name: "Surface", type: "STYLE", fills: [paint] },
  };
  assert.deepEqual(codes(s), ["FIGMA_UNBOUND_PAINT"]);
});
test("missing local mode values and alias type mismatches are errors", () => {
  const s = fixture();
  s.collections.c.modes.push({ modeId: "dark", name: "Dark" });
  s.variables.primitive.resolvedType = "FLOAT";
  assert.deepEqual(codes(s).sort(), [
    "FIGMA_ALIAS_TYPE_MISMATCH",
    "FIGMA_MODE_VALUE_MISSING",
  ]);
});
test("alias graph cycles terminate and self references error", () => {
  const s = fixture();
  s.variables.semantic.valuesByMode.light = alias("semantic");
  assert.ok(codes(s).includes("FIGMA_ALIAS_SELF_REFERENCE"));
  s.variables.semantic.valuesByMode.light = alias("primitive");
  s.variables.primitive.valuesByMode.light = alias("semantic");
  assert.ok(codes(s).includes("FIGMA_ALIAS_CYCLE_REVIEW"));
});
test("file audit excludes documentation by default and includes it when requested", () => {
  const s = fixture();
  s.roots[0].children!.push({
    id: "8:1",
    type: "FRAME",
    name: "Docs",
    fills: [paint],
  });
  assert.equal(validateFigma(s, index).counts.errors, 0);
  assert.equal(
    validateFigma(s, index, { includeDocumentation: true }).counts.errors,
    1,
  );
});
test("empty and malformed snapshots never return a green result", () => {
  const s = fixture();
  s.roots = [];
  assert.throws(() => validateFigma(s, index), /Invalid Figma/);
  s.roots = [{ id: "0:0", type: "DOCUMENT", name: "Empty" }];
  assert.equal(validateFigma(s, index).ok, false);
});
test("Figma URL parser accepts node and whole-file scopes, rejects foreign URLs", () => {
  assert.deepEqual(
    parseFigmaTarget("https://www.figma.com/design/abc123/C2?node-id=1-2"),
    { fileKey: "abc123", nodeIds: ["1:2"] },
  );
  assert.deepEqual(parseFigmaTarget("abc123"), {
    fileKey: "abc123",
    nodeIds: [],
  });
  assert.throws(() => parseFigmaTarget("https://example.com/design/abc123"));
});
test("REST captures exactly requested roots and enriches component metadata", async () => {
  const response = (value: unknown, status = 200) =>
    new Response(JSON.stringify(value), { status });
  const fetcher = async (url: any) =>
    String(url).includes("/variables/")
      ? response({ meta: { variables: {}, variableCollections: {} } })
      : response({
          name: "C2",
          version: "v1",
          nodes: {
            "1:2": {
              document: { id: "1:2", type: "COMPONENT", name: "Button" },
              components: { "1:2": { description: "Perform an action." } },
            },
            extra: { document: { id: "9:9" } },
          },
        });
  const s = await fetchFigmaSnapshot(
    "https://figma.com/design/abc123/x?node-id=1-2",
    { token: "test", fetch: fetcher as typeof fetch },
  );
  assert.equal(s.roots.length, 1);
  assert.equal(s.roots[0].description, "Perform an action.");
  assert.equal(s.version, "v1");
});
test("REST auth and missing variable permission fail closed unless partial coverage is explicit", async () => {
  const denied = async () =>
    new Response("do not echo sensitive server body", { status: 403 });
  await assert.rejects(
    fetchFigmaSnapshot("abc123", {
      token: "secret",
      fetch: denied as typeof fetch,
    }),
    /HTTP 403/,
  );
  const partial = async (url: any) =>
    String(url).includes("/variables/")
      ? denied()
      : new Response(JSON.stringify({ document: fixture().roots[0] }));
  await assert.rejects(
    fetchFigmaSnapshot("abc123", {
      token: "secret",
      fetch: partial as typeof fetch,
    }),
    /HTTP 403/,
  );
  const s = await fetchFigmaSnapshot("abc123", {
    token: "secret",
    fetch: partial as typeof fetch,
    allowMissingVariables: true,
  });
  assert.equal(s.variablesStatus, "unavailable");
});
test("Milo combines responsive errors and token warnings with real locations", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "s2a-library-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, "carousel"));
  writeFileSync(
    join(dir, "carousel", "carousel.css"),
    "@media (width >= 1700px) { .x { padding: 12px; color:var(--s2a-missing); } }",
  );
  const r = auditMilo({ roots: [dir], index, blocks: ["carousel"] });
  assert.equal(r.counts.errors, 1);
  assert.equal(r.counts.warnings, 2);
  assert.ok(r.findings[0].file?.endsWith("carousel/carousel.css"));
  assert.match(libraryMarkdown(r), /MQ_NONSTANDARD_BREAKPOINT/);
});
test("CLI gates warnings independently and reports invalid snapshots as exit 2", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "s2a-cli-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const tokens = join(dir, "dist/packages/tokens/css/dev");
  mkdirSync(tokens, { recursive: true });
  writeFileSync(
    join(tokens, "tokens.semantic.css"),
    ":root { --s2a-color-content: black; }",
  );
  writeFileSync(
    join(tokens, "tokens.primitives.css"),
    ":root { --s2a-color-ink: black; }",
  );
  const s = fixture();
  component(s).description = "";
  const path = join(dir, "snapshot.json");
  writeFileSync(path, JSON.stringify(s));
  const cli = resolve("packages/validators/src/library-cli.ts");
  const args = [
    "--import",
    "tsx",
    cli,
    "--source",
    "figma",
    "--snapshot",
    path,
    "--ds-root",
    dir,
  ];
  const run = (...extra: string[]) =>
    spawnSync(process.execPath, [...args, ...extra], { encoding: "utf8" });
  assert.equal(run().status, 0);
  assert.equal(run("--fail-on", "warning").status, 1);
  const output = join(dir, "report.json");
  assert.equal(
    run("--fail-on", "warning", "--audit", "--json", output).status,
    0,
  );
  assert.equal(JSON.parse(readFileSync(output, "utf8")).gate.passed, false);
  writeFileSync(path, "{}");
  assert.equal(run().status, 2);
});
test("legacy CSS CLI no longer fails or hides warning-only results", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "s2a-css-cli-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const tokens = join(dir, "dist/packages/tokens/css/dev");
  mkdirSync(tokens, { recursive: true });
  writeFileSync(
    join(tokens, "tokens.semantic.css"),
    ":root { --s2a-color-content: black; }",
  );
  const file = join(dir, "test.css");
  writeFileSync(file, ".x {color:var(--s2a-missing)}");
  const args = [
    "--import",
    "tsx",
    resolve("packages/validators/src/cli.ts"),
    file,
  ];
  const env = { ...process.env, DS_ROOT: dir };
  const r = spawnSync(process.execPath, args, { encoding: "utf8", env });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /warning UNKNOWN_TOKEN/);
  assert.equal(
    spawnSync(process.execPath, [...args, "--warnings-as-errors"], { env })
      .status,
    1,
  );
});
