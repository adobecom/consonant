import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";var i,a;function o(){return(o=e((()=>{r(),i=({label:e=`Tab`,selected:r=!1,disabled:i=!1,forceState:a=void 0}={})=>n`
  <button
    class="c-tab"
    role="tab"
    aria-selected="${r?`true`:`false`}"
    ?disabled=${i}
    tabindex=${r?`0`:`-1`}
    data-force-state=${a??t}
  >
    <span class="c-tab__label">${e}</span>
    <span class="c-tab__underline" aria-hidden="true"></span>
  </button>
`,a=({tabs:e=[{label:`Photo`,selected:!0},{label:`Design`},{label:`Video`}],ariaLabel:t=`Content tabs`}={})=>n`
  <div class="c-tabs" role="tablist" aria-label="${t}">
    ${e.map(e=>i(e))}
  </div>
`})))()}function s(){return(s=e((()=>{o()})))()}var c,l,u,d,f,p;function m(){return(m=e((()=>{r(),s(),c={title:`Atoms/Tabs`,tags:[`autodocs`],render:e=>a(e),parameters:{layout:`centered`,docs:{description:{component:`
Text tabs with an accent underline on the selected tab. Single size — each tab is
exactly 40px tall with a heading-4 label (Adobe Clean Display Black), a 4px gap,
and a 2px underline. Tabs sit in a TabGroup tablist with a 24px gap.

Selection is shown by both label strength and the accent underline, so state is
never conveyed by color alone. Arrow-key navigation between tabs must be wired by
the consumer — this package ships pure HTML/CSS with roving tabindex markup.

Matches Figma \`_tab\` (11615:206785) + \`Tabs\` (11615:206787).
        `},source:{language:`html`,code:`<div class="c-tabs" role="tablist" aria-label="Content tabs">
  <button class="c-tab" role="tab" aria-selected="true">
    <span class="c-tab__label">Photo</span>
    <span class="c-tab__underline" aria-hidden="true"></span>
  </button>
  <button class="c-tab" role="tab" aria-selected="false" tabindex="-1">
    <span class="c-tab__label">Design</span>
    <span class="c-tab__underline" aria-hidden="true"></span>
  </button>
</div>`}}}},l={args:{tabs:[{label:`Photo`,selected:!0},{label:`Design`},{label:`Video`}]}},u={args:{tabs:[{label:`Photo`},{label:`Design`,selected:!0},{label:`Video`}]}},d={args:{tabs:[{label:`Photo`,selected:!0},{label:`Design`},{label:`Video`,disabled:!0}]}},f={render:()=>n`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      ${[!1,!0].map(e=>n`
          <div style="display: flex; gap: 40px; align-items: center;">
            ${i({label:`Default`,selected:e})}
            ${i({label:`Hover`,selected:e,forceState:`hover`})}
            ${i({label:`Focus`,selected:e,forceState:`focus`})}
            ${i({label:`Disabled`,selected:e,disabled:!0})}
          </div>
        `)}
    </div>
  `},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tabs: [{
      label: "Photo",
      selected: true
    }, {
      label: "Design"
    }, {
      label: "Video"
    }]
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tabs: [{
      label: "Photo"
    }, {
      label: "Design",
      selected: true
    }, {
      label: "Video"
    }]
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tabs: [{
      label: "Photo",
      selected: true
    }, {
      label: "Design"
    }, {
      label: "Video",
      disabled: true
    }]
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      \${[false, true].map(selected => html\`
          <div style="display: flex; gap: 40px; align-items: center;">
            \${Tab({
    label: "Default",
    selected
  })}
            \${Tab({
    label: "Hover",
    selected,
    forceState: "hover"
  })}
            \${Tab({
    label: "Focus",
    selected,
    forceState: "focus"
  })}
            \${Tab({
    label: "Disabled",
    selected,
    disabled: true
  })}
          </div>
        \`)}
    </div>
  \`
}`,...f.parameters?.docs?.source},description:{story:`All Selected × State combinations from the Figma set.`,...f.parameters?.docs?.description}}},p=[`Default`,`SecondSelected`,`WithDisabledTab`,`AllStates`]})))()}m();export{f as AllStates,l as Default,u as SecondSelected,d as WithDisabledTab,p as __namedExportsOrder,c as default};