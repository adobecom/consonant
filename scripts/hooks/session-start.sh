#!/bin/bash
# SessionStart hook. Tells the agent when the last handoff was written and
# what work has happened since, so it reads context/HANDOFF.md first and
# knows to save a new one before the session ends.
set -u
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 0
HANDOFF=context/HANDOFF.md
[ -f "$HANDOFF" ] || exit 0

if stat -f %m "$HANDOFF" >/dev/null 2>&1; then mtime=$(stat -f %m "$HANDOFF"); else mtime=$(stat -c %Y "$HANDOFF"); fi
date_line=$(grep -m1 -E '^- [*][*]Date:[*][*]' "$HANDOFF" | sed -E 's/^- [*][*]Date:[*][*] *//; s/\.$//')
commits=$(git log --oneline --since="@$mtime" 2>/dev/null | wc -l | tr -d ' ')
changed=$(git status --porcelain 2>/dev/null | awk '{print $2}' | cut -d/ -f1 | sort -u | tr '\n' ' ')
count=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

msg="Last handoff: ${date_line:-unknown} (context/HANDOFF.md). Since then: $commits commits, $count uncommitted paths"
[ -n "$changed" ] && msg="$msg in: ${changed% }"
msg="$msg. Read context/HANDOFF.md first, then the STATUS file of the area you work in. Before this session ends, run the handoff save procedure in .claude/skills/handoff/SKILL.md."
inbox=$(find inbox -maxdepth 1 -type f ! -name README.md 2>/dev/null | wc -l | tr -d ' ')
[ "${inbox:-0}" != "0" ] && msg="$msg Inbox: $inbox file(s) waiting in inbox/; offer to run the sort procedure in .claude/skills/sort/SKILL.md."

jq -cn --arg m "$msg" '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:$m}}'
