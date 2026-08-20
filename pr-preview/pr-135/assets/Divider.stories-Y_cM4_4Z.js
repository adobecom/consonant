import{x as s}from"./iframe-Cu0bMW1j.js";import"./preload-helper-BZk2PG9u.js";const p=["default","subtle","knockout","inverse","subtle-inverse"],r=({style:e="default"}={})=>{const u=p.includes(e)?e:"default";return s`<hr class="c-divider" data-style="${u}" role="separator" />`},m={title:"Atoms/Divider",tags:["autodocs"],render:e=>r(e),parameters:{layout:"centered",docs:{description:{component:"\n1px horizontal rule separating content regions. The `style` prop follows the\nsurface the divider sits on — `default`/`subtle` for light surfaces,\n`knockout`/`inverse`/`subtle-inverse` for dark or media surfaces.\n\nMatches Figma component set `Divider` (5 Style variants), all fills token-bound.\n        "},source:{language:"html",code:'<hr class="c-divider" data-style="default" role="separator" />'}}},argTypes:{style:{control:{type:"select"},options:["default","subtle","knockout","inverse","subtle-inverse"],description:"Divider color for the surface context"}},args:{style:"default"}},i=e=>s`
  <div
    style="
      width: 320px;
      padding: var(--s2a-spacing-lg, 24px);
      background: var(--s2a-color-background-default);
      border: 1px solid var(--s2a-color-border-subtle);
      border-radius: var(--s2a-border-radius-xs, 8px);
    "
  >
    ${e}
  </div>
`,c=e=>s`
  <div
    style="
      width: 320px;
      padding: var(--s2a-spacing-lg, 24px);
      background: var(--s2a-color-background-knockout, #000);
      border-radius: var(--s2a-border-radius-xs, 8px);
    "
  >
    ${e}
  </div>
`,a={args:{style:"default"},render:e=>i(r(e))},t={args:{style:"subtle"},render:e=>i(r(e))},n={args:{style:"knockout"},render:e=>i(r(e))},o={args:{style:"inverse"},render:e=>c(r(e))},l={name:"Subtle Inverse",args:{style:"subtle-inverse"},render:e=>c(r(e))},d={name:"All styles",render:()=>s`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${i(s`
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${r({style:"default"})} ${r({style:"subtle"})}
          ${r({style:"knockout"})}
        </div>
      `)}
      ${c(s`
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${r({style:"inverse"})} ${r({style:"subtle-inverse"})}
        </div>
      `)}
    </div>
  `};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    style: "default"
  },
  render: args => lightSurface(Divider(args))
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    style: "subtle"
  },
  render: args => lightSurface(Divider(args))
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    style: "knockout"
  },
  render: args => lightSurface(Divider(args))
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    style: "inverse"
  },
  render: args => darkSurface(Divider(args))
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "Subtle Inverse",
  args: {
    style: "subtle-inverse"
  },
  render: args => darkSurface(Divider(args))
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "All styles",
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      \${lightSurface(html\`
        <div style="display: flex; flex-direction: column; gap: 16px;">
          \${Divider({
    style: "default"
  })} \${Divider({
    style: "subtle"
  })}
          \${Divider({
    style: "knockout"
  })}
        </div>
      \`)}
      \${darkSurface(html\`
        <div style="display: flex; flex-direction: column; gap: 16px;">
          \${Divider({
    style: "inverse"
  })} \${Divider({
    style: "subtle-inverse"
  })}
        </div>
      \`)}
    </div>
  \`
}`,...d.parameters?.docs?.source}}};const f=["Default","Subtle","Knockout","Inverse","SubtleInverse","AllStyles"];export{d as AllStyles,a as Default,o as Inverse,n as Knockout,t as Subtle,l as SubtleInverse,f as __namedExportsOrder,m as default};
