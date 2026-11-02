#!/bin/bash
# UserPromptSubmit hook. Appends each prompt the owner types to a local log
# outside the repo, so the session digest can see them even for sessions
# whose transcript never lands on disk. Holds only the owner's own words.
# Exit 0 always; this never blocks a prompt.
set -u
input=$(cat)
[ -n "$input" ] || exit 0
command -v jq >/dev/null 2>&1 || exit 0
repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
dir="$HOME/.agent-sessions/$repo"; mkdir -p "$dir"
tool="${PROMPT_LOG_TOOL:-Claude Code}"
printf '%s' "$input" | jq -c --arg tool "$tool" --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{ts:$ts, tool:$tool, session:(.session_id // "unknown"), cwd:(.cwd // ""), prompt:(.prompt // .user_prompt // .input // "")}' \
  >> "$dir/prompt-log.jsonl" 2>/dev/null
exit 0
