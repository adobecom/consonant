#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { loadTokenIndex } from "./token-index.js";
import { validateFigma, type FigmaSnapshot } from "./validate-figma.js";
import { fetchFigmaSnapshot } from "./figma-rest.js";
import { auditMilo } from "./audit-milo.js";
import {
  libraryGate,
  libraryMarkdown,
  type LibraryReport,
} from "./library-report.js";

async function main() {
  const { values: args } = parseArgs({
    options: {
      source: { type: "string" },
      milo: { type: "string" },
      layer: { type: "string", default: "c2" },
      root: { type: "string", multiple: true },
      block: { type: "string", multiple: true },
      "figma-url": { type: "string" },
      snapshot: { type: "string" },
      "write-snapshot": { type: "string" },
      "allow-missing-variables": { type: "boolean" },
      "include-docs": { type: "boolean" },
      "strict-tokens": { type: "boolean" },
      config: { type: "string" },
      "fail-on": { type: "string", default: "error" },
      audit: { type: "boolean" },
      json: { type: "string" },
      markdown: { type: "string" },
      "ds-root": { type: "string" },
      help: { type: "boolean" },
    },
    strict: true,
  });
  if (args.help) {
    console.log(
      "s2a-validate-library --source figma (--figma-url URL_OR_KEY | --snapshot FILE) [--include-docs] [--write-snapshot FILE]\ns2a-validate-library --source milo (--milo CHECKOUT [--layer c2|classic|all] | --root CSS_ROOT) [--block NAME]\nShared: [--fail-on error|warning] [--audit] [--json FILE] [--markdown FILE] [--ds-root REPO]\nMilo: [--strict-tokens] [--config MEDIA_POLICY_JSON]\nFigma: [--allow-missing-variables] explicitly permits partial variable coverage.\nExit 0: pass/inventory; 1: findings fail gate; 2: invalid input, credentials, or malformed CSS.",
    );
    return;
  }
  if (!["error", "warning"].includes(args["fail-on"]!))
    throw new Error("--fail-on must be error or warning.");
  const root = resolve(
    args["ds-root"] ||
      process.env.DS_ROOT ||
      join(dirname(fileURLToPath(import.meta.url)), "../../.."),
  );
  const index = loadTokenIndex(root);
  if (!index.known.size)
    throw new Error("Token registry is empty; build tokens before validation.");
  const save = (path: string | undefined, content: string) => {
    if (path) {
      mkdirSync(dirname(resolve(path)), { recursive: true });
      writeFileSync(path, content);
    }
  };
  let report: LibraryReport;
  if (args.source === "figma") {
    if (!!args.snapshot === !!args["figma-url"])
      throw new Error("Choose exactly one of --figma-url and --snapshot.");
    if (
      args.milo ||
      args.root ||
      args.block ||
      args.config ||
      args["strict-tokens"]
    )
      throw new Error("Milo options cannot be used for a Figma audit.");
    const snapshot: FigmaSnapshot = args.snapshot
      ? JSON.parse(readFileSync(args.snapshot, "utf8"))
      : await fetchFigmaSnapshot(args["figma-url"]!, {
          token:
            process.env.FIGMA_ACCESS_TOKEN ||
            process.env.FIGMA_TOKEN ||
            process.env.FIGMA_PAT ||
            process.env.FIGMA_REST_API ||
            "",
          allowMissingVariables: args["allow-missing-variables"],
        });
    report = validateFigma(snapshot, index, {
      includeDocumentation: args["include-docs"],
    });
    save(args["write-snapshot"], JSON.stringify(snapshot, null, 2) + "\n");
  } else if (args.source === "milo") {
    if (
      args.snapshot ||
      args["figma-url"] ||
      args["write-snapshot"] ||
      args["include-docs"] ||
      args["allow-missing-variables"]
    )
      throw new Error("Figma options cannot be used for a Milo audit.");
    if (!!args.milo === !!args.root?.length)
      throw new Error("Choose --milo or --root.");
    if (!["c2", "classic", "all"].includes(args.layer!))
      throw new Error("--layer must be c2, classic, or all.");
    const roots =
      args.root ||
      (args.layer === "all"
        ? ["libs/blocks", "libs/c2/blocks"]
        : [args.layer === "classic" ? "libs/blocks" : "libs/c2/blocks"]
      ).map((path) => join(args.milo!, path));
    const config = args.config
      ? JSON.parse(readFileSync(args.config, "utf8"))
      : {};
    report = auditMilo({
      roots,
      blocks: args.block,
      policy: config.policy,
      exceptions: config.exceptions,
      index,
      strictTokens: args["strict-tokens"],
    });
  } else throw new Error("Choose --source figma or --source milo. See --help.");
  const gate = {
    failOn: args["fail-on"],
    passed: libraryGate(report, args["fail-on"] as "error" | "warning"),
    auditOnly: !!args.audit,
  };
  save(args.json, JSON.stringify({ ...report, gate }, null, 2) + "\n");
  save(
    args.markdown,
    libraryMarkdown(report) +
      "\nGate: " +
      (gate.passed ? "PASS" : "FAIL") +
      " (fail on " +
      gate.failOn +
      ")" +
      (gate.auditOnly ? "; inventory mode does not fail the process." : "") +
      "\n",
  );
  console.log(
    report.source +
      ": " +
      report.counts.errors +
      " errors, " +
      report.counts.warnings +
      " warnings. Gate: " +
      (gate.passed ? "PASS" : "FAIL") +
      (args.audit ? " (inventory)" : ""),
  );
  const groups = new Map<string, number>();
  report.findings.forEach((f) => {
    const key = f.severity + " " + f.code;
    groups.set(key, (groups.get(key) || 0) + 1);
  });
  groups.forEach((count, key) => console.log("  " + key + ": " + count));
  if (report.findings.some((f) => f.code === "CSS_PARSE_ERROR"))
    process.exitCode = 2;
  else if (!gate.passed && !args.audit) process.exitCode = 1;
}
main().catch((error) => {
  console.error("[s2a-validate-library] " + error.message);
  process.exitCode = 2;
});
