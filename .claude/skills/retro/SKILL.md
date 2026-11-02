---
name: retro
description: Weekly look-back over the Claude Code, Codex and ChatGPT sessions. Runs scripts/session-digest.py (or reads the latest digest in context/digests/), reports what worked, what kept going wrong, and which corrections repeat, and proposes one or two concrete changes to AGENTS.md, a skill or a hook for approval. Arg: --days N (default 7), --chatgpt <export path>.
---

# retro — turn a week of sessions into one or two rules

## 1. Get the digest

Run `python3 scripts/session-digest.py --days <N>`. Read the **Coverage**
section first and say plainly what the digest could not see. Do not draw
conclusions about tool use or errors for sessions it only saw prompts for.

If the script is missing, say so and stop: it has to be copied from the
source repo (see `playbooks/agent-workflow/README.md`, section 9).

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

Read `AGENTS.md`, `CLAUDE.md`, the relevant STATUS file, and the agent memory
index first. If the rule is already there, the finding is "written and not
followed", which calls for a hook or a sharper sentence, not another rule.

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
