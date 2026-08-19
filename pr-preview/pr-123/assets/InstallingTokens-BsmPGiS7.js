import{j as e,M as r}from"./blocks-BZfG3OAA.js";import{useMDXComponents as o}from"./index-WILa8bvI.js";import"./preload-helper-FNQQAYUb.js";import"./_commonjsHelpers-CqkleIqs.js";import"./iframe-DpLEC4sr.js";function t(s){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",...o(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{title:"Getting Started/Installing Tokens"}),`
`,e.jsx(n.h1,{id:"installing-s2a-tokens",children:"Installing S2A Tokens"}),`
`,e.jsxs(n.p,{children:["The S2A design tokens ship as CSS custom properties (prefix ",e.jsx(n.code,{children:"--s2a-"}),`) in the
`,e.jsx(n.strong,{children:e.jsx(n.code,{children:"@adobecom/s2a-tokens"})}),` package. There are two ways to consume them — pick based
on whether your project can authenticate to GitHub Packages.`]}),`
`,e.jsx(n.h2,{id:"do-i-need-a-token",children:"Do I need a token?"}),`
`,e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{align:"left",children:"Path"}),e.jsx("th",{align:"left",children:"Token required?"}),e.jsx("th",{align:"left",children:"Why"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("strong",{children:"npm (GitHub Packages)"})}),e.jsxs("td",{children:[e.jsx("strong",{children:"Yes"})," — a ",e.jsx("code",{children:"read:packages"})," token"]}),e.jsxs("td",{children:["GitHub's npm registry requires auth ",e.jsx("strong",{children:"even for public packages"})," — a documented GitHub limitation."]})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("strong",{children:"Registry-free (fetch by URL)"})}),e.jsx("td",{children:e.jsx("strong",{children:"No"})}),e.jsxs("td",{children:[e.jsx("code",{children:"adobecom/consonant"})," is a public repo, so the release manifest and tarball are fetchable anonymously."]})]})]})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"option-a--npm-github-packages",children:"Option A — npm (GitHub Packages)"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"1. Create a token"})," — a classic PAT with the ",e.jsx(n.code,{children:"read:packages"})," scope."]}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Shortcut:"})," ",e.jsx(n.a,{href:"https://github.com/settings/tokens/new?scopes=read:packages&description=s2a-tokens",rel:"nofollow",children:"this link"}),`
opens the classic-token page with the scope pre-checked and the token pre-named.`]}),`
`]}),`
`,e.jsx(n.p,{children:"Click-by-click:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["GitHub → avatar → ",e.jsx(n.strong,{children:"Settings"})," → ",e.jsx(n.strong,{children:"Developer settings"})," (bottom of sidebar)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Personal access tokens → Tokens (classic)"})," → ",e.jsx(n.strong,{children:"Generate new token (classic)"})]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Note:"})," ",e.jsx(n.code,{children:"s2a-tokens read"}),". ",e.jsx(n.strong,{children:"Expiration:"})," 90 days (",e.jsx(n.code,{children:"adobecom"})," caps lifetime at 366 days)."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Scopes:"})," check ",e.jsx(n.strong,{children:e.jsx(n.code,{children:"read:packages"})})," only — that's the whole requirement."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Generate token"}),", then ",e.jsx(n.strong,{children:"copy it now"})," (shown once, starts with ",e.jsx(n.code,{children:"ghp_"}),")."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"⚠️ Authorize SSO — the step people miss:"}),` on the tokens list, click
`,e.jsx(n.strong,{children:"Configure SSO"})," next to your token and ",e.jsx(n.strong,{children:"Authorize"})," it for ",e.jsx(n.strong,{children:e.jsx(n.code,{children:"adobecom"})}),`.
Skip this and the token returns `,e.jsx(n.strong,{children:"401"})," on an org package even with the right scope."]}),`
`]}),`
`,e.jsxs(n.p,{children:[`A PAT is browser-only and shown once — you have to create it yourself; no agent can
mint one. If that's a blocker, `,e.jsx(n.strong,{children:"Option B below needs no token at all"}),`. In GitHub
Actions CI, the built-in `,e.jsx(n.code,{children:"GITHUB_TOKEN"})," already has package read, so no PAT is needed there."]}),`
`,e.jsxs(n.p,{children:[e.jsxs(n.strong,{children:["2. Point the ",e.jsx(n.code,{children:"@adobecom"})," scope at GitHub Packages"]})," in your project's ",e.jsx(n.code,{children:".npmrc"}),":"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ini",children:`@adobecom:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"3. Install:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`npm install @adobecom/s2a-tokens
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"4. Import the CSS"})," — the consolidated bundle, or just the layers you need:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-js",children:`import '@adobecom/s2a-tokens';                          // all layers, minified
// …or individually:
import '@adobecom/s2a-tokens/css/tokens.primitives.css';
import '@adobecom/s2a-tokens/css/tokens.semantic.css';
import '@adobecom/s2a-tokens/css/tokens.semantic.light.css';
import '@adobecom/s2a-tokens/css/tokens.semantic.dark.css';
import '@adobecom/s2a-tokens/css/tokens.responsive.xl.css'; // + .lg / .md / .sm
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"5. Use the tokens:"})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-css",children:`.card {
  background: var(--s2a-color-background-default);
  color: var(--s2a-color-content-default);
  padding: var(--s2a-spacing-md);
  border-radius: var(--s2a-border-radius-sm);
}
`})}),`
`,e.jsxs(n.p,{children:["Light/dark is a variable mode — set ",e.jsx(n.code,{children:'data-theme="light"'})," or ",e.jsx(n.code,{children:'data-theme="dark"'}),` on a
root element and the semantic tokens re-resolve (no separate stylesheet swap).`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"option-b--registry-free-no-token",children:"Option B — Registry-free (no token)"}),`
`,e.jsxs(n.p,{children:[`For consumers that can't authenticate, or that load assets at runtime with no build
step, consume the release `,e.jsx(n.strong,{children:"manifest"})," and ",e.jsx(n.strong,{children:"tarball"})," directly — no ",e.jsx(n.code,{children:".npmrc"}),`, no
registry config, no token.`]}),`
`,e.jsx(n.p,{children:"The manifest always points at the latest release:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`https://raw.githubusercontent.com/adobecom/consonant/main/releases/latest.json
`})}),`
`,e.jsxs(n.p,{children:["It contains the version, the tarball URL, a ",e.jsx(n.code,{children:"sha256"}),` integrity hash, the CSS file
list, and the `,e.jsx(n.code,{children:"--s2a-"}),` prefix. To pin a specific version, use
`,e.jsx(n.code,{children:"releases/<version>/manifest.json"})," instead of ",e.jsx(n.code,{children:"latest.json"}),"."]}),`
`,e.jsx(n.p,{children:`Both paths serve the exact same tokens from the same release — Option B just skips
the registry.`})]})}function h(s={}){const{wrapper:n}={...o(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(t,{...s})}):t(s)}export{h as default};
