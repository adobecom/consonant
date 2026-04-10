# Engineering MCP Demo — S2A Token Audit
**File:** `router-marquee.css` (C2 homepage redesign, Milo `site-redesign-foundation`)
**Focus:** Token auditing only
**Runtime:** ~4 minutes

---

## The pitch (30 seconds — before you touch the keyboard)

> "We're in the middle of the redesign. Engineers are writing new CSS, and the design system has a token system — but there's no automated way to know if the CSS actually follows it. Manually reviewing a 470-line file takes forever and doesn't scale. So I built an MCP tool that knows the full S2A token set and can audit any CSS file on demand. Let me show you what it finds."

Open `context/milo/libs/c2/blocks/router-marquee/router-marquee.css` on the left. Leave Claude on the right.

---

## Beat 1 — Run the audit (60 seconds)

Type in Claude:

```
run a token audit against context/milo/libs/c2/blocks/router-marquee/router-marquee.css
```

While it runs:
> "This is calling our s2a-ds MCP server — it has the full compiled token set. It doesn't lint syntax, it matches actual values against what's in the system."

When results come in, highlight the summary:
> "50 violations. 8 critical, 14 high, 28 medium. Let me show you the three most interesting categories."

---

## Beat 2 — Walk the findings (90 seconds)

### Finding 1 — Hardcoded rgba (critical)
Point at line ~141 in the open file:

```css
background: rgba(0, 0, 0, 0.44);
```

> "Eight places in this file use raw rgba values. The audit flagged them as critical because they can't respond to theme changes — light mode, dark mode, high contrast — none of that works if the value is hardcoded. The tool found close token matches for most of them. `rgba(0,0,0,0.44)` is within 4% of `--s2a-color-transparent-black-48`."

### Finding 2 — Primitive tokens used directly (high)
Point at line ~135:

```css
color: var(--s2a-color-gray-25);
```

> "This one's subtle. It IS using a token — but it's a primitive, not a semantic one. `--s2a-color-gray-25` is the raw gray scale value. The semantic alias is `--s2a-color-content-knockout`. If we ever adjust the knockout color system-wide, this line doesn't follow. The audit knows the full alias chain."

### Finding 3 — Hardcoded line-heights (high, easy win)
Point at line ~76:

```css
line-height: 20px;
```

> "This one's a clean fix. `20px` is an exact match for `--s2a-font-line-height-sm`. Same for `18px` → `--s2a-font-line-height-xs`, `40px` → `--s2a-font-line-height-xl`. These are drop-in replacements."

---

## Beat 3 — Create the ticket (60 seconds)

> "So now I have audit findings. Instead of copying these into Jira by hand, I can tell Claude to do it."

Type in Claude:

```
/create-ticket eng "router-marquee: resolve token audit violations — replace hardcoded rgba values and primitive tokens with semantic s2a equivalents (50 violations)"
```

While it creates:
> "It's pulling our Jira project config, finding the right issue type, assigning it to me. This is using the corp-jira MCP."

When it returns the ticket link, show it briefly.

> "Background, scope, acceptance criteria — pre-filled from the audit context. Engineers can pick this up immediately."

---

## Wrap (30 seconds)

> "Three things happened here: the audit ran in about 10 seconds against a 470-line file, the results were categorized by severity with specific suggested fixes, and a Jira ticket was created with context engineers need to actually do the work. The same audit runs against any CSS file — we can gate PRs on it, run it against full blocks, or use it for an engineering review of any file before it ships."

---

## Fallback (if live tools fail)

Paste this pre-run output into the chat to keep the demo moving:

```
Audit: context/milo/libs/c2/blocks/router-marquee/router-marquee.css

50 violations — 8 critical · 14 high · 28 medium

🔴 Critical (hardcoded values — no token binding)
  line ~141  .rm-card            background      rgba(0,0,0,0.44)       → --s2a-color-transparent-black-48 (Δ4%)
  line ~143  .rm-card            box-shadow      rgba(255,255,255,0.11) → --s2a-color-transparent-white-12 (Δ1%)
  line ~220  .offset-filler:hover background     rgba(0,0,0,0.6)        → --s2a-color-transparent-black-64 (Δ4%)
  line ~282  .rm-arrow-next      background      rgba(0,0,0,0.30)       → --s2a-color-transparent-black-32 (Δ2%)

🟠 High (primitive tokens — missing semantic alias)
  line ~135  .rm-card            color           --s2a-color-gray-25    → --s2a-color-content-knockout
  line ~155  .rm-card.is-active  color           --s2a-color-gray-1000  → --s2a-color-content-default
  line ~190  .rm-card-progress   background      --s2a-color-brand-adobe-red → --s2a-color-background-brand
  line ~76   .rm-eyebrow         line-height     20px                   → --s2a-font-line-height-sm (exact)
  line ~175  .rm-card-label      line-height     18px                   → --s2a-font-line-height-xs (exact)
  line ~350  .rm-title (mobile)  line-height     40px                   → --s2a-font-line-height-xl (exact)

🟠 Medium (primitive spacing tokens)
  --s2a-spacing-24  → --s2a-spacing-lg   (multiple locations)
  --s2a-spacing-48  → --s2a-spacing-3xl  (lines ~279–280)
  --s2a-spacing-4   → --s2a-spacing-2xs  (line ~299)
  --s2a-border-radius-8  → --s2a-border-radius-sm  (line ~136)
  --s2a-border-radius-4  → --s2a-border-radius-xs  (line ~184)
```

Then continue with the ticket creation beat normally.

---

## Key talking points (have these ready)

- **Why semantic over primitive?** Semantics carry intent — `--s2a-color-content-knockout` tells you _when_ to use it. Primitives just describe the value. When the design changes, semantic updates propagate; primitives don't.
- **Why MCP vs a linter?** ESLint/Stylelint rules are brittle — you'd need to enumerate every primitive token manually. This tool has the token knowledge graph and can suggest substitutions, not just flag violations.
- **What about false positives?** The audit uses a confidence-match approach. `rgba(0,0,0,0.44)` is flagged as a suggestion, not a hard fail — it notes the delta (4%) so engineers can decide.
- **Can this run in CI?** Yes — the MCP server runs locally but the same logic can be extracted to a CLI script for GitHub Actions.
