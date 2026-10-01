// The FORMAT axis — orthogonal to adapters.
//
// An adapter decides the SHAPE (which schema the data conforms to). A format
// decides the SERIALIZATION (how that shape is written down). They never know
// about each other, which is the whole point: a new schema target costs one
// adapter file and inherits every format; a new serialization costs one entry
// here and every adapter gets it free.
//
//   json → canonical. The gate validates this one.
//   yaml → dependency-free emitter; our data is plain objects/arrays/scalars.
//   mjs  → importable ES module, for a tool that wants the spec as a value.
//   ts   → the read-it-in-the-editor rendition: descriptions become doc
//          comments, the object is typed (`as const` + an exported type).
//   md   → a human page. Contract-shaped data renders as a spec; anything else
//          falls back to a fenced JSON block rather than guessing.

// ── yaml ─────────────────────────────────────────────────────────────────────
const yamlScalar = (v) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  const s = String(v);
  const plain = /^[A-Za-z0-9_][A-Za-z0-9_ .\/-]*$/.test(s) && !/^(true|false|null|yes|no)$/i.test(s) && !/^\d/.test(s);
  return plain ? s : JSON.stringify(s);
};

function toYaml(v, indent = 0) {
  const pad = "  ".repeat(indent);
  if (Array.isArray(v)) {
    if (!v.length) return `${pad}[]`;
    return v.map((item) => (item !== null && typeof item === "object"
      ? `${pad}-\n${toYaml(item, indent + 1)}`
      : `${pad}- ${yamlScalar(item)}`)).join("\n");
  }
  if (v !== null && typeof v === "object") {
    const keys = Object.keys(v);
    if (!keys.length) return `${pad}{}`;
    return keys.map((k) => {
      const val = v[k];
      const key = /^[A-Za-z0-9_$-]+$/.test(k) ? k : JSON.stringify(k);
      const nested = val !== null && typeof val === "object";
      const filled = nested && (Array.isArray(val) ? val.length : Object.keys(val).length);
      if (filled) return `${pad}${key}:\n${toYaml(val, indent + 1)}`;
      if (nested) return `${pad}${key}: ${Array.isArray(val) ? "[]" : "{}"}`;
      return `${pad}${key}: ${yamlScalar(val)}`;
    }).join("\n");
  }
  return pad + yamlScalar(v);
}

// ── shared helpers ───────────────────────────────────────────────────────────
const pascal = (s) => String(s).replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^(.)/, (c) => c.toUpperCase());
const isContract = (d) => Boolean(d && typeof d === "object" && d.id && d.name && (d.props || d.anatomy));

const wrapComment = (text, pad, width = 88) => {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    if (line && (line.length + w.length + 1) > width) { lines.push(line); line = w; } else { line = line ? `${line} ${w}` : w; }
  }
  if (line) lines.push(line);
  return lines.map((l) => `${pad}// ${l}`).join("\n");
};

// ── markdown ─────────────────────────────────────────────────────────────────
function contractMd(c) {
  const L = [`# ${c.name} — \`${c.id}\``, ""];
  if (c.description) L.push(c.description, "");
  const meta = [c.version && `version ${c.version}`, c.status, c.archetype && `archetype: ${c.archetype}`].filter(Boolean);
  if (meta.length) L.push(`_${meta.join(" · ")}_`, "");

  if (c.props?.length) {
    L.push("## Props", "", "| prop | type | default | design binding |", "|---|---|---|---|");
    for (const p of c.props) {
      const type = p.type?.enum ? `enum: ${p.type.enum.join(" · ")}` : String(p.type);
      const f = p.bindings?.figma;
      const design = !f || f.kind === "NONE" ? "— (declared: no design counterpart)" : `${f.kind} → ${f.property}`;
      L.push(`| \`${p.name}\` | ${type} | ${p.default ?? ""} | ${design} |`);
    }
    L.push("");
  }
  if (c.states?.length) L.push("## States", "", c.states.map((s) => `\`${s}\``).join(" · "), "");

  const slots = [];
  const tokens = [];
  (function walk(node, path) {
    if (!node || typeof node !== "object") return;
    if (node.slot) slots.push({ path, ...node.slot });
    for (const [prop, ref] of Object.entries(node.tokens ?? {})) tokens.push({ path, prop, ref });
    for (const [name, child] of Object.entries(node.parts ?? {})) walk(child, `${path}.${name}`);
  })(c.anatomy?.root, "root");

  if (slots.length) {
    L.push("## Slots", "", "| path | accepts | mode |", "|---|---|---|");
    for (const s of slots) L.push(`| \`${s.path}\` | ${(s.accepts ?? []).join(", ") || "—"} | ${s.acceptsMode ?? "open"} |`);
    L.push("");
  }
  if (tokens.length) {
    L.push("## Token bindings", "", "| part | property | token |", "|---|---|---|");
    for (const t of tokens) L.push(`| \`${t.path}\` | ${t.prop} | \`${t.ref}\` |`);
    L.push("");
  }
  if (c.a11y) {
    L.push("## Accessibility", "");
    if (c.a11y.role) L.push(`Role: \`${c.a11y.role}\``, "");
    if (c.a11y.wcag?.length) L.push(`WCAG 2.2 AA: ${c.a11y.wcag.map((w) => `\`${w}\``).join(", ")}`, "");
    for (const k of ["keyboard"]) {
      if (!c.a11y[k]?.length) continue;
      L.push("| key | action |", "|---|---|");
      for (const row of c.a11y[k]) L.push(`| \`${row.key}\` | ${row.action} |`);
      L.push("");
    }
  }
  const anchors = c.bindings?.code?.anchors;
  if (anchors) L.push("## Anchors", "", `Code: \`${anchors.importPath}\` → \`${anchors.export}\``, "");
  L.push("<!-- Generated. Edit the defs and rebuild; hand edits fail the freshness check. -->", "");
  return L.join("\n");
}

// ── typescript ───────────────────────────────────────────────────────────────
function contractTs(c) {
  const name = pascal(c.name);
  const L = [
    "// Generated — the read-it-in-the-editor rendition of the contract.",
    "// JSON is the wire format the gate validates; this is the one a human reviews.",
    "// Edit the defs and rebuild.",
    "",
  ];
  if (c.description) L.push(wrapComment(c.description, ""), "");
  L.push(`export const ${name} = {`);
  for (const [k, v] of Object.entries(c)) {
    if (k === "props" && Array.isArray(v)) {
      L.push("  props: [");
      for (const p of v) {
        if (p.description) L.push(wrapComment(p.description, "    "));
        L.push(`    ${JSON.stringify(p)},`);
      }
      L.push("  ],");
      continue;
    }
    L.push(`  ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${JSON.stringify(v, null, 2).split("\n").map((l, i) => (i ? `  ${l}` : l)).join("\n")},`);
  }
  L.push("} as const;", "", `export type ${name}Contract = typeof ${name};`, "");
  return L.join("\n");
}

export const FORMATS = {
  json: { ext: "json", serialize: (d) => `${JSON.stringify(d, null, 2)}\n` },
  yaml: { ext: "yaml", serialize: (d) => `${toYaml(d)}\n` },
  mjs: { ext: "mjs", serialize: (d) => `// Generated. Edit the defs and rebuild.\nexport default ${JSON.stringify(d, null, 2)};\n` },
  ts: { ext: "ts", serialize: (d) => (isContract(d) ? contractTs(d) : `export default ${JSON.stringify(d, null, 2)} as const;\n`) },
  md: { ext: "md", serialize: (d) => (isContract(d) ? contractMd(d) : `\`\`\`json\n${JSON.stringify(d, null, 2)}\n\`\`\`\n`) },
};
