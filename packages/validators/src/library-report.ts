export type Severity = "error" | "warning";
export interface LibraryFinding {
  source: "figma" | "milo";
  severity: Severity;
  code: string;
  message: string;
  file?: string;
  line?: number;
  nodeId?: string;
  nodeName?: string;
  property?: string;
  value?: string;
  url?: string;
}
export interface LibraryReport {
  schema: "s2a-library-audit/1";
  source: "figma" | "milo";
  generatedAt: string;
  scope: Record<string, unknown>;
  coverage: string[];
  counts: { errors: number; warnings: number };
  findings: LibraryFinding[];
  ok: boolean;
}
export function libraryReport(
  source: LibraryReport["source"],
  findings: LibraryFinding[],
  scope: LibraryReport["scope"],
  coverage: string[],
): LibraryReport {
  const counts = {
    errors: findings.filter((f) => f.severity === "error").length,
    warnings: findings.filter((f) => f.severity === "warning").length,
  };
  return {
    schema: "s2a-library-audit/1",
    source,
    generatedAt: new Date().toISOString(),
    scope,
    coverage,
    counts,
    findings,
    ok: counts.errors === 0,
  };
}
export function libraryGate(
  report: LibraryReport,
  failOn: Severity = "error",
): boolean {
  return (
    report.counts.errors === 0 &&
    (failOn !== "warning" || report.counts.warnings === 0)
  );
}
export function libraryMarkdown(report: LibraryReport): string {
  const escape = (s: unknown) =>
    String(s ?? "")
      .replace(/[|\n\r]/g, " ")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  return [
    `# ${report.source === "figma" ? "C2 Figma library" : "Milo block"} validation`,
    "",
    `**${report.counts.errors} errors · ${report.counts.warnings} warnings**`,
    "",
    `Captured report: ${report.generatedAt}`,
    "",
    "## Scope",
    "",
    ...Object.entries(report.scope).map(
      ([k, v]) =>
        `- **${escape(k)}:** ${escape(typeof v === "object" ? JSON.stringify(v) : v)}`,
    ),
    "",
    "## Coverage",
    "",
    ...report.coverage.map((s) => `- ${escape(s)}`),
    "",
    "## Findings",
    "",
    "| Level | Rule | Location | Finding |",
    "| --- | --- | --- | --- |",
    ...report.findings.map((f) => {
      const label = escape(
        f.nodeName || `${f.file || "library"}${f.line ? `:${f.line}` : ""}`,
      );
      const location = f.url
        ? `[${label.replace(/\[/g, "\\[").replace(/\]/g, "\\]")}](${f.url})`
        : label;
      return `| ${f.severity} | ${f.code} | ${location} | ${escape(f.property ? `${f.property}: ` : "")}${escape(f.message)}${f.value ? ` (${escape(f.value)})` : ""} |`;
    }),
    "",
  ].join("\n");
}
