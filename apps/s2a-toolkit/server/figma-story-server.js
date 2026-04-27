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
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { WebSocket } from 'ws';
import Anthropic from '@anthropic-ai/sdk';
import { globSync } from '/Users/mhuntsberry/Desktop/consonant-2/node_modules/glob/dist/esm/index.js';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const ROOT        = resolve(__dirname, '..', '..', '..');
const PORT        = 4002;
const STORY_UI    = 'http://localhost:4001';
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN || process.env.FIGMA_REST_API || '';
const STORIES_DIR = resolve(ROOT, 'apps/storybook/stories/generated');

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Figma URL parser ──────────────────────────────────────────────────────────

function parseFigmaUrl(url) {
  const fileMatch = url.match(/figma\.com\/(?:design|file)\/([^/?#]+)/);
  if (!fileMatch) throw new Error('Not a valid Figma URL — must contain /design/ or /file/');
  const fileKey = fileMatch[1];
  const nodeParam = new URL(url).searchParams.get('node-id');
  const nodeId = nodeParam ? nodeParam.replace(/-/g, ':') : null;
  return { fileKey, nodeId };
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
  const url = nodeId
    ? `https://api.figma.com/v1/images/${fileKey}?ids=${idsParam}&format=png&scale=2`
    : `https://api.figma.com/v1/images/${fileKey}?format=png&scale=1`;
  const data = await getJson(url, { 'X-Figma-Token': FIGMA_TOKEN });
  if (data.err) throw new Error('Figma API error: ' + data.err);
  const imageUrl = nodeId ? Object.values(data.images || {})[0] : data.images?.[nodeId];
  if (!imageUrl) throw new Error('Figma returned no image URL for that node');
  const img = await get(imageUrl);
  return img.body.toString('base64');
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
  return figmaExecute(code);
}

/** Calls Story UI's stream endpoint, collects all chunks, returns final result */
async function generateViaStoryUI({ prompt, imageBase64, considerations = buildLiveContext() }) {
  const body = {
    prompt,
    visionMode: true,
    images: [`data:image/png;base64,${imageBase64}`],
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
7. Output ONLY the story file contents — no explanation, no markdown fences, no commentary.
8. The file must be valid ES module syntax importable by Vite/Storybook.`;

/**
 * Generate a Storybook story directly via Claude, bypassing Story UI entirely.
 * Uses the live design system context (spec.json + compiled CSS) as ground truth.
 */
async function generateStory({ prompt, imageBase64, figmaStructure }) {
  const dsContext = buildLiveContext();

  const userContent = [];

  if (imageBase64) {
    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: imageBase64 },
    });
  }

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

  userText += `## Task\n\n${prompt}\n\nWrite the complete Storybook story file now.`;
  userContent.push({ type: 'text', text: userText });

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  let story = response.content.find(b => b.type === 'text')?.text || '';
  // Strip accidental markdown fences
  story = story.replace(/^```[\w]*\n?/m, '').replace(/\n?```\s*$/m, '').trim();

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

// ── Inline HTML UI ────────────────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>S2A Prototype Generator</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,sans-serif;background:#1c1b19;color:#fff;height:100vh;display:flex;flex-direction:column;overflow:hidden}

/* conversation area */
.convo{flex:1;overflow-y:auto;padding:24px 0;display:flex;flex-direction:column;gap:16px}
.convo:empty+.empty-state,#emptyState{display:flex}

/* empty state */
#emptyState{flex-direction:column;align-items:center;justify-content:center;gap:12px;flex:1;pointer-events:none;padding-bottom:80px}
#emptyState h1{font-size:20px;font-weight:600;color:#f5f0e8}
#emptyState p{font-size:13px;color:#666;max-width:340px;text-align:center;line-height:1.5}
.suggestion-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;pointer-events:all}
.chip{background:#2c2b29;border:1px solid #3a3936;border-radius:99px;padding:6px 14px;font-size:12px;color:#aaa;cursor:pointer;transition:all .15s}
.chip:hover{background:#3a3936;color:#fff}

/* message cards */
.msg{padding:0 24px;max-width:800px;width:100%;margin:0 auto}
.msg-user{align-self:flex-end;max-width:600px;padding:10px 16px;background:#2c2b29;border-radius:12px;font-size:14px;color:#f5f0e8;margin:0 24px;white-space:pre-wrap}
.msg-assistant{background:#242422;border:1px solid #2e2d2b;border-radius:12px;overflow:hidden}
.msg-header{padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #2e2d2b}
.msg-title{font-size:13px;font-weight:600;color:#f5f0e8}
.msg-actions{display:flex;gap:6px}
.msg-btn{font-size:11px;padding:4px 10px;background:#1c1b19;border:1px solid #3a3936;border-radius:5px;color:#aaa;cursor:pointer;font-family:inherit;text-decoration:none;display:inline-flex;align-items:center}
.msg-btn:hover{border-color:#555;color:#fff}
.msg-code{padding:14px 16px;font-size:11.5px;font-family:ui-monospace,monospace;color:#a8d8a8;line-height:1.5;max-height:280px;overflow-y:auto;white-space:pre-wrap;word-break:break-all}
.msg-status{padding:10px 16px;font-size:12px;color:#888;border-top:1px solid #2e2d2b}

/* thinking indicator */
.thinking{padding:0 24px;max-width:800px;width:100%;margin:0 auto}
.thinking-inner{display:flex;align-items:center;gap:8px;color:#666;font-size:13px}
.dot{width:6px;height:6px;border-radius:50%;background:#555;animation:pulse 1.2s infinite}
.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
@keyframes pulse{0%,80%,100%{opacity:.3}40%{opacity:1}}

/* stories drawer */
#storiesDrawer{position:absolute;top:0;right:0;bottom:0;width:280px;background:#141413;border-left:1px solid #2e2d2b;transform:translateX(100%);transition:transform .2s;overflow-y:auto;padding:16px;z-index:10}
#storiesDrawer.open{transform:none}
.drawer-title{font-size:13px;font-weight:600;color:#f5f0e8;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
.story-item{padding:10px 12px;background:#1c1b19;border-radius:7px;margin-bottom:6px;cursor:pointer;transition:background .15s}
.story-item:hover{background:#2c2b29}
.story-name{font-size:12px;color:#ccc;margin-bottom:4px}
.story-actions{display:flex;gap:6px}
.story-link{font-size:11px;color:#6b9ee8;text-decoration:none}

/* input area */
.input-wrap{padding:12px 16px 16px;border-top:1px solid #2e2d2b;background:#1c1b19;position:relative;flex-shrink:0}
.mode-row{display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap}
.mode-pill{background:none;border:1px solid #3a3936;border-radius:99px;padding:4px 12px;font-size:11px;color:#888;cursor:pointer;font-family:inherit;transition:all .15s}
.mode-pill.active{background:#2c2b29;border-color:#555;color:#fff}
.figma-attach{display:none;align-items:center;gap:6px;background:#2c2b29;border:1px solid #3a3936;border-radius:6px;padding:4px 10px;font-size:11px;color:#aaa}
.figma-attach.show{display:flex}
.figma-attach span{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.deep-toggle{display:none;align-items:center;gap:5px;font-size:11px;color:#888;cursor:pointer}
.deep-toggle.show{display:flex}
.input-row{display:flex;gap:8px;align-items:flex-end}
textarea#prompt{flex:1;background:#2c2b29;border:1px solid #3a3936;border-radius:10px;color:#fff;padding:10px 14px;font-size:14px;font-family:inherit;outline:none;resize:none;min-height:44px;max-height:160px;line-height:1.5;transition:border .15s}
textarea#prompt:focus{border-color:#555}
.send-btn{width:40px;height:40px;background:#1473e6;border:none;border-radius:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s}
.send-btn:hover{background:#0d66d0}
.send-btn:disabled{background:#2c2b29;cursor:default}
.send-btn svg{width:18px;height:18px;fill:#fff}
.toolbar-right{display:flex;align-items:center;gap:8px}
.stories-toggle{background:none;border:1px solid #3a3936;border-radius:6px;padding:4px 10px;font-size:11px;color:#888;cursor:pointer;font-family:inherit}
.stories-toggle:hover{color:#fff;border-color:#555}
</style>
</head>
<body>

<div id="storiesDrawer">
  <div class="drawer-title">
    <span>Generated Stories</span>
    <button onclick="toggleDrawer()" style="background:none;border:none;color:#888;cursor:pointer;font-size:16px">×</button>
  </div>
  <div id="drawerList"></div>
</div>

<div id="emptyState">
  <h1>What would you like to create?</h1>
  <p>Describe a layout, paste a Figma URL, or pick a suggestion below.</p>
  <div class="suggestion-chips">
    <div class="chip" onclick="useSuggestion('A dark hero section for Adobe Firefly with ProductLockup, headline, body copy, and a primary CTA button')">Firefly hero</div>
    <div class="chip" onclick="useSuggestion('A light-surface card grid with three ElasticCards side by side')">Card grid</div>
    <div class="chip" onclick="useSuggestion('A navigation bar with NavCard components and a NavFilter')">Nav bar</div>
    <div class="chip" onclick="useSuggestion('A product showcase section with ProductLockup on dark background and two CTA buttons')">Product showcase</div>
  </div>
</div>

<div class="convo" id="convo"></div>

<div class="input-wrap">
  <div class="mode-row">
    <button class="mode-pill active" id="modePrompt" onclick="setMode('prompt')">Prompt</button>
    <button class="mode-pill" id="modeFigma" onclick="setMode('figma')">From Figma</button>
    <div class="figma-attach" id="figmaAttach">
      <span id="figmaAttachLabel">No URL</span>
      <button onclick="clearFigmaUrl()" style="background:none;border:none;color:#888;cursor:pointer;font-size:13px;padding:0">×</button>
    </div>
    <label class="deep-toggle" id="deepToggle">
      <input type="checkbox" id="deepMode" style="margin:0">
      Deep
    </label>
    <div style="flex:1"></div>
    <div class="toolbar-right">
      <button class="stories-toggle" onclick="toggleDrawer()">Stories ↗</button>
    </div>
  </div>
  <div id="figmaUrlRow" style="display:none;margin-bottom:10px">
    <input id="figmaUrlInput" type="url" placeholder="https://www.figma.com/design/…?node-id=…"
      style="width:100%;background:#2c2b29;border:1px solid #3a3936;border-radius:8px;color:#fff;padding:8px 12px;font-size:13px;font-family:inherit;outline:none"
      oninput="onFigmaUrlChange()" />
  </div>
  <div class="input-row">
    <textarea id="prompt" rows="1" placeholder="Describe what to build…" onkeydown="onKey(event)" oninput="autoResize(this)"></textarea>
    <button class="send-btn" id="sendBtn" onclick="send()">
      <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
    </button>
  </div>
</div>

<script>
let mode = 'prompt';
let iteratingFileName = null;
let iteratingCode     = null;

function setMode(m) {
  mode = m;
  document.getElementById('modePrompt').classList.toggle('active', m === 'prompt');
  document.getElementById('modeFigma').classList.toggle('active', m === 'figma');
  document.getElementById('figmaUrlRow').style.display = m === 'figma' ? 'block' : 'none';
  document.getElementById('deepToggle').classList.toggle('show', m === 'figma');
  document.getElementById('prompt').placeholder = m === 'figma'
    ? 'Intent (optional) — e.g. Hero section for Adobe Firefly…'
    : iteratingFileName ? \`Iterating on \${iteratingFileName} — describe what to change…\` : 'Describe what to build…';
}

function onFigmaUrlChange() {
  const val = document.getElementById('figmaUrlInput').value.trim();
  const attach = document.getElementById('figmaAttach');
  if (val) {
    try {
      const u = new URL(val);
      const label = u.searchParams.get('node-id') || u.pathname.split('/').pop() || val;
      document.getElementById('figmaAttachLabel').textContent = label;
      attach.classList.add('show');
    } catch { attach.classList.remove('show'); }
  } else { attach.classList.remove('show'); }
}

function clearFigmaUrl() {
  document.getElementById('figmaUrlInput').value = '';
  document.getElementById('figmaAttach').classList.remove('show');
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

function onKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
}

function useSuggestion(text) {
  document.getElementById('prompt').value = text;
  autoResize(document.getElementById('prompt'));
  document.getElementById('prompt').focus();
}

function hideEmpty() {
  document.getElementById('emptyState').style.display = 'none';
}

function addUserMsg(text) {
  hideEmpty();
  const el = document.createElement('div');
  el.className = 'msg-user';
  el.textContent = text;
  document.getElementById('convo').appendChild(el);
  scrollBottom();
}

function addThinking() {
  hideEmpty();
  const el = document.createElement('div');
  el.className = 'thinking';
  el.id = 'thinking';
  el.innerHTML = '<div class="thinking-inner"><div class="dot"></div><div class="dot"></div><div class="dot"></div><span>Generating…</span></div>';
  document.getElementById('convo').appendChild(el);
  scrollBottom();
}

function removeThinking() {
  document.getElementById('thinking')?.remove();
}

function addResultCard(data) {
  removeThinking();
  const sbSlug = (data.fileName || '').replace(/\\.stories\\.[jt]sx?$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const el = document.createElement('div');
  el.className = 'msg';
  el.innerHTML = \`
    <div class="msg-assistant">
      <div class="msg-header">
        <span class="msg-title">\${data.title || data.fileName || 'Story'}</span>
        <div class="msg-actions">
          <button class="msg-btn" onclick="iterateOn(\${JSON.stringify(data.fileName)}, this)">Iterate</button>
          <button class="msg-btn" onclick="navigator.clipboard.writeText(this.closest('.msg-assistant').querySelector('.msg-code').textContent)">Copy</button>
          <a class="msg-btn" href="http://localhost:6006/?path=/story/\${sbSlug}--default" target="_blank">Open ↗</a>
        </div>
      </div>
      <div class="msg-code">\${escHtml(data.story || '')}</div>
    </div>
  \`;
  document.getElementById('convo').appendChild(el);
  scrollBottom();
}

function addErrorCard(msg) {
  removeThinking();
  const el = document.createElement('div');
  el.className = 'msg';
  el.innerHTML = \`<div class="msg-assistant" style="border-color:#5a2020"><div class="msg-status" style="color:#e06060">❌ \${escHtml(msg)}</div></div>\`;
  document.getElementById('convo').appendChild(el);
  scrollBottom();
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function scrollBottom() {
  const c = document.getElementById('convo');
  c.scrollTop = c.scrollHeight;
}

async function send() {
  const promptEl = document.getElementById('prompt');
  const promptText = promptEl.value.trim();
  const figmaUrl   = document.getElementById('figmaUrlInput').value.trim();
  const deep       = document.getElementById('deepMode').checked;

  if (!promptText && mode === 'prompt' && !iteratingFileName) return;
  if (mode === 'figma' && !figmaUrl) { document.getElementById('figmaUrlInput').focus(); return; }

  const displayText = mode === 'figma'
    ? (figmaUrl + (promptText ? '\\n' + promptText : ''))
    : (iteratingFileName ? \`[Iterate \${iteratingFileName}]\\n\${promptText}\` : promptText);

  addUserMsg(displayText);
  promptEl.value = '';
  promptEl.style.height = 'auto';
  document.getElementById('sendBtn').disabled = true;
  addThinking();

  try {
    let res, data;

    if (iteratingFileName && iteratingCode) {
      res = await fetch('/prompt/iterate', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ existingCode: iteratingCode, prompt: promptText, fileName: iteratingFileName }),
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Iteration failed');
      iteratingCode = data.story;
    } else if (mode === 'figma') {
      const endpoint = deep ? '/figma/generate-deep' : '/figma/generate';
      res = await fetch(endpoint, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ figmaUrl, prompt: promptText }),
      });
      data = await res.json();
      if (!res.ok) throw new Error((data.hint ? data.hint + ' — ' : '') + (data.error || 'Generation failed'));
    } else {
      res = await fetch('/prompt/generate', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ prompt: promptText }),
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
    }

    addResultCard(data);
  } catch(e) { addErrorCard(e.message); }
  finally { document.getElementById('sendBtn').disabled = false; }
}

async function iterateOn(fileName, btn) {
  try {
    const res  = await fetch(\`/stories/read?file=\${encodeURIComponent(fileName)}\`);
    const data = await res.json();
    iteratingFileName = fileName;
    iteratingCode     = data.source;
    setMode('prompt');
    const promptEl = document.getElementById('prompt');
    promptEl.placeholder = \`Iterating on \${fileName} — describe what to change…\`;
    promptEl.focus();
    // Show a subtle indicator
    const indicator = document.createElement('div');
    indicator.style.cssText = 'font-size:11px;color:#888;padding:4px 0 0 2px';
    indicator.textContent = \`↩ Iterating on \${fileName}\`;
    const existing = document.querySelector('.input-wrap .iterate-indicator');
    if (existing) existing.remove();
    indicator.className = 'iterate-indicator';
    document.querySelector('.input-row').before(indicator);
  } catch(e) { alert('Could not load story: ' + e.message); }
}

// ── Stories drawer ────────────────────────────────────────────────────────────
function toggleDrawer() {
  document.getElementById('storiesDrawer').classList.toggle('open');
  loadDrawer();
}

async function loadDrawer() {
  const list = document.getElementById('drawerList');
  list.innerHTML = '<div style="font-size:12px;color:#666">Loading…</div>';
  try {
    const res  = await fetch('/stories/list');
    const data = await res.json();
    if (!data.length) { list.innerHTML = '<div style="font-size:12px;color:#666">No stories yet.</div>'; return; }
    list.innerHTML = data.map(s => {
      const sbSlug = s.fileName.replace(/\\.stories\\.[jt]sx?$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      return \`
        <div class="story-item" onclick="iterateOn('\${s.fileName}', null);toggleDrawer()">
          <div class="story-name">\${s.title || s.fileName}</div>
          <div class="story-actions">
            <span style="font-size:10px;color:#666">click to iterate</span>
            <a class="story-link" href="http://localhost:6006/?path=/story/\${sbSlug}--default" target="_blank" onclick="event.stopPropagation()">Open ↗</a>
          </div>
        </div>
      \`;
    }).join('');
  } catch { list.innerHTML = '<div style="font-size:12px;color:#666;color:#e06060">Could not load.</div>'; }
}
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
        const frameName = await fetchFigmaNodeName(fileKey, nodeId);
        console.log(`[figma→story] frame: "${frameName}" (${fileKey}/${nodeId})`);

        const imageBase64 = await fetchFigmaScreenshot(fileKey, nodeId);
        console.log(`[figma→story] screenshot: ${Math.round(imageBase64.length / 1024)}KB`);

        const fullPrompt = frameName
          ? `Generate an S2A Storybook story for the Figma frame "${frameName}".${prompt ? '\n\n' + prompt : ''}`
          : (prompt || 'Generate an S2A Storybook story for this Figma frame.');

        console.log(`[figma→story] calling Claude directly…`);
        const result = await generateStory({ prompt: fullPrompt, imageBase64 });
        console.log(`[figma→story] done → ${result.fileName}`);

        res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, previewImage: imageBase64, ...result }));
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
        console.log(`[deep→story] ${figmaUrl}`);
        const { nodeId } = parseFigmaUrl(figmaUrl);
        if (!nodeId) throw new Error('URL must include a node-id to use deep extraction');

        // Run deep extraction via Desktop Bridge
        console.log(`[deep→story] extracting structure from node ${nodeId}…`);
        const structure = await extractFigmaStructure(nodeId);
        if (structure.error) throw new Error(structure.error);
        console.log(`[deep→story] found ${structure.instances.length} instances, ${structure.textNodes.length} text nodes`);

        const deepPrompt = prompt || `Generate an S2A Storybook story for this Figma frame.`;
        console.log(`[deep→story] calling Claude directly…`);
        const result = await generateStory({ prompt: deepPrompt, figmaStructure: structure });
        const { story, fileName, title } = result;
        console.log(`[deep→story] done → ${fileName}`);

        res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, story, fileName, title, structure }));
      } catch (e) {
        console.error('[deep→story] error:', e.message);
        const isConnectionError = e.message.includes('not reachable') || e.message.includes('ECONNREFUSED');
        res.writeHead(isConnectionError ? 503 : 500, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: e.message,
          hint: isConnectionError ? 'Open Figma Desktop → Plugins → Development → figma-desktop-bridge → Run' : undefined,
        }));
      }
    });
    return;
  }

  // Prompt-only generation
  // Iterate on an existing story
  if (req.method === 'POST' && req.url === '/prompt/iterate') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', async () => {
      let existingCode, prompt, fileName;
      try { ({ existingCode, prompt, fileName } = JSON.parse(body)); }
      catch { res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'Invalid JSON' })); return; }
      if (!existingCode || !prompt) {
        res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'existingCode and prompt required' })); return;
      }
      try {
        console.log(`[iterate] "${prompt.slice(0, 60)}…"`);
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

        // Overwrite the original file if fileName matches
        if (fileName && existsSync(resolve(STORIES_DIR, fileName))) {
          writeFileSync(resolve(STORIES_DIR, fileName), result.story, 'utf8');
          console.log(`[iterate] overwrote → ${fileName}`);
        }

        res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, story: result.story, fileName: fileName || result.fileName, title: result.title }));
      } catch (e) {
        console.error('[iterate] error:', e.message);
        res.writeHead(500, CORS); res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/prompt/generate') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', async () => {
      let prompt;
      try { ({ prompt } = JSON.parse(body)); }
      catch { res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'Invalid JSON' })); return; }

      if (!prompt) {
        res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'prompt is required' }));
        return;
      }

      try {
        console.log(`[prompt→story] "${prompt.slice(0, 80)}…"`);
        const result = await generateStory({ prompt });
        const { story, fileName, title } = result;
        console.log(`[prompt→story] done → ${fileName}`);

        res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, story, fileName, title }));
      } catch (e) {
        console.error('[prompt→story] error:', e.message);
        res.writeHead(500, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, CORS); res.end();
});

server.listen(PORT, 'localhost', () => {
  const bridgePort = discoverBridgePort();
  console.log(`\n[Figma→Story] http://localhost:${PORT}`);
  console.log(`  GET  /                    — chat UI`);
  console.log(`  POST /figma/generate       — screenshot via Figma REST API`);
  console.log(`  POST /figma/generate-deep  — deep extraction via Desktop Bridge (ws:${bridgePort})`);
  console.log(`  POST /prompt/generate      — text-only generation`);
  console.log(`  GET  /figma/info?url=      — parse + node name`);
  console.log(`\n  Desktop Bridge: ${bridgePort === 9223 ? 'using default port 9223' : `discovered on port ${bridgePort}`}\n`);
});
