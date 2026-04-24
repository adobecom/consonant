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
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..', '..', '..');
const PORT      = 4002;
const STORY_UI  = 'http://localhost:4001';
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN || process.env.FIGMA_REST_API || '';

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

/** Calls Story UI's stream endpoint, collects all chunks, returns final result */
async function generateViaStoryUI({ prompt, imageBase64, considerations }) {
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

// ── Inline HTML UI ────────────────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Figma → S2A Story</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,sans-serif;background:#1c1b19;color:#fff;min-height:100vh;padding:32px 24px}
  h1{font-size:18px;font-weight:600;margin-bottom:24px;color:#f5f0e8}
  label{display:block;font-size:12px;color:#aaa;margin-bottom:6px;margin-top:16px}
  input,textarea{width:100%;background:#2c2b29;border:1px solid #3a3936;border-radius:8px;color:#fff;padding:10px 12px;font-size:14px;font-family:inherit;outline:none}
  input:focus,textarea:focus{border-color:#6b6760}
  textarea{resize:vertical;min-height:80px}
  button{margin-top:20px;width:100%;padding:12px;background:#1473e6;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}
  button:disabled{opacity:0.5;cursor:default}
  #status{margin-top:16px;font-size:12px;color:#aaa;min-height:20px}
  #output{margin-top:20px;background:#111;border-radius:8px;padding:16px;display:none}
  #output h2{font-size:13px;color:#aaa;margin-bottom:8px}
  pre{font-size:12px;color:#a8d8a8;overflow-x:auto;white-space:pre-wrap;word-break:break-all}
  .preview-img{margin-top:16px;width:100%;border-radius:8px;border:1px solid #3a3936;display:none}
  .max{max-width:680px;margin:0 auto}
</style>
</head>
<body>
<div class="max">
  <h1>Figma → S2A Story Generator</h1>
  <label for="figmaUrl">Figma URL (frame or selection)</label>
  <input id="figmaUrl" type="url" placeholder="https://www.figma.com/design/…?node-id=…" />
  <label for="prompt">Prompt (optional — describe intent)</label>
  <textarea id="prompt" placeholder="e.g. Generate a hero section for Adobe Firefly. Use ProductLockup and a primary CTA button."></textarea>
  <button id="genBtn">Generate from Figma</button>
  <div id="status"></div>
  <img id="preview" class="preview-img" alt="Figma frame" />
  <div id="output">
    <h2 id="outTitle"></h2>
    <pre id="outCode"></pre>
  </div>
</div>
<script>
const btn    = document.getElementById('genBtn');
const status = document.getElementById('status');
const output = document.getElementById('output');
const preview = document.getElementById('preview');

btn.addEventListener('click', async () => {
  const figmaUrl = document.getElementById('figmaUrl').value.trim();
  const prompt   = document.getElementById('prompt').value.trim();
  if (!figmaUrl) { status.textContent = 'Paste a Figma URL first.'; return; }

  btn.disabled = true;
  output.style.display = 'none';
  preview.style.display = 'none';
  status.textContent = '⏳ Fetching Figma frame…';

  try {
    const res = await fetch('/figma/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ figmaUrl, prompt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Generation failed');

    if (data.previewImage) {
      preview.src = 'data:image/png;base64,' + data.previewImage;
      preview.style.display = 'block';
    }
    document.getElementById('outTitle').textContent = data.title || data.fileName || 'Generated story';
    document.getElementById('outCode').textContent  = data.story || '(no story returned)';
    output.style.display = 'block';
    status.textContent = '✓ Story written to apps/storybook/stories/generated/' + (data.fileName || '');
  } catch (e) {
    status.textContent = '❌ ' + e.message;
  } finally {
    btn.disabled = false;
  }
});
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

        const considerations = await getConsiderations();
        const fullPrompt = [
          frameName ? `Figma frame: "${frameName}"` : null,
          prompt || `Generate an S2A prototype for this Figma frame. Use S2A components (Button, ProductLockup, ElasticCard, NavCard) wherever possible. Use only S2A tokens for all colors and spacing. Never hardcode hex values or raw pixel values.`,
        ].filter(Boolean).join('\n\n');

        console.log(`[figma→story] calling Story UI with vision mode…`);
        const result = await generateViaStoryUI({ prompt: fullPrompt, imageBase64, considerations });
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

  res.writeHead(404, CORS); res.end();
});

server.listen(PORT, 'localhost', () => {
  console.log(`\n[Figma→Story] http://localhost:${PORT}`);
  console.log(`  GET  /              — chat UI`);
  console.log(`  POST /figma/generate — { figmaUrl, prompt? } → story`);
  console.log(`  GET  /figma/info?url=<figma-url> — parse + node name\n`);
});
