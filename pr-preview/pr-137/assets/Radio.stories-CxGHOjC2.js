import{E as t,x as i}from"./iframe-Jwfh8MPX.js";import"./preload-helper-BU6q58kX.js";const e=({label:o="Individuals",checked:c=!1,disabled:l=!1,name:u="radio-group",value:p=void 0}={})=>i`
  <label class="c-radio" data-disabled=${l?"":t}>
    <input
      class="c-radio__input"
      type="radio"
      name=${u??t}
      value=${p??t}
      ?checked=${c}
      ?disabled=${l}
    />
    <span class="c-radio__control" aria-hidden="true"></span>
    <span class="c-radio__label">${o}</span>
  </label>
`,g={title:"Atoms/Radio",tags:["autodocs"],render:o=>e(o),parameters:{layout:"centered",docs:{description:{component:'\nSingle-choice selection control, 1:1 with the Figma **Radio** set (11586:206620) —\nSelected × State (default / hover / focus / disabled).\n\nAnatomy follows the Figma layers: an 18×18 `content/default` ring with an 8×8\ndot when selected, a `background/subtle` hover halo, and a\n`focus-ring/default` focus ring. The label promotes from `content/subtle`\nto `content/default` when selected — that color shift is part of the spec.\nA real `<input type="radio">` carries state, so arrow-key group navigation\nis native: give radios the same `name`.\n        '},source:{language:"html",code:`<label class="c-radio">
  <input class="c-radio__input" type="radio" name="plan" />
  <span class="c-radio__control" aria-hidden="true"></span>
  <span class="c-radio__label">Individuals</span>
</label>`}}},argTypes:{label:{control:"text",description:"Visible label text"},checked:{control:"boolean",description:"Selected state"},disabled:{control:"boolean",description:"Disabled state"},name:{control:"text",description:"Radio group name"}},args:{label:"Individuals",checked:!1,disabled:!1,name:"radio-demo"}},a={},s={args:{checked:!0}},r={args:{disabled:!0}},n={args:{disabled:!0,checked:!0}},d={render:()=>i`
    <div style="display: flex; gap: 24px;" role="radiogroup" aria-label="Audience">
      ${e({label:"Individuals",checked:!0,name:"audience",value:"individuals"})}
      ${e({label:"Business",name:"audience",value:"business"})}
      ${e({label:"Students & teachers",name:"audience",value:"edu"})}
      ${e({label:"Government",disabled:!0,name:"audience",value:"gov"})}
    </div>
  `};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    checked: true
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    checked: true
  }
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: 24px;" role="radiogroup" aria-label="Audience">
      \${Radio({
    label: "Individuals",
    checked: true,
    name: "audience",
    value: "individuals"
  })}
      \${Radio({
    label: "Business",
    name: "audience",
    value: "business"
  })}
      \${Radio({
    label: "Students & teachers",
    name: "audience",
    value: "edu"
  })}
      \${Radio({
    label: "Government",
    disabled: true,
    name: "audience",
    value: "gov"
  })}
    </div>
  \`
}`,...d.parameters?.docs?.source}}};const h=["Unselected","Selected","Disabled","DisabledSelected","Group"];export{r as Disabled,n as DisabledSelected,d as Group,s as Selected,a as Unselected,h as __namedExportsOrder,g as default};
