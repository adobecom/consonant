// vite-plugin-s2a-data.mjs — the repo, as a module the browser can import.
//
// The Contract Book runs the real engine (packages/spec-dictionary) in the
// browser, and the engine runs on files: a component's defs, its two evidence
// files, the defs schema, the shipped token CSS, the asset manifests. A
// browser cannot read a directory, so this plugin reads them at dev/build
// time and exposes one virtual module, `virtual:s2a-data`, holding all of it.
//
// Nothing is copied into the app's source tree. The data is whatever is on
// disk when Vite runs, which is the same thing `npm run specs:build` reads —
// so the Book and the CLI cannot disagree about what a component says.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const VIRTUAL = "virtual:s2a-data";
const RESOLVED = "\0" + VIRTUAL;

const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);

export default function s2aData({ root }) {
  const ROOT = resolve(root);
  const SRC = join(ROOT, "packages", "components", "src");
  const TOKENS = join(ROOT, "dist", "packages", "tokens", "css", "dev");
  const ASSETS = join(ROOT, "packages", "spec-dictionary", "out", "assets");
  const SCHEMA = join(ROOT, "packages", "components", "defs.schema.json");
  const CONTRACT_SCHEMA = join(ROOT, "packages", "spec-dictionary", "southleft", "contract.schema.json");

  function load() {
    const components = [];
    for (const slug of readdirSync(SRC).sort()) {
      const dir = join(SRC, slug);
      const defs = readJson(join(dir, `${slug}.defs.json`));
      const spec = readJson(join(dir, `${slug}.spec.json`));
      // Every component with a spec is in the slug index (specJson needs it to
      // resolve composedOf names); only the contracted ones get a full record.
      if (!spec && !defs) continue;
      components.push({
        slug,
        name: spec?.name ?? defs?.component ?? slug,
        contracted: Boolean(defs),
        defs,
        figma: readJson(join(dir, `${slug}.figma.evidence.json`)),
        code: readJson(join(dir, `${slug}.code.evidence.json`)),
        contract: readJson(join(dir, `${slug}.contract.json`)),
        hasCode: existsSync(join(dir, `${slug}.js`)),
      });
    }

    // Token CSS, parsed to plain objects so the pure resolver can take them —
    // and verbatim, for the preview, which needs the theme selectors intact.
    const tokenFiles = {};
    const tokenCss = {};
    if (existsSync(TOKENS)) {
      for (const f of readdirSync(TOKENS)) {
        const css = readFileSync(join(TOKENS, f), "utf8");
        const map = {};
        for (const m of css.matchAll(/(--s2a-[a-z0-9_-]+)\s*:\s*([^;]+);/g)) map[m[1]] = m[2].trim();
        tokenFiles[f] = map;
        tokenCss[f] = css;
      }
    }

    const assets = {};
    if (existsSync(ASSETS)) {
      for (const f of readdirSync(ASSETS)) if (f.endsWith(".json")) assets[f.replace(/\.json$/, "")] = readJson(join(ASSETS, f));
    }

    return {
      components,
      tokenFiles,
      tokenCss,
      assets,
      schemas: { defs: readJson(SCHEMA), contract: readJson(CONTRACT_SCHEMA) },
      capturedAt: new Date().toISOString(),
    };
  }

  return {
    name: "s2a-data",
    resolveId(id) { return id === VIRTUAL ? RESOLVED : null; },
    load(id) {
      if (id !== RESOLVED) return null;
      return `export default ${JSON.stringify(load())};`;
    },
    // Editing a defs/evidence file on disk should show up in the Book without a
    // restart — the point of running against the repo rather than a snapshot.
    configureServer(server) {
      const watch = [SRC, TOKENS, ASSETS, SCHEMA, CONTRACT_SCHEMA];
      for (const w of watch) if (existsSync(w)) server.watcher.add(w);
      // A save writes three files in a row and the person has a banner to
      // read, so the reload waits a beat and collapses the burst into one.
      let pending = 0;
      const reload = (file) => {
        if (!watch.some((w) => file.startsWith(w))) return;
        // Code evidence is derived from source and the extract endpoint takes
        // it as a side step of drafting; reloading on it would throw away the
        // very draft being made. The defs/evidence that land with a Save
        // trigger the reload that matters, and it carries the code evidence.
        if (file.endsWith(".code.evidence.json")) return;
        // The icon endpoint rebuilds the asset manifests while a heal is in
        // flight; the Book patches its own copy of the manifest for that case.
        if (file.startsWith(ASSETS)) return;
        clearTimeout(pending);
        pending = setTimeout(() => {
          const mod = server.moduleGraph.getModuleById(RESOLVED);
          if (mod) { server.moduleGraph.invalidateModule(mod); server.ws.send({ type: "full-reload" }); }
        }, 6000);
      };
      server.watcher.on("change", reload);
      server.watcher.on("add", reload);
    },
  };
}
