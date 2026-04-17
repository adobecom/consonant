import{E as t,x as o}from"./iframe-GBr9jHI3.js";import{P as E}from"./product-lockup-YW-iR_i5.js";import{P as F,p as L}from"./progress-bar-DwRjZRaf.js";import{p as T}from"./product-lockup-Bc6IBSkQ.js";import"./preload-helper-DXpz1HzR.js";import"./app-icon-D_SoziBq.js";const V=e=>e==="horizontal"?"horizontal":"vertical",B=e=>e==="eyebrow"?"eyebrow":"label",N=e=>e==="on-dark"?"on-dark":"on-light",O=e=>e==="hug"?"hug":"fill",W=e=>{const r=Number.parseInt(e,10);return Number.isNaN(r)?0:Math.min(100,Math.max(0,r))},j=(e,r)=>e?"a":r?"button":"div",p=({label:e="PDF and productivity",app:r="acrobat-pro",orientation:x="vertical",styleVariant:h="label",context:y="on-light",width:w="fill",showIconStart:k=!0,showIconEnd:$=!0,iconSize:P="auto",active:d=!1,showProgress:q=!0,progress:_="50",body:I,children:u,href:m,ariaLabel:S,onClick:g}={})=>{const b=V(x),z=B(h),f=N(y),C=O(w),M=W(_),A=I??E({label:e,app:r,orientation:b,styleVariant:z,context:f,width:C,showIconStart:k,showIconEnd:$,iconSize:P}),a=j(m,g),R=!!u,v=!!q,D=o`
    ${A}
    ${R?o`<div class="c-router-marquee-item__children">${u}</div>`:t}
  `;return o`
    <${a}
      class="c-router-marquee-item"
      data-active=${d?"true":"false"}
      data-context=${f}
      data-has-progress=${v?"true":"false"}
      data-display=${b}
      href=${m??t}
      aria-label=${S??t}
      @click=${g}
      type=${a==="button"?"button":t}
      role=${a==="div"?"presentation":t}
    >
      <div class="c-router-marquee-item__body">${D}</div>
      ${v?o`<div class="c-router-marquee-item__progress">
            ${F({progress:M,tone:d?"default":"knockout"})}
          </div>`:t}
    </${a}>
  `},H=`.c-router-marquee-item {
  --c-router-item-width: 220px;
  --c-router-item-gap: var(--s2a-spacing-lg, 24px);
  --c-router-item-bg: var(--s2a-color-transparent-white-08, rgba(255, 255, 255, 0.08));
  --c-router-item-border: var(--s2a-color-transparent-white-12, rgba(255, 255, 255, 0.12));
  --c-router-item-color: var(--s2a-color-content-knockout, #ffffff);

  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--c-router-item-gap);
  width: min(var(--c-router-item-width), 100%);
  padding: var(--s2a-spacing-xl, 32px) var(--s2a-spacing-lg, 24px) var(--s2a-spacing-lg, 24px);
  border-radius: var(--s2a-border-radius-2xl, 40px);
  border: var(--s2a-border-width-sm, 1px) solid var(--c-router-item-border);
  background-color: var(--c-router-item-bg);
  color: var(--c-router-item-color);
  text-decoration: none;
  transition: background-color 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.c-router-marquee-item:focus-visible {
  outline: var(--s2a-border-width-sm, 1px) solid var(--s2a-color-focus-ring-default, #1473e6);
  outline-offset: 4px;
}

.c-router-marquee-item[data-active="true"] {
  --c-router-item-bg: var(--s2a-color-background-default, #ffffff);
  --c-router-item-border: var(--s2a-color-border-default, #dadada);
  --c-router-item-color: var(--s2a-color-content-default, #000000);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.16);
}

.c-router-marquee-item[data-active="true"] .c-router-marquee-item__body {
  color: var(--c-router-item-color);
}

.c-router-marquee-item[data-surface="light"] {
  --c-router-item-bg: var(--s2a-color-background-default, #ffffff);
  --c-router-item-border: var(--s2a-color-border-subtle, #dadada);
  --c-router-item-color: var(--s2a-color-content-default, #000000);
}

.c-router-marquee-item__body {
  display: flex;
  flex-direction: column;
  gap: var(--s2a-spacing-sm, 12px);
  color: inherit;
}

.c-router-marquee-item__children {
  display: flex;
  flex-direction: column;
  gap: var(--s2a-spacing-sm, 12px);
}

.c-router-marquee-item__progress {
  margin-top: var(--s2a-spacing-md, 16px);
}

.c-router-marquee-item[data-has-progress="true"] {
  padding-bottom: calc(var(--s2a-spacing-xl, 32px));
}

.c-router-marquee-item[data-display="horizontal"] {
  width: 100%;
}

.c-router-marquee-item[data-display="horizontal"] .c-router-marquee-item__body {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
`,G=["acrobat-pro","acrobat-pdf","creative-cloud","experience-cloud","express","firefly","photoshop","illustrator","indesign","stock"],ee={title:"Components/RouterMarqueeItem",tags:["autodocs"],render:e=>o`
      <div style="background: radial-gradient(circle at top, rgba(255,255,255,0.12), rgba(0,0,0,0.9)), #000; padding: 32px; display: inline-flex;">
        ${p(e)}
      </div>
    `,parameters:{docs:{description:{component:`
Hero router navigation tile from matt-atoms. Default state lives on a knockout surface; active state flips to white with a timer/progress bar pinned to the bottom edge.

\`\`\`css
${H}

/* ProductLockup + ProgressBar dependencies */
${T}
${L}
\`\`\`
        `}}},argTypes:{label:{control:"text",description:"Product label text"},app:{control:{type:"select"},options:G,description:"AppIcon slug"},orientation:{control:{type:"select"},options:["vertical","horizontal"],description:"ProductLockup orientation"},styleVariant:{control:{type:"select"},options:["label","eyebrow"],description:"Typography style"},context:{control:{type:"select"},options:["on-light","on-dark"],description:"ProductLockup context"},width:{control:{type:"select"},options:["hug","fill"],description:"ProductLockup width"},showIconStart:{control:"boolean",description:"Toggle leading AppIcon"},showIconEnd:{control:"boolean",description:"Toggle caret"},iconSize:{control:{type:"select"},options:["auto","sm","md","lg","xl"],description:"Icon size override"},active:{control:"boolean",description:"Active/selected state"},showProgress:{control:"boolean",description:"Show the timer/progress bar"},progress:{control:{type:"select"},options:["0","25","50","75","100"],description:"Progress bar step"}},args:{label:"PDF and productivity",app:"acrobat-pro",orientation:"vertical",styleVariant:"label",context:"on-light",width:"fill",showIconStart:!0,showIconEnd:!0,iconSize:"auto",active:!1,showProgress:!0,progress:"50"}},n={},s={args:{active:!0,progress:"100"}},i={render:e=>o`
    <div style="background: #050505; padding: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
      ${["0","25","50","75","100"].map(r=>p({...e,progress:r,label:`Step ${r}%`}))}
    </div>
  `},c={parameters:{layout:"fullscreen"},render:e=>o`
    <div
      style="background: linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,1)), #000; padding: 48px; display: flex; gap: 16px; flex-wrap: wrap;"
    >
      ${[{label:"PDF and productivity",app:"acrobat-pro",progress:"100",active:!0},{label:"Creative Cloud",app:"creative-cloud",progress:"50"},{label:"Firefly",app:"firefly",progress:"25"},{label:"Experience Cloud",app:"experience-cloud",progress:"0"}].map(r=>p({...e,...r}))}
    </div>
  `},l={parameters:{viewport:{defaultViewport:"iphonex"}},render:e=>o`
    <div style="background: #030303; padding: 24px; width: 375px; display: flex; flex-direction: column; gap: 16px;">
      ${[{label:"Creative tools",app:"creative-cloud",active:!0,progress:"80"},{label:"AI for marketing",app:"experience-cloud",progress:"45"}].map(r=>p({...e,...r}))}
    </div>
  `};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:"{}",...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    active: true,
    progress: "100"
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="background: #050505; padding: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
      \${["0", "25", "50", "75", "100"].map(step => RouterMarqueeItem({
    ...args,
    progress: step,
    label: \`Step \${step}%\`
  }))}
    </div>
  \`
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: "fullscreen"
  },
  render: args => html\`
    <div
      style="background: linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,1)), #000; padding: 48px; display: flex; gap: 16px; flex-wrap: wrap;"
    >
      \${[{
    label: "PDF and productivity",
    app: "acrobat-pro",
    progress: "100",
    active: true
  }, {
    label: "Creative Cloud",
    app: "creative-cloud",
    progress: "50"
  }, {
    label: "Firefly",
    app: "firefly",
    progress: "25"
  }, {
    label: "Experience Cloud",
    app: "experience-cloud",
    progress: "0"
  }].map(item => RouterMarqueeItem({
    ...args,
    ...item
  }))}
    </div>
  \`
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      defaultViewport: "iphonex"
    }
  },
  render: args => html\`
    <div style="background: #030303; padding: 24px; width: 375px; display: flex; flex-direction: column; gap: 16px;">
      \${[{
    label: "Creative tools",
    app: "creative-cloud",
    active: true,
    progress: "80"
  }, {
    label: "AI for marketing",
    app: "experience-cloud",
    progress: "45"
  }].map(item => RouterMarqueeItem({
    ...args,
    ...item
  }))}
    </div>
  \`
}`,...l.parameters?.docs?.source}}};const re=["Default","Active","ProgressStates","IntentRow","MobileStack"];export{s as Active,n as Default,c as IntentRow,l as MobileStack,i as ProgressStates,re as __namedExportsOrder,ee as default};
