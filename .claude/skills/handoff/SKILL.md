---
name: handoff
description: Save or load the repo-wide session handoff. "save" writes what this session did into the STATUS file of each area it touched and replaces context/HANDOFF.md; "load" reads them back and says where things stand. Use at the end of every session, before switching machines, or after a git pull. Arg: save | load (default: save if there is work newer than the last handoff, else load).
---

# handoff — where the last session stopped

Chat threads and tool memory stay on one machine and die with it. Git is the
only record that travels. This skill keeps two things current so any agent,
on any machine, can pick up where the last one left off:

1. **The STATUS file of each area touched.** What changed, what is open,
   what was decided and why. The areas and their files are listed in
   `AGENTS.md` under "Where things stand".
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
- Which servers or builds are running, if any (`lsof -i :6006 -sTCP:LISTEN`,
  `:6007`).
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
  `playbooks/agent-workflow/README.md` (section 3) and add it to the table in
  `AGENTS.md`.

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
