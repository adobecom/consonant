// matrix.ts — the State matrix story, on a bare page, for the parity shot.
//
// This page exists to be screenshotted by vite-plugin-parity.mjs. It loads
// exactly what .storybook/preview.js loads — normalize, the token CSS in the
// same order, base, the same font kits — and renders the StateMatrix story
// the Book just derived, so the pixels here are the pixels Storybook would
// produce for the same defs. Nothing else is on the page.
import "../../../.storybook/shared/normalize.css";
import "../../../dist/packages/tokens/css/dev/tokens.primitives.css";
import "../../../dist/packages/tokens/css/dev/tokens.semantic.css";
import "../../../dist/packages/tokens/css/dev/tokens.semantic.light.css";
import "../../../dist/packages/tokens/css/dev/tokens.semantic.dark.css";
import "../../../dist/packages/tokens/css/dev/tokens.responsive.sm.css";
import "../../../dist/packages/tokens/css/dev/tokens.responsive.md.css";
import "../../../dist/packages/tokens/css/dev/tokens.responsive.lg.css";
import "../../../dist/packages/tokens/css/dev/tokens.responsive.xl.css";
import "../../../.storybook/shared/base.css";
import { render } from "lit";
import { loadModule, loadWithChildren, installStorybookFonts } from "./preview";

declare global {
  interface Window { __s2aMatrix?: { status: "ready" | "error"; error?: string }; }
}

(async () => {
  try {
    const id = new URL(location.href).searchParams.get("id");
    const r = await fetch(`/__parity/bundle/${id}`);
    if (!r.ok) throw new Error(`bundle ${id}: ${r.status}`);
    const b = await r.json() as { js: string; css: string; stories: string; exportName: string; theme: string; children?: Record<string, { js: string; css: string }> };

    // The Storybook decorator, verbatim in effect.
    document.documentElement.setAttribute("data-theme", b.theme);
    document.body.style.backgroundColor = "var(--s2a-color-background-default)";
    installStorybookFonts(document);

    // The composed children, by generated name, so the parent's imports resolve.
    const kids = await loadWithChildren(b.js, (name) => b.children?.[name] ?? null);
    const style = document.createElement("style");
    style.textContent = [...kids.css, b.css].join("\n");
    document.head.appendChild(style);

    const component = await loadModule(b.js, kids.deps);
    // The stories module imports the component by relative path; point that at
    // the module just evaluated.
    const stories = await loadModule(b.stories, { [`./${b.exportName}.js`]: component.url });
    const unresolved = [...component.unresolved, ...stories.unresolved];
    if (unresolved.length) throw new Error(`could not satisfy: ${unresolved.join("; ")}`);
    const story = (stories.mod as any).StateMatrix;
    if (!story?.render) throw new Error("the stories module has no StateMatrix export — the set has no State axis");

    render(story.render(), document.getElementById("root")!);
    await document.fonts?.ready;
    window.__s2aMatrix = { status: "ready" };
  } catch (e) {
    window.__s2aMatrix = { status: "error", error: e instanceof Error ? e.message : String(e) };
  }
})();
