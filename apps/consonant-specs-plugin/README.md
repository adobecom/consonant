# Consonant Specs

A Figma plugin for measurements, annotations, and developer handoff with S2A token integration.

## Setup

1. Install dependencies: `npm install`
2. Sync tokens: `npm run sync-tokens`
3. Build: `npm run build`
4. In Figma Desktop: Plugins > Development > Import plugin from manifest
5. Select `manifest.json` from this project

## Development

- `npm run watch` — rebuild on file changes
- `npm run sync-tokens` — update S2A token data from consonant repo

## Features

- **Measure** — Width, height, outer spacing, padding, and redline overlays
- **Annotate** — Property inspection with S2A token matching and canvas spec cards
- **Handoff** — Node scanning with compliance warnings and spec page generation
