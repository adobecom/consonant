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
import { join, relative } from "node:path";
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
              defs: existsSync(join(SRC, slug, `${slug}.defs.json`)),
              evidence: existsSync(join(SRC, slug, `${slug}.figma.evidence.json`)) || existsSync(join(INBOX, `${slug}.figma.evidence.json`)),
              code: existsSync(join(SRC, slug, `${slug}.js`)),
              spec: spec?.specPath ?? null,
            };
            // When the component already exists in code but its code evidence
            // does not, take the evidence first: the scaffolder curates against
            // both pools when it has both, and a draft that never saw the code
            // props arrives with a refusal per prop. Same script as evidence:code.
            if (onDisk.code && !existsSync(join(SRC, slug, `${slug}.code.evidence.json`))) {
              spawnSync(process.execPath, [join(root, "packages", "components", "scripts", "code-evidence.mjs"), `--slug=${slug}`], { cwd: root, encoding: "utf8" });
            }
            const draft = await S.draftDef(evidence, slug, name);
            // The code evidence, when the component already exists in code, so
            // the Book's curation checks run against both pools as the gate does.
            const codeFile = join(SRC, slug, `${slug}.code.evidence.json`);
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
                  defs: existsSync(join(SRC, effective, `${effective}.defs.json`)),
                  contract: existsSync(join(SRC, effective, `${effective}.contract.json`)),
                  code: existsSync(join(SRC, effective, `${effective}.js`)),
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
            if (existsSync(join(SRC, slug, `${slug}.js`)) && !existsSync(join(SRC, slug, `${slug}.code.evidence.json`))) {
              spawnSync(process.execPath, [join(root, "packages", "components", "scripts", "code-evidence.mjs"), `--slug=${slug}`], { cwd: root, encoding: "utf8" });
            }
            const draft = await S.draftDef(evidence, slug, name);
            const codeFile = join(SRC, slug, `${slug}.code.evidence.json`);
            const code = existsSync(codeFile) ? JSON.parse(readFileSync(codeFile, "utf8")) : null;
            return json(res, 200, { ok: true, slug, name, evidence, defs: draft.def, notes: draft.notes, code,
              onDisk: { defs: existsSync(join(SRC, slug, `${slug}.defs.json`)), contract: existsSync(join(SRC, slug, `${slug}.contract.json`)), code: Boolean(code) } });
          }

          if (url.pathname === "/__extract/save") {
            const { slug, evidence, defs, overwriteDefs = false } = body;
            if (!slug || !evidence) return json(res, 400, { ok: false, message: "slug and evidence are required" });
            const S = syncServer();
            const [status, out] = S.handleEvidence({ evidence, slug });
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
              const dir = join(SRC, slug);
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
            if (existsSync(join(SRC, slug, `${slug}.js`))) {
              const run = spawnSync(process.execPath, [join(root, "packages", "components", "scripts", "code-evidence.mjs"), `--slug=${slug}`], { cwd: root, encoding: "utf8" });
              const line = (run.stdout ?? "").trim().split("\n").find((l) => l.includes(slug)) ?? (run.stdout ?? "").trim().split("\n").pop();
              written.code = run.status === 0
                ? { status: "extracted", path: relative(root, join(SRC, slug, `${slug}.code.evidence.json`)), line }
                : { status: "failed", error: (run.stderr || run.stdout || "").trim().slice(-400) };
            }
            // Build on request: the contract has to exist on disk before a
            // parent can compose it, so a leaves-first run saves and builds.
            if (body.build) {
              const run = spawnSync("npm", ["run", "specs:build", "--", `--slug=${slug}`], { cwd: root, encoding: "utf8" });
              const line = (run.stdout ?? "").split("\n").find((l) => /^(BUILT|FAIL)/.test(l)) ?? (run.stderr ?? "").trim().split("\n").pop();
              written.build = { status: run.status === 0 ? "built" : "failed", line };
            }
            return json(res, 200, { ok: true, ...written });
          }

          // An edited defs for a component already on disk — a healed one, say.
          // The only file written is the one the person was editing.
          if (url.pathname === "/__extract/save-defs") {
            const { slug, defs } = body;
            if (!slug || !defs || typeof defs !== "object") return json(res, 400, { ok: false, message: "slug and defs are required" });
            const defsFile = join(SRC, slug, `${slug}.defs.json`);
            if (!existsSync(defsFile)) return json(res, 404, { ok: false, message: `${slug} has no defs on disk — save it as a draft first` });
            writeFileSync(defsFile, JSON.stringify(defs, null, 2) + "\n");
            return json(res, 200, { ok: true, defs: { status: "written", path: relative(root, defsFile) }, next: `npm run specs:build -- --slug=${slug} && npm run specs:render -- --slug=${slug}` });
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
