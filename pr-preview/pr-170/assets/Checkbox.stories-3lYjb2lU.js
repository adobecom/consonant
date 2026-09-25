import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";var i;function a(){return(a=e((()=>{r(),i=({label:e=`Label`,checked:r=!1,disabled:i=!1,tile:a=!1,icon:o=null,name:s=void 0,value:c=void 0}={})=>n`
  <label
    class="c-checkbox"
    data-tile=${a?``:t}
    data-disabled=${i?``:t}
  >
    <input
      class="c-checkbox__input"
      type="checkbox"
      name=${s??t}
      value=${c??t}
      ?checked=${r}
      ?disabled=${i}
    />
    <span class="c-checkbox__box" aria-hidden="true">
      <svg class="c-checkbox__check" viewBox="0 0 16 16" fill="none">
        <path
          d="M3.5 8.5L6.5 11.5L12.5 4.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="c-checkbox__label">${e}</span>
    ${a&&o?n`<span class="c-checkbox__icon">${o}</span>`:t}
  </label>
`})))()}function o(){return(o=e((()=>{a()})))()}var s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{r(),o(),s={title:`Atoms/Checkbox`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`centered`,docs:{description:{component:'\nBinary selection control, 1:1 with the Figma **Checkbox** set (10559:113870).\n\nThe 20×20 box is monochrome `content/default` in both states — it flips\nautomatically with the page theme mode. A real `<input type="checkbox">`\n(visually hidden) carries the state, so keyboard and screen-reader semantics\nare native. `tile` reproduces the **CheckboxTile** chrome: a full-width\nbordered row on `background/default` with `border/subtle`.\n        '},source:{language:`html`,code:`<label class="c-checkbox">
  <input class="c-checkbox__input" type="checkbox" />
  <span class="c-checkbox__box" aria-hidden="true">…</span>
  <span class="c-checkbox__label">Label</span>
</label>`}}},argTypes:{label:{control:`text`,description:`Visible label text`},checked:{control:`boolean`,description:`Checked state`},disabled:{control:`boolean`,description:`Disabled state`},tile:{control:`boolean`,description:`CheckboxTile chrome (bordered row)`}},args:{label:`Label`,checked:!1,disabled:!1,tile:!1}},c={},l={args:{checked:!0}},u={args:{disabled:!0}},d={args:{disabled:!0,checked:!0}},f={args:{tile:!0,label:`Photography`},render:e=>n`<div style="width: 410px;">${i(e)}</div>`},p={args:{tile:!0,checked:!0,label:`Photography`},render:e=>n`<div style="width: 410px;">${i(e)}</div>`},m={render:()=>n`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${i({label:`Creative Cloud`,checked:!0,name:`apps`,value:`cc`})}
      ${i({label:`Photoshop`,name:`apps`,value:`ps`})}
      ${i({label:`Lightroom`,name:`apps`,value:`lr`})}
      ${i({label:`Illustrator (unavailable)`,disabled:!0,name:`apps`,value:`ai`})}
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
  args: {
    tile: true,
    label: "Photography"
  },
  render: args => html\`<div style="width: 410px;">\${Checkbox(args)}</div>\`
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tile: true,
    checked: true,
    label: "Photography"
  },
  render: args => html\`<div style="width: 410px;">\${Checkbox(args)}</div>\`
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      \${Checkbox({
    label: "Creative Cloud",
    checked: true,
    name: "apps",
    value: "cc"
  })}
      \${Checkbox({
    label: "Photoshop",
    name: "apps",
    value: "ps"
  })}
      \${Checkbox({
    label: "Lightroom",
    name: "apps",
    value: "lr"
  })}
      \${Checkbox({
    label: "Illustrator (unavailable)",
    disabled: true,
    name: "apps",
    value: "ai"
  })}
    </div>
  \`
}`,...m.parameters?.docs?.source}}},h=[`Unchecked`,`Checked`,`Disabled`,`DisabledChecked`,`Tile`,`TileChecked`,`Group`]})))()}g();export{l as Checked,u as Disabled,d as DisabledChecked,m as Group,f as Tile,p as TileChecked,c as Unchecked,h as __namedExportsOrder,s as default};