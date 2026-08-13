#!/usr/bin/env node
/**
 * Figma → Story companion server  (port 4002)
 *
 * POST /figma/generate  { figmaUrl, prompt? }
 *   1. Parses Figma URL → fileKey + nodeId
 *   2. Fetches a PNG screenshot via Figma Images REST API
 *   3. Loads S2A guardrails from Story UI (/story-ui/considerations)
 *   4. Posts to Story UI's stream endpoint with vision mode ON
 *   5. Returns the completed story + fileName
 *
 * GET /figma/info  ?url=<figmaUrl>
 *   Returns { fileKey, nodeId, fileName, component } — useful for debugging
 *
 * Serves a simple HTML chat UI at /
 */

import http from 'http';
import https from 'https';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { tmpdir, homedir } from 'os';
import { WebSocket } from 'ws';
import { globSync } from '/Users/mhuntsberry/Desktop/consonant-2/node_modules/glob/dist/esm/index.js';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const ROOT        = resolve(__dirname, '..', '..', '..');
const PORT        = 4002;
const STORY_UI    = 'http://localhost:4001';
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN || process.env.FIGMA_REST_API || '';
const STORIES_DIR = resolve(ROOT, 'apps/storybook/stories/generated');
const STORIES_REL  = join('apps', 'storybook', 'stories', 'generated');
const TOOLKIT_DIR  = join(homedir(), '.s2a-toolkit');
const THREADS_FILE = join(TOOLKIT_DIR, 'threads.json');
const ASSETS_DIR   = join(TOOLKIT_DIR, 'assets');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Figma URL parser ──────────────────────────────────────────────────────────

function parseFigmaUrl(url) {
  const urlObj = new URL(url);
  const branchPathMatch = urlObj.pathname.match(/\/(?:design|file|board|slides)\/([a-zA-Z0-9]+)\/branch\/([a-zA-Z0-9]+)/);
  const fileMatch = urlObj.pathname.match(/\/(?:design|file|board|slides)\/([a-zA-Z0-9]+)/);
  if (!fileMatch) throw new Error('Not a valid Figma URL — must contain /design/, /file/, /board/, or /slides/');
  const mainFileKey = fileMatch[1];
  const branchKey = branchPathMatch?.[2] || urlObj.searchParams.get('branch-id') || null;
  const fileKey = branchKey || mainFileKey;
  const nodeParam = urlObj.searchParams.get('node-id');
  const nodeId = nodeParam ? nodeParam.replace(/-/g, ':') : null;
  return { fileKey, mainFileKey, branchKey, nodeId };
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

async function getJson(url, headers = {}) {
  const r = await get(url, headers);
  return JSON.parse(r.body.toString());
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u    = new URL(url);
    const mod  = url.startsWith('https') ? https : http;
    const req  = mod.request({
      hostname: u.hostname, port: u.port || (url.startsWith('https') ? 443 : 80),
      path: u.pathname + u.search, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Figma helpers ─────────────────────────────────────────────────────────────

async function fetchFigmaScreenshot(fileKey, nodeId) {
  if (!FIGMA_TOKEN) throw new Error('FIGMA_ACCESS_TOKEN not set in .env');
  const idsParam = encodeURIComponent(nodeId || '');
  // Use JPEG at 1x — produces ~200-400KB vs 4.5MB for PNG at 2x
  const url = nodeId
    ? `https://api.figma.com/v1/images/${fileKey}?ids=${idsParam}&format=jpg&scale=1`
    : `https://api.figma.com/v1/images/${fileKey}?format=jpg&scale=1`;
  const data = await getJson(url, { 'X-Figma-Token': FIGMA_TOKEN });
  if (data.err) throw new Error('Figma API error: ' + data.err);
  const imageUrl = nodeId ? Object.values(data.images || {})[0] : data.images?.[nodeId];
  if (!imageUrl) throw new Error('Figma returned no image URL for that node');
  const img = await get(imageUrl);
  return { base64: img.body.toString('base64'), mediaType: 'image/jpeg' };
}

async function fetchFigmaNodeName(fileKey, nodeId) {
  if (!FIGMA_TOKEN || !nodeId) return null;
  try {
    const url  = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`;
    const data = await getJson(url, { 'X-Figma-Token': FIGMA_TOKEN });
    const node = data.nodes?.[nodeId]?.document;
    return node?.name || null;
  } catch { return null; }
}

// ── Thread storage ────────────────────────────────────────────────────────────

function loadThreads() {
  try {
    mkdirSync(TOOLKIT_DIR, { recursive: true });
    if (!existsSync(THREADS_FILE)) return [];
    return JSON.parse(readFileSync(THREADS_FILE, 'utf8'));
  } catch { return []; }
}

function saveThreads(threads) {
  mkdirSync(TOOLKIT_DIR, { recursive: true });
  writeFileSync(THREADS_FILE, JSON.stringify(threads, null, 2), 'utf8');
}

// ── Image export via Desktop Bridge ──────────────────────────────────────────

async function exportNodeAsBase64(nodeId, fileKey) {
  if (fileKey) {
    const cacheDir  = join(ASSETS_DIR, fileKey);
    const cachePath = join(cacheDir, nodeId.replace(/:/g, '-') + '.png');
    if (existsSync(cachePath)) {
      console.log(`[image] cache hit: ${cachePath}`);
      return readFileSync(cachePath).toString('base64');
    }
  }
  const code = `(async () => {
  await figma.loadAllPagesAsync();
  const node = await figma.getNodeByIdAsync(${JSON.stringify(nodeId)});
  if (!node) return null;
  try {
    const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
    let bin = '';
    for (let i = 0; i < bytes.length; i += 8192)
      bin += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + 8192, bytes.length)));
    return { base64: btoa(bin) };
  } catch (e) { return { error: e.message }; }
})();`;
  const result = await figmaExecute(code, 8000);
  const b64 = result?.base64;
  if (!b64) return null;
  if (fileKey) {
    const cacheDir = join(ASSETS_DIR, fileKey);
    mkdirSync(cacheDir, { recursive: true });
    const cachePath = join(cacheDir, nodeId.replace(/:/g, '-') + '.png');
    writeFileSync(cachePath, Buffer.from(b64, 'base64'));
    console.log(`[image] cached ${Math.round(b64.length / 1024)}KB → ${cachePath}`);
  }
  return b64;
}

// ── Story UI helpers ──────────────────────────────────────────────────────────

async function getConsiderations() {
  try {
    const r = await get(`${STORY_UI}/story-ui/considerations`);
    const d = JSON.parse(r.body.toString());
    return d.considerations || '';
  } catch { return ''; }
}

// ── Figma Desktop Bridge (figma-console-mcp WebSocket) ───────────────────────

/** Discover active figma-console-mcp WebSocket port from /tmp port files */
function discoverBridgePort() {
  const tmp = tmpdir();
  try {
    const files = readdirSync(tmp).filter(f => f.startsWith('figma-console-mcp-') && f.endsWith('.json'));
    for (const f of files) {
      try {
        const data = JSON.parse(readFileSync(resolve(tmp, f), 'utf8'));
        if (data.port) return data.port;
      } catch {}
    }
  } catch {}
  return 9223; // default
}

/**
 * Execute JavaScript inside Figma via the Desktop Bridge WebSocket.
 * Requires Figma Desktop app open with figma-desktop-bridge plugin running.
 */
function figmaExecute(code, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const port = discoverBridgePort();
    const ws = new WebSocket(`ws://localhost:${port}`);
    const id = `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) { settled = true; ws.terminate(); reject(new Error(`figmaExecute timed out after ${timeoutMs}ms`)); }
    }, timeoutMs + 3000);

    ws.on('open', () => {
      ws.send(JSON.stringify({ id, method: 'EXECUTE_CODE', params: { code, timeout: timeoutMs } }));
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.id === id) {
          clearTimeout(timer);
          settled = true;
          ws.close();
          if (msg.error) reject(new Error(msg.error));
          else resolve(msg.result);
        }
      } catch {}
    });

    ws.on('error', (err) => {
      if (!settled) { settled = true; clearTimeout(timer); reject(new Error(`Desktop Bridge not reachable on port ${port}: ${err.message}`)); }
    });
  });
}

/** Deep structural extraction from a Figma frame node */
async function extractFigmaStructure(nodeId) {
  const code = `
(async () => {
  await figma.loadAllPagesAsync();
  const node = await figma.getNodeByIdAsync(${JSON.stringify(nodeId)});
  if (!node) return { error: 'Node not found: ' + ${JSON.stringify(nodeId)} };

  async function resolveVar(id) {
    try { const v = await figma.variables.getVariableByIdAsync(id); return v ? v.name : id; } catch { return id; }
  }
  function collectBoundIds(bv) {
    const out = [];
    for (const [prop, val] of Object.entries(bv ?? {})) {
      if (Array.isArray(val)) val.forEach(x => x?.id && out.push({ prop, id: x.id }));
      else if (val?.id) out.push({ prop, id: val.id });
    }
    return out;
  }

  const allNodes = node.findAll(() => true);

  // 1. INSTANCE nodes — real components
  const instances = [];
  for (const n of allNodes.filter(n => n.type === 'INSTANCE')) {
    const compSet = n.mainComponent?.parent;
    const boundIds = collectBoundIds(n.boundVariables ?? {});
    const resolvedTokens = await Promise.all(
      boundIds.map(async ({ prop, id }) => ({ prop, name: await resolveVar(id) }))
    );
    const exposedProps = {};
    for (const [k, v] of Object.entries(n.componentProperties ?? {})) {
      exposedProps[k] = v.value ?? v;
    }
    instances.push({
      layerName: n.name,
      componentSet: compSet?.type === 'COMPONENT_SET' ? compSet.name : null,
      variant: n.mainComponent?.name ?? null,
      exposedProps,
      boundTokens: resolvedTokens,
      x: n.x, y: n.y, width: n.width, height: n.height,
    });
  }

  // 2. TEXT nodes — typography + color
  const textStyles = await figma.getLocalTextStylesAsync();
  const styleIdToName = Object.fromEntries(textStyles.map(s => [s.id, s.name]));
  const textNodes = [];
  for (const n of allNodes.filter(n => n.type === 'TEXT')) {
    const fillIds = (n.boundVariables?.fills ?? []).map(f => f?.id).filter(Boolean);
    const resolvedFills = await Promise.all(fillIds.map(id => resolveVar(id)));
    textNodes.push({
      layerName: n.name,
      characters: (n.characters ?? '').slice(0, 120),
      textStyle: styleIdToName[n.textStyleId] ?? null,
      boundFillTokens: resolvedFills,
      y: n.y,
    });
  }

  // 3. Frame containers — fills + spacing tokens
  const containers = [];
  for (const n of allNodes.filter(n => ['FRAME','COMPONENT'].includes(n.type))) {
    const fillIds = (n.boundVariables?.fills ?? []).map(f => f?.id).filter(Boolean);
    const spacingKeys = ['paddingTop','paddingBottom','paddingLeft','paddingRight','itemSpacing'];
    const spacingIds = spacingKeys.map(k => ({ k, id: n.boundVariables?.[k]?.id })).filter(x => x.id);
    if (!fillIds.length && !spacingIds.length) continue;
    const resolvedFills = await Promise.all(fillIds.map(id => resolveVar(id)));
    const resolvedSpacing = await Promise.all(
      spacingIds.map(async ({ k, id }) => ({ prop: k, name: await resolveVar(id) }))
    );
    containers.push({
      layerName: n.name,
      boundFillTokens: resolvedFills,
      boundSpacingTokens: resolvedSpacing,
      layoutMode: n.layoutMode,
    });
  }

  return {
    frameName: node.name,
    frameWidth: node.width,
    frameHeight: node.height,
    instances,
    textNodes: textNodes.sort((a, b) => a.y - b.y),
    containers: containers.slice(0, 20),
  };
})();
`;
  return figmaExecute(code, 8000);
}

/** Calls Story UI's stream endpoint, collects all chunks, returns final result */
async function generateViaStoryUI({ prompt, imageBase64, mediaType = 'image/png', considerations = buildLiveContext() }) {
  const body = {
    prompt,
    visionMode: true,
    images: [`data:${mediaType};base64,${imageBase64}`],
    considerations,
    framework: 'web-components',
    autoDetectFramework: false,
  };
  const r = await post(`${STORY_UI}/story-ui/generate-story-stream`, body);

  // Stream response is newline-delimited JSON events
  let story = null, fileName = null, title = null, error = null;
  for (const line of r.body.split('\n')) {
    if (!line.trim()) continue;
    try {
      const ev = JSON.parse(line);
      if (ev.type === 'story_complete' || ev.type === 'complete') {
        story    = ev.story    || ev.data?.story    || story;
        fileName = ev.fileName || ev.data?.fileName || fileName;
        title    = ev.title    || ev.data?.title    || title;
      }
      if (ev.type === 'error') error = ev.message || ev.error || 'Generation failed';
    } catch {}
  }
  if (error) throw new Error(error);
  return { story, fileName, title };
}

/** Convert S2A variable name to CSS custom property: s2a/color/background/knockout → --s2a-color-background-knockout */
function cssVar(name) {
  if (!name || name.startsWith('VariableID:')) return name; // unresolved
  return '--' + name.replace(/\//g, '-');
}

// ── Live design system context (read from actual source files) ────────────────

function extractCssVars(css, prefix) {
  const map = {};
  for (const m of css.matchAll(/--s2a-([\w-]+):\s*([^;]+);/g)) {
    const key = `--s2a-${m[1]}`;
    if (!prefix || key.startsWith(prefix)) map[key] = m[2].trim();
  }
  return map;
}

function resolveOneLevel(val, primitives) {
  const m = val.match(/^var\((--s2a-[\w-]+)(?:,\s*([^)]+))?\)/);
  if (!m) return val;
  return primitives[m[1]] ?? m[2] ?? val;
}

function loadTokenRegistry() {
  const semanticCss  = readFileSync(resolve(ROOT, 'dist/packages/tokens/css/dev/tokens.semantic.css'), 'utf8');
  const lightCss     = (() => { try { return readFileSync(resolve(ROOT, 'dist/packages/tokens/css/dev/tokens.semantic.light.css'), 'utf8'); } catch { return ''; } })();
  const primitiveCss = readFileSync(resolve(ROOT, 'dist/packages/tokens/css/dev/tokens.primitives.css'), 'utf8');
  const primitives   = extractCssVars(primitiveCss);
  const semantic     = { ...extractCssVars(semanticCss), ...extractCssVars(lightCss) };
  // Resolve one level of var() using primitives
  const resolved = {};
  for (const [k, v] of Object.entries(semantic)) {
    resolved[k] = resolveOneLevel(v, primitives);
  }
  return resolved;
}

function loadComponentRegistry() {
  const specFiles = globSync('packages/components/src/**/*.spec.json', { cwd: ROOT });
  const components = [];
  for (const file of specFiles) {
    try {
      const spec = JSON.parse(readFileSync(resolve(ROOT, file), 'utf8'));
      // Derive import path from the spec file location
      const dir = dirname(file); // e.g. packages/components/src/button
      const importPath = `../../../../${dir}/index.js`;
      components.push({ spec, importPath, file });
    } catch {}
  }
  return components;
}

/**
 * Build a complete, ground-truth design system context string from actual source files.
 * This replaces the static markdown considerations file.
 */
function buildLiveContext() {
  let tokens, components;
  try { tokens = loadTokenRegistry(); } catch (e) { tokens = {}; console.warn('[context] token load failed:', e.message); }
  try { components = loadComponentRegistry(); } catch (e) { components = []; console.warn('[context] component load failed:', e.message); }

  const grouped = {
    background: [],
    content: [],
    border: [],
    spacing: [],
    fontSize: [],
    fontWeight: [],
    fontFamily: [],
    lineHeight: [],
    borderRadius: [],
  };

  for (const [k, v] of Object.entries(tokens)) {
    if (k.includes('-background-'))   grouped.background.push([k, v]);
    else if (k.includes('-content-')) grouped.content.push([k, v]);
    else if (k.includes('-border-radius-')) grouped.borderRadius.push([k, v]);
    else if (k.includes('-border-'))  grouped.border.push([k, v]);
    else if (k.includes('-spacing-') && !k.includes('-font-')) grouped.spacing.push([k, v]);
    else if (k.match(/--s2a-font-size-[a-z]/)) grouped.fontSize.push([k, v]);
    else if (k.includes('-font-weight-') && !k.includes('adobe-clean')) grouped.fontWeight.push([k, v]);
    else if (k.includes('-font-family-') && !k.includes('adobe-clean') && !k.includes('display')) grouped.fontFamily.push([k, v]);
    else if (k.match(/--s2a-font-line-height-[a-z]/)) grouped.lineHeight.push([k, v]);
  }

  function tokenTable(pairs) {
    return pairs.map(([k, v]) => `  ${k}: ${v}`).join('\n');
  }

  const componentDocs = components.map(({ spec, importPath }) => {
    const props = (spec.props || [])
      .filter(p => !p.deprecated)
      .map(p => {
        const enumStr = p.enum ? ` (${p.enum.map(v => `"${v}"`).join(' | ')})` : '';
        const def = p.defaultValue ? ` = ${p.defaultValue}` : '';
        return `    ${p.name}${def}${enumStr} — ${p.description || p.type || ''}`;
      }).join('\n');
    const forbidden = (spec.forbiddenCombinations || []).map(c =>
      '  ⚠ FORBIDDEN: ' + Object.entries(c).map(([k,v]) => `${k}="${v}"`).join(' + ')
    ).join('\n');
    return [
      `### ${spec.name}`,
      `import { ${spec.name} } from '${importPath}';`,
      `// ${spec.description || ''}`,
      `// Props:`,
      props,
      forbidden || '',
    ].filter(Boolean).join('\n');
  }).join('\n\n');

  return `# S2A Design System — Ground Truth Context

CRITICAL: Only use token names and component props from this document. Never invent names.

---

## Available Components

${componentDocs}

---

## Token Registry — ONLY these names are valid

### Background colors
${tokenTable(grouped.background)}

### Content (text) colors
${tokenTable(grouped.content)}

### Border colors
${tokenTable(grouped.border)}

### Spacing
${tokenTable(grouped.spacing)}

### Font sizes
${tokenTable(grouped.fontSize)}

### Font weights
${tokenTable(grouped.fontWeight)}

### Font families
${tokenTable(grouped.fontFamily)}

### Line heights
${tokenTable(grouped.lineHeight)}

### Border radius
${tokenTable(grouped.borderRadius)}

---

## Rules

1. Import components from the exact paths above. Call as functions: \`\${Button({ label: 'Go' })}\`
2. NEVER use custom element tags: no \`<s2a-button>\`, no \`<product-lockup>\`
3. ONLY use token names from the registry above — never invent a name
4. Always include fallback: \`var(--s2a-spacing-lg, 24px)\`
5. Dark background = \`--s2a-color-background-knockout\`. Text on dark = \`--s2a-color-content-knockout\`
6. For layout inline styles: use spacing tokens for padding/gap, background tokens for fills
7. For text nodes: set color (content token) + font-size (font-size token) + font-weight (font-weight token)
`;
}

// ── Claude CLI generation (web session auth — no API key needed) ──────────────

const CLAUDE_BIN = (() => {
  for (const p of [
    '/Users/mhuntsberry/.local/bin/claude',
    '/usr/local/bin/claude',
    process.env.CLAUDE_BIN,
  ]) { if (p && existsSync(p)) return p; }
  return 'claude';
})();

// Minimal env for `claude --print` subprocess.
// - No CLAUDE_CODE_SSE_PORT: that would connect the child to the parent Claude Code session
//   and give it access to Write/Bash tools, causing it to ask for approval before writing.
// - No CLAUDECODE=1: that switches claude into full agent mode.
// Auth falls back to local keychain / ~/.claude config which works fine on macOS.
function claudeEnv() {
  return {
    HOME:   process.env.HOME,
    USER:   process.env.USER,
    TMPDIR: process.env.TMPDIR || '/tmp',
    PATH:   `${process.env.PATH}:/Users/mhuntsberry/.local/bin`,
  };
}

async function generateWithCLI(fullPrompt) {
  return new Promise((resolve, reject) => {
    const proc = spawn(CLAUDE_BIN, ['--print'], {
      cwd: ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: claudeEnv(),
    });
    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error('claude CLI timed out after 180s'));
    }, 180000);
    proc.stdout.on('data', d => { out += d; });
    proc.stderr.on('data', d => { err += d; });
    proc.on('close', code => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`claude exited ${code}: ${err.slice(0, 300)}`));
        return;
      }
      resolve(out.trim());
    });
    proc.on('error', e => {
      clearTimeout(timer);
      reject(new Error(`Failed to run claude CLI: ${e.message}`));
    });

    proc.stdin.write(fullPrompt);
    proc.stdin.end();
  });
}

// ── Direct Claude generation ──────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert Storybook story author for the S2A design system.
You write Lit web component stories that use S2A component functions and design tokens.

HARD RULES — violation means the story is wrong:
1. Import components from the exact paths in the context. Call as JS functions inside html\`\`.
2. NEVER write custom HTML elements like <s2a-button> or <product-lockup>.
3. ONLY use token names that appear in the Token Registry below. No invented names.
4. Every var() must have a fallback: var(--s2a-color-background-knockout, #000)
5. Dark surface = var(--s2a-color-background-knockout, #000). Text on dark = var(--s2a-color-content-knockout, #fff)
6. For text nodes use color + font-size + font-weight from the token registry. No other font properties.
7. Output ONLY the story file contents — start your response immediately with "import" and end with the closing backtick of the last export. No explanation, no markdown fences, no commentary before or after.
8. The file must be valid ES module syntax importable by Vite/Storybook.
9. Always include at least one complete export const story = () => html\`...\` with real content — never stop at just the default export metadata.`;

/**
 * Generate a Storybook story directly via Claude CLI (web session auth, with MCP access).
 * Uses the live design system context (spec.json + compiled CSS) as ground truth.
 * When figmaStructure is present (from Desktop Bridge), uses extracted component data.
 * When figmaUrl is present and bridge is unavailable, tells Claude to use figma_execute itself.
 */
async function generateStory({ prompt, figmaStructure, figmaUrl }) {
  const dsContext = buildLiveContext();

  let userText = `${dsContext}\n\n---\n\n`;

  if (figmaStructure) {
    userText += `## Figma Frame Structure\n\nFrame: "${figmaStructure.frameName}" (${figmaStructure.frameWidth}×${figmaStructure.frameHeight}px)\n\n`;

    if (figmaStructure.instances?.length) {
      userText += `### Component instances found (use these S2A components)\n`;
      for (const inst of figmaStructure.instances) {
        userText += `- componentSet: "${inst.componentSet}" | variant: "${inst.variant}" | props: ${JSON.stringify(inst.exposedProps)} | y:${inst.y}\n`;
        if (inst.boundTokens?.length) {
          userText += `  bound tokens: ${inst.boundTokens.map(t => `${t.prop}→${cssVar(t.name)}`).join(', ')}\n`;
        }
      }
    }
    if (figmaStructure.textNodes?.length) {
      userText += `\n### Text content (in layout order)\n`;
      for (const t of figmaStructure.textNodes) {
        userText += `- "${t.characters}" | style:${t.textStyle || 'none'} | color tokens:${(t.boundFillTokens||[]).map(cssVar).join(',') || 'unknown'}\n`;
      }
    }
    if (figmaStructure.containers?.length) {
      userText += `\n### Container tokens\n`;
      for (const c of figmaStructure.containers) {
        const fills = c.boundFillTokens.map(cssVar).join(', ');
        const spacing = c.boundSpacingTokens.map(t => `${t.prop}:${cssVar(t.name)}`).join(', ');
        userText += `- "${c.layerName}": fills=[${fills}] spacing=[${spacing}]\n`;
      }
    }
    userText += '\n';
  }

  // When bridge data isn't available, include the Figma URL for context.
  // Claude generates from the frame name, URL context, and S2A library knowledge.
  if (!figmaStructure && figmaUrl) {
    userText += `## Figma Source\n\nFigma URL: ${figmaUrl}\n\nNo structural extraction was available. Generate a representative S2A story based on the frame name and your knowledge of S2A components.\n\n`;
  }

  userText += `## Task\n\n${prompt}\n\nWrite the complete Storybook story file now. Begin your response immediately with the import statements. Do not add any text before "import" or after the final closing backtick of the last export.`;

  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${userText}`;
  let story = await generateWithCLI(fullPrompt);
  // Strip markdown fences
  story = story.replace(/^```[\w]*\n?/m, '').replace(/\n?```\s*$/m, '').trim();

  // Strip any leading prose lines before the first JS code line (import/export/const/function//).
  // Claude sometimes prepends a brief explanation when it wanted to write a file but couldn't.
  const codeStart = story.search(/^(import |export |const |function |\/\/)/m);
  if (codeStart > 0) story = story.slice(codeStart).trim();

  // Validate: output must look like JS
  const looksLikeCode = story.includes('export') || story.includes('import') || story.includes('const ') || story.includes('function ');
  if (!looksLikeCode) {
    throw new Error(`Claude returned a non-code response: "${story.slice(0, 120).replace(/\n/g, ' ')}"`);
  }

  // Derive file name from the title in the story
  const titleMatch = story.match(/title:\s*['"`]([^'"`]+)['"`]/);
  const titleSlug  = titleMatch
    ? titleMatch[1].replace(/\//g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
    : `story-${Date.now()}`;
  const fileName = `${titleSlug}.stories.js`;

  // Write to disk
  mkdirSync(STORIES_DIR, { recursive: true });
  writeFileSync(resolve(STORIES_DIR, fileName), story, 'utf8');
  console.log(`[story] written → ${fileName}`);

  // Extract title for display
  const title = titleMatch?.[1] || fileName;

  return { story, fileName, title };
}

// ── Async job queue ───────────────────────────────────────────────────────────
// Keeps jobs in memory (local dev server — no persistence needed).

const jobs = new Map(); // jobId → { status, phase, result, error }

function createJob() {
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  jobs.set(id, { id, status: 'pending', phase: 'Queued', result: null, error: null, createdAt: Date.now() });
  // Clean old jobs after 30 min
  setTimeout(() => jobs.delete(id), 30 * 60 * 1000);
  return id;
}

function updateJob(id, patch) {
  const job = jobs.get(id);
  if (job) Object.assign(job, patch);
}

// ── Git helpers + plugin prototype generation ─────────────────────────────────

function git(args) {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', timeout: 30000 });
  return { ok: r.status === 0, stdout: r.stdout.trim(), stderr: r.stderr.trim() };
}

function makeWorktreeGit(worktreeDir) {
  return function(args) {
    const r = spawnSync('git', args, { cwd: worktreeDir, encoding: 'utf8', timeout: 30000 });
    return { ok: r.status === 0, stdout: r.stdout.trim(), stderr: r.stderr.trim() };
  };
}

function toSlug(name) {
  return name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
}

function toPascal(name) {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function listPrototypeBranches() {
  const current = git(['branch', '--show-current']).stdout;
  const all = git(['branch', '-a', '--format=%(refname:short)']).stdout.split('\n').filter(Boolean);
  const proto = [...new Set(
    all.map(b => b.replace(/^origin\//, '')).filter(b => b.startsWith('figma-prototype/'))
  )].sort().reverse();
  return { current, prototypeBranches: proto };
}

function buildPRBody({ frameName, prompt, storyFileRelative, checks, branchName }) {
  const c = (ok, label) => (ok ? 'OK' : 'WARN') + ' ' + label;
  return `## Generated from Figma

| | |
|---|---|
| **Frame** | ${frameName} |
| **Generated by** | S2A Toolkit |
${prompt ? `| **Intent** | ${prompt} |\n` : ''}
## What changed

- Added \`${storyFileRelative}\`
- Branch: \`${branchName}\`

## Validation

- ${c(checks.lint, 'Lint')}
- ${c(checks.typecheck, 'Typecheck')}

---
Generated with S2A Toolkit`;
}

async function generatePrototypeFromPlugin({ selection, prompt, branchOverride, onPhase = () => {} }) {
  const frameName = (selection.name || 'Untitled').trim();
  const slug      = toSlug(frameName);
  const pascal    = toPascal(frameName);
  const date      = new Date().toISOString().split('T')[0];
  const branch    = (branchOverride || `figma-prototype/${slug}-${date}`).trim();
  const fileName  = `${pascal}.stories.js`;
  const relPath   = join(STORIES_REL, fileName);

  const nodeId  = selection.id    || null;
  const fileKey = selection.fileKey || null;

  // Deep structural extraction via Desktop Bridge (fails silently — plugin already sent data)
  let figmaStructure = null;
  if (nodeId) {
    onPhase('Reading Figma frame…');
    try {
      const s = await extractFigmaStructure(nodeId);
      if (s && !s.error) figmaStructure = s;
    } catch (e) {
      console.warn('[plugin→story] deep extraction failed:', e.message);
    }
    if (figmaStructure) console.log(`[plugin→story] deep: ${figmaStructure.instances?.length} instances, ${figmaStructure.textNodes?.length} text nodes`);
  }

  // Build structured context for Claude
  const dsContext = buildLiveContext();
  let structureText = '';

  if (figmaStructure) {
    structureText = `\n## Figma Frame: "${frameName}" (${figmaStructure.frameWidth}×${figmaStructure.frameHeight}px)\n`;
    if (figmaStructure.instances?.length) {
      structureText += '\n### S2A component instances\n';
      for (const inst of figmaStructure.instances) {
        structureText += `- componentSet: "${inst.componentSet}" | variant: "${inst.variant}" | props: ${JSON.stringify(inst.exposedProps)} | y:${inst.y}\n`;
        if (inst.boundTokens?.length)
          structureText += `  tokens: ${inst.boundTokens.map(t => `${t.prop}→${cssVar(t.name)}`).join(', ')}\n`;
      }
    }
    if (figmaStructure.textNodes?.length) {
      structureText += '\n### Text content (top to bottom)\n';
      for (const t of figmaStructure.textNodes)
        structureText += `- "${t.characters}" | style:${t.textStyle || 'none'} | color:${(t.boundFillTokens||[]).map(cssVar).join(',') || 'unknown'}\n`;
    }
    if (figmaStructure.containers?.length) {
      structureText += '\n### Container tokens\n';
      for (const c of figmaStructure.containers.slice(0, 10)) {
        const fills = (c.boundFillTokens||[]).map(cssVar).join(', ');
        const sp    = (c.boundSpacingTokens||[]).map(t => `${t.prop}:${cssVar(t.name)}`).join(', ');
        structureText += `- "${c.layerName}": fills=[${fills}] spacing=[${sp}]\n`;
      }
    }
  } else if (selection.children?.length) {
    structureText = '\n## Frame children\n';
    for (const child of (selection.children || []).slice(0, 20)) {
      structureText += `- "${child.name}" (type: ${child.type})\n`;
      for (const grandchild of (child.children || []).slice(0, 10))
        structureText += `  - "${grandchild.name}" (type: ${grandchild.type})\n`;
    }
  }

  const userText = `${dsContext}

---
${structureText}
## Task

${prompt || `Generate an S2A Storybook story for the Figma frame "${frameName}". Use S2A components and semantic tokens.`}

Write the complete Storybook story file now. Use title: "Prototypes/Generated/${pascal}".`;

  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${userText}`;
  onPhase('Generating story with Claude…');
  console.log(`[plugin→story] calling claude CLI for "${frameName}"...`);
  let story = await generateWithCLI(fullPrompt);
  story = story.replace(/^```[\w]*\n?/m, '').replace(/\n?```\s*$/m, '').trim();

  const looksLikeCode = story.includes('export') || story.includes('import') || story.includes('const ') || story.includes('function ');
  if (!looksLikeCode) throw new Error(`Claude returned a non-code response: "${story.slice(0, 120).replace(/\n/g, ' ')}"`);

  // Write to live checkout so Storybook hot-reloads
  mkdirSync(STORIES_DIR, { recursive: true });
  writeFileSync(resolve(STORIES_DIR, fileName), story, 'utf8');
  console.log(`[plugin→story] written → ${fileName}`);

  onPhase('Creating branch and PR…');
  // Git worktree workflow
  git(['fetch', 'origin', 'main']);
  const currentBranch = git(['branch', '--show-current']).stdout;
  const localExists   = git(['branch', '--list', branch]).stdout.length > 0;
  const remoteExists  = git(['branch', '-r', '--list', `origin/${branch}`]).stdout.length > 0;
  const isCurrentBranch = currentBranch === branch;

  const worktreeDir = isCurrentBranch ? null : join(tmpdir(), `s2a-worktree-${slug}-${Date.now()}`);

  if (!isCurrentBranch) {
    let wtResult;
    if (localExists) {
      wtResult = git(['worktree', 'add', worktreeDir, branch]);
    } else if (remoteExists) {
      wtResult = git(['worktree', 'add', '--track', '-b', branch, worktreeDir, `origin/${branch}`]);
    } else {
      wtResult = git(['worktree', 'add', '-b', branch, worktreeDir, 'origin/main']);
    }
    if (!wtResult.ok) throw new Error('Worktree setup failed: ' + wtResult.stderr);
  }

  const wgit = worktreeDir ? makeWorktreeGit(worktreeDir) : git;

  try {
    // Write to worktree for commit
    if (worktreeDir) {
      const storyDir = join(worktreeDir, STORIES_REL);
      mkdirSync(storyDir, { recursive: true });
      writeFileSync(join(storyDir, fileName), story, 'utf8');
    }

    // Non-blocking validation checks
    const lint      = spawnSync('npm', ['run', 'lint',      '--if-present'], { cwd: ROOT, encoding: 'utf8', timeout: 60000 });
    const typecheck = spawnSync('npm', ['run', 'typecheck', '--if-present'], { cwd: ROOT, encoding: 'utf8', timeout: 60000 });
    const checks    = { lint: lint.status === 0, typecheck: typecheck.status === 0 };

    // Commit
    const absPath = worktreeDir ? join(worktreeDir, STORIES_REL, fileName) : resolve(STORIES_DIR, fileName);
    wgit(['add', absPath]);
    const staged = wgit(['diff', '--cached', '--name-only']);
    if (staged.stdout.trim().length > 0) {
      const msg = `feat(prototype): generate ${frameName} from Figma`;
      const commit = wgit(['commit', '-m', msg]);
      if (!commit.ok) throw new Error('Commit failed: ' + (commit.stderr || commit.stdout));
    } else {
      console.log(`[plugin→story] no changes — story unchanged, skipping commit`);
    }

    // Push
    const push = wgit(['push', '-u', 'origin', branch]);
    if (!push.ok) throw new Error('Push failed: ' + push.stderr);

    // PR — reuse if already open
    const existingPR = spawnSync('gh', ['pr', 'view', branch, '--json', 'url', '--jq', '.url'],
      { cwd: ROOT, encoding: 'utf8', timeout: 15000 });
    let prUrl = existingPR.status === 0 ? existingPR.stdout.trim() : null;

    if (!prUrl) {
      const prBody = buildPRBody({ frameName, prompt, storyFileRelative: relPath, checks, branchName: branch });
      const pr = spawnSync(
        'gh',
        ['pr', 'create', '--title', `prototype: ${frameName}`, '--body', prBody, '--draft', '--label', 'prototype'],
        { cwd: ROOT, encoding: 'utf8', timeout: 30000 }
      );
      prUrl = pr.status === 0 ? pr.stdout.trim() : null;
      if (!prUrl) console.warn('[plugin→story] PR creation failed:', pr.stderr);
    }

    return { story, storyFile: relPath, branchName: branch, prUrl, checks };
  } finally {
    if (worktreeDir) git(['worktree', 'remove', '--force', worktreeDir]);
  }
}

// ── Iteration commit helper ───────────────────────────────────────────────────

async function commitIterationToBranch({ story, fileName, branch }) {
  const localExists  = git(['branch', '--list', branch]).stdout.length > 0;
  const remoteExists = git(['branch', '-r', '--list', `origin/${branch}`]).stdout.length > 0;
  if (!localExists && !remoteExists) return null;

  const currentBranch  = git(['branch', '--show-current']).stdout;
  const isCurrentBranch = currentBranch === branch;
  const worktreeDir    = isCurrentBranch ? null : join(tmpdir(), `s2a-wt-iter-${Date.now()}`);

  if (!isCurrentBranch) {
    const wtArgs = localExists
      ? ['worktree', 'add', worktreeDir, branch]
      : ['worktree', 'add', '--track', '-b', branch, worktreeDir, `origin/${branch}`];
    const wt = git(wtArgs);
    if (!wt.ok) { console.warn('[iter-commit] worktree failed:', wt.stderr); return null; }
  }

  const wgit = worktreeDir ? makeWorktreeGit(worktreeDir) : git;
  try {
    const targetDir = worktreeDir ? join(worktreeDir, STORIES_REL) : STORIES_DIR;
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(join(targetDir, fileName), story, 'utf8');
    wgit(['add', join(targetDir, fileName)]);
    const staged = wgit(['diff', '--cached', '--name-only']);
    if (staged.stdout.trim().length > 0) {
      wgit(['commit', '-m', `feat(prototype): iterate on ${fileName}`]);
      wgit(['push', '-u', 'origin', branch]);
    }
  } finally {
    if (worktreeDir) git(['worktree', 'remove', '--force', worktreeDir]);
  }

  const pr = spawnSync('gh', ['pr', 'view', branch, '--json', 'url', '--jq', '.url'],
    { cwd: ROOT, encoding: 'utf8', timeout: 10000 });
  return pr.status === 0 ? pr.stdout.trim() : null;
}

// ── Inline HTML UI ────────────────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>S2A Prototype Generator</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0f0f0f;color:#e8e6e3;height:100vh;display:flex;flex-direction:row;overflow:hidden;font-size:14px}

/* ── Layout ─────────────────────────────────────────────────────── */
:root{
  --sb:#161616;--sb-hover:#222;--sb-active:#282828;--sb-border:#282828;
  --main:#0f0f0f;--surface:#1a1a1a;--surface2:#222;
  --border:#2a2a2a;--accent:#1473e6;--accent-h:#0d66d0;
  --text:#e8e6e3;--text2:#999;--text3:#555;
  --green:#4ade80;--red:#f87171;
}

/* ── Sidebar ────────────────────────────────────────────────────── */
#sidebar{width:260px;min-width:260px;background:var(--sb);border-right:1px solid var(--sb-border);display:flex;flex-direction:column;height:100vh;overflow:hidden}
.sb-header{padding:16px 12px 8px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.sb-logo{font-size:13px;font-weight:600;color:var(--text);letter-spacing:.02em}
.sb-logo span{color:var(--text3);font-weight:400}
.sb-new-btn{width:28px;height:28px;border-radius:7px;border:1px solid var(--border);background:none;color:var(--text2);cursor:pointer;font-size:17px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0;line-height:1}
.sb-new-btn:hover{background:var(--sb-hover);color:var(--text);border-color:#444}

.sb-section{padding:6px 12px 4px;font-size:10px;font-weight:600;color:var(--text3);letter-spacing:.08em;text-transform:uppercase}

.thread-list{flex:1;overflow-y:auto;padding:0 8px}
.thread-list::-webkit-scrollbar{width:4px}
.thread-list::-webkit-scrollbar-track{background:transparent}
.thread-list::-webkit-scrollbar-thumb{background:#333;border-radius:4px}
.thread-item{display:flex;align-items:center;gap:6px;padding:7px 8px;border-radius:7px;cursor:pointer;transition:background .12s;margin-bottom:1px;group:true}
.thread-item:hover{background:var(--sb-hover)}
.thread-item.active{background:var(--sb-active)}
.thread-name{flex:1;font-size:13px;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .12s}
.thread-item.active .thread-name,.thread-item:hover .thread-name{color:var(--text)}
.thread-del{opacity:0;width:18px;height:18px;background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;border-radius:4px;flex-shrink:0;transition:all .12s;padding:0}
.thread-item:hover .thread-del{opacity:1}
.thread-del:hover{color:var(--red);background:#2a1a1a}
.thread-empty{padding:16px 8px;font-size:12px;color:var(--text3);text-align:center;line-height:1.5}

.sb-divider{height:1px;background:var(--sb-border);margin:8px 12px}

.stories-section{flex-shrink:0;padding:0 8px 8px}
.stories-toggle-row{display:flex;align-items:center;justify-content:space-between;padding:6px 8px;cursor:pointer;border-radius:7px;transition:background .12s}
.stories-toggle-row:hover{background:var(--sb-hover)}
.stories-toggle-label{font-size:12px;color:var(--text2)}
.stories-toggle-arrow{font-size:11px;color:var(--text3);transition:transform .15s}
.stories-toggle-arrow.open{transform:rotate(180deg)}
.stories-list{display:none;max-height:200px;overflow-y:auto}
.stories-list.open{display:block}
.story-row{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:6px;cursor:pointer;transition:background .12s}
.story-row:hover{background:var(--sb-hover)}
.story-row-name{flex:1;font-size:11.5px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.story-row-link{font-size:10px;color:var(--accent);text-decoration:none;opacity:.7;flex-shrink:0}
.story-row-link:hover{opacity:1}

/* ── Main ───────────────────────────────────────────────────────── */
#main{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative}

/* ── Empty state ────────────────────────────────────────────────── */
#emptyState{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding-bottom:100px;pointer-events:none}
#emptyState.hidden{display:none}
.es-title{font-size:22px;font-weight:600;color:var(--text);letter-spacing:-.01em}
.es-sub{font-size:13px;color:var(--text3);max-width:380px;text-align:center;line-height:1.6}
.chip-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;pointer-events:all}
.chip{background:var(--surface);border:1px solid var(--border);border-radius:99px;padding:7px 16px;font-size:12px;color:var(--text2);cursor:pointer;transition:all .15s;font-family:inherit}
.chip:hover{background:var(--surface2);border-color:#444;color:var(--text)}

/* ── Thread area ────────────────────────────────────────────────── */
#thread{flex:1;overflow-y:auto;padding:24px 0;display:flex;flex-direction:column;gap:0}
#thread::-webkit-scrollbar{width:5px}
#thread::-webkit-scrollbar-track{background:transparent}
#thread::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px}

.msg-wrap{padding:4px 32px;max-width:860px;width:100%;margin:0 auto}
.msg-user-bubble{display:flex;justify-content:flex-end;margin-bottom:12px}
.msg-user-text{background:var(--surface);border:1px solid var(--border);border-radius:16px 16px 4px 16px;padding:10px 16px;font-size:14px;color:var(--text);max-width:72%;white-space:pre-wrap;line-height:1.55}

.msg-assistant-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:16px}
.msg-card-head{padding:11px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
.msg-card-title{font-size:12px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:7px}
.msg-card-badge{font-size:10px;padding:2px 7px;background:#1e3a1e;color:var(--green);border-radius:99px;font-weight:500}
.msg-card-actions{display:flex;gap:5px}
.msg-action-btn{font-size:11px;padding:4px 10px;background:transparent;border:1px solid var(--border);border-radius:6px;color:var(--text2);cursor:pointer;font-family:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:4px;transition:all .12s}
.msg-action-btn:hover{border-color:#444;color:var(--text);background:var(--surface2)}
.msg-code-block{padding:14px 16px;font-size:11.5px;font-family:"SF Mono",ui-monospace,monospace;color:#7ec8a4;line-height:1.6;max-height:260px;overflow-y:auto;white-space:pre-wrap;word-break:break-all}
.msg-code-block::-webkit-scrollbar{height:4px}

.msg-error-card{background:#1a0e0e;border:1px solid #3d1a1a;border-radius:12px;padding:14px 16px;margin-bottom:16px;font-size:13px;color:var(--red);display:flex;gap:8px;align-items:flex-start}

/* ── Thinking indicator ─────────────────────────────────────────── */
.thinking-wrap{padding:4px 32px;max-width:860px;width:100%;margin:0 auto}
.thinking-dots{display:flex;align-items:center;gap:6px;color:var(--text3);font-size:13px;padding:6px 0}
.dot{width:5px;height:5px;border-radius:50%;background:#444;animation:blink 1.4s infinite both}
.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
@keyframes blink{0%,80%,100%{opacity:.2}40%{opacity:1}}

/* ── Input bar ──────────────────────────────────────────────────── */
#inputBar{padding:12px 24px 18px;flex-shrink:0;position:relative}
.figma-badge{display:none;align-items:center;gap:6px;background:#0d2340;border:1px solid #1a4a80;border-radius:6px;padding:4px 10px;font-size:11px;color:#6b9ee8;margin-bottom:8px;width:fit-content}
.figma-badge.show{display:flex}
.figma-badge-url{max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.figma-badge-close{background:none;border:none;color:#4a7ab0;cursor:pointer;font-size:14px;padding:0;line-height:1;margin-left:2px}
.figma-badge-close:hover{color:#6b9ee8}
.input-shell{display:flex;align-items:flex-end;gap:0;background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;transition:border-color .15s}
.input-shell:focus-within{border-color:#444}
textarea#msg{flex:1;background:transparent;border:none;color:var(--text);padding:13px 16px;font-size:14px;font-family:inherit;outline:none;resize:none;min-height:50px;max-height:180px;line-height:1.55}
textarea#msg::placeholder{color:var(--text3)}
.send-btn{width:38px;height:38px;background:var(--accent);border:none;border-radius:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s;margin:6px 6px 6px 0}
.send-btn:hover{background:var(--accent-h)}
.send-btn:disabled{background:#222;cursor:default}
.send-btn svg{width:16px;height:16px;fill:#fff}
.input-hint{font-size:11px;color:var(--text3);text-align:center;margin-top:8px}
.iterate-banner{display:none;align-items:center;gap:8px;margin-bottom:8px;padding:7px 12px;background:var(--surface2);border-radius:8px;font-size:12px;color:var(--text2)}
.iterate-banner.show{display:flex}
.iterate-banner-name{color:var(--text);font-weight:500}
.iterate-cancel{background:none;border:none;color:var(--text3);cursor:pointer;font-size:18px;line-height:1;padding:0;margin-left:auto}
.iterate-cancel:hover{color:var(--text)}
</style>
</head>
<body>

<!-- Sidebar -->
<div id="sidebar">
  <div class="sb-header">
    <span class="sb-logo">S2A <span>Generator</span></span>
    <button class="sb-new-btn" id="newThreadBtn" title="New thread">+</button>
  </div>

  <div class="sb-section">Threads</div>
  <div class="thread-list" id="threadList">
    <div class="thread-empty">No threads yet.<br>Start by describing something to build.</div>
  </div>

  <div class="sb-divider"></div>

  <div class="stories-section">
    <div class="stories-toggle-row" onclick="toggleStories()">
      <span class="stories-toggle-label">Generated Stories</span>
      <span class="stories-toggle-arrow" id="storiesArrow">▾</span>
    </div>
    <div class="stories-list" id="storiesList"></div>
  </div>
</div>

<!-- Main -->
<div id="main">
  <!-- Empty state -->
  <div id="emptyState">
    <div class="es-title">What would you like to create?</div>
    <div class="es-sub">Describe a layout, paste a Figma URL inline, or pick a suggestion.</div>
    <div class="chip-row">
      <div class="chip" onclick="useSuggestion('A dark hero section for Adobe Firefly with ProductLockup, headline, body copy, and a primary CTA button')">Firefly hero</div>
      <div class="chip" onclick="useSuggestion('A light-surface card grid with three ElasticCards side by side')">Card grid</div>
      <div class="chip" onclick="useSuggestion('A navigation bar with NavCard components and a NavFilter')">Nav bar</div>
      <div class="chip" onclick="useSuggestion('A product showcase section with ProductLockup on dark background and two CTA buttons')">Product showcase</div>
    </div>
  </div>

  <!-- Thread messages -->
  <div id="thread"></div>

  <!-- Input bar -->
  <div id="inputBar">
    <div class="iterate-banner" id="iterateBanner">
      <span>Iterating on</span>
      <span class="iterate-banner-name" id="iterateName"></span>
      <button class="iterate-cancel" id="iterateCancel" title="Cancel iteration">×</button>
    </div>
    <div class="figma-badge" id="figmaBadge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 12a4 4 0 1 0 4-4H8a4 4 0 0 0 0 8"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="6" r="2"/></svg>
      <span class="figma-badge-url" id="figmaUrlLabel"></span>
      <button class="figma-badge-close" onclick="clearFigmaUrl()">×</button>
    </div>
    <div class="input-shell">
      <textarea id="msg" rows="1" placeholder="Describe what to build… or paste a Figma URL" onkeydown="onKey(event)" oninput="onInput(this)"></textarea>
      <button class="send-btn" id="sendBtn" onclick="send()" disabled>
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
    <div class="input-hint">Enter to send · Shift+Enter for newline</div>
  </div>
</div>

<script>
// ── State ────────────────────────────────────────────────────────
let threads = [];           // [{ id, title, messages }]
let activeThread = null;    // thread object
let iteratingFile = null;   // fileName being iterated
let iteratingCode = null;   // source of that file
let detectedFigmaUrl = null;

// ── Thread persistence ───────────────────────────────────────────
async function loadThreads() {
  try {
    const r = await fetch('/threads');
    threads = await r.json();
  } catch { threads = []; }
  renderSidebar();
  loadStories();
}

async function saveThread(thread) {
  try {
    await fetch(\`/threads/\${thread.id}\`, {
      method: 'PATCH', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(thread),
    });
    renderSidebar();
  } catch {}
}

async function deleteThread(id) {
  try { await fetch(\`/threads/\${id}\`, { method: 'DELETE' }); } catch {}
  threads = threads.filter(t => t.id !== id);
  if (activeThread?.id === id) {
    activeThread = null;
    document.getElementById('thread').innerHTML = '';
    document.getElementById('emptyState').classList.remove('hidden');
  }
  renderSidebar();
}

// ── Sidebar render ───────────────────────────────────────────────
function renderSidebar() {
  const list = document.getElementById('threadList');
  if (!threads.length) {
    list.innerHTML = '<div class="thread-empty">No threads yet.<br>Start by describing something to build.</div>';
    return;
  }
  list.innerHTML = threads.slice().reverse().map(t => \`
    <div class="thread-item\${activeThread?.id === t.id ? ' active' : ''}" onclick="activateThread('\${t.id}')">
      <span class="thread-name">\${escHtml(t.title || 'Untitled')}</span>
      <button class="thread-del" onclick="event.stopPropagation();deleteThread('\${t.id}')" title="Delete">×</button>
    </div>
  \`).join('');
}

function activateThread(id) {
  const t = threads.find(t => t.id === id);
  if (!t) return;
  activeThread = t;
  cancelIterate();
  renderThread();
  renderSidebar();
}

function renderThread() {
  const el = document.getElementById('thread');
  el.innerHTML = '';
  document.getElementById('emptyState').classList.add('hidden');
  for (const msg of (activeThread?.messages || [])) {
    if (msg.role === 'user') appendUserBubble(msg.text);
    else if (msg.role === 'assistant') appendResultCard(msg.data);
    else if (msg.role === 'error') appendErrorCard(msg.text);
  }
  scrollBottom();
}

// ── UI helpers ───────────────────────────────────────────────────
function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function scrollBottom() {
  const el = document.getElementById('thread');
  el.scrollTop = el.scrollHeight;
}

function showEmpty() { document.getElementById('emptyState').classList.remove('hidden'); }
function hideEmpty() { document.getElementById('emptyState').classList.add('hidden'); }

function appendUserBubble(text) {
  hideEmpty();
  const wrap = document.createElement('div');
  wrap.className = 'msg-wrap';
  const inner = document.createElement('div');
  inner.className = 'msg-user-bubble';
  inner.innerHTML = \`<div class="msg-user-text">\${escHtml(text)}</div>\`;
  wrap.appendChild(inner);
  document.getElementById('thread').appendChild(wrap);
  scrollBottom();
}

function appendResultCard(data) {
  hideEmpty();
  const sbSlug = (data.fileName || '').replace(/\\.stories\\.[jt]sx?$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const wrap = document.createElement('div');
  wrap.className = 'msg-wrap';
  wrap.innerHTML = \`
    <div class="msg-assistant-card">
      <div class="msg-card-head">
        <div class="msg-card-title">
          <span>\${escHtml(data.title || data.fileName || 'Story')}</span>
          <span class="msg-card-badge">Generated</span>
        </div>
        <div class="msg-card-actions">
          \${data.prUrl ? \`<a class="msg-action-btn" href="\${data.prUrl}" target="_blank">PR ↗</a>\` : ''}
          <button class="msg-action-btn" onclick="startIterate(\${JSON.stringify(data.fileName)})">Iterate</button>
          <button class="msg-action-btn" onclick="copyCode(this)">Copy</button>
          <a class="msg-action-btn" href="http://localhost:6006/?path=/story/\${sbSlug}--default" target="_blank">Storybook ↗</a>
        </div>
      </div>
      <div class="msg-code-block">\${escHtml(data.story || '')}</div>
    </div>
  \`;
  document.getElementById('thread').appendChild(wrap);
  scrollBottom();
}

function appendErrorCard(msg) {
  hideEmpty();
  const wrap = document.createElement('div');
  wrap.className = 'msg-wrap';
  wrap.innerHTML = \`<div class="msg-error-card"><span>✗</span><span>\${escHtml(msg)}</span></div>\`;
  document.getElementById('thread').appendChild(wrap);
  scrollBottom();
}

function showThinking() {
  hideEmpty();
  const el = document.createElement('div');
  el.className = 'thinking-wrap';
  el.id = 'thinking';
  el.innerHTML = \`<div class="thinking-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div><span style="margin-left:4px">Generating…</span></div>\`;
  document.getElementById('thread').appendChild(el);
  scrollBottom();
}

function removeThinking() { document.getElementById('thinking')?.remove(); }

function copyCode(btn) {
  const code = btn.closest('.msg-assistant-card').querySelector('.msg-code-block').textContent;
  navigator.clipboard?.writeText(code).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  });
  btn.textContent = 'Copied!';
  setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
}

// ── Figma URL detection ──────────────────────────────────────────
const FIGMA_RE = /(https:\\/\\/(?:www\\.)?figma\\.com\\/(?:design|file)\\/[^\\s"<>]+)/i;

function onInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 180) + 'px';

  const val = el.value;
  const match = val.match(FIGMA_RE);
  if (match && match[1] !== detectedFigmaUrl) {
    detectedFigmaUrl = match[1];
    el.value = val.replace(match[1], '').replace(/^\\s+/, '');
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
    document.getElementById('figmaUrlLabel').textContent = detectedFigmaUrl;
    document.getElementById('figmaBadge').classList.add('show');
  }

  document.getElementById('sendBtn').disabled = !el.value.trim() && !detectedFigmaUrl;
}

function clearFigmaUrl() {
  detectedFigmaUrl = null;
  document.getElementById('figmaBadge').classList.remove('show');
  document.getElementById('figmaUrlLabel').textContent = '';
  const msgEl = document.getElementById('msg');
  document.getElementById('sendBtn').disabled = !msgEl.value.trim();
}

function onKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
}

function useSuggestion(text) {
  const el = document.getElementById('msg');
  el.value = text;
  onInput(el);
  el.focus();
}

// ── Iteration ────────────────────────────────────────────────────
async function startIterate(fileName) {
  try {
    const r = await fetch(\`/stories/read?file=\${encodeURIComponent(fileName)}\`);
    const d = await r.json();
    if (!d.source) throw new Error('Could not read story');
    iteratingFile = fileName;
    iteratingCode = d.source;
    document.getElementById('iterateName').textContent = fileName;
    document.getElementById('iterateBanner').classList.add('show');
    document.getElementById('msg').placeholder = 'Describe what to change…';
    document.getElementById('msg').focus();
  } catch(e) { alert('Could not load story: ' + e.message); }
}

function cancelIterate() {
  iteratingFile = null;
  iteratingCode = null;
  document.getElementById('iterateBanner').classList.remove('show');
  document.getElementById('msg').placeholder = 'Describe what to build… or paste a Figma URL';
}
document.getElementById('iterateCancel').addEventListener('click', cancelIterate);

// ── Send ─────────────────────────────────────────────────────────
async function send() {
  const msgEl    = document.getElementById('msg');
  const text     = msgEl.value.trim();
  const figmaUrl = detectedFigmaUrl;

  if (!text && !figmaUrl && !iteratingFile) return;

  // Create or use current thread
  if (!activeThread) {
    const title = text.slice(0, 40) || (figmaUrl ? 'Figma frame' : 'New thread');
    activeThread = { id: 'th_' + Date.now(), title, messages: [] };
    threads.push(activeThread);
    renderSidebar();
  }

  const displayText = figmaUrl
    ? (figmaUrl + (text ? '\\n' + text : ''))
    : (iteratingFile ? \`↩ Iterate on \${iteratingFile}\\n\${text}\` : text);

  // Record user message
  activeThread.messages.push({ role: 'user', text: displayText });
  appendUserBubble(displayText);

  msgEl.value = '';
  msgEl.style.height = 'auto';
  document.getElementById('sendBtn').disabled = true;
  clearFigmaUrl();
  showThinking();

  try {
    let endpoint, body;

    if (iteratingFile && iteratingCode) {
      endpoint = '/prompt/iterate';
      body = { existingCode: iteratingCode, prompt: text, fileName: iteratingFile };
    } else if (figmaUrl) {
      endpoint = '/figma/generate-deep';
      body = { figmaUrl, prompt: text };
    } else {
      endpoint = '/prompt/generate';
      body = { prompt: text };
    }

    // All endpoints return { jobId } immediately (HTTP 202)
    const startRes = await fetch(endpoint, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body),
    });
    const startData = await startRes.json();
    if (!startRes.ok) throw new Error(startData.error || \`HTTP \${startRes.status}\`);
    const { jobId } = startData;

    // Poll for completion
    const data = await (async () => {
      const deadline = Date.now() + 5 * 60 * 1000;
      while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 2500));
        const poll = await fetch(\`/jobs/\${jobId}\`).catch(() => null);
        if (!poll?.ok) continue;
        const job = await poll.json();
        if (job.status === 'done')  return job.result;
        if (job.status === 'error') throw new Error(job.error || 'Generation failed');
        // Update thinking label with live phase
        const thinkEl = document.getElementById('thinking');
        if (thinkEl && job.phase) {
          const span = thinkEl.querySelector('span');
          if (span) span.textContent = job.phase;
        }
      }
      throw new Error('Timed out waiting for generation (5 min)');
    })();

    if (iteratingFile) iteratingCode = data.story;

    removeThinking();
    appendResultCard(data);
    activeThread.messages.push({ role: 'assistant', data });
    await saveThread(activeThread);
    loadStories();
  } catch(e) {
    removeThinking();
    appendErrorCard(e.message);
    activeThread.messages.push({ role: 'error', text: e.message });
    await saveThread(activeThread);
  } finally {
    const newText = document.getElementById('msg').value.trim();
    document.getElementById('sendBtn').disabled = !newText && !detectedFigmaUrl;
  }
}

document.getElementById('newThreadBtn').addEventListener('click', () => {
  activeThread = null;
  cancelIterate();
  document.getElementById('thread').innerHTML = '';
  showEmpty();
  renderSidebar();
  document.getElementById('msg').focus();
});

// ── Stories section ──────────────────────────────────────────────
let storiesOpen = false;
function toggleStories() {
  storiesOpen = !storiesOpen;
  document.getElementById('storiesList').classList.toggle('open', storiesOpen);
  document.getElementById('storiesArrow').classList.toggle('open', storiesOpen);
  if (storiesOpen) loadStories();
}

async function loadStories() {
  const list = document.getElementById('storiesList');
  try {
    const r = await fetch('/stories/list');
    const data = await r.json();
    if (!data.length) { list.innerHTML = '<div style="padding:8px;font-size:11px;color:#555">No stories yet.</div>'; return; }
    list.innerHTML = data.map(s => {
      const sbSlug = s.fileName.replace(/\\.stories\\.[jt]sx?$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      return \`
        <div class="story-row" onclick="startIterate('\${escHtml(s.fileName)}')">
          <span class="story-row-name">\${escHtml(s.title || s.fileName)}</span>
          <a class="story-row-link" href="http://localhost:6006/?path=/story/\${sbSlug}--default" target="_blank" onclick="event.stopPropagation()">Open ↗</a>
        </div>
      \`;
    }).join('');
  } catch { list.innerHTML = '<div style="padding:8px;font-size:11px;color:#f87171">Could not load</div>'; }
}

// ── Init ─────────────────────────────────────────────────────────
loadThreads();
</script>
</body>
</html>`;

// ── HTTP server ───────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS); res.end(); return;
  }

  // Serve UI
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { ...CORS, 'Content-Type': 'text/html' });
    res.end(HTML);
    return;
  }

  // List generated stories
  if (req.method === 'GET' && req.url === '/stories/list') {
    try {
      const files = readdirSync(STORIES_DIR)
        .filter(f => f.match(/\.stories\.[jt]sx?$/) && !f.startsWith('s2a-prototype'))
        .sort((a, b) => {
          const sa = existsSync(resolve(STORIES_DIR, a)) ? 0 : 1;
          const sb = existsSync(resolve(STORIES_DIR, b)) ? 0 : 1;
          return sa - sb || a.localeCompare(b);
        });
      const stories = files.map(f => {
        const src = readFileSync(resolve(STORIES_DIR, f), 'utf8');
        const titleMatch = src.match(/title:\s*['"`]([^'"`]+)['"`]/);
        return { fileName: f, title: titleMatch?.[1] || f };
      });
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stories));
    } catch {
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify([]));
    }
    return;
  }

  // Read a story's source
  if (req.method === 'GET' && req.url?.startsWith('/stories/read')) {
    const file = new URL('http://localhost' + req.url).searchParams.get('file');
    if (!file || file.includes('..')) {
      res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'Invalid file' })); return;
    }
    try {
      const source = readFileSync(resolve(STORIES_DIR, file), 'utf8');
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ source }));
    } catch {
      res.writeHead(404, CORS); res.end(JSON.stringify({ error: 'Not found' }));
    }
    return;
  }

  // Health
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, port: PORT }));
    return;
  }

  // Figma info (for debugging)
  if (req.method === 'GET' && req.url?.startsWith('/figma/info')) {
    const figmaUrl = new URL('http://localhost' + req.url).searchParams.get('url');
    try {
      const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
      const name = await fetchFigmaNodeName(fileKey, nodeId);
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ fileKey, nodeId, name }));
    } catch (e) {
      res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Main generation endpoint
  if (req.method === 'POST' && req.url === '/figma/generate') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', async () => {
      let figmaUrl, prompt;
      try { ({ figmaUrl, prompt } = JSON.parse(body)); }
      catch { res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'Invalid JSON' })); return; }

      if (!figmaUrl) {
        res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'figmaUrl is required' }));
        return;
      }

      try {
        console.log(`[figma→story] ${figmaUrl}`);

        const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
        let frameName = null;
        if (FIGMA_TOKEN) {
          try { frameName = await fetchFigmaNodeName(fileKey, nodeId); } catch {}
        }
        console.log(`[figma→story] frame: "${frameName}" (${fileKey}/${nodeId})`);

        const fullPrompt = frameName
          ? `Generate an S2A Storybook story for the Figma frame "${frameName}".${prompt ? '\n\n' + prompt : ''}`
          : (prompt || 'Generate an S2A Storybook story for this Figma frame.');

        console.log(`[figma→story] calling Claude (with MCP access)…`);
        const result = await generateStory({ prompt: fullPrompt, figmaUrl });
        console.log(`[figma→story] done → ${result.fileName}`);

        res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, ...result }));
      } catch (e) {
        console.error('[figma→story] error:', e.message);
        res.writeHead(500, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Deep generation via Desktop Bridge (figma_execute — no REST API needed)
  if (req.method === 'POST' && req.url === '/figma/generate-deep') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      let figmaUrl, prompt;
      try { ({ figmaUrl, prompt } = JSON.parse(body)); }
      catch { res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'Invalid JSON' })); return; }

      if (!figmaUrl) {
        res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'figmaUrl is required' }));
        return;
      }

      // Async job — respond immediately, run in background
      const jobId = createJob();
      res.writeHead(202, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, jobId }));

      (async () => {
        try {
          updateJob(jobId, { status: 'running', phase: 'Parsing Figma URL…' });
          console.log(`[deep→story] ${figmaUrl} jobId=${jobId}`);
          const { nodeId } = parseFigmaUrl(figmaUrl);
          if (!nodeId) throw new Error('URL must include a node-id');

          updateJob(jobId, { phase: 'Reading Figma frame…' });
          const { fileKey } = parseFigmaUrl(figmaUrl);

          // Try Desktop Bridge first (figma_execute — richest context)
          let structure = null;
          try {
            const s = await extractFigmaStructure(nodeId);
            if (s && !s.error) {
              structure = s;
              console.log(`[deep→story] bridge: ${s.instances?.length} instances`);
            }
          } catch (e) {
            console.warn('[deep→story] bridge not available — Claude will use figma_execute itself:', e.message);
          }

          // Get frame name for the prompt (REST API lookup, no auth needed for public files)
          let frameName = null;
          if (FIGMA_TOKEN) {
            try { frameName = await fetchFigmaNodeName(fileKey, nodeId); } catch {}
          }

          updateJob(jobId, { phase: 'Generating story with Claude…' });
          const deepPrompt = frameName
            ? `Generate an S2A Storybook story for the Figma frame named "${frameName}". ${prompt || ''}`
            : (prompt || `Generate an S2A Storybook story for this Figma design.`);
          // Pass figmaUrl so Claude can use its own figma_execute when bridge data unavailable
          const result = await generateStory({ prompt: deepPrompt, figmaStructure: structure, figmaUrl });
          console.log(`[deep→story] done → ${result.fileName}`);

          updateJob(jobId, { status: 'done', phase: 'Done', result });
        } catch (e) {
          console.error(`[deep→story] job ${jobId} error:`, e.message);
          updateJob(jobId, { status: 'error', phase: 'Failed', error: e.message });
        }
      })();
    });
    return;
  }

  // Iterate on an existing story
  // Accepts: { existingCode, prompt, fileName } (web UI)
  //       OR { storyFile, branch, prompt }       (plugin — reads file from disk, commits to branch)
  if (req.method === 'POST' && req.url === '/prompt/iterate') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      let existingCode, prompt, fileName, branch, storyFile;
      try { ({ existingCode, prompt, fileName, branch, storyFile } = JSON.parse(body)); }
      catch { res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'Invalid JSON' })); return; }

      // Plugin flow: resolve existingCode from storyFile on disk
      if (!existingCode && storyFile) {
        const absPath = resolve(ROOT, storyFile);
        if (existsSync(absPath)) {
          existingCode = readFileSync(absPath, 'utf8');
          fileName = fileName || storyFile.split('/').pop();
        }
      }

      if (!existingCode || !prompt) {
        res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'existingCode (or storyFile) and prompt required' })); return;
      }

      const jobId = createJob();
      res.writeHead(202, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, jobId }));

      (async () => {
        try {
          updateJob(jobId, { status: 'running', phase: 'Generating updated story…' });
          console.log(`[iterate] jobId=${jobId} "${prompt.slice(0, 60)}"`);
          const dsContext = buildLiveContext();
          const iteratePrompt = `${dsContext}

---

## Existing story to iterate on

\`\`\`js
${existingCode}
\`\`\`

## Requested changes

${prompt}

Rewrite the complete story file incorporating the changes above. Keep everything that was not mentioned as needing to change. Output only the file contents.`;

          const result = await generateStory({ prompt: iteratePrompt });

          // Overwrite the live Storybook file
          const targetFileName = fileName || result.fileName;
          if (targetFileName && existsSync(resolve(STORIES_DIR, targetFileName))) {
            writeFileSync(resolve(STORIES_DIR, targetFileName), result.story, 'utf8');
            console.log(`[iterate] overwrote → ${targetFileName}`);
          }

          // Plugin flow: commit + push to branch
          let prUrl = null;
          if (branch && targetFileName) {
            updateJob(jobId, { phase: 'Committing to branch…' });
            try { prUrl = await commitIterationToBranch({ story: result.story, fileName: targetFileName, branch }); }
            catch (e) { console.warn('[iterate] commit failed:', e.message); }
          }

          const outStoryFile = storyFile || join(STORIES_REL, targetFileName);
          updateJob(jobId, { status: 'done', phase: 'Done', result: { ok: true, story: result.story, fileName: targetFileName, storyFile: outStoryFile, prUrl, title: result.title } });
        } catch (e) {
          console.error(`[iterate] job ${jobId} error:`, e.message);
          updateJob(jobId, { status: 'error', phase: 'Failed', error: e.message });
        }
      })();
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/prompt/generate') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      let prompt;
      try { ({ prompt } = JSON.parse(body)); }
      catch { res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'Invalid JSON' })); return; }

      if (!prompt) {
        res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'prompt is required' }));
        return;
      }

      const jobId = createJob();
      res.writeHead(202, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, jobId }));

      (async () => {
        try {
          updateJob(jobId, { status: 'running', phase: 'Generating with Claude…' });
          console.log(`[prompt→story] jobId=${jobId} "${prompt.slice(0, 80)}"`);
          const result = await generateStory({ prompt });
          console.log(`[prompt→story] done → ${result.fileName}`);
          updateJob(jobId, { status: 'done', phase: 'Done', result });
        } catch (e) {
          console.error(`[prompt→story] job ${jobId} error:`, e.message);
          updateJob(jobId, { status: 'error', phase: 'Failed', error: e.message });
        }
      })();
    });
    return;
  }

  // Plugin endpoint — selection data sent directly, no Figma REST API needed
  if (req.method === 'POST' && req.url === '/prototype/generate') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      let selection, prompt, branch;
      try { ({ selection, prompt, branch } = JSON.parse(body)); }
      catch { res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'Invalid JSON' })); return; }

      if (!selection?.name) {
        res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing selection.name — select a frame first' }));
        return;
      }

      // Start async job — respond immediately so the plugin doesn't time out
      const jobId = createJob();
      res.writeHead(202, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, jobId }));

      // Run generation in background
      (async () => {
        try {
          updateJob(jobId, { status: 'running', phase: 'Reading frame…' });
          console.log(`[plugin→story] "${selection.name}" jobId=${jobId}`);
          const result = await generatePrototypeFromPlugin({
            selection,
            prompt: (prompt || '').trim(),
            branchOverride: branch || null,
            onPhase: (phase) => updateJob(jobId, { phase }),
          });
          updateJob(jobId, { status: 'done', phase: 'Done', result });
          console.log(`[plugin→story] job ${jobId} done → ${result.storyFile}`);
        } catch (e) {
          console.error(`[plugin→story] job ${jobId} error:`, e.message);
          updateJob(jobId, { status: 'error', phase: 'Failed', error: e.message });
        }
      })();
    });
    return;
  }

  // Plugin endpoint — screenshot + shallow metadata sent directly from Figma
  if (req.method === 'POST' && req.url === '/llm/capture') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      let capture, prompt;
      try { ({ capture, prompt } = JSON.parse(body)); }
      catch { res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'Invalid JSON' })); return; }

      if (!capture?.imageBase64) {
        res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing capture.imageBase64' }));
        return;
      }

      const nodeName = capture.node?.name || 'selected Figma node';
      const jobId = createJob();
      res.writeHead(202, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, jobId }));

      (async () => {
        try {
          updateJob(jobId, { status: 'running', phase: 'Sending screenshot to LLM…' });
          console.log(`[llm-capture] "${nodeName}" jobId=${jobId}, ${Math.round((capture.byteLength || 0) / 1024)}KB`);
          const metadata = {
            fileName: capture.fileName,
            fileKey: capture.fileKey,
            page: capture.page,
            node: capture.node,
            export: {
              mediaType: capture.mediaType || 'image/jpeg',
              scale: capture.scale,
              maxDimension: capture.maxDimension,
              byteLength: capture.byteLength,
            },
          };
          const fullPrompt = `${prompt || 'Inspect this Figma selection and summarize what matters for implementation.'}

Use the screenshot as the visual source of truth. Use this Figma metadata for structure and provenance:

${JSON.stringify(metadata, null, 2)}

Return concise implementation notes. If generating a Storybook story, use S2A components and semantic tokens only.`;

          const result = await generateViaStoryUI({
            prompt: fullPrompt,
            imageBase64: capture.imageBase64,
            mediaType: capture.mediaType || 'image/jpeg',
          });
          updateJob(jobId, { status: 'done', phase: 'Done', result });
          console.log(`[llm-capture] job ${jobId} done`);
        } catch (e) {
          console.error(`[llm-capture] job ${jobId} error:`, e.message);
          updateJob(jobId, { status: 'error', phase: 'Failed', error: e.message });
        }
      })();
    });
    return;
  }

  // Poll job status
  if (req.method === 'GET' && req.url?.startsWith('/jobs/')) {
    const jobId = req.url.slice('/jobs/'.length);
    const job = jobs.get(jobId);
    if (!job) {
      res.writeHead(404, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Job not found' }));
      return;
    }
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify(job));
    return;
  }

  // Branch list for plugin branch picker
  if (req.method === 'GET' && req.url === '/git/branches') {
    try {
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, ...listPrototypeBranches() }));
    } catch (e) {
      res.writeHead(500, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Open repo in Cursor
  if (req.method === 'GET' && req.url === '/open-cursor') {
    spawnSync('open', ['-a', 'Cursor', ROOT]);
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, path: ROOT }));
    return;
  }

  // ── Thread CRUD ─────────────────────────────────────────────────────────────

  // List threads
  if (req.method === 'GET' && req.url === '/threads') {
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify(loadThreads()));
    return;
  }

  // Create thread
  if (req.method === 'POST' && req.url === '/threads') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      let name, frameName;
      try { ({ name, frameName } = JSON.parse(body)); } catch {}
      const now = new Date().toISOString();
      const thread = {
        id: `thread_${Date.now()}`,
        name: name || 'Untitled',
        frameName: frameName || null,
        branch: null, storyFile: null, prUrl: null,
        messages: [],
        createdAt: now, updatedAt: now,
      };
      const threads = loadThreads();
      threads.unshift(thread);
      saveThreads(threads);
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify(thread));
    });
    return;
  }

  // Update thread (upsert — creates if not found)
  if (req.method === 'PATCH' && req.url?.match(/^\/threads\/[^/]+$/)) {
    const id = req.url.split('/')[2];
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      let patch;
      try { patch = JSON.parse(body); } catch { res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'Invalid JSON' })); return; }
      const threads = loadThreads();
      const idx = threads.findIndex(t => t.id === id);
      const now = new Date().toISOString();
      if (idx === -1) {
        const thread = { id, createdAt: now, ...patch, updatedAt: now };
        threads.unshift(thread);
        saveThreads(threads);
        res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify(thread));
      } else {
        Object.assign(threads[idx], patch, { updatedAt: now });
        saveThreads(threads);
        res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify(threads[idx]));
      }
    });
    return;
  }

  // Delete thread
  if (req.method === 'DELETE' && req.url?.match(/^\/threads\/[^/]+$/)) {
    const id = req.url.split('/')[2];
    const threads = loadThreads().filter(t => t.id !== id);
    saveThreads(threads);
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404, CORS); res.end();
});

server.listen(PORT, 'localhost', () => {
  const bridgePort = discoverBridgePort();
  console.log(`\n[Figma→Story] http://localhost:${PORT}`);
  console.log(`  GET  /                     — chat UI`);
  console.log(`  POST /prototype/generate   — plugin: selection + prompt + branch → story + PR (no API key needed)`);
  console.log(`  POST /llm/capture          — plugin: screenshot + metadata → Story UI vision`);
  console.log(`  POST /figma/generate       — screenshot via Figma REST API`);
  console.log(`  POST /figma/generate-deep  — deep extraction via Desktop Bridge (ws:${bridgePort})`);
  console.log(`  POST /prompt/generate      — text-only generation`);
  console.log(`  GET  /git/branches         — prototype branch list`);
  console.log(`  GET  /open-cursor          — open repo in Cursor`);
  console.log(`  GET  /figma/info?url=      — parse + node name`);
  console.log(`\n  Desktop Bridge: ${bridgePort === 9223 ? 'using default port 9223' : `discovered on port ${bridgePort}`}\n`);
});
