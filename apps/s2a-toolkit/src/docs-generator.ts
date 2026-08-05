// Bento component-docs generator — deterministic, a pure function of the component.
// Ported verbatim from the figma-console bridge prototype (ControlButton — v2).
//
// Tiles: Hero, Versioning, All-variants (the REAL set embedded), Anatomy,
// Properties, Slots, Good to know, Accessibility, and a Dark-mode INSTANCE
// preview in the same matrix. Authored copy (short description, ## Good to know,
// ## Accessibility) lives in the component DESCRIPTION and is parsed out here;
// everything else is introspected. Shares readMeta with the eval harness + the
// versioning tool, so the metadata block reads identically everywhere.
import { readMeta } from "../../../evals/lib/version-meta.mjs";

const TOK = {
  bgDefault: "VariableID:6:49",
  bgSubtle: "VariableID:6:47",
  border: "VariableID:6:22",
  title: "VariableID:2483:41398",
  subhead: "VariableID:2483:41397",
  default: "VariableID:6:82",
  bodySub: "VariableID:2483:41396",
  label: "VariableID:2483:41392",
  caption: "VariableID:2483:41395",
};
const STYLE = {
  title: "S:5cf014300bccf1230a6e660f60bd4f4252a72816,",
  eyebrow: "S:152b1b57fb441ccfd288060043e1cd0a4365737f,",
  body: "S:565931e51de6b933b7b1e79eec5803a05e080e86,",
  label: "S:536bbf234b1a0a717cffe0e3c578fb0052669086,",
  caption: "S:e572ca6995cb534da839d4c8bef75ec523efeb6f,",
};

function parseSections(prose: string): { sections: Record<string, string[]>; shortDesc: string } {
  const sections: Record<string, string[]> = {};
  let cur = "_intro";
  sections[cur] = [];
  for (const l of (prose || "").split("\n")) {
    const h = l.match(/^##\s+(.+)$/);
    if (h) { cur = h[1].trim().toLowerCase(); sections[cur] = []; }
    else sections[cur].push(l);
  }
  const shortDesc = (sections._intro.join("\n").trim().split(/\n\s*\n/)[0] || "").trim();
  return { sections, shortDesc };
}

export async function generateDocs(set: ComponentSetNode): Promise<{ bentoId: string; tiles: number }> {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Adobe Clean Display", style: "Black" });
  await figma.loadFontAsync({ family: "Adobe Clean", style: "Regular" });
  await figma.loadFontAsync({ family: "Adobe Clean", style: "Bold" });
  await figma.loadAllPagesAsync();

  let p: BaseNode | null = set;
  while (p && p.type !== "PAGE") p = p.parent;
  const pageNode = p as PageNode;
  await figma.setCurrentPageAsync(pageNode);

  const [vBgDefault, vBgSubtle, vBorder, vTitle, , vDefault, vBodySub, , vCaption] = await Promise.all([
    figma.variables.getVariableByIdAsync(TOK.bgDefault),
    figma.variables.getVariableByIdAsync(TOK.bgSubtle),
    figma.variables.getVariableByIdAsync(TOK.border),
    figma.variables.getVariableByIdAsync(TOK.title),
    figma.variables.getVariableByIdAsync(TOK.subhead),
    figma.variables.getVariableByIdAsync(TOK.default),
    figma.variables.getVariableByIdAsync(TOK.bodySub),
    figma.variables.getVariableByIdAsync(TOK.label),
    figma.variables.getVariableByIdAsync(TOK.caption),
  ]);

  // Theme dark mode + a dark surface token for backdrops
  const colls = await figma.variables.getLocalVariableCollectionsAsync();
  const themeColl =
    colls.find((c) => /Semantic \/ Color \/ Theme/i.test(c.name)) ||
    colls.find((c) => /Theme/i.test(c.name) && c.modes.some((m) => /dark/i.test(m.name)));
  const darkMode = themeColl ? themeColl.modes.find((m) => /dark/i.test(m.name)) || null : null;
  const allVars = await figma.variables.getLocalVariablesAsync();
  const darkSurf =
    allVars.find((v) => /surface\/inverse-subtle/i.test(v.name)) ||
    allVars.find((v) => /inverse.*subtle/i.test(v.name)) ||
    allVars.find((v) => /background\/inverse/i.test(v.name)) ||
    allVars.find((v) => /surface\/inverse/i.test(v.name));

  const P: SolidPaint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
  const sf = (node: any, v: Variable | null | undefined) => {
    if (!v) return;
    node.fills = [figma.variables.setBoundVariableForPaint(P, "color", v)];
  };
  const txt = async (chars: string, styleId: string, cv: Variable | null) => {
    const t = figma.createText();
    t.characters = String(chars);
    await t.setTextStyleIdAsync(styleId);
    t.textAutoResize = "HEIGHT";
    sf(t, cv);
    return t;
  };

  const parsed = readMeta(set.description || "") as { prose: string; meta: any };
  const meta = parsed.meta;
  const { sections, shortDesc } = parseSections(parsed.prose || "");

  // ── layout helpers ──
  const frame = (name: string, dir: "VERTICAL" | "HORIZONTAL") => {
    const f = figma.createFrame();
    f.name = name; f.layoutMode = dir; f.itemSpacing = 20; f.fills = []; f.clipsContent = false;
    return f;
  };
  const tile = (name: string) => {
    const t = figma.createFrame();
    t.name = name; t.layoutMode = "VERTICAL"; t.itemSpacing = 10;
    t.paddingTop = t.paddingBottom = 24; t.paddingLeft = t.paddingRight = 24; t.cornerRadius = 16;
    t.counterAxisSizingMode = "FIXED"; t.primaryAxisSizingMode = "AUTO";
    t.strokes = [figma.variables.setBoundVariableForPaint(P, "color", vBorder!)]; t.strokeWeight = 1;
    sf(t, vBgDefault);
    return t;
  };
  const addTitle = async (t: FrameNode, label: string) => {
    const e = await txt(label.toUpperCase(), STYLE.caption, vCaption);
    t.appendChild(e); e.layoutSizingHorizontal = "FILL";
  };
  const row = () => {
    const r = frame("row", "HORIZONTAL");
    r.primaryAxisSizingMode = "FIXED"; r.counterAxisSizingMode = "AUTO";
    return r;
  };
  const place = (parent: FrameNode, child: FrameNode, fill: "fill" | "fixed") => {
    parent.appendChild(child);
    child.layoutSizingHorizontal = fill === "fixed" ? "FIXED" : "FILL";
    child.layoutAlign = "STRETCH";
  };

  // ── variant matrix params (rows = Size, cols = State when both present) ──
  const defs = set.componentPropertyDefinitions || {};
  const axes = Object.entries(defs)
    .filter(([, d]) => d.type === "VARIANT" && (d.variantOptions || []).length > 1)
    .map(([k, d]) => ({ name: k.split("#")[0], options: d.variantOptions || [] }));
  const colsAxis = axes.find((a) => /state/i.test(a.name)) || axes[0] || null;
  const rowsAxis = axes.find((a) => /size/i.test(a.name)) || (axes[1] && axes[1].name !== (colsAxis && colsAxis.name) ? axes[1] : null);
  const useMatrix = !!(rowsAxis && colsAxis && rowsAxis.name !== colsAxis.name);

  const variants = set.children as ComponentNode[];
  let maxW = 0, maxH = 0;
  for (const v of variants) { maxW = Math.max(maxW, v.width); maxH = Math.max(maxH, v.height); }
  const stepX = maxW + 56, stepY = maxH + 56;
  const posOf = (v: ComponentNode): { x: number; y: number } | null => {
    if (!useMatrix) return null;
    const vp = (v.variantProperties || {}) as Record<string, string>;
    const col = colsAxis!.options.indexOf(vp[colsAxis!.name]);
    const rowI = rowsAxis!.options.indexOf(vp[rowsAxis!.name]);
    if (col < 0 || rowI < 0) return null;
    return { x: col * stepX, y: rowI * stepY };
  };
  const matrixW = useMatrix ? (colsAxis!.options.length - 1) * stepX + maxW : 0;
  const matrixH = useMatrix ? (rowsAxis!.options.length - 1) * stepY + maxH : 0;

  // ── build the bento ──
  const bento = frame(`${set.name} · Docs`, "VERTICAL");
  bento.paddingTop = bento.paddingBottom = bento.paddingLeft = bento.paddingRight = 32;
  bento.itemSpacing = 20; bento.counterAxisSizingMode = "FIXED"; bento.primaryAxisSizingMode = "AUTO";
  sf(bento, vBgSubtle); bento.cornerRadius = 24;
  pageNode.appendChild(bento);
  bento.resize(1680, 1200); bento.primaryAxisSizingMode = "AUTO";
  const bb = set.absoluteBoundingBox;
  bento.x = (bb ? bb.x : set.x) + set.width + 240;
  bento.y = bb ? bb.y : set.y;

  let tiles = 0;
  const defV = variants.find((c) => /State=default/i.test(c.name)) || variants[0];

  // Row 1: Hero + Versioning
  const r1 = row(); bento.appendChild(r1); r1.layoutSizingHorizontal = "FILL";
  const hero = tile("Hero"); tiles++;
  const eyebrow = await txt("COMPONENT", STYLE.caption, vCaption); hero.appendChild(eyebrow); eyebrow.layoutSizingHorizontal = "FILL";
  const heroName = await txt(set.name, STYLE.title, vTitle); hero.appendChild(heroName); heroName.layoutSizingHorizontal = "FILL";
  const heroDesc = await txt(shortDesc || "—", STYLE.body, vBodySub); hero.appendChild(heroDesc); heroDesc.layoutSizingHorizontal = "FILL";
  if (defV) {
    const chip = figma.createFrame();
    chip.layoutMode = "HORIZONTAL"; chip.primaryAxisAlignItems = "CENTER"; chip.counterAxisAlignItems = "CENTER";
    chip.paddingTop = chip.paddingBottom = 20; chip.paddingLeft = chip.paddingRight = 20; chip.cornerRadius = 12; chip.itemSpacing = 20;
    if (darkSurf) sf(chip, darkSurf); else chip.fills = [{ type: "SOLID", color: { r: 0.09, g: 0.09, b: 0.09 } }];
    chip.appendChild(defV.createInstance());
    hero.appendChild(chip); chip.layoutSizingHorizontal = "HUG";
  }
  place(r1, hero, "fill");

  const ver = tile("Versioning"); ver.resize(460, 10); await addTitle(ver, "Versioning"); tiles++;
  const verV = await txt("v" + (meta?.version || "?") + "  ·  " + (meta?.status || "?"), STYLE.body, vTitle);
  ver.appendChild(verV); verV.layoutSizingHorizontal = "FILL";
  if (meta?.updated) { const u = await txt("updated " + meta.updated, STYLE.caption, vCaption); ver.appendChild(u); u.layoutSizingHorizontal = "FILL"; }
  for (const cl of (meta?.changelog || []).slice(0, 4)) {
    const c = await txt(`• ${cl.version}  ${cl.date}  ${cl.level}  ${cl.summary}`, STYLE.caption, vBodySub);
    ver.appendChild(c); c.layoutSizingHorizontal = "FILL";
  }
  r1.appendChild(ver); ver.layoutSizingHorizontal = "FIXED"; ver.layoutAlign = "STRETCH";

  // Row 2: All variants — embed the REAL set, arranged as the matrix
  const r2 = row(); bento.appendChild(r2); r2.layoutSizingHorizontal = "FILL";
  const comp = tile("All variants"); await addTitle(comp, "The component — all variants"); tiles++;
  place(r2, comp, "fill");
  if (set.layoutMode && set.layoutMode !== "NONE") (set as any).layoutMode = "NONE";
  comp.appendChild(set);
  if (useMatrix) {
    for (const v of variants) { const pos = posOf(v); if (pos) { v.x = pos.x; v.y = pos.y; } }
    set.resize(matrixW, matrixH);
  }

  // Row 3: Anatomy + Properties
  const r3 = row(); bento.appendChild(r3); r3.layoutSizingHorizontal = "FILL";
  const anat = tile("Anatomy"); await addTitle(anat, "Anatomy"); tiles++;
  const named = defV ? defV.findAll((n) => /^\./.test(n.name)).map((n) => n.name) : [];
  let ai = 1;
  for (const nm of named.slice(0, 8)) { const l = await txt(ai++ + "  " + nm, STYLE.caption, vDefault); anat.appendChild(l); l.layoutSizingHorizontal = "FILL"; }
  if (!named.length) { const l = await txt("No dot-named layers found", STYLE.caption, vBodySub); anat.appendChild(l); l.layoutSizingHorizontal = "FILL"; }
  place(r3, anat, "fill");
  const props = tile("Properties"); await addTitle(props, "Properties & variant axes"); tiles++;
  for (const [k, d] of Object.entries(defs)) {
    const nm = k.split("#")[0];
    const val = d.type === "VARIANT" ? (d.variantOptions || []).join(", ") : d.type.toLowerCase();
    const l = await txt(nm + " — " + val, STYLE.caption, vDefault); props.appendChild(l); l.layoutSizingHorizontal = "FILL";
  }
  place(r3, props, "fill");

  // Row 4: Slots
  const r4 = row(); bento.appendChild(r4); r4.layoutSizingHorizontal = "FILL";
  const slots = tile("Slots"); await addTitle(slots, "Slots"); tiles++;
  // Figma reports native Slot props as type "SLOT" and swappable children as
  // "INSTANCE_SWAP" — both are content slots for docs purposes. Filtering on
  // INSTANCE_SWAP alone made slot-based cards (MerchCard, ElasticCard) show an
  // empty tile. Label the kind so the distinction stays visible.
  const slotProps = Object.entries(defs)
    .filter(([, d]) => d.type === "SLOT" || d.type === "INSTANCE_SWAP")
    .map(([k, d]) => k.split("#")[0] + (d.type === "SLOT" ? "  (slot)" : "  (swap)"));
  const slotBody = await txt(slotProps.length ? slotProps.join("\n") : "No slots / swappable children", STYLE.caption, vDefault);
  slots.appendChild(slotBody); slotBody.layoutSizingHorizontal = "FILL";
  place(r4, slots, "fill");

  // Row 5: Good to know + Accessibility (authored ## sections, parsed)
  const r5 = row(); bento.appendChild(r5); r5.layoutSizingHorizontal = "FILL";
  const renderSection = async (name: string, key: string, placeholder: string) => {
    const t = tile(name); await addTitle(t, name); tiles++;
    const items = (sections[key] || []).filter((l) => l.trim().startsWith("- ")).map((l) => l.replace(/^\s*-\s*/, ""));
    if (items.length) {
      for (const it of items) { const b = await txt("•  " + it, STYLE.body, vDefault); t.appendChild(b); b.layoutSizingHorizontal = "FILL"; }
    } else {
      const b = await txt(placeholder, STYLE.body, vCaption); t.appendChild(b); b.layoutSizingHorizontal = "FILL";
    }
    return t;
  };
  place(r5, await renderSection("Good to know", "good to know", 'Add a "## Good to know" section to the description.'), "fill");
  place(r5, await renderSection("Accessibility", "accessibility", 'Add a "## Accessibility" section to the description.'), "fill");

  // Dark mode — full-width tile that MIRRORS the embedded set's arrangement
  // exactly: a Dark-pinned surface sized to the set, with one instance per
  // variant dropped at that variant's own coordinates. This tracks whatever
  // layout the light "All variants" tile ended up with (matrix OR the set's
  // native arrangement), for any axis count — so light and dark read as
  // identical grids.
  const darkTile = tile("Dark mode"); await addTitle(darkTile, "Dark mode"); tiles++;
  bento.appendChild(darkTile); darkTile.layoutSizingHorizontal = "FILL";
  const panel = figma.createFrame(); panel.name = "dark-preview"; panel.clipsContent = false; panel.cornerRadius = 12;
  panel.layoutMode = "NONE";
  panel.strokes = [figma.variables.setBoundVariableForPaint(P, "color", vBorder!)]; panel.strokeWeight = 1;
  sf(panel, vBgDefault);
  if (themeColl && darkMode) panel.setExplicitVariableModeForCollection(themeColl, darkMode.modeId);
  darkTile.appendChild(panel);
  try { (panel as any).layoutSizingHorizontal = "FIXED"; } catch { /* not in an auto-layout parent */ }
  try { (panel as any).layoutAlign = "INHERIT"; } catch { /* ignore */ }
  panel.resize(Math.max(set.width, 1), Math.max(set.height, 1)); // match the set's bounds
  for (const v of variants) {
    const inst = v.createInstance();
    panel.appendChild(inst);
    inst.x = v.x; inst.y = v.y;                     // exact mirror of the set's layout
  }

  bento.primaryAxisSizingMode = "AUTO";

  // Idempotency — remove any prior bento of the same name (the set was already
  // re-parented into the NEW bento above, so it is never inside what we delete).
  const priorName = `${set.name} · Docs`;
  for (const old of pageNode.findAll((n) => n.type === "FRAME" && n.name === priorName && n.id !== bento.id)) {
    try { old.remove(); } catch { /* already gone */ }
  }

  return { bentoId: bento.id, tiles };
}
