# Consonant Plugin Setup Skill — Design Spec

**Date:** 2026-04-20
**Status:** Draft

---

## Overview

An automated installer skill for the Consonant Specs Plugin, targeting non-technical designers on macOS. The skill checks prerequisites, downloads the repo, builds everything, and guides the designer through loading the plugin in Figma — all from a single `/setup-consonant-plugin` command in Claude Code.

A companion HTML guide provides the same steps as a browser-readable reference.

---

## Target audience

Non-technical designers who:
- Have a Mac with Terminal access
- Have Claude Code installed and working
- May or may not have Homebrew and Node.js installed
- Do not know how to use git, npm, or the command line
- Need the full plugin including MCP-powered features (a11y, blueline, bridge)

---

## Deliverables

1. **Skill file:** `~/.claude/commands/setup-consonant-plugin.md`
2. **HTML guide:** `apps/consonant-specs-plugin/docs/setup-guide.html`

---

## Skill design

### Location & invocation

- **File:** `~/.claude/commands/setup-consonant-plugin.md`
- **Invocation:** `/setup-consonant-plugin`
- **Runs from:** Any directory (the skill is global, lives outside the repo)
- **Execution model:** Claude follows the skill instructions step by step, running each command via the Bash tool, checking results, and adapting to errors in real time

### Step 1: Pre-flight checks

Claude checks for required tools in this order:

| Check | Command | If missing |
|---|---|---|
| Node.js v18+ | `which node` + `node -v` | Direct the designer to download the `.pkg` installer from nodejs.org |
| npm | `which npm` | Comes with Node — if missing, reinstall Node via the `.pkg` |

If Node is missing, Claude pauses and gives plain-language instructions to download and install it. The designer confirms when done, then Claude re-checks.

### Step 2: Choose install location

- Claude asks: "Where would you like to install the plugin? The default is `~/Desktop/consonant`. Press enter to accept or type a different path."
- Stores the chosen path as `INSTALL_DIR` for all subsequent steps
- If the folder already exists, Claude asks whether to re-download (update) or skip to the build step

### Step 3: Get the files

1. Download the repo as a ZIP: `curl -L https://github.com/adobecom/consonant/archive/refs/heads/main.zip -o /tmp/consonant.zip`
2. Extract: `unzip /tmp/consonant.zip -d /tmp/consonant-extract`
3. If `INSTALL_DIR` already exists (re-download/update), remove it first: `rm -rf $INSTALL_DIR`
4. Move to the install dir: `mv /tmp/consonant-extract/consonant-main $INSTALL_DIR`
5. Clean up: `rm /tmp/consonant.zip && rm -rf /tmp/consonant-extract`
6. Verify key folders exist:
   - `$INSTALL_DIR/apps/consonant-specs-plugin/`
   - `$INSTALL_DIR/apps/figma-console-mcp/`
   - `$INSTALL_DIR/packages/tokens/`

### Step 4: Install dependencies & build

Claude runs each step sequentially, reporting progress in plain language:

1. **Plugin dependencies:**
   ```
   cd $INSTALL_DIR/apps/consonant-specs-plugin && npm install
   ```

2. **Build plugin** (if dist/ files are missing or stale):
   ```
   npm run build
   ```

3. **Consonant MCP server dependencies:**
   ```
   cd $INSTALL_DIR/apps/consonant-specs-plugin/mcp && npm install
   ```

4. **Build consonant MCP server:**
   ```
   npm run build
   ```

5. **figma-console-mcp dependencies:**
   ```
   cd $INSTALL_DIR/apps/figma-console-mcp && npm install
   ```

6. **Build figma-console-mcp:**
   ```
   npm run build
   ```

If any step fails, Claude explains the error in plain language and attempts to fix it before moving on.

### Step 5: Figma plugin installation instructions

Claude prints step-by-step instructions using the designer's actual install path:

> 1. Open **Figma Desktop**
> 2. Go to the menu: **Plugins → Development → Import plugin from manifest...**
> 3. Navigate to: `$INSTALL_DIR/apps/consonant-specs-plugin/manifest.json`
> 4. Click **Open**
> 5. The plugin "Consonant Tools" should now appear under **Plugins → Development**

Claude also runs `open $INSTALL_DIR/apps/consonant-specs-plugin/` to open the folder in Finder so the designer can easily locate the manifest file.

### Step 6: Verification

1. **dist/ files check:** Confirm `code.js`, `ui.html`, `ui-bundle.js` exist in `$INSTALL_DIR/apps/consonant-specs-plugin/dist/`

2. **MCP servers start check:** Attempt to start figma-console-mcp and consonant-mcp, verify they launch without errors, then shut them down

3. **Bridge connection test:**
   - Claude starts the MCP server
   - Instructs the designer: "Now open the Consonant Tools plugin in Figma and click the Bridge connect button. Let me know when you've done that."
   - Once the designer confirms, Claude checks the WebSocket connection via `lsof -i :9220` to verify the bridge is live
   - Reports pass/fail

### Notes

- **FEATURE_A11Y flag:** The plugin build reads a `.env` file for `FEATURE_A11Y`. If no `.env` exists, the flag defaults to `false` and the a11y tab is hidden. The build still succeeds. The skill does not create a `.env` file — a11y features are opt-in and configured separately.

### Update flow

Re-running `/setup-consonant-plugin` on an existing installation:
- Detects the existing folder
- Asks whether to re-download (fresh copy from GitHub) or skip to build
- Re-runs install & build steps
- Re-runs verification

---

## HTML guide design

### File location

`apps/consonant-specs-plugin/docs/setup-guide.html`

### Content

A standalone, self-contained HTML page (no external dependencies) that covers the same steps as the skill:

1. Prerequisites (Node.js, npm)
2. Getting the files (download ZIP from GitHub)
3. Installing dependencies and building
4. Loading the plugin in Figma
5. Verifying the bridge connection

### Style

- Clean, readable typography
- Step-by-step format with numbered sections
- Code blocks for any terminal commands
- Visual callouts for important notes and warnings
- Designed for designers — no jargon, plain language explanations
- Works offline (no CDN dependencies, all styles inline)

---

## Out of scope

- Automatic Figma plugin loading (requires manual UI interaction in Figma)
- GitHub authentication (repo is public)
- Git installation (using ZIP download instead)
- Storybook setup
- Web component development workflow
- CI/CD or deployment
