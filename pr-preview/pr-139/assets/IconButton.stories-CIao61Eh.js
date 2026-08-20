import{x as t}from"./iframe-B2hp8VXM.js";import{I as v}from"./icon-button-BprMhvfv.js";import"./preload-helper-Ce5Z0ovn.js";import"./unsafe-html-CAZmCvIp.js";import"./directive-DoeGSK_T.js";import"./play-6eLew0w_.js";import"./chevron-right-CnbUzkxe.js";import"./arrow-right-Do-kvyXB.js";const{fn:x}=__STORYBOOK_MODULE_TEST__,f=a=>a==="active"?"play":a==="disabled"?"cross":"pause",e=(a={})=>v(a),g=a=>t`
  <div
    style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%); padding: 16px; border-radius: 16px; display: inline-flex; gap: 12px; align-items: center;"
  >
    ${a}
  </div>
`,B={title:"Atoms/IconButton",tags:["autodocs"],render:a=>e(a),parameters:{docs:{description:{component:`<p>Icon-only action button — v2 architecture. Matches Figma <code>IconButton — v2</code> component set <code>11174:146275</code>. Pass any S2A icon name as the <code>icon</code> prop — icons are sourced from <code>packages/components/src/icons/</code> and rendered as inline SVG with <code>currentColor</code> so they inherit the button's tone automatically.</p>
<p>There is no context prop: light/dark theming flows from the S2A variable modes (use the toolbar Theme toggle). <code>knockout</code> is the always-light circle for dark/media surfaces — it doesn't flip with the page theme.</p>`},source:{language:"html",code:`<!-- Solid -->
<button class="c-icon-button" data-style="solid" data-size="lg" type="button" aria-label="Pause playback">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>

<!-- Transparent -->
<button class="c-icon-button" data-style="transparent" data-size="sm" type="button" aria-label="Close">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>

<!-- Knockout — always-light circle for media surfaces -->
<button class="c-icon-button" data-style="knockout" data-size="lg" type="button" aria-label="Play">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>`}}},argTypes:{ariaLabel:{control:"text",description:"Accessible label (required)"},icon:{control:{type:"select"},options:["pause","play","cross","add","chevron-right","chevron-left","chevron-down","chevron-up","arrow-right","arrow-left","link-out","hamburger"],description:"S2A icon name — resolved from packages/components/src/icons/"},style:{control:{type:"select"},options:["solid","transparent","knockout"],description:"Style variant (Figma Style axis). knockout is for always-dark media surfaces."},size:{control:{type:"select"},options:["sm","md","lg"],description:"Size variant (sm = 24px/12px icon, md = 32px/16px, lg = 40px/16px)"},state:{control:{type:"select"},options:["default","hover","active","focus","disabled"],description:"Force a visual state for documentation"}},args:{onClick:x(),ariaLabel:"Pause",icon:"pause",style:"solid",size:"lg",state:"default"}},r={},i={args:{style:"transparent"}},l={name:"Knockout (media surface)",render:()=>g(t`
      ${e({style:"knockout",ariaLabel:"Play",icon:"play",size:"lg"})}
      ${e({style:"knockout",ariaLabel:"Pause",icon:"pause",size:"md"})}
      ${e({style:"knockout",ariaLabel:"Close",icon:"cross",size:"sm"})}
    `)},c={args:{state:"disabled"}},d={name:"S2A Icons",render:()=>t`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      ${e({ariaLabel:"Play media",icon:"play",size:"lg",style:"solid"})}
      ${e({ariaLabel:"Pause media",icon:"pause",size:"lg",style:"solid"})}
      ${e({ariaLabel:"Add",icon:"add",size:"lg",style:"transparent"})}
      ${g(t`
        ${e({ariaLabel:"Close",icon:"cross",size:"sm",style:"knockout"})}
        ${e({ariaLabel:"Navigate forward",icon:"chevron-right",size:"md",style:"knockout"})}
        ${e({ariaLabel:"Link out",icon:"link-out",size:"md",style:"knockout"})}
      `)}
    </div>
  `},p={render:()=>t`
    <div style="display: flex; gap: 16px; align-items: center;">
      ${e({ariaLabel:"Play (sm)",icon:"play",size:"sm"})}
      ${e({ariaLabel:"Play (md)",icon:"play",size:"md"})}
      ${e({ariaLabel:"Pause (lg)",icon:"pause",size:"lg"})}
    </div>
  `},u={name:"All styles × states",render:()=>{const a=["default","hover","active","focus","disabled"];return t`
      <div style="display: flex; flex-direction: column; gap: 20px;">
        ${["solid","transparent"].map(n=>t`
            <div style="display: grid; gap: 8px;">
              <strong
                style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);text-transform:capitalize;color:var(--s2a-color-content-default);"
                >${n}</strong
              >
              <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
                ${a.map(s=>e({icon:f(s),ariaLabel:`${n} ${s}`,style:n,state:s,size:"lg"}))}
              </div>
            </div>
          `)}
        <div style="display: grid; gap: 8px;">
          <strong
            style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);color:var(--s2a-color-content-default);"
            >Knockout (media surface)</strong
          >
          ${g(t`
            ${a.map(n=>e({icon:f(n),ariaLabel:`knockout ${n}`,style:"knockout",state:n,size:"lg"}))}
          `)}
        </div>
      </div>
    `}},m={render:()=>{const a=["default","hover","active","focus","disabled"],n=(s,b)=>t`
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        ${a.map(y=>e({icon:f(y),ariaLabel:`${s} icon button ${y}`,state:y,size:b}))}
      </div>
    `;return t`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: var(--s2a-color-content-body-subtle);">Large (lg · 40px)</span>
        ${n("Large","lg")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: var(--s2a-color-content-body-subtle);">Medium (md · 32px)</span>
        ${n("Medium","md")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: var(--s2a-color-content-body-subtle);">Small (sm · 24px)</span>
        ${n("Small","sm")}
      </div>
    `}},o={render:()=>t`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
      ${e({style:"solid",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
      ${e({style:"transparent",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
    </div>
  `};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    style: "transparent"
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "Knockout (media surface)",
  render: () => darkMedia(html\`
      \${renderIconButton({
    style: "knockout",
    ariaLabel: "Play",
    icon: "play",
    size: "lg"
  })}
      \${renderIconButton({
    style: "knockout",
    ariaLabel: "Pause",
    icon: "pause",
    size: "md"
  })}
      \${renderIconButton({
    style: "knockout",
    ariaLabel: "Close",
    icon: "cross",
    size: "sm"
  })}
    \`)
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    state: "disabled"
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "S2A Icons",
  render: () => html\`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      \${renderIconButton({
    ariaLabel: "Play media",
    icon: "play",
    size: "lg",
    style: "solid"
  })}
      \${renderIconButton({
    ariaLabel: "Pause media",
    icon: "pause",
    size: "lg",
    style: "solid"
  })}
      \${renderIconButton({
    ariaLabel: "Add",
    icon: "add",
    size: "lg",
    style: "transparent"
  })}
      \${darkMedia(html\`
        \${renderIconButton({
    ariaLabel: "Close",
    icon: "cross",
    size: "sm",
    style: "knockout"
  })}
        \${renderIconButton({
    ariaLabel: "Navigate forward",
    icon: "chevron-right",
    size: "md",
    style: "knockout"
  })}
        \${renderIconButton({
    ariaLabel: "Link out",
    icon: "link-out",
    size: "md",
    style: "knockout"
  })}
      \`)}
    </div>
  \`
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: 16px; align-items: center;">
      \${renderIconButton({
    ariaLabel: "Play (sm)",
    icon: "play",
    size: "sm"
  })}
      \${renderIconButton({
    ariaLabel: "Play (md)",
    icon: "play",
    size: "md"
  })}
      \${renderIconButton({
    ariaLabel: "Pause (lg)",
    icon: "pause",
    size: "lg"
  })}
    </div>
  \`
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "All styles × states",
  render: () => {
    const states = ["default", "hover", "active", "focus", "disabled"];
    return html\`
      <div style="display: flex; flex-direction: column; gap: 20px;">
        \${["solid", "transparent"].map(style => html\`
            <div style="display: grid; gap: 8px;">
              <strong
                style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);text-transform:capitalize;color:var(--s2a-color-content-default);"
                >\${style}</strong
              >
              <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
                \${states.map(state => renderIconButton({
      icon: forcedStateIcon(state),
      ariaLabel: \`\${style} \${state}\`,
      style,
      state,
      size: "lg"
    }))}
              </div>
            </div>
          \`)}
        <div style="display: grid; gap: 8px;">
          <strong
            style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);color:var(--s2a-color-content-default);"
            >Knockout (media surface)</strong
          >
          \${darkMedia(html\`
            \${states.map(state => renderIconButton({
      icon: forcedStateIcon(state),
      ariaLabel: \`knockout \${state}\`,
      style: "knockout",
      state,
      size: "lg"
    }))}
          \`)}
        </div>
      </div>
    \`;
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const states = ["default", "hover", "active", "focus", "disabled"];
    const renderRow = (sizeLabel, sizeValue) => html\`
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        \${states.map(state => renderIconButton({
      icon: forcedStateIcon(state),
      ariaLabel: \`\${sizeLabel} icon button \${state}\`,
      state,
      size: sizeValue
    }))}
      </div>
    \`;
    return html\`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: var(--s2a-color-content-body-subtle);">Large (lg · 40px)</span>
        \${renderRow("Large", "lg")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: var(--s2a-color-content-body-subtle);">Medium (md · 32px)</span>
        \${renderRow("Medium", "md")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: var(--s2a-color-content-body-subtle);">Small (sm · 24px)</span>
        \${renderRow("Small", "sm")}
      </div>
    \`;
  }
}`,...m.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
      \${renderIconButton({
    style: "solid",
    ariaLabel: "Pause (tab to focus)",
    state: "focus",
    icon: "pause",
    size: "lg"
  })}
      \${renderIconButton({
    style: "transparent",
    ariaLabel: "Pause (tab to focus)",
    state: "focus",
    icon: "pause",
    size: "lg"
  })}
    </div>
  \`
}`,...o.parameters?.docs?.source},description:{story:"Focus ring appears when tabbing to the button.",...o.parameters?.docs?.description}}};const P=["Solid","Transparent","Knockout","Disabled","S2aIcons","Sizes","AllStylesMatrix","ForcedStates","FocusStates"];export{u as AllStylesMatrix,c as Disabled,o as FocusStates,m as ForcedStates,l as Knockout,d as S2aIcons,p as Sizes,r as Solid,i as Transparent,P as __namedExportsOrder,B as default};
