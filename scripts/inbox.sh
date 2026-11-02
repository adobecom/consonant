#!/bin/bash
# Save a rough note into inbox/ from arguments, a pipe, or the clipboard.
set -eu
root="$(cd "$(dirname "$0")/.." && pwd)"; dir="$root/inbox"; mkdir -p "$dir"
if [ $# -gt 0 ]; then text="$*"; source="typed"
elif [ ! -t 0 ]; then text="$(cat)"; source="piped"
elif command -v pbpaste >/dev/null 2>&1; then text="$(pbpaste)"; source="clipboard"
else echo "Nothing to save: pass text, pipe it, or copy it first." >&2; exit 1; fi
[ -n "$(printf '%s' "$text" | tr -d '[:space:]')" ] || { echo "Nothing to save: empty." >&2; exit 1; }
stamp="$(date +%Y-%m-%d-%H%M)"
slug="$(printf '%s' "$text" | head -c 40 | tr -cs 'A-Za-z0-9' '-' | sed 's/^-//; s/-$//' | tr 'A-Z' 'a-z')"
file="$dir/$stamp-${slug:-note}.md"
{ printf -- '---\nadded: %s\nsource: %s\n---\n\n' "$(date '+%b %-d, %Y %H:%M')" "$source"; printf '%s\n' "$text"; } > "$file"
echo "Saved to ${file#$root/}"
