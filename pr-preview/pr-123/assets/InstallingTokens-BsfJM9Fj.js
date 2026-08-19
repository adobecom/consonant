import{j as e,M as o}from"./blocks-UBj0x1h7.js";import{useMDXComponents as r}from"./index-DOrSMEl2.js";import"./preload-helper-FNQQAYUb.js";import"./_commonjsHelpers-CqkleIqs.js";import"./iframe-DxmRE__P.js";function t(s){const n={code:"code",h1:"h1",h2:"h2",hr:"hr",p:"p",pre:"pre",strong:"strong",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(o,{title:"Getting Started/Installing Tokens"}),`
`,e.jsx(n.h1,{id:"installing-s2a-tokens",children:"Installing S2A Tokens"}),`
`,e.jsxs(n.p,{children:["The S2A design tokens ship as CSS custom properties (prefix ",e.jsx(n.code,{children:"--s2a-"}),`) in the
`,e.jsx(n.strong,{children:e.jsx(n.code,{children:"@adobecom/s2a-tokens"})}),` package. There are two ways to consume them — pick based
on whether your project can authenticate to GitHub Packages.`]}),`
`,e.jsx(n.h2,{id:"do-i-need-a-token",children:"Do I need a token?"}),`
`,e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{align:"left",children:"Path"}),e.jsx("th",{align:"left",children:"Token required?"}),e.jsx("th",{align:"left",children:"Why"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("strong",{children:"npm (GitHub Packages)"})}),e.jsxs("td",{children:[e.jsx("strong",{children:"Yes"})," — a ",e.jsx("code",{children:"read:packages"})," token"]}),e.jsxs("td",{children:["GitHub's npm registry requires auth ",e.jsx("strong",{children:"even for public packages"})," — a documented GitHub limitation."]})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("strong",{children:"Registry-free (fetch by URL)"})}),e.jsx("td",{children:e.jsx("strong",{children:"No"})}),e.jsxs("td",{children:[e.jsx("code",{children:"adobecom/consonant"})," is a public repo, so the release manifest and tarball are fetchable anonymously."]})]})]})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"option-a--npm-github-packages",children:"Option A — npm (GitHub Packages)"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"1. Create a token"})," — a classic PAT with the ",e.jsx(n.code,{children:"read:packages"}),` scope (for an org
repo you may need to authorize it for `,e.jsx(n.code,{children:"adobecom"}),` via SSO). In GitHub Actions CI,
the built-in `,e.jsx(n.code,{children:"GITHUB_TOKEN"})," already has package read, so no PAT is needed there."]}),`
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
the registry.`})]})}function h(s={}){const{wrapper:n}={...r(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(t,{...s})}):t(s)}export{h as default};
