# Inbox

Rough drops: a voice-memo transcript, a pasted Slack thread, one sentence
typed in a hurry. One file per drop. Everything here except this README is
gitignored.

Add one:

```
scripts/inbox.sh "the thing"        typed
pbpaste | scripts/inbox.sh          piped
scripts/inbox.sh                    from the clipboard
```

File them: `/sort` in Claude Code (or read `.claude/skills/sort/SKILL.md` in
Codex or Cursor). Each file is written where it belongs and the original moves
to `_filed/` with a line saying where it went.
