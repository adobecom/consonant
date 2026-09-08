import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";var i;function a(){return(a=e((()=>{r(),i=({label:e=`Filter`,active:r=!1,disabled:i=!1,state:a=`default`,onClick:o}={})=>{let s=r||a===`active`,c=i||a===`disabled`;return n`
    <button
      class="c-nav-filter"
      role="tab"
      aria-selected=${s?`true`:`false`}
      aria-disabled=${c?`true`:t}
      data-force-state=${(a&&a!=="default"?a:null)??t}
      type="button"
      @click=${e=>{c||o?.(e)}}
    >
      <span class="c-nav-filter__label">${e}</span>
    </button>
  `}})))()}function o(){return(o=e((()=>{a()})))()}function s(){return(s=e((()=>{o()})))()}var c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{r(),s(),{fn:c}=__STORYBOOK_MODULE_TEST__,l={title:`Molecules/NavFilter`,tags:[`autodocs`],render:e=>i(e),parameters:{docs:{description:{component:`
<p>Pill-shaped filter tab for global navigation. Always rendered inside a <code>NavFilterGroup</code> (<code>role="tablist"</code>), which owns arrow-key navigation and tracks which tab is active.</p>
`},source:{language:`html`,code:`<!-- Always render tabs inside a role="tablist" container -->
<div role="tablist" aria-label="Product categories" style="display: flex; gap: 8px;">
  <button class="c-nav-filter" role="tab" aria-selected="true" type="button">
    <span class="c-nav-filter__label">All</span>
  </button>
  <button class="c-nav-filter" role="tab" aria-selected="false" type="button">
    <span class="c-nav-filter__label">Creative Cloud</span>
  </button>
  <button class="c-nav-filter" role="tab" aria-selected="false" type="button">
    <span class="c-nav-filter__label">Document Cloud</span>
  </button>
  <button class="c-nav-filter" role="tab" aria-selected="false" aria-disabled="true" type="button">
    <span class="c-nav-filter__label">Coming soon</span>
  </button>
</div>`}}},argTypes:{label:{control:`text`,description:`Visible label text for the filter tab`},active:{control:`boolean`,description:`Marks this tab as currently selected (sets aria-selected=true)`},disabled:{control:`boolean`,description:`Prevents interaction while keeping the tab keyboard-focusable (aria-disabled)`},state:{control:{type:`select`},options:[`default`,`active`,`hover`,`disabled`,`focus`],description:`Force a visual state for documentation — does not affect real interactivity`},onClick:{action:`clicked`}},args:{onClick:c(),label:`All`,active:!1,disabled:!1,state:`default`}},u={},d={args:{label:`Creative Cloud`,active:!0}},f={args:{label:`Document Cloud`,state:`hover`}},p={args:{label:`Coming soon`,disabled:!0}},m={args:{label:`All`,state:`focus`}},h={render:()=>n`
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        ${[`default`,`hover`,`active`,`focus`,`disabled`].map(e=>i({label:e,state:e}))}
      </div>
    `},g={render:()=>{let e=[`All`,`Creative Cloud`,`Document Cloud`,`Experience Cloud`],t=e=>{let t=e.currentTarget;t.closest(`[role="tablist"]`).querySelectorAll(`[role="tab"]`).forEach(e=>{e.setAttribute(`aria-selected`,e===t?`true`:`false`)})};return n`
      <div
        role="tablist"
        aria-label="Product categories"
        style="display: flex; gap: 8px; flex-wrap: wrap;"
      >
        ${e.map((e,n)=>i({label:e,active:n===0,onClick:t}))}
      </div>
    `}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Creative Cloud",
    active: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Document Cloud",
    state: "hover"
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Coming soon",
    disabled: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: "All",
    state: "focus"
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const states = ["default", "hover", "active", "focus", "disabled"];
    return html\`
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        \${states.map(state => NavFilter({
      label: state,
      state
    }))}
      </div>
    \`;
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const labels = ["All", "Creative Cloud", "Document Cloud", "Experience Cloud"];
    const handleClick = e => {
      const clicked = e.currentTarget;
      const tablist = clicked.closest('[role="tablist"]');
      tablist.querySelectorAll('[role="tab"]').forEach(tab => {
        tab.setAttribute("aria-selected", tab === clicked ? "true" : "false");
      });
    };
    return html\`
      <div
        role="tablist"
        aria-label="Product categories"
        style="display: flex; gap: 8px; flex-wrap: wrap;"
      >
        \${labels.map((label, i) => NavFilter({
      label,
      active: i === 0,
      onClick: handleClick
    }))}
      </div>
    \`;
  }
}`,...g.parameters?.docs?.source}}},_=[`Default`,`Active`,`Hover`,`Disabled`,`Focus`,`ForcedStates`,`InAGroup`]})))()}v();export{d as Active,u as Default,p as Disabled,m as Focus,h as ForcedStates,f as Hover,g as InAGroup,_ as __namedExportsOrder,l as default};