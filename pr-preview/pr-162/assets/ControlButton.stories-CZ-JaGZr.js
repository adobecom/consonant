import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";import{a as r,c as i,i as a,l as o,n as s,o as c,r as l,s as u,t as d}from"./icons-CqFcFoMP.js";function f(){return(f=e((()=>{o()})))()}var p,m,h,g,_,v,y;function b(){return(b=e((()=>{n(),f(),u(),p=e=>t`
  <div
    style="padding:32px;background:url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80') center/cover;border-radius:12px;display:inline-flex;gap:12px;align-items:center;"
  >
    ${e}
  </div>
`,m={title:`Atoms/ControlButton`,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:"\nIcon-only button for controlling an interactive container — media player, carousel, lightbox, or modal.\n\n**When to use:** media playback (play/pause), carousel navigation (left/right), overlay dismissal (close). Any icon-only action that belongs to a surface rather than the page.\n\n**v2 architecture:** a single `media` style — the scrim background (transparent-black + backdrop blur) reads on any surface, so the v1 `context` / `background` props are gone. Page theming flows from variable modes (`:root[data-theme]`), not component props.\n\n**Props:**\n- `icon` — Lit html template for the 16px icon SVG\n- `label` — accessible aria-label (required)\n- `size` — `md` (32px) · `xl` (48px)\n- `disabled` — disables interaction\n- `forceState` — `hover` · `active` · `focus` (docs-only state pinning)\n- `onClick` — click handler\n\n**Figma:** [ControlButton — v2](https://www.figma.com/design/eGSyBcD5XdFXR8rJXJmVNY/S2A---Foundations?node-id=11180-181592)\n        "}}}},h={name:`Media controls`,render:()=>p(t`
      ${i({icon:r(),label:`Pause`,size:`xl`})}
      ${i({icon:c(),label:`Play`,size:`xl`})}
      ${i({icon:d(),label:`Next`,size:`xl`})}
      ${i({icon:s(),label:`Close`,size:`xl`})}
      <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
      ${i({icon:r(),label:`Pause`,size:`md`})}
      ${i({icon:c(),label:`Play`,size:`md`})}
      ${i({icon:d(),label:`Next`,size:`md`})}
      ${i({icon:s(),label:`Close`,size:`md`})}
    `)},g={name:`All states`,render:()=>p(t`
      ${i({icon:r(),label:`Default`,size:`xl`})}
      ${i({icon:r(),label:`Hover`,size:`xl`,forceState:`hover`})}
      ${i({icon:r(),label:`Active`,size:`xl`,forceState:`active`})}
      ${i({icon:r(),label:`Focus`,size:`xl`,forceState:`focus`})}
      ${i({icon:r(),label:`Disabled`,size:`xl`,disabled:!0})}
    `)},_={render:()=>p(t`
      ${i({icon:r(),label:`Pause`,size:`xl`,disabled:!0})}
      ${i({icon:r(),label:`Pause`,size:`md`,disabled:!0})}
    `)},v={name:`Navigation icons (nav-back)`,render:()=>p(t`
      ${i({icon:l(),label:`Back to start`,size:`xl`})}
      ${i({icon:a(),label:`Skip to end`,size:`xl`})}
      <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
      ${i({icon:l(),label:`Back to start`,size:`md`})}
      ${i({icon:a(),label:`Skip to end`,size:`md`})}
    `)},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "Media controls",
  render: () => media(html\`
      \${ControlButton({
    icon: IconPause(),
    label: "Pause",
    size: "xl"
  })}
      \${ControlButton({
    icon: IconPlay(),
    label: "Play",
    size: "xl"
  })}
      \${ControlButton({
    icon: IconArrowRight(),
    label: "Next",
    size: "xl"
  })}
      \${ControlButton({
    icon: IconCross(),
    label: "Close",
    size: "xl"
  })}
      <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
      \${ControlButton({
    icon: IconPause(),
    label: "Pause",
    size: "md"
  })}
      \${ControlButton({
    icon: IconPlay(),
    label: "Play",
    size: "md"
  })}
      \${ControlButton({
    icon: IconArrowRight(),
    label: "Next",
    size: "md"
  })}
      \${ControlButton({
    icon: IconCross(),
    label: "Close",
    size: "md"
  })}
    \`)
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "All states",
  render: () => media(html\`
      \${ControlButton({
    icon: IconPause(),
    label: "Default",
    size: "xl"
  })}
      \${ControlButton({
    icon: IconPause(),
    label: "Hover",
    size: "xl",
    forceState: "hover"
  })}
      \${ControlButton({
    icon: IconPause(),
    label: "Active",
    size: "xl",
    forceState: "active"
  })}
      \${ControlButton({
    icon: IconPause(),
    label: "Focus",
    size: "xl",
    forceState: "focus"
  })}
      \${ControlButton({
    icon: IconPause(),
    label: "Disabled",
    size: "xl",
    disabled: true
  })}
    \`)
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => media(html\`
      \${ControlButton({
    icon: IconPause(),
    label: "Pause",
    size: "xl",
    disabled: true
  })}
      \${ControlButton({
    icon: IconPause(),
    label: "Pause",
    size: "md",
    disabled: true
  })}
    \`)
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: "Navigation icons (nav-back)",
  render: () => media(html\`
      \${ControlButton({
    icon: IconNavBackLeft(),
    label: "Back to start",
    size: "xl"
  })}
      \${ControlButton({
    icon: IconNavBackRight(),
    label: "Skip to end",
    size: "xl"
  })}
      <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
      \${ControlButton({
    icon: IconNavBackLeft(),
    label: "Back to start",
    size: "md"
  })}
      \${ControlButton({
    icon: IconNavBackRight(),
    label: "Skip to end",
    size: "md"
  })}
    \`)
}`,...v.parameters?.docs?.source}}},y=[`Default`,`States`,`Disabled`,`NavigationIcons`]})))()}b();export{h as Default,_ as Disabled,v as NavigationIcons,g as States,y as __namedExportsOrder,m as default};