import postcss, { type AtRule } from "postcss";

export interface MediaQueryPolicy {
  id: string;
  breakpoints: Record<string, number>;
  portraitReflow: [number, number];
}

/** William Blanton's block-CSS rules, supplied in the audit brief. */
export const WILL_BLOCK_MEDIA_POLICY: MediaQueryPolicy = {
  id: "will-block-css-v1",
  breakpoints: { MD: 768, LG: 1280, XL: 1441 },
  portraitReflow: [840, 960],
};

export interface MediaQueryException {
  /** Exact path relative to the scan root. No glob or file-wide suppression. */
  file: string;
  query: string;
  kind: "reflow";
  reason: string;
}
export interface WidthComparison {
  operator: "<" | "<=" | ">" | ">=" | "=";
  value: number;
  unit: string;
}
export interface MediaQueryViolation {
  code: string;
  message: string;
  file: string;
  line: number;
  column: number;
  query: string;
}
export interface MediaQueryRecord {
  query: string;
  normalized: string;
  line: number;
  column: number;
  classification: "standard" | "reflow" | "environment" | "violation";
  widths: WidthComparison[];
  properties: string[];
  selectors: string[];
  reason?: string;
  violations: MediaQueryViolation[];
}
export interface MediaQueryResult {
  ok: boolean;
  file: string;
  queries: MediaQueryRecord[];
  violations: MediaQueryViolation[];
}
export interface ValidateMediaQueryOptions {
  file?: string;
  policy?: MediaQueryPolicy;
  exceptions?: MediaQueryException[];
}

export const normalizeMediaQuery = (query: string): string =>
  query
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*([():,])\s*/g, "$1")
    .replace(/\s*(<=|>=|<|>|=)\s*/g, "$1");

/** Commas inside functions/strings are not separate media queries. */
export function splitMediaQueries(params: string): string[] {
  const parts: string[] = [];
  let start = 0,
    depth = 0,
    quote = "";
  for (let i = 0; i < params.length; i++) {
    const c = params[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === "(") depth++;
    if (c === ")") depth--;
    if (c === "," && depth === 0) {
      parts.push(params.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(params.slice(start).trim());
  return parts;
}

const invert = {
  "<": ">",
  "<=": ">=",
  ">": "<",
  ">=": "<=",
  "=": "=",
} as const;
const number = "(\\d*\\.?\\d+)";
const dimension = `${number}([a-z%]*)`;
const comparator = "(<=|>=|<|>|=)";

/** Parse width expressions without rounding 767.99 or treating >767 as >=768. */
export function parseWidthComparisons(query: string): {
  widths: WidthComparison[];
  unsupported: boolean;
} {
  const widths: WidthComparison[] = [];
  let unsupported = false;
  let remainder = query;
  for (const match of query.matchAll(/\(([^()]*)\)/g)) {
    const feature = match[1].trim().toLowerCase();
    if (!/\b(?:device-)?width\b/.test(feature)) continue;
    remainder = remainder.replace(match[0], "");
    let parsed: RegExpMatchArray | null;
    const add = (op: string, value: string, unit: string) =>
      widths.push({
        operator: op as WidthComparison["operator"],
        value: Number(value),
        unit,
      });
    if (
      (parsed = feature.match(
        new RegExp(`^(min|max)-width\\s*:\\s*${dimension}$`),
      ))
    ) {
      add(parsed[1] === "min" ? ">=" : "<=", parsed[2], parsed[3]);
    } else if (
      (parsed = feature.match(new RegExp(`^width\\s*:\\s*${dimension}$`)))
    ) {
      add("=", parsed[1], parsed[2]);
    } else if (
      (parsed = feature.match(
        new RegExp(`^width\\s*${comparator}\\s*${dimension}$`),
      ))
    ) {
      add(parsed[1], parsed[2], parsed[3]);
    } else if (
      (parsed = feature.match(
        new RegExp(
          `^${dimension}\\s*${comparator}\\s*width(?:\\s*${comparator}\\s*${dimension})?$`,
        ),
      ))
    ) {
      if (parsed[4] && (parsed[3][0] !== parsed[4][0] || parsed[3] === "="))
        unsupported = true;
      add(invert[parsed[3] as keyof typeof invert], parsed[1], parsed[2]);
      if (parsed[4]) add(parsed[4], parsed[5], parsed[6]);
    } else unsupported = true;
  }
  // A width hidden in calc(), a boolean width, or a malformed expression must
  // be reviewed; a parser's inability to understand it is never a clean result.
  if (/\b(?:device-)?width\b/i.test(remainder)) unsupported = true;
  // A custom-media reference may conceal a width threshold; do not classify it
  // as an environment preference without resolving its definition.
  if (/\(\s*--[\w-]+\s*\)/.test(query)) unsupported = true;
  if (/\b(?:not|or)\b/i.test(query) && /\bwidth\b/i.test(query))
    unsupported = true;
  const lowers = widths.filter((w) => w.operator.startsWith(">"));
  const uppers = widths.filter((w) => w.operator.startsWith("<"));
  if (
    lowers.some((low) =>
      uppers.some(
        (high) =>
          low.unit === high.unit &&
          (low.value > high.value ||
            (low.value === high.value &&
              (low.operator === ">" || high.operator === "<"))),
      ),
    )
  )
    unsupported = true;
  return { widths, unsupported };
}

const reflowProperty =
  /^(?:display|grid(?:-.*)?|flex(?:-.*)?|order|(?:min-|max-)?(?:width|height|inline-size|block-size)|(?:row-|column-)?gap|columns|column-count|(?:align|justify)-(?:items|content|self)|overflow(?:-[xy])?|position|float)$/;
const validReason = (reason?: string): boolean =>
  Boolean(
    reason &&
    reason.trim().length >= 16 &&
    !/^(?:todo|tbd|fixme|reflow|exception)\s*[.!]?$/i.test(reason.trim()),
  );
function inlineReason(rule: AtRule): string | undefined {
  const candidates = [rule.prev(), rule.nodes?.[0]].filter(
    (node) => node?.type === "comment",
  );
  return candidates
    .map((node) =>
      node && "text" in node
        ? node.text.match(/^s2a-reflow:\s*([\s\S]+)$/i)?.[1]?.trim()
        : undefined,
    )
    .find(Boolean);
}

export function validateMediaQueries(
  css: string,
  options: ValidateMediaQueryOptions = {},
): MediaQueryResult {
  const file = options.file || "<css>";
  const policy = options.policy || WILL_BLOCK_MEDIA_POLICY;
  const thresholds = Object.values(policy.breakpoints);
  if (
    !policy.id ||
    !thresholds.length ||
    thresholds.some((n) => !Number.isFinite(n) || n <= 0) ||
    policy.portraitReflow.length !== 2 ||
    policy.portraitReflow.some((n) => !Number.isFinite(n) || n <= 0) ||
    policy.portraitReflow[0] > policy.portraitReflow[1]
  )
    throw new Error("Invalid media-query policy.");
  const result: MediaQueryResult = {
    ok: true,
    file,
    queries: [],
    violations: [],
  };
  let ast;
  try {
    ast = postcss.parse(css, { from: file });
  } catch (error) {
    const failure = error as {
      reason?: string;
      line?: number;
      column?: number;
    };
    result.violations.push({
      code: "CSS_PARSE_ERROR",
      message: failure.reason || String(error),
      file,
      line: failure.line || 1,
      column: failure.column || 1,
      query: "",
    });
    result.ok = false;
    return result;
  }
  ast.walkAtRules(/^media$/i, (rule) => {
    const properties = new Set<string>(),
      selectors = new Set<string>();
    rule.walkDecls((declaration) => {
      properties.add(declaration.prop.toLowerCase());
    });
    rule.walkRules((child) => {
      selectors.add(child.selector);
    });
    for (const query of splitMediaQueries(
      rule.params.replace(/\/\*[\s\S]*?\*\//g, " "),
    )) {
      const parsed = parseWidthComparisons(query);
      const record: MediaQueryRecord = {
        query,
        normalized: normalizeMediaQuery(query),
        line: rule.source?.start?.line || 1,
        column: rule.source?.start?.column || 1,
        classification: "standard",
        widths: parsed.widths,
        properties: [...properties].sort(),
        selectors: [...selectors].sort(),
        violations: [],
      };
      const fail = (code: string, message: string) => {
        record.classification = "violation";
        record.violations.push({
          code,
          message,
          file,
          line: record.line,
          column: record.column,
          query,
        });
      };
      const configured = options.exceptions?.find(
        (entry) =>
          entry.file === file &&
          normalizeMediaQuery(entry.query) === record.normalized,
      );
      const reason = configured?.reason || inlineReason(rule);
      const hasLayoutChange = [...properties].some((p) =>
        reflowProperty.test(p),
      );
      const portrait = (n: number) =>
        n >= policy.portraitReflow[0] && n <= policy.portraitReflow[1];
      const inlineRange = parsed.widths.every(
        (w) =>
          w.unit === "px" &&
          (thresholds.includes(w.value) || portrait(w.value)),
      );
      const standard =
        parsed.widths.length === 1 &&
        parsed.widths[0].operator === ">=" &&
        parsed.widths[0].unit === "px" &&
        thresholds.includes(parsed.widths[0].value);

      if (!query || parsed.unsupported) {
        fail(
          "MQ_UNSUPPORTED_CONDITION",
          "Review this width condition; it cannot be safely compared to the policy.",
        );
      } else if (!parsed.widths.length || /^(?:only\s+)?print\b/i.test(query)) {
        record.classification = "environment";
        record.reason =
          "Preference, capability, orientation, height, or print condition; not a screen-width breakpoint.";
      } else if (parsed.widths.some((w) => w.unit !== "px")) {
        fail(
          "MQ_UNSUPPORTED_UNIT",
          "Use pixel boundaries for this policy; relative units are not assumed equivalent to a fixed viewport width.",
        );
      } else if (standard) {
        record.reason = `${Object.entries(policy.breakpoints).find(([, n]) => n === parsed.widths[0].value)?.[0]} standard breakpoint.`;
      } else if (
        validReason(reason) &&
        hasLayoutChange &&
        (configured?.kind === "reflow" || inlineRange)
      ) {
        record.classification = "reflow";
        record.reason = reason;
      } else {
        const upper = parsed.widths.some(
          (w) => w.operator === "<" || w.operator === "<=",
        );
        if (upper)
          fail(
            "MQ_MOBILE_FIRST",
            "Use the unqueried mobile base and progressive min-width rules. A bounded reflow needs a documented exception.",
          );
        for (const w of parsed.widths) {
          if (!thresholds.includes(w.value)) {
            const nearby = Object.entries(policy.breakpoints).find(
              ([, n]) => Math.abs(n - w.value) <= 1,
            );
            fail(
              "MQ_NONSTANDARD_BREAKPOINT",
              `${w.value}px is outside the standard breakpoints.${nearby ? ` ${nearby[0]} starts at ${nearby[1]}px; inclusive and exclusive bounds must not be rounded.` : ""}`,
            );
          } else if (![">=", "<"].includes(w.operator)) {
            fail(
              "MQ_BOUNDARY_OPERATOR",
              `The ${w.operator} boundary changes fractional-width behavior. Use the exact policy boundary or document a reflow exception.`,
            );
          }
        }
        if (reason && !validReason(reason))
          fail(
            "MQ_EXCEPTION_REASON",
            "A reflow exception needs a specific explanation of the layout constraint.",
          );
        else if (reason && !hasLayoutChange)
          fail(
            "MQ_EXCEPTION_NOT_REFLOW",
            "The exception changes no layout properties; colors or typography alone do not qualify as a reflow fix.",
          );
        else if (validReason(reason) && !inlineRange && !configured)
          fail(
            "MQ_EXCEPTION_REVIEW",
            `A bespoke boundary outside ${policy.portraitReflow.join("–")}px needs an exact file/query reflow exception in configuration.`,
          );
        if (!record.violations.length)
          fail(
            "MQ_REFLOW_REASON_REQUIRED",
            "Document why this bounded layout needs a reflow exception.",
          );
      }
      result.queries.push(record);
      result.violations.push(...record.violations);
    }
  });
  result.ok = result.violations.length === 0;
  return result;
}
