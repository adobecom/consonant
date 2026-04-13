import { build, context } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname);

const isWatch = process.argv.includes('--watch');

const codeConfig = {
  entryPoints: [resolve(root, 'src/code.ts')],
  bundle: true,
  outfile: resolve(root, 'dist/code.js'),
  format: 'cjs',
  target: 'es2017',
  sourcemap: false,
};

const uiConfig = {
  entryPoints: [resolve(root, 'src/ui.ts')],
  bundle: true,
  outfile: resolve(root, 'dist/ui-bundle.js'),
  format: 'iife',
  target: 'es2017',
  sourcemap: false,
};

function buildUiHtml() {
  mkdirSync(resolve(root, 'dist'), { recursive: true });
  const html = readFileSync(resolve(root, 'src/ui.html'), 'utf8');
  const css = readFileSync(resolve(root, 'src/ui.css'), 'utf8');
  let js = '';
  try {
    js = readFileSync(resolve(root, 'dist/ui-bundle.js'), 'utf8');
  } catch (e) {
    // ui-bundle.js may not exist yet on first build pass
  }
  const output = html
    .replace('<!-- INLINE_CSS -->', `<style>${css}</style>`)
    .replace('<!-- INLINE_JS -->', `<script>${js}</script>`);
  writeFileSync(resolve(root, 'dist/ui.html'), output);
}

async function run() {
  if (isWatch) {
    const codeCtx = await context(codeConfig);
    const uiCtx = await context({
      ...uiConfig,
      plugins: [{
        name: 'rebuild-html',
        setup(build) {
          build.onEnd(() => buildUiHtml());
        },
      }],
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

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
