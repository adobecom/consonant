import{j as e,M as t}from"./blocks-yBz_jYD6.js";import{useMDXComponents as i}from"./index-CA_C6xD8.js";import"./preload-helper-BvGMX4d4.js";import"./_commonjsHelpers-CqkleIqs.js";import"./iframe-BoGTDT1x.js";function r(s){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",p:"p",pre:"pre",strong:"strong",...i(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(t,{title:"Getting Started/Connecting the Bridge"}),`
`,e.jsx(n.h1,{id:"connecting-the-bridge-claude-code--figma",children:"Connecting the Bridge (Claude Code ↔ Figma)"}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.strong,{children:"S2A Toolkit"})," plugin can connect to ",e.jsx(n.strong,{children:"Claude Code"}),` (or any MCP client) so an
AI assistant can read and drive your Figma file — the same `,e.jsx(n.code,{children:"figma_execute"}),`
workflow the design-infra team uses. This page gets you connected in three steps.`]}),`
`,e.jsxs(n.p,{children:["The Bridge is ",e.jsx(n.strong,{children:"optional"}),`. The toolkit's other features — component docs,
annotations, variant filter, token release — work without it.`]}),`
`,e.jsx(n.h2,{id:"how-it-fits-together",children:"How it fits together"}),`
`,e.jsxs(n.p,{children:["The toolkit plugin (in Figma) is the ",e.jsx(n.strong,{children:"Bridge client"}),`. It connects over a local
WebSocket to a small `,e.jsx(n.strong,{children:"MCP server"}),` running on your machine, which your MCP client
launches. We ship that server as a one-command launcher, `,e.jsx(n.strong,{children:e.jsx(n.code,{children:"@adobecom/s2a-toolkit-bridge"})}),`
(a pinned, known-good `,e.jsx(n.code,{children:"figma-console-mcp"}),")."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`Claude Code  ⇄  @adobecom/s2a-toolkit-bridge  ⇄  S2A Toolkit plugin  ⇄  your Figma file
              (MCP / stdio)     (ws://localhost:9223–9232)
`})}),`
`,e.jsx(n.h2,{id:"you-need",children:"You need"}),`
`,e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Figma Desktop"})," — the web app can't run the Bridge."]}),e.jsxs("li",{children:["The ",e.jsx("strong",{children:"S2A Toolkit"})," plugin, installed from ",e.jsx("strong",{children:"Adobe Enterprise"})," in Figma."]}),e.jsxs("li",{children:["An ",e.jsx("strong",{children:"MCP client"})," — Claude Code, Cursor, etc."]}),e.jsxs("li",{children:["A ",e.jsx("strong",{children:"Figma personal access token"})," (starts with ",e.jsx("code",{children:"figd_"}),") — ",e.jsx("a",{href:"https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens",target:"_blank",rel:"noreferrer",children:"create one here"}),"."]})]}),`
`,e.jsx(n.h3,{id:"dont-mix-up-the-three-tokens",children:"Don't mix up the three tokens"}),`
`,e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{align:"left",children:"Token"}),e.jsx("th",{align:"left",children:"Used for"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsxs("td",{children:[e.jsx("strong",{children:"Figma PAT"})," (",e.jsx("code",{children:"figd_…"}),")"]}),e.jsxs("td",{children:["The Bridge, to reach Figma. ",e.jsx("em",{children:"This page."})]})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsxs("strong",{children:["GitHub ",e.jsx("code",{children:"read:packages"})]})}),e.jsxs("td",{children:["Only to ",e.jsx("code",{children:"npm install"})," ",e.jsx("code",{children:"@adobecom/*"})," packages."]})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("strong",{children:"GitHub PAT"})}),e.jsxs("td",{children:["Only for running a ",e.jsx("em",{children:"token release"})," from the toolkit."]})]})]})]}),`
`,e.jsx(n.h2,{id:"step-1--point-npm-at-github-packages-once",children:"Step 1 — Point npm at GitHub Packages (once)"}),`
`,e.jsxs(n.p,{children:["In your ",e.jsx(n.code,{children:"~/.npmrc"}),":"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ini",children:`@adobecom:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}
`})}),`
`,e.jsxs(n.p,{children:["Set ",e.jsx(n.code,{children:"GITHUB_TOKEN"})," in your environment (a ",e.jsx(n.code,{children:"read:packages"}),` token, authorized for the
`,e.jsx(n.code,{children:"adobecom"})," org)."]}),`
`,e.jsx(n.h2,{id:"step-2--add-the-bridge-server-to-your-mcp-client",children:"Step 2 — Add the Bridge server to your MCP client"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Claude Code:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`claude mcp add s2a-toolkit-bridge -s user \\
  -e FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN_HERE \\
  -- npx -y @adobecom/s2a-toolkit-bridge
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"By hand"})," (Claude Code ",e.jsx(n.code,{children:".mcp.json"}),", Cursor ",e.jsx(n.code,{children:".cursor/mcp.json"}),", …):"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{
  "mcpServers": {
    "s2a-toolkit-bridge": {
      "command": "npx",
      "args": ["-y", "@adobecom/s2a-toolkit-bridge"],
      "env": { "FIGMA_ACCESS_TOKEN": "figd_YOUR_TOKEN_HERE" }
    }
  }
}
`})}),`
`,e.jsx(n.p,{children:"Your MCP client launches the server on demand — nothing to start or manage yourself."}),`
`,e.jsx(n.h2,{id:"step-3--open-the-bridge-in-figma",children:"Step 3 — Open the Bridge in Figma"}),`
`,e.jsxs(n.p,{children:["In ",e.jsx(n.strong,{children:"Figma Desktop"}),", open the ",e.jsx(n.strong,{children:"S2A Toolkit"})," plugin → ",e.jsx(n.strong,{children:"Bridge"}),` tab. It scans
ports `,e.jsx(n.code,{children:"9223–9232"}),` and connects to the running server. Claude Code can now read and
drive your file.`]}),`
`,e.jsx(n.h2,{id:"troubleshooting",children:"Troubleshooting"}),`
`,e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Bridge tab won't connect"})," — make sure your MCP client has actually started the server (open Claude Code and use any Figma tool once), and that you're in ",e.jsx("strong",{children:"Figma Desktop"}),", not the browser."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Auth errors"})," — the ",e.jsx("code",{children:"FIGMA_ACCESS_TOKEN"})," must be a valid ",e.jsx("code",{children:"figd_…"})," token; regenerate if unsure."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Port already in use"})," — the server falls back across ",e.jsx("code",{children:"9223–9232"}),"; the toolkit scans the same range, so a fallback port still connects."]})]})]})}function a(s={}){const{wrapper:n}={...i(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(r,{...s})}):r(s)}export{a as default};
