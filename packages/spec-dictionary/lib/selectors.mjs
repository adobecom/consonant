// selectors.mjs — read a stylesheet's selectors as statements about a component.
//
// A contract wants to know three things about every rule: WHAT it styles (the
// root, or a named part), WHEN it applies (which prop values, which
// interaction states), and what it sets. The declarations come straight off
// the structured evidence; this file answers the first two from the selector.
//
// Two grammars arrive here and reduce to the same shape:
//
//   Spectrum, a web component     ours, light DOM
//   :host([size="500"])           .c-button[data-size="m"]
//   .swc-Badge--blue              .c-button[data-style="solid"]
//   :host([outline]) .swc-Avatar-image
//   .swc-Badge-icon               .c-button__label
//   .swc-Button:focus-visible     .c-button:not(:disabled):hover
//
// The one real asymmetry: a Spectrum modifier class carries only a VALUE
// (`--blue`, `--sizeS`), so resolving it to a prop needs the prop list with its
// enums, which the code evidence already has. A value no prop admits is kept as
// a `derived` condition (`--iconOnly`, `--hasIcon`) rather than invented.
//
// Pure functions, no IO. Called at draft time by the scaffolder; the evidence
// stays raw so adding this changes no hash.

const STATE_PSEUDOS = new Set([
  "hover", "active", "focus", "focus-visible", "focus-within", "disabled", "checked",
  "visited", "empty", "placeholder-shown", "indeterminate", "invalid", "required",
]);

const camel = (s) => String(s).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const lower = (s) => String(s).toLowerCase();

/** `.a, .b` is two selectors sharing one block; commas inside (...) are not. */
export function splitSelectorList(selector) {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of String(selector)) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Top-level split on descendant/child/sibling combinators; parens and brackets protect. */
function splitCompounds(selector) {
  const out = [];
  let depth = 0, cur = "";
  const s = String(selector).replace(/\s*([>+~])\s*/g, " $1 ").replace(/\s+/g, " ").trim();
  for (const ch of s) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    if (ch === " " && depth === 0) { if (cur) out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur) out.push(cur);
  return out.filter((c) => !/^[>+~]$/.test(c));
}

/** The pieces of one compound: classes, attributes, pseudos, element, host. */
function parseCompound(compound) {
  const parts = { classes: [], attrs: [], pseudos: [], element: null, host: null, universal: false };
  let i = 0;
  const s = compound;
  const readBalanced = (open, close) => {
    let depth = 0, start = i;
    for (; i < s.length; i++) {
      if (s[i] === open) depth++;
      else if (s[i] === close) { depth--; if (depth === 0) { i++; break; } }
    }
    return s.slice(start, i);
  };
  while (i < s.length) {
    const ch = s[i];
    if (ch === ".") { const m = s.slice(i + 1).match(/^[A-Za-z_-][\w-]*/); parts.classes.push(m[0]); i += 1 + m[0].length; continue; }
    if (ch === "[") { const raw = readBalanced("[", "]"); parts.attrs.push(raw.slice(1, -1)); continue; }
    if (ch === ":") {
      const dbl = s[i + 1] === ":";
      const m = s.slice(i + (dbl ? 2 : 1)).match(/^[A-Za-z-]+/);
      const name = m[0];
      i += (dbl ? 2 : 1) + name.length;
      let arg = null;
      if (s[i] === "(") arg = readBalanced("(", ")").slice(1, -1);
      if (name === "host") { parts.host = { arg }; continue; }
      parts.pseudos.push({ name, arg, element: dbl });
      continue;
    }
    if (ch === "*") { parts.universal = true; i++; continue; }
    const m = s.slice(i).match(/^[A-Za-z][\w-]*/);
    if (m) { parts.element = m[0]; i += m[0].length; continue; }
    i++; // anything else (stray char): skip rather than throw
  }
  return parts;
}

/** `[data-size="m"]` / `[outline]` / `[variant=accent]` → { name, value } */
function parseAttr(raw) {
  const m = raw.match(/^\s*([A-Za-z_][\w-]*)\s*(?:([~|^$*]?=)\s*("([^"]*)"|'([^']*)'|([^\s\]]+)))?\s*$/);
  if (!m) return { name: raw.trim(), value: true, raw };
  const value = m[2] ? (m[4] ?? m[5] ?? m[6]) : true;
  return { name: m[1], value, op: m[2] ?? null };
}

/**
 * A prop condition from an attribute. `data-force-state="disabled"` is prop
 * forceState; `[outline]` is outline=true; on a host, `[size="500"]` is size=500.
 */
function conditionFromAttr(attr) {
  const name = attr.name.replace(/^data-/, "");
  return { prop: camel(name), value: attr.value === true ? true : String(attr.value) };
}

/**
 * Resolve a Spectrum-style modifier value (`blue`, `sizeS`, `outline`, `iconOnly`)
 * to a prop condition using the prop list, or report it as derived.
 */
function resolveModifier(value, props) {
  const v = String(value);
  // A boolean prop named exactly this: --outline, --disabled, --subtle.
  const bool = props.find((p) => p.type === "boolean" && lower(p.name) === lower(v));
  if (bool) return { prop: bool.name, value: true };
  // A value some enum admits: --blue → variant=blue, --accent → variant=accent.
  for (const p of props) {
    const vals = (p.values ?? p.enum ?? []).map(String);
    const hit = vals.find((x) => lower(x) === lower(v));
    if (hit !== undefined) return { prop: p.name, value: hit };
  }
  // A prop name prefixed onto a value: --sizeS → size=s, --fixed-inline-start →
  // fixed=inline-start, --staticWhite → staticColor=white (the generic tail of
  // the prop name — Color, Style, Kind, Type, Variant — is dropped in the class).
  for (const p of props) {
    const vals = (p.values ?? p.enum ?? []).map(String);
    if (!vals.length) continue;
    const stems = [...new Set([lower(p.name), lower(p.name).replace(/(color|style|kind|type|variant|mode)$/, "")])].filter(Boolean);
    for (const n of stems) {
      if (!lower(v).startsWith(n) || v.length <= n.length) continue;
      const rest = v.slice(n.length).replace(/^[-_]/, "");
      const hit = vals.find((x) => lower(x).replace(/[-_]/g, "") === lower(rest).replace(/[-_]/g, ""));
      if (hit !== undefined) return { prop: p.name, value: hit };
    }
  }
  return null;
}

/**
 * Classify one simple selector (no commas) against a component.
 *
 * ctx.root   the root class, with or without its dot ("swc-Badge", ".c-button");
 *            `:host` always counts as the root as well.
 * ctx.parts  part names, optional; inferred from `${root}-x` / `${root}__x` when absent.
 * ctx.props  [{ name, type, values|enum }], from the code evidence.
 *
 * Returns { subject, conditions, states, not, derived, structural, ancestors, raw }.
 * Conditions and states found on ancestor compounds (`:host([outline]) .img`)
 * are hoisted onto the result, because they condition the same rule.
 */
export function classifySelector(selector, ctx = {}) {
  const root = String(ctx.root ?? "").replace(/^\./, "");
  const props = ctx.props ?? [];
  const knownParts = ctx.parts ? new Set(ctx.parts) : null;
  const compounds = splitCompounds(selector);
  const result = { subject: null, conditions: [], states: [], not: [], derived: [], structural: false, ancestors: [], raw: String(selector) };

  const partOf = (cls) => {
    if (!root || cls === root) return null;
    const sep = cls.startsWith(root + "__") ? "__" : cls.startsWith(root + "-") && !cls.startsWith(root + "--") ? "-" : null;
    if (!sep) return null;
    const name = cls.slice(root.length + sep.length);
    if (knownParts && !knownParts.has(name)) return null;
    return name;
  };

  const classifyCompound = (compound) => {
    const c = parseCompound(compound);
    const local = { subject: null, conditions: [], states: [], not: [], derived: [], structural: false };
    if (c.host) {
      local.subject = "root";
      if (c.host.arg) {
        // :host([a][b="x"]), :host(:where(:focus-visible)), :host(:has(.icon)) —
        // the argument is a compound of conditions on the root itself.
        for (const alt of splitSelectorList(c.host.arg)) {
          const inner = classifyCompound(alt);
          local.conditions.push(...inner.conditions); local.states.push(...inner.states);
          local.not.push(...inner.not); local.derived.push(...inner.derived);
          if (inner.structural) local.structural = true;
        }
      }
    }
    if (c.universal) local.subject ??= "*";
    for (const cls of c.classes) {
      if (cls === root) { local.subject ??= "root"; continue; }
      if (root && cls.startsWith(root + "--")) {
        local.subject ??= "root";
        const hit = resolveModifier(cls.slice(root.length + 2), props);
        if (hit) local.conditions.push(hit); else local.derived.push(cls.slice(root.length + 2));
        continue;
      }
      const part = partOf(cls);
      if (part) { local.subject = part; continue; }
      local.derived.push(`.${cls}`);
    }
    for (const a of c.attrs) {
      const at = parseAttr(a);
      // Our stories force a state with an attribute: `[data-force-state="hover"]`
      // is the hover state, not a prop condition.
      if (at.name === "data-force-state" && at.value !== true) { local.states.push(String(at.value)); continue; }
      local.conditions.push(conditionFromAttr(at));
    }
    for (const p of c.pseudos) {
      if (p.element) continue; // ::before etc. — a pseudo-element, not a condition
      if (STATE_PSEUDOS.has(p.name)) { local.states.push(p.name); continue; }
      if (p.name === "not" && p.arg) {
        for (const alt of splitSelectorList(p.arg)) {
          const inner = parseCompound(alt);
          for (const q of inner.pseudos) if (STATE_PSEUDOS.has(q.name)) local.not.push(q.name);
          for (const cls of inner.classes) local.not.push(`.${cls}`);
          for (const a of inner.attrs) {
            const at = parseAttr(a);
            if (at.name === "data-force-state" && at.value !== true) { local.not.push(String(at.value)); continue; }
            local.not.push(`[${at.name}${at.value === true ? "" : `=${at.value}`}]`);
          }
        }
        continue;
      }
      if (p.name === "where" || p.name === "is") {
        // :where() is specificity-only; :is(*, …) matches everything and is a
        // no-op; otherwise fold the alternatives' states in, approximately.
        if (p.arg && !/^\s*\*/.test(p.arg) && !/,\s*\*/.test(p.arg)) {
          for (const alt of splitSelectorList(p.arg)) {
            const sub = classifyCompound(alt);
            local.states.push(...sub.states); local.conditions.push(...sub.conditions); local.not.push(...sub.not);
            if (sub.structural) local.structural = true;
          }
        }
        continue;
      }
      if (p.name === "has") { local.structural = true; continue; }
      local.derived.push(`:${p.name}`);
    }
    if (c.element && !local.subject) local.subject = c.element;
    return local;
  };

  const last = compounds.length ? compounds[compounds.length - 1] : "";
  for (const comp of compounds.slice(0, -1)) {
    const anc = classifyCompound(comp);
    result.ancestors.push({ compound: comp, ...anc });
    result.conditions.push(...anc.conditions);
    result.states.push(...anc.states);
    result.not.push(...anc.not);
    result.derived.push(...anc.derived);
    if (anc.structural) result.structural = true;
  }
  const subj = classifyCompound(last);
  result.subject = subj.subject ?? (compounds.length === 1 && !root ? "root" : null);
  result.conditions.push(...subj.conditions);
  result.states.push(...subj.states);
  result.not.push(...subj.not);
  result.derived.push(...subj.derived);
  if (subj.structural) result.structural = true;
  return result;
}

/** A stable key for "the same WHEN", so rules can be grouped. */
export function conditionKey(entry) {
  const conds = [...entry.conditions].map((c) => `${c.prop}=${c.value}`).sort().join("&");
  const states = [...entry.states].sort().join("&");
  const nots = [...entry.not].sort().join("&");
  return [conds, states && `:${states}`, nots && `!${nots}`].filter(Boolean).join(" ");
}

/**
 * Classify every rule of a structured stylesheet (code evidence's
 * `stylesheet.rules`), one entry per simple selector, declarations attached.
 */
export function classifyRules(rules, ctx = {}) {
  const out = [];
  for (const rule of rules ?? []) {
    for (const sel of splitSelectorList(rule.selector)) {
      const c = classifySelector(sel, ctx);
      out.push({ ...c, declarations: rule.declarations ?? [], ...(rule.context ? { context: rule.context } : {}) });
    }
  }
  return out;
}

/** Part names a stylesheet implies for a root, by either naming convention. */
export function inferParts(rules, root) {
  const r = String(root ?? "").replace(/^\./, "");
  const found = new Set();
  for (const rule of rules ?? []) for (const m of String(rule.selector).matchAll(/\.([A-Za-z_][\w-]*)/g)) {
    const cls = m[1];
    if (cls.startsWith(r + "__")) found.add(cls.slice(r.length + 2));
    else if (cls.startsWith(r + "-") && !cls.startsWith(r + "--")) found.add(cls.slice(r.length + 1));
  }
  return [...found];
}
