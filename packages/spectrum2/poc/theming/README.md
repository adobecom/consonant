# Theming proof of concept

Evaluation code, not production. It reads Spectrum Design Data at an exact version and
writes results outside this folder. Nothing here changes Button's existing defs.

```sh
node packages/spectrum2/poc/theming/fetch-sources.mjs
node packages/spectrum2/poc/theming/step-a-compare.mjs --out <folder> [--consumer-tokens <tokens.json> --consumer-prefix <prefix>]
node packages/spectrum2/poc/theming/step-a-shipped.mjs --out <folder>   # five components, read from shipped CSS
node packages/spectrum2/poc/theming/release-history.mjs --out <folder>  # needs releases unpacked in .tmp/poc-theming/history
```

End to end, once sources are fetched: `packages/spectrum2/poc/theming/run-all.sh <results folder>`. `themes/stand-in.json` is the stand-in theme. `themes/playful.json` is a second, Playful theme, to test whether one set of bindings serves two brands. A theme file holds values only. Bindings are shared by every theme, one file per component: `themes/bindings-button.json` and `themes/bindings-badge.json`. `out/` is generated. Shared bindings point only at role tokens named `theme-*` or at Spectrum's semantic tokens. Every theme defines each `theme-*` token the bindings use, and loading a theme refuses a binding to a palette step.

Loading a theme also lints it: an invalid value, a font with no generic fallback, or a line height under its font size is refused, and type well above Spectrum's size is flagged for review. The release check rebuilds each component on the candidate release and diffs the generated tokens file (`release-check.mjs`, `candidateCheck`).

A second component, Badge, runs through the same themes with `step-badge.mjs`. Its shared bindings are in `themes/bindings-badge.json`; it builds `out/badge-<name>/` and checks the builds in Chromium. The viewer has a Button and Badge toggle.

To look at the builds side by side, serve this folder (for example `python3 -m http.server 6130` from it) and open `/viewer/index.html`: plain Spectrum, the stand-in and the Playful theme, in light, dark and mobile, with live states and a token-change control.

Downloads go to `.tmp/poc-theming/`, which git ignores. Keep any result that mentions a
private consumer out of tracked files.
