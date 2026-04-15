import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

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
  'Generate accessibility blueline annotations on the selected node.',
  {
    nodeId: z.string().optional().describe('Node ID to annotate. Uses current selection if omitted.'),
    tier1: z.array(z.string()).optional().describe('Tier 1 annotation categories'),
    tier2: z.array(z.string()).optional().describe('Tier 2 annotation categories'),
  },
  async ({ nodeId, tier1, tier2 }) => {
    const result = await sendCommand('GENERATE_BLUELINE', { nodeId, tier1, tier2 }, 120000);
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
    // SET_IMAGE_FILL needs base64 decode — the plugin UI handles this via bridgeHandleMethod
    const result = await sendCommand('SET_IMAGE_FILL', params, 60000);
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
        const node = await figma.getNodeByIdAsync('${nodeId}');
        if (!node) throw new Error('Node not found: ${nodeId}');
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
        const root = ${nodeId ? `await figma.getNodeByIdAsync('${nodeId}')` : 'figma.currentPage'};
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
        const node = await figma.getNodeByIdAsync('${nodeId}');
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
        const node = await figma.getNodeByIdAsync('${nodeId}');
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
        const q = '${query}'.toLowerCase();
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
        for (const page of figma.root.children) {
          await figma.setCurrentPageAsync(page);
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
        const node = await figma.getNodeByIdAsync('${nodeId}');
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
