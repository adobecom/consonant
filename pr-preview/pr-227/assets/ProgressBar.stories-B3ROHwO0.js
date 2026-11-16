import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";var r,i;function a(){return(a=e((()=>{n(),r=e=>{let t=Number.parseInt(e,10);return Number.isNaN(t)?0:Math.min(100,Math.max(0,t))},i=({progress:e=0}={})=>{let n=r(e);return t`
    <span class="c-progress-bar">
      <span class="c-progress-bar__fill" style="width: ${n}%;"></span>
    </span>
  `}})))()}function o(){return(o=e((()=>{a()})))()}var s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{n(),o(),s={title:`Atoms/ProgressBar`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`centered`,docs:{description:{component:`
Linear progress indicator atom. Used as the timer fill inside RouterNavItem tiles.

The fill width is set via the \`progress\` prop (0–100). When used inside RouterMarquee,
the fill is animated via a CSS \`transform: translateX\` transition driven by
\`RouterMarqueeController\` — which resets and restarts the transition on each slide advance.
        `},source:{language:`html`,code:`<span class="c-progress-bar">
  <span class="c-progress-bar__fill" style="width: 60%;"></span>
</span>`}}},argTypes:{progress:{control:{type:`range`,min:0,max:100,step:1},description:`Fill percentage (0–100)`}},args:{progress:50}},c=e=>t`
  <div
    style="
      width: 240px;
      padding: 24px;
      background: #111;
      border-radius: 8px;
    "
  >
    ${e}
  </div>
`,l={args:{progress:0},render:e=>c(i(e))},u={args:{progress:25},render:e=>c(i(e))},d={args:{progress:50},render:e=>c(i(e))},f={args:{progress:75},render:e=>c(i(e))},p={args:{progress:100},render:e=>c(i(e))},m={name:`All steps (25 / 50 / 75 / 100)`,render:()=>c(t`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">25%</p>
        ${i({progress:25})}
      </div>
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">50%</p>
        ${i({progress:50})}
      </div>
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">75%</p>
        ${i({progress:75})}
      </div>
      <div>
        <p style="color: #999; font-size: 11px; margin: 0 0 6px; font-family: sans-serif;">100%</p>
        ${i({progress:100})}
      </div>
    </div>
  `)},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    progress: 0
  },
  render: args => darkSurface(ProgressBar(args))
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    progress: 25
  },
  render: args => darkSurface(ProgressBar(args))
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    progress: 50
  },
  render: args => darkSurface(ProgressBar(args))
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    progress: 75
  },
  render: args => darkSurface(ProgressBar(args))
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    progress: 100
  },
  render: args => darkSurface(ProgressBar(args))
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h=[`Empty`,`Quarter`,`Half`,`ThreeQuarters`,`Complete`,`AllSteps`]})))()}g();export{m as AllSteps,p as Complete,l as Empty,d as Half,u as Quarter,f as ThreeQuarters,h as __namedExportsOrder,s as default};