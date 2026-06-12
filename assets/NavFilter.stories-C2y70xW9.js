import{E as m,x as b}from"./iframe-_fPFkiU8.js";import"./preload-helper-BSds_FOV.js";const p=({label:a="Filter",active:t=!1,disabled:s=!1,state:e="default",onClick:f}={})=>{const l=t||e==="active",v=s||e==="disabled";return b`
    <button
      class="c-nav-filter"
      role="tab"
      aria-selected=${l?"true":"false"}
      aria-disabled=${v?"true":m}
      data-force-state=${(e&&e!=="default"?e:null)??m}
      type="button"
      @click=${g=>{v||f?.(g)}}
    >
      <span class="c-nav-filter__label">${a}</span>
    </button>
  `},{fn:y}=__STORYBOOK_MODULE_TEST__,x={title:"Molecules/NavFilter",tags:["autodocs"],render:a=>p(a),parameters:{docs:{description:{component:`
<p>Pill-shaped filter tab for global navigation. Always rendered inside a <code>NavFilterGroup</code> (<code>role="tablist"</code>), which owns arrow-key navigation and tracks which tab is active.</p>

<details class="s2a-doc-accordion">
  <summary>Preferred · HTML structure <span class="s2a-doc-badge">Recommended</span></summary>
  <div class="s2a-doc-body">
    <p>Render multiple <code>NavFilter</code> tabs inside a <code>role="tablist"</code> container. The container manages <code>aria-selected</code> state and arrow-key movement between tabs.</p>

\`\`\`html
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
</div>
\`\`\`

\`\`\`css
/* Active state — solid black pill */
.c-nav-filter[aria-selected="true"] {
  background-color: var(--s2a-color-background-knockout, #000000);
  color: var(--s2a-color-background-default, #ffffff);
}

/* Disabled — stays focusable, reduced opacity */
.c-nav-filter[aria-disabled="true"] {
  opacity: var(--s2a-opacity-disabled, 0.48);
  pointer-events: none;
}
\`\`\`
  </div>
</details>

        `},source:{language:"html",code:`<!-- Always render tabs inside a role="tablist" container -->
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
</div>`}}},argTypes:{label:{control:"text",description:"Visible label text for the filter tab"},active:{control:"boolean",description:"Marks this tab as currently selected (sets aria-selected=true)"},disabled:{control:"boolean",description:"Prevents interaction while keeping the tab keyboard-focusable (aria-disabled)"},state:{control:{type:"select"},options:["default","active","hover","disabled","focus"],description:"Force a visual state for documentation — does not affect real interactivity"},onClick:{action:"clicked"}},args:{onClick:y(),label:"All",active:!1,disabled:!1,state:"default"}},r={},o={args:{label:"Creative Cloud",active:!0}},c={args:{label:"Document Cloud",state:"hover"}},n={args:{label:"Coming soon",disabled:!0}},i={args:{label:"All",state:"focus"}},d={render:()=>b`
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        ${["default","hover","active","focus","disabled"].map(t=>p({label:t,state:t}))}
      </div>
    `},u={render:()=>{const a=["All","Creative Cloud","Document Cloud","Experience Cloud"],t=s=>{const e=s.currentTarget;e.closest('[role="tablist"]').querySelectorAll('[role="tab"]').forEach(l=>{l.setAttribute("aria-selected",l===e?"true":"false")})};return b`
      <div
        role="tablist"
        aria-label="Product categories"
        style="display: flex; gap: 8px; flex-wrap: wrap;"
      >
        ${a.map((s,e)=>p({label:s,active:e===0,onClick:t}))}
      </div>
    `}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Creative Cloud",
    active: true
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Document Cloud",
    state: "hover"
  }
}`,...c.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Coming soon",
    disabled: true
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    label: "All",
    state: "focus"
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};const A=["Default","Active","Hover","Disabled","Focus","ForcedStates","InAGroup"];export{o as Active,r as Default,n as Disabled,i as Focus,d as ForcedStates,c as Hover,u as InAGroup,A as __namedExportsOrder,x as default};
