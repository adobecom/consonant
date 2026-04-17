import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// ── Input sanitisation for code interpolation ──────────────────────────────
/** Validate a Figma node ID — only alphanumerics, colons, semicolons, hyphens. */
function assertNodeId(id: string): string {
  if (!/^[A-Za-z0-9:;\-]+$/.test(id)) throw new Error(`Invalid node ID: ${id}`);
  return id;
}
/** Escape a string for safe interpolation into a JS single-quoted string literal. */
function escapeJsString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

const AGENT_GROUPS = [
  { name: 'Structure', cardKeys: ['headingHierarchy'], knowledgeKeys: ['headingHierarchy'] },
  { name: 'Landmarks & Navigation', cardKeys: ['landmarks', 'skipNav', 'consistentNav'], knowledgeKeys: ['landmarks', 'skipNav', 'consistentNav'] },
  { name: 'Names & Images', cardKeys: ['accessibleNames', 'altText'], knowledgeKeys: ['accessibleNames', 'altText'] },
  { name: 'Interactive Patterns', cardKeys: ['ariaRoles', 'keyboardPatterns', 'domStrategy'], knowledgeKeys: ['ariaRoles', 'keyboardPatterns', 'domStrategy'] },
  { name: 'Visual', cardKeys: ['colorContrast', 'targetSize'], knowledgeKeys: ['colorContrast', 'targetSize'] },
  { name: 'Page Setup', cardKeys: ['pageTitle', 'language'], knowledgeKeys: ['pageTitle', 'language'] },
  { name: 'Responsive & Forms', cardKeys: ['reflow', 'forms'], knowledgeKeys: ['reflow', 'forms'] },
  { name: 'Motion & Media', cardKeys: ['reducedMotion', 'media', 'autoRotation'], knowledgeKeys: ['reducedMotion', 'media', 'autoRotation'] },
  { name: 'Focus', cardKeys: ['focusIndicators', 'focusOrder'], knowledgeKeys: ['focusIndicators', 'focusOrder'] },
  { name: 'Screen Reader & Platform Notes', cardKeys: ['voiceover', 'talkback', 'narrator', 'reactNative', 'tvNote', 'generalNote'], knowledgeKeys: ['screenReaderNotes', 'reactNative', 'tvNote', 'generalNote'] },
] as const;

const SCAN_FIELDS_BY_GROUP: Record<string, string[]> = {
  'Structure': ['textNodes'],
  'Landmarks & Navigation': ['textNodes', 'repeatingGroups', 'focusableElements'],
  'Names & Images': ['textNodes', 'iconFrames', 'imageNodes', 'focusableElements'],
  'Interactive Patterns': ['repeatingGroups', 'overlays', 'pairedStacks', 'focusableElements'],
  'Visual': ['textNodes', 'focusableElements', 'iconFrames'],
  'Page Setup': ['textNodes'],
  'Responsive & Forms': ['textNodes', 'focusableElements', 'repeatingGroups'],
  'Motion & Media': ['repeatingGroups', 'overlays', 'imageNodes'],
  'Focus': ['focusableElements'],
  'Screen Reader & Platform Notes': ['repeatingGroups', 'overlays', 'pairedStacks', 'focusableElements'],
};

// ── Preload accessibility knowledge files at startup ────────────────────────
// Read once, embed in figma_get_blueline_data responses so agents never need
// additional file reads.
const __dirname_mcp = dirname(fileURLToPath(import.meta.url));
const skillsDir = resolve(__dirname_mcp, '..', '..', 'skills', 'accessibility');

function loadKnowledge(filename: string): string {
  try {
    return readFileSync(resolve(skillsDir, filename), 'utf-8');
  } catch {
    return `[File not found: ${filename}]`;
  }
}

// Cache file reads — several keys share the same source file
const _accessibleNames = loadKnowledge('accessible-names.md');
const _wcagPatterns = loadKnowledge('wcag-patterns.md');
const _carousel = loadKnowledge('carousel-a11y.md');
const _screenReader = loadKnowledge('screen-reader-notes.md');

const KNOWLEDGE: Record<string, string> = {
  headingHierarchy: loadKnowledge('heading-hierarchy.md'),
  landmarks: loadKnowledge('landmarks-guide.md'),
  accessibleNames: _accessibleNames,
  altText: _accessibleNames,
  ariaRoles: _wcagPatterns,
  keyboardPatterns: _wcagPatterns,
  domStrategy: [_wcagPatterns, _carousel].join('\n\n---\n\n'),
  colorContrast: loadKnowledge('color-contrast.md'),
  forms: loadKnowledge('forms-a11y.md'),
  targetSize: loadKnowledge('target-size.md'),
  reflow: loadKnowledge('reflow-text-spacing.md'),
  language: loadKnowledge('language.md'),
  media: loadKnowledge('time-based-media.md'),
  skipNav: loadKnowledge('skip-navigation.md'),
  pageTitle: loadKnowledge('page-title.md'),
  reducedMotion: loadKnowledge('reduced-motion.md'),
  consistentNav: loadKnowledge('consistent-navigation.md'),
  autoRotation: _carousel,
  screenReaderNotes: _screenReader,
  focusIndicators: loadKnowledge('focus-indicators.md'),
  focusOrder: loadKnowledge('focus-order.md'),
  reactNative: _screenReader,
  tvNote: _screenReader,
  generalNote: _screenReader,
};

// log happens after log() is defined — see below

// ── WebSocket Bridge Server ─────────────────────────────────────────────────
// Runs a WS server that the consonant-specs-plugin (Figma Desktop) connects to.
// Uses ports 9220-9222 (before figma-console-mcp's 9223-9232 range) so the
// plugin finds us first when scanning.

const WS_PORTS = [9220, 9221, 9222];

let pluginSocket: WebSocket | null = null;
let sessionNonce: string | null = null;
let connectedPort: number | null = null;
let requestCounter = 0;
const pendingRequests = new Map<string, {
  resolve: (v: any) => void;
  reject: (e: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}>();

// Resolves when the plugin connects and sends FILE_INFO
let pluginReadyResolve: (() => void) | null = null;
let pluginReadyPromise: Promise<void> | null = null;

function resetPluginReady() {
  pluginReadyPromise = new Promise((resolve) => { pluginReadyResolve = resolve; });
}
resetPluginReady();

function log(msg: string) {
  process.stderr.write(`[consonant-mcp] ${msg}\n`);
}

/** Try to start a WS server on one of the preferred ports. */
function startWsServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    let portIndex = 0;

    function tryNext() {
      if (portIndex >= WS_PORTS.length) {
        reject(new Error(`Could not bind to any port in [${WS_PORTS.join(', ')}]`));
        return;
      }
      const port = WS_PORTS[portIndex++];
      const httpServer = createServer();
      const wss = new WebSocketServer({ server: httpServer });

      wss.on('connection', (socket) => {
        // If there's already a plugin connected, replace it
        if (pluginSocket && pluginSocket.readyState === WebSocket.OPEN) {
          pluginSocket.close(1000, 'Replaced by new connection');
        }

        pluginSocket = socket;
        sessionNonce = null;
        log('Plugin connected');

        // Send SERVER_HELLO so the plugin knows who we are
        socket.send(JSON.stringify({
          type: 'SERVER_HELLO',
          data: { serverVersion: '0.2.0', serverName: 'consonant-mcp' },
        }));

        socket.on('message', (data) => {
          try {
            const msg = JSON.parse(data.toString());

            // FILE_INFO from plugin — contains the session nonce
            if (msg.type === 'FILE_INFO' && msg.data) {
              sessionNonce = msg.data.sessionNonce || null;
              log(`FILE_INFO: ${msg.data.fileName || 'unknown'} (nonce: ${sessionNonce ? 'yes' : 'none'})`);
              if (pluginReadyResolve) { pluginReadyResolve(); pluginReadyResolve = null; }
              return;
            }

            // VARIABLES_DATA — auto-sync from plugin, store if needed
            if (msg.type === 'VARIABLES_DATA') return;

            // Auto-fill request from plugin UI
            if (msg.type === 'START_AUTO_FILL' && msg.data) {
              handleAutoFill(msg.data, socket);
              return;
            }

            // Response to a pending request
            if (msg.id && pendingRequests.has(msg.id)) {
              const pending = pendingRequests.get(msg.id)!;
              pendingRequests.delete(msg.id);
              clearTimeout(pending.timeout);
              if (msg.error) {
                pending.reject(new Error(msg.error));
              } else {
                pending.resolve(msg.result);
              }
              return;
            }
          } catch {
            // ignore malformed
          }
        });

        socket.on('close', () => {
          log('Plugin disconnected');
          if (pluginSocket === socket) {
            pluginSocket = null;
            sessionNonce = null;
          }
          // Reject all pending requests
          for (const [id, pending] of pendingRequests) {
            clearTimeout(pending.timeout);
            pending.reject(new Error('Plugin disconnected'));
            pendingRequests.delete(id);
          }
          // Reset the ready promise for next connection
          resetPluginReady();
        });

        socket.on('error', () => { /* onclose will fire */ });
      });

      httpServer.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          log(`Port ${port} in use, trying next...`);
          tryNext();
        } else {
          reject(err);
        }
      });

      httpServer.listen(port, '127.0.0.1', () => {
        connectedPort = port;
        resolve(port);
      });
    }

    tryNext();
  });
}

/** Ensure the plugin is connected and ready (FILE_INFO received). */
async function ensureConnected(): Promise<WebSocket> {
  if (pluginSocket && pluginSocket.readyState === WebSocket.OPEN) {
    return pluginSocket;
  }

  // Wait for plugin to connect (up to 30s)
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(
      'No plugin connected. Make sure the consonant-specs-plugin is running in Figma Desktop ' +
      'and click "Connect" on the Bridge tab.'
    )), 30000)
  );
  await Promise.race([pluginReadyPromise, timeout]);

  if (!pluginSocket || pluginSocket.readyState !== WebSocket.OPEN) {
    throw new Error('Plugin connection lost');
  }
  return pluginSocket;
}

/** Send a command to the plugin and wait for the response. */
async function sendCommand(
  method: string,
  params: Record<string, any>,
  timeoutMs = 15000
): Promise<any> {
  const sock = await ensureConnected();
  const id = `mcp_${method.toLowerCase()}_${++requestCounter}_${Date.now()}`;

  // Attach nonce for EXECUTE_CODE
  if (method === 'EXECUTE_CODE' && sessionNonce) {
    params = { ...params, sessionNonce };
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error(`${method} timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    pendingRequests.set(id, { resolve, reject, timeout });

    sock.send(JSON.stringify({ id, method, params }));
  });
}

// ── Auto-fill via claude -p ─────────────────────────────────────────────────

let autoFillRunning = false;

async function handleAutoFill(
  _data: Record<string, unknown>,
  socket: WebSocket,
) {
  if (autoFillRunning) {
    socket.send(JSON.stringify({ type: 'AUTO_FILL_FAILED', data: { error: 'Auto-fill already in progress' } }));
    return;
  }

  autoFillRunning = true;

  try {
    // 1. Get blueline data from plugin
    log('Auto-fill: fetching blueline data...');
    const blData = await sendCommand('GET_BLUELINE_DATA', {}, 15000);
    const scan = (blData as any)?.structuralScan || {};
    const cards: Array<{ name: string; nodeId: string; categoryKey: string }> = (blData as any)?.bluelineCards || [];
    const focusOrder = (blData as any)?.focusOrder || [];
    const targetFrameId = (blData as any)?.targetFrameId;

    if (cards.length === 0) {
      socket.send(JSON.stringify({ type: 'AUTO_FILL_FAILED', data: { error: 'No blueline cards found. Generate scaffold first.' } }));
      autoFillRunning = false;
      return;
    }

    const activeCardKeys = new Set<string>(cards.map(c => c.categoryKey));
    const activeGroups = AGENT_GROUPS.filter(g => g.cardKeys.some(k => activeCardKeys.has(k)));

    // 3. Gather all relevant knowledge
    const knowledgeContent: Record<string, string> = {};
    for (const group of activeGroups) {
      for (const key of group.knowledgeKeys) {
        if (KNOWLEDGE[key] && !knowledgeContent[key]) {
          knowledgeContent[key] = KNOWLEDGE[key];
        }
      }
    }

    // 4. Build prompt
    const prompt = `You are an accessibility spec writer producing concise blueline annotation cards for a Figma design. Write like a spec — short, scannable, no prose.

## Structural Scan
${JSON.stringify(scan, null, 2)}

## Cards to Fill
${cards.map(c => `- ${c.categoryKey} (cardId: ${c.nodeId})`).join('\n')}

## Focus Order Data
${JSON.stringify(focusOrder, null, 2)}

## Knowledge Reference
${Object.entries(knowledgeContent).map(([key, content]) => `### ${key}\n${content}`).join('\n\n---\n\n')}

## Instructions
For each card category listed above, produce accessibility annotation content.

STYLE — match this example EXACTLY:

Example landmarks card:
{"title": "banner", "desc": "top navigation bar (Adobe logo + nav links + Sign In)"}
{"title": "main", "desc": "hero content area (heading, body text, CTAs)"}
{"title": "navigation", "desc": "primary nav links (Products, Use Cases, Solutions, Learn & Support, Plans)"}
{"title": "region", "desc": "product router card carousel (5 category cards + play/pause)"}

Example accessible names card:
{"title": "Adobe logo", "desc": "aria-label=\"Adobe Home\""}
{"title": "Play/Pause button", "desc": "aria-label=\"Pause auto-rotation\" (toggles to \"Play auto-rotation\")"}
{"title": "Each product card", "desc": "accessible name from visible text (e.g. \"Creativity and design\")"}

RULES:
- Title: short element/region name (1-5 words)
- Desc: parenthetical summary or attr shorthand. ONE line. Under 80 chars.
- 4-8 items per card max
- Notes: 1-2 WCAG refs, terse (e.g. "WCAG 1.3.1 — exactly one H1 per page. No skipped levels.")
- Warnings: only real issues, 1 line (e.g. "Missing H2 for product router section")
- NO full sentences. NO explanations. NO paragraphs. Just specs.

Each card needs:
- items: array of {title, desc} pairs
- notes: array of WCAG refs (short)
- warnings: array of issues (short)

For focusOrder: also produce a "focusOrder" array of {nodeId, name} from the Focus Order Data above, representing the correct tab order. Use the nodeIds exactly as given.

Output ONLY valid JSON — no markdown, no explanation:
{
  "cards": {
    "<categoryKey>": {
      "items": [{"title": "...", "desc": "..."}],
      "notes": ["..."],
      "warnings": ["..."]
    }
  },
  "focusOrder": [{"nodeId": "...", "name": "..."}]
}`;

    // 5. Notify UI — started
    socket.send(JSON.stringify({ type: 'AUTO_FILL_STARTED' }));
    log(`Auto-fill: spawning claude -p (${cards.length} cards, ${Object.keys(knowledgeContent).length} knowledge files)...`);

    // 6. Spawn claude -p
    const proc = spawn('claude', ['-p', '--model', 'sonnet', '--output-format', 'json'], {
      cwd: '/tmp', // No .mcp.json here — prevents MCP server port conflicts
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

    // Write prompt to stdin
    proc.stdin.write(prompt);
    proc.stdin.end();

    proc.on('close', async (code) => {
      try {
        if (code !== 0) {
          log(`Auto-fill: claude -p exited with code ${code}. stderr: ${stderr.slice(0, 500)}`);
          socket.send(JSON.stringify({ type: 'AUTO_FILL_FAILED', data: { error: `claude -p exited with code ${code}` } }));
          return;
        }

        // 7. Parse output — claude --output-format json wraps in {"type":"result","result":"..."}
        log(`Auto-fill: parsing output (${stdout.length} bytes)...`);
        let fillData: any;
        try {
          const parsed = JSON.parse(stdout);
          // --output-format json returns { result: "..." } — the result is the text content
          const resultText = typeof parsed.result === 'string' ? parsed.result : stdout;
          // Extract JSON from the result text (may have markdown fences)
          const jsonMatch = resultText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            fillData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON object found in output');
          }
        } catch (parseErr: any) {
          log(`Auto-fill: parse error — ${parseErr.message}. Raw output: ${stdout.slice(0, 1000)}`);
          socket.send(JSON.stringify({ type: 'AUTO_FILL_FAILED', data: { error: 'Failed to parse AI output' } }));
          return;
        }

        // 8. Render into Figma
        log('Auto-fill: rendering blueline...');
        const renderResult = await sendCommand('RENDER_BLUELINE', {
          nodeId: targetFrameId,
          cards: fillData.cards || {},
          focusOrder: fillData.focusOrder,
        }, 60000);

        log('Auto-fill: complete!');
        socket.send(JSON.stringify({
          type: 'AUTO_FILL_COMPLETE',
          data: {
            filledCards: Object.keys(fillData.cards || {}),
            renderResult,
          },
        }));
      } catch (err: any) {
        log(`Auto-fill: render error — ${err.message}`);
        socket.send(JSON.stringify({ type: 'AUTO_FILL_FAILED', data: { error: err.message } }));
      } finally {
        autoFillRunning = false;
      }
    });

    proc.on('error', (err) => {
      log(`Auto-fill: spawn error — ${err.message}`);
      socket.send(JSON.stringify({ type: 'AUTO_FILL_FAILED', data: { error: `Failed to spawn claude: ${err.message}` } }));
      autoFillRunning = false;
    });

  } catch (err: any) {
    log(`Auto-fill: error — ${err.message}`);
    socket.send(JSON.stringify({ type: 'AUTO_FILL_FAILED', data: { error: err.message } }));
    autoFillRunning = false;
  }
}

// ── MCP Server ──────────────────────────────────────────────────────────────

const server = new McpServer({
  name: 'consonant-specs',
  version: '0.2.0',
});

// ── Code Execution ──

server.tool(
  'figma_execute',
  'Execute arbitrary JavaScript/TypeScript code in the Figma plugin sandbox. Has access to the full Figma Plugin API.',
  {
    code: z.string().describe('JavaScript code to execute in the Figma plugin sandbox'),
    timeout: z.number().optional().describe('Execution timeout in ms (default 5000, max 30000)'),
  },
  async ({ code, timeout }) => {
    const result = await sendCommand('EXECUTE_CODE', { code, timeout }, (timeout || 5000) + 5000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_get_status',
  'Get the current connection status and file info from the Figma plugin.',
  {},
  async () => {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          connected: !!(pluginSocket && pluginSocket.readyState === WebSocket.OPEN),
          port: connectedPort,
          hasNonce: !!sessionNonce,
        }),
      }],
    };
  }
);

// ── Screenshot ──

server.tool(
  'figma_take_screenshot',
  'Capture a screenshot of a specific node or the current page in Figma.',
  {
    nodeId: z.string().optional().describe('Node ID to capture. If omitted, captures current page.'),
    format: z.enum(['PNG', 'JPG', 'SVG']).optional().describe('Image format (default PNG)'),
    scale: z.number().optional().describe('Scale factor (default 1)'),
  },
  async ({ nodeId, format, scale }) => {
    const result = await sendCommand('CAPTURE_SCREENSHOT', { nodeId, format, scale }, 30000);
    if (result?.image?.base64) {
      const mimeType = (format || 'PNG') === 'SVG' ? 'image/svg+xml'
        : (format || 'PNG') === 'JPG' ? 'image/jpeg' : 'image/png';
      return {
        content: [{
          type: 'image',
          data: result.image.base64,
          mimeType,
        }],
      };
    }
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── File Info ──

server.tool(
  'figma_get_file_info',
  'Get information about the currently open Figma file.',
  {},
  async () => {
    const result = await sendCommand('GET_FILE_INFO', {});
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── Blueline ──

server.tool(
  'figma_generate_blueline',
  'Generate accessibility blueline scaffolding on the selected node. After scaffolding completes, call figma_get_blueline_data — it returns structural data AND all expert knowledge preloaded. Dispatch parallel agents using the embedded knowledge (no file reads needed), then call figma_render_blueline with all card JSON.',
  {
    nodeId: z.string().optional().describe('Node ID to annotate. Uses current selection if omitted.'),
    categories: z.array(z.string()).optional().describe('Annotation categories to scaffold (e.g. headingHierarchy, landmarks, focusOrder)'),
  },
  async ({ nodeId, categories }) => {
    const result = await sendCommand('GENERATE_BLUELINE', { nodeId, categories }, 120000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_get_blueline_data',
  'Get blueline state + preloaded expert knowledge for AI fill. Returns structural scan, focus order, card info, orchestration instructions, AND full knowledge file contents for every category — agents can start immediately with zero file reads.',
  {
  },
  async () => {
    const result = await sendCommand('GET_BLUELINE_DATA', {}, 15000);

    // Take screenshot of the target design frame (not the whole page)
    const targetFrameId = (result as any)?.targetFrameId || undefined;
    const screenshot = await sendCommand('CAPTURE_SCREENSHOT', { nodeId: targetFrameId, scale: 0.5 }, 15000).catch(() => null);

    const agentGroups = AGENT_GROUPS.map(g => ({
      ...g,
      scanFields: SCAN_FIELDS_BY_GROUP[g.name] || [],
    }));

    // Build scan summary — tells Claude which scan fields have data
    const scan = (result as any)?.structuralScan || {};
    const scanSummary: Record<string, number> = {};
    for (const field of ['textNodes', 'repeatingGroups', 'imageNodes', 'iconFrames', 'pairedStacks', 'overlays', 'focusableElements']) {
      const val = scan[field];
      scanSummary[field] = Array.isArray(val) ? val.length : 0;
    }

    // Filter agent groups: only include groups whose cards exist in this blueline
    const bluelineCards = (result as any)?.bluelineCards || [];
    const activeCardKeys = new Set<string>(bluelineCards.map((c: any) => c.categoryKey));

    const filteredGroups = agentGroups
      .map(g => {
        const activeKeys = g.cardKeys.filter(k => activeCardKeys.has(k));
        if (activeKeys.length === 0) return null;
        return { ...g, cardKeys: activeKeys, knowledgeKeys: activeKeys.map(k => g.knowledgeKeys.includes(k) ? k : g.knowledgeKeys[0]).filter((v, i, a) => a.indexOf(v) === i) };
      })
      .filter(Boolean);

    // Conditional skip: if ALL scanFields for a group are empty, mark it skippable
    // (agents still spawn but return items:[] — this hint lets Claude skip the spawn entirely)
    const skippableGroups: string[] = [];
    for (const g of filteredGroups) {
      if (!g) continue;
      // Groups that always need analysis (they use screenshot + general knowledge, not just scan data)
      const ALWAYS_RUN = new Set(['Structure', 'Landmarks & Navigation', 'Visual', 'Page Setup', 'Focus', 'Names & Images']);
      if (ALWAYS_RUN.has(g.name)) continue;
      const allEmpty = g.scanFields.every(f => scanSummary[f] === 0);
      if (allEmpty) skippableGroups.push(g.name);
    }

    // Orchestration instructions
    const instructions = {
      workflow: 'For each agent group: call figma_get_knowledge with the group knowledgeKeys, then dispatch the agent with the knowledge + trimmed scan data. Dispatch all agents in parallel. Then call figma_render_blueline once with all card data.',
      agentArchitecture: 'Each agent group has: cardKeys (cards to fill), scanFields (which structural scan fields to include in its prompt), knowledgeKeys (which knowledge to fetch via figma_get_knowledge). Trim the structural scan to only the listed scanFields before passing to the agent. Each agent returns JSON for ALL its cardKeys.',
      critical: 'Fetch knowledge via figma_get_knowledge BEFORE dispatching agents. Each agent prompt MUST include the FULL CONTENT returned. Do NOT summarize. Do NOT use general knowledge.',
      skipHint: skippableGroups.length > 0
        ? `These agent groups have NO scan data and can be SKIPPED (do not spawn an agent — return items:[] for their cardKeys directly): ${skippableGroups.join(', ')}. This saves time. Still render their cards with empty items so the blueline is complete.`
        : 'All agent groups have scan data — dispatch all of them.',
      scanSummary,
      agentGroups: filteredGroups,
    };

    // Knowledge is NOT embedded here — it's too large and causes truncation.
    // Use figma_get_knowledge to fetch knowledge per agent group before dispatching.
    const availableKnowledge = Object.keys(KNOWLEDGE);

    // Build response — include screenshot as base64 image if captured
    const responseData = { ...result, instructions, availableKnowledge };
    const content: any[] = [{ type: 'text', text: JSON.stringify(responseData, null, 2) }];
    if (screenshot?.image?.base64) {
      content.push({
        type: 'image',
        data: screenshot.image.base64,
        mimeType: screenshot.image.format === 'JPG' ? 'image/jpeg' : 'image/png',
      });
    }

    return { content };
  }
);

server.tool(
  'figma_get_knowledge',
  'Get preloaded accessibility knowledge for specific categories. Call this once per agent group before dispatching — pass the knowledgeKeys from the agent group definition. Returns full knowledge content for each key.',
  {
    keys: z.array(z.string()).describe('Knowledge keys to fetch (from agentGroup.knowledgeKeys)'),
  },
  async ({ keys }) => {
    const result: Record<string, string> = {};
    for (const key of keys) {
      if (KNOWLEDGE[key]) {
        result[key] = KNOWLEDGE[key];
      }
    }
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_create_focus_annotations',
  'Create focus order sidebar, numbered badges, and focus indicator rectangles on the design. Provide the correct focus order with accessible names — the tool handles all visual creation in one fast call.',
  {
    nodeId: z.string().optional().describe('Target frame node ID. Uses current selection if omitted.'),
    focusOrder: z.array(z.object({
      nodeId: z.string().describe('Node ID of the interactive element'),
      name: z.string().describe('Accessible name for this element (e.g. "Learn more", "Adobe Home", "Products")'),
    })).describe('Ordered array of interactive elements in correct tab/reading order'),
  },
  async ({ nodeId, focusOrder }) => {
    const result = await sendCommand('CREATE_FOCUS_ANNOTATIONS', { nodeId, focusOrder }, 30000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_fill_card',
  'Fill a blueline card with structured content. Items render as bold title + gray description pairs separated by dividers. Notes render in blue, warnings in orange.',
  {
    cardId: z.string().describe('Node ID of the blueline card to fill'),
    items: z.array(z.object({
      title: z.string().describe('Bold black title (e.g. element name, concept)'),
      desc: z.string().describe('Gray description text below the title'),
    })).describe('Content items — each renders as title/description pair with dividers between'),
    notes: z.array(z.string()).optional().describe('WCAG reference notes (rendered in blue, 10px)'),
    warnings: z.array(z.string()).optional().describe('Warnings and issues (rendered in orange semi-bold, 10px)'),
  },
  async ({ cardId, items, notes, warnings }) => {
    const result = await sendCommand('FILL_CARD', { cardId, items, notes, warnings }, 15000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_render_blueline',
  'Render all blueline content in one call. In flat mode (default): fills all cards and optionally creates focus annotations. In panels mode: places native Figma annotations and region overlays on cloned designs.',
  {
    mode: z.enum(['flat', 'panels']).default('flat').describe('Rendering mode: "flat" fills card frames (default), "panels" places native annotations on cloned designs'),
    nodeId: z.string().optional().describe('Target frame node ID (for focus annotations in flat mode). Uses current selection if omitted.'),
    cards: z.record(z.string(), z.object({
      items: z.array(z.object({
        title: z.string().describe('Bold black title'),
        desc: z.string().describe('Gray description text'),
        nodeId: z.string().nullable().optional().describe('(panels mode) Node ID of the element this item refers to in the original design. Null for abstract/page-level items.'),
        annotationType: z.enum(['element', 'region', 'none']).optional().describe('(panels mode) How to visualize: "element" = native annotation on node, "region" = colored overlay + annotation, "none" = WCAG footer only'),
      })),
      notes: z.array(z.string()).optional().describe('WCAG notes (blue)'),
      warnings: z.array(z.string()).optional().describe('Warnings (orange)'),
    })).describe('Map of category key → card content. Keys match card names (e.g. "headingHierarchy", "landmarks", "altText")'),
    focusOrder: z.array(z.object({
      nodeId: z.string().describe('Node ID of the interactive element'),
      name: z.string().describe('Accessible name for this element'),
    })).optional().describe('Focus order entries — creates sidebar, badges, and focus rectangles (flat mode only)'),
  },
  async ({ mode, nodeId, cards, focusOrder }) => {
    if (mode === 'panels') {
      // Transform cards into panels format for RENDER_BLUELINE_PANELS
      const panels: Record<string, { items: Array<{ title: string; desc: string; nodeId: string | null; annotationType: 'element' | 'region' | 'none' }>; notes: string[]; warnings: string[] }> = {};
      for (const [key, data] of Object.entries(cards)) {
        panels[key] = {
          items: data.items.map(item => ({
            title: item.title,
            desc: item.desc,
            nodeId: item.nodeId ?? null,
            annotationType: item.annotationType ?? 'none',
          })),
          notes: data.notes || [],
          warnings: data.warnings || [],
        };
      }
      const result = await sendCommand('RENDER_BLUELINE_PANELS', { panels }, 60000);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    // Default: flat mode
    const result = await sendCommand('RENDER_BLUELINE', { nodeId, cards, focusOrder }, 60000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── Variable Tools ──

server.tool(
  'figma_get_variables',
  'Get all local variables and variable collections from the Figma file.',
  {},
  async () => {
    const result = await sendCommand('GET_VARIABLES_DATA', {}, 300000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_create_variable',
  'Create a new variable in a variable collection.',
  {
    name: z.string().describe('Variable name'),
    collectionId: z.string().describe('Variable collection ID'),
    resolvedType: z.string().describe('Variable type: COLOR, FLOAT, STRING, or BOOLEAN'),
    valuesByMode: z.record(z.string(), z.unknown()).optional().describe('Values by mode ID'),
    description: z.string().optional().describe('Variable description'),
    scopes: z.array(z.string()).optional().describe('Variable scopes'),
  },
  async (params) => {
    const result = await sendCommand('CREATE_VARIABLE', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_update_variable',
  'Update a variable value for a specific mode.',
  {
    variableId: z.string().describe('Variable ID'),
    modeId: z.string().describe('Mode ID to set the value for'),
    value: z.unknown().describe('New value (hex string for COLOR, number for FLOAT, etc.)'),
  },
  async (params) => {
    const result = await sendCommand('UPDATE_VARIABLE', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_delete_variable',
  'Delete a variable by ID.',
  {
    variableId: z.string().describe('Variable ID to delete'),
  },
  async ({ variableId }) => {
    const result = await sendCommand('DELETE_VARIABLE', { variableId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_create_variable_collection',
  'Create a new variable collection.',
  {
    name: z.string().describe('Collection name'),
    initialModeName: z.string().optional().describe('Name for the initial mode'),
    additionalModes: z.array(z.string()).optional().describe('Additional mode names to add'),
  },
  async (params) => {
    const result = await sendCommand('CREATE_VARIABLE_COLLECTION', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_delete_variable_collection',
  'Delete a variable collection by ID.',
  {
    collectionId: z.string().describe('Collection ID to delete'),
  },
  async ({ collectionId }) => {
    const result = await sendCommand('DELETE_VARIABLE_COLLECTION', { collectionId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_rename_variable',
  'Rename a variable.',
  {
    variableId: z.string().describe('Variable ID'),
    newName: z.string().describe('New name for the variable'),
  },
  async (params) => {
    const result = await sendCommand('RENAME_VARIABLE', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_set_variable_description',
  'Set the description of a variable.',
  {
    variableId: z.string().describe('Variable ID'),
    description: z.string().describe('New description'),
  },
  async (params) => {
    const result = await sendCommand('SET_VARIABLE_DESCRIPTION', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_add_mode',
  'Add a new mode to a variable collection.',
  {
    collectionId: z.string().describe('Variable collection ID'),
    modeName: z.string().describe('Name for the new mode'),
  },
  async (params) => {
    const result = await sendCommand('ADD_MODE', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_rename_mode',
  'Rename a mode in a variable collection.',
  {
    collectionId: z.string().describe('Variable collection ID'),
    modeId: z.string().describe('Mode ID to rename'),
    newName: z.string().describe('New name for the mode'),
  },
  async (params) => {
    const result = await sendCommand('RENAME_MODE', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_get_token_values',
  'Refresh and get all variable/token values from the file.',
  {},
  async () => {
    const result = await sendCommand('REFRESH_VARIABLES', {}, 300000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── Component Tools ──

server.tool(
  'figma_get_library_components',
  'Get all local components from the current page.',
  {},
  async () => {
    const result = await sendCommand('GET_LOCAL_COMPONENTS', {}, 300000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_instantiate_component',
  'Create an instance of a component.',
  {
    nodeId: z.string().optional().describe('Node ID of the component'),
    componentKey: z.string().optional().describe('Component key (for library components)'),
    position: z.object({ x: z.number(), y: z.number() }).optional().describe('Position for the instance'),
    parentId: z.string().optional().describe('Parent node ID to place the instance in'),
  },
  async (params) => {
    const result = await sendCommand('INSTANTIATE_COMPONENT', params, 30000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_get_component',
  'Get details about a component by node ID.',
  {
    nodeId: z.string().describe('Node ID of the component'),
  },
  async ({ nodeId }) => {
    const result = await sendCommand('GET_COMPONENT', { nodeId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_set_instance_properties',
  'Set properties on a component instance.',
  {
    nodeId: z.string().describe('Instance node ID'),
    properties: z.record(z.string(), z.unknown()).describe('Properties to set (name → value)'),
  },
  async (params) => {
    const result = await sendCommand('SET_INSTANCE_PROPERTIES', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_add_component_property',
  'Add a component property to a component or component set.',
  {
    nodeId: z.string().describe('Component or component set node ID'),
    propertyName: z.string().describe('Property name'),
    propertyType: z.string().describe('Property type (VARIANT, BOOLEAN, INSTANCE_SWAP, TEXT)'),
    defaultValue: z.unknown().describe('Default value for the property'),
  },
  async (params) => {
    const result = await sendCommand('ADD_COMPONENT_PROPERTY', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_edit_component_property',
  'Edit an existing component property.',
  {
    nodeId: z.string().describe('Component or component set node ID'),
    propertyName: z.string().describe('Property name to edit'),
    newValue: z.record(z.string(), z.unknown()).describe('New property definition values'),
  },
  async (params) => {
    const result = await sendCommand('EDIT_COMPONENT_PROPERTY', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_delete_component_property',
  'Delete a component property.',
  {
    nodeId: z.string().describe('Component or component set node ID'),
    propertyName: z.string().describe('Property name to delete'),
  },
  async (params) => {
    const result = await sendCommand('DELETE_COMPONENT_PROPERTY', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── Node Manipulation Tools ──

server.tool(
  'figma_resize_node',
  'Resize a node to specific dimensions.',
  {
    nodeId: z.string().describe('Node ID'),
    width: z.number().describe('New width'),
    height: z.number().describe('New height'),
    withConstraints: z.boolean().optional().describe('Use constraints (default true)'),
  },
  async (params) => {
    const result = await sendCommand('RESIZE_NODE', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_move_node',
  'Move a node to specific x/y coordinates.',
  {
    nodeId: z.string().describe('Node ID'),
    x: z.number().describe('New x position'),
    y: z.number().describe('New y position'),
  },
  async (params) => {
    const result = await sendCommand('MOVE_NODE', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_clone_node',
  'Clone a node.',
  {
    nodeId: z.string().describe('Node ID to clone'),
  },
  async ({ nodeId }) => {
    const result = await sendCommand('CLONE_NODE', { nodeId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_delete_node',
  'Delete a node from the canvas.',
  {
    nodeId: z.string().describe('Node ID to delete'),
  },
  async ({ nodeId }) => {
    const result = await sendCommand('DELETE_NODE', { nodeId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_rename_node',
  'Rename a node.',
  {
    nodeId: z.string().describe('Node ID'),
    newName: z.string().describe('New name'),
  },
  async (params) => {
    const result = await sendCommand('RENAME_NODE', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_create_child',
  'Create a child node inside a parent frame.',
  {
    parentId: z.string().describe('Parent node ID'),
    nodeType: z.enum(['RECTANGLE', 'ELLIPSE', 'FRAME', 'TEXT', 'LINE', 'POLYGON', 'STAR', 'VECTOR']).describe('Type of node to create'),
    properties: z.object({
      name: z.string().optional(),
      x: z.number().optional(),
      y: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      text: z.string().optional(),
      fills: z.array(z.unknown()).optional(),
    }).optional().describe('Node properties'),
  },
  async (params) => {
    const result = await sendCommand('CREATE_CHILD_NODE', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_set_description',
  'Set description on a node.',
  {
    nodeId: z.string().describe('Node ID'),
    description: z.string().describe('Description text'),
    descriptionMarkdown: z.string().optional().describe('Markdown description (if supported)'),
  },
  async (params) => {
    const result = await sendCommand('SET_NODE_DESCRIPTION', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── Visual Properties ──

server.tool(
  'figma_set_fills',
  'Set fill colors on a node.',
  {
    nodeId: z.string().describe('Node ID'),
    fills: z.array(z.unknown()).describe('Array of fill objects (e.g. [{type: "SOLID", color: "#FF0000"}])'),
  },
  async (params) => {
    const result = await sendCommand('SET_NODE_FILLS', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_set_strokes',
  'Set strokes on a node.',
  {
    nodeId: z.string().describe('Node ID'),
    strokes: z.array(z.unknown()).describe('Array of stroke objects'),
    strokeWeight: z.number().optional().describe('Stroke weight in px'),
  },
  async (params) => {
    const result = await sendCommand('SET_NODE_STROKES', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_set_opacity',
  'Set opacity on a node.',
  {
    nodeId: z.string().describe('Node ID'),
    opacity: z.number().min(0).max(1).describe('Opacity value 0-1'),
  },
  async (params) => {
    const result = await sendCommand('SET_NODE_OPACITY', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_set_corner_radius',
  'Set corner radius on a node.',
  {
    nodeId: z.string().describe('Node ID'),
    radius: z.number().describe('Corner radius in px'),
  },
  async (params) => {
    const result = await sendCommand('SET_NODE_CORNER_RADIUS', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_set_text',
  'Set text content on a text node.',
  {
    nodeId: z.string().describe('Text node ID'),
    text: z.string().describe('New text content'),
    fontSize: z.number().optional().describe('Font size in px'),
  },
  async (params) => {
    const result = await sendCommand('SET_TEXT_CONTENT', params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_set_image_fill',
  'Set an image fill on one or more nodes from base64-encoded image data.',
  {
    imageData: z.string().describe('Base64-encoded image data'),
    nodeId: z.string().optional().describe('Single node ID'),
    nodeIds: z.array(z.string()).optional().describe('Multiple node IDs'),
    scaleMode: z.enum(['FILL', 'FIT', 'CROP', 'TILE']).optional().describe('Image scale mode (default FILL)'),
  },
  async (params) => {
    // Convert base64 to byte array — code.ts expects imageBytes as number[]
    const imageBytes = Array.from(Buffer.from(params.imageData, 'base64'));
    const result = await sendCommand('SET_IMAGE_FILL', {
      imageBytes,
      nodeId: params.nodeId,
      nodeIds: params.nodeIds,
      scaleMode: params.scaleMode,
    }, 60000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── Analysis Tools ──

server.tool(
  'figma_lint_design',
  'Lint a design for common issues (missing text styles, unnamed layers, no auto-layout, etc.).',
  {
    nodeId: z.string().optional().describe('Node ID to lint. Lints current page if omitted.'),
    maxFindings: z.number().optional().describe('Max findings to return (default 50)'),
    maxDepth: z.number().optional().describe('Max traversal depth (default 8)'),
  },
  async (params) => {
    const result = await sendCommand('LINT_DESIGN', params, 120000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_audit_component_accessibility',
  'Audit a component for accessibility issues (target sizes, text sizes, etc.).',
  {
    nodeId: z.string().optional().describe('Node ID to audit. Uses current selection if omitted.'),
    targetSize: z.number().optional().describe('Minimum touch target size in px (default 24)'),
  },
  async (params) => {
    const result = await sendCommand('AUDIT_COMPONENT_ACCESSIBILITY', params, 120000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── Style Tools ──

server.tool(
  'figma_get_styles',
  'Get all local paint/effect styles from the file.',
  {},
  async () => {
    // Use EXECUTE_CODE to get styles since there's no dedicated bridge command
    const result = await sendCommand('EXECUTE_CODE', {
      code: `
        const paintStyles = await figma.getLocalPaintStylesAsync();
        const effectStyles = await figma.getLocalEffectStylesAsync();
        return {
          paintStyles: paintStyles.map(s => ({ id: s.id, name: s.name, key: s.key, description: s.description })),
          effectStyles: effectStyles.map(s => ({ id: s.id, name: s.name, key: s.key, description: s.description })),
        };
      `,
    }, 30000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_get_text_styles',
  'Get all local text styles from the file.',
  {},
  async () => {
    const result = await sendCommand('EXECUTE_CODE', {
      code: `
        const styles = await figma.getLocalTextStylesAsync();
        return styles.map(s => ({
          id: s.id, name: s.name, key: s.key, description: s.description,
          fontName: s.fontName, fontSize: s.fontSize, lineHeight: s.lineHeight,
          letterSpacing: s.letterSpacing, textCase: s.textCase, textDecoration: s.textDecoration,
        }));
      `,
    }, 30000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── Selection / Navigation ──

server.tool(
  'figma_get_selection',
  'Get the current selection in Figma.',
  {},
  async () => {
    const result = await sendCommand('EXECUTE_CODE', {
      code: `
        const sel = figma.currentPage.selection;
        return {
          count: sel.length,
          nodes: sel.map(n => ({ id: n.id, name: n.name, type: n.type, x: n.x, y: n.y, width: n.width, height: n.height })),
        };
      `,
    });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_navigate',
  'Navigate to a specific node in Figma (zoom to fit).',
  {
    nodeId: z.string().describe('Node ID to navigate to'),
  },
  async ({ nodeId }) => {
    const result = await sendCommand('EXECUTE_CODE', {
      code: `
        const node = await figma.getNodeByIdAsync('${assertNodeId(nodeId)}');
        if (!node) throw new Error('Node not found: ${assertNodeId(nodeId)}');
        if ('type' in node && node.type === 'PAGE') {
          await figma.setCurrentPageAsync(node);
        } else {
          figma.viewport.scrollAndZoomIntoView([node]);
        }
        return { navigated: true, nodeId: node.id, nodeName: node.name };
      `,
    });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_get_file_data',
  'Get the full page/node tree structure of the Figma file.',
  {
    nodeId: z.string().optional().describe('Node ID to get tree from. Defaults to current page.'),
    depth: z.number().optional().describe('Max depth to traverse (default 3)'),
  },
  async ({ nodeId, depth }) => {
    const maxDepth = depth || 3;
    const result = await sendCommand('EXECUTE_CODE', {
      code: `
        const root = ${nodeId ? `await figma.getNodeByIdAsync('${assertNodeId(nodeId)}')` : 'figma.currentPage'};
        if (!root) throw new Error('Node not found');
        function walk(n, d) {
          const info = { id: n.id, name: n.name, type: n.type };
          if ('width' in n) { info.width = n.width; info.height = n.height; }
          if ('children' in n && d < ${maxDepth}) {
            info.children = n.children.map(c => walk(c, d + 1));
          } else if ('children' in n) {
            info.childCount = n.children.length;
          }
          return info;
        }
        return walk(root, 0);
      `,
    }, 30000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── Annotation Tools ──

server.tool(
  'figma_get_annotations',
  'Get annotations on a node.',
  {
    nodeId: z.string().describe('Node ID'),
  },
  async ({ nodeId }) => {
    const result = await sendCommand('EXECUTE_CODE', {
      code: `
        const node = await figma.getNodeByIdAsync('${assertNodeId(nodeId)}');
        if (!node) throw new Error('Node not found');
        const annotations = node.annotations || [];
        return { annotations, count: annotations.length };
      `,
    });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_set_annotations',
  'Set annotations on a node.',
  {
    nodeId: z.string().describe('Node ID'),
    annotations: z.array(z.unknown()).describe('Array of annotation objects'),
  },
  async ({ nodeId, annotations }) => {
    const result = await sendCommand('EXECUTE_CODE', {
      code: `
        const node = await figma.getNodeByIdAsync('${assertNodeId(nodeId)}');
        if (!node) throw new Error('Node not found');
        node.annotations = ${JSON.stringify(annotations)};
        return { set: true, count: node.annotations.length };
      `,
    });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── Search ──

server.tool(
  'figma_search_components',
  'Search for components by name in the current file.',
  {
    query: z.string().describe('Search query (matched against component names)'),
    includeVariants: z.boolean().optional().describe('Include individual variants (default false)'),
  },
  async ({ query, includeVariants }) => {
    const result = await sendCommand('EXECUTE_CODE', {
      code: `
        const q = '${escapeJsString(query)}'.toLowerCase();
        const results = [];
        function search(n) {
          if (results.length >= 50) return;
          if (n.type === 'COMPONENT_SET') {
            if (n.name.toLowerCase().includes(q)) {
              results.push({ id: n.id, name: n.name, type: n.type, key: n.key });
            }
            ${includeVariants ? `for (const child of n.children) {
              if (child.type === 'COMPONENT' && child.name.toLowerCase().includes(q)) {
                results.push({ id: child.id, name: child.name, type: child.type, key: child.key });
              }
            }` : ''}
          } else if (n.type === 'COMPONENT' && (!n.parent || n.parent.type !== 'COMPONENT_SET')) {
            if (n.name.toLowerCase().includes(q)) {
              results.push({ id: n.id, name: n.name, type: n.type, key: n.key });
            }
          }
          if ('children' in n) { for (const c of n.children) { try { search(c); } catch {} } }
        }
        await figma.loadAllPagesAsync();
        for (const page of figma.root.children) {
          for (const child of page.children) search(child);
        }
        return { components: results, total: results.length };
      `,
    }, 60000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_analyze_component_set',
  'Analyze a component set — list all variants, properties, and their values.',
  {
    nodeId: z.string().describe('Component set node ID'),
  },
  async ({ nodeId }) => {
    const result = await sendCommand('EXECUTE_CODE', {
      code: `
        const node = await figma.getNodeByIdAsync('${assertNodeId(nodeId)}');
        if (!node) throw new Error('Node not found');
        if (node.type !== 'COMPONENT_SET') throw new Error('Not a COMPONENT_SET');
        const props = node.componentPropertyDefinitions;
        const variants = node.children.map(c => ({
          id: c.id, name: c.name, type: c.type,
          width: c.width, height: c.height,
        }));
        return {
          id: node.id, name: node.name,
          propertyDefinitions: props,
          variantCount: variants.length,
          variants,
        };
      `,
    }, 30000);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'figma_get_component_details',
  'Get detailed information about a component including property definitions and children.',
  {
    nodeId: z.string().describe('Component or component set node ID'),
  },
  async ({ nodeId }) => {
    const result = await sendCommand('GET_COMPONENT', { nodeId });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

// ── Start Servers ──

// 1. Start WebSocket server for plugin connections
const wsPort = await startWsServer();
log(`WebSocket server listening on port ${wsPort}`);

// 2. Start MCP server over stdio
const transport = new StdioServerTransport();
await server.connect(transport);
log('MCP server started (stdio)');
