#!/bin/bash
# scripts/hooks/install-claude-hooks.sh — adds the four agent-workflow hooks to
# the project's .claude/settings.json. The owner runs this, not the agent
# (an agent editing its own hook config is blocked as self-modification).
#
# Safe to run again: it only adds what is missing and backs up the file first.
# This repo already has a SessionStart hook (the /sync nudge); the new
# session-start hook is appended beside it, not in place of it.
set -eu
root="$(cd "$(dirname "$0")/../.." && pwd)"; f="$root/.claude/settings.json"
command -v jq >/dev/null || { echo "jq is needed"; exit 1; }
[ -f "$f" ] || echo '{}' > "$f"
cp "$f" "$f.bak.$(date +%Y%m%d%H%M%S)"

add() { # event script statusMessage timeout
  local ev="$1" cmd="bash \"\$CLAUDE_PROJECT_DIR/scripts/hooks/$2\"" s="$3" t="$4"
  jq --arg ev "$ev" --arg c "$cmd" --arg s "$s" --argjson t "$t" '
    .hooks[$ev] //= []
    | if ([.hooks[$ev][]?.hooks[]?.command] | index($c)) then .
      else .hooks[$ev] += [{hooks:[{type:"command",command:$c,timeout:$t,statusMessage:$s}]}] end
  ' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
}
add SessionStart     session-start.sh       "Last handoff and work since" 10
add Stop             stop-handoff-nudge.sh  "Handoff check"               10
add UserPromptSubmit log-prompt.sh          "Prompt log"                  5
add SessionEnd       archive-transcript.sh  "Archive transcript"          15

echo "Hooks now in $f:"; jq -r '.hooks | to_entries[] | "  \(.key): \(.value | length)"' "$f"
echo "Restart Claude Code for them to take effect."
