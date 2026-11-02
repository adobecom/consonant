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
import { SYSTEMS as DECLARED } from "../../packages/spec-dictionary/systems.mjs";
import { join, resolve } from "node:path";

const VIRTUAL = "virtual:s2a-data";
const RESOLVED = "\0" + VIRTUAL;

const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);

export default function s2aData({ root }) {
  const ROOT = resolve(root);
  const SRC = join(ROOT, "packages", "components", "src");
  const TOKENS = join(ROOT, "dist", "packages", "tokens", "css", "dev");
  // A design system is a source directory plus a token namespace. S2A is one;
  // packages/spectrum2 is a second, holding contracts that describe Adobe's
  // Spectrum 2 rather than our own components. Everything downstream groups
  // on `system`, so adding a third is one entry here.
  const SYSTEMS = [
    { id: "s2a", label: "S2A", ns: "s2a", dir: SRC, tokens: TOKENS },
    // `ns` names the contract (spectrum.button); `tokenNs` names the custom
    // properties its tokens actually use. For Spectrum 2 those differ: the
    // implementation is @adobe/spectrum-wc and its variables are --swc-*.
    { id: "spectrum", label: "Spectrum 2", ns: "spectrum", tokenNs: "swc", dir: join(ROOT, "packages", "spectrum2", "src"), tokens: join(ROOT, "packages", "spectrum2", "tokens") },
  ].filter((s) => existsSync(s.dir));
  const ASSETS = join(ROOT, "packages", "spec-dictionary", "out", "assets");
  const SCHEMA = join(ROOT, "packages", "components", "defs.schema.json");
  const CONTRACT_SCHEMA = join(ROOT, "packages", "spec-dictionary", "southleft", "contract.schema.json");

  function load() {
    const components = [];
    for (const system of SYSTEMS)
    for (const slug of readdirSync(system.dir).sort()) {
      const dir = join(system.dir, slug);
      const defs = readJson(join(dir, `${slug}.defs.json`));
      const spec = readJson(join(dir, `${slug}.spec.json`));
      // Every component with a spec is in the slug index (specJson needs it to
      // resolve composedOf names); only the contracted ones get a full record.
      if (!spec && !defs) continue;
      components.push({
        slug: system.id === "s2a" ? slug : `${system.id}:${slug}`,
        system: system.id,
        systemLabel: system.label,
        name: spec?.name ?? defs?.component ?? slug,
        contracted: Boolean(defs),
        defs,
        figma: readJson(join(dir, `${slug}.figma.evidence.json`)),
        code: readJson(join(dir, `${slug}.code.evidence.json`)),
        contract: readJson(join(dir, `${slug}.contract.json`)),
        hasCode: existsSync(join(dir, `${slug}.js`)),
      });
    }

    // Token CSS, parsed to plain objects so the pure resolver can take them.
    const tokenFiles = {};
    // Per system, because a token namespace belongs to a system, not to the Book.
    const tokenFilesBySystem = {};
    for (const sys of SYSTEMS) {
      const map = {};
      if (existsSync(sys.tokens)) {
        const re = new RegExp(`(--${sys.tokenNs ?? sys.ns}-[a-z0-9_-]+)\\s*:\\s*([^;]+);`, "g");
        for (const f of readdirSync(sys.tokens)) {
          const css = readFileSync(join(sys.tokens, f), "utf8");
          const m2 = {};
          for (const m of css.matchAll(re)) m2[m[1]] = m[2].trim();
          map[f] = m2;
          if (sys.id === "s2a") tokenFiles[f] = m2;
        }
      }
      // A component's own stylesheet is one more, lowest-priority tier: Spectrum
      // declares --swc-<component>-* properties there. Read here as well as in
      // the Node build so the gate and the Book cannot disagree about whether a
      // reference resolves.
      const tier = {};
      if (existsSync(sys.dir)) for (const slug of readdirSync(sys.dir)) {
        const css = join(sys.dir, slug, `${slug}.css`);
        if (!existsSync(css)) continue;
        for (const m of readFileSync(css, "utf8").matchAll(new RegExp(`(--${sys.tokenNs ?? sys.ns}-[a-z0-9_-]+)\\s*:\\s*([^;]+);`, "g"))) tier[m[1]] ??= m[2].trim();
      }
      if (Object.keys(tier).length) map["tokens.component.css"] = tier;
      tokenFilesBySystem[sys.id] = map;
    }

    // Asset manifests are keyed by their own name, so every system's manifests
    // share one map — a slot says `spectrum-icons` or `s2a-icons` and the name
    // is the whole address.
    const assets = {};
    for (const dir of [ASSETS, join(ROOT, "packages", "spectrum2", "assets")]) {
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) if (f.endsWith(".json")) assets[f.replace(/\.json$/, "")] = readJson(join(dir, f));
    }

    return {
      components,
      tokenFiles,
      tokenFilesBySystem,
      // Where each system's stories live in Storybook, from the one declaration
      // of what a system is; the Book builds story ids and links from it.
      storybookTitleBySystem: Object.fromEntries(SYSTEMS.map((x) => [x.id, DECLARED[x.id]?.storybook?.title ?? "Generated"])),
      // Contract namespace vs token namespace, per system. The Book needs the
      // second to decide whether a reference belongs to the system it is
      // looking at; it cannot derive it from the system id.
      tokenNsBySystem: Object.fromEntries(SYSTEMS.map((x) => [x.id, x.tokenNs ?? x.ns ?? x.id])),
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
      const watch = [...SYSTEMS.map((x) => x.dir), TOKENS, ASSETS, join(ROOT, "packages", "spectrum2", "assets"), SCHEMA, CONTRACT_SCHEMA];
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
