# Consonant Specs

A Figma plugin for measurements, annotations, and developer handoff with S2A token integration.

## Setup

1. Install dependencies: `npm install`
2. Sync tokens: `npm run sync-tokens`
3. Build: `npm run build`
4. In Figma Desktop: Plugins > Development > Import plugin from manifest
5. Select `manifest.json` from this project

**First time on a new machine?** See `docs/setup-guide.md` for full setup instructions.

## MCP server setup (one-time per machine)

The plugin ships with an MCP server (`mcp/`) that lets Claude Code talk to Figma through this plugin. The built output is gitignored, so you need to build it once after cloning or pulling:

```bash
cd apps/consonant-specs-plugin/mcp
npm install
npm run build
```

After that, restart Claude Code to pick up the `consonant-specs` server. You only need to rebuild if you pull changes to `mcp/src/`.

## Development

- `npm run watch` — rebuild on file changes
- `npm run sync-tokens` — update S2A token data from consonant repo

## Features

- **Measure** — Width, height, outer spacing, padding, and redline overlays
- **Annotate** — Property inspection with S2A token matching and canvas spec cards
- **Handoff** — Node scanning with compliance warnings and spec page generation
