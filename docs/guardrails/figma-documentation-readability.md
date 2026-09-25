# Guardrail: Readability of Figma Documentation

**Status**: Active
**Applies to**: Documentation frames and pages authored in the Figma file — Start Here, the
agentic-system pages, MCP Server, Prototyping, Token Pipeline, component doc sheets, annotations.
**Does not apply to**: the components themselves, or product design. Those are governed by their
contracts. This rule is about how we present writing *about* the system.

## Why this exists

Documentation is the one surface in the file made entirely of running text, and it is the surface
most likely to be read end to end by someone who is not us. A component can pass every token and
contrast check and still be unreadable if the prose it sits in runs 200 characters wide. We hold our
components to WCAG 2.2 AA; the pages that explain them should meet at least the same bar, and for
body copy the AAA reading criteria are cheap enough to just adopt.

## Rule

### 1. Measure — 45 to 75 characters per line, never more than 80

WCAG 2.2 **1.4.8 Visual Presentation (AAA)** caps a line at 80 characters. Typographic convention
puts comfortable reading at 45–75, around 66 being the usual target. Text that fills a 2000px doc
frame runs roughly 200 characters and fails both.

Constrain the text with `maxWidth` on the text node, and then **let the frame hug the column**.
A 640px measure inside a 2000px card leaves ~1300px of dead surface, which reads as unfinished
rather than as generous. The column is the page.

Measured for this file's own faces, so these are the numbers to use:

| Style | Avg char width | 66 ch | **Use this maxWidth** | Lands at |
|---|---|---|---|---|
| Adobe Clean Display Black 24 (section heading) | 11.9px | 785px | **640px** | 54 ch |
| Adobe Clean Regular 20 (body) | 8.42px | 556px | **640px** | 76 ch |
| Adobe Clean Regular 16 (caption) | 6.74px | 445px | **500px** | 74 ch |

One pixel width cannot serve two sizes. A 640px column is 76 characters at 20px but 95 at 16px, so
**cap per size, not per column**. If a new size is introduced, measure it the same way: render a
known 66-character string, divide, and write the number into this table.

### 2. Line spacing at least 1.5 within a paragraph

Also 1.4.8, and it is what makes 1.4.12 Text Spacing (AA) survivable. Figma's `AUTO` line height on
Adobe Clean lands near 1.2, so set it explicitly: `lineHeight = { unit: 'PERCENT', value: 150 }`.

### 3. Paragraph spacing at least 1.5× the line spacing

Body at 20px with 150% line height is a 30px line, so blocks inside a section sit at **24px or more**
and separated paragraphs at 45px. Do not tighten a section to fit more on screen.

### 4. Never justify

1.4.8 forbids justified text. Left-aligned, ragged right.

### 5. Contrast: AA is the floor, AAA is the target for body

**1.4.3 (AA)** is 4.5:1 for body and 3:1 for large text (24px+, or 18.66px+ bold). **1.4.6 (AAA)** is
7:1 and 4.5:1. The current doc surface is white on `s2a/color/background/knockout`, measured at
**21:1**, so there is no excuse for a new doc page to land below AAA. Re-measure if the surface
colour ever changes.

### 6. Structure has to be real

**1.3.1 Info and Relationships (A)**: the visual hierarchy must exist in the layer tree, not just in
the type sizes. Sections are named `section`, rules are named `separator`, headings are a
consistent size, and nothing is an unnamed `Frame 47`. **2.4.6 Headings and Labels (AA)**: a heading
says what the section contains, not "Overview".

### 7. Don't carry meaning in colour alone

**1.4.1 (A)**. A red or green swatch in a status table needs a word beside it.

## The house style these rules sit inside

Measured from the `↳ MCP Server` frames, which are the template:

- Outer frame VERTICAL, `itemSpacing` 0, padding 60/60/80/60, fill
  `s2a/color/background/knockout`, all four radii bound to `VariableID:2:94`.
- **Width hugs the measure column.** The `section` frames are FIXED at the column width (640),
  the `Desktop` card is HUG, and the frame's `counterAxisSizingMode` is `AUTO`. With the standard
  paddings that lands the frame at **888 wide**. The older full-width doc frames in this file
  predate this rule; they are fine as they are, but new frames hug.
- The title / standfirst / byline / rule beneath the card are pinned to the same 640 column so the
  whole page shares one left edge for its text.
- **Content card first, title / standfirst / byline / rule beneath it.** The artifact, then its label.
- Inner card named `Desktop`: HUG width (the sections set it), HUG height, VERTICAL, gap 40,
  padding 48/64/64/64.
- Alternating `section` frames (VERTICAL, gap 24) and `separator` frames (1px, `border/subtle`).
- Section heading Display Black 24 → `content/heading`; body Regular 20 → `content/default`;
  caption Regular 16 → `content/body-subtle`. Title Display Bold 56 → `content/knockout`.
  Byline `Month YYYY  ·  @matt` at 14.
- Doc chrome uses **raw font sizes, not S2A text styles** — this is the one place that is correct.

## The one that will bite you

**Every doc frame must set the theme collection (`VariableCollectionId:6:17`) to `Dark` explicitly.**
A new frame resolves `Light`, where the card fill and the body ink both land near-black, and the page
renders black on black with no error of any kind. After setting the mode, re-resolve every paint
literal down its alias chain and overwrite it — the bound-variable literal fallback does not follow
the mode.

## Run the check, don't trust the checklist

**In the plugin:** S2A Toolkit → Tools → **Doc readability**. Select a documentation frame, press
Check readability. Failures and warnings list beneath it, worst first, and clicking one jumps to the
layer it is about. It reports and never edits — a checker that silently rewrites your page teaches
you to stop reading its output. Source: `apps/s2a-toolkit/src/doc-check.ts`.

**Outside the plugin:** [`check-figma-doc-frame.mjs`](check-figma-doc-frame.mjs) is the same rule as
a snippet. Set a frame id, run it through `figma_execute`, read `issues`.

It covers: measure per size, 150% line spacing, justified text, maxWidth caps, the Dark-mode trap,
unnamed layers, and the section/separator rhythm including stacked rules.

One thing it does deliberately: a **single-line** label is measured by its own text, not by its box.
Measuring the box reported a 24-character byline sitting in a wide frame as a 108-character line —
a false positive that would have trained everyone to ignore the check.

## Checklist before publishing a doc frame

- [ ] Theme collection pinned to Dark, paint literals re-resolved
- [ ] Every text node capped per the table above; nothing over 80 characters
- [ ] Sections FIXED at the column width, card HUG, frame hugging — no dead surface beside the text
- [ ] Line height 150% on body and caption
- [ ] Left aligned, not justified
- [ ] Contrast measured, AAA for body
- [ ] Layers named; headings describe their section
- [ ] No status conveyed by colour alone
