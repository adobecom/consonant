// contract-proposal.cjs — the draft proposal for a set that has no contract
// yet: suggested props derived from the axes, then exactly the questions
// extraction cannot answer. Rendered into the sync PR body (and the local
// server response) so the PR becomes the curation request.
"use strict";

function kebab(s) { return String(s || "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase(); }
function camel(s) { const k = kebab(s).split("-"); return k[0] + k.slice(1).map((p) => p[0].toUpperCase() + p.slice(1)).join(""); }

function proposalFor(evidence, slug, match = null) {
  const axes = evidence.axes ?? [];
  const props = [];
  for (const a of axes) {
    if (a.type === "VARIANT") props.push({ name: camel(a.name), lever: true, type: "string", enum: a.options ?? [], default: a.defaultValue, figma: { kind: "VARIANT", property: a.name }, code: { prop: camel(a.name), attr: `data-${kebab(a.name)}` }, question: /state|hover|press|focus|disabled|breakpoint|context/i.test(a.name) ? "Is this axis a runtime state rather than an authored prop? If so it belongs under states." : undefined });
    else if (a.type === "BOOLEAN") props.push({ name: camel(a.name), lever: true, type: "boolean", default: a.defaultValue, figma: { kind: "BOOLEAN", property: a.name }, code: { prop: camel(a.name) } });
    else if (a.type === "TEXT") props.push({ name: camel(a.name), lever: true, type: "string", figma: { kind: "TEXT", property: a.name }, code: { prop: camel(a.name) } });
    else if (a.type === "INSTANCE_SWAP") props.push({ name: camel(a.name), lever: true, type: "slot", figma: { kind: "INSTANCE_SWAP", property: a.name }, code: { prop: camel(a.name) }, question: `Which components may fill "${a.name}"? Preferred values in Figma: ${(a.preferredValues ?? []).map((p) => p.key).join(", ") || "none declared"}.` });
  }
  const nested = [...new Set((evidence.instances ?? []).map((i) => i.set?.name).filter(Boolean))];
  const collections = [...new Set(Object.values(evidence.variables ?? {}).map((v) => v.collection))];
  const unbound = evidence.counts?.unboundPaintNodes ?? 0;
  const L = [];
  L.push(`## Draft proposal: \`${slug}\``, "", `Extracted from **${evidence.set?.name}** (${evidence.set?.type} \`${evidence.set?.id}\`${evidence.set?.meta?.version ? `, s2a:meta v${evidence.set.meta.version}` : ", no s2a:meta version"}) with ${evidence.counts?.variants ?? 0} variants, ${evidence.counts?.bindings ?? 0} token bindings across ${collections.join(", ") || "no collections"}.`, "");
  if (match) {
    L.push("### Does it already exist?", "", match.summary, "");
    if (match.unit?.length) { L.push("| Contract | Score | Has | Would need | Verified in Figma |", "| --- | --- | --- | --- | --- |"); for (const u of match.unit.slice(0, 3)) L.push(`| ${u.name} | ${u.score} | ${u.has.join(", ") || "—"} | ${u.missing.join(", ") || "—"} | ${u.verified ? "yes" : "no"} |`); L.push(""); }
  }
  const pat = evidence.pattern;
  if (pat) {
    L.push("### Decomposition (from the frame)", "");
    const rep = pat.repeats?.[0];
    if (rep) {
      L.push(`- **Organism**: \`${evidence.set?.name}\` repeats one unit ${rep.count}× (shared layers: ${rep.sharedLayers.map((x) => `\`${x}\``).join(", ") || "none named"}).${match?.organism?.length ? ` Collection contracts to consider: ${match.organism.map((o) => `${o.name} (${o.score})`).join(", ")}.` : " No collection contract accepts this unit yet."}`);
      L.push(`- **Molecule**: the repeated unit \`${rep.unit?.name}\` (${rep.members[0]?.width}×${rep.members[0]?.height}); roles ${pat.roles.map((r) => `\`${r}\``).join(", ")}.`);
    } else {
      L.push(`- **Molecule**: \`${evidence.set?.name}\` (no repeated unit inside); roles ${pat.roles.map((r) => `\`${r}\``).join(", ")}.`);
    }
    L.push(`- **Atoms**: ${pat.instancedSets.length ? `already S2A instances: ${pat.instancedSets.map((x) => `\`${x}\``).join(", ")}.` : "no S2A instances inside; every part is raw layers."} ${pat.genericLayers} of ${pat.genericLayers + pat.namedLayers} layers carry Figma-generated names.`);
    L.push("");
  }
  L.push("### Suggested props (from the axes)", "");
  if (!props.length && pat) {
    // A raw frame has no properties yet: derive levers from the roles.
    const roleProps = { heading: ["headline", "string"], body: ["body", "string"], cta: ["ctaLabel", "string"], media: ["mediaSrc", "slot"], icon: ["icon", "slot"], eyebrow: ["eyebrow", "string"] };
    for (const r of pat.roles) if (roleProps[r]) props.push({ name: roleProps[r][0], lever: true, type: roleProps[r][1], figma: { kind: r === "media" || r === "icon" ? "INSTANCE_SWAP" : "TEXT", property: roleProps[r][0] }, code: { prop: roleProps[r][0] }, question: `Derived from the \`${r}\` role, not from a component property: confirm the name and whether it is a lever.` });
    if (pat.roles.includes("cta")) props.push({ name: "href", lever: true, type: "string", figma: "NONE", code: { prop: "href" } });
  }
  if (!props.length) L.push("_No component properties are defined on the set; every prop will need curating by hand._", "");
  else { L.push("| Prop | Type | Options / default | Figma | Code |", "| --- | --- | --- | --- | --- |"); for (const p of props) L.push(`| \`${p.name}\` | ${p.type} | ${p.enum ? p.enum.map((e) => `\`${e}\``).join(", ") : ""}${p.default !== undefined && p.default !== null ? ` (default \`${p.default}\`)` : ""} | ${p.figma === "NONE" ? "NONE" : `${p.figma.kind} \`${p.figma.property}\``} | \`${p.code.attr ?? p.code.prop}\` |`); L.push(""); }
  L.push("### Suggested anatomy (from the default variant)", "");
  const tree = evidence.anatomy?.tree;
  const walk = (n, d) => { L.push(`${"  ".repeat(d)}- \`${n.name}\` (${n.type}${n.layoutMode ? `, ${n.layoutMode.toLowerCase()}` : ""})`); for (const c of (n.children ?? []).slice(0, 12)) walk(c, d + 1); };
  if (tree) walk(tree, 0); else L.push("_No anatomy captured._");
  L.push("");
  L.push("### Questions extraction cannot answer", "");
  const q = [];
  for (const p of props) if (p.question) q.push(`**${p.name}**: ${p.question}`);
  q.push("Which of the suggested props are design levers an author sets, and which are integration details (`lever: false`)?");
  if (nested.length) q.push(`Nested sets ${nested.map((n) => `\`${n}\``).join(", ")}: which anatomy parts are slots, what do they accept, and how strictly (\`restrict\` / \`prefer\` / \`open\`)?`);
  if (unbound) q.push(`${unbound} painted layer${unbound > 1 ? "s carry" : " carries"} no variable. Bind them in Figma, or record a \`raw:\` exception with the reason.`);
  q.push("Which S2A component (existing or new) implements this set, and what is its import path and root class?");
  q.push("Accessibility: role, required ARIA, keyboard map, WCAG 2.2 AA criteria.");
  for (const item of q) L.push(`- [ ] ${item}`);
  L.push("", "Answer these in `packages/components/src/<slug>/<slug>.defs.json` (schema `s2a-defs/1`), then `npm run specs:build` and `npm run gate`.");
  return { markdown: L.join("\n"), props, questions: q };
}

module.exports = { proposalFor, kebab, camel };
