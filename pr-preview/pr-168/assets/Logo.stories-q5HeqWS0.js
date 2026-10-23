import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{n as r,t as i}from"./logo-vkvD3mB-.js";function a(){return(a=e((()=>{r()})))()}var o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{n(),a(),o={title:`Atoms/Logo`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`centered`,docs:{description:{component:"\nAdobe logo atom — Figma component set `2956:2421`.\n\nThree versions: **default** (wordmark, 67×22), **legacy** (lockup, 50×24), and\n**abbreviated** (A-mark, 24×24). The mark is a single `currentColor` path; the\ncontext axis drives the same color tokens Figma binds per variant\n(`content/default` ↔ `content/knockout`, and the transparent primitives for legacy).\n        "},source:{language:`html`,code:`<span class="c-logo" data-version="default" role="img" aria-label="Adobe">
  <svg><!-- mark --></svg>
</span>`}}},argTypes:{version:{control:`radio`,options:[`default`,`legacy`,`abbreviated`]},label:{control:`text`,description:`Accessible name`}},args:{version:`default`,label:`Adobe`}},s=e=>t`
  <div
    data-theme="dark"
    style="
      padding: var(--s2a-spacing-lg) var(--s2a-spacing-xl);
      background: var(--s2a-color-background-default);
      border-radius: var(--s2a-border-radius-xs);
    "
  >
    ${e}
  </div>
`,c={},l={args:{version:`abbreviated`}},u={args:{version:`legacy`}},d={render:e=>s(i(e))},f={parameters:{controls:{disable:!0}},render:()=>t`
    <div style="display: grid; gap: var(--s2a-spacing-lg); justify-items: start;">
      <div style="display: flex; gap: var(--s2a-spacing-xl); align-items: center;">
        ${i({version:`default`})} ${i({version:`legacy`})}
        ${i({version:`abbreviated`})}
      </div>
      ${s(t`<div style="display: flex; gap: var(--s2a-spacing-xl); align-items: center;">
          ${i({version:`default`})}
          ${i({version:`legacy`})}
          ${i({version:`abbreviated`})}
        </div>`)}
    </div>
  `},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    version: "abbreviated"
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    version: "legacy"
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => darkSurface(Logo(args))
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  parameters: {
    controls: {
      disable: true
    }
  },
  render: () => html\`
    <div style="display: grid; gap: var(--s2a-spacing-lg); justify-items: start;">
      <div style="display: flex; gap: var(--s2a-spacing-xl); align-items: center;">
        \${Logo({
    version: "default"
  })} \${Logo({
    version: "legacy"
  })}
        \${Logo({
    version: "abbreviated"
  })}
      </div>
      \${darkSurface(html\`<div style="display: flex; gap: var(--s2a-spacing-xl); align-items: center;">
          \${Logo({
    version: "default"
  })}
          \${Logo({
    version: "legacy"
  })}
          \${Logo({
    version: "abbreviated"
  })}
        </div>\`)}
    </div>
  \`
}`,...f.parameters?.docs?.source}}},p=[`Default`,`Abbreviated`,`Legacy`,`OnDark`,`AllVersions`]})))()}m();export{l as Abbreviated,f as AllVersions,c as Default,u as Legacy,d as OnDark,p as __namedExportsOrder,o as default};