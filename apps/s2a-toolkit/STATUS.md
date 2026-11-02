# Figma plugin (apps/s2a-toolkit): status

## What it is

The S2A Toolkit Figma plugin: versioning and docs tools for component pages,
native annotations, "Extract contract" (publishes design evidence to the
Contract Book or the relay), and the Bridge tab that connects Figma to the
figma-console MCP so Claude can run `figma_execute`. Runs in Figma, Dev Mode
and FigJam. Version 0.2.1; the bridge reports plugin version 0.3.0.

## Run and deploy

Open it in Figma Desktop from `apps/s2a-toolkit/manifest.json` (Plugins →
Development → Import). The bridge listens on ports 9220–9232; `figma_get_status`
in the MCP confirms the connection. No build step for the manifest itself;
see the app's README for the UI build.

## Now

- Nothing in flight.

## Open threads

- `figma_set_image_fill` in the MCP is not implemented by this bridge
  version, and `createImageAsync(url)` is refused even for allowlisted hosts.
  Images reach a board by `fetch` → `arrayBuffer` → `figma.createImage` inside
  `figma_execute`, served from `localhost:6007` with CORS headers. Recorded in
  the agent memory under the Agentic S2A board.
- `pluginUpdateAvailable: true` in the bridge status; not looked into.

## Decisions

- 2026-10-28: `editorType` includes `dev` and `capabilities` includes
  `inspect`, so the plugin opens in Dev Mode; `localhost:6007` is in
  `allowedDomains` and `devAllowedDomains` for the Contract Book.
- 2026-10-29: `editorType` includes `figjam`, so the bridge can drive FigJam
  boards (the audit board lives on one).
