#!/usr/bin/env bash
# Runs the proof of concept end to end. Usage: run-all.sh <results folder>
set -euo pipefail
OUT="$1"; D=packages/spectrum2/poc/theming
node $D/step-a-shipped.mjs --out "$OUT/../step-a" >/dev/null
node $D/step-b-theme.mjs --out "$OUT" >/dev/null
node $D/step-b-theme.mjs --out "$OUT" --theme $D/themes/playful.json --name playful >/dev/null
node $D/step-cd-contract-render.mjs --out "$OUT" >/dev/null
# Second theme on the same bindings.
node $D/step-cd-contract-render.mjs --out "$OUT" --theme themed=$D/themes/stand-in.json --theme playful=$D/themes/playful.json >/dev/null
node $D/step-e-verify.mjs --out "$OUT" --shipped "$OUT/../step-a/step-a-shipped.json" --extra playful >/dev/null
node $D/step-g-release.mjs --out "$OUT" >/dev/null
node $D/step-h-consumer.mjs --out "$OUT" >/dev/null
# Second component: Badge on the same themes, with shared Badge bindings only.
node $D/step-badge.mjs --out "$OUT" --shipped "$OUT/../step-a/step-a-shipped.json" >/dev/null
# Every component, every theme, measured the same way.
node $D/step-components.mjs --out "$OUT" >/dev/null
# Theme stress test: 40 generated themes and 13 broken ones, every component.
node $D/step-fuzz.mjs --out "$OUT" >/dev/null
# Release replay: every Design Data and shipped upgrade on disk, every component, five themes.
node $D/step-release-all.mjs --out "$OUT" >/dev/null
# Spectrum's own WASM package, fetched by fetch-sources.mjs. The Forge step is private and not in this repo; it runs only if present.
node $D/step-b2-applyplatform.mjs --out "$OUT" >/dev/null
[ -n "${FORGE_SOURCE:-}" ] && [ -f $D/step-forge.mjs ] && node $D/step-forge.mjs --source "$FORGE_SOURCE" --out "$OUT" >/dev/null
echo done
