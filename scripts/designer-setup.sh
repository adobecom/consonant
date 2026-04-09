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
INSTALL_DIR="$HOME/consonant"

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
if [[ -d "$INSTALL_DIR/.git" ]]; then
  ok "Repo already at $INSTALL_DIR — pulling latest"
  git -C "$INSTALL_DIR" checkout main --quiet
  git -C "$INSTALL_DIR" pull --ff-only --quiet
else
  log "Cloning consonant to $INSTALL_DIR..."
  git clone "$REPO_URL" "$INSTALL_DIR" --quiet
fi

# ── 8. Install npm dependencies ──────────────────────────────────────────────
log "Installing dependencies (this takes a minute)..."
cd "$INSTALL_DIR"
npm install --silent
ok "Dependencies installed"

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
    }
  }
}
EOF
fi
ok "MCP servers configured"

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

echo "  To start working:"
echo "    1. Open terminal and run:  claude $INSTALL_DIR"
echo "    2. Type:  /start-feature \"describe what you're building\""
echo ""
echo "  Cursor is also installed — open it from Applications or Spotlight."
echo "  Free tier works fine to start. Pro available via go/cursor (Adobe internal)."
echo ""
