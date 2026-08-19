import{E as s,x as o}from"./iframe-D6qohOKV.js";import"./preload-helper-BSds_FOV.js";const t=({text:r="Label",for:l=""}={})=>o`
    <label class="c-label" for=${l||s}>${r}</label>
  `,i={title:"Atoms/Label",tags:["autodocs"],render:r=>t(r),parameters:{layout:"centered",docs:{description:{component:"\nForm field label atom. Renders a native `<label>` element in body-md type on\n`content/default`, associated with its control via the `for` prop.\n\nMatches Figma component `Label` (node 10559:113852).\n        "},source:{language:"html",code:'<label class="c-label" for="email">Email address</label>'}}},argTypes:{text:{control:"text",description:"Label text content"},for:{control:"text",description:"id of the associated form control"}},args:{text:"Label",for:""}},e={},a={name:"Paired with a control",render:()=>o`
    <div style="display: flex; flex-direction: column; gap: 8px; width: 280px;">
      ${t({text:"Email address",for:"sb-label-demo-input"})}
      <input
        id="sb-label-demo-input"
        type="email"
        placeholder="you@example.com"
        style="
          padding: 12px 16px;
          font: inherit;
          border: 1px solid var(--s2a-color-border-subtle, #dadada);
          border-radius: var(--s2a-border-radius-sm, 12px);
        "
      />
    </div>
  `};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: "Paired with a control",
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: 8px; width: 280px;">
      \${Label({
    text: "Email address",
    for: "sb-label-demo-input"
  })}
      <input
        id="sb-label-demo-input"
        type="email"
        placeholder="you@example.com"
        style="
          padding: 12px 16px;
          font: inherit;
          border: 1px solid var(--s2a-color-border-subtle, #dadada);
          border-radius: var(--s2a-border-radius-sm, 12px);
        "
      />
    </div>
  \`
}`,...a.parameters?.docs?.source}}};const c=["Default","WithControl"];export{e as Default,a as WithControl,c as __namedExportsOrder,i as default};
