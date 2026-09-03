import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{A as t,M as n,a as r,j as i,o as a}from"./blocks-BrKicmV8.js";function o(e){let t={code:`code`,h1:`h1`,h2:`h2`,h3:`h3`,p:`p`,pre:`pre`,strong:`strong`,...i(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(r,{title:`Getting Started/Connecting the Bridge`}),`
`,(0,c.jsx)(t.h1,{id:`connecting-the-bridge-claude-code--figma`,children:`Connecting the Bridge (Claude Code ↔ Figma)`}),`
`,(0,c.jsxs)(t.p,{children:[`The `,(0,c.jsx)(t.strong,{children:`S2A Toolkit`}),` plugin can connect to `,(0,c.jsx)(t.strong,{children:`Claude Code`}),` (or any MCP client) so an
AI assistant can read and drive your Figma file — the same `,(0,c.jsx)(t.code,{children:`figma_execute`}),`
workflow the design-infra team uses. This page gets you connected in three steps.`]}),`
`,(0,c.jsxs)(t.p,{children:[`The Bridge is `,(0,c.jsx)(t.strong,{children:`optional`}),`. The toolkit's other features — component docs,
annotations, variant filter, token release — work without it.`]}),`
`,(0,c.jsx)(t.h2,{id:`how-it-fits-together`,children:`How it fits together`}),`
`,(0,c.jsxs)(t.p,{children:[`The toolkit plugin (in Figma) is the `,(0,c.jsx)(t.strong,{children:`Bridge client`}),`. It connects over a local
WebSocket to a small `,(0,c.jsx)(t.strong,{children:`MCP server`}),` running on your machine, which your MCP client
launches. We ship that server as a one-command launcher, `,(0,c.jsx)(t.strong,{children:(0,c.jsx)(t.code,{children:`@adobecom/s2a-toolkit-bridge`})}),`
(a pinned, known-good `,(0,c.jsx)(t.code,{children:`figma-console-mcp`}),`).`]}),`
`,(0,c.jsx)(t.pre,{children:(0,c.jsx)(t.code,{children:`Claude Code  ⇄  @adobecom/s2a-toolkit-bridge  ⇄  S2A Toolkit plugin  ⇄  your Figma file
              (MCP / stdio)     (ws://localhost:9223–9232)
`})}),`
`,(0,c.jsx)(t.h2,{id:`you-need`,children:`You need`}),`
`,(0,c.jsxs)(`ul`,{children:[(0,c.jsxs)(`li`,{children:[(0,c.jsx)(`strong`,{children:`Figma Desktop`}),` — the web app can't run the Bridge.`]}),(0,c.jsxs)(`li`,{children:[`The `,(0,c.jsx)(`strong`,{children:`S2A Toolkit`}),` plugin, installed from `,(0,c.jsx)(`strong`,{children:`Adobe Enterprise`}),` in Figma.`]}),(0,c.jsxs)(`li`,{children:[`An `,(0,c.jsx)(`strong`,{children:`MCP client`}),` — Claude Code, Cursor, etc.`]}),(0,c.jsxs)(`li`,{children:[`A `,(0,c.jsx)(`strong`,{children:`Figma personal access token`}),` (starts with `,(0,c.jsx)(`code`,{children:`figd_`}),`) — `,(0,c.jsx)(`a`,{href:`https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens`,target:`_blank`,rel:`noreferrer`,children:`create one here`}),`.`]})]}),`
`,(0,c.jsx)(t.h3,{id:`dont-mix-up-the-three-tokens`,children:`Don't mix up the three tokens`}),`
`,(0,c.jsxs)(`table`,{children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`th`,{align:`left`,children:`Token`}),(0,c.jsx)(`th`,{align:`left`,children:`Used for`})]})}),(0,c.jsxs)(`tbody`,{children:[(0,c.jsxs)(`tr`,{children:[(0,c.jsxs)(`td`,{children:[(0,c.jsx)(`strong`,{children:`Figma PAT`}),` (`,(0,c.jsx)(`code`,{children:`figd_…`}),`)`]}),(0,c.jsxs)(`td`,{children:[`The Bridge, to reach Figma. `,(0,c.jsx)(`em`,{children:`This page.`})]})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsxs)(`strong`,{children:[`GitHub `,(0,c.jsx)(`code`,{children:`read:packages`})]})}),(0,c.jsxs)(`td`,{children:[`Only to `,(0,c.jsx)(`code`,{children:`npm install`}),` `,(0,c.jsx)(`code`,{children:`@adobecom/*`}),` packages.`]})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(`strong`,{children:`GitHub PAT`})}),(0,c.jsxs)(`td`,{children:[`Only for running a `,(0,c.jsx)(`em`,{children:`token release`}),` from the toolkit.`]})]})]})]}),`
`,(0,c.jsx)(t.h2,{id:`step-1--point-npm-at-github-packages-once`,children:`Step 1 — Point npm at GitHub Packages (once)`}),`
`,(0,c.jsxs)(t.p,{children:[`In your `,(0,c.jsx)(t.code,{children:`~/.npmrc`}),`:`]}),`
`,(0,c.jsx)(t.pre,{children:(0,c.jsx)(t.code,{className:`language-ini`,children:`@adobecom:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}
`})}),`
`,(0,c.jsxs)(t.p,{children:[`Set `,(0,c.jsx)(t.code,{children:`GITHUB_TOKEN`}),` in your environment (a `,(0,c.jsx)(t.code,{children:`read:packages`}),` token, authorized for the
`,(0,c.jsx)(t.code,{children:`adobecom`}),` org).`]}),`
`,(0,c.jsx)(t.h2,{id:`step-2--add-the-bridge-server-to-your-mcp-client`,children:`Step 2 — Add the Bridge server to your MCP client`}),`
`,(0,c.jsx)(t.p,{children:(0,c.jsx)(t.strong,{children:`Claude Code:`})}),`
`,(0,c.jsx)(t.pre,{children:(0,c.jsx)(t.code,{className:`language-bash`,children:`claude mcp add s2a-toolkit-bridge -s user \\
  -e FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN_HERE \\
  -- npx -y @adobecom/s2a-toolkit-bridge
`})}),`
`,(0,c.jsxs)(t.p,{children:[(0,c.jsx)(t.strong,{children:`By hand`}),` (Claude Code `,(0,c.jsx)(t.code,{children:`.mcp.json`}),`, Cursor `,(0,c.jsx)(t.code,{children:`.cursor/mcp.json`}),`, …):`]}),`
`,(0,c.jsx)(t.pre,{children:(0,c.jsx)(t.code,{className:`language-json`,children:`{
  "mcpServers": {
    "s2a-toolkit-bridge": {
      "command": "npx",
      "args": ["-y", "@adobecom/s2a-toolkit-bridge"],
      "env": { "FIGMA_ACCESS_TOKEN": "figd_YOUR_TOKEN_HERE" }
    }
  }
}
`})}),`
`,(0,c.jsx)(t.p,{children:`Your MCP client launches the server on demand — nothing to start or manage yourself.`}),`
`,(0,c.jsx)(t.h2,{id:`step-3--open-the-bridge-in-figma`,children:`Step 3 — Open the Bridge in Figma`}),`
`,(0,c.jsxs)(t.p,{children:[`In `,(0,c.jsx)(t.strong,{children:`Figma Desktop`}),`, open the `,(0,c.jsx)(t.strong,{children:`S2A Toolkit`}),` plugin → `,(0,c.jsx)(t.strong,{children:`Bridge`}),` tab. It scans
ports `,(0,c.jsx)(t.code,{children:`9223–9232`}),` and connects to the running server. Claude Code can now read and
drive your file.`]}),`
`,(0,c.jsx)(t.h2,{id:`troubleshooting`,children:`Troubleshooting`}),`
`,(0,c.jsxs)(`ul`,{children:[(0,c.jsxs)(`li`,{children:[(0,c.jsx)(`strong`,{children:`Bridge tab won't connect`}),` — make sure your MCP client has actually started the server (open Claude Code and use any Figma tool once), and that you're in `,(0,c.jsx)(`strong`,{children:`Figma Desktop`}),`, not the browser.`]}),(0,c.jsxs)(`li`,{children:[(0,c.jsx)(`strong`,{children:`Auth errors`}),` — the `,(0,c.jsx)(`code`,{children:`FIGMA_ACCESS_TOKEN`}),` must be a valid `,(0,c.jsx)(`code`,{children:`figd_…`}),` token; regenerate if unsure.`]}),(0,c.jsxs)(`li`,{children:[(0,c.jsx)(`strong`,{children:`Port already in use`}),` — the server falls back across `,(0,c.jsx)(`code`,{children:`9223–9232`}),`; the toolkit scans the same range, so a fallback port still connects.`]})]})]})}function s(e={}){let{wrapper:t}={...i(),...e.components};return t?(0,c.jsx)(t,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}var c;function l(){return(l=e((()=>{c=n(),t(),a()})))()}l();export{s as default};