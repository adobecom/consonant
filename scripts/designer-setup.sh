#!/usr/bin/env bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

log()  { echo -e "${BLUE}→${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }
hi()   { echo -e "${BOLD}$1${NC}"; }

echo ""
hi "S2A Design System — Designer Setup"
hi "======================================"
echo ""

REPO_URL="https://github.com/adobecom/consonant.git"
INSTALL_DIR="$HOME/Desktop/prototyping/consonant"

# ── 1. Homebrew ───────────────────────────────────────────────────────────────
if ! command -v brew &>/dev/null; then
  log "Installing Homebrew (you may be prompted for your Mac password)..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  [[ -f /opt/homebrew/bin/brew ]] && eval "$(/opt/homebrew/bin/brew shellenv)"
else
  ok "Homebrew already installed"
fi

# ── 2. Node via nvm ──────────────────────────────────────────────────────────
export NVM_DIR="$HOME/.nvm"

if [[ ! -f "$NVM_DIR/nvm.sh" ]] && ! brew list nvm &>/dev/null; then
  log "Installing nvm..."
  brew install nvm
  mkdir -p "$NVM_DIR"
fi

# Load nvm from either brew or direct install
[[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh"
[[ -s "$(brew --prefix nvm 2>/dev/null)/nvm.sh" ]] && . "$(brew --prefix nvm)/nvm.sh"

log "Setting up Node 20..."
nvm install 20 --silent
nvm use 20 --silent
ok "Node $(node -v)"

# Persist nvm to shell profile
PROFILE="$HOME/.zshrc"
[[ "$SHELL" == *"bash"* ]] && PROFILE="$HOME/.bash_profile"
if ! grep -q 'NVM_DIR' "$PROFILE" 2>/dev/null; then
  {
    echo ''
    echo '# nvm'
    echo 'export NVM_DIR="$HOME/.nvm"'
    echo '[ -s "$(brew --prefix nvm)/nvm.sh" ] && . "$(brew --prefix nvm)/nvm.sh"'
  } >> "$PROFILE"
fi

# ── 3. GitHub CLI ────────────────────────────────────────────────────────────
if ! command -v gh &>/dev/null; then
  log "Installing GitHub CLI..."
  brew install gh
else
  ok "GitHub CLI already installed ($(gh --version | head -1))"
fi

# ── 4. Claude Code CLI ───────────────────────────────────────────────────────
if ! command -v claude &>/dev/null; then
  log "Installing Claude Code..."
  npm install -g @anthropic-ai/claude-code --silent
  ok "Claude Code installed"
else
  ok "Claude Code already installed ($(claude --version 2>/dev/null || echo 'version unknown'))"
fi

# ── 5. Cursor ────────────────────────────────────────────────────────────────
if [[ ! -d "/Applications/Cursor.app" ]]; then
  log "Installing Cursor..."
  brew install --cask cursor --quiet
  ok "Cursor installed"
else
  ok "Cursor already installed"
fi

# ── 6. Git identity ──────────────────────────────────────────────────────────
if [[ -z "$(git config --global user.name)" ]]; then
  echo ""
  read -rp "Your full name (for git commits): " GIT_NAME
  git config --global user.name "$GIT_NAME"
fi
if [[ -z "$(git config --global user.email)" ]]; then
  read -rp "Your email (Adobe or personal — whichever matches your GitHub account): " GIT_EMAIL
  git config --global user.email "$GIT_EMAIL"
fi
ok "Git identity: $(git config --global user.name) <$(git config --global user.email)>"

# ── 7. Clone or update repo ──────────────────────────────────────────────────
mkdir -p "$HOME/Desktop/prototyping"
if [[ -d "$INSTALL_DIR/.git" ]]; then
  ok "Repo already at $INSTALL_DIR — pulling latest"
  git -C "$INSTALL_DIR" checkout main --quiet
  git -C "$INSTALL_DIR" pull --ff-only --quiet
else
  log "Cloning consonant to $INSTALL_DIR..."
  git clone --recurse-submodules "$REPO_URL" "$INSTALL_DIR" --quiet
fi

# ── 7a. Initialize submodules (in case they weren't cloned with --recurse) ───
log "Initializing submodules (context/milo)..."
git -C "$INSTALL_DIR" submodule update --init --quiet
ok "Submodules ready"

# ── 8. Install npm dependencies ──────────────────────────────────────────────
log "Installing dependencies (this takes a minute)..."
cd "$INSTALL_DIR"
npm install --silent
ok "Dependencies installed"

# ── 8a. Copy Figma Desktop Bridge plugin to stable location ──────────────────
FIGMA_PLUGIN_SRC="$INSTALL_DIR/node_modules/figma-console-mcp/plugin"
FIGMA_PLUGIN_DEST="$HOME/.figma-console-mcp/plugin"

if [[ -d "$FIGMA_PLUGIN_SRC" ]]; then
  mkdir -p "$HOME/.figma-console-mcp"
  cp -r "$FIGMA_PLUGIN_SRC" "$HOME/.figma-console-mcp/"
  ok "Figma Desktop Bridge plugin ready at ~/.figma-console-mcp/plugin/"
else
  warn "figma-console-mcp plugin not found in node_modules — Figma bridge will need manual setup"
fi

# ── 9. Build s2a-ds MCP server if present ───────────────────────────────────
S2A_MCP_DIR="$INSTALL_DIR/apps/s2a-ds-mcp"
S2A_MCP_DIST="$S2A_MCP_DIR/dist/local.js"

if [[ -d "$S2A_MCP_DIR" ]]; then
  log "Building s2a-ds MCP server..."
  cd "$S2A_MCP_DIR"
  npm install --silent
  npm run copy-data --silent
  npm run build --silent
  cd "$INSTALL_DIR"
  ok "s2a-ds MCP server built"
else
  warn "s2a-ds MCP server not found — you can still use Claude, just without design token lookups"
fi

# ── 9a. Verify design-systems knowledge base (HTTP MCP) ─────────────────────
log "Connecting to design-systems knowledge base (WCAG, ARIA, W3C standards)..."
if curl -sf --max-time 8 "https://design-systems-mcp.southleft.com/mcp" > /dev/null 2>&1; then
  ok "Design systems knowledge base reachable — WCAG, ARIA, and industry pattern lookups enabled"
else
  warn "Design systems knowledge base unreachable right now — it will be configured but may not respond until your network allows it"
  warn "Source: https://github.com/southleft/design-systems-mcp"
fi

# ── 10. Write .mcp.json ──────────────────────────────────────────────────────
log "Configuring MCP servers..."

FIGMA_CONSOLE_MCP="$INSTALL_DIR/node_modules/figma-console-mcp/dist/local.js"

if [[ -f "$S2A_MCP_DIST" ]]; then
  cat > "$INSTALL_DIR/.mcp.json" <<EOF
{
  "mcpServers": {
    "figma-console": {
      "command": "node",
      "args": ["$FIGMA_CONSOLE_MCP"]
    },
    "s2a-ds": {
      "command": "node",
      "args": ["$S2A_MCP_DIST"],
      "env": {
        "DS_ROOT": "$INSTALL_DIR"
      }
    },
    "design-systems": {
      "type": "http",
      "url": "https://design-systems-mcp.southleft.com/mcp"
    }
  }
}
EOF
else
  cat > "$INSTALL_DIR/.mcp.json" <<EOF
{
  "mcpServers": {
    "figma-console": {
      "command": "node",
      "args": ["$FIGMA_CONSOLE_MCP"]
    },
    "design-systems": {
      "type": "http",
      "url": "https://design-systems-mcp.southleft.com/mcp"
    }
  }
}
EOF
fi
ok "MCP servers configured (figma-console + s2a-ds + design-systems knowledge base)"

# ── 10a. Write .claude/settings.local.json ───────────────────────────────────
# This file is gitignored but required for Claude Code to enable MCP servers
# and load project skills (.claude/commands/) in a fresh session.
CLAUDE_LOCAL_SETTINGS="$INSTALL_DIR/.claude/settings.local.json"
if [[ ! -f "$CLAUDE_LOCAL_SETTINGS" ]]; then
  cat > "$CLAUDE_LOCAL_SETTINGS" <<'EOF'
{
  "enableAllProjectMcpServers": true,
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(gh:*)",
      "Bash(npm:*)",
      "Bash(node:*)",
      "Bash(npx:*)",
      "Bash(curl:*)",
      "Bash(open:*)",
      "Bash(lsof:*)",
      "Bash(mkdir:*)",
      "Bash(cp:*)",
      "Bash(ls:*)",
      "WebSearch",
      "WebFetch(domain:github.com)",
      "WebFetch(domain:adobecom.github.io)",
      "WebFetch(domain:localhost)",
      "mcp__figma-console__figma_execute",
      "mcp__figma-console__figma_get_status",
      "mcp__figma-console__figma_take_screenshot",
      "mcp__figma-console__figma_search_components",
      "mcp__figma-console__figma_get_styles",
      "mcp__figma__get_design_context",
      "mcp__s2a-ds__get_component",
      "mcp__s2a-ds__get_component_spec",
      "mcp__s2a-ds__get_component_tokens",
      "mcp__s2a-ds__list_components",
      "mcp__s2a-ds__list_spec_coverage",
      "mcp__s2a-ds__find_component_for_use_case",
      "mcp__s2a-ds__search_tokens",
      "mcp__s2a-ds__resolve_token",
      "mcp__s2a-ds__check_token_exists",
      "mcp__s2a-ds__validate_css",
      "mcp__s2a-ds__audit_css",
      "mcp__s2a-ds__validate_spec",
      "mcp__s2a-ds__validate_component_usage",
      "mcp__s2a-ds__get_token_collection",
      "mcp__design-systems__search_design_knowledge",
      "mcp__design-systems__search_chunks",
      "mcp__design-systems__browse_by_category",
      "mcp__design-systems__get_all_tags"
    ]
  }
}
EOF
  ok "Claude Code session settings written"
else
  ok "Claude Code session settings already exist — skipping"
fi

# ── 11. GitHub auth ──────────────────────────────────────────────────────────
echo ""
if gh auth status &>/dev/null; then
  ok "Already logged in to GitHub as $(gh api user --jq .login)"
else
  log "Logging in to GitHub (a browser window will open)..."
  gh auth login --web --git-protocol https
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
hi "======================================"
echo -e "${GREEN}You're all set!${NC}"
echo ""
echo "  Project is at: $INSTALL_DIR"
echo ""

# Remind about Adobe-provisioned tools if not already active
if ! command -v claude &>/dev/null || ! claude whoami &>/dev/null 2>&1; then
  echo -e "  ${YELLOW}Before you can use Claude Code:${NC}"
  echo "    → Request access at go/claude (Adobe internal)"
  echo "    → Then run: claude login"
  echo ""
fi

echo "  One-time Figma setup (do this now):"
echo "    1. Open Figma Desktop"
echo "    2. Go to Plugins → Development → Import plugin from manifest..."
echo "    3. In the file picker, press Cmd+Shift+G to open 'Go to folder'"
echo "    4. Paste this path and press Enter:"
echo "         ~/.figma-console-mcp/plugin/manifest.json"
echo "    5. Click Open"
echo "    6. The plugin will appear as 'Figma Desktop Bridge' — click Run when you need it"
echo ""
echo "  Opening Cursor and Storybook for you now..."
echo ""

# Open Cursor with the project
open -a Cursor "$INSTALL_DIR" 2>/dev/null || warn "Couldn't open Cursor automatically — open it from Applications or Spotlight"

# Start Storybook in a new Terminal window
osascript -e "tell application \"Terminal\" to do script \"cd '$INSTALL_DIR' && npm run storybook\"" 2>/dev/null \
  || warn "Couldn't open Terminal automatically — run: cd $INSTALL_DIR && npm run storybook"

echo "  Storybook will be at:  http://localhost:6006  (give it ~30 seconds to start)"
echo ""
echo "  When you're ready to build something:"
echo "    1. Switch to the Cursor window that just opened"
echo "    2. Open Claude Code inside Cursor (or run: claude ~/Desktop/prototyping/consonant)"
echo "    3. Type:  /start-feature \"describe what you're building\""
echo ""
echo "  Pro tip: Storybook auto-reloads as you make changes — leave it open."
echo "  Cursor Pro available via go/cursor (Adobe internal)."
echo ""
