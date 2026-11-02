# Contract Book (apps/contract-book): status

## What it is

The place a contract is edited and signed off. Left: the library and a Figma
link field to extract a new set. Centre: the defs, editable, with refusals by
name. Right: the derived artefacts, the evidence, the component as Storybook
renders it, and the parity score against the golden sheet. It draws nothing of
its own.

## Run and deploy

```
npm run contract-book        dev server on 6007; needs Storybook on 6006 for Render and Parity
npm run build (nx)           static snapshot to dist/apps/contract-book; GitHub Pages hosts it read-only
```

`FIGMA_ACCESS_TOKEN` in `.env` is read by the extract plugin for REST calls.
`STORYBOOK_URL` / `VITE_STORYBOOK_URL` override the Storybook address.

## Now

- Nothing in flight. Next change is to make the Draft button run the
  code-first drafter (`--from=code`) when code evidence exists, with the design
  used only to anchor and bind.

## Open threads

- `vite-plugin-extract.mjs` and `vite-plugin-s2a-data.mjs` carry their own
  SYSTEMS tables; they should read `packages/spec-dictionary/systems.mjs`.
- Parity scores the build on disk, not the editor: edit, sign off, build,
  score. Stated in the tab; still a round trip per iteration.
- The Book's `curationRefusals` duplicates parts of `validate-defs.mjs`.
- Both the Book and Storybook get killed by the OS when memory is low if an
  agent starts them; start them from a terminal.

## Decisions

- 2026-10-28: The Book never renders a component. It had grown a preview with
  controls, a story index and a design wipe that reconstructed every component
  from its contract, so every gap in the reconstruction was ours to chase.
  Render is Storybook's iframe; Parity drives headless Chromium at Storybook.
  Deleted: `preview.ts`, `matrix.ts`, `matrix.html`, the `/__assets` and
  `node-image` routes, the verbatim token CSS in the data bundle.
- 2026-10-28: "Save defs" is "Sign off": write the defs, run that system's
  build, regenerate the stories, Storybook follows.
- 2026-10-28: Lit, CSS and Milo tabs show only for our own system; a shipped
  library is not generated from its contract.
- 2026-10-28: An extraction names its target system in the rail. Two systems
  can call a set "Button"; guessing from the name overwrote ours.
