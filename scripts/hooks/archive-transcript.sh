#!/bin/bash
# SessionEnd hook. Copies the session transcript, when there is one, to a
# local folder outside the repo, so it survives the tool's own cleanup and
# so the digest can read it. Exit 0 always. Must finish in under 3 seconds
# for Codex.
set -u
input=$(cat)
[ -n "$input" ] || exit 0
command -v jq >/dev/null 2>&1 || exit 0
path=$(printf '%s' "$input" | jq -r '.transcript_path // empty')
[ -n "$path" ] && [ -f "$path" ] || exit 0
repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
dest="$HOME/.agent-sessions/$repo/transcripts"; mkdir -p "$dest"
cp -f "$path" "$dest/$(basename "$path")" 2>/dev/null
exit 0
