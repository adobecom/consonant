# Agent workflow playbook

How to set up a repo so that Claude Code, Codex, Cursor or any other coding
agent can pick up where the last one stopped, on any machine, with the same
rules, and so the sessions themselves leave a record you can learn from.

This file is the whole kit. It holds the idea, the layout, every template and
every script. Nothing in it is specific to the repo it came from. To use it in
a new repo, copy this file in and tell the agent:

> Read `playbooks/agent-workflow/README.md` and set it up in this repo.
> Ask me before anything in the "Matt does by hand" list.

Then follow the checklist at the end.

## The idea

Chat threads, an agent's memory folder and a tool's session history all live
on one machine and die with it. Git is the only record that travels. So every
piece of state an agent needs is a file in the repo, every tool reads the same
files, and the end of every session writes them back. Switching from Claude
to Codex, or from a laptop to a new machine, costs nothing because nothing
lived in the tool.

Three files carry it:

1. **`AGENTS.md`** at the root. Orientation for every agent: what the repo
   is, the layout, the conventions, the rules, and where the status files are.
   Claude, Codex and Cursor all read it.
2. **A `STATUS.md` in each area.** What it is, how to run it, what is in
   progress, open threads, decisions with reasons. The long-term memory of
   that area. Git says what changed; the status file says why and what's next.
3. **`context/HANDOFF.md`.** One short note: where the last session stopped
   and what to pick up. Replaced every session, never appended. The STATUS
   files hold the detail; this file points at them.

Around them, a small amount of automation keeps them honest:

| Piece | What it does | Where |
|-------|--------------|-------|
| `/handoff` skill | Save (update STATUS files, replace HANDOFF) or load (read them back) | `.claude/skills/handoff/SKILL.md` |
| SessionStart hook | Tells the agent when the last handoff was and what changed since | `scripts/hooks/session-start.sh` |
| Stop hook | Nudges once to save a handoff when there is work newer than it | `scripts/hooks/stop-handoff-nudge.sh` |
| UserPromptSubmit hook | Logs each prompt you type to a local file outside the repo | `scripts/hooks/log-prompt.sh` |
| SessionEnd hook | Copies the session transcript to a local folder outside the repo | `scripts/hooks/archive-transcript.sh` |
| Codex mirror | The same four hooks for Codex | `.codex/hooks.json` |
| Inbox and `/sort` | Rough drops land in `inbox/`; the skill files each one where it belongs | `inbox/`, `scripts/inbox.sh`, `.claude/skills/sort/SKILL.md` |
| Digest and `/retro` | A weekly look at the sessions: what you kept correcting, what to write down | `scripts/session-digest.py`, `.claude/skills/retro/SKILL.md` |
| Local-only notes | A gitignored folder for people, meetings, access; every tool sees it, nothing leaves the machine | `<area>/notes/` |
| Dotfiles | What a new machine needs: Brewfile, shell, git identities, tool settings, one install script | `dotfiles/` |

Everything below is in setup order.

## 1. Layout

```
AGENTS.md                      orientation for every agent
CLAUDE.md                      one line: @AGENTS.md  (Claude Code reads this name)
context/
  HANDOFF.md                   where the last session stopped
  digests/                     session digests (gitignored)
  retros.md                    short dated record of each retro
<area>/STATUS.md               one per app, package, project, client
<area>/notes/                  local-only notes (gitignored)
inbox/                         rough drops (gitignored except README.md)
  README.md
scripts/
  inbox.sh
  session-digest.py
  hooks/
    session-start.sh
    stop-handoff-nudge.sh
    log-prompt.sh
    archive-transcript.sh
    install-claude-hooks.sh
.claude/
  settings.json                hooks for Claude Code (project level, committed)
  skills/
    handoff/SKILL.md
    sort/SKILL.md
    retro/SKILL.md
.codex/
  hooks.json                   the same hooks for Codex
.agents/skills/<name> -> ../../.claude/skills/<name>   (Codex finds skills here)
dotfiles/                      optional; see section 10
```

`.gitignore` additions:

```
# rough drops stay local; /sort writes the filed version elsewhere
/inbox/*
!/inbox/README.md

# session digests quote prompts; local only
/context/digests/

# notes about people, meetings and access stay on this machine
/*/notes/
/*/*/notes/
```

## 2. AGENTS.md

The one file every agent reads first. Keep it short enough to read in a
minute. Sections that have earned their place:

```markdown
# AGENTS.md

Repo orientation for Claude Code, Codex, Cursor, and any other LLM coding agent.

## What this is

One or two sentences.

## Layout

A tree with one line per top-level folder.

## Conventions

- **Branches:** which is long-running, which ships, how they merge.
- **Commits:** scoped prefix when the scope is obvious (`tokens: add spacing
  scale`), plain prose otherwise. No emojis unless asked.
- **Co-authored-by:** include the trailer when an agent materially
  contributed.
- **Never commit, push or deploy unless asked.**

## Where things stand

Each active area keeps a `STATUS.md`: what it is, how to run and deploy it,
what's in progress, open threads, and decisions with the reason for each.
Read the area's file before starting work there. At the end of a session,
update it. Git stays the record of what changed in code; the status file says
why and what's next.

| Area | Status file | Other notes |
|------|-------------|-------------|
| ...  | `.../STATUS.md` | |

## Starting and ending a session

Every session, whichever tool runs it:

- **Start:** read `context/HANDOFF.md`, then the STATUS file of the area you
  will work in.
- **End:** follow the save procedure in `.claude/skills/handoff/SKILL.md`.
  Update the STATUS file of each area you touched, then replace
  `context/HANDOFF.md`. In Claude Code this is `/handoff save`; a Stop hook
  will remind you once if there is work newer than the last handoff. In
  Codex and Cursor, read the skill file and do the same steps.

## Working rules

- **Stay in the area you're working on.** Mention a problem elsewhere in a
  sentence; don't fix it unless asked.
- **Write plainly.** Short sentences the owner can read out loud. No jargon
  they would have to define.
- **Prototype in the real code**, not in a throwaway document.
- **Never print secrets.** Name the variable and where it lives, never its
  value.
```

`CLAUDE.md` is one line, `@AGENTS.md`, so Claude Code loads the same file.
Cursor reads `AGENTS.md` directly. Codex reads `AGENTS.md` directly.

## 3. STATUS.md

One per area. Keep the shape; refresh, don't rewrite.

```markdown
# <Area>: status

## What it is

Two sentences. What it does, who it is for.

## Run and deploy

The commands. Where the env vars live (name, not value).

## Now

What is being worked on, and what is due next.

## Open threads

Things noticed but not done. Remove them when they close.

## Decisions

Each with the date and the reason. Never silently drop an old one.

- 2026-11-01: <decision>. <Why.>
```

Rule for the agent: at the end of a session, add what changed, add or remove
open threads, add decisions with reasons. Make "Now" true.

## 4. context/HANDOFF.md

Replaced every session. The intro stays; everything under it is rewritten.

```markdown
# Handoff

Where the last session stopped and what to pick up. Read this first, then the
STATUS file of the area you will work in. Replace this file at the end of
every session; the STATUS files hold the detail, this points at them.

Agents writing here at the same time: read the file again just before you
write, keep the other session's entries, and add your own.

## Last session

- **Date:** <Month D, YYYY>.
- **Tool:** Claude Code | Codex | Cursor.
- **Branch:** <branch>. <committed / N files uncommitted>. <pushed / not pushed>.
- **Servers:** none running | <what, which port>.

### Touched

- **<Area>** — one sentence on what changed. Details: `<path>/STATUS.md`.

## Pick up here

1. <the single most likely next step, with the command or file>
2. ...

## Watch

- <a risk, a thing half done, something outside the repo that needs backing up>
```

The merge rule in the intro matters when two agents run side by side on the
same repo. It has held up with three at once.

## 5. The handoff skill

`.claude/skills/handoff/SKILL.md`. Codex and Cursor read the same file by
path when `AGENTS.md` tells them to.

```markdown
---
name: handoff
description: Save or load the repo-wide session handoff. "save" writes what this session did into the STATUS file of each area it touched and replaces context/HANDOFF.md; "load" reads them back and says where things stand. Use at the end of every session, before switching machines, or after a git pull. Arg: save | load (default: save if there is work newer than the last handoff, else load).
---

# handoff — where the last session stopped

Chat threads and tool memory stay on one machine and die with it. Git is the
only record that travels. This skill keeps two things current so any agent,
on any machine, can pick up where the last one left off:

1. **The STATUS file of each area touched.** What changed, what is open,
   what was decided and why.
2. **`context/HANDOFF.md`.** One short note: where the last session stopped
   and what to pick up. Replaced every session, never appended.

## Which mode

- `save`: before the session ends, before pushing, before switching machines.
- `load`: at the start of a session, or after `git pull` on another machine.
- No argument: if `git status` or `git log` shows work newer than
  `context/HANDOFF.md`, do `save`. Otherwise do `load`.

## SAVE

### 1. Find out what happened

- `git log --oneline -15` and `git status --short`.
- Which areas this session touched. Work it out from the files changed and
  the conversation, not from guesses.
- Which servers or builds are running, if any.
- The conversation itself: decisions the owner made, things they said no to,
  what is mid-flight, the exact next step.

### 2. Update each touched area's STATUS file, in place

Keep the file's existing shape. Refresh, do not rewrite:

- **What changed.** Plain sentences. Say what the agent did and what the
  owner decided.
- **Open threads.** Add new ones. Remove ones that closed.
- **Decisions.** Add each with the date and the reason. Never silently drop
  an old one.
- If the area has a "Now" or "Next" section, make it true.
- An area with no STATUS file: create one from the template in
  `playbooks/agent-workflow/README.md`.

### 3. Replace `context/HANDOFF.md`

Keep it short. Use the shape in that file. Read the file again just before
writing: another session may have written to it. Keep their entries.

### 4. Say so

Tell the owner the handoff is saved and list the files written. Remind them
to commit and push, since the note only helps another machine once it is on
the remote. **Never commit yourself.**

## LOAD

1. Read `context/HANDOFF.md` fully.
2. Read the STATUS file of each area it names under Touched, and the one for
   whatever the owner asked about.
3. Check it against reality: `git log -5`, `git status --short`. If the
   handoff and git disagree, say so and trust git.
4. Report in a few lines: where we are, the decisions that matter, the next
   step, anything to watch. End with "ready to continue with X?"

## Rules

- **Never invent state.** If you cannot see it in git, the files or the
  conversation, do not write it.
- **Update in place.** Preserve decisions and open threads; refresh them.
- **Plain sentences.** The owner reads these out loud.
- **Never commit, push or deploy.** The owner does that.
- **Keep secrets out.** Name the variable and where it lives, never its
  value.
```

## 6. Hooks

Four small scripts in `scripts/hooks/`, wired into both tools. All of them
`cd` to the git root first, so they work when a session starts in a
subfolder. All need `jq`.

Where the local logs go: `~/.agent-sessions/<repo name>/`. Outside the repo,
never committed, one folder per repo.

### session-start.sh

```bash
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
```

### stop-handoff-nudge.sh

```bash
#!/bin/bash
# Stop hook. When there is work newer than context/HANDOFF.md, asks the agent
# once to save the handoff before it stops. Fires at most once every 45
# minutes per session, and never while the agent is already responding to a
# stop hook. Edit AREAS to the top-level folders that count as work.
set -u
AREAS="${HANDOFF_AREAS:-src apps packages docs scripts}"
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
```

### log-prompt.sh

```bash
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
```

### archive-transcript.sh

```bash
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
```

### Claude Code: `.claude/settings.json`

Project level, committed, so every clone gets the hooks. `$CLAUDE_PROJECT_DIR`
makes them work from a subfolder.

```json
{
  "hooks": {
    "SessionStart": [{ "hooks": [{ "type": "command",
      "command": "bash \"$CLAUDE_PROJECT_DIR/scripts/hooks/session-start.sh\"",
      "timeout": 10, "statusMessage": "Last handoff and work since" }] }],
    "Stop": [{ "hooks": [{ "type": "command",
      "command": "bash \"$CLAUDE_PROJECT_DIR/scripts/hooks/stop-handoff-nudge.sh\"",
      "timeout": 10, "statusMessage": "Handoff check" }] }],
    "UserPromptSubmit": [{ "hooks": [{ "type": "command",
      "command": "bash \"$CLAUDE_PROJECT_DIR/scripts/hooks/log-prompt.sh\"",
      "timeout": 5, "statusMessage": "Prompt log" }] }],
    "SessionEnd": [{ "hooks": [{ "type": "command",
      "command": "bash \"$CLAUDE_PROJECT_DIR/scripts/hooks/archive-transcript.sh\"",
      "timeout": 15, "statusMessage": "Archive transcript" }] }]
  }
}
```

**Claude cannot add these itself.** Under auto mode, an agent editing its own
hook config is blocked as self-modification. So the agent writes the scripts
and this helper, and the owner runs the helper once:

```bash
#!/bin/bash
# scripts/hooks/install-claude-hooks.sh — adds the four hooks to the
# project's .claude/settings.json. The owner runs this, not the agent. Safe
# to run again: it only adds what is missing and backs up the file first.
set -eu
root="$(cd "$(dirname "$0")/../.." && pwd)"; f="$root/.claude/settings.json"
command -v jq >/dev/null || { echo "jq is needed"; exit 1; }
[ -f "$f" ] || echo '{}' > "$f"
cp "$f" "$f.bak.$(date +%Y%m%d%H%M%S)"
h() { jq -n --arg c "bash \"\$CLAUDE_PROJECT_DIR/scripts/hooks/$1\"" --arg s "$2" --argjson t "$3" \
      '[{hooks:[{type:"command",command:$c,timeout:$t,statusMessage:$s}]}]'; }
jq --argjson a "$(h session-start.sh 'Last handoff and work since' 10)" \
   --argjson b "$(h stop-handoff-nudge.sh 'Handoff check' 10)" \
   --argjson c "$(h log-prompt.sh 'Prompt log' 5)" \
   --argjson d "$(h archive-transcript.sh 'Archive transcript' 15)" \
   '.hooks.SessionStart //= $a | .hooks.Stop //= $b | .hooks.UserPromptSubmit //= $c | .hooks.SessionEnd //= $d' \
   "$f" > "$f.tmp" && mv "$f.tmp" "$f"
echo "Hooks now in $f:"; jq -r '.hooks | keys[]' "$f" | sed 's/^/  /'
echo "Restart Claude Code for them to take effect."
```

### Codex: `.codex/hooks.json`

Same shape, same scripts. Differences that bit us:

- Codex reads this file **only when a session starts**. A session already
  running will show 0 hooks until restarted.
- Project hooks load only when the folder is trusted, and each hook must be
  trusted once: run `/hooks` in Codex from the repo root and accept them.
- **SessionEnd hooks are capped at 3 seconds.** A larger timeout makes the
  file invalid.
- Stop hooks must print JSON on exit 0. The script above does.
- Codex calls its shell tool `Bash` and its patch tool `Edit`/`Write` for
  matcher purposes, so Claude-style matchers carry over.

```json
{
  "description": "Mirror of the Claude Code hooks in .claude/settings.json. Trust once via /hooks after reviewing the scripts in scripts/hooks/.",
  "hooks": {
    "SessionStart": [{ "hooks": [{ "type": "command",
      "command": "bash scripts/hooks/session-start.sh", "timeout": 10, "statusMessage": "Last handoff and work since" }] }],
    "Stop": [{ "hooks": [{ "type": "command",
      "command": "bash scripts/hooks/stop-handoff-nudge.sh", "timeout": 10, "statusMessage": "Handoff check" }] }],
    "UserPromptSubmit": [{ "hooks": [{ "type": "command",
      "command": "PROMPT_LOG_TOOL=Codex bash scripts/hooks/log-prompt.sh", "timeout": 5, "statusMessage": "Prompt log" }] }],
    "SessionEnd": [{ "hooks": [{ "type": "command",
      "command": "bash scripts/hooks/archive-transcript.sh", "timeout": 3, "statusMessage": "Archive transcript" }] }]
  }
}
```

### Cursor

Cursor has no equivalent hooks. It reads `AGENTS.md`, which tells it to read
the handoff skill and do the steps by hand. That is enough.

### Make Claude Code keep its transcripts

Two settings in the global `~/.claude/settings.json` (not the project one):

```json
{
  "cleanupPeriodDays": 365,
  "env": { "CLAUDE_CODE_FORCE_SESSION_PERSISTENCE": "1" }
}
```

The first keeps sessions a year instead of thirty days. The second matters
more: sessions launched as nested sessions (the environment variable
`CLAUDE_CODE_CHILD_SESSION=1`, which some launchers set) write **no
transcript at all** without it. We found seven of eight sessions in a week
had none. Check after setting it: a new `.jsonl` should appear under
`~/.claude/projects/<encoded repo path>/`.

## 7. Skills shared across tools

Skills live once, in `.claude/skills/<name>/SKILL.md`. Codex looks in
`.agents/skills/`, so symlink each one:

```bash
mkdir -p .agents/skills
for s in .claude/skills/*/; do n=$(basename "$s"); ln -sfn "../../.claude/skills/$n" ".agents/skills/$n"; done
```

Each SKILL.md starts with frontmatter (`name`, `description`). The
description is what the tool shows and matches on, so it should say when to
use the skill and what argument it takes. Cursor has no skills folder; the
skill file is still readable by path, and `AGENTS.md` can point at it.

If a sub-area has its own skills (a sub-project with its own `.claude/`),
symlink those into the root folders too, with a line in each saying its paths
are relative to that sub-area. Otherwise they only work when the session
starts inside the sub-area.

## 8. Inbox and /sort

`inbox/` catches rough thinking: a voice memo transcript, a pasted chat, one
sentence typed in a hurry. One file per drop. Everything in it except the
README is gitignored. `/sort` reads each file, decides where it belongs,
writes it there in that place's own shape, and moves the original to
`inbox/_filed/` with a line at the top saying where it went. When two places
fit, it asks and leaves the file.

`scripts/inbox.sh` writes a timestamped file from arguments, a pipe, or the
clipboard:

```bash
#!/bin/bash
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
```

The sort skill is mostly a table of "what it is" to "where it goes" for the
repo. Write that table for the new repo; the procedure around it is:

```markdown
---
name: sort
description: Empty the inbox. Reads each file in inbox/, decides where it belongs in the repo, writes it there in that place's own shape, and moves the original to inbox/_filed/ with a note saying where it went. Asks when a file could go two places. Arg: a single file, or nothing for all of them.
---

# sort — file what is in the inbox

For each file in `inbox/` (skip `README.md` and `_filed/`):

1. **Read it whole.** Find what the owner actually means. One file may hold
   more than one thing; file each piece separately.
2. **Decide where it goes** from the table below. Not sure, or two places
   fit: ask, and leave the file.
3. **Write it there** in the destination's shape and voice. Keep the owner's
   wording where it is the point. Date it. Do not invent detail.
4. **Move the original** to `inbox/_filed/<name>` with
   `> Filed <date> to <path>.` as the first line.
5. **Report** one line per file: what it was, where it went.

| What it is | Where | In what shape |
|------------|-------|---------------|
| A to-do or bug for an area | `<area>/STATUS.md` | A line under Open threads |
| A decision | `<area>/STATUS.md` | Under Decisions, with the reason |
| A new idea | `ideas/<slug>.md` | ... |
| ... | | |

Rules: ask rather than guess; never commit; never delete an inbox file;
never print a secret that might be in a paste.
```

The session-start hook reports how many files are waiting.

## 9. Digest and /retro

The point is to catch the things you keep having to say and write them down
once. A script reads the last N days of sessions from every tool into one
digest; the retro skill reads the digest like an editor and proposes one or
two rule changes, with exact wording, for approval.

`scripts/session-digest.py` reads, when present:

```
~/.claude/projects/*/*.jsonl                       Claude Code transcripts
~/.claude/history.jsonl                            Claude Code prompt history
~/.agent-sessions/<repo>/prompt-log.jsonl          prompts from the hook
~/.agent-sessions/<repo>/transcripts/*.jsonl       archived transcripts
~/.codex/sessions/**/*.jsonl                       Codex transcripts
~/.codex/history.jsonl                             Codex prompt history
a ChatGPT export (conversations.json or zip)       --chatgpt <path>
```

and writes `context/digests/<date>.md` (gitignored) with: a **Coverage**
section first, saying which sessions it could and could not see; per-session
summaries (tool, duration, prompts, tools used, errors, files touched by
area); a list of prompts that look like corrections ("no,", "don't", "I
said", "again"); recurring errors; and where the time went. The script is
about 400 lines and lives in the source repo at `scripts/session-digest.py`
(github.com/mmhuntsberry/phantom). Copy it and change two things: the
prompt-log and transcript paths to `~/.agent-sessions/<repo>/`, and the
`AREAS` tuple to the new repo's top-level folders. For a work repo, add a
filter so it only reads sessions whose `cwd` is under that repo.

The retro skill, in full:

```markdown
---
name: retro
description: Weekly look-back over the Claude Code, Codex and ChatGPT sessions. Runs scripts/session-digest.py (or reads the latest digest in context/digests/), reports what worked, what kept going wrong, and which corrections repeat, and proposes one or two concrete changes to AGENTS.md, a skill or a hook for approval. Arg: --days N (default 7), --chatgpt <export path>.
---

# retro — turn a week of sessions into one or two rules

## 1. Get the digest

Run `python3 scripts/session-digest.py --days <N>`. Read the **Coverage**
section first and say plainly what the digest could not see. Do not draw
conclusions about tool use or errors for sessions it only saw prompts for.

## 2. Read it like an editor, not a script

- **Things the owner said more than once**, in any wording. Each is a rule
  not written down, or written down and not followed.
- **Things an agent did that the owner undid or redirected.**
- **Dead ends:** several prompts on the same problem, then a change of
  approach. What would have shortened that?
- **Setup time:** prompts about getting a tool working rather than working.
- **Errors that repeated.**
- **What went well** and should be kept.

## 3. Check what is already written

Read `AGENTS.md` and the relevant STATUS file first. If the rule is already
there, the finding is "written and not followed", which calls for a hook or
a sharper sentence, not another rule.

## 4. Propose, do not apply

    ## What the week looked like
    ## What worked
    ## What kept going wrong   (each with date, tool, the words)
    ## Proposed changes        (one or two; three at most)
    1. <what to add or change> in <AGENTS.md | skill | hook>
       Why: <the repeated thing it prevents>
       Wording: "<the exact line>"
    ## Not seen

Wait for a yes on each. Then apply exactly the approved wording.

## 5. Keep a short record

Append a dated entry to `context/retros.md`: what was found, what changed.
No prompt quotes there; that file is tracked.

Rules: the digest stays out of git; never commit; a repeated correction
beats a one-off; keep the owner's wording where it is the rule.
```

Give it two or three weeks of sessions before the first run. One week is
weather; three is climate.

## 10. Memory, local notes and dotfiles

**Tool memory.** Claude Code keeps a per-project memory folder on the
machine. Use it for pointers and preferences, never for state that should
travel. Anything another tool or another machine needs goes in the repo. A
good test: if the laptop died, what would be lost? That list should be empty
or trivial.

**Local-only notes.** Some things belong near the work but must never reach
a remote: who said what in a meeting, which account reaches which system,
blockers with names in them. Put them in a `notes/` folder inside the area,
gitignored, and say so in the area's README. Every tool sees them, the
handoff can point at them, and they back up with the machine. This replaced
keeping them in one tool's memory, which only that tool could read.

**Dotfiles.** A `dotfiles/` folder with a `Brewfile` (only what you chose,
not dependencies), the shell files, the git config with one identity per
folder, SSH host config, the global settings for each agent tool, and an
`install.sh` that copies each with a timestamped backup and ends with the
by-hand list: SSH keys, logins, what to restore from backup. No secrets ever;
the script names them and where they live. Keep it in the personal repo, not
the work one.

## 11. Conventions that make all of this work

- **The owner commits, pushes and deploys.** Agents never do unless asked in
  that session. The handoff reminds the owner to push; it does not push.
- **Scoped commit prefixes.** `area: what changed`. Plain prose when the
  scope is not obvious. No emojis. Co-author trailer when an agent
  materially contributed.
- **Plain writing everywhere agents write for people.** Status files,
  handoffs, commit bodies: short sentences, no jargon. The owner reads them
  out loud.
- **Stay in the area.** An agent that notices a problem elsewhere says so in
  a sentence and names the files. Agreeing with a diagnosis is not agreeing
  to a fix.
- **Never invent state.** If it is not in git, the files or the
  conversation, it is not written down.
- **Never print secrets.** Name the variable and where it lives.
- **Decisions carry reasons and dates.** A decision without a reason gets
  relitigated by the next agent.

## 12. Setup checklist for a new repo

What the agent does:

1. Create `AGENTS.md` from section 2, filled in for this repo, and
   `CLAUDE.md` containing `@AGENTS.md`.
2. Create a `STATUS.md` in each active area from section 3.
3. Create `context/HANDOFF.md` from section 4 with a first "Last session"
   that says the workflow was set up.
4. Add the `.gitignore` lines from section 1.
5. Write the four hook scripts and the install helper into `scripts/hooks/`,
   `chmod +x` them, and check `bash -n` on each.
6. Write `.codex/hooks.json` from section 6.
7. Write the three skills into `.claude/skills/` and symlink them into
   `.agents/skills/`.
8. Create `inbox/README.md` and `scripts/inbox.sh`.
9. Copy and adapt `scripts/session-digest.py`.
10. Add this playbook to the repo's playbooks folder, or keep the copy
    wherever the repo keeps methods.

What the owner does by hand:

1. `bash scripts/hooks/install-claude-hooks.sh`, then restart Claude Code.
2. In the global `~/.claude/settings.json`: `cleanupPeriodDays` and the
   persistence env var from section 6.
3. Start a fresh Codex session from the repo root, run `/hooks`, trust the
   four entries.
4. Confirm: type a prompt, then check `~/.agent-sessions/<repo>/prompt-log.jsonl`
   has a line, and `~/.claude/projects/<encoded path>/` has a new `.jsonl`.
5. Commit and push.

## 13. Using this in a company repo

A few things change when the repo is not yours alone.

- **Check the policy on transcripts first.** The prompt log and archived
  transcripts hold the words of every session, which can include code and
  names. They live outside the repo in `~/.agent-sessions/`, on the machine
  only. If that is not allowed, drop the UserPromptSubmit and SessionEnd
  hooks and the digest; the handoff and status layer works without them.
- **Keep the digest and retro personal.** `context/digests/` is gitignored
  and must stay so. `context/retros.md` is tracked and quotes nothing.
- **One handoff file assumes one person per branch.** On a shared branch,
  make it `context/handoffs/<name>.md` and have the session-start hook read
  the one matching `git config user.name`, or keep the single file and add
  the merge rule to the intro. Both have worked; the single file is simpler
  until it isn't.
- **`AGENTS.md` and `STATUS.md` are team files.** Write them so a colleague
  with no agent at all gets value from reading them. They are documentation
  that happens to be agent-readable.
- **Local-only notes go in the gitignored `notes/` folders**, never in
  tracked files, and never in the personal repo. Client and employer
  material has its own rules; follow them.
- **Dotfiles stay in the personal repo.** The work machine gets a work
  branch of them, or a separate copy, with the work identities only.

## Things we learned the hard way

- Claude Code sessions launched as nested sessions write no transcript
  unless `CLAUDE_CODE_FORCE_SESSION_PERSISTENCE=1` is set. Most of a week's
  sessions were gone before anyone noticed. Check `~/.claude/projects/`
  after the first run.
- Claude cannot add hooks to its own project settings under auto mode. Hand
  the owner a script.
- Codex reads `.codex/hooks.json` at session start only, caps SessionEnd
  at 3 seconds, and needs `/hooks` run once to trust them. The hooks panel
  showing all zeros means one of those three.
- Hook commands in Claude's project settings should use
  `$CLAUDE_PROJECT_DIR`, and every hook script should `cd` to the git root.
  Otherwise they break the first time a session starts in a subfolder.
- Two agents writing `HANDOFF.md` at once will overwrite each other unless
  the file itself says to re-read and merge. With that line, three at once
  has been fine.
- A Stop hook that fires every turn is ignored. Once per 45 minutes, and
  never while the agent is already answering a stop hook, is the setting
  that stuck.
- Skills in a sub-project only load when the session starts there. Symlink
  them to the root, with a note about relative paths.
- Local notes in one tool's memory are invisible to every other tool. A
  gitignored folder in the repo is what every tool can read.
