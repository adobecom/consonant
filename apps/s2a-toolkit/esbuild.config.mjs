import { build, context } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const isWatch = process.argv.includes('--watch');

const codeConfig = {
  entryPoints: ['src/code.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  format: 'cjs',
  target: 'es2017',
  sourcemap: false,
};

const uiConfig = {
  entryPoints: ['src/ui.ts'],
  bundle: true,
  outfile: 'dist/ui-bundle.js',
  format: 'iife',
  target: 'es2017',
  sourcemap: false,
};

function buildUiHtml() {
  mkdirSync('dist', { recursive: true });
  const html = readFileSync('src/ui.html', 'utf8');
  const css = readFileSync('src/ui.css', 'utf8');
  let js = '';
  try { js = readFileSync('dist/ui-bundle.js', 'utf8'); } catch {}
  // Pass a FUNCTION to replace, never a string. In a string replacement the
  // sequences $&, $`, $' and $$ are substitution patterns, so any bundle that
  // happens to contain one rewrites the page at build time — CodeMirror ships a
  // doc comment explaining those very patterns, and that comment spliced the
  // whole document head, CSS and all, into the <script>. A replacer function is
  // never interpreted.
  //
  // And a literal </script anywhere in the bundle would close the tag early, so
  // break it up; the browser sees the same string either way.
  const safeJs = js.replace(/<\/(script)/gi, '<\\/$1');
  const output = html
    .replace('<!-- INLINE_CSS -->', () => `<style>${css}</style>`)
    .replace('<!-- INLINE_JS -->', () => `<script>${safeJs}</script>`);

  // A build that silently produces a broken page is worse than one that fails.
  // Check the document SHELL only: the bundle legitimately contains the string
  // "<style>" (CodeMirror builds style elements), so counting across the whole
  // file reports a false positive.
  const at = output.indexOf('<script>');
  if (at === -1) throw new Error('ui.html has no <script> — the JS was not inlined');
  const shell = output.slice(0, at);
  const opens = (shell.match(/<style>/g) ?? []).length;
  const closes = (shell.match(/<\/style>/g) ?? []).length;
  if (opens !== closes) throw new Error(`ui.html is malformed: ${opens} <style> vs ${closes} </style> before the script — a replacement was interpreted`);
  // The CSS belongs in the shell; finding it inside the script is the exact
  // symptom of a replacement pattern having spliced the document into itself.
  if (output.slice(at).includes('--bg:')) throw new Error('ui.html is malformed: CSS ended up inside the <script>');

  writeFileSync('dist/ui.html', output);
}

async function run() {
  if (isWatch) {
    const codeCtx = await context(codeConfig);
    const uiCtx = await context({
      ...uiConfig,
      plugins: [{ name: 'rebuild-html', setup(build) { build.onEnd(() => buildUiHtml()); } }],
    });
    await codeCtx.watch();
    await uiCtx.watch();
    console.log('Watching for changes...');
  } else {
    await build(codeConfig);
    await build(uiConfig);
    buildUiHtml();
    console.log('Build complete.');
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
