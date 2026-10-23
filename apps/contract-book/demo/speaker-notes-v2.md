# The contract workflow, end to end — speaker notes

For `contract-workflow-collapsible.mp4` (5:03, silent). Timestamps are the chapter
markers the recording wrote (`out/markers-final.json`). Each beat has room for
the lines under it, plus a breath. Everything on screen is real: the stills
are exported from the file, the extraction is a first extraction, every
command in the terminal was run during the recording and its output is what
it printed, and the prompts are the words that steered the work this week.
`out/ledger.html` is the same list of commands and prompts with full output,
for anyone who wants to read it rather than watch it.

The one-line thesis, if you only say one thing: **a description informs; a
contract arbitrates.** Everything in this video is what happens when the
contract — not a person, not a model — is the thing that says whether code
matches design.

---

## 0:00 — primer

This is the one minute before the product. Hold the card as long as you need.

- Design systems and AI are converging on the same object: a machine-readable
  contract per component. Props, anatomy, tokens, behaviour, derived from what
  the design file actually says, not from what someone remembers it saying.
- Figma and code are both measured against it. Neither is the source of
  truth. The contract is, and the evidence behind it is a file you can open.
- Agents work inside that loop: extract, draft, refuse, heal, prove. None of
  it is a black box, because every step leaves a file behind, and this video
  shows every one of those steps, including the terminal.
- The community is landing on this shape too: Southleft's contract
  playground, the design-system contract schemas. Ours emits that schema. We
  are standing on those shoulders rather than inventing a fourth format.

## 0:14 — the old workflow

Four stills, about eight seconds each. Talk over them; nothing to demo.

1. **Walk the redesign.** Every page the redesign team produced, at every
   breakpoint, read by hand to find the like-minded components.
2. **Gather the variants.** None of these were component sets yet. The work
   was spotting that twelve cards across six pages were one card with
   variants, and pulling them together.
3. **Structure with Claude, write a spec by hand.** Once a set had a shape,
   Claude helped decide the axes and the props, and the result was a spec in
   our own homegrown format. It worked. It was also ours alone.
4. **Stories from the spec.** One prompt per component, repeated by hand. The
   stories were right on the day they were made; nothing measured whether
   they stayed right.

The sentence to land: it was agentic, but it was not repeatable, and nothing
in it could say no.

## 0:47 — the terminal

The first thing a person does. One command, the Book is up. From here on,
every time the video cuts to this terminal, that is a command or a prompt I
typed, with the real output.

## 0:53 — the Book, at rest

Library on the left, every contracted component with its gate state. The
middle pane is the defs, the one human-authored file. Everything to the right
is derived from it.

## 0:58 — paste the Figma link, Extract

A component set's link, straight from the canvas. Extract runs over the Figma
REST API, so it needs a token and nothing else: no plugin open, no file open.
What comes back is evidence, and the scaffolder's first draft of the defs.

## 1:26 — the draft

Scroll the defs. Props with their Figma bindings, anatomy read from the layer
tree, tokens where the file binds variables, `raw:` literals where it does
not. The literals are not hidden; they are the token gaps, listed.

## 1:29 — Evidence

Read-only. Observed, never edited here. Axes, variants, bindings, instances,
and now a layer tree per variant, which is what lets the scaffold see that the
control style has a leading button and the open state a different chevron.

## 1:33 — Refusals

The same validator the gate runs. A refusal names the key in the defs and
says what is wrong. Click one, the cursor goes there. The contract is not
derived until these are resolved. That is the "can say no" part.

## 1:37 — Preview

The Lit renderer's own module, evaluated with the real tokens and Adobe
Clean. Toggle open, switch style to control: the ControlButton leads the
label, the chevron is gone, the label jumps to heading-5. That is read from
the file, not written by hand.

## 1:40 — derived surfaces

Six tabs, one source. Change a decision in the defs and all six move. The
contract is the interop format; CSS and Lit are what Storybook runs; Milo is
the block; the Figma plan is what we would push back to the canvas; Spec is
the working format.

## 1:56 — Save

Only Save writes to disk. The evidence goes through the sync server, the defs
lands beside it, and the library updates. Still a draft until it ships.

## 2:02 — the terminal: ship

Back in Claude Code. One slash command, five steps, each shown with its real
output: validate the defs, build the artefacts, run the gate, pack the specs
package, render the Lit component and stories. Then the golden sheet, the one
step that needs the Figma token, and the matrix eval.

Read the matrix output out loud. Six cells scored against the design, then
the play pass: the eval clicks every closed cell and compares what appears
with the design's open artwork. A component that only moved its chevron would
pass the grid and fail this. That is exactly the bug it was written for.

## 2:46 — Parity, in the Book

The same eval, on the unsaved defs, in the browser. Click a cell: design,
built, diff, and the difference codes that say which CSS property to look at.

## 3:00 — Heal

The findings become edits. Each step says what it found, which fixer applied,
and what the score did. Here it binds the chevrons to the icon library,
binds the ControlButton's arrows, and resolves a token the file names
differently from the shipped CSS. Every fix is a decision in the defs with
its evidence, owner "heal", so a person can overturn it.

## 3:35 — the play pass

Three crops per row: the design open, the build closed, the build after the
click. This is the panel to pause on. It is the difference between a
component that looks right and one that works.

## 3:41 — Save

Save again; rebuild and re-render follow off camera, same two commands as
the ship step. The ledger says so.

## 3:45 — the terminal: the tree

Point it at MerchCard instead. The crawl walks every set the card places, to
the leaves, and prints the order it would contract them in: leaves first,
because a parent's contract composes its children's and cannot be finished
before them. `--dry` prints without writing. Without the flag, this is the
recursive run: draft, save, build per set, against the contracts that exist
by then.

The honest part: it works to an extent. The gaps that still need a person are
in the next chapter.

## 4:06 — Storybook

The generated story with the design overlay. The readout says the design is
386 wide and the build fills its container; that is a decision the scaffold
recorded, not a mismatch it missed.

## 4:13 — the matrix, wiped

Every variant on one grid, the design sheet underneath, the wipe across it.

## 4:25 — it opens

The With content story. Click, it opens; click, it closes. Aria-expanded,
inert on the region, grid-row motion, reduced-motion respected. Generated
from the archetype, not hand-written.

## 4:35 — the prompts

Nothing here was a black box. These are the words that steered the work,
verbatim, and each one changed a file: the ask for recursion, the ship, the
icon gap, the correction that produced the play pass, the rule that literals
are flagged in the evals. The ledger has the commands beside them.

## 4:47 — the package

`@adobecom/s2a-specs`. An index with the contracted count, and one contract
per component that any renderer reads: Milo, Forge, Storybook, anything.

---

## What still needs a person (say this somewhere; the end is fine)

- An open slot's example content. The design shows a TextCard in the open
  control variant; the contract records it as an example, not a default. The
  one failing matrix cell is that.
- Combinations code can render and Figma does not draw. The set has no
  default-size control variant; the story shows one anyway.
- REST and plugin extractions hash differently, so the gate calls a REST
  extraction "updated" rather than "in-sync". True, and not a defect.
- Leaf healing inside the tree run, and motion tokens for the disclosure.
