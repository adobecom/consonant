import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";import{t as r}from"./icon-button-zPVaV7eM.js";import{t as i}from"./IconButton-CEs3IdYd.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{n(),i(),{fn:a}=__STORYBOOK_MODULE_TEST__,o=e=>e===`active`?`play`:e===`disabled`?`cross`:`pause`,s=(e={})=>r(e),c=e=>t`
  <div
    style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%); padding: 16px; border-radius: 16px; display: inline-flex; gap: 12px; align-items: center;"
  >
    ${e}
  </div>
`,l={title:`Atoms/IconButton`,tags:[`autodocs`],render:e=>s(e),parameters:{docs:{description:{component:`<p>Icon-only action button — v2 architecture. Matches Figma <code>IconButton — v2</code> component set <code>11174:146275</code>. Pass any S2A icon name as the <code>icon</code> prop — icons are sourced from <code>packages/components/src/icons/</code> and rendered as inline SVG with <code>currentColor</code> so they inherit the button's tone automatically.</p>
<p>There is no context prop: light/dark theming flows from the S2A variable modes (use the toolbar Theme toggle). <code>knockout</code> is the always-light circle for dark/media surfaces — it doesn't flip with the page theme.</p>`},source:{language:`html`,code:`<!-- Solid -->
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
</button>`}}},argTypes:{ariaLabel:{control:`text`,description:`Accessible label (required)`},icon:{control:{type:`select`},options:[`pause`,`play`,`cross`,`add`,`chevron-right`,`chevron-left`,`chevron-down`,`chevron-up`,`arrow-right`,`arrow-left`,`link-out`,`hamburger`],description:`S2A icon name — resolved from packages/components/src/icons/`},style:{control:{type:`select`},options:[`solid`,`transparent`,`knockout`],description:`Style variant (Figma Style axis). knockout is for always-dark media surfaces.`},size:{control:{type:`select`},options:[`sm`,`md`,`lg`],description:`Size variant (sm = 24px/12px icon, md = 32px/16px, lg = 40px/16px)`},state:{control:{type:`select`},options:[`default`,`hover`,`active`,`focus`,`disabled`],description:`Force a visual state for documentation`}},args:{onClick:a(),ariaLabel:`Pause`,icon:`pause`,style:`solid`,size:`lg`,state:`default`}},u={},d={args:{style:`transparent`}},f={name:`Knockout (media surface)`,render:()=>c(t`
      ${s({style:`knockout`,ariaLabel:`Play`,icon:`play`,size:`lg`})}
      ${s({style:`knockout`,ariaLabel:`Pause`,icon:`pause`,size:`md`})}
      ${s({style:`knockout`,ariaLabel:`Close`,icon:`cross`,size:`sm`})}
    `)},p={args:{state:`disabled`}},m={name:`S2A Icons`,render:()=>t`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      ${s({ariaLabel:`Play media`,icon:`play`,size:`lg`,style:`solid`})}
      ${s({ariaLabel:`Pause media`,icon:`pause`,size:`lg`,style:`solid`})}
      ${s({ariaLabel:`Add`,icon:`add`,size:`lg`,style:`transparent`})}
      ${c(t`
        ${s({ariaLabel:`Close`,icon:`cross`,size:`sm`,style:`knockout`})}
        ${s({ariaLabel:`Navigate forward`,icon:`chevron-right`,size:`md`,style:`knockout`})}
        ${s({ariaLabel:`Link out`,icon:`link-out`,size:`md`,style:`knockout`})}
      `)}
    </div>
  `},h={render:()=>t`
    <div style="display: flex; gap: 16px; align-items: center;">
      ${s({ariaLabel:`Play (sm)`,icon:`play`,size:`sm`})}
      ${s({ariaLabel:`Play (md)`,icon:`play`,size:`md`})}
      ${s({ariaLabel:`Pause (lg)`,icon:`pause`,size:`lg`})}
    </div>
  `},g={name:`All styles × states`,render:()=>{let e=[`default`,`hover`,`active`,`focus`,`disabled`];return t`
      <div style="display: flex; flex-direction: column; gap: 20px;">
        ${[`solid`,`transparent`].map(n=>t`
            <div style="display: grid; gap: 8px;">
              <strong
                style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);text-transform:capitalize;color:var(--s2a-color-content-default);"
                >${n}</strong
              >
              <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
                ${e.map(e=>s({icon:o(e),ariaLabel:`${n} ${e}`,style:n,state:e,size:`lg`}))}
              </div>
            </div>
          `)}
        <div style="display: grid; gap: 8px;">
          <strong
            style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);color:var(--s2a-color-content-default);"
            >Knockout (media surface)</strong
          >
          ${c(t`
            ${e.map(e=>s({icon:o(e),ariaLabel:`knockout ${e}`,style:`knockout`,state:e,size:`lg`}))}
          `)}
        </div>
      </div>
    `}},_={render:()=>{let e=[`default`,`hover`,`active`,`focus`,`disabled`],n=(n,r)=>t`
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        ${e.map(e=>s({icon:o(e),ariaLabel:`${n} icon button ${e}`,state:e,size:r}))}
      </div>
    `;return t`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: var(--s2a-color-content-body-subtle);">Large (lg · 40px)</span>
        ${n(`Large`,`lg`)}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: var(--s2a-color-content-body-subtle);">Medium (md · 32px)</span>
        ${n(`Medium`,`md`)}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: var(--s2a-color-content-body-subtle);">Small (sm · 24px)</span>
        ${n(`Small`,`sm`)}
      </div>
    `}},v={render:()=>t`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
      ${s({style:`solid`,ariaLabel:`Pause (tab to focus)`,state:`focus`,icon:`pause`,size:`lg`})}
      ${s({style:`transparent`,ariaLabel:`Pause (tab to focus)`,state:`focus`,icon:`pause`,size:`lg`})}
    </div>
  `},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    style: "transparent"
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    state: "disabled"
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Focus ring appears when tabbing to the button.`,...v.parameters?.docs?.description}}},y=[`Solid`,`Transparent`,`Knockout`,`Disabled`,`S2aIcons`,`Sizes`,`AllStylesMatrix`,`ForcedStates`,`FocusStates`]})))()}b();export{g as AllStylesMatrix,p as Disabled,v as FocusStates,_ as ForcedStates,f as Knockout,m as S2aIcons,h as Sizes,u as Solid,d as Transparent,y as __namedExportsOrder,l as default};