import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{A as t,M as n,a as r,j as i,o as a}from"./blocks-Tcp3Gf0s.js";function o(e){let t={a:`a`,blockquote:`blockquote`,code:`code`,h1:`h1`,h2:`h2`,hr:`hr`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,strong:`strong`,...i(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(r,{title:`Getting Started/Installing Tokens`}),`
`,(0,c.jsx)(t.h1,{id:`installing-s2a-tokens`,children:`Installing S2A Tokens`}),`
`,(0,c.jsxs)(t.p,{children:[`The S2A design tokens ship as CSS custom properties (prefix `,(0,c.jsx)(t.code,{children:`--s2a-`}),`) in the
`,(0,c.jsx)(t.strong,{children:(0,c.jsx)(t.code,{children:`@adobecom/s2a-tokens`})}),` package. There are two ways to consume them — pick based
on whether your project can authenticate to GitHub Packages.`]}),`
`,(0,c.jsx)(t.h2,{id:`do-i-need-a-token`,children:`Do I need a token?`}),`
`,(0,c.jsxs)(`table`,{children:[(0,c.jsx)(`thead`,{children:(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`th`,{align:`left`,children:`Path`}),(0,c.jsx)(`th`,{align:`left`,children:`Token required?`}),(0,c.jsx)(`th`,{align:`left`,children:`Why`})]})}),(0,c.jsxs)(`tbody`,{children:[(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(`strong`,{children:`npm (GitHub Packages)`})}),(0,c.jsxs)(`td`,{children:[(0,c.jsx)(`strong`,{children:`Yes`}),` — a `,(0,c.jsx)(`code`,{children:`read:packages`}),` token`]}),(0,c.jsxs)(`td`,{children:[`GitHub's npm registry requires auth `,(0,c.jsx)(`strong`,{children:`even for public packages`}),` — a documented GitHub limitation.`]})]}),(0,c.jsxs)(`tr`,{children:[(0,c.jsx)(`td`,{children:(0,c.jsx)(`strong`,{children:`Registry-free (fetch by URL)`})}),(0,c.jsx)(`td`,{children:(0,c.jsx)(`strong`,{children:`No`})}),(0,c.jsxs)(`td`,{children:[(0,c.jsx)(`code`,{children:`adobecom/consonant`}),` is a public repo, so the release manifest and tarball are fetchable anonymously.`]})]})]})]}),`
`,(0,c.jsx)(t.hr,{}),`
`,(0,c.jsx)(t.h2,{id:`option-a--npm-github-packages`,children:`Option A — npm (GitHub Packages)`}),`
`,(0,c.jsxs)(t.p,{children:[(0,c.jsx)(t.strong,{children:`1. Create a token`}),` — a classic PAT with the `,(0,c.jsx)(t.code,{children:`read:packages`}),` scope.`]}),`
`,(0,c.jsxs)(t.blockquote,{children:[`
`,(0,c.jsxs)(t.p,{children:[(0,c.jsx)(t.strong,{children:`Shortcut:`}),` `,(0,c.jsx)(t.a,{href:`https://github.com/settings/tokens/new?scopes=read:packages&description=s2a-tokens`,rel:`nofollow`,children:`this link`}),`
opens the classic-token page with the scope pre-checked and the token pre-named.`]}),`
`]}),`
`,(0,c.jsx)(t.p,{children:`Click-by-click:`}),`
`,(0,c.jsxs)(t.ol,{children:[`
`,(0,c.jsxs)(t.li,{children:[`GitHub → avatar → `,(0,c.jsx)(t.strong,{children:`Settings`}),` → `,(0,c.jsx)(t.strong,{children:`Developer settings`}),` (bottom of sidebar)`]}),`
`,(0,c.jsxs)(t.li,{children:[(0,c.jsx)(t.strong,{children:`Personal access tokens → Tokens (classic)`}),` → `,(0,c.jsx)(t.strong,{children:`Generate new token (classic)`})]}),`
`,(0,c.jsxs)(t.li,{children:[(0,c.jsx)(t.strong,{children:`Note:`}),` `,(0,c.jsx)(t.code,{children:`s2a-tokens read`}),`. `,(0,c.jsx)(t.strong,{children:`Expiration:`}),` 90 days (`,(0,c.jsx)(t.code,{children:`adobecom`}),` caps lifetime at 366 days).`]}),`
`,(0,c.jsxs)(t.li,{children:[(0,c.jsx)(t.strong,{children:`Scopes:`}),` check `,(0,c.jsx)(t.strong,{children:(0,c.jsx)(t.code,{children:`read:packages`})}),` only — that's the whole requirement.`]}),`
`,(0,c.jsxs)(t.li,{children:[(0,c.jsx)(t.strong,{children:`Generate token`}),`, then `,(0,c.jsx)(t.strong,{children:`copy it now`}),` (shown once, starts with `,(0,c.jsx)(t.code,{children:`ghp_`}),`).`]}),`
`,(0,c.jsxs)(t.li,{children:[(0,c.jsx)(t.strong,{children:`⚠️ Authorize SSO — the step people miss:`}),` on the tokens list, click
`,(0,c.jsx)(t.strong,{children:`Configure SSO`}),` next to your token and `,(0,c.jsx)(t.strong,{children:`Authorize`}),` it for `,(0,c.jsx)(t.strong,{children:(0,c.jsx)(t.code,{children:`adobecom`})}),`.
Skip this and the token returns `,(0,c.jsx)(t.strong,{children:`401`}),` on an org package even with the right scope.`]}),`
`]}),`
`,(0,c.jsxs)(t.p,{children:[`A PAT is browser-only and shown once — you have to create it yourself; no agent can
mint one. If that's a blocker, `,(0,c.jsx)(t.strong,{children:`Option B below needs no token at all`}),`. In GitHub
Actions CI, the built-in `,(0,c.jsx)(t.code,{children:`GITHUB_TOKEN`}),` already has package read, so no PAT is needed there.`]}),`
`,(0,c.jsxs)(t.p,{children:[(0,c.jsxs)(t.strong,{children:[`2. Point the `,(0,c.jsx)(t.code,{children:`@adobecom`}),` scope at GitHub Packages`]}),` in your project's `,(0,c.jsx)(t.code,{children:`.npmrc`}),`:`]}),`
`,(0,c.jsx)(t.pre,{children:(0,c.jsx)(t.code,{className:`language-ini`,children:`@adobecom:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}
`})}),`
`,(0,c.jsx)(t.p,{children:(0,c.jsx)(t.strong,{children:`3. Install:`})}),`
`,(0,c.jsx)(t.pre,{children:(0,c.jsx)(t.code,{className:`language-bash`,children:`npm install @adobecom/s2a-tokens
`})}),`
`,(0,c.jsxs)(t.p,{children:[(0,c.jsx)(t.strong,{children:`4. Import the CSS`}),` — the consolidated bundle, or just the layers you need:`]}),`
`,(0,c.jsx)(t.pre,{children:(0,c.jsx)(t.code,{className:`language-js`,children:`import '@adobecom/s2a-tokens';                          // all layers, minified
// …or individually:
import '@adobecom/s2a-tokens/css/tokens.primitives.css';
import '@adobecom/s2a-tokens/css/tokens.semantic.css';
import '@adobecom/s2a-tokens/css/tokens.semantic.light.css';
import '@adobecom/s2a-tokens/css/tokens.semantic.dark.css';
import '@adobecom/s2a-tokens/css/tokens.responsive.xl.css'; // + .lg / .md / .sm
`})}),`
`,(0,c.jsx)(t.p,{children:(0,c.jsx)(t.strong,{children:`5. Use the tokens:`})}),`
`,(0,c.jsx)(t.pre,{children:(0,c.jsx)(t.code,{className:`language-css`,children:`.card {
  background: var(--s2a-color-background-default);
  color: var(--s2a-color-content-default);
  padding: var(--s2a-spacing-md);
  border-radius: var(--s2a-border-radius-sm);
}
`})}),`
`,(0,c.jsxs)(t.p,{children:[`Light/dark is a variable mode — set `,(0,c.jsx)(t.code,{children:`data-theme="light"`}),` or `,(0,c.jsx)(t.code,{children:`data-theme="dark"`}),` on a
root element and the semantic tokens re-resolve (no separate stylesheet swap).`]}),`
`,(0,c.jsx)(t.hr,{}),`
`,(0,c.jsx)(t.h2,{id:`option-b--registry-free-no-token`,children:`Option B — Registry-free (no token)`}),`
`,(0,c.jsxs)(t.p,{children:[`For consumers that can't authenticate, or that load assets at runtime with no build
step, consume the release `,(0,c.jsx)(t.strong,{children:`manifest`}),` and `,(0,c.jsx)(t.strong,{children:`tarball`}),` directly — no `,(0,c.jsx)(t.code,{children:`.npmrc`}),`, no
registry config, no token.`]}),`
`,(0,c.jsx)(t.p,{children:`The manifest always points at the latest release:`}),`
`,(0,c.jsx)(t.pre,{children:(0,c.jsx)(t.code,{children:`https://raw.githubusercontent.com/adobecom/consonant/main/releases/latest.json
`})}),`
`,(0,c.jsxs)(t.p,{children:[`It contains the version, the tarball URL, a `,(0,c.jsx)(t.code,{children:`sha256`}),` integrity hash, the CSS file
list, and the `,(0,c.jsx)(t.code,{children:`--s2a-`}),` prefix. To pin a specific version, use
`,(0,c.jsx)(t.code,{children:`releases/<version>/manifest.json`}),` instead of `,(0,c.jsx)(t.code,{children:`latest.json`}),`.`]}),`
`,(0,c.jsx)(t.p,{children:`Both paths serve the exact same tokens from the same release — Option B just skips
the registry.`})]})}function s(e={}){let{wrapper:t}={...i(),...e.components};return t?(0,c.jsx)(t,{...e,children:(0,c.jsx)(o,{...e})}):o(e)}var c;function l(){return(l=e((()=>{c=n(),t(),a()})))()}l();export{s as default};