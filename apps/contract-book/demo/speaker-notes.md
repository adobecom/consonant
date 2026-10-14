# The contract loop — speaker notes

For `contract-loop-control-button.mp4` (3:03, silent). Timestamps are the
chapter markers the recording wrote (`out/markers.json`); each beat has room
for the lines under it, plus a breath. Everything on screen is real: the
extraction, the commands, the scores. Nothing is mocked.

The one-line thesis, if you only say one thing: **a description informs; a
contract arbitrates.** Everything in this video is what happens when the
contract — not a person — is the thing that says whether code matches design.

---

## 0:01 — the Book, at rest

> This is the Contract Book. Three panes. On the left, every component that
> has a contract. In the middle, the one file a human writes — the defs. On
> the right, everything derived from it: the contract, the stylesheet, the Lit
> component, the Milo block, the Figma plan, a live render, and a parity score
> against the design.
>
> Nothing in this app has logic of its own. It runs the same engine, the same
> validator, the same visual eval and the same extractor as the command line.
> If the Book and the CLI disagree, that's a bug, not an opinion.

## 0:04 — paste the Figma link, Extract

> We start from a link. This is ControlButton — a component set in our Figma
> file: two sizes, five states, an icon slot.
>
> Extract pulls the set over Figma's REST API and runs our extractor on it —
> the same walk the plugin does — and records *evidence*: every variant, every
> layer, every token bound to every property, every literal that isn't bound.
> About twenty seconds. Evidence is observed, never edited.

## 0:26 — the draft

> What comes back isn't a contract yet. It's a *draft definition* — the
> scaffolder's reading of the evidence, with every judgment call written down
> as an open decision. Sizes, states, which Figma axis is a prop and which is
> runtime behaviour, what the icon slot holds by default.
>
> The defs is the only file a person edits. The contract is derived from it.
> That's deliberate: in this system the contract is never hand-written, so the
> Book doesn't let you.

## 0:29 — Evidence

> Ten variants, twelve token bindings, all twelve resolved. Extractor and hash
> — provenance, so a stale extraction can't hide.

## 0:33 — Refusals

> And this is where the system starts arguing back. Seven warnings. Three sizes
> in the design — 32, 48, 26 pixels — carry no token. They render correctly,
> and they're flagged every single run until someone binds a variable in Figma
> or records why they're literals. A hardcoded value never ships silently.
>
> And one more: the design fills the icon slot with "S2a_Icon_Arrow Right",
> and the contract hasn't bound that to an icon in our code library yet.
> Remember that one.

## 0:37 — Preview

> The live render — the generated component, real tokens, real type. Cycling
> the forced state: hover, active, disabled, focus.

## 0:46 — Contract, CSS, Lit, Milo, Figma plan, Spec

> Every surface, derived live from the defs. The contract in the interop shape
> a consumer reads. The stylesheet. The Lit component and its stories. The
> Milo block. The plan to rebuild the set in Figma. Change a decision in the
> middle pane and all of these move.

## 1:03 — Save to repo

> Nothing has touched disk until now. Save writes the evidence and the defs
> beside the component, and — because this component already has code —
> extracts the code evidence too, so the defs can be checked against both.

## 1:09 — ship: the commands

> From here it's the pipeline — the same seven commands `/contract-ship`
> runs, in order, for real. Validate the defs. Build the contract. Render
> Lit and Milo. Shoot one golden sheet from Figma — every variant in one
> request. Score the rendered state matrix against it, cell by cell. Run the
> gate. Pack the package.
>
> Watch the matrix step: ten out of ten cells pass the eight-percent bar —
> but the eval says the focus column is consistently worse than the others in
> every row. That's the shape of a detail missing everywhere, not noise. It
> even names the region: paint outside the border box — an outline or a
> shadow the CSS doesn't draw.

## 1:49 — Parity tab

> Same score, in the Book, on the shipped component. Open the focus cell:
> design, built, difference. The ring is there in the design and not in the
> build. The codes underneath say which CSS property owns that region.

## 2:09 — Heal

> Now the part I actually want you to see. Heal.
>
> It scores, applies one fix the evidence supports, scores again — and
> repeats until it passes or runs out of evidence.
>
> Pass one: that icon warning. The design says "Arrow Right"; our icon
> library has `arrow-right`; the names match letter for letter, so it binds
> the slot to the library entry and records that as a decision.
>
> Pass two: the focus ring. The evidence has a Focus Ring layer in the focus
> variant, stroked with the focus-ring token, one pixel, aligned outside its
> box. That becomes an outline on the root in the focus state — colour,
> width and offset read from the layer, not guessed.
>
> Then it stops: nothing left to heal. Ten out of ten, nothing flagged.
> Every fix is a decision in the defs with the evidence it came from. A
> curator reads it the same way they'd read their own.

## 2:24 — Save the healed defs

> The healed file is still a draft until it's on disk. Save, rebuild, render.

## 2:31 — Storybook: generated story

> The generated component in Storybook — the glyph from our library, centred
> in the box the design gave it.

## 2:36 — State matrix, design overlay wipe

> Every variant, every state forced, on one grid. The design overlay wipes
> the Figma sheet across the build. This is the thing we show when someone
> asks "does the code match the design?" — you drag, and you look.

## 2:48 — difference mode

> Difference mode: anything that's not black is a disagreement. There's
> almost nothing.

## 2:53 — the package

> And the end of the line. `@adobecom/s2a-specs` — six contracts now,
> `control-button.json` among them. This is what a renderer consumes: Milo,
> Forge, Storybook, an agent, anything. The contract is the handoff. Nobody
> downstream reads our JavaScript to find out what a control button is.

---

## If there's time, the sentence under all of it

> Design systems are moving from documentation to contracts because a
> description can be wrong and nobody notices. A contract gets checked —
> against the design, every run — and when it's wrong, the system says so by
> name, and increasingly fixes it itself.
