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

ask() {
  local prompt="$1"
  local default="${2:-y}"
  local answer
  if [[ "$default" == "y" ]]; then
    read -rp "$(echo -e "${BOLD}?${NC} $prompt [Y/n] ")" answer
    answer="${answer:-y}"
  else
    read -rp "$(echo -e "${BOLD}?${NC} $prompt [y/N] ")" answer
    answer="${answer:-n}"
  fi
  [[ "$answer" =~ ^[Yy] ]]
}

echo ""
hi "S2A Design System — MCP Setup"
hi "================================="
echo ""
echo "This script sets up the MCP servers that give Claude Code"
echo "live access to your Figma files and the S2A design system."
echo "Each step will ask before installing anything."
echo ""

REPO_URL="https://github.com/adobecom/consonant.git"
INSTALL_DIR="$HOME/Desktop/prototyping/consonant"

# ── 1. Homebrew ───────────────────────────────────────────────────────────────
echo ""
hi "── Prerequisites ──────────────────────────────────────────"
echo ""

if ! command -v brew &>/dev/null; then
  if ask "Install Homebrew? (package manager — needed to install the tools below)"; then
    log "Installing Homebrew (you may be prompted for your Mac password)..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    [[ -f /opt/homebrew/bin/brew ]] && eval "$(/opt/homebrew/bin/brew shellenv)"
    ok "Homebrew installed"
  else
    warn "Skipping Homebrew — some installs below may fail without it"
  fi
else
  ok "Homebrew already installed"
fi

# ── 2. Node via nvm ──────────────────────────────────────────────────────────
export NVM_DIR="$HOME/.nvm"

if ! command -v node &>/dev/null || [[ ! -f "$NVM_DIR/nvm.sh" && ! $(brew list nvm 2>/dev/null) ]]; then
  if ask "Install Node.js 20 via nvm? (required to run the MCP servers)"; then
    if [[ ! -f "$NVM_DIR/nvm.sh" ]] && ! brew list nvm &>/dev/null; then
      log "Installing nvm..."
      brew install nvm
      mkdir -p "$NVM_DIR"
    fi
    [[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh"
    [[ -s "$(brew --prefix nvm 2>/dev/null)/nvm.sh" ]] && . "$(brew --prefix nvm)/nvm.sh"
    log "Installing Node 20..."
    nvm install 20 --silent
    nvm use 20 --silent
    ok "Node $(node -v)"
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
  else
    warn "Skipping Node — MCP servers require Node 18+. Install it manually if you already have it another way."
  fi
else
  [[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh"
  [[ -s "$(brew --prefix nvm 2>/dev/null)/nvm.sh" ]] && . "$(brew --prefix nvm)/nvm.sh"
  ok "Node already installed ($(node -v))"
fi

# ── 3. GitHub CLI ────────────────────────────────────────────────────────────
if ! command -v gh &>/dev/null; then
  if ask "Install GitHub CLI? (lets Claude create branches and PRs on your behalf)"; then
    log "Installing GitHub CLI..."
    brew install gh
    ok "GitHub CLI installed"
  else
    warn "Skipping GitHub CLI"
  fi
else
  ok "GitHub CLI already installed ($(gh --version | head -1))"
fi

# ── 4. Claude Code ───────────────────────────────────────────────────────────
echo ""
hi "── AI Tools ───────────────────────────────────────────────"
echo ""

if ! command -v claude &>/dev/null; then
  if ask "Install Claude Code CLI? (the AI agent you talk to in your terminal)"; then
    log "Installing Claude Code..."
    npm install -g @anthropic-ai/claude-code --silent
    ok "Claude Code installed"
    echo ""
    warn "Before you can use Claude Code, request access at go/claude (Adobe internal)"
    warn "Then run: claude login"
  else
    warn "Skipping Claude Code"
  fi
else
  ok "Claude Code already installed ($(claude --version 2>/dev/null || echo 'version unknown'))"
fi

# ── 5. Cursor ────────────────────────────────────────────────────────────────
if [[ ! -d "/Applications/Cursor.app" ]]; then
  if ask "Install Cursor? (optional code editor for reviewing what Claude builds — free tier works)" "n"; then
    log "Installing Cursor..."
    brew install --cask cursor --quiet
    ok "Cursor installed"
    echo "  Adobe provides Cursor Pro — set it up at go/cursor"
  else
    warn "Skipping Cursor"
  fi
else
  ok "Cursor already installed"
fi

# ── 6. Git identity ──────────────────────────────────────────────────────────
echo ""
if [[ -z "$(git config --global user.name)" ]]; then
  read -rp "$(echo -e "${BOLD}?${NC} Your full name (for git commits): ")" GIT_NAME
  git config --global user.name "$GIT_NAME"
fi
if [[ -z "$(git config --global user.email)" ]]; then
  read -rp "$(echo -e "${BOLD}?${NC} Your email (Adobe or personal — whichever matches your GitHub account): ")" GIT_EMAIL
  git config --global user.email "$GIT_EMAIL"
fi
ok "Git identity: $(git config --global user.name) <$(git config --global user.email)>"

# ── 7. Clone consonant repo ──────────────────────────────────────────────────
echo ""
hi "── MCP Servers ────────────────────────────────────────────"
echo ""

CLONED=false

if [[ -d "$INSTALL_DIR/.git" ]]; then
  ok "consonant repo already at $INSTALL_DIR — pulling latest"
  git -C "$INSTALL_DIR" checkout main --quiet
  git -C "$INSTALL_DIR" pull --ff-only --quiet
  CLONED=true
else
  echo "  The s2a-ds MCP server lives inside the consonant repo."
  echo "  It will be cloned to: $INSTALL_DIR"
  echo ""
  if ask "Clone the consonant repo and install dependencies?"; then
    mkdir -p "$HOME/Desktop/prototyping"
    log "Cloning consonant to $INSTALL_DIR..."
    git clone --recurse-submodules "$REPO_URL" "$INSTALL_DIR" --quiet
    log "Initializing submodules..."
    git -C "$INSTALL_DIR" submodule update --init --quiet
    ok "Repo cloned"
    log "Installing dependencies (this takes a minute)..."
    cd "$INSTALL_DIR"
    npm install --silent
    ok "Dependencies installed"
    CLONED=true
  else
    warn "Skipping repo clone — s2a-ds MCP will not be available"
  fi
fi

# ── 8. Figma Console MCP ─────────────────────────────────────────────────────
FIGMA_PLUGIN_SRC="$INSTALL_DIR/node_modules/figma-console-mcp/plugin"
FIGMA_CONSOLE_MCP="$INSTALL_DIR/node_modules/figma-console-mcp/dist/local.js"
FIGMA_PLUGIN_DEST="$HOME/.figma-console-mcp/plugin"

if ask "Set up Figma Console MCP? (gives Claude direct read/write access to your Figma files)"; then
  SETUP_FIGMA=true

  if [[ "$CLONED" == true && -d "$FIGMA_PLUGIN_SRC" ]]; then
    mkdir -p "$HOME/.figma-console-mcp"
    cp -r "$FIGMA_PLUGIN_SRC" "$HOME/.figma-console-mcp/"
    ok "Figma Desktop Bridge plugin ready at ~/.figma-console-mcp/plugin/"
  elif [[ "$CLONED" == false ]]; then
    warn "Repo not cloned — Figma Console MCP requires the consonant repo. Skipping."
    SETUP_FIGMA=false
  else
    warn "figma-console-mcp plugin not found in node_modules — Figma bridge will need manual setup"
  fi
else
  SETUP_FIGMA=false
  warn "Skipping Figma Console MCP"
fi

# ── 9. s2a-ds MCP server ─────────────────────────────────────────────────────
S2A_MCP_DIR="$INSTALL_DIR/apps/s2a-ds-mcp"
S2A_MCP_DIST="$S2A_MCP_DIR/dist/local.js"
SETUP_S2A=false

if [[ "$CLONED" == true ]]; then
  if ask "Build the s2a-ds MCP server? (gives Claude live access to S2A tokens and component specs)"; then
    if [[ -d "$S2A_MCP_DIR" ]]; then
      log "Building s2a-ds MCP server..."
      cd "$S2A_MCP_DIR"
      npm install --silent
      npm run copy-data --silent
      npm run build --silent
      cd "$INSTALL_DIR"
      ok "s2a-ds MCP server built"
      SETUP_S2A=true
    else
      warn "s2a-ds MCP server directory not found in repo"
    fi
  else
    warn "Skipping s2a-ds MCP"
  fi
fi

# ── 9a. design-systems knowledge base ────────────────────────────────────────
log "Checking design-systems knowledge base (WCAG, ARIA, W3C standards)..."
if curl -sf --max-time 8 "https://design-systems-mcp.southleft.com/mcp" > /dev/null 2>&1; then
  ok "Design systems knowledge base reachable"
else
  warn "Design systems knowledge base unreachable right now — it will be configured but may not respond until your network allows it"
fi

# ── 10. Write .mcp.json ──────────────────────────────────────────────────────
if [[ "$CLONED" == true ]]; then
  log "Writing .mcp.json..."

  if [[ "$SETUP_S2A" == true && -f "$S2A_MCP_DIST" ]]; then
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
  elif [[ "$SETUP_FIGMA" == true ]]; then
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
  else
    cat > "$INSTALL_DIR/.mcp.json" <<EOF
{
  "mcpServers": {
    "design-systems": {
      "type": "http",
      "url": "https://design-systems-mcp.southleft.com/mcp"
    }
  }
}
EOF
  fi
  ok "MCP servers configured"

  # ── 10a. Write .claude/settings.local.json ─────────────────────────────────
  CLAUDE_LOCAL_SETTINGS="$INSTALL_DIR/.claude/settings.local.json"
  if [[ ! -f "$CLAUDE_LOCAL_SETTINGS" ]]; then
    mkdir -p "$INSTALL_DIR/.claude"
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
fi

# ── 11. GitHub auth ──────────────────────────────────────────────────────────
echo ""
if gh auth status &>/dev/null; then
  ok "Already logged in to GitHub as $(gh api user --jq .login)"
elif ask "Log in to GitHub now? (a browser window will open)"; then
  gh auth login --web --git-protocol https
else
  warn "Skipping GitHub login — run 'gh auth login' when you're ready"
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
hi "================================="
echo -e "${GREEN}Setup complete.${NC}"
echo ""

if [[ "$CLONED" == true ]]; then
  echo "  Repo is at: $INSTALL_DIR"
  echo ""
fi

if ! command -v claude &>/dev/null || ! claude whoami &>/dev/null 2>&1; then
  echo -e "  ${YELLOW}Before you can use Claude Code:${NC}"
  echo "    → Request access at go/claude (Adobe internal)"
  echo "    → Then run: claude login"
  echo ""
fi

if [[ "$SETUP_FIGMA" == true ]]; then
  echo "  One-time Figma setup (do this now):"
  echo "    1. Open Figma Desktop"
  echo "    2. Go to Plugins → Development → Import plugin from manifest..."
  echo "    3. Press Cmd+Shift+G in the file picker, paste this path, press Enter:"
  echo "         ~/.figma-console-mcp/plugin/manifest.json"
  echo "    4. The plugin will appear as 'Figma Desktop Bridge'"
  echo "    5. Open any Figma file and run it — keep the panel open while using MCP tools"
  echo ""
fi

if [[ "$CLONED" == true ]]; then
  echo "  To start a Claude Code session with all MCP servers:"
  echo "    cd $INSTALL_DIR"
  echo "    claude"
  echo ""
fi
