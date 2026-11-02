// vite-plugin-extract.mjs — "paste a Figma link" behind a dev-server endpoint.
//
// POST /__extract/run   { url }                     → evidence + a drafted defs
// POST /__extract/save  { slug, evidence, defs? }   → writes them beside the component
//
// `run` is a read: it extracts the set through REST (server/figma-rest.mjs,
// which runs the toolkit's own extractor), hashes the evidence the way the
// sync server does, resolves the slug the way the sync server does, and drafts
// the defs with the real scaffolder — the same three steps the toolkit's
// Publish → scaffold path takes, so the Book cannot draft something the
// pipeline would not.
//
// `save` is the one thing in the Book that writes to disk, and it only runs
// when a person clicks Save. It goes through the sync server's handleEvidence
// (the path the gate's FRESH check trusts), writes the defs draft beside it as
// `npm run specs:scaffold` would, and — when the component already has code —
// extracts the code evidence too, so the defs can be checked at once.
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { extractViaRest, crawlSet, tokenFromEnv } from "./server/figma-rest.mjs";

const readBody = (req) => new Promise((resolve, reject) => {
  let raw = "";
  req.on("data", (c) => { raw += c; });
  req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch (e) { reject(e); } });
  req.on("error", reject);
});
const json = (res, status, body) => { res.statusCode = status; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(body)); };
const pascal = (s) => String(s).split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");

export default function extract({ root }) {
  const require = createRequire(import.meta.url);
  const SRC = join(root, "packages", "components", "src");
  const INBOX = join(root, "packages", "components", "evidence");

  /**
   * Which design system an extraction belongs to.
   *
   * Without this the rail could only ever write into our own tree, and the slug
   * comes from the set's NAME — so pasting Adobe's Spectrum 2 Button, which is
   * also called "Button", drafted a replacement for ours. Naming the target up
   * front is the fix; the foreign-file guard below stays as the backstop for
   * when the wrong one is chosen.
   */
  const pascal2 = (s) => String(s).split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
  const SYSTEMS = {
    s2a: {
      label: "S2A", src: SRC, inbox: INBOX, ns: "s2a",
      // How this system names a component that has no code yet, and how it
      // turns a saved contract into files. Both belong to the system, not to
      // the Book: `pending` is a flag beside a real anchor in the schema, never
      // a substitute for one, so a placeholder still has to be spelled the way
      // this system spells things.
      anchor: (slug) => ({ importPath: `packages/components/src/${slug}/${slug}.js`, export: pascal2(slug), cssClass: `c-${slug}`, pending: true }),
      build: (slug) => ["npm", ["run", "specs:build", "--", `--slug=${slug}`]],
    },
    spectrum: {
      label: "Spectrum 2",
      src: join(root, "packages", "spectrum2", "src"),
      inbox: join(root, "packages", "spectrum2", "evidence"),
      ns: "swc",
      anchor: (slug) => ({ importPath: `@adobe/spectrum-wc/components/${slug}`, export: pascal2(slug), cssClass: `swc-${pascal2(slug)}`, pending: true }),
      build: (slug) => [process.execPath, [join(root, "packages", "spectrum2", "scripts", "build.mjs"), `--slug=${slug}`]],
    },
  };
  const systemOf = (id) => SYSTEMS[id] ?? SYSTEMS.s2a;

  /**
   * A drafted token value the schema cannot accept, replaced by the literal it
   * resolves to.
   *
   * The scaffolder names a token by its Figma variable path with the slashes
   * swapped for dots. For us that IS the token, because our variables are named
   * after our tokens. For another system it is not: Spectrum's
   * `Alias/background/neutral/default` is `--swc-neutral-background-color-default`,
   * and the path is Title Case besides, so the reference fails the pattern and
   * the whole draft is refused.
   *
   * Inventing a name would be worse than refusing. Falling back to the resolved
   * literal is the honest third option: the draft is valid, the value is right,
   * and `raw:` is already how this system records a value with no token behind
   * it — so every one of these shows up in the warnings as work to do rather
   * than passing as a binding that resolves to nothing.
   */
  const REF_OK = /^(raw:.+|\{[a-z][a-z0-9-]*\.[a-z0-9.-]+\}( \{[a-z][a-z0-9-]*\.[a-z0-9.-]+\})*)$/;
  const UNITLESS = new Set(["font-weight", "line-height", "opacity", "z-index", "flex-grow", "flex-shrink", "order"]);
  const literalOf = (prop, v) => {
    if (v == null) return null;
    if (typeof v === "object" && "r" in v) {
      const c = (x) => Math.round(x * 255);
      return v.a != null && v.a < 1
        ? `rgba(${c(v.r)}, ${c(v.g)}, ${c(v.b)}, ${Number(v.a.toFixed(3))})`
        : "#" + [v.r, v.g, v.b].map((x) => c(x).toString(16).padStart(2, "0")).join("");
    }
    if (typeof v === "number") return UNITLESS.has(prop) ? String(v) : `${v}px`;
    if (typeof v === "string") return v;
    return null;
  };
  function groundRefs(draft, evidence) {
    const byName = new Map();
    for (const v of Object.values(evidence?.variables ?? {})) {
      const modes = v?.resolved ?? {};
      const first = modes.Modeless ?? Object.values(modes)[0];
      if (v?.name && first !== undefined) byName.set(v.name, first);
    }
    let grounded = 0, stranded = 0;
    const walk = (node, inTokens = false) => {
      if (Array.isArray(node)) return node.map((x) => walk(x, inTokens));
      if (!node || typeof node !== "object") return node;
      const out = {};
      for (const [k, v] of Object.entries(node)) {
        const here = inTokens || k === "tokens" || k === "map";
        if (typeof v === "string" && inTokens && !REF_OK.test(v)) {
          const name = v.startsWith("{") ? v.slice(1, -1).replace(/\./g, "/") : null;
          const lit = name ? literalOf(k, byName.get(name)) : null;
          if (lit) { out[k] = `raw:${lit}`; grounded++; } else { out[k] = v; stranded++; }
          continue;
        }
        out[k] = walk(v, here);
      }
      return out;
    };
    return { def: walk(draft), grounded, stranded };
  }

  /**
   * The scaffolder lives in the sync server and resolves code anchors against
   * our own tree, so a draft for another system came back claiming our class and
   * our file — `c-button`, packages/components/src/button/button.js — for Adobe's
   * Button. The design half of the draft is still right; only the code anchor is
   * ours to correct. An existing contract in the target tree knows its own, and
   * where there is none the anchor is left pending rather than borrowed.
   */
  const reanchor = (draft, target, slug) => {
    if (!draft || target.src === SRC) return draft;
    const defsFile = join(target.src, slug, `${slug}.defs.json`);
    const own = existsSync(defsFile) ? JSON.parse(readFileSync(defsFile, "utf8"))?.anchors?.code : null;
    // An anchor on disk is only usable if it is complete: the schema requires
    // importPath, export and cssClass, and `pending` is a flag beside them, not
    // a stand-in. Anything short of that is filled from the system's own naming
    // rather than passed through, which is how a draft came back as nothing but
    // { pending: true } and failed three schema checks before it was read.
    const whole = own && ["importPath", "export", "cssClass"].every((k) => typeof own[k] === "string");
    return { ...draft, anchors: { ...draft.anchors, code: whole ? own : { ...target.anchor(slug), ...(own ?? {}) } } };
  };
  // The sync server module builds its http.Server at load but only listens
  // when run directly; required here it is a library of the publish path.
  let sync = null;
  const syncServer = () => (sync ??= require(join(root, "apps", "s2a-toolkit", "server", "contract-sync-server.cjs")));

  return {
    name: "s2a-extract",
    configureServer(server) {
      const extractorPath = join(root, "apps", "s2a-toolkit", "src", "contract-extract.ts");
      const loadExtractor = () => server.ssrLoadModule(extractorPath);

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://x");

        if (!url.pathname.startsWith("/__extract/")) return next();
        if (req.method !== "POST") return json(res, 405, { ok: false, message: "POST" });
        try {
          const body = await readBody(req);

          const target = systemOf(body.system ?? "s2a");
          if (url.pathname === "/__extract/run") {
            const token = tokenFromEnv(root);
            if (!token) return json(res, 200, { ok: false, reason: "no-token", message: "No Figma token: put FIGMA_ACCESS_TOKEN in .env at the repo root (a personal access token with file read scope)." });
            const { evidence, fidelity } = await extractViaRest({ url: body.url, token, loadExtractor });
            const S = syncServer();
            evidence.provenance = { hash: S.hashEvidence(evidence) };
            const { slug, spec } = S.resolveSlug(evidence, body.slug);
            if (!slug) return json(res, 200, { ok: false, reason: "slug", message: `Could not derive a slug from the set name "${evidence.set?.name}"` });
            const name = spec?.name ?? pascal(slug);
            const onDisk = {
              defs: existsSync(join(target.src, slug, `${slug}.defs.json`)),
              evidence: existsSync(join(target.src, slug, `${slug}.figma.evidence.json`)) || existsSync(join(INBOX, `${slug}.figma.evidence.json`)),
              code: existsSync(join(target.src, slug, `${slug}.js`)),
              spec: spec?.specPath ?? null,
            };
            // When the component already exists in code but its code evidence
            // does not, take the evidence first: the scaffolder curates against
            // both pools when it has both, and a draft that never saw the code
            // props arrives with a refusal per prop. Same script as evidence:code.
            if (onDisk.code && !existsSync(join(target.src, slug, `${slug}.code.evidence.json`))) {
              spawnSync(process.execPath, [join(root, "packages", "components", "scripts", "code-evidence.mjs"), `--slug=${slug}`, `--root=${relative(root, target.src)}`, `--ns=${target.ns}`], { cwd: root, encoding: "utf8" });
            }
            const draft = await S.draftDef(evidence, slug, name);
            draft.def = reanchor(draft.def, target, slug);
            if (target.src !== SRC) {
              const g = groundRefs(draft.def, evidence);
              draft.def = g.def;
              if (g.grounded) draft.notes = [...(draft.notes ?? []), {
                id: "x-unmapped-tokens", confidence: "low",
                chose: `grounded ${g.grounded} token reference${g.grounded === 1 ? "" : "s"} to the literal it resolves to`,
                why: `This system names its Figma variables differently from its tokens, so the scaffolder's path-to-reference guess named nothing. Each is a raw: value carrying the right paint or measure, and each will show up as an unbound value until somebody maps it.${g.stranded ? ` ${g.stranded} could not be resolved at all and are left as they were.` : ""}`,
              }];
            }
            // The code evidence, when the component already exists in code, so
            // the Book's curation checks run against both pools as the gate does.
            const codeFile = join(target.src, slug, `${slug}.code.evidence.json`);
            const code = existsSync(codeFile) ? JSON.parse(readFileSync(codeFile, "utf8")) : null;
            return json(res, 200, { ok: true, slug, name, evidence, defs: draft.def, notes: draft.notes, fidelity, onDisk, code });
          }

          // The tree behind one link: every set it composes, to the leaves,
          // with evidence and an order to contract them in. No drafting here —
          // a draft is made when its turn comes, against the contracts that
          // exist by then.
          if (url.pathname === "/__extract/crawl") {
            const token = tokenFromEnv(root);
            if (!token) return json(res, 200, { ok: false, reason: "no-token", message: "No Figma token in .env" });
            const tree = await crawlSet({ url: body.url, token, loadExtractor, maxDepth: body.maxDepth ?? 4 });
            const S = syncServer();
            const out = {};
            for (const n of Object.values(tree.nodes)) {
              if (n.kind !== "set") { out[n.nodeId] = { nodeId: n.nodeId, kind: n.kind, error: n.error, deps: [] }; continue; }
              const { slug, spec } = S.resolveSlug(n.evidence, null);
              const effective = slug || null;
              out[n.nodeId] = {
                nodeId: n.nodeId, name: n.name, kind: "set", slug: effective, depth: n.depth,
                deps: n.deps.map((d) => ({ nodeId: d.nodeId, name: d.name })),
                variants: n.evidence.variants?.length ?? 0,
                onDisk: effective ? {
                  defs: existsSync(join(target.src, effective, `${effective}.defs.json`)),
                  contract: existsSync(join(target.src, effective, `${effective}.contract.json`)),
                  code: existsSync(join(target.src, effective, `${effective}.js`)),
                  spec: spec?.specPath ?? null,
                } : null,
                evidence: n.evidence,
              };
            }
            return json(res, 200, { ok: true, fileKey: tree.fileKey, root: tree.root, order: tree.order, nodes: out });
          }

          // A draft from evidence already in hand, against the contracts that
          // exist NOW — which is what makes leaves-first mean something.
          if (url.pathname === "/__extract/draft") {
            const { evidence, slug: want } = body;
            if (!evidence?.set?.name) return json(res, 400, { ok: false, message: "evidence is required" });
            const S = syncServer();
            evidence.provenance = { hash: S.hashEvidence(evidence) };
            const { slug, spec } = S.resolveSlug(evidence, want ?? null);
            if (!slug) return json(res, 200, { ok: false, reason: "slug", message: `Could not derive a slug from "${evidence.set?.name}"` });
            const name = spec?.name ?? pascal(slug);
            if (existsSync(join(target.src, slug, `${slug}.js`)) && !existsSync(join(target.src, slug, `${slug}.code.evidence.json`))) {
              spawnSync(process.execPath, [join(root, "packages", "components", "scripts", "code-evidence.mjs"), `--slug=${slug}`, `--root=${relative(root, target.src)}`, `--ns=${target.ns}`], { cwd: root, encoding: "utf8" });
            }
            const draft = await S.draftDef(evidence, slug, name);
            draft.def = reanchor(draft.def, target, slug);
            if (target.src !== SRC) {
              const g = groundRefs(draft.def, evidence);
              draft.def = g.def;
              if (g.grounded) draft.notes = [...(draft.notes ?? []), {
                id: "x-unmapped-tokens", confidence: "low",
                chose: `grounded ${g.grounded} token reference${g.grounded === 1 ? "" : "s"} to the literal it resolves to`,
                why: `This system names its Figma variables differently from its tokens, so the scaffolder's path-to-reference guess named nothing. Each is a raw: value carrying the right paint or measure, and each will show up as an unbound value until somebody maps it.${g.stranded ? ` ${g.stranded} could not be resolved at all and are left as they were.` : ""}`,
              }];
            }
            const codeFile = join(target.src, slug, `${slug}.code.evidence.json`);
            const code = existsSync(codeFile) ? JSON.parse(readFileSync(codeFile, "utf8")) : null;
            return json(res, 200, { ok: true, slug, name, evidence, defs: draft.def, notes: draft.notes, code,
              onDisk: { defs: existsSync(join(target.src, slug, `${slug}.defs.json`)), contract: existsSync(join(target.src, slug, `${slug}.contract.json`)), code: Boolean(code) } });
          }

          if (url.pathname === "/__extract/save") {
            const { slug, evidence, defs, overwriteDefs = false } = body;
            if (!slug || !evidence) return json(res, 400, { ok: false, message: "slug and evidence are required" });

            // Save writes into our own source tree, and the slug comes from the
            // set's NAME. Once a second design system is in the Book that is not
            // safe on its own: Adobe's Spectrum 2 set is also called "Button", so
            // saving its evidence would land on ours and replace a contract's
            // design anchor with another system's. The file the evidence came
            // from is the thing that distinguishes them, so a save that would
            // change it is refused rather than merged.
            const existing = join(target.src, slug, `${slug}.figma.evidence.json`);
            if (existsSync(existing)) {
              const prior = JSON.parse(readFileSync(existing, "utf8"));
              const was = prior?.file?.key ?? prior?.set?.fileKey ?? null;
              const now = evidence?.file?.key ?? evidence?.set?.fileKey ?? null;
              if (was && now && was !== now) {
                return json(res, 200, { ok: false, reason: "foreign-file", message:
                  `"${slug}" already has design evidence from file ${was}, and this extraction came from ${now}. ` +
                  `Two sets can share a name across design systems; saving would replace one component's design anchor with another's. ` +
                  `Pick the right system on the rail, or extract into that system's own package.` });
              }
            }
            const S = syncServer();
            // Our own tree goes through the sync server, which is the path the
            // gate's FRESH check trusts. Another system's does not: that server
            // resolves slugs and writes against packages/components/src and
            // nothing else, and threading a second tree through it would change
            // a module the plugin and the relay share. The write is the same
            // three lines, under the same canonical hash, so the two agree.
            let status = 200, out;
            if (target.src === SRC) {
              [status, out] = S.handleEvidence({ evidence, slug });
            } else {
              const hash = S.hashEvidence(evidence);
              const dir = join(target.src, slug);
              const file = join(dir, `${slug}.figma.evidence.json`);
              const prior = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
              if (prior?.provenance?.hash === hash) {
                out = { status: "in-sync", slug, path: relative(root, file), hash };
              } else {
                mkdirSync(dir, { recursive: true });
                writeFileSync(file, JSON.stringify({ ...evidence, provenance: { ...(evidence.provenance ?? {}), hash } }, null, 2) + "\n");
                out = { status: prior ? "updated" : "new", slug, path: relative(root, file), hash, previousHash: prior?.provenance?.hash ?? null };
              }
            }
            if (status !== 200) return json(res, status, { ok: false, message: out.error ?? "publish refused", detail: out });
            const written = { evidence: out, defs: null };
            // The hash leaves unboundValues out on purpose (an observation of
            // nodes the bindings already cover), so an "in-sync" verdict can
            // still be sitting on a file whose literals are stale — as when the
            // extractor learns to record a new property. Refresh them under the
            // same hash; nothing the gate's FRESH check reads has moved.
            if (out.status === "in-sync" && out.path) {
              const file = join(root, out.path);
              const onDisk = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
              if (onDisk && JSON.stringify(onDisk.unboundValues ?? []) !== JSON.stringify(evidence.unboundValues ?? [])) {
                writeFileSync(file, JSON.stringify({ ...onDisk, ...evidence, provenance: onDisk.provenance }, null, 2) + "\n");
                written.evidence = { ...out, status: "in-sync · literals refreshed" };
              }
            }
            if (defs) {
              const dir = join(target.src, slug);
              const defsFile = join(dir, `${slug}.defs.json`);
              // A defs with decided decisions is somebody's work. A re-draft
              // never replaces it unless asked for by name — "overwrite" is not
              // enough; that word is what a leaves-first run says for leaves
              // that are still drafts.
              const existing = existsSync(defsFile) ? JSON.parse(readFileSync(defsFile, "utf8")) : null;
              // Curated means a PERSON decided something: a decision the scaffold
              // or heal settled by rule is still a draft's.
              const curated = Boolean(existing?.decisions?.some((d) => d.status === "decided" && !["heal", "scaffold", "Matt"].includes(d.owner ?? "") || (d.status === "decided" && d.owner === "Matt" && !d.chose)))
                || (existing?.status && existing.status !== "curated-draft");
              if (existing && (!overwriteDefs || (curated && overwriteDefs !== "even-curated"))) {
                written.defs = { status: "kept", path: relative(root, defsFile), note: curated ? "this defs has decided decisions — it is curated, and a draft does not replace curation (pass overwriteDefs: \"even-curated\" to insist)" : "a defs already exists; the draft was not written over it" };
              } else {
                const had = existsSync(defsFile);
                mkdirSync(dir, { recursive: true });
                writeFileSync(defsFile, JSON.stringify(defs, null, 2) + "\n");
                written.defs = { status: had ? "overwritten" : "new", path: relative(root, defsFile) };
                // The publish path parks evidence for an unknown set in the inbox;
                // once a defs exists the pair lives beside the component, as
                // specs:scaffold would leave them.
                const inbox = join(INBOX, `${slug}.figma.evidence.json`);
                if (existsSync(inbox)) {
                  renameSync(inbox, join(dir, `${slug}.figma.evidence.json`));
                  written.evidence = { ...out, path: relative(root, join(dir, `${slug}.figma.evidence.json`)), movedFromInbox: true };
                }
              }
            }
            // The component already exists in code: the defs cannot be checked
            // against it until its code evidence exists, and that is a read of
            // the repo, so take it now rather than hand back a refusal that
            // names the command. Same script as `npm run evidence:code`.
            if (existsSync(join(target.src, slug, `${slug}.js`))) {
              const run = spawnSync(process.execPath, [join(root, "packages", "components", "scripts", "code-evidence.mjs"), `--slug=${slug}`, `--root=${relative(root, target.src)}`, `--ns=${target.ns}`], { cwd: root, encoding: "utf8" });
              const line = (run.stdout ?? "").trim().split("\n").find((l) => l.includes(slug)) ?? (run.stdout ?? "").trim().split("\n").pop();
              written.code = run.status === 0
                ? { status: "extracted", path: relative(root, join(target.src, slug, `${slug}.code.evidence.json`)), line }
                : { status: "failed", error: (run.stderr || run.stdout || "").trim().slice(-400) };
            }
            // Build on request: the contract has to exist on disk before a
            // parent can compose it, so a leaves-first run saves and builds.
            if (body.build) {
              const [cmd, args] = target.build(slug);
              const run = spawnSync(cmd, args, { cwd: root, encoding: "utf8" });
              const line = (run.stdout ?? "").split("\n").find((l) => /^(BUILT|FAIL)/.test(l)) ?? (run.stderr ?? "").trim().split("\n").pop();
              written.build = { status: run.status === 0 ? "built" : "failed", line };
            }
            return json(res, 200, { ok: true, ...written });
          }

          // An edited defs for a component already on disk — a healed one, say.
          // The only file written is the one the person was editing.
          if (url.pathname === "/__extract/save-defs") {
            const { defs } = body;
            // The Book addresses another system's component as `<system>:<name>`,
            // and this is an edit to a component already on disk, so the system
            // comes from the slug rather than from the extract rail's selector.
            const raw = String(body.slug ?? "");
            const at = raw.indexOf(":");
            const target = at < 0 ? systemOf("s2a") : systemOf(raw.slice(0, at));
            const slug = at < 0 ? raw : raw.slice(at + 1);
            if (!raw || !defs || typeof defs !== "object") return json(res, 400, { ok: false, message: "slug and defs are required" });
            const defsFile = join(target.src, slug, `${slug}.defs.json`);
            if (!existsSync(defsFile)) return json(res, 404, { ok: false, message: `${slug} has no defs on disk — save it as a draft first` });
            writeFileSync(defsFile, JSON.stringify(defs, null, 2) + "\n");
            // Signing off used to write the file and hand back two commands to
            // run in a terminal, so the Preview kept showing the contract from
            // before the edit until somebody did. Build it here instead, with
            // the target system's own builder — ours is npm run specs:build,
            // another system has its own and would silently build nothing.
            const [cmd, args] = target.build(slug);
            const run = spawnSync(cmd, args, { cwd: root, encoding: "utf8" });
            const line = (run.stdout ?? "").split("\n").find((l) => /^(BUILT|FAIL)/.test(l)) ?? (run.stderr ?? "").trim().split("\n").pop();
            return json(res, 200, { ok: true,
              defs: { status: "written", path: relative(root, defsFile) },
              build: { status: run.status === 0 ? "built" : "failed", line } });
          }

          // An icon the design uses and the library does not have: export the
          // glyph from Figma as SVG, into packages/components/src/icons under a
          // name derived from the Figma name, rebuild the manifest, and hand
          // back the entry. The sidecar keeps the exact Figma name and node, so
          // the next extraction resolves it without asking.
          if (url.pathname === "/__extract/icon") {
            const { fileKey, nodeId, figmaName } = body;
            if (!fileKey || !nodeId || !figmaName) return json(res, 400, { ok: false, message: "fileKey, nodeId and figmaName are required" });
            const token = tokenFromEnv(root);
            if (!token) return json(res, 200, { ok: false, reason: "no-token", message: "No Figma token in .env" });
            const ICONS = join(root, "packages", "components", "src", "icons");
            // S2_Icon_AcrobatPDFEdit_20_N → acrobat-pdf-edit; S2a_Icon_Chevron Down → chevron-down.
            const stem = String(figmaName).replace(/^S2a?_Icon_/i, "").replace(/_(\d+)_[A-Z]$/i, "").replace(/_Size\d+_[A-Z]$/i, "")
              .replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
            if (!stem) return json(res, 400, { ok: false, message: `could not derive a name from "${figmaName}"` });
            const sidecarFile = join(ICONS, "figma-sources.json");
            const sources = existsSync(sidecarFile) ? JSON.parse(readFileSync(sidecarFile, "utf8")) : {};
            // A different Figma glyph with a name the library already uses (S2 vs
            // S2a chevrons) keeps the family in its file name rather than clobbering.
            let file = `${stem}.svg`;
            if (existsSync(join(ICONS, file)) && sources[file]?.figmaName !== figmaName) file = `${/^S2a_/i.test(figmaName) ? "s2a" : "s2"}-${stem}.svg`;
            const headers = { "X-Figma-Token": token };
            const exportSvg = async (fk, id) => {
              const meta = await fetch(`https://api.figma.com/v1/images/${fk}?ids=${encodeURIComponent(id)}&format=svg`, { headers }).then((r) => r.json());
              return meta?.images?.[id] ?? null;
            };
            // Figma exports SVG for a component that lives in this file, and
            // refuses for an instance of a LIBRARY component (the S2 icon set
            // is one). For those the component key names the library file and
            // node, and the export is taken from there — when the token can
            // open that library; a 403 is reported, not hidden.
            let svgUrl = await exportSvg(fileKey, nodeId);
            let from = { fileKey, nodeId };
            if (!svgUrl && body.key) {
              const c = await fetch(`https://api.figma.com/v1/components/${body.key}`, { headers });
              const cj = await c.json().catch(() => ({}));
              if (c.ok && cj.meta?.file_key && cj.meta?.node_id) {
                svgUrl = await exportSvg(cj.meta.file_key, cj.meta.node_id);
                from = { fileKey: cj.meta.file_key, nodeId: cj.meta.node_id, library: true };
              } else if (c.status === 403) {
                return json(res, 200, { ok: false, reason: "library-forbidden", message: `${figmaName} lives in a library this token cannot open (component ${body.key.slice(0, 8)}…). Export the SVG from that library by hand into packages/components/src/icons, or use a token with access.` });
              }
            }
            if (!svgUrl) return json(res, 200, { ok: false, reason: "no-image", message: `Figma returned no SVG for ${figmaName} (${nodeId}${body.key ? `, key ${body.key.slice(0, 8)}…` : ""})` });
            let svg = await fetch(svgUrl).then((r) => r.text());
            // currentColor, so the glyph takes the part's colour like the rest of the library.
            svg = svg.replace(/\s(fill|stroke)="(?!none)[^"]*"/g, (m, attr) => ` ${attr}="currentColor"`);
            writeFileSync(join(ICONS, file), svg.trim() + "\n");
            sources[file] = { figmaName, ...from, fetchedAt: new Date().toISOString() };
            writeFileSync(sidecarFile, JSON.stringify(sources, null, 2) + "\n");
            const built = spawnSync(process.execPath, [join(root, "packages", "spec-dictionary", "assets.mjs")], { cwd: root, encoding: "utf8" });
            const manifest = JSON.parse(readFileSync(join(root, "packages", "spec-dictionary", "out", "assets", "s2a-icons.json"), "utf8"));
            const key = file.replace(/\.svg$/, "");
            return json(res, 200, { ok: true, manifest: "s2a-icons", icon: key, file: relative(root, join(ICONS, file)), entry: manifest.entries[key], rebuilt: built.status === 0 });
          }

          return json(res, 404, { ok: false, message: "no such endpoint" });
        } catch (e) {
          return json(res, 500, { ok: false, reason: "error", message: e instanceof Error ? e.message : String(e) });
        }
      });
    },
  };
}
