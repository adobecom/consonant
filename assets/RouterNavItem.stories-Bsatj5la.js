import{x as p}from"./iframe-Beb_h0aT.js";import{R as t}from"./router-nav-item-Dax6jhbZ.js";import"./preload-helper-BSds_FOV.js";import"./product-lockup-BVZUVfzD.js";import"./unsafe-html-BnGQGuqv.js";import"./app-icon-BIGUd02x.js";import"./chevron-right-CnbUzkxe.js";const f={title:"Molecules/RouterNavItem",tags:["autodocs"],render:s=>t(s),parameters:{layout:"centered",docs:{description:{component:`
Navigation tile atom used in the RouterMarquee controls bar. Each tile represents one slide —
clicking it jumps to that slide and the progress bar at the bottom fills over 5 seconds to
indicate autoplay timing.

**Data attributes:**
- \`data-orientation="block"\` — 220×68px vertical layout, 24px icon (desktop default)
- \`data-orientation="inline"\` — 192×48px horizontal layout, 18px icon (compact)
- \`data-state="default"\` — dark glass background, progress bar hidden
- \`data-state="active"\` — white background, progress bar visible and animating
        `},source:{language:"html",code:`<!-- Block orientation (desktop default) -->
<button class="c-router-nav-item" data-orientation="block" data-state="default" type="button" aria-pressed="false">
  <div class="c-product-lockup" data-orientation="vertical" data-context="on-dark" data-width="fill">…</div>
  <span class="c-router-nav-item__progress" aria-hidden="true">
    <span class="c-router-nav-item__progress-fill"></span>
  </span>
</button>

<!-- Active state — white surface, progress animating -->
<button class="c-router-nav-item" data-orientation="block" data-state="active" type="button" aria-pressed="true">
  …
</button>

<!-- Inline orientation (compact) -->
<button class="c-router-nav-item" data-orientation="inline" data-state="default" type="button" aria-pressed="false">
  …
</button>`}}},argTypes:{label:{control:"text",description:"Product name label"},app:{control:{type:"select"},options:["photoshop","illustrator","premiere-pro","after-effects","acrobat","experience-cloud","lightroom","indesign"],description:"Adobe app identifier for the icon"},orientation:{control:{type:"select"},options:["block","inline"]},state:{control:{type:"select"},options:["default","active"]}},args:{label:"Photoshop",app:"photoshop",orientation:"block",state:"default"},decorators:[s=>p`
      <div style="background: #1a1a2e; padding: 32px; border-radius: 12px;">
        ${s()}
      </div>
    `]},e={name:"Block / Default",args:{orientation:"block",state:"default",label:"Photoshop",app:"photoshop"}},a={name:"Block / Active",args:{orientation:"block",state:"active",label:"Photoshop",app:"photoshop"}},o={name:"Inline / Default",args:{orientation:"inline",state:"default",label:"Photoshop",app:"photoshop"}},n={name:"Inline / Active",args:{orientation:"inline",state:"active",label:"Photoshop",app:"photoshop"}},r={name:"All variants",render:()=>p`
    <div style="background: #1a1a2e; padding: 32px; border-radius: 12px; display: flex; flex-direction: column; gap: 32px;">
      <div>
        <p style="color: #666; font-size: 11px; margin: 0 0 12px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.08em;">Block</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          ${t({label:"Photoshop",app:"photoshop",orientation:"block",state:"default"})}
          ${t({label:"Photoshop",app:"photoshop",orientation:"block",state:"active"})}
        </div>
      </div>
      <div>
        <p style="color: #666; font-size: 11px; margin: 0 0 12px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.08em;">Inline</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          ${t({label:"Photoshop",app:"photoshop",orientation:"inline",state:"default"})}
          ${t({label:"Photoshop",app:"photoshop",orientation:"inline",state:"active"})}
        </div>
      </div>
    </div>
  `},i={name:"Multiple products (row)",render:()=>p`
    <div style="background: #1a1a2e; padding: 32px; border-radius: 12px;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        ${t({label:"Photoshop",app:"photoshop",orientation:"block",state:"active"})}
        ${t({label:"Illustrator",app:"illustrator",orientation:"block",state:"default"})}
        ${t({label:"Premiere Pro",app:"premiere-pro",orientation:"block",state:"default"})}
        ${t({label:"Acrobat",app:"acrobat",orientation:"block",state:"default"})}
      </div>
    </div>
  `};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  name: "Block / Default",
  args: {
    orientation: "block",
    state: "default",
    label: "Photoshop",
    app: "photoshop"
  }
}`,...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: "Block / Active",
  args: {
    orientation: "block",
    state: "active",
    label: "Photoshop",
    app: "photoshop"
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Inline / Default",
  args: {
    orientation: "inline",
    state: "default",
    label: "Photoshop",
    app: "photoshop"
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "Inline / Active",
  args: {
    orientation: "inline",
    state: "active",
    label: "Photoshop",
    app: "photoshop"
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: "All variants",
  render: () => html\`
    <div style="background: #1a1a2e; padding: 32px; border-radius: 12px; display: flex; flex-direction: column; gap: 32px;">
      <div>
        <p style="color: #666; font-size: 11px; margin: 0 0 12px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.08em;">Block</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          \${RouterNavItem({
    label: "Photoshop",
    app: "photoshop",
    orientation: "block",
    state: "default"
  })}
          \${RouterNavItem({
    label: "Photoshop",
    app: "photoshop",
    orientation: "block",
    state: "active"
  })}
        </div>
      </div>
      <div>
        <p style="color: #666; font-size: 11px; margin: 0 0 12px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.08em;">Inline</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          \${RouterNavItem({
    label: "Photoshop",
    app: "photoshop",
    orientation: "inline",
    state: "default"
  })}
          \${RouterNavItem({
    label: "Photoshop",
    app: "photoshop",
    orientation: "inline",
    state: "active"
  })}
        </div>
      </div>
    </div>
  \`
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "Multiple products (row)",
  render: () => html\`
    <div style="background: #1a1a2e; padding: 32px; border-radius: 12px;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        \${RouterNavItem({
    label: "Photoshop",
    app: "photoshop",
    orientation: "block",
    state: "active"
  })}
        \${RouterNavItem({
    label: "Illustrator",
    app: "illustrator",
    orientation: "block",
    state: "default"
  })}
        \${RouterNavItem({
    label: "Premiere Pro",
    app: "premiere-pro",
    orientation: "block",
    state: "default"
  })}
        \${RouterNavItem({
    label: "Acrobat",
    app: "acrobat",
    orientation: "block",
    state: "default"
  })}
      </div>
    </div>
  \`
}`,...i.parameters?.docs?.source}}};const v=["BlockDefault","BlockActive","InlineDefault","InlineActive","AllVariants","MultipleProducts"];export{r as AllVariants,a as BlockActive,e as BlockDefault,n as InlineActive,o as InlineDefault,i as MultipleProducts,v as __namedExportsOrder,f as default};
