import{E as r,x as s}from"./iframe-Cu0bMW1j.js";import"./preload-helper-BZk2PG9u.js";const a=({label:e="Label",checked:b=!1,disabled:p=!1,tile:h=!1,icon:u=null,name:m=void 0,value:k=void 0}={})=>s`
  <label
    class="c-checkbox"
    data-tile=${h?"":r}
    data-disabled=${p?"":r}
  >
    <input
      class="c-checkbox__input"
      type="checkbox"
      name=${m??r}
      value=${k??r}
      ?checked=${b}
      ?disabled=${p}
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
    ${h&&u?s`<span class="c-checkbox__icon">${u}</span>`:r}
  </label>
`,v={title:"Atoms/Checkbox",tags:["autodocs"],render:e=>a(e),parameters:{layout:"centered",docs:{description:{component:'\nBinary selection control, 1:1 with the Figma **Checkbox** set (10559:113870).\n\nThe 20×20 box is monochrome `content/default` in both states — it flips\nautomatically with the page theme mode. A real `<input type="checkbox">`\n(visually hidden) carries the state, so keyboard and screen-reader semantics\nare native. `tile` reproduces the **CheckboxTile** chrome: a full-width\nbordered row on `background/default` with `border/subtle`.\n        '},source:{language:"html",code:`<label class="c-checkbox">
  <input class="c-checkbox__input" type="checkbox" />
  <span class="c-checkbox__box" aria-hidden="true">…</span>
  <span class="c-checkbox__label">Label</span>
</label>`}}},argTypes:{label:{control:"text",description:"Visible label text"},checked:{control:"boolean",description:"Checked state"},disabled:{control:"boolean",description:"Disabled state"},tile:{control:"boolean",description:"CheckboxTile chrome (bordered row)"}},args:{label:"Label",checked:!1,disabled:!1,tile:!1}},c={},o={args:{checked:!0}},t={args:{disabled:!0}},l={args:{disabled:!0,checked:!0}},n={args:{tile:!0,label:"Photography"},render:e=>s`<div style="width: 410px;">${a(e)}</div>`},d={args:{tile:!0,checked:!0,label:"Photography"},render:e=>s`<div style="width: 410px;">${a(e)}</div>`},i={render:()=>s`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${a({label:"Creative Cloud",checked:!0,name:"apps",value:"cc"})}
      ${a({label:"Photoshop",name:"apps",value:"ps"})}
      ${a({label:"Lightroom",name:"apps",value:"lr"})}
      ${a({label:"Illustrator (unavailable)",disabled:!0,name:"apps",value:"ai"})}
    </div>
  `};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:"{}",...c.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    checked: true
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...t.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    checked: true
  }
}`,...l.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    tile: true,
    label: "Photography"
  },
  render: args => html\`<div style="width: 410px;">\${Checkbox(args)}</div>\`
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tile: true,
    checked: true,
    label: "Photography"
  },
  render: args => html\`<div style="width: 410px;">\${Checkbox(args)}</div>\`
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};const C=["Unchecked","Checked","Disabled","DisabledChecked","Tile","TileChecked","Group"];export{o as Checked,t as Disabled,l as DisabledChecked,i as Group,n as Tile,d as TileChecked,c as Unchecked,C as __namedExportsOrder,v as default};
