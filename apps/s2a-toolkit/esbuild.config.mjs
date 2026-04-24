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
  const output = html
    .replace('<!-- INLINE_CSS -->', `<style>${css}</style>`)
    .replace('<!-- INLINE_JS -->', `<script>${js}</script>`);
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
