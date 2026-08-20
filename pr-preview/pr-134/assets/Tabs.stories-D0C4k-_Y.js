import{E as b,x as o}from"./iframe-BoGTDT1x.js";import"./preload-helper-BvGMX4d4.js";const t=({label:e="Tab",selected:s=!1,disabled:i=!1,forceState:c=void 0}={})=>o`
  <button
    class="c-tab"
    role="tab"
    aria-selected="${s?"true":"false"}"
    ?disabled=${i}
    tabindex=${s?"0":"-1"}
    data-force-state=${c??b}
  >
    <span class="c-tab__label">${e}</span>
    <span class="c-tab__underline" aria-hidden="true"></span>
  </button>
`,d=({tabs:e=[{label:"Photo",selected:!0},{label:"Design"},{label:"Video"}],ariaLabel:s="Content tabs"}={})=>o`
  <div class="c-tabs" role="tablist" aria-label="${s}">
    ${e.map(i=>t(i))}
  </div>
`,m={title:"Atoms/Tabs",tags:["autodocs"],render:e=>d(e),parameters:{layout:"centered",docs:{description:{component:`
Text tabs with an accent underline on the selected tab. Single size — each tab is
exactly 40px tall with a heading-4 label (Adobe Clean Display Black), a 4px gap,
and a 2px underline. Tabs sit in a TabGroup tablist with a 24px gap.

Selection is shown by both label strength and the accent underline, so state is
never conveyed by color alone. Arrow-key navigation between tabs must be wired by
the consumer — this package ships pure HTML/CSS with roving tabindex markup.

Matches Figma \`_tab\` (11615:206785) + \`Tabs\` (11615:206787).
        `},source:{language:"html",code:`<div class="c-tabs" role="tablist" aria-label="Content tabs">
  <button class="c-tab" role="tab" aria-selected="true">
    <span class="c-tab__label">Photo</span>
    <span class="c-tab__underline" aria-hidden="true"></span>
  </button>
  <button class="c-tab" role="tab" aria-selected="false" tabindex="-1">
    <span class="c-tab__label">Design</span>
    <span class="c-tab__underline" aria-hidden="true"></span>
  </button>
</div>`}}}},l={args:{tabs:[{label:"Photo",selected:!0},{label:"Design"},{label:"Video"}]}},n={args:{tabs:[{label:"Photo"},{label:"Design",selected:!0},{label:"Video"}]}},r={args:{tabs:[{label:"Photo",selected:!0},{label:"Design"},{label:"Video",disabled:!0}]}},a={render:()=>o`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      ${[!1,!0].map(e=>o`
          <div style="display: flex; gap: 40px; align-items: center;">
            ${t({label:"Default",selected:e})}
            ${t({label:"Hover",selected:e,forceState:"hover"})}
            ${t({label:"Focus",selected:e,forceState:"focus"})}
            ${t({label:"Disabled",selected:e,disabled:!0})}
          </div>
        `)}
    </div>
  `};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source},description:{story:"All Selected × State combinations from the Figma set.",...a.parameters?.docs?.description}}};const g=["Default","SecondSelected","WithDisabledTab","AllStates"];export{a as AllStates,l as Default,n as SecondSelected,r as WithDisabledTab,g as __namedExportsOrder,m as default};
