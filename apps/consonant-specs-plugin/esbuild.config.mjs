import { build, context } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const isWatch = process.argv.includes('--watch');

function loadEnv() {
  const env = {};
  const envPath = '.env';
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  }
  return env;
}

const env = loadEnv();
const featureDefines = {
  'FEATURE_A11Y': env.FEATURE_A11Y === 'true' ? 'true' : 'false',
};

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
  define: featureDefines,
};

function buildUiHtml() {
  mkdirSync('dist', { recursive: true });
  const html = readFileSync('src/ui.html', 'utf8');
  const css = readFileSync('src/ui.css', 'utf8');
  let js = '';
  try {
    js = readFileSync('dist/ui-bundle.js', 'utf8');
  } catch (e) {
    // ui-bundle.js may not exist yet on first build pass
  }
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
