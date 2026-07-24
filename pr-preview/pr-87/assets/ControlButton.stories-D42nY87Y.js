import{x as o}from"./iframe-BJqC41-z.js";import{C as n,I as x,a as p,b as a,c as e,d as t,e as r}from"./icons-Bek0-_nT.js";import"./preload-helper-Bwrcx2VV.js";const k=l=>o`
  <div style="padding:32px;background:#1a1a1a;border-radius:12px;display:inline-flex;gap:12px;align-items:center;">
    ${l}
  </div>
`,m=l=>o`
  <div style="padding:32px;background:#f5f5f5;border-radius:12px;display:inline-flex;gap:12px;align-items:center;">
    ${l}
  </div>
`,g=l=>o`
  <div style="padding:32px;background:url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80') center/cover;border-radius:12px;display:inline-flex;gap:12px;align-items:center;">
    ${l}
  </div>
`,C={title:"Atoms/ControlButton",tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"\nIcon-only button for controlling an interactive container — media player, carousel, lightbox, or modal.\n\n**When to use:** media playback (play/pause), carousel navigation (left/right), overlay dismissal (close). Any icon-only action that belongs to a surface rather than the page.\n\n**Props:**\n- `icon` — Lit html template for the 16px icon SVG\n- `label` — accessible aria-label (required)\n- `size` — `md` (32px) · `xl` (48px)\n- `context` — `on-media` · `on-dark` · `on-light`\n- `background` — `transparent` · `solid`\n- `disabled` — disables interaction\n- `onClick` — click handler\n\n**Context + background combinations:**\n| context | background | Surface |\n|---|---|---|\n| on-media | transparent | Over image or video |\n| on-dark | transparent | Glass on dark surface |\n| on-dark | solid | Solid dark surface |\n| on-light | solid | Solid light surface |\n\n**Figma:** [ControlButton](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=8675-1082244)\n        "}}}},i={name:"on-media / transparent",render:()=>g(o`
    ${n({icon:a(),label:"Pause",size:"xl",context:"on-media",background:"transparent"})}
    ${n({icon:e(),label:"Play",size:"xl",context:"on-media",background:"transparent"})}
    ${n({icon:t(),label:"Next",size:"xl",context:"on-media",background:"transparent"})}
    ${n({icon:r(),label:"Close",size:"xl",context:"on-media",background:"transparent"})}
    <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
    ${n({icon:a(),label:"Pause",size:"md",context:"on-media",background:"transparent"})}
    ${n({icon:e(),label:"Play",size:"md",context:"on-media",background:"transparent"})}
    ${n({icon:t(),label:"Next",size:"md",context:"on-media",background:"transparent"})}
    ${n({icon:r(),label:"Close",size:"md",context:"on-media",background:"transparent"})}
  `)},s={name:"on-media / transparent — disabled",render:()=>g(o`
    ${n({icon:a(),label:"Pause",size:"xl",context:"on-media",background:"transparent",disabled:!0})}
    ${n({icon:a(),label:"Pause",size:"md",context:"on-media",background:"transparent",disabled:!0})}
  `)},c={name:"on-dark / transparent",render:()=>k(o`
    ${n({icon:a(),label:"Pause",size:"xl",context:"on-dark",background:"transparent"})}
    ${n({icon:e(),label:"Play",size:"xl",context:"on-dark",background:"transparent"})}
    ${n({icon:t(),label:"Next",size:"xl",context:"on-dark",background:"transparent"})}
    <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
    ${n({icon:a(),label:"Pause",size:"md",context:"on-dark",background:"transparent"})}
    ${n({icon:e(),label:"Play",size:"md",context:"on-dark",background:"transparent"})}
    ${n({icon:t(),label:"Next",size:"md",context:"on-dark",background:"transparent"})}
  `)},d={name:"on-dark / solid",render:()=>k(o`
    ${n({icon:a(),label:"Pause",size:"xl",context:"on-dark",background:"solid"})}
    ${n({icon:e(),label:"Play",size:"xl",context:"on-dark",background:"solid"})}
    ${n({icon:t(),label:"Next",size:"xl",context:"on-dark",background:"solid"})}
    ${n({icon:r(),label:"Close",size:"xl",context:"on-dark",background:"solid"})}
    <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
    ${n({icon:a(),label:"Pause",size:"md",context:"on-dark",background:"solid"})}
    ${n({icon:e(),label:"Play",size:"md",context:"on-dark",background:"solid"})}
    ${n({icon:t(),label:"Next",size:"md",context:"on-dark",background:"solid"})}
    ${n({icon:r(),label:"Close",size:"md",context:"on-dark",background:"solid"})}
  `)},u={name:"Navigation icons (nav-back)",render:()=>o`
    <div style="display:flex;gap:16px;padding:32px;">
      ${g(o`
        ${n({icon:x(),label:"Back to start",size:"xl",context:"on-media",background:"transparent"})}
        ${n({icon:p(),label:"Skip to end",size:"xl",context:"on-media",background:"transparent"})}
        <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
        ${n({icon:x(),label:"Back to start",size:"md",context:"on-media",background:"transparent"})}
        ${n({icon:p(),label:"Skip to end",size:"md",context:"on-media",background:"transparent"})}
      `)}
    </div>
  `},b={name:"on-light / solid",render:()=>m(o`
    ${n({icon:a(),label:"Pause",size:"xl",context:"on-light",background:"solid"})}
    ${n({icon:e(),label:"Play",size:"xl",context:"on-light",background:"solid"})}
    ${n({icon:t(),label:"Next",size:"xl",context:"on-light",background:"solid"})}
    ${n({icon:r(),label:"Close",size:"xl",context:"on-light",background:"solid"})}
    <span style="width:1px;height:32px;background:rgba(0,0,0,0.12)"></span>
    ${n({icon:a(),label:"Pause",size:"md",context:"on-light",background:"solid"})}
    ${n({icon:e(),label:"Play",size:"md",context:"on-light",background:"solid"})}
    ${n({icon:t(),label:"Next",size:"md",context:"on-light",background:"solid"})}
    ${n({icon:r(),label:"Close",size:"md",context:"on-light",background:"solid"})}
  `)};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'on-media / transparent',
  render: () => media(html\`
    \${ControlButton({
    icon: IconPause(),
    label: 'Pause',
    size: 'xl',
    context: 'on-media',
    background: 'transparent'
  })}
    \${ControlButton({
    icon: IconPlay(),
    label: 'Play',
    size: 'xl',
    context: 'on-media',
    background: 'transparent'
  })}
    \${ControlButton({
    icon: IconArrowRight(),
    label: 'Next',
    size: 'xl',
    context: 'on-media',
    background: 'transparent'
  })}
    \${ControlButton({
    icon: IconCross(),
    label: 'Close',
    size: 'xl',
    context: 'on-media',
    background: 'transparent'
  })}
    <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
    \${ControlButton({
    icon: IconPause(),
    label: 'Pause',
    size: 'md',
    context: 'on-media',
    background: 'transparent'
  })}
    \${ControlButton({
    icon: IconPlay(),
    label: 'Play',
    size: 'md',
    context: 'on-media',
    background: 'transparent'
  })}
    \${ControlButton({
    icon: IconArrowRight(),
    label: 'Next',
    size: 'md',
    context: 'on-media',
    background: 'transparent'
  })}
    \${ControlButton({
    icon: IconCross(),
    label: 'Close',
    size: 'md',
    context: 'on-media',
    background: 'transparent'
  })}
  \`)
}`,...i.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'on-media / transparent — disabled',
  render: () => media(html\`
    \${ControlButton({
    icon: IconPause(),
    label: 'Pause',
    size: 'xl',
    context: 'on-media',
    background: 'transparent',
    disabled: true
  })}
    \${ControlButton({
    icon: IconPause(),
    label: 'Pause',
    size: 'md',
    context: 'on-media',
    background: 'transparent',
    disabled: true
  })}
  \`)
}`,...s.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'on-dark / transparent',
  render: () => dark(html\`
    \${ControlButton({
    icon: IconPause(),
    label: 'Pause',
    size: 'xl',
    context: 'on-dark',
    background: 'transparent'
  })}
    \${ControlButton({
    icon: IconPlay(),
    label: 'Play',
    size: 'xl',
    context: 'on-dark',
    background: 'transparent'
  })}
    \${ControlButton({
    icon: IconArrowRight(),
    label: 'Next',
    size: 'xl',
    context: 'on-dark',
    background: 'transparent'
  })}
    <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
    \${ControlButton({
    icon: IconPause(),
    label: 'Pause',
    size: 'md',
    context: 'on-dark',
    background: 'transparent'
  })}
    \${ControlButton({
    icon: IconPlay(),
    label: 'Play',
    size: 'md',
    context: 'on-dark',
    background: 'transparent'
  })}
    \${ControlButton({
    icon: IconArrowRight(),
    label: 'Next',
    size: 'md',
    context: 'on-dark',
    background: 'transparent'
  })}
  \`)
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'on-dark / solid',
  render: () => dark(html\`
    \${ControlButton({
    icon: IconPause(),
    label: 'Pause',
    size: 'xl',
    context: 'on-dark',
    background: 'solid'
  })}
    \${ControlButton({
    icon: IconPlay(),
    label: 'Play',
    size: 'xl',
    context: 'on-dark',
    background: 'solid'
  })}
    \${ControlButton({
    icon: IconArrowRight(),
    label: 'Next',
    size: 'xl',
    context: 'on-dark',
    background: 'solid'
  })}
    \${ControlButton({
    icon: IconCross(),
    label: 'Close',
    size: 'xl',
    context: 'on-dark',
    background: 'solid'
  })}
    <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
    \${ControlButton({
    icon: IconPause(),
    label: 'Pause',
    size: 'md',
    context: 'on-dark',
    background: 'solid'
  })}
    \${ControlButton({
    icon: IconPlay(),
    label: 'Play',
    size: 'md',
    context: 'on-dark',
    background: 'solid'
  })}
    \${ControlButton({
    icon: IconArrowRight(),
    label: 'Next',
    size: 'md',
    context: 'on-dark',
    background: 'solid'
  })}
    \${ControlButton({
    icon: IconCross(),
    label: 'Close',
    size: 'md',
    context: 'on-dark',
    background: 'solid'
  })}
  \`)
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Navigation icons (nav-back)',
  render: () => html\`
    <div style="display:flex;gap:16px;padding:32px;">
      \${media(html\`
        \${ControlButton({
    icon: IconNavBackLeft(),
    label: 'Back to start',
    size: 'xl',
    context: 'on-media',
    background: 'transparent'
  })}
        \${ControlButton({
    icon: IconNavBackRight(),
    label: 'Skip to end',
    size: 'xl',
    context: 'on-media',
    background: 'transparent'
  })}
        <span style="width:1px;height:32px;background:rgba(255,255,255,0.16)"></span>
        \${ControlButton({
    icon: IconNavBackLeft(),
    label: 'Back to start',
    size: 'md',
    context: 'on-media',
    background: 'transparent'
  })}
        \${ControlButton({
    icon: IconNavBackRight(),
    label: 'Skip to end',
    size: 'md',
    context: 'on-media',
    background: 'transparent'
  })}
      \`)}
    </div>
  \`
}`,...u.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'on-light / solid',
  render: () => light(html\`
    \${ControlButton({
    icon: IconPause(),
    label: 'Pause',
    size: 'xl',
    context: 'on-light',
    background: 'solid'
  })}
    \${ControlButton({
    icon: IconPlay(),
    label: 'Play',
    size: 'xl',
    context: 'on-light',
    background: 'solid'
  })}
    \${ControlButton({
    icon: IconArrowRight(),
    label: 'Next',
    size: 'xl',
    context: 'on-light',
    background: 'solid'
  })}
    \${ControlButton({
    icon: IconCross(),
    label: 'Close',
    size: 'xl',
    context: 'on-light',
    background: 'solid'
  })}
    <span style="width:1px;height:32px;background:rgba(0,0,0,0.12)"></span>
    \${ControlButton({
    icon: IconPause(),
    label: 'Pause',
    size: 'md',
    context: 'on-light',
    background: 'solid'
  })}
    \${ControlButton({
    icon: IconPlay(),
    label: 'Play',
    size: 'md',
    context: 'on-light',
    background: 'solid'
  })}
    \${ControlButton({
    icon: IconArrowRight(),
    label: 'Next',
    size: 'md',
    context: 'on-light',
    background: 'solid'
  })}
    \${ControlButton({
    icon: IconCross(),
    label: 'Close',
    size: 'md',
    context: 'on-light',
    background: 'solid'
  })}
  \`)
}`,...b.parameters?.docs?.source}}};const P=["OnMediaTransparent","OnMediaDisabled","OnDarkTransparent","OnDarkSolid","NavigationVariants","OnLightSolid"];export{u as NavigationVariants,d as OnDarkSolid,c as OnDarkTransparent,b as OnLightSolid,s as OnMediaDisabled,i as OnMediaTransparent,P as __namedExportsOrder,C as default};
