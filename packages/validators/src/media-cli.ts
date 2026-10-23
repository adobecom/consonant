#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  auditMediaQueries,
  compareMediaQueryBaseline,
  createMediaQueryBaseline,
  mediaQueryTable,
  type MediaQueryAuditOptions,
  type MediaQueryBaseline,
} from "./audit-media-queries.js";
import type {
  MediaQueryException,
  MediaQueryPolicy,
} from "./validate-media-queries.js";

const help = `Usage: s2a-validate-media [options] [file.css ...]
  --root <path>          CSS tree to scan (repeatable)
  --milo <checkout>      Scan <checkout>/libs/blocks (or a blocks directory)
  --block <name>         Limit to a block (repeatable)
  --config <json>        Optional { policy, exceptions } configuration
  --baseline <json>      Fail only new/increased violations; still report all
  --write-baseline <json> Write current debt for explicit review (not for CI)
  --json <file>          Full machine-readable inventory, locations and findings
  --markdown <file>      William's per-block occurrence table
  --audit               Inventory mode; policy violations do not set exit 1
  --help                Show this help

Exit codes: 0 = pass (or completed --audit); 1 = policy/regression failure;
2 = invalid input, configuration, missing/empty scope, or malformed CSS.
Default policy: MD >=768px; LG >=1280px; XL >=1441px; mobile base unqueried.
`;

function main(args: string[]): number {
  if (args.includes("--help")) {
    console.log(help);
    return 0;
  }
  const roots: string[] = [],
    blocks: string[] = [];
  const values: Record<string, string> = {};
  let auditOnly = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--audit") {
      auditOnly = true;
      continue;
    }
    if (
      [
        "--root",
        "--milo",
        "--block",
        "--config",
        "--baseline",
        "--write-baseline",
        "--json",
        "--markdown",
      ].includes(arg)
    ) {
      const value = args[++i];
      if (!value || value.startsWith("--"))
        throw new Error(`Missing value for ${arg}`);
      if (arg === "--root") roots.push(value);
      else if (arg === "--milo") {
        const library = join(value, "libs", "blocks");
        if (!existsSync(library) && !existsSync(value))
          throw new Error(`Milo checkout does not exist: ${value}`);
        roots.push(existsSync(library) ? library : value);
      } else if (arg === "--block") blocks.push(value);
      else {
        if (values[arg]) throw new Error(`Repeated option: ${arg}`);
        values[arg] = value;
      }
    } else if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
    else roots.push(arg);
  }
  if (!roots.length) throw new Error(help);
  if (values["--baseline"] && values["--write-baseline"])
    throw new Error(
      "Reading and overwriting a baseline in the same run is not allowed.",
    );
  if (process.env.CI && values["--write-baseline"])
    throw new Error("CI must not rewrite its own baseline.");
  let config: {
    policy?: MediaQueryPolicy;
    exceptions?: MediaQueryException[];
  } = {};
  if (values["--config"]) {
    config = JSON.parse(readFileSync(resolve(values["--config"]), "utf8"));
    if (
      config &&
      typeof config === "object" &&
      Object.keys(config).some((key) => !["policy", "exceptions"].includes(key))
    )
      throw new Error("Configuration accepts only policy and exceptions.");
    if (
      !config ||
      typeof config !== "object" ||
      (config.exceptions &&
        (!Array.isArray(config.exceptions) ||
          config.exceptions.some(
            (e) =>
              !e.file ||
              !e.query ||
              e.kind !== "reflow" ||
              !e.reason ||
              e.reason.trim().length < 16,
          )))
    )
      throw new Error("Invalid reflow exception configuration.");
  }
  const options: MediaQueryAuditOptions = { roots, blocks, ...config };
  const audit = auditMediaQueries(options);
  const baseline = values["--baseline"]
    ? (JSON.parse(
        readFileSync(resolve(values["--baseline"]), "utf8"),
      ) as MediaQueryBaseline)
    : undefined;
  const gate = baseline
    ? compareMediaQueryBaseline(audit, baseline)
    : {
        ok: audit.ok,
        newFindings: createMediaQueryBaseline(audit).entries,
        resolved: [],
      };
  const write = (file: string, content: string) => {
    mkdirSync(dirname(resolve(file)), { recursive: true });
    writeFileSync(resolve(file), content);
  };
  const output = {
    ...audit,
    gate: {
      mode: auditOnly ? "audit" : baseline ? "regression" : "strict",
      ...gate,
    },
  };
  if (values["--json"])
    write(values["--json"], JSON.stringify(output, null, 2) + "\n");
  if (values["--markdown"]) write(values["--markdown"], mediaQueryTable(audit));
  const parseFailure = audit.files.some((f) =>
    f.violations.some((v) => v.code === "CSS_PARSE_ERROR"),
  );
  if (values["--write-baseline"] && !parseFailure)
    write(
      values["--write-baseline"],
      JSON.stringify(createMediaQueryBaseline(audit), null, 2) + "\n",
    );
  const s = audit.summary;
  console.log(
    `Media queries: ${s.blocks} blocks, ${s.files} CSS files, ${s.queries} query occurrences.`,
  );
  console.log(
    `${s.standard} standard, ${s.reflow} documented reflows, ${s.environment} environment/preference queries, ${s.failingQueries} failing queries (${s.violations} findings).`,
  );
  console.log(
    `Policy ${audit.policy.id}: ${Object.entries(audit.policy.breakpoints)
      .map(([name, px]) => `${name} >=${px}px`)
      .join(", ")}; mobile base has no query.`,
  );
  for (const entry of gate.newFindings.slice(0, 30))
    console.log(
      `  ${entry.file}: ${entry.code} ${entry.query} (${entry.occurrences})`,
    );
  if (gate.newFindings.length > 30)
    console.log(
      `  …${gate.newFindings.length - 30} more entries; see the JSON report.`,
    );
  console.log(
    auditOnly
      ? "AUDIT ONLY — findings remain unresolved; this is not a compliance pass."
      : gate.ok
        ? `PASS${baseline ? " — no new responsive debt; existing findings remain in the report" : ""}.`
        : "FAIL — responsive rules need review.",
  );
  if (values["--json"]) console.log(`JSON: ${values["--json"]}`);
  if (values["--markdown"]) console.log(`Table: ${values["--markdown"]}`);
  if (parseFailure) return 2;
  return auditOnly || gate.ok ? 0 : 1;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  console.error(`[s2a-validate-media] ${(error as Error).message}`);
  process.exitCode = 2;
}
