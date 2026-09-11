import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";function r({label:e=`Tab`,selected:t=!1,disabled:n=!1,forceState:r}={}){let i=document.createElement(`button`);i.className=`c-tab`,i.type=`button`,i.setAttribute(`role`,`tab`),i.setAttribute(`aria-selected`,t?`true`:`false`),i.tabIndex=t?0:-1,n&&(i.disabled=!0),r&&(i.dataset.forceState=r);let a=document.createElement(`span`);a.className=`c-tab__label`,a.textContent=e,i.append(a);let o=document.createElement(`span`);return o.className=`c-tab__underline`,o.setAttribute(`aria-hidden`,`true`),i.append(o),i}function i({tabs:e=[{label:`Photo`,selected:!0},{label:`Design`},{label:`Video`}],ariaLabel:t=`Content tabs`}={}){let n=document.createElement(`div`);return n.className=`c-tabs`,n.setAttribute(`role`,`tablist`),n.setAttribute(`aria-label`,t),e.forEach(e=>n.append(r(e))),n}function a(){return(a=e((()=>{})))()}function o(){return(o=e((()=>{a()})))()}var s,c,l,u,d,f;function p(){return(p=e((()=>{n(),o(),s={title:`Atoms/Tabs`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`centered`,docs:{description:{component:`
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
</div>`}}}},c={args:{tabs:[{label:`Photo`,selected:!0},{label:`Design`},{label:`Video`}]}},l={args:{tabs:[{label:`Photo`},{label:`Design`,selected:!0},{label:`Video`}]}},u={args:{tabs:[{label:`Photo`,selected:!0},{label:`Design`},{label:`Video`,disabled:!0}]}},d={render:()=>t`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      ${[!1,!0].map(e=>t`
          <div style="display: flex; gap: 40px; align-items: center;">
            ${r({label:`Default`,selected:e})}
            ${r({label:`Hover`,selected:e,forceState:`hover`})}
            ${r({label:`Focus`,selected:e,forceState:`focus`})}
            ${r({label:`Disabled`,selected:e,disabled:!0})}
          </div>
        `)}
    </div>
  `},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      \${[false, true].map(selected => html\`
          <div style="display: flex; gap: 40px; align-items: center;">
            \${createTab({
    label: "Default",
    selected
  })}
            \${createTab({
    label: "Hover",
    selected,
    forceState: "hover"
  })}
            \${createTab({
    label: "Focus",
    selected,
    forceState: "focus"
  })}
            \${createTab({
    label: "Disabled",
    selected,
    disabled: true
  })}
          </div>
        \`)}
    </div>
  \`
}`,...d.parameters?.docs?.source},description:{story:`All Selected × State combinations from the Figma set.`,...d.parameters?.docs?.description}}},f=[`Default`,`SecondSelected`,`WithDisabledTab`,`AllStates`]})))()}p();export{d as AllStates,c as Default,l as SecondSelected,u as WithDisabledTab,f as __namedExportsOrder,s as default};