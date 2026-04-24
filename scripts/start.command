#!/usr/bin/env bash
# start.command — double-click this every time you sit down to work.
# Opens Cursor, starts Storybook, and reminds you what to do next.

GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

INSTALL_DIR="$HOME/Desktop/prototyping/consonant"

echo ""
echo -e "${BOLD}S2A Design System — Starting your session${NC}"
echo "────────────────────────────────────────────"
echo ""

# 1. Open Cursor with the project
echo -e "${BLUE}→${NC} Opening Cursor..."
open -a Cursor "$INSTALL_DIR" 2>/dev/null \
  || echo "  ! Cursor not found — open it from Applications and navigate to $INSTALL_DIR"

# 2. Start Storybook in a Terminal window (skip if already running)
if lsof -ti:6006 &>/dev/null; then
  echo -e "${GREEN}✓${NC} Storybook already running at http://localhost:6006"
else
  echo -e "${BLUE}→${NC} Starting Storybook..."
  osascript -e "tell application \"Terminal\" to do script \"cd '$INSTALL_DIR' && npm run storybook\"" 2>/dev/null \
    || echo "  ! Couldn't open Terminal — run: cd $INSTALL_DIR && npm run storybook"
  echo -e "${GREEN}✓${NC} Storybook starting at http://localhost:6006 (give it ~30 seconds)"
fi

echo ""
echo -e "${BOLD}What to do next:${NC}"
echo "  1. Switch to the Cursor window that just opened"
echo "  2. Open Claude Code (click the Claude icon in the sidebar)"
echo "  3. Type:  /sync"
echo "  4. Then describe what you want to build"
echo ""
echo -e "${BLUE}→${NC} Storybook: http://localhost:6006"
echo ""
