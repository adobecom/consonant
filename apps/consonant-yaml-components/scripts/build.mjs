import { build } from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../../..');
const pluginRoot = path.join(workspaceRoot, 'apps', 'consonant-yaml-components');
const distDir = path.join(workspaceRoot, 'dist', 'apps', 'consonant-yaml-components');
const srcDir = path.join(pluginRoot, 'src');

async function main() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  await build({
    entryPoints: [path.join(srcDir, 'code.ts')],
    outfile: path.join(distDir, 'code.js'),
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: ['es2017'],
    sourcemap: true,
    loader: {
      '.yaml': 'text',
      '.yml': 'text',
      '.html': 'text'
    }
  });

  await Promise.all([
    fs.copyFile(path.join(pluginRoot, 'manifest.json'), path.join(distDir, 'manifest.json')),
    fs.copyFile(path.join(srcDir, 'ui.html'), path.join(distDir, 'ui.html'))
  ]);
}

main().catch(error => {
  console.error('Figma plugin build failed.');
  console.error(error);
  process.exitCode = 1;
});
