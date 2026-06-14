import{x as o}from"./iframe-D8Il5B1U.js";import{I as x}from"./icon-button-Bn9D8bP_.js";import"./preload-helper-CaDq-G7y.js";import"./unsafe-html-QbazDVPs.js";import"./play-wKvwUfiG.js";import"./chevron-down-Bqt06uWP.js";import"./chevron-right-CnbUzkxe.js";import"./arrow-right-Do-kvyXB.js";const{fn:f}=__STORYBOOK_MODULE_TEST__,y=e=>e,k=e=>e==="active"?"play":e==="disabled"?"cross":"pause",n=(e={})=>{const a=e.size==="md"?"md":"lg";return x({...e,size:a,icon:y(e.icon)})},B={title:"Atoms/IconButton",tags:["autodocs"],render:e=>n(e),parameters:{docs:{description:{component:"<p>Icon-only action button. Pass any S2A icon name as the <code>icon</code> prop — icons are sourced from <code>packages/components/src/icons/</code> and rendered as inline SVG with <code>currentColor</code> so they inherit the button's tone automatically.</p>"},source:{language:"html",code:`<!-- Solid / on-light -->
<button class="c-icon-button" data-background="solid" data-context="on-light" data-size="lg" type="button" aria-label="Pause playback">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>

<!-- Solid / on-dark (media controls) -->
<button class="c-icon-button" data-background="solid" data-context="on-dark" data-size="lg" type="button" aria-label="Play">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>

<!-- Outlined / on-dark -->
<button class="c-icon-button" data-background="outlined" data-context="on-dark" data-size="md" type="button" aria-label="Mute">
  <span class="c-icon-button__icon" aria-hidden="true">…</span>
</button>`}}},argTypes:{ariaLabel:{control:"text",description:"Accessible label (required)"},icon:{control:{type:"select"},options:["pause","play","cross","add","chevron-right","chevron-left","chevron-down","chevron-up","arrow-right","arrow-left","link-out","hamburger"],description:"S2A icon name — resolved from packages/components/src/icons/"},context:{control:{type:"select"},options:["on-light","on-dark"],description:"Surface context the icon button lives on"},background:{control:{type:"select"},options:["solid","outlined","transparent"],description:"Background variant"},size:{control:{type:"select"},options:["md","lg"],description:"Size variant (lg = hero controls, md = compact toolbars)"},state:{control:{type:"select"},options:["default","hover","active","focus","disabled"],description:"Force a visual state for documentation"}},args:{onClick:f(),ariaLabel:"Pause",icon:"pause",context:"on-light",background:"solid",size:"lg",state:"default"}},t={},s={args:{background:"outlined"}},i={args:{background:"transparent"}},d={args:{state:"disabled"}},c={name:"S2A Icons",render:()=>o`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      ${n({ariaLabel:"Play media",icon:"play",size:"lg",background:"solid"})}
      ${n({ariaLabel:"Pause media",icon:"pause",size:"lg",background:"solid"})}
      ${n({ariaLabel:"Add",icon:"add",size:"lg",background:"outlined"})}
      <div style="background: #0b0b0b; padding: 12px; border-radius: 16px; display: inline-flex; gap: 12px;">
        ${n({ariaLabel:"Close",icon:"cross",size:"md",context:"on-dark",background:"transparent"})}
        ${n({ariaLabel:"Navigate forward",icon:"chevron-right",size:"md",context:"on-dark",background:"outlined"})}
        ${n({ariaLabel:"Link out",icon:"link-out",size:"md",context:"on-dark",background:"solid"})}
      </div>
    </div>
  `},l={render:()=>o`
    <div style="display: flex; gap: 16px; align-items: center;">
      ${n({ariaLabel:"Play (md)",icon:"play",size:"md"})}
      ${n({ariaLabel:"Pause (lg)",icon:"pause",size:"lg"})}
    </div>
  `},p={render:()=>{const e=["solid","outlined","transparent"];return o`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          ${e.map(a=>n({background:a,context:"on-light",ariaLabel:a,icon:"pause",size:"lg"}))}
        </div>
        <div style="background: #0b0b0b; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
          ${e.map(a=>n({background:a,context:"on-dark",ariaLabel:`${a} on dark`,icon:"pause",size:"lg"}))}
        </div>
      </div>
    `}},u={render:()=>{const e=["default","hover","active","focus","disabled"],a=(b,m)=>o`
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        ${e.map(g=>n({icon:k(g),ariaLabel:`${b} icon button ${g}`,state:g,size:m}))}
      </div>
    `;return o`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Large (lg · 40px)</span>
        ${a("Large","lg")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Medium (md · 32px)</span>
        ${a("Medium","md")}
      </div>
    `}},r={render:()=>o`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
      ${n({background:"solid",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
      ${n({background:"outlined",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
      ${n({background:"transparent",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
    </div>
  `};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    background: "outlined"
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    background: "transparent"
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    state: "disabled"
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: "S2A Icons",
  render: () => html\`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      \${renderIconButton({
    ariaLabel: "Play media",
    icon: "play",
    size: "lg",
    background: "solid"
  })}
      \${renderIconButton({
    ariaLabel: "Pause media",
    icon: "pause",
    size: "lg",
    background: "solid"
  })}
      \${renderIconButton({
    ariaLabel: "Add",
    icon: "add",
    size: "lg",
    background: "outlined"
  })}
      <div style="background: #0b0b0b; padding: 12px; border-radius: 16px; display: inline-flex; gap: 12px;">
        \${renderIconButton({
    ariaLabel: "Close",
    icon: "cross",
    size: "md",
    context: "on-dark",
    background: "transparent"
  })}
        \${renderIconButton({
    ariaLabel: "Navigate forward",
    icon: "chevron-right",
    size: "md",
    context: "on-dark",
    background: "outlined"
  })}
        \${renderIconButton({
    ariaLabel: "Link out",
    icon: "link-out",
    size: "md",
    context: "on-dark",
    background: "solid"
  })}
      </div>
    </div>
  \`
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: 16px; align-items: center;">
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
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const backgrounds = ["solid", "outlined", "transparent"];
    return html\`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          \${backgrounds.map(background => renderIconButton({
      background,
      context: "on-light",
      ariaLabel: background,
      icon: "pause",
      size: "lg"
    }))}
        </div>
        <div style="background: #0b0b0b; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
          \${backgrounds.map(background => renderIconButton({
      background,
      context: "on-dark",
      ariaLabel: \`\${background} on dark\`,
      icon: "pause",
      size: "lg"
    }))}
        </div>
      </div>
    \`;
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
      </div>
    \`;
  }
}`,...u.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
      \${renderIconButton({
    background: "solid",
    ariaLabel: "Pause (tab to focus)",
    state: "focus",
    icon: "pause",
    size: "lg"
  })}
      \${renderIconButton({
    background: "outlined",
    ariaLabel: "Pause (tab to focus)",
    state: "focus",
    icon: "pause",
    size: "lg"
  })}
      \${renderIconButton({
    background: "transparent",
    ariaLabel: "Pause (tab to focus)",
    state: "focus",
    icon: "pause",
    size: "lg"
  })}
    </div>
  \`
}`,...r.parameters?.docs?.source},description:{story:"Focus ring appears when tabbing to the button.",...r.parameters?.docs?.description}}};const P=["Solid","Outlined","Transparent","Disabled","S2aIcons","Sizes","ContextGrid","ForcedStates","FocusStates"];export{p as ContextGrid,d as Disabled,r as FocusStates,u as ForcedStates,s as Outlined,c as S2aIcons,l as Sizes,t as Solid,i as Transparent,P as __namedExportsOrder,B as default};
