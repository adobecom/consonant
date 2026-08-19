# `@adobecom/s2a-ds-mcp`

The **S2A Design System MCP** — lets an AI agent (Claude Code, Cursor, any MCP
client) query the S2A design system as **structured data** instead of guessing at
token names or component APIs. It bundles a snapshot of the tokens and component
specs and exposes them as tools, so an agent can resolve real values and
**validate its own output** against the system before shipping it.

The published package is **self-contained** — the token/component data ships
inside it, so there's nothing to point at and no repo checkout required.

---

## Install

This package is published to **GitHub Packages**, which requires auth even for
reads — so consuming it needs a token, one time.

### 1. Create a `read:packages` token

A classic PAT with the **`read:packages`** scope. Shortcut that pre-selects it:
<https://github.com/settings/tokens/new?scopes=read:packages&description=s2a-ds-mcp>

Then **authorize it for the `adobecom` org** (on the tokens list → **Configure
SSO** → Authorize). Without this the token returns **401** even with the right
scope.

### 2. Point the `@adobecom` scope at GitHub Packages

In your `~/.npmrc` (or the project's):

```ini
@adobecom:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Set `GITHUB_TOKEN` in your environment — don't commit a raw token.

---

## Use it in your MCP client

Once the `.npmrc` above is in place, wire it up with `npx` — no install, no config,
the data is bundled:

```json
{
  "mcpServers": {
    "s2a-ds": {
      "command": "npx",
      "args": ["-y", "@adobecom/s2a-ds-mcp"]
    }
  }
}
```

- **Claude Code** — add to `.mcp.json` (project) or your user MCP config.
- **Cursor** — add to `.cursor/mcp.json`.

That's it. The server starts on stdio and serves the bundled snapshot.

---

## Tools

**Tokens**
- `resolve_token` — path or CSS var → resolved values across all modes (light/dark, breakpoints)
- `search_tokens` — find tokens by keyword
- `get_token_collection` · `list_token_collections` — full token maps
- `check_token_exists` · `get_token_aliases` — existence + alias chains

**Components**
- `get_component` · `list_components` · `get_component_tokens`
- `find_component_for_use_case` — describe a need → suggested component + confidence

**Specs**
- `get_component_spec` · `validate_spec` (spec-vs-reality drift) · `list_spec_coverage`

**Validation**
- `validate_css` — flags primitive tokens and hardcoded hex/rgb/px
- `check_token_in_css` · `validate_component_usage`

**Audit**
- `audit_css` — whole-file token-violation sweep

---

## Pointing at live sources (maintainers)

By default the server reads the **bundled** snapshot. If you're working on the
design system itself and want it to read *live* tokens/components from a repo
checkout, set `DS_ROOT` to the repo's absolute path:

```json
{
  "mcpServers": {
    "s2a-ds": {
      "command": "npx",
      "args": ["-y", "@adobecom/s2a-ds-mcp"],
      "env": { "DS_ROOT": "/absolute/path/to/consonant" }
    }
  }
}
```

Resolution order: `DS_ROOT` → bundled `data/` → repo root (when run from source).

---

## How the data stays current

The bundled `data/` is regenerated from the live monorepo sources at publish time
(`prepack` → `copy-data.mjs`) and, for the hosted HTTP deployment, at each Vercel
deploy. A CI check (`mcp-data-freshness`) verifies the snapshot is a complete,
byte-faithful mirror of the live sources before it ships.
