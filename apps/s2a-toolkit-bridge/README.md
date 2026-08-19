# `@adobecom/s2a-toolkit-bridge`

A one-command launcher that connects **Claude Code** (or any MCP client) to
**Figma** for the S2A Toolkit. It runs a **pinned, known-good `figma-console-mcp`**
with the defaults the toolkit expects, so you don't have to chase versions, ports,
or flags — paste one blessed config entry and go.

This is the **local server** side of the Bridge. The other side is the **S2A
Toolkit plugin**, which you install from **Adobe Enterprise** inside Figma — its
**Bridge** tab connects to this server over `ws://localhost:9223–9232`.

---

## What you need

- **Figma Desktop** (the web app can't run the Bridge)
- **The S2A Toolkit plugin** installed from Adobe Enterprise
- **An MCP client** — Claude Code, Cursor, etc.
- **A Figma personal access token** (starts with `figd_`) — this is the one token
  the Bridge needs. [Create one here](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens).

> **Three different tokens, don't mix them up:**
> - **Figma PAT (`figd_…`)** — *this*, for the Bridge to reach Figma.
> - **GitHub `read:packages`** — only to `npm install` `@adobecom/*` packages.
> - **GitHub PAT** — only for running a *token release* from the toolkit.

---

## Install & connect

**1.** Point the `@adobecom` scope at GitHub Packages in your `~/.npmrc` (once):

```ini
@adobecom:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**2.** Add the server to your MCP client. Claude Code:

```bash
claude mcp add s2a-toolkit-bridge -s user \
  -e FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN_HERE \
  -- npx -y @adobecom/s2a-toolkit-bridge
```

Or by hand (Claude Code `.mcp.json`, Cursor `.cursor/mcp.json`, etc.):

```json
{
  "mcpServers": {
    "s2a-toolkit-bridge": {
      "command": "npx",
      "args": ["-y", "@adobecom/s2a-toolkit-bridge"],
      "env": { "FIGMA_ACCESS_TOKEN": "figd_YOUR_TOKEN_HERE" }
    }
  }
}
```

Your MCP client launches the server on demand — you don't start or manage a
process yourself.

**3.** In **Figma Desktop**, open the **S2A Toolkit** plugin → **Bridge** tab. It
scans `9223–9232` and connects to the running server. Now Claude Code can read and
drive your Figma file.

---

## Notes

- `ENABLE_MCP_APPS=true` is set for you (enables the design-system tools). Override
  it in `env` if you need to.
- The Bridge is optional — the toolkit's other features (component docs,
  annotations, variant filter, token release) work without it.
- Version pinning is deliberate: this package tracks a `figma-console-mcp` build
  verified against the current toolkit plugin. Bumping it is how the team ships a
  new validated Bridge.
