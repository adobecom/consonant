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
| A to-do, bug or loose end for an area | that area's `STATUS.md` | A line under Open threads |
| A decision, or a "we're not doing X" | that area's `STATUS.md` | Under Decisions, dated, with the reason |
| A plan, a brief, or thinking about where something is going | `docs/future-notes/<slug>.md` | A short dated note; link it from the area's STATUS if it has one |
| A finding from looking at Forge, Milo or Spectrum | `docs/future-notes/merch-card-from-s2-atoms.md` or `multi-system-contracts.md` | Under the matching section; or a sticky on the Agentic S2A board if the owner asks |
| A draft Jira ticket | `jira-tickets/<key-or-slug>.md` | The ticket template already in that folder. Never create the ticket itself. |
| A Slack answer the owner wants to keep | `docs/audits/<topic>-<date>.md` | What was asked, what we found, what we said |
| Something about a person, a meeting, access, or a name that should not be in git | `<area>/notes/<date>-<slug>.md` (gitignored) | As written |
| A token or component fix request | `packages/tokens/STATUS.md` or `packages/components/STATUS.md` | Open thread, with the component or token named |
| An idea for the pipeline or the Book | `packages/spec-dictionary/STATUS.md` or `apps/contract-book/STATUS.md` | Open thread |

Rules: ask rather than guess; never commit; never delete an inbox file;
never print a secret that might be in a paste; never file a ticket for the
Spectrum team (the owner said no).
