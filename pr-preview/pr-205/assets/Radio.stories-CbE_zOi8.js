import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";var i;function a(){return(a=e((()=>{r(),i=({label:e=`Individuals`,checked:r=!1,disabled:i=!1,name:a=`radio-group`,value:o=void 0}={})=>n`
  <label class="c-radio" data-disabled=${i?``:t}>
    <input
      class="c-radio__input"
      type="radio"
      name=${a??t}
      value=${o??t}
      ?checked=${r}
      ?disabled=${i}
    />
    <span class="c-radio__control" aria-hidden="true"></span>
    <span class="c-radio__label">${e}</span>
  </label>
`})))()}function o(){return(o=e((()=>{a()})))()}var s,c,l,u,d,f,p;function m(){return(m=e((()=>{r(),o(),s={title:`Atoms/Radio`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`centered`,docs:{description:{component:'\nSingle-choice selection control, 1:1 with the Figma **Radio** set (11586:206620) —\nSelected × State (default / hover / focus / disabled).\n\nAnatomy follows the Figma layers: an 18×18 `content/default` ring with an 8×8\ndot when selected, a `background/subtle` hover halo, and a\n`focus-ring/default` focus ring. The label promotes from `content/subtle`\nto `content/default` when selected — that color shift is part of the spec.\nA real `<input type="radio">` carries state, so arrow-key group navigation\nis native: give radios the same `name`.\n        '},source:{language:`html`,code:`<label class="c-radio">
  <input class="c-radio__input" type="radio" name="plan" />
  <span class="c-radio__control" aria-hidden="true"></span>
  <span class="c-radio__label">Individuals</span>
</label>`}}},argTypes:{label:{control:`text`,description:`Visible label text`},checked:{control:`boolean`,description:`Selected state`},disabled:{control:`boolean`,description:`Disabled state`},name:{control:`text`,description:`Radio group name`}},args:{label:`Individuals`,checked:!1,disabled:!1,name:`radio-demo`}},c={},l={args:{checked:!0}},u={args:{disabled:!0}},d={args:{disabled:!0,checked:!0}},f={render:()=>n`
    <div style="display: flex; gap: 24px;" role="radiogroup" aria-label="Audience">
      ${i({label:`Individuals`,checked:!0,name:`audience`,value:`individuals`})}
      ${i({label:`Business`,name:`audience`,value:`business`})}
      ${i({label:`Students & teachers`,name:`audience`,value:`edu`})}
      ${i({label:`Government`,disabled:!0,name:`audience`,value:`gov`})}
    </div>
  `},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    checked: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    checked: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p=[`Unselected`,`Selected`,`Disabled`,`DisabledSelected`,`Group`]})))()}m();export{u as Disabled,d as DisabledSelected,f as Group,l as Selected,c as Unselected,p as __namedExportsOrder,s as default};