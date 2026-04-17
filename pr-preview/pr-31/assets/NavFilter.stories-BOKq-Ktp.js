import{E as g,x as u}from"./iframe-2kp_66TH.js";import"./preload-helper-DOg3i_cw.js";const b=({label:a="Filter",active:t=!1,disabled:r=!1,state:e="default",onClick:f}={})=>{const s=t||e==="active",v=r||e==="disabled";return u`
    <button
      class="c-nav-filter"
      role="tab"
      aria-selected=${s?"true":"false"}
      aria-disabled=${v?"true":g}
      data-force-state=${(e&&e!=="default"?e:null)??g}
      type="button"
      @click=${m=>{v||f?.(m)}}
    >
      <span class="c-nav-filter__label">${a}</span>
    </button>
  `},y=`/* ─── Component tokens ──────────────────────────────────────────────────────── */
.c-nav-filter {
  --c-nav-filter-bg:    var(--s2a-color-transparent-black-04, rgba(0, 0, 0, 0.04));
  --c-nav-filter-color: var(--s2a-color-content-default, #000000);
}

.c-nav-filter:is([aria-selected="true"], [data-force-state="active"]) {
  /* ⚠ borrowing --s2a-color-background-knockout until a NavFilter-specific active token ships */
  --c-nav-filter-bg:    var(--s2a-color-background-knockout, #000000);
  --c-nav-filter-color: var(--s2a-color-background-default, #ffffff);
}

.c-nav-filter:not([aria-selected="true"]):not([data-force-state="active"]):is(:hover, [data-force-state="hover"]) {
  --c-nav-filter-bg:    var(--s2a-color-transparent-black-48, rgba(0, 0, 0, 0.48));
  --c-nav-filter-color: var(--s2a-color-background-default, #ffffff);
}

/* ─── Root ──────────────────────────────────────────────────────────────────── */
.c-nav-filter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--s2a-spacing-2xl, 40px);
  padding: var(--s2a-spacing-md, 16px) var(--s2a-spacing-lg, 24px);
  border: none;
  border-radius: var(--s2a-border-radius-round, 999px);
  background-color: var(--c-nav-filter-bg);
  color: var(--c-nav-filter-color);
  font-family: var(--s2a-font-family-default, "adobe-clean", "Adobe Clean", sans-serif);
  font-weight: var(--s2a-font-weight-adobe-clean-bold, 700);
  font-size: var(--s2a-typography-font-size-label, 14px);
  line-height: var(--s2a-typography-line-height-label, 1.142857);
  letter-spacing: var(--s2a-typography-letter-spacing-label, 0);
  white-space: nowrap;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 200ms ease, color 200ms ease;
}

/* ─── Disabled ──────────────────────────────────────────────────────────────── */
/* Uses aria-disabled (not native disabled) so the tab stays keyboard-focusable per APG */
.c-nav-filter[aria-disabled="true"],
.c-nav-filter[data-force-state="disabled"] {
  opacity: var(--s2a-opacity-disabled, 0.48);
  cursor: not-allowed;
  pointer-events: none;
}

/* ─── Focus ──────────────────────────────────────────────────────────────────── */
.c-nav-filter:is(:focus-visible, [data-force-state="focus"]) {
  outline: none;
  box-shadow:
    0 0 0 var(--s2a-spacing-3xs, 2px) var(--s2a-color-background-default, #ffffff),
    0 0 0 var(--s2a-spacing-2xs, 4px) var(--s2a-color-focus-ring-default, #1473e6);
}
`,{fn:h}=__STORYBOOK_MODULE_TEST__,A={title:"Navigation/NavFilter",tags:["autodocs"],render:a=>b(a),parameters:{docs:{description:{component:`
<style>
.doc-pattern {
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 16px;
  margin: 12px 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,248,248,0.9));
}
.doc-collapse summary {
  list-style: none;
  cursor: pointer;
  padding: 18px 24px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.doc-collapse summary::-webkit-details-marker { display: none; }
.doc-collapse summary span { color: #555; font-size: 13px; font-weight: 600; }
.doc-collapse[open] summary { border-bottom: 1px solid rgba(0,0,0,0.08); }
.doc-body { padding: 20px 24px 24px; }
.doc-body p { margin: 0 0 12px; font-size: 14px; color: #333; }
.doc-body code { font-weight: 600; }
</style>
<p>Pill-shaped filter tab for global navigation. Always rendered inside a <code>NavFilterGroup</code> (<code>role="tablist"</code>), which owns arrow-key navigation and tracks which tab is active.</p>

<details class="doc-pattern doc-collapse">
  <summary>Preferred · HTML structure <span>Recommended</span></summary>
  <div class="doc-body">
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

<details class="doc-pattern doc-collapse">
  <summary>Full CSS reference <span>Source of truth</span></summary>
  <div class="doc-body">
    <p>This is the exact stylesheet shipped in <code>packages/components/src/nav-filter/nav-filter.css</code>.</p>

\`\`\`css
${y}
\`\`\`
  </div>
</details>
        `}}},argTypes:{label:{control:"text",description:"Visible label text for the filter tab"},active:{control:"boolean",description:"Marks this tab as currently selected (sets aria-selected=true)"},disabled:{control:"boolean",description:"Prevents interaction while keeping the tab keyboard-focusable (aria-disabled)"},state:{control:{type:"select"},options:["default","active","hover","disabled","focus"],description:"Force a visual state for documentation — does not affect real interactivity"},onClick:{action:"clicked"}},args:{onClick:h(),label:"All",active:!1,disabled:!1,state:"default"}},o={},n={args:{label:"Creative Cloud",active:!0}},l={args:{label:"Document Cloud",state:"hover"}},c={args:{label:"Coming soon",disabled:!0}},i={args:{label:"All",state:"focus"}},d={render:()=>u`
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        ${["default","hover","active","focus","disabled"].map(t=>b({label:t,state:t}))}
      </div>
    `},p={render:()=>{const a=["All","Creative Cloud","Document Cloud","Experience Cloud"],t=r=>{const e=r.currentTarget;e.closest('[role="tablist"]').querySelectorAll('[role="tab"]').forEach(s=>{s.setAttribute("aria-selected",s===e?"true":"false")})};return u`
      <div
        role="tablist"
        aria-label="Product categories"
        style="display: flex; gap: 8px; flex-wrap: wrap;"
      >
        ${a.map((r,e)=>b({label:r,active:e===0,onClick:t}))}
      </div>
    `}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Creative Cloud",
    active: true
  }
}`,...n.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Document Cloud",
    state: "hover"
  }
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Coming soon",
    disabled: true
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};const _=["Default","Active","Hover","Disabled","Focus","ForcedStates","InAGroup"];export{n as Active,o as Default,c as Disabled,i as Focus,d as ForcedStates,l as Hover,p as InAGroup,_ as __namedExportsOrder,A as default};
