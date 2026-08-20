import{x as d}from"./iframe-BMns1WXj.js";import{S as t}from"./section-header-C2r7n-dL.js";import{c}from"./button-Cebqltt4.js";import"./preload-helper-C1LPWHGs.js";import"./rich-content-CdFiUJUg.js";const n=(e,l)=>d`
  <div style="
    width: 100%;
    box-sizing: border-box;
    padding: 80px 120px;
    background: ${e};
    display: flex;
    flex-direction: column;
    align-items: center;
  ">
    ${l}
  </div>
`,g={title:"Molecules/SectionHeader",tags:["autodocs"],render:e=>n(e.theme==="on-dark"?"#0f0d0c":"#ffffff",t(e)),parameters:{layout:"fullscreen",docs:{description:{component:"\nCentered section-level heading block — eyebrow + heading-2 title + optional body. A thin, named wrapper around RichContent with `justifyContent=center` and `measure=wide` locked in.\n\n**Figma:** [elastic-card-updates node 3774-4410](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=3774-4410)\n        "},source:{language:"html",code:`<div class="c-section-header" data-theme="on-light">
  <div class="c-rich-content" data-theme="on-light" data-density="tight" data-justify="center" data-measure="wide">
    <div class="c-rich-content__text">
      <p class="c-rich-content__eyebrow">Optimized Workflows</p>
      <h2 class="c-rich-content__title">Everything you need to make anything.</h2>
      <p class="c-rich-content__body">Bring any idea to life with industry-leading creative tools.</p>
    </div>
  </div>
</div>`}}},argTypes:{theme:{control:{type:"select"},options:["on-light","on-dark"],description:"Surface context — drives RichContent color tokens"},eyebrow:{control:"text",description:"Optional eyebrow label above the title"},showEyebrow:{control:"boolean"},title:{control:"text"},body:{control:"text",description:"Optional body paragraph below title"},showActions:{control:"boolean"}},args:{theme:"on-light",eyebrow:"Optimized Workflows",showEyebrow:!0,title:"Everything you need to make anything.",body:"Bring any idea to life with industry-leading creative tools, AI-powered features, and a seamless ecosystem built for every creator.",showActions:!1}},o={name:"On Light",render:e=>n("#ffffff",t(e))},r={name:"On Dark",render:e=>n("#0f0d0c",t({...e,theme:"on-dark"})),args:{theme:"on-dark"}},a={name:"With Actions",render:e=>n("#ffffff",t({...e,showActions:!0,actions:d`
          ${c({label:"Get started",style:"solid"})}
          ${c({label:"Learn more",style:"outlined"})}
        `}))},s={name:"On Dark — With Actions",render:e=>n("#0f0d0c",t({...e,theme:"on-dark",showActions:!0,actions:d`
          ${c({label:"Get started",style:"knockout"})}
          ${c({label:"Learn more",style:"outline-inverse"})}
        `})),args:{theme:"on-dark"}},i={name:"Title Only",render:()=>n("#f8f8f8",t({showEyebrow:!1,title:"Everything you need to make anything.",theme:"on-light"}))};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "On Light",
  render: args => section("#ffffff", SectionHeader(args))
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: "On Dark",
  render: args => section("#0f0d0c", SectionHeader({
    ...args,
    theme: "on-dark"
  })),
  args: {
    theme: "on-dark"
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: "With Actions",
  render: args => section("#ffffff", SectionHeader({
    ...args,
    showActions: true,
    actions: html\`
          \${Button({
      label: "Get started",
      style: "solid"
    })}
          \${Button({
      label: "Learn more",
      style: "outlined"
    })}
        \`
  }))
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "On Dark — With Actions",
  render: args => section("#0f0d0c", SectionHeader({
    ...args,
    theme: "on-dark",
    showActions: true,
    actions: html\`
          \${Button({
      label: "Get started",
      style: "knockout"
    })}
          \${Button({
      label: "Learn more",
      style: "outline-inverse"
    })}
        \`
  })),
  args: {
    theme: "on-dark"
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "Title Only",
  render: () => section("#f8f8f8", SectionHeader({
    showEyebrow: false,
    title: "Everything you need to make anything.",
    theme: "on-light"
  }))
}`,...i.parameters?.docs?.source}}};const y=["OnLight","OnDark","WithActions","OnDarkWithActions","TitleOnly"];export{r as OnDark,s as OnDarkWithActions,o as OnLight,i as TitleOnly,a as WithActions,y as __namedExportsOrder,g as default};
