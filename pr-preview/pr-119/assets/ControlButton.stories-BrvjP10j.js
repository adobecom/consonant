import{x as o}from"./iframe-Byh1mjJZ.js";import{C as n,I as e,a as r,b as c,c as d,d as u,e as b}from"./icons-CqDcpHDZ.js";import"./preload-helper-CNNBv0Bh.js";const i=m=>o`
  <div
    style="padding:32px;background:url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80') center/cover;border-radius:12px;display:inline-flex;gap:12px;align-items:center;"
  >
    ${m}
  </div>
`,h={title:"Atoms/ControlButton",tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\nIcon-only button for controlling an interactive container — media player, carousel, lightbox, or modal.\n\n**When to use:** media playback (play/pause), carousel navigation (left/right), overlay dismissal (close). Any icon-only action that belongs to a surface rather than the page.\n\n**v2 architecture:** a single `media` style — the scrim background (transparent-black + backdrop blur) reads on any surface, so the v1 `context` / `background` props are gone. Page theming flows from variable modes (`:root[data-theme]`), not component props.\n\n**Props:**\n- `icon` — Lit html template for the 16px icon SVG\n- `label` — accessible aria-label (required)\n- `size` — `md` (32px) · `xl` (48px)\n- `disabled` — disables interaction\n- `forceState` — `hover` · `active` · `focus` (docs-only state pinning)\n- `onClick` — click handler\n\n**Figma:** [ControlButton — v2](https://www.figma.com/design/eGSyBcD5XdFXR8rJXJmVNY/S2A---Foundations?node-id=11180-181592)\n        "}}}},a={name:"Media controls",render:()=>i(o`
      ${n({icon:e(),label:"Pause",size:"xl"})}
      ${n({icon:r(),label:"Play",size:"xl"})}
      ${n({icon:c(),label:"Next",size:"xl"})}
      ${n({icon:d(),label:"Close",size:"xl"})}
      <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
      ${n({icon:e(),label:"Pause",size:"md"})}
      ${n({icon:r(),label:"Play",size:"md"})}
      ${n({icon:c(),label:"Next",size:"md"})}
      ${n({icon:d(),label:"Close",size:"md"})}
    `)},t={name:"All states",render:()=>i(o`
      ${n({icon:e(),label:"Default",size:"xl"})}
      ${n({icon:e(),label:"Hover",size:"xl",forceState:"hover"})}
      ${n({icon:e(),label:"Active",size:"xl",forceState:"active"})}
      ${n({icon:e(),label:"Focus",size:"xl",forceState:"focus"})}
      ${n({icon:e(),label:"Disabled",size:"xl",disabled:!0})}
    `)},l={render:()=>i(o`
      ${n({icon:e(),label:"Pause",size:"xl",disabled:!0})}
      ${n({icon:e(),label:"Pause",size:"md",disabled:!0})}
    `)},s={name:"Navigation icons (nav-back)",render:()=>i(o`
      ${n({icon:u(),label:"Back to start",size:"xl"})}
      ${n({icon:b(),label:"Skip to end",size:"xl"})}
      <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
      ${n({icon:u(),label:"Back to start",size:"md"})}
      ${n({icon:b(),label:"Skip to end",size:"md"})}
    `)};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};const z=["Default","States","Disabled","NavigationIcons"];export{a as Default,l as Disabled,s as NavigationIcons,t as States,z as __namedExportsOrder,h as default};
