import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  validateMediaQueries,
  parseWidthComparisons,
  WILL_BLOCK_MEDIA_POLICY,
} from "../src/validate-media-queries.js";
import {
  auditMediaQueries,
  createMediaQueryBaseline,
  compareMediaQueryBaseline,
  mediaQueryTable,
} from "../src/audit-media-queries.js";

const css = (query: string, declarations = "display: grid") =>
  `@media ${query} { .cards { ${declarations}; } }`;
const note =
  "/* s2a-reflow: Keep carousel cards readable when tablet controls share a row. */\n";
const validate = (query: string) => validateMediaQueries(css(query));

for (const px of [768, 1280, 1441]) {
  for (const query of [
    `(width >= ${px}px)`,
    `screen and (min-width: ${px}px)`,
    `(${px}px <= width)`,
  ]) {
    test(`standard: ${query}`, () =>
      assert.equal(validate(query).queries[0].classification, "standard"));
  }
}
test("unqueried mobile base passes", () =>
  assert.equal(validateMediaQueries(".cards { display: grid; }").ok, true));
test("1440 is not rounded to XL 1441", () => {
  const result = validate("(width >= 1440px)");
  assert.equal(result.ok, false);
  assert.match(result.violations[0].message, /XL starts at 1441px/);
});
test("preserves fractional and exclusive boundaries", () => {
  for (const query of [
    "(767px < width < 1280px)",
    "(width > 768px)",
    "(max-width: 767.99px)",
    "(width >= 1024px)",
  ])
    assert.equal(validate(query).ok, false, query);
  assert.deepEqual(
    parseWidthComparisons("(767.99px < width <= 1280px)").widths,
    [
      { operator: ">", value: 767.99, unit: "px" },
      { operator: "<=", value: 1280, unit: "px" },
    ],
  );
});
test("upper bounds require a documented reflow", () => {
  assert.ok(
    validate("(max-width: 768px)").violations.some(
      (v) => v.code === "MQ_MOBILE_FIRST",
    ),
  );
  assert.equal(
    validateMediaQueries(note + css("(768px <= width < 1280px)")).queries[0]
      .classification,
    "reflow",
  );
});
test("portrait thresholds need a specific layout reason", () => {
  for (const px of [840, 900, 960]) {
    assert.equal(validate(`(width >= ${px}px)`).ok, false);
    assert.equal(
      validateMediaQueries(note + css(`(width >= ${px}px)`)).queries[0]
        .classification,
      "reflow",
    );
  }
  assert.ok(
    validateMediaQueries(
      note + css("(width >= 900px)", "color: red"),
    ).violations.some((v) => v.code === "MQ_EXCEPTION_NOT_REFLOW"),
  );
  assert.equal(
    validateMediaQueries("/* s2a-reflow: TODO */" + css("(width >= 900px)")).ok,
    false,
  );
});
test("reflow note may be the first comment inside the query", () => {
  assert.equal(
    validateMediaQueries(
      "@media (width >= 900px) {" +
        note +
        ".cards { grid-template-columns: repeat(3, 1fr) } }",
    ).ok,
    true,
  );
});
test("bespoke reflows outside the portrait band need an exact reviewed exception", () => {
  const source = note + css("(width >= 1700px)");
  assert.ok(
    validateMediaQueries(source).violations.some(
      (v) => v.code === "MQ_EXCEPTION_REVIEW",
    ),
  );
  const exceptions = [
    {
      file: "carousel/carousel.css",
      query: "(width >= 1700px)",
      kind: "reflow" as const,
      reason:
        "Fit four complete cards alongside the carousel navigation controls.",
    },
  ];
  assert.equal(
    validateMediaQueries(source, { file: "carousel/carousel.css", exceptions })
      .ok,
    true,
  );
  assert.equal(
    validateMediaQueries(source, { file: "other.css", exceptions }).ok,
    false,
  );
  assert.equal(
    validateMediaQueries(css("(width >= 1701px)"), {
      file: "carousel/carousel.css",
      exceptions,
    }).ok,
    false,
  );
});
test("preference, print, orientation, and height queries are not width violations", () => {
  for (const query of [
    "(prefers-reduced-motion: reduce)",
    "(orientation: portrait)",
    "(min-height: 431px)",
    "print",
    "print and (min-width: 600px)",
    "(hover: hover)",
  ])
    assert.equal(
      validate(query).queries[0].classification,
      "environment",
      query,
    );
  assert.equal(
    validate("(min-width: 600px) and (orientation: landscape)").ok,
    false,
  );
});
test("comma lists, nested queries, comments and strings are handled as CSS", () => {
  const result = validateMediaQueries(
    '/* @media (width >= 600px) {} */ .x { content: "@media (width >= 600px) {}"; }' +
      css("(width >= 768px), (width >= 600px)") +
      "@supports (display: grid) {" +
      css("(width >= 1280px)") +
      "}",
  );
  assert.equal(result.queries.length, 3);
  assert.equal(result.violations.length, 1);
});
test("unsupported and invalid width expressions cannot silently pass", () => {
  for (const query of [
    "(width >= 48rem)",
    "(width >= calc(768px))",
    "(--tablet)",
    "(width >= 768px) and (width < calc(1280px))",
    "(min-device-width: 768px)",
    "(width)",
    "not screen and (width >= 768px)",
    "(width >= 768px) or (width >= 1280px)",
    "(768px <= width >= 1280px)",
    "(1280px <= width < 768px)",
    "(768px < width < 768px)",
  ])
    assert.equal(validate(query).ok, false, query);
});
test("malformed CSS produces a located parse error", () => {
  const result = validateMediaQueries(".cards {", { file: "broken.css" });
  assert.equal(result.violations[0].code, "CSS_PARSE_ERROR");
  assert.equal(result.violations[0].file, "broken.css");
  assert.equal(result.violations[0].line, 1);
});
test("invalid policies fail explicitly", () => {
  assert.throws(
    () =>
      validateMediaQueries("", {
        policy: { ...WILL_BLOCK_MEDIA_POLICY, portraitReflow: [960, 840] },
      }),
    /Invalid/,
  );
});

function fixture(t: TestContext) {
  const root = mkdtempSync(join(tmpdir(), "s2a-media-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (name: string, content: string) => {
    const path = join(root, name);
    mkdirSync(resolve(path, ".."), { recursive: true });
    writeFileSync(path, content);
    return path;
  };
  return { root, put };
}
test("inventory aggregates occurrences, locations, and blocks without queries", (t) => {
  const { root, put } = fixture(t);
  put(
    "carousel/a.css",
    css("(min-width: 900px)") + "\n" + css("(min-width: 900px)"),
  );
  put("carousel/b.css", css("(min-width: 900px)"));
  put("navigation/navigation.js", "export default {}");
  put("card/card.css", ".card { display: block }");
  const result = auditMediaQueries({ roots: [root] });
  assert.equal(result.summary.blocks, 3);
  assert.equal(result.summary.queries, 3);
  assert.equal(result.rows.find((r) => r.block === "carousel")?.occurrences, 3);
  assert.match(
    result.rows.find((r) => r.block === "carousel")!.locations[1],
    /a.css:2/,
  );
  assert.match(mediaQueryTable(result), /navigation \| None \| 0/);
  assert.equal(
    auditMediaQueries({ roots: [root], blocks: ["card"] }).summary.files,
    1,
  );
  assert.throws(
    () => auditMediaQueries({ roots: [root], blocks: ["typo"] }),
    /Unknown/,
  );
});
test("empty and missing scopes never produce a clean gate", (t) => {
  const { root } = fixture(t);
  assert.throws(() => auditMediaQueries({ roots: [root] }), /No CSS/);
  assert.throws(() => auditMediaQueries({ roots: [] }), /at least one/);
  assert.throws(() => auditMediaQueries({ roots: [join(root, "missing")] }));
});
test("baseline tolerates line movement, detects added occurrences, and reports resolved debt", (t) => {
  const { root, put } = fixture(t);
  const source = css("(width >= 1440px)");
  put("card/card.css", source);
  const run = () => auditMediaQueries({ roots: [root] });
  const baseline = createMediaQueryBaseline(run());
  put("card/card.css", "\n\n" + source);
  assert.equal(compareMediaQueryBaseline(run(), baseline).ok, true);
  put("card/card.css", source + source);
  assert.equal(compareMediaQueryBaseline(run(), baseline).ok, false);
  put("card/card.css", css("(width >= 1441px)"));
  assert.equal(compareMediaQueryBaseline(run(), baseline).resolved.length, 1);
  assert.throws(
    () =>
      compareMediaQueryBaseline(run(), {
        ...baseline,
        policy: { ...baseline.policy, id: "different" },
      }),
    /policy/,
  );
  put("card/card.css", ".card {");
  assert.equal(compareMediaQueryBaseline(run(), baseline).ok, false);
});
test("multiple scan roots keep independent finding identities", (t) => {
  const { root, put } = fixture(t);
  put("one/src/card.css", css("(width >= 600px)"));
  put("two/src/card.css", css("(width >= 600px)"));
  const result = auditMediaQueries({
    roots: [join(root, "one/src"), join(root, "two/src")],
  });
  assert.equal(createMediaQueryBaseline(result).entries.length, 2);
});
test("CLI exit codes, reports and explicit baseline behavior", (t) => {
  const { root, put } = fixture(t);
  const source = put("blocks/card/card.css", css("(width >= 1440px)"));
  const cli = resolve("packages/validators/src/media-cli.ts");
  const run = (...args: string[]) =>
    spawnSync(
      process.execPath,
      ["--import", "tsx", cli, "--root", source, ...args],
      { encoding: "utf8", env: { ...process.env, CI: "" } },
    );
  assert.equal(run().status, 1);
  const report = join(root, "audit.json"),
    baseline = join(root, "baseline.json");
  assert.equal(
    run("--audit", "--json", report, "--write-baseline", baseline).status,
    0,
  );
  assert.equal(JSON.parse(readFileSync(report, "utf8")).ok, false);
  assert.equal(run("--baseline", baseline).status, 0);
  assert.equal(
    run("--baseline", baseline, "--write-baseline", baseline).status,
    2,
  );
  assert.equal(
    spawnSync(
      process.execPath,
      ["--import", "tsx", cli, "--root", source, "--write-baseline", baseline],
      { env: { ...process.env, CI: "true" } },
    ).status,
    2,
  );
  writeFileSync(source, ".broken {");
  const brokenBaseline = join(root, "broken-baseline.json");
  assert.equal(run("--audit", "--write-baseline", brokenBaseline).status, 2);
  assert.equal(existsSync(brokenBaseline), false);
  writeFileSync(source, css("(width >= 768px)"));
  assert.equal(run().status, 0);
  assert.equal(run("--unknown").status, 2);
});
