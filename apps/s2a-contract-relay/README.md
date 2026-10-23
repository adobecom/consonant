# s2a-contract-relay

The publish transport for the toolkit's **Extract contract → Publish** button
(plan: `docs/future-notes/s2a-contract-system-plan.md`, step 6). The plugin
posts evidence here; the relay holds the repository token, commits the
evidence to `contract/<slug>/<hash8>` under `packages/components/evidence/inbox/`,
and dispatches `.github/workflows/contract-sync.yml`, which applies it, runs
the gate, and opens the PR. A byte-identical publish answers `in-sync` and
touches nothing.

- `src/relay.mjs` handler (portable), `src/worker.mjs` Cloudflare entry,
  `local.mjs` Node entry on port 9420.
- Secrets: `GITHUB_TOKEN` (fine-grained PAT, this repo only: contents
  read/write, actions read/write, pull requests read/write); optional
  `RELAY_KEY` checked against the `x-s2a-relay-key` header.
- Deploy: `npx wrangler secret put GITHUB_TOKEN && npx wrangler deploy`; then
  set the plugin's sync endpoint to `https://s2a-contract-relay.<account>.workers.dev`
  (already allow-listed in the toolkit manifest for the mmhuntsberry account).
- Test: `npm test` (GitHub API mocked; hash equality with the sync server).
