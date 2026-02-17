# Figma MCP Setup for Codex

This guide explains how to set up Figma MCP (Model Context Protocol) for use with Codex/Cursor.

> **Quick path (recommended):** run the helper script  
> `node scripts/setup-figma-mcp.js`  
> It reads your `.env`, writes/merges `mcp.json` for Cursor, and you’re done.  
> The rest of this guide documents what the script is doing under the hood and how to tweak it manually if needed.

## Prerequisites

1. **Figma Account** with access to the design files you want to work with
2. **Existing `.env` file** with Figma credentials (you already have this!)
3. **Cursor/Codex** with MCP support enabled

## Your Existing Setup

You already have Figma credentials in your `.env` file:

- `FIGMA_REST_API` - Your Figma personal access token
- `FIGMA_FILE_ID` - Your Figma file key
- `FIGMA_BRANCH_KEY` - Your Figma branch key (if using branches)

**Note**: The same `FIGMA_REST_API` token works for both the REST API (token pipeline) and MCP (Codex integration).

## Step 2: Configure MCP in Cursor/Codex

You have two options:

- **Option A (recommended):** Use the provided setup script to generate/merge `mcp.json`
- **Option B:** Configure MCP manually as JSON

### Option A: Use the setup script (auto‑config)

From the repo root, run:

```bash
node scripts/setup-figma-mcp.js
```

What this does:

- Loads `.env` and reads:
  - `FIGMA_REST_API` → used as `FIGMA_ACCESS_TOKEN`
  - `FIGMA_FILE_ID`
  - `FIGMA_BRANCH_KEY`
- Locates your Cursor MCP config file (e.g. `~/.cursor/mcp.json`).
- Merges in a `figma` MCP server entry:

```jsonc
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "<from FIGMA_REST_API>",
        "FIGMA_FILE_ID": "<from FIGMA_FILE_ID>",
        "FIGMA_BRANCH_KEY": "<from FIGMA_BRANCH_KEY>",
      },
    },
  },
}
```

After running the script:

1. Restart Cursor/Codex.
2. You should see the `figma` MCP server available.

You only need to re‑run the script if you change your Figma token, file ID, or branch key.

### Option B: Configure MCP manually

If you prefer to edit `mcp.json` yourself, MCP servers in Cursor are configured in the settings. The configuration location depends on your setup:

#### Cursor Settings (UI)

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Navigate to **"Features"** → **"Model Context Protocol"** or **"MCP"**
3. Look for **"Figma"** in the list of available MCP servers
4. Enable it and enter your Figma personal access token

#### Cursor Settings File (Using .env Variables)

If you need to configure manually, the MCP configuration is typically in:

**macOS/Linux**: `~/.cursor/mcp.json` or `~/.config/cursor/mcp.json`  
**Windows**: `%APPDATA%\Cursor\mcp.json`

**Manual Option 1: Reference .env file directly** (if MCP supports it):

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_REST_API}"
      }
    }
  }
}
```

**Manual Option 2: Load from your project's .env file**:

You can create a wrapper script that loads your `.env` file, or configure MCP to read from your project's `.env`:

```json
{
  "mcpServers": {
    "figma": {
      "command": "node",
      "args": [
        "-r",
        "dotenv/config",
        "-e",
        "require('@modelcontextprotocol/server-figma')"
      ],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

**Manual Option 3: Use the same token value** (copy from `.env`):

Since you already have `FIGMA_REST_API` in your `.env`, you can use that same value:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "<paste value from FIGMA_REST_API in .env>"
      }
    }
  }
}
```

**Note**: The Figma MCP server uses `FIGMA_ACCESS_TOKEN` as the environment variable name, which corresponds to your `FIGMA_REST_API` value.

## Step 3: Verify Setup

Once configured, you should be able to use Figma MCP tools in Codex. Test it by:

1. **Use your existing `FIGMA_FILE_ID`** from your `.env` file (or get it from a Figma URL)
2. Get the node ID from the Figma URL:
   ```
   https://www.figma.com/design/[FILE_KEY]/[FILE_NAME]?node-id=[NODE_ID]
   ```
   Or use your `FIGMA_FILE_ID` directly
3. Ask Codex to use Figma MCP, for example:
   - "Get design context for node [NODE_ID] in file [your FIGMA_FILE_ID]"
   - "Take a screenshot of this Figma component"
   - "Get variable definitions for this node"

**Quick Test**: You can test with your existing file by asking:

- "Get design context for a component in my Figma file" (Codex can use your `FIGMA_FILE_ID`)

## Available Figma MCP Tools

Once set up, you'll have access to these Figma MCP tools:

- **`get_design_context`** - Get UI code and design context from a Figma node
- **`get_screenshot`** - Generate a screenshot of a Figma node
- **`get_metadata`** - Get metadata (structure, IDs, names) for a node
- **`get_variable_defs`** - Get variable definitions (design tokens) for a node
- **`get_code_connect_map`** - Get Code Connect mappings
- **`add_code_connect_map`** - Map Figma nodes to code components

## Using Figma MCP in Your Workflow

### Example: Get Design Context

```javascript
// Ask Codex to get design context from Figma
// Example: "Get design context for the button component in Figma file zYLC4bKrGVhWQXVoVPJXh4, node 12511-7135"
```

### Example: Get Variable Definitions

```javascript
// Ask Codex to get token/variable definitions
// Example: "Get variable definitions for node 12511-7135 in file zYLC4bKrGVhWQXVoVPJXh4"
```

### Example: Generate Code from Figma

1. Select a component in Figma
2. Copy the node ID from the URL
3. Ask Codex: "Generate code for this Figma component using MCP"
4. Codex will use `get_design_context` to fetch the design and generate code

## Troubleshooting

### MCP Server Not Found

If Codex can't find the Figma MCP server:

- Verify the MCP configuration file exists and is properly formatted
- Check that the Figma MCP package is installed: `npm install -g @modelcontextprotocol/server-figma`
- Restart Cursor/Codex after configuration changes

### Authentication Errors

If you get authentication errors:

- Verify your Figma personal access token is correct
- Check that the token hasn't expired
- Ensure the token has access to the Figma files you're trying to access

### File Access Issues

If you can't access a Figma file:

- Verify you have read access to the file in Figma
- Check that the file key in the URL is correct
- Ensure the node ID format is correct (e.g., `12511-7135` or `125:7135`)

## Integration with Your Token Pipeline

Figma MCP works seamlessly with your token pipeline:

1. **Design in Figma** using Figma Variables (design tokens)
2. **Use MCP to get design context** and generate code
3. **Extract variable definitions** to understand token usage
4. **Generate code** that uses your token system
5. **Sync tokens** via your existing pipeline (Figma REST API → npm package)

## Next Steps

- See [figma-to-code-workflow.md](../workflows/figma-to-code-workflow.md) for the complete workflow
- Use Figma MCP to generate component code from designs
- Extract design tokens and variable definitions
- Create specs and documentation from Figma components
