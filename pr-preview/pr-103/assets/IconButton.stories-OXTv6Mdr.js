import{x as t}from"./iframe-kTBIGK9M.js";import{I as g}from"./icon-button-D6_CIDzL.js";import"./preload-helper-BFoh1Q1y.js";import"./unsafe-html-BQb8Wp_E.js";import"./directive-DoeGSK_T.js";import"./play-6eLew0w_.js";import"./chevron-right-CnbUzkxe.js";import"./arrow-right-Do-kvyXB.js";const{fn:b}=__STORYBOOK_MODULE_TEST__,x=a=>a==="active"?"play":a==="disabled"?"cross":"pause",e=(a={})=>g(a),k={title:"Atoms/IconButton",tags:["autodocs"],render:a=>e(a),parameters:{docs:{description:{component:"<p>Icon-only action button. Pass any S2A icon name as the <code>icon</code> prop — icons are sourced from <code>packages/components/src/icons/</code> and rendered as inline SVG with <code>currentColor</code> so they inherit the button's tone automatically.</p>"},source:{language:"html",code:`<!-- Solid / on-light -->
<button class="c-icon-button" data-style="solid" data-context="on-light" data-size="lg" type="button" aria-label="Pause playback">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>

<!-- Solid / on-dark (media controls) -->
<button class="c-icon-button" data-style="solid" data-context="on-dark" data-size="lg" type="button" aria-label="Play">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>

<!-- Transparent / on-light -->
<button class="c-icon-button" data-style="transparent" data-context="on-light" data-size="sm" type="button" aria-label="Close">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>`}}},argTypes:{ariaLabel:{control:"text",description:"Accessible label (required)"},icon:{control:{type:"select"},options:["pause","play","cross","add","chevron-right","chevron-left","chevron-down","chevron-up","arrow-right","arrow-left","link-out","hamburger"],description:"S2A icon name — resolved from packages/components/src/icons/"},context:{control:{type:"select"},options:["on-light","on-dark"],description:"Surface context the icon button lives on"},style:{control:{type:"select"},options:["solid","transparent"],description:"Style variant"},size:{control:{type:"select"},options:["sm","md","lg"],description:"Size variant (sm = 24px, md = 32px, lg = 40px)"},state:{control:{type:"select"},options:["default","hover","active","focus","disabled"],description:"Force a visual state for documentation"}},args:{onClick:b(),ariaLabel:"Pause",icon:"pause",context:"on-light",style:"solid",size:"lg",state:"default"}},o={},r={args:{style:"transparent"}},i={args:{state:"disabled"}},l={name:"S2A Icons",render:()=>t`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      ${e({ariaLabel:"Play media",icon:"play",size:"lg",style:"solid"})}
      ${e({ariaLabel:"Pause media",icon:"pause",size:"lg",style:"solid"})}
      ${e({ariaLabel:"Add",icon:"add",size:"lg",style:"transparent"})}
      <div style="background: #0b0b0b; padding: 12px; border-radius: 16px; display: inline-flex; gap: 12px;">
        ${e({ariaLabel:"Close",icon:"cross",size:"sm",context:"on-dark",style:"transparent"})}
        ${e({ariaLabel:"Navigate forward",icon:"chevron-right",size:"md",context:"on-dark",style:"transparent"})}
        ${e({ariaLabel:"Link out",icon:"link-out",size:"md",context:"on-dark",style:"solid"})}
      </div>
    </div>
  `},c={render:()=>t`
    <div style="display: flex; gap: 16px; align-items: center;">
      ${e({ariaLabel:"Play (sm)",icon:"play",size:"sm"})}
      ${e({ariaLabel:"Play (md)",icon:"play",size:"md"})}
      ${e({ariaLabel:"Pause (lg)",icon:"pause",size:"lg"})}
    </div>
  `},d={render:()=>{const a=["solid","transparent"];return t`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          ${a.map(n=>e({style:n,context:"on-light",ariaLabel:n,icon:"pause",size:"lg"}))}
        </div>
        <div style="background: #0b0b0b; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
          ${a.map(n=>e({style:n,context:"on-dark",ariaLabel:`${n} on dark`,icon:"pause",size:"lg"}))}
        </div>
      </div>
    `}},p={render:()=>{const a=["default","hover","active","focus","disabled"],n=(m,y)=>t`
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        ${a.map(u=>e({icon:x(u),ariaLabel:`${m} icon button ${u}`,state:u,size:y}))}
      </div>
    `;return t`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Large (lg · 40px)</span>
        ${n("Large","lg")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Medium (md · 32px)</span>
        ${n("Medium","md")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Small (sm · 24px)</span>
        ${n("Small","sm")}
      </div>
    `}},s={render:()=>t`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
      ${e({style:"solid",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
      ${e({style:"transparent",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
    </div>
  `};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    style: "transparent"
  }
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    state: "disabled"
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
      <div style="background: #0b0b0b; padding: 12px; border-radius: 16px; display: inline-flex; gap: 12px;">
        \${renderIconButton({
    ariaLabel: "Close",
    icon: "cross",
    size: "sm",
    context: "on-dark",
    style: "transparent"
  })}
        \${renderIconButton({
    ariaLabel: "Navigate forward",
    icon: "chevron-right",
    size: "md",
    context: "on-dark",
    style: "transparent"
  })}
        \${renderIconButton({
    ariaLabel: "Link out",
    icon: "link-out",
    size: "md",
    context: "on-dark",
    style: "solid"
  })}
      </div>
    </div>
  \`
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const styles = ["solid", "transparent"];
    return html\`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          \${styles.map(s => renderIconButton({
      style: s,
      context: "on-light",
      ariaLabel: s,
      icon: "pause",
      size: "lg"
    }))}
        </div>
        <div style="background: #0b0b0b; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
          \${styles.map(s => renderIconButton({
      style: s,
      context: "on-dark",
      ariaLabel: \`\${s} on dark\`,
      icon: "pause",
      size: "lg"
    }))}
        </div>
      </div>
    \`;
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Large (lg · 40px)</span>
        \${renderRow("Large", "lg")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Medium (md · 32px)</span>
        \${renderRow("Medium", "md")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Small (sm · 24px)</span>
        \${renderRow("Small", "sm")}
      </div>
    \`;
  }
}`,...p.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source},description:{story:"Focus ring appears when tabbing to the button.",...s.parameters?.docs?.description}}};const I=["Solid","Transparent","Disabled","S2aIcons","Sizes","ContextGrid","ForcedStates","FocusStates"];export{d as ContextGrid,i as Disabled,s as FocusStates,p as ForcedStates,l as S2aIcons,c as Sizes,o as Solid,r as Transparent,I as __namedExportsOrder,k as default};
