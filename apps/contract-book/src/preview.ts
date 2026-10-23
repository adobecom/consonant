// preview.ts — render what the Lit renderer just emitted, as it would ship.
//
// The renderer produces a real ES module as a string:
//
//   import { html, nothing } from 'lit';
//   import './Button.css';
//   import MANIFEST_X from './assets/x.js';
//   export const Button = (args) => html`...`;
//
// To run it live, the module is evaluated from a Blob URL — but a Blob URL
// has no node_modules, so the import kinds are rewritten first:
//   'lit'             -> the Book's own lit, handed over on a global
//   './X.css'         -> dropped; the CSS is injected as a <style> instead
//   './assets/X.js'   -> the bundled manifest, also via a global
//   './X.js'          -> another evaluated module, when the caller names one
//                        (the stories module importing its component)
// Nothing in the generated code itself is changed. If a future renderer
// emits an import this does not recognise, it is reported rather than
// silently stripped — a preview that quietly rendered less than the real
// thing would be worse than no preview.
import * as lit from "lit";
import { render as litRender, html, nothing } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import data from "virtual:s2a-data";

declare global {
  interface Window {
    __s2aLit?: typeof lit;
    __s2aLitDirectives?: Record<string, unknown>;
    __s2aAssets?: Record<string, unknown>;
  }
}
window.__s2aLit = lit;
window.__s2aLitDirectives = { unsafeSVG };
window.__s2aAssets = Object.fromEntries(Object.entries(data.assets).map(([name, doc]: [string, any]) => [
  name, { name: doc.name, base: doc.base, entries: doc.entries },
]));

// ── the token CSS, for a shadow root ────────────────────────────────────────
// Storybook loads the eight token files in this order and scopes themes with
// `:root[data-theme]`. Inside a shadow root `:root` matches nothing, so the
// same files are re-scoped to `:host` and the host carries data-theme. Same
// bytes, same order; only the selector moves.
const TOKEN_ORDER = [
  "tokens.primitives.css", "tokens.semantic.css", "tokens.semantic.light.css", "tokens.semantic.dark.css",
  "tokens.responsive.sm.css", "tokens.responsive.md.css", "tokens.responsive.lg.css", "tokens.responsive.xl.css",
];
const scopeToHost = (css: string) => css.replace(/:root(\[[^\]]+\])?/g, (_, attr) => (attr ? `:host(${attr})` : ":host"));
export const TOKEN_CSS_FOR_HOST = TOKEN_ORDER
  .filter((f) => data.tokenCss[f])
  .map((f) => `/* ${f} */\n${scopeToHost(data.tokenCss[f])}`)
  .join("\n");

// ── fonts, as .storybook/preview.js installs them ───────────────────────────
// Adobe Clean is Adobe-internal; Storybook loads it from the Typekit kits Milo
// uses and self-hosts the Display black weights from packages/fonts. Mirrored
// here so the preview and the parity shot set type with the same faces.
const FONT_FAMILY_OVERRIDES = `
  --s2a-font-family-adobe-clean: "Adobe Clean", adobe-clean, "Trebuchet MS", sans-serif;
  --s2a-font-family-adobe-clean-display: "Adobe Clean Display", adobe-clean-display, "Adobe Clean", adobe-clean, "Trebuchet MS", sans-serif;
`;
export function installStorybookFonts(doc: Document) {
  if (doc.querySelector('[data-s2a-fonts]')) return;
  const faces = doc.createElement("style");
  faces.setAttribute("data-s2a-fonts", "");
  faces.textContent = `
    @font-face { font-family: "adobe-clean-display"; src: url("${import.meta.env.BASE_URL}fonts/AdobeCleanDisplay-Black.otf") format("opentype"); font-weight: 900; font-style: normal; font-display: block; }
    @font-face { font-family: "adobe-clean-display"; src: url("${import.meta.env.BASE_URL}fonts/AdobeCleanDisplay-ExtraBold.otf") format("opentype"); font-weight: 800; font-style: normal; font-display: block; }
    :root { ${FONT_FAMILY_OVERRIDES} }
  `;
  doc.head.appendChild(faces);
  for (const href of [
    "https://use.typekit.net/hah7vzn.css",
    "https://use.typekit.net/mie2rub.css",
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
  ]) {
    if (doc.querySelector(`link[href="${href}"]`)) continue;
    const link = doc.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    doc.head.appendChild(link);
  }
}
installStorybookFonts(document);

// ── module loading ──────────────────────────────────────────────────────────
export interface LoadedModule {
  mod: Record<string, unknown>;
  /** The Blob URL the module was evaluated from; valid until release(). */
  url: string;
  /** Imports the module could not satisfy. Empty means the module is faithful. */
  unresolved: string[];
  release(): void;
}

function rewrite(js: string, deps: Record<string, string>): { code: string; unresolved: string[] } {
  const unresolved: string[] = [];
  let code = js;
  code = code.replace(/^import\s+\{([^}]+)\}\s+from\s+['"]lit['"];?/m, (_, names) => `const {${names}} = window.__s2aLit;`);
  code = code.replace(/^import\s+\{([^}]+)\}\s+from\s+['"]lit\/directives\/[^'"]+['"];?/gm, (_, names) => `const {${names}} = window.__s2aLitDirectives;`);
  code = code.replace(/^import\s+['"]\.\/[^'"]+\.css['"];?\s*$/gm, "");
  code = code.replace(/^import\s+(\w+)\s+from\s+['"]\.\/assets\/([^'"]+)\.js['"];?/gm, (_, ident, name) => `const ${ident} = window.__s2aAssets[${JSON.stringify(name)}];`);
  for (const [spec, url] of Object.entries(deps)) {
    code = code.replace(new RegExp(`^(import\\s+[^'"]+from\\s+)['"]${spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]`, "gm"), `$1${JSON.stringify(url)}`);
  }
  for (const m of code.matchAll(/^import\s.*$/gm)) if (!/from\s+"blob:/.test(m[0])) unresolved.push(m[0]);
  return { code, unresolved };
}

/** Evaluate an emitted module. `deps` maps a relative import to an already-loaded module's URL. */
export async function loadModule(js: string, deps: Record<string, string> = {}): Promise<LoadedModule> {
  const { code, unresolved } = rewrite(js, deps);
  const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
  try {
    const mod = await import(/* @vite-ignore */ url);
    return { mod, url, unresolved, release: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

// ── the preview ─────────────────────────────────────────────────────────────
export interface PreviewInput {
  /** The emitted component module, e.g. rendered.lit["apps/.../Button.js"]. */
  js: string;
  css: string;
  /** The export name to call, e.g. "Button". */
  exportName: string;
  /** A composed child's module by its generated name ("Button"), so the parent's `./Button.js` import resolves. */
  resolveChild?: (name: string) => { js: string; css: string } | null;
}

/** Load a module and, recursively, the generated siblings it imports. Returns the deps map and every stylesheet involved. */
export async function loadWithChildren(js: string, resolveChild: PreviewInput["resolveChild"], seen = new Map<string, string>(), css: string[] = []): Promise<{ deps: Record<string, string>; css: string[] }> {
  const deps: Record<string, string> = {};
  for (const m of js.matchAll(/^import\s+\{\s*(\w+)\s*\}\s+from\s+['"]\.\/(\w+)\.js['"];?/gm)) {
    const childName = m[2];
    if (!seen.has(childName)) {
      const child = resolveChild?.(childName);
      if (!child) continue;
      const sub = await loadWithChildren(child.js, resolveChild, seen, css);
      const loaded = await loadModule(child.js, sub.deps);
      seen.set(childName, loaded.url);
      css.push(child.css);
    }
    deps[`./${childName}.js`] = seen.get(childName)!;
  }
  return { deps, css };
}

export interface PreviewHandle {
  /** Re-render with new args without re-evaluating the module. */
  render(args: Record<string, unknown>): void;
  dispose(): void;
  /** Imports the module could not satisfy. Empty means the preview is faithful. */
  unresolved: string[];
}

export async function mountPreview(host: HTMLElement, input: PreviewInput): Promise<PreviewHandle> {
  const kids = await loadWithChildren(input.js, input.resolveChild);
  const loaded = await loadModule(input.js, kids.deps);
  loaded.release();
  const component = loaded.mod[input.exportName] as ((args: Record<string, unknown>) => unknown) | undefined;
  if (typeof component !== "function") throw new Error(`preview: the module has no export "${input.exportName}" (it has: ${Object.keys(loaded.mod).join(", ")})`);

  // Shadow root: the emitted CSS targets `.c-<slug>` and must not leak into the
  // Book's own chrome, nor be reached by it. The tokens come in with it, scoped
  // to the host, so the host's data-theme picks the theme.
  const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  const tokens = document.createElement("style");
  tokens.textContent = `${TOKEN_CSS_FOR_HOST}\n:host { ${FONT_FAMILY_OVERRIDES} color: var(--s2a-color-content-default); font-family: var(--s2a-font-family-adobe-clean, "Adobe Clean", sans-serif); }`;
  const style = document.createElement("style");
  style.textContent = [...kids.css, input.css].join("\n");
  const stage = document.createElement("div");
  stage.className = "stage";
  root.replaceChildren(tokens, style, stage);

  const draw = (args: Record<string, unknown>) => {
    try {
      litRender(component(args), stage);
    } catch (e) {
      litRender(html`<pre class="preview-error">${e instanceof Error ? e.message : String(e)}</pre>`, stage);
    }
  };
  return {
    render: draw,
    dispose: () => { litRender(nothing, stage); root.replaceChildren(); },
    unresolved: loaded.unresolved,
  };
}
