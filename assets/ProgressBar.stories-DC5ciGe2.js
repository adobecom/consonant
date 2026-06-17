import{x as d}from"./iframe-Ba4Et79i.js";import"./preload-helper-BSds_FOV.js";const l=r=>{const a=Number.parseInt(r,10);return Number.isNaN(a)?0:Math.min(100,Math.max(0,a))},s=({progress:r=0}={})=>{const a=l(r);return d`
    <span class="c-progress-bar">
      <span class="c-progress-bar__fill" style="width: ${a}%;"></span>
    </span>
  `},f={title:"Atoms/ProgressBar",tags:["autodocs"],render:r=>s(r),parameters:{layout:"centered",docs:{description:{component:"\nLinear progress indicator atom. Used as the timer fill inside RouterNavItem tiles.\n\nThe fill width is set via the `progress` prop (0–100). When used inside RouterMarquee,\nthe fill is animated via a CSS `transform: translateX` transition driven by\n`RouterMarqueeController` — which resets and restarts the transition on each slide advance.\n        "},source:{language:"html",code:`<span class="c-progress-bar">
  <span class="c-progress-bar__fill" style="width: 60%;"></span>
</span>`}}},argTypes:{progress:{control:{type:"range",min:0,max:100,step:1},description:"Fill percentage (0–100)"}},args:{progress:50}},e=r=>d`
  <div
    style="
      width: 240px;
      padding: 24px;
      background: #111;
      border-radius: 8px;
    "
  >
    ${r}
  </div>
`,n={args:{progress:0},render:r=>e(s(r))},o={args:{progress:25},render:r=>e(s(r))},t={args:{progress:50},render:r=>e(s(r))},p={args:{progress:75},render:r=>e(s(r))},i={args:{progress:100},render:r=>e(s(r))},c={name:"All steps (25 / 50 / 75 / 100)",render:()=>e(d`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">25%</p>
        ${s({progress:25})}
      </div>
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">50%</p>
        ${s({progress:50})}
      </div>
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">75%</p>
        ${s({progress:75})}
      </div>
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">100%</p>
        ${s({progress:100})}
      </div>
    </div>
  `)};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    progress: 0
  },
  render: args => darkSurface(ProgressBar(args))
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    progress: 25
  },
  render: args => darkSurface(ProgressBar(args))
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    progress: 50
  },
  render: args => darkSurface(ProgressBar(args))
}`,...t.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    progress: 75
  },
  render: args => darkSurface(ProgressBar(args))
}`,...p.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    progress: 100
  },
  render: args => darkSurface(ProgressBar(args))
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: "All steps (25 / 50 / 75 / 100)",
  render: () => darkSurface(html\`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">25%</p>
        \${ProgressBar({
    progress: 25
  })}
      </div>
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">50%</p>
        \${ProgressBar({
    progress: 50
  })}
      </div>
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">75%</p>
        \${ProgressBar({
    progress: 75
  })}
      </div>
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">100%</p>
        \${ProgressBar({
    progress: 100
  })}
      </div>
    </div>
  \`)
}`,...c.parameters?.docs?.source}}};const u=["Empty","Quarter","Half","ThreeQuarters","Complete","AllSteps"];export{c as AllSteps,i as Complete,n as Empty,t as Half,o as Quarter,p as ThreeQuarters,u as __namedExportsOrder,f as default};
