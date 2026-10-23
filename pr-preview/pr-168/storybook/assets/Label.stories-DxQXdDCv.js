import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";var i;function a(){return(a=e((()=>{r(),i=({text:e=`Label`,for:r=``}={})=>t`
    <label class="c-label" for=${r||n}>${e}</label>
  `})))()}function o(){return(o=e((()=>{a()})))()}var s,c,l,u;function d(){return(d=e((()=>{r(),o(),s={title:`Atoms/Label`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`centered`,docs:{description:{component:"\nForm field label atom. Renders a native `<label>` element in body-md type on\n`content/default`, associated with its control via the `for` prop.\n\nMatches Figma component `Label` (node 10559:113852).\n        "},source:{language:`html`,code:`<label class="c-label" for="email">Email address</label>`}}},argTypes:{text:{control:`text`,description:`Label text content`},for:{control:`text`,description:`id of the associated form control`}},args:{text:`Label`,for:``}},c={},l={name:`Paired with a control`,render:()=>t`
    <div style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xs); width: 280px;">
      ${i({text:`Email address`,for:`sb-label-demo-input`})}
      <input
        id="sb-label-demo-input"
        type="email"
        placeholder="you@example.com"
        style="
          padding: var(--s2a-spacing-sm) var(--s2a-spacing-md);
          font: inherit;
          border: var(--s2a-border-width-sm) solid var(--s2a-color-border-subtle);
          border-radius: var(--s2a-border-radius-sm);
        "
      />
    </div>
  `},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "Paired with a control",
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xs); width: 280px;">
      \${Label({
    text: "Email address",
    for: "sb-label-demo-input"
  })}
      <input
        id="sb-label-demo-input"
        type="email"
        placeholder="you@example.com"
        style="
          padding: var(--s2a-spacing-sm) var(--s2a-spacing-md);
          font: inherit;
          border: var(--s2a-border-width-sm) solid var(--s2a-color-border-subtle);
          border-radius: var(--s2a-border-radius-sm);
        "
      />
    </div>
  \`
}`,...l.parameters?.docs?.source}}},u=[`Default`,`WithControl`]})))()}d();export{c as Default,l as WithControl,u as __namedExportsOrder,s as default};