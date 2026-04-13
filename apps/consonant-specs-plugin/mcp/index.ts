import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { z } from 'zod';

interface BluelineRequest {
  frameId: string;
  sections: string[];
  timestamp: number;
}

let pendingRequest: BluelineRequest | null = null;

// --- HTTP server for plugin UI ---
const app = express();
app.use(express.json());
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

app.post('/request', (req, res) => {
  const { frameId, sections } = req.body;
  if (!frameId || !Array.isArray(sections)) {
    res.status(400).json({ error: 'Invalid request: need frameId and sections array' });
    return;
  }
  pendingRequest = { frameId, sections, timestamp: Date.now() };
  res.json({ status: 'queued', frameId, sections });
});

app.get('/status', (_req, res) => {
  res.json({ hasPending: pendingRequest !== null });
});

const HTTP_PORT = 9300;
app.listen(HTTP_PORT, '127.0.0.1', () => {
  console.error(`consonant-mcp HTTP listening on port ${HTTP_PORT}`);
});

// --- MCP server for Claude ---
const server = new McpServer({
  name: 'consonant-mcp',
  version: '0.1.0',
});

server.tool('get_blueline_request', 'Check for pending blueline fill requests from the Figma plugin', {}, async () => {
  if (!pendingRequest) {
    return { content: [{ type: 'text', text: JSON.stringify({ status: 'no_request' }) }] };
  }
  const request = pendingRequest;
  pendingRequest = null; // consume the request
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        status: 'pending',
        frameId: request.frameId,
        sections: request.sections,
        timestamp: request.timestamp,
      }),
    }],
  };
});

server.tool(
  'blueline_complete',
  'Signal that blueline fill is complete',
  { message: z.string().describe('Completion message to show in plugin') },
  async ({ message }) => {
    return { content: [{ type: 'text', text: JSON.stringify({ status: 'done', message }) }] };
  },
);

// Start MCP over stdio (only when running as MCP server, not standalone HTTP)
if (!process.env.HTTP_ONLY) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
} else {
  console.error('consonant-mcp running in HTTP-only mode (no MCP stdio)');
}
