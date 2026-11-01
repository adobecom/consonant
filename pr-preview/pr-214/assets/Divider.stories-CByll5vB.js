import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";var r,i;function a(){return(a=e((()=>{n(),r=[`default`,`subtle`,`knockout`,`inverse`,`subtle-inverse`],i=({style:e=`default`}={})=>{let n=r.includes(e)?e:`default`;return t`<hr class="c-divider" data-style="${n}" role="separator" />`}})))()}function o(){return(o=e((()=>{a()})))()}var s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{n(),o(),s={title:`Atoms/Divider`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`centered`,docs:{description:{component:"\n1px horizontal rule separating content regions. The `style` prop follows the\nsurface the divider sits on — `default`/`subtle` for light surfaces,\n`knockout`/`inverse`/`subtle-inverse` for dark or media surfaces.\n\nMatches Figma component set `Divider` (5 Style variants), all fills token-bound.\n        "},source:{language:`html`,code:`<hr class="c-divider" data-style="default" role="separator" />`}}},argTypes:{style:{control:{type:`select`},options:[`default`,`subtle`,`knockout`,`inverse`,`subtle-inverse`],description:`Divider color for the surface context`}},args:{style:`default`}},c=e=>t`
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
`,l=e=>t`
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
`,u={args:{style:`default`},render:e=>c(i(e))},d={args:{style:`subtle`},render:e=>c(i(e))},f={args:{style:`knockout`},render:e=>c(i(e))},p={args:{style:`inverse`},render:e=>l(i(e))},m={name:`Subtle Inverse`,args:{style:`subtle-inverse`},render:e=>l(i(e))},h={name:`All styles`,render:()=>t`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${c(t`
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${i({style:`default`})} ${i({style:`subtle`})}
          ${i({style:`knockout`})}
        </div>
      `)}
      ${l(t`
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${i({style:`inverse`})} ${i({style:`subtle-inverse`})}
        </div>
      `)}
    </div>
  `},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    style: "default"
  },
  render: args => lightSurface(Divider(args))
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    style: "subtle"
  },
  render: args => lightSurface(Divider(args))
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    style: "knockout"
  },
  render: args => lightSurface(Divider(args))
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    style: "inverse"
  },
  render: args => darkSurface(Divider(args))
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "Subtle Inverse",
  args: {
    style: "subtle-inverse"
  },
  render: args => darkSurface(Divider(args))
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g=[`Default`,`Subtle`,`Knockout`,`Inverse`,`SubtleInverse`,`AllStyles`]})))()}_();export{h as AllStyles,u as Default,p as Inverse,f as Knockout,d as Subtle,m as SubtleInverse,g as __namedExportsOrder,s as default};