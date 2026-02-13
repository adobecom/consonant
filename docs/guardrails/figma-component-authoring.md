# Figma Component Authoring Guardrail

Clean Figma components are the prerequisite for MCP, Story UI, and downstream codegen. This guardrail translates the FigJam notes on “Cleaning up Consonant for AI + MCP + Dev Mode” into concrete rules every designer/engineer should follow before exporting specs or generating component sets.

## Why it matters

- AI tools ingest the raw node tree. Annotation layers, redlines, or exotic constructions end up as “real” DOM, which forces us to bolt on more guardrails in prompts/code.
- Developers expect Figma atoms to behave like DOM primitives. When buttons or hero blocks use absolute-positioned wrappers, the mental mapping to HTML/CSS slows everyone down.
- Tokens and Dev Mode already capture the implementation contract. Duplication through spec overlays or hard-coded Milo tags only adds drift.

## Guardrail rules

1. **Keep annotations out of components**
   - Never bake sticky notes, redlines, Milo tags, or implementation callouts into the component frame.
   - Use Figma callouts/comments/Dev Mode annotations or Radley’s spec docs to convey notes.

2. **Model layers like DOM structure**
   - Frame ≈ semantic element (e.g., button frame → `<button>`).
   - Inner text/image layers map to their inline DOM counterparts.
   - Avoid extra “background” rectangles or absolute-positioned wrappers unless they represent a reusable effect (shadow, gradient mask, etc.).

3. **Build and tokenize atoms first**
   - Buttons, text styles, checkboxes, images, etc. must consume semantic/component tokens for spacing, typography, color, radius.
   - Compose blocks from those token-driven atoms rather than introducing new ad-hoc spacing layers per block.

4. **Tokenize design decisions, not annotations**
   - Tokens describe real UI values (spacing, sizes, typography), never spec labels or overlay graphics.
   - If a spec element isn’t part of the shipped UI, it shouldn’t be in the YAML export or tied to a token.

5. **Use Dev Mode + metadata for implementation details**
   - Milo tags, tracking IDs, and other metadata belong in Dev Mode properties or documentation—not as visible layers the AI has to ignore.
   - Leverage Dev Mode inspection (constraints, properties, tokens) as the primary source of truth instead of maintaining parallel redline overlays.

## Checklist before syncing specs or generating components

- [ ] Component frame contains only production UI layers.
- [ ] Every visible layer maps to an expected DOM element and uses semantic tokens.
- [ ] Annotations/comments/notes live outside the component or in Dev Mode metadata.
- [ ] Milo tags and IDs captured as metadata, not text layers.
- [ ] Spec/YAML exports reference atoms + tokens only—no auxiliary annotation layers.

Following this skill keeps the Figma → YAML → MCP pipeline clean, reduces prompting guardrails, and lets Consonant invest in reusable atoms instead of maintaining over-engineered spec overlays.
