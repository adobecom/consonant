#!/usr/bin/env node
// Downloads the pinned Design Data package and the Button files the package leaves out.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const pins = JSON.parse(readFileSync(new URL('./pins.json', import.meta.url), 'utf8')).designData;
const cache = join(root, '.tmp/poc-theming', `design-data-${pins.version}`);
mkdirSync(join(cache, 'repo'), { recursive: true });

if (!existsSync(join(cache, 'package/package.json'))) {
  execFileSync('npm', ['pack', `${pins.npm}@${pins.version}`, '--silent', '--ignore-scripts'], { cwd: cache });
  const tgz = readdirSync(cache).find((f) => f.endsWith('.tgz'));
  const want = execFileSync('npm', ['view', `${pins.npm}@${pins.version}`, 'dist.integrity'], { encoding: 'utf8' }).trim();
  const got = `sha512-${createHash('sha512').update(readFileSync(join(cache, tgz))).digest('base64')}`;
  if (want !== got) throw new Error(`integrity mismatch for ${tgz}`);
  execFileSync('tar', ['xzf', tgz], { cwd: cache });
}
for (const [path, out] of [
  ['packages/design-data/relationships/button.json', 'relationships-button.json'],
  ['packages/design-data/visuals/button.json', 'visuals-button.json'],
]) {
  const target = join(cache, 'repo', out);
  if (existsSync(target)) continue;
  const res = await fetch(`https://raw.githubusercontent.com/${pins.repo}/${pins.commit}/${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  writeFileSync(target, await res.text());
}
console.log(`ready: ${cache}`);
