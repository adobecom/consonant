# Our components (packages/components): status

## What it is

The S2A component source: one folder per slug with the hand-written code
(`<slug>.js`, `<slug>.css`), the evidence (`<slug>.figma.evidence.json`,
`<slug>.code.evidence.json`), the judgment (`<slug>.defs.json`), and the
derived contract, spec and catalog. Eighteen components are contracted; the
rest have a spec only. `defs.schema.json` is the schema every defs is
validated against.

## Run and deploy

```
npm run evidence:code -- --slug=<slug>                       extract code evidence (postcss; structured rules)
node packages/components/scripts/code-evidence.mjs --root=<src> --ns=<ns> --slug=<slug>   another system
npm run defs:validate -- --slug=<slug>                       validate a defs
npm run specs:build -- --slug=<slug>                         build the derived files
/contract-ship <slug>                                        validate, build, gate, render, sheet, parity
```

## Now

- Nothing in flight here. The Spectrum work (`packages/spectrum2`) is the
  active front; it reuses these scripts with `--root` and `--ns`.

## Open threads

- Atom contracts (button, checkbox, control-button, helper-text, link, radio)
  now render to `packages/milo-atoms/`; their old `packages/milo-blocks/`
  folders were deleted on 2026-10-29. The remaining `milo-blocks` CSS is
  stale against the renderer.
- Button's `outline-inverse` row scores 0.0% in every parity cell: the golden
  sheet row is probably empty. Worth a look next time Button is open.
- Two deliberate schema loosenings (`defs.schema.json`) are unlocked; see the
  contract pipeline STATUS.

## Decisions

- 2026-10-28: Code evidence records every stylesheet rule as structured
  `{ selector, declarations }` (nested `&` rules resolved flat). The flat
  token list stays; nothing downstream changed hash.
- 2026-10-28: The evidence extractor takes `--root` and `--ns`, so a second
  design system's tree uses the same scripts.
