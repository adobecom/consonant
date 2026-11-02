#!/bin/bash
# Stop hook. When there is work newer than context/HANDOFF.md, asks the agent
# once to save the handoff before it stops. Fires at most once every 45
# minutes per session, and never while the agent is already responding to a
# stop hook. AREAS are the top-level folders that count as work in this repo.
set -u
AREAS="${HANDOFF_AREAS:-apps packages docs scripts evals context playbooks}"
input=$(cat)
[ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0
session=$(printf '%s' "$input" | jq -r '.session_id // "none"')

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 0
HANDOFF=context/HANDOFF.md
[ -f "$HANDOFF" ] || exit 0

marker="${TMPDIR:-/tmp}/handoff-nudge-$(basename "$PWD")-$session"
if [ -f "$marker" ] && [ -z "$(find "$marker" -mmin +45 2>/dev/null)" ]; then exit 0; fi

newer=""
for p in $( { git diff --name-only HEAD; git ls-files --others --exclude-standard; } 2>/dev/null | sort -u); do
  top=${p%%/*}
  case " $AREAS " in *" $top "*) ;; *) continue ;; esac
  [ "$p" = "$HANDOFF" ] && continue
  [ -f "$p" ] && [ "$p" -nt "$HANDOFF" ] && newer="$newer $top"
done
if stat -f %m "$HANDOFF" >/dev/null 2>&1; then mtime=$(stat -f %m "$HANDOFF"); else mtime=$(stat -c %Y "$HANDOFF"); fi
commits=$(git log --oneline --since="@$mtime" 2>/dev/null | wc -l | tr -d ' ')
[ -z "$newer" ] && [ "$commits" = "0" ] && exit 0

touch "$marker"
areas_list=$(printf '%s\n' $newer | sort -u | tr '\n' ' ')
reason="Before stopping: this session has work newer than context/HANDOFF.md"
[ -n "$newer" ] && reason="$reason (uncommitted in: ${areas_list% })"
[ "$commits" != "0" ] && reason="$reason ($commits commits since the last handoff)"
reason="$reason. Run the handoff save procedure in .claude/skills/handoff/SKILL.md: update the STATUS file of each area touched, replace context/HANDOFF.md, then stop. If the work is trivial and no STATUS file needs a change, say so in one line and stop."

jq -cn --arg r "$reason" '{decision:"block",reason:$r}'
