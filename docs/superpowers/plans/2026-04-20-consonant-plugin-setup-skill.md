# Consonant Plugin Setup Skill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an automated installer skill (`/setup-consonant-plugin`) and a companion HTML guide that gets non-technical designers from zero to a working Consonant Tools plugin in Figma.

**Architecture:** Two independent deliverables — a Claude Code slash command (markdown skill file) and a standalone HTML page. The skill instructs Claude to run Bash commands step-by-step, checking results and adapting. The HTML guide is a static reference with the same steps.

**Tech Stack:** Markdown (skill file), HTML/CSS (guide), Bash commands executed by Claude via the Bash tool.

---

## File Structure

| File | Responsibility |
|---|---|
| `~/.claude/commands/setup-consonant-plugin.md` | Claude Code slash command — the automated installer skill |
| `apps/consonant-specs-plugin/docs/setup-guide.html` | Standalone HTML installation guide for browser viewing |

---

### Task 1: Create the skill file

**Files:**
- Create: `~/.claude/commands/setup-consonant-plugin.md`

- [ ] **Step 1: Create the skill markdown file**

Write the skill file at `~/.claude/commands/setup-consonant-plugin.md` with the following content. This is the complete skill — Claude follows these instructions when a designer types `/setup-consonant-plugin`.

```markdown
---
name: setup-consonant-plugin
description: Automated installer for the Consonant Tools Figma plugin. Checks prerequisites, downloads the repo, builds everything, and guides you through loading the plugin in Figma.
---

# Setup Consonant Plugin

You are helping a non-technical designer install the Consonant Tools Figma plugin. Speak in plain, friendly language. Avoid jargon. Explain what each step does before running it.

Follow these steps in order. Run each command via the Bash tool. Check the result before moving on. If something fails, explain the error in simple terms and try to fix it.

---

## Step 1: Pre-flight checks

Check that Node.js (v18 or higher) and npm are installed.

**Check Node.js:**
```bash
which node && node -v
```

If Node.js is missing OR the version is below 18, tell the designer:

> "You need Node.js to run the plugin's build tools. Here's how to install it:
>
> 1. Go to https://nodejs.org
> 2. Download the **LTS** version (the big green button)
> 3. Open the downloaded `.pkg` file and follow the installer
> 4. When it's done, come back here and tell me"

After they confirm, re-run `which node && node -v` to verify. If it still fails, troubleshoot.

**Check npm:**
```bash
which npm
```

npm comes with Node.js. If it's missing but Node is installed, tell the designer to re-download Node from nodejs.org.

---

## Step 2: Choose install location

Ask the designer:

> "Where would you like to install the plugin files? The default location is **~/Desktop/consonant**.
>
> Press enter to use the default, or type a different path."

Store their answer as `INSTALL_DIR`. If they press enter or give no answer, use `~/Desktop/consonant`.

Expand `~` to the full home directory path using `$HOME`.

**If the folder already exists**, ask:

> "It looks like you already have files at `[INSTALL_DIR]`. Would you like to:
>
> **A)** Download a fresh copy (replaces existing files)
> **B)** Keep existing files and just rebuild"

If they choose A, continue to Step 3. If they choose B, skip to Step 4.

---

## Step 3: Download the files

Run these commands one at a time, reporting progress:

**Download:**
```bash
curl -L https://github.com/adobecom/consonant/archive/refs/heads/main.zip -o /tmp/consonant.zip
```
Tell them: "Downloading the plugin files from GitHub..."

**Extract:**
```bash
unzip -q /tmp/consonant.zip -d /tmp/consonant-extract
```

**Remove old folder if it exists (re-download case):**
```bash
rm -rf INSTALL_DIR
```

**Move to install location:**
```bash
mv /tmp/consonant-extract/consonant-main INSTALL_DIR
```

**Clean up temp files:**
```bash
rm -f /tmp/consonant.zip && rm -rf /tmp/consonant-extract
```

**Verify the key folders exist:**
```bash
ls -d INSTALL_DIR/apps/consonant-specs-plugin INSTALL_DIR/apps/figma-console-mcp INSTALL_DIR/packages/tokens
```

If any folder is missing, tell the designer the download may have failed and offer to retry.

Tell them: "Files downloaded successfully!"

---

## Step 4: Install dependencies and build

Run each step sequentially. Report progress in plain language before each one.

**4a. Install plugin dependencies:**
Tell them: "Installing plugin dependencies... (this may take a minute)"
```bash
cd INSTALL_DIR/apps/consonant-specs-plugin && npm install
```

**4b. Build the plugin:**
Tell them: "Building the plugin..."
```bash
cd INSTALL_DIR/apps/consonant-specs-plugin && node esbuild.config.mjs
```

IMPORTANT: Use `node esbuild.config.mjs` directly — NOT `npm run build`. The npm script uses Nx which requires root workspace dependencies that are not installed in this standalone setup.

**4c. Install consonant MCP server dependencies:**
Tell them: "Installing the bridge server..."
```bash
cd INSTALL_DIR/apps/consonant-specs-plugin/mcp && npm install
```

**4d. Build consonant MCP server:**
Tell them: "Building the bridge server..."
```bash
cd INSTALL_DIR/apps/consonant-specs-plugin/mcp && npm run build
```

**4e. Install figma-console MCP dependencies:**
Tell them: "Installing the Figma console server..."
```bash
cd INSTALL_DIR/apps/figma-console-mcp && npm install
```

**4f. Build figma-console MCP (local mode only):**
Tell them: "Building the Figma console server..."
```bash
cd INSTALL_DIR/apps/figma-console-mcp && npm run build:local
```

Use `build:local` — not `build`. The full build includes Cloudflare and app builds that require extra dependencies (cross-env, vite) and are not needed for local plugin use.

If any step fails, read the error output and explain it in plain terms. Common issues:
- "EACCES permission denied" → suggest running with `sudo` or fixing folder permissions
- "node: command not found" → Node.js is not in PATH, ask them to restart Terminal
- Network errors → ask them to check their internet connection and retry

---

## Step 5: Load the plugin in Figma

Open the plugin folder in Finder:
```bash
open INSTALL_DIR/apps/consonant-specs-plugin
```

Then tell the designer:

> "Almost done! Now you need to load the plugin in Figma. Here's how:
>
> 1. Open **Figma Desktop** (the app, not the browser)
> 2. Open any Figma file (or create a new one)
> 3. In the top menu, go to **Plugins** → **Development** → **Import plugin from manifest...**
> 4. A file picker will open. I've opened the plugin folder in Finder for you — find the file called **manifest.json** and select it
> 5. Click **Open**
>
> The plugin **Consonant Tools** should now appear under **Plugins → Development**.
>
> Let me know when you've done this!"

Wait for the designer to confirm before proceeding.

---

## Step 6: Verification

**6a. Check dist/ files exist:**
```bash
ls INSTALL_DIR/apps/consonant-specs-plugin/dist/code.js INSTALL_DIR/apps/consonant-specs-plugin/dist/ui.html INSTALL_DIR/apps/consonant-specs-plugin/dist/ui-bundle.js
```
If any are missing, re-run the build step (4b).

**6b. Test MCP servers can start:**

Start the consonant MCP server in the background and check it:
```bash
cd INSTALL_DIR/apps/consonant-specs-plugin/mcp && node dist/index.js &
MCP_PID=$!
sleep 2
lsof -i :9220 -t
kill $MCP_PID 2>/dev/null
```

If `lsof` shows a process on port 9220, the consonant MCP server is working. If not, check the build output for errors.

Start figma-console-mcp and check it:
```bash
cd INSTALL_DIR/apps/figma-console-mcp && node dist/local.js &
FCM_PID=$!
sleep 2
lsof -i :3845 -t 2>/dev/null || lsof -i :9223 -t 2>/dev/null
kill $FCM_PID 2>/dev/null
```

If either port shows a process, figma-console-mcp is working.

**6c. Bridge connection test:**

Start the consonant MCP server:
```bash
cd INSTALL_DIR/apps/consonant-specs-plugin/mcp && node dist/index.js &
```

Then tell the designer:

> "Let's test the bridge connection between the plugin and the server.
>
> 1. In Figma, open the **Consonant Tools** plugin (Plugins → Development → Consonant Tools)
> 2. Click the **Bridge** tab in the plugin panel
> 3. Click the **Connect** button
>
> Let me know when you've done this!"

After they confirm, check the connection:
```bash
lsof -i :9220
```

If a connection is established, tell them:

> "The bridge is connected! Everything is working. You're all set to use Consonant Tools in Figma."

If not, troubleshoot:
- Make sure the MCP server is still running
- Make sure Figma is using the Desktop app (not browser)
- Try restarting the plugin in Figma

After verification is complete, kill any background MCP processes:
```bash
kill $(lsof -i :9220 -t) 2>/dev/null
kill $(lsof -i :9223 -t) 2>/dev/null
```

Tell the designer:

> "Setup complete! Here's a quick summary:
>
> - Plugin files are at: `INSTALL_DIR`
> - To use the plugin: open any Figma file → Plugins → Development → Consonant Tools
> - The bridge server needs to be running for AI features — you can start it anytime by asking me to run it
>
> If you need to update the plugin later, just run `/setup-consonant-plugin` again."
```

- [ ] **Step 2: Verify the skill file was written correctly**

Run: `cat ~/.claude/commands/setup-consonant-plugin.md | head -5`
Expected: Should show the frontmatter with `name: setup-consonant-plugin`

- [ ] **Step 3: Commit**

```bash
git add ~/.claude/commands/setup-consonant-plugin.md
```

Note: This file is outside the repo at `~/.claude/commands/`, so it won't be part of a repo commit. Just verify it exists. No git commit needed for this file.

---

### Task 2: Create the HTML installation guide

**Files:**
- Create: `apps/consonant-specs-plugin/docs/setup-guide.html`

- [ ] **Step 1: Create the docs directory if it doesn't exist**

Run: `mkdir -p apps/consonant-specs-plugin/docs`

- [ ] **Step 2: Write the HTML guide**

Create `apps/consonant-specs-plugin/docs/setup-guide.html` with the following content. This is a standalone, self-contained HTML page with all styles inline. No external dependencies.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consonant Tools Plugin — Installation Guide</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fafafa;
      max-width: 720px;
      margin: 0 auto;
      padding: 40px 24px 80px;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #0d0d0d;
    }

    .subtitle {
      font-size: 16px;
      color: #666;
      margin-bottom: 40px;
    }

    h2 {
      font-size: 20px;
      font-weight: 600;
      margin-top: 48px;
      margin-bottom: 16px;
      color: #0d0d0d;
      padding-bottom: 8px;
      border-bottom: 1px solid #e0e0e0;
    }

    h2 .step-number {
      display: inline-block;
      background: #0d0d0d;
      color: #fff;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      text-align: center;
      line-height: 28px;
      font-size: 14px;
      margin-right: 8px;
      vertical-align: middle;
    }

    p { margin-bottom: 16px; }

    ol, ul {
      margin-bottom: 16px;
      padding-left: 24px;
    }

    li { margin-bottom: 8px; }

    code {
      font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace;
      font-size: 13px;
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
    }

    pre {
      background: #1a1a1a;
      color: #e0e0e0;
      padding: 16px 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin-bottom: 16px;
      font-size: 13px;
      line-height: 1.5;
    }

    pre code {
      background: none;
      padding: 0;
      color: inherit;
    }

    .callout {
      background: #fff8e6;
      border-left: 4px solid #f5a623;
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 16px;
    }

    .callout-info {
      background: #e8f4fd;
      border-left-color: #2196f3;
    }

    .callout-success {
      background: #e8f5e9;
      border-left-color: #4caf50;
    }

    .callout strong {
      display: block;
      margin-bottom: 4px;
    }

    .prereq-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }

    .prereq-table th,
    .prereq-table td {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .prereq-table th {
      background: #f5f5f5;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .check { color: #4caf50; }
    .cross { color: #f44336; }

    .menu-path {
      background: #f0f0f0;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;
      white-space: nowrap;
    }

    footer {
      margin-top: 64px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
      font-size: 13px;
      color: #999;
    }
  </style>
</head>
<body>

  <h1>Consonant Tools Plugin</h1>
  <p class="subtitle">Installation guide for designers</p>

  <div class="callout callout-info">
    <strong>What is this?</strong>
    Consonant Tools is a Figma plugin for creating design specs, measurements, annotations, and developer handoff. This guide walks you through installing it on your Mac.
  </div>

  <div class="callout">
    <strong>Have Claude Code?</strong>
    If you have Claude Code set up in your Terminal, you can skip this guide entirely. Just open Terminal, start Claude, and type <code>/setup-consonant-plugin</code>. Claude will do everything for you automatically.
  </div>

  <!-- PREREQUISITES -->
  <h2><span class="step-number">1</span> Prerequisites</h2>

  <p>Before you start, make sure you have these installed:</p>

  <table class="prereq-table">
    <tr>
      <th>Tool</th>
      <th>How to check</th>
      <th>How to install</th>
    </tr>
    <tr>
      <td><strong>Figma Desktop</strong></td>
      <td>Open Figma — it should be the desktop app, not a browser tab</td>
      <td>Download from <a href="https://www.figma.com/downloads/">figma.com/downloads</a></td>
    </tr>
    <tr>
      <td><strong>Node.js</strong> (v18+)</td>
      <td>Open Terminal and type: <code>node -v</code></td>
      <td>Download the LTS version from <a href="https://nodejs.org">nodejs.org</a> — open the <code>.pkg</code> file and follow the installer</td>
    </tr>
  </table>

  <div class="callout callout-info">
    <strong>How do I open Terminal?</strong>
    Press <strong>Cmd + Space</strong> to open Spotlight, type <strong>Terminal</strong>, and press Enter.
  </div>

  <!-- DOWNLOAD -->
  <h2><span class="step-number">2</span> Download the plugin files</h2>

  <p>Open Terminal and paste this command. It downloads the plugin files to your Desktop.</p>

  <pre><code>curl -L https://github.com/adobecom/consonant/archive/refs/heads/main.zip -o /tmp/consonant.zip && unzip -q /tmp/consonant.zip -d /tmp/consonant-extract && mv /tmp/consonant-extract/consonant-main ~/Desktop/consonant && rm -f /tmp/consonant.zip && rm -rf /tmp/consonant-extract && echo "Done! Files are at ~/Desktop/consonant"</code></pre>

  <div class="callout">
    <strong>Want to install somewhere else?</strong>
    Replace <code>~/Desktop/consonant</code> in the command above with your preferred location.
  </div>

  <!-- BUILD -->
  <h2><span class="step-number">3</span> Build the plugin</h2>

  <p>Still in Terminal, run these commands one at a time. Each one installs dependencies and builds a part of the plugin.</p>

  <p><strong>3a.</strong> Install and build the plugin itself:</p>
  <pre><code>cd ~/Desktop/consonant/apps/consonant-specs-plugin && npm install && node esbuild.config.mjs</code></pre>

  <p><strong>3b.</strong> Install and build the bridge server (connects the plugin to AI features):</p>
  <pre><code>cd ~/Desktop/consonant/apps/consonant-specs-plugin/mcp && npm install && npm run build</code></pre>

  <p><strong>3c.</strong> Install and build the Figma console server:</p>
  <pre><code>cd ~/Desktop/consonant/apps/figma-console-mcp && npm install && npm run build:local</code></pre>

  <div class="callout callout-info">
    <strong>This might take a minute.</strong>
    You'll see a lot of text scrolling by — that's normal. Wait until you see a line that says the build is done or you get back to the <code>$</code> prompt.
  </div>

  <!-- FIGMA -->
  <h2><span class="step-number">4</span> Load the plugin in Figma</h2>

  <ol>
    <li>Open <strong>Figma Desktop</strong> (the app, not a browser tab)</li>
    <li>Open any Figma file, or create a new one</li>
    <li>In the top menu bar, click <span class="menu-path">Plugins → Development → Import plugin from manifest...</span></li>
    <li>A file picker window opens. Navigate to:<br>
      <code>Desktop → consonant → apps → consonant-specs-plugin</code></li>
    <li>Select the file called <strong>manifest.json</strong> and click <strong>Open</strong></li>
  </ol>

  <p>The plugin <strong>Consonant Tools</strong> should now appear under <span class="menu-path">Plugins → Development</span>.</p>

  <div class="callout callout-info">
    <strong>Tip:</strong> You can also open the plugin folder in Finder by pasting this in Terminal:
    <pre><code>open ~/Desktop/consonant/apps/consonant-specs-plugin</code></pre>
  </div>

  <!-- VERIFY -->
  <h2><span class="step-number">5</span> Verify it works</h2>

  <p><strong>5a. Check the plugin loads:</strong></p>
  <ol>
    <li>In Figma, go to <span class="menu-path">Plugins → Development → Consonant Tools</span></li>
    <li>The plugin panel should open — you should see tabs for Specs, Bridge, and other features</li>
  </ol>

  <p><strong>5b. Test the bridge connection:</strong></p>
  <ol>
    <li>In Terminal, start the bridge server:
      <pre><code>cd ~/Desktop/consonant/apps/consonant-specs-plugin/mcp && node dist/index.js</code></pre>
    </li>
    <li>In Figma, open the Consonant Tools plugin and click the <strong>Bridge</strong> tab</li>
    <li>Click the <strong>Connect</strong> button</li>
    <li>If the status changes to connected, everything is working!</li>
  </ol>

  <div class="callout callout-success">
    <strong>You're all set!</strong>
    The Consonant Tools plugin is installed and ready to use. To use AI-powered features, you'll need the bridge server running in Terminal (step 5b command 1).
  </div>

  <!-- UPDATING -->
  <h2><span class="step-number">6</span> Updating the plugin</h2>

  <p>To get the latest version of the plugin, re-run the steps above starting from Step 2. Or, if you have Claude Code, just type <code>/setup-consonant-plugin</code> and let Claude handle it.</p>

  <footer>
    Consonant Tools — S2A Design System &middot; Adobe
  </footer>

</body>
</html>
```

- [ ] **Step 3: Verify the HTML file renders correctly**

Run: `open apps/consonant-specs-plugin/docs/setup-guide.html`

Check that:
- The page loads in a browser
- All 6 sections render with numbered step circles
- Code blocks are styled with dark backgrounds
- Callout boxes appear with colored left borders
- No broken layout or missing content

- [ ] **Step 4: Commit**

```bash
git add apps/consonant-specs-plugin/docs/setup-guide.html
git commit -m "feat: add consonant-specs-plugin setup guide (HTML)"
```

---

### Task 3: End-to-end test of the skill

**Files:**
- Test: `~/.claude/commands/setup-consonant-plugin.md` (read-only, verify it works)

- [ ] **Step 1: Verify the skill is discoverable**

Start a new Claude Code session and type `/setup-consonant-plugin`. Verify that Claude picks up the skill and begins the setup flow.

- [ ] **Step 2: Dry-run the pre-flight checks**

Confirm Claude runs `which node && node -v` and `which npm` and reports results correctly.

- [ ] **Step 3: Verify the install location prompt**

Confirm Claude asks where to install and accepts `~/Desktop/consonant` as default.

Note: A full end-to-end test (download + build + Figma load + bridge) should be done manually by the developer. The skill is conversational and requires designer interaction at several points (Figma plugin import, bridge connect button).
