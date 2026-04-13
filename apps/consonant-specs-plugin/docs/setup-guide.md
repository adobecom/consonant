# Consonant Tools — Setup Guide

Everything you need to install the Figma plugin, connect the AI bridge, and start generating accessibility bluelines.

## Prerequisites

- **Figma Desktop** (not the browser version — plugins with bridge/MCP require the desktop app)
- **Node.js** (v18+)
- **Claude Code CLI** — install via `npm install -g @anthropic-ai/claude-code`, then sign in with `claude login` (works with any Claude Pro or Max plan)

## Quick Setup (Option B)

If you're not comfortable in the terminal, Claude can handle installation for you:

1. Install **Node.js** from https://nodejs.org (click the big green button, run the installer)
2. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
3. Sign in: `claude login`
4. Open Claude Code: `claude`
5. Type: `/project:setup`

Claude will clone the repo, install dependencies, build the plugin, and tell you what to do in Figma.

---

## Manual Setup (Option A)

### 1. Clone the repo

```bash
git clone https://github.com/spicyxshrimp/consonant-figma-plugin.git
cd consonant-figma-plugin
```

### 2. Install and build

```bash
npm install
npm run build
```

If you want live rebuilds while developing:
```bash
npm run watch
```

### 3. Load the plugin in Figma

1. Open **Figma Desktop**
2. Go to **Plugins > Development > Import plugin from manifest...**
3. Select the `manifest.json` file from the cloned repo
4. The plugin appears as **"Consonant Tools"** in your plugin menu

### 4. Install the figma-console MCP bridge

The bridge lets Claude Code read and write to your Figma file. It's an npm package — no separate repo needed.

```bash
npm install -g figma-console-mcp
```

This installs the `figma-console-mcp` command globally. The repo's `.mcp.json` already references it, so Claude Code will auto-start it when you open a session in this directory.

### 5. Connect the bridge

1. Open a Figma file and run the **Consonant Tools** plugin
2. Go to the **Bridge** tab in the plugin
3. Click **Connect**
4. The status should change to "Connected" with a green dot

The bridge stays connected as long as the plugin window is open. You can switch between tabs (Align, Specs, A11y, etc.) without disconnecting.

### 6. Start Claude Code

Open a terminal in the cloned repo directory:

```bash
cd consonant-figma-plugin
claude
```

Claude Code will automatically detect the `.mcp.json` and start the figma-console MCP server. You should see it listed when the session starts.

## Using the A11y Blueline Features

### Generate Blueline (standard mode)

1. Select a frame in Figma
2. Open the plugin, go to the **A11y** tab
3. Check the features you want:
   - **Plugin** section: Focus Indicators, Focus Order (runs locally, no bridge needed)
   - **AI-assisted** section: Heading Hierarchy, Landmarks, Accessible Names, etc. (requires bridge)
4. Click **Generate Blueline**
5. The plugin creates:
   - A focus order sidebar (left of the design)
   - Focus indicator rings on the design
   - AI placeholder cards below the design (one per checked category)

### Generate Blueline with Sections

Same as above but click **Generate Blueline with Sections**. Creates separate Figma Sections for each category, each with its own design clone and instructions card.

### AI Fill (populating the cards)

After generating the blueline scaffolding:

1. The plugin shows an instruction with a **Copy** button
2. Click Copy, then paste into your Claude Code session
3. Claude reads the design tree, screenshots it, and fills each card with design-specific accessibility specs

The `/project:fill-blueline` command is included in the repo under `.claude/commands/`. Claude Code loads it automatically.

## Each person gets their own bridge

Every team member runs their own instance:
- Their own Figma Desktop with the plugin loaded
- Their own Claude Code session signed into their own Claude account
- The bridge connects locally (localhost) — no shared server

There's no conflict if multiple people run it simultaneously. Each person's bridge talks to their own Figma instance.

## Troubleshooting

**Bridge won't connect:**
- Make sure you're using Figma Desktop, not the browser
- Check that `figma-console-mcp` is installed globally: `which figma-console-mcp`
- The plugin must be open (not just installed — the plugin window must be visible)

**AI-assisted checkboxes are grayed out:**
- Connect the bridge first (Bridge tab > Connect)
- The checkboxes enable once the bridge is connected

**`/project:fill-blueline` shows "Unknown skill":**
- Make sure you started Claude Code from inside the `consonant-figma-plugin` directory
- The command file lives at `.claude/commands/fill-blueline.md` — Claude Code reads it at session start
- If you added it mid-session, restart Claude Code

**Focus indicators on wrong elements:**
- The detection uses Figma layer names (e.g., "Button", "Logo", "Carousel")
- If elements are named generically, detection may be inaccurate
- Rename layers in Figma to improve detection accuracy

**Cards showing "Awaiting AI fill...":**
- The scaffolding was created but AI fill hasn't run yet
- Copy the instruction from the plugin and paste it into Claude Code
