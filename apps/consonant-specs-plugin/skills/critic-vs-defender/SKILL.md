---
name: critic-vs-defender
description: Use when you have a written plan, spec, or design proposal that needs adversarial pressure-testing to surface flaws, ambiguities, hidden assumptions, and missing details before implementation.
---

# Critic vs. Defender

## Overview

Adversarial debate strengthens plans. A **critic** subagent hunts for flaws, ambiguities, and gaps. A **defender** subagent responds to each one — addressing it, arguing it's unnecessary, removing it from scope, or escalating a premise problem to the human. They iterate until they reach consensus or escalate. The output is a sharper plan with weaknesses surfaced and resolved.

## When to Use

- A written plan, spec, or design proposal is ready for pressure-testing
- You want to find blind spots, hidden assumptions, or unclear details before coding
- The plan is large enough that single-pass review would miss things

**Not for:**
- Quick questions or trivial tasks
- Code review — use `superpowers:requesting-code-review`
- Open-ended exploration — use `superpowers:brainstorming`
- Plans too small to debate

## Before You Start

Ask the user:
1. **Which plan?** (file path, prior message, or pasted content)
2. **Which model for the subagents?** Default `sonnet` unless told otherwise
3. **Max rounds before tiebreaker?** Default 3

State to the user: "Pressure-testing this plan with critic vs. defender. I'll report when they converge or when they need a tiebreaker."

## Workflow

```
Round 1: Critic finds issues → Defender responds (ADDRESS / ARGUE-UNNECESSARY / REMOVE-FROM-SCOPE / ESCALATE-PREMISE)
  └─ If critic returns PLAN-TOO-THIN → stop; ask the user to flesh out the plan before continuing
Round N: Critic marks RESOLVED / ACCEPTED / DISPUTED / HUMAN-DECIDES → Defender responds to DISPUTED only
Stop when no DISPUTED items remain OR max rounds reached
If DISPUTED or HUMAN-DECIDES items remain → ask the user as tiebreaker
Output the strengthened plan
```

The critic and defender run **sequentially** within each round (defender needs critic's output). Do not dispatch them in parallel.

## Round 1 Prompts

**Critic** (general-purpose agent, chosen model):

> You are the CRITIC in a critic vs. defender debate. Find every flaw, ambiguity, or missing detail in this plan. Be specific — quote the part of the plan and explain the problem.
>
> Plan:
> [PASTE FULL PLAN]
>
> Calibration — read before responding:
> - **If the plan is too vague or too short to engage with substantively, stop and return only: "PLAN-TOO-THIN: [one-line reason]."** Do not fabricate issues to fill a list. A plan with no concrete claims has nothing to grip.
> - **Quality over quantity.** If you have 3 substantive concerns, return 3. If you have 12, return 12. Never pad. Never invent issues to satisfy the categories below.
> - **If the plan's premise itself is wrong** (wrong question being answered, fundamentally infeasible approach, etc.), lead with a single PREMISE finding before per-line findings — labeled `PREMISE` instead of a number.
>
> Return a numbered list. For each issue:
> - **Quote:** exact wording from the plan
> - **Concern:** what's wrong, unclear, or missing
> - **Severity:** see anchors below
>
> Severity anchors (use literally — don't inflate):
> - **blocker** — won't ship right without resolving
> - **major** — significant rework or harm risk if shipped as-is
> - **minor** — polish or low-impact ambiguity
>
> Do NOT propose solutions. Cover **as applicable** (only when the plan gives you something to grip — do not invent gaps to hit every category): hidden assumptions, missing edge cases, unspecified behavior, contradictions, ambiguous wording, scope risks, missing dependencies, missing acceptance criteria.

**Defender** (general-purpose agent, same model):

> You are the DEFENDER in a critic vs. defender debate. The CRITIC raised these issues. For each one, choose ONE of four response types:
> - **ADDRESS** — propose a concrete edit to the plan that resolves the concern
> - **ARGUE-UNNECESSARY** — explain why the issue doesn't need to be fixed (out of scope, false premise, already covered, low impact, etc.)
> - **REMOVE-FROM-SCOPE** — the right answer is to cut that feature or element from the plan entirely
> - **ESCALATE-PREMISE** — the issue points at a fundamental problem with the plan's premise that no per-line edit can fix; flag for the human to decide
>
> Calibration — read before responding:
> - **"Don't concede reflexively" means don't fold under pressure — it does NOT mean manufacture pushback against valid concerns.** If the critic is right, say so via ADDRESS or REMOVE-FROM-SCOPE. Honest agreement beats fake disagreement.
> - **ARGUE-UNNECESSARY exists for cases where the critic is actually wrong**, not as a balance requirement. It's fine if you don't use it at all in a given round.
> - **If a majority of issues are ESCALATE-PREMISE**, the plan is unsalvageable by line-edits. Surface that as a single top-line conclusion instead of going line-by-line.
>
> Plan:
> [PASTE FULL PLAN]
>
> Critic's findings:
> [PASTE CRITIC OUTPUT]
>
> For each numbered issue return: response type + detail.

## Round N Prompts (Subsequent Rounds)

**Critic — judge defender's responses:**

> You previously raised issues against this plan. The DEFENDER responded with one of four types: ADDRESS, ARGUE-UNNECESSARY, REMOVE-FROM-SCOPE, or ESCALATE-PREMISE. For each issue, mark exactly one status:
> - **RESOLVED** — defender's ADDRESS or REMOVE-FROM-SCOPE fixes the concern
> - **ACCEPTED** — defender's ARGUE-UNNECESSARY convinced you the issue is not necessary to fix
> - **DISPUTED** — defender's response does not satisfy you; explain specifically why
> - **HUMAN-DECIDES** — defender marked ESCALATE-PREMISE; pass this item to the human, don't argue further
>
> Calibration — read before responding:
> - **ACCEPTED requires an actual reason** ("on reflection, the impact is low enough" or "the defender's framing of the constraint was correct"). Don't ACCEPT just to converge or feel cooperative.
> - **If you're yielding under pressure but still skeptical, mark DISPUTED** with the residual concern. An honest dispute beats a fake consensus.
> - **Multiple rounds is not a signal to converge.** If real concerns remain, that's what escalation to the human is for. The point of this debate is honest disagreement, not agreement-at-all-costs.
>
> Plan:
> [PLAN]
>
> Your previous findings:
> [PREVIOUS CRITIC OUTPUT]
>
> Defender's responses:
> [PREVIOUS DEFENDER OUTPUT]
>
> Return a numbered list with status. For DISPUTED items, include a follow-up explanation.

If no DISPUTED items remain → no more debate rounds. Go to the Tiebreaker step if any HUMAN-DECIDES items exist; otherwise straight to the Final Step.

**Defender — respond to DISPUTED items only:**

> The critic still disputes these issues. For each, choose one of the same four response types as Round 1:
> - **ADDRESS** with a stronger edit
> - **ARGUE-UNNECESSARY** with stronger reasoning
> - **REMOVE-FROM-SCOPE** if cutting is the right move
> - **ESCALATE-PREMISE** if you've hit a genuine impasse — pass it to the human, don't fake agreement
>
> Disputed issues with critic's follow-up:
> [PASTE DISPUTED ITEMS]

## Tiebreaker

If max rounds is reached with DISPUTED items still remaining — or if any issues were marked HUMAN-DECIDES (defender's ESCALATE-PREMISE) — do **not** decide on your own. Present each one to the user with:
- Critic's latest concern
- Defender's latest argument (or "defender flagged this as a premise problem the plan can't resolve by edits" for HUMAN-DECIDES)
- Ask: keep critic's position, keep defender's position, propose a different resolution, or — for premise escalations — rework the plan's foundation before continuing?

## Final Step — Produce the Strengthened Plan

Apply every RESOLVED change (edits and removals) and every user-decided tiebreaker to the plan. Output the revised plan (or a diff against the original if it's a file).

If the original plan is a file, ask the user before overwriting it.

## Quick Reference

| Phase | Agent | Job |
|---|---|---|
| Round 1 | Critic | Find issues (or PLAN-TOO-THIN if too vague to engage); no solutions |
| Round 1 | Defender | ADDRESS / ARGUE-UNNECESSARY / REMOVE-FROM-SCOPE / ESCALATE-PREMISE per issue |
| Round N | Critic | RESOLVED / ACCEPTED / DISPUTED / HUMAN-DECIDES per issue |
| Round N | Defender | Respond to DISPUTED only |
| Final | Orchestrator | Apply fixes; ask user about disputes + premise escalations |

## Common Mistakes

- **Defender collapses to ADDRESS-everything (or fakes pushback).** Both ends are failure modes. Use ARGUE-UNNECESSARY only when the critic is wrong, REMOVE-FROM-SCOPE when cutting is right, ESCALATE-PREMISE when the plan itself is broken. "Don't concede reflexively" is not a quota — honest ADDRESS beats fake disagreement.
- **Padding the critic's list.** If the plan is thin, return PLAN-TOO-THIN. Five real findings beats twenty padded ones. Don't invent issues to satisfy every category in the prompt.
- **Severity inflation.** Not everything is a blocker. Use the anchors literally: blocker = won't ship right; major = costly if shipped as-is; minor = polish.
- **Drifting toward consensus across rounds.** Repeated rounds aren't a hint to converge. If the critic still has real concerns, mark DISPUTED and escalate. Fake consensus is worse than honest disagreement.
- **Critic proposes solutions in Round 1.** Round 1 is for finding problems only. Solutions belong to the defender.
- **Orchestrator decides the tie.** If max rounds hit with disputes, ask the user — don't pick a side yourself.
- **Re-litigating resolved issues.** Drop RESOLVED and ACCEPTED items from the next defender prompt. Only DISPUTED carries forward.
- **Burying the final plan in a transcript.** Output is the strengthened plan, not the debate log. Summarize the debate briefly, but lead with the revised plan.
- **Running critic and defender in parallel.** Defender needs critic's findings to respond. Always sequential.
