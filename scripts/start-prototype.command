#!/usr/bin/env bash
# start-prototype.command — prototype workflow test session
# Double-click this to start the full prototype stack:
#   Cursor + Storybook + Prototype Server (port 9400)

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

INSTALL_DIR="$HOME/Desktop/prototyping/consonant"

echo ""
echo -e "${BOLD}S2A Toolkit — Prototype Test Session${NC}"
echo "──────────────────────────────────────────"
echo ""

# Verify the repo exists
if [ ! -d "$INSTALL_DIR" ]; then
  echo -e "${YELLOW}!${NC} Repo not found at $INSTALL_DIR"
  echo "  Run the main setup script first: scripts/designer-setup.sh"
  echo ""
  read -p "Press any key to close..."
  exit 1
fi

# 1. Open Cursor
echo -e "${BLUE}→${NC} Opening Cursor..."
open -a Cursor "$INSTALL_DIR" 2>/dev/null \
  || echo "  ! Cursor not found — open it manually"

# 2. Start Storybook (skip if already running)
if lsof -ti:6006 &>/dev/null; then
  echo -e "${GREEN}✓${NC} Storybook already running at http://localhost:6006"
else
  echo -e "${BLUE}→${NC} Starting Storybook..."
  osascript -e "tell application \"Terminal\" to do script \"cd '$INSTALL_DIR' && npm run storybook\"" 2>/dev/null \
    || echo "  ! Couldn't open Terminal — run: cd $INSTALL_DIR && npm run storybook"
  echo -e "${GREEN}✓${NC} Storybook starting at http://localhost:6006 (~30s to load)"
fi

# 3. Start the prototype server (port 9400)
if lsof -ti:9400 &>/dev/null; then
  echo -e "${GREEN}✓${NC} Prototype server already running at http://localhost:9400"
else
  echo -e "${BLUE}→${NC} Starting prototype server (port 9400)..."
  osascript -e "tell application \"Terminal\" to do script \"cd '$INSTALL_DIR' && npm run prototype-server\"" 2>/dev/null \
    || echo "  ! Couldn't open Terminal — run: cd $INSTALL_DIR && npm run prototype-server"
  echo -e "${GREEN}✓${NC} Prototype server starting at http://localhost:9400"
fi

echo ""
echo -e "${BOLD}How to test the prototype workflow:${NC}"
echo ""
echo "  1. Open Figma and open your working file"
echo "  2. Run the S2A Toolkit plugin"
echo "  3. Select any frame on the canvas"
echo "  4. Go to the Prototype tab in the plugin"
echo "  5. Type what the prototype should demonstrate"
echo "  6. Click Generate Prototype"
echo ""
echo -e "${BLUE}→${NC} Storybook:        http://localhost:6006"
echo -e "${BLUE}→${NC} Prototype server: http://localhost:9400/health"
echo ""
