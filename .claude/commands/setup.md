# Setup — Consonant Tools Installer

Automated installer for the Consonant Tools Figma plugin and MCP bridge. Checks what's installed, fixes what isn't, and verifies everything works.

## Your job

Walk through each step. Test before moving on. If something fails, fix it automatically when possible. Speak in plain language — the person running this may not be technical.

---

### Step 1 — Check prerequisites

Check these silently, then report what's ready and what's missing:

```bash
node --version        # need v18+
npm --version
which npx
```

If Node.js is missing or below v18, stop and tell them:
> You need Node.js 18 or newer. Download it from https://nodejs.org — click the big green button and run the installer. Then run `/setup` again.

---

### Step 2 — Install dependencies

Check if `node_modules` exists in the repo root. If not:

```bash
npm install
```

Check if the MCP server is built:

```bash
ls apps/consonant-specs-plugin/mcp/dist/index.js
```

If not, build it:

```bash
cd apps/consonant-specs-plugin/mcp && npm install && npm run build
```

---

### Step 3 — Build the plugin

Check if `apps/consonant-specs-plugin/dist/code.js` exists and is up to date:

```bash
ls -la apps/consonant-specs-plugin/dist/code.js
```

If missing or stale, build:

```bash
cd apps/consonant-specs-plugin && node esbuild.config.mjs
```

---

### Step 4 — Verify .mcp.json

Read the repo-root `.mcp.json`. Check that:
- Paths are **relative** (no `/Users/...` absolute paths)
- The `consonant-specs` server points to `apps/consonant-specs-plugin/mcp/dist/index.js`
- No paths reference another user's home directory

If any paths are absolute, rewrite them to relative paths automatically. Show what you changed.

---

### Step 5 — Test MCP connection

Try calling `mcp__consonant-specs__figma_get_status` to check if the MCP server starts.

If it connects, report success.

If it fails, check:
- Is the MCP dist built? (Step 2)
- Is the `.mcp.json` correct? (Step 4)
- Try restarting the MCP server

---

### Step 6 — Figma plugin loading

Tell them:

> **Last step — load the plugin in Figma:**
> 1. Open **Figma Desktop** (not the browser)
> 2. Go to **Plugins → Development → Import plugin from manifest...**
> 3. Navigate to this repo and select: `apps/consonant-specs-plugin/manifest.json`
> 4. Open any Figma file, run **Consonant Tools** from the plugin menu
> 5. Come back here and I'll verify the connection

---

### Step 7 — Verify Figma bridge

Once they say the plugin is running, test the bridge:

```
mcp__consonant-specs__figma_get_status
```

If `connected: true`:
> **All set!** The plugin is connected and ready. You can start using `/start-feature` to begin designing, or ask me anything about the design system.

If `connected: false`:
> The MCP server is running but the Figma plugin isn't connected yet. Make sure:
> - You're using **Figma Desktop** (not browser)
> - The **Consonant Tools** plugin window is open (not just installed — the window must be visible)
> - Try clicking the plugin again to relaunch it

---

## Tone

- No git jargon, no technical explanations unless they ask
- Fix things silently when you can, explain only when you need their help
- After each step, one clear sentence: what happened, what's next
- At the end, one summary: everything working, or here's what's left
