import{x as o}from"./iframe-_fPFkiU8.js";import{I as f}from"./icon-button-D1GRXjUF.js";import"./preload-helper-BSds_FOV.js";import"./unsafe-html-Cu7DzaLd.js";import"./play-wKvwUfiG.js";import"./chevron-down-Bqt06uWP.js";import"./chevron-right-CnbUzkxe.js";import"./arrow-right-Do-kvyXB.js";const{fn:x}=__STORYBOOK_MODULE_TEST__,y=n=>n,k=n=>n==="active"?"play":n==="disabled"?"cross":"pause",a=(n={})=>{const e=n.size==="md"?"md":"lg";return f({...n,size:e,icon:y(n.icon)})},B={title:"Atoms/IconButton",tags:["autodocs"],render:n=>a(n),parameters:{docs:{description:{component:`
<p>Icon-only action button. Pass any S2A icon name as the <code>icon</code> prop — icons are sourced from <code>packages/components/src/icons/</code> and rendered as inline SVG with <code>currentColor</code> so they inherit the button's tone automatically.</p>

<details class="s2a-doc-accordion">
  <summary>Preferred · Data-attribute HTML structure <span class="s2a-doc-badge">Recommended</span></summary>
  <div class="s2a-doc-body">
    <p>Map Figma axes to <code>data-*</code> attributes. Icon slots accept inline SVG, Spectrum Web Components, or Lit templates.</p>

\`\`\`html
<button
  class="c-icon-button"
  data-background="solid"
  data-context="on-light"
  data-size="lg"
  aria-label="Pause playback"
>
  <span class="c-icon-button__icon" aria-hidden="true">
    <!-- inline SVG from packages/components/src/icons/pause.svg -->
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">…</svg>
  </span>
</button>
\`\`\`

\`\`\`css
.c-icon-button[data-background="solid"][data-context="on-light"] {
  background-color: var(--s2a-color-iconbutton-background-primary-solid-on-light-default);
  color: var(--s2a-color-iconbutton-content-primary-solid-default);
}

.c-icon-button[data-background="outlined"][data-context="on-dark"] {
  border: var(--s2a-border-width-sm) solid var(--s2a-color-iconbutton-border-primary-outlined-on-dark);
  color: var(--s2a-color-iconbutton-content-primary-outlined-knockout);
}
\`\`\`
  </div>
</details>

<details class="s2a-doc-accordion">
  <summary>Alternative · BEM / utility classes <span class="s2a-doc-badge">Class-based</span></summary>
  <div class="s2a-doc-body">
    <p>Utility-heavy stacks can alias variant axes to class modifiers while keeping specificity flat.</p>

\`\`\`html
<button class="c-icon-button c-icon-button--solid c-icon-button--on-light c-icon-button--lg" aria-label="Play">
  <span class="c-icon-button__icon" aria-hidden="true">
    <!-- inline SVG from packages/components/src/icons/play.svg -->
  </span>
</button>

<button class="c-icon-button c-icon-button--outlined c-icon-button--on-dark c-icon-button--md" aria-label="Close">
  <span class="c-icon-button__icon" aria-hidden="true">
    <!-- inline SVG from packages/components/src/icons/cross.svg -->
  </span>
</button>
\`\`\`

\`\`\`css
.c-icon-button--solid.c-icon-button--on-light {
  background-color: var(--s2a-color-iconbutton-background-primary-solid-on-light-default);
  color: var(--s2a-color-iconbutton-content-primary-solid-default);
}

.c-icon-button--outlined.c-icon-button--on-dark {
  border: var(--s2a-border-width-sm) solid var(--s2a-color-iconbutton-border-primary-outlined-on-dark);
  color: var(--s2a-color-iconbutton-content-primary-outlined-knockout);
}
\`\`\`
  </div>
</details>

        `},source:{language:"html",code:`<!-- Solid / on-light -->
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
</button>`}}},argTypes:{ariaLabel:{control:"text",description:"Accessible label (required)"},icon:{control:{type:"select"},options:["pause","play","cross","add","chevron-right","chevron-left","chevron-down","chevron-up","arrow-right","arrow-left","link-out","hamburger"],description:"S2A icon name — resolved from packages/components/src/icons/"},context:{control:{type:"select"},options:["on-light","on-dark"],description:"Surface context the icon button lives on"},background:{control:{type:"select"},options:["solid","outlined","transparent"],description:"Background variant"},size:{control:{type:"select"},options:["md","lg"],description:"Size variant (lg = hero controls, md = compact toolbars)"},state:{control:{type:"select"},options:["default","hover","active","focus","disabled"],description:"Force a visual state for documentation"}},args:{onClick:x(),ariaLabel:"Pause",icon:"pause",context:"on-light",background:"solid",size:"lg",state:"default"}},r={},s={args:{background:"outlined"}},i={args:{background:"transparent"}},c={args:{state:"disabled"}},d={name:"S2A Icons",render:()=>o`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      ${a({ariaLabel:"Play media",icon:"play",size:"lg",background:"solid"})}
      ${a({ariaLabel:"Pause media",icon:"pause",size:"lg",background:"solid"})}
      ${a({ariaLabel:"Add",icon:"add",size:"lg",background:"outlined"})}
      <div style="background: #0b0b0b; padding: 12px; border-radius: 16px; display: inline-flex; gap: 12px;">
        ${a({ariaLabel:"Close",icon:"cross",size:"md",context:"on-dark",background:"transparent"})}
        ${a({ariaLabel:"Navigate forward",icon:"chevron-right",size:"md",context:"on-dark",background:"outlined"})}
        ${a({ariaLabel:"Link out",icon:"link-out",size:"md",context:"on-dark",background:"solid"})}
      </div>
    </div>
  `},l={render:()=>o`
    <div style="display: flex; gap: 16px; align-items: center;">
      ${a({ariaLabel:"Play (md)",icon:"play",size:"md"})}
      ${a({ariaLabel:"Pause (lg)",icon:"pause",size:"lg"})}
    </div>
  `},u={render:()=>{const n=["solid","outlined","transparent"];return o`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          ${n.map(e=>a({background:e,context:"on-light",ariaLabel:e,icon:"pause",size:"lg"}))}
        </div>
        <div style="background: #0b0b0b; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
          ${n.map(e=>a({background:e,context:"on-dark",ariaLabel:`${e} on dark`,icon:"pause",size:"lg"}))}
        </div>
      </div>
    `}},p={render:()=>{const n=["default","hover","active","focus","disabled"],e=(g,m)=>o`
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        ${n.map(b=>a({icon:k(b),ariaLabel:`${g} icon button ${b}`,state:b,size:m}))}
      </div>
    `;return o`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Large (lg · 40px)</span>
        ${e("Large","lg")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Medium (md · 32px)</span>
        ${e("Medium","md")}
      </div>
    `}},t={render:()=>o`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
      ${a({background:"solid",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
      ${a({background:"outlined",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
      ${a({background:"transparent",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
    </div>
  `};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    background: "outlined"
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    background: "transparent"
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source},description:{story:"Focus ring appears when tabbing to the button.",...t.parameters?.docs?.description}}};const P=["Solid","Outlined","Transparent","Disabled","S2aIcons","Sizes","ContextGrid","ForcedStates","FocusStates"];export{u as ContextGrid,c as Disabled,t as FocusStates,p as ForcedStates,s as Outlined,d as S2aIcons,l as Sizes,r as Solid,i as Transparent,P as __namedExportsOrder,B as default};
